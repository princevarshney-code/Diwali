# Testing checklist

Automated run in headless Chromium (desktop 1280×800 and mobile 390×800, `file://`):

- [x] Landing page loads; Hindi and Sanskrit render (fonts bundled)
- [x] Play button opens the game panel without reload
- [x] All five diyas light; progress goes 1→5 of 5; clicking a lit diya again adds nothing
- [x] Completion fires once and opens the greeting; game panel closes
- [x] Fireworks animate on canvas behind the greeting
- [x] Celebrate Again resets to "0 of 5" and reopens the game; Escape closes the panel
- [x] No horizontal scroll at 390px wide
- [x] No JavaScript errors
- [ ] **Real recorded audio: NOT tested, no audio files are included.** Add them, then check:
  - [ ] Clips play after the final diya is lit
  - [ ] Sound toggle mutes and unmutes
  - [ ] Closing the greeting fades the sound out
  - [ ] "Enable sound" appears if the browser blocks playback (not testable in headless Chromium)
- [ ] Not tested on real iOS/Android devices or Safari/Firefox

Known note: while the audio files are absent, the browser console logs three "file not found" resource messages. These disappear once the files are added.
