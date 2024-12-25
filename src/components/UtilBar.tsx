'use client'

import { ICategory } from '@/models/CategoryModel'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'
import { memo, useEffect, useRef, useState } from 'react'
import { FaGripVertical } from 'react-icons/fa'

interface UtilBarProps {
  categories: ICategory[]
  className?: string
}

function UtilBar({ categories, className = '' }: UtilBarProps) {
  // hooks
  const { data: session } = useSession()
  const curUser: any = session?.user

  // states
  const [show, setShow] = useState<boolean>(true)
  const [width, setWidth] = useState<number>(0)

  // refs
  const timeOutRef = useRef<any>(null)

  // handle show and hide header on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (width >= 768) return

      setShow(false)
      if (timeOutRef.current) {
        clearTimeout(timeOutRef.current)
      }

      timeOutRef.current = setTimeout(() => {
        // scroll to end of page then not show
        if (window.scrollY + window.innerHeight >= document.body.clientHeight) {
          setShow(false)
          return
        }

        setShow(true)
      }, 350)
    }

    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [width])

  // handle resize
  useEffect(() => {
    const handleResize = () => {
      setWidth(window.innerWidth)
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <div
      className={`trans-300 fixed left-1/2 z-40 flex w-full -translate-x-1/2 items-center justify-center px-3 md:left-auto md:top-1/2 md:w-auto md:-translate-y-1/2 md:translate-x-0 md:px-0 ${
        show
          ? 'opacity-1 bottom-21/2 md:bottom-auto md:right-3'
          : 'md:translate-y-auto bottom-0 translate-y-full opacity-0 md:bottom-auto md:right-0 md:translate-x-[100%] md:opacity-100'
      } ${className}`}
    >
      <div
        className={`relative flex items-center justify-center gap-2 rounded-lg bg-dark-100 shadow-medium-light transition-all duration-300 md:flex-col md:px-0 md:py-3`}
      >
        <button
          className="group absolute left-0 top-1/2 hidden -translate-x-full -translate-y-1/2 items-center justify-center rounded-l-md bg-white py-3 shadow-md md:flex"
          onClick={() => setShow(prev => !prev)}
        >
          <FaGripVertical
            size={20}
            className={`wiggle`}
          />
        </button>

        {/* MARK: Avatar */}
        {curUser?._id && (
          <Link
            href="/user"
            className="flex-shrink-0 py-3 pl-3 md:border-b md:py-0 md:pb-3 md:pl-0"
          >
            <Image
              className="wiggle-0 aspect-square rounded-full"
              src={curUser.avatar || process.env.NEXT_PUBLIC_DEFAULT_AVATAR!}
              width={36}
              height={36}
              alt="logo"
            />
          </Link>
        )}

        {/* MARK: Categories */}
        <div className="no-scrollbar flex items-center gap-5 overflow-auto px-3 py-3 md:m-0 md:-mt-3 md:max-h-[282px] md:flex-col">
          {categories.map(category => (
            <Link
              href={`/#${category.slug}`}
              className="group flex-shrink-0"
              title={category.title}
              key={category.slug}
            >
              <Image
                className="wiggle aspect-square rounded-md"
                src={`${category.logo}`}
                width={28}
                height={28}
                alt="logo"
              />
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

export default memo(UtilBar)
