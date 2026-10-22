"use strict";

// Vincent Study | stage-2 medical board practice
// Real questions are loaded lazily from bank/{specialty}/{year}.json.
// Demonstration questions are deliberately NOT represented as past exam items.
const YEARS = [103,104,105,106,107,108,109,110,111,112];
const SUBJECTS = [
  {id:"internal",label:"內科",short:"內",group:"pgy",hint:"Internal Medicine"},
  {id:"surgery",label:"外科",short:"外",group:"pgy",hint:"Surgery"},
  {id:"obgyn",label:"婦產科",short:"婦",group:"pgy",hint:"Obstetrics & Gynecology"},
  {id:"pediatrics",label:"兒科",short:"兒",group:"pgy",hint:"Pediatrics"},
  {id:"emergency",label:"急診醫學科",short:"急",group:"pgy",hint:"Emergency Medicine"},
  {id:"family",label:"家庭醫學科",short:"家",group:"pgy",hint:"Family Medicine"},
  {id:"neurology",label:"神經科",short:"神",group:"other",hint:"Neurology"},
  {id:"psychiatry",label:"精神科",short:"精",group:"other",hint:"Psychiatry"},
  {id:"dermatology",label:"皮膚科",short:"皮",group:"other",hint:"Dermatology"},
  {id:"orthopedics",label:"骨科",short:"骨",group:"other",hint:"Orthopedics"},
  {id:"urology",label:"泌尿科",short:"泌",group:"other",hint:"Urology"},
  {id:"ophthalmology",label:"眼科",short:"眼",group:"other",hint:"Ophthalmology"},
  {id:"ent",label:"耳鼻喉科",short:"耳",group:"other",hint:"Otolaryngology"},
  {id:"anesthesiology",label:"麻醉科",short:"麻",group:"other",hint:"Anesthesiology"},
  {id:"rehabilitation",label:"復健科",short:"復",group:"other",hint:"Rehabilitation"},
  {id:"other",label:"其他",short:"＋",group:"other",hint:"Other"}
];

const DEMO = [
  {
    id:"demo-clinical-1",specialty:"internal",year:null,session:null,number:1,
    stem:"【操作示範，非真實國考題】\n一名患者意識清楚，血糖 45 mg/dL，能安全吞嚥。下列何者是合理的立即處置？",
    options:["立即給予口服快速吸收的葡萄糖","先安排腹部電腦斷層再處置","只需觀察，不必處置","立即安排長期胰島素注射"],
    answer:0,explanation:"意識清楚且能安全吞嚥的低血糖患者，可先給予約 15–20 g 快速吸收的醣類，再於約 15 分鐘後重新測量血糖。示範題只用於測試作答介面，並非任何年份的正式國考題。"
  },
  {
    id:"demo-clinical-2",specialty:"emergency",year:null,session:null,number:2,
    stem:"【操作示範，非真實國考題】\n遇到成人心跳停止且無正常呼吸時，目擊者在確認環境安全後，最重要的初步處置為何？",
    options:["請患者站起來活動","立即啟動緊急救援並開始高品質 CPR","先餵食飲水","等待自行恢復"],
    answer:1,explanation:"應立即啟動緊急救護系統、取得 AED，並依適用的 BLS 流程進行高品質 CPR。此為介面展示資料，不計入真實考古題庫。"
  }
];

const root = document.getElementById("app");
let manifest = {counts:{}};
let answers = loadSavedAnswers();
let state = {view:"home",scope:"pgy",subject:null,year:null,questions:[],index:0,selected:null,demo:false,error:null,wrongFilter:"all"};
let demoAnswers = {};
let wrongBook = loadWrongBook();
let demoWrongBook = {};

