import { connectDatabase } from '@/config/database'
import CartItemModel, { ICartItem } from '@/models/CartItemModel'
import ProductModel, { IProduct } from '@/models/ProductModel'
import { IUser } from '@/models/UserModel'
import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'

// Models: CartItem, Product, Flash Sale
import '@/models/CartItemModel'
import '@/models/FlashSaleModel'
import '@/models/ProductModel'

export type CartItemToAdd = {
  productId: string
  quantity: number
}

// [POST]: /cart/add
export async function POST(req: NextRequest) {
  console.log(' - Add Products To Cart - ')

  try {
    // Connect to database
    await connectDatabase()

    // Get product data to add to cart
    const { products }: { products: CartItemToAdd[] } = await req.json()
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    const userId: any = token?._id

    // Check if user logged in
    if (!userId) {
      return NextResponse.json({ message: 'Người dùng không tồn tại' }, { status: 401 })
    }

    // Fetch all products from database
    const productData = await ProductModel.find({
      _id: { $in: products.map((product: any) => product.productId) },
      active: true,
    })
      .populate('flashSale')
      .lean()

    // no product to add
    if (!productData.length) {
      return NextResponse.json({ message: 'Sản phẩm không tồn tại' }, { status: 404 })
    }

    // errors
    const errors: any = {
      notFound: [],
      notEnough: [],
    }

    // Create an array to store promises for adding products to cart
    const promises = products.map(async (product: any) => {
      const { productId, quantity } = product

      // Find the product in fetched data
      const foundProduct = productData.find((p: any) => p._id.toString() === productId)

      // not found product
      if (!foundProduct) {
        errors.notFound.push('Sản phẩm không tồn tại')
        return null
      }

      // Find existing cart item for the product
      let existingCartItem: ICartItem | null = await CartItemModel.findOne({ userId, productId }).lean()

      if (existingCartItem) {
        // not enough product to add
        if (foundProduct.stock < existingCartItem.quantity + quantity) {
          errors.notEnough.push(foundProduct.title)

          // current quantity is max
          if (foundProduct.stock === existingCartItem.quantity) {
            return
          }
        }

        // If product already exists in cart, update quantity
        const newQuantity = Math.min(existingCartItem.quantity + quantity, foundProduct.stock)
        await CartItemModel.findByIdAndUpdate(existingCartItem._id, { quantity: newQuantity })

        return {
          ...existingCartItem,
          quantity: newQuantity,
          product: foundProduct,
        } as ICartItem
      } else {
        // not enough product to add
        if (foundProduct.stock < quantity) {
          errors.notEnough.push(foundProduct.title)

          // current quantity is max
          if (foundProduct.stock === quantity) {
            return
          }
        }

        // If product does not exist in cart, create new cart item
        const newCartItem = new CartItemModel({
          userId,
          productId,
          quantity: Math.min(quantity, foundProduct.stock),
        })
        await newCartItem.save()

        return {
          ...newCartItem._doc,
          product: foundProduct,
        }
      }
    })

    // Execute all promises in parallel and remove null product
    let addedItems: any[] = (await Promise.all(promises.filter(Boolean))).filter(item => item)

    // Calculate total cart length
    const cartLength = addedItems.reduce((total, item) => total + (item?.quantity || 0), 0)

    // Return response with errors, if any
    return NextResponse.json(
      {
        cartItems: addedItems,
        cartLength,
        message: !!addedItems.length
          ? 'Đã thêm vào giỏ hàng:\n' + addedItems.map(item => item.product.title).join(',\n')
          : null,
        errors: {
          notFound: !!errors.notFound.length ? `Không tồn tại ${errors.notFound.length} sản phẩm` : null,
          notEnough: !!errors.notEnough.length
            ? 'Thiếu sản phẩm:\n' + errors.notEnough.join('\n')
            : null,
        },
      },
      { status: 201 }
    )
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}
