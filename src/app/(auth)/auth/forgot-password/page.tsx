'use client'

import Input from '@/components/Input'
import { useAppDispatch } from '@/libs/hooks'
import { setPageLoading } from '@/libs/reducers/modalReducer'
import { forgotPasswordApi } from '@/requests'
import { useCallback, useEffect, useState } from 'react'
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { FaCircleNotch } from 'react-icons/fa6'
import { MdEmail } from 'react-icons/md'

const time = 60

function ForgotPasswordPage() {
  // hooks
  const dispatch = useAppDispatch()

  // states
  const [isSent, setIsSent] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isCounting, setIsCounting] = useState<boolean>(false)
  const [countDown, setCountDown] = useState<number>(time)

  useEffect(() => {
    if (isSent) {
      setIsCounting(true)
      const interval = setInterval(() => {
        if (countDown === 0) {
          // reset
          clearInterval(interval)
          setIsCounting(false)
          setIsSent(false)
          setCountDown(time)
          return
        }
        setCountDown(prev => prev - 1)
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [isSent, countDown])

  // form
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    clearErrors,
  } = useForm<FieldValues>({
    defaultValues: {
      email: '',
    },
  })

  // MARK: Forgot Password Submition
  const onSubmit: SubmitHandler<FieldValues> = useCallback(
    async data => {
      setIsLoading(true)

      try {
        // send request to server
        const { message } = await forgotPasswordApi(data)

        // show success message
        toast.success(message)

        // set is sent
        setIsSent(true)
      } catch (err: any) {
        // show error message
        console.log(err)
        const { message } = err
        setError('email', { type: 'manual', message: message })
        toast.error(message)
      } finally {
        // reset loading state
        setIsLoading(false)
      }
    },
    [setError]
  )

  // keyboard event
  useEffect(() => {
    dispatch(setPageLoading(false))

    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleSubmit(onSubmit)()
      }
    }

    window.addEventListener('keydown', handleKeydown)

    return () => {
      window.removeEventListener('keydown', handleKeydown)
    }
  }, [dispatch, handleSubmit, onSubmit])

  return (
    <div className="relative min-h-screen w-full">
      <div className="absolute left-1/2 top-1/2 w-full max-w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-medium bg-white px-8 py-21 pb-10 shadow-medium">
        <h1 className="mb-4 font-body text-[40px] font-semibold tracking-wide text-secondary">
          Quên Mật Khẩu
        </h1>

        <p className="mb-1.5 font-body text-sm italic tracking-wider text-slate-500">
          *Vui lòng nhập email để nhận mã khôi phục mật khẩu.
        </p>

        {isSent && isCounting ? (
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2">
              {countDown ? (
                <FaCircleNotch
                  size={20}
                  className="animate-spin text-slate-300"
                />
              ) : (
                ''
              )}
              <span className="text-nowrap text-slate-400">{countDown > 0 ? countDown : 'Hết giờ'}</span>
            </div>

            <p className="text-[14px] italic leading-5 text-slate-500">
              Bạn sẽ nhận được mã trong vòng một phút, xin vui lòng chờ.
            </p>
          </div>
        ) : (
          <Input
            id="email"
            label="Email"
            disabled={isLoading}
            register={register}
            errors={errors}
            required
            type="email"
            icon={MdEmail}
            className="mb-5"
            onFocus={() => clearErrors('email')}
          />
        )}

        <div className="-mt-3 mb-3 flex justify-end">
          <a
            href="/auth/login"
            className="trans-200 text-dark underline hover:text-sky-600"
          >
            Quay lại đăng nhập
          </a>
        </div>

        {/* MARK: Send Button */}
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={handleSubmit(onSubmit)}
            disabled={isSent && isCounting}
            className={`trans-200 group flex h-[40px] min-w-[48px] items-center justify-center gap-2 rounded-lg bg-secondary px-3 py-2 font-semibold text-white hover:bg-primary hover:text-dark ${
              isLoading || isCounting ? 'pointer-events-none bg-slate-200' : ''
            }`}
          >
            {isLoading || isCounting ? (
              <FaCircleNotch
                size={18}
                className="trans-200 animate-spin text-white group-hover:text-dark"
              />
            ) : (
              'Gửi mã'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ForgotPasswordPage
