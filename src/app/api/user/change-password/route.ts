import { connectDatabase } from '@/config/database'
import UserModel from '@/models/UserModel'
import bcrypt from 'bcrypt'
import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'

// Models: User
import '@/models/UserModel'

// [PATCH]: /user/change-password
export async function PATCH(req: NextRequest) {
  console.log('- Change Password -')

  try {
    // connect to database
    await connectDatabase()

    // get data to change password
    const { oldPassword, newPassword } = await req.json()
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    const userId = token?._id

    // get user to change password
    const user = await UserModel.findById(userId)

    // check authType to decide whether to change the pasword
    if (user.authType !== 'local') {
      return NextResponse.json(
        { message: 'Tài khoản của bạn không thể thay đổi mật khẩu' },
        { status: 400 }
      )
    }

    const isValidPassword = await bcrypt.compare(oldPassword, user.password)

    if (!isValidPassword) {
      return NextResponse.json({ message: 'Mật khẩu không đúng' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(newPassword, +process.env.BCRYPT_SALT_ROUND!)
    await UserModel.findByIdAndUpdate(
      userId,
      {
        $set: { password: hashedPassword },
      },
      { new: true }
    )

    // return response
    return NextResponse.json({ message: 'Thay đổi mật khẩu thành công' }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}
