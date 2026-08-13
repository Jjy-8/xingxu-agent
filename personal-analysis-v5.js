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
  var side=x<.46?'照片左侧':x>.54?'照片右侧':'面部中央';
  var band=markZone(x,y).name;
  return side+band;
}
function markZone(x,y){
  var dx=Math.abs(x-.5);
  if(y<.26)return{key:'forehead',name:'额部'};
  if(y<.43)return dx>.30?{key:'temple',name:'眼尾至发际间'}:dx<.09?{key:'glabella',name:'两眉之间'}:{key:'brow',name:'眉眼部'};
  if(y<.56)return dx<.12?{key:'nose',name:'鼻部'}:dx>.31?{key:'temple',name:'眼尾至发际间'}:{key:'underEye',name:'眼下泪堂'};
  if(y<.73)return dx<.16?{key:'mouth',name:'人中或口周'}:{key:'cheek',name:'面颊'};
  return dx<.24?{key:'chin',name:'下巴'}:{key:'lowerCheek',name:'下颊'};
}
function visibleBand(x,y){return markZone(x,y).name;}
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
  var cx=(minX+maxX)/2,cy=(minY+maxY)/2,rx=(maxX-minX)*.46,ry=(maxY-minY)*.50,mask=new Uint8Array(w*h),strengthMap=new Float32Array(w*h),edgeSum=0,edgeCount=0;
  function excluded(nx,ny){
    return (ny>.28&&ny<.48&&Math.abs(nx-.5)>.10)||(ny>.56&&ny<.73&&Math.abs(nx-.5)<.27)||(ny>.37&&ny<.59&&Math.abs(nx-.5)<.10);
  }
  for(var y=minY;y<=maxY;y++)for(var x=minX;x<=maxX;x++){
    var nx=(x-minX)/(maxX-minX),ny=(y-minY)/(maxY-minY);
    if((((x-cx)/rx)**2+((y-cy)/ry)**2)>1||excluded(nx,ny))continue;
    var i=(y*w+x)*4,R=d[i],G=d[i+1],B=d[i+2],lum=.299*R+.587*G+.114*B,base=.299*bg[i]+.587*bg[i+1]+.114*bg[i+2];
    var dark=base-lum,red=R-(G+B)/2;
    if(x>minX&&y>minY){edgeSum+=Math.abs(lum-(.299*d[i-4]+.587*d[i-3]+.114*d[i-2]))+Math.abs(lum-(.299*d[i-w*4]+.587*d[i-w*4+1]+.114*d[i-w*4+2]));edgeCount+=2;}
    if((dark>31&&lum>22)||(red>34&&dark>10)){mask[y*w+x]=1;strengthMap[y*w+x]=Math.max(dark,red);}
  }
  var facePixels=(Math.max.apply(null,lm.map(function(p){return p.x;}))-Math.min.apply(null,lm.map(function(p){return p.x;})))*img.naturalWidth;
  var clarity=Math.min(1,facePixels/360)*.58+Math.min(1,(edgeSum/Math.max(1,edgeCount))/24)*.42;
  var seen=new Uint8Array(w*h),out=[];
  for(var y=minY;y<=maxY;y++)for(var x=minX;x<=maxX;x++){
    var id=y*w+x;if(!mask[id]||seen[id])continue;
    var q=[id],n=0,sx=0,sy=0,scoreSum=0,loX=x,hiX=x,loY=y,hiY=y;seen[id]=1;
    while(q.length){var k=q.pop(),yy=Math.floor(k/w),xx=k-yy*w;n++;sx+=xx;sy+=yy;scoreSum+=strengthMap[k];loX=Math.min(loX,xx);hiX=Math.max(hiX,xx);loY=Math.min(loY,yy);hiY=Math.max(hiY,yy);
      for(var oy=-1;oy<=1;oy++)for(var ox=-1;ox<=1;ox++){var X=xx+ox,Y=yy+oy,j=Y*w+X;if(X>=0&&X<w&&Y>=0&&Y<h&&mask[j]&&!seen[j]){seen[j]=1;q.push(j);}}
    }
    if(n>=4&&n<=115){var bw=hiX-loX+1,bh=hiY-loY+1,aspect=Math.max(bw,bh)/Math.max(1,Math.min(bw,bh)),mean=scoreSum/n,shape=aspect<=2.4?.16:aspect>3&&n>10?.09:0,confidence=Math.min(1,Math.max(0,(mean-27)/35)*.62+Math.min(1,n/13)*.22+shape),nx=(sx/n-minX)/(maxX-minX),ny=(sy/n-minY)/(maxY-minY);if(markZone(nx,ny).key!=='brow')out.push({n:n,x:nx,y:ny,aspect:aspect,confidence:confidence,clarity:clarity});}
  }
  return out.sort(function(a,b){return b.confidence-a.confidence;}).slice(0,4).map(function(c){
    c.kind=c.aspect>3&&c.n>10?'line':'spot';c.zone=markZone(c.x,c.y);c.band=c.zone.name;c.clear=c.clarity>=.66&&c.confidence>=.68;
    c.type=c.kind==='line'?'线状疤痕或褶痕':'痣、色斑或胎记色点';
    c.text=(c.clear?'清楚可见的':'疑似')+c.type+'：'+visibleName(c.x,c.y)+(c.clear?'（本张照片边界较清楚）':'（需结合其他角度或放大原图复核）');
    return c;
  });
}
function fuseFaceMarks(results){
  var observations=[];
  results.filter(function(r){return r.ok&&/脸$/.test(r.label);}).forEach(function(r){(r.marks||[]).forEach(function(m){observations.push({label:r.label,mark:m});});});
  var groups=[];
  observations.forEach(function(o){
    var g=groups.find(function(x){
      if(x.kind!==o.mark.kind||Math.abs(x.y-o.mark.y)>.085)return false;
      var prior=x.items[0],bothProfiles=prior.label!=='正脸'&&o.label!=='正脸';
      if(bothProfiles&&prior.label!==o.label)return false;
      return prior.label==='正脸'||o.label==='正脸'||Math.abs(prior.mark.x-o.mark.x)<.16;
    });
    if(!g){g={kind:o.mark.kind,y:o.mark.y,items:[]};groups.push(g);}g.items.push(o);g.y=g.items.reduce(function(s,z){return s+z.mark.y;},0)/g.items.length;
  });
  return groups.map(function(g){
    var best=g.items.slice().sort(function(a,b){return Number(b.label==='正脸')-Number(a.label==='正脸')||(b.mark.clear-a.mark.clear)||(b.mark.confidence-a.mark.confidence);})[0],labels=Array.from(new Set(g.items.map(function(x){return x.label;}))),clear=g.items.some(function(x){return x.mark.clear;}),repeated=labels.length>=2;
    var noun=g.kind==='line'?'疤痕':'痣或胎记',where=best.label==='正脸'?visibleName(best.mark.x,best.mark.y):best.mark.band,base={kind:g.kind,zone:(best.mark.zone||markZone(best.mark.x,best.mark.y)).key,where:where,x:best.mark.x,y:best.mark.y,pointable:best.label==='正脸',labels:labels};
    if(clear)return Object.assign(base,{confirmed:true,text:where+'有'+noun+'。'});
    if(repeated)return Object.assign(base,{confirmed:true,text:best.mark.band+'有'+noun+'。'});
    return Object.assign(base,{confirmed:false,text:where+'似有'+noun+'。'});
  }).sort(function(a,b){return Number(b.confirmed)-Number(a.confirmed);});
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
  features.push('鼻部：'+level(Math.abs(noseDev),.018,.038)+(Math.abs(noseDev)>=.018?'，鼻尖相对面中线'+sideText(noseDev):'偏斜'));
  if(Math.abs(mouthSlope)>=.035)features.push('口部：'+level(Math.abs(mouthSlope),.035,.075)+'歪斜，'+(mouthSlope>0?'画面左侧嘴角较高、右侧较低':'画面右侧嘴角较高、左侧较低'));
  else features.push('口部：未见明显嘴角高低差');
  if(Math.abs(mouthDev)>=.02)features.push('口部位置：口部中心相对面中线'+sideText(mouthDev)+'偏');
  if(Math.abs(browDiff)>=.025)features.push('眉部：'+(browDiff>0?'画面左眉较高、右眉较低':'画面右眉较高、左眉较低'));
  if(Math.abs(eyeDiff)>=.02)features.push('眼部：两眼水平位置可见轻微高低差');
  var marks=markCandidates(img,lm);features=features.concat(marks.length?marks.map(function(x){return x.text;}):['特殊标记：当前清晰度下未检出足够明确的痣、胎记或疤痕候选']);
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
  whole:'面相，不仅指的是五官、三停、十二宫，当然它们很重要，但是并不是全部。一个人的精神面貌也是面相中必不可少的部分。古语中早就有“看相先看神”的说法。'
};
var FACE_MARK_ORIGINAL={
  forehead:'额头是面相中最上方的部位，主要反映一个人的社会地位和官运。',
  temple:'左右眼睛后方到发际间的两个小区域，也称为夫妻宫。这个部位反映了一个人的婚姻状况。如果这个区域有伤，或者有灰黑的痣，不是感情的路不平顺，就是感情走上三岔路。',
  glabella:'两眉之间有痣而且痣颜色为红色的人官运亨通。',
  brow:'眉为君、眼为臣、眉为一面之表，目为一身之精。',
  underEye:'两眼下泪堂部位生有黑痣的人，家中必定有出家念佛诵经的和尚道士。',
  nose:'鼻子上有横纹，会有危险的事。',
  mouth:'人中或口周有痣的人会搬弄是非，多嘴长舌。',
  cheek:'面颊有痣的人具有一定领导力和破坏力。',
  lowerCheek:'下颊有痣的人会得到意想不到的财富。',
  chin:'下巴有痣的人，应多留心与下属仆从之间的关系。'
};
var MALE_MOLE_POINTS=[
  [1,.50,.14,'痣的位置在①的人如痣的颜色红为吉相。'],[2,.60,.10,'痣的位置在②的人性情暴躁。'],[3,.39,.10,'痣的位置在③的人对父亲运势不利。'],[4,.66,.10,'痣的位置在④的人有较强的权利欲，喜欢做官，会往上爬。'],[5,.33,.10,'痣的位置在⑤的人多为工作狂。'],[6,.72,.10,'痣的位置在⑥的人为大富之相，气色好更佳。'],[7,.27,.10,'痣的位置在⑦且色红的人为大吉之相。'],[8,.78,.10,'痣的位置在⑧的人终年在外奔波羁旅。'],[9,.20,.10,'痣的位置在⑨的人，如痣为红色，有财运，经营好的话财源滚滚。'],[10,.84,.10,'痣的位置在⑩的人不宜登山爬高，也不宜从事带冒险的活动，谨防有性命危险。'],[11,.14,.10,'痣的位置在⑪的人属坏相，为人性情多孤僻狭隘。'],[12,.08,.12,'痣的位置在⑫的人如果痣的色泽很好，就会财运亨通，为大富之相。'],
  [13,.50,.34,'痣的位置在⑬而且痣颜色为红色的人官运亨通。'],[14,.43,.34,'痣的位置在⑭的人大手大脚，为散财之相。'],[15,.59,.30,'痣的位置在⑮而且痣颜色为红色的人可以为官。'],[16,.40,.28,'痣的位置在⑯的人生性残忍、凶狠。'],[17,.64,.29,'痣的位置在⑰的人为大吉之相。'],[18,.35,.30,'痣的位置在⑱的人低调，是富有之相。'],[19,.70,.29,'痣的位置在⑲的人凶恶。'],[20,.29,.30,'痣的位置在⑳的人易遭厄运，为不吉之痣。'],[21,.80,.32,'痣的位置在㉑的人，为人情绪化，这是凶痣。'],[22,.23,.30,'痣的位置在㉒的人，有官运。'],[23,.17,.30,'痣的位置在㉓㉖的人凶恶。'],[24,.10,.32,'痣的位置在㉔的人运势起伏大。'],
  [25,.59,.50,'痣的位置在㉕的人凶狠。'],[26,.41,.50,'痣的位置在㉓㉖的人凶恶。'],[27,.65,.50,'痣的位置在㉗的人兄弟运势不佳。'],[28,.36,.50,'痣的位置在㉘的人父亲运势不佳。'],[29,.30,.50,'痣的位置在㉙的人女儿运势不佳。'],[30,.72,.50,'痣的位置在㉚的人妻子运势不佳。'],[31,.78,.50,'痣的位置在㉛的人在后代中多男少女。'],[32,.22,.50,'痣的位置在㉜的人儿子运势不佳。'],[33,.85,.50,'痣的位置在㉝㊺㊼的人是吉利之相。'],[34,.15,.50,'痣的位置在㉞的人具有一定领导力和破坏力。'],
  [35,.17,.70,'痣的位置在㉟㊱的人游泳、乘船时要格外注意自身安全。'],[36,.24,.70,'痣的位置在㉟㊱的人游泳、乘船时要格外注意自身安全。'],[37,.31,.70,'痣的位置在㊲的人为少财之相。'],[38,.47,.84,'痣的位置在㊳的人多是有口福的人，一生有酒食。'],[39,.40,.84,'痣的位置在㊴的人是吃喝不愁之相。'],[40,.52,.84,'痣的位置在㊵的人少田宅。'],[41,.58,.84,'痣的位置在㊶的人一生贫困，为饿死之相。'],[42,.64,.84,'痣的位置在㊷的人，应多留心与下属仆从之间的关系。'],[43,.70,.84,'痣的位置在㊸的人会搬弄是非，多嘴长舌。'],[44,.80,.76,'痣的位置在㊹㊻的人会得到意想不到的财富。'],[45,.03,.26,'痣的位置在㉝㊺㊼的人是吉利之相。'],[46,.94,.63,'痣的位置在㊹㊻的人会得到意想不到的财富。'],[47,.63,.95,'痣的位置在㉝㊺㊼的人是吉利之相。'],[48,.38,.95,'痣的位置在㊽的人为显贵之相，多有较高地位。'],[49,.95,.26,'痣的位置在㊾的人为大富之相，多有钱财。'],[50,.06,.63,'痣的位置在㊿的人，能孝顺父母，尊敬长辈。']
];
var FEMALE_MOLE_POINTS=[
  [1,.25,.09,'痣的位置在①的女性是大贵之相，多能因夫显贵。'],[2,.33,.09,'痣的位置在②的女性一生中婚姻多变，结婚数次。'],[3,.41,.09,'痣的位置在③的女性会影响父母运势。'],[4,.48,.09,'痣的位置在④的女性多为勤俭持家之人。'],[5,.60,.09,'痣的位置在⑤的女性个人婚姻运势多不顺。'],[6,.64,.20,'痣的位置在⑥的女性遇事多牵连亲人。'],[7,.66,.09,'痣的位置在⑦的女性，父亲、丈夫的运势不佳。'],[8,.73,.09,'痣的位置在⑧的女性，一旦嫁到外地就会变得多愁善感。'],[9,.80,.09,'痣的位置在⑨的女性会让爱人运势不佳。'],[10,.86,.09,'痣的位置在⑩的女性与孩子的缘分浅。'],
  [11,.50,.28,'痣的位置在⑪的女性，个人财运不旺。'],[12,.10,.32,'痣的位置在⑫的女性是吉利之相。'],[13,.22,.32,'痣的位置在⑬的女性，常要忍受分离之苦。'],[14,.29,.32,'痣的位置在⑭的女性对丈夫事业有好的帮助。'],[15,.36,.32,'痣的位置在⑮的女性有违法的可能。'],[16,.60,.33,'痣的位置在⑯的女性适合从事纺织业。'],[17,.65,.32,'痣的位置在⑰的女性，多为“孟母”式人物，对培养和教育后代很有办法。'],[18,.71,.32,'痣的位置在⑱的女性为贵夫之相。'],[19,.78,.32,'痣的位置在⑲的女性对丈夫的事业各方面都起不了好作用。'],[20,.85,.32,'痣的位置在⑳的女性为长命之相。'],
  [21,.50,.49,'痣的位置在㉑的女性，居家在外时要谨防火灾。'],[22,.60,.52,'痣的位置在㉒的女性多为自私自利之人。'],[23,.43,.53,'痣的位置在㉓的女性是多女少男之相。'],[24,.67,.52,'痣的位置在㉔的女性多为儿子操心。'],[25,.81,.52,'痣的位置在㉕的女性多与人暧昧，感情上优柔寡断。'],[26,.74,.52,'痣的位置在㉖的女性多因丈夫而伤心。'],[27,.29,.52,'痣的位置在㉗的女性多为吉利百顺之人。'],[28,.35,.52,'痣的位置在㉘的女性活泼开朗。'],[29,.20,.52,'痣的位置在㉙的女性多有不良嗜好。'],[30,.43,.48,'痣的位置在㉚的女性，虽然时常碰上倒霉事但多能逢凶化吉。'],[31,.24,.70,'痣的位置在㉛的女性心眼小。'],[32,.33,.70,'痣的位置在㉜的女性善妒。'],[33,.42,.69,'痣的位置在㉝的女性易遭水厄。'],[34,.50,.73,'痣的位置在㉞的女性多为生双胞胎之相。'],[35,.59,.69,'痣的位置在㉟的女性六亲疏远。'],[36,.66,.69,'痣的位置在㊱的女性喜欢搬弄是非。'],[37,.86,.67,'痣的位置在㊲的女性疼爱并尊重丈夫，多为贤妻良母的类型。'],[38,.74,.69,'痣的位置在㊳的女性会对丈夫的事业运势产生不良影响。'],[39,.08,.55,'痣的位置在㊴的女性头脑非常聪明。'],[40,.18,.78,'痣的位置在㊵的女性为水厄之相。'],[41,.25,.78,'痣的位置在㊶的女性一生平淡。'],[42,.50,.85,'痣的位置在㊷的女性不善理家，少田宅。','下唇正下方的颏唇沟中央'],[43,.73,.84,'痣的位置在㊸的女性会以貌取人。'],[44,.28,.96,'痣的位置在㊹的女性多为大贵之相。'],[45,.50,1.04,'痣的位置在㊺的女性多对丈夫不好。'],[46,.70,.96,'痣的位置在㊻的女性不懂善待自己。']
];
function confirmedMarks(crossMarks,manualMarks){return crossMarks.filter(function(x,i){return x.confirmed||(manualMarks&&manualMarks[i]==='yes');});}
function nearestMolePoint(x,gender){
  var points=gender==='女'?FEMALE_MOLE_POINTS:gender==='男'?MALE_MOLE_POINTS:null;if(!points||!x.pointable)return null;
  if(x.x<.46||x.x>.54){
    if(x.zone==='temple'||x.zone==='cheek'||x.zone==='lowerCheek')return null;
    x=Object.assign({},x,{x:1-x.x});
  }
  return points.reduce(function(best,p){var score=Math.pow((x.x==null?.5:x.x)-p[1],2)+1.25*Math.pow((x.y==null?.5:x.y)-p[2],2);return !best||score<best.score?{id:p[0],text:p[3],place:p[4]||x.where,score:score}:best;},null);
}
function pointOriginalWithoutNumber(point){
  var place=point.place||'面部该处',rest=point.text.replace(/^痣的位置在[\p{No}]+/u,'');
  if(rest.indexOf('的女性')===0)return place+'有痣的女性'+rest.slice(3);
  if(rest.indexOf('的人')===0)return place+'有痣的人'+rest.slice(2);
  return place+'有痣'+rest;
}
function markOriginal(x,gender){
  if(x.kind==='line')return '五官如有破损是不吉利的。';
  var point=nearestMolePoint(x,gender);if(point)return pointOriginalWithoutNumber(point);
  var zone=x.zone||'cheek';
  return FACE_MARK_ORIGINAL[zone]||FACE_MARK_ORIGINAL.cheek;
}
function markView(x,gender){
  var noun=x.kind==='line'?'疤痕':'痣或胎记',where=x.where||({forehead:'额部',temple:'眼尾至发际间',glabella:'两眉之间',brow:'眉眼部',underEye:'眼下泪堂',nose:'鼻部',mouth:'人中或口周',cheek:'面颊',lowerCheek:'下颊',chin:'下巴'}[x.zone]||'面部');
  return where+'确认有'+noun+'。按该位置对应的原文看：'+markOriginal(x,gender);
}
var HAND_ORIGINAL={
  whole:'相由心生，手相亦然，故相手可以推测心性也！夫，察人之心隆，观纹见掌，知掌地则知心地。掌平，心亦平。纹正，心亦正；纹横则性横。纹浅，机亦浅；纹深，机亦深。纹多，心绪多；纹少，机关少。',
  relation:'从手相看婚姻，一般都是先看婚姻线。婚姻线，顾名思义其代表的意义总离不开结婚、嫁娶之事。自然，要想详细地了解你的婚姻信息，除此线外尚需参考其他部分，绝不可因婚姻线不好，就一口断定结婚运欠佳。',
  career:'论掌纹曰：“人纹象人贤愚，主人贫富。”盖人纹以象人智慧之贤愚，以喻聪明智慧之赚聚生财故也。',
  mark:'掌中足底生黑痣者，贵而益夫。'
};
function featureRelevance(topic,features,marks,gender){
  var hasFace=features.some(function(x){return /鼻部：|口部：|眉部：|眼部：/.test(x);});
  var hasNose=features.some(function(x){return /鼻部：/.test(x)&&!/未见明显/.test(x);});
  var hasMouth=features.some(function(x){return /口部/.test(x)&&!/未见明显/.test(x);});
  var hasMark=marks.length>0;
  var lead=topic==='感情'?'这次要把沟通方式、现实责任与关系稳定性放在一起看':topic==='事业'?'这次重点看表达执行、对外协作与承担责任的方式':topic==='财运'?'这次重点看取得资源、谈判表达与守住成果的方式':topic==='家庭'?'这次重点看家庭沟通、责任边界与长期相处':topic==='人际'?'这次重点看表达分寸、信任与合作边界':topic==='健康'?'外观特征不能诊断健康；只描述照片可见情况，有新生、变大、出血或不对称的痣疤应由医生检查':'这次从照片可见结构说明个人差异，不拿单一部位替代整体判断';
  var out=[lead+'。'];
  if(hasMouth)out.push('口部高低或偏斜与所问最直接对应的是表达方式：重要话题容易因语气、先后顺序或失言产生误解。');
  if(hasNose)out.push('鼻部偏离面中线是这张脸的个人特征之一；在传统取象里鼻部常与做事、财帛及现实承担相连，因此围绕所问应核对实际行动和责任，不能只凭口头态度下结论。');
  marks.forEach(function(x){out.push(markView(x,gender));});
  return out;
}
function originalsFor(features,results,topic,marks,gender){
  var a=[],hasFace=results.some(function(x){return /脸$/.test(x.label)||x.label==='正脸';}),hasHand=results.some(function(x){return /掌$/.test(x.label);});
  if(hasFace){a.push(FACE_ORIGINAL.whole);if(features.some(function(x){return /鼻部：/.test(x)&&!/未见明显/.test(x);}))a.push(FACE_ORIGINAL.nose);if(features.some(function(x){return /口部/.test(x)&&!/未见明显/.test(x);}))a.push(FACE_ORIGINAL.mouth);marks.forEach(function(x){a.push(markOriginal(x,gender));});}
  if(hasHand){a.push(HAND_ORIGINAL.whole);if(topic==='感情')a.push(HAND_ORIGINAL.relation);if(topic==='事业'||topic==='财运')a.push(HAND_ORIGINAL.career);if(features.some(function(x){return /疑似痣|疑似线状/.test(x);}))a.push(HAND_ORIGINAL.mark);}
  return a.filter(function(x,i){return x&&a.indexOf(x)===i;});
}
function physioFeatures(results,crossMarks,manualMarks){
  var features=[];
  results.forEach(function(r){if(r.ok)r.features.forEach(function(x){
    if(/脸$/.test(r.label)&&/特殊标记：|痣、色斑|胎记|疤痕|褶痕/.test(x))return;
    features.push((results.length>1?r.label+'｜':'')+x);
  });});
  var faces=results.filter(function(r){return r.ok&&/脸$/.test(r.label);});
  if(faces.length){
    crossMarks.forEach(function(x,i){
      if(x.confirmed)features.push(x.text);
      else if(manualMarks&&manualMarks[i]==='yes')features.push((x.where||'该位置')+'有'+(x.kind==='line'?'疤痕':'痣或胎记')+'。');
      else if(!(manualMarks&&manualMarks[i]==='no'))features.push(x.text);
    });
  }
  return features;
}
function renderPhysio(question,topic,results,crossMarks,manualMarks,gender){
  var features=physioFeatures(results,crossMarks,manualMarks),marks=confirmedMarks(crossMarks,manualMarks);
  var analysis=featureRelevance(topic,features,marks,gender),original=originalsFor(features,results,topic,marks,gender),html='<span class="tag">逐项识别 · 多图交叉核对</span>';
  html+='<h3 class="pa-title">一、你问的事情</h3><div class="pa-p">'+esc(question)+'</div>';
  html+='<h3 class="pa-title">二、照片中实际看到的个人特征</h3>'+features.map(function(x){return '<div class="pa-bullet">• '+esc(x)+'</div>';}).join('');
  crossMarks.forEach(function(x,i){if(!x.confirmed&&!(manualMarks&&manualMarks[i]))html+='<div class="pa-confirm" data-mark-index="'+i+'"><b>请本人确认</b><p>'+esc(x.text)+'实际是否有？请输入“有”或“无”。</p><div><input class="pa-confirm-input" inputmode="text" placeholder="请输入：有 或 无"><button type="button" class="pa-confirm-submit">确认</button></div><small class="pa-confirm-error" aria-live="polite"></small></div>';});
  html+='<h3 class="pa-title">三、这些特征怎样对应你的问题</h3>'+analysis.map(function(x){return '<div class="pa-p">'+esc(x)+'</div>';}).join('');
  html+='<h3 class="pa-title">四、对应原文</h3>'+original.map(function(x){return '<div class="pa-quote">'+esc(x)+'</div>';}).join('');
  var focus=analysis.slice(1).join('')||analysis[0];
  html+='<h3 class="pa-title">五、综合回答</h3><div class="pa-p">'+esc(focus)+'</div>';
  return html;
}
function bindMarkConfirmation(box,question,topic,results,crossMarks,manualMarks,gender){
  manualMarks=manualMarks||{};box.querySelectorAll('.pa-confirm').forEach(function(panel){var input=panel.querySelector('.pa-confirm-input'),button=panel.querySelector('.pa-confirm-submit'),error=panel.querySelector('.pa-confirm-error'),index=Number(panel.getAttribute('data-mark-index'));
    function submit(){var v=String(input.value||'').trim();var yes=/^(有|是|确实有|有的)$/.test(v),no=/^(无|没有|否|确实没有|没有的)$/.test(v);if(!yes&&!no){error.textContent='请只输入“有”或“无”。';input.focus();return;}manualMarks[index]=yes?'yes':'no';box.innerHTML=renderPhysio(question,topic,results,crossMarks,manualMarks,gender);bindMarkConfirmation(box,question,topic,results,crossMarks,manualMarks,gender);}
    button.addEventListener('click',submit);input.addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();submit();}});
  });
}
async function handlePhysio(input){
  var question=String(input.question||'').trim(),mode=input.mode||'hand',images=input.images||{},gender=input.gender||'',box=document.querySelector('#questionAnswer');
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
    var askedTopic=topicOf(question),crossMarks=fuseFaceMarks(good);box.innerHTML=renderPhysio(question,askedTopic,good,crossMarks,null,gender);bindMarkConfirmation(box,question,askedTopic,good,crossMarks,null,gender);
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
style.textContent='.source-personal .pa-title,.question-answer .pa-title{display:table!important;margin:22px 0 10px!important;font:700 17px/1.6 var(--serif)!important;color:inherit!important;border-bottom:4px solid #bcecf0}.pa-p{margin:7px 0;line-height:2;white-space:pre-line}.pa-bullet{margin:8px 0;padding-left:12px;line-height:1.95}.pa-quote{margin:10px 0;padding:14px 16px;border-left:3px solid #7dbfc3;background:#eef8f7;line-height:2;white-space:pre-line}.pa-confirm{margin:14px 0;padding:14px 16px;border:1px solid #dccb9e;border-radius:12px;background:#fff9e9}.pa-confirm b{font:700 14px/1.6 var(--serif)}.pa-confirm p{margin:6px 0 10px;line-height:1.8}.pa-confirm>div{display:flex;gap:8px}.pa-confirm-input{min-width:0;flex:1;border:1px solid #cfd8d2;border-radius:8px;padding:9px 10px;background:#fff}.pa-confirm-submit{border:0;border-radius:8px;padding:9px 16px;background:var(--green);color:#fff}.pa-confirm-error{display:block;min-height:18px;margin-top:6px;color:#a24640}.pa-gap{height:5px}.question-answer.source-personal>.tag{display:inline-block!important}.question-answer.source-personal>h3{display:table!important}@media(max-width:680px){.source-personal .pa-title,.question-answer .pa-title{font-size:16px}.pa-p,.pa-bullet,.pa-quote{line-height:1.9}}';
document.head.appendChild(style);installDestiny();
window.XingxuPersonalAnalysis={version:'5.2',handlePhysio:handlePhysio,analyzeFace:analyzeFace,destinyReport:destinyReport};
})();
