import {createAction, PayloadAction} from '@reduxjs/toolkit';
import Config from 'react-native-config';
import {call, put, select, takeEvery} from 'redux-saga/effects';
import {setMovieList} from '../slice/movies.slice';

const options = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${Config.API_KEY}`,
  },
};

export function* fetchMovieList(
  action: PayloadAction<{
    category: string;
    pageNo: number;
  }>,
): Generator<any> {
  try {
    const {category, pageNo = 1} = action.payload;
    const movieList = yield select(state => state.movie.movieList);
    const response = yield call(
      fetch,
      `https://api.themoviedb.org/3/movie/${category}?language=en-US&page=${pageNo}`,
      options,
    );
    const data = yield response.json();
    if (data) {
      yield put(
        setMovieList(
          movieList
            ? {
                ...data,
                results: [...movieList?.results, ...data?.results],
              }
            : data,
        ),
      );
    }
  } catch (error) {
    console.log({error});
  }
}

export function* searchMovieByTitle(
  action: PayloadAction<{
    title: string;
    pageNo: number;
  }>,
): Generator<any> {
  try {
    const {title, pageNo = 1} = action.payload;
    const movieList = yield select(state => state.movie.movieList);
    const response = yield call(
      fetch,
      `https://api.themoviedb.org/3/search/movie?query=${title}&page=${pageNo}`,
      options,
    );
    const data = yield response.json();
    if (data) {
      yield put(
        setMovieList(
          movieList
            ? {
                ...data,
                results: [...movieList?.results, ...data?.results],
              }
            : data,
        ),
      );
    }
  } catch (error) {
    console.log({error});
  }
}

export function* MovieSaga() {
  yield takeEvery(fetchMovieListAction.type, fetchMovieList);
  yield takeEvery(searchMovieByTitleAction.type, searchMovieByTitle);
}

export const fetchMovieListAction = createAction<{
  category: string;
  pageNo?: number;
}>('fetchMovieListAction');
export const searchMovieByTitleAction = createAction<{
  title: string;
  pageNo?: number;
}>('searchMovieByTitleAction');
