import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import AppModal from '../components/AppModal';

const ModalContext = createContext(null);

export const useAppModal = () => {
  const ctx = useContext(ModalContext);
  if (!ctx) {
    throw new Error('useAppModal must be used within ModalProvider');
  }
  return ctx;
};

const initialState = {
  visible: false,
  title: '',
  message: '',
  buttons: [],
  dismissOnBackdropPress: true,
  loading: false,
};

export const ModalProvider = ({ children }) => {
  const [state, setState] = useState(initialState);

  const hideModal = useCallback(() => {
    setState((s) => ({ ...s, visible: false, loading: false }));
  }, []);

  const showModal = useCallback((config) => {
    setState({
      visible: true,
      title: config.title ?? '',
      message: config.message ?? '',
      buttons: config.buttons ?? [{ text: 'OK', variant: 'primary', onPress: () => {} }],
      dismissOnBackdropPress: config.dismissOnBackdropPress !== false,
      loading: !!config.loading,
    });
  }, []);

  const showAlert = useCallback(
    (title, message, onOk) => {
      showModal({
        title,
        message,
        buttons: [
          {
            text: 'OK',
            variant: 'primary',
            onPress: onOk ? () => onOk() : undefined,
          },
        ],
      });
    },
    [showModal]
  );

  const showConfirm = useCallback(
    ({
      title,
      message,
      confirmText = 'Confirm',
      cancelText = 'Cancel',
      destructive = false,
      onConfirm,
      onCancel,
    }) => {
      showModal({
        title,
        message,
        buttons: [
          { text: cancelText, variant: 'cancel', onPress: onCancel ? () => onCancel() : undefined },
          {
            text: confirmText,
            variant: destructive ? 'destructive' : 'primary',
            onPress: onConfirm ? () => onConfirm() : undefined,
          },
        ],
      });
    },
    [showModal]
  );

  const value = useMemo(
    () => ({
      showModal,
      showAlert,
      showConfirm,
      hideModal,
    }),
    [showModal, showAlert, showConfirm, hideModal]
  );

  return (
    <ModalContext.Provider value={value}>
      {children}
      <AppModal
        visible={state.visible}
        onRequestClose={hideModal}
        title={state.title}
        message={state.message}
        buttons={state.buttons}
        dismissOnBackdropPress={state.dismissOnBackdropPress}
        loading={state.loading}
      />
    </ModalContext.Provider>
  );
};
