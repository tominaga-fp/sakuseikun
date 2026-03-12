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

    // 金額・プラン種別を判定してsalesテーブルに保存
    const rawAmount = body.amount ?? body.total ?? body.price ?? 0
    const amount = typeof rawAmount === 'number' ? rawAmount : parseInt(rawAmount) || 0
    // redirect_urlにextraが含まれていればextra、それ以外はbasic
    const redirectUrl = body.redirect_url ?? body.redirectUrl ?? ''
    const isExtra = typeof redirectUrl === 'string' && redirectUrl.includes('/payment/extra')
    const planType = isExtra ? 'extra' : 'basic'
    const saleAmount = amount > 0 ? amount : (isExtra ? 5000 : 9800)

    await supabase.from('sales').insert({
      user_id: user.id,
      amount: saleAmount,
      plan_type: planType,
      payment_date: new Date().toISOString(),
      webhook_data: body,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Webhookエラー:', err)
    return NextResponse.json({ error: 'エラー' }, { status: 500 })
  }
}
