import { createClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

export const maxDuration = 30;

// ノイズ除去: nav, footer, script, style, 広告等を除去しメインコンテンツを抽出
function extractMainContent(html: string): string {
  // script, style, noscript タグとその中身を除去
  let cleaned = html.replace(/<script[\s\S]*?<\/script>/gi, "");
  cleaned = cleaned.replace(/<style[\s\S]*?<\/style>/gi, "");
  cleaned = cleaned.replace(/<noscript[\s\S]*?<\/noscript>/gi, "");

  // nav, header, footer, aside タグとその中身を除去
  cleaned = cleaned.replace(/<nav[\s\S]*?<\/nav>/gi, "");
  cleaned = cleaned.replace(/<footer[\s\S]*?<\/footer>/gi, "");
  cleaned = cleaned.replace(/<aside[\s\S]*?<\/aside>/gi, "");

  // よくある広告・ウィジェット系のclass/idを持つ要素を除去
  cleaned = cleaned.replace(/<[^>]+(class|id)="[^"]*(?:ad-|ads-|advert|banner|sidebar|widget|cookie|popup|modal|overlay)[^"]*"[^>]*>[\s\S]*?<\/[^>]+>/gi, "");

  // HTMLタグを除去してテキスト化
  cleaned = cleaned.replace(/<[^>]+>/g, " ");

  // HTMLエンティティをデコード
  cleaned = cleaned.replace(/&nbsp;/g, " ");
  cleaned = cleaned.replace(/&amp;/g, "&");
  cleaned = cleaned.replace(/&lt;/g, "<");
  cleaned = cleaned.replace(/&gt;/g, ">");
  cleaned = cleaned.replace(/&quot;/g, '"');
  cleaned = cleaned.replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code)));

  // 連続空白・改行を整理
  cleaned = cleaned.replace(/[ \t]+/g, " ");
  cleaned = cleaned.replace(/\n\s*\n/g, "\n");
  cleaned = cleaned.trim();

  return cleaned;
}

// HTMLからリンクを抽出し、関連ページのURLを返す
function extractRelatedLinks(html: string, baseUrl: string): string[] {
  const keywords = [
    "会社概要", "企業概要", "about", "company",
    "事業内容", "サービス", "service", "business",
    "商品", "メニュー", "menu", "product",
    "アクセス", "access", "店舗情報", "shop",
    "代表挨拶", "greeting", "理念", "philosophy", "mission",
    "実績", "works", "portfolio", "case",
    "特徴", "feature", "strength",
    "料金", "price", "plan",
    "スタッフ", "staff", "team",
  ];

  const linkRegex = /<a\s[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi;
  const links: string[] = [];
  let match;

  while ((match = linkRegex.exec(html)) !== null) {
    const href = match[1];
    const text = match[2].replace(/<[^>]+>/g, "").trim();
    const hrefLower = href.toLowerCase();
    const textLower = text.toLowerCase();

    const isRelated = keywords.some(
      (kw) => textLower.includes(kw.toLowerCase()) || hrefLower.includes(kw.toLowerCase())
    );

    if (isRelated && href && !href.startsWith("#") && !href.startsWith("mailto:") && !href.startsWith("tel:") && !href.startsWith("javascript:")) {
      try {
        const resolved = new URL(href, baseUrl).href;
        const resolvedHost = new URL(resolved).hostname;
        const baseHost = new URL(baseUrl).hostname;
        // 同一ドメインのみ
        if (resolvedHost === baseHost && !links.includes(resolved)) {
          links.push(resolved);
        }
      } catch {
        // 無効なURL
      }
    }
  }

  // 最大5ページまで
  return links.slice(0, 5);
}

async function fetchPage(url: string): Promise<{ url: string; text: string } | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; SakuseikunBot/1.0)",
        "Accept": "text/html,application/xhtml+xml",
        "Accept-Language": "ja,en;q=0.5",
      },
      signal: controller.signal,
      redirect: "follow",
    });
    clearTimeout(timeout);

    if (!res.ok) return null;

    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("text/html") && !contentType.includes("application/xhtml")) {
      return null;
    }

    const html = await res.text();
    const text = extractMainContent(html);

    // 極端に短いページはスキップ
    if (text.length < 50) return null;

    return { url, text };
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  const { url } = (await request.json()) as { url: string };

  if (!url || typeof url !== "string") {
    return NextResponse.json({ error: "URLが必要です" }, { status: 400 });
  }

  // URLバリデーション
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      return NextResponse.json({ error: "http/httpsのURLを指定してください" }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: "無効なURLです" }, { status: 400 });
  }

  // プライベートIPへのアクセスを禁止（SSRF防止）
  const hostname = parsedUrl.hostname;
  if (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname.startsWith("192.168.") ||
    hostname.startsWith("10.") ||
    hostname.startsWith("172.") ||
    hostname === "0.0.0.0" ||
    hostname.endsWith(".local")
  ) {
    return NextResponse.json({ error: "ローカルアドレスは指定できません" }, { status: 400 });
  }

  try {
    // 1. トップページを取得
    const topPageRes = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; SakuseikunBot/1.0)",
        "Accept": "text/html,application/xhtml+xml",
        "Accept-Language": "ja,en;q=0.5",
      },
      redirect: "follow",
    });

    if (!topPageRes.ok) {
      return NextResponse.json(
        { error: `HPの取得に失敗しました（${topPageRes.status}）` },
        { status: 502 }
      );
    }

    const topHtml = await topPageRes.text();
    const topText = extractMainContent(topHtml);

    // 2. 関連ページのリンクを検出
    const relatedLinks = extractRelatedLinks(topHtml, url);

    // 3. 関連ページを並列取得
    const subPages = await Promise.all(relatedLinks.map(fetchPage));
    const validSubPages = subPages.filter((p): p is { url: string; text: string } => p !== null);

    // 4. 結果を構造化テキストにまとめる
    let result = `【トップページ】${url}\n${topText}\n`;

    for (const page of validSubPages) {
      result += `\n【サブページ】${page.url}\n${page.text}\n`;
    }

    // 文字数上限（Claude のコンテキストを圧迫しないよう制限）
    const MAX_CHARS = 15000;
    if (result.length > MAX_CHARS) {
      result = result.slice(0, MAX_CHARS) + "\n\n（※文字数上限により以降省略）";
    }

    return NextResponse.json({
      content: result,
      pagesCount: 1 + validSubPages.length,
      topUrl: url,
      subPages: validSubPages.map((p) => p.url),
    });
  } catch (err) {
    console.error("HP fetch error:", err);
    return NextResponse.json(
      { error: "HPの取得中にエラーが発生しました" },
      { status: 500 }
    );
  }
}
