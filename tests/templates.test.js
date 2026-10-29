import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {parseDialog,guessGender} from '../dialog.js';
const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
const script=await readFile(new URL('../templates.js',import.meta.url),'utf8');
test('nine templates have supported speakers and appear before footer practice note',()=>{
 const samples=[...html.matchAll(/<pre lang="it" tabindex="0">([\s\S]*?)<\/pre>/g)];
 assert.equal(samples.length,9);
 for(const [,text] of samples){const lines=parseDialog(text);assert.equal(lines.length,6);const speakers=[...new Set(lines.map(l=>l.speaker))];assert.equal(speakers.length,2);assert.ok(speakers.every(s=>guessGender(s)!=='unknown'));}
 assert.ok(html.indexOf('id="templates-title"')<html.indexOf('<aside class="footer-note"><strong>Простір'));
 assert.equal((html.match(/class="copy-dialog"/g)||[]).length,9);
 assert.ok(html.indexOf('<footer>')<html.indexOf('<aside class="footer-note">'));
 assert.ok(html.indexOf('<aside class="footer-note">')<html.indexOf('</footer>'));
});
function setup(writeText){
 let click;const status={textContent:''},text={textContent:'Anna: Ciao!\nMarco: Ciao!'};
 const card={querySelector:s=>s==='pre'?text:status};
 const button={closest:()=>card,addEventListener:(_event,handler)=>click=handler};
 let selected=false;
 vm.runInNewContext(script,{navigator:{clipboard:{writeText}},document:{querySelectorAll:()=>[button],createRange:()=>({selectNodeContents(){selected=true;}})},window:{getSelection:()=>({removeAllRanges(){},addRange(){}})}});
 return {run:()=>click(),status,text,selected:()=>selected};
}
test('copy button writes complete dialogue to clipboard',async()=>{let copied;const ui=setup(async text=>{copied=text;});await ui.run();assert.equal(copied,ui.text.textContent);assert.match(ui.status.textContent,/Скопійовано/);});
test('clipboard denial selects text for manual copying',async()=>{const ui=setup(async()=>{throw Error('denied');});await ui.run();assert.equal(ui.selected(),true);assert.match(ui.status.textContent,/вручну/);});
