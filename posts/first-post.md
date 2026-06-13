---
title: "告别硬编码：我的动态博客"
date: "2026-06-08"
summary: "采用全自动化的脚本扫描，以后只要丢入 Markdown 文件，网站就会自动更新。"
tags: ["架构", "React"]
---

## 真正自动化的体验
现在的正文部分。

你在上面看到的 `---` 夹住的部分叫 Frontmatter，它是静态博客行业的标准协议。
你可以随便创建新的 markdown 文件，只要文件名是英文或拼音，比如 `my-new-post.md`。

```webgpu-live
// canvas, device, controller 由 WebGPURunner 自动注入
const context = canvas.getContext('webgpu');
context.configure({
  device: device,
  format: navigator.gpu.getPreferredCanvasFormat(),
  alphaMode: 'premultiplied',
});

// 获取 canvas 实际像素尺寸
const dpr = window.devicePixelRatio || 1;

let hue = 0;
const frame = () => {
  if (controller.shouldStop()) return;

  // 每帧渐变色相
  hue = (hue + 1) % 360;
  const h = hue / 360;
  const [r, g, b] = hslToRgb(h, 0.7, 0.5);

  // 创建命令编码器并开始 render pass
  const encoder = device.createCommandEncoder();
  const textureView = context.getCurrentTexture().createView();
  const pass = encoder.beginRenderPass({
    colorAttachments: [{
      view: textureView,
      clearValue: { r, g, b, a: 1.0 },
      loadOp: 'clear',
      storeOp: 'store',
    }],
  });
  pass.end();

  device.queue.submit([encoder.finish()]);
  controller.registerFrame(requestAnimationFrame(frame));
};

function hslToRgb(h, s, l) {
  const a = s * Math.min(l, 1 - l);
  const f = (n) => {
    const k = (n + h * 12) % 12;
    return l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
  };
  return [f(0), f(8), f(4)];
}

frame();
```
