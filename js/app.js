// JLPT N5 Practice App — Main Application

// ─── State ───────────────────────────────────────────────────────────────────
const state = {
  screen: 'home',
  mode: 'practice',      // practice | mock
  practiceType: null,
  practiceLabelKey: '',
  questions: [],
  currentIdx: 0,
  answers: [],
  timer: null,
  timeLeft: 0,
  mockSectionIdx: 0,
  mockResults: [],
  reviewMode: false,
};

// ─── Audio ───────────────────────────────────────────────────────────────────
window.speechSynthesis && window.speechSynthesis.addEventListener('voiceschanged', () => {});

function speak(text, onEnd) {
  if (!('speechSynthesis' in window)) { onEnd && onEnd(); return; }
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.lang = 'ja-JP'; utt.rate = 0.85;
  const jaVoice = window.speechSynthesis.getVoices().find(v => v.lang.startsWith('ja'));
  if (jaVoice) utt.voice = jaVoice;
  if (onEnd) utt.onend = onEnd;
  window.speechSynthesis.speak(utt);
}
function stopSpeech() { 'speechSynthesis' in window && window.speechSynthesis.cancel(); }

// ─── Timer ───────────────────────────────────────────────────────────────────
function startTimer(seconds) {
  stopTimer();
  state.timeLeft = seconds;
  updateTimerUI();
  state.timer = setInterval(() => {
    state.timeLeft--;
    updateTimerUI();
    if (state.timeLeft <= 0) { stopTimer(); handleTimeUp(); }
  }, 1000);
}
function stopTimer() { if (state.timer) { clearInterval(state.timer); state.timer = null; } }
function updateTimerUI() {
  const el = document.getElementById('timer-display');
  if (!el) return;
  const m = Math.floor(state.timeLeft / 60), s = state.timeLeft % 60;
  el.textContent = `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  el.className = 'timer-display' + (state.timeLeft <= 60 ? ' urgent' : '');
}
function handleTimeUp() {
  alert(lang === 'zh' ? '時間到！' : '時間切れ！');
  if (state.mode === 'mock') finishMockSection();
}

// ─── LocalStorage Progress ────────────────────────────────────────────────────
function saveProgress(type, totalQ, correct) {
  const key = 'jlpt_n5_progress';
  const data = JSON.parse(localStorage.getItem(key) || '{}');
  if (!data[type]) data[type] = { total:0, correct:0, sessions:0 };
  data[type].total += totalQ; data[type].correct += correct; data[type].sessions++;
  data[type].lastDate = new Date().toLocaleDateString('zh-TW');
  localStorage.setItem(key, JSON.stringify(data));
}
function loadProgress() { return JSON.parse(localStorage.getItem('jlpt_n5_progress') || '{}'); }

// ─── Wrong Answer Practice ────────────────────────────────────────────────────
function collectWrongQuestions() {
  const h = loadHistory();
  const wrongItems = [];
  PRACTICE_MENU.forEach(sec => {
    sec.items.forEach(menuItem => {
      flattenQuestions(menuItem).forEach(item => {
        const id = getItemId(item);
        if (needsReview(h[id])) {
          wrongItems.push({ ...item, _qId: id, _wrongCount: h[id].wrong });
        }
      });
    });
  });
  wrongItems.sort((a, b) => b._wrongCount - a._wrongCount);
  return wrongItems;
}

function startWrongPractice() {
  const items = collectWrongQuestions();
  if (!items.length) { alert(t('noWrong')); return; }
  state.mode             = 'practice';
  state.practiceType     = 'wrong_review';
  state.practiceLabelKey = 'wrongPractice';
  state.questions        = items;
  state.currentIdx       = 0;
  state.answers          = [];
  state.reviewMode       = false;
  renderPracticeQuestion();
}

// ─── Rendering Utilities ──────────────────────────────────────────────────────
const app = () => document.getElementById('app');
function render(html) { app().innerHTML = html; }

function header(titleKey, showTimer = false) {
  const title = titleKey ? t(titleKey) : '';
  return `
    <header class="site-header">
      <div class="header-inner">
        <button class="btn-back" onclick="goHome()">${t('back')}</button>
        <h1 class="header-title">${title}</h1>
        <div class="header-right">
          ${showTimer ? `<div id="timer-display" class="timer-display">--:--</div>` : ''}
          <button class="btn-lang" onclick="toggleLang()">${t('langToggle')}</button>
        </div>
      </div>
    </header>`;
}

// ─── HOME SCREEN ──────────────────────────────────────────────────────────────
function goHome() {
  stopTimer(); stopSpeech();
  _isReading = false;
  state.screen = 'home';
  const prog       = loadProgress();
  const stats      = getTotalStats();
  const wrongCount = stats.wrongQ;

  const sectionCards = PRACTICE_MENU.map(sec => {
    const badges = sec.items.map(item => {
      const p = prog[item.type];
      const pct = p ? Math.round((p.correct / p.total) * 100) : null;
      return `<span class="badge-type">${t('chip_'+item.type)}${pct !== null ? ` <em>${pct}%</em>` : ''}</span>`;
    }).join('');
    const colorClass = ['sec1','sec2','sec3'][sec.section - 1];
    return `
      <div class="card section-card ${colorClass}" onclick="openPracticeMenu(${sec.section - 1})">
        <div class="card-tag">第${sec.section}節</div>
        <h2>${t('sec'+sec.section+'Name')}</h2>
        <div class="badge-row">${badges}</div>
      </div>`;
  }).join('');

  const wrongBanner = wrongCount > 0 ? `
    <div class="wrong-banner" onclick="startWrongPractice()">
      <div class="wrong-info">
        <span class="wrong-icon">📝</span>
        <div>
          <strong>${t('wrongPractice')}</strong>
          <span class="wrong-count-label">${wrongCount} ${t('wrongBtnSuffix')}</span>
        </div>
      </div>
      <span class="arrow">&#8250;</span>
    </div>` : '';

  const statsRow = stats.attempts > 0 ? `
    <div class="stats-row">
      ${t('statsAttempts')} <strong>${stats.attempts}</strong>${t('statsTimes')}
      ・${t('statsAccuracy')} <strong>${Math.round((stats.correct / stats.attempts) * 100)}%</strong>
      ${wrongCount > 0 ? `・${t('statsWrong')} <strong class="stat-wrong">${wrongCount}${t('statsSuffix')}</strong>` : ''}
    </div>` : '';

  render(`
    <div class="home-screen">
      <div class="hero">
        <div class="hero-flag">🇯🇵</div>
        <h1 class="hero-title">JLPT N5<br>${lang === 'zh' ? '練習題庫' : '練習アプリ'}</h1>
        <p class="hero-sub">${t('subtitle')}</p>
        <div class="hero-btns">
          <button class="btn-lang home-lang" onclick="toggleLang()">${t('langToggle')}</button>
          <button class="autoread-toggle ${autoRead ? 'active' : ''}" onclick="toggleAutoRead()">
            ${autoRead ? t('autoReadOn') : t('autoReadOff')}
          </button>
        </div>
      </div>
      <div class="section-grid">${sectionCards}</div>
      ${wrongBanner}
      ${statsRow}
      <div class="mock-banner" onclick="startMockTest()">
        <div>
          <strong>${t('mockTest')}</strong>
          <span>${t('mockTestSub')}</span>
        </div>
        <span class="arrow">&#8250;</span>
      </div>
      <div class="tip-box">
        <strong>${t('tipTitle')}</strong><br>
        ${t('tipBody')}
      </div>
    </div>
  `);
}

// ─── PRACTICE MENU ────────────────────────────────────────────────────────────
function openPracticeMenu(secIdx) {
  const sec = PRACTICE_MENU[secIdx];
  const colorClass = ['sec1','sec2','sec3'][secIdx];
  const items = sec.items.map((item, i) => `
    <button class="menu-item ${colorClass}" onclick="startPractice(${secIdx}, ${i})">
      <span class="menu-label">${t(item.labelKey)}</span>
      <span class="menu-count">${countQuestions(item)}${t('qCount')}</span>
      <span class="arrow">&#8250;</span>
    </button>`).join('');
  render(`
    ${header(sec.titleKey)}
    <div class="practice-menu">
      <p class="menu-desc">${t('menuDesc')}</p>
      <div class="menu-list">${items}</div>
    </div>
  `);
}

function countQuestions(item) {
  if (!item.data.length) return 0;
  const first = item.data[0];
  if (first.questions) return item.data.reduce((s,g) => s + g.questions.length, 0);
  if (first.blanks)    return item.data.reduce((s,g) => s + g.blanks.length, 0);
  return item.data.length;
}

// ─── START PRACTICE ───────────────────────────────────────────────────────────
function startPractice(secIdx, itemIdx) {
  const item = PRACTICE_MENU[secIdx].items[itemIdx];
  state.mode             = 'practice';
  state.practiceType     = item.type;
  state.practiceLabelKey = item.labelKey;
  state.questions        = flattenQuestions(item);
  state.currentIdx       = 0;
  state.answers          = [];
  state.reviewMode       = false;
  renderPracticeQuestion();
}

function flattenQuestions(item) {
  const { type, data } = item;
  if (['grammar_passage','reading_short','reading_medium','info_retrieval'].includes(type)) {
    const flat = [];
    data.forEach(group => {
      const qs = group.questions || group.blanks || [];
      qs.forEach((q, qi) => flat.push({ group, q, qi, type, isGroupFirst:qi===0, isGroupLast:qi===qs.length-1 }));
    });
    return flat;
  }
  return data.map(q => ({ q, type, group:null }));
}

// ─── PRACTICE QUESTION RENDERER ───────────────────────────────────────────────
function renderPracticeQuestion() {
  stopSpeech();
  _isReading = false;
  const total = state.questions.length, idx = state.currentIdx;
  if (idx >= total) { showPracticeResults(); return; }

  const item      = state.questions[idx];
  const answered  = state.answers[idx];
  const progress  = Math.round((idx / total) * 100);
  let colorClass;
  if (state.practiceType === 'wrong_review') {
    colorClass = 'review';
  } else {
    const secNum = sectionOfType(item.type);
    colorClass = secNum ? ['sec1','sec2','sec3'][secNum - 1] : 'review';
  }

  render(`
    ${header(state.practiceLabelKey)}
    <div class="q-screen">
      <div class="progress-bar-wrap">
        <div class="progress-bar ${colorClass}" style="width:${progress}%"></div>
      </div>
      <div class="q-counter">${idx + 1} / ${total}</div>
      <div class="q-card" id="q-card">
        ${buildQuestionHTML(item, answered)}
      </div>
      <div class="q-nav">
        ${idx > 0 ? `<button class="btn-nav" onclick="prevQuestion()">${t('prevBtn')}</button>` : '<span></span>'}
        ${answered !== undefined
          ? `<button class="btn-nav primary" onclick="nextQuestion()">
               ${idx === total - 1 ? t('finishBtn') : t('nextBtn')}
             </button>`
          : '<span></span>'}
      </div>
    </div>
  `);

  const isListening = ['listening_task','listening_keypoint'].includes(item.type);
  if (isListening) initListeningUI(item);
  if (item.type === 'grammar_ordering') initOrderingUI(item);
  if (!isListening && !state.reviewMode) autoReadQuestion();
}

function sectionOfType(type) {
  if (['kanji_reading','kanji_writing','context_vocab','synonym'].includes(type)) return 1;
  if (['grammar_particle','grammar_ordering','grammar_passage','reading_short','reading_medium','info_retrieval'].includes(type)) return 2;
  if (['listening_task','listening_keypoint','listening_expression','listening_quickresponse'].includes(type)) return 3;
  return 0;
}

// ─── QUESTION HTML BUILDERS ───────────────────────────────────────────────────
function buildQuestionHTML(item, answered) {
  switch (item.type) {
    case 'kanji_reading':          return buildKanjiReading(item, answered);
    case 'kanji_writing':          return buildKanjiWriting(item, answered);
    case 'context_vocab':          return buildContextVocab(item, answered);
    case 'synonym':                return buildSynonym(item, answered);
    case 'grammar_particle':       return buildGrammarParticle(item, answered);
    case 'grammar_ordering':       return buildGrammarOrdering(item, answered);
    case 'grammar_passage':        return buildGrammarPassage(item, answered);
    case 'reading_short':          return buildReading(item, answered, 'qtype_reading_short');
    case 'reading_medium':         return buildReading(item, answered, 'qtype_reading_medium');
    case 'info_retrieval':         return buildInfoRetrieval(item, answered);
    case 'listening_task':
    case 'listening_keypoint':     return buildListening(item, answered);
    case 'listening_expression':   return buildListeningExpression(item, answered);
    case 'listening_quickresponse':return buildListeningQR(item, answered);
    default: return '<p>Unknown type</p>';
  }
}

// Type label row with integrated 🔊 read-aloud button
function typeRow(key, item) {
  return `<div class="q-type-row"><div class="q-type-label">${t(key)}</div>${readBtn(item)}</div>`;
}

function optionButtons(options, answer, answered, fn) {
  return options.map((opt, i) => {
    let cls = 'opt-btn';
    if (answered !== undefined) {
      if (i === answer)                                cls += ' correct';
      else if (i === answered.chosen && i !== answer) cls += ' wrong';
    }
    const disabled = answered !== undefined ? 'disabled' : '';
    return `<button class="opt-btn ${cls}" ${disabled} onclick="${fn}(${i})">${String.fromCharCode(65+i)}．${opt}</button>`;
  }).join('');
}

function expl(item) {
  const q = item.q;
  return (lang === 'zh' && q.explanationZh) ? q.explanationZh : (q.explanation || '');
}

function feedbackHtml(item, answered) {
  if (answered === undefined) return '';
  const ok  = answered.correct;
  const exp = expl(item);
  return `
    <div class="feedback ${ok ? 'feedback-ok' : 'feedback-ng'}">
      ${ok ? t('correct') : t('incorrect')}
      ${exp ? `<div class="explanation">${exp}</div>` : ''}
    </div>`;
}

function buildKanjiReading(item, answered) {
  const q = item.q;
  return `
    ${typeRow('qtype_kanji_reading', item)}
    <div class="q-sentence jp" style="font-size:1.4rem">${q.sentence}</div>
    <div class="q-instruction">${t('instr_kanji_reading_pre')}${q.kanji}${t('instr_kanji_reading_post')}</div>
    <div class="options">${optionButtons(q.options, q.answer, answered, 'answerSimple')}</div>
    ${feedbackHtml(item, answered)}`;
}

function buildKanjiWriting(item, answered) {
  const q = item.q;
  return `
    ${typeRow('qtype_kanji_writing', item)}
    <div class="q-sentence jp">${q.sentence.replace('___','<span class="blank-box">（　）</span>')}</div>
    <div class="q-instruction">（　）${t('instr_kanji_writing')}<strong class="jp">${q.hint}</strong></div>
    <div class="options">${optionButtons(q.options, q.answer, answered, 'answerSimple')}</div>
    ${feedbackHtml(item, answered)}`;
}

function buildContextVocab(item, answered) {
  const q = item.q;
  return `
    ${typeRow('qtype_context_vocab', item)}
    <div class="q-sentence jp">${q.sentence}</div>
    <div class="q-instruction">${t('instr_context')}</div>
    <div class="options">${optionButtons(q.options, q.answer, answered, 'answerSimple')}</div>
    ${feedbackHtml(item, answered)}`;
}

function buildSynonym(item, answered) {
  const q = item.q;
  return `
    ${typeRow('qtype_synonym', item)}
    <div class="q-sentence jp">${q.sentence.replace(q.underlined, `<u class="key-word">${q.underlined}</u>`)}</div>
    <div class="q-instruction">${t('instr_synonym_pre')}<strong class="jp">${q.underlined}</strong>${t('instr_synonym_post')}</div>
    <div class="options">${optionButtons(q.options, q.answer, answered, 'answerSimple')}</div>
    ${feedbackHtml(item, answered)}`;
}

function buildGrammarParticle(item, answered) {
  const q = item.q;
  return `
    ${typeRow('qtype_grammar_particle', item)}
    <div class="q-sentence jp">${q.sentence}</div>
    <div class="q-instruction">${t('instr_grammar')}</div>
    <div class="options">${optionButtons(q.options, q.answer, answered, 'answerSimple')}</div>
    ${feedbackHtml(item, answered)}`;
}

function buildGrammarOrdering(item, answered) {
  const q = item.q;
  if (answered !== undefined) {
    const orderedWords = q.correctOrder.map(i => q.words[i]);
    const wordSpans = orderedWords.map((w, pos) => {
      const cls = pos === q.starSlot ? 'slot-star' : '';
      return `<span class="slot-word ${cls}">${pos === q.starSlot ? '★ ' : ''}${w}</span>`;
    }).join(' ');
    const exp = (lang === 'zh' && q.explanationZh) ? q.explanationZh : q.explanation;
    return `
      ${typeRow('qtype_grammar_ordering', item)}
      <div class="ordering-prompt">
        <span class="jp before-after">${q.before}</span>
        ${wordSpans}
        <span class="jp before-after">${q.after}</span>
      </div>
      <div class="q-instruction">${t('instr_star_q')}</div>
      <div class="options">${optionButtons(q.words, q.answer, answered, 'answerOrdering')}</div>
      <div class="feedback ${answered.correct ? 'feedback-ok' : 'feedback-ng'}">
        ${answered.correct ? t('correct') : t('incorrect')}
        ${exp ? `<div class="explanation">${exp}</div>` : ''}
      </div>
      <div class="full-sentence-box">${t('fullSentence')}<span class="jp">${q.fullSentence}</span></div>`;
  }
  const slots = q.correctOrder.map((_, pos) => {
    const star = pos === q.starSlot ? ' ★' : '';
    return `<div class="slot empty" id="slot-${pos}" data-pos="${pos}" onclick="slotClick(${pos})">${star || '_'}</div>`;
  }).join('');
  const wordBtns = q.words.map((w, wi) =>
    `<button class="word-tile" id="word-${wi}" data-wi="${wi}" onclick="wordTileClick(${wi})">${w}</button>`
  ).join('');
  return `
    ${typeRow('qtype_grammar_ordering', item)}
    <div class="ordering-instruction">
      <strong class="jp">${q.before}</strong>
      <div class="slots-row" id="slots-row">${slots}</div>
      <strong class="jp">${q.after}</strong>
    </div>
    <p class="q-instruction">${t('instr_ordering')}</p>
    <div class="word-tiles" id="word-tiles">${wordBtns}</div>
    <div class="ordering-controls">
      <button class="btn-secondary" onclick="resetOrdering()">${t('resetBtn')}</button>
      <button class="btn-primary" id="check-order-btn" onclick="checkOrdering()" disabled>${t('checkBtn')}</button>
    </div>`;
}

function buildGrammarPassage(item, answered) {
  const { group, q, qi } = item;
  const total = group.blanks.length;
  const exp   = (lang === 'zh' && q.explanationZh) ? q.explanationZh : q.explanation;
  return `
    ${typeRow('qtype_grammar_passage', item)}
    <div class="passage-box jp">${highlightBlank(group.passage, q.label)}</div>
    <div class="q-instruction">（${qi+1}/${total}）（${q.label}${t('instr_passage_blank_post')}</div>
    <div class="options">${optionButtons(q.options, q.answer, answered, 'answerSimple')}</div>
    ${answered !== undefined ? `
      <div class="feedback ${answered.correct ? 'feedback-ok' : 'feedback-ng'}">
        ${answered.correct ? t('correct') : t('incorrect')}
        ${exp ? `<div class="explanation">${exp}</div>` : ''}
      </div>` : ''}`;
}

function highlightBlank(text, label) {
  return text.replace(new RegExp(`（${label}）`,'g'), `<span class="target-blank">（${label}）</span>`);
}

function buildReading(item, answered, typeKey) {
  const { group, q, qi } = item;
  const total = group.questions.length;
  const exp   = (lang === 'zh' && q.explanationZh) ? q.explanationZh : q.explanation;
  return `
    ${typeRow(typeKey, item)}
    <div class="passage-box jp">${group.passage}</div>
    <div class="q-instruction">（${qi+1}/${total}）${q.q}</div>
    <div class="options">${optionButtons(q.options, q.answer, answered, 'answerSimple')}</div>
    ${answered !== undefined ? `
      <div class="feedback ${answered.correct ? 'feedback-ok' : 'feedback-ng'}">
        ${answered.correct ? t('correct') : t('incorrect')}
        ${exp ? `<div class="explanation">${exp}</div>` : ''}
      </div>` : ''}`;
}

function buildInfoRetrieval(item, answered) {
  const { group, q, qi } = item;
  const total = group.questions.length;
  const exp   = (lang === 'zh' && q.explanationZh) ? q.explanationZh : q.explanation;
  return `
    ${typeRow('qtype_info_retrieval', item)}
    <div class="notice-box">
      <div class="notice-title">${group.title}</div>
      <pre class="notice-content jp">${group.passage}</pre>
    </div>
    <div class="q-instruction">（${qi+1}/${total}）${q.q}</div>
    <div class="options">${optionButtons(q.options, q.answer, answered, 'answerSimple')}</div>
    ${answered !== undefined ? `
      <div class="feedback ${answered.correct ? 'feedback-ok' : 'feedback-ng'}">
        ${answered.correct ? t('correct') : t('incorrect')}
        ${exp ? `<div class="explanation">${exp}</div>` : ''}
      </div>` : ''}`;
}

function buildListening(item, answered) {
  const q = item.q;
  const typeKey = item.type === 'listening_task' ? 'qtype_listening_task' : 'qtype_listening_keypoint';
  return `
    ${typeRow(typeKey, item)}
    <div class="situation-box">&#128203; ${q.situation}</div>
    <div class="audio-controls">
      <button class="btn-audio" id="play-btn" onclick="playScript()">${t('playBtn')}</button>
      <button class="btn-script" onclick="toggleScript()">${t('showScript')}</button>
    </div>
    <div id="script-box" class="script-box hidden jp">${q.script.replace(/\n/g,'<br>')}</div>
    <div class="q-instruction">${q.question}</div>
    <div class="options">${optionButtons(q.options, q.answer, answered, 'answerSimple')}</div>
    ${feedbackHtml(item, answered)}`;
}

function buildListeningExpression(item, answered) {
  const q = item.q;
  return `
    ${typeRow('qtype_listening_expression', item)}
    <div class="situation-box">${q.image || '&#127908;'} ${q.situation}</div>
    <div class="audio-controls">
      <button class="btn-audio" onclick="speakText('${q.situation.replace(/'/g,"\\'")}')">${t('speakBtn')}</button>
    </div>
    <div class="q-instruction">${t('exprInstr')}</div>
    <div class="options">${optionButtons(q.options, q.answer, answered, 'answerSimple')}</div>
    ${feedbackHtml(item, answered)}`;
}

function buildListeningQR(item, answered) {
  const q = item.q;
  return `
    ${typeRow('qtype_listening_quickresponse', item)}
    <div class="qr-prompt">
      <button class="btn-audio inline" onclick="speakText('${q.prompt.replace(/「|」/g,'').replace(/'/g,"\\'")}')">&#9654;</button>
      <span class="jp qr-text">${q.prompt}</span>
    </div>
    <div class="q-instruction">${t('listenQR')}</div>
    <div class="options">${optionButtons(q.options, q.answer, answered, 'answerSimple')}</div>
    ${feedbackHtml(item, answered)}`;
}

// ─── LISTENING HELPERS ────────────────────────────────────────────────────────
let currentScript = '';
function initListeningUI(item) { currentScript = item.q.script; }
function playScript() {
  const btn = document.getElementById('play-btn');
  if (btn) { btn.textContent = t('playingBtn'); btn.disabled = true; }
  speak(currentScript, () => {
    if (btn) { btn.textContent = t('replayBtn'); btn.disabled = false; }
  });
}
function toggleScript() {
  const box = document.getElementById('script-box');
  if (box) box.classList.toggle('hidden');
}
function speakText(text) { speak(text); }

// ─── GRAMMAR ORDERING HELPERS ──────────────────────────────────────────────────
let orderSlots = [], orderWords = [];
function initOrderingUI(item) {
  const q = item.q;
  orderSlots = new Array(q.words.length).fill(-1);
  orderWords = new Array(q.words.length).fill(-1);
}
function wordTileClick(wi) {
  const q = state.questions[state.currentIdx].q;
  if (orderWords[wi] !== -1) {
    orderSlots[orderWords[wi]] = -1; orderWords[wi] = -1;
    updateOrderUI(q); return;
  }
  const emptySlot = orderSlots.findIndex(s => s === -1);
  if (emptySlot === -1) return;
  orderSlots[emptySlot] = wi; orderWords[wi] = emptySlot;
  updateOrderUI(q);
}
function slotClick(pos) {
  const wi = orderSlots[pos]; if (wi === -1) return;
  orderSlots[pos] = -1; orderWords[wi] = -1;
  updateOrderUI(state.questions[state.currentIdx].q);
}
function updateOrderUI(q) {
  orderSlots.forEach((wi, pos) => {
    const el = document.getElementById(`slot-${pos}`); if (!el) return;
    const star = pos === q.starSlot ? '★ ' : '';
    if (wi === -1) { el.textContent = star || '_'; el.classList.add('empty'); }
    else           { el.textContent = star + q.words[wi]; el.classList.remove('empty'); }
  });
  q.words.forEach((_, wi) => {
    const btn = document.getElementById(`word-${wi}`); if (!btn) return;
    btn.disabled = orderWords[wi] !== -1;
    btn.classList.toggle('placed', orderWords[wi] !== -1);
  });
  const checkBtn = document.getElementById('check-order-btn');
  if (checkBtn) checkBtn.disabled = orderSlots.some(s => s === -1);
}
function resetOrdering() {
  const q = state.questions[state.currentIdx].q;
  orderSlots.fill(-1); orderWords.fill(-1); updateOrderUI(q);
}
function checkOrdering() {
  const item = state.questions[state.currentIdx];
  answerOrdering(orderSlots[item.q.starSlot]);
}

// ─── ANSWER HANDLERS ──────────────────────────────────────────────────────────
function answerSimple(chosen) {
  const item = state.questions[state.currentIdx];
  const isCorrect = chosen === item.q.answer;
  recordAnswer(getItemId(item), isCorrect);
  state.answers[state.currentIdx] = { correct: isCorrect, chosen, answer: item.q.answer };
  if (state.mode === 'mock') { renderMockQuestionWithChoice(chosen); return; }
  renderPracticeQuestion();
}
function answerOrdering(chosen) {
  const item = state.questions[state.currentIdx];
  const isCorrect = chosen === item.q.answer;
  recordAnswer(getItemId(item), isCorrect);
  state.answers[state.currentIdx] = { correct: isCorrect, chosen, answer: item.q.answer };
  if (state.mode === 'mock') return;
  renderPracticeQuestion();
}
function prevQuestion() { if (state.currentIdx > 0) { state.currentIdx--; renderPracticeQuestion(); } }
function nextQuestion()  { state.currentIdx++; renderPracticeQuestion(); }

// ─── PRACTICE RESULTS ─────────────────────────────────────────────────────────
function showPracticeResults() {
  stopSpeech();
  const total   = state.questions.length;
  const correct = state.answers.filter(a => a && a.correct).length;
  const pct     = Math.round((correct / total) * 100);
  if (state.practiceType !== 'wrong_review') saveProgress(state.practiceType, total, correct);

  const emoji = pct >= 80 ? '🎉' : pct >= 60 ? '👍' : '📚';
  const msg   = pct >= 80 ? t('msgExcellent') : pct >= 60 ? t('msgGood') : t('msgTryMore');

  render(`
    ${header(state.practiceLabelKey)}
    <div class="results-screen">
      <div class="result-card">
        <div class="result-emoji">${emoji}</div>
        <h2>${msg}</h2>
        <div class="score-circle">
          <span class="score-num">${correct}</span>
          <span class="score-den">/ ${total}</span>
        </div>
        <div class="score-pct">${pct}%</div>
      </div>
      <div class="result-actions">
        <button class="btn-primary" onclick="startReview()">${t('reviewBtn')}</button>
        <button class="btn-secondary" onclick="goHome()">${t('homeBtn')}</button>
      </div>
    </div>
  `);
}

function startReview() {
  state.reviewMode = true; state.currentIdx = 0; renderReviewQuestion();
}
function renderReviewQuestion() {
  const total = state.questions.length, idx = state.currentIdx;
  if (idx >= total) { showPracticeResults(); return; }
  const item     = state.questions[idx];
  const answered = state.answers[idx] || { correct:false, chosen:-1, answer:item.q.answer };
  render(`
    ${header(state.practiceLabelKey)}
    <div class="q-screen">
      <div class="q-counter">${idx + 1} / ${total}</div>
      <div class="q-card">${buildQuestionHTML(item, answered)}</div>
      <div class="q-nav">
        ${idx > 0 ? `<button class="btn-nav" onclick="reviewPrev()">${t('prevReview')}</button>` : '<span></span>'}
        <button class="btn-nav primary" onclick="reviewNext()">
          ${idx === total - 1 ? t('toResult') : t('nextReview')}
        </button>
      </div>
    </div>
  `);
}
function reviewPrev() { state.currentIdx--; renderReviewQuestion(); }
function reviewNext() { state.currentIdx++; renderReviewQuestion(); }

// ─── MOCK TEST ────────────────────────────────────────────────────────────────
function startMockTest() {
  state.mode = 'mock'; state.mockSectionIdx = 0; state.mockResults = [];
  startMockSection(0);
}

function startMockSection(secIdx) {
  const secDef = Object.values(MOCK_TEST)[secIdx];
  state.mockSectionIdx = secIdx;
  state.practiceLabelKey = secDef.titleKey;

  const flatItems = [];
  secDef.groups.forEach(g => {
    flattenQuestions({ type:g.type, data:g.data }).forEach(f => flatItems.push(f));
  });
  state.questions = flatItems;
  state.currentIdx = 0;
  state.answers = [];

  const secNum     = secIdx + 1;
  const colorClass = ['sec1','sec2','sec3'][secIdx];
  const secName    = t(secDef.titleKey).replace(/第\d節[：:]/,'');

  render(`
    <div class="mock-intro ${colorClass}">
      <div class="mock-intro-inner">
        <div class="mock-section-num">第${secNum}節</div>
        <h2>${secName}</h2>
        <div class="mock-time">${t('timeLimit')}${secDef.time / 60}${t('min')}</div>
        <div class="mock-note">${t('secIntroNote')}</div>
        <button class="btn-primary large" onclick="enterMockSection()">${t('startBtn')}</button>
      </div>
    </div>
  `);
}

function enterMockSection() {
  startTimer(Object.values(MOCK_TEST)[state.mockSectionIdx].time);
  renderMockQuestion();
}

function renderMockQuestion() {
  stopSpeech();
  _isReading = false;
  const total = state.questions.length, idx = state.currentIdx;
  if (idx >= total) { finishMockSection(); return; }

  const item     = state.questions[idx];
  const progress = Math.round((idx / total) * 100);

  render(`
    ${header(state.practiceLabelKey, true)}
    <div class="q-screen mock-q-screen">
      <div class="progress-bar-wrap">
        <div class="progress-bar sec${state.mockSectionIdx+1}" style="width:${progress}%"></div>
      </div>
      <div class="q-counter">${idx + 1} / ${total}</div>
      <div class="q-card" id="q-card">${buildQuestionHTML(item, undefined)}</div>
      <div class="q-nav">
        ${idx > 0 ? `<button class="btn-nav" onclick="mockPrev()">${t('prevBtn')}</button>` : '<span></span>'}
        <button class="btn-nav primary" onclick="mockNext()">
          ${idx === total - 1 ? t('endSectionBtn') : t('nextBtn')}
        </button>
      </div>
    </div>
  `);

  updateTimerUI();
  if (['listening_task','listening_keypoint'].includes(item.type)) initListeningUI(item);
  if (item.type === 'grammar_ordering') initOrderingUI(item);
}

function renderMockQuestionWithChoice(chosen) {
  document.querySelectorAll('.options .opt-btn').forEach((btn, i) => {
    btn.classList.toggle('selected', i === chosen);
    btn.disabled = true;
  });
}

function mockPrev() { state.currentIdx--; renderMockQuestion(); }
function mockNext() {
  state.currentIdx++;
  if (state.currentIdx >= state.questions.length) finishMockSection();
  else renderMockQuestion();
}

function finishMockSection() {
  stopTimer(); stopSpeech();
  const total   = state.questions.length;
  const correct = state.answers.filter(a => a && a.correct).length;
  state.mockResults.push({ titleKey: state.practiceLabelKey, total, correct });

  const nextIdx = state.mockSectionIdx + 1;
  if (nextIdx < Object.keys(MOCK_TEST).length) showSectionBreak(correct, total, nextIdx);
  else showMockFinalResults();
}

function showSectionBreak(correct, total, nextIdx) {
  const pct    = Math.round((correct / total) * 100);
  const secNum = state.mockSectionIdx + 1;
  render(`
    <div class="section-break">
      <h2>第${secNum}節　${t('sectionEnd')}</h2>
      <div class="break-score">${correct} / ${total}（${pct}%）</div>
      <p>${t('nextSecNote')}</p>
      <button class="btn-primary large" onclick="startMockSection(${nextIdx})">
        ${t('nextSecPre')}${nextIdx + 1}${t('nextSecPost')}
      </button>
      <button class="btn-secondary" onclick="showMockFinalResults()">${t('endTestBtn')}</button>
    </div>
  `);
}

function showMockFinalResults() {
  stopTimer();
  let totalQ = 0, totalC = 0;
  const rows = state.mockResults.map(r => {
    totalQ += r.total; totalC += r.correct;
    const pct = Math.round((r.correct / r.total) * 100);
    return `
      <div class="result-row">
        <span>${t(r.titleKey)}</span>
        <span class="result-score">${r.correct}/${r.total}</span>
        <span class="result-pct ${pct>=60?'pass':'fail'}">${pct}%</span>
      </div>`;
  }).join('');

  const totalPct = Math.round((totalC / totalQ) * 100);
  const pass     = totalPct >= 60;

  render(`
    <div class="results-screen">
      <div class="result-card">
        <div class="result-emoji">${pass ? '🎉' : '📚'}</div>
        <h2>${t('mockResult')}</h2>
        <div class="score-circle">
          <span class="score-num">${totalC}</span>
          <span class="score-den">/ ${totalQ}</span>
        </div>
        <div class="score-pct ${pass?'pass':'fail'}">${totalPct}%　${pass ? t('passLabel') : t('failLabel')}</div>
        <div class="results-breakdown">${rows}</div>
      </div>
      <div class="result-actions">
        <button class="btn-primary" onclick="goHome()">${t('homeBtn')}</button>
      </div>
    </div>
  `);
}

// ─── INIT ─────────────────────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', goHome);
