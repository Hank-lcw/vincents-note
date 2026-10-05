export const GRADES = {
  A: { label: '多項研究一致', desc: '統合分析或多篇研究得到相近結論' },
  B: { label: '單篇研究支持', desc: '有同儕審查研究，但尚待更多驗證' },
  C: { label: '觀點與經驗', desc: 'Vincent 的個人整理，請自行判斷' },
} as const;

export const TOPIC_INFO = [
  { name: '指數投資與資產配置', short: '指數投資', desc: '被動投資、股債比例、再平衡與費用的長期影響。' },
  { name: '學術研究解讀', short: '學術研究', desc: '把財務學論文拆成重點：研究怎麼做、發現什麼、限制在哪。' },
  { name: '個人理財與退休', short: '個人理財', desc: '稅務、勞退、提領策略，以及如何套用到台灣的情境。' },
] as const;

export function formatDate(d: Date) {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** 中文約每分鐘 400 字，英文單字約每分鐘 200 字 */
export function readingMinutes(body = '') {
  const text = body.replace(/<[^>]+>/g, '').replace(/[#>*_`\[\]()!-]/g, '');
  const cjk = (text.match(/[\u3400-\u9fff\uf900-\ufaff]/g) || []).length;
  const words = (text.replace(/[\u3400-\u9fff\uf900-\ufaff]/g, ' ').match(/[A-Za-z0-9]+/g) || []).length;
  return Math.max(1, Math.round(cjk / 400 + words / 200));
}

/** Add display-only spacing at Chinese/Latin or Chinese/digit boundaries. */
export function spaceMixedText(text: string) {
  return text.replace(/([\p{Script=Han}])([A-Za-z0-9])/gu, '$1 $2')
    .replace(/([A-Za-z0-9])([\p{Script=Han}])/gu, '$1 $2');
}
