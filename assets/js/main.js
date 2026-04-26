/* Reno Riser Construction — Interactive logic */
(function () {
  'use strict';

  const $ = (sel, el = document) => el.querySelector(sel);
  const $$ = (sel, el = document) => Array.from(el.querySelectorAll(sel));

  // ── Constants ─────────────────────────────────────────────────────────────
  // Get a free key at https://web3forms.com — takes 30 seconds, no account needed
  const WEB3FORMS_KEY = '360776cf-4e34-4f90-9bf5-f830ad11b832';
  const MANIFEST_URL = 'images/manifest.json';
  const LOC_LABELS = { H: 'Hamilton', T: 'Hamilton', B: 'Burlington' };

  // ── State ─────────────────────────────────────────────────────────────────
  const state = {
    drawerOpen: false,
    step: 0,
    service: null,
    data: {},
  };

  // ── Analytics helper ──────────────────────────────────────────────────────
  const track = (name, params = {}) => {
    if (typeof gtag === 'function') gtag('event', name, params);
  };

  // ── App ───────────────────────────────────────────────────────────────────
  const App = {
    init() {
      this.header();
      this.footerYear();
      this.navMenu();
      this.drawer();
      this.snowPlans();
      this.contactForm();
      this.locations();
      this.lightbox();
      window.App = this;
    },

    // ── Header scroll effect ─────────────────────────────────────────────

    header() {
      const hdr = $('.site-header');
      if (!hdr) return;
      window.addEventListener('scroll', () => {
        const scrolled = window.scrollY > 2;
        hdr.style.boxShadow = scrolled ? '0 2px 16px rgba(0,0,0,0.25)' : 'none';
        hdr.style.background = scrolled
          ? 'rgba(13,15,18,0.85)'
          : 'rgba(13,15,18,0.6)';
      }, { passive: true });
    },

    footerYear() {
      const y = new Date().getFullYear();
      $$('#year').forEach(el => (el.textContent = y));
    },

    // ── Mobile nav ───────────────────────────────────────────────────────

    navMenu() {
      const btn = $('.nav-toggle');
      const nav = $('.nav');
      if (!btn || !nav) return;
      btn.addEventListener('click', () => {
        const open = nav.classList.toggle('open');
        btn.setAttribute('aria-expanded', String(open));
      });
      nav.addEventListener('click', e => {
        if (e.target.tagName === 'A') {
          nav.classList.remove('open');
          btn.setAttribute('aria-expanded', 'false');
        }
      });
      // Close nav on outside click
      document.addEventListener('click', e => {
        if (nav.classList.contains('open') && !nav.contains(e.target) && e.target !== btn) {
          nav.classList.remove('open');
          btn.setAttribute('aria-expanded', 'false');
        }
      });
    },

    // ── Service Drawer ────────────────────────────────────────────────────

    drawer() {
      const drawer = $('#svcDrawer');
      if (!drawer) return;

      const closeBtn = $('#svcClose');
      const backdrop = $('#svcBackdrop');
      const nextBtn = $('#svcNext');
      const backBtn = $('#svcBack');

      const open = (service, initialData = {}) => {
        state.drawerOpen = true;
        state.step = 0;
        state.data = { ...initialData };
        state.service = service;
        drawer.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        $('#svcTitle').textContent = this.serviceMeta(service).title;
        $('#svcSubtitle').textContent = this.serviceMeta(service).subtitle;
        this.renderStep();
        closeBtn.focus();
        track('service_open', { service });
      };

      const close = () => {
        state.drawerOpen = false;
        drawer.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
      };

      $$('.svc-open').forEach(btn => {
        btn.addEventListener('click', e => {
          const service = e.currentTarget.closest('.service-card').dataset.service;
          open(service);
        });
      });

      closeBtn.addEventListener('click', close);
      backdrop.addEventListener('click', close);

      nextBtn.addEventListener('click', () => {
        if (!this.collectStep()) return;
        const steps = state.service === 'snow' ? this.snowSteps() : this.renoSteps();
        if (state.step < steps.length - 1) {
          state.step++;
          this.renderStep();
          return;
        }
        // Flow complete — pre-fill contact form
        const details = this.summary();
        const field = $('#serviceDetails');
        if (field) field.value = details;
        close();
        location.hash = '#contact';
        const status = $('#formStatus');
        if (status) {
          status.textContent = 'Details added. Fill in your name and email below to send.';
          status.className = 'form-status';
        }
        track('quote_flow_complete', { service: state.service });
      });

      backBtn.addEventListener('click', () => {
        if (state.step > 0) { state.step--; this.renderStep(); }
      });

      window.addEventListener('keydown', e => {
        if (e.key === 'Escape' && state.drawerOpen) close();
      });

      // Expose so snowPlans() can open with a pre-selected plan
      this._openDrawer = open;
    },

    serviceMeta(key) {
      const map = {
        snow:     { title: 'Snow Removal',               subtitle: 'Pick a plan and add any extras.' },
        kitchen:  { title: 'Kitchen Cabinet Installation',subtitle: 'A few details to tailor your quote.' },
        bathroom: { title: 'Bathroom Renovations',        subtitle: 'Tell us about your space and finishes.' },
        basement: { title: 'Basement Finishing',          subtitle: 'Share your layout and goals.' },
        flooring: { title: 'Flooring & Painting',         subtitle: 'Square footage and material preferences help.' },
      };
      return map[key] || { title: 'Service', subtitle: 'Tell us a bit more.' };
    },

    renoSteps() {
      return [
        // Step 0 — basics
        svc => `
          <div class="grid">
            <label><span>Project Type</span><input value="${this.serviceMeta(svc).title}" disabled></label>
            <label><span>Approx. Start</span><input type="month" id="startMonth" value="${state.data.startMonth || ''}"></label>
          </div>
          <label class="full"><span>Describe your space</span>
            <textarea id="scope" rows="4" placeholder="Size, layout, existing conditions">${state.data.scope || ''}</textarea>
          </label>
        `,
        // Step 1 — service-specific
        svc => {
          const specific = {
            kitchen: `
              <div class="grid">
                <label><span>Cabinet length (ft)</span>
                  <input type="number" id="k_len" min="0" step="0.1" value="${state.data.k_len || ''}">
                </label>
                <label><span>Island?</span>
                  <select id="k_island">
                    <option${state.data.k_island === 'No'  ? ' selected' : ''}>No</option>
                    <option${state.data.k_island === 'Yes' ? ' selected' : ''}>Yes</option>
                  </select>
                </label>
              </div>
              <label class="full"><span>Style / Material</span>
                <input id="k_style" placeholder="Shaker, slab, wood species, etc." value="${state.data.k_style || ''}">
              </label>
            `,
            bathroom: `
              <div class="grid">
                <label><span>Shower or Tub?</span>
                  <select id="bathing">
                    <option${state.data.bathing === 'Shower' ? ' selected' : ''}>Shower</option>
                    <option${state.data.bathing === 'Tub'    ? ' selected' : ''}>Tub</option>
                    <option${state.data.bathing === 'Both'   ? ' selected' : ''}>Both</option>
                  </select>
                </label>
                <label><span>Heated floors?</span>
                  <select id="heat">
                    <option${state.data.heat === 'No'  ? ' selected' : ''}>No</option>
                    <option${state.data.heat === 'Yes' ? ' selected' : ''}>Yes</option>
                  </select>
                </label>
              </div>
              <label class="full"><span>Tile &amp; fixtures</span>
                <input id="fixtures" placeholder="Tile size, niche, glass, vanity, etc." value="${state.data.fixtures || ''}">
              </label>
            `,
            basement: `
              <div class="grid">
                <label><span>Area (sqft)</span>
                  <input type="number" id="area" min="0" value="${state.data.area || ''}">
                </label>
                <label><span>Separate suite?</span>
                  <select id="suite">
                    <option${state.data.suite === 'No'  ? ' selected' : ''}>No</option>
                    <option${state.data.suite === 'Yes' ? ' selected' : ''}>Yes</option>
                  </select>
                </label>
              </div>
              <label class="full"><span>Rooms</span>
                <input id="rooms" placeholder="Bedroom, bath, rec, storage, gym, etc." value="${state.data.rooms || ''}">
              </label>
            `,
            flooring: `
              <div class="grid">
                <label><span>Area (sqft)</span>
                  <input type="number" id="f_area" min="0" value="${state.data.f_area || ''}">
                </label>
                <label><span>Floor Type</span>
                  <select id="f_type">
                    <option${state.data.f_type === 'Laminate' ? ' selected' : ''}>Laminate</option>
                    <option${state.data.f_type === 'Vinyl'    ? ' selected' : ''}>Vinyl</option>
                    <option${state.data.f_type === 'Hardwood' ? ' selected' : ''}>Hardwood</option>
                    <option${state.data.f_type === 'Tile'     ? ' selected' : ''}>Tile</option>
                  </select>
                </label>
              </div>
              <label class="full"><span>Painting</span>
                <input id="paint" placeholder="Rooms, walls, ceilings, trim" value="${state.data.paint || ''}">
              </label>
            `,
          };
          return specific[svc] || '<p class="muted">No additional details needed.</p>';
        },
        // Step 2 — budget & timeline
        () => `
          <div class="grid">
            <label><span>Budget Range</span>
              <select id="budget">
                <option${state.data.budget === 'Undecided'   ? ' selected' : ''}>Undecided</option>
                <option${state.data.budget === '$2k–$5k'    ? ' selected' : ''}>$2k&ndash;$5k</option>
                <option${state.data.budget === '$5k–$15k'   ? ' selected' : ''}>$5k&ndash;$15k</option>
                <option${state.data.budget === '$15k–$35k'  ? ' selected' : ''}>$15k&ndash;$35k</option>
                <option${state.data.budget === '$35k+'        ? ' selected' : ''}>$35k+</option>
              </select>
            </label>
            <label><span>Timeline</span>
              <select id="timeline">
                <option${state.data.timeline === 'Flexible'    ? ' selected' : ''}>Flexible</option>
                <option${state.data.timeline === 'ASAP'        ? ' selected' : ''}>ASAP</option>
                <option${state.data.timeline === '1–3 months' ? ' selected' : ''}>1&ndash;3 months</option>
                <option${state.data.timeline === '3–6 months' ? ' selected' : ''}>3&ndash;6 months</option>
              </select>
            </label>
          </div>
        `,
      ];
    },

    snowSteps() {
      return [
        // Step 0 — pick plan
        () => {
          const plans = this.getSnowPlans();
          return `
            <div class="cards plans-grid">
              ${plans.map(p => `
                <article class="card plan${state.data.plan === p.id ? ' plan-selected' : ''}" data-plan="${p.id}">
                  <h3>${p.name}</h3>
                  <div class="price">${p.price.visit} &bull; ${p.price.month} &bull; ${p.price.season}</div>
                  <ul class="muted">${p.includes.map(i => `<li>${i}</li>`).join('')}</ul>
                  <button class="btn btn-small choose-plan${state.data.plan === p.id ? ' btn-primary' : ''}" data-plan="${p.id}">
                    ${state.data.plan === p.id ? '&#10003; Selected' : 'Choose'}
                  </button>
                </article>
              `).join('')}
            </div>
          `;
        },
        // Step 1 — add-ons
        () => {
          const addons = this.getSnowAddons();
          const selected = state.data.addons || [];
          return `
            <div class="card">
              <h4>Optional Add-Ons</h4>
              <div class="addons-list">
                ${addons.map(a => `
                  <label class="addon-row">
                    <input type="checkbox" class="addon" value="${a.id}"${selected.includes(a.id) ? ' checked' : ''}>
                    <div>
                      <div>${a.name} &mdash; <strong>${a.price}</strong></div>
                      <div class="muted">${a.desc}</div>
                    </div>
                  </label>
                `).join('')}
              </div>
            </div>
          `;
        },
        // Step 2 — property info
        () => `
          <div class="grid">
            <label><span>Driveway size</span>
              <select id="driveSize">
                <option${state.data.driveSize === '1–2 cars' ? ' selected' : ''}>1&ndash;2 cars</option>
                <option${state.data.driveSize === '2–3 cars' ? ' selected' : ''}>2&ndash;3 cars</option>
                <option${state.data.driveSize === '3+ cars'       ? ' selected' : ''}>3+ cars</option>
              </select>
            </label>
            <label><span>Corner lot?</span>
              <select id="corner">
                <option${state.data.corner === 'No'  ? ' selected' : ''}>No</option>
                <option${state.data.corner === 'Yes' ? ' selected' : ''}>Yes</option>
              </select>
            </label>
          </div>
          <label class="full"><span>Notes</span>
            <textarea id="notes" rows="3" placeholder="Stairs, decks, special access, etc.">${state.data.notes || ''}</textarea>
          </label>
        `,
      ];
    },

    renderStep() {
      const content = $('#svcContent');
      const backBtn  = $('#svcBack');
      const nextBtn  = $('#svcNext');
      const steps    = state.service === 'snow' ? this.snowSteps() : this.renoSteps();
      content.innerHTML = steps[state.step](state.service);
      backBtn.hidden    = state.step === 0;
      nextBtn.textContent = state.step === steps.length - 1 ? 'Add to Quote' : 'Continue';

      $$('.choose-plan', content).forEach(btn => {
        btn.addEventListener('click', e => {
          state.data.plan = e.currentTarget.dataset.plan;
          state.step = Math.min(state.step + 1, this.snowSteps().length - 1);
          this.renderStep();
        });
      });
    },

    collectStep() {
      if (state.service === 'snow') {
        if (state.step === 0 && !state.data.plan) {
          this.showDrawerError('Please choose a plan to continue.');
          return false;
        }
        if (state.step === 1) {
          state.data.addons = $$('.addon').filter(a => a.checked).map(a => a.value);
        }
        if (state.step === 2) {
          state.data.driveSize = $('#driveSize').value;
          state.data.corner    = $('#corner').value;
          state.data.notes     = $('#notes').value.trim();
        }
        return true;
      }
      // Reno
      if (state.step === 0) {
        state.data.startMonth = $('#startMonth')?.value || '';
        state.data.scope      = $('#scope')?.value.trim() || '';
      }
      if (state.step === 1) {
        switch (state.service) {
          case 'kitchen':
            state.data.k_len    = $('#k_len').value;
            state.data.k_island = $('#k_island').value;
            state.data.k_style  = $('#k_style').value.trim();
            break;
          case 'bathroom':
            state.data.bathing  = $('#bathing').value;
            state.data.heat     = $('#heat').value;
            state.data.fixtures = $('#fixtures').value.trim();
            break;
          case 'basement':
            state.data.area  = $('#area').value;
            state.data.suite = $('#suite').value;
            state.data.rooms = $('#rooms').value.trim();
            break;
          case 'flooring':
            state.data.f_area = $('#f_area').value;
            state.data.f_type = $('#f_type').value;
            state.data.paint  = $('#paint').value.trim();
            break;
        }
      }
      if (state.step === 2) {
        state.data.budget   = $('#budget').value;
        state.data.timeline = $('#timeline').value;
      }
      return true;
    },

    showDrawerError(msg) {
      let err = $('#drawerError');
      if (!err) {
        err = document.createElement('div');
        err.id = 'drawerError';
        err.className = 'drawer-error';
        err.setAttribute('role', 'alert');
        $('#svcContent').insertAdjacentElement('afterend', err);
      }
      err.textContent = msg;
      clearTimeout(err._timer);
      err._timer = setTimeout(() => err.remove(), 4000);
    },

    summary() {
      if (state.service === 'snow') {
        const plan   = this.getSnowPlans().find(p => p.id === state.data.plan);
        const addons = (state.data.addons || [])
          .map(id => this.getSnowAddons().find(a => a.id === id)?.name)
          .filter(Boolean);
        return [
          'Service: Snow Removal',
          `Plan: ${plan ? plan.name : 'N/A'}`,
          addons.length ? `Add-ons: ${addons.join(', ')}` : null,
          `Driveway: ${state.data.driveSize || ''}${state.data.corner === 'Yes' ? ', corner lot' : ''}`,
          state.data.notes ? `Notes: ${state.data.notes}` : null,
        ].filter(Boolean).join(' | ');
      }
      const title = this.serviceMeta(state.service).title;
      const parts = [`Service: ${title}`];
      if (state.data.startMonth) parts.push(`Start: ${state.data.startMonth}`);
      if (state.data.scope)      parts.push(`Scope: ${state.data.scope}`);
      const svc = state.service;
      if (svc === 'kitchen')  parts.push(`Length: ${state.data.k_len}ft, Island: ${state.data.k_island}, Style: ${state.data.k_style}`);
      if (svc === 'bathroom') parts.push(`Bathing: ${state.data.bathing}, Heated: ${state.data.heat}, Fixtures: ${state.data.fixtures}`);
      if (svc === 'basement') parts.push(`Area: ${state.data.area} sqft, Suite: ${state.data.suite}, Rooms: ${state.data.rooms}`);
      if (svc === 'flooring') parts.push(`Area: ${state.data.f_area} sqft, Type: ${state.data.f_type}, Painting: ${state.data.paint}`);
      parts.push(`Budget: ${state.data.budget || 'Undecided'}`, `Timeline: ${state.data.timeline || 'Flexible'}`);
      return parts.join(' | ');
    },

    // ── Snow Plans section ────────────────────────────────────────────────

    snowPlans() {
      const grid = $('#snowPlansGrid');
      if (!grid) return;
      grid.innerHTML = this.getSnowPlans().map(p => `
        <article class="card plan">
          <h3>${p.name}</h3>
          <div class="price">${p.price.visit} &bull; ${p.price.month} &bull; ${p.price.season}</div>
          <ul class="muted">${p.includes.map(i => `<li>${i}</li>`).join('')}</ul>
          <button class="btn btn-primary btn-small" data-open-snow="${p.id}">Choose ${p.short}</button>
        </article>
      `).join('');

      $$('[data-open-snow]').forEach(btn => {
        btn.addEventListener('click', e => {
          const planId = e.currentTarget.getAttribute('data-open-snow');
          if (this._openDrawer) this._openDrawer('snow', { plan: planId });
        });
      });
    },

    getSnowPlans() {
      return [
        {
          id: 'basic', short: 'Basic', name: 'Basic Driveway Plan',
          price: { visit: '$45/visit', month: '$180/month', season: '$600/season' },
          includes: [
            '1–2 car driveway',
            'Cleared within 8 hours after snowfall (≥2")',
            'Fast and affordable',
            'No walkway or salting included',
          ],
        },
        {
          id: 'standard', short: 'Standard', name: 'Standard Home Plan',
          price: { visit: '$55/visit', month: '$220/month', season: '$750/season' },
          includes: [
            'Driveway clearing (up to 2 cars)',
            'Walkway to main door',
            'Basic walkway salting',
            'Service after snowfall ≥2"',
            'Good coverage at fair cost',
          ],
        },
        {
          id: 'premium', short: 'Premium', name: 'Premium Coverage Plan',
          price: { visit: '$70/visit', month: '$280/month', season: '$950/season' },
          includes: [
            'Driveway, walkway, and full front sidewalk',
            'Porch and stairs cleared',
            'Salt/calcium chloride on all surfaces',
            'Priority service after major snowfalls',
          ],
        },
        {
          id: 'commercial', short: 'Commercial', name: 'Commercial / Apartment Plan',
          price: { visit: 'From $150/visit', month: '$500+/month', season: 'By quote' },
          includes: [
            'Parking lots, storefronts, building sidewalks',
            'Drive lanes, loading zones, walkways',
            'Full salting coverage',
            'Optional night or early-morning service',
          ],
        },
      ];
    },

    getSnowAddons() {
      return [
        { id: 'extra-salt', name: 'Extra salting (per visit)', price: '+$10–$15', desc: 'After freezing rain or refreeze' },
        { id: 'refreeze',   name: 'Refreeze monitoring',       price: '+$15/month',   desc: 'One free return after melt/refreeze' },
        { id: 'priority',   name: 'Priority route',            price: '+$20/month',   desc: 'Guaranteed service within first 3 hours' },
        { id: 'roof-deck',  name: 'Roof or deck clearing',     price: 'From $100',    desc: 'Upon request; quote per property' },
      ];
    },

    // ── Contact Form ──────────────────────────────────────────────────────

    contactForm() {
      const form = $('#contactForm');
      if (!form) return;
      form.addEventListener('submit', e => this.handleContactSubmit(e));
    },

    async handleContactSubmit(e) {
      e.preventDefault();
      const form      = e.target;
      const status    = $('#formStatus');
      const submitBtn = form.querySelector('[type="submit"]');

      // Clear previous errors
      $$('.field-error', form).forEach(el => el.remove());
      $$('.input-error', form).forEach(el => el.classList.remove('input-error'));

      const data   = Object.fromEntries(new FormData(form));
      const errors = this.validateContactForm(data);

      if (errors.length) {
        errors.forEach(({ field, msg }) => {
          const input = form.querySelector(`[name="${field}"]`);
          if (!input) return;
          input.classList.add('input-error');
          const errEl = document.createElement('span');
          errEl.className = 'field-error';
          errEl.textContent = msg;
          input.insertAdjacentElement('afterend', errEl);
        });
        form.querySelector('.input-error')?.focus();
        return;
      }

      submitBtn.disabled      = true;
      submitBtn.textContent   = 'Sending…';
      status.textContent      = '';
      status.className        = 'form-status';

      try {
        const payload = {
          access_key:      WEB3FORMS_KEY,
          subject:         'Quote Request — Reno Riser Construction',
          from_name:       data.name.trim(),
          email:           data.email.trim(),
          phone:           data.phone    || '',
          address:         data.address  || '',
          service_details: data.serviceDetails || '',
          message:         data.message  || '',
        };

        const res  = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(payload),
        });
        const json = await res.json();

        if (json.success) {
          status.textContent = "✓ Request sent! We’ll be in touch shortly.";
          status.className   = 'form-status success';
          form.reset();
          track('quote_submitted', { method: data.serviceDetails ? 'drawer' : 'direct' });
        } else {
          throw new Error(json.message || 'Submission failed');
        }
      } catch {
        status.textContent = 'Something went wrong. Please email us directly at renoriser@outlook.com';
        status.className   = 'form-status error';
      } finally {
        submitBtn.disabled    = false;
        submitBtn.textContent = 'Request Quote';
      }
    },

    validateContactForm(data) {
      const errors = [];
      if (!data.name?.trim()) {
        errors.push({ field: 'name', msg: 'Name is required.' });
      }
      if (!data.email?.trim()) {
        errors.push({ field: 'email', msg: 'Email is required.' });
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
        errors.push({ field: 'email', msg: 'Please enter a valid email address.' });
      }
      return errors;
    },

    // ── Gallery / Work Page ───────────────────────────────────────────────

    openLightboxFor(item) {
      const src       = item.dataset.src;
      const mediaType = item.dataset.mediatype || 'img';
      const lb        = $('#lightbox');
      const content   = $('#lightboxContent');
      if (!lb || !content) return;

      content.innerHTML = '';

      if (mediaType === 'video') {
        const vid = document.createElement('video');
        vid.src = src; vid.controls = true; vid.autoplay = true; vid.playsInline = true;
        content.appendChild(vid);
      } else {
        const wrap = document.createElement('div');
        wrap.className = 'lb-image';
        const img = document.createElement('img');
        img.src = src; img.alt = 'Project photo';
        wrap.appendChild(img);
        content.appendChild(wrap);
      }

      lb.setAttribute('aria-hidden', 'false');
      $('#lightboxClose')?.focus();
    },

    lightbox() {
      const lb = $('#lightbox');
      if (!lb) return;
      const close = () => lb.setAttribute('aria-hidden', 'true');
      $('#lightboxClose').addEventListener('click', close);
      $('#lightboxBackdrop').addEventListener('click', close);
      window.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
    },

    locations() {
      const cards = $('#locCards');
      if (!cards) return;

      const gallery = $('#locGallery');
      const head    = $('#locHead');
      const title   = $('#locTitle');

      fetch(MANIFEST_URL)
        .then(r => {
          if (!r.ok) throw new Error('manifest not found');
          return r.json();
        })
        .then(manifest => {
          cards.innerHTML = Object.entries(manifest).map(([key, items]) => {
            const cover = items.find(m => m.type === 'img');
            const bgStyle = cover
              ? `style="background:url('${cover.src}') center/cover no-repeat, linear-gradient(180deg,#0f1318,#0a0c0f)"`
              : '';
            const label = LOC_LABELS[key] || key;
            return `
              <article class="loc-card" data-loc="${key}" ${bgStyle} tabindex="0" role="button" aria-label="Open ${label} gallery">
                <div class="meta">${label}</div>
                <div>
                  <div class="title">${label}</div>
                  <div class="count">${items.length} item${items.length === 1 ? '' : 's'}</div>
                </div>
              </article>
            `;
          }).join('');

          const openGallery = card => {
            const key   = card.getAttribute('data-loc');
            const items = manifest[key] || [];
            title.textContent = LOC_LABELS[key] || key;
            head.style.display = '';

            gallery.innerHTML = items.map(m => {
              const isAfter     = m.stage === 'A';
              const stageLabel  = isAfter ? 'After' : 'Before';
              const stageClass  = isAfter ? 'after' : 'before';
              if (m.type === 'img') {
                return `
                  <figure class="gal-item" data-mediatype="img" data-src="${m.src}">
                    <span class="badge ${stageClass}">${stageLabel}</span>
                    <img src="${m.src}" alt="${stageLabel} photo" loading="lazy">
                    <figcaption>${stageLabel}</figcaption>
                  </figure>
                `;
              }
              return `
                <figure class="gal-item" data-mediatype="video" data-src="${m.src}">
                  <span class="badge ${stageClass}">${stageLabel}</span>
                  <video src="${m.src}" muted playsinline loop></video>
                  <figcaption>Video &mdash; ${stageLabel}</figcaption>
                </figure>
              `;
            }).join('');

            $$('.gal-item', gallery).forEach(item => {
              item.addEventListener('click', () => this.openLightboxFor(item));
            });

            head.scrollIntoView({ behavior: 'smooth', block: 'start' });
          };

          $$('.loc-card', cards).forEach(card => {
            card.addEventListener('click', () => openGallery(card));
            card.addEventListener('keydown', e => {
              if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openGallery(card); }
            });
          });
        })
        .catch(() => {
          cards.innerHTML = '<p class="muted">Unable to load projects. Please try again later.</p>';
        });
    },
  };

  document.addEventListener('DOMContentLoaded', () => App.init());
})();
