# Submission draft: The Space Archive

Draft prepared with AI assistance. Review every text before pasting it into the form.

- Project name: **The Space Archive**
- Slogan: **Abandoned, but not forgotten.**
- Challenge: Abandoned but not Forgotten: Storytelling about NASA's Discarded Equipment on the Moon and Mars (2026 theme: The Next Frontier)
- Team: The Space Archive, Local Event Lima. Members: Juan David Porras Aliano.

## Form fields

### Project Name

The Space Archive

### High-Level Project Summary

The Space Archive is a short pixel-art browser game about the machines NASA left behind on the Moon, on Mars and in deep space. You play an astronaut who orbits a black hole and arrives at The Archive, where five forgotten machines float as ghosts: Opportunity, Ingenuity, Sojourner, the Lunar Roving Vehicle and Pioneer 10. You live each real story through a mini-game built on one real engineering problem, and a card then shows what really happened, with its NASA source. Six more machines appear as short fact cards and five more on a Wall of Names, so every item of the official resource list is in the game. It matters because these machines are easy to forget, and their stories teach how engineering becomes science. The project introduces school-age space enthusiasts to the hardware left on the Moon, on Mars and in deep space, and to the science it made possible. Instead of listing facts, it shows how each mission operated through a mini-game based on one real engineering problem, and every fact has a visible source.

### Link to Project Demo

https://dam2323.github.io/The-Space-Archive/docs/demo/The-Space-Archive-demo.pdf (7-slide deck)

### Link to Final Project

Playable game: https://dam2323.github.io/The-Space-Archive/

Code (repository): https://github.com/DAM2323/The-Space-Archive

### Detailed Project Description

**What it does.** The Space Archive tells the real stories of machines that were left behind. The player flies an astronaut around The Archive and chooses a machine. Each of the five main machines has a short story, a mini-game and a "What really happened" card:

- Opportunity, "Beyond Sol 90": manage energy by choosing to drive, do science or rest while dust reduces sunlight. The mission objective was 90 sols; the game ends, as the mission did, with the last contact on 10 June 2018.
- Ingenuity, "Wright Brothers Field": take off, hover and land. It was a technology demo planned for no more than five test flights; it completed 72.
- Sojourner, "Slow and Steady": move around rocks with a few moves each sol. It was the first wheeled vehicle used on any planet.
- Lunar Roving Vehicle, "Moon Drive": drive the three Apollo 15 EVAs (10.3 km, 12.5 km and 5.1 km), stop at flags and slow down for craters.
- Pioneer 10, "Power Budget": keep the transmitter and the instruments inside a shrinking power budget until the last signal on 23 January 2003.

Six "echoes" (Surveyor landers, Viking 1 and 2, NEAR Shoemaker, InSight, Spirit and Dawn) open as fact cards, and a Wall of Names lists the Apollo Lunar Modules, ALSEP, Phoenix, Kepler and Pioneer 11 with their official one-line descriptions. A Science Room links how each machine was built to what it gave us.

**How it works.** The real ending of each machine cannot be changed by the player. Every fact on screen has a visible source. Numbers that belong to gameplay (energy, moves, scores, stars) are labeled as game values, so they are never confused with mission data. The frame story is fiction based on general relativity, not a NASA claim, and the credits say so: the astronaut only orbits the black hole, and the intro shows two clocks to explain why she can only travel toward the future.

**Benefits.** It is free, runs in a browser with no install, and is short (10 to 15 minutes). It is available in English and Spanish, and it works with keyboard, mouse and touch. It has options for text size, sound and reduced motion.

**What we hope to achieve.** We want players aged about 8 to 16 to remember these machines by name, to understand one real engineering problem behind each, and to see where every fact comes from.

**Tools, languages and hardware.** Plain HTML, CSS and JavaScript (ES modules). No frameworks, no build step and no libraries: the pixel art is drawn from pixel maps in code, the sound is synthesized with the Web Audio API, and sixteen illustrations made with an AI image tool are stored as WebP files. The game is about 2.0 MB and makes no network requests while it runs. It was tested in desktop browser windows and in phone-sized browser windows with touch input. AI coding assistants were used; see "Use of Super Intelligence".

