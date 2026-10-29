import {createService} from '../../server/service.mjs';
import {netlifyStore} from '../../server/store.mjs';
import {reportFailure} from '../../server/diagnostics.mjs';
export default async (request,context)=>{
 try{
  // Netlify's storage context belongs to this invocation. Do not cache a Store/client across requests.
  const service=createService({store:netlifyStore(),secret:process.env.AUTH_SECRET,adminHash:process.env.ADMIN_CODE_HASH,secure:true});
  return await service.handle(request,context?.ip||'unknown');
 }catch(error){const failure=reportFailure(error,'initialize');return Response.json({error:failure.message,reference:failure.reference},{status:503,headers:{'Cache-Control':'no-store'}});}
};
