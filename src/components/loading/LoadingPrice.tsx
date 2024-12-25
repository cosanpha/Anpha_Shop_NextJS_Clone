import { memo } from 'react'

interface LoadingPriceProps {
  big?: boolean
  className?: string
}

function LoadingPrice({ big, className = '' }: LoadingPriceProps) {
  return (
    <div className={`mb-2 overflow-hidden rounded-md ${className}`}>
      <div
        className={`flex items-center justify-evenly gap-2 px-1.5 py-2 ${
          big ? 'sm:justify-start sm:gap-4 sm:px-21 sm:py-4' : ''
        } flex-wrap bg-slate-100 font-body`}
      >
        <div className="loading my-4 h-2 w-24 rounded" />
        <div className="loading my-4 h-2 w-14 rounded" />
        <div
          className={`loading ${
            big ? 'h-7 w-12' : 'h-6 w-10'
          } rounded-md px-1 py-[2px] font-sans text-white`}
        />
      </div>
    </div>
  )
}

export default memo(LoadingPrice)
