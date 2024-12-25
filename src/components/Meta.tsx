'use client'

import { ICategory } from '@/models/CategoryModel'
import { ITag } from '@/models/TagModel'
import { handleQuery } from '@/utils/handleQuery'
import { formatPrice } from '@/utils/number'
import { usePathname, useRouter } from 'next/navigation'
import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form'
import { BiReset } from 'react-icons/bi'
import { FaFilter, FaSearch, FaSort } from 'react-icons/fa'
import Input from './Input'

interface MetaProps {
  title?: string
  searchParams: { [key: string]: string[] | string } | undefined
  type: 'tag' | 'ctg' | 'flash-sale' | 'best-seller' | 'search'
  items?: ITag[] | ICategory[]
  chops?: { [key: string]: number } | null
  hideSearch?: boolean
  hidePrice?: boolean
  hideStock?: boolean
  className?: string
}

function Meta({
  title,
  type,
  searchParams,
  items = [],
  chops,
  hidePrice,
  hideStock,
  hideSearch,
  className = '',
}: MetaProps) {
  // hooks
  const pathname = usePathname()
  const router = useRouter()

  // states
  const [selectedFilterItems, setSelectedFilterItems] = useState<string[]>(
    [].concat((searchParams?.[type] || items.map(item => item.slug)) as []).map(type => type)
  )

  // values
  const minPrice: number = chops?.minPrice || 0
  const maxPrice: number = chops?.maxPrice || 0
  const [price, setPrice] = useState<number>(
    searchParams?.price ? +searchParams.price : chops?.maxPrice || 0
  )
  const minStock: number = chops?.minStock || 0
  const maxStock: number = chops?.maxStock || 0
  const [stock, setStock] = useState<number>(
    searchParams?.stock ? +searchParams.stock : chops?.maxStock || 0
  )

  // form
  const defaultValues = useMemo<FieldValues>(
    () => ({
      search: '',
      sort: 'updatedAt|-1',
    }),
    []
  )
  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
    setValue,
    reset,
    clearErrors,
  } = useForm<FieldValues>({
    defaultValues,
  })

  // sync search params with states
  useEffect(() => {
    // sync search params with states
    setValue('search', searchParams?.search || getValues('search'))
    setValue('sort', searchParams?.sort || getValues('sort'))
  }, [getValues, searchParams, setValue])

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

      return {
        ...data,
        price: price === maxPrice ? [] : [price.toString()],
        stock: stock === maxStock ? [] : [stock.toString()],
        [type]: selectedFilterItems.length === items.length ? [] : selectedFilterItems,
      }
    },
    [
      items.length,
      maxPrice,
      maxStock,
      price,
      searchParams,
      selectedFilterItems,
      stock,
      type,
      defaultValues,
    ]
  )

  // handle submit filter
  const handleFilter: SubmitHandler<FieldValues> = useCallback(
    async data => {
      const params: any = handleOptimizeFilter(data)

      // handle query
      const query = handleQuery({
        ...searchParams,
        ...params,
      })

      // push to router
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
  }, [handleFilter, handleResetFilter, handleSubmit])

  return (
    <div
      className={`no-scrollbar w-full self-end overflow-auto rounded-medium bg-white p-21 text-dark shadow-md transition-all duration-300 ${className}`}
    >
      {/* MARK: Title */}
      <h2 className="mb-21 text-2xl font-semibold">{title}</h2>

      {/* MARK: Filter */}
      <div className="grid grid-cols-12 gap-21">
        {/* Search */}
        {!hideSearch && (
          <div className="col-span-12 flex flex-col md:col-span-4">
            <Input
              id="search"
              className="md:max-w-[450px]"
              label="Search"
              disabled={false}
              register={register}
              errors={errors}
              type="text"
              icon={FaSearch}
              onFocus={() => clearErrors('search')}
            />
          </div>
        )}

        {/* Price */}
        {!hidePrice && (
          <div className="col-span-12 flex flex-col md:col-span-4">
            <label htmlFor="price">
              <span className="font-bold">Giá: </span>
              <span>{formatPrice(price)}</span> - <span>{formatPrice(maxPrice)}</span>
            </label>
            <input
              id="price"
              className="input-range my-2 h-2 rounded-lg bg-slate-200"
              placeholder=" "
              disabled={false}
              type="range"
              min={minPrice}
              max={maxPrice}
              value={price}
              onChange={e => setPrice(+e.target.value)}
            />
          </div>
        )}

        {/* Stock */}
        {!hideStock && (
          <div className="col-span-12 flex flex-col md:col-span-4">
            <label htmlFor="stock">
              <span className="font-bold">Còn lại: </span>
              <span>{stock}</span> - <span>{maxStock}</span>
            </label>
            <input
              id="stock"
              className="input-range my-2 h-2 rounded-lg bg-slate-200"
              placeholder=" "
              disabled={false}
              type="range"
              min={minStock}
              max={maxStock}
              value={stock}
              onChange={e => setStock(+e.target.value)}
            />
          </div>
        )}

        {/* MARK: Item Selection */}
        {!!items.length && (
          <div className="col-span-12 flex max-h-[228px] flex-wrap items-end justify-end gap-1 overflow-auto md:max-h-[152px] lg:max-h-[152px]">
            <div
              className={`trans-200 h-[34px] max-w-60 cursor-pointer select-none overflow-hidden text-ellipsis text-nowrap rounded-md border px-2 leading-[34px] ${
                items.length === selectedFilterItems.length
                  ? 'border-dark-100 bg-dark-100 text-white'
                  : 'border-slate-300 bg-slate-200'
              }`}
              title="All Types"
              onClick={() =>
                setSelectedFilterItems(
                  items.length === selectedFilterItems.length ? [] : items.map(tag => tag.slug)
                )
              }
            >
              Tất cả
            </div>
            {items.map(item => (
              <div
                className={`trans-200 h-[34px] max-w-60 cursor-pointer select-none overflow-hidden text-ellipsis text-nowrap rounded-md border px-2 leading-[34px] ${
                  selectedFilterItems.includes(item.slug)
                    ? 'border-secondary bg-secondary text-white'
                    : 'border-slate-300'
                }`}
                title={item.title}
                key={item.slug}
                onClick={
                  selectedFilterItems.includes(item.slug)
                    ? () => setSelectedFilterItems(prev => prev.filter(id => id !== item.slug))
                    : () => setSelectedFilterItems(prev => [...prev, item.slug])
                }
              >
                {item.title}
              </div>
            ))}
          </div>
        )}

        {/* MARK: Select Filter */}
        <div className="col-span-12 flex flex-wrap items-center justify-end gap-3 md:col-span-8">
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

        {/* MARK: Filter Buttons */}
        <div className="col-span-12 flex items-center justify-end gap-2 md:col-span-4">
          {/* Filter Button */}
          <button
            className="trans-200 group flex cursor-pointer items-center text-nowrap rounded-md bg-primary px-3 py-2 text-[16px] font-semibold text-white hover:bg-secondary"
            title="Alt + Enter"
            onClick={handleSubmit(handleFilter)}
          >
            Lọc
            <FaFilter
              size={14}
              className="wiggle ml-1"
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
  )
}

export default memo(Meta)
