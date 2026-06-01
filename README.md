# Renoriser

Marketing website for **Renoriser — Construction & Technology**, a Hamilton & Burlington renovation company that's also building **RI (Renovation Intelligence)**, an AI design + estimating platform (coming soon).

**Live site:** [renoriser.ca](https://renoriser.ca)

The site is conversion-first, built for a skeptical homeowner researching contractors: every section either builds trust or removes friction toward the two goals — **see the work** and **request a quote**. A forward-looking **Technology** section introduces RI as the company's technology story (currently a *coming soon* teaser).

---

## Stack

- Vanilla HTML, CSS, JavaScript (no frameworks, no build step)
- [Web3Forms](https://web3forms.com) for quote-form submissions
- Google Ads (`gtag`) for conversion tracking
- Hosted statically — deploy anywhere (GitHub Pages, Netlify, Vercel, etc.)

---

## Pages

A multi-page site sharing one stylesheet ([`assets/css/styles.css`](assets/css/styles.css)) and one script ([`assets/js/main.js`](assets/js/main.js)). Each module in the JS feature-detects by element presence, so the single file serves every page.

| File | Description |
|------|-------------|
| `index.html` | Home — hero, trust bar, services overview, work teaser, RI technology teaser, promise/social proof, final CTA, footer |
| `services.html` | Kitchens, bathrooms, basements, flooring & painting (anchored), plus the snow-removal retention note |
| `technology.html` | RI / Renovation Intelligence — full animated product mock, feature rows, teaser video, early-access CTA |
| `work.html` | Portfolio — project-based before/after gallery with lightbox |
| `quote.html` | Quote form (Web3Forms), `?intent=` pre-selection, PIPEDA consent |
| `privacy.html` | Basic PIPEDA privacy policy |

Navigation is deliberately 4 items — **Services · Our Work · Technology · Get a Quote**. Snow removal is intentionally **not** in the nav (see below).

---

## Brand & Design System — "Crisp Blueprint White"

The site shares its visual identity with **RI**: navy + mid-blue + sky on light surfaces, Inter, and a blueprint-grid motif. All tokens live in `:root` at the top of [`assets/css/styles.css`](assets/css/styles.css).

| Token | Value | Use |
|---|---|---|
| `--brand-navy` | `#1c3a5e` | Headings, wordmark, gradient base |
| `--brand` | `#2c5d8f` | Primary accent, links, focus rings |
| `--brand-sky` | `#5b9bd5` | Secondary accent |
| `--ink` / `--ink-muted` | `#0f172a` / `#64748b` | Body / secondary text |
| `--surface` / `--surface-page` / `--surface-page-2` | `#fff` / `#f8fafc` / `#f0f4f8` | Card / page / section backgrounds |
| `--edge` | `#e2e8f0` | Borders |

Primary CTAs use the navy gradient (`--grad-brand`); the blueprint-grid backdrop (`.bp-grid`) appears behind the hero and technology sections.

**Brand lockup:** the RI emblem (`images/ri-mark.jpeg`) + **Renoriser** wordmark + **Construction & Technology** sub-label, in header and footer. The emblem is an off-white JPEG rendered with `mix-blend-mode: multiply` so its background melts into light surfaces. (`images/logo.png` is the legacy "Reno Riser" mark, kept for reference but no longer used.)

---

## Hero

The home hero is a full-bleed photo (`images/BA1.jpeg`) with a dark overlay (for WCAG-AA text contrast) and a slow **Ken Burns** drift so the still feels alive. The drift is CSS-only and disabled under `prefers-reduced-motion`.

To use **video** instead, swap the `<img class="home-hero__bg">` in `index.html` for a `<video class="home-hero__video" id="heroVideo">` (drop your clip at `videos/renoriser-hero.mp4` or reuse `videos/3.mp4`) and re-add the `<button class="hero-pause">`. The CSS and JS for the video path (mobile fallback, pause control, reduced-motion) are already in place.

---

## Services & Snow Removal

Four core trades are promoted: **Kitchens, Bathrooms, Basements, Flooring & Painting**. Homepage service cards link to `services.html#anchor` (not straight to the quote) — the correct funnel depth.

**Snow removal** is positioned as a *retention* service, not a promoted one: a single section on `services.html` (`#snow`) framed as winter coverage for **existing clients**. It's not in the nav and not a homepage card.

---

## Technology / RI section

`technology.html` is the centerpiece for the tech story: an authentic, animated mock of the RI product — a chat pane where you describe a kitchen and a live "Materials & Spec Sheet" builds itself row-by-row with a CAD total that counts up. A compact version of the same mock appears as a teaser on the homepage. The `videos/teaser.mp4` clip plays below as a "Sneak peek."

The **"Request early access"** CTAs link to `quote.html?intent=ri`, which pre-selects the RI project type and pre-fills the message.

---

## Our Work — project-based gallery

The gallery is organized by **project**, so each job shows its before *and* after together (no more "all afters in one pile, all befores in another"). Projects load from [`images/manifest.json`](images/manifest.json).

**Manifest schema:**

```json
{
  "projects": [
    {
      "title": "Kitchen Remodel",
      "location": "Hamilton",
      "type": "Kitchen",
      "after":  ["images/HA1.jpeg", "images/HA2.jpeg"],
      "before": ["images/HB1.jpeg"]
    }
  ]
}
```

- `after` / `before` are ordered lists of file paths under `images/` or `videos/`.
- Any `.mp4` (or `.webm`/`.ogg`) path renders as a video automatically — works in either list.
- The first `after` becomes the card's hero image; the rest show as "+N more".
- Each card features the afters; a **"See before"** toggle reveals that project's before thumbnails. Clicking any photo opens a lightbox with ‹ › arrow + keyboard navigation through the project's full set.

**To add a project:** drop the photos into `images/` and add a project object to the manifest. Filenames are free-form (the old `[Location][Stage][Number]` convention still works but isn't required by the schema).

---

## Quote form

Submissions are sent via [Web3Forms](https://web3forms.com) (free, no backend) with the subject `Quote Request — Renoriser`, and fire a Google Ads conversion event. The access key is the `WEB3FORMS_KEY` constant at the top of [`assets/js/main.js`](assets/js/main.js) — register a new key at [web3forms.com](https://web3forms.com) to change the destination email.

`quote.html` reads a `?intent=` query param (`ri`, `kitchen`, `bathroom`, `basement`, `flooring`) to pre-select the project type and, for RI, pre-fill the message and re-title the form.

A PIPEDA consent line under the form links to `privacy.html`.

---

## Project Structure

```
renoriser2/
├── index.html              ← home (9-section conversion layout)
├── services.html           ← services + snow retention note
├── technology.html         ← RI / Renovation Intelligence
├── work.html               ← before/after project gallery
├── quote.html              ← quote form (Web3Forms + gtag + ?intent=)
├── privacy.html            ← PIPEDA privacy policy
├── assets/
│   ├── css/styles.css      ← "Crisp Blueprint White" design system + all components
│   └── js/main.js          ← nav, hero, reveals, RI mock, quote form, gallery, lightbox
├── images/
│   ├── ri-mark.jpeg        ← RI emblem used in the brand lockup
│   ├── logo.png            ← legacy "Reno Riser" mark (unused)
│   ├── manifest.json       ← project-based gallery index (edit this to add work)
│   ├── BA1.jpeg            ← hero photo
│   └── (project photos, about, etc.)
└── videos/
    ├── 3.mp4               ← available for a video hero
    ├── teaser.mp4          ← RI teaser shown on the Technology page
    └── TA1.mp4, TB1–2.mp4  ← project gallery videos
```

---

## Deployment

No build step — just upload the files.

**GitHub Pages:**
1. Push to `main`
2. Settings → Pages → Source: `main` / `root`
3. Point your domain DNS to GitHub Pages

**Netlify / Vercel:** connect the GitHub repo — works out of the box.

---

## Accessibility & SEO notes

- Full-screen overlay mobile menu with large (≥48px) tap targets.
- `prefers-reduced-motion` disables the hero drift, scroll reveals, and the RI mock animation.
- The lightbox supports Escape to close and arrow keys to navigate.
- Each page has a unique `<title>` and meta description; `privacy.html` is `noindex`.
- Service area copy (Hamilton, Burlington, Ontario) appears in the footer for local SEO.
