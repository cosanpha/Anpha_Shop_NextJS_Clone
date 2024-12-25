import { connectDatabase } from '@/config/database'
import ReviewModel from '@/models/ReviewModel'
import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'

// Models: Review
import '@/models/ReviewModel'

export const dynamic = 'force-dynamic'

// [GET]: /review/:productId/check-user-reviewed
export async function GET(
  req: NextRequest,
  { params: { productId } }: { params: { productId: string; status: 'show' } }
) {
  console.log('- Check User Reviewed -')

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

    // get review to check
    const review = await ReviewModel.findOne({ userId, productId })
      .populate({
        path: 'userId',
        select: 'firstname lastname username avatar',
      })
      .lean()

    // check if review is found
    if (review) {
      return NextResponse.json(
        { isReviewed: true, review, message: 'Bạn chỉ có thể đánh giá sản phẩm này một lần' },
        { status: 200 }
      )
    }

    return NextResponse.json({ isReviewed: false }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}
