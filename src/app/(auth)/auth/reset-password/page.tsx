'use client'

import Input from '@/components/Input'
import { useAppDispatch } from '@/libs/hooks'
import { setPageLoading } from '@/libs/reducers/modalReducer'
import { resetPassword } from '@/requests'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { FaEyeSlash } from 'react-icons/fa'
import { FaCircleNotch } from 'react-icons/fa6'

function ResetPasswordPage() {
  // hooks
  const dispatch = useAppDispatch()
  const router = useRouter()
  const queryParams = useSearchParams()

  // states
  const [isLoading, setIsLoading] = useState<boolean>(false)

  // form
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    clearErrors,
  } = useForm<FieldValues>({
    defaultValues: {
      newPassword: '',
      reNewPassword: '',
    },
  })

  useEffect(() => {
    // MARK: Check if token is not provided
    if (!queryParams.get('token')) {
      toast.error('Không có token')
      router.push('/auth/login')
    }
  }, [queryParams, router])

  // MARK: Reset Password Submition
  const onSubmit: SubmitHandler<FieldValues> = useCallback(
    async data => {
      setIsLoading(true)

      try {
        // check if new password and re-new password are match
        if (data.newPassword !== data.reNewPassword) {
          setError('reNewPassword', { type: 'manual', message: 'Mật khẩu không khớp' }) // add this line
          return
        }

        // get email and token from query
        const token = queryParams.get('token')

        // send request to server
        const { message } = await resetPassword(token!, data.newPassword)

        // show success message
        toast.success(message)

        // redirect to login page
        router.push('/auth/login')
      } catch (err: any) {
        // show error message
        toast.error(err.message)
        console.log(err)
      } finally {
        // reset loading state
        setIsLoading(false)
      }
    },
    [setError, router, queryParams]
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
          Đặt lại mật khẩu
        </h1>

        <Input
          id="newPassword"
          label="Mật khẩu mới"
          disabled={isLoading}
          register={register}
          errors={errors}
          required
          type="password"
          icon={FaEyeSlash}
          className="mb-5"
          onFocus={() => clearErrors('newPassword')}
        />

        <Input
          id="reNewPassword"
          label="Nhập lại mật khẩu mới"
          disabled={isLoading}
          register={register}
          errors={errors}
          required
          type="password"
          icon={FaEyeSlash}
          className="mb-5"
          onFocus={() => clearErrors('reNewPassword')}
        />

        <div className="-mt-3 mb-3 flex justify-end">
          <a
            href="/auth/login"
            className="common-transitio text-dark underline hover:text-sky-600"
          >
            Quay lại đăng nhập
          </a>
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            onClick={handleSubmit(onSubmit)}
            disabled={isLoading}
            className={`trans-200 group flex h-[40px] min-w-[48px] items-center justify-center rounded-lg bg-secondary px-3 py-2 font-semibold text-white hover:bg-primary hover:text-dark ${
              isLoading ? 'pointer-events-none bg-slate-200' : ''
            }`}
          >
            {isLoading ? (
              <FaCircleNotch
                size={18}
                className="trans-200 animate-spin text-white group-hover:text-dark"
              />
            ) : (
              'Đặt lại'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ResetPasswordPage
