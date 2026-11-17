// Motion JPEG in an MP4 container (QuickTime sample entry "jpeg").
// The file is a pure function of the JPEG frames, the pixel size and the frame rate: no dates, no encoder name
// beyond the fixed compressor label, no system library. Players that read Motion JPEG (ffprobe, ffmpeg, VLC,
// QuickTime) can open it. It is not H.264, so a browser video element may not.

const u16 = (n: number) => {
	const b = Buffer.alloc(2);
	b.writeUInt16BE(n);
	return b;
};
const u32 = (n: number) => {
	const b = Buffer.alloc(4);
	b.writeUInt32BE(n >>> 0);
	return b;
};
const four = (s: string) => Buffer.from(s, 'ascii');
const zeros = (n: number) => Buffer.alloc(n);

function box(type: string, ...parts: Buffer[]): Buffer {
	const body = Buffer.concat(parts);
	if (body.length + 8 > 0xffffffff) throw new Error('Video box is larger than 4 GiB.');
	return Buffer.concat([u32(body.length + 8), four(type), body]);
}

const MATRIX = Buffer.concat([u32(0x00010000), u32(0), u32(0), u32(0), u32(0x00010000), u32(0), u32(0), u32(0), u32(0x40000000)]);

export function muxMjpeg(frames: Buffer[], width: number, height: number, fps: number): Buffer {
	if (!frames.length) throw new Error('A video needs at least one frame.');
	if (!Number.isInteger(fps) || fps < 1) throw new Error('Frame rate must be a positive integer.');
	if (!Number.isInteger(width) || !Number.isInteger(height) || width < 1 || height > 65535 || height < 1 || width > 65535) throw new Error('Video size is not a whole pixel size the container can store.');
	for (const frame of frames) {
		if (frame.length < 4 || frame[0] !== 0xff || frame[1] !== 0xd8 || frame[frame.length - 2] !== 0xff || frame[frame.length - 1] !== 0xd9) throw new Error('A frame is not a JPEG.');
	}
	const count = frames.length;
	const ftyp = box('ftyp', four('isom'), u32(0), four('isom'), four('iso2'), four('mp41'));
	const payload = Buffer.concat(frames);
	const mdat = Buffer.concat([u32(payload.length + 8), four('mdat'), payload]);
	let cursor = ftyp.length + 8;
	const offsets: number[] = [];
	for (const frame of frames) {
		if (cursor > 0xffffffff) throw new Error('Video is larger than 4 GiB.');
		offsets.push(cursor);
		cursor += frame.length;
	}

	const mvhd = box(
		'mvhd',
		u32(0),
		u32(0),
		u32(0),
		u32(fps),
		u32(count),
		u32(0x00010000),
		u16(0x0100),
		zeros(10),
		MATRIX,
		zeros(24),
		u32(2),
	);
	const tkhd = box(
		'tkhd',
		u32(0x3),
		u32(0),
		u32(0),
		u32(1),
		u32(0),
		u32(count),
		zeros(8),
		u16(0),
		u16(0),
		u16(0),
		u16(0),
		MATRIX,
		u32(width << 16),
		u32(height << 16),
	);
	const mdhd = box('mdhd', u32(0), u32(0), u32(0), u32(fps), u32(count), u16(0x55c4), u16(0));
	const hdlr = box('hdlr', u32(0), u32(0), four('vide'), zeros(12), Buffer.from('VideoHandler\0', 'ascii'));
	const vmhd = box('vmhd', u32(1), u16(0), zeros(6));
	const url = box('url ', u32(1));
	const dref = box('dref', u32(0), u32(1), url);
	const dinf = box('dinf', dref);
	const compressor = Buffer.alloc(32);
	compressor[0] = 5;
	compressor.write('MJPEG', 1, 'ascii');
	const sample = box(
		'jpeg',
		zeros(6),
		u16(1),
		u16(0),
		u16(0),
		zeros(12),
		u16(width),
		u16(height),
		u32(0x00480000),
		u32(0x00480000),
		u32(0),
		u16(1),
		compressor,
		u16(24),
		u16(0xffff),
	);
	const stsd = box('stsd', u32(0), u32(1), sample);
	const stts = box('stts', u32(0), u32(1), u32(count), u32(1));
	const stsc = box('stsc', u32(0), u32(1), u32(1), u32(1), u32(1));
	const stsz = box('stsz', u32(0), u32(0), u32(count), ...frames.map((frame) => u32(frame.length)));
	const stco = box('stco', u32(0), u32(count), ...offsets.map((offset) => u32(offset)));
	const stbl = box('stbl', stsd, stts, stsc, stsz, stco);
	const minf = box('minf', vmhd, dinf, stbl);
	const mdia = box('mdia', mdhd, hdlr, minf);
	const trak = box('trak', tkhd, mdia);
	const moov = box('moov', mvhd, trak);
	return Buffer.concat([ftyp, mdat, moov]);
}
