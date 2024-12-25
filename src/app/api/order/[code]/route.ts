import { connectDatabase } from '@/config/database'
import OrderModel from '@/models/OrderModel'
import '@/models/UserModel'
import { NextRequest, NextResponse } from 'next/server'

// Models: Order, Voucher
import '@/models/OrderModel'
import '@/models/VoucherModel'

export const dynamic = 'force-dynamic'

// [GET]: /order/:id
export async function GET(req: NextRequest, { params: { code } }: { params: { code: string } }) {
  console.log('- Get Order -')

  try {
    // connect to database
    await connectDatabase()

    // get order from database
    const order = await OrderModel.findOne({ code })
      .populate({
        path: 'voucherApplied',
        select: 'code desc',
      })
      .lean()
    // check order
    if (!order) {
      return NextResponse.json({ message: 'Order not found' }, { status: 404 })
    }
    // return order
    return NextResponse.json({ order, message: 'Order found' }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}
