'use client'

import Input from '@/components/Input'
import LoadingButton from '@/components/LoadingButton'
import AdminHeader from '@/components/admin/AdminHeader'
import { useAppDispatch, useAppSelector } from '@/libs/hooks'
import { setLoading } from '@/libs/reducers/modalReducer'
import { ICategory } from '@/models/CategoryModel'
import { IProduct } from '@/models/ProductModel'
import { addFlashSaleApi, getAllProductsApi, getForceAllProductsApi } from '@/requests'
import moment from 'moment'
import Image from 'next/image'
import { useCallback, useEffect, useState } from 'react'
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { FaPause, FaPlay } from 'react-icons/fa6'
import { IoReload } from 'react-icons/io5'

import { MdNumbers } from 'react-icons/md'
import { RiCharacterRecognitionLine } from 'react-icons/ri'

function AddFlashSalePage() {
  // hooks
  const dispatch = useAppDispatch()
  const isLoading = useAppSelector(state => state.modal.isLoading)

  // states
  const [products, setProducts] = useState<IProduct[]>([])
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [timeType, setTimeType] = useState<'loop' | 'once'>('loop')

  // form
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    setError,
    reset,
    clearErrors,
  } = useForm<FieldValues>({
    defaultValues: {
      type: 'percentage',
      value: '',
      begin: moment().local().format('YYYY-MM-DDTHH:mm'),
      expire: '',
      timeType: 'loop',
      duration: 120,
    },
  })

  // MARK: Get Data
  // get all products to apply
  useEffect(() => {
    const getAllProducts = async () => {
      try {
        // send request to server
        const { products } = await getForceAllProductsApi()

        // categorize products
        const categorizedProductsObj = products.reduce((acc: any, product: IProduct) => {
          const category: ICategory = product.category as ICategory
          if (!acc[category.title]) {
            acc[category.title] = []
          }
          acc[category.title].push(product)
          return acc
        }, {})

        const categorizedProducts = Object.values(categorizedProductsObj).flat() as IProduct[]

        // set products to state
        setProducts(categorizedProducts)
      } catch (err: any) {
        console.log(err)
        toast.error(err.message)
      }
    }
    getAllProducts()
  }, [])

  // validate form
  const handleValidate: SubmitHandler<FieldValues> = useCallback(
    data => {
      let isValid = true

      // if type if percentage, value must have % at the end
      if (data.type === 'percentage' && !data.value.endsWith('%')) {
        setError('value', { type: 'manual', message: 'Value must have %' })
        isValid = false
      }

      // if type if percentage, value have '%' at the end and must be number
      if (data.type === 'percentage' && isNaN(Number(data.value.replace('%', '')))) {
        setError('value', { type: 'manual', message: 'Value must be number' })
        isValid = false
      }

      // if type if fixed-reduce, value must be number
      if (data.type !== 'percentage' && isNaN(Number(data.value))) {
        setError('value', { type: 'manual', message: 'Value must be number' })
        isValid = false
      }

      // if time type is loop, duration must be > 0
      if (data.timeType === 'loop' && data.duration <= 0) {
        setError('duration', { type: 'manual', message: 'Duration must be > 0' })
        isValid = false
      }

      // if expire is less than begin
      if (new Date(data.expire).getTime() <= new Date(data.begin).getTime()) {
        setError('expire', { type: 'manual', message: 'Expire must be > begin' })
        isValid = false
      }

      return isValid
    },
    [setError]
  )

  // MARK: Submit
  // handle send request to server to add flash sale
  const onSubmit: SubmitHandler<FieldValues> = async data => {
    if (!handleValidate(data)) return

    // set loading
    dispatch(setLoading(true))

    try {
      // send request to server
      const { message } = await addFlashSaleApi({
        ...data,
        appliedProducts: selectedProducts,
      })

      // show success message
      toast.success(message)

      // reset
      reset()
      setSelectedProducts([])

      // update products
      const { products } = await getAllProductsApi()
      setProducts(products)
    } catch (err: any) {
      console.log(err)
      toast.error(err.message)
    } finally {
      dispatch(setLoading(false))
    }
  }

  return (
    <div className="mx-auto max-w-1200">
      {/* MARK: Admin Header */}
      <AdminHeader
        title="Add Flash Sale"
        backLink="/admin/flash-sale/all"
      />

      <div className="mt-5">
        {/* Type */}
        <Input
          id="type"
          label="Type"
          disabled={isLoading}
          register={register}
          errors={errors}
          required
          type="select"
          onFocus={() => clearErrors('type')}
          options={[
            {
              label: 'Percentage',
              value: 'percentage',
              selected: true,
            },
            {
              label: 'Fixed-Reduce',
              value: 'fixed-reduce',
              selected: false,
            },
            {
              label: 'Fixed',
              value: 'fixed',
              selected: false,
            },
          ]}
          icon={RiCharacterRecognitionLine}
          className="mb-5"
        />

        {/* Value */}
        <Input
          id="value"
          label="Value"
          disabled={isLoading}
          register={register}
          errors={errors}
          required
          type="text"
          icon={MdNumbers}
          className="mb-5"
          onFocus={() => clearErrors('value')}
        />

        {/* Begin */}
        <Input
          id="begin"
          label="Begin"
          disabled={isLoading}
          register={register}
          errors={errors}
          required
          type="datetime-local"
          minDate={moment().local().format('YYYY-MM-DDTHH:mm')}
          icon={FaPlay}
          className="mb-5"
          onFocus={() => clearErrors('begin')}
        />

        {/* MARK: Time */}
        <div className="grid-col-1 mb-5 grid gap-5 lg:grid-cols-2">
          {/* Time Type */}
          <Input
            id="timeType"
            label="Time Type"
            disabled={isLoading}
            register={register}
            errors={errors}
            required
            type="select"
            onFocus={() => clearErrors('timeType')}
            onChange={e => {
              setValue('timeType', e.target.value)
              setTimeType(e.target.value as 'loop' | 'once')
            }}
            options={[
              {
                label: 'Loop',
                value: 'loop',
                selected: true,
              },
              {
                label: 'Once',
                value: 'once',
                selected: false,
              },
            ]}
            icon={RiCharacterRecognitionLine}
          />

          {timeType === 'loop' ? (
            // Duration
            <Input
              id="duration"
              label="Duration"
              disabled={isLoading}
              register={register}
              errors={errors}
              required
              type="number"
              icon={IoReload}
              onFocus={() => clearErrors('duration')}
            />
          ) : (
            // Expire
            <Input
              id="expire"
              label="Expire"
              disabled={isLoading}
              register={register}
              errors={errors}
              required
              type="datetime-local"
              icon={FaPause}
              onFocus={() => clearErrors('expire')}
            />
          )}
        </div>

        {/* MARK: Apply */}
        {/* Ready to apply products */}
        <p className="mb-1 text-xl font-semibold text-white">Select Products</p>
        <div className="mb-5 flex max-h-[300px] flex-wrap gap-2 overflow-y-auto rounded-lg bg-white p-3">
          {products.map(product => (
            <div
              className={`trans-200 flex max-w-[250px] cursor-pointer items-center gap-2 rounded-lg border-2 border-slate-300 px-2 py-1 ${
                selectedProducts.includes(product._id)
                  ? 'border-white bg-secondary text-white'
                  : product.flashSale
                    ? 'bg-slate-200'
                    : ''
              }`}
              title={product.title}
              onClick={() =>
                selectedProducts.includes(product._id)
                  ? setSelectedProducts(prev => prev.filter(id => id !== product._id))
                  : setSelectedProducts(prev => [...prev, product._id])
              }
              key={product._id}
            >
              <Image
                className="aspect-video rounded-md border-2 border-white"
                src={product.images[0]}
                height={60}
                width={60}
                alt="thumbnail"
              />
              <span className="line-clamp-1 block text-ellipsis text-nowrap text-sm">
                {product.title}
              </span>
            </div>
          ))}
        </div>

        {/* MARK: Add Button */}
        <LoadingButton
          className="trans-200 rounded-lg bg-secondary px-4 py-2 font-semibold text-white hover:bg-primary"
          onClick={handleSubmit(onSubmit)}
          text="Add"
          isLoading={isLoading}
        />
      </div>
    </div>
  )
}

export default AddFlashSalePage
