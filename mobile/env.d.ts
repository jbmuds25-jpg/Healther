/// <reference types="react-native" />

// Global definitions for React Native
declare const __DEV__: boolean;
declare const require: any;

// Module augmentations
declare module '*.ttf' {
  const content: string;
  export default content;
}
