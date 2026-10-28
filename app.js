import {parseDialog,guessGender,compareReply} from './dialog.js';
const $=id=>document.getElementById(id),synth=window.speechSynthesis;
const Recognition=window.SpeechRecognition||window.webkitSpeechRecognition;
let lines=[],speakers=[],voices=[],position=0,active=false,recognition=null,epoch=0,speaking=false;
const choices=new Map();
function status(text){$('status').textContent=text;}
function cancel(){active=false;epoch++;recognition?.abort();recognition=null;synth?.cancel();speaking=false;$('listen').disabled=false;}
function voiceOptions(){voices=(synth?.getVoices()||[]).filter(v=>/^it(?:-|_)/i.test(v.lang));}
function renderVoices(){
 voiceOptions();$('voices').replaceChildren();
 for(const speaker of speakers){
 const box=document.createElement('div'),label=document.createElement('label'),gender=document.createElement('select'),select=document.createElement('select'),preview=document.createElement('button');
 label.textContent=`Голос: ${speaker}`;gender.setAttribute('aria-label',`Тип голосу для ${speaker}`);select.setAttribute('aria-label',`Доступний голос для ${speaker}`);
 for(const [value,text] of [['unknown','Виберіть тип голосу'],['female','Жіночий'],['male','Чоловічий']])gender.add(new Option(text,value));
 const saved=choices.get(speaker);gender.value=saved?.gender||guessGender(speaker);
 function fill(){select.replaceChildren();select.add(new Option('Автоматичний італійський голос',''));for(const v of voices)select.add(new Option(v.name,v.voiceURI));
 const match=voices.find(v=>(gender.value==='female'?/elsa|alice|federica|paola|isabella|female/i:gender.value==='male'?/diego|luca|cosimo|paolo|male/i:/$a/).test(v.name));
 select.value=saved?.voice&&voices.some(v=>v.voiceURI===saved.voice)?saved.voice:match?.voiceURI||'';save();}
 function save(){choices.set(speaker,{gender:gender.value,voice:select.value});}
 gender.onchange=()=>{const match=voices.find(v=>(gender.value==='female'?/elsa|alice|federica|paola|isabella|female/i:gender.value==='male'?/diego|luca|cosimo|paolo|male/i:/$a/).test(v.name));select.value=match?.voiceURI||'';save();};select.onchange=save;fill();
 preview.textContent='▶ Послухати';preview.onclick=()=>{cancel();say('Ciao! Parliamo italiano insieme.',speaker);};
 box.append(label,gender,select,preview);$('voices').append(box);
 }
}
function say(text,speaker,done){
 if(!synth){status('Озвучення не підтримується цим браузером.');return;}
 synth.cancel();const utterance=new SpeechSynthesisUtterance(text);utterance.lang='it-IT';utterance.rate=.9;
 utterance.voice=voices.find(v=>v.voiceURI===choices.get(speaker)?.voice)||null;
 const token=epoch;speaking=true;$('listen').disabled=true;
 utterance.onend=()=>{if(token!==epoch)return;speaking=false;$('listen').disabled=false;done?.();};
 utterance.onerror=e=>{if(token!==epoch)return;speaking=false;$('listen').disabled=false;if(e.error!=='interrupted'&&e.error!=='canceled')status('Не вдалося озвучити репліку. Перевірте голос або браузер.');};synth.speak(utterance);
}
$('prepare').onclick=()=>{
 cancel();$('practice').hidden=true;$('error').textContent='';
 try{const parsed=parseDialog($('dialog').value);const names=[...new Set(parsed.map(l=>l.speaker))];if(names.length<2)throw Error('Потрібні щонайменше два персонажі. Позначте репліки, наприклад Anna: … та Marco: …');lines=parsed;speakers=names;$('role').replaceChildren(...names.map(n=>new Option(n,n)));renderVoices();$('roles').hidden=false;}
 catch(e){$('error').textContent=e.message;$('roles').hidden=true;}
};
$('dialog').addEventListener('input',()=>{cancel();$('roles').hidden=true;$('practice').hidden=true;});
synth?.addEventListener('voiceschanged',()=>{if(!$('roles').hidden)renderVoices();});
function turn(){
 if(!active)return;
 $('feedback').textContent='';$('hintText').hidden=true;$('continue').hidden=true;$('restart').hidden=true;$('fallback').hidden=true;$('typed').value='';
 $('progress').textContent=`${Math.min(position+1,lines.length)} / ${lines.length}`;
 if(position>=lines.length){status('Bravissima! Діалог завершено. Спробуйте ще раз, змінивши роль.');$('speaker').textContent='FINE';$('line').textContent='До наступної розмови!';$('restart').hidden=false;$('listen').disabled=true;active=false;return;}
 const line=lines[position],mine=line.speaker===$('role').value;
 $('speaker').textContent=mine?`${line.speaker} · ваша черга`:line.speaker;
 $('line').textContent=mine?'Тепер ваша репліка…':line.text;
 $('repeat').disabled=mine;$('hint').disabled=!mine;$('listen').disabled=!mine;
 if(mine){status('Скажіть свою репліку італійською.');if(Recognition)listen();else{status('Голосове розпізнавання недоступне. Спробуйте Chrome або введіть відповідь текстом.');$('fallback').hidden=false;$('listen').disabled=true;}}
 else {status('Слухайте співрозмовника…');say(line.text,line.speaker,()=>{position++;turn();});}
}
function listen(){
 if(!active||speaking||recognition||!Recognition||lines[position]?.speaker!==$('role').value)return;
 const token=epoch;const r=new Recognition();recognition=r;r.lang='it-IT';r.continuous=false;r.interimResults=false;
 $('listen').disabled=true;status('Слухаю…');let received=false;
 r.onresult=e=>{if(token!==epoch)return;received=true;recognition=null;r.stop();check(e.results[0][0].transcript);};
 r.onerror=e=>{if(token!==epoch)return;status(e.error==='not-allowed'?'Дозвольте доступ до мікрофона в браузері або введіть відповідь текстом.':`Не вдалося розпізнати відповідь (${e.error}). Натисніть «Відповісти голосом» або введіть текст.`);$('fallback').hidden=false;};
 r.onend=()=>{if(token!==epoch)return;if(recognition===r)recognition=null;$('listen').disabled=false;if(!received&&$('fallback').hidden)status('Відповідь не почута. Натисніть «Відповісти голосом», щоб спробувати знову.');};
 try{r.start();}catch{recognition=null;$('listen').disabled=false;$('fallback').hidden=false;status('Не вдалося ввімкнути мікрофон. Спробуйте ще раз або введіть текст.');}
}
function check(heard){
 if(!active||!heard.trim())return;
 const expected=lines[position].text,result=compareReply(expected,heard);
 if(result.matches){position++;turn();return;}
 $('feedback').textContent=`Почуто: «${heard}». У діалозі: «${expected}». ${result.missing.length?'Не збіглися слова: '+result.missing.join(', ')+'. ':''}Можлива помилка розпізнавання або інше формулювання. Спробуйте повторити чи продовжуйте.`;
 status('Можете повторити відповідь або продовжити.');$('listen').disabled=false;$('continue').hidden=false;
}
function start(){cancel();$('error').textContent='';if(speakers.some(name=>name!==$('role').value&&choices.get(name)?.gender==='unknown')){$('error').textContent='Виберіть чоловічий або жіночий голос для співрозмовника у налаштуваннях ролей.';return;}if(!synth){$('error').textContent='Цей браузер не підтримує озвучення. Спробуйте актуальний Chrome, Edge або Safari.';return;}active=true;position=0;$('practice').hidden=false;turn();$('practice').scrollIntoView({behavior:'smooth',block:'start'});}
$('start').onclick=start;$('restart').onclick=start;$('listen').onclick=listen;
$('hint').onclick=()=>{if(!lines[position])return;$('hintText').textContent=lines[position].text;$('hintText').hidden=!$('hintText').hidden;};
$('repeat').onclick=()=>{if(active&&!speaking&&lines[position])say(lines[position].text,lines[position].speaker);};
$('continue').onclick=()=>{if(!active)return;recognition?.abort();recognition=null;epoch++;position++;turn();};
$('stop').onclick=()=>{cancel();status('Розмову зупинено. Натисніть «Почати ще раз», коли будете готові.');$('restart').hidden=false;$('continue').hidden=true;$('listen').disabled=true;};
$('check').onclick=()=>check($('typed').value);
window.addEventListener('pagehide',cancel);
voiceOptions();
