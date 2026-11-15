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
    id: 'beyond-earth', tag: 'V', url: null,
    title: 'Beyond Earth: A Chronicle of Deep Space Exploration, 1958-2016 (NASA SP-2018-4041)',
    publisher: 'Siddiqi, A. A., NASA',
    short: 'Beyond Earth, NASA SP-2018-4041',
  },
  'nasa-pathfinder': {
    id: 'nasa-pathfinder', tag: 'V', url: null,
    title: 'Mars Pathfinder', publisher: 'NASA Science',
    short: 'NASA Science: Mars Pathfinder',
  },
  'nasa-mer': {
    id: 'nasa-mer', tag: 'V', url: null,
    title: 'Mars Exploration Rovers: Spirit and Opportunity', publisher: 'NASA Science',
    short: 'NASA Science: Mars Exploration Rovers',
  },
  'nasa-ingenuity': {
    id: 'nasa-ingenuity', tag: 'V', url: null,
    title: 'Ingenuity Mars Helicopter', publisher: 'NASA Science',
    short: 'NASA Science: Ingenuity Mars Helicopter',
  },
  'nssdca-a11': {
    id: 'nssdca-a11', tag: 'V', url: null,
    title: 'Apollo 11 Lunar Module, spacecraft details', publisher: 'NASA NSSDCA',
    short: 'NASA NSSDCA: Apollo 11 Lunar Module',
  },
  'nssdca-a12': {
    id: 'nssdca-a12', tag: 'V', url: null,
    title: 'Apollo 12 Lunar Module, spacecraft details', publisher: 'NASA NSSDCA',
    short: 'NASA NSSDCA: Apollo 12 Lunar Module',
  },
  'nssdca-a15': {
    id: 'nssdca-a15', tag: 'V', url: null,
    title: 'Apollo 15 Lunar Module, spacecraft details', publisher: 'NASA NSSDCA',
    short: 'NASA NSSDCA: Apollo 15 Lunar Module',
  },
  'spaceapps-resources': {
    id: 'spaceapps-resources', tag: 'V', url: null,
    title: 'Challenge resource list, "Abandoned but Not Forgotten"', publisher: 'NASA Space Apps Challenge 2026',
    short: 'Space Apps challenge resources',
  },
  'nasa-pioneer10': {
    id: 'nasa-pioneer10', tag: 'V', url: 'https://science.nasa.gov/mission/pioneer-10/',
    title: 'Pioneer 10', publisher: 'NASA Science', short: 'NASA Science: Pioneer 10',
  },
  'nasa-near': {
    id: 'nasa-near', tag: 'V', url: null,
    title: 'NEAR Shoemaker', publisher: 'NASA Science', short: 'NASA Science: NEAR Shoemaker',
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
