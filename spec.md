# Phoenix Business

## Current State
Phoenix Business is a React/TypeScript PWA forked from Phonex. It currently uses PhonexDB (localStorage service) designed for a communication app. There is no business-specific database for sellers, buyers, product listings, orders, or subscriptions. The app still shows a Feels tab (should be Sales), a Smart tab (should be removed), and the RegisterScreen has a generic sign-up form without buyer/seller role selection.

## Requested Changes (Diff)

### Add
- **PhoenixBusinessDB.ts** — new localStorage-backed database service with these collections:
  - `BizUser`: buyer or seller, with role, brand name (for sellers), city, category, subscriptionStatus, balance, subscriptionExpiry, postsCount, totalRevenue
  - `SalePost`: seller product listing with image, price, title, description, sellerId, sellerName, createdAt, isActive, dailyCost (0.25 PKR/day), viewCount, orderCount
  - `Order`: buyer places order on a SalePost — orderId, buyerId, buyerName, sellerId, salePostId, productTitle, price, status (pending/confirmed/shipped/delivered), timestamp, contactPhone
  - `Subscription`: sellerId, plan (free/pro), startDate, expiryDate, balance, isActive
  - **Auto-deduction**: when a seller has active posts, deduct 0.25 PKR per post per day from their balance
  - **Subscription guard**: sellers need PKR 1,000 minimum balance after free month to keep posts active
- **SalesTab.tsx** — replaces FeelsTab — sellers can post products (image + price + title + details), buyers browse a feed, tap any post to view details and place an order
- **BuyerHomeTab** — top 10 brands grid on buyer's home screen
- **SellerHomeTab** — monthly sales dashboard showing balance, active posts, total orders, revenue per post
- Updated **RegisterScreen** — role selector (Buyer / Seller), extra fields for sellers (brand name, category)
- Updated **AuthContext** — use PhoenixBusinessDB instead of PhonexDB for business users

### Modify
- **HomeScreen**: replace Feels tab with Sales tab, remove Smart tab from TABS array, show buyer/seller-specific home dashboard
- **RegisterScreen**: add role selector at top, show brand name + category fields for sellers
- **AuthContext**: map to BizUser type, support seller/buyer roles

### Remove
- Smart tab from Phoenix Business app
- Feels tab (replaced by Sales)

## Implementation Plan
1. Create `src/frontend/src/services/PhoenixBusinessDB.ts` with all data models and CRUD functions
2. Update `RegisterScreen.tsx` to include buyer/seller role selector and seller-specific fields
3. Update `AuthContext.tsx` to use PhoenixBusinessDB for Phoenix Business users
4. Create `src/frontend/src/tabs/SalesTab.tsx` with product feed (buyer view) and post creation (seller view)
5. Update `HomeScreen.tsx`: replace Feels→Sales, remove Smart tab, show buyer/seller home dashboards
6. Wire subscription auto-deduction logic in PhoenixBusinessDB
