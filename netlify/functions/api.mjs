import {createService} from '../../server/service.mjs';
import {netlifyStore} from '../../server/store.mjs';
let service;
export default async (request,context)=>{
 try{service??=createService({store:netlifyStore(),secret:process.env.AUTH_SECRET,adminHash:process.env.ADMIN_CODE_HASH,secure:true});return await service.handle(request,context.ip||'unknown');}
 catch{return Response.json({error:'Le serveur est en cours de configuration.'},{status:503,headers:{'Cache-Control':'no-store'}});}
};
