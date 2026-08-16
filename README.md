# Blessed Joshua G. Bustamante — Online Portfolio

A responsive eight-page portfolio covering my background, skills, experience, projects, credentials, resume, and contact information.

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

The Vite configuration builds all eight HTML entry points for static hosting.

## Project structure

- `*.html` — portfolio pages
- `css/style.css` — shared design system and page styles
- `css/home.css` — homepage-only layouts
- `js/script.js` — shared progressive interactions
- `images/` and `documents/` — portfolio media

Bootstrap provides navigation and the homepage preview modal. Everything else is plain HTML, CSS, and JavaScript.
