// The dispersion field's fragment shader (effect/shader): soft blobs of light bent by four waves, drawn three times
// (Blue, Green, Red) split by the field's spread, with the ASCII ghost of the light around it, the pointer's lens,
// the drag and ripple textures and the footer crest. Shared by both flavors through field-engine.ts.
export const MAX_BLOBS = 8;
export const WAVES = 4;
export const GLYPH_RAMP = " .:-=+*#";

export const VERT = `
attribute vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

export const FRAG = `
precision highp float;

#define MAX_BLOBS ${MAX_BLOBS}
#define WAVES ${WAVES}
#define GLYPHS ${GLYPH_RAMP.length}.0

uniform vec2 u_res;
uniform float u_dpr;
uniform float u_ground;
uniform vec4 u_blob[MAX_BLOBS];
uniform vec4 u_turn[MAX_BLOBS];
uniform vec2 u_form[MAX_BLOBS];
uniform int u_count;
uniform vec4 u_wave[WAVES];
uniform float u_phase[WAVES];
uniform float u_steep;
uniform float u_sigma;
uniform float u_gain;
uniform vec3 u_pointer;
uniform vec3 u_lens;
uniform vec2 u_lensLight;
uniform vec2 u_carry;
uniform float u_ascii;
uniform vec4 u_ghost;
uniform float u_flow;
uniform vec2 u_gust;
uniform vec4 u_calm;
uniform float u_feather;
uniform sampler2D u_glyphs;
uniform sampler2D u_drag;
uniform vec2 u_dragOn;
uniform vec4 u_ripple;
uniform sampler2D u_rippleTex;
uniform float u_rippleRange;
uniform vec2 u_band;
uniform float u_hollow;
uniform float u_tint;
uniform float u_spread;
uniform vec3 u_ice;
uniform vec4 u_spine;
uniform sampler2D u_spineTex;
uniform vec4 u_crest;
uniform vec3 u_crestOld;

const vec3 LIGHT_B = 0.782 * vec3(27.0, 29.0, 255.0) / 255.0;
const vec3 LIGHT_G = 0.782 * vec3(0.0, 255.0, 41.0) / 255.0;
const vec3 LIGHT_R = 0.850 * vec3(223.0, 0.0, 0.0) / 255.0;

const vec2 CELL = vec2(8.0, 16.0);

vec2 warp(vec2 p) {
  vec2 w = vec2(0.0);
  for (int i = 0; i < WAVES; i++) {
    w += u_wave[i].zw * sin(dot(u_wave[i].xy, p) + u_phase[i]);
  }
  return w;
}

float smin(float a, float b, float k) {
  float h = max(k - abs(a - b), 0.0) / k;
  return min(a, b) - h * h * k * 0.25;
}

float pick(vec2 u) {
  float a = u.y;
  float b = -0.866 * u.x - 0.5 * u.y;
  float c = 0.866 * u.x - 0.5 * u.y;
  return -smin(a, smin(b, c, 0.8), 0.8);
}

float shape(vec2 q, vec4 b, vec4 turn, float tri) {
  q -= b.xy;
  q = vec2(turn.x * q.x + turn.y * q.y, turn.x * q.y - turn.y * q.x) / b.zw;
  float r = length(q);
  if (tri > 0.0) r = mix(r, pick(q), tri);
  return (r - 1.0) * min(b.z, b.w);
}

float ribbon(vec2 q, vec4 b, vec4 turn) {
  q -= b.xy;
  q = vec2(turn.x * q.x + turn.y * q.y, turn.x * q.y - turn.y * q.x);
  vec4 k = texture2D(u_spineTex, vec2(q.x / u_spine.y + u_spine.w, 0.5));
  float off = ((k.r * 65280.0 + k.g * 255.0) / 65535.0 * 2.0 - 1.0) * u_spine.z;
  return abs(q.y - off) - 2.0 * k.b * b.w;
}

