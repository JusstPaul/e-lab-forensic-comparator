import { configureStore } from '@reduxjs/toolkit'
import { answersReducer } from './answersReducer'

export default configureStore({
  reducer: answersReducer,
})