function loadWrongBook(){
  try {
    const data=JSON.parse(localStorage.getItem("vincent-study-wrongbook-v1") || "{}");
    return data && typeof data==="object" && !Array.isArray(data) ? data : {};
  } catch (_) { return {}; }
}
function persistWrongBook(){
  try {
    localStorage.setItem("vincent-study-wrongbook-v1",JSON.stringify(wrongBook));
    return true;
  } catch (_) { return false; }
}
function allWrongItems(){
  return [...Object.values(wrongBook),...Object.values(demoWrongBook)]
    .filter(item=>item && typeof item.id==="string" && typeof item.stem==="string")
    .sort((a,b)=>String(b.at||"").localeCompare(String(a.at||"")));
}
function collectWrong(q,selected){
  const record={
    id:q.id,specialty:q.specialty,year:q.year||null,session:q.session||null,
    paper:q.paper||"",number:q.number||null,stem:q.stem,options:q.options,answer:q.answer,
    explanation:q.explanation||"",source:q.source||null,images:q.images||[],
    selected,at:new Date().toISOString(),note:""
  };
  if(state.demo){
    record.demo=true;
    record.note=demoWrongBook[q.id]?.note || "";
    demoWrongBook[q.id]=record;
  } else {
    record.note=wrongBook[q.id]?.note || "";
    wrongBook[q.id]=record;
    persistWrongBook();
  }
}
function openWrongBook(){
  state.view="wrongbook";state.wrongFilter="all";
  render();window.scrollTo(0,0);
}
function sampleWrongBook(){
  const q=normalizeQuestion(DEMO[0]);
  demoWrongBook[q.id]={
    id:q.id,specialty:q.specialty,year:null,session:null,paper:"",number:1,
    stem:q.stem,options:q.options,answer:q.answer,explanation:q.explanation,
    source:null,images:[],selected:1,at:new Date().toISOString(),
    note:demoWrongBook[q.id]?.note || "",demo:true
  };
  openWrongBook();
}
function saveWrongNote(item,value){
  item.note=value;
  return item.demo ? true : persistWrongBook();
}

