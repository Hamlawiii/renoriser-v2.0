# Renoriser

Marketing website for **Renoriser — Construction & Technology**, a Hamilton & Burlington based renovation and snow-removal company that's also building **RI (Renovation Intelligence)**, an AI design + estimating platform (coming soon).

**Live site:** [renoriser.ca](https://renoriser.ca)

The site is intentionally split in tone: established trades work up front (services, portfolio, snow plans), and a forward-looking **Technology** section that introduces RI as the company's technology story — currently a *coming soon* teaser.

---

## Stack

- Vanilla HTML, CSS, JavaScript (no frameworks, no build step)
- [Web3Forms](https://web3forms.com) for contact-form submissions
- Google Ads (`gtag`) for conversion tracking
- Hosted statically — deploy anywhere (GitHub Pages, Netlify, Vercel, etc.)

---

## Brand & Design System — "Crisp Blueprint White"

The site shares its visual identity with **RI**: navy + mid-blue + sky on light surfaces, Inter, and a blueprint-grid motif.

| Token | Value | Use |
|---|---|---|
| `--navy` | `#1c3a5e` | Headings, wordmark, gradient base |
| `--brand` | `#2c5d8f` | Primary accent, links, focus rings |
| `--sky` | `#5b9bd5` | Secondary accent |
| `--ink` / `--ink-muted` | `#0f172a` / `#64748b` | Body / secondary text |
| `--page` / `--canvas` / `--surface` | `#f8fafc` / `#f0f4f8` / `#fff` | Page / section / card backgrounds |
| `--edge` | `#e2e8f0` | Borders |

All tokens live in `:root` at the top of [`assets/css/styles.css`](assets/css/styles.css). Primary CTAs use the navy gradient (`--grad-navy`); cards use the layered `--shadow-card`; the hero and Technology sections use the blueprint-grid + mesh-gradient backdrop.

**Brand lockup:** the RI emblem (`images/ri-mark.jpeg`) + **Renoriser** wordmark + **Construction & Technology** sub-label, in both header and footer. The emblem is an off-white JPEG rendered with `mix-blend-mode: multiply` so its background melts into light surfaces. (`images/logo.png` is the legacy "Reno Riser" mark, kept for reference but no longer used.)

---

## Pages

| File | Description |
|------|-------------|
| `index.html` | Home — hero, services, snow plans, about, **Technology (RI teaser)**, contact form |
| `work.html` | Portfolio — location cards + photo/video gallery |

---

## The Technology / RI section

The `#technology` section on `index.html` positions Renoriser as a Construction **& Technology** company and teases RI. The framed media slot plays the teaser at `videos/teaser.mp4`:

```html
<video class="hero-video" autoplay muted playsinline loop controls preload="metadata">
  <source src="videos/teaser.mp4" type="video/mp4" />
</video>
```

It autoplays muted (so it previews silently) and loops, with native controls so visitors can unmute, scrub, or replay. The frame has a navy background, so there's no white flash before the first frame paints — no poster image is required. To swap the teaser later, just replace `videos/teaser.mp4` (or change the `<source>` path).

The **"Request early access"** button scrolls to the contact form and pre-fills the message, so interest is captured through the existing Web3Forms flow — no backend required.

---

## Adding New Project Photos

Photos are loaded from `images/manifest.json` — just a plain list, no magic.

**Naming convention:**

```
[Location][Stage][Number].jpeg

Location:  H = Hamilton job 1 | T = Hamilton job 2 | B = Burlington
Stage:     A = After           | B = Before
Number:    1, 2, 3 …

Examples:  HA13.jpeg  (Hamilton job 1, after, photo 13)
           BB6.jpeg   (Burlington, before, photo 6)
```

**Steps to add photos:**

1. Drop the image files into `images/` using the naming convention above.
2. Open `images/manifest.json` and add an entry in the correct location block:

   ```json
   { "type": "img", "src": "images/HA13.jpeg", "stage": "A" }
   ```

Use `"stage": "A"` for After photos and `"stage": "B"` for Before. Videos follow the same pattern with `"type": "video"` and a path under `videos/`.

---

## Contact Form

Form submissions are sent via [Web3Forms](https://web3forms.com) (free, no backend required). The submission subject is `Quote Request — Renoriser`.

The access key is set at the top of `assets/js/main.js`. To change the destination email, register a new key at [web3forms.com](https://web3forms.com) and replace the `WEB3FORMS_KEY` value.

---

## Project Structure

```
renoriser2/
├── index.html              ← hero, services, snow, about, technology (RI teaser), contact
├── work.html               ← portfolio gallery
├── assets/
│   ├── css/styles.css      ← "Crisp Blueprint White" design system (tokens in :root)
│   └── js/main.js          ← drawer, snow builder, contact form, gallery, lightbox
├── images/
│   ├── ri-mark.jpeg        ← RI emblem used in the brand lockup (shared with RI)
│   ├── logo.png            ← legacy "Reno Riser" mark (unused)
│   ├── manifest.json       ← gallery index (edit this when adding photos)
│   ├── HA*/HB*/TA*/TB*/BA*/BB*.jpeg   ← project photos (see naming convention)
│   └── (service icons, about, etc.)
└── videos/
    ├── 3.mp4               ← hero background video
    ├── teaser.mp4          ← RI teaser shown in the Technology section
    └── TA1.mp4, TB1–2.mp4
```

---

## Deployment

No build step needed — just upload the files.

**GitHub Pages:**
1. Push to `main`
2. Settings → Pages → Source: `main` / `root`
3. Point your domain DNS to GitHub Pages

**Netlify / Vercel:** connect the GitHub repo — works out of the box.

---

## Services

- Snow Removal (Basic, Standard, Premium, Commercial plans)
- Kitchen Cabinet Installation
- Bathroom Renovations
- Basement Finishing
- Flooring & Painting

**Service areas:** Hamilton and Burlington, Ontario
