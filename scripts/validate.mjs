import fs from 'node:fs';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
const words=JSON.parse(fs.readFileSync('public/vocabulary.json','utf8'));
const topics=JSON.parse(fs.readFileSync('src/topics.json','utf8'));
const report=JSON.parse(fs.readFileSync('public/content-report.json','utf8'));
assert.equal(words.length,3000);assert.equal(new Set(words.map(w=>w.id)).size,3000);assert.equal(topics.length,21);
for(const w of words){assert.equal(w.id,w.word);assert.match(w.word,/^[a-z][a-z-]+$/);for(const field of ['meaning','ipaUK','ipaUS','example','pos','source','exampleSource'])assert.ok(typeof w[field]==='string'&&w[field].length,w.word+': '+field);assert.ok(w.ipaUK.startsWith('/')&&w.ipaUK.endsWith('/'));assert.ok(w.ipaUS.startsWith('/')&&w.ipaUS.endsWith('/'));assert.match(w.example,new RegExp('\\b'+w.word+'\\b','i'));assert.ok(topics.some(t=>t.id===w.topic));}
assert.ok(words.some(w=>w.word==='sustainable'&&w.meaning==='bền vững'));
for(const t of topics)assert.equal(t.count,words.filter(w=>w.topic===t.id).length);
assert.equal(report.sha256,crypto.createHash('sha256').update(fs.readFileSync('public/vocabulary.json')).digest('hex'));
for(const f of ['icon-192.png','icon-512.png','ATTRIBUTION.md','IPA-LICENSE.txt','DATA-LICENSE.txt','FREQUENCY-LICENSE.txt'])assert.ok(fs.existsSync('public/'+f),f);
console.log('PASS: 3,000 unique words, both IPA variants, contextual examples, 21 topic counts, content hash, attribution and app assets.');
const book=JSON.parse(fs.readFileSync('public/ebook-a.json','utf8'));
assert.equal(book.words.length,826);assert.equal(book.chapters.length,15);assert.equal(book.pages,114);
assert.equal(new Set(book.words.map(w=>w.id)).size,826);assert.match(book.sourceSha256,/^[a-f0-9]{64}$/);
for(const ch of book.chapters)assert.deepEqual(book.words.filter(w=>w.chapter===ch.id&&w.kind==='main').map(w=>w.number),Array.from({length:20},(_,i)=>i+1));
for(const [i,w] of book.words.entries()){assert.equal(w.order,i);for(const key of ['word','meaning','example','exampleVi'])assert.ok(typeof w[key]==='string'&&w[key].trim(),w.id+': '+key);assert.ok(w.page>=4&&w.page<=112);}
console.log('PASS: e-book A, 300 main + 526 supplemental entries, 15 complete ordered chapters, bilingual contexts and source page references.');
