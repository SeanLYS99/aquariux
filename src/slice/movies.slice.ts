import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {ApiMovieDetail} from '../interfaces/ApiMovieDetail.interface';
import {ApiMovieList} from '../interfaces/ApiMovieList.interface';

interface InitialStateModel {
  movieList: {data: ApiMovieList | null; loading: boolean; error: boolean};
  movieDetail: {data: ApiMovieDetail | null; loading: boolean; error: boolean};
}

const initialState: InitialStateModel = {
  movieList: {data: null, loading: false, error: false},
  movieDetail: {data: null, loading: false, error: false},
};

const movieSlice = createSlice({
  name: 'movie',
  initialState: initialState,
  reducers: {
    setMovieList: (
      state,
      action: PayloadAction<{
        data: ApiMovieList | null;
        loading: boolean;
        error: boolean;
      }>,
    ) => {
      state.movieList = action.payload;
    },
    setMovieDetail: (
      state,
      action: PayloadAction<{
        data: ApiMovieDetail | null;
        loading: boolean;
        error: boolean;
      }>,
    ) => {
      state.movieDetail = action.payload;
    },
  },
});

export const movieReducer = movieSlice.reducer;
export const {setMovieList, setMovieDetail} = movieSlice.actions;
