import { connectDatabase } from '@/config/database'
import CartItemModel from '@/models/CartItemModel'
import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'

// Models: CartItem, Product
import '@/models/CartItemModel'
import '@/models/ProductModel'

// [PATCH]: /cart/:id/set-quantity
export async function PATCH(req: NextRequest, { params: { id } }: { params: { id: string } }) {
  console.log(' - Set Cart Quantity - ')

  try {
    // connect to database
    await connectDatabase()

    // get user id
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    const userId = token?._id

    // get data to set cart item quantity
    const { quantity } = await req.json()

    // check if user is authenticated
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    // get cart item to update
    let cartItem: any = await CartItemModel.findById(id).populate('productId').lean()

    // update cart item
    const updatedCartItem = await CartItemModel.findByIdAndUpdate(
      cartItem?._id,
      { quantity },
      { new: true }
    )

    // return response
    return NextResponse.json(
      { updatedCartItem, message: 'Cập nhật số lượng sản phẩm thành công' },
      { status: 200 }
    )
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}
