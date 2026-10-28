import test from 'node:test';
import assert from 'node:assert/strict';
import {preferredVoice} from '../voices.js';
const voice=(name,lang='it-IT')=>({name,lang,voiceURI:name});
test('Google italiano preferred for female roles regardless of list order',()=>{const google=voice('Google italiano');assert.equal(preferredVoice([voice('Microsoft Elsa'),google],'female'),google);});
test('male roles prefer Diego Natural over other male voices',()=>{const diego=voice('Microsoft Diego Online (Natural) - Italian');assert.equal(preferredVoice([voice('Google italiano'),voice('Microsoft Cosimo'),diego],'male'),diego);});
test('female is never matched as male and non-Italian voices excluded',()=>{assert.equal(preferredVoice([voice('Female'),voice('Diego','es-ES'),voice('Google italiano')],'male'),null);});
test('missing voices leave selection to user',()=>{assert.equal(preferredVoice([],'female'),null);assert.equal(preferredVoice([voice('Luca')],'unknown'),null);});
