import { ICartItem } from '@/models/CartItemModel'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

// Define a function to access localStorage safely
const getLocalCartItems = (): ICartItem[] => {
  return typeof window !== 'undefined'
    ? (JSON.parse(localStorage.getItem('localCart') ?? '[]') as ICartItem[])
    : []
}

export const cart = createSlice({
  name: 'cart',
  initialState: {
    items: [] as ICartItem[],
    localItems: getLocalCartItems(),
    selectedItems: [] as ICartItem[],
  },
  reducers: {
    // MARK: GLOCAL CART
    setCartItems: (state, action: PayloadAction<ICartItem[]>) => {
      return {
        ...state,
        items: action.payload,
      }
    },
    addCartItem: (state, action: PayloadAction<ICartItem[]>) => {
      // Initialize an array to store updated items
      let updatedItems: ICartItem[] = [...state.items]

      // Loop through each item in the payload
      action.payload.forEach(item => {
        // Check if the item already exists in the cart
        const existingCartItemIndex = state.items.findIndex(cartItem => cartItem._id === item._id)

        // If the item exists, update its quantity
        if (existingCartItemIndex !== -1) {
          updatedItems[existingCartItemIndex] = item
        } else {
          // If the item does not exist, add it to the cart
          updatedItems.unshift(item)
        }
      })

      // Return the updated state with the new items
      return {
        ...state,
        items: updatedItems,
      }
    },
    deleteCartItem: (state, action: PayloadAction<string>) => {
      return {
        ...state,
        items: state.items.filter(item => item._id !== action.payload),
      }
    },
    updateCartItemQuantity: (state, action: PayloadAction<{ id: string; quantity: number }>) => {
      return {
        ...state,
        items: state.items.map(item =>
          item._id === action.payload.id ? { ...item, quantity: action.payload.quantity } : item
        ),
      }
    },

    // MARK: LOCAL CART
    setLocalCartItems: (state, action: PayloadAction<ICartItem[]>) => {
      // set localStorage
      localStorage.setItem('localCart', JSON.stringify(action.payload))

      return {
        ...state,
        localItems: action.payload,
      }
    },
    addLocalCartItem: (state, action: PayloadAction<ICartItem>) => {
      // if cart item has already existed in cart -> increase quantity
      const existedCartItem = state.localItems.find(item => item._id === action.payload._id)
      if (existedCartItem) {
        // update localStorage
        localStorage.setItem(
          'localCart',
          JSON.stringify(
            state.localItems.map(item =>
              item._id === action.payload._id ? { ...item, quantity: action.payload.quantity } : item
            )
          )
        )

        return {
          ...state,
          localItems: state.localItems.map(item =>
            item._id === action.payload._id ? { ...item, quantity: action.payload.quantity } : item
          ),
        }
      }

      // update localStorage
      localStorage.setItem('localCart', JSON.stringify([action.payload, ...state.localItems]))

      // if cart item does not exist in cart -> add to cart
      return {
        ...state,
        localItems: [action.payload, ...state.localItems],
      }
    },
    deleteLocalCartItem: (state, action: PayloadAction<string>) => {
      // update localStorage
      localStorage.setItem(
        'localCart',
        JSON.stringify(state.localItems.filter(item => item._id !== action.payload))
      )

      return {
        ...state,
        localItems: state.localItems.filter(item => item._id !== action.payload),
      }
    },
    updateLocalCartItemQuantity: (state, action: PayloadAction<{ id: string; quantity: number }>) => {
      // update localStorage
      localStorage.setItem(
        'localCart',
        JSON.stringify(
          state.localItems.map(item =>
            item._id === action.payload.id ? { ...item, quantity: action.payload.quantity } : item
          )
        )
      )

      return {
        ...state,
        localItems: state.localItems.map(item =>
          item._id === action.payload.id ? { ...item, quantity: action.payload.quantity } : item
        ),
      }
    },

    // MARK: Checkout
    setSelectedItems: (state, action: PayloadAction<ICartItem[]>) => {
      return {
        ...state,
        selectedItems: action.payload,
      }
    },
  },
})

export const {
  // database cart
  setCartItems,
  addCartItem,
  deleteCartItem,
  updateCartItemQuantity,

  // local cart
  setLocalCartItems,
  addLocalCartItem,
  deleteLocalCartItem,
  updateLocalCartItemQuantity,

  // checkout
  setSelectedItems,
} = cart.actions
export default cart.reducer
