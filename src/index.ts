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
camera.position.set( 0, 0, 100 );
camera.lookAt( 0, 0, 0 );

const scene = new THREE.Scene();

//create a blue LineBasicMaterial
const material = new THREE.LineBasicMaterial( { color: 0x0000ff } );

const points = [];
points.push( new THREE.Vector3( - 10, 0, 0 ) );
points.push( new THREE.Vector3( 0, 10, 0 ) );
points.push( new THREE.Vector3( 10, 0, 0 ) );

const geometry = new THREE.BufferGeometry().setFromPoints( points );

const line = new THREE.Line( geometry, material );

scene.add( line );
renderer.render( scene, camera );