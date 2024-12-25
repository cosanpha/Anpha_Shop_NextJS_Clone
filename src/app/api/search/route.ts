import { connectDatabase } from '@/config/database'
import ProductModel, { IProduct } from '@/models/ProductModel'
import { searchParamsToObject } from '@/utils/handleQuery'
import { applyFlashSalePrice } from '@/utils/number'
import { NextRequest, NextResponse } from 'next/server'
import { IFlashSale } from '@/models/FlashSaleModel'

// Models: Product, Tag, Category, Flash Sale
import '@/models/FlashSaleModel'
import '@/models/ProductModel'

// [GET]: /search?search=...
export async function GET(req: NextRequest) {
  console.log('- Search -')

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
          const searchFields = [
            'title',
            'slug',
            'tags.title',
            'tags.slug',
            'category.title',
            'category.slug',
          ]

          // create $or array for text fields
          const orArray: any[] = searchFields.map(field => ({
            [field]: { $regex: params[key][0], $options: 'i' },
          }))

          // Try to convert search query to number for price and oldPrice fields
          const num = Number(params[key][0])
          if (!isNaN(num)) {
            orArray.push({ price: num })
            orArray.push({ oldPrice: num })
            orArray.push({ sold: num })
            orArray.push({ stock: num })
          }

          filter.$or = orArray

          // custom search
          if (
            ['sold out', 'soldout', 'out of stock', 'outofstock', 'hết hàng'].includes(
              params[key][0].toLowerCase()
            )
          ) {
            filter.stock = { $lte: 0 }
          }
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

    // find products by category base on search params
    let products: IProduct[] = await ProductModel.find(filter)
      .populate('flashSale')
      .sort(sort)
      .skip(skip)
      .limit(itemPerPage)
      .lean()

    let amount: number = 0

    if (params.price) {
      products = products
        .map(product => {
          if (!product.flashSale) return product

          const appliedPrice = applyFlashSalePrice(product.flashSale as IFlashSale, product.price)
          return { ...product, price: appliedPrice }
        })
        .filter(product => product.price <= +params.price[0])
        .slice(skip, skip + itemPerPage)

      amount = products.length
    } else {
      amount = await ProductModel.countDocuments(filter)
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

    // return response
    return NextResponse.json({ products, amount, chops: chops[0] }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}
