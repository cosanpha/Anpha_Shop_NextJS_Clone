'use client'

import ConfirmDialog from '@/components/ConfirmDialog'
import Input from '@/components/Input'
import Pagination from '@/components/Pagination'
import AccountItem from '@/components/admin/AccountItem'
import AdminHeader from '@/components/admin/AdminHeader'
import AdminMeta from '@/components/admin/AdminMeta'
import { useAppDispatch } from '@/libs/hooks'
import { setPageLoading } from '@/libs/reducers/modalReducer'
import { IAccount } from '@/models/AccountModel'
import { ICategory } from '@/models/CategoryModel'
import { IProduct } from '@/models/ProductModel'
import { activateAccountsApi, deleteAccountsApi, getAllAccountsApi } from '@/requests'
import { handleQuery } from '@/utils/handleQuery'
import { usePathname, useRouter } from 'next/navigation'
import { Fragment, useCallback, useEffect, useMemo, useState } from 'react'
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { FaSearch, FaSort } from 'react-icons/fa'
import { GroupTypes } from '../add/page'

function AllAccountsPage({ searchParams }: { searchParams?: { [key: string]: string[] | string } }) {
  // store
  const dispatch = useAppDispatch()
  const pathname = usePathname()
  const router = useRouter()

  // states
  const [accounts, setAccounts] = useState<IAccount[]>([])
  const [amount, setAmount] = useState<number>(0)
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([])
  const [types, setTypes] = useState<IProduct[]>([])
  const [groupTypes, setGroupTypes] = useState<GroupTypes>({})
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])

  // loading & opening
  const [loadingAccounts, setLoadingAccounts] = useState<string[]>([])
  const [isOpenConfirmModal, setIsOpenConfirmModal] = useState<boolean>(false)

  // values
  const itemPerPage = 9

  // form
  const defaultValues = useMemo<FieldValues>(() => {
    return {
      search: '',
      sort: 'updatedAt|-1',
      active: 'true',
      usingUser: 'true',
      expire: '',
      renew: '',
    }
  }, [])

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
    setValue,
    clearErrors,
    reset,
  } = useForm<FieldValues>({
    defaultValues,
  })

  // MARK: Get Data
  // get all accounts at first time
  useEffect(() => {
    // get all accounts
    const getAllAccounts = async () => {
      const query = handleQuery(searchParams)

      // start page loading
      dispatch(setPageLoading(true))

      try {
        // sent request to server
        const { accounts, amount, types } = await getAllAccountsApi(query) // cache: no-store

        // group product be category.title
        const groupTypes: GroupTypes = {}
        types.forEach((product: IProduct) => {
          const category: ICategory = product.category as ICategory
          if (!groupTypes[category.title]) {
            groupTypes[category.title] = []
          }
          groupTypes[category.title].push(product)
        })

        // update accounts from state
        setAccounts(accounts)
        setAmount(amount)
        setGroupTypes(groupTypes)
        setTypes(types)

        // sync search params with states
        setSelectedTypes(
          []
            .concat((searchParams?.product || types.map((type: IProduct) => type._id)) as [])
            .map(type => type)
        )
        setValue('search', searchParams?.search || getValues('search'))
        setValue('sort', searchParams?.sort || getValues('sort'))
        setValue('active', searchParams?.active || getValues('active').toString())
        setValue('usingUser', searchParams?.usingUser || getValues('usingUser').toString())
        setValue('expire', searchParams?.expire || getValues('expire'))
        setValue('renew', searchParams?.renew || getValues('renew'))
      } catch (err: any) {
        console.log(err)
        toast.error(err.message)
      } finally {
        // stop page loading
        dispatch(setPageLoading(false))
      }
    }
    getAllAccounts()
  }, [dispatch, searchParams, getValues, setValue])

  // MARK: Handlers
  // activate account
  const handleActivateAccounts = useCallback(async (ids: string[], value: boolean) => {
    try {
      // senred request to server
      const { updatedAccounts, message } = await activateAccountsApi(ids, value)

      // update accounts from state
      setAccounts(prev =>
        prev.map(account =>
          updatedAccounts.map((account: IAccount) => account._id).includes(account._id)
            ? { ...account, active: value }
            : account
        )
      )

      // show success message
      toast.success(message)
    } catch (err: any) {
      console.log(err)
      toast.error(err.message)
    }
  }, [])

  // delete account
  const handleDeleteAccounts = useCallback(
    async (ids: string[]) => {
      setLoadingAccounts(ids)

      try {
        // senred request to server
        const { deletedAccounts, message } = await deleteAccountsApi(ids)

        // remove deleted tags from state
        setAccounts(prev =>
          prev.filter(
            account => !deletedAccounts.map((account: IAccount) => account._id).includes(account._id)
          )
        )

        // show success message
        toast.success(message)

        // refresh page
        router.refresh()
      } catch (err: any) {
        console.log(err)
        toast.error(err.message)
      } finally {
        setLoadingAccounts([])
        setSelectedAccounts([])
      }
    },
    [router]
  )

  // handle opimize filter
  const handleOptimizeFilter: SubmitHandler<FieldValues> = useCallback(
    data => {
      // reset page
      if (searchParams?.page) {
        delete searchParams.page
      }

      // loop through data to prevent filter default
      for (let key in data) {
        if (data[key] === defaultValues[key]) {
          if (!searchParams?.[key]) {
            delete data[key]
          } else {
            data[key] = ''
          }
        }
      }

      return {
        ...searchParams,
        ...data,
        product: selectedTypes.length === types.length ? [] : selectedTypes,
      }
    },
    [selectedTypes, types, searchParams, defaultValues]
  )

  // handle submit filter
  const handleFilter: SubmitHandler<FieldValues> = useCallback(
    async data => {
      const params: any = handleOptimizeFilter(data)

      // handle query
      const query = handleQuery(params)

      // push to new url
      router.push(pathname + query)
    },
    [handleOptimizeFilter, router, pathname]
  )

  // handle reset filter
  const handleResetFilter = useCallback(() => {
    reset()
    router.push(pathname)
  }, [reset, router, pathname])

  // keyboard event
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Alt + A (Select All)
      if (e.altKey && e.key === 'a') {
        e.preventDefault()
        setSelectedAccounts(prev =>
          prev.length === accounts.length ? [] : accounts.map(account => account._id)
        )
      }

      // Alt + Delete (Delete)
      if (e.altKey && e.key === 'Delete') {
        e.preventDefault()
        setIsOpenConfirmModal(true)
      }
    }

    // Add the event listener
    window.addEventListener('keydown', handleKeyDown)

    // Remove the event listener on cleanup
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [accounts, selectedAccounts, handleDeleteAccounts, handleFilter, handleSubmit, handleResetFilter])

  // check all types of category selected
  const checkAllTypesOfCategorySelected = useCallback(
    (group: any): boolean => {
      return group.map((type: IProduct) => type._id).every((type: any) => selectedTypes.includes(type))
    },
    [selectedTypes]
  )

  return (
    <div className="w-full">
      {/* MARK: Top & Pagination */}
      <AdminHeader
        title="All Accounts"
        addLink="/admin/account/add"
      />
      <Pagination
        searchParams={searchParams}
        amount={amount}
        itemsPerPage={itemPerPage}
      />

      {/* MARK: Filter */}
      <AdminMeta
        handleFilter={handleSubmit(handleFilter)}
        handleResetFilter={handleResetFilter}
      >
        {/* Search */}
        <div className="col-span-12 flex flex-col md:col-span-4">
          <Input
            className="md:max-w-[450px]"
            id="search"
            label="Search"
            disabled={false}
            register={register}
            errors={errors}
            type="text"
            icon={FaSearch}
            onFocus={() => clearErrors('info')}
          />
        </div>

        {/* Type Selection */}
        <div className="col-span-12 flex max-h-[228px] flex-wrap items-end justify-end gap-1 overflow-auto md:col-span-8 md:max-h-[152px] lg:max-h-[152px]">
          <div
            className={`trans-200 h-[34px] max-w-60 cursor-pointer select-none overflow-hidden text-ellipsis text-nowrap rounded-md border px-2 leading-[34px] ${
              types.length === selectedTypes.length
                ? 'border-dark-100 bg-dark-100 text-white'
                : 'border-slate-300'
            }`}
            title="All Types"
            onClick={() =>
              setSelectedTypes(types.length === selectedTypes.length ? [] : types.map(type => type._id))
            }
          >
            All
          </div>
          {Object.keys(groupTypes).map(key => (
            <Fragment key={key}>
              <div
                className={`trans-200 ml-2 h-[34px] max-w-60 cursor-pointer select-none overflow-hidden text-ellipsis text-nowrap rounded-md border px-2 leading-[34px] ${
                  checkAllTypesOfCategorySelected(groupTypes[key])
                    ? 'border-dark-100 bg-dark-100 text-white'
                    : 'border-slate-300 bg-slate-200'
                }`}
                title={key}
                onClick={() =>
                  checkAllTypesOfCategorySelected(groupTypes[key])
                    ? // remove all types of category
                      setSelectedTypes(prev =>
                        prev.filter(id => !groupTypes[key].map(type => type._id).includes(id))
                      )
                    : // add all types of category
                      setSelectedTypes(prev => [...prev, ...groupTypes[key].map(type => type._id)])
                }
              >
                {key}
              </div>
              {groupTypes[key].map(type => (
                <div
                  className={`trans-200 h-[34px] max-w-60 cursor-pointer select-none overflow-hidden text-ellipsis text-nowrap rounded-md border px-2 leading-[34px] ${
                    selectedTypes.includes(type._id)
                      ? 'border-secondary bg-secondary text-white'
                      : 'border-slate-300'
                  }`}
                  title={type.title}
                  key={type._id}
                  onClick={
                    selectedTypes.includes(type._id)
                      ? () => setSelectedTypes(prev => prev.filter(id => id !== type._id))
                      : () => setSelectedTypes(prev => [...prev, type._id])
                  }
                >
                  {type.title}
                </div>
              ))}
            </Fragment>
          ))}
        </div>

        {/* MARK: Select Filter */}
        <div className="col-span-12 flex flex-wrap items-center justify-end gap-3 md:col-span-8">
          {/* Sort */}
          <Input
            id="sort"
            label="Sort"
            disabled={false}
            register={register}
            errors={errors}
            icon={FaSort}
            type="select"
            onFocus={() => clearErrors('info')}
            options={[
              {
                value: 'createdAt|-1',
                label: 'Newest',
              },
              {
                value: 'createdAt|1',
                label: 'Oldest',
              },
              {
                value: 'updatedAt|-1',
                label: 'Latest',
                selected: true,
              },
              {
                value: 'updatedAt|1',
                label: 'Earliest',
              },
            ]}
          />

          {/* Active */}
          <Input
            id="active"
            label="Active"
            disabled={false}
            register={register}
            errors={errors}
            icon={FaSort}
            type="select"
            onFocus={() => clearErrors('info')}
            options={[
              {
                value: 'all',
                label: 'All',
              },
              {
                value: true,
                label: 'On',
                selected: true,
              },
              {
                value: false,
                label: 'Off',
              },
            ]}
          />

          {/* Using */}
          <Input
            id="usingUser"
            label="Using"
            disabled={false}
            register={register}
            errors={errors}
            icon={FaSort}
            type="select"
            onFocus={() => clearErrors('info')}
            options={[
              {
                value: 'all',
                label: 'All',
              },
              {
                value: true,
                label: 'Using',
                selected: true,
              },
              {
                value: false,
                label: 'Empty',
              },
            ]}
          />

          {/* Expire */}
          <Input
            id="expire"
            label="Expiry"
            disabled={false}
            register={register}
            errors={errors}
            icon={FaSort}
            type="select"
            onFocus={() => clearErrors('info')}
            options={[
              {
                value: '',
                label: 'All',
                selected: true,
              },
              {
                value: true,
                label: 'Expired',
              },
              {
                value: false,
                label: 'Normal',
              },
            ]}
          />

          {/* Renew */}
          <Input
            id="renew"
            label="Renew"
            disabled={false}
            register={register}
            errors={errors}
            icon={FaSort}
            type="select"
            onFocus={() => clearErrors('info')}
            options={[
              {
                value: '',
                label: 'All',
                selected: true,
              },
              {
                value: true,
                label: 'Expired',
              },
              {
                value: false,
                label: 'Normal',
              },
            ]}
          />
        </div>

        {/* MARK: Action Buttons */}
        <div className="col-span-12 flex flex-wrap items-center justify-end gap-2">
          {/* Select All Button */}
          <button
            className="trans-200 rounded-lg border border-sky-400 px-3 py-2 text-sky-400 hover:bg-sky-400 hover:text-white"
            title="Alt + A"
            onClick={() =>
              setSelectedAccounts(
                selectedAccounts.length > 0 ? [] : accounts.map(account => account._id)
              )
            }
          >
            {selectedAccounts.length > 0 ? 'Unselect All' : 'Select All'}
          </button>

          {/* Activate Many Button */}
          {selectedAccounts.some(id => !accounts.find(account => account._id === id)?.active) && (
            <button
              className="trans-200 rounded-lg border border-green-400 px-3 py-2 text-green-400 hover:bg-green-400 hover:text-white"
              onClick={() => handleActivateAccounts(selectedAccounts, true)}
            >
              Activate
            </button>
          )}

          {/* Deactivate Many Button */}
          {selectedAccounts.some(id => accounts.find(account => account._id === id)?.active) && (
            <button
              className="trans-200 rounded-lg border border-red-500 px-3 py-2 text-red-500 hover:bg-red-500 hover:text-white"
              onClick={() => handleActivateAccounts(selectedAccounts, false)}
            >
              Deactivate
            </button>
          )}

          {/* Delete Many Button */}
          {!!selectedAccounts.length && (
            <button
              className="trans-200 rounded-lg border border-red-500 px-3 py-2 text-red-500 hover:bg-red-500 hover:text-white"
              title="Alt + Delete"
              onClick={() => setIsOpenConfirmModal(true)}
            >
              Delete
            </button>
          )}
        </div>
      </AdminMeta>

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={isOpenConfirmModal}
        setOpen={setIsOpenConfirmModal}
        title="Delete Accounts"
        content="Are you sure that you want to delete these accounts?"
        onAccept={() => handleDeleteAccounts(selectedAccounts)}
        isLoading={loadingAccounts.length > 0}
      />

      {/* MARK: Amount */}
      <div className="p-3 text-right text-sm font-semibold text-white">
        {Math.min(itemPerPage * +(searchParams?.page || 1), amount)}/{amount} account{amount > 1 && 's'}
      </div>

      {/* MARK: MAIN LIST */}
      <div className="grid grid-cols-1 gap-21 md:grid-cols-2 lg:grid-cols-3">
        {accounts.map(account => (
          <AccountItem
            data={account}
            loadingAccounts={loadingAccounts}
            // selected
            selectedAccounts={selectedAccounts}
            setSelectedAccounts={setSelectedAccounts}
            // functions
            handleActivateAccounts={handleActivateAccounts}
            handleDeleteAccounts={handleDeleteAccounts}
            key={account._id}
          />
        ))}
      </div>
    </div>
  )
}

export default AllAccountsPage
