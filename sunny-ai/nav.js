/* Shared Sunny AI bottom nav. FAKE MONEY ONLY. */
(function(){
if(!window.SUNNY_BOTS&&!document.querySelector('script[src="bots.js"]')){const b=document.createElement('script');b.src='bots.js';document.head.appendChild(b)}
if(!document.querySelector('script[src="tfilter.js"]')){const t=document.createElement('script');t.src='tfilter.js';document.head.appendChild(t)}
const P='<path d="',E='"/>',I={
desk:P+'M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z'+E,
profits:P+'M3 17l6-6 4 4 8-8'+E+P+'M15 7h6v6'+E,
banking:P+'M3 10l9-6 9 6'+E+P+'M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 21h18'+E,
seedling:P+'M12 21v-8'+E+P+'M12 13c0-4 3-7 8-7 0 4-3 7-8 7z'+E+P+'M12 15c0-3-2.5-5-7-5 0 3 2.5 5 7 5z'+E,
research:'<circle cx="11" cy="11" r="6.5"/>'+P+'M20 20l-4.2-4.2'+E,
charts:P+'M4 20V10M10 20V4M16 20v-7M22 20H2'+E,
stocks:P+'M4 19h16'+E+P+'M7 15v-4M12 15V6M17 15v-7'+E,
logs:P+'M5 3h11l3 3v15H5z'+E+P+'M8 9h8M8 13h8M8 17h5'+E,
agents:'<circle cx="9" cy="8" r="3.5"/>'+P+'M2.5 20c.6-3.6 3.2-5.5 6.5-5.5s5.9 1.9 6.5 5.5'+E+P+'M16 4.5a3.5 3.5 0 0 1 0 7M18 14.6c2 .6 3.2 2.5 3.6 5.4'+E};
const L=[["desk","Desk","index.html"],["profits","Profits","profits.html"],["seedling","Seedling","seedling.html"],["research","Research","research.html"],["charts","Charts","charts.html"],["agents","Agents","agents.html"],["logs","Logs","logs.html"]];
let f=location.pathname.split("/").pop()||"index.html";if(f=="agent.html")f="agents.html";if(f=="stocks.html")f="charts.html";
const n=document.createElement("nav");n.className="snav";n.setAttribute("aria-label","Sunny AI sections");
n.innerHTML='<div class="in">'+L.map(([k,l,h])=>`<a href="${h}" class="${f==h?"on":""}" ${f==h?'aria-current="page"':""}><svg viewBox="0 0 24 24">${I[k]}</svg><span>${l}</span></a>`).join("")+'</div>';
(document.readyState=="loading")?document.addEventListener("DOMContentLoaded",()=>document.body.appendChild(n)):document.body.appendChild(n);
})();
