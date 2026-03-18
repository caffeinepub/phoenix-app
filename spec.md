# Phonex App — Complete Remaining Features

## Current State
Phonex is a React/TypeScript PWA with tabs: Home, Chats, Feels, Email, Pocket, Calls. Admin portal exists. Profile screen supports avatar editing, bank info, dark mode name color toggle. FeelsTab has 30s posts. AdminScreen has user management and security agent. PhonexDB service manages localStorage. ThemeContext handles light/dark.

## Requested Changes (Diff)

### Add
- **Change Password** in Profile screen: new password field with confirm, saves to PhonexDB
- **Save/New Contact** button in Contacts panel (ChatsTab, CallsTab, EmailTab): form to add name + Phonex ID/email/phone
- **Save/New Email Address** option in Email contacts
- **Feels reactions**: Heart, Good, Bad, Smile emoji reactions on each Feel card
- **Crystal special emojis**: a small emoji picker component with crystal-styled unique emojis (💎🔮✨⚡🌟💫🌈🔷🔹🌀) that can be used in Text Note compose
- **Smart Tab** added to main nav (between Calls and end): inner sub-tabs: Smart, Peers, Chat, Blast, Account, Billing
  - Smart: animated BLE orb toggle button, radar canvas showing peers, stats bar (peers/range/relays/hops), daily note counter with progress bar, Pro badge placeholder, quick actions: Peers/Broadcast/BT Call
  - Peers: peer list with signal bars, hop badges, distance, relay nodes section, tap peer to open BLE chat
  - Chat (BLE): mesh chat with delivery status, daily limit bar for free users
  - Blast: broadcast form to all mesh nodes
  - Account: profile card with avatar/name/email, subscription card (plan/price/expiry), Smart Mode status, upgrade button to Billing
  - Billing: JazzCash flow: Step 1 show account 0300-3257502 Phonex App PKR 1,000 with copy; Step 2 enter Transaction ID + JazzCash number; Step 3 review + simulate approve; Step 4 success/Pro activated
- **App Settings screen**: accessible from Profile, contains: Color Mode toggle (Light/Dark), Smart Mode toggle, notification preferences placeholder
- **Admin Summary Board**: update to show total users, blocked users, complaints count, pending reviews, security events count

### Modify
- **Profile screen**: add Change Password section below phone/email fields
- **FeelsTab**: reduce auto-expire timer display and progress to 15 seconds (was 30s)
- **HomeScreen DashboardTab**: remove Quick Access row/buttons section
- **Tab bar**: active tab should have stronger visual highlight (bold label + colored icon + gradient indicator already present — ensure it works well)
- **AdminScreen**: update the summary board to show management-focused stats (total users, blocked, complaints, security events)
- **Contacts panel** in Chats/Calls/Email: add "New Contact" button at top

### Remove
- Quick Access pill buttons row from Home dashboard tab

## Implementation Plan
1. Update `HomeScreen.tsx` — remove `quickLinks` section from DashboardTab
2. Update `ProfileScreen.tsx` — add Change Password form section, add App Settings link
3. Create `AppSettingsScreen.tsx` — light/dark toggle, Smart Mode toggle
4. Update `FeelsTab.tsx` — change 30s references to 15s; add reaction row (Heart/Good/Bad/Smile) on each Feel card
5. Update `ChatsTab.tsx`, `CallsTab.tsx`, `EmailTab.tsx` — add New Contact button in contacts panel
6. Create `SmartTab.tsx` — inner sub-tabs (Smart, Peers, Chat, Blast, Account, Billing) with BLE-simulated UI, JazzCash billing flow
7. Add "Smart" to main TABS array in HomeScreen
8. Create crystal emoji picker component for Text Note compose
9. Update `AdminScreen.tsx` — update summary board with management stats
10. Wire App navigation (add AppSettingsScreen to App.tsx)
