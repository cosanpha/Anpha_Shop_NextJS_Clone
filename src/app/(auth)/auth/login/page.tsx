'use client'

import Input from '@/components/Input'
import { useAppDispatch } from '@/libs/hooks'
import { setPageLoading } from '@/libs/reducers/modalReducer'
import { signIn } from 'next-auth/react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { FaEyeSlash } from 'react-icons/fa'
import { FaCircleNotch, FaCircleUser } from 'react-icons/fa6'

function LoginPage() {
  // hooks
  const dispatch = useAppDispatch()
  const router = useRouter()

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
      usernameOrEmail: '',
      password: '',
    },
  })

  // MARK: Login Submission
  const onSubmit: SubmitHandler<FieldValues> = useCallback(
    async data => {
      setIsLoading(true)

      try {
        // send request to server
        const res = await signIn('credentials', { ...data, redirect: false })

        if (res?.ok) {
          // show success message
          toast.success('Đăng nhập thành công')

          // redirect to home page
          router.push('/')
        }

        if (res?.error) {
          // show error message
          toast.error(res.error)
          setError('usernameOrEmail', { type: 'manual' })
          setError('password', { type: 'manual' })
        }
      } catch (err: any) {
        toast.error(err.message)
        console.log(err)
      } finally {
        // reset loading state
        setIsLoading(false)
      }
    },
    [setError, router]
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
  }, [handleSubmit, onSubmit, dispatch])

  return (
    <div className="relative min-h-screen w-full">
      <div className="absolute left-1/2 top-1/2 w-full max-w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-medium bg-white px-8 py-21 pb-10 shadow-medium">
        <h1 className="mb-4 font-body text-[40px] font-semibold tracking-wide text-secondary">
          Đăng nhập
        </h1>

        <Input
          id="usernameOrEmail"
          label="Username / Email"
          disabled={isLoading}
          register={register}
          errors={errors}
          required
          type="text"
          icon={FaCircleUser}
          className="mb-5"
          onFocus={() => clearErrors('usernameOrEmail')}
        />

        <Input
          id="password"
          label="Mật khẩu"
          disabled={isLoading}
          register={register}
          errors={errors}
          required
          type="password"
          icon={FaEyeSlash}
          className="mb-5"
          onFocus={() => clearErrors('password')}
        />

        <div className="-mt-3 mb-3 flex justify-end">
          <a
            href="/auth/forgot-password"
            className="text-dark hover:underline"
          >
            Quên mật khẩu?
          </a>
        </div>

        <div className="mb-4 flex items-center justify-end gap-3">
          <a
            href="/auth/register"
            className="text-sky-500 underline"
          >
            Đăng ký
          </a>

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
              'Đăng nhập'
            )}
          </button>
        </div>

        <hr />

        {/* MARK: Social Login */}
        <p className="py-4 text-center font-body text-lg text-slate-500">Hoặc đăng nhập với</p>

        <div className="flex items-center justify-center gap-4">
          {/* <button
            className='p-2 rounded-full border-2 border-slate-800 group hover:bg-slate-300 trans-200'
            onClick={() => signIn('twitter', { callbackUrl: '/' })}>
            <Image className='wiggle' src='/images/twitter.jpg' height={25} width={25} alt='github' />
          </button> */}

          <button
            className="trans-200 group rounded-full border-2 border-yellow-300 p-2 hover:bg-yellow-100"
            onClick={() => {
              dispatch(setPageLoading(true))
              signIn('google', { callbackUrl: '/' })
            }}
          >
            <Image
              className="wiggle"
              src="/images/google.jpg"
              height={25}
              width={25}
              alt="google"
            />
          </button>

          <button
            className="trans-200 group rounded-full border-2 border-slate-800 p-2 hover:bg-slate-300"
            onClick={() => {
              dispatch(setPageLoading(true))
              signIn('github', { callbackUrl: '/' })
            }}
          >
            <Image
              className="wiggle"
              src="/images/github.jpg"
              height={25}
              width={25}
              alt="github"
            />
          </button>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
