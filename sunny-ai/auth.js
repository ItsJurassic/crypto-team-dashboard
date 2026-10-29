/* Sunny AI auth gate (Supabase email magic link). PAPER / SIMULATED ONLY.
   Data lives in Supabase (table public.datasets + private bucket "lessons"), readable only by allowlisted emails via RLS.
   Pages keep calling fetch("data/x.json") / fetch("team/x.json"); this shim serves those from Supabase after sign-in. */
(function(){
const SB_URL="https://lpqkhjucbgrhvtbhyvhg.supabase.co", SB_KEY="sb_publishable_3pGuphBA2r1morkdevREag_ICwfnKQa", HOME="https://itsjurassic.github.io/crypto-team-dashboard/sunny-ai/";
const css=document.createElement("style");
css.textContent=`html.sa-locked body>*:not(#sa-login){display:none!important}
#sa-login{position:fixed;inset:0;z-index:100;display:flex;align-items:center;justify-content:center;background:#0e1116;padding:20px;font:14px/1.45 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;color:#d9dee5}
#sa-login .bx{width:100%;max-width:360px;background:#151a21;border:1px solid #252c36;border-radius:10px;padding:22px}
#sa-login h1{font-size:18px;margin:0 0 4px;font-weight:650}#sa-login p{color:#8a94a3;font-size:12.5px;margin:0 0 14px}
#sa-login input{width:100%;box-sizing:border-box;background:#0e1116;border:1px solid #2d3542;border-radius:7px;color:#d9dee5;padding:11px 12px;font:inherit;font-size:16px;margin-bottom:10px}
#sa-login button{width:100%;background:#6b8afd;color:#fff;border:0;border-radius:7px;padding:11px;font:600 14px inherit;cursor:pointer}#sa-login button:disabled{opacity:.6}
#sa-login .msg{font-size:12.5px;margin-top:10px;min-height:18px}#sa-login .pb{font-size:10.5px;color:#d4a24c;text-align:center;margin-top:14px;letter-spacing:.04em}
#sa-stale{position:sticky;top:0;z-index:70;background:#3a2a10;color:#f5c26b;border-bottom:1px solid #7a5a1e;padding:7px 12px;font:12.5px -apple-system,BlinkMacSystemFont,sans-serif}#sa-stale a{color:#fff}
#sa-out{position:fixed;top:8px;right:10px;z-index:60;background:#151a21;border:1px solid #252c36;color:#8a94a3;border-radius:6px;padding:4px 9px;font:500 11px -apple-system,BlinkMacSystemFont,sans-serif;cursor:pointer}`;
document.head.appendChild(css); document.documentElement.classList.add("sa-locked");
let ok,fail; const READY=new Promise((a,b)=>{ok=a;fail=b}); let sb=null;
const nfetch=window.fetch.bind(window);
const rel=u=>{try{const x=new URL(u,location.href);if(x.origin!==location.origin)return null;const m=x.pathname.match(/sunny-ai\/((?:data|team)\/[^/]+\.(?:json|md))$/);return m?m[1]:null}catch(e){return null}};
// Data fetch: dedupe in-flight, timeouts + 2 retries, localStorage last-good cache so pages never sit on "Loading".
const LK="sa-cache:",inflight={},withTO=(p,ms)=>Promise.race([p,new Promise((_,r)=>setTimeout(()=>r(new Error("timeout")),ms))]);
const mkResp=(n,body,src)=>new Response(body,{status:200,headers:{"Content-Type":n.endsWith(".md")?"text/markdown":"application/json","X-Sa-Source":src}});
function cached(n){try{return JSON.parse(localStorage.getItem(LK+n)||"null")}catch(e){return null}}
async function pull(n){let last;for(let i=0;i<3;i++){try{await withTO(READY,i?6000:12000);
    const {data,error}=await withTO(sb.from("datasets").select("payload").eq("name",n).maybeSingle(),9000);
    if(error)throw new Error(error.message||"query failed");if(!data)return null;
    const body=n.endsWith(".md")?(typeof data.payload=="string"?data.payload:(data.payload.text||"")):JSON.stringify(data.payload);
    try{localStorage.setItem(LK+n,JSON.stringify({t:Date.now(),b:body}))}catch(e){}
    return body}catch(e){last=e;if(window.SA_NEED_LOGIN)break;await new Promise(r=>setTimeout(r,800*(i+1)))}}throw last}
window.SA_DATA_STATUS={};
window.fetch=async function(u,o){const n=rel(typeof u=="string"?u:u.url);if(!n)return nfetch(u,o);
  if(!inflight[n]){inflight[n]=pull(n).finally(()=>setTimeout(()=>delete inflight[n],1500))}
  try{const body=await inflight[n];if(body==null)return new Response("not found",{status:404});SA_DATA_STATUS[n]={ok:1,t:Date.now()};staleBar();return mkResp(n,body,"live")}
  catch(e){const c=cached(n);SA_DATA_STATUS[n]={ok:0,t:c&&c.t,err:String(e.message||e)};staleBar();
    if(c)return mkResp(n,c.b,"cache");return new Response("unavailable: "+(e.message||e),{status:503})}};
function staleBar(){const w=()=>{if(!document.body)return setTimeout(w,50);let b=document.getElementById("sa-stale");
  const bad=Object.entries(SA_DATA_STATUS).filter(([k,v])=>!v.ok);if(!bad.length){b&&b.remove();return}
  if(!b){b=document.createElement("div");b.id="sa-stale";document.body.prepend(b)}
  const ts=bad.map(([k,v])=>v.t).filter(Boolean),old=ts.length?Math.min(...ts):0;
  b.innerHTML=`⚠ Live data didn't load (${String(bad[0][1].err).replace(/[<>]/g,"")}). ${old?"Showing the last saved copy from "+new Date(old).toLocaleString("en-US",{timeZone:"America/Chicago",month:"short",day:"numeric",hour:"numeric",minute:"2-digit"})+" CT.":"No saved copy yet."} <a href="#" onclick="location.reload();return false">Retry</a>`};w()}
// lesson images: rewrite team/img/* to short-lived signed URLs from the private bucket
const signed={};async function fix(img){const s=img.getAttribute("src")||"";const m=s.match(/(?:^|\/)team\/img\/([^?#]+)/);if(!m||img.dataset.sa)return;img.dataset.sa=1;
  img.removeAttribute("src");await READY;const k=decodeURIComponent(m[1]);
  if(!signed[k]){const {data}=await sb.storage.from("lessons").createSignedUrl(k,3600);signed[k]=data&&data.signedUrl}
  if(signed[k])img.src=signed[k]}
new MutationObserver(ms=>ms.forEach(m=>{(m.type=="attributes"?[m.target]:[...m.addedNodes]).forEach(n=>{if(n.nodeType!=1)return;if(n.tagName=="IMG")fix(n);n.querySelectorAll&&n.querySelectorAll("img").forEach(fix)})})).observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:["src"]});
function login(msg){if(document.getElementById("sa-login"))return;const d=document.createElement("div");d.id="sa-login";
  d.innerHTML=`<div class=bx><h1>Sunny AI</h1><p>Sign in to view the paper-trading desk.</p>
  <form><input type=email name=email required autocomplete=username placeholder="Email"><input type=password name=password required autocomplete=current-password placeholder="Password"><button>Sign in</button></form><div class=msg>${msg||""}</div><div class=pb>PAPER / SIMULATED ONLY</div></div>`;
  document.body.appendChild(d);const f=d.querySelector("form"),b=d.querySelector("button"),mm=d.querySelector(".msg");
  f.onsubmit=async e=>{e.preventDefault();b.disabled=true;mm.style.color="#8a94a3";mm.textContent="Signing in…";
    const {error}=await sb.auth.signInWithPassword({email:f.email.value.trim(),password:f.password.value});
    b.disabled=false;if(error){mm.style.color="#e5636f";mm.textContent=/invalid/i.test(error.message)?"Wrong email or password. Try again.":/confirm/i.test(error.message)?"This account isn't confirmed yet.":"Couldn't sign in right now. Please try again."}}}
function unlock(){document.getElementById("sa-login")?.remove();document.documentElement.classList.remove("sa-locked");
  if(!document.getElementById("sa-out")){const o=document.createElement("button");o.id="sa-out";o.textContent="Sign out";o.onclick=async()=>{await sb.auth.signOut();location.reload()};document.body.appendChild(o)}}
function start(){sb=window.supabase.createClient(SB_URL,SB_KEY,{auth:{persistSession:true,autoRefreshToken:true,storage:window.localStorage,detectSessionInUrl:false}});
  const needLogin=m=>{window.SA_NEED_LOGIN=1;const w=()=>document.body?login(m):setTimeout(w,20);w()};
  withTO(sb.auth.getSession(),8000).then(({data})=>{if(data.session){unlock();ok()}else needLogin("")}).catch(()=>{
    // session check hung (storage lock / slow network): if a stored session exists, unlock and show cached data while auth catches up
    const has=Object.keys(localStorage).some(k=>/^sb-.*-auth-token$/.test(k));if(has){unlock();sb.auth.refreshSession().then(()=>ok()).catch(()=>{})}else needLogin("Sign-in check timed out. Please sign in.")});
  sb.auth.onAuthStateChange((ev,s)=>{if(s){window.SA_NEED_LOGIN=0;ok()}if(s&&document.documentElement.classList.contains("sa-locked")){unlock();ok();if(location.hash.includes("access_token"))history.replaceState(null,"",location.pathname+location.search)}})}
const LIBS=["https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.min.js","https://unpkg.com/@supabase/supabase-js@2.45.4/dist/umd/supabase.min.js"];
function lib(i){const sc=document.createElement("script");sc.src=LIBS[i];let done=0;const to=setTimeout(()=>{if(!done&&!window.supabase){done=1;next()}},10000);
  function next(){clearTimeout(to);if(i+1<LIBS.length)lib(i+1);else{fail(new Error("sign-in library didn't load"));const w=()=>document.body?login("Couldn't reach the sign-in service. Check your connection and reload."):setTimeout(w,20);w()}}
  sc.onload=()=>{if(done)return;done=1;clearTimeout(to);start()};sc.onerror=()=>{if(!done){done=1;next()}};document.head.appendChild(sc)}
READY.catch(()=>{});lib(0);
// Watchdog: any box still saying "Loading…" after 20s gets a clear message instead of spinning forever.
setTimeout(function(){document.querySelectorAll("body *:not(script):not(style)").forEach(el=>{if(el.children.length==0&&/^\s*Loading(…|\.\.\.)?\s*$/.test(el.textContent)){el.innerHTML='<span style="color:#e5a14c">Still loading. The data service may be slow. <a href="#" style="color:#8fb3ff" onclick="location.reload();return false">Retry</a></span>'}})},20000);
})();
