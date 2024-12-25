'use client'

import ConfirmDialog from '@/components/ConfirmDialog'
import Input from '@/components/Input'
import Pagination from '@/components/Pagination'
import AdminHeader from '@/components/admin/AdminHeader'
import AdminMeta from '@/components/admin/AdminMeta'
import ProductItem from '@/components/admin/ProductItem'
import { useAppDispatch } from '@/libs/hooks'
import { setPageLoading } from '@/libs/reducers/modalReducer'
import { ICategory } from '@/models/CategoryModel'
import { IProduct } from '@/models/ProductModel'
import { ITag } from '@/models/TagModel'
import {
  activateProductsApi,
  bootProductsApi,
  deleteProductsApi,
  getAllProductsApi,
  removeApplyingFlashSalesApi,
  syncProductsApi,
} from '@/requests'
import { handleQuery } from '@/utils/handleQuery'
import { formatPrice } from '@/utils/number'
import { usePathname, useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { FaSort } from 'react-icons/fa'

function AllProductsPage({ searchParams }: { searchParams?: { [key: string]: string[] | string } }) {
  // store
  const dispatch = useAppDispatch()
  const pathname = usePathname()
  const router = useRouter()

  // states
  const [products, setProducts] = useState<IProduct[]>([])
  const [amount, setAmount] = useState<number>(0)
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [tgs, setTgs] = useState<ITag[]>([])
  const [selectedFilterTags, setSelectedFilterTags] = useState<string[]>([])
  const [cates, setCates] = useState<ICategory[]>([])
  const [selectedFilterCates, setSelectedFilterCates] = useState<string[]>([])

  // loading and confirming
  const [loadingProducts, setLoadingProducts] = useState<string[]>([])
  const [syncingProducts, setSyncingProducts] = useState<string[]>([])
  const [isOpenConfirmModal, setIsOpenConfirmModal] = useState<boolean>(false)

  // values
  const itemPerPage = 9
  const [minPrice, setMinPrice] = useState<number>(0)
  const [maxPrice, setMaxPrice] = useState<number>(0)
  const [price, setPrice] = useState<number>(0)

  const [minSold, setMinSold] = useState<number>(0)
  const [maxSold, setMaxSold] = useState<number>(0)
  const [sold, setSold] = useState<number>(0)

  const [minStock, setMinStock] = useState<number>(0)
  const [maxStock, setMaxStock] = useState<number>(0)
  const [stock, setStock] = useState<number>(0)

  // Form
  const defaultValues = useMemo<FieldValues>(
    () => ({
      sort: 'updatedAt|-1',
      active: '',
      flashSale: '',
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

  // get all products
  useEffect(() => {
    // get all products
    const getAllProducts = async () => {
      const query = handleQuery(searchParams)

      // start page loading
      dispatch(setPageLoading(true))

      try {
        // send request to server to get all products
        const { products, amount, cates, tgs, chops } = await getAllProductsApi(query)

        // set products to state
        setProducts(products)
        setAmount(amount)
        setCates(cates)
        setTgs(tgs)

        setSelectedFilterCates(
          []
            .concat((searchParams?.category || cates.map((cate: ICategory) => cate._id)) as [])
            .map(type => type)
        )

        setSelectedFilterTags(
          [].concat((searchParams?.tags || tgs.map((tag: ITag) => tag._id)) as []).map(type => type)
        )

        // sync search params with states
        setValue('sort', searchParams?.sort || getValues('sort'))
        setValue('active', searchParams?.active || getValues('active'))
        setValue('flashSale', searchParams?.flashSale || getValues('flashSale'))

        // get min - max
        setMinPrice(chops.minPrice)
        setMaxPrice(chops.maxPrice)
        setPrice(searchParams?.price ? +searchParams.price : chops.maxPrice)

        setMinStock(chops.minStock)
        setMaxStock(chops.maxStock)
        setStock(searchParams?.stock ? +searchParams.stock : chops.maxStock)

        setMinSold(chops.minSold)
        setMaxSold(chops.maxSold)
        setSold(searchParams?.sold ? +searchParams.sold : chops.maxSold)
      } catch (err: any) {
        console.log(err)
        toast.error(err.message)
      } finally {
        // stop page loading
        dispatch(setPageLoading(false))
      }
    }
    getAllProducts()
  }, [dispatch, searchParams, setValue, getValues])

  // activate product
  const handleActivateProducts = useCallback(async (ids: string[], value: boolean) => {
    try {
      // send request to server
      const { updatedProducts, message } = await activateProductsApi(ids, value)

      // update products from state
      setProducts(prev =>
        prev.map(product =>
          updatedProducts.map((product: IProduct) => product._id).includes(product._id)
            ? { ...product, active: value }
            : product
        )
      )

      // show success message
      toast.success(message)
    } catch (err: any) {
      console.log(err)
      toast.error(err.message)
    }
  }, [])

  // boot product
  const handleBootProducts = useCallback(async (ids: string[], value: boolean) => {
    try {
      // send request to server
      const { updatedProducts, message } = await bootProductsApi(ids, value)

      // update products from state
      setProducts(prev =>
        prev.map(product =>
          updatedProducts.map((product: IProduct) => product._id).includes(product._id)
            ? { ...product, booted: value }
            : product
        )
      )

      // show success message
      toast.success(message)
    } catch (err: any) {
      console.log(err)
      toast.error(err.message)
    }
  }, [])

  // sync products stock
  const handleSyncProducts = useCallback(async (ids: string[]) => {
    try {
      // start syncing products
      setSyncingProducts(ids)

      // send request to server
      const { syncedProducts, message } = await syncProductsApi(ids)

      // update products from state
      setProducts(prev =>
        prev.map(product =>
          syncedProducts.map((prod: IProduct) => prod._id).includes(product._id)
            ? {
                ...product,
                stock: syncedProducts.find((prod: IProduct) => prod._id === product._id)?.stock,
              }
            : product
        )
      )

      // show success message
      toast.success(message)
    } catch (err: any) {
      console.log(err)
      toast.error(err.message)
    } finally {
      // stop syncing products
      setSyncingProducts([])
    }
  }, [])

  // remove applying flash sales
  const handleRemoveApplyingFlashSales = useCallback(async (ids: string[]) => {
    try {
      // send request to server
      const { updatedProducts, message } = await removeApplyingFlashSalesApi(ids)

      // update products from state
      setProducts(prev =>
        prev.map(product =>
          updatedProducts.map((product: IProduct) => product._id).includes(product._id)
            ? { ...product, flashSale: undefined }
            : product
        )
      )

      // show success message
      toast.success(message)
    } catch (err: any) {
      console.log(err)
      toast.error(err.message)
    }
  }, [])

  // delete product
  const handleDeleteProducts = useCallback(async (ids: string[]) => {
    setLoadingProducts(ids)

    try {
      // send request to server
      const { deletedProducts, message } = await deleteProductsApi(ids)

      // remove deleted products from state
      setProducts(prev =>
        prev.filter(
          product => !deletedProducts.map((product: IProduct) => product._id).includes(product._id)
        )
      )

      // show success message
      toast.success(message)
    } catch (err: any) {
      console.log(err)
      toast.error(err.message)
    } finally {
      setLoadingProducts([])
      setSelectedProducts([])
    }
  }, [])

  // handle optimize filter
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
        price: price === maxPrice ? [] : [price.toString()],
        sold: sold === maxSold ? [] : [sold.toString()],
        stock: stock === maxStock ? [] : [stock.toString()],
        category: selectedFilterCates.length === cates.length ? [] : selectedFilterCates,
        tags: selectedFilterTags.length === tgs.length ? [] : selectedFilterTags,
      }
    },
    [
      cates,
      maxPrice,
      maxSold,
      maxStock,
      price,
      selectedFilterCates,
      selectedFilterTags,
      sold,
      stock,
      tgs,
      searchParams,
      defaultValues,
    ]
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
        setSelectedProducts(prev =>
          prev.length === products.length ? [] : products.map(product => product._id)
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
  }, [handleFilter, handleResetFilter, products, handleSubmit])

  return (
    <div className="w-full">
      {/* Top & Pagination */}
      <AdminHeader
        title="All Products"
        addLink="/admin/product/add"
      />
      <Pagination
        searchParams={searchParams}
        amount={amount}
        itemsPerPage={itemPerPage}
      />

      {/* Filter */}
      <AdminMeta
        handleFilter={handleSubmit(handleFilter)}
        handleResetFilter={handleResetFilter}
      >
        {/* Price */}
        <div className="col-span-12 flex flex-col md:col-span-4">
          <label htmlFor="price">
            <span className="font-bold">Price: </span>
            <span>{formatPrice(price)}</span> - <span>{formatPrice(maxPrice)}</span>
          </label>
          <input
            id="price"
            className="input-range my-2 h-2 rounded-lg bg-slate-200"
            placeholder=" "
            disabled={false}
            type="range"
            min={minPrice || 0}
            max={maxPrice || 0}
            value={price}
            onChange={e => setPrice(+e.target.value)}
          />
        </div>

        {/* Sold */}
        <div className="col-span-12 flex flex-col md:col-span-4">
          <label htmlFor="sold">
            <span className="font-bold">Sold: </span>
            <span>{sold}</span> - <span>{maxSold}</span>
          </label>
          <input
            id="sold"
            className="input-range my-2 h-2 rounded-lg bg-slate-200"
            placeholder=" "
            disabled={false}
            type="range"
            min={minSold || 0}
            max={maxSold || 0}
            value={sold}
            onChange={e => setSold(+e.target.value)}
          />
        </div>

        {/* Stock */}
        <div className="col-span-12 flex flex-col md:col-span-4">
          <label htmlFor="stock">
            <span className="font-bold">Stock: </span>
            <span>{stock}</span> - <span>{maxStock}</span>
          </label>
          <input
            id="stock"
            className="input-range my-2 h-2 rounded-lg bg-slate-200"
            placeholder=" "
            disabled={false}
            type="range"
            min={minStock || 0}
            max={maxStock || 0}
            value={stock}
            onChange={e => setStock(+e.target.value)}
          />
        </div>

        {/* Cate Selection */}
        <div className="col-span-12 flex max-h-[228px] flex-wrap items-end justify-end gap-1 overflow-auto md:max-h-[152px] lg:max-h-[152px]">
          <div
            className={`trans-200 h-[34px] max-w-60 cursor-pointer select-none overflow-hidden text-ellipsis text-nowrap rounded-md border px-2 leading-[34px] ${
              cates.length === selectedFilterCates.length
                ? 'border-dark-100 bg-dark-100 text-white'
                : 'border-slate-300'
            }`}
            title="All Types"
            onClick={() =>
              setSelectedFilterCates(
                cates.length === selectedFilterCates.length ? [] : cates.map(category => category._id)
              )
            }
          >
            All
          </div>
          {cates.map(category => (
            <div
              className={`trans-200 h-[34px] max-w-60 cursor-pointer select-none overflow-hidden text-ellipsis text-nowrap rounded-md border px-2 leading-[34px] ${
                selectedFilterCates.includes(category._id)
                  ? 'border-primary bg-primary text-white'
                  : 'border-slate-300'
              }`}
              title={category.title}
              key={category._id}
              onClick={
                selectedFilterCates.includes(category._id)
                  ? () => setSelectedFilterCates(prev => prev.filter(id => id !== category._id))
                  : () => setSelectedFilterCates(prev => [...prev, category._id])
              }
            >
              {category.title}
            </div>
          ))}
        </div>

        {/* Tag Selection */}
        <div className="col-span-12 flex max-h-[228px] flex-wrap items-end justify-end gap-1 overflow-auto md:max-h-[152px] lg:max-h-[152px]">
          <div
            className={`trans-200 h-[34px] max-w-60 cursor-pointer select-none overflow-hidden text-ellipsis text-nowrap rounded-md border px-2 leading-[34px] ${
              tgs.length === selectedFilterTags.length
                ? 'border-dark-100 bg-dark-100 text-white'
                : 'border-slate-300'
            }`}
            title="All Types"
            onClick={() =>
              setSelectedFilterTags(
                tgs.length === selectedFilterTags.length ? [] : tgs.map(tag => tag._id)
              )
            }
          >
            All
          </div>
          {tgs.map(tag => (
            <div
              className={`trans-200 h-[34px] max-w-60 cursor-pointer select-none overflow-hidden text-ellipsis text-nowrap rounded-md border px-2 leading-[34px] ${
                selectedFilterTags.includes(tag._id)
                  ? 'border-secondary bg-secondary text-white'
                  : 'border-slate-300'
              }`}
              title={tag.title}
              key={tag._id}
              onClick={
                selectedFilterTags.includes(tag._id)
                  ? () => setSelectedFilterTags(prev => prev.filter(id => id !== tag._id))
                  : () => setSelectedFilterTags(prev => [...prev, tag._id])
              }
            >
              {tag.title}
            </div>
          ))}
        </div>

        {/* Select Filter */}
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

          {/* Active */}
          <Input
            id="active"
            label="Active"
            disabled={false}
            register={register}
            errors={errors}
            icon={FaSort}
            type="select"
            onFocus={() => clearErrors('active')}
            options={[
              {
                value: '',
                label: 'All',
                selected: true,
              },
              {
                value: 'true',
                label: 'On',
              },
              {
                value: 'false',
                label: 'Off',
              },
            ]}
            className="min-w-[104px]"
          />

          {/* Flash Sale */}
          <Input
            id="flashSale"
            label="Flash Sale"
            disabled={false}
            register={register}
            errors={errors}
            icon={FaSort}
            type="select"
            onFocus={() => clearErrors('flashSale')}
            options={[
              {
                value: '',
                label: 'All',
                selected: true,
              },
              {
                value: 'true',
                label: 'On',
              },
              {
                value: 'false',
                label: 'Off',
              },
            ]}
            className="min-w-[124px]"
          />
        </div>

        {/* Action Buttons */}
        <div className="col-span-12 flex flex-wrap items-center justify-end gap-2">
          {/* Select All Button */}
          <button
            className="trans-200 rounded-lg border border-sky-400 px-3 py-2 text-sky-400 hover:bg-sky-400 hover:text-white"
            onClick={() =>
              setSelectedProducts(
                selectedProducts.length > 0 ? [] : products.map(product => product._id)
              )
            }
          >
            {selectedProducts.length > 0 ? 'Unselect All' : 'Select All'}
          </button>

          {/* Sync Many Button */}
          {!!selectedProducts.length && (
            <button
              className="trans-200 rounded-lg border border-purple-400 px-3 py-2 text-purple-400 hover:bg-purple-400 hover:text-white"
              onClick={() => handleSyncProducts(selectedProducts)}
            >
              Sync
            </button>
          )}

          {/* Boot Many Button */}
          {!!selectedProducts.length && (
            <button
              className="trans-200 rounded-lg border border-purple-400 px-3 py-2 text-purple-400 hover:bg-purple-400 hover:text-white"
              onClick={() => handleBootProducts(selectedProducts, true)}
            >
              Boot
            </button>
          )}

          {/* Deboot Many Button */}
          {!!selectedProducts.length && (
            <button
              className="trans-200 rounded-lg border border-purple-400 px-3 py-2 text-purple-400 hover:bg-purple-400 hover:text-white"
              onClick={() => handleBootProducts(selectedProducts, false)}
            >
              Deboot
            </button>
          )}

          {/* Activate Many Button */}
          {/* Only show activate button if at least 1 product is selected and at least 1 selected product is deactive */}
          {!!selectedProducts.length &&
            selectedProducts.some(id => !products.find(product => product._id === id)?.active) && (
              <button
                className="trans-200 rounded-lg border border-green-400 px-3 py-2 text-green-400 hover:bg-green-400 hover:text-white"
                onClick={() => handleActivateProducts(selectedProducts, true)}
              >
                Activate
              </button>
            )}

          {/* Deactivate Many Button */}
          {/* Only show deactivate button if at least 1 product is selected and at least 1 selected product is acitve */}
          {!!selectedProducts.length &&
            selectedProducts.some(id => products.find(product => product._id === id)?.active) && (
              <button
                className="trans-200 rounded-lg border border-red-500 px-3 py-2 text-red-500 hover:bg-red-500 hover:text-white"
                onClick={() => handleActivateProducts(selectedProducts, false)}
              >
                Deactivate
              </button>
            )}

          {/* Remove Flash Sale Many Button */}
          {!!selectedProducts.length &&
            selectedProducts.some(id => products.find(product => product._id === id)?.flashSale) && (
              <button
                className="trans-200 rounded-lg border border-red-500 px-3 py-2 text-red-500 hover:bg-red-500 hover:text-white"
                onClick={() => {
                  handleRemoveApplyingFlashSales(selectedProducts)
                }}
              >
                Remove Flash Sale
              </button>
            )}

          {/* Delete Many Button */}
          {!!selectedProducts.length && (
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
        title="Delete Products"
        content="Are you sure that you want to delete these products?"
        onAccept={() => handleDeleteProducts(selectedProducts)}
        isLoading={loadingProducts.length > 0}
      />

      {/* Amount */}
      <div className="p-3 text-right text-sm font-semibold text-white">
        {Math.min(itemPerPage * +(searchParams?.page || 1), amount)}/{amount} product
        {amount > 1 ? 's' : ''}
      </div>

      {/* MAIN LIST */}
      <div className="grid grid-cols-1 gap-21 md:grid-cols-2 lg:grid-cols-3">
        {products.map(product => (
          <ProductItem
            data={product}
            loadingProducts={loadingProducts}
            syncingProducts={syncingProducts}
            // selected
            selectedProducts={selectedProducts}
            setSelectedProducts={setSelectedProducts}
            // functions
            handleActivateProducts={handleActivateProducts}
            handleBootProducts={handleBootProducts}
            handleSyncProducts={handleSyncProducts}
            handleRemoveApplyingFlashSales={handleRemoveApplyingFlashSales}
            handleDeleteProducts={handleDeleteProducts}
            key={product._id}
          />
        ))}
      </div>
    </div>
  )
}

export default AllProductsPage
