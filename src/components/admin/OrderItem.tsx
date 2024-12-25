import { IOrder } from '@/models/OrderModel'
import { IVoucher } from '@/models/VoucherModel'
import { deliverOrderApi, reDeliverOrder } from '@/requests'
import { formatPrice } from '@/utils/number'
import { formatTime, isToday } from '@/utils/time'
import Image from 'next/image'
import Link from 'next/link'
import React, { memo, useCallback, useState } from 'react'
import { FieldValues, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { FaCheckSquare, FaEye, FaHistory, FaRegTrashAlt, FaSearch } from 'react-icons/fa'
import { GrDeliver } from 'react-icons/gr'
import { ImCancelCircle } from 'react-icons/im'
import { RiDonutChartFill } from 'react-icons/ri'
import { SiGooglemessages } from 'react-icons/si'
import ConfirmDialog from '../ConfirmDialog'
import Input from '../Input'

interface OrderItemProps {
  data: IOrder
  loadingOrders: string[]
  className?: string

  setOrders: React.Dispatch<React.SetStateAction<IOrder[]>>
  selectedOrders: string[]
  setSelectedOrders: React.Dispatch<React.SetStateAction<string[]>>

  handleCancelOrders: (ids: string[]) => void
  handleDeleteOrders: (ids: string[]) => void
  setValue: (name: string, value: any) => void
  handleFilter: () => void
}

function OrderItem({
  data,
  loadingOrders,
  className = '',

  // selected
  setOrders,
  selectedOrders,
  setSelectedOrders,

  // functions
  handleCancelOrders,
  handleDeleteOrders,
  setValue,
  handleFilter,
}: OrderItemProps) {
  // states
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [confirmType, setConfirmType] = useState<'deliver' | 're-deliver' | 'delete'>('delete')
  const [isOpenConfirmModal, setIsOpenConfirmModal] = useState<boolean>(false)
  const [isOpenMessageModal, setIsOpenMessageModal] = useState<boolean>(false)

  // form
  const {
    register,
    formState: { errors },
    clearErrors,
    getValues,
    reset,
  } = useForm<FieldValues>({
    defaultValues: {
      message: '',
    },
  })

  // handle copy
  const handleCopy = useCallback((text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Đã sao chép: ' + text)
  }, [])

  // handle deliver order
  const handleDeliverOrder = useCallback(async () => {
    // start loading
    setIsLoading(true)

    try {
      // send request to deliver order
      const { message } = await deliverOrderApi(data._id, getValues('message'))

      // update order status
      setOrders(prev => prev.map(o => (o._id === data._id ? { ...o, status: 'done' } : o)))

      // show success message
      toast.success(message)

      // clear message
      reset()
    } catch (err: any) {
      console.log(err)
      toast.error(err.message)
    } finally {
      // stop loading
      setIsLoading(false)
    }
  }, [data._id, setOrders, getValues, reset])

  // handle re-deliver order
  const handleReDeliverOrder = useCallback(async () => {
    // start loading
    setIsLoading(true)

    try {
      // send request to re-deliver order
      const { message } = await reDeliverOrder(data._id, getValues('message'))

      // show success message
      toast.success(message)

      // clear message
      reset()
    } catch (err: any) {
      console.log(err)
      toast.error(err.message)
    } finally {
      // stop loading
      setIsLoading(false)
    }
  }, [data._id, getValues, reset])

  return (
    <>
      <div
        className={`justify trans-200 relative flex w-full cursor-pointer items-start gap-2 rounded-lg p-4 shadow-lg ${
          selectedOrders.includes(data._id)
            ? '-translate-y-1 bg-violet-50'
            : data.status === 'done'
              ? 'bg-green-100'
              : data.status === 'pending'
                ? 'bg-red-100'
                : 'bg-slate-200'
        } ${className}`}
        onClick={() =>
          setSelectedOrders(prev =>
            prev.includes(data._id) ? prev.filter(id => id !== data._id) : [...prev, data._id]
          )
        }
      >
        <div className="w-[calc(100%_-_44px)]">
          {/* MARK: Thumbnails */}
          <div className="mb-2 flex h-full max-h-[145px] w-full flex-wrap items-center gap-2 overflow-y-auto">
            {data.items.map((item: any) => (
              <Link
                href={`/${item.product.slug}`}
                prefetch={false}
                className="relative overflow-hidden rounded-lg shadow-md"
                onClick={e => e.stopPropagation()}
                key={item._id}
              >
                <Image
                  className="aspect-video h-auto w-auto"
                  src={item.product.images[0] || '/images/not-found.jpg'}
                  height={120}
                  width={120}
                  alt="thumbnail"
                />
                <span className="absolute right-1 top-1 rounded-full border-2 border-white bg-secondary px-[3px] py-[2px] text-[8px] font-semibold text-white shadow-md">
                  x{item.quantity}
                </span>
              </Link>
            ))}
          </div>

          {/* MARK: Information */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Status */}
            <p
              className={`inline font-semibold text-${
                data.status === 'done' ? 'green' : data.status === 'pending' ? 'red' : 'slate'
              }-400`}
              title="status"
            >
              {data.status}
            </p>

            {/* Code */}
            <p
              className="inline font-semibold text-primary"
              title="code"
            >
              {data.code}
            </p>

            {/* Method */}
            <p
              className={`inline font-semibold text-[${
                data.paymentMethod === 'momo' ? '#a1396c' : '#399162'
              }]`}
              title="payment-method"
            >
              {data.paymentMethod}
            </p>

            {/* UserID */}
            <FaCheckSquare
              title="userId"
              size={18}
              className={`${data.userId ? 'text-green-500' : 'text-slate-600'}`}
            />
          </div>

          {/* Email */}
          <div
            className="line-clamp-1 block text-ellipsis underline"
            title={'Email: ' + data.email}
          >
            <span
              className="mr-1"
              onClick={e => {
                e.stopPropagation()
                handleCopy(data.email)
              }}
            >
              {data.email}
            </span>
            <div className="inline-flex items-center gap-1.5 rounded-md border border-secondary px-1.5 py-1">
              <span
                className="group text-secondary"
                onClick={e => {
                  e.stopPropagation()
                  setValue('search', data.email)
                  handleFilter()
                }}
              >
                <FaSearch
                  size={14}
                  className="wiggle"
                />
              </span>
              <Link
                href={`/admin/account/all?search=${data.email}`}
                className="group text-yellow-400"
                onClick={e => e.stopPropagation()}
              >
                <FaEye
                  size={15}
                  className="wiggle"
                />
              </Link>
            </div>
          </div>

          {/* Total */}
          <p
            className="mr-2 flex flex-wrap items-center gap-x-2 text-xl font-semibold text-green-500"
            title="total"
          >
            {formatPrice(data.total)}{' '}
            <span
              className="rounded-full bg-sky-300 px-[7px] py-[1px] text-center text-xs text-white shadow-sm"
              title="quantity"
            >
              x{data.items.reduce((quantity: number, item: any) => quantity + item.quantity, 0)}
            </span>
          </p>

          {data.voucherApplied && data.discount && (
            <p
              className="text-sm font-semibold text-slate-400"
              title={`voucherApplied: ${(data.voucherApplied as IVoucher).desc}`}
            >
              {(data.voucherApplied as IVoucher).code}{' '}
              <span className="font-normal text-secondary">({formatPrice(data.discount)})</span>
            </p>
          )}

          {/* Created */}
          <div className="flex flex-wrap gap-x-2">
            <p
              className="text-sm"
              title="Created (d/m/y)"
            >
              <span className="font-semibold">Created: </span>
              <span className={isToday(new Date(data.createdAt)) ? 'font-semibold text-slate-600' : ''}>
                {formatTime(data.createdAt)}
              </span>
            </p>

            {/* Updated */}
            <p
              className="text-sm"
              title="Updated (d/m/y)"
            >
              <span className="font-semibold">Updated: </span>
              <span>{formatTime(data.updatedAt)}</span>
            </p>
          </div>
        </div>

        {/* MARK: Action Buttons */}
        <div className="flex flex-shrink-0 flex-col gap-4 rounded-lg border border-dark bg-white px-2 py-3 text-dark">
          {/* Detail Button */}
          <Link
            href={`/admin/order/${data.code}`}
            className="group block"
            onClick={e => e.stopPropagation()}
            title="Detail"
          >
            <FaEye
              size={18}
              className="wiggle text-primary"
            />
          </Link>

          {/* Deliver Button */}
          {data.status !== 'done' && (
            <button
              className="group block"
              disabled={loadingOrders.includes(data._id) || isLoading}
              onClick={e => {
                e.stopPropagation()
                setConfirmType('deliver')
                setIsOpenConfirmModal(true)
              }}
              title="Deliver"
            >
              {isLoading ? (
                <RiDonutChartFill
                  size={18}
                  className="animate-spin text-slate-300"
                />
              ) : (
                <GrDeliver
                  size={18}
                  className="wiggle text-yellow-400"
                />
              )}
            </button>
          )}

          {/* Re-Deliver Button */}
          {data.status === 'done' && (
            <button
              className="group block"
              disabled={loadingOrders.includes(data._id) || isLoading}
              onClick={e => {
                e.stopPropagation()
                setConfirmType('re-deliver')
                setIsOpenConfirmModal(true)
              }}
              title="Re-Deliver"
            >
              {isLoading ? (
                <RiDonutChartFill
                  size={18}
                  className="animate-spin text-slate-300"
                />
              ) : (
                <FaHistory
                  size={18}
                  className="wiggle text-blue-500"
                />
              )}
            </button>
          )}

          {/* Add Messsage To Deliver Button */}
          <button
            className="group block"
            disabled={loadingOrders.includes(data._id) || isLoading}
            onClick={e => {
              e.stopPropagation()
              setIsOpenMessageModal(true)
            }}
            title="Re-Deliver"
          >
            <SiGooglemessages
              size={19}
              className="wiggle text-teal-500"
            />
          </button>

          {/* Cancel Button */}
          {data.status === 'pending' && (
            <button
              className="group block"
              disabled={loadingOrders.includes(data._id) || isLoading}
              onClick={e => {
                e.stopPropagation()
                handleCancelOrders([data._id])
              }}
              title="Cancel"
            >
              <ImCancelCircle
                size={18}
                className="wiggle text-slate-300"
              />
            </button>
          )}

          {/* Delete Button */}
          <button
            className="group block"
            disabled={loadingOrders.includes(data._id) || isLoading}
            onClick={e => {
              e.stopPropagation()
              setConfirmType('delete')
              setIsOpenConfirmModal(true)
            }}
            title="Delete"
          >
            {loadingOrders.includes(data._id) ? (
              <RiDonutChartFill
                size={18}
                className="animate-spin text-slate-300"
              />
            ) : (
              <FaRegTrashAlt
                size={18}
                className="wiggle text-rose-500"
              />
            )}
          </button>
        </div>

        {isOpenMessageModal && (
          <div
            className="absolute left-0 top-0 z-20 flex h-full w-full items-center justify-center gap-2 rounded-md bg-teal-400 bg-opacity-80 p-21"
            onClick={e => {
              e.stopPropagation()
              setIsOpenMessageModal(false)
            }}
          >
            <Input
              id="message"
              label="Message"
              register={register}
              errors={errors}
              required
              type="text"
              icon={SiGooglemessages}
              className="w-full shadow-lg"
              onClick={e => e.stopPropagation()}
              onFocus={() => clearErrors('message')}
            />
          </div>
        )}
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={isOpenConfirmModal}
        setOpen={setIsOpenConfirmModal}
        title={`${confirmType.charAt(0).toUpperCase() + confirmType.slice(1)} Order`}
        content={`Are you sure that you want to ${confirmType} this order?`}
        onAccept={() =>
          confirmType === 'deliver'
            ? handleDeliverOrder()
            : confirmType === 're-deliver'
              ? handleReDeliverOrder()
              : handleDeleteOrders([data._id])
        }
        isLoading={loadingOrders.includes(data._id) || isLoading}
        color={confirmType === 'deliver' ? 'yellow' : confirmType === 're-deliver' ? 'sky' : 'rose'}
      />
    </>
  )
}

export default memo(OrderItem)
