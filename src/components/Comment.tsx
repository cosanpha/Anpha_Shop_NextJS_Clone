'use client'

import { IComment } from '@/models/CommentModel'
import { addCommentApi } from '@/requests/commentRequest'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import { memo, useCallback, useState } from 'react'
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import LoadingButton from './LoadingButton'
import CommentItem from './item/CommentItem'

interface CommentProps {
  comments: IComment[]
  productId: string | undefined
  className?: string
}

function Comment({ comments, productId, className = '' }: CommentProps) {
  // hooks
  const { data: session } = useSession()
  const curUser: any = session?.user

  // states
  const [cmts, setCmts] = useState<IComment[]>(comments || [])
  const [isLoading, setIsLoading] = useState<boolean>(false)

  // forms
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FieldValues>({
    defaultValues: {
      comment: '',
    },
  })

  // handle send comment
  const sendComment: SubmitHandler<FieldValues> = useCallback(
    async data => {
      // check login
      if (!curUser) return toast.error('Bạn cần đăng nhập để thực hiện chức năng này')

      // check if comment is valid
      if (productId) {
        setIsLoading(true)

        try {
          // send request to add comment
          const { newComment } = await addCommentApi(productId, data.comment)
          newComment.user = curUser

          // add new comment to list
          setCmts(prev => [newComment, ...prev])

          // reset form
          reset()
        } catch (err: any) {
          toast.error(err.message)
          console.log(err)
        } finally {
          // reset loading state
          setIsLoading(false)
        }
      }
    },
    [productId, curUser, reset]
  )

  return (
    <div>
      {/* MARK: Input */}
      <div className={`flex items-center justify-between gap-3 ${className}`}>
        <Image
          className="rounded-full shadow-lg"
          src={curUser?.avatar || process.env.NEXT_PUBLIC_DEFAULT_AVATAR}
          width={40}
          height={40}
          alt="avatar"
        />
        <div
          className={`relative w-full rounded-lg border-[2px] bg-white ${
            errors.comment ? 'border-rose-400' : 'border-slate-200'
          }`}
        >
          <input
            id="comment"
            className="number-input peer block h-[40px] w-full bg-transparent px-2.5 pb-2.5 pt-4 text-sm text-dark focus:outline-none focus:ring-0"
            placeholder=" "
            disabled={isLoading}
            type="text"
            {...register('comment', { required: true })}
            onWheel={e => e.currentTarget.blur()}
          />

          {/* label */}
          <label
            htmlFor="comment"
            className={`absolute start-1 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform cursor-pointer text-nowrap rounded-md bg-white px-2 text-sm text-gray-500 duration-300 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:px-2 rtl:peer-focus:left-auto rtl:peer-focus:translate-x-1/4 ${
              errors.comment ? 'text-rose-400' : 'text-dark'
            }`}
          >
            Comment
          </label>
        </div>
        <LoadingButton
          className="trans-200 flex h-[40px] items-center rounded-lg border border-primary px-3 text-primary hover:bg-primary hover:text-white sm:px-6"
          onClick={handleSubmit(sendComment)}
          text="Gửi"
          isLoading={isLoading}
        />
      </div>
      {errors.comment?.message && (
        <span className="ml-[60px] text-sm text-rose-400">{errors.comment?.message?.toString()}</span>
      )}

      {/* MARK: Comment List */}
      <div className="mt-5 flex max-h-[500px] flex-col gap-3 overflow-y-scroll">
        {cmts
          .filter(comment => !comment.hide || comment.userId === curUser?._id)
          .map(comment => (
            <CommentItem
              comment={comment}
              setCmts={setCmts}
              key={comment._id}
            />
          ))}
      </div>
    </div>
  )
}

export default memo(Comment)
