import {createAction, PayloadAction} from '@reduxjs/toolkit';
import Config from 'react-native-config';
import {call, put, select, takeEvery} from 'redux-saga/effects';
import {setMovieDetail, setMovieList} from '../slice/movies.slice';

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
  const movieList = yield select(state => state.movie.movieList);
  try {
    yield put(
      setMovieList({
        ...movieList,
        loading: true,
        error: false,
      }),
    );
    const {category, pageNo = 1} = action.payload;
    const response = yield call(
      fetch,
      `https://api.themoviedb.org/3/movie/${category}?language=en-US&page=${pageNo}`,
      options,
    );

    const data = yield response.json();
    if (data) {
      yield put(
        setMovieList({
          ...movieList,
          loading: false,
          error: false,
          data:
            movieList?.data && movieList?.data?.page !== data?.page
              ? {
                  ...data,
                  results: [...movieList?.data?.results, ...data?.results],
                }
              : data,
        }),
      );
    }
  } catch (error) {
    yield put(
      setMovieList({
        ...movieList,
        loading: false,
        error: true,
      }),
    );
  }
}

export function* searchMovieByTitle(
  action: PayloadAction<{
    title: string;
    pageNo: number;
  }>,
): Generator<any> {
  const movieList = yield select(state => state.movie.movieList);

  try {
    yield put(
      setMovieList({
        ...movieList,
        loading: true,
        error: false,
      }),
    );
    const {title, pageNo = 1} = action.payload;
    const response = yield call(
      fetch,
      `https://api.themoviedb.org/3/search/movie?query=${title}&page=${pageNo}`,
      options,
    );
    const data = yield response.json();
    if (data) {
      yield put(
        setMovieList({
          ...movieList,
          loading: false,
          error: false,
          data: movieList.data
            ? {
                ...data,
                results: [...movieList?.data?.results, ...data?.results],
              }
            : data,
        }),
      );
    }
  } catch (error) {
    yield put(
      setMovieList({
        ...movieList,
        loading: false,
        error: true,
      }),
    );
  }
}

export function* fetchMovieDetailById(
  action: PayloadAction<number>,
): Generator<any> {
  const movieDetail = yield select(state => state.movie.movieDetail);

  try {
    yield put(
      setMovieDetail({
        ...movieDetail,
        loading: true,
        error: false,
      }),
    );
    const movieId = action.payload;
    const response = yield call(
      fetch,
      `https://api.themoviedb.org/3/movie/${movieId}?language=en-US`,
      options,
    );
    const creditResponse = yield call(
      fetch,
      `https://api.themoviedb.org/3/movie/${movieId}/credits?language=en-US`,
      options,
    );
    const data = yield response.json();
    const creditData = yield creditResponse.json();

    if (data && creditData) {
      yield put(
        setMovieDetail({
          ...movieDetail,
          loading: false,
          error: false,
          data: {
            ...data,
            crew: creditData?.crew ?? [],
            cast: creditData?.cast ?? [],
          },
        }),
      );
    } else {
      yield put(
        setMovieDetail({
          ...movieDetail,
          loading: false,
          error: true,
        }),
      );
    }
  } catch (error) {
    yield put(
      setMovieDetail({
        ...movieDetail,
        loading: false,
        error: true,
      }),
    );
  }
}

export function* MovieSaga() {
  yield takeEvery(fetchMovieListAction.type, fetchMovieList);
  yield takeEvery(searchMovieByTitleAction.type, searchMovieByTitle);
  yield takeEvery(fetchMovieDetailByIdAction.type, fetchMovieDetailById);
}

export const fetchMovieListAction = createAction<{
  category: string;
  pageNo?: number;
}>('fetchMovieListAction');
export const searchMovieByTitleAction = createAction<{
  title: string;
  pageNo?: number;
}>('searchMovieByTitleAction');
export const fetchMovieDetailByIdAction = createAction<number>(
  'fetchMovieDetailByIdAction',
);
