import { generateSlug } from '@/utils'
import mongoose from 'mongoose'
import { IFlashSale } from './FlashSaleModel'
import { ITag } from './TagModel'
import { ICategory } from './CategoryModel'
const Schema = mongoose.Schema

const ProductSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    oldPrice: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: true,
      validate: {
        validator: function (value: number) {
          return value >= 0
        },
        message: 'Invalid price',
      },
      min: 0,
    },
    description: {
      type: String,
    },
    flashSale: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'flashSale',
    },
    tags: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'tag',
          minlength: 1,
        },
      ],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'category',
      required: true,
    },
    images: {
      type: [
        {
          type: String,
        },
      ],
      minlength: 1,
    },
    sold: {
      type: Number,
      default: 0,
      min: 0,
    },
    stock: {
      type: Number,
      default: 0,
      min: 0,
    },
    slug: {
      type: String,
      unique: true,
      index: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
    booted: {
      type: Boolean,
      default: false,
    },
    rating: {
      type: Number,
      default: 5,
      min: 1,
      max: 5,
    },
    reviewAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
)

// pre-save hook to generate slug from title
ProductSchema.pre('save', function (next) {
  if (this.isModified('title')) {
    this.slug = generateSlug(this.title)
  }

  next()
})

// create model from schema
const ProductModel = mongoose.models.product || mongoose.model('product', ProductSchema)
export default ProductModel

export interface IProduct {
  _id: string
  title: string
  oldPrice?: number
  price: number
  description: string
  flashSale?: string | IFlashSale
  tags: string[] | ITag[]
  category: string | ICategory
  images: string[]
  sold: number
  stock: number
  slug: string
  active: boolean
  booted: boolean
  rating: number
  reviewAmount: number
  createdAt: string
  updatedAt: string
}
