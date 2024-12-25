import { connectDatabase } from '@/config/database'
import ProductModel, { IProduct } from '@/models/ProductModel'
import TagModel, { ITag } from '@/models/TagModel'
import { searchParamsToObject } from '@/utils/handleQuery'
import { applyFlashSalePrice } from '@/utils/number'
import { NextRequest, NextResponse } from 'next/server'

// Models: Product, Tag, Flash Sale
import '@/models/FlashSaleModel'
import '@/models/ProductModel'
import '@/models/TagModel'
import { IFlashSale } from '@/models/FlashSaleModel'

export const dynamic = 'force-dynamic'

// [GET]: /tag?tag=slug1&tag?=slug2...
export async function GET(req: NextRequest) {
  console.log('- Get Products By Tags -')

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

        if (key === 'tag') {
          filter.slug = { $in: params[key] }
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

    // get slug to filter tags
    const { slug } = filter
    delete filter.slug

    // find products by tag base on search params
    const tags = await TagModel.find(slug ? { slug } : {})
      .select('_id title')
      .lean()
    const tagIds = tags.map(tag => tag._id)

    let products: IProduct[] = []
    let amount: number = 0

    if (params.price) {
      // find products by tag ids
      products = await ProductModel.find({ tags: { $in: tagIds }, ...filter })
        .populate('tags flashSale')
        .sort(sort)
        .lean()

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
      // find products by tag ids
      products = await ProductModel.find({ tags: { $in: tagIds }, ...filter })
        .populate('flashSale')
        .sort(sort)
        .skip(skip)
        .limit(itemPerPage)
        .lean()

      // get amount of account
      amount = await ProductModel.countDocuments({ tags: { $in: tagIds }, ...filter })
    }

    // get all tags without filter
    const allTags: ITag[] = await TagModel.find().select('title slug').lean()

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
    return NextResponse.json({ products, tags: allTags, amount, chops: chops[0] }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ message: err.nessage }, { status: 500 })
  }
}
