import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const base=process.env.SITE_BASE||'/';
function offline(){return {name:'offline-shell',closeBundle(){
 const files=fs.readdirSync('dist/assets').map(f=>base+'assets/'+f);
 const assets=['','index.html','vocabulary.json','ebook-a.json','content-report.json','icon.svg','icon-192.png','icon-512.png','manifest.webmanifest','ATTRIBUTION.md','IPA-LICENSE.txt','DATA-LICENSE.txt','FREQUENCY-LICENSE.txt'].map(f=>base+f).concat(files);
 const prefix='vua-english-'+crypto.createHash('sha256').update(base).digest('hex').slice(0,8)+'-';
 const version=crypto.createHash('sha256').update(files.join('|')+fs.readFileSync('dist/vocabulary.json')+fs.readFileSync('dist/ebook-a.json')).digest('hex').slice(0,12);
 const code="const BASE="+JSON.stringify(base)+";const PREFIX="+JSON.stringify(prefix)+";const CACHE=PREFIX+'"+version+"';const ASSETS="+JSON.stringify(assets)+";self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));});self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith(PREFIX)&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});self.addEventListener('fetch',e=>{const url=new URL(e.request.url);if(e.request.method!=='GET'||url.origin!==self.location.origin||!url.pathname.startsWith(BASE))return;if(e.request.mode==='navigate'){e.respondWith(fetch(e.request).catch(()=>caches.match(BASE+'index.html',{ignoreVary:true})));return;}e.respondWith(caches.match(e.request,{ignoreVary:true}).then(cached=>cached||fetch(e.request)));});self.addEventListener('notificationclick',e=>{e.notification.close();e.waitUntil(self.clients.matchAll({type:'window'}).then(cs=>{const own=cs.find(c=>new URL(c.url).pathname.startsWith(BASE));return own?own.focus():self.clients.openWindow(BASE);}));});";
 fs.writeFileSync(path.join('dist','sw.js'),code);
}};}
export default defineConfig({base,plugins:[react(),offline()],build:{target:'es2020'},server:{port:5193,strictPort:true}});
