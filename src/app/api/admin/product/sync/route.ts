import { connectDatabase } from '@/config/database'
import AccountModel from '@/models/AccountModel'
import ProductModel, { IProduct } from '@/models/ProductModel'
import { NextRequest, NextResponse } from 'next/server'
import momentTZ from 'moment-timezone'

// Models: Product, Account
import '@/models/AccountModel'
import '@/models/ProductModel'

// [PATCH]: /admin/product/sync
export async function PATCH(req: NextRequest) {
  console.log('- Sync Products -')

  try {
    // connect to database
    await connectDatabase()

    // get products to sync
    const { all, ids } = await req.json()

    // if all is true, sync all products
    let products: IProduct[] = []
    if (all) {
      products = await ProductModel.find().lean()
    } else {
      products = await ProductModel.find({ _id: { $in: ids } }).lean()
    }

    const syncedProducts: IProduct[] = (
      await Promise.all(
        products.map(async product => {
          // count all account of product (type: product._id, usingUser: empty, active: true, begin: empty, expire: empty)
          const accountQuantity = await AccountModel.countDocuments({
            type: product._id,
            usingUser: { $exists: false },
            active: true,
            begin: { $exists: false },
            expire: { $exists: false },
            renew: { $gt: momentTZ.tz(new Date(), 'Asia/Ho_Chi_Minh').toDate() },
          })

          // update each product stock from account quantity
          const syncedProduct: IProduct | null = await ProductModel.findOneAndUpdate(
            { _id: product._id },
            { $set: { stock: accountQuantity } },
            { new: true }
          ).lean()
          return syncedProduct
        })
      )
    ).filter((product): product is IProduct => product != null)

    return NextResponse.json({
      syncedProducts,
      message: `Product ${syncedProducts.map(product => `"${product.title}"`).join(', ')} ${
        syncedProducts.length > 1 ? 'have' : 'has'
      } been synced`,
    })
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}
