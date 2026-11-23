// Writes brand/assets/deck.json (run: node scripts/assets/gen-deck.mjs brand/assets/deck.json). Edit here, not the JSON.
import { writeFileSync } from 'node:fs';
const A = (o = {}) => ({ type: 'ascii', ...o });
const L = (b, shift, window) => (window ? { type: 'light', window, b, shift } : { type: 'light', b, shift });
const logo = (o = {}) => ({ type: 'logo', lockup: 'horizontal', color: 'white', box: [96, 96, 240, 36.721], align: 'left', corner: 'top-left', ...o });
// Copy in a stack: it closes up around what is there and steps down together when it is long.
const I = (slot, face, size, leading, gap = 0, o = {}) => ({ type: 'text', slot, face, size, leading, gap, ...o });
const S = (box, items, o = {}) => ({ type: 'stack', box, items, ...o });
const P = (index, box, o = {}) => ({ type: 'photo', index, box, ...o });
const label = () => ({ type: 'text', slot: 'label', face: 'label', size: 16, leading: 16, x: 1224, top: 104, w: 600, align: 'right', maxLines: 1, min: 14, corner: 'top-right' });
const D = { width: 1920, height: 1080, frame: [96, 96, 1728, 888], unit: 1.333 };
const CURVED = [[[-31,518],[106,596.8],[106,1196.2],[-31,1275]],[[122,606],[306,645.4],[306,1147.6],[122,1187]],[[323,649],[542,669.2],[542,1123.8],[323,1144]],[[561,671],[802,680.3],[802,1112.7],[561,1122]],[[819,681],[1069,681],[1069,1112],[819,1112]],[[1088,680.3],[1330,671],[1330,1122],[1088,1112.7]],[[1347,669.4],[1566,649],[1566,1144],[1347,1123.6]],[[1583,645.3],[1766,606],[1766,1187],[1583,1147.7]],[[1783,596.3],[1920,518],[1920,1275],[1783,1196.7]]];
const TAG = '{tagline}';
const NOTE_CURVED = 'The curved strip is a vector not among the exports; this window onto the brand heat map (its lit arm) keeps the composition.';
const NOTE = 'The covers’ "Background light" is a vector not among the exports; this window onto the brand heat map was chosen by fitting it against the reference render.';
const QUOTE = [I('quote', 'display', 64, 68.5, 0, { maxLines: 5 }), I('name', 'medium', 32, 42.5, 80, { maxLines: 2 }), I('role', 'label', 16, 20, 28, { maxLines: 2 })];
const slides = [
  { id: 'cover-row', group: 'cover', name: 'Cover, row of creatives', figma: '966:4590', note: NOTE, description: 'Five pictures in a row, the tagline bottom left, the light at the right edge.', photos: 5,
    slots: { headline: TAG, label: 'Pitch deck' },
    required: ['headline'], minPhotos: 1,
    sizes: { slide: { ...D, layers: [A(), L([-2068,-1808,5244,3278], 34),
      P(0, [560, 325, 200, 250]), P(1, [776, 300, 240, 300]), P(2, [1032, 260, 304, 380]), P(3, [1352, 300, 240, 300]), P(4, [1608, 325, 200, 250]),
      logo(), label(), S([96, 620, 1000, 364], [I('headline', 'display', 112, 112, 0, { maxLines: 2 })], { prefer: 796, grow: 1600 })] } } },
  { id: 'cover-inline', group: 'cover', name: 'Cover, creatives inline with the heading', figma: '966:4605', note: NOTE, description: 'The tagline at 144px with two pictures set between its words.', photos: 2,
    slots: { headline: TAG, label: 'Pitch deck' },
    required: ['headline'], minPhotos: 1,
    sizes: { slide: { ...D, layers: [A(), L([-3345,-1700,6409,4007], 34), logo(), label(),
      { type: 'inline', slot: 'headline', face: 'display', size: 144, leading: 176, x: 96, top: 430, w: 1728, bottom: 984, gap: 32, required: true, lines: [[{ words: 2 }, { photo: 0, w: 200 }, { words: 1 }], [{ photo: 1, w: 260 }, { words: 'rest' }]] }] } } },
  { id: 'cover-curved', group: 'cover', name: 'Cover, curved strip', figma: '966:4619', note: NOTE_CURVED, description: 'Nine pictures on a curved wall under the curved strip of light, the tagline top right.', photos: 9,
    slots: { headline: TAG },
    required: ['headline'], minPhotos: 1,
    sizes: { slide: { ...D, layers: [A(), L([-800,-3000,8000,5001], 50),
      ...CURVED.map((quad, i) => ({ type: 'panel', quad, index: i })),
      logo(), S([924, 96, 900, 420], [I('headline', 'display', 112, 112, 0, { maxLines: 2 })], { align: 'right' })] } } },
  // Content slides, derived from the covers' rules: 96px margins, the lockup top left, a label top right, Funnel Display
  // 112 to 240 for headings, DM Sans 32 at 1.33 for text (the posts' 24 at the deck's lockup ratio, 240 to 183), the
  // light flowing in from an edge and the texture kept clear of the copy.
  { id: 'section', group: 'content', name: 'Section', figma: 'derived', description: 'A section opener: a label and a 144px title bottom left, the light ring at the right edge.',
    slots: { kicker: 'Section 01', headline: 'The only creative search engine.', label: 'Pitch deck' },
    required: ['headline'],
    sizes: { slide: { ...D, layers: [A(), L([-3345,-1700,6409,4007], 34), logo(), label(),
      S([96, 240, 1500, 744], [I('kicker', 'label', 16, 20, 0, { maxLines: 2 }), I('headline', 'display', 144, 144, 48.4, { maxLines: 2 })], { valign: 'bottom', prefer: 910 })] } } },
  { id: 'statement', group: 'content', name: 'Statement', figma: 'derived', description: 'One statement at 112px over the curved strip.',
    slots: { headline: 'Know what changed before your next meeting.', label: 'Pitch deck' },
    required: ['headline'],
    sizes: { slide: { ...D, layers: [A(), { type: 'light', window: [0, 700, 1920, 380], variant: 'curved-strip' }, logo(), label(),
      S([96, 190, 1500, 470], [I('headline', 'display', 112, 112, 0, { maxLines: 3 })], { prefer: 300, grow: 1728 })] } } },
  { id: 'bullets', group: 'content', name: 'Bullets', figma: 'derived', description: 'A title on the left, up to six points on the right, a light strip at the right edge.',
    slots: { headline: 'Understand what is working in any category.', items: 'AI-powered research across brands, creators, ads, and campaigns | Unlimited board swipe files, alerts, and tracked brands | Unlimited team seats', label: 'Pitch deck' },
    required: ['headline', 'items'],
    sizes: { slide: { ...D, layers: [A(), L([-2014,-160,2241,1401], 34, [1760, 0, 160, 1080]), logo(), label(),
      S([96, 200, 720, 784], [I('headline', 'display', 72, 77, 0, { maxLines: 4 })], { prefer: 260 }),
      S([920, 200, 760, 784], [{ type: 'list', slot: 'items', face: 'body', size: 32, leading: 42.5, w: 720, itemGap: 48, maxLines: 3, min: 22 }], { prefer: 268, grow: 760 })] } } },
  { id: 'stat', group: 'content', name: 'Stat', figma: 'derived', description: 'One number at 240px and what it means, over a light band.',
    slots: { stat: '$10', body: 'for your first month, then $20/month', label: 'Pitch deck' },
    required: ['stat'],
    sizes: { slide: { ...D, layers: [A(), L([-2366,-53,5179,3238], 78.6, [0, 820, 1920, 260]), logo(), label(),
      S([96, 200, 1728, 580], [I('stat', 'display', 240, 240, 0, { maxLines: 1, min: 96 }), I('body', 'body', 32, 42.5, 72, { maxLines: 2, w: 1100 })], { prefer: 300 })] } } },
  { id: 'quote', group: 'content', name: 'Quote', figma: 'derived from Ad, testimonial (966:4502)', description: 'A portrait, the quote at 64px, the name and role, over a light band.', photos: 1,
    slots: { quote: '“This is the only tool that gives me full competitive visibility across every account I manage.”', name: 'Acme customer', role: 'Head of growth, Acme', label: 'Pitch deck' },
    required: ['quote'], minPhotos: 0,
    sizes: { slide: { ...D, layers: [A(), L([-2366,-53,5179,3238], 78.6, [0, 920, 1920, 160]), logo(), label(),
      P(0, [96, 220, 560, 700], { id: 'picture' }),
      S([736, 190, 1088, 680], QUOTE, { prefer: 300, when: 'pictures' }),
      S([96, 190, 1400, 680], QUOTE, { prefer: 300, when: 'no-pictures' })] } } },
  { id: 'image', group: 'content', name: 'Image', figma: 'derived', description: 'A picture filling the right half, a title and a line on the left, a light strip at the left edge.', photos: 1,
    slots: { headline: 'Search millions of creators in one place.', body: 'Spyglass monitors millions of brands and creators across Meta Ads, Instagram, and TikTok.' },
    required: ['headline'], minPhotos: 1,
    sizes: { slide: { ...D, layers: [A(), L([-134,-160,2241,1401], 34, [0, 0, 160, 1080]), P(0, [960, 0, 960, 1080], { id: 'picture', bleeds: true }),
      logo({ box: [232, 96, 240, 36.721] }),
      S([232, 190, 648, 794], [I('headline', 'display', 72, 77, 0, { maxLines: 4 }), I('body', 'body', 32, 42.5, 56, { maxLines: 5 })], { prefer: 300 })] } } },
  { id: 'closing', group: 'content', name: 'Closing', figma: 'derived from Ad, plan offer (966:4541)', description: 'The light field above a centered closing line, a button and the domain.',
    slots: { headline: TAG, cta: 'Start Creator for 50% off', url: '{domain}' },
    required: ['headline'],
    sizes: { slide: { ...D, layers: [A(), L([-1652,-69,4383,2740], 66.5, [0, 0, 1920, 420]),
      { type: 'logo', lockup: 'horizontal', color: 'white', box: [840, 500, 240, 36.721], align: 'center' },
      S([410, 580, 1100, 384], [I('headline', 'display', 112, 112, 0, { align: 'center', maxLines: 2 }), { type: 'button', slot: 'cta', w: 360, h: 72, size: 24, gap: 60 }], { align: 'center', prefer: 610, grow: 1400 }),
      { type: 'text', slot: 'url', face: 'label', size: 16, leading: 16, x: 560, top: 1000, w: 800, align: 'center', maxLines: 1, min: 14 }] } } },
];
writeFileSync(process.argv[2], JSON.stringify({ $comment: 'Deck slides at 1920 by 1080: the three covers from the Figma pitch deck section (frame sizes and positions from its layer tree, type measured from the reference renders) and content slides derived from the same rules. A deck is a list of slides: `deck --input deck.json` with { "slides": [{ "type": "cover-row", "headline": "...", "images": ["a.png"] }] }.', templates: slides }, null, 1) + '\n');
console.log(slides.length, 'slides');
