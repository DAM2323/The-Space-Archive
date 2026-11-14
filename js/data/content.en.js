// All player-facing English text lives here and is read through t('key').
// Scene files must not contain hardcoded player-facing strings.
//
// RULE: every factual claim must come from section 8 of the brief (the content
// pack) and carry a source id. Atmosphere is allowed, new facts are not.

export default {
  strings: {
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
    'options.textSize': 'Text size',
    'options.textSize.normal': 'Normal',
    'options.textSize.large': 'Large',
    'options.reducedMotion': 'Reduced motion',
    'options.on': 'On',
    'options.off': 'Off',
    'options.close': 'Back',

    // --- Shell ---
    'shell.rotate': 'Please rotate your device to landscape.',
  },

  // Machine stories and debrief cards are added from milestone M2 on.
  machines: {},
};
