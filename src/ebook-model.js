import {schedule,shuffle} from './learning.js';

export const learnedPool=(words,cards)=>words.filter(w=>cards[w.id]?.learnedAt>0);
export const nextUnread=(words,cards)=>words.find(w=>!cards[w.id]?.learnedAt);
export const ebookDue=(words,cards,now=Date.now())=>learnedPool(words,cards).filter(w=>cards[w.id].due<=now).sort((a,b)=>cards[a.id].due-cards[b.id].due);
export function reviewOptions(word,pool,field='meaning'){
 const seen=new Set([word[field]]);
 return shuffle([word,...shuffle(pool).filter(w=>{if(seen.has(w[field]))return false;seen.add(w[field]);return true;}).slice(0,3)]);
}
export function updateCard(previous,id,action,now=Date.now()){
 const c=previous||{id,learnedAt:0,favorite:false,note:'',reps:0,interval:0,ease:2.5,lapses:0,due:0};
 if(action.type==='learn')return {...c,learnedAt:c.learnedAt||now,due:c.learnedAt?c.due:now+600000,updatedAt:now};
 if(action.type==='rate'){
  if(!c.learnedAt)throw Error('Bạn cần học từ này trước khi ôn.');
  return {...schedule(c,action.rating,now),updatedAt:now};
 }
 if(action.type==='note')return {...c,note:String(action.value).slice(0,10000),updatedAt:now};
 if(action.type==='favorite')return {...c,favorite:!c.favorite,updatedAt:now};
 throw Error('Thao tác không hợp lệ.');
}
export const answerText=s=>s.normalize('NFKC').toLocaleLowerCase('vi').replace(/[’‘]/g,"'").replace(/[.,!?;:…]/g,'').replace(/\s+/g,' ').trim();
export const speechText=s=>s.replace(/\((n|v|adj|adv)\)/gi,'').replace(/\s*=\s*/g,', or, ').replace(/\//g,', or, ').replace(/…|\.{2,}/g,'').trim();
export const ipaTokens=s=>s.replace(/\((n|v|adj|adv)\)/gi,'').match(/[A-Za-z]+(?:['’-][A-Za-z]+)*/g)||[];

export function validateBackup(data,ids){
 const finite=n=>Number.isFinite(n)&&n>=0;
 if(data?.format!=='vua-ebook-a'||data.version!==1||!Array.isArray(data.cards)||!Array.isArray(data.events)||data.cards.length>ids.size)throw Error('Không phải bản sao e-book A hợp lệ.');
 const seen=new Set();
 for(const c of data.cards){
  if(!ids.has(c.id)||seen.has(c.id)||!finite(c.learnedAt)||!finite(c.updatedAt)||!finite(c.due)||!finite(c.reps)||!finite(c.interval)||!finite(c.ease)||!finite(c.lapses)||typeof c.favorite!=='boolean'||typeof c.note!=='string'||c.note.length>10000)throw Error('Dữ liệu tiến độ không hợp lệ.');
  seen.add(c.id);
 }
 const events=new Set();
 for(const e of data.events){
  if(typeof e.id!=='string'||e.id.length>100||events.has(e.id)||!ids.has(e.wordId)||!finite(e.at)||!['learn','rate','note','favorite'].includes(e.type)||(e.type==='rate'&&!['again','hard','good','easy'].includes(e.rating)))throw Error('Lịch sử không hợp lệ.');
  events.add(e.id);
 }
 return data;
}
