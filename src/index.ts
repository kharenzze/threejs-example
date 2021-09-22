import './main.css'
import * as THREE from 'three'

interface SimpleRect {
  height: number
  width: number
}

const fits = (ref: SimpleRect, other: SimpleRect): boolean =>
  other.width <= ref.width && other.height <= ref.height

const getViewSimpleRect = ():SimpleRect => ({
  height: window.innerHeight,
  width: window.innerWidth,
})

const aspect = 16 / 9
const canvas = document.getElementById('canvas')

const renderer = new THREE.WebGLRenderer({
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

const camera = new THREE.PerspectiveCamera( 45, aspect, 1, 500 );
camera.position.set( 0, -30, 100 );
camera.lookAt( 0, 0, 0 );

const scene = new THREE.Scene();

const HEX = {
  SIN60: Math.sin(Math.PI / 3),
  COS60: Math.cos(Math.PI / 3),
}
const DIM = 20
const RADIUS = 1
const DISTANCE = 4 * RADIUS
const START = -(DIM-1) * DISTANCE/ 2
const spheres = new Array(DIM)
let x = START
for (let i = 0; i < DIM; i++) {
  spheres[i] = new Array(DIM)
  let y = START
  for (let j = 0; j < DIM; j++) {
    const material = new THREE.LineBasicMaterial( { color: 0x0000ff } )
    const geometry = new THREE.SphereGeometry( RADIUS, 32, 16 )
    const sphere = new THREE.Mesh( geometry, material );
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
const clock = new THREE.Clock(true)

const animate = function () {
  requestAnimationFrame( animate );
  const et = clock.getElapsedTime()
  target.position.z = 3 * Math.sin(2*et)
  renderer.render( scene, camera );
};

animate();