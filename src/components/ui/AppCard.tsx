import { View, type ViewProps } from 'react-native';
import { useAppTheme } from '@/theme/theme-provider';
export function AppCard({ style, ...props }: ViewProps) {
  const { colors } = useAppTheme();
  return <View {...props} style={[{ backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: 16, padding: 16 }, style]} />;
}
