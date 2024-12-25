import { connectDatabase } from '@/config/database'
import UserModel, { IUser } from '@/models/UserModel'
import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'

// Models: User
import '@/models/UserModel'

export const dynamic = 'force-dynamic'

// [GET]: /user/refresh-balance
export async function GET(req: NextRequest) {
  console.log('- Refresh Balance - ')

  try {
    // connect to database
    await connectDatabase()

    // get user id to get user balance
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    const userId = token?._id

    // check if user is logged in
    if (!userId) {
      return NextResponse.json({ message: 'Vui lòng đăng nhập' }, { status: 401 })
    }

    // get user balance
    const user: IUser | null = await UserModel.findById(userId).select('balance').lean()

    // check if user not found
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    // return response
    return NextResponse.json({ balance: user.balance, message: 'Refresh Successfully' }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}
