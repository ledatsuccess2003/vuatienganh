import {test} from 'node:test';
import assert from 'node:assert/strict';
import {fresh,schedule,grade,dueWords,sessionWords,choices,DAY,localDay,streak,validateSave} from '../src/learning.js';
const now=new Date(2026,8,28,18).getTime();
test('wrong answers are due in ten minutes; successful reviews grow intervals and mature cards remain due',()=>{
 const wrong=schedule(null,'again',now);assert.equal(wrong.due,now+600000);assert.equal(wrong.reps,0);
 let card=schedule(wrong,'good',now);assert.equal(card.interval,1);card=schedule(card,'good',now+DAY);assert.equal(card.interval,3);
 for(let i=0;i<4;i++)card=schedule(card,'good',now+100*DAY);
 assert.ok(card.interval>=21);assert.deepEqual(dueWords([{id:'test'}],{cards:{test:card}},card.due+1),[{id:'test'}]);
});
test('XP, streak and card updates reflect real graded words and use local calendar dates',()=>{
 let s=grade(fresh(),'first','good',now);assert.equal(s.xp,10);assert.equal(s.coins,3);assert.equal(s.days[localDay(now)],1);assert.equal(streak(s,now),1);
 s=grade(s,'second','again',now+DAY);assert.equal(s.xp,12);assert.equal(s.coins,3);assert.equal(streak(s,now+DAY),2);assert.equal(streak(s,now+3*DAY),0);assert.ok(validateSave(s));
});
test('review and favorite sessions stay inside their topic and exclude future cards',()=>{
 const words=[{id:'a',topic:'education'},{id:'b',topic:'education'},{id:'c',topic:'health'}],s=fresh();s.cards.a={due:Date.now()-1};s.cards.b={due:Date.now()+DAY};s.cards.c={due:Date.now()-1};s.favorites=['b','c'];
 assert.deepEqual(sessionWords(words,s,{topic:'education',review:true}),[words[0]]);assert.deepEqual(sessionWords(words,s,{topic:'education',favorites:true}),[words[1]]);
});
test('quiz choices always contain exactly one correct entry and unique meanings',()=>{
 const word={id:'one',meaning:'một'},pool=[word,{id:'two',meaning:'hai'},{id:'three',meaning:'ba'},{id:'four',meaning:'bốn'},{id:'duplicate',meaning:'một'}];
 for(let i=0;i<50;i++){const q=choices(word,pool);assert.equal(q.length,4);assert.equal(q.filter(w=>w.id===word.id).length,1);assert.equal(new Set(q.map(w=>w.meaning)).size,4);}
});
test('malformed import data cannot overwrite a valid saved profile',()=>{assert.ok(validateSave(fresh()));assert.ok(!validateSave({...fresh(),xp:-1}));assert.ok(!validateSave({...fresh(),settings:{}}));assert.ok(!validateSave({...fresh(),cards:{test:{due:'invalid'}}}));});
