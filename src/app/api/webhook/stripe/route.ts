import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const MONTHLY_PRICE_ID = process.env.STRIPE_MONTHLY_PRICE_ID;
const YEARLY_PRICE_ID = process.env.STRIPE_YEARLY_PRICE_ID;

function getPlanType(priceId: string): { planType: string; monthlyLimit: number } {
  if (priceId === YEARLY_PRICE_ID) return { planType: "yearly", monthlyLimit: 30 };
  return { planType: "monthly_3", monthlyLimit: 3 };
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) return NextResponse.json({ error: "No signature" }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error("[stripe webhook] 署名検証失敗:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const email = session.customer_details?.email ?? session.customer_email;
      const customerId = session.customer as string;
      const subscriptionId = session.subscription as string;

      if (!email || !subscriptionId) {
        console.error("[stripe webhook] email or subscriptionId missing");
        return NextResponse.json({ received: true });
      }

      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      const priceId = subscription.items.data[0]?.price.id ?? "";
      const { planType, monthlyLimit } = getPlanType(priceId);

      // 既存ユーザーがいれば更新
      const { data: existingProfile } = await adminClient
        .from("profiles")
        .select("id")
        .eq("email", email)
        .single();

      if (existingProfile) {
        await adminClient.from("profiles").update({
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          subscription_status: "active",
          plan_type: planType,
          usage_limit: monthlyLimit,
          is_active: true,
        }).eq("id", existingProfile.id);
        console.log("[stripe webhook] 既存ユーザー更新:", email);
      } else {
        // 新規ユーザー用に pending_subscriptions へ保存
        await adminClient.from("pending_subscriptions").upsert({
          email,
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          plan_type: planType,
          usage_limit: monthlyLimit,
          created_at: new Date().toISOString(),
        }, { onConflict: "email" });
        console.log("[stripe webhook] pending_subscriptions に保存:", email);
      }
    }

    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;

      await adminClient.from("profiles").update({
        subscription_status: "canceled",
        is_active: false,
      }).eq("stripe_customer_id", customerId);
      console.log("[stripe webhook] サブスクリプション解約:", customerId);
    }

    if (event.type === "customer.subscription.updated") {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;
      const status = subscription.status === "active" ? "active" : "inactive";

      await adminClient.from("profiles").update({
        subscription_status: status,
        is_active: subscription.status === "active",
      }).eq("stripe_customer_id", customerId);
      console.log("[stripe webhook] サブスクリプション更新:", customerId, status);
    }
  } catch (err) {
    console.error("[stripe webhook] 処理エラー:", err);
    return NextResponse.json({ error: "Processing error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
