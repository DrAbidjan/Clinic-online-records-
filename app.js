/* Clinic Patient Records – © 2026 Dr Abid Ali, Forensic Odontologist. All rights reserved.
   Proprietary software: copying, resale, changing or publishing without written permission is not allowed. */
(function(){
/* Clinic Patient Records.
   Device version: records stay on the device (local-db.js).
   Online version: records are shared through Supabase; its two values are in config.js. */
const CONFIG=window.CLINIC_CONFIG||{SUPABASE_URL:'',SUPABASE_ANON_KEY:''};
const LOCAL=!!window.__LOCAL_DB;
/* Seller details shown on the Activation screen. Fill these in (keep the quote marks). */
const APP_VERSION='20 Oct 2026 · Hospital registration';
const SELLER={name:'',whatsapp:'03113124533',price:'Rs 25,000'};

const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pad=n=>String(n).padStart(2,'0');
const today=()=>{const d=new Date();return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())};
const uid=()=>Math.random().toString(36).slice(2,10);
const uuid=()=>{if(crypto.randomUUID)return crypto.randomUUID();const b=crypto.getRandomValues(new Uint8Array(16));b[6]=b[6]&15|64;b[8]=b[8]&63|128;const h=[...b].map(x=>x.toString(16).padStart(2,'0')).join('');return h.slice(0,8)+'-'+h.slice(8,12)+'-'+h.slice(12,16)+'-'+h.slice(16,20)+'-'+h.slice(20)};
const isUUID=s=>/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s||'');
const fmtDate=d=>{if(!d)return '';const [y,m,dd]=String(d).slice(0,10).split('-');return `${dd}/${m}/${y}`};
const fmtTime=t=>{if(!t)return '';const d=new Date(t);return fmtDate(d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate()))+' '+pad(d.getHours())+':'+pad(d.getMinutes())};
const money=n=>'Rs '+Math.round(Number(n)||0).toLocaleString('en-US');
const age=dob=>{if(!dob)return '';const b=new Date(dob),n=new Date();let a=n.getFullYear()-b.getFullYear();if(n<new Date(n.getFullYear(),b.getMonth(),b.getDate()))a--;return a};
/* Online and offline apps can live on the same website address, so each keeps its own small settings. */
const OWNER_TEST=!!window.__OWNER_TEST;
const LS_NS=OWNER_TEST?'ownertest:':window.__LOCAL_DB?'offline:':'';
const lsGet=k=>{try{return localStorage.getItem(LS_NS+k)}catch(e){return null}};
const lsSet=(k,v)=>{try{localStorage.setItem(LS_NS+k,v)}catch(e){}};

/* ---------- clinical reference data ---------- */
const STATUS=[
 {k:'',label:'Present',de:'',col:''},
 {k:'crown',label:'Crown',de:'CR',col:'--t-crown'},
 {k:'missing',label:'Missing',de:'MIS',col:'--t-missing'},
 {k:'implant',label:'Implant',de:'IMPL',col:'--t-implant'},
 {k:'abut',label:'Bridge abutment',de:'ABT',col:'--t-bridge'},
 {k:'bridge',label:'Bridge pontic',de:'PON',col:'--t-bridge'},
 {k:'veneer',label:'Veneer',de:'VEN',col:'--t-ven'},
 {k:'impacted',label:'Impacted',de:'IMP',col:'--t-imp'},
 {k:'partial',label:'Partially erupted',de:'PE',col:'--t-pe'},
 {k:'unerupted',label:'Unerupted',de:'UE',col:'--t-ue'},
 {k:'root',label:'Retained root',de:'RR',col:'--t-rr'},
 {k:'ext',label:'For extraction',de:'XLA',col:'--t-ext'},
 {k:'frac',label:'Fractured',de:'FX',col:'--t-frac'}
];
/* Impaction details (Winter's angulation; Pell & Gregory level and ramus class) and mobility */
const IMP_ANG=['Mesioangular','Distoangular','Vertical','Horizontal','Buccoangular','Linguoangular','Inverted'];
const IMP_DEPTH=['Level A','Level B','Level C'];
const IMP_CLASS=['Class I','Class II','Class III'];
const MOB=['','I','II','III'];
/* Crown / bridge / veneer materials */
const PROS_MATS=[['PFM','Porcelain fused to metal (PFM)'],['ZR','Zirconia'],['EMX','E-max (lithium disilicate)'],['CER','Full ceramic / porcelain'],['FM','Full metal'],['AU','Gold'],['TMP','Acrylic / temporary']];
const PM=Object.fromEntries(PROS_MATS);
const MAT_FILL={PFM:'#efe6d2',ZR:'#f6f7f4',EMX:'#f3e8d6',CER:'#f8f2e6',FM:'#a3adb4',AU:'#e2b33c',TMP:'#f5b77a'};
const PROS_ST=['crown','abut','bridge','veneer','implant'];
/* Tooth sets (FDI). Primary (milk) teeth: quadrants 5–8, positions 1–5. */
const PERM={UR:[18,17,16,15,14,13,12,11],UL:[21,22,23,24,25,26,27,28],LR:[48,47,46,45,44,43,42,41],LL:[31,32,33,34,35,36,37,38]};
const PRIM={UR:[55,54,53,52,51],UL:[61,62,63,64,65],LR:[85,84,83,82,81],LL:[71,72,73,74,75]};
const ALL_TEETH=[...PERM.UR,...PERM.UL,...PRIM.UR,...PRIM.UL,...PRIM.LR,...PRIM.LL,...PERM.LR,...PERM.LL];
const isPrim=n=>Math.floor(n/10)>=5;
const DENT={perm:'Permanent',mixed:'Mixed dentition',prim:'Milk teeth (primary)'};
function autoDent(p){const a=p.dob?age(p.dob):null;if(a===null||a==='')return 'perm';return a<6?'prim':a<13?'mixed':'perm'}
const ST=Object.fromEntries(STATUS.map(s=>[s.k,s]));
const MODES=[
 {k:'caries',label:'Caries',col:'--t-caries'},
 {k:'fill',label:'Filling',col:''},
 {k:'sec',label:'Secondary caries',col:'--t-sec'},
 {k:'defect',label:'Fracture / defect',col:'--t-frac'},
 {k:'clear',label:'Clear',col:''}
];
const MATS=[
 {k:'comp',label:'Composite',col:'--t-fill',proc:'Filling – composite'},
 {k:'amal',label:'Amalgam',col:'--t-amal',proc:'Filling – amalgam'},
 {k:'gic',label:'Glass ionomer',col:'--t-gic',proc:'Filling – GIC'},
 {k:'cer',label:'Ceramic inlay',col:'--t-cer',proc:'Inlay / onlay'},
 {k:'gold',label:'Gold inlay',col:'--t-gold',proc:'Inlay / onlay'},
 {k:'temp',label:'Temporary',col:'--t-temp',proc:'Filling – composite'}
];
const MT=Object.fromEntries(MATS.map(m=>[m.k,m]));
const SURF_ORDER=['M','O','D','B','L'];
const isUpper=n=>[1,2,5,6].includes(Math.floor(n/10));
const isAnt=n=>n%10<=3;
function surfLabel(n,k){if(k==='O')return isAnt(n)?'I':'O';if(k==='B')return isAnt(n)?'La':'B';if(k==='L')return isUpper(n)?'P':'L';return k}
function surfName(n,k){return {M:'Mesial',D:'Distal',O:isAnt(n)?'Incisal':'Occlusal',B:isAnt(n)?'Labial':'Buccal',L:isUpper(n)?'Palatal':'Lingual'}[k]}
function surfMap(n){const q=Math.floor(n/10),up=[1,2,5,6].includes(q),mr=[1,4,5,8].includes(q);return {top:up?'B':'L',bottom:up?'L':'B',left:mr?'D':'M',right:mr?'M':'D',center:'O'}}
function surfColor(v){if(v.t==='caries')return '--t-caries';if(v.t==='sec')return '--t-sec';if(v.t==='defect')return '--t-frac';return (MT[v.m]||MT.comp).col}
function surfStr(n,keys){return SURF_ORDER.filter(k=>keys.includes(k)).map(k=>surfLabel(n,k)).join('')}
function toothName(n){const q=Math.floor(n/10),pos=n%10;
  if(q>=5)return ['','','','','','Upper right','Upper left','Lower left','Lower right'][q]+' primary '+['','central incisor','lateral incisor','canine','first molar','second molar'][pos];
  return ['','Upper right','Upper left','Lower left','Lower right'][q]+' '+['','central incisor','lateral incisor','canine','first premolar','second premolar','first molar','second molar','third molar'][pos]}
function summaryOf(p,n){
  const sf=(p.surf&&p.surf[n])||{},g={};
  for(const k in sf){const v=sf[k],key=v.t+'|'+(v.t==='fill'||v.t==='sec'?v.m:'');(g[key]=g[key]||[]).push(k)}
  return Object.entries(g).map(([key,ks])=>{const [t,m]=key.split('|');const s=surfStr(n,ks);
    if(t==='caries')return {s,txt:'Caries'};
    if(t==='defect')return {s,txt:'Fracture / defect'};
    if(t==='sec')return {s,txt:'Secondary caries under '+(MT[m]||MT.comp).label.toLowerCase()};
    return {s,txt:(MT[m]||MT.comp).label+' filling'};});
}
const MH=[
 ['heart','Heart problems (angina, heart attack, murmur, heart failure)'],
 ['bp','High or low blood pressure'],
 ['endo','Artificial heart valve, previous endocarditis or rheumatic fever'],
 ['pacemaker','Pacemaker or other implanted device'],
 ['bleed','Bleeding disorder or bleeds for a long time after cuts'],
 ['anticoag','Blood thinners (warfarin, clopidogrel, aspirin, apixaban, rivaroxaban)'],
 ['bisphos','Bone medicines, e.g. bisphosphonates or denosumab'],
 ['diabetes','Diabetes'],
 ['asthma','Asthma, COPD or other breathing problems'],
 ['epilepsy','Epilepsy or fits'],
 ['hep','Hepatitis B or C'],
 ['liver','Other liver disease or jaundice'],
 ['kidney','Kidney disease'],
 ['infect','HIV, TB or other infectious disease'],
 ['thyroid','Thyroid problems'],
 ['radio','Radiotherapy or chemotherapy (especially head and neck)'],
 ['steroids','Steroid treatment in the last 2 years'],
 ['allergy','Allergies (penicillin, latex, local anaesthetic, other)'],
 ['pregnant','Pregnant or breastfeeding'],
 ['other','Any other illness, operation or hospital stay']
];
const ALERT_KEYS={endo:'Endocarditis risk',anticoag:'Anticoagulant',bleed:'Bleeding disorder',bisphos:'MRONJ risk',allergy:'Allergy',pacemaker:'Pacemaker',diabetes:'Diabetes',epilepsy:'Epilepsy',hep:'Hepatitis B/C',pregnant:'Pregnant / breastfeeding',radio:'Radiotherapy',infect:'Infection control',heart:'Cardiac'};
const PROCS=[
 'Examination & diagnosis','Radiograph (BW / PA)','OPG','Scale & polish','Periodontal therapy (RSD)','Fluoride / fissure sealant',
 'Filling – composite','Filling – amalgam','Filling – GIC','Root canal treatment','Pulpotomy','Pulpectomy','RCT – complete cleaning, shaping & obturation','Intracanal medicament (when indicated)','Secure temporary restoration','Post & core','Crown – zirconia','Crown – PFM','Crown – full metal',
 'Crown – E-max','Crown – full ceramic','Bridge – PFM','Bridge – zirconia','Bridge – E-max','Bridge – full metal','Veneer','Inlay / onlay','Extraction','Surgical extraction','Implant placement','Implant crown','Pulpotomy (primary tooth)','Pulpectomy (primary tooth)','Stainless steel crown (SSC)','Space maintainer','Operculectomy','Exposure & bonding (impacted tooth)','Partial denture (acrylic)','Partial denture (cobalt chrome)','Complete denture','Night guard','Whitening','Review / recall'
];
const ENDO_PHASE1=['Pulpotomy','Pulpectomy','Pulpotomy (primary tooth)','Pulpectomy (primary tooth)','RCT – complete cleaning, shaping & obturation','Intracanal medicament (when indicated)','Secure temporary restoration'];
const PHASES=[[1,'Urgent / relief of pain & endodontic'],[2,'Stabilisation & hygiene'],[3,'Restorative'],[4,'Prosthetic & replacement'],[5,'Maintenance & recall']];
const BPE_OPTS=['','0','1','2','3','4','*','X'];
const REG_BODIES=['Punjab Healthcare Commission (PHC)','Sindh Healthcare Commission (SHCC)','KP Health Care Commission (KP-HCC)','Islamabad Healthcare Regulatory Authority (IHRA)','Other'];
const regShort=b=>{const m=String(b||'').match(/\(([^)]+)\)/);return m?m[1]:(b&&b!=='Other'?b:'')};
function regLine(c){c=c||clinic||{};return [c.reg_no?((regShort(c.reg_body)?regShort(c.reg_body)+' ':'')+'Reg. No. '+c.reg_no):'',c.ntn?'NTN '+c.ntn:''].filter(Boolean).join('  ·  ')}
const pmdcOf=m=>m&&m.pmdc?'PMDC No. '+m.pmdc:'';
const dentistLine=m=>m?(m.name+(m.pmdc?' ('+pmdcOf(m)+')':'')):'';
function regFields(prefix,c,ro){c=c||{};const hh=prefix==='cc'&&typeof hospMode==='function'&&hospMode();return `<div class="grid2">
  <label class="f"><span>Registered with (healthcare commission)</span><select id="${prefix}-regbody" ${ro?'disabled':''}><option value="">—</option>${REG_BODIES.map(b=>`<option ${c.reg_body===b?'selected':''}>${b}</option>`).join('')}</select></label>
  <label class="f"><span>${hh?'Hospital registration / licence no.':'Clinic registration / licence no.'}</span><input type="text" id="${prefix}-regno" value="${esc(c.reg_no||'')}" ${ro?'readonly':''}></label>
  <label class="f"><span>NTN (optional)</span><input type="text" id="${prefix}-ntn" value="${esc(c.ntn||'')}" ${ro?'readonly':''}></label></div>`}
const INSURANCE=['','Self-pay','Sehat Card','Company / panel','Private insurance','Other'];

function blankPatient(){return {id:uuid(),first:'New',last:'Patient',dob:'',sex:'',phone:'',email:'',address:'',cnic:'',insurance:'',insNo:'',gp:'',emergency:'',mh:{date:'',answers:{},meds:'',smoke:'',tobacco:'',alcohol:'',signed:false},chart:{},surf:{},rct:{},toothNotes:{},bpe:['','','','','',''],bpeDate:'',plan:[],planConsent:{agreed:false,date:''},notes:[]}}
function sample(){
  return {id:uuid(),example:true,first:'Example',last:'Patient',dob:'1979-04-17',sex:'F',phone:'0300 0000000',email:'',address:'House 12, Street 4, F-7, Islamabad',cnic:'',insurance:'Self-pay',insNo:'',gp:'Dr S. Ahmed, City Clinic',emergency:'Husband – 0300 0000001',
   mh:{date:today(),answers:{bp:{v:'y',d:'Amlodipine 5 mg'},anticoag:{v:'y',d:'Clopidogrel 75 mg – check with physician before extraction'},allergy:{v:'y',d:'Penicillin – rash'},hep:{v:'n'},diabetes:{v:'n'}},meds:'Amlodipine 5 mg od, Clopidogrel 75 mg od',smoke:'No',tobacco:'Naswar daily for 10 years',alcohol:'No',signed:true},
   chart:{16:'crown',36:'missing',38:'ext',11:'frac'},rct:{16:true,46:true},
   surf:{17:{O:{t:'fill',m:'amal'},D:{t:'fill',m:'amal'}},26:{M:{t:'caries'},O:{t:'caries'}},47:{O:{t:'fill',m:'comp'}},46:{M:{t:'fill',m:'comp'},O:{t:'fill',m:'comp'},D:{t:'fill',m:'comp'}},25:{O:{t:'fill',m:'amal'},D:{t:'sec',m:'amal'}},12:{M:{t:'fill',m:'comp'}}},
   toothNotes:{26:'MO deep, sensitive to cold',38:'Partially erupted, recurrent pericoronitis'},
   bpe:['2','2','3','3','2','2'],bpeDate:today(),
   plan:[
     {id:uid(),tooth:'38',proc:'Surgical extraction',surf:'',phase:1,fee:15000,status:'planned'},
     {id:uid(),tooth:'',proc:'Periodontal therapy (RSD)',surf:'',phase:2,fee:12000,status:'planned'},
     {id:uid(),tooth:'26',proc:'Filling – composite',surf:'MO',phase:3,fee:6000,status:'planned'},
     {id:uid(),tooth:'47',proc:'Filling – composite',surf:'O',phase:3,fee:5000,status:'completed',doneDate:today()},
     {id:uid(),tooth:'11',proc:'Crown – zirconia',surf:'',phase:4,fee:35000,status:'planned'},
     {id:uid(),tooth:'36',proc:'Implant placement',surf:'',phase:4,fee:150000,status:'planned'}
   ],
   planConsent:{agreed:false,date:''},
   notes:[{id:uid(),date:today(),title:'Examination',by:'',text:'C/O: pain lower left back, 3 days.\nO/E: 38 partially erupted, operculum inflamed. 26 MO caries. Naswar user – oral mucosa checked, no lesions. BPE 2/2/3 – 3/2/2.\nRx: irrigation, OHI, tobacco cessation advice.\nPlan: see treatment plan. Review 2 weeks.'}]};
}
function renameProc(n){n=String(n||'');
  if(/^Botox\b/i.test(n))return n.replace(/^Botox\b/i,'Botulinum toxin (anti-wrinkle)');
  if(n==='Hydra facial (hydradermabrasion)'||/^hydra ?facial$/i.test(n))return 'Hydradermabrasion facial';
  return n}
function migrate(p){
  p.chart=p.chart||{};p.surf=p.surf||{};p.rct=p.rct||{};p.toothNotes=p.toothNotes||{};p.imp=p.imp||{};p.mob=p.mob||{};p.pros=p.pros||{};p.plan=p.plan||[];p.notes=p.notes||[];
  p.bpe=p.bpe||['','','','','',''];p.planConsent=p.planConsent||{agreed:false,date:''};
  p.mh=p.mh||{date:'',answers:{},meds:'',smoke:'',tobacco:'',alcohol:'',signed:false};p.mh.answers=p.mh.answers||{};
  for(const t in p.chart){const s=p.chart[t];
    if(s==='caries'){p.surf[t]=p.surf[t]||{O:{t:'caries'}};delete p.chart[t];}
    else if(s==='fill'){p.surf[t]=p.surf[t]||{O:{t:'fill',m:'comp'}};delete p.chart[t];}
    else if(s==='rct'){p.rct[t]=true;delete p.chart[t];}}
  // old brand names in treatment plans -> neutral names (Oct 2026). Clinical notes are never changed.
  p.plan.forEach(i=>{const n=renameProc(i.proc);if(n!==i.proc){i.proc=n;p._renamed=true}});
  return p;
}

/* ---------- app state ---------- */
let sb=null,user=null,memberships=[],clinic=null,me=null,team=[],chan=null,recovering=false;
let db={patients:[]};
let view={screen:'loading',pid:null,tab:'details',tooth:null,q:'',confirm:null,msg:null,authTab:'login'};
const configured=LOCAL||(/^https:\/\//.test(CONFIG.SUPABASE_URL||'')&&String(CONFIG.SUPABASE_ANON_KEY||'').length>20);

/* Soft UI sounds made in the browser (no sound files). Switch on/off in the sidebar or Clinic & account. */
/* Sounds: all tones are made by the browser (no sound files). Each computer chooses its own tones and volume. */
const TONES={
  none:{label:'No sound',n:[]},
  tick:{label:'Soft tick',n:[[1250,.05,'triangle',.6]]},
  pop:{label:'Pop',n:[[880,.06,'sine',.7]]},
  chime:{label:'Chime (rising)',n:[[660,.14,'sine',1],[990,.22,'sine',.85,.09]]},
  dingdong:{label:'Ding-dong (door bell)',n:[[988,.35,'sine',1],[784,.5,'sine',.9,.28]]},
  bell:{label:'Bell',n:[[1046,.9,'sine',.9],[2093,.6,'sine',.25],[1568,.7,'sine',.2,.01]]},
  triple:{label:'Three beeps',n:[[1175,.08,'square',.35],[1175,.08,'square',.35,.14],[1175,.08,'square',.35,.28]]},
  marimba:{label:'Marimba',n:[[523,.18,'triangle',1],[659,.18,'triangle',.9,.12],[784,.3,'triangle',.9,.24]]},
  soft:{label:'Soft low note',n:[[392,.45,'sine',.9]]},
  alert:{label:'Alert',n:[[880,.12,'sawtooth',.35],[660,.12,'sawtooth',.35,.15],[880,.12,'sawtooth',.35,.3],[660,.18,'sawtooth',.35,.45]]},
  low:{label:'Low buzz',n:[[220,.18,'square',.5],[165,.24,'square',.45,.12]]}
};
const SOUND_EVENTS=[['arrival','Patient arrived','dingdong'],['message','New message','chime'],['success','Saved / done','chime'],['error','Problem / warning','low'],['click','Button tap','tick']];
const Sound={ctx:null,on:lsGet('sound')!=='off',
  get(){if(!this.ctx){const A=window.AudioContext||window.webkitAudioContext;if(!A)return null;this.ctx=new A()}if(this.ctx.state==='suspended')this.ctx.resume();return this.ctx},
  vol(){const v=parseFloat(lsGet('soundVol'));return isNaN(v)?0.7:Math.min(1,Math.max(0,v))},
  tone(freq,dur,type,vol,delay){const c=this.get();if(!c)return;const t0=c.currentTime+(delay||0);const o=c.createOscillator(),g=c.createGain();
    o.type=type||'sine';o.frequency.setValueAtTime(freq,t0);g.gain.setValueAtTime(0.0001,t0);g.gain.exponentialRampToValueAtTime(Math.max(0.0002,vol||0.06),t0+0.008);g.gain.exponentialRampToValueAtTime(0.0001,t0+dur);
    o.connect(g).connect(c.destination);o.start(t0);o.stop(t0+dur+0.02)},
  preset(name,force){const p=TONES[name];if(!p)return;const base=(name==='tick'||name==='pop'?0.05:0.09)*this.vol();try{p.n.forEach(([f,d,t,v,dl])=>this.tone(f,d,t,base*(v||1),dl||0))}catch(e){}},
  toneFor(kind){const ev=SOUND_EVENTS.find(e=>e[0]===kind);return lsGet('tone:'+kind)||(ev?ev[2]:'tick')},
  play(kind){if(!this.on)return;if(kind==='tab')kind='click';this.preset(this.toneFor(kind))},
  toggle(){this.on=!this.on;lsSet('sound',this.on?'on':'off');if(this.on)this.play('success')}
};
/* Clinic logo and screen background (admin sets them; saved for the whole clinic) */
let branding={},brandingId=null,brandingErr='';
const BG_CHOICES=[['','Plain'],['teal','Teal glow'],['sand','Warm sand'],['mint','Fresh mint'],['rose','Soft rose'],['sky','Sky blue'],['slate','Slate'],['custom','My own colour'],['photo','My own photo']];
async function loadBranding(){
  try{const {data,error}=await sb.from('finance').select('*').eq('clinic_id',clinic.id).eq('kind','branding');if(error)throw error;
    const r=(data||[])[0];branding=r?(r.data||{}):{};brandingId=r?r.id:null;brandingErr=''}
  catch(e){branding={};brandingId=null;brandingErr=/finance|relation|does not exist|schema cache/i.test(e.message||'')?'needsql':friendly(e)}
  applyBranding();
}
function applyBranding(){
  const root=document.documentElement;const bg=branding.bg||'';
  if(bg)root.dataset.bg=bg;else delete root.dataset.bg;
  if(bg==='custom'&&branding.bgColor)root.style.setProperty('--bgcol',branding.bgColor);else root.style.removeProperty('--bgcol');
  if(bg==='photo'&&branding.bgImage)root.style.setProperty('--bgimg',`url("${branding.bgImage}")`);else root.style.removeProperty('--bgimg');
  const th=/^#[0-9a-f]{6}$/i.test(branding.theme||'')?branding.theme:'';
  const names=['--accent','--accent-soft','--side','--side-2','--side-on'];
  if(th){root.style.setProperty('--accent',th);root.style.setProperty('--accent-soft','color-mix(in srgb,'+th+' 16%,var(--paper))');root.style.setProperty('--side','color-mix(in srgb,'+th+' 42%,#000)');root.style.setProperty('--side-2','color-mix(in srgb,'+th+' 30%,#000)');root.style.setProperty('--side-on','color-mix(in srgb,'+th+' 70%,#000)')}
  else names.forEach(n=>root.style.removeProperty(n));
}
const THEMES=[['','Original teal','#1f5f6b'],['#2b5fa8','Blue','#2b5fa8'],['#5b4aa8','Purple','#5b4aa8'],['#2e7d4f','Green','#2e7d4f'],['#b0446b','Rose','#b0446b'],['#b8651b','Orange','#b8651b'],['#44505a','Slate','#44505a'],['custom','My own colour','']];
async function saveBranding(patch){
  const data=Object.assign({},branding,patch);
  if(brandingId){const {error}=await sb.from('finance').update({data}).eq('id',brandingId);if(error)throw error}
  else{const {data:out,error}=await sb.from('finance').insert({clinic_id:clinic.id,kind:'branding',data}).select();if(error)throw error;const r=Array.isArray(out)?out[0]:out;brandingId=r&&r.id}
  branding=data;applyBranding();
}
function resizeImage(file,max,type,quality){return new Promise((res,rej)=>{const img=new Image(),url=URL.createObjectURL(file);
  img.onload=()=>{const k=Math.min(1,max/Math.max(img.width,img.height));const c=document.createElement('canvas');c.width=Math.max(1,Math.round(img.width*k));c.height=Math.max(1,Math.round(img.height*k));
    const g=c.getContext('2d');if(type==='image/jpeg'){g.fillStyle='#fff';g.fillRect(0,0,c.width,c.height)}g.drawImage(img,0,0,c.width,c.height);URL.revokeObjectURL(url);res(c.toDataURL(type,quality))};
  img.onerror=()=>{URL.revokeObjectURL(url);rej(new Error('That picture could not be opened. Use a JPG or PNG.'))};img.src=url})}
const clinicMark=()=>branding.logo?`<img class="clinic-logo" src="${esc(branding.logo)}" alt="${esc(clinic?clinic.name:'')} logo">`:toothMark();

/* ---- Facility type and hospital departments (saved with the clinic branding) ---- */
const DENTAL_DEPTS=['General dentistry','Endodontics (root canal)','Oral & maxillofacial surgery','Orthodontics','Periodontics (gums)','Prosthodontics (crowns, dentures, implants)','Paediatric dentistry','Oral medicine & radiology','Cosmetic & aesthetics'];
const FACILITIES=[['dental_clinic','Dental clinic'],['dental_hospital','Dental hospital (with departments)']];
const deptList=()=>Array.isArray(branding.depts)?branding.depts:[];

/* ---- Pharmacy and laboratory units (attached to a hospital; optional for a clinic) ---- */
const unitsOf=()=>branding.units||{};
const pharmOn=()=>!!unitsOf().pharmacy,labOn=()=>!!unitsOf().lab;
const hospUnits=()=>({units:Object.assign({},unitsOf(),{pharmacy:true,lab:true,phSince:unitsOf().phSince||Date.now(),labSince:unitsOf().labSince||Date.now()})});
const staffIds=u=>Array.isArray(branding[u==='pharmacy'?'pharmaStaff':'labStaff'])?branding[u==='pharmacy'?'pharmaStaff':'labStaff']:[];
function rxWaiting(){const since=unitsOf().phSince||0,out=[];
  db.patients.forEach(p=>(p.rx||[]).forEach(r=>{if((r.at||0)>=since&&!(r.pharm&&r.pharm.status==='given'))out.push({p,r})}));
  return out.sort((a,b)=>(b.r.at||0)-(a.r.at||0))}
function rxGiven(){const out=[];db.patients.forEach(p=>(p.rx||[]).forEach(r=>{if(r.pharm&&r.pharm.status==='given')out.push({p,r})}));return out.sort((a,b)=>(b.r.pharm.at||0)-(a.r.pharm.at||0)).slice(0,15)}
function labWaiting(){const out=[];db.patients.forEach(p=>(p.labs||[]).forEach(l=>{if(l.status!=='done')out.push({p,l})}));return out.sort((a,b)=>(b.l.at||0)-(a.l.at||0))}
function labDone(){const out=[];db.patients.forEach(p=>(p.labs||[]).forEach(l=>{if(l.status==='done')out.push({p,l})}));return out.sort((a,b)=>(b.l.doneAt||0)-(a.l.doneAt||0)).slice(0,15)}
const pharmBadge=()=>pharmOn()?rxWaiting().length:0,labBadge=()=>labOn()?labWaiting().length:0;
async function notifyUnit(unit,text,patientId){
  const ids=staffIds(unit).filter(id=>id!==(user&&user.id));
  for(const id of ids){try{await sendMessage(id,text,{kind:unit==='pharmacy'?'rx':'lab',patient_id:patientId})}catch(e){}}
}
const LAB_KINDS=['Blood test','Biopsy / histopathology','Culture & sensitivity','X-ray report / OPG reading','Crown / bridge / denture (dental lab)','Other'];
const LAB_STAGES=['Received','In progress','Ready for try-in','Quality check','Delivered'];
const waLink=(p,text)=>{let n=String(p.phone||'').replace(/[^\d]/g,'');if(!n)return '';if(n.startsWith('00'))n=n.slice(2);else if(n.startsWith('0'))n='92'+n.slice(1);return 'https://wa.me/'+n+'?text='+encodeURIComponent(text)};
async function labTell(pp,ll,text){const skip=new Set([user.id].concat(staffIds('lab'),staffIds('pharmacy')));const to=new Set((team||[]).map(t=>t.user_id).filter(id=>id&&!skip.has(id)));if(ll.byId&&ll.byId!==user.id)to.add(ll.byId);for(const id of to){try{await sendMessage(id,text,{kind:'labclinic',patient_id:pp.id})}catch(e){}}}
const labCase=p=>{const ini=((p.first||'').slice(0,1)+(p.last||'').slice(0,1)).toUpperCase();const a=p.dob?age(p.dob):'';return esc('Patient '+ini+(a!==''?' · '+a+' yrs':'')+(p.sex==='F'?' · F':p.sex==='M'?' · M':''))};
function pName(p){return esc((p.first||'')+' '+(p.last||''))}
let appOwner=false,ownerCodes=null;
async function loadOwnerFlag(){if(LOCAL){appOwner=false;return}try{const r=await sb.rpc('is_app_owner');appOwner=!r.error&&r.data===true}catch(e){appOwner=false}}
async function loadSignupCodes(){try{const r=await sb.rpc('owner_list_signup_codes');ownerCodes=r.error?null:(r.data||[]);if(r.error)view.ocErr=String(r.error.message||'')}catch(e){ownerCodes=null}}
function ownerCodesPanel(){
  if(!appOwner)return '';
  const rows=(ownerCodes||[]).map(c=>`<div class="member"><span style="flex:1;min-width:0"><b class="invite" style="font-size:1rem">${esc(c.code)}</b><br><span class="small muted">${esc(c.note||'')}${c.used_at?' · used by '+esc(c.clinic||'a clinic')+' on '+fmtDate(String(c.used_at).slice(0,10)):' · not used yet'}</span></span>${c.used_at?'':`<button class="btn small" type="button" data-ocdel="${esc(c.code)}">Delete</button>`}</div>`).join('');
  return `<section class="panel"><h3>Owner: clinic creation codes</h3>
    <p class="small muted" style="margin:0">Nobody can create a clinic without one of your codes. Make a code, send it only to the person you approve. Each code works once.</p>
    <form id="ownerCodeForm" class="row"><input type="text" id="oc-note" placeholder="Who is it for? e.g. Dr Bilal, Smile Clinic" style="flex:1;min-width:200px"><button class="btn primary" type="submit">Make a code</button></form>
    ${view.ocNew?`<div class="msg ok" style="margin:0">New code: <b class="invite" style="font-size:1.2rem">${esc(view.ocNew)}</b> <button class="btn small" type="button" data-act="ocCopy">Copy</button></div>`:''}
    ${view.ocErr?`<div class="msg warn" style="margin:0">${/owner_|is_app_owner|schema cache|does not exist/i.test(view.ocErr)?'Run the new SQL file “supabase-update-access.sql” first.':esc(view.ocErr)}</div>`:''}
    ${ownerCodes===null?'<p class="small muted" style="margin:0">Loading…</p>':rows?`<div class="plist">${rows}</div>`:'<p class="small muted" style="margin:0">No codes yet.</p>'}</section>`}
let staffInv=[];
async function loadInvites(){try{const {data,error}=await sb.from('staff_invites').select('*').eq('clinic_id',clinic.id);staffInv=error?[]:(data||[])}catch(e){staffInv=[]}}
const myInvUnit=()=>{const r=staffInv.find(x=>user&&x.used_by===user.id&&x.unit);return r?r.unit:''};
const isPS=()=>pharmOn()&&!!me&&(staffIds('pharmacy').includes(me.user_id)||myInvUnit()==='pharmacy'),isLS=()=>labOn()&&!!me&&(staffIds('lab').includes(me.user_id)||myInvUnit()==='lab');
const pharmOnly=()=>!!me&&!isAdmin()&&(isPS()||isLS());
function pharmView(){
  const w=rxWaiting(),g=rxGiven();
  return `${clockMini()}<header class="top"><div style="min-width:0"><h1>Pharmacy</h1><div class="sub">${w.length} prescription${w.length===1?'':'s'} waiting ${syncBadge()}</div></div></header>
  ${homeNav('pharm')}
  <section class="panel"><h3>Waiting to be given</h3>
  ${w.length?w.map(({p,r})=>`<div class="hres"><div class="row"><b>${pName(p)}</b><span class="spacer"></span><span class="small muted">${fmtDate(r.date)} · Dr ${esc(String(r.by||'').replace(/^Dr\.?\s*/i,''))}</span></div>
    ${r.diag?`<div class="small muted">${esc(r.diag)}</div>`:''}
    <ul style="margin:0;padding-left:18px">${r.items.map(it=>`<li><b>${esc(it.name)}</b>${it.dose?' – '+esc(it.dose):''}${it.days?' · '+esc(it.days)+(/^\d+$/.test(String(it.days).trim())?' days':''):''}${it.note?' · '+esc(it.note):''}</li>`).join('')}</ul>
    ${r.advice?`<div class="small">${esc(r.advice)}</div>`:''}
    ${penAllergy(p)?'<div class="msg err" style="margin:0">Penicillin allergy – check before giving.</div>':''}
    <div class="row"><button class="btn small primary" data-rxgiven="${p.id}|${r.id}">✓ Mark as given</button>${pharmOnly()?`<button class="btn small" data-pxprint="${p.id}|${r.id}">Print</button><button class="btn small" data-pxopen="${p.id}|${r.id}">Open file</button>`:`<button class="btn small" data-pxprint="${p.id}|${r.id}">Print</button><button class="btn small" data-pxopen="${p.id}|${r.id}">Open file</button><button class="btn small" data-open="${p.id}">Open patient</button>`}</div></div>`).join(''):'<div class="empty">No prescriptions waiting.</div>'}
  </section>
  ${g.length?`<section class="panel"><h3>Recently given</h3><div class="plist">${g.map(({p,r})=>`<div class="member"><span style="flex:1;min-width:0"><b>${pName(p)}</b><br><span class="small muted">${r.items.map(i=>esc(i.name)).join(', ')} · given ${fmtDate(dayOf(r.pharm.at))} by ${esc(r.pharm.by||'')}</span></span></div>`).join('')}</div></section>`:''}`;
}
function labView(){
  const w=labWaiting(),g=labDone();
  return `${clockMini()}<header class="top"><div style="min-width:0"><h1>Laboratory</h1><div class="sub">${w.length} request${w.length===1?'':'s'} waiting ${syncBadge()}</div></div></header>
  ${homeNav('lab')}
  <section class="panel"><h3>Waiting for the lab</h3>
  ${w.length?w.map(({p,l})=>`<div class="hres"><div class="row"><b>${pharmOnly()?labCase(p):pName(p)}</b><span class="spacer"></span><span class="small muted">${fmtDate(l.date)} · ${esc(l.by||'')}</span></div>
    <div><b>${esc(l.what)}</b>${l.note?' – '+esc(l.note):''}</div>
    <label class="f"><span>Stage – the clinic is told when you change it</span><select data-labstage="${p.id}|${l.id}">${LAB_STAGES.slice(0,4).map(x=>`<option ${(l.stage||'Received')===x?'selected':''}>${x}</option>`).join('')}</select></label>
    <label class="f"><span>Result / note for the dentist</span><input type="text" data-labres="${l.id}" placeholder="e.g. Hb 13.2 – normal, report attached in X-rays"></label>
    <div class="row"><button class="btn small primary" data-labdone="${p.id}|${l.id}">✓ Delivered / done</button>${pharmOnly()?'':`<button class="btn small" data-open="${p.id}">Open patient</button>`}</div></div>`).join(''):'<div class="empty">No lab requests waiting.</div>'}
  </section>
  ${g.length?`<section class="panel"><h3>Recently done</h3><div class="plist">${g.map(({p,l})=>`<div class="member"><span style="flex:1;min-width:0"><b>${pharmOnly()?labCase(p):pName(p)}</b> · ${esc(l.what)}<br><span class="small muted">${l.result?esc(l.result)+' · ':''}done ${fmtDate(dayOf(l.doneAt))} by ${esc(l.doneBy||'')}${l.pickedAt?' · picked up by the clinic ✓':''}</span></span></div>`).join('')}</div></section>`:''}`;
}
function labTab(p){
  p.labs=p.labs||[];const ro=isAcct()||readOnly();const list=p.labs.slice().sort((a,b)=>(b.at||0)-(a.at||0));
  return `${ro?'':`<section class="panel"><h3>New lab request</h3>
    <label class="f"><span>What is needed?</span><select id="lab-what">${LAB_KINDS.map(k=>`<option>${k}</option>`).join('')}</select></label>
    <label class="f"><span>Details (optional)</span><input type="text" id="lab-note" placeholder="e.g. HbA1c before extraction · crown shade A2, tooth 36"></label>
    <div class="row"><button class="btn primary" data-act="labAdd">Send to the lab</button>${(staffIds('lab').length)?'':'<span class="small muted">The lab sees it in its list.</span>'}</div></section>`}
  <section class="panel"><h3>Lab requests for this patient</h3>
  ${list.length?`<div class="plist">${list.map(l=>`<div class="member"><span style="flex:1;min-width:0"><b>${esc(l.what)}</b>${l.note?' – '+esc(l.note):''}<br><span class="small muted">${fmtDate(l.date)} · ${esc(l.by||'')}${l.status==='done'?' · result: '+esc(l.result||'done'):''}</span></span><span class="pill ${l.status==='done'?'ok':'warn'}">${l.status==='done'?'Delivered':esc(l.stage||'Waiting')}</span>${l.status==='done'&&!ro&&!l.pickedAt?`<button class="btn small primary" data-labpick="${p.id}|${l.id}" type="button">✓ Picked up</button>`:''}${l.pickedAt?'<span class="pill ok">Picked up</span>':''}${l.status==='done'&&!ro&&waLink(p,'x')?`<a class="btn small" target="_blank" rel="noopener" href="${waLink(p,'Hello '+(p.first||'')+', your '+l.what.toLowerCase()+' is ready at our clinic. Please call us to book your visit.')}">Tell patient on WhatsApp</a>`:''}</div>`).join('')}</div>`:'<div class="empty">No lab requests yet.</div>'}</section>`;
}
function unitLoginHtml(){if(!LOCAL){const rows=staffInv.filter(x=>!x.used_by||x.unit).map(x=>`<div class="member"><span style="flex:1;min-width:0"><b>${esc(x.email)}</b><br><span class="small muted">${x.unit==='lab'?'Laboratory':x.unit==='pharmacy'?'Pharmacy':'Dentist'} · ${x.used_by?'joined ✓':'waiting – has not signed up yet'}</span></span>${x.used_by?'':`<button class="btn small" type="button" data-ivdel="${x.id}">Cancel</button>`}</div>`).join('');
  return `<form id="inviteForm" class="hres" style="display:flex;flex-direction:column;gap:8px"><b>Invite a lab, pharmacy or dentist by email</b>
      <p class="small muted" style="margin:0">Only the email you type here can join. The clinic code below does nothing for anyone else. A lab or pharmacy person sees only their own list, never patient files or phone numbers.</p>
      <div class="grid2"><label class="f"><span>Name (e.g. the lab's name)</span><input type="text" id="iv-name" required placeholder="e.g. City Dental Lab"></label><label class="f"><span>Their email address</span><input type="email" id="iv-email" required autocapitalize="off" autocorrect="off" placeholder="lab@example.com"></label>
      <label class="f"><span>They work as</span><select id="iv-unit"><option value="lab">Laboratory</option><option value="pharmacy">Pharmacy</option><option value="">Dentist (normal access)</option></select></label></div>
      <div class="row"><button class="btn primary" type="submit">Invite this email</button></div>
      <ol style="margin:0;padding-left:20px;display:flex;flex-direction:column;gap:4px" class="small">
        <li>Tell them to open the app address and tap <b>Sign up</b> with <b>exactly this email</b> and a password of their choice.</li>
        <li>That is all. They land straight in your clinic on their own list. No code, no “join”, nothing to choose.</li>
        <li>A different email address cannot get in, even with the clinic code.</li>
      </ol>
      ${rows?`<div class="plist">${rows}</div>`:''}</form>`}
  return `<form id="unitLoginForm" class="hres" style="display:flex;flex-direction:column;gap:8px"><b>Add a lab or pharmacy login</b>
      <p class="small muted" style="margin:0">They log in from their own computer with this username and password and see only their own list – no patient files, no phone numbers.</p>
      <div class="grid2"><label class="f"><span>Name (e.g. the lab's name)</span><input type="text" id="ul-name" required placeholder="e.g. City Dental Lab"></label>
      <label class="f"><span>Department</span><select id="ul-unit"><option value="lab">Laboratory</option><option value="pharmacy">Pharmacy</option></select></label>
      <label class="f"><span>Username</span><input type="text" id="ul-user" required autocapitalize="off" autocorrect="off" autocomplete="off" placeholder="e.g. citylab"></label>
      <label class="f"><span>Password (at least 8 characters)</span><input type="password" id="ul-pw" required minlength="8" autocomplete="new-password"></label></div>
      <div class="row"><button class="btn primary" type="submit">Create login</button></div></form>`}
function unitsPanel(){
  const u=unitsOf();const mem=team||[];
  const staffBox=(unit,label)=>`<div class="small" style="margin-top:4px"><b>${label} staff</b> – these people get a pop-up and sound when something arrives:</div><div class="chips">${mem.map(t=>`<label class="chip"><input type="checkbox" data-unitstaff="${unit}" value="${t.user_id}" ${staffIds(unit).includes(t.user_id)?'checked':''} style="width:18px;height:18px;margin:0"> ${esc(t.name)}</label>`).join('')||'<span class="small muted">Add team members first.</span>'}</div>`;
  return `<div style="border-top:1px solid var(--line);padding-top:10px;margin-top:4px;display:flex;flex-direction:column;gap:8px"><b>Pharmacy and laboratory</b>
    <label class="row small" style="gap:8px"><input type="checkbox" id="unit-pharmacy" ${u.pharmacy?'checked':''} style="width:20px;height:20px"> Pharmacy – sees every new prescription and marks it as given</label>
    <label class="row small" style="gap:8px"><input type="checkbox" id="unit-lab" ${u.lab?'checked':''} style="width:20px;height:20px"> Laboratory – receives lab requests from the dentists</label>
    ${u.pharmacy?staffBox('pharmacy','Pharmacy'):''}${u.lab?staffBox('lab','Laboratory'):''}
    ${LOCAL?unitLoginHtml():''}
    ${(u.pharmacy||u.lab)?'<p class="small muted" style="margin:0">Give each pharmacy or lab person their own login (Team below, role <b>Dentist</b>) and tick them above. A ticked pharmacy person sees only the prescription list: no patient files, no phone numbers, no other menus.</p>':''}</div>`;
}
function deptPanel(){
  if(!isAdmin()||brandingErr==='needsql')return '';
  const fac=branding.facility||'dental_clinic',ds=deptList();
  return `<section class="panel" id="deptPanel"><h3>Facility type &amp; departments</h3>
    <label class="f"><span>What do you run?</span><select id="facility-sel">${FACILITIES.map(([k,l])=>`<option value="${k}" ${fac===k?'selected':''}>${l}</option>`).join('')}<option disabled>Medical clinic – coming soon</option><option disabled>Medical hospital – coming soon</option></select></label>
    <p class="small muted" style="margin:0">A hospital can sort its patients into departments. Each patient gets a department, and the patient list can be filtered by department. A clinic can leave this empty.</p>
    ${ds.length?`<div class="chips">${ds.map((n,i)=>`<span class="chip">${esc(n)}<button type="button" data-deptdel="${i}" aria-label="Remove ${esc(n)}">×</button></span>`).join('')}</div>`:'<p class="small muted" style="margin:0">No departments yet.</p>'}
    <div class="row"><input type="text" id="dept-new" placeholder="New department, e.g. Implant centre" style="flex:1;min-width:0"><button class="btn small primary" data-act="deptAdd">Add</button></div>
    <div class="row"><button class="btn small" data-act="deptReady">Use the ready-made dental departments</button>${ds.length?'<button class="btn small" data-act="deptClear">Remove all</button>':''}</div>
    ${unitsPanel()}
  </section>`;
}
async function deptSave(patch,msg){try{await saveBranding(patch);render();if(msg)toast(msg)}catch(e){toast(friendly(e))}}

/* ---- Smart Help: type what you look for, see where it is, tap to go there ---- */
const HELP=[
 {t:'Add or clear holidays',k:'holiday holidays vacation closed off day leave eid clear',p:'Clinic & account › Online booking',s:'settings',h:'Online booking',a:1},
 {t:'Booking QR code, link and poster',k:'qr code booking link poster print online book patients website',p:'Clinic & account › Online booking',s:'settings',h:'Online booking',a:1},
 {t:'Turn online booking on or off, slot length, chairs, working days and hours',k:'online booking slot chairs working days hours time open close availability',p:'Clinic & account › Online booking',s:'settings',h:'Online booking',a:1},
 {t:'Change the background photo or colour',k:'background photo picture wallpaper colour color theme look',p:'Clinic & account › Clinic logo & background',s:'settings',h:'Clinic logo',a:1},
 {t:'Upload the clinic logo',k:'logo picture brand image print letterhead',p:'Clinic & account › Clinic logo & background',s:'settings',h:'Clinic logo',a:1},
 {t:'Facility type and hospital departments',k:'department departments hospital facility type orthodontics surgery endodontics ward unit',p:'Clinic & account › Facility type & departments',s:'settings',h:'Facility type',a:1},
 {t:'Clinic name, address, phone, registration no.',k:'clinic name address phone number registration ntn pmdc details reminder message template',p:'Clinic & account › Clinic details',s:'settings',h:'Clinic details'},
 {t:'Activate the app (licence, trial)',k:'activate activation key licence license trial expired subscription pay',p:'Clinic & account › Activation',s:'settings',h:'Activation',a:1},
 {t:'Add a dentist, accountant or staff login',k:'add dentist doctor team member accountant staff user login invite code join',p:'Clinic & account › Team',s:'settings',h:'Team'},
 {t:'Attendance of staff',k:'attendance staff login time hours present',p:'Clinic & account › Attendance',s:'settings',h:'Attendance',a:1},
 {t:'Change my password',k:'password change reset forgot security',p:'Clinic & account › Change password',s:'settings',h:'Change password'},
 {t:'Backup and restore',k:'backup restore save copy lost phone export data safe',p:'Clinic & account › Backup',s:'settings',h:'Backup'},
 {t:'Sounds and notifications',k:'sound tone ring alert notification mute volume',p:'Clinic & account › Sounds',s:'settings',h:'Sounds'},
 {t:'See today’s appointments and waiting online bookings',k:'appointment appointments calendar today booking waiting accept decline schedule',p:'Appointments',s:'appts'},
 {t:'Earnings, expenses and salaries',k:'earnings income money expenses salary salaries profit payments report accountant',p:'Earnings (PIN protected)',s:'earn',a:1},
 {t:'Messages to the team',k:'message messages chat team send staff',p:'Messages',s:'msgs'},
 {t:'Add a new patient',k:'new patient add register create',p:'Patients › + New patient',s:'list',sel:'[data-act="newPatient"]'},
 {t:'Add an old patient from paper records',k:'old patient paper import records excel file card',p:'Patients › + Old patient',s:'list',sel:'[data-act="impOpen"]'},
 {t:'Find a patient',k:'find search patient name phone cnic file number',p:'Patients › Search box',s:'list',sel:'#search'},
 {t:'Patient allergies, pregnancy and medicines (medical alert)',k:'allergy allergies pregnant pregnancy medicine medicines tablets blood thinner alert medical history',p:'Open a patient › Medical history',tab:'mh'},
 {t:'Tooth chart',k:'chart tooth teeth fdi surface caries filling missing',p:'Open a patient › Chart',tab:'chart'},
 {t:'Treatment plan and root canal (RCT) steps',k:'treatment plan phase rct root canal pulpectomy pulpotomy endodontic procedure items',p:'Open a patient › Treatment plan',tab:'plan'},
 {t:'Payments, invoice and receipt',k:'payment pay invoice receipt bill discount cash easypaisa jazzcash balance',p:'Open a patient › Payments',tab:'pay'},
 {t:'Clinical notes and canal lengths',k:'clinical notes note template canal length rct visit write',p:'Open a patient › Clinical notes',tab:'notes'},
 {t:'X-rays and photos',k:'xray x-ray opg photo scan camera upload picture radiograph',p:'Open a patient › X-rays',tab:'xrays'},
 {t:'Write and print a prescription',k:'prescription antibiotic painkiller medicine print rx drug dose',p:'Open a patient › Prescription',tab:'rx'},
 {t:'Book an appointment for a patient',k:'book appointment patient reminder whatsapp sms visit next',p:'Open a patient › Appointments',tab:'appts'},
 {t:'Orthodontic assessment, cephalometrics and aligner scanner',k:'ortho orthodontic orthodontics braces aligner clear aligner scanner intraoral scan cephalometric ceph overjet overbite crowding class molar retainer devices',p:'Open a patient › Ortho',tab:'ortho'},
 {t:'Pharmacy – prescriptions waiting',k:'pharmacy pharmacist prescription medicine given dispense notification',p:'Pharmacy',s:'pharm'},
 {t:'Laboratory – requests and results',k:'lab laboratory blood test biopsy result request report',p:'Laboratory',s:'lab'},
 {t:'Turn on Pharmacy or Lab and choose who gets notified',k:'pharmacy lab laboratory staff notify notification unit attach hospital',p:'Clinic & account › Facility type & departments',s:'settings',h:'Facility type',a:1},
 {t:'Aesthetics patients',k:'aesthetic aesthetics botox laser prp cosmetic',p:'Aesthetics',s:'aes'}
];
const TAB_LABEL={ortho:'Ortho',mh:'Medical history',chart:'Chart',plan:'Treatment plan',pay:'Payments',notes:'Clinical notes',xrays:'X-rays',rx:'Prescription',appts:'Appointments',visits:'Visits'};
function helpFind(q){
  const w=q.toLowerCase().split(/[^a-z0-9’']+/).filter(x=>x.length>1);if(!w.length)return [];
  return HELP.filter(e=>!e.a||isAdmin()).map(e=>{const hay=(e.t+' '+e.k+' '+e.p).toLowerCase();let sc=0;
    w.forEach(x=>{if(hay.includes(x))sc+=e.t.toLowerCase().includes(x)?3:e.k.includes(x)?2:1;else if(x.length>3&&hay.includes(x.slice(0,-1)))sc+=1});return {e,sc}})
    .filter(r=>r.sc>0).sort((a,b)=>b.sc-a.sc).slice(0,6).map(r=>r.e);
}
function helpResults(q){
  const r=helpFind(q);
  if(!q.trim())return `<p class="small muted" style="margin:6px 0">Type what you are looking for. For example:</p><div>${['holiday','prescription','backup','add dentist','background','allergy','earnings','x-ray'].map(x=>`<button type="button" class="chip" data-helpq="${x}">${x}</button>`).join('')}</div>`;
  if(!r.length)return `<p class="small muted">Nothing found for “${esc(q)}”. Try one word, like <b>holiday</b>, <b>print</b> or <b>password</b>.</p>`;
  return r.map(e=>`<div class="hres"><div class="small muted">${esc(e.p)}</div><b>${esc(e.t)}</b><div><button type="button" class="btn small primary" data-helpgo="${HELP.indexOf(e)}">Take me there →</button></div></div>`).join('');
}
function helpOpen(){
  if(document.getElementById('helpSheet'))return;
  const d=document.createElement('div');d.id='helpSheet';d.className='helpsheet';d.setAttribute('role','dialog');d.setAttribute('aria-label','Smart Help');
  d.innerHTML=`<div class="hbox"><div class="row"><b style="font-size:1.1rem">🧭 Smart Help</b><span class="spacer"></span><button type="button" class="btn small" data-helpclose="1">Close</button></div>
   <input type="search" id="helpQ" placeholder="What are you looking for? e.g. holiday" autocomplete="off" autocapitalize="off">
   <div id="helpRes">${helpResults('')}</div></div>`;
  document.body.appendChild(d);setTimeout(()=>{const i=document.getElementById('helpQ');if(i)i.focus()},50);
}
function helpClose(){const d=document.getElementById('helpSheet');if(d)d.remove()}
function helpClearTip(){document.querySelectorAll('.hl-target').forEach(x=>x.classList.remove('hl-target'));document.querySelectorAll('.hl-tip').forEach(x=>x.remove())}
function helpShowTip(el,text){
  helpClearTip();if(!el){toast(text);return}
  el.classList.add('hl-target');const tip=document.createElement('div');tip.className='hl-tip';tip.innerHTML='👆 '+esc(text)+' <button type="button" data-helpdone="1">OK</button>';
  el.parentNode.insertBefore(tip,el);el.scrollIntoView({block:'center',behavior:'smooth'});setTimeout(helpClearTip,15000);
}
function helpHeading(txt){
  const hs=[...document.querySelectorAll('.main h1,.main h2,.main h3,.main summary')];
  const h=hs.find(x=>x.textContent.toLowerCase().includes(txt.toLowerCase()));return h?(h.closest('section,form,details')||h):null;
}
function helpGo(e){
  helpClose();stopXrWatch();stopCamera();
  const after=(fn)=>setTimeout(fn,120);
  if(e.tab){
    if(view.screen==='patient'&&view.pid){view.tab=e.tab;view.tooth=null;view.addItem=null;view.confirm=null;
      if(e.tab==='appts'){apptsPatient=[];apptsLoading=true;render();refreshAppts()}else if(e.tab==='xrays'){xrays=[];xrView=null;render()}else render();
      after(()=>helpShowTip(document.querySelector('.tabs [data-tab="'+e.tab+'"].tab')||document.querySelector('.apptbar'),'Here: '+TAB_LABEL[e.tab]));
    }else{view=Object.assign(view,{screen:'list',pid:null,confirm:null,msg:null});render();after(()=>helpShowTip(document.getElementById('search'),'First open a patient, then tap “'+TAB_LABEL[e.tab]+'” in the row of tabs.'))}
    return;
  }
  if(e.s==='settings'){view.newRecovery=null;if(isAdmin()||isAcct()){attRows=null;loadAttendance(attDay||today()).then(()=>{if(view.screen==='settings')softRender()})}
    view.screen='settings';view.pid=null;view.confirm=null;view.msg=null;render();loadTeam().then(()=>{if(view.screen==='settings')softRender()});if(appOwner)loadSignupCodes().then(()=>{if(view.screen==='settings')softRender()});
    after(()=>helpShowTip(helpHeading(e.h),'Here: '+e.t));return}
  if(e.s==='appts'){view=Object.assign(view,{screen:'appts',pid:null,confirm:null,msg:null,day:view.day||today()});render();refreshAppts();after(()=>helpShowTip(document.querySelector('.main h1')||null,'You are in Appointments.'));return}
  if(e.s==='earn'){view=Object.assign(view,{screen:'earn',pid:null,confirm:null,msg:null});earn.err='';earn.mode='';render();if(earnOpen())loadEarn();after(()=>helpShowTip(document.querySelector('.main h1')||null,'Earnings is PIN protected. Enter your PIN to open it.'));return}
  view=Object.assign(view,{screen:e.s,pid:null,confirm:null,msg:null});render();
  after(()=>{const el=e.sel?document.querySelector('.main '+e.sel):null;helpShowTip(el||document.querySelector('.main h1'),'Here: '+e.t)});
}
document.addEventListener('click',e=>{
  const b=e.target.closest('button');
  if(e.target.closest('#helpFab')){helpOpen();return}
  const sheet=document.getElementById('helpSheet');
  if(sheet&&e.target===sheet){helpClose();return}
  if(!b)return;const d=b.dataset;
  if(d.helpclose){helpClose();return}
  if(d.helpdone){helpClearTip();return}
  if(d.helpq!==undefined){const i=document.getElementById('helpQ');if(i){i.value=d.helpq;document.getElementById('helpRes').innerHTML=helpResults(d.helpq);i.focus()}return}
  if(d.helpgo!==undefined){const en=HELP[+d.helpgo];if(en)helpGo(en);return}
});
document.addEventListener('input',e=>{if(e.target&&e.target.id==='helpQ'){document.getElementById('helpRes').innerHTML=helpResults(e.target.value)}});
document.addEventListener('keydown',e=>{if(e.key==='Escape')helpClose()});

function brandingPanel(){
  if(!isAdmin())return '';
  if(brandingErr==='needsql')return `<section class="panel"><h3>Clinic logo &amp; background</h3><div class="msg warn">This needs one small database update. Open <b>Supabase → SQL Editor</b>, paste <b>supabase-update-finance.sql</b> and press <b>Run</b>, then reload.</div></section>`;
  const bg=branding.bg||'';
  return `<section class="panel"><h3>Clinic logo &amp; background</h3>
    <div class="brandrow"><div class="logoprev">${branding.logo?`<img src="${esc(branding.logo)}" alt="Clinic logo">`:`<span class="muted small">No logo</span>`}</div>
      <div style="display:flex;flex-direction:column;gap:6px"><p class="small muted" style="margin:0">Your logo shows in the menu, on the welcome screen and on every printout. PNG or JPG; it is made small automatically.</p>
      <div class="row"><label class="btn small primary filebtn">${branding.logo?'Change logo':'Upload logo'}<input type="file" id="brand-logo" accept="image/png,image/jpeg,image/webp"></label>${branding.logo?'<button class="btn small" data-act="logoRemove">Remove logo</button>':''}</div></div></div>
    <p class="small" style="margin:6px 0 0"><b>Colour of the whole app</b> – buttons, menu and headings (for everyone in the clinic)</p>
    <div class="bgchoices">${THEMES.map(([k,l,c])=>{const on=k==='custom'?(branding.theme&&!THEMES.some(t=>t[0]===branding.theme)):(branding.theme||'')===k;return `<button type="button" class="bgsw ${on?'on':''}" data-themeset="${k||'default'}" aria-pressed="${on}"><i style="background:${k==='custom'?(branding.theme||'#888'):c}"></i><span>${l}</span></button>`}).join('')}</div>
    ${branding.theme&&!THEMES.some(t=>t[0]===branding.theme)||view.themeCustom?`<div class="row"><label class="f" style="flex-direction:row;align-items:center;gap:10px"><span>Pick the colour</span><input type="color" id="brand-theme" value="${esc(branding.theme||'#2b5fa8')}" style="width:56px;height:44px;padding:2px"></label></div>`:''}
    <p class="small" style="margin:6px 0 0"><b>Background of the main screen</b> (for everyone in the clinic)</p>
    <div class="bgchoices">${BG_CHOICES.map(([k,l])=>`<button type="button" class="bgsw ${bg===k?'on':''}" data-bgset="${k}" data-sw="${k||'plain'}" aria-pressed="${bg===k}"><i></i><span>${l}</span></button>`).join('')}</div>
    ${bg==='custom'?`<div class="row"><label class="f" style="flex-direction:row;align-items:center;gap:10px"><span>Pick the colour of the whole page</span><input type="color" id="brand-col" value="${esc(branding.bgColor||'#cfe8e5')}" style="width:56px;height:44px;padding:2px"></label><span class="small muted">It is shown softly so the text stays easy to read.</span></div>`:''}
    ${bg==='photo'||view.bgPhoto?`<div class="row"><label class="btn small filebtn">${branding.bgImage?'Change photo':'Choose photo'}<input type="file" id="brand-bg" accept="image/png,image/jpeg,image/webp"></label><span class="small muted">A calm photo works best; it is faded so text stays easy to read.</span></div>`:''}
  </section>`;
}
function soundsPanel(){
  return `<section class="panel"><h3>Sounds on this computer</h3>
    <p class="small muted" style="margin:0">Choose a tone for each event. Each computer keeps its own choice.</p>
    <div class="row"><label class="row small" style="gap:8px"><input type="checkbox" id="snd-on" ${Sound.on?'checked':''} style="width:20px;height:20px"> Sounds on</label>
      <label class="row small" style="gap:8px;flex:1;min-width:200px">Volume <input type="range" id="snd-vol" min="0" max="1" step="0.05" value="${Sound.vol()}" style="flex:1"></label></div>
    <div class="soundgrid">${SOUND_EVENTS.map(([k,l])=>`<label class="f"><span>${l}</span><div class="row" style="gap:6px;flex-wrap:nowrap"><select data-tonefor="${k}" style="flex:1">${Object.entries(TONES).map(([t,o])=>`<option value="${t}" ${Sound.toneFor(k)===t?'selected':''}>${o.label}</option>`).join('')}</select><button type="button" class="btn small" data-tonetest="${k}" aria-label="Play ${l} tone">▶</button></div></label>`).join('')}</div>
  </section>`;
}
document.addEventListener('pointerdown',e=>{const el=e.target.closest('button,.btn,[data-surf],a.btn,select');if(!el||el.disabled)return;
  Sound.play(el.classList.contains('tab')||el.dataset.tab||el.dataset.home?'tab':'click')},true);
document.addEventListener('toggle',e=>{if(e.target&&e.target.classList&&e.target.classList.contains('bkhist'))view.bkHistOpen=e.target.open},true);
/* ---- Update notice: version.json (uploaded with each update) tells every open computer that a new version is ready ---- */
const Upd={info:null,shown:false,
  status:'',
  async check(manual){if(manual){Upd.status='checking';if(view.screen==='settings')softRender()}
    try{const r=await fetch('version.json?t='+Date.now(),{cache:'no-store'});if(!r.ok)throw new Error('x');const j=await r.json();if(!j||!j.version)throw new Error('x');Upd.info=j;Upd.checkedAt=Date.now();
      Upd.status=j.version!==APP_VERSION?'available':'uptodate';
      if(j.version!==APP_VERSION){if(!manual)Upd.bar()}else Upd.whatsNew()}catch(e){if(manual)Upd.status='error'}
    if(manual&&view.screen==='settings')softRender()},
  async go(){if(typeof dirty!=='undefined'&&dirty.size){try{await flush()}catch(err){}}
    try{const rs=await navigator.serviceWorker?.getRegistrations?.();if(rs)await Promise.all(rs.map(r=>r.update().catch(()=>{})))}catch(err){}
    try{if(window.caches){const ks=await caches.keys();await Promise.all(ks.map(k=>caches.delete(k)))}}catch(err){}
    try{await Promise.all(['app.js','index.html','config.js','local-db.js'].map(f=>fetch(f+'?r='+Date.now(),{cache:'reload'}).catch(()=>{})));await Promise.all(['app.js','index.html'].map(f=>fetch(f,{cache:'reload'}).catch(()=>{})))}catch(err){}
    location.reload()},
  notes(){const n=((Upd.info&&Upd.info.notes)||[]).slice(0,6);return n.length?'<ul>'+n.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul>':''},
  bar(){if(Upd.shown)return;Upd.shown=true;const d=document.createElement('div');d.className='updbar';d.setAttribute('role','status');
    d.innerHTML=`<div class="updtxt"><b>A new version of the app is ready</b><span>${esc(Upd.info.date||'')} – your work is saved automatically. Just tap Update now.</span></div>
      <button class="btn small" data-upd="notes">What's new</button><button class="btn small primary" data-upd="go">Update now</button><button class="btn small" data-upd="later" aria-label="Later">Later</button><div class="updnotes" hidden>${Upd.notes()}</div>`;
    document.body.appendChild(d);try{Sound.play('message')}catch(e){}
    d.addEventListener('click',async e=>{const b=e.target.closest('[data-upd]');if(!b)return;const k=b.dataset.upd;
      if(k==='notes'){const n=d.querySelector('.updnotes');n.hidden=!n.hidden;return}
      if(k==='later'){d.remove();Upd.shown=false;Upd.snooze=Date.now();return}
      if(k==='go'){await Upd.go()}})},
  whatsNew(){let seen='';try{seen=localStorage.getItem('seenVersion')||''}catch(e){}
    if(seen===APP_VERSION)return;try{localStorage.setItem('seenVersion',APP_VERSION)}catch(e){}
    if(!seen||!Upd.notes())return; // first use: no pop-up
    const d=document.createElement('div');d.className='updbar done';d.innerHTML=`<div class="updtxt"><b>The app was updated</b><span>${esc(APP_VERSION)}</span></div><button class="btn small" data-upd="close">OK</button><div class="updnotes">${Upd.notes()}</div>`;
    document.body.appendChild(d);d.addEventListener('click',e=>{if(e.target.closest('[data-upd]'))d.remove()})}
};
setTimeout(()=>Upd.check(),4000);
setInterval(()=>{if(!Upd.shown&&(!Upd.snooze||Date.now()-Upd.snooze>36e5))Upd.check()},10*60*1000);
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&!Upd.shown&&(!Upd.snooze||Date.now()-Upd.snooze>36e5))Upd.check()});
function toastKind(m){if(/not |wrong|could not|invalid|expired|only |first|ended|cannot|can't|doesn't|failed|too many|no internet|match/i.test(m))return 'error';
  if(/saved|added|created|booked|activated|copied|restored|deleted|changed|imported|ready|completed|joined|removed|cleared|reviewed|thank/i.test(m))return 'success';return ''}
function toast(m){const k=toastKind(m);if(k)Sound.play(k);const t=$('#toast');t.textContent=m;t.className='toast '+k;t.hidden=false;clearTimeout(toast._t);toast._t=setTimeout(()=>t.hidden=true,2400)}
function P(){return db.patients.find(p=>p.id===view.pid)}
const isAdmin=()=>me&&me.role==='admin';
const isAcct=()=>me&&me.role==='accountant';
const ROLE_LABEL={admin:'Admin',dentist:'Dentist',accountant:'Accountant'};
const nameOf=id=>{const m=team.find(t=>t.user_id===id);return m?m.name:'another device'};
function friendly(err){
  const m=(err&&(err.message||err.error_description))||String(err||'Something went wrong');
  if(/Invalid login credentials/i.test(m))return LOCAL?'Username or password is wrong.':'Email or password is wrong.';
  if(/already registered|already exists/i.test(m))return 'An account with this email already exists. Log in instead.';
  if(/Invalid login credentials/i.test(m)&&LOCAL)return 'Username or password is wrong.';
  if(/Email not confirmed/i.test(m))return 'Please confirm your email first (check your inbox), then log in.';
  if(/Failed to fetch|NetworkError|Load failed/i.test(m))return 'No internet connection. Check your connection and try again.';
  if(/Password should be/i.test(m))return 'Password must be at least 8 characters.';
  return m;
}

/* ---------- sync ---------- */
const dirty=new Set();let flushT=null,syncState='saved';
function setSync(s){syncState=s;const el=$('#sync');if(el){el.className='sync '+s;el.textContent=syncText()}}
function syncText(){if(readOnly())return 'Read-only';return {saved:LOCAL?'Saved on this device':'All changes saved',saving:'Saving…',error:LOCAL?'Not saved':'Not saved – check internet'}[syncState]}
function syncBadge(){return `<span id="sync" class="sync ${syncState}" role="status">${syncText()}</span>`}
let dailyBlob=null,dailyBusy=false,snapList=null;
const backedUpToday=()=>{const l=+lsGet('lastFullBackup')||0;return l&&dayOf(l)===today()};
async function prepareDaily(){
  if(dailyBusy||dailyBlob||backedUpToday()||!db.patients.length)return;
  dailyBusy=true;try{const data=LOCAL?await window.__LOCAL_DB.exportAll():{app:'clinic-patient-records',clinic:clinic.name,exported:new Date().toISOString(),patients:db.patients.map(x=>Object.assign(strip(x),{id:x.id}))};dailyBlob=new Blob([JSON.stringify(data)],{type:'application/json'});softRender()}catch(e){}dailyBusy=false;
}
setInterval(()=>{if(window.__LOCAL_DB)window.__LOCAL_DB.autoSnapshot().catch(()=>{});if(clinic)prepareDaily()},60*60*1000);
const readOnly=()=>!!(clinic&&clinic.lic&&clinic.lic.state==='expired');
let roToastAt=0;
function markDirty(id){if(!id)return;
  if(isAcct()){if(Date.now()-roToastAt>4000){toast('Accountants can view and print, but not change patient records.');roToastAt=Date.now()}
    loadPatients().then(()=>render()).catch(()=>{});return}
  if(readOnly()){if(Date.now()-roToastAt>4000){toast('Read-only: the free trial has ended. Activate in Clinic & account.');roToastAt=Date.now()}
    loadPatients().then(()=>render()).catch(()=>{});return}dirty.add(id);setSync('saving');clearTimeout(flushT);flushT=setTimeout(flush,700)}
function save(){markDirty(view.pid)}
function strip(p){const o=Object.assign({},p);delete o.id;delete o._upd;delete o._by;delete o._renamed;return o}
let flushing=false;
async function flush(){
  clearTimeout(flushT);if(flushing||!dirty.size||!clinic)return;
  flushing=true;const ids=[...dirty];dirty.clear();
  const rows=ids.map(id=>db.patients.find(p=>p.id===id)).filter(Boolean).map(p=>({id:p.id,clinic_id:clinic.id,data:strip(p)}));
  if(!rows.length){flushing=false;setSync('saved');return}
  const {data,error}=await sb.from('patients').upsert(rows).select('id,updated_at,updated_by');
  flushing=false;
  if(error&&error.code==='readonly'){setSync('saved');toast(error.message);try{await loadPatients()}catch(e){}render();return}
  if(error){ids.forEach(i=>dirty.add(i));setSync('error');flushT=setTimeout(flush,8000);return}
  (data||[]).forEach(r=>{const p=db.patients.find(x=>x.id===r.id);if(p){p._upd=r.updated_at;p._by=r.updated_by}});
  if(dirty.size){flushT=setTimeout(flush,300);setSync('saving')}else setSync('saved');
}
function toPatient(r){return migrate(Object.assign({},r.data||{},{id:r.id,_upd:r.updated_at,_by:r.updated_by}))}
async function loadPatients(){
  const all=[];let from=0;
  for(;;){const {data,error}=await sb.from('patients').select('id,data,updated_at,updated_by').eq('clinic_id',clinic.id).order('id').range(from,from+999);
    if(error)throw error;all.push(...data);if(data.length<1000)break;from+=1000;}
  const keep=db.patients.filter(p=>dirty.has(p.id));
  db.patients=all.map(toPatient).filter(p=>!dirty.has(p.id)).concat(keep);
  // save renamed treatment names back once (only staff who may edit)
  const ren=db.patients.filter(p=>p._renamed);ren.forEach(p=>delete p._renamed);
  if(ren.length&&me&&!isAcct()&&!readOnly()){ren.forEach(p=>markDirty(p.id));setTimeout(()=>{try{flush()}catch(e){}},1500)}
}
async function loadTeam(){
  const {data,error}=await sb.from('members').select('user_id,name,role,joined_at,pmdc').eq('clinic_id',clinic.id).order('joined_at');
  if(!error){team=data||[];const mine=team.find(t=>t.user_id===user.id);if(mine)me=Object.assign({},me,mine);}
}
let pendingRender=false;
function softRender(){const a=document.activeElement;if(a&&/^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName)&&a.id!=='search'){pendingRender=true;return}render()}
document.addEventListener('focusout',()=>{if(pendingRender){setTimeout(()=>{const a=document.activeElement;if(!(a&&/^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName))){pendingRender=false;render()}},150)}});
function subscribe(){
  if(chan)sb.removeChannel(chan);
  chan=sb.channel('patients-'+clinic.id).on('postgres_changes',{event:'*',schema:'public',table:'patients',filter:'clinic_id=eq.'+clinic.id},pl=>{
    if(pl.eventType==='DELETE'){const id=pl.old&&pl.old.id;if(!id||dirty.has(id))return;const had=db.patients.some(p=>p.id===id);if(!had)return;
      db.patients=db.patients.filter(p=>p.id!==id);if(view.pid===id){view.screen='list';view.pid=null;toast('This patient was deleted on another device')}softRender();return}
    const r=pl.new;if(!r||dirty.has(r.id))return;const ix=db.patients.findIndex(p=>p.id===r.id);
    if(ix>=0&&db.patients[ix]._upd===r.updated_at)return;
    const np=toPatient(r);if(ix>=0)db.patients[ix]=np;else db.patients.push(np);
    if(view.pid===r.id)toast('Updated by '+nameOf(r.updated_by));softRender();
  }).on('postgres_changes',{event:'*',schema:'public',table:'appointments',filter:'clinic_id=eq.'+clinic.id},()=>{
    if(view.screen==='appts'||(view.screen==='patient'&&view.tab==='appts'))refreshAppts();
  }).on('postgres_changes',{event:'*',schema:'public',table:'payments',filter:'clinic_id=eq.'+clinic.id},()=>{
    if(view.screen==='patient'&&view.tab==='pay'&&view.pid)loadPayments(view.pid).then(()=>softRender()).catch(()=>{});
  }).on('postgres_changes',{event:'*',schema:'public',table:'online_bookings',filter:'clinic_id=eq.'+clinic.id},pl=>{
    const b=pl.new;loadBookings(view.day||today()).then(()=>softRender());
    if(pl.eventType==='INSERT'&&b){Sound.play('arrival');const t=$('#toast');t.textContent='New online booking: '+b.name+' – '+fmtDate(dayOf(b.starts_at))+' at '+hhmm(b.starts_at);t.className='toast success';t.hidden=false;clearTimeout(toast._t);toast._t=setTimeout(()=>t.hidden=true,7000)}
  }).on('postgres_changes',{event:'INSERT',schema:'public',table:'messages',filter:'clinic_id=eq.'+clinic.id},pl=>{
    const m=pl.new;if(!m||msgs.some(x=>x.id===m.id))return;msgs.push(m);
    if(forMe(m)&&m.sender!==user.id){Sound.play(m.kind==='arrived'||m.kind==='rx'||m.kind==='lab'||m.kind==='labclinic'?'arrival':'message');
      if(view.screen==='msgs')markRead().then(()=>softRender());
      else{const t=$('#toast');t.textContent=(m.kind==='arrived'?'':m.kind==='rx'?'💊 ':(m.kind==='lab'||m.kind==='labclinic')?'🧪 ':'New message from '+m.sender_name+': ')+m.body;t.className='toast success';t.hidden=false;clearTimeout(toast._t);toast._t=setTimeout(()=>t.hidden=true,5000);softRender()}}
  }).subscribe();
}
document.addEventListener('visibilitychange',async()=>{
  if(!clinic||!sb)return;
  if(document.visibilityState==='hidden'){flush();return}
  if(!dirty.size){try{await loadPatients();softRender()}catch(e){}}
});
window.addEventListener('online',()=>{if(dirty.size)flush()});
window.addEventListener('beforeunload',e=>{if(dirty.size){flush();e.preventDefault();e.returnValue=''}});

/* ---------- auth & clinic ---------- */
async function boot(){
  if(!configured){view.screen='config';render();return}
  if(!window.supabase){view.screen='offline';render();return}
  sb=window.supabase.createClient(CONFIG.SUPABASE_URL,CONFIG.SUPABASE_ANON_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
  recovering=/type=recovery/.test(location.hash);
  sb.auth.onAuthStateChange((ev,s)=>{
    if(ev==='PASSWORD_RECOVERY'){recovering=true;user=s&&s.user;view.screen='newpw';render();}
    else if(ev==='SIGNED_OUT'){if(OWNER_TEST){sessionStorage.removeItem('ownerTest');location.reload();return}resetState();view.screen='auth';render();}
  });
  if(OWNER_TEST){try{await ownerAutoLogin()}catch(e){sessionStorage.removeItem('ownerTest');alert('Owner test mode could not start: '+(e.message||e));location.reload()}return}
  const {data:{session}}=await sb.auth.getSession();
  if(recovering){if(session){user=session.user;view.screen='newpw';render()}return}
  if(!session){view.screen='auth';render();return}
  user=session.user;await afterLogin();
}
function resetState(){branding={};brandingId=null;brandingErr='';try{applyBranding()}catch(e){}earn.unlockedAt=0;earn.pays=null;fin.rows=null;earn.mode='';earn.err='';if(chan&&sb)sb.removeChannel(chan);chan=null;user=null;memberships=[];clinic=null;me=null;team=[];db={patients:[]};dirty.clear();setSync('saved')}
function normClinic(c){
  if(!c||LOCAL)return c;
  c.clinic_code=String(c.id).replace(/-/g,'').slice(0,10).toUpperCase().replace(/^(.{5})/,'$1-');
  if(c.licensed_at)c.lic={state:'active',name:c.license_name,date:dayOf(c.licensed_at)};
  else{const left=Math.ceil((new Date(c.created_at).getTime()+14*864e5-Date.now())/864e5);c.lic=left>0?{state:'trial',daysLeft:left}:{state:'expired'}}
  return c;
}
async function afterLogin(prefer){
  view={screen:'loading',pid:null,tab:'details',tooth:null,q:'',confirm:null,msg:null,authTab:'login'};render();
  const mq=()=>sb.from('members').select('clinic_id,role,name,pmdc,clinics(id,name,address,phone,invite_code,reminder_template,created_at,licensed_at,license_name,reg_body,reg_no,ntn)').eq('user_id',user.id);
  let {data,error}=await mq();
  if(!error&&!LOCAL&&!(data||[]).filter(m=>m.clinics).length){try{const r=await sb.rpc('accept_my_invites');if(!r.error&&r.data){({data,error}=await mq())}}catch(e){}}
  if(error){view.screen='auth';view.msg={t:'err',m:friendly(error)};render();return}
  memberships=(data||[]).filter(m=>m.clinics);memberships.forEach(m=>normClinic(m.clinics));
  if(!memberships.length){view.screen='onboard';render();return}
  if(wantNewFacility&&!prefer){wantNewFacility=false;try{history.replaceState(null,'',location.pathname)}catch(e){}view.screen='onboard';render();return}
  wantNewFacility=false;
  const want=prefer||lsGet('clinicId');
  await openClinic(memberships.find(x=>x.clinic_id===want)||memberships[0]);
}
async function openClinic(m){
  if(dirty.size)await flush();
  clinic=m.clinics;me={user_id:user.id,name:m.name,role:m.role,pmdc:m.pmdc||''};lsSet('clinicId',clinic.id);
  view.screen='loading';render();
  try{db={patients:[]};await Promise.all([loadPatients(),loadTeam(),loadBranding(),loadBookingCfg(),loadInvites(),loadOwnerFlag()]);}
  catch(e){view.screen='error';view.msg={t:'err',m:friendly(e)};render();return}
  subscribe();
  setTimeout(prepareDaily,1500);startAttendance();loadMessages().then(()=>{const n=unreadCount();if(n){render();setTimeout(()=>toast('You have '+n+' new message'+(n>1?'s':'')+' – open Messages'),400)}});
  view={screen:showWelcome?'welcome':'appts',pid:null,tab:'details',tooth:null,q:'',confirm:null,msg:null,authTab:'login',day:today()};render();
  if(!showWelcome)refreshAppts();
  if(showWelcome){showWelcome=false;Sound.play('success');setTimeout(()=>{if(view.screen==='welcome'){view.screen='appts';view.day=today();render();refreshAppts()}},3500)}
}
async function refreshClinic(){const {data}=await sb.from('clinics').select('id,name,address,phone,invite_code,reminder_template,created_at,licensed_at,license_name,reg_body,reg_no,ntn').eq('id',clinic.id).single();if(data){clinic=normClinic(data);const m=memberships.find(x=>x.clinic_id===clinic.id);if(m)m.clinics=clinic;}}

/* ---------- PDF record ---------- */
function chartLines(p){
  const out=[];if(p.dent)out.push('Dentition: '+DENT[p.dent]);
  for(const n of ALL_TEETH){const parts=[];const st=p.chart&&p.chart[n];if(st&&ST[st])parts.push(ST[st].label+impText(p,n)+prosText(p,n));if(p.rct&&p.rct[n])parts.push('RCT');if(p.mob&&p.mob[n])parts.push('mobility grade '+p.mob[n]);
    summaryOf(p,n).forEach(x=>parts.push(x.s+' '+x.txt.toLowerCase()));if(p.toothNotes&&p.toothNotes[n])parts.push(p.toothNotes[n]);
    if(parts.length)out.push(n+': '+parts.join(', '));}
  return out;
}
function buildRecord(p,date){
  const {jsPDF}=window.jspdf;const doc=new jsPDF({unit:'mm',format:'a4'});
  const W=210,M=16,CW=W-2*M;let y=16;
  const clean=s=>String(s??'').replace(/[^\n\x20-\x7E -ÿ–—•…‘’“”]/g,'');
  const ACC=[31,95,107],MUT=[93,107,114],INK=[24,35,42],LINE=[200,209,207],RED=[179,38,30];
  const ensure=h=>{if(y+h>278){doc.addPage();y=18;}};
  const sec=t=>{ensure(14);y+=3;doc.setFillColor(225,238,239);doc.rect(M,y-4,CW,6.5,'F');doc.setFont('helvetica','bold');doc.setFontSize(8.5);doc.setTextColor(...ACC);doc.text(t.toUpperCase(),M+2,y);y+=7;doc.setTextColor(...INK);doc.setFont('helvetica','normal');doc.setFontSize(9.5);};
  const para=t=>{const lines=doc.splitTextToSize(clean(t),CW);for(const l of lines){ensure(5);doc.text(l,M,y);y+=4.6;}};
  doc.setFillColor(...ACC);doc.rect(0,0,W,3,'F');
  let tx=M;const LG=branding&&branding.logo;if(LG){try{const fm=/^data:image\/png/.test(LG)?'PNG':'JPEG';const ip=doc.getImageProperties(LG);const h=13,w=Math.min(32,h*ip.width/ip.height);doc.addImage(LG,fm,M,y-4.5,w,h);tx=M+w+4}catch(e){}}
  doc.setFont('helvetica','bold');doc.setFontSize(17);doc.setTextColor(...INK);doc.text('Treatment Record',tx,y+4);
  doc.setFontSize(10.5);doc.text(clean(clinic.name),W-M,y+4,{align:'right'});
  doc.setFont('helvetica','normal');doc.setFontSize(8);doc.setTextColor(...MUT);
  const cl2=[clinic.address,clinic.phone].filter(Boolean).join('  ·  ');if(cl2)doc.text(clean(cl2),W-M,y+8.5,{align:'right'});
  const rl=regLine();if(rl){doc.text(clean(rl),W-M,y+12.5,{align:'right'});y+=3}
  y+=13;doc.setFontSize(9);
  doc.text('Visit date: '+fmtDate(date)+'     Dentist: '+clean(dentistLine(me)),M,y);
  doc.text('Printed '+fmtDate(today()),W-M,y,{align:'right'});y+=3;
  doc.setDrawColor(...LINE);doc.line(M,y,W-M,y);y+=4;
  sec('Patient');
  const kv=[['Name',p.first+' '+p.last],['Date of birth',p.dob?fmtDate(p.dob)+' ('+age(p.dob)+' yrs)':'–'],['Phone',p.phone||'–'],['CNIC',p.cnic||'–'],['Payment',[p.insurance,p.insNo].filter(Boolean).join(' · ')||'–'],['Address',p.address||'–']];
  kv.forEach(([k,v],i)=>{const x=M+(i%2)*(CW/2);if(i%2===0)ensure(6);doc.setTextColor(...MUT);doc.setFontSize(8);doc.text(k,x,y);doc.setTextColor(...INK);doc.setFontSize(9.5);doc.text(doc.splitTextToSize(clean(v),CW/2-26)[0]||'',x+24,y);if(i%2===1)y+=5.5;});
  const al=alertsOf(p);sec('Medical alerts');
  if(al.length){doc.setTextColor(...RED);doc.setFont('helvetica','bold');para(al.join('  ·  '));doc.setFont('helvetica','normal');doc.setTextColor(...INK);
    const ans=p.mh.answers;const KK=isAes(p)?AES_ALERT_KEYS:ALERT_KEYS;(isAes(p)?AES_MH:MH).forEach(([k])=>{if(ans[k]&&ans[k].v==='y'&&ans[k].d)para('– '+(KK[k]||'Note')+': '+ans[k].d);});}
  else para('No medical alerts recorded.');
  if(p.mh.meds)para('Medicines: '+p.mh.meds);
  const habits=[p.mh.smoke&&'Smoking: '+p.mh.smoke,p.mh.tobacco&&'Paan / gutka / naswar: '+p.mh.tobacco].filter(Boolean);if(habits.length)para(habits.join('   ·   '));
  doc.setTextColor(...MUT);doc.setFontSize(8.5);para('Medical history last reviewed: '+(p.mh.date?fmtDate(p.mh.date):'never'));doc.setTextColor(...INK);doc.setFontSize(9.5);
  const done=p.plan.filter(i=>i.status==='completed'&&i.doneDate===date);
  sec('Treatment carried out on '+fmtDate(date));
  if(done.length){
    const cx=[M,M+18,M+120];doc.setFont('helvetica','bold');doc.setFontSize(8.5);doc.setTextColor(...MUT);
    (isAes(p)?['Area','Treatment','Amount']:['Tooth','Treatment','Surfaces']).forEach((h,i)=>doc.text(h,cx[i],y));doc.text('Fee',W-M,y,{align:'right'});y+=2;doc.line(M,y,W-M,y);y+=4.5;
    doc.setFont('helvetica','normal');doc.setFontSize(9.5);doc.setTextColor(...INK);let tot=0;
    done.forEach(i=>{ensure(6);doc.text(clean(i.tooth||'–'),cx[0],y);doc.text(doc.splitTextToSize(clean(i.proc),98)[0],cx[1],y);doc.text(clean(i.surf||''),cx[2],y);doc.text(money(i.fee),W-M,y,{align:'right'});tot+=+i.fee||0;y+=5.5;});
    doc.line(M,y-3.5,W-M,y-3.5);doc.setFont('helvetica','bold');doc.text('Total today',cx[1],y+0.5);doc.text(money(tot),W-M,y+0.5,{align:'right'});doc.setFont('helvetica','normal');y+=6;
  } else para('No treatment items were marked completed on this date.');
  const notes=p.notes.filter(n=>n.date===date);
  sec('Clinical notes');
  if(notes.length)notes.forEach(n=>{doc.setFont('helvetica','bold');para(n.title+(n.by?' – '+n.by:''));doc.setFont('helvetica','normal');para(n.text);y+=1.5;});
  else para('No clinical notes for this date.');
  const open=p.plan.filter(i=>i.status!=='completed');
  if(showBal()){const b=billOf(p);sec('Payment summary');
    const ln=(k,v,bold)=>{ensure(6);doc.setFont('helvetica',bold?'bold':'normal');doc.setTextColor(...INK);doc.text(k,M,y);doc.text(v,M+70,y,{align:'right'});y+=5.4};
    ln('Total treatment',money(b.total));if(b.plannedTotal)ln('  of which done so far',money(b.charges));if(b.disc)ln('Discount','- '+money(b.disc));ln('Paid',money(b.paid));ln(b.due<0?'Advance (credit)':'Due',money(Math.abs(b.due)),true);doc.setFont('helvetica','normal');y+=1}
  sec('Treatment still planned');
  if(open.length)open.sort((a,b)=>a.phase-b.phase).forEach(i=>para('Phase '+i.phase+'   '+(i.tooth?i.tooth+'  ':'')+i.proc+(i.surf?' ('+i.surf+')':'')+'   '+money(i.fee)));
  else para('Treatment plan complete.');
  if(isAes(p)){if(p.mh.fitz||p.mh.concern){sec('Skin and concerns');if(p.mh.fitz)para('Skin type (Fitzpatrick): '+p.mh.fitz);if(p.mh.concern)para('Main concern: '+p.mh.concern);if(p.mh.hairloss)para('Hair loss: '+p.mh.hairloss)}}
  else{const cl=chartLines(p);
  sec('Current chart findings (FDI)');
  if(cl.length)cl.forEach(l=>para(l));else para('No findings charted.');}
  if(!isAes(p)&&p.bpe.some(Boolean))para('BPE: '+p.bpe.slice(0,3).map(v=>v||'–').join(' / ')+'  |  '+p.bpe.slice(3).map(v=>v||'–').join(' / ')+(p.bpeDate?'   ('+fmtDate(p.bpeDate)+')':''));
  ensure(26);y+=14;doc.setDrawColor(...INK);
  doc.line(M,y,M+70,y);doc.line(M+90,y,M+130,y);doc.line(M+140,y,W-M,y);
  doc.setFontSize(8);doc.setTextColor(...MUT);doc.text('Dentist signature',M,y+4);doc.text(clean(dentistLine(me)),M,y+8);doc.text('Date',M+90,y+4);doc.text('Patient signature',M+140,y+4);
  const pages=doc.getNumberOfPages();
  for(let i=1;i<=pages;i++){doc.setPage(i);doc.setFontSize(7.5);doc.setTextColor(...MUT);
    doc.text('Confidential patient record – '+clean(p.first+' '+p.last)+(p.dob?', '+fmtDate(p.dob):''),M,290);doc.text('Page '+i+' of '+pages,W-M,290,{align:'right'});}
  return doc.output('blob');
}
/* Phones: share sheet (Print / Save to Files). Computers: open PDF to print, or download it. */
/* Print: open the computer's own print window (choose printer, colour / black & white, paper size, copies) straight away */
function printPdfUrl(url){return new Promise(res=>{
  document.querySelectorAll('iframe.printframe').forEach(f=>f.remove());
  const f=document.createElement('iframe');f.className='printframe';f.setAttribute('aria-hidden','true');
  f.style.cssText='position:fixed;right:0;bottom:0;width:1px;height:1px;border:0;opacity:0.01;pointer-events:none';
  let done=false;const fallback=()=>{if(done)return;done=true;const w=window.open(url,'_blank');if(!w)toast('Allow pop-ups for this site to print, or use Save PDF');res(true)};
  f.onload=()=>{setTimeout(()=>{try{f.contentWindow.focus();f.contentWindow.print();done=true;res(true)}catch(e){fallback()}},350)};
  f.src=url;document.body.appendChild(f);
  setTimeout(()=>{if(!done)fallback()},6000);
  setTimeout(()=>{try{f.remove()}catch(e){}},10*60*1000)})}
function deliverFile(blob,filename,mode){
  if(mode==='open'){const u=URL.createObjectURL(blob);setTimeout(()=>URL.revokeObjectURL(u),300000);const w=window.open(u,'_blank');if(w)return Promise.resolve(true);const a=document.createElement('a');a.href=u;a.target='_blank';a.rel='noopener';document.body.appendChild(a);a.click();a.remove();return Promise.resolve(true)}
  const touch=window.matchMedia&&matchMedia('(pointer:coarse)').matches;
  let file=null;try{file=new File([blob],filename,{type:blob.type})}catch(e){}
  if(touch&&file&&navigator.canShare&&navigator.canShare({files:[file]}))
    return navigator.share({files:[file],title:filename}).then(()=>true,e=>{if(e&&e.name==='AbortError')return false;throw e});
  const url=URL.createObjectURL(blob);setTimeout(()=>URL.revokeObjectURL(url),120000);
  if(mode==='print')return printPdfUrl(url);
  const a=document.createElement('a');a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();return Promise.resolve(true);
}
async function printRecord(p,date,mode){
  if(!window.jspdf){toast('The PDF tool did not load. Check your internet and reload the page.');return}
  if(showBal()){try{await loadPayments(p.id)}catch(e){}}
  const has=p.plan.some(i=>i.status==='completed'&&i.doneDate===date)||p.notes.some(n=>n.date===date);
  if(!has){toast('Nothing recorded on '+fmtDate(date));return}
  const fn=('Treatment_Record_'+p.last+'_'+p.first+'_'+date+'.pdf').replace(/[^\w.\-]+/g,'_');
  let blob;try{blob=buildRecord(p,date)}catch(e){toast('Could not create the record');return}
  deliverFile(blob,fn,mode).then(ok=>{if(ok)toast(mode==='print'?'Choose Print to print the record':mode==='open'?'Record opened':'Record saved')},()=>toast('Could not share the file'));
}

/* ---------- old records: import a patient list (CSV or Excel) ---------- */
let impRows=null,impErr='',impName='';
const IMP_FIELDS=[
 ['first',['first name','firstname','given name','name first']],
 ['last',['surname','last name','lastname','family name']],
 ['full',['name','full name','patient name','patient']],
 ['oldFile',['file no','file number','old file','mr no','mrn','reg no','registration no','registration number','card no','patient id','id']],
 ['dob',['date of birth','dob','birth date','birthday']],
 ['age',['age']],
 ['sex',['sex','gender']],
 ['phone',['mobile','phone','cell','contact','phone number','mobile number','whatsapp']],
 ['cnic',['cnic','nic','id card']],
 ['address',['address','city','area']],
 ['email',['email','e-mail']],
 ['since',['first visit','patient since','since','registered','date of registration','registration date','reg date','first visit date','date registered']],
 ['history',['medical history','medical','alerts','allergies','history','diseases']],
 ['past',['past treatment','previous treatment','treatment','treatment done','notes','remarks']],
 ['balance',['balance','balance due','old balance','previous balance','due','outstanding']]
];
const normH=h=>String(h||'').toLowerCase().replace(/[^a-z0-9 ]+/g,' ').replace(/\s+/g,' ').trim();
function mapHeaders(hs){const m={},used=new Set();
  for(const exact of [true,false])hs.forEach((h,i)=>{if(used.has(i))return;const n=normH(h);
    for(const [k,names] of IMP_FIELDS){if(m[k]!==undefined)continue;if(names.some(x=>exact?n===x:(x.length>3&&n.includes(x)))){m[k]=i;used.add(i);break}}});
  return m}
function parseCSV(text){
  const rows=[];let row=[],cell='',q=false;text=text.replace(/^\uFEFF/,'');
  const sep=(text.split('\n')[0].match(/;/g)||[]).length>(text.split('\n')[0].match(/,/g)||[]).length?';':',';
  for(let i=0;i<text.length;i++){const c=text[i];
    if(q){if(c==='"'){if(text[i+1]==='"'){cell+='"';i++}else q=false}else cell+=c}
    else if(c==='"')q=true;else if(c===sep){row.push(cell);cell=''}else if(c==='\n'||c==='\r'){if(c==='\r'&&text[i+1]==='\n')i++;row.push(cell);rows.push(row);row=[];cell=''}else cell+=c}
  if(cell!==''||row.length){row.push(cell);rows.push(row)}
  return rows.filter(r=>r.some(x=>String(x).trim()!==''));
}
function toISO(v){
  if(v==null||v==='')return '';if(v instanceof Date&&!isNaN(v))return dayOf(v);
  const s=String(v).trim();let m;
  if(m=s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/))return m[1]+'-'+pad(m[2])+'-'+pad(m[3]);
  if(m=s.match(/^(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{2,4})$/)){let y=+m[3];if(y<100)y+=y>30?1900:2000;return y+'-'+pad(m[2])+'-'+pad(m[1])}
  if(/^\d{5}$/.test(s)){const d=new Date(Date.UTC(1899,11,30)+(+s)*864e5);return dayOf(d)}
  return '';
}
async function readImportFile(file){
  impErr='';impRows=null;impName=file.name;
  try{
    let grid;
    if(/\.xlsx?$/i.test(file.name)){
      if(!window.XLSX)await new Promise((res,rej)=>{const s=document.createElement('script');s.src='https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js';s.onload=res;s.onerror=()=>rej(new Error('Excel reader did not load. Check your internet, or save the file as CSV.'));document.head.appendChild(s)});
      const wb=XLSX.read(await file.arrayBuffer(),{type:'array',cellDates:true});grid=XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]],{header:1,raw:true,defval:''});
    }else grid=parseCSV(await file.text());
    if(!grid||grid.length<2)throw new Error('The file has no patient rows. The first row must be the column names.');
    const map=mapHeaders(grid[0]);
    if(map.first===undefined&&map.full===undefined)throw new Error('No name column found. Name the column "Name", or "First name" and "Surname".');
    impRows=grid.slice(1).map(r=>{const g=k=>map[k]===undefined?'':r[map[k]];
      let first=String(g('first')||'').trim(),last=String(g('last')||'').trim();
      if(!first&&!last){const parts=String(g('full')||'').trim().split(/\s+/);first=parts.shift()||'';last=parts.join(' ')}
      let dob=toISO(g('dob'));const age=parseInt(g('age'));if(!dob&&age>0&&age<120)dob=(new Date().getFullYear()-age)+'-01-01';
      const sx=String(g('sex')||'').trim().toLowerCase();
      return{first,last,oldFile:String(g('oldFile')||'').trim(),dob,sex:sx.startsWith('f')?'F':sx.startsWith('m')?'M':'',phone:String(g('phone')||'').trim(),cnic:String(g('cnic')||'').trim(),address:String(g('address')||'').trim(),email:String(g('email')||'').trim(),
        since:toISO(g('since')),history:String(g('history')||'').trim(),past:String(g('past')||'').trim(),balance:Math.max(0,Math.round(parseFloat(String(g('balance')||'').replace(/[^0-9.\-]/g,''))||0))};
    }).filter(r=>r.first||r.last);
    if(!impRows.length)throw new Error('No rows with a patient name were found.');
    impRows.found=Object.keys(map).filter(k=>k!=='full'||map.first===undefined);
  }catch(e){impErr=e.message||String(e);impRows=null}
  render();
}
function importRowToPatient(r){
  const p=blankPatient();if(view.impSec==='aes')p.kind='aesthetic';Object.assign(p,{first:r.first||'–',last:r.last||'',dob:r.dob,sex:r.sex,phone:r.phone,cnic:r.cnic,address:r.address,email:r.email,oldFile:r.oldFile,since:r.since});
  const d=r.since||today();
  if(r.history||r.past)p.notes.push({id:uid(),date:d,title:'Old records',by:me.name,text:[r.history&&('Medical history: '+r.history),r.past&&('Past treatment: '+r.past)].filter(Boolean).join('\n')});
  if(r.history){p.mh.answers.other={v:'y',d:r.history}}
  if(r.balance)p.plan.push({id:uid(),tooth:'',proc:'Previous balance (old records)',surf:'',phase:5,fee:r.balance,status:'completed',doneDate:d,doneBy:me.name});
  return p;
}
function oldHandForm(){
  const n=view.oldRows||3;
  return `<form id="oldForm" class="oldform">
    <div class="grid2">
      <label class="f"><span>First name</span><input type="text" id="op-first" required></label>
      <label class="f"><span>Surname / family name</span><input type="text" id="op-last"></label>
      <label class="f"><span>Mobile</span><input type="tel" id="op-phone"></label>
      <label class="f"><span>CNIC</span><input type="text" id="op-cnic" inputmode="numeric" placeholder="00000-0000000-0"></label>
      <label class="f"><span>Date of birth</span><input type="date" id="op-dob"></label>
      <label class="f"><span>or Age</span><input type="number" id="op-age" min="0" max="120" inputmode="numeric"></label>
      <label class="f"><span>Sex</span><select id="op-sex"><option value="">—</option><option value="F">Female</option><option value="M">Male</option><option value="O">Other</option></select></label>
      <label class="f"><span>Old file / card number</span><input type="text" id="op-file"></label>
      <label class="f"><span>Patient since (first visit)</span><input type="date" id="op-since" max="${today()}"></label>
      <label class="f"><span>Old balance still due (Rs)</span><input type="number" id="op-bal" min="0" step="1" inputmode="numeric"></label>
    </div>
    <label class="f"><span>Address</span><input type="text" id="op-address"></label>
    <label class="f"><span>Medical history from the old file</span><textarea id="op-hist" rows="2" placeholder="e.g. Diabetic, allergic to penicillin"></textarea></label>
    <div class="f"><span class="small muted" style="font-weight:500">Past treatment (already done)</span>
      <div class="oldrows">${Array.from({length:n},(_,i)=>`<div class="oldrow">
        <input type="date" id="or-date-${i}" max="${today()}" aria-label="Date done">
        <input type="text" id="or-tooth-${i}" placeholder="Tooth" aria-label="Tooth">
        <select id="or-proc-${i}" aria-label="Treatment"><option value="">Treatment…</option>${(view.impSec==='aes'?AES_PROCS:PROCS).map(o=>`<option>${esc(o)}</option>`).join('')}</select>
        <input type="number" id="or-fee-${i}" placeholder="Fee Rs" min="0" step="1" inputmode="numeric" aria-label="Fee"></div>`).join('')}</div>
      <div class="row"><button type="button" class="btn small" data-act="oldMoreRows">+ More rows</button></div></div>
    <label class="f"><span>Other notes from the old file</span><textarea id="op-notes" rows="2"></textarea></label>
    <div class="row"><button class="btn primary" type="submit" data-then="open" ${readOnly()?'disabled':''}>Save and open file</button><button class="btn" type="submit" data-then="next" ${readOnly()?'disabled':''}>Save and add another</button></div>
  </form>`;
}
function importPanel(){
  const found=impRows&&impRows.found||[];const label={first:'First name',last:'Surname',full:'Name',oldFile:'File no.',dob:'Date of birth',age:'Age',sex:'Sex',phone:'Mobile',cnic:'CNIC',address:'Address',email:'Email',since:'Patient since',history:'Medical history',past:'Past treatment',balance:'Old balance'};
  return `<section class="panel imp">
    <div class="row"><h2>Add patients from old records</h2><span class="spacer"></span><button class="btn small" data-act="impClose">Close</button></div>
    <div class="seg" role="tablist"><button class="${view.impMode!=='file'?'on':''}" data-impmode="hand" role="tab">Type in by hand</button><button class="${view.impMode==='file'?'on':''}" data-impmode="file" role="tab">Import Excel / CSV</button></div>
    ${view.impMode!=='file'?`<div class="paperstart">
      <p style="margin:0">Write the old paper file into the app <b>exactly like a new patient</b>: details, medical history, chart, past treatments (RCT, scaling, fillings…) with their dates, and past payments.</p>
      <p class="small muted" style="margin:0">A small guide stays at the top while you work. When you tap <b>Finished</b>, the patient becomes a normal patient and the past treatments show in the history.</p>
      <div class="row"><button class="btn primary" data-act="paperPatient">Start – write in an old patient</button></div></div>`:`
    <p class="small muted" style="margin:0">Import your old patient list from Excel or a CSV file. The first row must contain column names such as <b>Name</b>, <b>Mobile</b>, <b>CNIC</b>, <b>File no.</b>, <b>Date of birth</b> or <b>Age</b>, <b>First visit</b>, <b>Medical history</b>, <b>Past treatment</b> and <b>Balance</b>. Columns can be in any order.</p>
    <div class="row"><button class="btn small" data-act="impTemplate">${icon('doc')} Get the template (CSV)</button>
      <label class="btn primary filebtn">Choose Excel or CSV file<input type="file" id="imp-file" accept=".csv,.xlsx,.xls,text/csv"></label></div>
    ${impErr?`<div class="msg err">${esc(impErr)}</div>`:''}
    ${impRows?`<p style="margin:0"><b>${impRows.length} patient${impRows.length>1?'s':''}</b> found in ${esc(impName)}. Recognised columns: ${found.map(k=>label[k]).join(', ')}.</p>
      <div class="tablewrap"><table class="att"><thead><tr><th>Name</th><th>File no.</th><th>Mobile</th><th>Date of birth</th><th>Patient since</th><th>Old balance</th></tr></thead><tbody>
      ${impRows.slice(0,6).map(r=>`<tr><td>${esc(r.first+' '+r.last)}</td><td>${esc(r.oldFile)}</td><td>${esc(r.phone)}</td><td class="num">${r.dob?fmtDate(r.dob):''}</td><td class="num">${r.since?fmtDate(r.since):''}</td><td class="num">${r.balance?money(r.balance):''}</td></tr>`).join('')}
      ${impRows.length>6?`<tr><td colspan="6" class="small muted">… and ${impRows.length-6} more</td></tr>`:''}</tbody></table></div>
      <div class="row"><button class="btn primary" data-act="impGo" ${readOnly()?'disabled':''}>Import ${impRows.length} patient${impRows.length>1?'s':''}</button><span class="small muted">Medical history and past treatment go into a dated clinical note. An old balance is added as "Previous balance" so it shows in Payments.</span></div>`:''}
`}
    <p class="small muted" style="margin:0">Photograph old paper files later in the patient's X-rays tab as <b>Old record (scan)</b>.</p>
  </section>`;
}

/* ---------- payments, discounts, invoice and receipt ---------- */
let payList=[],payLoading=false;
const showBal=()=>true;
const balToggle=()=>'';
const PAY_METHODS=['Cash','Card','Bank transfer','JazzCash / Easypaisa','Panel / company','Sehat Card','Cheque','Other'];
const refLabel=m=>m==='Panel / company'?'Panel company name':m==='Card'?'Card last 4 digits or slip no.':m==='Bank transfer'||m==='JazzCash / Easypaisa'?'Transaction ID':m==='Cheque'?'Cheque number':m==='Sehat Card'?'Sehat Card / claim number':'Reference (optional)';
async function loadPayments(pid){const {data,error}=await sb.from('payments').select('*').eq('patient_id',pid).order('paid_on');if(error)throw error;payList=(data||[]).sort((a,b)=>(a.paid_on+a.created_at).localeCompare(b.paid_on+b.created_at))}
async function refreshPayments(){payLoading=true;softRender();try{await loadPayments(view.pid)}catch(e){toast(friendly(e))}payLoading=false;softRender()}
function billOf(p){
  const done=p.plan.filter(i=>i.status==='completed'),planned=p.plan.filter(i=>i.status!=='completed');
  const charges=done.reduce((a,i)=>a+(+i.fee||0),0),plannedTotal=planned.reduce((a,i)=>a+(+i.fee||0),0);
  const disc=payList.reduce((a,x)=>a+(+x.discount||0),0),paid=payList.reduce((a,x)=>a+(+x.amount||0),0);
  const total=charges+plannedTotal;
  return {done,planned,charges,plannedTotal,disc,paid,balance:charges-disc-paid,total,due:total-disc-paid};
}
function numWords(n){
  n=Math.round(Math.abs(+n||0));if(!n)return 'Zero';
  const a=['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten','Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen'],
        b=['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];
  const two=x=>x<20?a[x]:b[Math.floor(x/10)]+(x%10?'-'+a[x%10]:''),three=x=>(x>=100?a[Math.floor(x/100)]+' Hundred'+(x%100?' ':''):'')+(x%100?two(x%100):'');
  const parts=[];const cr=Math.floor(n/1e7);n%=1e7;const lk=Math.floor(n/1e5);n%=1e5;const th=Math.floor(n/1e3);n%=1e3;
  if(cr)parts.push(three(cr)+' Crore');if(lk)parts.push(two(lk)+' Lakh');if(th)parts.push(two(th)+' Thousand');if(n)parts.push(three(n));
  return parts.join(' ');
}
const receiptNo=x=>'R-'+String(x.paid_on||'').replace(/-/g,'').slice(2)+'-'+String(x.id).replace(/[^a-z0-9]/gi,'').slice(-4).toUpperCase();
function payTab(p){
  const b=billOf(p),f=view.payForm||{};const method=f.method||'Cash',dtype=f.dtype||'none';
  const canPay=!readOnly();
  return `<section class="panel">
    <div class="row"><h2>Payments</h2><span class="spacer"></span>${b.due<0?'<span class="pill ok">Advance / credit</span>':b.due===0&&b.total?'<span class="pill ok">Fully paid</span>':''}</div>
    <div class="paysum">
      <div><span>Total treatment</span><b>${money(b.total)}</b></div>
      <div><span>Discount</span><b>${b.disc?'− '+money(b.disc):money(0)}</b></div>
      <div><span>Paid</span><b>${money(b.paid)}</b></div>
      <div class="${b.due>0?'due':''}"><span>${b.due<0?'Advance':'Due'}</span><b>${money(Math.abs(b.due))}</b></div>
    </div>
    <p class="small muted" style="margin:0">Total treatment = everything in the treatment plan: done so far ${money(b.charges)}${b.plannedTotal?' + still to do '+money(b.plannedTotal):''}. Every payment counts, even before the treatment is marked completed.</p>
    <div class="row"><button class="btn primary" data-act="printInvoice">${icon('doc')} Invoice with treatment</button><button class="btn" data-act="printReceipt" ${payList.length?'':'disabled'}>${icon('doc')} Payment receipt only</button></div>
    ${balToggle()}
    <p class="small muted" style="margin:0">The invoice lists the treatment, fees, discount and payments. The receipt shows only the money received, without any treatment.</p>
  </section>
  <form class="panel" id="payForm">
    <h2>Record a payment</h2>
    <div class="grid2">
      <label class="f"><span>Date</span><input type="date" id="pay-date" value="${f.date||today()}"></label>
      <label class="f"><span>Amount received (Rs)</span><input type="number" inputmode="numeric" id="pay-amt" min="0" step="1" value="${esc(f.amount??(b.due>0?b.due:''))}" placeholder="0"></label>
    </div>
    <div class="f"><span class="small muted" style="font-weight:500">Payment method</span>
      <div class="chips" role="radiogroup">${PAY_METHODS.map(m=>`<button type="button" class="chip ${m===method?'on':''}" data-paymethod="${m}" role="radio" aria-checked="${m===method}">${m}</button>`).join('')}</div></div>
    <label class="f"><span>${refLabel(method)}</span><input type="text" id="pay-ref" value="${esc(f.reference||'')}" ${method==='Panel / company'?'placeholder="e.g. ABC Textiles Ltd" required':''}></label>
    <div class="discbox">
      <div class="row"><b style="font-size:.92rem">Discount</b><span class="spacer"></span>
        <div class="seg" role="radiogroup">${[['none','No discount'],['rs','Rs'],['pct','%']].map(([k,l])=>`<button type="button" class="${dtype===k?'on':''}" data-disctype="${k}" role="radio" aria-checked="${dtype===k}">${l}</button>`).join('')}</div></div>
      ${dtype==='none'?'':`<div class="grid2">
        ${dtype==='pct'?`<label class="f"><span>Discount %</span><select id="pay-disc"><option value="">Choose %</option>${Array.from({length:20},(_,i)=>(i+1)*5).map(v=>`<option value="${v}" ${+f.dval===v?'selected':''}>${v}%</option>`).join('')}</select></label>`
          :`<label class="f"><span>Discount amount (Rs)</span><input type="number" inputmode="numeric" id="pay-disc" min="0" step="1" value="${esc(f.dval||'')}"></label>`}
        <label class="f"><span>Reason (optional)</span><input type="text" id="pay-dreason" value="${esc(f.dreason||'')}" placeholder="e.g. family, staff, loyal patient"></label></div>`}
      <div class="preview" id="payPreview">${payPreview(p)}</div>
    </div>
    <label class="f"><span>Note (optional)</span><input type="text" id="pay-note" value="${esc(f.note||'')}"></label>
    <div class="row"><button class="btn primary" type="submit" ${canPay?'':'disabled'}>Save payment</button>${canPay?'':'<span class="small" style="color:var(--alert)">Read-only: activate the app to record payments.</span>'}</div>
  </form>
  <section class="panel">
    <h2>Payment history</h2>
    ${payLoading&&!payList.length?'<div class="empty">Loading…</div>':payList.length?`<div class="tablewrap"><table class="att paytable"><thead><tr><th>Date</th><th>Receipt</th><th>Method</th><th>Amount</th><th>Discount</th><th>Received by</th><th></th></tr></thead><tbody>
      ${[...payList].reverse().map(x=>`<tr><td class="num">${fmtDate(x.paid_on)}</td><td class="num">${receiptNo(x)}</td><td>${esc(x.method)}${x.reference?`<br><span class="small muted">${esc(x.reference)}</span>`:''}</td><td class="num">${money(x.amount)}</td>
        <td class="num">${+x.discount?money(x.discount)+(x.disc_pct?` <span class="small muted">(${Number(x.disc_pct)||0}%)</span>`:'')+(x.disc_reason?`<br><span class="small muted">${esc(x.disc_reason)}</span>`:''):'–'}</td><td>${esc(x.received_by_name||'')}</td>
        <td><div class="row" style="flex-wrap:nowrap"><button class="btn small" data-payreceipt="${x.id}">Receipt</button>${view.confirm==='paydel:'+x.id?`<button class="btn small" data-act="cancelConfirm">Keep</button><button class="btn small danger" data-paydel="${x.id}">Delete</button>`:(isAdmin()||isAcct()?`<button class="btn small danger" data-askpaydel="${x.id}" aria-label="Delete payment">✕</button>`:'')}</div></td></tr>`).join('')}
    </tbody></table></div>`:'<div class="empty">No payments yet.</div>'}
  </section>`;
}
function readPayForm(p){
  const b=billOf(p);const f=Object.assign({},view.payForm||{});
  const g=id=>{const el=$('#'+id);return el?el.value:undefined};
  ['date','amount','reference','dval','dreason','note'].forEach((k,i)=>{const v=g(['pay-date','pay-amt','pay-ref','pay-disc','pay-dreason','pay-note'][i]);if(v!==undefined)f[k]=v});
  f.method=f.method||'Cash';f.dtype=f.dtype||'none';
  const dueBefore=Math.max(0,b.due);const dv=Math.max(0,parseFloat(f.dval)||0);
  const discount=f.dtype==='rs'?Math.round(dv):f.dtype==='pct'?Math.round(dueBefore*Math.min(dv,100)/100):0;
  const amount=Math.max(0,Math.round(parseFloat(f.amount)||0));
  return {f,dueBefore,discount,amount,after:b.due-discount-amount};
}
function payPreview(p){
  const r=readPayForm(p);
  return `<span>Due now <b>${money(r.dueBefore)}</b></span>${r.discount?`<span>− Discount <b>${money(r.discount)}</b></span>`:''}<span>− Paying <b>${money(r.amount)}</b></span><span class="${r.after>0?'due':'ok'}">${r.after<0?'Advance':'Due after this'} <b>${money(Math.abs(r.after))}</b></span>`;
}
function pdfBase(title){
  const {jsPDF}=window.jspdf;const doc=new jsPDF({unit:'mm',format:'a4'});
  const W=210,M=16,CW=W-2*M;const st={y:16};
  const clean=s=>String(s??'').replace(/[^\n\x20-\x7E -ÿ–—•…‘’“”]/g,'');
  const C={ACC:[31,95,107],MUT:[93,107,114],INK:[24,35,42],LINE:[200,209,207],SOFT:[225,238,239]};
  doc.setFillColor(...C.ACC);doc.rect(0,0,W,3,'F');
  let tx=M;const LG=branding&&branding.logo;if(LG){try{const fm=/^data:image\/png/.test(LG)?'PNG':'JPEG';const ip=doc.getImageProperties(LG);const h=13,w=Math.min(32,h*ip.width/ip.height);doc.addImage(LG,fm,M,st.y-4.5,w,h);tx=M+w+4}catch(e){}}
  doc.setFont('helvetica','bold');doc.setFontSize(18);doc.setTextColor(...C.INK);doc.text(title,tx,st.y+4);
  doc.setFontSize(11);doc.text(clean(clinic.name),W-M,st.y+4,{align:'right'});
  doc.setFont('helvetica','normal');doc.setFontSize(8);doc.setTextColor(...C.MUT);
  const cl2=[clinic.address,clinic.phone].filter(Boolean).join('  ·  ');if(cl2)doc.text(clean(cl2),W-M,st.y+8.5,{align:'right'});
  const rl=regLine();if(rl){doc.text(clean(rl),W-M,st.y+12.5,{align:'right'});st.y+=3}
  st.y+=14;doc.setDrawColor(...C.LINE);doc.line(M,st.y,W-M,st.y);st.y+=7;
  const ensure=h=>{if(st.y+h>270){doc.addPage();st.y=18}};
  const kv=(k,v,x,w)=>{doc.setFontSize(8);doc.setTextColor(...C.MUT);doc.text(k,x,st.y);doc.setFontSize(10);doc.setTextColor(...C.INK);doc.text(doc.splitTextToSize(clean(v),w)[0]||'',x,st.y+5)};
  const sec=t=>{ensure(14);st.y+=2;doc.setFillColor(...C.SOFT);doc.rect(M,st.y-4,CW,6.5,'F');doc.setFont('helvetica','bold');doc.setFontSize(8.5);doc.setTextColor(...C.ACC);doc.text(t.toUpperCase(),M+2,st.y);st.y+=7;doc.setFont('helvetica','normal');doc.setFontSize(9.5);doc.setTextColor(...C.INK)};
  const row=(cols,xs,opt)=>{ensure(6);opt=opt||{};doc.setFont('helvetica',opt.bold?'bold':'normal');doc.setFontSize(opt.size||9.5);doc.setTextColor(...(opt.color||C.INK));
    cols.forEach((c,i)=>{const right=opt.right&&opt.right.includes(i);doc.text(doc.splitTextToSize(clean(c),opt.w&&opt.w[i]||60)[0]||'',xs[i],st.y,right?{align:'right'}:undefined)});st.y+=opt.gap||5.6};
  const foot=(p)=>{st.y=Math.max(st.y+16,250);ensure(24);doc.setDrawColor(...C.INK);doc.line(W-M-70,st.y,W-M,st.y);doc.setFontSize(8);doc.setTextColor(...C.MUT);doc.text('Received by / signature',W-M-70,st.y+4);doc.text(clean(dentistLine(me)),W-M-70,st.y+8);
    const pages=doc.getNumberOfPages();for(let i=1;i<=pages;i++){doc.setPage(i);doc.setFontSize(7.5);doc.setTextColor(...C.MUT);doc.text(clean(clinic.name)+' – '+clean(p.first+' '+p.last),M,290);doc.text('Page '+i+' of '+pages,W-M,290,{align:'right'})}};
  return {doc,W,M,CW,st,clean,C,ensure,kv,sec,row,foot};
}
function buildInvoice(p){
  const b=billOf(p);const P=pdfBase('Invoice');const {doc,W,M,CW,st,C}=P;
  P.kv('Patient',p.first+' '+p.last,M,80);P.kv('Date',fmtDate(today()),M+90,40);P.kv('Invoice no.','INV-'+today().replace(/-/g,'').slice(2)+'-'+String(p.id).replace(/-/g,'').slice(0,4).toUpperCase(),W-M-46,46);st.y+=12;
  P.kv('Phone',p.phone||'–',M,80);P.kv('Payment',p.insurance||'–',M+90,60);st.y+=12;
  if(me.pmdc||me.role!=='accountant'){P.kv('Dentist',dentistLine(me),M,170);st.y+=13}else st.y+=1;
  const xs=[M,M+24,M+40,W-M];
  P.sec('Treatment done');
  if(b.done.length){P.row(['Date',isAes(p)?'Area':'Tooth','Treatment','Fee'],xs,{bold:true,size:8.5,color:C.MUT,right:[3],w:[22,14,110,40]});doc.setDrawColor(...C.LINE);doc.line(M,st.y-3.6,W-M,st.y-3.6);
    b.done.forEach(i=>P.row([i.doneDate?fmtDate(i.doneDate):'',i.tooth||'–',i.proc+(i.surf?' ('+i.surf+')':''),money(i.fee)],xs,{right:[3],w:[22,14,110,40]}));}
  else P.row(['No treatment completed yet.'],[M],{color:C.MUT});
  if(b.planned.length){P.sec('Treatment planned (not done yet)');
    b.planned.forEach(i=>P.row(['','',(i.tooth?i.tooth+'  ':'')+i.proc+(i.surf?' ('+i.surf+')':''),money(i.fee)],xs,{right:[3],w:[22,14,110,40],color:C.MUT}));
    P.row(['','','Planned total',money(b.plannedTotal)],xs,{right:[3],w:[22,14,110,40],color:C.MUT,bold:true});}
  if(showBal()&&payList.length){P.sec('Payments received');
    payList.forEach(x=>P.row([fmtDate(x.paid_on),'',x.method+(x.reference?' – '+x.reference:'')+(+x.discount?'   (discount '+money(x.discount)+(x.disc_pct?', '+x.disc_pct+'%':'')+')':''),money(x.amount)],xs,{right:[3],w:[22,14,120,40]}));}
  P.ensure(40);st.y+=4;const sx=W-M-80;
  const tot=(l,v,bold)=>{doc.setFont('helvetica',bold?'bold':'normal');doc.setFontSize(bold?11:9.5);doc.setTextColor(...C.INK);doc.text(l,sx,st.y);doc.text(v,W-M,st.y,{align:'right'});st.y+=bold?7:5.6};
  doc.setDrawColor(...C.LINE);doc.line(sx,st.y-4,W-M,st.y-4);
  tot('Treatment done',money(b.charges));if(b.plannedTotal)tot('Treatment still planned',money(b.plannedTotal));if(b.plannedTotal)tot('Total treatment',money(b.total),false);if(b.disc)tot('Discount','- '+money(b.disc));
  if(showBal()){tot('Paid',money(b.paid));doc.setDrawColor(...C.INK);doc.line(sx,st.y-3.5,W-M,st.y-3.5);st.y+=1.5;tot(b.due<0?'Advance (credit)':'Due',money(Math.abs(b.due)),true);}
  else{doc.setDrawColor(...C.INK);doc.line(sx,st.y-3.5,W-M,st.y-3.5);st.y+=1.5;tot('Total after discount',money(b.charges-b.disc),true);}
  P.foot(p);return doc.output('blob');
}
function buildReceipt(p,x){
  const b=billOf(p);const P=pdfBase('Payment Receipt');const {doc,W,M,CW,st,C,clean}=P;
  P.kv('Receipt no.',receiptNo(x),M,60);P.kv('Date',fmtDate(x.paid_on),M+70,40);P.kv('Received by',x.received_by_name||me.name,W-M-56,56);st.y+=14;
  doc.setFillColor(...C.SOFT);doc.roundedRect(M,st.y,CW,34,3,3,'F');
  doc.setFontSize(9);doc.setTextColor(...C.MUT);doc.text('Received with thanks from',M+6,st.y+8);
  doc.setFont('helvetica','bold');doc.setFontSize(13);doc.setTextColor(...C.INK);doc.text(clean(p.first+' '+p.last),M+6,st.y+15);
  doc.setFont('helvetica','normal');doc.setFontSize(9);doc.setTextColor(...C.MUT);doc.text(doc.splitTextToSize('Rupees '+numWords(x.amount)+' only',CW-70),M+6,st.y+23);
  doc.setFont('helvetica','bold');doc.setFontSize(20);doc.setTextColor(...C.ACC);doc.text(money(x.amount),W-M-6,st.y+18,{align:'right'});
  st.y+=44;
  const line=(k,v)=>{P.ensure(7);doc.setFont('helvetica','normal');doc.setFontSize(9);doc.setTextColor(...C.MUT);doc.text(k,M,st.y);doc.setFontSize(10);doc.setTextColor(...C.INK);doc.text(clean(v),M+48,st.y);st.y+=7};
  line('Payment method',x.method);if(x.reference)line(refLabel(x.method).replace(' (optional)',''),x.reference);
  if(+x.discount)line('Discount given',money(x.discount)+(x.disc_pct?' ('+x.disc_pct+'%)':'')+(x.disc_reason?' – '+x.disc_reason:''));
  if(x.note)line('Note',x.note);
  st.y+=3;doc.setDrawColor(...C.LINE);doc.line(M,st.y-4,W-M,st.y-4);
  line('Total treatment',money(b.total));if(b.disc)line('Total discount','- '+money(b.disc));line('Total paid to date',money(b.paid));
  doc.setFont('helvetica','bold');line(b.due<0?'Advance (credit)':'Due',money(Math.abs(b.due)));doc.setFont('helvetica','normal');
  P.foot(p);return doc.output('blob');
}
function printBill(kind,payId){
  const p=P();if(!p)return;if(!window.jspdf){toast('The PDF tool did not load. Check your internet and reload the page.');return}
  let blob,fn;
  try{if(kind==='invoice'){blob=buildInvoice(p);fn='Invoice_'+p.last+'_'+p.first+'_'+today()+'.pdf'}
    else{const x=payId?payList.find(y=>y.id===payId):payList[payList.length-1];if(!x){toast('Record a payment first');return}blob=buildReceipt(p,x);fn='Receipt_'+receiptNo(x)+'_'+p.last+'_'+p.first+'.pdf'}}
  catch(e){toast('Could not create the PDF');return}
  deliverFile(blob,fn.replace(/[^\w.\-]+/g,'_'),'print').then(ok=>{if(ok)toast(kind==='invoice'?'Invoice ready – print or save it':'Receipt ready – print or save it')},()=>toast('Could not share the file'));
}

/* ---------- appointments & reminders ---------- */
let apptsDay=[],apptsPatient=[],apptsLoading=false;
const DEFAULT_TEMPLATE='Assalam-o-Alaikum {name}, this is a reminder of your dental appointment at {clinic} on {date} at {time}. To change it, please call {phone}. Shukriya.';
const REASONS=['Check-up','Scaling & polishing','Filling','Root canal treatment','Extraction','Crown / bridge','Denture','Braces / orthodontics','Review','Emergency','Other'];
const hhmm=t=>{const d=new Date(t);let h=d.getHours();const m=pad(d.getMinutes());const ap=h>=12?'pm':'am';h=h%12||12;return h+':'+m+' '+ap};
const dayOf=t=>{const d=new Date(t);return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())};
const longDay=d=>{const x=new Date(d+'T12:00');return x.toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long'})};
const shiftDay=(d,n)=>{const x=new Date(d+'T12:00');x.setDate(x.getDate()+n);return dayOf(x)};
const STATUS_A={scheduled:['Booked','info'],arrived:['Arrived · waiting','warn'],done:['Attended','ok'],noshow:['Did not come','alert'],cancelled:['Cancelled','warn']};
function waNumber(ph){let d=String(ph||'').replace(/\D/g,'');if(d.startsWith('00'))d=d.slice(2);if(d.startsWith('0'))d='92'+d.slice(1);return d.length>=10?d:''}
function smsNumber(ph){return String(ph||'').replace(/[^\d+]/g,'')}
function reminderText(a,p){
  const tpl=(clinic.reminder_template||'').trim()||DEFAULT_TEMPLATE;
  const dn=team.find(t=>t.user_id===a.dentist_id);
  const date=new Date(a.starts_at).toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long'});
  return tpl.replace(/\{name\}/g,p?(p.first||'').trim():'').replace(/\{clinic\}/g,clinic.name||'').replace(/\{date\}/g,date).replace(/\{time\}/g,hhmm(a.starts_at)).replace(/\{phone\}/g,clinic.phone||'').replace(/\{dentist\}/g,dn?dn.name:'');
}
async function loadDay(day){
  const s=new Date(day+'T00:00:00'),e=new Date(s);e.setDate(e.getDate()+1);
  const {data,error}=await sb.from('appointments').select('*').eq('clinic_id',clinic.id).gte('starts_at',s.toISOString()).lt('starts_at',e.toISOString()).order('starts_at');
  if(error)throw error;apptsDay=data||[];
  await loadBookings(day);
}
let monthCounts={},monthLoaded='';
async function loadMonth(m){
  const s=new Date(m+'-01T00:00:00'),e=new Date(s);e.setMonth(e.getMonth()+1);
  const {data}=await sb.from('appointments').select('starts_at,status').eq('clinic_id',clinic.id).gte('starts_at',s.toISOString()).lt('starts_at',e.toISOString());
  monthCounts={};(data||[]).filter(a=>a.status!=='cancelled').forEach(a=>{const d=dayOf(a.starts_at);monthCounts[d]=(monthCounts[d]||0)+1});monthLoaded=m;
}
function calendarHtml(){
  const day=view.day||today();const m=view.month||day.slice(0,7);
  const first=new Date(m+'-01T12:00:00');const startPad=(first.getDay()+6)%7;
  const days=new Date(first.getFullYear(),first.getMonth()+1,0).getDate();
  const prev=new Date(first);prev.setMonth(prev.getMonth()-1);const next=new Date(first);next.setMonth(next.getMonth()+1);
  const mk=x=>x.getFullYear()+'-'+pad(x.getMonth()+1);
  let cells='';for(let i=0;i<startPad;i++)cells+='<span></span>';
  for(let d=1;d<=days;d++){const ds=m+'-'+pad(d),n=monthCounts[ds]||0;
    cells+=`<button class="cal-d ${ds===day?'sel':''} ${ds===today()?'today':''} ${n?'has':''}" data-day="${ds}" aria-label="${longDay(ds)}${n?', '+n+' appointment'+(n>1?'s':''):''}"><span>${d}</span>${n?`<em>${n}</em>`:''}</button>`}
  return `<section class="panel cal">
    <div class="row"><button class="btn small" data-month="${mk(prev)}" aria-label="Previous month">‹</button><b style="flex:1;text-align:center">${first.toLocaleDateString('en-GB',{month:'long',year:'numeric'})}</b><button class="btn small" data-month="${mk(next)}" aria-label="Next month">›</button></div>
    <div class="cal-grid">${['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(w=>`<span class="cal-w">${w}</span>`).join('')}${cells}</div>
    <p class="small muted" style="margin:0">Numbers show how many patients are booked that day.</p>
  </section>`;
}
async function loadPatientAppts(pid){
  const {data,error}=await sb.from('appointments').select('*').eq('patient_id',pid).order('starts_at',{ascending:false}).limit(50);
  if(error)throw error;apptsPatient=data||[];
}
async function refreshAppts(){
  try{
    if(view.screen==='appts'){apptsLoading=true;const m=view.month||(view.day||today()).slice(0,7);await Promise.all([loadDay(view.day||today()),loadMonth(m)]);}
    else if(view.screen==='patient'&&view.tab==='appts'&&view.pid){apptsLoading=true;await loadPatientAppts(view.pid);}
  }catch(e){toast(friendly(e))}
  apptsLoading=false;softRender();
}
function homeNav(active){return `<nav class="tabs homenav desk-hide" role="tablist">${pharmOnly()?'':`<button class="tab" role="tab" aria-selected="${active==='list'}" data-home="list">Patients</button><button class="tab" role="tab" aria-selected="${active==='aes'}" data-home="aes">Aesthetics</button><button class="tab" role="tab" aria-selected="${active==='appts'}" data-home="appts">Appointments</button>`}${pharmOn()&&(!pharmOnly()||isPS())?`<button class="tab" role="tab" aria-selected="${active==='pharm'}" data-home="pharm">Pharmacy${pharmBadge()?' <i class="rdot"></i>':''}</button>`:''}${labOn()&&(!pharmOnly()||isLS())?`<button class="tab" role="tab" aria-selected="${active==='lab'}" data-home="lab">Lab${labBadge()?' <i class="rdot"></i>':''}</button>`:''}<button class="tab" role="tab" aria-selected="${active==='msgs'}" data-home="msgs">Messages${unreadCount()?' <i class="rdot"></i>':''}</button>${canEarn()?`<button class="tab" role="tab" aria-selected="${active==='earn'}" data-home="earn">Earnings</button>`:''}</nav>`}
/* Team messages on this device: "patient arrived" notes and messages between staff. */
let msgs=[];
async function loadMessages(){if(!clinic)return;const {data}=await sb.from('messages').select('*').eq('clinic_id',clinic.id).order('created_at');msgs=(data||[]).slice(-300)}
const forMe=m=>(m.recipient==='all'||m.recipient===user.id)&&!(m.kind==='labclinic'&&isLS()&&!isAdmin());
const unreadCount=()=>msgs.filter(m=>forMe(m)&&m.sender!==user.id&&!(m.read_by||[]).includes(user.id)).length;
async function sendMessage(to,text,extra){
  const row=Object.assign({clinic_id:clinic.id,sender:user.id,sender_name:me.name,recipient:to,body:String(text).trim(),read_by:[user.id]},LOCAL?{created_at:new Date().toISOString()}:{},extra||{});
  const {data,error}=await sb.from('messages').insert(row);if(error)throw error;msgs.push(data[0]);
}
async function markRead(){const un=msgs.filter(m=>forMe(m)&&!(m.read_by||[]).includes(user.id));
  for(const m of un){m.read_by=(m.read_by||[]).concat(user.id);await sb.from('messages').update({read_by:m.read_by}).eq('id',m.id)}}
function arriveChooser(){
  const a=view.arriveFor&&apptsDay.find(x=>x.id===view.arriveFor);if(!a)return '';
  const p=db.patients.find(x=>x.id===a.patient_id);const docs=team.filter(t=>t.role!=='accountant');
  const pre=a.dentist_id&&docs.some(t=>t.user_id===a.dentist_id)?a.dentist_id:'all';
  return `<section class="panel arrivebox" role="dialog" aria-label="Patient arrived">
    <b>${esc(p?p.first+' '+p.last:'Patient')} has arrived – who should be told?</b>
    <div class="arrive-opts">${docs.map(t=>`<label class="chip ${pre===t.user_id?'on':''}"><input type="radio" name="arr-to" value="${esc(t.user_id)}" ${pre===t.user_id?'checked':''}> ${esc(t.name)}${t.user_id===a.dentist_id?' <small>(booked)</small>':''}${t.user_id===user.id?' <small>(you)</small>':''}</label>`).join('')}
      <label class="chip ${pre==='all'?'on':''}"><input type="radio" name="arr-to" value="all" ${pre==='all'?'checked':''}> Everyone</label></div>
    <div class="row"><button class="btn primary" data-arrsend="${a.id}">Send – patient arrived</button><button class="btn" data-act="arrCancel">Cancel</button></div>
  </section>`;
}
function msgsView(){
  const others=team.filter(x=>x.user_id!==user.id);
  const list=msgs.filter(m=>forMe(m)||m.sender===user.id);
  const todays=apptsDay.filter(a=>dayOf(a.starts_at)===today()&&a.status==='scheduled');
  let lastDay='';
  return `
  ${clockMini()}${arriveChooser()}
  <header class="top"><div style="min-width:0"><h1>Messages</h1><div class="sub">${LOCAL?'Notes between the team on this device':'Notes between the team – they appear on every computer at once'}</div></div><button class="btn small desk-hide" data-act="settings">${isAdmin()?'Clinic & account':'My account'}</button></header>
  ${homeNav('msgs')}
  <section class="panel chat">
    <div class="chat-list" id="chatList">${list.length?list.map(m=>{const d=dayOf(m.created_at);const sep=d!==lastDay?`<div class="chat-day">${d===today()?'Today':longDay(d)}</div>`:'';lastDay=d;
      const mine=m.sender===user.id;const toName=m.recipient==='all'?'Everyone':(team.find(x=>x.user_id===m.recipient)||{}).name||'';
      return `${sep}<div class="bubble ${mine?'mine':''} ${m.kind==='arrived'?'arr':''}"><div class="b-head"><b>${esc(mine?'You':m.sender_name)}</b><span>to ${esc(mine&&m.recipient!=='all'?toName:m.recipient==='all'?'everyone':'you')} · ${hm(m.created_at)}</span></div><div class="b-text">${esc(m.body)}</div>${m.patient_id&&db.patients.some(p=>p.id===m.patient_id)?`<button class="linkbtn" data-open="${m.patient_id}">Open patient file</button>`:''}</div>`}).join(''):'<p class="empty" style="margin:0">No messages yet. Write the first one below.</p>'}</div>
    <form id="msgForm" class="chat-form">
      <div class="row"><label class="small muted" for="msg-to">To</label><select id="msg-to" style="width:auto">${'<option value="all">Everyone</option>'+others.map(x=>`<option value="${x.user_id}" ${view.msgTo===x.user_id?'selected':''}>${esc(x.name)}</option>`).join('')}</select></div>
      <div class="row" style="align-items:flex-end"><textarea id="msg-text" rows="2" placeholder="Write a message, e.g. Patient in waiting room asks about the bill" style="flex:1;min-width:0"></textarea><button class="btn primary" type="submit">Send</button></div>
      ${todays.length?`<div class="row"><span class="small muted">Quick:</span>${todays.slice(0,6).map(a=>{const p=db.patients.find(x=>x.id===a.patient_id);return p?`<button class="btn small" type="button" data-arrived="${a.id}">${esc(p.first)} arrived (${hhmm(a.starts_at)})</button>`:''}).join('')}</div>`:''}
    </form>
  </section>`;
}
function apptCard(a,showPatient){
  const p=db.patients.find(x=>x.id===a.patient_id);const dn=team.find(t=>t.user_id===a.dentist_id);const st=STATUS_A[a.status]||STATUS_A.scheduled;
  const nm=p?(p.first+' '+p.last):'Patient record deleted';const phone=p&&p.phone;
  const upcoming=a.status==='scheduled'&&new Date(a.starts_at)>new Date(Date.now()-36e5);
  return `<div class="appt ${esc(a.status)}">
    <div class="tm"><b>${showPatient?hhmm(a.starts_at):fmtDate(dayOf(a.starts_at))}</b><span>${showPatient?a.duration+' min':hhmm(a.starts_at)}</span></div>
    <div class="ai">
      ${showPatient&&p?`<button class="linkbtn pn" data-open="${a.patient_id}">${esc(nm)}</button>`:showPatient?`<b>${esc(nm)}</b>`:''}${showPatient&&isAes(p)?' <span class="pill aespill">Aesthetic</span>':''}${/^Booked online/.test(a.note||'')?' <span class="onlinebadge">Booked online</span>':''}
      <span class="small">${esc(a.reason||'Appointment')}${dn?' · '+esc(dn.name):''}${a.note?' · '+esc(a.note):''}</span>
      <span class="alerts"><span class="pill ${st[1]}">${st[0]}</span>${a.reminded_at?`<span class="pill ok">Reminder opened ${fmtTime(a.reminded_at)}</span>`:(upcoming?'<span class="pill warn">No reminder yet</span>':'')}${p&&!phone?'<span class="pill alert">No mobile number</span>':''}</span>
      ${upcoming&&phone?`<div class="row"><button class="btn small primary" data-sms="${a.id}">SMS reminder</button><button class="btn small wa" data-wa="${a.id}">WhatsApp</button></div>`:''}
      <div class="row">${a.status==='scheduled'&&dayOf(a.starts_at)===today()?`<button class="btn small primary" data-arrived="${a.id}">Patient arrived</button>`:''}${a.status==='scheduled'||a.status==='arrived'?`<button class="btn small" data-ast="done" data-aid="${a.id}">Attended</button><button class="btn small" data-ast="noshow" data-aid="${a.id}">Did not come</button><button class="btn small" data-ast="cancelled" data-aid="${a.id}">Cancel</button>`:`<button class="btn small" data-ast="scheduled" data-aid="${a.id}">Back to booked</button>`}
      ${view.confirm==='adel:'+a.id?`<button class="btn small" data-act="cancelConfirm">Keep</button><button class="btn small danger" data-adel="${a.id}">Yes, delete</button>`:`<button class="btn small danger" data-askadel="${a.id}">Delete</button>`}</div>
    </div>
  </div>`;
}
/* ---- Online booking (online version): patients book a free time from the clinic's QR code / link ---- */
let booking={cfg:null,code:null,err:'',day:[],waiting:[],all:[]};
const BK_DAYS=[[1,'Monday'],[2,'Tuesday'],[3,'Wednesday'],[4,'Thursday'],[5,'Friday'],[6,'Saturday'],[0,'Sunday']];
const BK_DEFAULT={enabled:false,slot:30,chairs:1,days:30,tz:300,hours:{1:['09:00','17:00'],2:['09:00','17:00'],3:['09:00','17:00'],4:['09:00','17:00'],5:['09:00','17:00'],6:['10:00','14:00']}};
const bookingLink=()=>booking.code?location.origin+location.pathname.replace(/[^/]*$/,'')+'book.html?c='+encodeURIComponent(booking.code):'';
async function loadBookingCfg(){
  if(LOCAL||!clinic)return;
  try{const {data,error}=await sb.from('clinics').select('booking,booking_code').eq('id',clinic.id).single();if(error)throw error;
    booking.cfg=Object.assign({},BK_DEFAULT,data.booking||{});booking.code=data.booking_code||null;booking.err='';await loadBookings(today())}
  catch(e){booking.err=/booking|column|schema cache/i.test(e.message||'')?'needsql':friendly(e)}
}
async function loadBookings(day){
  if(LOCAL||booking.err||!clinic)return;
  try{const since=new Date(Date.now()-45*864e5).toISOString();
    const {data,error}=await sb.from('online_bookings').select('*').eq('clinic_id',clinic.id).gte('starts_at',since).order('starts_at');if(error)throw error;
    booking.all=data||[];const now=Date.now()-36e5;booking.waiting=booking.all.filter(b=>b.status==='new'&&new Date(b.starts_at).getTime()>now);
    booking.day=booking.waiting.filter(b=>dayOf(b.starts_at)===day)}catch(e){}
}
function bookingCard(b){
  const wa=String(b.phone).replace(/[^0-9]/g,'').replace(/^0/,'92');
  return `<div class="appt online"><div class="tm"><b>${hhmm(b.starts_at)}</b><span>${fmtDate(dayOf(b.starts_at))}</span></div>
    <div class="ai"><div class="row" style="gap:8px"><b>${esc(b.name)}</b><span class="onlinebadge">Online booking</span></div>
      <div class="small muted">${esc(b.phone)}${b.reason?' · '+esc(b.reason):''} · ${b.duration} min</div>
      <div class="row">${readOnly()?'':`<button class="btn small primary" data-bkaccept="${b.id}">Accept – add to appointments</button><button class="btn small" data-bkdecline="${b.id}">Decline</button>`}
        <a class="btn small" href="https://wa.me/${esc(wa)}" target="_blank" rel="noopener">WhatsApp</a><a class="btn small" href="tel:${esc(b.phone)}">Call</a></div></div></div>`;
}
function bkMsg(b,kind){const when=fmtDate(dayOf(b.starts_at))+' at '+hhmm(b.starts_at);const ph=clinic.phone?' or call us on '+clinic.phone:'';
  if(kind==='accepted')return 'Assalam-o-Alaikum '+b.name+',\nyour appointment at '+clinic.name+' on '+when+' is confirmed. Please arrive 10 minutes early.'+(clinic.phone?'\nIf you cannot come, please call us on '+clinic.phone+'.':'');
  return 'Assalam-o-Alaikum '+b.name+',\nsorry – your online booking at '+clinic.name+' on '+when+' could not be confirmed. Please choose another time here: '+bookingLink()+ph+'.';}
function bkNotifyBar(){const n=view.bkNotify;if(!n)return '';const b=booking.all.find(x=>x.id===n.id);if(!b)return '';
  const msg=bkMsg(b,n.kind);const wa=String(b.phone).replace(/[^0-9]/g,'').replace(/^0/,'92');const ios=/iPhone|iPad|iPod/.test(navigator.userAgent);
  return `<section class="panel bknotify ${n.kind}"><div class="row"><b>${n.kind==='accepted'?'Tell '+esc(b.name)+' the booking is confirmed':'Tell '+esc(b.name)+' the booking is not confirmed'}</b><span class="spacer"></span><button class="btn small" data-act="bkNotifyClose">Close</button></div>
    <p class="small" style="margin:0;white-space:pre-line">${esc(msg)}</p>
    <div class="row"><a class="btn small wa primary" href="https://wa.me/${esc(wa)}?text=${encodeURIComponent(msg)}" target="_blank" rel="noopener">Send on WhatsApp</a><a class="btn small" href="sms:${esc(String(b.phone).replace(/[^0-9+]/g,''))}${ios?'&':'?'}body=${encodeURIComponent(msg)}">Send SMS</a><a class="btn small" href="tel:${esc(b.phone)}">Call</a></div></section>`}
const BK_ST={new:['Waiting','warn'],accepted:['Accepted – in appointments','ok'],declined:['Declined','alert'],cancelled:['Cancelled','alert']};
function bookingHistoryPanel(){
  if(LOCAL||booking.err||!booking.all.length)return '';
  const list=[...booking.all].sort((a,b)=>String(b.starts_at).localeCompare(String(a.starts_at)));
  const dec=list.filter(b=>b.status==='declined').length;
  return `<details class="panel bkhist" ${view.bkHistOpen?'open':''}><summary><b>All online bookings</b> <span class="small muted">· ${list.length} in the last 45 days and upcoming${dec?' · '+dec+' declined':''}</span></summary>
    <div class="bkhist-list">${list.map(b=>{const st=BK_ST[b.status]||BK_ST.new;const wa=String(b.phone).replace(/[^0-9]/g,'').replace(/^0/,'92');
      return `<div class="bkrow ${esc(b.status)}"><div class="tm"><b>${hhmm(b.starts_at)}</b><span>${fmtDate(dayOf(b.starts_at))}</span></div>
      <div class="ai"><div class="row" style="gap:8px"><b>${esc(b.name)}</b><span class="pill ${st[1]}">${st[0]}</span></div>
        <div class="small muted">${esc(b.phone)}${b.reason?' · '+esc(b.reason):''} · booked ${fmtDate(dayOf(b.created_at))} ${hhmm(b.created_at)}</div>
        <div class="row">${b.status==='declined'&&!readOnly()?`<button class="btn small" data-bkrestore="${b.id}">Restore</button>`:''}${b.status==='declined'||b.status==='accepted'?`<button class="btn small" data-bknotify="${b.id}" data-kind="${b.status}">Message patient</button>`:''}<a class="btn small" href="https://wa.me/${esc(wa)}" target="_blank" rel="noopener">WhatsApp</a><a class="btn small" href="tel:${esc(b.phone)}">Call</a></div></div></div>`}).join('')}</div></details>`;
}
function bookingWaitingPanel(){
  if(LOCAL)return '';if(!booking.waiting.length)return bkNotifyBar()+bookingHistoryPanel();
  return bkNotifyBar()+`<section class="panel bkwait"><div class="row"><h3 style="margin:0">Online bookings waiting</h3><span class="pill warn">${booking.waiting.length}</span><span class="spacer"></span><span class="small muted">Booked by patients from your QR code</span></div>
    <div class="appts">${booking.waiting.map(bookingCard).join('')}</div></section>${bookingHistoryPanel()}`;
}
async function acceptBooking(id){
  const b=booking.waiting.find(x=>x.id===id);if(!b)return;
  const digits=s=>String(s||'').replace(/[^0-9]/g,'').slice(-10);
  let p=db.patients.find(x=>!isAes(x)&&digits(x.phone)&&digits(x.phone)===digits(b.phone))||db.patients.find(x=>digits(x.phone)&&digits(x.phone)===digits(b.phone));
  let created=false;
  if(!p){p=blankPatient();const parts=String(b.name).trim().split(/\s+/);p.first=parts.shift()||b.name;p.last=parts.join(' ');p.phone=b.phone;
    p.notes.push({id:uid(),date:today(),title:'Online booking',by:me.name,text:'Booked online for '+fmtDate(dayOf(b.starts_at))+' at '+hhmm(b.starts_at)+(b.reason?'. Reason: '+b.reason:'')+'.'});
    db.patients.push(p);markDirty(p.id);created=true}
  if(dirty.size)await flush();
  const {data,error}=await sb.from('appointments').insert({clinic_id:clinic.id,patient_id:p.id,starts_at:b.starts_at,duration:b.duration,reason:b.reason?('Online: '+b.reason):'Online booking',note:'Booked online by the patient',dentist_id:null}).select();
  if(error)throw error;const ap=Array.isArray(data)?data[0]:data;
  const r=await sb.from('online_bookings').update({status:'accepted',appointment_id:ap&&ap.id}).eq('id',id);if(r.error)throw r.error;
  booking.waiting=booking.waiting.filter(x=>x.id!==id);booking.day=booking.day.filter(x=>x.id!==id);Object.assign(b,{status:'accepted',appointment_id:ap&&ap.id});
  toast((created?'New patient file made for ':'Added to ')+b.name+' – '+fmtDate(dayOf(b.starts_at))+' '+hhmm(b.starts_at));
}
function bookingSettingsPanel(){
  if(!isAdmin())return '';
  if(LOCAL)return `<section class="panel"><h3>Online booking</h3><p class="small muted" style="margin:0">Patients can book online only in the online version of the app, because their phones must reach your records over the internet.</p></section>`;
  if(booking.err==='needsql')return `<section class="panel"><h3>Online booking</h3><div class="msg warn">This needs one small database update. Open <b>Supabase → SQL Editor</b>, paste <b>supabase-update-oct2026.sql</b> and press <b>Run</b>, then reload.</div></section>`;
  if(!booking.cfg)return `<section class="panel"><h3>Online booking</h3><p class="small muted">Loading…</p></section>`;
  const c=booking.cfg,link=bookingLink();
  return `<section class="panel"><div class="row"><h3 style="margin:0">Online booking</h3><span class="spacer"></span><span class="pill ${c.enabled?'ok':'warn'}">${c.enabled?'On – patients can book':'Off'}</span></div>
    <p class="small muted" style="margin:0">Patients scan your QR code (or open the link), pick a free time and write their name and mobile. The booking appears in Appointments at once, with a sound. You accept it with one tap.</p>
    <form id="bookingForm" style="display:flex;flex-direction:column;gap:10px">
      <label class="row small" style="gap:10px"><input type="checkbox" id="bk-on" ${c.enabled?'checked':''} style="width:22px;height:22px"> <b>Allow online booking</b></label>
      <div class="grid3">
        <label class="f"><span>Length of one booking</span><select id="bk-slot">${[15,20,30,45,60].map(n=>`<option value="${n}" ${+c.slot===n?'selected':''}>${n} minutes</option>`).join('')}</select></label>
        <label class="f"><span>Patients at the same time</span><select id="bk-chairs">${[1,2,3,4,5].map(n=>`<option value="${n}" ${+c.chairs===n?'selected':''}>${n} (${n===1?'one chair':n+' chairs / dentists'})</option>`).join('')}</select></label>
        <label class="f"><span>Patients can book up to</span><select id="bk-days">${[7,14,30,60].map(n=>`<option value="${n}" ${+c.days===n?'selected':''}>${n} days ahead</option>`).join('')}</select></label>
      </div>
      <div class="bkhours">${BK_DAYS.map(([d,l])=>{const h=(c.hours||{})[d];return `<div class="bkday"><label class="row small" style="gap:8px;min-width:140px"><input type="checkbox" data-bkopen="${d}" ${h?'checked':''} style="width:20px;height:20px"> ${l}</label>
        <input type="time" id="bk-from-${d}" value="${h?h[0]:'09:00'}" ${h?'':'disabled'} aria-label="${l} opens"><span class="small muted">to</span><input type="time" id="bk-to-${d}" value="${h?h[1]:'17:00'}" ${h?'':'disabled'} aria-label="${l} closes"></div>`}).join('')}</div>
      <div class="bkoff"><b class="small">Holidays – clinic closed</b>
        <div class="row" style="gap:8px;align-items:flex-end"><label class="f" style="flex:1;min-width:140px"><span>From *</span><input type="text" id="bk-offfrom" placeholder="Choose date" onfocus="this.type='date'" onblur="if(!this.value)this.type='text'"></label><label class="f" style="flex:1;min-width:140px"><span>To *</span><input type="text" id="bk-offto" placeholder="Choose date" onfocus="this.type='date'" onblur="if(!this.value)this.type='text'"></label><button type="button" class="btn small primary" data-act="bkOffAdd">Add holiday</button><button type="button" class="btn small danger" data-act="bkOffClear">Clear all holidays</button></div>
        <input type="hidden" id="bk-off" value="${esc((c.off||[]).join(','))}"><div id="bkOffList" class="row" style="gap:6px">${bkOffChips(c.off||[])}</div>
        <label class="row small" style="gap:8px"><input type="checkbox" id="bk-holext" ${c.holext===false?'':'checked'} style="width:20px;height:20px"> Add holiday days to the booking period, (patients can still book after the holiday – e.g. 30 days + 5 holiday days = 35 days)</label>
        <label class="f"><span>Message for patients on holidays (optional)</span><input type="text" id="bk-offnote" maxlength="120" value="${esc(c.offNote||'')}" placeholder="e.g. Closed for Eid ul-Adha – open again on Monday"></label></div>
      <p class="small muted" style="margin:0">Times are Pakistan time. Existing appointments and bookings are never offered again.</p>
      <div class="row"><button class="btn primary" type="submit">Save booking settings</button></div>
    </form>
    ${link?`<div class="bkqr"><div id="bkQr" class="bkqr-code" aria-label="QR code for online booking"></div>
      <div style="display:flex;flex-direction:column;gap:8px;min-width:0"><b>Your booking QR code</b><a class="bklink" href="${esc(link)}" target="_blank" rel="noopener">${esc(link)}</a>
      <div class="row"><button class="btn small" data-act="bkCopy">Copy link</button><button class="btn small" data-act="bkShare">Share</button><button class="btn small primary" data-act="bkPoster">${icon('doc')} Print QR poster</button><button class="btn small" data-act="bkNewCode">New code</button></div>
      <p class="small muted" style="margin:0">Print the poster for your reception, or post the link on WhatsApp, Facebook or Google. "New code" makes the old QR stop working.</p></div></div>`:''}
  </section>`;
}
function qrInto(el,text,size){return new Promise(res=>{const go=()=>{try{el.innerHTML='';new window.QRCode(el,{text,width:size,height:size,colorDark:'#0B2227',colorLight:'#ffffff',correctLevel:window.QRCode.CorrectLevel.M})}catch(e){}res()};
  if(window.QRCode)return go();if(!qrLib)qrLib=new Promise((r,j)=>{const s=document.createElement('script');s.src='https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';s.onload=r;s.onerror=j;document.head.appendChild(s)});qrLib.then(go,()=>res())})}
function fillBookingQr(){const el=document.getElementById('bkQr');if(el&&!el.childElementCount&&bookingLink())qrInto(el,bookingLink(),168)}
async function bookingPoster(){
  if(!window.jspdf){toast('The PDF tool did not load. Check your internet and reload the page.');return}
  const link=bookingLink();if(!link)return;const tmp=document.createElement('div');tmp.style.cssText='position:fixed;left:-9999px';document.body.appendChild(tmp);
  await qrInto(tmp,link,600);const cv=tmp.querySelector('canvas');const img=tmp.querySelector('img');const src=cv?cv.toDataURL('image/png'):img&&img.src;tmp.remove();
  if(!src){toast('The QR code could not be made. Check your internet and try again.');return}
  const {jsPDF}=window.jspdf;const doc=new jsPDF({unit:'mm',format:'a4'});const W=210;
  doc.setFillColor(11,34,39);doc.rect(0,0,W,62,'F');
  let ty=26;if(branding.logo){try{const fm=/^data:image\/png/.test(branding.logo)?'PNG':'JPEG';const ip=doc.getImageProperties(branding.logo);const h=18,w=Math.min(50,h*ip.width/ip.height);doc.setFillColor(255,255,255);doc.roundedRect(W/2-w/2-3,8,w+6,h+4,3,3,'F');doc.addImage(branding.logo,fm,W/2-w/2,10,w,h);ty=40}catch(e){}}
  doc.setTextColor(244,246,244);doc.setFont('helvetica','bold');doc.setFontSize(24);doc.text(String(clinic.name).replace(/[^\x20-\x7E -ÿ]/g,''),W/2,ty,{align:'center'});
  doc.setFont('helvetica','normal');doc.setFontSize(12);doc.setTextColor(127,211,203);const sub=[clinic.address,clinic.phone].filter(Boolean).join('  ·  ');if(sub)doc.text(sub.replace(/[^\x20-\x7E -ÿ]/g,''),W/2,ty+9,{align:'center'});
  doc.setTextColor(24,35,42);doc.setFont('helvetica','bold');doc.setFontSize(30);doc.text('Book your appointment',W/2,86,{align:'center'});
  doc.setFont('helvetica','normal');doc.setFontSize(14);doc.setTextColor(93,107,114);doc.text('Scan the code with your phone camera and choose a free time',W/2,96,{align:'center'});
  doc.addImage(src,'PNG',W/2-45,106,90,90);doc.setDrawColor(200,209,207);doc.roundedRect(W/2-50,101,100,100,4,4);
  doc.setFontSize(11);doc.setTextColor(31,95,107);const ll=doc.splitTextToSize(link,170);doc.text(ll,W/2,214,{align:'center'});
  doc.setFontSize(12);doc.setTextColor(93,107,114);doc.text(['1. Open the camera and point it at the code','2. Choose a day and a free time','3. Write your name and mobile number – done!'],W/2-55,236);
  doc.setFontSize(8);doc.text('Clinic Patient Records',W/2,288,{align:'center'});
  await deliverFile(doc.output('blob'),('Booking_QR_'+clinic.name+'.pdf').replace(/[^\w.\-]+/g,'_'),'save');
}
function bkOffChips(list){const t=today();const l=[...list].filter(x=>x>=t).sort();return l.length?l.map(x=>`<span class="pill info bkoffchip">${fmtDate(x)} <button type="button" class="linkbtn" data-bkoffdel="${x}" aria-label="Remove ${fmtDate(x)}">✕</button></span>`).join(''):'<span class="small muted">No holidays added</span>'}
async function bkOffSave(){ // holidays are saved at once, so they can't be forgotten
  const off=String($('#bk-off').value||'').split(',').filter(x=>/^\d{4}-\d{2}-\d{2}$/.test(x)&&x>=today()).sort();
  const cfg=Object.assign({},booking.cfg,{off});const {error}=await sb.from('clinics').update({booking:cfg}).eq('id',clinic.id);
  if(error){toast(friendly(error));return false}booking.cfg.off=off;return true}
function bkOffSet(list){const el=$('#bk-off');if(!el)return;const u=[...new Set(list)].filter(x=>/^\d{4}-\d{2}-\d{2}$/.test(x)).sort();el.value=u.join(',');$('#bkOffList').innerHTML=bkOffChips(u)}
const newBookingCode=()=>{const a='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';return [...crypto.getRandomValues(new Uint8Array(10))].map(x=>a[x%a.length]).join('')};
function apptsView(){
  const day=view.day||today();
  const act=apptsDay.filter(a=>a.status!=='cancelled');
  const need=apptsDay.filter(a=>a.status==='scheduled'&&!a.reminded_at).length;
  return `
  ${clockMini()}${arriveChooser()}
  <header class="top">
    <div style="min-width:0"><h1>${esc(clinic.name)}</h1><div class="sub">${esc(me.name)} ${syncBadge()}</div></div>
    <button class="btn small desk-hide" data-act="settings">${isAdmin()?'Clinic & account':'My account'}</button>
  </header>
  ${homeNav('appts')}
  ${bookingWaitingPanel()}
  <div class="appts-layout">
  ${calendarHtml()}
  <section class="panel">
    <div class="row daynav"><button class="btn small" data-day="${shiftDay(day,-1)}" aria-label="Previous day">‹</button>
      <div style="flex:1;min-width:0;text-align:center"><b>${day===today()?'Today':day===shiftDay(today(),1)?'Tomorrow':longDay(day).split(' ')[0]}</b><div class="small muted">${longDay(day)}</div></div>
      <button class="btn small" data-day="${shiftDay(day,1)}" aria-label="Next day">›</button></div>
    <div class="row"><input type="date" id="dayPick" value="${day}" style="max-width:180px"><span class="spacer"></span>
      ${day!==today()?'<button class="btn small" data-day="'+today()+'">Today</button>':''}<button class="btn small" data-day="${shiftDay(today(),1)}">Tomorrow</button></div>
    <div class="small muted">${apptsLoading?'Loading…':act.length+' appointment'+(act.length===1?'':'s')+(need?' · '+need+' without a reminder':'')}</div>
    ${apptsDay.length||booking.day.length?`<div class="appts">${[...apptsDay.map(a=>({t:a.starts_at,h:apptCard(a,true)})),...booking.day.map(b=>({t:b.starts_at,h:bookingCard(b)}))].sort((x,y)=>String(x.t).localeCompare(String(y.t))).map(x=>x.h).join('')}</div>`:(apptsLoading?'':'<div class="empty">No appointments this day. Book one from a patient’s file, in the Appointments tab.</div>')}
  </section>
  </div>
  <p class="small muted">Reminders open the SMS or WhatsApp app on this phone with the message ready. You tap Send. Change the message in Clinic & account.</p>`;
}
function apptTab(p){
  const f=view.apptForm||{};
  return `<section class="panel">
    <h2>Book appointment</h2>
    <form id="apptForm" class="grid2">
      <label class="f"><span>Date</span><input type="date" id="ap-date" value="${f.date||shiftDay(today(),1)}" required></label>
      <label class="f"><span>Time</span><input type="time" id="ap-time" value="${f.time||'10:00'}" step="300" required></label>
      <label class="f"><span>Reason</span><select id="ap-reason">${REASONS.map(r=>`<option ${f.reason===r?'selected':''}>${r}</option>`).join('')}</select></label>
      <label class="f"><span>Length</span><select id="ap-dur">${[15,20,30,45,60,90,120].map(m=>`<option value="${m}" ${(+f.dur||30)===m?'selected':''}>${m} min</option>`).join('')}</select></label>
      <label class="f"><span>Dentist</span><select id="ap-dentist">${team.map(t=>`<option value="${t.user_id}" ${(f.dentist||user.id)===t.user_id?'selected':''}>${esc(t.name)}</option>`).join('')}</select></label>
      <label class="f"><span>Note (optional)</span><input type="text" id="ap-note" value="${esc(f.note||'')}" placeholder="e.g. bring old X-ray"></label>
      <div class="row" style="grid-column:1/-1"><button class="btn primary" type="submit">Book appointment</button>${p.phone?'':'<span class="small" style="color:var(--alert)">Add a mobile number in Details to send reminders.</span>'}</div>
    </form>
  </section>
  <section class="panel">
    <h2>Appointments</h2>
    ${apptsLoading?'<div class="empty">Loading…</div>':apptsPatient.length?`<div class="appts">${apptsPatient.map(a=>apptCard(a,false)).join('')}</div>`:'<div class="empty">No appointments yet.</div>'}
  </section>`;
}
async function sendReminder(id,via){
  const a=apptsDay.concat(apptsPatient).find(x=>x.id===id);if(!a)return;
  const p=db.patients.find(x=>x.id===a.patient_id);if(!p||!p.phone){toast('Add a mobile number first');return}
  const msg=reminderText(a,p);
  if(via==='wa'){const n=waNumber(p.phone);if(!n){toast('Check the mobile number');return}window.open('https://wa.me/'+n+'?text='+encodeURIComponent(msg),'_blank');}
  else{const ios=/iPhone|iPad|iPod/.test(navigator.userAgent);location.href='sms:'+smsNumber(p.phone)+(ios?'&':'?')+'body='+encodeURIComponent(msg);}
  const now=new Date().toISOString();
  const {error}=await sb.from('appointments').update({reminded_at:now}).eq('id',id);
  if(!error){[apptsDay,apptsPatient].forEach(l=>{const x=l.find(y=>y.id===id);if(x)x.reminded_at=now});setTimeout(softRender,300);}
}

/* ---------- X-rays ---------- */
let xrays=[],xrLoading=false,xrUrls={},xrView=null,xrBusy=false;
const XR_KINDS=['Old record (scan)','Microscope photo','Intraoral camera photo','OPG','Periapical (PA)','Bitewing (BW)','Lateral ceph','CBCT / scan report','Intraoral photo','Extraoral photo','Other'];
async function loadXrays(pid){
  const {data,error}=await sb.from('xrays').select('*').eq('patient_id',pid).order('taken_on',{ascending:false});
  if(error)throw error;xrays=data||[];
  const need=xrays.map(x=>x.path).filter(p=>!xrUrls[p]);
  if(need.length){const {data:urls}=await sb.storage.from('xrays').createSignedUrls(need,3600);(urls||[]).forEach(u=>{if(u.signedUrl)xrUrls[u.path]=u.signedUrl});}
}
async function refreshXrays(){xrLoading=true;softRender();try{await loadXrays(view.pid)}catch(e){toast(friendly(e))}xrLoading=false;softRender()}
function shrinkImage(file){
  return new Promise(res=>{
    if(!/^image\/(jpeg|png|webp|bmp|x-ms-bmp)$/.test(file.type)){res({blob:file,type:file.type||'application/octet-stream'});return}
    const isBmp=/bmp/.test(file.type);
    const img=new Image(),url=URL.createObjectURL(file);
    img.onload=()=>{const max=3000,w=img.naturalWidth,h=img.naturalHeight,sc=Math.min(1,max/Math.max(w,h));
      if(sc===1&&file.size<4e6&&!isBmp){URL.revokeObjectURL(url);res({blob:file,type:file.type});return}
      const c=document.createElement('canvas');c.width=Math.round(w*sc);c.height=Math.round(h*sc);c.getContext('2d').drawImage(img,0,0,c.width,c.height);
      c.toBlob(b=>{URL.revokeObjectURL(url);res(b?{blob:b,type:'image/jpeg'}:{blob:file,type:file.type})},'image/jpeg',0.92)};
    img.onerror=()=>{URL.revokeObjectURL(url);res({blob:file,type:file.type})};img.src=url;
  });
}
async function uploadXrays(files,metaIn){
  const p=P();if(!p||!files.length)return;
  const meta=metaIn||{kind:$('#xr-kind').value,teeth:$('#xr-teeth').value.trim(),taken_on:$('#xr-date').value||today(),note:$('#xr-note').value.trim()};
  if(dirty.has(p.id))await flush();
  xrBusy=true;render();let ok=0;
  for(const f of files){
    try{
      const {blob,type}=await shrinkImage(f);
      const ext=type==='application/pdf'?'pdf':type==='image/png'?'png':'jpg';
      const path=clinic.id+'/'+p.id+'/'+uuid()+'.'+ext;
      const up=await sb.storage.from('xrays').upload(path,blob,{contentType:type,upsert:false});if(up.error)throw up.error;
      const row={clinic_id:clinic.id,patient_id:p.id,path,kind:meta.kind,teeth:meta.teeth,taken_on:meta.taken_on,note:meta.note,mime:type,size_bytes:blob.size||0};
      const ins=await sb.from('xrays').insert(row);if(ins.error){await sb.storage.from('xrays').remove([path]);throw ins.error}
      ok++;
    }catch(e){toast('Could not upload '+(f.name||'file')+': '+friendly(e))}
  }
  xrBusy=false;if(ok)toast(ok+' X-ray'+(ok>1?'s':'')+' saved');await refreshXrays();
}
/* X-ray machine folder (Chrome / Edge on a computer): watch the folder the X-ray software saves into. */
const FOLDER_OK='showDirectoryPicker' in window;
const devStore={db:null,open(){return this.db||(this.db=new Promise((res,rej)=>{const r=indexedDB.open('clinic-device-settings',1);r.onupgradeneeded=()=>r.result.createObjectStore('kv');r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)}))},
  async get(k){const d=await this.open();return new Promise((res,rej)=>{const q=d.transaction('kv').objectStore('kv').get(k);q.onsuccess=()=>res(q.result);q.onerror=()=>rej(q.error)})},
  async set(k,v){const d=await this.open();return new Promise((res,rej)=>{const tx=d.transaction('kv','readwrite');tx.objectStore('kv').put(v,k);tx.oncomplete=()=>res();tx.onerror=()=>rej(tx.error)})}};
const XR_EXT=/\.(jpe?g|png|bmp|webp|pdf)$/i;
let xrDir=null,xrDirState='none',xrSeen=new Set(),xrFound=[],xrWatchT=null,xrWatchFrom=0;
async function loadXrDir(){if(!FOLDER_OK)return;try{xrDir=await devStore.get('xrayDir')}catch(e){xrDir=null}
  xrDirState=!xrDir?'none':(await xrDir.queryPermission({mode:'read'}))==='granted'?'ok':'ask';
  try{xrSeen=new Set(JSON.parse(lsGet('xrSeen')||'[]'))}catch(e){xrSeen=new Set()}}
function rememberSeen(k){xrSeen.add(k);lsSet('xrSeen',JSON.stringify([...xrSeen].slice(-3000)))}
async function scanDir(dir,depth,out){
  for await(const [name,h] of dir.entries()){
    if(h.kind==='file'&&XR_EXT.test(name)){const f=await h.getFile();out.push({name,handle:h,file:f,key:name+'|'+f.size+'|'+f.lastModified})}
    else if(h.kind==='directory'&&depth<2)await scanDir(h,depth+1,out);
    if(out.length>4000)break;
  }return out}
async function scanXrayFolder(){
  if(xrDirState!=='ok'||view.screen!=='patient'||view.tab!=='xrays')return;
  try{const all=await scanDir(xrDir,0,[]);
    const fresh=all.filter(x=>!xrSeen.has(x.key)&&x.file.lastModified>=xrWatchFrom).sort((a,b)=>b.file.lastModified-a.file.lastModified);
    const before=new Set(xrFound.map(x=>x.key));xrFound=fresh.slice(0,12);
    if(xrFound.some(x=>!before.has(x.key))){Sound.play('success');refreshFolderPanel()}
  }catch(e){xrDirState='ask';refreshFolderPanel()}
}
function refreshFolderPanel(){const el=$('#xrFolderPanel');if(el)el.outerHTML=folderPanel();else softRender()}
function startXrWatch(){stopXrWatch();if(!FOLDER_OK)return;xrWatchFrom=Date.now()-15*60*1000;xrFound=[];
  loadXrDir().then(()=>{refreshFolderPanel();scanXrayFolder()});xrWatchT=setInterval(scanXrayFolder,4000)}
function stopXrWatch(){if(xrWatchT)clearInterval(xrWatchT);xrWatchT=null}
let camStream=null,camDevices=[],camErr='';
const CAM_OK=!!(navigator.mediaDevices&&navigator.mediaDevices.getUserMedia);
async function startCamera(deviceId){
  stopCamera();camErr='';
  try{camStream=await navigator.mediaDevices.getUserMedia({video:deviceId?{deviceId:{exact:deviceId},width:{ideal:1920},height:{ideal:1080}}:{width:{ideal:1920},height:{ideal:1080}},audio:false});
    camDevices=(await navigator.mediaDevices.enumerateDevices()).filter(d=>d.kind==='videoinput');view.camId=deviceId||(camStream.getVideoTracks()[0].getSettings().deviceId);}
  catch(e){camErr=e&&e.name==='NotAllowedError'?'Camera access was blocked. Allow the camera for this site in the browser, then try again.':'No camera found. Connect the microscope or intraoral camera by USB (or an HDMI capture adapter) and try again.'}
  render();const v=$('#camVideo');if(v&&camStream){v.srcObject=camStream;v.play().catch(()=>{})}
}
function stopCamera(){if(camStream){camStream.getTracks().forEach(t=>t.stop());camStream=null}}
function cameraPanel(){
  if(!CAM_OK)return '';
  return `<section class="panel" id="camPanel">
    <div class="row"><h2>Microscope / intraoral camera</h2><span class="spacer"></span>${camStream?'<span class="pill ok">Live</span>':''}</div>
    ${camStream?`<div class="cam-box"><video id="camVideo" autoplay playsinline muted></video></div>
      <div class="row">${camDevices.length>1?`<select id="camSel" style="width:auto">${camDevices.map((d,i)=>`<option value="${d.deviceId}" ${d.deviceId===view.camId?'selected':''}>${esc(d.label||'Camera '+(i+1))}</option>`).join('')}</select>`:''}
      <button class="btn primary" data-act="camShot">${icon('camera')} Take photo</button><button class="btn small" data-act="camStop">Stop camera</button></div>
      <p class="small muted" style="margin:0">Photos are saved with the type, teeth and date chosen above (for example “Microscope photo”, tooth 36).</p>`
    :`<p class="small muted" style="margin:0">Connect the microscope camera or intraoral camera to this computer (USB, or HDMI with a capture adapter). It works like a webcam: see the live picture and take photos straight into this patient's file.</p>
      ${camErr?`<p class="small" style="margin:0;color:var(--alert)">${esc(camErr)}</p>`:''}
      <div class="row"><button class="btn" data-act="camStart">${icon('camera')} Start camera</button></div>`}
  </section>`;
}
function folderPanel(){
  if(!FOLDER_OK)return '';
  return `<section class="panel" id="xrFolderPanel">
    <div class="row"><h2>X-ray machine folder</h2><span class="spacer"></span>${xrDirState==='ok'?`<span class="pill ok">Watching${xrDir?' · '+esc(xrDir.name):''}</span>`:''}</div>
    ${xrDirState==='none'?`<p class="small muted" style="margin:0">Connect the folder where your X-ray software saves images (JPG, PNG or BMP). While this tab is open, new X-rays appear here and you add them with one click.</p>
      <div class="row"><button class="btn primary" data-act="xrConnect">Connect X-ray folder</button></div>`
    :xrDirState==='ask'?`<p class="small muted" style="margin:0">The browser needs your permission again to read <b>${esc(xrDir&&xrDir.name)}</b>.</p><div class="row"><button class="btn primary" data-act="xrAllow">Allow access</button><button class="btn small" data-act="xrConnect">Choose another folder</button></div>`
    :`${xrFound.length?`<div class="xnew">${xrFound.map((x,i)=>`<div class="xnew-row"><span style="flex:1;min-width:0"><b>${esc(x.name)}</b><br><span class="small muted">${fmtTime(new Date(x.file.lastModified).toISOString())} · ${x.file.size>1e6?(x.file.size/1e6).toFixed(1)+' MB':Math.round(x.file.size/1e3)+' KB'}</span></span>
        <button class="btn small primary" data-xradd="${i}">Add to ${esc(P()?P().first:'patient')}</button><button class="btn small" data-xrskip="${i}">Ignore</button></div>`).join('')}</div>`
      :`<p class="small muted" style="margin:0">Waiting for new X-rays… Take the X-ray as usual; it appears here within a few seconds. Type, teeth and date are taken from the form above.</p>`}
      <div class="row"><button class="btn small" data-act="xrShowRecent">Show images from the last 3 days</button><button class="btn small" data-act="xrConnect">Change folder</button></div>`}
  </section>`;
}
function xrayTab(p){
  const fmtSize=b=>b>1e6?(b/1e6).toFixed(1)+' MB':Math.round(b/1e3)+' KB';
  return `<section class="panel">
    <h2>${isAes(p)?'Add before / after photo':'Add X-ray'}</h2>
    <div class="grid2">
      <label class="f"><span>Type</span><select id="xr-kind">${(isAes(p)?AES_PHOTO_KINDS:XR_KINDS).map(k=>`<option ${k===(view.xrKind||(isAes(p)?'Before photo':'Periapical (PA)'))?'selected':''}>${k}</option>`).join('')}</select></label>
      <label class="f"><span>Date taken</span><input type="date" id="xr-date" value="${today()}"></label>
      <label class="f"><span>Teeth (FDI)</span><input type="text" id="xr-teeth" placeholder="e.g. 36, 37 or full mouth"></label>
      <label class="f"><span>Note (optional)</span><input type="text" id="xr-note" placeholder="e.g. periapical radiolucency 36"></label>
    </div>
    <label class="btn primary filebtn ${xrBusy?'busy':''}">${xrBusy?'Uploading…':isAes(p)?'Take photo or choose picture':'Take photo or choose X-ray'}<input type="file" id="xr-file" accept="image/*,application/pdf" multiple ${xrBusy?'disabled':''}></label>
    <p class="small muted" style="margin:0">On a phone you can photograph the X-ray screen or film, or pick images and PDFs from Photos or Files. Large photos are reduced to about 3000 pixels to save space.</p>
  </section>
  ${cameraPanel()}
  ${folderPanel()}
  <section class="panel">
    <h2>X-rays · ${xrays.length}</h2>
    ${xrLoading&&!xrays.length?'<div class="empty">Loading…</div>':xrays.length?`<div class="xgrid">${xrays.map(x=>`<button class="xcard" data-xr="${x.id}">
      ${x.mime==='application/pdf'?'<span class="xthumb pdf">PDF</span>':`<span class="xthumb">${xrUrls[x.path]?`<img src="${esc(xrUrls[x.path])}" alt="" loading="lazy">`:''}</span>`}
      <span class="xmeta"><b>${esc(x.kind)}</b><span>${fmtDate(x.taken_on)}${x.teeth?' · '+esc(x.teeth):''}</span><span>${fmtSize(x.size_bytes)}</span></span>
    </button>`).join('')}</div>`:'<div class="empty">No X-rays yet.</div>'}
  </section>`;
}
function xrViewer(){
  const x=xrays.find(y=>y.id===xrView&&y);if(!x)return '';
  const url=xrUrls[x.path];const f=view.xrf||{b:100,c:100,inv:false,zoom:false};
  const pdf=x.mime==='application/pdf';
  return `<div class="xview" role="dialog" aria-label="${esc(x.kind)}">
    <div class="xbar"><div style="min-width:0"><b>${esc(x.kind)}</b><span class="small">${fmtDate(x.taken_on)}${x.teeth?' · '+esc(x.teeth):''}${x.note?' · '+esc(x.note):''} · ${esc(x.uploaded_by===user.id?'you':nameOf(x.uploaded_by))}</span></div><button class="btn small" data-act="xrClose">Close</button></div>
    <div class="ximg ${f.zoom?'zoom':''}">${pdf?`<div class="empty" style="color:inherit">PDF file. Tap “Open full size” to view it.</div>`:`<img src="${esc(url||'')}" alt="${esc(x.kind)}" data-act="xrZoom" style="filter:brightness(${f.b}%) contrast(${f.c}%)${f.inv?' invert(1)':''}">`}</div>
    <div class="xtools">
      ${pdf?'':`<label>Brightness<input type="range" id="xr-b" min="40" max="200" value="${f.b}"></label><label>Contrast<input type="range" id="xr-c" min="40" max="250" value="${f.c}"></label>
      <button class="btn small" data-act="xrInv">${f.inv?'Normal':'Invert'}</button><button class="btn small" data-act="xrZoom">${f.zoom?'Fit to screen':'Full size'}</button>`}
      ${url?`<a class="btn small" href="${esc(url)}" target="_blank" rel="noopener">Open full size</a>`:''}
      <button class="btn small" data-act="xrSave">Save / share</button>
      ${view.confirm==='xrdel'?`<button class="btn small" data-act="cancelConfirm">Keep</button><button class="btn small danger" data-act="xrDelete">Yes, delete</button>`:`<button class="btn small danger" data-act="xrAskDel">Delete</button>`}
    </div>
  </div>`;
}

/* ---------- alerts ---------- */
/* ---- Aesthetics (face, skin, laser, hair) – kept apart from dental patients ---- */
const isAes=p=>!!p&&p.kind==='aesthetic';
const AES_GROUPS=[
 ['Consultation',['Aesthetic consultation','Skin analysis','Hair loss consultation','Review / follow-up','Touch-up']],
 ['Injectables',['Botulinum toxin (anti-wrinkle) – forehead lines','Botulinum toxin (anti-wrinkle) – frown lines','Botulinum toxin (anti-wrinkle) – crow\'s feet','Botulinum toxin (anti-wrinkle) – full face','Botulinum toxin (anti-wrinkle) – jaw (masseter) slimming','Botulinum toxin (anti-wrinkle) – underarm sweating','Filler – lips','Filler – cheeks','Filler – under-eye (tear trough)','Filler – jawline','Filler – chin','Filler – nose (non-surgical nose job)','Filler – nasolabial folds','Skin booster','Polynucleotides (PN / PDRN)','Exosomes – face','PRP – face','Fat-dissolving injection (double chin)','Mesotherapy – face','Thread lift (PDO threads)']],
 ['Laser & devices',['Laser hair removal – face','Laser hair removal – underarms','Laser hair removal – arms','Laser hair removal – legs','Laser hair removal – bikini','Laser hair removal – full body','Carbon laser peel','Fractional CO2 laser','Laser skin resurfacing','Q-switched laser – pigmentation / melasma','Laser tattoo removal','IPL photofacial','Radiofrequency (RF) skin tightening','RF microneedling','HIFU skin lifting','Laser – spider veins','Cryolipolysis (fat freezing)','Body contouring / cavitation']],
 ['Facials & peels',['Hydradermabrasion facial','Medi-facial','Acne facial & extraction','Chemical peel – light','Chemical peel – medium','Microdermabrasion','Microneedling','Dermaplaning','Skin brightening facial','Oxygen facial']],
 ['Skin treatments',['Acne treatment','Acne scar treatment','Pigmentation / melasma treatment','Under-eye dark circle treatment','Stretch mark treatment','Scar treatment','Mole removal','Skin tag removal','Wart removal','Milia removal','Rosacea treatment','Wrinkle treatment']],
 ['Drips & supplements',['IV drip – vitamin','IV drip – glutathione (brightening)','IV drip – hydration']],
 ['Hair',['Hair transplant – FUE','Hair transplant – DHI','Beard transplant','Eyebrow transplant','PRP – hair','GFC – hair (growth factor concentrate)','Exosomes – hair','Mesotherapy – hair','Scalp micropigmentation','Hair loss treatment (medicines)']],
 ['Other',['Body treatment','Other aesthetic treatment']]
];
const AES_PROCS=AES_GROUPS.flatMap(g=>g[1]);
const AES_PHASES=[[1,'Consultation & tests'],[2,'Main treatment'],[3,'Course of sessions'],[4,'Maintenance & touch-up'],[5,'Aftercare & review']];
const procsFor=p=>isAes(p)?AES_PROCS:PROCS;
const phasesFor=p=>isAes(p)?AES_PHASES:PHASES;
const procOptions=(p,sel)=>isAes(p)?AES_GROUPS.map(([g,l])=>`<optgroup label="${esc(g)}">${l.map(o=>`<option ${o===sel?'selected':''}>${esc(o)}</option>`).join('')}</optgroup>`).join(''):PROCS.map(o=>`<option ${o===sel?'selected':''}>${esc(o)}</option>`).join('');
const AES_MH=[
 ['a_preg','Pregnant, trying to get pregnant, or breastfeeding'],
 ['a_isotret','Isotretinoin (acne tablets) in the last 6 months'],
 ['a_thin','Blood thinners or aspirin; bleeds or bruises easily'],
 ['a_keloid','Keloid or thick (raised) scars'],
 ['a_herpes','Cold sores (herpes)'],
 ['a_autoimm','Autoimmune disease (lupus, vitiligo, psoriasis, others)'],
 ['a_diab','Diabetes'],
 ['a_epil','Epilepsy or fits'],
 ['a_metal','Pacemaker, metal implants or plates (important for RF devices)'],
 ['a_photo','Light-sensitive skin or photosensitising medicines'],
 ['a_tan','Recent sun tan, sunbed or self-tan (last 4 weeks)'],
 ['a_infect','Active skin infection, open wounds or active acne in the area'],
 ['a_neuro','Muscle or nerve disease (e.g. myasthenia gravis) – important for botulinum toxin'],
 ['a_prevfill','Previous fillers, botulinum toxin or threads (which, where, when)'],
 ['a_prevsurg','Previous cosmetic surgery or hair transplant'],
 ['a_hep','Hepatitis B or C, HIV'],
 ['a_allergy','Allergies (lidocaine / local anaesthetic, hyaluronic acid, latex, eggs, other)'],
 ['a_steroid','Steroid tablets or creams in the last 3 months'],
 ['a_other','Any other illness or medicine']
];
const AES_ALERT_KEYS={a_preg:'Pregnant / breastfeeding',a_isotret:'Isotretinoin',a_thin:'Blood thinner',a_keloid:'Keloid scars',a_herpes:'Cold sores',a_metal:'Metal implant',a_allergy:'Allergy',a_hep:'Infection risk',a_neuro:'Neuromuscular disease',a_epil:'Epilepsy',a_diab:'Diabetes',a_autoimm:'Autoimmune disease'};
const FITZ=['','I – very fair, always burns','II – fair, usually burns','III – medium, sometimes burns','IV – olive / light brown, rarely burns','V – brown, very rarely burns','VI – dark brown / black, never burns'];
const AES_PHOTO_KINDS=['Before photo','After photo','Progress photo','Consent form (scan)','Old record (scan)','Other'];
function aesMhExtra(p){const mh=p.mh;
  return `<div class="grid2">
    <label class="f"><span>Skin type (Fitzpatrick)</span><select data-mhf="fitz" id="mh-fitz">${FITZ.map(o=>`<option value="${esc(o)}" ${mh.fitz===o?'selected':''}>${o||'—'}</option>`).join('')}</select></label>
    <label class="f"><span>Main concern(s)</span><input type="text" data-mhf="concern" id="mh-concern" placeholder="e.g. pigmentation, acne scars, hair fall, wrinkles" value="${esc(mh.concern||'')}"></label>
    <label class="f"><span>Skin care used now</span><input type="text" data-mhf="skincare" id="mh-skincare" placeholder="e.g. retinol, sunscreen, whitening cream" value="${esc(mh.skincare||'')}"></label>
    <label class="f"><span>Hair loss pattern (for hair patients)</span><input type="text" data-mhf="hairloss" id="mh-hairloss" placeholder="e.g. Norwood 4, Ludwig II, since 3 years" value="${esc(mh.hairloss||'')}"></label>
  </div>`}
function alertsOf(p){const a=[];const ans=p.mh.answers;const K=isAes(p)?AES_ALERT_KEYS:ALERT_KEYS;for(const k in K){if(ans[k]&&ans[k].v==='y')a.push(K[k]);}return a}
// Medical alert box shown on every tab of the patient file (not printed on prescriptions)
function alertBox(p){const ans=p.mh.answers||{};const K=isAes(p)?AES_ALERT_KEYS:ALERT_KEYS;const rows=[];
  for(const k in K){const a=ans[k];if(a&&a.v==='y'){const urgent=/allergy|preg|anticoag|thin|bleed|endo|bisphos/.test(k);rows.push(`<li class="${urgent?'urg':''}"><b>${esc(K[k])}</b>${a.d?': '+esc(a.d):''}</li>`)}}
  const meds=String(p.mh.meds||'').trim();if(meds&&!/^(none|no|nil|-)$/i.test(meds))rows.push(`<li><b>Current medicines</b>: ${esc(meds)}</li>`);
  if(!rows.length)return '';
  return `<div class="alertbox" role="alert"><div class="ah">⚠ Medical alerts – check before treatment</div><ul>${rows.join('')}</ul></div>`}
function mhStatus(p){
  if(!p.mh.date)return {cls:'warn',t:'No medical history'};
  if((Date.now()-new Date(p.mh.date))/864e5>365)return {cls:'warn',t:'MH over 12 months old'};
  return {cls:'ok',t:'MH '+fmtDate(p.mh.date)};
}

/* ---------- screens ---------- */
function render(){
  if(pharmOnly()&&['list','patient','aes','earn','appts','pharm','lab'].includes(view.screen)&&!(view.screen==='pharm'&&isPS())&&!(view.screen==='lab'&&isLS()))view.screen=isPS()?'pharm':'lab';
  const app=$('#app');const s=view.screen;
  const v={config:configView,offline:offlineView,loading:loadingView,error:errorView,auth:authView,newpw:newpwView,onboard:onboardView,recovery:recoveryView,welcome:welcomeView,list:listView,pharm:pharmView,lab:labView,appts:apptsView,msgs:msgsView,settings:settingsView,patient:patientView,earn:earningsView,owner:ownerView,aes:aesView}[s]||loadingView;
  const inShell=['list','appts','msgs','settings','patient','earn','aes','pharm','lab'].includes(s)&&clinic&&me;
  app.innerHTML=inShell?shell(ownerBar()+v()):`<div class="wrap">${v()}${['auth','onboard','newpw','recovery','config'].includes(s)?CREDIT:''}${s==='auth'?'<p class="ownerlink"><button class="linkbtn" data-act="ownerOpen">Owner access</button></p>':''}</div>`;
  if(view.screen==='msgs'){const cl=document.getElementById('chatList');if(cl)cl.scrollTop=cl.scrollHeight}
  if(document.querySelector('.credit-qr'))fillQR();
  if(document.getElementById('bkQr'))fillBookingQr();
  const cv=document.getElementById('camVideo');if(cv&&camStream&&cv.srcObject!==camStream){cv.srcObject=camStream;cv.play().catch(()=>{})}
  if(camStream&&!(view.screen==='patient'&&view.tab==='xrays'))stopCamera();
}
const DESIGNER_EMAIL='abid.26.am@gmail.com';
const CREDIT=`<div class="credit"><div class="credit-qr" title="Scan to email Dr Abid Ali"></div><div class="credit-txt"><span class="credit-by">Made and designed by</span><b>Dr Abid Ali</b><span class="credit-role">Forensic Odontologist</span><span class="credit-scan">Scan the code to email</span><span class="credit-copy">© 2026 Dr Abid Ali · All rights reserved</span></div></div>`;
/* QR code with the designer's email, drawn by the qrcodejs library (loaded only when needed). */
let qrLib=null;
function fillQR(){
  const boxes=[...document.querySelectorAll('.credit-qr')].filter(b=>!b.childElementCount);if(!boxes.length)return;
  const draw=()=>boxes.forEach(b=>{try{new window.QRCode(b,{text:'mailto:'+DESIGNER_EMAIL,width:88,height:88,colorDark:'#123c44',colorLight:'#ffffff',correctLevel:window.QRCode.CorrectLevel.M});b.setAttribute('role','img');b.setAttribute('aria-label','QR code: email '+DESIGNER_EMAIL)}catch(e){b.remove()}});
  if(window.QRCode)return draw();
  if(!qrLib)qrLib=new Promise((res,rej)=>{const s=document.createElement('script');s.src='https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';s.onload=res;s.onerror=rej;document.head.appendChild(s)});
  qrLib.then(draw,()=>boxes.forEach(b=>b.remove()));
}
/* ---- Clinic earnings, expenses and salaries (admin only, PIN protected) ---- */
let earn={pays:null,loading:false,err:'',unlockedAt:0,period:'month',anchor:null,busy:false,mode:'',tries:0,tab:'overview',dentist:'',printWhat:'all',sec:'all'};
let fin={rows:null};
const EARN_LOCK_MIN=10;
const canEarn=()=>isAdmin()||isAcct();
const earnOpen=()=>canEarn()&&earn.unlockedAt&&Date.now()-earn.unlockedAt<EARN_LOCK_MIN*60e3;
const isoD=d=>{const x=new Date(d.getTime()-d.getTimezoneOffset()*6e4);return x.toISOString().slice(0,10)};
const parseD=s=>{const [y,m,d]=s.split('-').map(Number);return new Date(y,m-1,d)};
const MONTHS=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const EXP_CATS=['Materials','Lab charges','Rent','Electricity, gas & water','Equipment & repairs','Marketing','Other'];
const LAB_WORK=['Crown','Bridge','Complete denture','Partial denture (acrylic)','Partial denture (cobalt chrome)','Implant crown / abutment','Veneer','Inlay / onlay','Post & core','Temporary crown','Night guard','Orthodontic appliance / retainer','Denture repair','Other lab work'];
const STAFF_ROLES=['Dentist','Manager','Assistant','Receptionist','Marketing','Hygienist','Cleaner','Other'];
function earnRange(period,anchor){
  if(period==='all')return ['0000-01-01','9999-12-31'];
  const a=parseD(anchor);let f,t;
  if(period==='day'){f=t=a}
  else if(period==='week'){const wd=(a.getDay()+6)%7;f=new Date(a);f.setDate(a.getDate()-wd);t=new Date(f);t.setDate(f.getDate()+6)}
  else if(period==='month'){f=new Date(a.getFullYear(),a.getMonth(),1);t=new Date(a.getFullYear(),a.getMonth()+1,0)}
  else {f=new Date(a.getFullYear(),0,1);t=new Date(a.getFullYear(),11,31)}
  return [isoD(f),isoD(t)];
}
function earnShift(dir){
  if(!dir){earn.anchor=today();return}
  const a=parseD(earn.anchor||today());
  if(earn.period==='day')a.setDate(a.getDate()+dir);else if(earn.period==='week')a.setDate(a.getDate()+7*dir);
  else if(earn.period==='month'){a.setDate(1);a.setMonth(a.getMonth()+dir)}else a.setFullYear(a.getFullYear()+dir);
  earn.anchor=isoD(a);
}
function earnTitle(f,t){if(earn.period==='all')return 'All time';const F=parseD(f),T=parseD(t);
  if(earn.period==='day')return F.toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
  if(earn.period==='week')return `${F.getDate()} ${MONTHS[F.getMonth()]} – ${T.getDate()} ${MONTHS[T.getMonth()]} ${T.getFullYear()}`;
  if(earn.period==='month')return F.toLocaleDateString('en-GB',{month:'long',year:'numeric'});
  return String(F.getFullYear());
}
async function loadEarn(){
  earn.loading=true;earn.err='';softRender();
  try{const [a,b]=await Promise.all([sb.from('payments').select('*').eq('clinic_id',clinic.id),sb.from('finance').select('*').eq('clinic_id',clinic.id)]);
    if(a.error)throw a.error;earn.pays=a.data||[];
    if(b.error){fin.rows=[];earn.finErr=/finance/i.test(b.error.message||'')||/relation|does not exist|schema cache/i.test(b.error.message||'')?'needsql':friendly(b.error)}else{fin.rows=b.data||[];earn.finErr=''}}
  catch(e){earn.err=friendly(e)}
  earn.loading=false;softRender();
}
const finOf=k=>(fin.rows||[]).filter(r=>r.kind===k);
async function finSave(kind,data,id){
  if(id){const {error}=await sb.from('finance').update({data}).eq('id',id);if(error)throw error;const r=(fin.rows||[]).find(x=>x.id===id);if(r)r.data=data}
  else{const row={clinic_id:clinic.id,kind,data};const {data:out,error}=await sb.from('finance').insert(row).select();if(error)throw error;(fin.rows=fin.rows||[]).push(Array.isArray(out)?out[0]:out)}
}
async function finDel(id){const {error}=await sb.from('finance').delete().eq('id',id);if(error)throw error;fin.rows=(fin.rows||[]).filter(r=>r.id!==id)}
const patName=id=>{const p=db.patients.find(x=>x.id===id);return p?((p.first||'')+' '+(p.last||'')).trim()||'Unnamed':'(deleted patient)'};
const procGroup=p=>(p||'Other').split(' – ')[0];
/* dentists: team members who treat + names found on completed treatments + staff saved as Dentist */
function dentistNames(){
  const s=new Set();team.filter(t=>t.role!=='accountant').forEach(t=>t.name&&s.add(t.name));
  finOf('staff').filter(r=>r.data.role==='Dentist'&&r.data.active!==false).forEach(r=>r.data.name&&s.add(r.data.name));
  db.patients.forEach(p=>(p.plan||[]).forEach(i=>{if(i.status==='completed'&&i.doneBy)s.add(i.doneBy)}));
  return [...s].sort();
}
const staffFor=name=>finOf('staff').find(r=>r.data.role==='Dentist'&&r.data.name===name);
const secOk=p=>earn.sec==='aes'?isAes(p):earn.sec==='dental'?!isAes(p):true;
function doneIn(f,t,who){const out=[];db.patients.filter(secOk).forEach(p=>(p.plan||[]).forEach(i=>{if(i.status==='completed'&&i.doneDate&&i.doneDate>=f&&i.doneDate<=t&&!/^Previous balance/.test(i.proc||'')&&(!who||i.doneBy===who))out.push({p,i})}));return out}
function payDue(st,month){/* what a staff member earns for a month: fixed salary or % of treatment they did */
  const d=st.data;if(d.pay==='percent'){const f=month+'-01',t=isoD(new Date(+month.slice(0,4),+month.slice(5,7),0));const v=doneIn(f,t,d.name).reduce((a,x)=>a+(+x.i.fee||0),0);return Math.round(v*(+d.percent||0)/100)}
  return Math.round(+d.salary||0);
}
function earnData(){
  const [f,t]=earnRange(earn.period,earn.anchor||today());const inR=d=>d&&d>=f&&d<=t;
  const pk={};db.patients.forEach(p=>pk[p.id]=p);const paySec=x=>earn.sec==='all'||secOk(pk[x.patient_id]||{});
  const pays=(earn.pays||[]).filter(x=>paySec(x)&&inR(String(x.paid_on).slice(0,10))).sort((a,b)=>(b.paid_on+b.created_at).localeCompare(a.paid_on+a.created_at));
  const received=pays.reduce((a,x)=>a+(+x.amount||0),0),disc=pays.reduce((a,x)=>a+(+x.discount||0),0);
  const byMethod={},byStaff={};pays.forEach(x=>{const m=x.method||'Other';byMethod[m]=(byMethod[m]||0)+(+x.amount||0);const s=x.received_by_name||'Not recorded';byStaff[s]=(byStaff[s]||0)+(+x.amount||0)});
  const done=doneIn(f,t);const treatVal=done.reduce((a,x)=>a+(+x.i.fee||0),0);
  const byProc={},byDent={};done.forEach(({i})=>{const k=procGroup(i.proc);const o=byProc[k]||(byProc[k]={n:0,v:0});o.n++;o.v+=+i.fee||0;const d=i.doneBy||'Not recorded';const q=byDent[d]||(byDent[d]={n:0,v:0});q.n++;q.v+=+i.fee||0});
  const exps=finOf('expense').filter(r=>inR(r.data.date)).sort((a,b)=>String(b.data.date).localeCompare(String(a.data.date)));
  const expTotal=exps.reduce((a,r)=>a+(+r.data.amount||0),0);const byCat={};exps.forEach(r=>{const k=r.data.cat||'Other';byCat[k]=(byCat[k]||0)+(+r.data.amount||0)});
  const sals=finOf('salary').filter(r=>r.data.status==='paid'&&inR(r.data.paid_on));const salPaid=sals.reduce((a,r)=>a+(+r.data.amount||0),0);
  let bars=[];
  if(earn.period==='week'||earn.period==='month'){const F=parseD(f),T=parseD(t);for(let d=new Date(F);d<=T;d.setDate(d.getDate()+1)){const k=isoD(d);bars.push({k,l:earn.period==='week'?d.toLocaleDateString('en-GB',{weekday:'short'}):String(d.getDate()),v:0})}
    const idx=Object.fromEntries(bars.map((b,i)=>[b.k,i]));pays.forEach(x=>{const i=idx[String(x.paid_on).slice(0,10)];if(i!==undefined)bars[i].v+=+x.amount||0})}
  else if(earn.period==='year'){bars=MONTHS.map((l,i)=>({k:i,l,v:0}));pays.forEach(x=>{bars[+String(x.paid_on).slice(5,7)-1].v+=+x.amount||0})}
  else if(earn.period==='all'){const ys={};pays.forEach(x=>{const y=String(x.paid_on).slice(0,4);ys[y]=(ys[y]||0)+(+x.amount||0)});bars=Object.keys(ys).sort().map(y=>({k:y,l:y,v:ys[y]}))}
  const allPaid={};(earn.pays||[]).forEach(x=>{allPaid[x.patient_id]=(allPaid[x.patient_id]||0)+(+x.amount||0)+(+x.discount||0)});
  let owed=0;db.patients.filter(secOk).forEach(p=>{const ch=(p.plan||[]).filter(i=>i.status==='completed').reduce((a,i)=>a+(+i.fee||0),0);const b=ch-(allPaid[p.id]||0);if(b>0)owed+=b});
  return {f,t,pays,received,disc,byMethod,byStaff,done,treatVal,byProc,byDent,bars,owed,exps,expTotal,byCat,sals,salPaid,profit:received-expTotal-salPaid,patients:new Set(pays.map(x=>x.patient_id)).size};
}
const listBars=(o,total)=>Object.entries(o).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`<div class="erow"><span>${esc(k)}</span><span class="ebar"><i style="width:${total?Math.round(v/total*100):0}%"></i></span><b>${money(v)}</b></div>`).join('')||'<p class="small muted" style="margin:0">Nothing in this period.</p>';
function treatTable(byProc,total,count){
  if(!Object.keys(byProc).length)return '<p class="muted" style="margin:0">No treatment marked as done in this period.</p>';
  return `<div class="tablewrap"><table class="att etreat"><thead><tr><th>Treatment</th><th style="text-align:right">How many</th><th style="text-align:right">Earned</th><th style="width:30%">Share</th></tr></thead><tbody>
  ${Object.entries(byProc).sort((a,b)=>b[1].v-a[1].v).map(([k,o])=>`<tr><td>${esc(k)}</td><td style="text-align:right">${o.n}</td><td style="text-align:right"><b>${money(o.v)}</b></td><td><span class="ebar"><i style="width:${total?Math.round(o.v/total*100):0}%"></i></span> <small class="muted">${total?Math.round(o.v/total*100):0}%</small></td></tr>`).join('')}
  </tbody><tfoot><tr><th>Total – all treatments</th><th style="text-align:right">${count}</th><th style="text-align:right">${money(total)}</th><th></th></tr></tfoot></table></div>`;
}
function needSqlNote(){return earn.finErr==='needsql'?`<div class="msg warn">Expenses, salaries and the clinic logo need one small database update. Open <b>Supabase → SQL Editor</b>, paste the file <b>supabase-update-finance.sql</b> and press <b>Run</b>. Then reload this page.</div>`:earn.finErr?`<div class="msg err">${esc(earn.finErr)}</div>`:''}
function earnOverview(D){
  const max=Math.max(1,...D.bars.map(b=>b.v));
  return `<div class="paysum esum">
      <div><span>Money received</span><b>${money(D.received)}</b><small>${D.pays.length} payment${D.pays.length===1?'':'s'} · ${D.patients} patient${D.patients===1?'':'s'}</small></div>
      <div><span>Expenses</span><b>${money(D.expTotal)}</b><small>materials, lab, rent and more</small></div>
      <div><span>Salaries paid</span><b>${money(D.salPaid)}</b><small>marked as paid in this period</small></div>
      <div class="${D.profit<0?'bad':'good'}"><span>Profit</span><b>${D.profit<0?'– ':''}${money(Math.abs(D.profit))}</b><small>received – expenses – salaries</small></div>
      <div><span>Treatment done (value)</span><b>${money(D.treatVal)}</b><small>${D.done.length} treatment${D.done.length===1?'':'s'} completed</small></div>
      <div><span>Discounts given</span><b>${money(D.disc)}</b><small>in this period</small></div>
      <div class="warn"><span>Still owed by patients</span><b>${money(D.owed)}</b><small>all patients, up to now</small></div>
    </div>
    ${D.bars.length?`<div class="echart" role="img" aria-label="Money received per ${earn.period==='year'?'month':earn.period==='all'?'year':'day'}">${D.bars.map(b=>`<div class="ecol" title="${esc(b.l)}: ${money(b.v)}"><span class="eval">${b.v?money(b.v).replace('Rs ',''):''}</span><i style="height:${Math.round(b.v/max*100)}%"></i><em>${esc(b.l)}</em></div>`).join('')}</div>`:''}
    <div class="grid2 egrid" style="margin-top:14px">
      <section class="subpanel"><h3>Earnings by treatment</h3>${listBars(Object.fromEntries(Object.entries(D.byProc).map(([k,o])=>[k,o.v])),D.treatVal)}</section>
      <section class="subpanel"><h3>Expenses by type</h3>${listBars(D.byCat,D.expTotal)}</section>
    </div>`;
}
function earnDentists(D){
  const names=dentistNames();const sel=earn.dentist&&names.includes(earn.dentist)?earn.dentist:'';
  const rows=names.map(n=>{const o=D.byDent[n]||{n:0,v:0};const st=staffFor(n);const pay=st?(st.data.pay==='percent'?`${+st.data.percent||0}% of treatment`:`${money(st.data.salary)} / month`):'<span class="muted">not set</span>';
    const share=st&&st.data.pay==='percent'?money(Math.round(o.v*(+st.data.percent||0)/100)):'–';
    return `<tr class="${sel===n?'selrow':''}"><td><button class="linkbtn" data-earndent="${esc(n)}">${esc(n)}</button></td><td style="text-align:right">${o.n}</td><td style="text-align:right"><b>${money(o.v)}</b></td><td>${pay}</td><td style="text-align:right">${share}</td></tr>`}).join('');
  let detail='';
  if(sel){const mine=D.done.filter(x=>x.i.doneBy===sel);const bp={};mine.forEach(({i})=>{const k=procGroup(i.proc);const o=bp[k]||(bp[k]={n:0,v:0});o.n++;o.v+=+i.fee||0});const tv=mine.reduce((a,x)=>a+(+x.i.fee||0),0);const st=staffFor(sel);
    const curM=(earn.anchor||today()).slice(0,7);const slip=st?finOf('salary').find(r=>r.data.staff_id===st.id&&r.data.month===curM&&r.data.status==='paid'):null;
    detail=`<section class="subpanel"><div class="row"><h3 style="margin:0">${esc(sel)} – ${esc(earnTitle(D.f,D.t))}</h3><span class="spacer"></span>${slip?`<button class="btn small primary" data-salslip="${slip.id}">${icon('doc')} Pay slip ${esc(MONTHS[+curM.slice(5,7)-1])}</button>`:st?`<button class="btn small" data-paydent="${st.id}">Pay ${esc(MONTHS[+curM.slice(5,7)-1])} salary</button>`:''}<button class="btn small" data-act="printDentist">${icon('doc')} Dentist report PDF</button></div>
      ${treatTable(bp,tv,mine.length)}
      ${mine.length?`<details style="margin-top:8px"><summary class="small">Show every treatment (${mine.length})</summary><div class="tablewrap"><table class="att"><thead><tr><th>Date</th><th>Patient</th><th>Tooth</th><th>Treatment</th><th style="text-align:right">Fee</th></tr></thead><tbody>${mine.sort((a,b)=>String(b.i.doneDate).localeCompare(String(a.i.doneDate))).map(({p,i})=>`<tr><td>${fmtDate(i.doneDate)}</td><td>${esc((p.first+' '+p.last).trim())}</td><td>${esc(i.tooth||'–')}</td><td>${esc(i.proc)}</td><td style="text-align:right">${money(i.fee)}</td></tr>`).join('')}</tbody></table></div></details>`:''}
      <form id="dentPayForm" class="payset"><b>Pay for ${esc(sel)}</b>
        <div class="seg" role="radiogroup"><label><input type="radio" name="dp-type" value="fixed" ${!st||st.data.pay!=='percent'?'checked':''}> Fixed monthly salary</label><label><input type="radio" name="dp-type" value="percent" ${st&&st.data.pay==='percent'?'checked':''}> Percentage of treatment</label></div>
        <div class="row" style="gap:8px;flex-wrap:wrap"><label class="f" style="max-width:180px"><span>Monthly salary (Rs)</span><input type="number" id="dp-salary" min="0" step="1" inputmode="numeric" value="${st?esc(st.data.salary||''):''}"></label>
        <label class="f" style="max-width:140px"><span>Percentage (%)</span><input type="number" id="dp-pct" min="0" max="100" step="0.5" inputmode="decimal" value="${st?esc(st.data.percent||''):''}"></label>
        <button class="btn primary small" type="submit" style="align-self:flex-end">Save pay</button></div>
        ${st&&st.data.pay==='percent'?`<p class="small" style="margin:0">Earned share in this period: <b>${money(Math.round(tv*(+st.data.percent||0)/100))}</b> (${+st.data.percent||0}% of ${money(tv)})</p>`:''}
      </form></section>`}
  return `<p class="small muted" style="margin:0 0 8px">Treatments are counted for the dentist who marked them as done. Tap a name to see details and set pay.</p>
    ${names.length?`<div class="tablewrap"><table class="att"><thead><tr><th>Dentist</th><th style="text-align:right">Treatments</th><th style="text-align:right">Value</th><th>Pay</th><th style="text-align:right">% share</th></tr></thead><tbody>${rows}</tbody></table></div>`:'<p class="muted">No dentists yet.</p>'}
    ${detail}`;
}
function earnExpenses(D){
  const f=earn.expForm||{};const cat=f.cat||'Materials';
  return `<form id="expForm" class="subpanel expform"><h3 style="margin:0">Add an expense</h3>
      <div class="grid3">
        <label class="f"><span>Date</span><input type="date" id="ex-date" value="${esc(f.date||today())}" max="${today()}"></label>
        <label class="f"><span>Type</span><select id="ex-cat">${EXP_CATS.map(c=>`<option ${c===cat?'selected':''}>${c}</option>`).join('')}</select></label>
        ${cat==='Lab charges'?`<label class="f"><span>Lab work</span><select id="ex-lab">${LAB_WORK.map(c=>`<option ${c===f.lab?'selected':''}>${c}</option>`).join('')}</select></label>`:''}
        <label class="f"><span>${cat==='Materials'?'Material name':cat==='Lab charges'?'Lab name (optional)':'What for'}</span><input type="text" id="ex-item" value="${esc(f.item||'')}" placeholder="${cat==='Materials'?'e.g. Composite kit, gloves, anaesthetic':cat==='Lab charges'?'e.g. City Dental Lab':''}"></label>
        ${cat==='Lab charges'?`<label class="f"><span>Patient (optional)</span><input type="text" id="ex-pat" value="${esc(f.pat||'')}" list="ex-pats"><datalist id="ex-pats">${db.patients.slice(0,300).map(p=>`<option value="${esc((p.first+' '+p.last).trim())}">`).join('')}</datalist></label>`:''}
        <label class="f"><span>Amount (Rs)</span><input type="number" id="ex-amt" min="0" step="1" inputmode="numeric" value="${esc(f.amount||'')}" required></label>
      </div>
      <label class="f"><span>Note (optional)</span><input type="text" id="ex-note" value="${esc(f.note||'')}"></label>
      <div class="chips salmeth"><span class="small muted" style="align-self:center">Paid by:</span>${SAL_METHODS.map((m,i)=>`<label class="chip"><input type="radio" name="ex-method" value="${m}" ${(f.method||'Cash')===m?'checked':''}> ${m}</label>`).join('')}</div>
      <div class="row"><button class="btn primary" type="submit">Save expense</button></div>
    </form>
    <section class="subpanel"><div class="row"><h3 style="margin:0">Expenses – ${esc(earnTitle(D.f,D.t))}</h3><span class="spacer"></span><b>${money(D.expTotal)}</b></div>
      ${D.exps.length?`<div class="tablewrap"><table class="att"><thead><tr><th>Date</th><th>Type</th><th>Item</th><th style="text-align:right">Amount</th><th></th></tr></thead><tbody>
      ${D.exps.map(r=>{const d=r.data;return `<tr><td>${fmtDate(d.date)}</td><td>${esc(d.cat||'')}${d.lab?`<br><small class="muted">${esc(d.lab)}</small>`:''}</td><td>${esc(d.item||'')}${d.pat?` <small class="muted">· ${esc(d.pat)}</small>`:''}${d.note?`<br><small class="muted">${esc(d.note)}</small>`:''}</td><td style="text-align:right">${money(d.amount)}${d.method?`<br><small class="muted">${esc(d.method)}</small>`:''}</td><td><div class="row" style="flex-wrap:nowrap;gap:4px"><button class="btn small" data-expslip="${r.id}">${icon('doc')} Voucher</button>${view.confirm==='expdel:'+r.id?`<button class="btn small danger" data-expdel="${r.id}">Delete</button>`:`<button class="btn small" data-askexpdel="${r.id}" aria-label="Delete expense">✕</button>`}</div></td></tr>`}).join('')}
      </tbody></table></div><h3 style="margin:12px 0 6px">By type</h3>${listBars(D.byCat,D.expTotal)}`:'<p class="muted" style="margin:0">No expenses in this period.</p>'}
    </section>`;
}
function earnStaff(D){
  const month=(earn.anchor||today()).slice(0,7);const mLabel=parseD(month+'-01').toLocaleDateString('en-GB',{month:'long',year:'numeric'});
  const staff=finOf('staff').filter(r=>r.data.active!==false).sort((a,b)=>STAFF_ROLES.indexOf(a.data.role)-STAFF_ROLES.indexOf(b.data.role)||String(a.data.name).localeCompare(String(b.data.name)));
  const sal=id=>finOf('salary').find(r=>r.data.staff_id===id&&r.data.month===month);
  let dueT=0,paidT=0;
  const rows=staff.map(r=>{const d=r.data,due=payDue(r,month),s=sal(r.id),paid=s&&s.data.status==='paid';if(paid)paidT+=+s.data.amount||0;else dueT+=due;
    return `<tr><td><b>${esc(d.name)}</b><br><small class="muted">${esc(d.role)}${d.role==='Other'&&d.roleName?' – '+esc(d.roleName):''}</small></td>
      <td>${d.pay==='percent'?`${+d.percent||0}% of treatment`:`${money(d.salary)} / month`}</td>
      <td style="text-align:right">${money(paid?s.data.amount:due)}</td>
      <td>${paid?`<span class="pill ok">Paid ${s.data.paid_on?fmtDate(s.data.paid_on):''}</span>${s.data.method?`<br><small class="muted">${esc(s.data.method)}${s.data.ref?' · '+esc(s.data.ref):''}</small>`:''}`:'<span class="pill warn">Unpaid</span>'}</td>
      <td><div class="row" style="flex-wrap:nowrap;gap:4px">${paid?`<button class="btn small primary" data-salslip="${s.id}">${icon('doc')} Receipt</button><button class="btn small" data-salunpaid="${r.id}">Mark unpaid</button>`:`<button class="btn small primary" data-salpaid="${r.id}" data-amt="${due}">Mark paid</button>`}<button class="btn small" data-staffedit="${r.id}">Edit</button></div></td></tr>
      ${earn.salForm&&earn.salForm.staff_id===r.id?`<tr><td colspan="5">${salFormHtml(r,month)}</td></tr>`:''}`}).join('');
  const e=earn.staffEdit?finOf('staff').find(r=>r.id===earn.staffEdit):null;const ed=e?e.data:(earn.staffNew?{role:'Assistant',pay:'fixed'}:null);
  return `<div class="row" style="gap:8px;flex-wrap:wrap"><button class="btn small" type="button" data-act="unitFormToggle">${earn.unitForm?'Close':'+ Add lab / pharmacy login'}</button></div>${earn.unitForm?unitLoginHtml():''}
    <div class="row" style="gap:8px;flex-wrap:wrap"><p class="small muted" style="margin:0">Salaries for <b>${esc(mLabel)}</b> (change the month with ‹ › above, in Monthly view).</p><span class="spacer"></span><button class="btn small primary" data-act="staffNew">+ Add staff</button></div>
    ${ed?`<form id="staffForm" class="subpanel"><h3 style="margin:0">${e?'Edit '+esc(ed.name):'Add staff member'}</h3>
      <div class="grid3">
        <label class="f"><span>Name</span><input type="text" id="sf-name" value="${esc(ed.name||'')}" required list="sf-team"><datalist id="sf-team">${team.map(t=>`<option value="${esc(t.name)}">`).join('')}</datalist></label>
        <label class="f"><span>Job</span><select id="sf-role">${STAFF_ROLES.map(r=>`<option ${r===ed.role?'selected':''}>${r}</option>`).join('')}</select></label>
        <label class="f"><span>If "Other": job name</span><input type="text" id="sf-rolename" value="${esc(ed.roleName||'')}"></label>
        <label class="f"><span>Pay type</span><select id="sf-pay"><option value="fixed" ${ed.pay!=='percent'?'selected':''}>Fixed monthly salary</option><option value="percent" ${ed.pay==='percent'?'selected':''}>Percentage of own treatment (dentists)</option></select></label>
        <label class="f"><span>Monthly salary (Rs)</span><input type="number" id="sf-salary" min="0" step="1" inputmode="numeric" value="${esc(ed.salary||'')}"></label>
        <label class="f"><span>Percentage (%)</span><input type="number" id="sf-pct" min="0" max="100" step="0.5" inputmode="decimal" value="${esc(ed.percent||'')}"></label>
      </div>
      <div class="row"><button class="btn primary" type="submit">Save</button><button class="btn" type="button" data-act="staffCancel">Cancel</button><span class="spacer"></span>${e?`<button class="btn danger small" type="button" data-staffremove="${e.id}">Remove from staff</button>`:''}</div>
    </form>`:''}
    ${staff.length?`<div class="tablewrap"><table class="att"><thead><tr><th>Staff</th><th>Pay</th><th style="text-align:right">${esc(MONTHS[+month.slice(5,7)-1])} salary</th><th>Status</th><th></th></tr></thead><tbody>${rows}</tbody>
      <tfoot><tr><th colspan="2">Total paid / still unpaid</th><th style="text-align:right">${money(paidT)} / ${money(dueT)}</th><th colspan="2"></th></tr></tfoot></table></div>`
      :'<p class="muted">No staff added yet. Add dentists, manager, assistants, marketing and others with their salary.</p>'}`;
}
function earnPayments(D){
  return `<div class="grid2 egrid"><section class="subpanel"><h3>Received by payment method</h3>${listBars(D.byMethod,D.received)}</section><section class="subpanel"><h3>Received by staff</h3>${listBars(D.byStaff,D.received)}</section></div>
  <section class="subpanel"><h3>Payments in this period</h3>
    ${D.pays.length?`<div class="tablewrap"><table class="att"><thead><tr><th>Date</th><th>Patient</th><th>Method</th><th style="text-align:right">Amount</th><th style="text-align:right">Discount</th><th>Received by</th></tr></thead><tbody>
    ${D.pays.slice(0,300).map(x=>`<tr><td>${fmtDate(x.paid_on)}</td><td><button class="linkbtn" data-open="${x.patient_id}">${esc(patName(x.patient_id))}</button></td><td>${esc(x.method||'')}${x.reference?` <small class="muted">${esc(x.reference)}</small>`:''}</td><td style="text-align:right">${money(x.amount)}</td><td style="text-align:right">${+x.discount?money(x.discount):'–'}</td><td>${esc(x.received_by_name||'')}</td></tr>`).join('')}
    </tbody></table></div>${D.pays.length>300?'<p class="small muted">Showing the latest 300. Download the list for all.</p>':''}`:'<p class="muted" style="margin:0">No payments in this period.</p>'}
  </section>`;
}
const SAL_METHODS=['Cash','Bank transfer','JazzCash / Easypaisa','Cheque','Other'];
function salFormHtml(r,month){const f=earn.salForm;
  return `<form id="salForm" class="salform"><b>Pay ${esc(r.data.name)} – ${esc(parseD(month+'-01').toLocaleDateString('en-GB',{month:'long',year:'numeric'}))}</b>
    <div class="grid3">
      <label class="f"><span>Amount paid (Rs)</span><input type="number" id="sl-amt" min="0" step="1" inputmode="numeric" value="${esc(f.amount)}" required></label>
      <label class="f"><span>Paid on</span><input type="date" id="sl-date" value="${today()}" max="${today()}"></label>
      <label class="f"><span>Reference (optional)</span><input type="text" id="sl-ref" placeholder="transaction ID or cheque no."></label>
    </div>
    <div class="chips">${SAL_METHODS.map((m,i)=>`<label class="chip"><input type="radio" name="sl-method" value="${m}" ${i===0?'checked':''}> ${m}</label>`).join('')}</div>
    <div class="row"><button class="btn primary" type="submit">Save as paid</button><button class="btn" type="button" data-act="salCancel">Cancel</button></div>
  </form>`}
async function expenseVoucher(id){
  if(!window.jspdf){toast('The PDF tool did not load. Check your internet and reload the page.');return}
  const r=finOf('expense').find(x=>x.id===id);if(!r)return;const d=r.data;const P=pdfBase('Expense voucher');const {doc,W,M,st:y,C}=P;
  const no='EXP-'+String(d.date||'').replace(/-/g,'').slice(2)+'-'+String(id).replace(/-/g,'').slice(0,4).toUpperCase();
  P.kv('Voucher no.',no,M,60);P.kv('Date',d.date?fmtDate(d.date):'–',M+70,40);P.kv('Paid by',(d.method||'Cash'),W-M-56,56);y.y+=14;
  P.sec('Expense');const two=(l,v,b)=>P.row([l,v],[M,W-M],{right:[1],bold:b,w:[120,70]});
  two('Type',d.cat+(d.lab?' – '+d.lab:''));if(d.item)two(d.cat==='Materials'?'Material':d.cat==='Lab charges'?'Lab':'For',d.item);if(d.pat)two('Patient',d.pat);if(d.note)two('Note',d.note);
  doc.setDrawColor(...C.LINE);doc.line(M,y.y-3.6,W-M,y.y-3.6);two('Amount',money(d.amount),true);
  P.row(['In words: Rupees '+numWords(d.amount)+' only'],[M],{color:C.MUT,size:9,w:[170]});
  y.y+=34;doc.setDrawColor(...C.INK);doc.line(M,y.y,M+70,y.y);doc.line(W-M-70,y.y,W-M,y.y);
  doc.setFontSize(8);doc.setTextColor(...C.MUT);doc.text('Approved by',M,y.y+4);doc.text(P.clean(me.name),M,y.y+8);doc.text('Received by (supplier / lab)',W-M-70,y.y+4);
  doc.setFontSize(7.5);doc.text(P.clean(clinic.name)+' – expense voucher '+no,M,290);
  await deliverFile(doc.output('blob'),('Expense_voucher_'+(d.item||d.cat)+'_'+(d.date||'')+'.pdf').replace(/[^\w.\-]+/g,'_'),'save');
}
async function salarySlip(salId){
  if(!window.jspdf){toast('The PDF tool did not load. Check your internet and reload the page.');return}
  const s=finOf('salary').find(x=>x.id===salId);if(!s)return;const st=finOf('staff').find(x=>x.id===s.data.staff_id)||{data:{name:'Staff',role:''}};
  const d=s.data,sd=st.data;const P=pdfBase('Salary receipt');const {doc,W,M,st:y,C}=P;
  const mLabel=parseD(d.month+'-01').toLocaleDateString('en-GB',{month:'long',year:'numeric'});
  const no='SAL-'+String(d.month).replace('-','')+'-'+String(salId).replace(/-/g,'').slice(0,4).toUpperCase();
  P.kv('Paid to',sd.name+(sd.role?' ('+(sd.role==='Other'&&sd.roleName?sd.roleName:sd.role)+')':''),M,95);P.kv('Receipt no.',no,M+100,40);P.kv('Date paid',d.paid_on?fmtDate(d.paid_on):'–',W-M-34,34);y.y+=13;
  P.kv('Salary for',mLabel,M,95);P.kv('Payment method',(d.method||'–')+(d.ref?' – '+d.ref:''),M+100,80);y.y+=13;
  P.sec('Pay');
  const two=(l,v,b)=>P.row([l,v],[M,W-M],{right:[1],bold:b,w:[140,50]});
  two('Pay type',sd.pay==='percent'?'Percentage of own treatment':'Fixed monthly salary');two('Paid by',(d.method||'–')+(d.ref?' – '+d.ref:''));
  if(sd.pay==='percent'){const f=d.month+'-01',t=isoD(new Date(+d.month.slice(0,4),+d.month.slice(5,7),0));const v=doneIn(f,t,sd.name).reduce((a,x)=>a+(+x.i.fee||0),0);
    two('Treatment done in '+mLabel,money(v));two('Share',(+sd.percent||0)+'%');}
  else two('Monthly salary',money(sd.salary));
  doc.setDrawColor(...C.LINE);doc.line(M,y.y-3.6,W-M,y.y-3.6);two('Amount paid',money(d.amount),true);
  P.row(['In words: Rupees '+numWords(d.amount)+' only'],[M],{color:C.MUT,size:9,w:[170]});
  y.y+=34;doc.setDrawColor(...C.INK);doc.line(M,y.y,M+70,y.y);doc.line(W-M-70,y.y,W-M,y.y);
  doc.setFontSize(8);doc.setTextColor(...C.MUT);doc.text('Paid by (clinic)',M,y.y+4);doc.text(P.clean(me.name),M,y.y+8);doc.text('Received by (staff signature)',W-M-70,y.y+4);doc.text(P.clean(sd.name),W-M-70,y.y+8);
  doc.setFontSize(7.5);doc.text(P.clean(clinic.name)+' – salary receipt '+no,M,290);
  await deliverFile(doc.output('blob'),('Salary_receipt_'+sd.name+'_'+d.month+'.pdf').replace(/[^\w.\-]+/g,'_'),'save');
}
const readExpForm=()=>{const g=id=>{const x=$('#'+id);return x?x.value:''};return {date:g('ex-date'),cat:g('ex-cat'),lab:g('ex-lab'),item:g('ex-item').trim(),pat:g('ex-pat').trim(),amount:g('ex-amt'),note:g('ex-note').trim(),method:(document.querySelector('input[name=ex-method]:checked')||{}).value||'Cash'}};
function earningsView(){
  if(!canEarn())return `${homeNav('earn')}<section class="panel"><h2>Clinic earnings</h2><p class="muted">Only the clinic owner (admin) and the accountant can see earnings.</p></section>`;
  if(!earnOpen())return `${homeNav('earn')}<h1>Earnings</h1>${earnLockView()}`;
  if(!earn.anchor)earn.anchor=today();
  if(earn.pays===null||earn.loading)return `${homeNav('earn')}<h1>Earnings</h1><section class="panel"><p class="muted">${earn.err?esc(earn.err):'Loading…'}</p></section>`;
  const D=earnData();
  const tabs=[['overview','Overview'],['treat','By treatment'],['dentists','Dentists'],['expenses','Expenses'],['staff','Staff & salaries'],['payments','Payments']];
  const body={overview:earnOverview,treat:D=>treatTable(D.byProc,D.treatVal,D.done.length),dentists:earnDentists,expenses:earnExpenses,staff:isAcct()?(D=>'<div class="acro"><p class="small muted" style="margin:0">View only – the owner manages staff and salaries.</p>'+earnStaff(D)+'</div>'):earnStaff,payments:earnPayments}[earn.tab]||earnOverview;
  return `${homeNav('earn')}
  <div class="row" style="gap:10px;flex-wrap:wrap"><h1 style="margin:0">Earnings</h1><span class="spacer"></span>
    <label class="row small" style="gap:6px">Print <select id="earn-print" style="width:auto">${[['all','Whole report'],['summary','Summary only'],['treat','Treatments only'],['dentists','Dentists only'],['expenses','Expenses only'],['salaries','Salaries only'],['payments','Payments received only']].map(([k,l])=>`<option value="${k}" ${earn.printWhat===k?'selected':''}>${l}</option>`).join('')}</select></label>
    <button class="btn small primary" data-act="earnPdf">${icon('doc')} PDF</button>
    <button class="btn small" data-act="earnCsv">Excel/CSV</button><button class="btn small" data-act="earnLock">${icon('lock')} Lock</button></div>
  ${needSqlNote()}
  <section class="panel">
    <div class="row" style="gap:10px;flex-wrap:wrap">
      <div class="seg" role="radiogroup" aria-label="Period">${[['day','Daily'],['week','Weekly'],['month','Monthly'],['year','Yearly'],['all','All time']].map(([k,l])=>`<button type="button" class="${earn.period===k?'on':''}" data-earnper="${k}" role="radio" aria-checked="${earn.period===k}">${l}</button>`).join('')}</div>
      <div class="seg" role="radiogroup" aria-label="Section">${[['all','Whole clinic'],['dental','Dental'],['aes','Aesthetics']].map(([k,l])=>`<button type="button" class="${earn.sec===k?'on':''}" data-earnsec="${k}" role="radio" aria-checked="${earn.sec===k}">${l}</button>`).join('')}</div>
      <span class="spacer"></span>
      ${earn.period==='all'?`<b class="eperiod">All time</b>`:`<div class="row" style="gap:6px"><button class="btn small" data-earnnav="-1" aria-label="Previous">‹</button><b class="eperiod">${esc(earnTitle(D.f,D.t))}</b><button class="btn small" data-earnnav="1" aria-label="Next">›</button><button class="btn small" data-earnnav="0">Today</button></div>`}
    </div>
    <nav class="tabs etabs" role="tablist">${tabs.map(([k,l])=>`<button class="tab" role="tab" aria-selected="${earn.tab===k}" data-earntab="${k}">${l}</button>`).join('')}</nav>
    <div class="ebody">${body(D)}</div>
  </section>`;
}
function earnCsv(){
  const D=earnData();const q=s=>'"'+String(s==null?'':s).replace(/"/g,'""')+'"';
  const rows=[[q('Clinic'),q(clinic.name)].join(','),[q('Period'),q(earnTitle(D.f,D.t))].join(','),'',
    ['Summary','Rs'].map(q).join(','),...[['Money received',D.received],['Treatment value',D.treatVal],['Discounts',D.disc],['Expenses',D.expTotal],['Salaries paid',D.salPaid],['Profit',D.profit],['Still owed by patients',D.owed]].map(r=>[q(r[0]),r[1]].join(',')),'',
    ['Treatment','How many','Earned (Rs)'].map(q).join(','),...Object.entries(D.byProc).sort((a,b)=>b[1].v-a[1].v).map(([k,o])=>[q(k),o.n,o.v].join(',')),'',
    ['Dentist','Treatments','Value (Rs)'].map(q).join(','),...Object.entries(D.byDent).map(([k,o])=>[q(k),o.n,o.v].join(',')),'',
    ['Expense date','Type','Item','Amount (Rs)','Note'].map(q).join(','),...D.exps.map(r=>[q(fmtDate(r.data.date)),q(r.data.cat+(r.data.lab?' – '+r.data.lab:'')),q(r.data.item+(r.data.pat?' · '+r.data.pat:'')),+r.data.amount||0,q(r.data.note)].join(',')),'',
    ['Payment date','Patient','Method','Reference','Amount (Rs)','Discount (Rs)','Received by','Note'].map(q).join(','),
    ...D.pays.map(x=>[fmtDate(x.paid_on),patName(x.patient_id),x.method,x.reference,+x.amount||0,+x.discount||0,x.received_by_name,x.note].map(q).join(','))];
  const blob=new Blob(['﻿'+rows.join('\r\n')],{type:'text/csv'});
  deliverFile(blob,('Earnings_'+clinic.name+'_'+(earn.period==='all'?'all_time':D.f+'_to_'+D.t)+'.csv').replace(/[^\w.\-]+/g,'_'),'save');
}
/* PDF report: whole, treatments, dentists, expenses & salaries, payments – or one dentist */
async function earnPdf(what,dentist){
  if(!window.jspdf){toast('The PDF tool did not load. Check your internet and reload the page.');return}
  const D=earnData();const TT={all:'Clinic report',summary:'Clinic summary',treat:'Treatment earnings',dentists:'Dentist earnings',expenses:'Expenses report',salaries:'Salaries report',payments:'Payments received'};const P=pdfBase(dentist?'Dentist report':(TT[what]||'Clinic report'));const {doc,W,M,st,C}=P;
  P.kv('Period',earnTitle(D.f,D.t)+(earn.sec==='all'?'':' · '+(earn.sec==='aes'?'Aesthetics':'Dental')),M,90);P.kv('Printed',fmtDate(today())+' by '+me.name,M+95,80);st.y+=13;
  const R=[W-M];const two=(l,v,b)=>P.row([l,v],[M,W-M],{right:[1],bold:b,w:[140,50]});
  const tTable=(bp,total,count)=>{const xs=[M,W-M-45,W-M];P.row(['Treatment','How many','Earned'],xs,{bold:true,size:8.5,color:C.MUT,right:[1,2],w:[120,25,40]});
    Object.entries(bp).sort((a,b)=>b[1].v-a[1].v).forEach(([k,o])=>P.row([k,String(o.n),money(o.v)],xs,{right:[1,2],w:[120,25,40]}));
    doc.setDrawColor(...C.LINE);doc.line(M,st.y-3.6,W-M,st.y-3.6);P.row(['Total – all treatments',String(count),money(total)],xs,{right:[1,2],bold:true,w:[120,25,40]})};
  if(dentist){const mine=D.done.filter(x=>x.i.doneBy===dentist);const bp={};mine.forEach(({i})=>{const k=procGroup(i.proc);const o=bp[k]||(bp[k]={n:0,v:0});o.n++;o.v+=+i.fee||0});const tv=mine.reduce((a,x)=>a+(+x.i.fee||0),0);
    P.kv('Dentist',dentist,M,120);st.y+=13;P.sec('Treatments done');if(mine.length)tTable(bp,tv,mine.length);else P.row(['No treatment in this period.'],[M],{color:C.MUT});
    const stf=staffFor(dentist);P.sec('Salary / pay');
    if(stf){if(stf.data.pay==='percent')two('Pay type: percentage',(+stf.data.percent||0)+'% of own treatment');else two('Pay type: fixed monthly salary',money(stf.data.salary)+' / month');
      if(stf.data.pay==='percent')two('Share earned in this period ('+(+stf.data.percent||0)+'% of '+money(tv)+')',money(Math.round(tv*(+stf.data.percent||0)/100)),true);
      const months=[];if(earn.period!=='all'){let d=parseD(D.f.slice(0,7)+'-01');const end=parseD(D.t);while(d<=end&&months.length<24){months.push(isoD(d).slice(0,7));d=new Date(d.getFullYear(),d.getMonth()+1,1)}}
      const sals=finOf('salary').filter(r=>r.data.staff_id===stf.id&&(earn.period==='all'||months.includes(r.data.month))).sort((a,b)=>String(a.data.month).localeCompare(String(b.data.month)));
      const mlab=m=>parseD(m+'-01').toLocaleDateString('en-GB',{month:'long',year:'numeric'});
      P.row(['Month','Status','Paid by','Amount'],[M,M+50,M+90,W-M],{bold:true,size:8.5,color:C.MUT,right:[3],w:[48,38,70,40]});
      const shown=new Set();sals.forEach(r=>{shown.add(r.data.month);const pd=r.data.status==='paid';P.row([mlab(r.data.month),pd?'Paid'+(r.data.paid_on?' '+fmtDate(r.data.paid_on):''):'Unpaid',pd?(r.data.method||'–')+(r.data.ref?' – '+r.data.ref:''):'–',money(pd?r.data.amount:payDue(stf,r.data.month))],[M,M+50,M+90,W-M],{right:[3],w:[48,38,70,40]})});
      months.filter(m=>!shown.has(m)&&m<=today().slice(0,7)).forEach(m=>P.row([mlab(m),'Unpaid','–',money(payDue(stf,m))],[M,M+50,M+90,W-M],{right:[3],w:[48,38,70,40]}));
      const paidT=sals.filter(r=>r.data.status==='paid').reduce((a,r)=>a+(+r.data.amount||0),0);doc.setDrawColor(...C.LINE);doc.line(M,st.y-3.6,W-M,st.y-3.6);two('Total salary paid',money(paidT),true)}
    else P.row(['Pay not set yet – set it in Earnings → Dentists.'],[M],{color:C.MUT})
    if(mine.length){P.sec('Every treatment');const xs=[M,M+24,M+80,M+96,W-M];mine.sort((a,b)=>String(a.i.doneDate).localeCompare(String(b.i.doneDate))).forEach(({p,i})=>P.row([fmtDate(i.doneDate),(p.first+' '+p.last).trim(),i.tooth||'–',i.proc,money(i.fee)],xs,{right:[4],w:[22,54,14,70,30],size:8.5}))}
  }else{
    if(what==='all'||what==='summary'){P.sec('Summary');two('Money received',money(D.received));two('Expenses',money(D.expTotal));two('Salaries paid',money(D.salPaid));two('Profit',(D.profit<0?'- ':'')+money(Math.abs(D.profit)),true);two('Treatment done (value)',money(D.treatVal));two('Discounts given',money(D.disc));two('Still owed by patients (up to now)',money(D.owed))}
    if(what==='all'||what==='treat'){P.sec('Earnings by treatment');if(D.done.length)tTable(D.byProc,D.treatVal,D.done.length);else P.row(['No treatment in this period.'],[M],{color:C.MUT})}
    if(what==='all'||what==='dentists'){P.sec('Treatment value by dentist');const xs=[M,W-M-45,W-M];P.row(['Dentist','Treatments','Value'],xs,{bold:true,size:8.5,color:C.MUT,right:[1,2],w:[120,25,40]});
      Object.entries(D.byDent).sort((a,b)=>b[1].v-a[1].v).forEach(([k,o])=>{const s=staffFor(k);P.row([k+(s&&s.data.pay==='percent'?'  ('+(+s.data.percent||0)+'% = '+money(Math.round(o.v*(+s.data.percent||0)/100))+')':''),String(o.n),money(o.v)],xs,{right:[1,2],w:[120,25,40]})})}
    if(what==='all'||what==='expenses'){P.sec('Expenses');if(D.exps.length){const xs=[M,M+24,M+70,W-M];D.exps.slice().reverse().forEach(r=>{const d=r.data;P.row([fmtDate(d.date),d.cat+(d.lab?' – '+d.lab:''),(d.item||'')+(d.pat?' · '+d.pat:'')+(d.method?' ('+d.method+')':''),money(d.amount)],xs,{right:[3],w:[22,46,90,30],size:8.5})});
        doc.setDrawColor(...C.LINE);doc.line(M,st.y-3.6,W-M,st.y-3.6);two('Total expenses',money(D.expTotal),true);Object.entries(D.byCat).forEach(([k,v])=>two('   '+k,money(v)))}else P.row(['No expenses in this period.'],[M],{color:C.MUT});
    }
    if(what==='all'||what==='salaries'){
      P.sec('Staff salaries');
      let months=[];if(earn.period==='all')months=[...new Set(finOf('salary').map(r=>r.data.month))].sort();else{let d=parseD(D.f.slice(0,7)+'-01');const end=parseD(D.t);while(d<=end&&months.length<24){months.push(isoD(d).slice(0,7));d=new Date(d.getFullYear(),d.getMonth()+1,1)}}
      months=months.filter(m=>m<=today().slice(0,7));
      const staff=finOf('staff');const xs=[M,M+52,M+80,M+118,W-M];
      P.row(['Staff','Month','Status','Paid by','Amount'],xs,{bold:true,size:8.5,color:C.MUT,right:[4],w:[50,26,36,46,30]});
      let paidT=0,dueT=0,any=false;
      months.forEach(m=>staff.forEach(stf=>{const r=finOf('salary').find(x=>x.data.staff_id===stf.id&&x.data.month===m);const pd=r&&r.data.status==='paid';
        if(!pd&&stf.data.active===false)return;any=true;const amt=pd?(+r.data.amount||0):payDue(stf,m);if(pd)paidT+=amt;else dueT+=amt;
        P.row([stf.data.name+' ('+(stf.data.role==='Other'&&stf.data.roleName?stf.data.roleName:stf.data.role)+')',MONTHS[+m.slice(5,7)-1]+' '+m.slice(0,4),pd?'Paid '+(r.data.paid_on?fmtDate(r.data.paid_on):''):'Unpaid',pd?(r.data.method||'–'):'–',money(amt)],xs,{right:[4],w:[50,26,36,46,30],size:8.5,color:pd?C.INK:C.MUT})}));
      if(!any)P.row(['No staff salaries in this period.'],[M],{color:C.MUT});
      else{doc.setDrawColor(...C.LINE);doc.line(M,st.y-3.6,W-M,st.y-3.6);two('Total salaries paid',money(paidT),true);two('Salaries still unpaid',money(dueT))}
    }
    if(what==='all'||what==='payments'){P.sec('Payments received');const xs=[M,M+24,M+82,M+125,W-M];D.pays.slice().reverse().forEach(x=>P.row([fmtDate(x.paid_on),patName(x.patient_id),x.method||'',x.received_by_name||'',money(x.amount)],xs,{right:[4],w:[22,56,42,40,30],size:8.5}));
      doc.setDrawColor(...C.LINE);doc.line(M,st.y-3.6,W-M,st.y-3.6);two('Total received',money(D.received),true)}
  }
  const pages=doc.getNumberOfPages();for(let i=1;i<=pages;i++){doc.setPage(i);doc.setFontSize(7.5);doc.setTextColor(...C.MUT);doc.text(P.clean(clinic.name)+' – confidential financial report',M,290);doc.text('Page '+i+' of '+pages,W-M,290,{align:'right'})}
  const fn=((dentist?'Dentist_'+dentist:'Clinic_report_'+what)+'_'+(earn.period==='all'?'all_time':D.f+'_to_'+D.t)+'.pdf').replace(/[^\w.\-]+/g,'_');
  await deliverFile(doc.output('blob'),fn,'save');
}
/* Earnings PIN: 4–6 digits, kept (hashed) on the admin's own account, set with the login password. */
async function pinHash(pin,salt){
  const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(String(pin)),'PBKDF2',false,['deriveBits']);
  const bits=await crypto.subtle.deriveBits({name:'PBKDF2',salt:new TextEncoder().encode(salt),iterations:120000,hash:'SHA-256'},key,256);
  return [...new Uint8Array(bits)].map(b=>b.toString(16).padStart(2,'0')).join('');
}
const myPin=()=>((user&&user.user_metadata)||{}).earn_pin||null;
function earnLockView(){
  const has=myPin()&&earn.mode!=='set';
  if(!has)return `<section class="panel earnlock">
    <div class="lockicon" aria-hidden="true">${icon('lock')}</div>
    <h2>${myPin()?'Change earnings PIN':'Set an earnings PIN'}</h2>
    <p class="muted">Choose a 4 to 6 digit number. You'll type it each time you open Earnings. Only the owner (admin) and the accountant can open it – each with their own PIN.</p>
    <form id="earnSetPin" style="display:flex;flex-direction:column;gap:10px;width:100%;max-width:320px">
      <label class="f"><span>Your login password (to confirm it's you)</span><input type="password" id="ep-pw" autocomplete="current-password" required></label>
      <label class="f"><span>New PIN (4–6 numbers)</span><input type="password" id="ep-new" inputmode="numeric" pattern="[0-9]{4,6}" maxlength="6" autocomplete="off" required></label>
      <label class="f"><span>Type the PIN again</span><input type="password" id="ep-new2" inputmode="numeric" pattern="[0-9]{4,6}" maxlength="6" autocomplete="off" required></label>
      ${earn.err?`<p class="msg err" role="alert">${esc(earn.err)}</p>`:''}
      <button class="btn primary" type="submit" ${earn.busy?'disabled':''}>${earn.busy?'Saving…':'Save PIN and open'}</button>
      ${myPin()?'<button class="btn" type="button" data-act="earnCancelSet">Cancel</button>':''}
    </form>
  </section>`;
  return `<section class="panel earnlock">
    <div class="lockicon" aria-hidden="true">${icon('lock')}</div>
    <h2>Enter earnings PIN</h2>
    <form id="earnLock" style="display:flex;flex-direction:column;gap:12px;align-items:center;width:100%;max-width:280px">
      <input type="password" id="earn-pin" class="pinbox" inputmode="numeric" pattern="[0-9]*" maxlength="6" autocomplete="off" aria-label="PIN" placeholder="••••" required>
      <div class="pinpad">${['1','2','3','4','5','6','7','8','9','del','0','ok'].map(k=>`<button type="${k==='ok'?'submit':'button'}" ${k==='ok'?'':`data-pinkey="${k}"`} class="${k==='ok'?'ok':''}" aria-label="${k==='del'?'Delete':k==='ok'?'Open':k}">${k==='del'?'⌫':k==='ok'?'OK':k}</button>`).join('')}</div>
      ${earn.err?`<p class="msg err" role="alert" style="width:100%">${esc(earn.err)}</p>`:''}
    </form>
    <button class="linkbtn small" data-act="earnForgot">Forgot PIN? Set a new one with your login password</button>
    <p class="small muted" style="margin:0">Locks again after ${EARN_LOCK_MIN} minutes and when you log out.</p>
  </section>`;
}
/* ---- Owner access (Dr Abid Ali): test the app in a separate practice clinic, and erase test data ---- */
const OWNER={s:'76a972ad678f15f59e027e54',h:'143ada41876d838834c3e207daee9b5e166fc9df5e89aaa52be8358b5200af21'};
async function ownerHash(code){
  const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(String(code)),'PBKDF2',false,['deriveBits']);
  const bits=await crypto.subtle.deriveBits({name:'PBKDF2',salt:new TextEncoder().encode(OWNER.s),iterations:200000,hash:'SHA-256'},key,256);
  return [...new Uint8Array(bits)].map(b=>b.toString(16).padStart(2,'0')).join('');
}
function ownerView(){
  if(!view.ownerOk)return `<div class="auth">${brand()}<section class="panel earnlock">
    <div class="lockicon" aria-hidden="true">${icon('lock')}</div>
    <h2>Owner access</h2><p class="muted" style="margin:0">For the app owner only. Enter your 8-digit owner code.</p>
    <form id="ownerForm" style="display:flex;flex-direction:column;gap:12px;align-items:center;width:100%;max-width:280px">
      <input type="password" id="own-code" class="pinbox" inputmode="numeric" pattern="[0-9]*" maxlength="8" autocomplete="off" aria-label="Owner code" placeholder="••••••••" required>
      <div class="pinpad">${['1','2','3','4','5','6','7','8','9','del','0','ok'].map(k=>`<button type="${k==='ok'?'submit':'button'}" ${k==='ok'?'':`data-pinkey="${k}"`} class="${k==='ok'?'ok':''}" aria-label="${k==='del'?'Delete':k==='ok'?'Open':k}">${k==='del'?'⌫':k==='ok'?'OK':k}</button>`).join('')}</div>
      ${view.ownerErr?`<p class="msg err" role="alert" style="width:100%">${esc(view.ownerErr)}</p>`:''}
    </form>
    <button class="linkbtn" data-act="ownerBack">← Back to login</button></section></div>`;
  return `<div class="auth">${brand()}<section class="panel" style="display:flex;flex-direction:column;gap:12px">
    <h2 style="margin:0">Owner tools</h2>
    <div class="ownercard"><b>Test the app without making a clinic</b>
      <p class="small muted" style="margin:0">Opens a ready-made <b>Owner Test Clinic</b> with example patients. Everything works with no trial limit. Its data is kept apart from real clinics, and you can reset it any time.</p>
      <button class="btn primary" data-act="ownerTest">Open owner test clinic</button></div>
    ${LOCAL&&!OWNER_TEST?`<div class="ownercard danger"><b>Erase all clinics on this device</b>
      <p class="small muted" style="margin:0">Deletes every clinic, login, patient, payment and X-ray saved in this browser (offline version), so the app starts fresh. This cannot be undone.</p>
      <form id="ownerErase" style="display:flex;gap:8px;flex-wrap:wrap"><input type="text" id="own-erase" placeholder="Type ERASE" autocomplete="off" style="flex:1;min-width:140px"><button class="btn danger" type="submit">Erase everything</button></form></div>`
    :!LOCAL?`<div class="ownercard"><b>Delete a test clinic in the online version</b>
      <p class="small muted" style="margin:0">Log in as that clinic's admin → <b>Clinic & account</b> → <b>Delete clinic</b>. Make the deletion code in your Key Maker (Online mode) with the clinic code shown there.</p></div>`:''}
    <button class="linkbtn" data-act="ownerBack">← Back to login</button></section></div>`;
}
const ownerBar=()=>OWNER_TEST?`<div class="ownerbar" role="status"><b>OWNER TEST MODE</b><span>Practice clinic for testing only – kept apart from real clinics</span><span class="spacer"></span><button class="btn small" data-act="ownerReset">Reset test data</button><button class="btn small" data-act="ownerExit">Exit test mode</button></div>`:'';
async function ownerAutoLogin(){
  const ld=window.__LOCAL_DB;await ld.ready;
  let pw=lsGet('ownerPw');
  if(ld.userCount()>0&&pw){const r=await sb.auth.signInWithPassword({email:'owner',password:pw});if(!r.error){user=r.data.user;await afterLogin();return}}
  if(ld.userCount()>0)await ld.wipeAll();
  pw=[...crypto.getRandomValues(new Uint8Array(12))].map(x=>x.toString(16).padStart(2,'0')).join('');lsSet('ownerPw',pw);
  const r=await sb.auth.signUp({email:'owner',password:pw,options:{data:{full_name:'Dr Abid Ali',pmdc:''}}});if(r.error)throw r.error;user=r.data.user;
  const c=await sb.rpc('create_clinic',{p_name:'Owner Test Clinic',p_address:'Testing only',p_phone:'',p_my_name:'Dr Abid Ali'});if(c.error)throw c.error;
  await afterLogin(c.data);
  const np=sample();np.notes[0].by=me.name;db.patients.push(np);markDirty(np.id);await flush();render();
}
function shell(content){
  const s=view.screen,active=s==='appts'?'appts':s==='msgs'?'msgs':s==='settings'?'settings':s==='earn'?'earn':s==='pharm'?'pharm':s==='lab'?'lab':s==='aes'||(s==='patient'&&isAes(P()))?'aes':'list';const un=unreadCount();
  const lic=clinic.lic;const ini=(me.name||'?').replace(/^Dr\.?\s*/i,'').trim().slice(0,1).toUpperCase();
  return `<div class="shell">
  <aside class="sidebar" aria-label="Main menu">
    <div class="side-brand">${clinicMark()}<span>${branding.logo?esc(clinic.name):'Clinic Patient Records'}</span></div>
    ${clockHtml()}
    <div class="side-clinic"><b>${esc(clinic.name)}</b>${lic&&lic.state==='trial'?`<span>Free trial · ${lic.daysLeft} day${lic.daysLeft>1?'s':''} left</span>`:lic&&lic.state==='expired'?'<span class="bad">Trial ended · read-only</span>':clinic.address?`<span>${esc(clinic.address)}</span>`:''}</div>
    <nav class="side-nav">
      ${pharmOnly()?'':`<button class="${active==='list'?'on':''}" data-home="list">${icon('people')}<span>Patients</span></button>
      <button class="${active==='aes'?'on':''}" data-home="aes">${icon('sparkle')}<span>Aesthetics</span></button>`}
      ${pharmOnly()?'':`<button class="${active==='appts'?'on':''}" data-home="appts">${icon('calendar')}<span>Appointments</span>${booking.waiting.length?`<em class="badge" title="Online bookings waiting">${booking.waiting.length}</em>`:''}</button>`}
      ${pharmOn()&&(!pharmOnly()||isPS())?`<button class="${active==='pharm'?'on':''}" data-home="pharm">${icon('pill')}<span>Pharmacy</span>${pharmBadge()?`<em class="badge">${pharmBadge()}</em>`:''}</button>`:''}${labOn()&&(!pharmOnly()||isLS())?`<button class="${active==='lab'?'on':''}" data-home="lab">${icon('flask')}<span>Laboratory</span>${labBadge()?`<em class="badge">${labBadge()}</em>`:''}</button>`:''}
      <button class="${active==='msgs'?'on':''}" data-home="msgs">${icon('chat')}<span>Messages</span>${un?`<em class="badge">${un}</em>`:''}</button>
      ${canEarn()?`<button class="${active==='earn'?'on':''}" data-home="earn">${icon('money')}<span>Earnings</span>${earnOpen()?'':`<em class="lockmark" title="PIN protected">${icon('lock')}</em>`}</button>`:''}
      <button class="${active==='settings'?'on':''}" data-act="settings">${icon('gear')}<span>${isAdmin()?'Clinic &amp; account':'My account'}</span></button>
    </nav>
    <div class="side-foot">
      <div class="side-user"><span class="avatar" style="--h:${hueOf(me.name)}">${esc(ini)}</span><span><b>${esc(me.name)}</b><small>${ROLE_LABEL[me.role]||''}${loginAt?' · since '+hm(loginAt):''}</small></span></div>
      ${syncBadge()}
      <p class="side-credit">Made and designed by Dr Abid Ali, Forensic Odontologist<br>© 2026 · All rights reserved</p>
      <p class="side-credit" style="opacity:.75">Version: ${APP_VERSION}</p>
      <div class="row"><button class="side-btn" data-act="toggleSound" aria-pressed="${Sound.on}">${icon(Sound.on?'sound':'mute')}<span>Sound ${Sound.on?'on':'off'}</span></button><button class="side-btn" data-act="logout">${icon('logout')}<span>Log out</span></button></div>
    </div>
  </aside>
  <main class="main"><div class="wrap">${content}</div></main>
<button type="button" id="helpFab" class="helpfab" aria-label="Smart Help – find any setting">🧭 <span>Help</span></button>
</div>`;
}
/* Attendance: each login starts a record; logout (or the last activity) ends it. */
let attId=null,attT=null,attDay=null,attRows=null;
let loginAt=null;
async function startAttendance(){
  if(!clinic||!me)return;loginAt=new Date().toISOString();
  try{const {data:open}=await sb.from('attendance').select('*').eq('clinic_id',clinic.id).eq('user_id',user.id);
    const opens=(open||[]).filter(r=>!r.ended_at).sort((a,b)=>String(b.last_seen||b.started_at).localeCompare(String(a.last_seen||a.started_at)));
    const keep=opens.find(r=>Date.now()-new Date(r.last_seen||r.started_at)<30*60*1000);
    for(const r of opens.filter(r=>r!==keep))await sb.from('attendance').update({ended_at:r.last_seen||r.started_at,auto:true}).eq('id',r.id);
    if(keep){attId=keep.id;loginAt=keep.started_at;await sb.from('attendance').update({last_seen:new Date().toISOString()}).eq('id',keep.id)}
    else{const t0=new Date().toISOString();const {data}=await sb.from('attendance').insert({clinic_id:clinic.id,user_id:user.id,name:me.name,role:me.role,started_at:t0,last_seen:t0,ended_at:null});
    attId=data&&data[0]&&data[0].id;}}catch(e){}
  clearInterval(attT);attT=setInterval(()=>{if(attId)sb.from('attendance').update({last_seen:new Date().toISOString()}).eq('id',attId)},60*1000);
}
async function endAttendance(){clearInterval(attT);if(attId){try{await sb.from('attendance').update({ended_at:new Date().toISOString(),last_seen:new Date().toISOString()}).eq('id',attId)}catch(e){}}attId=null}
window.addEventListener('pagehide',()=>{if(attId)try{sb.from('attendance').update({last_seen:new Date().toISOString()}).eq('id',attId)}catch(e){}});
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden'&&attId)sb.from('attendance').update({last_seen:new Date().toISOString()}).eq('id',attId)});
async function loadAttendance(day){
  const s=new Date(day+'T00:00:00'),e=new Date(s);e.setDate(e.getDate()+1);
  const {data}=await sb.from('attendance').select('*').eq('clinic_id',clinic.id).gte('started_at',s.toISOString()).lt('started_at',e.toISOString()).order('started_at');
  attRows=data||[];
}
const hm=t=>{const d=new Date(t);let h=d.getHours();const ap=h>=12?'PM':'AM';h=h%12||12;return h+':'+pad(d.getMinutes())+' '+ap};
const dur=ms=>{const m=Math.max(0,Math.round(ms/60000));return Math.floor(m/60)+' h '+pad(m%60)+' min'};
function attendancePanel(){
  const day=attDay||today();
  const rows=attRows||[];const per={};
  rows.forEach(r=>{const end=r.ended_at||(r.id===attId?new Date().toISOString():r.last_seen||r.started_at);(per[r.user_id]=per[r.user_id]||{name:r.name,role:r.role,ms:0,first:r.started_at,last:end}).ms+=new Date(end)-new Date(r.started_at);per[r.user_id].last=end});
  if(!view.attOpen)return `<section class="panel" id="attendance"><div class="row"><h3>Attendance</h3><span class="spacer"></span><button class="btn small" data-act="attToggle" type="button">Show</button></div></section>`;
  return `<section class="panel" id="attendance">
    <div class="row"><h3>Attendance</h3><span class="spacer"></span><button class="btn small" data-act="attToggle" type="button">Hide</button><button class="btn small" data-attday="${shiftDay(day,-1)}" aria-label="Previous day">‹</button><input type="date" id="attPick" value="${day}" style="width:auto"><button class="btn small" data-attday="${shiftDay(day,1)}" aria-label="Next day">›</button></div>
    <p class="small muted" style="margin:0">Recorded automatically when someone logs in and out on this device. If someone closes the app without logging out, their last activity is used.</p>
    ${attRows===null?'<p class="small muted" style="margin:0">Loading…</p>':rows.length?`
    <div class="att-sum">${Object.values(per).map(p=>`<div><span class="avatar" style="--h:${hueOf(p.name)}">${esc((p.name||'?').replace(/^Dr\.?\s*/i,'').slice(0,1))}</span><span><b>${esc(p.name)}</b><small>${hm(p.first)} – ${hm(p.last)} · ${dur(p.ms)}</small></span></div>`).join('')}</div>
    <div class="tablewrap"><table class="att"><thead><tr><th>Name</th><th>Role</th><th>Logged in</th><th>Logged out</th><th>Time</th></tr></thead><tbody>
    ${rows.map(r=>{const live=r.id===attId;const end=r.ended_at||(live?new Date().toISOString():r.last_seen||r.started_at);return `<tr><td>${esc(r.name)}</td><td>${ROLE_LABEL[r.role]||''}</td><td class="num">${hm(r.started_at)}</td><td class="num">${live?'<span class="pill ok">Now</span>':r.ended_at?hm(r.ended_at)+(r.auto?' <span class="small muted">(no log out)</span>':''):'<span class="small muted">'+hm(end)+' (last seen)</span>'}</td><td class="num">${dur(new Date(end)-new Date(r.started_at))}</td></tr>`}).join('')}
    </tbody></table></div>`:'<p class="empty" style="margin:0">Nobody logged in on this day.</p>'}
  </section>`;
}
function clockParts(){const d=new Date();let h=d.getHours();const ap=h>=12?'PM':'AM';h=h%12||12;
  return{time:h+':'+pad(d.getMinutes()),ap,date:d.toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long',year:'numeric'}),short:d.toLocaleDateString('en-GB',{weekday:'short',day:'numeric',month:'short'})}}
function clockHtml(){const c=clockParts();return `<div class="clock" aria-live="off"><div class="clock-time"><b data-clock="time">${c.time}</b><span data-clock="ap">${c.ap}</span></div><div class="clock-date" data-clock="date">${c.date}</div></div>`}
function clockMini(){const c=clockParts();return `<div class="clock-mini desk-hide"><span data-clock="short">${c.short}</span><b><span data-clock="time">${c.time}</span> <span data-clock="ap">${c.ap}</span></b></div>`}
setInterval(()=>{const c=clockParts();document.querySelectorAll('[data-clock]').forEach(el=>{const v=c[el.dataset.clock];if(el.textContent!==v)el.textContent=v})},15000);
function hueOf(s){let h=0;for(const ch of String(s||''))h=(h*31+ch.charCodeAt(0))%360;return [190,160,28,340,220,120,265,8][h%8]}
function toothMark(){return `<svg viewBox="0 0 100 100" aria-hidden="true"><polygon points="4,4 96,4 68,32 32,32" fill="currentColor" opacity=".35"/><polygon points="4,96 96,96 68,68 32,68" fill="currentColor" opacity=".35"/><polygon points="4,4 32,32 32,68 4,96" fill="currentColor" opacity=".55"/><polygon points="96,4 68,32 68,68 96,96" fill="currentColor" opacity=".55"/><rect x="32" y="32" width="36" height="36" fill="currentColor"/></svg>`}
function icon(n){const p={
  people:'<circle cx="9" cy="8" r="3.2"/><path d="M3 19c.6-3.3 3-5 6-5s5.4 1.7 6 5"/><circle cx="17" cy="9" r="2.4"/><path d="M15.5 14.2c2.6.2 4.3 1.8 4.8 4.8"/>',
  calendar:'<rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
  gear:'<circle cx="12" cy="12" r="3"/><path d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21M5.6 5.6l1.8 1.8M16.6 16.6l1.8 1.8M5.6 18.4l1.8-1.8M16.6 7.4l1.8-1.8"/>',
  sound:'<path d="M4 10v4h4l5 4V6L8 10H4z"/><path d="M16.5 9a4 4 0 0 1 0 6M19 6.5a7.5 7.5 0 0 1 0 11"/>',
  mute:'<path d="M4 10v4h4l5 4V6L8 10H4z"/><path d="M17 9.5l4 5M21 9.5l-4 5"/>',
  doc:'<path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5M10 13h6M10 17h6"/>',
  chat:'<path d="M4 5h16v11H9l-5 4z"/><path d="M8 9h8M8 12h5"/>',
  camera:'<path d="M4 8h3l2-2.5h6L17 8h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
  logout:'<path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4"/><path d="M10 16l-4-4 4-4M6 12h10"/>',
  sparkle:'<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M18.5 15.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7z"/>',
  pill:'<rect x="3.5" y="8.5" width="17" height="7" rx="3.5" transform="rotate(-35 12 12)"/><path d="M9.4 7.9l5.2 8.2"/>',
  flask:'<path d="M9 3h6M10 3v6l-5 9a1.5 1.5 0 0 0 1.3 2.2h11.4A1.5 1.5 0 0 0 19 18l-5-9V3"/><path d="M7.5 15h9"/>',
  lock:'<rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/><circle cx="12" cy="15.5" r="1.3"/>',
  money:'<rect x="3" y="6" width="18" height="12" rx="2"/><circle cx="12" cy="12" r="2.8"/><path d="M6.5 9.5v5M17.5 9.5v5"/>'}[n]||'';
  return `<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`}
const msgHtml=()=>view.msg?`<div class="msg ${view.msg.t}" role="alert">${esc(view.msg.m)}</div>`:'';
const brand=()=>`<div class="brand"><svg viewBox="0 0 100 100" aria-hidden="true"><polygon points="4,4 96,4 68,32 32,32" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="5"/><polygon points="4,96 96,96 68,68 32,68" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="5"/><polygon points="4,4 32,32 32,68 4,96" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="5"/><polygon points="96,4 68,32 68,68 96,96" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="5"/><rect x="32" y="32" width="36" height="36" fill="var(--accent)"/></svg><div><b>Clinic Patient Records</b><span>Dental records for your clinic</span></div></div>`;
const hospMode=()=>typeof facilityPref!=='undefined'&&facilityPref==='dental_hospital';
const hospBrand=()=>`<div class="brand hospbrand"><svg viewBox="0 0 100 100" aria-hidden="true"><rect x="14" y="30" width="72" height="58" rx="4" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="5"/><rect x="36" y="8" width="28" height="22" rx="3" fill="var(--accent)"/><path d="M50 12v14M43 19h14" stroke="#fff" stroke-width="4" stroke-linecap="round"/><rect x="26" y="42" width="12" height="12" fill="var(--accent)"/><rect x="62" y="42" width="12" height="12" fill="var(--accent)"/><rect x="26" y="62" width="12" height="12" fill="var(--accent)"/><rect x="62" y="62" width="12" height="12" fill="var(--accent)"/><rect x="43" y="64" width="14" height="24" fill="var(--accent)"/></svg><div><b>Hospital Patient Records</b><span>Dental hospital: departments, pharmacy &amp; laboratory</span></div></div>`;
const hospPerks=()=>`<div class="hospperks"><span>🏥 Departments</span><span>💊 Pharmacy</span><span>🧪 Laboratory</span><span>👥 Staff logins</span><span>📱 Patient portal</span></div>`;
function configView(){return `<div class="auth">${brand()}<section class="panel"><h2>Almost ready</h2><p style="margin:0">This app is not connected to its database yet. Open <b>config.js</b> and paste your Supabase <b>Project URL</b> and <b>anon public key</b>, as shown in the setup guide.</p></section></div>`}
function offlineView(){return `<div class="auth">${brand()}<section class="panel"><h2>Can't connect</h2><p style="margin:0">The app could not load. Check your internet connection, then reload the page.</p><div class="row"><button class="btn primary" data-act="reload">Reload</button></div></section></div>`}
function loadingView(){return `<div class="auth">${brand()}<p class="muted" style="text-align:center">Loading…</p></div>`}
function errorView(){return `<div class="auth">${brand()}${msgHtml()}<div class="row"><button class="btn primary" data-act="reload">Try again</button><button class="btn" data-act="logout">Log out</button></div></div>`}
function authView(){
  const t=LOCAL?(window.__LOCAL_DB.userCount()===0?'signup':'login'):view.authTab;
  const H=hospMode();
  return `<div class="auth ${H?'hospauth':''}">${H?hospBrand():brand()}
  ${H&&t==='signup'?`<section class="panel hosphead"><h2>Register your dental hospital</h2><p class="small muted" style="margin:0">Create the administrator account first. Next you set up the hospital with its departments, pharmacy and laboratory.</p>${hospPerks()}</section>`:''}
  ${LOCAL?'':`<div class="tabs" role="tablist"><button class="tab" role="tab" aria-selected="${t==='login'}" data-authtab="login">Log in</button><button class="tab" role="tab" aria-selected="${t==='signup'}" data-authtab="signup">${LOCAL?'First-time setup':H?'Register hospital':'Create account'}</button></div>`}
  ${msgHtml()}
  ${t==='login'?`<form class="panel" id="loginForm" novalidate>
    <label class="f"><span>${LOCAL?'Username':'Email'}</span><input type="${LOCAL?'text':'email'}" id="li-email" autocomplete="username" autocapitalize="off" autocorrect="off" ${LOCAL?'':'inputmode="email"'} value="${esc(view.email||'')}" required></label>
    <label class="f"><span>Password</span><input type="password" id="li-pw" autocomplete="current-password" required></label>
    <button class="btn primary" type="submit">Log in</button>
    ${LOCAL?`<button class="linkbtn" type="button" data-act="showUsers">${view.showUsers?'Hide usernames':'Forgot your username?'}</button>
    ${view.showUsers?`<div class="summary">${window.__LOCAL_DB.usernames().map(u=>`<span><b>${esc(u.username)}</b>${u.name?' · '+esc(u.name):''}</span>`).join('')}</div>`:''}
    <p class="small muted" style="margin:0">Forgot your password? Your clinic admin can reset it in Clinic & account → Team.</p>
    <button class="linkbtn" type="button" data-act="showRecover">${view.showRecover?'Hide':'Admin forgot password?'}</button>`:'<button class="linkbtn" type="button" data-act="forgot">Forgot password?</button>'}
  </form>
  ${LOCAL&&view.showRecover?`<form class="panel" id="recoverForm" novalidate><h3>Reset admin password</h3>
    <label class="f"><span>Admin username</span><input type="text" id="rv-user" autocapitalize="off" autocorrect="off" value="${esc(view.email||'')}" required></label>
    <label class="f"><span>Recovery code</span><input type="text" id="rv-code" class="codein" autocapitalize="characters" autocomplete="off" placeholder="XXXX-XXXX-XXXX" value="${esc(view.rvCode||'')}" required></label>
    <label class="f"><span>New password (at least 8 characters)</span><input type="password" id="rv-pw" autocomplete="new-password" minlength="8" required></label>
    <button class="btn primary" type="submit">Set new password</button></form>`:''}`:`<form class="panel" id="signupForm" novalidate>
    <label class="f"><span>${H?'Administrator name (hospital owner / director)':'Your name (as shown on records)'}</span><input type="text" id="su-name" placeholder="e.g. Dr Ayesha Khan" autocomplete="name" required></label>
    <label class="f"><span>PMDC registration no. (dentists)</span><input type="text" id="su-pmdc" placeholder="e.g. 12345-D" autocomplete="off"></label>
    <label class="f"><span>${LOCAL?'Choose a username (for logging in)':'Email'}</span><input type="${LOCAL?'text':'email'}" id="su-email" autocomplete="username" autocapitalize="off" autocorrect="off" ${LOCAL?'placeholder="e.g. ayesha"':'inputmode="email"'} required></label>
    <label class="f"><span>Password (at least 8 characters)</span><input type="password" id="su-pw" autocomplete="new-password" minlength="8" required></label>
    <button class="btn primary" type="submit">${LOCAL?'Continue':H?'Create hospital account':'Create account'}</button>
    <p class="small muted" style="margin:0">${LOCAL?(H?'You become the hospital administrator. Next you enter the hospital name and choose its departments.':'You become the clinic admin. Next you enter your clinic name, then you can add other dentists.'):(H?'After this you create your hospital and choose its departments, pharmacy and laboratory. You need a creation code from ClinicRecords.pk.':'After this you can create your clinic, or join one with an invite code from your clinic admin.')}</p>
  </form>
  ${LOCAL?`<section class="panel"><h3>Moving from another phone?</h3>
    <label class="f"><span>Restore a full backup file instead</span><input type="file" id="restoreFile" accept=".json,application/json"></label>
    ${view.confirm==='restore'?`<div class="confirm">Restore the backup of ${esc(view.restoreInfo||'')}? Then log in with your usual username.<span class="spacer"></span><button class="btn small" data-act="cancelConfirm">Cancel</button><button class="btn small primary" data-act="doRestore">Restore</button></div>`:''}
  </section>`:''}`}
  <p class="small muted" style="text-align:center">${LOCAL?'Records are saved on this device only.':'Works on phone, tablet and computer. Your records sync between them.'}</p></div>`;
}
function newpwView(){return `<div class="auth">${brand()}${msgHtml()}<form class="panel" id="newpwForm"><h2>Set a new password</h2>
  <label class="f"><span>New password (at least 8 characters)</span><input type="password" id="np-pw" autocomplete="new-password" minlength="8" required></label>
  <button class="btn primary" type="submit">Save password</button></form></div>`}
function onboardView(){
  const nm=(user&&user.user_metadata&&user.user_metadata.full_name)||'';
  const pm=(user&&user.user_metadata&&user.user_metadata.pmdc)||'';
  const H=hospMode();
  return `<div class="auth ${H?'hospauth':''}">${H?hospBrand():brand()}${msgHtml()}
  <form class="panel" id="createForm"><h2>${H?'Create your dental hospital':'Create your clinic'}</h2>${H?hospPerks():''}
    <p class="small muted" style="margin:0">${H?(LOCAL?'You become the hospital administrator and can add dentists, pharmacy and lab staff with their own logins.':'You become the hospital administrator. Doctors, pharmacy and lab staff are invited by email later (Earnings → Staff &amp; salaries).'):LOCAL?'You become the clinic admin and can add dentists with their own logins.':'You become the clinic admin and get an invite code for your dentists.'}</p>
    <label class="f" ${H?'hidden':''}><span>What are you registering?</span><select id="cc-fac"><option value="dental_clinic" ${facilityPref==='dental_clinic'?'selected':''}>Dental clinic</option><option value="dental_hospital" ${facilityPref==='dental_hospital'?'selected':''}>Dental hospital (departments)</option><option disabled>Medical clinic – coming soon</option><option disabled>Medical hospital – coming soon</option></select></label>
    ${LOCAL?'':'<label class="f"><span>'+(H?'Hospital creation code (from ClinicRecords.pk)':'Clinic creation code (from the app owner)')+'</span><input type="text" id="cc-code" class="codein" autocapitalize="characters" autocomplete="off" required></label><p class="small muted" style="margin:0">Only clinics approved by the app owner can be created. If you work for a clinic that already uses the app, do not create a new one: ask your clinic admin to invite your email, then log in again.</p>'}
    <label class="f"><span>${H?'Hospital name':'Clinic or hospital name'}</span><input type="text" id="cc-name" placeholder="${H?'e.g. City Dental Hospital':'e.g. Smile Dental Clinic'}" required></label>
    <label class="f"><span>Address</span><input type="text" id="cc-address" placeholder="Street, city"></label>
    <label class="f"><span>Phone</span><input type="tel" id="cc-phone"></label>
    ${regFields('cc')}
    ${H?`<div class="f"><span>Departments of your hospital (untick what you do not have)</span><div class="deptpick">${DENTAL_DEPTS.map(d=>`<label class="row small" style="gap:8px;align-items:center"><input type="checkbox" data-cdept="${esc(d)}" checked style="width:20px;height:20px"> ${esc(d)}</label>`).join('')}</div></div>
    <div class="f"><span>Also set up</span><label class="row small" style="gap:8px;align-items:center"><input type="checkbox" id="cc-pharm" checked style="width:20px;height:20px"> Pharmacy (prescriptions go to the pharmacy list)</label><label class="row small" style="gap:8px;align-items:center"><input type="checkbox" id="cc-lab" checked style="width:20px;height:20px"> Laboratory (lab requests and delivery notices)</label></div>`:''}
    <div class="grid2"><label class="f"><span>${H?'Administrator name on records':'Your name on records'}</span><input type="text" id="cc-me" value="${esc(nm)}" required></label>
    <label class="f"><span>Your PMDC registration no.</span><input type="text" id="cc-pmdc" value="${esc(pm)}" placeholder="e.g. 12345-D"></label></div>
    <button class="btn primary" type="submit">${H?'Create hospital':'Create clinic'}</button>
  </form>
  <div class="or" ${LOCAL?'hidden':''}><span>or</span></div>
  <form class="panel" id="joinForm" ${LOCAL?'hidden':''}><h2>Join a clinic</h2>
    <label class="f"><span>Invite code (from your clinic admin)</span><input type="text" id="jc-code" class="codein" autocapitalize="characters" autocomplete="off" required></label>
    <label class="f"><span>Your name on records</span><input type="text" id="jc-me" value="${esc(nm)}" required></label>
    <label class="f"><span>Your PMDC registration no. (dentists)</span><input type="text" id="jc-pmdc" value="${esc(pm)}" placeholder="e.g. 12345-D"></label>
    <button class="btn" type="submit">Join clinic</button>
  </form>
  <div class="row" style="justify-content:center">${memberships.length?'<button class="btn small" data-act="back">← Back to my clinic</button>':''}<button class="btn small" data-act="logout">Log out</button></div></div>`;
}

function aesView(){return listView('aes')}
function listView(sec){
  const AES=sec==='aes';const q=view.q.toLowerCase();
  const pool=db.patients.filter(p=>AES?isAes(p):!isAes(p)).filter(p=>AES||!view.dept||p.dept===view.dept);
  const list=pool.filter(p=>(p.first+' '+p.last+' '+(p.phone||'')+' '+(p.cnic||'')+' '+(p.oldFile||'')).toLowerCase().includes(q))
   .sort((a,b)=>(a.last||'').localeCompare(b.last||''));
  return `
  ${clockMini()}
  <header class="top">
    <div style="min-width:0"><h1>${AES?'Aesthetics':esc(clinic.name)}</h1><div class="sub">${AES?esc(clinic.name)+' · ':''}${pool.length} ${AES?'aesthetic ':''}patient${pool.length===1?'':'s'} · ${esc(me.name)} ${syncBadge()}${clinic.lic&&clinic.lic.state==='trial'?`<span class="pill warn">Trial · ${clinic.lic.daysLeft} day${clinic.lic.daysLeft>1?'s':''} left</span>`:''}</div></div>
    <button class="btn small desk-hide" data-act="settings">${isAdmin()?'Clinic & account':'My account'}</button>
  </header>
  ${homeNav(AES?'aes':'list')}
  ${deviceBanner()}
  ${!AES&&deptList().length?`<div class="deptbox"><button type="button" class="btn small deptbtn" data-act="deptToggle" aria-expanded="${!!view.deptOpen}">Departments${view.dept?': '+esc(view.dept):''} ${view.deptOpen?'▴':'▾'}</button>${view.deptOpen?`<div class="chips deptf"><button type="button" class="chip ${!view.dept?'on':''}" data-deptf="">All departments</button>${deptList().map(n=>`<button type="button" class="chip ${view.dept===n?'on':''}" data-deptf="${esc(n)}">${esc(n)}</button>`).join('')}</div>`:''}</div>`:''}
  <div class="row">
    <input type="search" id="search" placeholder="${AES?'Search aesthetic patients – name, phone, CNIC':'Search name, phone, CNIC or file no.'}" value="${esc(view.q)}" style="flex:1;min-width:0">
    ${isAcct()?'':`<button class="btn" data-act="impOpen" data-sec="${AES?'aes':''}" ${readOnly()?'disabled':''}>+ Old patient</button><button class="btn primary" data-act="newPatient" data-sec="${AES?'aes':''}" ${readOnly()?'disabled':''}>+ New ${AES?'aesthetic ':''}patient</button>`}
  </div>
  ${view.impOpen?importPanel():''}
  <section class="panel">
    ${list.length?`<div class="plist">${list.map(p=>{
      const al=alertsOf(p),ms=mhStatus(p),open=p.plan.filter(i=>i.status!=='completed').length;
      return `<button class="pitem" data-open="${p.id}">
        <span class="avatar" style="--h:${hueOf(p.first+p.last)}">${esc(((p.first||' ')[0]+(p.last||' ')[0]).trim())}</span>
        <span style="flex:1;min-width:0;display:flex;flex-direction:column;gap:3px">
          <span class="nm">${esc(p.last)}, ${esc(p.first)} ${p.example?'<span class="pill warn">Example</span>':''}</span>
          <span class="meta">${p.oldFile?'File '+esc(p.oldFile)+' · ':''}${p.dob?fmtDate(p.dob)+' · '+age(p.dob)+' yrs':'No date of birth'}${p.phone?' · '+esc(p.phone):''}${open?' · '+open+' item'+(open>1?'s':'')+' to do':''}</span>
          <span class="alerts">${p.dept&&!AES?`<span class="pill info">${esc(p.dept)}</span>`:''}${al.length?`<span class="pill alert">⚠ ${al.length} medical alert${al.length>1?'s':''}</span>`:''}<span class="pill ${ms.cls}">${ms.t}</span></span>
        </span>
      </button>`}).join('')}</div>`:(q?`<div class="empty">No patient matches that search.</div>`:`<div class="empty">No patients yet. Tap “New patient” to add the first one.</div><div class="row"><button class="btn small" data-act="example">Add an example patient to try the app</button></div>`)}
  </section>`;
}

function aboutPanel(){
  const libs=[['jsPDF 4.2.1','MIT licence','makes the PDF prints'],['QRCode.js 1.0.0','MIT licence','draws the QR code'],['SheetJS Community Edition 0.20.3','Apache 2.0 licence','reads Excel files for import'],
    ...(LOCAL?[]:[['Supabase JS 2.45.4','MIT licence','connects to the online database']]),['IBM Plex Sans & IBM Plex Mono, Fraunces','SIL Open Font Licence 1.1','fonts (Google Fonts)']];
  return `<section class="panel"><details><summary><h3 style="display:inline">About, copyright &amp; licences</h3></summary>
    <div style="display:flex;flex-direction:column;gap:8px;margin-top:10px" class="small">
      <p style="margin:0"><b>Clinic Patient Records</b> · version ${esc(APP_VERSION)}</p>
      <p style="margin:0">© ${new Date().getFullYear()} Dr Abid Ali, Forensic Odontologist. All rights reserved. The app's design, tooth drawings, charts, texts and program code belong to Dr Abid Ali.</p>
      <p style="margin:0"><b>Licence:</b> each activation key allows one clinic to use the app. The app may not be copied, resold, given to other clinics, changed or published without written permission from Dr Abid Ali.</p>
      <p style="margin:0"><b>Patient records</b> entered in the app belong to the clinic that entered them.</p>
      <p style="margin:0"><b>Open-source parts</b> (their licences allow use in sold software; full notices are in THIRD-PARTY-NOTICES.txt):</p>
      <ul style="margin:0;padding-left:18px">${libs.map(([n,l,w])=>`<li>${n} – ${l} – ${w}</li>`).join('')}</ul>
      <p style="margin:0" class="muted">FDI tooth numbering, BPE codes and dental terms are public clinical standards. All drawings in the app were made for this app.</p>
    </div></details></section>`;
}
function updatePanel(){
  const st=Upd.status;const when=Upd.checkedAt?new Date(Upd.checkedAt).toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'}):'';
  const msg=st==='checking'?'Checking…':st==='available'?`<b>A new version is ready:</b> ${esc((Upd.info&&Upd.info.version)||'')}`:st==='uptodate'?`✓ You have the newest version${when?' (checked '+when+')':''}.`:st==='error'?'Could not check. Make sure you are online and try again.':'Tap “Check for updates” to see if a newer version is available.';
  return `<section class="panel" id="updatePanel">
    <h3>App update</h3>
    <p class="small" style="margin:0">Your version: <b>${esc(APP_VERSION)}</b></p>
    <p class="small ${st==='available'?'':'muted'}" style="margin:0" role="status">${msg}</p>
    ${st==='available'&&Upd.notes()?`<div class="small updnotes" style="margin:0">${Upd.notes()}</div>`:''}
    <div class="row"><button class="btn ${st==='available'?'':'primary'}" data-act="updCheck" ${st==='checking'?'disabled':''}>Check for updates</button>${st==='available'?'<button class="btn primary" data-act="updGo">Update now</button>':''}</div>
    <p class="small muted" style="margin:0">Updating saves your work first and then reloads the app. Your records stay as they are.</p>
  </section>`;
}
function acctPanelsHtml(){
  return `
  <form class="panel" id="meForm">
    <h3>Your account</h3>
    <p class="small muted" style="margin:0">Logged in as ${LOCAL?'username ':''}${esc(user.email)}</p>
    <div class="grid2"><label class="f"><span>Your name on records in this clinic</span><input type="text" id="me-name" value="${esc(me.name)}" required></label>
    <label class="f"><span>PMDC registration no.</span><input type="text" id="me-pmdc" value="${esc(me.pmdc||'')}" placeholder="e.g. 12345-D"></label></div>
    <div class="row"><button class="btn" type="submit">Save my details</button></div>
  </form>
  <form class="panel" id="pwForm">
    <h3>Change password</h3>
    <label class="f"><span>New password (at least 8 characters)</span><input type="password" id="pw-new" autocomplete="new-password" minlength="8" required></label>
    <div class="row"><button class="btn" type="submit">Change password</button></div>
  </form>
  <section class="panel" ${LOCAL?'hidden':''}>
    <h3>Clinics</h3>
    ${memberships.length>1?`<label class="f"><span>Switch clinic</span><select id="switchClinic">${memberships.map(m=>`<option value="${m.clinic_id}" ${m.clinic_id===clinic.id?'selected':''}>${esc(m.clinics.name)}</option>`).join('')}</select></label>`:''}
    <div class="row"><button class="btn small" data-act="onboard">Create or join another clinic</button>
    ${view.confirm==='leave'?`<button class="btn small" data-act="cancelConfirm">Stay</button><button class="btn small danger" data-act="leave">Yes, leave ${esc(clinic.name)}</button>`:`<button class="btn small danger" data-act="askLeave">Leave this clinic</button>`}</div>
  </section>
  `;
}
function myAccountView(){
  return `
  <header class="top desk-hide"><button class="btn small" data-act="back">← Patients</button><span class="hdr-right">${syncBadge()}<button class="btn small" data-act="logout">Log out</button></span></header>
  <h1>My account</h1>
  <p class="small muted" style="margin:-6px 0 12px">App version: <b>${APP_VERSION}</b></p>
  ${msgHtml()}
${updatePanel()}
${soundsPanel()}
  ${isAcct()?attendancePanel():''}
  ${acctPanelsHtml()}
  ${aboutPanel()}`;
}
function settingsView(){
  const admin=isAdmin();const oldLocal=lsGet('clinicRecords.v1');
  if(!admin)return myAccountView();
  return `
  <header class="top desk-hide"><button class="btn small" data-act="back">← Patients</button><span class="hdr-right">${syncBadge()}<button class="btn small" data-act="logout">Log out</button></span></header>
  <h1>Clinic & account</h1>
  <p class="small muted" style="margin:-6px 0 12px">App version: <b>${APP_VERSION}</b></p>
  ${msgHtml()}
${updatePanel()}
${brandingPanel()}
${soundsPanel()}
${deptPanel()}
${bookingSettingsPanel()}
${ownerCodesPanel()}
${activationPanel(admin)}
  <form class="panel" id="clinicForm">
    <h3>Clinic details</h3>
    <label class="f"><span>Clinic name</span><input type="text" id="cl-name" value="${esc(clinic.name)}" ${admin?'':'readonly'} required></label>
    <label class="f"><span>Address</span><input type="text" id="cl-address" value="${esc(clinic.address)}" ${admin?'':'readonly'}></label>
    <label class="f"><span>Phone</span><input type="tel" id="cl-phone" value="${esc(clinic.phone)}" ${admin?'':'readonly'}></label>
    ${regFields('cl',clinic,!admin)}
    <p class="small muted" style="margin:0">Registration numbers are printed on every treatment record, invoice and receipt.</p>
    <label class="f"><span>Appointment reminder message (English or Urdu)</span><textarea id="cl-tpl" rows="4" ${admin?'':'readonly'} placeholder="${esc(DEFAULT_TEMPLATE)}">${esc(clinic.reminder_template||'')}</textarea></label>
    <p class="small muted" style="margin:0">Leave empty to use the standard message. These words are filled in for each patient: {name} {clinic} {date} {time} {phone} {dentist}</p>
    ${admin?'<div class="row"><button class="btn primary" type="submit">Save clinic details</button></div>':'<p class="small muted" style="margin:0">Only a clinic admin can change these.</p>'}
  </form>
  ${LOCAL?addDentistHtml(admin):''}
  ${admin||isAcct()?attendancePanel():''}
  ${LOCAL&&admin?recoveryPanel():''}
  <section class="panel" hidden>
    <h3>Invite dentists, lab and pharmacy</h3>
    ${admin&&!LOCAL?'<p class="small muted" style="margin:0">Invitations are made in Earnings → Staff &amp; salaries → + Add lab / pharmacy login.</p>':admin?`<p class="small muted" style="margin:0">Send this code to a dentist. They create an account, choose “Join a clinic” and enter it.</p>
    <div class="row"><span class="invite" id="invite">${esc(clinic.invite_code)}</span><span class="spacer"></span><button class="btn small" data-act="copyCode">Copy</button>
    ${view.confirm==='newcode'?`<button class="btn small" data-act="cancelConfirm">Keep code</button><button class="btn small danger" data-act="newCode">Make new code</button>`:`<button class="btn small" data-act="askNewCode">New code</button>`}</div>
    ${view.confirm==='newcode'?'<p class="small" style="margin:0">The old code will stop working. People already in the clinic stay.</p>':''}`
    :'<p class="small muted" style="margin:0">Ask your clinic admin for the invite code.</p>'}
  </section>
  <section class="panel">
    <h3>Team · ${team.length}</h3>
    <div class="plist">${team.map(t=>{const self=t.user_id===user.id;return `<div class="member">
      <span class="avatar">${esc((t.name||'?').replace(/^Dr\.?\s*/i,'').slice(0,1))}</span>
      <span style="flex:1;min-width:0"><b>${esc(t.name)}</b>${self?' <span class="muted small">(you)</span>':''}<br><span class="small muted">${t.pmdc?'PMDC '+esc(t.pmdc)+' · ':''}Joined ${fmtDate(String(t.joined_at).slice(0,10))}</span></span>
      <span class="pill ${t.role==='admin'?'info':t.role==='accountant'?'warn':'ok'}">${ROLE_LABEL[t.role]||t.role}</span>
      ${admin&&!self?`<span class="row" style="gap:6px;width:100%;justify-content:flex-end">
        ${LOCAL?(view.confirm==='pw:'+t.user_id?`<form id="resetPwForm" class="row" style="width:100%;gap:6px" data-uid="${t.user_id}"><input type="password" id="rp-pw" placeholder="New password (8+ characters)" minlength="8" autocomplete="new-password" style="flex:1;min-width:0"><button class="btn small primary" type="submit">Save</button><button class="btn small" type="button" data-act="cancelConfirm">Cancel</button></form>`:`<button class="btn small" data-askpw="${t.user_id}">Reset password</button>`):''}
        <select class="rolesel" data-roleuid="${t.user_id}" aria-label="Role of ${esc(t.name)}">${['dentist','accountant','admin'].map(r=>`<option value="${r}" ${t.role===r?'selected':''}>${ROLE_LABEL[r]}</option>`).join('')}</select>
        ${view.confirm==='rm:'+t.user_id?`<input type="password" id="rm-pw" placeholder="Your password" autocomplete="current-password" style="max-width:180px"><button class="btn small" data-act="cancelConfirm">Keep</button><button class="btn small danger" data-rm="${t.user_id}">Yes, remove</button>`:`<button class="btn small danger" data-askrm="${t.user_id}">Remove</button>`}
      </span>`:''}
    </div>`}).join('')}</div>
  </section>
  ${acctPanelsHtml()}
  ${LOCAL?localBackupHtml(admin):''}
  <section class="panel" ${LOCAL?'hidden':''}>
    <h3>Backup</h3>
    <p class="small muted" style="margin:0">Records are stored online and sync automatically. You can also save a copy of all ${db.patients.length} patient records as a file.</p>
    <div class="row"><button class="btn" data-act="exportBackup">Save backup file</button></div>
    ${admin?`<label class="f"><span>Import patients from a backup file</span><input type="file" id="importFile" accept=".json,application/json"></label>`:''}
    ${admin&&oldLocal?`<div class="row"><button class="btn small" data-act="importLocal">Bring in records saved on this device by the earlier app</button></div>`:''}
  </section>
  ${admin?`<section class="panel">
    <h3>Delete clinic</h3>
    <p class="small" style="margin:0">Deletes the clinic with all patients, X-rays, appointments and messages${LOCAL?' (and all logins) from this device':' for every computer in the clinic'}, for good. Save a full backup first if you may need the records later. A new clinic gets a new clinic code, so an old activation key won't work for it.</p>
    ${view.confirm==='wipe'?`<p class="small" style="margin:0">To protect patient records, deleting needs a <b>deletion code</b> from the seller. Send your clinic code <b>${esc(clinic.clinic_code||'')}</b> to ask for one. A code works for about 2 days.</p>
      ${SELLER.whatsapp?`<div class="row"><a class="btn wa" href="https://wa.me/${String(SELLER.whatsapp).replace(/\D/g,'').replace(/^0/,'92')}?text=${encodeURIComponent('Assalam-o-Alaikum, I want to delete my clinic in Clinic Patient Records.\nClinic name: '+clinic.name+'\nClinic code: '+(clinic.clinic_code||''))}" target="_blank" rel="noopener">Request code on WhatsApp</a></div>`:''}
      <label class="f"><span>Deletion code</span><textarea id="wipe-code" rows="3" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="Paste the deletion code (starts with CPR1-)"></textarea></label>
      <div class="row"><button class="btn" data-act="cancelConfirm">Cancel</button><button class="btn danger" data-act="wipe">Delete everything</button></div>`
    :`<div class="row"><button class="btn danger" data-act="askWipe">Delete clinic and all records</button></div>`}
  </section>`:''}
  <section class="panel">
    <h3>Keeping records safe</h3>
    <p class="small" style="margin:0">Patient records are confidential. Use a strong password, log out on shared computers, and remove dentists who leave the clinic.</p>
    <div class="row"><button class="btn danger" data-act="logout">Log out</button></div>
  </section>${aboutPanel()}`;
}

function recoveryView(){
  return `<div class="auth">${brand()}
  <section class="panel"><h2>Save your recovery code</h2>
    <p style="margin:0">If you ever forget the admin password, this code lets you set a new one. Without it, a forgotten admin password cannot be reset.</p>
    <div class="row" style="justify-content:center"><span class="invite" id="rcode">${esc(view.recoveryCode)}</span></div>
    <p class="small muted" style="margin:0">Write it on paper and keep it in the clinic, or take a screenshot and keep it in a private place. It is shown only now. You can make a new one later in Clinic & account.</p>
    <label class="row small" style="gap:10px"><input type="checkbox" id="rc-ok" style="width:22px;height:22px"> I have saved the recovery code</label>
    <button class="btn primary" data-act="rcDone">Continue</button>
  </section></div>`;
}
let showWelcome=false;
const URLQ=new URLSearchParams(location.search);
let facilityPref=['dental_clinic','dental_hospital'].includes(URLQ.get('type'))?URLQ.get('type'):'dental_clinic';
/* Someone already logged in who taps “Dental clinic / Dental hospital” on the welcome page wants to create a NEW one, not re-open the clinic they already have. */
let wantNewFacility=!!(URLQ.get('signup')&&URLQ.get('type')&&!URLQ.get('staff'));
if(URLQ.get('signup'))view.authTab='signup';
function greeting(){const h=new Date().getHours();return h<12?'Good morning':h<17?'Good afternoon':'Good evening'}
function welcomeView(){
  return `<div class="welcome">
    <div class="welcome-card">
      <div class="welcome-mark ${branding.logo?'haslogo':''}">${clinicMark()}</div>
      <p class="welcome-hi">${greeting()}, ${esc(me.name)}</p>
      <h1>Welcome to ${esc(clinic.name)}</h1>
      <p class="muted" style="margin:0">${clockParts().date}</p>
      <button class="btn primary" data-act="enterApp">Open patient records</button>
    </div>
    ${CREDIT}
  </div>`;
}
function deviceBanner(){if(OWNER_TEST)return '';
  const ios=/iPhone|iPad|iPod/.test(navigator.userAgent);
  const standalone=navigator.standalone||(window.matchMedia&&matchMedia('(display-mode: standalone)').matches);
  const last=+lsGet('lastFullBackup')||0,old=!last||Date.now()-last>7*864e5;let h='';
  if(LOCAL&&ios&&!standalone)h+=`<div class="msg warn">Add this app to your Home Screen (Share → Add to Home Screen) and always open it from there. Safari and the Home Screen app keep separate records, and Safari can delete records of a site you don't open for 7 days.</div>`;
  const lic=clinic.lic||{};
  if(lic.state==='expired')h+=`<div class="msg err">Your free trial has ended. You can still view records and save backups, but not add or change anything. <button class="linkbtn" data-act="goActivate">Activate the app</button></div>`;
  else if(lic.state==='trial'&&lic.daysLeft<=5)h+=`<div class="msg warn">Free trial: ${lic.daysLeft} day${lic.daysLeft>1?'s':''} left. <button class="linkbtn" data-act="goActivate">Activate the app</button></div>`;
  if(LOCAL&&isAdmin()&&!clinic.has_recovery)h+=`<div class="msg warn">Set up an admin recovery code, so a forgotten admin password can be reset. <button class="linkbtn" data-act="settings">Set it up</button></div>`;
  if(dailyBlob&&!backedUpToday())h+=`<div class="msg ${old?'warn':'ok'}"><div class="row" style="justify-content:space-between"><span>${old?(last?'No backup file for over a week. ':'No backup file yet. '):''}Today's backup is ready (${dailyBlob.size>=1e6?(dailyBlob.size/1e6).toFixed(1)+' MB':Math.max(1,Math.round(dailyBlob.size/1e3))+' KB'}).</span><button class="btn small primary" data-act="saveDaily">Save to Files</button></div></div>`;
  else if(LOCAL&&old&&db.patients.length)h+=`<div class="msg warn">${last?'Your last full backup was more than a week ago.':'You have no backup yet.'} Records are only on this device. <button class="linkbtn" data-act="settings">Save a backup</button></div>`;
  return h;
}
function activationPanel(admin){
  const lic=clinic.lic||{};
  const status=lic.state==='active'?`<span class="pill ok">Activated</span> <span class="small muted">for ${esc(lic.name||clinic.name)}${lic.date?' on '+fmtDate(lic.date):''}</span>`
    :lic.state==='trial'?`<span class="pill warn">Free trial · ${lic.daysLeft} day${lic.daysLeft>1?'s':''} left</span>`:`<span class="pill alert">Trial ended · read-only</span>`;
  const waNum=SELLER.whatsapp?String(SELLER.whatsapp).replace(/\D/g,'').replace(/^0/,'92'):'';
  const waText=encodeURIComponent('Assalam-o-Alaikum, I want to activate Clinic Patient Records.\nClinic name: '+clinic.name+'\nClinic code: '+(clinic.clinic_code||''));
  const seller=[SELLER.price&&('Price: <b>'+esc(SELLER.price)+'</b>, one-time payment, no monthly fees'),SELLER.whatsapp&&('WhatsApp'+(SELLER.name?' '+esc(SELLER.name):'')+': <b>'+esc(SELLER.whatsapp)+'</b>')].filter(Boolean).join('<br>');
  return `<section class="panel" id="activation">
    <h3>Activation</h3>
    <div class="row">${status}</div>
    ${lic.state==='active'?'':`
    <p class="small" style="margin:0">To keep using the app after the trial, buy a one-time licence. Send your <b>clinic code</b> and clinic name to the seller; you receive an activation key for this clinic.</p>
    ${seller?`<p class="small" style="margin:0">${seller}</p>`:''}
    ${waNum?`<div class="row"><a class="btn wa" href="https://wa.me/${waNum}?text=${waText}" target="_blank" rel="noopener">Send code on WhatsApp</a></div>`:''}`}
    <div class="row"><span class="small muted">Clinic code</span><span class="invite" id="ccode" style="font-size:1.1rem">${esc(clinic.clinic_code||'')}</span><button class="btn small" data-act="copyClinicCode">Copy</button></div>
    ${lic.state==='active'?'':admin?`<form id="activateForm" style="display:flex;flex-direction:column;gap:8px">
      <label class="f"><span>Activation key</span><textarea id="act-key" rows="3" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="Paste the key you received (starts with CPR1-)"></textarea></label>
      <div class="row"><button class="btn primary" type="submit">Activate</button></div></form>`:'<p class="small muted" style="margin:0">Ask your clinic admin to enter the activation key.</p>'}
  </section>`;
}
function recoveryPanel(){
  return `<section class="panel"><h3>Admin recovery code</h3>
    <p class="small muted" style="margin:0">Resets a forgotten admin password from the login screen. ${clinic.has_recovery?'A code is set. Making a new one stops the old one.':'<b style="color:var(--warn)">No code yet.</b>'}</p>
    ${view.newRecovery?`<div class="row" style="justify-content:center"><span class="invite">${esc(view.newRecovery)}</span></div><p class="small" style="margin:0">Write this down or take a screenshot now. It won't be shown again.</p>`:
    view.confirm==='newrc'?`<div class="row"><button class="btn small" data-act="cancelConfirm">Cancel</button><button class="btn small primary" data-act="makeRecovery">Yes, make a new code</button></div>`:
    `<div class="row"><button class="btn ${clinic.has_recovery?'':'primary'}" data-act="${clinic.has_recovery?'askRecovery':'makeRecovery'}">${clinic.has_recovery?'Make a new recovery code':'Create recovery code'}</button></div>`}
  </section>`;
}
function addDentistHtml(admin){
  if(!admin)return `<section class="panel"><h3>Dentists</h3><p class="small muted" style="margin:0">Your clinic admin adds dentists and resets passwords.</p></section>`;
  return `<form class="panel" id="addDentistForm">
    <h3>Add a team member</h3>
    <p class="small muted" style="margin:0">Each person logs in on this device with their own username and password. A dentist's name appears on the notes they write.</p>
    <div class="grid2">
      <label class="f"><span>Name on records</span><input type="text" id="ad-name" placeholder="e.g. Dr Bilal Ahmed or Imran (accounts)" required></label>
      <label class="f"><span>Username</span><input type="text" id="ad-user" autocapitalize="off" autocorrect="off" autocomplete="off" placeholder="e.g. bilal" required></label>
    </div>
    <div class="grid2">
      <label class="f"><span>Password (at least 8 characters)</span><input type="password" id="ad-pw" autocomplete="new-password" minlength="8" required></label>
      <label class="f"><span>PMDC registration no. (dentists)</span><input type="text" id="ad-pmdc" placeholder="e.g. 12345-D"></label>
      <label class="f"><span>Role</span><select id="ad-role"><option value="dentist">Dentist</option><option value="accountant">Accountant (view, print, appointments)</option><option value="admin">Admin (can add people)</option></select></label>
    </div>
    <div class="row"><button class="btn primary" type="submit">Add person</button></div>
  </form>`;
}
function localBackupHtml(admin){
  const last=+lsGet('lastFullBackup')||0;const days=last?Math.floor((Date.now()-last)/864e5):0;
  return `<section class="panel">
    <h3>Backup</h3>
    <p class="small" style="margin:0">All records and X-rays are stored only on this device. If the phone is lost, broken or reset, they are gone. Save a full backup every week and keep it in iCloud Drive or Google Drive. The same file moves everything to a new phone.</p>
    <p class="small muted" style="margin:0">Last full backup: ${last?fmtDate(dayOf(last))+(days?' ('+days+' day'+(days>1?'s':'')+' ago)':' (today)'):'never'}</p>
    <div class="row">${view.backupBlob?`<button class="btn primary" data-act="shareBackup">Save backup file now</button><span class="small muted">${(view.backupBlob.size/1e6).toFixed(1)} MB ready</span>`:`<button class="btn primary" data-act="fullBackup" ${view.backupBusy?'disabled':''}>${view.backupBusy?'Preparing backup…':'Save full backup (with X-rays)'}</button>`}</div>
    <h3 style="margin-top:6px">Automatic daily copies on this device</h3>
    <p class="small muted" style="margin:0">The app keeps a copy of all records from each of the last 7 days, by itself. Use it to undo a mistake. These copies are lost with the phone, so still save the backup file each day.</p>
    ${snapList===null?'<p class="small muted" style="margin:0">Loading…</p>':snapList.length?`<div class="plist">${snapList.map(sn=>`<div class="member"><span style="flex:1;min-width:0"><b>${fmtDate(sn.date)}</b><br><span class="small muted">${sn.patients} patient${sn.patients===1?'':'s'} · saved ${fmtTime(sn.at)}</span></span>
      ${admin?(view.confirm==='snap:'+sn.date?`<button class="btn small" data-act="cancelConfirm">Cancel</button><button class="btn small danger" data-snaprestore="${sn.date}">Yes, go back</button>`:`<button class="btn small" data-asksnap="${sn.date}">Restore</button>`):''}</div>`).join('')}</div>`:'<p class="small muted" style="margin:0">The first copy is made tomorrow.</p>'}
    ${admin&&String(view.confirm||'').startsWith('snap:')?'<p class="small" style="margin:0;color:var(--alert)">Going back replaces all current records with that day\'s copy. Anything added since is lost. Everyone is logged out.</p>':''}
    ${admin?`<label class="f"><span>Restore a full backup (replaces everything on this device)</span><input type="file" id="restoreFile" accept=".json,application/json"></label>`:''}
    ${view.confirm==='restore'?`<div class="confirm">Replace ALL records on this device with the backup of ${esc(view.restoreInfo||'')}? Everyone is logged out afterwards.<span class="spacer"></span><button class="btn small" data-act="cancelConfirm">Cancel</button><button class="btn small danger" data-act="doRestore">Replace</button></div>`:''}
  </section>`;
}

/* ---- Orthodontic department: assessment, records checklist, cephalometrics, plan, digital devices, visits ---- */
const isOrtho=p=>!!p&&!isAes(p)&&(!!p.orthoOn||!!p.ortho&&Object.keys(p.ortho).length>0||/orthodon/i.test(p.dept||''));
const OR_RECORDS=[['rec_consent','Consent signed'],['rec_mh','Medical history reviewed'],['rec_pho_e','Extraoral photos (frontal, profile, smile)'],['rec_pho_i','Intraoral photos (5 views)'],['rec_opg','OPG (panoramic X-ray)'],['rec_ceph','Lateral cephalogram'],['rec_cbct','CBCT (only when needed)'],['rec_models','Study models or intraoral scan'],['rec_bite','Bite registration'],['rec_perio','Gums and decay treated first'],['rec_fee','Plan, fee and duration explained']];
const OR_HABITS=[['h_thumb','Thumb / finger sucking'],['h_mouth','Mouth breathing'],['h_tongue','Tongue thrust'],['h_nail','Nail / lip biting'],['h_brux','Grinding (bruxism)'],['h_bottle','Prolonged bottle / dummy']];
const OR_CEPH=[['sna','SNA','°',82,2],['snb','SNB','°',80,2],['anb','ANB','°',2,2],['wits','Wits','mm',0,2],['fma','FMA','°',25,3],['sngogn','SN–GoGn','°',32,4],['u1sn','U1–SN','°',103,5],['impa','IMPA','°',90,5],['interinc','Interincisal angle','°',131,6],['ulE','Upper lip to E-plane','mm',-4,2],['llE','Lower lip to E-plane','mm',-2,2]];
const OR_APPL=['Fixed metal brackets','Fixed ceramic (aesthetic) brackets','Self-ligating brackets','Lingual braces','Clear aligners','Functional appliance','Expansion appliance','Headgear / face mask','Mini-implants (TADs)','Retainer only'];
const OR_DEVICES=[['d_scan','Intraoral scanner (digital impression)'],['d_print','Desktop 3D printer (models, aligner moulds, bonding trays)'],['d_thermo','Thermoforming (vacuum) machine'],['d_cbct','CBCT scan'],['d_ceph','Digital cephalometric analysis software'],['d_plan','Aligner / virtual set-up planning software'],['d_stl','Digital study models (STL files)'],['d_face','Facial / 3D photo scanner'],['d_idb','Indirect bonding trays'],['d_tad','Mini-implant (TAD) driver kit'],['d_pbm','Low-level laser (photobiomodulation)'],['d_vib','Vibration device (faster tooth movement)'],['d_piezo','Piezo-surgery (piezocision / micro-osteoperforation)'],['d_cam','Intraoral camera'],['d_tele','Remote monitoring app for aligner patients']];
const OR_STAGES=['Records','Bonding','Wire change','Elastics','Activation / adjustment','IPR','Aligner delivery','Refinement scan','Debond','Retainer delivery','Review'];
const OR_PHASES=[['ph_align','Alignment'],['ph_level','Levelling'],['ph_space','Space closure'],['ph_finish','Finishing and detailing'],['ph_ret','Retention']];
const orv=(p,k)=>((p.ortho||{})[k]);
const orn=(p,k)=>{const v=parseFloat(orv(p,k));return isNaN(v)?null:v};
function orIn(p,k,label,opt={}){const v=orv(p,k);const t=opt.type||'text';
  return `<label class="f"><span>${label}${opt.unit?' ('+opt.unit+')':''}</span><input type="${t}" ${t==='number'?'step="0.5" inputmode="decimal"':''} data-or="${k}" value="${esc(v==null?'':v)}" ${opt.ph?`placeholder="${esc(opt.ph)}"`:''}></label>`}
function orSel(p,k,label,opts){const v=orv(p,k)||'';return `<label class="f"><span>${label}</span><select data-or="${k}"><option value="">—</option>${opts.map(o=>`<option ${v===o?'selected':''}>${esc(o)}</option>`).join('')}</select></label>`}
function orCk(p,k,label){return `<label class="row small orck"><input type="checkbox" data-or="${k}" ${orv(p,k)?'checked':''} style="width:20px;height:20px"> ${label}</label>`}
function orTa(p,k,label,rows){return `<label class="f"><span>${label}</span><textarea data-or="${k}" rows="${rows||3}">${esc(orv(p,k)||'')}</textarea></label>`}
function orCephRow(p,[k,l,u,norm,sd]){const v=orn(p,k==='anb'&&orn(p,'anb')==null&&orn(p,'sna')!=null&&orn(p,'snb')!=null?'__':k);
  let val=orn(p,k);let auto=false;if(k==='anb'&&val==null&&orn(p,'sna')!=null&&orn(p,'snb')!=null){val=Math.round((orn(p,'sna')-orn(p,'snb'))*10)/10;auto=true}
  const flag=val==null?'':val>norm+sd?'High':val<norm-sd?'Low':'Normal';
  return `<div class="cephrow"><span class="cn">${l}</span><input type="number" step="0.1" inputmode="decimal" data-or="${k}" value="${esc(orv(p,k)==null?'':orv(p,k))}" ${auto?`placeholder="${val} (calculated)"`:''} aria-label="${l}"><span class="small muted">${u} · normal ${norm}±${sd}</span>${flag?`<span class="pill ${flag==='Normal'?'ok':'warn'}">${auto?'= ':''}${val}${u==='°'?'°':''} ${flag}</span>`:'<span></span>'}</div>`}
function orInterpret(p){
  const out=[];const anb=orn(p,'anb')!=null?orn(p,'anb'):(orn(p,'sna')!=null&&orn(p,'snb')!=null?orn(p,'sna')-orn(p,'snb'):null);
  if(anb!=null)out.push('Skeletal Class '+(anb>4?'II':anb<0?'III':'I')+' (ANB '+(Math.round(anb*10)/10)+'°)');
  const fma=orn(p,'fma'),sg=orn(p,'sngogn');const vv=fma!=null?fma:null;
  if(vv!=null)out.push(vv>28?'high-angle (hyperdivergent) pattern':vv<22?'low-angle (hypodivergent) pattern':'normal vertical pattern');else if(sg!=null)out.push(sg>36?'high-angle pattern':sg<28?'low-angle pattern':'normal vertical pattern');
  const oj=orn(p,'overjet'),ob=orn(p,'overbite');
  if(oj!=null)out.push(oj>4?'increased overjet ('+oj+' mm)':oj<0?'reverse overjet / anterior crossbite ('+oj+' mm)':'overjet '+oj+' mm');
  if(ob!=null)out.push(ob>4?'deep bite ('+ob+' mm)':ob<0?'anterior open bite ('+ob+' mm)':'overbite '+ob+' mm');
  const m=[orv(p,'molarR'),orv(p,'molarL')].filter(Boolean);if(m.length)out.push('molars R/L: '+(orv(p,'molarR')||'–')+' / '+(orv(p,'molarL')||'–'));
  const cu=orn(p,'crowdU'),cl=orn(p,'crowdL');if(cu!=null||cl!=null)out.push('crowding: upper '+(cu==null?'–':cu)+' mm, lower '+(cl==null?'–':cl)+' mm');
  const x=orv(p,'crossbite');if(x&&x!=='None')out.push(x.toLowerCase()+' crossbite');
  const u1=orn(p,'u1sn');if(u1!=null)out.push(u1>108?'proclined upper incisors':u1<98?'retroclined upper incisors':'upper incisors normal');
  const im=orn(p,'impa');if(im!=null)out.push(im>95?'proclined lower incisors':im<85?'retroclined lower incisors':'lower incisors normal');
  return out;
}
function orRecProgress(p){const n=OR_RECORDS.filter(([k])=>orv(p,k)).length;return [n,OR_RECORDS.length]}
function orSummaryText(p){
  const L=[];const g=(k)=>orv(p,k);
  L.push('ORTHODONTIC ASSESSMENT – '+(p.first||'')+' '+(p.last||'')+(p.dob?', '+age(p.dob)+' yrs':''));
  if(g('complaint'))L.push('Chief complaint: '+g('complaint'));
  const habits=OR_HABITS.filter(([k])=>g(k)).map(x=>x[1]);if(habits.length)L.push('Habits: '+habits.join(', '));
  if(g('growth'))L.push('Growth: '+g('growth')+(g('cvm')?' (CVM '+g('cvm')+')':''));
  const ex=[g('profile')&&'profile '+g('profile').toLowerCase(),g('diverg')&&g('diverg').toLowerCase(),g('lips')&&'lips '+g('lips').toLowerCase()].filter(Boolean);if(ex.length)L.push('Extraoral: '+ex.join(', '));
  if(g('tmj'))L.push('TMJ: '+g('tmj'));
  const io=orInterpret(p);if(io.length)L.push('Findings: '+io.join('; '));
  if(g('diagnosis'))L.push('Diagnosis: '+g('diagnosis'));
  if(g('problems'))L.push('Problem list: '+g('problems'));
  if(g('objectives'))L.push('Objectives: '+g('objectives'));
  const pl=[g('approach'),g('appliance'),g('extract')&&'extractions: '+g('extract'),g('anchor')&&'anchorage: '+g('anchor'),g('ipr')&&'IPR '+g('ipr')+' mm',g('months')&&'about '+g('months')+' months'].filter(Boolean);if(pl.length)L.push('Plan: '+pl.join(' · '));
  const dev=OR_DEVICES.filter(([k])=>g(k)).map(x=>x[1].replace(/ \(.*\)/,''));if(dev.length)L.push('Digital workflow: '+dev.join(', '));
  if(g('ret'))L.push('Retention: '+g('ret'));
  return L.join('\n');
}
document.addEventListener('toggle',e=>{const d=e.target;if(d&&d.dataset&&d.dataset.orsec){view.orOpen=view.orOpen||{};view.orOpen[d.dataset.orsec]=d.open}},true);
function orthoTab(p){
  p.ortho=p.ortho||{};const ro=isAcct()||readOnly();const [rn,rt]=orRecProgress(p);const io=orInterpret(p);
  const vis=(p.ortho.visits||[]).slice().sort((a,b)=>String(b.date).localeCompare(String(a.date))||(b.at||0)-(a.at||0));
  const f=view.orVisit||{};
  let secN=0;const oo=view.orOpen||{};const sec=(t,body,open,badge)=>{const id=++secN;return `<details class="orsec panel" data-orsec="${id}" ${(oo[id]!==undefined?oo[id]:open)?'open':''}><summary><h3 style="display:inline">${t}</h3>${badge?` <span class="pill ${badge[1]||'info'}">${badge[0]}</span>`:''}</summary><div class="orbody">${body}</div></details>`};
  const html=`<fieldset ${ro?'disabled':''} style="border:0;padding:0;margin:0;min-width:0;display:flex;flex-direction:column;gap:12px">
  <div class="msg ok" style="margin:0"><b>Orthodontic department.</b> Work down the sections: first collect the records, then examine, measure, diagnose and plan. Everything is saved with the patient.</div>
  ${sec('1 · Records needed before planning',`<div class="orgrid">${OR_RECORDS.map(([k,l])=>orCk(p,k,l)).join('')}</div><div class="small muted">Photos and X-rays are saved in the <b>X-rays</b> tab (choose the type).</div>`,true,[rn+' / '+rt,rn===rt?'ok':'warn'])}
  ${sec('2 · Complaint, growth and habits',`${orTa(p,'complaint','Chief complaint and what the patient expects',2)}
    <div class="grid2">${orSel(p,'motiv','Motivation / cooperation',['Good','Average','Poor'])}${orSel(p,'growth','Growth status',['Pre-pubertal (growing)','Pubertal peak','Post-pubertal','Adult (growth finished)'])}
    ${orIn(p,'cvm','Cervical vertebral maturation stage (CS 1–6)')}${orIn(p,'prevtx','Previous orthodontic treatment')}</div>
    <div class="orgrid">${OR_HABITS.map(([k,l])=>orCk(p,k,l)).join('')}${orCk(p,'famhx','Family history of similar malocclusion')}</div>`,false)}
  ${sec('3 · Face and jaw joint',`<div class="grid2">${orSel(p,'profile','Facial profile',['Straight','Convex','Concave'])}${orSel(p,'diverg','Face type',['Mesofacial (average)','Dolichofacial (long)','Brachyfacial (short)'])}
    ${orSel(p,'lips','Lips at rest',['Competent','Incompetent','Strained closure','Everted lower lip'])}${orIn(p,'nla','Nasolabial angle',{type:'number',unit:'°'})}
    ${orSel(p,'smile','Smile arc',['Consonant','Flat','Reverse'])}${orIn(p,'gingival','Gum shown when smiling',{type:'number',unit:'mm'})}
    ${orIn(p,'asym','Facial asymmetry (side / amount)')}${orIn(p,'midfacial','Dental midline to face midline',{ph:'e.g. upper 2 mm to right'})}
    ${orIn(p,'opening','Maximum mouth opening',{type:'number',unit:'mm'})}${orIn(p,'tmj','TMJ: clicking, pain, deviation')}</div>`,false)}
  ${sec('4 · Teeth and bite',`<div class="grid2">${orSel(p,'dentition','Dentition',['Primary','Early mixed','Late mixed','Permanent'])}${orSel(p,'hyg','Oral hygiene',['Good','Fair','Poor'])}
    ${orSel(p,'molarR','Molar relation – right',['Class I','Class II','Class III','End-on'])}${orSel(p,'molarL','Molar relation – left',['Class I','Class II','Class III','End-on'])}
    ${orSel(p,'canR','Canine relation – right',['Class I','Class II','Class III'])}${orSel(p,'canL','Canine relation – left',['Class I','Class II','Class III'])}
    ${orIn(p,'overjet','Overjet',{type:'number',unit:'mm'})}${orIn(p,'overbite','Overbite',{type:'number',unit:'mm'})}
    ${orSel(p,'crossbite','Crossbite',['None','Anterior','Posterior – one side','Posterior – both sides','Scissor bite'])}${orSel(p,'openbite','Open bite',['None','Anterior','Lateral'])}
    ${orIn(p,'crowdU','Crowding – upper',{type:'number',unit:'mm'})}${orIn(p,'crowdL','Crowding – lower',{type:'number',unit:'mm'})}
    ${orIn(p,'spacing','Spacing',{type:'number',unit:'mm'})}${orIn(p,'spee','Curve of Spee depth',{type:'number',unit:'mm'})}
    ${orIn(p,'midU','Upper midline shift',{ph:'e.g. 2 mm right'})}${orIn(p,'midL','Lower midline shift',{ph:'e.g. 1 mm left'})}</div>
    ${orIn(p,'missing','Missing, impacted, ectopic or extra teeth',{ph:'e.g. 13 impacted, 35 congenitally missing'})}
    ${io.length?`<div class="note-ex" style="display:block;white-space:normal"><b>Summary of findings:</b> ${esc(io.join('; '))}</div>`:''}`,false)}
  ${sec('5 · Cephalometric values',`<p class="small muted" style="margin:0">Type the values from your cephalometric tracing or software. Normal values are for adults; for children allow for growth.</p><div class="cephgrid">${OR_CEPH.map(r=>orCephRow(p,r)).join('')}</div>
    ${io.length?`<div class="note-ex" style="display:block;white-space:normal">${esc(io.join('; '))}</div>`:''}`,false)}
  ${sec('6 · Diagnosis and problem list',`${orTa(p,'diagnosis','Diagnosis (skeletal, dental, soft tissue)',2)}
    <div class="row"><button class="btn small" data-act="orthoSuggest">Suggest problem list from findings</button><span class="small muted">A starting point only – edit it.</span></div>
    ${orTa(p,'problems','Problem list',3)}${orTa(p,'objectives','Treatment objectives',2)}`,false)}
  ${sec('7 · Treatment plan',`<div class="grid2">${orSel(p,'approach','Approach',['Observation','Interceptive','Growth modification','Camouflage','Comprehensive','Surgical–orthodontic'])}${orSel(p,'appliance','Main appliance',OR_APPL)}
    ${orSel(p,'extract','Extractions',['None','4 first premolars','2 upper first premolars','Lower incisor','Second molars','Other'])}${orSel(p,'anchor','Anchorage',['Minimum','Moderate','Maximum','Maximum with mini-implants'])}
    ${orIn(p,'ipr','Total IPR (interproximal reduction)',{type:'number',unit:'mm'})}${orIn(p,'months','Estimated duration',{type:'number',unit:'months'})}
    ${orSel(p,'ret','Retention',['Fixed bonded + clear retainer','Clear (vacuum-formed) retainers','Hawley retainers','Fixed bonded only'])}</div>
    <div class="orgrid">${OR_PHASES.map(([k,l])=>orCk(p,k,'Phase done: '+l)).join('')}</div>
    ${orTa(p,'plannotes','Other plan notes (elastics, surgery, referral…)',2)}`,false)}
  ${sec('8 · Digital workflow, scanner and devices',`<p class="small muted" style="margin:0">Tick what is used for this case.</p><div class="orgrid">${OR_DEVICES.map(([k,l])=>orCk(p,k,l)).join('')}</div>
    <div class="grid2">${orIn(p,'scanDate','Scan date',{type:'date'})}${orIn(p,'scanDev','Scanner / device used',{ph:'model name'})}
    ${orIn(p,'scanRef','Scan file or case ID',{ph:'e.g. STL folder, case no.'})}${orSel(p,'scanQ','Scan quality',['Good','Repeat needed'])}</div>`,false)}
  ${sec('9 · Clear aligners',`<div class="grid2">${orIn(p,'alSys','Aligner system or lab')}${orSel(p,'alAtt','Attachments',['Yes','No'])}
    ${orIn(p,'alUp','Number of aligners – upper',{type:'number'})}${orIn(p,'alLo','Number of aligners – lower',{type:'number'})}
    ${orIn(p,'alWear','Wear',{type:'number',unit:'hours / day'})}${orIn(p,'alChange','Change every',{type:'number',unit:'days'})}
    ${orIn(p,'alCur','Current aligner number',{type:'number'})}${orIn(p,'alRef','Refinements so far',{type:'number'})}</div>
    ${orIn(p,'alIpr','IPR stages / notes')}${orTa(p,'alNotes','Tracking and refinement notes',2)}`,false)}
  ${sec('10 · Visits',`${ro?'':`<div class="grid2"><label class="f"><span>Date</span><input type="date" id="orv-date" value="${esc(f.date||today())}"></label>${'' }<label class="f"><span>What was done</span><select id="orv-stage">${OR_STAGES.map(o=>`<option>${o}</option>`).join('')}</select></label></div>
    <label class="f"><span>Details (wire, elastics, aligner no., findings)</span><input type="text" id="orv-detail" placeholder="e.g. 0.016 NiTi upper, class II elastics"></label>
    <label class="f"><span>Next visit (date or weeks)</span><input type="text" id="orv-next" placeholder="e.g. 6 weeks"></label>
    <div class="row"><button class="btn primary" data-act="orthoVisitAdd" type="button">Save visit</button></div>`}
    ${vis.length?`<div class="plist">${vis.map(v=>`<div class="member"><span style="flex:1;min-width:0"><b>${esc(v.stage)}</b> · ${fmtDate(v.date)}<br><span class="small">${esc(v.detail||'')}</span>${v.next?`<br><span class="small muted">Next: ${esc(v.next)}</span>`:''}<br><span class="small muted">${esc(v.by||'')}</span></span>${ro?'':`<button class="btn small" data-orvdel="${v.id}" type="button">Delete</button>`}</div>`).join('')}</div>`:'<div class="empty">No visits recorded yet.</div>'}`,false)}
  ${ro?'':`<section class="panel"><div class="row"><button class="btn primary" data-act="orthoNote" type="button">Add this assessment to Clinical notes</button><span class="small muted">Makes one dated note from everything above.</span></div></section>`}
  </fieldset>`;
  return html;
}
function paperGuide(p){
  const done=p.plan.filter(i=>i.status==='completed').length;
  const steps=[['details','1','Details','Name, mobile, old file no. and first visit date',!!(p.first||'').trim()],
    ['mh','2','Medical history','As written in the file',!!(p.mh&&p.mh.date)],
    ...(isAes(p)?[]:[['chart','3','Chart','Teeth as found at the last visit',Object.keys(p.chart||{}).length+Object.keys(p.surf||{}).length>0]]),
    ['plan','4','Past treatments',isAes(p)?'Add each one (laser, anti-wrinkle injections, PRP…) with its date in "Done on"':'Add each one (RCT, scaling…) with its date in "Done on"',done>0],
    ['pay','5','Past payments','With the date they were paid',false],
    ['xrays','6',isAes(p)?'Photos':'Photo of the file',isAes(p)?'Before/after photos and the paper file':'Optional – save the paper as "Old record (scan)"',false]];
  return `<section class="paperguide" aria-label="Old patient guide">
    <div class="row"><b>Writing in an old patient from paper</b><span class="spacer"></span><button class="btn small primary" data-act="paperDone">✓ Finished – make normal patient</button></div>
    <div class="pgsteps">${steps.map(([t,n,l,h,ok])=>`<button class="pgstep ${view.tab===t?'on':''} ${ok?'ok':''}" data-tab="${t}"><em>${ok?'✓':n}</em><span><b>${l}</b><small>${h}</small></span></button>`).join('')}</div>
  </section>`;
}
function patientView(){
  const p=P();if(!p){view.screen='list';return listView();}
  migrate(p);
  const al=alertsOf(p),ms=mhStatus(p);
  const tabs=isAes(p)?[['details','Details'],['mh','Medical history'],['plan','Treatments'],['pay','Payments'],['visits','Visits'],['notes','Clinical notes'],['xrays','Photos'],['rx','Prescription']]:[['details','Details'],['mh','Medical history'],['chart','Chart'],['plan','Treatment plan'],['pay','Payments'],['visits','Visits'],['notes','Clinical notes'],['xrays','X-rays'],['rx','Prescription']].concat(isOrtho(p)?[['ortho','Ortho']]:[]).concat(labOn()?[['lab','Lab']]:[]);
  if(isAes(p)&&view.tab==='chart')view.tab='details';
  let body={details:detailsTab,mh:mhTab,chart:chartTab,plan:planTab,pay:payTab,notes:notesTab,visits:visitsTab,xrays:xrayTab,appts:apptTab,rx:rxTab,lab:labTab,ortho:orthoTab}[view.tab](p);
  if(isAcct()&&['details','mh','chart','plan'].includes(view.tab))body=`<fieldset class="ro" disabled>${body}</fieldset>`;
  return `
  <header class="top"><button class="btn small" data-act="back">← Patients</button>${syncBadge()}</header>
  ${p.example?'<span class="note-ex">Example record – delete it once you add real patients</span>':''}
  ${isAcct()?'<span class="note-ex" style="color:var(--accent);background:var(--accent-soft)">Accountant view: you can see, print and save records and book appointments. Clinical changes are made by dentists.</span>':''}
  ${p.paperEntry?paperGuide(p):''}
  <div class="banner">
    <div class="row"><span class="nm">${esc(p.first)} ${esc(p.last)}</span><span class="spacer"></span><span class="small muted">${p.dob?fmtDate(p.dob)+' · '+age(p.dob)+' yrs':''}</span></div>
    <div class="alerts"><span class="pill ${ms.cls}">${ms.t}</span></div>
    ${alertBox(p)}
    ${p._upd?`<div class="small muted">Last saved ${fmtTime(p._upd)} by ${esc(p._by===user.id?'you':nameOf(p._by))}</div>`:''}
    <button class="apptbar" data-tab="appts" aria-pressed="${view.tab==='appts'}">${icon('calendar')}<span><b>Appointments</b><small>${view.tab==='appts'?"This patient's appointments – book a new one below":'Book or see appointments for this patient'}</small></span>${view.tab==='appts'?'':'<em>Open →</em>'}</button>
    <div class="tabs" role="tablist">${tabs.map(([k,l])=>`<button class="tab" role="tab" aria-selected="${view.tab===k}" data-tab="${k}">${l}</button>`).join('')}</div>
  </div>
  ${body}
  ${xrView?xrViewer():''}`;
}

function fld(id,label,val,type='text',extra=''){return `<label class="f"><span>${label}</span><input type="${type}" data-f="${id}" id="f-${id}" value="${esc(val)}" ${extra}></label>`}
const portalLink=()=>booking.code?location.origin+location.pathname.replace(/[^/]*$/,'')+'portal.html?c='+encodeURIComponent(booking.code):'';
function portalPanel(p){
  if(LOCAL)return '';
  const pin=view.portalPin&&view.portalPin.id===p.id?view.portalPin.pin:'';
  const ro=isAcct()||readOnly();
  const msgTxt=pin?'Hello '+(p.first||'')+', you can see your appointments and prescriptions here: '+portalLink()+' – log in with your mobile number and this PIN: '+pin+'. Please keep the PIN private.':'';
  const wa=pin&&p.phone?waLink(p,msgTxt):'';
  return `<section class="panel"><h3>Patient portal</h3>
    <p class="small muted" style="margin:0">The patient logs in with their mobile number and a 6-digit PIN and sees only their own appointments, prescriptions and lab work that is ready.</p>
    ${pin?`<div class="msg ok" style="margin:0">PIN for ${esc(p.first||'')}: <b style="font-size:1.4rem;letter-spacing:.15em">${pin}</b><br><span class="small">Shown only now. A new PIN replaces the old one.</span></div>
    <div class="row">${wa?`<a class="btn small primary" target="_blank" rel="noopener" href="${wa}">Send on WhatsApp</a>`:'<span class="small muted">Add the mobile number above to send it on WhatsApp.</span>'}</div>`:''}
    ${ro?'':`<div class="row"><button class="btn small" type="button" data-act="portalPin">${pin?'Make another PIN':'Create portal PIN'}</button></div>`}
  </section>`;
}
function detailsTab(p){
  const isNew=!p.oldFile&&!p.since&&p.notes.length===0&&p.plan.length===0;
  const lv=lastVisit(p);const lvBox=lv?`<section class="panel lastvisit"><div class="row" style="align-items:center"><b>Last visit · ${fmtDate(lv.date)}</b><span class="spacer"></span><button class="btn small" data-tab="visits">Open ›</button></div>${lv.v.done.slice(0,3).map(i=>`<div class="small">🦷 ${i.tooth?esc(i.tooth)+' – ':''}${esc(i.proc)}</div>`).join('')}${lv.v.notes[0]?`<div class="small muted" style="white-space:pre-wrap">${esc(lv.v.notes[0].text.length>220?lv.v.notes[0].text.slice(0,220)+'…':lv.v.notes[0].text)}</div>`:''}${isAcct()?'':`<div class="row"><button class="btn primary small" data-act="visitNew" data-date="${today()}" data-go="1">+ Note for today</button></div>`}</section>`:'';
  return `${lvBox}${isNew&&!p.paperEntry?`<div class="msg ok">Adding a patient from your old records? Fill in <b>Old records</b> below, then add past treatment in the <b>Treatment plan</b> with "Already done on", and photograph the old file in <b>X-rays</b> as "Old record (scan)".</div>`:''}
  <section class="panel">
    <h3>Personal details</h3>
    ${deptList().length?`<label class="f"><span>Department</span><select data-f="dept" id="f-dept"><option value="">—</option>${deptList().concat(p.dept&&!deptList().includes(p.dept)?[p.dept]:[]).map(o=>`<option ${p.dept===o?'selected':''}>${esc(o)}</option>`).join('')}</select></label>`:''}
    <label class="row small" style="gap:8px"><input type="checkbox" data-act="orthoToggle" id="ortho-on" ${isOrtho(p)?'checked':''} ${/orthodon/i.test(p.dept||'')?'disabled':''} style="width:20px;height:20px"> Orthodontic case (adds an <b>Ortho</b> tab with the full assessment)</label>
    <div class="grid2">${fld('first','First name',p.first)}${fld('last','Surname / family name',p.last)}${fld('dob','Date of birth',p.dob,'date')}
    <label class="f"><span>Sex</span><select data-f="sex" id="f-sex">${['','F','M','O'].map(o=>`<option ${p.sex===o?'selected':''} value="${o}">${{'':'—',F:'Female',M:'Male',O:'Other'}[o]}</option>`).join('')}</select></label>
    ${fld('phone','Mobile',p.phone,'tel')}${fld('cnic','CNIC',p.cnic,'text','inputmode="numeric" placeholder="00000-0000000-0"')}</div>
    ${fld('email','Email',p.email,'email')}${fld('address','Address',p.address)}
  </section>
  <section class="panel">
    <h3>Old records</h3>
    <div class="grid2">${fld('oldFile','Old file / card number',p.oldFile||'','text','placeholder="e.g. 1452"')}${fld('since','Patient since (first visit)',p.since||'','date')}</div>
  </section>
  <section class="panel">
    <h3>Payment & contacts</h3>
    <div class="grid2">
    <label class="f"><span>Payment</span><select data-f="insurance" id="f-insurance">${INSURANCE.map(o=>`<option ${p.insurance===o?'selected':''}>${o}</option>`).join('')}</select></label>
    ${fld('insNo','Card / panel number',p.insNo)}</div>
    ${fld('gp','Family doctor / physician',p.gp)}${fld('emergency','Emergency contact',p.emergency)}
  </section>
  ${portalPanel(p)}
  <section class="panel">
    <h3>Delete record</h3>
    ${view.confirm==='delete'?`<div class="confirm">Delete ${esc(p.first)} ${esc(p.last)} and all their records for everyone in the clinic? This cannot be undone.<span class="spacer"></span><button class="btn small" data-act="cancelConfirm">Cancel</button><button class="btn small danger" data-act="deletePatient">Delete</button></div>`:`<div class="row"><button class="btn danger" data-act="askDelete">Delete patient</button></div>`}
  </section>`;
}
function mhTab(p){
  const mh=p.mh;
  return `<section class="panel">
    <div class="row"><h2>Medical history questionnaire</h2><span class="spacer"></span><span class="pill ${mhStatus(p).cls}">${mhStatus(p).t}</span></div>
    <p class="small muted" style="margin:0">Go through each question with the patient. Update at every check-up and before any treatment. A “Yes” answer adds a medical alert to the banner.</p>
    <div class="mhq">${(isAes(p)?AES_MH:MH).map(([k,q])=>{const a=mh.answers[k]||{};return `<div class="q">
      <span>${q}</span>
      <span class="yn"><button class="y ${a.v==='y'?'on':''}" data-mh="${k}" data-v="y">Yes</button><button class="n ${a.v==='n'?'on':''}" data-mh="${k}" data-v="n">No</button></span>
      ${a.v==='y'?`<input type="text" class="det" data-mhd="${k}" id="mhd-${k}" placeholder="Details" value="${esc(a.d)}">`:''}
    </div>`}).join('')}</div>
    <label class="f"><span>Current medicines (name, dose, how often)</span><textarea data-mhf="meds" id="mh-meds">${esc(mh.meds)}</textarea></label>
    ${isAes(p)?aesMhExtra(p):''}
    <div class="grid2">
      <label class="f"><span>Smoking / vaping / sheesha</span><input type="text" data-mhf="smoke" id="mh-smoke" placeholder="e.g. 10 cigarettes / day" value="${esc(mh.smoke)}"></label>
      <label class="f"><span>Paan, gutka, naswar or chhalia</span><input type="text" data-mhf="tobacco" id="mh-tobacco" placeholder="what, how often, how many years" value="${esc(mh.tobacco)}"></label>
    </div>
    <label class="row small" style="gap:10px"><input type="checkbox" data-mhf="signed" id="mh-signed" ${mh.signed?'checked':''} style="width:22px;height:22px"> Patient confirmed this information is correct</label>
    <div class="row"><button class="btn primary" data-act="mhDate">Mark as reviewed today</button><span class="small muted">Last reviewed: ${mh.date?fmtDate(mh.date):'never'}</span></div>
  </section>`;
}
/* Side-view (anatomical) drawings for teeth that are not fully in the mouth. Drawn crown-up; upper teeth are flipped. */
const SIDE_ST=['partial','impacted','unerupted','root'];
const TOOTH={
  molar:{crown:'M23 40C19 30 19 18 23 12Q29 5 36.5 10.5Q43.5 4 50 9.5Q56.5 4 63.5 10.5Q71 5 77 12C81 18 81 30 77 40Q50 45 23 40Z',
    root:'M26 37L74 37C73 50 71 62 67 74C65 84 63 92 59 95Q55 97 54.5 90C54.5 78 53.5 66 50 58C46.5 66 45.5 78 45.5 90Q45 97 41 95C37 92 35 84 33 74C29 62 27 50 26 37Z',
    pulp:'M39 33Q44 29 50 31Q56 29 61 33L61 42C61 56 61 72 58.5 88L57.5 88C57.5 72 56.5 58 53 51L47 51C43.5 58 42.5 72 42.5 88L41.5 88C39 72 39 56 37 42Z',cej:40},
  premolar:{crown:'M29 41C25 30 26 18 31 12Q40 3 50 9Q60 3 69 12C74 18 75 30 71 41Q50 45 29 41Z',
    root:'M33 38L67 38C66 56 61 76 53 94Q50 98 47 94C39 76 34 56 33 38Z',
    pulp:'M45 30Q50 25 55 30L55 42C55 58 53 76 50.6 90L49.4 90C47 76 45 58 44 42Z',cej:41},
  canine:{crown:'M32 43C29 30 34 17 50 3C66 17 71 30 68 43Q50 47 32 43Z',
    root:'M35 40L65 40C64 60 58 80 52 97Q50 99.5 48 97C42 80 36 60 35 40Z',
    pulp:'M47 28L50 21L53 28L53.5 44C53 62 52 80 50.6 94L49.4 94C48 80 47 62 46 44Z',cej:43},
  incisor:{crown:'M34 43C31 30 33 16 36 5Q50 2 64 5C67 16 69 30 66 43Q50 47 34 43Z',
    root:'M37 40L63 40C62 58 57 76 52 94Q50 97 48 94C43 76 38 58 37 40Z',
    pulp:'M46.5 24L53.5 24L54 44C54 60 52 76 50.6 90L49.4 90C48 76 46 60 45 44Z',cej:43}};
function toothType(n){const pos=n%10;if(pos<=2)return 'incisor';if(pos===3)return 'canine';if(isPrim(n))return 'molar';return pos<=5?'premolar':'molar'}
const ANG_DEG={Mesioangular:45,Distoangular:-45,Horizontal:90,Vertical:0,Inverted:180,Buccoangular:0,Linguoangular:0};
function sideView(p,n,big){
  const st=p.chart[n];const id='cv'+n+(big?'b':'');const imp=(p.imp||{})[n]||{};
  const mesialRight=[1,4,5,8].includes(Math.floor(n/10));const mes=mesialRight?1:-1;
  const T=TOOTH[toothType(n)];const sw=big?.9:1.6;const ink='#5a4632';
  // one realistic tooth: dentine root, enamel crown, pulp, CEJ
  const tooth=(o={})=>{const cut=o.cut?` clip-path="url(#${id}k)"`:'';
    return `<g${cut}><path d="${T.root}" fill="url(#${id}d)" stroke="${ink}" stroke-width="${sw}" stroke-linejoin="round"/>`
      +(o.noCrown?'':`<path d="${T.crown}" fill="url(#${id}e)" stroke="${ink}" stroke-width="${sw}" stroke-linejoin="round"/>`)
      +`<path d="${T.pulp}" fill="#dc7486" opacity="${o.noCrown?.95:.78}"/>`
      +(o.noCrown?'':`<path d="M30 ${T.cej-12}Q34 ${T.cej-20} 40 ${T.cej-22}" fill="none" stroke="#fff" stroke-width="${big?2:3}" stroke-linecap="round" opacity=".7"/>`)+`</g>`};
  const place=(cx,cy,s,rot,inner)=>`<g transform="translate(${cx} ${cy}) rotate(${rot||0}) scale(${s}) translate(-50 -50)">${inner}</g>`;
  const neighbour=(cx)=>`<g opacity=".8">${place(cx,48,.74,0,`<path d="${TOOTH.molar.root}" fill="#e3d3ae" stroke="${ink}" stroke-width="${sw}"/><path d="${TOOTH.molar.crown}" fill="#f4f1ea" stroke="${ink}" stroke-width="${sw}"/>`)}</g>`;
  const follicle=(cx,cy,s,rot)=>place(cx,cy,s,rot,`<ellipse cx="50" cy="${T.cej-16}" rx="${toothType(n)==='molar'?33:24}" ry="23" fill="#3b2a1d" opacity=".28"/>`);
  const G=40;// gingival margin
  const defs=`<defs><linearGradient id="${id}e" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".6" stop-color="#f2efe7"/><stop offset="1" stop-color="#d9d3c5"/></linearGradient>`
    +`<linearGradient id="${id}d" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#dcc79a"/><stop offset=".45" stop-color="#f1e4c4"/><stop offset="1" stop-color="#cdb684"/></linearGradient>`
    +`<linearGradient id="${id}g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f3a3ad"/><stop offset="1" stop-color="#d9727f"/></linearGradient>`
    +`<linearGradient id="${id}b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f0dcb6"/><stop offset="1" stop-color="#d9b98a"/></linearGradient>`
    +`<pattern id="${id}t" width="9" height="9" patternUnits="userSpaceOnUse"><circle cx="2" cy="3" r="1.4" fill="#b8925f" opacity=".45"/><circle cx="6.5" cy="7" r="1" fill="#b8925f" opacity=".35"/><circle cx="7" cy="1.5" r=".7" fill="#b8925f" opacity=".3"/></pattern>`
    +`<clipPath id="${id}k"><rect x="-100" y="${T.cej+3}" width="300" height="200"/></clipPath></defs>`;
  const bone=(top)=>`<path d="M0 ${top}Q25 ${top-3} 50 ${top}T100 ${top}V100H0Z" fill="url(#${id}b)"/><path d="M0 ${top}Q25 ${top-3} 50 ${top}T100 ${top}V100H0Z" fill="url(#${id}t)"/><path d="M0 ${top}Q25 ${top-3} 50 ${top}T100 ${top}" fill="none" stroke="#fff6e2" stroke-width="${big?1.5:2.5}" opacity=".8"/>`;
  const gum=(top,bot,a)=>`<path d="M0 ${top+4}Q12 ${top-2} 25 ${top+2}Q38 ${top+6} 50 ${top}Q62 ${top-4} 75 ${top+2}Q88 ${top+6} 100 ${top+1}V${bot}H0Z" fill="url(#${id}g)" opacity="${a||1}"/>`;
  let scene=`<rect width="100" height="100" fill="#20262b"/>`+bone(G+8);
  if(st==='partial'){
    // crown half through the gum, root in bone, operculum over the distal part
    scene+=place(50,58,.78,0,tooth())+gum(G,G+10,.92)
      +(toothType(n)!=='molar'?'':`<path d="M${50-mes*24} ${G+1}Q${50-mes*6} ${G-12} ${50+mes*6} ${G-4}L${50+mes*6} ${G+4}Z" fill="url(#${id}g)" opacity=".9"/>`);
  }else if(st==='unerupted'){
    scene=`<rect width="100" height="100" fill="#20262b"/>`+bone(G+6)+follicle(50,79,.54,0)+place(50,79,.54,0,tooth())+gum(G,G+8);
  }else if(st==='impacted'){
    const a=(ANG_DEG[imp.ang]||0)*mes;const h=Math.abs(a)===90;
    const cy=h?78:76,s=h?.52:.56;
    scene=`<rect width="100" height="100" fill="#20262b"/>`+bone(G+6)
      +(toothType(n)==='molar'?neighbour(50+mes*60):'')
      +follicle(50,cy,s,a)+place(50,cy,s,a,tooth())+gum(G,G+8);
  }else if(st==='root'){
    // crown gone, root left in bone with a broken, decayed top
    const y=T.cej+3;
    scene+=place(50,56,.82,0,tooth({cut:1,noCrown:1})
      +`<path d="M${T===TOOTH.molar?27:34} ${y}L${T===TOOTH.molar?33:39} ${y-5}L40 ${y+1}L46 ${y-6}L52 ${y+1}L58 ${y-5}L63 ${y}L${T===TOOTH.molar?69:66} ${y-4}L${T===TOOTH.molar?73:66} ${y}Z" fill="#9c7448" stroke="${ink}" stroke-width="${sw}" stroke-linejoin="round"/>`)
      +gum(G,G+9,.9);
  }
  if(isUpper(n))scene=`<g transform="matrix(1 0 0 -1 0 100)">${scene}</g>`;
  return `<svg viewBox="0 0 100 100" aria-hidden="true" class="sideview">${defs}<clipPath id="${id}"><rect x="2" y="2" width="96" height="96" rx="10"/></clipPath><g clip-path="url(#${id})">${scene}</g><rect x="2" y="2" width="96" height="96" rx="10" fill="none" stroke="var(--t-${{partial:'pe',impacted:'imp',unerupted:'ue',root:'rr'}[st]})" stroke-width="${big?2.5:5}" ${st==='impacted'||st==='partial'?'stroke-dasharray="8 6"':st==='unerupted'?'stroke-dasharray="3 6" stroke-linecap="round"':''}/></svg>`;
}
// ---- natural-looking tooth (buccal view) in gum and bone, like German practice software ----
const NAT={
  molar:{crown:'M25 42C21 36 18 28 19 20C19.5 14 22 10 26 8.5Q31 6.5 35 9Q39 4.5 45 7Q50 9.5 54 6.5Q60 4.5 64 8Q68 5.5 73 8C78 10.5 81 15 81 21C82 29 79 36 75 42Q50 46 25 42Z',
    root:'M27 40Q50 44 73 40C73 52 71 62 68 72C66 82 64 90 60 95Q56.5 97 56 91C56 80 55 68 51 60L49 60C45 68 44 80 44 91Q43.5 97 40 95C36 90 34 82 32 72C29 62 27 52 27 40Z',
    up:'M27 40Q50 44 73 40C74 52 74 64 71 75Q69 84 64 89Q60.5 90.5 61 85C62 73 60 63 55 57L45 57C40 63 38 73 39 85Q39.5 90.5 36 89C31 84 29 76 28 68C27 58 27 50 27 40Z',
    pal:'M41 44C40 60 43 78 50 94C57 78 60 60 59 44Z',
    detail:'M50 8.5Q50.6 16 49.6 25M35 9.5Q37 15 39 19M64 8.5Q63 14 61 18',x:[19,81],cej:42},
  premolar:{crown:'M30 42C26 34 25 24 28 17C30 11 35 8 41 6Q46 3 50 2Q54 3 59 6C65 8 70 11 72 17C75 24 74 34 70 42Q50 46 30 42Z',
    root:'M32 40Q50 44 68 40C67 56 62 74 54 93Q50 98 46 93C38 74 33 56 32 40Z',
    detail:'M50 3Q50.5 12 50 24',x:[26,74],cej:42},
  canine:{crown:'M32 43C28 34 28 24 32 17C36 11 43 6 50 1C57 6 64 11 68 17C72 24 72 34 68 43Q50 47 32 43Z',
    root:'M34 41Q50 45 66 41C65 60 60 80 53 98Q50 101 47 98C40 80 35 60 34 41Z',
    detail:'M50 2Q51 14 50 30',x:[28,72],cej:43},
  incisor:{crown:'M33 43C30 33 31 20 33 9Q34 4 39 3.5Q50 2.5 61 3.5Q66 4 67 9C69 20 70 33 67 43Q50 47 33 43Z',
    root:'M35 41Q50 45 65 41C64 58 59 76 53 94Q50 97 47 94C41 76 36 58 35 41Z',
    detail:'M44 4.5V11M56 4.5V11',x:[31,69],cej:43}};
function chartStyle(){return lsGet('chartStyle')==='simple'?'simple':'natural'}
function naturalSVG(p,n,big){
  const st=p.chart[n]||'',type=toothType(n),N=NAT[type],T=TOOTH[type],sf=p.surf[n]||{};
  const id='nt'+n+(big?'B':'s');const mr=[1,4,5,8].includes(Math.floor(n/10));const up=isUpper(n);
  const [xl,xr]=N.x,w=xr-xl,top=type==='canine'?4:6,cej=N.cej;
  const ink='#6e5c46',sw=big?1:1.6;
  const mat=(p.pros||{})[n];const mfill=MAT_FILL[mat];
  const rootPath=up&&type==='molar'?N.up:N.root;
  const defs=`<defs><linearGradient id="${id}e" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#e4dfd3"/><stop offset=".3" stop-color="#fffefb"/><stop offset=".7" stop-color="#f6f2ea"/><stop offset="1" stop-color="#d3ccbd"/></linearGradient>`
    +`<linearGradient id="${id}v" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".0"/><stop offset=".75" stop-color="#e8dcc0" stop-opacity=".0"/><stop offset="1" stop-color="#e3cf9f" stop-opacity=".55"/></linearGradient>`
    +`<linearGradient id="${id}d" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#cdb582"/><stop offset=".45" stop-color="#efe1bd"/><stop offset="1" stop-color="#c2a872"/></linearGradient>`
    +`<linearGradient id="${id}g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4a7b0"/><stop offset=".55" stop-color="#ec919d"/><stop offset="1" stop-color="#d9707f"/></linearGradient>`
    +`<linearGradient id="${id}b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#efd9b0"/><stop offset="1" stop-color="#d8b583"/></linearGradient>`
    +`<pattern id="${id}t" width="8" height="8" patternUnits="userSpaceOnUse"><path d="M1 2.5q1.5-1.5 3 0t3 0M3 6.5q1.5-1.5 3 0" fill="none" stroke="#b48a55" stroke-width=".55" opacity=".55"/><circle cx="6.5" cy="3" r=".7" fill="#b48a55" opacity=".35"/></pattern>`
    +`<pattern id="${id}s" width="4" height="4" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".45" fill="#c45f6f" opacity=".35"/><circle cx="3" cy="3" r=".35" fill="#c45f6f" opacity=".3"/></pattern>`
    +`<clipPath id="${id}c"><path d="${N.crown}"/></clipPath><clipPath id="${id}k"><rect x="-50" y="${cej+2}" width="200" height="200"/></clipPath><clipPath id="${id}w"><rect x="8" y="-6" width="84" height="108"/></clipPath></defs>`;
  // surfaces painted on the crown: O/I = biting edge, M/D = sides, B = face, L = cervical band
  const mx=mr?[xr-w*.24,xr+2]:[xl-2,xl+w*.24],dx=mr?[xl-2,xl+w*.24]:[xr-w*.24,xr+2];
  const reg={O:[xl-2,top-6,w+4,12],M:[mx[0],top+6,mx[1]-mx[0],cej-top],D:[dx[0],top+6,dx[1]-dx[0],cej-top],B:[xl+w*.24,top+6,w*.52,(cej-top)*.62],L:[xl+w*.24,top+6+(cej-top)*.62,w*.52,cej]};
  let paint='';for(const k in reg){const v=sf[k];if(!v)continue;const [x,y,ww,hh]=reg[k];
    paint+=`<rect x="${x}" y="${y}" width="${ww}" height="${hh}" rx="3" fill="var(${surfColor(v)})" opacity="${v.t==='fill'?.92:.85}"/>`;
    if(v.t==='caries'||v.t==='sec')paint+=`<circle cx="${x+ww/2}" cy="${y+hh/2}" r="${Math.min(ww,hh)/4}" fill="#3a2a22" opacity=".45"/>`}
  const root=(o={})=>(up&&type==='molar'?`<path d="${N.pal}" fill="#e6d6ad" stroke="${ink}" stroke-width="${sw*.8}" opacity=".85"/>`:'')
    +`<path d="${rootPath}" fill="${o.fill||`url(#${id}d)`}" stroke="${ink}" stroke-width="${sw}" stroke-linejoin="round"/>`
    +(type==='molar'&&!o.fill?`<path d="M50 ${cej+4}V${cej+14}" stroke="#b39a66" stroke-width="${sw}" opacity=".6"/>`:'');
  const crown=(fill,stroke,sw2)=>`<path d="${N.crown}" fill="${fill||`url(#${id}e)`}" stroke="${stroke||ink}" stroke-width="${sw2||sw}" stroke-linejoin="round"/>`;
  const shine=`<path d="M${xl+w*.18} ${top+10}Q${xl+w*.2} ${(top+cej)/2} ${xl+w*.28} ${cej-7}" fill="none" stroke="#fff" stroke-width="${big?2:2.8}" stroke-linecap="round" opacity=".9"/>`;
  const detail=`<path d="${N.detail}" fill="none" stroke="#bfb6a3" stroke-width="${big?.7:1.1}" stroke-linecap="round" opacity=".8"/>`;
  const canals=`<path d="${T.pulp}" fill="var(--t-rct)" opacity=".9" clip-path="url(#${id}k)"/>`;
  const natural=()=>root()+crown()+`<path d="${N.crown}" fill="url(#${id}v)"/>`+detail+`<g clip-path="url(#${id}c)">${paint}</g>`+shine;
  const cap=(stroke)=>crown(mfill?mfill:'#f2efe8',stroke,big?2:3.2)+(mat==='PFM'?`<path d="M${xl+2} ${cej-3}Q50 ${cej+1} ${xr-2} ${cej-3}" stroke="#7d868c" stroke-width="${big?2:3}" fill="none"/>`:'')+shine;
  const rct=p.rct&&p.rct[n];
  let g='',extra='',screwOnly=false;
  if(st==='missing'||st==='ext'&&false)g='';
  else if(st==='crown'||st==='abut')g=root()+(rct?canals:'')+cap(st==='crown'?'var(--t-crown)':'var(--t-bridge)');
  else if(st==='bridge')g=cap('var(--t-bridge)');
  else if(st==='implant'){const yb=cej+1;g=`<rect x="42" y="${yb}" width="16" height="${92-yb}" rx="5" fill="#a3abb0" stroke="#5f686d" stroke-width="${sw}"/>`
      +Array.from({length:Math.floor((88-yb)/6)},(_,i)=>`<path d="M40.5 ${yb+6+i*6}L59.5 ${yb+8.5+i*6}" stroke="#5f686d" stroke-width="${big?1.2:2}" stroke-linecap="round"/>`).join('')
      +crown(mfill||'#f4f2ec','var(--t-implant)',big?2:3)+shine;}
  else if(st==='veneer')g=natural()+`<rect x="${xl+w*.1}" y="${top+3}" width="${w*.8}" height="${cej-top-5}" rx="6" fill="${mfill||'#f8f2e6'}" opacity=".85" stroke="var(--t-ven)" stroke-width="${big?1.5:2.4}" clip-path="url(#${id}c)"/>`;
  else if(st==='root'){const y=cej+3;g=`<g clip-path="url(#${id}k)">${root()}</g>`
      +`<path d="M${xl+5} ${y}L${xl+w*.25} ${y-6}L${xl+w*.42} ${y}L50 ${y-7}L${xr-w*.4} ${y}L${xr-w*.22} ${y-5}L${xr-5} ${y}Z" fill="#9c7448" stroke="${ink}" stroke-width="${sw}" stroke-linejoin="round"/>`;}
  else g=natural();
  if(rct&&!['implant','missing','bridge'].includes(st)&&st!=='crown'&&st!=='abut')g+=canals;
  if(st==='frac')extra+=`<polyline points="${xl+6},${top+4} ${xl+w*.55},${top+16} ${xl+w*.35},${top+24} ${xr-6},${cej-2}" fill="none" stroke="var(--t-frac)" stroke-width="${big?2.5:4}" stroke-linejoin="round"/>`;
  if(st==='ext')extra+=`<path d="M22 14L78 88M78 14L22 88" stroke="var(--t-ext)" stroke-width="${big?3:5}" stroke-linecap="round"/>`;
  if(!big&&(st==='abut'||st==='bridge')){const isB=x=>x&&['abut','bridge'].includes(p.chart[x]);const [l,r]=neighbours(n);
    extra+=`<path d="M${isB(l)?-10:xl+6} ${top+15}H${isB(r)?110:xr-6}" stroke="var(--t-bridge)" stroke-width="5" stroke-linecap="round"/>`}
  // where the tooth sits
  let tf='';const imp=(p.imp||{})[n]||{};const buried=['unerupted','impacted'].includes(st);
  if(st==='partial')tf='translate(0 14)';
  else if(st==='unerupted')tf='translate(50 76) scale(.6) translate(-50 -45)';
  else if(st==='impacted'){const a=(ANG_DEG[imp.ang]||0)*(mr?1:-1);const h=Math.abs(a)===90;tf=`translate(50 ${h?78:76}) rotate(${a}) scale(${h?.5:.58}) translate(-50 -45)`;}
  const flat=st==='missing'||buried||st==='bridge';
  // gingiva: scalloped margin hugging the neck, papillae between teeth; healed flat ridge where no tooth
  const m=st==='partial'?cej+5:cej+2;// margin level
  const gTop=flat?`M8 ${cej-4}Q50 ${cej-7} 92 ${cej-4}`:`M8 ${m-11}C14 ${m-10} ${xl-1} ${m-7} ${xl+3} ${m-3}Q50 ${m+3} ${xr-3} ${m-3}C${xr+1} ${m-7} 86 ${m-10} 92 ${m-10}`;
  const crestY=cej+5;
  const gBot=`V${crestY+9}Q50 ${crestY+12} 8 ${crestY+9}Z`;
  const gum=`<path d="${gTop}${gBot}" fill="url(#${id}g)"/><path d="${gTop}${gBot}" fill="url(#${id}s)"/>`
    +`<path d="${gTop}" fill="none" stroke="#d26a79" stroke-width="${big?.9:1.3}" stroke-linecap="round"/>`
    +`<path d="M8 ${crestY+9}Q50 ${crestY+12} 92 ${crestY+9}" fill="none" stroke="#c45c6c" stroke-width="${big?.8:1.2}" opacity=".7"/>`;
  // alveolar bone: crest follows the neck, interdental septa higher; trabecular texture; root visible through a thin cortical plate
  const crest=flat?`M8 ${crestY-2}Q50 ${crestY-4} 92 ${crestY-2}`:`M8 ${crestY-4}C${xl-4} ${crestY-4} ${xl+2} ${crestY} ${xl+6} ${crestY+2}Q50 ${crestY+6} ${xr-6} ${crestY+2}C${xr-2} ${crestY} ${xr+4} ${crestY-4} 92 ${crestY-4}`;
  const boneArea=`${crest}V112H8Z`;
  const boneBack=`<path d="${boneArea}" fill="url(#${id}b)"/><path d="${boneArea}" fill="url(#${id}t)"/>`;
  const boneOver=`<path d="${boneArea}" fill="url(#${id}b)" opacity="${buried?.5:.3}"/><path d="${boneArea}" fill="url(#${id}t)" opacity=".6"/>`
    +`<path d="${crest}" fill="none" stroke="#fbf0d9" stroke-width="${big?1:1.6}"/>`;
  const follicle=buried?`<g transform="${tf}"><ellipse cx="50" cy="${top+16}" rx="${w/2+6}" ry="22" fill="#3a2a1c" opacity=".2"/></g>`:'';
  // outline of the root drawn again faintly so it reads "inside the bone"
  const ghost=g&&!['bridge','missing'].includes(st)?`<g ${tf?`transform="${tf}"`:''} clip-path="url(#${id}k)"><path d="${st==='implant'?'M42 44H58V92H42Z':rootPath}" fill="none" stroke="#7a6347" stroke-width="${sw*.9}" opacity=".55"/></g>`:'';
  let body=`<g clip-path="url(#${id}w)"><rect x="8" y="-6" width="84" height="${cej-4}" fill="none"/>${boneBack}${follicle}<g ${tf?`transform="${tf}"`:''}>${g}</g>${boneOver}${ghost}${gum}</g>${extra}`;
  if(up)body=`<g transform="matrix(1 0 0 -1 0 98)">${body}</g>`;
  const outline={impacted:'var(--t-imp)',partial:'var(--t-pe)',unerupted:'var(--t-ue)'}[st];
  return `<svg class="nat" viewBox="10 -4 80 104" aria-hidden="true">${defs}${body}${outline?`<rect x="11" y="-3" width="78" height="102" rx="8" fill="none" stroke="${outline}" stroke-width="${big?1.5:2.5}" stroke-dasharray="${st==='unerupted'?'2 5':'7 5'}" stroke-linecap="round"/>`:''}${st==='missing'?`<path d="M30 ${up?70:28}L70 ${up?30:68}M70 ${up?70:28}L30 ${up?30:68}" stroke="var(--t-missing)" stroke-width="${big?2.5:4}" stroke-linecap="round" opacity=".7"/>`:''}</svg>`;
}
function toothSVG(p,n,big,noSide){
  if(!big&&!noSide&&SIDE_ST.includes(p.chart[n]))return sideView(p,n,false);
  const sf=p.surf[n]||{},st=p.chart[n]||'',map=surfMap(n);
  const polys={top:'4,4 96,4 68,32 32,32',bottom:'4,96 96,96 68,68 32,68',left:'4,4 32,32 32,68 4,96',right:'96,4 68,32 68,68 96,96',center:'32,32 68,32 68,68 32,68'};
  const lp={top:[50,19],bottom:[50,86],left:[17,53],right:[83,53],center:[50,53]};
  let s=`<svg viewBox="0 0 100 100" ${big?'role="group" aria-label="Surfaces of tooth '+n+'"':'aria-hidden="true"'}><g ${['missing','unerupted','root'].includes(st)||(st==='bridge'&&!big)?'opacity=".3"':''}>`;
  for(const pos in polys){const k=map[pos],v=sf[k];
    s+=`<polygon points="${polys[pos]}" fill="${v?`var(${surfColor(v)})`:'var(--paper)'}" stroke="var(--ink)" stroke-width="${big?1.5:3.5}" stroke-linejoin="round"${big?` data-surf="${k}" tabindex="0" role="button" aria-label="${surfName(n,k)} surface${v?', '+(v.t==='fill'?(MT[v.m]||MT.comp).label+' filling':v.t):''}"`:''}/>`;}
  s+='</g>';
  const ov=w=>`pointer-events="none" stroke-width="${w}"`;
  const mat=(p.pros||{})[n],mfill=MAT_FILL[mat]||'#efe6d2',op=big?.45:.92;
  const cap=(stroke,dash)=>`<rect x="4" y="4" width="92" height="92" rx="14" fill="${mfill}" fill-opacity="${op}" stroke="${stroke}" ${dash?'stroke-dasharray="10 6"':''} ${ov(big?5:9)}/>`
    +(mat==='PFM'&&!big?`<rect x="16" y="16" width="68" height="68" rx="9" fill="none" stroke="#7d868c" stroke-width="3" pointer-events="none"/>`:'');
  if(st==='crown')s+=cap('var(--t-crown)');
  if(st==='abut')s+=cap('var(--t-bridge)');
  if(st==='bridge')s+=cap('var(--t-bridge)',true)+(big?'':`<path d="M30 58q20 14 40 0" fill="none" stroke="#7d868c" stroke-width="4" stroke-linecap="round" pointer-events="none"/>`);
  const flip=x=>isUpper(n)?`<g transform="matrix(1 0 0 -1 0 100)">${x}</g>`:x;
  if(st==='implant'){let ib='';
    if(mat)ib+=`<rect x="4" y="4" width="92" height="38" rx="12" fill="${mfill}" fill-opacity="${op}" stroke="var(--t-implant)" ${ov(big?3:5)}/>`;
    else if(!big)ib+=`<rect x="4" y="4" width="92" height="92" rx="14" fill="var(--paper)" fill-opacity=".9" pointer-events="none"/>`;
    ib+=`<g pointer-events="none" opacity="${big?.75:1}"><rect x="36" y="${mat?44:16}" width="28" height="${mat?48:74}" rx="6" fill="var(--t-implant)"/>`
      +[0,1,2,3,4,5].filter(i=>(mat?50:24)+i*12<(mat?90:88)).map(i=>`<path d="M33 ${(mat?50:24)+i*12}L67 ${(mat?56:30)+i*12}" stroke="var(--paper)" stroke-width="3.5" stroke-linecap="round"/>`).join('')
      +`<rect x="30" y="${mat?40:12}" width="40" height="8" rx="3" fill="var(--t-implant)"/></g>`;
    s+=flip(ib);
  }
  if(p.rct&&p.rct[n]&&!['implant','missing','bridge'].includes(st))s+=`<path d="M44 26V84M56 26V84" stroke="var(--t-rct)" stroke-linecap="round" ${ov(big?4:7)}/>`;
  if(!big&&(st==='abut'||st==='bridge')){const isB=x=>x&&['abut','bridge'].includes(p.chart[x]);const [l,r]=neighbours(n);
    s+=`<path d="M${isB(l)?-70:20} 50H${isB(r)?170:80}" stroke="var(--t-bridge)" ${ov(8)}/>`}
  if(st==='veneer'){const top=map.top==='B';s+=`<polygon points="${top?'4,4 96,4 68,32 32,32':'4,96 96,96 68,68 32,68'}" fill="${MAT_FILL[mat]||'#f8f2e6'}" fill-opacity="${big?.5:.95}" stroke="var(--t-ven)" stroke-linejoin="round" ${ov(big?4:8)}/>`}
  if(st==='impacted')s+=`<rect x="3" y="3" width="94" height="94" fill="none" stroke="var(--t-imp)" stroke-dasharray="8 6" ${ov(big?5:9)}/><path d="M22 78L78 22M78 22H56M78 22V44" fill="none" stroke="var(--t-imp)" stroke-linecap="round" stroke-linejoin="round" ${ov(big?5:9)}/>`;
  if(st==='partial')s+=`<rect x="3" y="3" width="94" height="94" fill="none" stroke="var(--t-pe)" stroke-dasharray="8 6" ${ov(big?5:9)}/><path d="M6 50H94" stroke="var(--t-pe)" ${ov(big?5:9)}/>`;
  if(st==='unerupted')s+=`<rect x="3" y="3" width="94" height="94" fill="none" stroke="var(--t-ue)" stroke-dasharray="3 7" stroke-linecap="round" ${ov(big?5:9)}/>`;
  if(st==='root')s+=flip(`<path d="M26 22L42 86M74 22L58 86M20 22H80" fill="none" stroke="var(--t-rr)" stroke-linecap="round" ${ov(big?6:11)}/>`);
  if(st==='frac')s+=`<polyline points="20,8 45,40 35,55 70,92" fill="none" stroke="var(--t-frac)" ${ov(big?4:8)}/>`;
  if(st==='missing'||st==='ext')s+=`<path d="M10 10L90 90M90 10L10 90" fill="none" stroke="var(${st==='ext'?'--t-ext':'--t-missing'})" stroke-linecap="round" ${ov(big?5:10)}/>`;
  if(big)for(const pos in lp){const k=map[pos];s+=`<text x="${lp[pos][0]}" y="${lp[pos][1]}" text-anchor="middle" dominant-baseline="middle">${surfLabel(n,k)}</text>`}
  return s+'</svg>';
}
/* X-rays linked to a tooth: its number written in the X-ray's "Teeth" field. */
const toothHasXray=n=>xrays.some(x=>new RegExp('(^|\\D)'+n+'(\\D|$)').test(x.teeth||''));
function toothXrays(n){return xrays.filter(x=>new RegExp('(^|\\D)'+n+'(\\D|$)').test(x.teeth||'')||/opg|full/i.test((x.kind||'')+' '+(x.teeth||'')))}
function toothXrayHtml(t){
  const list=toothXrays(t);
  return `<div class="txr">
    <div class="row" style="gap:8px;flex-wrap:wrap"><h3>X-rays of tooth ${t}</h3><span class="small muted">${list.length?list.length+' found':(xrLoading?'Loading…':'none yet')}</span><span class="spacer"></span>${isAcct()?'':`<select id="tx-kind" style="width:auto" aria-label="Type of image">${['Periapical (PA)','Bitewing (BW)','Intraoral camera photo','Microscope photo','OPG','CBCT / scan report','Old record (scan)','Other'].map(k=>`<option ${k===(view.txKind||'Periapical (PA)')?'selected':''}>${k}</option>`).join('')}</select>
      <label class="btn filebtn ${xrBusy?'busy':''}">${xrBusy?'Saving…':'+ Add X-ray for tooth '+t}<input type="file" id="tx-file" accept="image/*,application/pdf" multiple ${xrBusy||readOnly()?'disabled':''}></label>`}</div>
    ${list.length?`<div class="txr-strip">${list.map(x=>`<button class="txr-item" data-xr="${x.id}" aria-label="Open ${esc(x.kind)} from ${fmtDate(x.taken_on)}">${x.mime==='application/pdf'?'<span class="xthumb pdf">PDF</span>':`<span class="xthumb">${xrUrls[x.path]?`<img src="${esc(xrUrls[x.path])}" alt="">`:''}</span>`}<span class="txr-cap"><b>${esc(x.kind)}</b>${fmtDate(x.taken_on)}${x.teeth?' · '+esc(x.teeth):''}</span></button>`).join('')}</div>`
      :''}
  </div>`;
}
function prosText(p,n){const st=p.chart[n];const m=(p.pros||{})[n];return PROS_ST.includes(st)&&m&&PM[m]?' – '+PM[m]:''}
const ROWS=[[...PERM.UR,...PERM.UL],[...PERM.LR,...PERM.LL],[...PRIM.UR,...PRIM.UL],[...PRIM.LR,...PRIM.LL]];
function neighbours(n){for(const r of ROWS){const i=r.indexOf(n);if(i>=0)return [r[i-1],r[i+1]]}return [null,null]}
function impText(p,n){const st=p.chart[n];const d=(p.imp||{})[n];if(!(st==='impacted'||st==='partial')||!d)return '';const x=[d.ang,d.depth,d.cls].filter(Boolean).join(', ').toLowerCase();return x?' ('+x+')':''}
const ANG_SHORT={Mesioangular:'MA',Distoangular:'DA',Vertical:'V',Horizontal:'H',Buccoangular:'BA',Linguoangular:'LA',Inverted:'INV'};
function toothBtn(p,n,lower){
  const st=ST[p.chart[n]||'']||ST[''];const imp=(p.imp||{})[n]||{};
  const code=[st.de,PROS_ST.includes(p.chart[n])&&p.pros&&p.pros[n]?p.pros[n]:'',(p.chart[n]==='impacted'||p.chart[n]==='partial')&&imp.ang?ANG_SHORT[imp.ang]:'',p.rct[n]?'RCT':'',p.mob&&p.mob[n]?'M'+({I:1,II:2,III:3}[p.mob[n]]||''):''].filter(Boolean).join(' ');
  const sum=summaryOf(p,n).map(x=>x.s+' '+x.txt).join(', ');
  return `<button class="tooth ${chartStyle()==='natural'?'natv':''} ${lower?'lo':''} ${isPrim(n)?'prim':''} ${view.tooth===n?'sel':''}" data-tooth="${n}" aria-label="Tooth ${n}: ${st.label}${impText(p,n)}${prosText(p,n)}${p.rct[n]?', root canal treated':''}${sum?', '+sum:''}"><span>${n}</span>${chartStyle()==='natural'?naturalSVG(p,n,false)+'<span class="sq">'+toothSVG(p,n,false,true)+'</span>':toothSVG(p,n,false)}${toothHasXray(n)?'<i class="xr-dot" title="Has X-ray"></i>':''}<span class="code">${esc(code)||(p.toothNotes[n]?'•':'')}</span></button>`;
}
/* Old patient from paper: save what is charted on a tooth as a past treatment with its date */
function pastSuggest(p,t){
  const st=p.chart[t]||'',m=(p.pros||{})[t]||'',sf=p.surf[t]||{};
  const crownOf={PFM:'Crown – PFM',ZR:'Crown – zirconia',EMX:'Crown – E-max',CER:'Crown – full ceramic',FM:'Crown – full metal',AU:'Crown – full metal',TMP:'Crown – PFM'};
  const bridgeOf={PFM:'Bridge – PFM',ZR:'Bridge – zirconia',EMX:'Bridge – E-max',FM:'Bridge – full metal',AU:'Bridge – full metal'};
  const out=[];
  if(p.rct&&p.rct[t])out.push('Root canal treatment');
  if(st==='crown')out.push(crownOf[m]||'Crown – PFM');
  if(st==='abut'||st==='bridge')out.push(bridgeOf[m]||'Bridge – PFM');
  if(st==='implant')out.push('Implant placement','Implant crown');
  if(st==='veneer')out.push('Veneer');
  if(st==='missing')out.push('Extraction');
  const fills=Object.entries(sf).filter(([k,v])=>v.t==='fill');
  if(fills.length){const mt=MT[fills[0][1].m]||MT.comp;out.push(mt.proc)}
  return out.length?out:['Filling – composite'];
}
function pastBox(p,t){
  const sug=pastSuggest(p,t),sel=view.pastProc&&PROCS.includes(view.pastProc)?view.pastProc:sug[0];
  const fillS=Object.entries(p.surf[t]||{}).filter(([k,v])=>v.t==='fill').map(([k])=>surfLabel(t,k)).join('');
  const hist=p.plan.filter(i=>i.status==='completed'&&String(i.tooth)===String(t)).sort((a,b)=>String(b.doneDate||'').localeCompare(String(a.doneDate||'')));
  return `<div class="impbox pastbox"><h3>Past treatment on tooth ${t} – from the paper file</h3>
    <p class="small muted" style="margin:0">Chart the tooth above, then save each treatment with the date written in the file.</p>
    <div class="grid3">
      <label class="f"><span>Treatment</span><select id="pt-proc">${[...new Set([...sug,...PROCS])].map(o=>`<option ${o===sel?'selected':''}>${esc(o)}</option>`).join('')}</select></label>
      <label class="f"><span>Done on</span><input type="date" id="pt-date" max="${today()}" value="${esc(view.pastDate||'')}"></label>
      <label class="f"><span>Fee (Rs)</span><input type="number" inputmode="numeric" id="pt-fee" min="0" step="1" placeholder="0"></label>
    </div>
    <input type="hidden" id="pt-surf" value="${esc(fillS)}">
    <div class="row"><button class="btn primary small" data-act="addPast">+ Save to history</button></div>
    ${hist.length?`<div class="summary">${hist.map(i=>`<span><b>${i.doneDate?fmtDate(i.doneDate):'no date'}</b> · ${esc(i.proc)}${i.surf?' ('+esc(i.surf)+')':''}${+i.fee?' · '+money(i.fee):''}</span>`).join('')}</div>`:''}
  </div>`;
}
function editor(p,t,mode,mat,sum){
  const cur=p.chart[t]||'';
  return `<div class="panel" style="background:var(--bg)" id="editor">
    <div class="row"><h2>Tooth ${t}</h2><span class="small muted">${toothName(t)}</span><span class="spacer"></span><button class="btn small" data-act="closeTooth">Done</button></div>
    <div class="sedit">
      <div class="big">${SIDE_ST.includes(cur)?`<div class="sidebig">${sideView(p,t,true)}<p class="small muted" style="text-align:center;margin:4px 0 8px">Side view · ${esc(ST[cur].label.toLowerCase())}${(cur==='impacted'||cur==='partial')&&(p.imp[t]||{}).ang?' · '+esc(p.imp[t].ang.toLowerCase()):''}</p></div>`:''}${toothSVG(p,t,true)}<p class="small muted" style="text-align:center;margin:6px 0 0">Tap a surface to mark it</p></div>
      <div style="display:flex;flex-direction:column;gap:10px;min-width:0">
        <h3>1 · Finding</h3>
        <div class="chips">${MODES.map(m=>`<button class="chip ${mode===m.k?'on':''}" data-mode="${m.k}">${m.col?`<i style="background:var(${m.col})"></i>`:''}${m.label}</button>`).join('')}</div>
        ${mode==='fill'||mode==='sec'?`<h3>2 · ${mode==='sec'?'Existing filling':'Material'}</h3>
        <div class="chips">${MATS.map(m=>`<button class="chip ${mat===m.k?'on':''}" data-mat="${m.k}"><i style="background:var(${m.col})"></i>${m.label}</button>`).join('')}</div>`:''}
        <div class="summary">${sum.length?sum.map(x=>`<span><b>${t} ${x.s}</b> · ${x.txt}</span>`).join(''):'<span class="muted">No surfaces charted yet</span>'}</div>
        <h3 style="margin-top:4px">Whole tooth</h3>
        <div class="statusgrid">${STATUS.map(s=>`<button class="${cur===s.k?'on':''}" data-setst="${s.k}"><i style="width:12px;height:12px;border-radius:3px;flex:none;background:${s.col?`var(${s.col})`:'var(--paper)'};border:1px solid var(--line)"></i>${s.label}${s.de?`<b>${s.de}</b>`:''}</button>`).join('')}</div>
      </div>
    </div>
    ${PROS_ST.includes(cur)?`<div class="impbox"><h3>${cur==='implant'?'Implant crown material':cur==='veneer'?'Veneer material':(cur==='crown'?'Crown':'Bridge')+' material'}</h3>
      <div class="chips">${PROS_MATS.filter(([k])=>cur!=='veneer'||['CER','EMX','ZR','TMP'].includes(k)).map(([k,l])=>`<button class="chip ${(p.pros[t]||'')===k?'on':''}" data-pros="${k}">${l}</button>`).join('')}</div>
      ${cur==='abut'||cur==='bridge'?'<p class="small muted" style="margin:0">Mark the support teeth as <b>Bridge abutment</b> and the replaced teeth as <b>Bridge pontic</b>. They are joined on the chart.</p>':''}</div>`:''}
    ${cur==='impacted'||cur==='partial'?`<div class="impbox"><h3>Impaction details</h3><div class="grid3">
      <label class="f"><span>Angulation (Winter)</span><select data-imp="ang" id="imp-ang"><option value="">—</option>${IMP_ANG.map(o=>`<option ${(p.imp[t]||{}).ang===o?'selected':''}>${o}</option>`).join('')}</select></label>
      <label class="f"><span>Depth (Pell &amp; Gregory)</span><select data-imp="depth" id="imp-depth"><option value="">—</option>${IMP_DEPTH.map(o=>`<option ${(p.imp[t]||{}).depth===o?'selected':''}>${o}</option>`).join('')}</select></label>
      ${t%10===8&&!isUpper(t)?`<label class="f"><span>Ramus relation</span><select data-imp="cls" id="imp-cls"><option value="">—</option>${IMP_CLASS.map(o=>`<option ${(p.imp[t]||{}).cls===o?'selected':''}>${o}</option>`).join('')}</select></label>`:''}
    </div><p class="small muted" style="margin:0">Level A: occlusal plane at or above the second molar · B: between occlusal plane and cervical line · C: below the cervical line.</p></div>`:''}
    <div class="row" style="gap:18px">
      <label class="row small" style="gap:10px"><input type="checkbox" id="rct" data-rct="${t}" ${p.rct[t]?'checked':''} style="width:22px;height:22px"> Root canal treated (RCT)</label>
      <label class="row small" style="gap:8px">Mobility <select id="mob" data-mob="${t}" style="width:auto">${MOB.map(o=>`<option value="${o}" ${(p.mob[t]||'')===o?'selected':''}>${o?'Grade '+o:'None'}</option>`).join('')}</select></label>
      <label class="f" style="flex:1;min-width:200px;flex-direction:row;align-items:center;gap:8px"><span style="white-space:nowrap">Note</span><input type="text" id="toothnote" data-tnote="${t}" value="${esc(p.toothNotes[t])}" placeholder="e.g. deep caries, TTP +, pericoronitis" aria-label="Note for tooth ${t}"></label>
    </div>
    ${p.paperEntry?pastBox(p,t):''}
    ${toothXrayHtml(t)}
    <div class="row"><button class="btn" data-act="addToPlan">+ Add treatment for ${t}</button><span class="spacer"></span>${view.confirm==='clearTooth'?`<button class="btn small" data-act="cancelConfirm">Keep</button><button class="btn small danger" data-act="clearTooth">Yes, clear ${t}</button>`:`<button class="btn small danger" data-act="askClearTooth">Clear tooth</button>`}</div>
  </div>`;
}
function chartTab(p){
  const t=view.tooth,mode=view.mode||'caries',mat=view.mat||'comp';
  const dent=p.dent||autoDent(p);
  const blanks=k=>'<span></span>'.repeat(k);
  const rowHtml=(a,b,lo,padL,padR)=>blanks(padL||0)+a.map(n=>toothBtn(p,n,lo)).join('')+'<span class="mid"></span>'+b.map(n=>toothBtn(p,n,lo)).join('')+blanks(padR||0);
  const W=dent==='prim'?5:8,sideL=`grid-column:1/${W+1}`,sideR=`grid-column:${W+2}/${2*W+2}`;
  let rows;
  if(dent==='prim')rows=`${rowHtml(PRIM.UR,PRIM.UL,false)}<span class="occ"></span>${rowHtml(PRIM.LR,PRIM.LL,true)}`;
  else if(dent==='mixed')rows=`${rowHtml(PERM.UR,PERM.UL,false)}<span class="rowlab">Primary</span>${rowHtml(PRIM.UR,PRIM.UL,false,3,3)}<span class="occ"></span>${rowHtml(PRIM.LR,PRIM.LL,true,3,3)}<span class="rowlab">Permanent</span>${rowHtml(PERM.LR,PERM.LL,true)}`;
  else rows=`${rowHtml(PERM.UR,PERM.UL,false)}<span class="occ"></span>${rowHtml(PERM.LR,PERM.LL,true)}`;
  const legend=[...MODES.filter(m=>m.col).map(m=>[m.label,`background:var(${m.col})`]),...MATS.map(m=>[m.label,`background:var(${m.col})`]),
    ['Crown (CR)','background:#efe6d2;border:2.5px solid var(--t-crown)'],['Implant (IMPL)','background:linear-gradient(90deg,transparent 35%,var(--t-implant) 35% 65%,transparent 65%)'],['Impacted (IMP)','border:2.5px dashed var(--t-imp)'],['Partially erupted (PE)','border:2.5px dashed var(--t-pe)'],['Unerupted (UE)','border:2.5px dotted var(--t-ue)'],['Retained root (RR)','background:var(--t-rr);opacity:.6'],['Veneer (VEN)','background:var(--t-ven)'],['Bridge abutment (ABT) / pontic (PON)','border:2.5px solid var(--t-bridge);border-style:solid dashed'],['Missing (MIS) / extraction (XLA)','background:linear-gradient(45deg,transparent 40%,var(--t-ext) 40% 60%,transparent 60%)'],['Root canal treated (RCT)','background:linear-gradient(90deg,transparent 30%,var(--t-rct) 30% 42%,transparent 42% 58%,var(--t-rct) 58% 70%,transparent 70%)'],['M1–M3 = mobility grade',''],['Has X-ray','background:#2a9d8f;border-radius:50%']];
  const sum=t?summaryOf(p,t):[];
  return `<div class="chartlay"><section class="panel">
    <div class="row"><h2>Dental chart</h2><span class="spacer"></span>
      <div class="seg" role="radiogroup" aria-label="Dentition">${Object.entries(DENT).map(([k,l])=>`<button type="button" class="${dent===k?'on':''}" data-dent="${k}" role="radio" aria-checked="${dent===k}">${l}</button>`).join('')}</div>
      <div class="seg" role="radiogroup" aria-label="Chart style">${[['natural','Natural teeth'],['simple','Simple']].map(([k,l])=>`<button type="button" class="${chartStyle()===k?'on':''}" data-cstyle="${k}" role="radio" aria-checked="${chartStyle()===k}">${l}</button>`).join('')}</div></div>
    <p class="small muted" style="margin:0">${p.dent?'':(p.dob?'Chosen from the patient\'s age ('+age(p.dob)+' yrs). ':'')}FDI numbering · tap a tooth to chart it.</p>
    <div class="opg"><div class="opg-in ${dent==='prim'?'prim-only':''}">
      <span class="side" style="${sideL}">Upper right · Q${dent==='prim'?5:1}</span><span></span><span class="side r" style="${sideR}">Upper left · Q${dent==='prim'?6:2}</span>
      ${rows}
      <span class="side" style="${sideL}">Lower right · Q${dent==='prim'?8:4}</span><span></span><span class="side r" style="${sideR}">Lower left · Q${dent==='prim'?7:3}</span>
    </div></div>
    <p class="small muted" style="margin:0">Charted like an OPG: patient's right on your left. On a phone, swipe the chart sideways.</p>
    <details class="legendbox"><summary>Colour key – what the signs mean</summary><div class="legend">${legend.map(([l,s])=>`<span>${s?`<i style="${s}"></i>`:''}${l}</span>`).join('')}</div></details>
    ${t?editor(p,t,mode,mat,sum):''}
  </section>
  <section class="panel bpepanel">
    <div class="row"><h2>BPE</h2><span class="spacer"></span><span class="small muted">Basic Periodontal Examination</span></div>
    <div class="bpe">${p.bpe.map((v,i)=>`<select data-bpe="${i}" id="bpe-${i}" aria-label="Sextant ${['17–14','13–23','24–27','47–44','43–33','34–37'][i]}">${BPE_OPTS.map(o=>`<option ${v===o?'selected':''} value="${o}">${o||'–'}</option>`).join('')}</select>`).join('')}</div>
    <p class="small muted" style="margin:0">Upper: 17–14 · 13–23 · 24–27 &nbsp;|&nbsp; Lower: 47–44 · 43–33 · 34–37. Codes 0–4, * = furcation, X = edentulous. Code 3 or 4 → full periodontal chart.</p>
    <label class="f" style="max-width:220px"><span>Recorded on</span><input type="date" data-bpedate id="bpe-date" value="${esc(p.bpeDate)}"></label>
  </section></div>`;
}
function planTab(p){return planTabMain(p)+historyPanel(p)}
function historyPanel(p){
  const h=p.plan.filter(i=>i.status==='completed').sort((a,b)=>String(b.doneDate||'').localeCompare(String(a.doneDate||'')));
  if(!h.length)return '';
  return `<section class="panel"><div class="row"><h2>Treatment history</h2><span class="spacer"></span><span class="small muted">${h.length} treatment${h.length===1?'':'s'} done · newest first</span></div>
    <div class="tablewrap"><table class="att hist"><thead><tr><th>Date done</th><th>${isAes(p)?'Area':'Tooth'}</th><th>Treatment</th><th style="text-align:right">Fee</th><th>By</th></tr></thead><tbody>
    ${h.map(i=>`<tr><td><b>${i.doneDate?fmtDate(i.doneDate):'–'}</b></td><td>${esc(i.tooth||'–')}</td><td>${esc(i.proc)}${i.surf?` <small class="muted">${esc(i.surf)}</small>`:''}</td><td style="text-align:right">${money(i.fee)}</td><td>${esc(i.doneBy||'')}</td></tr>`).join('')}
    </tbody></table></div></section>`;
}
function planTabMain(p){
  const tot=p.plan.reduce((a,i)=>a+(+i.fee||0),0),done=p.plan.filter(i=>i.status==='completed').reduce((a,i)=>a+(+i.fee||0),0);
  const form=view.addItem;
  return `<section class="panel">
    <div class="row"><h2>Treatment plan</h2><span class="spacer"></span><button class="btn small primary" data-act="newItem">+ Add item</button></div>
    <div class="totals"><div><span>Total</span><b>${money(tot)}</b></div><div><span>Completed</span><b>${money(done)}</b></div><div><span>Outstanding</span><b>${money(tot-done)}</b></div></div>
    ${p.plan.some(i=>i.status==='completed'&&i.doneDate===today())?`<div class="row"><button class="btn" data-act="printToday">Print today's record</button><button class="btn" data-act="saveToday">Save today's record (PDF)</button></div>`:''}
    ${form?itemForm(form):''}
    ${p.plan.length?phasesFor(p).map(([n,l])=>{const items=p.plan.filter(i=>+i.phase===n);if(!items.length)return '';
      return `<div class="phase"><h3><span class="pill info">Phase ${n}</span>${l}</h3>${items.map(i=>`<div class="item ${i.status==='completed'?'done':''}">
        <span class="tn">${esc(i.tooth||'—')}</span>
        <span class="pr">${esc(i.proc)}${i.surf?`<small>${isAes(p)?'Amount':'Surfaces'}: ${esc(i.surf)}</small>`:''}${i.status==='completed'&&i.doneDate?`<small>Completed ${fmtDate(i.doneDate)}${i.doneBy?' by '+esc(i.doneBy):''}</small>`:''}</span>
        <span class="fee">${money(i.fee)}</span>
        <span class="acts">${i.status==='completed'?`<span class="pill ok">✓ Completed</span><button class="btn small" data-undo="${i.id}">Undo</button>`:`<button class="btn small" data-done="${i.id}">Mark completed</button>`}<span class="spacer"></span><button class="btn small" data-edit="${i.id}">Edit</button><button class="btn small danger" data-del="${i.id}">Remove</button></span>
      </div>`).join('')}</div>`}).join(''):`<div class="empty">No treatment planned yet. Add items here or from the chart.</div>`}
  </section>
  <section class="panel">
    <h3>Patient consent</h3>
    <label class="row small" style="gap:10px"><input type="checkbox" id="consent" ${p.planConsent.agreed?'checked':''} style="width:22px;height:22px"> Plan, options, risks and costs explained; patient agrees to the treatment</label>
    ${p.planConsent.agreed?`<span class="small muted">Agreed on ${fmtDate(p.planConsent.date)}</span>`:''}
  </section>`;
}
function itemForm(f){
  return `<div class="panel" style="background:var(--bg)">
    <h3>${f.id?'Edit item':'New item'}</h3>
    <div class="grid2">
      ${isAes(P())?`<label class="f"><span>Area</span><input type="text" id="it-tooth" value="${esc(f.tooth)}" placeholder="e.g. forehead, lips, full face, scalp"></label>
      <label class="f"><span>Amount / session</span><input type="text" id="it-surf" value="${esc(f.surf)}" placeholder="e.g. 20 units, 1 ml, 2500 grafts, session 2 of 6"></label>`:`<label class="f"><span>Tooth (FDI) or area</span><input type="text" id="it-tooth" value="${esc(f.tooth)}" placeholder="e.g. 26, UL, full mouth"></label>
      <label class="f"><span>Surfaces</span><input type="text" id="it-surf" value="${esc(f.surf)}" placeholder="M O D B L"></label>`}
    </div>
    <label class="f"><span>Treatment</span><select id="it-proc">${procOptions(P(),f.proc)}</select></label>
    <div class="grid2">
      <label class="f"><span>Phase</span><select id="it-phase">${phasesFor(P()).map(([n,l])=>`<option value="${n}" ${+f.phase===n?'selected':''}>${n} · ${l}</option>`).join('')}</select></label>
      <label class="f"><span>Fee (Rs)</span><input type="number" inputmode="numeric" id="it-fee" value="${esc(f.fee)}" min="0" step="1"></label>
    </div>
    <label class="f" style="max-width:280px"><span>${(P()||{}).paperEntry?'<b>Done on</b> – the date written in the paper file':'Already done on (for old or past treatment)'}</span><input type="date" id="it-done" value="${esc(f.status==='completed'?(f.doneDate||''):'')}" max="${today()}"></label>
    <div class="row"><button class="btn primary" data-act="saveItem">Save item</button><button class="btn" data-act="cancelItem">Cancel</button></div>
  </div>`;
}
/* ---- Clinical note templates (RCT with canal lengths) ---- */
const NOTE_TPLS={
  general:['General','C/O: \nMH: reviewed, no changes\nO/E: \nRadiographs: \nDx: \nTx: \nLA: \nPost-op advice given\nNext visit: '],
  rct:['Root canal (RCT)',''],
  ext:['Extraction','C/O: \nMH: reviewed, no changes\nTooth: \nLA: \nProcedure: simple / surgical extraction, socket checked, haemostasis achieved\nPost-op instructions given (verbal and written)\nPrescription: \nNext visit: review if needed'],
  fill:['Filling','Tooth: \nSurfaces: \nLA: \nCaries removed, cavity prepared\nLining / base: \nMaterial: composite / GIC / amalgam, shade: \nOcclusion checked\nNext visit: '],
  scale:['Scaling & polishing','BPE: \nScaling: supragingival / subgingival, ultrasonic + hand\nPolishing done\nOral hygiene instructions given (brushing, interdental cleaning)\nNext visit: recall in 6 months']
};
const RCT_VISITS=['Access & pulp extirpation','Cleaning & shaping','Intracanal medicament change','Obturation','Complete RCT in one visit'];
function canalsFor(t){t=String(t||'');const q=+t[0],n=+t[1];if(!q||!n)return ['Canal 1'];
  const upper=[1,2,5,6].includes(q),prim=q>=5;
  if((!prim&&n>=6)||(prim&&n>=4))return upper?['MB','MB2','DB','P']:['MB','ML','D'];
  if(!prim&&n===4&&upper)return ['B','P'];
  return ['Single canal'];}
function rctTplPanel(p){if(!view.rct||view.rct.pid!==p.id){view.rct={pid:p.id};rctSetTooth(p,'')}const r=view.rct;const rows=r.canals||[];
  return `<div class="rcttpl"><div class="grid3">
    <label class="f"><span>Tooth (FDI)</span><input id="rct-tooth" value="${esc(r.tooth||'')}" placeholder="e.g. 36" maxlength="2" inputmode="numeric"></label>
    <label class="f"><span>Visit</span><select id="rct-visit">${RCT_VISITS.map(v=>`<option ${r.visit===v?'selected':''}>${v}</option>`).join('')}</select></label>
    <label class="f"><span>How measured</span><select id="rct-how">${['Apex locator + radiograph','Apex locator','Radiograph','Tactile'].map(v=>`<option ${r.how===v?'selected':''}>${v}</option>`).join('')}</select></label></div>
    <div class="canaltab"><div class="ch"><span>Canal</span><span>Working length (mm)</span><span>Reference point</span><span>Master apical file</span><span></span></div>
    ${rows.map((c,i)=>`<div class="cr"><input data-rcanal="${i}" data-k="name" value="${esc(c.name)}" aria-label="Canal name"><input data-rcanal="${i}" data-k="wl" value="${esc(c.wl||'')}" inputmode="decimal" placeholder="e.g. 21.5" aria-label="Working length mm"><input data-rcanal="${i}" data-k="ref" value="${esc(c.ref||'')}" placeholder="e.g. MB cusp" aria-label="Reference point"><input data-rcanal="${i}" data-k="maf" value="${esc(c.maf||'')}" placeholder="e.g. #25 / F2" aria-label="Master apical file"><button type="button" class="linkbtn" data-rcdel="${i}" aria-label="Remove canal">✕</button></div>`).join('')}
    </div><div class="row"><button type="button" class="btn small" data-act="rctAddCanal">+ Add canal</button>${r.prev?`<span class="small muted">Lengths from ${fmtDate(r.prev)} filled in</span>`:''}</div>
    <div class="grid3">
      <label class="f"><span>Irrigation</span><input id="rct-irr" value="${esc(r.irr??'NaOCl 2.5%, EDTA 17%, saline')}"></label>
      <label class="f"><span>Intracanal medicament (when indicated)</span><input id="rct-med" value="${esc(r.med??'Calcium hydroxide')}"></label>
      <label class="f"><span>Temporary restoration</span><input id="rct-temp" value="${esc(r.temp??'Secure temporary – GIC / temporary filling material')}"></label>
      <label class="f"><span>Obturation</span><input id="rct-obt" value="${esc(r.obt??'')}" placeholder="e.g. Gutta-percha, lateral condensation, resin sealer"></label>
      <label class="f"><span>Next visit</span><input id="rct-next" value="${esc(r.next??'')}" placeholder="e.g. Obturation in 1 week"></label>
    </div>
    <div class="row"><button type="button" class="btn small primary" data-act="rctInsert">Insert into note</button><span class="small muted">The canal lengths are also kept for this tooth for the next visit.</span></div></div>`;}
function rctRead(){const r=view.rct||(view.rct={});['tooth','visit','how','irr','med','temp','obt','next'].forEach(k=>{const e=$('#rct-'+k);if(e)r[k]=e.value.trim()});return r}
function rctSetTooth(p,t){const r=view.rct||(view.rct={});r.tooth=t;const saved=(p.wl||{})[t];
  if(saved&&saved.canals&&saved.canals.length){r.canals=saved.canals.map(c=>Object.assign({},c));r.prev=saved.date}else{r.canals=canalsFor(t).map(n=>({name:n,wl:'',ref:'',maf:''}));r.prev=''}}
function rctText(r){const c=(r.canals||[]).filter(x=>x.name||x.wl);
  return ['RCT – tooth '+(r.tooth||'?'),'Visit: '+(r.visit||''),
    c.length?'Working length ('+(r.how||'')+'):\n'+c.map(x=>'  • '+x.name+': '+(x.wl?x.wl+' mm':'—')+(x.ref?' (ref. '+x.ref+')':'')+(x.maf?', MAF '+x.maf:'')).join('\n'):'',
    r.irr?'Irrigation: '+r.irr:'',r.med?'Intracanal medicament: '+r.med:'',r.obt?'Obturation: '+r.obt:'',r.temp?'Temporary: '+r.temp:'',r.next?'Next visit: '+r.next:''].filter(Boolean).join('\n')}

/* ---- Prescriptions ---- */
const RX_MEDS={
  'Antibiotics':[
    {name:'Amoxicillin 500 mg capsule',dose:'1 capsule 3 times a day (every 8 hours)',days:'5',note:'',pen:1},
    {name:'Amoxicillin 250 mg capsule',dose:'1–2 capsules 3 times a day',days:'5',note:'',pen:1},
    {name:'Amoxicillin suspension 250 mg / 5 ml (child)',dose:'___ ml 3 times a day (dose by weight)',days:'5',note:'Shake well',pen:1},
    {name:'Co-amoxiclav 625 mg tablet (Amoxicillin + Clavulanic acid)',dose:'1 tablet 2 times a day (every 12 hours)',days:'5',note:'Take at the start of a meal',pen:1},
    {name:'Co-amoxiclav 1 g tablet (Amoxicillin + Clavulanic acid)',dose:'1 tablet 2 times a day (every 12 hours)',days:'5',note:'Take at the start of a meal',pen:1},
    {name:'Co-amoxiclav suspension 228 mg / 5 ml (child)',dose:'___ ml 2 times a day (dose by weight)',days:'5',note:'Shake well',pen:1},
    {name:'Metronidazole 400 mg tablet',dose:'1 tablet 3 times a day (every 8 hours)',days:'5',note:'After meals. No alcohol during and 48 hours after the course'},
    {name:'Metronidazole 200 mg tablet',dose:'1 tablet 3 times a day',days:'5',note:'After meals. No alcohol'},
    {name:'Metronidazole suspension 200 mg / 5 ml (child)',dose:'___ ml 3 times a day (dose by weight)',days:'5',note:'Shake well'},
    {name:'Azithromycin 500 mg tablet',dose:'1 tablet once a day',days:'3',note:'For penicillin allergy. 1 hour before or 2 hours after food'},
    {name:'Azithromycin suspension 200 mg / 5 ml (child)',dose:'___ ml once a day (dose by weight)',days:'3',note:'For penicillin allergy'},
    {name:'Clindamycin 300 mg capsule',dose:'1 capsule 3 times a day (every 8 hours)',days:'5',note:'For penicillin allergy. With a full glass of water. Stop and call if diarrhoea'},
    {name:'Clindamycin 150 mg capsule',dose:'2 capsules 3 times a day',days:'5',note:'For penicillin allergy. Stop and call if diarrhoea'},
    {name:'Cephradine 500 mg capsule',dose:'1 capsule 4 times a day (every 6 hours)',days:'5',note:'',ceph:1},
    {name:'Cefadroxil 500 mg capsule',dose:'1 capsule 2 times a day',days:'5',note:'',ceph:1},
    {name:'Doxycycline 100 mg capsule',dose:'2 capsules on day 1, then 1 capsule once a day',days:'7',note:'Not for pregnancy or children under 12. Take with water, sitting up'}
  ],
  'Pain relief':[
    {name:'Ibuprofen 400 mg tablet',dose:'1 tablet 3 times a day after meals',days:'3',note:'Not with stomach ulcer, asthma or kidney disease'},
    {name:'Ibuprofen 600 mg tablet',dose:'1 tablet 3 times a day after meals',days:'3',note:'Not with stomach ulcer, asthma or kidney disease'},
    {name:'Paracetamol 500 mg tablet',dose:'2 tablets every 6 hours when needed (max 8 tablets a day)',days:'3',note:''},
    {name:'Paracetamol suspension 120 mg / 5 ml (child)',dose:'___ ml every 6 hours when needed (dose by weight)',days:'3',note:''},
    {name:'Diclofenac sodium 50 mg tablet',dose:'1 tablet 2–3 times a day after meals',days:'3',note:'Not with stomach ulcer, asthma or kidney disease'},
    {name:'Mefenamic acid 500 mg tablet',dose:'1 tablet 3 times a day after meals',days:'3',note:''},
    {name:'Naproxen 500 mg tablet',dose:'1 tablet 2 times a day after meals',days:'3',note:''}
  ],
  'Mouth & stomach':[
    {name:'Chlorhexidine 0.12% mouthwash',dose:'Rinse 10 ml for 1 minute, 2 times a day',days:'7',note:'Start the day after extraction. No food or drink for 30 minutes after'},
    {name:'Warm salt-water rinses',dose:'Rinse gently 4 times a day',days:'5',note:'Start the day after extraction'},
    {name:'Omeprazole 20 mg capsule',dose:'1 capsule once a day before breakfast',days:'5',note:'Stomach protection'},
    {name:'Benzydamine mouthwash / spray',dose:'Rinse or spray 3 times a day',days:'5',note:'For sore mouth / ulcers'},
    {name:'Triamcinolone oral paste',dose:'Apply a thin layer on the ulcer 2–3 times a day',days:'5',note:''}
  ]
};
const RX_SETS=[
  ['Dental abscess',['Amoxicillin 500 mg capsule','Metronidazole 400 mg tablet','Ibuprofen 400 mg tablet']],
  ['Abscess – strong',['Co-amoxiclav 625 mg tablet (Amoxicillin + Clavulanic acid)','Metronidazole 400 mg tablet','Ibuprofen 400 mg tablet']],
  ['Penicillin allergy',['Clindamycin 300 mg capsule','Ibuprofen 400 mg tablet']],
  ['Penicillin allergy (Azithro)',['Azithromycin 500 mg tablet','Metronidazole 400 mg tablet','Paracetamol 500 mg tablet']],
  ['After extraction',['Ibuprofen 400 mg tablet','Paracetamol 500 mg tablet','Chlorhexidine 0.12% mouthwash','Warm salt-water rinses']],
  ['After RCT / pain',['Ibuprofen 400 mg tablet','Paracetamol 500 mg tablet']]
];
const RX_ADVICE='Complete the full course of antibiotics, even if you feel better.\nTake pain tablets after food.\nCall the clinic if swelling increases, you have a fever or difficulty swallowing or breathing.';
const rxFind=n=>{for(const g in RX_MEDS){const m=RX_MEDS[g].find(x=>x.name===n);if(m)return m}return null};
function penAllergy(p){const a=((p.mh||{}).answers||{}).allergy;return !!(a&&a.v==='y'&&/penic|amox|augment|ampic|co-?amox/i.test(a.d||''))}
function allergyText(p){const ans=(p.mh||{}).answers||{};const a=ans.allergy||ans.a_allergy;return a&&a.v==='y'?(a.d||'Yes – details not written'):''}
function rxNew(){return {id:'',date:today(),items:[],advice:RX_ADVICE,diag:''}}
function rxTab(p){
  p.rx=p.rx||[];if(!view.rxDraft||(view.rxDraft.pid&&view.rxDraft.pid!==p.id))view.rxDraft=rxNew();view.rxDraft.pid=p.id;const d=view.rxDraft;const al=allergyText(p);const pen=penAllergy(p);const ro=isAcct()||readOnly();
  const list=p.rx.map((r,i)=>[r,i]).sort((a,b)=>String(b[0].date).localeCompare(String(a[0].date))||(b[0].at||0)-(a[0].at||0)||b[1]-a[1]).map(x=>x[0]); // newest first; same day: last saved first
  return `${al?`<div class="msg ${pen?'err':'warn'}"><b>Allergy:</b> ${esc(al)}${pen?' – do not prescribe penicillins (Amoxicillin, Co-amoxiclav). Use the penicillin-allergy options.':''}</div>`:''}
  ${ro?'':`<section class="panel rxpanel"><div class="row"><h2 style="margin:0">${d.id?'Edit prescription':'New prescription'}</h2><span class="spacer"></span>${d.id?'<button class="btn small" data-act="rxCancel">Cancel edit</button>':''}</div>
    <div class="grid2"><label class="f"><span>Date</span><input type="date" id="rx-date" value="${esc(d.date||today())}"></label>
      <label class="f"><span>Diagnosis (optional)</span><input id="rx-diag" value="${esc(d.diag||'')}" placeholder="e.g. Acute apical abscess 36"></label></div>
    <div class="rxsets"><b class="small">Ready sets</b><div class="row" style="gap:6px">${RX_SETS.map((s,i)=>`<button type="button" class="btn small ${pen&&s[1].some(n=>(rxFind(n)||{}).pen)?'rxwarn':''}" data-rxset="${i}">${esc(s[0])}</button>`).join('')}</div></div>
    ${Object.entries(RX_MEDS).map(([g,ms])=>`<details class="rxgroup" ${g==='Antibiotics'?'open':''}><summary><b>${g}</b> <span class="small muted">tap to add</span></summary><div class="rxchips">${ms.map((m,i)=>`<button type="button" class="rxchip ${pen&&m.pen?'rxwarn':''}" data-rxadd="${esc(g)}|${i}"><b>${esc(m.name)}</b><span>${esc(m.dose)} · ${esc(m.days)} days</span></button>`).join('')}</div></details>`).join('')}
    <div class="rxitems">${d.items.length?d.items.map((it,i)=>`<div class="rxitem"><em>${i+1}</em><div class="rxf">
        <input data-rxf="${i}" data-k="name" value="${esc(it.name)}" placeholder="Medicine and strength" aria-label="Medicine">
        <div class="grid3"><input data-rxf="${i}" data-k="dose" value="${esc(it.dose)}" placeholder="How to take" aria-label="How to take"><input data-rxf="${i}" data-k="days" value="${esc(it.days)}" placeholder="Days" aria-label="Days" inputmode="numeric"><input data-rxf="${i}" data-k="note" value="${esc(it.note||'')}" placeholder="Note (optional)" aria-label="Note"></div></div>
        <button type="button" class="linkbtn" data-rxdel="${i}" aria-label="Remove">✕</button></div>`).join(''):'<div class="empty">Tap a ready set or a medicine above, or add your own.</div>'}
      <div class="row"><button type="button" class="btn small" data-act="rxBlank">+ Add own medicine</button></div></div>
    <label class="f"><span>Advice for the patient</span><textarea id="rx-advice" rows="3">${esc(d.advice||'')}</textarea></label>
    <p class="small muted" style="margin:0">Ready doses are common adult doses – check them for each patient (age, weight, pregnancy, kidney/liver disease, other medicines) and change them if needed.</p>
    <div class="row"><button class="btn primary" data-act="rxSave">Save prescription</button><button class="btn" data-act="rxSavePrint">${icon('doc')} Save & print</button><button class="btn" data-act="rxSaveOpen">Save & open file</button></div>
  </section>`}
  <section class="panel"><h2>Prescriptions</h2>
    ${list.length?list.map(r=>`<div class="rxsaved"><div class="row"><b>${fmtDate(r.date)}</b>${r.diag?`<span class="small muted">${esc(r.diag)}</span>`:''}<span class="spacer"></span><span class="small muted">${esc(r.by||'')}</span></div>
      <ol>${r.items.map(it=>`<li><b>${esc(it.name)}</b> – ${esc(it.dose)}${it.days?' – '+esc(it.days)+' days':''}${it.note?` <span class="muted">(${esc(it.note)})</span>`:''}</li>`).join('')}</ol>
      <div class="row"><button class="btn small primary" data-rxprint="${r.id}">${icon('doc')} Print</button><button class="btn small" data-rxsavepdf="${r.id}">Save PDF</button><button class="btn small" data-rxopen="${r.id}">Open file</button>${ro?'':`<button class="btn small" data-rxedit="${r.id}">Edit</button><button class="btn small" data-rxcopy="${r.id}">Copy as new</button><button class="btn small danger" data-rxremove="${r.id}">Delete</button>`}</div></div>`).join(''):'<div class="empty">No prescriptions yet.</div>'}
  </section>`;
}
function rxRead(){const d=view.rxDraft;if(!d)return;const g=k=>{const e=$('#rx-'+k);return e?e.value:undefined};
  if(g('date')!==undefined)d.date=g('date');if(g('diag')!==undefined)d.diag=g('diag').trim();if(g('advice')!==undefined)d.advice=g('advice')}
function rxSave(p){rxRead();const d=view.rxDraft;d.items=d.items.map(x=>({name:String(x.name||'').trim(),dose:String(x.dose||'').trim(),days:String(x.days||'').trim(),note:String(x.note||'').trim()})).filter(x=>x.name);
  if(!d.items.length){toast('Add at least one medicine');return null}
  if(penAllergy(p)&&d.items.some(x=>/amoxi|co-?amox|augment|ampic|penic/i.test(x.name))&&!confirm('This patient is allergic to penicillin, and this prescription contains a penicillin. Save anyway?'))return null;
  p.rx=p.rx||[];let r;if(d.id){r=p.rx.find(x=>x.id===d.id);Object.assign(r,{date:d.date,diag:d.diag,items:d.items,advice:d.advice,editedBy:me.name})}
  else{r={id:uid(),at:Date.now(),date:d.date||today(),diag:d.diag,items:d.items,advice:d.advice,by:me.name,byPmdc:me.pmdc||''};p.rx.push(r)}
  save();view.rxDraft=rxNew();
  if(!d.id&&pharmOn())notifyUnit('pharmacy','New prescription for '+p.first+' '+p.last+': '+r.items.map(x=>x.name).join(', '),p.id);
  return r}
function rxPdf(p,r,mode){
  if(!window.jspdf){toast('The PDF tool did not load. Check your internet and reload the page.');return}
  const P=pdfBase('Prescription');const {doc,W,M,CW,st,clean,C,ensure,kv}=P;
  const ag=age(p.dob);
  kv('Patient',p.first+' '+p.last,M,80);kv('Age / sex',[ag!==''?ag+' years':'',p.sex==='F'?'Female':p.sex==='M'?'Male':''].filter(Boolean).join(' · ')||'—',M+82,40);kv('Date',fmtDate(r.date),M+126,40);st.y+=12;
  if(r.diag){kv('Diagnosis',r.diag,M,CW);st.y+=12}
  doc.setDrawColor(...C.LINE);doc.line(M,st.y,W-M,st.y);st.y+=10;
  doc.setFont('times','bolditalic');doc.setFontSize(26);doc.setTextColor(...C.ACC);doc.text('Rx',M,st.y);st.y+=8;
  r.items.forEach((it,i)=>{ensure(18);doc.setFont('helvetica','bold');doc.setFontSize(11);doc.setTextColor(...C.INK);
    const nl=doc.splitTextToSize(clean((i+1)+'.  '+it.name),CW-6);doc.text(nl,M+2,st.y);st.y+=nl.length*5;
    doc.setFont('helvetica','normal');doc.setFontSize(10);doc.setTextColor(...C.INK);
    const dl=doc.splitTextToSize(clean(it.dose+(it.days?'   –   for '+it.days+' days':'')),CW-10);doc.text(dl,M+8,st.y);st.y+=dl.length*4.8;
    if(it.note){doc.setFontSize(9);doc.setTextColor(...C.MUT);const ml=doc.splitTextToSize(clean(it.note),CW-10);doc.text(ml,M+8,st.y);st.y+=ml.length*4.4}
    st.y+=3.5});
  if(r.advice){ensure(24);st.y+=3;doc.setFont('helvetica','bold');doc.setFontSize(9);doc.setTextColor(...C.ACC);doc.text('ADVICE',M,st.y);st.y+=5;doc.setFont('helvetica','normal');doc.setFontSize(9.5);doc.setTextColor(...C.INK);
    const al2=doc.splitTextToSize(clean(r.advice),CW);doc.text(al2,M,st.y);st.y+=al2.length*4.6}
  st.y=Math.max(st.y+16,240);if(st.y>262){doc.addPage();st.y=40}doc.setDrawColor(...C.INK);doc.line(W-M-75,st.y,W-M,st.y);doc.setFontSize(8.5);doc.setTextColor(...C.MUT);
  doc.text('Dentist signature & stamp',W-M-75,st.y+4.5);doc.setTextColor(...C.INK);doc.setFont('helvetica','bold');doc.text(clean(r.by||me.name),W-M-75,st.y+9.5);doc.setFont('helvetica','normal');
  if(r.byPmdc)doc.text(clean('PMDC No. '+r.byPmdc),W-M-75,st.y+14);
  const pages=doc.getNumberOfPages();for(let i=1;i<=pages;i++){doc.setPage(i);doc.setFontSize(7.5);doc.setTextColor(...C.MUT);doc.text(clean(clinic.name)+' – prescription for '+clean(p.first+' '+p.last),M,290);doc.text('Page '+i+' of '+pages,W-M,290,{align:'right'})}
  return deliverFile(doc.output('blob'),('Prescription_'+p.first+'_'+p.last+'_'+r.date+'.pdf').replace(/[^\w.\-]+/g,'_'),mode);
}


/* ---------- Visits: one card per visit date (notes, treatment done, prescription, payments) ---------- */
const VISIT_TYPES=['Examination','Emergency','Treatment','Hygiene','Review','Phone call','Other'];
function visitDates(p){
  const m={};const add=(d,k,x)=>{if(!d)return;(m[d]=m[d]||{notes:[],done:[],rx:[],pay:[]})[k].push(x)};
  (p.notes||[]).forEach(n=>add(n.date,'notes',n));
  (p.plan||[]).forEach(i=>{if(i.status==='completed'&&i.doneDate&&!/^Previous balance/.test(i.proc||''))add(i.doneDate,'done',i)});
  (p.rx||[]).forEach(r=>add(r.date,'rx',r));
  (payList||[]).forEach(x=>add(x.paid_on,'pay',x));
  return m;
}
function lastVisit(p){
  const m=visitDates(p);const ds=Object.keys(m).filter(d=>d<=today()&&(m[d].notes.length||m[d].done.length)).sort().reverse();
  return ds.length?{date:ds[0],v:m[ds[0]]}:null;
}
function visitForm(p){
  const e=view.visitEdit;const n=e.id?(p.notes||[]).find(x=>x.id===e.id):null;
  const date=e.date||today();
  const items=(p.plan||[]).filter(i=>(i.status==='completed'&&i.doneDate===date)||i.status!=='completed');
  const ticked=i=>i.status==='completed'&&i.doneDate===date;
  const tpl=Object.entries(NOTE_TPLS).filter(([k])=>k!=='rct');
  return `<section class="panel" id="visitForm">
    <h2>${n?'Edit visit note':'New visit note'}</h2>
    <div class="grid2">
      <label class="f"><span>Date</span><input type="date" id="vn-date" value="${esc(date)}"></label>
      <label class="f"><span>Visit type</span><select id="vn-title">${VISIT_TYPES.map(o=>`<option ${((n&&n.title)||e.title||'Treatment')===o?'selected':''}>${o}</option>`).join('')}</select></label>
    </div>
    ${items.length?`<div class="f"><span>Treatment done on this date (from the treatment plan)</span><div class="vtl">${items.map(i=>`<label class="row small" style="gap:8px;align-items:center"><input type="checkbox" data-vtreat="${i.id}" ${ticked(i)?'checked':''} style="width:20px;height:20px"> ${i.tooth?esc(i.tooth)+' – ':''}${esc(i.proc)}${i.surf?' ('+esc(i.surf)+')':''}</label>`).join('')}</div></div>`:''}
    <label class="f"><span>Note</span><textarea id="vn-text" rows="7" placeholder="C/O: \nO/E: \nDx: \nTx: \nNext visit: ">${esc(n?n.text:(e.text||''))}</textarea></label>
    <div class="tplrow"><b class="small">Template</b>${tpl.map(([k,v])=>`<button type="button" class="btn small" data-vtpl="${k}">${v[0]}</button>`).join('')}</div>
    <div class="row"><button class="btn primary" data-act="visitSave">Save</button><button class="btn" data-act="visitCancel">Cancel</button><span class="spacer"></span>${n?'<button class="btn danger small" data-act="visitDel">Delete note</button>':''}</div>
    ${n&&(n.editedAt||n.by)?`<p class="small muted" style="margin:0">${n.editedAt?'Last edited '+esc(new Date(n.editedAt).toLocaleString('en-GB',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}))+' by '+esc(n.editedBy||''):'Written by '+esc(n.by||'')}</p>`:''}
  </section>`;
}
function visitsTab(p){
  const m=visitDates(p);const ds=Object.keys(m).sort().reverse();const can=!isAcct();
  const money_=x=>typeof money==='function'?money(x):x;
  return `${can&&!view.visitEdit?`<section class="panel"><div class="row"><b>Visits</b><span class="spacer"></span><button class="btn primary small" data-act="visitNew" data-date="${today()}">+ Note for today</button></div><p class="small muted" style="margin:0">Everything done on one day is shown together. Tap <b>Edit</b> to change a note.</p></section>`:''}
  ${view.visitEdit&&can?visitForm(p):''}
  ${ds.length?ds.map(d=>{const v=m[d];const title=(v.notes[0]&&v.notes[0].title)||(v.done.length?'Treatment':v.rx.length?'Prescription':'Payment');
    return `<section class="panel visitcard${d===today()?' vtoday':''}"><div class="row" style="align-items:center"><b>${fmtDate(d)} · ${esc(title)}</b><span class="spacer"></span>${d===today()?'<span class="chip" style="min-height:24px;font-size:.72rem">Today</span>':''}</div>
      ${v.done.map(i=>`<div class="small">🦷 ${i.tooth?esc(i.tooth)+' – ':''}${esc(i.proc)}${i.surf?' ('+esc(i.surf)+')':''}${i.doneBy?` <span class="muted">· ${esc(i.doneBy)}</span>`:''}</div>`).join('')}
      ${v.rx.map(r=>`<div class="small">💊 Prescription: ${esc((r.items||[]).map(x=>x.name).join(', '))}</div>`).join('')}
      ${v.pay.map(x=>`<div class="small">💰 Paid ${esc(String(money_(x.amount)))}${x.method?' · '+esc(x.method):''}</div>`).join('')}
      ${v.notes.map(n=>`<div class="vnote"><div class="small muted">${esc(n.title||'')}${n.by?' · '+esc(n.by):''}${n.editedAt?' · edited':''}</div><div class="t" style="white-space:pre-wrap;overflow-wrap:anywhere">${esc(n.text)}</div>${can?`<button class="btn small" data-act="visitEdit" data-nid="${n.id}">✎ Edit</button>`:''}</div>`).join('')}
      <div class="row">${can?`<button class="btn small" data-act="visitNew" data-date="${d}">+ Note</button>`:''}<button class="btn small" data-vprint="${d}">Print</button></div></section>`}).join(''):'<div class="empty">No visits yet.</div>'}`;
}
function notesTab(p){
  const ns=[...p.notes].sort((a,b)=>b.date.localeCompare(a.date));
  return `<section class="panel">
    <h2>Print visit record</h2>
    ${balToggle()}
    <p class="small muted" style="margin:0">A PDF of the treatment done that day, clinical notes, medical alerts, chart findings and what is still planned, with signature lines. On a phone, choose Print or Save to Files in the share sheet. On a computer, Print opens the PDF and Save PDF downloads it.</p>
    <div class="row"><input type="date" id="pr-date" value="${today()}" style="max-width:180px"><button class="btn primary" data-act="printRecord">Print record</button><button class="btn" data-act="saveRecord">Save PDF</button><button class="btn" data-act="openRecord">Open file</button></div>
  </section>
  <section class="panel">
    <h2>New clinical note</h2>
    <div class="grid2">
      <label class="f"><span>Date</span><input type="date" id="n-date" value="${today()}"></label>
      <label class="f"><span>Visit type</span><select id="n-title">${['Examination','Emergency','Treatment','Hygiene','Review','Phone call','Other'].map(o=>`<option>${o}</option>`).join('')}</select></label>
    </div>
    <label class="f"><span>Note</span><textarea id="n-text" rows="6" placeholder="C/O: \nO/E: \nDx: \nTx: \nNext visit: "></textarea></label>
    <div class="tplrow"><b class="small">Template</b>${Object.entries(NOTE_TPLS).map(([k,v])=>`<button type="button" class="btn small ${view.noteTpl===k?'primary':''}" data-ntpl="${k}">${v[0]}</button>`).join('')}</div>
    ${view.noteTpl==='rct'?rctTplPanel(p):''}
    <div class="row"><span class="spacer"></span><button class="btn primary" data-act="addNote">Save note</button></div>
  </section>
  <section class="panel">
    <h2>Treatment history</h2>
    ${ns.length?`<div class="tl">${ns.map(n=>`<div class="ev"><div class="d">${fmtDate(n.date)} · ${esc(n.title)}${n.by?' · '+esc(n.by):''}</div><div class="t">${esc(n.text)}</div></div>`).join('')}</div>`:'<div class="empty">No notes yet.</div>'}
  </section>`;
}

/* ---------- forms (login, clinic, account) ---------- */
function busy(form,on){form.querySelectorAll('button,input').forEach(el=>el.disabled=on)}
document.addEventListener('submit',async e=>{
  e.preventDefault();const f=e.target;const v=id=>($('#'+id)?$('#'+id).value.trim():'');
  view.msg=null;busy(f,true);
  try{
    if(f.id==='ownerForm'){const c=$('#own-code').value.trim();view.ownerTries=(view.ownerTries||0)+1;
      if(view.ownerTries>8){view.ownerErr='Too many tries. Reload the page to try again.';render();return}
      if(/^\d{8}$/.test(c)&&await ownerHash(c)===OWNER.h){view.ownerOk=true;view.ownerErr='';view.ownerTries=0;render()}
      else{view.ownerErr='Wrong owner code.';render();const i=$('#own-code');if(i){i.value='';i.focus()}}
      return}
    if(f.id==='ownerErase'){if(!view.ownerOk||!LOCAL||OWNER_TEST)return;if(v('own-erase')!=='ERASE')throw new Error('Type ERASE in capital letters to confirm.');
      await window.__LOCAL_DB.wipeAll();try{Object.keys(localStorage).filter(k=>k.startsWith('offline:')).forEach(k=>localStorage.removeItem(k))}catch(e){}
      alert('All clinics on this device were erased. The app will start fresh.');location.href=location.pathname;return}
    if(f.id==='bookingForm'){const hours={};for(const [d] of BK_DAYS){const on=document.querySelector('[data-bkopen="'+d+'"]');if(on&&on.checked){const a=$('#bk-from-'+d).value,z=$('#bk-to-'+d).value;if(!a||!z||a>=z)throw new Error('Check the opening hours – closing time must be after opening time.');hours[d]=[a,z]}}
      if($('#bk-offfrom').value&&$('#bk-offto').value){const a0=$('#bk-offfrom').value,z0=$('#bk-offto').value;const cur=String($('#bk-off').value||'').split(',').filter(Boolean);let dt=new Date(a0+'T12:00:00');let n=0;while(dt<=new Date(z0+'T12:00:00')&&n<62){cur.push(dt.toISOString().slice(0,10));dt.setDate(dt.getDate()+1);n++}bkOffSet(cur)}
      const off=[...new Set(String($('#bk-off').value||'').split(',').map(x=>x.trim()).filter(x=>/^\d{4}-\d{2}-\d{2}$/.test(x)&&x>=today()))].sort();
      const cfg={enabled:$('#bk-on').checked,slot:+$('#bk-slot').value,chairs:+$('#bk-chairs').value,days:+$('#bk-days').value,tz:300,hours,off,offNote:String($('#bk-offnote').value||'').trim().slice(0,120),holext:$('#bk-holext').checked};
      if(cfg.enabled&&!Object.keys(hours).length)throw new Error('Tick at least one opening day.');
      const upd={booking:cfg};if(!booking.code)upd.booking_code=newBookingCode();
      const {error}=await sb.from('clinics').update(upd).eq('id',clinic.id);if(error)throw error;
      booking.cfg=Object.assign({},BK_DEFAULT,cfg);if(upd.booking_code)booking.code=upd.booking_code;render();toast(cfg.enabled?'Online booking is on – print your QR poster':'Online booking saved (off)');return}
    if(f.id==='salForm'){const sf=earn.salForm;if(!sf)return;const month=(earn.anchor||today()).slice(0,7);
      const amt=Math.max(0,Math.round(parseFloat($('#sl-amt').value)||0));if(!(amt>0))throw new Error('Enter the amount paid.');
      const method=(document.querySelector('input[name=sl-method]:checked')||{}).value||'Cash';
      const ex=finOf('salary').find(x=>x.data.staff_id===sf.staff_id&&x.data.month===month);
      await finSave('salary',{staff_id:sf.staff_id,month,amount:amt,status:'paid',paid_on:$('#sl-date').value||today(),method,ref:$('#sl-ref').value.trim()},ex&&ex.id);
      earn.salForm=null;render();toast('Salary marked as paid – tap Receipt to print');return}
    if(f.id==='expForm'){const x=readExpForm();const amt=Math.round(parseFloat(x.amount)||0);
      if(!(amt>0))throw new Error('Enter the amount.');if(!x.date)throw new Error('Choose the date.');
      if(x.cat==='Materials'&&!x.item)throw new Error('Write the material name.');
      await finSave('expense',{date:x.date,cat:x.cat,lab:x.cat==='Lab charges'?x.lab:'',item:x.item,pat:x.cat==='Lab charges'?x.pat:'',amount:amt,note:x.note,method:x.method});
      earn.expForm={date:x.date,cat:x.cat,method:x.method};render();toast('Expense saved');return}
    if(f.id==='staffForm'){const g=id=>($('#'+id)||{}).value||'';const name=g('sf-name').trim();if(!name)throw new Error('Write the name.');
      const data={name,role:g('sf-role'),roleName:g('sf-rolename').trim(),pay:g('sf-pay'),salary:Math.max(0,Math.round(parseFloat(g('sf-salary'))||0)),percent:Math.min(100,Math.max(0,parseFloat(g('sf-pct'))||0)),active:true};
      if(data.pay==='percent'&&!data.percent)throw new Error('Enter the percentage.');
      const e2=earn.staffEdit?finOf('staff').find(r=>r.id===earn.staffEdit):null;
      await finSave('staff',e2?Object.assign({},e2.data,data):data,e2&&e2.id);earn.staffEdit=null;earn.staffNew=false;render();toast('Staff saved');return}
    if(f.id==='dentPayForm'){const name=earn.dentist;if(!name)return;const type=(document.querySelector('input[name=dp-type]:checked')||{}).value||'fixed';
      const salary=Math.max(0,Math.round(parseFloat($('#dp-salary').value)||0)),percent=Math.min(100,Math.max(0,parseFloat($('#dp-pct').value)||0));
      if(type==='percent'&&!percent)throw new Error('Enter the percentage.');
      const ex=staffFor(name);await finSave('staff',Object.assign({},ex?ex.data:{},{name,role:'Dentist',pay:type,salary,percent,active:true}),ex&&ex.id);render();toast('Pay saved for '+name);return}
    if(f.id==='earnLock'){const pin=$('#earn-pin').value.trim();const mp=myPin();
      if(!mp){earn.mode='set';render();return}
      if(earn.tries>=5){earn.err='Too many wrong tries. Set a new PIN with your login password.';earn.mode='set';earn.tries=0;render();return}
      if(await pinHash(pin,mp.s)===mp.h){earn.unlockedAt=Date.now();earn.err='';earn.tries=0;Sound.play&&Sound.play('success');render();loadEarn()}
      else{earn.tries++;earn.err='Wrong PIN. Try again.';render();const i=$('#earn-pin');if(i)i.focus()}
      return}
    if(f.id==='earnSetPin'){const pw=$('#ep-pw').value,a=$('#ep-new').value.trim(),b2=$('#ep-new2').value.trim();
      if(!/^\d{4,6}$/.test(a)){earn.err='The PIN must be 4 to 6 numbers.';render();return}
      if(a!==b2){earn.err='The two PINs are not the same.';render();return}
      earn.busy=true;earn.err='';render();
      try{const r=await sb.auth.signInWithPassword({email:user.email,password:pw});if(r.error)throw new Error('Wrong login password.');
        const salt=[...crypto.getRandomValues(new Uint8Array(12))].map(x=>x.toString(16).padStart(2,'0')).join('');
        const {data,error}=await sb.auth.updateUser({data:{earn_pin:{s:salt,h:await pinHash(a,salt)}}});if(error)throw error;
        if(data&&data.user)user=data.user;earn.mode='';earn.unlockedAt=Date.now();earn.busy=false;toast('Earnings PIN saved');render();loadEarn()}
      catch(e2){earn.busy=false;earn.err=e2.message==='Wrong login password.'?e2.message:friendly(e2);render()}
      return}
    if(f.id==='loginForm'){
      view.email=v('li-email');
      if(!v('li-email')||!$('#li-pw').value)throw new Error('Enter your email and password.');
      const {data,error}=await sb.auth.signInWithPassword({email:v('li-email'),password:$('#li-pw').value});if(error)throw error;
      user=data.user;showWelcome=true;await afterLogin();return;
    }
    if(f.id==='signupForm'){
      if(!v('su-name'))throw new Error('Enter your name.');
      if($('#su-pw').value.length<8)throw new Error('Password must be at least 8 characters.');
      const {data,error}=await sb.auth.signUp({email:v('su-email'),password:$('#su-pw').value,options:{data:{full_name:v('su-name'),pmdc:v('su-pmdc')},emailRedirectTo:location.origin+location.pathname}});
      if(error)throw error;
      if(!data.session){view.email=v('su-email');view.authTab='login';view.msg={t:'ok',m:'Account created. Check your email and tap the confirmation link, then log in.'};render();return}
      user=data.user;showWelcome=true;await afterLogin();return;
    }
    if(f.id==='newpwForm'){
      if($('#np-pw').value.length<8)throw new Error('Password must be at least 8 characters.');
      const {data,error}=await sb.auth.updateUser({password:$('#np-pw').value});if(error)throw error;
      recovering=false;history.replaceState(null,'',location.pathname);user=data.user;toast('Password saved');await afterLogin();return;
    }
    if(f.id==='createForm'){
      if(!v('cc-name'))throw new Error('Enter the clinic name.');
      const {data,error}=await sb.rpc('create_clinic',{p_name:v('cc-name'),p_address:v('cc-address'),p_phone:v('cc-phone'),p_my_name:v('cc-me'),p_code:LOCAL?null:v('cc-code')});if(error)throw error;
      await sb.from('clinics').update({reg_body:$('#cc-regbody').value,reg_no:v('cc-regno'),ntn:v('cc-ntn')}).eq('id',data);
      if(v('cc-pmdc'))await sb.rpc('set_my_pmdc',{p_clinic:data,p_pmdc:v('cc-pmdc')});
      let rc=null;if(LOCAL){const r=await sb.rpc('new_recovery_code',{p_clinic:data});rc=r.data}
      const fac=($('#cc-fac')||{}).value||'dental_clinic';
      const hOpt={ds:[...document.querySelectorAll('[data-cdept]')].filter(x=>x.checked).map(x=>x.dataset.cdept),ph:$('#cc-pharm')?$('#cc-pharm').checked:true,lb:$('#cc-lab')?$('#cc-lab').checked:true};
      showWelcome=!rc;await afterLogin(data);
      try{if(fac==='dental_hospital'){const hu=hospUnits();hu.units.pharmacy=hOpt.ph;hu.units.lab=hOpt.lb;await saveBranding(Object.assign({facility:fac,depts:(hOpt.ds.length?hOpt.ds:DENTAL_DEPTS.slice())},hu))}else await saveBranding({facility:fac})}catch(e2){}if(rc){view.recoveryCode=rc;view.screen='recovery';render()}else toast(fac==='dental_hospital'?'Hospital created':'Clinic created');return;
    }
    if(f.id==='joinForm'){
      if(!v('jc-code'))throw new Error('Enter the invite code.');
      const {data,error}=await sb.rpc('join_clinic',{p_code:v('jc-code'),p_my_name:v('jc-me')});if(error)throw error;
      if(v('jc-pmdc'))await sb.rpc('set_my_pmdc',{p_clinic:data,p_pmdc:v('jc-pmdc')});
      showWelcome=true;await afterLogin(data);toast('You joined the clinic');return;
    }
    if(f.id==='msgForm'){
      const txt=$('#msg-text').value.trim();if(!txt)throw new Error('Write a message first.');
      view.msgTo=$('#msg-to').value;await sendMessage(view.msgTo,txt);render();const cl=$('#chatList');if(cl)cl.scrollTop=cl.scrollHeight;toast('Message sent');return;
    }
    if(f.id==='activateForm'){
      const {error}=await sb.rpc('activate',{p_clinic:clinic.id,p_key:$('#act-key').value});if(error)throw error;
      await refreshClinic();await loadPatients();toast('Activated – thank you!');
    }
    if(f.id==='recoverForm'){
      view.email=v('rv-user');view.rvCode=v('rv-code');
      await window.__LOCAL_DB.recover(v('rv-user'),v('rv-code'),$('#rv-pw').value);
      view.email=v('rv-user').toLowerCase();view.rvCode='';view.showRecover=false;view.msg={t:'ok',m:'Password changed. Log in with your new password.'};render();return;
    }
    if(f.id==='ownerCodeForm'){
      const {data,error}=await sb.rpc('owner_make_signup_code',{p_note:v('oc-note')});if(error)throw error;
      view.ocNew=data;view.ocErr='';await loadSignupCodes();toast('Code made');
    }
    if(f.id==='inviteForm'){
      const unit=$('#iv-unit').value,em=v('iv-email');
      const {error}=await sb.rpc('invite_staff',{p_clinic:clinic.id,p_email:em,p_unit:unit||null,p_name:v('iv-name')||null});
      if(error){if(/invite_staff|schema cache|does not exist/i.test(String(error.message||'')))throw new Error('Run the new SQL file “supabase-update-invites.sql” in Supabase first (SQL Editor → paste → Run).');throw error}
      if(unit&&!unitsOf()[unit]){const u0=Object.assign({},unitsOf());u0[unit]=true;u0[unit==='lab'?'labSince':'phSince']=Date.now();await saveBranding({units:u0})}
      await loadInvites();toast('Invited '+em.toLowerCase()+'. Only this email can join.');
    }
    if(f.id==='unitLoginForm'){
      const unit=$('#ul-unit').value,nm=v('ul-name');
      if(!unitsOf()[unit]){const u0=Object.assign({},unitsOf());u0[unit]=true;u0[unit==='lab'?'labSince':'phSince']=u0[unit==='lab'?'labSince':'phSince']||Date.now();await saveBranding({units:u0})}
      const {error}=await sb.rpc('add_dentist',{p_clinic:clinic.id,p_name:nm,p_username:v('ul-user'),p_password:$('#ul-pw').value,p_role:'dentist',p_pmdc:''});if(error)throw error;
      await loadTeam();const nu=team.slice().reverse().find(t=>t.name===nm&&t.user_id!==user.id);
      if(nu){const key=unit==='pharmacy'?'pharmaStaff':'labStaff';await deptSave({[key]:staffIds(unit).concat([nu.user_id])})}
      toast(nm+' added. Username: '+v('ul-user').toLowerCase()+' – sees only the '+(unit==='pharmacy'?'pharmacy':'lab')+' list.');
    }
    if(f.id==='addDentistForm'){
      const {error}=await sb.rpc('add_dentist',{p_clinic:clinic.id,p_name:v('ad-name'),p_username:v('ad-user'),p_password:$('#ad-pw').value,p_role:$('#ad-role').value,p_pmdc:v('ad-pmdc')});if(error)throw error;
      await loadTeam();toast(v('ad-name')+' added. Username: '+v('ad-user').toLowerCase());
    }
    if(f.id==='resetPwForm'){
      const {error}=await sb.rpc('admin_reset_password',{p_clinic:clinic.id,p_user:f.dataset.uid,p_password:$('#rp-pw').value});if(error)throw error;
      view.confirm=null;toast('Password changed');
    }
    if(f.id==='oldForm'){
      const v2=id=>($('#'+id)?$('#'+id).value.trim():'');
      if(!v2('op-first'))throw new Error('Enter the patient\'s first name.');
      const age=parseInt(v2('op-age'));let dob=v2('op-dob');if(!dob&&age>0&&age<120)dob=(new Date().getFullYear()-age)+'-01-01';
      const r={first:v2('op-first'),last:v2('op-last'),phone:v2('op-phone'),cnic:v2('op-cnic'),dob,sex:$('#op-sex').value,oldFile:v2('op-file'),since:v2('op-since'),address:v2('op-address'),email:'',history:v2('op-hist'),past:v2('op-notes'),balance:Math.max(0,Math.round(parseFloat(v2('op-bal'))||0))};
      const p=importRowToPatient(r);
      for(let i=0;i<(view.oldRows||3);i++){const proc=$('#or-proc-'+i)&&$('#or-proc-'+i).value;if(!proc)continue;
        p.plan.push({id:uid(),tooth:v2('or-tooth-'+i),proc,surf:'',phase:3,fee:Math.max(0,Math.round(parseFloat(v2('or-fee-'+i))||0)),status:'completed',doneDate:v2('or-date-'+i)||r.since||today(),doneBy:me.name})}
      if(p.notes[0])p.notes[0].text=p.notes[0].text.replace('Past treatment: ','Notes: ');
      const then=(e.submitter&&e.submitter.dataset.then)||'open';
      await importPatients([p]);
      const pastSum=p.plan.filter(i=>i.proc!=='Previous balance (old records)').reduce((a,i)=>a+(+i.fee||0),0);
      if(pastSum>0){const prow={clinic_id:clinic.id,patient_id:p.id,paid_on:r.since||today(),amount:pastSum,discount:0,disc_pct:null,disc_reason:'',method:'Old records',reference:'',note:'Past treatment, paid before using this app',received_by_name:me.name};
        if(LOCAL){prow.received_by=user.id;prow.created_at=new Date().toISOString()}await sb.from('payments').insert(prow);}
      if(then==='open'){view.impOpen=false;view=Object.assign(view,{screen:'patient',pid:p.id,tab:'plan',tooth:null,confirm:null});render();toast('Old patient saved');}
      else{view.oldRows=3;render();const fi=$('#op-first');if(fi)fi.focus();toast(r.first+' saved – add the next patient');}
      return;
    }
    if(f.id==='payForm'){
      const p=P();const r=readPayForm(p);const x=r.f;
      if(!r.amount&&!r.discount)throw new Error('Enter the amount received, or a discount.');
      if(x.method==='Panel / company'&&!String(x.reference||'').trim())throw new Error('Enter the panel company name.');
      if(x.dtype==='pct'&&(parseFloat(x.dval)||0)>100)throw new Error('Discount cannot be more than 100%.');
      const row={clinic_id:clinic.id,patient_id:p.id,paid_on:x.date||today(),amount:r.amount,discount:r.discount,disc_pct:x.dtype==='pct'?(parseFloat(x.dval)||0):null,disc_reason:x.dtype==='none'?'':String(x.dreason||'').trim(),method:x.method,reference:String(x.reference||'').trim(),note:String(x.note||'').trim(),received_by_name:me.name};
      if(LOCAL){row.received_by=user.id;row.created_at=new Date().toISOString()}
      if(dirty.has(p.id))await flush();
      const {error}=await sb.from('payments').insert(row);if(error)throw error;
      view.payForm=null;await loadPayments(p.id);toast('Payment saved – '+money(r.amount)+(r.discount?' + discount '+money(r.discount):''));
    }
    if(f.id==='apptForm'){
      const d=$('#ap-date').value,t=$('#ap-time').value;if(!d||!t)throw new Error('Choose a date and time.');
      const starts=new Date(d+'T'+t);
      view.apptForm={date:d,time:t,reason:$('#ap-reason').value,dur:$('#ap-dur').value,dentist:$('#ap-dentist').value,note:''};
      if(dirty.has(view.pid))await flush();
      const {error}=await sb.from('appointments').insert({clinic_id:clinic.id,patient_id:view.pid,starts_at:starts.toISOString(),duration:+$('#ap-dur').value,reason:$('#ap-reason').value,note:v('ap-note'),dentist_id:$('#ap-dentist').value||null});
      if(error)throw error;await loadPatientAppts(view.pid);toast('Booked for '+fmtDate(d)+' at '+hhmm(starts));
    }
    if(f.id==='clinicForm'){
      if(!v('cl-name'))throw new Error('Clinic name cannot be empty.');
      const {error}=await sb.from('clinics').update({name:v('cl-name'),address:v('cl-address'),phone:v('cl-phone'),reminder_template:$('#cl-tpl').value.trim(),reg_body:$('#cl-regbody').value,reg_no:v('cl-regno'),ntn:v('cl-ntn')}).eq('id',clinic.id);if(error)throw error;
      await refreshClinic();const m=memberships.find(x=>x.clinic_id===clinic.id);if(m)m.clinics=clinic;toast('Clinic details saved');
    }
    if(f.id==='meForm'){
      const {error}=await sb.rpc('rename_me',{p_clinic:clinic.id,p_name:v('me-name')});if(error)throw error;
      const r2=await sb.rpc('set_my_pmdc',{p_clinic:clinic.id,p_pmdc:v('me-pmdc')});if(r2.error)throw r2.error;
      me.name=v('me-name');me.pmdc=v('me-pmdc');const m=memberships.find(x=>x.clinic_id===clinic.id);if(m){m.name=me.name;m.pmdc=me.pmdc}await loadTeam();toast('Details saved');
    }
    if(f.id==='pwForm'){
      if($('#pw-new').value.length<8)throw new Error('Password must be at least 8 characters.');
      const {error}=await sb.auth.updateUser({password:$('#pw-new').value});if(error)throw error;toast('Password changed');
    }
    render();
  }catch(err){view.msg={t:'err',m:friendly(err)};render();}
});

/* ---------- clicks ---------- */
document.addEventListener('click',async e=>{
  const sfEl=e.target.closest('[data-surf]');
  if(sfEl){const p=P(),t=view.tooth,k=sfEl.dataset.surf,mode=view.mode||'caries',mat=view.mat||'comp';
    p.surf[t]=p.surf[t]||{};const cur=p.surf[t][k];
    if(mode==='clear')delete p.surf[t][k];
    else{const nv={t:mode};if(mode==='fill'||mode==='sec')nv.m=mat;
      if(cur&&cur.t===nv.t&&cur.m===nv.m)delete p.surf[t][k];else p.surf[t][k]=nv;}
    if(!Object.keys(p.surf[t]).length)delete p.surf[t];
    save();render();return}
  const b=e.target.closest('button');if(!b)return;
  const p=P(),d=b.dataset;
  if(d.pxprint||d.pxopen){const [pid,rid]=(d.pxprint||d.pxopen).split('|');const pp=db.patients.find(x=>x.id===pid);const rr=pp&&(pp.rx||[]).find(x=>x.id===rid);if(rr){try{await rxPdf(pp,rr,d.pxprint?'print':'open')}catch(err){toast(friendly(err))}}return}
  if(pharmOnly()&&(d.open||d.home==='list'||d.home==='aes'||d.home==='appts'||d.home==='earn')){view.screen='pharm';render();return}
  if(d.pinkey){const i=$('#earn-pin')||$('#own-code');if(i){i.value=d.pinkey==='del'?i.value.slice(0,-1):(i.value+d.pinkey).slice(0,i.maxLength>0?i.maxLength:6);i.focus()}return}
  if(d.earnper){earn.period=d.earnper;render();return}
  if(d.earnnav!==undefined){earnShift(+d.earnnav);render();return}
  if(d.act==='earnCsv'){earnCsv();return}
  if(d.bkaccept){if(b.disabled)return;b.disabled=true;try{await acceptBooking(d.bkaccept);view.bkNotify={id:d.bkaccept,kind:'accepted'};await refreshAppts()}catch(err){toast(friendly(err));b.disabled=false}render();return}
  if(d.bkdecline){if(!confirm('Decline this online booking?\n\nPlease tell the patient by phone or WhatsApp. Next you can send the patient a WhatsApp or SMS that the booking is not confirmed. The booking stays under "All online bookings", where you can restore it.'))return;const {error}=await sb.from('online_bookings').update({status:'declined'}).eq('id',d.bkdecline);if(error){toast(friendly(error));return}
    const x0=booking.all.find(x=>x.id===d.bkdecline);if(x0)x0.status='declined';booking.waiting=booking.waiting.filter(x=>x.id!==d.bkdecline);booking.day=booking.day.filter(x=>x.id!==d.bkdecline);view.bkNotify={id:d.bkdecline,kind:'declined'};render();window.scrollTo(0,0);toast('Booking declined – send the patient a message');return}
  if(d.act==='bkNotifyClose'){view.bkNotify=null;render();return}
  if(d.bknotify){view.bkNotify={id:d.bknotify,kind:d.kind};render();window.scrollTo(0,0);return}
  if(d.bkrestore){const {error}=await sb.from('online_bookings').update({status:'new'}).eq('id',d.bkrestore);if(error){toast(friendly(error));return}
    view.bkHistOpen=true;await loadBookings(view.day||today());render();toast('Booking restored – it is waiting again');return}
  if(d.act==='bkOffClear'){if(!String($('#bk-off').value||'')){toast('There are no holidays to clear');return}if(!confirm('Clear all holidays? Patients can book those days again.'))return;bkOffSet([]);if(await bkOffSave())toast('All holidays cleared');return}
  if(d.act==='bkOffAdd'){const a=$('#bk-offfrom').value,z=$('#bk-offto').value;if(!a||!z){toast('Choose both dates: From and To (for one day, choose the same date twice)');return}if(z<a){toast('"To" must be after "From"');return}
    const cur=String($('#bk-off').value||'').split(',').filter(Boolean);let dt=new Date(a+'T12:00:00');const end=new Date(z+'T12:00:00');let n=0;
    while(dt<=end&&n<62){cur.push(dt.toISOString().slice(0,10));dt.setDate(dt.getDate()+1);n++}
    bkOffSet(cur);['#bk-offfrom','#bk-offto'].forEach(q=>{const e=$(q);e.value='';e.type='text'});if(await bkOffSave())toast(n===1?'Holiday saved – patients see it now':n+' holiday days saved – patients see them now');return}
  if(d.bkoffdel){bkOffSet(String($('#bk-off').value||'').split(',').filter(x=>x&&x!==d.bkoffdel));if(await bkOffSave())toast('Holiday removed');return}
  if(d.act==='bkCopy'){try{await navigator.clipboard.writeText(bookingLink());toast('Link copied')}catch(e){prompt('Copy this link:',bookingLink())}return}
  if(d.act==='bkShare'){const l=bookingLink();if(navigator.share){navigator.share({title:clinic.name+' – book an appointment',text:'Book your appointment at '+clinic.name+':',url:l}).catch(()=>{})}else window.open('https://wa.me/?text='+encodeURIComponent('Book your appointment at '+clinic.name+': '+l),'_blank');return}
  if(d.act==='bkPoster'){try{await bookingPoster()}catch(err){toast(friendly(err))}return}
  if(d.act==='bkNewCode'){if(!confirm('Make a new booking code? The old QR code and link will stop working.'))return;const code=newBookingCode();const {error}=await sb.from('clinics').update({booking_code:code}).eq('id',clinic.id);if(error){toast(friendly(error));return}booking.code=code;render();toast('New QR code made – print the new poster');return}
  if(d.themeset!==undefined){if(!isAdmin())return;if(d.themeset==='custom'){view.themeCustom=true;render();toast('Pick a colour');return}
    try{await saveBranding({theme:d.themeset==='default'?'':d.themeset});view.themeCustom=false;render();toast('Colour changed')}catch(err){toast(friendly(err))}return}
  if(d.bgset!==undefined){if(!isAdmin())return;if(d.bgset==='photo'&&!branding.bgImage){view.bgPhoto=true;render();toast('Choose a photo for the background');return}
    try{await saveBranding(d.bgset==='custom'&&!branding.bgColor?{bg:'custom',bgColor:'#cfe8e5'}:{bg:d.bgset});view.bgPhoto=false;render();toast('Background changed')}catch(err){toast(friendly(err))}return}
  if(d.act==='logoRemove'){try{await saveBranding({logo:''});render();toast('Logo removed')}catch(err){toast(friendly(err))}return}
  if(d.tonetest){Sound.preset(Sound.toneFor(d.tonetest));return}
  if(d.earnsec){earn.sec=d.earnsec;render();return}
  if(d.earntab){earn.tab=d.earntab;earn.staffEdit=null;earn.staffNew=false;render();return}
  if(d.earndent!==undefined){earn.dentist=earn.dentist===d.earndent?'':d.earndent;render();return}
  if(d.act==='earnPdf'){try{await earnPdf(earn.printWhat||'all')}catch(err){toast(friendly(err))}return}
  if(d.act==='printDentist'){try{await earnPdf('dentist',earn.dentist)}catch(err){toast(friendly(err))}return}
  if(d.act==='staffNew'){earn.staffNew=true;earn.staffEdit=null;render();const i=$('#sf-name');if(i)i.focus();return}
  if(d.act==='staffCancel'){earn.staffNew=false;earn.staffEdit=null;render();return}
  if(d.staffedit){earn.staffEdit=d.staffedit;earn.staffNew=false;render();return}
  if(d.staffremove){const r=finOf('staff').find(x=>x.id===d.staffremove);if(!r)return;if(!confirm('Remove '+r.data.name+' from staff? Past salary records stay.'))return;
    try{await finSave('staff',Object.assign({},r.data,{active:false}),r.id);earn.staffEdit=null;render();toast('Removed from staff')}catch(err){toast(friendly(err))}return}
  if(d.salpaid){earn.salForm={staff_id:d.salpaid,amount:d.amt||''};render();const i=$('#sl-amt');if(i)i.focus();return}
  if(d.act==='salCancel'){earn.salForm=null;render();return}
  if(d.paydent){const st=finOf('staff').find(x=>x.id===d.paydent);if(!st)return;earn.tab='staff';earn.salForm={staff_id:st.id,amount:payDue(st,(earn.anchor||today()).slice(0,7))};render();const i=$('#sl-amt');if(i)i.focus();return}
  if(d.expslip){try{await expenseVoucher(d.expslip)}catch(err){toast(friendly(err))}return}
  if(d.salslip){try{await salarySlip(d.salslip)}catch(err){toast(friendly(err))}return}
  if(d.salunpaid){const month=(earn.anchor||today()).slice(0,7);const ex=finOf('salary').find(x=>x.data.staff_id===d.salunpaid&&x.data.month===month);
    if(ex){try{await finSave('salary',Object.assign({},ex.data,{status:'unpaid',paid_on:'',method:'',ref:''}),ex.id);render();toast('Marked as unpaid')}catch(err){toast(friendly(err))}}return}
  if(d.askexpdel){view.confirm='expdel:'+d.askexpdel;render();return}
  if(d.expdel){try{await finDel(d.expdel);view.confirm=null;render();toast('Expense deleted')}catch(err){toast(friendly(err))}return}
  if(d.act==='addPast'){const t=view.tooth;if(!t||!p)return;const proc=$('#pt-proc').value,dt=$('#pt-date').value,fee=Math.max(0,Math.round(parseFloat($('#pt-fee').value)||0));
    if(!dt){toast('Write the date the treatment was done.');$('#pt-date').focus();return}
    if(dt>today()){toast('The date cannot be in the future.');return}
    p.plan.push({id:uid(),tooth:String(t),proc,surf:/^Filling|^Inlay/.test(proc)?$('#pt-surf').value:'',phase:3,fee,status:'completed',doneDate:dt,doneBy:me.name});
    view.pastDate=dt;view.pastProc=null;save();render();toast('Saved: '+proc+' on '+fmtDate(dt));return}
  if(d.act==='ownerOpen'){view.screen='owner';view.ownerOk=false;view.ownerErr='';render();const i=$('#own-code');if(i)i.focus();return}
  if(d.act==='ownerBack'){view.screen='auth';view.ownerOk=false;render();return}
  if(d.act==='ownerTest'){if(!view.ownerOk)return;try{sessionStorage.setItem('ownerTest','1')}catch(e){}location.href=location.pathname;return}
  if(d.act==='ownerExit'){try{sessionStorage.removeItem('ownerTest')}catch(e){}location.href=location.pathname;return}
  if(d.act==='ownerReset'){if(!OWNER_TEST)return;if(!confirm('Delete all test data and start the test clinic fresh?'))return;await window.__LOCAL_DB.wipeAll();lsSet('ownerPw','');location.reload();return}
  if(d.act==='earnLock'){earn.unlockedAt=0;earn.pays=null;render();return}
  if(d.act==='earnForgot'){earn.mode='set';earn.err='';render();return}
  if(d.act==='earnCancelSet'){earn.mode='';earn.err='';render();return}
  if(d.rxgiven){const [pid,rid]=d.rxgiven.split('|');const pp=db.patients.find(x=>x.id===pid),rr=pp&&(pp.rx||[]).find(x=>x.id===rid);if(rr){rr.pharm={status:'given',by:me.name,at:Date.now()};markDirty(pid);render();toast('Marked as given')}return}
  if(d.labdone){const [pid,lid]=d.labdone.split('|');const pp=db.patients.find(x=>x.id===pid),ll=pp&&(pp.labs||[]).find(x=>x.id===lid);if(ll){const i=document.querySelector('[data-labres="'+lid+'"]');ll.status='done';ll.stage='Delivered';ll.result=i?i.value.trim():'';ll.doneBy=me.name;ll.doneAt=Date.now();markDirty(pid);render();toast('Marked as done');try{await labTell(pp,ll,'Delivered by the lab: '+ll.what+' for '+pp.first+' '+pp.last+(ll.result?' – '+ll.result:''))}catch(e){}}return}
  if(d.act==='labAdd'){const pp=P();if(!pp)return;const what=$('#lab-what').value,note=($('#lab-note').value||'').trim();const l={id:uid(),what,note,date:today(),at:Date.now(),by:me.name,byId:user.id,status:'requested'};pp.labs=pp.labs||[];pp.labs.push(l);save();render();toast('Sent to the lab');notifyUnit('lab','Lab request for '+labCase(pp).replace(/&middot;/g,'·')+': '+what+(note?' – '+note:''),pp.id);return}
  if(d.ivdel){const {error}=await sb.from('staff_invites').delete().eq('id',d.ivdel);if(error){toast(friendly(error));return}await loadInvites();render();toast('Invitation cancelled');return}
  if(d.act==='portalPin'){const pp=P();if(!pp)return;
    if(!booking.code){toast('Switch on Online booking first (Appointments → Online booking). The portal uses the same clinic link.');return}
    if((pp.phone||'').replace(/\D/g,'').length<7){toast('Add the patient’s mobile number first.');return}
    try{await flush()}catch(e){}
    const pin=String(100000+crypto.getRandomValues(new Uint32Array(1))[0]%900000);
    const {error}=await sb.rpc('set_portal_pin',{p_patient:pp.id,p_pin:pin});
    if(error){const m=String(error.message||'');toast(/set_portal_pin|schema cache|does not exist/i.test(m)?'Run the new SQL file “supabase-update-portal.sql” in Supabase first.':friendly(error));return}
    view.portalPin={id:pp.id,pin};render();return}
  if(d.act==='ocCopy'){try{await navigator.clipboard.writeText(view.ocNew||'');toast('Code copied')}catch(e){toast('Select the code and copy it')}return}
  if(d.ocdel){const {error}=await sb.rpc('owner_delete_signup_code',{p_code:d.ocdel});if(error){toast(friendly(error));return}await loadSignupCodes();render();return}
  if(d.act==='attToggle'){view.attOpen=!view.attOpen;render();return}
  if(d.act==='unitFormToggle'){earn.unitForm=!earn.unitForm;render();return}
  if(d.labpick){const [pid,lid]=d.labpick.split('|');const pp=db.patients.find(x=>x.id===pid),ll=pp&&(pp.labs||[]).find(x=>x.id===lid);if(ll){ll.pickedAt=Date.now();ll.pickedBy=me.name;markDirty(pid);render();toast('Marked as picked up – the lab is told');notifyUnit('lab','Picked up by the clinic: '+ll.what+' ('+labCase(pp).replace(/&middot;/g,'·')+')',pid)}return}
  if(d.act==='orthoSuggest'){const pp=P();if(!pp)return;const io=orInterpret(pp);const L=[];const x=(k)=>pp.ortho&&pp.ortho[k];
    const anb=orn(pp,'anb')!=null?orn(pp,'anb'):(orn(pp,'sna')!=null&&orn(pp,'snb')!=null?orn(pp,'sna')-orn(pp,'snb'):null);
    if(anb!=null)L.push('Skeletal Class '+(anb>4?'II':anb<0?'III':'I'));const oj=orn(pp,'overjet'),ob=orn(pp,'overbite');if(oj!=null&&oj>4)L.push('Increased overjet');if(oj!=null&&oj<0)L.push('Reverse overjet');if(ob!=null&&ob>4)L.push('Deep bite');if(ob!=null&&ob<0)L.push('Anterior open bite');
    const cu=orn(pp,'crowdU'),cl=orn(pp,'crowdL');if(cu>4)L.push('Upper crowding');if(cl>4)L.push('Lower crowding');if(orn(pp,'spacing')>2)L.push('Spacing');if(x('crossbite')&&x('crossbite')!=='None')L.push(x('crossbite')+' crossbite');if(x('midU')||x('midL'))L.push('Midline discrepancy');if(x('missing'))L.push('Missing / impacted teeth: '+x('missing'));
    OR_HABITS.forEach(([k,l])=>{if(x(k))L.push('Habit: '+l.toLowerCase())});if(x('profile')==='Convex')L.push('Convex profile');if(x('profile')==='Concave')L.push('Concave profile');if(x('lips')==='Incompetent')L.push('Incompetent lips');
    if(!L.length){toast('Fill in the examination and measurements first');return}pp.ortho.problems=L.map((t,i)=>(i+1)+'. '+t).join('\n');save();render();toast('Problem list suggested – please check it');return}
  if(d.act==='orthoVisitAdd'){const pp=P();if(!pp)return;const date=$('#orv-date').value||today(),stage=$('#orv-stage').value,detail=($('#orv-detail').value||'').trim(),next=($('#orv-next').value||'').trim();pp.ortho=pp.ortho||{};pp.ortho.visits=pp.ortho.visits||[];pp.ortho.visits.push({id:uid(),date,stage,detail,next,by:me.name,at:Date.now()});save();render();toast('Visit saved');return}
  if(d.orvdel){const pp=P();if(!pp||!pp.ortho)return;pp.ortho.visits=(pp.ortho.visits||[]).filter(v=>v.id!==d.orvdel);save();render();return}
  if(d.act==='orthoNote'){const pp=P();if(!pp)return;if(isAcct()){toast('Clinical notes are written by dentists.');return}const t=orSummaryText(pp);pp.notes.push({id:uid(),date:today(),title:'Orthodontic assessment',by:me.name,text:t});save();view.tab='notes';render();toast('Added to Clinical notes');return}
  if(d.deptf!==undefined){view.dept=d.deptf;view.deptOpen=false;render();return}
  if(d.act==='deptToggle'){view.deptOpen=!view.deptOpen;render();return}
  if(d.deptdel!==undefined){const ds=deptList().slice();ds.splice(+d.deptdel,1);await deptSave({depts:ds});return}
  if(d.act==='deptAdd'){const i=$('#dept-new'),n=(i&&i.value||'').trim();if(!n)return;if(deptList().includes(n)){toast('Already in the list');return}await deptSave({depts:deptList().concat([n])},'Department added');return}
  if(d.act==='deptReady'){await deptSave(Object.assign({depts:DENTAL_DEPTS.slice(),facility:'dental_hospital'},hospUnits()),'Ready-made dental departments, Pharmacy and Lab added');return}
  if(d.act==='deptClear'){await deptSave({depts:[]});return}
  if(d.home){stopXrWatch();stopCamera();view=Object.assign(view,{screen:d.home,pid:null,confirm:null,msg:null});
    if(d.home==='appts'){view.day=view.day||today();apptsDay=[];render();refreshAppts();}
    else if(d.home==='earn'){earn.err='';earn.mode='';render();if(earnOpen())loadEarn();else{const i=$('#earn-pin')||$('#ep-pw');if(i)i.focus()}}
    else if(d.home==='msgs'){await loadMessages();try{await loadDay(today())}catch(e){}view.day=view.day||today();render();const hadUnread=unreadCount();await markRead();if(hadUnread)render();const cl=$('#chatList');if(cl)cl.scrollTop=cl.scrollHeight;}
    else render();return}
  if(d.month){view.month=d.month;await loadMonth(d.month);render();return}
  if(d.arrived){view.arriveFor=d.arrived;render();window.scrollTo({top:0,behavior:'smooth'});return}
  if(d.act==='arrCancel'){view.arriveFor=null;render();return}
  if(d.arrsend){const a=apptsDay.find(x=>x.id===d.arrsend);if(!a)return;const p=db.patients.find(x=>x.id===a.patient_id);
    const to=(document.querySelector('input[name=arr-to]:checked')||{}).value||'all';view.arriveFor=null;if(LOCAL)Sound.play('arrival');
    const {error}=await sb.from('appointments').update({status:'arrived'}).eq('id',a.id);if(error){toast(friendly(error));return}a.status='arrived';
    try{await sendMessage(to===user.id?'all':to,(p?p.first+' '+p.last:'Patient')+' has arrived for '+(a.reason||'the appointment')+' at '+hhmm(a.starts_at)+'.',{kind:'arrived',patient_id:a.patient_id})}catch(e){}
    toast((p?p.first:'Patient')+' marked as arrived – '+(to==='all'?'everyone':(team.find(t=>t.user_id===to)||{}).name||'dentist')+' notified');render();return}
  if(d.day){view.day=d.day;view.confirm=null;render();refreshAppts();return}
  if(d.sms){sendReminder(d.sms,'sms');return}
  if(d.wa){sendReminder(d.wa,'wa');return}
  if(d.ast){const {error}=await sb.from('appointments').update({status:d.ast}).eq('id',d.aid);if(error){toast(friendly(error));return}[apptsDay,apptsPatient].forEach(l=>{const x=l.find(y=>y.id===d.aid);if(x)x.status=d.ast});render();return}
  if(d.xr){xrView=d.xr;view.xrf={b:100,c:100,inv:false,zoom:false};view.confirm=null;view.xrBlob=null;render();
    const x0=xrays.find(y=>y.id===d.xr);if(x0)sb.storage.from('xrays').download(x0.path).then(r=>{if(xrView===d.xr&&r.data)view.xrBlob=r.data});return}
  if(d.xradd!==undefined){const x=xrFound[+d.xradd];if(!x)return;if(isAcct()){toast('Accountants can view X-rays but not add them.');return}
    rememberSeen(x.key);xrFound=xrFound.filter(y=>y!==x);await uploadXrays([x.file]);return}
  if(d.xrskip!==undefined){const x=xrFound[+d.xrskip];if(x){rememberSeen(x.key);xrFound=xrFound.filter(y=>y!==x);render()}return}
  if(d.attday){attDay=d.attday;attRows=null;render();await loadAttendance(attDay);render();return}
  if(d.impmode){view.impMode=d.impmode;impRows=null;impErr='';render();return}
  if(d.paymethod){view.payForm=readPayForm(P()).f;view.payForm.method=d.paymethod;render();const r=$('#pay-ref');if(r&&d.paymethod!=='Cash')r.focus();return}
  if(d.disctype){view.payForm=readPayForm(P()).f;view.payForm.dtype=d.disctype;render();const r=$('#pay-disc');if(r)r.focus();return}
  if(d.payreceipt){printBill('receipt',d.payreceipt);return}
  if(d.askpaydel){view.confirm='paydel:'+d.askpaydel;render();return}
  if(d.paydel){const {error}=await sb.from('payments').delete().eq('id',d.paydel);if(error){toast(friendly(error));return}payList=payList.filter(x=>x.id!==d.paydel);view.confirm=null;render();toast('Payment deleted');return}
  if(d.asksnap){view.confirm='snap:'+d.asksnap;render();return}
  if(d.snaprestore){try{await window.__LOCAL_DB.restoreSnapshot(d.snaprestore);toast('Records restored to '+fmtDate(d.snaprestore));setTimeout(()=>location.reload(),700)}catch(err){toast(friendly(err))}return}
  if(d.askpw){view.confirm='pw:'+d.askpw;render();const i=$('#rp-pw');if(i)i.focus();return}
  if(d.askadel){view.confirm='adel:'+d.askadel;render();return}
  if(d.adel){const {error}=await sb.from('appointments').delete().eq('id',d.adel);if(error){toast(friendly(error));return}apptsDay=apptsDay.filter(a=>a.id!==d.adel);apptsPatient=apptsPatient.filter(a=>a.id!==d.adel);view.confirm=null;render();toast('Appointment deleted');return}
  if(d.authtab){view.authTab=d.authtab;view.msg=null;render();return}
  if(d.open){xrView=null;stopXrWatch();if(view.screen==='appts')view.backTo='appts';else if(view.screen==='aes')view.backTo='aes';else{const op=db.patients.find(x=>x.id===d.open);view.backTo=isAes(op)?'aes':'list'}view=Object.assign(view,{screen:'patient',pid:d.open,tab:'details',tooth:null,confirm:null,addItem:null,msg:null});render();scrollTo(0,0);return}
  if(d.tab){view.tab=d.tab;view.tooth=null;view.addItem=null;view.confirm=null;if(d.tab==='appts'){apptsPatient=[];apptsLoading=true;render();refreshAppts();}else if(d.tab==='xrays'){xrays=[];xrView=null;render();refreshXrays();startXrWatch();}else if(d.tab==='chart'){stopXrWatch();xrays=[];render();refreshXrays();}else if(d.tab==='pay'){stopXrWatch();payList=[];view.payForm=null;render();refreshPayments();}else if(d.tab==='visits'){stopXrWatch();view.visitEdit=null;payList=[];render();if(!isAcct()||true)loadPayments(p.id).then(()=>{if(view.tab==='visits')softRender()},()=>{})}else{stopXrWatch();render();}return}
  if(d.mh){p.mh.answers[d.mh]=Object.assign(p.mh.answers[d.mh]||{},{v:d.v});save();render();return}
  if(d.tooth){view.tooth=+d.tooth===view.tooth?null:+d.tooth;view.confirm=null;render();const ed=$('#editor');if(ed)ed.scrollIntoView({block:'nearest'});return}
  if(d.mode){view.mode=d.mode;render();return}
  if(d.pros){const t=view.tooth;if(p.pros[t]===d.pros)delete p.pros[t];else p.pros[t]=d.pros;save();render();return}
  if(d.cstyle){lsSet('chartStyle',d.cstyle);render();return}
  if(d.dent){p.dent=d.dent;view.tooth=null;save();render();return}
  if(d.mat){view.mat=d.mat;if(view.mode!=='sec')view.mode='fill';render();return}
  if(d.setst!==undefined){if(d.setst)p.chart[view.tooth]=d.setst;else delete p.chart[view.tooth];save();render();return}
  if(d.done){const i=p.plan.find(x=>x.id===d.done);i.status='completed';i.doneDate=today();i.doneBy=me.name;
    p.notes.push({id:uid(),date:today(),title:'Treatment',by:me.name,text:`Completed: ${i.proc}${i.tooth?' – tooth '+i.tooth:''}${i.surf?' ('+i.surf+')':''}`});save();render();toast('Completed – you can print today\'s record now');return}
  if(d.undo){const i=p.plan.find(x=>x.id===d.undo);i.status='planned';delete i.doneDate;delete i.doneBy;save();render();return}
  if(d.edit){view.addItem=Object.assign({},p.plan.find(x=>x.id===d.edit));render();return}
  if(d.del){p.plan=p.plan.filter(x=>x.id!==d.del);save();render();toast('Item removed');return}
  if(d.role){const {error}=await sb.rpc('set_member_role',{p_clinic:clinic.id,p_user:d.uid,p_role:d.role});if(error){toast(friendly(error));return}await loadTeam();render();toast('Role changed');return}
  if(d.askrm){view.confirm='rm:'+d.askrm;render();return}
  if(d.rm){const pw=($('#rm-pw')||{}).value||'';if(!pw){toast('Type your password to remove this person.');return}
    try{const r=await sb.auth.signInWithPassword({email:user.email,password:pw});if(r.error)throw r.error}catch(e){toast('Wrong password.');return}
    const {error}=LOCAL?await sb.from('members').delete().eq('clinic_id',clinic.id).eq('user_id',d.rm):await sb.rpc('remove_member',{p_clinic:clinic.id,p_user:d.rm});if(error){toast(friendly(error));return}view.confirm=null;await loadTeam();render();toast('Removed from the clinic');return}
  if(d.vtpl){const t=$('#vn-text');if(t){const tp=NOTE_TPLS[d.vtpl][1];t.value=(t.value.trim()?t.value.trim()+'\n\n':'')+tp;t.focus()}return}
  if(d.vprint){printRecord(p,d.vprint,'print');return}
  if(d.ntpl){const keep=$('#n-text')?$('#n-text').value:'';const keepT=$('#n-title')?$('#n-title').value:'';view.noteTpl=d.ntpl;
    if(d.ntpl==='rct'){if(!view.rct||!view.rct.canals||view.rct.pid!==p.id){view.rct={pid:p.id};rctSetTooth(p,'')}render();$('#n-text').value=keep;$('#n-title').value='Treatment';return}
    render();const tx=$('#n-text');tx.value=(keep.trim()?keep.trim()+'\n\n':'')+NOTE_TPLS[d.ntpl][1];$('#n-title').value=keepT||'Treatment';tx.focus();return}
  if(d.rcdel!==undefined){rctRead();const keep=$('#n-text').value;view.rct.canals.splice(+d.rcdel,1);render();$('#n-text').value=keep;return}
  if(d.rxset!==undefined){rxRead();const set=RX_SETS[+d.rxset];const pen=penAllergy(p);
    if(pen&&set[1].some(n=>(rxFind(n)||{}).pen)&&!confirm('This patient is allergic to penicillin. This set contains a penicillin. Add it anyway?'))return;
    set[1].forEach(n=>{const m=rxFind(n);if(m&&!view.rxDraft.items.some(x=>x.name===m.name))view.rxDraft.items.push({name:m.name,dose:m.dose,days:m.days,note:m.note})});render();return}
  if(d.rxadd){rxRead();const [g,i]=d.rxadd.split('|');const m=RX_MEDS[g][+i];
    if(penAllergy(p)&&m.pen&&!confirm('This patient is allergic to penicillin. Add '+m.name+' anyway?'))return;
    if(m.ceph&&penAllergy(p)&&!confirm('Penicillin allergy: cephalosporins can cause a reaction in some patients. Add anyway?'))return;
    view.rxDraft.items.push({name:m.name,dose:m.dose,days:m.days,note:m.note});render();toast('Added – you can change the dose below');return}
  if(d.rxdel!==undefined){rxRead();view.rxDraft.items.splice(+d.rxdel,1);render();return}
  if(d.rxprint||d.rxsavepdf||d.rxopen){const r=(p.rx||[]).find(x=>x.id===(d.rxprint||d.rxsavepdf||d.rxopen));if(r){try{await rxPdf(p,r,d.rxprint?'print':d.rxopen?'open':'save')}catch(err){toast(friendly(err))}}return}
  if(d.rxedit){const r=p.rx.find(x=>x.id===d.rxedit);view.rxDraft=Object.assign(JSON.parse(JSON.stringify(r)),{pid:p.id});render();window.scrollTo(0,0);return}
  if(d.rxcopy){const r=p.rx.find(x=>x.id===d.rxcopy);view.rxDraft=Object.assign(JSON.parse(JSON.stringify(r)),{id:'',date:today(),pid:p.id});render();window.scrollTo(0,0);toast('Copied – change it and save');return}
  if(d.rxremove){if(!confirm('Delete this prescription?'))return;p.rx=p.rx.filter(x=>x.id!==d.rxremove);save();render();toast('Prescription deleted');return}
  switch(d.act){
    case 'rctAddCanal':{rctRead();const keep=$('#n-text').value;view.rct.canals.push({name:'Canal '+(view.rct.canals.length+1),wl:'',ref:'',maf:''});render();$('#n-text').value=keep;break}
    case 'rctInsert':{const r=rctRead();if(!r.tooth){toast('Write the tooth number first');break}
      const tx=$('#n-text');tx.value=(tx.value.trim()?tx.value.trim()+'\n\n':'')+rctText(r);
      p.wl=p.wl||{};p.wl[r.tooth]={date:$('#n-date').value||today(),canals:(r.canals||[]).filter(c=>c.wl||c.name).map(c=>Object.assign({},c))};save();
      $('#n-title').value='Treatment';toast('Inserted – check the note and tap Save note');tx.scrollIntoView({block:'center'});break}
    case 'rxBlank':{rxRead();view.rxDraft.items.push({name:'',dose:'',days:'',note:''});render();const ins=document.querySelectorAll('[data-rxf][data-k=name]');if(ins.length)ins[ins.length-1].focus();break}
    case 'rxCancel':{view.rxDraft=rxNew();render();break}
    case 'rxSave':case 'rxSavePrint':case 'rxSaveOpen':{const r=rxSave(p);if(!r)break;render();toast('Prescription saved');if(d.act==='rxSavePrint'||d.act==='rxSaveOpen'){try{await rxPdf(p,r,d.act==='rxSaveOpen'?'open':'print')}catch(err){toast(friendly(err))}}break}
    case 'reload':location.reload();break;
    case 'showRecover':view.email=$('#li-email')?$('#li-email').value:'';view.showRecover=!view.showRecover;view.msg=null;render();break;
    case 'rcDone':if(!$('#rc-ok').checked){toast('Tick the box once you have saved the code');break;}view.recoveryCode=null;clinic.has_recovery=true;view.screen='welcome';render();Sound.play('success');break;
    case 'enterApp':view=Object.assign(view,{screen:'appts',day:today()});render();refreshAppts();break;
    case 'askRecovery':view.confirm='newrc';render();break;
    case 'makeRecovery':{const {data,error}=await sb.rpc('new_recovery_code',{p_clinic:clinic.id});if(error){toast(friendly(error));break;}
      view.newRecovery=data;view.confirm=null;clinic.has_recovery=true;const m=memberships.find(x=>x.clinic_id===clinic.id);if(m)m.clinics.has_recovery=true;render();break;}
    case 'goActivate':view.screen='settings';view.newRecovery=null;view.confirm=null;view.msg=null;render();setTimeout(()=>{const a=$('#activation');if(a)a.scrollIntoView({block:'start'})},50);break;
    case 'copyClinicCode':{const c=clinic.clinic_code;const sel=()=>{const r=document.createRange();r.selectNodeContents($('#ccode'));const s=getSelection();s.removeAllRanges();s.addRange(r);toast('Code selected – copy it')};
      try{navigator.clipboard.writeText(c).then(()=>toast('Clinic code copied'),sel)}catch(err){sel()}break;}
    case 'askWipe':view.confirm='wipe';render();break;
    case 'wipe':{if(!isAdmin())break;const code=$('#wipe-code').value;
      if(!LOCAL){const chk=await sb.rpc('check_delete_code',{p_clinic:clinic.id,p_key:code});if(chk.error){toast(friendly(chk.error)+' Nothing was deleted.');break;}
        const {data:xs}=await sb.from('xrays').select('path').eq('clinic_id',clinic.id);const paths=(xs||[]).map(x=>x.path);
        for(let i=0;i<paths.length;i+=100)await sb.storage.from('xrays').remove(paths.slice(i,i+100));
        const del=await sb.rpc('delete_clinic',{p_clinic:clinic.id,p_key:code});if(del.error){toast(friendly(del.error));break;}
        lsSet('clinicId','');toast('Clinic deleted');if(chan)sb.removeChannel(chan);chan=null;clinic=null;await afterLogin();break;}
      const problem=await window.__LOCAL_DB.checkDeleteCode(clinic.id,code);
      if(problem){toast(problem+' Nothing was deleted.');break;}
      await window.__LOCAL_DB.wipeAll();try{localStorage.removeItem(LS_NS+'lastFullBackup');localStorage.removeItem(LS_NS+'clinicId')}catch(e){}
      toast('Clinic deleted');setTimeout(()=>location.reload(),700);break;}
    case 'saveDaily':{const bl=dailyBlob;if(!bl)break;deliverFile(bl,('Backup_'+clinic.name+'_'+today()+'.json').replace(/[^\w.\-]+/g,'_'),'save').then(ok=>{if(ok){lsSet('lastFullBackup',String(Date.now()));dailyBlob=null;toast('Backup saved');render()}},()=>toast('Could not save the backup'));break;}
    case 'camStart':{const k=$('#xr-kind');if(k&&!/photo/i.test(k.value)){k.value='Microscope photo'}view.xrKind=k?k.value:view.xrKind;await startCamera(view.camId);break;}
    case 'camStop':stopCamera();render();break;
    case 'camShot':{const v=$('#camVideo');if(!v||!v.videoWidth){toast('The camera picture is not ready yet');break;}
      if(isAcct()){toast('Accountants can view X-rays but not add them.');break;}
      const c=document.createElement('canvas');c.width=v.videoWidth;c.height=v.videoHeight;c.getContext('2d').drawImage(v,0,0);
      const blob=await new Promise(r=>c.toBlob(r,'image/jpeg',0.92));const f=new File([blob],'microscope_'+Date.now()+'.jpg',{type:'image/jpeg'});
      const flash=$('.cam-box');if(flash){flash.classList.add('flash');setTimeout(()=>flash.classList.remove('flash'),250)}
      view.xrKind=$('#xr-kind').value;await uploadXrays([f]);const v2=$('#camVideo');if(v2&&camStream){v2.srcObject=camStream;v2.play().catch(()=>{})}break;}
    case 'oldMoreRows':{const keep=[...document.querySelectorAll('#oldForm input,#oldForm select,#oldForm textarea')].map(x=>[x.id,x.value]);view.oldRows=(view.oldRows||3)+3;render();keep.forEach(([id,v])=>{const x=$('#'+id);if(x)x.value=v});break;}
    case 'impOpen':view.impOpen=true;view.impSec=b.dataset.sec||'';view.oldRows=3;impRows=null;impErr='';render();break;
    case 'impClose':view.impOpen=false;impRows=null;impErr='';render();break;
    case 'impTemplate':{const csv='Name,File no.,Mobile,CNIC,Date of birth,Age,Sex,Address,First visit,Medical history,Past treatment,Balance\r\nAli Raza,1452,0300 1234567,35202-1234567-1,15/04/1985,,M,"Gulberg, Lahore",02/03/2019,Diabetes,"RCT 36 in 2021, scaling 2023",3000\r\n';
      deliverFile(new Blob(['\uFEFF'+csv],{type:'text/csv'}),'Old_patients_template.csv','save').then(ok=>{if(ok)toast('Template saved – open it in Excel, fill in your patients, save as CSV or Excel')});break;}
    case 'impGo':{if(!impRows||!impRows.length)break;const n=impRows.length;await importPatients(impRows.map(importRowToPatient));view.impOpen=false;impRows=null;render();toast(n+' old patient'+(n>1?'s':'')+' imported');break;}
    case 'printInvoice':printBill('invoice');break;
    case 'printReceipt':printBill('receipt');break;
    case 'xrConnect':{try{const h=await window.showDirectoryPicker({id:'xray-folder',mode:'read'});xrDir=h;await devStore.set('xrayDir',h);xrDirState='ok';xrWatchFrom=Date.now()-15*60*1000;toast('X-ray folder connected');render();scanXrayFolder()}catch(err){if(err&&err.name!=='AbortError')toast('Could not open that folder')}break;}
    case 'xrAllow':{try{const r=await xrDir.requestPermission({mode:'read'});xrDirState=r==='granted'?'ok':'ask';render();scanXrayFolder()}catch(err){toast('Could not get access to the folder')}break;}
    case 'xrShowRecent':xrWatchFrom=Date.now()-3*864e5;await scanXrayFolder();if(!xrFound.length)toast('No new images in the last 3 days');render();break;
    case 'toggleSound':Sound.toggle();render();break;
    case 'showUsers':view.email=$('#li-email')?$('#li-email').value:'';view.showUsers=!view.showUsers;render();break;
    case 'fullBackup':{view.backupBusy=true;render();try{const data=await window.__LOCAL_DB.exportAll();view.backupBlob=new Blob([JSON.stringify(data)],{type:'application/json'});}catch(err){toast('Could not prepare the backup')}view.backupBusy=false;render();break;}
    case 'shareBackup':{const bl=view.backupBlob;if(!bl)break;deliverFile(bl,('Full_Backup_'+clinic.name+'_'+today()+'.json').replace(/[^\w.\-]+/g,'_'),'save').then(ok=>{if(ok){lsSet('lastFullBackup',String(Date.now()));view.backupBlob=null;toast('Backup saved – keep it in iCloud Drive or Google Drive');render()}},()=>toast('Could not save the backup'));break;}
    case 'doRestore':{try{await window.__LOCAL_DB.importAll(view.restoreData);toast('Backup restored');setTimeout(()=>location.reload(),600)}catch(err){toast(friendly(err))}break;}
    case 'xrClose':xrView=null;view.confirm=null;render();break;
    case 'xrInv':view.xrf.inv=!view.xrf.inv;render();break;
    case 'xrZoom':view.xrf.zoom=!view.xrf.zoom;render();break;
    case 'xrAskDel':if(isAcct()){toast('Accountants can view X-rays but not delete them.');break;}view.confirm='xrdel';render();break;
    case 'xrDelete':{const x=xrays.find(y=>y.id===xrView);if(!x)break;
      const r1=await sb.from('xrays').delete().eq('id',x.id);if(r1.error){toast(friendly(r1.error));break;}
      await sb.storage.from('xrays').remove([x.path]);xrays=xrays.filter(y=>y.id!==x.id);xrView=null;view.confirm=null;render();toast('X-ray deleted');break;}
    case 'xrSave':{const x=xrays.find(y=>y.id===xrView);if(!x)break;
      const data=view.xrBlob;if(!data){toast('Still loading the image – try again in a moment');break;}
      const pp=P();const fn=((pp?pp.last+'_'+pp.first+'_':'')+x.kind+'_'+x.taken_on+'.'+(x.path.split('.').pop())).replace(/[^\w.\-]+/g,'_');
      deliverFile(data,fn,'save').then(ok=>{if(ok)toast('X-ray ready to save')},()=>toast('Could not share the file'));break;}
    case 'logout':if(dirty.size)await flush();await endAttendance();await sb.auth.signOut();break;
    case 'forgot':{const em=$('#li-email')?$('#li-email').value.trim():'';if(!em){view.msg={t:'err',m:'Type your email above first, then tap “Forgot password?”.'};render();break;}
      const {error}=await sb.auth.resetPasswordForEmail(em,{redirectTo:location.origin+location.pathname});
      view.msg=error?{t:'err',m:friendly(error)}:{t:'ok',m:'If that email has an account, a reset link is on its way. Open it on this device.'};render();break;}
    case 'back':if(view.screen==='onboard'&&!clinic&&memberships.length){await openClinic(memberships.find(x=>x.clinic_id===lsGet('clinicId'))||memberships[0]);break}
    if(view.screen==='patient'&&view.backTo==='appts'){view=Object.assign(view,{screen:'appts',pid:null,confirm:null});render();refreshAppts();break;}
      if(view.screen==='patient'&&(view.backTo==='aes'||isAes(P()))){view=Object.assign(view,{screen:'aes',pid:null,tab:'details',tooth:null,confirm:null,addItem:null,msg:null});render();break;}
      view=Object.assign(view,{screen:memberships.length?'list':'onboard',pid:null,tab:'details',tooth:null,confirm:null,addItem:null,msg:null});render();break;
    case 'settings':view.newRecovery=null;if(isAdmin()||isAcct()){attRows=null;loadAttendance(attDay||today()).then(()=>{if(view.screen==='settings')softRender()})}if(LOCAL){snapList=null;window.__LOCAL_DB.listSnapshots().then(l=>{snapList=l;if(view.screen==='settings')softRender()})}view.screen='settings';view.confirm=null;view.msg=null;render();loadTeam().then(()=>{if(view.screen==='settings')softRender()});if(appOwner)loadSignupCodes().then(()=>{if(view.screen==='settings')softRender()});break;
    case 'onboard':view.screen='onboard';view.msg=null;render();break;
    case 'paperPatient':{const np=blankPatient();np.paperEntry=true;if(view.impSec==='aes')np.kind='aesthetic';db.patients.push(np);markDirty(np.id);view.impOpen=false;view=Object.assign(view,{screen:'patient',pid:np.id,tab:'details',tooth:null,q:'',confirm:null});render();const f=$('#f-first');if(f){f.focus();f.select()}break;}
    case 'paperDone':{const p=P();if(!p)break;if(!(p.first||'').trim()){toast('Write the patient\'s name first.');view.tab='details';render();break}delete p.paperEntry;save();render();toast('Saved – now a normal patient');break;}
    case 'newPatient':{const np=blankPatient();if(b.dataset.sec==='aes'||view.screen==='aes')np.kind='aesthetic';db.patients.push(np);markDirty(np.id);view=Object.assign(view,{screen:'patient',pid:np.id,tab:'details',tooth:null,q:'',confirm:null});render();const f=$('#f-first');if(f){f.focus();f.select()}break;}
    case 'example':{const np=sample();np.notes[0].by=me.name;db.patients.push(np);markDirty(np.id);render();toast('Example patient added');break;}
    case 'askDelete':if(isAcct()){toast('Only dentists can delete patient records.');break;}view.confirm='delete';render();break;
    case 'cancelConfirm':view.confirm=null;render();break;
    case 'deletePatient':{const id=p.id;dirty.delete(id);
      try{const {data:xs}=await sb.from('xrays').select('path').eq('patient_id',id);if(xs&&xs.length)await sb.storage.from('xrays').remove(xs.map(x=>x.path));}catch(err){}const {error}=await sb.from('patients').delete().eq('id',id);if(error){toast(friendly(error));break;}
      db.patients=db.patients.filter(x=>x.id!==id);view=Object.assign(view,{screen:'list',pid:null,confirm:null});render();toast('Patient deleted');break;}
    case 'mhDate':p.mh.date=today();save();render();toast('Medical history reviewed today');break;
    case 'closeTooth':view.tooth=null;render();break;
    case 'addToPlan':{const t=view.tooth,sf=p.surf[t]||{},ks=Object.keys(sf).filter(k=>['caries','sec','defect'].includes(sf[k].t));
      const sec=Object.values(sf).find(v=>v.t==='sec'),st=p.chart[t]||'';
      let proc=(MT[(sec&&sec.m)||view.mat||'comp']||MT.comp).proc,phase=3;
      if(st==='ext'||st==='root'){proc='Extraction';phase=1}else if(st==='impacted'||(st==='partial'&&t%10===8)){proc='Surgical extraction';phase=1}else if(st==='missing'){proc=isPrim(t)?'Space maintainer':'Implant placement';phase=4}else if(st==='frac'&&!ks.length){proc=isPrim(t)?'Stainless steel crown (SSC)':'Crown – zirconia';phase=4}
      else if(isPrim(t)&&p.rct[t]){proc='Pulpectomy (primary tooth)'}
      if(['crown','abut','bridge'].includes(st)){const m=p.pros[t];const name={PFM:'PFM',ZR:'zirconia',EMX:'E-max',CER:'full ceramic',FM:'full metal'}[m];
        proc=st==='crown'?(name?'Crown – '+name:'Crown – zirconia'):(name&&name!=='full ceramic'?'Bridge – '+name:'Bridge – PFM');phase=4}
      view.tab='plan';view.addItem={tooth:String(t),surf:['ext','missing','root','impacted','partial','unerupted','crown','abut','bridge'].includes(st)?'':surfStr(t,ks),proc,phase,fee:''};view.tooth=null;render();scrollTo(0,0);break;}
    case 'askClearTooth':view.confirm='clearTooth';render();break;
    case 'clearTooth':{const t=view.tooth;delete p.chart[t];delete p.surf[t];delete p.rct[t];delete p.toothNotes[t];delete p.imp[t];delete p.mob[t];delete p.pros[t];view.confirm=null;save();render();toast('Tooth '+t+' cleared');break;}
    case 'printRecord':printRecord(p,$('#pr-date').value||today(),'print');break;
    case 'saveRecord':printRecord(p,$('#pr-date').value||today(),'save');break;
    case 'openRecord':printRecord(p,$('#pr-date').value||today(),'open');break;
    case 'printToday':printRecord(p,today(),'print');break;
    case 'saveToday':printRecord(p,today(),'save');break;
    case 'newItem':{const pp=P();view.addItem={tooth:'',surf:'',proc:isAes(pp)?'Aesthetic consultation':PROCS[0],phase:isAes(pp)?2:3,fee:''};render();break;}
    case 'cancelItem':view.addItem=null;render();break;
    case 'saveItem':{const f=view.addItem,it={id:f.id||uid(),tooth:$('#it-tooth').value.trim(),surf:isAes(P())?$('#it-surf').value.trim():$('#it-surf').value.trim().toUpperCase(),proc:$('#it-proc').value,phase:+$('#it-phase').value,fee:parseFloat($('#it-fee').value)||0,status:f.status||'planned'};
      if(f.doneDate){it.doneDate=f.doneDate;it.doneBy=f.doneBy}
      const dn=$('#it-done')&&$('#it-done').value;if(dn){it.status='completed';it.doneDate=dn;it.doneBy=it.doneBy||me.name}
      const ix=p.plan.findIndex(x=>x.id===it.id);if(ix>=0)p.plan[ix]=it;else p.plan.push(it);view.addItem=null;save();render();toast('Item saved');break;}
    case 'updCheck':Upd.check(true);break;
    case 'updGo':toast('Updating…');await Upd.go();break;
    case 'visitNew':{if(isAcct())break;const dt=d.date||today();if(view.tab!=='visits'){payList=[];view.tab='visits';loadPayments(p.id).then(()=>{if(view.tab==='visits')softRender()},()=>{})}view.visitEdit={id:'',date:dt};render();const f=$('#visitForm');if(f)f.scrollIntoView({block:'start'});break;}
    case 'visitEdit':{if(isAcct())break;const n=(p.notes||[]).find(x=>x.id===d.nid);if(!n)break;view.visitEdit={id:n.id,date:n.date};render();const f=$('#visitForm');if(f)f.scrollIntoView({block:'start'});break;}
    case 'visitCancel':view.visitEdit=null;render();break;
    case 'visitDel':{const e=view.visitEdit;if(!e||!e.id)break;if(!confirm('Delete this note?'))break;p.notes=p.notes.filter(x=>x.id!==e.id);save();view.visitEdit=null;render();toast('Note deleted');break;}
    case 'visitSave':{if(isAcct())break;const e=view.visitEdit;if(!e)break;
      const date=$('#vn-date').value||today(),title=$('#vn-title').value,text=$('#vn-text').value.trim();
      const boxes=[...document.querySelectorAll('[data-vtreat]')];
      if(!text&&!boxes.some(b=>b.checked)){toast('Write a note or tick a treatment');break;}
      boxes.forEach(b=>{const i=p.plan.find(x=>x.id===b.dataset.vtreat);if(!i)return;
        if(b.checked){if(!(i.status==='completed'&&i.doneDate===date)){i.status='completed';i.doneDate=date;i.doneBy=i.doneBy||me.name}}
        else if(i.status==='completed'&&i.doneDate===e.date||i.status==='completed'&&i.doneDate===date){i.status='planned';delete i.doneDate;delete i.doneBy}});
      if(e.id){const n=p.notes.find(x=>x.id===e.id);if(n){n.date=date;n.title=title;n.text=text;n.editedBy=me.name;n.editedAt=Date.now()}}
      else if(text){p.notes.push({id:uid(),date,title,by:me.name,text})}
      save();view.visitEdit=null;render();toast('Visit saved');break;}
    case 'addNote':{if(isAcct()){toast('Clinical notes are written by dentists.');break;}const t=$('#n-text').value.trim();if(!t){toast('Write the note first');break;}
      p.notes.push({id:uid(),date:$('#n-date').value||today(),title:$('#n-title').value,by:me.name,text:t});save();render();toast('Note saved');break;}
    case 'copyCode':{const c=clinic.invite_code;
      const sel=()=>{const r=document.createRange();r.selectNodeContents($('#invite'));const s=getSelection();s.removeAllRanges();s.addRange(r);toast('Code selected – copy it')};
      try{navigator.clipboard.writeText(c).then(()=>toast('Invite code copied'),sel)}catch(err){sel()}break;}
    case 'askNewCode':view.confirm='newcode';render();break;
    case 'newCode':{const {data,error}=await sb.rpc('new_invite_code',{p_clinic:clinic.id});if(error){toast(friendly(error));break;}clinic.invite_code=data;view.confirm=null;render();toast('New invite code made');break;}
    case 'askLeave':view.confirm='leave';render();break;
    case 'leave':{if(isAdmin()&&team.filter(t=>t.role==='admin').length<=1){view.confirm=null;view.msg={t:'err',m:'Make another dentist admin before you leave, so the clinic keeps an admin.'};render();break;}
      if(dirty.size)await flush();const {error}=await sb.from('members').delete().eq('clinic_id',clinic.id).eq('user_id',user.id);if(error){toast(friendly(error));break;}
      lsSet('clinicId','');if(chan)sb.removeChannel(chan);chan=null;clinic=null;await afterLogin();break;}
    case 'exportBackup':{const blob=new Blob([JSON.stringify({app:'clinic-patient-records',clinic:clinic.name,exported:new Date().toISOString(),patients:db.patients.map(x=>Object.assign(strip(x),{id:x.id}))},null,1)],{type:'application/json'});
      deliverFile(blob,('Backup_'+clinic.name+'_'+today()+'.json').replace(/[^\w.\-]+/g,'_'),'save').then(ok=>{if(ok)toast('Backup saved')},()=>toast('Could not save the backup'));break;}
    case 'importLocal':{try{const d=JSON.parse(lsGet('clinicRecords.v1')||'{}');const list=(d.patients||[]).filter(x=>!x.example);await importPatients(list);}catch(err){toast('Could not read the old records')}break;}
  }
});
async function importPatients(list){
  if(!list.length){toast('No patients found to import');return}
  const have=new Set(db.patients.map(x=>x.id));
  const rows=list.map(x=>{const pt=migrate(Object.assign({},x));if(!isUUID(pt.id)||have.has(pt.id))pt.id=uuid();delete pt._upd;delete pt._by;return pt});
  rows.forEach(pt=>{db.patients.push(pt);dirty.add(pt.id)});setSync('saving');await flush();render();
  toast(rows.length+' patient'+(rows.length>1?'s':'')+' imported');
}
document.addEventListener('change',async e=>{
  const el=e.target;
  if(el.id==='rct-tooth'){const p=P();if(!p)return;rctRead();const keep=$('#n-text').value;rctSetTooth(p,el.value.trim());render();$('#n-text').value=keep;return}
  if(el.id==='restoreFile'&&el.files&&el.files[0]){try{const d=JSON.parse(await el.files[0].text());if(!d||d.app!=='clinic-records-local'||!d.tables)throw 0;
    view.restoreData=d;view.restoreInfo=(d.clinics||[]).join(', ')+' from '+fmtDate(String(d.exported||'').slice(0,10));view.confirm='restore';render();}catch(err){toast('That file is not a full backup from this app')}el.value='';return}
  if(el.id==='earn-print'){earn.printWhat=el.value;return}
  if(el.id==='it-proc'&&ENDO_PHASE1.includes(el.value)){const ph=$('#it-phase');if(ph&&!isAes(P()))ph.value='1';return}
  if(el.dataset&&el.dataset.bkopen!==undefined){const d=el.dataset.bkopen;['bk-from-','bk-to-'].forEach(p=>{const x=$('#'+p+d);if(x)x.disabled=!el.checked});return}
  if((el.id==='brand-logo'||el.id==='brand-bg')&&el.files&&el.files[0]){const f=el.files[0];
    try{if(el.id==='brand-logo'){const png=f.type==='image/png'||f.type==='image/webp';const url=await resizeImage(f,320,png?'image/png':'image/jpeg',0.9);await saveBranding({logo:url});toast('Logo saved')}
      else{const url=await resizeImage(f,1600,'image/jpeg',0.72);await saveBranding({bg:'photo',bgImage:url});view.bgPhoto=false;toast('Background photo saved')}
      render()}catch(err){toast(friendly(err))}return}
  if(el.dataset&&el.dataset.tonefor){lsSet('tone:'+el.dataset.tonefor,el.value);const was=Sound.on;Sound.on=true;Sound.play(el.dataset.tonefor);Sound.on=was;return}
  if(el.id==='snd-on'){if(Sound.on!==el.checked)Sound.toggle();render();return}
  if(el.id==='snd-vol'){lsSet('soundVol',el.value);const was=Sound.on;Sound.on=true;Sound.play('success');Sound.on=was;return}
  if(el.id==='ex-cat'){earn.expForm=readExpForm();earn.expForm.cat=el.value;render();return}
  if(el.id==='print-bal'){lsSet('printBal',el.checked?'on':'off');toast(el.checked?'Paid and balance will show on printouts':'Paid and balance hidden on printouts');return}
  if(el.id==='imp-file'&&el.files&&el.files[0]){await readImportFile(el.files[0]);el.value='';return}
  if(el.id==='tx-file'&&el.files&&el.files.length){if(isAcct()){toast('Accountants can view X-rays but not add them.');el.value='';return}
    const kind=$('#tx-kind').value;view.txKind=kind;await uploadXrays([...el.files],{kind,teeth:String(view.tooth),taken_on:today(),note:''});return}
  if(el.id==='tx-kind'){view.txKind=el.value;return}
  if(el.id==='xr-file'&&el.files&&el.files.length&&isAcct()){toast('Accountants can view X-rays but not add them.');el.value='';return}
  if(el.id==='xr-file'&&el.files&&el.files.length){view.xrKind=$('#xr-kind').value;await uploadXrays([...el.files]);return}
  if(el.id==='camSel'){await startCamera(el.value);return}
  if(el.id==='attPick'&&el.value){attDay=el.value;attRows=null;render();await loadAttendance(attDay);render();return}
  if(el.id==='dayPick'&&el.value){view.day=el.value;render();refreshAppts();return}
  if(el.dataset.roleuid){const {error}=await sb.rpc('set_member_role',{p_clinic:clinic.id,p_user:el.dataset.roleuid,p_role:el.value});if(error){toast(friendly(error));await loadTeam();render();return}await loadTeam();render();toast('Role changed');return}
  if(el.id==='unit-pharmacy'||el.id==='unit-lab'){const k=el.id==='unit-lab'?'lab':'pharmacy';const u=Object.assign({},unitsOf());u[k]=el.checked;if(el.checked&&!u[k==='lab'?'labSince':'phSince'])u[k==='lab'?'labSince':'phSince']=Date.now();await deptSave({units:u});return}
  if(el.dataset&&el.dataset.unitstaff){const k=el.dataset.unitstaff,key=k==='pharmacy'?'pharmaStaff':'labStaff';let a=staffIds(k).slice();a=el.checked?a.concat([el.value]):a.filter(x=>x!==el.value);await deptSave({[key]:a});return}
  if(el.id==='brand-col'){if(!isAdmin())return;try{await saveBranding({bg:'custom',bgColor:el.value});toast('Page colour saved')}catch(err){toast(friendly(err))}return}
  if(el.id==='facility-sel'){const f=el.value;const patch={facility:f};if(f==='dental_hospital'){if(!deptList().length)patch.depts=DENTAL_DEPTS.slice();Object.assign(patch,hospUnits())}await deptSave(patch);return}
  if(el.id==='switchClinic'){const m=memberships.find(x=>x.clinic_id===el.value);if(m)await openClinic(m);return}
  if(el.id==='importFile'&&el.files&&el.files[0]){try{const d=JSON.parse(await el.files[0].text());const list=Array.isArray(d)?d:(d.patients||(d.tables&&d.tables.patients)||[]);await importPatients(list.filter(x=>!x.example));}catch(err){toast('That file is not a valid backup')}el.value='';return}
  if(el.dataset&&el.dataset.or!==undefined&&(el.tagName==='SELECT'||el.type==='checkbox'||el.type==='number'||el.type==='date')){const p=P();if(p&&view.screen==='patient'){const sc=window.scrollY;setTimeout(()=>{if(view.screen==='patient'&&!(document.activeElement&&document.activeElement.dataset&&document.activeElement.dataset.or!==undefined&&document.activeElement.type!=='checkbox'&&document.activeElement.tagName!=='SELECT')){render();window.scrollTo(0,sc)}},60)}return}
  if(el.dataset&&el.dataset.labstage){const [pid,lid]=el.dataset.labstage.split('|');const pp=db.patients.find(x=>x.id===pid),ll=pp&&(pp.labs||[]).find(x=>x.id===lid);if(ll){ll.stage=el.value;markDirty(pid);toast('Clinic informed: '+el.value);await labTell(pp,ll,'Lab update for '+pp.first+' '+pp.last+' – '+ll.what+': '+el.value)}return}
  if(el.id==='ortho-on'){const p=P();if(p){p.orthoOn=el.checked;save();render()}return}
  if((el.dataset.f&&(el.tagName==='SELECT'||el.type==='date'))||el.dataset.mhf==='signed'||el.dataset.bpe!==undefined)render();
});
document.addEventListener('input',e=>{
  const el=e.target;
  if(el.dataset&&el.dataset.rxf!==undefined&&view.rxDraft){const it=view.rxDraft.items[+el.dataset.rxf];if(it)it[el.dataset.k]=el.value;return}
  if(el.dataset&&el.dataset.rcanal!==undefined&&view.rct){const c=view.rct.canals[+el.dataset.rcanal];if(c)c[el.dataset.k]=el.value;return}
  if((el.id==='xr-b'||el.id==='xr-c')&&view.xrf){view.xrf[el.id==='xr-b'?'b':'c']=+el.value;const im=document.querySelector('.ximg img');if(im)im.style.filter=`brightness(${view.xrf.b}%) contrast(${view.xrf.c}%)${view.xrf.inv?' invert(1)':''}`;return}
  if(['pay-amt','pay-disc'].includes(el.id)){if(el.id==='pay-disc'&&el.tagName==='SELECT'){view.payForm=readPayForm(P()).f}const pv=$('#payPreview'),p=P();if(pv&&p)pv.innerHTML=payPreview(p);return}
  if(el.id==='search'){view.q=el.value;const pos=el.selectionStart;render();const s=$('#search');s.focus();s.setSelectionRange(pos,pos);return}
  const p=P();if(!p||view.screen!=='patient')return;
  if(el.dataset.or!==undefined){p.ortho=p.ortho||{};const v=el.type==='checkbox'?el.checked:el.value;if(v===''||v===false)delete p.ortho[el.dataset.or];else p.ortho[el.dataset.or]=v;save();return}
  if(el.dataset.f){p[el.dataset.f]=el.value;delete p.example;save();return}
  if(el.dataset.mhd){p.mh.answers[el.dataset.mhd].d=el.value;save();return}
  if(el.dataset.mhf){p.mh[el.dataset.mhf]=el.type==='checkbox'?el.checked:el.value;save();return}
  if(el.dataset.rct){if(el.checked)p.rct[el.dataset.rct]=true;else delete p.rct[el.dataset.rct];save();render();return}
  if(el.dataset.imp){const t=view.tooth;p.imp[t]=Object.assign({},p.imp[t]||{},{[el.dataset.imp]:el.value});save();render();return}
  if(el.dataset.mob){if(el.value)p.mob[el.dataset.mob]=el.value;else delete p.mob[el.dataset.mob];save();render();return}
  if(el.dataset.tnote){p.toothNotes[el.dataset.tnote]=el.value;save();return}
  if(el.dataset.bpe!==undefined){p.bpe[+el.dataset.bpe]=el.value;if(!p.bpeDate)p.bpeDate=today();save();return}
  if(el.hasAttribute('data-bpedate')){p.bpeDate=el.value;save();return}
  if(el.id==='consent'){p.planConsent={agreed:el.checked,date:el.checked?today():''};save();render();return}
});
document.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.matches&&e.target.matches('[data-surf]')){e.preventDefault();e.target.dispatchEvent(new MouseEvent('click',{bubbles:true}))}});

render();
boot().catch(e=>{view.screen='error';view.msg={t:'err',m:friendly(e)};render()});
})();
