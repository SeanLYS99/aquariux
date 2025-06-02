import {configureStore} from '@reduxjs/toolkit';
import rootSaga from './sagas/index.saga';
import rootReducer from './slice/index.slice';
const createSagaMiddleware = require('redux-saga').default;

const sagaMiddleware = createSagaMiddleware();
const store = configureStore({
  reducer: rootReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware().concat(sagaMiddleware),
});
sagaMiddleware.run(rootSaga);

export default store;

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
