import { Pressable, StyleSheet, type PressableProps } from 'react-native';
import { AppText } from './AppText';
import { useAppTheme } from '@/theme/theme-provider';

type Props = PressableProps & { label: string; variant?: 'primary' | 'secondary' | 'danger'; };
export function AppButton({ label, variant = 'primary', style, ...props }: Props) {
  const { colors } = useAppTheme();
  const backgroundColor = variant === 'primary' ? colors.primary : variant === 'danger' ? colors.danger : colors.surfaceSecondary;
  const textColor = variant === 'primary' ? colors.onPrimary : variant === 'danger' ? '#FFFFFF' : colors.text;
  return <Pressable accessibilityRole="button" {...props} style={[styles.button, { backgroundColor }, style]}><AppText style={{ color: textColor }} weight="semibold">{label}</AppText></Pressable>;
}
const styles = StyleSheet.create({ button: { alignItems: 'center', justifyContent: 'center', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 13 } });
