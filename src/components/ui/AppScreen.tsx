import { View, type ViewProps } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
import { useAppTheme } from '@/theme/theme-provider';
type Props = ViewProps & { edges?: Edge[]; };
export function AppScreen({ edges = ['top'], style, ...props }: Props) {
  const { colors } = useAppTheme();
  return <SafeAreaView edges={edges} style={{ flex: 1, backgroundColor: colors.background }}><View {...props} style={[{ flex: 1 }, style]} /></SafeAreaView>;
}
