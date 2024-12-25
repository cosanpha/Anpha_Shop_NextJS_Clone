import { generateSlug } from '@/utils'
import mongoose from 'mongoose'
const Schema = mongoose.Schema

const TagSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      unique: true,
      index: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    productQuantity: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
)

// pre-save hook to generate slug from title
TagSchema.pre('save', function (next) {
  if (this.isModified('title')) {
    this.slug = generateSlug(this.title)
  }
  next()
})

const TagModel = mongoose.models.tag || mongoose.model('tag', TagSchema)
export default TagModel

export interface ITag {
  _id: string
  title: string
  slug: string
  isFeatured: boolean
  productQuantity: number
  createdAt: string
  updatedAt: string
}
