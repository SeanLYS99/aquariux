import {useNavigation} from '@react-navigation/native';
import moment from 'moment';
import React from 'react';
import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {Circle, Svg} from 'react-native-svg';
import {horizontalMargin} from '../constants/Common.constant';
import {useAppSelector} from '../hooks';

export default function DetailScreen() {
  const navigation = useNavigation();
  const {data} = useAppSelector(state => state.movie.movieDetail);

  function formatMinutes(totalMinutes: number): string {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${minutes}m`;
  }

  function fontStyle(weight: string | number, size: number) {
    return {
      fontWeight: `${weight}`,
      fontSize: size,
    } as any;
  }

  const renderUserScoreLabel = (base, exponent) => {
    return (
      <View style={{flexDirection: 'row', gap: 2}}>
        <View style={{alignItems: 'flex-end', marginLeft: 5}}>
          <Text style={[styles.whiteText, fontStyle(700, 18)]}>{base}</Text>
        </View>
        <View style={{alignItems: 'flex-start'}}>
          <Text style={[styles.whiteText, {fontSize: 6, marginTop: 5}]}>
            {exponent}
          </Text>
        </View>
      </View>
    );
  };

  const BG_SIZE = 60;
  const RING_OUTER_RADIUS = 22;
  const STROKE_WIDTH = 4;

  // Compute circumference:
  const C = 2 * Math.PI * RING_OUTER_RADIUS;
  // How much of that circumference is "filled" (green arc)?
  const userScore = Math.round((data?.vote_average || 0) * 10);

  const filled = Math.round((userScore / 100) * C);

  function renderCreditsSection() {
    // 1. Build a map from title → [names]
    const byTitle: Record<string, string[]> = {};

    data?.crew.forEach((c: any) => {
      //  a) If this member is a Director, group under "Director"
      if (c.job === 'Director') {
        if (!byTitle['Director']) byTitle['Director'] = [];
        byTitle['Director'].push(c.name);
      }
      //  b) If this member’s job string contains "Writer" OR their department is "Writing",
      //     group under "Writer"
      else if (c.job.includes('Writer') || c.department === 'Writing') {
        if (!byTitle['Writer']) byTitle['Writer'] = [];
        byTitle['Writer'].push(c.name);
      }
    });

    // 2. Convert that map into an array of { title, names }
    //    so we can render them in a stable order (Director first, then Writer).
    const crewList = Object.entries(byTitle)
      .map(([title, names]) => ({
        title,
        names: names.join(', '),
      }))
      .sort((a, b) => {
        // Ensure "Director" always appears before "Writer"
        if (a.title === 'Director' && b.title !== 'Director') return -1;
        if (b.title === 'Director' && a.title !== 'Director') return 1;
        // Otherwise, alphabetical by title
        return a.title.localeCompare(b.title);
      });
    return (
      <View style={styles.crewContainer}>
        {crewList.map((member, idx) => (
          <View key={idx} style={styles.crewMember}>
            <Text style={styles.crewName}>{member.names}</Text>
            <Text style={styles.crewTitle}>{member.title}</Text>
          </View>
        ))}
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeAreaContainer}>
      <Image
        source={require('../assets/Logo.png')}
        resizeMode="contain"
        style={styles.logo}
      />
      <ScrollView style={styles.container}>
        <View style={styles.blueBg}>
          <View>
            <View style={styles.darkBg} />
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Image
                source={require('../assets/back.png')}
                style={styles.backIcon}
              />
            </TouchableOpacity>

            <View style={styles.titleContainer}>
              <Text
                numberOfLines={1}
                style={[
                  styles.whiteText,
                  fontStyle(600, 24),
                ]}>{`${data?.title} `}</Text>
              <Text
                numberOfLines={1}
                style={[styles.whiteText, styles.releaseDate]}>{`(${moment(
                data?.release_date,
              ).year()})`}</Text>
            </View>
            <View style={styles.poster}>
              <Image
                source={{
                  uri: `https://image.tmdb.org/t/p/w500/${data?.poster_path}`,
                }}
                style={styles.posterImage}
              />
              <View style={styles.movieInfo}>
                <Text
                  style={[
                    styles.movieDate,
                    styles.whiteText,
                    fontStyle(400, 16),
                  ]}>
                  {`${moment(data?.release_date).format('DD/MM/YYYY')} (${
                    data?.origin_country
                  }) • ${formatMinutes(data?.runtime as number)}`}
                </Text>
                <Text style={[styles.whiteText, fontStyle(400, 16)]}>
                  {data?.genres?.reduce((acc, curr) => {
                    if (acc === '') {
                      return curr.name;
                    }
                    return acc + ', ' + curr.name;
                  }, '')}
                </Text>
                <View style={styles.flexDirectionRow}>
                  <Text style={[styles.whiteText, fontStyle(600, 16)]}>
                    {`Status: `}
                  </Text>
                  <Text style={[styles.whiteText, fontStyle(400, 16)]}>
                    {data?.status}
                  </Text>
                </View>
                <View style={styles.flexDirectionRow}>
                  <Text style={[styles.whiteText, fontStyle(600, 16)]}>
                    {`Original Language: `}
                  </Text>
                  <Text style={[styles.whiteText, fontStyle(400, 16)]}>
                    {
                      data?.spoken_languages?.find(
                        it => it?.iso_639_1 === data?.original_language,
                      )?.name
                    }
                  </Text>
                </View>
              </View>
            </View>
          </View>
          <View style={styles.progressBarContainer}>
            <View style={styles.flexDirectionRow}>
              <View style={styles.flex1}>
                <View style={styles.userScoreContainer}>
                  <Svg width={BG_SIZE} height={BG_SIZE}>
                    {/* ① Black circle background (fills the entire 60×60) */}
                    <Circle
                      cx={BG_SIZE / 2}
                      cy={BG_SIZE / 2}
                      r={BG_SIZE / 2}
                      fill="#042541"
                    />

                    {/* ② Gray base ring (full circle, “unfilled” portion) */}
                    <Circle
                      cx={BG_SIZE / 2}
                      cy={BG_SIZE / 2}
                      r={RING_OUTER_RADIUS}
                      stroke="#D0D2D366" // gray color for unfilled
                      strokeWidth={STROKE_WIDTH}
                      fill="none"
                    />

                    {/* ③ Green progress arc (clockwise from top) */}
                    <Circle
                      cx={BG_SIZE / 2}
                      cy={BG_SIZE / 2}
                      r={RING_OUTER_RADIUS}
                      stroke="#45FF8F" // green color for filled
                      strokeWidth={STROKE_WIDTH}
                      fill="none"
                      strokeDasharray={`${filled}, ${Math.round(C)}`}
                      strokeDashoffset="0"
                      transform={`rotate(-90, ${BG_SIZE / 2}, ${BG_SIZE / 2})`}
                    />
                  </Svg>
                  <View style={styles.userScore}>
                    {renderUserScoreLabel(userScore, '%')}
                  </View>
                </View>
                <Text style={styles.userScoreLabel}>User Score</Text>
              </View>
              <View style={styles.flex1}>{renderCreditsSection()}</View>
            </View>
            <Text style={styles.tagline}>{data?.tagline}</Text>
            <View style={styles.overviewContainer}>
              <Text style={[styles.largeText, styles.whiteText]}>Overview</Text>
              <Text style={[styles.whiteText, fontStyle(400, 16)]}>
                {data?.overview}
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.castMembers}>
          <Text
            style={[fontStyle(600, 22), {marginHorizontal: horizontalMargin}]}>
            Top Billed Cast
          </Text>
          <ScrollView horizontal>
            {data?.cast?.map((it, idx) => (
              <View
                style={[
                  styles.castMembersCard,
                  {
                    marginLeft: idx === 0 ? horizontalMargin : 15,
                    marginRight:
                      idx === data?.cast?.length - 1 ? horizontalMargin : 0,
                  },
                ]}>
                <Image
                  source={{
                    uri: `https://image.tmdb.org/t/p/w500/${it?.profile_path}`,
                  }}
                  style={styles.castProfile}
                  width={139}
                  height={154}
                />
                <View style={styles.casterDetail}>
                  <Text style={fontStyle(700, 18)} numberOfLines={2}>
                    {it?.original_name}
                  </Text>
                  <Text style={fontStyle(400, 16)} numberOfLines={1}>
                    {it?.character}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeAreaContainer: {
    height: '100%',
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    marginTop: 20,
  },
  logo: {
    width: 80,
    height: 57,
    alignSelf: 'center',
  },
  blueBg: {
    backgroundColor: '#00B4E4',
  },
  darkBg: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'black',
    opacity: 0.15,
  },
  backIcon: {
    width: 31,
    height: 38,
    color: '#000',
    position: 'absolute',
    top: 20,
    left: horizontalMargin - 10,
  },
  poster: {
    width: '100%',
    flexDirection: 'row',
    paddingHorizontal: horizontalMargin,
    paddingVertical: 30,
  },
  posterImage: {
    width: 112.28,
    height: 150,
    resizeMode: 'cover',
    borderRadius: 5,
  },
  movieInfo: {
    flex: 1,
    paddingHorizontal: 14,
    gap: 8,
  },
  movieDate: {
    marginVertical: 4,
  },
  titleContainer: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 38,
    paddingHorizontal: horizontalMargin + 50,
  },
  whiteText: {
    color: '#fff',
  },
  flexDirectionRow: {
    flexDirection: 'row',
  },
  releaseDate: {
    fontWeight: '400',
    fontSize: 20,
  },
  scoreAndCrew: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 20,
  },
  userScore: {
    position: 'absolute',
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userScoreContainer: {
    alignItems: 'center',
    width: 60,
  },
  userScoreLabel: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 6,
  },
  crewContainer: {
    marginHorizontal: 16,
  },
  crewMember: {
    marginBottom: 12, // spacing between each Director/Writer block
  },
  crewName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  crewTitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    fontWeight: '400',
    marginTop: 2,
  },
  tagline: {
    fontWeight: '400',
    fontSize: 20,
    fontStyle: 'italic',
    color: '#FFF',
  },
  overviewContainer: {
    marginTop: 20,
    gap: 20,
  },
  largeText: {
    fontWeight: '700',
    fontSize: 24,
  },
  progressBarContainer: {
    flex: 1,
    paddingHorizontal: horizontalMargin,
    paddingVertical: 30,
  },
  flex1: {
    flex: 1,
  },
  castMembers: {
    marginVertical: 20,
  },
  castMembersCard: {
    width: 139,
    borderRadius: 5,
    height: 244,
    backgroundColor: '#fff',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
    marginVertical: 20,
  },
  castProfile: {
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    backgroundColor: 'lightgray',
  },
  casterDetail: {
    padding: 10,
    gap: 2,
  },
});
