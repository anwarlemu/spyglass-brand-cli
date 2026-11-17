import { brand } from '../lib/brand.js';
import { renderVideo, writeVideos, type WrittenVideo } from '../video/render.js';
import { refuseVideo, resolveVideo, videoCatalog, VIDEO_CODEC, VIDEO_FPS, VIDEO_FRAMES } from '../video/spec.js';

type Flags = Record<string, string | boolean | string[] | undefined>;

export function videoHelp(): string {
	const b = brand().bin;
	return [
		'Short videos from the brand tokens, the vendored faces and the logo files.',
		`Headless Motion JPEG MP4, ${VIDEO_FRAMES} frames at ${VIDEO_FPS} fps. The same inputs write the same bytes.`,
		'No browser and no system fonts. The file plays in ffprobe, ffmpeg, VLC and QuickTime. It is not H.264.',
		'',
		`  ${b} video --template headline --size square --title "..."`,
		`  ${b} video --template statement --size landscape --title "..." --text "..."`,
		`  ${b} video --template announcement --size vertical --title "..." --eyebrow "..." --text "..."`,
		`  ${b} video --template logo --size all`,
		`  ${b} video --list`,
		'',
		'Templates: headline, statement, announcement, logo. There is no default template.',
		'Sizes: square 1080x1080, vertical 1080x1920 (9:16), landscape 1920x1080 (16:9). Default size is square. --size all writes every size.',
		'--ground paper (the default) or ink. --out is a directory (default imagery/) or one .mp4 when there is one size.',
		'Headline does not draw --text. Logo does not draw a title, --text or --eyebrow.',
		'--text and --subtitle must match when both are set.',
	].join('\n');
}

export async function runVideo(cwd: string, args: string[], flags: Flags): Promise<{ json: unknown; text: string }> {
	if (flags.help === true) return { json: videoCatalog(), text: videoHelp() };
	if (flags.list === true || args[0] === 'list') {
		const spec = videoCatalog();
		const text = [
			'Templates',
			...spec.templates.map((template) => `  ${template.id.padEnd(16)}${template.description}`),
			'',
			'Sizes',
			...spec.sizes.map((size) => `  ${size.id.padEnd(16)}${String(size.width).padStart(4)}x${size.height}  ${size.description}`),
			'',
			'Grounds',
			...spec.grounds.map((ground) => `  ${ground.id.padEnd(16)}${ground.description}`),
			'',
			`${spec.frames} frames at ${spec.fps} fps. ${spec.codec} in ${spec.container}.`,
		].join('\n');
		return { json: spec, text };
	}
	blank(flags, ['template', 'title', 'text', 'subtitle', 'eyebrow', 'size', 'ground', 'out']);
	if (args.length) throw new Error(`Unexpected \`${args.join(' ')}\`. Pass --template, --size and --title.`);
	const textFlag = str(flags.text);
	const subtitle = str(flags.subtitle);
	if (textFlag && subtitle && textFlag !== subtitle) throw new Error('--text and --subtitle disagree. Pass one.');
	const requested = resolveVideo({ template: str(flags.template), size: str(flags.size), ground: str(flags.ground) });
	const title = str(flags.title);
	const text = textFlag || subtitle;
	const eyebrow = str(flags.eyebrow);
	refuseVideo(requested.template, { title, text, eyebrow });
	const clips = await renderVideo({ ...requested, title, text, eyebrow });
	const files = writeVideos(cwd, str(flags.out), clips);
	return {
		json: { template: requested.template, ground: requested.ground, fps: VIDEO_FPS, frames: VIDEO_FRAMES, codec: VIDEO_CODEC, files: files.map(fileJson) },
		text: files.map((file) => `${file.path}  ${file.width}x${file.height}  ${file.frames} frames at ${file.fps} fps`).join('\n'),
	};
}

function fileJson(file: WrittenVideo) {
	return { path: file.path, format: file.format, template: file.template, size: file.size, ground: file.ground, width: file.width, height: file.height, fps: file.fps, frames: file.frames };
}

function str(value: string | boolean | string[] | undefined): string | undefined {
	return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function blank(flags: Flags, names: string[]) {
	for (const name of names) if (flags[name] === '' || flags[name] === true) throw new Error(`--${name} needs a value.`);
}
