import test from 'node:test';
import assert from 'node:assert/strict';
import {parseDialog,guessGender,compareReply} from '../dialog.js';
test('named dialogue preserves order',()=>assert.deepEqual(parseDialog('Anna: Ciao!\n\nMarco: Bene.'),[{speaker:'Anna',text:'Ciao!'},{speaker:'Marco',text:'Bene.'}]));
test('unnamed dialogue alternates roles',()=>assert.deepEqual(parseDialog('- Ciao\n— Buongiorno\nCome stai?').map(l=>l.speaker),['Персонаж 1','Персонаж 2','Персонаж 1']));
test('empty dialogue rejected',()=>assert.throws(()=>parseDialog(' \n ')));
test('gender handles Italian Andrea and unknown names',()=>{assert.equal(guessGender('Anna'),'female');assert.equal(guessGender('Andrea'),'male');assert.equal(guessGender('Person A'),'unknown');});
test('comparison tolerates case punctuation and apostrophes',()=>assert.equal(compareReply("Anch’io sto bene!","anch'io sto bene").matches,true));
test('comparison catches omissions and changed order',()=>{assert.deepEqual(compareReply('Sto molto bene','Sto bene').missing,['molto']);assert.equal(compareReply('Sto bene','Bene sto').matches,false);});
