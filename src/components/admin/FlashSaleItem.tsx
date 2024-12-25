import { IFlashSale } from '@/models/FlashSaleModel'
import { IProduct } from '@/models/ProductModel'
import { formatPrice } from '@/utils/number'
import { formatTime } from '@/utils/time'
import Image from 'next/image'
import Link from 'next/link'
import React, { memo, useState } from 'react'
import { FaTrash } from 'react-icons/fa'
import { MdEdit } from 'react-icons/md'
import { RiDonutChartFill } from 'react-icons/ri'
import ConfirmDialog from '../ConfirmDialog'

interface FlashSaleItemProps {
  data: IFlashSale
  loadingFlashSales: string[]
  className?: string

  selectedFlashSales: string[]
  setSelectedFlashSales: React.Dispatch<React.SetStateAction<string[]>>

  handleDeleteFlashSales: (ids: string[]) => void
}

function FlashSaleItem({
  data,
  loadingFlashSales,
  className = '',
  // selected
  selectedFlashSales,
  setSelectedFlashSales,
  // functions
  handleDeleteFlashSales,
}: FlashSaleItemProps) {
  // states
  const [isOpenConfirmModal, setIsOpenConfirmModal] = useState<boolean>(false)

  return (
    <>
      <div
        className={`trans-200 flex cursor-pointer flex-col rounded-lg p-4 shadow-lg ${
          selectedFlashSales.includes(data._id) ? '-translate-y-1 bg-violet-50' : 'bg-white'
        } ${className}`}
        onClick={() =>
          setSelectedFlashSales(prev =>
            prev.includes(data._id) ? prev.filter(id => id !== data._id) : [...prev, data._id]
          )
        }
      >
        {/* MARK: Body */}
        {/* Value - Time Type */}
        <div
          className="font-semibold"
          title="netflix"
        >
          <span
            title="Value"
            className="mr-2 font-semibold text-primary"
          >
            {data.type === 'percentage' ? data.value : formatPrice(+data.value)}
          </span>

          <span title="Time Type">{data.timeType}</span>
        </div>

        {/* Type - Duration */}
        <div
          className="font-semibold"
          title="netflix"
        >
          <span
            className="mr-2"
            title="Type"
          >
            {data.type}
          </span>
          {data.timeType === 'loop' && (
            <span
              className="font-semobold text-secondary"
              title="duration"
            >
              {data.duration}
            </span>
          )}
        </div>

        {/* Begin - Expire */}
        <div>
          <span title="Begin (d/m/y)">{formatTime(data.begin)}</span>
          {data.timeType === 'once' && data.expire && (
            <span title="Expire (d/m/y)">
              {' - '} {formatTime(data.expire)}
            </span>
          )}
        </div>

        {/* Product Quantity */}
        <p className="font-semibold">
          <span>Product Quantity:</span> <span className="text-primary">{data.productQuantity}</span>
        </p>

        {/* Applying Products */}
        <div className="mb-3 flex max-h-[300px] flex-wrap gap-2 overflow-y-auto rounded-lg">
          {(data.products as IProduct[]).map(product => (
            <div
              className="flex items-start gap-2 rounded-lg border border-slate-300 bg-white p-2"
              key={product._id}
            >
              <Image
                className="aspect-video rounded-md border"
                src={product.images[0]}
                height={80}
                width={80}
                alt="thumbnail"
              />
              <span
                className="line-clamp-2 text-ellipsis"
                title={product.title}
              >
                {product.title}
              </span>
            </div>
          ))}
        </div>

        {/* MARK: Action Buttons */}
        <div className="flex gap-4 self-end rounded-lg border border-dark px-3 py-2 text-dark">
          {/* Edit Button Link */}
          <Link
            href={`/admin/flash-sale/${data._id}/edit`}
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
            disabled={loadingFlashSales.includes(data._id)}
            title="Delete"
          >
            {loadingFlashSales.includes(data._id) ? (
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
        title="Delete Flash Sale"
        content="Are you sure that you want to delete this flash sale?"
        onAccept={() => handleDeleteFlashSales([data._id])}
        isLoading={loadingFlashSales.includes(data._id)}
      />
    </>
  )
}

export default memo(FlashSaleItem)
