/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import AppNavigator from './src/Navigation/Appnavigation';

AppRegistry.registerComponent(appName, () => AppNavigator);