### Use of Super Intelligence (SI)

Yes. AI (Super Intelligence, SI) coding assistants (Claude Code) were used to write the code, to produce the pixel art (as pixel maps in code) and the synthesized sound, to draft and translate the game text, to draft the documentation, and to help check the game text against the sources. Sixteen illustrations of the machines were made with an AI image tool, reviewed by the developer, cleaned of logos, flags and text, and optimized for the web; each is shown with a visible "AI art" badge. The project logo, and the favicon and link preview image derived from it, were also made with an AI image tool (the logo is marked "AI art" where it is shown). The idea, the story frame, the choice of machines, the rules and the list of allowed facts were defined by the developer, who reviewed the result. The README and CREDITS.md describe the AI use, and the page metadata states it. No NASA logos, flags, insignia or mission identifiers appear in the game.

### NASA Data

All facts in the game come from these NASA resources (full table with what each one was used for: CREDITS.md):

- Siddiqi, A. A., "Beyond Earth: A Chronicle of Deep Space Exploration, 1958-2016", NASA SP-2018-4041: https://www.nasa.gov/history/history-publications-and-resources/nasa-history-series/beyond-earth/ (Opportunity, Sojourner, the Apollo 17 LRV record, Surveyor 3, Spirit)
- NASA Science, "Mars Exploration Rovers: Spirit and Opportunity": https://science.nasa.gov/mission/mars-exploration-rovers-spirit-and-opportunity/
- NASA Science, "Mars Pathfinder": https://science.nasa.gov/mission/mars-pathfinder/
- NASA Science, "Ingenuity Mars Helicopter": https://science.nasa.gov/mission/mars-2020-perseverance/ingenuity-mars-helicopter/
- NASA Science, "Pioneer 10": https://science.nasa.gov/mission/pioneer-10/
- NASA Science, "Viking 1": https://science.nasa.gov/mission/viking-1/
- NASA Science, "NEAR Shoemaker": https://science.nasa.gov/mission/near-shoemaker/
- NASA Science, "InSight": https://science.nasa.gov/mission/insight/
- NASA Science, "Dawn": https://science.nasa.gov/mission/dawn/
- NASA NSSDCA, "Apollo 15 Lunar Module / ALSEP": https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1971-063C (Lunar Roving Vehicle on Apollo 15)
- NASA NSSDCA, "Apollo 12 Lunar Module / ALSEP": https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1969-099C (Apollo 12 landing near Surveyor 3)
- NASA Space Apps Challenge 2026, resource list of the challenge "Abandoned but not Forgotten: Storytelling about NASA's Discarded Equipment on the Moon and Mars": https://www.spaceappschallenge.org/2026/challenges/nasas-discarded-equipment-storytelling/?tab=details (the list of machines and their one-line descriptions)

### Space Agency Partner Data and Other References

- Space agency partner data: none.
- Code: original, written for this project with AI coding assistants. No third-party libraries, frameworks or code snippets.
- Images: none from other sources. The pixel art is generated in code, and sixteen illustrations were made with an AI image tool. Each illustration carries an "AI art" badge. The project logo and the favicon derived from it were also made with an AI image tool.
- Audio: none from other sources. All sound is synthesized in the browser (Web Audio API).
- Fonts: none included. The game uses the monospace font installed on the player's device.
- Text: written for this project. Facts come from the NASA resources listed under "NASA Data".
- Tools: Claude Code (AI coding assistant), Git and GitHub, a web browser, and GitHub Pages for hosting.
- License of this project: Apache-2.0.

## Demo option A: 30-second video script

The limit is 30 seconds. Going over makes the project ineligible for Global Judging. Add English subtitles if you speak in Spanish.

