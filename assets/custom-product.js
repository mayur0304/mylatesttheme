(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', init);

  function init() {
    initGallery();
    initVariantPicker();
    initTabs();
  }

  /* ---------------- Gallery ---------------- */
  function initGallery() {
    var wrap = document.querySelector('[data-gallery]');
    if (!wrap) return;
    var mainImg = wrap.querySelector('[data-gallery-main-img]');
    var thumbs = wrap.querySelectorAll('[data-gallery-thumb]');

    thumbs.forEach(function (thumb) {
      thumb.addEventListener('click', function () {
        thumbs.forEach(function (t) { t.classList.remove('is-active'); });
        thumb.classList.add('is-active');
        if (mainImg && thumb.dataset.fullSrc) {
          mainImg.src = thumb.dataset.fullSrc;
        }
      });
    });
  }

  /* ---------------- Variant picker ---------------- */
  function initVariantPicker() {
    var picker = document.querySelector('[data-variant-picker]');
    if (!picker) return;

    var form = document.querySelector('.cp-buy-form');
    var variantInput = form ? form.querySelector('[data-variant-id]') : null;
    var priceEl = document.querySelector('[data-price]');
    var comparePriceEl = document.querySelector('[data-compare-price]');
    var stockEl = document.querySelector('[data-stock-status]');
    var addToCartBtn = document.querySelector('[data-add-to-cart]');

    var variants;
    try {
      variants = JSON.parse(picker.dataset.variants);
    } catch (e) {
      variants = [];
    }

    var optionGroups = picker.querySelectorAll('[data-option-group], .cp-option-group');
    var selected = {};

    // seed `selected` from whichever option value currently has is-selected
    optionGroups.forEach(function (group) {
      var pos = group.dataset.optionPosition || group.getAttribute('data-option-index');
      var activeBtn = group.querySelector('.is-selected');
      if (activeBtn) {
        selected[group.dataset.optionName] = activeBtn.dataset.optionValue;
      }
    });

    picker.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-option-value]');
      if (!btn) return;

      var group = btn.closest('.cp-option-group');
      var optionName = group.dataset.optionName;

      group.querySelectorAll('[data-option-value]').forEach(function (b) {
        b.classList.remove('is-selected');
      });
      btn.classList.add('is-selected');

      var labelEl = group.querySelector('[data-selected-value]');
      if (labelEl) labelEl.textContent = btn.dataset.optionValue;

      selected[optionName] = btn.dataset.optionValue;
      updateSelectedVariant();
    });

    function updateSelectedVariant() {
      var match = variants.find(function (v) {
        var opts = [v.option1, v.option2, v.option3].filter(Boolean);
        var selectedValues = Object.keys(selected).map(function (k) { return selected[k]; });
        return selectedValues.every(function (val) { return opts.indexOf(val) !== -1; });
      });

      if (!match) return;

      if (variantInput) variantInput.value = match.id;

      if (priceEl) priceEl.textContent = formatMoney(match.price);

      if (comparePriceEl) {
        if (match.compare_at_price && match.compare_at_price > match.price) {
          comparePriceEl.textContent = formatMoney(match.compare_at_price);
          comparePriceEl.style.display = '';
        } else {
          comparePriceEl.style.display = 'none';
        }
      }

      if (stockEl) {
        stockEl.innerHTML = match.available
          ? '<span class="cp-stock-dot cp-stock-dot--in"></span><strong>En stock</strong> : expédié sous 24h'
          : '<span class="cp-stock-dot cp-stock-dot--out"></span><strong>Rupture de stock</strong>';
      }

      if (addToCartBtn) {
        addToCartBtn.disabled = !match.available;
        addToCartBtn.textContent = match.available ? 'Ajouter au panier' : 'Indisponible';
      }

      // keep the URL shareable/bookmarkable
      if (window.history && window.history.replaceState) {
        var url = new URL(window.location.href);
        url.searchParams.set('variant', match.id);
        window.history.replaceState({}, '', url);
      }
    }

    function formatMoney(cents) {
      // Basic fallback formatter; replace with Shopify.formatMoney + your money_format if available.
      var amount = (cents / 100).toFixed(2).replace('.', ',');
      return amount + ' €';
    }
  }

  /* ---------------- Tabs ---------------- */
  function initTabs() {
    var tabs = document.querySelector('[data-tabs]');
    if (!tabs) return;

    var btns = tabs.querySelectorAll('[data-tab-btn]');
    var panels = tabs.querySelectorAll('[data-tab-panel]');

    btns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        btns.forEach(function (b) { b.classList.remove('is-active'); });
        panels.forEach(function (p) { p.classList.remove('is-active'); });

        btn.classList.add('is-active');
        var target = document.getElementById(btn.dataset.tabTarget);
        if (target) target.classList.add('is-active');
      });
    });
  }
})();
