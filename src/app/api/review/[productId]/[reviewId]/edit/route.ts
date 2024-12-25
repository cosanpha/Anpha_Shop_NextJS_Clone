import { connectDatabase } from '@/config/database'
import ReviewModel, { IReview } from '@/models/ReviewModel'
import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'

// Models: Review
import '@/models/ReviewModel'

// [PUT]: /review/:productId/:reviewId/edit
export async function PUT(
  req: NextRequest,
  { params: { productId, reviewId } }: { params: { productId: string; reviewId: string } }
) {
  console.log('- Edit Review -')

  try {
    // connect to database
    await connectDatabase()

    // get current user id
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    const userId = token?._id

    // check if userId is not found
    if (!userId) {
      return NextResponse.json({ message: 'Hãy đăng nhập để thực hiện tính năng này' }, { status: 404 })
    }

    // get review to check author
    const review: IReview | null = await ReviewModel.findById(reviewId).lean()

    // check if review is not found
    if (!review) {
      return NextResponse.json({ message: 'Đánh giá không tồn tại' }, { status: 404 })
    }

    // real review
    if (review?.userId && review.userId.toString() !== userId && token?.role !== 'admin') {
      return NextResponse.json({ message: 'Bạn không có quyền chỉnh sửa đánh giá này' }, { status: 403 })
    }
    // fake review
    if (!review?.userId && token?.role !== 'admin') {
      return NextResponse.json({ message: 'Bạn không có quyền chỉnh sửa đánh giá này' }, { status: 403 })
    }

    // get data to edit review
    const { rating, content } = await req.json()

    // update review
    const updatedReview = await ReviewModel.findByIdAndUpdate(
      reviewId,
      {
        $set: {
          rating,
          content,
        },
      },
      { new: true }
    )
      .populate({
        path: 'userId',
        select: 'firstname lastname username avatar',
      })
      .lean()

    // return response
    return NextResponse.json({ updatedReview, message: 'Update Review Successfully' }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}
