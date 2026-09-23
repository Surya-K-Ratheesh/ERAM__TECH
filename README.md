# Eram Tech Website

Multi-page static website for Eram Tech / Eram Aluminum.

## Routes

- `/` Home
- `/about/` About
- `/products/` Products overview
- `/products/windows/`
- `/products/doors/`
- `/products/cladding/`
- `/products/hand-rails/`
- `/products/sky-light/`
- `/products/garage-doors/`
- `/products/rollup-shutters/`
- `/projects/`
- `/contact/`

## Deploying to Vercel

1. Import this repository into Vercel.
2. Use the repository root as the project root.
3. No build command is required for the current static site.
4. Deploy. The included `vercel.json` keeps trailing slashes on routes so directory-style pages work cleanly.

## Local Preview

Run `python -m http.server 3000 --bind 127.0.0.1` from the repository root, then open `http://127.0.0.1:3000/`.

## Notes

- Each route is a separate static HTML document, including all seven product categories.
- Shared pages use `architecture.css`, `editorial.css` and `architecture.js`. The older `styles.css` and `script.js` are not loaded.
- The home page adds `hero-3d.css` and `hero-3d.js`: a locally rendered, illustrative entrance model with live finish selection, a pivoting door, horizontal drag and a keyboard-accessible rotation slider. Three.js 0.180.0 is pinned locally under `assets/vendor/three/`, including its MIT license. No build step is needed.
- The 3D renderer loads near the viewport, limits pixel density and stops rendering when idle or out of view. Reduced motion skips interpolated movement. A static illustration remains available without WebGL.
- Navigation links remain side by side and pinned while scrolling on mobile. Product categories are reached through the Products page, not a dropdown.
- The office photograph is shown at its original proportions with no cover crop, overlay or transform. Its height follows its width naturally.
- Product pages have clearly marked expansion areas for approved images, specs, and descriptions. Project case studies are placeholders, not completed-project claims.
- The contact form prepares an email in the visitor's email app; it does not send messages through a backend.
- Interface text is English. The original office photograph retains its real signage.
- `tests/responsive.cjs` checks routes, image proportions, internal links and mobile navigation using Playwright and installed Microsoft Edge. Set `PLAYWRIGHT_PATH` if Playwright is outside the default module path.
