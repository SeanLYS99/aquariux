import Config from 'react-native-config';

const options = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${Config.API_KEY}`,
  },
};
