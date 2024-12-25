import mongoose from 'mongoose'
import { IProduct } from './ProductModel'
const Schema = mongoose.Schema

const AccountSchema = new Schema(
  {
    type: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'product',
      required: true,
    },
    info: {
      type: String,
      required: true,
    },
    usingUser: {
      type: String, // email
    },
    active: {
      type: Boolean,
      default: true,
      // automatically deactivates if expire time and renewal time are exceeded
    },
    begin: {
      type: Date,
    },
    expire: {
      type: Date,
    },
    renew: {
      type: Date,
      required: true,
    },
    notifiedExpire: {
      type: Boolean,
      default: false,
    },
    times: {
      type: {
        days: {
          type: Number,
          default: 0,
          min: 0,
        },
        hours: {
          type: Number,
          default: 0,
          min: 0,
        },
        minutes: {
          type: Number,
          default: 0,
          min: 0,
        },
        seconds: {
          type: Number,
          default: 0,
          min: 0,
        },
      },
      default: {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
      },
    },
  },
  { timestamps: true }
)

const AccountModel = mongoose.models.account || mongoose.model('account', AccountSchema)
export default AccountModel

export interface IAccount {
  _id: string
  type: string | IProduct
  info: string
  usingUser?: string
  active: boolean
  begin?: string
  expire?: string
  renew: string
  times: {
    days: number
    hours: number
    minutes: number
    seconds: number
  }
  notifiedExpire: boolean
  createdAt: string
  updatedAt: string
}
