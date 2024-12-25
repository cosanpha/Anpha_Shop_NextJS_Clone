'use client'

import Input from '@/components/Input'
import LoadingButton from '@/components/LoadingButton'
import AdminHeader from '@/components/admin/AdminHeader'
import { useAppDispatch, useAppSelector } from '@/libs/hooks'
import { setLoading, setPageLoading } from '@/libs/reducers/modalReducer'
import { IAccount } from '@/models/AccountModel'
import { ICategory } from '@/models/CategoryModel'
import { IProduct } from '@/models/ProductModel'
import { getAccountApi, getForceAllProductsApi, updateAccountApi } from '@/requests'
import { formatTime, getColorClass, getTimeRemaining, usingPercentage } from '@/utils/time'
import moment from 'moment'
import { useParams, useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { AiFillMessage } from 'react-icons/ai'
import { FaCheck, FaInfo, FaUser } from 'react-icons/fa'
import { FaPlay } from 'react-icons/fa6'
import { ImClock } from 'react-icons/im'
import { MdCategory } from 'react-icons/md'

export type GroupTypes = {
  [key: string]: IProduct[]
}

function EditAccountPage() {
  // hooks
  const dispatch = useAppDispatch()
  const isLoading = useAppSelector(state => state.modal.isLoading)
  const router = useRouter()
  const { id } = useParams<{ id: string }>()

  // states
  const [account, setAccount] = useState<IAccount | null>(null)
  const [groupTypes, setGroupTypes] = useState<GroupTypes>({})
  const [isEditingUsingUser, setIsEditingUsingUser] = useState<boolean>(false)
  const [isEditingExpire, setIsEditingExpire] = useState<boolean>(false)

  // form
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    setValue,
    reset,
    clearErrors,
  } = useForm<FieldValues>({
    defaultValues: {
      type: '',
      info: '',
      renew: '',
      expire: '',
      days: 1,
      hours: 0,
      minutes: 0,
      seconds: 0,
      active: true,
      notify: true,
      usingUser: '',
      message: '',
    },
  })

  // MARK: Get Data
  // get account to edit
  useEffect(() => {
    const getAccount = async () => {
      // star page loading
      dispatch(setPageLoading(true))

      try {
        const { account } = await getAccountApi(id) // no-cache

        console.log('account', account)

        // set account to state
        setAccount(account)

        // set value to form
        setValue('type', account.type)
        setValue('info', account.info)
        setValue('renew', moment(account.renew).local().format('YYYY-MM-DD'))
        if (account.expire) {
          setValue('expire', moment(account.expire).local().format('YYYY-MM-DDTHH:mm'))
        }
        setValue('days', account.times.days)
        setValue('hours', account.times.hours)
        setValue('minutes', account.times.minutes)
        setValue('seconds', account.times.seconds)
        setValue('active', account.active)
        setValue('usingUser', account.usingUser)
        setValue('notify', !!account.usingUser)
      } catch (err: any) {
        console.log(err)
        toast.error(err.message)
      } finally {
        // stop page loading
        dispatch(setPageLoading(false))
      }
    }
    getAccount()
  }, [dispatch, id, setValue])

  // get all types (products)
  useEffect(() => {
    const getAllTypes = async () => {
      try {
        // send request to server to get all products
        const { products } = await getForceAllProductsApi()

        // group product be category.title
        const groupTypes: GroupTypes = {}
        products.forEach((product: IProduct) => {
          const category: ICategory = product.category as ICategory
          if (!groupTypes[category.title]) {
            groupTypes[category.title] = []
          }
          groupTypes[category.title].push(product)
        })

        setGroupTypes(groupTypes)
      } catch (err: any) {
        console.log(err)
        toast.error(err.message)
      }
    }
    getAllTypes()
  }, [])

  // validate form
  const handleValidate: SubmitHandler<FieldValues> = useCallback(
    data => {
      let isValid = true

      // day must be >= 0
      if (data.days < 0) {
        setError('days', { type: 'manual', message: 'Days must be >= 0' })
        isValid = false
      }

      // hours must be >= 0 and <= 23
      if (data.hours < 0 || data.hours > 23) {
        setError('hours', { type: 'manual', message: 'Hours must be from 0 - 23' })
        isValid = false
      }

      // minutes must be >= 0 and <= 59
      if (data.minutes < 0 || data.minutes > 59) {
        setError('minutes', { type: 'manual', message: 'Minutes must be from 0 - 59' })
        isValid = false
      }

      // seconds must be >= 0 and <= 59
      if (data.seconds < 0 || data.seconds > 59) {
        setError('seconds', { type: 'manual', message: 'Seconds must be from 0 - 59' })
        isValid = false
      }

      return isValid
    },
    [setError]
  )

  // MARK: Submit
  // send request to server to edit account
  const onSubmit: SubmitHandler<FieldValues> = async data => {
    if (!handleValidate(data)) return

    // start loading
    dispatch(setLoading(true))

    try {
      const { message } = await updateAccountApi(id, data)

      // show success message
      toast.success(message)

      // reset form
      reset()
      dispatch(setPageLoading(false))

      // redirect back
      router.back()
    } catch (err: any) {
      console.log(err)
      toast.error(err.message)
    } finally {
      // stop loading
      dispatch(setLoading(false))
    }
  }

  return (
    <div className="mx-auto max-w-1200">
      {/* MARK: Admin Header */}
      <AdminHeader
        title="Edit Account"
        backLink="/admin/account/all"
      />

      <div className="mt-5">
        {/* MARK: Using User */}
        {account?.usingUser && (
          <div
            className="mb-5 flex min-h-[42px] cursor-pointer"
            onDoubleClick={() => setIsEditingUsingUser(prev => !prev)}
          >
            <div className="flex items-center rounded-lg bg-white px-3">
              <FaUser
                size={16}
                className="text-secondary"
              />
            </div>
            {!isEditingUsingUser ? (
              <p
                className={`trans-200 cursor-pointer select-none rounded-lg border border-dark bg-white px-4 py-2 text-dark`}
              >
                {account.usingUser}
              </p>
            ) : (
              <Input
                id="usingUser"
                label="Using User"
                disabled={isLoading}
                register={register}
                errors={errors}
                required
                type="text"
                onFocus={() => clearErrors('usingUser')}
                className="w-full max-w-[350px]"
              />
            )}
          </div>
        )}
        {/* Expire */}
        {account?.usingUser && (
          <div
            className="mb-4 inline-block rounded-lg bg-white px-3 py-2 text-sm"
            title="Expire (d/m/y)"
            onDoubleClick={() => setIsEditingExpire(prev => !prev)}
          >
            {!isEditingExpire ? (
              <>
                <span className="font-semibold">Expire: </span>
                {account.expire ? (
                  <>
                    <span
                      className={`${
                        new Date() > new Date(account.expire || '') ? 'font-semibold text-red-500' : ''
                      }`}
                    >
                      {account.expire ? formatTime(account.expire) : '-'}
                    </span>{' '}
                    {account?.begin &&
                      account?.expire &&
                      usingPercentage(account.begin, account.expire) < 100 && (
                        <span
                          className={`text-xs font-semibold ${getColorClass(
                            account.begin,
                            account.expire
                          )}`}
                          title={`${
                            usingPercentage(account.begin, account.expire) >= 93
                              ? '>= 93'
                              : usingPercentage(account.begin, account.expire) >= 80
                                ? '>= 80'
                                : ''
                          }`}
                        >
                          (<span>{usingPercentage(account.begin, account.expire) + '%'}</span>
                          {' - '}
                          <span>
                            {account.expire && getTimeRemaining(account.expire)
                              ? `${getTimeRemaining(account.expire)}`
                              : 'Expired'}
                          </span>
                          )
                        </span>
                      )}{' '}
                  </>
                ) : (
                  <span className="text-slate-500">
                    +{account.times.days ? account.times.days + 'd' : ''}
                    {account.times.hours ? ':' + account.times.hours + 'h' : ''}
                    {account.times.minutes ? ':' + account.times.minutes + 'm' : ''}
                  </span>
                )}
              </>
            ) : (
              <Input
                id="expire"
                label="Expire"
                disabled={isLoading}
                register={register}
                errors={errors}
                required
                type="datetime-local"
                onFocus={() => clearErrors('expire')}
                className="w-full max-w-[350px]"
              />
            )}
          </div>
        )}

        {/* Type */}
        <div className="mb-5">
          <div className={`flex`}>
            <span
              className={`inline-flex items-center rounded-bl-lg rounded-tl-lg border-[2px] px-3 text-sm text-gray-900 ${
                errors.type ? 'border-rose-400 bg-rose-100' : 'border-slate-200 bg-slate-100'
              }`}
            >
              <MdCategory
                size={19}
                className="text-secondary"
              />
            </span>
            <div
              className={`relative w-full rounded-br-lg rounded-tr-lg border-[2px] border-l-0 bg-white ${
                errors.type ? 'border-rose-400' : 'border-slate-200'
              }`}
            >
              <select
                id="type"
                className="peer block w-full bg-transparent px-2.5 pb-2.5 pt-4 text-sm text-dark focus:outline-none focus:ring-0"
                disabled={isLoading}
                {...register('type', { required: true })}
              >
                <option value="">Select Type</option>
                {Object.keys(groupTypes)?.map(key => (
                  <optgroup
                    label={key}
                    key={key}
                  >
                    {groupTypes[key].map(product => (
                      <option
                        value={product._id}
                        selected={product._id === account?.type}
                        key={product._id}
                      >
                        {product.title}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>

              {/* label */}
              <label
                htmlFor="type"
                className={`absolute start-1 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform cursor-pointer rounded-md bg-white px-2 text-sm text-gray-500 duration-300 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:px-2 rtl:peer-focus:left-auto rtl:peer-focus:translate-x-1/4 ${
                  errors.type ? 'text-rose-400' : 'text-dark'
                }`}
              >
                Tye
              </label>
            </div>
          </div>
          {errors.type?.message && (
            <span className="text-sm text-rose-400">{errors.type?.message?.toString()}</span>
          )}
        </div>

        {/* Info */}
        <Input
          id="info"
          label="Info"
          disabled={isLoading}
          register={register}
          errors={errors}
          required
          type="textarea"
          rows={8}
          icon={FaInfo}
          className="mb-5"
          onFocus={() => clearErrors('info')}
        />

        {/* Message */}
        {account?.usingUser && (
          <Input
            id="message"
            label="Message"
            disabled={isLoading}
            register={register}
            errors={errors}
            type="textarea"
            rows={4}
            icon={AiFillMessage}
            className="mb-5"
            onFocus={() => clearErrors('info')}
          />
        )}

        {/* Renew */}
        <Input
          id="renew"
          label="Renew"
          disabled={isLoading}
          register={register}
          errors={errors}
          required
          type="date"
          icon={FaPlay}
          className="mb-5"
          onFocus={() => clearErrors('renew')}
        />

        {/* MARK: Date */}
        <div className="mb-5 grid grid-cols-2 gap-1 md:grid-cols-4 md:gap-0">
          {/* Days */}
          <Input
            id="days"
            label="Days"
            disabled={isLoading}
            register={register}
            errors={errors}
            required
            type="number"
            icon={ImClock}
            onFocus={() => clearErrors('days')}
          />
          {/* Hours */}
          <Input
            id="hours"
            label="Hours"
            disabled={isLoading}
            register={register}
            errors={errors}
            required
            type="number"
            onFocus={() => clearErrors('hours')}
          />
          {/* Minutes */}
          <Input
            id="minutes"
            label="Minutes"
            disabled={isLoading}
            register={register}
            errors={errors}
            required
            type="number"
            onFocus={() => clearErrors('minutes')}
          />
          {/* Seconds */}
          <Input
            id="seconds"
            label="Seconds"
            disabled={isLoading}
            register={register}
            errors={errors}
            required
            type="number"
            onFocus={() => clearErrors('seconds')}
          />
        </div>

        {/* Active */}
        <div className="mb-5 flex">
          <div className="flex items-center rounded-lg bg-white px-3">
            <FaCheck
              size={16}
              className="text-secondary"
            />
          </div>
          <input
            className="peer"
            type="checkbox"
            id="active"
            hidden
            {...register('active', { required: false })}
          />
          <label
            className={`trans-200 cursor-pointer select-none rounded-lg border border-green-500 bg-white px-4 py-2 text-green-500 peer-checked:bg-green-500 peer-checked:text-white`}
            htmlFor="active"
          >
            Active
          </label>
        </div>

        {/* MARK: Notify */}
        {account?.usingUser && (
          <div className="mb-5 flex">
            <div className="flex items-center rounded-lg bg-white px-3">
              <FaCheck
                size={16}
                className="text-secondary"
              />
            </div>
            <input
              className="peer"
              type="checkbox"
              id="notify"
              hidden
              {...register('notify', { required: false })}
            />
            <label
              className={`trans-200 cursor-pointer select-none rounded-lg border border-green-500 bg-white px-4 py-2 text-green-500 peer-checked:bg-green-500 peer-checked:text-white`}
              htmlFor="notify"
            >
              Notify
            </label>
          </div>
        )}

        {/* Save Button */}
        <LoadingButton
          className="trans-200 rounded-lg bg-secondary px-4 py-2 font-semibold text-white hover:bg-primary"
          onClick={handleSubmit(onSubmit)}
          text="Save"
          isLoading={isLoading}
        />
      </div>
    </div>
  )
}

export default EditAccountPage
