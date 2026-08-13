(function(){
'use strict';

var MP_VERSION='0.10.35';
var MP_WASM='https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@'+MP_VERSION+'/wasm';
var MP_MODULE='https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@'+MP_VERSION+'/+esm';
var MP_MODEL='https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task';
var faceLandmarkerPromise=null;

function esc(v){return String(v==null?'':v).replace(/[&<>\"]/g,function(ch){return {'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[ch];});}
function lines(v){return String(v||'').split('\n').map(function(line){
  if(!line)return '<div class="pa-gap"></div>';
  if(/^[一二三四五六七八九十]+、/.test(line))return '<h3 class="pa-title">'+esc(line)+'</h3>';
  if(/^•/.test(line))return '<div class="pa-bullet">'+esc(line)+'</div>';
  return '<div class="pa-p">'+esc(line)+'</div>';
}).join('');}
function level(v,small,clear){return v>=clear?'明显':v>=small?'轻微':'未见明显';}
function sideText(v){return v<0?'向画面左侧':v>0?'向画面右侧':'居中';}
function topicOf(q){
  if(/感情|爱情|婚姻|对象|关系|复合|分手|结婚|恋爱|正缘|姻缘|桃花|夫妻|伴侣/.test(q))return '感情';
  if(/事业|工作|职业|升职|创业|跳槽|岗位|公司|领导|生意/.test(q))return '事业';
  if(/财|钱|收入|投资|股票|基金|回款|债|房产/.test(q))return '财运';
  if(/父母|亲情|家庭|孩子|子女|兄弟|姐妹|家人/.test(q))return '家庭';
  if(/朋友|人际|同事|合作|合伙|客户/.test(q))return '人际';
  if(/健康|身体|睡眠|疾病|疼痛|恢复/.test(q))return '健康';
  if(/考试|学业|学习|成绩|考研|考公/.test(q))return '学业';
  if(/痣|胎记|疤|伤痕|斑/.test(q))return '特征';
  return '自身';
}

async function getFaceLandmarker(){
  if(!faceLandmarkerPromise)faceLandmarkerPromise=(async function(){
    var mp=await import(MP_MODULE);
    var vision=await mp.FilesetResolver.forVisionTasks(MP_WASM);
    try{
      return await mp.FaceLandmarker.createFromOptions(vision,{baseOptions:{modelAssetPath:MP_MODEL,delegate:'GPU'},runningMode:'IMAGE',numFaces:1,minFaceDetectionConfidence:.55,minFacePresenceConfidence:.55,outputFacialTransformationMatrixes:true});
    }catch(_){
      return await mp.FaceLandmarker.createFromOptions(vision,{baseOptions:{modelAssetPath:MP_MODEL,delegate:'CPU'},runningMode:'IMAGE',numFaces:1,minFaceDetectionConfidence:.55,minFacePresenceConfidence:.55,outputFacialTransformationMatrixes:true});
    }
  })();
  return faceLandmarkerPromise;
}
function pt(a,i){return a[i]||{x:0,y:0,z:0};}
function avgPts(a,ids){var x=0,y=0;ids.forEach(function(i){x+=pt(a,i).x;y+=pt(a,i).y;});return{x:x/ids.length,y:y/ids.length};}
function dist(a,b){return Math.hypot(a.x-b.x,a.y-b.y);}
function rotated(p,o,ang){var x=p.x-o.x,y=p.y-o.y,c=Math.cos(ang),s=Math.sin(ang);return{x:x*c-y*s,y:x*s+y*c};}
function visibleName(x,y){
  var side=x<.46?'画面左侧':x>.54?'画面右侧':'面部中央';
  var band=y<.26?'额部':y<.43?'眉眼附近':y<.62?'颧颊或鼻部附近':y<.78?'口周或面颊下部':'下巴附近';
  return side+band;
}
function imageCanvas(img,size){
  var c=document.createElement('canvas'),ctx=c.getContext('2d',{willReadFrequently:true});
  c.width=size;c.height=size;
  var scale=Math.min(size/img.naturalWidth,size/img.naturalHeight),w=img.naturalWidth*scale,h=img.naturalHeight*scale,x=(size-w)/2,y=(size-h)/2;
  ctx.drawImage(img,x,y,w,h);return{canvas:c,ctx:ctx,map:{x:x,y:y,w:w,h:h}};
}
function markCandidates(img,lm){
  var pack=imageCanvas(img,320),ctx=pack.ctx,map=pack.map,w=320,h=320;
  var src=ctx.getImageData(0,0,w,h),blur=document.createElement('canvas');blur.width=w;blur.height=h;
  var bx=blur.getContext('2d',{willReadFrequently:true});bx.filter='blur(7px)';bx.drawImage(pack.canvas,0,0);var bg=bx.getImageData(0,0,w,h).data,d=src.data;
  var faceXs=lm.map(function(p){return map.x+p.x*map.w;}),faceYs=lm.map(function(p){return map.y+p.y*map.h;});
  var minX=Math.max(0,Math.floor(Math.min.apply(null,faceXs))),maxX=Math.min(w-1,Math.ceil(Math.max.apply(null,faceXs)));
  var minY=Math.max(0,Math.floor(Math.min.apply(null,faceYs))),maxY=Math.min(h-1,Math.ceil(Math.max.apply(null,faceYs)));
  var cx=(minX+maxX)/2,cy=(minY+maxY)/2,rx=(maxX-minX)*.46,ry=(maxY-minY)*.50,mask=new Uint8Array(w*h);
  function excluded(nx,ny){
    return (ny>.28&&ny<.48&&Math.abs(nx-.5)>.10)||(ny>.56&&ny<.73&&Math.abs(nx-.5)<.27)||(ny>.37&&ny<.59&&Math.abs(nx-.5)<.10);
  }
  for(var y=minY;y<=maxY;y++)for(var x=minX;x<=maxX;x++){
    var nx=(x-minX)/(maxX-minX),ny=(y-minY)/(maxY-minY);
    if((((x-cx)/rx)**2+((y-cy)/ry)**2)>1||excluded(nx,ny))continue;
    var i=(y*w+x)*4,R=d[i],G=d[i+1],B=d[i+2],lum=.299*R+.587*G+.114*B,base=.299*bg[i]+.587*bg[i+1]+.114*bg[i+2];
    var dark=base-lum,red=R-(G+B)/2;
    if((dark>31&&lum>22)||(red>34&&dark>10))mask[y*w+x]=1;
  }
  var seen=new Uint8Array(w*h),out=[];
  for(var y=minY;y<=maxY;y++)for(var x=minX;x<=maxX;x++){
    var id=y*w+x;if(!mask[id]||seen[id])continue;
    var q=[id],n=0,sx=0,sy=0,loX=x,hiX=x,loY=y,hiY=y;seen[id]=1;
    while(q.length){var k=q.pop(),yy=Math.floor(k/w),xx=k-yy*w;n++;sx+=xx;sy+=yy;loX=Math.min(loX,xx);hiX=Math.max(hiX,xx);loY=Math.min(loY,yy);hiY=Math.max(hiY,yy);
      for(var oy=-1;oy<=1;oy++)for(var ox=-1;ox<=1;ox++){var X=xx+ox,Y=yy+oy,j=Y*w+X;if(X>=0&&X<w&&Y>=0&&Y<h&&mask[j]&&!seen[j]){seen[j]=1;q.push(j);}}
    }
    if(n>=4&&n<=115){var bw=hiX-loX+1,bh=hiY-loY+1,aspect=Math.max(bw,bh)/Math.max(1,Math.min(bw,bh));out.push({n:n,x:(sx/n-minX)/(maxX-minX),y:(sy/n-minY)/(maxY-minY),aspect:aspect});}
  }
  return out.sort(function(a,b){return b.n-a.n;}).slice(0,4).map(function(c){
    var type=c.aspect>3&&c.n>10?'疑似线状疤痕或褶痕':'疑似痣、色斑或胎记色点';
    return type+'：'+visibleName(c.x,c.y)+'（需以原图放大复核）';
  });
}
async function analyzeFace(img,label){
  var detector=await getFaceLandmarker(),result=detector.detect(img),lm=result.faceLandmarks&&result.faceLandmarks[0];
  if(!lm)return{ok:false,label:label,error:'没有识别到完整人脸'};
  var e1=avgPts(lm,[33,133,159,145]),e2=avgPts(lm,[362,263,386,374]),le=e1.x<e2.x?e1:e2,re=e1.x<e2.x?e2:e1,eyeMid={x:(le.x+re.x)/2,y:(le.y+re.y)/2};
  var roll=Math.atan2(re.y-le.y,re.x-le.x),ang=-roll,inter=dist(le,re),top=rotated(pt(lm,10),eyeMid,ang),chin=rotated(pt(lm,152),eyeMid,ang);
  var nose=rotated(pt(lm,1),eyeMid,ang),mc1=rotated(pt(lm,61),eyeMid,ang),mc2=rotated(pt(lm,291),eyeMid,ang),mouthL=mc1.x<mc2.x?mc1:mc2,mouthR=mc1.x<mc2.x?mc2:mc1,mouthC={x:(mouthL.x+mouthR.x)/2,y:(mouthL.y+mouthR.y)/2};
  function axisX(y){var t=(y-top.y)/Math.max(.0001,chin.y-top.y);return top.x+(chin.x-top.x)*t;}
  var noseDev=(nose.x-axisX(nose.y))/inter,mouthDev=(mouthC.x-axisX(mouthC.y))/inter,mouthSlope=(mouthR.y-mouthL.y)/Math.max(.0001,Math.abs(mouthR.x-mouthL.x));
  var eyeWidthL=dist(pt(lm,33),pt(lm,133)),eyeWidthR=dist(pt(lm,362),pt(lm,263)),yaw=Math.abs(eyeWidthL-eyeWidthR)/Math.max(eyeWidthL,eyeWidthR);
  var br1=avgPts(lm,[70,63,105,66,107]),br2=avgPts(lm,[336,296,334,293,300]),browL=br1.x<br2.x?br1:br2,browR=br1.x<br2.x?br2:br1,bL=rotated(browL,eyeMid,ang),bR=rotated(browR,eyeMid,ang),browDiff=(bR.y-bL.y)/inter;
  var eyeDiff=(rotated(re,eyeMid,ang).y-rotated(le,eyeMid,ang).y)/inter;
  var frontal=yaw<.20&&Math.abs(roll*180/Math.PI)<8;
  var features=[];
  features.push('拍摄状态：'+(frontal?'正脸角度可用于比较':'头部角度或透视偏差较大，以下左右差异只能作疑似特征'));
  features.push('鼻部：'+level(Math.abs(noseDev),.018,.038)+(Math.abs(noseDev)>=.018?'，鼻尖相对面中线'+sideText(noseDev):'偏斜'));
  if(Math.abs(mouthSlope)>=.035)features.push('口部：'+level(Math.abs(mouthSlope),.035,.075)+'歪斜，'+(mouthSlope>0?'画面左侧嘴角较高、右侧较低':'画面右侧嘴角较高、左侧较低'));
  else features.push('口部：未见明显嘴角高低差');
  if(Math.abs(mouthDev)>=.02)features.push('口部位置：口部中心相对面中线'+sideText(mouthDev)+'偏');
  if(Math.abs(browDiff)>=.025)features.push('眉部：'+(browDiff>0?'画面左眉较高、右眉较低':'画面右眉较高、左眉较低'));
  if(Math.abs(eyeDiff)>=.02)features.push('眼部：两眼水平位置可见轻微高低差');
  var marks=markCandidates(img,lm);features=features.concat(marks.length?marks:['特殊标记：当前清晰度下未检出足够明确的痣、胎记或疤痕候选']);
  return{ok:true,label:label,frontal:frontal,noseDev:noseDev,mouthDev:mouthDev,mouthSlope:mouthSlope,browDiff:browDiff,features:features,marks:marks};
}
function handMarks(pack,d){
  var w=320,h=320,skin=new Uint8Array(w*h),seen=new Uint8Array(w*h),best=[];
  for(var i=0;i<w*h;i++){var j=i*4,R=d[j],G=d[j+1],B=d[j+2],mx=Math.max(R,G,B),mn=Math.min(R,G,B);if(R>65&&G>28&&B>15&&R>G&&R>B&&mx-mn>12)skin[i]=1;}
  for(var y=0;y<h;y++)for(var x=0;x<w;x++){var id=y*w+x;if(!skin[id]||seen[id])continue;var q=[id],pts=[];seen[id]=1;while(q.length){var k=q.pop(),yy=Math.floor(k/w),xx=k-yy*w;pts.push(k);for(var oy=-1;oy<=1;oy++)for(var ox=-1;ox<=1;ox++){var X=xx+ox,Y=yy+oy,z=Y*w+X;if(X>=0&&X<w&&Y>=0&&Y<h&&skin[z]&&!seen[z]){seen[z]=1;q.push(z);}}}if(pts.length>best.length)best=pts;}
  if(best.length<1200)return[];
  var xs=best.map(function(k){return k%w;}),ys=best.map(function(k){return Math.floor(k/w);}),minX=Math.min.apply(null,xs),maxX=Math.max.apply(null,xs),minY=Math.min.apply(null,ys),maxY=Math.max.apply(null,ys),inside=new Uint8Array(w*h);best.forEach(function(k){inside[k]=1;});
  var blur=document.createElement('canvas');blur.width=w;blur.height=h;var bx=blur.getContext('2d',{willReadFrequently:true});bx.filter='blur(8px)';bx.drawImage(pack.canvas,0,0);var bg=bx.getImageData(0,0,w,h).data,cand=new Uint8Array(w*h);
  for(var y=minY+3;y<maxY-3;y++)for(var x=minX+3;x<maxX-3;x++){var id=y*w+x;if(!inside[id]||!inside[id-2]||!inside[id+2]||!inside[id-2*w]||!inside[id+2*w])continue;var i=id*4,R=d[i],G=d[i+1],B=d[i+2],lum=.299*R+.587*G+.114*B,base=.299*bg[i]+.587*bg[i+1]+.114*bg[i+2],red=R-(G+B)/2;if(base-lum>42||(red>38&&Math.abs(base-lum)>13))cand[id]=1;}
  seen.fill(0);var out=[];
  for(var y=minY;y<=maxY;y++)for(var x=minX;x<=maxX;x++){var id=y*w+x;if(!cand[id]||seen[id])continue;var q=[id],n=0,sx=0,sy=0,loX=x,hiX=x,loY=y,hiY=y;seen[id]=1;while(q.length){var k=q.pop(),yy=Math.floor(k/w),xx=k-yy*w;n++;sx+=xx;sy+=yy;loX=Math.min(loX,xx);hiX=Math.max(hiX,xx);loY=Math.min(loY,yy);hiY=Math.max(hiY,yy);for(var oy=-1;oy<=1;oy++)for(var ox=-1;ox<=1;ox++){var X=xx+ox,Y=yy+oy,j=Y*w+X;if(X>=0&&X<w&&Y>=0&&Y<h&&cand[j]&&!seen[j]){seen[j]=1;q.push(j);}}}if(n>=5&&n<=100){var bw=hiX-loX+1,bh=hiY-loY+1,aspect=Math.max(bw,bh)/Math.max(1,Math.min(bw,bh)),nx=(sx/n-minX)/(maxX-minX),ny=(sy/n-minY)/(maxY-minY),side=nx<.43?'画面左侧':nx>.57?'画面右侧':'中部',band=ny<.38?'指部或指根':ny<.77?'掌心':'掌根附近',type=aspect>3&&n>12?'疑似线状疤痕':'疑似痣、色斑或胎记色点';out.push({n:n,text:type+'：'+side+band+'（需放大原图复核）'});}}
  return out.sort(function(a,b){return b.n-a.n;}).slice(0,3).map(function(x){return x.text;});
}
function analyzeHand(img,label){
  var pack=imageCanvas(img,320),ctx=pack.ctx,d=ctx.getImageData(0,0,320,320).data,lum=[],sum=0,sum2=0,edge=0;
  for(var i=0;i<320*320;i++){var j=i*4,z=.299*d[j]+.587*d[j+1]+.114*d[j+2];lum[i]=z;sum+=z;sum2+=z*z;}
  for(var y=1;y<319;y++)for(var x=1;x<319;x++){var k=y*320+x;edge+=Math.abs(lum[k]-lum[k-1])+Math.abs(lum[k]-lum[k-320]);}
  var avg=sum/lum.length,contrast=Math.sqrt(sum2/lum.length-avg*avg),density=edge/(318*318*2),features=[label+'整体：'+(avg<105?'掌色偏沉':avg>175?'掌色偏亮':'掌色较均匀')+'，'+(density<16?'纹理偏简':density>29?'细纹较多':'主纹较清')+'，'+(contrast>52?'轮廓反差较强':contrast<30?'轮廓较柔':'轮廓较稳')],marks=handMarks(pack,d);
  features=features.concat(marks.length?marks:['特殊标记：当前清晰度下未检出边界足够明确的痣、胎记或疤痕；不把掌纹交叉点冒充特殊标记']);
  return{ok:true,label:label,features:features,marks:marks};
}

var FACE_ORIGINAL={
  nose:'准头尖斜，心事勾加。鼻梁不直，欺诈未息。',
  mouth:'从正面来看，左右唇不平均，比如左半边比右半边薄，或视觉上感觉此人的嘴斜向脸颊的一边，生有这种嘴的人，婚姻容易出问题。因为这种嘴相容易在相处过程中失言。夫妻不是爱吵架，就是会离异。',
  mark:'左右眼睛后方到发际间的两个小区域，也称为夫妻宫。这个部位反映了一个人的婚姻状况。如果这个区域有伤，或者有灰黑的痣，不是感情的路不平顺，就是感情走上三岔路。',
  whole:'面相，不仅指的是五官、三停、十二宫，当然它们很重要，但是并不是全部。一个人的精神面貌也是面相中必不可少的部分。古语中早就有“看相先看神”的说法。'
};
var HAND_ORIGINAL={
  whole:'相由心生，手相亦然，故相手可以推测心性也！夫，察人之心隆，观纹见掌，知掌地则知心地。掌平，心亦平。纹正，心亦正；纹横则性横。纹浅，机亦浅；纹深，机亦深。纹多，心绪多；纹少，机关少。',
  relation:'从手相看婚姻，一般都是先看婚姻线。婚姻线，顾名思义其代表的意义总离不开结婚、嫁娶之事。自然，要想详细地了解你的婚姻信息，除此线外尚需参考其他部分，绝不可因婚姻线不好，就一口断定结婚运欠佳。',
  career:'论掌纹曰：“人纹象人贤愚，主人贫富。”盖人纹以象人智慧之贤愚，以喻聪明智慧之赚聚生财故也。',
  mark:'掌中足底生黑痣者，贵而益夫。'
};
function featureRelevance(topic,features){
  var hasFace=features.some(function(x){return /鼻部：|口部：|眉部：|眼部：|拍摄状态：/.test(x);});
  var hasNose=features.some(function(x){return /鼻部：/.test(x)&&!/未见明显/.test(x);});
  var hasMouth=features.some(function(x){return /口部/.test(x)&&!/未见明显/.test(x);});
  var hasMark=features.some(function(x){return /疑似痣|疑似线状/.test(x);});
  var lead=topic==='感情'?'这次要把沟通方式、现实责任与关系稳定性放在一起看':topic==='事业'?'这次重点看表达执行、对外协作与承担责任的方式':topic==='财运'?'这次重点看取得资源、谈判表达与守住成果的方式':topic==='家庭'?'这次重点看家庭沟通、责任边界与长期相处':topic==='人际'?'这次重点看表达分寸、信任与合作边界':topic==='健康'?'外观特征不能诊断健康；只描述照片可见情况，有新生、变大、出血或不对称的痣疤应由医生检查':'这次从照片可见结构说明个人差异，不拿单一部位替代整体判断';
  var out=[lead+'。'];
  if(hasMouth)out.push('口部高低或偏斜与所问最直接对应的是表达方式：重要话题容易因语气、先后顺序或失言产生误解，因此回答不能只说“感情/事业一般”，而要把沟通这一项单独列为关键点。');
  if(hasNose)out.push('鼻部偏离面中线是这张脸的个人特征之一；在传统取象里鼻部常与做事、财帛及现实承担相连，因此围绕所问应核对实际行动和责任，不能只凭口头态度下结论。');
  if(hasMark)out.push('照片中出现特殊标记候选，必须先按具体位置解释；若位于眼尾夫妻位、鼻部或口周，才分别关联感情、现实承担或表达，不能把所有痣和疤套成同一句话。');
  if(!hasNose&&!hasMouth&&!hasMark)out.push(hasFace?'当前清晰度下没有出现足以单独下结论的鼻口偏斜或特殊标记，回答应以实际看清的整体结构为主，不能凭空补出痣、胎记或疤痕。':'当前手掌照片没有检出边界足够明确的特殊标记，回答只能使用实际看清的掌色、纹理与轮廓，不能凭空补出痣、胎记或疤痕。');
  return out;
}
function originalsFor(features,results,topic){
  var a=[],hasFace=results.some(function(x){return /脸$/.test(x.label)||x.label==='正脸';}),hasHand=results.some(function(x){return /掌$/.test(x.label);});
  if(hasFace){a.push(FACE_ORIGINAL.whole);if(features.some(function(x){return /鼻部：/.test(x)&&!/未见明显/.test(x);}))a.push(FACE_ORIGINAL.nose);if(features.some(function(x){return /口部/.test(x)&&!/未见明显/.test(x);}))a.push(FACE_ORIGINAL.mouth);if(features.some(function(x){return /疑似痣|疑似线状/.test(x);}))a.push(FACE_ORIGINAL.mark);}
  if(hasHand){a.push(HAND_ORIGINAL.whole);if(topic==='感情')a.push(HAND_ORIGINAL.relation);if(topic==='事业'||topic==='财运')a.push(HAND_ORIGINAL.career);if(features.some(function(x){return /疑似痣|疑似线状/.test(x);}))a.push(HAND_ORIGINAL.mark);}
  return a;
}
function renderPhysio(question,topic,results,original){
  var features=[];results.forEach(function(r){if(r.ok)r.features.forEach(function(x){features.push((results.length>1?r.label+'｜':'')+x);});});
  var analysis=featureRelevance(topic,features),html='<span class="tag">逐项识别 · 只围绕所问</span>';
  html+='<h3 class="pa-title">一、你问的事情</h3><div class="pa-p">'+esc(question)+'</div>';
  html+='<h3 class="pa-title">二、照片中实际看到的个人特征</h3>'+features.map(function(x){return '<div class="pa-bullet">• '+esc(x)+'</div>';}).join('');
  html+='<h3 class="pa-title">三、这些特征怎样对应你的问题</h3>'+analysis.map(function(x){return '<div class="pa-p">'+esc(x)+'</div>';}).join('');
  html+='<h3 class="pa-title">四、对应原文</h3>'+original.map(function(x){return '<div class="pa-quote">'+esc(x)+'</div>';}).join('');
  var focus=analysis.slice(1).join('')||analysis[0];
  html+='<h3 class="pa-title">五、综合回答</h3><div class="pa-p">这次结论只建立在上面明确列出的可见特征上。最需要抓住的是：'+esc(focus)+'照片角度、镜像和光线会改变左右判断；凡写有“疑似”或“需复核”的特征，都不能当成已经确认。</div>';
  return html;
}
async function handlePhysio(input){
  var question=String(input.question||'').trim(),mode=input.mode||'hand',images=input.images||{},box=document.querySelector('#questionAnswer');
  if(!box)return;
  if(!question){box.innerHTML='<span class="tag">问题未写清</span><h3>请先写一个具体问题</h3><p>一次只问一件事。照片特征会围绕这件事解释。</p>';box.classList.add('show');return;}
  var selected=[];
  if(mode!=='face'){if(images.left)selected.push(['hand',images.left,'左掌']);if(images.right)selected.push(['hand',images.right,'右掌']);}
  if(mode!=='hand'){if(images.face)selected.push(['face',images.face,'正脸']);if(images.faceLeft)selected.push(['face',images.faceLeft,'左侧脸']);if(images.faceRight)selected.push(['face',images.faceRight,'右侧脸']);}
  if(!selected.length){box.innerHTML='<span class="tag">缺少照片</span><h3>请先上传清晰照片</h3><p>面相至少需要一张正脸；要判断左右方向，正脸必须平视、无遮挡、关闭美颜。</p>';box.classList.add('show');return;}
  if(window.XingxuBilling&&!window.XingxuBilling.authorizeQuestion({channel:'手相面相',question:question}))return;
  box.innerHTML='<div class="answer-wait"><span>·</span><span>·</span><span>·</span></div><p>正在逐项定位五官、左右差异与特殊标记…</p>';box.classList.add('show');
  try{
    var results=[];
    for(var i=0;i<selected.length;i++){
      var x=selected[i];results.push(x[0]==='face'?await analyzeFace(x[1],x[2]):analyzeHand(x[1],x[2]));
    }
    var good=results.filter(function(x){return x.ok;});
    if(!good.length)throw new Error(results.map(function(x){return x.label+'：'+x.error;}).join('；'));
    var all=[];good.forEach(function(r){all=all.concat(r.features);});
    var askedTopic=topicOf(question);box.innerHTML=renderPhysio(question,askedTopic,good,originalsFor(all,good,askedTopic));
    box.classList.add('source-personal');document.querySelector('#scanResult')?.classList.remove('show');box.scrollIntoView({behavior:'smooth',block:'start'});
  }catch(err){
    box.innerHTML='<span class="tag">识别没有完成</span><h3>请检查照片后重试</h3><p>'+esc(err&&err.message||'五官定位模型暂时无法加载')+'。不要用旧的泛化结果代替照片识别。</p>';
  }
}

function domainKey(t){return({career:'career',workpeople:'career',wealth:'wealth',relation:'relation',timing:'timing',parent:'family',sibling:'family',children:'family',family:'family',friendship:'friendship',cooperation:'friendship',health:'health',self:'self',study:'study'})[t]||'self';}
function palaceFor(c,d){var n=({career:'官禄',wealth:'财帛',relation:'夫妻',timing:'迁移',family:'田宅',friendship:'交友',health:'疾厄',self:'命宫',study:'命宫'})[d]||'命宫';return(c&&c.palaces||[]).find(function(x){return x.name===n;})||(c&&c.palaces||[]).find(function(x){return x.active;});}
function relatedPalaces(c,d){var ns=({career:['官禄','财帛','迁移'],wealth:['财帛','官禄','田宅'],relation:['夫妻','命宫','福德'],family:['田宅','父母','兄弟'],friendship:['交友','兄弟','福德'],health:['疾厄','命宫','福德'],study:['命宫','官禄','福德'],timing:['迁移','命宫','福德'],self:['命宫','福德','官禄']})[d]||['命宫','福德','官禄'];return ns.map(function(n){return(c&&c.palaces||[]).find(function(x){return x.name===n;});}).filter(Boolean);}
function signalText(text){var a=[];if(/化禄|禄存/.test(text))a.push('资源与现实承接');if(/化权/.test(text))a.push('推动力、控制与责任');if(/化科/.test(text))a.push('沟通、规则与名誉');if(/化忌/.test(text))a.push('执念、误解或反复');if(/擎羊|陀罗|火星|铃星|地空|地劫/.test(text))a.push('冲突与损耗');return a.length?a.join('、'):'没有单一强信号，须由多宫合看';}
function destinyReport(s){
  var p=activeProfile(),c=p&&p.chart||{},t=typeof detectTopic==='function'?detectTopic(s.question):'self',d=domainKey(t),out=['一、你问的事情',s.question,'','二、这位命主与问题直接相关的个人盘面'];
  if(s.mode==='ziwei'){
    var ps=relatedPalaces(c,d),main=palaceFor(c,d),all=ps.map(function(x){return x.name+x.branch+'宫：'+x.stars+'，'+x.transform;});
    out.push.apply(out,all.map(function(x){return '• '+x;}));out.push('');out.push('三、围绕问题逐项判断');
    out.push('主宫取'+(main?main.name:'命宫')+'，不是把全盘所有内容都搬进来。'+(main?'这里见'+main.stars+'、'+main.transform+'，首先落在'+signalText(main.stars+' '+main.transform)+'。':''));
    if(ps[1])out.push(ps[1].name+'用来核对事情为什么形成；其'+ps[1].stars+'、'+ps[1].transform+'说明'+signalText(ps[1].stars+' '+ps[1].transform)+'也参与其中。');
    if(ps[2])out.push(ps[2].name+'用来核对最后怎样落到现实；其'+ps[2].stars+'、'+ps[2].transform+'使'+signalText(ps[2].stars+' '+ps[2].transform)+'成为结果能否稳定的关键。');
  }else if(s.mode==='sizhu'){
    var ps4=c.pillars||[],p4=ps4.map(function(x){return gan[x[0]]+zhi[x[1]];}).join('、'),day=ps4[2]?gan[ps4[2][0]]:'—',mb=ps4[1]?zhi[ps4[1][1]]:'—',stem=typeof hiddenStems!=='undefined'&&ps4[1]?hiddenStems[ps4[1][1]][0]:null,god=stem!=null&&ps4[2]?tenGod(ps4[2][0],stem):'—';
    out.push('• 四柱：'+p4,'• 日主：'+day,'• 月令：'+mb+'，本气对应'+god,'','三、围绕问题逐项判断','这次以月令本气和日主关系为第一层，再把“'+s.question+'”落到'+topicOf(s.question)+'。'+god+'的作用不是一句吉凶，而是看它在此事中有没有得到生扶、制化和现实承接。');
  }else{
    var q=c.qimen||{};out.push('• 局势：阳遁'+(q.bureau||'—')+'局','• 值门：'+(q.gate||'—'),'• 值星：'+(q.star||'—'),'','三、围绕问题逐项判断','门先定这件事的性质，星再看环境表现；此问只围绕'+topicOf(s.question)+'，不把出生终身局冒充即时问事盘，也不凭空编具体日期。');
  }
  out.push('','四、对应原文');
  var original=window.XingxuSourceText&&typeof window.XingxuSourceText.select==='function'?window.XingxuSourceText.select(s):'';out.push(original,'','五、综合回答');
  out.push('这次回答的落点是：先看上面列出的个人盘面是否与现实中的行为、资源和责任相互印证。盘面有助力而现实没有行动，不能直接算成；盘面有冲突而当事人已经把边界、责任和沟通处理清楚，也不能只凭一颗星下绝对结论。'+(/什么时候|何时|哪年|哪月|婚期/.test(s.question)?'你问到时间，必须有对应的大运、流年、流月或即时起局资料；当前资料不足时不编日期。':''));
  return out.join('\n');
}
function installDestiny(){
  if(typeof showSession!=='function')return;
  showSession=function(session){
    answerRevealRun++;hero.style.display='none';inlineChart.style.display='none';chatComposer.style.display='none';conversation.classList.add('show');question.textContent=session.question;answerTitle.textContent='';action.innerHTML=lines(destinyReport(session));
    document.querySelectorAll('.decision-grid,.evidence,.reasoning-section,.trace,.action-section h4').forEach(function(el){el.style.display='none';});
    document.querySelector('.action-section')?.classList.add('is-visible','source-only','source-personal');document.querySelector('#answerWait').hidden=true;document.querySelector('.answer').hidden=false;pageTitle.childNodes[0].nodeValue='推演结果 ';document.querySelector('#newQuestion').hidden=false;send.disabled=false;requestAnimationFrame(function(){chatScroll.scrollTop=0;});
  };
}
var style=document.createElement('style');
style.textContent='.source-personal .pa-title,.question-answer .pa-title{display:table!important;margin:22px 0 10px!important;font:700 17px/1.6 var(--serif)!important;color:inherit!important;border-bottom:4px solid #bcecf0}.pa-p{margin:7px 0;line-height:2;white-space:pre-line}.pa-bullet{margin:8px 0;padding-left:12px;line-height:1.95}.pa-quote{margin:10px 0;padding:14px 16px;border-left:3px solid #7dbfc3;background:#eef8f7;line-height:2;white-space:pre-line}.pa-gap{height:5px}.question-answer.source-personal>.tag{display:inline-block!important}.question-answer.source-personal>h3{display:table!important}@media(max-width:680px){.source-personal .pa-title,.question-answer .pa-title{font-size:16px}.pa-p,.pa-bullet,.pa-quote{line-height:1.9}}';
document.head.appendChild(style);installDestiny();
window.XingxuPersonalAnalysis={version:'5.0',handlePhysio:handlePhysio,analyzeFace:analyzeFace,destinyReport:destinyReport};
})();