function loadSavedAnswers(){
  try {
    const value = JSON.parse(localStorage.getItem("vincent-study-answers-v1") || "{}");
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
  } catch (_) { return {}; }
}
function persistAnswers(){
  try {localStorage.setItem("vincent-study-answers-v1",JSON.stringify(answers));} catch (_) {}
}
function el(tag,className,text){
  const node = document.createElement(tag);
  if(className) node.className=className;
  if(text!==undefined) node.textContent=String(text);
  return node;
}
function add(parent,...nodes){nodes.forEach(n=>parent.append(n));return parent;}
function button(label,className,onClick){
  const b=el("button",className,label);b.type="button";b.addEventListener("click",onClick);return b;
}
function setPage(node){root.replaceChildren(node);}
function hero(eyebrow,title,subtitle){
  const wrap=el("div","page-head");
  const left=el("div");
  add(left,el("p","eyebrow",eyebrow),el("h1","",title),el("p","subtitle",subtitle));
  add(wrap,left);return wrap;
}
function getSubject(id){return SUBJECTS.find(s=>s.id===id);}
function countFor(subject,year){
  const raw=(manifest.counts||{})[subject+"/"+year];
  return Number.isInteger(raw) && raw>0 ? raw : 0;
}
function totalFor(subject){return YEARS.reduce((s,y)=>s+countFor(subject,y),0);}
function goHome(){
  state={view:"home",scope:state.scope,subject:null,year:null,questions:[],index:0,selected:null,demo:false,error:null};
  render();window.scrollTo(0,0);
}
function goYears(id){
  state.view="years";state.subject=id;state.year=null;state.error=null;
  render();window.scrollTo(0,0);
}
function breadcrumbs(parts){
  const row=el("nav","breadcrumb");
  parts.forEach((part,i)=>{
    if(i>0) add(row,el("span","","›"));
    if(part.onClick){add(row,button(part.text,"",part.onClick));}
    else add(row,el("span","",part.text));
  });
  return row;
}
function renderHome(){
  const page=el("div");
  const head=hero("MEDICAL BOARD EXAM","用最簡單的方式，練熟每一道考古題。","先選專科，再選 103–112 年的題目。每題作答後才會顯示正確答案與詳解。");
  const wrongCount=allWrongItems().length;
  add(head,button("錯題本"+(wrongCount?" · "+wrongCount:"")+" →","soft-button",openWrongBook));
  add(page,head);
  const section=el("div","section-top");
  add(section,el("h2","","選擇專科"));
  const switcher=el("div","segment");
  [["pgy","PGY 重點"],["all","所有專科"]].forEach(item=>{
    const b=button(item[1],state.scope===item[0]?"active":"",()=>{state.scope=item[0];render();});
    b.setAttribute("aria-pressed",String(state.scope===item[0]));add(switcher,b);
  });
  add(section,switcher);add(page,section);
  const grid=el("div","grid");
  SUBJECTS.filter(s=>state.scope==="all"||s.group==="pgy").forEach(s=>{
    const b=el("button","subject-card");
    b.type="button";b.addEventListener("click",()=>goYears(s.id));
    const top=el("div","card-top");
    add(top,el("span","subject-symbol",s.short),el("span","arrow","↗"));
    const bottom=el("div");
    add(bottom,el("strong","",s.label),el("small","",totalFor(s.id)>0?totalFor(s.id)+" 題已匯入":"題庫待匯入"));
    add(b,top,bottom);add(grid,b);
  });
  add(page,grid);
  const note=el("div","empty-strip");
  const left=el("div");
  add(left,el("strong","","題庫正在建置"),el("p","","目前尚未匯入 103–112 年真實題目。可以先體驗兩道明確標記的示範題，確認操作符合你的習慣。"));
  add(note,left,button("體驗作答 →","soft-button",openDemo));add(page,note);
  setPage(page);
}
function renderYears(){
  const s=getSubject(state.subject);
  const page=el("div");
  add(page,breadcrumbs([{text:"全部專科",onClick:goHome},{text:s.label}]));
  add(page,hero("CHOOSE A YEAR",s.label+" · 年度題庫","選擇考試年度。不同考次的題目會依原始順序排列，並標示第一次或第二次考試。"));
  const grid=el("div","year-grid");
  YEARS.forEach(y=>{
    const n=countFor(s.id,y);
    const b=el("button","year-card"+(n?" available":""));
    b.type="button";b.addEventListener("click",()=>openYear(y));
    add(b,el("strong","",y+" 年"),el("small","",n?n+" 題":"尚未匯入"));add(grid,b);
  });
  add(page,grid);setPage(page);
}
function renderEmpty(){
  const s=getSubject(state.subject);
  const page=el("div");
  add(page,breadcrumbs([{text:"全部專科",onClick:goHome},{text:s.label,onClick:()=>goYears(s.id)},{text:state.year+" 年"}]));
  const box=el("div","empty-state");
  add(box,el("div","empty-icon","▤"),el("h2","",state.error?"題庫讀取失敗":"此年度還沒有題目"),
    el("p","",state.error||"你提供 103–112 年的分科題目與詳解後，會整理成這個年度的題庫。題幹、選項與答案會保留原始出處，避免誤植。"),
    button("返回年度列表","soft-button",()=>goYears(s.id)));
  add(page,box);setPage(page);
}
function normalizeQuestion(q){
  if(!q||typeof q!=="object"||typeof q.id!=="string"||!q.id.trim()||typeof q.stem!=="string")return null;
  let options = Array.isArray(q.options) ? q.options : ["A","B","C","D","E"].filter(k=>q.options&&typeof q.options[k]==="string").map(k=>q.options[k]);
  if(!Array.isArray(options)||options.length<2||options.length>5||options.some(o=>typeof o!=="string"))return null;
  const answer=typeof q.answer==="number"?q.answer:"ABCDE".indexOf(String(q.answer).trim().toUpperCase());
  if(!Number.isInteger(answer)||answer<0||answer>=options.length)return null;
  return {...q,options,answer};
}
async function openYear(year){
  const s=state.subject;
  state.year=year;state.error=null;
  if(countFor(s,year)===0){state.view="empty";render();window.scrollTo(0,0);return;}
  state.view="loading";render();
  try{
    const res=await fetch("./bank/"+encodeURIComponent(s)+"/"+year+".json",{cache:"no-store"});
    if(!res.ok)throw new Error("無法載入本年度題庫檔案（HTTP "+res.status+"）。");
    const payload=await res.json();
    const raw=Array.isArray(payload)?payload:payload.questions;
    if(!Array.isArray(raw))throw new Error("題庫格式錯誤：需要 questions 陣列。");
    const questions=raw.map(normalizeQuestion).filter(Boolean);
    const seen=new Set();
    if(questions.some(q=>seen.has(q.id)||!seen.add(q.id)))throw new Error("題目 ID 重複，請核對匯入資料。");
    if(questions.length!==raw.length)throw new Error("題庫有題目缺少必要欄位，請先修正。");
    if(questions.some(q=>q.specialty!==s||Number(q.year)!==year))throw new Error("部分題目科別或年度錯誤。");
    if(questions.length===0){state.view="empty";render();return;}
    // A stable source sort is supplied by the converter; never reorder a mixed exam by question number alone.
    state.questions=questions;state.demo=false;
    const firstUnanswered=questions.findIndex(q=>!answers[q.id]);
    state.index=firstUnanswered<0?0:firstUnanswered;
    state.selected=null;state.view="quiz";
  }catch(err){state.error=err instanceof Error?err.message:"未知讀取錯誤";state.view="empty";}
  render();window.scrollTo(0,0);
}
function openDemo(){
  demoAnswers={};
  state.questions=DEMO.map(normalizeQuestion);
  state.demo=true;state.index=0;state.selected=null;state.view="quiz";
  render();window.scrollTo(0,0);
}
function getRecord(q){return state.demo?demoAnswers[q.id]:answers[q.id];}
function submitAnswer(){
  const q=state.questions[state.index];
  if(state.selected===null||getRecord(q))return;
  const rec={selected:state.selected,correct:state.selected===q.answer,at:new Date().toISOString()};
  if(state.demo)demoAnswers[q.id]=rec;
  else {answers[q.id]=rec;persistAnswers();}
  if(!rec.correct)collectWrong(q,state.selected);
  state.selected=null;render();
}
function nextQuestion(){
  if(state.index>=state.questions.length-1)state.view="summary";
  else {state.index++;state.selected=null;}
  render();window.scrollTo(0,0);
}
function renderQuiz(){
  const q=state.questions[state.index];
  const rec=getRecord(q);
  const selected=rec?rec.selected:state.selected;
  const page=el("div","quiz-layout");
  const s=getSubject(state.subject);
  add(page,breadcrumbs(state.demo?
    [{text:"全部專科",onClick:goHome},{text:"操作示範"}]:
    [{text:"全部專科",onClick:goHome},{text:s.label,onClick:()=>goYears(s.id)},{text:state.year+" 年"}]));
  const prog=el("div","progress-area");
  add(prog,el("span","",state.demo?"示範模式（非真實考古）":s.label+" · "+state.year+" 年"),
    el("span","",(state.index+1)+" / "+state.questions.length+" 題"));
  add(page,prog);
  const bar=el("div","progress-track");
  const fill=el("div","progress-fill");fill.style.width=((state.index+1)/state.questions.length*100)+"%";add(bar,fill);add(page,bar);
  const card=el("article","question-card");
  let details=state.demo?"操作示範 · 非真實國考題":
    String(q.year)+" 年"+(q.session?" · 第 "+q.session+" 次":"")+(q.paper?" · "+q.paper:"")+(q.number?" · 第 "+q.number+" 題":"");
  add(card,el("div","question-meta",details),el("h2","question-title",q.stem));
  if(Array.isArray(q.images)){
    q.images.forEach(path=>{
      if(typeof path!=="string"||!/^assets\/[\w/.-]+\.(png|jpe?g|webp|gif)$/i.test(path)||path.includes(".."))return;
      const im=document.createElement("img");im.src="./"+path;im.alt="題目附圖";im.className="question-image";card.append(im);
    });
  }
  const opts=el("div","options");
  q.options.forEach((option,i)=>{
    const own=selected===i,correct=!!rec&&i===q.answer,wrong=!!rec&&own&&i!==q.answer;
    const b=el("button","option"+(own?" selected":"")+(correct?" correct":"")+(wrong?" wrong":""));
    b.type="button";b.disabled=!!rec;b.setAttribute("aria-pressed",String(own));
    add(b,el("span","option-letter","ABCDE"[i]),el("span","option-text",option));
    b.addEventListener("click",()=>{if(!rec){state.selected=i;render();}});
    add(opts,b);
  });
  add(card,opts);
  if(rec){
    const result=el("div","result"+(rec.correct?"":" incorrect"));
    add(result,el("strong","",rec.correct?"回答正確 · 答案 "+ "ABCDE"[q.answer]:"回答錯誤 · 正確答案 "+ "ABCDE"[q.answer]));
    add(result,el("div","explanation",q.explanation||"目前尚無詳解，待原始資料核對後補上。"));
    if(q.source){
      const t=typeof q.source==="string"?q.source:
        [q.source.file,q.source.page?"第 "+q.source.page+" 頁":null].filter(Boolean).join(" · ");
      if(t)add(result,el("div","source","資料來源："+t));
    }
    add(card,result);
    if(!rec.correct){
      const wrongLink=el("div","wrong-link");
      add(wrongLink,el("span","",state.demo?"示範錯題已加入本次錯題本":"此題已自動收錄至錯題本"),
        button("開啟錯題本 →","ghost-button",openWrongBook));
      add(card,wrongLink);
    }
  }
  add(page,card);
  const actions=el("div","quiz-actions");
  const left=button("← 上一題","ghost-button",()=>{state.index=Math.max(0,state.index-1);state.selected=null;render();window.scrollTo(0,0);});
  left.disabled=state.index===0;
  add(actions,left);
  const right=el("div","right");
  if(!rec){
    const submit=button("送出答案","primary",submitAnswer);submit.disabled=state.selected===null;add(right,submit);
  }else{
    add(right,button(state.index===state.questions.length-1?"完成練習":"下一題 →","primary",nextQuestion));
  }
  add(actions,right);add(page,actions);setPage(page);
}
function renderSummary(){
  const qs=state.questions;
  const records=qs.map(getRecord).filter(Boolean);
  const correct=records.filter(r=>r.correct).length;
  const page=el("div","quiz-layout");
  add(page,breadcrumbs([{text:"全部專科",onClick:goHome},{text:"練習完成"}]));
  const box=el("div","empty-state");
  add(box,el("div","empty-icon","✓"),el("p","eyebrow","SESSION COMPLETE"),
    el("h2","","完成這一組練習"),
    el("p","",qs.length+" 題中已作答 "+records.length+" 題，正確 "+correct+" 題。"+(state.demo?"（操作示範不會寫入正式進度）":"作答紀錄已儲存在這台裝置。")));
  const buttons=el("div","summary-buttons");
  add(buttons,button("返回專科","secondary",goHome),
    button("再看一遍","primary",()=>{state.index=0;state.selected=null;state.view="quiz";render();window.scrollTo(0,0);}));
  add(box,buttons);add(page,box);setPage(page);
}
function renderWrongBook(){
  const page=el("div");
  add(page,breadcrumbs([{text:"全部專科",onClick:goHome},{text:"錯題本"}]));
  add(page,hero("MY MISTAKES","錯題本","依科別整理錯題，在每題下方直接記下易錯觀念或補充重點；筆記自動儲存在此瀏覽器。"));
  const items=allWrongItems();
  const index=el("div","wrongbook-index");
  function categoryButton(label,key,num){
    const active=state.wrongFilter===key;
    const b=button(label+" "+num,"index-button"+(active?" active":""),()=>{
      state.wrongFilter=key;render();window.scrollTo(0,0);
    });
    b.setAttribute("aria-pressed",String(active));
    return b;
  }
  add(index,categoryButton("全部科別","all",items.length));
  SUBJECTS.forEach(sub=>{
    const n=items.filter(x=>x.specialty===sub.id).length;
    if(n) add(index,categoryButton(sub.label,sub.id,n));
  });
  if(items.length)add(page,index);
  const visible=items.filter(item=>state.wrongFilter==="all"||item.specialty===state.wrongFilter);
  if(!items.length){
    const empty=el("div","empty-state");
    add(empty,el("div","empty-icon","▤"),
      el("h2","","目前沒有錯題"),
      el("p","","完成練習後，答錯的題目會自動出現在這裡。現在可以先體驗錯題筆記的操作方式。"),
      button("載入一題示範錯題","primary",sampleWrongBook));
    add(page,empty);
  } else {
    const heading=el("div","section-top");
    add(heading,el("h2","","錯題紀錄"),el("span","pill","共 "+visible.length+" 題"));
    add(page,heading);
    const list=el("div","wrong-list");
    visible.forEach(item=>{
      const subject=getSubject(item.specialty);
      const card=el("article","wrong-card");
      const meta=el("div","wrong-meta");
      add(meta,el("span","pill",subject?subject.label:"其他"),
        el("span","",item.demo?"操作示範 · 非真實國考":(item.year?item.year+" 年":"未標年份")+(item.session?" · 第 "+item.session+" 次":"")+(item.number?" · 第 "+item.number+" 題":"")));
      add(card,meta,el("h3","wrong-stem",item.stem));
      const result=el("p","wrong-answer",
        "你的答案："+("ABCDE"[item.selected]||"未記錄")+"　/　正確答案："+("ABCDE"[item.answer]||"待核對"));
      add(card,result);
      const noteLabel=el("label","note-label","我的筆記");
      const textarea=el("textarea","note-input");
      textarea.id="note-"+item.id.replace(/[^A-Za-z0-9_-]/g,"-");
      noteLabel.htmlFor=textarea.id;
      textarea.rows=3;
      textarea.placeholder="例如：診斷關鍵、容易混淆的選項、考前必背重點…";
      textarea.value=item.note||"";
      const saveStatus=el("div","note-status",item.demo?"操作示範 · 筆記不會永久保存":"輸入後自動儲存 · 僅此瀏覽器");
      textarea.addEventListener("input",()=>{
        saveStatus.textContent=saveWrongNote(item,textarea.value)
          ? (item.demo?"示範筆記已更新 · 關閉頁面後不保留":"已自動儲存")
          : "儲存失敗：瀏覽器空間不足或儲存遭封鎖";
      });
      add(card,noteLabel,textarea,saveStatus);
      const detail=el("details","wrong-details");
      const summary=el("summary","","查看完整題目與詳解");
      add(detail,summary,el("p","detail-stem",item.stem));
      (item.options||[]).forEach((option,i)=>{
        const mark=i===item.answer?"correct":i===item.selected?"wrong":"";
        add(detail,el("p","detail-option "+mark,"ABCDE"[i]+". "+option));
      });
      if(item.explanation)add(detail,el("div","detail-explanation","詳解："+item.explanation));
      if(item.source){
        const source=typeof item.source==="string"?item.source:[item.source.file,item.source.page?"第 "+item.source.page+" 頁":null].filter(Boolean).join(" · ");
        if(source)add(detail,el("p","source","資料來源："+source));
      }
      add(card,detail);
      add(list,card);
    });
    add(page,list);
  }
  const note=el("p","local-warning","注意：此版本的錯題與筆記只儲存在目前瀏覽器。清除網站資料、無痕模式結束，或更換網址／裝置，可能無法保留或讀取原紀錄。");
  add(page,note);
  setPage(page);
}
function render(){
  if(state.view==="home")renderHome();
  else if(state.view==="wrongbook")renderWrongBook();
  else if(state.view==="years")renderYears();
  else if(state.view==="empty")renderEmpty();
  else if(state.view==="quiz")renderQuiz();
  else if(state.view==="summary")renderSummary();
  else setPage(el("div","loading","正在載入題目…"));
}
document.getElementById("home-button").addEventListener("click",goHome);
(async function init(){
  try {
    const resp=await fetch("./bank/manifest.json",{cache:"no-store"});
    if(resp.ok){const data=await resp.json();if(data&&typeof data.counts==="object")manifest=data;}
  } catch (_) {
    // Allow the demo to work even when index.html is opened directly via file://.
  }
  render();
})();
