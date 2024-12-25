'use client'

import Input from '@/components/Input'
import LoadingButton from '@/components/LoadingButton'
import { memo, useCallback, useEffect, useState } from 'react'
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form'
import { FaCheck, FaInfo } from 'react-icons/fa'
import { FaPlay } from 'react-icons/fa6'
import { ImClock } from 'react-icons/im'

import { GroupTypes } from '@/app/(admin)/admin/account/add/page'
import { addAccountApi } from '@/requests'
import moment from 'moment'
import toast from 'react-hot-toast'
import { MdCategory } from 'react-icons/md'

interface AddAccountFormProps {
  groupTypes: GroupTypes
  form: any
  forms: any[]
  adding: string
  handleDuplicateForm: (form: any) => void
  handleRemoveForm: (id: number) => void
  defaultValues: any
  className?: string
}

function AddAccountForm({
  groupTypes,
  form,
  forms,
  adding,
  handleDuplicateForm,
  handleRemoveForm,
  defaultValues,
  className = '',
}: AddAccountFormProps) {
  // states
  const [loading, setLoading] = useState<boolean>(false)

  // form
  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
    setError,
    clearErrors,
    reset,
  } = useForm<FieldValues>({
    defaultValues: form,
  })

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

  const handleGenerate = useCallback(() => {
    const extractInformation = (inputString: string) => {
      let infoPart = inputString
      let additionalInfoPart = ''

      const splitIndex = inputString.indexOf('===')
      if (splitIndex !== -1) {
        infoPart = inputString.slice(0, splitIndex)
        additionalInfoPart = inputString.slice(splitIndex + 3).trim()
      }

      const regexEmail = /(\S+@\S+\.\S+)/
      const regexPassword = /(?:🔐 pass:|password:|pass:|pw:|🔐)\s*(\S+)/i
      const regexSlots = /\((\d+)\)\s*(.+?)\s*-\s*(\d+)/g

      const emailMatch = infoPart.match(regexEmail)
      const passwordMatch = infoPart.match(regexPassword)
      const slotsMatches = Array.from(infoPart.matchAll(regexSlots))

      const email = emailMatch ? emailMatch[1] : ''
      const password = passwordMatch ? passwordMatch[1] : ''
      const slots = slotsMatches.map(match => ({
        slot: match[2],
        pin: match[3],
      }))

      const additionalInfo = additionalInfoPart.trim()

      return { email, password, slots, additionalInfo }
    }

    const generateResults = (data: any) => {
      return data.slots.map((slot: any) => {
        return `✅ Email: ${data.email}
✅ Password: ${data.password}
✅ Slot: ${slot.slot}
✅ Pin: ${slot.pin}

${data.additionalInfo}`
      })
    }

    const extractedInfo = extractInformation(getValues('info'))
    const results = generateResults(extractedInfo)

    // remove current form
    if (!!results.length) {
      handleRemoveForm(form.id)
    }

    // handleRemoveForm(form.id)
    results.forEach((result: string[]) =>
      handleDuplicateForm({
        ...getValues(),
        info: result,
      })
    )
  }, [getValues, handleDuplicateForm, handleRemoveForm, form.id])

  // MARK: Submit
  // send request to server to add account
  const onSubmit: SubmitHandler<FieldValues> = useCallback(
    async data => {
      if (!handleValidate(data)) return

      // start loading
      setLoading(true)

      try {
        // add new account here
        const { message } = await addAccountApi(data)

        // show success message
        toast.success(message)
      } catch (err: any) {
        console.log(err)
        toast.error(err.message)
      } finally {
        // stop loading
        setLoading(false)
      }
    },
    [handleValidate]
  )

  useEffect(() => {
    if (adding === getValues('id')) {
      handleSubmit(onSubmit)()
    }
  }, [adding, getValues, onSubmit, handleSubmit])

  return (
    <div className={`${className}`}>
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
              disabled={loading}
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
        disabled={loading}
        register={register}
        errors={errors}
        required
        type="textarea"
        rows={8}
        icon={FaInfo}
        onFocus={() => clearErrors('info')}
        className="mb-5"
      />

      {/* Renew Time */}
      <Input
        id="renew"
        label="Renew"
        disabled={loading}
        register={register}
        errors={errors}
        required
        type="date"
        icon={FaPlay}
        minDate={moment().local().format('YYYY-MM-DD')}
        onFocus={() => clearErrors('renew')}
        className="mb-5"
      />

      {/* MARK: Date */}
      <div className="mb-5 grid grid-cols-2 gap-1 md:grid-cols-4 md:gap-0">
        {/* Days */}
        <Input
          id="days"
          label="Days"
          disabled={loading}
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
          disabled={loading}
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
          disabled={loading}
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
          disabled={loading}
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

      <div className="flex flex-wrap items-center gap-2">
        {/* MARK: Add Button */}
        <LoadingButton
          className="trans-200 rounded-lg bg-secondary px-4 py-2 font-semibold text-white hover:bg-primary"
          onClick={handleSubmit(onSubmit)}
          text="Add"
          isLoading={loading}
        />

        <button
          className="trans-200 rounded-lg border border-sky-300 px-4 py-2 font-semibold text-sky-300 hover:bg-sky-300 hover:text-white"
          onClick={() => handleDuplicateForm(getValues())}
        >
          Duplicate
        </button>

        <button
          className="trans-200 rounded-lg border border-rose-400 px-4 py-2 font-semibold text-rose-400 hover:bg-rose-400 hover:text-white"
          onClick={() => reset({ ...defaultValues, id: new Date().getTime() })}
        >
          Clear
        </button>

        <button
          className="trans-200 rounded-lg border border-yellow-400 px-4 py-2 font-semibold text-yellow-400 hover:bg-yellow-400 hover:text-white"
          onClick={handleGenerate}
        >
          Generate
        </button>

        {forms.length > 1 && (
          <button
            className="trans-200 rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-300 hover:bg-slate-300 hover:text-dark"
            onClick={() => handleRemoveForm(form.id)}
          >
            Remove
          </button>
        )}
      </div>
    </div>
  )
}

export default memo(AddAccountForm)
