import {zipFunctions} from '@netlify/zip-it-and-ship-it';
import {mkdtemp,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
const directory=await mkdtemp(join(tmpdir(),'boussole-functions-'));
try{
 const result=await zipFunctions('netlify/functions',directory,{basePath:process.cwd(),config:{'*':{nodeBundler:'esbuild',includedFiles:['server/assets/**'],includedFilesBasePath:process.cwd(),nodeVersion:'22'}}});
 if(result.length!==1||result[0].name!=='api'||result[0].runtimeAPIVersion!==2)throw Error('Expected one Netlify v2 API function.');
 const zip=await readFile(result[0].path);if(!zip.includes(Buffer.from('server/assets/DejaVuSans.ttf')))throw Error('PDF font was not packaged.');
 console.log('Netlify function package verified, including the PDF font.');
}finally{await rm(directory,{recursive:true,force:true});}
