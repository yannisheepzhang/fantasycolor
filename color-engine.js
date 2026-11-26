(function(root){
const levels=[900,800,700,600,500,400,300,200,100,50];
const rules={fantasy:{mid:[40,40,50,60,40,40,30,30,30,30],high:[40,40,40,50,35,30,25,25,25,25]},light:{mid:[40,40,50,60,40,40,30,30,30,30],high:[40,40,40,50,35,30,25,25,25,25]},dark:{mid:[40,26,30,40,30,30,30,30,30,20],high:[40,26,25,30,25,20,25,25,25,15]}};
function rgbToHsl(r,g,b){r/=255;g/=255;b/=255;const max=Math.max(r,g,b),min=Math.min(r,g,b),d=max-min,l=(max+min)/2;let h=0,s=0;if(d){s=d/(1-Math.abs(2*l-1));h=max===r?((g-b)/d)%6:max===g?(b-r)/d+2:(r-g)/d+4;h=((h*60)%360+360)%360;}return {h,s:s*100,l:l*100};}
function hslToRgb(h,s,l){s/=100;l/=100;const c=(1-Math.abs(2*l-1))*s,x=c*(1-Math.abs((h/60)%2-1)),m=l-c/2;let p=h<60?[c,x,0]:h<120?[x,c,0]:h<180?[0,c,x]:h<240?[0,x,c]:h<300?[x,0,c]:[c,0,x];return p.map(v=>Math.round((v+m)*255));}
function hex(rgb){return '#'+rgb.map(v=>v.toString(16).padStart(2,'0')).join('').toUpperCase();}
// 规则表使用整数色相。仅分组时四舍五入；0°按360°归入中明度，输出H保留原值。
function palette(h,s,type){const group=Math.round(h)>=91&&Math.round(h)<=210?'high':'mid';return levels.map((level,i)=>{const threshold=rules[type][group][i];const target=type==='light'&&group==='high'&&level===700?45:threshold;const outS=s<=5?s+6:s>=threshold?target:s;const l=(type==='dark'?[95,90,80,70,60,50,40,30,20,15]:[15,20,30,40,50,60,70,80,90,95])[i];return {name:(type==='fantasy'?'FantasyColor_':'ColorFont_')+level+(type==='dark'?'_D':''),level,h,s:outS,l,hex:hex(hslToRgb(h,outS,l)),threshold,target,group,reason:s<=5?'S ≤ 5，S + 6':s>=threshold?`S ≥ ${threshold}，取 ${target}`:'S 在区间内，保持不变'};});}
// RGB每通道分16桶，选像素最多的桶并取其真实RGB均值；忽略alpha<128的像素。
function extract(data){const bins=new Map();let total=0;for(let i=0;i<data.length;i+=4){if(data[i+3]<128)continue;let r=data[i],g=data[i+1],b=data[i+2],key=(r>>4)*256+(g>>4)*16+(b>>4);let v=bins.get(key)||{sum:[0,0,0],count:0};v.count++;v.sum[0]+=r;v.sum[1]+=g;v.sum[2]+=b;bins.set(key,v);total++;}return [...bins.values()].sort((a,b)=>b.count-a.count).slice(0,6).map(v=>({rgb:v.sum.map(n=>Math.round(n/v.count)),share:v.count/total}));}
const api={levels,rules,rgbToHsl,hslToRgb,hex,palette,extract};if(typeof module!=='undefined')module.exports=api;root.ColorEngine=api;
})(globalThis);
