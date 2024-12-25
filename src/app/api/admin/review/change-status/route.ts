import { connectDatabase } from '@/config/database'
import ReviewModel from '@/models/ReviewModel'
import { NextRequest, NextResponse } from 'next/server'

// Models: Review
import '@/models/ReviewModel'

// [PATCH]: /review/:productId/:reviewId/change-status
export async function PATCH(req: NextRequest) {
  console.log('- Change Review Status -')

  try {
    // connect to database
    await connectDatabase()

    // get data to edit review
    const { ids, status } = await req.json()

    console.log('ids:', ids)
    console.log('status:', status)

    // update review
    await ReviewModel.updateMany({ _id: { $in: ids } }, { $set: { status } }, { new: true })
      .populate({
        path: 'userId',
        select: 'firstname lastname username avatar',
      })
      .lean()

    // return response
    return NextResponse.json(
      { message: `${ids.length} review statues have been changed` },
      { status: 200 }
    )
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}
