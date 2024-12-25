import { ICategory } from '@/models/CategoryModel'
import { IProduct } from '@/models/ProductModel'
import { ITag } from '@/models/TagModel'
import { updateProductPropertyApi } from '@/requests'
import { formatPrice } from '@/utils/number'
import Image from 'next/image'
import Link from 'next/link'
import { Dispatch, memo, SetStateAction, useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { FaEye, FaEyeSlash, FaRocket, FaStar, FaStreetView, FaSyncAlt, FaTrash } from 'react-icons/fa'
import { MdEdit } from 'react-icons/md'
import { PiLightningFill, PiLightningSlashFill } from 'react-icons/pi'
import { RiDonutChartFill } from 'react-icons/ri'
import ConfirmDialog from '../ConfirmDialog'
import { FaUsersViewfinder } from 'react-icons/fa6'
import { Rating } from '@mui/material'

interface ProductItemProps {
  data: IProduct
  loadingProducts: string[]
  syncingProducts: string[]
  className?: string

  // selected
  selectedProducts: string[]
  setSelectedProducts: Dispatch<SetStateAction<string[]>>

  // functions
  handleActivateProducts: (ids: string[], active: boolean) => void
  handleBootProducts: (ids: string[], value: boolean) => void
  handleSyncProducts: (ids: string[]) => void
  handleRemoveApplyingFlashSales: (ids: string[]) => void
  handleDeleteProducts: (ids: string[]) => void
}

function ProductItem({
  data,
  loadingProducts,
  syncingProducts,
  className = '',
  // selected
  selectedProducts,
  setSelectedProducts,
  // functions
  handleActivateProducts,
  handleBootProducts,
  handleSyncProducts,
  handleRemoveApplyingFlashSales,
  handleDeleteProducts,
}: ProductItemProps) {
  // states
  const [fieldEditing, setFieldEditing] = useState<{ stock: boolean; sold: boolean }>({
    stock: false,
    sold: false,
  })
  const [fieldValue, setFieldValue] = useState<{ stock: number; sold: number }>({
    stock: data.stock,
    sold: data.sold,
  })
  const [fieldLoading, setFieldLoading] = useState<{ stock: boolean; sold: boolean }>({
    stock: false,
    sold: false,
  })
  const [isOpenConfirmModal, setIsOpenConfirmModal] = useState<boolean>(false)
  const [confirmType, setConfirmType] = useState<'deactivate' | 'Remove Flash Sale' | 'delete'>('delete')

  // handle update product property
  const handleUpdateProductProperty = useCallback(
    async (id: string, field: 'stock' | 'sold') => {
      if (fieldValue[field] === data[field]) return

      setFieldLoading(prev => ({ ...prev, [field]: true }))

      try {
        const { newValue, message } = await updateProductPropertyApi(id, field, fieldValue[field])

        // show success message
        toast.success(message)

        setFieldValue(prev => ({ ...prev, [field]: newValue }))
        setFieldEditing(prev => ({ ...prev, [field]: false }))
        data[field] = newValue
      } catch (err: any) {
        console.log(err)
        toast.error(err.message)
      } finally {
        setFieldLoading(prev => ({ ...prev, [field]: false }))
      }
    },

    [data, fieldValue]
  )

  // set field value when data change
  useEffect(() => {
    setFieldValue({ stock: data.stock, sold: data.sold })
  }, [data])

  return (
    <>
      <div
        className={`trans-200 relative flex cursor-pointer items-start justify-between gap-2 rounded-lg p-4 shadow-lg ${
          selectedProducts.includes(data._id) ? '-translate-y-1 bg-violet-50' : 'bg-white'
        } ${className}`}
        onClick={() =>
          setSelectedProducts(prev =>
            prev.includes(data._id) ? prev.filter(id => id !== data._id) : [...prev, data._id]
          )
        }
      >
        <div className="flex-grow">
          {/* MARK: Thumbnails */}
          <Link
            href={`/${data.slug}`}
            prefetch={false}
            className="relative mb-2 flex max-w-[160px] items-center overflow-hidden rounded-lg shadow-md"
            onClick={e => e.stopPropagation()}
          >
            <div className="no-scrollbar flex w-full snap-x snap-mandatory items-center overflow-x-scroll">
              {data.images.map((src, index) => (
                <Image
                  key={index}
                  className="aspect-video flex-shrink-0 snap-start"
                  src={src}
                  height={200}
                  width={200}
                  alt="thumbnail"
                />
              ))}
            </div>

            {/* MARK: Sold out */}
            {data.stock <= 0 && (
              <Link
                href={`/${data.slug}`}
                prefetch={false}
                className="absolute left-0 right-0 top-0 z-10 flex aspect-video items-start justify-center rounded-lg bg-white bg-opacity-50"
              >
                <Image
                  className="-mt-1 animate-wiggle"
                  src="/images/sold-out.jpg"
                  width={60}
                  height={60}
                  alt="sold-out"
                />
              </Link>
            )}
          </Link>

          {/* Flash sale */}
          {data.flashSale && (
            <PiLightningFill
              className="absolute -top-1.5 left-1 animate-bounce text-yellow-400"
              size={25}
            />
          )}

          {/* Title */}
          <p
            className="mr-2 inline font-body text-[18px] font-semibold leading-4 tracking-wide"
            title={data.title}
          >
            <span
              className={`text-xs shadow-md ${
                (data.category as ICategory).title
                  ? 'bg-yellow-300 text-dark'
                  : 'bg-slate-200 text-slate-400'
              } mr-2 select-none rounded-md px-2 py-px font-body`}
            >
              {(data.category as ICategory).title || 'empty'}
            </span>
            {data.title}
          </p>

          {/* Price - Old Price */}
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xl font-semibold text-primary">{formatPrice(data.price)}</p>
            {data.oldPrice && (
              <p className="text-sm text-slate-500 line-through">{formatPrice(data.oldPrice)}</p>
            )}
          </div>

          {/* Rating */}
          {data.rating > 0 && (
            <div className="flex items-center gap-1">
              <span className="font-semibold text-yellow-500">{(data.rating || 5).toFixed(1)}</span>
              <Rating
                size="small"
                readOnly
                precision={0.1}
                value={data.rating}
              />
              <span className="text-xs text-slate-500">({data.reviewAmount})</span>
            </div>
          )}

          <div className="flex w-full items-center gap-3">
            {/* Sold */}
            <div
              className="flex cursor-pointer select-none items-center gap-1"
              onDoubleClick={e => {
                e.stopPropagation()
                setFieldEditing(prev => ({ ...prev, sold: !prev.sold }))
                handleUpdateProductProperty(data._id, 'sold')
              }}
              onBlur={e => {
                e.stopPropagation()
                setFieldEditing(prev => ({ ...prev, sold: !prev.sold }))
                handleUpdateProductProperty(data._id, 'sold')
              }}
              onClick={e => e.stopPropagation()}
            >
              <span className="font-semibold">
                {fieldLoading.sold ? (
                  <RiDonutChartFill
                    size={16}
                    className="animate-spin text-slate-300"
                  />
                ) : (
                  'Sold:'
                )}
              </span>{' '}
              {fieldEditing.sold ? (
                <input
                  className="max-w-[40px] text-ellipsis rounded-md border border-green-500 px-1 text-green-500 outline-none"
                  value={fieldValue.sold}
                  onChange={e => setFieldValue(prev => ({ ...prev, sold: +e.target.value }))}
                  disabled={fieldLoading.sold}
                  type="text"
                />
              ) : (
                <span className="text-green-500">{fieldValue.sold}</span>
              )}
            </div>

            {/* Stock */}
            <div
              className="flex cursor-pointer select-none items-center gap-1"
              onDoubleClick={e => {
                e.stopPropagation()
                setFieldEditing(prev => ({ ...prev, stock: !prev.stock }))
                handleUpdateProductProperty(data._id, 'stock')
              }}
              onBlur={e => {
                e.stopPropagation()
                setFieldEditing(prev => ({ ...prev, stock: !prev.stock }))
                handleUpdateProductProperty(data._id, 'stock')
              }}
              onClick={e => e.stopPropagation()}
            >
              <span className="font-semibold">
                {fieldLoading.stock ? (
                  <RiDonutChartFill
                    size={16}
                    className="animate-spin text-slate-300"
                  />
                ) : (
                  'Stock:'
                )}
              </span>{' '}
              {fieldEditing.stock ? (
                <input
                  className="max-w-[40px] text-ellipsis rounded-md border border-yellow-500 px-1 text-yellow-500 outline-none"
                  value={fieldValue.stock}
                  onChange={e => setFieldValue(prev => ({ ...prev, stock: +e.target.value }))}
                  disabled={fieldLoading.sold}
                  type="text"
                />
              ) : (
                <span className="text-yellow-500">{fieldValue.stock}</span>
              )}
            </div>
          </div>

          {/* MARK: Tags */}
          <p className="text-slate-500">
            <span className="font-semibold text-dark">Tags: </span>
            {(data.tags as ITag[]).map((tag: ITag, index) => (
              <span
                key={tag.slug}
                className="text-slate-400"
              >
                {tag.title}
                {index < data.tags.length - 1 ? ', ' : ''}
              </span>
            ))}
          </p>
        </div>

        {/* MARK: Action Buttons */}
        <div className="flex flex-col gap-4 rounded-lg border border-dark px-2 py-3 text-dark">
          {/* Active Button */}
          <button
            className="group block"
            onClick={e => {
              e.stopPropagation()
              // is being active
              if (data.active) {
                setIsOpenConfirmModal(true)
                setConfirmType('deactivate')
              } else {
                handleActivateProducts([data._id], true)
              }
            }}
            disabled={syncingProducts.includes(data._id) || loadingProducts.includes(data._id)}
            title={data.active ? 'Deactivate' : 'Activate'}
          >
            {data.active ? (
              <FaEye
                size={18}
                className="wiggle text-green-500"
              />
            ) : (
              <FaEyeSlash
                size={18}
                className="wiggle text-slate-300"
              />
            )}
          </button>

          {/* Review */}
          <Link
            href={`/admin/product/${data._id}/reviews`}
            className="group block"
            onClick={e => e.stopPropagation()}
            title="Review"
          >
            <FaStar
              size={18}
              className="wiggle text-yellow-500"
            />
          </Link>

          {/* Boot Button */}
          <button
            className="group block"
            onClick={e => {
              e.stopPropagation()
              // is being booted
              handleBootProducts([data._id], !data.booted)
            }}
            disabled={syncingProducts.includes(data._id) || loadingProducts.includes(data._id)}
            title={data.active ? 'Deactivate' : 'Activate'}
          >
            <FaRocket
              size={18}
              className={`wiggle ${data.booted ? 'text-green-500' : ''}`}
            />
          </button>

          {/* Sync Product Stock Button */}
          <button
            className="group block"
            onClick={e => {
              e.stopPropagation()
              handleSyncProducts([data._id])
            }}
            disabled={syncingProducts.includes(data._id) || loadingProducts.includes(data._id)}
            title="Sync"
          >
            <FaSyncAlt
              size={16}
              className={`wiggle ${
                syncingProducts.includes(data._id) ? 'animate-spin text-slate-300' : ''
              }`}
            />
          </button>

          {/* Remove Flash Sale Button */}
          {data.flashSale && (
            <button
              className="group block"
              onClick={e => {
                e.stopPropagation()
                setIsOpenConfirmModal(true)
                setConfirmType('Remove Flash Sale')
              }}
              disabled={syncingProducts.includes(data._id) || loadingProducts.includes(data._id)}
              title="Remove Flash Sale"
            >
              <PiLightningSlashFill
                size={18}
                className="wiggle text-yellow-400"
              />
            </button>
          )}

          {/* Edit Button Link */}
          <Link
            href={`/admin/product/${data._id}/edit`}
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
            disabled={loadingProducts.includes(data._id) || syncingProducts.includes(data._id)}
            title="Delete"
          >
            {loadingProducts.includes(data._id) ? (
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
        title={`${confirmType.charAt(0).toUpperCase() + confirmType.slice(1)} Product`}
        content={`Are you sure that you want to ${confirmType} this product?`}
        onAccept={() =>
          confirmType === 'deactivate'
            ? handleActivateProducts([data._id], false)
            : confirmType === 'Remove Flash Sale'
              ? handleRemoveApplyingFlashSales([data._id])
              : handleDeleteProducts([data._id])
        }
        isLoading={loadingProducts.includes(data._id)}
      />
    </>
  )
}

export default memo(ProductItem)
