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
  'title.disclaimer':
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
  'intro.shipClock': 'Ship clock',
  'intro.outsideClock': 'Outside clock',
  'intro.storyYears': 'story years',
  'intro.line.1': 'A black hole. You do not go in. You orbit it at a safe distance.',
  'intro.line.2': 'Its gravity bends the light of the stars behind it.',
  'intro.line.3': 'Strong gravity slows time. Your clock runs slower than the clocks outside.',
  'intro.line.4': 'So you can only travel one way: toward the future.',
  'intro.skip': 'Skip',
  'intro.continue': 'Continue',

  // --- The Archive (hub) ---
  'hub.arrive': 'The Archive. A quiet place outside of time.',
  'hub.hint': 'Aim at a machine and select it to live its story.',
  'hub.progress': '{n} of {total} archived',
  'hub.completed': 'Archived',
  'hub.allDone': 'All five stories are archived.',
  'hub.science': 'Enter the Science Room',
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
  'debrief.pending': 'The sources for this entry are still being checked. Its facts will appear here once they are cited.',

  // --- Shell ---
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
  'm.voyager.name': 'Voyager',
  'm.voyager.years': '',          // no verified year in the content pack yet

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
  'm.opportunity.fact.7': 'On 16 May 2013 NASA announced it had passed 35.744 km, the record held by the Apollo 17 LRV since December 1972.',
  'm.opportunity.fact.8': 'It last communicated with Earth on 10 June 2018, in a planet-wide dust storm. Total distance: 45.16 km (28.06 miles).',

  // Mini-game "Beyond Sol 90". Energy, costs, turns and stars are game values.
  'g.opp.title': 'Beyond Sol 90',
  'g.opp.energy': 'Energy',
  'g.opp.data': 'Data',
  'g.opp.gameValues': 'game values',
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
  'g.opp.record': '16 May 2013: NASA announces you passed 35.744 km, the record held by the Apollo 17 LRV since December 1972.',
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
  'm.ingenuity.beat.1': 'It is 18 February 2021. You land in Jezero Crater with Ingenuity, a Mars helicopter.',
  'm.ingenuity.beat.2': 'On 19 April 2021 Ingenuity flies. It is the first powered, controlled flight on another planet.',
  'm.ingenuity.beat.3': 'It is a technology demo: five test flights at most, in 30 days. Then its role changes. It scouts for rover planners.',
  'm.ingenuity.beat.4': 'It is January 2024. The last flight, number 72, is on 18 January. The mission is completed on 25 January.',
  'm.ingenuity.fact.1': 'Ingenuity launched on 30 July 2020 with Perseverance and landed in Jezero Crater on 18 February 2021.',
  'm.ingenuity.fact.2': 'On 19 April 2021 it made the first powered, controlled flight on another planet.',
  'm.ingenuity.fact.3': 'It was a technology demo planned for no more than five test flights in 30 days. Later it scouted for rover planners.',
  'm.ingenuity.fact.4': 'It completed 72 flights: 128.8 flying minutes, 10.5 miles (17.0 km), maximum altitude 24.0 m (78.7 ft).',
  'm.ingenuity.fact.5': 'Its last flight was on 18 January 2024. The mission was completed on 25 January 2024.',

  // ---- Sojourner (section 8.3) ----
  'm.sojourner.beat.1': 'It is 4 July 1997. Mars Pathfinder lands in Ares Vallis, using airbags. Its rover, Sojourner, has not rolled out yet.',
  'm.sojourner.beat.2': 'On 5 July 1997 Sojourner rolls out. Its mass is 10.6 kg. It is the first wheeled vehicle used on any planet.',
  'm.sojourner.beat.3': 'The plan is about a month for Pathfinder and a week for Sojourner. They exceed it by 3 and 12 times.',
  'm.sojourner.beat.4': 'Sojourner works 83 days. The final contact with Pathfinder is on 27 September 1997.',
  'm.sojourner.fact.1': 'Pathfinder launched on 4 December 1996 and landed in Ares Vallis on 4 July 1997, using airbags.',
  'm.sojourner.fact.2': 'Sojourner rolled out on 5 July 1997. It had a mass of 10.6 kg and was the first wheeled vehicle used on any planet.',
  'm.sojourner.fact.3': 'Planned lifetimes: about a month for Pathfinder, a week for Sojourner. They exceeded these by 3 and 12 times. Sojourner worked 83 days.',
  'm.sojourner.fact.4': 'Final contact with Pathfinder was on 27 September 1997. It was officially declared over on 10 March 1998.',
  'm.sojourner.fact.5': 'The mission returned 550 rover images and more than 16,500 lander images.',

  // ---- Lunar Roving Vehicle (section 8.4) ----
  'm.lrv.beat.1': 'You stand on the Moon with Apollo 15. The Lunar Roving Vehicle waits. It is the first of its type to be used.',
  'm.lrv.beat.2': 'You drive within 5 km of the lunar module. Over three EVAs the rover goes 10.3 km, 12.5 km and 5.1 km.',
  'm.lrv.beat.3': 'It is December 1972. The Apollo 17 LRV sets a distance record: 35.744 km.',
  'm.lrv.beat.4': 'The work is done. The LRVs are parked permanently on the Moon. Dust, silence and stars.',
  'm.lrv.fact.1': 'At Apollo 15 the LRV was used within 5 km of the lunar module. It was the first use of this type of vehicle.',
  'm.lrv.fact.2': 'Apollo 15 EVAs totaled 18 h 35 min. The LRV drove 10.3 km, 12.5 km and 5.1 km (27.9 km total).',
  'm.lrv.fact.3': 'In December 1972, the Apollo 17 LRV set a distance record of 35.744 km.',
  'm.lrv.fact.4': 'The LRVs were left on the Moon, parked permanently.',
  'm.lrv.fact.5': 'On Apollo 17, a fender was repaired with four maps.',                      // [E] hidden until cited

  // ---- Voyager (section 8.5): no verified facts yet, so the beats are atmosphere only ----
  'm.voyager.beat.1': 'You float beside a small machine. Around you there is only dark and silence.',
  'm.voyager.beat.2': 'You feel the cold. Nothing moves here, except you and the machine.',
  'm.voyager.beat.3': 'It keeps going. You hold still and watch it, and you do not want to look away.',
  'm.voyager.beat.4': 'You feel very small beside it. You wonder who will remember this quiet machine.',
  'm.voyager.fact.1': 'Voyager 1 will be one light-day from Earth on 18 November 2026 at about 10:16 UTC.',   // [E] hidden until cited
};

