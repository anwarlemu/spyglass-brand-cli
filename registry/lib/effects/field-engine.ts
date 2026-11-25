'use client'
// The site's dispersion field engine (effect/engine): a WebGL canvas that draws the brand light as soft blobs bent by
// slow waves, split into Blue, Green and Red, with its ASCII ghost, for a composition. It drifts at 30 frames a second
// while on screen, follows a fine pointer with a lens when interactive, takes cards' drag and a ring's ripple, and
// stands still (one frame, no pointer) with reduced motion or `still`. Tuning values are read from --ds-* custom
// properties on the canvas (the footer crest's --ds-footer-*, the run's --ds-ent-run-*, the horizon's --ds-hero-light-*).
import { createDrag, type Drag, type DragSource } from "@/lib/effects/field-drag";
import {
  horizonLayout,
  layout,
  ringLayout,
  type Anchor,
  type Composition,
  type Lens,
  type Ring,
  type Tune,
} from "@/lib/effects/field-layout";
import { FRAG, GLYPH_RAMP, MAX_BLOBS, VERT, WAVES } from "@/lib/effects/field-shader";


// The site sets some of these per width (tokens.css media blocks); the library keeps those as -md (768), -lg (1024)
// and -xl (1280) tokens beside the base one, so the widest that applies and is set wins.
const STEPS: [string, number][] = [["-xl", 1280], ["-lg", 1024], ["-md", 768]];
function byWidth(style: CSSStyleDeclaration, name: string): string {
  const w = typeof window === "undefined" ? 0 : window.innerWidth;
  for (const [suffix, min] of STEPS) {
    if (w < min) continue;
    const v = style.getPropertyValue(name + suffix).trim();
    if (v) return v;
  }
  return style.getPropertyValue(name).trim();
}
export type FieldOptions = {
  composition: Composition;
  seed: number;
  interactive: boolean;
  gain?: number;
  ascii?: boolean;
  still?: boolean;
  drag?: DragSource;
  ripple?: RippleSource;
  overlay?: boolean;
  /** Where the horizon composition looks for [data-light-anchor] and [data-light-clear] (the canvas's parent). */
  scope?: Element | null;
  /** The area whose pointer moves count for the crest ([data-light-area] around the canvas). */
  area?: Element | null;
};

const OVERLAY_FRAG = FRAG.replace(
  "gl_FragColor = vec4(clamp(light + u_ascii * glyph, 0.0, 1.0), 1.0);",
  "vec3 lit = clamp(light + u_ascii * glyph, 0.0, 1.0);\n" +
    "  gl_FragColor = vec4(lit, clamp(1.6 * max(lit.r, max(lit.g, lit.b)), 0.0, 1.0));",
);

export type RippleSource = {
  ring: (canvas: HTMLCanvasElement) => Ring | null;
  samples: number;
  reach: number;
  slope: number;
  sample: (out: Float32Array) => boolean;
  frozen: () => boolean;
};

export type FieldHandle = {
  gl: WebGLRenderingContext;
  draw: () => void;
  destroy: () => void;
};

const MAX_DPR = 2;
const PIXEL_BUDGET = 6e6;
const ASCII_OPACITY = 0.35;
const CELL = { w: 8, h: 16 };
const FALLBACK_FONT = "ui-monospace, SFMono-Regular, Menlo, monospace";
const LENS_REACH = 240;
const LENS: Lens = { radius: 240, zoom: 0.12, widen: 0.5, calm: 1, follow: 14, ease: 7, carry: 0 };
const LENS_FAST = 900;
const IDLE_FRAME_MS = 1000 / 30;
const RIPPLE_IDLE_FRAME_MS = 1000 / 15;
const SLOW_FRAME_MS = 40;
const SLOW_RUN = 30;

const WAVE_PERIOD = [110, 76, 92, 60];

const UNIFORMS = [
  "res",
  "dpr",
  "ground",
  "blob",
  "turn",
  "form",
  "count",
  "wave",
  "phase",
  "steep",
  "sigma",
  "gain",
  "pointer",
  "lens",
  "lensLight",
  "carry",
  "ascii",
  "ghost",
  "calm",
  "feather",
  "glyphs",
  "flow",
  "gust",
  "drag",
  "dragOn",
  "ripple",
  "rippleTex",
  "rippleRange",
  "band",
  "hollow",
  "tint",
  "ice",
  "spread",
  "spine",
  "spineTex",
  "crest",
  "crestOld",
] as const;

