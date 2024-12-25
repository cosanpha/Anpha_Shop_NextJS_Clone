'use client'

import ConfirmDialog from '@/components/ConfirmDialog'
import Input from '@/components/Input'
import Pagination from '@/components/Pagination'
import AdminHeader from '@/components/admin/AdminHeader'
import AdminMeta from '@/components/admin/AdminMeta'
import UserItem from '@/components/admin/UserItem'
import { useAppDispatch } from '@/libs/hooks'
import { setPageLoading } from '@/libs/reducers/modalReducer'
import { IUser } from '@/models/UserModel'
import { deleteUsersApi, getAllUsersApi } from '@/requests'
import { handleQuery } from '@/utils/handleQuery'
import { formatPrice } from '@/utils/number'
import { usePathname, useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { FaSearch, FaSort } from 'react-icons/fa'

function AllUsersPage({ searchParams }: { searchParams?: { [key: string]: string[] } }) {
  // hooks
  const dispatch = useAppDispatch()
  const pathname = usePathname()
  const router = useRouter()

  // states
  const [users, setUsers] = useState<IUser[]>([])
  const [amount, setAmount] = useState<number>(0)
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])

  // loading and confirming
  const [loadingUsers, setLoadingUsers] = useState<string[]>([])
  const [isOpenConfirmModal, setIsOpenConfirmModal] = useState<boolean>(false)

  // values
  const itemPerPage = 9
  const [minBalance, setMinBalance] = useState<number>(0)
  const [maxBalance, setMaxBalance] = useState<number>(0)
  const [balance, setBalance] = useState<number>(0)
  const [minAccumulated, setMinAccumulated] = useState<number>(0)
  const [maxAccumulated, setMaxAccumulated] = useState<number>(0)
  const [accumulated, setAccumulated] = useState<number>(0)

  // form
  const defaultValues = useMemo<FieldValues>(
    () => ({
      search: '',
      sort: 'updatedAt|-1',
      role: '',
    }),
    []
  )

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
    setValue,
    reset,
    clearErrors,
  } = useForm<FieldValues>({
    defaultValues,
  })

  // MARK: Get Data
  // get all users
  useEffect(() => {
    // get all users
    const getAllUsers = async () => {
      const query = handleQuery(searchParams)

      // start page loading
      dispatch(setPageLoading(true))

      try {
        const { users, amount, chops } = await getAllUsersApi(query) // cache: no-store

        // set to states
        setUsers(users)
        setAmount(amount)

        // sync search params with states
        setValue('search', searchParams?.search || getValues('search'))
        setValue('sort', searchParams?.sort || getValues('sort'))
        setValue('role', searchParams?.role || getValues('role'))

        // set balance
        setMinBalance(chops.minBalance)
        setMaxBalance(chops.maxBalance)
        setBalance(searchParams?.balance ? +searchParams.balance : chops.maxBalance)

        // set accumulated
        setMinAccumulated(chops.minAccumulated)
        setMaxAccumulated(chops.maxAccumulated)
        setAccumulated(searchParams?.accumulated ? +searchParams.accumulated : chops.maxAccumulated)
      } catch (err: any) {
        console.log(err)
      } finally {
        // stop page loading
        dispatch(setPageLoading(false))
      }
    }
    getAllUsers()
  }, [dispatch, searchParams, setValue, getValues])

  // MARK: Handlers
  // delete user
  const handleDeleteUsers = useCallback(async (ids: string[]) => {
    setLoadingUsers(ids)

    try {
      // senred request to server
      const { deletedUsers, message } = await deleteUsersApi(ids)

      // remove deleted users from state
      setUsers(prev =>
        prev.filter(user => !deletedUsers.map((user: IUser) => user._id).includes(user._id))
      )

      // show success message
      toast.success(message)
    } catch (err: any) {
      console.log(err)
      toast.error(err.message)
    } finally {
      setLoadingUsers([])
      setSelectedUsers([])
    }
  }, [])

  // handle select all users
  const handleSelectAllUsers = useCallback(() => {
    setSelectedUsers(
      selectedUsers.length > 0 ? [] : users.filter(user => user.role === 'user').map(user => user._id)
    )
  }, [users, selectedUsers.length])

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
        ...data,
        balance: balance === maxBalance ? [] : [balance.toString()],
        accumulated: accumulated === maxAccumulated ? [] : [accumulated.toString()],
      }
    },
    [accumulated, balance, maxBalance, maxAccumulated, searchParams, defaultValues]
  )

  // handle submit filter
  const handleFilter: SubmitHandler<FieldValues> = useCallback(
    async data => {
      const params: any = handleOptimizeFilter(data)

      // handle query
      const query = handleQuery({
        ...searchParams,
        ...params,
      })

      // push to router
      router.push(pathname + query)
    },
    [handleOptimizeFilter, router, searchParams, pathname]
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
        handleSelectAllUsers()
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
  }, [handleFilter, handleResetFilter, handleSelectAllUsers, handleSubmit])

  return (
    <div className="w-full">
      {/* MARK: Top & Pagination */}
      <AdminHeader title="All Users" />
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
            id="search"
            className="md:max-w-[450px]"
            label="Search"
            disabled={false}
            register={register}
            errors={errors}
            type="text"
            icon={FaSearch}
            onFocus={() => clearErrors('search')}
          />
        </div>

        {/* Balance */}
        <div className="col-span-12 flex flex-col md:col-span-4">
          <label htmlFor="balance">
            <span className="font-bold">Balance: </span>
            <span>{formatPrice(balance)}</span> - <span>{formatPrice(maxBalance)}</span>
          </label>
          <input
            id="balance"
            className="input-range my-2 h-2 rounded-lg bg-slate-200"
            placeholder=" "
            disabled={false}
            type="range"
            min={minBalance || 0}
            max={maxBalance || 0}
            value={balance}
            onChange={e => setBalance(+e.target.value)}
          />
        </div>

        {/* Accumulated */}
        <div className="col-span-12 flex flex-col md:col-span-4">
          <label htmlFor="accumulated">
            <span className="font-bold">Accumulated: </span>
            <span>{formatPrice(accumulated || maxAccumulated)}</span> -{' '}
            <span>{formatPrice(maxAccumulated)}</span>
          </label>
          <input
            id="accumulated"
            className="input-range my-2 h-2 rounded-lg bg-slate-200"
            placeholder=" "
            disabled={false}
            type="range"
            min={minAccumulated || 0}
            max={maxAccumulated || 0}
            value={accumulated}
            onChange={e => setAccumulated(+e.target.value)}
          />
        </div>

        {/* MARK: Select Filter */}
        <div className="col-span-12 flex flex-wrap items-center justify-end gap-3 md:col-span-8">
          {/* Select */}

          {/* Sort */}
          <Input
            id="sort"
            label="Sort"
            disabled={false}
            register={register}
            errors={errors}
            icon={FaSort}
            type="select"
            onFocus={() => clearErrors('sort')}
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

          {/* role */}
          <Input
            id="role"
            label="Role"
            disabled={false}
            register={register}
            errors={errors}
            icon={FaSort}
            type="select"
            onFocus={() => clearErrors('role')}
            options={[
              {
                value: '',
                label: 'All',
                selected: true,
              },
              {
                value: 'admin',
                label: 'Admin',
              },
              {
                value: 'editor',
                label: 'Editor',
              },
              {
                value: 'collaborator',
                label: 'Collaborator',
              },
              {
                value: 'user',
                label: 'User',
              },
            ]}
          />
        </div>

        {/* MARK: Action Buttons */}
        <div className="col-span-12 flex flex-wrap items-center justify-end gap-2">
          {/* Select All Button */}
          <button
            className="trans-200 rounded-lg border border-sky-400 px-3 py-2 text-sky-400 hover:bg-sky-400 hover:text-white"
            onClick={handleSelectAllUsers}
          >
            {selectedUsers.length > 0 ? 'Unselect All' : 'Select All'}
          </button>

          {/* Delete Many Button */}
          {!!selectedUsers.length && (
            <button
              className="trans-200 rounded-lg border border-red-500 px-3 py-2 text-red-500 hover:bg-red-500 hover:text-white"
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
        title="Delete Users"
        content="Are you sure that you want to delete these users?"
        onAccept={() => handleDeleteUsers(selectedUsers)}
        isLoading={loadingUsers.length > 0}
      />

      {/* MARK: Amount */}
      <div className="p-3 text-right text-sm font-semibold text-white">
        {Math.min(itemPerPage * +(searchParams?.page || 1), amount)}/{amount} user{amount > 1 && 's'}
      </div>

      {/* MARK: MAIN LIST */}
      <div className="grid grid-cols-1 gap-21 md:grid-cols-2 lg:grid-cols-3">
        {users.map(user => (
          <UserItem
            data={user}
            loadingUsers={loadingUsers}
            // selected
            selectedUsers={selectedUsers}
            setSelectedUsers={setSelectedUsers}
            // functions
            handleDeleteUsers={handleDeleteUsers}
            key={user._id}
          />
        ))}
      </div>
    </div>
  )
}

export default AllUsersPage
