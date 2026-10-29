import http from 'node:http';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {randomBytes,createHmac} from 'node:crypto';
import {createService} from './service.mjs';
import {fileStore} from './store.mjs';
await mkdir('.local',{recursive:true,mode:0o700});
let config;try{config=JSON.parse(await readFile('.local/config.json','utf8'));}catch(e){if(e.code!=='ENOENT')throw e;const secret=randomBytes(32).toString('hex'),adminCode=randomBytes(15).toString('base64url').toUpperCase();config={secret,adminCode,adminHash:createHmac('sha256',secret).update('admin:'+adminCode).digest('hex')};await writeFile('.local/config.json',JSON.stringify(config),{mode:0o600});}
const app=createService({store:fileStore('.local/blobs'),secret:config.secret,adminHash:config.adminHash,secure:false});
const port=Number(process.env.PORT||3000);
http.createServer(async(req,res)=>{try{if(req.url==='/api'){let body='';for await(const chunk of req){body+=chunk;if(Buffer.byteLength(body)>6*1024*1024){res.writeHead(413);return res.end();}}const origin='http://'+req.headers.host;const response=await app.handle(new Request(origin+'/api',{method:req.method,headers:req.headers,body:body||undefined}),'local');res.writeHead(response.status,Object.fromEntries(response.headers));return res.end(Buffer.from(await response.arrayBuffer()));}if(req.url!=='/'&&req.url!=='/index.html'){res.writeHead(404);return res.end();}res.setHeader('Content-Type','text/html; charset=utf-8');res.setHeader('Cache-Control','no-store');res.end(await readFile('web/index.html','utf8'));}catch{res.writeHead(500);res.end('Local server error');}}).listen(port,'0.0.0.0',()=>console.log('Local HTTP app ready on port '+port+'. Local administrator credential is in .local/config.json (not printed).'));
