// Ve lop phu (phu de + the do hoa) cho video tai giay t. Ham thuan cua t: dung chung cho render va editor.
// edit = { style: {accent, font}, captions: [{start,end,text,highlight,pos}], cards: [{start,end,icon,title,sub,x,y}] }
(function () {
  function spring(t, { stiffness = 170, damping = 18, mass = 1 } = {}) {
    if (t <= 0) return 0;
    const w0 = Math.sqrt(stiffness / mass), zeta = damping / (2 * Math.sqrt(stiffness * mass));
    if (zeta < 1) {
      const wd = w0 * Math.sqrt(1 - zeta * zeta);
      return 1 - Math.exp(-zeta * w0 * t) * (Math.cos(wd * t) + (zeta * w0 / wd) * Math.sin(wd * t));
    }
    return 1 - (1 + w0 * t) * Math.exp(-w0 * t);
  }
  const clamp = (x) => Math.max(0, Math.min(1, x));
  const POP = { stiffness: 320, damping: 22 };
  const POS = { top: 0.14, middle: 0.5, bottom: 0.62 };
  const OUT = 0.12; // giay mo dan khi ket thuc

  // Do mo + ti le cho mot phan tu song trong [start, end]
  function life(t, start, end, from) {
    if (t < start || t >= end) return null; // mo het truoc end de khong de len dong ke tiep
    const k = spring(t - start, POP);
    return { alpha: clamp(k * 1.6) * clamp((end - t) / OUT), scale: from + (1 - from) * k };
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath(); ctx.roundRect(x, y, w, h, r); ctx.fill();
  }

  function caption(ctx, W, H, c, t, st) {
    const l = life(t, c.start, c.end, 0.85);
    if (!l) return;
    const u = W / 100;
    let size = 7.5 * u;
    ctx.font = `800 ${size}px ${st.font}`;
    const max = W * 0.88, w0 = ctx.measureText(c.text).width;
    if (w0 > max) { size *= max / w0; ctx.font = `800 ${size}px ${st.font}`; }
    const tw = ctx.measureText(c.text).width;
    const y = H * (POS[c.pos] ?? POS.bottom);
    ctx.save();
    ctx.globalAlpha = l.alpha;
    ctx.translate(W / 2, y); ctx.scale(l.scale, l.scale);
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    if (c.highlight) {
      ctx.fillStyle = st.accent;
      roundRect(ctx, -tw / 2 - 2 * u, -size * 0.68, tw + 4 * u, size * 1.36, 1.5 * u);
      ctx.fillStyle = '#111';
    } else {
      ctx.lineJoin = 'round'; ctx.lineWidth = size * 0.16; ctx.strokeStyle = 'rgba(0,0,0,0.85)';
      ctx.strokeText(c.text, 0, size * 0.04);
      ctx.fillStyle = c.color || '#fff';
    }
    ctx.fillText(c.text, 0, size * 0.04);
    ctx.restore();
  }

  function card(ctx, W, H, c, t, st) {
    const l = life(t, c.start, c.end, 0.6);
    if (!l) return;
    const u = W / 100, h = 12 * u, ic = 8.5 * u, pad = 1.8 * u;
    ctx.font = `700 ${4.2 * u}px ${st.font}`;
    const titleW = ctx.measureText(c.title || '').width;
    ctx.font = `500 ${3 * u}px ${st.font}`;
    const subW = ctx.measureText(c.sub || '').width;
    const w = pad + (c.icon ? ic + pad : 0) + Math.max(titleW, subW) + 2 * pad;
    ctx.save();
    ctx.globalAlpha = l.alpha;
    ctx.translate(W * (c.x ?? 0.5), H * (c.y ?? 0.2)); ctx.scale(l.scale, l.scale); ctx.translate(-w / 2, -h / 2);
    ctx.fillStyle = 'rgba(18,18,18,0.88)'; roundRect(ctx, 0, 0, w, h, 2.4 * u);
    ctx.strokeStyle = 'rgba(255,255,255,0.18)'; ctx.lineWidth = 0.3 * u; ctx.stroke();
    let x = pad;
    ctx.textBaseline = 'middle';
    if (c.icon) {
      ctx.fillStyle = '#fff'; roundRect(ctx, x, (h - ic) / 2, ic, ic, 1.6 * u);
      ctx.fillStyle = '#111'; ctx.textAlign = 'center'; ctx.font = `700 ${4.6 * u}px ${st.font}`;
      ctx.fillText(c.icon, x + ic / 2, h / 2 + 0.2 * u);
      x += ic + pad;
    }
    ctx.textAlign = 'left';
    ctx.fillStyle = '#fff'; ctx.font = `700 ${4.2 * u}px ${st.font}`;
    ctx.fillText(c.title || '', x, c.sub ? h * 0.38 : h / 2);
    if (c.sub) { ctx.fillStyle = st.accent; ctx.font = `500 ${3 * u}px ${st.font}`; ctx.fillText(c.sub, x, h * 0.7); }
    ctx.restore();
  }

  window.drawOverlay = (ctx, W, H, edit, t) => {
    const st = { accent: '#FFE14D', font: '"Be Vietnam Pro", Inter, Arial, sans-serif', ...edit.style };
    ctx.clearRect(0, 0, W, H);
    (edit.cards || []).forEach((c) => card(ctx, W, H, c, t, st));
    (edit.captions || []).forEach((c) => caption(ctx, W, H, c, t, st));
  };
})();
