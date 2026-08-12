(function(){
'use strict';

var TOPIC={
career:['事业与工作','官禄',['迁移','财帛'],'职位是否匹配能力，机会能否转成稳定成果，权责与回报是否对等','只看机会表面，忽略权限、考核、团队和实际回报','职责清楚、资源到位、关键人物愿意承担责任，成果也能被核验'],
wealth:['财务与收入','财帛',['官禄','田宅'],'收入来源、现金流承受力、职业能力与资产安排能否形成闭环','把预期收益当成已经到手的钱，或在退出条件不清时扩大投入','收入来源清楚、成本可控、回款和退出路径都有现实依据'],
relation:['感情与婚姻','夫妻',['福德','迁移'],'双方的真实需求、承诺能力、现实责任和外部环境是否一致','情绪强烈时放大缺点，或用猜测代替对方持续而明确的行动','愿意公开沟通、承担责任、处理现实问题，承诺与行为互相印证'],
friendship:['朋友与社交','交友',['兄弟','福德'],'信任、边界、利益往来与长期相处方式是否平衡','因一时情绪否定全部关系，或让金钱与责任停留在口头约定','事实能说清、边界被尊重，双方都愿意为关系作具体调整'],
parent:['父母与长辈','父母',['田宅','福德'],'关心、控制、责任和家庭边界如何重新分配','把孝顺等同于无限承担，或在旧情绪里反复争论谁对谁错','每个人的责任被说清，重要事项有具体分工，沟通回到现实问题'],
sibling:['手足与亲属','兄弟',['交友','田宅'],'亲情、资源往来、共同责任与个人边界能否平衡','账目、产权或照护责任含糊，最后由情绪替代规则','事实核对一致、责任落实到人，涉及利益的事项留下明确记录'],
children:['子女与晚辈','子女',['田宅','福德'],'真实需求、养育方式、家庭环境与期待压力如何互相影响','只用结果评价对方，忽略能力阶段、情绪状态和实际需要','规则少而清楚、反馈具体，家庭成员对目标和责任形成共识'],
workpeople:['职场人际','官禄',['交友','迁移'],'职责、权限、协作方式与组织环境是否相互匹配','把制度问题当成人情问题，或把重要承诺留在口头层面','职责边界被确认、交付标准明确，关键沟通可以追溯'],
cooperation:['合作与交易','交友',['官禄','财帛'],'信任、执行、利益分配和退出机制是否完整','只谈愿景不谈分工，只看关系不查证据，规则未定就先投入','目标、责任、收益、风险和退出方式都能写清并被各方确认'],
home:['家宅与房产','田宅',['财帛','迁移'],'使用需求、资金能力、地点变化与长期成本是否匹配','只看价格或情绪偏好，忽略总成本、产权、通勤和退出难度','预算留有余地、资料核验完整，方案同时满足居住与现金流要求'],
move:['迁移与变化','迁移',['田宅','官禄'],'外部变化能否带来真实机会，并被工作、住房与生活结构承接','把换环境当成解决全部问题的办法，却没有核实成本与落点','目的明确、现实条件落实，变化后的收入、居住和支持系统可承接'],
study:['学习与考试','命宫',['官禄','福德'],'学习方法、能力转化与目标要求是否一致','目标铺得太多，只输入不输出，因一次反馈不佳频繁改方向','目标集中、练习有反馈，成果能通过作品、测验或讲解验证'],
health:['身心与健康','疾厄',['福德','迁移'],'压力、休息、生活节奏与环境变化如何影响身体感受','用命盘替代医学判断，拖延就医或自行停止正规治疗','生活节奏得到调整、异常被持续记录，并及时获得专业评估'],
legal:['纠纷与规则','官禄',['交友','迁移'],'证据、规则、对方关系与外部处境如何共同影响争议','证据不足时情绪化表态，或轻信口头承诺而放弃合法权利','事实时间线完整、合同和往来记录齐全，并取得专业意见'],
reputation:['名誉与传播','迁移',['官禄','福德'],'外部评价、社会角色与内在承受力如何互相影响','被情绪噪声牵着走，公开回应无法证实的信息，扩大传播范围','事实与评价分开处理，回应有证据、有边界并能结束争议'],
safety:['风险与安全','疾厄',['迁移','财帛'],'个人状态、外部环境与可能损失是否叠加','身份、资金或关键条件未经核验便继续推进','高风险行为停止、证据保存完整，必要时由当地专业机构介入'],
emotion:['情绪与内在','福德',['命宫','疾厄'],'触发事件、自我认知、身体反应与真实需求之间的关系','在情绪高峰作不可撤回的决定，或长期压抑到影响正常生活','能够区分事实、感受和请求，并获得稳定的现实或专业支持'],
pet:['宠物事务','田宅',['子女','疾厄'],'照护责任、居住环境与健康状况如何共同作用','用传统解释替代兽医诊断，或在异常持续时继续等待','饮食、排泄、精神与异常表现记录清楚，并获得正规兽医判断'],
timing:['阶段时机','迁移',['官禄','福德'],'当前条件究竟支持推进、调整还是继续观察','把本命结构直接当成具体日期预测，制造没有盘面依据的期限','关键条件真正到位、外部回应清楚，行动后能获得可核验结果'],
family:['家庭事务','田宅',['父母','兄弟'],'家庭角色、长辈关系、手足协作与现实责任如何分配','责任长期模糊，遇事只谈感受，不谈谁负责和如何完成','边界清楚、分工明确，成员愿意共同承担现实问题'],
self:['个人方向','命宫',['福德','官禄'],'内在动力、优势能力与社会角色是否相互对应','过度依赖外界评价、方向频繁变化，长处无法形成稳定积累','优势进入真实场景，持续产生成果并得到明确反馈']
};

function clean(v){
 return String(v==null?'':v)
  .replace(/问清前三\u4e2a\u6708目标/g,'问清岗位阶段目标')
  .replace(/观察三\u4e2a\u6708是否兑现/g,'观察承诺是否持续兑现')
  .replace(/记录三\u4e2a\u6708收支/g,'持续记录收入、支出与负债变化')
  .replace(/连续\u4e03\u5929记录|记录\u4e03\u5929/g,'持续记录')
  .replace(/拆成\u4e24\u5468任务/g,'拆成阶段任务')
  .replace(/做\u4e24\u5468输出型学习/g,'完成输出型学习闭环')
  .replace(/连续使用\u4e24\u5468/g,'在真实场景中持续使用并核验结果')
  .replace(/本周内完成/g,'条件具备后完成')
  .replace(/在\u4e03\u5929内完成/g,'完成')
  .replace(/先设一个30\u5929观察期/g,'先观察关键条件是否真正变化')
  .replace(/之后每\u4e03\u5929复盘一次/g,'之后按关键进展复盘')
  .replace(/\u4e03\u5929看事实，\u4e09\u5341\u5929看趋势，\u4e03\u5929拿不到第一项现实反馈就先停，\u4e09\u5341\u5929仍无实质推进便换路/g,'先看事实，再看趋势；拿不到现实反馈就暂停核对，持续没有实质推进便换路')
  .replace(/\u4e03\u5929内/g,'在首个可验证节点前')
  .replace(/\u4e03\u5929/g,'首轮验证')
  .replace(/\u4e09\u5341\u5929|30\u5929/g,'阶段复核')
  .replace(/\u4e5d\u5341\u5929/g,'长期复核')
  .replace(/\u4e24\u5468/g,'一个完整练习阶段')
  .replace(/每周/g,'每个阶段')
  .replace(/每三天/g,'在关键节点')
  .replace(/\u4e09\u4e2a\u6708/g,'持续运行阶段');
}
function topicKey(s){
 var k=typeof detectTopic==='function'?detectTopic(s.question):'self';
 return TOPIC[k]?k:'self';
}
function palace(c,n){
 return c&&c.palaces&&c.palaces.find(function(x){return x.name===n;})||{name:n,branch:'—',stars:'无主星',transform:'—'};
}
function meaning(text){
 text=String(text||'');var out=[];
 if(/化禄|禄存/.test(text))out.push('资源、意愿或现实承接力增加');
 if(/化权/.test(text))out.push('推动力增强，同时伴随控制、责任或压力');
 if(/化科/.test(text))out.push('沟通、名誉、规则或理性处理成为转圜点');
 if(/化忌/.test(text))out.push('执念、误解、延迟或反复是主要阻力');
 if(/擎羊|陀罗|火星|铃星|地空|地劫/.test(text))out.push('冲突与损耗信号偏强，不宜凭情绪硬推');
 if(/紫微|天府|天相|天梁|左辅|右弼|文昌|文曲/.test(text))out.push('仍有秩序、支持或重新协商的空间');
 return out.length?out.join('；'):'没有单一信号足以定成败，必须结合现实条件交叉验证';
}
function basis(s,c,cfg){
 if(s.mode==='ziwei'){
  var m=palace(c,cfg[1]),a=palace(c,cfg[2][0]),b=palace(c,cfg[2][1]);
  return {
   line:'以'+m.name+m.branch+'宫为主，见'+m.stars+'，四化状态为'+m.transform+'；再参'+a.name+a.branch+'宫的'+a.stars+'（'+a.transform+'）与'+b.name+b.branch+'宫的'+b.stars+'（'+b.transform+'）。',
   method:'取所问宫定主题，以两组关联宫位核验成因与落点，再由星曜和四化判断助力、压力与反复位置。',
   effect:meaning([m.stars,m.transform,a.stars,a.transform,b.stars,b.transform].join(' ')),
   list:[m.name+'：'+m.branch+'宫 · '+m.stars+' · '+m.transform,a.name+'：'+a.branch+'宫 · '+a.stars+' · '+a.transform,b.name+'：'+b.branch+'宫 · '+b.stars+' · '+b.transform]
  };
 }
 if(s.mode==='sizhu'){
  var ps=c.pillars||[],dm=ps[2]?gan[ps[2][0]]:'—',mo=ps[1]?gan[ps[1][0]]+zhi[ps[1][1]]:'—';
  var p4=ps.map(function(x){return gan[x[0]]+zhi[x[1]];}).join('、');
  var gods=ps.map(function(x,i){return i===2?'日主':tenGod(ps[2][0],x[0]);}).join('、');
  var counts=Object.keys(c.counts||{}).map(function(k){return k+':'+c.counts[k];}).join('，');
  return {
   line:'四柱为'+p4+'，以'+dm+'日主为本、'+mo+'月令为纲；天干十神依次为'+gods+'，五行计数为'+counts+'。',
   method:'先看月令对日主的扶抑，再看天干透出和地支藏根，最后判断生克是否连续；不拿单柱或纳音直接作终局判断。',
   effect:'命局偏向说明处理事情时更容易使用哪种力量，也指出哪部分需要现实条件补足；强弱不是简单的吉凶标签。',
   list:['四柱：'+p4,'日主：'+dm,'月令：'+mo,'天干十神：'+gods]
  };
 }
 var qm=c.qimen||{},gate=qm.gate||'—',star=qm.star||'—',bureau=qm.bureau||'—';
 var gm={开门:'入口和行动条件较清楚，可主动争取',休门:'信息整理与节奏调整比仓促推进更重要',生门:'成长、收益和长期承接力是判断重点',伤门:'冲突与损耗明显，先止损再谈推进',杜门:'隐藏条件尚未打开，必须核实权限与承诺',景门:'表达展示有利，但要防止只见表面',死门:'原路径消耗偏重，宜收尾并准备替代方案',惊门:'消息扰动较强，重要事实必须二次核验'};
 return {
  line:'当前索引为阳遁'+bureau+'局，以'+gate+'为主要事体信号，'+star+'为环境辅助信号。',
  method:'以门定事件性质，以星看环境表现，再回到所问核对现实条件；出生资料不能冒充具体问事时刻。',
  effect:gm[gate]||'信息不足以支持单向判断，应先核对现实条件。',
  list:['局势：阳遁'+bureau+'局','主要信号：'+gate,'辅助信号：'+star]
 };
}
function report(s,d){
 var p=activeProfile(),c=p&&p.chart||{},key=topicKey(s),cfg=TOPIC[key],b=basis(s,c,cfg);
 var asked=/(今年|明年|本年|未来|何时|什么时候|哪年|哪月|[12][0-9]{3}年)/.test(s.question||'');
 var time=asked?'你问到了时间，但当前页面没有接入完整的大运、流年、流月或即时起局资料，因此不能从基础盘硬造具体日期。真正可用的时间判断，必须建立在对应运限或问事时刻上。':'本次只依据当前基础盘，不主动编造具体日期或固定观察周期。时间部分只看事件信号是否出现，不用人为设定的天数代替推演。';
 var lines=[
 '一、核心判断',
 '结论：'+clean(verdictText(s))+'。',
 '这项判断只围绕“'+cfg[0]+'”展开。真正要判断的不是一句吉或凶，而是盘面结构能否被现实条件承接。',
 '',
 '二、原局与所问基础',
 b.line,
 '取法：'+b.method,
 '明确依据：'+b.list.join('；')+'。',
 '',
 '三、为什么形成这个结果',
 '1. 主因：'+cfg[3]+'。',
 '2. 盘面作用：'+b.effect+'。',
 '3. 现实落点：'+clean(d.good)+'。',
 '4. 需要校正：'+clean(d.caution)+'。',
 '',
 '四、关键时间与应事信号',
 time,
 '可观察的应事信号：',
 '• 主要条件由模糊转为明确，并能得到书面信息或持续行动的验证；',
 '• 关键责任人开始主动推进，而不是只作口头表示；',
 '• 投入、风险与退出方式变得可计算，行动后出现可核验结果。',
 '信号没有出现时，保持观察或缩小投入；信号出现并相互印证后，再提高行动强度。',
 '',
 '五、主要风险与转机',
 '主要风险：'+cfg[4]+'。'+clean(d.avoid)+'。',
 '转机所在：'+cfg[5]+'。',
 '是否真正转好，要看行为、资源和结果是否同时变化，不能只凭情绪缓和或一句承诺。',
 '',
 '六、具体应对',
 '1. 先核实：把事实、感受与推测分开，只保留能被证据、行为或明确答复支持的内容。',
 '2. 再试行：选择一个可以撤回、投入有上限的动作，提前写清责任、成本与怎样才算有效。',
 '3. 后复核：根据真实反馈决定继续、调整或停止，不用忙碌感代替结果。',
 '4. 守底线：涉及金钱、合同、健康、安全或法律时，以正式文件和合资格专业意见为准。',
 '',
 '七、总结',
 '这件事并非由单一星曜、单一宫位或一句断语决定。当前最有效的做法，是沿着盘面指出的主因核实事实，把风险控制在可承受范围内，再用现实反馈修正判断。出现清楚条件与持续行动时可以推进；事实仍含糊、责任仍落空时就应暂停。'
 ];
 return lines.join('\n');
}
function esc(v){return String(v).replace(/[&<>"]/g,function(ch){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch];});}
function render(v){
 return String(v).split('\n').map(function(line){
  var x=esc(line);
  if(/^[一二三四五六七八九十]+、/.test(line))return '<div class="deep-title">'+x+'</div>';
  if(/^\d+\./.test(line))return '<div class="deep-step">'+x+'</div>';
  if(/^•/.test(line))return '<div class="deep-bullet">'+x+'</div>';
  if(!line)return '<div class="deep-gap"></div>';
  return '<div class="deep-p">'+x+'</div>';
 }).join('');
}

var oldInference=typeof inference==='function'?inference:null;
if(oldInference){
 inference=function(p,mode,q){
  var r=oldInference(p,mode,q);
  if(r){r.summary=clean(r.summary);r.action=clean(r.action);}
  return r;
 };
}
expandDecision=function(x){
 return {
  good:clean(x.good)+'。把目标压成一个能验证的现实动作，写清由谁负责、投入多少、怎样才算完成；先小范围试行，得到可靠反馈后再加码。',
  caution:clean(x.caution)+'。凡是还要靠猜测、催促或口头许诺才能成立的部分，都先按未成立处理；钱、责任和精力各设上限，条件变化时先停下来核对。',
  avoid:clean(x.avoid)+'。不要在情绪最强、信息最少时作不可撤回的决定；出现边界被越过、成本失控、事实对不上或承诺反复落空时，立即暂停并保留记录。',
  joy:clean(x.joy)+'。真正的助力要同时体现为主动行动、条件清楚、进度可验和成果能留；只带来期待而没有现实承接的消息，不当作结果。'
 };
};
finalNarrative=function(s,d){return report(s,d);};

var oldShow=typeof showSession==='function'?showSession:null;
if(oldShow){
 showSession=function(s,animate){
  if(s&&s.inference){s.inference.summary=clean(s.inference.summary);s.inference.action=clean(s.inference.action);}
  var out=oldShow(s,animate);
  if(typeof detectTopic==='function'&&detectTopic(s.question)!=='unknown'){
   var d=decisionText(s);
   action.innerHTML=render(report(s,d));
   answerTitle.textContent='深度推演报告';
   var h=document.querySelector('.action-section h4');
   if(h)h.textContent='完整分析';
  }
  return out;
 };
}
var style=document.createElement('style');
style.textContent='.deep-title{display:table;margin:22px 0 10px;font:700 17px/1.6 var(--serif);border-bottom:4px solid #bcecf0}.deep-title:first-child{margin-top:0}.deep-p{margin:7px 0;line-height:2}.deep-step{margin:9px 0;line-height:1.95;font-weight:600}.deep-bullet{margin:8px 0;padding-left:14px;line-height:1.95}.deep-bullet::first-letter{color:#16bfd0}.deep-gap{height:4px}@media(max-width:680px){.deep-title{font-size:16px}.deep-p,.deep-step,.deep-bullet{line-height:1.9}}';
document.head.appendChild(style);
window.XingxuDeepReport={version:'3.0',clean:clean,build:report};
})();

