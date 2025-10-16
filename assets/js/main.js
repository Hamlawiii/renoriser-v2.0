/* Reno Riser Construction — Interactive logic */
(function(){
  const $ = (sel, el=document) => el.querySelector(sel);
  const $$ = (sel, el=document) => Array.from(el.querySelectorAll(sel));

  const state = {
    drawerOpen: false,
    step: 0,
    service: null,
    data: {},
  };

  const App = {
    init(){
      this.header();
      this.footerYear();
      this.navMenu();
      this.gallery();
      this.locations();
      this.lightbox();
      this.drawer();
      this.snowPlans();
      window.App = this; // expose for form handler
    },

    header(){
      let lastY = 0; const hdr = $('.site-header');
      window.addEventListener('scroll', () => {
        const y = window.scrollY;
        hdr.style.boxShadow = y>2 ? '0 2px 16px rgba(0,0,0,0.25)' : 'none';
        hdr.style.background = y>2 ? 'rgba(13,15,18,0.7)' : 'rgba(13,15,18,0.6)';
        lastY = y;
      });
    },

    footerYear(){
      const y = new Date().getFullYear();
      $$('#year').forEach(el => el.textContent = y);
    },

    navMenu(){
      const btn = $('.nav-toggle');
      const nav = $('.nav');
      if(!btn || !nav) return;
      btn.addEventListener('click', ()=>{
        const open = nav.classList.toggle('open');
        btn.setAttribute('aria-expanded', String(open));
      });
      nav.addEventListener('click', (e)=>{
        if(e.target.tagName==='A') nav.classList.remove('open');
      });
    },

    /* Drawer / Service flow */
    drawer(){
      const drawer = $('#svcDrawer');
      const openers = $$('.svc-open');
      const closeBtn = $('#svcClose');
      const backdrop = $('#svcBackdrop');
      const nextBtn = $('#svcNext');
      const backBtn = $('#svcBack');

      const open = (service) => {
        state.drawerOpen = true; state.step = 0; state.data = {}; state.service = service;
        drawer.setAttribute('aria-hidden', 'false');
        $('body').style.overflow = 'hidden';
        $('#svcTitle').textContent = this.serviceMeta(service).title;
        $('#svcSubtitle').textContent = this.serviceMeta(service).subtitle;
        this.renderStep();
      };
      const close = () => {
        state.drawerOpen = false; drawer.setAttribute('aria-hidden', 'true');
        $('body').style.overflow = '';
      };
      openers.forEach(btn=>{
        btn.addEventListener('click', (e)=>{
          const service = e.currentTarget.closest('.service-card').dataset.service;
          open(service);
        });
      });
      closeBtn.addEventListener('click', close);
      backdrop.addEventListener('click', close);

      nextBtn.addEventListener('click', ()=>{
        if(!this.collectStep()) return; // validation
        if(state.service==='snow'){
          if(state.step < this.snowSteps().length-1){ state.step++; this.renderStep(); return; }
        } else {
          if(state.step < this.renoSteps().length-1){ state.step++; this.renderStep(); return; }
        }
        // Completed -> dump into contact form
        const details = this.summary();
        const field = $('#serviceDetails');
        if(field) field.value = details;
        close();
        location.hash = '#contact';
        $('#formStatus').textContent = 'Details added to your request. Complete the form to send.';
      });
      backBtn.addEventListener('click', ()=>{ if(state.step>0){ state.step--; this.renderStep(); }});
      window.addEventListener('keydown', (e)=>{ if(e.key==='Escape' && state.drawerOpen) close(); });
    },

    serviceMeta(key){
      const map = {
        snow: { title:'Snow Removal', subtitle:'Pick a plan and add any extras.' },
        kitchen: { title:'Kitchen Cabinet Installation', subtitle:'A few details to tailor your quote.' },
        bathroom: { title:'Bathroom Renovations', subtitle:'Tell us about your space and finishes.' },
        basement: { title:'Basement Finishing', subtitle:'Share your layout and goals.' },
        flooring: { title:'Flooring & Painting', subtitle:'Square footage and material preferences help.' },
      };
      return map[key] || { title:'Service', subtitle:'Tell us a bit more.' };
    },

    renoSteps(){
      return [
        // Step 0: basics
        (svc)=>{
          return `
            <div class="grid">
              <label><span>Project Type</span><input value="${this.serviceMeta(svc).title}" disabled></label>
              <label><span>Approx. Start</span><input type="month" id="startMonth"></label>
            </div>
            <label class="full"><span>Describe your space</span><textarea id="scope" rows="4" placeholder="Size, layout, existing conditions"></textarea></label>
          `;
        },
        // Step 1: specifics
        (svc)=>{
          const specific = {
            kitchen: `
              <div class="grid">
                <label><span>Cabinet length (ft)</span><input type="number" id="k_len" min="0" step="0.1"></label>
                <label><span>Island?</span>
                  <select id="k_island"><option>No</option><option>Yes</option></select></label>
              </div>
              <label class="full"><span>Style / Material</span><input id="k_style" placeholder="Shaker, slab, wood species, etc."></label>
            `,
            bathroom: `
              <div class="grid">
                <label><span>Shower or Tub?</span>
                  <select id="bathing"><option>Shower</option><option>Tub</option><option>Both</option></select></label>
                <label><span>Heated floors?</span>
                  <select id="heat"><option>No</option><option>Yes</option></select></label>
              </div>
              <label class="full"><span>Tile & fixtures</span><input id="fixtures" placeholder="Tile size, niche, glass, vanity, etc."></label>
            `,
            basement: `
              <div class="grid">
                <label><span>Area (sqft)</span><input type="number" id="area" min="0"></label>
                <label><span>Separate suite?</span>
                  <select id="suite"><option>No</option><option>Yes</option></select></label>
              </div>
              <label class="full"><span>Rooms</span><input id="rooms" placeholder="Bedroom, bath, rec, storage, gym, etc."></label>
            `,
            flooring: `
              <div class="grid">
                <label><span>Area (sqft)</span><input type="number" id="f_area" min="0"></label>
                <label><span>Floor Type</span>
                  <select id="f_type"><option>Laminate</option><option>Vinyl</option><option>Hardwood</option><option>Tile</option></select></label>
              </div>
              <label class="full"><span>Painting</span><input id="paint" placeholder="Rooms, walls, ceilings, trim"></label>
            `,
          };
          return specific[svc] || '<p class="muted">Details</p>';
        },
        // Step 2: budget + timing
        ()=>{
          return `
            <div class="grid">
              <label><span>Budget Range</span>
                <select id="budget">
                  <option>Undecided</option>
                  <option>$2k–$5k</option>
                  <option>$5k–$15k</option>
                  <option>$15k–$35k</option>
                  <option>$35k+</option>
                </select></label>
              <label><span>Timeline</span>
                <select id="timeline">
                  <option>Flexible</option>
                  <option>ASAP</option>
                  <option>1–3 months</option>
                  <option>3–6 months</option>
                </select></label>
            </div>
          `;
        },
      ];
    },

    snowSteps(){
      return [
        // Step 0: plan select
        ()=>{
          const plans = this.getSnowPlans();
          return `
            <div class="cards plans-grid">
              ${plans.map(p=>`
                <article class="card plan" data-plan="${p.id}">
                  <h3>${p.name}</h3>
                  <div class="price">${p.price.visit} • ${p.price.month} • ${p.price.season}</div>
                  <ul class="muted">${p.includes.map(i=>`<li>${i}</li>`).join('')}</ul>
                  <button class="btn btn-small choose-plan" data-plan="${p.id}">Choose</button>
                </article>
              `).join('')}
            </div>
          `;
        },
        // Step 1: add-ons
        ()=>{
          const addons = this.getSnowAddons();
          return `
            <div class="card">
              <h4>Add-Ons</h4>
              <div class="grid">
                ${addons.map(a=>`
                  <label>
                    <input type="checkbox" class="addon" value="${a.id}"> ${a.name}
                    <div class="muted">${a.desc} — <strong>${a.price}</strong></div>
                  </label>
                `).join('')}
              </div>
            </div>
          `;
        },
        // Step 2: property basics
        ()=>{
          return `
            <div class="grid">
              <label><span>Driveway size</span>
                <select id="driveSize"><option>1–2 cars</option><option>2–3 cars</option><option>3+ cars</option></select></label>
              <label><span>Corner lot?</span>
                <select id="corner"><option>No</option><option>Yes</option></select></label>
            </div>
            <label class="full"><span>Notes</span><textarea id="notes" rows="3" placeholder="Any stairs, decks, special access, etc."></textarea></label>
          `;
        },
      ];
    },

    renderStep(){
      const content = $('#svcContent');
      const backBtn = $('#svcBack');
      const nextBtn = $('#svcNext');
      const steps = state.service==='snow' ? this.snowSteps() : this.renoSteps();
      const total = steps.length;
      content.innerHTML = steps[state.step](state.service);
      backBtn.hidden = state.step===0;
      nextBtn.textContent = state.step===total-1 ? 'Add to Quote' : 'Continue';

      // wire dynamic buttons within content
      $$('.choose-plan', content).forEach(btn=>{
        btn.addEventListener('click', (e)=>{
          const id = e.currentTarget.dataset.plan;
          state.data.plan = id;
          state.step = Math.min(state.step+1, this.snowSteps().length-1);
          this.renderStep();
        });
      });
    },

    collectStep(){
      if(state.service==='snow'){
        if(state.step===0){
          if(!state.data.plan){ alert('Please choose a snow plan to continue.'); return false; }
        }
        if(state.step===1){
          state.data.addons = $$('.addon').filter(a=>a.checked).map(a=>a.value);
        }
        if(state.step===2){
          state.data.driveSize = $('#driveSize').value;
          state.data.corner = $('#corner').value;
          state.data.notes = $('#notes').value;
        }
        return true;
      }
      // reno
      if(state.step===0){
        state.data.startMonth = $('#startMonth')?.value || '';
        state.data.scope = $('#scope')?.value || '';
      }
      if(state.step===1){
        switch(state.service){
          case 'kitchen':
            state.data.k_len = $('#k_len').value; state.data.k_island = $('#k_island').value; state.data.k_style = $('#k_style').value; break;
          case 'bathroom':
            state.data.bathing = $('#bathing').value; state.data.heat = $('#heat').value; state.data.fixtures = $('#fixtures').value; break;
          case 'basement':
            state.data.area = $('#area').value; state.data.suite = $('#suite').value; state.data.rooms = $('#rooms').value; break;
          case 'flooring':
            state.data.f_area = $('#f_area').value; state.data.f_type = $('#f_type').value; state.data.paint = $('#paint').value; break;
        }
      }
      if(state.step===2){
        state.data.budget = $('#budget').value; state.data.timeline = $('#timeline').value;
      }
      return true;
    },

    summary(){
      if(state.service==='snow'){
        const plan = this.getSnowPlans().find(p=>p.id===state.data.plan);
        const addons = (state.data.addons||[]).map(id=>this.getSnowAddons().find(a=>a.id===id)?.name).filter(Boolean);
        return [
          `Service: Snow Removal`,
          `Plan: ${plan ? plan.name : 'N/A'}`,
          addons.length? `Add-ons: ${addons.join(', ')}` : null,
          `Driveway: ${state.data.driveSize||''}${state.data.corner==='Yes'? ', corner lot':''}`,
          state.data.notes? `Notes: ${state.data.notes}`: null,
        ].filter(Boolean).join(' | ');
      }
      const title = this.serviceMeta(state.service).title;
      const parts = [`Service: ${title}`];
      if(state.data.startMonth) parts.push(`Start: ${state.data.startMonth}`);
      if(state.data.scope) parts.push(`Scope: ${state.data.scope}`);
      const svc = state.service;
      if(svc==='kitchen') parts.push(`Length: ${state.data.k_len}ft, Island: ${state.data.k_island}, Style: ${state.data.k_style}`);
      if(svc==='bathroom') parts.push(`Bathing: ${state.data.bathing}, Heated: ${state.data.heat}, Fixtures: ${state.data.fixtures}`);
      if(svc==='basement') parts.push(`Area: ${state.data.area} sqft, Suite: ${state.data.suite}, Rooms: ${state.data.rooms}`);
      if(svc==='flooring') parts.push(`Area: ${state.data.f_area} sqft, Type: ${state.data.f_type}, Painting: ${state.data.paint}`);
      parts.push(`Budget: ${state.data.budget||'Undecided'}`, `Timeline: ${state.data.timeline||'Flexible'}`);
      return parts.join(' | ');
    },

    snowPlans(){
      // Render cards in the Snow Plans section on home
      const grid = $('#snowPlansGrid'); if(!grid) return;
      const plans = this.getSnowPlans();
      grid.innerHTML = plans.map(p=>`
        <article class="card plan">
          <h3>${p.name}</h3>
          <div class="price">${p.price.visit} • ${p.price.month} • ${p.price.season}</div>
          <ul class="muted">${p.includes.map(i=>`<li>${i}</li>`).join('')}</ul>
          <button class="btn btn-primary btn-small" data-open-snow="${p.id}">Choose ${p.short}</button>
        </article>
      `).join('');

      $$('[data-open-snow]')?.forEach(btn=>{
        btn.addEventListener('click', (e)=>{
          // Open drawer in snow mode + preselect plan
          const planId = e.currentTarget.getAttribute('data-open-snow');
          const snowCard = document.querySelector('.service-card[data-service="snow"] .svc-open');
          snowCard?.click();
          state.data.plan = planId; // preselect
          // re-render current step so selection is reflected
          setTimeout(()=> this.renderStep(), 50);
        });
      });
    },

    getSnowPlans(){
      return [
        {
          id:'basic', short:'Basic', name:'Basic Driveway Plan',
          price:{ visit:'$45/visit', month:'$180/month', season:'$600/season' },
          includes:[
            '1–2 car driveway',
            'Cleared within 8 hours after snowfall (≥2”)',
            'Fast and affordable',
            'No walkway or salting included'
          ]
        },
        {
          id:'standard', short:'Standard', name:'Standard Home Plan',
          price:{ visit:'$55/visit', month:'$220/month', season:'$750/season' },
          includes:[
            'Driveway clearing (up to 2 cars)',
            'Walkway to main door',
            'Basic walkway salting',
            'Service after snowfall ≥2”',
            'Good coverage at fair cost'
          ]
        },
        {
          id:'premium', short:'Premium', name:'Premium Coverage Plan',
          price:{ visit:'$70/visit', month:'$280/month', season:'$950/season' },
          includes:[
            'Driveway, walkway, and full front sidewalk',
            'Porch and stairs cleared',
            'Salt/calcium chloride on all surfaces',
            'Priority service after major snowfalls'
          ]
        },
        {
          id:'commercial', short:'Commercial', name:'Commercial / Apartment Plan',
          price:{ visit:'From $150/visit', month:'$500+/month', season:'By quote' },
          includes:[
            'Parking lots, storefronts, building sidewalks',
            'Drive lanes, loading zones, walkways',
            'Full salting coverage',
            'Optional night or early-morning service'
          ]
        }
      ];
    },

    getSnowAddons(){
      return [
        { id:'extra-salt', name:'Extra salting (per visit)', price:'+$10–$15', desc:'After freezing rain or refreeze' },
        { id:'refreeze', name:'Refreeze monitoring', price:'+$15/month', desc:'One free return after melt/refreeze' },
        { id:'priority', name:'Priority route', price:'+$20/month', desc:'Guaranteed service within first 3 hours' },
        { id:'roof-deck', name:'Roof or deck clearing', price:'From $100', desc:'Upon request; quote per property' },
      ];
    },

    /* Work gallery */
    gallery(){
      const gallery = $('#gallery'); const filters = $('#filters');
      if(!gallery || !filters) return;
      filters.addEventListener('click', (e)=>{
        if(!(e.target instanceof HTMLElement)) return;
        if(!e.target.matches('.chip')) return;
        $$('.chip', filters).forEach(c=>c.classList.remove('active'));
        e.target.classList.add('active');
        const tag = e.target.getAttribute('data-filter');
        $$('.gal-item', gallery).forEach(item=>{
          const tags = (item.getAttribute('data-tags')||'').split(',');
          const show = tag==='all' || tags.includes(tag);
          item.style.display = show ? '' : 'none';
        });
      });

      // Click to open lightbox
      $$('.gal-item', gallery).forEach(item=>{
        item.addEventListener('click', ()=>{
          const img = $('img', item); const vid = $('video', item);
          const content = $('#lightboxContent');
          content.innerHTML = '';
          if(img){ const el = img.cloneNode(true); el.removeAttribute('style'); content.appendChild(el); }
          if(vid){ const el = vid.cloneNode(true); el.controls = true; el.muted = false; el.autoplay = true; el.removeAttribute('style'); content.appendChild(el); }
          $('#lightbox').setAttribute('aria-hidden','false');
        });
      });
    },

    lightbox(){
      const lb = $('#lightbox'); if(!lb) return;
      $('#lightboxClose').addEventListener('click', ()=> lb.setAttribute('aria-hidden','true'));
      $('#lightboxBackdrop').addEventListener('click', ()=> lb.setAttribute('aria-hidden','true'));
      window.addEventListener('keydown', (e)=>{ if(e.key==='Escape') lb.setAttribute('aria-hidden','true'); });
    },

    // New: Locations view (three cards)
    locations(){
      const cards = $('#locCards'); if(!cards) return;
      const gallery = $('#locGallery'); const head = $('#locHead'); const title = $('#locTitle');
      const sets = [
        { key:'H', label:'Hamilton', prefixes:['H'] },
        { key:'T', label:'Hamilton', prefixes:['T'] },
        { key:'B', label:'Burlington', prefixes:['B'] },
      ];
      const exImg = ['jpg','jpeg','png','webp'];
      const exVid = ['mp4','webm'];
      const maxN = 60;
      const results = { H:[], T:[], B:[] };

      const getStage = (src)=>{ const m = /([A-Za-z])([ABab])(\d+)\.[A-Za-z0-9]+$/.exec(src); return m ? (m[2].toUpperCase()==='A'?'A':'B') : 'B'; };
      const add = (k, media) => { results[k].push(media); };
      const tryImg = (src, k) => { const im = new Image(); im.onload=()=> add(k,{type:'img',src,stage:getStage(src)}); im.onerror=()=>{}; im.src=src; };
      const tryVid = (src, k) => { const v = document.createElement('video'); v.onloadeddata = ()=> add(k,{type:'video',src,stage:getStage(src)}); v.onerror = ()=>{}; v.src = src; v.load(); };

      sets.forEach(set=>{
        set.prefixes.forEach(p=>{
          for(let n=1;n<=maxN;n++){
            ['A','B'].forEach(stage=>{
              exImg.forEach(ext=> tryImg(`images/${p}${stage}${n}.${ext}`, set.key));
              exVid.forEach(ext=> tryVid(`videos/${p}${stage}${n}.${ext}`, set.key));
            });
          }
        });
      });

      // Build cards after a short gather period
      setTimeout(()=>{
        cards.innerHTML = sets.map(set=>{
          const arr = results[set.key] || [];
          const cover = arr.find(m=>m.type==='img') || arr[0];
          const bg = cover && cover.type==='img' ? `style="background:url('${cover.src}') center/cover no-repeat"` : '';
          return `
            <article class="loc-card" data-loc="${set.key}" ${bg}>
              <div class="meta">${set.key==='B'?'Burlington':'Hamilton'}</div>
              <div>
                <div class="title">${set.label}</div>
                <div class="count">${arr.length} item${arr.length===1?'':'s'}</div>
              </div>
            </article>
          `;
        }).join('');

        // Wire clicks
        $$('.loc-card', cards).forEach(card=>{
          card.addEventListener('click', ()=>{
            const key = card.getAttribute('data-loc');
            const arr = results[key] || [];
            title.textContent = key==='B' ? 'Burlington' : (key==='T' ? 'Hamilton ' : 'Hamilton');
            head.style.display = '';
            gallery.innerHTML = arr.map(m=>{
              const badge = `<span class=\"badge ${m.stage==='A'?'after':'before'}\">${m.stage==='A'?'After':'Before'}</span>`;
              if(m.type==='img'){
                return `<figure class=\"gal-item\" data-mediatype=\"img\" data-src=\"${m.src}\">${badge}<img src=\"${m.src}\" alt=\"Project image\"/><figcaption>Image</figcaption></figure>`;
              } else {
                return `<figure class=\"gal-item\" data-mediatype=\"video\" data-src=\"${m.src}\">${badge}<video src=\"${m.src}\" muted playsinline loop></video><figcaption>Video</figcaption></figure>`;
              }
            }).join('');
            $$('.gal-item', gallery).forEach(item=> item.addEventListener('click', ()=> openLightboxFor(item)) );
          });
        });
      }, 700);

      // Update counts and covers as media load
      let ticks = 0; const timer = setInterval(()=>{
        sets.forEach(set=>{
          const card = document.querySelector(`.loc-card[data-loc="${set.key}"]`); if(!card) return;
          const arr = results[set.key] || [];
          const cnt = card.querySelector('.count'); if(cnt) cnt.textContent = `${arr.length} item${arr.length===1?'':'s'}`;
          const cover = arr.find(m=>m.type==='img') || arr[0];
          if(cover && cover.type==='img' && !card.style.backgroundImage){
            card.style.background = `url('${cover.src}') center/cover no-repeat, linear-gradient(180deg,#0f1318,#0a0c0f)`;
          }
        });
        if(++ticks>14) clearInterval(timer);
      }, 500);
    },

    // Dynamic work page: loads images from images/from1.jpg..from45.jpg (or 1..45)
    dynamicWork(){
      const host = $('#dynGallery');
      if(!host) return;

      const filenames = [];
      const bases = [];
      for(let i=1;i<=45;i++){ bases.push(`from${i}`); bases.push(`${i}`); }
      const exts = ['jpg','jpeg','JPG','JPEG','png','PNG','webp','WEBP'];
      const seen = new Set();
      bases.forEach(b=> exts.forEach(ext=> filenames.push(`images/${b}.${ext}`)) );

      const getMeta = (src)=>{
        const key = `rr:img:${src.toLowerCase()}`;
        const saved = JSON.parse(localStorage.getItem(key)||'{}');
        return {
          stage: saved.stage || 'unknown', // before|during|after|unknown
          cat: saved.cat || 'misc', // kitchen|bathroom|basement|flooring|exterior|misc
          pair: saved.pair || '',
          note: saved.note || ''
        };
      };
      const saveMeta = (src, meta)=>{
        const key = `rr:img:${src.toLowerCase()}`;
        localStorage.setItem(key, JSON.stringify(meta));
      };

      const loadedKeys = new Set();
      const baseKey = (p)=> (p||'').toLowerCase().replace(/\.(jpe?g|png|webp)$/i,'');

      const addCard = (src)=>{
        const img = new Image();
        img.alt = 'Project photo';
        img.onload = ()=>{
          const bkey = baseKey(src);
          if(loadedKeys.has(bkey)) return; // already added via another extension/case
          loadedKeys.add(bkey);

          const fig = document.createElement('figure');
          fig.className = 'gal-item taggable';
          fig.dataset.src = src.toLowerCase();

          let meta = getMeta(src);
          const seed = this.seedTags();
          const look = src.toLowerCase();
          if((!meta.stage || meta.stage==='unknown') && seed[look]){
            meta = Object.assign({}, meta, seed[look]);
            saveMeta(look, meta);
          }
          fig.dataset.stage = meta.stage; fig.dataset.cat = meta.cat; fig.dataset.pair = meta.pair;

          const cap = document.createElement('figcaption');
          cap.innerHTML = `<span class=\"tag cat\">${meta.cat}</span>`;

          const edit = document.createElement('button');
          edit.className = 'edit-btn'; edit.type = 'button'; edit.textContent = 'Edit';
          edit.addEventListener('click', ()=> openEditor(fig));

          fig.appendChild(img);
          fig.appendChild(cap);
          fig.appendChild(edit);
          fig.addEventListener('click', (e)=>{ if(e.target===edit) return; openLightboxFor(fig); });
          host.appendChild(fig);
        };
        img.onerror = ()=>{ /* skip missing */ };
        img.src = src;
      };

      const openEditor = (fig)=>{
        const src = fig.dataset.src;
        const meta = getMeta(src);
        const panel = document.createElement('div');
        panel.className = 'tag-editor';
        panel.innerHTML = `
          <label>Stage<select id="te-stage">
            <option value="before" ${meta.stage==='before'?'selected':''}>Before</option>
            <option value="during" ${meta.stage==='during'?'selected':''}>During</option>
            <option value="after" ${meta.stage==='after'?'selected':''}>After</option>
            <option value="unknown" ${meta.stage==='unknown'?'selected':''}>Unknown</option>
          </select></label>
          <label>Category<select id="te-cat">
            <option value="kitchen" ${meta.cat==='kitchen'?'selected':''}>Kitchen</option>
            <option value="bathroom" ${meta.cat==='bathroom'?'selected':''}>Bathroom</option>
            <option value="basement" ${meta.cat==='basement'?'selected':''}>Basement</option>
            <option value="flooring" ${meta.cat==='flooring'?'selected':''}>Flooring/Paint</option>
            <option value="exterior" ${meta.cat==='exterior'?'selected':''}>Exterior</option>
            <option value="misc" ${meta.cat==='misc'?'selected':''}>Misc</option>
          </select></label>
          <label>Pair ID<input id="te-pair" placeholder="e.g. K1, B1" value="${meta.pair||''}"></label>
          <label>Note<input id="te-note" placeholder="Short caption" value="${meta.note||''}"></label>
          <div class="actions"><button id="te-save" class="btn btn-primary btn-small">Save</button> <button id="te-cancel" class="btn btn-small">Cancel</button></div>
        `;
        fig.appendChild(panel);
        $('#te-save', panel).addEventListener('click', ()=>{
          const newMeta = {
            stage: $('#te-stage', panel).value,
            cat: $('#te-cat', panel).value,
            pair: $('#te-pair', panel).value.trim(),
            note: $('#te-note', panel).value.trim(),
          };
          saveMeta(src, newMeta);
          fig.dataset.stage = newMeta.stage; fig.dataset.cat = newMeta.cat; fig.dataset.pair = newMeta.pair;
          const sEl = $('figcaption .stage', fig); if(sEl) sEl.textContent = newMeta.stage;
          $('figcaption .cat', fig).textContent = newMeta.cat;
          panel.remove();
          applyFilters();
        });
        $('#te-cancel', panel).addEventListener('click', ()=> panel.remove());
      };

      const openLightboxFor = (fig)=>{
        const src = fig.dataset.src; const mediaType = fig.dataset.mediatype || 'img';
        const meta = getMeta(src);
        const lb = $('#lightbox'); const content = $('#lightboxContent');
        content.innerHTML = '';
        if(mediaType==='video'){
          const vid = document.createElement('video'); vid.src = src; vid.controls = true; vid.autoplay = true; vid.playsInline = true;
          content.appendChild(vid);
        } else {
          const wrap = document.createElement('div'); wrap.className = 'lb-image';
          const img = document.createElement('img'); img.src = src; img.alt = meta.note||'Project photo';
          wrap.appendChild(img);
          content.appendChild(wrap);
        }
        lb.setAttribute('aria-hidden','false');
      };

      // Build gallery by loading images that exist (onload appends)
      filenames.forEach(src=> addCard(src));

      // Edit mode toggle shows edit buttons
      const editToggle = $('#editMode');
      if(editToggle){
        const set = ()=>{ host.classList.toggle('editing', editToggle.checked); };
        editToggle.addEventListener('change', set); set();
      }

      // Filtering
      const applyFilters = ()=>{
        const activeCat = $('.filters#filtersCat .chip.active')?.getAttribute('data-cat') || 'all';
        $$('.gal-item', host).forEach(item=>{
          const okCat = activeCat==='all' || item.dataset.cat===activeCat;
          item.style.display = okCat ? '' : 'none';
        });
      };

      const wireFilterGroup = (groupSel, attr)=>{
        const grp = $(groupSel); if(!grp) return;
        grp.addEventListener('click', (e)=>{
          if(!(e.target instanceof HTMLElement)) return; if(!e.target.matches('.chip')) return;
          $$('.chip', grp).forEach(c=>c.classList.remove('active')); e.target.classList.add('active');
          applyFilters();
        });
      };
      wireFilterGroup('#filtersCat', 'data-cat');
      // initial filter apply once some images load
      setTimeout(applyFilters, 400);
    },

    // Default tagging for your numbered images
    seedTags(){
      const S = (stage, cat, pair, note='')=>({ stage, cat, pair, note });
      return {
        // Bedroom flooring swap (carpet -> hardwood)
        'images/1.jpeg': S('before','flooring','FLR1','Bedroom before (carpet)'),
        'images/2.jpeg': S('during','flooring','FLR1','Prep and trim removal'),
        'images/3.jpeg': S('after','flooring','FLR1','New hardwood installed'),

        // Small room repaint / refresh
        'images/4.jpeg': S('during','flooring','PAINT1','Wall patching'),
        'images/5.jpeg': S('before','flooring','PAINT1','Before repaint'),
        'images/6.jpeg': S('during','flooring','PAINT1','Prep + patch'),
        'images/7.jpeg': S('after','flooring','PAINT1','Room cleared, ready'),

        // Another room repaint
        'images/8.jpeg': S('before','flooring','PAINT2','Before repaint'),
        'images/9.jpeg': S('during','flooring','PAINT2','Patching'),
        'images/10.jpeg': S('during','flooring','PAINT2','Ceiling fan + prep'),

        // Small room update
        'images/11.jpeg': S('before','flooring','PAINT3','Before repaint'),
        'images/12.jpeg': S('during','flooring','PAINT3','Prep work'),
        'images/13.jpeg': S('during','flooring','PAINT3','Hall/room junction'),
        'images/17.jpeg': S('after','flooring','PAINT3','Finished repaint'),

        // Kitchen flooring refresh
        'images/14.jpeg': S('during','kitchen','KIT1','Kitchen floor install'),
        'images/15.jpeg': S('after','kitchen','KIT1','New vinyl plank floor'),
        'images/16.jpeg': S('after','kitchen','KIT1','Kitchen refreshed'),

        // Basement bathroom renovation
        'images/18.jpeg': S('before','bathroom','BATH1','Old shower + tile'),
        'images/19.jpeg': S('before','bathroom','BATH1','Vanity + toilet (old)'),
        'images/20.jpeg': S('before','bathroom','BATH1','Shower before'),
        'images/21.jpeg': S('before','bathroom','BATH1','Vanity + mirror (old)'),
        'images/30.jpeg': S('during','bathroom','BATH1','Painting and fixtures'),
        'images/43.jpeg': S('after','bathroom','BATH1','New vanity and mirror'),
        'images/44.jpeg': S('after','bathroom','BATH1','New corner shower'),
        'images/45.jpeg': S('after','bathroom','BATH1','Completed bathroom'),

        // Basement finishing + flooring
        'images/22.jpeg': S('before','basement','BASE1','Basement stairwell before'),
        'images/23.jpeg': S('before','basement','BASE1','Old shelving area'),
        'images/24.jpeg': S('before','basement','BASE1','Landing before'),
        'images/25.jpeg': S('during','basement','BASE1','Main room prep'),
        'images/26.jpeg': S('during','basement','BASE1','Closet/nook prep'),
        'images/27.jpeg': S('during','basement','BASE1','Carpet removal'),
        'images/28.jpeg': S('during','basement','BASE1','Stairs + wall patching'),
        'images/29.jpeg': S('during','basement','BASE1','Underlayment roll-out'),
        'images/31.jpeg': S('during','basement','BASE1','Stair wall patching'),
        'images/32.jpeg': S('during','basement','BASE1','Subfloor prep'),
        'images/33.jpeg': S('during','basement','BASE1','Moisture barrier start'),
        'images/34.jpeg': S('during','basement','BASE1','Barrier laid across room'),
        'images/35.jpeg': S('during','basement','BASE1','Layout + laser leveling'),
        'images/36.jpeg': S('after','basement','BASE1','New LVP + painted stairs'),
        'images/37.jpeg': S('after','basement','BASE1','Finished hallway'),
        'images/38.jpeg': S('after','basement','BASE1','Stair nosing + tread'),
        'images/39.jpeg': S('after','basement','BASE1','Finished landing'),
        'images/40.jpeg': S('after','basement','BASE1','Finished room + lights'),
        'images/41.jpeg': S('after','basement','BASE1','Closet + trim complete'),
        'images/42.jpeg': S('after','basement','BASE1','Stairwell complete'),
      };
    },

    handleContactSubmit(e){
      e.preventDefault();
      const form = e.target;
      const data = new FormData(form);
      const summary = data.get('serviceDetails');
      // Mailto fallback for quick demos
      const subject = encodeURIComponent('Quote Request — Reno Riser Construction');
      const body = encodeURIComponent([
        `Name: ${data.get('name')}`,
        `Email: ${data.get('email')}`,
        `Phone: ${data.get('phone')}`,
        `Address: ${data.get('address')}`,
        summary ? `Details: ${summary}` : null,
        data.get('message') ? `Message: ${data.get('message')}` : null,
      ].filter(Boolean).join('\n'));
      $('#formStatus').textContent = 'Opening your mail app…';
      window.location.href = `mailto:renoriser@outlook.com?subject=${subject}&body=${body}`;
      return false;
    },
  };

  // Mount
  document.addEventListener('DOMContentLoaded', ()=> App.init());
})();


