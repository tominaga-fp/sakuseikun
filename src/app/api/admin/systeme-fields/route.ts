import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.SYSTEME_IO_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "SYSTEME_IO_API_KEY未設定" }, { status: 500 });
  }

  // コンタクト1件取得してfieldsの構造を確認
  const contactsRes = await fetch("https://api.systeme.io/api/contacts?limit=1", {
    headers: { "X-API-Key": apiKey },
  });
  const contactsData = await contactsRes.json();

  return NextResponse.json({
    status: contactsRes.status,
    data: contactsData,
  });
}
