'use client'

import Image from 'next/image'
import React, { Children, memo, useCallback, useEffect, useRef, useState } from 'react'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'

interface SliderProps {
  time?: number
  children: React.ReactNode
  className?: string
  hideControls?: boolean
  thumbs?: string[]
  mobile?: boolean
  movies?: any[]
}

function Slider({
  time,
  hideControls,
  children,
  thumbs = [],
  mobile,
  movies = [],
  className = '',
}: SliderProps) {
  // states
  const [slide, setSlide] = useState<number>(1)
  const [isSliding, setIsSliding] = useState<boolean>(false)
  const [touchStartX, setTouchStartX] = useState<number>(0)
  const [touchEndX, setTouchEndX] = useState<number>(0)

  // refs
  const slideTrackRef = useRef<HTMLDivElement>(null)

  // values
  const childrenAmount = Children.count(children)

  // MARK: Slide Functions
  // change slide main function
  useEffect(() => {
    if (slideTrackRef.current) {
      slideTrackRef.current.style.marginLeft = `calc(-100% * ${slide})`
    }
  }, [slide])

  // to next slide
  const nextSlide = useCallback(() => {
    // not sliding
    if (!isSliding) {
      // start sliding
      setIsSliding(true)

      if (slide === childrenAmount) {
        setSlide(childrenAmount + 1)

        setTimeout(() => {
          if (slideTrackRef.current) {
            slideTrackRef.current.style.transition = 'none'
            setSlide(1)
          }
        }, 310)

        setTimeout(() => {
          if (slideTrackRef.current) {
            slideTrackRef.current.style.transition = 'all 0.3s linear'
          }
        }, 350)
      } else {
        setSlide(prev => prev + 1)
      }

      // stop sliding after slided
      setTimeout(() => {
        setIsSliding(false)
      }, 350)
    }
  }, [childrenAmount, isSliding, slide])

  // to previous slide
  const prevSlide = useCallback(() => {
    // if not sliding
    if (!isSliding) {
      // start sliding
      setIsSliding(true)

      if (slide === 1) {
        setSlide(0)

        setTimeout(() => {
          if (slideTrackRef.current) {
            slideTrackRef.current.style.transition = 'none'
            setSlide(childrenAmount)
          }
        }, 310)

        setTimeout(() => {
          if (slideTrackRef.current) {
            slideTrackRef.current.style.transition = 'all 0.3s linear'
          }
        }, 350)
      } else {
        setSlide(prev => prev - 1)
      }

      // stop sliding after slided
      setTimeout(() => {
        setIsSliding(false)
      }, 350)
    }
  }, [childrenAmount, isSliding, slide])

  // next slide by time
  useEffect(() => {
    if (time) {
      const interval = setInterval(() => {
        nextSlide()
      }, time)

      return () => clearInterval(interval)
    }
  }, [time, nextSlide])

  // MARK: Touch Events
  const handleTouchStart = (event: React.TouchEvent) => {
    setTouchStartX(event.touches[0].clientX)
  }

  const handleTouchMove = (event: React.TouchEvent) => {
    setTouchEndX(event.touches[0].clientX)
  }

  const handleTouchEnd = () => {
    const touchDiff = touchStartX - touchEndX
    if (touchDiff > 0 && touchDiff > 50) {
      nextSlide() // Swiped left
    } else if (touchDiff < 0 && touchDiff < -50) {
      prevSlide() // Swiped right
    }
  }

  return (
    <div
      className={`group relative h-full w-full overflow-hidden rounded-lg ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* MARK: Slide Track */}
      <div
        className={`no-scrollbar flex h-full w-full cursor-pointer transition-all duration-300 ease-linear`}
        style={{ marginLeft: '-100%' }}
        ref={slideTrackRef}
      >
        {[
          Children.toArray(children)[childrenAmount - 1],
          ...Children.toArray(children),
          Children.toArray(children)[0],
        ].map((child, index) => (
          <div
            key={index}
            className="h-full w-full shrink-0"
          >
            {child}
          </div>
        ))}
      </div>

      {/* MARK: Next - Previous */}
      {!hideControls && childrenAmount >= 2 && (
        <>
          <button
            className="trans-200 group absolute left-0 top-0 flex h-full w-12 items-center justify-center hover:bg-slate-100 hover:bg-opacity-10 group-hover:translate-x-0 md:-translate-x-full"
            onClick={prevSlide}
          >
            <FaChevronLeft
              size={16}
              className="wiggle text-white"
            />
          </button>
          <button
            className="trans-200 group absolute right-0 top-0 flex h-full w-12 items-center justify-center hover:bg-slate-100 hover:bg-opacity-10 group-hover:translate-x-0 md:translate-x-full"
            onClick={nextSlide}
          >
            <FaChevronRight
              size={16}
              className="wiggle text-white"
            />
          </button>
        </>
      )}

      {/* MARK: Indicators */}
      {thumbs.length >= 2 && (
        <div
          className={`trans-200 absolute bottom-[6%] left-1/2 z-10 flex w-full -translate-x-1/2 justify-center px-21 group-hover:bottom-[6%] group-hover:translate-y-0 md:bottom-0 md:translate-y-full`}
        >
          <p className="absolute bottom-full left-1/2 mb-2 -translate-x-1/2 text-center font-semibold text-light drop-shadow-md">
            {movies[slide - 1]?.title || movies[slide - 1]?.name}
          </p>

          <div className="no-scrollbar flex w-[90%] flex-shrink-0 gap-1 overflow-x-auto">
            {thumbs.map((src, index) => {
              return (
                <button
                  className={`${
                    mobile ? 'aspect-[9/16] w-[40px]' : 'aspect-video'
                  } trans-200 flex-shrink-0 overflow-hidden rounded-lg border-2 border-white shadow-md ${
                    slide === index + 1 ? 'opacity-100' : 'opacity-35 hover:opacity-50'
                  }`}
                  onClick={() => setSlide(index + 1)}
                  key={src}
                >
                  <Image
                    className="h-full w-full object-cover"
                    src={src}
                    width={mobile ? 40 : 80}
                    height={mobile ? 80 : 40}
                    alt="slide-thumb"
                    loading="lazy"
                  />
                </button>
              )
            })}
          </div>
        </div>
      )}
      {childrenAmount >= 2 && thumbs.length <= 0 && (
        <div className="trans-200 absolute bottom-[10%] left-1/2 z-10 flex -translate-x-1/2 items-center gap-5 group-hover:bottom-[10%] group-hover:translate-y-0 md:bottom-0 md:translate-y-full">
          {Array.from({ length: childrenAmount }).map((_, index) => {
            return (
              <button
                key={index}
                className={`trans-200 h-[14px] w-[14px] rounded-full bg-white shadow-md hover:bg-opacity-100 ${
                  slide === index + 1 ? 'bg-opacity-100' : 'bg-opacity-50'
                }`}
                onClick={() => setSlide(index + 1)}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}

export default memo(Slider)
