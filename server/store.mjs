import {getStore} from '@netlify/blobs';
import {mkdir,readFile,writeFile,rename,unlink} from 'node:fs/promises';
import {join} from 'node:path';
import {randomUUID} from 'node:crypto';

export function netlifyStore(){
  const store=getStore({name:'boussole-private-v1',consistency:'strong'});
  return {
    async get(key){const result=await store.getWithMetadata(key,{type:'json',consistency:'strong'});return result?{data:result.data,etag:result.etag}:null;},
    async set(key,data,etag){const options=etag===null?{onlyIfNew:true}:etag?{onlyIfMatch:etag}:{};return (await store.setJSON(key,data,options)).modified;},
    async remove(key){await store.delete(key);}
  };
}

// Local development only. Never published or used as production fallback.
export function fileStore(directory){
  let queue=Promise.resolve();
  const locked=fn=>{const task=queue.then(fn,fn);queue=task.catch(()=>{});return task;};
  const path=key=>join(directory,Buffer.from(key).toString('base64url')+'.json');
  const get=async key=>{try{return JSON.parse(await readFile(path(key),'utf8'));}catch(e){if(e.code==='ENOENT')return null;throw e;}};
  return {get,set:(key,data,etag)=>locked(async()=>{await mkdir(directory,{recursive:true,mode:0o700});const old=await get(key);if(etag===null&&old)return false;if(etag&&old?.etag!==etag)return false;const target=path(key),temporary=target+'.'+randomUUID();await writeFile(temporary,JSON.stringify({data,etag:randomUUID()}),{mode:0o600});await rename(temporary,target);return true;}),remove:key=>locked(async()=>{try{await unlink(path(key));}catch(e){if(e.code!=='ENOENT')throw e;}})};
}