| Time | On screen | Voice-over (about 70 words) |
| --- | --- | --- |
| 0:00 - 0:02 | Title screen | "I am Juan, The Space Archive, from Lima." |
| 0:02 - 0:05 | Text: Abandoned but not Forgotten: Storytelling about NASA's Discarded Equipment on the Moon and Mars | "Our challenge: Abandoned but not Forgotten: Storytelling about NASA's Discarded Equipment on the Moon and Mars. What happens to the machines we leave behind?" |
| 0:05 - 0:10 | Logo and slogan | "This is The Space Archive. Abandoned, but not forgotten." |
| 0:10 - 0:20 | Black hole intro, The Archive, the Opportunity game, a fact card with its source | "You orbit a black hole, reach The Archive, and live five real stories as mini-games. Every fact comes from NASA sources and shows its source. The real endings cannot be changed." |
| 0:20 - 0:30 | Echoes, Wall of Names, "The Archive is complete" | "Every machine on the official list is here. Next: more stories, more languages, and classrooms. So they are never forgotten." |

## Demo option B: 7 slides

The limit is 7 slides, including the title. Keep the font large and the words few.

1. **Title.** The Space Archive. "Abandoned, but not forgotten." Screenshot of the title screen.
2. **Team and challenge.** The Space Archive, Lima. Member: Juan David Porras Aliano. Challenge: Abandoned but not Forgotten: Storytelling about NASA's Discarded Equipment on the Moon and Mars.
3. **The idea.** An astronaut orbits a black hole and arrives at The Archive, where forgotten machines float as ghosts. Screenshot of The Archive.
4. **How it works.** Five stories, five mini-games, each built on one real engineering problem. The real ending cannot be changed. Screenshot of the Opportunity game.
5. **NASA data used.** Beyond Earth (NASA SP-2018-4041), NASA Science mission pages, NSSDCA, the challenge resource list. Every fact shows its source. Screenshot of a "What really happened" card.
6. **User experience.** Browser game, no install, 10 to 15 minutes. English and Spanish. Keyboard, mouse and touch. Text size, sound and reduced motion options. Screenshot of an echo card or the Wall of Names.
7. **Future impact.** More machines and languages, use in classrooms and museums, and a printable fact sheet for teachers. "So they are never forgotten."

## Judging criteria and where the project answers them

- **Impact:** a free browser game in English and Spanish for ages about 8 to 16, with no install.
- **Creativity:** real stories lived as mini-games inside a time-travel frame, with endings that cannot be changed.
- **Validity:** every fact has a source id, unverified facts stay hidden, and game numbers are labeled as game values.
- **Relevance:** all 13 entries of the official resource list appear (5 playable, 6 echoes, 5 on the Wall of Names), and NASA resources are the only source of facts.
- **Presentation:** a finished game from title to credits, with screenshots, a README and this draft. A 7-slide demo deck is published as a PDF.

## Checklist before submitting (from the participant guide)

- [ ] The team is valid and every member is registered in the same Local Event (not on the waiting list) and shown under Members.
- [ ] One official challenge is chosen: Abandoned but not Forgotten: Storytelling about NASA's Discarded Equipment on the Moon and Mars.
- [ ] Every form field is complete and in English.
- [ ] The demo is within its limit (video of 30 seconds or less, or at most 7 slides) and its link is public. Tested in a private window.
- [ ] The final project link is public. Tested in a private window.
- [ ] At least one NASA resource is documented under "NASA Data".
- [ ] Every external reference is listed. No copyrighted material is used without permission.
- [ ] AI use is disclosed. The "AI art" badge is visible on every illustration in the game, the screenshots and the demo. No NASA brand elements are used.
- [ ] No image, video, audio or likeness of anyone under 18 appears in the project or the demo.
- [ ] Both checkboxes are ticked (Terms and Privacy Policy; original work with all resources listed).
- [ ] "Submit for Judging" is clicked and the confirmation banner is seen before Sunday 15 November, 11:59 p.m. local time. Saving is not enough, and only the last submission counts.
