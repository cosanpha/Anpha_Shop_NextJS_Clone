import { connectDatabase } from '@/config/database'
import AccountModel, { IAccount } from '@/models/AccountModel'
import ProductModel from '@/models/ProductModel'
import { NextRequest, NextResponse } from 'next/server'

// Models: Account, Product
import '@/models/AccountModel'
import '@/models/ProductModel'

// [DELETE]: /admin/account/delete
export async function DELETE(req: NextRequest) {
  console.log('- Delete Accounts - ')

  try {
    // connect to database
    await connectDatabase()

    // get account ids to delete
    const { ids } = await req.json()

    // Find accounts by their IDs before deletion
    const accounts: IAccount[] = await AccountModel.find({
      _id: { $in: ids },
    }).lean()

    // delete account by ids
    await AccountModel.deleteMany({
      _id: { $in: ids },
    })

    // decrease stock of relative products
    await Promise.all(
      accounts.map(async account => {
        // account is not using
        if (!account.usingUser) {
          // check product stock before descrease stock
          const product = await ProductModel.findById(account.type)
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
      })
    )

    // return response
    return NextResponse.json(
      {
        deletedAccounts: accounts,
        message: `${accounts.length} account${accounts.length > 1 ? 's' : ''} ${
          accounts.length > 1 ? 'have' : 'has'
        } been deleted`,
      },
      { status: 200 }
    )
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}
