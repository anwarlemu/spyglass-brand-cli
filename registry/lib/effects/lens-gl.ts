'use client'
// The site's light picture lens (effect/LightImage/lens-gl): the light's mask drawn three times in WebGL, Blue, Green
// and Red, split sideways by `split` px, magnified and split wider under the pointer's lens. It replaces the picture
// (the box gets data-gl) only for a fine pointer without reduced motion, and gives it back when that changes.
import { LENS, LENS_GLSL } from "@/lib/effects/lens";
import { FINE_POINTER } from "@/lib/effects/pointer";

const VERT = `
attribute vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

const FRAG = `
precision highp float;
uniform sampler2D u_mask;
uniform vec2 u_size;
uniform vec4 u_view;
uniform vec2 u_canvas;
uniform vec2 u_scale;
uniform vec3 u_pointer;
uniform float u_split;
${LENS_GLSL}
const vec3 LIGHT_B = 0.782 * vec3(27.0, 29.0, 255.0) / 255.0;
const vec3 LIGHT_G = 0.782 * vec3(0.0, 255.0, 41.0) / 255.0;
const vec3 LIGHT_R = 0.850 * vec3(223.0, 0.0, 0.0) / 255.0;
const float GAIN = 1.05;

float shape(vec2 p) {
  vec2 uv = p / u_size;
  if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) return 0.0;
  return texture2D(u_mask, uv).r;
}

