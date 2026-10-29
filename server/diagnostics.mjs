import {randomBytes} from 'node:crypto';
const safeCodes=new Set(['ECONNRESET','ETIMEDOUT','ENOTFOUND','EAI_AGAIN','ENOENT','ECONNREFUSED','UND_ERR_CONNECT_TIMEOUT']);
export function reportFailure(error,operation='request',logger=console.error){
 const reference=randomBytes(5).toString('hex');
 const statusValue=error?.status||error?.statusCode||error?.response?.status||error?.cause?.status;
 const fromMessage=String(error?.message||'').match(/\bstatus(?:\s+code)?\s*[:=(]?\s*(\d{3})\b/i)?.[1];
 const candidate=Number(statusValue||fromMessage),upstreamStatus=Number.isInteger(candidate)&&candidate>=400&&candidate<=599?candidate:undefined;
 const code=safeCodes.has(error?.code)?error.code:safeCodes.has(error?.cause?.code)?error.cause.code:undefined;
 const type=/^[A-Za-z][A-Za-z0-9]{0,60}$/.test(error?.name||'')?error.name:'Error';
 // Never log the exception object, raw message, request body, cookies, user data or storage URLs.
 logger(JSON.stringify({event:'boussole-server-failure',reference,operation,type,...(upstreamStatus?{upstreamStatus}:{}),...(code?{code}:{})}));
 return {reference,status:upstreamStatus||code?503:500,message:'Le serveur est temporairement indisponible. Réessayez. Référence : '+reference};
}
