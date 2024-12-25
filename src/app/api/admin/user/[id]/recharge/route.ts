import { connectDatabase } from '@/config/database'
import UserModel, { IUser } from '@/models/UserModel'
import { formatPrice } from '@/utils/number'
import { NextRequest, NextResponse } from 'next/server'

// Models: User
import '@/models/UserModel'

// [PATCH]: /admin/user/:id/recharge
export async function PATCH(req: NextRequest, { params: { id } }: { params: { id: string } }) {
  console.log('- Recharge - ')

  try {
    // connect to database
    await connectDatabase()

    // get value to recharge user
    const { amount } = await req.json()

    // find user by id
    const user: IUser | null = await UserModel.findByIdAndUpdate(
      id,
      { $inc: { balance: amount, accumulated: amount } },
      { new: true }
    )

    // check user
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    // return response
    return NextResponse.json(
      {
        user,
        message: `User ${user.username || user.email} has been added ${formatPrice(amount)} to balance`,
      },
      { status: 200 }
    )
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}
