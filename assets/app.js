const KEYS={providers:'cop.providers',requests:'cop.requests',matches:'cop.matches'};
const read=(key)=>JSON.parse(localStorage.getItem(key)||'[]');
const write=(key,value)=>localStorage.setItem(key,JSON.stringify(value));
const id=(prefix)=>`${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,6)}`;
const formData=(form)=>Object.fromEntries(new FormData(form).entries());
const normalizeCodes=(value='')=>value.split(',').map(v=>v.trim()).filter(Boolean);

function addProvider(data){const providers=read(KEYS.providers);providers.unshift({id:id('P'),createdAt:new Date().toISOString(),...data,postalCodes:normalizeCodes(data.postalCodes)});write(KEYS.providers,providers);render();}
function addRequest(data,source){const requests=read(KEYS.requests);requests.unshift({id:id('R'),createdAt:new Date().toISOString(),status:'OPEN',source,...data});write(KEYS.requests,requests);render();}
function compatible(provider,request){const zip=(request.postalCode||'').trim();const zipOk=(provider.postalCodes||[]).includes(zip);const serviceOk=provider.service===request.service;const accepting=provider.accepting!=='Nein';const timeOk=provider.availability==='Flexibel'||provider.availability==='Einzelne Slots'||provider.availability===request.timeWindow;const requestFunding=request.funding||'';const fundingOpen=['Noch zu klären','Noch unklar'].includes(requestFunding);const fundingOk=provider.funding==='Beides'||provider.funding==='Noch zu klären'||fundingOpen||(provider.funding.includes('§45b')&&requestFunding.includes('§45b'))||requestFunding==='Selbstzahler';return zipOk&&serviceOk&&accepting&&timeOk&&fundingOk;}
function proposals(){const providers=read(KEYS.providers),requests=read(KEYS.requests).filter(r=>r.status==='OPEN');return requests.flatMap(r=>providers.filter(p=>compatible(p,r)).map(p=>({request:r,provider:p})));}
function confirmMatch(requestId,providerId){const requests=read(KEYS.requests),providers=read(KEYS.providers);const req=requests.find(r=>r.id===requestId),pro=providers.find(p=>p.id===providerId);if(!req||!pro)return;req.status='MATCHED';req.providerId=providerId;write(KEYS.requests,requests);const matches=read(KEYS.matches);matches.unshift({id:id('M'),requestId,providerId,createdAt:new Date().toISOString()});write(KEYS.matches,matches);render();}
function esc(value=''){return String(value).replace(/[&<>'\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','\"':'&quot;'}[c]));}
function fmtDate(value){return new Intl.DateTimeFormat('de-DE',{day:'2-digit',month:'2-digit'}).format(new Date(value));}

async function submitFamilyRequest(data){
  const config=window.CARE_OVERFLOW_CONFIG||{};
  if(!config.url||!config.publishableKey) throw new Error('Backend-Konfiguration fehlt.');
  const response=await fetch(`${config.url}/rest/v1/rpc/submit_care_request`,{
    method:'POST',
    headers:{'Content-Type':'application/json','apikey':config.publishableKey,'Authorization':`Bearer ${config.publishableKey}`},
    body:JSON.stringify({
      p_postal_code:data.postalCode,
      p_service:data.service,
      p_rhythm:data.frequency||null,
      p_time_window:data.timeWindow||null,
      p_care_level:data.careLevel||null,
      p_financing:data.funding||null,
      p_contact_email:data.email
    })
  });
  if(!response.ok){const detail=await response.text();console.error('Care request failed',response.status,detail);throw new Error('Die Anfrage konnte nicht gesendet werden.');}
  return response.json();
}

