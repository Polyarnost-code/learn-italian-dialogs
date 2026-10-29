// Browsers expose voice names and languages, but no reliable gender field.
export function preferredVoice(voices,gender){
 const italian=voices.filter(v=>/^it(?:[-_]|$)/i.test(v.lang));
 const patterns=gender==='female'
  ? [/google italian[oa]/i,/\belsa\b/i,/\balice\b/i,/\bfederica\b/i,/\bpaola\b/i,/\bisabella\b/i,/\bfemale\b/i]
  : gender==='male'
    ? [/\beddy\b/i,/\bdiego\b.*(?:natural|online)/i,/\bcosimo\b/i,/\bdiego\b/i,/\bluca\b/i,/\bpaolo\b/i,/\bmale\b/i]
    : [/google italian[oa]/i];
 for(const pattern of patterns){const voice=italian.find(v=>pattern.test(v.name));if(voice)return voice;}
 return null;
}

export function orderedVoices(voices){
 const rank=v=>/google italian[oa]/i.test(v.name)?0:/\beddy\b/i.test(v.name)?1:2;
 return voices.filter(v=>/^it(?:[-_]|$)/i.test(v.lang)).slice().sort((a,b)=>rank(a)-rank(b));
}
export function voiceLabel(voice){
 if(/google italian[oa]/i.test(voice.name))return 'Google Italiana (жін., рекоменд.)';
 if(/\beddy\b/i.test(voice.name))return 'Eddy (чол., рекоменд.)';
 return voice.name;
}
