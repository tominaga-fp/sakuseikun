import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function PaymentExtraPage({
  searchParams,
}: {
  searchParams: Promise<{ user_id?: string }>;
}) {
  const { user_id } = await searchParams;

  if (!user_id) {
    redirect("/dashboard");
  }

  await supabase.rpc("increment_extra_count", { user_id_input: user_id });

  redirect("/dashboard");
}
