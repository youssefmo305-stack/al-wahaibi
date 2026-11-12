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

/* ===== Room-by-room finishing estimator =====
   EDIT THE PRICES HERE (price per ONE room, in EGP).
   Change a number and the website updates automatically.
   The prices below are PLACEHOLDERS - replace them with your real prices.
   Photos: one per finishing level. If a level has no photo, the first one is used. */
const PRICING = {
  currency: 'EGP',
  whatsapp: '201111611148',
  tiers: { economic: 'Economic', standard: 'Standard', luxury: 'Modern Luxury' },
  rooms: [
    { id: 'bathroom', label: 'Bathrooms', one: 'bathroom', max: 8,
      prices: { economic: 45000, standard: 70000, luxury: 110000 },
      images: { economic: 'economic-bathroom.jpg', standard: 'standard-bathroom.jpg', luxury: 'luxury-bathroom.jpg' } },
    { id: 'kitchen', label: 'Kitchens', one: 'kitchen', max: 4,
      prices: { economic: 60000, standard: 95000, luxury: 150000 },
      images: { luxury: 'luxury-kitchen.jpg' } },
    { id: 'bedroom', label: 'Bedrooms', one: 'bedroom', max: 10,
      prices: { economic: 40000, standard: 60000, luxury: 95000 },
      images: { economic: 'economic-room.jpg', standard: 'standard-room.jpg', luxury: 'luxury-bedroom.jpg' } },
    { id: 'living', label: 'Living rooms', one: 'living room', max: 4,
      prices: { economic: 80000, standard: 120000, luxury: 190000 },
      images: { standard: 'standard-living.jpg' } }
  ]
};

(function () {
  const root = document.getElementById('estimator');
  if (!root) return;
  const fmt = n => Math.round(n).toLocaleString('en-US');
  const cur = PRICING.currency;
  const state = {};
  PRICING.rooms.forEach(r => { state[r.id] = { count: 0, tier: 'standard' }; });

  const photo = (r, tier) => r.images[tier] || Object.values(r.images)[0] || '';

  root.innerHTML = `
    <div class="room-grid">
      ${PRICING.rooms.map(r => `
        <article class="room" data-room="${r.id}">
          <div class="room-photo" role="img" aria-label="${r.label} finishing example"></div>
          <div class="room-body">
            <div class="room-top">
              <h3>${r.label}</h3>
              <div class="stepper">
                <button type="button" data-act="dec" aria-label="Remove one ${r.one}">&minus;</button>
                <output aria-live="polite">0</output>
                <button type="button" data-act="inc" aria-label="Add one ${r.one}">+</button>
              </div>
            </div>
            <div class="seg" role="radiogroup" aria-label="Finishing level for ${r.label}">
              ${Object.keys(PRICING.tiers).map(t => `
                <button type="button" role="radio" data-tier="${t}">
                  <span>${PRICING.tiers[t]}</span><small>${fmt(r.prices[t])} ${cur}</small>
                </button>`).join('')}
            </div>
            <p class="room-sub"></p>
          </div>
        </article>`).join('')}
    </div>
    <div id="est-result" class="est-result" aria-live="polite"></div>`;

  const result = root.querySelector('#est-result');

  function update() {
    let total = 0;
    const lines = [];
    PRICING.rooms.forEach(r => {
      const st = state[r.id];
      const el = root.querySelector(`[data-room="${r.id}"]`);
      const unit = r.prices[st.tier];
      const sub = unit * st.count;
      total += sub;
      el.querySelector('output').textContent = st.count;
      el.classList.toggle('active', st.count > 0);
      el.querySelector('[data-act="dec"]').disabled = st.count === 0;
      el.querySelector('[data-act="inc"]').disabled = st.count >= r.max;
      el.querySelectorAll('.seg button').forEach(b => {
        const on = b.dataset.tier === st.tier;
        b.classList.toggle('on', on);
        b.setAttribute('aria-checked', String(on));
      });
      const img = photo(r, st.tier);
      el.querySelector('.room-photo').style.backgroundImage = img ? `url('${img}')` : '';
      el.querySelector('.room-sub').textContent = st.count
        ? `${st.count} × ${fmt(unit)} = ${fmt(sub)} ${cur}`
        : 'Not included yet';
      if (st.count) lines.push({ r, st, unit, sub });
    });

    if (!lines.length) {
      result.innerHTML = '<p class="est-hint">Add at least one room to see your estimate.</p>';
      return;
    }
    const msg = encodeURIComponent(
      'Hello AL-WAHAIBI, I designed my finishing package on your website:\n' +
      lines.map(l => `- ${l.st.count} ${l.r.label} (${PRICING.tiers[l.st.tier]}): ${fmt(l.sub)} ${cur}`).join('\n') +
      `\nEstimated total: ${fmt(total)} ${cur}\nI'd like an exact quote.`
    );
    result.innerHTML = `
      <div class="est-out">
        <ul class="est-lines">
          ${lines.map(l => `<li><span>${l.st.count} × ${l.r.label} <em>${PRICING.tiers[l.st.tier]}</em></span><b>${fmt(l.sub)} ${cur}</b></li>`).join('')}
        </ul>
        <div class="est-total">
          <small>Estimated total</small>
          <div class="est-price">${fmt(total)}<em>${cur}</em></div>
        </div>
        <p class="est-note">This is an approximate estimate. The final price depends on the site visit, materials and design details.</p>
        <a class="btn primary" href="https://wa.me/${PRICING.whatsapp}?text=${msg}" target="_blank" rel="noopener">Get an Exact Quote on WhatsApp</a>
      </div>`;
  }

  root.addEventListener('click', e => {
    const btn = e.target.closest('button');
    if (!btn) return;
    const roomEl = btn.closest('[data-room]');
    if (!roomEl) return;
    const r = PRICING.rooms.find(x => x.id === roomEl.dataset.room);
    const st = state[r.id];
    if (btn.dataset.act === 'inc') st.count = Math.min(r.max, st.count + 1);
    else if (btn.dataset.act === 'dec') st.count = Math.max(0, st.count - 1);
    else if (btn.dataset.tier) st.tier = btn.dataset.tier;
    update();
  });

  update();
})();
