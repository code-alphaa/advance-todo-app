import { offlineStorage } from './storage';

// Safe dynamic loader to prevent crashing if native module is not yet compiled into the binary
async function getLocalAuthModule() {
  try {
    const LocalAuthentication = await import('expo-local-authentication');
    if (
      LocalAuthentication &&
      typeof LocalAuthentication.hasHardwareAsync === 'function' &&
      typeof LocalAuthentication.authenticateAsync === 'function'
    ) {
      return LocalAuthentication;
    }
    return null;
  } catch {
    return null;
  }
}

export const securityService = {
  // Check if device supports biometrics or phone passcode
  async isBiometricAvailable(): Promise<boolean> {
    try {
      const LocalAuth = await getLocalAuthModule();
      if (!LocalAuth) return false;
      const hasHardware = await LocalAuth.hasHardwareAsync();
      const isEnrolled = await LocalAuth.isEnrolledAsync();
      return Boolean(hasHardware && isEnrolled);
    } catch {
      return false;
    }
  },

  // Authenticate with phone passkey / biometrics
  async authenticateDevice(promptMessage: string = 'Unlock Note'): Promise<boolean> {
    try {
      const LocalAuth = await getLocalAuthModule();
      if (!LocalAuth) return false;

      const supported = await this.isBiometricAvailable();
      if (!supported) return false;

      const result = await LocalAuth.authenticateAsync({
        promptMessage,
        cancelLabel: 'Cancel',
        fallbackLabel: 'Use Passcode',
        disableDeviceFallback: false,
      });

      return Boolean(result && result.success);
    } catch (e) {
      console.warn('Device authentication failed or unlinked:', e);
      return false;
    }
  },

  // Custom password management
  async hasCustomPassword(): Promise<boolean> {
    try {
      const pwd = await offlineStorage.getNotesCustomPassword();
      return Boolean(pwd && pwd.trim().length > 0);
    } catch {
      return false;
    }
  },

  async verifyCustomPassword(password: string): Promise<boolean> {
    try {
      return await offlineStorage.verifyNotesCustomPassword(password);
    } catch {
      return false;
    }
  },

  async setCustomPassword(password: string): Promise<void> {
    try {
      await offlineStorage.setNotesCustomPassword(password);
    } catch (e) {
      console.error('Failed to set notes password:', e);
    }
  },
};
