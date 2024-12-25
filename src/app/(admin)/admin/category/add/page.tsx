'use client'

import Input from '@/components/Input'
import LoadingButton from '@/components/LoadingButton'
import AdminHeader from '@/components/admin/AdminHeader'
import { useAppDispatch, useAppSelector } from '@/libs/hooks'
import { setLoading } from '@/libs/reducers/modalReducer'
import { addCategoryApi } from '@/requests'
import Image from 'next/image'
import { useCallback, useEffect, useRef, useState } from 'react'
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { GrRadialSelected } from 'react-icons/gr'
import { IoIosColorPalette } from 'react-icons/io'
import { MdTitle } from 'react-icons/md'

function AddCategoryPage() {
  // store
  const dispatch = useAppDispatch()
  const isLoading = useAppSelector(state => state.modal.isLoading)

  // states
  const [imageUrl, setImageUrl] = useState<string>('')
  const [file, setFile] = useState<File | null>(null)

  // refs
  const logoInputRef = useRef<HTMLInputElement>(null)

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
      color: '#000',
    },
  })

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

  // MARK: Submit
  // add new category
  const onSubmit: SubmitHandler<FieldValues> = useCallback(
    async data => {
      if (!file) {
        return toast.error('Please select a logo')
      }

      dispatch(setLoading(true))

      try {
        const formData = new FormData()
        formData.append('title', data.title)
        formData.append('color', data.color)
        if (file) {
          formData.append('logo', file)
        }

        // add new category here
        const { message } = await addCategoryApi(formData)

        // show success message
        toast.success(message)

        // clear form
        reset()
        setFile(null)
        URL.revokeObjectURL(imageUrl)
        setImageUrl('')
      } catch (err: any) {
        console.log(err)
        toast.error(err.message)
      } finally {
        dispatch(setLoading(false))
      }
    },
    [dispatch, reset, file, imageUrl]
  )

  // revoke blob url when component unmount
  useEffect(() => {
    return () => URL.revokeObjectURL(imageUrl)
  }, [imageUrl])

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
        title="Add Category"
        backLink="/admin/category/all"
      />

      {/* MARK: Body */}
      <div className="mt-5">
        <div className="mb-5 flex flex-wrap gap-5">
          <div
            className="group flex h-[50px] w-[50px] cursor-pointer items-center justify-center rounded-lg bg-white p-1.5"
            onClick={() => logoInputRef.current?.click()}
          >
            {imageUrl ? (
              <Image
                src={imageUrl}
                width={34}
                height={34}
                alt="logo"
                className="trans-200 h-full w-full rounded-md object-cover group-hover:opacity-50"
              />
            ) : (
              <GrRadialSelected
                size={24}
                className="trans-200 text-secondary group-hover:opacity-50"
              />
            )}
            <input
              hidden
              type="file"
              onChange={handleAddFile}
              ref={logoInputRef}
            />
          </div>

          <Input
            id="title"
            label="Title"
            disabled={isLoading}
            register={register}
            errors={errors}
            required
            type="text"
            icon={MdTitle}
            className="flex-1"
            onFocus={() => clearErrors('title')}
          />
          <Input
            id="color"
            label="Color"
            disabled={isLoading}
            register={register}
            errors={errors}
            required
            type="color"
            icon={IoIosColorPalette}
            className="w-full md:w-32"
            onFocus={() => clearErrors('title')}
          />
        </div>
        <LoadingButton
          className="trans-200 rounded-lg bg-secondary px-4 py-2 font-semibold text-white hover:bg-primary"
          onClick={handleSubmit(onSubmit)}
          text="Add"
          isLoading={isLoading}
        />
      </div>
    </div>
  )
}

export default AddCategoryPage
