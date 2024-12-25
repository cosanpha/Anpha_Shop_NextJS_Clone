import { connectDatabase } from '@/config/database'
import ReviewModel from '@/models/ReviewModel'
import { NextRequest, NextResponse } from 'next/server'

// Models: Product, Review
import '@/models/ProductModel'
import ProductModel from '@/models/ProductModel'
import '@/models/ReviewModel'

// [PATCH]: /admin/review/:productId/sync
export async function PATCH(
  req: NextRequest,
  { params: { productId } }: { params: { productId: string } }
) {
  console.log('- Sync Product Reviews -')

  try {
    // connect to database
    await connectDatabase()

    // get all "show" reviews of the product
    const reviews = await ReviewModel.find({ productId, status: 'show' }).lean()

    // calculate average rating
    const rating = reviews.reduce((acc, review) => acc + review.rating, 0) / (reviews.length || 1)

    // update product
    const syncedProduct = await ProductModel.findByIdAndUpdate(
      productId,
      {
        $set: {
          rating,
          reviewAmount: reviews.length,
        },
      },
      { new: true }
    )

    // return response
    return NextResponse.json({ syncedProduct, message: 'Synced Reviews Successfully' }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}
