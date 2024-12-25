'use client'

import Divider from '@/components/Divider'
import LoadingButton from '@/components/LoadingButton'
import AdminHeader from '@/components/admin/AdminHeader'
import AddAccountForm from '@/components/admin/forms/AddAccountForm'
import { ICategory } from '@/models/CategoryModel'
import { IProduct } from '@/models/ProductModel'
import { getForceAllProductsApi } from '@/requests'
import moment from 'moment'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import toast from 'react-hot-toast'

export type GroupTypes = {
  [key: string]: IProduct[]
}

function AddAccountPage() {
  // states
  const [groupTypes, setGroupTypes] = useState<GroupTypes>({})
  const defaultValues = useMemo(
    () => ({
      id: new Date().getTime(),
      type: '',
      info: '',
      renew: moment().add(1, 'months').local().format('YYYY-MM-DD'),
      days: 7,
      hours: 0,
      minutes: 0,
      seconds: 0,
      active: true,
    }),
    []
  )
  const [forms, setForms] = useState<any[]>([defaultValues])
  const [adding, setAdding] = useState<string>('')
  const [currentIndex, setCurrentIndex] = useState<number>(0)
  const [isLoopRunning, setIsLoopRunning] = useState<boolean>(false)
  const timeout = useRef<any>(null)

  // MARK: Get Data
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

  const handleAddForm = useCallback(() => {
    setForms(prev => [
      ...prev,
      {
        ...defaultValues,
        id: new Date().getTime(),
      },
    ])
  }, [setForms, defaultValues])

  const handleDuplicateForm = useCallback((form: any) => {
    setForms(prev => [
      ...prev,
      {
        ...form,
        id: new Date().getTime() + Math.random(),
      },
    ])
  }, [])

  const handleRemoveForm = useCallback((id: number) => {
    setForms(prev => prev.filter(form => form.id !== id))
  }, [])

  useEffect(() => {
    const startLoop = () => {
      setAdding(forms[currentIndex].id)

      if (currentIndex >= forms.length - 1) {
        setCurrentIndex(0)
        setIsLoopRunning(false)
        return
      }

      // Move to the next item in the array after 1 second
      timeout.current = setTimeout(() => {
        setCurrentIndex(prevIndex => prevIndex + 1)
      }, 1000)
    }

    if (isLoopRunning) {
      startLoop()
    } else {
      clearTimeout(timeout.current) // Clear timeout when loop is stopped
      setAdding('')
    }

    return () => clearTimeout(timeout.current) // Cleanup function to clear timeout when component unmounts
  }, [isLoopRunning, forms.length, currentIndex, forms, setAdding, setCurrentIndex])

  const handleStartLoop = () => {
    setIsLoopRunning(true)
  }

  // MARK: Get Data
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

  return (
    <div className="mx-auto max-w-1200">
      {/* MARK: Admin Header */}
      <AdminHeader
        title="Add Account"
        backLink="/admin/account/all"
      />

      <Divider size={2} />

      <div className="flex items-center justify-center gap-2">
        <LoadingButton
          className="trans-200 rounded-lg border border-secondary bg-secondary px-3 py-2 text-sm font-semibold text-white shadow-lg hover:border-primary hover:bg-primary"
          onClick={handleStartLoop}
          text="Add All"
          isLoading={isLoopRunning}
        />
        <button
          className="trans-200 rounded-lg border border-yellow-400 px-3 py-2 text-sm font-semibold text-yellow-400 shadow-lg hover:bg-yellow-400 hover:text-white"
          onClick={handleAddForm}
        >
          New Form
        </button>
        {forms.length > 1 && (
          <button
            className="trans-200 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-300 shadow-lg hover:bg-slate-300 hover:text-dark"
            onClick={() => setForms(prev => [prev[0]])}
          >
            Remove All
          </button>
        )}
      </div>

      <Divider size={5} />

      <div className={`grid grid-cols-1 ${forms.length > 1 ? 'md:grid-cols-2' : ''} gap-x-21 gap-y-10`}>
        {forms.map(form => (
          <AddAccountForm
            groupTypes={groupTypes}
            forms={forms}
            form={form}
            adding={adding}
            handleDuplicateForm={handleDuplicateForm}
            handleRemoveForm={handleRemoveForm}
            defaultValues={defaultValues}
            key={form.id}
          />
        ))}
      </div>
    </div>
  )
}

export default AddAccountPage