vec2 ripple(vec2 p) {
  vec2 q = (p - u_ripple.xy) / u_ripple.zw;
  float u = atan(abs(q.x) + 1e-4, q.y) / 3.14159265;
  vec4 k = texture2D(u_rippleTex, vec2(u, q.x < 0.0 ? 0.25 : 0.75));
  return vec2((k.r * 2.0 - 1.0) * u_rippleRange, k.g);
}

float field(vec2 p) {
  vec2 w = warp(p);
  float s = u_ground;
  for (int i = 0; i < MAX_BLOBS; i++) {
    if (i >= u_count) break;
    vec4 turn = u_turn[i];
    float e = u_spine.x > 0.0 && (float(i) == u_spine.x - 1.0 || u_form[i].y < 0.0)
      ? ribbon(p + w * turn.w, u_blob[i], turn)
      : shape(p + w * turn.w, u_blob[i], turn, u_form[i].y);
    s = u_form[i].x < 0.0 ? -smin(-s, e, turn.z) : smin(s, e, turn.z);
  }
  if (u_lensLight.y > 0.0) {
    s = -smin(-s, length(p + 0.5 * w - u_pointer.xy) - u_lensLight.x, u_lensLight.y);
  }
  if (u_ripple.z > 0.0) s += ripple(p).x;
  if (u_crest.z > 0.0) {
    vec2 c = vec2(p.x - u_crest.x, p.x - u_crestOld.x);
    vec2 k = c / u_crest.z;
    vec2 r = (c - u_crestOld.z * (2.0 * step(0.0, c) - 1.0)) / u_crest.z;
    vec2 g = exp(-0.5 * k * k) + u_crest.w * exp(-0.5 * r * r);
    s += u_crest.y * g.x + u_crestOld.y * g.y;
  }
  return s;
}

float dist(vec2 p, float f) {
  const float E = 2.0;
  vec2 g = vec2(field(p + vec2(E, 0.0)) - f, field(p + vec2(0.0, E)) - f) / E;
  return f / max(length(g), 0.6);
}

float erf(float x) {
  float x2 = x * x;
  float ax2 = 0.147 * x2;
  return sign(x) * sqrt(1.0 - exp(-x2 * (1.2732395 + ax2) / (1.0 + ax2)));
}
float phi(float x) { return 0.5 * (1.0 + erf(x * 0.70710678)); }

float mask(float s, float t, float g, float h) {
  float m = phi(s / u_sigma) - phi((s - t) / u_sigma) + phi((s - t - g) / u_sigma);
  return h > 0.0 ? m - phi((s - t - g - h) / u_sigma) : m;
}

vec2 carried(vec2 p) {
  vec4 k = texture2D(u_drag, p / u_res);
  float e = k.r * 2.0 - 1.0;
  return vec2(sign(e) * e * e * u_dragOn.y, k.g);
}

vec2 lifted(vec2 p) {
  vec4 k = texture2D(u_drag, p / u_res);
  float e = (k.b * 255.0 - 128.0) / 127.0;
  if (abs(e) < 0.5 / 127.0) e = 0.0;
  return vec2(sign(e) * e * e * u_gust.y, k.g);
}

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
    f.y
  );
}

