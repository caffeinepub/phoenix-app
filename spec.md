# Phonex

## Current State
Phonex is a React/TypeScript PWA with tabs: Home (Dashboard), Chats, Feels, Email, Pocket, Calls, Smart. Admin portal, Profile, AppSettings, PrivacyPolicy, Login, Register screens exist. PhonexDB (localStorage) + CloudSync layer. Crystal logo, lime green / dark blue theme. All PWABuilder manifest warnings resolved.

Dead code still present as files:
- `src/frontend/src/tabs/CodingTab.tsx` (unused)
- `src/frontend/src/tabs/ClassTab.tsx` (unused)
- `src/frontend/src/tabs/JobsTab.tsx` (unused)
- `src/frontend/src/components/FlyingPhoenix.tsx` (unused)

## Requested Changes (Diff)

### Add
- Nothing new

### Modify
- UI polish: tighter, cleaner, more attractive visual presentation across Login, Home dashboard, tab bar, and general spacing
- Ensure logo (`/assets/uploads/Phonex-Icon-1-1.jpg`) and theme (lime green `phoenix-gradient`, dark blue) remain exactly as-is

### Remove
- Delete `CodingTab.tsx`, `ClassTab.tsx`, `JobsTab.tsx`, `FlyingPhoenix.tsx` (all dead, no imports)
- Any unused imports or variables caught by lint

## Implementation Plan
1. Delete 4 dead code files
2. Polish UI: login screen header proportions, home dashboard card spacing, tab bar compact style, button hover states, overall visual tightness
3. Run lint fix + build to confirm clean
