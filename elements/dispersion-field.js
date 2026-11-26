import{CloseOnSelect as fr,DsElement as Be,DsFormElement as mr,HostLayoutController as hr,LitElement as pr,PREFIX as dr,PopoverController as br,boxOf as xr,classMap as yr,createRef as gr,css as _r,define as ct,enter as wr,firstFocusable as Er,flagsOf as vr,html as Se,icon as Tr,iconMarkup as Mr,ifDefined as Ar,keyed as Lr,leave as Rr,literal as Sr,live as Dr,measure as Xr,menuRows as Or,missingMessage as Cr,move as Pr,noChange as Fr,nothing as ut,onMenuRows as Ur,place as Gr,popoverStyles as kr,ref as Ir,render as Br,repeat as Nr,runTransition as zr,styleMap as qr,svg as Vr,tag as Yr,tagName as $r,uid as jr,unsafeCSS as De,unsafeHTML as Zr,unsafeSVG as Kr,unsafeStatic as Qr,within as Jr}from"./shared.js";var Lt=.016666666666666666,Rt=6,Ne=2.6,St=1,Dt=.3,ze=30,qe=2400,ft=.45,Xt=24,Ot=112,Ct=6,Pt=qe,Ft=1170,Ut=160,mt=64,Gt=5.6,kt=.32,It=.3,Xe=96,ht=96,ye=(e,r,n)=>{let t=Math.min(1,Math.max(0,(n-e)/(r-e)));return t*t*(3-2*t)},pt=(e,r,n,t)=>t<e?ye(e-n,e,t):t>r?1-ye(r,r+n,t):1,Oe=.35,Bt=(e,r,n,t)=>{if(t<e)return Oe*ye(e-n,e,t);if(t>r)return Oe*(1-ye(r,r+n,t));let s=2*(t-e)/(r-e)-1;return Oe+(1-Oe)*(1-s*s)};function dt(e){let r=1,n=1,t=16,s=16,l=1,i=new Float32Array(1),d=new Float32Array(1),b=new Float32Array(1),_=new Uint8Array(4),p=Number.NaN,v=!0,E=new Float32Array(128),w=new Float32Array(128),g=new Float32Array(32),j=new Float32Array(32),P=new Int32Array(32),u=new Float32Array(32),le=new Float32Array(32),D=null,R=0,U=0,G=new Float32Array(0),H=new Float32Array(0),S=new Float32Array(0),F=new Float32Array(0),te=new Float32Array(0),ce=new Float32Array(0),he=new Float32Array(0),K=new Float32Array(32),pe=new Float32Array(32),re=new Float32Array(32),ne=new Float32Array(32),L=!0,W=()=>{i.fill(0),d.fill(0),b.fill(0),v=!0},$=()=>{G.fill(0),H.fill(0),S.fill(0),L=!0},ie=(o,X,N=null)=>{if(r=Math.max(1,Math.ceil(o/16)),n=Math.max(1,Math.ceil(X/16)),t=o/r,s=X/n,l=Math.max(1,Dt*o),i=new Float32Array(r*n),d=new Float32Array(r*n),b=new Float32Array(r*n),_=new Uint8Array(r*n*4),g=new Float32Array(32*r),j=new Float32Array(32*n),D=N,R=D?Math.min(r,Math.ceil(D.right/t)):0,U=D?Math.min(n,Math.ceil(D.bottom/s)):0,G=new Float32Array(R*U),H=new Float32Array(R*U),S=new Float32Array(R*U),F=new Float32Array(R),te=new Float32Array(U),ce=new Float32Array(R),he=new Float32Array(32*R),D){for(let T=0;T<R;T++){let z=(T+.5)*t;F[T]=1-ye(D.right-ht,D.right,z),ce[T]=Gt*(1+It*(.5-z/D.right))}for(let T=0;T<U;T++)te[T]=1-ye(D.bottom-ht,D.bottom,(T+.5)*s)}p=Number.NaN,W(),$()},de=(o,X)=>{if(!D||X===0&&L)return;let N=e.pace?.()??1,T=0;for(let q=0;q<X;q++){let Q=P[q],M=Math.abs(u[q])*N,C=w[Q*4],k=C+w[Q*4+2];if(!(C>D.right+mt)){for(let O=0;O<R;O++)he[T*R+O]=pt(C,k,mt,(O+.5)*t);K[T]=Ft*le[q]*(M/Pt)**1.5,pe[T]=le[q]*Math.min(1,M/qe),re[T]=w[Q*4+1],T+=1}}if(T===0&&L)return;let z=Math.exp(-o/ft),fe=!1;for(let q=0;q<U;q++){let Q=(q+.5)*s;for(let M=0;M<T;M++)ne[M]=(Q<re[M]?Math.exp((Q-re[M])/Ut):1)*te[q];for(let M=0;M<R;M++){let C=q*R+M,k=0,O=0;for(let V=0;V<T;V++){let Z=he[V*R+M]*ne[V]*F[M];k=Math.max(k,Z*K[V]),O=Math.max(O,Z*pe[V])}let ee=ce[M],B=H[C]-k*o;B+=(-ee*ee*G[C]-2*kt*ee*B)*o;let me=Math.max(-Xe,Math.min(Xe,G[C]+B*o));G[C]=me,H[C]=B,S[C]=Math.max(O,S[C]*z),!fe&&(Math.abs(me)>.25||Math.abs(B)>1||S[C]>.004)&&(fe=!0)}}!fe&&!L&&$(),L=!fe},oe=(o,X)=>{let N=(X-o)/1e3;if(N<=0)return;let T=Math.min(32,e.rects(o,E),e.rects(X,w)),z=0;for(let M=0;M<T;M++){let C=E[M*4],k=w[M*4];if(Number.isNaN(C)||Number.isNaN(k))continue;let O=(k-C)/N;if(Math.abs(O)<ze)continue;let ee=k,B=k+w[M*4+2],me=w[M*4+1],V=me+w[M*4+3];for(let Z=0;Z<r;Z++)g[M*r+Z]=pt(ee,B,Xt,(Z+.5)*t);for(let Z=0;Z<n;Z++)j[M*n+Z]=Bt(me,V,Ot,(Z+.5)*s);P[z]=M,u[z]=O,le[z]=ye(ze,2*ze,Math.abs(O)),z+=1}if(de(N,z),z===0&&v)return;let fe=1-Math.exp(-Rt*N),q=Math.exp(-N/ft),Q=!1;for(let M=0;M<n;M++)for(let C=0;C<r;C++){let k=M*r+C,O=0,ee=0;for(let xe=0;xe<z;xe++){let _e=P[xe],Me=g[_e*r+C]*j[_e*n+M]*le[xe];Me>O&&(O=Me,ee=u[xe])}C<R&&M<U&&(O*=1-F[C]*te[M]);let B=d[k],me=ee-B;O>0&&me*ee>0&&(B+=fe*O*me),B+=(-Ne*Ne*i[k]-2*St*Ne*B)*N;let V=i[k]+B*N;V>l?(V=l,B=Math.min(B,0)):V<-l&&(V=-l,B=Math.max(B,0)),i[k]=V,d[k]=B;let Z=O*Math.min(1,Math.abs(ee)/qe);b[k]=Math.max(Z,b[k]*q),!Q&&(Math.abs(V)>.25||Math.abs(B)>1||b[k]>.004)&&(Q=!0)}!Q&&!v&&W(),v=!Q},ue=o=>{let X=p,N=Lt*1e3;for(;o-X>1e-6;){let T=Math.min(o,X+N);oe(X,T),X=T}p=o};return{resize:ie,sync:()=>{let o=e.now();return(Number.isNaN(p)||o<p||o-p>1e3)&&(W(),$(),p=o-Ct*1e3),o>p&&ue(o),!v||!L},data:()=>{for(let o=0;o<i.length;o++){let X=Math.sign(i[o])*Math.sqrt(Math.abs(i[o])/l);_[o*4]=Math.round((X*.5+.5)*255),_[o*4+1]=Math.round(b[o]*255),_[o*4+2]=128,_[o*4+3]=255}for(let o=0;o<U;o++)for(let X=0;X<R;X++){let N=o*R+X,T=o*r+X,z=Math.sign(G[N])*Math.sqrt(Math.abs(G[N])/Xe);_[T*4+2]=128+Math.round(z*127),_[T*4+1]=Math.max(_[T*4+1],Math.round(S[N]*255))}return _},cols:()=>r,rows:()=>n,range:()=>l,idle:()=>v&&L,carrying:()=>!v,gusting:()=>!L,gustRange:()=>Xe}}var J=(e,r=1)=>[{angle:.35,length:.95*e,amp:.05*e*r},{angle:1.75,length:.62*e,amp:.034*e*r},{angle:2.8,length:.43*e,amp:.02*e*r},{angle:4.2,length:.31*e,amp:.011*e*r}];function Nt(e,r,n,t){if(e<1200)return null;let i=.4,d=4*n+i*t.reduce((w,g)=>w+g.amp,0),b=Math.min(.11*e,(e-640)/2-64-3*n);if(b<4*n)return null;let _=Math.max(b,(b+d)/2),p=.085*r,v=.3*r;return{blob:{x:b-_,y:v,rx:_,ry:p,rot:.06,union:n,bend:i},gust:{right:b+6*n,bottom:v+p+6*n}}}function zt(e,r,n,t){let s=1.6*e,l=2.2*r,i=.56*r,d=J(.6*e,.45),b=4.6/(t("--dur-footer-crest-in")??.8),_=6.64/(t("--dur-footer-crest-out")??1.2),p=6.64/(t("--dur-footer-crest-follow")??.3),v=Math.max((t("--footer-crest-width")??.07)*e,2.1*n),E=(t("--footer-crest-low")??.1)*r,w=(t("--footer-crest-high")??.36)*r,g={top:i,width:v,low:E,high:w,idle:E+(w-E)*(t("--footer-crest-idle")??.5),speed:e/(t("--dur-footer-wave-pass")??7.8),start:.25*e,period:Math.max(e,7*v),rise:b,settle:_,follow:p};return{ground:"black",blobs:[{x:.5*e,y:i+l,rx:s,ry:l,rot:-.05,bend:1}],blend:3*n,wander:.04*r,waves:d,ghost:null,asciiOpacity:0,calm:[0,0,0,0],feather:1,lens:{radius:Math.max(2.4*g.width,6*n),zoom:.06,widen:.4,calm:.5,follow:g.follow,ease:b,carry:0},crest:g,spread:t("--footer-wave-spread")??1,hollow:t("--footer-wave-hollow")??0,tint:t("--footer-wave-tint")??1,ice:[1-(1-211/255)/(1-55/255),1-(1-222/255)/(1-55/255),1-(1-231/255)/(1-55/255)]}}function qt(e,r,n,t){let s=t("--ent-run-enter")??.3,l=t("--ent-run-depth")??.2,i=t("--ent-run-rise")??.356,d=t("--ent-run-card")??.161,b=Math.min(r,t("--ent-run-stage-h")??r),_=t("--ent-run-offset-y")??0,p=Math.min(e,r),v=J(1.4*p,.25),E=.01*p,w=v.reduce((F,te)=>F+te.amp,0)+E,g=-Math.atan(i),j=e*(.5+s)-.02*e,P=r-b/2+_*b-(s-.02)*e*i,u=Math.max(.42*e,6*n,1.6*d*e),le=d*e*(1+Math.tan(14.8*Math.PI/180))/2,D=Math.min(.9,Math.max(.1,(l+.02-d/2)/(u/e))),R=Math.max(3.2*n,(le+1.5*n+w)/Math.sqrt(1-(1-D)*(1-D))),U=4*n+w+.12*240,G=()=>Math.hypot(u*Math.sin(g),R*Math.cos(g)),H=()=>P+u*Math.sin(g)-G(),S=()=>P+u*Math.sin(g)+G();for(;H()<U&&g<-.01;)g*=.8;for(;(H()<U||S()>r-U)&&R>3.2*n;)R*=.95;return{ground:"black",blobs:[{x:j+u*Math.cos(g),y:P+u*Math.sin(g),rx:u,ry:R,rot:g}],blend:Math.max(.14*p,4.5*n),wander:E,waves:v,ghost:null,calm:[0,0,0,0],feather:96}}function je(e,r,n,t,s=()=>{}){if(e==="wordmark")return zt(r,n,t,s);if(e==="run")return qt(r,n,t,s);let l=r/n<.9,i=Math.min(r,n),d=l?2.5*t:Math.max(.14*i,4.5*t),b=(p,v,E,w,g=!1)=>{let j=Math.max(2.8,Math.min(E,.063*r/t))*t;return{x:p*r,y:v*n,rx:1.15*j,ry:j,rot:w,tri:.6,union:t,bend:g?1:.5}};if(e==="band")return{ground:"light",blobs:r>=1100?[{x:.2*r,y:1.1*n,rx:2.1*n,ry:.4*n,rot:-.62,light:!1},{x:.72*r,y:-.15*n,rx:1.7*n,ry:.27*n,rot:1.02,light:!1}]:[{x:-.3*r,y:.7*n,rx:.52*r,ry:2.2*n,rot:.5,light:!1}],blend:.2*n,wander:.04*n,waves:J(2.6*n,.6),ghost:null,calm:[0,0,0,0],feather:1};if(e==="crown")return{ground:"light",blobs:l?[{x:.5*r,y:.95*n,rx:.95*r,ry:.84*n,light:!1}]:[{x:.48*r,y:1*n,rx:.8*r,ry:.88*n,light:!1},{x:.12*r,y:.32*n,rx:.13*r,ry:.16*n,light:!1},{x:.5*r,y:.27*n,rx:.3*r,ry:.22*n,light:!1},{x:.87*r,y:.36*n,rx:.11*r,ry:.16*n,light:!1},{...b(.96,.05,2.9,-.3),light:!1},{...b(.94,.4,3,.4),light:!0}],blend:l?d:.09*i,wander:.012*i,waves:J(1.4*i,.35),ghost:{dx:.16*r,dy:.1*n,reach:.14*Math.max(r,n)},asciiOpacity:.16,calm:[.5*r,.45*n,.34*r,.36*n],feather:96};if(e==="works"){let p=l?null:Nt(r,n,t,J(1.4*i,.5));return l?{ground:"black",blobs:[{x:1.12*r,y:.66*n,rx:.42*r,ry:.17*n,rot:.08}],blend:d,wander:.01*i,waves:J(1.4*i,.5),ghost:{dx:.3*r,dy:.04*n,reach:.12*Math.max(r,n)},asciiOpacity:.16,calm:[.5*r,.24*n,.5*r,.2*n],feather:48}:{ground:"black",blobs:[{x:1.1*r,y:.62*n,rx:.24*r,ry:.28*n,rot:-.1},...p?[p.blob]:[]],blend:d,wander:.01*i,waves:J(1.4*i,.5),ghost:{dx:.3*r,dy:-.12*n,reach:.12*Math.max(r,n)},asciiOpacity:.16,calm:[.5*r,.2*n,.5*r,.22*n],feather:96,gust:p?.gust}}if(e==="logo")return l?{ground:"light",blobs:[{x:.5*r,y:.5*n,rx:.44*r,ry:.38*n,rot:.1,light:!1}],blend:d,wander:.01*i,waves:J(1.4*i,.8),ghost:{dx:.2*r,dy:.1*n,reach:2*t},calm:[.5*r,.47*n,.36*r,.12*n],feather:48}:{ground:"light",blobs:[{x:.5*r,y:.58*n,rx:.52*r,ry:.56*n,rot:.03,light:!1},{x:.14*r,y:-.02*n,rx:.36*r,ry:.15*n,rot:.12,light:!0},{x:1*r,y:.14*n,rx:.2*r,ry:.36*n,rot:-.15,light:!0},{x:.06*r,y:1.02*n,rx:.16*r,ry:.08*n,rot:.1,light:!0},{...b(.86,.72,3.6,.2),light:!0},{...b(.22,.86,2.9,-.5),light:!0}],blend:.18*i,wander:.01*i,waves:J(1.2*i,1),ghost:{dx:10*t,dy:4*t,reach:3*t},calm:[.5*r,.52*n,.32*r,.26*n],feather:96};if(e==="frame")return l?{ground:"light",blobs:[{x:-3*t,y:.3*n,rx:3.4*t,ry:.15*n,rot:.35,light:!1},{x:r+3*t,y:.74*n,rx:3.4*t,ry:.15*n,rot:.35,light:!1}],blend:d,wander:.01*i,waves:J(1.6*i,.6),ghost:null,calm:[0,0,0,0],feather:1}:{ground:"light",blobs:[{x:-.15*r,y:.3*n,rx:.15*r,ry:.2*n,rot:.35,light:!1},{x:1.15*r,y:.74*n,rx:.15*r,ry:.2*n,rot:.35,light:!1}],blend:.2*i,wander:.01*i,waves:J(1.4*i,.6),ghost:null,calm:[0,0,0,0],feather:1};let _=r>=560;return e==="close"?l?{ground:"black",blobs:[{x:.02*r,y:-.03*n,rx:.72*r,ry:.17*n,rot:.22},{x:1*r,y:1.03*n,rx:.74*r,ry:.18*n,rot:.22},..._?[b(.3,.74,3.4,.5)]:[]],blend:d,wander:.012*i,waves:J(1.4*i),ghost:{dx:.3*r,dy:-.12*n,reach:2*t},calm:[.5*r,.47*n,.42*r,.11*n],feather:48}:{ground:"black",blobs:[{x:.06*r,y:-.05*n,rx:.3*r,ry:.22*n,rot:.2},{x:1.05*r,y:.02*n,rx:.21*r,ry:.36*n,rot:-.2},{x:1.07*r,y:1.03*n,rx:.2*r,ry:.28*n,rot:.3},{x:-.04*r,y:1.04*n,rx:.22*r,ry:.17*n,rot:-.3},b(.76,.69,3.4,.5),b(.14,.5,3,-.4)],blend:d,wander:.012*i,waves:J(i),ghost:{dx:9*t,dy:3.5*t,reach:3*t},calm:[.5*r,.5*n,.2*r,.18*n],feather:96}:l?{ground:"black",blobs:[{x:1.06*r,y:-.04*n,rx:.56*r,ry:.15*n,rot:-.25},{x:.1*r,y:1.06*n,rx:1.15*r,ry:.36*n,rot:.3},..._?[b(.7,.66,3.4,.5)]:[]],blend:d,wander:.012*i,waves:J(1.4*i),ghost:{dx:-.3*r,dy:.12*n,reach:1.5*t},calm:[.5*r,.36*n,.5*r,.2*n],feather:48}:{ground:"black",blobs:[{x:1.22*r,y:.53*n,rx:.37*r,ry:.41*n,rot:-.1},{x:.97*r,y:1.05*n,rx:.4*r,ry:.28*n,rot:-.04},{x:-.06*r,y:1.07*n,rx:.22*r,ry:.2*n,rot:-.3},b(.71,.59,3.4,-.35),b(.28,.81,3,2.5,!0)],blend:.26*i,wander:.012*i,waves:J(i),ghost:{dx:14*t,dy:4*t,reach:3*t},calm:[.3*r,.38*n,.32*r,.34*n],feather:96}}function bt(e,r,n,t){let s=Math.min(e,r),l=e/r<.9,i=t??{cx:e/2,cy:r/2,rx:.3*e,ry:.3*r,cardW:0,cardH:0},d=[2.5,3.1],b=(i.cx-i.rx-i.cardW/2)/e,_=.6,p=.75,v=_*(l?.1:Math.min(.19,1.1*b));return{ground:"black",blobs:[{x:e+.08*e,y:.71*r,rx:(v+.08)*e,ry:p*.22*r,rot:-.18},{x:e+.03*e,y:.44*r,rx:(.35*v+.03)*e,ry:p*.14*r,rot:.2},{x:-.04*e,y:.34*r,rx:(.3*v+.04)*e,ry:p*.17*r,rot:.15}],blend:Math.max(.06*s,2.5*n),wander:.006*s,waves:J(1.4*s,.4),ghost:{dx:.12*e,dy:.1*r,reach:.1*Math.max(e,r)},asciiOpacity:.16,calm:[i.cx,i.cy,i.rx+i.cardW,i.ry+i.cardH],feather:96,band:d}}var $e=2240,Vt=34,Yt=1115,$t=[[0,53],[52,46],[61,47],[75,53],[128,85],[150,93],[171,97],[336,103],[514,122],[570,125],[605,122],[655,112],[720,103],[785,90],[869,67],[1024,14],[1071,4],[1115,0],[1161,1],[1213,9],[1474,73],[1541,86],[1602,92],[1660,93],[1722,88],[1802,97],[1943,86],[2067,84],[2098,80],[2152,63],[2168,60],[2240,70]],jt=[[0,93],[76,87],[137,106],[165,112],[274,117],[341,123],[398,131],[497,151],[540,155],[615,149],[752,125],[862,102],[1032,57],[1078,48],[1122,45],[1173,46],[1231,53],[1504,111],[1576,122],[1640,127],[1718,126],[1925,103],[1990,100],[2072,99],[2144,89],[2240,99]],ge=512,Zt=1.25,Ve={thick:.42,gap:1.6},Kt=3.6,Ye=(()=>{let e=(l,i)=>{let d=1;for(;d<l.length-1&&l[d][0]<i;)d++;let[b,_]=l[d-1],[p,v]=l[d];return _+(v-_)*Math.min(1,Math.max(0,(i-b)/(p-b)))},r=l=>{let i=l;for(let d=0;d<3;d++){let b=i.slice(),_=5;for(let p=0;p<i.length;p++){let v=0;for(let E=-_;E<=_;E++)v+=i[Math.min(i.length-1,Math.max(0,p+E))];b[p]=v/(2*_+1)}i=b}return i},n=Array.from({length:ge},(l,i)=>i/(ge-1)*$e),t=r(n.map(l=>e($t,l))),s=r(n.map(l=>e(jt,l)));return{centre:t.map((l,i)=>(l+s[i])/2),half:t.map((l,i)=>(s[i]-l)/2)}})();function xt(e,r,n,t){let s=t?.w??Math.min(e-128,1152),l=t??{x:(e-s)/2,y:r-160,w:s,h:s*9/16},i=n/Vt,d=.1,b=n/5.66,_=(L,W,$,ie)=>({angle:L,length:W,amp:Math.min($*W/(2*Math.PI),ie*n)}),p=[_(.2,Math.max(.6*e,420),.06,.4),_(2.95,Math.max(.37*e,280),.05,.25),_(.5,Math.max(.9*e,600),.03,.3),_(4.4,Math.max(.23*e,180),.03,.1)],v=.3*n,E=2.5*n,w=l.x+(l.cross??.36)*l.w,g=$e*i,j=l.tilt??.32,P=(j<.2?.35:-.03)*e,u=Math.min(.95,Math.max(.05,(Yt+(w-P)*Math.hypot(1,j)/i)/$e)),le=u*(ge-1),D=Ye.centre[Math.round(le)],R=Ye.centre.map(L=>(L-D)*i),U=Ye.half.map(L=>L*i*Zt*Kt),G=Math.max(...U),H=0,S=g/(ge-1);for(let L=1;L<ge;L++)H=Math.max(H,(Math.abs(R[L]-R[L-1])+Math.abs(U[L]-U[L-1]))/S);let F=p.reduce((L,W)=>L+W.amp,0)+v+E*H,te=L=>F+U[L]*(1+d)+2*b,ce=(L,W)=>{let $=Math.atan(L),ie=Math.cos($),de=Math.sin($);return R.map((oe,ue)=>{let f=(ue/(ge-1)-u)*g;return{x:w+f*ie-oe*de,y:l.y+W+f*de+oe*ie,r:te(ue)/ie}})},K=0*(G*(1+Ve.thick)+Ve.gap*n+G*Ve.thick-G),pe=.3*n,re=j,ne=pe;for(let L=0;L<12;L++){if(ne=pe,l.clear){let{left:f,right:I,bottom:o}=l.clear;for(let X of ce(re,pe))X.x>f-X.r&&X.x<I+X.r&&(ne=Math.max(ne,pe+o+16-(X.y-X.r)))}let W=f=>f.filter(I=>I.x>-I.r&&I.x<e+I.r),$=ce(re,ne),ie=Math.min(...W($).map(f=>f.y-f.r),$[0].x>0?$[0].y-$[0].x*re-$[0].r:1/0);ie<8&&(ne+=8-ie);let de=ce(re,ne),oe=de[ge-1];if(Math.max(...W(de).map(f=>f.y+f.r+K),oe.x<e?oe.y+(e-oe.x)*re+oe.r:-1/0)<=r-8||re<.02)break;re*=.85}return{ground:"black",blobs:[{x:w,y:l.y+ne,rx:g,ry:G,rot:Math.atan(re)}],blend:3*n,wander:v,waves:p,ghost:null,asciiOpacity:0,calm:l.clear?[(l.clear.left+l.clear.right)/2,l.clear.bottom-r,(l.clear.right-l.clear.left)/2+48,r+24]:[e/2,0,l.w/2,0],feather:48,band:[Math.max(2.2,G/n*(1+d)/.6+.2),.66],tempo:3,breathe:d,spine:{blob:0,span:g,at:u,offsets:R,halves:U.map(L=>L/G),slope:H,slide:E}}}var Ee=" .:-=+*#",yt=`
attribute vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`,Ze=`
precision highp float;

#define MAX_BLOBS 8
#define WAVES 4
#define GLYPHS ${Ee.length}.0

uniform vec2 u_res;
uniform float u_dpr;
uniform float u_ground;
uniform vec4 u_blob[MAX_BLOBS];
uniform vec4 u_turn[MAX_BLOBS];
uniform vec2 u_form[MAX_BLOBS];
uniform int u_count;
uniform vec4 u_wave[WAVES];
uniform float u_phase[WAVES];
uniform float u_steep;
uniform float u_sigma;
uniform float u_gain;
uniform vec3 u_pointer;
uniform vec3 u_lens;
uniform vec2 u_lensLight;
uniform vec2 u_carry;
uniform float u_ascii;
uniform vec4 u_ghost;
uniform float u_flow;
uniform vec2 u_gust;
uniform vec4 u_calm;
uniform float u_feather;
uniform sampler2D u_glyphs;
uniform sampler2D u_drag;
uniform vec2 u_dragOn;
uniform vec4 u_ripple;
uniform sampler2D u_rippleTex;
uniform float u_rippleRange;
uniform vec2 u_band;
uniform float u_hollow;
uniform float u_tint;
uniform float u_spread;
uniform vec3 u_ice;
uniform vec4 u_spine;
uniform sampler2D u_spineTex;
uniform vec4 u_crest;
uniform vec3 u_crestOld;

const vec3 LIGHT_B = 0.782 * vec3(27.0, 29.0, 255.0) / 255.0;
const vec3 LIGHT_G = 0.782 * vec3(0.0, 255.0, 41.0) / 255.0;
const vec3 LIGHT_R = 0.850 * vec3(223.0, 0.0, 0.0) / 255.0;

const vec2 CELL = vec2(8.0, 16.0);

vec2 warp(vec2 p) {
  vec2 w = vec2(0.0);
  for (int i = 0; i < WAVES; i++) {
    w += u_wave[i].zw * sin(dot(u_wave[i].xy, p) + u_phase[i]);
  }
  return w;
}

float smin(float a, float b, float k) {
  float h = max(k - abs(a - b), 0.0) / k;
  return min(a, b) - h * h * k * 0.25;
}

float pick(vec2 u) {
  float a = u.y;
  float b = -0.866 * u.x - 0.5 * u.y;
  float c = 0.866 * u.x - 0.5 * u.y;
  return -smin(a, smin(b, c, 0.8), 0.8);
}

float shape(vec2 q, vec4 b, vec4 turn, float tri) {
  q -= b.xy;
  q = vec2(turn.x * q.x + turn.y * q.y, turn.x * q.y - turn.y * q.x) / b.zw;
  float r = length(q);
  if (tri > 0.0) r = mix(r, pick(q), tri);
  return (r - 1.0) * min(b.z, b.w);
}

float ribbon(vec2 q, vec4 b, vec4 turn) {
  q -= b.xy;
  q = vec2(turn.x * q.x + turn.y * q.y, turn.x * q.y - turn.y * q.x);
  vec4 k = texture2D(u_spineTex, vec2(q.x / u_spine.y + u_spine.w, 0.5));
  float off = ((k.r * 65280.0 + k.g * 255.0) / 65535.0 * 2.0 - 1.0) * u_spine.z;
  return abs(q.y - off) - 2.0 * k.b * b.w;
}

vec2 ripple(vec2 p) {
  vec2 q = (p - u_ripple.xy) / u_ripple.zw;
  float u = atan(abs(q.x) + 1e-4, q.y) / 3.14159265;
  vec4 k = texture2D(u_rippleTex, vec2(u, q.x < 0.0 ? 0.25 : 0.75));
  return vec2((k.r * 2.0 - 1.0) * u_rippleRange, k.g);
}

float field(vec2 p) {
  vec2 w = warp(p);
  float s = u_ground;
  for (int i = 0; i < MAX_BLOBS; i++) {
    if (i >= u_count) break;
    vec4 turn = u_turn[i];
    float e = u_spine.x > 0.0 && (float(i) == u_spine.x - 1.0 || u_form[i].y < 0.0)
      ? ribbon(p + w * turn.w, u_blob[i], turn)
      : shape(p + w * turn.w, u_blob[i], turn, u_form[i].y);
    s = u_form[i].x < 0.0 ? -smin(-s, e, turn.z) : smin(s, e, turn.z);
  }
  if (u_lensLight.y > 0.0) {
    s = -smin(-s, length(p + 0.5 * w - u_pointer.xy) - u_lensLight.x, u_lensLight.y);
  }
  if (u_ripple.z > 0.0) s += ripple(p).x;
  if (u_crest.z > 0.0) {
    vec2 c = vec2(p.x - u_crest.x, p.x - u_crestOld.x);
    vec2 k = c / u_crest.z;
    vec2 r = (c - u_crestOld.z * (2.0 * step(0.0, c) - 1.0)) / u_crest.z;
    vec2 g = exp(-0.5 * k * k) + u_crest.w * exp(-0.5 * r * r);
    s += u_crest.y * g.x + u_crestOld.y * g.y;
  }
  return s;
}

float dist(vec2 p, float f) {
  const float E = 2.0;
  vec2 g = vec2(field(p + vec2(E, 0.0)) - f, field(p + vec2(0.0, E)) - f) / E;
  return f / max(length(g), 0.6);
}

float erf(float x) {
  float x2 = x * x;
  float ax2 = 0.147 * x2;
  return sign(x) * sqrt(1.0 - exp(-x2 * (1.2732395 + ax2) / (1.0 + ax2)));
}
float phi(float x) { return 0.5 * (1.0 + erf(x * 0.70710678)); }

float mask(float s, float t, float g, float h) {
  float m = phi(s / u_sigma) - phi((s - t) / u_sigma) + phi((s - t - g) / u_sigma);
  return h > 0.0 ? m - phi((s - t - g - h) / u_sigma) : m;
}

vec2 carried(vec2 p) {
  vec4 k = texture2D(u_drag, p / u_res);
  float e = k.r * 2.0 - 1.0;
  return vec2(sign(e) * e * e * u_dragOn.y, k.g);
}

vec2 lifted(vec2 p) {
  vec4 k = texture2D(u_drag, p / u_res);
  float e = (k.b * 255.0 - 128.0) / 127.0;
  if (abs(e) < 0.5 / 127.0) e = 0.0;
  return vec2(sign(e) * e * e * u_gust.y, k.g);
}

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
    f.y
  );
}

void main() {
  vec2 p = vec2(gl_FragCoord.x, u_res.y * u_dpr - gl_FragCoord.y) / u_dpr;

  vec2 toPointer = p - u_pointer.xy;
  float fall = 1.0 - min(dot(toPointer, toPointer) / (u_lens.x * u_lens.x), 1.0);
  fall *= fall;
  float lens = u_pointer.z * fall;
  vec2 pm = u_pointer.xy + toPointer * (1.0 - u_lens.y * lens) + u_carry * fall;

  float stir = 0.0;
  if (u_dragOn.x > 0.0) {
    vec2 k = carried(p);
    pm.x -= k.x;
    stir = k.y;
  }
  if (u_gust.x > 0.0) {
    vec2 k = lifted(p);
    pm.y -= k.x;
    stir = max(stir, k.y);
  }
  if (u_ripple.z > 0.0) stir = max(stir, ripple(p).y);

  float near = min(lens + stir, 1.0);
  float crest = smoothstep(0.0, 0.5, near);
  float spread = mix(u_spread > 0.0 ? u_spread : 1.0, 1.0, crest);
  float d = 5.66 * u_sigma * spread * (1.0 + u_lens.z * near);
  float t = (u_band.x > 0.0 ? u_band.x : 0.74) * d;
  float g = (u_band.y > 0.0 ? u_band.y : 0.66) * d;
  float h = u_hollow > 0.0 ? u_hollow * d / max(1.0 - crest, 0.002) : 0.0;
  float reach = t + g + h + 4.0 * u_sigma;

  float f0 = field(pm);
  vec3 m;
  if (f0 < -u_steep * (2.0 * d + 4.0 * u_sigma)) {
    m = vec3(0.0);
  } else if (f0 > u_steep * (2.0 * d + reach)) {
    m = vec3(h > 0.0 ? 0.0 : 1.0);
  } else {
    vec2 pg = pm - vec2(d, 0.0);
    vec2 pr = pm - vec2(2.0 * d, 0.0);
    m = vec3(
      mask(dist(pr, field(pr)), t, g, h),
      mask(dist(pg, field(pg)), t, g, h),
      mask(dist(pm, f0), t, g, h)
    );
  }
  vec3 light = u_gain * (LIGHT_R * m.r + LIGHT_G * m.g + LIGHT_B * m.b);
  if (u_tint > 0.0) {
    float ice = min(m.r, min(m.g, m.b));
    vec3 pale = u_gain * ice * (LIGHT_R + LIGHT_G + LIGHT_B);
    light += u_tint * (ice * u_ice - pale);
  }

  float glyph = 0.0;
  if (u_ascii > 0.0) {
    float onBlack = 1.0 - smoothstep(0.02, 0.25, max(light.r, max(light.g, light.b)));
    if (onBlack > 0.0) {
      vec2 cell = floor(p / CELL);
      vec2 inCell = fract(p / CELL);
      vec2 c = (cell + 0.5) * CELL;
      float row = hash(vec2(cell.y, u_ghost.w));
      vec2 b = abs(c + vec2(CELL.x * 10.0 * (row - 0.5), 0.0) - u_calm.xy) - u_calm.zw;
      float keep = smoothstep(0.0, u_feather, length(max(b, 0.0)) + min(max(b.x, b.y), 0.0));
      float span = clamp(u_res.x / 50.0, 14.0, 30.0);
      float patch = noise(vec2((cell.x + 0.5 * span * row) / span + u_flow, cell.y / 5.0) + u_ghost.w);
      float fine = noise(vec2((cell.x - 9.0 * row) / 7.0 + 2.0 * u_flow, cell.y / 1.5) - u_ghost.w);
      float grain = keep * smoothstep(0.32, 0.72, 0.75 * patch + 0.25 * fine) * (0.72 + 0.28 * row);
      if (grain > 0.0) {
        if (u_dragOn.x > 0.0) c.x -= carried(c).x;
        float s = field(c + u_ghost.xy + vec2(CELL.x * 6.0 * (row - 0.5), 0.0));
        float w = s > 0.0 ? 1.8 * u_ghost.z : u_ghost.z;
        float v = 0.94 * grain * exp(-s * s / (w * w));
        if (v >= 1.0 / GLYPHS) {
          float rest = 5.66 * u_sigma;
          v *= mix(0.4, 1.0, smoothstep(1.5 * rest, 5.0 * rest, -field(c)));
        }
        float idx = min(floor(v * GLYPHS), GLYPHS - 1.0);
        if (idx > 0.0) glyph = texture2D(u_glyphs, vec2((idx + inCell.x) / GLYPHS, inCell.y)).r * onBlack;
      }
    }
  }

  gl_FragColor = vec4(clamp(light + u_ascii * glyph, 0.0, 1.0), 1.0);
}
`;var Qt=[["-xl",1280],["-lg",1024],["-md",768]];function gt(e,r){let n=globalThis.innerWidth??0;for(let[t,s]of Qt){if(n<s)continue;let l=e.getPropertyValue(r+t).trim();if(l)return l}return e.getPropertyValue(r).trim()}var Jt=Ze.replace("gl_FragColor = vec4(clamp(light + u_ascii * glyph, 0.0, 1.0), 1.0);",`vec3 lit = clamp(light + u_ascii * glyph, 0.0, 1.0);
  gl_FragColor = vec4(lit, clamp(1.6 * max(lit.r, max(lit.g, lit.b)), 0.0, 1.0));`),Ht=2,Wt=6e6,er=.35,ve={w:8,h:16},_t="ui-monospace, SFMono-Regular, Menlo, monospace",Ce=240,Je={radius:240,zoom:.12,widen:.5,calm:1,follow:14,ease:7,carry:0},wt=900,tr=1e3/30,rr=1e3/15,nr=40,or=30,ar=[110,76,92,60],ir=["res","dpr","ground","blob","turn","form","count","wave","phase","steep","sigma","gain","pointer","lens","lensLight","carry","ascii","ghost","calm","feather","glyphs","flow","gust","drag","dragOn","ripple","rippleTex","rippleRange","band","hollow","tint","ice","spread","spine","spineTex","crest","crestOld"];function sr(e,r,n){let t=document.createElement("canvas");t.width=r*Ee.length,t.height=n;let s=t.getContext("2d");if(!s)return t;s.fillStyle="#000",s.fillRect(0,0,t.width,t.height),s.scale(r/ve.w,n/ve.h),s.fillStyle="#fff",s.font=`13.333px ${e}`,s.textAlign="center",s.textBaseline="alphabetic";for(let l=0;l<Ee.length;l++)s.fillText(Ee[l],l*ve.w+ve.w/2,12);return t}function Et(e,r,n=!1,t=!1){let s=(g,j)=>{let P=e.createShader(g);return P?(e.shaderSource(P,j),e.compileShader(P),e.getShaderParameter(P,e.COMPILE_STATUS)?P:(console.error("Dispersion field shader:",e.getShaderInfoLog(P)),e.deleteShader(P),null)):null},l=s(e.VERTEX_SHADER,yt),i=s(e.FRAGMENT_SHADER,t?Jt:Ze),d=e.createProgram(),b=e.createBuffer(),_=e.createTexture();if(l&&i&&d&&(e.attachShader(d,l),e.attachShader(d,i),e.linkProgram(d)),e.deleteShader(l),e.deleteShader(i),!d||!b||!_||!e.getProgramParameter(d,e.LINK_STATUS))return e.deleteProgram(d),e.deleteBuffer(b),e.deleteTexture(_),null;e.useProgram(d),e.bindBuffer(e.ARRAY_BUFFER,b),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),e.STATIC_DRAW);let p=e.getAttribLocation(d,"a_pos");e.enableVertexAttribArray(p),e.vertexAttribPointer(p,2,e.FLOAT,!1,0,0),e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,_),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE);let v=Object.fromEntries(ir.map(g=>[g,e.getUniformLocation(d,`u_${g}`)])),E=null;r&&(E=e.createTexture(),e.activeTexture(e.TEXTURE1),e.bindTexture(e.TEXTURE_2D,E),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.activeTexture(e.TEXTURE0),e.uniform1i(v.drag,1));let w=null;return n&&(w=e.createTexture(),e.activeTexture(e.TEXTURE2),e.bindTexture(e.TEXTURE_2D,w),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.activeTexture(e.TEXTURE0),e.uniform1i(v.rippleTex,2)),{program:d,buffer:b,texture:_,dragTexture:E,rippleTexture:w,spineTexture:null,uniform:v}}function vt(e,r){let n=r.overlay===!0,t=e.getContext("webgl",{antialias:!1,alpha:n,powerPreference:"low-power"});if(!t)return null;let s=Et(t,r.drag!==void 0,r.ripple!==void 0,n);if(!s)return null;let{composition:l,seed:i,gain:d=1.05}=r,b=window.matchMedia("(prefers-reduced-motion: reduce)"),_=window.matchMedia("(hover: hover) and (pointer: fine)"),p=b.matches||r.still===!0,v=r.interactive&&_.matches&&!p,E=0,w=0,g=1,j=Ht,P=4,u=je(l,1,1,1),le=_t,D=new Float32Array(32),R=new Float32Array(32),U=new Float32Array(16),G=new Float32Array(16),H=new Float32Array(4),S=r.drag?dt(r.drag):null,F=r.ripple??null,te=F?F.samples:0,ce=new Float32Array(te*4),he=new Uint8Array(te*2*4),K=null,pe=!1,re=(a,c)=>{let h=Math.min(window.devicePixelRatio||1,j),x=Math.sqrt(Wt/(a*c));return x>=h?h:Math.min(h,Math.max(1,Math.floor(x*8)/8))},ne=a=>{if(!(!s?.rippleTexture||!F)){for(let c=0;c<te*2;c++){let h=a?Math.max(-1,Math.min(1,ce[c]/F.reach)):0,x=a?Math.max(0,Math.min(1,ce[te*2+c])):0;he[c*4]=Math.round((h*.5+.5)*255),he[c*4+1]=Math.round(x*255),he[c*4+2]=0,he[c*4+3]=255}t.activeTexture(t.TEXTURE2),t.bindTexture(t.TEXTURE_2D,s.rippleTexture),t.texImage2D(t.TEXTURE_2D,0,t.RGBA,te,2,0,t.RGBA,t.UNSIGNED_BYTE,he),t.activeTexture(t.TEXTURE0),pe=a}},L=()=>{if(!F||p)return!1;let a=F.sample(ce);return(a||pe)&&ne(a),a},W=()=>{if(!s)return;let{spine:a}=u;if(!a){t.uniform4f(s.uniform.spine,0,0,0,0);return}let c=a.offsets.length,h=Math.max(1,...a.offsets.map(Math.abs)),x=new Uint8Array(c*4);for(let y=0;y<c;y++){let A=Math.round((a.offsets[y]/h*.5+.5)*65535);x[y*4]=A>>8,x[y*4+1]=A&255,x[y*4+2]=Math.round(Math.max(0,Math.min(1,a.halves[y]/2))*255),x[y*4+3]=255}s.spineTexture||(s.spineTexture=t.createTexture()),t.activeTexture(t.TEXTURE3),t.bindTexture(t.TEXTURE_2D,s.spineTexture),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MIN_FILTER,t.LINEAR),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MAG_FILTER,t.LINEAR),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_S,t.CLAMP_TO_EDGE),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_T,t.CLAMP_TO_EDGE),t.texImage2D(t.TEXTURE_2D,0,t.RGBA,c,1,0,t.RGBA,t.UNSIGNED_BYTE,x),t.activeTexture(t.TEXTURE0),t.uniform1i(s.uniform.spineTex,3),t.uniform4f(s.uniform.spine,a.blob+1,a.span,h,a.at)},$=()=>{if(!s||!E||!w)return;let{uniform:a}=s;t.viewport(0,0,e.width,e.height),t.bindTexture(t.TEXTURE_2D,s.texture),t.texImage2D(t.TEXTURE_2D,0,t.RGBA,t.RGBA,t.UNSIGNED_BYTE,sr(le,Math.round(ve.w*g),Math.round(ve.h*g))),t.uniform1i(a.glyphs,0),t.uniform1f(a.gain,d),t.uniform2f(a.res,e.width/g,e.height/g),t.uniform1f(a.dpr,g),t.uniform1f(a.sigma,P),t.uniform1f(a.ground,u.ground==="light"?1e5:-1e5),t.uniform1i(a.count,u.blobs.length);let{ghost:c}=u;t.uniform1f(a.ascii,c&&r.ascii!==!1?u.asciiOpacity??er:0),c&&t.uniform4f(a.ghost,c.dx,c.dy,c.reach,i*7.3%61),t.uniform4f(a.calm,...u.calm),t.uniform1f(a.feather,u.feather);let h=u.lens??Je;t.uniform3f(a.lens,h.radius,h.zoom,h.widen),t.uniform2f(a.band,u.band?.[0]??0,u.band?.[1]??0),t.uniform1f(a.hollow,u.hollow??0),t.uniform1f(a.tint,u.tint??0),t.uniform3f(a.ice,...u.ice??[1,1,1]),t.uniform1f(a.spread,u.spread??1),W();for(let y=0;y<u.blobs.length;y++){let A=u.blobs[y],m=A.rot??0;R[y*4]=Math.cos(m),R[y*4+1]=Math.sin(m),R[y*4+2]=A.union??u.blend,R[y*4+3]=A.bend??1,U[y*2]=A.light===!1?1:-1,U[y*2+1]=A.tri??0}t.uniform4fv(a.turn,R),t.uniform2fv(a.form,U);let x=1;for(let y=0;y<u.waves.length;y++){let A=u.waves[y],m=2*Math.PI/A.length;G[y*4]=m*Math.cos(A.angle),G[y*4+1]=m*Math.sin(A.angle),G[y*4+2]=-A.amp*Math.sin(A.angle),G[y*4+3]=A.amp*Math.cos(A.angle),x+=A.amp*m}t.uniform4fv(a.wave,G),u.spine&&(x+=u.spine.slope),u.crest&&(x+=2*u.crest.high/(u.crest.width*Math.sqrt(Math.E))),u.crest||t.uniform4f(a.crest,0,0,0,0),F&&K&&(x+=F.slope*F.reach*5.66*P/(.5*Math.PI*Math.min(K.rx,K.ry))),t.uniform1f(a.steep,x),F&&s.rippleTexture&&(t.uniform4f(a.ripple,K?.cx??0,K?.cy??0,K?K.rx:0,K?K.ry:1),t.uniform1f(a.rippleRange,F.reach*5.66*P),ne(!1)),S&&s.dragTexture&&(S.resize(E,w,u.gust),t.activeTexture(t.TEXTURE1),t.bindTexture(t.TEXTURE_2D,s.dragTexture),t.texImage2D(t.TEXTURE_2D,0,t.RGBA,S.cols(),S.rows(),0,t.RGBA,t.UNSIGNED_BYTE,S.data()),t.activeTexture(t.TEXTURE0),t.uniform2f(a.dragOn,0,S.range()),t.uniform2f(a.gust,0,S.gustRange()))},ie=()=>{let a=r.scope??e.parentElement,c=a?.querySelector("[data-light-anchor]");if(!c)return null;let h=c.getBoundingClientRect(),x=e.getBoundingClientRect(),y=a?.querySelector("[data-light-clear]")?.getBoundingClientRect(),A=y&&{left:y.left-x.left,right:y.right-x.left,bottom:y.bottom-x.top},m=getComputedStyle(e),Y=se=>{let ae=parseFloat(gt(m,se));return Number.isFinite(ae)?ae:void 0};return{x:h.left-x.left,y:h.top-x.top,w:h.width,h:h.height,clear:A,tilt:Y("--ds-hero-light-tilt"),cross:Y("--ds-hero-light-cross")}},de=a=>{let c=gt(getComputedStyle(e),a.replace(/^--/,"--ds-")),h=parseFloat(c);if(Number.isFinite(h))return c.endsWith("ms")?h/1e3:h},oe=()=>{let a=e.clientWidth&&e.clientHeight?re(e.clientWidth,e.clientHeight):g;if(e.clientWidth===E&&e.clientHeight===w&&a===g)return;let c={w:E,h:w};E=e.clientWidth,w=e.clientHeight,!(!E||!w)&&(g=a,e.width=Math.round(E*g),e.height=Math.round(w*g),P=Math.min(6,Math.max(4,window.innerWidth*.003125)),K=F?F.ring(e):null,u=l==="ring"?bt(E,w,5.66*P,K):l==="horizon"?xt(E,w,5.66*P,ie()):je(l,E,w,5.66*P,de),X(c.w,c.h),$())},ue=0,f={x:0,y:0,on:0,vx:0,vy:0,motion:0,carryX:0,carryY:0},I={x:0,y:0,on:0},o={x:0,vx:0,lift:0,vlift:0,here:1,oldX:0,oldLift:0,motion:0,drift:0,held:!1,wrap:1,vwrap:0};function X(a,c){let h=u?.crest;if(!h)return;if(!a||!c||p){o.drift=o.x=p?E/2:h.start,o.lift=h.idle,o.vx=o.vlift=o.oldLift=o.motion=0,o.here=o.wrap=1,o.vwrap=0,o.held=!1;return}let x=E/a,y=w/c;o.x*=x,o.vx*=x,o.drift*=x,o.oldX*=x,o.lift*=y,o.vlift*=y,o.oldLift*=y}let N=!1,T=()=>{if(!s||!E||!w)return;let{uniform:a}=s,c=u.tempo===void 0?ue*2*Math.PI:ue*2*Math.PI*u.tempo;for(let m=0;m<4;m++)H[m]=i*(1.7+m*2.3)+m*1.9+c/ar[m];t.uniform1fv(a.phase,H),t.uniform1f(a.flow,ue/20);for(let m=0;m<u.blobs.length;m++){let Y=u.blobs[m],se=40+m*7;if(D[m*4]=Y.x+u.wander*Math.cos(i*3.1+m*2.4+c/se),D[m*4+1]=Y.y+u.wander*Math.sin(i*2.3+m*4.1+c/(se*1.3)),D[m*4+2]=Y.rx,D[m*4+3]=Y.ry,u.breathe){let ae=u.breathe*Math.sin(i*1.3+m*2.1+c/(18+m*5));D[m*4+2]=Y.rx*(1+ae),D[m*4+3]=Y.ry*(1-ae)}}if(u.spine?.slide){let{blob:m,slide:Y}=u.spine,se=u.blobs[m].rot??0,ae=Y*Math.sin(i*.7+c/90);D[m*4]+=ae*Math.cos(se),D[m*4+1]+=ae*Math.sin(se);for(let be=0;be<u.blobs.length;be++)be===m||(u.blobs[be].tri??0)>=0||(D[be*4]+=ae*Math.cos(se),D[be*4+1]+=ae*Math.sin(se))}t.uniform4fv(a.blob,D);let h=u.lens??Je,x=h.calm+(1-h.calm)*f.motion,{crest:y}=u;if(y){let m=o.lift*o.here,Y=o.here*(h.calm+(1-h.calm)*o.motion);t.uniform3f(a.pointer,o.x,y.top-m,Y),t.uniform2f(a.carry,0,0),t.uniform4f(a.crest,o.x,m,y.width,o.wrap),t.uniform3f(a.crestOld,o.oldX,o.oldLift,y.period)}else t.uniform3f(a.pointer,f.x,f.y,f.on*x),t.uniform2f(a.carry,f.carryX,f.carryY);let A=h.light;if(A&&f.on>.001?t.uniform2f(a.lensLight,A.radius*f.on-4*P,A.union*f.on):t.uniform2f(a.lensLight,0,0),S&&s.dragTexture){let m=!p&&(S.sync()||!S.idle());m&&(t.activeTexture(t.TEXTURE1),t.bindTexture(t.TEXTURE_2D,s.dragTexture),t.texSubImage2D(t.TEXTURE_2D,0,0,0,S.cols(),S.rows(),t.RGBA,t.UNSIGNED_BYTE,S.data()),t.activeTexture(t.TEXTURE0)),t.uniform2f(a.dragOn,m&&S.carrying()?1:0,S.range()),t.uniform2f(a.gust,m&&S.gusting()?1:0,S.gustRange())}t.drawArrays(t.TRIANGLES,0,3)},z=0,fe=!1,q=0,Q=0,M=0,C=0,k=r.area!==void 0?r.area:e.closest("[data-light-area]"),O={x:0,y:0,known:!1,inside:!0},ee=()=>{if(!v||!fe||!O.known)return;let a=e.getBoundingClientRect(),c=O.x-a.left,h=O.y-a.top,x=O.inside&&(u.crest&&k||c>-Ce&&h>-Ce&&c<a.width+Ce&&h<a.height+Ce);x&&I.on===0&&u.crest&&xe(c,h),x&&I.on===0&&f.on<.01&&(f.x=c,f.y=h,f.vx=f.vy=f.motion=f.carryX=f.carryY=0),I.x=c,I.y=h,I.on=x?1:0},B=a=>{a.pointerType==="touch"||N||(O.x=a.clientX,O.y=a.clientY,O.known=!0,O.inside=!k||a.target instanceof Node&&k.contains(a.target),ee())},me=()=>{I.on=0,f.on=f.motion=f.carryX=f.carryY=0,N||(o.oldLift=o.motion=0,o.here=1)},V=()=>{O.known=!1,I.on=0},Z=a=>{let c=u.crest;if(!c)return 0;let h=Math.min(1,Math.max(0,1-a/w));return c.low+(c.high-c.low)*h},xe=(a,c)=>{let h=u.crest;if(!h)return;let x=o.lift*o.here;Math.abs(a-o.x)<=1.5*h.width&&x>.5||(x>.5?(x>o.oldLift&&(o.oldX=o.x,o.oldLift=x),o.here=0):o.here=1,o.x=a,o.vx=0,o.lift=Z(c),o.vlift=0)},_e=(a,c,h,x,y)=>{let A=Math.exp(-x*y),m=a-h,Y=c+x*m;return[h+(m+Y*y)*A,(Y-x*(m+Y*y))*A]},Me=a=>{let c=u.crest;if(!c||a<=0)return;let h=I.on>0;o.held&&!h&&(o.drift=o.x),o.held=h;let x=1-Math.exp(-a*c.rise);o.here+=(1-o.here)*x,o.oldLift*=1-x,o.oldLift<.1&&(o.oldLift=0),o.oldLift>0&&(o.oldX+=c.speed*a),o.oldX>=c.period&&(o.oldX-=c.period),[o.wrap,o.vwrap]=_e(o.wrap,o.vwrap,h?0:1,c.settle,a),h||(o.drift+=c.speed*a,o.drift>=c.period&&o.wrap>.995&&(o.wrap=1,o.drift-=c.period,o.x-=c.period));let y=h?Math.min(E+2*c.width,Math.max(-2*c.width,I.x)):o.drift;[o.x,o.vx]=_e(o.x,o.vx,y,c.follow,a);let A=h?Z(I.y):c.idle;[o.lift,o.vlift]=_e(o.lift,o.vlift,A,h?.6*c.follow:c.settle,a);let m=Math.min(1,Math.abs(o.vx)/wt);o.motion+=(m-o.motion)*(m>o.motion?x:1-Math.exp(-a*.5*c.rise))},We=a=>{if(z=requestAnimationFrame(We),C=a-M>nr?C+1:0,M=a,C>=or&&g>1&&(C=0,j=Math.max(1,Math.floor(g*6)/8),oe()),u.crest){let we=Math.min(.1,(a-q)/1e3);q=a,Q=a,ue+=we,Me(we),T();return}let c=I.on>0||f.on>.002||f.motion>.002,h=S!==null&&S.sync(),x=L(),y=F?rr:tr;if(!c&&!h&&!x&&a-Q<y-2)return;let A=Math.min(.1,(a-q)/1e3);q=a,Q=a,F?.frozen()||(ue+=A);let m=u.lens??Je,Y=1-Math.exp(-A*m.follow),se=(I.x-f.x)*Y,ae=(I.y-f.y)*Y;f.x+=se,f.y+=ae;let be=1-Math.exp(-A*m.ease);if(f.on+=(I.on-f.on)*be,(m.calm<1||m.carry>0)&&A>0){let we=1-Math.exp(-A*2*m.ease);f.vx+=(se/A-f.vx)*we,f.vy+=(ae/A-f.vy)*we;let lt=Math.min(1,Math.hypot(f.vx,f.vy)/wt);f.motion+=(lt-f.motion)*(lt>f.motion?we:be);let Ue=f.vx*m.carry*f.on,Ge=f.vy*m.carry*f.on,ke=.35*m.radius,Ie=Math.hypot(Ue,Ge);Ie>ke&&(Ue*=ke/Ie,Ge*=ke/Ie),f.carryX=Ue,f.carryY=Ge}T()},Ae=()=>{p||N||z||!s||!fe||document.hidden||(ee(),q=Q=M=performance.now(),C=0,z=requestAnimationFrame(We))},Te=()=>{cancelAnimationFrame(z),z=0};oe(),T(),e.dataset.ready="true";let et=!0,Pe=getComputedStyle(e).getPropertyValue("--ds-font-ascii").trim();Pe&&document.fonts.load(`13.333px ${Pe}`,Ee).then(()=>{et&&(le=`${Pe}, ${_t}`,$(),T())},()=>{});let tt=new IntersectionObserver(([a])=>{fe=a.isIntersecting,fe?Ae():(Te(),me())});tt.observe(e);let rt=()=>{oe(),T()},nt=new ResizeObserver(rt);nt.observe(e);let ot=()=>document.hidden?Te():Ae();document.addEventListener("visibilitychange",ot);let Le=null,at=()=>{Le?.removeEventListener("change",Fe),Le=window.matchMedia(`(resolution: ${window.devicePixelRatio||1}dppx)`),Le.addEventListener("change",Fe)},Fe=()=>{at(),rt()};at();let Re=()=>{p=b.matches||r.still===!0,v=r.interactive&&_.matches&&!p,v||me(),p?(Te(),ne(!1),X(0,0),T()):Ae()};b.addEventListener("change",Re),_.addEventListener("change",Re);let it=a=>{a.preventDefault(),Te(),s=null},st=()=>{s=Et(t,S!==null,F!==null,n),$(),T(),Ae()};return e.addEventListener("webglcontextlost",it),e.addEventListener("webglcontextrestored",st),r.interactive&&(window.addEventListener("pointermove",B,{passive:!0}),window.addEventListener("scroll",ee,{passive:!0}),document.documentElement.addEventListener("pointerleave",V),window.addEventListener("blur",V)),{gl:t,draw:T,destroy(){et=!1,Te(),tt.disconnect(),nt.disconnect(),Le?.removeEventListener("change",Fe),b.removeEventListener("change",Re),_.removeEventListener("change",Re),document.removeEventListener("visibilitychange",ot),e.removeEventListener("webglcontextlost",it),e.removeEventListener("webglcontextrestored",st),window.removeEventListener("pointermove",B),window.removeEventListener("scroll",ee),document.documentElement.removeEventListener("pointerleave",V),window.removeEventListener("blur",V),delete e.dataset.ready,s&&(t.deleteTexture(s.texture),t.deleteTexture(s.dragTexture),t.deleteTexture(s.rippleTexture),t.deleteTexture(s.spineTexture),t.deleteBuffer(s.buffer),t.deleteProgram(s.program),s=null)}}}var Tt=e=>`
.ds-field-still { display: none; }
@media (min-width: 1024px) { .ds-field-still { display: block; object-fit: fill; transition: opacity var(--ds-duration-micro) var(--ds-easing-out); } }
${e}[data-ready] ~ picture > .ds-field-still { opacity: 0; }
@media (prefers-reduced-motion: reduce) { .ds-field-still { transition: none; } }
`,Mt="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";var At=De(`/*! tailwindcss v4.3.5 | MIT License | https://tailwindcss.com */
@layer properties,theme,base,components;@layer utilities{.absolute{position:absolute}.fixed{position:fixed}.static{position:static}.inset-0{inset:0}.block{display:block}.size-full{width:100%;height:100%}.ring{--tw-ring-shadow:var(--tw-ring-inset, ) 0 0 0 calc(1px + var(--tw-ring-offset-width)) var(--tw-ring-color,currentcolor);box-shadow:var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow)}}:host{display:block;position:relative;overflow:clip}`);var lr={fromAttribute:e=>e!=="false"},He=class extends Be{constructor(){super(...arguments);this.composition="hero";this.seed=0;this.interactive=!0;this.still=!1;this.overlay=!1;this.field=null;this.near=null}static{this.styles=[Be.styles,At,De(Tt(".ds-field"))]}static{this.properties={composition:{},seed:{type:Number},interactive:{type:Boolean,converter:lr},still:{type:Boolean},overlay:{type:Boolean},stills:{type:Array},drag:{attribute:!1},ripple:{attribute:!1}}}connectedCallback(){super.connectedCallback(),this.setAttribute("aria-hidden","true"),this.hasUpdated&&this.mount()}disconnectedCallback(){super.disconnectedCallback(),this.unmount()}unmount(){this.near?.disconnect(),this.near=null,this.field?.destroy(),this.field=null}mount(){this.unmount();let n=this.renderRoot.querySelector("canvas");if(!n)return;let t=new IntersectionObserver(([s])=>{s?.isIntersecting&&(t.disconnect(),this.field=vt(n,{composition:this.composition,seed:this.seed,interactive:this.interactive,still:this.still,drag:this.drag,ripple:this.ripple,overlay:this.overlay,scope:this.parentElement,area:this.closest("[data-light-area]")}))},{rootMargin:"100% 0px"});t.observe(n),this.near=t}updated(n){super.updated(n),[...n.keys()].some(t=>["composition","seed","interactive","still","drag","ripple","overlay"].includes(String(t)))&&this.mount()}render(){let n=Array.isArray(this.stills)?this.stills:null;return Se`<canvas class="ds-field block size-full"></canvas>${n?Se`<picture>${n.map(t=>Se`<source media=${t.media} srcset=${t.src} />`)}<img class="ds-field-still absolute inset-0 size-full" src=${Mt} alt="" aria-hidden="true" fetchpriority="high" decoding="async" draggable="false" /></picture>`:ut}`}};ct("dispersion-field",He);export{He as DispersionField};
