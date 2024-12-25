import { memo } from 'react'

function LoadingPagination({ className = '' }: { className?: string }) {
  return (
    <div className={`flex justify-center gap-2 font-semibold ${className}`}>
      {/* MARK: Prev */}
      <div className="loading h-[40px] w-[50px] rounded-lg border-2 border-white" />

      {/* MARK: 1 ... n */}
      <div className="no-scrollbar flex gap-2 overflow-x-scroll">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            className="loading h-[40px] w-[40px] rounded-lg border-2 border-white"
            key={index}
          />
        ))}
      </div>

      {/* MARK: Next */}
      <div className="loading h-[40px] w-[50px] rounded-lg border-2 border-white" />
    </div>
  )
}

export default memo(LoadingPagination)
