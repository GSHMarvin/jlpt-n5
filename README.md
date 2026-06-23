# JLPT N5 練習題庫

**Live repo:** https://github.com/GSHMarvin/jlpt-n5

A vanilla-JS single-page practice app covering all 10 JLPT N5 question types across three exam sections. No build step — open `index.html` or serve the folder with any static HTTP server.

## Features

- **10 question types** — 漢字讀音, 漢字書寫, 前後文脈, 近義詞, 句子文法, 句子排列, 文章文法, 短篇/中篇閱讀, 資訊搜尋, 聽解 (4 sub-types)
- **Practice mode** — immediate feedback with bilingual explanations after each answer
- **Mock test mode** — timed full exam (3 sections, 90 min total), no mid-test feedback
- **Bilingual UI** — Traditional Chinese (zh-TW) and Japanese, toggled per session
- **Wrong-answer drill** — tracks every answer in `localStorage`; surfaces weak questions sorted by error count; a question is "mastered" after 2 consecutive correct answers
- **Read-aloud** — 🔊 button on every question reads the Japanese text via Web Speech API; optional auto-read mode

## Quick start

```bash
cd jlpt-n5
python3 -m http.server 7890
# open http://localhost:7890
```

## File structure

```
index.html
css/style.css
js/
  i18n.js       — UI strings (zh-TW / ja)
  questions.js  — Question bank + PRACTICE_MENU + MOCK_TEST config
  history.js    — Answer history, wrong-question tracking, read-aloud helpers
  app.js        — SPA logic, renderers, state machine
```

## Notes for Taiwan candidates

「聽解」和「句子排列（第2節問題2）」最容易失分，建議利用「複習錯題」功能針對弱點加強練習。
