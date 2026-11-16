import type { CSSProperties } from 'react'
import { ThreeCanvas, type SceneSetup } from './ThreeCanvas'
import './orb-scene.css'

/** Светящаяся сфера: тёмное ядро, краевое свечение в цветах сайта, медленная переливающаяся полоса */
const orbSetup: SceneSetup = ({ THREE, scene, camera, isMobile }) => {
  const seg = isMobile ? 48 : 96
  const geometry = new THREE.SphereGeometry(1, seg, seg)
  const material = new THREE.ShaderMaterial({
    transparent: true,
    uniforms: {
      uTime: { value: 0 },
      uWhite: { value: new THREE.Color('#FFFFFF') },
      uAccent: { value: new THREE.Color('#BDFFFF') },
      uDeep: { value: new THREE.Color('#1787B3') },
      uBg: { value: new THREE.Color('#1D1F21') },
    },
    vertexShader: /* glsl */ `
      varying vec3 vNormal; varying vec3 vView; varying vec3 vPos;
      void main() {
        vPos = position;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vNormal = normalize(normalMatrix * normal);
        vView = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform float uTime; uniform vec3 uWhite; uniform vec3 uAccent; uniform vec3 uDeep; uniform vec3 uBg;
      varying vec3 vNormal; varying vec3 vView; varying vec3 vPos;
      void main() {
        float f = pow(1.0 - max(dot(vNormal, vView), 0.0), 2.2);
        float band = 0.5 + 0.5 * sin(vPos.y * 3.0 + vPos.x * 1.5 + uTime * 0.6);
        vec3 col = mix(uBg, uDeep, 0.35 + 0.35 * band);
        col = mix(col, uAccent, f);
        col += uWhite * pow(f, 7.0) * 0.8;
        col += uWhite * smoothstep(0.86, 1.0, dot(vNormal, normalize(vec3(-0.5, 0.6, 0.6)))) * 0.6;
        gl_FragColor = vec4(col, 0.55 + 0.45 * f);
        #include <colorspace_fragment>
      }`,
  })
  const orb = new THREE.Mesh(geometry, material)
  scene.add(orb)
  camera.position.z = 4

  return {
    update: (t) => {
      material.uniforms.uTime.value = t
      orb.rotation.y = t * 0.1
      orb.position.y = Math.sin(t * 0.6) * 0.04
    },
  }
}

export function OrbScene({ className = '', style }: { className?: string; style?: CSSProperties }) {
  return <ThreeCanvas setup={orbSetup} className={`orb-scene ${className}`.trim()} style={style} />
}
