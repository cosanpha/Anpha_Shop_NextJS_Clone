import { connectDatabase } from '@/config/database'
import AccountModel from '@/models/AccountModel'
import { notifyExpiredAccount } from '@/utils/sendMail'
import jwt, { JwtPayload } from 'jsonwebtoken'
import momentTZ from 'moment-timezone'
import { NextRequest, NextResponse } from 'next/server'

// Models: Account, Product
import '@/models/AccountModel'
import '@/models/ProductModel'

export const dynamic = 'force-dynamic'

// [GET]: /cron/notify-expire
export async function GET(req: NextRequest) {
  console.log('- Check Expired -')

  try {
    // connect to database
    await connectDatabase()

    // rules: notify when remaning time is <= 2h (1 day, 1 week, 1 month, ... accounts)

    // steps:
    // 1. get all accounts by userUsing: yes, begin: < now, expire: > now
    // 2. filter accounts by rules to notify
    // 3. send notify to user

    // get token from query
    const searchParams = req.nextUrl.searchParams
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    // Verify the token
    const decode = jwt.verify(token + '', process.env.NEXTAUTH_SECRET!) as JwtPayload

    if (!decode || decode.key !== process.env.NEXTAUTH_SECRET) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    // get all accounts
    const now = momentTZ.tz(new Date(), 'Asia/Ho_Chi_Minh').toDate()
    let accounts = await AccountModel.find({
      usingUser: { $exists: true },
      active: true,
      begin: { $lt: now },
      expire: { $gt: now },
      $or: [{ notifiedExpire: { $exists: false } }, { notifiedExpire: false }],
    })
      .populate({
        path: 'type',
        select: 'title slug',
      })
      .sort({ begin: 1 })
      .lean()

    // filter accounts by rules to notify
    accounts = accounts.filter((account: any) => {
      const diff = momentTZ(account.expire).diff(now, 'seconds')
      const { days, hours, minutes, seconds } = account.times
      const duration = momentTZ.duration({ days, hours, minutes, seconds }).asSeconds()

      // remaining time < 2h
      if (diff <= 2 * 3600) {
        return true
      }

      // // remaining time < 1d
      // if (diff <= 24 * 2400 && duration > 24 * 3600) {
      //   return true
      // }

      return false
    })

    // to vietnamese time
    const toVNTime = (date: string) => {
      return date
        .replace('in ', '')
        .replace('a few seconds', '1 giây')
        .replace('a minute', '1 phút')
        .replace('an hour', '1 giờ')
        .replace('a day', '1 ngày')
        .replace('a month', '1 tháng')
        .replace('a year', '1 năm')
        .replace('years', 'năm')
        .replace('months', 'tháng')
        .replace('days', 'ngày')
        .replace('hours', 'giờ')
        .replace('minutes', 'phút')
        .replace('seconds', 'giây')
    }

    // send notify to users
    await Promise.all(
      accounts.map(async account => {
        const duration = momentTZ.duration(momentTZ(account.expire).diff(now))

        let remainingTime = ''
        if (duration.asSeconds() < 3600) {
          remainingTime = toVNTime(`${duration.minutes()} minutes`)
        } else {
          remainingTime = toVNTime(`${duration.hours()} hours`)
        }

        const data = {
          ...account,
          remainingTime,
        }

        // update notifiedExpire
        await notifyExpiredAccount(account.usingUser, data)
      })
    )

    // update notifiedExpire
    await AccountModel.updateMany(
      { _id: { $in: accounts.map((account: any) => account._id) } },
      { $set: { notifiedExpire: true } }
    )

    return NextResponse.json({ accounts, message: 'Check Expired' }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}
