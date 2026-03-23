uniform vec3 uCoreColor;
uniform vec3 uGlowColor;
uniform float uOpacity;

varying vec3 vNormal;
varying vec3 vPosition;
varying float vDisplacement;

void main() {
  vec3 viewDir = normalize(cameraPosition - vPosition);
  float fresnel = 1.0 - dot(viewDir, vNormal);
  fresnel = pow(fresnel, 2.5);

  vec3 color = mix(uCoreColor, uGlowColor, fresnel);
  float glow = smoothstep(0.0, 0.5, fresnel) * 0.6;

  gl_FragColor = vec4(color, (0.15 + glow + fresnel * 0.3) * uOpacity);
}
