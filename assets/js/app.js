if (false) {
/* ============================================================
   SpineCare Connect — app.js  (FIXED VERSION)
   Router · 3-language loader · theme · search · renderer
   ============================================================ */
'use strict';

/* ---------------- Config & State ---------------- */
const LANGS = [
  { code:'en', label:'EN', name:'English' },
  { code:'hi', label:'हिं', name:'हिन्दी' },
  { code:'mr', label:'मरा', name:'मराठी' }
];
const DATA = {};            // DATA[lang] = {index, topics:{id:json}, order:[...]}
let state = { lang:'en', route:{view:'home'}, searchCache:null };
let disclaimerCache = {};   // ✅ FIX: disclaimers cache per language
let langSwitching = false;  // ✅ FIX: double language-switch race guard
let renderToken = 0;        // ✅ FIX: stale async render guard

/* ---------------- UI translations (interface only) ---------------- */
const T = {
en:{
  'nav.home':'Home','nav.learn':'Learn About SCI','nav.daily':'Daily Care','nav.nutrition':'Nutrition',
  'nav.complications':'Complications & Safety','nav.assistive':'Assistive Technology','nav.resources':'Resources',
  'nav.glossary':'Glossary','nav.myths':'Myths vs Facts','nav.emergency':'112',
  'hero.badge':'Educational Prototype · Not Clinically Reviewed',
  'hero.title':'Understanding Spinal Cord Injury, <span>Together.</span>',
  'hero.sub':'SpineCare Connect offers clear, source-based educational information about spinal cord injury (SCI), its complications, daily care and available support — for patients, families and caregivers.',
  'hero.cta1':'Explore Topics','hero.cta2':'About This Website',
  'card.read':'Read more',
  'topics.title':'Browse Topics','topics.sub':'Reliable, referenced information — organised topic by topic.',
  'search.title':'Search','search.ph':'Search topics… e.g. “pressure sores”, “bladder care”',
  'search.hint':'Type at least 2 letters to search all topics in the selected language.',
  'search.none':'No results found. Try a different word.',
  'search.results':'result(s)',
  'notice.title':'⚠️ Medical Information Disclaimer',
  'footer.links':'Quick Links','footer.refs':'References','footer.warning':'Warning Signs',
  'footer.disclaimerTitle':'Medical Disclaimer',
  'footer.about':'An educational project providing general information about spinal cord injury (SCI), related complications, daily living and available support — in English, Hindi and Marathi.',
  'footer.status':'Educational Prototype · Based on Available References · Not Clinically Reviewed',
  'footer.copy':'© SpineCare Connect — College educational project. Information only; not medical advice.',
  'article.back':'← All Topics','article.toc':'On this page','article.prev':'Previous','article.next':'Next',
  'article.refs':'References cited in this document',
  'missing.title':'This topic is not available in the selected language.',
  'missing.msg':'The article exists in other languages. You can read it there:',
  'missing.view':'View in','error.title':'Content could not be loaded',
  'error.msg':'The content file could not be read. If you opened this page directly (file://), please run a small local server instead:',
  'loading':'Loading…','theme.dark':'Switch to dark mode','theme.light':'Switch to light mode',
  'menu.open':'Open menu','menu.close':'Close menu','lang.label':'Select language',
  'child.of':'Part of','home':'Home'
},
hi:{
  'nav.home':'होम','nav.learn':'SCI के बारे में','nav.daily':'दैनिक देखभाल','nav.nutrition':'पोषण',
  'nav.complications':'जटिलताएं और सुरक्षा','nav.assistive':'सहायक तकनीक','nav.resources':'संसाधन',
  'nav.glossary':'शब्दावली','nav.myths':'भ्रम बनाम तथ्य','nav.emergency':'112',
  'hero.badge':'शैक्षिक प्रोटोटाइप · नैदानिक समीक्षा नहीं की गई',
  'hero.title':'स्पाइनल कॉर्ड इंजरी को समझें, <span>साथ मिलकर।</span>',
  'hero.sub':'SpineCare Connect स्पाइनल कॉर्ड इंजरी (SCI), इसकी जटिलताओं, दैनिक देखभाल और उपलब्ध सहायता के बारे में स्पष्ट, स्रोत-आधारित शैक्षिक जानकारी प्रदान करती है — मरीजों, परिवारों और केयरगिवरों के लिए।',
  'hero.cta1':'विषय देखें','hero.cta2':'इस वेबसाइट के बारे में',
  'card.read':'और पढ़ें',
  'topics.title':'विषय ब्राउज़ करें','topics.sub':'भरोसेमंद, संदर्भित जानकारी — विषय-वार व्यवस्थित।',
  'search.title':'खोजें','search.ph':'खोजें… जैसे “प्रेशर सोर”, “ब्लैडर देखभाल”',
  'search.hint':'चयनित भाषा के सभी विषयों में खोजने के लिए कम से कम 2 अक्षर लिखें।',
  'search.none':'कोई परिणाम नहीं मिला। कोई और शब्द आज़माएँ।',
  'search.results':'परिणाम',
  'notice.title':'⚠️ चिकित्सा संबंधी अस्वीकरण',
  'footer.links':'त्वरित लिंक','footer.refs':'संदर्भ','footer.warning':'चेतावनी संकेत',
  'footer.disclaimerTitle':'चिकित्सा अस्वीकरण',
  'footer.about':'स्पाइनल कॉर्ड इंजरी (SCI), संबंधित जटिलताओं, दैनिक जीवन और उपलब्ध सहायता के बारे में सामान्य जानकारी देने वाली एक शैक्षिक परियोजना — अंग्रेज़ी, हिन्दी और मराठी में।',
  'footer.status':'शैक्षिक प्रोटोटाइप · उपलब्ध संदर्भों पर आधारित · नैदानिक समीक्षा नहीं की गई',
  'footer.copy':'© SpineCare Connect — कॉलेज शैक्षिक परियोजना। केवल जानकारी के लिए; चिकित्सा सलाह नहीं।',
  'article.back':'← सभी विषय','article.toc':'इस पेज पर','article.prev':'पिछला','article.next':'अगला',
  'article.refs':'इस दस्तावेज़ में उद्धृत संदर्भ',
  'missing.title':'यह विषय चयनित भाषा में उपलब्ध नहीं है।',
  'missing.msg':'यह लेख अन्य भाषाओं में उपलब्ध है। आप वहाँ पढ़ सकते हैं:',
  'missing.view':'देखें','error.title':'सामग्री लोड नहीं हो सकी',
  'error.msg':'सामग्री फ़ाइल नहीं पढ़ी जा सकी। यदि आपने पेज सीधे (file://) खोला है, तो कृपया एक छोटा लोकल सर्वर चलाएँ:',
  'loading':'लोड हो रहा है…','theme.dark':'डार्क मोड करें','theme.light':'लाइट मोड करें',
  'menu.open':'मेनू खोलें','menu.close':'मेनू बंद करें','lang.label':'भाषा चुनें',
  'child.of':'इसका भाग','home':'होम'
},
mr:{
  'nav.home':'होम','nav.learn':'SCI विषयी माहिती','nav.daily':'दैनंदिन काळजी','nav.nutrition':'पोषण',
  'nav.complications':'गुंतागुंती व सुरक्षा','nav.assistive':'सहाय्यक तंत्रज्ञान','nav.resources':'संसाधने',
  'nav.glossary':'शब्दावली','nav.myths':'गैरसमज व तथ्ये','nav.emergency':'112',
  'hero.badge':'शैक्षणिक प्रोटोटाइप · वैद्यकीय पुनरावलोकन नाही',
  'hero.title':'स्पाइनल कॉर्ड इन्ज्युरी समजून घेऊया, <span>एकत्र।</span>',
  'hero.sub':'SpineCare Connect स्पाइनल कॉर्ड इन्ज्युरी (SCI), त्यांच्या गुंतागुंती, दैनंदिन काळजी आणि उपलब्ध पाठिंब्याबद्दल स्पष्ट, स्रोत-आधारित शैक्षणिक माहिती देते — रुग्ण, कुटुंबे आणि काळजीवाहूंसाठी.',
  'hero.cta1':'विषय पहा','hero.cta2':'या संकेतस्थळाविषयी',
  'card.read':'अधिक वाचा',
  'topics.title':'विषय पहा','topics.sub':'विश्वासार्ह, संदर्भित माहिती — विषयानुसार आयोजित.',
  'search.title':'शोधा','search.ph':'शोधा… उदा. “बेडसोर”, “मूत्राशय काळजी”',
  'search.hint':'निवडलेल्या भाषेतील सर्व विषयांमध्ये शोधण्यासाठी किमान 2 अक्षरे टाइप करा.',
  'search.none':'कोणताही निकाल सापडला नाही. दुसरा शब्द वापरून पहा.',
  'search.results':'निकाल',
  'notice.title':'⚠️ वैद्यकीय माहितीविषयी अस्वीकरण',
  'footer.links':'जलद दुवे','footer.refs':'संदर्भ','footer.warning':'धोक्याची लक्षणे',
  'footer.disclaimerTitle':'वैद्यकीय अस्वीकरण',
  'footer.about':'स्पाइनल कॉर्ड इन्ज्युरी (SCI), संबंधित गुंतागुंत, दैनंदिन जीवन आणि उपलब्ध पाठिंब्याबद्दल सामान्य माहिती देणारा एक शैक्षणिक प्रकल्प — इंग्रजी, हिंदी आणि मराठीत.',
  'footer.status':'शैक्षणिक प्रोटोटाइप · उपलब्ध संदर्भांवर आधारित · वैद्यकीय पुनरावलोकन नाही',
  'footer.copy':'© SpineCare Connect — महाविद्यालयीन शैक्षणिक प्रकल्प. केवळ माहितीसाठी; वैद्यकीय सल्ला नाही.',
  'article.back':'← सर्व विषय','article.toc':'या पानावर','article.prev':'मागील','article.next':'पुढील',
  'article.refs':'या दस्तावेज़ातील संदर्भ',
  'missing.title':'हा विषय निवडलेल्या भाषेत उपलब्ध नाही.',
  'missing.msg':'हा लेख इतर भाषांमध्ये उपलब्ध आहे. तिथे वाचू शकता:',
  'missing.view':'पहा','error.title':'माहिती लोड करता आली नाही',
  'error.msg':'माहिती फाइल वाचता आली नाही. तुम्ही पान थेट (file://) उघडले असेल तर कृपया एक छोटा लोकल सर्व्हर चालवा:',
  'loading':'लोड होत आहे…','theme.dark':'डार्क मोड करा','theme.light':'लाइट मोड करा',
  'menu.open':'मेनू उघडा','menu.close':'मेनू बंद करा','lang.label':'भाषा निवडा',
  'child.of':'याचा भाग','home':'होम'
}};

/* ---------------- Helpers ---------------- */
const $  = (s,c)=> (c||document).querySelector(s);
const $$ = (s,c)=> Array.from((c||document).querySelectorAll(s));
const esc = s => String(s??'').replace(/[&<>"']/g, m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const t = k => (T[state.lang] && T[state.lang][k]) || T.en[k] || k;
const setHTML = (id,html) => { const n=$('#'+id); if(n) n.innerHTML=html; };

async function fetchJSON(url){
  const res = await fetch(url);
  if(!res.ok) throw new Error('HTTP '+res.status+' for '+url);
  const json = await res.json();
  if(!json || typeof json!=='object') throw new Error('Invalid JSON: '+url);
  return json;
}

/* ---------------- Theme ---------------- */
/* ✅ FIX: saved theme was never restored on reload → restore immediately */
(function restoreTheme(){
  try{
    const th = localStorage.getItem('scc-theme');
    if(th==='dark' || th==='light') document.documentElement.setAttribute('data-theme', th);
  }catch(e){}
})();

function applyThemeLabel(){
  const cur = document.documentElement.getAttribute('data-theme');
  const btn = $('#themeToggle');
  if(!btn) return;                              // ✅ FIX: null guard
  btn.textContent = cur==='dark' ? '☀️' : '🌙';
  btn.setAttribute('aria-label', cur==='dark' ? t('theme.light') : t('theme.dark'));
}
const themeBtn = $('#themeToggle');
if(themeBtn){                                   // ✅ FIX: script died if button was missing
  themeBtn.addEventListener('click',()=>{
    const next = document.documentElement.getAttribute('data-theme')==='dark'?'light':'dark';
    document.documentElement.setAttribute('data-theme',next);
    try{localStorage.setItem('scc-theme',next)}catch(e){}
    applyThemeLabel();
  });
}

/* ---------------- Language ---------------- */
function setLangButtons(){
  $$('.lang-btn').forEach(b=>{
    const on = b.dataset.lang===state.lang;
    b.setAttribute('aria-pressed',on);
    b.classList.toggle('active',on);
  });
  document.documentElement.lang = state.lang;
}
async function loadLanguage(lang){
  if(DATA[lang]) return DATA[lang];
  const index = await fetchJSON(`${lang}/index.json`);
  const topics = {};
  const order = [];
  (index.topics||[]).forEach(tp=>{
    order.push({id:tp.id,file:tp.file,title:tp.title,parent:null});
    (tp.children||[]).forEach(ch=>order.push({id:ch.id,file:ch.file,title:ch.title,parent:tp.id}));
  });
  /* ✅ FIX: topics were loaded ONE-BY-ONE (await inside loop) → very slow.
     Now all files load in parallel. */
  const results = await Promise.allSettled(order.map(o=>fetchJSON(`${lang}/${o.file}`)));
  results.forEach((r,i)=>{
    if(r.status==='fulfilled') topics[order[i].id]=r.value;
    else console.warn('Missing topic file:',lang,order[i].id);
  });
  DATA[lang] = {index,topics,order};
  return DATA[lang];
}

/* ---------------- Router ---------------- */
function parseHash(){
  const h = location.hash.replace(/^#/,'') || '/home';
  const [path,query] = h.split('?');
  const parts = path.split('/').filter(Boolean);
  if(parts[0]==='topic' && parts[1]) return {view:'topic',id:parts[1],section:query?query.replace('s=',''):null};
  return {view:'home'};
}
window.addEventListener('hashchange',()=>{
  /* ✅ FIX: plain anchors like #topics / #search triggered a full re-render,
     which scrolled back to top → hero button looked dead. Now they smooth-scroll. */
  if(!location.hash.startsWith('#/')){
    const el = document.getElementById(location.hash.slice(1));
    if(el){ el.scrollIntoView({behavior:'smooth'}); return; }
  }
  state.route = parseHash();
  render();
});

/* ---------------- Render: Home ---------------- */
function homeView(){
  const d = DATA[state.lang];
  const top = (d.index.topics||[]);
  const cards = top.map(tp=>{
    const topic = d.topics[tp.id];
    const desc = firstDescription(topic) || esc(tp.title);
    return cardHTML(tp.id, tp.title, desc, false);
  }).join('');
  const childCards = [];
  top.forEach(tp=>(tp.children||[]).forEach(ch=>{
    const topic = d.topics[ch.id];
    childCards.push(cardHTML(ch.id, ch.title, firstDescription(topic)||esc(ch.title), true, tp.title));
  }));
  return `
  <section class="hero">
    <div class="hero-inner">
      <span class="status-pill">🔒 ${esc(t('hero.badge'))}</span>
      <h1>${t('hero.title')}</h1>
      <p>${esc(t('hero.sub'))}</p>
      <div class="hero-actions">
        <a class="btn btn-primary" href="#topics">${esc(t('hero.cta1'))}</a>
        <a class="btn btn-outline" href="#/topic/content-governance">${esc(t('hero.cta2'))}</a>
      </div>
    </div>
  </section>

  <section class="section wrap" id="search">
    <div class="section-head"><h2>🔍 ${esc(t('search.title'))}</h2></div>
    <div class="search-box" id="searchBox">
      <label class="skip" for="searchInput">${esc(t('search.title'))}</label>
      <input id="searchInput" type="search" placeholder="${esc(t('search.ph'))}"
        autocomplete="off" aria-describedby="searchHint">
      <button class="icon-btn clear-btn" id="searchClear" aria-label="Clear search">✕</button>
    </div>
    <p id="searchHint" style="font-size:13px;color:var(--muted);margin-top:8px">${esc(t('search.hint'))}</p>
    <div class="results" id="searchResults" role="status"></div>
  </section>

  <section class="section wrap" id="topics">
    <div class="section-head">
      <h2>${esc(t('topics.title'))}</h2>
      <p>${esc(t('topics.sub'))}</p>
    </div>
    <div class="cards">${cards}</div>
    ${childCards.length?`
      <div class="section-head" style="margin-top:44px">
        <h2 style="font-size:20px">${esc(T[state.lang]['nav.complications'])}</h2>
      </div>
      <div class="cards">${childCards.join('')}</div>`:''}
  </section>

  <section class="section wrap" id="notice">
    <div class="notice" id="homeNotice">
      <h3>${esc(t('notice.title'))}</h3>
      <div id="noticeBody"></div>
    </div>
  </section>`;
}
function cardHTML(id,title,desc,isChild,parentTitle){
  const icons = ICONS[id]||'📄';
  return `<a class="card${isChild?' is-child':''}" href="#/topic/${id}">
    <span class="ic">${icons}</span>
    ${isChild?`<span class="badge">${esc(t('child.of'))}: ${esc(parentTitle||'')}</span>`:''}
    <h3>${esc(title)}</h3>
    <p>${desc}</p>
    <span class="read">${esc(t('card.read'))} →</span>
  </a>`;
}
const ICONS = {
  'home':'🏠','disclaimer':'⚠️','content-governance':'🛡️',
  'sci-basics-and-initial-care':'🩺','body-functions':'🫀','pressure-injuries':'🛏️',
  'neurogenic-bladder-and-uti':'🚽','neurogenic-bowel-dysfunction':'🍽️','autonomic-dysreflexia':'⚡',
  'secondary-complications-5-13':'🩹','rehabilitation':'💪','nutrition-and-metabolic-management':'🥗',
  'daily-care-home-safety-and-caregiver-support':'🏡','independence-and-assistive-technology':'🦽',
  'triage-guidance':'🚨','myths-and-facts':'❓','glossary':'📖','references':'📚'
};
function firstDescription(topic){
  if(!topic||!topic.sections) return '';
  for(const s of topic.sections) for(const b of (s.content||[])){
    if(b.type==='paragraph' && b.text) return esc(b.text.length>130?b.text.slice(0,127)+'…':b.text);
  }
  return '';
}

/* ---------------- Render: Topic / Article ---------------- */
function parentOf(id){
  const d = DATA[state.lang];
  const e = d.order.find(o=>o.id===id);
  return (e && e.parent) ? d.order.find(o=>o.id===e.parent) : null;
}
function topicView(id){
  const d = DATA[state.lang];
  const topic = d.topics[id];
  if(!topic) return missingView(id);
  const sections = (topic.sections||[]).map((s,i)=>{
    const sid = s.id || ('sec-'+i);
    return {sid,heading:s.heading,html:renderBlocks(s.content||[])};
  });
  const tocLinks = sections.map(s=>`<a href="#/topic/${id}?s=${s.sid}" data-sid="${s.sid}">${esc(s.heading||'')}</a>`).join('');
  const secsHTML = sections.map(s=>`
    <section id="${s.sid}">
      ${s.heading?`<h2>${esc(s.heading)}</h2>`:''}
      ${s.html}
    </section>`).join('');
  const refsHTML = renderCitations(topic.references||[]);
  const {prev,next} = neighbours(id);
  /* ✅ FIX: breadcrumb hardcoded "Complications & Safety" — now shows real parent title */
  const parent = parentOf(id);
  const parentLink = parent
    ? `<a class="crumb" href="#/topic/${parent.id}">← ${esc(parent.title)}</a>` : '';
  return `
  ${spineRailHTML(sections)}
  <div class="wrap">
    <div class="article-layout has-toc">
      <aside class="toc" aria-label="${esc(t('article.toc'))}">
        <div class="toc-inner">
          <h4>${esc(t('article.toc'))}</h4>
          <a href="#/home">${esc(t('article.back'))}</a>
          ${tocLinks}
        </div>
      </aside>
      <article class="article">
        ${parentLink}
        <h1>${ICONS[id]?ICONS[id]+' ':''}${esc(topic.title)}</h1>
        <p class="meta">🔒 ${esc(t('hero.badge'))}</p>
        <details class="mobile-toc">
          <summary>${esc(t('article.toc'))}</summary>
          ${tocLinks}
        </details>
        ${secsHTML}
        ${refsHTML}
        <div class="article-nav">
          ${prev?`<a href="#/topic/${prev.id}"><span class="dir">← ${esc(t('article.prev'))}</span>${esc(prev.title)}</a>`:'<span></span>'}
          ${next?`<a href="#/topic/${next.id}" style="text-align:right"><span class="dir">${esc(t('article.next'))} →</span>${esc(next.title)}</a>`:''}
        </div>
      </article>
    </div>
  </div>`;
}
function renderBlocks(blocks){
  return blocks.map(b=>{
    switch(b.type){
      case 'paragraph': return `<p>${esc(b.text)}</p>`;
      case 'subheading': return `<h3 class="subheading">${esc(b.text)}</h3>`;
      case 'list': return `<ul>${listItems(b.items)}</ul>`;
      case 'numbered_list': return `<ol>${listItems(b.items)}</ol>`;
      case 'table': return tableHTML(b);
      case 'note': return callout('note','💡',b.text);
      case 'warning': return callout('warning','🚨',b.text);
      case 'disclaimer': return callout('disclaimer','⚠️',b.text);
      case 'diagram': return diagramHTML(b);
      case 'glossary_entry': return `<dl class="glossary-item"><dt>${esc(b.term)}</dt><dd>${esc(b.definition)}</dd></dl>`;
      default:
        if(b && b.text) return `<p>${esc(b.text)}</p>`;
        return '';
    }
  }).join('');
}
function listItems(items){
  return (items||[]).map(it=>{
    if(typeof it==='string') return `<li>${esc(it)}</li>`;
    const sub = (it.sub_items&&it.sub_items.length)
      ? `<ul>${it.sub_items.map(s=>`<li>${esc(typeof s==='string'?s:(s.text||''))}</li>`).join('')}</ul>`:'';
    return `<li><strong>${esc(it.text)}</strong>${sub}</li>`;
  }).join('');
}
function tableHTML(b){
  const head=(b.columns||[]).map(c=>`<th scope="col">${esc(c)}</th>`).join('');
  const rows=(b.rows||[]).map(r=>`<tr>${(r||[]).map(c=>`<td>${esc(c)}</td>`).join('')}</tr>`).join('');
  return `<table><thead><tr>${head}</tr></thead><tbody>${rows}</tbody></table>`;
}
function callout(kind,icon,text){
  return `<div class="callout ${kind}"><span class="co-ic" aria-hidden="true">${icon}</span><p>${esc(text)}</p></div>`;
}
function diagramHTML(b){
  const desc = b.description?`<p style="color:var(--muted);font-size:13.5px">${esc(b.description)}</p>`:'';
  return `${desc}<pre class="diagram" dir="ltr">${esc(b.raw_text||'')}</pre>`;
}
function renderCitations(refs){
  if(!refs.length) return '';
  return `<section><h2>📚 ${esc(t('article.refs'))}</h2><ol>${
    refs.map(r=>`<li><strong>${esc(r.group||'')}</strong> — ${esc(r.citation||'')}</li>`).join('')
  }</ol></section>`;
}
function neighbours(id){
  const order = DATA[state.lang].order;
  const i = order.findIndex(o=>o.id===id);
  return { prev: order[i-1]||null, next: order[i+1]||null };
}
function spineRailHTML(sections){
  if(sections.length<2) return '';
  const dots = sections.map((s,i)=>
    `<button class="dot" style="top:${(i/(sections.length-1))*100}%" data-target="${s.sid}"
      aria-label="${esc(s.heading||('Section '+(i+1)))}"></button>`).join('');
  return `<div class="spine-rail" aria-hidden="false">${dots}</div>`;
}
function missingView(id){
  const d = DATA[state.lang];
  const known = d.order.find(o=>o.id===id);
  const candidates = LANGS.filter(l=>l.code!==state.lang).map(l=>{
    const localTitle = (DATA[l.code]&&DATA[l.code].order.find(o=>o.id===id));
    const title = localTitle ? localTitle.title : (known?known.title:id);
    return `<a class="btn btn-outline" href="#/topic/${id}" data-forcelang="${l.code}">${esc(t('missing.view'))} ${l.name}</a>`;
  }).join('');
  return `<div class="wrap"><div class="state-card">
    <div class="big">🌐</div>
    <h2>${esc(t('missing.title'))}</h2>
    <p>${esc(t('missing.msg'))}</p>
    <div class="row">${candidates}</div>
  </div></div>`;
}
function errorView(err){
  const isFile = location.protocol==='file:';
  const hint = isFile
    ? `<p style="text-align:left;display:inline-block"><code>python -m http.server 5500</code><br>
       <code>php -S localhost:5500</code><br>
       ${esc('VS Code → Live Server extension → "Go Live"')}</p>`
    : `<p><code>${esc(err&&err.message||'Network error')}</code></p>`;
  return `<div class="wrap"><div class="state-card">
    <div class="big">📡</div>
    <h2>${esc(t('error.title'))}</h2>
    <p>${esc(t('error.msg'))}</p>
    ${hint}
  </div></div>`;
}

/* ---------------- Search ---------------- */
function collectText(blocks,out){
  (blocks||[]).forEach(b=>{
    if(b.text) out.push(b.text);
    if(b.term) out.push(b.term+' — '+(b.definition||''));
    if(b.items) b.items.forEach(it=>{
      if(typeof it==='string') out.push(it);
      else{ if(it.text) out.push(it.text); (it.sub_items||[]).forEach(s=>out.push(typeof s==='string'?s:(s.text||''))); }
    });
    if(b.rows) b.rows.forEach(r=>out.push(r.join(' ')));
  });
}
function buildSearchIndex(){
  const d = DATA[state.lang];
  if(state.searchCache && state.searchCache.lang===state.lang) return state.searchCache.index;
  const index=[];
  d.order.forEach(o=>{
    const topic=d.topics[o.id]; if(!topic) return;
    (topic.sections||[]).forEach(s=>{
      const texts=[]; collectText(s.content,texts);
      index.push({id:o.id,title:o.title,heading:s.heading||'',text:texts.join(' ')});
    });
    (topic.references||[]).forEach(r=>index.push({id:o.id,title:o.title,heading:'📚',text:(r.group||'')+' '+(r.citation||'')}));
  });
  state.searchCache={lang:state.lang,index};
  return index;
}
function doSearch(q){
  const box=$('#searchResults'); if(!box) return;
  q=q.trim();
  if(q.length<2){ box.innerHTML=`<div class="empty-state">${esc(t('search.hint'))}</div>`; return; }
  const needle=q.toLowerCase();
  const hits=buildSearchIndex().filter(it=>
    it.title.toLowerCase().includes(needle)||
    it.heading.toLowerCase().includes(needle)||
    it.text.toLowerCase().includes(needle)).slice(0,12);
  if(!hits.length){ box.innerHTML=`<div class="empty-state">🔍 ${esc(t('search.none'))}</div>`; return; }
  const label=`${hits.length} ${esc(t('search.results'))} — “${esc(q)}”`;
  const mark=(txt)=>{
    const safe=esc(txt);
    try{
      const re=new RegExp('('+esc(q).replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+')','ig');
      return safe.replace(re,'<mark>$1</mark>');
    }catch(e){ return safe; }
  };
  box.innerHTML=`<p style="font-size:12.5px;color:var(--muted)">${label}</p>`+hits.map(h=>{
    let snippet='';
    const pos=h.text.toLowerCase().indexOf(needle);
    if(pos>-1){ const start=Math.max(0,pos-55); snippet=esc(h.text.slice(start,start+150))+'…'; }
    else{ snippet=esc(h.text.slice(0,120))+'…'; }   /* ✅ FIX: fallback snippet */
    return `<a class="result" href="#/topic/${h.id}"><h4>${mark(h.title)} — ${mark(h.heading)}</h4><p>${snippet}</p></a>`;
  }).join('');
}

/* ---------------- Static bits (footer disclaimer, notice) ---------------- */
async function loadDisclaimers(){
  const lang = state.lang;
  /* ✅ FIX: cached per language (was re-fetched on every home render) */
  if(disclaimerCache[lang]){
    setHTML('footerDisclaimer', disclaimerCache[lang].footer);
    setHTML('noticeBody', disclaimerCache[lang].notice);
    return;
  }
  try{
    const d = await fetchJSON(`${lang}/disclaimer.json`);
    const texts=[];
    (d.sections||[]).forEach(s=>(s.content||[]).forEach(b=>{ if(b.text) texts.push(b.text); }));
    const joined = texts.map(x=>`<p style="margin-top:6px">${esc(x)}</p>`).join('');
    const footer = texts[0]?esc(texts[0].slice(0,220))+(texts[0].length>220?'…':''):'';
    disclaimerCache[lang]={footer,notice:joined};
    setHTML('footerDisclaimer', footer);
    setHTML('noticeBody', joined);
  }catch(e){ console.warn('disclaimer load failed',e); }
}

/* ---------------- Global render ---------------- */
function render(){
  const token = ++renderToken;   /* ✅ FIX: ignore stale async results after fast navigation */
  const app=$('#app');
  closeMenu();
  window.scrollTo({top:0,behavior:'auto'});
  if(state.route.view==='home'){
    app.innerHTML = homeView();
    bindHome();
    document.title = 'SpineCare Connect — '+t('hero.title').replace(/<[^>]+>/g,'');
  }else{
    const {id,section}=state.route;
    app.innerHTML = `<div class="loading"><div class="spinner"></div>${esc(t('loading'))}</div>`;
    const d=DATA[state.lang];
    if(d && d.topics[id]){
      app.innerHTML = topicView(id);
      bindArticle(id,section);
      document.title = (d.topics[id].title||'')+' · SpineCare Connect';
    }else{
      loadLanguage(state.lang).then(()=>{
        if(token!==renderToken) return;          /* ✅ FIX */
        const dd=DATA[state.lang];
        if(dd.topics[id]){
          app.innerHTML = topicView(id);
          bindArticle(id,section);
          document.title = (dd.topics[id].title||'')+' · SpineCare Connect';
        }else{
          app.innerHTML = missingView(id);
        }
      }).catch(e=>{ if(token===renderToken) app.innerHTML=errorView(e); });
    }
  }
  /* ✅ FIX: disclaimer was ONLY loaded on home → footer empty on direct topic links */
  loadDisclaimers();
  highlightNav();
  applyThemeLabel();
}
function bindHome(){
  const inp=$('#searchInput'), box=$('#searchBox');
  if(inp){
    inp.addEventListener('input',()=>{ box.classList.toggle('has-text',!!inp.value); doSearch(inp.value); });
    $('#searchClear').addEventListener('click',()=>{ inp.value=''; box.classList.remove('has-text'); doSearch(''); inp.focus(); });
  }
  /* ✅ FIX: in-page anchor buttons (#topics etc.) — smooth scroll even if hash is already set */
  $$('a[href^="#"]:not([href^="#/"])').forEach(a=>{
    a.addEventListener('click',e=>{
      const el=document.getElementById(a.getAttribute('href').slice(1));
      if(el){ e.preventDefault(); el.scrollIntoView({behavior:'smooth'}); }
    });
  });
  /* ✅ FIX: "/" shortcut was re-bound on EVERY home render (listener leak).
     Now bound exactly once on document. */
  if(!bindHome._slashBound){
    bindHome._slashBound = true;
    document.addEventListener('keydown',e=>{
      const si=$('#searchInput');
      if(e.key==='/' && si && document.activeElement!==si){ e.preventDefault(); si.focus(); }
    });
  }
}
function bindArticle(id,section){
  // spine rail
  const rail=$('.spine-rail');
  if(rail){
    const dots=$$('.dot',rail);
    dots.forEach(dot=>dot.addEventListener('click',()=>{
      const el=document.getElementById(dot.dataset.target);
      if(el) el.scrollIntoView({behavior:'smooth',block:'start'});
    }));
    const secs=$$('.article section[id]');
    if('IntersectionObserver' in window && secs.length){
      const io=new IntersectionObserver(entries=>{
        entries.forEach(en=>{
          if(en.isIntersecting){
            dots.forEach(d=>d.classList.toggle('on',d.dataset.target===en.target.id));
          }
        });
      },{rootMargin:'-30% 0px -55% 0px'});
      secs.forEach(s=>io.observe(s));
      dots[0]&&dots[0].classList.add('on');
    }
  }
  // deep-link to section
  if(section){
    const el=document.getElementById(section);
    if(el){ setTimeout(()=>{ el.scrollIntoView({behavior:'smooth',block:'start'});
      el.classList.add('flash'); setTimeout(()=>el.classList.remove('flash'),2000); },120); }
  }
  // ✅ FIX: TOC links had an EMPTY click handler — clicking the same section
  // twice did nothing (hash doesn't change → no hashchange → no scroll).
  $$('.toc a[data-sid], .mobile-toc a[data-sid]').forEach(a=>{
    a.addEventListener('click',()=>{
      if(location.hash === a.getAttribute('href')){
        const el=document.getElementById(a.dataset.sid);
        if(el) el.scrollIntoView({behavior:'smooth',block:'start'});
      }
    });
  });
}
function highlightNav(){
  const d = DATA[state.lang];
  let id = state.route.view==='topic' ? state.route.id : 'home';
  const map={ 'home':'home','sci-basics-and-initial-care':'learn',
    'daily-care-home-safety-and-caregiver-support':'daily',
    'nutrition-and-metabolic-management':'nutrition','body-functions':'complications',
    'independence-and-assistive-technology':'assistive','references':'resources',
    'glossary':'glossary','myths-and-facts':'myths' };
  let key = map[id];
  /* ✅ FIX: child topics (pressure-injuries, autonomic-dysreflexia, etc.) had no
     nav highlight → climb to parent and use its key */
  if(!key && d){
    let entry = d.order.find(o=>o.id===id);
    let guard = 0;
    while(entry && entry.parent && !key && guard++ < 5){
      entry = d.order.find(o=>o.id===entry.parent);
      if(entry) key = map[entry.id];
    }
  }
  $$('.main-nav a').forEach(a=>{
    if(a.dataset.nav===key) a.setAttribute('aria-current','page');
    else a.removeAttribute('aria-current');
  });
}

/* ---------------- Header controls ---------------- */
function closeMenu(){
  const nav=$('#mainNav');
  if(nav && nav.classList.contains('open')) toggleMenu(false);   // ✅ FIX: null guard
}
function toggleMenu(force){
  const nav=$('#mainNav'), btn=$('#menuToggle');
  if(!nav || !btn) return;                                       // ✅ FIX: null guard
  const open = force!==undefined?force:!nav.classList.contains('open');
  nav.classList.toggle('open',open);
  btn.setAttribute('aria-expanded',open);
  btn.setAttribute('aria-label',open?t('menu.close'):t('menu.open'));
  btn.textContent=open?'✕':'☰';
}
const menuBtn = $('#menuToggle');
if(menuBtn){                                                    // ✅ FIX: null guard
  menuBtn.addEventListener('click',()=>toggleMenu());
}

/* ---------------- Language switching (unified) ---------------- */
async function switchLang(lang){
  /* ✅ FIX: one function, guards against same-lang + double-click race,
     and errors now show the error view instead of failing silently */
  if(langSwitching) return;
  if(!LANGS.some(l=>l.code===lang) || lang===state.lang) return;
  langSwitching = true;
  state.lang = lang;
  try{localStorage.setItem('scc-lang',lang)}catch(e){}
  setLangButtons();
  state.searchCache = null;
  const app=$('#app');
  app.innerHTML=`<div class="loading"><div class="spinner"></div>${esc(t('loading'))}</div>`;
  try{
    await loadLanguage(lang);
    state.route = parseHash();
    render();
  }catch(e){
    app.innerHTML = errorView(e);
  }finally{
    langSwitching = false;
  }
}
 $$('.lang-btn').forEach(b=>b.addEventListener('click',()=>switchLang(b.dataset.lang)));

document.addEventListener('click',e=>{
  const fl=e.target.closest('[data-forcelang]');
  if(fl){ e.preventDefault(); switchLang(fl.dataset.forcelang); return; }
  const sl=e.target.closest('[data-setlang]');
  if(sl){ e.preventDefault(); switchLang(sl.dataset.setlang); return; }
  if(e.target.closest('.main-nav a')) closeMenu();
});

/* ---------------- Emergency panel ---------------- */
(function(){
  const btn=$('#emergencyBtn'), panel=$('#emergencyPanel');
  if(!btn||!panel) return;
  function close(){ panel.hidden=true; btn.setAttribute('aria-expanded','false'); }
  btn.addEventListener('click',e=>{
    e.stopPropagation();
    panel.hidden=!panel.hidden;
    btn.setAttribute('aria-expanded',String(!panel.hidden));
  });
  document.addEventListener('click',e=>{
    if(!panel.hidden && !e.target.closest('.emergency-wrap')) close();
  });
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape' && !panel.hidden){ close(); btn.focus(); }
  });
  panel.addEventListener('click',()=>close());
})();
}

/* ============================================================
   SpineCare Connect — app.js  (FIXED VERSION v2)
   Router · 3-language loader · theme · search · renderer
   + Emergency modal · i18n walker · progress bar · back-to-top
   ============================================================ */
'use strict';

/* ---------------- Config & State ---------------- */
const LANGS = [
  { code:'en', label:'EN', name:'English' },
  { code:'hi', label:'हिं', name:'हिन्दी' },
  { code:'mr', label:'मरा', name:'मराठी' }
];
const DATA = {};            // DATA[lang] = {index, topics:{id:json}, order:[...]}
let state = { lang:'en', route:{view:'home'}, searchCache:null };
let disclaimerCache = {};   // ✅ disclaimers cached per language
let langSwitching = false;  // ✅ double language-switch race guard
let renderToken = 0;        // ✅ stale async render guard

/* ---------------- UI translations (interface only) ---------------- */
const T = {
en:{
  'nav.home':'Home','nav.learn':'Learn About SCI','nav.daily':'Daily Care','nav.nutrition':'Nutrition',
  'nav.complications':'Complications & Safety','nav.assistive':'Assistive Technology','nav.resources':'Resources',
  'nav.glossary':'Glossary','nav.myths':'Myths vs Facts','nav.emergency':'Emergency',
  'hero.badge':'Educational Prototype · Not Clinically Reviewed',
  'hero.title':'Understanding Spinal Cord Injury, <span>Together.</span>',
  'hero.sub':'SpineCare Connect offers clear, source-based educational information about spinal cord injury (SCI), its complications, daily care and available support — for patients, families and caregivers.',
  'hero.cta1':'Explore Topics','hero.cta2':'About This Website',
  'card.read':'Read more',
  'topics.title':'Browse Topics','topics.sub':'Reliable, referenced information — organised topic by topic.',
  'search.title':'Search','search.ph':'Search topics… e.g. “pressure sores”, “bladder care”',
  'search.hint':'Type at least 2 letters to search all topics in the selected language.',
  'search.none':'No results found. Try a different word.',
  'search.results':'result(s)',
  'notice.title':'⚠️ Medical Information Disclaimer',
  'footer.links':'Quick Links','footer.refs':'References','footer.warning':'Warning Signs',
  'footer.disclaimerTitle':'Medical Disclaimer',
  'footer.about':'An educational project providing general information about spinal cord injury (SCI), related complications, daily living and available support — in English, Hindi and Marathi.',
  'footer.status':'Educational Prototype · Based on Available References · Not Clinically Reviewed',
  'footer.copy':'© SpineCare Connect — College educational project. Information only; not medical advice.',
  'article.back':'← All Topics','article.toc':'On this page','article.prev':'Previous','article.next':'Next',
  'article.refs':'References cited in this document',
  'missing.title':'This topic is not available in the selected language.',
  'missing.msg':'The article exists in other languages. You can read it there:',
  'missing.view':'View in','error.title':'Content could not be loaded',
  'error.msg':'The content file could not be read. If you opened this page directly (file://), please run a small local server instead:',
  'loading':'Loading…','theme.dark':'Switch to dark mode','theme.light':'Switch to light mode',
  'menu.open':'Open menu','menu.close':'Close menu','lang.label':'Select language',
  'child.of':'Part of','home':'Home',
  /* ✅ NEW: emergency modal keys */
  'emg.title':'Emergency — Act Fast',
  'emg.note':'If you notice any of these signs, seek immediate medical help:',
  'emg.call':'Call 112','emg.signs':'All Warning Signs',
  'emg.desktop':'📱 Tip: “Call 112” opens the phone dialer on mobile devices.'
},
hi:{
  'nav.home':'होम','nav.learn':'SCI के बारे में','nav.daily':'दैनिक देखभाल','nav.nutrition':'पोषण',
  'nav.complications':'जटिलताएं और सुरक्षा','nav.assistive':'सहायक तकनीक','nav.resources':'संसाधन',
  'nav.glossary':'शब्दावली','nav.myths':'भ्रम बनाम तथ्य','nav.emergency':'इमरजेंसी',
  'hero.badge':'शैक्षिक प्रोटोटाइप · नैदानिक समीक्षा नहीं की गई',
  'hero.title':'स्पाइनल कॉर्ड इंजरी को समझें, <span>साथ मिलकर।</span>',
  'hero.sub':'SpineCare Connect स्पाइनल कॉर्ड इंजरी (SCI), इसकी जटिलताओं, दैनिक देखभाल और उपलब्ध सहायता के बारे में स्पष्ट, स्रोत-आधारित शैक्षिक जानकारी प्रदान करती है — मरीजों, परिवारों और केयरगिवरों के लिए।',
  'hero.cta1':'विषय देखें','hero.cta2':'इस वेबसाइट के बारे में',
  'card.read':'और पढ़ें',
  'topics.title':'विषय ब्राउज़ करें','topics.sub':'भरोसेमंद, संदर्भित जानकारी — विषय-वार व्यवस्थित।',
  'search.title':'खोजें','search.ph':'खोजें… जैसे “प्रेशर सोर”, “ब्लैडर देखभाल”',
  'search.hint':'चयनित भाषा के सभी विषयों में खोजने के लिए कम से कम 2 अक्षर लिखें।',
  'search.none':'कोई परिणाम नहीं मिला। कोई और शब्द आज़माएँ।',
  'search.results':'परिणाम',
  'notice.title':'⚠️ चिकित्सा संबंधी अस्वीकरण',
  'footer.links':'त्वरित लिंक','footer.refs':'संदर्भ','footer.warning':'चेतावनी संकेत',
  'footer.disclaimerTitle':'चिकित्सा अस्वीकरण',
  'footer.about':'स्पाइनल कॉर्ड इंजरी (SCI), संबंधित जटिलताओं, दैनिक जीवन और उपलब्ध सहायता के बारे में सामान्य जानकारी देने वाली एक शैक्षिक परियोजना — अंग्रेज़ी, हिन्दी और मराठी में।',
  'footer.status':'शैक्षिक प्रोटोटाइप · उपलब्ध संदर्भों पर आधारित · नैदानिक समीक्षा नहीं की गई',
  'footer.copy':'© SpineCare Connect — कॉलेज शैक्षिक परियोजना। केवल जानकारी के लिए; चिकित्सा सलाह नहीं।',
  'article.back':'← सभी विषय','article.toc':'इस पेज पर','article.prev':'पिछला','article.next':'अगला',
  'article.refs':'इस दस्तावेज़ में उद्धृत संदर्भ',
  'missing.title':'यह विषय चयनित भाषा में उपलब्ध नहीं है।',
  'missing.msg':'यह लेख अन्य भाषाओं में उपलब्ध है। आप वहाँ पढ़ सकते हैं:',
  'missing.view':'देखें','error.title':'सामग्री लोड नहीं हो सकी',
  'error.msg':'सामग्री फ़ाइल नहीं पढ़ी जा सकी। यदि आपने पेज सीधे (file://) खोला है, तो कृपया एक छोटा लोकल सर्वर चलाएँ:',
  'loading':'लोड हो रहा है…','theme.dark':'डार्क मोड करें','theme.light':'लाइट मोड करें',
  'menu.open':'मेनू खोलें','menu.close':'मेनू बंद करें','lang.label':'भाषा चुनें',
  'child.of':'इसका भाग','home':'होम',
  /* ✅ NEW: emergency modal keys */
  'emg.title':'आपातकाल — तुरंत कदम उठाएँ',
  'emg.note':'यदि आप इनमें से कोई संकेत देखें, तो तुरंत चिकित्सा सहायता लें:',
  'emg.call':'112 पर कॉल करें','emg.signs':'सभी चेतावनी संकेत',
  'emg.desktop':'📱 सुझाव: “112 पर कॉल करें” मोबाइल पर डायलर खोलता है।'
},
mr:{
  'nav.home':'होम','nav.learn':'SCI विषयी माहिती','nav.daily':'दैनंदिन काळजी','nav.nutrition':'पोषण',
  'nav.complications':'गुंतागुंती व सुरक्षा','nav.assistive':'सहाय्यक तंत्रज्ञान','nav.resources':'संसाधने',
  'nav.glossary':'शब्दावली','nav.myths':'गैरसमज व तथ्ये','nav.emergency':'आपत्कालीन',
  'hero.badge':'शैक्षणिक प्रोटोटाइप · वैद्यकीय पुनरावलोकन नाही',
  'hero.title':'स्पाइनल कॉर्ड इन्ज्युरी समजून घेऊया, <span>एकत्र।</span>',
  'hero.sub':'SpineCare Connect स्पाइनल कॉर्ड इन्ज्युरी (SCI), त्यांच्या गुंतागुंती, दैनंदिन काळजी आणि उपलब्ध पाठिंब्याबद्दल स्पष्ट, स्रोत-आधारित शैक्षणिक माहिती देते — रुग्ण, कुटुंबे आणि काळजीवाहूंसाठी.',
  'hero.cta1':'विषय पहा','hero.cta2':'या संकेतस्थळाविषयी',
  'card.read':'अधिक वाचा',
  'topics.title':'विषय पहा','topics.sub':'विश्वासार्ह, संदर्भित माहिती — विषयानुसार आयोजित.',
  'search.title':'शोधा','search.ph':'शोधा… उदा. “बेडसोर”, “मूत्राशय काळजी”',
  'search.hint':'निवडलेल्या भाषेतील सर्व विषयांमध्ये शोधण्यासाठी किमान 2 अक्षरे टाइप करा.',
  'search.none':'कोणताही निकाल सापडला नाही. दुसरा शब्द वापरून पहा.',
  'search.results':'निकाल',
  'notice.title':'⚠️ वैद्यकीय माहितीविषयी अस्वीकरण',
  'footer.links':'जलद दुवे','footer.refs':'संदर्भ','footer.warning':'धोक्याची लक्षणे',
  'footer.disclaimerTitle':'वैद्यकीय अस्वीकरण',
  'footer.about':'स्पाइनल कॉर्ड इन्ज्युरी (SCI), संबंधित गुंतागुंत, दैनंदिन जीवन आणि उपलब्ध पाठिंब्याबद्दल सामान्य माहिती देणारा एक शैक्षणिक प्रकल्प — इंग्रजी, हिंदी आणि मराठीत.',
  'footer.status':'शैक्षणिक प्रोटोटाइप · उपलब्ध संदर्भांवर आधारित · वैद्यकीय पुनरावलोकन नाही',
  'footer.copy':'© SpineCare Connect — महाविद्यालयीन शैक्षणिक प्रकल्प. केवळ माहितीसाठी; वैद्यकीय सल्ला नाही.',
  'article.back':'← सर्व विषय','article.toc':'या पानावर','article.prev':'मागील','article.next':'पुढील',
  'article.refs':'या दस्तावेज़ातील संदर्भ',
  'missing.title':'हा विषय निवडलेल्या भाषेत उपलब्ध नाही.',
  'missing.msg':'हा लेख इतर भाषांमध्ये उपलब्ध आहे. तिथे वाचू शकता:',
  'missing.view':'पहा','error.title':'माहिती लोड करता आली नाही',
  'error.msg':'माहिती फाइल वाचता आली नाही. तुम्ही पान थेट (file://) उघडले असेल तर कृपया एक छोटा लोकल सर्व्हर चालवा:',
  'loading':'लोड होत आहे…','theme.dark':'डार्क मोड करा','theme.light':'लाइट मोड करा',
  'menu.open':'मेनू उघडा','menu.close':'मेनू बंद करा','lang.label':'भाषा निवडा',
  'child.of':'याचा भाग','home':'होम',
  /* ✅ NEW: emergency modal keys */
  'emg.title':'आपत्कालीन — लगेच कारवायचे',
  'emg.note':'खालीलपैकी कोणतीही लक्षणे दिसल्यास लगेच वैद्यकीय मदत घ्या:',
  'emg.call':'११२ वर कॉल करा','emg.signs':'सर्व धोक्याची लक्षणे',
  'emg.desktop':'📱 टिप: “११२ वर कॉल करा” मोबाइलवर डायलर उघडते.'
}};

/* ---------------- Helpers ---------------- */
const $  = (s,c)=> (c||document).querySelector(s);
const $$ = (s,c)=> Array.from((c||document).querySelectorAll(s));
const esc = s => String(s??'').replace(/[&<>"']/g, m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const t = k => (T[state.lang] && T[state.lang][k]) || T.en[k] || k;
const setHTML = (id,html) => { const n=$('#'+id); if(n) n.innerHTML=html; };

async function fetchJSON(url){
  const res = await fetch(url);
  if(!res.ok) throw new Error('HTTP '+res.status+' for '+url);
  const json = await res.json();
  if(!json || typeof json!=='object') throw new Error('Invalid JSON: '+url);
  return json;
}

/* ---------------- Theme ---------------- */
(function restoreTheme(){
  try{
    const th = localStorage.getItem('scc-theme');
    if(th==='dark' || th==='light') document.documentElement.setAttribute('data-theme', th);
  }catch(e){}
})();

function applyThemeLabel(){
  const cur = document.documentElement.getAttribute('data-theme');
  const btn = $('#themeToggle');
  if(!btn) return;
  btn.textContent = cur==='dark' ? '☀️' : '🌙';
  btn.setAttribute('aria-label', cur==='dark' ? t('theme.light') : t('theme.dark'));
}
const themeBtn = $('#themeToggle');
if(themeBtn){
  themeBtn.addEventListener('click',()=>{
    const next = document.documentElement.getAttribute('data-theme')==='dark'?'light':'dark';
    document.documentElement.setAttribute('data-theme',next);
    try{localStorage.setItem('scc-theme',next)}catch(e){}
    applyThemeLabel();
  });
}

/* ---------------- i18n walker ---------------- */
/* ✅ NEW FIX: data-i18n attributes were never applied — static header/footer/
   modal text stayed English after a language switch. */
function applyI18n(){
  $$('[data-i18n]').forEach(el=>{
    const v = t(el.dataset.i18n);
    if(v && v!==el.dataset.i18n) el.textContent = v;   /* plain-text keys only */
  });
  const ls = $('.lang-switch');
  if(ls) ls.setAttribute('aria-label', t('lang.label'));
}

/* ---------------- Progress bar & back-to-top ---------------- */
/* ✅ NEW FIX: #progressBar and #toTop existed in HTML with zero JS */
const progBar = $('#progressBar'), toTopBtn = $('#toTop');
function onScroll(){
  const doc = document.documentElement;
  const max = doc.scrollHeight - window.innerHeight;
  if(progBar) progBar.style.width = (max>0 ? Math.min(100,(window.scrollY/max)*100) : 0)+'%';
  if(toTopBtn) toTopBtn.hidden = window.scrollY < 500;
}
window.addEventListener('scroll', onScroll, {passive:true});
window.addEventListener('resize', onScroll, {passive:true});
if(toTopBtn) toTopBtn.addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));

/* ---------------- Language ---------------- */
function setLangButtons(){
  $$('.lang-btn').forEach(b=>{
    const on = b.dataset.lang===state.lang;
    b.setAttribute('aria-pressed',on);
    b.classList.toggle('active',on);
  });
  document.documentElement.lang = state.lang;
}
async function loadLanguage(lang){
  if(DATA[lang]) return DATA[lang];
  const index = await fetchJSON(`${lang}/index.json`);
  const topics = {};
  const order = [];
  (index.topics||[]).forEach(tp=>{
    order.push({id:tp.id,file:tp.file,title:tp.title,parent:null});
    (tp.children||[]).forEach(ch=>order.push({id:ch.id,file:ch.file,title:ch.title,parent:tp.id}));
  });
  /* ✅ all topic files load in parallel */
  const results = await Promise.allSettled(order.map(o=>fetchJSON(`${lang}/${o.file}`)));
  results.forEach((r,i)=>{
    if(r.status==='fulfilled') topics[order[i].id]=r.value;
    else console.warn('Missing topic file:',lang,order[i].id);
  });
  DATA[lang] = {index,topics,order};
  return DATA[lang];
}

/* ---------------- Router ---------------- */
function parseHash(){
  const h = location.hash.replace(/^#/,'') || '/home';
  const [path,query] = h.split('?');
  const parts = path.split('/').filter(Boolean);
  if(parts[0]==='topic' && parts[1]) return {view:'topic',id:parts[1],section:query?query.replace('s=',''):null};
  return {view:'home'};
}
window.addEventListener('hashchange',()=>{
  /* plain anchors like #topics smooth-scroll instead of re-rendering */
  if(!location.hash.startsWith('#/')){
    const el = document.getElementById(location.hash.slice(1));
    if(el){ el.scrollIntoView({behavior:'smooth'}); return; }
  }
  state.route = parseHash();
  render();
});

/* ---------------- Render: Home ---------------- */
function homeView(){
  const d = DATA[state.lang];
  const top = (d.index.topics||[]);

  const cards = top.map(tp=>
    cardHTML(tp.id, tp.title, firstDescription(d.topics[tp.id])||esc(tp.title), false)
  ).join('');

  /* ✅ NEW FIX: child cards were ALL labelled "Complications & Safety" —
     now each group is headed by its real parent topic title */
  const childGroups = top.map(tp=>{
    const kids = tp.children||[];
    if(!kids.length) return '';
    const kidCards = kids.map(ch=>
      cardHTML(ch.id, ch.title, firstDescription(d.topics[ch.id])||esc(ch.title), true, tp.title)
    ).join('');
    return `<div class="section-head" style="margin-top:44px">
        <h2 style="font-size:20px">${esc(tp.title)}</h2>
      </div>
      <div class="cards">${kidCards}</div>`;
  }).join('');

  return `
  <section class="hero">
    <div class="hero-blob hb1" aria-hidden="true"></div>
    <div class="hero-blob hb2" aria-hidden="true"></div>
    <div class="hero-inner">
      <div class="hero-copy">
        <span class="status-pill">🔒 ${esc(t('hero.badge'))}</span>
        <h1>${t('hero.title')}</h1>
        <p>${esc(t('hero.sub'))}</p>
        <div class="hero-actions">
          <a class="btn btn-primary" href="#topics">${esc(t('hero.cta1'))}</a>
          <a class="btn btn-outline" href="#/topic/content-governance">${esc(t('hero.cta2'))}</a>
        </div>
      </div>
      <div class="hero-spine" aria-hidden="true">🦴</div>
    </div>
  </section>

  <section class="section wrap" id="search">
    <div class="section-head"><h2>🔍 ${esc(t('search.title'))}</h2></div>
    <div class="search-box" id="searchBox">
      <label class="skip" for="searchInput">${esc(t('search.title'))}</label>
      <input id="searchInput" type="search" placeholder="${esc(t('search.ph'))}"
        autocomplete="off" aria-describedby="searchHint">
      <button class="icon-btn clear-btn" id="searchClear" aria-label="Clear search">✕</button>
    </div>
    <p id="searchHint" style="font-size:13px;color:var(--muted);margin-top:8px">${esc(t('search.hint'))}</p>
    <div class="results" id="searchResults" role="status"></div>
  </section>

  <section class="section wrap" id="topics">
    <div class="section-head">
      <h2>${esc(t('topics.title'))}</h2>
      <p>${esc(t('topics.sub'))}</p>
    </div>
    <div class="cards">${cards}</div>
    ${childGroups}
  </section>

  <section class="section wrap" id="notice">
    <div class="notice" id="homeNotice">
      <h3>${esc(t('notice.title'))}</h3>
      <div id="noticeBody"></div>
    </div>
  </section>`;
}
function cardHTML(id,title,desc,isChild,parentTitle){
  const icons = ICONS[id]||'📄';
  return `<a class="card${isChild?' is-child':''}" href="#/topic/${id}">
    <span class="ic">${icons}</span>
    ${isChild?`<span class="badge">${esc(t('child.of'))}: ${esc(parentTitle||'')}</span>`:''}
    <h3>${esc(title)}</h3>
    <p>${desc}</p>
    <span class="read">${esc(t('card.read'))} →</span>
  </a>`;
}
const ICONS = {
  'home':'🏠','disclaimer':'⚠️','content-governance':'🛡️',
  'sci-basics-and-initial-care':'🩺','body-functions':'🫀','pressure-injuries':'🛏️',
  'neurogenic-bladder-and-uti':'🚽','neurogenic-bowel-dysfunction':'🍽️','autonomic-dysreflexia':'⚡',
  'secondary-complications-5-13':'🩹','rehabilitation':'💪','nutrition-and-metabolic-management':'🥗',
  'daily-care-home-safety-and-caregiver-support':'🏡','independence-and-assistive-technology':'🦽',
  'triage-guidance':'🚨','myths-and-facts':'❓','glossary':'📖','references':'📚'
};
function firstDescription(topic){
  if(!topic||!topic.sections) return '';
  for(const s of topic.sections) for(const b of (s.content||[])){
    if(b.type==='paragraph' && b.text) return esc(b.text.length>130?b.text.slice(0,127)+'…':b.text);
  }
  return '';
}

/* ---------------- Render: Topic / Article ---------------- */
function parentOf(id){
  const d = DATA[state.lang];
  const e = d.order.find(o=>o.id===id);
  return (e && e.parent) ? d.order.find(o=>o.id===e.parent) : null;
}
function topicView(id){
  const d = DATA[state.lang];
  const topic = d.topics[id];
  if(!topic) return missingView(id);
  const sections = (topic.sections||[]).map((s,i)=>{
    const sid = s.id || ('sec-'+i);
    return {sid,heading:s.heading,html:renderBlocks(s.content||[])}; 
  });
  const tocLinks = sections.map(s=>`<a href="#/topic/${id}?s=${s.sid}" data-sid="${s.sid}">${esc(s.heading||'')}</a>`).join('');
  const secsHTML = sections.map(s=>`
    <section id="${s.sid}">
      ${s.heading?`<h2>${esc(s.heading)}</h2>`:''}
      ${s.html}
    </section>`).join('');
  const refsHTML = renderCitations(topic.references||[]);
  const {prev,next} = neighbours(id);
  const parent = parentOf(id);
  const parentLink = parent
    ? `<a class="crumb" href="#/topic/${parent.id}">← ${esc(parent.title)}</a>` : '';
  return `
  ${spineRailHTML(sections)}
  <div class="wrap">
    <div class="article-layout has-toc">
      <aside class="toc" aria-label="${esc(t('article.toc'))}">
        <div class="toc-inner">
          <h4>${esc(t('article.toc'))}</h4>
          <a href="#/home">${esc(t('article.back'))}</a>
          ${tocLinks}
        </div>
      </aside>
      <article class="article">
        ${parentLink}
        <h1>${ICONS[id]?ICONS[id]+' ':''}${esc(topic.title)}</h1>
        <p class="meta">🔒 ${esc(t('hero.badge'))}</p>
        <details class="mobile-toc">
          <summary>${esc(t('article.toc'))}</summary>
          ${tocLinks}
        </details>
        ${secsHTML}
        ${refsHTML}
        <div class="article-nav">
          ${prev?`<a href="#/topic/${prev.id}"><span class="dir">← ${esc(t('article.prev'))}</span>${esc(prev.title)}</a>`:'<span></span>'}
          ${next?`<a href="#/topic/${next.id}" style="text-align:right"><span class="dir">${esc(t('article.next'))} →</span>${esc(next.title)}</a>`:''}
        </div>
      </article>
    </div>
  </div>`;
}
function renderBlocks(blocks){
  return blocks.map(b=>{
    switch(b.type){
      case 'paragraph': return `<p>${esc(b.text)}</p>`;
      case 'subheading': return `<h3 class="subheading">${esc(b.text)}</h3>`;
      case 'list': return `<ul>${listItems(b.items)}</ul>`;
      case 'numbered_list': return `<ol>${listItems(b.items)}</ol>`;
      case 'table': return tableHTML(b);
      case 'note': return callout('note','💡',b.text);
      case 'warning': return callout('warning','🚨',b.text);
      case 'disclaimer': return callout('disclaimer','⚠️',b.text);
      case 'diagram': return diagramHTML(b);
      case 'glossary_entry': return `<dl class="glossary-item"><dt>${esc(b.term)}</dt><dd>${esc(b.definition)}</dd></dl>`;
      /* ✅ NEW FIX: renderers for block types that had CSS but no JS support */
      case 'tier': {
        const lvl = (b.level==='t1'||b.level===1||b.level==='1') ? 't1' : 't2';
        return `<div class="tier ${lvl}">
          ${b.title?`<span class="tier-tag">${esc(b.title)}</span>`:''}
          <ul>${listItems(b.items)}</ul>
        </div>`;
      }
      case 'myth_fact':
      case 'myth-fact':
        return `<div class="mf-card">
          <div class="myth">${esc(b.myth||'')}</div>
          <div class="fact">${esc(b.fact||'')}</div>
        </div>`;
      default:
        if(b && b.text) return `<p>${esc(b.text)}</p>`;
        return '';
    }
  }).join('');
}
function listItems(items){
  return (items||[]).map(it=>{
    if(typeof it==='string') return `<li>${esc(it)}</li>`;
    const sub = (it.sub_items&&it.sub_items.length)
      ? `<ul>${it.sub_items.map(s=>`<li>${esc(typeof s==='string'?s:(s.text||''))}</li>`).join('')}</ul>`:'';
    return `<li><strong>${esc(it.text)}</strong>${sub}</li>`;
  }).join('');
}
function tableHTML(b){
  const head=(b.columns||[]).map(c=>`<th scope="col">${esc(c)}</th>`).join('');
  const rows=(b.rows||[]).map(r=>`<tr>${(r||[]).map(c=>`<td>${esc(c)}</td>`).join('')}</tr>`).join('');
  return `<table><thead><tr>${head}</tr></thead><tbody>${rows}</tbody></table>`;
}
function callout(kind,icon,text){
  return `<div class="callout ${kind}"><span class="co-ic" aria-hidden="true">${icon}</span><p>${esc(text)}</p></div>`;
}
function diagramHTML(b){
  const desc = b.description?`<p style="color:var(--muted);font-size:13.5px">${esc(b.description)}</p>`:'';
  return `${desc}<pre class="diagram" dir="ltr">${esc(b.raw_text||'')}</pre>`;
}
function renderCitations(refs){
  if(!refs.length) return '';
  return `<section><h2>📚 ${esc(t('article.refs'))}</h2><ol>${
    refs.map(r=>`<li><strong>${esc(r.group||'')}</strong> — ${esc(r.citation||'')}</li>`).join('')
  }</ol></section>`;
}
function neighbours(id){
  const order = DATA[state.lang].order;
  const i = order.findIndex(o=>o.id===id);
  return { prev: order[i-1]||null, next: order[i+1]||null };
}
function spineRailHTML(sections){
  if(sections.length<2) return '';
  const dots = sections.map((s,i)=>
    `<button class="dot" style="top:${(i/(sections.length-1))*100}%" data-target="${s.sid}"
      aria-label="${esc(s.heading||('Section '+(i+1)))}"></button>`).join('');
  return `<div class="spine-rail" aria-hidden="false">${dots}</div>`;
}
function missingView(id){
  const d = DATA[state.lang];
  const known = d.order.find(o=>o.id===id);
  const candidates = LANGS.filter(l=>l.code!==state.lang).map(l=>{
    const localTitle = (DATA[l.code]&&DATA[l.code].order.find(o=>o.id===id));
    const title = localTitle ? localTitle.title : (known?known.title:id);
    return `<a class="btn btn-outline" href="#/topic/${id}" data-forcelang="${l.code}">${esc(t('missing.view'))} ${l.name}</a>`;
  }).join('');
  return `<div class="wrap"><div class="state-card">
    <div class="big">🌐</div>
    <h2>${esc(t('missing.title'))}</h2>
    <p>${esc(t('missing.msg'))}</p>
    <div class="row">${candidates}</div>
  </div></div>`;
}
function errorView(err){
  const isFile = location.protocol==='file:';
  const hint = isFile
    ? `<p style="text-align:left;display:inline-block"><code>python -m http.server 5500</code><br>
       <code>php -S localhost:5500</code><br>
       ${esc('VS Code → Live Server extension → "Go Live"')}</p>`
    : `<p><code>${esc(err&&err.message||'Network error')}</code></p>`;
  return `<div class="wrap"><div class="state-card">
    <div class="big">📡</div>
    <h2>${esc(t('error.title'))}</h2>
    <p>${esc(t('error.msg'))}</p>
    ${hint}
  </div></div>`;
}

/* ---------------- Search ---------------- */
function collectText(blocks,out){
  (blocks||[]).forEach(b=>{
    if(b.text) out.push(b.text);
    if(b.term) out.push(b.term+' — '+(b.definition||''));
    if(b.items) b.items.forEach(it=>{
      if(typeof it==='string') out.push(it);
      else{ if(it.text) out.push(it.text); (it.sub_items||[]).forEach(s=>out.push(typeof s==='string'?s:(s.text||''))); }
    });
    if(b.rows) b.rows.forEach(r=>out.push(r.join(' ')));
  });
}
function buildSearchIndex(){
  const d = DATA[state.lang];
  if(state.searchCache && state.searchCache.lang===state.lang) return state.searchCache.index;
  const index=[];
  d.order.forEach(o=>{
    const topic=d.topics[o.id]; if(!topic) return;
    (topic.sections||[]).forEach(s=>{
      const texts=[]; collectText(s.content,texts);
      index.push({id:o.id,title:o.title,heading:s.heading||'',text:texts.join(' ')});
    });
    (topic.references||[]).forEach(r=>index.push({id:o.id,title:o.title,heading:'📚',text:(r.group||'')+' '+(r.citation||'')}));
  });
  state.searchCache={lang:state.lang,index};
  return index;
}
function doSearch(q){
  const box=$('#searchResults'); if(!box) return;
  q=q.trim();
  if(q.length<2){ box.innerHTML=`<div class="empty-state">${esc(t('search.hint'))}</div>`; return; }
  const needle=q.toLowerCase();
  const hits=buildSearchIndex().filter(it=>
    it.title.toLowerCase().includes(needle)||
    it.heading.toLowerCase().includes(needle)||
    it.text.toLowerCase().includes(needle)).slice(0,12);
  if(!hits.length){ box.innerHTML=`<div class="empty-state">🔍 ${esc(t('search.none'))}</div>`; return; }
  const label=`${hits.length} ${esc(t('search.results'))} — “${esc(q)}”`;
  const mark=(txt)=>{
    const safe=esc(txt);
    try{
      const re=new RegExp('('+esc(q).replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+')','ig');
      return safe.replace(re,'<mark>$1</mark>');
    }catch(e){ return safe; }
  };
  box.innerHTML=`<p style="font-size:12.5px;color:var(--muted)">${label}</p>`+hits.map(h=>{
    let snippet='';
    const pos=h.text.toLowerCase().indexOf(needle);
    if(pos>-1){ const start=Math.max(0,pos-55); snippet=esc(h.text.slice(start,start+150))+'…'; }
    else{ snippet=esc(h.text.slice(0,120))+'…'; }
    return `<a class="result" href="#/topic/${h.id}"><h4>${mark(h.title)} — ${mark(h.heading)}</h4><p>${snippet}</p></a>`;
  }).join('');
}

/* ---------------- Static bits (footer disclaimer, notice) ---------------- */
async function loadDisclaimers(){
  const lang = state.lang;
  if(disclaimerCache[lang]){
    setHTML('footerDisclaimer', disclaimerCache[lang].footer);
    setHTML('noticeBody', disclaimerCache[lang].notice);
    return;
  }
  try{
    const d = await fetchJSON(`${lang}/disclaimer.json`);
    const texts=[];
    (d.sections||[]).forEach(s=>(s.content||[]).forEach(b=>{ if(b.text) texts.push(b.text); }));
    const joined = texts.map(x=>`<p style="margin-top:6px">${esc(x)}</p>`).join('');
    const footer = texts[0]?esc(texts[0].slice(0,220))+(texts[0].length>220?'…':''):'';
    disclaimerCache[lang]={footer,notice:joined};
    setHTML('footerDisclaimer', footer);
    setHTML('noticeBody', joined);
  }catch(e){ console.warn('disclaimer load failed',e); }
}

/* ---------------- Global render ---------------- */
function render(){
  const token = ++renderToken;
  const app=$('#app');
  closeMenu();
  window.scrollTo({top:0,behavior:'auto'});
  if(state.route.view==='home'){
    app.innerHTML = homeView();
    bindHome();
    document.title = 'SpineCare Connect — '+t('hero.title').replace(/<[^>]+>/g,'');
  }else{
    const {id,section}=state.route;
    app.innerHTML = `<div class="loading"><div class="spinner"></div>${esc(t('loading'))}</div>`;
    const d=DATA[state.lang];
    if(d && d.topics[id]){
      app.innerHTML = topicView(id);
      bindArticle(id,section);
      document.title = (d.topics[id].title||'')+' · SpineCare Connect';
    }else{
      loadLanguage(state.lang).then(()=>{
        if(token!==renderToken) return;
        const dd=DATA[state.lang];
        if(dd.topics[id]){
          app.innerHTML = topicView(id);
          bindArticle(id,section);
          document.title = (dd.topics[id].title||'')+' · SpineCare Connect';
        }else{
          app.innerHTML = missingView(id);
        }
      }).catch(e=>{ if(token===renderToken) app.innerHTML=errorView(e); });
    }
  }
  loadDisclaimers();
  highlightNav();
  applyThemeLabel();
  applyI18n();   /* ✅ NEW FIX: translate static header/footer/modal nodes */
  onScroll();    /* ✅ NEW FIX: content height changed — refresh bar + button */
}

/* ---------------- Home bindings ---------------- */
function bindHome(){
  const inp=$('#searchInput'), box=$('#searchBox'), clr=$('#searchClear');
  if(inp){
    inp.addEventListener('input',()=>{ if(box) box.classList.toggle('has-text',!!inp.value); doSearch(inp.value); });
  }
  if(clr && inp){
    clr.addEventListener('click',()=>{ inp.value=''; if(box) box.classList.remove('has-text'); doSearch(''); inp.focus(); });
  }
  /* ✅ in-page anchors smooth-scroll even if hash is already set.
     .skip is excluded — hijacking it would break keyboard focus jump. */
  $$('a[href^="#"]:not([href^="#/"]):not(.skip)').forEach(a=>{
    a.addEventListener('click',e=>{
      const el=document.getElementById(a.getAttribute('href').slice(1));
      if(el){ e.preventDefault(); el.scrollIntoView({behavior:'smooth'}); }
    });
  });
  /* ✅ "/" shortcut bound exactly once (no listener leak on re-render) */
  if(!bindHome._slashBound){
    bindHome._slashBound = true;
    document.addEventListener('keydown',e=>{
      const si=$('#searchInput');
      if(e.key==='/' && si && document.activeElement!==si){ e.preventDefault(); si.focus(); }
    });
  }
}

/* ---------------- Article bindings ---------------- */
function bindArticle(id,section){
  // spine rail
  const rail=$('.spine-rail');
  if(rail){
    const dots=$$('.dot',rail);
    dots.forEach(dot=>dot.addEventListener('click',()=>{
      const el=document.getElementById(dot.dataset.target);
      if(el) el.scrollIntoView({behavior:'smooth',block:'start'});
    }));
    const secs=$$('.article section[id]');
    if('IntersectionObserver' in window && secs.length){
      const io=new IntersectionObserver(entries=>{
        entries.forEach(en=>{
          if(en.isIntersecting){
            dots.forEach(d=>d.classList.toggle('on',d.dataset.target===en.target.id));
          }
        });
      },{rootMargin:'-30% 0px -55% 0px'});
      secs.forEach(s=>io.observe(s));
      dots[0]&&dots[0].classList.add('on');
    }
  }
  // deep-link to section
  if(section){
    const el=document.getElementById(section);
    if(el){ setTimeout(()=>{ el.scrollIntoView({behavior:'smooth',block:'start'});
      el.classList.add('flash'); setTimeout(()=>el.classList.remove('flash'),2000); },120); }
  }
  // ✅ TOC same-hash re-click fix
  $$('.toc a[data-sid], .mobile-toc a[data-sid]').forEach(a=>{
    a.addEventListener('click',()=>{
      if(location.hash === a.getAttribute('href')){
        const el=document.getElementById(a.dataset.sid);
        if(el) el.scrollIntoView({behavior:'smooth',block:'start'});
      }
    });
  });
}

/* ---------------- Nav highlight ---------------- */
function highlightNav(){
  const d = DATA[state.lang];
  let id = state.route.view==='topic' ? state.route.id : 'home';
  const map={ 'home':'home','sci-basics-and-initial-care':'learn',
    'daily-care-home-safety-and-caregiver-support':'daily',
    'nutrition-and-metabolic-management':'nutrition','body-functions':'complications',
    'independence-and-assistive-technology':'assistive','references':'resources',
    'glossary':'glossary','myths-and-facts':'myths' };
  let key = map[id];
  /* child topics climb to parent for nav highlight */
  if(!key && d){
    let entry = d.order.find(o=>o.id===id);
    let guard = 0;
    while(entry && entry.parent && !key && guard++ < 5){
      entry = d.order.find(o=>o.id===entry.parent);
      if(entry) key = map[entry.id];
    }
  }
  $$('.main-nav a').forEach(a=>{
    if(a.dataset.nav===key) a.setAttribute('aria-current','page');
    else a.removeAttribute('aria-current');
  });
}

/* ---------------- Header controls ---------------- */
function closeMenu(){
  const nav=$('#mainNav');
  if(nav && nav.classList.contains('open')) toggleMenu(false);
}
function toggleMenu(force){
  const nav=$('#mainNav'), btn=$('#menuToggle');
  if(!nav || !btn) return;
  const open = force!==undefined?force:!nav.classList.contains('open');
  nav.classList.toggle('open',open);
  btn.setAttribute('aria-expanded',open);
  btn.setAttribute('aria-label',open?t('menu.close'):t('menu.open'));
  btn.textContent=open?'✕':'☰';
}
const menuBtn = $('#menuToggle');
if(menuBtn){
  menuBtn.addEventListener('click',()=>toggleMenu());
}

/* ---------------- Language switching (unified) ---------------- */
async function switchLang(lang){
  if(langSwitching) return;
  if(!LANGS.some(l=>l.code===lang) || lang===state.lang) return;
  langSwitching = true;
  state.lang = lang;
  try{localStorage.setItem('scc-lang',lang)}catch(e){}
  setLangButtons();
  applyI18n();                       /* ✅ static UI updates immediately */
  state.searchCache = null;
  const app=$('#app');
  app.innerHTML=`<div class="loading"><div class="spinner"></div>${esc(t('loading'))}</div>`;
  try{
    await loadLanguage(lang);
    state.route = parseHash();
    render();
  }catch(e){
    app.innerHTML = errorView(e);
  }finally{
    langSwitching = false;
  }
}
 $$('.lang-btn').forEach(b=>b.addEventListener('click',()=>switchLang(b.dataset.lang)));

document.addEventListener('click',e=>{
  const fl=e.target.closest('[data-forcelang]');
  if(fl){ e.preventDefault(); switchLang(fl.dataset.forcelang); return; }
  const sl=e.target.closest('[data-setlang]');
  if(sl){ e.preventDefault(); switchLang(sl.dataset.setlang); return; }
  if(e.target.closest('.main-nav a')) closeMenu();
});

/* ---------------- Emergency modal ---------------- */
/* ✅ NEW FIX: old code targeted #emergencyPanel (doesn't exist) — the button
   did nothing. Now wired to the real #emgModal / #emgClose / #emgList,
   with per-language warning signs, Esc, overlay-click, focus trap. */
const EMG_SIGNS = {
  en:['Weakness or numbness that is spreading or getting worse',
      'New or sudden loss of bladder/bowel control',
      'Severe difficulty breathing, or cannot cough clearly',
      'Sudden pounding headache with sweating or flushing (possible autonomic dysreflexia)',
      'A pressure sore that is deep, foul-smelling, or has pus',
      'High fever with chills (possible infection)',
      'New severe neck/back pain after a fall or accident'],
  hi:['कमज़ोरी या सुन्नपन जो फैल रहा है या बढ़ रहा है',
      'मूत्राशय/आंतों पर नियंत्रण अचानक चला जाना',
      'सांस लेने में गंभीर तकलीफ़, या साफ़ खांस न पाना',
      'अचानक तेज़ सिरदर्द के साथ पसीना आना या चेहरा लाल होना (संभावित ऑटोनोमिक डिसरिफ्लेक्सिया)',
      'गहरा बेडसोर — दुर्गंध या मवाद होना',
      'ठंड लगने के साथ तेज़ बुखार (संभावित संक्रमण)',
      'गिरने या दुर्घटना के बाद गर्दन या पीठ में नया तेज़ दर्द'],
  mr:['अशक्तपणा किंवा मुंग्या येणे जे पसरत आहे किंवा वाढत आहे',
      'मूत्राशय/आतड्यांवरील नियंत्रण अचानक जाणे',
      'श्वास घेण्यास गंभीर अडचण किंवा स्पष्ट खोकला येणे अशक्य',
      'अचानक तीव्र डोकेदुखी सोबत घाम येणे/चेहरा लाल होणे (संभाव्य ऑटोनॉमिक डिस्रिफ्लेक्सिया)',
      'खोल बेडसोर — दुर्गंध किंवा मवाद येणे',
      'थंडगारगमीसह ताप (संभाव्य संसर्ग)',
      'पडणे/अपघातानंतर मान किंवा पाठीत नवीन तीव्र वेदना']
};
(function(){
  const btn=$('#emergencyBtn'), modal=$('#emgModal'),
        closeBtn=$('#emgClose'), list=$('#emgList');
  if(!btn || !modal) return;
  let lastFocus=null;

  function open(){
    lastFocus=document.activeElement;
    if(list) list.innerHTML=(EMG_SIGNS[state.lang]||EMG_SIGNS.en)
      .map(s=>`<li>${esc(s)}</li>`).join('');
    modal.hidden=false;
    btn.setAttribute('aria-expanded','true');
    document.body.style.overflow='hidden';      /* scroll lock */
    if(closeBtn) closeBtn.focus();
  }
  function close(){
    if(modal.hidden) return;
    modal.hidden=true;
    btn.setAttribute('aria-expanded','false');
    document.body.style.overflow='';
    if(lastFocus && lastFocus.focus) lastFocus.focus();
  }

  btn.addEventListener('click',()=> modal.hidden ? open() : close());
  if(closeBtn) closeBtn.addEventListener('click',close);
  modal.addEventListener('click',e=>{ if(e.target===modal) close(); });

  document.addEventListener('keydown',e=>{
    if(modal.hidden) return;
    if(e.key==='Escape'){ close(); return; }
    if(e.key==='Tab'){                           /* basic focus trap */
      const f=$$('a[href],button:not([disabled])',modal);
      if(!f.length) return;
      const first=f[0], last=f[f.length-1];
      if(e.shiftKey && document.activeElement===first){ e.preventDefault(); last.focus(); }
      else if(!e.shiftKey && document.activeElement===last){ e.preventDefault(); first.focus(); }
    }
  });
})();

/* ---------------- Init ---------------- */
(async function init(){
  try{ state.lang = localStorage.getItem('scc-lang') || 'en'; }catch(e){ state.lang='en'; }
  if(!LANGS.some(l=>l.code===state.lang)) state.lang='en';
  setLangButtons();
  applyThemeLabel();
  applyI18n();                       /* ✅ translate header/footer before first paint */
  const app=$('#app');
  if(app) app.innerHTML=`<div class="loading"><div class="spinner"></div>${esc(t('loading'))}</div>`;
  try{
    await loadLanguage(state.lang);
    state.route=parseHash();
    render();
  }catch(e){
    if(app) app.innerHTML=errorView(e);
  }
  onScroll();
})();

