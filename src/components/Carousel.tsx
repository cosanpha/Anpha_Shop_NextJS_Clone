import { IProduct } from '@/models/ProductModel'
import { memo, useEffect, useRef, useState } from 'react'
import CarouselProduct from './item/CarouselItem'

interface CarouselProps {
  products: IProduct[]
  className?: string
}

function Carousel({ products, className = '' }: CarouselProps) {
  // states
  const [isHovered, setIsHovered] = useState<boolean>(false)

  // refs
  const containerRef = useRef<HTMLDivElement>(null)

  // MARK: Effects
  // auto scroll effect
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let animationId: number
    let lastTimestamp: number = 0
    const itemWidth = container.scrollWidth / products.length

    const scroll = (timestamp: number) => {
      if (!lastTimestamp) lastTimestamp = timestamp
      const deltaTime = timestamp - lastTimestamp
      lastTimestamp = timestamp

      const deltaScroll = (deltaTime / 1000) * itemWidth * 0.26

      const newPosition = container.scrollLeft + deltaScroll

      if (newPosition >= container.scrollWidth - container.clientWidth) {
        container.scrollTo({ left: 0, behavior: 'instant' })
      } else {
        container.scrollTo({ left: newPosition, behavior: 'instant' })
      }

      if (!isHovered) {
        animationId = requestAnimationFrame(scroll)
      }
    }

    // start scroll
    if (!isHovered) {
      animationId = requestAnimationFrame(scroll)
    }

    return () => cancelAnimationFrame(animationId)
  }, [products, isHovered])

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
  }, [])

  // MARK: Handlers
  const handleMouseEnter = () => {
    setIsHovered(true)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
  }

  return (
    <div
      className={`flex h-full items-center overflow-x-scroll ${className}`}
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {[...products, ...products].map((product, index) => (
        <CarouselProduct
          product={product}
          key={index}
        />
      ))}
    </div>
  )
}

export default memo(Carousel)
