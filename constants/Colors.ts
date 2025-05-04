/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#0077CC';
const tintColorDark = '#1E88E5';

export const Colors = {
  light: {
    text: '#1A1A1A',
    background: '#F9F9F9',
    primary: '#0077CC',
    secondary: '#E0E0E0',
    accent:'#FF6B00',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: tintColorDark,
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#FFFFFF',
    background: '#121212',
    primary: '#1E88E5',
    secondary: '#2C2C2C',
    accent:'#FF9100',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: tintColorDark,
    tabIconSelected: tintColorDark,
  },
};
