import { memo } from 'react'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import LoadingProductCard from './LoadingProductCard'

interface GroupProductsProps {
  hideTop?: boolean
  bestSeller?: boolean
  className?: string
}

function LoadingGroupProducts({ hideTop, bestSeller, className = '' }: GroupProductsProps) {
  return (
    <div className={`relative ${className}`}>
      {/* MARK: Ears */}
      {!hideTop && (
        <div className={`flex ${!bestSeller ? 'justify-between' : 'justify-end'} px-6`}>
          {!bestSeller && (
            <div className="group flex items-center gap-2 rounded-t-xl border-b-2 bg-white px-3 py-2 opacity-90">
              <div className="loading aspect-square h-6 w-6 items-center rounded-full" />
              <span className="loading h-2 w-16 rounded" />
            </div>
          )}
          <div className="flex items-center gap-2 rounded-t-xl border-b-2 bg-white px-3 py-2 opacity-90">
            <span className="loading h-2 w-16 rounded" />
          </div>
        </div>
      )}

      <div className="group absolute -left-21 top-1/2 z-10 flex h-11 w-10 -translate-y-1/2 items-center justify-center rounded-l-small bg-white bg-opacity-80 shadow-md">
        <FaChevronLeft
          size={18}
          className="text-dark"
        />
      </div>
      <div className="group absolute -right-21 top-1/2 z-10 flex h-11 w-10 -translate-y-1/2 items-center justify-center rounded-r-small bg-white bg-opacity-80 shadow-md">
        <FaChevronRight
          size={18}
          className="text-dark"
        />
      </div>

      {/* MARK: Slider */}
      <div className="flex min-h-[490px] flex-wrap rounded-medium bg-white bg-opacity-90 px-21/2 shadow-medium">
        <div className="flex w-full overflow-hidden py-21">
          {Array.from({ length: 10 }).map((_, index) => {
            const color =
              index <= 2 ? (index <= 1 ? (index <= 0 ? '#f44336' : 'orange') : 'lightgreen') : '#0dcaf0'

            return (
              <div
                key={index}
                className="relative w-full flex-shrink-0 snap-start px-21/2 sm:w-1/2 md:w-1/3 lg:w-1/4"
              >
                {bestSeller && (
                  <div
                    className="absolute right-1 z-20 rotate-[10deg] font-[700]"
                    style={{
                      color,
                      fontSize:
                        index <= 2 ? (index <= 1 ? (index <= 0 ? '56px' : '48px') : '40px') : '32px',
                      top:
                        index <= 2 ? (index <= 1 ? (index <= 0 ? '-30px' : '-26px') : '-22px') : '-13px',
                    }}
                  >
                    #{index + 1}
                  </div>
                )}
                <LoadingProductCard />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default memo(LoadingGroupProducts)
