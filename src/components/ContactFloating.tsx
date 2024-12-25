'use client'
import Image from 'next/image'
import Link from 'next/link'
import { memo, useEffect, useState } from 'react'
import { FaChevronLeft } from 'react-icons/fa'

interface ContactFloatingProps {
  className?: string
}

function ContactFloating({ className = '' }: ContactFloatingProps) {
  // states
  const [open, setOpen] = useState<boolean>(false)

  // key board event
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        setOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    // clean up
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [setOpen])

  return (
    <>
      <div
        className={`${
          open ? 'block' : 'hidden'
        } fixed bottom-0 left-0 right-0 top-0 z-30 h-screen w-screen ${className}`}
        onClick={() => setOpen(false)}
      />
      <div
        className={`fixed bottom-[88px] right-3 z-30 flex select-none items-center overflow-hidden rounded-xl bg-dark-100 shadow-medium-light transition-all duration-300 md:bottom-9 ${
          !open ? '' : ''
        }`}
      >
        <div
          className={`flex items-center ${
            !open ? 'max-w-0' : 'max-w-[132px]'
          } transition-all duration-300`}
        >
          <Link
            href="https://www.messenger.com/t/170660996137385"
            target="_blank"
            rel="noreferrer"
            className="wiggle p-2"
            onClick={() => setOpen(false)}
          >
            <Image
              src="/images/messenger.jpg"
              width={28}
              height={28}
              alt="messenger"
            />
          </Link>
          <Link
            href={`mailto:${process.env.NEXT_PUBLIC_MAIL}`}
            target="_blank"
            rel="noreferrer"
            className="wiggle p-2"
            onClick={() => setOpen(false)}
          >
            <Image
              src="/images/gmail.jpg"
              width={28}
              height={28}
              alt="gmail"
            />
          </Link>
        </div>

        <button
          className="group flex h-[44px] w-[44px] items-center justify-center"
          onClick={() => setOpen(!open)}
        >
          <FaChevronLeft
            size={20}
            className={`group-hover:scale-125 ${open ? 'rotate-180' : ''} trans-200 text-white`}
          />
        </button>
      </div>
    </>
  )
}

export default memo(ContactFloating)
