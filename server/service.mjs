import {createHmac,randomBytes,randomUUID,timingSafeEqual} from 'node:crypto';
import questions from './questions.mjs';
import {createPdf} from './pdf.mjs';
export const VERSION='netlify-1';
const ADMIN='gsvnsdl2006@gmail.com';
export class ApiError extends Error{constructor(message,status=400){super(message);this.status=status;}}
const fail=(message,status=400)=>{throw new ApiError(message,status);};
const norm=code=>String(code||'').replace(/[\s-]/g,'').toUpperCase();
const stamp=()=>new Date().toISOString();
function validCode(value){const code=norm(value);if(!/^[A-Z0-9]{8}$/.test(code)||/^(.)\1+$/.test(code)||['12345678','87654321','ABCDEFGH','PASSWORD','AZERTYUI','QWERTYUI'].includes(code))fail('Choisissez 8 lettres ou chiffres, sans suite évidente.');return code;}
function nameOf(value){const name=String(value||'').trim();if(!name||name.length>150)fail('Indiquez un nom complet (150 caractères maximum).');return name;}
function unitOf(value){if(!['Meute','Troupe','Clan','À attribuer'].includes(value))fail('Unité non valide.');return value;}
function label(value){return String(value||'').replace(/_x000a_/gi,' ').replace(/\s+2\s*$/,'').normalize('NFD').replace(/[\u0300-\u036f\u064b-\u065f\u0670]/g,'').replace(/[^a-zA-Z0-9\u0600-\u06ff]/g,'').toLowerCase();}
const latin=value=>label(value).replace(/[\u0600-\u06ff]/g,'');
export function questionnaire(source=[]){const used=new Set();const fields=questions.map(q=>{let i=source.findIndex((a,i)=>!used.has(i)&&a.id===q.id);if(i<0)i=source.findIndex((a,i)=>!used.has(i)&&([q.question,q.question+' '+(q.arabic||''),...(q.arabic?[q.arabic]:[])].map(label).includes(label(a.question))||latin(a.question)===latin(q.question)));if(i>=0)used.add(i);return {...q,answer:i>=0?String(source[i].answer||''):''};});source.forEach((a,i)=>{if(!used.has(i))fields.push({id:'legacy_'+i,question:String(a.question||'Réponse importée'),section:'Autres réponses importées',type:'textarea',answer:String(a.answer||'')});});return fields;}
const initial=()=>({members:[],access:{},logos:{},rates:{}});
export function createService({store,secret,adminHash,secure=true}){
 if(!secret||secret.length<32||!/^[a-f0-9]{64}$/i.test(adminHash||''))throw new Error('Server credentials are not configured.');
 const hash=value=>createHmac('sha256',secret).update(String(value)).digest('hex');
 const cookieName=secure?'__Host-boussole':'boussole_dev';
 const cookie=(token,age=7200)=>`${cookieName}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${age}${secure?'; Secure':''}`;
 const read=async()=>structuredClone((await store.get('database'))?.data||initial());
 async function mutate(fn){for(let i=0;i<12;i++){const old=await store.get('database'),db=structuredClone(old?.data||initial()),result=await fn(db);if(await store.set('database',db,old?.etag??null)){if(result?.error)throw result.error;return result;}}fail('Une autre modification est en cours. Réessayez.',409);}
 function publicMember(m,db){return {...m,hasCode:!!db.access[m.id],originalAnswers:questionnaire(m.originalAnswers)};}
 const owner=(user,id,db)=>{const m=db.members.find(m=>m.id===id);if(!m||(!user.admin&&m.id!==user.id))fail('Accès refusé.',403);return m;};
 const admin=user=>{if(!user?.admin)fail('Accès responsable requis.',403);};
 async function identity(request){const value=(request.headers.get('cookie')||'').split(';').map(s=>s.trim()).find(s=>s.startsWith(cookieName+'='))?.slice(cookieName.length+1);if(!value||! /^[a-f0-9]{64}$/.test(value))fail('Connectez-vous pour continuer.',401);const stored=await store.get('session/'+hash(value)),session=stored?.data;if(!session||session.expires<=Date.now())fail('Session expirée. Reconnectez-vous.',401);const db=await read();if(session.admin){if(session.version!==adminHash)fail('Session expirée.',401);}else if(db.access[session.id]?.version!==session.version)fail('Session expirée.',401);return {...session,token:value};}
 async function session(user){const token=randomBytes(32).toString('hex');await store.set('session/'+hash(token),{...user,expires:Date.now()+7200000});return {value:{authenticated:true},cookie:cookie(token)};}
 function throttle(db,key,max,period,consume=true){const now=Date.now();for(const [k,list] of Object.entries(db.rates))if(!list.some(t=>now-t<86400000))delete db.rates[k];if(Object.keys(db.rates).length>2000)fail('Réessayez plus tard.',429);const attempts=(db.rates[key]||[]).filter(t=>now-t<period);if(attempts.length>=max)return new ApiError('Trop de tentatives. Réessayez plus tard.',429);if(consume)attempts.push(now);db.rates[key]=attempts;return null;}
 const fingerprint=answers=>hash('source:'+JSON.stringify(questionnaire(answers).map(a=>[a.id,String(a.answer||'').trim().replace(/\s+/g,' ')])));
 function setCode(db,m,raw){const code=validCode(raw),digest=hash('code:'+code);if(Object.entries(db.access).some(([id,a])=>id!==m.id&&a.hash===digest))fail('Ce code n’est pas disponible.');db.access[m.id]={hash:digest,version:randomUUID()};return code.slice(0,4)+'-'+code.slice(4);}
 function freshCode(){const chars='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';return Array.from(randomBytes(8),b=>chars[b%32]).join('');}
 function newMember(input){return {id:randomUUID(),name:nameOf(input.name),email:String(input.email||'').trim().slice(0,200),unit:unitOf(input.unit||'À attribuer'),updatedAt:randomUUID(),originalAnswers:questionnaire()};}
 async function image(input,max=4*1024*1024){if(!input||!['image/png','image/jpeg'].includes(input.mime)||typeof input.base64!=='string'||input.base64.length>Math.ceil(max/3)*4+4||!/^[A-Za-z0-9+/]*={0,2}$/.test(input.base64))fail('Image JPG ou PNG, 4 Mo maximum.');const bytes=Buffer.from(input.base64,'base64');if(!bytes.length||bytes.length>max||!(input.mime==='image/png'?bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])):bytes[0]===255&&bytes[1]===216&&bytes[2]===255))fail('Image non valide.');return {mime:input.mime,base64:input.base64};}
 async function call(request,payload,ip='unknown'){
  if(!payload||payload.version!==VERSION)fail('Une nouvelle version est disponible. Rechargez la page.',409);
  if(!Array.isArray(payload.args)||payload.args.length>5)fail('Requête non valide.');
  const args=payload.args,method=payload.method,rateKey=hash('ip:'+ip);
  if(method==='getPublicConfig'){const db=await read();return {value:{version:VERSION,logos:db.logos,registrationReady:true}};}
  if(method==='loginMember'){
   const code=norm(args[0]);if(code.length>32)fail('Code incorrect.');
   const result=await mutate(db=>{const blocked=throttle(db,'login:'+rateKey,10,600000,false);if(blocked)return {error:blocked};const digest=hash('code:'+code),id=Object.keys(db.access).find(id=>db.access[id].hash===digest);if(!id||!db.members.some(m=>m.id===id)){throttle(db,'login:'+rateKey,10,600000);return {error:new ApiError('Code incorrect.',401)};}return {id,version:db.access[id].version,admin:false};});return session(result);
  }
  if(method==='loginAdministrator'){
   const result=await mutate(db=>{const blocked=throttle(db,'admin:'+rateKey,5,900000,false);if(blocked)return {error:blocked};const received=hash('admin:'+String(args[0]||'').replace(/[\s-]/g,'').toUpperCase());if(!timingSafeEqual(Buffer.from(received,'hex'),Buffer.from(adminHash,'hex'))){throttle(db,'admin:'+rateKey,5,900000);return {error:new ApiError('Code responsable incorrect.',401)};}return {admin:true,email:ADMIN,version:adminHash};});return session(result);
  }
  if(method==='registerMember'){
   const input=args[0]||{},code=validCode(input.code);const result=await mutate(db=>{const blocked=throttle(db,'register:'+rateKey,20,86400000);if(blocked)return {error:blocked};const m=newMember({name:input.name,unit:'À attribuer'});m.requestedUnit=unitOf(input.unit||'À attribuer');m.registration='new';setCode(db,m,code);db.members.push(m);return {admin:false,id:m.id,version:db.access[m.id].version};});return session(result);
  }
  const user=await identity(request);
  if(method==='logoutMember'){await store.remove('session/'+hash(user.token));return {value:true,cookie:cookie('',0)};}
  if(method==='getState'){const db=await read();return {value:{user:{admin:user.admin,email:user.admin?ADMIN:undefined,id:user.id},importMode:'prepared',members:db.members.filter(m=>user.admin||m.id===user.id).map(m=>publicMember(m,db)),questions:questions.map(q=>q.question),logos:db.logos}};}
  if(method==='createMember'){admin(user);const result=await mutate(db=>{const m=newMember(args[0]||{}),code=setCode(db,m,freshCode());db.members.push(m);return {members:db.members.map(m=>publicMember(m,db)),member:publicMember(m,db),code};});return {value:result};}
  if(method==='resetMemberCode'){admin(user);return {value:await mutate(db=>{const m=owner(user,args[0],db);return {id:m.id,name:m.name,code:setCode(db,m,args[1]||freshCode())};})};}
  if(method==='updateMemberUnit'){admin(user);return {value:await mutate(db=>{const m=owner(user,args[0],db);m.unit=unitOf(args[1]);m.updatedAt=randomUUID();return publicMember(m,db);})};}
  if(method==='importPreparedProfiles'){
   admin(user);const input=args[0];if(input?.format!=='boussole-members-v1'||!Array.isArray(input.members)||!input.members.length||input.members.length>1000)fail('Fichier de profils non valide.');
   const prepared=input.members.map(row=>{if(!Array.isArray(row.originalAnswers)||row.originalAnswers.length!==39||questions.some(q=>!row.originalAnswers.some(a=>a.id===q.id)))fail('Les 39 questions sont requises.');const answers=questions.map(q=>({...q,answer:String(row.originalAnswers.find(a=>a.id===q.id).answer||'').slice(0,10000)}));return {name:nameOf(row.name),sourceRow:Number.isInteger(row.sourceRow)?row.sourceRow:null,originalAnswers:answers,initialCode:validCode(row.initialCode),fingerprint:fingerprint(answers)};});
   if(new Set(prepared.map(r=>r.initialCode)).size!==prepared.length)fail('Deux codes du fichier sont identiques.');
   return {value:await mutate(db=>{let created=0,activated=0;for(const row of prepared){let m=db.members.find(m=>m.sourceFingerprint===row.fingerprint);if(!m){m=newMember({name:row.name,unit:'À attribuer'});Object.assign(m,{sourceFingerprint:row.fingerprint,sourceRow:row.sourceRow,originalAnswers:row.originalAnswers,requestedUnit:row.originalAnswers[0].answer});db.members.push(m);created++;}if(!db.access[m.id]){setCode(db,m,row.initialCode);activated++;}}return {members:db.members.map(m=>publicMember(m,db)),created,activated,total:db.members.length};})};
  }
  if(method==='saveProfile'){
   const input=args[0]||{};const member=await mutate(db=>{const m=owner(user,input.id,db),fields=questionnaire(m.originalAnswers);if(m.updatedAt!==input.updatedAt)fail('Cette fiche a changé. Rechargez-la avant de modifier.',409);if(!Array.isArray(input.originalAnswers)||input.originalAnswers.length!==fields.length)fail('Questionnaire incomplet.');m.originalAnswers=fields.map((q,i)=>({...q,answer:String(input.originalAnswers[i]?.answer||'').slice(0,10000)}));const name=['firstName','lastName'].map(id=>m.originalAnswers.find(q=>q.id===id)?.answer||'').filter(Boolean).join(' ');if(name)m.name=name.slice(0,150);m.updatedAt=randomUUID();m.savedAt=stamp();return publicMember(m,db);});
   const db=await read(),pdf=await createPdf(member,db.logos);await store.set('pdf/'+member.id,{base64:pdf.toString('base64'),mime:'application/pdf'});return {value:{member,pdf:pdf.toString('base64')}};
  }
  if(method==='downloadPdf'){
   const db=await read(),m=publicMember(owner(user,args[0],db),db);if(!m.originalAnswers.some(a=>a.answer.trim()))fail('Complétez votre fiche avant le téléchargement.');let document=null;if(args[1]===true){if(!m.identityFile)fail('Ajoutez d’abord une pièce d’identité.');document=(await store.get(m.identityFile.key))?.data;if(!document)fail('Pièce jointe introuvable.',404);}return {value:(await createPdf(m,db.logos,document)).toString('base64')};
  }
  if(method==='uploadIdentity'){
   const db=await read();owner(user,args[0],db);const data=await image(args[1]),key='documents/'+args[0]+'/'+randomUUID();await store.set(key,data);let old;
   try{const m=await mutate(db=>{const m=owner(user,args[0],db);old=m.identityFile?.key;m.identityFile={key,mime:data.mime,uploadedAt:stamp()};m.updatedAt=randomUUID();return publicMember(m,db);});if(old)await store.remove(old);return {value:m};}catch(e){await store.remove(key);throw e;}
  }
  if(method==='downloadIdentity'){const db=await read(),m=owner(user,args[0],db);if(!m.identityFile)fail('Aucune pièce jointe.');const result=await store.get(m.identityFile.key);if(!result)fail('Pièce jointe introuvable.',404);return {value:result.data};}
  if(method==='uploadLogo'){admin(user);if(!['scouts','group'].includes(args[0]))fail('Logo inconnu.');const data=await image(args[1],500*1024);return {value:await mutate(db=>{db.logos[args[0]]='data:'+data.mime+';base64,'+data.base64;return db.logos;})};}
  fail('Action non disponible.',404);
 }
 return {async handle(request,ip){const headers={'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'};try{if(request.method!=='POST')fail('Méthode non autorisée.',405);const origin=request.headers.get('origin');if(origin!==new URL(request.url).origin)fail('Origine non autorisée.',403);if(!request.headers.get('content-type')?.startsWith('application/json'))fail('Format non autorisé.',415);const text=await request.text();if(Buffer.byteLength(text)>5.8*1024*1024)fail('Requête trop volumineuse.',413);let payload;try{payload=JSON.parse(text);}catch{fail('Requête non valide.');}const result=await call(request,payload,ip);if(result.cookie)headers['Set-Cookie']=result.cookie;return new Response(JSON.stringify({data:result.value}),{headers});}catch(error){const status=error instanceof ApiError?error.status:500;return new Response(JSON.stringify({error:status===500?'Erreur du serveur. Réessayez.':error.message}),{status,headers});}}};
}
