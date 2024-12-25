import { connectDatabase } from '@/config/database'
import ReviewModel from '@/models/ReviewModel'
import { NextRequest, NextResponse } from 'next/server'

// Models: Review
import '@/models/ReviewModel'

// [PUT]: /review/:productId/:reviewId/edit
export async function PUT(
  req: NextRequest,
  { params: { productId, reviewId } }: { params: { productId: string; reviewId: string } }
) {
  console.log('- Edit Force Review -')

  try {
    // connect to database
    await connectDatabase()

    // get data to edit review
    const { displayName, rating, content, image, reviewDate } = await req.json()

    // update review
    const updatedReview = await ReviewModel.findByIdAndUpdate(
      reviewId,
      {
        $set: {
          displayName,
          image,
          rating,
          content,
          reviewDate: new Date(reviewDate),
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
