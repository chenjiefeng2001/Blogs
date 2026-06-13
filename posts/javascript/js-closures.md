---
title: "JavaScript 闭包深入理解"
date: "2026-06-09"
summary: "闭包是 JavaScript 中最核心的概念之一，本文从原理到实践深入剖析闭包的工作机制。"
tags: ["JavaScript", "前端"]
---

## 什么是闭包？

闭包是指有权访问另一个函数作用域中变量的函数。创建闭包的常见方式就是在一个函数内部创建另一个函数。

## 闭包的工作原理

```javascript
function outer() {
  const x = 10;
  function inner() {
    console.log(x);
  }
  return inner;
}

const closure = outer();
closure(); // 输出 10
```

## 实际应用场景

闭包在实际开发中有广泛的应用：

1. **数据私有化**
2. **函数柯里化**
3. **防抖与节流**