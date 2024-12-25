import { connectDatabase } from '@/config/database'
import AccountModel, { IAccount } from '@/models/AccountModel'
import OrderModel, { IOrder } from '@/models/OrderModel'
import { notifyAccountUpdated } from '@/utils/sendMail'
import { getTimes } from '@/utils/time'
import mongoose from 'mongoose'
import { NextRequest, NextResponse } from 'next/server'
import momentTZ from 'moment-timezone'

// Models: Account, Order
import '@/models/AccountModel'
import '@/models/OrderModel'

// [PUT]: /account/:id/edit
export async function PUT(req: NextRequest, { params: { id } }: { params: { id: string } }) {
  console.log('- Edit Account -')

  try {
    // connect to database
    await connectDatabase()

    // get data to edit account
    const {
      usingUser,
      type,
      info,
      renew,
      expire,
      active,
      days,
      hours,
      minutes,
      seconds,
      notify,
      message,
    } = await req.json()
    const times = getTimes(+days, +hours, +minutes, +seconds)

    const set: any = {
      type,
      info,
      renew,
      times,
      active,
    }

    if (expire) {
      set.expire = momentTZ.tz(expire, 'Asia/Ho_Chi_Minh').toDate()
    }

    // update account
    const updatedAccount: IAccount | null = await AccountModel.findByIdAndUpdate(
      id,
      { $set: set },
      { new: true }
    )

    const isChangedUsingUser = updatedAccount?.usingUser !== usingUser

    let order: IOrder | null = null

    if (isChangedUsingUser) {
      // get order from database to update account
      order = await OrderModel.findOne({
        'items.accounts._id': new mongoose.Types.ObjectId(id),
      }).lean()

      // check if order exists
      if (order) {
        // get related account from order
        const accounts: string[] = order?.items
          .reduce((acc, item) => [...acc, ...item.accounts], [])
          .map((acc: IAccount) => acc._id)

        // update related account's usingUser
        await AccountModel.updateMany({ _id: { $in: accounts } }, { $set: { usingUser } })

        // update order email
        order = await OrderModel.findByIdAndUpdate(
          { _id: order._id },
          { $set: { email: usingUser } },
          { new: true }
        )
      }
    }

    // notify to user about the change of account infomation
    if (notify && updatedAccount && new Date(updatedAccount.expire || '') > new Date()) {
      // get order from database to update account
      if (!order) {
        order = await OrderModel.findOne({
          'items.accounts._id': new mongoose.Types.ObjectId(id),
        }).lean()
      }

      // check if order exists
      if (order) {
        // get account infomation
        let accountInfo: any = null
        let itemIndex: any = undefined
        let accountIndex: any = undefined

        // use for loop to allow breaking when account is found
        for (let i = 0; i < order.items.length; i++) {
          const item = order.items[i]
          for (let accIdx = 0; accIdx < item.accounts.length; accIdx++) {
            const acc = item.accounts[accIdx]
            if (acc._id.toString() === id) {
              accountInfo = acc
              itemIndex = i
              accountIndex = accIdx
              break
            }
          }

          // if account info is found, break the outer loop as well
          if (accountInfo) {
            break
          }
        }

        // get product
        let product = order.items.find(
          item => item.product._id.toString() === accountInfo.type.toString()
        ).product

        // update order
        await OrderModel.findByIdAndUpdate(
          order._id,
          {
            $set: {
              [`items.${itemIndex}.accounts.${accountIndex}`]: {
                ...accountInfo,
                type,
                info,
                renew,
                times,
                active,
              },
            },
          },
          { new: true }
        )

        // create data to notify by email
        const data = {
          ...order,
          product,
          oldInfo: accountInfo,
          newInfo: { info },
          message,
        }

        await notifyAccountUpdated(order.email, data)
      }
    }

    // return updated account
    return NextResponse.json(
      {
        updatedAccount,
        message: 'Account has been updated',
      },
      { status: 200 }
    )
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}
