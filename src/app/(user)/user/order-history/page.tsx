'use client'

import Input from '@/components/Input'
import OrderItem from '@/components/item/OrderItem'
import Pagination from '@/components/Pagination'
import { useAppDispatch } from '@/libs/hooks'
import { setPageLoading } from '@/libs/reducers/modalReducer'
import { IOrder } from '@/models/OrderModel'
import { getOrderHistoryApi } from '@/requests'
import { handleQuery } from '@/utils/handleQuery'
import { formatPrice } from '@/utils/number'
import { usePathname, useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { BiReset } from 'react-icons/bi'
import { BsThreeDots } from 'react-icons/bs'
import { FaCalendar, FaFilter, FaSearch, FaSort } from 'react-icons/fa'

function OrderHistoryPage({ searchParams }: { searchParams?: { [key: string]: string[] } }) {
  // hooks
  const dispatch = useAppDispatch()
  const pathname = usePathname()
  const router = useRouter()

  // states
  const [orders, setOrders] = useState<IOrder[]>([])
  const [amount, setAmount] = useState<number>(0)
  const [isShowFilter, setIsShowFilter] = useState<boolean>(false)

  // values
  const itemPerPage = 6
  const [minTotal, setMinTotal] = useState<number>(0)
  const [maxTotal, setMaxTotal] = useState<number>(0)
  const [total, setTotal] = useState<number>(0)

  // form
  const defaultValues = useMemo<FieldValues>(
    () => ({
      search: '',
      sort: 'updatedAt|-1',
      from: '',
      to: '',
    }),
    []
  )
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    clearErrors,
  } = useForm<FieldValues>({
    defaultValues,
  })

  // MARK: Get Data
  // get user's order
  useEffect(() => {
    const getOrderHistory = async () => {
      const query = handleQuery(searchParams)

      // start page loading
      dispatch(setPageLoading(true))

      try {
        // send request to server to get current user's orders
        const { orders, amount, chops } = await getOrderHistoryApi(query)

        // set to states
        setOrders(orders)
        setAmount(amount)

        // get min - max
        setMinTotal(chops.minTotal)
        setMaxTotal(chops.maxTotal)
        setTotal(searchParams?.total ? +searchParams.total : chops.maxTotal)
      } catch (err: any) {
        toast.error(err.message)
      } finally {
        // stop page loading
        dispatch(setPageLoading(false))
      }
    }
    getOrderHistory()
  }, [dispatch, searchParams])

  // MARK: Handlers
  // handle opimize filter
  const handleOptimizeFilter: SubmitHandler<FieldValues> = useCallback(
    data => {
      // reset page
      if (searchParams?.page) {
        delete searchParams.page
      }

      // loop through data to prevent filter default
      for (let key in data) {
        if (data[key] === defaultValues[key]) {
          if (!searchParams?.[key]) {
            delete data[key]
          } else {
            data[key] = ''
          }
        }
      }

      // from | to
      const { from, to, ...rest } = data
      const fromTo = (from || '') + '|' + (to || '')
      if (fromTo !== '|') {
        rest['from-to'] = fromTo
      }

      return { ...rest, total: total === maxTotal ? [] : [total.toString()] }
    },
    [searchParams, total, maxTotal, defaultValues]
  )

  // handle submit filter
  const handleFilter: SubmitHandler<FieldValues> = useCallback(
    async data => {
      const params: any = handleOptimizeFilter(data)

      // handle query
      const query = handleQuery({ ...searchParams, ...params })

      // push to new url
      router.push(pathname + query)
    },
    [handleOptimizeFilter, router, searchParams, pathname]
  )

  // handle reset filter
  const handleResetFilter = useCallback(() => {
    reset()
    router.push(pathname)
  }, [reset, router, pathname])

  // keyboard event
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Alt + F (Filter)
      if (e.altKey && e.key === 'f') {
        e.preventDefault()
        handleSubmit(handleFilter)()
      }

      // Alt + R (Reset)
      if (e.altKey && e.key === 'r') {
        e.preventDefault()
        handleResetFilter()
      }
    }

    // Add the event listener
    window.addEventListener('keydown', handleKeyDown)

    // Remove the event listener on cleanup
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleFilter, handleResetFilter, handleSubmit, reset])

  return (
    <div className="flex flex-col">
      <h1 className="mb-5 font-body text-3xl font-semibold tracking-wide">LỊCH SỬ MUA HÀNG CỦA TÔI</h1>

      {/* MARK: Filter */}
      {/* Open Filter */}
      <div className="flex justify-end">
        <button
          onClick={() => setIsShowFilter(!isShowFilter)}
          className="trans-200 group mb-3 ml-auto rounded-md bg-dark-100 px-3 py-[2px] text-white shadow-lg hover:bg-primary"
        >
          <BsThreeDots
            size={28}
            className="wiggle"
          />
        </button>
      </div>

      {/* Filter */}
      <div
        className={`no-scrollbar w-full self-end overflow-auto rounded-medium bg-dark-100 text-white shadow-md transition-all duration-300 ${
          isShowFilter
            ? 'opacity-1 max-h-[500px] max-w-full p-21 md:max-h-[300px]'
            : 'max-h-0 max-w-0 p-0 opacity-0'
        }`}
      >
        <div className="grid grid-cols-12 gap-21">
          {/* Search */}
          <div className="col-span-12 flex flex-col md:col-span-6">
            <Input
              className="md:max-w-[450px]"
              id="search"
              label="Tìm kiếm"
              disabled={false}
              register={register}
              errors={errors}
              type="text"
              icon={FaSearch}
              onFocus={() => clearErrors('search')}
            />
          </div>

          {/* Price */}
          <div className="col-span-12 flex flex-col md:col-span-6">
            <label htmlFor="total">
              <span className="font-bold">Tổng tiền: </span>
              <span>{formatPrice(total)}</span> - <span>{formatPrice(maxTotal)}</span>
            </label>
            <input
              id="total"
              className="input-range my-2 h-2 rounded-lg bg-slate-200"
              placeholder=" "
              disabled={false}
              type="range"
              min={minTotal || 0}
              max={maxTotal || 0}
              value={total}
              onChange={e => setTotal(+e.target.value)}
            />
          </div>

          {/* From To */}
          <div className="col-span-12 flex flex-wrap gap-2 sm:flex-nowrap lg:col-span-6">
            <Input
              id="from"
              label="Từ ngày"
              disabled={false}
              register={register}
              errors={errors}
              type="date"
              icon={FaCalendar}
              className="w-full"
              onFocus={() => clearErrors('from')}
            />

            <Input
              id="to"
              label="Đến ngày"
              disabled={false}
              register={register}
              errors={errors}
              type="date"
              icon={FaCalendar}
              className="w-full"
              onFocus={() => clearErrors('to')}
            />
          </div>

          {/* Select Filter */}
          <div className="col-span-12 flex flex-wrap items-center justify-end gap-3 md:col-span-6">
            {/* Sort */}
            <Input
              id="sort"
              label="Sắp xếp"
              disabled={false}
              register={register}
              errors={errors}
              icon={FaSort}
              type="select"
              onFocus={() => clearErrors('sort')}
              options={[
                {
                  value: 'createdAt|-1',
                  label: 'Mới nhất',
                },
                {
                  value: 'createdAt|1',
                  label: 'Cũ nhất',
                },
                {
                  value: 'updatedAt|-1',
                  label: 'Cập nhật mới nhất',
                  selected: true,
                },
                {
                  value: 'updatedAt|1',
                  label: 'Cập nhật cũ nhất',
                },
              ]}
            />
          </div>

          <div className="col-span-12 flex items-center justify-end gap-2">
            {/* Filter Button */}
            <button
              className="trans-200 group flex cursor-pointer items-center text-nowrap rounded-md bg-primary px-3 py-2 text-[16px] font-semibold text-white hover:bg-secondary"
              title="Alt + Enter"
              onClick={handleSubmit(handleFilter)}
            >
              Lọc
              <FaFilter
                size={14}
                className="wiggle ml-[6px]"
              />
            </button>

            {/* Reset Button */}
            <button
              className="trans-200 group flex cursor-pointer items-center text-nowrap rounded-md bg-slate-600 px-3 py-2 text-[16px] font-semibold text-white hover:bg-slate-800"
              title="Alt + R"
              onClick={handleResetFilter}
            >
              Đặt lại
              <BiReset
                size={22}
                className="wiggle ml-1"
              />
            </button>
          </div>
        </div>
      </div>

      {/* MARK: Amount */}
      <div className="p-3 text-right text-sm font-semibold text-dark">
        {Math.min(itemPerPage * +(searchParams?.page || 1), amount)}/{amount} đơn hàng
      </div>

      {/* MARK: Items */}
      {orders.map((order, index) => (
        <OrderItem
          order={order}
          className={index !== 0 ? 'mt-4' : ''}
          key={order._id}
        />
      ))}

      {/* MARK: Pagination */}
      <Pagination
        searchParams={searchParams}
        amount={amount}
        itemsPerPage={itemPerPage}
        className="mt-11 rounded-lg bg-dark-100 p-[6px]"
      />
    </div>
  )
}

export default OrderHistoryPage
