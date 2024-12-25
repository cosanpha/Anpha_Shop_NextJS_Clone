import { ICategory } from '@/models/CategoryModel'
import Image from 'next/image'
import Link from 'next/link'
import React, { memo, useState } from 'react'
import { FaTrash } from 'react-icons/fa'
import { MdEdit } from 'react-icons/md'
import { RiDonutChartFill } from 'react-icons/ri'
import ConfirmDialog from '../ConfirmDialog'

interface CategoryItemProps {
  data: ICategory
  loadingCategories: string[]
  className?: string

  selectedCategories: string[]
  setSelectedCategories: React.Dispatch<React.SetStateAction<string[]>>

  handleDeleteCategories: (ids: string[]) => void
}

function CategoryItem({
  data,
  loadingCategories,
  className = '',
  // selected
  selectedCategories,
  setSelectedCategories,
  handleDeleteCategories,
}: CategoryItemProps) {
  // states
  const [isOpenConfirmModal, setIsOpenConfirmModal] = useState<boolean>(false)

  return (
    <>
      <div
        className={`trans-200 flex cursor-pointer flex-col rounded-lg p-4 text-dark shadow-lg ${
          selectedCategories.includes(data._id) ? '-translate-y-1 bg-violet-50' : 'bg-white'
        } ${className}`}
        onClick={() =>
          setSelectedCategories(prev =>
            prev.includes(data._id) ? prev.filter(id => id !== data._id) : [...prev, data._id]
          )
        }
        key={data._id}
      >
        {/* MARK: Body */}
        <div className="flex gap-3">
          {data.logo && (
            <div className="flex-shrink-0">
              <Image
                className="aspect-square rounded-lg"
                src={data.logo}
                width={40}
                height={40}
                alt="category-logo"
              />
            </div>
          )}

          <div className="">
            <p
              className="font-semibold"
              title={data.slug}
            >
              {data.title}
            </p>

            {/* Product Quantity */}
            <p
              className="mb-2 font-semibold"
              title={`Product Quantity: ${data.productQuantity}`}
            >
              <span>Pr.Q:</span> <span className="text-primary">{data.productQuantity}</span>
            </p>
          </div>
        </div>

        {/* MARK: Action Buttson */}
        <div className="flex max-w-full gap-4 self-end overflow-x-auto rounded-lg border border-dark px-3 py-2">
          {/* Edit Button Link */}
          <Link
            href={`/admin/category/${data.slug}/edit`}
            className="group block"
            onClick={e => e.stopPropagation()}
            title="Edit"
          >
            <MdEdit
              size={18}
              className="wiggle"
            />
          </Link>

          {/* Delete Button */}
          <button
            className="group block"
            onClick={e => {
              e.stopPropagation()
              setIsOpenConfirmModal(true)
            }}
            disabled={loadingCategories.includes(data._id)}
            title="Delete"
          >
            {loadingCategories.includes(data._id) ? (
              <RiDonutChartFill
                size={18}
                className="animate-spin text-slate-300"
              />
            ) : (
              <FaTrash
                size={18}
                className="wiggle"
              />
            )}
          </button>
        </div>
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={isOpenConfirmModal}
        setOpen={setIsOpenConfirmModal}
        title="Delete Category"
        content="Are you sure that you want to delete this category?"
        onAccept={() => handleDeleteCategories([data._id])}
        isLoading={loadingCategories.includes(data._id)}
      />
    </>
  )
}

export default memo(CategoryItem)
