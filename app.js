const E=ColorEngine,$=id=>document.getElementById(id);let rgb=[54,125,120],all={},codeMode='css',sourceCode='',uploadSeq=0;
const round=n=>Math.round(n*100)/100;
function render(){let v=E.rgbToHsl(...rgb);$('hex').textContent=E.hex(rgb);$('hsl').textContent=`HSL ${round(v.h)}° / ${round(v.s)}% / ${round(v.l)}%`;$('rgb').textContent=`RGB ${rgb.join(', ')}`;$('original-swatch').style.background=E.hex(rgb);$('color').value=E.hex(rgb);$('hex-input').value=E.hex(rgb);all=Object.fromEntries(['fantasy','light','dark'].map(t=>[t,E.palette(v.h,v.s,t)]));$('group').textContent=all.fantasy[0].group==='high'?'高明度色相 · H = 91°–210°':'中明度色相 · H = 1°–90°、211°–360°';$('palettes').innerHTML='';const titles={fantasy:['FantasyColor','不映射 · 基础色阶'],light:['ColorFont · Light','映射 · 浅色模式'],dark:['ColorFont · Dark','映射 · 深色模式']};
for(const t of Object.keys(all)){
const wrap=document.createElement('div');wrap.innerHTML=`<div class="palette-heading"><strong>${titles[t][0]}</strong><span>${titles[t][1]}</span></div><div class="swatches"></div>`;all[t].forEach((c,i)=>{
  const button=document.createElement('button');
  const tipId='tip-'+c.name;
  button.className='swatch';
  button.setAttribute('aria-label',c.name+': '+c.hex);
  button.setAttribute('aria-describedby',tipId);
  button.innerHTML=`<span class="paint" style="background:${c.hex};color:${c.l<55?'#fff':'#23332b'}">${c.level}</span><small>${c.hex}</small><span class="swatch-tip" id="${tipId}" role="tooltip"><strong>${c.name}</strong><span>H ${round(v.h)}° → ${round(c.h)}°</span><span>S ${round(v.s)}% → ${round(c.s)}%</span><span>L ${round(v.l)}% → ${c.l}%</span><span>${c.reason}，L 固定为 ${c.l}%。</span></span>`;
  button.onclick=()=>button.focus();
  wrap.lastChild.appendChild(button);
});
$('palettes').appendChild(wrap);
}
renderCode();
}
function payload(){return {source:{hex:E.hex(rgb),rgb,hsl:E.rgbToHsl(...rgb),label:$('origin').textContent},group:all.fantasy[0].group,notes:['取色：16级RGB分桶，最大桶均值，最长边160px，忽略alpha<128','分组H四舍五入，0°视为360°；输出H不变','Light高明度700：S>=40取45'],tokens:Object.fromEntries(Object.values(all).flat().map(c=>[c.name,{hex:c.hex,h:c.h,s:c.s,l:c.l}]))};}
function renderCode(){let text='';if(codeMode==='js')text=sourceCode||'正在读取源码…';else if(codeMode==='json')text=JSON.stringify(payload(),null,2);else text='/* 基于原始主色 '+E.hex(rgb)+' 生成 */\n:root {\n'+Object.values(all).flat().map(c=>`  --${c.name}: hsl(${round(c.h)} ${round(c.s)}% ${c.l}%); /* ${c.hex} */`).join('\n')+'\n}';$('code').textContent=text;document.querySelectorAll('[data-code]').forEach(b=>b.classList.toggle('active',b.dataset.code===codeMode));}
async function upload(file, exampleImage){if(!file&&!exampleImage)return;const seq=++uploadSeq;if(file?.size>20*1024*1024){$('status').textContent='图片超过 20 MB，请选择较小的图片。';return}if(file&&!/^image\/(png|jpeg|webp|gif)$/.test(file.type)){$('status').textContent='请选择 PNG、JPG、WebP 或 GIF 图片。';return}const url=file?URL.createObjectURL(file):null;try{const img=exampleImage??new Image();if(url)img.src=url;await img.decode();if(seq!==uploadSeq||(exampleImage&&$('origin').textContent==='手动试色'))return;const canvas=document.createElement('canvas'),scale=Math.min(1,160/Math.max(img.naturalWidth,img.naturalHeight));canvas.width=Math.max(1,Math.round(img.naturalWidth*scale));canvas.height=Math.max(1,Math.round(img.naturalHeight*scale));const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(img,0,0,canvas.width,canvas.height);const candidates=E.extract(ctx.getImageData(0,0,canvas.width,canvas.height).data);if(!candidates.length)throw Error('没有可取色的非透明像素');$('cover').replaceChildren(img);rgb=candidates[0].rgb;$('origin').textContent=exampleImage?'示例':'图片主色';$('status').textContent='';$('candidates').replaceChildren();candidates.forEach((c,i)=>{const b=document.createElement('button');b.style.background=E.hex(c.rgb);b.title=`候选 ${i+1} · ${E.hex(c.rgb)} · ${(c.share*100).toFixed(1)}%`;b.setAttribute('aria-label',b.title);b.onclick=()=>{rgb=c.rgb;$('origin').textContent=i?'候选主色':exampleImage?'示例':'图片主色';render()};$('candidates').appendChild(b)});render();}catch(e){if(seq===uploadSeq)$('status').textContent='无法读取图片：'+e.message;}finally{if(url)URL.revokeObjectURL(url)}}
$('file').onchange=e=>{upload(e.target.files[0]);e.target.value=''};for(const name of ['dragenter','dragover'])$('drop').addEventListener(name,e=>{e.preventDefault();$('drop').classList.add('drag')});$('drop').ondragleave=()=>$('drop').classList.remove('drag');$('drop').ondrop=e=>{e.preventDefault();$('drop').classList.remove('drag');upload(e.dataTransfer.files[0])};
document.addEventListener('paste', event => {
  const target = event.target;
  if (target instanceof Element &&
      (target.closest('textarea, input:not([type="file"])') || target.isContentEditable)) return;

  const clipboard = event.clipboardData;
  if (!clipboard) return;
  const image = Array.from(clipboard.files).find(file => file.type.startsWith('image/')) ??
    Array.from(clipboard.items).find(item => item.kind === 'file' && item.type.startsWith('image/'))?.getAsFile();
  if (!image) return;

  event.preventDefault();
  upload(image);
});
function manual(v){if(!/^#[\da-f]{6}$/i.test(v)){$('status').textContent='请输入完整的 6 位 HEX，例如 #367D78。';return}rgb=[1,3,5].map(i=>parseInt(v.slice(i,i+2),16));$('origin').textContent='手动试色';render()}
$('color').oninput=e=>manual(e.target.value);$('hex-input').onchange=e=>manual(e.target.value);$('hex-input').oninput=e=>{if(/^#[\da-f]{6}$/i.test(e.target.value))manual(e.target.value)};$('hex-input').onkeydown=e=>{if(e.key==='Enter')manual(e.target.value)};document.querySelectorAll('[data-code]').forEach(b=>b.onclick=()=>{codeMode=b.dataset.code;renderCode()});$('copy').onclick=async()=>{try{await navigator.clipboard.writeText($('code').textContent);$('copy').textContent='已复制';setTimeout(()=>$('copy').textContent='复制代码',1600)}catch{$('copy').textContent='请选中代码复制'}};$('export').onclick=()=>{const url=URL.createObjectURL(new Blob([JSON.stringify(payload(),null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='book-color-tokens.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)};
fetch('color-engine.js').then(r=>{if(!r.ok)throw Error();return r.text()}).then(s=>{sourceCode=s;if(codeMode==='js')renderCode()}).catch(()=>{sourceCode='源码读取失败，请使用下方链接下载 color-engine.js。';renderCode()});render();
upload(null, $('example-image'));
