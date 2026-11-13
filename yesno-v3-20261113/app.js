/* 表示原稿は受領資料から抽出。回答はメモリ上のみ保持する。 */
const {questions,reports}=window.CONTENT;
const app=document.querySelector('#app');
const closingByType = {
  "しゃべりすぎ": "助言する前にひと呼吸待つと、部下が自分の考えを最後まで話せる時間が生まれます。",
  "マウント": "「どんな工夫をしたの？」と先に聞くと、部下が自分なりに考えて選んだ理由を話しやすくなります。",
  "ネガティブ": "「どんな条件なら試せそう？」と聞くと、部下の提案を小さく試す方法を一緒に考えられます。",
  "マイペース": "話題を変える前に「この話はここまでで大丈夫？」と聞くと、部下がまだ気になっていることを話せます。",
  "過干渉": "任せる範囲と次の確認日を一緒に決めると、部下はそこまで自分の判断で進めやすくなります。",
  "カッコつけ": "わからないことを「確認します」と伝えると、部下も疑問を口にでき、一緒に事実を確かめられます。",
  "ドライ": "「不安に感じているんですね」と受け止めると、部下は何に困っているのか、その背景まで話しやすくなります。"
};

// Keep a rapid series of touches on one answer, even across the screen change.
const repeatTouchMs = 450;
let lastAnswerTouch = -Infinity;
let touchSequence = false;
app.addEventListener('pointerdown', event => {
  touchSequence = event.pointerType === 'touch';
}, true);
app.addEventListener('click', event => {
  if (!touchSequence || event.detail === 0) return;
  const now = performance.now();
  const repeated = now - lastAnswerTouch < repeatTouchMs;
  if (repeated || event.target.closest('[data-answer]')) lastAnswerTouch = now;
  if (repeated) {
    event.preventDefault();
    event.stopImmediatePropagation();
  }
}, true);

