const {chromium}=require('C:/Users/Hi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const {pathToFileURL}=require('url'), path=require('path'), assert=require('assert/strict');
(async()=>{
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
for(const [name,width,height] of [['desktop',1440,1000],['mobile',390,950]]){
 const page=await browser.newPage({viewport:{width,height}});
 await page.goto(pathToFileURL(path.resolve(__dirname,'../index.html')).href);
 await page.evaluate(()=>document.fonts.ready);
 await page.waitForTimeout(400);
 const snapshot=()=>page.evaluate(()=>[...document.querySelectorAll('#home, .hero-copy, .hero-copy > *, .hero-frame, .hero-controls')].map(el=>({html:el.innerHTML,rect:JSON.stringify(el.getBoundingClientRect())})));
 const before=await snapshot();
 const hide=await page.addStyleTag({content:'.hero-copy::before{display:none!important}'});
 await page.screenshot({path:path.join(__dirname,'gentleman-'+name+'-before.png')});
 await hide.evaluate(el=>el.remove());
 await page.screenshot({path:path.join(__dirname,'gentleman-'+name+'-after.png')});
 await page.screenshot({path:path.join(__dirname,'gentleman-'+name+'-hero-only.png'),clip:await page.locator('#home').boundingBox()});
 assert.deepEqual(await snapshot(),before);
 assert.equal(await page.locator('.hero-slide').count(),7);
 for(let i=0;i<7;i++){await page.locator('.hero-dot').nth(i).click();assert.equal(await page.locator('.hero-slide:not([hidden])').getAttribute('data-slide'),String(i));await page.locator('.hero-slide:not([hidden]) img').evaluate(img=>img.decode());}
 await page.locator('.hero-next').click();assert.equal(await page.locator('.hero-slide-count').innerText(),'01 / 07');
 await page.locator('.hero-prev').click();assert.equal(await page.locator('.hero-slide-count').innerText(),'07 / 07');
 for(const target of ['products','contact']){await page.locator('.hero-copy a[href="#'+target+'"]').click();assert.equal(new URL(page.url()).hash,'#'+target);}
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 console.log(name+': identical geometry and content; seven images loaded; dots/arrows/CTAs pass');
 await page.close();
}
await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
