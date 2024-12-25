import { connectDatabase } from '@/config/database'
import FlashSaleModel, { IFlashSale } from '@/models/FlashSaleModel'
import ProductModel, { IProduct } from '@/models/ProductModel'
import { NextRequest, NextResponse } from 'next/server'

// Models: Product, Flash Sale
import '@/models/FlashSaleModel'
import '@/models/ProductModel'

export const dynamic = 'force-dynamic'

// [GET]: /flash-sale/:id
export async function GET(req: NextRequest, { params: { id } }: { params: { id: string } }) {
  console.log('- Get Flash Sale -')

  try {
    // connect to database
    await connectDatabase()

    // get flash sale from database
    const flashSale: IFlashSale | null = await FlashSaleModel.findById(id).lean()

    if (!flashSale) {
      return NextResponse.json({ message: 'Flash sale not found' }, { status: 404 })
    }

    // get all product that have been applied by the flash sale
    const appliedProducts: IProduct[] = await ProductModel.find({ flashSale: flashSale._id }).select(
      'title images'
    )
    flashSale.products = appliedProducts

    // return flash sale
    return NextResponse.json({ flashSale, message: 'Flash Sale found' }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}
