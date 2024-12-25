import { memo } from 'react'

function LoadingHeading({ size = 350, className = '' }: { size?: number; className?: string }) {
  return (
    <h2
      className={`mx-auto my-11 flex w-full max-w-1200 items-center justify-between gap-4 before:h-[1.5px] before:w-full before:bg-white after:h-[1.5px] after:w-full after:bg-white${className}`}
    >
      <span
        className="loading h-2.5 max-w-[90%] flex-shrink-0 rounded border-2"
        style={{ width: size }}
      />
    </h2>
  )
}

export default memo(LoadingHeading)
