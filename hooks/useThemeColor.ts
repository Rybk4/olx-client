/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors } from '@/constants/Colors';
import { useTheme } from './useTheme';

export function useThemeColor(props: { light?: string; dark?: string }, colorName: keyof typeof Colors.light) {
    const { isDarkTheme } = useTheme();
    const colorFromProps = props[isDarkTheme ? 'dark' : 'light'];

    if (colorFromProps) {
        return colorFromProps;
    } else {
        return Colors.getTheme(isDarkTheme)[colorName];
    }
}

