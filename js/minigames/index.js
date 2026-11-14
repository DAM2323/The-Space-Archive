// The list of mini-games, by machine id. Machines that are not listed here
// are "Archive entries": story beats and the debrief card only.
//
// Contract: each mini-game exports create(ctx, api) and returns
// { update(dt), render(), destroy() }. It reports its result with
// api.finish({ stars }) and never touches the global game state.

import * as opportunity from './opportunity.js';

export const MINIGAMES = {
  opportunity,
};
