import { connectDatabase } from '@/config/database'
import ProductModel from '@/models/ProductModel'
import { NextRequest, NextResponse } from 'next/server'

// Models: Product
import '@/models/ProductModel'

// [PATCH]: /admin/product/boot
export async function PATCH(req: NextRequest) {
  console.log('- Boot Products - ')

  try {
    // connect to database
    await connectDatabase()

    // get product id to delete
    const { ids, value } = await req.json()

    // update products from database
    await ProductModel.updateMany({ _id: { $in: ids } }, { $set: { booted: value || false } })

    // get updated products
    const updatedProducts = await ProductModel.find({ _id: { $in: ids } }).lean()

    if (!updatedProducts.length) {
      throw new Error('No product found')
    }

    // return response
    return NextResponse.json(
      {
        updatedProducts,
        message: `Product ${updatedProducts
          .map(product => `"${product.title}"`)
          .reverse()
          .join(', ')} ${updatedProducts.length > 1 ? 'have' : 'has'} been ${
          value ? 'booted' : 'debooted'
        }`,
      },
      { status: 200 }
    )
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}
