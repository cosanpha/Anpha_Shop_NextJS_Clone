import { connectDatabase } from '@/config/database'
import UserModel from '@/models/UserModel'
import { uploadFile } from '@/utils/uploadFile'
import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'

// Models: User
import '@/models/UserModel'

// [PUT]: /user/change-avatar
export async function PUT(req: NextRequest) {
  console.log('- Change Avatar -')

  try {
    // connect to database
    await connectDatabase()

    // get userId to update user
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    const userId = token?._id

    // get data to create product
    const formData = await req.formData()
    let avatar = formData.get('avatar')

    // check userId
    if (!userId) {
      return NextResponse.json({ message: 'Người dùng không tồn tại' }, { status: 401 })
    }

    // check avatar
    if (!avatar) {
      return NextResponse.json({ message: 'Không có ảnh đại diện nào' }, { status: 400 })
    }

    // upload avatar and get imageUrl from AWS S3 Bucket
    const imageUrl = await uploadFile(avatar, '1:1')

    // update user
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { $set: { avatar: imageUrl } },
      { new: true }
    )

    // return reponse
    return NextResponse.json(
      {
        updatedUser,
        message: 'Đổi ảnh đại diện thành công, vui lòng chờ ít phút để thay đổi được cập nhật',
      },
      { status: 200 }
    )
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}
