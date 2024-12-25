import { connectDatabase } from '@/config/database'
import { ICategory } from '@/models/CategoryModel'
import ProductModel, { IProduct } from '@/models/ProductModel'
import { ITag } from '@/models/TagModel'
import { shuffleArray } from '@/utils'
import { NextResponse } from 'next/server'

// Models: Product, Tag, Category, Flash Sale
import '@/models/CategoryModel'
import '@/models/FlashSaleModel'
import '@/models/ProductModel'
import '@/models/TagModel'

export const dynamic = 'force-dynamic'

// [GET]: /
export async function GET() {
  console.log('- Get Home Page -')

  try {
    // connect to database
    await connectDatabase()

    // get all products to show in home page
    const products: IProduct[] = await ProductModel.find({ active: true })
      .populate('tags')
      .populate('category')
      .populate('flashSale')
      .lean()

    // get all categories from products to make sure that no category with empty products
    let categories: ICategory[] = Array.from(
      new Set(
        products.reduce((categories: ICategory[], product: IProduct) => {
          const category: ICategory = product.category as ICategory

          if (category && category._id) {
            categories.push(category)
          }
          return categories
        }, [])
      )
    )

    // sort category by sequence
    const sequenceCategory = process.env.SEQUENCE_CATEGORIES!.split(' ')
    categories = categories.sort((a, b) => {
      const indexA = sequenceCategory.indexOf(a.title.toLowerCase())
      const indexB = sequenceCategory.indexOf(b.title.toLowerCase())

      return (indexA === -1 ? Infinity : indexA) - (indexB === -1 ? Infinity : indexB)
    })

    // get all tags from products to make sure that no tag with empty products
    const tags: ITag[] = Array.from(
      new Set(
        products.reduce((tags: ITag[], product: IProduct) => {
          const tgs: ITag[] = product.tags as ITag[]
          if (tgs && tgs.length > 0) {
            tags.push(...tgs)
          }
          return tags
        }, [])
      )
    )

    // create category list with corresponding products
    const productsByCategoryGroups = categories
      .map(category => {
        const productsByCtg = products
          .filter(product => (product.category as ICategory)._id.toString() === category._id.toString())
          .sort((a, b) => {
            if (a.booted && !b.booted) {
              return -1
            }
            if (!a.booted && b.booted) {
              return 1
            }

            return b.sold - a.sold
          })

        return {
          category,
          products: productsByCtg,
        }
      })
      .filter(category => category.products.length) // remove category with empty product
      .sort(
        (a, b) =>
          b.products.reduce((total, product) => total + product.sold, 0) -
          a.products.reduce((total, product) => total + product.sold, 0)
      )

    // shuffle products to get random
    const shuffledProducts = shuffleArray([...products.filter(product => product.stock > 0)])
    const carouselProducts = shuffledProducts.slice(0, 7)

    // get best seller
    const bestSellerProducts = products.sort((a, b) => b.sold - a.sold).slice(0, 10)

    return NextResponse.json(
      {
        productsByCategoryGroups,
        bestSellerProducts,
        categories: categories,
        tags,
        carouselProducts,
      },
      { status: 200 }
    )
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}
