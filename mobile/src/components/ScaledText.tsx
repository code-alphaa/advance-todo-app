import React, { createContext, useContext } from 'react';
import {
  Text as RNText,
  TextInput as RNTextInput,
  TextProps,
  TextInputProps,
  StyleSheet,
  TextStyle,
} from 'react-native';
import { useFontScale } from '../theme/fontScale';

// React Native's default font size when a style doesn't set one
const BASE_FONT_SIZE = 14;

// Nested <Text> inherits its parent's (already scaled) size unless it sets its own
const InsideTextContext = createContext(false);

function scaleStyle(style: TextProps['style'], scale: number, applyDefault: boolean) {
  if (scale === 1) return style;
  const flat = (StyleSheet.flatten(style) || {}) as TextStyle;
  const scaled: TextStyle = {};
  if (flat.fontSize != null) scaled.fontSize = flat.fontSize * scale;
  else if (applyDefault) scaled.fontSize = BASE_FONT_SIZE * scale;
  if (flat.lineHeight != null) scaled.lineHeight = flat.lineHeight * scale;
  return [style, scaled];
}

// Drop-in replacement for react-native's Text that follows the app's A-/A+ setting
export const Text: React.FC<TextProps> = ({ style, ...rest }) => {
  const { scale } = useFontScale();
  const isNested = useContext(InsideTextContext);
  return (
    <InsideTextContext.Provider value={true}>
      <RNText {...rest} style={scaleStyle(style, scale, !isNested)} />
    </InsideTextContext.Provider>
  );
};

export const TextInput = React.forwardRef<RNTextInput, TextInputProps>(({ style, ...rest }, ref) => {
  const { scale } = useFontScale();
  return <RNTextInput ref={ref} {...rest} style={scaleStyle(style, scale, true)} />;
});
TextInput.displayName = 'TextInput';
