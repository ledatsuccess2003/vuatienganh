import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {learnedPool,nextUnread,ebookDue,reviewOptions,updateCard,validateBackup} from '../src/ebook-model.js';
const book=JSON.parse(fs.readFileSync('public/ebook-a.json','utf8'));
test('ebook source order includes every numbered lesson and supplemental entry with source context',()=>{
 assert.equal(book.words.length,826);assert.equal(book.chapters.length,15);
 assert.equal(book.words.filter(w=>w.kind==='main').length,300);
 assert.equal(new Set(book.words.map(w=>w.id)).size,826);
 for(const ch of book.chapters)assert.deepEqual(book.words.filter(w=>w.chapter===ch.id&&w.kind==='main').map(w=>w.number),Array.from({length:20},(_,i)=>i+1));
 book.words.forEach((w,i)=>{assert.equal(w.order,i);assert.ok(w.word&&w.meaning&&w.example&&w.exampleVi);assert.ok(w.page>=4&&w.page<=112);if(w.kind==='extra'){const parent=book.words.find(p=>p.id===w.contextId);assert.ok(parent.order<w.order);assert.equal(parent.example,w.example);}});
 assert.equal(book.words.find(w=>w.id==='a-13-05-01').word,'rare animals');
 assert.ok(book.words.find(w=>w.id==='a-13-05-01').editorNote);
});
test('unseen favorites and notes do not unlock quizzes; every distractor comes from learned pool',()=>{
 const [a,b,c]=book.words,now=1000;
 const cards={[a.id]:updateCard(null,a.id,{type:'learn'},now),[b.id]:updateCard(null,b.id,{type:'note',value:'Not learned'},now),[c.id]:updateCard(null,c.id,{type:'favorite'},now)};
 assert.deepEqual(learnedPool(book.words,cards),[a]);assert.equal(nextUnread(book.words,cards).id,b.id);
 assert.throws(()=>updateCard(cards[b.id],b.id,{type:'rate',rating:'good'},now));
 cards[b.id]=updateCard(cards[b.id],b.id,{type:'learn'},now);
 const pool=learnedPool(book.words,cards);
 for(let i=0;i<50;i++)for(const option of reviewOptions(a,pool))assert.ok([a.id,b.id].includes(option.id));
 assert.equal(cards[b.id].note,'Not learned');
 assert.deepEqual(ebookDue(book.words,cards,now+599999),[]);
 assert.equal(ebookDue(book.words,cards,now+600000).length,2);
});
test('wrong reviews schedule retry and import rejects corrupt or foreign decks without accepting partial data',()=>{
 const id=book.words[0].id,c=updateCard(null,id,{type:'learn'},1000),r=updateCard(c,id,{type:'rate',rating:'again'},5000);
 assert.equal(r.due,605000);assert.equal(r.learnedAt,1000);
 const save={format:'vua-ebook-a',version:1,cards:[r],events:[{id:'event',wordId:id,type:'rate',rating:'again',at:5000}]},ids=new Set(book.words.map(w=>w.id));
 assert.equal(validateBackup(save,ids),save);
 assert.throws(()=>validateBackup({...save,cards:[{...r,id:'sustainable'}]},ids));
 assert.throws(()=>validateBackup({...save,cards:[{...r,due:NaN}]},ids));
 assert.throws(()=>validateBackup({...save,events:[{...save.events[0],rating:'bogus'}]},ids));
});