void main() {
  vec2 p = vec2(gl_FragCoord.x, u_res.y * u_dpr - gl_FragCoord.y) / u_dpr;

  vec2 toPointer = p - u_pointer.xy;
  float fall = 1.0 - min(dot(toPointer, toPointer) / (u_lens.x * u_lens.x), 1.0);
  fall *= fall;
  float lens = u_pointer.z * fall;
  vec2 pm = u_pointer.xy + toPointer * (1.0 - u_lens.y * lens) + u_carry * fall;

  float stir = 0.0;
  if (u_dragOn.x > 0.0) {
    vec2 k = carried(p);
    pm.x -= k.x;
    stir = k.y;
  }
  if (u_gust.x > 0.0) {
    vec2 k = lifted(p);
    pm.y -= k.x;
    stir = max(stir, k.y);
  }
  if (u_ripple.z > 0.0) stir = max(stir, ripple(p).y);

  float near = min(lens + stir, 1.0);
  float crest = smoothstep(0.0, 0.5, near);
  float spread = mix(u_spread > 0.0 ? u_spread : 1.0, 1.0, crest);
  float d = 5.66 * u_sigma * spread * (1.0 + u_lens.z * near);
  float t = (u_band.x > 0.0 ? u_band.x : 0.74) * d;
  float g = (u_band.y > 0.0 ? u_band.y : 0.66) * d;
  float h = u_hollow > 0.0 ? u_hollow * d / max(1.0 - crest, 0.002) : 0.0;
  float reach = t + g + h + 4.0 * u_sigma;

  float f0 = field(pm);
  vec3 m;
  if (f0 < -u_steep * (2.0 * d + 4.0 * u_sigma)) {
    m = vec3(0.0);
  } else if (f0 > u_steep * (2.0 * d + reach)) {
    m = vec3(h > 0.0 ? 0.0 : 1.0);
  } else {
    vec2 pg = pm - vec2(d, 0.0);
    vec2 pr = pm - vec2(2.0 * d, 0.0);
    m = vec3(
      mask(dist(pr, field(pr)), t, g, h),
      mask(dist(pg, field(pg)), t, g, h),
      mask(dist(pm, f0), t, g, h)
    );
  }
  vec3 light = u_gain * (LIGHT_R * m.r + LIGHT_G * m.g + LIGHT_B * m.b);
  if (u_tint > 0.0) {
    float ice = min(m.r, min(m.g, m.b));
    vec3 pale = u_gain * ice * (LIGHT_R + LIGHT_G + LIGHT_B);
    light += u_tint * (ice * u_ice - pale);
  }

  float glyph = 0.0;
  if (u_ascii > 0.0) {
    float onBlack = 1.0 - smoothstep(0.02, 0.25, max(light.r, max(light.g, light.b)));
    if (onBlack > 0.0) {
      vec2 cell = floor(p / CELL);
      vec2 inCell = fract(p / CELL);
      vec2 c = (cell + 0.5) * CELL;
      float row = hash(vec2(cell.y, u_ghost.w));
      vec2 b = abs(c + vec2(CELL.x * 10.0 * (row - 0.5), 0.0) - u_calm.xy) - u_calm.zw;
      float keep = smoothstep(0.0, u_feather, length(max(b, 0.0)) + min(max(b.x, b.y), 0.0));
      float span = clamp(u_res.x / 50.0, 14.0, 30.0);
      float patch = noise(vec2((cell.x + 0.5 * span * row) / span + u_flow, cell.y / 5.0) + u_ghost.w);
      float fine = noise(vec2((cell.x - 9.0 * row) / 7.0 + 2.0 * u_flow, cell.y / 1.5) - u_ghost.w);
      float grain = keep * smoothstep(0.32, 0.72, 0.75 * patch + 0.25 * fine) * (0.72 + 0.28 * row);
      if (grain > 0.0) {
        if (u_dragOn.x > 0.0) c.x -= carried(c).x;
        float s = field(c + u_ghost.xy + vec2(CELL.x * 6.0 * (row - 0.5), 0.0));
        float w = s > 0.0 ? 1.8 * u_ghost.z : u_ghost.z;
        float v = 0.94 * grain * exp(-s * s / (w * w));
        if (v >= 1.0 / GLYPHS) {
          float rest = 5.66 * u_sigma;
          v *= mix(0.4, 1.0, smoothstep(1.5 * rest, 5.0 * rest, -field(c)));
        }
        float idx = min(floor(v * GLYPHS), GLYPHS - 1.0);
        if (idx > 0.0) glyph = texture2D(u_glyphs, vec2((idx + inCell.x) / GLYPHS, inCell.y)).r * onBlack;
      }
    }
  }

  gl_FragColor = vec4(clamp(light + u_ascii * glyph, 0.0, 1.0), 1.0);
}
`;
