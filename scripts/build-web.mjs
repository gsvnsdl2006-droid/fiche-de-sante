import {mkdir,rm,cp,readFile} from 'node:fs/promises';
import vm from 'node:vm';
const html=await readFile('web/index.html','utf8');
if(html.includes('google.script.run')||html.includes('<?='))throw Error('Apps Script-only code leaked into Netlify frontend.');
new vm.Script(html.match(/<script>([\s\S]*?)<\/script>/)[1]);
await rm('dist',{recursive:true,force:true});await mkdir('dist');await cp('web/index.html','dist/index.html');
console.log('Built dist/index.html. No member data, codes, source files or credentials are published.');
