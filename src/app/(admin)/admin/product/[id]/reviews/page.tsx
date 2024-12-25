'use client'

import ConfirmDialog from '@/components/ConfirmDialog'
import Input from '@/components/Input'
import Pagination from '@/components/Pagination'
import AddReview from '@/components/admin/AddReview'
import AdminHeader from '@/components/admin/AdminHeader'
import AdminMeta from '@/components/admin/AdminMeta'
import ReviewItem from '@/components/admin/ReviewItem'
import { useAppDispatch } from '@/libs/hooks'
import { setPageLoading } from '@/libs/reducers/modalReducer'
import { IProduct } from '@/models/ProductModel'
import { IReview } from '@/models/ReviewModel'
import {
  changeReviewStatusApi,
  deleteReviewsApi,
  getForceAllProductReviewsApi,
  syncProductReviewsApi,
} from '@/requests'
import { handleQuery } from '@/utils/handleQuery'
import { Rating } from '@mui/material'
import { usePathname, useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { FaSearch, FaSort, FaStar, FaSyncAlt } from 'react-icons/fa'

function AllProductReviewsPage({
  params: { id: productId },
  searchParams,
}: {
  params: { id: string }
  searchParams?: { [key: string]: string[] | string }
}) {
  // store
  const dispatch = useAppDispatch()
  const pathname = usePathname()
  const router = useRouter()

  // states
  const [product, setProduct] = useState<IProduct | null>(null)
  const [reviews, setReviews] = useState<IReview[]>([])
  const [amount, setAmount] = useState<number>(0)
  const [selectedReviews, setSelectedReviews] = useState<string[]>([])
  const [stars, setStarts] = useState<number[]>([])
  const [starShowed, setStarShowed] = useState<number>(0)
  const [page, setPage] = useState<number>(1)
  const [sts, setSts] = useState<number[]>([5, 4, 3, 2, 1])
  const [selectedFilterStars, setSelectedFilterStars] = useState<number[]>([])

  // loading and confirming
  const [openAddReview, setOpenAddReview] = useState<boolean>(false)
  const [syncing, setSyncing] = useState<boolean>(false)
  const [loadingReviews, setLoadingReviews] = useState<string[]>([])
  const [isOpenConfirmModal, setIsOpenConfirmModal] = useState<boolean>(false)

  // values
  const itemPerPage = 50

  // Form
  const defaultValues = useMemo<FieldValues>(
    () => ({
      search: '',
      sort: 'createdAt|-1',
      status: '',
      rating: '',
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

  // get all product reviews
  useEffect(() => {
    // get all products
    const getAllProductReviews = async () => {
      const query = handleQuery(searchParams)

      // start page loading
      dispatch(setPageLoading(true))

      try {
        // send request to server to get all product reviews
        const { product, reviews, amount, stars } = await getForceAllProductReviewsApi(productId, query)

        // update states
        setProduct(product)
        setAmount(amount)
        setReviews(prev => (page > 1 ? [...prev, ...reviews] : reviews))
        setStarts(stars)

        // sync search params with states
        setSelectedFilterStars(
          []
            .concat((searchParams?.rating || [5, 4, 3, 2, 1].map((star: number) => star)) as [])
            .map(rating => +rating)
        )
        setValue('sort', searchParams?.sort || getValues('sort'))
        setValue('status', searchParams?.status || getValues('status'))
      } catch (err: any) {
        console.log(err)
        toast.error(err.message)
      } finally {
        // stop page loading
        dispatch(setPageLoading(false))
      }
    }
    getAllProductReviews()
  }, [dispatch, setValue, getValues, searchParams, productId, page, starShowed, sts])

  // change review status
  const handleChangeReviewStatus = useCallback(
    async (ids: string[], status: 'show' | 'hide' | 'pinned') => {
      try {
        // change status
        const { message } = await changeReviewStatusApi(ids, status)

        // update review status
        setReviews(prev =>
          prev.map(review =>
            ids.includes(review._id)
              ? {
                  ...review,
                  status,
                }
              : review
          )
        )

        // show success message
        toast.success(message)
      } catch (err: any) {
        toast.error(err.message)
        console.log(err)
      }
    },
    []
  )

  // handle sync review
  const handleSyncReview = useCallback(async () => {
    // start syncing
    setSyncing(true)

    try {
      // send request to server
      const { syncedProduct, message } = await syncProductReviewsApi(productId)

      // update product
      setProduct(syncedProduct)

      // show success message
      toast.success(message)
    } catch (err: any) {
      console.log(err)
      toast.error(err.message)
    } finally {
      // stop syncing
      setSyncing(false)
    }
  }, [productId])

  // delete reviews
  const handleDeleteReviews = useCallback(
    async (ids: string[]) => {
      setLoadingReviews(ids)

      try {
        // send request to server
        const { deletedReviews, message } = await deleteReviewsApi(productId, ids)

        // remove deleted products from state
        setReviews(prev =>
          prev.filter(
            product => !deletedReviews.map((product: IProduct) => product._id).includes(product._id)
          )
        )

        // show success message
        toast.success(message)
      } catch (err: any) {
        console.log(err)
        toast.error(err.message)
      } finally {
        setLoadingReviews([])
        setSelectedReviews([])
      }
    },
    [productId]
  )

  // handle optimize filter
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
        rating: selectedFilterStars.length === sts.length ? [] : selectedFilterStars,
      }
    },
    [searchParams, defaultValues, selectedFilterStars, sts.length]
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

  // handle copy
  const handleCopy = useCallback((text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied: ' + text)
  }, [])

  // keyboard event
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Alt + A (Select All)
      if (e.altKey && e.key === 'a') {
        e.preventDefault()
        setSelectedReviews(prev =>
          prev.length === reviews.length ? [] : reviews.map(product => product._id)
        )
      }

      // Alt + Delete (Delete)
      if (e.altKey && e.key === 'Delete') {
        e.preventDefault()
        setIsOpenConfirmModal(true)
      }
    }

    // Add the event listener
    window.addEventListener('keydown', handleKeyDown)

    // Remove the event listener on cleanup
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleFilter, handleResetFilter, reviews, handleSubmit])

  if (!product) return null

  return (
    <div className="w-full">
      {/* Top & Pagination */}
      <AdminHeader
        title="All Reviews"
        backLink="/admin/product/all"
      />
      <Pagination
        searchParams={searchParams}
        amount={amount}
        itemsPerPage={itemPerPage}
      />

      {/* Filter */}
      <AdminMeta
        handleFilter={handleSubmit(handleFilter)}
        handleResetFilter={handleResetFilter}
      >
        {/* Search */}
        <div className="col-span-12 flex flex-col md:col-span-6">
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

        {/* Star Selection */}
        <div className="col-span-12 flex max-h-[228px] flex-wrap items-end justify-end gap-1 overflow-auto md:col-span-6 md:max-h-[152px] lg:max-h-[152px]">
          <div
            className={`trans-200 h-[34px] max-w-60 cursor-pointer select-none overflow-hidden text-ellipsis text-nowrap rounded-md border px-2 leading-[34px] ${
              5 === selectedFilterStars.length
                ? 'border-dark-100 bg-dark-100 text-white'
                : 'border-slate-300'
            }`}
            title="All Types"
            onClick={() => setSelectedFilterStars(5 === selectedFilterStars.length ? [] : sts)}
          >
            All
          </div>
          {sts.map(star => (
            <div
              className={`trans-200 flex h-[34px] max-w-60 cursor-pointer select-none items-center gap-1 overflow-hidden text-ellipsis text-nowrap rounded-md border px-2 leading-[34px] ${
                selectedFilterStars.includes(star)
                  ? 'border-secondary bg-secondary text-white'
                  : 'border-slate-300'
              }`}
              title={star + ''}
              key={star}
              onClick={
                selectedFilterStars.includes(star)
                  ? () => setSelectedFilterStars(prev => prev.filter(s => s !== star))
                  : () => setSelectedFilterStars(prev => [...prev, star])
              }
            >
              {star} <FaStar className="-mt-0.5" />
              <span className="text-xs font-semibold text-slate-300">({stars[5 - star]})</span>
            </div>
          ))}
        </div>

        {/* Select Filter */}
        <div className="col-span-12 flex flex-wrap items-center justify-end gap-3 md:col-span-8">
          {/* Sort */}
          <Input
            id="sort"
            label="Sort"
            disabled={false}
            register={register}
            errors={errors}
            icon={FaSort}
            type="select"
            onFocus={() => clearErrors('sort')}
            options={[
              {
                value: 'createdAt|-1',
                label: 'Newest',
              },
              {
                value: 'createdAt|1',
                label: 'Oldest',
              },
              {
                value: 'updatedAt|-1',
                label: 'Latest',
                selected: true,
              },
              {
                value: 'updatedAt|1',
                label: 'Earliest',
              },
            ]}
          />

          {/* Status */}
          <Input
            id="status"
            label="Status"
            disabled={false}
            register={register}
            errors={errors}
            icon={FaSort}
            type="select"
            onFocus={() => clearErrors('status')}
            options={[
              {
                value: '',
                label: 'All',
                selected: true,
              },
              {
                value: 'show',
                label: 'Show',
              },
              {
                value: 'hide',
                label: 'Hide',
              },
            ]}
            className="min-w-[104px]"
          />
        </div>

        {/* Action Buttons */}
        <div className="col-span-12 flex flex-wrap items-center justify-end gap-2">
          {/* Select All Button */}
          <button
            className="trans-200 rounded-lg border border-sky-400 px-3 py-2 text-sky-400 hover:bg-sky-400 hover:text-white"
            onClick={() =>
              setSelectedReviews(selectedReviews.length > 0 ? [] : reviews.map(review => review._id))
            }
          >
            {selectedReviews.length > 0 ? 'Unselect All' : 'Select All'}
          </button>

          {/* Show Many Reviews */}
          {!!selectedReviews.length &&
            selectedReviews.some(
              id => reviews.find((review: any) => review._id === id)?.status !== 'show'
            ) && (
              <button
                className="trans-200 rounded-lg border border-green-300 px-3 py-2 text-green-300 hover:bg-green-300 hover:text-white"
                onClick={() => handleChangeReviewStatus(selectedReviews, 'show')}
              >
                Show
              </button>
            )}

          {/* Show Many Reviews */}
          {!!selectedReviews.length &&
            selectedReviews.some(
              id => reviews.find((review: any) => review._id === id)?.status !== 'hide'
            ) && (
              <button
                className="trans-200 rounded-lg border border-orange-300 px-3 py-2 text-orange-300 hover:bg-orange-300 hover:text-white"
                onClick={() => handleChangeReviewStatus(selectedReviews, 'hide')}
              >
                Hide
              </button>
            )}

          {/* Delete Many Button */}
          {!!selectedReviews.length && (
            <button
              className="trans-200 rounded-lg border border-red-500 px-3 py-2 text-red-500 hover:bg-red-500 hover:text-white"
              onClick={() => setIsOpenConfirmModal(true)}
            >
              Delete
            </button>
          )}
        </div>
      </AdminMeta>

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={isOpenConfirmModal}
        setOpen={setIsOpenConfirmModal}
        title="Delete Reviews"
        content="Are you sure that you want to delete these reviews?"
        onAccept={() => handleDeleteReviews(selectedReviews)}
        isLoading={loadingReviews.length > 0}
      />

      {/* Amount */}
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 px-3 py-3 text-light md:justify-between">
        <div className="flex items-center gap-3">
          <button
            className="trans-200 group block rounded-md bg-yellow-500 px-2 py-1.5 text-xs font-semibold text-dark shadow-lg hover:bg-secondary hover:text-light"
            onClick={_ => setOpenAddReview(prev => !prev)}
            disabled={syncing}
            title="Add Review"
          >
            Add
          </button>

          <button
            className="group block"
            onClick={e => handleSyncReview()}
            disabled={syncing}
            title="Sync"
          >
            <FaSyncAlt
              size={16}
              className={`wiggle ${syncing ? 'animate-spin text-slate-300' : 'text-yellow-300'}`}
            />
          </button>
          <h1
            className="cursor-pointer text-xl font-semibold"
            onClick={() => handleCopy(product._id)}
          >
            {product.title}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <p className="text-3xl font-semibold">{(product.rating || 5).toFixed(1)}</p>
          <Rating
            size="small"
            readOnly
            value={4.85}
          />
          <p className="text-sm text-slate-200">
            {product.reviewAmount < 0 ? 0 : product.reviewAmount} reviews
          </p>
        </div>

        <div className="p-3 text-right text-sm font-semibold text-white">
          {Math.min(itemPerPage * +(searchParams?.page || 1), amount)}/{amount} review
          {amount > 1 ? 's' : ''}
        </div>
      </div>

      {/* MAIN LIST */}
      <div className="flex flex-col gap-2">
        <AddReview
          open={openAddReview}
          setOpen={setOpenAddReview}
          setReviews={setReviews}
        />

        {reviews.map(review => (
          <ReviewItem
            data={review}
            loadingReviews={loadingReviews}
            selectedReviews={selectedReviews}
            setSelectedReviews={setSelectedReviews}
            handleChangeReviewStatus={handleChangeReviewStatus}
            handleDeleteReviews={handleDeleteReviews}
            key={review._id}
          />
        ))}
      </div>
    </div>
  )
}

export default AllProductReviewsPage
