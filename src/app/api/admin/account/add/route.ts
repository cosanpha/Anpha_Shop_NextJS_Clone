import { connectDatabase } from '@/config/database'
import AccountModel from '@/models/AccountModel'
import ProductModel from '@/models/ProductModel'
import { getTimes } from '@/utils/time'
import { NextRequest, NextResponse } from 'next/server'

// Models: Account, Product
import '@/models/AccountModel'
import '@/models/ProductModel'

// [POST]: /admin/account/add
export async function POST(req: NextRequest) {
  console.log('- Add Account - ')

  try {
    // connect to database
    await connectDatabase()

    // get data to add account
    const { type, info, renew, active, days, hours, minutes, seconds } = await req.json()
    const times = getTimes(+days, +hours, +minutes, +seconds)

    // create new account
    const newAccount = new AccountModel({
      type,
      info,
      renew: new Date(renew),
      times,
      active,
    })

    // save new account to database
    await newAccount.save()

    // increase product stock after add account
    await ProductModel.findByIdAndUpdate(type, {
      $inc: { stock: 1 },
    })

    // return response
    return NextResponse.json({ message: 'Add account successfully' }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}
