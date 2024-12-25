import { configureStore } from '@reduxjs/toolkit'
import cartReducer from './reducers/cartReducer'
import modalReducer from './reducers/modalReducer'
import userReducer from './reducers/userReducer'

export const makeStore = () => {
  return configureStore({
    reducer: {
      user: userReducer,
      modal: modalReducer,
      cart: cartReducer,
    },
    devTools: process.env.NODE_ENV !== 'production',
  })
}

export type AppStore = ReturnType<typeof makeStore>
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']