// 支給原稿を一字も変えず、主文と補足の切れ目だけを指定する。
function actionMarkup(text){return `<span class="action-copy">${flowText(text)}</span>`;}
function strengthMarkup(text){return flowText(text);}
let answers=[],current=0,transitioning=false;
const escapeHtml=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const crop=(x,y,w,h,label='')=>`<svg class="source-crop" viewBox="${x} ${y} ${w} ${h}" role="img" aria-label="${escapeHtml(label)}"><image href="assets/report-reference.jpg" width="1191" height="1685"/></svg>`;
const vectorCrop=(x,y,w,h,cls='')=>`<svg class="reference-detail ${cls}" viewBox="${x} ${y} ${w} ${h}" aria-hidden="true"><image href="assets/reference-vector.svg" width="1191" height="1685"/></svg>`;
const header=()=>`<header class="report-header"><div class="header-vector" aria-hidden="true"><svg viewBox="0 0 640 253"><defs><clipPath id="report-title-clip"><path d="M0 0H640V190H82V253H0Z"/></clipPath></defs><image href="assets/reference-vector.svg" width="1191" height="1685" clip-path="url(#report-title-clip)"/><text x="96" y="211" fill="white" font-size="18" font-weight="700" font-family="ReportSans,sans-serif">あなたの1on1の「クセ」がわかる、<tspan x="96" dy="24">コミュニケーション診断レポート</tspan></text></svg></div><div class="header-copy"><p><strong>1on1</strong>の時間、</p><h1><span>部下の「<em>本音</em>」が</span><span>見えていますか？</span></h1><p class="header-sub">あなたの1on1の「クセ」がわかる、<br><span>コミュニケーション診断レポート</span></p></div><div class="header-photo"><svg viewBox="650 0 541 283" role="img" aria-label="資料を見ながら対話する2人"><defs><clipPath id="header-photo-clip"><polygon points="746,0 1191,0 1191,283 649,283"/></clipPath></defs><image href="assets/header-photo.jpeg" x="582.6" y="-11.3" width="608.5" height="406" clip-path="url(#header-photo-clip)"/><polygon points="736,0 746,0 649,283 639,283" fill="#20658d"/><polygon points="1191,169 1191,197 1152,283 1139,283" fill="#94213c"/></svg></div></header>`;
const nativeHeading=(n,title)=>`<h2 class="section-heading"><i>${vectorCrop(75,({'01':467,'02':752,'03':875,'04':1052,'05':1268})[n],96,48,'heading-number')}</i><span>${headingMarkup(title)}</span>${({'01':'気づかないうちに起きるすれ違い','03':'まずは答えを急がない','04':'目指したい未来','05':'目的に合った情報をお届けします'})[n]?`<small>${vectorCrop(839,489,16,16,"heading-cue")}${({ '01':'気づかないうちに起きるすれ違い','03':'まずは答えを急がない','04':'目指したい未来','05':'目的に合った情報をお届けします'})[n]}</small>`:''}</h2>`;
const heading=(n,title)=>{if(title==='1on1コミュニケーション診断')return nativeHeading(n,title);const y=({'01':467,'02':752,'03':875,'04':1052,'05':1268})[n];return `<div class="heading-pair">${nativeHeading(n,title)}<h2 class="section-heading supplied-heading"><span class="heading-accessible">${n} ${escapeHtml(title)}</span><svg aria-hidden="true" viewBox="75 ${y} 1032 50"><image href="assets/reference-vector.svg" width="1191" height="1685"/></svg></h2></div>`;};
const ctaCard=(kind)=>{const a=kind==='A';return `<article class="offer ${a?'offer-a':'offer-b'}"><a class="offer-vector" href="https://nlpi.jp/biztra/one-${kind.toLowerCase()}" target="_blank" rel="noopener" aria-label="${a?'管理職として学びたい方：実践シートを受け取る':'企業研修を検討したい方：資料を受け取る'}"><svg viewBox="${a?84:600} 1360 507 263"><defs><clipPath id="offer-clip-${kind}"><rect x="${a?84:600}" y="1372" width="507" height="251"/><circle cx="${a?121:637}" cy="1392" r="28"/></clipPath></defs><image href="assets/reference-vector.svg" width="1191" height="1685" clip-path="url(#offer-clip-${kind})"/></svg></a><h3><b>${kind}</b><span>${a?'管理職として学びたい方':'企業研修を検討したい方'}</span><small>${a?'無料実践シート':'無料PDF資料'}</small></h3><h4>${a?'あなたの「1on1のクセ」が変わる！':'あなたの会社の1on1、どこに課題がある？'}</h4><div class="offer-body"><div class="offer-photo"><img src="assets/source-${a?'116':'119'}.jpeg" alt="${a?'1on1質問＆実践シートのイメージ':'企業研修のイメージ'}">${a?'<small class="image-caption">※イメージ画像</small>':''}</div><div class="offer-copy"><p>${flowText(a?'7つのコミュニケーションのクセと、部下の本音を引き出す3つの実践スキルを解説する「1on1質問＆実践シート」プレゼント。':'1on1が形骸化する原因と、管理職育成の進め方を解説。診断を活用した組織改善のヒントをまとめた実践ガイドです。')}</p><div class="offer-links"><a class="offer-url" href="https://nlpi.jp/biztra/one-${kind.toLowerCase()}" target="_blank" rel="noopener">https://nlpi.jp/biztra/one-${kind.toLowerCase()}</a><a class="offer-button" href="https://nlpi.jp/biztra/one-${kind.toLowerCase()}" target="_blank" rel="noopener">${a?'シート':'資料'}を受け取る →</a><span class="offer-qr"><img src="assets/source-${a?'114':'117'}.png" alt="QRコード"></span></div></div></div></article>`;};
function intro(){document.body.dataset.screen='intro';app.innerHTML=`<article class="entry-card">
<header class="entry-banner"><h1><span><b>1on1</b> の時間、</span><span>部下の「<em>本音</em>」が</span><span>見えていますか？</span></h1>
<p>あなたの1on1の「クセ」がわかる、<br>コミュニケーション診断</p></header>
<section class="entry-body"><div class="entry-guide"><p>${flowText('過去3か月間の1on1や部下とのやり取りを振り返り、実際に取った行動をもとにお答えください。')}</p><p>${flowText('頭の中で考えただけの行動は含めず、普段の自分に近い回答を選んでください。')}</p></div>
<div class="entry-choices">
<p class="entry-count"><svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="4" y="4" width="16" height="18" rx="2"/><rect x="8" y="2" width="8" height="4" rx="1.5" fill="white"/><path d="M7 10h2m2 0h6M7 15h2m2 0h6"/></svg>全21問・Yes／Noで回答</p>
<button class="entry-start" id="start">診断をはじめる　→</button>
<p class="entry-hint">回答は一問ずつ進みます</p></div>
<small class="entry-credit">© 2026 株式会社アイエヌエー. All Rights Reserved.</small></section></article>`;document.querySelector('#start').onclick=()=>{answers=[];current=0;question();};}
// All prompts share one grid cell so wrapping sets the same response position at each width.
const promptSegmenter = typeof Intl.Segmenter==='function' ? new Intl.Segmenter('ja',{granularity:'word'}) : null;
// 各設問で改行する読点の順番（引用内の読点も数える）。
const questionBreakComma = [1,2,2,2,2,3,2,1,1,2,1,2,2,2,2,1,2,1,2,1,2];
function promptMarkup(text){
 const ordinal=questionBreakComma[questions.indexOf(text)];
 if(ordinal){
  const comma=Array.from(text.matchAll(/、/gu))[ordinal-1];
  const split=text===questions[15] ? text.indexOf('『') : comma.index+1;
  return promptMarkup(text.slice(0,split))+'<br class="question-comma-break">'+promptMarkup(text.slice(split));
 }
 const protectedWords=/(向こうの幹部とも話が通じるから」などと、|その都度口を出してしまう|急に別の話題に変える|自分はうなずきや相づち|表情もほとんど変わらない|私はこっちのやり方が好きだな|私の若い頃はもっと大変だったよ」などと、|この考え方はかなり高度だから|仕事の重要性|自分が話し続けてしまう|できた点より先に課題を指摘する|知っていて当然という態度で返す|自分の好みで決めてしまう|確認日よりも前に|そんなことも知らないの？|うなずきや相づち|つい冗談を挟んでしまう|内容の難しさを強調して|その場を取り繕ってしまう|自分の苦労と比べてしまう|仕事の進め方|できた点|押し通してしまう|話し続けてしまう|確認する|若い頃|ような発言が多い。|ここが違う|知らない|無理だ|聞いてしまう|持ち出して|取り繕ってしまう|長くなる|必要以上に|細かく|否定してしまう|例の資料どうなった？|ことが多い。|一言だけで|会話を終える|自分の苦労|わかりました|提案しても|好きだな|確認日|うなずき|どうなった|事務的|話し続けて|話し始める|変わらない|ような|そんなことも|その場を|言いにくそうに)/gu;
 const tokens=text.split(protectedWords).flatMap((part,i)=>i%2?[part]:promptSegmenter?Array.from(promptSegmenter.segment(part),v=>v.segment):Array.from(part));
 const units=[];
 let opening='';
 for(const token of tokens){
  if(/^[「『（]+$/u.test(token)){opening+=token;continue;}
  if(!opening && units.length && (/^[。、？！？」』）…]+$/u.test(token) || /^(を|は|が|に|へ|も|の|と|で)$/u.test(token))) units[units.length-1]+=token;
  else units.push(opening+token);
  opening='';
 }
 if(opening) units.push(opening);
 let bold=false;
 let offset=0;
 return units.map(unit=>{
  const html=Array.from(unit,char=>{
   if(char==='『') bold=true;
   let glyph=escapeHtml(char);
   if(char==='、' && /[「『]/u.test(text[offset+1] || '')) glyph='<span class="tight-comma">、</span>';
   if((char==='「'||char==='『') && text[offset-1]==='、') glyph='<span class="tight-open">'+char+'</span>';
   offset+=char.length;
   const value=bold?'<strong>'+glyph+'</strong>':glyph;
   if(char==='』') bold=false;
   return value;
  }).join('').replaceAll('</strong><strong>','');
  return '<span class="keep">'+html+'</span>';
 }).join('<wbr>');
}
const promptSizers = questions.map(text =>
  '<span class="prompt-sizer" aria-hidden="true">'+promptMarkup(text)+'</span>'
).join('');
function question(){
 document.body.dataset.screen='question';
 const number=String(current+1).padStart(2,'0');
 const choices=[['Yes','はい','当てはまる'],['No','いいえ','当てはまらない']];
 app.innerHTML=`<section class="question flat-question"><div class="question-body">
 <header class="quiz-header"><span>1on1コミュニケーション診断</span><span>${number} / 21</span></header>
 <progress aria-label="診断の進捗" value="${current+1}" max="21"></progress>
 <p class="q-number">Q${number}</p><h1 class="prompt-slot"><span class="${current===12?'prompt-thirteen':''}">${promptMarkup(questions[current])}</span>${promptSizers}</h1>
 <div class="binary-choices">${choices.map(([value,label,sub])=>`<button type="button" data-answer="${value}" aria-pressed="${answers[current]===value}"><span class="choice-dot" aria-hidden="true"></span><b>${label}</b><span>${sub}</span></button>`).join('')}
 <button type="button" class="missing-answer" data-answer="missing" aria-pressed="${answers[current]==='missing'}"><span aria-hidden="true">⊖</span> 該当する場面がなかった</button></div>
 <hr class="answer-rule"><div class="guide-row"><span>最近3か月間の実際の行動で判断</span><details><summary><span aria-hidden="true">ⓘ</span> 回答の目安</summary><p class="answer-guide">「はい」：その場面の半数を超える機会で実際に行った。<br>「いいえ」：半数以下だった。<br>「該当する場面がなかった」：<span class="keep">経験がなく判断できない。</span></p></details></div>
 ${current?'<button id="back" class="back">← 前の質問</button>':''}</div></section>`;
 app.querySelectorAll('[data-answer]').forEach(button=>button.onclick=()=>{
  if(transitioning)return;
  transitioning=true;answers[current]=button.dataset.answer;app.querySelectorAll('[data-answer]').forEach(option=>option.setAttribute('aria-pressed',String(option===button)));
  setTimeout(()=>{transitioning=false;if(++current===questions.length)result();else question();},180);
 });
 app.querySelector('#back')?.addEventListener('click',()=>{if(!transitioning){current--;question();}});window.scrollTo(0,0);
}
function score(values){
 return reports.map((report,index)=>{
  const points=report.questions.filter(n=>values[n-1]===window.CONTENT.pointAnswers[n-1]).length;
  const count=report.questions.filter(n=>['Yes','No'].includes(values[n-1])).length;
  return {index,name:report.name,count,score:Math.round(points / report.questions.length * 100)};
 });
}
function rankingMarkup(scored){const valid=scored.filter(type=>type.score>0);if(!valid.length)return "";return `<section class="ranking"><h2>${valid.length<3||valid.some(x=>!x.score)?'参考順位':'あなたに出やすい傾向 <span class="top-label" aria-label="TOP3">'+vectorCrop(323,267,87,31)+'</span>'}</h2>${valid.length>=3&&valid.every(x=>x.score)?'<p class="rank-caption">参考順位</p>':''}${valid.slice(0,3).map((s,i)=>`<div class="rank rank-${valid.filter(x=>x.score>s.score).length}"><b aria-label="${1+valid.filter(x=>x.score>s.score).length}位">${vectorCrop(95,308+37.5*valid.filter(x=>x.score>s.score).length,37,37)}</b><strong>${s.name}</strong><div class="bar"><span style="--score:${s.score}%"></span></div><em>${s.score}<small>／100</small></em></div>`).join('')}${valid.length>3&&valid[2].score===valid[3].score?`<small>同率${1+valid.filter(x=>x.score>valid[2].score).length}位・ほか${valid.slice(3).filter(x=>x.score===valid[2].score).length}タイプ</small>`:''}</section>`;}
function exceptionSummary(valid,message,title){

 return `<div class="summary">${rankingMarkup(valid.length>1&&valid[0].score?valid:[])}<section class="focus"><h2><span>${title==="判定結果"?"今回の結果":"今回の<br>注目タイプ"}</span><strong>${title.replace("が","が<wbr>")}</strong></h2><div class="focus-copy"><p>${flowText(message)}</p></div></section></div>`;
}
const focusActions = {
 'しゃべりすぎ':'部下が話し終わる前に、自分の説明や経験談を始める。',
 'マウント':'部下の意見より、自分の経験や判断を優先する。',
 'ネガティブ':'部下の提案に対して、問題点や失敗のリスクを先に指摘する。',
 'マイペース':'部下の相談の途中で、別の用件に話を変える。',
 '過干渉':'部下に仕事を任せても、途中で細かく確認したり口を出したりする。',
 'カッコつけ':'十分に確認していないことを、知っているかのように説明する。',
 'ドライ':'部下が悩みを話したとき、気持ちに触れず、事実や対策の話に進む。'
};
function chooseFocus(leaders){
 document.body.dataset.screen='focus-choice';
 app.innerHTML=`<section class="focus-step"><p class="diagnosis-name">1on1コミュニケーション診断</p>
 <p class="focus-count">${leaders.length}つの傾向が同率1位でした</p>
 <h1 tabindex="-1">今回見直したい傾向を<span class="keep">1つ選んでください。</span></h1>
 <div class="focus-options">${leaders.map(type=>`<button data-focus="${type.index}">${guardedCopy(focusActions[type.name])}</button>`).join('')}
 <button data-focus="common">どれも同程度・判断できない</button></div>
 <button class="back" id="back">← 前の質問</button></section>`;
 app.querySelectorAll('[data-focus]').forEach(button=>button.onclick=()=>result(button.dataset.focus==='common'?'common':Number(button.dataset.focus)));
 app.querySelector('#back').onclick=()=>{current=questions.length-1;question();};
 window.scrollTo(0,0);
 app.querySelector('h1').focus({preventScroll:true});
}
function result(selection){
 const all = score(answers);
 const valid = all.filter(type => type.count === 3).sort((a,b)=>b.score-a.score||a.index-b.index);
 const unclear = valid.length === 0 || valid[0].score === 0;
 const leaders = unclear ? [] : valid.filter(type=>type.score===valid[0].score);
 if (leaders.length > 1 && selection === undefined) {
  chooseFocus(leaders);
  return;
 }
 const chosen = leaders.length === 1 ? leaders[0] : leaders.find(type => type.index === selection);
 const r = chosen ? reports[chosen.index] : null;
 const normal = Boolean(r);
 const shown=chosen?[chosen,...valid.filter(x=>x!==chosen&&x.score===chosen.score),...valid.filter(x=>x.score!==chosen.score)]:valid;
 const title = unclear ? '判定結果' : '複合傾向';
 const message = unclear ? '今回の回答では明確な傾向は見つかりませんでした。' : window.CONTENT.exceptions.tie;
 document.body.dataset.screen='result';
app.innerHTML=`<article class="sheet report${normal?'':' report-exception'}" data-type="${r?.name||''}">${header()}${normal?`<div class="summary">${rankingMarkup(shown)}<section class="focus"><h2><span>今回の<br>注目タイプ</span><strong>${r.name+'傾向'}</strong></h2><div class="focus-copy"><p>${r?strengthMarkup(r.strength):escapeHtml(message)}</p>${normal?`<img class="type-illustration" src="assets/types/chara${String(chosen.index+1).padStart(2,'0')}.png" width="400" height="400" alt="${escapeHtml(r.name)}タイプのイラスト">`:''}</div></section></div>`:exceptionSummary(valid,message,title)}
${normal&&leaders.length>1?`<p class="focus-note">同率1位の中から、あなたが選んだ傾向は<span class="keep">「${r.name}」です。</span></p>`:''}
${!normal&&leaders.length>1?`<section class="common-action"><h2>次の1on1で試せること</h2><ul>${leaders.map(type=>`<li>${flowText(reports[type.index].actions[0])}</li>`).join('')}</ul></section>`:''}
${r?`<div class="report-content"><section>${heading('01','こんな1on1、心当たりはありませんか？')}<div class="dialogue-columns"><div><div class="dialogue">${r.dialogue.map(([who,line,note])=>`<p data-who="${who}"><b>${who}</b><span>${flowText('「'+line+'」')}${note ? '<span class="reader-note">'+guardedCopy(note)+'</span>' : ''}</span></p>`).join('')}</div><div class="signs"><b><span class="sign-mark" aria-hidden="true">!</span><span>こんなこと<br>ありませんか？</span></b><ul class="signs-copy">${r.examples.map(item=>`<li>${flowText(item)}</li>`).join('')}</ul></div></div><div class="voice-column"><div class="voice"><div><b>部下の心の声（例）</b><p>${flowText(r.voice)}</p></div>${crop(1029,538,76,86,'部下のイラスト')}</div><div class="voice-arrow">${vectorCrop(796,631,47,24)}</div><p class="context">${flowText(r.signs)}</p></div></div></section><section>${heading('02','良かれと思った言動が、なぜ逆効果に？')}<p class="reason">${flowText(r.reason)}</p></section><section>${heading('03','次の1on1で試す、小さな変え方')}<ol class="actions">${r.actions.map((a,i)=>`<li>${vectorCrop([95,446,797][i],945,54,54,'action-number')}${actionMarkup(a)}${i?vectorCrop(411,959,16,26,'action-arrow'):''}</li>`).join('')}</ol><p class="next"><svg class="next-icon" aria-hidden="true" viewBox="165 1017 52 33"><image href="assets/reference-vector.svg" width="1191" height="1685"/></svg><span>${flowText(r.next)}</span></p></section><section>${heading('04','こんな1on1に変わっていったら？')}<div class="changes"><div><b><span>今</span></b><ul>${r.changes.map(x=>`<li>${flowText(x[0])}</li>`).join('')}</ul>${crop(455,1152,100,59)}</div>${vectorCrop(582,1138,31,56,'change-arrow')}<div><b><span>これから</span></b><ul>${r.changes.map(x=>`<li>${flowText(x[1])}</li>`).join('')}</ul>${crop(1029,1153,72,58)}</div></div><p class="next"><svg class="next-icon" aria-hidden="true" viewBox="165 1017 52 33"><image href="assets/reference-vector.svg" width="1191" height="1685"/></svg><span>${flowText(closingByType[r.name])}</span></p></section></div>`:''}

<section class="cta">${normal?heading('05','あなたの次の一歩を選んでください'):`<h2 class="exception-heading">${headingMarkup('あなたの次の一歩を選んでください')}</h2>`}<p>${flowText('この診断は「気づき」の入り口です。さらに学びたい方には、目的別の情報をご用意しています。')}</p><div class="cta-columns">${ctaCard('A')}${ctaCard('B')}</div></section><div class="result-tools"><button id="print" class="primary">結果をPDFで保存</button><button id="retry">もう一度診断する</button></div><footer class="footer"><p>${flowText('※診断は自己回答に基づくコミュニケーション傾向の目安です。部下の本音や職場の課題を断定するものではありません。')}</p><a href="https://nlpi.jp/" target="_blank" rel="noopener">株式会社アイエヌエー　https://nlpi.jp/</a></footer></article>`;
document.querySelectorAll('.voice .flow-text,.dialogue .flow-text').forEach(block=>{
 const walker=document.createTreeWalker(block,NodeFilter.SHOW_TEXT), nodes=[];
 while(walker.nextNode())if(walker.currentNode.data.includes('…'))nodes.push(walker.currentNode);
 for(const node of nodes){const fragment=document.createDocumentFragment();for(const part of node.data.split(/(…)/)){if(part==='…'){const dots=document.createElement('span');dots.className='ellipsis-glyph';dots.textContent=part;fragment.append(dots);}else fragment.append(part);}node.replaceWith(fragment);}
});
document.querySelector('#print').onclick=()=>window.print();document.querySelector('#retry').onclick=intro;window.scrollTo(0,0);}
app.innerHTML='<form class="gate"><h1>1on1コミュニケーション<span class="keep">診断</span></h1><label>パスワード<input type="password" required autofocus></label><button class="primary">表示する</button><p role="alert"></p></form>';
document.querySelector('form').onsubmit=e=>{e.preventDefault();if(document.querySelector('input').value==='vak')intro();else document.querySelector('[role=alert]').textContent='パスワードが違います。';};
// PDFの縮尺と余白はprint用CSSへ集約する。

