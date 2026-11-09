/* 表示原稿は受領資料から抽出。回答はメモリ上のみ保持する。 */
const {questions,reports}=window.CONTENT;
const app=document.querySelector('#app');
// 支給原稿を一字も変えず、主文と補足の切れ目だけを指定する。
function actionMarkup(text){return `<span class="action-copy">${flowText(text)}</span>`;}
function strengthMarkup(text){return flowText(text);}
let answers=[],current=0,transitioning=false;
const escapeHtml=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const crop=(x,y,w,h,label='')=>`<svg class="source-crop" viewBox="${x} ${y} ${w} ${h}" role="img" aria-label="${escapeHtml(label)}"><image href="assets/report-reference.jpg" width="1191" height="1685"/></svg>`;
const vectorCrop=(x,y,w,h,cls='')=>`<svg class="reference-detail ${cls}" viewBox="${x} ${y} ${w} ${h}" aria-hidden="true"><image href="assets/reference-vector.svg" width="1191" height="1685"/></svg>`;
const header=()=>`<header class="report-header"><div class="header-vector" aria-hidden="true"><svg viewBox="0 0 640 253"><image href="assets/reference-vector.svg" width="1191" height="1685"/></svg></div><div class="header-copy"><p><strong>1on1</strong>の時間、</p><h1><span>部下の「<em>本音</em>」が</span><span>見えていますか？</span></h1><p class="header-sub">あなたの1on1が変わる、<span>コミュニケーション診断レポート</span></p></div><div class="header-photo"><svg viewBox="650 0 541 283" role="img" aria-label="資料を見ながら対話する2人"><defs><clipPath id="header-photo-clip"><polygon points="746,0 1191,0 1191,283 649,283"/></clipPath></defs><image href="assets/header-photo.jpeg" x="582.6" y="-11.3" width="608.5" height="406" clip-path="url(#header-photo-clip)"/><polygon points="736,0 746,0 649,283 639,283" fill="#20658d"/><polygon points="1191,169 1191,197 1152,283 1139,283" fill="#94213c"/></svg></div></header>`;
const nativeHeading=(n,title)=>`<h2 class="section-heading"><i>${vectorCrop(75,({'01':467,'02':752,'03':875,'04':1052,'05':1268})[n],96,48,'heading-number')}</i><span>${headingMarkup(title)}</span>${({'01':'気づかないうちに起きるすれ違い','03':'まずは答えを急がない','04':'目指したい未来','05':'目的に合った情報をお届けします'})[n]?`<small>${vectorCrop(839,489,16,16,"heading-cue")}${({ '01':'気づかないうちに起きるすれ違い','03':'まずは答えを急がない','04':'目指したい未来','05':'目的に合った情報をお届けします'})[n]}</small>`:''}</h2>`;
const heading=(n,title)=>{if(title==='1on1コミュニケーション診断')return nativeHeading(n,title);const y=({'01':467,'02':752,'03':875,'04':1052,'05':1268})[n];return `<div class="heading-pair">${nativeHeading(n,title)}<h2 class="section-heading supplied-heading"><span class="heading-accessible">${n} ${escapeHtml(title)}</span><svg aria-hidden="true" viewBox="75 ${y} 1032 50"><image href="assets/reference-vector.svg" width="1191" height="1685"/></svg></h2></div>`;};
const ctaCard=(kind)=>{const a=kind==='A';return `<article class="offer ${a?'offer-a':'offer-b'}"><a class="offer-vector" href="https://nlpi.jp/biztra/one-${kind.toLowerCase()}" target="_blank" rel="noopener" aria-label="${a?'管理職として学びたい方：実践シートを受け取る':'企業研修を検討したい方：資料を受け取る'}"><svg viewBox="${a?84:600} 1360 507 263"><defs><clipPath id="offer-clip-${kind}"><rect x="${a?84:600}" y="1372" width="507" height="251"/><circle cx="${a?121:637}" cy="1392" r="28"/></clipPath></defs><image href="assets/reference-vector.svg" width="1191" height="1685" clip-path="url(#offer-clip-${kind})"/></svg></a><h3><b>${kind}</b><span>${a?'管理職として学びたい方':'企業研修を検討したい方'}</span><small>${a?'無料実践シート':'無料PDF資料'}</small></h3><h4>${a?'あなたの「1on1のクセ」が変わる！':'あなたの会社の1on1、どこに課題がある？'}</h4><div class="offer-body"><div class="offer-photo"><img src="assets/source-${a?'116':'119'}.jpeg" alt="${a?'1on1質問＆実践シートのイメージ':'企業研修のイメージ'}">${a?'<small class="image-caption">※イメージ画像</small>':''}</div><div class="offer-copy"><p>${flowText(a?'7つのコミュニケーションのクセと、部下の本音を引き出す3つの実践スキルを解説する「1on1質問＆実践シート」プレゼント。':'1on1が形骸化する原因と、管理職育成の進め方を解説。診断を活用した組織改善のヒントをまとめた実践ガイドです。')}</p><div class="offer-links"><a class="offer-url" href="https://nlpi.jp/biztra/one-${kind.toLowerCase()}" target="_blank" rel="noopener">https://nlpi.jp/biztra/one-${kind.toLowerCase()}</a><a class="offer-button" href="https://nlpi.jp/biztra/one-${kind.toLowerCase()}" target="_blank" rel="noopener">${a?'シート':'資料'}を受け取る →</a><span class="offer-qr"><img src="assets/source-${a?'114':'117'}.png" alt="QRコード"></span></div></div></div></article>`;};
function intro(){document.body.dataset.screen='intro';app.innerHTML=`<article class="sheet">${header()}<section class="intro-content">${heading('01','1on1コミュニケーション診断').replace(/<small>.*?<\/small>/,'')}<p>${flowText(window.CONTENT.intro)}</p><button class="primary" id="start">診断をはじめる →</button></section></article>`;document.querySelector('#start').onclick=()=>{answers=[];current=0;question();};}
const choices=[
 {label:'非常に当てはまる',value:5},{label:'やや当てはまる',value:4},
 {label:'どちらともいえない',value:3},{label:'あまり当てはまらない',value:2},
 {label:'全く当てはまらない',value:1},{label:'該当する場面がない／判断できない',value:'NA'}
];
function question(){
 document.body.dataset.screen='question';
 app.innerHTML=`<section class="question"><p class="diagnosis-name">1on1コミュニケーション診断</p><div class="progress">${current+1} / 21 <progress value="${current+1}" max="21"></progress></div><div class="question-body"><p class="q-number">Q${String(current+1).padStart(2,'0')}</p><h1>${flowText(questions[current])}</h1><div class="choices">${choices.map(c=>`<button data-answer="${c.value}" class="${c.value==='NA'?'choice-na':''}" aria-pressed="${answers[current]===c.value}">${c.label}</button>`).join('')}</div>${current?'<button id="back" class="back">← 前の質問</button>':''}</div></section>`;
 document.querySelectorAll('[data-answer]').forEach(b=>b.onclick=()=>{
  if(transitioning)return;
  const value=b.dataset.answer==='NA'?'NA':Number(b.dataset.answer);
  if(!window.SCORING.isAnswer(value))throw new RangeError('回答値が不正です。');
  transitioning=true;answers[current]=value;b.setAttribute('aria-pressed','true');
  setTimeout(()=>{transitioning=false;if(++current===21)result();else question();},180);
 });
 document.querySelector('#back')?.addEventListener('click',()=>{if(!transitioning){current--;question();}});window.scrollTo(0,0);
}
const score=values=>window.SCORING.score(values,reports);
function result(){
 const all=score(answers),valid=all.filter(x=>x.count===3).sort((a,b)=>b.score-a.score||a.index-b.index);
 const leaders=valid.filter(x=>x.score===valid[0]?.score);
 const same=valid.length===7&&leaders.length===7,low=same&&valid[0].score===3,high=same&&valid[0].score===15;
 const normal=valid.length>=3&&leaders.length===1;
 const r=normal?reports[leaders[0].index]:null;
 const title=valid.length<3?'判定保留':same?'複数傾向が同程度':leaders.map(x=>x.name).join('・')+'（複合傾向）';
 const key=valid.length<3?'insufficient':low?'low':high?'high':same?'same':'tie';
 const message=window.CONTENT.exceptions[key];
 document.body.dataset.screen='result';
app.innerHTML=`<article class="sheet report" data-type="${r?.name||''}">${header()}<div class="summary"><section class="ranking"><h2>${valid.length<3?'判定できた傾向':'あなたに出やすい傾向 <span class="top-label" aria-label="TOP3">'+vectorCrop(323,267,87,31)+'</span>'}</h2>${valid.slice(0,3).map((s,i)=>`<div class="rank rank-${i}"><b aria-label="${1+valid.filter(x=>x.score>s.score).length}位">${vectorCrop(95,308+37.5*valid.filter(x=>x.score>s.score).length,37,37)}</b><strong>${s.name}</strong><div class="bar"><span style="--score:${s.display}%"></span></div><em>${s.display}<small>／100</small></em></div>`).join('')}${valid.length>3&&valid[2].score===valid[3].score?`<small>同率ほか${valid.slice(3).filter(x=>x.score===valid[2].score).length}タイプ</small>`:''}</section><section class="focus"><h2><span>今回の<br>注目タイプ</span><strong>${r?r.name+'傾向':escapeHtml(title)}</strong></h2><div class="focus-copy"><p>${r?strengthMarkup(r.strength):escapeHtml(message)}</p>${normal?`<img class="type-illustration" src="assets/types/chara${String(leaders[0].index+1).padStart(2,'0')}.png" width="400" height="400" alt="${escapeHtml(r.name)}タイプのイラスト">`:''}</div></section></div>${all.some(x=>x.count<3)?`<p class="references">${all.filter(x=>x.count<3).map(x=>`${x.name}：${x.reference===null?'判定保留':x.reference+'／15（参考実得点）'}`).join('　')}</p>`:''}
${r?`<div class="report-content"><section>${heading('01','こんな1on1、心当たりはありませんか？')}<div class="dialogue-columns"><div><div class="dialogue">${r.dialogue.map(([who,line])=>`<p data-who="${who}"><b>${who}</b><span>「${flowText(line)}」</span></p>`).join('')}</div><div class="signs"><b><span class="sign-mark" aria-hidden="true">!</span><span>こんなこと<br>ありませんか？</span></b><p class="signs-copy">${flowText(r.signs)}</p></div></div><div class="voice-column"><div class="voice"><div><b>部下の心の声（例）</b><p>${flowText(r.voice)}</p></div>${crop(1029,538,76,86,'部下のイラスト')}</div><div class="voice-arrow">${vectorCrop(796,631,47,24)}</div><p class="context">${flowText(window.CONTENT.notice)}</p></div></div></section><section>${heading('02','良かれと思った言動が、なぜ逆効果に？')}<p class="reason">${flowText(r.reason)}</p></section><section>${heading('03','次の1on1で試す、小さな変え方')}<ol class="actions">${r.actions.map((a,i)=>`<li>${vectorCrop([95,446,797][i],945,54,54,'action-number')}${actionMarkup(a)}${i?vectorCrop(411,959,16,26,'action-arrow'):''}</li>`).join('')}</ol><p class="next"><svg class="next-icon" aria-hidden="true" viewBox="165 1017 52 33"><image href="assets/reference-vector.svg" width="1191" height="1685"/></svg><span>${flowText(r.next)}</span></p></section><section>${heading('04','こんな1on1に変わっていったら？')}<div class="changes"><div><b>今</b><ul>${r.changes.map(x=>`<li>${flowText(x[0])}</li>`).join('')}</ul>${crop(455,1152,100,59)}</div>${vectorCrop(582,1138,31,56,'change-arrow')}<div><b>これから</b><ul>${r.changes.map(x=>`<li>${flowText(x[1])}</li>`).join('')}</ul>${crop(1029,1153,72,58)}</div></div><p class="next"><svg class="next-icon" aria-hidden="true" viewBox="165 1017 52 33"><image href="assets/reference-vector.svg" width="1191" height="1685"/></svg><span>${flowText('1on1を「報告の時間」から、部下の成長を支える対話の時間へ。')}</span></p></section></div>`:''}
<section class="cta">${heading('05','あなたの次の一歩を選んでください')}<p>${flowText('この診断は「気づき」の入り口です。さらに学びたい方には、目的別の情報をご用意しています。')}</p><div class="cta-columns">${ctaCard('A')}${ctaCard('B')}</div></section><div class="result-tools"><button id="print" class="primary">結果をPDFで保存</button><button id="retry">もう一度診断する</button></div><footer class="footer"><p>${flowText('※診断は自己回答に基づくコミュニケーション傾向の目安です。部下の本音や職場の課題を断定するものではありません。')}</p><a href="https://nlpi.jp/" target="_blank" rel="noopener">株式会社アイエヌエー　https://nlpi.jp/</a></footer></article>`;
document.querySelector('#print').onclick=()=>window.print();document.querySelector('#retry').onclick=intro;window.scrollTo(0,0);}
app.innerHTML='<form class="gate"><h1>1on1コミュニケーション診断</h1><label>パスワード<input type="password" required autofocus></label><button class="primary">表示する</button><p role="alert"></p></form>';
document.querySelector('form').onsubmit=e=>{e.preventDefault();if(document.querySelector('input').value==='vak')intro();else document.querySelector('[role=alert]').textContent='パスワードが違います。';};
// PDFの縮尺と余白はprint用CSSへ集約する。

