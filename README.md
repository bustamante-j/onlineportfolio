# Blessed Joshua G. Bustamante — Online Portfolio

A responsive five-page portfolio covering my background, deployed websites, tools, social media work, credentials, resume, and contact information.

## Local development

```powershell
npm install
npm run dev
```

Open `http://127.0.0.1:5173/` in a browser.

## Production build

```powershell
npm run build
npm run preview
```

The Vite configuration builds five HTML entry points for static hosting.

## Project structure

- `*.html` — portfolio pages
- `css/style.css` — shared design system and page styles
- `css/home.css` — homepage-only layouts
- `js/script.js` — shared progressive interactions
- `scripts/optimize-images.mjs` — generates responsive AVIF/WebP gallery previews
- `images/` and `documents/` — portfolio media

`npm run dev` and `npm run build` automatically refresh optimized previews for the Side Projects and social-media galleries. The original uploads remain available for full-resolution viewing.

Bootstrap provides navigation and the homepage preview modal. Everything else is plain HTML, CSS, and JavaScript.
