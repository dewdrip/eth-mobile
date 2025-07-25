import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { useSelector } from 'react-redux';
import { Token } from '../store/reducers/Tokens';
import CreatePassword from './Authentication/CreatePassword';
import CreateWallet from './Authentication/CreateWallet';
import ImportWallet from './Authentication/ImportWallet';
import Login from './Authentication/Login';
import Onboarding from './Authentication/Onboarding';
import WalletSetup from './Authentication/WalletSetup';
import Dashboard from './Dashboard';
import DebugContracts from './DebugContracts';
import Home from './Home';
import NFTs from './NFTs';
import Settings from './Settings';
import TokenDetails from './TokenDetails';
import Tokens from './Tokens';
import Transactions from './Transactions';
import ERC20TokenTransfer from './Transfer/ERC20TokenTransfer';
import NetworkTokenTransfer from './Transfer/NetworkTokenTransfer';
import NFTTokenTransfer from './Transfer/NFTTokenTransfer';
import Wallet from './Wallet';

type Props = {};

type AppStackParamsList = {
  Onboarding: undefined;
  WalletSetup: undefined;
  ImportWallet: undefined;
  CreateWallet: undefined;
  CreatePassword: undefined;
  Login: undefined;
  Dashboard: undefined;
  NetworkTokenTransfer: undefined;
  ERC20TokenTransfer: {
    token: Token;
  };
  NFTTokenTransfer: {
    token: {
      address: string;
      id: number;
      symbol: string;
    };
  };
  TokenDetails: {
    token: Token;
  };
  Tokens: undefined;
  NFTs: undefined;
  Transactions: undefined;
  Home: undefined;
  Wallet: undefined;
  Settings: undefined;
  DebugContracts: undefined;
};

const AppStack = createNativeStackNavigator<AppStackParamsList>();

export default function Navigation({}: Props) {
  const auth = useSelector((state: any) => state.auth);

  return (
    <NavigationContainer>
      <AppStack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right'
        }}
      >
        {!auth.isLoggedIn && (
          <>
            <AppStack.Screen name="Onboarding" component={Onboarding} />
            <AppStack.Screen name="WalletSetup" component={WalletSetup} />
            <AppStack.Screen name="ImportWallet" component={ImportWallet} />
            <AppStack.Screen name="CreateWallet" component={CreateWallet} />
            <AppStack.Screen name="CreatePassword" component={CreatePassword} />
          </>
        )}
        <AppStack.Screen name="Login" component={Login} />
        <AppStack.Screen name="Dashboard" component={Dashboard} />
        <AppStack.Screen
          name="NetworkTokenTransfer"
          component={NetworkTokenTransfer}
        />
        <AppStack.Screen
          name="ERC20TokenTransfer"
          component={ERC20TokenTransfer}
        />
        <AppStack.Screen name="NFTTokenTransfer" component={NFTTokenTransfer} />
        <AppStack.Screen name="TokenDetails" component={TokenDetails} />
        <AppStack.Screen name="Tokens" component={Tokens} />
        <AppStack.Screen name="NFTs" component={NFTs} />
        <AppStack.Screen name="Transactions" component={Transactions} />
        <AppStack.Screen name="Home" component={Home} />
        <AppStack.Screen name="Settings" component={Settings} />
        <AppStack.Screen name="Wallet" component={Wallet} />
        <AppStack.Screen name="DebugContracts" component={DebugContracts} />
      </AppStack.Navigator>
    </NavigationContainer>
  );
}
