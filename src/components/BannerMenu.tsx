import { ICategory } from '@/models/CategoryModel'
import { ITag } from '@/models/TagModel'
import Link from 'next/link'
import React, { memo } from 'react'
import { BiSolidCategoryAlt } from 'react-icons/bi'
import { FaTag } from 'react-icons/fa'
import { FaBoltLightning } from 'react-icons/fa6'
import { IoClose } from 'react-icons/io5'

interface BannerMenuProps {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  categories: ICategory[]
  tags: ITag[]
}

function BannerMenu({ open, setOpen, categories, tags }: BannerMenuProps) {
  return (
    <>
      {/* MARK: Overlay */}
      <div
        className={`fixed bottom-0 left-0 right-0 top-0 ${!open ? 'hidden' : ''}`}
        onClick={() => setOpen(false)}
      />
      {/* MARK: Main */}
      <div
        className={`absolute left-0 top-0 z-10 flex h-full w-full flex-col items-start justify-evenly gap-21 overflow-hidden rounded-bl-small bg-dark-100 bg-opacity-90 transition-all duration-300 sm:flex-row md:items-start lg:hidden ${
          open ? 'max-h-[calc(100vh_-_72px_-_21px*2)] px-21 py-9' : 'max-h-0'
        }`}
        onClick={() => setOpen(false)}
      >
        <button
          className="group absolute right-0 top-0 rounded-lg p-2"
          onClick={() => setOpen(false)}
        >
          <IoClose
            size={24}
            className="wiggle text-white"
          />
        </button>

        {/* MARK: Tag */}
        <ul
          className="relative w-full overflow-y-scroll rounded-lg bg-white p-2 pb-6 pt-0 shadow-small sm:max-w-[300px]"
          onClick={e => e.stopPropagation()}
        >
          <h5 className="sticky top-0 z-10 bg-white pt-2 text-center text-[20px] font-semibold text-dark">
            Thẻ
          </h5>

          {tags?.map(tag => (
            <li
              className="trans-200 group rounded-extra-small text-dark hover:bg-primary"
              key={tag.title}
            >
              <Link
                href={`/tag?tag=${tag.slug}`}
                prefetch={false}
                className="flex items-center px-[10px] py-[6px]"
              >
                <FaTag
                  size={16}
                  className="wiggle"
                />
                <span className="ms-2">{tag.title}</span>
              </Link>
            </li>
          ))}
        </ul>

        {/* MARK: Category */}
        <ul
          className="relative w-full overflow-y-scroll rounded-lg bg-white p-2 pb-6 pt-0 shadow-small sm:max-w-[300px]"
          onClick={e => e.stopPropagation()}
        >
          <h5 className="sticky top-0 z-10 bg-white pt-2 text-center text-[20px] font-semibold text-dark">
            Thể loại
          </h5>

          <li className="trans-200 group rounded-extra-small text-dark hover:bg-primary">
            <Link
              href="/flash-sale"
              prefetch={false}
              className="flex items-center gap-2 px-[10px] py-[6px]"
            >
              <FaBoltLightning
                size={16}
                className="wiggle text-secondary"
              />
              <span className="font-bold text-secondary">FLASH SALES</span>
            </Link>
          </li>

          {categories?.map(category => (
            <li
              className="trans-200 group rounded-extra-small text-dark hover:bg-primary"
              key={category.title}
            >
              <Link
                href={`/category?ctg=${category.slug}`}
                prefetch={false}
                className="flex items-center px-[10px] py-[6px]"
              >
                <BiSolidCategoryAlt
                  size={17}
                  className="wiggle"
                />
                <span className="ms-2">{category.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}

export default memo(BannerMenu)