// 表示原稿は変えず、語と助詞・語尾・閉じ記号をまとまりとして扱う。
const phraseLexicon = ['「参考にしてもらえるかな」と','話す前に','相談方法','支える力','ご用意しています','良い点','見る力','伝える力','見つける力','言葉にする力','聞いたうえで','語る前に','しやすい','されすぎ','聞いて','あるのに','いないのに','相談したい','確認します','して','もらえるかな','これ以上','説明しやすく','提案しづらい','大変だった','ほしかった','大きかった','詳しく','解決策','説明し終えて','できていない','優先したり','出しづらくなる','探しやすい','しやすくなる','しづらい','安心感','注意深さ','小さく','進めやすくなる','確かめながら','生かしやすく','聞かせて','3つ','7つ','速さ','したいこと','コミュニケーション','部下の心の声','経験談','進み具合','具体的','その都度','そのくらい','難しさ','頼りになる','話し終わる','話し終えたら','話し始める','考え始める','受け止める','受け止め','話し合える','思いついた','任せた','聞かれる','聞いた','聞くと','話したい','話せる','終わりやすい','終わる','終わり','伝えやすく','伝える','加える','感じる','考えを','気持ち','気になる','気になり','少なくなる','増えやすい','しにくい','ながら','区切る','一区切り','短く','尋ねる','確かめる','できます','できる','できた','でき','あります','ありません','ある','する','します','ください','されすぎ','かも','ためではなく','十分に','うえで','もらえる','待ってみる','あってね','させてね','試せそう','優先したくなる','確認したくなる','盛ること','和ませよう','挟みたくなる','知っていてほしい','考えてきた','進めたい','答えたくなる','始めたくなる','伝えておきたい','説明したい','思われたい','ないか','一度','もう少し','学びたい','管理職','職場','実際','活用','リスク','1on1','実践シート','実践ガイド','プレゼント','したい','話す','しかし','必要','参考に','だけれど','話さなくても'].sort((a,b)=>b.length-a.length);
const japaneseWords = new Intl.Segmenter('ja', {granularity:'word'});
function phraseParts(text){
 const tokens=[];
 for(let pos=0;pos<text.length;){
  const rest=text.slice(pos);
  const token=phraseLexicon.find(word=>rest.startsWith(word)) || japaneseWords.segment(rest)[Symbol.iterator]().next().value.segment;
  tokens.push(token);pos+=token.length;
 }
 // 語形と後続語から結合する。文言の置換ではなく改行候補だけを制御する。
 for(let i=1;i<tokens.length;i++){
  const a=tokens[i-1],b=tokens[i];
  const sahen=/\p{Script=Han}$/u.test(a)&&/^(?:する|して|し$|され|でき|しやす)/.test(b);
  const predicate=/(?:く|に)$/.test(a)&&/^(?:する|して|なる|なり)/.test(b);
  const nominal=/(?:う|く|ぐ|す|つ|ぬ|ぶ|む|る|い|た|な)$/.test(a)&&(/^(?:ため|前|後|うえ|とき)/.test(b)||/^\p{Script=Han}{1,2}$/u.test(b));
  const suffix=/^(?:られる|れる|らない|ら$|れ$)/.test(b)||(/\p{Script=Han}$/u.test(a)&&/^(?:\p{Script=Han}|さ)$/u.test(b));
  const explanation=a==='の'&&/^(?:だ|です|では)/.test(b);
  if(sahen||predicate||nominal||explanation||suffix){tokens.splice(i-1,2,a+b);i=Math.max(0,i-2);}
 }
 const parts=[];let opening='';
 const attach=/^(?:は|が|を|に|の|と|も|へ|で|や|から|まで|より|だけ|では|には|でも|とは|ので|のに|について|ます|ません|まし|た|て|だ|です|でし|ない|れる|られる|たい|そう|か|ね|よ|な|ながら|つつ|たり|なく|にくい|やすい|すぎ|いる|ある|なる|こと)$/;
 for(const token of tokens){
  if(/^[「『（(]+$/.test(token)){opening+=token;continue;}
  if(/^[、。！？!?」』）)……]+$/.test(token) && parts.length && !opening){parts[parts.length-1]+=token;continue;}
  if((attach.test(token)||/^(?:によって|のだけれど)/.test(token))&&parts.length&&!opening&&Array.from(parts[parts.length-1]+token).length<=14){parts[parts.length-1]+=token;continue;}
  parts.push(opening+token);opening='';
 }
 // 活用・助詞を付けた後のまとまりも統合する。
 for(let i=1;i<parts.length;i++){
  const a=parts[i-1],b=parts[i];
  if((/^に(?:する|して|なる|なり)/.test(b))||(/(?:く|に)$/.test(a)&&/^(?:する|して|なる|なり)/.test(b))||(/ことが$/.test(a)&&/^でき/.test(b))||(/\p{Script=Han}$/u.test(a)&&/^な\p{Script=Han}/u.test(b))){parts.splice(i-1,2,a+b);i=Math.max(0,i-2);}
 }
 if(opening){if(parts.length)parts[parts.length-1]+=opening;else parts.push(opening);}
 return parts;
}
function flowText(text){return '<span class="flow-text">'+phraseParts(String(text)).map(p=>'<span class="phrase">'+escapeHtml(p)+'</span>').join('<wbr>')+'</span>';}
function headingMarkup(text){
 const parts={
  'こんな1on1、心当たりはありませんか？':['こんな1on1、','心当たりは','ありませんか？'],
  '良かれと思った言動が、なぜ逆効果に？':['良かれと思った','言動が、','なぜ逆効果に？'],
  '次の1on1で試す、小さな変え方':['次の1on1で試す、','小さな変え方'],
  'こんな1on1に変わっていったら？':['こんな1on1に','変わっていったら？'],
  'あなたの次の一歩を選んでください':['あなたの次の一歩を','選んでください']
 }[text];
 return parts?parts.map(p=>'<span class="heading-phrase">'+escapeHtml(p)+'</span>').join(''):escapeHtml(text);
}
