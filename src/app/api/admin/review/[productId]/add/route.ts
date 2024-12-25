import { connectDatabase } from '@/config/database'
import ReviewModel from '@/models/ReviewModel'
import { NextRequest, NextResponse } from 'next/server'

// Models: Review
import '@/models/ReviewModel'

// [POST]: /admin/review/:productId/add
export async function POST(
  req: NextRequest,
  { params: { productId } }: { params: { productId: string } }
) {
  console.log('- Add Fake Review -')

  try {
    // connect to database
    await connectDatabase()

    // get data to add fake review
    const data = await req.json()
    const { displayName, rating, reviewDate, content, status } = data

    console.log('data', data)

    // add review
    const review = await ReviewModel.create({
      productId,
      displayName,
      rating,
      reviewDate,
      content,
      status,
    })

    console.log('review', review)

    // return response
    return NextResponse.json({ review, message: 'Add Review Successfully' }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}
