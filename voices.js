// Browsers expose voice names and languages, but no reliable gender field.
export function preferredVoice(voices,gender){
 const italian=voices.filter(v=>/^it(?:[-_]|$)/i.test(v.lang));
 const patterns=gender==='female'
  ? [/google italiano/i,/\belsa\b/i,/\balice\b/i,/\bfederica\b/i,/\bpaola\b/i,/\bisabella\b/i,/\bfemale\b/i]
  : gender==='male'
    ? [/\bdiego\b.*(?:natural|online)/i,/\bcosimo\b/i,/\bdiego\b/i,/\bluca\b/i,/\bpaolo\b/i,/\bmale\b/i]
    : [];
 for(const pattern of patterns){const voice=italian.find(v=>pattern.test(v.name));if(voice)return voice;}
 return null;
}
