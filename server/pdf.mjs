import {PDFDocument,rgb} from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import bidiFactory from 'bidi-js';
import reshaper from 'arabic-persian-reshaper';
import {readFile} from 'node:fs/promises';
import {join} from 'node:path';
const bidi=bidiFactory();
const red=rgb(.68,.13,.23),ink=rgb(.16,.19,.24),muted=rgb(.42,.47,.55),line=rgb(.88,.9,.93),pale=rgb(.94,.91,.93);
let fontBytes;
function visual(text){text=String(text??'').replace(/[\u0000-\u001f\u007f]/g,' ');if(/[\u0600-\u06ff]/.test(text)){text=reshaper.ArabicShaper.convertArabic(text);text=bidi.getReorderedString(text,bidi.getEmbeddingLevels(text));}return text;}
export async function createPdf(member,logos={},identity=null){
 fontBytes??=readFile(join(process.cwd(),'server/assets/DejaVuSans.ttf'));
 const pdf=await PDFDocument.create();pdf.registerFontkit(fontkit);const font=await pdf.embedFont(await fontBytes,{subset:true});pdf.setTitle('Fiche de santé — '+member.name);pdf.setAuthor('Groupe Saint Vincent de Paul — Naccache');
 let page,y;const width=595.28,height=841.89,left=46,right=549;
 const text=(s,x,py,size=10,color=ink)=>page.drawText(visual(s),{x,y:py,size,font,color});
 const fresh=()=>{page=pdf.addPage([width,height]);y=height-45;text('SAINT VINCENT DE PAUL · NACCACHE',left,y,8,muted);page.drawLine({start:{x:left,y:y-12},end:{x:right,y:y-12},thickness:1,color:line});y-=40;};
 const ensure=n=>{if(y-n<55)fresh();};
 const wrap=(s,size,maxWidth=right-left)=>{const result=[];for(const paragraph of String(s||'').split(/\n/)){let current='';for(const word of paragraph.split(/\s+/)){const next=current?current+' '+word:word;if(font.widthOfTextAtSize(visual(next),size)>maxWidth&&current){result.push(current);current=word;}else current=next;while(font.widthOfTextAtSize(visual(current),size)>maxWidth&&current.length>1){let cut=current.length;while(cut>1&&font.widthOfTextAtSize(visual(current.slice(0,cut)),size)>maxWidth)cut--;result.push(current.slice(0,cut));current=current.slice(cut);}}result.push(current);}return result;};
 const lines=(s,size,color=ink)=>{for(const row of wrap(s,size)){ensure(size*1.7);text(row,left,y,size,color);y-=size*1.7;}};
 fresh();let logoX=left,hasLogo=false;
 for(const value of Object.values(logos)){if(!/^data:image\/(png|jpeg);base64,[A-Za-z0-9+/=]+$/.test(value))continue;try{const bytes=Buffer.from(value.split(',')[1],'base64'),image=value.startsWith('data:image/png')?await pdf.embedPng(bytes):await pdf.embedJpg(bytes);const scale=Math.min(100/image.width,52/image.height);page.drawImage(image,{x:logoX,y:y-52,width:image.width*scale,height:image.height*scale});logoX+=image.width*scale+20;hasLogo=true;}catch{}}
 if(hasLogo)y-=75;lines('Fiche de santé',28,red);y-=8;
 page.drawRectangle({x:left,y:y-64,width:right-left,height:64,color:rgb(.93,.95,.97)});page.drawRectangle({x:left,y:y-64,width:4,height:64,color:red});text(member.name.slice(0,60),left+16,y-25,17);text(member.unit+' · '+new Date(member.savedAt||Date.now()).toLocaleDateString('fr-FR'),left+16,y-46,9,muted);y-=90;
 const answers=member.originalAnswers||[],byId=Object.fromEntries(answers.map(a=>[a.id,a.answer]));
 for(const [i,[title,value]] of [['GROUPE SANGUIN',byId.blood],['ALLERGIES',byId.allergy],['TRAITEMENT',byId.takesMedication]].entries()){const x=left+i*171;page.drawRectangle({x,y:y-48,width:163,height:48,color:pale});text(title,x+10,y-15,7,red);text(String(value||'Non renseigné').slice(0,25),x+10,y-33,9);}y-=73;
 let section='',sectionNumber=0;
 for(const a of answers){if(a.when&&String(byId[a.when]).trim().toLowerCase()==='non')continue;
  if(a.section!==section){section=a.section;sectionNumber++;ensure(85);y-=12;text(String(sectionNumber).padStart(2,'0')+'   '+section,left,y,13,red);y-=16;page.drawLine({start:{x:left,y},end:{x:right,y},thickness:1,color:line});y-=22;}
  ensure(70);lines(a.question,8.5,muted);if(a.arabic)lines(a.arabic,8.5,muted);y-=3;lines(a.answer||'Non renseigné',10);y-=10;page.drawLine({start:{x:left,y},end:{x:right,y},thickness:.5,color:line});y-=15;
 }
 if(identity){fresh();lines('Pièce d’identité / Passeport',20,red);y-=15;lines(member.name,11);const bytes=Buffer.from(identity.base64,'base64'),image=identity.mime==='image/png'?await pdf.embedPng(bytes):await pdf.embedJpg(bytes),scale=Math.min((right-left)/image.width,(y-75)/image.height);page.drawImage(image,{x:left+(right-left-image.width*scale)/2,y:y-image.height*scale-10,width:image.width*scale,height:image.height*scale});}
 const pages=pdf.getPages();for(let i=0;i<pages.length;i++){page=pages[i];page.drawLine({start:{x:left,y:38},end:{x:right,y:38},thickness:1,color:red});text('CONFIDENTIEL · Informations déclaratives',left,23,7,muted);const count=(i+1)+' / '+pages.length;text(count,right-font.widthOfTextAtSize(count,7),23,7,muted);}
 return Buffer.from(await pdf.save());
}
