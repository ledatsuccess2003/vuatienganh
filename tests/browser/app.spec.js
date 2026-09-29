import {test,expect} from '@playwright/test';
import fs from 'node:fs';
const words=JSON.parse(fs.readFileSync('public/vocabulary.json','utf8'));
const wordMap=new Map(words.map(w=>[w.word,w]));
test.beforeEach(async({page})=>{await page.goto('./');await expect(page.getByRole('button',{name:'Bắt đầu phiêu lưu'})).toBeVisible();});
test('adventure grades correct answers, awards XP, persists cards and unlocks next stage',async({page})=>{
 await page.getByRole('button',{name:'Bắt đầu phiêu lưu'}).click();
 for(let i=0;i<10;i++){const word=await page.locator('.quiz-word').textContent();const meaning=wordMap.get(word).meaning;await page.locator('.quiz-options button').filter({hasText:meaning}).first().click();await expect(page.getByText('Chính xác! +10 XP')).toBeVisible();await page.getByRole('button',{name:i===9?'Xem kết quả':'Tiếp theo',exact:true}).click();}
 await expect(page.getByText('Đã mở ải tiếp theo')).toBeVisible();await page.getByRole('button',{name:'Về hành trình'}).click();
 const s=await page.evaluate(()=>JSON.parse(localStorage.getItem('vua-english-v1')));expect(s.xp).toBe(100);expect(s.coins).toBe(30);expect(s.stage).toBe(2);expect(Object.keys(s.cards)).toHaveLength(10);
 await page.reload();await expect(page.locator('.chapter')).toContainText('Ải 2');
});
test('flashcards require reveal, grade wrong cards into ten-minute review, and expose both IPA variants',async({page})=>{
 await page.locator('.sidebar').getByRole('button',{name:'Flashcards',exact:true}).click();await page.getByRole('button',{name:'Học 10 thẻ',exact:false}).click();
 await expect(page.getByRole('button',{name:'Chưa nhớ',exact:true})).toHaveCount(0);
 await page.getByRole('button',{name:'Lật thẻ · Xem đáp án'}).click();const word=await page.locator('.flashcard h2').textContent();await page.getByRole('button',{name:'Chưa nhớ',exact:true}).click();
 const s=await page.evaluate(()=>JSON.parse(localStorage.getItem('vua-english-v1')));expect(s.cards[word].due-Date.now()).toBeLessThanOrEqual(600000);expect(s.cards[word].due-Date.now()).toBeGreaterThan(580000);expect(s.xp).toBe(2);
});
test('cloze evaluates typed English, incorrect answers reveal correct word and a contextual example',async({page})=>{
 await page.getByRole('button',{name:/Mảnh ghép IELTS/}).click();await page.getByLabel('Đáp án của bạn').fill('wronganswer');await page.getByRole('button',{name:'Kiểm tra',exact:false}).click();
 await expect(page.getByText('Chưa đúng — mình học lại nhé.')).toBeVisible();await expect(page.locator('.feedback p')).toHaveCount(2);await expect(page.locator('.answer-form input')).toBeDisabled();
});
test('matching actually pairs words with their meanings and completes all five pairs',async({page})=>{
 await page.getByRole('button',{name:/Cặp đôi trí nhớ/}).click();const left=page.locator('.match-columns>div').first(),right=page.locator('.match-columns>div').last();
 const labels=await left.locator('button').allTextContents();
 for(const w of labels){await left.getByRole('button',{name:w,exact:true}).click();await right.getByRole('button',{name:wordMap.get(w).meaning,exact:true}).click();}
 await expect(page.getByText('Hoàn thành xuất sắc!')).toBeVisible();expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('vua-english-v1')).xp)).toBe(50);
});
test('listening requires playing audio before grading and accepts a correct spelling',async({page})=>{
 await page.evaluate(()=>{Object.defineProperty(window,'speechSynthesis',{value:{getVoices:()=>[{lang:'en-GB',name:'Test English'}],cancel:()=>{},speak:u=>{window.testSpoken=u.text;}},configurable:true});window.SpeechSynthesisUtterance=class{constructor(text){this.text=text;}};});
 await page.getByRole('button',{name:/Đôi tai siêu hạng/}).click();await page.getByLabel('Đáp án của bạn').fill('test');await expect(page.getByRole('button',{name:'Kiểm tra',exact:false})).toBeDisabled();
 await page.getByRole('button',{name:'Nghe câu hỏi',exact:true}).click();const word=await page.evaluate(()=>window.testSpoken);await page.getByLabel('Đáp án của bạn').fill(word);await page.getByRole('button',{name:'Kiểm tra',exact:false}).click();await expect(page.getByText('Chính xác! +10 XP')).toBeVisible();
});
test('survival ends at three wrong answers without negative hearts or additional grades',async({page})=>{
 await page.locator('.sidebar').getByRole('button',{name:/Học qua game/}).click();await page.getByRole('button',{name:/Thử thách 3 trái tim/}).click();
 for(let i=0;i<3;i++){const w=await page.locator('.quiz-word').textContent();const options=page.locator('.quiz-options button');const texts=await options.allTextContents();const wrong=texts.findIndex(t=>!t.includes(wordMap.get(w).meaning));await options.nth(wrong).click();await page.getByRole('button',{name:i===2?'Xem kết quả':'Tiếp theo',exact:true}).click();}
 await expect(page.getByText('Đúng 0/3 lượt', {exact:false})).toBeVisible();expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('vua-english-v1')).xp)).toBe(6);
});
test('favorite, search, word detail and persistence work across reload',async({page})=>{
 await page.getByRole('button',{name:'Lưu từ',exact:true}).click();await page.locator('.sidebar').getByRole('button',{name:'Từ yêu thích',exact:true}).click();await expect(page.locator('.word-card')).toHaveCount(1);await page.reload();
 await page.locator('.sidebar').getByRole('button',{name:'Từ yêu thích',exact:true}).click();await expect(page.locator('.word-card')).toHaveCount(1);await page.locator('.word-card-open').click();await expect(page.locator('.ipa-pair')).toContainText('UK');await expect(page.locator('.ipa-pair')).toContainText('US');await expect(page.locator('.example-box')).toContainText('sustainable development');
 await page.keyboard.press('Escape');await expect(page.getByRole('dialog')).toHaveCount(0);
});
test('responsive pages fit 320px through 1920px and game modal fits small phones',async({page})=>{
 for(const width of [320,360,390,768,1024,1440,1920]){
  await page.setViewportSize({width,height:900});await page.reload();await expect(page.getByRole('button',{name:'Bắt đầu phiêu lưu'})).toBeVisible();
  const dim=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth}));expect(dim.scroll,'overflow at '+width).toBeLessThanOrEqual(dim.client);
  if(width===390||width===1440){fs.mkdirSync('qa',{recursive:true});await page.screenshot({path:'qa/home-'+width+'.png',fullPage:true});}
  await page.getByRole('button',{name:'Bắt đầu phiêu lưu'}).click();const modal=await page.locator('.modal').boundingBox();expect(modal.x).toBeGreaterThanOrEqual(0);expect(modal.x+modal.width).toBeLessThanOrEqual(width);await page.keyboard.press('Escape');
 }
});
test('service worker caches complete vocabulary and app remains usable offline',async({page,context})=>{
 await page.evaluate(async()=>{await navigator.serviceWorker.ready;});await page.waitForFunction(()=>!!navigator.serviceWorker.controller);
 await context.setOffline(true);await page.reload();await expect(page.getByRole('button',{name:'Bắt đầu phiêu lưu'})).toBeVisible();
 expect(await page.evaluate(async()=>(await document.fonts.load('400 14px "Be Vietnam Pro"')).length)).toBeGreaterThan(0);
 await page.getByRole('button',{name:'Bắt đầu phiêu lưu'}).click();await expect(page.locator('.quiz-word')).toBeVisible();await context.setOffline(false);
});
test('fixed install action opens clear guidance, accepts browser prompt, and leaves mobile navigation usable',async({page})=>{
 await page.setViewportSize({width:320,height:700});
 const bar=page.locator('.install-bar');await expect(bar).toBeVisible();
 const nav=page.locator('.mobile-bottom');
 const bounds=await Promise.all([bar.boundingBox(),nav.boundingBox()]);
 expect(bounds[0].y+bounds[0].height).toBeLessThanOrEqual(bounds[1].y+2);
 await page.getByRole('button',{name:'Tải app',exact:true}).click();
 await expect(page.getByRole('dialog',{name:'Tải app Vua Tiếng Anh'})).toContainText('Thêm vào Màn hình chính');
 await page.getByRole('button',{name:'Đã hiểu'}).click();
 await page.evaluate(()=>{const offer=new Event('beforeinstallprompt',{cancelable:true});offer.prompt=()=>{window.pwaPrompted=true;return Promise.resolve();};offer.userChoice=Promise.resolve({outcome:'accepted'});window.dispatchEvent(offer);});
 await page.getByRole('button',{name:'Tải app',exact:true}).click();
 expect(await page.evaluate(()=>window.pwaPrompted)).toBe(true);
 await page.evaluate(()=>window.dispatchEvent(new Event('appinstalled')));
 await expect(bar).toHaveCount(0);
 await nav.getByRole('button',{name:'Game'}).click();await expect(page.getByRole('heading',{name:'Sân chơi từ vựng'})).toBeVisible();
});
test('every learning page stays within phone, tablet, and laptop viewports',async({page})=>{
 test.setTimeout(90000);
 const labels=['E-book A','Học qua game','Flashcards','Kho từ vựng','Ôn tập hôm nay','Từ yêu thích','Luyện phát âm','Cài đặt'];
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 for(const width of [320,390,768,1024,1440]){
  await page.setViewportSize({width,height:800});
  for(const label of labels){
   if(width<=760)await page.getByRole('button',{name:'Mở menu'}).click();
   await page.locator('.sidebar').getByRole('button',{name:label}).click();
   const size=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth}));
   expect(size.scroll,`${label} overflows at ${width}px`).toBeLessThanOrEqual(size.client);
  }
 }
 expect(errors).toEqual([]);
});
