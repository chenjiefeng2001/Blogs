import{r as e}from"./vendor-mUWhGpez.js";import{B as t,j as a}from"./markdown-D588oYvz.js";
/**
 * @license lucide-react v1.58.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
/**
 * @license lucide-react v1.58.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const r=(...e)=>e.filter((e,t,a)=>Boolean(e)&&""!==e.trim()&&a.indexOf(e)===t).join(" ").trim(),i={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor","stroke-width":2,"stroke-linecap":"round","stroke-linejoin":"round"};
/**
 * @license lucide-react v1.58.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
/**
 * @license lucide-react v1.58.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
function o(e){return null!=e}
/**
 * @license lucide-react v1.58.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
function n(e,t={}){return function(e,t={}){var a,n;const s=t.attributeNames??{},c=e=>s[e]??e,l=e.size??e.width??i.width,d=e.size??e.height??i.height,h=(null==(a=e.aliases)?void 0:a.filter(e=>"string"==typeof e&&""!==e.trim()).map(e=>`lucide-${e}`))??[],m=[...e.name?[`lucide-${e.name}`]:[],...h],g=(null==(n=t.className)?void 0:n.split(" ").filter(Boolean))??[],u=!1===t.includeDefaultClasses?r(...g):r("lucide",...m,...g),p=t.absoluteStrokeWidth?Number(t.strokeWidth??i["stroke-width"])*Number(e.size??e.width??i.width)/Number(t.size??t.width??i.width):t.strokeWidth??i["stroke-width"];return["svg",{...Object.entries(i).reduce((e,[t,a])=>(e[c(t)]=a,e),{}),..."color"in t&&t.color&&{[c("stroke")]:t.color},..."size"in t&&o(t.size)&&{[c("width")]:t.size,[c("height")]:t.size},..."width"in t&&o(t.width)&&{[c("width")]:t.width},..."height"in t&&o(t.height)&&{[c("height")]:t.height},[c("stroke-width")]:p,...u&&{[c("class")]:u},[c("viewBox")]:`0 0 ${l} ${d}`,...!1===t.hasA11yProp?{[c("aria-hidden")]:"true"}:{},..."attributes"in t&&t.attributes},e.node.map(e=>{const[a,r,i]=e,o=t.nonScalingStroke?{[c("vector-effect")]:"non-scaling-stroke",...r}:r;return i?[a,o,i]:[a,o]})]}(e,{...t,attributeNames:{...t.attributeNames,class:"className","stroke-width":"strokeWidth","stroke-linecap":"strokeLinecap","stroke-linejoin":"strokeLinejoin","vector-effect":"vectorEffect"}})}
/**
 * @license lucide-react v1.58.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const s=e.createContext({}),c=e.forwardRef(({color:t,size:a,width:i,height:o,strokeWidth:c,absoluteStrokeWidth:l,nonScalingStroke:d,className:h="",children:m,iconNode:g=[],icon:u={node:g,aliases:[],size:24},...p},f)=>{const{size:y=24,strokeWidth:w=2,absoluteStrokeWidth:k=!1,nonScalingStroke:G=!1,color:b="currentColor",className:v=""}=e.useContext(s)??{},S=Boolean(m)||(e=>{for(const t in e)if(t.startsWith("aria-")||"role"===t||"title"===t)return!0;return!1})(p),[N,M,P=[]]=n(u,{color:t??b,width:i??a??y,height:o??a??y,strokeWidth:c??w,absoluteStrokeWidth:l??k,nonScalingStroke:d??G,className:r(v,h),hasA11yProp:S,attributes:p});return e.createElement(N,{ref:f,...M},[...P.map(([t,a])=>e.createElement(t,a)),...Array.isArray(m)?m:[m]])});
/**
 * @license lucide-react v1.58.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
function l(t,a=[],r=[]){const i="string"==typeof t?
/**
 * @license lucide-react v1.58.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
function(e,t,a=[]){if(null==t)throw new Error("[lucide]: iconNode is required when icon name is used");return{name:(r=e,null==r?void 0:r.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase()),size:24,node:t,...a.length>0?{aliases:a}:{}};var r}(t,a,r):t,o=e.forwardRef(({className:t,...a},r)=>e.createElement(c,{ref:r,icon:i,className:t,...a}));return i.name&&(o.displayName=(e=>{const t=(e=>{let t="",a=!1;for(const r of e)"-"===r||"_"===r||r<=" "?a=t.length>0:(0===t.length?t+=r.toLowerCase():t+=a?r.toUpperCase():r,a=!1);return t})(e);return t.charAt(0).toUpperCase()+t.slice(1)})(i.name)),o}
/**
 * @license lucide-react v1.58.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const d={name:"moon",size:24,node:[["path",{d:"M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401",key:"kfwtm"}]]},h=l(d),m={name:"sun",size:24,node:[["circle",{cx:"12",cy:"12",r:"4",key:"4exip2"}],["path",{d:"M12 2v2",key:"tus03m"}],["path",{d:"M12 20v2",key:"1lh1kg"}],["path",{d:"m4.93 4.93 1.41 1.41",key:"149t6j"}],["path",{d:"m17.66 17.66 1.41 1.41",key:"ptbguv"}],["path",{d:"M2 12h2",key:"1t8f8n"}],["path",{d:"M20 12h2",key:"1q8mjw"}],["path",{d:"m6.34 17.66-1.41 1.41",key:"1m8zz5"}],["path",{d:"m19.07 4.93-1.41 1.41",key:"1shlcs"}]]},g=l(m),u=e=>e.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/,""),p=(e,t)=>{const a=new Date(e,t,1),r=new Date(e,t+1,0),i=a.getDay(),o=r.getDate(),n=new Date(e,t,0).getDate(),s=[];for(let l=i-1;l>=0;l--)s.push({day:n-l,month:t-1,year:0===t?e-1:e,isOtherMonth:!0});for(let l=1;l<=o;l++)s.push({day:l,month:t,year:e,isOtherMonth:!1});const c=42-s.length;for(let l=1;l<=c;l++)s.push({day:l,month:t+1,year:11===t?e+1:e,isOtherMonth:!0});return s},f=e=>{const t={};return e.forEach(e=>{e.tags&&e.tags.forEach(e=>{t[e]=(t[e]||0)+1})}),Object.entries(t).sort((e,t)=>t[1]-e[1])},y=e=>{const t={};return e.forEach(e=>{t[e.category]=(t[e.category]||0)+1}),Object.entries(t).sort((e,t)=>t[1]-e[1])},w=e=>{if(!e)return"";const t=new Date(e);return`${t.getFullYear()}年${t.getMonth()+1}月${t.getDate()}日`},k=e=>{const t=e.lastIndexOf("/");return t>-1?e.substring(0,t):""},G=e=>e.split("/").map(encodeURIComponent).join("/"),b=e=>{const a=[],r=/^(#{1,3})\s+(.+)$/gm,i=new t;let o;for(;null!==(o=r.exec(e));){const e=o[2],t=i.slug(e);a.push({level:o[1].length,text:e,id:t})}return a},v=e=>{const t=[];let a=null;for(const r of e)1===r.level?(a={heading:r,children:[]},t.push(a)):a?a.children.push(r):t.push({heading:null,children:[r]});return 0===t.length&&e.length>0&&t.push({heading:null,children:e}),t},S=[{id:"javascript/js-event-loop",category:"javascript",title:"浏览器事件循环详解（交互式图解）",date:"2026-09-14T00:00:00.000Z",summary:"通过分步交互式 SVG 图解，理解 JavaScript 事件循环中调用栈、微任务队列与宏任务的执行顺序。",tags:["JavaScript","事件循环","图解","教程"]},{id:"Data Models/Model Selection And Inference",category:"Data Models",title:"Model Selection And Inference",date:"2026-09-13",summary:"对于在数学建模中的模型选择和推理实用的信息理论方法",tags:["Data Modeling","Infomation Theory"]},{id:"Network/tcp-handshake",category:"Network",title:"TCP 三次握手详解（交互式图解）",date:"2026-09-11T00:00:00.000Z",summary:"通过分步交互式 SVG 图解，理解 TCP 建立连接的三次握手过程。",tags:["TCP","网络协议","图解","教程"]},{id:"others/垃圾回收手册",category:"others",title:" 垃圾回收手册 The Garbage Collection Handbook",date:"2026-07-07",summary:"本文基于 The Garbage Collection Handbook 一书进行撰写",tags:["Software Design","RAII","Garbage Collection"]},{id:"Graphic Programming/Graphic Gems/Graphic Gems",category:"Graphic Programming/Graphic Gems",title:"Graphic Gems",date:"2026-06-20",summary:"Graphic Gems 阅读笔记",tags:["Graphic Gems","C"]},{id:"Game Engine/Multi-thread Game Engine Design",category:"Game Engine",title:"Multi-thread Game Engine Design",date:"2026-06-18",summary:"多线程游戏引擎设计，基于Direct3D的多线程技术开发",tags:["Game Engine","Direct3D"]},{id:"Blender/Blender建模指南",category:"Blender",title:"Blender建模指南",date:"2026-06-14",summary:"从零开始建模的记录，记录中间的一些坑和成果",tags:["Blender","Modeling"]},{id:"Numerical Algorithms/Numerical Recipies in Cpp",category:"Numerical Algorithms",title:"Numerical Recipies in C++",date:"2026-06-14",summary:"有关于数值算法的书籍阅读笔记",tags:["Numerical Algo","C++"]},{id:"The Art of Multiprocessor/The Art of MultiProcessor",category:"The Art of Multiprocessor",title:"The Art of MultiProcessor",date:"2026-06-14",summary:"采用全自动化的脚本扫描，以后只要丢入 Markdown 文件，网站就会自动更新。",tags:["Hardware","C"]},{id:"Graphic Programming/PBR/PBR",category:"Graphic Programming/PBR",title:"Physic Base Rendering",date:"2026-06-14",summary:"采用全自动化的脚本扫描，以后只要丢入 Markdown 文件，网站就会自动更新。",tags:["Physic Base Rendering","C++"]},{id:"Graphic Programming/RTR/RTR",category:"Graphic Programming/RTR",title:"Real Time Rendering",date:"2026-06-14",summary:"《Real Time Rendering》阅读笔记",tags:["Computer Graphic","C++"]},{id:"Game Engine/Game Engine build from zero",category:"Game Engine",title:" 从零开始构建游戏引擎",date:"2026-06-13",summary:"本系列将从零开始教你如何构建一个简单的2D游戏引擎",tags:["Game Engine","hidden"]},{id:"others/2026-06-10 软件设计哲学",category:"others",title:" 软件设计哲学 A Philosophy of Software Design",date:"2026-06-10",summary:"本文基于软件设计哲学:",tags:["Software Design","Philosophy"]},{id:"javascript/js-closures",category:"javascript",title:"JavaScript 闭包深入理解",date:"2026-06-09",summary:"闭包是 JavaScript 中最核心的概念之一，本文从原理到实践深入剖析闭包的工作机制。",tags:["JavaScript","前端"]},{id:"webgpu/WebGPU Source Book",category:"webgpu",title:" 从零开始的WebGPU开发指南",date:"2026-06-09",summary:"本文主要是对《 WebGPU Source Book High-Performance Graphic and Machine Learning in the Browser》一书的总结:",tags:["WebGPU","前端"]},{id:"first-post",category:"未分类",title:"告别硬编码：我的动态博客",date:"2026-06-08",summary:"采用全自动化的脚本扫描，以后只要丢入 Markdown 文件，网站就会自动更新。",tags:["架构","React"]}],N={badge:"_badge_1qpx4_16",badgeIcon:"_badgeIcon_1qpx4_149"},M=e.forwardRef(({variant:e="default",size:t="md",shape:r="default",type:i="default",icon:o,className:n="",children:s,...c},l)=>{const d=[N.badge,n].filter(Boolean).join(" ");return a.jsxs("span",{ref:l,className:d,"data-variant":e,"data-size":t,"data-shape":r,"data-type":i,...c,children:[o&&"dot"!==i&&a.jsx("span",{className:N.badgeIcon,children:o}),"dot"!==i&&s]})});M.displayName="Badge";export{M as B,h as M,g as S,y as a,v as b,l as c,G as d,b as e,w as f,f as g,k as h,p as i,S as p,u as s};
