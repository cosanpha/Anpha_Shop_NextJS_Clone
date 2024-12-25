'use client'

import { ICategory } from '@/models/CategoryModel'
import { IProduct } from '@/models/ProductModel'
import Image from 'next/image'
import Link from 'next/link'
import { memo, useCallback, useEffect, useRef, useState } from 'react'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import ProductCard from './ProductCard'

interface GroupProductsProps {
  category?: ICategory
  products: IProduct[]
  hideTop?: boolean
  className?: string
  bestSeller?: boolean
}

function GroupProducts({ category, products, hideTop, bestSeller, className = '' }: GroupProductsProps) {
  // states
  const [isExpaned, setIsExpaned] = useState<boolean>(false)
  const [isMedium, setIsMedium] = useState<boolean>(false)
  const [isDragging, setIsDragging] = useState<boolean>(false)

  // ref
  const slideTrackRef = useRef<HTMLDivElement>(null)

  // MARK: Handlers
  const handleDraging = useCallback(
    (e: React.MouseEvent) => {
      if (isDragging && !isExpaned && slideTrackRef.current) {
        slideTrackRef.current.scrollLeft -= e.movementX
      }
    },
    [isDragging, isExpaned]
  )

  // prev slide
  const prevSlide = useCallback(() => {
    if (slideTrackRef.current) {
      slideTrackRef.current.scrollTo({
        left: slideTrackRef.current.scrollLeft - slideTrackRef.current.children[0].clientWidth,
        behavior: 'smooth',
      })
    }
  }, [])

  // next slide
  const nextSlide = useCallback(() => {
    if (slideTrackRef.current) {
      slideTrackRef.current.scrollTo({
        left: slideTrackRef.current.scrollLeft + slideTrackRef.current.children[0].clientWidth,
        behavior: 'smooth',
      })
    }
  }, [])

  // expaned group
  useEffect(() => {
    const handleResize = () => {
      setIsMedium(window.innerWidth >= 768)
    }
    handleResize()

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <div
      className={`relative ${className}`}
      id={bestSeller ? 'best-seller' : category?.slug}
    >
      {/* MARK: Ears */}
      {!hideTop && (
        <div className={`flex ${!bestSeller ? 'justify-between' : 'justify-end'} px-6`}>
          {!bestSeller && (
            <div className="group flex items-center gap-2 rounded-t-xl border-b-2 bg-white px-3 py-2 opacity-90">
              <div className="aspect-square h-6 w-6 items-center">
                <Image
                  className="wiggle"
                  src={category?.logo || '/images/category-icon.jpg'}
                  width={32}
                  height={32}
                  alt={category?.title || 'icon'}
                />
              </div>
              <span className="font-semibold">{category?.title}</span>
            </div>
          )}
          <div className="flex items-center gap-2 rounded-t-xl border-b-2 bg-white px-3 py-2 opacity-90">
            {isMedium ? (
              <button
                className="text-sky-600"
                onClick={() => setIsExpaned(prev => !prev)}
              >
                {isExpaned ? 'Thu lại' : 'Tất cả'}
              </button>
            ) : (
              <Link
                href={bestSeller ? '/best-seller' : `/category/?ctg=${category?.slug}`}
                prefetch={false}
                className="trans-200 text-sky-600 underline hover:text-green-600"
              >
                Tất cả
              </Link>
            )}
          </div>
        </div>
      )}

      {/* MARK: Next - Previous */}
      {!isExpaned && (
        <>
          <button
            className="trans-200 group absolute -left-21 top-1/2 z-10 flex h-11 w-10 -translate-y-1/2 items-center justify-center rounded-l-small bg-white bg-opacity-80 shadow-md hover:bg-opacity-100"
            onClick={prevSlide}
          >
            <FaChevronLeft
              size={18}
              className="wiggle text-dark"
            />
          </button>
          <button
            className="trans-200 group absolute -right-21 top-1/2 z-10 flex h-11 w-10 -translate-y-1/2 items-center justify-center rounded-r-small bg-white bg-opacity-80 shadow-md hover:bg-opacity-100"
            onClick={nextSlide}
          >
            <FaChevronRight
              size={18}
              className="wiggle text-dark"
            />
          </button>
        </>
      )}

      {/* MARK: Slider */}
      <div className="flex min-h-[490px] flex-wrap rounded-medium bg-white bg-opacity-90 px-21/2 shadow-medium">
        <div
          className={`flex ${isExpaned ? 'flex-wrap gap-y-21' : ''} w-full overflow-x-auto py-21 ${
            !isDragging ? 'snap-x snap-mandatory' : ''
          }`}
          ref={slideTrackRef}
          onMouseDown={() => setIsDragging(true)}
          onMouseMove={handleDraging}
          onMouseUp={() => setIsDragging(false)}
        >
          {products.map((product, index) => {
            const color =
              index <= 2 ? (index <= 1 ? (index <= 0 ? '#f44336' : 'orange') : 'lightgreen') : '#0dcaf0'

            return (
              <div
                key={product._id}
                className={`relative w-full flex-shrink-0 px-21/2 sm:w-1/2 md:w-1/3 lg:w-1/4 ${
                  !isDragging ? 'snap-start' : ''
                }`}
              >
                {bestSeller && (
                  <div
                    className="absolute right-1 z-20 rotate-[10deg] font-[700]"
                    style={{
                      color,
                      fontSize:
                        index <= 2 ? (index <= 1 ? (index <= 0 ? '56px' : '48px') : '40px') : '32px',
                      top:
                        index <= 2 ? (index <= 1 ? (index <= 0 ? '-30px' : '-26px') : '-22px') : '-13px',
                    }}
                  >
                    #{index + 1}
                  </div>
                )}
                <ProductCard
                  product={product}
                  className=""
                />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default memo(GroupProducts)
