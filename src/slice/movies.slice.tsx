import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {ApiMovieList} from '../interfaces/ApiMovieList.interface';

interface InitialStateModel {
  movieList: ApiMovieList | null;
}

const initialState: InitialStateModel = {
  movieList: null,
};

const movieSlice = createSlice({
  name: 'movie',
  initialState: initialState,
  reducers: {
    setMovieList: (state, action: PayloadAction<ApiMovieList | null>) => {
      state.movieList = action.payload;
    },
  },
});

export const movieReducer = movieSlice.reducer;
export const {setMovieList} = movieSlice.actions;
