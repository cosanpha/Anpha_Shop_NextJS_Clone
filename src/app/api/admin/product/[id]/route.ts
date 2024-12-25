import { connectDatabase } from '@/config/database'
import ProductModel from '@/models/ProductModel'
import { NextRequest, NextResponse } from 'next/server'

// Models: Product
import '@/models/ProductModel'

export const dynamic = 'force-dynamic'

// [GET]: /product/:id
export async function GET(req: NextRequest, { params: { id } }: { params: { id: string } }) {
  console.log('- Get Product -')

  try {
    // connect to database
    await connectDatabase()

    // get product from database
    const product = await ProductModel.findById(id).lean()

    // return product
    return NextResponse.json({ product, message: 'Product found' }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}
