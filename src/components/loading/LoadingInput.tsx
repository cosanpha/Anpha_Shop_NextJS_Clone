import React, { memo } from 'react'

interface LoadingInputProps {
  icon?: React.ElementType
  className?: string

  type?: string
  rows?: number
}

function LoadingInput({ type = 'text', icon: Icon, rows, className = '' }: LoadingInputProps) {
  return (
    <div className={`${className}`}>
      <div className={`flex`}>
        {/* MARK: Icon */}
        {Icon && (
          <span className={`loading mr-px inline-flex items-center rounded-bl-lg rounded-tl-lg px-3`}>
            <Icon
              size={19}
              className="text-white"
            />
          </span>
        )}

        {/* MARK: Text Field */}
        <div
          className={`loading relative w-full ${Icon ? 'rounded-br-lg rounded-tr-lg' : 'rounded-lg'}`}
        >
          {type === 'textarea' ? (
            <textarea
              className="peer block w-full bg-transparent px-2.5 pb-2.5 pt-4 text-sm text-dark focus:outline-none focus:ring-0"
              placeholder=" "
              rows={rows || 4}
            />
          ) : type === 'select' ? (
            <div className="min-h-[46px] w-[152px]" />
          ) : (
            <div className="min-h-[46px] w-full" />
          )}
        </div>
      </div>
    </div>
  )
}

export default memo(LoadingInput)
