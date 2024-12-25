import { addReviewApi } from '@/requests'
import Rating from '@mui/material/Rating'
import { Dispatch, memo, SetStateAction, useCallback, useEffect, useRef, useState } from 'react'
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { LuScrollText } from 'react-icons/lu'
import { RiDonutChartFill } from 'react-icons/ri'
import Input from '../Input'
import { IReview } from '@/models/ReviewModel'
import { useSession } from 'next-auth/react'

interface ConfirmModalProps {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  productId: string
  setReviews: Dispatch<SetStateAction<IReview[]>>
  className?: string
}

function ReviewModal({ open, setOpen, productId, setReviews, className = '' }: ConfirmModalProps) {
  // hook
  const { data: session } = useSession()
  const curUser: any = session?.user

  // states
  const [isLoading, setIsLoading] = useState<boolean>(false)

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
      rating: 5,
      content: '',
    },
  })

  // ref
  const modalRef = useRef<HTMLDivElement>(null)
  const modalBodyRef = useRef<HTMLDivElement>(null)

  // show/hide modal
  useEffect(() => {
    if (open) {
      // show modal
      modalRef.current?.classList.remove('hidden')
      modalRef.current?.classList.add('flex')

      setTimeout(() => {
        // fade in modal
        modalRef.current?.classList.remove('opacity-0')

        // float in modal body
        modalBodyRef.current?.classList.remove('opacity-0')
        modalBodyRef.current?.classList.remove('translate-y-8')
      }, 1)
    } else {
      // fade out modal
      modalRef.current?.classList.add('opacity-0')

      // float out modal body
      modalBodyRef.current?.classList.add('opacity-0')
      modalBodyRef.current?.classList.add('translate-y-8')

      setTimeout(() => {
        // hide modal
        modalRef.current?.classList.add('hidden')
        modalRef.current?.classList.remove('flex')
      }, 350)
    }
  }, [open])

  // MARK: Add Review
  const onSubmit: SubmitHandler<FieldValues> = useCallback(
    async data => {
      // start loading
      setIsLoading(true)

      try {
        // add review
        const { review, message } = await addReviewApi(productId, {
          rating: data.rating,
          content: data.content,
        })

        // update review list
        setReviews(reviews => [
          {
            ...review,
            userId: {
              ...curUser,
            },
          },
          ...reviews,
        ])

        // show success message
        toast.success(message)

        // reset form
        reset()
        setOpen(false)
      } catch (err: any) {
        toast.error(err.message)
        console.log(err)
      } finally {
        // reset loading state
        setIsLoading(false)
      }
    },
    [setOpen, setReviews, reset, productId, curUser]
  )

  // keyboard event
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (open) {
        // ESC
        if (e.key === 'Escape') {
          setOpen(false)
        }

        // Enter
        if (e.key === 'Enter') {
          handleSubmit(onSubmit)()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [setOpen, handleSubmit, onSubmit, open])

  return (
    <div
      className="fixed left-0 top-0 z-40 hidden h-screen w-screen items-center justify-center bg-black bg-opacity-10 p-21 text-dark opacity-0 transition-all duration-300"
      ref={modalRef}
      onClick={() => setOpen(false)}
    >
      <div
        className={`max-h-[500px] w-full max-w-[500px] translate-y-8 rounded-medium bg-white p-21 opacity-0 shadow-medium-light transition-all duration-300 ${className}`}
        ref={modalBodyRef}
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-2xl font-semibold tracking-wide">Đánh giá</h2>
        <hr className="my-2 mb-3" />

        <Rating
          size="large"
          name="half-rating"
          defaultValue={5}
          className="mb-4 origin-left scale-125"
          onChange={(_, newValue) => setValue('rating', newValue)}
        />

        <Input
          id="content"
          label="Nội dung"
          disabled={isLoading}
          register={register}
          errors={errors}
          required
          type="textarea"
          icon={LuScrollText}
          className="mb-5"
          onFocus={() => clearErrors('content')}
        />

        <hr className="my-2" />

        <div className="flex select-none items-center justify-end gap-3">
          <button
            className={`trans-200 rounded-lg border border-slate-300 px-3 py-2 shadow-lg hover:bg-slate-300 hover:text-white ${
              isLoading ? 'pointer-events-none' : ''
            }`}
            onClick={() => setOpen(false)}
            disabled={isLoading}
          >
            Hủy
          </button>
          <button
            className={`trans-200 rounded-lg border px-3 py-2 text-primary shadow-lg hover:border-secondary hover:bg-secondary hover:text-white ${
              isLoading ? 'pointer-events-none border-slate-300' : `border-primary`
            }`}
            onClick={handleSubmit(onSubmit)}
            disabled={isLoading}
          >
            {isLoading ? (
              <RiDonutChartFill
                size={24}
                className="animate-spin text-slate-300"
              />
            ) : (
              'Đăng'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default memo(ReviewModal)
