import { IComment } from '@/models/CommentModel'
import { hideCommentApi, likeCommentApi, replyCommentApi } from '@/requests/commentRequest'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import React, { memo, useCallback, useState } from 'react'
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { FaEye, FaEyeSlash, FaHeart, FaRegHeart, FaSortDown } from 'react-icons/fa'
import { format } from 'timeago.js'
import LoadingButton from '../LoadingButton'

interface CommentItemProps {
  comment: IComment
  setCmts: React.Dispatch<React.SetStateAction<IComment[]>>
  className?: string
}

function CommentItem({ comment, setCmts, className = '' }: CommentItemProps) {
  // hooks
  const { data: session } = useSession()
  const curUser: any = session?.user

  // states
  const [isOpenReply, setIsOpenReply] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  // values
  const user = comment.user

  // form
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

  // MARK: Handlers
  // reply comment
  const replyComment: SubmitHandler<FieldValues> = useCallback(
    async data => {
      // check login
      if (!curUser) return toast.error('Bạn cần đăng nhập để thực hiện chức năng này')

      // check if comment is valid
      if (comment._id && curUser?._id) {
        setIsLoading(true)

        try {
          // send request to add comment
          const { newComment, parentComment } = await replyCommentApi(comment._id, data.comment)
          newComment.user = curUser

          // add new comment to list
          setCmts(prev =>
            prev.map(comment =>
              comment._id === parentComment._id
                ? {
                    ...comment,
                    replied: [newComment, ...comment.replied],
                  }
                : comment
            )
          )

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
    [comment._id, setCmts, curUser, reset]
  )

  // like / unlike comment
  const likeComment = useCallback(
    async (value: 'y' | 'n') => {
      try {
        // send request to like / dislike comment
        const { comment: cmt } = await likeCommentApi(comment._id, value)

        // like / dislike comment / replied comment
        if (!cmt.productId) {
          // replied comment

          setCmts(prev =>
            prev.map(c =>
              c.replied.map((reply: any) => reply._id).includes(cmt._id)
                ? {
                    ...c,
                    replied: c.replied.map((reply: any) => (reply._id === cmt._id ? cmt : reply)),
                  }
                : c
            )
          )
        } else {
          // normal comment
          setCmts(prev => prev.map(comment => (comment._id === cmt._id ? cmt : comment)))
        }
      } catch (err: any) {
        toast.error(err.message)
        console.log(err)
      }
    },
    [comment._id, setCmts]
  )

  // hide / show comment
  const hideComment = useCallback(
    async (id: string, value: 'y' | 'n') => {
      try {
        // send request to hide / show comment
        const { comment: cmt } = await hideCommentApi(id, value)

        // hide / show comment / replied comment
        if (!cmt.productId) {
          // replied comment

          setCmts(prev =>
            prev.map(c => {
              return (c.replied as IComment[]).map(reply => reply._id).includes(cmt._id)
                ? {
                    ...c,
                    replied: (c.replied as IComment[]).map(reply =>
                      reply._id === cmt._id ? cmt : reply
                    ),
                  }
                : c
            })
          )
        } else {
          // normal comment
          setCmts(prev => prev.map(comment => (comment._id === cmt._id ? cmt : comment)))
        }
      } catch (err: any) {
        console.log(err)
        toast.error(err.message)
      }
    },
    [setCmts]
  )

  return (
    <div className={`flex w-full items-start gap-3 ${className}`}>
      {/* Avatar */}
      <Image
        className="rounded-full shadow-lg"
        src={user?.avatar || process.env.NEXT_PUBLIC_DEFAULT_AVATAR!}
        width={40}
        height={40}
        alt="avatar"
      />

      <div className="w-full">
        {/* MARK: Headline */}
        <div className="">
          <span className="font-semibold">
            {user?.firstname && user?.lastname ? `${user?.firstname} ${user?.lastname}` : user?.username}
          </span>{' '}
          - <span className="text-sm text-slate-500">{format(comment.createdAt)}</span>{' '}
          {curUser?.role !== 'user' && (
            <button
              className={`ml-2 rounded-[4px] border px-[6px] py-[1px] text-sm ${
                comment.hide
                  ? 'border-rose-500 text-rose-500 hover:bg-rose-500'
                  : 'border-green-500 text-green-500 hover:bg-green-500'
              } trans-200 hover:text-white`}
              onClick={() => hideComment(comment._id, comment.hide ? 'n' : 'y')}
            >
              {comment.hide ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
            </button>
          )}
        </div>

        {/* MARK: Content */}
        <p className="tracking-tide font-body">{comment.content}</p>

        {/* MARK: Actions */}
        <div className="flex items-center gap-3 text-sm">
          <div className="group flex items-center gap-1 font-semibold">
            {comment.likes.includes(curUser?._id) ? (
              <FaHeart
                size={14}
                className="wiggle h-[14px] cursor-pointer text-secondary"
                onClick={() => likeComment('n')}
              />
            ) : (
              <FaRegHeart
                size={14}
                className="wiggle h-[14px] w-4 cursor-pointer text-secondary"
                onClick={() => likeComment('y')}
              />
            )}{' '}
            <span>{comment.likes.length}</span>
          </div>

          {comment.productId && (
            <div
              className="flex cursor-pointer select-none gap-1 font-semibold text-primary"
              onClick={() => setIsOpenReply(prev => !prev)}
            >
              <span>{comment.replied.length}</span>
              <span className="">Phản hồi</span>
              <FaSortDown />
            </div>
          )}
        </div>

        {/* MARK: Reply Section */}
        <div
          className={`${
            isOpenReply ? 'max-h-[350px]' : 'max-h-0'
          } trans-200 relative mt-1 h-full overflow-y-scroll`}
        >
          {/* MARK: Input */}
          <div className="sticky top-0 z-10 flex items-start gap-2 bg-white">
            <Image
              className={`rounded-full shadow-lg ${className}`}
              src={curUser?.avatar || process.env.NEXT_PUBLIC_DEFAULT_AVATAR!}
              width={24}
              height={24}
              alt="avatar"
            />
            <div className="flex w-full flex-col items-end sm:flex-row sm:items-center">
              <input
                id="comment"
                className="peer w-full border-b px-2 py-1 text-sm text-dark focus:outline-none focus:ring-0"
                placeholder=" "
                disabled={isLoading}
                type="text"
                {...register('comment', { required: true })}
                onWheel={e => e.currentTarget.blur()}
              />
              <div className="mt-2 flex justify-end gap-2">
                <button className="trans-200 h-[30px] rounded-lg px-3 text-sm hover:bg-slate-200">
                  Hủy
                </button>
                <LoadingButton
                  className="trans-200 flex h-[30px] items-center rounded-lg border border-primary px-3 text-sm text-primary hover:bg-primary hover:text-white"
                  onClick={handleSubmit(replyComment)}
                  text="Gửi"
                  isLoading={isLoading}
                />
              </div>
            </div>
          </div>

          {/* MARK: Replied Comments */}
          <div className="relative mt-1 flex flex-col gap-3">
            {(comment.replied as IComment[]).map(comment => (
              <CommentItem
                setCmts={setCmts}
                comment={comment}
                key={comment._id}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default memo(CommentItem)
