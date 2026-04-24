# さくせいくん 変更記録

CLAUDE.mdの指示により、料金・方針・DB・重要バグ修正を記録する。

## 2026-04-09
- [初期記録] changelog開始
- [数字] 登録46人(実)→利用17人(37%)→複数回5人(11%)→ヘビー1人(2%)。DAU最大5。会話40件/チャット891件
- [数字] ヘビーユーザー: nannoshinichiro（会話11件/204チャット/5日間）— フィードバック最重要ターゲット
- [方針確定] 5月〜 月3件制限。カウント単位=chat_sessionsの新規作成（1会話=1計画書=1件）
- [方針確定] 追加1件¥9,800。未使用繰越なし。月末リセット。毎月1日に3件付与。日割りなし
- [方針確定] 自動更新を規約に明記。解約は前月20日まで（手作業）
- [料金確定] 定価: 月¥29,800 / 年¥178,800（月の50%OFF）。月は見せ料金、基本年払い推奨
- [料金方針] 定価ではまだ売れない前提。段階的な特典価格で導入を進める
- [確定] 有料化開始: 2026-05-01
- [確定] アンケート: 登録46人全員に配布。回答者に特典価格を提供。Googleフォーム+Systeme.ioで一斉配信（タグ付け済み）
- [料金方針] ローンチ時: アンケート回答者向け特典（例: 3名限定年¥30,000、5/10まで全員¥50,000、以降¥120,000等）
- [料金方針] まず5月に経費分だけでも回収（¥10,000〜でもOK）
- [予定] 20回公募: 新規獲得にメールDM・FAXDM・SNS広告を検討。外向け価格は別途検討
- [確定] 決済: FirstPay→Stripeに切替。審査通過済み。出金リスクあり（認識済み）
- [方針確定] 法務: 採択不保証・データ漏洩リスク対策・免責範囲を規約に整備必要
- [方針確定] 過去会話は保存し続ける。ダッシュボード整備が必要
- [実装予定] consume-countトリガーをsession_start→chat_sessions INSERT時に変更
- [競合] Hojofy発見。¥3,980/5件〜。GPT系推定。テンプレ穴埋め型。さくせいくんは「対話型×コンサル業務効率化」で差別化。詳細: knowledge/competitive-analysis.md
- [予定] 採点機能改善（点数が甘い問題、アンケート後に対応）

## 2026-04-14
- [バグ修正] /api/generate 500エラー(FUNCTION_INVOCATION_FAILED)を修正: モデル名を claude-sonnet-4-20250514 → claude-sonnet-4-5 に更新（旧モデル廃止と推定、2秒で即死していた）
- [改善] 生成APIのエラーレスポンスに detail フィールドを追加。今後の本番障害切り分けを容易に
- [設定] CLAUDE.md の技術スタック記述も claude-sonnet-4-5 に同期
- [バグ修正] 左パネルの項目別タブで 1-1 / 2-1 / 4-1 が ● にならない問題を修正: parseSectionsの正規表現に否定先読み (?!\s*\d-\d\.) を追加。グループ見出し「1. 経営計画」が直後のサブセクション「1-1.」を吸い込んでいたのが原因

## 2026-04-24
- [障害] SendGrid Email APIのトライアル期間終了により、Supabase Auth経由の認証メール(パスワードリセット)送信が停止。sensui623@gmail.comからログイン不能との報告で発覚。recovery_sent_atの最終更新が3/24のため、実質的な停止は3月下旬以降と推定。判明影響は1名（他ユーザーはリセット不要だったため表面化せず）
- [設定変更] Supabase Auth SMTPをSendGrid → Resendに切替。無料プラン(月3000通/日100通)で現行用途(パスワードリセットのみ)は十分。送信元info@sakuseikun.jpは変更なし
- [設定変更] Vercel DNSに3レコード追加: resend._domainkey(TXT/DKIM)、send(MX/feedback-smtp.ap-northeast-1.amazonses.com priority10)、send(TXT/SPF "v=spf1 include:amazonses.com ~all")。ドメイン認証Verified完了
- [方針] 7月の4000件DM配信はSystemeで別経路のため、Resendは無料プラン維持予定
- [コード変更] register/actions.tsからSendGrid通知メール機能(sendMail/notifyNewUser)を削除。新規登録時の管理者通知は廃止、Systeme.io連携のみ残す。関連して.env.local.exampleからSENDGRID_API_KEY、privacy-policyのSendGrid記載→Resendに変更、CLAUDE.md技術スタックもResendに更新
- [後処理TODO] SendGrid APIキー3本(sakuseikun_gmail / sakuseikun_salesmail_antigravity / sakuseikun)をセキュリティのため無効化。Vercel環境変数SENDGRID_API_KEYも削除。SendGridアカウント自体は放置可（請求なし）
- [残タスク] Antigravity(IDE)とResendの連携（一斉送信用途）は別作業として後日対応
- [教訓] SendGridは2023年以降無料プランを60日トライアル化。3月に有料→無料に戻した時点でトライアル残日数消費中だった。警告メールはinfo@sakuseikun.jpに届いていた可能性あるが見落とし。今後は月1回でも自分宛リセットメールテストで早期検知可能
