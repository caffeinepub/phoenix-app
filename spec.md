# Phoenix App — Dead Code Cleanup & Performance Pass

## Current State
Phonex is a full-featured React/TypeScript PWA. All data is stored in localStorage via PhonexDB with a simulated cloud sync layer. The ICP backend actor is only used by useGetChats in ChatsTab (data never rendered). Several shadcn UI components are unused.

## Requested Changes (Diff)

### Add
- Nothing

### Modify
- ChatsTab.tsx: Remove useGetChats import and backendChats variable
- main.tsx: Remove InternetIdentityProvider wrapper

### Remove
- hooks/useInternetIdentity.ts, hooks/useActor.ts, hooks/useQueries.ts
- hooks/use-mobile.tsx if unused
- Unused shadcn: chart, calendar, carousel, navigation-menu, menubar, context-menu, breadcrumb, input-otp, resizable, sidebar, aspect-ratio, toggle-group, hover-card, pagination (grep each first)

## Implementation Plan
1. Grep each unused shadcn component to confirm zero imports, delete confirmed ones
2. Remove useGetChats from ChatsTab.tsx
3. Remove InternetIdentityProvider from main.tsx
4. Delete unused hook files
5. Run frontend_validate
6. Do NOT touch StorageClient.ts, config.ts, backend.ts, backend.d.ts, declarations/
7. Do NOT change any screen logic, UI layout, themes, or features
