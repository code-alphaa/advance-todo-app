import { registerRootComponent } from 'expo';

import App from './App';
// Registers the background calendar sync task at startup (must run at module scope)
import './src/services/calendarAutoSync';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
