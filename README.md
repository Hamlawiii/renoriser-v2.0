# Reno Riser Construction

Website for Reno Riser Construction — a Hamilton & Burlington based renovation and snow removal company.

**Live site:** [renoriser.ca](https://renoriser.ca)

---

## Stack

- Vanilla HTML, CSS, JavaScript (no frameworks, no build step)
- [Web3Forms](https://web3forms.com) for contact form submissions
- Google Ads (`gtag`) for conversion tracking
- Hosted statically — deploy anywhere (GitHub Pages, Netlify, Vercel, etc.)

---

## Pages

| File | Description |
|------|-------------|
| `index.html` | Home — hero, services, snow plans, about, contact form |
| `work.html` | Portfolio — location cards + photo/video gallery |

---

## Project Structure

```
renoriser2/
├── index.html
├── work.html
├── assets/
│   ├── css/styles.css
│   └── js/main.js
├── images/
│   ├── manifest.json       ← gallery index (edit this when adding photos)
│   ├── HA1.jpeg … HA12.jpeg   Hamilton job 1 — after
│   ├── HB1.jpeg … HB9.jpeg    Hamilton job 1 — before
│   ├── TA1.jpeg, TB1–2.jpeg   Hamilton job 2
│   ├── BA1.jpeg … BA5.jpeg    Burlington — after
│   ├── BB1.jpeg … BB5.jpeg    Burlington — before
│   └── (icons, logo, etc.)
└── videos/
    ├── 3.mp4               ← hero background video
    ├── TA1.mp4
    ├── TB1.mp4
    └── TB2.mp4
```

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

Form submissions are sent via [Web3Forms](https://web3forms.com) (free, no backend required).

The access key is set at the top of `assets/js/main.js`. To change the destination email, register a new key at [web3forms.com](https://web3forms.com) and replace the `WEB3FORMS_KEY` value.

---

## Deployment

No build step needed — just upload the files.

**GitHub Pages:**
1. Push to `main`
2. Go to repo Settings → Pages → Source: `main` / `root`
3. Point your domain DNS to GitHub Pages

**Netlify / Vercel:**
Connect the GitHub repo — works out of the box.

---

## Services

- Snow Removal (Basic, Standard, Premium, Commercial plans)
- Kitchen Cabinet Installation
- Bathroom Renovations
- Basement Finishing
- Flooring & Painting

**Service areas:** Hamilton and Burlington, Ontario
