'use client'

import { AnimatePresence, motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { memo, useEffect, useState } from 'react'
import { IoCloseSharp } from 'react-icons/io5'
import { RiAdvertisementFill } from 'react-icons/ri'

interface FloatingButtonsProps {
  className?: string
}

function FloatingButtons({ className = '' }: FloatingButtonsProps) {
  const [width, setWidth] = useState<number>(0)

  // states
  const [openAds, setOpenAds] = useState<boolean>(false)

  // set width
  useEffect(() => {
    // handle resize
    const handleResize = () => {
      setWidth(window.innerWidth)
    }

    // initial width
    setWidth(window.innerWidth)

    // add event listener
    window.addEventListener('resize', handleResize)

    // remove event listener
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <>
      <div
        className={`trans-300 fixed bottom-[140px] right-3 z-30 flex select-none flex-col items-center gap-2 overflow-hidden rounded-xl md:bottom-[88px] ${className}`}
      >
        <button
          className="group flex h-[44px] w-[44px] items-center justify-center rounded-xl bg-dark-100"
          title="Ads"
          onClick={() => {
            setOpenAds(true)
          }}
        >
          <RiAdvertisementFill
            size={24}
            className={`wiggle trans-200 text-light`}
          />
        </button>
      </div>

      {/* Ads Modal */}
      <AnimatePresence>
        {openAds && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed bottom-0 left-0 right-0 top-0 z-[60] flex select-none items-center justify-center bg-black bg-opacity-50 p-10"
            onClick={() => setOpenAds(false)}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="h-full w-full"
            >
              <button
                className="group absolute right-0 top-12 text-light"
                onClick={e => {
                  e.stopPropagation()
                  setOpenAds(false)
                }}
              >
                <IoCloseSharp
                  size={30}
                  className="wiggle"
                />
              </button>
              <Link
                href="https://monaedu.com"
                target="_blank"
                rel="noreferrer"
              >
                <Image
                  className="h-full w-full overflow-hidden object-contain"
                  src={width > 0 && width < 768 ? '/sales/bigsale-mobile.png' : '/sales/bigsale.png'}
                  width={2000}
                  height={2000}
                  alt="big-sale"
                  loading="lazy"
                />
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default memo(FloatingButtons)
