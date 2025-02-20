import { connectDatabase } from '@/config/database'
import FlashSaleModel from '@/models/FlashSaleModel'
import ProductModel from '@/models/ProductModel'
import { NextRequest, NextResponse } from 'next/server'

// Models: Flash Sale, Product
import '@/models/FlashSaleModel'
import '@/models/ProductModel'

// [POST]: /admin/flash-sale/add
export async function POST(req: NextRequest) {
  console.log('- Add Flash Sale -')

  try {
    // connect to database
    await connectDatabase()

    // get data to create flash sale
    const { type, value, begin, timeType, duration, expire, appliedProducts } = await req.json()

    // create new flash sale in database
    const newFlashSale = new FlashSaleModel({
      type,
      value,
      begin,
      timeType,
      duration: timeType === 'loop' ? duration : null,
      expire: timeType === 'once' ? expire : null,
    })

    // save new flash sale to database
    await newFlashSale.save()

    // update flash sale field for all products in applyProducts
    await ProductModel.updateMany(
      { _id: { $in: appliedProducts } }, // Match products by their IDs
      { $set: { flashSale: newFlashSale._id } } // Set the flash sale field
    )

    // get productQuantity of the products have just applied flash sale
    const productQuantity = await ProductModel.countDocuments({ flashSale: newFlashSale._id })

    // update flash sale quantity
    await FlashSaleModel.findByIdAndUpdate(newFlashSale._id, { $set: { productQuantity } })

    // return new flash sale
    return NextResponse.json(
      { message: `Flash sale (${newFlashSale.value}) has been created` },
      { status: 201 }
    )
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}
