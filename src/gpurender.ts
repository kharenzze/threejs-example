export const init = (HEIGHT, WIDTH) => {

    function createShader(gl, program, source, type) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        gl.attachShader(program, shader);
        return shader;
    }

    function createProgram(gl, vertexSource, fragmentSource) {
        const program = gl.createProgram();
        createShader(gl, program, vertexSource, gl.VERTEX_SHADER);
        createShader(gl, program, fragmentSource, gl.FRAGMENT_SHADER);
        gl.linkProgram(program);
        return program;
    }
    const vs = `#version 300 es
in vec4 position;
void main() {
  gl_Position = position;
}
`;

    const fs = `#version 300 es
precision highp float;
 
uniform sampler2D srcTex;
 
out vec4 outColor;
 
void main() {
  ivec2 texelCoord = ivec2(gl_FragCoord.xy);
  vec4 value = texelFetch(srcTex, texelCoord, 0);  // 0 = mip level 0
  outColor = value * 1.0;
}
`;

    const canvas = document.createElement('canvas');
    canvas.width = WIDTH;
    canvas.height = HEIGHT;

    const gl = canvas.getContext('webgl2');

    const program = createProgram(gl, vs, fs);
    const positionLoc = gl.getAttribLocation(program, 'position');
    const srcTexLoc = gl.getUniformLocation(program, 'srcTex');

    // setup a full canvas clip space quad
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        -1, -1,
        1, -1,
        -1, 1,
        -1, 1,
        1, -1,
        1, 1,
    ]), gl.STATIC_DRAW);

    // Create a vertex array object (attribute state)
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    // setup our attributes to tell WebGL how to pull
    // the data from the buffer above to the position attribute
    gl.enableVertexAttribArray(positionLoc);
    gl.vertexAttribPointer(
        positionLoc,
        2,         // size (num components)
        gl.FLOAT,  // type of data in buffer
        false,     // normalize
        0,         // stride (0 = auto)
        0,         // offset
    );

    const initData = () => {
        const l = WIDTH * HEIGHT * 4
        const data = new Uint8Array(l)
        for (let i = 0; i < l; i = i + 4) {
            const p = i / 4
            data[i] = 0
            data[i+1] = 0
            data[i+2] = p % WIDTH
            data[i+3] = p / WIDTH
        }
        return data
    }
    // create our source texture
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1); // see https://webglfundamentals.org/webgl/lessons/webgl-data-textures.html
    const data = initData()
    console.log(data);
    gl.texImage2D(
        gl.TEXTURE_2D,
        0,                // mip level
        gl.RGBA,            // internal format
        WIDTH,
        HEIGHT ,
        0,                // border
        gl.RGBA,           // format
        gl.UNSIGNED_BYTE, // type
        data,
    )
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    gl.useProgram(program);
    gl.uniform1i(srcTexLoc, 0);  // tell the shader the src texture is on texture unit 0

    gl.drawArrays(gl.TRIANGLES, 0, 6);  // draw 2 triangles (6 vertices)

    // get the result
    const results = new Uint8Array(WIDTH * HEIGHT * 4);
    gl.readPixels(0, 0, WIDTH, HEIGHT, gl.RGBA, gl.UNSIGNED_BYTE, results);
    console.log(results)

}