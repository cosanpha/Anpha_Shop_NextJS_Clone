import { connectDatabase } from '@/config/database'
import AccountModel, { IAccount } from '@/models/AccountModel'
import ProductModel from '@/models/ProductModel'
import { NextRequest, NextResponse } from 'next/server'

// Models: Account, Product
import '@/models/AccountModel'
import '@/models/ProductModel'

// [PATCH]: /admin/account/feature
export async function PATCH(req: NextRequest) {
  console.log('- Activate Accounts - ')

  try {
    // connect to database
    await connectDatabase()

    // get account id to delete
    const { ids, value } = await req.json()

    // update accounts from database
    await AccountModel.updateMany({ _id: { $in: ids } }, { $set: { active: value || false } })

    // get updated accounts
    const accounts: IAccount[] = await AccountModel.find({ _id: { $in: ids } }).lean()

    if (!accounts.length) {
      throw new Error('No account found')
    }

    // decrease/increase stock of relative products
    await Promise.all(
      accounts.map(async account => {
        if (!account.usingUser) {
          // check product stock if descrease stock
          const product = await ProductModel.findById(account.type)
          if (value) {
            await ProductModel.updateOne(
              { _id: account.type },
              {
                $inc: {
                  stock: 1,
                },
              }
            )
          } else {
            if (product.stock > 0) {
              await ProductModel.updateOne(
                { _id: account.type },
                {
                  $inc: {
                    stock: -1,
                  },
                }
              )
            }
          }
        }
      })
    )

    // return response
    return NextResponse.json(
      {
        updatedAccounts: accounts,
        message: `${accounts.length} account${accounts.length > 1 ? 's' : ''} ${
          accounts.length > 1 ? 'have' : 'has'
        } been ${value ? 'activated' : 'deactivated'}`,
      },
      { status: 200 }
    )
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}
