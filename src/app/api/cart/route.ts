import { connectDatabase } from '@/config/database'
import CartItemModel, { ICartItem } from '@/models/CartItemModel'
import '@/models/FlashSaleModel'
import '@/models/ProductModel'
import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'

// Models: CartItem, Product
import '@/models/CartItemModel'
import '@/models/ProductModel'

export const dynamic = 'force-dynamic'

// [GET]: /cart
export async function GET(req: NextRequest) {
  console.log('- Get User Cart - ')

  try {
    // connect to database
    await connectDatabase()

    // get userId to get user's cart
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    const userId = token?._id

    // check if user logged in
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    // get cart from database
    let cart: any[] = await CartItemModel.find({ userId })
      .populate({
        path: 'productId',
        populate: {
          path: 'flashSale',
          model: 'flashSale',
        },
      })
      .sort({ createdAt: -1 })
      .lean()

    cart = cart
      .map(cartItem =>
        cartItem.productId
          ? {
              ...cartItem,
              product: cartItem.productId,
              productId: cartItem.productId._id,
              quantity:
                cartItem.quantity > cartItem.productId.stock // make sure quantity is not more than stock
                  ? cartItem.productId.stock
                  : cartItem.quantity,
            }
          : null
      )
      .filter(cartItem => cartItem) as ICartItem[]

    // return user's cart
    return NextResponse.json({ cart }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}
