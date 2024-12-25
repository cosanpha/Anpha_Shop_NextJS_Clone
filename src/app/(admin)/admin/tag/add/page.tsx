'use client'

import Input from '@/components/Input'
import LoadingButton from '@/components/LoadingButton'
import AdminHeader from '@/components/admin/AdminHeader'
import { useAppDispatch, useAppSelector } from '@/libs/hooks'
import { setLoading } from '@/libs/reducers/modalReducer'
import { addTagApi } from '@/requests'
import { useCallback, useEffect } from 'react'
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { FaPlay } from 'react-icons/fa'
import { MdTitle } from 'react-icons/md'

function AddTagPage() {
  // store
  const dispatch = useAppDispatch()
  const isLoading = useAppSelector(state => state.modal.isLoading)

  // form
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    clearErrors,
  } = useForm<FieldValues>({
    defaultValues: {
      title: '',
      isFeatured: false,
    },
  })

  // MARK: Submit
  // add new tag
  const onSubmit: SubmitHandler<FieldValues> = useCallback(
    async data => {
      dispatch(setLoading(true))

      try {
        // add new tag login here
        const { message } = await addTagApi(data)

        // show success message
        toast.success(message)

        // clear form
        reset()
      } catch (err: any) {
        toast.error(err.message)
        console.log(err)
      } finally {
        dispatch(setLoading(false))
      }
    },
    [dispatch, reset]
  )

  // Enter key to submit
  useEffect(() => {
    const handleEnter = (e: KeyboardEvent) => {
      if (e.key === 'Enter') handleSubmit(onSubmit)()
    }

    window.addEventListener('keydown', handleEnter)
    return () => window.removeEventListener('keydown', handleEnter)
  }, [handleSubmit, onSubmit])

  return (
    <div className="mx-auto max-w-1200">
      {/* MARK: Admin Header */}
      <AdminHeader
        title="Add Tag"
        backLink="/admin/tag/all"
      />

      {/* MARK: Body */}
      <div className="mt-5">
        <Input
          id="title"
          label="Title"
          disabled={isLoading}
          register={register}
          errors={errors}
          required
          type="text"
          icon={MdTitle}
          className="mb-5"
          onFocus={() => clearErrors('title')}
        />

        <div className="flex">
          <div className="flex items-center rounded-lg bg-white px-3">
            <FaPlay
              size={16}
              className="text-secondary"
            />
          </div>
          <input
            className="peer"
            type="checkbox"
            id="isFeatured"
            hidden
            {...register('isFeatured', { required: false })}
          />
          <label
            className="trans-200 cursor-pointer select-none rounded-lg border border-green-500 bg-white px-4 py-2 text-green-500 peer-checked:bg-green-500 peer-checked:text-white"
            htmlFor="isFeatured"
          >
            Featured
          </label>
        </div>

        {/* MARK: Add Button */}
        <LoadingButton
          className="trans-200 mt-4 rounded-lg bg-secondary px-4 py-2 font-semibold text-white hover:bg-primary"
          onClick={handleSubmit(onSubmit)}
          text="Add"
          isLoading={isLoading}
        />
      </div>
    </div>
  )
}

export default AddTagPage
