import { connectDatabase } from '@/config/database'
import CategoryModel from '@/models/CategoryModel'
import ProductModel from '@/models/ProductModel'
import TagModel from '@/models/TagModel'
import { searchParamsToObject } from '@/utils/handleQuery'
import { NextRequest, NextResponse } from 'next/server'

// Models: Category, Tag, Product
import '@/models/CategoryModel'
import '@/models/ProductModel'
import '@/models/TagModel'

export const dynamic = 'force-dynamic'

// [GET]: /admin/product/all
export async function GET(req: NextRequest) {
  console.log('- Get All Products -')

  try {
    // connect to database
    await connectDatabase()

    // get query params
    const params: { [key: string]: string[] } = searchParamsToObject(req.nextUrl.searchParams)

    // options
    let skip = 0
    let itemPerPage = 9
    const filter: { [key: string]: any } = {}
    let sort: { [key: string]: any } = { updatedAt: -1 } // default sort

    // build filter
    for (const key in params) {
      if (params.hasOwnProperty(key)) {
        if (key === 'limit') {
          if (params[key][0] === 'no-limit') {
            itemPerPage = Number.MAX_SAFE_INTEGER
            skip = 0
          } else {
            itemPerPage = +params[key][0]
          }
          continue
        }

        // Special Cases ---------------------
        if (key === 'page') {
          const page = +params[key][0]
          skip = (page - 1) * itemPerPage
          continue
        }

        if (key === 'sort') {
          sort = {
            [params[key][0].split('|')[0]]: +params[key][0].split('|')[1],
          }
          continue
        }

        if (['price', 'sold', 'stock'].includes(key)) {
          filter[key] = { $lte: +params[key][0] }
          continue
        }

        if (key === 'flashSale') {
          filter[key] =
            params[key][0] === 'true' ? { $exists: true, $ne: null } : { $exists: false, $eq: null }
          continue
        }

        // Normal Cases ---------------------
        filter[key] = params[key].length === 1 ? params[key][0] : { $in: params[key] }
      }
    }

    // get amount of products
    const amount = await ProductModel.countDocuments(filter)

    // get all products from database
    const products = await ProductModel.find(filter)
      .populate('tags category')
      .sort(sort)
      .skip(skip)
      .limit(itemPerPage)
      .lean()

    // get tags and categories
    const tgs = await TagModel.find().select('title').lean()
    const cates = await CategoryModel.find().select('title').lean()

    // get all order without filter
    const chops = await ProductModel.aggregate([
      {
        $group: {
          _id: null,
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
          minSold: { $min: '$sold' },
          maxSold: { $max: '$sold' },
          minStock: { $min: '$stock' },
          maxStock: { $max: '$stock' },
        },
      },
    ])

    // return all products
    return NextResponse.json({ products, amount, tgs, cates, chops: chops[0] }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}
