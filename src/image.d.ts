//this along with https://github.com/chakra-ui/chakra-ui/issues/7266 lets us import an image for gaze tracing. idk if its safe to move this file

declare module '*.png' {
    const value: import('react-native').ImageSourcePropType;
    export default value;
  }