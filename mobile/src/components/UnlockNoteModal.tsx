import React, { useState, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Text, TextInput } from './ScaledText';
import { Lock, Fingerprint, KeyRound, Eye, EyeOff, X } from 'lucide-react-native';
import { CenterModal } from './CenterModal';
import { PressableScale } from './PressableScale';
import { ThemeColors } from '../theme/colors';
import { securityService } from '../services/security';

interface UnlockNoteModalProps {
  theme: ThemeColors;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  noteTitle?: string;
}

export const UnlockNoteModal: React.FC<UnlockNoteModalProps> = ({
  theme,
  isOpen,
  onClose,
  onSuccess,
  noteTitle,
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [hasCustomPwd, setHasCustomPwd] = useState(false);
  const [isSettingNewPwd, setIsSettingNewPwd] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [loadingBio, setLoadingBio] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setErrorMsg('');
      setIsSettingNewPwd(false);

      securityService
        .hasCustomPassword()
        .then((has) => setHasCustomPwd(has))
        .catch(() => setHasCustomPwd(false));

      securityService
        .isBiometricAvailable()
        .then((avail) => {
          setBiometricAvailable(avail);
          if (avail) {
            handleDeviceAuth();
          }
        })
        .catch(() => setBiometricAvailable(false));
    }
  }, [isOpen]);

  const handleDeviceAuth = async () => {
    try {
      setLoadingBio(true);
      setErrorMsg('');
      const success = await securityService.authenticateDevice('Unlock Locked Note');
      setLoadingBio(false);
      if (success) {
        onSuccess();
        onClose();
      }
    } catch (e) {
      setLoadingBio(false);
      console.warn('Device authentication exception:', e);
    }
  };

  const handlePasswordSubmit = async () => {
    try {
      setErrorMsg('');
      if (!password.trim()) {
        setErrorMsg('Please enter your password');
        return;
      }

      const valid = await securityService.verifyCustomPassword(password.trim());
      if (valid) {
        setPassword('');
        onSuccess();
        onClose();
      } else {
        setErrorMsg('Incorrect password. Try again.');
      }
    } catch (e) {
      console.error('Password verification error:', e);
      setErrorMsg('Error verifying password');
    }
  };

  const handleSaveNewPassword = async () => {
    try {
      setErrorMsg('');
      if (!newPassword.trim()) {
        setErrorMsg('Password cannot be empty');
        return;
      }
      if (newPassword.trim().length < 4) {
        setErrorMsg('Password must be at least 4 characters');
        return;
      }
      if (newPassword !== confirmPassword) {
        setErrorMsg('Passwords do not match');
        return;
      }

      await securityService.setCustomPassword(newPassword.trim());
      setHasCustomPwd(true);
      setIsSettingNewPwd(false);
      onSuccess();
      onClose();
    } catch (e) {
      console.error('Save password error:', e);
      setErrorMsg('Failed to save password');
    }
  };

  return (
    <CenterModal theme={theme} isOpen={isOpen} onClose={onClose}>
      <View
        style={[
          styles.container,
          {
            backgroundColor: theme.bgCard,
            borderColor: theme.border,
          },
        ]}
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <View style={[styles.iconWrap, { backgroundColor: theme.accentSubtle }]}>
            <Lock size={20} color={theme.accent} />
          </View>
          <View style={styles.titleWrap}>
            <Text style={[styles.title, { color: theme.textMain }]}>Locked Note</Text>
            <Text style={[styles.subTitle, { color: theme.textMuted }]} numberOfLines={1}>
              {noteTitle || 'Protected content'}
            </Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <X size={16} color={theme.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Biometric / Phone Passkey Option */}
        {biometricAvailable && !isSettingNewPwd && (
          <PressableScale
            onPress={handleDeviceAuth}
            activeScale={0.96}
            style={[styles.bioButton, { backgroundColor: theme.accent }]}
            disabled={loadingBio}
          >
            {loadingBio ? (
              <ActivityIndicator size="small" color={theme.textOnAccent} />
            ) : (
              <Fingerprint size={18} color={theme.textOnAccent} />
            )}
            <Text style={[styles.bioButtonText, { color: theme.textOnAccent }]}>
              Unlock with Phone Passkey / Biometrics
            </Text>
          </PressableScale>
        )}

        {/* Divider if biometrics is available */}
        {biometricAvailable && !isSettingNewPwd && (
          <View style={styles.dividerRow}>
            <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
            <Text style={[styles.dividerText, { color: theme.textMuted }]}>OR USE PASSWORD</Text>
            <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
          </View>
        )}

        {/* Custom Password View */}
        {!isSettingNewPwd ? (
          hasCustomPwd ? (
            <View style={styles.pwdSection}>
              <View style={[styles.inputBox, { borderColor: theme.border, backgroundColor: theme.bgApp }]}>
                <KeyRound size={16} color={theme.textMuted} />
                <TextInput
                  value={password}
                  onChangeText={(t) => {
                    setPassword(t);
                    if (errorMsg) setErrorMsg('');
                  }}
                  placeholder="Enter custom password"
                  placeholderTextColor={theme.textMuted}
                  secureTextEntry={!showPassword}
                  style={[styles.input, { color: theme.textMain }]}
                  autoCapitalize="none"
                  returnKeyType="done"
                  onSubmitEditing={handlePasswordSubmit}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                >
                  {showPassword ? (
                    <EyeOff size={16} color={theme.textMuted} />
                  ) : (
                    <Eye size={16} color={theme.textMuted} />
                  )}
                </TouchableOpacity>
              </View>

              {errorMsg ? (
                <Text style={[styles.errorText, { color: theme.urgentRed }]}>{errorMsg}</Text>
              ) : null}

              <PressableScale
                onPress={handlePasswordSubmit}
                activeScale={0.95}
                style={[styles.actionBtn, { backgroundColor: theme.accent }]}
              >
                <Text style={[styles.actionBtnText, { color: theme.textOnAccent }]}>
                  Unlock Note
                </Text>
              </PressableScale>

              <TouchableOpacity
                onPress={() => {
                  setErrorMsg('');
                  setIsSettingNewPwd(true);
                }}
                style={styles.changePwdLink}
              >
                <Text style={[styles.changePwdText, { color: theme.accent }]}>
                  Change custom password
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            /* No custom password configured yet */
            <View style={styles.noPwdSection}>
              <Text style={[styles.noPwdText, { color: theme.textSecondary }]}>
                {biometricAvailable
                  ? 'No custom password set yet. You can also configure a custom password as a backup.'
                  : 'No custom password is set for notes. Create a password to protect your notes.'}
              </Text>
              <PressableScale
                onPress={() => setIsSettingNewPwd(true)}
                activeScale={0.95}
                style={[styles.outlineBtn, { borderColor: theme.accent }]}
              >
                <KeyRound size={15} color={theme.accent} />
                <Text style={[styles.outlineBtnText, { color: theme.accent }]}>
                  Set Custom Password
                </Text>
              </PressableScale>
            </View>
          )
        ) : (
          /* Set New Password Form */
          <View style={styles.pwdSection}>
            <Text style={[styles.setPwdHeading, { color: theme.textMain }]}>
              Set Custom Password
            </Text>

            <View style={[styles.inputBox, { borderColor: theme.border, backgroundColor: theme.bgApp }]}>
              <TextInput
                value={newPassword}
                onChangeText={(t) => {
                  setNewPassword(t);
                  if (errorMsg) setErrorMsg('');
                }}
                placeholder="New password (min 4 chars)"
                placeholderTextColor={theme.textMuted}
                secureTextEntry={!showPassword}
                style={[styles.input, { color: theme.textMain }]}
                autoCapitalize="none"
              />
            </View>

            <View style={[styles.inputBox, { borderColor: theme.border, backgroundColor: theme.bgApp }]}>
              <TextInput
                value={confirmPassword}
                onChangeText={(t) => {
                  setConfirmPassword(t);
                  if (errorMsg) setErrorMsg('');
                }}
                placeholder="Confirm password"
                placeholderTextColor={theme.textMuted}
                secureTextEntry={!showPassword}
                style={[styles.input, { color: theme.textMain }]}
                autoCapitalize="none"
              />
            </View>

            {errorMsg ? (
              <Text style={[styles.errorText, { color: theme.urgentRed }]}>{errorMsg}</Text>
            ) : null}

            <View style={styles.buttonRow}>
              {hasCustomPwd && (
                <TouchableOpacity
                  onPress={() => {
                    setErrorMsg('');
                    setIsSettingNewPwd(false);
                  }}
                  style={[styles.cancelBtn, { borderColor: theme.border }]}
                >
                  <Text style={[styles.cancelBtnText, { color: theme.textSecondary }]}>
                    Cancel
                  </Text>
                </TouchableOpacity>
              )}

              <PressableScale
                onPress={handleSaveNewPassword}
                activeScale={0.95}
                style={[styles.actionBtn, { backgroundColor: theme.accent, flex: 1 }]}
              >
                <Text style={[styles.actionBtnText, { color: theme.textOnAccent }]}>
                  Save & Unlock
                </Text>
              </PressableScale>
            </View>
          </View>
        )}
      </View>
    </CenterModal>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    gap: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleWrap: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
  },
  subTitle: {
    fontSize: 11,
    marginTop: 1,
  },
  closeBtn: {
    padding: 4,
  },
  bioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
  },
  bioButtonText: {
    fontSize: 13,
    fontWeight: '700',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
  },
  dividerText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  pwdSection: {
    gap: 12,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  input: {
    flex: 1,
    fontSize: 13,
    paddingVertical: 0,
  },
  errorText: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: -4,
  },
  actionBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    borderRadius: 10,
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '800',
  },
  changePwdLink: {
    alignSelf: 'center',
    paddingVertical: 4,
  },
  changePwdText: {
    fontSize: 11,
    fontWeight: '700',
  },
  noPwdSection: {
    gap: 12,
    alignItems: 'center',
  },
  noPwdText: {
    fontSize: 12,
    lineHeight: 17,
    textAlign: 'center',
  },
  outlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  outlineBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  setPwdHeading: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
  },
  cancelBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
