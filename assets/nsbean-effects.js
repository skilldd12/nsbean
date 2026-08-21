/* NS-BEAN 高级动效库 (anime.js v4.2.2)
 * 覆盖：弹簧 / 拖拽回弹 / 滚动联动 scrub / SVG morph
 * 全部遵守 prefers-reduced-motion，移动端自动降级
 */
import {
  animate,
  createSpring,
  createDraggable,
  onScroll,
  stagger,
  svg
} from './anime.esm.min.js';

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const SPRING = { stiffness: 190, damping: 13 };
const SPRING_SOFT = { stiffness: 110, damping: 15 };

/* ---------- 1. Hero 逐字弹簧入场 ---------- */
export function heroSpring(targets = '.hero-heading .ch') {
  if (reduced) return;
  const els = document.querySelectorAll(targets);
  if (!els.length) return;
  animate(els, {
    opacity: [0, 1],
    translateY: [22, 0],
    scale: [0.96, 1],
    filter: ['blur(8px)', 'blur(0px)'],
    delay: stagger(26, { start: 220 }),
    ease: createSpring({ stiffness: 80, damping: 14 }),
  });
}

/* ---------- 2. 图标 hover 弹簧 ---------- */
export function iconSpring(root = document, targets = 'svg') {
  if (reduced || !fine) return;
  root.querySelectorAll(targets).forEach((el) => {
    el.addEventListener('mouseenter', () => {
      animate(el, { scale: 1.16, rotate: 7, ease: createSpring(SPRING), duration: 500 });
    }, { passive: true });
    el.addEventListener('mouseleave', () => {
      animate(el, { scale: 1, rotate: 0, ease: createSpring(SPRING), duration: 500 });
    }, { passive: true });
  });
}

/* ---------- 3. 卡片 hover 弹簧微动 ---------- */
export function cardHoverSpring(targets = '.card', opts = {}) {
  if (reduced || !fine) return;
  const lift = opts.lift || -4;
  document.querySelectorAll(targets).forEach((el) => {
    el.addEventListener('mouseenter', () => {
      animate(el, { translateY: lift, scale: 1.012, ease: createSpring(SPRING), duration: 600 });
    }, { passive: true });
    el.addEventListener('mouseleave', () => {
      animate(el, { translateY: 0, scale: 1, ease: createSpring(SPRING_SOFT), duration: 700 });
    }, { passive: true });
  });
}

/* ---------- 4. 滚动联动 3D 翻转 ---------- */
export function caseFlip(targets = '.case-card') {
  if (reduced) return;
  document.querySelectorAll(targets).forEach((card) => {
    animate(card, {
      rotateY: [22, 0],
      opacity: [0.25, 1],
      translateY: [24, 0],
      ease: createSpring({ stiffness: 110, damping: 16 }),
      autoplay: onScroll({
        target: card,
        enter: 'bottom 88%',
        leave: 'top -16%',
        sync: 0,
      }),
    });
  });
}

/* ---------- 5. 时间线/进度条滚动 scrub ---------- */
export function timelineScrub(beamSel, trackSel) {
  if (reduced) return;
  const beam = document.querySelector(beamSel);
  const track = document.querySelector(trackSel);
  if (!beam || !track) return;
  animate(beam, {
    scaleY: [0, 1],
    autoplay: onScroll({
      target: track,
      enter: 'top 78%',
      leave: 'bottom 28%',
      sync: true,
    }),
  });
}

/* ---------- 6. 时间节点年份滚动弹入 ---------- */
export function yearReveal(targets = '.timeline .tl-item', yearSel = '.tl-year') {
  if (reduced) return;
  document.querySelectorAll(targets).forEach((item) => {
    const year = item.querySelector(yearSel);
    if (!year) return;
    animate(year, {
      scale: [0.55, 1],
      opacity: [0, 1],
      autoplay: onScroll({
        target: item,
        enter: 'bottom 85%',
        leave: 'top 15%',
        sync: 0.5,
      }),
    });
  });
}

/* ---------- 7. 拖拽弹簧回弹 ---------- */
export function dragBack(targets = '.drag-back') {
  if (reduced || !fine) return;
  document.querySelectorAll(targets).forEach((el) => {
    let dragged = false;
    createDraggable(el, {
      container: el.parentElement || document.body,
      containerPadding: 18,
      onDrag: () => { dragged = true; },
      onRelease: () => {
        setTimeout(() => { dragged = false; }, 80);
        animate(el, {
          x: 0,
          y: 0,
          ease: createSpring({ stiffness: 170, damping: 13 }),
          duration: 900,
        });
      },
    });
    el.addEventListener('click', (e) => {
      if (dragged) {
        e.preventDefault();
        e.stopPropagation();
      }
    }, true);
  });
}

/* ---------- 8. SVG 装饰图形滚动 morph ---------- */
export function morphDeco(svgSel, targetSels, wrapSel) {
  if (reduced) return;
  const path = document.querySelector(svgSel);
  const targets = targetSels.map((s) => document.querySelector(s)).filter(Boolean);
  const wrap = wrapSel ? document.querySelector(wrapSel) : path && path.parentElement;
  if (!path || !targets.length || !wrap) return;
  const steps = targets.map((t) => ({ d: () => svg.morphTo(t)(path) }));
  animate(path, {
    keyframes: steps,
    duration: 1600,
    autoplay: onScroll({
      target: wrap,
      enter: 'bottom 88%',
      leave: 'top 12%',
      sync: true,
    }),
  });
}

/* ---------- 9. FAQ 弹簧展开（CSS grid-rows 过渡，规避 anime dev 版 height bug） ---------- */
export function faqSpring(scope = document) {
  if (reduced) return;
  scope.querySelectorAll('details').forEach((d) => {
    const body = d.querySelector('p');
    if (!body) return;
    const inner = document.createElement('span');
    while (body.firstChild) inner.appendChild(body.firstChild);
    body.appendChild(inner);
    body.style.cssText = 'display:grid;grid-template-rows:0fr;transition:grid-template-rows .55s cubic-bezier(.34,1.56,.64,1),opacity .28s ease;opacity:0;overflow:hidden;margin:0';
    inner.style.cssText = 'overflow:hidden;min-height:0;display:block';
    d.addEventListener('toggle', () => {
      if (d.open) {
        body.style.gridTemplateRows = '1fr';
        body.style.opacity = '1';
      } else {
        body.style.gridTemplateRows = '0fr';
        body.style.opacity = '0';
      }
    });
  });
}

/* ---------- 10. 背景装饰视差（滚动联动） ---------- */
export function parallax(targets = '.parallax', amount = 60) {
  if (reduced) return;
  document.querySelectorAll(targets).forEach((el) => {
    animate(el, {
      translateY: [-amount / 2, amount / 2],
      autoplay: onScroll({
        target: el,
        enter: 'bottom bottom',
        leave: 'top top',
        sync: true,
      }),
    });
  });
}
