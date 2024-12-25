import { connectDatabase } from '@/config/database'
import '@/models/FlashSaleModel'
import ProductModel, { IProduct } from '@/models/ProductModel'
import { searchParamsToObject } from '@/utils/handleQuery'
import { applyFlashSalePrice } from '@/utils/number'
import { NextRequest, NextResponse } from 'next/server'

// Models: Product, Flash Sale
import '@/models/FlashSaleModel'
import '@/models/ProductModel'
import { IFlashSale } from '@/models/FlashSaleModel'

export const dynamic = 'force-dynamic'

// [GET]: /flash-sale
export async function GET(req: NextRequest) {
  console.log('- Get Flash Sale Products -')

  try {
    // connect to database
    await connectDatabase()

    // get query params
    const params: { [key: string]: string[] } = searchParamsToObject(req.nextUrl.searchParams)

    // options
    let skip = 0
    let itemPerPage = 8
    const filter: { [key: string]: any } = { active: true }
    let sort: { [key: string]: any } = { updatedAt: -1 } // default sort

    // build filter
    for (const key in params) {
      if (params.hasOwnProperty(key)) {
        // Special Cases ---------------------
        if (key === 'page') {
          const page = +params[key][0]
          skip = (page - 1) * itemPerPage
          continue
        }

        if (key === 'search') {
          const searchFields = ['title', 'description', 'slug']

          filter.$or = searchFields.map(field => ({
            [field]: { $regex: params[key][0], $options: 'i' },
          }))
          continue
        }

        if (key === 'sort') {
          sort = {
            [params[key][0].split('|')[0]]: +params[key][0].split('|')[1],
          }
          continue
        }

        if (key === 'stock') {
          filter[key] = { $lte: +params[key][0] }
          continue
        }

        if (key === 'price') {
          continue
        }

        // Normal Cases ---------------------
        filter[key] = params[key].length === 1 ? params[key][0] : { $in: params[key] }
      }
    }

    let products: IProduct[] = []
    let amount: number = 0
    if (params.price) {
      // get all products from database
      products = await ProductModel.find({
        flashSale: { $exists: true, $ne: null },
        ...filter,
      })
        .populate('flashSale')
        .sort(sort)
        .lean()

      products = products
        .map(product => {
          const appliedPrice = applyFlashSalePrice(product.flashSale as IFlashSale, product.price)
          return { ...product, price: appliedPrice }
        })
        .filter(product => product.price <= +params.price[0])
        .slice(skip, skip + itemPerPage)

      amount = products.length
    } else {
      // get all products
      products = await ProductModel.find({
        flashSale: { $exists: true, $ne: null },
        ...filter,
      })
        .populate('flashSale')
        .sort(sort)
        .skip(skip)
        .limit(itemPerPage)
        .lean()

      // get amount of account
      amount = await ProductModel.countDocuments({
        flashSale: { $exists: true, $ne: null },
        ...filter,
      })
    }

    // get min - max values
    const chops = await ProductModel.aggregate([
      {
        $group: {
          _id: null,
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
          minStock: { $min: '$stock' },
          maxStock: { $max: '$stock' },
        },
      },
    ])

    // return flash sale products
    return NextResponse.json({ products, amount, chops: chops[0] }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}
