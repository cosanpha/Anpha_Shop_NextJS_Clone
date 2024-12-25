import { generateSlug } from '@/utils'
import mongoose from 'mongoose'
const Schema = mongoose.Schema

const CategorySchema = new Schema(
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
    productQuantity: {
      type: Number,
      default: 0,
      min: 0,
    },
    color: {
      type: String,
      default: '#000',
    },
    logo: {
      type: String,
      default: '/category-icon.jpg',
    },
  },
  { timestamps: true }
)

// pre-save hook to generate slug from title
CategorySchema.pre('save', function (next) {
  if (this.isModified('title')) {
    this.slug = generateSlug(this.title)
  }
  next()
})

const CategoryModel = mongoose.models.category || mongoose.model('category', CategorySchema)
export default CategoryModel

export interface ICategory {
  _id: string
  title: string
  slug: string
  productQuantity: number
  color: string
  logo: string
  createdAt: string
  updatedAt: string
}
