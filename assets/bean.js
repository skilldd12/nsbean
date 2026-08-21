/* NS-BEAN 桌宠 Bean（自包含组件）
 * 原创 SVG Q 版咖啡豆 · 悬浮 + 眨眼 + 叶片动画 · 可拖动（localStorage 记忆）
 * 点击 → 跳转 agent 页（英文 agent.html / 中文 zh/agent.html，相对路径自动适配）
 * agent 页自身不显示桌宠
 */
(function () {
  if (/agent\.html/i.test(location.pathname)) return;

  var C = { g1: '#9ad45a', g2: '#71b72e', g3: '#569a20', stroke: '#4f8f1d', leafL: '#8cc63f', leafR: '#a3d968', hand: '#9ad45a' };

  var css = [
    '.pet{position:fixed;right:22px;bottom:22px;width:94px;height:94px;z-index:400;cursor:grab;user-select:none;touch-action:none}',
    '.pet.dragging{cursor:grabbing}',
    '.pet.idle{animation:petFloat 3.8s ease-in-out infinite}',
    '.pet .halo{position:absolute;inset:-10px;border-radius:50%;background:radial-gradient(circle,rgba(113,183,46,.22),transparent 70%);animation:petHalo 3.8s ease-in-out infinite;pointer-events:none}',
    '.pet svg{position:absolute;inset:0;width:100%;height:100%;filter:drop-shadow(0 10px 18px rgba(6,20,15,.45))}',
    '.pet .leaf-l,.pet .leaf-r{transform-origin:50% 20%;animation:petLeaf 3.8s ease-in-out infinite}',
    '.pet .eye-b{animation:petBlink 4.6s infinite}',
    '.pet .shadow{position:absolute;bottom:-10px;left:20%;right:20%;height:10px;border-radius:50%;background:rgba(8,20,15,.35);filter:blur(3px);animation:petShadow 3.8s ease-in-out infinite;pointer-events:none}',
    '.pet .tip{position:absolute;bottom:100%;right:-4px;margin-bottom:12px;background:#0a0f0d;border:1px solid rgba(113,183,46,.35);color:#fff;padding:8px 13px;border-radius:10px;font-size:12.5px;white-space:nowrap;opacity:0;transform:translateY(4px);transition:.2s;pointer-events:none;font-family:"Inter","PingFang SC","Microsoft YaHei",system-ui,sans-serif}',
    '.pet .tip:after{content:"";position:absolute;bottom:-6px;right:22px;border:6px solid transparent;border-top-color:#0a0f0d;border-bottom:0}',
    '.pet.show-tip .tip{opacity:1;transform:translateY(0)}',
    '@keyframes petFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-11px)}}',
    '@keyframes petHalo{0%,100%{opacity:.75;transform:scale(1)}50%{opacity:1;transform:scale(1.12)}}',
    '@keyframes petLeaf{0%,100%{transform:rotate(0)}50%{transform:rotate(9deg)}}',
    '@keyframes petBlink{0%,92%,100%{transform:scaleY(1)}95%{transform:scaleY(.08)}}',
    '@keyframes petShadow{0%,100%{transform:scale(1);opacity:.5}50%{transform:scale(.82);opacity:.32}}',
    '@media (prefers-reduced-motion:reduce){.pet.idle,.pet .halo,.pet .leaf-l,.pet .leaf-r,.pet .eye-b,.pet .shadow{animation:none}}'
  ].join('');

  var html = [
    '<div class="halo"></div>',
    '<svg viewBox="0 0 100 100" aria-hidden="true">',
    '<defs><linearGradient id="petBodyG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + C.g1 + '"/><stop offset=".55" stop-color="' + C.g2 + '"/><stop offset="1" stop-color="' + C.g3 + '"/></linearGradient></defs>',
    '<path class="leaf-l" d="M52 20 C44 8, 28 6, 21 14 C31 15, 44 21, 52 27" fill="' + C.leafL + '"/>',
    '<path class="leaf-r" d="M48 20 C56 8, 72 6, 79 14 C69 15, 56 21, 48 27" fill="' + C.leafR + '"/>',
    '<path class="leaf-l" d="M50 22 C47 14, 40 9, 33 9" fill="none" stroke="' + C.g2 + '" stroke-width="1.2"/>',
    '<path d="M50 24 L50 31" stroke="' + C.g3 + '" stroke-width="2.5" stroke-linecap="round"/>',
    '<ellipse cx="50" cy="59" rx="30" ry="33" fill="url(#petBodyG)"/>',
    '<ellipse cx="50" cy="59" rx="30" ry="33" fill="none" stroke="' + C.stroke + '" stroke-width="1.5"/>',
    '<ellipse cx="36" cy="45" rx="9" ry="13" fill="rgba(255,255,255,.30)" transform="rotate(-22 36 45)"/>',
    '<g class="eye-b"><circle cx="40" cy="55" r="7" fill="#fff"/><circle cx="61" cy="55" r="7" fill="#fff"/><circle cx="42.5" cy="56.5" r="3.6" fill="#1a1a1a"/><circle cx="63.5" cy="56.5" r="3.6" fill="#1a1a1a"/><circle cx="44" cy="54.5" r="1.4" fill="#fff"/><circle cx="65" cy="54.5" r="1.4" fill="#fff"/></g>',
    '<ellipse cx="29" cy="64" rx="5" ry="3.2" fill="rgba(255,138,138,.55)"/><ellipse cx="71" cy="64" rx="5" ry="3.2" fill="rgba(255,138,138,.55)"/>',
    '<path d="M43 68 Q50 75 57 68" stroke="#1a1a1a" stroke-width="2" fill="none" stroke-linecap="round"/>',
    '<circle cx="17" cy="62" r="5.5" fill="' + C.hand + '" stroke="' + C.g2 + '" stroke-width="1"/><circle cx="83" cy="62" r="5.5" fill="' + C.hand + '" stroke="' + C.g2 + '" stroke-width="1"/>',
    '<path d="M50 91 Q47 96 50 99" stroke="' + C.g3 + '" stroke-width="1.5" stroke-linecap="round"/>',
    '</svg>',
    '<div class="shadow"></div>',
    '<div class="tip">我是 Bean，点我去 AI Agent</div>'
  ].join('');

  var st = document.createElement('style');
  st.textContent = css;
  document.head.appendChild(st);

  var pet = document.createElement('div');
  pet.className = 'pet idle';
  pet.id = 'pet';
  pet.innerHTML = html;
  pet.setAttribute('role', 'button');
  pet.setAttribute('tabindex', '0');
  pet.setAttribute('aria-label', '点击进入 AI Agent');
  document.body.appendChild(pet);

  var dragging = false, ox = 0, oy = 0, sx = 0, sy = 0;
  var saved = null;
  try { saved = localStorage.getItem('nsbean-pet-pos'); } catch (e) {}
  if (saved) {
    var sp = JSON.parse(saved);
    pet.style.left = sp.x + 'px';
    pet.style.top = sp.y + 'px';
    pet.style.right = 'auto';
    pet.style.bottom = 'auto';
  }

  pet.addEventListener('pointerdown', function (e) {
    dragging = true;
    pet.classList.add('dragging');
    var r = pet.getBoundingClientRect();
    ox = e.clientX; oy = e.clientY; sx = r.left; sy = r.top;
    pet.setPointerCapture && pet.setPointerCapture(e.pointerId);
    e.preventDefault();
  });
  pet.addEventListener('pointermove', function (e) {
    if (!dragging) return;
    var x = Math.min(Math.max(sx + e.clientX - ox, 0), window.innerWidth - 100);
    var y = Math.min(Math.max(sy + e.clientY - oy, 0), window.innerHeight - 100);
    pet.style.left = x + 'px';
    pet.style.top = y + 'px';
    pet.style.right = 'auto';
    pet.style.bottom = 'auto';
  });
  function up() {
    if (!dragging) return;
    dragging = false;
    pet.classList.remove('dragging');
    var r = pet.getBoundingClientRect();
    try { localStorage.setItem('nsbean-pet-pos', JSON.stringify({ x: r.left, y: r.top })); } catch (e) {}
  }
  pet.addEventListener('pointerup', up);
  pet.addEventListener('pointercancel', up);
  pet.addEventListener('click', function () {
    if (dragging) return;
    location.href = 'agent.html';
  });
  pet.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); location.href = 'agent.html'; }
  });

  setTimeout(function () {
    pet.classList.add('show-tip');
    setTimeout(function () { pet.classList.remove('show-tip'); }, 3400);
  }, 1600);
})();
