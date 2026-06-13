---
title: " 从零开始的WebGPU开发指南"
date: "2026-06-09"
summary: "本文主要是对《 WebGPU Source Book High-Performance Graphic and Machine Learning in the Browser》一书的总结:"
tags: ["WebGPU", "前端"]
---

# 从零开始的WebGPU开发指南

本书一共分为三个部分

1. 第一部分以高层级介绍WebGPU，不涉及任何实际的渲染或者计算(Chapter1,Chapter2)，进一步介绍应用程序需要创建的许多Js对象，以便访问GPU
2. 这部分专注于图形渲染技术(Chapter3,Chapter4,Chapter5)，Chapter3 介绍了整体渲染过程，并且介绍了图形应用程序中需要创建的对象类型。Chapter4 会进一步讨论有关WebGPU的着色语言WGSL。Chapter 5 则介绍了在三维环境下至关重要的两个主题：创建统一缓冲区和变换。第六章则侧重设置它们的颜色，以及光照和纹理相关。第七章探讨了与WebGPU相关的几个高级主题
3. 第三部分专注于计算着色器。Chapter 8展示了如何编写和执行计算应用、

## 第一章 简介

GPU工具集目前存在的缺点：

- `OpenGL`和`OpenCL`多年来没有显著的进步
- `CUDA`仅仅支持`NVIDIA`设备上运行
- `Direct3D`仅在`Windows`上运行
- `Vulkan`及其的复杂

并且最重要的缺点就是：**它们都不能在浏览器上运行**

本书的总体目标：*如何使用WebGPU编写图形和计算应用程序*

### GPU开发概述

对于一个非平凡的WebGPU应用程序，创建该程序一般情况下需要以下三个步骤:

1. 创建用于访问GPU的JavaScript对象
2. 创建包含待GPU处理的数据和指令的Javascript对象
3. 将数据和指令发送给GPU以供执行

1和2目前来说已经有大量的库实现，3依赖WGSL，目前存在两种主要的WebGPU应用程序：

- 图形应用——通过HTML Canvas 来绘制图形
- 计算应用执行计算任务

接下来先简要地来论述这两种应用程序的构建过程

#### 图形应用开发

在宏观层面，**图形WebGPU应用程序地目的在于定义HTML画布上的内容**。就更具体的来说，就是将三D渲染到2D页面上。

对于WebGPU中实现渲染，应用程序需要在Javascript中创建几个对象：`GPURenderPassEnCoder`和`GPURenderPipeline`。除此之外，还需要创建特殊对象，这些对象包含GPU定义图形场景所需的数据。

除了提供数据之外，应用程序还需要向GPU提供指令，告诉它如何定位场景中的对象以及计算对象的颜色。这些指令必须在两个程序中提供：

- 顶点着色器——告诉GPU场景中对象的位置
- 片元着色器——告诉GPU为场景的片元着色器分配哪些颜色和深度

#### 计算应用开发

除了图形渲染之外，WebGPU应用程序还可以指示GPU进行数值计算。计算应用的常见用途包括*机器学习、图像处理、频率分析和矩阵运算*。计算应用在通常情况下更容易编写代码。需要创建的Javascript对象更少，并且无需访问画布。

此外，还不需要访问顶点着色器和片元着色器，仅仅需要访问计算着色器。

计算应用和图形应用之间的一个主要区别在于：计算应用可以将GPU的处理组织成工作组，**工作组的元素称之为调用**，可以访问为其专门分配的内存。这使得改组的调用可以协同工作，并且使着色器能够同步其操作

## 第二章 基本对象

WebGPU开发中的第一步就是创建和配置用于WebGPU操作所需的JavaScript对象。有很多对象和方法需要学习，而且很难记住内容

精确来说，WebGPU的目标是将称为命令缓冲区的对象提交到与客户端GPU关联的队列中，这至少需要六个步骤：

1. **访问浏览器的Navigator来查看是否支持WebGPU**
2. **如果支持则使用Navigator获取一个GPU适配器**
3. **使用GPU适配器获取一个GPU设备**
4. **使用GPU设备创建一个GPU指令编码器**
5. **配置编码器将命令记录到缓冲区**
6. **将命令缓冲区提交给GPU设备相关联的GPU队列**

这些步骤实际上并不是很困难，但是第五步比较复杂——配置命令需要创建多个对象并调用他们的方法

如果你想在GPU上处理数字，无需进一步步骤，但是如果需要渲染图形，则应该将GPU设备与一个画布相关联。这将会产生三个额外的步骤：

1. 访问HTML文档中的画布元素
2. 从画布元素获取GPUCanvasContext
3. 使用GPU设备和画布格式配置GPUCanvasContext

### Navigator对象

> 每个现代的浏览器都提供了一个Navigator对象，其属性包含有关浏览器功能的信息。
>
> 如果该浏览器支持WebGPU，则Navigator对象将会有另一个名为GPU的属性。
>
> 如果存在，GPU属性提供两种重要的方法：
>
> - `requestAdapter()`——返回一个Promise，该Promise在获得GPU适配器时被兑现
>- 获取首选画布格式()——返回一个标识浏览器画布中最佳图形格式的字符串

