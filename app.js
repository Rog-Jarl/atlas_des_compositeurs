(async()=>{
'use strict';
const $=id=>document.getElementById(id);
const search=$('search'),group=$('group'),reset=$('reset'),details=$('details-content'),timeline=$('timeline'),content=$('timeline-content'),bottom=$('timeline-bottom-scroll'),bottomInner=$('timeline-bottom-scroll-inner'),compareSelect=$('compare-select'),compareClear=$('compare-clear'),count=$('count');
let people=[];
try{const r=await fetch('composers.json?v=1.6');if(!r.ok)throw Error('HTTP '+r.status);people=await r.json()}catch(e){content.innerHTML='<p class="error">Impossible de charger les données des compositeurs. Vérifiez que composers.json est présent et ouvrez le site via un serveur web.</p>';count.textContent='Erreur de chargement';return}
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const byId=Object.fromEntries(people.map(p=>[p.id,p]));
const surnameKey=name=>String(name||'').trim().split(/\s+/).filter(Boolean).at(-1)||String(name||'');
const alphabetical=(a,b)=>surnameKey(a.name).localeCompare(surnameKey(b.name),'fr',{sensitivity:'base'})||a.name.localeCompare(b.name,'fr',{sensitivity:'base'});
const start=Math.floor((Math.min(...people.map(p=>p.birth||1100))-10)/10)*10;
const end=Math.ceil((Math.max(...people.map(p=>p.death||new Date().getFullYear()))+10)/10)*10;
const yearPx=16;
let selected=null,compared=[];
[...new Set(people.map(p=>p.era))].sort((a,b)=>a.localeCompare(b,'fr')).forEach(e=>{const o=document.createElement('option');o.value=e;o.textContent=e;group.append(o)});
people.slice().sort(alphabetical).forEach(p=>{const o=document.createElement('option');o.value=p.id;o.textContent=p.name;compareSelect.append(o)});
function dateText(p){return p.years||'Dates incertaines'}
function filtered(){const q=search.value.trim().toLocaleLowerCase('fr');return people.filter(p=>(group.value==='all'||p.era===group.value)&&(!q||p.name.toLocaleLowerCase('fr').includes(q)||p.works.toLocaleLowerCase('fr').includes(q)))}
function render(){
 const list=filtered().sort(alphabetical);
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
 bottomInner.style.width=Math.max(timeline.scrollWidth,timeline.clientWidth)+'px';
}
function richText(value){
 return String(value||'').split(/(\[\[[a-z0-9_-]+\|[^\]]+\]\])/g).map(part=>{
  const m=part.match(/^\[\[([a-z0-9_-]+)\|([^\]]+)\]\]$/);
  if(!m)return esc(part);
  const id=m[1],name=m[2];
  if(!byId[id])return esc(name);
  return '<a class="composer-link" href="#" data-add-compare="'+esc(id)+'" title="Ajouter '+esc(name)+' au comparateur">'+esc(name)+'</a>';
 }).join('');
}
function renderWorks(value){
 const lines=String(value||'').split('\n').map(s=>s.trim()).filter(Boolean);
 let html='',items=[];
 const flush=()=>{if(items.length){html+='<ul>'+items.map(item=>'<li>'+esc(item)+'</li>').join('')+'</ul>';items=[]}};
 for(const line of lines){
  if(!line.includes(' — ')&&!line.includes(' – ')&&!line.includes('(') && line===line.toLocaleUpperCase('fr')){
   flush();html+='<h4>'+esc(line)+'</h4>';
  }else items.push(line);
 }
 flush();return html;
}
function showDetails(id){
 const p=byId[id];if(!p)return;selected=id;render();
 details.innerHTML='<div class="notice-heading"><div><div class="eyebrow">NOTICE BIOGRAPHIQUE</div><div class="meta">'+esc(p.era)+' · '+esc(dateText(p))+'</div><h2>'+esc(p.name)+'</h2></div><button class="notice-close" type="button" aria-label="Fermer la notice" title="Fermer la notice">×</button></div><p>'+richText(p.description)+'</p><section class="works-section"><h3>ŒUVRES PRINCIPALES</h3>'+renderWorks(p.works)+'</section>';
 details.querySelector('.notice-close').addEventListener('click',closeDetails);
 details.querySelectorAll('[data-add-compare]').forEach(link=>link.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();const id=link.dataset.addCompare;if(!compared.includes(id)){compared.push(id);renderComparison()}}));
}
function closeDetails(){selected=null;details.innerHTML='<div class="eyebrow">NOTICE BIOGRAPHIQUE</div><h2>Choisissez une ligne de vie</h2><p>La notice est fermée. Sélectionnez un compositeur dans la frise pour en afficher une nouvelle.</p>';render();}
function renderComparison(){
 const old=document.getElementById('comparison-visual');if(old)old.remove();
 compareClear.disabled=compared.length===0;
 const dated=compared.map(id=>byId[id]).filter(p=>p&&Number.isFinite(p.birth));
 if(!dated.length)return;
 const currentYear=new Date().getFullYear();
 const rangeStart=Math.min(...dated.map(p=>p.birth));
 const rangeEnd=Math.max(...dated.map(p=>Number.isFinite(p.death)&&p.death>=p.birth?p.death:currentYear));
 const span=Math.max(1,rangeEnd-rangeStart+1);
 const panel=document.createElement('div');panel.id='comparison-visual';panel.className='comparison-visual';
 const axis=document.createElement('div');axis.className='comparison-axis';
 const axisName=document.createElement('div');axisName.className='comparison-name-spacer';
 const axisYears=document.createElement('div');axisYears.className='comparison-axis-years';
 axisYears.innerHTML='<span>'+rangeStart+'</span><span>'+Math.round((rangeStart+rangeEnd)/2)+'</span><span>'+rangeEnd+'</span>';
 axis.append(axisName,axisYears);panel.append(axis);
 dated.forEach(p=>{
  const lifeEnd=Number.isFinite(p.death)&&p.death>=p.birth?p.death:currentYear;
  const row=document.createElement('div');row.className='comparison-row';
  const name=document.createElement('div');name.className='comparison-person';
  const remove=document.createElement('button');remove.type='button';remove.className='comparison-remove';remove.textContent='×';remove.title='Retirer '+p.name+' du comparateur';remove.setAttribute('aria-label','Retirer '+p.name+' du comparateur');
  remove.addEventListener('click',()=>{compared=compared.filter(id=>id!==p.id);renderComparison()});
  const label=document.createElement('span');label.textContent=p.name+' · '+dateText(p);
  name.append(remove,label);
  const track=document.createElement('div');track.className='comparison-track';
  const bar=document.createElement('span');bar.className='comparison-life '+(Number.isFinite(p.death)?'':'is-open');
  bar.style.left=((p.birth-rangeStart)/span*100)+'%';bar.style.width=(Math.max(0,lifeEnd-p.birth+1)/span*100)+'%';
  track.append(bar);row.append(name,track);panel.append(row);
 });
 const section=document.getElementById('notice-compare');section.after(panel);
}
search.addEventListener('input',render);group.addEventListener('change',render);reset.addEventListener('click',()=>{search.value='';group.value='all';render()});
compareSelect.addEventListener('change',()=>{const id=compareSelect.value;if(id&&!compared.includes(id))compared.push(id);compareSelect.value='';renderComparison()});
compareClear.addEventListener('click',()=>{compared=[];renderComparison()});
let syncing=false;
function updateBottomWidth(){bottomInner.style.width=Math.max(timeline.scrollWidth,timeline.clientWidth)+'px';bottom.scrollLeft=timeline.scrollLeft}
timeline.addEventListener('scroll',()=>{if(syncing)return;syncing=true;bottom.scrollLeft=timeline.scrollLeft;syncing=false},{passive:true});
bottom.addEventListener('scroll',()=>{if(syncing)return;syncing=true;timeline.scrollLeft=bottom.scrollLeft;syncing=false},{passive:true});
window.addEventListener('resize',updateBottomWidth);
render();renderComparison();updateBottomWidth();
})();