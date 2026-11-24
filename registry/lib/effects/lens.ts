// The site's pointer lens (effect/lens): a 240px circle around the pointer that magnifies the light 12% and widens its
// colour split by half, following the pointer on an exponential ease (14 per second) and fading in at 7 per second.
// The grain, the light picture's lens and the field share these numbers.
export const LENS = {
	radius: 240,
	magnify: 0.12,
	widen: 0.5,
	reach: 240,
	follow: 14,
	ease: 7,
} as const

export const LENS_GLSL = `
const float LENS_RADIUS = ${LENS.radius.toFixed(1)};
const float LENS_MAGNIFY = ${LENS.magnify};
const float LENS_WIDEN = ${LENS.widen.toFixed(2)};
float lensAt(vec2 toPointer, float on) {
  float fall = 1.0 - min(dot(toPointer, toPointer) / (LENS_RADIUS * LENS_RADIUS), 1.0);
  return on * fall * fall;
}
`
