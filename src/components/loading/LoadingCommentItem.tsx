import { memo } from 'react'
import { FaHeart, FaSortDown } from 'react-icons/fa'

function CommentItem({ className = '' }: { className?: string }) {
  return (
    <div className={`flex w-full items-start gap-3 ${className}`}>
      <div className="loading h-[40px] w-[40px] flex-shrink-0 rounded-full" />

      <div className="flex w-full flex-col gap-2 pt-1">
        {/* MARK: Headline */}
        <div className="flex items-center gap-3">
          <span className="loading h-2 w-[100px] rounded" />
          <span className="loading h-2 w-[100px] rounded" />
        </div>

        {/* MARK: Content */}
        <p className="loading h-2 w-full max-w-[400px] rounded" />

        {/* MARK: Actions */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <FaHeart
              size={14}
              className="animate-pulse text-loading"
            />
            <span className="loading h-2 w-[25px] rounded" />
          </div>

          <div className="flex items-center gap-2">
            <span className="loading h-2 w-[25px] rounded" />
            <span className="loading h-2 w-[75px] rounded" />
            <FaSortDown
              size={16}
              className="mt-[-7px] animate-pulse text-loading"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default memo(CommentItem)
