import { connectDatabase } from '@/config/database'
import UserModel from '@/models/UserModel'
import { JWT, getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'

// Models: User
import '@/models/UserModel'

// [PUT]: /user/update-profile
export async function PUT(req: NextRequest) {
  console.log('- Update Profile -')

  try {
    // connect to database
    await connectDatabase()

    // get user and update date to update profile
    const { firstname, lastname, birthday, job, address, phone } = await req.json()
    const token: JWT | null = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    const userId = token?._id

    // update user profile
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      {
        $set: {
          firstname,
          lastname,
          birthday: new Date(birthday),
          job,
          address,
          phone,
        },
      },
      { new: true }
    )

    // check if user exists
    if (!updatedUser) {
      return NextResponse.json({ message: 'Người dùng không tồn tại' }, { status: 404 })
    }

    // return response
    return NextResponse.json({ updatedUser, message: 'Cập nhật thông tin thành công' }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}
