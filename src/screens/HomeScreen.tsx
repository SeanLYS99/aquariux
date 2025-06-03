import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import moment from 'moment';
import React, {useEffect, useState} from 'react';
import {
  Alert,
  Button,
  FlatList,
  Image,
  Keyboard,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import LoaderKit from 'react-native-loader-kit';
import {DROPDOWN_OPTION, horizontalMargin} from '../constants/Common.constant';
import {useAppDispatch, useAppSelector} from '../hooks';
import {MovieResults} from '../interfaces/ApiMovieList.interface';
import {
  fetchMovieDetailByIdAction,
  fetchMovieListAction,
  searchMovieByTitleAction,
} from '../sagas/movies.saga';
import {setMovieList} from '../slice/movies.slice';

const CATEGORY_KEY = '@last_selected_category';

const dropdownOption = [
  {label: 'Now Playing', value: DROPDOWN_OPTION.NOW_PLAYING},
  {label: 'Upcoming', value: DROPDOWN_OPTION.UPCOMING},
  {label: 'Popular', value: DROPDOWN_OPTION.POPULAR},
];

export default function HomeScreen() {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<any>();
  const {
    data: movieList,
    loading,
    error,
  } = useAppSelector(state => state.movie.movieList);
  const {data: movieDetailData, error: movieDetailError} = useAppSelector(
    state => state.movie.movieDetail,
  );

  const [category, setCategory] = useState<any>(null);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [onPressLoading, setOnPressLoading] = useState(false);

  useEffect(() => {
    if (movieDetailData) {
      setOnPressLoading(false);
      navigation.navigate('DetailScreen');
    }
  }, [movieDetailData]);

  useEffect(() => {
    const loadCategory = async () => {
      try {
        const saved = await AsyncStorage.getItem(CATEGORY_KEY);
        if (saved) {
          setCategory(JSON.parse(saved));
        } else {
          setCategory(dropdownOption?.[0]);
        }
      } catch (e) {
        console.warn('Failed to load category from storage', e);
      }
    };
    loadCategory();
  }, []);

  useEffect(() => {
    if (movieDetailError) {
      Alert.alert(
        'Error',
        'Error fetching movie detail. Please try again later.',
        [{text: 'OK', onPress: () => {}}],
      );
    }
  }, [movieDetailError]);

  useEffect(() => {
    if (category) {
      const saveCategory = async () => {
        try {
          await AsyncStorage.setItem(CATEGORY_KEY, JSON.stringify(category));
        } catch (e) {
          console.warn('Failed to save category to storage', e);
        }
      };
      saveCategory();
      dispatch(fetchMovieListAction({category: category?.value}));
    }
  }, [category]);

  const onPressSearch = () => {
    Keyboard.dismiss();
    dispatch(setMovieList({data: null, loading: false, error: false}));
    if (!searchKeyword) {
      dispatch(fetchMovieListAction({category: category?.value}));
      return;
    }
    dispatch(searchMovieByTitleAction({title: searchKeyword}));
  };

  const subsequentFetchAction = () => {
    dispatch(
      fetchMovieListAction({
        category: category?.value,
        pageNo: (movieList?.page ?? 0) + 1,
      }),
    );
  };

  const renderMovieItem = ({item}: {item: MovieResults}) => (
    <TouchableOpacity
      style={styles.movieCard}
      onPress={() => {
        setOnPressLoading(true);
        dispatch(fetchMovieDetailByIdAction(item?.id));
      }}>
      <Image
        source={{uri: `https://image.tmdb.org/t/p/w500/${item?.poster_path}`}}
        style={styles.posterImage}
      />
      <View style={styles.movieInfo}>
        <Text style={styles.movieTitle}>{item?.title}</Text>
        <Text style={styles.movieDate}>
          {moment(item?.release_date).format('DD MMM YYYY')}
        </Text>
        <View style={styles.movieOverviewContainer}>
          <Text style={styles.movieOverview} numberOfLines={2}>
            {item?.overview}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderLoadMoreButton = () => {
    if (movieList?.page === movieList?.total_pages) {
      return <></>;
    }
    return (
      <View style={styles.loadMoreContainer}>
        {loading ? (
          <LoaderKit
            style={styles.loader}
            name={'BallSpinFadeLoader'}
            color={'#90CEA1'}
          />
        ) : error ? (
          <View style={styles.errorLabel}>
            <Text>Unable to retrieve movie list. Please try again.</Text>
            <Button title="Retry" onPress={subsequentFetchAction} />
          </View>
        ) : (
          <TouchableOpacity
            style={styles.loadMoreButton}
            onPress={subsequentFetchAction}>
            <Text style={styles.loadMoreText}>Load More</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <>
      <SafeAreaView style={styles.safeAreaContainer}>
        <View style={styles.container}>
          <View style={{marginHorizontal: horizontalMargin}}>
            <Image
              source={require('../assets/Logo.png')}
              resizeMode="contain"
              style={styles.logo}
            />
            <TouchableOpacity
              style={styles.filterContainer}
              onPress={() => setIsCategoryOpen(!isCategoryOpen)}>
              <View style={styles.filter}>
                <Text style={styles.filterLabel}>{category?.label}</Text>
                <View style={styles.rightIconContainer}>
                  <Image
                    source={require('../assets/chevron-right.png')}
                    style={[
                      styles.rightIcon,
                      {
                        transform: [
                          {
                            rotate: isCategoryOpen ? '90deg' : '0deg',
                          },
                        ],
                      },
                    ]}
                  />
                </View>
              </View>

              {isCategoryOpen && (
                <View style={styles.optionContainer}>
                  {dropdownOption.map((it, idx) => (
                    <TouchableOpacity
                      key={idx}
                      style={[
                        styles.option,
                        // eslint-disable-next-line react-native/no-inline-styles
                        {
                          marginBottom:
                            idx === dropdownOption.length - 1 ? 0 : 10,

                          backgroundColor:
                            category?.value === it?.value
                              ? '#00B4E4'
                              : '#F8F8F8',
                        },
                      ]}
                      onPress={() => {
                        dispatch(
                          setMovieList({
                            data: null,
                            loading: false,
                            error: false,
                          }),
                        );
                        setCategory(it);
                        setIsCategoryOpen(false);
                      }}>
                      <Text
                        style={{
                          color:
                            category?.value === it?.value ? 'white' : 'black',
                        }}>
                        {it.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </TouchableOpacity>

            <View style={styles.searchContainer}>
              <TextInput
                value={searchKeyword}
                onChangeText={setSearchKeyword}
                placeholder="Search..."
                placeholderTextColor={'#999999'}
                style={styles.textInput}
                returnKeyType="search"
                onSubmitEditing={onPressSearch}
              />
            </View>

            <TouchableOpacity
              activeOpacity={1}
              style={styles.searchButton}
              onPress={onPressSearch}>
              <Text style={styles.searchButtonText}>Search</Text>
            </TouchableOpacity>
          </View>
          {movieList && (
            <>
              <FlatList
                data={movieList?.results}
                keyExtractor={(item, idx) => `${item?.id?.toString()}-${idx}`}
                renderItem={renderMovieItem}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListFooterComponent={renderLoadMoreButton}
              />
            </>
          )}
          {loading && !movieList && (
            <LoaderKit
              style={styles.loader}
              name={'BallSpinFadeLoader'}
              color={'#90CEA1'}
            />
          )}
          {error && !movieList && (
            <View style={styles.errorLabel}>
              <Text>Unable to retrieve movie list. Please try again.</Text>
              <Button
                title="Retry"
                onPress={() =>
                  dispatch(
                    fetchMovieListAction({
                      category: category?.value,
                      pageNo: 1,
                    }),
                  )
                }
              />
            </View>
          )}
        </View>
      </SafeAreaView>
      {onPressLoading && (
        <>
          <View style={styles.fullPageBackground} />
          <View style={styles.fullPageLoaderContainer}>
            <LoaderKit
              style={styles.fullPageLoader}
              name={'BallSpinFadeLoader'}
              color={'#90CEA1'}
            />
          </View>
        </>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  safeAreaContainer: {
    height: '100%',
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
  },
  logo: {width: 80, height: 57, alignSelf: 'center'},
  selectedTextStyle: {fontWeight: 'bold'},
  filterContainer: {
    alignItems: 'center',
    marginTop: 20,
    width: '100%',
    borderRadius: 5,
    justifyContent: 'center',
    backgroundColor: '#FFF',
    minHeight: 50,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  filter: {
    flexDirection: 'row',
    height: 50,
  },
  optionContainer: {
    padding: 14,
    borderTopWidth: 1,
    borderColor: '#E3E3E3',
    width: '100%',
  },
  option: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 3,
  },
  filterLabel: {
    fontWeight: 'bold',
    alignSelf: 'center',
    marginLeft: 14,
  },
  rightIconContainer: {
    marginRight: 14,
    flex: 1,
    alignSelf: 'center',
    alignItems: 'flex-end',
  },
  rightIcon: {
    width: 9,
    height: 12,
  },
  searchContainer: {
    marginVertical: 20,
    borderRadius: 5,
    height: 50,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
    backgroundColor: '#FFF',
  },
  textInput: {
    height: 50,
    borderColor: '#CCC',
    paddingHorizontal: 12,
    fontSize: 16,
    fontWeight: 600,
  },

  searchButton: {
    backgroundColor: '#E4E4E4',
    height: 50,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  searchButtonText: {
    color: '#000000',
    opacity: 0.5,
    fontSize: 16,
    fontWeight: '600',
  },

  listContent: {
    paddingBottom: 16,
  },
  movieCard: {
    flexDirection: 'row',
    backgroundColor: '#F9F9F9',
    borderRadius: 5,
    marginTop: 20,
    marginHorizontal: horizontalMargin,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  posterImage: {
    width: 95,
    height: 141,
    borderStartStartRadius: 5,
    borderEndStartRadius: 5,
    resizeMode: 'cover',
  },
  movieInfo: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 20,
  },
  movieTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  movieDate: {
    fontSize: 14,
    fontWeight: '400',
    color: '#999999',
    marginVertical: 4,
  },
  movieOverviewContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  movieOverview: {
    fontSize: 14,
    fontWeight: '400',
    color: '#000',
  },
  loadMoreContainer: {
    marginHorizontal: horizontalMargin,
    marginTop: 20,
  },
  loadMoreButton: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 50,
    backgroundColor: '#00B4E4',
    borderRadius: 5,
  },
  loadMoreText: {
    fontWeight: '700',
    fontSize: 20,
    color: '#fff',
  },
  errorLabel: {
    marginHorizontal: horizontalMargin,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loader: {
    alignSelf: 'center',
    width: 40,
    height: 40,
  },
  fullPageBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'black',
    opacity: 0.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullPageLoaderContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullPageLoader: {
    width: 50,
    height: 50,
  },
});
