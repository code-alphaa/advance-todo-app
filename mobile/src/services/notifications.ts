import * as Notifications from 'expo-notifications';

// The app shows its own in-app banner while open, so the system notification
// only contributes the phone's default sound and a Notification Center entry.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: false,
    shouldShowList: true,
  }),
});

export async function requestNotificationPermission(): Promise<void> {
  try {
    const current = await Notifications.getPermissionsAsync();
    if (current.ios?.status === Notifications.IosAuthorizationStatus.NOT_DETERMINED) {
      await Notifications.requestPermissionsAsync({
        ios: { allowAlert: true, allowBadge: false, allowSound: true },
      });
    }
  } catch (e) {
    console.error('Failed to request notification permission:', e);
  }
}

// Posts a notification immediately using the device's default notification sound
export async function playNotificationAlert(title: string, body: string): Promise<void> {
  try {
    await Notifications.scheduleNotificationAsync({
      content: { title, body, sound: 'default' },
      trigger: null,
    });
  } catch (e) {
    console.error('Failed to post notification:', e);
  }
}
