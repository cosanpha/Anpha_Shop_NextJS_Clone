import { chooseMeList } from '@/constansts'
import { memo } from 'react'

function LoadingChooseMe({ className = '' }: { className?: string }) {
  return (
    <div className={`mx-auto max-w-1200 ${className}`}>
      <div className="-mx-21 grid grid-cols-1 justify-between px-21/2 sm:grid-cols-2 sm:px-0 md:grid-cols-4">
        {chooseMeList.map(item => (
          <div
            className="p-21/2 transition-all duration-300 hover:-translate-y-2 sm:p-21"
            key={item.image}
          >
            <div className="flex flex-col items-center overflow-hidden rounded-small bg-white p-21 shadow-medium">
              <div className="loading mb-2 aspect-square w-full rounded-lg" />

              <h3 className="loading my-3 h-2 w-[90%] rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default memo(LoadingChooseMe)
