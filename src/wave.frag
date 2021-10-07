precision mediump float;

void main()	{
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec4 tmpPos = texture2D( texturePosition, uv );

    gl_FragColor = 2.0 * tmpPos;
}