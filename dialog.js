const female=new Set('anna maria giulia giulietta sofia chiara francesca elena laura lucia alice sara martina valentina paola'.split(' '));
const male=new Set('marco luca paolo giovanni giuseppe andrea francesco matteo alessandro antonio luigi roberto davide pietro'.split(' '));
export function guessGender(name){const n=name.trim().toLocaleLowerCase('it');return female.has(n)?'female':male.has(n)?'male':'unknown';}
export function parseDialog(text){
 const lines=text.split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
 if(!lines.length)throw Error('Додайте текст діалогу.');
 let previous='';let alternate=0;
 return lines.map((line)=>{
  const match=line.match(/^([^:：]{1,60})[:：]\s*(.+)$/u);
  if(match){previous=match[1].trim();return {speaker:previous,text:match[2].trim()};}
  previous=`Персонаж ${alternate++%2+1}`;
  return {speaker:previous,text:line.replace(/^[-–—]\s*/, '')};
 });
}
export function normalize(text){return text.toLocaleLowerCase('it').normalize('NFC').replace(/[^\p{L}\p{N}\s]/gu,' ').replace(/\s+/g,' ').trim();}
export function compareReply(expected,heard){
 const a=normalize(expected).split(' '),b=normalize(heard).split(' ');
 return {matches:normalize(expected)===normalize(heard),missing:a.filter(word=>!b.includes(word)),extra:b.filter(word=>!a.includes(word))};
}
