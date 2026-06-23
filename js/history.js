// history.js — Answer history, wrong-question tracking, and read-aloud helpers

// ─── History data ─────────────────────────────────────────────────────────────
// Schema per question: { correct, wrong, streak, lastResult, lastDate }
// A question is considered "mastered" once streak >= 2 (two consecutive correct).

function loadHistory() {
  return JSON.parse(localStorage.getItem('jlpt_n5_history') || '{}');
}
function saveHistory(data) {
  localStorage.setItem('jlpt_n5_history', JSON.stringify(data));
}

function recordAnswer(qId, isCorrect) {
  const h = loadHistory();
  if (!h[qId]) h[qId] = { correct:0, wrong:0, streak:0 };
  if (isCorrect) { h[qId].correct++; h[qId].streak = (h[qId].streak||0) + 1; }
  else           { h[qId].wrong++;   h[qId].streak = 0; }
  h[qId].lastResult = isCorrect ? 'correct' : 'wrong';
  h[qId].lastDate   = new Date().toISOString().split('T')[0];
  saveHistory(h);
}

// Generate a stable ID for any flat question item (including nested passage questions)
function getItemId(item) {
  if (!item.group) return item.q.id || 'unknown';
  const suffix = item.group.blanks ? `_b${item.qi}` : `_q${item.qi}`;
  return item.group.id + suffix;
}

// Questions "needing review": ever wrong AND streak < 2
function needsReview(histEntry) {
  return histEntry && histEntry.wrong > 0 && (histEntry.streak || 0) < 2;
}

function getWrongCount() {
  const h = loadHistory();
  return Object.values(h).filter(needsReview).length;
}

function getTotalStats() {
  const h  = loadHistory();
  const vs = Object.values(h);
  return {
    attempts: vs.reduce((s,v) => s + v.correct + v.wrong, 0),
    correct:  vs.reduce((s,v) => s + v.correct, 0),
    wrongQ:   vs.filter(needsReview).length,
  };
}

// ─── Auto-read state ──────────────────────────────────────────────────────────
let autoRead = localStorage.getItem('jlpt_autoread') === '1';

function toggleAutoRead() {
  autoRead = !autoRead;
  localStorage.setItem('jlpt_autoread', autoRead ? '1' : '0');
  updateAutoReadBtns();
}
function updateAutoReadBtns() {
  document.querySelectorAll('.autoread-toggle').forEach(btn => {
    btn.textContent = autoRead ? t('autoReadOn') : t('autoReadOff');
    btn.classList.toggle('active', autoRead);
  });
}

// ─── Read-aloud helpers ───────────────────────────────────────────────────────
let currentReadText = '';
let _isReading = false;

function stripHTML(s) {
  return s.replace(/<[^>]*>/g, '').replace(/\s+/g,' ').trim();
}

function getReadText(item) {
  const { type, q, group } = item;
  const blank = 'なにか';
  switch (type) {
    case 'kanji_reading':
      return stripHTML(q.sentence);
    case 'kanji_writing':
      return q.sentence.replace('___', q.hint);
    case 'context_vocab':
    case 'grammar_particle':
      return stripHTML(q.sentence).replace(/（　）/g, blank);
    case 'synonym':
      return stripHTML(q.sentence);
    case 'grammar_ordering':
      return q.before + '　' + q.words.join('　') + '　' + q.after;
    case 'grammar_passage':
      return group.passage.replace(/（[①②③④]）/g, blank);
    case 'reading_short':
    case 'reading_medium':
      return group.passage;
    case 'info_retrieval':
      return group.passage;
    case 'listening_task':
    case 'listening_keypoint':
      return q.script;
    case 'listening_expression':
      return q.situation;
    case 'listening_quickresponse':
      return q.prompt.replace(/「|」/g, '');
    default:
      return '';
  }
}

// Called by the 🔊 button in every question card
function readAloud() {
  if (_isReading) {
    stopSpeech();
    _isReading = false;
    _syncReadBtn();
    return;
  }
  if (!currentReadText) return;
  _isReading = true;
  _syncReadBtn();
  speak(currentReadText, () => { _isReading = false; _syncReadBtn(); });
}

function _syncReadBtn() {
  const btn = document.getElementById('read-btn');
  if (btn) btn.innerHTML = _isReading ? '⏹' : '🔊';
}

// Inline read-aloud button HTML (sets currentReadText, returns button HTML)
function readBtn(item) {
  currentReadText = getReadText(item);
  return `<button class="btn-read" id="read-btn" onclick="readAloud()" title="${t('readAloud')}">🔊</button>`;
}

// Trigger auto-read after a question renders (called from app.js)
function autoReadQuestion() {
  if (!autoRead || !currentReadText) return;
  // Small delay so DOM is settled
  setTimeout(() => { if (!_isReading) readAloud(); }, 250);
}
