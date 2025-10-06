import { configureStore } from "@reduxjs/toolkit";
import todosReducer from "../redux/features/todoSlice";
import authReducer from "../redux/features/authSlice";

const store = configureStore({
  reducer: {
    todos: todosReducer,
    auth: authReducer,
  },
});
export default store;
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;

