/* 各結果を、診断と同一の描画処理で表示する閲覧ページ。 */
(()=>{
 let unlocked=false;
 const samples=reports.map((r,i)=>({id:'type-'+(i+1),name:r.name+'傾向',totals:Array.from({length:7},(_,j)=>i===j?15:9-j%3)})).concat([
  {id:'two',name:'2タイプが同率1位',totals:[12,12,9,8,7,6,5]},
  {id:'three',name:'3タイプが同率1位',totals:[12,12,12,8,7,6,5]},
  {id:'all-mid',name:'全タイプが同点（50点）',totals:Array(7).fill(9)},
  {id:'all-high',name:'全タイプが同点（100点）',totals:Array(7).fill(15)}
 ]);
 const pdf=s=>'client-review-20261110/pdf/'+s.id+'.pdf';
 function show(){
  if(!unlocked)return;
  document.querySelector('.review-nav')?.remove();
  const sample=samples.find(s=>s.id===location.hash.slice(1));
  if(sample){
   answers=Array(21).fill(1);
   [[1,8,15],[5,12,19],[3,10,17],[6,13,20],[2,9,16],[7,14,21],[4,11,18]].forEach((qs,i)=>{let rest=sample.totals[i]-3;qs.forEach(q=>{const n=Math.min(4,rest);answers[q-1]+=n;rest-=n;});});
   result();
   const nav=document.createElement('nav');nav.className='review-nav';nav.setAttribute('aria-label','レポートの操作');nav.innerHTML='<a href="#">← 一覧に戻る</a><span>'+escapeHtml(sample.name)+'</span><a href="'+pdf(sample)+'" target="_blank" rel="noopener">PDFを開く</a>';
   document.body.insertBefore(nav,app);
   document.body.classList.add('review-result');
  }else{
   document.body.dataset.screen='review';document.body.classList.remove('review-result');
   const list=xs=>'<ul class="review-list">'+xs.map(s=>'<li><a class="review-name" href="#'+s.id+'">'+escapeHtml(s.name)+'<span aria-hidden="true"> →</span></a><a class="review-pdf" href="'+pdf(s)+'" target="_blank" rel="noopener" aria-label="'+escapeHtml(s.name)+'のPDF">PDF</a></li>').join('')+'</ul>';
   app.innerHTML='<section class="review-index"><p class="review-title">1on1コミュニケーション診断</p><h1>結果レポート一覧</h1><p>タイプ名を選ぶと結果画面が開きます。</p><h2>7タイプの結果</h2>'+list(samples.slice(0,7))+'<h2>同率・同点の結果</h2>'+list(samples.slice(7))+'</section>';
  }
  window.scrollTo(0,0);
 }
 document.querySelector('form').onsubmit=e=>{e.preventDefault();if(document.querySelector('input').value==='vak'){unlocked=true;show();}else document.querySelector('[role=alert]').textContent='パスワードが違います。';};
 addEventListener('hashchange',show);
})();
