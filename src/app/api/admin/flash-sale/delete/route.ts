import { connectDatabase } from '@/config/database'
import FlashSaleModel from '@/models/FlashSaleModel'
import ProductModel from '@/models/ProductModel'
import { NextRequest, NextResponse } from 'next/server'

// Models: Product, Flash Sale
import '@/models/FlashSaleModel'
import '@/models/ProductModel'

// [DELETE]: /admin/flash-sale/delete
export async function DELETE(req: NextRequest) {
  console.log('- Delete Flash Sales - ')

  try {
    // connect to database
    await connectDatabase()

    // get voucher ids to delete
    const { ids, productIds } = await req.json()

    // get delete flash sales
    const deletedFlashSales = await FlashSaleModel.find({ _id: { $in: ids } }).lean()

    // delete voucher from database
    await FlashSaleModel.deleteMany({ _id: { $in: ids } })

    // remove flash sale of all products which are applying the deleted flash sales
    await ProductModel.updateMany({ _id: { $in: productIds } }, { $set: { flashSale: null } })

    // return response
    return NextResponse.json(
      {
        deletedFlashSales,
        message: `Flash Sale ${deletedFlashSales
          .map(flashSale => `"${flashSale.value}"`)
          .reverse()
          .join(', ')} ${deletedFlashSales.length > 1 ? 'have' : 'has'} been deleted`,
      },
      { status: 200 }
    )
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}
