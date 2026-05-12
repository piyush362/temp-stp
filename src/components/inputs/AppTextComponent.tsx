import React from 'react';
import { Text, TextProps } from 'react-native';

// Create a custom Text component with font scaling disabled
export const AppText: React.FC<TextProps> = (props) => (
  <Text {...props} allowFontScaling={false}>
    {props.children}
  </Text>
);

export default AppText;
