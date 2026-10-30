/* Sunny AI team bot identities: one shared config for icons + accent colors. FAKE MONEY ONLY site. */
(function(){
const S=(d)=>`<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="vertical-align:-.15em">${d}</svg>`;
// c = accent (icon/background), t = text color tuned for contrast on the dark background
const B={
 Sunny:  {c:"#F5A524",t:"#F7B544",role:"Desk lead",icon:S('<circle cx="12" cy="12" r="4"/><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8"/>')},
 Seedling:{c:"#3FB950",t:"#56C764",role:"Major-coin swing trader",icon:S('<path d="M12 21v-8"/><path d="M12 13c0-4 3-7 8-7 0 4-3 7-8 7z"/><path d="M12 15c0-3-2.5-5-7-5 0 3 2.5 5 7 5z"/>')},
 Willow: {c:"#5FB3A1",t:"#72C2B1",role:"Trade reviewer & coach",icon:S('<path d="M12 3v18"/><path d="M12 6c-3 1-5 4-5.5 9M12 6c3 1 5 4 5.5 9M12 9c-2 1.5-3 4-3 8M12 9c2 1.5 3 4 3 8"/>')},
 Owl:    {c:"#4C6EF5",t:"#8098F8",role:"Strategy scholar",icon:S('<path d="M5 4l3 3h8l3-3v9a7 7 0 0 1-14 0z"/><circle cx="9.5" cy="11" r="1.8"/><circle cx="14.5" cy="11" r="1.8"/><path d="M11 15l1 1.2 1-1.2"/>')},
 Lark:   {c:"#74C0FC",t:"#8CCBFD",role:"News digest (every 4h)",icon:S('<path d="M3 13c3-1 5-4 9-4 3 0 5 2 6 4l3-1-2 3c-1 3-4 5-8 5-3 0-6-2-8-7z"/><path d="M9 9l2-4 2 4"/><circle cx="16" cy="12" r=".6" fill="currentColor"/>')},
 Heron:  {c:"#6C9BA8",t:"#8DB3BE",role:"Price watcher (top 20)",icon:S('<path d="M14 3c2 0 3 1.5 3 3l3 .5-3 .8c-.5 1.5-2 2.2-3 3.2-1.5 1.5-1 4 1 5.5H8c-2-1-3-3-2-5"/><path d="M11 16v5M14 16l1 5"/>')},
 Petrel: {c:"#1C7ED6",t:"#4DA3F0",role:"Macro events tracker",icon:S('<path d="M2 17c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 5 2"/><path d="M4 9c3 0 5-3 8-3 3 0 5 3 8 3M12 6v3"/>')},
 Sequoia:{c:"#A0522D",t:"#D07A4E",c2:"#2F7D4F",role:"Market historian",icon:S('<path d="M12 2l-4 6h2.5L7 13h3l-4 5h12l-4-5h3l-3.5-5H16z"/><path d="M12 18v4"/>')}};
window.SUNNY_BOTS=B;
const css=Object.entries(B).map(([n,b])=>`--bot-${n.toLowerCase()}:${b.c};--bot-${n.toLowerCase()}-t:${b.t};`).join("");
const st=document.createElement("style");
st.textContent=`:root{${css}}.botn{font-weight:700;white-space:nowrap}.botn .bi{display:inline-flex;align-items:center;justify-content:center;width:1.35em;height:1.35em;border-radius:6px;margin-right:.25em;font-size:.85em;vertical-align:-.25em}
.botchip{display:inline-flex;align-items:center;gap:6px;padding:3px 9px 3px 4px;border-radius:999px;border:1px solid}
.botchip .bi{width:22px;height:22px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:13px}
.botgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:10px}.botcard{background:#0b0e14;border:1px solid #1c222c;border-left:3px solid;border-radius:12px;padding:10px;display:flex;gap:10px;align-items:center}
.botcard .bi{width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:20px;flex:0 0 auto}.botcard b{display:block}.botcard span{color:#7b8594;font-size:11px}`;
document.head.appendChild(st);
const bg=b=>b.c2?`linear-gradient(135deg,${b.c}33,${b.c2}33)`:`${b.c}26`;
window.botBadge=(n,chip)=>{const b=B[n];if(!b)return n;const i=`<span class="bi" style="background:${bg(b)};color:${b.c}">${b.icon}</span>`;
 return chip?`<span class="botchip" style="border-color:${b.c}55;color:${b.t}">${i}${n}</span>`:`<span class="botn" data-bot="${n}" style="color:${b.t}">${i}${n}</span>`};
window.botCards=el=>{el.innerHTML=Object.entries(B).map(([n,b])=>`<div class="botcard" style="border-left-color:${b.c}"><div class="bi" style="background:${bg(b)};color:${b.c}">${b.icon}</div><div><b style="color:${b.t}">${n}</b><span>${b.role}</span></div></div>`).join("")};
// Decorate bot names in page text (not nav, scripts, inputs, or already-decorated nodes)
const RX=new RegExp(`\\b(${Object.keys(B).join("|")})\\b(?! AI\\b)`,"g"),SKIP="SCRIPT,STYLE,TEXTAREA,INPUT,SELECT,OPTION,SVG,TITLE,CODE,PRE";
function deco(root){const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode(t){const p=t.parentElement;if(!p||SKIP.includes(p.tagName)||p.closest(".botn,.botchip,.botcard,nav,.snav,[data-nobot],.banner,a.back,svg"))return 2;RX.lastIndex=0;return RX.test(t.nodeValue)?1:2}}),L=[];
 while(w.nextNode())L.push(w.currentNode);
 for(const t of L){const f=document.createElement("span");f.innerHTML=t.nodeValue.replace(/[<>&]/g,c=>({"<":"&lt;",">":"&gt;","&":"&amp;"}[c])).replace(RX,m=>botBadge(m));t.replaceWith(...f.childNodes)}}
let q=0;const run=()=>{q=0;mo.disconnect();try{deco(document.body)}finally{mo.observe(document.body,{childList:true,subtree:true,characterData:true})}};
const mo=new MutationObserver(()=>{if(!q)q=setTimeout(run,150)});
const start=()=>{document.querySelectorAll("[data-botcards]").forEach(botCards);run()};
document.readyState=="loading"?document.addEventListener("DOMContentLoaded",start):start();
})();
