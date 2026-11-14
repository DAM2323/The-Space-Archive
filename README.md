# The Space Archive

*Abandoned, but not forgotten.*

## Concept

The Space Archive is a short educational pixel-art browser game made for the 2026 NASA Space Apps Challenge (Lima), challenge "Abandoned but Not Forgotten: Storytelling about NASA's Discarded Equipment on the Moon and Mars". The player is an astronaut who orbits a black hole, arrives at The Archive and lives the real stories of five machines: the Apollo Lunar Roving Vehicle, Voyager, Sojourner, Opportunity and Ingenuity.

Narrative fiction. The physics is real: near a black hole, time runs slower, so you can only travel toward the future.

## How to play

- Mouse or touch: point at a machine in The Archive and click or tap it. Click or tap to advance the story.
- Keyboard: arrow keys to aim, Enter to select, Space or Enter to advance text, Esc to go back.
- Options (title screen): sound, volume, text size, reduced motion, language, reset progress.
- Opportunity mini-game: each turn choose Drive, Science or Rest. Driving and science cost energy, the Sun charges you, dust reduces sunlight. Energy, costs and stars are game values, not mission data. Esc or the Pause button pauses.
- Ingenuity mini-game: hold the button (or Space) to spin the rotors and climb, release to descend. Keep the whole helicopter inside the marked zone until the bar fills, then land softly.
- Sojourner mini-game: move one square at a time with the arrow keys, the on-screen arrows, or by tapping next to the rover. Go around the rocks and reach the three targets. You have a few moves each sol.
- Lunar Roving Vehicle mini-game: hold the button (or Space) to drive, release to slow down. Stop next to each flag and slow down for craters.
- Voyager mini-game: switch instruments on or off to stay inside the power budget, then let time pass. Every number and name in this level is a game value.
- Science Room: open it from The Archive (the button at the top, or "Enter the Science Room" when all five machines are archived). Credits and sources are on the title screen and inside the Science Room. Options are also available from the Pause menu in every mini-game.

## Status

Playable from start to finish: title screen with options, black hole intro, The Archive hub, portal transitions, story scenes, a mini-game for each of the five machines, the "What really happened" cards, the Science Room and the credits. Remaining before submission: final fact check, source links, deployment and screenshots.

## How to run

The game uses ES modules, so it needs a static server. From the repo root run:

```sh
python3 -m http.server 8000
```

Then open http://localhost:8000 . Any static server works.

To open a scene directly, add a URL hash: `#title`, `#intro`, `#hub`, `#science`, `#credits`, a machine id (`#opportunity`, `#ingenuity`, `#sojourner`, `#lrv`, `#voyager`) or `#debrief:opportunity`.

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
js/scenes/   title.js, options.js, intro.js, hub.js, portal.js, story.js, game.js, debrief.js, science.js, credits.js
js/minigames/ index.js, common.js, opportunity.js, ingenuity.js, sojourner.js, lrv.js, voyager.js
js/data/     palette.js, sprites.js, content.en.js, sources.js
```

## Facts and sources

Every fact shown to the player comes from the project's content pack and carries a source id (see js/data/sources.js and CREDITS.md). A fact whose source is marked `needsSource: true` is hidden from the player until a citation is added: add the url and delete `needsSource: true` from that source. Numbers that belong to gameplay are marked `// GAME VALUE` in the code and labeled as game values on screen.

## How AI tools were used

This project is built by a solo developer with the help of AI coding assistants (Claude Code) for code, pixel-art generation in code and text drafting. All mission facts come from the cited NASA sources and are checked by the developer.

## License

Apache-2.0, see LICENSE.

Not affiliated with or endorsed by NASA.
