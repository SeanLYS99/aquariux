import {Dimensions} from 'react-native';

export const deviceWidth = Dimensions.get('window').width;
export const deviceHeight = Dimensions.get('window').height;
export const horizontalMargin = Math.round(deviceWidth * 0.05);

export const DROPDOWN_OPTION = {
  NOW_PLAYING: 'now_playing',
  UPCOMING: 'upcoming',
  POPULAR: 'popular',
};
