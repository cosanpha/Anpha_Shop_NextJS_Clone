import { IReview } from '@/models/ReviewModel'
import { deleteReviewsApi, editReviewApi } from '@/requests'
import { Rating } from '@mui/material'
import { useSession } from 'next-auth/react'
import { memo, useCallback, useState } from 'react'
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { FaSave, FaTrash } from 'react-icons/fa'
import { LuScrollText } from 'react-icons/lu'
import { MdEdit } from 'react-icons/md'
import { RiDonutChartFill } from 'react-icons/ri'
import ConfirmDialog from './ConfirmDialog'
import Input from './Input'
import Image from 'next/image'
import { getUserName } from '@/utils/string'
import moment from 'moment'

interface ReviewProps {
  data: IReview
  className?: string
  setPrevReview?: any
  setReviews: any
  setIsReviewed?: any
}

function Review({ data, setReviews, setPrevReview, setIsReviewed, className = '' }: ReviewProps) {
  // hook
  const { data: session } = useSession()
  const curUser: any = session?.user

  // states
  const [review, setReview] = useState<IReview | null>(data)
  const [rating, setRating] = useState<number>(review?.rating || 5)
  const [deleting, setDeleting] = useState<boolean>(false)
  const [editMode, setEditMode] = useState<boolean>(false)
  const [editing, setEditing] = useState<boolean>(false)
  const [isOpenConfirmModal, setIsOpenConfirmModal] = useState<boolean>(false)
  const [confirmType, setConfirmType] = useState<'deactivate' | 'delete'>('delete')

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
      rating: review?.rating || 5,
      content: review?.content || '',
    },
  })

  // delete reviews
  const handleDeleteReviews = useCallback(
    async (ids: string[]) => {
      if (!review?.productId) return

      // start deleting
      setDeleting(true)

      try {
        // send request to server
        const { message } = await deleteReviewsApi(review.productId, ids)

        // remove deleted products from state
        setReview(null)
        setPrevReview(null)
        setReviews((prev: any) => prev.filter((review: any) => !ids.includes(review._id)))
        setIsReviewed(false)

        // show success message
        toast.success(message)
      } catch (err: any) {
        console.log(err)
        toast.error(err.message)
      } finally {
        // stop deleting
        setDeleting(false)
      }
    },
    [setIsReviewed, setPrevReview, setReviews, review?.productId]
  )

  // MARK: Edit Review
  const onSubmit: SubmitHandler<FieldValues> = useCallback(
    async data => {
      if (!review) return

      // nothing change
      if (data.rating === review.rating && data.content === review.content) {
        setEditMode(false)
        return
      }
      if (!editMode) return

      // start editing
      setEditing(true)

      try {
        // edit review
        const { updatedReview, message } = await editReviewApi(review.productId, review._id, {
          rating: data.rating,
          content: data.content,
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
    review && (
      <>
        <div
          className={`trans-200 relative flex cursor-pointer gap-3 rounded-lg px-4 py-2 shadow-lg ${className}`}
        >
          <div className="flex-shrink-0">
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
          </div>

          <div className="flex flex-1 items-start justify-between gap-2">
            <div className="flex w-full flex-col gap-1.5">
              {/* Rating */}
              <div className="flex flex-col gap-x-2 gap-y-1 md:flex-row md:items-center">
                <span className="text-sm font-semibold">
                  {review.displayName || (review.userId ? getUserName(review.userId as any) : '')}
                </span>{' '}
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

              {/* Created At */}
              <p className="-mt-1.5 text-xs text-slate-500">
                {review.reviewDate
                  ? moment(review.reviewDate).format('DD/MM/YYYY')
                  : moment(review.updatedAt).format('DD/MM/YYYY')}
              </p>

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
                />
              ) : (
                <p
                  className="inline max-h-[60px] overflow-y-auto font-body text-sm tracking-wider"
                  title={review.content}
                >
                  {review.content}
                </p>
              )}
            </div>

            {/* MARK: Action Buttons */}
            {(['admin', 'editor'].includes(curUser?.role) ||
              (curUser && curUser?._id.toString() === (review?.userId as any)?._id.toString())) && (
              <div className="flex flex-col gap-3 rounded-lg text-dark sm:flex-row">
                {/* Save Button */}
                {editMode && (
                  <button
                    className="group block"
                    title="Save"
                    onClick={handleSubmit(onSubmit)}
                    disabled={editing}
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
                  onClick={_ => setEditMode(prev => !prev)}
                  disabled={editing}
                >
                  <MdEdit
                    size={18}
                    className="wiggle text-sky-500"
                  />
                </button>

                {/* Delete Button */}
                {['admin', 'editor'].includes(curUser?.role) && (
                  <button
                    className="group block"
                    disabled={editing}
                    title="Delete"
                    onClick={() => setIsOpenConfirmModal(true)}
                  >
                    {deleting ? (
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
                )}
              </div>
            )}
          </div>
        </div>

        {/* Confirm Dialog */}
        <ConfirmDialog
          open={isOpenConfirmModal}
          setOpen={setIsOpenConfirmModal}
          title={`${confirmType === 'delete' ? 'Xóa' : 'Ẩn'} đánh giá`}
          content={`Bạn có chắc muốn ${confirmType === 'delete' ? 'xóa' : 'ẩn'} đánh giá này không?`}
          onAccept={() => handleDeleteReviews([review._id])}
          isLoading={false}
        />
      </>
    )
  )
}

export default memo(Review)
