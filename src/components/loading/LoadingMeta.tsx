'use client'

import { memo } from 'react'
import { FaSearch, FaSort } from 'react-icons/fa'
import LoadingInput from './LoadingInput'

interface LoadingMetaProps {
  items?: boolean
  hideSearch?: boolean
  className?: string
}

function LoadingMeta({ items, hideSearch, className = '' }: LoadingMetaProps) {
  return (
    <div
      className={`no-scrollbar w-full self-end overflow-auto rounded-medium bg-white p-21 text-dark shadow-md transition-all duration-300 ${className}`}
    >
      {/* MARK: Title */}
      <div className="loading mb-7 mt-3 h-2 w-full max-w-[300px] rounded" />

      {/* MARK: Filter */}
      <div className="grid grid-cols-12 gap-21">
        {/* Search */}
        {!hideSearch && (
          <div className="col-span-12 flex flex-col md:col-span-4">
            <LoadingInput
              className="md:max-w-[450px]"
              type="text"
              icon={FaSearch}
            />
          </div>
        )}
        {/* Price */}
        <div className="col-span-12 flex flex-col md:col-span-4">
          <div className="flex gap-2">
            <div className="loading my-[7px] h-2 w-[40px] rounded" />
            <div className="loading my-[7px] h-2 w-[70px] rounded" />
            <div className="loading my-[7px] h-2 w-[70px] rounded" />
          </div>
          <div className="loading relative my-2 h-2 w-full rounded">
            <div className="absolute right-0 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-loading" />
          </div>
        </div>

        {/* Stock */}
        <div className="col-span-12 flex flex-col md:col-span-4">
          <div className="flex gap-2">
            <div className="loading my-[7px] h-2 w-[40px] rounded" />
            <div className="loading my-[7px] h-2 w-[70px] rounded" />
            <div className="loading my-[7px] h-2 w-[70px] rounded" />
          </div>
          <div className="loading relative my-2 h-2 w-full rounded">
            <div className="absolute right-0 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-loading" />
          </div>
        </div>

        {/* MARK: Item Selection */}
        {items && (
          <div className="col-span-12 flex max-h-[228px] flex-wrap items-end justify-end gap-1 md:max-h-[152px] lg:max-h-[152px]">
            {Array.from({ length: 10 }).map((_, index) => (
              <div
                className={`loading h-[34px] w-[40px] max-w-60 rounded-md`}
                title="All Types"
                key={index}
              />
            ))}
          </div>
        )}

        {/* MARK: Select Filter */}
        <div className="col-span-12 flex flex-wrap items-center justify-end gap-3 md:col-span-8">
          {/* Sort */}
          <LoadingInput
            icon={FaSort}
            type="select"
          />
        </div>

        {/* MARK: Filter Buttons */}
        <div className="col-span-12 flex items-center justify-end gap-2 md:col-span-4">
          <button className="loading h-[40px] w-[85px] rounded-md" />
          <button className="loading h-[40px] w-[96px] rounded-md" />
        </div>
      </div>
    </div>
  )
}

export default memo(LoadingMeta)
