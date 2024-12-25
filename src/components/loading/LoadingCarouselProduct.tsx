import { memo } from 'react'

function LoadingCarouselProduct({ className = '' }: { className?: string }) {
  return (
    <div className={`aspect-video w-2/3 shrink-0 px-21/2 sm:w-1/3 lg:w-1/5 ${className}`}>
      <div className="loading h-full w-full rounded-small" />
    </div>
  )
}

export default memo(LoadingCarouselProduct)
