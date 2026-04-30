"use server";

import { createClient } from "@supabase/supabase-js";

async function addSystemeContact(data: {
  email: string;
  firstName: string;
  lastName: string;
  companyName: string;
}) {
  const apiKey = process.env.SYSTEME_IO_API_KEY;
  if (!apiKey) return;
  try {
    const fields: { slug: string; value: string }[] = [
      { slug: "surname", value: data.lastName },
      { slug: "first_name", value: data.firstName },
    ];
    if (data.companyName) fields.push({ slug: "company_name", value: data.companyName });

    const res = await fetch("https://api.systeme.io/api/contacts", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-API-Key": apiKey },
      body: JSON.stringify({ email: data.email, fields }),
    });
    const resText = await res.text();

    let contactId: number;
    if (res.status === 422) {
      const searchRes = await fetch(
        `https://api.systeme.io/api/contacts?email=${encodeURIComponent(data.email)}`,
        { headers: { "X-API-Key": apiKey } }
      );
      if (!searchRes.ok) return;
      const searchData = await searchRes.json();
      const existing = (searchData.items ?? [])[0];
      if (!existing) return;
      contactId = existing.id;
    } else if (!res.ok) {
      console.error("[addSystemeContact] 失敗:", res.status, resText);
      return;
    } else {
      contactId = JSON.parse(resText).id;
    }

    // タグ付与
    const tagName = "さくせいくん有料登録";
    const listRes = await fetch("https://api.systeme.io/api/tags?limit=100", {
      headers: { "X-API-Key": apiKey },
    });
    if (!listRes.ok) return;
    const listData = await listRes.json();
    let tagId: number | null = (listData.items ?? []).find((t: { id: number; name: string }) => t.name === tagName)?.id ?? null;

    if (!tagId) {
      const createRes = await fetch("https://api.systeme.io/api/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-API-Key": apiKey },
        body: JSON.stringify({ name: tagName }),
      });
      if (!createRes.ok) return;
      tagId = (await createRes.json()).id;
    }

    await fetch(`https://api.systeme.io/api/contacts/${contactId}/tags`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-API-Key": apiKey },
      body: JSON.stringify({ tagId }),
    });
  } catch (err) {
    console.error("[addSystemeContact] エラー:", err);
  }
}

export async function registerUser(data: {
  email: string;
  password: string;
  lastName: string;
  firstName: string;
  companyName: string;
  userType: string;
  referralCode: string;
}): Promise<{ error: string | null }> {
  console.log("[registerUser] 開始 email:", data.email);

  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  try {
    // pending_subscriptions で支払い済みか確認
    const { data: pending } = await adminClient
      .from("pending_subscriptions")
      .select("*")
      .eq("email", data.email)
      .eq("claimed", false)
      .single();

    if (!pending) {
      return { error: "お支払いが確認できませんでした。先にプランのお申し込みをお願いします。" };
    }

    const { error } = await adminClient.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: {
        last_name: data.lastName,
        first_name: data.firstName,
        company_name: data.companyName,
        user_type: data.userType,
        referral_code: data.referralCode || null,
        stripe_customer_id: pending.stripe_customer_id,
        stripe_subscription_id: pending.stripe_subscription_id,
        plan_type: pending.plan_type,
        usage_limit: pending.usage_limit,
        subscription_status: "active",
      },
    });

    if (error) {
      console.error("[registerUser] ユーザー作成エラー:", error.message);
      return { error: error.message };
    }

    // pending を使用済みにする
    await adminClient
      .from("pending_subscriptions")
      .update({ claimed: true })
      .eq("email", data.email);

    await addSystemeContact({
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      companyName: data.companyName,
    });

    return { error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[registerUser] エラー:", message);
    return { error: message };
  }
}
