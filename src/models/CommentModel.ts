import mongoose from 'mongoose'
import { IProduct } from './ProductModel'
import { IUser } from './UserModel'
const Schema = mongoose.Schema

const CommentSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'product',
    },
    content: {
      type: String,
      required: true,
    },
    replied: [
      {
        type: Schema.Types.ObjectId,
        ref: 'comment',
      },
    ],
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: 'user',
      },
    ],
    hide: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
)

const CommentModel = mongoose.models.comment || mongoose.model('comment', CommentSchema)
export default CommentModel

export interface IComment {
  _id: string
  userId: string | IUser
  productId: string | IProduct
  content: string
  replied: string[] | IComment[]
  likes: string[] | IUser[]
  hide: boolean
  createdAt: string
  updatedAt: string

  // subs
  user?: IUser
}
