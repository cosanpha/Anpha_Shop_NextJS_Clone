import mongoose from 'mongoose'
import { IProduct } from './ProductModel'
import { IUser } from './UserModel'
const Schema = mongoose.Schema

const CartItemSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'product',
      required: true,
    },
    quantity: {
      type: Number,
      default: 1,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
)

const CartItemModel = mongoose.models.cartItem || mongoose.model('cartItem', CartItemSchema)
export default CartItemModel

export interface ICartItem {
  _id: string
  userId: string | IUser
  productId: string | IProduct
  quantity: number
  createdAt: string
  updatedAt: string

  // subs
  product?: IProduct
}
