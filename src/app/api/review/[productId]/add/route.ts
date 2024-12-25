import { connectDatabase } from '@/config/database'
import ProductModel from '@/models/ProductModel'
import ReviewModel from '@/models/ReviewModel'
import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'

// Models: Review, Product
import '@/models/ProductModel'
import '@/models/ReviewModel'

// [POST]: /review/:productId/add
export async function POST(
  req: NextRequest,
  { params: { productId } }: { params: { productId: string } }
) {
  console.log('- Add Review To Product -')

  try {
    // connect to database
    await connectDatabase()

    // get current user id
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    const userId = token?._id

    // check if user is authenticated
    if (!userId) {
      return NextResponse.json({ message: 'Vui lòng đăng nhập để đánh giá sản phẩm' }, { status: 401 })
    }

    // get product to check
    const product = await ProductModel.findOne({ _id: productId, active: true }).lean()

    // check if product exists
    if (!product) {
      return NextResponse.json({ message: 'Sản phẩm không tồn tại' }, { status: 404 })
    }

    // get review to check if user has reviewed this product
    const prevReview = await ReviewModel.findOne({ userId, productId }).lean()

    // check if user has reviewed this product
    if (prevReview) {
      return NextResponse.json(
        { message: 'Bạn chỉ có thể đánh giá sản phẩm này một lần' },
        { status: 400 }
      )
    }

    // get data to add review
    const { rating, content } = await req.json()

    // create review
    const review = await ReviewModel.create({
      userId,
      productId,
      rating,
      content,
    })

    // calculate average rating of product
    const reviews = await ReviewModel.find({ productId, status: 'show' }).lean()
    const averageRating = reviews.reduce((total, review) => total + review.rating, 0) / reviews.length

    // update product rating & review amount
    await ProductModel.findByIdAndUpdate(productId, {
      $set: { rating: averageRating },
      $inc: { reviewAmount: 1 },
    })

    // return response
    return NextResponse.json({ review, message: 'Đánh giá thành công' }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}
