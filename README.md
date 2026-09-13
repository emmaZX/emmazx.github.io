# Emma Xuan Portfolio

## Setup for GitHub Pages

1. Upload all files to the root of your `YOURUSERNAME.github.io` repo
2. Keep folder structure exactly as-is
3. Enable Pages: Settings > Pages > Deploy from branch > main

## Adding your photos

Replace the placeholder divs in `index.html` and `about.html`:

```html
<!-- Remove this: -->
<span style="font-size:2.5rem">🌿</span>
<span>add your photo here...</span>

<!-- Replace with: -->
<img src="images/headshot.jpg" alt="Emma Xuan">
```

## Embedding a YouTube video in a modal

In `js/main.js`, find the project in `modalData` and add a `video` field:

```js
basil: {
  ...
  video: 'https://www.youtube.com/embed/YOUR_VIDEO_ID',
  ...
}
```

Get the embed URL from YouTube: Share > Embed > copy the `src` URL (starts with `https://www.youtube.com/embed/`).

Upload unlisted videos if you don't want them publicly searchable.

## Updating social links

Search for `YOUR_LINKEDIN` and `YOUR_GITHUB` in all HTML files and replace.

## Study page: background, Spotify, todos, notes

- **Background:** `images/study-room.webp` is the full-page backdrop on `study.html`.
- **Spotify:** In Spotify → **Share** → **Embed** → copy the iframe `src` into `study.html`.
- **Todos & notes:** Saved in the browser with `localStorage` (keys `studyTodos-v1` and `studyNotes-v1`). They stay on this device and this browser profile only; clearing site data removes them. No server or account required.

## File structure

```
/
├── index.html
├── about.html
├── projects.html
├── study.html
├── goals.html          ← redirects to study.html (old bookmarks)
├── resume.html
├── favicon.png
├── css/style.css
├── js/main.js
├── js/study.js
├── images/          ← photos + study-room.webp (study backdrop)
└── downloads/       ← resume PDFs (already included)
    ├── Emma_Xuan_Cyber_Resume.pdf
    └── Emma_Xuan_CS_Resume.pdf
```
