import { connectDatabase } from '@/config/database'
import ProductModel from '@/models/ProductModel'
import ReviewModel from '@/models/ReviewModel'
import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'

// Models: Review, Product
import '@/models/ProductModel'
import '@/models/ReviewModel'

// [DELETE]: /review/:productId
export async function DELETE(
  req: NextRequest,
  { params: { productId } }: { params: { productId: string } }
) {
  console.log('- Delete Reviews -')

  try {
    // connect to database
    await connectDatabase()

    // get current user id
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    const userId = token?._id

    // check if userId is not found
    if (!userId) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    // check role (only admin can delete reviews)
    if (token?.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    // get review ids to delete
    const { ids } = await req.json()

    // get deleted reviews
    const deletedReviews = await ReviewModel.find({ _id: { $in: ids } }).lean()

    // delete reviews
    await ReviewModel.deleteMany({ _id: { $in: ids } })

    // calculate average rating of product
    const reviews = await ReviewModel.find({ productId, status: 'show' }).lean()
    const averageRating =
      reviews.reduce((total, review) => total + review.rating, 0) / (reviews.length || 1)

    // update product rating & review amount
    await ProductModel.findByIdAndUpdate(productId, {
      $set: { rating: averageRating },
      $inc: { reviewAmount: -ids.length },
    })

    // return response
    return NextResponse.json({ deletedReviews, message: 'Deleted Successfully' }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}
