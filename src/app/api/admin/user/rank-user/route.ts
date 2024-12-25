import { connectDatabase } from '@/config/database'
import UserModel, { IUser } from '@/models/UserModel'
import { NextRequest, NextResponse } from 'next/server'

// models: User, Order
import '@/models/UserModel'
import '@/models/OrderModel'
import OrderModel from '@/models/OrderModel'

// [GET]: /admin/user/rank-user
export async function GET(req: NextRequest) {
  console.log('- Rank User -')

  try {
    // connect to database
    await connectDatabase()

    // get all done orders
    const orders = await OrderModel.find({ status: 'done' }).lean()

    // // Tính xếp hạng thứ tự những người mua nhiều tiền nhất
    const customerTotalSpentMap: { [key: string]: any[] } = {}

    // Tính tổng số tiền mỗi người đã mua
    orders.forEach(order => {
      const email = order.email
      const total = order.total
      if (!customerTotalSpentMap[email]) {
        customerTotalSpentMap[email] = total
      } else {
        customerTotalSpentMap[email] += total
      }
    })

    // Chuyển customerTotalSpentMap thành mảng để có thể sắp xếp
    const customerTotalSpentArray: any[] = Object.entries(customerTotalSpentMap)

    // Sắp xếp mảng theo tổng số tiền giảm dần
    customerTotalSpentArray.sort((a, b) => b[1] - a[1])

    // Tạo danh sách kết quả
    const spentUser = await Promise.all(
      customerTotalSpentArray.map(async ([email, spent]) => {
        // Lấy thông tin người dùng từ cơ sở dữ liệu
        const user: IUser | null = await UserModel.findOne({ email }).lean()

        // Kiểm tra xem người dùng có tồn tại không
        if (user) {
          return {
            ...user, // Thêm thông tin về người dùng
            spent, // Thêm thông tin về tổng số tiền đã chi tiêu
          }
        } else {
          // Nếu không tìm thấy người dùng, trả về một đối tượng chỉ chứa email và tổng số tiền
          return {
            email,
            spent,
          }
        }
      })
    )

    return NextResponse.json({ spentUser }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}
