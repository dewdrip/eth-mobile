import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface RecipientsState {
  recipients: string[];
}

interface RecipientsActions {
  addRecipient: (address: string) => void;
  removeRecipient: (address: string) => void;
  clearRecipients: () => void;
}

const initialState: RecipientsState = {
  recipients: []
};

export const useRecipientsStore = create<RecipientsState & RecipientsActions>()(
  persist(
    set => ({
      ...initialState,
      addRecipient: address =>
        set(state => {
          const newRecipient = address.toLowerCase();
          const exists = state.recipients.some(
            recipient => recipient.toLowerCase() === newRecipient
          );

          if (!exists) {
            return { recipients: [...state.recipients, newRecipient] };
          }
          return state;
        }),
      removeRecipient: address =>
        set(state => ({
          recipients: state.recipients.filter(
            recipient => recipient.toLowerCase() !== address.toLowerCase()
          )
        })),
      clearRecipients: () => set({ recipients: [] })
    }),
    {
      name: 'recipients-storage',
      storage: createJSONStorage(() => AsyncStorage)
    }
  )
);
