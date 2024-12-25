import { connectDatabase } from '@/config/database'
import AccountModel from '@/models/AccountModel'
import '@/models/UserModel'
import { NextRequest, NextResponse } from 'next/server'

// Models: Account
import '@/models/AccountModel'

export const dynamic = 'force-dynamic'

// [GET]: /admin/account/:id
export async function GET(req: NextRequest, { params: { id } }: { params: { id: string } }) {
  console.log('- Get Account -')

  try {
    // connect to database
    await connectDatabase()

    // get account from database
    const account = await AccountModel.findById(id).lean()

    // check account
    if (!account) {
      return NextResponse.json({ message: 'Account not found' }, { status: 404 })
    }
    // return account
    return NextResponse.json({ account, message: 'Account found' }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}
