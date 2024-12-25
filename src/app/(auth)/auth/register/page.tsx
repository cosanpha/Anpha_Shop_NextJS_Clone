'use client'

import Input from '@/components/Input'
import { commonEmailMistakes } from '@/constansts/mistakes'
import { useAppDispatch } from '@/libs/hooks'
import { setPageLoading } from '@/libs/reducers/modalReducer'
import { registerApi } from '@/requests'
import { signIn } from 'next-auth/react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { FaEyeSlash } from 'react-icons/fa'
import { FaCircleNotch, FaCircleUser } from 'react-icons/fa6'
import { MdEmail } from 'react-icons/md'

function ResgiterPage() {
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

  // validate form
  const handleValidate: SubmitHandler<FieldValues> = useCallback(
    data => {
      let isValid = true

      // username must be at least 5 characters
      if (data.username.length < 5) {
        setError('username', {
          type: 'manual',
          message: 'Username phải có ít nhất 5 ký tự',
        })
        isValid = false
      }

      // email must be valid
      if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(data.email)) {
        setError('email', {
          type: 'manual',
          message: 'Email không hợp lệ',
        })
        isValid = false
      } else {
        if (commonEmailMistakes.some(mistake => data.email.toLowerCase().includes(mistake))) {
          setError('email', { message: 'Email không hợp lệ' })
          isValid = false
        }
      }

      // password must be at least 6 characters and contain at least 1 lowercase, 1 uppercase, 1 number
      if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/.test(data.password)) {
        setError('password', {
          type: 'manual',
          message:
            'Mật khẩu phải có ít nhất 6 kí tự và bao gồm ít nhất 1 chữ hoa, 1 chữ thường, 1 chữ số',
        })
        isValid = false
      }

      // password and rePassword must be the same
      if (data.password !== data.rePassword) {
        setError('rePassword', {
          type: 'manual',
          message: 'Mật khẩu không trùng khớp',
        })
        isValid = false
      }

      return isValid
    },
    [setError]
  )

  // MARK: Register Submition
  const onSubmit: SubmitHandler<FieldValues> = useCallback(
    async data => {
      // validate form
      if (!handleValidate(data)) return

      // start loading
      setIsLoading(true)

      try {
        // register logic here
        const { user, message } = await registerApi(data)

        // sign in user
        const callback = await signIn('credentials', {
          usernameOrEmail: user.username,
          password: data.password,
          redirect: false,
        })

        if (callback?.error) {
          toast.error(callback.error)
        } else {
          // show success message
          toast.success(message)

          // redirect to home page
          router.push('/')
        }
      } catch (err: any) {
        // show error message
        console.log(err)
        toast.error(err.message)
      } finally {
        // stop loading
        setIsLoading(false)
      }
    },
    [handleValidate, router]
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
          Đăng ký
        </h1>

        <Input
          id="username"
          label="Username"
          disabled={isLoading}
          register={register}
          errors={errors}
          required
          type="text"
          icon={FaCircleUser}
          className="mb-5"
          onFocus={() => clearErrors('username')}
        />

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

        <Input
          id="rePassword"
          label="Nhập lại mật khẩu"
          disabled={isLoading}
          register={register}
          errors={errors}
          required
          type="password"
          icon={FaEyeSlash}
          className="mb-5"
          onFocus={() => clearErrors('rePassword')}
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
            href="/auth/login"
            className="text-sky-500 underline"
          >
            Đăng nhập
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
              'Đăng ký'
            )}
          </button>
        </div>

        <hr />

        <p className="py-4 text-center font-body text-lg text-slate-500">Hoặc đăng nhập với</p>

        {/* MARK: Social Login */}
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

export default ResgiterPage
