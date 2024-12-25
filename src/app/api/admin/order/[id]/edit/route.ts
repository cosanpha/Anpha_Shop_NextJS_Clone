// Models: Order
import { connectDatabase } from '@/config/database'
import '@/models/OrderModel'
import OrderModel from '@/models/OrderModel'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// [PUT]: /admin/order/:id/edit
export async function PUT(req: NextRequest, { params: { id } }: { params: { id: string } }) {
  console.log('- Edit Order - ')

  try {
    // connect to database
    await connectDatabase()

    // get data to edit order
    const { createdAt, email, status, total, items } = await req.json()

    // update order
    const updatedOrder = await OrderModel.findByIdAndUpdate(
      id,
      {
        $set: {
          createdAt,
          email,
          status,
          total,
          items,
        },
      },
      { new: true }
    )

    // check if order exists or not
    if (!updatedOrder) {
      return NextResponse.json({ message: 'Order not found' }, { status: 404 })
    }

    // return updated order
    return NextResponse.json({ updatedOrder, message: 'Order has been updated' }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
