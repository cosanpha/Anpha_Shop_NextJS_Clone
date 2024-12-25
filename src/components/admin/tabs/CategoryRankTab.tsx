import { ICategory } from '@/models/CategoryModel'
import { IProduct } from '@/models/ProductModel'
import { getAllProductsApi } from '@/requests'
import Image from 'next/image'
import { memo, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { FaCircleNotch } from 'react-icons/fa'

interface CategoryRankTabProps {
  className?: string
}

function CategoryRankTab({ className = '' }: CategoryRankTabProps) {
  // states
  const [loading, setLoading] = useState<boolean>(false)
  const [categories, setCategories] = useState<any[]>([])

  useEffect(() => {
    const getProducts = async () => {
      // start loading
      setLoading(true)

      try {
        const query = '?limit=no-limit&sort=createdAt|-1'
        const { products } = await getAllProductsApi(query)

        // Category Sold Rank
        const categorySoldMap: { [key: string]: ICategory & { sold: number } } = {}
        products.forEach((product: IProduct) => {
          const category: ICategory = product.category as ICategory
          const sold = product.sold
          if (!categorySoldMap[category.slug]) {
            categorySoldMap[category.slug] = { ...category, sold: 0 }
          }
          categorySoldMap[category.slug].sold = (categorySoldMap[category.slug].sold || 0) + sold
        })
        const rankCategories = Object.entries(categorySoldMap)
          .map(([_, category]) => category)
          .sort((a, b) => b.sold - a.sold)

        setCategories(rankCategories)
      } catch (err: any) {
        console.log(err)
        toast.error(err.message)
      } finally {
        // stop loading
        setLoading(false)
      }
    }
    getProducts()
  }, [])

  return (
    <div className={`${className}`}>
      {!loading ? (
        categories.map((category, index) => (
          <div
            className={`no-scrollbar mb-4 flex items-center justify-between gap-2 overflow-x-auto rounded-xl px-3 py-1 shadow-md`}
            style={{
              width: `calc(100% - ${index * 6 < 40 ? index * 6 : 40}%)`,
              background: category.color,
            }}
            key={category._id}
          >
            <div className="flex flex-shrink-0 items-center gap-2">
              <div className="flex-shrink-0 rounded-md bg-white p-[2px]">
                <Image
                  src={category.logo}
                  width={20}
                  height={20}
                  alt="logo"
                />
              </div>
              <span className="rounded-full bg-dark-100 px-2 font-body text-sm font-semibold tracking-wider text-white">
                {category.title}
              </span>
            </div>
            <span className="flex h-5 items-center justify-center rounded-full bg-dark-100 px-2 text-xs font-semibold text-white">
              {category.sold}
            </span>
          </div>
        ))
      ) : (
        <div className="flex items-center justify-center">
          <FaCircleNotch
            size={18}
            className="animate-spin text-slate-400"
          />
        </div>
      )}
    </div>
  )
}

export default memo(CategoryRankTab)
