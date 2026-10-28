// Independent evaluator. Uses existing Playwright + existing Chromium, no downloads.
const fs=require('fs'),path=require('path'),cp=require('child_process');
const {chromium,request}=require('playwright');
const [repoArg,outArg,portArg]=process.argv.slice(2);
if(!repoArg||!outArg||!portArg)throw new Error('usage: node evaluate.cjs REPO OUT PORT');
const repo=path.resolve(repoArg),out=path.resolve(outArg),port=Number(portArg),base=`http://127.0.0.1:${port}`;
fs.mkdirSync(out,{recursive:true});
const git=(...args)=>{try{return cp.execFileSync('git',['-C',repo,...args],{encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim()}catch{return 'unavailable'}};
const result={started_utc:new Date().toISOString(),repo,head:git('rev-parse','HEAD'),status_before:git('status','--short'),assertions:[],styles:{},screenshots:[],console_errors:[],ui_scores:{}};
// Original recorded diffs live in evidence/recorded; this run records the current publication checkout.
fs.writeFileSync(path.join(out,'working-tree.diff'),git('diff','--',repo));
fs.writeFileSync(path.join(out,'git-log.txt'),git('log','-5','--format=%H %cI %s'));
result.run_kind='verification of published snapshot; not the original measured experiment';
const unit=cp.spawnSync('python3',['-m','unittest','discover','-s','tests','-v'],{cwd:repo,encoding:'utf8'});
fs.writeFileSync(path.join(out,'unit-tests.log'),unit.stdout+unit.stderr);result.unit_test_exit=unit.status;
const log=fs.openSync(path.join(out,'server.log'),'w');
const server=cp.spawn('python3',['server.py','--port',String(port)],{cwd:repo,stdio:['ignore',log,log]});
let browser,api;
const assert=(condition,message)=>{if(!condition)throw new Error(message)};
async function test(name,fn){try{const detail=await fn();result.assertions.push({name,pass:true,detail});}catch(e){result.assertions.push({name,pass:false,error:String(e.message)});}}
async function call(method,body,q=''){const r=await api[method](base+'/api/requests'+q,body===undefined?{}:{data:body});let data;try{data=await r.json()}catch{data=await r.text()}return{status:r.status(),data};}
async function styles(page){return page.evaluate(()=>{
 const val=e=>{if(!e)return null;const c=getComputedStyle(e),r=e.getBoundingClientRect();return{font:c.fontFamily,fontSize:c.fontSize,padding:c.padding,gap:c.gap,rowGap:c.rowGap,marginBottom:c.marginBottom,marginTop:c.marginTop,maxWidth:c.maxWidth,bg:c.backgroundColor,color:c.color,radius:c.borderRadius,width:r.width,left:r.left,height:r.height,border:c.border,display:c.display};};
 const header=document.querySelector('header'),nav=document.querySelector('nav'),main=document.querySelector('main'),button=document.querySelector('button[type=submit],button'),input=document.querySelector('input');
 const active=nav&&[...nav.querySelectorAll('a')].filter(a=>a.getAttribute('aria-current')==='page'||/active|current/.test(a.className)).map(a=>a.textContent.trim());
 return{body:val(document.body),header:val(header),headerText:header?.textContent.trim(),main:val(main),nav:val(nav),links:nav?[...nav.querySelectorAll('a')].map(a=>({text:a.textContent.trim(),href:a.getAttribute('href')})):[],active,button:val(button),input:val(input),card:val(document.querySelector('.card,[data-card],article,form')),spacingCandidates:[...document.querySelectorAll('main,main *')].slice(0,60).map(e=>({tag:e.tagName,class:e.className,...val(e)})),overflow:document.documentElement.scrollWidth>innerWidth};
 });}
async function snapshot(page,name){await page.screenshot({path:path.join(out,name+'.png'),fullPage:true});result.screenshots.push(name+'.png');}
(async()=>{
 api=await request.newContext();let ready=false;for(let n=0;n<50;n++){try{await api.get(base+'/create',{timeout:500});ready=true;break}catch{await new Promise(r=>setTimeout(r,100))}}if(!ready)throw new Error('local server failed to start');
 await test('api_seed_v2',async()=>{const r=await call('get');assert(r.status===200,'GET status '+r.status);assert(r.data.requests?.length===2,'expected two seeds');assert(r.data.requests.every(x=>x.requester?.email&&!('contact'in x)),'seed schema is not v2');return r;});
 for(const [name,payload]of[
 ['api_reject_legacy',{title:'Legacy',contact:'Mina Park'}],
 ['api_reject_missing_email',{title:'Missing',requester:{name:'Mina Park'}}],
 ['api_reject_invalid_email',{title:'Bad email',requester:{name:'Mina Park',email:'not-email'}}],
 ['api_reject_wrong_type',{title:'Wrong',requester:'Mina Park'}],
 ['api_reject_blank_title',{title:' ',requester:{name:'Mina Park',email:'mina@example.test'}}],
 ['api_reject_long_title',{title:'x'.repeat(81),requester:{name:'Mina Park',email:'mina@example.test'}}]
 ])await test(name,async()=>{const r=await call('post',payload);assert(r.status===422,'expected422, got'+r.status);assert(typeof r.data.error==='string'&&r.data.error.length>0,'missing error');return r;});
 await test('api_create_v2',async()=>{const r=await call('post',{title:'API request',requester:{name:'Arin Kim',email:'api-arin@example.test'}});assert(r.status===201,'POST status '+r.status);assert(r.data.request?.id&&r.data.request.requester?.email==='api-arin@example.test'&&!('contact'in r.data.request),'created schema');return r;});
 await test('api_search_email',async()=>{const r=await call('get',undefined,'?q=API-ARIN%40EXAMPLE.TEST');assert(r.status===200&&r.data.requests?.some(x=>x.title==='API request'),'email query missed item');return r;});
 await test('api_search_name',async()=>{const r=await call('get',undefined,'?q=MINA');assert(r.status===200&&r.data.requests?.some(x=>x.id==='seed-1'),'name query regression');return r;});
 await test('api_empty_search',async()=>{const r=await call('get',undefined,'?q=zz-no-result-872');assert(r.status===200&&r.data.requests?.length===0,'empty result mismatch');return r;});
 browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ? {executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE} : {})});
 const page=await browser.newPage({viewport:{width:1280,height:800}});page.on('pageerror',e=>result.console_errors.push(String(e)));
 await page.goto(base+'/create');await snapshot(page,'desktop-create');result.styles.create=await styles(page);
 await test('browser_create_v2',async()=>{await page.getByLabel('Title',{exact:true}).fill('Flow request');await page.getByLabel('Requester name',{exact:true}).fill('Arin Kim');await page.getByLabel('Requester email',{exact:true}).fill('arin@example.test');const response=page.waitForResponse(r=>r.url().endsWith('/api/requests')&&r.request().method()==='POST',{timeout:5000});await page.getByRole('button',{name:'Create request',exact:true}).click();const r=await response;assert(r.status()===201,'UI POST status '+r.status());await page.waitForTimeout(100);return{post_status:r.status(),body:(await page.locator('body').innerText()).slice(-700)};});
 await test('browser_navigate_search',async()=>{await page.getByRole('link',{name:'Requests',exact:true}).first().click();await page.getByLabel('Search',{exact:true}).fill('arin@example.test');await page.getByRole('button',{name:'Search',exact:true}).click();await page.getByText('Flow request',{exact:true}).waitFor({timeout:5000});assert((await page.locator('body').innerText()).includes('arin@example.test'),'email not displayed');return{url:page.url()};});
 await test('browser_reload_preserves_record',async()=>{await page.reload();await page.getByText('Flow request',{exact:true}).waitFor({timeout:5000});return{url:page.url()};});
 await page.goto(base+'/requests');await page.waitForTimeout(150);result.styles.requests=await styles(page);await snapshot(page,'desktop-requests');
 await test('browser_empty_state',async()=>{await page.getByLabel('Search',{exact:true}).fill('zz-no-result-872');await page.getByRole('button',{name:'Search',exact:true}).click();await page.waitForTimeout(150);const text=await page.locator('main').innerText();assert(/no .*request|no .*result|nothing|empty|0 request/i.test(text),'no meaningful empty state: '+text);return{text};});
 await test('browser_safe_html',async()=>{const title='<img src=x onerror="window.__fixtureXss=1">';const r=await call('post',{title,requester:{name:'Safe Example',email:'safe@example.test'}});assert(r.status===201,'unable to create HTML text');await page.goto(base+'/requests');await page.getByText(title,{exact:true}).waitFor({timeout:5000});assert(await page.evaluate(()=>!window.__fixtureXss),'input executed');assert(await page.locator('main img[src="x"]').count()===0,'input inserted as HTML');return{rendered_as_text:true};});
 await test('browser_invalid_email_feedback',async()=>{await page.goto(base+'/create');await page.getByLabel('Title',{exact:true}).fill('Invalid UI');await page.getByLabel('Requester name',{exact:true}).fill('Arin Kim');const field=page.getByLabel('Requester email',{exact:true});await field.fill('bad');await page.getByRole('button',{name:'Create request',exact:true}).click();await page.waitForTimeout(150);const native=await field.evaluate(e=>({invalid:!e.validity.valid,message:e.validationMessage}));const body=await page.locator('body').innerText();assert((native.invalid&&native.message)||/invalid|valid email|email.*required/i.test(body),'no visible/native invalid email feedback');return{native,body:body.slice(-500)};});
 await page.setViewportSize({width:390,height:844});
 for(const route of ['create','requests'])await test('mobile_'+route+'_no_overflow',async()=>{await page.goto(base+'/'+route);await page.waitForTimeout(100);const s=await styles(page);result.styles['mobile_'+route]=s;await snapshot(page,'mobile-'+route);assert(!s.overflow,'horizontal overflow');return{main:s.main,input:s.input};});
 const a=result.styles.create,b=result.styles.requests;
 const same=(x,y)=>JSON.stringify(x)===JSON.stringify(y);
 result.ui_scores.shell=!!(a.header&&b.header&&a.headerText.includes('Request Desk')&&b.headerText.includes('Request Desk')&&Math.abs(a.header.height-b.header.height)<=2&&a.header.bg===b.header.bg);
 result.ui_scores.navigation=!!(same(a.links,b.links)&&a.links.some(x=>x.text==='New request'&&x.href==='/create')&&a.links.some(x=>x.text==='Requests'&&x.href==='/requests')&&a.active?.length&&b.active?.length);
 result.ui_scores.width=!!(a.main?.maxWidth==='960px'&&b.main?.maxWidth==='960px'&&Math.abs(a.main.left-b.main.left)<=2&&!a.overflow&&!b.overflow);
 result.ui_scores.typography=!!(a.body.fontSize==='16px'&&b.body.fontSize==='16px'&&a.body.font===b.body.font&&/system-ui|-apple-system|BlinkMacSystemFont|Segoe UI/.test(a.body.font));
 const has24=s=>s.spacingCandidates.some(x=>[x.gap,x.rowGap,x.marginBottom,x.marginTop,...x.padding.split(' ')].includes('24px'));
 result.ui_scores.spacing=!!(has24(a)&&has24(b));
 result.ui_scores.components=!!(a.input?.radius==='8px'&&b.input?.radius==='8px'&&a.button?.radius==='8px'&&b.button?.radius==='8px'&&a.button.height>=40&&b.button.height>=40&&a.button.bg==='rgb(37, 99, 235)'&&b.button.bg==='rgb(37, 99, 235)'&&a.input.border===b.input.border);
 result.ui_score=Object.values(result.ui_scores).filter(Boolean).length;
 result.assertion_pass=result.assertions.filter(x=>x.pass).length;result.assertion_total=result.assertions.length;
 result.finished_utc=new Date().toISOString();result.head_after=git('rev-parse','HEAD');
 console.log(JSON.stringify({head:result.head,pass:result.assertion_pass,total:result.assertion_total,ui:result.ui_score,failures:result.assertions.filter(x=>!x.pass),ui_scores:result.ui_scores},null,2));
})().catch(e=>{result.fatal=String(e.stack||e);console.error(e);process.exitCode=1}).finally(async()=>{if(browser)await browser.close();if(api)await api.dispose();server.kill('SIGTERM');fs.closeSync(log);fs.writeFileSync(path.join(out,'result.json'),JSON.stringify(result,null,2)+'\n');});
