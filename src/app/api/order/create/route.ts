import { connectDatabase } from '@/config/database'
import CartItemModel, { ICartItem } from '@/models/CartItemModel'
import OrderModel from '@/models/OrderModel'
import UserModel, { IUser } from '@/models/UserModel'
import { generateOrderCode } from '@/utils'
import handleDeliverOrder from '@/utils/handleDeliverOrder'
import { notifyNewOrderToAdmin } from '@/utils/sendMail'
import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'

// Models: User, CartItem, Order
import '@/models/CartItemModel'
import '@/models/OrderModel'
import '@/models/UserModel'

// [POST]: /order/create
export async function POST(req: NextRequest) {
  console.log('- Create Order -')

  try {
    // connect to database
    await connectDatabase()

    // get data to create order
    const code = await generateOrderCode(5)
    const { email, total, voucherApplied, discount, items, paymentMethod } = await req.json()

    // get user id
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    const userId = token?._id

    // check valid total
    if (total <= 0) {
      return NextResponse.json({ message: 'Số tiền thanh toán không hợp lệ' }, { status: 400 })
    }

    // balance payment method
    if (paymentMethod === 'balance') {
      if (!userId) {
        return NextResponse.json(
          { message: 'Bạn cần đăng nhập để sử dụng phương thức thanh toán này' },
          { status: 400 }
        )
      }

      // get user balance
      const user: IUser | null = await UserModel.findById(userId).lean()

      // check user balance
      if ((user?.balance || 0) < total) {
        return NextResponse.json(
          { message: 'Số dư không đủ, hãy nạp thêm để thanh toán' },
          { status: 400 }
        )
      }
    }

    // create new order
    const newOrder = new OrderModel({
      code,
      userId,
      email,
      voucherApplied,
      discount,
      total,
      items,
      paymentMethod,
    })
    // save new order
    await newOrder.save()

    // if user logged in => cart is database cart => Delete cart items
    let removedCartItems = []
    if (userId) {
      // delete cart items from database
      removedCartItems = items.map((item: ICartItem) => item._id)
      await CartItemModel.deleteMany({
        _id: { $in: removedCartItems },
      })
    }

    // auto deliver order
    let response: any = null
    if (process.env.IS_AUTO_DELIVER === 'YES' || paymentMethod === 'balance') {
      handleDeliverOrder(newOrder._id)
    }

    // return new order
    const message =
      response && response.isError
        ? 'Đơn hàng đang được xử lý, xin vui lòng chờ'
        : 'Đơn hàng đã được gửi qua email ' + email

    // notify new order to admin
    await notifyNewOrderToAdmin(newOrder)

    return NextResponse.json({ code, removedCartItems, message }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}
