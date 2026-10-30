/* Equity / lane P/L chart, tabs Total | MAJOR | SOLANA. One continuous chart of ALL data:
   drag/swipe sideways to scroll, wheel / pinch to zoom, double-click/tap to reset. FAKE MONEY ONLY. */
window.laneChart=function(el,d){
  const tab=localStorage.lcTab||"Total";
  if(!el.dataset.init){el.dataset.init=1;el.innerHTML='<div class="lct" role="tablist">'+["Total","MAJOR","SOLANA"].map(t=>`<button class="lb" data-t="${t}">${t}</button>`).join("")+'</div><div class="lcv m"></div><canvas class="lcc" style="touch-action:pan-y;cursor:grab;width:100%;height:220px;display:block"></canvas><div class="lch m" style="font-size:11px">Drag or swipe sideways to scroll · pinch or Ctrl+scroll to zoom · double-tap to show all</div><div class="lcn m"></div>';
    el.querySelectorAll(".lct button").forEach(b=>b.onclick=()=>{localStorage.lcTab=b.dataset.t;el._v=null;laneChart(el,el._d)});
    bind(el)}
  el._d=d;el.querySelectorAll(".lct button").forEach(b=>b.classList.toggle("on",b.dataset.t==tab));
  const LC=d.lane_curve||[],S=d.start||1000;let pts,base,lab;
  if(tab=="Total"){pts=(d.curve||[]).map(p=>[p[0],p[1]]);base=S;lab="Equity"}
  else{const i=tab=="SOLANA"?1:2;pts=LC.map(p=>[p[0],p[i]]);base=0;lab=tab+" cumulative P/L"}
  el._p=pts;el._base=base;el._lab=lab;el._tab=tab;
  el.querySelector(".lcn").textContent=tab=="Total"?"":"Lane series recorded each cycle. Before the first MAJOR fill (Oct 29, 10:03 AM CT) all P/L was SOLANA (backfilled); the 10:03–10:56 AM CT stretch was not reconstructed.";
  draw(el);
  function draw(el){
    const pts=el._p,base=el._base,c=el.querySelector(".lcc"),r=c.getBoundingClientRect(),dpr=devicePixelRatio||1,W=Math.max(200,r.width),H=r.height||220;
    c.width=W*dpr;c.height=H*dpr;const x=c.getContext("2d");x.scale(dpr,dpr);x.clearRect(0,0,W,H);
    const fm=v=>(v<0?"-$":"$")+Math.abs(v).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2});
    if(pts.length<2){el.querySelector(".lcv").textContent=el._lab;x.fillStyle="#8a94a3";x.font="12px sans-serif";x.fillText("Collecting data…",10,H/2);return}
    const T0=pts[0][0],T1=pts[pts.length-1][0];let v=el._v||[T0,T1];
    const span=Math.max(120,Math.min(T1-T0,v[1]-v[0]));let a=Math.max(T0,Math.min(v[0],T1-span));v=el._v=[a,a+span];
    const vis=pts.filter((p,i)=>(p[0]>=v[0]&&p[0]<=v[1])||(pts[i+1]&&pts[i+1][0]>=v[0]&&p[0]<v[0])||(pts[i-1]&&pts[i-1][0]<=v[1]&&p[0]>v[1]));
    const last=pts[pts.length-1][1],up=last>=base,col=up?"#3fb68b":"#e5636f";
    el.querySelector(".lcv").innerHTML=`${el._lab}: <b style="color:${col}">${el._tab=="Total"?fm(last):(last>=0?"+":"")+fm(last)}</b>`;
    const vs=vis.map(p=>p[1]).concat([base]),lo=Math.min(...vs),hi=Math.max(...vs),pad=(hi-lo)*.08||1,B=16;
    const X=t=>(t-v[0])/(v[1]-v[0])*(W-4)+2,Y=q=>H-B-4-(q-lo+pad)/(hi-lo+2*pad)*(H-B-8);
    x.strokeStyle="#252c36";x.setLineDash([3,3]);x.beginPath();x.moveTo(0,Y(base));x.lineTo(W,Y(base));x.stroke();x.setLineDash([]);
    x.save();x.beginPath();x.rect(0,0,W,H-B);x.clip();
    x.beginPath();vis.forEach((p,i)=>i?x.lineTo(X(p[0]),Y(p[1])):x.moveTo(X(p[0]),Y(p[1])));x.strokeStyle=col;x.lineWidth=1.6;x.stroke();
    x.lineTo(X(vis[vis.length-1][0]),H-B);x.lineTo(X(vis[0][0]),H-B);x.closePath();const g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,col+"44");g.addColorStop(1,col+"00");x.fillStyle=g;x.fill();x.restore();
    x.fillStyle="#8a94a3";x.font="10px sans-serif";const tl=t=>new Date(t*1000).toLocaleString([], (v[1]-v[0])>172800?{month:"short",day:"numeric"}:{month:"short",day:"numeric",hour:"numeric",minute:"2-digit"});
    x.textAlign="left";x.fillText(tl(v[0]),2,H-3);x.textAlign="right";x.fillText(tl(v[1]),W-2,H-3);
    // scrollbar
    const sw=Math.max(20,(v[1]-v[0])/(T1-T0||1)*W),sx=(v[0]-T0)/(T1-T0||1)*W;if(sw<W-1){x.fillStyle="#2a3240";x.fillRect(sx,H-B-2,sw,2)}
  }
  function bind(el){
    const c=el.querySelector(".lcc"),P=new Map();let last=null;
    const zoom=(f,cx)=>{const v=el._v,w=c.getBoundingClientRect().width,t=v[0]+(cx/w)*(v[1]-v[0]),n=(v[1]-v[0])*f;el._v=[t-(t-v[0])*f,t-(t-v[0])*f+n];draw(el)};
    const pan=dx=>{const v=el._v,w=c.getBoundingClientRect().width,dt=-dx/w*(v[1]-v[0]);el._v=[v[0]+dt,v[1]+dt];draw(el)};
    c.addEventListener("wheel",e=>{if(Math.abs(e.deltaX)>Math.abs(e.deltaY)){e.preventDefault();pan(-e.deltaX);return}if(e.ctrlKey||e.metaKey){e.preventDefault();zoom(Math.exp(e.deltaY*0.01),e.offsetX)}else if(e.shiftKey){e.preventDefault();pan(-e.deltaY)}},{passive:false});
    c.addEventListener("pointerdown",e=>{c.setPointerCapture(e.pointerId);P.set(e.pointerId,[e.offsetX,e.offsetY]);c.style.cursor="grabbing";last=null});
    c.addEventListener("pointermove",e=>{if(!P.has(e.pointerId))return;const o=P.get(e.pointerId);
      if(P.size==1){pan(e.offsetX-o[0])}else if(P.size==2){const q=[...P.entries()],other=q.find(k=>k[0]!=e.pointerId)[1],d0=Math.abs(o[0]-other[0])||1,d1=Math.abs(e.offsetX-other[0])||1;zoom(d0/d1,(e.offsetX+other[0])/2)}
      P.set(e.pointerId,[e.offsetX,e.offsetY])});
    const up=e=>{P.delete(e.pointerId);if(!P.size)c.style.cursor="grab"};c.addEventListener("pointerup",up);c.addEventListener("pointercancel",up);
    c.addEventListener("dblclick",()=>{el._v=null;draw(el)});
    el._draw=()=>draw(el);
  }
};
addEventListener("resize",()=>document.querySelectorAll("[data-init]").forEach(e=>e._d&&laneChart(e,e._d)));
