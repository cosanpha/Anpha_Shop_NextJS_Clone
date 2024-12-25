'use client'

import Divider from '@/components/Divider'
import Input from '@/components/Input'
import LoadingButton from '@/components/LoadingButton'
import { useAppDispatch, useAppSelector } from '@/libs/hooks'
import { setLoading } from '@/libs/reducers/modalReducer'
import { changeAvatarApi, updateProfileApi, verifyEmailApi, verifyPhoneApi } from '@/requests'
import { formatPrice } from '@/utils/number'
import { formatDate } from '@/utils/time'
import moment from 'moment'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { FaCamera, FaCircleNotch, FaPhone, FaPlus } from 'react-icons/fa'
import { FaLocationDot } from 'react-icons/fa6'
import { HiLightningBolt } from 'react-icons/hi'
import { IoText } from 'react-icons/io5'
import { MdDateRange, MdWork } from 'react-icons/md'

function UserPage() {
  // hooks
  const dispatch = useAppDispatch()
  const { data: session, update } = useSession()
  const queryParams = useSearchParams()
  const router = useRouter()
  const user: any = session?.user

  // store
  const balance = useAppSelector(state => state.user.balance)
  const isLoading = useAppSelector(state => state.modal.isLoading)

  // states
  const [isEditing, setIsEditing] = useState<boolean>(false)
  const [imageUrl, setImageUrl] = useState<string>('')
  const [file, setFile] = useState<File | null>(null)
  const [isChangingAvatar, setIsChangingAvatar] = useState<boolean>(false)
  const [countDownEmail, setCountDownEmail] = useState<number>(0)
  const [countDownPhone, setCountDownPhone] = useState<number>(0)
  const [isConfirmEmail, setIsConfirmEmail] = useState<boolean>(false)

  // refs
  const avatarInputRef = useRef<HTMLInputElement>(null)

  // form
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    clearErrors,
  } = useForm<FieldValues>({
    defaultValues: {
      firstname: '',
      lastname: '',
      birthday: '',
      job: '',
      address: '',
      phone: '',
    },
  })

  // get user session
  useEffect(() => {
    const getCurUser = async () => {
      // set form values
      setValue('firstname', user?.firstname)
      setValue('lastname', user?.lastname)
      setValue('birthday', moment(user?.birthday).local().format('YYYY-MM-DD'))
      setValue('job', user?.job)
      setValue('address', user?.address)
      setValue('phone', user?.phone)
    }

    getCurUser()
  }, [setValue, user])

  // auto confirm verify email
  useEffect(() => {
    const token = queryParams.get('token')

    const confirmVerifyEmail = async () => {
      try {
        const { message } = await verifyEmailApi(user.email, token || '')
        toast.success(message)
        setIsConfirmEmail(true)
        router.push('/user')
      } catch (err: any) {
        console.log(err)
        toast.error(err.message)
      }
    }

    if (token && !isConfirmEmail) {
      confirmVerifyEmail()
    }
  }, [update, router, queryParams, user.email, isConfirmEmail])

  // MARK: Submit
  // handle update profile
  const updateProfile: SubmitHandler<FieldValues> = async data => {
    // start loading
    dispatch(setLoading(true))

    try {
      // send request to server to update profile
      const { message } = await updateProfileApi(data)

      // update user session
      await update()

      // turn off editing mode
      setIsEditing(false)

      // show success message
      toast.success(message)
    } catch (err: any) {
      console.log(err)
      toast.error(err.message)
    } finally {
      // reset loading state
      dispatch(setLoading(false))
    }
  }

  // MARK: Handlers
  // send verify email
  const handleVerifyEmail = useCallback(async () => {
    // start count down
    setCountDownEmail(60)

    try {
      const { message } = await verifyEmailApi(user.email)

      toast.success(message)
    } catch (err: any) {
      console.log(err)
      toast.error(err.message)
      setCountDownEmail(0)
    }
  }, [user])

  // send verify phone
  const handleVerifyPhone = useCallback(async () => {
    // start count down
    setCountDownPhone(60)

    try {
      const { message } = await verifyPhoneApi(user.phone)

      toast.success(message)
    } catch (err: any) {
      console.log(err)
      toast.error(err.message)
      setCountDownPhone(0)
    }
  }, [user])

  // count down email
  useEffect(() => {
    if (countDownEmail > 0) {
      const timer = setTimeout(() => {
        setCountDownEmail(countDownEmail - 1)
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [countDownEmail])

  // count down phone
  useEffect(() => {
    if (countDownPhone > 0) {
      const timer = setTimeout(() => {
        setCountDownPhone(countDownPhone - 1)
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [countDownPhone])

  // handle add files when user select files
  const handleAddFile = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        const file = e.target.files[0]

        // validate file type and size
        if (!file.type.startsWith('image/')) {
          return toast.error('Please select an image file')
        }
        if (file.size > 3 * 1024 * 1024) {
          return toast.error('Please select an image file less than 3MB')
        }

        setFile(file)
        if (imageUrl) {
          URL.revokeObjectURL(imageUrl)
        }
        setImageUrl(URL.createObjectURL(file))

        e.target.value = ''
        e.target.files = null
      }
    },
    [imageUrl]
  )

  // update avatar
  const handleSaveAvatar = useCallback(async () => {
    if (file) {
      // start changing avatar
      setIsChangingAvatar(true)

      try {
        const formData = new FormData()
        formData.append('avatar', file)

        // send request to server to update avatar
        const { message } = await changeAvatarApi(formData)

        // update user session
        await update()

        // show success message
        toast.success(message)

        // reset form
        setFile(null)
      } catch (err: any) {
        toast.error(err.message)
      } finally {
        // stop changing avatar
        setIsChangingAvatar(false)
      }
    }
  }, [file, update])

  // revoke blob url when component unmount
  useEffect(() => {
    return () => URL.revokeObjectURL(imageUrl)
  }, [imageUrl])

  return (
    <div>
      <h1 className="mb-5 font-body text-3xl font-semibold tracking-wide">TÀI KHOẢN CỦA TÔI</h1>

      <div className="grid grid-cols-12 gap-21">
        {/* MARK: Avatar */}
        <div className="col-span-12 flex flex-col items-center border-slate-400 p-2 sm:col-span-6 sm:border-r lg:col-span-3">
          <div className="group relative mx-auto flex aspect-square max-w-[200px] items-center justify-center overflow-hidden rounded-full p-3">
            {(imageUrl || user?.avatar) && (
              <Image
                className="trans-200 h-full w-full rounded-full object-cover"
                src={imageUrl || user?.avatar || process.env.NEXT_PUBLIC_DEFAULT_AVATAR}
                width={160}
                height={160}
                alt="avatar"
              />
            )}
            <input
              id="images"
              hidden
              placeholder=" "
              disabled={isLoading}
              type="file"
              onChange={handleAddFile}
              ref={avatarInputRef}
            />
            {user?.authType === 'local' && (
              <div
                className="trans-200 absolute left-0 top-0 flex h-full w-full cursor-pointer items-center justify-center bg-primary bg-opacity-50 opacity-0 group-hover:opacity-100"
                onClick={() => avatarInputRef.current?.click()}
              >
                <FaCamera
                  size={52}
                  className="wiggle-0 text-white"
                />
              </div>
            )}
          </div>

          {/* Save Avatar Button */}
          {user?.authType === 'local' && file && (
            <LoadingButton
              className="trans-200 mt-1.5 rounded-lg border border-green-500 px-3 py-[6px] text-sm font-semibold text-green-500 hover:bg-green-500 hover:text-white"
              onClick={handleSaveAvatar}
              text="Lưu"
              isLoading={isChangingAvatar}
            />
          )}

          <div className="mx-auto -mb-2 mt-3 max-w-[200px] border-b border-slate-400 sm:hidden" />
        </div>

        {/* MARK: Basic Info */}
        <div className="col-span-12 grid grid-cols-12 gap-x-21 text-center sm:col-span-6 sm:text-start lg:col-span-9">
          {/* Email */}
          <div className="col-span-12 mb-3 md:col-span-6">
            <p className="font-semibold">
              Email{' '}
              {countDownEmail === 0 ? (
                user.verifiedEmail ? (
                  <span className="text-sm font-normal text-green-500">(Đã xác minh)</span>
                ) : (
                  <span
                    className="cursor-pointer text-sm font-normal text-yellow-500"
                    onClick={handleVerifyEmail}
                  >
                    (Xác minh ngay)
                  </span>
                )
              ) : (
                <span className="inlineitems-block text-sm font-normal text-slate-400">
                  <FaCircleNotch
                    size={14}
                    className="-mt-1 inline animate-spin"
                  />{' '}
                  {countDownEmail}
                </span>
              )}
            </p>
            <p>{user?.email}</p>
          </div>

          {/* Username */}
          {user?.username ? (
            <div className="col-span-12 mb-3 md:col-span-6">
              {user?.username && (
                <>
                  <p className="font-semibold">Username</p>
                  <p>{user?.username}</p>
                </>
              )}
            </div>
          ) : (
            <div className="col-span-12 mb-3 md:col-span-6">
              <p className="mb-1 font-semibold">Nạp tiền</p>
              <Link
                href="/recharge"
                className="trans-200 group inline-flex items-center gap-1 rounded-extra-small bg-primary px-3 py-[6px] hover:bg-secondary"
              >
                <span className="trans-200 font-body text-[18px] font-bold tracking-[0.02em] text-white group-hover:text-white">
                  Nạp
                </span>
                <HiLightningBolt
                  size={20}
                  className="trans-200 animate-bounce text-white group-hover:text-white"
                />
              </Link>
            </div>
          )}

          {/* Accumulated */}
          <div className="col-span-12 mb-3 md:col-span-6">
            <p className="font-semibold">Tổng tích lũy</p>
            {user?.accumulated >= 0 && formatPrice(user?.accumulated)}
          </div>

          {/* Balance */}
          <div className="col-span-12 mb-3 md:col-span-6">
            <p className="font-semibold">Số dư tài khoản</p>
            <div className="flex items-center justify-center gap-2 sm:justify-normal">
              {balance >= 0 && <p className="text-green-500">{formatPrice(balance)}</p>}
              <Link
                className="trans-200 group flex-shrink-0 rounded-full border-2 border-primary p-[2px] hover:scale-110 hover:border-secondary"
                href="/recharge"
              >
                <FaPlus
                  size={10}
                  className="trans-200 wiggle text-primary group-hover:text-secondary"
                />
              </Link>
            </div>
          </div>

          {/* Introduction Code */}
          {/* <div className='col-span-12 md:col-span-10 mb-3'>
            <p className='font-semibold'>
              Mã giới thiệu{' '}
              <span className='text-slate-500 text-sm font-normal cursor-pointer'>
                (Xác minh số điện thoại để áp dụng)
              </span>
            </p>
            <p>
              &ldquo;<span className='text-secondary font-body tracking-wider'>{user?.phone}</span>
              &rdquo;
            </p>
            <p className='font-body tracking-wide text-[13px] text-slate-400'>
              Hãy để bạn bè của bạn nhập mã này vào ô &#34;Voucher&#34; khi toán để được cộng{' '}
              <span className='text-green-500'>10%</span> giá trị đơn hàng vào số dư ngay.
            </p>
          </div> */}
        </div>
      </div>

      <Divider size={6} />

      {/* MARK: Detail */}
      <div>
        <h3 className="mb-5 text-2xl font-semibold">
          Thông tin chi tiết{' '}
          <button
            className={`group text-base font-normal text-sky-500 ${isEditing ? 'text-slate-600' : ''}`}
            onClick={() => setIsEditing(!isEditing)}
          >
            (<span className="group-hover:underline">{!isEditing ? 'chỉnh sửa' : 'hủy'}</span>)
          </button>
        </h3>

        <div className="grid grid-cols-1 gap-21 lg:grid-cols-2">
          <div className="col-span-1">
            {isEditing ? (
              <Input
                id="lastname"
                className="mt-2"
                label="Họ"
                disabled={false}
                register={register}
                errors={errors}
                icon={IoText}
                type="text"
                onFocus={() => clearErrors('lastname')}
              />
            ) : (
              <>
                <span className="font-semibold">Họ: </span>
                <span className={!user?.lastname ? 'text-slate-400' : ''}>{user?.lastname}</span>
              </>
            )}
          </div>
          <div className="col-span-1">
            {isEditing ? (
              <Input
                id="firstname"
                className="mt-2"
                label="Tên"
                disabled={false}
                register={register}
                errors={errors}
                icon={IoText}
                type="text"
                onFocus={() => clearErrors('firstname')}
              />
            ) : (
              <>
                <span className="font-semibold">Tên: </span>
                <span className={!user?.firstname ? 'text-slate-400' : ''}>{user?.firstname}</span>
              </>
            )}
          </div>
          <div className="col-span-1">
            {isEditing ? (
              <Input
                id="birthday"
                className="mt-2"
                label="Ngày sinh"
                disabled={false}
                register={register}
                errors={errors}
                icon={MdDateRange}
                type="date"
                maxDate={moment().local().format('YYYY-MM-DD')}
                minDate="1900-01-01"
                onFocus={() => clearErrors('birthday')}
              />
            ) : (
              <>
                <span className="font-semibold">Ngày sinh: </span>
                <span className={!user?.birthday ? 'text-slate-400' : ''}>
                  {formatDate(user?.birthday)}
                </span>
              </>
            )}
          </div>
          <div className="col-span-1">
            {isEditing ? (
              <Input
                id="job"
                className="mt-2"
                label="Nghề nghiệp"
                disabled={false}
                register={register}
                errors={errors}
                icon={MdWork}
                type="text"
                onFocus={() => clearErrors('job')}
              />
            ) : (
              <>
                <span className="font-semibold">Nghề nghiệp: </span>
                <span className={!user?.job ? 'text-slate-400' : ''}>{user?.job}</span>
              </>
            )}
          </div>
          <div className="col-span-1">
            {isEditing ? (
              <Input
                className="mt-2"
                id="address"
                label="Địa chỉ"
                disabled={false}
                register={register}
                errors={errors}
                icon={FaLocationDot}
                type="text"
                onFocus={() => clearErrors('address')}
              />
            ) : (
              <>
                <span className="font-semibold">Địa chỉ: </span>
                <span className={!user?.address ? 'text-slate-400' : ''}>{user?.address}</span>
              </>
            )}
          </div>
          <div className="col-span-1">
            {isEditing ? (
              <Input
                className="mt-2"
                id="phone"
                label="Số điện thoại"
                disabled={false}
                register={register}
                errors={errors}
                icon={FaPhone}
                type="number"
                onFocus={() => clearErrors('phone')}
              />
            ) : (
              <>
                <span className="font-semibold">Số điện thoại: </span>
                <span className={!user?.phone ? 'text-slate-400' : ''}>
                  {user?.phone || 'Chưa có thông tin'}
                </span>{' '}
              </>
            )}
          </div>
        </div>

        {/* MARK: Save */}
        {isEditing && (
          <LoadingButton
            className="trans-200 mb-5 mt-5 rounded-lg bg-secondary px-4 py-2 font-semibold text-white hover:bg-primary"
            onClick={handleSubmit(updateProfile)}
            text="Lưu"
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  )
}

export default UserPage
