/* ===== Mobile menu ===== */
(function () {
  const navEl = document.querySelector('.nav');
  const toggle = document.querySelector('.nav-toggle');
  if (!navEl || !toggle) return;
  const setOpen = o => {
    navEl.classList.toggle('open', o);
    toggle.setAttribute('aria-expanded', String(o));
  };
  toggle.addEventListener('click', () => setOpen(!navEl.classList.contains('open')));
  document.querySelectorAll('.nav nav a').forEach(a => a.addEventListener('click', () => setOpen(false)));
  window.addEventListener('keydown', e => { if (e.key === 'Escape') setOpen(false); });
  window.matchMedia('(min-width:851px)').addEventListener('change', e => { if (e.matches) setOpen(false); });
})();

/* ===== Finishing cost estimator =====
   EDIT THE PRICES HERE (price per square meter, in EGP).
   Change a number here and the website updates automatically. */
const PRICING = {
  currency: 'EGP',
  whatsapp: '201111611148',
  tiers: {
    economic: { label: 'Economic',      perM2: 6500 },
    standard: { label: 'Standard',      perM2: 8000 },
    luxury:   { label: 'Modern Luxury', perM2: 10000 }
  }
};

(function () {
  const form = document.getElementById('estimator');
  if (!form) return;
  const areaInput = document.getElementById('area');
  const result = document.getElementById('est-result');
  const fmt = n => Math.round(n).toLocaleString('en-US');

  function render() {
    const area = parseFloat(areaInput.value);
    const checked = form.querySelector('input[name="tier"]:checked');

    if (areaInput.value !== '' && (!isFinite(area) || area <= 0)) {
      result.innerHTML = '<p class="est-error">Please enter a valid apartment area in m².</p>';
      return;
    }
    if (!checked || !area) {
      result.innerHTML = '<p class="est-hint">Enter the area and pick a level to see the price.</p>';
      return;
    }

    const tier = PRICING.tiers[checked.value];
    const total = area * tier.perM2;
    const msg = encodeURIComponent(
      `Hello AL-WAHAIBI, I'd like an exact quote for finishing.\nArea: ${area} m²\nLevel: ${tier.label}\nEstimate: ${fmt(total)} ${PRICING.currency}`
    );

    result.innerHTML = `
      <div class="est-out">
        <div>
          <small>${tier.label} · price per m²</small>
          <div class="est-price">${fmt(tier.perM2)}<em>${PRICING.currency} / m²</em></div>
        </div>
        <div class="est-total">
          <small>Estimated total for ${area} m²</small>
          <div class="est-price">${fmt(total)}<em>${PRICING.currency}</em></div>
        </div>
        <p class="est-note">This is an approximate estimate. The final price depends on the site visit, materials and design details.</p>
        <a class="btn primary" href="https://wa.me/${PRICING.whatsapp}?text=${msg}" target="_blank" rel="noopener">Get an Exact Quote on WhatsApp</a>
      </div>`;
  }

  form.addEventListener('submit', e => e.preventDefault());
  areaInput.addEventListener('input', render);
  form.querySelectorAll('input[name="tier"]').forEach(r => r.addEventListener('change', render));
})();
