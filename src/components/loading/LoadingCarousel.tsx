import { memo } from 'react'
import LoadingCarouselProduct from './LoadingCarouselProduct'

function LoadingCarousel({ className = '' }: { className?: string }) {
  return (
    <div className={`flex h-full items-center overflow-x-hidden pb-4 ${className}`}>
      {Array.from({ length: 14 }).map((_, index) => (
        <LoadingCarouselProduct key={index} />
      ))}
    </div>
  )
}

export default memo(LoadingCarousel)
