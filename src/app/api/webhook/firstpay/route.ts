import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    console.log('FirstPay webhook受信:', JSON.stringify(body))

    const email = body.purchaser?.email
    if (!email) {
      return NextResponse.json({ error: 'メールなし' }, { status: 400 })
    }

    const { data: users } = await supabase.auth.admin.listUsers()
    const user = users?.users?.find(u => u.email === email)
    if (!user) {
      return NextResponse.json({ message: 'ユーザー未登録' }, { status: 200 })
    }

    await supabase.rpc('increment_extra_count', { user_id_input: user.id })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Webhookエラー:', err)
    return NextResponse.json({ error: 'エラー' }, { status: 500 })
  }
}
