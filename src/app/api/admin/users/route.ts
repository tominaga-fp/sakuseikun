import { createClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

async function verifyAdmin() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") return null;

  return supabase;
}

export async function PATCH(request: Request) {
  const supabase = await verifyAdmin();
  if (!supabase) {
    return NextResponse.json({ error: "権限がありません" }, { status: 403 });
  }

  const body = await request.json();
  const { userId, ...updates } = body;

  const allowedFields = ["is_active", "role", "monthly_limit", "extra_count"];
  const safeUpdates: Record<string, unknown> = {};
  for (const key of allowedFields) {
    if (key in updates) {
      safeUpdates[key] = updates[key];
    }
  }

  const { error } = await supabase
    .from("profiles")
    .update(safeUpdates)
    .eq("id", userId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
