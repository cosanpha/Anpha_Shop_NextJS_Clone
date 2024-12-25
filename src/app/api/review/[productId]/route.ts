import { connectDatabase } from '@/config/database'
import ReviewModel from '@/models/ReviewModel'
import { searchParamsToObject } from '@/utils/handleQuery'
import momentTZ from 'moment-timezone'
import { NextRequest, NextResponse } from 'next/server'

// Models: Review
import '@/models/ReviewModel'

export const dynamic = 'force-dynamic'

// [GET]: /review/:productId
export async function GET(
  req: NextRequest,
  { params: { productId } }: { params: { productId: string; status: 'show' } }
) {
  console.log('- Get Product Reviews -')

  try {
    // connect to database
    await connectDatabase()

    // get query params
    const params: { [key: string]: string[] } = searchParamsToObject(req.nextUrl.searchParams)

    // options
    let skip = 0
    let itemPerPage = 10
    const filter: { [key: string]: any } = { productId, status: 'show' }
    let sort: { [key: string]: any } = { createdAt: -1 } // default sort

    // build filter
    for (const key in params) {
      if (params.hasOwnProperty(key)) {
        // Special Cases ---------------------
        if (key === 'limit') {
          if (params[key][0] === 'no-limit') {
            itemPerPage = Number.MAX_SAFE_INTEGER
            skip = 0
          } else {
            itemPerPage = +params[key][0]
          }
          continue
        }

        if (key === 'page') {
          const page = +params[key][0]
          skip = (page - 1) * itemPerPage
          continue
        }

        if (key === 'search') {
          const searchFields = ['content']

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

        if (key === 'from-to') {
          const dates = params[key][0].split('|')

          if (dates[0] && dates[1]) {
            filter.createdAt = {
              $gte: momentTZ.tz(dates[0], 'Asia/Ho_Chi_Minh').toDate(),
              $lt: momentTZ.tz(dates[1], 'Asia/Ho_Chi_Minh').toDate(),
            }
          } else if (dates[0]) {
            filter.createdAt = {
              $gte: momentTZ.tz(dates[0], 'Asia/Ho_Chi_Minh').toDate(),
            }
          } else if (dates[1]) {
            filter.createdAt = {
              $lt: momentTZ.tz(dates[1], 'Asia/Ho_Chi_Minh').toDate(),
            }
          }

          continue
        }

        // Normal Cases ---------------------
        filter[key] = params[key].length === 1 ? params[key][0] : { $in: params[key] }
      }
    }

    // calculate amount of each rating
    const [reviews, five, four, three, two, one] = await Promise.all([
      // get all review of product
      ReviewModel.find(filter)
        .populate({
          path: 'userId',
          select: 'firstname lastname username avatar',
        })
        .sort(sort)
        .skip(skip)
        .limit(itemPerPage)
        .lean(),
      ReviewModel.countDocuments({ ...filter, rating: 5 }),
      ReviewModel.countDocuments({ ...filter, rating: 4 }),
      ReviewModel.countDocuments({ ...filter, rating: 3 }),
      ReviewModel.countDocuments({ ...filter, rating: 2 }),
      ReviewModel.countDocuments({ ...filter, rating: 1 }),
    ])

    // return response
    return NextResponse.json({ reviews, stars: [five, four, three, two, one] }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}
