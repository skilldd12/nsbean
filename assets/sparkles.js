/* Sparkles - light particle twinkle background (Aceternity SparklesCore style) */
(function () {
  'use strict';
  function initSparkles(canvas) {
    if (!canvas || !canvas.getContext) return;
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var ctx = canvas.getContext('2d');
    var W, H, ps = [];
    function resize() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = canvas.width = window.innerWidth * dpr;
      H = canvas.height = window.innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
    }
    resize();
    window.addEventListener('resize', resize);
    var count = Math.min(70, Math.floor(window.innerWidth / 18));
    for (var i = 0; i < count; i++) {
      ps.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        r: 0.5 + Math.random() * 1.4,
        tw: 0.8 + Math.random() * 2.2,
        ph: Math.random() * Math.PI * 2,
        o: 0.1 + Math.random() * 0.45
      });
    }
    function draw(t) {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      ps.forEach(function (p) {
        var a = p.o * (0.5 + 0.5 * Math.sin(t / 1000 * p.tw + p.ph));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,178,122,' + a.toFixed(3) + ')';
        ctx.fill();
      });
      if (!reduced) requestAnimationFrame(draw);
      else ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    }
    if (!reduced) requestAnimationFrame(draw);
    else {
      ps.forEach(function (p) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,178,122,' + (p.o * 0.5).toFixed(3) + ')';
        ctx.fill();
      });
    }
  }
  document.querySelectorAll('.sparkles').forEach(initSparkles);
})();
