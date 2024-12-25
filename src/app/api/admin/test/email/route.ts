import { order, summary, updateInfoData } from '@/constansts/emailDataSamples'
import { searchParamsToObject } from '@/utils/handleQuery'
import {
  notifyAccountUpdated,
  notifyDeliveryOrder,
  notifyNewOrderToAdmin,
  notifyShortageAccount,
  sendResetPasswordEmail,
  sendVerifyEmail,
  summaryNotification,
} from '@/utils/sendMail'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// [GET]: /admin/test/email?type=...
export async function GET(req: NextRequest) {
  console.log(`- Test Email -`)

  // get query params
  const params: { [key: string]: string[] } = searchParamsToObject(req.nextUrl.searchParams)
  const type = params.type[0]

  const email = 'diwas118151@gmail.com'

  switch (type) {
    case 'order': {
      console.log('- Notify Delivery Order -')

      try {
        await notifyDeliveryOrder(email, order)
      } catch (err: any) {
        console.log(err)
      }

      break
    }

    case 'update-info': {
      console.log('- Notify Account Updated -')

      try {
        await notifyAccountUpdated(email, updateInfoData)
      } catch (err: any) {
        console.log(err)
      }

      break
    }

    case 'reset-password': {
      console.log('- Send Reset Password Email -')

      try {
        await sendResetPasswordEmail(email, 'Anpha', 'https://anpha.shop')
      } catch (err: any) {
        console.log(err)
      }

      break
    }

    case 'verify-email': {
      console.log('- Send Verify Email -')

      try {
        await sendVerifyEmail(email, 'Anpha', 'https://anpha.shop')
      } catch (err: any) {
        console.log(err)
      }

      break
    }

    case 'notify-order': {
      console.log('- Notify New Order To Admin -')

      try {
        await notifyNewOrderToAdmin(order)
      } catch (err: any) {
        console.log(err)
      }

      break
    }

    case 'summary': {
      console.log('- Summary Notification -')

      try {
        await summaryNotification(email, summary)
      } catch (err: any) {
        console.log(err)
      }

      break
    }

    case 'shortage-account': {
      console.log('- Notify Shortage Account -')

      try {
        await notifyShortageAccount('Thiếu sản phẩm netflix 100 năm')
      } catch (err: any) {
        console.log(err)
      }

      break
    }
  }

  return NextResponse.json({ message: 'Cron job executed successfully' })
}
