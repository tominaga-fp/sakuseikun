// Sonnet 5 が現行SDKで正しく動くかの最小検証スクリプト。
//
// 使い方（PowerShell）:
//   $env:ANTHROPIC_API_KEY = "<Vercelに設定しているキー>"
//   node scripts/verify-model.mjs
//
// route.ts と同じ呼び出し形（stream + 1時間TTLキャッシュ + thinking無効）で
// 実際にAPIを叩き、モデルが応答するか・キャッシュが効くかを確認する。
// 消費トークンはごくわずか（1回あたり0.1円未満）。
import Anthropic from "@anthropic-ai/sdk";

const key = process.env.ANTHROPIC_API_KEY;
if (!key) {
  console.error("ANTHROPIC_API_KEY が未設定です。");
  console.error('PowerShell: $env:ANTHROPIC_API_KEY = "sk-ant-..."');
  process.exit(1);
}

const client = new Anthropic({ apiKey: key });

// プロンプトキャッシュは最低1024トークン必要なので、ダミーで嵩上げする
const filler = "これは持続化補助金の計画書作成を支援するテスト用の指示文です。".repeat(120);

async function run(model, label) {
  try {
    const stream = await client.messages.stream({
      model,
      max_tokens: 32,
      thinking: { type: "disabled" },
      system: [
        { type: "text", text: filler, cache_control: { type: "ephemeral", ttl: "1h" } },
      ],
      messages: [{ role: "user", content: "「OK」とだけ返してください。" }],
    });

    let text = "";
    for await (const ev of stream) {
      if (ev.type === "content_block_delta" && ev.delta.type === "text_delta") {
        text += ev.delta.text;
      }
    }

    const m = await stream.finalMessage();
    const u = m.usage;
    console.log(`OK  ${label} (${model})`);
    console.log(`    応答       : ${JSON.stringify(text)}`);
    console.log(`    返却model  : ${m.model}`);
    console.log(`    入力(未kw) : ${u.input_tokens}`);
    console.log(`    キャッシュ書込: ${u.cache_creation_input_tokens}`);
    console.log(`    キャッシュ読取: ${u.cache_read_input_tokens}`);
    console.log(`    出力       : ${u.output_tokens}`);
    return true;
  } catch (e) {
    console.log(`NG  ${label} (${model})`);
    console.log(`    ${e?.constructor?.name}: ${String(e?.message).slice(0, 400)}`);
    return false;
  }
}

// 第1引数でモデルを指定可能。省略時は移行先のSonnet 5
const target = process.argv[2] || "claude-sonnet-5";
console.log(`検証対象: ${target}\n`);

const ok1 = await run(target, "1回目 キャッシュ書き込み");
if (ok1) {
  await run(target, "2回目 キャッシュ読み取り");
  console.log("\n判定: 2回とも OK で、2回目の「キャッシュ読取」が0より大きければ合格です。");
} else {
  console.log("\n失敗しました。対処の候補:");
  console.log("  1. SDKを更新する      : npm install @anthropic-ai/sdk@latest");
  console.log("  2. 現行モデルと比較する: node scripts/verify-model.mjs claude-sonnet-4-5");
  console.log("     → 現行モデルもNGならキーor通信の問題、現行だけOKならモデル/SDKの問題");
}
