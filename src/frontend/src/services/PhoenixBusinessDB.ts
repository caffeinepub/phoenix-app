// PhoenixBusinessDB — localStorage-backed data service for Phoenix Business app
// Collections: BizUser, SalePost, Order, Subscription

// ── Types ─────────────────────────────────────────────────────────────────────

export type UserRole = "buyer" | "seller";

export interface BizUser {
  id: string;
  paymentId: string;
  email: string;
  phone: string;
  displayName: string;
  password: string;
  role: UserRole;
  // Seller-only fields
  brandName?: string;
  category?: string;
  // Financial
  balance: number;
  // Subscription
  subscriptionStatus: "free" | "active" | "suspended" | "expired";
  subscriptionStart: number;
  subscriptionExpiry?: number;
  // Stats
  totalRevenue: number;
  totalOrders: number;
  postsCount: number;
  // Profile
  avatarUrl?: string;
  city?: string;
  // Admin fields
  blocked?: boolean;
  createdAt: number;
}

export interface SalePost {
  id: string;
  sellerId: string;
  sellerName: string;
  brandName: string;
  title: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  isActive: boolean;
  createdAt: number;
  lastDeductedAt: number;
  viewCount: number;
  orderCount: number;
  dailyCost: number; // 0.25 PKR per day
}

export interface Order {
  id: string;
  buyerId: string;
  buyerName: string;
  buyerPhone: string;
  sellerId: string;
  salePostId: string;
  productTitle: string;
  brandName: string;
  price: number;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  timestamp: number;
  note?: string;
}

export interface Subscription {
  sellerId: string;
  plan: "free" | "pro";
  startDate: number;
  expiryDate?: number;
  balance: number;
  isActive: boolean;
}

// ── Constants ─────────────────────────────────────────────────────────────────
const FREE_TRIAL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
const MIN_BALANCE_FOR_SERVICE = 1000; // PKR
const DAILY_COST_PER_POST = 0.25; // PKR

// ── Storage helpers ────────────────────────────────────────────────────────────
function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

// ── Keys ──────────────────────────────────────────────────────────────────────
const KEYS = {
  bizUsers: "phoenix_biz_users",
  salePosts: "phoenix_sale_posts",
  orders: "phoenix_orders",
  subscriptions: "phoenix_subscriptions",
  session: "phoenix_biz_session",
};

