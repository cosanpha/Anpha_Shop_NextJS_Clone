import { connectDatabase } from '@/config/database'
import ProductModel, { IProduct } from '@/models/ProductModel'
import { NextRequest, NextResponse } from 'next/server'

// Models: Product
import '@/models/ProductModel'

// [GET]: /product/search?search=...
export async function GET(req: NextRequest) {
  console.log('- Search -')

  try {
    // connect to database
    await connectDatabase()

    // get query params
    // get email and token from query
    const searchParams = req.nextUrl.searchParams
    const search: string = searchParams.get('search') || ''

    // options
    const filter: { [key: string]: any } = { active: true }
    let sort: { [key: string]: any } = { updatedAt: -1 } // default sort

    // build filter
    const searchFields = ['title', 'slug', 'tags.title', 'tags.slug', 'category.title', 'category.slug']

    // create $or array for text fields
    const orArray: any[] = searchFields.map(field => ({
      [field]: { $regex: search, $options: 'i' },
    }))

    // Try to convert search query to number for price and oldPrice fields
    const num = Number(search)
    if (!isNaN(num)) {
      orArray.push({ price: num })
      orArray.push({ oldPrice: num })
      orArray.push({ sold: num })
      orArray.push({ stock: num })
    }

    // custom search
    if (
      ['sold out', 'soldout', 'out of stock', 'outofstock', 'hết hàng'].includes(search.toLowerCase())
    ) {
      orArray.push({ stock: { $lte: 0 } })
    }

    filter.$or = orArray

    // find products by category base on search params
    let products: IProduct[] = await ProductModel.find(filter).sort(sort).lean()

    // return response
    return NextResponse.json({ products }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}
