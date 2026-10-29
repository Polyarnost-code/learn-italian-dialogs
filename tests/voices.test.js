import test from 'node:test';
import assert from 'node:assert/strict';
import {preferredVoice,orderedVoices,voiceLabel} from '../voices.js';
const voice=(name,lang='it-IT')=>({name,lang,voiceURI:name});
test('Google italiano preferred for female roles regardless of list order',()=>{const google=voice('Google italiano');assert.equal(preferredVoice([voice('Microsoft Elsa'),google],'female'),google);});
test('male roles prefer Diego Natural over other male voices',()=>{const diego=voice('Microsoft Diego Online (Natural) - Italian');assert.equal(preferredVoice([voice('Google italiano'),voice('Microsoft Cosimo'),diego],'male'),diego);});
test('female is never matched as male and non-Italian voices excluded',()=>{assert.equal(preferredVoice([voice('Female'),voice('Diego','es-ES'),voice('Google italiano')],'male'),null);});
test('missing voices leave selection to user',()=>{assert.equal(preferredVoice([],'female'),null);assert.equal(preferredVoice([voice('Luca')],'unknown'),null);});

test('recommended Italian voices are ordered and labelled without changing original list',()=>{
 const source=[voice('Cosimo'),voice('Eddy (Italian)'),voice('Google italiano'),voice('Eddy','en-US')];
 const sorted=orderedVoices(source);
 assert.deepEqual(sorted.map(v=>v.name),['Google italiano','Eddy (Italian)','Cosimo']);
 assert.equal(source[0].name,'Cosimo');
 assert.equal(voiceLabel(sorted[0]),'Google Italiana (жін., рекоменд.)');
 assert.equal(voiceLabel(sorted[1]),'Eddy (чол., рекоменд.)');
 assert.equal(preferredVoice(source,'male'),source[1]);
 assert.equal(preferredVoice(source,'unknown'),source[2]);
});
