(()=>{'use strict';
const CONFIG_KEY='xingxu_billing_config_v1',USERS_KEY='xingxu_billing_users_v1';
const defaults={freeQuota:2,questionCost:300,signInReward:150,lifetimePrice:300,packages:[{id:'once',water:300,price:10,label:'按次充值'},{id:'basic',water:1000,price:20,label:'基础水包'},{id:'plus',water:2000,price:50,label:'进阶水包'},{id:'long',water:10000,price:100,label:'长用水包'}],payeeName:'星序水务（虚拟演示）',payeeAccount:'XINGXU-DEMO-20260803-001'};
const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))||fallback}catch(e){return fallback}};
const number=(value,fallback)=>Number.isFinite(+value)&&+value>=0?+value:fallback;
const esc=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const normalizeConfig=raw=>{let cfg={...defaults,...(raw||{})};cfg.freeQuota=number(cfg.freeQuota,2);cfg.questionCost=number(cfg.questionCost,300);cfg.signInReward=number(cfg.signInReward,150);cfg.lifetimePrice=number(cfg.lifetimePrice,300);cfg.packages=Array.isArray(cfg.packages)&&cfg.packages.length?cfg.packages.map((p,i)=>({id:String(p.id||'p'+i),water:number(p.water,0),price:number(p.price,0),label:String(p.label||'水包')})):defaults.packages;return cfg};
const session=window.XingxuAuth?.getSession?.();
if(!session){window.XingxuBilling={authorizeQuestion:()=>false,openWallet:()=>window.XingxuAuth?.openProfile?.(),recordPrediction:()=>false,getState:()=>null};return}
const memberId=session.memberId,phone=session.phone;
let config=normalizeConfig(read(CONFIG_KEY,defaults)),users=read(USERS_KEY,{}),selectedPackage='once',insufficient=false;
const freshUser=()=>({id:memberId,balance:0,freeUsed:0,totalQuestions:0,paidQuestions:0,totalRecharged:0,lifetimeMember:false,lifetimePaid:0,lastCheckIn:'',createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),logs:[],questions:[],profile:{phone}});
const normalizeUser=value=>{let source=value||{};return{...freshUser(),...source,id:memberId,balance:number(source.balance,0),freeUsed:number(source.freeUsed,0),totalQuestions:number(source.totalQuestions,0),paidQuestions:number(source.paidQuestions,0),totalRecharged:number(source.totalRecharged,0),lifetimeMember:source.lifetimeMember===true,lifetimePaid:number(source.lifetimePaid,0),logs:Array.isArray(source.logs)?source.logs:[],questions:Array.isArray(source.questions)?source.questions:[],profile:{...(source.profile||{}),phone}}};
let user=normalizeUser(users[memberId]);users[memberId]=user;localStorage.setItem(USERS_KEY,JSON.stringify(users));
const sync=()=>{config=normalizeConfig(read(CONFIG_KEY,defaults));users=read(USERS_KEY,{});user=normalizeUser(users[memberId]);users[memberId]=user};
const persist=()=>{user.updatedAt=new Date().toISOString();users[memberId]=user;localStorage.setItem(USERS_KEY,JSON.stringify(users));render()};
const log=(type,delta,note)=>{user.logs.unshift({id:Date.now()+Math.random(),type,delta,note,time:new Date().toLocaleString()});user.logs=user.logs.slice(0,80)};
const today=()=>{let d=new Date(),m=String(d.getMonth()+1).padStart(2,'0'),day=String(d.getDate()).padStart(2,'0');return d.getFullYear()+'-'+m+'-'+day};
const css=document.createElement('link');css.rel='stylesheet';css.href='./billing.css?v=20260803-local3';document.head.appendChild(css);
const markup=[
'<button class="water-wallet" id="waterWallet" type="button" aria-label="打开水账户"><span class="water-drop"><span>水</span></span><span><strong id="walletBalance">0水</strong><small id="walletTrial">免费2问</small></span></button>',
'<div class="billing-overlay" id="billingOverlay" hidden><section class="billing-dialog" role="dialog" aria-modal="true" aria-labelledby="billingTitle">',
'<button class="billing-close" id="billingClose" type="button" aria-label="关闭">×</button><div class="billing-kicker">星序 · 水账户</div><h2 id="billingTitle">水账户与提问规则</h2><p class="billing-lead" id="billingLead"></p>',
'<div class="billing-status"><div class="billing-stat"><small>当前账户</small><b id="billingBalance">0水</b></div><div class="billing-stat"><small>永久免费次数</small><b id="billingFree">2次</b></div><div class="billing-stat"><small>登录手机</small><b id="billingAccount"></b></div></div>',
'<div class="billing-account-line"><span>会员编号：<b id="billingMember"></b></span><button id="billingEditProfile" type="button">个人资料</button><button id="billingLogout" type="button">退出登录</button></div>',
'<div class="billing-process"><b>提问与收费过程</b><ol><li>每个手机号永久赠送2次有效提问，前两问不扣水。</li><li>赠送次数用完后，每问扣除<span id="billingCost">300</span>水；余额不足不生成答案，也不会扣水。</li><li>可以选择水包按次使用，也可以一次开通永久会员，终身提问不再扣水。</li><li>用户提交的原问题全文会保存在该账号记录中，供本人服务和站长后台查询。</li></ol></div>',
'<div class="billing-packages" id="billingPackages"></div><div class="virtual-payee"><div><small>虚拟收款人账号 · 仅供本地走流程</small><b id="billingPayee"></b></div><span class="demo-badge">不产生真实交易</span></div>',
'<div class="billing-actions"><button class="billing-secondary" id="billingCheckIn" type="button"></button><button class="billing-primary" id="billingPay" type="button">模拟支付并充值</button></div>',
'<p class="billing-note">充值前请看清金额和所得权益。本演示不连接任何真实支付渠道，也不会自动续费。</p></section></div><div class="billing-toast" id="billingToast" role="status" aria-live="polite"></div>'
].join('');
document.body.insertAdjacentHTML('beforeend',markup);
const wallet=document.querySelector('#waterWallet'),overlay=document.querySelector('#billingOverlay'),title=document.querySelector('#billingTitle'),lead=document.querySelector('#billingLead'),packages=document.querySelector('#billingPackages'),toastBox=document.querySelector('#billingToast');
let toastTimer=0;
const toast=message=>{toastBox.textContent=message;toastBox.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toastBox.classList.remove('show'),2400)};
const freeLeft=()=>Math.max(0,config.freeQuota-user.freeUsed);
function render(){
 sync();
 document.querySelector('#walletBalance').textContent=user.lifetimeMember?'永久会员':user.balance+'水';
 document.querySelector('#walletTrial').textContent=user.lifetimeMember?'终身提问不扣水':freeLeft()>0?'免费剩'+freeLeft()+'问':'每问'+config.questionCost+'水';
 document.querySelector('#billingBalance').textContent=user.lifetimeMember?'永久会员':user.balance+'水';
 document.querySelector('#billingFree').textContent=user.lifetimeMember?'已开通':freeLeft()+'次';
 document.querySelector('#billingAccount').textContent=window.XingxuAuth.maskPhone(phone);
 document.querySelector('#billingMember').textContent=memberId;
 document.querySelector('#billingCost').textContent=config.questionCost;
 document.querySelector('#billingPayee').textContent=config.payeeName+' · '+config.payeeAccount;
 lead.textContent=user.lifetimeMember?'这个手机号已经是永久会员，今后每次提问直接生成答案，不再扣水。':insufficient?'2次免费提问已经用完，当前余水不足。可以充值水包，也可以开通永久会员；关闭窗口不会扣费。':'每个手机号永久赠送2次提问，之后可按水扣费或开通永久会员，每天还可以签到一次。';
 let waterCards=config.packages.map(p=>'<button class="billing-package'+(p.id===selectedPackage?' active':'')+'" type="button" data-package="'+esc(p.id)+'"><b>'+p.water+'水</b><span>'+p.price+'元</span><small>'+esc(p.label)+'</small></button>').join('');
 let lifetimeCard='<button class="billing-package'+(selectedPackage==='lifetime'?' active':'')+'" type="button" data-package="lifetime"><b>永久会员</b><span>'+config.lifetimePrice+'元</span><small>终身提问不再扣水</small></button>';
 packages.innerHTML=waterCards+lifetimeCard;
 packages.querySelectorAll('[data-package]').forEach(btn=>btn.onclick=()=>{selectedPackage=btn.dataset.package;render()});
 let checked=user.lastCheckIn===today(),check=document.querySelector('#billingCheckIn');check.disabled=checked;check.textContent=checked?'今日已签到':'今日签到 +'+config.signInReward+'水';
 let pay=document.querySelector('#billingPay');if(user.lifetimeMember){pay.disabled=true;pay.textContent='已是永久会员'}else if(selectedPackage==='lifetime'){pay.disabled=false;pay.textContent='模拟支付 '+config.lifetimePrice+'元，开通永久会员'}else{let chosen=config.packages.find(p=>p.id===selectedPackage)||config.packages[0];pay.disabled=false;pay.textContent='模拟支付 '+chosen.price+'元，充值'+chosen.water+'水'}
}
const openWallet=(shortage=false)=>{insufficient=shortage;title.textContent=shortage?'余额不足，请充值':'水账户与提问规则';render();overlay.hidden=false};
const closeWallet=()=>{overlay.hidden=true;insufficient=false};
wallet.onclick=()=>openWallet(false);document.querySelector('#billingClose').onclick=closeWallet;overlay.onclick=e=>{if(e.target===overlay)closeWallet()};
document.querySelector('#billingEditProfile').onclick=()=>{closeWallet();window.XingxuAuth.openProfile()};
document.querySelector('#billingLogout').onclick=()=>window.XingxuAuth.logout();
document.querySelector('#billingCheckIn').onclick=()=>{sync();if(user.lastCheckIn===today()){toast('今天已经签到，明天再来');return}user.balance+=config.signInReward;user.lastCheckIn=today();log('签到',config.signInReward,'每日签到获得'+config.signInReward+'水');persist();toast('签到成功，获得'+config.signInReward+'水')};
document.querySelector('#billingPay').onclick=()=>{sync();if(user.lifetimeMember)return;if(selectedPackage==='lifetime'){user.lifetimeMember=true;user.lifetimePaid=config.lifetimePrice;user.totalRecharged+=config.lifetimePrice;log('开通永久会员',0,'演示支付'+config.lifetimePrice+'元，终身提问不再扣水');insufficient=false;persist();title.textContent='永久会员已开通';toast('永久会员开通成功，今后提问不再扣水');return}let chosen=config.packages.find(p=>p.id===selectedPackage)||config.packages[0];user.balance+=chosen.water;user.totalRecharged+=chosen.price;log('虚拟充值',chosen.water,'演示支付'+chosen.price+'元，获得'+chosen.water+'水');insufficient=false;persist();title.textContent='充值完成';toast('模拟充值成功，到账'+chosen.water+'水')};
const storeQuestion=meta=>{let text=String(meta?.question??''),channel=String(meta?.channel||'问答');if(!text)return;user.questions.unshift({id:Date.now()+Math.random(),time:new Date().toLocaleString(),channel,text,prediction:null})};
const recordQuestion=meta=>{sync();storeQuestion(meta);persist();return true};
const authorizeQuestion=meta=>{sync();storeQuestion(meta);let channel=String(meta?.channel||'问答'),allowed=false,notice='';if(user.lifetimeMember){user.totalQuestions++;log('永久会员提问',0,channel+'永久会员免扣水');allowed=true;notice='永久会员，本题不扣水'}else if(freeLeft()>0){user.freeUsed++;user.totalQuestions++;log('免费提问',0,channel+'使用永久免费次数');allowed=true;notice='本题使用免费次数'}else if(user.balance>=config.questionCost){user.balance-=config.questionCost;user.paidQuestions++;user.totalQuestions++;log('付费提问',-config.questionCost,channel+'扣除'+config.questionCost+'水');allowed=true;notice='本题已扣'+config.questionCost+'水，余水'+user.balance}if(!allowed){persist();openWallet(true);return false}persist();toast(notice);return true};
const recordPrediction=data=>{sync();let question=String(data?.question??''),status=['strong','weak','normal'].includes(data?.status)?data.status:'normal',entry=user.questions.find(item=>item.text===question&&!item.prediction);let prediction={status,label:String(data?.label||''),domain:String(data?.domain||''),reason:String(data?.reason||''),time:new Date().toLocaleString()};if(entry)entry.prediction=prediction;if(status==='strong')user.threeYearWealthOfficial=prediction;if(status==='weak'){user.adverseFlags=Array.isArray(user.adverseFlags)?user.adverseFlags:[];user.adverseFlags.unshift(prediction);user.adverseFlags=user.adverseFlags.slice(0,20)}persist();return true};
const evolution='<section class="evolution-note"><b>星序仍在不断进化中</b>我们会持续打磨提问与回答，让结果更贴近所问、更清楚、更有用。命理与相理解读只供个人参考，不代替你作决定；是否采纳、怎样行动，请结合现实情况自行权衡。</section>';
const addNote=host=>{if(host&&!host.querySelector('.evolution-note'))host.insertAdjacentHTML('beforeend',evolution)};
addNote(document.querySelector('.portal-inner'));addNote(document.querySelector('.physio-main'));addNote(document.querySelector('#chatView .scroll'));
window.addEventListener('storage',render);window.addEventListener('focus',render);window.addEventListener('xingxu:profile-updated',render);
window.XingxuBilling={authorizeQuestion,recordQuestion,recordPrediction,openWallet,getState:()=>{sync();return{config:{...config},user:{...user},memberId,phone}}};
render();
})();
