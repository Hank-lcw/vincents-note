# Vincent's note

實證投資理財筆記網站。網站用 Astro 產生，文章在網頁後台（`/admin`）撰寫，按下發布後約 1–2 分鐘自動更新上線。

## 一次性設定（約 30 分鐘）

### 1. 把程式碼放上 GitHub
1. 到 github.com 註冊帳號。
2. 右上角「+」→ New repository，名稱填 `vincents-note`，選 Private 或 Public 都可以，按 Create。
3. 在新儲存庫頁面點「uploading an existing file」，把這個資料夾裡的**所有檔案與資料夾**拖進去（包含 `public`、`src` 以及 `.gitignore`），按 Commit changes。

### 2. 改一行後台設定
在 GitHub 上打開 `public/admin/config.yml`，按鉛筆圖示編輯，把
```
repo: YOUR-GITHUB-NAME/vincents-note
```
改成你的帳號名稱，例如 `repo: vincentlin/vincents-note`，然後 Commit。

### 3. 讓網站自動上線（Cloudflare，免費）
1. 到 dash.cloudflare.com 註冊並登入。
2. 進入「Workers & Pages」→ 建立 → 選擇從 GitHub 匯入儲存庫，授權並選 `vincents-note`。
3. 建置設定：
   - 框架預設：Astro
   - 建置指令：`npm run build`
   - 輸出目錄：`dist`
4. 部署完成後會拿到一個網址（例如 `https://vincents-note.pages.dev`）。

之後只要 GitHub 有更新（包含你在後台發布文章），網站就會自動重新建置。

> 拿到正式網址後，把 `astro.config.mjs` 的 `site` 與 `public/admin/config.yml` 的 `site_url`、`display_url` 改成你的網址。

### 4. 建立後台登入用的金鑰
1. GitHub 右上角頭像 → Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token。
2. Repository access 選「Only select repositories」→ 選 `vincents-note`。
3. Permissions → Repository permissions → **Contents** 設為 **Read and write**。
4. 產生後複製金鑰，存在密碼管理器裡（只會顯示一次）。

### 5. 登入後台
打開 `你的網址/admin`，選擇用存取金鑰（token）登入，貼上剛才的金鑰。

## 日常使用

**寫新文章**：後台 →「投資筆記」→ 新增。欄位說明：

| 欄位 | 說明 |
|---|---|
| 標題 | 文章標題 |
| 網址代稱 | 網址最後一段，小寫英文與 `-`，例如 `rebalancing-frequency`。發布後別再改，否則舊連結會失效 |
| 主題 | 三選一，首頁可依主題篩選 |
| 證據等級 | A 多項研究一致／B 單篇研究支持／C 觀點與經驗 |
| 列表摘要 | 首頁列表上的一兩句介紹 |
| 重點摘要 | 文章開頭的重點框，每點一句 |
| 內文 | 用「標題 2」分段，右側目錄會自動產生 |
| 參考文獻 | 依序填寫。內文打 `[1]`、`[2]` 會自動連到對應文獻 |
| 草稿 | 勾選後先不公開 |

**插入圖片**：在內文編輯器裡用插入圖片，上傳後自動存到網站。

**修改首頁文字或關於我**：後台 →「網站設定」→「首頁文字與關於我」。

**電子報**：若之後使用電子報服務（例如 Buttondown、MailerLite、Substack），把訂閱頁網址填到「網站設定」的「訂閱連結」，首頁就會出現訂閱按鈕。

## 在自己電腦預覽（選用）
需安裝 Node.js 22.12 以上：
```
npm install
npm run dev
```
打開 http://localhost:4321

## 檔案位置
- 文章：`src/content/notes/*.md`
- 首頁文字：`src/data/site.json`
- 樣式（顏色、字體）：`src/styles/global.css` 最上方的變數
- 後台設定：`public/admin/config.yml`
