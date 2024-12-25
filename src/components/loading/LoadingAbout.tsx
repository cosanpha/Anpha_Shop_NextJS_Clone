import { memo } from 'react'
import Slider from '../Slider'

function LoadingAbout({ className = '' }: { className?: string }) {
  return (
    <section className={`mx-auto max-w-1200 ${className}`}>
      <Slider
        time={10000}
        className="rounded-medium bg-white bg-opacity-90 shadow-medium"
      >
        {/* MARK: slide 1 */}
        <div className="flex h-full flex-wrap gap-y-4 p-21">
          <div className="loading aspect-video w-full rounded-lg md:w-2/3" />
          <div className="w-full pb-16 md:w-1/3 md:pb-0 md:pl-21">
            {Array.from({ length: 10 }).map((_, index) => (
              <div
                className="loading my-4 h-2 rounded"
                key={index}
              />
            ))}
          </div>
        </div>
      </Slider>
    </section>
  )
}

export default memo(LoadingAbout)
