// Writes brand/assets/deck.json (run: node scripts/assets/gen-deck.mjs brand/assets/deck.json). Edit here, not the JSON.
import { writeFileSync } from 'node:fs';
// Drawn as the site draws, at 4/3 of its pixels (a 1920 slide for the site's 1440 page): Funnel Display heads at 450 on
// its steps with four pixels of leading, DM Sans text in the secondary gray, labels in capitals, #262626 cards and picture
// tiles on the 4px container corner, the large White button on the 8px control corner, the ASCII texture tile, and the
// site's own light images (brand/assets/art) where a light runs: its share card's light at the right edge, the close
// band above, its ribbons along an edge.
const K = 4 / 3;
const px = (n) => Math.round(n * K * 100) / 100;
const A = (o = {}) => ({ type: 'ascii', ...o });
/** A piece of the site's light art, cropped to cover the box. */
const L = (file, box, o = {}) => ({ type: 'art', id: 'light', file, box, fit: 'cover', ...o });
const EDGE = (x) => L(x ? 'video-light-b' : 'video-light-a', [x, 0, 160, 1080], { turn: true, ...(x ? { flip: 'x' } : {}) });
const SHARE = L('og-light', [1920 - 1521, 0, 1521, 1080], { fit: 'fill' });
const CLOSE = L('close-band', [0, 0, 1920, 400], { at: [0.5, 0.42] });
const RIBBON = (y, h, b = false) => L(b ? 'video-light-b' : 'video-light-a', [0, y, 1920, h]);
const TEXT_2 = 'neutral-11';
/** Site steps at 4/3: [size, line]. */
const H = { xl: [px(112), px(116)], l: [px(96), px(100)], m: [px(72), px(76)], h1: [px(56), px(60)], h2: [px(44), px(48)], h4: [px(32), px(36)], h5: [px(24), px(28)] };
const T = { body: [px(24), px(32)], small: [px(20), px(28)], label: [px(12), px(16)] };
const logo = (o = {}) => ({ type: 'logo', lockup: 'horizontal', color: 'white', box: [96, 96, 240, 36.721], align: 'left', corner: 'top-left', ...o });
// Copy in a stack: it closes up around what is there and steps down together when it is long.
const I = (slot, face, size, leading, gap = 0, o = {}) => ({ type: 'text', slot, face, size, leading, gap, ...o });
const S = (box, items, o = {}) => ({ type: 'stack', box, items, ...o });
const P = (index, box, o = {}) => ({ type: 'photo', index, box, ...o });
const label = () => ({ type: 'text', slot: 'label', face: 'label', size: T.label[0], leading: T.label[1], x: 1224, top: 104, w: 600, align: 'right', maxLines: 1, min: 14, corner: 'top-right', color: TEXT_2 });
const head = (slot, step, gap = 0, o = {}) => I(slot, 'display', H[step][0], H[step][1], gap, o);
const text = (slot, gap = 0, o = {}) => I(slot, 'body', T.body[0], T.body[1], gap, { color: TEXT_2, ...o });
const small = (slot, gap = 0, o = {}) => I(slot, 'label', T.label[0], T.label[1], gap, { color: TEXT_2, ...o });
const BUTTON = { type: 'button', slot: 'cta', w: 240, h: px(56), size: px(20), radius: px(8) };
const R = px(4);
const D = { width: 1920, height: 1080, frame: [96, 96, 1728, 888], unit: 1.333 };
const CURVED = [[[-31,518],[106,596.8],[106,1196.2],[-31,1275]],[[122,606],[306,645.4],[306,1147.6],[122,1187]],[[323,649],[542,669.2],[542,1123.8],[323,1144]],[[561,671],[802,680.3],[802,1112.7],[561,1122]],[[819,681],[1069,681],[1069,1112],[819,1112]],[[1088,680.3],[1330,671],[1330,1122],[1088,1112.7]],[[1347,669.4],[1566,649],[1566,1144],[1347,1123.6]],[[1583,645.3],[1766,606],[1766,1187],[1583,1147.7]],[[1783,596.3],[1920,518],[1920,1275],[1783,1196.7]]];
const TAG = '{tagline}';
const QUOTE = [head('quote', 'h1', 0, { maxLines: 5 }), I('name', 'medium', T.body[0], T.body[1], 64, { maxLines: 2 }), small('role', 16, { maxLines: 2 })];
const slides = [
  { id: 'cover-row', group: 'cover', name: 'Cover, row of creatives', figma: '966:4590', description: 'Five pictures in a row, the tagline bottom left, the site’s share card light at the right edge.', photos: 5,
    slots: { headline: TAG, label: 'Pitch deck' },
    required: ['headline'], minPhotos: 1,
    sizes: { slide: { ...D, layers: [A({ from: 'right' }), SHARE,
      P(0, [560, 325, 200, 250], { radius: R }), P(1, [776, 300, 240, 300], { radius: R }), P(2, [1032, 260, 304, 380], { radius: R }), P(3, [1352, 300, 240, 300], { radius: R }), P(4, [1608, 325, 200, 250], { radius: R }),
      logo(), label(), S([96, 672, 1000, 312], [head('headline', 'l', 0, { maxLines: 2 })], { prefer: 796 })] } } },
  { id: 'cover-inline', group: 'cover', name: 'Cover, creatives inline with the heading', figma: '966:4605', description: 'The tagline at 149px (the site’s 112) with two pictures set between its words, a corner light.', photos: 2,
    slots: { headline: TAG, label: 'Pitch deck' },
    required: ['headline'], minPhotos: 1,
    sizes: { slide: { ...D, layers: [A(), L('corner-br', [1920 - 640, 1080 - 480, 640, 480]), logo(), label(),
      { type: 'inline', slot: 'headline', face: 'display', size: H.xl[0], leading: H.xl[1] + 20, x: 96, top: 430, w: 1728, bottom: 984, gap: 32, required: true, lines: [[{ words: 2 }, { photo: 0, w: 200 }, { words: 1 }], [{ photo: 1, w: 260 }, { words: 'rest' }]] }] } } },
  { id: 'cover-curved', group: 'cover', name: 'Cover, curved wall', figma: '966:4619', description: 'Nine pictures on a curved wall in front of the site’s hero band, the tagline top right.', photos: 9,
    slots: { headline: TAG },
    required: ['headline'], minPhotos: 1,
    sizes: { slide: { ...D, layers: [A({ strength: 'hero' }), L('hero-band', [0, 540, 1920, 340]),
      ...CURVED.map((quad, i) => ({ type: 'panel', quad, index: i, bleeds: true })),
      logo(), S([924, 96, 900, 420], [head('headline', 'l', 0, { maxLines: 2 })], { align: 'right' })] } } },
  // Content slides, derived from the covers' rules: 96px margins, the lockup top left, a label top right, the site's
  // head steps at 4/3, its 24/32 text at 4/3 (32/43), a light from the site's art along an edge.
  { id: 'section', group: 'content', name: 'Section', figma: 'derived', description: 'A section opener: a label and a 149px title bottom left, the site’s share card light at the right edge.',
    slots: { kicker: 'Section 01', headline: 'The only creative search engine.', label: 'Pitch deck' },
    required: ['headline'],
    sizes: { slide: { ...D, layers: [A({ from: 'right' }), SHARE, logo(), label(),
      S([96, 240, 1160, 744], [small('kicker', 0, { maxLines: 2 }), head('headline', 'xl', 40, { maxLines: 2 })], { valign: 'bottom', prefer: 910 })] } } },
  { id: 'statement', group: 'content', name: 'Statement', figma: 'derived', description: 'One statement at 128px over a light ribbon.',
    slots: { headline: 'Know what changed before your next meeting.', label: 'Pitch deck' },
    required: ['headline'],
    sizes: { slide: { ...D, layers: [A({ from: 'top' }), RIBBON(700, 380), logo(), label(),
      S([96, 190, 1500, 470], [head('headline', 'l', 0, { maxLines: 3 })], { prefer: 300, grow: 1728 })] } } },
  { id: 'bullets', group: 'content', name: 'Bullets', figma: 'derived', description: 'A title on the left, up to six points on the right, a light ribbon upright at the right edge.',
    slots: { headline: 'Understand what is working in any category.', items: 'AI-powered research across brands, creators, ads, and campaigns | Unlimited board swipe files, alerts, and tracked brands | Unlimited team seats', label: 'Pitch deck' },
    required: ['headline', 'items'],
    sizes: { slide: { ...D, layers: [A(), EDGE(1760), logo(), { ...label(), x: 1064 }, // the label stands clear of the strip
      S([96, 200, 720, 784], [head('headline', 'h1', 0, { maxLines: 4 })], { prefer: 260 }),
      S([920, 200, 760, 784], [{ type: 'list', slot: 'items', face: 'body', size: T.body[0], leading: T.body[1], w: 720, itemGap: 40, maxLines: 3, min: 22, color: TEXT_2 }], { prefer: 268, grow: 760 })] } } },
  { id: 'stat', group: 'content', name: 'Stat', figma: 'derived', description: 'One number at 240px and what it means, over a light ribbon.',
    slots: { stat: '$10', body: 'for your first month, then $20/month', label: 'Pitch deck' },
    required: ['stat'],
    sizes: { slide: { ...D, layers: [A({ from: 'top' }), RIBBON(820, 260), logo(), label(),
      S([96, 200, 1728, 580], [I('stat', 'display', 240, 245, 0, { maxLines: 1, min: 96 }), text('body', 48, { maxLines: 2, w: 1100 })], { prefer: 300 })] } } },
  { id: 'quote', group: 'content', name: 'Quote', figma: 'derived from Ad, testimonial (966:4502)', description: 'A portrait, the quote at 75px, the name and role, over a light ribbon.', photos: 1,
    slots: { quote: '“This is the only tool that gives me full competitive visibility across every account I manage.”', name: 'Acme customer', role: 'Head of growth, Acme', label: 'Pitch deck' },
    required: ['quote'], minPhotos: 0,
    sizes: { slide: { ...D, layers: [A({ from: 'right' }), RIBBON(920, 160, true), logo(), label(),
      P(0, [96, 220, 560, 660], { id: 'picture', radius: R }),
      S([736, 190, 1088, 680], QUOTE, { prefer: 300, when: 'pictures' }),
      S([96, 190, 1400, 680], QUOTE, { prefer: 300, when: 'no-pictures' })] } } },
  { id: 'image', group: 'content', name: 'Image', figma: 'derived', description: 'A picture filling the right half, a title and a line on the left, a light ribbon upright at the left edge.', photos: 1,
    slots: { headline: 'Search millions of creators in one place.', body: 'Spyglass monitors millions of brands and creators across Meta Ads, Instagram, and TikTok.' },
    required: ['headline'], minPhotos: 1,
    sizes: { slide: { ...D, layers: [A({ from: 'left' }), EDGE(0), P(0, [960, 0, 960, 1080], { id: 'picture', bleeds: true }),
      logo({ box: [232, 96, 240, 36.721] }),
      S([232, 190, 648, 794], [head('headline', 'h1', 0, { maxLines: 4 }), text('body', 40, { maxLines: 5 })], { prefer: 300 })] } } },
  { id: 'closing', group: 'content', name: 'Closing', figma: 'derived from Ad, plan offer (966:4541)', description: 'The site’s close band above a centered closing line, a button and the domain.',
    slots: { headline: TAG, cta: 'Start Creator for 50% off', url: '{domain}' },
    required: ['headline'],
    sizes: { slide: { ...D, layers: [A({ strength: 'hero' }), CLOSE,
      { type: 'logo', lockup: 'horizontal', color: 'white', box: [840, 500, 240, 36.721], align: 'center' },
      S([410, 580, 1100, 384], [head('headline', 'l', 0, { align: 'center', maxLines: 2 }), { ...BUTTON, gap: 48 }], { align: 'center', prefer: 610, grow: 1400 }),
      { type: 'text', slot: 'url', face: 'label', size: T.label[0], leading: T.label[1], x: 560, top: 1000, w: 800, align: 'center', maxLines: 1, min: 14, color: TEXT_2 }] } } },
  // More content slides by the same rules (#262626 cards and picture tiles on the site's 4px corner, at 4/3).
  { id: 'agenda', group: 'content', name: 'Agenda', figma: 'derived', description: 'A title on the left, the items numbered on the right in Funnel Display, a light ribbon upright at the left edge.',
    slots: { headline: 'Agenda', items: '01  Where creative is going | 02  What we found | 03  What we will do next', label: 'Pitch deck' },
    required: ['headline', 'items'],
    sizes: { slide: { ...D, layers: [A({ from: 'right' }), EDGE(0), logo({ box: [232, 96, 240, 36.721] }), label(),
      S([232, 200, 560, 784], [head('headline', 'l', 0, { maxLines: 3 })], { prefer: 260 }),
      S([880, 200, 944, 784], [{ type: 'list', slot: 'items', face: 'display', size: H.h2[0], leading: H.h2[1], w: 944, itemGap: 48, maxLines: 2, min: 32 }], { prefer: 268 })] } } },
  { id: 'timeline', group: 'content', name: 'Timeline', figma: 'derived', description: 'A title, then up to four steps on a hairline, each a label (a date) and a line.',
    slots: { headline: 'From question to answer.', 'when-1': 'Week 1', 'step-1': 'Connect the brands you track.', 'when-2': 'Week 2', 'step-2': 'See every launch the day it ships.', 'when-3': 'Week 4', 'step-3': 'Share boards with the team.', 'when-4': '', 'step-4': '', label: 'Pitch deck' },
    required: ['headline', 'step-1'],
    sizes: { slide: { ...D, layers: [A({ from: 'top' }), RIBBON(920, 160), logo(), label(),
      S([96, 190, 1500, 300], [head('headline', 'h1', 0, { maxLines: 2 })], { prefer: 230 }),
      { type: 'rect', id: 'rule', box: [96, 560, 1728, 2], fill: 'neutral-5' },
      ...[0, 1, 2, 3].map((n) => S([96 + n * 444, 600, 396, 280], [small(`when-${n + 1}`, 0, { maxLines: 1 }), text(`step-${n + 1}`, 24, { maxLines: 4, color: 'white' })]))] } } },
  { id: 'team', group: 'content', name: 'Team', figma: 'derived', description: 'A title and up to four people: a picture each (yours, never stock), the name and the role.', photos: 4,
    slots: { headline: 'The team.', 'name-1': 'Alex Kim', 'role-1': 'Founder', 'name-2': 'Sam Lee', 'role-2': 'Engineering', 'name-3': '', 'role-3': '', 'name-4': '', 'role-4': '', label: 'Pitch deck' },
    required: ['headline', 'name-1'], minPhotos: 0,
    sizes: { slide: { ...D, layers: [A(), EDGE(1760), logo(), { ...label(), x: 1064 },
      S([96, 190, 1500, 200], [head('headline', 'h1', 0, { maxLines: 1 })], { prefer: 230 }),
      ...[0, 1, 2, 3].map((n) => P(n, [96 + n * 412, 360, 376, 420], { id: `picture-${n + 1}`, radius: R })),
      ...[0, 1, 2, 3].map((n) => S([96 + n * 412, 810, 376, 170], [head(`name-${n + 1}`, 'h4', 0, { maxLines: 1 }), I(`role-${n + 1}`, 'body', T.small[0], T.small[1], 16, { maxLines: 2, color: TEXT_2 })]))] } } },
  { id: 'comparison', group: 'content', name: 'Comparison', figma: 'derived', description: 'A title and two cards side by side, each a heading and its points.',
    slots: { headline: 'Before and after.', 'left-title': 'Before', 'left-items': 'Screenshots at midnight | Five tabs per brand', 'right-title': 'After', 'right-items': 'One search across every network | Alerts the day it ships', label: 'Pitch deck' },
    required: ['headline'],
    sizes: { slide: { ...D, layers: [A({ from: 'top' }), RIBBON(960, 120, true), logo(), label(),
      S([96, 190, 1500, 200], [head('headline', 'h1', 0, { maxLines: 2 })], { prefer: 230 }),
      ...['left', 'right'].map((side, n) => S([96 + n * 880, 400, 848, 520], [{ type: 'card', id: `${side}-card`, w: 848, pad: px(32), fill: 'neutral-4', radius: R, items: [head(`${side}-title`, 'h4', 0, { maxLines: 1 }), { type: 'list', slot: `${side}-items`, face: 'body', size: T.body[0], leading: T.body[1], itemGap: 16, gap: 32, maxLines: 2, min: 24, color: TEXT_2 }] }]))] } } },
  { id: 'image-grid', group: 'content', name: 'Image grid', figma: 'derived', description: 'A title and up to six pictures in a grid (yours).', photos: 6,
    slots: { headline: 'What is running now.', label: 'Pitch deck' },
    required: ['headline'], minPhotos: 1,
    sizes: { slide: { ...D, layers: [A(), logo(), label(),
      S([96, 190, 1500, 160], [head('headline', 'h1', 0, { maxLines: 1 })], { prefer: 230 }),
      ...[0, 1, 2, 3, 4, 5].map((n) => P(n, [96 + (n % 3) * 584, 380 + Math.floor(n / 3) * 310, 560, 290], { id: `picture-${n + 1}`, radius: R }))] } } },
  { id: 'qa', group: 'content', name: 'Questions', figma: 'derived', description: 'The questions slide: a large title, a line and the address, the site’s close band above.',
    slots: { headline: 'Questions?', body: 'Write to us any time.', url: '{domain}' },
    required: ['headline'],
    sizes: { slide: { ...D, layers: [A({ strength: 'hero' }), CLOSE,
      { type: 'logo', lockup: 'horizontal', color: 'white', box: [840, 500, 240, 36.721], align: 'center' },
      S([410, 580, 1100, 384], [head('headline', 'xl', 0, { align: 'center', maxLines: 1 }), text('body', 40, { align: 'center', maxLines: 2 })], { align: 'center', prefer: 610 }),
      { type: 'text', slot: 'url', face: 'label', size: T.label[0], leading: T.label[1], x: 560, top: 1000, w: 800, align: 'center', maxLines: 1, min: 14, color: TEXT_2 }] } } },
];
// The corners the lockup may move to and keep its clear space at every size (scripts/assets/logo-anchors.mjs found them).
const LOGO_ANCHORS = {"cover-row":["top-left","top","top-right","bottom"],"cover-inline":["top-left","top","top-right","bottom-left","bottom"],"cover-curved":["top-left","top","top-right"],"section":["top-left","top","top-right"],"statement":["top-left","top","top-right"],"bullets":["top-left","top","bottom-left","bottom"],"stat":["top-left","top","top-right","bottom-right"],"quote":["top-left","top","top-right"],"image":["top-left"],"agenda":["top-left","top","top-right","bottom","bottom-right"],"timeline":["top-left","top","top-right"],"team":["top-left","top","bottom-left","bottom"],"comparison":["top-left","top","top-right"],"image-grid":["top-left","top","top-right"]};
for (const t of slides) if (LOGO_ANCHORS[t.id]) t.logoAnchors = LOGO_ANCHORS[t.id];
writeFileSync(process.argv[2], JSON.stringify({ $comment: 'Deck slides at 1920 by 1080: the three covers from the Figma pitch deck section (frame sizes and positions from its layer tree) and content slides derived from the same rules, drawn as the site draws at 4/3 of its pixels (its type steps, text gray, cards, buttons, texture and light images). A deck is a list of slides: `deck --input deck.json` with { "slides": [{ "type": "cover-row", "headline": "...", "images": ["a.png"] }] }.', templates: slides }, null, 1) + '\n');
console.log(slides.length, 'slides');
