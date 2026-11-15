// All player-facing English text lives here and is read through t('key').
// Scene files must not contain hardcoded player-facing strings.
//
// RULE: every factual claim must come from section 8 of the brief (the content
// pack) and carry a source id. Atmosphere is allowed, new facts are not.

export const strings = {
  'language.name': 'English',

  // --- Title screen ---
  'title.logo': 'The Space Archive',
  'title.tagline': 'Abandoned, but not forgotten.',
  'title.start': 'Start',
  'title.options': 'Options',
  'title.credits': 'Credits',
  'title.notReady': 'This part of the Archive is still being built.',
  'credits.aboutText':
    'Narrative fiction. The physics is real: near a black hole, time runs slower, so you can only travel toward the future.',

  // --- Options panel ---
  'options.heading': 'Options',
  'options.sound': 'Sound',
  'options.volume': 'Volume',
  'options.textSize': 'Text size',
  'options.textSize.normal': 'Normal',
  'options.textSize.large': 'Large',
  'options.reducedMotion': 'Reduced motion',
  'options.language': 'Language',
  'options.reset': 'Reset progress',
  'options.reset.confirm': 'Press again to reset',
  'options.reset.done': 'Progress cleared',
  'options.on': 'On',
  'options.off': 'Off',
  'options.close': 'Back',

  // --- Intro (frame story; only the two physics claims of section 8.0) ---
  'intro.shipClock': 'Your clock',
  'intro.outsideClock': 'Earth\u2019s clock',
  'intro.storyYears': 'story years',
  'intro.slower': 'Time runs slower for you.',
  // Names for the list under Earth's clock (the years are in `timeline` below).
  'tl.surveyor': 'Surveyor',
  'tl.lm': 'Apollo Lunar Modules',
  'tl.lrv': 'Apollo LRV',
  'tl.alsep': 'ALSEP',
  'tl.pioneer10': 'Pioneer 10',
  'tl.pioneer11': 'Pioneer 11',
  'tl.viking': 'Viking 1 and 2',
  'tl.sojourner': 'Sojourner',
  'tl.near': 'NEAR Shoemaker',
  'tl.opportunity': 'Opportunity',
  'tl.spirit': 'Spirit',
  'tl.dawn': 'Dawn',
  'tl.phoenix': 'Phoenix',
  'tl.kepler': 'Kepler',
  'tl.insight': 'InSight',
  'tl.ingenuity': 'Ingenuity',
  'intro.stop.1972': '1972: Pioneer 10 is launched.',
  'intro.stop.1997': '1997: Sojourner lands on Mars.',
  'intro.stop.2004': '2004: Opportunity lands on Mars.',
  'intro.stop.2021': '2021: Ingenuity makes its first flight.',
  'intro.stop.2026': '2026: The Archive.',
  'intro.line.1': 'A black hole. You do not go in. You orbit it at a safe distance.',
  'intro.line.2': 'Its gravity bends the light of the stars behind it.',
  'intro.line.3': 'Strong gravity slows time. Your clock runs slower than Earth\u2019s clock.',
  'intro.line.4': 'So you can only travel one way: toward the future.',
  'intro.skip': 'Skip',
  'intro.continue': 'Continue',

  // --- The Archive (hub) ---
  'hub.arrive': 'The Archive. A quiet place outside of time.',
  'hub.hint': 'Fly to a machine to live its story. Hold on an echo to read it.',
  'hub.progress': '{n} of {total} archived',
  'hub.completed': 'Archived',
  'hub.controls': 'Move: pointer, arrows or WASD \u00B7 Select: click or Enter \u00B7 Echo: hold',
  'hub.allDone': 'All five stories are archived.',
  'hub.echoes': '{n} of {total} echoes read',
  'hub.echoRead': 'Read',
  'hub.cardYears': 'Years: {y}',
  'hub.echo': 'Echo',
  'hub.wall': 'Wall of Names',
  'hub.complete': 'The Archive is complete',
  'complete.intro': 'You lived five real stories. This is what you learned:',
  'complete.stay': 'Stay in the Archive',
  'hub.completeHint': 'Every story is archived and every echo is read.',
  'hub.science': 'Enter the Science Room',
  'hub.leave': 'Science Room',
  'hub.title': 'Title',

  // --- Story and debrief ---
  'story.next': 'Next',
  'story.leave': 'Leave',
  'debrief.heading': 'What really happened',
  'debrief.back': 'Back to the Archive',
  'debrief.source': 'Source',
  'debrief.score': 'Your result (game score)',

  // --- Mini-game shell ---
  'game.pause': 'Pause',
  'game.paused': 'Paused',
  'game.resume': 'Resume',
  'game.leave': 'Leave to the Archive',
  'game.options': 'Options',
  'debrief.pending': 'The sources for this entry are still being checked. Its facts will appear here once they are cited.',

  // --- Science Room: the engineering-to-science link of each machine (facts from section 8) ---
  'science.title': 'Science Room',
  'science.intro': 'How each machine was built, and what that gave us.',
  'science.machine': 'The machine',
  'science.result': 'What it gave us',
  'science.prev': 'Previous',
  'science.next': 'Next',
  'science.page': '{n} of {total}',
  'science.credits': 'Sources and credits',
  'science.back': 'Back to the Archive',
  'science.pending': 'The sources for this machine are still being checked. Its card will appear here once they are cited.',
  'science.opportunity.1': 'A rover with solar panels and a 90-sol objective. In the 2007 dust storms the panels reported only 128 watt hours.',
  'science.opportunity.2': 'It kept driving: 45.16 km in total. On the way it found Heat Shield Rock, an iron-nickel meteorite, and reached Endeavour crater.',
  'science.ingenuity.1': 'A 1.8 kg helicopter with a rotor span of about 1.2 m, sent as a technology demo for no more than five test flights.',
  'science.ingenuity.2': 'It made the first powered, controlled flight on another planet. After the demo it scouted for rover planners. In total: 72 flights.',
  'science.sojourner.1': 'A 10.6 kg rover, the first wheeled vehicle used on any planet. It rolled out of Mars Pathfinder, which landed using airbags.',
  'science.sojourner.2': 'Planned for a week, it worked 83 days. The mission returned 550 rover images and more than 16,500 lander images.',
  'science.lrv.1': 'A vehicle for astronauts on the Moon, first used on Apollo 15. It was used within 5 km of the lunar module.',
  'science.lrv.2': 'On Apollo 15 it drove 27.9 km in three EVAs. In December 1972 the Apollo 17 LRV set a distance record of 35.744 km.',
  'science.pioneer10.1': 'The first spacecraft with all-nuclear electrical power: two RTGs, about 140 W at Jupiter. Designed for 21 months, it lasted over 30 years.',
  'science.pioneer10.2': 'About 500 pictures of Jupiter\u2019s atmosphere, clearly showing the Great Red Spot, and photos of Callisto, Ganymede and Europa.',

  // --- Credits ---
  'credits.title': 'Credits and sources',
  'credits.made': 'Made by Juan for the 2026 NASA Space Apps Challenge, Lima.',
  'credits.challenge': 'Challenge: "Abandoned but Not Forgotten: Storytelling about NASA’s Discarded Equipment on the Moon and Mars".',
  'credits.sources': 'Sources',
  'credits.sourcesNote': 'Every fact in the game comes from these sources. Each fact card names its source.',
  'credits.art': 'Art and sound',
  'credits.artText': 'All pixel art and sound are original to this project and made in code. No NASA logos, insignia, flags or mission patches are used.',
  'credits.gameValues': 'Energy, moves, timers, scores and stars are game values, not mission data.',
  'credits.tools': 'How it was made',
  'credits.toolsText': 'The code, the pixel art and the sound were generated with AI coding assistants and reviewed by the developer. Text was drafted and translated with AI help.',
  'credits.toolsMark': 'Every screen carries the mark "AI-generated art". No photos, fonts, audio files or libraries from other people are used.',
  'credits.license': 'License',
  'credits.licenseText': 'Code and content: Apache-2.0. Not affiliated with or endorsed by NASA.',
  'credits.about': 'About the story',
  'credits.back': 'Back',

  // --- Echoes: six more machines, each a short fact card opened from the hub ---
  'echo.kicker': 'Echo',
  'echo.back': 'Back to the Archive',
  'e.surveyor3.name': 'Surveyor landers',
  'e.surveyor3.years': '1960s',
  'e.surveyor3.fact.1': 'The Surveyor landers were robotic probes sent in the 1960s to prove soft landings were possible.',
  'e.surveyor3.fact.2': 'One of them, Surveyor 3, launched on 17 April 1967 and landed on 20 April 1967 in Oceanus Procellarum.',
  'e.surveyor3.fact.3': 'On 19 November 1969, the Apollo 12 lunar module Intrepid landed about 180 m away.',
  'e.surveyor3.fact.4': 'Conrad and Bean took parts of it.',
  'e.viking1.name': 'Viking 1 and 2',
  'e.viking1.years': '1975 – 1982',
  'e.viking1.fact.1': 'Viking 1 launched on 20 August 1975. Its lander touched down on Mars on 20 July 1976.',
  'e.viking1.fact.2': 'Viking 1 and 2 were the first U.S. landers to successfully operate on Mars (1976). They remain exactly where they touched down.',
  'e.viking1.fact.3': 'Both Viking orbiters returned 52,663 images and mapped about 97 percent of the surface. The landers returned 4,500 photos.',
  'e.viking1.fact.4': 'The Viking 1 orbiter shut down on 7 August 1980, out of attitude-control propellant. Its lander stopped on 11 November 1982 after a faulty command.',
  'e.near.name': 'NEAR Shoemaker',
  'e.near.years': '1996 – 2001',
  'e.near.fact.1': 'NEAR Shoemaker launched on 17 February 1996.',
  'e.near.fact.2': 'On 14 February 2000 it entered orbit around the asteroid Eros: the first spacecraft to orbit an asteroid.',
  'e.near.fact.3': 'On 12 February 2001 it touched down on Eros, the first to land on an asteroid, though it was not designed as a lander.',
  'e.near.fact.4': 'It returned data for about two weeks. Last contact: 28 February 2001. It succumbed to the extreme cold.',
  'e.insight.name': 'InSight',
  'e.insight.years': '2018 – 2022',
  'e.insight.fact.1': 'InSight launched on 5 May 2018 and landed in Elysium Planitia on 26 November 2018.',
  'e.insight.fact.2': 'It studied the deep interior of Mars. Its seismometer listened for marsquakes.',
  'e.insight.fact.3': 'It was built on the design of the Phoenix lander.',
  'e.insight.fact.4': 'End of mission: 15 December 2022.',
  'e.spirit.name': 'Spirit',
  'e.spirit.years': '2011',
  'e.spirit.fact.1': 'Spirit drove 7.73 km and operated for 6 years, 2 months and 19 days.',
  'e.spirit.fact.2': 'NASA Science says its mission concluded in 2010, with its last contact.',
  'e.spirit.fact.3': 'Recovery efforts ended on 25 May 2011. The probable cause was the cold.',
  'e.dawn.name': 'Dawn',
  'e.dawn.years': '2007',
  'e.dawn.fact.1': 'Dawn launched on 27 September 2007.',
  'e.dawn.fact.2': 'It was NASA’s first truly interplanetary spaceship, with extended stays at the giant asteroid Vesta and the dwarf planet Ceres.',
  'e.dawn.fact.3': 'It ran out of fuel and remains in a perpetual unpowered orbit around Ceres.',

  // --- Wall of Names: the other official resources, with their official one-line description ---
  'wall.title': 'Wall of Names',
  'wall.intro': 'More machines left behind, as described in the official challenge resources.',
  'wall.back': 'Back to the Archive',
  'wall.lm.name': 'Apollo Lunar Modules',
  'wall.lm.text': 'The descent stages were left behind as launch pads.',
  'wall.alsep.name': 'ALSEP Scientific Packages',
  'wall.alsep.text': 'Seismometers, retroreflectors and other instruments left to do science after the astronauts departed.',
  'wall.phoenix.name': 'Phoenix lander',
  'wall.phoenix.text': 'Dug for water ice. Both Phoenix and InSight eventually lost power.',
  'wall.kepler.name': 'Kepler Space Telescope',
  'wall.kepler.text': 'Exoplanet-hunting telescope that ran out of fuel and drifts in an Earth-trailing orbit.',
  'wall.pioneer11.name': 'Pioneer 11',
  'wall.pioneer11.text': 'Early deep-space probe (with Pioneer 10), now drifting silently out of the solar system.',

  // --- Shell ---
  'shell.aiMark': 'AI-generated art',
  'shell.rotate': 'Please rotate your device to landscape.',

  // --- Machines: names and years (years come from the facts below) ---
  'm.opportunity.name': 'Opportunity',
  'm.opportunity.years': '2004 – 2018',
  'm.ingenuity.name': 'Ingenuity',
  'm.ingenuity.years': '2021 – 2024',
  'm.sojourner.name': 'Sojourner',
  'm.sojourner.years': '1997',
  'm.lrv.name': 'Lunar Roving Vehicle',
  'm.lrv.years': '1972',

  // ---- Opportunity (section 8.1) ----
  // Story beats before the mini-game. The rest of the story is told inside it.
  'm.opportunity.beat.1': 'It is 24 January 2004. You land in Meridiani Planum with a rover called Opportunity.',
  'm.opportunity.beat.2': 'You bounce at least 26 times. You stop inside Eagle crater, about 14.9 km from the intended target.',
  'm.opportunity.beat.3': 'The plan is short: 90 sols of work. Nobody knows yet how far this rover will go.',
  'm.opportunity.beat.4': 'Now it is your turn. Use the energy well: drive, do science, or rest in the Sun.',
  'm.opportunity.fact.1': 'Opportunity landed in Meridiani Planum on 24 January 2004 (California time).',
  'm.opportunity.fact.2': 'It bounced at least 26 times and stopped inside Eagle crater, about 14.9 km from the intended target.',
  'm.opportunity.fact.3': 'The original mission objective was 90 sols.',
  'm.opportunity.fact.4': 'In January 2005 it found Heat Shield Rock, an iron-nickel meteorite, near its discarded heat shield.',
  'm.opportunity.fact.5': 'In the 2007 dust storms, panels reported 128 watt hours on 18 July. Science stopped for about six weeks, then resumed.',
  'm.opportunity.fact.6': 'It arrived at Endeavour crater on 9 August 2011.',
  'm.opportunity.fact.7': 'On 16 May 2013 NASA announced it had passed the NASA record on another world: 35.744 km, held by the Apollo 17 LRV since December 1972.',
  'm.opportunity.fact.8': 'It last communicated with Earth on 10 June 2018, in a planet-wide dust storm. Total distance: 45.16 km (28.06 miles).',

  // Mini-game "Beyond Sol 90". Energy, costs, turns and stars are game values.
  'g.opp.title': 'Beyond Sol 90',
  'g.opp.energy': 'Energy',
  'g.opp.data': 'Data',
  'g.opp.gameValues': 'game values',
  'game.values': 'game values',
  'game.continue': 'Continue',
  'g.opp.drive': 'Drive',
  'g.opp.science': 'Science',
  'g.opp.rest': 'Rest',
  'g.opp.suspended': 'Suspended',
  'g.opp.noTarget': 'No target',
  'g.opp.sky.clear': 'Clear sky',
  'g.opp.sky.dusty': 'Dusty sky',
  'g.opp.sky.storm': 'Dust storm',
  'g.opp.sky.final': 'Planet-wide dust storm',
  'g.opp.thisTurn': 'This turn: {v}',
  'g.opp.week': 'Week {n} of about 6',
  'g.opp.continue': 'Continue',

  'g.opp.p1.title': 'Eagle crater · 2004',
  'g.opp.p1.text': 'Roll out of the crater. Driving and science cost energy. Resting lets the Sun charge you.',
  'g.opp.p2.title': 'On the move · 2005',
  'g.opp.p2.text': 'January 2005. You drive on. Something lies near your discarded heat shield.',
  'g.opp.p3.title': 'Dust storms · 2007',
  'g.opp.p3.text': 'July 2007. Dust storms cover the sky. The Sun is almost gone. Science is suspended.',
  'g.opp.p3.low': '18 July: the solar panels report only 128 watt hours.',
  'g.opp.p3.end': 'After about six weeks, the dust clears. Science resumes.',
  'g.opp.p4.title': 'Beyond the plan · 2011 – 2018',
  'g.opp.p4.text': 'The plan was 90 sols. You are still driving, years later.',
  'g.opp.endeavour': '9 August 2011: you arrive at Endeavour crater.',
  'g.opp.record': '16 May 2013: NASA announces you passed the NASA record on another world: 35.744 km, held by the Apollo 17 LRV since December 1972.',
  'g.opp.heatShield': 'Heat Shield Rock: an iron-nickel meteorite, found near the discarded heat shield.',
  'g.opp.dataCollected': 'Data collected.',
  'g.opp.target': 'A science target is here. Science costs energy, but it is why you came.',
  'g.opp.ready': 'Choose what to do this turn.',
  'g.opp.dustyNote': 'Dust in the air. Less sunlight this turn.',
  'g.opp.stormRest': 'The storm goes on. Resting saves energy.',
  'g.opp.fault': 'Energy too low. The rover sleeps to recover. The real rover got through this, so you go on.',
  'g.opp.final.start': 'June 2018. A planet-wide dust storm covers your location.',
  'g.opp.final.1': 'The sky turns dark.',
  'g.opp.final.2': 'The panels find almost no light.',
  'g.opp.final.3': 'The energy keeps falling.',
  'g.opp.end.1': '10 June 2018. Opportunity communicates with Earth for the last time.',
  'g.opp.end.2': 'In total it drove 45.16 km (28.06 miles).',
  'g.opp.end.3': 'This ending is real. Nothing you did could change it.',

  // ---- Ingenuity (section 8.2) ----
  // Story beats before the mini-game. The real totals appear only on the card after it.
  'm.ingenuity.beat.1': 'It is 18 February 2021. You land in Jezero Crater with Ingenuity, a Mars helicopter.',
  'm.ingenuity.beat.2': 'It is small. Its mass is 1.8 kg. Its rotors span about 1.2 m.',
  'm.ingenuity.beat.3': 'It is a technology demo. The plan: no more than five test flights in 30 days.',
  'm.ingenuity.beat.4': 'It is 19 April 2021. Time for the first flight. The rotors are in your hands.',
  'm.ingenuity.fact.1': 'Ingenuity launched on 30 July 2020 with Perseverance and landed in Jezero Crater on 18 February 2021.',
  'm.ingenuity.fact.2': 'On 19 April 2021 it made the first powered, controlled flight on another planet.',
  'm.ingenuity.fact.3': 'It was a technology demo planned for no more than five test flights in 30 days. Later it scouted for rover planners.',
  'm.ingenuity.fact.4': 'It completed 72 flights: 128.8 flying minutes, 10.5 miles (17.0 km), maximum altitude 24.0 m (78.7 ft).',
  'm.ingenuity.fact.5': 'Its last flight was on 18 January 2024. The mission was completed on 25 January 2024.',
  'm.ingenuity.fact.6': 'Its mass was 1.8 kg and its rotor span about 1.2 m.',

  // Mini-game "Wright Brothers Field". Heights, speeds, flight count and stars are game values.
  'g.ing.title': 'Wright Brothers Field',
  'g.ing.p1.title': 'Test flights · 2021',
  'g.ing.p1.text': '19 April 2021. Ingenuity is a technology demo: no more than five test flights in 30 days.',
  'g.ing.p1.how': 'Hold to spin the rotors and climb. Release to descend. Hover in the marked zone, then land softly.',
  'g.ing.p2.title': 'A new role',
  'g.ing.p2.text': 'The five test flights are done. But Ingenuity keeps flying. Its new role: scouting for rover planners.',
  'g.ing.p2.how': 'Scouting flights are harder. The zone moves and the air pushes you around.',
  'g.ing.flight': 'Flight {n}',
  'g.ing.planned': 'Plan: 5 test flights',
  'g.ing.scouting': 'Scouting flights',
  'g.ing.hold': 'Hold: rotors',
  'g.ing.ready': 'Hold the button (or Space) to take off.',
  'g.ing.hover': 'Keep the whole helicopter inside the marked zone.',
  'g.ing.land': 'Good hover. Now release gently and land softly.',
  'g.ing.landed': 'Flight {n} complete.',
  'g.ing.first': 'Flight 1 complete: the first powered, controlled flight on another planet.',
  'g.ing.hard': 'That landing was too fast. Try this flight again, and slow down before the ground.',
  'g.ing.end': 'You flew {n} flights here, more than the five in the plan. The real numbers are on the next card.',

  // ---- Sojourner (section 8.3) ----
  'm.sojourner.beat.1': 'It is 4 July 1997. Mars Pathfinder lands in Ares Vallis, using airbags. Its rover, Sojourner, has not rolled out yet.',
  'm.sojourner.beat.2': 'On 5 July 1997 Sojourner rolls out. Its mass is 10.6 kg. It is the first wheeled vehicle used on any planet.',
  'm.sojourner.beat.3': 'The plan is about a month for Pathfinder and a week for Sojourner. They exceed it by 3 and 12 times.',
  'm.sojourner.beat.4': 'Now you guide it. Rocks are everywhere, and each sol you can only move a little. Slow and steady.',
  'm.sojourner.fact.1': 'Pathfinder launched on 4 December 1996 and landed in Ares Vallis on 4 July 1997, using airbags.',
  'm.sojourner.fact.2': 'Sojourner rolled out on 5 July 1997. It had a mass of 10.6 kg and was the first wheeled vehicle used on any planet.',
  'm.sojourner.fact.3': 'Planned lifetimes: about a month for Pathfinder, a week for Sojourner. They exceeded these by 3 and 12 times. Sojourner worked 83 days.',
  'm.sojourner.fact.4': 'Final contact with Pathfinder was on 27 September 1997. The mission was officially declared over on 10 March 1998.',
  'm.sojourner.fact.5': 'The mission returned 550 rover images and more than 16,500 lander images.',
  'm.sojourner.fact.6': 'The lander was renamed Carl Sagan Memorial Station.',

  // Mini-game "Slow and Steady". Moves, the sol counter, the map and stars are game values.
  'g.soj.title': 'Slow and Steady',
  'g.soj.p1.title': 'Ares Vallis · 1997',
  'g.soj.p1.text': '5 July 1997. Sojourner rolls out onto the surface. Its mass is 10.6 kg.',
  'g.soj.p1.how': 'Reach the three targets to analyze them. Go around the rocks. You have {n} moves each sol.',
  'g.soj.sol': 'Sol {n}',
  'g.soj.moves': 'Moves left',
  'g.soj.targets': 'Targets: {n} / {total}',
  'g.soj.ready': 'Use the arrow keys or tap next to the rover to move.',
  'g.soj.blocked': 'A rock is in the way. Go around it.',
  'g.soj.newSol': 'The sol is over. A new sol begins, with new moves.',
  'g.soj.t1': 'Target analyzed. Sojourner is the first wheeled vehicle used on any planet.',
  'g.soj.t2': 'Target analyzed. The plan for Sojourner was a week. It exceeded that 12 times.',
  'g.soj.t3': 'Target analyzed. Sojourner worked for 83 days.',
  'g.soj.end': 'All targets analyzed. The lander was renamed Carl Sagan Memorial Station.',
  'g.soj.up': 'Up',
  'g.soj.down': 'Down',
  'g.soj.left': 'Left',
  'g.soj.right': 'Right',

  // ---- Lunar Roving Vehicle (section 8.4) ----
  'm.lrv.beat.1': 'You stand on the Moon with Apollo 15. The Lunar Roving Vehicle waits. It is the first of its type to be used.',
  'm.lrv.beat.2': 'With it you work within 5 km of the lunar module. There are three EVAs, three drives.',
  'm.lrv.beat.3': 'Now you drive. Stop at each flag, and slow down for the craters.',
  'm.lrv.fact.1': 'At Apollo 15 the LRV was used within 5 km of the lunar module. It was the first use of this type of vehicle.',
  'm.lrv.fact.2': 'Apollo 15 EVAs totaled 18 h 35 min. The LRV drove 10.3 km, 12.5 km and 5.1 km (27.9 km total).',
  'm.lrv.fact.3': 'In December 1972, the Apollo 17 LRV set a distance record of 35.744 km.',
  'm.lrv.fact.4': 'The LRVs were left on the Moon, parked permanently.',
  'm.lrv.fact.5': 'On Apollo 17, a fender was repaired with four maps.',                      // [E] hidden until cited

  // Mini-game "Moon Drive". Speeds, the track, flags, craters and stars are game values.
  // The EVA distances in km are real (Apollo 15).
  'g.lrv.title': 'Moon Drive',
  'g.lrv.eva': 'EVA {n} of 3 · {km} km',
  'g.lrv.eva.title': 'Apollo 15 · EVA {n}',
  'g.lrv.eva1.text': 'On the first EVA of Apollo 15, the LRV drives 10.3 km.',
  'g.lrv.eva2.text': 'On the second EVA, the LRV drives 12.5 km.',
  'g.lrv.eva3.text': 'On the third EVA, the LRV drives 5.1 km. In total: 27.9 km.',
  'g.lrv.how': 'Hold to drive. Release to slow down. Stop at each flag. Slow down for craters.',
  'g.lrv.flags': 'Flags: {n} / {total}',
  'g.lrv.hold': 'Hold: drive',
  'g.lrv.ready': 'Hold the button (or Space) to drive.',
  'g.lrv.flagAhead': 'Flag ahead. Release to slow down, and stop next to it.',
  'g.lrv.stopped': 'Stopped at the flag. Well done.',
  'g.lrv.missed': 'You drove past the flag. Brake earlier next time.',
  'g.lrv.jolt': 'Too fast for that crater. Slow down before craters.',
  'g.lrv.evaDone': 'EVA {n} complete.',
  'g.lrv.record.title': 'Apollo 17 · December 1972',
  'g.lrv.record.text': 'In December 1972, the Apollo 17 LRV sets a distance record: 35.744 km.',
  'g.lrv.repair.text': 'On Apollo 17, a fender is repaired with four maps. Put the four maps in place.',   // [E] shown only once cited
  'g.lrv.repair.pick': 'Which map fits the marked corner?',
  'g.lrv.repair.wrong': 'That map does not fit there. Try another one.',
  'g.lrv.repair.done': 'The fender is repaired.',
  'g.lrv.map': 'Map {n}',
  'g.lrv.end': 'The driving is over. The LRVs were left on the Moon, parked permanently.',

  // ---- Pioneer 10 (facts: NASA Science, "Pioneer 10") ----
  'm.pioneer10.name': 'Pioneer 10',
  'm.pioneer10.years': '1972',
  'm.pioneer10.beat.1': 'It is 2 March 1972. Pioneer 10 launches from Cape Canaveral on an Atlas Centaur. Its mass is 258 kg.',
  'm.pioneer10.beat.2': 'It is designed for a 21-month mission: to fly by Jupiter. No spacecraft has flown through the asteroid belt before.',
  'm.pioneer10.beat.3': 'It carries an aluminum plaque with diagrams of the solar system.',
  'm.pioneer10.beat.4': 'Its electrical power is all nuclear: two RTGs. Over time that power decays. You decide what stays on.',
  'm.pioneer10.fact.1': 'Pioneer 10 launched on 2 March 1972 from Cape Canaveral on an Atlas Centaur. Its mass was 258 kg.',
  'm.pioneer10.fact.2': 'It was designed for a 21-month mission to fly by Jupiter. It lasted more than 30 years.',
  'm.pioneer10.fact.3': 'It was the first spacecraft to fly through the asteroid belt, to fly past Jupiter, and to use all-nuclear electrical power (two RTGs).',
  'm.pioneer10.fact.4': 'Closest approach to Jupiter: 4 December 1973, at 81,000 miles (130,354 km). It took about 500 pictures of Jupiter’s atmosphere.',
  'm.pioneer10.fact.5': 'On 13 June 1983 it crossed Neptune’s orbit: the first human-made object beyond the then-outermost planet.',
  'm.pioneer10.fact.6': 'Routine contact ended on 31 March 1997 for budgetary reasons. A final attempt to contact it on 4 March 2006 failed.',
  'm.pioneer10.fact.7': 'Last signal: 23 January 2003, from 12.23 billion km. It took 11 hours 20 minutes to reach Earth. Its power source had decayed.',
  'm.pioneer10.fact.8': 'It carries an aluminum plaque with diagrams of the solar system. It heads toward the star Aldebaran, expected in about two million years.',

  // Mini-game "Power Budget". Budgets, costs, data, "Instrument 1..4" and stars are game values.
  // The dates, places and distances in the round messages are real.
  'g.pio.title': 'Power Budget',
  'g.pio.card.title': 'Pioneer 10 · 1972',
  'g.pio.card.text': 'Pioneer 10 is the first spacecraft to use all-nuclear electrical power: two RTGs, about 140 W at Jupiter.',
  'g.pio.card.how': 'The power decays. Each round, choose what stays on. Data only reaches Earth while the transmitter is on.',
  'g.pio.power': 'Power: {used} / {budget}',
  'g.pio.data': 'Data sent to Earth: {n}',
  'g.pio.transmitter': 'Transmitter',
  'g.pio.instrument': 'Instrument {n}',
  'g.pio.on': 'On',
  'g.pio.off': 'Off',
  'g.pio.cost': 'power {c}',
  'g.pio.gain': 'data +{d}',
  'g.pio.sends': 'sends data home',
  'g.pio.noPower': 'not enough power',
  'g.pio.pass': 'Let time pass',
  'g.pio.ok': 'Inside the power budget.',
  'g.pio.over': 'Too much power in use. Switch something off.',
  'g.pio.silent': 'The transmitter is off: no data reaches Earth.',
  'g.pio.r1': '15 July 1972. You enter the asteroid belt. Pioneer 10 is the first spacecraft to fly through it.',
  'g.pio.r2': '4 December 1973. Closest approach to Jupiter: 130,354 km. About 500 pictures show its atmosphere and the Great Red Spot.',
  'g.pio.r3': '13 June 1983. You cross Neptune’s orbit: the first human-made object beyond the then-outermost planet.',
  'g.pio.r4': '31 March 1997. Routine contact ends for budgetary reasons. Pioneer 10 keeps going.',
  'g.pio.r5': 'January 2003. The power source has decayed. It can no longer power the transmitter.',
  'g.pio.end.1': '23 January 2003. The last signal, from 12.23 billion km. It takes 11 hours 20 minutes to reach Earth.',
  'g.pio.end.2': 'A final attempt to contact Pioneer 10 on 4 March 2006 fails.',
  'g.pio.end.3': 'It heads toward the star Aldebaran, expected in about two million years.',
  'g.pio.end.4': 'Pioneer 11, another early deep-space probe, is also drifting silently out of the solar system.',
  'g.pio.end.5': 'This ending is real. Nothing you did could change it.',
};

