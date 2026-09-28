# Birthday Surprise — Clean React + Vite + npm

This is a standalone React project rebuilt from the birthday surprise with no Next.js, Cloudflare, Wrangler, pnpm, ChatGPT Work runtime, or shadcn dependency.

## Run locally

```bash
npm install
npm run dev
```

Vite will show a local URL, normally `http://localhost:5173`.

## Build

```bash
npm run build
```

The production site is created in `dist/`.

## Netlify

This project includes `netlify.toml`, so Netlify can use:

- Build command: `npm run build`
- Publish directory: `dist`

No `NETLIFY_NEXT_PLUGIN_SKIP` variable is needed because this project does not include Next.js.

## Add the Little moments photos

Put the photos here:

- `public/photos/moment-1.jpg`
- `public/photos/moment-2.jpg`

The site will automatically use those two files. If they are missing, the Polaroid viewer shows a placeholder instead.

## Change the birthday name

Edit `src/birthday-content.js` and change:

```js
name: "lovely you"
```
