'use client'

import CartItem from '@/components/CartItem'
import Input from '@/components/Input'
import { useAppDispatch } from '@/libs/hooks'
import { setPageLoading } from '@/libs/reducers/modalReducer'
import { IAccount } from '@/models/AccountModel'
import { IOrder } from '@/models/OrderModel'
import { IVoucher } from '@/models/VoucherModel'
import { editOrderApi, getOrderApi } from '@/requests'
import { formatPrice } from '@/utils/number'
import { formatTime } from '@/utils/time'
import moment from 'moment'
import { Fragment, useCallback, useEffect, useMemo, useState } from 'react'
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { FaCopy, FaMinus, FaPlus, FaSave, FaTrash } from 'react-icons/fa'
import { IoIosHelpCircle } from 'react-icons/io'
import { MdCancel, MdDateRange, MdEdit } from 'react-icons/md'
import { RiCheckboxMultipleBlankLine, RiDonutChartFill } from 'react-icons/ri'

function AdminOrderDetailPage({ params: { code } }: { params: { code: string } }) {
  // hooks
  const dispatch = useAppDispatch()

  // states
  const [order, setOrder] = useState<IOrder | null>(null)
  const [editMode, setEditMode] = useState<boolean>(false)
  const [isSaving, setIsSaving] = useState<boolean>(false)

  const totalQuantity: number = useMemo(
    () => order?.items.reduce((total, item) => total + item.quantity, 0),
    [order]
  )

  // form
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    clearErrors,
    reset,
  } = useForm<FieldValues>({
    defaultValues: {
      createdAt: '',
      email: '',
      status: '',
      total: 0,
    },
  })

  // MARK: Get Data
  // get order
  useEffect(() => {
    const getOrder = async () => {
      // start page loading
      dispatch(setPageLoading(true))

      try {
        const { order } = await getOrderApi(code)

        // set order to state
        setOrder(order)

        // set form values
        reset({
          createdAt: moment(order.createdAt).local().format('YYYY-MM-DDTHH:mm'),
          email: order.email,
          status: order.status,
          total: order.total,
        })
      } catch (err: any) {
        console.log(err)
        toast.error(err.message)
      } finally {
        // stop page loading
        dispatch(setPageLoading(false))
      }
    }

    if (code) {
      getOrder()
    }
  }, [dispatch, reset, code])

  // MARK: Save Order Submition
  const onSubmit: SubmitHandler<FieldValues> = useCallback(
    async data => {
      if (order) {
        setIsSaving(true)

        try {
          const { updatedOrder, message } = await editOrderApi(order?._id, { ...order, ...data })

          // updated order staet
          setOrder(updatedOrder)

          // show success
          toast.success(message)

          // turn off edit mode
          setEditMode(false)
        } catch (err: any) {
          toast.error(err.message)
          console.log(err)
        } finally {
          // reset loading state
          setIsSaving(false)
        }
      }
    },
    [order]
  )

  // handle change item quantity
  const handleChangeItemQuantity = useCallback((item: any, value: 1 | -1) => {
    setOrder(
      (prev: any) =>
        ({
          ...prev,
          items: prev.items.map((i: any) =>
            i._id === item._id ? { ...i, quantity: i.quantity + value <= 1 ? 1 : i.quantity + value } : i
          ),
        }) as IOrder
    )
  }, [])

  // handle remove item
  const handleRemoveItem = useCallback((removeItem: any) => {
    setOrder(
      (prev: any) =>
        ({
          ...prev,
          items: prev.items.filter((item: any) => item._id !== removeItem._id),
        }) as IOrder
    )
  }, [])

  // handle copy
  const handleCopy = useCallback((text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Đã sao chép: ' + text)
  }, [])

  return (
    <div className="rounded-medium bg-white px-4 py-21 shadow-medium-light">
      <h1 className="mb-5 flex items-center justify-between font-body text-3xl font-semibold tracking-wide">
        <p>
          Order Detail: <span className="font-sans text-secondary">{order?.code}</span>
        </p>
        <div className="flex items-center justify-center gap-2">
          {editMode ? (
            <>
              <button
                className="trans-200 group flex h-9 items-center justify-center rounded-md border-2 border-slate-400 px-2 text-slate-400 hover:bg-slate-400 hover:text-white"
                onClick={() => setEditMode(false)}
              >
                <MdCancel
                  size={20}
                  className="wiggle"
                />
              </button>
              <button
                className={`trans-200 group flex h-9 items-center justify-center rounded-md border-2 px-2 hover:bg-rose-500 hover:text-white ${
                  isSaving
                    ? 'pointer-events-none border-slate-400 text-slate-400'
                    : 'border-rose-500 text-rose-500'
                }`}
                onClick={handleSubmit(onSubmit)}
              >
                {isSaving ? (
                  <RiDonutChartFill
                    size={20}
                    className="animate-spin"
                  />
                ) : (
                  <FaSave
                    size={20}
                    className="wiggle"
                  />
                )}
              </button>
            </>
          ) : (
            <button
              className="trans-200 group flex h-9 items-center justify-center rounded-md border-2 border-secondary px-2 text-secondary hover:bg-secondary hover:text-white"
              onClick={() => setEditMode(true)}
            >
              <MdEdit
                size={20}
                className="wiggle"
              />
            </button>
          )}
        </div>
      </h1>

      {/* MARK: Info */}
      <div className="mt-5 grid grid-cols-1 items-start gap-2 md:grid-cols-2">
        <div className="trans-200 col-span-1 rounded-xl px-4 py-2 shadow-lg hover:tracking-wide">
          {!editMode ? (
            <>
              <span className="font-semibold">Date: </span>
              {order && <span className="">{formatTime(order.createdAt)}</span>}
            </>
          ) : (
            <Input
              id="createdAt"
              label="Date"
              disabled={isSaving}
              register={register}
              errors={errors}
              required
              type="datetime-local"
              icon={MdDateRange}
              className="my-1"
              onFocus={() => clearErrors('createdAt')}
            />
          )}
        </div>
        <div className="trans-200 col-span-1 rounded-xl px-4 py-2 shadow-lg hover:tracking-wide">
          {!editMode ? (
            <>
              <span className="font-semibold">Status: </span>
              <span
                className={`font-semibold ${
                  order?.status === 'pending'
                    ? 'text-yellow-400'
                    : order?.status === 'done'
                      ? 'text-green-500'
                      : 'text-slate-400'
                }`}
              >
                {order?.status}
              </span>
            </>
          ) : (
            <Input
              id="status"
              label="Status"
              disabled={isSaving}
              register={register}
              errors={errors}
              icon={RiCheckboxMultipleBlankLine}
              type="select"
              onFocus={() => clearErrors('status')}
              options={[
                {
                  value: 'pending',
                  label: 'Pending',
                },
                {
                  value: 'done',
                  label: 'Done',
                },
                {
                  value: 'cancel',
                  label: 'Cancel',
                },
              ]}
            />
          )}
        </div>
        <div className="trans-200 col-span-1 rounded-xl px-4 py-2 shadow-lg hover:tracking-wide">
          {!editMode ? (
            <>
              <span className="font-semibold">Email: </span>
              <span className="text-sky-500">{order?.email}</span>
            </>
          ) : (
            <Input
              id="email"
              label="Email"
              disabled={isSaving}
              register={register}
              errors={errors}
              required
              type="email"
              icon={MdDateRange}
              className="my-1"
              onFocus={() => clearErrors('email')}
            />
          )}
        </div>
        <div className="trans-200 col-span-1 rounded-xl px-4 py-2 shadow-lg hover:tracking-wide">
          {!editMode ? (
            <>
              <span className="font-semibold">Total: </span>
              <span className="font-semibold text-secondary">{formatPrice(order?.total)}</span>
            </>
          ) : (
            <Input
              id="total"
              label="Total"
              disabled={isSaving}
              register={register}
              errors={errors}
              required
              type="total"
              icon={MdDateRange}
              className="my-1"
              onFocus={() => clearErrors('total')}
            />
          )}
        </div>
        {order?.voucherApplied && (
          <div className="trans-200 rounded-xl px-4 py-2 shadow-lg hover:tracking-wide">
            <span className="font-semibold">Voucher: </span>
            <span
              className="font-semibold text-slate-400"
              title={(order?.voucherApplied as IVoucher).desc}
            >
              {(order?.voucherApplied as IVoucher).code}
            </span>
          </div>
        )}
        {!!order?.discount && (
          <div className="trans-200 rounded-xl px-4 py-2 shadow-lg hover:tracking-wide">
            <span className="font-semibold">Giảm giá: </span>
            <span className="font-semibold text-secondary">{formatPrice(order?.discount)}</span>
          </div>
        )}
      </div>

      {/* Product */}
      <h3 className="mb-4 mt-6 text-2xl font-semibold">
        Product{totalQuantity > 1 ? 's' : ''} ({totalQuantity})
      </h3>

      {/* MARK: Items */}
      {order?.items.map(item => (
        <div
          className="relative mb-5 pl-21/2"
          key={item.product._id}
        >
          <div className="absolute left-0 top-1/2 h-[88%] w-px -translate-y-1/2 bg-slate-200" />

          <div className="relative rounded-medium border border-slate-300 p-21/2 shadow-lg">
            <CartItem
              cartItem={item}
              isCheckout
              localCartItem
              isOrderDetailProduct
            />

            {/* Adjustments */}
            {editMode && (
              <div className="absolute right-2 top-2 flex gap-2">
                {/* Decrease */}
                <button
                  className="trans-200 group flex h-6 items-center justify-center rounded-md border-2 border-secondary px-1 text-secondary hover:bg-secondary hover:text-white"
                  onClick={() => handleChangeItemQuantity(item, -1)}
                >
                  <FaMinus
                    size={12}
                    className="wiggle"
                  />
                </button>

                {/* Increase */}
                <button
                  className="trans-200 group flex h-6 items-center justify-center rounded-md border-2 border-secondary px-1 text-secondary hover:bg-secondary hover:text-white"
                  onClick={() => handleChangeItemQuantity(item, 1)}
                >
                  <FaPlus
                    size={12}
                    className="wiggle"
                  />
                </button>

                {/* Remove Button */}
                <button
                  className="trans-200 group flex h-6 items-center justify-center rounded-md border-2 border-rose-500 px-1 text-rose-500 hover:bg-rose-500 hover:text-white"
                  onClick={() => handleRemoveItem(item)}
                >
                  <FaTrash
                    size={12}
                    className="wiggle"
                  />
                </button>
              </div>
            )}
            {order.status === 'done' ? (
              item.accounts.map((account: IAccount) => (
                <Fragment key={account._id}>
                  <hr className="mb-3 mt-5" />

                  <div className="relative">
                    <button
                      className="group absolute right-1.5 top-1.5 z-10 rounded-md border bg-white p-1.5 text-slate-500"
                      onClick={e => {
                        e.stopPropagation()
                        handleCopy(account.info)
                      }}
                    >
                      <FaCopy
                        size={16}
                        className="wiggle"
                      />
                    </button>

                    <div className="relative mt-2 max-h-[200px] w-full overflow-auto whitespace-pre break-all rounded-xl border border-slate-300 p-4 font-body text-sm tracking-wide">
                      {account.info.split('\n').map((line, index) => (
                        <span
                          key={index}
                          className="block"
                        >
                          {line.split(' ').map((word, index) => (
                            <span
                              key={index}
                              className="inline-block cursor-pointer"
                              onClick={e => {
                                e.stopPropagation()
                                navigator.clipboard.writeText(word)
                                toast.success('Copied: ' + word)
                              }}
                            >
                              {word}{' '}
                            </span>
                          ))}
                        </span>
                      ))}
                    </div>
                  </div>
                </Fragment>
              ))
            ) : (
              <p
                className={`mt-3 text-center italic ${
                  order.status === 'pending' ? 'text-yellow-500' : 'text-slate-400'
                } border-t border-slate-200 pt-2`}
              >
                {order.status}
              </p>
            )}

            {order.status === 'done' && (
              <p className="mt-2 flex items-center gap-1 text-slate-500">
                <IoIosHelpCircle size={20} /> Ấn để sao chép từng phần
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default AdminOrderDetailPage
