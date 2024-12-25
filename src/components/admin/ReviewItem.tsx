'use client'

import { IReview } from '@/models/ReviewModel'
import { changeReviewStatusApi, editForceReviewApi } from '@/requests'
import { getUserName } from '@/utils/string'
import { Rating } from '@mui/material'
import moment from 'moment'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import { Dispatch, memo, SetStateAction, useCallback, useEffect, useState } from 'react'
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { FaSave, FaTrash } from 'react-icons/fa'
import { LuScrollText } from 'react-icons/lu'
import { MdEdit } from 'react-icons/md'
import { RiDonutChartFill } from 'react-icons/ri'
import ConfirmDialog from '../ConfirmDialog'
import Input from '../Input'

interface ReviewItemProps {
  data: IReview
  loadingReviews: string[]
  className?: string

  // selected
  selectedReviews: string[]
  setSelectedReviews: Dispatch<SetStateAction<string[]>>

  // functions
  handleChangeReviewStatus: (ids: string[], status: 'show' | 'hide' | 'pinned') => void
  handleDeleteReviews: (ids: string[]) => void
}

function ReviewItem({
  data,
  loadingReviews,
  className = '',

  // selected
  selectedReviews,
  setSelectedReviews,

  // functions
  handleChangeReviewStatus,
  handleDeleteReviews,
}: ReviewItemProps) {
  // hook
  const { data: session } = useSession()
  const curUser: any = session?.user

  // states
  const [review, setReview] = useState<IReview>(data)
  const [rating, setRating] = useState<number>(review.rating)
  const [editMode, setEditMode] = useState<boolean>(false)
  const [editing, setEditing] = useState<boolean>(false)
  const [isOpenConfirmModal, setIsOpenConfirmModal] = useState<boolean>(false)
  const [confirmType, setConfirmType] = useState<'deactivate' | 'delete'>('delete')

  useEffect(() => {
    setReview(data)
  }, [data])

  // form
  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
    setValue,
    reset,
    clearErrors,
  } = useForm<FieldValues>({
    defaultValues: {
      rating: review.rating,
      content: review.content,
      reviewDate: moment(review.reviewDate).local().format('YYYY-MM-DD'),
      image: review.image,
      displayName: review.displayName || (review.userId ? getUserName(data.userId as any) : ''),
    },
  })

  // MARK: Edit Review
  const onSubmit: SubmitHandler<FieldValues> = useCallback(
    async data => {
      // nothing change
      if (!editMode) return

      // start editing
      setEditing(true)

      try {
        // edit review
        const { updatedReview, message } = await editForceReviewApi(review.productId, review._id, {
          displayName: data.displayName,
          image: data.image,
          rating: data.rating,
          content: data.content,
          reviewDate: data.reviewDate,
        })

        // update review list
        setReview(updatedReview)

        // show success message
        toast.success(message)

        // change edit mode
        setEditMode(false)
      } catch (err: any) {
        toast.error(err.message)
        console.log(err)
      } finally {
        // stop editing
        setEditing(false)
      }
    },
    [setReview, setEditMode, review, editMode]
  )

  return (
    <>
      <div
        className={`trans-200 relative flex cursor-pointer items-start justify-between gap-2 rounded-lg p-2 shadow-lg ${
          selectedReviews.includes(review._id) ? '-translate-y-1 bg-violet-50' : 'bg-white'
        } ${className}`}
        onClick={() =>
          setSelectedReviews(prev =>
            prev.includes(review._id) ? prev.filter(id => id !== review._id) : [...prev, review._id]
          )
        }
      >
        <div className="flex-shrink-0">
          {!editMode ? (
            <div className="flex aspect-square max-w-10 cursor-pointer items-center gap-2 overflow-hidden rounded-full shadow-lg">
              <Image
                className="wiggle-0 h-full w-full object-cover shadow-md"
                src={
                  review.image ||
                  (review.userId as any)?.avatar ||
                  process.env.NEXT_PUBLIC_DEFAULT_AVATAR!
                }
                width={40}
                height={40}
                alt="avatar"
              />
            </div>
          ) : (
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
          )}
        </div>

        <div className="flex w-full flex-col gap-1.5">
          {/* Rating */}
          <div className="flex flex-col gap-x-2 gap-y-1 md:flex-row md:items-center">
            {!editMode ? (
              <span className="text-sm font-semibold">
                {review.displayName || (review.userId ? getUserName(review.userId as any) : '')}
              </span>
            ) : (
              <Input
                id="displayName"
                label="Display Name"
                disabled={false}
                register={register}
                errors={errors}
                type="text"
                onFocus={() => clearErrors('displayName')}
                className="w-full max-w-[150px]"
                onClick={e => e.stopPropagation()}
              />
            )}{' '}
            {editMode ? (
              <Rating
                size="medium"
                name="half-rating"
                value={rating}
                onChange={(_, newValue) => {
                  setRating(newValue as number)
                  setValue('rating', newValue)
                }}
              />
            ) : (
              <Rating
                size="medium"
                readOnly
                value={review.rating}
              />
            )}
          </div>

          {/* Review Date */}
          {!editMode ? (
            <p className="-mt-1.5 text-xs text-slate-500">
              {review.reviewDate
                ? moment(review.reviewDate).format('DD/MM/YYYY')
                : moment(review.updatedAt).format('DD/MM/YYYY')}
            </p>
          ) : (
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
          )}

          {/* Content */}
          {editMode ? (
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
          ) : (
            <p
              className="mr-2 inline max-h-[60px] overflow-y-auto font-body text-sm tracking-wider"
              title={review.content}
            >
              {review.content}
            </p>
          )}
        </div>

        {/* MARK: Action Buttons */}
        {['admin', 'editor'].includes(curUser?.role) && (
          <div
            className="flex flex-col gap-3 rounded-lg text-dark sm:flex-row"
            onClick={e => e.stopPropagation()}
          >
            {/* Save Button */}
            {editMode && (
              <button
                className="group block"
                title="Save"
                onClick={handleSubmit(onSubmit)}
                disabled={editing || loadingReviews.includes(review._id)}
              >
                {editing ? (
                  <RiDonutChartFill
                    size={18}
                    className="animate-spin text-slate-300"
                  />
                ) : (
                  <FaSave
                    size={18}
                    className="wiggle text-green-500"
                  />
                )}
              </button>
            )}

            {/* Edit Button Link */}
            <button
              className="group block"
              title="Edit"
              onClick={e => setEditMode(prev => !prev)}
              disabled={loadingReviews.includes(review._id) || editing}
            >
              <MdEdit
                size={18}
                className="wiggle text-sky-500"
              />
            </button>

            {/* Status */}
            <select
              className="rounded-md border border-slate-300 text-xs outline-none"
              onChange={e =>
                handleChangeReviewStatus([review._id], e.target.value as 'show' | 'hide' | 'pinned')
              }
              value={review.status}
            >
              <option value="show">Show</option>
              <option value="hide">Hide</option>
              <option value="pinned">Pinned</option>
            </select>

            {/* Delete Button */}
            <button
              className="group block"
              onClick={e => setIsOpenConfirmModal(true)}
              disabled={loadingReviews.includes(review._id) || editing}
              title="Delete"
            >
              {loadingReviews.includes(review._id) ? (
                <RiDonutChartFill
                  size={18}
                  className="animate-spin text-slate-300"
                />
              ) : (
                <FaTrash
                  size={18}
                  className="wiggle text-rose-500"
                />
              )}
            </button>
          </div>
        )}
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={isOpenConfirmModal}
        setOpen={setIsOpenConfirmModal}
        title={`${confirmType === 'delete' ? 'Xóa' : 'Ẩn'} đánh giá`}
        content={`Bạn có chắc muốn ${confirmType === 'delete' ? 'xóa' : 'ẩn'} đánh giá này không?`}
        onAccept={() => handleDeleteReviews([review._id])}
        isLoading={loadingReviews.includes(review._id)}
      />
    </>
  )
}

export default memo(ReviewItem)