// Structure of each machine entry. Text is referenced by key, so a translation
// only needs its own `strings`. `env` picks the story backdrop.
const beats = (id, count = 4) => Array.from({ length: count }, (_, i) => ({ textKey: `m.${id}.beat.${i + 1}`, spriteKey: id }));
const fact = (id, n, sourceId) => ({ textKey: `m.${id}.fact.${n}`, sourceId });

export const machines = {
  opportunity: {
    id: 'opportunity', name: 'm.opportunity.name', years: 'm.opportunity.years', env: 'mars',
    cardFact: 2,                                  // the debrief fact shown on its card in the hub
    beats: beats('opportunity'),
    debrief: [
      fact('opportunity', 1, 'nasa-mer'), fact('opportunity', 2, 'beyond-earth'), fact('opportunity', 3, 'beyond-earth'),
      fact('opportunity', 4, 'beyond-earth'), fact('opportunity', 5, 'beyond-earth'), fact('opportunity', 6, 'beyond-earth'),
      fact('opportunity', 7, 'beyond-earth'), fact('opportunity', 8, 'nasa-mer'),
    ],
  },
  ingenuity: {
    id: 'ingenuity', name: 'm.ingenuity.name', years: 'm.ingenuity.years', env: 'mars',
    cardFact: 1,                                  // the debrief fact shown on its card in the hub
    beats: beats('ingenuity'),
    debrief: [1, 2, 3, 4, 5, 6].map((n) => fact('ingenuity', n, 'nasa-ingenuity')),
  },
  sojourner: {
    id: 'sojourner', name: 'm.sojourner.name', years: 'm.sojourner.years', env: 'mars',
    cardFact: 1,                                  // the debrief fact shown on its card in the hub
    beats: beats('sojourner'),
    debrief: [
      fact('sojourner', 1, 'nasa-pathfinder'), fact('sojourner', 2, 'nasa-pathfinder'), fact('sojourner', 3, 'beyond-earth'),
      fact('sojourner', 4, 'beyond-earth'), fact('sojourner', 5, 'nasa-pathfinder'), fact('sojourner', 6, 'nasa-pathfinder'),
    ],
  },
  lrv: {
    id: 'lrv', name: 'm.lrv.name', years: 'm.lrv.years', env: 'moon',
    cardFact: 3,                                  // the debrief fact shown on its card in the hub
    beats: beats('lrv', 3),
    debrief: [
      fact('lrv', 1, 'nssdca-a15'), fact('lrv', 2, 'nssdca-a15'), fact('lrv', 3, 'beyond-earth'),
      fact('lrv', 4, 'spaceapps-resources'),
      fact('lrv', 5, 'apollo17-fender'),             // [E]: hidden until that source has a citation (see sources.js)
    ],
  },
  pioneer10: {
    id: 'pioneer10', name: 'm.pioneer10.name', years: 'm.pioneer10.years', env: 'space',
    cardFact: 1,                                  // the debrief fact shown on its card in the hub
    beats: beats('pioneer10'),
    debrief: [1, 2, 3, 4, 5, 6, 7, 8].map((n) => fact('pioneer10', n, 'nasa-pioneer10')),
  },
};

