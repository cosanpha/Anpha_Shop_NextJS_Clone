'use client'

import { IReview } from '@/models/ReviewModel'
import { addFakeReviewApi } from '@/requests'
import { Rating } from '@mui/material'
import moment from 'moment'
import { useParams } from 'next/navigation'
import { Dispatch, memo, SetStateAction, useCallback, useState } from 'react'
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { FaSave } from 'react-icons/fa'
import { LuScrollText } from 'react-icons/lu'
import { MdCancel } from 'react-icons/md'
import { RiDonutChartFill } from 'react-icons/ri'
import Input from '../Input'

interface AddReviewProps {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
  setReviews: Dispatch<SetStateAction<IReview[]>>
  className?: string
}

function AddReview({ open, setOpen, setReviews, className = '' }: AddReviewProps) {
  // hook
  const { id: productId } = useParams()

  // states
  const [rating, setRating] = useState<number>(5)
  const [loading, setLoading] = useState(false)

  // form
  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
    setValue,
    reset,
    watch,
    clearErrors,
  } = useForm<FieldValues>({
    defaultValues: {
      rating: 5,
      content: '',
      reviewDate: moment(new Date()).local().format('YYYY-MM-DD'),
      image: '',
      displayName: '',
      status: 'show',
    },
  })

  // MARK: Add Review
  const onSubmit: SubmitHandler<FieldValues> = useCallback(
    async data => {
      // start loading
      setLoading(true)

      try {
        const { review, message } = await addFakeReviewApi(productId as string, {
          image: data.image,
          displayName: data.displayName,
          rating: data.rating,
          content: data.content,
          reviewDate: data.reviewDate,
          status: data.status,
        })

        // update reviews state
        setReviews(prev => [review, ...prev])

        // show success message
        toast.success(message)

        // reset form
        reset()
        setRating(5)
      } catch (err: any) {
        toast.error(err.message)
        console.log(err)
      } finally {
        // stop loading
        setLoading(false)
      }
    },
    [setReviews, reset, productId]
  )

  return !open ? null : (
    <div
      className={`trans-200 relative flex cursor-pointer items-start justify-between gap-2 rounded-lg border-2 border-light bg-dark-100 p-2.5 shadow-lg ${className}`}
    >
      <div className="flex-shrink-0">
        <Input
          id="image"
          label="Image"
          disabled={false}
          register={register}
          errors={errors}
          type="url"
          onFocus={() => clearErrors('image')}
          className="w-full max-w-[100px]"
          onClick={e => e.stopPropagation()}
        />
      </div>

      <div className="flex w-full flex-col gap-1.5">
        {/* Rating */}
        <div className="flex flex-col gap-x-2 gap-y-1 md:flex-row md:items-center">
          <Input
            id="displayName"
            label="Display Name"
            disabled={false}
            register={register}
            errors={errors}
            required
            type="text"
            onFocus={() => clearErrors('displayName')}
            className="w-full max-w-[150px]"
            onClick={e => e.stopPropagation()}
          />
          <Rating
            size="medium"
            name="half-rating"
            value={rating}
            onChange={(_, newValue) => {
              setRating(newValue as number)
              setValue('rating', newValue)
            }}
          />
        </div>

        {/* Review Date */}
        <Input
          id="reviewDate"
          label="Review Date"
          disabled={false}
          register={register}
          errors={errors}
          required
          type="date"
          maxDate={moment().format('YYYY-MM-DD')}
          onFocus={() => clearErrors('reviewDate')}
          className="w-full max-w-[150px]"
          onClick={e => e.stopPropagation()}
        />

        {/* Content */}
        <Input
          id="content"
          label="Nội dung"
          register={register}
          errors={errors}
          required
          rows={3}
          type="textarea"
          icon={LuScrollText}
          onFocus={() => clearErrors('content')}
          onClick={e => e.stopPropagation()}
        />
      </div>

      {/* MARK: Action Buttons */}
      <div
        className="flex flex-col gap-3 rounded-lg text-dark sm:flex-row"
        onClick={e => e.stopPropagation()}
      >
        {/* Save Button */}
        <button
          className="group block"
          title="Save"
          onClick={handleSubmit(onSubmit)}
          disabled={loading}
        >
          {loading ? (
            <RiDonutChartFill
              size={20}
              className="animate-spin text-slate-300"
            />
          ) : (
            <FaSave
              size={20}
              className="wiggle text-green-500"
            />
          )}
        </button>

        {/* Status */}
        <select
          className="rounded-md border border-slate-300 text-xs outline-none"
          value={watch('status')}
          onChange={e => setValue('status', e.target.value)}
        >
          <option value="show">Show</option>
          <option value="hide">Hide</option>
        </select>

        {/* Cancel Button */}
        <button
          className="group block"
          onClick={_ => setOpen(false)}
          disabled={loading}
          title="Cancel"
        >
          <MdCancel
            size={20}
            className="wiggle text-slate-300"
          />
        </button>
      </div>
    </div>
  )
}

export default memo(AddReview)
