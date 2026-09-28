import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
function offline(){return {name:'offline-shell',closeBundle(){
 const files=fs.readdirSync('dist/assets').map(f=>'/assets/'+f);
 const assets=['/','/index.html','/vocabulary.json','/content-report.json','/icon.svg','/icon-192.png','/icon-512.png','/manifest.webmanifest','/ATTRIBUTION.md','/IPA-LICENSE.txt','/DATA-LICENSE.txt','/FREQUENCY-LICENSE.txt',...files];
 const version=crypto.createHash('sha256').update(files.join('|')+fs.readFileSync('dist/vocabulary.json')).digest('hex').slice(0,12);
 const code="const CACHE='vua-english-"+version+"';const ASSETS="+JSON.stringify(assets)+";self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));});self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('vua-english-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});self.addEventListener('fetch',e=>{if(e.request.method!=='GET'||new URL(e.request.url).origin!==self.location.origin)return;if(e.request.mode==='navigate'){e.respondWith(fetch(e.request).catch(()=>caches.match('/index.html',{ignoreVary:true})));return;}e.respondWith(caches.match(e.request,{ignoreVary:true}).then(cached=>cached||fetch(e.request)));});self.addEventListener('notificationclick',e=>{e.notification.close();e.waitUntil(self.clients.matchAll({type:'window'}).then(cs=>cs.length?cs[0].focus():self.clients.openWindow('/')));});";
 fs.writeFileSync(path.join('dist','sw.js'),code);
}};}
export default defineConfig({plugins:[react(),offline()],build:{target:'es2020'},server:{port:5193,strictPort:true}});
