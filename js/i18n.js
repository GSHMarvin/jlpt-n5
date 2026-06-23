// i18n.js — Traditional Chinese / Japanese UI strings

let lang = localStorage.getItem('jlpt_lang') || 'zh';

function t(key) {
  return (I18N[lang] && I18N[lang][key]) || (I18N.zh[key]) || key;
}

function toggleLang() {
  lang = lang === 'zh' ? 'ja' : 'zh';
  localStorage.setItem('jlpt_lang', lang);
  goHome();
}

const I18N = {

  // ── Traditional Chinese ────────────────────────────────────────────────────
  zh: {
    langToggle: '日本語',
    back: '← 首頁',

    // Home
    subtitle:    '日本語能力試驗 N5 全科練習',
    mockTest:    '模擬考試',
    mockTestSub: '三節完整測驗（90分鐘）',
    tipTitle:    '台灣考生重點提示',
    tipBody:     '「聽解」和「句子排列（第2節問題2）」最容易失分，建議多花時間練習！',

    // Section names (short)
    sec1Name: '文字・語彙',
    sec2Name: '文法・讀解',
    sec3Name: '聽解',

    // Practice menu section titles
    label_s1: '第1節：文字・語彙',
    label_s2: '第2節：文法・讀解',
    label_s3: '第3節：聽解',

    // Practice menu item labels
    label_s1q1: '問題1　漢字讀音',
    label_s1q2: '問題2　漢字書寫',
    label_s1q3: '問題3　前後文脈',
    label_s1q4: '問題4　近義詞',
    label_s2q1: '問題1　句子文法（助詞）',
    label_s2q2: '問題2　句子排列',
    label_s2q3: '問題3　文章文法',
    label_s2q4: '問題4　短篇閱讀',
    label_s2q5: '問題5　中篇閱讀',
    label_s2q6: '問題6　資訊搜尋',
    label_s3q1: '問題1　課題理解',
    label_s3q2: '問題2　重點理解',
    label_s3q3: '問題3　語言表達',
    label_s3q4: '問題4　即時應答',

    // Home screen chip badges
    chip_kanji_reading:          '漢字讀音',
    chip_kanji_writing:          '漢字書寫',
    chip_context_vocab:          '前後文脈',
    chip_synonym:                '近義詞',
    chip_grammar_particle:       '句子文法',
    chip_grammar_ordering:       '句子排列',
    chip_grammar_passage:        '文章文法',
    chip_reading_short:          '短篇閱讀',
    chip_reading_medium:         '中篇閱讀',
    chip_info_retrieval:         '資訊搜尋',
    chip_listening_task:         '課題理解',
    chip_listening_keypoint:     '重點理解',
    chip_listening_expression:   '語言表達',
    chip_listening_quickresponse:'即時應答',

    // Question-card type labels
    qtype_kanji_reading:          '漢字讀音',
    qtype_kanji_writing:          '漢字書寫',
    qtype_context_vocab:          '前後文脈',
    qtype_synonym:                '近義詞',
    qtype_grammar_particle:       '句子文法',
    qtype_grammar_ordering:       '句子排列',
    qtype_grammar_passage:        '文章文法',
    qtype_reading_short:          '內容理解（短篇）',
    qtype_reading_medium:         '內容理解（中篇）',
    qtype_info_retrieval:         '資訊搜尋',
    qtype_listening_task:         '聽解　課題理解',
    qtype_listening_keypoint:     '聽解　重點理解',
    qtype_listening_expression:   '聽解　語言表達',
    qtype_listening_quickresponse:'聽解　即時應答',

    // Practice menu
    menuDesc: '請選擇要練習的題型。',
    qCount:   '題',

    // Instructions
    instr_kanji_reading_pre:  '「',
    instr_kanji_reading_post: '」的讀音是哪個？',
    instr_kanji_writing:      '（　）應填入哪個漢字？平假名提示：',
    instr_context:            '（　）應填入哪個詞？',
    instr_synonym_pre:        '意思最接近「',
    instr_synonym_post:       '」的詞是哪個？',
    instr_grammar:            '（　）應填入哪個詞？',
    instr_ordering:           '請將下方詞語排成正確順序，★ 位置的詞就是答案。',
    instr_star_q:             '★ 位置應填入哪個詞？',
    instr_passage_blank_post: '）應填入哪個詞？',

    // Listening
    playBtn:    '▶ 播放音檔',
    playingBtn: '▶ 播放中…',
    replayBtn:  '▶ 再播放一次',
    showScript: '顯示對話原文',
    listenQR:   '對這個問題最合適的回答是哪個？',
    exprInstr:  '哪種說法最合適？',
    speakBtn:   '▶ 聆聽情境',

    // Ordering
    resetBtn:     '重置',
    checkBtn:     '確認答案',
    fullSentence: '完整句子：',

    // Feedback
    correct:   '✓ 正確！',
    incorrect: '✗ 錯誤',

    // Navigation
    prevBtn:  '← 上一題',
    nextBtn:  '下一題 →',
    finishBtn:'查看結果',

    // Results
    msgExcellent: '太棒了！',
    msgGood:      '做得很好！',
    msgTryMore:   '繼續加油練習！',
    reviewBtn:    '查看解答',
    homeBtn:      '回首頁',
    reviewHeader: '解答檢視：',
    prevReview:   '← 上一題',
    nextReview:   '下一題 →',
    toResult:     '回結果頁',

    // Wrong answer practice & read aloud
    wrongPractice:   '複習錯題',
    wrongBtnSuffix:  '題需加強練習',
    noWrong:         '目前沒有錯題，繼續加油！',
    readAloud:       '朗讀',
    autoReadOn:      '🔊 自動朗讀 開',
    autoReadOff:     '🔇 自動朗讀 關',
    statsAttempts:   '總作答',
    statsTimes:      '次',
    statsAccuracy:   '正確率',
    statsWrong:      '待複習',
    statsSuffix:     '題',

    // Mock test
    secIntroNote:    '作答後請立即進入下一題。',
    timeLimit:       '限制時間：',
    min:             '分',
    startBtn:        '開始測驗',
    endSectionBtn:   '結束本節',
    endTestBtn:      '結束考試',
    mockResult:      '模擬考試　成績',
    passLabel:       '及格線以上',
    failLabel:       '需要加強',
    sectionEnd:      '節　結束',
    nextSecNote:     '繼續進入下一節。',
    nextSecPre:      '進入第',
    nextSecPost:     '節',
  },

  // ── Japanese ───────────────────────────────────────────────────────────────
  ja: {
    langToggle: '中文',
    back: '← ホーム',

    subtitle:    '日本語能力試験 N5 全科目練習',
    mockTest:    '模擬試験',
    mockTestSub: '3節完全テスト（90分）',
    tipTitle:    '台湾受験生へのアドバイス',
    tipBody:     '「聴解」と「文の並び替え（第2節問題2）」で失点しやすいです。重点的に練習しましょう！',

    sec1Name: '文字・語彙',
    sec2Name: '文法・読解',
    sec3Name: '聴解',

    label_s1: '第1節：文字・語彙',
    label_s2: '第2節：文法・読解',
    label_s3: '第3節：聴解',

    label_s1q1: '問題1　漢字の読み方',
    label_s1q2: '問題2　漢字の書き方',
    label_s1q3: '問題3　前後の文脈',
    label_s1q4: '問題4　近義語',
    label_s2q1: '問題1　文の文法（助詞）',
    label_s2q2: '問題2　文の並び替え',
    label_s2q3: '問題3　文章の文法',
    label_s2q4: '問題4　短い文の読解',
    label_s2q5: '問題5　中くらいの読解',
    label_s2q6: '問題6　情報検索',
    label_s3q1: '問題1　課題理解',
    label_s3q2: '問題2　ポイント理解',
    label_s3q3: '問題3　発話表現',
    label_s3q4: '問題4　即時応答',

    chip_kanji_reading:          '漢字読み方',
    chip_kanji_writing:          '漢字書き方',
    chip_context_vocab:          '前後文脈',
    chip_synonym:                '近義語',
    chip_grammar_particle:       '文の文法',
    chip_grammar_ordering:       '文の並び替え',
    chip_grammar_passage:        '文章文法',
    chip_reading_short:          '短篇読解',
    chip_reading_medium:         '中篇読解',
    chip_info_retrieval:         '情報検索',
    chip_listening_task:         '課題理解',
    chip_listening_keypoint:     'ポイント理解',
    chip_listening_expression:   '発話表現',
    chip_listening_quickresponse:'即時応答',

    qtype_kanji_reading:          '漢字の読み方',
    qtype_kanji_writing:          '漢字の書き方',
    qtype_context_vocab:          '前後の文脈',
    qtype_synonym:                '近義語',
    qtype_grammar_particle:       '文の文法',
    qtype_grammar_ordering:       '文の並び替え',
    qtype_grammar_passage:        '文章の文法',
    qtype_reading_short:          '内容理解（短篇）',
    qtype_reading_medium:         '内容理解（中篇）',
    qtype_info_retrieval:         '情報検索',
    qtype_listening_task:         '聴解　課題理解',
    qtype_listening_keypoint:     '聴解　ポイント理解',
    qtype_listening_expression:   '聴解　発話表現',
    qtype_listening_quickresponse:'聴解　即時応答',

    menuDesc: '練習したい問題タイプを選んでください。',
    qCount:   '問',

    instr_kanji_reading_pre:  '「',
    instr_kanji_reading_post: '」の読み方はどれですか。',
    instr_kanji_writing:      'に入る漢字はどれですか。ひらがな：',
    instr_context:            '（　）に入る言葉はどれですか。',
    instr_synonym_pre:        '「',
    instr_synonym_post:       '」に意味が一番近い言葉はどれですか。',
    instr_grammar:            '（　）に入る言葉はどれですか。',
    instr_ordering:           '上の単語を正しい順番に並べてください。★の位置の言葉が答えです。',
    instr_star_q:             '★の位置に入る言葉はどれですか。',
    instr_passage_blank_post: '）に入る言葉はどれですか。',

    playBtn:    '▶ 音声を再生',
    playingBtn: '▶ 再生中...',
    replayBtn:  '▶ もう一度再生',
    showScript: 'スクリプトを表示',
    listenQR:   'この質問に対する適切な返事はどれですか。',
    exprInstr:  'どの言い方が一番適切ですか。',
    speakBtn:   '▶ 状況を聞く',

    resetBtn:     'リセット',
    checkBtn:     '確認する',
    fullSentence: '完成した文：',

    correct:   '✓ 正解！',
    incorrect: '✗ 不正解',

    prevBtn:   '← 上一題',
    nextBtn:   '下一題 →',
    finishBtn: '結果を見る',

    msgExcellent: '素晴らしい！',
    msgGood:      'よくできました！',
    msgTryMore:   'もっと練習しましょう！',
    reviewBtn:    '答え合わせ',
    homeBtn:      'ホームへ',
    reviewHeader: '答え合わせ：',
    prevReview:   '← 前',
    nextReview:   '次 →',
    toResult:     '結果へ',

    // Wrong answer practice & read aloud
    wrongPractice:   '間違い練習',
    wrongBtnSuffix:  '問要復習',
    noWrong:         '間違いはありません！頑張ってください！',
    readAloud:       '読む',
    autoReadOn:      '🔊 自動読み上げ ON',
    autoReadOff:     '🔇 自動読み上げ OFF',
    statsAttempts:   '解答',
    statsTimes:      '回',
    statsAccuracy:   '正答率',
    statsWrong:      '復習待ち',
    statsSuffix:     '問',

    secIntroNote:  '解答後はすぐに次の問題へ進んでください。',
    timeLimit:     '制限時間：',
    min:           '分',
    startBtn:      '開始する',
    endSectionBtn: '節を終了',
    endTestBtn:    '試験を終了する',
    mockResult:    '模擬試験　結果',
    passLabel:     '合格ライン',
    failLabel:     '要練習',
    sectionEnd:    '節　終了',
    nextSecNote:   '次の節に進みます。',
    nextSecPre:    '第',
    nextSecPost:   '節へ進む',
  },
};
