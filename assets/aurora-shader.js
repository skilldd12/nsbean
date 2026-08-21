/* NS-BEAN WebGL Aurora 极光背景（自包含）
 * 全局 fixed 画布：白底 + 品牌绿流动光斑 + 细颗粒
 * 降级：WebGL 不可用 → 移除画布（页面自带 CSS 极光兜底）
 * prefers-reduced-motion → 静态单帧
 */
(function () {
  var canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  canvas.style.cssText = 'position:fixed;inset:0;z-index:-1;width:100vw;height:100vh;pointer-events:none;display:block';
  document.body.appendChild(canvas);

  var gl = null;
  try {
    gl = canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  } catch (e) { gl = null; }
  if (!gl) { canvas.remove(); return; }

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var dpr = Math.min(window.devicePixelRatio || 1, 1.5);

  var VS = 'attribute vec2 a_pos;void main(){gl_Position=vec4(a_pos,0.0,1.0);}';
  var FS = [
    'precision highp float;',
    'uniform vec2 u_res;',
    'uniform float u_time;',
    'float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453123);}',
    'float noise(vec2 p){',
    '  vec2 i=floor(p),f=fract(p);',
    '  f=f*f*(3.0-2.0*f);',
    '  return mix(mix(hash(i),hash(i+vec2(1.0,0.0)),f.x),',
    '             mix(hash(i+vec2(0.0,1.0)),hash(i+vec2(1.0,1.0)),f.x),f.y);',
    '}',
    'void main(){',
    '  vec2 uv=gl_FragCoord.xy/u_res;',
    '  vec2 p=uv;',
    '  vec3 col=vec3(1.0);',
    '  for(int i=0;i<3;i++){',
    '    float fi=float(i);',
    '    vec2 c=vec2(0.5+0.34*sin(u_time*0.15+fi*2.1),0.5+0.32*cos(u_time*0.12+fi*1.7));',
    '    float d=length((p-c)*vec2(1.25,0.85));',
    '    float glow=exp(-d*d*5.2);',
    '    float pul=0.55+0.45*sin(u_time*0.28+fi*2.2);',
    '    col-=glow*pul*vec3(0.30,0.42,0.16);',
    '  }',
    '  float n=noise(p*7.0+vec2(u_time*0.015,0.0));',
    '  col-=n*0.018;',
    '  col-=pow(1.0-p.y,1.6)*0.05*vec3(0.30,0.48,0.20);',
    '  gl_FragColor=vec4(col,1.0);',
    '}'
  ].join('\n');

  function compile(type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.warn('shader fail', gl.getShaderInfoLog(s)); return null; }
    return s;
  }
  var vs = compile(gl.VERTEX_SHADER, VS);
  var fs = compile(gl.FRAGMENT_SHADER, FS);
  if (!vs || !fs) { canvas.remove(); return; }

  var prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { canvas.remove(); return; }
  gl.useProgram(prog);

  var buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  var loc = gl.getAttribLocation(prog, 'a_pos');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  var uRes = gl.getUniformLocation(prog, 'u_res');
  var uTime = gl.getUniformLocation(prog, 'u_time');

  function resize() {
    var w = Math.max(1, Math.floor(window.innerWidth * dpr));
    var h = Math.max(1, Math.floor(window.innerHeight * dpr));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
    }
    gl.uniform2f(uRes, w, h);
  }

  var t0 = performance.now();
  function frame() {
    resize();
    gl.uniform1f(uTime, reduce ? 0 : (performance.now() - t0) / 1000);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    if (!reduce) requestAnimationFrame(frame);
  }
  window.addEventListener('resize', resize);
  frame();
})();
