// Sensus et Affectus: card texts.
// Each card: la (Latin, lowercase = image file name), ru (Russian), blocks.
// A block is either
//   { w, d, reg, ex }  a word: headword, 1-3 sentences, register tag, example
//   { note }           a plain paragraph
//   { d, reg, ex, keep } like a word but without a bold headword; `keep` is
//                      what goes into "My words" when it is kept.
// Optional `also` on a word: other spellings that count as a match.
const CARDS = [
  { la: 'amor', ru: 'любовь', blocks: [
    { w: 'amateur', d: 'Someone who does something for pleasure, not for money. In Latin, "amator" meant a lover, so an amateur is a lover of an activity.', reg: 'neutral', ex: "She's an amateur astronomer." },
    { w: 'enamoured', also: ['enamored'], d: 'Charmed by something, keen on it. It is often used in the negative.', reg: 'formal', ex: 'The board is not enamoured of the plan.' },
    { w: 'amorous', d: 'Showing romantic or sexual desire. Today it often sounds slightly ironic.', reg: 'literary', ex: 'He ignored her amorous glances.' },
  ]},
  { la: 'gaudium', ru: 'радость', blocks: [
    { w: 'joy', d: 'Great happiness. It came into English through French "joie".', reg: 'everyday', ex: "There's real joy in discovering something new." },
    { w: 'enjoy', d: 'To take pleasure in something. It comes from the same French word.', reg: 'everyday', ex: 'We enjoyed the talk.' },
    { w: 'rejoice', d: 'To feel or show great joy. It has a solemn, sometimes religious tone.', reg: 'formal', ex: 'There was little to rejoice about in the results.' },
  ]},
  { la: 'laetitia', ru: 'веселье', blocks: [
    { note: 'English has no common word from this root. It survives only as the name Letitia.' },
    { note: 'In Italian, "letizia" still means joy, but it is a literary word.' },
  ]},
  { la: 'felicitas', ru: 'счастье', blocks: [
    { w: 'felicitous', d: 'Well chosen and fitting. The meaning has shifted from "happy" to "apt".', reg: 'formal', ex: 'It was a felicitous choice of words.' },
    { w: 'infelicitous', d: 'Unfortunate or badly chosen. It is a polite way to criticise wording.', reg: 'formal', ex: 'The minister made an infelicitous remark.' },
    { w: 'felicity', d: 'Great happiness, or a pleasing aptness of expression.', reg: 'literary', ex: 'Her prose has a rare felicity.' },
  ]},
  { la: 'voluptas', ru: 'удовольствие', blocks: [
    { w: 'voluptuous', d: 'Today it usually describes a full, curvy body. It can also describe something rich and sensual. The meaning has moved from pleasure itself to the body.', reg: 'literary; best avoided at work', ex: 'The wine is dark and voluptuous.' },
  ]},
  { la: 'tristitia', ru: 'печаль', blocks: [
    { note: 'English has no common word from this root.' },
    { note: 'The Romance languages kept it: "tristesse" in French, "tristeza" in Spanish and "tristezza" in Italian. All three mean sadness.' },
  ]},
  { la: 'ira', ru: 'гнев', blocks: [
    { w: 'irate', d: 'Very angry.', reg: 'neutral', ex: 'The hotline was flooded with irate customers.' },
    { w: 'ire', d: 'Anger. Journalists like it in headlines.', reg: 'literary', ex: 'The decision drew the ire of regulators.' },
    { w: 'irascible', d: "Easily made angry. It describes a person's character, not a moment.", reg: 'formal', ex: 'He was a brilliant but irascible professor.' },
  ]},
  { la: 'invidia', ru: 'зависть', blocks: [
    { w: 'envy', d: 'Wanting what someone else has. It came into English through French.', reg: 'everyday', ex: 'Their lab is the envy of the department.' },
    { w: 'invidious', d: 'Unfair and likely to cause resentment. The meaning has shifted from envy to unfairness.', reg: 'formal', ex: 'Comparing the two teams would be invidious.' },
  ]},
  { la: 'timor', ru: 'страх', blocks: [
    { w: 'timid', d: 'Shy and easily frightened. It comes from the Latin verb for "to fear".', reg: 'neutral', ex: 'Their first offer was rather timid.' },
    { w: 'timorous', d: 'Fearful and lacking confidence.', reg: 'literary', ex: "The government's response was timorous." },
  ]},
  { la: 'anxietas', ru: 'тревога', blocks: [
    { w: 'anxiety', d: 'A feeling of worry or unease.', reg: 'neutral', ex: 'There is growing anxiety about the results.' },
    { w: 'anxious', d: 'Worried. But "anxious to" can also mean eager to.', reg: 'neutral', ex: 'We are anxious to hear your feedback.' },
  ]},
  { la: 'admiratio', ru: 'восхищение', blocks: [
    { w: 'admire', d: 'To respect and approve of someone or something. In Latin, the verb meant "to wonder at".', reg: 'neutral', ex: 'I admire her precision.' },
    { w: 'admirable', d: 'Deserving respect.', reg: 'neutral, slightly formal', ex: 'The team made an admirable effort.' },
  ]},
  { la: 'pudor', ru: 'стыд', blocks: [
    { w: 'impudent', d: 'Rude and disrespectful. It means "without shame", so it is the opposite of the Latin word.', reg: 'formal, old-fashioned', ex: 'That was an impudent question.' },
    { w: 'impudence', d: 'Rudeness, cheek.', reg: 'formal', ex: 'He had the impudence to interrupt the chair.' },
    { note: 'In Spanish, "pudor" means modesty. In Italian, the word is "pudore".' },
  ]},
  { la: 'verecundia', ru: 'скромность', blocks: [
    { keep: 'argumentum ad verecundiam', d: 'English has no common word from this root. It survives in logic, in the Latin phrase "argumentum ad verecundiam": the appeal to authority. It means claiming something is true because an important person said so.', reg: 'academic', ex: "That's an appeal to authority, not evidence." },
    { note: 'In Spanish, the root became "vergüenza", and in Italian "vergogna". Both mean shame, not modesty.' },
  ]},
  { la: 'zelotypia', ru: 'ревность', blocks: [
    { note: 'The Latin word comes from Greek "zēlos", which meant eager rivalry. English took the root, not the word itself.' },
    { w: 'jealous', d: 'Resentful of a rival, or very protective of what you have.', reg: 'everyday', ex: 'Other labs are jealous of their funding.' },
    { w: 'zealous', d: 'Very eager and committed to a cause or task.', reg: 'formal', ex: 'A zealous reviewer found three more errors.' },
    { w: 'zealot', d: 'A fanatic. It is always negative.', reg: 'negative', ex: 'He was described as a free-market zealot.' },
  ]},
  { la: 'taedium', ru: 'скука', blocks: [
    { w: 'tedious', d: 'Long, slow and boring.', reg: 'neutral', ex: 'The approval process is tedious.' },
    { w: 'tedium', d: 'Boredom and monotony.', reg: 'formal', ex: 'Automation removes the tedium of data entry.' },
  ]},
  { la: 'fastidium', ru: 'отвращение', blocks: [
    { w: 'fastidious', d: 'Very careful about detail, and hard to please. The meaning has shifted from disgust to pickiness. It is a false friend.', reg: 'formal', ex: 'She is fastidious about accuracy.' },
    { note: 'In Spanish and Italian, "fastidio" means annoyance.' },
  ]},
];
