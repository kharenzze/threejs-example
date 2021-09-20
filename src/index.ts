//index.ts
//
import './main.css'
import './hola.ts'
import vert from './sample.vert'
import frag from './sample.frag'

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

interface Canvas extends HTMLElement, SimpleRect {}

const aspect = 16 / 9
const canvas: Canvas = document.getElementById('canvas') as Canvas
const rect = canvas.getBoundingClientRect() 
const gl = canvas.getContext("webgl");

const createShader = (type, sourceCode: string) => {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, sourceCode);
  gl.compileShader(shader);
  return shader
}

const onResize = (evt) => {
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
  canvas.height = desired.height
  canvas.width = desired.width
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
}

onResize()
asdasd

const resizeListener = window.addEventListener('resize', onResize)

//compile shader
const vertShader = createShader(gl.VERTEX_SHADER, vert)
const fragShader = createShader(gl.FRAGMENT_SHADER, frag)

const program = gl.createProgram();
gl.attachShader(program, vertShader);
gl.attachShader(program, fragShader);
gl.linkProgram(program);

//vertices
const vertices = new Float32Array([
-1, 0.5*aspect, 1, 0.5*aspect, 0.5,-0.5*aspect, // Triangle 1
-0.5, 0.5*aspect, 0.5,-0.5*aspect, -0.5,-0.5*aspect // Triangle 2
]);

const vbuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vbuffer);
gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

const itemSize =vertices.length / 6; 
const numItems = vertices.length / itemSize;

gl.useProgram(program);

program.uColor = gl.getUniformLocation(program, "uColor");
gl.uniform4fv(program.uColor, [0.0, 0.7, 0.0, 1.0]);

program.aVertexPosition = gl.getAttribLocation(program, "aVertexPosition");
gl.enableVertexAttribArray(program.aVertexPosition);
gl.vertexAttribPointer(program.aVertexPosition, itemSize, gl.FLOAT, false, 0, 0);

gl.drawArrays(gl.TRIANGLES, 0, numItems);

setTimeout(() => {
  gl.uniform4fv(program.uColor, [0.7, 0.0, 0.0, 1.0]);
  gl.drawArrays(gl.TRIANGLES, 0, numItems);
}, 1000)

