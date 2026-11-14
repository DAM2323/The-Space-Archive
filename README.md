# The Space Archive

*Abandoned, but not forgotten.*

## Concept

The Space Archive is a short educational pixel-art browser game made for the 2026 NASA Space Apps Challenge (Lima), challenge "Abandoned but Not Forgotten: Storytelling about NASA's Discarded Equipment on the Moon and Mars". The player is an astronaut who orbits a black hole, arrives at The Archive and lives the real stories of five machines: the Apollo Lunar Roving Vehicle, Voyager, Sojourner, Opportunity and Ingenuity.

Narrative fiction. The physics is real: near a black hole, time runs slower, so you can only travel toward the future.

## Status

Work in progress. Milestone M0 is done: project scaffold, fixed-step game loop, scene manager with fade transitions, integer-scaled 320x180 pixel canvas, 16-color palette and the title screen.

## How to run

The game uses ES modules, so it needs a static server. From the repo root run:

```sh
python3 -m http.server 8000
```

Then open http://localhost:8000 . Any static server works.

To open a scene directly, add a URL hash such as `#title`, for example http://localhost:8000/#title .

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
css/
  style.css
js/
  main.js
  state.js
  engine/
    loop.js
    scenes.js
    render.js
    fx.js
    ui.js
    i18n.js
  scenes/
    title.js
  data/
    palette.js
    sprites.js
    content.en.js
```

## How AI tools were used

This project is built by a solo developer with the help of AI coding assistants (Claude Code) for code, pixel-art generation in code and text drafting. All mission facts come from the cited NASA sources and are checked by the developer.

## License

Apache-2.0, see LICENSE.

Not affiliated with or endorsed by NASA.
