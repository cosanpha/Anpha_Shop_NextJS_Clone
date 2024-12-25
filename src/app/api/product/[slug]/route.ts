import { connectDatabase } from '@/config/database'
import ProductModel, { IProduct } from '@/models/ProductModel'
import { NextRequest, NextResponse } from 'next/server'
import ReviewModel from '@/models/ReviewModel'

// Models: Product, Tag, Category, Flash Sale, User, Review
import '@/models/CategoryModel'
import '@/models/FlashSaleModel'
import '@/models/ProductModel'
import '@/models/TagModel'
import '@/models/UserModel'
import '@/models/ReviewModel'

export const dynamic = 'force-dynamic'

// [GET]: /product/:slug
export async function GET(req: NextRequest, { params: { slug } }: { params: { slug: string } }) {
  console.log('- Get Product Page -')

  try {
    // connect to database
    await connectDatabase()

    // get product from database
    const product: IProduct | null = await ProductModel.findOne({
      slug: encodeURIComponent(slug),
      active: true,
    })
      .populate('tags')
      .populate('category')
      .populate('flashSale')
      .lean()

    // check if product is not found
    if (!product) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 })
    }

    // get relatedProducts
    const relatedProducts: IProduct[] = await ProductModel.find({
      _id: { $ne: product._id },
      active: true,
      category: product.category,
    })
      .populate('flashSale')
      .lean()

    // return response
    return NextResponse.json({ product, relatedProducts }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}
