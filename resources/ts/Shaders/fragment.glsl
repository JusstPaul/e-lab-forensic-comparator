#ifdef GL_ES
precision mediump float;
#endif

varying vec2 vUv;
uniform sampler2D u_img;
uniform vec4 u_inset;

void main() {
  vec4 texture = texture2D(u_img, vUv);
  float xMask = step(vUv.x, 1.0 - u_inset.y) * step(u_inset.w, vUv.x);
  float yMask = step(vUv.y, 1.0 - u_inset.x) * step(u_inset.z, vUv.y);
  gl_FragColor = vec4(xMask * yMask) * texture;
}
