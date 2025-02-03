// This file is a fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight } from 'expo-symbols';
import React from 'react';
import { OpaqueColorValue, StyleProp, TextStyle, ViewStyle, StyleSheet } from 'react-native';

// Add your SFSymbol to MaterialIcons mappings here.
const MAPPING = {
  // See MaterialIcons here: https://icons.expo.fyi
  // See SF Symbols in the SF Symbols app on Mac.
  'house.before': 'home',
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'favorite.before':'favorite-outline',
  'favorite.after':'favorite',
  'chat':'chat-bubble-outline',
  'chat.after':'chat-bubble',
  'add':'add-circle-outline',
  'account':'account-circle',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
} as const;

// Указываем точный список допустимых значений
export type IconSymbolName = keyof typeof MAPPING;

/**
 * An icon component that uses native SFSymbols on iOS, and MaterialIcons on Android and web. This ensures a consistent look across platforms, and optimal resource usage.
 *
 * Icon `name`s are based on SFSymbols and require manual mapping to MaterialIcons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<ViewStyle>;
  weight?: SymbolWeight;
}) {
  // Приводим стиль к TextStyle, чтобы избежать ошибки типов
  const textStyle: StyleProp<TextStyle> = StyleSheet.flatten(style) as TextStyle;

  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={textStyle} />;

}
