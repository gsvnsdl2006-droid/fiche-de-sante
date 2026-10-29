import {readSheet} from 'read-excel-file/node';
const cell=value=>value==null?'':value instanceof Date?`${String(value.getUTCDate()).padStart(2,'0')}/${String(value.getUTCMonth()+1).padStart(2,'0')}/${value.getUTCFullYear()}`:String(value).trim();
export async function excelProfiles(input,{questionnaire,generateCode}){
 if(typeof input?.base64!=='string'||input.base64.length>5*1024*1024||!/^[A-Za-z0-9+/]*={0,2}$/.test(input.base64))throw Error('Sélectionnez un fichier Excel .xlsx valide (3 Mo maximum).');
 const bytes=Buffer.from(input.base64,'base64');if(bytes[0]!==80||bytes[1]!==75||bytes.length>3*1024*1024)throw Error('Sélectionnez un fichier Excel .xlsx valide (3 Mo maximum).');
 let rows;try{rows=await readSheet(bytes,{parseNumber:value=>/e/i.test(value)&&Number.isSafeInteger(Number(value))?Number(value).toFixed(1):value});}catch{throw Error('Le fichier Excel ne peut pas être lu. Utilisez le fichier .xlsx des réponses.');}
 if(!Array.isArray(rows)||rows.length<2||rows.length>1001||rows[0].length>100)throw Error('Le fichier doit contenir de 1 à 1 000 réponses.');
 const headers=rows[0].map(cell),firstData=rows.slice(1).find(r=>r.some(v=>v!=null&&cell(v)!==''));
 if(!firstData)throw Error('Le fichier ne contient aucune réponse.');
 const sample=questionnaire(headers.map((question,i)=>({question,answer:String(i)})));
 const column=id=>{const value=sample.find(q=>q.id===id)?.answer;return /^\d+$/.test(value||'')?Number(value):-1;};
 const first=column('firstName'),last=column('lastName');if(first<0||last<0)throw Error('Les colonnes Nom et Prénom sont introuvables.');
 const usedCodes=new Set();const members=[];
 for(let i=1;i<rows.length;i++){
  const row=rows[i];if(!row.some(v=>v!=null&&cell(v)!==''))continue;
  const name=[cell(row[first]),cell(row[last])].filter(Boolean).join(' ');if(!name)throw Error('Nom manquant à la ligne Excel '+(i+1)+'.');
  let code;do{code=generateCode();}while(usedCodes.has(code));usedCodes.add(code);
  const answers=questionnaire(headers.map((question,index)=>({question,answer:cell(row[index])})).filter(a=>a.question&&!/^(timestamp|horodateur|horodatage)$/i.test(a.question)));
  if(answers.length!==39)throw Error('Des colonnes non reconnues ont été trouvées. Utilisez le fichier original de réponses.');
  members.push({name,sourceRow:i+1,initialCode:code,originalAnswers:answers});
 }
 return {format:'boussole-members-v1',members};
}
