var Q = Object.defineProperty;
var B = (l, t, e) => t in l ? Q(l, t, { enumerable: !0, configurable: !0, writable: !0, value: e }) : l[t] = e;
var n = (l, t, e) => B(l, typeof t != "symbol" ? t + "" : t, e);
function b(l, t) {
  const e = [q(l)];
  for (const i of t) {
    const r = e[e.length - 1];
    e.push(G(r, i));
  }
  const s = P(e);
  return {
    totalSteps: e.length,
    states: e,
    edgeIndex: s
  };
}
function q(l) {
  return JSON.parse(JSON.stringify(l));
}
function G(l, t) {
  return {
    nodes: { ...l.nodes, ...t.nodes ?? {} },
    edges: { ...l.edges, ...t.edges ?? {} }
  };
}
function P(l) {
  const t = /* @__PURE__ */ new Map();
  for (const e of l)
    for (const s in e.edges) {
      const i = e.edges[s];
      for (const r of [i.source, i.target])
        t.has(r) || t.set(r, /* @__PURE__ */ new Set()), t.get(r).add(s);
    }
  return t;
}
function O(l, t, e = 20) {
  const s = t.x - l.x, i = t.y - l.y, r = Math.hypot(s, i) || 1, a = s / r, o = i / r, d = l.x + a * e, h = l.y + o * e, u = t.x - a * e, y = t.y - o * e, f = `M ${d} ${h} L ${u} ${y}`;
  return { x1: d, y1: h, x2: u, y2: y, path: f };
}
function R(l, t) {
  const e = l.x, s = l.y, i = t.x, r = t.y, a = (e + i) / 2, o = (s + r) / 2, d = `M ${e} ${s} Q ${a} ${o} ${i} ${r}`;
  return { x1: e, y1: s, x2: i, y2: r, path: d };
}
function U(l, t, e) {
  return (e == null ? void 0 : e.style) === "curved" ? R(l, t) : O(l, t);
}
class H {
  constructor() {
    n(this, "map", /* @__PURE__ */ new Map());
  }
  add(t, e) {
    this.map.has(t) || this.map.set(t, /* @__PURE__ */ new Set()), this.map.get(t).add(e);
  }
  clear(t) {
    const e = this.map.get(t);
    if (e) {
      for (const s of e) s.remove();
      this.map.delete(t);
    }
  }
  clearAll() {
    for (const t of this.map.values())
      for (const e of t) e.remove();
    this.map.clear();
  }
}
class Ft {
  constructor() {
    n(this, "nodes", /* @__PURE__ */ new Set());
  }
  update(t) {
    this.nodes.clear();
    for (const e in t.nodes)
      t.nodes[e].visible && this.nodes.add(e);
  }
  has(t) {
    return this.nodes.has(t);
  }
  list() {
    return Array.from(this.nodes);
  }
}
class Vt {
  constructor(t, e) {
    n(this, "currentStep", 0);
    n(this, "rafId", null);
    n(this, "visualState", /* @__PURE__ */ new Map());
    n(this, "transition", null);
    // Frozen in-flight transition (pause() / play() pair). Retains the elapsed
    // progress so play() can resume the remaining duration from the frozen frame.
    n(this, "pausedTransition", null);
    n(this, "destroyed", !1);
    this.data = t, this.renderer = e;
  }
  getDuration(t) {
    return !t || typeof window < "u" && typeof window.matchMedia == "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 500;
  }
  seek(t, e = !1) {
    if (this.destroyed) return;
    this.interrupt(), this.pausedTransition = null;
    const s = Math.max(0, Math.min(t, this.data.totalSteps - 1)), i = this.data.states[s];
    if (this.currentStep = s, !e) {
      this.applyInstant(i);
      return;
    }
    const r = new Map(this.visualState), a = this.getDuration(!0);
    this.transition = { from: r, to: i, start: performance.now(), duration: a }, this.rafId = requestAnimationFrame(this.tick.bind(this));
  }
  tick(t) {
    if (!this.transition || this.destroyed) return;
    const e = Math.min(1, (t - this.transition.start) / this.transition.duration), s = 1 - Math.pow(1 - e, 3), i = this.interpolate(this.transition.from, this.transition.to, s);
    this.applyVisual(i), e < 1 ? this.rafId = requestAnimationFrame(this.tick.bind(this)) : (this.transition = null, this.renderer.applyInstantState(this.data.states[this.currentStep]));
  }
  interpolate(t, e, s) {
    const i = /* @__PURE__ */ new Map(), r = /* @__PURE__ */ new Set([...t.keys(), ...Object.keys(e.nodes)]);
    for (const a of r) {
      const o = e.nodes[a], d = t.get(a), h = (d == null ? void 0 : d.x) ?? (o == null ? void 0 : o.x) ?? 0, u = (d == null ? void 0 : d.y) ?? (o == null ? void 0 : o.y) ?? 0, y = (o == null ? void 0 : o.x) ?? h, f = (o == null ? void 0 : o.y) ?? u, g = d && d.visible ? d.opacity : 0, m = o && o.visible ? o.opacity : 0, _ = g + (m - g) * s;
      i.set(a, {
        x: h + (y - h) * s,
        y: u + (f - u) * s,
        opacity: _,
        visible: _ > 1e-3
      });
    }
    return i;
  }
  applyVisual(t) {
    var e;
    if (!this.destroyed) {
      this.visualState = new Map(t);
      for (const [s, i] of t) {
        this.renderer.updateNodePosition(s, i.x, i.y, i.opacity);
        const r = this.data.edgeIndex.get(s);
        if (r)
          for (const a of r) {
            const o = (e = this.transition) == null ? void 0 : e.to.edges[a];
            if (!o) continue;
            const d = t.get(o.source), h = t.get(o.target);
            if (d && h) {
              const u = U(
                { x: d.x, y: d.y },
                { x: h.x, y: h.y },
                { style: o.style }
              );
              this.renderer.updateEdgeGeometry(a, u);
            }
          }
      }
    }
  }
  applyInstant(t) {
    if (!this.destroyed) {
      this.renderer.applyInstantState(t), this.visualState.clear();
      for (const e in t.nodes) {
        const s = t.nodes[e];
        this.visualState.set(e, { x: s.x, y: s.y, opacity: s.opacity, visible: s.visible });
      }
    }
  }
  findStepIndex(t) {
    return this.data.states.findIndex((e) => e === t);
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
const c = "http://www.w3.org/2000/svg", $ = 300;
class Dt {
  constructor(t, e) {
    n(this, "svg");
    n(this, "defs");
    n(this, "edgeGroup");
    n(this, "nodeGroup");
    n(this, "ghostGroup");
    n(this, "nodes", /* @__PURE__ */ new Map());
    n(this, "edges", /* @__PURE__ */ new Map());
    // 4A.4：上一 Statate 存在过的边集合，用于推导 active(normal) vs history。
    n(this, "prevEdgeIds", /* @__PURE__ */ new Set());
    // 4A.6b：可中断的 transient 动画（enter/leave），便于 interruption 时取消。
    n(this, "transientTimers", /* @__PURE__ */ new Set());
    n(this, "leavingEls", /* @__PURE__ */ new Set());
    n(this, "ghostPool", new H());
    n(this, "destroyed", !1);
    // 4A.2：Figure presentation metadata（不属于 CompiledStepState）
    n(this, "title");
    n(this, "edgeLanes");
    n(this, "palette", {
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
    this.title = e == null ? void 0 : e.title, this.edgeLanes = e == null ? void 0 : e.edgeLanes, this.svg = document.createElementNS(c, "svg"), this.svg.setAttribute("viewBox", "0 0 960 540"), this.svg.setAttribute("width", "100%"), this.svg.setAttribute("height", "100%"), this.svg.setAttribute("style", "display:block;"), this.svg.setAttribute("role", "img"), this.svg.setAttribute("aria-label", this.title || "Technical diagram"), this.defs = document.createElementNS(c, "defs"), this.defs.appendChild(this.makeShadowFilter()), this.defs.appendChild(this.makeArrowMarker()), this.svg.appendChild(this.defs);
    const s = document.createElementNS(c, "title");
    s.textContent = this.title || "Technical diagram", this.svg.appendChild(s);
    const i = document.createElementNS(c, "desc");
    i.textContent = "技术概念交互式图解。", this.svg.appendChild(i), this.edgeGroup = document.createElementNS(c, "g"), this.nodeGroup = document.createElementNS(c, "g"), this.ghostGroup = document.createElementNS(c, "g"), this.svg.appendChild(this.edgeGroup), this.svg.appendChild(this.nodeGroup), this.svg.appendChild(this.ghostGroup), t.appendChild(this.svg);
  }
  // 4A.6b：可中断的定时器（进入/离开动画）
  scheduleAfter(t, e) {
    const s = setTimeout(() => {
      this.transientTimers.delete(s), e();
    }, t);
    this.transientTimers.add(s);
  }
  makeShadowFilter() {
    const t = document.createElementNS(c, "filter");
    t.setAttribute("id", "node-shadow"), t.setAttribute("x", "-50%"), t.setAttribute("y", "-50%"), t.setAttribute("width", "200%"), t.setAttribute("height", "200%");
    const e = document.createElementNS(c, "feDropShadow");
    return e.setAttribute("dx", "0"), e.setAttribute("dy", "2"), e.setAttribute("stdDeviation", "3"), e.setAttribute("flood-opacity", "0.25"), t.appendChild(e), t;
  }
  makeArrowMarker() {
    const t = document.createElementNS(c, "marker");
    t.setAttribute("id", "arrow"), t.setAttribute("markerWidth", "10"), t.setAttribute("markerHeight", "10"), t.setAttribute("refX", "9"), t.setAttribute("refY", "5"), t.setAttribute("orient", "auto");
    const e = document.createElementNS(c, "path");
    return e.setAttribute("d", "M 0 0 L 10 5 L 0 10 z"), e.setAttribute("fill", "#64748b"), t.appendChild(e), t;
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
    const e = /* @__PURE__ */ new Set();
    for (const i in t.nodes) {
      e.add(i);
      const r = t.nodes[i], a = this.nodes.get(i);
      a ? this.updateNode(a, r) : this.nodes.set(i, this.createNode(i, r));
    }
    for (const [i, r] of this.nodes)
      e.has(i) || (r.g.remove(), this.nodes.delete(i));
    const s = /* @__PURE__ */ new Set();
    for (const i in t.edges) {
      const r = t.edges[i], a = t.nodes[r.source], o = t.nodes[r.target];
      if (!a || !o) continue;
      s.add(i);
      const d = !this.prevEdgeIds.has(i), h = this.edges.get(i);
      if (h)
        this.updateEdge(h, r, a, o, d);
      else {
        const u = this.createEdge(r, a, o, d);
        this.edges.set(i, u);
      }
    }
    for (const [i, r] of this.edges)
      s.has(i) || (this.edges.delete(i), this.leaveEdge(r));
    this.prevEdgeIds = s;
  }
  // ============ Nodes ============
  createNode(t, e) {
    const s = document.createElementNS(c, "g");
    s.setAttribute("data-id", t);
    const i = 132, r = 46, a = document.createElementNS(c, "rect");
    a.setAttribute("x", String(-i / 2)), a.setAttribute("y", String(-r / 2)), a.setAttribute("width", String(i)), a.setAttribute("height", String(r)), a.setAttribute("rx", "12"), a.setAttribute("ry", "12"), a.setAttribute("filter", "url(#node-shadow)"), s.appendChild(a);
    const o = document.createElementNS(c, "text");
    o.setAttribute("x", "0"), o.setAttribute("y", "1"), o.setAttribute("text-anchor", "middle"), o.setAttribute("dominant-baseline", "middle"), o.setAttribute("font-size", "15"), o.setAttribute("font-weight", "600"), o.setAttribute("font-family", "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"), s.appendChild(o), this.nodeGroup.appendChild(s);
    const d = { g: s, rect: a, text: o };
    return this.updateNode(d, e), d;
  }
  updateNode(t, e) {
    const s = !!e.highlight;
    t.g.setAttribute("transform", `translate(${e.x},${e.y})`), t.g.style.opacity = e.visible ? String(e.opacity) : "0", t.g.style.display = e.visible ? "block" : "none", t.rect.setAttribute("fill", s ? e.highlight : this.palette.node), t.rect.setAttribute("stroke", s ? "#047857" : "#94a3b8"), t.rect.setAttribute("stroke-width", s ? "2" : "1"), t.text.textContent = e.label ?? "", t.text.setAttribute("fill", this.palette.nodeText);
  }
  // ============ Edges ============
  createEdge(t, e, s, i) {
    const r = document.createElementNS(c, "g");
    r.setAttribute("data-id", t.id);
    const a = document.createElementNS(c, "path");
    a.setAttribute("fill", "none"), a.setAttribute("stroke", this.palette.history), a.setAttribute("stroke-width", "2.25"), a.setAttribute("stroke-linecap", "round"), a.setAttribute("pathLength", "100"), a.setAttribute("marker-end", "url(#arrow)"), r.appendChild(a);
    let o = null;
    t.label && (o = document.createElementNS(c, "text"), o.setAttribute("text-anchor", "middle"), o.setAttribute("font-size", "13"), o.setAttribute("font-weight", "700"), o.setAttribute("font-family", "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"), r.appendChild(o)), this.edgeGroup.appendChild(r);
    const d = { g: r, path: a, label: o };
    return this.updateEdge(d, t, e, s, i), d.path.style.transition = "opacity 300ms ease", this.enterEdge(d), d;
  }
  /** Fade-in for newly entering edges (4A.5 upgraded from an abrupt pop). */
  enterEdge(t) {
    if (this.destroyed) return;
    const e = t.path.style.opacity || "1";
    t.path.style.opacity = "0", requestAnimationFrame(() => {
      this.destroyed || (t.path.style.opacity = e);
    });
  }
  updateEdge(t, e, s, i, r) {
    const a = i.x - s.x, o = i.y - s.y, d = Math.hypot(a, o) || 1, h = a / d, u = o / d, y = -u, f = h, g = this.edgeLanes && this.edgeLanes[e.id] !== void 0 ? this.edgeLanes[e.id] : 0, m = 6, _ = 66, I = 23, S = T(h, u, _, I), w = T(-h, -u, _, I);
    let v = S + m, x = w + m;
    if (v + x > d - 4) {
      const A = Math.max(0, Math.min(m, (d - S - w) / 2 - 2));
      v = S + A, x = w + A;
    }
    const k = s.x + h * v + y * g, C = s.y + u * v + f * g, E = i.x - h * x + y * g, M = i.y - u * x + f * g, N = (k + E) / 2 + y * g * 0.7, F = (C + M) / 2 + f * g * 0.7, V = `M ${k.toFixed(1)} ${C.toFixed(1)} Q ${N.toFixed(1)} ${F.toFixed(1)} ${E.toFixed(1)} ${M.toFixed(1)}`;
    if (t.path.setAttribute("d", V), t.path.setAttribute("stroke", r ? this.palette.active : this.palette.history), t.path.setAttribute("stroke-width", r ? "3" : "2.25"), t.path.style.opacity = r ? "1" : "0.65", t.path.setAttribute("marker-end", "url(#arrow)"), t.label && e.label) {
      const A = (k + E) / 2 + y * g * 1.2, D = (C + M) / 2 + f * g * 1.2 - 14;
      t.label.setAttribute("x", A.toFixed(1)), t.label.setAttribute("y", D.toFixed(1)), t.label.textContent = e.label, t.label.setAttribute("fill", r ? this.palette.activeLabel : this.palette.historyLabel);
    }
  }
  // 4A.5（简化）：new edge 直接完整显示，不做 stroke-dashoffset 生长（避免 marker 消失/不继承）
  // 4A.5：missing edge leave（opacity 淡出后删除）
  leaveEdge(t) {
    t.g.style.transition = `opacity ${$}ms ease`, t.g.style.opacity = "0", this.leavingEls.add(t.g), this.scheduleAfter($ + 40, () => {
      t.g.remove(), this.leavingEls.delete(t.g);
    });
  }
  // 4A.6a：动画插值期间更新已有元素（不创建/删除，不处理 opacity）
  updateNodePosition(t, e, s, i) {
    if (this.destroyed) return;
    const r = this.nodes.get(t);
    r && (r.g.setAttribute("transform", `translate(${e},${s})`), i !== void 0 && (r.g.style.opacity = String(i), r.g.style.display = i > 1e-3 ? "block" : "none"));
  }
  updateEdgeGeometry(t, e) {
    if (this.destroyed) return;
    const s = this.edges.get(t);
    s && s.path.setAttribute("d", e.path);
  }
  createGhost(t) {
    if (this.destroyed) return;
    const e = this.nodes.get(t);
    if (!e) return;
    const s = e.g.cloneNode(!0);
    s.style.opacity = "0.3", this.ghostGroup.appendChild(s), this.ghostPool.add(t, s);
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
function T(l, t, e, s) {
  const i = Math.abs(l) > 1e-6 ? e / Math.abs(l) : Number.POSITIVE_INFINITY, r = Math.abs(t) > 1e-6 ? s / Math.abs(t) : Number.POSITIVE_INFINITY;
  return Math.min(i, r);
}
class Qt {
  constructor() {
    n(this, "edgeUpdates", /* @__PURE__ */ new Set());
    n(this, "nodeUpdates", /* @__PURE__ */ new Set());
  }
  reset() {
    this.edgeUpdates.clear(), this.nodeUpdates.clear();
  }
}
function Y() {
  return b({
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
const Bt = Y(), K = {
  nodes: {
    root: { x: 300, y: 60, opacity: 1, visible: !0, label: "root" }
  },
  edges: {}
}, z = {
  nodes: {
    left: { x: 180, y: 160, opacity: 1, visible: !0, label: "left" },
    right: { x: 420, y: 160, opacity: 1, visible: !0, label: "right" }
  },
  edges: {
    e_root_l: { id: "e_root_l", source: "root", target: "left", style: "curved" },
    e_root_r: { id: "e_root_r", source: "root", target: "right", style: "curved" }
  }
}, J = {
  nodes: {
    ll: { x: 100, y: 260, opacity: 1, visible: !0, label: "ll" },
    lr: { x: 260, y: 260, opacity: 1, visible: !0, label: "lr" }
  },
  edges: {
    e_left_ll: { id: "e_left_ll", source: "left", target: "ll", style: "curved" },
    e_left_lr: { id: "e_left_lr", source: "left", target: "lr", style: "curved" }
  }
}, W = {
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
}, qt = b(K, [z, J, W]), X = {
  nodes: {
    a: { x: 200, y: 100, opacity: 1, visible: !0, label: "A" },
    b: { x: 400, y: 100, opacity: 1, visible: !0, label: "B" },
    c: { x: 300, y: 200, opacity: 1, visible: !0, label: "C" },
    d: { x: 100, y: 200, opacity: 1, visible: !0, label: "D" }
  },
  edges: {}
}, j = {
  edges: {
    e_ab: { id: "e_ab", source: "a", target: "b" }
  }
}, Z = {
  edges: {
    e_bc: { id: "e_bc", source: "b", target: "c" }
  }
}, tt = {
  edges: {
    e_ca: { id: "e_ca", source: "c", target: "a" }
  }
}, et = {
  edges: {
    e_ad: { id: "e_ad", source: "a", target: "d" }
  }
}, Gt = b(X, [j, Z, tt, et]), st = {
  nodes: {
    client: { x: 150, y: 150, opacity: 1, visible: !0, label: "客户端" },
    server: { x: 650, y: 150, opacity: 1, visible: !0, label: "服务器" }
  },
  edges: {}
}, it = {
  edges: {
    syn: { id: "syn", source: "client", target: "server", label: "SYN" }
  }
}, rt = {
  edges: {
    synack: { id: "synack", source: "server", target: "client", label: "SYN+ACK" }
  }
}, ot = {
  edges: {
    ack: { id: "ack", source: "client", target: "server", label: "ACK" }
  }
}, nt = {
  nodes: {
    client: { x: 150, y: 150, opacity: 1, visible: !0, label: "客户端", highlight: "#16a34a" },
    server: { x: 650, y: 150, opacity: 1, visible: !0, label: "服务器", highlight: "#16a34a" }
  }
}, Pt = b(st, [it, rt, ot, nt]), at = {
  nodes: {
    idle: { x: 100, y: 100, opacity: 1, visible: !0, highlight: "#16a34a", label: "Idle" },
    // green for current state
    processing: { x: 300, y: 100, opacity: 1, visible: !0, highlight: void 0, label: "Processing" },
    done: { x: 500, y: 100, opacity: 1, visible: !0, highlight: void 0, label: "Done" }
  },
  edges: {}
}, lt = {
  nodes: {
    idle: { highlight: void 0 },
    processing: { highlight: "#16a34a" }
  }
}, dt = {
  nodes: {
    processing: { highlight: void 0 },
    done: { highlight: "#16a34a" }
  }
}, ht = {
  nodes: {
    done: { highlight: void 0 },
    idle: { highlight: "#16a34a" }
  }
}, Ot = b(at, [lt, dt, ht]), ct = {
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
}, ut = {
  nodes: {
    n_main: { x: 700, y: 120, opacity: 1, visible: !0 }
  },
  edges: {
    e_callStack_main: { id: "e_callStack_main", source: "qs_callStack", target: "n_main", label: "", style: "straight" }
  }
}, gt = {
  nodes: {
    n_timeout: { x: 700, y: 450, opacity: 1, visible: !0 },
    n_promise: { x: 700, y: 300, opacity: 1, visible: !0 }
  },
  edges: {
    e_callStack_main: { id: "e_callStack_main", source: "qs_callStack", target: "n_main", label: "", style: "straight" },
    e_taskQueue_timeout: { id: "e_taskQueue_timeout", source: "qs_taskQueue", target: "n_timeout", label: "", style: "straight" },
    e_microtaskQueue_promise: { id: "e_microtaskQueue_promise", source: "qs_microtaskQueue", target: "n_promise", label: "", style: "straight" }
  }
}, pt = {
  nodes: {
    n_main: { x: 700, y: 120, opacity: 1, visible: !1 }
  },
  edges: {
    e_taskQueue_timeout: { id: "e_taskQueue_timeout", source: "qs_taskQueue", target: "n_timeout", label: "", style: "straight" },
    e_microtaskQueue_promise: { id: "e_microtaskQueue_promise", source: "qs_microtaskQueue", target: "n_promise", label: "", style: "straight" }
    // e_callStack_main removed
  }
}, yt = {
  edges: {
    e_taskQueue_timeout: { id: "e_taskQueue_timeout", source: "qs_taskQueue", target: "n_timeout", label: "", style: "straight" },
    e_callStack_promise: { id: "e_callStack_promise", source: "qs_callStack", target: "n_promise", label: "", style: "straight" }
    // e_microtaskQueue_promise removed
  }
}, bt = {
  nodes: {
    n_promise: { x: 700, y: 300, opacity: 1, visible: !1 }
  },
  edges: {
    e_taskQueue_timeout: { id: "e_taskQueue_timeout", source: "qs_taskQueue", target: "n_timeout", label: "", style: "straight" }
    // e_callStack_promise removed
  }
}, ft = {
  edges: {
    e_callStack_timeout: { id: "e_callStack_timeout", source: "qs_callStack", target: "n_timeout", label: "", style: "straight" }
    // e_taskQueue_timeout removed
  }
}, mt = {
  nodes: {
    n_timeout: { x: 700, y: 450, opacity: 1, visible: !1 }
  },
  edges: {
    // e_callStack_timeout removed
  }
}, Rt = b(ct, [ut, gt, pt, yt, bt, ft, mt]), _t = {
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
}, vt = {
  nodes: {
    n_left: { x: 330, y: 150, opacity: 1, visible: !0, highlight: "#fbbf24" }
    // yellow
  },
  edges: {
    e_left: { id: "e_left", source: "n_header", target: "n_left", label: "A", style: "straight" }
  }
}, xt = {
  nodes: {
    n_left: { x: 330, y: 150, opacity: 1, visible: !0, highlight: "#fbbf24" },
    n_middle: { x: 490, y: 150, opacity: 1, visible: !0, highlight: void 0 }
  },
  edges: {
    e_left: { id: "e_left", source: "n_header", target: "n_left", label: "B", style: "straight" },
    e_middle: { id: "e_middle", source: "n_header", target: "n_middle", label: "A", style: "straight" }
  }
}, At = {
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
}, St = {
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
}, wt = {
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
}, Ut = b(_t, [vt, xt, At, St, wt]), kt = {
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
}, Ct = {
  nodes: {
    n_thread1: { x: 100, y: 200, opacity: 1, visible: !0, highlight: void 0 },
    n_thread2: { x: 300, y: 100, opacity: 1, visible: !0, highlight: "#16a34a" }
  }
}, Et = {
  nodes: {
    n_thread1: { x: 100, y: 100, opacity: 1, visible: !0, highlight: "#16a34a" },
    n_thread2: { x: 300, y: 200, opacity: 1, visible: !0, highlight: void 0 }
  }
}, Ht = b(kt, [Ct, Et]), Mt = {
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
}, It = {
  nodes: {
    n_heap: { x: 400, y: 250, opacity: 1, visible: !0, highlight: "#10b981" }
    // green
  }
}, $t = {
  nodes: {
    n_heap: { x: 400, y: 250, opacity: 1, visible: !0, highlight: void 0 },
    n_stack: { x: 300, y: 150, opacity: 1, visible: !0, highlight: "#f59e0b" }
    // amber
  }
}, Tt = {
  nodes: {
    n_stack: { x: 300, y: 150, opacity: 1, visible: !0, highlight: void 0 }
  }
}, Lt = {
  nodes: {
    n_data: { x: 500, y: 150, opacity: 1, visible: !0, highlight: "#ef4444" }
    // red
  }
}, Yt = b(Mt, [It, $t, Tt, Lt]), L = 0.4;
let p = null;
class Kt {
  constructor(t, e, s = {}) {
    n(this, "controller");
    n(this, "host");
    n(this, "autoplay");
    n(this, "autoplayDelay");
    n(this, "onModeChange");
    n(this, "onStepChange");
    n(this, "mode", "idle");
    n(this, "autoTimer", null);
    n(this, "observer", null);
    n(this, "inView", !1);
    n(this, "started", !1);
    n(this, "destroyed", !1);
    n(this, "handleIntersect", (t) => {
      if (this.destroyed) return;
      const e = t[t.length - 1];
      this.inView = e.isIntersecting, this.inView ? this.mode === "idle" ? this.enterAuto() : this.mode === "offview" && this.resumeFromOffview() : this.mode === "auto" && (this.stopAutoTimer(), this.controller.pause(), this.setMode("offview"));
    });
    /** Click-to-focus: enter interactive mode, freeze any in-flight frame. */
    n(this, "handleClick", () => {
      this.destroyed || this.enterInteractive();
    });
    n(this, "handleFocus", () => {
      this.destroyed || (this.mode === "idle" || this.mode === "paused" || this.mode === "finished") && this.enterInteractive();
    });
    n(this, "handleBlur", () => {
      this.destroyed || this.mode === "interactive" && this.setMode("paused");
    });
    n(this, "handleKeyDown", (t) => {
      if (this.destroyed || p !== this || this.mode !== "interactive" && this.mode !== "paused") return;
      const e = t.key;
      e === "n" || e === "N" || e === "ArrowRight" ? (t.preventDefault(), t.stopPropagation(), this.next()) : (e === "p" || e === "P" || e === "ArrowLeft") && (t.preventDefault(), t.stopPropagation(), this.prev());
    });
    this.controller = t, this.host = e, this.autoplay = s.autoplay ?? !0, this.autoplayDelay = s.autoplayDelay ?? 1400, this.onModeChange = s.onModeChange, this.onStepChange = s.onStepChange, this.autoplay && typeof window < "u" && typeof window.matchMedia == "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches && (this.autoplay = !1);
  }
  /** Current mode of the interaction state machine. */
  getMode() {
    return this.mode;
  }
  setMode(t) {
    var e;
    this.destroyed || this.mode === t || (this.mode = t, (e = this.onModeChange) == null || e.call(this, t));
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
      t ? (this.observer = new t((e) => this.handleIntersect(e), {
        threshold: L
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
    return t.height <= 0 || t.width <= 0 || t.bottom <= 0 || t.top >= window.innerHeight ? !1 : Math.min(t.bottom, window.innerHeight) - Math.max(t.top, 0) >= t.height * L;
  }
  resumeFromOffview() {
    this.controller.play(), this.enterAuto();
  }
  enterAuto() {
    this.destroyed || (p === this && (p = null), this.setMode("auto"), this.scheduleAdvance());
  }
  scheduleAdvance() {
    this.stopAutoTimer(), this.autoTimer = setTimeout(() => this.advanceAuto(), this.autoplayDelay);
  }
  stopAutoTimer() {
    this.autoTimer !== null && (clearTimeout(this.autoTimer), this.autoTimer = null);
  }
  advanceAuto() {
    var e;
    if (this.destroyed || this.mode !== "auto") return;
    if (this.controller.getCurrentStep() >= this.controller.totalSteps - 1) {
      this.setMode("finished");
      return;
    }
    this.controller.next(), (e = this.onStepChange) == null || e.call(this, this.controller.getCurrentStep()), this.scheduleAdvance();
  }
  /**
   * Enter interactive mode: stop the auto loop, freeze any in-flight tween at
   * its current frame (`PlaybackController.pause()` — the current picture
   * stays on screen), and focus the host so figure keyboard is ready.
   */
  enterInteractive() {
    this.stopAutoTimer(), p && p !== this && p.mode === "interactive" && p.setMode("paused"), p = this, this.setMode("interactive"), this.host.focus();
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
    this.destroyed || (this.destroyed = !0, p === this && (p = null), this.stopAutoTimer(), (t = this.observer) == null || t.disconnect(), this.observer = null, this.host.removeEventListener("click", this.handleClick), window.removeEventListener("keydown", this.handleKeyDown, !0), this.host.removeEventListener("focus", this.handleFocus), this.host.removeEventListener("blur", this.handleBlur));
  }
}
export {
  Kt as FigureSession,
  H as GhostPool,
  Vt as PlaybackController,
  Ft as Registry,
  Dt as SVGRenderer,
  Qt as UpdateRecorder,
  qt as binaryTreeVis,
  Ut as cacheLruVis,
  b as compile,
  Rt as eventLoopVis,
  Gt as graphVis,
  Bt as linkedListVis,
  Yt as memoryLayoutVis,
  Ht as processThreadVis,
  R as resolveCurvedEdge,
  U as resolveEdge,
  O as resolveStraightEdge,
  Ot as stateMachineVis,
  Pt as tcpHandshakeVis
};
