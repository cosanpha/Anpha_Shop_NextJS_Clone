import mongoose from 'mongoose'
const Schema = mongoose.Schema

const ReviewSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'user',
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'product',
      required: true,
    },
    rating: {
      type: Number,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['show', 'hide', 'pinned'],
      default: 'show',
    },
    image: {
      type: String,
    },
    reviewDate: {
      type: Date,
      default: Date.now,
    },
    displayName: {
      type: String,
    },
  },
  { timestamps: true }
)

const ReviewModel = mongoose.models.review || mongoose.model('review', ReviewSchema)
export default ReviewModel

export interface IReview {
  _id: string
  userId: string
  productId: string
  rating: number
  content: string
  status: 'show' | 'hide' | 'pinned'
  image: string
  reviewDate: string
  displayName: string
  createdAt: string
  updatedAt: string
}
