import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm} from 'node:fs/promises';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {createHmac} from 'node:crypto';
import {BlobsServer} from '@netlify/blobs/server';
import {setEnvironmentContext} from '@netlify/blobs';
import {reportFailure} from '../server/diagnostics.mjs';

test('warm Netlify function uses the current invocation storage context instead of cached credentials',async()=>{
 const dirs=[await mkdtemp(join(tmpdir(),'boussole-context-a-')),await mkdtemp(join(tmpdir(),'boussole-context-b-'))];let callsA=0,callsB=0;
 const a=new BlobsServer({directory:dirs[0],token:'test-context-a',logger:()=>{},onRequest:()=>callsA++});
 const b=new BlobsServer({directory:dirs[1],token:'test-context-b',logger:()=>{},onRequest:()=>callsB++});
 const previousSecret=process.env.AUTH_SECRET,previousHash=process.env.ADMIN_CODE_HASH;
 try{
  const aa=await a.start(),bb=await b.start();process.env.AUTH_SECRET='test-current-context-secret-1234567890';process.env.ADMIN_CODE_HASH=createHmac('sha256',process.env.AUTH_SECRET).update('admin:TESTADMIN').digest('hex');
  const {default:handler}=await import('../netlify/functions/api.mjs');
  const request=()=>new Request('https://app.example/api',{method:'POST',headers:{Origin:'https://app.example','Content-Type':'application/json'},body:JSON.stringify({version:'netlify-1',method:'getPublicConfig',args:[]})});
  setEnvironmentContext({siteID:'test-site',token:'test-context-a',apiURL:'http://127.0.0.1:'+aa.port});const first=await handler(request(),{ip:'test'});assert.equal(first.status,200);const before=callsA;assert.ok(before>0);
  setEnvironmentContext({siteID:'test-site',token:'test-context-b',apiURL:'http://127.0.0.1:'+bb.port});const second=await handler(request(),{ip:'test'});assert.equal(second.status,200);assert.equal(callsA,before,'A new invocation must not reuse the first storage client.');assert.ok(callsB>0,'The current invocation must use its own storage context.');
 }finally{await a.stop();await b.stop();for(const directory of dirs)await rm(directory,{recursive:true,force:true});if(previousSecret===undefined)delete process.env.AUTH_SECRET;else process.env.AUTH_SECRET=previousSecret;if(previousHash===undefined)delete process.env.ADMIN_CODE_HASH;else process.env.ADMIN_CODE_HASH=previousHash;}
});

test('failure references do not disclose credentials, member data or raw upstream URLs',()=>{
 const records=[],secret='credential-must-not-be-logged',error=new Error('Failed for member-name at https://upstream.example/?token='+secret+' status code: 403');error.name='BlobsInternalError';
 const result=reportFailure(error,'api',line=>records.push(line)),record=JSON.parse(records[0]);assert.equal(result.status,503);assert.equal(record.upstreamStatus,403);assert.match(result.reference,/^[a-f0-9]{10}$/);assert.ok(!records[0].includes(secret));assert.ok(!records[0].includes('member-name'));assert.ok(!records[0].includes('upstream.example'));assert.ok(!result.message.includes(secret));
});