这些方法在WebGPU应用中扮演着重要的角色。

### PROMISE和GPU适配器

> 仅仅因为客户端浏览器支持WebGPU并不意味着客户端硬件支持WebGPU渲染和计算。为了确保这些功能可用，应用程序需要通过调用Navigator的GPU属性`requestAdapter`方法来获取GPU适配器。
>
> 对于`requestAdapter`来说，其不会直接提供GPU适配器，而会返回一个Promise（这是一种数据结构，表示尚未完成但是预期会提供结果的操作）
>
> 每个Promise都处于下列三种状态之一：
>
> - 挂起——承诺尚未产生结果，因为操作尚未完成
>- 履行——操作已经完成，承诺已经提供结果。当承诺进行到这步时，我们称之为已经被履行
> - 拒绝——操作遇到错误，没有任何结果可以用。当一个PROMISE进入拒绝状态时， 我们称之为已被拒绝

下表是有关属性的值的表格

|     属性     |  类型  |               描述                |
| :----------: | :----: | :-------------------------------: |
|    vendor    | string | 生产GPU的公司(nvidia、amd、Intel) |
|    device    | string |             设备名称              |
| architecture | string |             设备架构              |
| description  | string |             设备描述              |

此信息在应用程序需要在不同的GPU上执行不同类型的代码时可能有帮助。如果目标GPU无法正确执行代码，那么应用程序可能需要采用变通的方法。

对于更多的信息，应用程序可以访问GPU适配器的两个有用属性：

- `features`——一个 `GPUSupportedFeatures`对象用于表示GPU支持的特性
- `limit`——一个`GPUSupportedLimits`对象，用于标识GPU的最大/最小运行参数

```webgpu-live
// 1. 获取 adapter 是异步的，确保你在 async 函数中使用它
async function checkWebGPUFeatures() {
    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) {
        console.log("未找到 WebGPU 适配器");
        return;
    }

    // 2. 修复拼写错误: featurtes -> features
    if (adapter.features.has("depth-clip-control")) {
        console.log("Supported: depth-clip-control");
    } else {
        console.log("Unsupported: depth-clip-control");
    }

    console.log("所有支持的特性列表:");
    
    // 3. 修复箭头函数语法错误: (value)={ -> (value) => {
    adapter.features.forEach((value) => {
        console.log(value);
    });

    // 或者使用更现代的 for...of 遍历
    // for (const feature of adapter.features) {
    //     console.log(feature);
    // }
}

checkWebGPUFeatures();
```



|          功能ID          |                             描述                             |
| :----------------------: | :----------------------------------------------------------: |
|    depth-clip-control    | 应用程序可以使得OpenGL的深度范围`[-1,1]`，而不是默认的深度桓冲值 |
|  depth32float-stencil8   |        深度/模板缓冲区中的元素可以有32位/8位的模板值         |
|  texture-compression-bc  |                应用程序可以使用块压缩纹理技术                |
| texture-compression-etc2 |            应用程序可以使用Ericsson 纹理压缩技术             |
| texture-compression-astc |                                                              |
|     timestamp-query      |                                                              |
| indirect-first-instance  |                                                              |
|        shader-f16        |                                                              |
| rg11b10ufloat-renderable |                                                              |
|    bgra8unorm-storage    |                                                              |
|    float32-filterable    |                                                              |

GPU适配器最重要的一点就是提对GPU设备的访问。这是通过`requestDevice`方法来实现的，该方法返回一个PROMISE，在`fulfillment`时提供GPU设备。
### GPU设备

GPU设备作为客户端GPU的逻辑链接，在WebGPU开发中起着很重要的核心作用。

|             方法              |                             描述                             |
| :---------------------------: | :----------------------------------------------------------: |
|       createBindGroup()       |              识别要绑定的一组资源并将其放在一起              |
|    createBindGroupLayout()    |                     识别相关的结构的组成                     |
|        createBuffer()         |          创建一个用于存储GPUBuffer的原始数据的结构           |
|    createCommandEncoder()     |            创建一个用于准备和打包的对象执行命令·             |
|      createComputePipe()      |                      为执行命令创建管道                      |
|    createComputePipeAsync     |                  异步创建管线执行计算的命令                  |
|    createPipelineLayout()     |         定义了每个结构的定义和目的的设备创建的缓冲区         |
|       createQuerySet()        |                创建一个可用于执行的查询集查询                |
| createRendererBundleEncoder() |        创建一个特殊的编码器，用于记录`bundle`中的命令        |
|  createRenderPipelineAsync()  |                  异步创建管线渲染图形的命令                  |
|        createSampler()        |               创建一个采样器，用于提取纹理数据               |
|     createShaderModule()      |      创建一个存储代码和数据的对象与应用程序的着色器相关      |
|        createTexture()        |              在GPU上创建资源以存储像素图像数据               |
|           destory()           |                  摧毁与客户端的逻辑链接GPU                   |
|    importExternalTexture()    |                     将视频快照转换为纹理                     |
|        popErrorScope()        |                          未发生错误                          |
|       pushErrorScope()        | 将一个新的错误作用域推入栈中，这使其能够捕获新的错误给定类型 |

