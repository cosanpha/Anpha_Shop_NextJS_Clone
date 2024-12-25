import bcrypt from 'bcrypt'
import mongoose from 'mongoose'
import { IVoucher } from './VoucherModel'
import { ICartItem } from './CartItemModel'
const Schema = mongoose.Schema

const UserSchema = new Schema(
  {
    // Authentication
    username: {
      type: String,
      required: function (this: { authType: string }) {
        return this.authType === 'local'
      },
      unique: function (this: { authType: string }) {
        return this.authType === 'local'
      },
    },
    email: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: function (value: string) {
          return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value)
        },
        message: 'Email không hợp lệ',
      },
    },
    phone: {
      type: String,
      unique: true,
      sparse: true,
      validate: {
        validator: function (value: string) {
          return /^0\d{9,10}$/.test(value)
        },
        message: 'Số điện thoại không hợp lệ',
      },
    },
    verifiedEmail: {
      type: Boolean,
      default: false,
    },
    verifiedPhone: {
      type: Boolean,
      default: false,
    },
    password: {
      type: String,
      required: function (this: { authType: string }) {
        return this.authType === 'local'
      },
      validate: {
        validator: function (value: string) {
          return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/.test(value)
        },
        message: 'Mật khẩu không hợp lệ',
      },
    },
    authType: {
      type: String,
      enum: ['local', 'google', 'facebook', 'github'],
      default: 'local',
    },
    role: {
      type: String,
      enum: ['admin', 'user', 'editor', 'collaborator'],
      default: 'user',
    },

    // Infomation
    avatar: {
      type: String,
      default: process.env.NEXT_PUBLIC_DEFAULT_AVATAR,
    },
    firstname: {
      type: String,
      default: '',
    },
    lastname: {
      type: String,
      default: '',
    },
    birthday: Date,
    address: String,
    job: String,

    // Others
    balance: {
      type: Number,
      default: 0,
      min: 0,
    },
    accumulated: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalIncome: {
      type: Number,
      default: 0,
    },
    commission: {
      type: {
        type: String,
        enum: ['percentage', 'fixed'],
        default: 'fixed',
      },
      value: {
        type: String,
        default: '0',
      },
    },
  },
  {
    timestamps: true,
  }
)

UserSchema.pre('save', async function (next) {
  console.log('- Pre Save User -')
  // check authType & username before saving
  if (this.authType !== 'local' || !this.isModified('password')) {
    return next()
  }

  // hash password before saving
  try {
    const hashedPassword = await bcrypt.hash(this.password || '', +process.env.BCRYPT_SALT_ROUND! || 10)
    this.password = hashedPassword

    next()
  } catch (err: any) {
    return next(err)
  }
})

const UserModel = mongoose.models.user || mongoose.model('user', UserSchema)
export default UserModel

export interface IUser {
  _id: string
  username?: string
  email: string
  password?: string
  balance: number
  accumulated: number
  role: 'admin' | 'user' | 'editor' | 'collaborator'
  avatar: string
  firstname?: string
  lastname?: string
  birthday?: string
  phone?: string
  address?: string
  job?: string
  authType: 'local' | 'google' | 'facebook'
  commission?: {
    type: 'percentage' | 'fixed'
    value: string
  }
  totalIncome?: number
  verifiedEmail: boolean
  verifiedPhone: boolean
  createdAt: string
  updatedAt: string

  // subs
  vouchers?: IVoucher[]
  cart?: ICartItem[]
  cartLength?: number
}