void main() {
  vec2 f = vec2(gl_FragCoord.x, u_canvas.y - gl_FragCoord.y) / u_canvas;
  vec2 p = u_view.xy + f * u_view.zw;
  vec2 toPointer = p - u_pointer.xy;
  float lens = lensAt(toPointer * u_scale, u_pointer.z);
  vec2 pm = u_pointer.xy + toPointer * (1.0 - LENS_MAGNIFY * lens);
  float d = u_split * (1.0 + LENS_WIDEN * lens);
  vec3 light = shape(pm + vec2(d, 0.0)) * LIGHT_B + shape(pm) * LIGHT_G + shape(pm - vec2(d, 0.0)) * LIGHT_R;
  light = clamp(GAIN * light, 0.0, 1.0);
  gl_FragColor = vec4(light, max(light.r, max(light.g, light.b)));
}
`;

const PIXEL_BUDGET = 4e6;
const MAX_DPR = 2;

export type LensOptions = {
  box: HTMLElement;
  canvas: HTMLCanvasElement;
  mask: string;
  width: number;
  height: number;
  split: number;
};

export function startLens({ box, canvas, mask, width, height, split }: LensOptions): () => void {
  const finePointer = window.matchMedia(FINE_POINTER);
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  let gl: WebGLRenderingContext | null = null;
  let program: WebGLProgram | null = null;
  let uniform: Record<string, WebGLUniformLocation | null> = {};
  let ready = false;
  let near = false;
  let raf = 0;
  let last = 0;
  let view = { x: 0, y: 0, w: 1, h: 1, sx: 1, sy: 1 };
  const lens = { x: 0, y: 0, on: 0 };
  const target = { x: 0, y: 0, on: 0 };
  const client = { x: 0, y: 0, known: false };
  let cancelled = false;

  const layout = () => {
    if (!gl) return;
    const rect = box.getBoundingClientRect();
    const sx = rect.width / width;
    const sy = rect.height / height;
    const x0 = Math.max(0, (0 - rect.left) / sx);
    const x1 = Math.min(width, (window.innerWidth - rect.left) / sx);
    const w = Math.max(1, x1 - x0);
    const scale = Math.min(
      window.devicePixelRatio || 1,
      MAX_DPR,
      Math.sqrt(PIXEL_BUDGET / (w * sx * height * sy)),
    );
    canvas.style.left = `${x0}px`;
    canvas.style.width = `${w}px`;
    canvas.width = Math.max(1, Math.round(w * sx * scale));
    canvas.height = Math.max(1, Math.round(height * sy * scale));
    gl.viewport(0, 0, canvas.width, canvas.height);
    view = { x: x0, y: 0, w, h: height, sx, sy };
    draw();
  };

  const draw = () => {
    if (!gl || !ready) return;
    gl.uniform4f(uniform.view, view.x, view.y, view.w, view.h);
    gl.uniform2f(uniform.canvas, canvas.width, canvas.height);
    gl.uniform2f(uniform.scale, view.sx, view.sy);
    gl.uniform3f(uniform.pointer, lens.x, lens.y, lens.on);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  };

  const aim = () => {
    if (!ready || !near || !client.known) return;
    const rect = box.getBoundingClientRect();
    const sx = rect.width / width;
    const sy = rect.height / height;
    const x = (client.x - rect.left) / sx;
    const y = (client.y - rect.top) / sy;
    const left = Math.max(rect.left, 0);
    const right = Math.min(rect.right, window.innerWidth);
    const inside =
      client.x > left - LENS.reach &&
      client.x < right + LENS.reach &&
      client.y > rect.top - LENS.reach &&
      client.y < rect.bottom + LENS.reach;
    if (inside && target.on === 0 && lens.on < 0.01) {
      lens.x = x;
      lens.y = y;
    }
    target.x = x;
    target.y = y;
    target.on = inside ? 1 : 0;
    wake();
  };

  const tick = (now: number) => {
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    const follow = 1 - Math.exp(-dt * LENS.follow);
    lens.x += (target.x - lens.x) * follow;
    lens.y += (target.y - lens.y) * follow;
    lens.on += (target.on - lens.on) * (1 - Math.exp(-dt * LENS.ease));
    if (target.on === 0 && lens.on < 0.002) lens.on = 0;
    draw();
    raf = lens.on > 0 || target.on > 0 ? requestAnimationFrame(tick) : 0;
  };
  const wake = () => {
    if (raf || !near || document.hidden) return;
    last = performance.now();
    raf = requestAnimationFrame(tick);
  };
  const sleep = () => {
    cancelAnimationFrame(raf);
    raf = 0;
  };

  const start = async () => {
    gl = canvas.getContext("webgl", { alpha: true, antialias: false, premultipliedAlpha: true });
    if (!gl) return;
    const image = new Image();
    image.decoding = "async";
    image.src = mask;
    try {
      await image.decode();
    } catch {
      return;
    }
    if (cancelled || !gl) return;
    const compile = (type: number, source: string) => {
      const shader = gl!.createShader(type)!;
      gl!.shaderSource(shader, source);
      gl!.compileShader(shader);
      return shader;
    };
    program = gl.createProgram()!;
    gl.attachShader(program, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
    gl.useProgram(program);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const at = gl.getAttribLocation(program, "a_pos");
    gl.enableVertexAttribArray(at);
    gl.vertexAttribPointer(at, 2, gl.FLOAT, false, 0, 0);
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, gl.LUMINANCE, gl.UNSIGNED_BYTE, image);
    for (const name of ["mask", "size", "view", "canvas", "scale", "pointer", "split"]) {
      uniform[name] = gl.getUniformLocation(program, `u_${name}`);
    }
    gl.uniform1i(uniform.mask, 0);
    gl.uniform2f(uniform.size, width, height);
    gl.uniform1f(uniform.split, split);
    ready = true;
    layout();
    box.setAttribute("data-gl", "");
    aim();
  };

  const onPointerMove = (event: PointerEvent) => {
    if (event.pointerType === "touch") return;
    client.x = event.clientX;
    client.y = event.clientY;
    client.known = true;
    aim();
  };
  const onPointerGone = () => {
    client.known = false;
    target.on = 0;
    wake();
  };
  const onVisibility = () => (document.hidden ? sleep() : wake());

  let started = false;
  const io = new IntersectionObserver(
    ([entry]) => {
      near = entry.isIntersecting;
      if (near && !started) {
        started = true;
        void start();
      }
      if (near) aim();
      else {
        sleep();
        target.on = 0;
        lens.on = 0;
        draw();
      }
    },
    { rootMargin: "200px 0px" },
  );
  io.observe(box);
  const resize = new ResizeObserver(() => layout());
  resize.observe(box);
  window.addEventListener("resize", layout, { passive: true });
  window.addEventListener("pointermove", onPointerMove, { passive: true });
  window.addEventListener("scroll", aim, { passive: true });
  document.documentElement.addEventListener("pointerleave", onPointerGone);
  document.addEventListener("visibilitychange", onVisibility);
  const fallBack = () => {
    if (finePointer.matches && !reduce.matches) return;
    sleep();
    ready = false;
    box.removeAttribute("data-gl");
  };
  finePointer.addEventListener("change", fallBack);
  reduce.addEventListener("change", fallBack);

  return () => {
    cancelled = true;
    sleep();
    io.disconnect();
    resize.disconnect();
    window.removeEventListener("resize", layout);
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("scroll", aim);
    document.documentElement.removeEventListener("pointerleave", onPointerGone);
    document.removeEventListener("visibilitychange", onVisibility);
    finePointer.removeEventListener("change", fallBack);
    reduce.removeEventListener("change", fallBack);
    box.removeAttribute("data-gl");
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
  };
}
