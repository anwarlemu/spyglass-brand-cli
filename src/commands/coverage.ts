// "I need X" -> the command: every kind of graphic, document, page and part this command line makes, how it is made
// (a template, a recipe, compose, a command or a library item) and the command to start from. `missing` lists what it
// does not make and why. The agent guide prints the same table; manifest --json carries it.

export type CoverageRow = { need: string; how: 'template' | 'recipe' | 'compose' | 'command' | 'library'; run: string; sizes?: string };

export const COVERAGE: { rows: CoverageRow[]; missing: { need: string; why: string }[] } = {
	rows: [
		{ need: 'X post, LinkedIn post, Instagram post or portrait, Threads, Facebook post', how: 'template', run: 'image post-offer --headline "..." --size square|portrait|linkedin|facebook', sizes: 'square, portrait, linkedin, linkedin-square, facebook, og' },
		{ need: 'Instagram or TikTok story, Reels or TikTok cover', how: 'template', run: 'image story --headline "..."', sizes: 'story' },
		{ need: 'Instagram carousel', how: 'command', run: 'image --input carousel.json --out carousel' },
		{ need: 'Pinterest pin', how: 'template', run: 'image post-offer --headline "..." --size pinterest' },
		{ need: 'YouTube thumbnail', how: 'template', run: 'image og-site --headline "..." --size youtube-thumbnail' },
		{ need: 'YouTube channel art, X header, LinkedIn banner and page cover, Facebook cover', how: 'template', run: 'image banner-tagline --headline "..." --size youtube|x-banner|linkedin-banner|linkedin-page|facebook-cover' },
		{ need: 'Profile picture for any platform', how: 'template', run: 'image avatar' },
		{ need: 'Open Graph card (the site\'s own)', how: 'template', run: 'image og-site --headline "..." --page pricing --image a.png', sizes: 'og, landscape, linkedin, youtube-thumbnail, primary' },
		{ need: 'Google display ads 300x250, 336x280, 728x90, 300x600, 320x50, 160x600, 970x250', how: 'recipe', run: 'recipe ad-300x250 --set headline.text="..." --set button.text="..."' },
		{ need: 'Meta feed and story ad, LinkedIn ad', how: 'recipe', run: 'recipe meta-feed --size square|story|linkedin ...  (or image ad-search-bar, ad-photo)' },
		{ need: 'Quote, stat, customer story, launch or changelog, feature, comparison, pricing, event or webinar, hiring card', how: 'recipe', run: 'recipe quote-card|stat-card|customer-story|launch-card|feature-card|comparison|pricing-card|event-card|hiring-card ...' },
		{ need: 'Framed screenshot (the site\'s browser frame), before and after', how: 'recipe', run: 'recipe screenshot-card --image picture=shot.png ...; recipe before-after --image picture-1=a.png --image picture-2=b.png' },
		{ need: 'Chart (bar, line, donut), flow or architecture boxes', how: 'recipe', run: 'recipe chart-card --set chart.data="Mon 12, Tue 18"; recipe flow-diagram ...' },
		{ need: 'Anything no template or recipe anticipated, at any size', how: 'compose', run: 'design new compose --size <id|custom>; design compose add <file> <block> "..."; design revise <file> "..."' },
		{ need: 'One-pager, report cover, letterhead, certificate (A4 or Letter)', how: 'recipe', run: 'recipe one-pager|report-cover|letterhead|certificate --size a4|letter ...' },
		{ need: 'Business card (print size with bleed), event badge', how: 'recipe', run: 'recipe business-card|event-badge ...' },
		{ need: 'Email header, email signature', how: 'recipe', run: 'recipe email-header|email-signature ...' },
		{ need: 'Email templates (newsletter, announcement, receipt, password reset)', how: 'command', run: 'design page compose outline.json --flavor html (plain HTML; see missing for table-based mail)' },
		{ need: 'Deck: covers, section, statement, bullets, stat, quote, image, closing', how: 'template', run: 'deck --list; deck <slide> --headline "..."; deck --input deck.json' },
		{ need: 'Loops, stings and animated cards (MP4, WebM, GIF)', how: 'command', run: 'video --list; video <loop> --size square|vertical|landscape' },
		{ need: 'Favicon set, app icons, maskable icon, avatars, web manifest', how: 'command', run: 'icons' },
		{ need: 'Video-call background, desktop and phone wallpaper', how: 'recipe', run: 'recipe meeting-background|desktop-wallpaper|phone-wallpaper' },
		{ need: 'The light or the ASCII texture as a still at any size', how: 'command', run: 'light --variant band --width W --height H; ascii --width W --height H; illustrate pattern' },
		{ need: 'Merch: cap, tee front and back, hoodie, tote, mug wrap, sticker, poster, socks', how: 'command', run: 'merch --list; merch <item> --headline "..."' },
		{ need: 'Any component, section or page for a web app or site', how: 'library', run: 'list; add <item> (React or web components); design page compose outline.json --flavor react|elements|html' },
		{ need: 'Restyle an existing app to the brand', how: 'command', run: 'apply; check' },
	],
	missing: [
		{ need: 'Other companies\' logos, customer names and photos of real people', why: 'Never shipped: use Acme and --image with your own pictures.' },
		{ need: 'Graded or filtered photo treatments', why: 'The principles refuse grading: pictures stay in their posted color.' },
		{ need: 'Table-based email HTML for old mail clients', why: 'The page writer makes modern HTML on the brand stylesheet; mail-client tables are not built yet.' },
		{ need: 'Sticker sheet, notebook, lanyard and more poster sizes', why: 'Not sourced: the site and the guide have no rules for them; a print vendor\'s template is needed for each.' },
		{ need: 'Intro and outro stings, lower thirds, logo reveal and walkthrough videos', why: 'Not built yet: the video command draws the brand loops only.' },
		{ need: 'Deck agenda, team, timeline, chart, comparison, image-grid and Q&A slides', why: 'Not slide templates yet; compose at the primary size (1920x1080) makes any of them from the blocks.' },
	],
};
