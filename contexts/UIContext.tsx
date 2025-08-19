import React, { createContext, useState, useContext, ReactNode } from 'react';
import { Goal, DevelopmentNode, Book } from '../types';

type ModalType = 'addHabit' | 'addProject' | 'goal' | 'developmentArea' | 'book';

interface ModalProps {
  goal?: Goal | null;
  node?: DevelopmentNode | null;
  book?: Book | null;
}

interface UIState {
  openModal: ModalType | null;
  modalProps: ModalProps;
}

interface UIContextType {
  state: UIState;
  open: (modal: ModalType, props?: ModalProps) => void;
  close: () => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<UIState>({
    openModal: null,
    modalProps: {},
  });

  const open = (modal: ModalType, props: ModalProps = {}) => {
    setState({ openModal: modal, modalProps: props });
  };

  const close = () => {
    setState({ openModal: null, modalProps: {} });
  };

  return (
    <UIContext.Provider value={{ state, open, close }}>
      {children}
    </UIContext.Provider>
  );
};

export const useUI = (): UIContextType => {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
};
