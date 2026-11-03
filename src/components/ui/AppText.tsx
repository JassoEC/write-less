import { Text, type TextProps } from 'react-native';
import { useAppTheme } from '@/theme/theme-provider';

type Props = TextProps & { tone?: 'primary' | 'secondary' | 'muted' | 'danger'; weight?: 'regular' | 'medium' | 'semibold' | 'bold'; };
export function AppText({ tone = 'primary', weight = 'regular', style, ...props }: Props) {
  const { colors } = useAppTheme();
  const color = tone === 'secondary' ? colors.textSecondary : tone === 'muted' ? colors.textMuted : tone === 'danger' ? colors.danger : colors.text;
  const fontWeight = weight === 'regular' ? '400' : weight === 'medium' ? '500' : weight === 'semibold' ? '600' : '700';
  return <Text {...props} style={[{ color, fontWeight }, style]} />;
}