type Gpu = {
  program: WebGLProgram;
  buffer: WebGLBuffer;
  texture: WebGLTexture;
  dragTexture: WebGLTexture | null;
  rippleTexture: WebGLTexture | null;
  spineTexture: WebGLTexture | null;
  uniform: Record<(typeof UNIFORMS)[number], WebGLUniformLocation | null>;
};

function glyphAtlas(family: string, cw: number, ch: number) {
  const atlas = document.createElement("canvas");
  atlas.width = cw * GLYPH_RAMP.length;
  atlas.height = ch;
  const ctx = atlas.getContext("2d");
  if (!ctx) return atlas;
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, atlas.width, atlas.height);
  ctx.scale(cw / CELL.w, ch / CELL.h);
  ctx.fillStyle = "#fff";
  ctx.font = `13.333px ${family}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  for (let i = 0; i < GLYPH_RAMP.length; i++) ctx.fillText(GLYPH_RAMP[i], i * CELL.w + CELL.w / 2, 12);
  return atlas;
}

function build(
  gl: WebGLRenderingContext,
  withDrag: boolean,
  withRipple = false,
  overlay = false,
): Gpu | null {
  const compile = (type: number, source: string) => {
    const shader = gl.createShader(type);
    if (!shader) return null;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader;
    console.error("Dispersion field shader:", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  };
  const vert = compile(gl.VERTEX_SHADER, VERT);
  const frag = compile(gl.FRAGMENT_SHADER, overlay ? OVERLAY_FRAG : FRAG);
  const program = gl.createProgram();
  const buffer = gl.createBuffer();
  const texture = gl.createTexture();
  if (vert && frag && program) {
    gl.attachShader(program, vert);
    gl.attachShader(program, frag);
    gl.linkProgram(program);
  }
  gl.deleteShader(vert);
  gl.deleteShader(frag);
  if (!program || !buffer || !texture || !gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program);
    gl.deleteBuffer(buffer);
    gl.deleteTexture(texture);
    return null;
  }
  gl.useProgram(program);

  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, "a_pos");
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  const uniform = Object.fromEntries(
    UNIFORMS.map((name) => [name, gl.getUniformLocation(program, `u_${name}`)]),
  ) as Gpu["uniform"];

  let dragTexture: WebGLTexture | null = null;
  if (withDrag) {
    dragTexture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, dragTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.activeTexture(gl.TEXTURE0);
    gl.uniform1i(uniform.drag, 1);
  }

  let rippleTexture: WebGLTexture | null = null;
  if (withRipple) {
    rippleTexture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, rippleTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.activeTexture(gl.TEXTURE0);
    gl.uniform1i(uniform.rippleTex, 2);
  }
  return { program, buffer, texture, dragTexture, rippleTexture, spineTexture: null, uniform };
}

export function mountField(canvas: HTMLCanvasElement, options: FieldOptions): FieldHandle | null {
  const overlay = options.overlay === true;
  const gl = canvas.getContext("webgl", { antialias: false, alpha: overlay, powerPreference: "low-power" });
  if (!gl) return null;
  let gpu = build(gl, options.drag !== undefined, options.ripple !== undefined, overlay);
  if (!gpu) return null;

  const { composition, seed, gain = 1.05 } = options;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  let still = reduceMotion.matches || options.still === true;
  let lensEnabled = options.interactive && finePointer.matches && !still;

  let width = 0;
  let height = 0;
  let dpr = 1;
  let ceiling = MAX_DPR;
  let sigma = 4;
  let frame = layout(composition, 1, 1, 1);
  let font = FALLBACK_FONT;
  const blobData = new Float32Array(MAX_BLOBS * 4);
  const turnData = new Float32Array(MAX_BLOBS * 4);
  const formData = new Float32Array(MAX_BLOBS * 2);
  const waveData = new Float32Array(WAVES * 4);
  const phaseData = new Float32Array(WAVES);
  const drag: Drag | null = options.drag ? createDrag(options.drag) : null;
  const ripple = options.ripple ?? null;
  const rippleN = ripple ? ripple.samples : 0;
  const rippleValues = new Float32Array(rippleN * 4);
  const rippleBytes = new Uint8Array(rippleN * 2 * 4);
  let ring: Ring | null = null;
  let rippleOn = false;

  const scaleFor = (w: number, h: number) => {
    const screen = Math.min(window.devicePixelRatio || 1, ceiling);
    const fit = Math.sqrt(PIXEL_BUDGET / (w * h));
    return fit >= screen ? screen : Math.min(screen, Math.max(1, Math.floor(fit * 8) / 8));
  };

  const writeRipple = (on: boolean) => {
    if (!gpu?.rippleTexture || !ripple) return;
    for (let i = 0; i < rippleN * 2; i++) {
      const push = on ? Math.max(-1, Math.min(1, rippleValues[i] / ripple.reach)) : 0;
      const stir = on ? Math.max(0, Math.min(1, rippleValues[rippleN * 2 + i])) : 0;
      rippleBytes[i * 4] = Math.round((push * 0.5 + 0.5) * 255);
      rippleBytes[i * 4 + 1] = Math.round(stir * 255);
      rippleBytes[i * 4 + 2] = 0;
      rippleBytes[i * 4 + 3] = 255;
    }
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, gpu.rippleTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, rippleN, 2, 0, gl.RGBA, gl.UNSIGNED_BYTE, rippleBytes);
    gl.activeTexture(gl.TEXTURE0);
    rippleOn = on;
  };
  const syncRipple = () => {
    if (!ripple || still) return false;
    const moving = ripple.sample(rippleValues);
    if (moving || rippleOn) writeRipple(moving);
    return moving;
  };

  const writeSpine = () => {
    if (!gpu) return;
    const { spine } = frame;
    if (!spine) {
      gl.uniform4f(gpu.uniform.spine, 0, 0, 0, 0);
      return;
    }
    const n = spine.offsets.length;
    const range = Math.max(1, ...spine.offsets.map(Math.abs));
    const bytes = new Uint8Array(n * 4);
    for (let i = 0; i < n; i++) {
      const v = Math.round(((spine.offsets[i] / range) * 0.5 + 0.5) * 65535);
      bytes[i * 4] = v >> 8;
      bytes[i * 4 + 1] = v & 255;
      bytes[i * 4 + 2] = Math.round(Math.max(0, Math.min(1, spine.halves[i] / 2)) * 255);
      bytes[i * 4 + 3] = 255;
    }
    if (!gpu.spineTexture) gpu.spineTexture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE3);
    gl.bindTexture(gl.TEXTURE_2D, gpu.spineTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, n, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, bytes);
    gl.activeTexture(gl.TEXTURE0);
    gl.uniform1i(gpu.uniform.spineTex, 3);
    gl.uniform4f(gpu.uniform.spine, spine.blob + 1, spine.span, range, spine.at);
  };

  const prepare = () => {
    if (!gpu || !width || !height) return;
    const { uniform } = gpu;
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.bindTexture(gl.TEXTURE_2D, gpu.texture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      glyphAtlas(font, Math.round(CELL.w * dpr), Math.round(CELL.h * dpr)),
    );
    gl.uniform1i(uniform.glyphs, 0);
    gl.uniform1f(uniform.gain, gain);
    gl.uniform2f(uniform.res, canvas.width / dpr, canvas.height / dpr);
    gl.uniform1f(uniform.dpr, dpr);
    gl.uniform1f(uniform.sigma, sigma);
    gl.uniform1f(uniform.ground, frame.ground === "light" ? 1e5 : -1e5);
    gl.uniform1i(uniform.count, frame.blobs.length);
    const { ghost } = frame;
    gl.uniform1f(uniform.ascii, ghost && options.ascii !== false ? (frame.asciiOpacity ?? ASCII_OPACITY) : 0);
    if (ghost) gl.uniform4f(uniform.ghost, ghost.dx, ghost.dy, ghost.reach, (seed * 7.3) % 61);
    gl.uniform4f(uniform.calm, ...frame.calm);
    gl.uniform1f(uniform.feather, frame.feather);
    const lensSet = frame.lens ?? LENS;
    gl.uniform3f(uniform.lens, lensSet.radius, lensSet.zoom, lensSet.widen);
    gl.uniform2f(uniform.band, frame.band?.[0] ?? 0, frame.band?.[1] ?? 0);
    gl.uniform1f(uniform.hollow, frame.hollow ?? 0);
    gl.uniform1f(uniform.tint, frame.tint ?? 0);
    gl.uniform3f(uniform.ice, ...(frame.ice ?? [1, 1, 1]));
    gl.uniform1f(uniform.spread, frame.spread ?? 1);
    writeSpine();
    for (let i = 0; i < frame.blobs.length; i++) {
      const blob = frame.blobs[i];
      const rot = blob.rot ?? 0;
      turnData[i * 4] = Math.cos(rot);
      turnData[i * 4 + 1] = Math.sin(rot);
      turnData[i * 4 + 2] = blob.union ?? frame.blend;
      turnData[i * 4 + 3] = blob.bend ?? 1;
      formData[i * 2] = blob.light === false ? 1 : -1;
      formData[i * 2 + 1] = blob.tri ?? 0;
    }
    gl.uniform4fv(uniform.turn, turnData);
    gl.uniform2fv(uniform.form, formData);
    let steep = 1;
    for (let i = 0; i < frame.waves.length; i++) {
      const wave = frame.waves[i];
      const k = (2 * Math.PI) / wave.length;
      waveData[i * 4] = k * Math.cos(wave.angle);
      waveData[i * 4 + 1] = k * Math.sin(wave.angle);
      waveData[i * 4 + 2] = -wave.amp * Math.sin(wave.angle);
      waveData[i * 4 + 3] = wave.amp * Math.cos(wave.angle);
      steep += wave.amp * k;
    }
    gl.uniform4fv(uniform.wave, waveData);
    if (frame.spine) steep += frame.spine.slope;
    if (frame.crest) steep += (2 * frame.crest.high) / (frame.crest.width * Math.sqrt(Math.E));
    if (!frame.crest) gl.uniform4f(uniform.crest, 0, 0, 0, 0);
    if (ripple && ring) {
      steep += (ripple.slope * ripple.reach * 5.66 * sigma) / (0.5 * Math.PI * Math.min(ring.rx, ring.ry));
    }
    gl.uniform1f(uniform.steep, steep);
    if (ripple && gpu.rippleTexture) {
      gl.uniform4f(uniform.ripple, ring?.cx ?? 0, ring?.cy ?? 0, ring ? ring.rx : 0, ring ? ring.ry : 1);
      gl.uniform1f(uniform.rippleRange, ripple.reach * 5.66 * sigma);
      writeRipple(false);
    }
    if (drag && gpu.dragTexture) {
      drag.resize(width, height, frame.gust);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, gpu.dragTexture);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        drag.cols(),
        drag.rows(),
        0,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        drag.data(),
      );
      gl.activeTexture(gl.TEXTURE0);
      gl.uniform2f(uniform.dragOn, 0, drag.range());
      gl.uniform2f(uniform.gust, 0, drag.gustRange());
    }
  };

  const anchorBox = (): Anchor | null => {
    const scope = options.scope ?? canvas.parentElement;
    const el = scope?.querySelector<HTMLElement>("[data-light-anchor]");
    if (!el) return null;
    const box = el.getBoundingClientRect();
    const own = canvas.getBoundingClientRect();
    const words = scope
      ?.querySelector<HTMLElement>("[data-light-clear]")
      ?.getBoundingClientRect();
    const clear = words && {
      left: words.left - own.left,
      right: words.right - own.left,
      bottom: words.bottom - own.top,
    };
    const style = getComputedStyle(canvas);
    const token = (name: string) => {
      const value = parseFloat(byWidth(style, name));
      return Number.isFinite(value) ? value : undefined;
    };
    return {
      x: box.left - own.left,
      y: box.top - own.top,
      w: box.width,
      h: box.height,
      clear,
      tilt: token("--ds-hero-light-tilt"),
      cross: token("--ds-hero-light-cross"),
    };
  };

  const tune: Tune = (name) => {
    const raw = byWidth(getComputedStyle(canvas), name.replace(/^--/, "--ds-"));
    const value = parseFloat(raw);
    if (!Number.isFinite(value)) return undefined;
    return raw.endsWith("ms") ? value / 1000 : value;
  };

  const resize = () => {
    const scale =
      canvas.clientWidth && canvas.clientHeight ? scaleFor(canvas.clientWidth, canvas.clientHeight) : dpr;
    if (canvas.clientWidth === width && canvas.clientHeight === height && scale === dpr) return;
    const was = { w: width, h: height };
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    if (!width || !height) return;
    dpr = scale;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    sigma = Math.min(6, Math.max(4, window.innerWidth * 0.003125));
    ring = ripple ? ripple.ring(canvas) : null;
    frame =
      composition === "ring"
        ? ringLayout(width, height, 5.66 * sigma, ring)
        : composition === "horizon"
          ? horizonLayout(width, height, 5.66 * sigma, anchorBox())
          : layout(composition, width, height, 5.66 * sigma, tune);
    placeCrest(was.w, was.h);
    prepare();
  };

  let time = 0;
  const lens = { x: 0, y: 0, on: 0, vx: 0, vy: 0, motion: 0, carryX: 0, carryY: 0 };
  const target = { x: 0, y: 0, on: 0 };
  const crest = {
    x: 0,
    vx: 0,
    lift: 0,
    vlift: 0,
    here: 1,
    oldX: 0,
    oldLift: 0,
    motion: 0,
    drift: 0,
    held: false,
    wrap: 1,
    vwrap: 0,
  };
  function placeCrest(fromW: number, fromH: number) {
    const set = frame?.crest;
    if (!set) return;
    if (!fromW || !fromH || still) {
      crest.drift = crest.x = still ? width / 2 : set.start;
      crest.lift = set.idle;
      crest.vx = crest.vlift = crest.oldLift = crest.motion = 0;
      crest.here = crest.wrap = 1;
      crest.vwrap = 0;
      crest.held = false;
      return;
    }
    const sx = width / fromW;
    const sy = height / fromH;
    crest.x *= sx;
    crest.vx *= sx;
    crest.drift *= sx;
    crest.oldX *= sx;
    crest.lift *= sy;
    crest.vlift *= sy;
    crest.oldLift *= sy;
  }
  const probed = false;

  const draw = () => {
    if (!gpu || !width || !height) return;
    const { uniform } = gpu;
    const turns = frame.tempo === undefined ? time * 2 * Math.PI : time * 2 * Math.PI * frame.tempo;
    for (let i = 0; i < WAVES; i++) {
      phaseData[i] = seed * (1.7 + i * 2.3) + i * 1.9 + turns / WAVE_PERIOD[i];
    }
    gl.uniform1fv(uniform.phase, phaseData);
    gl.uniform1f(uniform.flow, time / 20);
    for (let i = 0; i < frame.blobs.length; i++) {
      const blob = frame.blobs[i];
      const period = 40 + i * 7;
      blobData[i * 4] = blob.x + frame.wander * Math.cos(seed * 3.1 + i * 2.4 + turns / period);
      blobData[i * 4 + 1] = blob.y + frame.wander * Math.sin(seed * 2.3 + i * 4.1 + turns / (period * 1.3));
      blobData[i * 4 + 2] = blob.rx;
      blobData[i * 4 + 3] = blob.ry;
      if (frame.breathe) {
        const swell = frame.breathe * Math.sin(seed * 1.3 + i * 2.1 + turns / (18 + i * 5));
        blobData[i * 4 + 2] = blob.rx * (1 + swell);
        blobData[i * 4 + 3] = blob.ry * (1 - swell);
      }
    }
    if (frame.spine?.slide) {
      const { blob, slide } = frame.spine;
      const rot = frame.blobs[blob].rot ?? 0;
      const along = slide * Math.sin(seed * 0.7 + turns / 90);
      blobData[blob * 4] += along * Math.cos(rot);
      blobData[blob * 4 + 1] += along * Math.sin(rot);
      for (let i = 0; i < frame.blobs.length; i++) {
        if (i === blob || (frame.blobs[i].tri ?? 0) >= 0) continue;
        blobData[i * 4] += along * Math.cos(rot);
        blobData[i * 4 + 1] += along * Math.sin(rot);
      }
    }
    gl.uniform4fv(uniform.blob, blobData);
    const lensSet = frame.lens ?? LENS;
    const strength = lensSet.calm + (1 - lensSet.calm) * lens.motion;
    const { crest: wave } = frame;
    if (wave) {
      const lift = crest.lift * crest.here;
      const on = crest.here * (lensSet.calm + (1 - lensSet.calm) * crest.motion);
      gl.uniform3f(uniform.pointer, crest.x, wave.top - lift, on);
      gl.uniform2f(uniform.carry, 0, 0);
      gl.uniform4f(uniform.crest, crest.x, lift, wave.width, crest.wrap);
      gl.uniform3f(uniform.crestOld, crest.oldX, crest.oldLift, wave.period);
    } else {
      gl.uniform3f(uniform.pointer, lens.x, lens.y, lens.on * strength);
      gl.uniform2f(uniform.carry, lens.carryX, lens.carryY);
    }
    const gather = lensSet.light;
    if (gather && lens.on > 0.001) {
      gl.uniform2f(uniform.lensLight, gather.radius * lens.on - 4 * sigma, gather.union * lens.on);
    } else {
      gl.uniform2f(uniform.lensLight, 0, 0);
    }
    if (drag && gpu.dragTexture) {
      const carried = !still && (drag.sync() || !drag.idle());
      if (carried) {
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, gpu.dragTexture);
        gl.texSubImage2D(
          gl.TEXTURE_2D,
          0,
          0,
          0,
          drag.cols(),
          drag.rows(),
          gl.RGBA,
          gl.UNSIGNED_BYTE,
          drag.data(),
        );
        gl.activeTexture(gl.TEXTURE0);
      }
      gl.uniform2f(uniform.dragOn, carried && drag.carrying() ? 1 : 0, drag.range());
      gl.uniform2f(uniform.gust, carried && drag.gusting() ? 1 : 0, drag.gustRange());
    }
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };

  let raf = 0;
  let visible = false;
  let last = 0;
  let lastDraw = 0;
  let lastTick = 0;
  let slow = 0;

  const area = options.area !== undefined ? options.area : canvas.closest<HTMLElement>("[data-light-area]");
  const client = { x: 0, y: 0, known: false, inside: true };
  const aim = () => {
    if (!lensEnabled || !visible || !client.known) return;
    const rect = canvas.getBoundingClientRect();
    const x = client.x - rect.left;
    const y = client.y - rect.top;
    const near =
      client.inside &&
      ((frame.crest && area) ||
        (x > -LENS_REACH && y > -LENS_REACH && x < rect.width + LENS_REACH && y < rect.height + LENS_REACH));
    if (near && target.on === 0 && frame.crest) enterCrest(x, y);
    if (near && target.on === 0 && lens.on < 0.01) {
      lens.x = x;
      lens.y = y;
      lens.vx = lens.vy = lens.motion = lens.carryX = lens.carryY = 0;
    }
    target.x = x;
    target.y = y;
    target.on = near ? 1 : 0;
  };
  const onPointerMove = (event: PointerEvent) => {
    if (event.pointerType === "touch" || probed) return;
    client.x = event.clientX;
    client.y = event.clientY;
    client.known = true;
    client.inside = !area || (event.target instanceof Node && area.contains(event.target));
    aim();
  };
  const lensOff = () => {
    target.on = 0;
    lens.on = lens.motion = lens.carryX = lens.carryY = 0;
    if (!probed) {
      crest.oldLift = crest.motion = 0;
      crest.here = 1;
    }
  };
  const onPointerGone = () => {
    client.known = false;
    target.on = 0;
  };

  const liftAt = (y: number) => {
    const set = frame.crest;
    if (!set) return 0;
    const up = Math.min(1, Math.max(0, 1 - y / height));
    return set.low + (set.high - set.low) * up;
  };
  const enterCrest = (x: number, y: number) => {
    const set = frame.crest;
    if (!set) return;
    const shown = crest.lift * crest.here;
    if (Math.abs(x - crest.x) <= 1.5 * set.width && shown > 0.5) return;
    if (shown > 0.5) {
      if (shown > crest.oldLift) {
        crest.oldX = crest.x;
        crest.oldLift = shown;
      }
      crest.here = 0;
    } else {
      crest.here = 1;
    }
    crest.x = x;
    crest.vx = 0;
    crest.lift = liftAt(y);
    crest.vlift = 0;
  };
  const spring = (x: number, v: number, to: number, w: number, dt: number): [number, number] => {
    const e = Math.exp(-w * dt);
    const off = x - to;
    const c = v + w * off;
    return [to + (off + c * dt) * e, (c - w * (off + c * dt)) * e];
  };
  const stepCrest = (dt: number) => {
    const set = frame.crest;
    if (!set || dt <= 0) return;
    const held = target.on > 0;
    if (crest.held && !held) crest.drift = crest.x;
    crest.held = held;
    const ease = 1 - Math.exp(-dt * set.rise);
    crest.here += (1 - crest.here) * ease;
    crest.oldLift *= 1 - ease;
    if (crest.oldLift < 0.1) crest.oldLift = 0;
    if (crest.oldLift > 0) crest.oldX += set.speed * dt;
    if (crest.oldX >= set.period) crest.oldX -= set.period;
    [crest.wrap, crest.vwrap] = spring(crest.wrap, crest.vwrap, held ? 0 : 1, set.settle, dt);
    if (!held) {
      crest.drift += set.speed * dt;
      if (crest.drift >= set.period && crest.wrap > 0.995) {
        crest.wrap = 1;
        crest.drift -= set.period;
        crest.x -= set.period;
      }
    }
    const x = held ? Math.min(width + 2 * set.width, Math.max(-2 * set.width, target.x)) : crest.drift;
    [crest.x, crest.vx] = spring(crest.x, crest.vx, x, set.follow, dt);
    const lift = held ? liftAt(target.y) : set.idle;
    [crest.lift, crest.vlift] = spring(
      crest.lift,
      crest.vlift,
      lift,
      held ? 0.6 * set.follow : set.settle,
      dt,
    );
    const fast = Math.min(1, Math.abs(crest.vx) / LENS_FAST);
    crest.motion += (fast - crest.motion) * (fast > crest.motion ? ease : 1 - Math.exp(-dt * 0.5 * set.rise));
  };

  const tick = (now: number) => {
    raf = requestAnimationFrame(tick);
    slow = now - lastTick > SLOW_FRAME_MS ? slow + 1 : 0;
    lastTick = now;
    if (slow >= SLOW_RUN && dpr > 1) {
      slow = 0;
      ceiling = Math.max(1, Math.floor(dpr * 6) / 8);
      resize();
    }
    if (frame.crest) {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      lastDraw = now;
      time += dt;
      stepCrest(dt);
      draw();
      return;
    }
    const lensActive = target.on > 0 || lens.on > 0.002 || lens.motion > 0.002;
    const dragActive = drag !== null && drag.sync();
    const rippleActive = syncRipple();
    const idle = ripple ? RIPPLE_IDLE_FRAME_MS : IDLE_FRAME_MS;
    if (!lensActive && !dragActive && !rippleActive && now - lastDraw < idle - 2) return;
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    lastDraw = now;
    if (!ripple?.frozen()) time += dt;
    const lensSet = frame.lens ?? LENS;
    const follow = 1 - Math.exp(-dt * lensSet.follow);
    const stepX = (target.x - lens.x) * follow;
    const stepY = (target.y - lens.y) * follow;
    lens.x += stepX;
    lens.y += stepY;
    const ease = 1 - Math.exp(-dt * lensSet.ease);
    lens.on += (target.on - lens.on) * ease;
    if ((lensSet.calm < 1 || lensSet.carry > 0) && dt > 0) {
      const smooth = 1 - Math.exp(-dt * 2 * lensSet.ease);
      lens.vx += (stepX / dt - lens.vx) * smooth;
      lens.vy += (stepY / dt - lens.vy) * smooth;
      const fast = Math.min(1, Math.hypot(lens.vx, lens.vy) / LENS_FAST);
      lens.motion += (fast - lens.motion) * (fast > lens.motion ? smooth : ease);
      let cx = lens.vx * lensSet.carry * lens.on;
      let cy = lens.vy * lensSet.carry * lens.on;
      const most = 0.35 * lensSet.radius;
      const far = Math.hypot(cx, cy);
      if (far > most) {
        cx *= most / far;
        cy *= most / far;
      }
      lens.carryX = cx;
      lens.carryY = cy;
    }
    draw();
  };
  const start = () => {
    if (still || probed || raf || !gpu || !visible || document.hidden) return;
    aim();
    last = lastDraw = lastTick = performance.now();
    slow = 0;
    raf = requestAnimationFrame(tick);
  };
  const stop = () => {
    cancelAnimationFrame(raf);
    raf = 0;
  };

  resize();
  draw();
  canvas.dataset.ready = "true";

  let alive = true;
  const family = getComputedStyle(canvas).getPropertyValue("--ds-font-ascii").trim();
  if (family) {
    document.fonts.load(`13.333px ${family}`, GLYPH_RAMP).then(
      () => {
        if (!alive) return;
        font = `${family}, ${FALLBACK_FONT}`;
        prepare();
        draw();
      },
      () => {},
    );
  }

  const intersection = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) {
      start();
    } else {
      stop();
      lensOff();
    }
  });
  intersection.observe(canvas);
  const refit = () => {
    resize();
    draw();
  };
  const resizer = new ResizeObserver(refit);
  resizer.observe(canvas);
  const onVisibility = () => (document.hidden ? stop() : start());
  document.addEventListener("visibilitychange", onVisibility);

  let ratio: MediaQueryList | null = null;
  const watchRatio = () => {
    ratio?.removeEventListener("change", onRatio);
    ratio = window.matchMedia(`(resolution: ${window.devicePixelRatio || 1}dppx)`);
    ratio.addEventListener("change", onRatio);
  };
  const onRatio = () => {
    watchRatio();
    refit();
  };
  watchRatio();

  const onMedia = () => {
    still = reduceMotion.matches || options.still === true;
    lensEnabled = options.interactive && finePointer.matches && !still;
    if (!lensEnabled) lensOff();
    if (still) {
      stop();
      writeRipple(false);
      placeCrest(0, 0);
      draw();
    } else {
      start();
    }
  };
  reduceMotion.addEventListener("change", onMedia);
  finePointer.addEventListener("change", onMedia);

  const onContextLost = (event: Event) => {
    event.preventDefault();
    stop();
    gpu = null;
  };
  const onContextRestored = () => {
    gpu = build(gl, drag !== null, ripple !== null, overlay);
    prepare();
    draw();
    start();
  };
  canvas.addEventListener("webglcontextlost", onContextLost);
  canvas.addEventListener("webglcontextrestored", onContextRestored);

  if (options.interactive) {
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("scroll", aim, { passive: true });
    document.documentElement.addEventListener("pointerleave", onPointerGone);
    window.addEventListener("blur", onPointerGone);
  }

  return {
    gl,
    draw,
    destroy() {
      alive = false;
      stop();
      intersection.disconnect();
      resizer.disconnect();
      ratio?.removeEventListener("change", onRatio);
      reduceMotion.removeEventListener("change", onMedia);
      finePointer.removeEventListener("change", onMedia);
      document.removeEventListener("visibilitychange", onVisibility);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      canvas.removeEventListener("webglcontextrestored", onContextRestored);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("scroll", aim);
      document.documentElement.removeEventListener("pointerleave", onPointerGone);
      window.removeEventListener("blur", onPointerGone);
      delete canvas.dataset.ready;
      if (gpu) {
        gl.deleteTexture(gpu.texture);
        gl.deleteTexture(gpu.dragTexture);
        gl.deleteTexture(gpu.rippleTexture);
        gl.deleteTexture(gpu.spineTexture);
        gl.deleteBuffer(gpu.buffer);
        gl.deleteProgram(gpu.program);
        gpu = null;
      }
    },
  };
}
