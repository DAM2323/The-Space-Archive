# Credits

## Made by

Made by Juan for the 2026 NASA Space Apps Challenge, Lima. Challenge: "Abandoned but not Forgotten: Storytelling about NASA's Discarded Equipment on the Moon and Mars".

## NASA data and resources

Every fact shown in the game comes from one of these sources. The id is the one used in `js/data/sources.js` and next to each fact in `js/data/content.en.js`.

| Id | Source | Link | Used for |
| --- | --- | --- | --- |
| `beyond-earth` | Siddiqi, A. A., "Beyond Earth: A Chronicle of Deep Space Exploration, 1958-2016", NASA SP-2018-4041 | https://www.nasa.gov/history/history-publications-and-resources/nasa-history-series/beyond-earth/ | Opportunity (landing details, 90-sol objective, Heat Shield Rock, 2007 dust storms, Endeavour crater, 2013 distance record), Sojourner (planned lifetimes, 83 days, final contact), the Apollo 17 LRV record, Surveyor 3, Spirit, Viking 2, Pioneer 11 |
| `nasa-mer` | NASA Science, "Mars Exploration Rovers: Spirit and Opportunity" | https://science.nasa.gov/mission/mars-exploration-rovers-spirit-and-opportunity/ | Opportunity (landing date, last contact, total distance), Spirit (end of mission) |
| `nasa-pathfinder` | NASA Science, "Mars Pathfinder" | https://science.nasa.gov/mission/mars-pathfinder/ | Sojourner and Pathfinder (dates, mass, first wheeled vehicle, images, lander name) |
| `nasa-ingenuity` | NASA Science, "Ingenuity Mars Helicopter" | https://science.nasa.gov/mission/mars-2020-perseverance/ingenuity-mars-helicopter/ | Ingenuity (dates, planned test flights, flight totals, mass, rotor span) |
| `nasa-pioneer10` | NASA Science, "Pioneer 10" | https://science.nasa.gov/mission/pioneer-10/ | Pioneer 10 (launch, firsts, Jupiter flyby, power source, last signal, destination, plaque) |
| `nasa-viking1` | NASA Science, "Viking 1" | https://science.nasa.gov/mission/viking-1/ | Viking echo (launch, landing, images, end of the orbiter and the lander) |
| `nasa-near` | NASA Science, "NEAR Shoemaker" | https://science.nasa.gov/mission/near-shoemaker/ | NEAR Shoemaker echo |
| `nasa-insight` | NASA Science, "InSight" | https://science.nasa.gov/mission/insight/ | InSight echo |
| `nasa-dawn` | NASA Science, "Dawn" | https://science.nasa.gov/mission/dawn/ | Dawn echo |
| `nssdca-a15` | NASA NSSDCA, "Apollo 15 Lunar Module / ALSEP" | https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1971-063C | Lunar Roving Vehicle (Apollo 15 EVAs and distances, use within 5 km of the lunar module) |
| `nssdca-a12` | NASA NSSDCA, "Apollo 12 Lunar Module / ALSEP" | https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1969-099C | Surveyor echo (Apollo 12 landing near Surveyor 3) |
| `spaceapps-resources` | NASA Space Apps Challenge 2026, resource list of the challenge "Abandoned but not Forgotten: Storytelling about NASA's Discarded Equipment on the Moon and Mars" | https://www.spaceappschallenge.org/2026/ | The list of machines to cover, the one-line descriptions on the Wall of Names, and one line each for the LRVs, the Surveyor landers, Viking 1 and 2 and Dawn |

Not cited yet, so not shown as a fact in the game: the Apollo 17 fender repair (the fact and its puzzle stay hidden until a source is added).

The black hole frame of the story is narrative fiction based on general relativity. It is not a NASA claim and no NASA source is cited for it.

## Other references and external resources

- No space agency partner data is used.
- No third-party code, libraries, frameworks, fonts, audio files or video are used. The game is plain HTML, CSS and JavaScript written for this project.
- The only image files are sixteen AI-generated illustrations, the AI-generated project logo and the icons and link preview image derived from it (see "Use of AI tools"). No photos and no images from NASA or from other people are used.
- Text is drawn with the monospace font already installed on the player's device. No font file is included or downloaded.
- All pixel art (sprites and backgrounds) is drawn from small pixel maps in the code. All sound is synthesized in the browser with the Web Audio API.
- The game makes no network requests while it runs.
- No NASA logos, insignia, flags, mission patches or other NASA brand elements are used. NASA is named only in text, to cite sources.
- No photos and no likeness of any real person are used.
- Energy, moves, timers, scores and stars are game values, not mission data. They are labeled as game values on screen.

## Use of AI tools

AI coding assistants (Claude Code) were used to write the code, to produce the pixel art (as pixel maps in code) and the synthesized sound, to draft and translate the game text, to draft the documentation, and to help check the game text against the sources.

The idea, the story frame, the choice of machines, the rules and the list of allowed facts were defined by the developer, who reviewed the result.

Sixteen illustrations in `Images/` were made with an AI image tool and reviewed by Juan: the Lunar Roving Vehicle, Pioneer 10, Sojourner, Opportunity, Ingenuity, Surveyor 3, Viking 1, NEAR Shoemaker, InSight, Spirit, Dawn, the Apollo lunar module, ALSEP, Phoenix, Kepler and Pioneer 11. They were cleaned before use: the nameplate with a logo and a name was cropped out of every picture, the flags on the Lunar Roving Vehicle and the flag and country name on the lunar module were painted over, and the text labels on the ALSEP picture were painted out. They were then optimized for the web (WebP, 960x540, each under 150 KB, about 1.63 MB in total). Each picture carries a small "AI art" badge in its top right corner. They are illustrations, not photos and not NASA images, and some details differ from the real machines and places.

The project logo, `Images/logo.webp`, was also made with an AI image tool and reviewed by Juan. It is used only as the banner at the top of README.md (marked "AI art" there), not in the game. It was optimized for the web (WebP, 960x640, about 51 KB).

The favicon and the home screen icon (`favicon.ico` and the files in `icons/`) are derived from the AI-generated logo. The link preview image, `Images/social.png` (1200x630), is the same AI-generated logo placed on a dark background. Both are AI art, not photos and not NASA images.

Screens that show only pixel sprites carry no badge.

## License

Code and content: Apache-2.0, see LICENSE.

Not affiliated with or endorsed by NASA.
