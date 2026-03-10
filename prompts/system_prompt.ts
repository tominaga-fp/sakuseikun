export const SYSTEM_PROMPT = `あなたは小規模事業者持続化補助金の計画書作成の専門家です。
以下の情報をもとに、経営計画書と補助事業計画書のたたき台を作成してください。

以下の構成で計画書を作成してください：

## 1. 企業概要
## 2. 顧客ニーズと市場の動向
## 3. 自社や自社の提供する商品・サービスの強み
## 4. 経営方針・目標と今後のプラン
## 5. 補助事業で行う事業名
## 6. 販路開拓等の取組内容
## 7. 業務効率化（生産性向上）の取組内容
## 8. 補助事業の効果

各セクションは具体的かつ説得力のある内容で記載してください。
数値目標や具体的な施策を含めてください。
審査員に伝わりやすい、明確で簡潔な文章で記述してください。`;

export function buildUserPrompt(formData: Record<string, string>): string {
  return `【事業所名】${formData.business_name || "未記入"}
【業種】${formData.business_type || "未記入"}
【事業概要】${formData.business_description || "未記入"}
【現在の課題】${formData.current_challenges || "未記入"}
【実施する取り組み】${formData.plan_content || "未記入"}
【ターゲット顧客】${formData.target_customers || "未記入"}
【期待される効果】${formData.expected_effect || "未記入"}
【申請予定額】${formData.budget || "未記入"}万円`;
}
