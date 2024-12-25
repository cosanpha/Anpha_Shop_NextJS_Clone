import { memo } from 'react'
import LoadingCommentItem from './LoadingCommentItem'

function Comment({ className = '' }: { className?: string }) {
  return (
    <div>
      {/* MARK: Input */}
      <div className={`flex items-center justify-between gap-3 ${className}`}>
        <div className="loading h-[40px] w-[40px] flex-shrink-0 rounded-full" />
        <div className="w-full rounded-lg">
          <div className="loading h-[40px] w-full rounded-lg" />
        </div>

        <div className="loading h-[40px] w-[78px] rounded-lg" />
      </div>

      {/* MARK: Comment List */}
      <div className="mt-5 flex max-h-[500px] flex-col gap-4 overflow-y-scroll">
        {Array.from({ length: 5 }).map((_, index) => (
          <LoadingCommentItem key={index} />
        ))}
      </div>
    </div>
  )
}

export default memo(Comment)
