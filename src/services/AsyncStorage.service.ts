import AsyncStorageStatic from '@react-native-async-storage/async-storage';

export const AsyncSetItem = async (key: string, value: string) => {
  await AsyncStorageStatic.setItem(key, value);
};

export const AsyncGetItem = async (key: string) => {
  return AsyncStorageStatic.getItem(key);
};

export const AsyncClearItems = async () => {
  return AsyncStorageStatic.clear();
};
