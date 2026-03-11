# Phoenix App

## Current State
The app has 4 tabs: Chats, Calls, Email, Pocket. The Calls tab was formerly "Class" and there are unused JobsTab and ClassTab files.

## Requested Changes (Diff)

### Add
- New **Feels** tab (replacing Calls/Class)
- Feels works like WhatsApp Status / Facebook Reels: short 30-second moments
- Max 5 Feels active at once
- 5 feel categories: Happy, Sad, Travel, Work/Busy, Shopping
- Each Feel shows as a story-card with category icon/label, 30s timer/duration indicator
- User can add a new Feel (pick category, optionally add a text or emoji note)
- Feels expire after 30 seconds of "view" time (simulated, not real-time)
- UI shows existing feels as story bubbles at top, with category filters below
- Add Feel button opens a sheet to pick category + write a short caption
- If 5 feels already exist, the Add button is disabled with a message

### Modify
- HomeScreen: remove Calls tab, add Feels tab (tabs become: Chats, Feels, Email, Pocket)

### Remove
- Calls tab from navigation and tab content

## Implementation Plan
1. Create `src/frontend/src/tabs/FeelsTab.tsx` with story-bubble UI, category pills, add-feel sheet
2. Update `src/frontend/src/screens/HomeScreen.tsx` to replace Calls with Feels
