import Device from '@/utils/device';
import globalStyles from '@/utils/globalStyles';
import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';
import { ToastProvider as Provider } from 'react-native-toast-notifications';

type Props = {
  children: React.ReactNode;
};

const getBorderColor = (type: string | undefined) => {
  switch (type) {
    case 'success':
      return 'border-green-500';
    case 'danger':
      return 'border-red-500';
    case 'warning':
      return 'border-orange-300';
    default:
      return 'border-gray-400';
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

const getIconColor = (type: string | undefined) => {
  switch (type) {
    case 'success':
      return 'green';
    case 'danger':
      return 'red';
    case 'warning':
      return 'orange';
    default:
      return 'gray';
  }
};

export default function Toast({ children }: Props) {
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
          className={`border-l-[6px] border-r-[6px] ${getBorderColor(type)} p-4 flex flex-row items-center gap-x-2 bg-white rounded-[30px] max-w-[90%]`}
          style={globalStyles.shadow}
        >
          <Ionicons
            name={getIconName(type)}
            size={Device.getDeviceWidth() * 0.07}
            color={getIconColor(type)}
          />
          <Text className="text-base font-[Poppins] flex-1">{message}</Text>
        </View>
      )}
    >
      {children}
    </Provider>
  );
}
