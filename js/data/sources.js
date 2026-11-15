// Every source a fact can cite. Debrief cards and the credits read this list.
//
// tag: 'V' = checked against the official Space Apps resources,
//      'E' = found in earlier research, citation still needed.
// needsSource: true means the citation does not exist yet. Facts that cite
// such a source are NOT shown to the player (see visibleFacts below). To show
// them, add the url and delete `needsSource: true` from that source.
// url: null means the link still has to be added before release.

export const SOURCES = {
  'beyond-earth': {
    id: 'beyond-earth', tag: 'V', url: 'https://www.nasa.gov/history/history-publications-and-resources/nasa-history-series/beyond-earth/',
    title: 'Beyond Earth: A Chronicle of Deep Space Exploration, 1958-2016 (NASA SP-2018-4041)',
    publisher: 'Siddiqi, A. A., NASA',
    short: 'Beyond Earth, NASA SP-2018-4041',
  },
  'nasa-pathfinder': {
    id: 'nasa-pathfinder', tag: 'V', url: 'https://science.nasa.gov/mission/mars-pathfinder/',
    title: 'Mars Pathfinder', publisher: 'NASA Science',
    short: 'NASA Science: Mars Pathfinder',
  },
  'nasa-mer': {
    id: 'nasa-mer', tag: 'V', url: 'https://science.nasa.gov/mission/mars-exploration-rovers-spirit-and-opportunity/',
    title: 'Mars Exploration Rovers: Spirit and Opportunity', publisher: 'NASA Science',
    short: 'NASA Science: Mars Exploration Rovers',
  },
  'nasa-ingenuity': {
    id: 'nasa-ingenuity', tag: 'V', url: 'https://science.nasa.gov/mission/mars-2020-perseverance/ingenuity-mars-helicopter/',
    title: 'Ingenuity Mars Helicopter', publisher: 'NASA Science',
    short: 'NASA Science: Ingenuity Mars Helicopter',
  },
  'nssdca-a12': {
    id: 'nssdca-a12', tag: 'V', url: 'https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1969-099C',
    title: 'Apollo 12 Lunar Module, spacecraft details', publisher: 'NASA NSSDCA',
    short: 'NASA NSSDCA: Apollo 12 Lunar Module',
  },
  'nssdca-a15': {
    id: 'nssdca-a15', tag: 'V', url: 'https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1971-063C',
    title: 'Apollo 15 Lunar Module, spacecraft details', publisher: 'NASA NSSDCA',
    short: 'NASA NSSDCA: Apollo 15 Lunar Module',
  },
  'spaceapps-resources': {
    id: 'spaceapps-resources', tag: 'V', url: 'https://www.spaceappschallenge.org/2026/',
    title: 'Challenge resource list, "Abandoned but Not Forgotten"', publisher: 'NASA Space Apps Challenge 2026',
    short: 'Space Apps challenge resources',
  },
  'nasa-pioneer10': {
    id: 'nasa-pioneer10', tag: 'V', url: 'https://science.nasa.gov/mission/pioneer-10/',
    title: 'Pioneer 10', publisher: 'NASA Science', short: 'NASA Science: Pioneer 10',
  },
  'nasa-near': {
    id: 'nasa-near', tag: 'V', url: 'https://science.nasa.gov/mission/near-shoemaker/',
    title: 'NEAR Shoemaker', publisher: 'NASA Science', short: 'NASA Science: NEAR Shoemaker',
  },
  'nasa-viking1': {
    id: 'nasa-viking1', tag: 'V', url: 'https://science.nasa.gov/mission/viking-1/',
    title: 'Viking 1', publisher: 'NASA Science', short: 'NASA Science: Viking 1',
  },
  'nasa-insight': {
    id: 'nasa-insight', tag: 'V', url: 'https://science.nasa.gov/mission/insight/',
    title: 'InSight', publisher: 'NASA Science', short: 'NASA Science: InSight',
  },
  'nasa-dawn': {
    id: 'nasa-dawn', tag: 'V', url: 'https://science.nasa.gov/mission/dawn/',
    title: 'Dawn', publisher: 'NASA Science', short: 'NASA Science: Dawn',
  },
  // --- citations still to be added: facts that use these stay hidden ---
  'nasa-blackhole': {
    id: 'nasa-blackhole', tag: 'E', url: null, needsSource: true,
    title: 'Black holes', publisher: 'NASA Science', short: 'NASA Science: Black Holes',
  },
  'apollo17-fender': {
    id: 'apollo17-fender', tag: 'E', url: null, needsSource: true,
    title: 'Apollo 17 fender repair', publisher: 'NASA', short: 'NASA: Apollo 17',
  },
};

// Only facts with a real citation may be shown to the player.
export function visibleFacts(debrief) {
  return debrief.filter((fact) => SOURCES[fact.sourceId] && !SOURCES[fact.sourceId].needsSource);
}