// 表示原稿は変えず、語と助詞・語尾・閉じ記号をまとまりとして扱う。
const closingPhrases = new Map([
 "助言する前に|ひと呼吸待つと、|部下が自分の考えを|最後まで話せる|時間が生まれます。",
 "「どんな工夫をしたの？」|と先に聞くと、|部下が自分なりに考えて|選んだ理由を|話しやすくなります。",
 "「どんな条件なら試せそう？」|と聞くと、|部下の提案を|小さく試す方法を|一緒に考えられます。",
 "話題を変える前に|「この話はここまでで大丈夫？」|と聞くと、|部下がまだ|気になっていることを話せます。",
 "任せる範囲と|次の確認日を|一緒に決めると、|部下はそこまで|自分の判断で|進めやすくなります。",
 "わからないことを|「確認します」と伝えると、|部下も疑問を口にでき、|一緒に事実を|確かめられます。",
 "「不安に感じているんですね」|と受け止めると、|部下は何に|困っているのか、|その背景まで|話しやすくなります。"
].map(row=>{const words=row.split('|');return [words.join(''),words]}));
function guardedCopy(text){
 const phrases=closingPhrases.get(text);
 if(phrases)return phrases.map(phrase=>'<span class="break-guard">'+escapeHtml(phrase)+'</span>').join('');
 const chars=Array.from(String(text)), join=new Set(), open=/^[「『（【]$/u, close=/^[、。！？?!」』）】…ぁぃぅぇぉっゃゅょー]$/u;
 if(typeof Intl.Segmenter==='function'){
  const segmenter=guardedCopy.segmenter ||= new Intl.Segmenter('ja',{granularity:'word'});
  let pos=0;for(const item of segmenter.segment(String(text))){const n=Array.from(item.segment).length;
   if(item.isWordLike&&n<=7)for(let i=pos;i<pos+n-1;i++)join.add(i);
   if(pos>0&&/^(?:を|に|は|が|の|で|と|も|へ|から|まで|より|られる|れる)$/.test(item.segment))join.add(pos-1);
   pos+=n;
  }
 }
 for(const match of String(text).matchAll(/場合があります|支える力になります|事実や対策の話に進む|気になる|尋ねられる|活用できる|1つ確認する|心当たりのある行動|次の1on1|ひと呼吸待つと|最後まで話せる|時間が生まれます|選んだ理由を|話しやすくなります|小さく試す方法を|一緒に考えられます|気になっていることを|話せます|自分の判断で|進めやすくなります|口にでき|確かめられます|受け止めると|困っているのか|「了解」だけで終わる|優先してしまう|試してみましょう|ほかにもありますか？|もう少し聞かせて|どんな条件なら試せそう？|今日は何から話したい？|この話はここまでで大丈夫？|少し心配されすぎ|と伝える|普段の自分|だけで終わる|目安です|ものではありません|用件や進行|もう少し詳しく聞かせてください|知識のように|相談できる|困っている|指摘する前に|合わせるよう|ないのだけれど|参考にしてもらえるかな|大変だった点|必要なとき|確認の仕方|事前に決める|1つに決めつけず|1つ選んで|気持ちに触れず|不足点|部下の成長|何でも聞いて|疑い始める|これ以上話さなくてもいいのかな|大きいのでは|行動の速さ|優先される|話が移る|相談しやすくなる|話を変える|判断を優先する|できた点|1つ|安心して|少なく|進みやすい|維持しにくく|一区切りつく|参考にして|確かめてから|実践ガイドです|見つかりませんでした|振り返り|お答えください|1on1|ありません|これ以上|ご用意しています|したい|しにくい|します|しやすくなる|ためではなく|できた|もらえるかな|伝える力|出しづらくなる|実際|少なくなる|確かめながら|確認します|聞いたうえで|見つける力|見る力|言葉にする力|話したい|語る前に|進み具合|進めやすくなる|話し始める|足りない|確かめず|難しさ|かかっている|聞いてほしかった|不明なこと|事実・経験・推測|答えられる|聞かせてください|経験を|3つの|実践ガイド|確認させてね|説明できていない|相談しやすい|だけれど|大変だった|提案しづらい|困ったとき|増えやすい|探しやすい|伝えやすく|説明しやすく|空けずに|あります|効果的|落ち着いて|優位性|細かな|改善点|事実・経験|その場で|若い頃|確認して|事務的|ような発言|尋ねることが|提案しても|ことが多い|リスクを|そんなことも|『一言だけで|『自分の苦労|ことがあってね|説明し終えて|いないのに|ください|ありますか|聞いて|反応が|話さなくても|終わりやすい|試せそう|心配されすぎ|何度も|相談しやすく|注意深さは|1on1質問|判断を|確認日|最中でも|強調して|わかりました|どうなった|『間を|好きだな|という態度|発言が|ここが違う|うなずき|変わらない|話し続けて|その場を|生かしやすく|聞いてほしかった|聞かせて|確かめずに|管理職育成|学びたい|経験談|優先する|リスク|変える|知っている|触れず/gu)){
  for(let i=match.index;i<match.index+match[0].length-1;i++)join.add(i);
 }
 chars.forEach((c,i)=>{if(open.test(c))join.add(i);if(close.test(c)&&i)join.add(i-1);});
 for(const match of String(text).matchAll(/」(と一度尋ねる|と確認する|と尋ねる|と伝える)/gu)){
  join.delete(match.index);
  for(let i=match.index+1;i<match.index+match[0].length-1;i++)join.add(i);
 }
 let parts=[],part='';chars.forEach((c,i)=>{part+=c;if(!join.has(i)){parts.push(part);part='';}});if(part)parts.push(part);
 return parts.map(x=>Array.from(x).length>1?'<span class="break-guard">'+escapeHtml(x)+'</span>':escapeHtml(x)).join('');
}
function flowText(text){return '<span class="flow-text">'+guardedCopy(text)+'</span>';}
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

