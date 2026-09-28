import {updateCard,validateBackup} from './ebook-model.js';
let connection;
function db(){
 if(!connection)connection=new Promise((resolve,reject)=>{
  const r=indexedDB.open('vua-english-ebook-a',1);
  r.onupgradeneeded=()=>{const d=r.result;d.createObjectStore('cards',{keyPath:'id'});const e=d.createObjectStore('events',{keyPath:'id'});e.createIndex('at','at');};
  r.onsuccess=()=>{r.result.onversionchange=()=>{r.result.close();connection=null;};resolve(r.result);};
  r.onerror=()=>{connection=null;reject(r.error);};
 });
 return connection;
}
const request=r=>new Promise((resolve,reject)=>{r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});
const finished=tx=>new Promise((resolve,reject)=>{tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||Error('Không lưu được dữ liệu.'));});
export async function readCards(){const d=await db();return Object.fromEntries((await request(d.transaction('cards').objectStore('cards').getAll())).map(c=>[c.id,c]));}
export async function record(id,action){
 const d=await db(),tx=d.transaction(['cards','events'],'readwrite'),done=finished(tx),s=tx.objectStore('cards');
 const old=await request(s.get(id));let next;
 try{next=updateCard(old,id,action);s.put(next);tx.objectStore('events').add({id:crypto.randomUUID(),wordId:id,at:next.updatedAt,type:action.type,...(action.rating?{rating:action.rating}:{}),...(action.type==='note'?{value:next.note}:{})});}catch(e){tx.abort();await done.catch(()=>{});throw e;}
 await done;return next;
}
export async function history(limit=30){
 const d=await db(),tx=d.transaction('events'),s=tx.objectStore('events');
 const count=request(s.count());
 const entries=await new Promise((resolve,reject)=>{const out=[],r=s.index('at').openCursor(null,'prev');r.onerror=()=>reject(r.error);r.onsuccess=()=>{const cursor=r.result;if(!cursor||out.length>=limit){resolve(out);return;}out.push(cursor.value);cursor.continue();};});
 return {entries,count:await count};
}
export async function backup(){const d=await db(),tx=d.transaction(['cards','events']);const [cards,events]=await Promise.all([request(tx.objectStore('cards').getAll()),request(tx.objectStore('events').getAll())]);return {format:'vua-ebook-a',version:1,exportedAt:new Date().toISOString(),cards,events};}
export async function restore(data,ids){
 validateBackup(data,ids);
 const d=await db(),tx=d.transaction(['cards','events'],'readwrite'),done=finished(tx),cards=tx.objectStore('cards'),events=tx.objectStore('events');
 // Merge inside a single transaction; preserve newer local edits and old history.
 for(const c of data.cards){const r=cards.get(c.id);r.onsuccess=()=>{if(!r.result||r.result.updatedAt<c.updatedAt)cards.put(c);};}
 for(const e of data.events){const r=events.get(e.id);r.onsuccess=()=>{if(!r.result)events.add(e);};}
 await done;
}
