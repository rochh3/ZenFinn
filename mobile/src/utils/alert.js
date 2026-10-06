import { Alert as RNAlert, Platform } from 'react-native';

/**
 * Alert multiplataforma. En iOS/Android usa el diálogo nativo; en web (donde
 * Alert.alert no hace nada) usa window.alert / window.confirm.
 */
export const Alert = {
  alert(title, message, buttons) {
    if (Platform.OS !== 'web') return RNAlert.alert(title, message, buttons);
    const text = [title, message].filter(Boolean).join('\n\n');
    const actions = buttons || [];
    if (actions.length < 2) {
      window.alert(text);
      actions[0]?.onPress?.();
      return;
    }
    const confirmBtn = actions.find((b) => b.style !== 'cancel') || actions[actions.length - 1];
    if (window.confirm(text)) confirmBtn.onPress?.();
    else actions.find((b) => b.style === 'cancel')?.onPress?.();
  },
};