// Structure of each machine entry. Text is referenced by key, so a translation
// only needs its own `strings`. `env` picks the story backdrop.
const beats = (id) => [1, 2, 3, 4].map((n) => ({ textKey: `m.${id}.beat.${n}`, spriteKey: id }));
const fact = (id, n, sourceId, needsSource = false) => ({ textKey: `m.${id}.fact.${n}`, sourceId, needsSource });

export const machines = {
  opportunity: {
    id: 'opportunity', name: 'm.opportunity.name', years: 'm.opportunity.years', env: 'mars',
    beats: beats('opportunity'),
    debrief: [
      fact('opportunity', 1, 'nasa-mer'), fact('opportunity', 2, 'beyond-earth'), fact('opportunity', 3, 'beyond-earth'),
      fact('opportunity', 4, 'beyond-earth'), fact('opportunity', 5, 'beyond-earth'), fact('opportunity', 6, 'beyond-earth'),
      fact('opportunity', 7, 'beyond-earth'), fact('opportunity', 8, 'nasa-mer'),
    ],
  },
  ingenuity: {
    id: 'ingenuity', name: 'm.ingenuity.name', years: 'm.ingenuity.years', env: 'mars',
    beats: beats('ingenuity'),
    debrief: [1, 2, 3, 4, 5].map((n) => fact('ingenuity', n, 'nasa-ingenuity')),
  },
  sojourner: {
    id: 'sojourner', name: 'm.sojourner.name', years: 'm.sojourner.years', env: 'mars',
    beats: beats('sojourner'),
    debrief: [
      fact('sojourner', 1, 'nasa-pathfinder'), fact('sojourner', 2, 'nasa-pathfinder'), fact('sojourner', 3, 'beyond-earth'),
      fact('sojourner', 4, 'beyond-earth'), fact('sojourner', 5, 'nasa-pathfinder'),
    ],
  },
  lrv: {
    id: 'lrv', name: 'm.lrv.name', years: 'm.lrv.years', env: 'moon',
    beats: beats('lrv'),
    debrief: [
      fact('lrv', 1, 'nssdca-a15'), fact('lrv', 2, 'nssdca-a15'), fact('lrv', 3, 'beyond-earth'),
      fact('lrv', 4, 'spaceapps-resources'),
      fact('lrv', 5, 'apollo17-fender', true),       // [E]: needs a citation before it is shown
    ],
  },
  voyager: {
    id: 'voyager', name: 'm.voyager.name', years: 'm.voyager.years', env: 'space',
    beats: beats('voyager'),
    debrief: [
      fact('voyager', 1, 'nasa-voyager', true),      // [E]: needs a citation before it is shown
    ],
  },
};

export default { strings, machines };
