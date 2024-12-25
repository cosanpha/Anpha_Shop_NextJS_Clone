import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export const user = createSlice({
  name: 'user',
  initialState: {
    balance: NaN,
  },
  reducers: {
    setUserBalance: (state, action: PayloadAction<number>) => {
      state.balance = action.payload
    },
  },
})

export const { setUserBalance } = user.actions
export default user.reducer
