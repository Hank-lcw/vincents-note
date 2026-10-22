# Vincent Study — 醫師二階國考考古題 MVP

本版位於 public/exam-quiz/，為獨立的靜態頁面；不修改 Vincent's Note 既有首頁、文章或後台。

## 使用流程
1. 選專科：預設 PGY 六科（內、外、婦、兒、急、家），可切換所有專科。
2. 選 103–112 年。各年份內依原本考次與題號排序。
3. 一次呈現一題；選選項，再按送出答案，才會公布正確答案與詳解。
4. 瀏覽器本地保存答題紀錄；無需帳號，不傳送私人作答資料。

## 題庫檔案結構
- public/exam-quiz/bank/manifest.json：counts 字典，key 是 specialty/year，例如 internal/103，value 為題數。
- public/exam-quiz/bank/internal/103.json：題目檔案。其他科別按相同規則分檔；不同考次放在同一年度檔案，保留原題順序。
- public/exam-quiz/assets/：附圖，使用 images: ["assets/figure.png"]。

單一 JSON 檔案形式：
```json
{
  "questions": [
    {
      "id": "103-1-m3-q001",
      "specialty": "internal",
      "year": 103,
      "session": 1,
      "paper": "醫學（三）",
      "number": 1,
      "stem": "核對過的完整題幹",
      "options": ["選項 A", "選項 B", "選項 C", "選項 D"],
      "answer": 1,
      "explanation": "詳解內容",
      "source": { "file": "原檔名", "page": 12 },
      "images": []
    }
  ]
}
```
answer 為 0-based，0=A、1=B；也可以使用字母 A–E。
目前尚未匯入真實國考題目；主頁的兩道示範題不是歷屆試題。

## 收到題庫後的資料品質檢查
- 比對年份、考次、卷別、題號、專科。
- 確保題幹、選項、圖片、答案完整；有爭議的答案需另行核對，不能猜。
- 每檔題數要和 manifest 的 counts 一致；同題跨專科需使用相同 id。
- 原始詳解可能有著作權，未確認合法可公開前，不應上傳至公有儲存庫。

## 本機檢視
從專案根目錄執行 python -m http.server 8000 -d public
在瀏覽器前往 http://localhost:8000/exam-quiz/

## 暫不加入
帳號登入、雲端同步、排行榜、訂閱、AI 自動產生解說、計時排行榜。

未來可考慮錯題複習、隨機混合題、40 題 60 分鐘模考；以讀書效率為優先。

## 錯題本與筆記（2026-10-22 更新）
- 每次答錯自動收錄錯題，包括題目內容、作答選項、正確答案、科別、年度與詳解。
- 首頁點「錯題本」；依科別索引篩選（只顯示有錯題的科別）。
- 每題有「我的筆記」欄位；輸入後即寫入目前瀏覽器 localStorage，關閉頁面重開仍在。
- 錯題詳情可展開查看原題、選項及詳解。
- 無正式題庫前，可在空白錯題本載入示範題；示範錯題與其筆記使用獨立儲存鍵，不與正式題庫混合。
- 正式錯題鍵：vincent-study-wrongbook-v1；示範錯題鍵：vincent-study-demo-wrongbook-v1。
- 重要：**不同網址／不同裝置的 localStorage 不會同步**，清除瀏覽器資料可能遺失筆記。正式公開上線前應加入備份或匯出功能。

## 臨時預覽網址
- 預覽分支：exam-quiz-preview-20261022（與 PR2 開發分支分離）。
- 透過 raw.githack.com 的 **development** 模式讀取公開 GitHub 靜態檔案，不是正式部署；服務可能快取、故障，且未提供 uptime 保證。
- 連結：https://raw.githack.com/Hank-lcw/vincents-note/exam-quiz-preview-20261022/public/exam-quiz/index.html
- 如果後續修改 PR2 分支，需再把新 commit 同步至預覽分支；預覽網址目前固定指向上述分支。
