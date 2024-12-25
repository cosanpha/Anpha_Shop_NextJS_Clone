import { connectDatabase } from '@/config/database'
import { generateOrderCode } from '@/utils'
import { NextResponse } from 'next/server'

// Models: empty

export const dynamic = 'force-dynamic'

// [GET]: /api/order/generate-order-code
export async function GET() {
  console.log('- Generate Order Code -')

  try {
    // connect to database
    await connectDatabase()

    // generate order code to create order
    const orderCode = await generateOrderCode(5)

    // return order code
    return NextResponse.json({ orderCode }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}
