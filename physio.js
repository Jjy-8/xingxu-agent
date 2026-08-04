(()=>{const l=document.createElement('link');l.rel='stylesheet';l.href='./physio.css';document.head.appendChild(l);const p=document.createElement('section');p.className='portal';p.innerHTML=`<div class="portal-inner"><div class="portal-mark">星序 XINGXU</div><div class="portal-kicker">两种入口 · 一套个人档案</div><h1>观命，也观形。</h1><p class="portal-lead">第一部分从出生信息建立命盘；第二部分从左掌、右掌与正脸照片读取可见特征。</p><div class="portal-grid"><button class="portal-card" id="goDestiny"><small>第一部分</small><h2>命理推演</h2><p>紫微、四柱与奇门。</p><strong>进入现有推演 →</strong></button><button class="portal-card" id="goPhysio"><small>第二部分</small><h2>手相与面相</h2><p>左右掌分读、面相分读，也可三图合参。</p><strong>进入水木相观 →</strong></button></div></div>`;const v=document.createElement('section');v.className='physio-app';v.innerHTML=`<header class="physio-top"><div class="physio-brand">相 · 星序水木相观</div><button class="physio-back" id="backPortal">返回封面</button></header><main class="physio-main"><section class="physio-hero"><small>第二部分 · 手相与面相</small><h1>左掌看基础，右掌看变化；<br>面部看当下气势。</h1><p>手相按手型、手指、掌丘、生命线、智慧线、感情线、事业线与辅助线分层；面相按脸型、三庭、眉眼鼻口耳、下巴与十二宫位分层。结果展开爱情、事业、财运、亲情、人际、健康、性格与阶段运势。</p></section><div class="physio-modes"><button class="physio-mode active" data-pm="hand"><b>左右手相</b><small>可拍一只，也可左右掌同时合看</small></button><button class="physio-mode" data-pm="face"><b>面相</b><small>正脸三庭、五官、十二宫分读</small></button><button class="physio-mode" data-pm="both"><b>手面合参</b><small>至少一只手掌加正脸，多层互证</small></button></div><section class="upload-zone"><label class="photo-box" id="leftBox"><input id="leftFile" type="file" accept="image/*" capture="environment"><img id="leftImg"><div class="photo-copy"><div class="hand-guide"><span class="palm"></span><i class="f1"></i><i class="f2"></i><i class="f3"></i><i class="f4"></i><i class="f5"></i></div><b>左掌拍照 / 上传</b><small>掌心对准虚线，五指自然张开<br>手腕也要拍入画面</small></div></label><label class="photo-box" id="rightBox"><input id="rightFile" type="file" accept="image/*" capture="environment"><img id="rightImg"><div class="photo-copy"><div class="hand-guide mirror"><span class="palm"></span><i class="f1"></i><i class="f2"></i><i class="f3"></i><i class="f4"></i><i class="f5"></i></div><b>右掌拍照 / 上传</b><small>掌心对准虚线，避免斜拍阴影<br>主线必须清楚可见</small></div></label><label class="photo-box hidden" id="faceBox"><input id="faceFile" type="file" accept="image/*" capture="user"><img id="faceImg"><div class="photo-copy"><div class="face-guide"></div><b>正脸拍照 / 上传</b><small>正面平视，露出额头、耳朵和下巴<br>关闭美颜，使用自然光</small></div></label><label class="photo-box hidden" id="faceLeftBox"><input id="faceLeftFile" type="file" accept="image/*" capture="user"><img id="faceLeftImg"><div class="photo-copy"><div class="side-guide left"></div><b>左侧脸拍照 / 上传</b><small>左侧转约45度，露出眉骨、鼻梁、颧骨、耳朵与下颌线</small></div></label><label class="photo-box hidden" id="faceRightBox"><input id="faceRightFile" type="file" accept="image/*" capture="user"><img id="faceRightImg"><div class="photo-copy"><div class="side-guide right"></div><b>右侧脸拍照 / 上传</b><small>右侧转约45度，保持自然光，不仰头、不低头</small></div></label></section><section class="physio-question"><div><h2>照片与问题一起解读</h2></div><div class="question-quick"><button type="button">我的感情什么时候能稳定？</button><button type="button">今年事业应该主动争取什么？</button><button type="button">财运主要靠积累还是机会？</button><button type="button">家庭关系里我该注意什么？</button></div><textarea id="physioQuestion" placeholder="例如：我现在这段感情能不能稳定发展？"></textarea><div class="question-answer" id="questionAnswer"></div></section><div class="scan-actions"><button class="scan-btn" id="scanBtn" disabled>开始扫描并回答问题</button></div><section class="physio-result" id="scanResult"></section></main>`;document.body.prepend(v);document.body.prepend(p);const q=s=>document.querySelector(s),app=q('.app'),modal=q('.modal');const decorate=host=>{let d=document.createElement('div');d.className='nature-decor';d.innerHTML='<i class="leaf leaf-a"></i><i class="leaf leaf-b"></i><i class="flower flower-a"></i><i class="flower flower-b"></i><i class="cloud cloud-a"></i><i class="cloud cloud-b"></i>';host.prepend(d)};decorate(p);decorate(v);decorate(app);const destinyBack=document.createElement('button');destinyBack.id='destinyBack';destinyBack.className='destiny-back';destinyBack.type='button';destinyBack.innerHTML='<span>‹</span> 返回封面';q('.top').prepend(destinyBack);let mode='hand',f={},m={},physioRevealRun=0,physioBusy=false;function go(x){p.classList.toggle('hidden',x!=='portal');v.classList.toggle('active',x==='physio');app.style.display=x==='destiny'?'':'none';modal.style.visibility=x==='destiny'?'visible':'hidden';document.body.classList.toggle('physio-open',x!=='destiny');document.body.classList.toggle('destiny-open',x==='destiny');v.scrollTop=0;window.scrollTo(0,0)}q('#goDestiny').onclick=()=>go('destiny');q('#goPhysio').onclick=()=>go('physio');q('#backPortal').onclick=()=>go('portal');destinyBack.onclick=()=>go('portal');async function read(file){let url=URL.createObjectURL(file),im=new Image;im.src=url;await im.decode();let n=144,c=document.createElement('canvas');c.width=c.height=n;let x=c.getContext('2d',{willReadFrequently:true});x.drawImage(im,0,0,n,n);let d=x.getImageData(0,0,n,n).data,g=[],s=0,s2=0,e=0,y=0,skin=0;for(let i=0;i<n*n;i++){let j=i*4,z=d[j]*.3+d[j+1]*.59+d[j+2]*.11;g[i]=z;s+=z;s2+=z*z;let R=d[j],G=d[j+1],B=d[j+2];if(R>70&&G>35&&B>20&&R>G&&R>B&&R-G>8)skin++}for(let r=1;r<n-1;r++)for(let k=1;k<n-1;k++){let i=r*n+k;e+=Math.abs(g[i]-g[i-1])+Math.abs(g[i]-g[i-n]);if(k<n/2)y+=Math.abs(g[i]-g[r*n+n-1-k])}return{url,width:im.naturalWidth,height:im.naturalHeight,ratio:im.naturalWidth/im.naturalHeight,skin:skin/g.length,avg:s/g.length,contrast:Math.sqrt(s2/g.length-(s/g.length)**2),edge:e/((n-2)**2*2),sym:y/((n/2)*(n-2))}}function ready(){let hand=f.left||f.right,face=f.face||f.faceLeft||f.faceRight;q('#scanBtn').disabled=physioBusy||!(mode==='hand'?hand:mode==='face'?face:hand&&face)}async function load(k,file){if(!file)return;f[k]=file;m[k]=await read(file);q('#'+k+'Img').src=m[k].url;q('#'+k+'Box').classList.add('loaded');ready()}['left','right','face','faceLeft','faceRight'].forEach(k=>{q('#'+k+'File').onchange=e=>load(k,e.target.files[0]);let b=document.createElement('button');b.type='button';b.className='photo-remove';b.textContent='删除重拍';b.setAttribute('aria-label','删除当前照片重新拍摄');b.onclick=e=>{e.preventDefault();e.stopPropagation();physioRevealRun++;physioBusy=false;if(m[k]?.url)URL.revokeObjectURL(m[k].url);delete f[k];delete m[k];let im=q('#'+k+'Img');im.removeAttribute('src');q('#'+k+'File').value='';q('#'+k+'Box').classList.remove('loaded');q('#questionAnswer').classList.remove('show');q('#scanResult').classList.remove('show');ready()};q('#'+k+'Box').appendChild(b)});document.querySelectorAll('.question-quick button').forEach(b=>b.onclick=()=>{q('#physioQuestion').value=b.textContent});document.querySelectorAll('[data-pm]').forEach(b=>b.onclick=()=>{physioRevealRun++;physioBusy=false;mode=b.dataset.pm;document.querySelectorAll('.question-quick button').forEach(b=>b.onclick=()=>{q('#physioQuestion').value=b.textContent});document.querySelectorAll('[data-pm]').forEach(x=>x.classList.toggle('active',x===b));q('#leftBox').classList.toggle('hidden',mode==='face');q('#rightBox').classList.toggle('hidden',mode==='face');q('#faceBox').classList.toggle('hidden',mode==='hand');q('#faceLeftBox').classList.toggle('hidden',mode==='hand');q('#faceRightBox').classList.toggle('hidden',mode==='hand');ready()});const band=(z,a,b,t)=>z<a?t[0]:z<b?t[1]:t[2],card=(tag,title,text)=>`<article class="reading-card"><span class="tag">${tag}</span><h3>${title}</h3><p>${text}</p></article>`;function handInfo(z,side){let tone=band(z.avg,105,175,['掌色偏沉','掌色温和','掌色偏亮']),line=band(z.edge,16,29,['纹理偏简','主纹较清','细纹较多']),force=band(z.contrast,30,52,['轮廓柔','轮廓稳','轮廓强']);return{tone,line,force,proof:`${side}掌${tone}、${line}、${force}`}}function faceInfo(z,view){let tone=band(z.avg,105,175,['气色偏沉','气色平和','气色偏亮']),form=band(z.contrast,34,58,['轮廓柔','五官较匀','轮廓分明']),sym=band(z.sym,18,36,['左右较协调','左右略有差异','左右差异明显']);return{tone,form,sym,proof:`${view}${form}、${tone}、${sym}`}}const answerQuestion=(question,basis,face,mode)=>{
  const hit=r=>r.test(question), source=mode==='face'?'face':mode==='both'?'both':'hand';
  const topic=hit(/家人|父母|亲情|孩子|家庭|长辈|兄弟|姐妹/)?'亲情':hit(/感情|爱情|婚姻|对象|关系|复合|分手|结婚|恋爱/)?'感情':hit(/考试|学业|学习|成绩|考研|考公|证书|录取/)?'学业':hit(/买房|卖房|房产|住房|家宅|装修|搬家|迁居/)?'家宅':hit(/事业|工作|职业|升职|创业|跳槽|换工作|岗位|公司/)?'事业':hit(/财|钱|收入|投资|股票|基金|证券|生意|回款|种地|种田|种植|农业|庄稼|粮食|亩|收成|债/)?'财运':hit(/朋友|友情|人际|同事|合作|合伙|客户|供应商/)?'人际':hit(/官司|纠纷|诉讼|仲裁|维权|违约/)?'纠纷':hit(/健康|身体|睡眠|疾病|疼痛|恢复/)?'健康':hit(/痣|斑|胎记|疤/)?'痣相':'未知';
  if(topic==='未知')return '问题还没有落到一件具体事情上。请只问一件事，并写明对象和所求，例如“这段感情能不能继续并走到结婚”或“这份工作换了以后顺不顺”。事情不明，不能硬套结论。';
  const scene=hit(/股票|炒股|大盘|基金|证券|个股|仓位|涨停/)?'股票':hit(/种地|种田|种植|农业|农作|庄稼|粮食|亩|收成/)?'种植':hit(/做生意|生意|开店|客户|订单|回款/)?'生意':hit(/欠款|债务|还债|借款|贷款/)?'债务':hit(/换工作|跳槽|辞职|新工作/)?'换工作':hit(/升职|晋升|提拔/)?'升职':hit(/创业|合伙开|自己干/)?'创业':hit(/复合|挽回|前任/)?'复合':hit(/结婚|领证|成婚/)?'结婚':hit(/分手|离开|继续.*感情|感情.*继续/)?'感情去留':hit(/考试|考研|考公|录取|成绩|证书/)?'考试':hit(/买房|购房|置业/)?'买房':topic;
  const handRules={
    感情:'手相论感情，取感情线的长短、断续与分支，再看婚姻线、金星丘和拇指开合；先辨情分是否相续，再看相处能否守久',
    事业:'手相论事业，取智慧线、事业线、太阳线与掌丘承接；先看做事是否有主见，再看能力能否落到稳定位置',
    财运:'手相论财，取事业线、太阳线、财运细纹与掌丘聚散；先看财从何来，再看所得能否收住，不能见一条纹便断横财',
    亲情:'手相论家事，取生命线内侧、金星丘与拇指开合；看的是亲缘承接、责任轻重和边界，不把一家人的事混成一团',
    学业:'手相论学业，取智慧线的清浊、长短与走向，再看事业线承接；先看理解与定力，再看所学能否落到成绩',
    家宅:'手相论家宅，取生命线内侧、金星丘与事业线承接；既看居住是否安稳，也看财力和家庭意见能否接住变动',
    人际:'手相论人际，取感情线、智慧线与拇指开合；先看待人分寸与判断，再看合作能否守信、分工与互利',
    纠纷:'手相论纠纷，只看处事倾向、压力与应对分寸；结果仍须以事实、证据、合同和正式程序为准，不能以掌纹代替规则',
    健康:'手相只可从掌色、生命线状态与细纹看调养提醒，不能据掌纹判断疾病，更不能代替医学检查',
    痣相:'手上痣斑先分掌背、手指与掌丘位置，再看颜色、边界及是否新生；只论手部可见之象，不牵连面部'
  };
  const faceRules={
    感情:'面相论感情，取眉眼神气、夫妻位与下庭承接；先看情绪是否相和，再看关系能否落到名分与生活',
    事业:'面相论事业，取额、颧、鼻与下庭；先看能否担事，再看职位与责任能否坐稳',
    财运:'面相论财，取鼻准、鼻翼与下庭收束；既看进财路径，也看回款和守财能力，不能只凭一个部位断富贵',
    亲情:'面相论家事，分看额、耳、眉间与下庭；父母、手足、子女和居处各有所主，不混作一论',
    学业:'面相论学业，取额部、眉眼神气与耳部承接；先看思路与专注，再看临场发挥能否把所学变成成绩',
    家宅:'面相论家宅，取下庭、耳部与整体形气承接；既看居住能否安稳，也看钱款、家庭意见和现实条件能否相合',
    人际:'面相论人际，取眉眼神气、颧部与口部收束；先看识人与表达，再看合作能否守信、担责和长久',
    纠纷:'面相论纠纷，只看应对倾向与当下气势；最终仍须以事实、证据、合同和正式程序为准，不能以形色替代规则',
    健康:'面部形色只能作精神、气色与体力的调养提醒，不能据照片诊断疾病，更不能替代医学检查',
    痣相:'面部痣斑先分准确宫位，再看颜色、边界、明暗及是否新生；须合整张脸的形色，不可离开全局夸大一颗痣'
  };
  const rule=source==='hand'?handRules[topic]:source==='face'?faceRules[topic]:handRules[topic]+'；'+faceRules[topic];
  const proof=source==='hand'?(basis?.proof||'本次手掌可见的整体掌色与纹理'):source==='face'?(face?.proof||'本次面部可见的整体形色'):[basis?.proof,face?.proof].filter(Boolean).join('；');
  const data={
    股票:{
      verdict:'可以参与，但不建议重仓去赌；这问的是股票，不作一般财运套话。', flow:'行情有起伏，进场可能有浮盈，追高、加杠杆或没有退出纪律时容易由盈转亏。', end:'能否赚钱只认卖出后的净利润；账面上涨而未兑现，不算已经得财。',
      good:'只用不影响生活的闲钱，先定可承受亏损，再定仓位、买入价、止损价和止盈位置。个股逻辑要能说清，盈利分批兑现，亏损触线便执行，财才有收束。',
      caution:'慎把短期上涨当成长期顺势，也慎听消息后临时改计划。若盈利主要靠一次押中，或者亏损后不断补仓摊低成本，说明方法尚未站稳；波动越大，越要保留现金。',
      avoid:'忌借钱炒股、融资重仓、满仓单押，也忌把家庭应急金和生产经营款投入市场。走势已经破坏、基本判断改变或风险超过预设时，不可因为舍不得认亏而拖延。',
      joy:'喜见仓位受控、进退有据、盈利能够落袋，连续交易后本金仍稳且回撤可承受。真正的顺利不是某一天涨得快，而是几轮涨跌以后仍守得住钱，也不扰乱生活。'
    },
    种植:{
      verdict:'可以做，但要先算地、品种、成本与销路；这问的是种地，须另按土地、投入、收成和销路来定。', flow:'前期投入重，过程受天气、病虫害和人工牵制，顺不顺主要看田间管理与收购渠道能否接住。', end:'亩产、售价、损耗和人工扣完仍有净利，才算种地赚到钱；只见收成多而回款慢，不算成。',
      good:'先按每亩核算种苗、肥药、灌溉、机械、人工、租地和运输，再选适合当地水土、管理能力与销售渠道的品种。能先定收购方、质量标准和结算方式，收成才有去处。',
      caution:'慎在行情好时盲目扩大面积，也慎只听预计高价而忽略亩产波动、灾害风险与采收用工。品种不熟、技术不足或销路单一时，面积越大并不等于赚得越多。',
      avoid:'忌借高息款扩种、跟风改种陌生作物、未看土壤水源便大量下种，也忌把全部地块压在同一品种和单一收购商上。合同、验收和回款含糊，丰收也可能不见利润。',
      joy:'喜见土地条件合宜、田管跟得上、病虫害可控、产量达到预期，且采收前已有稳定买家。卖价不必最高，只要损耗低、回款准、扣除全部成本后有结余，便是实在的顺。'
    },
    生意:{
      verdict:'可以谈，也有成单机会，但先看客户、毛利和回款，不能只看营业额。', flow:'前段靠客源与议价，中段容易卡在交付和账期；合同与现金流清楚后才会转顺。', end:'订单交付、货款到账、成本扣清后仍有利润才算做成；忙而无结余不算赚钱。',
      good:'把客户来源、报价、成本、交付标准、售后责任和付款节点写清，优先做自己懂、能重复交付、回款记录好的业务。',
      caution:'慎大客户长账期、口头加单和为成交不断让价。营业额看着增长，库存、垫资和坏账也可能同时吃掉利润。',
      avoid:'忌无合同发货、替客户长期垫资、担保赊账或只凭关系合作。对方履约反复时，应先收款或缩小风险敞口。',
      joy:'喜见订单稳定、毛利清楚、交付顺畅、回款按期，老客还能复购转介绍。钱与货形成正常循环，才是生意真正转顺。'
    },
    债务:{
      verdict:'能处理，但不宜靠新增高息借款遮旧债；先分清本金、利率、期限与优先级。', flow:'前期压力仍在，若能停止新增负债、稳定现金流并与债权方谈清，局面会逐步缓和。', end:'本金持续下降、利息不再滚大、日常生活能维持，才算真正转好。',
      good:'列清每笔债务，优先处理高息和逾期风险，保留基本生活费，再以稳定收入持续偿还。',
      caution:'慎以贷养贷、只还最低额或相信一次投机能翻身；账面暂时轻松，成本可能正在累积。',
      avoid:'忌隐瞒债务、替人担保、再借高息款和挪用必要生活资金。无法按期时应尽早沟通，不要失联。',
      joy:'喜见新增债务停止、利率下降、还款计划可执行且本金月月减少，现金流重新有余地。'
    },
    换工作:{
      verdict:'可以换，但新岗位的职责、收入、稳定性与发展必须优于现在，不能只为逃离而走。', flow:'交接期会有反复，书面条件确认后转顺；若岗位描述含糊，入职后容易重复旧问题。', end:'收入兑现、职责清楚、能力有积累且试用期能过，才算换对。',
      good:'先拿正式录用与完整条件，再比较通勤、工时、社保、试用期、汇报关系和晋升空间。',
      caution:'慎口头承诺、职位名称好听却权责不清，也慎同时换行业、城市和岗位造成风险叠加。',
      avoid:'忌新条件未定先裸辞，忌因一时冲突仓促决定，也忌忽略竞业、违约和工资结构。',
      joy:'喜见岗位与本领相接、领导授权明确、收入按约兑现，做出的成绩能归到自己名下。'
    },
    升职:{
      verdict:'有争取空间，但必须同时拿到职位、权限和相称回报，只有名头不算升。', flow:'竞争和考察在前，成果归属与领导态度明确后才会顺。', end:'任命落纸、权责相称、资源到位且待遇兑现，才算成。',
      good:'把可量化成果、接任方案和所需资源准备清楚，直接谈职责边界、团队和回报。',
      caution:'慎无权担责、临时代理和长期画饼；任务增加而权限待遇不变，不是好兆头。',
      avoid:'忌靠站队和口头保证下注，也忌未获授权便替整个结果负责。',
      joy:'喜见正式任命、资源支持、成绩被承认，领导愿意为你的职责与结果负责。'
    },
    创业:{
      verdict:'可以筹划，但先看真实订单能否成立，再决定投入；不建议一开始重资产扩张。', flow:'起步琐事多，现金流比热情更重要；客户、产品和交付跑通后才会顺。', end:'有稳定付费客户、毛利为正、回款覆盖固定成本，才算能做下去。',
      good:'从熟悉领域切入，先看客户是否愿意付钱，再定产品、合伙分工和资金预算。',
      caution:'慎高估销量、低估获客与交付成本，也慎合伙只谈愿景不谈退出和分钱。',
      avoid:'忌借重债开局、未有客户便大额租店招人，也忌公私账混用。',
      joy:'喜见复购出现、回款及时、单位利润清楚，团队分工稳定且现金能覆盖支出。'
    },
    复合:{
      verdict:'有情可谈，但能否复合不看一时心软，要看旧问题是否真正改掉。', flow:'联系可能恢复，关系仍会在原矛盾处受阻；双方肯面对责任才会转顺。', end:'重新确认名分、边界和未来安排，并持续做到，才算复合成功。',
      good:'把当初分开的原因逐项说清，观察对方是否愿意承担、道歉和改变，而非只说想念。',
      caution:'慎把寂寞、愧疚或短期热情当成缘分回转；联系恢复不等于关系已稳。',
      avoid:'忌反复试探、冷战逼承诺、替对方找借口，也忌在信任未修复前重新绑定钱财。',
      joy:'喜见对方主动、公开、守约，旧矛盾有具体解决办法，重要决定不再让你独自猜。'
    },
    结婚:{
      verdict:'可以往结婚谈，但先把名分、住房、钱、父母边界和责任说定。', flow:'感情有承接，现实安排容易有摩擦；双方共同承担便会转顺。', end:'领证与婚礼不是终点，关键是约定能长期执行；现实问题谈不拢则不宜仓促。',
      good:'正面谈住处、财务、债务、生育、家务和双方父母，重要约定形成共同决定。',
      caution:'慎只看感情热度而回避现实，也慎一方不断妥协来换婚期。',
      avoid:'忌隐瞒债务、疾病或重要家庭责任，忌用催婚、冷战和分手威胁迫使表态。',
      joy:'喜见双方家庭态度明朗、钱与住处有安排，遇到分歧仍能一起处理。'
    },
    '感情去留':{
      verdict:'可不可以继续，要看对方是否给名分、担当与稳定行动；只有感情而无责任，不宜久拖。', flow:'眼下有牵挂也有阻滞，沟通能暂时和缓，旧问题不改仍会反复。', end:'双方把未来说定并持续做到，可继续；长期回避、失联或推卸责任，应作不顺论。',
      good:'直接问清关系定位、现实安排和解决矛盾的办法，观察对方能否前后一致地做到。',
      caution:'慎把偶尔热情当成长期认真，也慎用自己的付出来替对方解释。',
      avoid:'忌冷战、试探、翻旧账和用分手逼承诺；更忌在关系不稳时借贷、担保或合资。',
      joy:'喜见对方主动联系、公开关系、兑现承诺，遇到现实问题仍愿意共同承担。'
    },
    考试:{verdict:'这次考试可以争取，但不能只靠临场运气；先看准备是否完整、弱项是否补齐。',flow:'前期容易因范围多、时间紧而乱，复习主次固定、模拟发挥稳定后才会转顺。',end:'会做的题能拿分、薄弱项不再反复失误，正式成绩达到目标，才算考成。',good:'把目标分数拆到科目和题型，先守住基础分，再补最容易提分的弱项；用完整限时模拟检验真实水平。',caution:'慎资料换得太勤、只看答案不动笔，也慎平时会做却不练时间分配。模拟波动大，说明准备还未闭合。',avoid:'忌押题、熬夜突击和因一次模考失利全盘推翻计划；越接近考试，越要守熟悉方法和正常作息。',joy:'喜见正确率连续上升、模考波动变小、会做的题稳定得分，老师反馈和正式成绩也能互相印证。'},
    买房:{verdict:'可以买，但产权、总成本、月供和居住需求必须同时过关，不能只凭喜欢下决定。',flow:'看房与议价会有反复，资料、资金和家庭意见说清后才会顺。',end:'产权无误、月供可承受、住后确实更方便，且仍留有应急现金，才算买对。',good:'核实产权、抵押查封、税费、维修、通勤、噪音和真实月供，把最坏收入情形也算进去再定。',caution:'慎销售口头承诺、未来升值和只看户型环境；首付后现金过薄，房子再合意也会压住生活。',avoid:'忌未核产权便交大额定金、高息借款凑首付、超能力负债，也忌只凭方位或吉凶决定价值。',joy:'喜见资料与现场一致、价格在承受线内、家人意见能合，住后生活改善且资金仍有退路。'},
    学业:{verdict:'可以学，也能争取成果，但必须把所学落到作业、作品、测验或证书。',flow:'理解不算慢，容易受目标太多牵制；主线固定、练习持续后会转顺。',end:'知识能够独立输出，成绩或作品达到明确标准，才算真正学成。',good:'只定一个主要目标，把时间分给输入、练习和复盘；每阶段用作品或测验检验是否掌握。',caution:'慎听懂便以为会做，也慎同时铺太多课程。若一直收藏资料却没有输出，进度只是表面。',avoid:'忌频繁换老师、换资料、换方向，也忌因一时卡住便断定没有天分。',joy:'喜见练习正确率提高、反馈越来越具体、成果能够独立完成，所学也能直接解决现实问题。'},
    家宅:{verdict:'这件家宅事可以推进，但先把资金、使用需求、家人意见和退出条件说清。',flow:'前期容易在价格、地点或家庭选择上反复，条件逐项核实后才会顺。',end:'住得安、费用能承受、合同无误且家人长期能适应，才算真正成。',good:'把现场、总成本、通勤、维护、合同和长期使用需求列清，再按全家实际承受能力决定。',caution:'慎只看环境好看或一时方便，不看隐性费用、长期压力与日后转手难度。',avoid:'忌资料未核先付款、产权合同含糊、超能力负债，也忌用一句吉断替代现场和文件。',joy:'喜见现场与资料一致、成本可控、家人意见相合，搬入以后生活更稳而不是压力更重。'},
    人际:{verdict:'这段往来可以继续，但要看对方是否守信、担责，不能只看一时热情。',flow:'前期容易亲近，中途会在分工、利益或边界上见真章；说清以后才能转顺。',end:'承诺能兑现、责任有人担、双方都有所得，才算关系可用且能久。',good:'先定目标、分工、利益、期限和退出办法，重要事项保留清楚记录。',caution:'慎只讲人情不讲责任，也慎把一次帮忙当成长久可靠。关键处能否补位，才是真判断。',avoid:'忌替人担保、替人背责、账目含糊和被情绪迫使让步；事实对不上时立即停下来核对。',joy:'喜见对方主动补位、承诺兑现、账目透明，遇到分歧仍愿意按事实商量。'},
    纠纷:{verdict:'这件纠纷可以处理，但成败看事实、证据与程序，不凭相法替你定输赢。',flow:'过程不会很快，对方态度与手续可能反复；证据链完整、步骤正确后才会转顺。',end:'权利义务写进正式文书并真正履行，才算事情解决；口头和解不算落定。',good:'保存合同、聊天、转账、通知和完整时间线，先让合资格专业人士核对关键权利与程序。',caution:'慎在证据未齐时公开争辩或仓促签字，也慎把对方一次松口当成最终结果。',avoid:'忌删记录、伪造材料、冲动辱骂和用命理代替法律判断；重大权益必须走正规渠道。',joy:'喜见证据完整、专业意见一致、对方愿正式协商，方案内容清楚且能够履行。'},
    感情:{
      verdict:'这段关系可以继续看，但能否顺利，要看对方是否愿意给名分、担当与稳定行动。', flow:'有情也有阻，沟通得当会缓和，现实问题回避不谈仍会反复。', end:'双方把以后说清并持续做到，关系可成；长期含糊则不作可成论。',
      good:'把关系定位、未来安排、双方家庭和钱的边界谈明白，看行动是否与承诺一致。',
      caution:'慎一热一冷、只说喜欢却回避现实，也慎因为舍不得而长期替对方解释。',
      avoid:'忌试探、冷战、翻旧账和以分手逼承诺，关系未稳时也不要绑定债务与资产。',
      joy:'喜见主动联系、公开身份、愿意谈未来，遇到矛盾后仍能回来共同解决。'
    },
    事业:{verdict:'可以争取，但先看职位、职责、权限与回报是否相称。',flow:'前期有竞争和压力，条件谈清后才会转顺。',end:'能力落到明确位置、成果归属清楚且回报兑现，才算做成。',good:'把目标岗位、职责范围、资源支持和考核方式说清，选择能积累本领与成绩的机会。',caution:'慎名大实小、权责不等和口头许诺；只加任务不加权限回报，不算真正向上。',avoid:'忌条件未定先辞职，也忌因一时不快同时更换行业、城市和岗位。',joy:'喜见正式条件明确、领导肯授权、成果能归己，收入与位置同步上升。'},
    财运:{verdict:'有财可求，但要看收入来源、成本和回款，不能只凭一时进账断赚钱。',flow:'机会有，耗损也有；账目与边界清楚后才会顺。',end:'钱真正到手、扣除成本后仍有结余，才算得财。',good:'守住稳定收入，把成本、合同、回款日期与风险上限写清，优先做自己熟悉且能重复的事。',caution:'慎账面有利却被成本、拖款和人情吃掉，也慎把偶然所得当成长期能力。',avoid:'忌借贷重押、替人担保、口头合伙和把应急资金投入高风险事项。',joy:'喜见进财有路、回款有期、到手能留，连续几次仍有结余，财才算聚。'},
    亲情:{verdict:'这件家事可以谈开，也能帮，但必须先分清责任和边界。',flow:'亲情有承接，过程容易因钱、房或照护反复。',end:'谁主事、谁承担、谁退让说清，家中可由乱转和。',good:'把照护、住房、钱财和日常分工拆开商量，按每个人真正能做的程度承担。',caution:'慎把孝顺与无限承担混为一谈，能帮可以帮，边界却要先说清。',avoid:'忌偏听一面、情绪逼迫和产权借款只留口头，责任不明只会积怨。',joy:'喜见长辈能听劝、手足肯分担、晚辈有回应，钱与房的安排公开明白。'},
    健康:{verdict:'照片只可看调养趋势，不能用来断病。',flow:'恢复顺不顺，以症状、检查与治疗反应为准。',end:'作息转稳、症状减轻且复查清楚才算真正好转。',good:'如实记录不适、睡眠、饮食和体力变化，并按专业意见检查治疗。',caution:'慎把短期好转当痊愈，也不要因形色尚可而拖延检查。',avoid:'忌讳疾忌医、擅自停药或用相法判断疾病；突然、剧烈或加重的不适应及时就医。',joy:'喜见精神、睡眠、饮食与体力持续恢复，且客观检查也同步向好。'},
    痣相:{verdict:'可按所见部位论象，但不能凭一处痣斑断全部吉凶。',flow:'旧痣稳定只作传统位置提示，新生或变化者先按健康问题处理。',end:'位置、颜色、边界和邻近形态相应才可暂下结论。',good:'把准确位置、颜色、大小、凹凸与近年变化说清，再按本次上传部位来论。',caution:'慎把网络口诀直接套用；光线、滤镜和角度不准时，不作夸大判断。',avoid:'忌因相法自行点除或延误就医；新生、变大、颜色不均、出血破溃者先看皮肤科。',joy:'喜见颜色稳定、边界清楚、长期无变化，且不破坏所在部位的整体形态。'}
  }[scene];
  const followKey={股票:'stock',种植:'farming',生意:'business',债务:'debt',换工作:'jobchange',升职:'promotion',创业:'startup',复合:'reunion',结婚:'marriage','感情去留':'relationChoice',考试:'exam',买房:'buyhouse'}[scene];
  const follow=followKey&&typeof SCENE_ADD!=='undefined'?(SCENE_ADD[followKey]||''):'';
  const reality={财运:'实际执行时，只认真实账户、成本、合同、回款和最终结余；若上述条件不能成立，就把“可以”降为“慎做”，不能拿一句吉断替代风险控制。',事业:'实际执行时，只认书面岗位、职责权限、收入待遇和最终成果；条件若迟迟不能兑现，就把“可以”降为“慎做”，不可只凭口头承诺硬撑。',感情:'实际相处中，只认对方持续的联系、公开、守约与担当；若长期只有话而没有行动，就把“可以继续”降为“慎重去留”，不替对方反复解释。',亲情:'家事最终只认责任是否有人承担、钱房是否说清、约定能否长期做到；若仍靠一人忍让维持表面和气，就不能当作已经转顺。',学业:'学业最后只认独立完成、稳定正确率和正式成绩；只听懂、只收藏资料或偶尔发挥好，都不能算已经学成。',家宅:'家宅最后只认资料无误、费用可承受、住后确实安稳；若必须透支生活或依赖未经确认的承诺，便不能作可成论。',人际:'人际最后只认守信、担责、分工清楚和利益公平；平时热情而关键处退开，便不能当作可靠关系。',纠纷:'纠纷最后只认完整证据、正确程序和正式履行；相法只能提醒应对分寸，不能替代法律判断。',健康:'身体状况最终只认真实症状、检查和专业意见；任何掌色、面色或纹理变化都只能作生活提醒，不能取代就医和治疗。',痣相:'痣斑最终要看真实皮肤变化和专业检查；传统位置说法只作文化参考，凡有新生、变大、破溃或出血，都应先处理健康问题。'}[topic]||'';
  let output=`断：${data.verdict}顺逆：${data.flow}成败：${data.end}${rule}。本次${source==='hand'?'只看手相':source==='face'?'只看面相':'手面合参'}，可见为${proof}；据此只断“${scene}”，不牵扯别的事情。\n\n宜：${data.good}\n\n慎：${data.caution}\n\n忌：${data.avoid}\n\n喜：${data.joy}${follow?' '+follow:''}${reality}`;
  const expanders={
    财运:[
      '还要把最坏情形先算进去：收入少于预期、成本临时增加、回款推迟时，手里是否仍有周转余地。承受不起一次普通变化的安排，就算眼前见利，也不宜扩大。',
      '凡是需要不断追加资金才能维持、只谈收益不谈亏损、只讲机会不讲退出的做法，都要先按风险处理。真正可做的财路，应当能说清钱从哪里来、何时回来、失败最多损失多少。',
      '最后核对的不是忙不忙、规模大不大，而是净收入能否稳定留下。若连续几次都有进账却没有结余，应先停下来查成本、坏账与不必要支出，再决定是否继续。',
      '钱财上的好结果应当经得住核算，也经得住时间。把每笔投入和回收留有记录，按净利而不是感觉判断；看不清的账先理清，不能因为已经做了便继续追加。'
    ],
    事业:[
      '再看这件事能不能让你的经验、能力和人脉继续累积。若只是临时填缺、替人担责或反复救火，做得越久越难形成自己的位置；能留下作品、业绩和可迁移本领，才值得投入。',
      '与领导或合作方谈时，把目标、权限、资源、考核和完成期限一次说清。对方愿意给任务，却不愿给必要条件，事情便容易先热后冷；口头称赞不能代替正式安排。',
      '真正的顺利，是工作量可承受、成绩有人承认、收入按约兑现，遇到变化时也有清楚的决定人。若三项长期缺失，就应调整岗位或方向，不可只靠加班硬顶。',
      '决定之前还要看退路：事情不成时能否保住收入、履历与关系。能进能退的机会可以争，只有投入没有回收、出了问题又无人承担的安排，应当及时收住。'
    ],
    感情:[
      '再看两个人遇到压力时的反应：能不能把事实说清、能不能在争执后回来解决、能不能为共同决定承担后果。平时甜蜜不难，难处来时仍肯并肩，关系才有根。',
      '对方若真想继续，会让你知道他的安排，也会在时间、精力和现实责任上留出位置。只有偶尔联系、口头想念或情绪上舍不得，却始终不给明确关系，仍不能当作可成。',
      '最后不要只问有没有缘，还要问这段关系是否让你更安定、更坦诚、更有尊严。若长期靠猜测、等待和退让维持，即使暂时不断，也不是顺；能相爱也能共事，才适合久处。',
      '该说的话要在关系平稳时说，不要等到情绪最重才摊牌。谈完以后观察的不是对方当下说得多好，而是后面是否持续照做；行动能接上，感情才有后续。'
    ],
    亲情:[
      '再把每个人能做什么、不能做什么列清，不因辈分或情绪把全部责任压给最肯承担的人。真正的亲情不是谁一味牺牲，而是难处来时有人出钱、有人出力、有人作决定。',
      '涉及房屋、借款、照护和长期费用时，越亲近越要讲明白。提前留下清楚约定，不是伤感情，而是防止日后各自记忆不同，把原本能商量的事拖成怨气。',
      '若家人愿意听事实、按能力分担，也肯尊重你的边界，事情便可慢慢转和；若每次都靠指责、哭闹或冷战迫使一人让步，表面平静也不算真正解决。',
      '处理家事宜留余地，也要有原则。能在不伤基本生活、不越过财务底线的范围内帮忙便帮；超过能力的要求应说明原因，不以愧疚替代长期安排。'
    ],
    学业:[
      '再把目标拆到能核对的结果：哪一科、哪类题、哪件作品或哪张证书。目标越具体，越能看清是知识没有掌握，还是时间分配和临场状态出了问题。',
      '复习时要保留完整输出，不能只看讲解便觉得自己会了。独立完成、限时作答、及时订正，三项连续做到，准备才算真正闭合。',
      '若成绩反复，先查最常丢分的原因，不把所有内容一起重学。基础分能守住、薄弱项逐步收口，比临近考试频繁换方法更稳。',
      '真正的喜象要落到事实：正确率提高、模拟波动变小、老师反馈明确，正式成绩也能接上。只凭感觉良好，不作顺利论。'
    ],
    家宅:[
      '再把产权、合同、总费用、通勤、维护和日后退出逐项核对。任何一项只能靠口头保证，便先按尚未成立处理，不因环境合意就急着付款。',
      '资金要按最坏收入情形来算，付完首款或搬迁费用后仍须留有生活和应急余地。住处是求安，不是用长期透支换一时喜欢。',
      '家人意见也要落到实际承担：谁出钱、谁居住、谁负责维护、变动时怎样处理。只让一人承担而其他人只提要求，入住后仍会生怨。',
      '最后只看住后是否更稳、更方便、费用是否持续可承受。资料、现场与生活需求都相合，才是家宅真正得所。'
    ],
    人际:[
      '再看对方在利益和压力出现时如何选择。平时说得亲近不难，关键处能守约、补位并承担结果，才算这段关系有用。',
      '合作前把目标、分工、账目、期限和退出办法写清，越熟的人越不能省略。说明白不是不信任，而是避免日后各自理解不同。',
      '若对方连续拖延、隐瞒事实、只拿好处不担责任，应及时缩小往来，不以人情替他补漏洞，也不替他承担无法控制的后果。',
      '真正可喜，是双方都能因这段关系变得更稳：承诺能兑现、分歧可商量、利益分得清，合作结束后仍能互相尊重。'
    ],
    纠纷:[
      '先按时间顺序整理合同、聊天、付款、通知和对方承诺，区分原件、复印件与口头说法。事实链断一处，后面判断就可能受影响。',
      '涉及签字、公开回应、时效和重大权益时，应让合资格专业人士核对。程序走错，即使道理占优，也可能增加不必要的成本。',
      '对方愿意谈只是转机，不是结果；条件必须写进正式文书，金额、期限、责任和违约处理都要明确，并确认能够执行。',
      '此类问题不以吉凶话定输赢。证据完整、程序正确、文书生效并实际履行，四项能够接上，才可说事情真正解决。'
    ],
    健康:[
      '日常只做稳妥的事：规律作息、正常饮食、适量活动，并记录症状出现的时间、强度和诱因。这样才能把变化准确告诉医生，也能分清是真的持续好转，还是一时感觉轻松。',
      '若不适反复、影响睡眠工作，或出现突然、剧烈、持续加重的症状，应尽快寻求专业医疗帮助。不能因为相法说法听着吉利便拖延，也不能因为听着不利便自行恐慌。',
      '恢复是否顺，以身体感受和客观检查彼此相应为准。治疗方案、用药和复查都应服从合资格专业人员意见；传统形色最多提醒你多照顾自己，不能给疾病定名。',
      '若已经有明确诊断，就按既定方案复诊，不擅自增减药物；若尚未检查而不适持续，就先查明原因。健康问题宁可凭证据慢慢确认，也不凭照片下重断。'
    ],
    痣相:[
      '再看照片是否自然光、没有滤镜，位置和边界能否完整看清。角度不同会改变颜色与凸凹，资料不清时宁可暂缓，不为迎合问题硬说吉凶。',
      '传统痣相只讲部位象义，不能替代皮肤健康判断。只要近来出现明显变化，就先保留清楚照片记录，并咨询合资格专业人员，不自行处理或拖延。',
      '若长期稳定、边界清楚、颜色均一，可只作所在部位的传统提醒；是否吉利仍须合整体形态与真实生活相看，不能让一颗痣替整个人下定论。',
      '需要继续观察时，应在相同光线和角度下定期留图，便于比较真实变化。不要频繁触碰、挤压或自行点除；涉及健康疑问，直接让皮肤科判断。'
    ]
  }[topic]||[];
  for(const sentence of expanders){if(output.length>=640)break;output+=sentence;}
  const finalDetail={亲情:'最后还要看商量之后有没有人真正照约定承担；责任落到人、费用落到账、边界能够守住，家中才算由乱转和。',学业:'最后以连续几次独立完成的结果为准；能够稳定输出、错误确实减少、正式成绩接近目标，才作学业转顺论。',人际:'最后看一次真正涉及利益或责任的事情：对方仍能守约、说清并补位，这段往来才值得继续；关键处退开，平日再热情也不算可靠。',纠纷:'最后须确认文书是否生效、约定是否履行、损失是否止住；只有对方口头答应而没有正式落地，仍不能说纠纷已经解决。',健康:'最后以持续的身体变化和客观检查为准；精神好转、症状减轻、复查清楚并能正常生活，才作恢复渐顺论。',痣相:'最后只在光线真实、位置清楚、长期稳定的前提下谈传统象义；凡有变化，所有吉凶说法都应先让位于皮肤科检查。'}[topic]||'';
  if(output.length<640)output+=finalDetail;
  return output;
};function renderPhysioAnswer(result){let token=++physioRevealRun,box=q('#questionAnswer');physioBusy=true;ready();box.innerHTML='<div class="answer-wait" aria-label="正在推演"><span>·</span><span>·</span><span>·</span></div>';box.classList.add('show');q('#scanResult').classList.remove('show');v.scrollTo({top:box.offsetTop-80,behavior:'smooth'});setTimeout(()=>{if(token!==physioRevealRun)return;let chunks=result.split(/\n\n(?=宜：|慎：|忌：|喜：)/);box.innerHTML='';let lead=document.createElement('div');lead.className='reveal-part';let tag=document.createElement('span');tag.className='tag';tag.textContent='只断所问 · 不越题';let title=document.createElement('h3');title.textContent='最终结论';let first=document.createElement('p');first.textContent=chunks.shift()||result;lead.append(tag,title,first);box.appendChild(lead);chunks.forEach(text=>{let part=document.createElement('p');part.className='reveal-part';part.textContent=text;box.appendChild(part)});let parts=[...box.querySelectorAll('.reveal-part')];parts.forEach((part,i)=>setTimeout(()=>{if(token!==physioRevealRun)return;part.classList.add('is-visible');if(i===parts.length-1){physioBusy=false;ready()}},i*260));v.scrollTo({top:box.offsetTop-80,behavior:'smooth'})},3000)}q('#scanBtn').onclick=()=>{if(physioBusy)return;let question=q('#physioQuestion').value.trim();if(!question){q('#questionAnswer').innerHTML='<span class="tag">问题未写清</span><h3>先写明你要问的事</h3><p>一次只问一件事，并写明对象和期限。问题不清，不生成套话。</p>';q('#questionAnswer').classList.add('show');q('#scanResult').classList.remove('show');v.scrollTo({top:q('#questionAnswer').offsetTop-80,behavior:'smooth'});return}let bad=[];[['left','左掌'],['right','右掌']].forEach(([k,n])=>{if(f[k]&&(m[k].skin<.08||m[k].ratio>2.4||m[k].ratio<.38))bad.push(n)});[['face','正脸'],['faceLeft','左侧脸'],['faceRight','右侧脸']].forEach(([k,n])=>{if(f[k]&&(m[k].skin<.12||m[k].ratio>1.9||m[k].ratio<.42))bad.push(n)});if(bad.length){q('#questionAnswer').innerHTML='<span class="tag">照片无法识别</span><h3>请重新拍摄</h3><p>'+bad.join('、')+'没有足够清晰的手部或面部特征。手掌要完整入镜，面部要正面或45度侧面、自然光、无遮挡。</p>';q('#questionAnswer').classList.add('show');q('#scanResult').classList.remove('show');v.scrollTo({top:q('#questionAnswer').offsetTop-80,behavior:'smooth'});return}let L=f.left?handInfo(m.left,'左'):null,R=f.right?handInfo(m.right,'右'):null,F0=f.face?faceInfo(m.face,'正脸'):null,FL=f.faceLeft?faceInfo(m.faceLeft,'左侧脸'):null,FR=f.faceRight?faceInfo(m.faceRight,'右侧脸'):null,F=F0||FL||FR,basis=L&&R?{proof:L.proof+'；'+R.proof,tone:L.tone,line:R.line,force:R.force}:L||R||{proof:'未上传手掌，以面部形色为主'},answer=answerQuestion(question,basis,F,mode);if(answer.startsWith('问题还没有')){if(window.XingxuBilling?.recordQuestion)window.XingxuBilling.recordQuestion({channel:'手相面相',question})}else if(window.XingxuBilling&&!window.XingxuBilling.authorizeQuestion({channel:'手相面相',question}))return;renderPhysioAnswer(answer)};q('#physioQuestion').onkeydown=e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.isComposing){e.preventDefault();if(!q('#scanBtn').disabled)q('#scanBtn').click()}};go('portal')})();
