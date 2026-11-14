// The whole game uses these 16 colors and nothing else.
// Dark space background, cool violets for the world, and ONE warm accent
// (amber) that is reserved for interactive things.
// Text colors used on the dark background (star, mist, amber, ice) all pass
// WCAG AA contrast against `void` and `deep`.

export const PALETTE = [
  '#07060f', // 0 void   - background
  '#12112a', // 1 deep   - panels
  '#1f1d47', // 2 night
  '#3a3478', // 3 indigo
  '#6b5fb5', // 4 violet
  '#a9a4d6', // 5 mist   - secondary text
  '#f2f0e6', // 6 star   - main text
  '#ffb347', // 7 amber  - the interactive accent
  '#e2622b', // 8 ember
  '#8f3a26', // 9 rust
  '#c9955c', // a dust
  '#7fd4e8', // b ice
  '#2f8f9d', // c teal
  '#7ed492', // d green
  '#e0556b', // e red
  '#5c5f7a', // f gray
];

// Named access, so scene code reads like `C.amber` instead of `PALETTE[7]`.
export const C = {
  void: PALETTE[0], deep: PALETTE[1], night: PALETTE[2], indigo: PALETTE[3],
  violet: PALETTE[4], mist: PALETTE[5], star: PALETTE[6], amber: PALETTE[7],
  ember: PALETTE[8], rust: PALETTE[9], dust: PALETTE[10], ice: PALETTE[11],
  teal: PALETTE[12], green: PALETTE[13], red: PALETTE[14], gray: PALETTE[15],
};
