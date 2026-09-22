var zr = Object.defineProperty;
var Kr = (m, t, s) => t in m ? zr(m, t, { enumerable: !0, configurable: !0, writable: !0, value: s }) : m[t] = s;
var C = (m, t, s) => Kr(m, typeof t != "symbol" ? t + "" : t, s);
function xe(m, t) {
  const s = [Hr(m)];
  for (const d of t) {
    const v = s[s.length - 1];
    s.push(Qr(v, d));
  }
  const l = Jr(s);
  return {
    totalSteps: s.length,
    states: s,
    edgeIndex: l
  };
}
function Hr(m) {
  return JSON.parse(JSON.stringify(m));
}
function Qr(m, t) {
  return {
    nodes: { ...m.nodes, ...t.nodes ?? {} },
    edges: { ...m.edges, ...t.edges ?? {} }
  };
}
function Jr(m) {
  const t = /* @__PURE__ */ new Map();
  for (const s of m)
    for (const l in s.edges) {
      const d = s.edges[l];
      for (const v of [d.source, d.target])
        t.has(v) || t.set(v, /* @__PURE__ */ new Set()), t.get(v).add(l);
    }
  return t;
}
function Xr(m, t, s = 20) {
  const l = t.x - m.x, d = t.y - m.y, v = Math.hypot(l, d) || 1, _ = l / v, p = d / v, b = m.x + _ * s, k = m.y + p * s, w = t.x - _ * s, F = t.y - p * s, W = `M ${b} ${k} L ${w} ${F}`;
  return { x1: b, y1: k, x2: w, y2: F, path: W };
}
function Zr(m, t) {
  const s = m.x, l = m.y, d = t.x, v = t.y, _ = (s + d) / 2, p = (l + v) / 2, b = `M ${s} ${l} Q ${_} ${p} ${d} ${v}`;
  return { x1: s, y1: l, x2: d, y2: v, path: b };
}
function en(m, t, s) {
  return (s == null ? void 0 : s.style) === "curved" ? Zr(m, t) : Xr(m, t);
}
class tn {
  constructor() {
    C(this, "map", /* @__PURE__ */ new Map());
  }
  add(t, s) {
    this.map.has(t) || this.map.set(t, /* @__PURE__ */ new Set()), this.map.get(t).add(s);
  }
  clear(t) {
    const s = this.map.get(t);
    if (s) {
      for (const l of s) l.remove();
      this.map.delete(t);
    }
  }
  clearAll() {
    for (const t of this.map.values())
      for (const s of t) s.remove();
    this.map.clear();
  }
}
class Xn {
  constructor() {
    C(this, "nodes", /* @__PURE__ */ new Set());
  }
  update(t) {
    this.nodes.clear();
    for (const s in t.nodes)
      t.nodes[s].visible && this.nodes.add(s);
  }
  has(t) {
    return this.nodes.has(t);
  }
  list() {
    return Array.from(this.nodes);
  }
}
class rn {
  constructor(t, s) {
    C(this, "currentStep", 0);
    C(this, "rafId", null);
    C(this, "visualState", /* @__PURE__ */ new Map());
    C(this, "transition", null);
    // Frozen in-flight transition (pause() / play() pair). Retains the elapsed
    // progress so play() can resume the remaining duration from the frozen frame.
    C(this, "pausedTransition", null);
    C(this, "destroyed", !1);
    this.data = t, this.renderer = s;
  }
  getDuration(t) {
    return !t || typeof window < "u" && typeof window.matchMedia == "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 500;
  }
  seek(t, s = !1) {
    if (this.destroyed) return;
    this.interrupt(), this.pausedTransition = null;
    const l = Math.max(0, Math.min(t, this.data.totalSteps - 1)), d = this.data.states[l];
    if (this.currentStep = l, !s) {
      this.applyInstant(d);
      return;
    }
    const v = new Map(this.visualState), _ = this.getDuration(!0);
    this.transition = { from: v, to: d, start: performance.now(), duration: _ }, this.rafId = requestAnimationFrame(this.tick.bind(this));
  }
  tick(t) {
    if (!this.transition || this.destroyed) return;
    const s = Math.min(1, (t - this.transition.start) / this.transition.duration), l = 1 - Math.pow(1 - s, 3), d = this.interpolate(this.transition.from, this.transition.to, l);
    this.applyVisual(d), s < 1 ? this.rafId = requestAnimationFrame(this.tick.bind(this)) : (this.transition = null, this.renderer.applyInstantState(this.data.states[this.currentStep]));
  }
  interpolate(t, s, l) {
    const d = /* @__PURE__ */ new Map(), v = /* @__PURE__ */ new Set([...t.keys(), ...Object.keys(s.nodes)]);
    for (const _ of v) {
      const p = s.nodes[_], b = t.get(_), k = (b == null ? void 0 : b.x) ?? (p == null ? void 0 : p.x) ?? 0, w = (b == null ? void 0 : b.y) ?? (p == null ? void 0 : p.y) ?? 0, F = (p == null ? void 0 : p.x) ?? k, W = (p == null ? void 0 : p.y) ?? w, I = b && b.visible ? b.opacity : 0, ie = p && p.visible ? p.opacity : 0, me = I + (ie - I) * l;
      d.set(_, {
        x: k + (F - k) * l,
        y: w + (W - w) * l,
        opacity: me,
        visible: me > 1e-3
      });
    }
    return d;
  }
  applyVisual(t) {
    var s;
    if (!this.destroyed) {
      this.visualState = new Map(t);
      for (const [l, d] of t) {
        this.renderer.updateNodePosition(l, d.x, d.y, d.opacity);
        const v = this.data.edgeIndex.get(l);
        if (v)
          for (const _ of v) {
            const p = (s = this.transition) == null ? void 0 : s.to.edges[_];
            if (!p) continue;
            const b = t.get(p.source), k = t.get(p.target);
            if (b && k) {
              const w = en(
                { x: b.x, y: b.y },
                { x: k.x, y: k.y },
                { style: p.style }
              );
              this.renderer.updateEdgeGeometry(_, w);
            }
          }
      }
    }
  }
  applyInstant(t) {
    if (!this.destroyed) {
      this.renderer.applyInstantState(t), this.visualState.clear();
      for (const s in t.nodes) {
        const l = t.nodes[s];
        this.visualState.set(s, { x: l.x, y: l.y, opacity: l.opacity, visible: l.visible });
      }
    }
  }
  findStepIndex(t) {
    return this.data.states.findIndex((s) => s === t);
  }
  interrupt() {
    this.destroyed || (this.rafId !== null && (cancelAnimationFrame(this.rafId), this.rafId = null), this.renderer.abortTransitions());
  }
  /**
   * Freeze any in-flight transition at its current frame and keep the current
   * picture on screen (visualState already holds the last painted frame).
   * The semantic step is NOT rewound (Core invariant §4.4: it advanced at seek
   * time); a later seek() tweens from the frozen frame, so there is no visual
   * jump. The elapsed progress is retained for play().
   */
  pause() {
    if (!this.destroyed && (this.rafId !== null && (cancelAnimationFrame(this.rafId), this.rafId = null), this.renderer.abortTransitions(), this.transition)) {
      const t = Math.max(
        0,
        Math.min(performance.now() - this.transition.start, this.transition.duration)
      );
      this.pausedTransition = {
        from: new Map(this.visualState),
        to: this.transition.to,
        elapsed: t,
        duration: this.transition.duration
      }, this.transition = null;
    }
  }
  /**
   * Resume a paused transition from the frozen frame for the remaining
   * duration. No-op when nothing is paused. A paused transition whose elapsed
   * already reached its duration reconciles instantly to the target state.
   */
  play() {
    if (this.destroyed) return;
    const t = this.pausedTransition;
    if (t) {
      if (this.pausedTransition = null, t.elapsed >= t.duration) {
        this.applyInstant(t.to);
        return;
      }
      this.transition = {
        from: t.from,
        to: t.to,
        start: performance.now() - t.elapsed,
        duration: t.duration
      }, this.rafId = requestAnimationFrame(this.tick.bind(this));
    }
  }
  /** Snapshot of the current visual frame (frozen frame after pause()). */
  captureVisualState() {
    return new Map(this.visualState);
  }
  next() {
    this.destroyed || this.seek(this.currentStep + 1, !0);
  }
  prev() {
    this.destroyed || this.seek(this.currentStep - 1, !0);
  }
  reset() {
    this.destroyed || this.seek(0, !1);
  }
  getCurrentStep() {
    return this.currentStep;
  }
  /** Total compiled step count (readonly view of the underlying data). */
  get totalSteps() {
    return this.data.totalSteps;
  }
  destroy() {
    this.destroyed || (this.destroyed = !0, this.interrupt(), this.renderer.destroy());
  }
}
const he = "http://www.w3.org/2000/svg", mr = 300;
class nn {
  constructor(t, s) {
    C(this, "svg");
    C(this, "defs");
    C(this, "edgeGroup");
    C(this, "nodeGroup");
    C(this, "ghostGroup");
    C(this, "nodes", /* @__PURE__ */ new Map());
    C(this, "edges", /* @__PURE__ */ new Map());
    // 4A.4：上一 Statate 存在过的边集合，用于推导 active(normal) vs history。
    C(this, "prevEdgeIds", /* @__PURE__ */ new Set());
    // 4A.6b：可中断的 transient 动画（enter/leave），便于 interruption 时取消。
    C(this, "transientTimers", /* @__PURE__ */ new Set());
    C(this, "leavingEls", /* @__PURE__ */ new Set());
    C(this, "ghostPool", new tn());
    C(this, "destroyed", !1);
    // 4A.2：Figure presentation metadata（不属于 CompiledStepState）
    C(this, "title");
    C(this, "edgeLanes");
    C(this, "palette", {
      node: "#ffffff",
      nodeText: "#0f172a",
      active: "#10b981",
      // active edge / active node
      activeLabel: "#065f46",
      history: "#94a3b8",
      // history edge
      historyLabel: "#64748b",
      edge: "#475569",
      edgeText: "#334155"
    });
    this.title = s == null ? void 0 : s.title, this.edgeLanes = s == null ? void 0 : s.edgeLanes, this.svg = document.createElementNS(he, "svg"), this.svg.setAttribute("viewBox", "0 0 960 540"), this.svg.setAttribute("width", "100%"), this.svg.setAttribute("height", "100%"), this.svg.setAttribute("style", "display:block;"), this.svg.setAttribute("role", "img"), this.svg.setAttribute("aria-label", this.title || "Technical diagram"), this.defs = document.createElementNS(he, "defs"), this.defs.appendChild(this.makeShadowFilter()), this.defs.appendChild(this.makeArrowMarker()), this.svg.appendChild(this.defs);
    const l = document.createElementNS(he, "title");
    l.textContent = this.title || "Technical diagram", this.svg.appendChild(l);
    const d = document.createElementNS(he, "desc");
    d.textContent = "技术概念交互式图解。", this.svg.appendChild(d), this.edgeGroup = document.createElementNS(he, "g"), this.nodeGroup = document.createElementNS(he, "g"), this.ghostGroup = document.createElementNS(he, "g"), this.svg.appendChild(this.edgeGroup), this.svg.appendChild(this.nodeGroup), this.svg.appendChild(this.ghostGroup), t.appendChild(this.svg);
  }
  // 4A.6b：可中断的定时器（进入/离开动画）
  scheduleAfter(t, s) {
    const l = setTimeout(() => {
      this.transientTimers.delete(l), s();
    }, t);
    this.transientTimers.add(l);
  }
  makeShadowFilter() {
    const t = document.createElementNS(he, "filter");
    t.setAttribute("id", "node-shadow"), t.setAttribute("x", "-50%"), t.setAttribute("y", "-50%"), t.setAttribute("width", "200%"), t.setAttribute("height", "200%");
    const s = document.createElementNS(he, "feDropShadow");
    return s.setAttribute("dx", "0"), s.setAttribute("dy", "2"), s.setAttribute("stdDeviation", "3"), s.setAttribute("flood-opacity", "0.25"), t.appendChild(s), t;
  }
  makeArrowMarker() {
    const t = document.createElementNS(he, "marker");
    t.setAttribute("id", "arrow"), t.setAttribute("markerWidth", "10"), t.setAttribute("markerHeight", "10"), t.setAttribute("refX", "9"), t.setAttribute("refY", "5"), t.setAttribute("orient", "auto");
    const s = document.createElementNS(he, "path");
    return s.setAttribute("d", "M 0 0 L 10 5 L 0 10 z"), s.setAttribute("fill", "#64748b"), t.appendChild(s), t;
  }
  mount(t) {
    this.destroyed || this.reconcile(t);
  }
  applyInstantState(t) {
    this.destroyed || this.reconcile(t);
  }
  reconcile(t) {
    if (this.destroyed) return;
    this.ghostPool.clearAll();
    const s = /* @__PURE__ */ new Set();
    for (const d in t.nodes) {
      s.add(d);
      const v = t.nodes[d], _ = this.nodes.get(d);
      _ ? this.updateNode(_, v) : this.nodes.set(d, this.createNode(d, v));
    }
    for (const [d, v] of this.nodes)
      s.has(d) || (v.g.remove(), this.nodes.delete(d));
    const l = /* @__PURE__ */ new Set();
    for (const d in t.edges) {
      const v = t.edges[d], _ = t.nodes[v.source], p = t.nodes[v.target];
      if (!_ || !p) continue;
      l.add(d);
      const b = !this.prevEdgeIds.has(d), k = this.edges.get(d);
      if (k)
        this.updateEdge(k, v, _, p, b);
      else {
        const w = this.createEdge(v, _, p, b);
        this.edges.set(d, w);
      }
    }
    for (const [d, v] of this.edges)
      l.has(d) || (this.edges.delete(d), this.leaveEdge(v));
    this.prevEdgeIds = l;
  }
  // ============ Nodes ============
  createNode(t, s) {
    const l = document.createElementNS(he, "g");
    l.setAttribute("data-id", t);
    const d = 132, v = 46, _ = document.createElementNS(he, "rect");
    _.setAttribute("x", String(-d / 2)), _.setAttribute("y", String(-v / 2)), _.setAttribute("width", String(d)), _.setAttribute("height", String(v)), _.setAttribute("rx", "12"), _.setAttribute("ry", "12"), _.setAttribute("filter", "url(#node-shadow)"), l.appendChild(_);
    const p = document.createElementNS(he, "text");
    p.setAttribute("x", "0"), p.setAttribute("y", "1"), p.setAttribute("text-anchor", "middle"), p.setAttribute("dominant-baseline", "middle"), p.setAttribute("font-size", "15"), p.setAttribute("font-weight", "600"), p.setAttribute("font-family", "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"), l.appendChild(p), this.nodeGroup.appendChild(l);
    const b = { g: l, rect: _, text: p };
    return this.updateNode(b, s), b;
  }
  updateNode(t, s) {
    const l = !!s.highlight;
    t.g.setAttribute("transform", `translate(${s.x},${s.y})`), t.g.style.opacity = s.visible ? String(s.opacity) : "0", t.g.style.display = s.visible ? "block" : "none", t.rect.setAttribute("fill", l ? s.highlight : this.palette.node), t.rect.setAttribute("stroke", l ? "#047857" : "#94a3b8"), t.rect.setAttribute("stroke-width", l ? "2" : "1"), t.text.textContent = s.label ?? "", t.text.setAttribute("fill", this.palette.nodeText);
  }
  // ============ Edges ============
  createEdge(t, s, l, d) {
    const v = document.createElementNS(he, "g");
    v.setAttribute("data-id", t.id);
    const _ = document.createElementNS(he, "path");
    _.setAttribute("fill", "none"), _.setAttribute("stroke", this.palette.history), _.setAttribute("stroke-width", "2.25"), _.setAttribute("stroke-linecap", "round"), _.setAttribute("pathLength", "100"), _.setAttribute("marker-end", "url(#arrow)"), v.appendChild(_);
    let p = null;
    t.label && (p = document.createElementNS(he, "text"), p.setAttribute("text-anchor", "middle"), p.setAttribute("font-size", "13"), p.setAttribute("font-weight", "700"), p.setAttribute("font-family", "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"), v.appendChild(p)), this.edgeGroup.appendChild(v);
    const b = { g: v, path: _, label: p };
    return this.updateEdge(b, t, s, l, d), b.path.style.transition = "opacity 300ms ease", this.enterEdge(b), b;
  }
  /** Fade-in for newly entering edges (4A.5 upgraded from an abrupt pop). */
  enterEdge(t) {
    if (this.destroyed) return;
    const s = t.path.style.opacity || "1";
    t.path.style.opacity = "0", requestAnimationFrame(() => {
      this.destroyed || (t.path.style.opacity = s);
    });
  }
  updateEdge(t, s, l, d, v) {
    const _ = d.x - l.x, p = d.y - l.y, b = Math.hypot(_, p) || 1, k = _ / b, w = p / b, F = -w, W = k, I = this.edgeLanes && this.edgeLanes[s.id] !== void 0 ? this.edgeLanes[s.id] : 0, ie = 6, me = 66, Z = 23, ee = br(k, w, me, Z), j = br(-k, -w, me, Z);
    let ye = ee + ie, te = j + ie;
    if (ye + te > b - 4) {
      const ae = Math.max(0, Math.min(ie, (b - ee - j) / 2 - 2));
      ye = ee + ae, te = j + ae;
    }
    const V = l.x + k * ye + F * I, X = l.y + w * ye + W * I, oe = d.x - k * te + F * I, ge = d.y - w * te + W * I, Q = (V + oe) / 2 + F * I * 0.7, ue = (X + ge) / 2 + W * I * 0.7, le = `M ${V.toFixed(1)} ${X.toFixed(1)} Q ${Q.toFixed(1)} ${ue.toFixed(1)} ${oe.toFixed(1)} ${ge.toFixed(1)}`;
    if (t.path.setAttribute("d", le), t.path.setAttribute("stroke", v ? this.palette.active : this.palette.history), t.path.setAttribute("stroke-width", v ? "3" : "2.25"), t.path.style.opacity = v ? "1" : "0.65", t.path.setAttribute("marker-end", "url(#arrow)"), t.label && s.label) {
      const ae = (V + oe) / 2 + F * I * 1.2, se = (X + ge) / 2 + W * I * 1.2 - 14;
      t.label.setAttribute("x", ae.toFixed(1)), t.label.setAttribute("y", se.toFixed(1)), t.label.textContent = s.label, t.label.setAttribute("fill", v ? this.palette.activeLabel : this.palette.historyLabel);
    }
  }
  // 4A.5（简化）：new edge 直接完整显示，不做 stroke-dashoffset 生长（避免 marker 消失/不继承）
  // 4A.5：missing edge leave（opacity 淡出后删除）
  leaveEdge(t) {
    t.g.style.transition = `opacity ${mr}ms ease`, t.g.style.opacity = "0", this.leavingEls.add(t.g), this.scheduleAfter(mr + 40, () => {
      t.g.remove(), this.leavingEls.delete(t.g);
    });
  }
  // 4A.6a：动画插值期间更新已有元素（不创建/删除，不处理 opacity）
  updateNodePosition(t, s, l, d) {
    if (this.destroyed) return;
    const v = this.nodes.get(t);
    v && (v.g.setAttribute("transform", `translate(${s},${l})`), d !== void 0 && (v.g.style.opacity = String(d), v.g.style.display = d > 1e-3 ? "block" : "none"));
  }
  updateEdgeGeometry(t, s) {
    if (this.destroyed) return;
    const l = this.edges.get(t);
    l && l.path.setAttribute("d", s.path);
  }
  createGhost(t) {
    if (this.destroyed) return;
    const s = this.nodes.get(t);
    if (!s) return;
    const l = s.g.cloneNode(!0);
    l.style.opacity = "0.3", this.ghostGroup.appendChild(l), this.ghostPool.add(t, l);
  }
  abortTransitions() {
    if (!this.destroyed) {
      this.ghostPool.clearAll();
      for (const t of this.transientTimers) clearTimeout(t);
      this.transientTimers.clear();
      for (const t of this.leavingEls) t.remove();
      this.leavingEls.clear();
      for (const [, t] of this.edges)
        t.path.removeAttribute("stroke-dasharray"), t.path.removeAttribute("stroke-dashoffset"), t.path.style.transition = "", t.path.setAttribute("marker-end", "url(#arrow)");
    }
  }
  destroy() {
    this.destroyed || (this.destroyed = !0, this.ghostPool.clearAll(), this.nodes.clear(), this.edges.clear(), this.prevEdgeIds.clear(), this.svg.remove());
  }
}
function br(m, t, s, l) {
  const d = Math.abs(m) > 1e-6 ? s / Math.abs(m) : Number.POSITIVE_INFINITY, v = Math.abs(t) > 1e-6 ? l / Math.abs(t) : Number.POSITIVE_INFINITY;
  return Math.min(d, v);
}
class Zn {
  constructor() {
    C(this, "edgeUpdates", /* @__PURE__ */ new Set());
    C(this, "nodeUpdates", /* @__PURE__ */ new Set());
  }
  reset() {
    this.edgeUpdates.clear(), this.nodeUpdates.clear();
  }
}
function an() {
  return xe({
    nodes: {
      A: { x: 50, y: 100, opacity: 1, visible: !0 },
      B: { x: 150, y: 100, opacity: 1, visible: !0 },
      C: { x: 250, y: 100, opacity: 1, visible: !0 }
    },
    edges: {
      e1: { id: "e1", source: "A", target: "B" },
      e2: { id: "e2", source: "B", target: "C" }
    }
  }, [{
    nodes: {
      D: { x: 350, y: 100, opacity: 1, visible: !0 }
    },
    edges: {
      e3: { id: "e3", source: "C", target: "D" }
    }
  }, {
    nodes: {
      B: { x: 150, y: 100, opacity: 0, visible: !1 },
      A: { x: 50, y: 100, opacity: 1, visible: !0 },
      C: { x: 150, y: 100, opacity: 1, visible: !0 },
      D: { x: 250, y: 100, opacity: 1, visible: !0 }
    },
    edges: {
      e1: { id: "e1", source: "A", target: "C" }
      // e2 removed by omission in next compile? simplified
    }
  }, {}]);
}
const ei = an(), sn = {
  nodes: {
    root: { x: 300, y: 60, opacity: 1, visible: !0, label: "root" }
  },
  edges: {}
}, on = {
  nodes: {
    left: { x: 180, y: 160, opacity: 1, visible: !0, label: "left" },
    right: { x: 420, y: 160, opacity: 1, visible: !0, label: "right" }
  },
  edges: {
    e_root_l: { id: "e_root_l", source: "root", target: "left", style: "curved" },
    e_root_r: { id: "e_root_r", source: "root", target: "right", style: "curved" }
  }
}, un = {
  nodes: {
    ll: { x: 100, y: 260, opacity: 1, visible: !0, label: "ll" },
    lr: { x: 260, y: 260, opacity: 1, visible: !0, label: "lr" }
  },
  edges: {
    e_left_ll: { id: "e_left_ll", source: "left", target: "ll", style: "curved" },
    e_left_lr: { id: "e_left_lr", source: "left", target: "lr", style: "curved" }
  }
}, ln = {
  nodes: {
    left: { x: 180, y: 160, opacity: 0, visible: !1 },
    ll: { x: 130, y: 160, opacity: 1, visible: !0 },
    lr: { x: 290, y: 160, opacity: 1, visible: !0 },
    right: { x: 470, y: 160, opacity: 1, visible: !0 }
  },
  edges: {
    e_root_l: { id: "e_root_l", source: "root", target: "ll", style: "curved" },
    e_root_ll: { id: "e_root_ll", source: "root", target: "lr", style: "curved" },
    e_root_r: { id: "e_root_r", source: "root", target: "right", style: "curved" }
  }
}, ti = xe(sn, [on, un, ln]), cn = {
  nodes: {
    a: { x: 200, y: 100, opacity: 1, visible: !0, label: "A" },
    b: { x: 400, y: 100, opacity: 1, visible: !0, label: "B" },
    c: { x: 300, y: 200, opacity: 1, visible: !0, label: "C" },
    d: { x: 100, y: 200, opacity: 1, visible: !0, label: "D" }
  },
  edges: {}
}, fn = {
  edges: {
    e_ab: { id: "e_ab", source: "a", target: "b" }
  }
}, dn = {
  edges: {
    e_bc: { id: "e_bc", source: "b", target: "c" }
  }
}, hn = {
  edges: {
    e_ca: { id: "e_ca", source: "c", target: "a" }
  }
}, pn = {
  edges: {
    e_ad: { id: "e_ad", source: "a", target: "d" }
  }
}, ri = xe(cn, [fn, dn, hn, pn]), vn = {
  nodes: {
    client: { x: 150, y: 150, opacity: 1, visible: !0, label: "客户端" },
    server: { x: 650, y: 150, opacity: 1, visible: !0, label: "服务器" }
  },
  edges: {}
}, yn = {
  edges: {
    syn: { id: "syn", source: "client", target: "server", label: "SYN" }
  }
}, gn = {
  edges: {
    synack: { id: "synack", source: "server", target: "client", label: "SYN+ACK" }
  }
}, mn = {
  edges: {
    ack: { id: "ack", source: "client", target: "server", label: "ACK" }
  }
}, bn = {
  nodes: {
    client: { x: 150, y: 150, opacity: 1, visible: !0, label: "客户端", highlight: "#16a34a" },
    server: { x: 650, y: 150, opacity: 1, visible: !0, label: "服务器", highlight: "#16a34a" }
  }
}, ni = xe(vn, [yn, gn, mn, bn]), _n = {
  nodes: {
    idle: { x: 100, y: 100, opacity: 1, visible: !0, highlight: "#16a34a", label: "Idle" },
    // green for current state
    processing: { x: 300, y: 100, opacity: 1, visible: !0, highlight: void 0, label: "Processing" },
    done: { x: 500, y: 100, opacity: 1, visible: !0, highlight: void 0, label: "Done" }
  },
  edges: {}
}, En = {
  nodes: {
    idle: { highlight: void 0 },
    processing: { highlight: "#16a34a" }
  }
}, Sn = {
  nodes: {
    processing: { highlight: void 0 },
    done: { highlight: "#16a34a" }
  }
}, wn = {
  nodes: {
    done: { highlight: void 0 },
    idle: { highlight: "#16a34a" }
  }
}, ii = xe(_n, [En, Sn, wn]), Rn = {
  nodes: {
    // Queues with distinct highlights and labels
    qs_callStack: { x: 260, y: 120, opacity: 1, visible: !0, highlight: "#3b82f6", label: "调用栈" },
    // blue
    qs_microtaskQueue: { x: 260, y: 300, opacity: 1, visible: !0, highlight: "#f59e0b", label: "微任务队列" },
    // amber
    qs_taskQueue: { x: 260, y: 450, opacity: 1, visible: !0, highlight: "#10b981", label: "宏任务队列" },
    // green
    // Items (initially not visible), each aligned with its queue row
    n_main: { x: 700, y: 120, opacity: 1, visible: !1, label: "main()" },
    n_promise: { x: 700, y: 300, opacity: 1, visible: !1, label: "Promise 回调" },
    n_timeout: { x: 700, y: 450, opacity: 1, visible: !1, label: "setTimeout 回调" }
  },
  edges: {}
}, Cn = {
  nodes: {
    n_main: { x: 700, y: 120, opacity: 1, visible: !0 }
  },
  edges: {
    e_callStack_main: { id: "e_callStack_main", source: "qs_callStack", target: "n_main", label: "", style: "straight" }
  }
}, kn = {
  nodes: {
    n_timeout: { x: 700, y: 450, opacity: 1, visible: !0 },
    n_promise: { x: 700, y: 300, opacity: 1, visible: !0 }
  },
  edges: {
    e_callStack_main: { id: "e_callStack_main", source: "qs_callStack", target: "n_main", label: "", style: "straight" },
    e_taskQueue_timeout: { id: "e_taskQueue_timeout", source: "qs_taskQueue", target: "n_timeout", label: "", style: "straight" },
    e_microtaskQueue_promise: { id: "e_microtaskQueue_promise", source: "qs_microtaskQueue", target: "n_promise", label: "", style: "straight" }
  }
}, xn = {
  nodes: {
    n_main: { x: 700, y: 120, opacity: 1, visible: !1 }
  },
  edges: {
    e_taskQueue_timeout: { id: "e_taskQueue_timeout", source: "qs_taskQueue", target: "n_timeout", label: "", style: "straight" },
    e_microtaskQueue_promise: { id: "e_microtaskQueue_promise", source: "qs_microtaskQueue", target: "n_promise", label: "", style: "straight" }
    // e_callStack_main removed
  }
}, Tn = {
  edges: {
    e_taskQueue_timeout: { id: "e_taskQueue_timeout", source: "qs_taskQueue", target: "n_timeout", label: "", style: "straight" },
    e_callStack_promise: { id: "e_callStack_promise", source: "qs_callStack", target: "n_promise", label: "", style: "straight" }
    // e_microtaskQueue_promise removed
  }
}, An = {
  nodes: {
    n_promise: { x: 700, y: 300, opacity: 1, visible: !1 }
  },
  edges: {
    e_taskQueue_timeout: { id: "e_taskQueue_timeout", source: "qs_taskQueue", target: "n_timeout", label: "", style: "straight" }
    // e_callStack_promise removed
  }
}, On = {
  edges: {
    e_callStack_timeout: { id: "e_callStack_timeout", source: "qs_callStack", target: "n_timeout", label: "", style: "straight" }
    // e_taskQueue_timeout removed
  }
}, Pn = {
  nodes: {
    n_timeout: { x: 700, y: 450, opacity: 1, visible: !1 }
  },
  edges: {
    // e_callStack_timeout removed
  }
}, ai = xe(Rn, [Cn, kn, xn, Tn, An, On, Pn]), In = {
  nodes: {
    // Header node (anchor for the key edges)
    n_header: { x: 490, y: 50, opacity: 1, visible: !0, highlight: void 0, label: "LRU 缓存" },
    // Cache entry slots (initially empty), most recent → least recent
    n_left: { x: 330, y: 150, opacity: 1, visible: !1, highlight: void 0, label: "槽位 1" },
    n_middle: { x: 490, y: 150, opacity: 1, visible: !1, highlight: void 0, label: "槽位 2" },
    n_right: { x: 650, y: 150, opacity: 1, visible: !1, highlight: void 0, label: "槽位 3" }
  },
  edges: {
    // Edges from header to each cache entry node (label shows the key)
    e_left: { id: "e_left", source: "n_header", target: "n_left", label: "", style: "straight" },
    e_middle: { id: "e_middle", source: "n_header", target: "n_middle", label: "", style: "straight" },
    e_right: { id: "e_right", source: "n_header", target: "n_right", label: "", style: "straight" }
  }
}, $n = {
  nodes: {
    n_left: { x: 330, y: 150, opacity: 1, visible: !0, highlight: "#fbbf24" }
    // yellow
  },
  edges: {
    e_left: { id: "e_left", source: "n_header", target: "n_left", label: "A", style: "straight" }
  }
}, jn = {
  nodes: {
    n_left: { x: 330, y: 150, opacity: 1, visible: !0, highlight: "#fbbf24" },
    n_middle: { x: 490, y: 150, opacity: 1, visible: !0, highlight: void 0 }
  },
  edges: {
    e_left: { id: "e_left", source: "n_header", target: "n_left", label: "B", style: "straight" },
    e_middle: { id: "e_middle", source: "n_header", target: "n_middle", label: "A", style: "straight" }
  }
}, Dn = {
  nodes: {
    n_left: { x: 330, y: 150, opacity: 1, visible: !0, highlight: "#fbbf24" },
    n_middle: { x: 490, y: 150, opacity: 1, visible: !0, highlight: void 0 },
    n_right: { x: 650, y: 150, opacity: 1, visible: !0, highlight: void 0 }
  },
  edges: {
    e_left: { id: "e_left", source: "n_header", target: "n_left", label: "C", style: "straight" },
    e_middle: { id: "e_middle", source: "n_header", target: "n_middle", label: "B", style: "straight" },
    e_right: { id: "e_right", source: "n_header", target: "n_right", label: "A", style: "straight" }
  }
}, Mn = {
  nodes: {
    n_left: { x: 330, y: 150, opacity: 1, visible: !0, highlight: "#fbbf24" },
    n_middle: { x: 490, y: 150, opacity: 1, visible: !0, highlight: void 0 },
    n_right: { x: 650, y: 150, opacity: 1, visible: !0, highlight: void 0 }
  },
  edges: {
    e_left: { id: "e_left", source: "n_header", target: "n_left", label: "B", style: "straight" },
    e_middle: { id: "e_middle", source: "n_header", target: "n_middle", label: "C", style: "straight" },
    e_right: { id: "e_right", source: "n_header", target: "n_right", label: "A", style: "straight" }
  }
}, Fn = {
  nodes: {
    n_left: { x: 330, y: 150, opacity: 1, visible: !0, highlight: "#fbbf24" },
    n_middle: { x: 490, y: 150, opacity: 1, visible: !0, highlight: void 0 },
    n_right: { x: 650, y: 150, opacity: 1, visible: !0, highlight: void 0 }
  },
  edges: {
    e_left: { id: "e_left", source: "n_header", target: "n_left", label: "D", style: "straight" },
    e_middle: { id: "e_middle", source: "n_header", target: "n_middle", label: "B", style: "straight" },
    e_right: { id: "e_right", source: "n_header", target: "n_right", label: "C", style: "straight" }
  }
}, si = xe(In, [$n, jn, Dn, Mn, Fn]), Ln = {
  nodes: {
    n_process: { x: 200, y: 150, opacity: 1, visible: !0, highlight: void 0, label: "进程" },
    n_thread1: { x: 100, y: 100, opacity: 1, visible: !0, highlight: "#16a34a", label: "线程 1" },
    // green, running
    n_thread2: { x: 300, y: 200, opacity: 1, visible: !0, highlight: void 0, label: "线程 2" }
  },
  edges: {
    e_process_thread1: { id: "e_process_thread1", source: "n_process", target: "n_thread1", label: "", style: "straight" },
    e_process_thread2: { id: "e_process_thread2", source: "n_process", target: "n_thread2", label: "", style: "straight" }
  }
}, Nn = {
  nodes: {
    n_thread1: { x: 100, y: 200, opacity: 1, visible: !0, highlight: void 0 },
    n_thread2: { x: 300, y: 100, opacity: 1, visible: !0, highlight: "#16a34a" }
  }
}, Vn = {
  nodes: {
    n_thread1: { x: 100, y: 100, opacity: 1, visible: !0, highlight: "#16a34a" },
    n_thread2: { x: 300, y: 200, opacity: 1, visible: !0, highlight: void 0 }
  }
}, oi = xe(Ln, [Nn, Vn]), Un = {
  nodes: {
    // Header node (anchor for labels)
    n_header: { x: 400, y: 50, opacity: 1, visible: !0, label: "内存布局" },
    // Memory regions (initially visible, no highlight)
    n_stack: { x: 300, y: 150, opacity: 1, visible: !0, label: "栈" },
    n_heap: { x: 400, y: 250, opacity: 1, visible: !0, label: "堆" },
    n_data: { x: 500, y: 150, opacity: 1, visible: !0, label: "数据段" },
    n_code: { x: 400, y: 350, opacity: 1, visible: !0, label: "代码段" }
  },
  edges: {
    // Edges from header to each region (label shows region name)
    e_stack: { id: "e_stack", source: "n_header", target: "n_stack", label: "Stack", style: "straight" },
    e_heap: { id: "e_heap", source: "n_header", target: "n_heap", label: "Heap", style: "straight" },
    e_data: { id: "e_data", source: "n_header", target: "n_data", label: "Data", style: "straight" },
    e_code: { id: "e_code", source: "n_header", target: "n_code", label: "Code", style: "straight" }
  }
}, Wn = {
  nodes: {
    n_heap: { x: 400, y: 250, opacity: 1, visible: !0, highlight: "#10b981" }
    // green
  }
}, Yn = {
  nodes: {
    n_heap: { x: 400, y: 250, opacity: 1, visible: !0, highlight: void 0 },
    n_stack: { x: 300, y: 150, opacity: 1, visible: !0, highlight: "#f59e0b" }
    // amber
  }
}, Bn = {
  nodes: {
    n_stack: { x: 300, y: 150, opacity: 1, visible: !0, highlight: void 0 }
  }
}, qn = {
  nodes: {
    n_data: { x: 500, y: 150, opacity: 1, visible: !0, highlight: "#ef4444" }
    // red
  }
}, ui = xe(Un, [Wn, Yn, Bn, qn]), _r = 0.4;
let Re = null;
class li {
  constructor(t, s, l = {}) {
    C(this, "controller");
    C(this, "host");
    C(this, "autoplay");
    C(this, "autoplayDelay");
    C(this, "onModeChange");
    C(this, "onStepChange");
    C(this, "mode", "idle");
    C(this, "autoTimer", null);
    C(this, "observer", null);
    C(this, "inView", !1);
    C(this, "started", !1);
    C(this, "destroyed", !1);
    C(this, "handleIntersect", (t) => {
      if (this.destroyed) return;
      const s = t[t.length - 1];
      this.inView = s.isIntersecting, this.inView ? this.mode === "idle" ? this.enterAuto() : this.mode === "offview" && this.resumeFromOffview() : this.mode === "auto" && (this.stopAutoTimer(), this.controller.pause(), this.setMode("offview"));
    });
    /** Click-to-focus: enter interactive mode, freeze any in-flight frame. */
    C(this, "handleClick", () => {
      this.destroyed || this.enterInteractive();
    });
    C(this, "handleFocus", () => {
      this.destroyed || (this.mode === "idle" || this.mode === "paused" || this.mode === "finished") && this.enterInteractive();
    });
    C(this, "handleBlur", () => {
      this.destroyed || this.mode === "interactive" && this.setMode("paused");
    });
    C(this, "handleKeyDown", (t) => {
      if (this.destroyed || Re !== this || this.mode !== "interactive" && this.mode !== "paused") return;
      const s = t.key;
      s === "n" || s === "N" || s === "ArrowRight" ? (t.preventDefault(), t.stopPropagation(), this.next()) : (s === "p" || s === "P" || s === "ArrowLeft") && (t.preventDefault(), t.stopPropagation(), this.prev());
    });
    this.controller = t, this.host = s, this.autoplay = l.autoplay ?? !0, this.autoplayDelay = l.autoplayDelay ?? 1400, this.onModeChange = l.onModeChange, this.onStepChange = l.onStepChange, this.autoplay && typeof window < "u" && typeof window.matchMedia == "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches && (this.autoplay = !1);
  }
  /** Current mode of the interaction state machine. */
  getMode() {
    return this.mode;
  }
  setMode(t) {
    var s;
    this.destroyed || this.mode === t || (this.mode = t, (s = this.onModeChange) == null || s.call(this, t));
  }
  /**
   * Arm the session: attach host listeners and (when autoplay is enabled)
   * begin viewport tracking. Idempotent. When the host is already
   * substantially in view at boot, AUTO starts immediately (synchronous
   * fast path) instead of waiting for the observer's async first report.
   * Without IntersectionObserver support the figure is treated as always
   * in view.
   */
  start() {
    if (!(this.destroyed || this.started) && (this.started = !0, this.host.addEventListener("click", this.handleClick), window.addEventListener("keydown", this.handleKeyDown, !0), this.host.addEventListener("focus", this.handleFocus), this.host.addEventListener("blur", this.handleBlur), this.autoplay)) {
      const t = typeof IntersectionObserver < "u" ? IntersectionObserver : void 0;
      t ? (this.observer = new t((s) => this.handleIntersect(s), {
        threshold: _r
      }), this.observer.observe(this.host), this.isInViewNow() && (this.inView = !0, this.enterAuto())) : (this.inView = !0, this.enterAuto());
    }
  }
  /**
   * Synchronous in-view check loosely mirroring the IO threshold. Returns
   * false when the host is not laid out (zero size, e.g. jsdom) so tests and
   * pre-layout boots fall back to the observer-driven path.
   */
  isInViewNow() {
    if (typeof window > "u" || typeof this.host.getBoundingClientRect != "function")
      return !1;
    const t = this.host.getBoundingClientRect();
    return t.height <= 0 || t.width <= 0 || t.bottom <= 0 || t.top >= window.innerHeight ? !1 : Math.min(t.bottom, window.innerHeight) - Math.max(t.top, 0) >= t.height * _r;
  }
  resumeFromOffview() {
    this.controller.play(), this.enterAuto();
  }
  enterAuto() {
    this.destroyed || (Re === this && (Re = null), this.setMode("auto"), this.scheduleAdvance());
  }
  scheduleAdvance() {
    this.stopAutoTimer(), this.autoTimer = setTimeout(() => this.advanceAuto(), this.autoplayDelay);
  }
  stopAutoTimer() {
    this.autoTimer !== null && (clearTimeout(this.autoTimer), this.autoTimer = null);
  }
  advanceAuto() {
    var s;
    if (this.destroyed || this.mode !== "auto") return;
    if (this.controller.getCurrentStep() >= this.controller.totalSteps - 1) {
      this.setMode("finished");
      return;
    }
    this.controller.next(), (s = this.onStepChange) == null || s.call(this, this.controller.getCurrentStep()), this.scheduleAdvance();
  }
  /**
   * Enter interactive mode: stop the auto loop, freeze any in-flight tween at
   * its current frame (`PlaybackController.pause()` — the current picture
   * stays on screen), and focus the host so figure keyboard is ready.
   */
  enterInteractive() {
    this.stopAutoTimer(), Re && Re !== this && Re.mode === "interactive" && Re.setMode("paused"), Re = this, this.setMode("interactive"), this.host.focus();
  }
  /**
   * Manual navigation (N / ArrowRight). seek() starts from the live visual
   * frame (applyVisual updates it per tick), so an in-flight tween is
   * interrupted continuously — no snap, no redundant pause.
   */
  next() {
    var t;
    this.destroyed || (this.stopAutoTimer(), this.controller.getCurrentStep() < this.controller.totalSteps - 1 && (this.controller.next(), (t = this.onStepChange) == null || t.call(this, this.controller.getCurrentStep())), this.setMode("interactive"));
  }
  /** Manual navigation (P / ArrowLeft). See {@link next}. */
  prev() {
    var t;
    this.destroyed || (this.stopAutoTimer(), this.controller.getCurrentStep() > 0 && (this.controller.prev(), (t = this.onStepChange) == null || t.call(this, this.controller.getCurrentStep())), this.setMode("interactive"));
  }
  /** Explicit play (host-driven resume of the auto loop from the current step). */
  resumeAuto() {
    this.destroyed || !this.autoplay || this.enterAuto();
  }
  /** Tear down session resources. The host owns the PlaybackController. */
  destroy() {
    var t;
    this.destroyed || (this.destroyed = !0, Re === this && (Re = null), this.stopAutoTimer(), (t = this.observer) == null || t.disconnect(), this.observer = null, this.host.removeEventListener("click", this.handleClick), window.removeEventListener("keydown", this.handleKeyDown, !0), this.host.removeEventListener("focus", this.handleFocus), this.host.removeEventListener("blur", this.handleBlur));
  }
}
var Gt = { exports: {} }, nt = {}, zt = { exports: {} }, T = {};
/**
 * @license React
 * react.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var Er;
function Gn() {
  if (Er) return T;
  Er = 1;
  var m = Symbol.for("react.element"), t = Symbol.for("react.portal"), s = Symbol.for("react.fragment"), l = Symbol.for("react.strict_mode"), d = Symbol.for("react.profiler"), v = Symbol.for("react.provider"), _ = Symbol.for("react.context"), p = Symbol.for("react.forward_ref"), b = Symbol.for("react.suspense"), k = Symbol.for("react.memo"), w = Symbol.for("react.lazy"), F = Symbol.iterator;
  function W(i) {
    return i === null || typeof i != "object" ? null : (i = F && i[F] || i["@@iterator"], typeof i == "function" ? i : null);
  }
  var I = { isMounted: function() {
    return !1;
  }, enqueueForceUpdate: function() {
  }, enqueueReplaceState: function() {
  }, enqueueSetState: function() {
  } }, ie = Object.assign, me = {};
  function Z(i, c, A) {
    this.props = i, this.context = c, this.refs = me, this.updater = A || I;
  }
  Z.prototype.isReactComponent = {}, Z.prototype.setState = function(i, c) {
    if (typeof i != "object" && typeof i != "function" && i != null) throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");
    this.updater.enqueueSetState(this, i, c, "setState");
  }, Z.prototype.forceUpdate = function(i) {
    this.updater.enqueueForceUpdate(this, i, "forceUpdate");
  };
  function ee() {
  }
  ee.prototype = Z.prototype;
  function j(i, c, A) {
    this.props = i, this.context = c, this.refs = me, this.updater = A || I;
  }
  var ye = j.prototype = new ee();
  ye.constructor = j, ie(ye, Z.prototype), ye.isPureReactComponent = !0;
  var te = Array.isArray, V = Object.prototype.hasOwnProperty, X = { current: null }, oe = { key: !0, ref: !0, __self: !0, __source: !0 };
  function ge(i, c, A) {
    var P, D = {}, q = null, Y = null;
    if (c != null) for (P in c.ref !== void 0 && (Y = c.ref), c.key !== void 0 && (q = "" + c.key), c) V.call(c, P) && !oe.hasOwnProperty(P) && (D[P] = c[P]);
    var U = arguments.length - 2;
    if (U === 1) D.children = A;
    else if (1 < U) {
      for (var L = Array(U), re = 0; re < U; re++) L[re] = arguments[re + 2];
      D.children = L;
    }
    if (i && i.defaultProps) for (P in U = i.defaultProps, U) D[P] === void 0 && (D[P] = U[P]);
    return { $$typeof: m, type: i, key: q, ref: Y, props: D, _owner: X.current };
  }
  function Q(i, c) {
    return { $$typeof: m, type: i.type, key: c, ref: i.ref, props: i.props, _owner: i._owner };
  }
  function ue(i) {
    return typeof i == "object" && i !== null && i.$$typeof === m;
  }
  function le(i) {
    var c = { "=": "=0", ":": "=2" };
    return "$" + i.replace(/[=:]/g, function(A) {
      return c[A];
    });
  }
  var ae = /\/+/g;
  function se(i, c) {
    return typeof i == "object" && i !== null && i.key != null ? le("" + i.key) : c.toString(36);
  }
  function be(i, c, A, P, D) {
    var q = typeof i;
    (q === "undefined" || q === "boolean") && (i = null);
    var Y = !1;
    if (i === null) Y = !0;
    else switch (q) {
      case "string":
      case "number":
        Y = !0;
        break;
      case "object":
        switch (i.$$typeof) {
          case m:
          case t:
            Y = !0;
        }
    }
    if (Y) return Y = i, D = D(Y), i = P === "" ? "." + se(Y, 0) : P, te(D) ? (A = "", i != null && (A = i.replace(ae, "$&/") + "/"), be(D, c, A, "", function(re) {
      return re;
    })) : D != null && (ue(D) && (D = Q(D, A + (!D.key || Y && Y.key === D.key ? "" : ("" + D.key).replace(ae, "$&/") + "/") + i)), c.push(D)), 1;
    if (Y = 0, P = P === "" ? "." : P + ":", te(i)) for (var U = 0; U < i.length; U++) {
      q = i[U];
      var L = P + se(q, U);
      Y += be(q, c, A, L, D);
    }
    else if (L = W(i), typeof L == "function") for (i = L.call(i), U = 0; !(q = i.next()).done; ) q = q.value, L = P + se(q, U++), Y += be(q, c, A, L, D);
    else if (q === "object") throw c = String(i), Error("Objects are not valid as a React child (found: " + (c === "[object Object]" ? "object with keys {" + Object.keys(i).join(", ") + "}" : c) + "). If you meant to render a collection of children, use an array instead.");
    return Y;
  }
  function ce(i, c, A) {
    if (i == null) return i;
    var P = [], D = 0;
    return be(i, P, "", "", function(q) {
      return c.call(A, q, D++);
    }), P;
  }
  function Ee(i) {
    if (i._status === -1) {
      var c = i._result;
      c = c(), c.then(function(A) {
        (i._status === 0 || i._status === -1) && (i._status = 1, i._result = A);
      }, function(A) {
        (i._status === 0 || i._status === -1) && (i._status = 2, i._result = A);
      }), i._status === -1 && (i._status = 0, i._result = c);
    }
    if (i._status === 1) return i._result.default;
    throw i._result;
  }
  var E = { current: null }, Se = { transition: null }, Ie = { ReactCurrentDispatcher: E, ReactCurrentBatchConfig: Se, ReactCurrentOwner: X };
  function Ce() {
    throw Error("act(...) is not supported in production builds of React.");
  }
  return T.Children = { map: ce, forEach: function(i, c, A) {
    ce(i, function() {
      c.apply(this, arguments);
    }, A);
  }, count: function(i) {
    var c = 0;
    return ce(i, function() {
      c++;
    }), c;
  }, toArray: function(i) {
    return ce(i, function(c) {
      return c;
    }) || [];
  }, only: function(i) {
    if (!ue(i)) throw Error("React.Children.only expected to receive a single React element child.");
    return i;
  } }, T.Component = Z, T.Fragment = s, T.Profiler = d, T.PureComponent = j, T.StrictMode = l, T.Suspense = b, T.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = Ie, T.act = Ce, T.cloneElement = function(i, c, A) {
    if (i == null) throw Error("React.cloneElement(...): The argument must be a React element, but you passed " + i + ".");
    var P = ie({}, i.props), D = i.key, q = i.ref, Y = i._owner;
    if (c != null) {
      if (c.ref !== void 0 && (q = c.ref, Y = X.current), c.key !== void 0 && (D = "" + c.key), i.type && i.type.defaultProps) var U = i.type.defaultProps;
      for (L in c) V.call(c, L) && !oe.hasOwnProperty(L) && (P[L] = c[L] === void 0 && U !== void 0 ? U[L] : c[L]);
    }
    var L = arguments.length - 2;
    if (L === 1) P.children = A;
    else if (1 < L) {
      U = Array(L);
      for (var re = 0; re < L; re++) U[re] = arguments[re + 2];
      P.children = U;
    }
    return { $$typeof: m, type: i.type, key: D, ref: q, props: P, _owner: Y };
  }, T.createContext = function(i) {
    return i = { $$typeof: _, _currentValue: i, _currentValue2: i, _threadCount: 0, Provider: null, Consumer: null, _defaultValue: null, _globalName: null }, i.Provider = { $$typeof: v, _context: i }, i.Consumer = i;
  }, T.createElement = ge, T.createFactory = function(i) {
    var c = ge.bind(null, i);
    return c.type = i, c;
  }, T.createRef = function() {
    return { current: null };
  }, T.forwardRef = function(i) {
    return { $$typeof: p, render: i };
  }, T.isValidElement = ue, T.lazy = function(i) {
    return { $$typeof: w, _payload: { _status: -1, _result: i }, _init: Ee };
  }, T.memo = function(i, c) {
    return { $$typeof: k, type: i, compare: c === void 0 ? null : c };
  }, T.startTransition = function(i) {
    var c = Se.transition;
    Se.transition = {};
    try {
      i();
    } finally {
      Se.transition = c;
    }
  }, T.unstable_act = Ce, T.useCallback = function(i, c) {
    return E.current.useCallback(i, c);
  }, T.useContext = function(i) {
    return E.current.useContext(i);
  }, T.useDebugValue = function() {
  }, T.useDeferredValue = function(i) {
    return E.current.useDeferredValue(i);
  }, T.useEffect = function(i, c) {
    return E.current.useEffect(i, c);
  }, T.useId = function() {
    return E.current.useId();
  }, T.useImperativeHandle = function(i, c, A) {
    return E.current.useImperativeHandle(i, c, A);
  }, T.useInsertionEffect = function(i, c) {
    return E.current.useInsertionEffect(i, c);
  }, T.useLayoutEffect = function(i, c) {
    return E.current.useLayoutEffect(i, c);
  }, T.useMemo = function(i, c) {
    return E.current.useMemo(i, c);
  }, T.useReducer = function(i, c, A) {
    return E.current.useReducer(i, c, A);
  }, T.useRef = function(i) {
    return E.current.useRef(i);
  }, T.useState = function(i) {
    return E.current.useState(i);
  }, T.useSyncExternalStore = function(i, c, A) {
    return E.current.useSyncExternalStore(i, c, A);
  }, T.useTransition = function() {
    return E.current.useTransition();
  }, T.version = "18.3.1", T;
}
var at = { exports: {} };
/**
 * @license React
 * react.development.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
at.exports;
var Sr;
function zn() {
  return Sr || (Sr = 1, function(m, t) {
    process.env.NODE_ENV !== "production" && function() {
      typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u" && typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart == "function" && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart(new Error());
      var s = "18.3.1", l = Symbol.for("react.element"), d = Symbol.for("react.portal"), v = Symbol.for("react.fragment"), _ = Symbol.for("react.strict_mode"), p = Symbol.for("react.profiler"), b = Symbol.for("react.provider"), k = Symbol.for("react.context"), w = Symbol.for("react.forward_ref"), F = Symbol.for("react.suspense"), W = Symbol.for("react.suspense_list"), I = Symbol.for("react.memo"), ie = Symbol.for("react.lazy"), me = Symbol.for("react.offscreen"), Z = Symbol.iterator, ee = "@@iterator";
      function j(e) {
        if (e === null || typeof e != "object")
          return null;
        var r = Z && e[Z] || e[ee];
        return typeof r == "function" ? r : null;
      }
      var ye = {
        /**
         * @internal
         * @type {ReactComponent}
         */
        current: null
      }, te = {
        transition: null
      }, V = {
        current: null,
        // Used to reproduce behavior of `batchedUpdates` in legacy mode.
        isBatchingLegacy: !1,
        didScheduleLegacyUpdate: !1
      }, X = {
        /**
         * @internal
         * @type {ReactComponent}
         */
        current: null
      }, oe = {}, ge = null;
      function Q(e) {
        ge = e;
      }
      oe.setExtraStackFrame = function(e) {
        ge = e;
      }, oe.getCurrentStack = null, oe.getStackAddendum = function() {
        var e = "";
        ge && (e += ge);
        var r = oe.getCurrentStack;
        return r && (e += r() || ""), e;
      };
      var ue = !1, le = !1, ae = !1, se = !1, be = !1, ce = {
        ReactCurrentDispatcher: ye,
        ReactCurrentBatchConfig: te,
        ReactCurrentOwner: X
      };
      ce.ReactDebugCurrentFrame = oe, ce.ReactCurrentActQueue = V;
      function Ee(e) {
        {
          for (var r = arguments.length, a = new Array(r > 1 ? r - 1 : 0), o = 1; o < r; o++)
            a[o - 1] = arguments[o];
          Se("warn", e, a);
        }
      }
      function E(e) {
        {
          for (var r = arguments.length, a = new Array(r > 1 ? r - 1 : 0), o = 1; o < r; o++)
            a[o - 1] = arguments[o];
          Se("error", e, a);
        }
      }
      function Se(e, r, a) {
        {
          var o = ce.ReactDebugCurrentFrame, f = o.getStackAddendum();
          f !== "" && (r += "%s", a = a.concat([f]));
          var S = a.map(function(g) {
            return String(g);
          });
          S.unshift("Warning: " + r), Function.prototype.apply.call(console[e], console, S);
        }
      }
      var Ie = {};
      function Ce(e, r) {
        {
          var a = e.constructor, o = a && (a.displayName || a.name) || "ReactClass", f = o + "." + r;
          if (Ie[f])
            return;
          E("Can't call %s on a component that is not yet mounted. This is a no-op, but it might indicate a bug in your application. Instead, assign to `this.state` directly or define a `state = {};` class property with the desired state in the %s component.", r, o), Ie[f] = !0;
        }
      }
      var i = {
        /**
         * Checks whether or not this composite component is mounted.
         * @param {ReactClass} publicInstance The instance we want to test.
         * @return {boolean} True if mounted, false otherwise.
         * @protected
         * @final
         */
        isMounted: function(e) {
          return !1;
        },
        /**
         * Forces an update. This should only be invoked when it is known with
         * certainty that we are **not** in a DOM transaction.
         *
         * You may want to call this when you know that some deeper aspect of the
         * component's state has changed but `setState` was not called.
         *
         * This will not invoke `shouldComponentUpdate`, but it will invoke
         * `componentWillUpdate` and `componentDidUpdate`.
         *
         * @param {ReactClass} publicInstance The instance that should rerender.
         * @param {?function} callback Called after component is updated.
         * @param {?string} callerName name of the calling function in the public API.
         * @internal
         */
        enqueueForceUpdate: function(e, r, a) {
          Ce(e, "forceUpdate");
        },
        /**
         * Replaces all of the state. Always use this or `setState` to mutate state.
         * You should treat `this.state` as immutable.
         *
         * There is no guarantee that `this.state` will be immediately updated, so
         * accessing `this.state` after calling this method may return the old value.
         *
         * @param {ReactClass} publicInstance The instance that should rerender.
         * @param {object} completeState Next state.
         * @param {?function} callback Called after component is updated.
         * @param {?string} callerName name of the calling function in the public API.
         * @internal
         */
        enqueueReplaceState: function(e, r, a, o) {
          Ce(e, "replaceState");
        },
        /**
         * Sets a subset of the state. This only exists because _pendingState is
         * internal. This provides a merging strategy that is not available to deep
         * properties which is confusing. TODO: Expose pendingState or don't use it
         * during the merge.
         *
         * @param {ReactClass} publicInstance The instance that should rerender.
         * @param {object} partialState Next partial state to be merged with state.
         * @param {?function} callback Called after component is updated.
         * @param {?string} Name of the calling function in the public API.
         * @internal
         */
        enqueueSetState: function(e, r, a, o) {
          Ce(e, "setState");
        }
      }, c = Object.assign, A = {};
      Object.freeze(A);
      function P(e, r, a) {
        this.props = e, this.context = r, this.refs = A, this.updater = a || i;
      }
      P.prototype.isReactComponent = {}, P.prototype.setState = function(e, r) {
        if (typeof e != "object" && typeof e != "function" && e != null)
          throw new Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");
        this.updater.enqueueSetState(this, e, r, "setState");
      }, P.prototype.forceUpdate = function(e) {
        this.updater.enqueueForceUpdate(this, e, "forceUpdate");
      };
      {
        var D = {
          isMounted: ["isMounted", "Instead, make sure to clean up subscriptions and pending requests in componentWillUnmount to prevent memory leaks."],
          replaceState: ["replaceState", "Refactor your code to use setState instead (see https://github.com/facebook/react/issues/3236)."]
        }, q = function(e, r) {
          Object.defineProperty(P.prototype, e, {
            get: function() {
              Ee("%s(...) is deprecated in plain JavaScript React classes. %s", r[0], r[1]);
            }
          });
        };
        for (var Y in D)
          D.hasOwnProperty(Y) && q(Y, D[Y]);
      }
      function U() {
      }
      U.prototype = P.prototype;
      function L(e, r, a) {
        this.props = e, this.context = r, this.refs = A, this.updater = a || i;
      }
      var re = L.prototype = new U();
      re.constructor = L, c(re, P.prototype), re.isPureReactComponent = !0;
      function wt() {
        var e = {
          current: null
        };
        return Object.seal(e), e;
      }
      var st = Array.isArray;
      function Ne(e) {
        return st(e);
      }
      function Rt(e) {
        {
          var r = typeof Symbol == "function" && Symbol.toStringTag, a = r && e[Symbol.toStringTag] || e.constructor.name || "Object";
          return a;
        }
      }
      function Ve(e) {
        try {
          return Te(e), !1;
        } catch {
          return !0;
        }
      }
      function Te(e) {
        return "" + e;
      }
      function $e(e) {
        if (Ve(e))
          return E("The provided key is an unsupported type %s. This value must be coerced to a string before before using it here.", Rt(e)), Te(e);
      }
      function ot(e, r, a) {
        var o = e.displayName;
        if (o)
          return o;
        var f = r.displayName || r.name || "";
        return f !== "" ? a + "(" + f + ")" : a;
      }
      function je(e) {
        return e.displayName || "Context";
      }
      function we(e) {
        if (e == null)
          return null;
        if (typeof e.tag == "number" && E("Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."), typeof e == "function")
          return e.displayName || e.name || null;
        if (typeof e == "string")
          return e;
        switch (e) {
          case v:
            return "Fragment";
          case d:
            return "Portal";
          case p:
            return "Profiler";
          case _:
            return "StrictMode";
          case F:
            return "Suspense";
          case W:
            return "SuspenseList";
        }
        if (typeof e == "object")
          switch (e.$$typeof) {
            case k:
              var r = e;
              return je(r) + ".Consumer";
            case b:
              var a = e;
              return je(a._context) + ".Provider";
            case w:
              return ot(e, e.render, "ForwardRef");
            case I:
              var o = e.displayName || null;
              return o !== null ? o : we(e.type) || "Memo";
            case ie: {
              var f = e, S = f._payload, g = f._init;
              try {
                return we(g(S));
              } catch {
                return null;
              }
            }
          }
        return null;
      }
      var De = Object.prototype.hasOwnProperty, Ue = {
        key: !0,
        ref: !0,
        __self: !0,
        __source: !0
      }, ut, lt, We;
      We = {};
      function He(e) {
        if (De.call(e, "ref")) {
          var r = Object.getOwnPropertyDescriptor(e, "ref").get;
          if (r && r.isReactWarning)
            return !1;
        }
        return e.ref !== void 0;
      }
      function Qe(e) {
        if (De.call(e, "key")) {
          var r = Object.getOwnPropertyDescriptor(e, "key").get;
          if (r && r.isReactWarning)
            return !1;
        }
        return e.key !== void 0;
      }
      function Ct(e, r) {
        var a = function() {
          ut || (ut = !0, E("%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://reactjs.org/link/special-props)", r));
        };
        a.isReactWarning = !0, Object.defineProperty(e, "key", {
          get: a,
          configurable: !0
        });
      }
      function ct(e, r) {
        var a = function() {
          lt || (lt = !0, E("%s: `ref` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://reactjs.org/link/special-props)", r));
        };
        a.isReactWarning = !0, Object.defineProperty(e, "ref", {
          get: a,
          configurable: !0
        });
      }
      function ft(e) {
        if (typeof e.ref == "string" && X.current && e.__self && X.current.stateNode !== e.__self) {
          var r = we(X.current.type);
          We[r] || (E('Component "%s" contains the string ref "%s". Support for string refs will be removed in a future major release. This case cannot be automatically converted to an arrow function. We ask you to manually fix this case by using useRef() or createRef() instead. Learn more about using refs safely here: https://reactjs.org/link/strict-mode-string-ref', r, e.ref), We[r] = !0);
        }
      }
      var Je = function(e, r, a, o, f, S, g) {
        var R = {
          // This tag allows us to uniquely identify this as a React Element
          $$typeof: l,
          // Built-in properties that belong on the element
          type: e,
          key: r,
          ref: a,
          props: g,
          // Record the component responsible for creating this element.
          _owner: S
        };
        return R._store = {}, Object.defineProperty(R._store, "validated", {
          configurable: !1,
          enumerable: !1,
          writable: !0,
          value: !1
        }), Object.defineProperty(R, "_self", {
          configurable: !1,
          enumerable: !1,
          writable: !1,
          value: o
        }), Object.defineProperty(R, "_source", {
          configurable: !1,
          enumerable: !1,
          writable: !1,
          value: f
        }), Object.freeze && (Object.freeze(R.props), Object.freeze(R)), R;
      };
      function kt(e, r, a) {
        var o, f = {}, S = null, g = null, R = null, $ = null;
        if (r != null) {
          He(r) && (g = r.ref, ft(r)), Qe(r) && ($e(r.key), S = "" + r.key), R = r.__self === void 0 ? null : r.__self, $ = r.__source === void 0 ? null : r.__source;
          for (o in r)
            De.call(r, o) && !Ue.hasOwnProperty(o) && (f[o] = r[o]);
        }
        var B = arguments.length - 2;
        if (B === 1)
          f.children = a;
        else if (B > 1) {
          for (var G = Array(B), z = 0; z < B; z++)
            G[z] = arguments[z + 2];
          Object.freeze && Object.freeze(G), f.children = G;
        }
        if (e && e.defaultProps) {
          var H = e.defaultProps;
          for (o in H)
            f[o] === void 0 && (f[o] = H[o]);
        }
        if (S || g) {
          var ne = typeof e == "function" ? e.displayName || e.name || "Unknown" : e;
          S && Ct(f, ne), g && ct(f, ne);
        }
        return Je(e, S, g, R, $, X.current, f);
      }
      function xt(e, r) {
        var a = Je(e.type, r, e.ref, e._self, e._source, e._owner, e.props);
        return a;
      }
      function Tt(e, r, a) {
        if (e == null)
          throw new Error("React.cloneElement(...): The argument must be a React element, but you passed " + e + ".");
        var o, f = c({}, e.props), S = e.key, g = e.ref, R = e._self, $ = e._source, B = e._owner;
        if (r != null) {
          He(r) && (g = r.ref, B = X.current), Qe(r) && ($e(r.key), S = "" + r.key);
          var G;
          e.type && e.type.defaultProps && (G = e.type.defaultProps);
          for (o in r)
            De.call(r, o) && !Ue.hasOwnProperty(o) && (r[o] === void 0 && G !== void 0 ? f[o] = G[o] : f[o] = r[o]);
        }
        var z = arguments.length - 2;
        if (z === 1)
          f.children = a;
        else if (z > 1) {
          for (var H = Array(z), ne = 0; ne < z; ne++)
            H[ne] = arguments[ne + 2];
          f.children = H;
        }
        return Je(e.type, S, g, R, $, B, f);
      }
      function Ae(e) {
        return typeof e == "object" && e !== null && e.$$typeof === l;
      }
      var dt = ".", At = ":";
      function Xe(e) {
        var r = /[=:]/g, a = {
          "=": "=0",
          ":": "=2"
        }, o = e.replace(r, function(f) {
          return a[f];
        });
        return "$" + o;
      }
      var Ze = !1, Oe = /\/+/g;
      function Ye(e) {
        return e.replace(Oe, "$&/");
      }
      function Me(e, r) {
        return typeof e == "object" && e !== null && e.key != null ? ($e(e.key), Xe("" + e.key)) : r.toString(36);
      }
      function Fe(e, r, a, o, f) {
        var S = typeof e;
        (S === "undefined" || S === "boolean") && (e = null);
        var g = !1;
        if (e === null)
          g = !0;
        else
          switch (S) {
            case "string":
            case "number":
              g = !0;
              break;
            case "object":
              switch (e.$$typeof) {
                case l:
                case d:
                  g = !0;
              }
          }
        if (g) {
          var R = e, $ = f(R), B = o === "" ? dt + Me(R, 0) : o;
          if (Ne($)) {
            var G = "";
            B != null && (G = Ye(B) + "/"), Fe($, r, G, "", function(Gr) {
              return Gr;
            });
          } else $ != null && (Ae($) && ($.key && (!R || R.key !== $.key) && $e($.key), $ = xt(
            $,
            // Keep both the (mapped) and old keys if they differ, just as
            // traverseAllChildren used to do for objects as children
            a + // $FlowFixMe Flow incorrectly thinks React.Portal doesn't have a key
            ($.key && (!R || R.key !== $.key) ? (
              // $FlowFixMe Flow incorrectly thinks existing element's key can be a number
              // eslint-disable-next-line react-internal/safe-string-coercion
              Ye("" + $.key) + "/"
            ) : "") + B
          )), r.push($));
          return 1;
        }
        var z, H, ne = 0, de = o === "" ? dt : o + At;
        if (Ne(e))
          for (var St = 0; St < e.length; St++)
            z = e[St], H = de + Me(z, St), ne += Fe(z, r, a, H, f);
        else {
          var qt = j(e);
          if (typeof qt == "function") {
            var vr = e;
            qt === vr.entries && (Ze || Ee("Using Maps as children is not supported. Use an array of keyed ReactElements instead."), Ze = !0);
            for (var Br = qt.call(vr), yr, qr = 0; !(yr = Br.next()).done; )
              z = yr.value, H = de + Me(z, qr++), ne += Fe(z, r, a, H, f);
          } else if (S === "object") {
            var gr = String(e);
            throw new Error("Objects are not valid as a React child (found: " + (gr === "[object Object]" ? "object with keys {" + Object.keys(e).join(", ") + "}" : gr) + "). If you meant to render a collection of children, use an array instead.");
          }
        }
        return ne;
      }
      function Be(e, r, a) {
        if (e == null)
          return e;
        var o = [], f = 0;
        return Fe(e, o, "", "", function(S) {
          return r.call(a, S, f++);
        }), o;
      }
      function ht(e) {
        var r = 0;
        return Be(e, function() {
          r++;
        }), r;
      }
      function Ot(e, r, a) {
        Be(e, function() {
          r.apply(this, arguments);
        }, a);
      }
      function pt(e) {
        return Be(e, function(r) {
          return r;
        }) || [];
      }
      function vt(e) {
        if (!Ae(e))
          throw new Error("React.Children.only expected to receive a single React element child.");
        return e;
      }
      function Pt(e) {
        var r = {
          $$typeof: k,
          // As a workaround to support multiple concurrent renderers, we categorize
          // some renderers as primary and others as secondary. We only expect
          // there to be two concurrent renderers at most: React Native (primary) and
          // Fabric (secondary); React DOM (primary) and React ART (secondary).
          // Secondary renderers store their context values on separate fields.
          _currentValue: e,
          _currentValue2: e,
          // Used to track how many concurrent renderers this context currently
          // supports within in a single renderer. Such as parallel server rendering.
          _threadCount: 0,
          // These are circular
          Provider: null,
          Consumer: null,
          // Add these to use same hidden class in VM as ServerContext
          _defaultValue: null,
          _globalName: null
        };
        r.Provider = {
          $$typeof: b,
          _context: r
        };
        var a = !1, o = !1, f = !1;
        {
          var S = {
            $$typeof: k,
            _context: r
          };
          Object.defineProperties(S, {
            Provider: {
              get: function() {
                return o || (o = !0, E("Rendering <Context.Consumer.Provider> is not supported and will be removed in a future major release. Did you mean to render <Context.Provider> instead?")), r.Provider;
              },
              set: function(g) {
                r.Provider = g;
              }
            },
            _currentValue: {
              get: function() {
                return r._currentValue;
              },
              set: function(g) {
                r._currentValue = g;
              }
            },
            _currentValue2: {
              get: function() {
                return r._currentValue2;
              },
              set: function(g) {
                r._currentValue2 = g;
              }
            },
            _threadCount: {
              get: function() {
                return r._threadCount;
              },
              set: function(g) {
                r._threadCount = g;
              }
            },
            Consumer: {
              get: function() {
                return a || (a = !0, E("Rendering <Context.Consumer.Consumer> is not supported and will be removed in a future major release. Did you mean to render <Context.Consumer> instead?")), r.Consumer;
              }
            },
            displayName: {
              get: function() {
                return r.displayName;
              },
              set: function(g) {
                f || (Ee("Setting `displayName` on Context.Consumer has no effect. You should set it directly on the context with Context.displayName = '%s'.", g), f = !0);
              }
            }
          }), r.Consumer = S;
        }
        return r._currentRenderer = null, r._currentRenderer2 = null, r;
      }
      var Le = -1, qe = 0, et = 1, It = 2;
      function $t(e) {
        if (e._status === Le) {
          var r = e._result, a = r();
          if (a.then(function(S) {
            if (e._status === qe || e._status === Le) {
              var g = e;
              g._status = et, g._result = S;
            }
          }, function(S) {
            if (e._status === qe || e._status === Le) {
              var g = e;
              g._status = It, g._result = S;
            }
          }), e._status === Le) {
            var o = e;
            o._status = qe, o._result = a;
          }
        }
        if (e._status === et) {
          var f = e._result;
          return f === void 0 && E(`lazy: Expected the result of a dynamic import() call. Instead received: %s

Your code should look like: 
  const MyComponent = lazy(() => import('./MyComponent'))

Did you accidentally put curly braces around the import?`, f), "default" in f || E(`lazy: Expected the result of a dynamic import() call. Instead received: %s

Your code should look like: 
  const MyComponent = lazy(() => import('./MyComponent'))`, f), f.default;
        } else
          throw e._result;
      }
      function jt(e) {
        var r = {
          // We use these fields to store the result.
          _status: Le,
          _result: e
        }, a = {
          $$typeof: ie,
          _payload: r,
          _init: $t
        };
        {
          var o, f;
          Object.defineProperties(a, {
            defaultProps: {
              configurable: !0,
              get: function() {
                return o;
              },
              set: function(S) {
                E("React.lazy(...): It is not supported to assign `defaultProps` to a lazy component import. Either specify them where the component is defined, or create a wrapping component around it."), o = S, Object.defineProperty(a, "defaultProps", {
                  enumerable: !0
                });
              }
            },
            propTypes: {
              configurable: !0,
              get: function() {
                return f;
              },
              set: function(S) {
                E("React.lazy(...): It is not supported to assign `propTypes` to a lazy component import. Either specify them where the component is defined, or create a wrapping component around it."), f = S, Object.defineProperty(a, "propTypes", {
                  enumerable: !0
                });
              }
            }
          });
        }
        return a;
      }
      function Dt(e) {
        e != null && e.$$typeof === I ? E("forwardRef requires a render function but received a `memo` component. Instead of forwardRef(memo(...)), use memo(forwardRef(...)).") : typeof e != "function" ? E("forwardRef requires a render function but was given %s.", e === null ? "null" : typeof e) : e.length !== 0 && e.length !== 2 && E("forwardRef render functions accept exactly two parameters: props and ref. %s", e.length === 1 ? "Did you forget to use the ref parameter?" : "Any additional parameter will be undefined."), e != null && (e.defaultProps != null || e.propTypes != null) && E("forwardRef render functions do not support propTypes or defaultProps. Did you accidentally pass a React component?");
        var r = {
          $$typeof: w,
          render: e
        };
        {
          var a;
          Object.defineProperty(r, "displayName", {
            enumerable: !1,
            configurable: !0,
            get: function() {
              return a;
            },
            set: function(o) {
              a = o, !e.name && !e.displayName && (e.displayName = o);
            }
          });
        }
        return r;
      }
      var n;
      n = Symbol.for("react.module.reference");
      function u(e) {
        return !!(typeof e == "string" || typeof e == "function" || e === v || e === p || be || e === _ || e === F || e === W || se || e === me || ue || le || ae || typeof e == "object" && e !== null && (e.$$typeof === ie || e.$$typeof === I || e.$$typeof === b || e.$$typeof === k || e.$$typeof === w || // This needs to include all possible module reference object
        // types supported by any Flight configuration anywhere since
        // we don't know which Flight build this will end up being used
        // with.
        e.$$typeof === n || e.getModuleId !== void 0));
      }
      function h(e, r) {
        u(e) || E("memo: The first argument must be a component. Instead received: %s", e === null ? "null" : typeof e);
        var a = {
          $$typeof: I,
          type: e,
          compare: r === void 0 ? null : r
        };
        {
          var o;
          Object.defineProperty(a, "displayName", {
            enumerable: !1,
            configurable: !0,
            get: function() {
              return o;
            },
            set: function(f) {
              o = f, !e.name && !e.displayName && (e.displayName = f);
            }
          });
        }
        return a;
      }
      function y() {
        var e = ye.current;
        return e === null && E(`Invalid hook call. Hooks can only be called inside of the body of a function component. This could happen for one of the following reasons:
1. You might have mismatching versions of React and the renderer (such as React DOM)
2. You might be breaking the Rules of Hooks
3. You might have more than one copy of React in the same app
See https://reactjs.org/link/invalid-hook-call for tips about how to debug and fix this problem.`), e;
      }
      function M(e) {
        var r = y();
        if (e._context !== void 0) {
          var a = e._context;
          a.Consumer === e ? E("Calling useContext(Context.Consumer) is not supported, may cause bugs, and will be removed in a future major release. Did you mean to call useContext(Context) instead?") : a.Provider === e && E("Calling useContext(Context.Provider) is not supported. Did you mean to call useContext(Context) instead?");
        }
        return r.useContext(e);
      }
      function N(e) {
        var r = y();
        return r.useState(e);
      }
      function O(e, r, a) {
        var o = y();
        return o.useReducer(e, r, a);
      }
      function x(e) {
        var r = y();
        return r.useRef(e);
      }
      function fe(e, r) {
        var a = y();
        return a.useEffect(e, r);
      }
      function K(e, r) {
        var a = y();
        return a.useInsertionEffect(e, r);
      }
      function J(e, r) {
        var a = y();
        return a.useLayoutEffect(e, r);
      }
      function _e(e, r) {
        var a = y();
        return a.useCallback(e, r);
      }
      function Pe(e, r) {
        var a = y();
        return a.useMemo(e, r);
      }
      function ke(e, r, a) {
        var o = y();
        return o.useImperativeHandle(e, r, a);
      }
      function pe(e, r) {
        {
          var a = y();
          return a.useDebugValue(e, r);
        }
      }
      function tt() {
        var e = y();
        return e.useTransition();
      }
      function Mt(e) {
        var r = y();
        return r.useDeferredValue(e);
      }
      function Ft() {
        var e = y();
        return e.useId();
      }
      function Cr(e, r, a) {
        var o = y();
        return o.useSyncExternalStore(e, r, a);
      }
      var rt = 0, Kt, Ht, Qt, Jt, Xt, Zt, er;
      function tr() {
      }
      tr.__reactDisabledLog = !0;
      function kr() {
        {
          if (rt === 0) {
            Kt = console.log, Ht = console.info, Qt = console.warn, Jt = console.error, Xt = console.group, Zt = console.groupCollapsed, er = console.groupEnd;
            var e = {
              configurable: !0,
              enumerable: !0,
              value: tr,
              writable: !0
            };
            Object.defineProperties(console, {
              info: e,
              log: e,
              warn: e,
              error: e,
              group: e,
              groupCollapsed: e,
              groupEnd: e
            });
          }
          rt++;
        }
      }
      function xr() {
        {
          if (rt--, rt === 0) {
            var e = {
              configurable: !0,
              enumerable: !0,
              writable: !0
            };
            Object.defineProperties(console, {
              log: c({}, e, {
                value: Kt
              }),
              info: c({}, e, {
                value: Ht
              }),
              warn: c({}, e, {
                value: Qt
              }),
              error: c({}, e, {
                value: Jt
              }),
              group: c({}, e, {
                value: Xt
              }),
              groupCollapsed: c({}, e, {
                value: Zt
              }),
              groupEnd: c({}, e, {
                value: er
              })
            });
          }
          rt < 0 && E("disabledDepth fell below zero. This is a bug in React. Please file an issue.");
        }
      }
      var Lt = ce.ReactCurrentDispatcher, Nt;
      function yt(e, r, a) {
        {
          if (Nt === void 0)
            try {
              throw Error();
            } catch (f) {
              var o = f.stack.trim().match(/\n( *(at )?)/);
              Nt = o && o[1] || "";
            }
          return `
` + Nt + e;
        }
      }
      var Vt = !1, gt;
      {
        var Tr = typeof WeakMap == "function" ? WeakMap : Map;
        gt = new Tr();
      }
      function rr(e, r) {
        if (!e || Vt)
          return "";
        {
          var a = gt.get(e);
          if (a !== void 0)
            return a;
        }
        var o;
        Vt = !0;
        var f = Error.prepareStackTrace;
        Error.prepareStackTrace = void 0;
        var S;
        S = Lt.current, Lt.current = null, kr();
        try {
          if (r) {
            var g = function() {
              throw Error();
            };
            if (Object.defineProperty(g.prototype, "props", {
              set: function() {
                throw Error();
              }
            }), typeof Reflect == "object" && Reflect.construct) {
              try {
                Reflect.construct(g, []);
              } catch (de) {
                o = de;
              }
              Reflect.construct(e, [], g);
            } else {
              try {
                g.call();
              } catch (de) {
                o = de;
              }
              e.call(g.prototype);
            }
          } else {
            try {
              throw Error();
            } catch (de) {
              o = de;
            }
            e();
          }
        } catch (de) {
          if (de && o && typeof de.stack == "string") {
            for (var R = de.stack.split(`
`), $ = o.stack.split(`
`), B = R.length - 1, G = $.length - 1; B >= 1 && G >= 0 && R[B] !== $[G]; )
              G--;
            for (; B >= 1 && G >= 0; B--, G--)
              if (R[B] !== $[G]) {
                if (B !== 1 || G !== 1)
                  do
                    if (B--, G--, G < 0 || R[B] !== $[G]) {
                      var z = `
` + R[B].replace(" at new ", " at ");
                      return e.displayName && z.includes("<anonymous>") && (z = z.replace("<anonymous>", e.displayName)), typeof e == "function" && gt.set(e, z), z;
                    }
                  while (B >= 1 && G >= 0);
                break;
              }
          }
        } finally {
          Vt = !1, Lt.current = S, xr(), Error.prepareStackTrace = f;
        }
        var H = e ? e.displayName || e.name : "", ne = H ? yt(H) : "";
        return typeof e == "function" && gt.set(e, ne), ne;
      }
      function Ar(e, r, a) {
        return rr(e, !1);
      }
      function Or(e) {
        var r = e.prototype;
        return !!(r && r.isReactComponent);
      }
      function mt(e, r, a) {
        if (e == null)
          return "";
        if (typeof e == "function")
          return rr(e, Or(e));
        if (typeof e == "string")
          return yt(e);
        switch (e) {
          case F:
            return yt("Suspense");
          case W:
            return yt("SuspenseList");
        }
        if (typeof e == "object")
          switch (e.$$typeof) {
            case w:
              return Ar(e.render);
            case I:
              return mt(e.type, r, a);
            case ie: {
              var o = e, f = o._payload, S = o._init;
              try {
                return mt(S(f), r, a);
              } catch {
              }
            }
          }
        return "";
      }
      var nr = {}, ir = ce.ReactDebugCurrentFrame;
      function bt(e) {
        if (e) {
          var r = e._owner, a = mt(e.type, e._source, r ? r.type : null);
          ir.setExtraStackFrame(a);
        } else
          ir.setExtraStackFrame(null);
      }
      function Pr(e, r, a, o, f) {
        {
          var S = Function.call.bind(De);
          for (var g in e)
            if (S(e, g)) {
              var R = void 0;
              try {
                if (typeof e[g] != "function") {
                  var $ = Error((o || "React class") + ": " + a + " type `" + g + "` is invalid; it must be a function, usually from the `prop-types` package, but received `" + typeof e[g] + "`.This often happens because of typos such as `PropTypes.function` instead of `PropTypes.func`.");
                  throw $.name = "Invariant Violation", $;
                }
                R = e[g](r, g, o, a, null, "SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED");
              } catch (B) {
                R = B;
              }
              R && !(R instanceof Error) && (bt(f), E("%s: type specification of %s `%s` is invalid; the type checker function must return `null` or an `Error` but returned a %s. You may have forgotten to pass an argument to the type checker creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and shape all require an argument).", o || "React class", a, g, typeof R), bt(null)), R instanceof Error && !(R.message in nr) && (nr[R.message] = !0, bt(f), E("Failed %s type: %s", a, R.message), bt(null));
            }
        }
      }
      function Ge(e) {
        if (e) {
          var r = e._owner, a = mt(e.type, e._source, r ? r.type : null);
          Q(a);
        } else
          Q(null);
      }
      var Ut;
      Ut = !1;
      function ar() {
        if (X.current) {
          var e = we(X.current.type);
          if (e)
            return `

Check the render method of \`` + e + "`.";
        }
        return "";
      }
      function Ir(e) {
        if (e !== void 0) {
          var r = e.fileName.replace(/^.*[\\\/]/, ""), a = e.lineNumber;
          return `

Check your code at ` + r + ":" + a + ".";
        }
        return "";
      }
      function $r(e) {
        return e != null ? Ir(e.__source) : "";
      }
      var sr = {};
      function jr(e) {
        var r = ar();
        if (!r) {
          var a = typeof e == "string" ? e : e.displayName || e.name;
          a && (r = `

Check the top-level render call using <` + a + ">.");
        }
        return r;
      }
      function or(e, r) {
        if (!(!e._store || e._store.validated || e.key != null)) {
          e._store.validated = !0;
          var a = jr(r);
          if (!sr[a]) {
            sr[a] = !0;
            var o = "";
            e && e._owner && e._owner !== X.current && (o = " It was passed a child from " + we(e._owner.type) + "."), Ge(e), E('Each child in a list should have a unique "key" prop.%s%s See https://reactjs.org/link/warning-keys for more information.', a, o), Ge(null);
          }
        }
      }
      function ur(e, r) {
        if (typeof e == "object") {
          if (Ne(e))
            for (var a = 0; a < e.length; a++) {
              var o = e[a];
              Ae(o) && or(o, r);
            }
          else if (Ae(e))
            e._store && (e._store.validated = !0);
          else if (e) {
            var f = j(e);
            if (typeof f == "function" && f !== e.entries)
              for (var S = f.call(e), g; !(g = S.next()).done; )
                Ae(g.value) && or(g.value, r);
          }
        }
      }
      function lr(e) {
        {
          var r = e.type;
          if (r == null || typeof r == "string")
            return;
          var a;
          if (typeof r == "function")
            a = r.propTypes;
          else if (typeof r == "object" && (r.$$typeof === w || // Note: Memo only checks outer props here.
          // Inner props are checked in the reconciler.
          r.$$typeof === I))
            a = r.propTypes;
          else
            return;
          if (a) {
            var o = we(r);
            Pr(a, e.props, "prop", o, e);
          } else if (r.PropTypes !== void 0 && !Ut) {
            Ut = !0;
            var f = we(r);
            E("Component %s declared `PropTypes` instead of `propTypes`. Did you misspell the property assignment?", f || "Unknown");
          }
          typeof r.getDefaultProps == "function" && !r.getDefaultProps.isReactClassApproved && E("getDefaultProps is only used on classic React.createClass definitions. Use a static property named `defaultProps` instead.");
        }
      }
      function Dr(e) {
        {
          for (var r = Object.keys(e.props), a = 0; a < r.length; a++) {
            var o = r[a];
            if (o !== "children" && o !== "key") {
              Ge(e), E("Invalid prop `%s` supplied to `React.Fragment`. React.Fragment can only have `key` and `children` props.", o), Ge(null);
              break;
            }
          }
          e.ref !== null && (Ge(e), E("Invalid attribute `ref` supplied to `React.Fragment`."), Ge(null));
        }
      }
      function cr(e, r, a) {
        var o = u(e);
        if (!o) {
          var f = "";
          (e === void 0 || typeof e == "object" && e !== null && Object.keys(e).length === 0) && (f += " You likely forgot to export your component from the file it's defined in, or you might have mixed up default and named imports.");
          var S = $r(r);
          S ? f += S : f += ar();
          var g;
          e === null ? g = "null" : Ne(e) ? g = "array" : e !== void 0 && e.$$typeof === l ? (g = "<" + (we(e.type) || "Unknown") + " />", f = " Did you accidentally export a JSX literal instead of a component?") : g = typeof e, E("React.createElement: type is invalid -- expected a string (for built-in components) or a class/function (for composite components) but got: %s.%s", g, f);
        }
        var R = kt.apply(this, arguments);
        if (R == null)
          return R;
        if (o)
          for (var $ = 2; $ < arguments.length; $++)
            ur(arguments[$], e);
        return e === v ? Dr(R) : lr(R), R;
      }
      var fr = !1;
      function Mr(e) {
        var r = cr.bind(null, e);
        return r.type = e, fr || (fr = !0, Ee("React.createFactory() is deprecated and will be removed in a future major release. Consider using JSX or use React.createElement() directly instead.")), Object.defineProperty(r, "type", {
          enumerable: !1,
          get: function() {
            return Ee("Factory.type is deprecated. Access the class directly before passing it to createFactory."), Object.defineProperty(this, "type", {
              value: e
            }), e;
          }
        }), r;
      }
      function Fr(e, r, a) {
        for (var o = Tt.apply(this, arguments), f = 2; f < arguments.length; f++)
          ur(arguments[f], o.type);
        return lr(o), o;
      }
      function Lr(e, r) {
        var a = te.transition;
        te.transition = {};
        var o = te.transition;
        te.transition._updatedFibers = /* @__PURE__ */ new Set();
        try {
          e();
        } finally {
          if (te.transition = a, a === null && o._updatedFibers) {
            var f = o._updatedFibers.size;
            f > 10 && Ee("Detected a large number of updates inside startTransition. If this is due to a subscription please re-write it to use React provided hooks. Otherwise concurrent mode guarantees are off the table."), o._updatedFibers.clear();
          }
        }
      }
      var dr = !1, _t = null;
      function Nr(e) {
        if (_t === null)
          try {
            var r = ("require" + Math.random()).slice(0, 7), a = m && m[r];
            _t = a.call(m, "timers").setImmediate;
          } catch {
            _t = function(f) {
              dr === !1 && (dr = !0, typeof MessageChannel > "u" && E("This browser does not have a MessageChannel implementation, so enqueuing tasks via await act(async () => ...) will fail. Please file an issue at https://github.com/facebook/react/issues if you encounter this warning."));
              var S = new MessageChannel();
              S.port1.onmessage = f, S.port2.postMessage(void 0);
            };
          }
        return _t(e);
      }
      var ze = 0, hr = !1;
      function pr(e) {
        {
          var r = ze;
          ze++, V.current === null && (V.current = []);
          var a = V.isBatchingLegacy, o;
          try {
            if (V.isBatchingLegacy = !0, o = e(), !a && V.didScheduleLegacyUpdate) {
              var f = V.current;
              f !== null && (V.didScheduleLegacyUpdate = !1, Bt(f));
            }
          } catch (H) {
            throw Et(r), H;
          } finally {
            V.isBatchingLegacy = a;
          }
          if (o !== null && typeof o == "object" && typeof o.then == "function") {
            var S = o, g = !1, R = {
              then: function(H, ne) {
                g = !0, S.then(function(de) {
                  Et(r), ze === 0 ? Wt(de, H, ne) : H(de);
                }, function(de) {
                  Et(r), ne(de);
                });
              }
            };
            return !hr && typeof Promise < "u" && Promise.resolve().then(function() {
            }).then(function() {
              g || (hr = !0, E("You called act(async () => ...) without await. This could lead to unexpected testing behaviour, interleaving multiple act calls and mixing their scopes. You should - await act(async () => ...);"));
            }), R;
          } else {
            var $ = o;
            if (Et(r), ze === 0) {
              var B = V.current;
              B !== null && (Bt(B), V.current = null);
              var G = {
                then: function(H, ne) {
                  V.current === null ? (V.current = [], Wt($, H, ne)) : H($);
                }
              };
              return G;
            } else {
              var z = {
                then: function(H, ne) {
                  H($);
                }
              };
              return z;
            }
          }
        }
      }
      function Et(e) {
        e !== ze - 1 && E("You seem to have overlapping act() calls, this is not supported. Be sure to await previous act() calls before making a new one. "), ze = e;
      }
      function Wt(e, r, a) {
        {
          var o = V.current;
          if (o !== null)
            try {
              Bt(o), Nr(function() {
                o.length === 0 ? (V.current = null, r(e)) : Wt(e, r, a);
              });
            } catch (f) {
              a(f);
            }
          else
            r(e);
        }
      }
      var Yt = !1;
      function Bt(e) {
        if (!Yt) {
          Yt = !0;
          var r = 0;
          try {
            for (; r < e.length; r++) {
              var a = e[r];
              do
                a = a(!0);
              while (a !== null);
            }
            e.length = 0;
          } catch (o) {
            throw e = e.slice(r + 1), o;
          } finally {
            Yt = !1;
          }
        }
      }
      var Vr = cr, Ur = Fr, Wr = Mr, Yr = {
        map: Be,
        forEach: Ot,
        count: ht,
        toArray: pt,
        only: vt
      };
      t.Children = Yr, t.Component = P, t.Fragment = v, t.Profiler = p, t.PureComponent = L, t.StrictMode = _, t.Suspense = F, t.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = ce, t.act = pr, t.cloneElement = Ur, t.createContext = Pt, t.createElement = Vr, t.createFactory = Wr, t.createRef = wt, t.forwardRef = Dt, t.isValidElement = Ae, t.lazy = jt, t.memo = h, t.startTransition = Lr, t.unstable_act = pr, t.useCallback = _e, t.useContext = M, t.useDebugValue = pe, t.useDeferredValue = Mt, t.useEffect = fe, t.useId = Ft, t.useImperativeHandle = ke, t.useInsertionEffect = K, t.useLayoutEffect = J, t.useMemo = Pe, t.useReducer = O, t.useRef = x, t.useState = N, t.useSyncExternalStore = Cr, t.useTransition = tt, t.version = s, typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u" && typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop == "function" && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop(new Error());
    }();
  }(at, at.exports)), at.exports;
}
process.env.NODE_ENV === "production" ? zt.exports = Gn() : zt.exports = zn();
var ve = zt.exports;
/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var wr;
function Kn() {
  if (wr) return nt;
  wr = 1;
  var m = ve, t = Symbol.for("react.element"), s = Symbol.for("react.fragment"), l = Object.prototype.hasOwnProperty, d = m.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner, v = { key: !0, ref: !0, __self: !0, __source: !0 };
  function _(p, b, k) {
    var w, F = {}, W = null, I = null;
    k !== void 0 && (W = "" + k), b.key !== void 0 && (W = "" + b.key), b.ref !== void 0 && (I = b.ref);
    for (w in b) l.call(b, w) && !v.hasOwnProperty(w) && (F[w] = b[w]);
    if (p && p.defaultProps) for (w in b = p.defaultProps, b) F[w] === void 0 && (F[w] = b[w]);
    return { $$typeof: t, type: p, key: W, ref: I, props: F, _owner: d.current };
  }
  return nt.Fragment = s, nt.jsx = _, nt.jsxs = _, nt;
}
var it = {};
/**
 * @license React
 * react-jsx-runtime.development.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var Rr;
function Hn() {
  return Rr || (Rr = 1, process.env.NODE_ENV !== "production" && function() {
    var m = ve, t = Symbol.for("react.element"), s = Symbol.for("react.portal"), l = Symbol.for("react.fragment"), d = Symbol.for("react.strict_mode"), v = Symbol.for("react.profiler"), _ = Symbol.for("react.provider"), p = Symbol.for("react.context"), b = Symbol.for("react.forward_ref"), k = Symbol.for("react.suspense"), w = Symbol.for("react.suspense_list"), F = Symbol.for("react.memo"), W = Symbol.for("react.lazy"), I = Symbol.for("react.offscreen"), ie = Symbol.iterator, me = "@@iterator";
    function Z(n) {
      if (n === null || typeof n != "object")
        return null;
      var u = ie && n[ie] || n[me];
      return typeof u == "function" ? u : null;
    }
    var ee = m.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
    function j(n) {
      {
        for (var u = arguments.length, h = new Array(u > 1 ? u - 1 : 0), y = 1; y < u; y++)
          h[y - 1] = arguments[y];
        ye("error", n, h);
      }
    }
    function ye(n, u, h) {
      {
        var y = ee.ReactDebugCurrentFrame, M = y.getStackAddendum();
        M !== "" && (u += "%s", h = h.concat([M]));
        var N = h.map(function(O) {
          return String(O);
        });
        N.unshift("Warning: " + u), Function.prototype.apply.call(console[n], console, N);
      }
    }
    var te = !1, V = !1, X = !1, oe = !1, ge = !1, Q;
    Q = Symbol.for("react.module.reference");
    function ue(n) {
      return !!(typeof n == "string" || typeof n == "function" || n === l || n === v || ge || n === d || n === k || n === w || oe || n === I || te || V || X || typeof n == "object" && n !== null && (n.$$typeof === W || n.$$typeof === F || n.$$typeof === _ || n.$$typeof === p || n.$$typeof === b || // This needs to include all possible module reference object
      // types supported by any Flight configuration anywhere since
      // we don't know which Flight build this will end up being used
      // with.
      n.$$typeof === Q || n.getModuleId !== void 0));
    }
    function le(n, u, h) {
      var y = n.displayName;
      if (y)
        return y;
      var M = u.displayName || u.name || "";
      return M !== "" ? h + "(" + M + ")" : h;
    }
    function ae(n) {
      return n.displayName || "Context";
    }
    function se(n) {
      if (n == null)
        return null;
      if (typeof n.tag == "number" && j("Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."), typeof n == "function")
        return n.displayName || n.name || null;
      if (typeof n == "string")
        return n;
      switch (n) {
        case l:
          return "Fragment";
        case s:
          return "Portal";
        case v:
          return "Profiler";
        case d:
          return "StrictMode";
        case k:
          return "Suspense";
        case w:
          return "SuspenseList";
      }
      if (typeof n == "object")
        switch (n.$$typeof) {
          case p:
            var u = n;
            return ae(u) + ".Consumer";
          case _:
            var h = n;
            return ae(h._context) + ".Provider";
          case b:
            return le(n, n.render, "ForwardRef");
          case F:
            var y = n.displayName || null;
            return y !== null ? y : se(n.type) || "Memo";
          case W: {
            var M = n, N = M._payload, O = M._init;
            try {
              return se(O(N));
            } catch {
              return null;
            }
          }
        }
      return null;
    }
    var be = Object.assign, ce = 0, Ee, E, Se, Ie, Ce, i, c;
    function A() {
    }
    A.__reactDisabledLog = !0;
    function P() {
      {
        if (ce === 0) {
          Ee = console.log, E = console.info, Se = console.warn, Ie = console.error, Ce = console.group, i = console.groupCollapsed, c = console.groupEnd;
          var n = {
            configurable: !0,
            enumerable: !0,
            value: A,
            writable: !0
          };
          Object.defineProperties(console, {
            info: n,
            log: n,
            warn: n,
            error: n,
            group: n,
            groupCollapsed: n,
            groupEnd: n
          });
        }
        ce++;
      }
    }
    function D() {
      {
        if (ce--, ce === 0) {
          var n = {
            configurable: !0,
            enumerable: !0,
            writable: !0
          };
          Object.defineProperties(console, {
            log: be({}, n, {
              value: Ee
            }),
            info: be({}, n, {
              value: E
            }),
            warn: be({}, n, {
              value: Se
            }),
            error: be({}, n, {
              value: Ie
            }),
            group: be({}, n, {
              value: Ce
            }),
            groupCollapsed: be({}, n, {
              value: i
            }),
            groupEnd: be({}, n, {
              value: c
            })
          });
        }
        ce < 0 && j("disabledDepth fell below zero. This is a bug in React. Please file an issue.");
      }
    }
    var q = ee.ReactCurrentDispatcher, Y;
    function U(n, u, h) {
      {
        if (Y === void 0)
          try {
            throw Error();
          } catch (M) {
            var y = M.stack.trim().match(/\n( *(at )?)/);
            Y = y && y[1] || "";
          }
        return `
` + Y + n;
      }
    }
    var L = !1, re;
    {
      var wt = typeof WeakMap == "function" ? WeakMap : Map;
      re = new wt();
    }
    function st(n, u) {
      if (!n || L)
        return "";
      {
        var h = re.get(n);
        if (h !== void 0)
          return h;
      }
      var y;
      L = !0;
      var M = Error.prepareStackTrace;
      Error.prepareStackTrace = void 0;
      var N;
      N = q.current, q.current = null, P();
      try {
        if (u) {
          var O = function() {
            throw Error();
          };
          if (Object.defineProperty(O.prototype, "props", {
            set: function() {
              throw Error();
            }
          }), typeof Reflect == "object" && Reflect.construct) {
            try {
              Reflect.construct(O, []);
            } catch (pe) {
              y = pe;
            }
            Reflect.construct(n, [], O);
          } else {
            try {
              O.call();
            } catch (pe) {
              y = pe;
            }
            n.call(O.prototype);
          }
        } else {
          try {
            throw Error();
          } catch (pe) {
            y = pe;
          }
          n();
        }
      } catch (pe) {
        if (pe && y && typeof pe.stack == "string") {
          for (var x = pe.stack.split(`
`), fe = y.stack.split(`
`), K = x.length - 1, J = fe.length - 1; K >= 1 && J >= 0 && x[K] !== fe[J]; )
            J--;
          for (; K >= 1 && J >= 0; K--, J--)
            if (x[K] !== fe[J]) {
              if (K !== 1 || J !== 1)
                do
                  if (K--, J--, J < 0 || x[K] !== fe[J]) {
                    var _e = `
` + x[K].replace(" at new ", " at ");
                    return n.displayName && _e.includes("<anonymous>") && (_e = _e.replace("<anonymous>", n.displayName)), typeof n == "function" && re.set(n, _e), _e;
                  }
                while (K >= 1 && J >= 0);
              break;
            }
        }
      } finally {
        L = !1, q.current = N, D(), Error.prepareStackTrace = M;
      }
      var Pe = n ? n.displayName || n.name : "", ke = Pe ? U(Pe) : "";
      return typeof n == "function" && re.set(n, ke), ke;
    }
    function Ne(n, u, h) {
      return st(n, !1);
    }
    function Rt(n) {
      var u = n.prototype;
      return !!(u && u.isReactComponent);
    }
    function Ve(n, u, h) {
      if (n == null)
        return "";
      if (typeof n == "function")
        return st(n, Rt(n));
      if (typeof n == "string")
        return U(n);
      switch (n) {
        case k:
          return U("Suspense");
        case w:
          return U("SuspenseList");
      }
      if (typeof n == "object")
        switch (n.$$typeof) {
          case b:
            return Ne(n.render);
          case F:
            return Ve(n.type, u, h);
          case W: {
            var y = n, M = y._payload, N = y._init;
            try {
              return Ve(N(M), u, h);
            } catch {
            }
          }
        }
      return "";
    }
    var Te = Object.prototype.hasOwnProperty, $e = {}, ot = ee.ReactDebugCurrentFrame;
    function je(n) {
      if (n) {
        var u = n._owner, h = Ve(n.type, n._source, u ? u.type : null);
        ot.setExtraStackFrame(h);
      } else
        ot.setExtraStackFrame(null);
    }
    function we(n, u, h, y, M) {
      {
        var N = Function.call.bind(Te);
        for (var O in n)
          if (N(n, O)) {
            var x = void 0;
            try {
              if (typeof n[O] != "function") {
                var fe = Error((y || "React class") + ": " + h + " type `" + O + "` is invalid; it must be a function, usually from the `prop-types` package, but received `" + typeof n[O] + "`.This often happens because of typos such as `PropTypes.function` instead of `PropTypes.func`.");
                throw fe.name = "Invariant Violation", fe;
              }
              x = n[O](u, O, y, h, null, "SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED");
            } catch (K) {
              x = K;
            }
            x && !(x instanceof Error) && (je(M), j("%s: type specification of %s `%s` is invalid; the type checker function must return `null` or an `Error` but returned a %s. You may have forgotten to pass an argument to the type checker creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and shape all require an argument).", y || "React class", h, O, typeof x), je(null)), x instanceof Error && !(x.message in $e) && ($e[x.message] = !0, je(M), j("Failed %s type: %s", h, x.message), je(null));
          }
      }
    }
    var De = Array.isArray;
    function Ue(n) {
      return De(n);
    }
    function ut(n) {
      {
        var u = typeof Symbol == "function" && Symbol.toStringTag, h = u && n[Symbol.toStringTag] || n.constructor.name || "Object";
        return h;
      }
    }
    function lt(n) {
      try {
        return We(n), !1;
      } catch {
        return !0;
      }
    }
    function We(n) {
      return "" + n;
    }
    function He(n) {
      if (lt(n))
        return j("The provided key is an unsupported type %s. This value must be coerced to a string before before using it here.", ut(n)), We(n);
    }
    var Qe = ee.ReactCurrentOwner, Ct = {
      key: !0,
      ref: !0,
      __self: !0,
      __source: !0
    }, ct, ft;
    function Je(n) {
      if (Te.call(n, "ref")) {
        var u = Object.getOwnPropertyDescriptor(n, "ref").get;
        if (u && u.isReactWarning)
          return !1;
      }
      return n.ref !== void 0;
    }
    function kt(n) {
      if (Te.call(n, "key")) {
        var u = Object.getOwnPropertyDescriptor(n, "key").get;
        if (u && u.isReactWarning)
          return !1;
      }
      return n.key !== void 0;
    }
    function xt(n, u) {
      typeof n.ref == "string" && Qe.current;
    }
    function Tt(n, u) {
      {
        var h = function() {
          ct || (ct = !0, j("%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://reactjs.org/link/special-props)", u));
        };
        h.isReactWarning = !0, Object.defineProperty(n, "key", {
          get: h,
          configurable: !0
        });
      }
    }
    function Ae(n, u) {
      {
        var h = function() {
          ft || (ft = !0, j("%s: `ref` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://reactjs.org/link/special-props)", u));
        };
        h.isReactWarning = !0, Object.defineProperty(n, "ref", {
          get: h,
          configurable: !0
        });
      }
    }
    var dt = function(n, u, h, y, M, N, O) {
      var x = {
        // This tag allows us to uniquely identify this as a React Element
        $$typeof: t,
        // Built-in properties that belong on the element
        type: n,
        key: u,
        ref: h,
        props: O,
        // Record the component responsible for creating this element.
        _owner: N
      };
      return x._store = {}, Object.defineProperty(x._store, "validated", {
        configurable: !1,
        enumerable: !1,
        writable: !0,
        value: !1
      }), Object.defineProperty(x, "_self", {
        configurable: !1,
        enumerable: !1,
        writable: !1,
        value: y
      }), Object.defineProperty(x, "_source", {
        configurable: !1,
        enumerable: !1,
        writable: !1,
        value: M
      }), Object.freeze && (Object.freeze(x.props), Object.freeze(x)), x;
    };
    function At(n, u, h, y, M) {
      {
        var N, O = {}, x = null, fe = null;
        h !== void 0 && (He(h), x = "" + h), kt(u) && (He(u.key), x = "" + u.key), Je(u) && (fe = u.ref, xt(u, M));
        for (N in u)
          Te.call(u, N) && !Ct.hasOwnProperty(N) && (O[N] = u[N]);
        if (n && n.defaultProps) {
          var K = n.defaultProps;
          for (N in K)
            O[N] === void 0 && (O[N] = K[N]);
        }
        if (x || fe) {
          var J = typeof n == "function" ? n.displayName || n.name || "Unknown" : n;
          x && Tt(O, J), fe && Ae(O, J);
        }
        return dt(n, x, fe, M, y, Qe.current, O);
      }
    }
    var Xe = ee.ReactCurrentOwner, Ze = ee.ReactDebugCurrentFrame;
    function Oe(n) {
      if (n) {
        var u = n._owner, h = Ve(n.type, n._source, u ? u.type : null);
        Ze.setExtraStackFrame(h);
      } else
        Ze.setExtraStackFrame(null);
    }
    var Ye;
    Ye = !1;
    function Me(n) {
      return typeof n == "object" && n !== null && n.$$typeof === t;
    }
    function Fe() {
      {
        if (Xe.current) {
          var n = se(Xe.current.type);
          if (n)
            return `

Check the render method of \`` + n + "`.";
        }
        return "";
      }
    }
    function Be(n) {
      return "";
    }
    var ht = {};
    function Ot(n) {
      {
        var u = Fe();
        if (!u) {
          var h = typeof n == "string" ? n : n.displayName || n.name;
          h && (u = `

Check the top-level render call using <` + h + ">.");
        }
        return u;
      }
    }
    function pt(n, u) {
      {
        if (!n._store || n._store.validated || n.key != null)
          return;
        n._store.validated = !0;
        var h = Ot(u);
        if (ht[h])
          return;
        ht[h] = !0;
        var y = "";
        n && n._owner && n._owner !== Xe.current && (y = " It was passed a child from " + se(n._owner.type) + "."), Oe(n), j('Each child in a list should have a unique "key" prop.%s%s See https://reactjs.org/link/warning-keys for more information.', h, y), Oe(null);
      }
    }
    function vt(n, u) {
      {
        if (typeof n != "object")
          return;
        if (Ue(n))
          for (var h = 0; h < n.length; h++) {
            var y = n[h];
            Me(y) && pt(y, u);
          }
        else if (Me(n))
          n._store && (n._store.validated = !0);
        else if (n) {
          var M = Z(n);
          if (typeof M == "function" && M !== n.entries)
            for (var N = M.call(n), O; !(O = N.next()).done; )
              Me(O.value) && pt(O.value, u);
        }
      }
    }
    function Pt(n) {
      {
        var u = n.type;
        if (u == null || typeof u == "string")
          return;
        var h;
        if (typeof u == "function")
          h = u.propTypes;
        else if (typeof u == "object" && (u.$$typeof === b || // Note: Memo only checks outer props here.
        // Inner props are checked in the reconciler.
        u.$$typeof === F))
          h = u.propTypes;
        else
          return;
        if (h) {
          var y = se(u);
          we(h, n.props, "prop", y, n);
        } else if (u.PropTypes !== void 0 && !Ye) {
          Ye = !0;
          var M = se(u);
          j("Component %s declared `PropTypes` instead of `propTypes`. Did you misspell the property assignment?", M || "Unknown");
        }
        typeof u.getDefaultProps == "function" && !u.getDefaultProps.isReactClassApproved && j("getDefaultProps is only used on classic React.createClass definitions. Use a static property named `defaultProps` instead.");
      }
    }
    function Le(n) {
      {
        for (var u = Object.keys(n.props), h = 0; h < u.length; h++) {
          var y = u[h];
          if (y !== "children" && y !== "key") {
            Oe(n), j("Invalid prop `%s` supplied to `React.Fragment`. React.Fragment can only have `key` and `children` props.", y), Oe(null);
            break;
          }
        }
        n.ref !== null && (Oe(n), j("Invalid attribute `ref` supplied to `React.Fragment`."), Oe(null));
      }
    }
    var qe = {};
    function et(n, u, h, y, M, N) {
      {
        var O = ue(n);
        if (!O) {
          var x = "";
          (n === void 0 || typeof n == "object" && n !== null && Object.keys(n).length === 0) && (x += " You likely forgot to export your component from the file it's defined in, or you might have mixed up default and named imports.");
          var fe = Be();
          fe ? x += fe : x += Fe();
          var K;
          n === null ? K = "null" : Ue(n) ? K = "array" : n !== void 0 && n.$$typeof === t ? (K = "<" + (se(n.type) || "Unknown") + " />", x = " Did you accidentally export a JSX literal instead of a component?") : K = typeof n, j("React.jsx: type is invalid -- expected a string (for built-in components) or a class/function (for composite components) but got: %s.%s", K, x);
        }
        var J = At(n, u, h, M, N);
        if (J == null)
          return J;
        if (O) {
          var _e = u.children;
          if (_e !== void 0)
            if (y)
              if (Ue(_e)) {
                for (var Pe = 0; Pe < _e.length; Pe++)
                  vt(_e[Pe], n);
                Object.freeze && Object.freeze(_e);
              } else
                j("React.jsx: Static children should always be an array. You are likely explicitly calling React.jsxs or React.jsxDEV. Use the Babel transform instead.");
            else
              vt(_e, n);
        }
        if (Te.call(u, "key")) {
          var ke = se(n), pe = Object.keys(u).filter(function(Ft) {
            return Ft !== "key";
          }), tt = pe.length > 0 ? "{key: someKey, " + pe.join(": ..., ") + ": ...}" : "{key: someKey}";
          if (!qe[ke + tt]) {
            var Mt = pe.length > 0 ? "{" + pe.join(": ..., ") + ": ...}" : "{}";
            j(`A props object containing a "key" prop is being spread into JSX:
  let props = %s;
  <%s {...props} />
React keys must be passed directly to JSX without using spread:
  let props = %s;
  <%s key={someKey} {...props} />`, tt, ke, Mt, ke), qe[ke + tt] = !0;
          }
        }
        return n === l ? Le(J) : Pt(J), J;
      }
    }
    function It(n, u, h) {
      return et(n, u, h, !0);
    }
    function $t(n, u, h) {
      return et(n, u, h, !1);
    }
    var jt = $t, Dt = It;
    it.Fragment = l, it.jsx = jt, it.jsxs = Dt;
  }()), it;
}
process.env.NODE_ENV === "production" ? Gt.exports = Kn() : Gt.exports = Hn();
var Ke = Gt.exports;
function Qn(m) {
  if (!m) return "";
  const t = m.edgeLanes ? Object.keys(m.edgeLanes).sort().map((s) => {
    var l;
    return `${s}:${(l = m.edgeLanes) == null ? void 0 : l[s]}`;
  }).join(",") : "";
  return `${m.title ?? ""}|${t}`;
}
const ci = ({
  data: m,
  step: t,
  onStepChange: s,
  controls: l = !1,
  className: d,
  style: v,
  rendererOptions: _,
  keyboard: p = !0
}) => {
  const b = ve.useRef(null), k = ve.useRef(null), [w, F] = ve.useState(t ?? 0), W = ve.useRef(t), I = ve.useRef(s);
  W.current = t, I.current = s;
  const ie = ve.useRef(_);
  ie.current = _;
  const me = Qn(_), Z = m.totalSteps, ee = ve.useRef(Z);
  ee.current = Z, ve.useEffect(() => {
    const Q = b.current;
    if (!Q || ee.current <= 0) return;
    const ue = new nn(Q, ie.current), le = new rn(m, ue);
    k.current = le;
    const ae = Math.max(0, Math.min(W.current ?? 0, m.totalSteps - 1));
    return le.seek(ae, !1), F(ae), () => {
      le.destroy(), k.current = null;
    };
  }, [m, me]), ve.useEffect(() => {
    var le;
    if (t === void 0) return;
    const Q = k.current;
    if (!Q) return;
    const ue = Math.max(0, Math.min(t, ee.current - 1));
    Q.seek(ue, !0), F(ue), (le = I.current) == null || le.call(I, ue);
  }, [t]);
  const j = ve.useCallback(
    (Q, ue) => {
      var se;
      const le = k.current;
      if (!le) return;
      const ae = Math.max(0, Math.min(Q, ee.current - 1));
      le.seek(ae, ue), F(ae), (se = I.current) == null || se.call(I, ae);
    },
    []
  ), ye = ve.useCallback(() => j(0, !0), [j]), te = ve.useCallback(
    () => j((W.current ?? w) - 1, !0),
    [j, w]
  ), V = ve.useCallback(
    () => j((W.current ?? w) + 1, !0),
    [j, w]
  ), X = ve.useCallback(
    (Q) => {
      p && (Q.key === "ArrowLeft" ? (Q.preventDefault(), te()) : Q.key === "ArrowRight" && (Q.preventDefault(), V()));
    },
    [p, te, V]
  ), oe = w <= 0, ge = w >= Z - 1;
  return /* @__PURE__ */ Ke.jsx(
    "div",
    {
      ref: b,
      className: d ?? "tech-svg-player",
      style: v,
      tabIndex: p ? 0 : void 0,
      onKeyDown: p ? X : void 0,
      "data-step": w,
      children: l && Z > 0 && /* @__PURE__ */ Ke.jsxs("div", { className: "tech-svg-controls", role: "group", "aria-label": "Playback controls", children: [
        /* @__PURE__ */ Ke.jsx("button", { type: "button", onClick: ye, disabled: oe, children: "⟲ Reset" }),
        /* @__PURE__ */ Ke.jsx("button", { type: "button", onClick: te, disabled: oe, children: "▲ Prev" }),
        /* @__PURE__ */ Ke.jsxs("span", { className: "tech-svg-step", role: "status", "aria-live": "polite", children: [
          "Step ",
          w + 1,
          " / ",
          Z
        ] }),
        /* @__PURE__ */ Ke.jsx("button", { type: "button", onClick: V, disabled: ge, children: "Next ▷" })
      ] })
    }
  );
};
export {
  li as FigureSession,
  tn as GhostPool,
  rn as PlaybackController,
  Xn as Registry,
  nn as SVGRenderer,
  ci as TechSvgPlayer,
  Zn as UpdateRecorder,
  ti as binaryTreeVis,
  si as cacheLruVis,
  xe as compile,
  ai as eventLoopVis,
  ri as graphVis,
  ei as linkedListVis,
  ui as memoryLayoutVis,
  oi as processThreadVis,
  Zr as resolveCurvedEdge,
  en as resolveEdge,
  Xr as resolveStraightEdge,
  ii as stateMachineVis,
  ni as tcpHandshakeVis
};