这些方法在WebGPU开发中很重要，但是大多数的方法过于复杂，不适合在这里讨论。

### GPUCommandEncoder	

GPU设备最重要的方法之一是`createCommandEncoder`，它返回一个`GPUCommandEncoder`。此对象负责创建和存储将要发送到GPU的命令。

一旦对象创建完成，`GPUCommandEncoder`的方法便可以定义将发送到设备进行处理的操作。

一般来说，前三种方法是最重要的。

1. 开始渲染通道编码，返回一个`GPURenderPassEncoder`，用于定义GPU的图形操作。
2. 使用`beginComputePass`，返回一个`GPUCommandPassEncoder`，该对象的字段存储信息，告诉GPU如何执行计算任务。
3. `finish`方法，在每一个非平凡的WebGPU应用中都是必须的

### GPU队列

GPU设备有一个名为队列的重要属性，可以提供对于GPU队列的访问。为了执行GPU操作，应用程序应该具有以下三种方法来调用GPU队列：

1. 写入缓冲区——更新GPU上的缓冲区对象中的数据
2. 写入纹理——更新GPU上的纹理对象中的数据
3. 提交——告诉GPU执行一个或者多个命令

提交方法在这里面是十分重要的，因为需要告诉GPU需要执行哪些任务。

### 画布元素

画布元素是用于显示图形的表面。当WebGPU执行渲染操作的时，生成的图形会显示在画布元素内。因此在使用WebGPU进行处理的时候，需要三个步骤

1. 在HTML文档中创建一个画布元素
2. 在Javascript获取访问画布
3. 获取画布的傻瓜下文并且配置其外观

默认情况下，直接使用canvas创建的画布元素在网页中显示为一个空白矩形，要设置其内容，应用程序需要通过Javascript访问该元素，这通常通过Document对象方法完成。

### 画布上下文

WebGPU只是设置了画布内容的众多机制之一。应用程序也可以使用WebG、位图渲染或者简单的二维绘图，为了识别画布的图形将如何设置，应用程序需要使用适当的标识符调用(获取上下文)

以下我们会创建一个WebGPU对象来展示示例：

该示例会创建webGPU所需的五个中心对象

1. GPU适配器
2. GPU设备
3. GPU命令编码器
4. HTML画布元素
5. GPU画布上下文

```webgpu-live
/**
 * 1. canvas: HTML画布元素 (由系统注入)
 * 2. device: GPU设备 (由系统注入)
 * 3. controller: 运行控制器 (由系统注入)
 */

// 获取 4. GPU画布上下文
const context = canvas.getContext('webgpu');
const canvasFormat = navigator.gpu.getPreferredCanvasFormat();

context.configure({
    device: device,
    format: canvasFormat,
    alphaMode: 'premultiplied',
});

async function init() {
    // 获取 5. GPU适配器 (演示用途)
    const adapter = await navigator.gpu.requestAdapter();
    console.log("使用适配器:", adapter.name);

    function frame() {
        if (controller.shouldStop()) return;

        // 创建 3. GPU命令编码器
        const commandEncoder = device.createCommandEncoder();
        const textureView = context.getCurrentTexture().createView();

        const renderPassDescriptor = {
            colorAttachments: [{
                view: textureView,
                clearValue: { r: 0.2, g: 0.2, b: 0.2, a: 1.0 },
                loadOp: 'clear',
                storeOp: 'store',
            }],
        };

        const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
        passEncoder.end();

        device.queue.submit([commandEncoder.finish()]);
        
        // 注册当前帧
        controller.registerFrame(requestAnimationFrame(frame));
    }

    frame();
}

init();
```

## 第三章 图形渲染

在这一章中，我们将迈出探索WebGPU图形渲染迷人世界的第一步。与上一张一样，编码过程的大部分工作都涉及在Javascript中创建和配置对象。特别是，我们将把大部分时间都花在探索两个对象上：**GPURenderPassEncoder**和**GPURenderPipeline**

### 渲染通道

在GPU执行渲染命令时，每个形状的实际显示称为绘制操作或者绘制调用。大多数渲染操作都需要执行多个绘制调用。

要定义一个渲染操作，应用程序需要执行至少五个或者更多的步骤：

1. 调用编码器的`beginRenderPass`方法来创建一个`GPURenderPassEncoder`
2. 调用设备的`createRenderPipeline`方法创建一个`GPURenderPileline`
3. 向渲染通道编码器提供包含渲染数据的缓冲区
4. 通过调用渲染通道编码器的一个`draw`方法来定义绘制操作
5. 通过调用渲染通道编码器的`finish`方法来完成渲染操作

在完成最后一步之后，应用程序可以通过执行两个额外的步骤来将渲染通道发送到GPU.