// Science Room: two lines per machine, each with the sources it comes from.
// A line is shown only if all its sources have a citation.
const line = (id, n, ...sourceIds) => ({ textKey: `science.${id}.${n}`, sourceIds });
export const science = {
  opportunity: [line('opportunity', 1, 'beyond-earth'), line('opportunity', 2, 'nasa-mer', 'beyond-earth')],
  ingenuity: [line('ingenuity', 1, 'nasa-ingenuity'), line('ingenuity', 2, 'nasa-ingenuity')],
  sojourner: [line('sojourner', 1, 'nasa-pathfinder'), line('sojourner', 2, 'beyond-earth', 'nasa-pathfinder')],
  lrv: [line('lrv', 1, 'nssdca-a15'), line('lrv', 2, 'nssdca-a15', 'beyond-earth')],
  pioneer10: [line('pioneer10', 1, 'nasa-pioneer10'), line('pioneer10', 2, 'nasa-pioneer10')],
};

// Echoes: each fact names the sources it comes from.
const echoFact = (id, n, ...sourceIds) => ({ textKey: `e.${id}.fact.${n}`, sourceIds });
const echo = (id, facts) => ({ id, name: `e.${id}.name`, years: `e.${id}.years`, facts });
export const echoes = {
  surveyor3: echo('surveyor3', [echoFact('surveyor3', 1, 'spaceapps-resources'), echoFact('surveyor3', 2, 'beyond-earth'), echoFact('surveyor3', 3, 'nssdca-a12'), echoFact('surveyor3', 4, 'nssdca-a12')]),
  viking1: echo('viking1', [1, 2, 3, 4].map((n) => echoFact('viking1', n, n === 2 ? 'spaceapps-resources' : 'nasa-viking1'))),
  near: echo('near', [1, 2, 3, 4].map((n) => echoFact('near', n, 'nasa-near'))),
  insight: echo('insight', [1, 2, 3, 4].map((n) => echoFact('insight', n, 'nasa-insight'))),
  spirit: echo('spirit', [echoFact('spirit', 1, 'beyond-earth'), echoFact('spirit', 2, 'nasa-mer'), echoFact('spirit', 3, 'beyond-earth')]),
  dawn: echo('dawn', [echoFact('dawn', 1, 'nasa-dawn'), echoFact('dawn', 2, 'nasa-dawn'), echoFact('dawn', 3, 'spaceapps-resources')]),
};

