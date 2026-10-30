/* Equity / lane P/L chart with tabs Total | MAJOR | SOLANA. FAKE MONEY ONLY. */
window.laneChart=function(el,d){
  const tab=localStorage.lcTab||"Total";
  if(!el.dataset.init){el.dataset.init=1;el.innerHTML='<div class="lct" role="tablist">'+["Total","MAJOR","SOLANA"].map(t=>`<button class="lb" data-t="${t}">${t}</button>`).join("")+'</div><div class="lcv m"></div><canvas class="lcc"></canvas><div class="lcn m"></div>';
    el.querySelectorAll(".lct button").forEach(b=>b.onclick=()=>{localStorage.lcTab=b.dataset.t;laneChart(el,el._d)})}
  el._d=d;el.querySelectorAll(".lct button").forEach(b=>b.classList.toggle("on",b.dataset.t==tab));
  const LC=d.lane_curve||[],S=d.start||1000;let pts,base,lab;
  if(tab=="Total"){pts=(d.curve||[]).map(p=>[p[0],p[1]]);base=S;lab="Equity"}
  else{const i=tab=="SOLANA"?1:2;pts=LC.map(p=>[p[0],p[i]]);base=0;lab=tab+" cumulative P/L"}
  const last=pts.length?pts[pts.length-1][1]:base,up=last>=base,col=up?"#3fb68b":"#e5636f";
  const fm=v=>(v<0?"-$":"$")+Math.abs(v).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2});
  el.querySelector(".lcv").innerHTML=`${lab}: <b style="color:${col}">${tab=="Total"?fm(last):(last>=0?"+":"")+fm(last)}</b>`;
  el.querySelector(".lcn").textContent=tab=="Total"?"":"Lane series recorded each cycle. Before the first MAJOR fill (Oct 29, 10:03 AM CT) all P/L was SOLANA (backfilled); the 10:03–10:56 AM CT stretch was not reconstructed.";
  const c=el.querySelector(".lcc"),r=c.getBoundingClientRect(),dpr=devicePixelRatio||1,W=Math.max(200,r.width),H=r.height||150;
  c.width=W*dpr;c.height=H*dpr;const x=c.getContext("2d");x.scale(dpr,dpr);x.clearRect(0,0,W,H);
  if(pts.length<2){x.fillStyle="#8a94a3";x.font="12px sans-serif";x.fillText("Collecting data…",10,H/2);return}
  const t0=pts[0][0],t1=pts[pts.length-1][0],vs=pts.map(p=>p[1]).concat([base]),lo=Math.min(...vs),hi=Math.max(...vs),pad=(hi-lo)*.08||1;
  const X=t=>(t-t0)/(t1-t0||1)*(W-4)+2,Y=v=>H-4-(v-lo+pad)/(hi-lo+2*pad)*(H-8);
  x.strokeStyle="#252c36";x.setLineDash([3,3]);x.beginPath();x.moveTo(0,Y(base));x.lineTo(W,Y(base));x.stroke();x.setLineDash([]);
  x.beginPath();pts.forEach((p,i)=>i?x.lineTo(X(p[0]),Y(p[1])):x.moveTo(X(p[0]),Y(p[1])));
  x.strokeStyle=col;x.lineWidth=1.6;x.stroke();
  x.lineTo(X(t1),H);x.lineTo(X(t0),H);x.closePath();const g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,col+"44");g.addColorStop(1,col+"00");x.fillStyle=g;x.fill();
};
addEventListener("resize",()=>document.querySelectorAll("[data-init]").forEach(e=>e._d&&laneChart(e,e._d)));
