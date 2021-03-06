import './main.css'
import * as THREE from 'three'
import { init } from './gpurender'
import { Euler, Quaternion, Vector3 } from 'three'

function clamp(num, min, max) {
  return num <= min
    ? min
    : num >= max
      ? max
      : num
}

interface SimpleRect {
  height: number
  width: number
}

const fits = (ref: SimpleRect, other: SimpleRect): boolean =>
  other.width <= ref.width && other.height <= ref.height

const getViewSimpleRect = (): SimpleRect => ({
  height: window.innerHeight,
  width: window.innerWidth,
})

const aspect = 16 / 9
const canvas = document.getElementById('canvas')

const renderer = new THREE.WebGL1Renderer({
  canvas
})

const onResize = () => {
  const v = getViewSimpleRect()
  const opt1: SimpleRect = {
    height: v.height,
    width: v.height * aspect
  }
  const opt2: SimpleRect = {
    height: v.width / aspect,
    width: v.width
  }
  const desired = fits(v, opt1) ? opt1 : opt2

  renderer.setSize(desired.width, desired.height);
}

onResize()

const resizeListener = window.addEventListener('resize', onResize)

const camera = new THREE.PerspectiveCamera(45, aspect, 1, 500);
camera.position.set(0, -40, 110);
camera.lookAt(0, 0, 0);

const scene = new THREE.Scene();

const HEX = {
  SIN60: Math.sin(Math.PI / 3),
  COS60: Math.cos(Math.PI / 3),
}
const DIM = 60
const RADIUS = 0.5
const DISTANCE = 4 * RADIUS
const START = -(DIM - 1) * DISTANCE / 2
type Sphere = THREE.Mesh<THREE.SphereGeometry, THREE.LineBasicMaterial>
const spheres: Array<Array<Sphere>> = new Array(DIM)
let x = START
for (let i = 0; i < DIM; i++) {
  spheres[i] = new Array(DIM)
  let y = START
  for (let j = 0; j < DIM; j++) {
    const material = new THREE.LineBasicMaterial({ color: 0x0000ff })
    const geometry = new THREE.SphereGeometry(RADIUS, 32, 16)
    const sphere = new THREE.Mesh(geometry, material);
    const offsetY = i % 2 ? DISTANCE * HEX.COS60 : 0
    sphere.position.x = x
    sphere.position.y = y + offsetY
    spheres[i][j] = sphere
    scene.add(sphere);
    y += DISTANCE
  }
  x += DISTANCE
}

const target = spheres[9][9]
const origin = new THREE.Vector2(target.position.x, target.position.y)
const clock = new THREE.Clock(true)

let pause = false
let et = 0
const wave = {
  a: 8,
  w: 3,
  v: 10,
}

const fpsCounter = document.getElementById('fps-counter')

const animate = function () {
  if (!pause) {
    requestAnimationFrame(animate);
  }
  const dt = clock.getDelta()
  const fps = Math.floor(1/dt)
  
  et += dt
  for (let list of spheres) {
    for (let s of list) {
      const posInPlane = new THREE.Vector2(s.position.x, s.position.y)
      const d = posInPlane.distanceTo(origin)
      const lossRatio = 1//0.1 * d
      s.position.z = wave.a * Math.sin(wave.w * (et - (d / wave.v))) / lossRatio
    }
  }
  target.position.z = wave.a * Math.sin(wave.w * et)
  renderer.render(scene, camera);
  fpsCounter.innerHTML = fps + ''
};

window.addEventListener('keydown', (evt) => {
  if (evt.key === ' ') {
    pause = !pause
    if (!pause) {
      animate();
      clock.start()
    } else {
      clock.stop()
    }
  }
})

const ZERO = new Vector3(0, 0, 0)
const Y_AXIS = new Vector3(1, 0, 0)
const X_AXIS = new Vector3(0, 1, 0)
window.addEventListener('mousemove', (evt) => {
  if (evt.buttons === 1) {
    const R = 0.005
    const y = evt.movementY * R
    const x = evt.movementX * R
    const q = new Quaternion()
    q.setFromEuler(new Euler(-y, x, 0))
    camera.position.applyQuaternion(q)
    
    //camera.position.applyAxisAngle(Y_AXIS, y)
    //const x = evt.movementX * R
    //camera.position.applyQuaternion(new Quaternion(1, 0, 0, 1))
    //camera.position.applyAxisAngle(X_AXIS, x)
    camera.lookAt(ZERO)
  }
})

animate()

init(DIM, DIM)