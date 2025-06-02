import {all} from 'redux-saga/effects';
import {MovieSaga} from './movies.saga';

function* rootSaga() {
  yield all([MovieSaga()]);
}

export default rootSaga;
