(async()=>{
'use strict';
const $=id=>document.getElementById(id);
const search=$('search'),group=$('group'),reset=$('reset'),details=$('details'),timeline=$('timeline'),content=$('timeline-content'),bottom=$('timeline-bottom-scroll'),bottomInner=$('timeline-bottom-scroll-inner'),compareSelect=$('compare-select'),chips=$('compare-chips'),count=$('count');
let people=[];
try{const r=await fetch('composers.json?v=1.0');if(!r.ok)throw Error('HTTP '+r.status);people=await r.json()}catch(e){content.innerHTML='<p class="error">Impossible de charger les données des compositeurs. Vérifiez que composers.json est présent et ouvrez le site via un serveur web.</p>';count.textContent='Erreur de chargement';return}
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const byId=Object.fromEntries(people.map(p=>[p.id,p]));
const start=Math.floor((Math.min(...people.map(p=>p.birth||1100))-10)/10)*10;
const end=Math.ceil((Math.max(...people.map(p=>p.death||new Date().getFullYear()))+10)/10)*10;
const yearPx=16,labelPx=260;
let selected=null,compared=[];
[...new Set(people.map(p=>p.era))].sort((a,b)=>a.localeCompare(b,'fr')).forEach(e=>{const o=document.createElement('option');o.value=e;o.textContent=e;group.append(o)});
people.slice().sort((a,b)=>a.name.localeCompare(b.name,'fr')).forEach(p=>{const o=document.createElement('option');o.value=p.id;o.textContent=p.name;compareSelect.append(o)});
function dateText(p){return p.years||'Dates incertaines'}
function filtered(){const q=search.value.trim().toLocaleLowerCase('fr');return people.filter(p=>(group.value==='all'||p.era===group.value)&&(!q||p.name.toLocaleLowerCase('fr').includes(q)||p.works.toLocaleLowerCase('fr').includes(q)))}
function render(){
 const list=filtered().sort((a,b)=>a.name.localeCompare(b.name,'fr'));
 count.textContent=list.length+' compositeur'+(list.length===1?'':'s')+' · '+start+'–'+end;
 const width=(end-start)*yearPx;
 let html='<div class="axis"><div class="name-cell">COMPOSITEUR·RICE</div><div class="axis-years" style="width:'+width+'px">';
 for(let y=start;y<=end;y+=10)html+='<div class="year-cell" style="width:'+(10*yearPx)+'px;min-width:'+(10*yearPx)+'px">'+y+'</div>';
 html+='</div></div>';
 if(!list.length)html+='<div class="empty">Aucun nom ne correspond à ces filtres.</div>';
 for(const p of list){
  const b=p.birth||start,d=p.death||end,left=Math.max(0,(b-start)*yearPx),w=Math.max(4,(d-b)*yearPx);
  html+='<div class="person-row '+(selected===p.id?'selected':'')+'" data-id="'+esc(p.id)+'" role="button" tabindex="0" aria-label="Notice de '+esc(p.name)+'"><div class="name-cell">'+esc(p.name)+'</div><div class="track" style="width:'+width+'px"><button class="life-bar '+(!p.death?'partial':'')+'" style="left:'+left+'px;width:'+Math.min(w,width-left)+'px" aria-label="Afficher la notice de '+esc(p.name)+'" title="'+esc(p.name+' · '+dateText(p))+'"></button></div></div>';
 }
 content.innerHTML=html;
 content.querySelectorAll('.person-row').forEach(row=>{const open=()=>showDetails(row.dataset.id);row.addEventListener('click',open);row.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open()}})});
 bottomInner.style.width=(labelPx+width)+'px';
}
function showDetails(id){
 const p=byId[id];if(!p)return;selected=id;render();
 details.innerHTML='<div class="eyebrow">NOTICE BIOGRAPHIQUE</div><div class="meta">'+esc(p.era)+' · '+esc(dateText(p))+'</div><h2>'+esc(p.name)+'</h2><p>'+esc(p.description)+'</p><div class="detail-columns"><div><h3>ŒUVRES ET REPÈRES</h3><p>'+esc(p.works)+'</p></div><div><h3>SOURCES DE DÉPART</h3><p>'+esc(p.sources)+'</p><p>Les références précises et liens bibliographiques seront vérifiés et développés au fil de l’enrichissement des notices.</p></div></div>';
}
function renderChips(){
 chips.innerHTML='';
 compared.forEach(id=>{const p=byId[id];if(!p)return;const el=document.createElement('span');el.className='chip';el.textContent=p.name+' · '+dateText(p)+' ';const b=document.createElement('button');b.type='button';b.textContent='×';b.setAttribute('aria-label','Retirer '+p.name);b.addEventListener('click',()=>{compared=compared.filter(x=>x!==id);renderChips()});el.append(b);chips.append(el)});
 const old=document.getElementById('compare-result');if(old)old.remove();
 if(compared.length){const res=document.createElement('div');res.id='compare-result';res.className='compare-result';res.textContent='Écart entre les naissances : '+Math.max(...compared.map(id=>byId[id].birth))-Math.min(...compared.map(id=>byId[id].birth))+' ans. Les lignes correspondantes sont visibles dans la frise en sélectionnant chaque nom.';chips.after(res)}
}
search.addEventListener('input',render);group.addEventListener('change',render);reset.addEventListener('click',()=>{search.value='';group.value='all';render()});
compareSelect.addEventListener('change',()=>{const id=compareSelect.value;if(id&&!compared.includes(id))compared.push(id);compareSelect.value='';renderChips()});
const sync=(source,target)=>{if(source._syncing)return;target._syncing=true;target.scrollLeft=source.scrollLeft;target._syncing=false};
timeline.addEventListener('scroll',()=>sync(timeline,bottom));bottom.addEventListener('scroll',()=>sync(bottom,timeline));
render();
})();