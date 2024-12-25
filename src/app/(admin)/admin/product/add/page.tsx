'use client'

import Input from '@/components/Input'
import LoadingButton from '@/components/LoadingButton'
import AdminHeader from '@/components/admin/AdminHeader'
import { useAppDispatch, useAppSelector } from '@/libs/hooks'
import { setLoading } from '@/libs/reducers/modalReducer'
import { ICategory } from '@/models/CategoryModel'
import { ITag } from '@/models/TagModel'
import { addProductApi, getForceAllCagetoriesApi, getForceAllTagsApi } from '@/requests'
import Image from 'next/image'
import { Fragment, useCallback, useEffect, useState } from 'react'
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { FaFile, FaMoneyBillAlt } from 'react-icons/fa'
import { FaPlay, FaX } from 'react-icons/fa6'

import { MdNumbers } from 'react-icons/md'
import { RiCharacterRecognitionLine } from 'react-icons/ri'

function AddVoucherPage() {
  // hooks
  const dispatch = useAppDispatch()
  const isLoading = useAppSelector(state => state.modal.isLoading)

  // states
  const [tags, setTags] = useState<ITag[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [categories, setCategories] = useState<ICategory[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [isChecked, setIsChecked] = useState<boolean>(true)

  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [files, setFiles] = useState<File[]>([])

  // Form
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    reset,
    clearErrors,
  } = useForm<FieldValues>({
    defaultValues: {
      title: '',
      price: '',
      oldPrice: '',
      description: '',
      isActive: true,
    },
  })

  // get tags and categories
  useEffect(() => {
    const getTags = async () => {
      try {
        // send request to server to get all tags
        const { tags } = await getForceAllTagsApi() // cache: no-store
        setTags(tags)
      } catch (err: any) {
        console.log(err)
        toast.error(err.message)
      }
    }
    const getCategories = async () => {
      try {
        // send request to server to get all categories
        const { categories } = await getForceAllCagetoriesApi() // cache: no-store
        setCategories(categories)
      } catch (err: any) {
        console.log(err)
        toast.error(err.message)
      }
    }
    getTags()
    getCategories()
  }, [])

  // revoke blob url when component unmount
  useEffect(() => {
    return () => {
      imageUrls.forEach(url => URL.revokeObjectURL(url))
    }
  }, [imageUrls])

  // handle add files when user select files
  const handleAddFiles = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      let newFiles = Array.from(e.target.files)

      // validate files's type and size
      newFiles = newFiles.filter(file => {
        if (!file.type.startsWith('image/')) {
          toast.error(`File ${file.name} is not an image file`)
          return false
        }
        if (file.size > 3 * 1024 * 1024) {
          toast.error(`File ${file.name} is too large. Only accept images under 3MB`)
          return false
        }
        return true
      })

      setFiles(prev => [...prev, ...newFiles])

      const urls = newFiles.map(file => URL.createObjectURL(file))
      setImageUrls(prev => [...prev, ...urls])

      e.target.value = ''
      e.target.files = null
    }
  }, [])

  // handle remove image
  const handleRemoveImage = useCallback(
    (url: string) => {
      const index = imageUrls.indexOf(url)

      // remove file from files
      const newFiles = files.filter((_, i) => i !== index)
      setFiles(newFiles)

      setImageUrls(prev => prev.filter(u => u !== url))
      URL.revokeObjectURL(url)
    },
    [files, imageUrls]
  )

  // validate form
  const handleValidate: SubmitHandler<FieldValues> = useCallback(
    data => {
      let isValid = true

      // price >= 0
      if (data.price < 0) {
        setError('price', { type: 'manual', message: 'Price must be >= 0' })

        isValid = false
      }

      if (data.oldPrice && data.oldPrice < 0) {
        setError('oldPrice', { type: 'manual', message: 'Old price must be >= 0' })
        isValid = false
      }

      if (!selectedTags.length) {
        toast.error('Please select at least 1 tag')
        isValid = false
      }

      if (!selectedCategory) {
        toast.error('Please select category')
        isValid = false
      }

      if (!files.length) {
        toast.error('Please select at least 1 image')
        isValid = false
      }

      return isValid
    },
    [setError, selectedCategory, selectedTags, files]
  )

  // send data to server to create new product
  const onSubmit: SubmitHandler<FieldValues> = async data => {
    if (!handleValidate(data)) return

    dispatch(setLoading(true))

    try {
      const formData = new FormData()

      formData.append('title', data.title)
      formData.append('price', data.price)
      formData.append('oldPrice', data.oldPrice)
      formData.append('description', data.description)
      formData.append('isActive', data.isActive)
      formData.append('tags', JSON.stringify(selectedTags))
      formData.append('category', selectedCategory)
      files.forEach(file => formData.append('images', file))

      // send request to server to create new product
      const { message } = await addProductApi(formData)

      // show success message
      toast.success(message)

      // reset form
      setFiles([])
      imageUrls.forEach(url => URL.revokeObjectURL(url))
      setImageUrls([])
      setSelectedTags([])
      reset()
    } catch (err: any) {
      console.log(err)
      toast.error(err.message)
    } finally {
      dispatch(setLoading(false))
    }
  }

  return (
    <div className="mx-auto max-w-1200">
      <AdminHeader
        title="Add Product"
        backLink="/admin/product/all"
      />

      <div className="pt-5" />

      <div>
        {/* Title */}
        <Input
          id="title"
          label="Title"
          disabled={isLoading}
          register={register}
          errors={errors}
          required
          type="text"
          icon={RiCharacterRecognitionLine}
          className="mb-5"
          onFocus={() => clearErrors('title')}
        />

        <div className="mb-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
          {/* Price */}
          <Input
            id="price"
            label="Price"
            disabled={isLoading}
            register={register}
            errors={errors}
            required
            type="number"
            icon={FaMoneyBillAlt}
            onFocus={() => clearErrors('price')}
          />

          {/* Old Price */}
          <Input
            id="oldPrice"
            label="Old Price"
            disabled={isLoading}
            register={register}
            errors={errors}
            type="number"
            icon={FaMoneyBillAlt}
            onFocus={() => clearErrors('oldPrice')}
          />
        </div>

        {/* Description */}
        <Input
          id="description"
          label="Description"
          disabled={isLoading}
          register={register}
          errors={errors}
          type="textarea"
          rows={10}
          icon={MdNumbers}
          className="mb-5"
          onFocus={() => clearErrors('description')}
        />

        <div className="mb-4 flex">
          <div className="flex items-center rounded-lg bg-white px-3">
            <FaPlay
              size={16}
              className="text-secondary"
            />
          </div>
          <label
            className={`trans-200 cursor-pointer select-none rounded-lg border border-green-500 px-4 py-2 ${
              isChecked ? 'bg-green-500 text-white' : 'bg-white text-green-500'
            }`}
            htmlFor="isActive"
            onClick={() => setIsChecked(!isChecked)}
          >
            Active
          </label>
          <input
            type="checkbox"
            id="isActive"
            hidden
            {...register('isActive', { required: false })}
          />
        </div>

        {/* Tags */}
        <div className="mb-5">
          <p className="mb-1 text-xl font-semibold text-white">Select Tags</p>

          <div className="flex flex-wrap items-center gap-2 rounded-lg bg-white p-2">
            {tags.map(tag => (
              <Fragment key={tag._id}>
                <input
                  onChange={e =>
                    setSelectedTags(prev =>
                      e.target.checked ? [...prev, tag._id] : prev.filter(t => t !== tag._id)
                    )
                  }
                  hidden
                  type="checkbox"
                  id={tag._id}
                />
                <label
                  className={`trans-200 cursor-pointer select-none rounded-lg border border-green-500 px-3 py-[6px] text-green-500 ${
                    selectedTags.some(t => t === tag._id) ? 'bg-green-500 text-white' : ''
                  }`}
                  htmlFor={tag._id}
                >
                  {tag.title}
                </label>
              </Fragment>
            ))}
          </div>
        </div>

        {/* Categories */}
        <div className="mb-5">
          <p className="mb-1 text-xl font-semibold text-white">Select Categories</p>

          <div className="flex flex-wrap items-center gap-2 rounded-lg bg-white p-2">
            {categories.map(category => (
              <Fragment key={category._id}>
                <input
                  onChange={() => setSelectedCategory(category._id)}
                  hidden
                  type="checkbox"
                  id={category._id}
                />
                <label
                  className={`trans-200 cursor-pointer select-none rounded-lg border border-sky-500 px-3 py-[6px] text-sky-500 ${
                    selectedCategory === category._id ? 'bg-sky-500 text-white' : ''
                  }`}
                  htmlFor={category._id}
                >
                  {category.title}
                </label>
              </Fragment>
            ))}
          </div>
        </div>

        {/* Images */}
        <div className="mb-5">
          <div className="flex">
            <span className="inline-flex items-center rounded-bl-lg rounded-tl-lg border-[2px] border-slate-200 bg-slate-100 px-3 text-sm text-gray-900">
              <FaFile
                size={19}
                className="text-secondary"
              />
            </span>
            <div className="relative w-full border-[2px] border-l-0 border-slate-200 bg-white">
              <input
                id="images"
                className="peer block w-full bg-transparent px-2.5 pb-2.5 pt-4 text-sm text-dark focus:outline-none focus:ring-0"
                placeholder=" "
                disabled={isLoading}
                type="file"
                multiple
                onChange={handleAddFiles}
              />

              {/* label */}
              <label
                htmlFor={'images'}
                className="absolute start-1 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform cursor-pointer rounded-md bg-white px-2 text-sm text-dark duration-300 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:px-2 rtl:peer-focus:left-auto rtl:peer-focus:translate-x-1/4"
              >
                Images
              </label>
            </div>
          </div>
        </div>

        {!!imageUrls.length && (
          <div className="mb-5 flex flex-wrap gap-3 rounded-lg bg-white p-3">
            {imageUrls.map(url => (
              <div
                className="relative"
                key={url}
              >
                <Image
                  className="rounded-lg"
                  src={url}
                  height={250}
                  width={250}
                  alt="thumbnail"
                />

                <button
                  onClick={() => handleRemoveImage(url)}
                  className="group absolute right-2 top-2 rounded-lg bg-slate-300 p-2 hover:bg-dark-100"
                >
                  <FaX
                    size={16}
                    className="trans-200 text-dark group-hover:text-white"
                  />
                </button>
              </div>
            ))}
          </div>
        )}

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

export default AddVoucherPage
