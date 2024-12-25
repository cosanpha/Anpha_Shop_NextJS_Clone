'use client'

import { useAppDispatch, useAppSelector } from '@/libs/hooks'
import { addCartItem, addLocalCartItem } from '@/libs/reducers/cartReducer'
import { setPageLoading } from '@/libs/reducers/modalReducer'
import { ICartItem } from '@/models/CartItemModel'
import { IFlashSale } from '@/models/FlashSaleModel'
import { IProduct } from '@/models/ProductModel'
import { addToCartApi } from '@/requests'
import { applyFlashSalePrice, countPercent } from '@/utils/number'
import mongoose from 'mongoose'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { memo, useCallback, useState } from 'react'
import toast from 'react-hot-toast'
import { FaCartPlus } from 'react-icons/fa'
import { FaCircleCheck } from 'react-icons/fa6'
import { MdEdit } from 'react-icons/md'
import { RiDonutChartFill } from 'react-icons/ri'
import Price from './Price'

interface ProductCardProps {
  product: IProduct
  className?: string
}

function ProductCard({ product, className = '' }: ProductCardProps) {
  // hooks
  const dispatch = useAppDispatch()
  const localCart = useAppSelector(state => state.cart.localItems)
  const router = useRouter()
  const { data: session } = useSession()
  const curUser: any = session?.user

  // states
  const [isLoading, setIsLoading] = useState<boolean>(false)

  // values
  // const isDisabled = isLoading || product.stock <= 0 || !curUser?._id
  const isDisabled = isLoading || product.stock <= 0

  // MARK: Add
  // add product to cart - DATABASE
  const addProductToCart = useCallback(async () => {
    // start loading
    setIsLoading(true)

    try {
      // send request to add product to cart
      const { cartItems, message, errors } = await addToCartApi([
        { productId: product._id, quantity: 1 },
      ])

      // show toast success
      if (message) {
        toast.success(message)
      }
      if (errors.notEnough) {
        toast.error(errors.notEnough)
      }
      if (errors.notFound) {
        toast.error(errors.notFound)
      }

      // add cart items to state
      dispatch(addCartItem(cartItems))
    } catch (err: any) {
      console.log(err)
      toast.error(err.message)
    } finally {
      // stop loading
      setIsLoading(false)
    }
  }, [dispatch, product._id])

  // handle add product to cart - LOCAL
  const addProductToLocalCart = useCallback(() => {
    // add product to local cart
    // create cart item from product
    const existingCartItem = localCart.find(
      (item: ICartItem) => item.productId.toString() === product._id
    )

    // product has already existed in cart
    if (existingCartItem) {
      // if not enough products in stock
      if (existingCartItem.quantity + 1 > product.stock) {
        toast.error('Hiện không đủ sản phẩm để thêm vào giỏ hàng của bạn. Xin lỗi vì sự bất tiện này')
        return
      }

      dispatch(addLocalCartItem({ ...existingCartItem, quantity: existingCartItem.quantity + 1 }))

      // success toast
      toast.success(`Đã thêm gói "${product.title}" vào giỏ hàng`)
      return
    }

    // product has not existed in user cart
    // if not enough products in stock
    if (1 > product.stock) {
      toast.error('Hiện không đủ sản phẩm để thêm vào giỏ hàng của bạn. Xin lỗi vì sự bất tiện này')
      return
    }

    // still have enough products in stock
    // create new cart item
    const newCartItem = {
      _id: new mongoose.Types.ObjectId().toHexString(),
      userId: curUser?._id,
      productId: product._id,
      product,
      quantity: 1,
    }

    // add new cart item to local cart
    dispatch(addLocalCartItem(newCartItem as ICartItem))

    // success toast
    toast.success(`Đã thêm gói "${product.title}" vào giỏ hàng`)
    return
  }, [curUser?._id, dispatch, localCart, product])

  // MARK: Buy
  // handle buy now (add to cart and move to cart) - DATABASE
  const buyNow = useCallback(async () => {
    // start page loading
    dispatch(setPageLoading(true))

    try {
      // send request to add product to cart
      const { cartItems, message, errors } = await addToCartApi([
        { productId: product._id, quantity: 1 },
      ])

      // show toast success
      if (message) {
        toast.success(message)
      }
      if (errors.notEnough) {
        toast.error(errors.notEnough)
      }
      if (errors.notFound) {
        toast.error(errors.notFound)
      }

      // add cart items to state
      dispatch(addCartItem(cartItems))

      // move to cart page
      router.push(`/cart?product=${product.slug}`)
    } catch (err: any) {
      console.log(err)
    }
  }, [product._id, dispatch, product.slug, router])

  // handle buy now (add to cart and move to cart) - LOCAL
  const buyNowLocal = useCallback(() => {
    addProductToLocalCart()

    // move to cart page
    router.push(`/cart?product=${product.slug}`)
  }, [addProductToLocalCart, product.slug, router])

  // MARK: Handlers
  // handle add product to cart
  const handleAddToCart = useCallback(
    async (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault()

      if (curUser) {
        addProductToCart()
      } else {
        addProductToLocalCart()
      }
    },
    [curUser, addProductToCart, addProductToLocalCart]
  )

  // handle buy now
  const handleBuyNow = useCallback(
    async (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault()

      if (curUser) {
        buyNow()
      } else {
        buyNowLocal()
      }
    },
    [curUser, buyNow, buyNowLocal]
  )

  return (
    <div
      className={`relative h-full min-h-[430px] w-full rounded-xl bg-white p-4 shadow-lg transition duration-500 hover:-translate-y-1 ${className}`}
    >
      {/* MARK: Sold out */}
      {product.stock <= 0 && (
        <Link
          href={`/${product.slug}`}
          prefetch={false}
          className="absolute left-4 right-4 top-4 z-10 flex aspect-video items-start justify-center rounded-lg bg-white bg-opacity-50"
        >
          <Image
            className="-mt-1 animate-wiggle"
            src="/images/sold-out.jpg"
            width={60}
            height={60}
            alt="sold-out"
          />
        </Link>
      )}

      {/* MARK: Thumbnails */}
      <Link
        href={`/${product.slug}`}
        prefetch={false}
        className="relative block aspect-video overflow-hidden rounded-lg shadow-lg"
      >
        <div className="flex w-full snap-x snap-mandatory overflow-x-scroll">
          {product.images.map(src => (
            <Image
              className="h-full w-full flex-shrink-0 snap-start object-cover"
              src={src}
              width={400}
              height={400}
              alt="netflix"
              key={src}
            />
          ))}
        </div>
      </Link>

      {/* Badge */}
      {product.oldPrice && product.stock > 0 && (
        <div className="absolute -left-2 -top-2 z-10 max-w-10 rounded-br-lg rounded-tl-lg bg-yellow-400 p-1 text-center font-body text-[13px] font-semibold leading-4 text-white">
          Giảm{' '}
          {countPercent(
            applyFlashSalePrice(product.flashSale as IFlashSale, product.price),
            product.oldPrice
          )}
        </div>
      )}

      {/* Title */}
      <Link
        href={`/${product.slug}`}
        prefetch={false}
      >
        <h3
          className="my-3 font-body text-[18px] leading-[22px] tracking-wide text-dark"
          title={product.title}
        >
          {product.title}
        </h3>
      </Link>

      {/* Price */}
      <Price
        price={product.price}
        oldPrice={product.oldPrice}
        flashSale={product.flashSale as IFlashSale}
        stock={product.stock}
        className="mb-2"
      />

      {/* Basic Information */}
      <div className="flex items-center font-body tracking-wide">
        <FaCircleCheck
          size={16}
          className="text-darker"
        />
        <span className="ml-1 font-bold text-darker">Đã bán:</span>
        <span className="ml-1 text-red-500">{product.sold}</span>
      </div>

      {/* MARK: Action Buttons */}
      <div className="mt-2 flex items-center justify-end gap-2 md:justify-start">
        <button
          className={`trans-200 text-nowrap rounded-md bg-secondary px-2 py-[5px] font-body font-semibold tracking-wider text-white hover:bg-primary ${
            isDisabled ? 'pointer-events-none bg-slate-200' : ''
          }`}
          onClick={handleBuyNow}
          disabled={isDisabled}
        >
          MUA NGAY
        </button>
        <button
          className={`hover:bg-primary-600 trans-200 group rounded-md bg-primary px-3 py-2 hover:bg-secondary ${
            isDisabled ? 'pointer-events-none bg-slate-200' : ''
          }`}
          onClick={handleAddToCart}
          disabled={isDisabled}
        >
          {isLoading ? (
            <RiDonutChartFill
              size={18}
              className="animate-spin text-white"
            />
          ) : (
            <FaCartPlus
              size={18}
              className="wiggle text-white"
            />
          )}
        </button>
        {['admin', 'editor'].includes(curUser?.role) && (
          <Link
            href={`/admin/product/all?_id=${product?._id}`}
            className="hover:bg-primary-600 trans-200 group flex h-[34px] items-center justify-center rounded-md border border-yellow-400 px-3"
          >
            <MdEdit
              size={18}
              className="wiggle text-yellow-400"
            />
          </Link>
        )}
      </div>
    </div>
  )
}

export default memo(ProductCard)
