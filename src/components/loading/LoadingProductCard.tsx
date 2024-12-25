import { memo } from 'react'
import LoadingPrice from './LoadingPrice'

function LoadingProductCard({ className = '' }: { className?: string }) {
  return (
    <div
      className={`relative h-full min-h-[430px] w-full rounded-xl bg-white p-4 shadow-lg ${className}`}
    >
      {/* MARK: Thumbnails */}
      <div className="loading aspect-video rounded-lg shadow-lg" />

      {/* Title */}
      <div className="loading my-4 h-2 rounded" />

      {/* Price */}
      <LoadingPrice />

      {/* Basic Information */}
      <div className="flex items-center font-body tracking-wide">
        <div className="loading h-4 w-4 rounded-full" />
        <div className="loading ml-1 h-2 w-[56px] rounded" />
        <span className="loading ml-1 h-4 w-5 rounded" />
      </div>

      {/* MARK: Action Buttons */}
      <div className="mt-2 flex items-center justify-end gap-2 md:justify-start">
        <div className="loading h-[32px] w-[94px] rounded-md text-white" />
        <div className="loading h-[32px] w-[42px] rounded-md text-white" />
      </div>
    </div>
  )
}

export default memo(LoadingProductCard)
