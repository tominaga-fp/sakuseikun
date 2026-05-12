import { NextResponse } from "next/server";

// カウント消費はgenerate APIの1ターン目で行うため、このエンドポイントは廃止
export async function POST() {
  return NextResponse.json({ consumed: false, ok: true });
}
