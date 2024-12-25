import { connectDatabase } from '@/config/database'
import UserModel from '@/models/UserModel'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  console.log('- Verify Phone - ')

  try {
    // connect to database
    await connectDatabase()

    // get phone number
    const { phone } = await req.json()

    // check phone number
    const user = await UserModel.findOne({ phone }).lean()
    if (!user) {
      return NextResponse.json({ message: 'Số điện thoại không tồn tại' }, { status: 404 })
    }

    return NextResponse.json(
      { message: `Mã xác minh đã được gửi tới số điện thoại ${phone}` },
      { status: 200 }
    )
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}
