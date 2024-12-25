import { connectDatabase } from '@/config/database'
import CommentModel from '@/models/CommentModel'
import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'

// Models: Comment
import '@/models/CommentModel'

// [POST]: /comment/add
export async function POST(req: NextRequest) {
  console.log('- Add Comment - ')

  try {
    // connect to database
    await connectDatabase()

    // get user id to add comment
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    const userId = token?._id

    // get product id and content to add comment
    const { productId, content } = await req.json()

    // user does not exist
    if (!userId) {
      return NextResponse.json({ message: 'Người dùng không tồn tại' }, { status: 401 })
    }

    // check if productId or content is empty
    if (!productId || !content) {
      // return error
      return NextResponse.json({ message: 'Dữ liệu không hợp lệ' }, { status: 400 })
    }

    // create new comment
    const comment = new CommentModel({
      userId,
      productId,
      content: content.trim(),
    })

    // save new comment to database
    await comment.save()

    // return new comment
    return NextResponse.json(
      { newComment: comment, message: 'Thêm bình luận thành công' },
      { status: 201 }
    )
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}
