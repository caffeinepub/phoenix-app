# Phonex App

## Current State
- PocketTab.tsx: full wallet UI with send/receive/topup flows, secret key, transaction history
- ChatsTab.tsx: chat list with sample contacts, message composer (text/voice/video), but no contact list for recipient selection

## Requested Changes (Diff)

### Add
- **PIN Lock for Pocket tab**: A 4-digit PIN gate that appears when the user navigates to the Pocket tab. First visit prompts PIN setup (set + confirm). Subsequent visits prompt PIN entry. PIN is stored in localStorage. Wrong PIN shows error. Correct PIN unlocks and shows wallet for the session. Option to change PIN in a settings area within the tab.
- **Contact List in Chats**: A contacts panel/sheet accessible from ChatsTab. Shows a list of known contacts (sample + any stored). User can tap a contact to start a chat. When composing a new message, recipient field has a "Choose from contacts" button that opens the contact picker sheet. Contacts shown with avatar/initials, name, and Phonex ID.

### Modify
- PocketTab: wrap existing content behind PIN lock screen. On first load check localStorage for saved PIN; if none, show setup flow; if exists, show entry flow.
- ChatsTab: add contacts list accessible via a button, and wire contact picker into new message compose flow.

### Remove
- Nothing removed.

## Implementation Plan
1. PocketTab: add `pinUnlocked` state, `savedPin` from localStorage, PIN setup/entry UI (4-digit input using OTP-style boxes), unlock logic, change PIN option
2. ChatsTab: add SAMPLE_CONTACTS array with name/initials/phonexId, add ContactsSheet component, add "Contacts" button in header, wire contact picker into Text Note compose recipient field
