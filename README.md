# The Space Archive

*Abandoned, but not forgotten.*

## Concept

The Space Archive is a short educational pixel-art browser game made for the 2026 NASA Space Apps Challenge (Lima), challenge "Abandoned but Not Forgotten: Storytelling about NASA's Discarded Equipment on the Moon and Mars". The player is an astronaut who orbits a black hole, arrives at The Archive and lives the real stories of five machines: the Apollo Lunar Roving Vehicle, Voyager, Sojourner, Opportunity and Ingenuity.

Narrative fiction. The physics is real: near a black hole, time runs slower, so you can only travel toward the future.

## How to play

- Mouse or touch: point at a machine in The Archive and click or tap it. Click or tap to advance the story.
- Keyboard: arrow keys to aim, Enter to select, Space or Enter to advance text, Esc to go back.
- Options (title screen): sound, volume, text size, reduced motion, language, reset progress.

## Status

Work in progress. Done so far: the engine (fixed-step loop, scene manager, integer-scaled 320x180 pixel canvas, input, WebAudio sound, saved settings and progress), the title screen with options, the black hole intro, The Archive hub with five machines, portal transitions, story scenes and the "What really happened" cards. Next: the mini-games.

## How to run

The game uses ES modules, so it needs a static server. From the repo root run:

```sh
python3 -m http.server 8000
```

Then open http://localhost:8000 . Any static server works.

To open a scene directly, add a URL hash: `#title`, `#intro`, `#hub`, a machine id (`#opportunity`, `#ingenuity`, `#sojourner`, `#lrv`, `#voyager`) or `#debrief:opportunity`.

## How to deploy

Deploy to any static host (GitHub Pages, Netlify or Vercel). There is no build step: publish the repo root.

## Tech notes

- Plain HTML, CSS and JavaScript ES modules.
- No frameworks, no build step, no dependencies.
- No external assets and no network calls at runtime.
- All art is generated in code from small pixel maps.
- Text is a DOM overlay over the canvas.

File tree:

```
index.html
css/style.css
js/main.js
js/state.js
js/engine/   loop.js, scenes.js, render.js, input.js, audio.js, storage.js, i18n.js, fx.js, ui.js
js/scenes/   title.js, options.js, intro.js, hub.js, portal.js, story.js, debrief.js
js/data/     palette.js, sprites.js, content.en.js, sources.js
```

## How AI tools were used

This project is built by a solo developer with the help of AI coding assistants (Claude Code) for code, pixel-art generation in code and text drafting. All mission facts come from the cited NASA sources and are checked by the developer.

## License

Apache-2.0, see LICENSE.

Not affiliated with or endorsed by NASA.
