export const STORAGE_KEY='vua-english-v1';
export const DAY=86400000;
export const localDay=(time=Date.now())=>{const d=new Date(time);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;};
export const fresh=()=>({version:1,cards:{},favorites:[],xp:0,coins:0,stage:1,days:{},settings:{accent:'en-GB',rate:0.85,goal:20,reminder:'19:30',notifications:false},badges:[]});
export function validateSave(s){return s?.version===1&&s.cards&&typeof s.cards==='object'&&!Array.isArray(s.cards)&&Object.values(s.cards).every(c=>Number.isFinite(c.due)&&Number.isFinite(c.interval)&&Number.isFinite(c.reps)&&Number.isFinite(c.ease))&&Array.isArray(s.favorites)&&s.favorites.every(x=>typeof x==='string')&&Number.isFinite(s.xp)&&s.xp>=0&&Number.isFinite(s.coins)&&s.coins>=0&&Number.isInteger(s.stage)&&s.stage>=1&&s.days&&typeof s.days==='object'&&Object.values(s.days).every(x=>Number.isFinite(x)&&x>=0)&&s.settings&&['en-GB','en-US'].includes(s.settings.accent)&&Number.isFinite(s.settings.rate)&&s.settings.rate>=0.5&&s.settings.rate<=1.2&&Number.isInteger(s.settings.goal)&&s.settings.goal>=5&&s.settings.goal<=100&&/^([01]\d|2[0-3]):[0-5]\d$/.test(s.settings.reminder)&&Array.isArray(s.badges)&&s.badges.every(x=>typeof x==='string');}
export function load(){try{const s=JSON.parse(localStorage.getItem(STORAGE_KEY));return validateSave(s)?{...fresh(),...s,settings:{...fresh().settings,...s.settings}}:fresh();}catch{return fresh();}}
export function schedule(previous,rating,now=Date.now()){
 if(!['again','hard','good','easy'].includes(rating))throw new Error('Invalid rating');
 const c=previous||{reps:0,interval:0,ease:2.5,lapses:0};
 if(rating==='again')return {...c,reps:0,interval:0,due:now+10*60000,lapses:(c.lapses||0)+1,last:now,ease:Math.max(1.3,c.ease-0.2)};
 const reps=c.reps+1,ease=Math.max(1.3,c.ease+(rating==='hard'?-0.15:rating==='easy'?0.15:0));
 const interval=rating==='hard'?Math.max(1,Math.round(c.interval*1.2)):reps===1?(rating==='easy'?4:1):reps===2?(rating==='easy'?7:3):Math.max(1,Math.round(c.interval*ease*(rating==='easy'?1.3:1)));
 return {...c,reps,interval,ease,due:now+interval*DAY,last:now};
}
export function grade(state,id,rating,now=Date.now()){
 const correct=rating!=='again',day=localDay(now),xp=state.xp+(correct?10:2),coins=state.coins+(correct?3:0);
 const next={...state,xp,coins,cards:{...state.cards,[id]:schedule(state.cards[id],rating,now)},days:{...state.days,[day]:(state.days[day]||0)+1}};
 next.badges=[...new Set([...state.badges,...(Object.keys(next.cards).length>=1?['first']:[]),...(Object.keys(next.cards).length>=100?['century']:[]),...(xp>=1000?['xp1000']:[])])];return next;
}
export const dueWords=(words,s,now=Date.now())=>words.filter(w=>s.cards[w.id]?.due<=now).sort((a,b)=>s.cards[a.id].due-s.cards[b.id].due);
export function streak(s,now=Date.now()){let count=0;const d=new Date(now);if(!s.days[localDay(d)])d.setDate(d.getDate()-1);while(s.days[localDay(d)]){count++;d.setDate(d.getDate()-1);}return count;}
export const shuffle=(xs)=>{const a=[...xs];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
export const normalize=(s)=>s.toLowerCase().normalize('NFKC').replace(/[’‘]/g,"'").replace(/[^a-z0-9' -]/g,'').replace(/\s+/g,' ').trim();
export function choices(word,pool){const seen=new Set([word.meaning]);return shuffle([word,...shuffle(pool.filter(w=>w.id!==word.id)).filter(w=>{if(seen.has(w.meaning))return false;seen.add(w.meaning);return true;}).slice(0,3)]);}
export function sessionWords(words,s,{topic='all',review=false,favorites=false,count=10}={}){let pool=words.filter(w=>topic==='all'||w.topic===topic);if(favorites)pool=pool.filter(w=>s.favorites.includes(w.id));if(review)return dueWords(pool,s).slice(0,count);const due=dueWords(pool,s),unseen=pool.filter(w=>!s.cards[w.id]);return [...due,...shuffle(unseen),...shuffle(pool.filter(w=>s.cards[w.id]&&s.cards[w.id].due>Date.now()))].slice(0,count);}
