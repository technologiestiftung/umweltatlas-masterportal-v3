(window.webpackJsonp=window.webpackJsonp||[]).push([[8],{3095:function(l,h,i){var b=Object.create,c=Object.defineProperty,w=Object.getOwnPropertyDescriptor,f=Object.getOwnPropertyNames,v=Object.getPrototypeOf,O=Object.prototype.hasOwnProperty,y=(e,t)=>{for(var o in t)c(e,o,{get:t[o],enumerable:!0})},s=(e,t,o,a)=>{if(t&&typeof t=="object"||typeof t=="function")for(let r of f(t))!O.call(e,r)&&r!==o&&c(e,r,{get:()=>t[r],enumerable:!(a=w(t,r))||a.enumerable});return e},P=(e,t,o)=>(o=e!=null?b(v(e)):{},s(t||!e||!e.__esModule?c(o,"default",{value:e,enumerable:!0}):o,e)),d=e=>s(c({},"__esModule",{value:!0}),e),_={};y(_,{default:()=>j}),l.exports=d(_);var g=P(i(1797));class j extends g.default{decodeBlock(t){const o=new DataView(t),a=[];for(let r=0;r<t.byteLength;++r){let n=o.getInt8(r);if(n<0){const p=o.getUint8(r+1);n=-n;for(let u=0;u<=n;++u)a.push(p);r+=1}else{for(let p=0;p<=n;++p)a.push(o.getUint8(r+p+1));r+=n+1}}return new Uint8Array(a).buffer}}}}]);