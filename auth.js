(()=>{'use strict';
const SESSION_KEY='xingxu_auth_session_v1',USERS_KEY='xingxu_billing_users_v1';
const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))||fallback}catch(e){return fallback}};
const validPhone=phone=>/^1[3-9]\d{9}$/.test(phone);
const memberIdFor=phone=>{let hash=2166136261;for(const ch of phone){hash^=ch.charCodeAt(0);hash=Math.imul(hash,16777619)}return'XS-'+phone.slice(-4)+'-'+(hash>>>0).toString(16).toUpperCase().padStart(8,'0')};
const maskPhone=phone=>validPhone(phone)?phone.slice(0,3)+'****'+phone.slice(-4):'未登录';
const getSession=()=>{let session=read(SESSION_KEY,null);return session&&validPhone(session.phone)&&session.memberId?session:null};
const getUser=()=>{let session=getSession(),users=read(USERS_KEY,{});return session?users[session.memberId]||null:null};
const css=document.createElement('link');css.rel='stylesheet';css.href='./auth.css?v=20260803a';document.head.appendChild(css);
const markup=[
'<div class="auth-overlay" id="authOverlay" hidden><section class="auth-dialog" role="dialog" aria-modal="true" aria-labelledby="authTitle">',
'<div class="auth-brand"><span>序</span><div><b>星序</b><small>命理推演</small></div></div>',
'<div id="authLogin"><div class="auth-kicker">手机号登录</div><h2 id="authTitle">先登录，再开始推演</h2>',
'<p class="auth-lead">每个手机号账号永久享有 2 次免费提问；问题与推演记录会保存在本机后台，方便本人查看和管理。</p>',
'<label class="auth-field"><span>手机号</span><input id="authPhone" inputmode="tel" autocomplete="tel" maxlength="11" placeholder="请输入11位手机号"></label>',
'<div class="auth-code-row"><label class="auth-field"><span>验证码</span><input id="authCode" inputmode="numeric" autocomplete="one-time-code" maxlength="6" placeholder="6位验证码"></label><button id="authSendCode" type="button">获取验证码</button></div>',
'<div class="auth-demo-code" id="authDemoCode" hidden></div>',
'<label class="auth-consent"><input id="authConsent" type="checkbox"><span>我已阅读并同意个人信息说明，允许本机保存手机号、出生资料、完整提问与收费记录。</span></label>',
'<details class="auth-privacy"><summary>个人信息说明</summary><p>本地演示不会发送短信，也不会把资料传到服务器。手机号用于区分账号；出生年月日用于排盘；出生时间、出生地、昵称和性别可选。后台会按账号展示资料、完整问题与计费情况。正式上线前应接入真实短信验证、数据库、加密、访问控制，并提供隐私政策和删除入口。</p></details>',
'<p class="auth-error" id="authLoginError" role="alert"></p><button class="auth-primary" id="authContinue" type="button">登录并继续</button></div>',
'<form id="authProfile" hidden><button class="auth-back" id="authBack" type="button">← 返回</button><div class="auth-kicker">个人资料</div><h2>补充出生信息</h2>',
'<p class="auth-lead">出生年月日为必填项，其余资料可按实际情况填写。</p><div class="auth-form-grid">',
'<label class="auth-field"><span>昵称（选填）</span><input id="authNickname" maxlength="20" placeholder="方便后台识别"></label>',
'<label class="auth-field"><span>性别（选填）</span><select id="authGender"><option value="">不填写</option><option>男</option><option>女</option></select></label>',
'<label class="auth-field"><span>出生日期 <i>必填</i></span><input id="authBirthDate" type="date" required></label>',
'<label class="auth-field"><span>出生时间（选填）</span><input id="authBirthTime" type="time"></label>',
'<label class="auth-field auth-wide"><span>出生地点（选填）</span><input id="authBirthPlace" maxlength="40" placeholder="例如：山东济南"></label></div>',
'<p class="auth-error" id="authProfileError" role="alert"></p><button class="auth-primary" type="submit">保存资料并进入网站</button>',
'<button class="auth-delete" id="authDelete" type="button" hidden>删除本机账号和资料</button></form></section></div>'
].join('');
document.body.insertAdjacentHTML('beforeend',markup);
const q=s=>document.querySelector(s),overlay=q('#authOverlay'),login=q('#authLogin'),form=q('#authProfile');
let pending=null,demoCode='',timer=0,countdown=0,editing=false;
const showError=(id,text)=>{q(id).textContent=text||''};
const showLogin=()=>{editing=false;pending=null;login.hidden=false;form.hidden=true;q('#authBack').hidden=false;q('#authDelete').hidden=true;overlay.hidden=false;setTimeout(()=>q('#authPhone').focus(),50)};
const fillProfile=user=>{let p=user?.profile||{};q('#authNickname').value=p.nickname||'';q('#authGender').value=p.gender||'';q('#authBirthDate').value=p.birthDate||'';q('#authBirthTime').value=p.birthTime||'';q('#authBirthPlace').value=p.birthPlace||''};
const showProfile=(user,isEditing=false)=>{editing=isEditing;login.hidden=true;form.hidden=false;fillProfile(user);q('#authBack').hidden=isEditing;q('#authDelete').hidden=!isEditing;overlay.hidden=false;showError('#authProfileError','');setTimeout(()=>q('#authBirthDate').focus(),50)};
const persistProfile=(session,user)=>{let users=read(USERS_KEY,{}),now=new Date().toISOString(),prior=users[session.memberId]||user||{};prior.id=session.memberId;prior.createdAt=prior.createdAt||now;prior.updatedAt=now;prior.balance=Number.isFinite(+prior.balance)?+prior.balance:0;prior.freeUsed=Number.isFinite(+prior.freeUsed)?+prior.freeUsed:0;prior.totalQuestions=Number.isFinite(+prior.totalQuestions)?+prior.totalQuestions:0;prior.paidQuestions=Number.isFinite(+prior.paidQuestions)?+prior.paidQuestions:0;prior.totalRecharged=Number.isFinite(+prior.totalRecharged)?+prior.totalRecharged:0;prior.lifetimeMember=prior.lifetimeMember===true;prior.lifetimePaid=Number.isFinite(+prior.lifetimePaid)?+prior.lifetimePaid:0;prior.lastCheckIn=prior.lastCheckIn||'';prior.logs=Array.isArray(prior.logs)?prior.logs:[];prior.questions=Array.isArray(prior.questions)?prior.questions:[];prior.profile={...(prior.profile||{}),phone:session.phone,nickname:q('#authNickname').value.trim(),gender:q('#authGender').value,birthDate:q('#authBirthDate').value,birthTime:q('#authBirthTime').value,birthPlace:q('#authBirthPlace').value.trim(),consentAt:prior.profile?.consentAt||now,updatedAt:now};users[session.memberId]=prior;localStorage.setItem(USERS_KEY,JSON.stringify(users));localStorage.setItem(SESSION_KEY,JSON.stringify(session));return prior};
q('#authSendCode').onclick=()=>{let phone=q('#authPhone').value.trim();showError('#authLoginError','');if(!validPhone(phone)){showError('#authLoginError','请输入正确的11位手机号');return}demoCode=String(Math.floor(100000+Math.random()*900000));q('#authDemoCode').hidden=false;q('#authDemoCode').textContent='本地演示验证码：'+demoCode+'（已自动填入）';q('#authCode').value=demoCode;q('#authCode').focus();clearInterval(timer);countdown=60;q('#authSendCode').disabled=true;q('#authSendCode').textContent='60秒后重试';timer=setInterval(()=>{countdown--;q('#authSendCode').textContent=countdown+'秒后重试';if(countdown<=0){clearInterval(timer);q('#authSendCode').disabled=false;q('#authSendCode').textContent='重新获取'}},1000)};
q('#authContinue').onclick=()=>{let phone=q('#authPhone').value.trim(),code=q('#authCode').value.trim();showError('#authLoginError','');if(!validPhone(phone))return showError('#authLoginError','请输入正确的11位手机号');if(!demoCode)return showError('#authLoginError','请先获取验证码');if(code!==demoCode)return showError('#authLoginError','验证码不正确');if(!q('#authConsent').checked)return showError('#authLoginError','请先同意个人信息说明');let memberId=memberIdFor(phone),users=read(USERS_KEY,{});pending={memberId,phone,loginAt:new Date().toISOString()};let user=users[memberId];if(user?.profile?.birthDate){localStorage.setItem(SESSION_KEY,JSON.stringify(pending));location.reload();return}showProfile(user,false)};
q('#authBack').onclick=showLogin;
form.onsubmit=e=>{e.preventDefault();let birth=q('#authBirthDate').value;if(!birth)return showError('#authProfileError','请填写出生年月日');let chosen=new Date(birth+'T00:00:00'),today=new Date();if(Number.isNaN(chosen.getTime())||chosen>today)return showError('#authProfileError','出生日期填写有误');let session=pending||getSession();if(!session)return showLogin();let saved=persistProfile(session,getUser());overlay.hidden=true;window.dispatchEvent(new CustomEvent('xingxu:profile-updated',{detail:{session,user:saved}}));if(!editing)location.reload()};
q('#authDelete').onclick=()=>{let session=getSession();if(!session||!confirm('确定删除这个手机号在本机保存的全部资料、问题和计费记录吗？此操作无法撤销。'))return;let users=read(USERS_KEY,{});delete users[session.memberId];localStorage.setItem(USERS_KEY,JSON.stringify(users));localStorage.removeItem('xingxu-v3-'+session.memberId);localStorage.removeItem(SESSION_KEY);location.reload()};
const openProfile=()=>{let session=getSession();if(!session)return showLogin();pending=session;showProfile(getUser(),true)};
const logout=()=>{localStorage.removeItem(SESSION_KEY);location.reload()};
window.XingxuAuth={getSession,getUser,openProfile,logout,maskPhone,memberIdFor};
if(!getSession())showLogin();
})();