// Wall of Names: the one-liners come from the official challenge resource list.
export const wall = ['lm', 'alsep', 'phoenix', 'kepler', 'pioneer11'].map((id) => ({
  name: `wall.${id}.name`, textKey: `wall.${id}.text`, sourceId: 'spaceapps-resources',
}));

// Intro timeline: every official resource, in order, with a year only when the
// facts in this project verify one. `year: null` means "show the name only".
// Each year notes the fact it comes from.
const when = (id, year, sourceId = null) => ({ name: `tl.${id}`, year, sourceId });
export const timeline = [
  when('surveyor', 1967, 'beyond-earth'),          // Surveyor 3 landed on 20 April 1967
  when('lm', 1969, 'nssdca-a12'),                  // Apollo 12's Intrepid landed on 19 November 1969
  when('lrv', 1972, 'beyond-earth'),               // Apollo 17 LRV distance record, December 1972
  when('alsep', null),
  when('pioneer10', 1972, 'nasa-pioneer10'),       // launched 2 March 1972
  when('pioneer11', null),
  when('viking', 1976, 'nasa-viking1'),            // Viking 1 lander touched down on 20 July 1976
  when('sojourner', 1997, 'nasa-pathfinder'),      // rolled out on 5 July 1997
  when('near', 2001, 'nasa-near'),                 // touched down on Eros on 12 February 2001
  when('opportunity', 2004, 'nasa-mer'),           // landed on 24 January 2004
  when('spirit', null),
  when('dawn', 2007, 'nasa-dawn'),                 // launched 27 September 2007
  when('phoenix', null),
  when('kepler', null),
  when('insight', 2018, 'nasa-insight'),           // landed 26 November 2018
  when('ingenuity', 2021, 'nasa-ingenuity'),       // first flight 19 April 2021
];

export default { strings, machines, science, echoes, wall, timeline };
