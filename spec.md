# Phonex App

## Current State
Phonex is a React/TypeScript frontend on ICP with a Motoko backend. The backend currently stores basic user profiles, chats, class groups, and job listings. The frontend has all 5 tabs (Chats, Feels, Email, Pocket, Calls) with UI flows implemented, but backend data integration for transactions, feels, emails, contacts, and full user accounts (with password, payment ID, bank details, PIN) is incomplete. Pakistan bank/operator lists are not yet in the app.

## Requested Changes (Diff)

### Add
- Full user account model: username, passwordHash, email, phone, bankName, bankAccount, paymentId (PXP-XXXXXXXX), pocketPin, avatarUrl, displayName
- Transactions storage: id, senderId, receiverId, amount (PKR), channel (PHONEX/EXTERNAL/TOPUP), type, timestamp, status, receiptData (bankName, ibanLast3, operatorName, mobileNumber)
- Feels storage: id, userId, mediaUrl, mediaType (photo/video), mood, caption, createdAt, expiresAt (12h auto-expiry)
- Email storage: id, fromUserId, toAddress, ccAddresses, bccAddresses, subject, body, attachmentNames, timestamp, isRead
- Contacts storage per user: id, name, phonexId, email, phone
- Static Pakistan banks list (20+ major banks)
- Static Pakistan mobile operators list (Jazz, Telenor, Zong, Ufone, Warid)
- Backend functions: register, login (by phonexId or email + password), getMyAccount, updateAccount, addTransaction, getMyTransactions, addFeel, getActiveFeels, addEmail, getMyEmails, addContact, getMyContacts, deleteContact, verifyPaymentId (lookup user by paymentId)

### Modify
- User authentication flow: register saves full account; login returns full user data
- Pocket tab: use real Pakistan banks/operators from static lists; wire send/receive/topup to backend transactions
- Chats tab: wire contacts to backend
- Calls tab: add contacts panel using backend contacts
- Emails tab: add contacts panel using backend contacts
- App name in dark mode: add maroon as an option alongside white

### Remove
- ClassGroup and JobListing backend data (no longer needed)

## Implementation Plan
1. Regenerate backend with full Phonex data models and all required functions
2. Update AuthContext to call backend register/login and persist full user state
3. Update PocketTab to use Pakistan banks/operators lists and wire transactions to backend
4. Update ChatsTab, CallsTab, EmailTab to use backend contacts
5. Update FeelsTab to load/save feels from backend
6. Update EmailTab to load/save emails from backend
7. Add maroon dark mode option for app name
