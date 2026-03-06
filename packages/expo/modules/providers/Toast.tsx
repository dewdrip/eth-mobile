import { useTheme } from '@/theme';
import Device from '@/utils/device';
import globalStyles from '@/utils/globalStyles';
import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';
import { ToastProvider as Provider } from 'react-native-toast-notifications';

type Props = {
  children: React.ReactNode;
};

const getBorderColor = (
  type: string | undefined,
  colors: import('@/theme').ThemeColors
) => {
  switch (type) {
    case 'success':
      return colors.success;
    case 'danger':
      return colors.error;
    case 'warning':
      return colors.warning;
    default:
      return colors.border;
  }
};

const getIconName = (type: string | undefined) => {
  switch (type) {
    case 'success':
      return 'trophy-outline';
    case 'danger':
      return 'flag-outline';
    case 'warning':
      return 'warning-outline';
    default:
      return 'chatbubble-ellipses-outline';
  }
};

export default function Toast({ children }: Props) {
  const { colors } = useTheme();
  const iconColor = (type: string | undefined) => {
    switch (type) {
      case 'success':
        return colors.success;
      case 'danger':
        return colors.error;
      case 'warning':
        return colors.warning;
      default:
        return colors.textMuted;
    }
  };
  return (
    <Provider
      placement="top"
      duration={5000}
      animationType="zoom-in"
      animationDuration={250}
      textStyle={{ fontSize: 20 }}
      offset={50}
      swipeEnabled={true}
      renderToast={({ message, type }) => (
        <View
          className="border-l-[6px] border-r-[6px] p-4 flex flex-row items-center gap-x-2 rounded-[30px] max-w-[90%]"
          style={[
            globalStyles.shadow,
            {
              backgroundColor: colors.surface,
              borderLeftColor: getBorderColor(type, colors),
              borderRightColor: getBorderColor(type, colors)
            }
          ]}
        >
          <Ionicons
            name={getIconName(type)}
            size={Device.getDeviceWidth() * 0.07}
            color={iconColor(type)}
          />
          <Text
            className="text-base font-[Poppins] flex-1"
            style={{ color: colors.text }}
          >
            {message}
          </Text>
        </View>
      )}
    >
      {children}
    </Provider>
  );
}
