import { connectDatabase } from '@/config/database'
import FlashSaleModel from '@/models/FlashSaleModel'
import ProductModel from '@/models/ProductModel'
import { NextRequest, NextResponse } from 'next/server'

// Models: Product, Flash Sale
import '@/models/FlashSaleModel'
import '@/models/ProductModel'

// [PATCH]: /admin/product/activate
export async function PATCH(req: NextRequest) {
  console.log('- Activate Products - ')

  try {
    // connect to database
    await connectDatabase()

    // get product ids to remove flash sales
    const { ids } = await req.json()

    // update products from database
    await ProductModel.updateMany({ _id: { $in: ids } }, { $set: { flashSale: null } })

    // get updated products
    const updatedProducts = await ProductModel.find({ _id: { $in: ids } }).lean()

    if (!updatedProducts.length) {
      throw new Error('No product found')
    }

    // update flash sale product quantity
    await FlashSaleModel.updateMany(
      { _id: { $in: updatedProducts.map(product => product.flashSale) } },
      { $inc: { productQuantity: -1 } }
    )

    // return response
    return NextResponse.json(
      {
        updatedProducts,
        message: `Flash sale of product ${updatedProducts
          .map(product => `"${product.title}"`)
          .reverse()
          .join(', ')} ${updatedProducts.length > 1 ? 'have' : 'has'} been removed`,
      },
      { status: 200 }
    )
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}
