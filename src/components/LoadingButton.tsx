import { memo } from 'react'
import { RiDonutChartFill } from 'react-icons/ri'

interface LoadingButtonProps {
  text: string
  isLoading: boolean
  onClick?: (e?: any) => void
  className?: string
}

function LoadingButton({ text, isLoading, onClick, className = '' }: LoadingButtonProps) {
  return (
    <button
      className={`${
        isLoading ? 'pointer-events-none flex justify-center bg-slate-200' : ''
      } ${className}`}
      disabled={isLoading}
      onClick={onClick}
    >
      {isLoading ? (
        <RiDonutChartFill
          size={24}
          className="animate-spin"
        />
      ) : (
        text
      )}
    </button>
  )
}

export default memo(LoadingButton)
