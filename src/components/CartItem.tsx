import { CartItemToAdd } from '@/app/api/cart/add/route'
import { useAppDispatch, useAppSelector } from '@/libs/hooks'
import {
  addCartItem,
  deleteCartItem,
  deleteLocalCartItem,
  setSelectedItems,
  updateCartItemQuantity,
  updateLocalCartItemQuantity,
} from '@/libs/reducers/cartReducer'
import { ICartItem } from '@/models/CartItemModel'
import { IFlashSale } from '@/models/FlashSaleModel'
import { IProduct } from '@/models/ProductModel'
import { addToCartApi, deleteCartItemApi, updateCartQuantityApi } from '@/requests'
import { formatPrice } from '@/utils/number'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'
import { memo, useCallback, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { FaHashtag, FaMinus, FaPlus, FaPlusSquare, FaTrashAlt } from 'react-icons/fa'
import { RiDonutChartFill } from 'react-icons/ri'
import { TbPackages } from 'react-icons/tb'
import ConfirmDialog from './ConfirmDialog'
import Price from './Price'

interface CartItemProps {
  cartItem: ICartItem
  localCartItem?: boolean
  className?: string
  isCheckout?: boolean
  isOrderDetailProduct?: boolean
}

function CartItem({
  cartItem,
  localCartItem,
  isCheckout,
  className = '',
  isOrderDetailProduct,
}: CartItemProps) {
  // hooks
  const dispatch = useAppDispatch()
  const { data: session } = useSession()
  const selectedCartItems = useAppSelector(state => state.cart.selectedItems)
  const curUser: any = session?.user

  // states
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isDeleting, setIsDeleting] = useState<boolean>(false)
  const [isOpenConfirmModal, setIsOpenConfirmModal] = useState<boolean>(false)

  // values
  const inputRef = useRef<any>({})
  const quantity = cartItem.quantity

  // MARK: Delete
  // handle delete cart item
  const handleDeleteCartItem = useCallback(async () => {
    // start deleting
    setIsDeleting(true)

    try {
      const { deletedCartItem, message } = await deleteCartItemApi(cartItem._id)
      dispatch(deleteCartItem(deletedCartItem._id))

      // show toast success
      toast.success(message)
    } catch (err: any) {
      console.log(err)
      toast.error(err.message)
    } finally {
      // stop deleting
      setIsDeleting(false)
      setIsOpenConfirmModal(false)
    }
  }, [dispatch, cartItem._id])

  // handle delete LOCAL cart item
  const handleDeleteLocalCartItem = useCallback(() => {
    dispatch(deleteLocalCartItem(cartItem._id))
  }, [cartItem._id, dispatch])

  // MARK: Sync
  // handle move local cart item to global cart
  const handleMoveLocalToGlobalCartItem = useCallback(async () => {
    // add to database cart
    // handle add product to cart - DATABASE
    setIsLoading(true)

    try {
      // send request to add product to cart
      const { cartItems, message, errors } = await addToCartApi([
        { productId: cartItem.productId, quantity: cartItem.quantity },
      ] as CartItemToAdd[])

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

      // add cart item to state
      dispatch(addCartItem(cartItems))

      // delete local cart item
      handleDeleteLocalCartItem()
    } catch (err: any) {
      console.log(err)
      toast.error(err.message)
    } finally {
      // stop loading
      setIsLoading(false)
    }
  }, [handleDeleteLocalCartItem, cartItem.productId, dispatch, setIsLoading, cartItem.quantity])

  // MARK: Update Quantity
  // update cart item quantity in database
  const updateQuantityGlobal = useCallback(
    async (value: number) => {
      try {
        // start loading
        setIsLoading(true)
        // send request to update cart quantity
        const { updatedCartItem } = await updateCartQuantityApi(cartItem._id, value)

        // update cart item in store
        dispatch(updateCartItemQuantity({ id: updatedCartItem._id, quantity: updatedCartItem.quantity }))
      } catch (err: any) {
        console.log(err)
        toast.error(err.message)
      } finally {
        // stop loading
        setIsLoading(false)
      }
    },
    [cartItem._id, dispatch]
  )

  // update cart quantity
  const updateQuantity = useCallback(
    async (type: 'input' | 'button', value: number) => {
      if (type === 'button') {
        // decrease
        if (value === -1) {
          if (quantity <= 1) return
          if (curUser) {
            dispatch(
              updateCartItemQuantity({
                id: cartItem._id,
                quantity: quantity - 1,
              })
            )
            updateQuantityGlobal(quantity - 1)
          } else {
            dispatch(
              updateLocalCartItemQuantity({
                id: cartItem._id,
                quantity: quantity - 1,
              })
            )
          }
        }
        // increase
        else if (value === 1) {
          if (quantity >= (cartItem.product as IProduct).stock) return
          if (curUser) {
            dispatch(
              updateCartItemQuantity({
                id: cartItem._id,
                quantity: quantity + 1,
              })
            )
            updateQuantityGlobal(quantity + 1)
          } else {
            dispatch(
              updateLocalCartItemQuantity({
                id: cartItem._id,
                quantity: quantity + 1,
              })
            )
          }
        }
      }

      if (type === 'input') {
        // start input
        inputRef.current.isInputing = true

        if (curUser) {
          dispatch(updateCartItemQuantity({ id: cartItem._id, quantity: value }))
        } else {
          dispatch(updateLocalCartItemQuantity({ id: cartItem._id, quantity: value }))
        }

        // continue input
        clearTimeout(inputRef.current.timeOut)

        // stop input after 1s if no input
        inputRef.current.timeOut = setTimeout(() => {
          inputRef.current.isInputing = false
        }, 1000)

        // update quantity after 1s if no input
        setTimeout(() => {
          if (!inputRef.current.isInputing) {
            if (value <= 1) {
              if (curUser) {
                dispatch(updateCartItemQuantity({ id: cartItem._id, quantity: 1 }))
                setTimeout(() => {
                  updateQuantityGlobal(1)
                }, 1000)
              } else {
                setTimeout(() => {
                  dispatch(updateLocalCartItemQuantity({ id: cartItem._id, quantity: 1 }))
                }, 0)
              }
            }
            if (value > (cartItem.product as IProduct).stock) {
              if (curUser) {
                dispatch(
                  updateCartItemQuantity({
                    id: cartItem._id,
                    quantity: (cartItem.product as IProduct).stock,
                  })
                )
                updateQuantityGlobal((cartItem.product as IProduct).stock)
              } else {
                dispatch(
                  updateLocalCartItemQuantity({
                    id: cartItem._id,
                    quantity: (cartItem.product as IProduct).stock,
                  })
                )
              }
            } else {
              if (curUser) {
                updateQuantityGlobal(value)
              } else {
                dispatch(updateLocalCartItemQuantity({ id: cartItem._id, quantity: value }))
              }
            }
          }
        }, 1010)
      }
    },
    [updateQuantityGlobal, dispatch, cartItem._id, cartItem.product, curUser, quantity]
  )

  return (
    <div
      className={`trans-200 relative flex cursor-pointer flex-wrap items-start gap-3 md:flex-nowrap ${className} ${
        localCartItem ? '' : 'rounded-medium border p-21'
      } ${
        !!selectedCartItems.find(cI => cI._id === cartItem._id) ? 'border-primary' : 'border-slate-400'
      }`}
      onClick={() =>
        dispatch(
          setSelectedItems(
            selectedCartItems.find(cI => cI._id === cartItem._id)
              ? selectedCartItems.filter(cI => cI._id !== cartItem._id)
              : [...selectedCartItems, cartItem]
          )
        )
      }
    >
      {/* MARK: Thumbnails */}
      <div className="relative">
        {(cartItem.product as IProduct).stock <= 0 && (
          <Link
            href={`/${(cartItem.product as IProduct).slug}`}
            prefetch={false}
            className="absolute bottom-0 left-0 right-0 top-0 z-10 flex aspect-video items-start justify-center rounded-lg bg-white bg-opacity-50"
          >
            <Image
              className="-mt-1 animate-wiggle"
              src="/images/sold-out.jpg"
              width={34}
              height={34}
              alt="sold-out"
            />
          </Link>
        )}

        <Link
          href={`/${(cartItem.product as IProduct).slug}`}
          prefetch={false}
          className="block aspect-video max-w-[150px] overflow-hidden rounded-lg shadow-lg"
          onClick={e => e.stopPropagation()}
        >
          <div className="no-scrollbar flex w-full snap-x snap-mandatory overflow-x-scroll">
            {(cartItem.product as IProduct).images.map(src => (
              <Image
                className="w-full flex-shrink snap-start"
                src={src}
                width={150}
                height={150}
                alt={`/${(cartItem.product as IProduct).slug}`}
                key={src}
              />
            ))}
          </div>
        </Link>
      </div>

      {/* Local action buttons */}
      {localCartItem && !isCheckout && (
        <div className="group absolute right-4 top-1 z-10 flex flex-col gap-2">
          {isLoading ? (
            <RiDonutChartFill
              size={24}
              className="animate-spin text-slate-300"
            />
          ) : (
            <FaPlusSquare // add to database cart
              size={21}
              className="wiggle-1 cursor-pointer text-primary"
              onClick={handleMoveLocalToGlobalCartItem}
            />
          )}

          <FaTrashAlt // delete
            size={21}
            className="wiggle-1 cursor-pointer text-secondary"
            onClick={handleDeleteLocalCartItem}
          />
        </div>
      )}

      {/* MARK: Checkbox */}
      {!localCartItem && (
        <input
          type="checkbox"
          className="absolute right-21 top-21 z-10 size-5 cursor-pointer accent-primary"
          checked={!!selectedCartItems.find(cI => cI._id === cartItem._id)}
          onChange={() =>
            dispatch(
              setSelectedItems(
                selectedCartItems.find(cI => cI._id === cartItem._id)
                  ? selectedCartItems.filter(cI => cI._id !== cartItem._id)
                  : [...selectedCartItems, cartItem]
              )
            )
          }
        />
      )}

      {/* MARK: Body */}
      <div className={`relative h-full w-full ${localCartItem && !isCheckout ? 'pr-10' : ''}`}>
        {/* Title */}
        <h2 className={`mb-2 pr-8 text-[20px] leading-6 tracking-wide`}>
          {(cartItem.product as IProduct).title}
        </h2>

        {/* Info */}
        {isOrderDetailProduct && (
          <div className="flex justify-between">
            {/* (Order Detail) Quantity */}
            <div className="flex items-center gap-1 text-[16px]">
              <FaHashtag
                className="text-darker"
                size={16}
              />
              <span className="text-nowrap font-bold text-darker">Số lượng:</span>
              <span className="text-green-500">{cartItem.quantity}</span>
            </div>

            {/* (Order Detail) Price */}
            <div className="flex items-center gap-1 text-[16px]">
              <FaHashtag
                className="text-darker"
                size={16}
              />
              <span className="text-nowrap font-bold text-darker">Giá:</span>
              <span className="text-green-500">
                {formatPrice((cartItem.product as IProduct).price * cartItem.quantity)}
              </span>
            </div>
          </div>
        )}

        {/* Quantity - Price - Stock*/}
        {localCartItem ? (
          !isOrderDetailProduct && (
            <div className="flex flex-col gap-3 font-body text-xl tracking-wide">
              {/* Quantity */}
              <div className="flex items-center gap-1 text-[16px]">
                <FaHashtag
                  className="text-darker"
                  size={16}
                />
                <span className="text-nowrap font-bold text-darker">Số lượng:</span>
                <span className="text-green-500">{cartItem.quantity}</span>
              </div>
            </div>
          )
        ) : (
          <>
            {/* Price & Stock */}
            <Price
              price={(cartItem.product as IProduct).price}
              oldPrice={(cartItem.product as IProduct).oldPrice}
              stock={(cartItem.product as IProduct).stock}
              flashSale={(cartItem.product as IProduct).flashSale as IFlashSale}
              big
            />
            <div className="mt-2 flex items-center gap-1 text-[16px]">
              <TbPackages
                className="text-darker"
                size={22}
              />
              <span className="text-nowrap font-body font-bold tracking-wide text-darker">Còn lại:</span>
              <span className="text-green-500">{(cartItem.product as IProduct).stock}</span>
            </div>
          </>
        )}

        {/* MARK: Quantity */}
        {!localCartItem && (
          <div className="flex items-center justify-between">
            <div
              className={`my-3 inline-flex select-none overflow-hidden rounded-md ${className}`}
              onClick={e => e.stopPropagation()}
            >
              <button
                className={`trans-200 group flex items-center justify-center rounded-bl-md rounded-tl-md border px-3 py-[10px] hover:bg-secondary ${
                  quantity <= 1 || isLoading
                    ? 'pointer-events-none border-slate-100 bg-slate-100'
                    : 'border border-secondary bg-white'
                }`}
                disabled={quantity <= 1 || isLoading}
                onClick={() => updateQuantity('button', -1)}
              >
                {isLoading ? (
                  <RiDonutChartFill
                    size={16}
                    className="animate-spin text-slate-300"
                  />
                ) : (
                  <FaMinus
                    size={16}
                    className={`wiggle group-hover:text-white ${
                      quantity <= 1 || isLoading ? 'text-slate-300' : 'text-secondary'
                    }`}
                  />
                )}
              </button>
              <input
                className="number-input max-w-14 border-y border-slate-100 px-2 text-center font-body text-lg font-semibold text-dark outline-none"
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                value={quantity}
                disabled={isLoading || (cartItem.product as IProduct).stock <= 0}
                onWheel={e => e.currentTarget.blur()}
                onChange={e => updateQuantity('input', +e.target.value)}
              />

              <button
                className={`trans-200 group flex items-center justify-center rounded-br-md rounded-tr-md border px-3 py-[10px] hover:bg-secondary ${
                  quantity >= (cartItem.product as IProduct)?.stock! || isLoading
                    ? 'pointer-events-none border-slate-100 bg-slate-100'
                    : 'border-secondary bg-white'
                }`}
                disabled={quantity >= (cartItem.product as IProduct)?.stock! || isLoading}
                onClick={() => updateQuantity('button', 1)}
              >
                {isLoading ? (
                  <RiDonutChartFill
                    size={16}
                    className="animate-spin text-slate-300"
                  />
                ) : (
                  <FaPlus
                    size={16}
                    className={`wiggle group-hover:text-white ${
                      quantity >= cartItem.product?.stock! || isLoading
                        ? 'text-slate-300'
                        : 'text-secondary'
                    }`}
                  />
                )}
              </button>
            </div>

            <FaTrashAlt
              size={21}
              className="trans-200 wiggle cursor-pointer text-secondary hover:scale-110"
              onClick={e => {
                e.stopPropagation()
                setIsOpenConfirmModal(true)
              }}
            />

            {/* Confirm Dialog */}
            <ConfirmDialog
              open={isOpenConfirmModal}
              setOpen={setIsOpenConfirmModal}
              title="Xóa sản phẩm khỏi giỏ hàng"
              content="Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng không?"
              onAccept={() => (curUser ? handleDeleteCartItem() : handleDeleteLocalCartItem())}
              isLoading={isDeleting}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default memo(CartItem)
