import { memo } from 'react'
import { BiSolidCategoryAlt } from 'react-icons/bi'
import { FaTag } from 'react-icons/fa'
import Slider from '../Slider'
import LoadingCarousel from './LoadingCarousel'
import LoadingHeader from './LoadingHeader'

function Banner({ className = '' }: { className?: string }) {
  return (
    <section className={`h-screen py-21 ${className}`}>
      {/* Main Banner */}
      <div
        className="mx-auto flex h-full w-full max-w-1200 flex-col overflow-hidden rounded-medium bg-white bg-opacity-90 shadow-medium"
        style={{ height: 'calc(100vh - 2 * 21px)' }}
      >
        {/* MARK: Header in Banner */}
        <LoadingHeader isStatic />

        {/* Banner Content */}
        <div
          className="relative flex flex-col gap-21 overflow-hidden p-21"
          style={{ height: 'calc(100% - 72px)' }}
        >
          {/* MARK: Top */}
          <div className="flex h-2/3 flex-grow justify-between gap-21">
            {/* Tag */}
            <ul className="hidden min-w-[200px] overflow-y-auto rounded-lg bg-white p-2 lg:block">
              <div className="loading mx-auto mb-3 mt-2 h-6 w-20 rounded-md" />
              {Array.from({ length: 6 }).map((_, index) => (
                <li
                  className="group rounded-extra-small text-dark"
                  key={index}
                >
                  <div className="flex items-center px-[10px] py-[6px]">
                    <FaTag size={16} />
                    <span className="loading ms-2 h-6 w-32 rounded-lg" />
                  </div>
                </li>
              ))}
            </ul>

            {/* Slider */}
            <Slider mobile={false}>
              <div className="loading h-full w-full rounded-lg" />
            </Slider>

            {/* Category */}
            <ul className="hidden min-w-[200px] overflow-y-auto rounded-lg bg-white p-2 lg:block">
              <div className="loading mx-auto mb-3 mt-2 h-6 w-20 rounded-md" />
              {Array.from({ length: 6 }).map((_, index) => (
                <li
                  className="group rounded-extra-small text-dark"
                  key={index}
                >
                  <div className="flex items-center px-[10px] py-[6px]">
                    <BiSolidCategoryAlt size={17} />
                    <span className="loading ms-2 h-6 w-32 rounded-lg" />
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* MARK: Bottom */}
          <div className="relative -mb-4 shrink-0">
            <LoadingCarousel />
          </div>
        </div>
      </div>
    </section>
  )
}

export default memo(Banner)