function render(){const providers=read(KEYS.providers),requests=read(KEYS.requests),matches=read(KEYS.matches);const open=requests.filter(r=>r.status==='OPEN');document.querySelector('#metric-providers').textContent=providers.length;document.querySelector('#metric-open').textContent=open.length;document.querySelector('#metric-matched').textContent=matches.length;document.querySelector('#metric-rate').textContent=requests.length?`${Math.round(matches.length/requests.length*100)}%`:'0%';
const pList=document.querySelector('#providers-list');pList.innerHTML=providers.length?providers.map(p=>`<div class="list-row"><div class="row-top"><strong>${esc(p.name)}</strong><span class="pill">${esc(p.accepting)}</span></div><div class="meta">${esc((p.postalCodes||[]).join(', '))} · ${esc(p.service)} · ${esc(p.availability)} · ${esc(p.funding)}</div></div>`).join(''):'<div class="list-empty">Noch keine Anbieter.</div>';
const rList=document.querySelector('#requests-list');rList.innerHTML=requests.length?requests.map(r=>`<div class="list-row"><div class="row-top"><strong>${esc(r.id)}</strong><span class="pill ${r.status.toLowerCase()}">${r.status}</span></div><div class="meta">${esc(r.postalCode)} · ${esc(r.service)} · ${esc(r.frequency||'')} · ${esc(r.timeWindow)} · ${esc(r.funding)} · ${fmtDate(r.createdAt)}</div></div>`).join(''):'<div class="list-empty">Noch keine lokalen Anfragen.</div>';
const mList=document.querySelector('#matches-list');const props=proposals();mList.innerHTML=props.length?props.map(({request,provider})=>`<div class="match-item"><div><strong>${esc(request.id)} → ${esc(provider.name)}</strong><div class="meta">${esc(request.postalCode)} · ${esc(request.service)} · ${esc(request.timeWindow)} · ${esc(provider.funding)}</div></div><button class="button primary" data-match-request="${esc(request.id)}" data-match-provider="${esc(provider.id)}">Match bestätigen</button></div>`).join(''):'<div class="list-empty">Keine offenen kompatiblen lokalen Match-Vorschläge.</div>';
document.querySelectorAll('[data-match-request]').forEach(btn=>btn.addEventListener('click',()=>confirmMatch(btn.dataset.matchRequest,btn.dataset.matchProvider)));}

document.querySelector('#provider-form').addEventListener('submit',e=>{e.preventDefault();addProvider(formData(e.currentTarget));e.currentTarget.reset();document.querySelector('#provider-message').textContent='Kapazität wurde lokal für den Pilot gespeichert.';});
document.querySelector('#overflow-form').addEventListener('submit',e=>{e.preventDefault();addRequest(formData(e.currentTarget),'PROVIDER_OVERFLOW');e.currentTarget.reset();document.querySelector('#overflow-message').textContent='Overflow-Anfrage wurde lokal in den Pilot-Matching-Pool aufgenommen.';});
document.querySelector('#family-form').addEventListener('submit',async e=>{
  e.preventDefault();
  const form=e.currentTarget,button=form.querySelector('button[type="submit"]'),message=document.querySelector('#family-message');
  const data=formData(form);button.disabled=true;button.classList.add('loading');message.className='form-message';message.textContent='Anfrage wird sicher übertragen …';
  try{
    const requestId=await submitFamilyRequest(data);
    form.reset();message.className='form-message success';message.textContent=`Anfrage erfolgreich übermittelt. Referenz: ${String(requestId).replaceAll('"','')}`;
  }catch(error){console.error(error);message.className='form-message error';message.textContent='Die Anfrage konnte gerade nicht übertragen werden. Bitte versuche es erneut.';}
  finally{button.disabled=false;button.classList.remove('loading');}
});
document.querySelector('#seed-demo').addEventListener('click',()=>{write(KEYS.providers,[{id:'P-DEMO-1',createdAt:new Date().toISOString(),name:'Demo Alltagshilfe Ulm',email:'demo@example.de',phone:'',state:'Baden-Württemberg',postalCodes:['89079','89077'],service:'Haushaltshilfe',funding:'§45b möglich',accepting:'Ja',availability:'Vormittags',notes:'Dienstag/Donnerstag'}]);write(KEYS.requests,[{id:'R-DEMO-1',createdAt:new Date().toISOString(),status:'OPEN',source:'PROVIDER_OVERFLOW',postalCode:'89079',service:'Haushaltshilfe',frequency:'Wöchentlich',duration:'2 Stunden',timeWindow:'Vormittags',funding:'§45b',start:'So schnell wie möglich'}]);write(KEYS.matches,[]);render();});
document.querySelector('#clear-data').addEventListener('click',()=>{if(confirm('Lokale Pilot-Testdaten wirklich löschen?')){Object.values(KEYS).forEach(k=>localStorage.removeItem(k));render();}});
document.querySelector('#export-data').addEventListener('click',()=>{const payload={exportedAt:new Date().toISOString(),providers:read(KEYS.providers),requests:read(KEYS.requests),matches:read(KEYS.matches)};const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`care-overflow-pilot-${new Date().toISOString().slice(0,10)}.json`;a.click();URL.revokeObjectURL(url);});
render();