// ── ID Generator ──────────────────────────────────────────────────────────────
export function generateId(prefix = "ID"): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = `${prefix}-`;
  for (let i = 0; i < 8; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

// ── BizUser CRUD ──────────────────────────────────────────────────────────────

export function registerBizUser(user: BizUser): void {
  const users = read<BizUser[]>(KEYS.bizUsers, []);
  const filtered = users.filter(
    (u) => u.id !== user.id && u.email !== user.email,
  );
  write(KEYS.bizUsers, [...filtered, user]);
}

export function loginBizUser(email: string, password: string): BizUser | null {
  const users = read<BizUser[]>(KEYS.bizUsers, []);
  return (
    users.find(
      (u) =>
        (u.email === email || u.paymentId === email) && u.password === password,
    ) ?? null
  );
}

export function getBizUser(id: string): BizUser | null {
  const users = read<BizUser[]>(KEYS.bizUsers, []);
  return users.find((u) => u.id === id || u.paymentId === id) ?? null;
}

export function getAllBizUsers(): BizUser[] {
  return read<BizUser[]>(KEYS.bizUsers, []);
}

export function updateBizUser(id: string, fields: Partial<BizUser>): void {
  const users = read<BizUser[]>(KEYS.bizUsers, []);
  const updated = users.map((u) => (u.id === id ? { ...u, ...fields } : u));
  write(KEYS.bizUsers, updated);
}

export function deleteBizUser(id: string): void {
  const users = read<BizUser[]>(KEYS.bizUsers, []);
  write(
    KEYS.bizUsers,
    users.filter((u) => u.id !== id),
  );
}

export function blockBizUser(id: string): void {
  updateBizUser(id, { blocked: true });
}

export function unblockBizUser(id: string): void {
  updateBizUser(id, { blocked: false });
}

// ── Sale Posts ────────────────────────────────────────────────────────────────

export function createSalePost(post: SalePost): void {
  // Check seller subscription before allowing post
  const seller = getBizUser(post.sellerId);
  if (!seller) return;

  const posts = read<SalePost[]>(KEYS.salePosts, []);
  write(KEYS.salePosts, [post, ...posts]);

  // Update seller's post count
  updateBizUser(post.sellerId, { postsCount: (seller.postsCount || 0) + 1 });
}

export function getSalePosts(): SalePost[] {
  return read<SalePost[]>(KEYS.salePosts, []);
}

export function getActiveSalePosts(): SalePost[] {
  runDailyDeductions(); // Run deductions whenever posts are fetched
  return read<SalePost[]>(KEYS.salePosts, []).filter((p) => p.isActive);
}

export function getSellerPosts(sellerId: string): SalePost[] {
  return read<SalePost[]>(KEYS.salePosts, []).filter(
    (p) => p.sellerId === sellerId,
  );
}

export function updateSalePost(id: string, fields: Partial<SalePost>): void {
  const posts = read<SalePost[]>(KEYS.salePosts, []);
  write(
    KEYS.salePosts,
    posts.map((p) => (p.id === id ? { ...p, ...fields } : p)),
  );
}

export function deleteSalePost(id: string, sellerId: string): void {
  const posts = read<SalePost[]>(KEYS.salePosts, []);
  write(
    KEYS.salePosts,
    posts.filter((p) => !(p.id === id && p.sellerId === sellerId)),
  );
  const seller = getBizUser(sellerId);
  if (seller) {
    updateBizUser(sellerId, {
      postsCount: Math.max(0, (seller.postsCount || 1) - 1),
    });
  }
}

export function incrementPostView(postId: string): void {
  const posts = read<SalePost[]>(KEYS.salePosts, []);
  write(
    KEYS.salePosts,
    posts.map((p) =>
      p.id === postId ? { ...p, viewCount: (p.viewCount || 0) + 1 } : p,
    ),
  );
}

// ── Daily Deduction Logic ─────────────────────────────────────────────────────
const LAST_DEDUCTION_KEY = "phoenix_last_deduction";

export function runDailyDeductions(): void {
  const now = Date.now();
  const lastRun = read<number>(LAST_DEDUCTION_KEY, 0);
  const dayMs = 24 * 60 * 60 * 1000;

  // Only run once per day
  if (now - lastRun < dayMs) return;
  write(LAST_DEDUCTION_KEY, now);

  const posts = read<SalePost[]>(KEYS.salePosts, []);
  const users = read<BizUser[]>(KEYS.bizUsers, []);

  // Group active posts by seller
  const postsBySeller: Record<string, SalePost[]> = {};
  for (const post of posts) {
    if (post.isActive) {
      if (!postsBySeller[post.sellerId]) postsBySeller[post.sellerId] = [];
      postsBySeller[post.sellerId].push(post);
    }
  }

  // Deduct from each seller
  const updatedUsers = users.map((user) => {
    if (user.role !== "seller") return user;

    const sellerPosts = postsBySeller[user.id] || [];
    if (sellerPosts.length === 0) return user;

    // Check if still in free trial
    const inFreeTrial =
      now - user.subscriptionStart < FREE_TRIAL_MS &&
      user.subscriptionStatus === "free";
    if (inFreeTrial) return user;

    // Deduct 0.25 PKR per active post per day
    const totalDeduction = sellerPosts.length * DAILY_COST_PER_POST;
    const newBalance = user.balance - totalDeduction;

    // Suspend if below minimum balance
    if (newBalance < MIN_BALANCE_FOR_SERVICE) {
      // Deactivate posts for suspended sellers
      const updatedPosts = posts.map((p) =>
        p.sellerId === user.id ? { ...p, isActive: false } : p,
      );
      write(KEYS.salePosts, updatedPosts);
      return {
        ...user,
        balance: Math.max(0, newBalance),
        subscriptionStatus: "suspended" as const,
      };
    }

    return { ...user, balance: newBalance };
  });

  write(KEYS.bizUsers, updatedUsers);
}

// ── Subscription Management ───────────────────────────────────────────────────

export function getSubscription(sellerId: string): Subscription | null {
  const subs = read<Subscription[]>(KEYS.subscriptions, []);
  return subs.find((s) => s.sellerId === sellerId) ?? null;
}

export function topUpSellerBalance(sellerId: string, amount: number): void {
  const seller = getBizUser(sellerId);
  if (!seller) return;
  const newBalance = (seller.balance || 0) + amount;
  updateBizUser(sellerId, {
    balance: newBalance,
    subscriptionStatus:
      newBalance >= MIN_BALANCE_FOR_SERVICE
        ? "active"
        : seller.subscriptionStatus,
  });
  // Reactivate posts if balance is restored
  if (newBalance >= MIN_BALANCE_FOR_SERVICE) {
    const posts = read<SalePost[]>(KEYS.salePosts, []);
    write(
      KEYS.salePosts,
      posts.map((p) =>
        p.sellerId === sellerId ? { ...p, isActive: true } : p,
      ),
    );
  }
}

export function getSellerSubscriptionInfo(seller: BizUser): {
  status: string;
  daysLeft: number;
  isInFreeTrial: boolean;
  canPost: boolean;
} {
  const now = Date.now();
  const elapsed = now - seller.subscriptionStart;
  const isInFreeTrial =
    elapsed < FREE_TRIAL_MS && seller.subscriptionStatus === "free";
  const daysLeftInTrial = Math.max(
    0,
    Math.ceil((FREE_TRIAL_MS - elapsed) / (24 * 60 * 60 * 1000)),
  );

  if (isInFreeTrial) {
    return {
      status: `Free Trial (${daysLeftInTrial} days left)`,
      daysLeft: daysLeftInTrial,
      isInFreeTrial: true,
      canPost: true,
    };
  }

  const canPost =
    seller.balance >= MIN_BALANCE_FOR_SERVICE &&
    seller.subscriptionStatus !== "suspended";

  return {
    status: canPost ? "Active" : "Suspended (Low Balance)",
    daysLeft: 0,
    isInFreeTrial: false,
    canPost,
  };
}

// ── Orders ────────────────────────────────────────────────────────────────────

export function placeOrder(order: Order): void {
  const orders = read<Order[]>(KEYS.orders, []);
  write(KEYS.orders, [order, ...orders]);

  // Update post order count
  updateSalePost(order.salePostId, {
    orderCount:
      (getSalePosts().find((p) => p.id === order.salePostId)?.orderCount || 0) +
      1,
  });

  // Update seller stats
  const seller = getBizUser(order.sellerId);
  if (seller) {
    updateBizUser(order.sellerId, {
      totalOrders: (seller.totalOrders || 0) + 1,
      totalRevenue: (seller.totalRevenue || 0) + order.price,
    });
  }
}

export function getOrdersForBuyer(buyerId: string): Order[] {
  return read<Order[]>(KEYS.orders, []).filter((o) => o.buyerId === buyerId);
}

export function getOrdersForSeller(sellerId: string): Order[] {
  return read<Order[]>(KEYS.orders, []).filter((o) => o.sellerId === sellerId);
}

export function updateOrderStatus(
  orderId: string,
  status: Order["status"],
): void {
  const orders = read<Order[]>(KEYS.orders, []);
  write(
    KEYS.orders,
    orders.map((o) => (o.id === orderId ? { ...o, status } : o)),
  );
}

// ── Top Brands (Buyer Home) ───────────────────────────────────────────────────

export function getTopBrands(limit = 10): {
  sellerId: string;
  brandName: string;
  category: string;
  totalOrders: number;
  avatarUrl?: string;
}[] {
  const sellers = getAllBizUsers().filter(
    (u) => u.role === "seller" && !u.blocked,
  );
  return sellers
    .sort((a, b) => (b.totalOrders || 0) - (a.totalOrders || 0))
    .slice(0, limit)
    .map((s) => ({
      sellerId: s.id,
      brandName: s.brandName || s.displayName,
      category: s.category || "General",
      totalOrders: s.totalOrders || 0,
      avatarUrl: s.avatarUrl,
    }));
}

// ── Seller Monthly Stats ──────────────────────────────────────────────────────

export function getSellerMonthlyStats(sellerId: string): {
  monthlyRevenue: number;
  monthlyOrders: number;
  activePosts: number;
  balance: number;
  postBreakdown: {
    postId: string;
    title: string;
    orders: number;
    revenue: number;
  }[];
} {
  const now = Date.now();
  const monthStart = now - 30 * 24 * 60 * 60 * 1000;

  const orders = getOrdersForSeller(sellerId).filter(
    (o) => o.timestamp >= monthStart,
  );
  const posts = getSellerPosts(sellerId);
  const seller = getBizUser(sellerId);

  const monthlyRevenue = orders.reduce((sum, o) => sum + o.price, 0);
  const activePosts = posts.filter((p) => p.isActive).length;

  const postBreakdown = posts.map((post) => {
    const postOrders = orders.filter((o) => o.salePostId === post.id);
    return {
      postId: post.id,
      title: post.title,
      orders: postOrders.length,
      revenue: postOrders.reduce((sum, o) => sum + o.price, 0),
    };
  });

  return {
    monthlyRevenue,
    monthlyOrders: orders.length,
    activePosts,
    balance: seller?.balance || 0,
    postBreakdown,
  };
}

// ── Forgot Password ────────────────────────────────────────────────────────────

export function resetBizPassword(email: string, newPassword: string): boolean {
  const users = read<BizUser[]>(KEYS.bizUsers, []);
  const user = users.find((u) => u.email === email);
  if (!user) return false;
  updateBizUser(user.id, { password: newPassword });
  return true;
}

// ── Session ───────────────────────────────────────────────────────────────────

export function saveBizSession(user: BizUser | null): void {
  if (user) {
    localStorage.setItem(KEYS.session, JSON.stringify(user));
  } else {
    localStorage.removeItem(KEYS.session);
  }
}

export function loadBizSession(): BizUser | null {
  try {
    const raw = localStorage.getItem(KEYS.session);
    return raw ? (JSON.parse(raw) as BizUser) : null;
  } catch {
    return null;
  }
}

// ── Seed Data (for demo/testing) ──────────────────────────────────────────────

export function seedDemoDataIfEmpty(): void {
  const users = read<BizUser[]>(KEYS.bizUsers, []);
  if (users.length > 0) return; // Already seeded

  const now = Date.now();

  const demoBrands: BizUser[] = [
    {
      id: "seller-001",
      paymentId: "PHX-SELLER001",
      email: "brand1@demo.com",
      phone: "03001234567",
      displayName: "Ahmed Fashion",
      password: "password",
      role: "seller",
      brandName: "Ahmed Fashion",
      category: "Clothing",
      balance: 5000,
      subscriptionStatus: "active",
      subscriptionStart: now - 15 * 24 * 60 * 60 * 1000,
      totalRevenue: 12500,
      totalOrders: 47,
      postsCount: 3,
      createdAt: now - 20 * 24 * 60 * 60 * 1000,
    },
    {
      id: "seller-002",
      paymentId: "PHX-SELLER002",
      email: "brand2@demo.com",
      phone: "03012345678",
      displayName: "TechHub PK",
      password: "password",
      role: "seller",
      brandName: "TechHub PK",
      category: "Electronics",
      balance: 8000,
      subscriptionStatus: "active",
      subscriptionStart: now - 10 * 24 * 60 * 60 * 1000,
      totalRevenue: 35000,
      totalOrders: 83,
      postsCount: 4,
      createdAt: now - 15 * 24 * 60 * 60 * 1000,
    },
    {
      id: "seller-003",
      paymentId: "PHX-SELLER003",
      email: "brand3@demo.com",
      phone: "03023456789",
      displayName: "Karachi Sweets",
      password: "password",
      role: "seller",
      brandName: "Karachi Sweets",
      category: "Food",
      balance: 3500,
      subscriptionStatus: "free",
      subscriptionStart: now - 5 * 24 * 60 * 60 * 1000,
      totalRevenue: 4200,
      totalOrders: 21,
      postsCount: 2,
      createdAt: now - 5 * 24 * 60 * 60 * 1000,
    },
  ];

  const demoSalePosts: SalePost[] = [
    {
      id: "post-001",
      sellerId: "seller-001",
      sellerName: "Ahmed Fashion",
      brandName: "Ahmed Fashion",
      title: "Premium Shalwar Kameez",
      description:
        "High quality lawn fabric, beautiful embroidery, sizes S-XXL available. Delivery in 3-5 days.",
      price: 1800,
      imageUrl: "",
      category: "Clothing",
      isActive: true,
      createdAt: now - 5 * 24 * 60 * 60 * 1000,
      lastDeductedAt: now - 24 * 60 * 60 * 1000,
      viewCount: 245,
      orderCount: 18,
      dailyCost: 0.25,
    },
    {
      id: "post-002",
      sellerId: "seller-002",
      sellerName: "TechHub PK",
      brandName: "TechHub PK",
      title: "Wireless Earbuds Pro",
      description:
        "Noise cancelling, 24hr battery, IPX5 water resistant. Compatible with all devices.",
      price: 3500,
      imageUrl: "",
      category: "Electronics",
      isActive: true,
      createdAt: now - 3 * 24 * 60 * 60 * 1000,
      lastDeductedAt: now - 24 * 60 * 60 * 1000,
      viewCount: 389,
      orderCount: 31,
      dailyCost: 0.25,
    },
    {
      id: "post-003",
      sellerId: "seller-003",
      sellerName: "Karachi Sweets",
      brandName: "Karachi Sweets",
      title: "Mithai Gift Box (1kg)",
      description:
        "Assorted traditional sweets. Perfect for gifts and celebrations. Fresh daily.",
      price: 850,
      imageUrl: "",
      category: "Food",
      isActive: true,
      createdAt: now - 2 * 24 * 60 * 60 * 1000,
      lastDeductedAt: now - 24 * 60 * 60 * 1000,
      viewCount: 156,
      orderCount: 12,
      dailyCost: 0.25,
    },
  ];

  write(KEYS.bizUsers, demoBrands);
  write(KEYS.salePosts, demoSalePosts);
}
