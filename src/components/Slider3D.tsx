'use client'

import { carouselProductSamples } from '@/constansts/dataSamples'
import { memo, useEffect, useRef } from 'react'
import CarouselProduct from './item/CarouselItem'

interface Slide3DProps {
  products?: any[]
  className?: string
}

function Slide3D({ products = carouselProductSamples, className = '' }: Slide3DProps) {
  // states

  // refs
  const containerRef = useRef<HTMLDivElement>(null)

  // reset scroll position when reach the end
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleScroll = () => {
      if (container.scrollLeft + container.clientWidth >= container.scrollWidth) {
        container.scrollTo({ left: 0, behavior: 'instant' })
      }
    }

    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [products.length])

  return (
    <div
      className={`no-scrollbar flex h-full items-center overflow-x-scroll py-21 ${className}`}
      ref={containerRef}
    >
      {[...products, ...products].map((product, index) => {
        return (
          <CarouselProduct
            product={product}
            key={index}
          />
        )
      })}
    </div>
  )
}

export default memo(Slide3D)
