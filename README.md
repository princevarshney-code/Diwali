# Royal Deepawali

A small, dark, gold-on-umber Deepawali greeting: read the mantras, light five diyas, and open a blessing with fireworks.

## Run it
Open `index.html` in any modern browser (double-click it). No server, build step or internet connection is needed.

## What it does
- Landing page with शुभ दीपावली, the Gayatri Mantra and the Lakshmi prayer with English meanings.
- **Play the Diwali Game** opens the five-diya game (mouse, touch and keyboard). Each diya lights once; progress reads "N of 5 diyas lit".
- Lighting the fifth diya opens the greeting with canvas fireworks behind it. Close, or **Celebrate Again** to replay.
- Sound toggle (top right), an **Enable sound** button if the browser blocks playback, and `prefers-reduced-motion` support (no firework animation).

## Sound: you must add the audio files
**This ZIP contains no audio recordings.** The code plays only real recorded clips and never synthesises sound.
Until you add the files below, the site works silently and the toggle reads "Sound unavailable".

Place these in `assets/audio/` (exact names):
- `fireworks-crackling.mp3`
- `distant-fireworks.mp3`
- `diya-bell.mp3` (optional soft chime)

You can supply just one or two of them. See `ASSETS-LICENSES.md` for where to find suitably licensed clips and what to record there.

## Files
`index.html`, `css/style.css`, `js/` (`audio.js`, `fireworks.js`, `game.js`, `main.js`), `assets/fonts/` (OFL-licensed Cormorant Garamond and Noto Serif Devanagari, bundled so Devanagari renders offline).
