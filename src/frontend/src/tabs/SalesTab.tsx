import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertCircle,
  Eye,
  Loader2,
  Package,
  Plus,
  ShoppingBag,
  ShoppingCart,
  Star,
  Store,
  Tag,
  Trash2,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";
import {
  type Order,
  type SalePost,
  createSalePost,
  deleteSalePost,
  generateId,
  getActiveSalePosts,
  getBizUser,
  getOrdersForBuyer,
  getOrdersForSeller,
  getSellerMonthlyStats,
  getSellerPosts,
  getSellerSubscriptionInfo,
  incrementPostView,
  placeOrder,
  topUpSellerBalance,
} from "../services/PhoenixBusinessDB";

const CATEGORIES = [
  "Clothing",
  "Electronics",
  "Food",
  "Beauty",
  "Home & Living",
  "Sports",
  "Other",
];

const CATEGORY_COLORS: Record<string, string> = {
  Clothing: "#6366f1",
  Electronics: "#0ea5e9",
  Food: "#f97316",
  Beauty: "#ec4899",
  "Home & Living": "#22c55e",
  Sports: "#eab308",
  Other: "#8b5cf6",
};

function getCategoryColor(cat: string): string {
  return CATEGORY_COLORS[cat] || "#8b5cf6";
}

function PlaceholderImage({
  category,
  title,
}: { category: string; title: string }) {
  const color = getCategoryColor(category);
  const icons: Record<string, React.ReactNode> = {
    Clothing: <ShoppingBag className="w-10 h-10" />,
    Electronics: <Package className="w-10 h-10" />,
    Food: <Star className="w-10 h-10" />,
    Beauty: <Star className="w-10 h-10" />,
    "Home & Living": <Package className="w-10 h-10" />,
    Sports: <TrendingUp className="w-10 h-10" />,
    Other: <Tag className="w-10 h-10" />,
  };
  return (
    <div
      className="w-full h-40 rounded-xl flex flex-col items-center justify-center gap-2"
      style={{
        background: `linear-gradient(135deg, ${color}22 0%, ${color}10 100%)`,
        border: `1px solid ${color}30`,
      }}
    >
      <span style={{ color }}>{icons[category] || icons.Other}</span>
      <span className="text-xs font-medium px-2 text-center" style={{ color }}>
        {title.length > 28 ? `${title.slice(0, 28)}...` : title}
      </span>
    </div>
  );
}

// ── Buyer View ─────────────────────────────────────────────────────────────────

function BuyerSalesView() {
  const { currentUser } = useAuth();
  const [posts, setPosts] = useState<SalePost[]>([]);
  const [selectedPost, setSelectedPost] = useState<SalePost | null>(null);
  const [ordersOpen, setOrdersOpen] = useState(false);
  const [myOrders, setMyOrders] = useState<Order[]>([]);
  const [orderNote, setOrderNote] = useState("");
  const [orderPhone, setOrderPhone] = useState(currentUser?.phone || "");
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    setPosts(getActiveSalePosts());
  }, []);

  const handleViewPost = (post: SalePost) => {
    incrementPostView(post.id);
    setSelectedPost(post);
  };

  const handleOpenOrders = () => {
    if (currentUser) {
      setMyOrders(getOrdersForBuyer(currentUser.id));
    }
    setOrdersOpen(true);
  };

  const handlePlaceOrder = async () => {
    if (!selectedPost || !currentUser) return;
    setPlacing(true);
    await new Promise((r) => setTimeout(r, 600));
    const order: Order = {
      id: generateId("ORD"),
      buyerId: currentUser.id,
      buyerName: currentUser.displayName,
      buyerPhone: orderPhone,
      sellerId: selectedPost.sellerId,
      salePostId: selectedPost.id,
      productTitle: selectedPost.title,
      brandName: selectedPost.brandName,
      price: selectedPost.price,
      status: "pending",
      timestamp: Date.now(),
      note: orderNote,
    };
    placeOrder(order);
    toast.success("Order placed! The seller will contact you soon.");
    setSelectedPost(null);
    setOrderNote("");
    setPlacing(false);
  };

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-500/20 text-yellow-700 border-yellow-500/30",
    confirmed: "bg-blue-500/20 text-blue-700 border-blue-500/30",
    shipped: "bg-purple-500/20 text-purple-700 border-purple-500/30",
    delivered: "bg-green-500/20 text-green-700 border-green-500/30",
    cancelled: "bg-red-500/20 text-red-700 border-red-500/30",
  };

  return (
    <div className="h-full overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-primary" />
          <h2 className="font-bold text-foreground">Sales</h2>
          <Badge variant="secondary" className="text-xs">
            {posts.length} items
          </Badge>
        </div>
        <Button
          variant="outline"
          size="sm"
          data-ocid="sales.orders.button"
          onClick={handleOpenOrders}
          className="text-xs gap-1.5"
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          My Orders
        </Button>
      </div>

      {/* Product Feed */}
      <div className="p-4 space-y-4">
        {posts.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-16 text-center"
            data-ocid="sales.empty_state"
          >
            <ShoppingBag className="w-12 h-12 text-muted-foreground mb-3" />
            <p className="font-semibold text-foreground">No products yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Check back soon!
            </p>
          </div>
        ) : (
          posts.map((post, idx) => (
            <motion.div
              key={post.id}
              data-ocid={`sales.item.${idx + 1}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.06 }}
              className="bg-card rounded-2xl overflow-hidden border border-border shadow-sm"
            >
              {post.imageUrl ? (
                <img
                  src={post.imageUrl}
                  alt={post.title}
                  className="w-full h-40 object-cover"
                />
              ) : (
                <PlaceholderImage category={post.category} title={post.title} />
              )}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-bold text-foreground text-sm leading-tight">
                    {post.title}
                  </h3>
                  <span
                    className="text-sm font-black shrink-0"
                    style={{ color: getCategoryColor(post.category) }}
                  >
                    PKR {post.price.toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-primary font-semibold mb-1">
                  {post.brandName}
                </p>
                <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                  {post.description}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Eye className="w-3 h-3" />
                    <span>{post.viewCount} views</span>
                    <span>·</span>
                    <ShoppingCart className="w-3 h-3" />
                    <span>{post.orderCount} orders</span>
                  </div>
                  <Button
                    size="sm"
                    data-ocid={`sales.order.button.${idx + 1}`}
                    onClick={() => handleViewPost(post)}
                    className="text-xs h-8 px-3 rounded-xl font-bold"
                  >
                    Order Now
                  </Button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Order Sheet */}
      <Sheet
        open={!!selectedPost}
        onOpenChange={(o) => !o && setSelectedPost(null)}
      >
        <SheetContent
          side="bottom"
          className="rounded-t-3xl max-h-[90vh] overflow-y-auto"
          data-ocid="sales.order.sheet"
        >
          <SheetHeader className="mb-4">
            <SheetTitle className="text-left">Place Order</SheetTitle>
          </SheetHeader>
          {selectedPost && (
            <div className="space-y-4">
              {selectedPost.imageUrl ? (
                <img
                  src={selectedPost.imageUrl}
                  alt={selectedPost.title}
                  className="w-full h-40 object-cover rounded-xl"
                />
              ) : (
                <PlaceholderImage
                  category={selectedPost.category}
                  title={selectedPost.title}
                />
              )}
              <div>
                <h3 className="font-bold text-foreground">
                  {selectedPost.title}
                </h3>
                <p className="text-sm text-primary font-semibold">
                  {selectedPost.brandName}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {selectedPost.description}
                </p>
                <p
                  className="text-lg font-black mt-2"
                  style={{ color: getCategoryColor(selectedPost.category) }}
                >
                  PKR {selectedPost.price.toLocaleString()}
                </p>
              </div>
              <div className="space-y-1.5">
                <Label className="font-semibold">Your Phone Number</Label>
                <Input
                  data-ocid="sales.order.phone.input"
                  value={orderPhone}
                  onChange={(e) => setOrderPhone(e.target.value)}
                  placeholder="Your contact number"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="font-semibold">Note (optional)</Label>
                <Textarea
                  data-ocid="sales.order.note.textarea"
                  value={orderNote}
                  onChange={(e) => setOrderNote(e.target.value)}
                  placeholder="Size, color, delivery address, etc."
                  rows={2}
                  className="resize-none"
                />
              </div>
              <Button
                data-ocid="sales.order.submit_button"
                onClick={handlePlaceOrder}
                disabled={placing || !orderPhone}
                className="w-full h-12 text-base font-bold rounded-2xl"
              >
                {placing ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <ShoppingCart className="w-4 h-4 mr-2" />
                )}
                {placing ? "Placing order..." : "Place Order"}
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* My Orders Sheet */}
      <Sheet open={ordersOpen} onOpenChange={setOrdersOpen}>
        <SheetContent
          side="bottom"
          className="rounded-t-3xl max-h-[80vh] overflow-y-auto"
          data-ocid="sales.myorders.sheet"
        >
          <SheetHeader className="mb-4">
            <SheetTitle className="text-left">My Orders</SheetTitle>
          </SheetHeader>
          {myOrders.length === 0 ? (
            <div
              className="flex flex-col items-center py-10 text-center"
              data-ocid="sales.myorders.empty_state"
            >
              <ShoppingCart className="w-10 h-10 text-muted-foreground mb-2" />
              <p className="font-semibold text-foreground">No orders yet</p>
              <p className="text-sm text-muted-foreground">
                Your orders will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {myOrders.map((order, idx) => (
                <div
                  key={order.id}
                  data-ocid={`sales.myorders.item.${idx + 1}`}
                  className="bg-muted/30 rounded-xl p-3 border border-border"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-sm text-foreground">
                        {order.productTitle}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {order.brandName}
                      </p>
                    </div>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full border font-medium ${statusColors[order.status]}`}
                    >
                      {order.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-muted-foreground">
                      {new Date(order.timestamp).toLocaleDateString()}
                    </span>
                    <span className="font-bold text-sm text-primary">
                      PKR {order.price.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

// ── Seller View ────────────────────────────────────────────────────────────────

function SellerSalesView() {
  const { currentUser } = useAuth();
  const [posts, setPosts] = useState<SalePost[]>([]);
  const [newPostOpen, setNewPostOpen] = useState(false);
  const [topUpOpen, setTopUpOpen] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [newPost, setNewPost] = useState({
    title: "",
    price: "",
    description: "",
    category: "Clothing",
    imageUrl: "",
  });

  const seller = currentUser ? getBizUser(currentUser.id) : null;
  const subInfo = seller ? getSellerSubscriptionInfo(seller) : null;
  const monthlyStats = currentUser
    ? getSellerMonthlyStats(currentUser.id)
    : null;

  useEffect(() => {
    if (currentUser) setPosts(getSellerPosts(currentUser.id));
  }, [currentUser]);

  const refreshPosts = () => {
    if (currentUser) setPosts(getSellerPosts(currentUser.id));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setNewPost((prev) => ({
        ...prev,
        imageUrl: ev.target?.result as string,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleCreatePost = async () => {
    if (
      !currentUser ||
      !newPost.title ||
      !newPost.price ||
      !newPost.description
    ) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (!subInfo?.canPost) {
      toast.error(
        "Cannot post: subscription suspended. Please top up your balance.",
      );
      return;
    }
    setIsPosting(true);
    await new Promise((r) => setTimeout(r, 500));
    const post: SalePost = {
      id: generateId("POST"),
      sellerId: currentUser.id,
      sellerName: currentUser.displayName,
      brandName: currentUser.brandName || currentUser.displayName,
      title: newPost.title,
      description: newPost.description,
      price: Number.parseFloat(newPost.price) || 0,
      imageUrl: newPost.imageUrl,
      category: newPost.category,
      isActive: true,
      createdAt: Date.now(),
      lastDeductedAt: Date.now(),
      viewCount: 0,
      orderCount: 0,
      dailyCost: 0.25,
    };
    createSalePost(post);
    toast.success("Post created successfully!");
    setNewPost({
      title: "",
      price: "",
      description: "",
      category: "Clothing",
      imageUrl: "",
    });
    setNewPostOpen(false);
    setIsPosting(false);
    refreshPosts();
  };

  const handleDeletePost = (postId: string) => {
    if (!currentUser) return;
    deleteSalePost(postId, currentUser.id);
    toast.success("Post deleted");
    refreshPosts();
  };

  const handleTopUp = () => {
    if (!currentUser) return;
    const amount = Number.parseFloat(topUpAmount);
    if (!amount || amount <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    topUpSellerBalance(currentUser.id, amount);
    toast.success(`PKR ${amount} added to your balance!`);
    setTopUpAmount("");
    setTopUpOpen(false);
  };

  return (
    <div className="h-full overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Store className="w-5 h-5 text-primary" />
          <h2 className="font-bold text-foreground">My Store</h2>
          <Badge variant="secondary" className="text-xs">
            {posts.length} posts
          </Badge>
        </div>
        <Button
          size="sm"
          data-ocid="sales.newpost.open_modal_button"
          onClick={() => setNewPostOpen(true)}
          className="text-xs gap-1.5 rounded-xl font-bold"
        >
          <Plus className="w-3.5 h-3.5" />
          New Post
        </Button>
      </div>

      <div className="p-4 space-y-4">
        {/* Subscription Status Card */}
        {subInfo && monthlyStats && seller && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-2xl p-4 border ${
              subInfo.canPost
                ? "bg-green-500/10 border-green-500/30"
                : "bg-red-500/10 border-red-500/30"
            }`}
            data-ocid="sales.subscription.card"
          >
            <div className="flex items-start justify-between gap-2 mb-3">
              <div>
                <p
                  className={`font-bold text-sm ${
                    subInfo.canPost
                      ? "text-green-700 dark:text-green-400"
                      : "text-red-700 dark:text-red-400"
                  }`}
                >
                  {subInfo.status}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  PKR 0.25/day/post auto-deducted
                </p>
              </div>
              <Badge
                className={`text-xs ${
                  subInfo.canPost
                    ? "bg-green-500 text-white"
                    : "bg-red-500 text-white"
                }`}
              >
                {subInfo.isInFreeTrial
                  ? "Free Trial"
                  : subInfo.canPost
                    ? "Active"
                    : "Suspended"}
              </Badge>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-background/60 rounded-xl p-3 text-center">
                <Wallet className="w-4 h-4 text-primary mx-auto mb-1" />
                <p className="font-black text-lg text-primary">
                  {monthlyStats.balance.toFixed(0)}
                </p>
                <p className="text-[10px] text-muted-foreground">PKR Balance</p>
              </div>
              <div className="bg-background/60 rounded-xl p-3 text-center">
                <TrendingUp className="w-4 h-4 text-emerald-500 mx-auto mb-1" />
                <p className="font-black text-lg text-emerald-600">
                  {monthlyStats.monthlyRevenue.toFixed(0)}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  Revenue (30d)
                </p>
              </div>
              <div className="bg-background/60 rounded-xl p-3 text-center">
                <ShoppingCart className="w-4 h-4 text-blue-500 mx-auto mb-1" />
                <p className="font-black text-lg text-blue-600">
                  {monthlyStats.monthlyOrders}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  Orders (30d)
                </p>
              </div>
            </div>
            {!subInfo.canPost && (
              <Button
                variant="outline"
                size="sm"
                data-ocid="sales.topup.open_modal_button"
                onClick={() => setTopUpOpen(true)}
                className="w-full mt-3 text-xs rounded-xl border-red-400 text-red-600 hover:bg-red-50"
              >
                <Wallet className="w-3.5 h-3.5 mr-1.5" />
                Top Up Balance
              </Button>
            )}
          </motion.div>
        )}

        {/* Suspended Warning */}
        {subInfo && !subInfo.canPost && !topUpOpen && (
          <div
            className="flex items-start gap-2 bg-amber-500/10 border border-amber-500/30 rounded-xl p-3"
            data-ocid="sales.suspended.error_state"
          >
            <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-700 dark:text-amber-400">
              Your store is suspended due to low balance. Add PKR 1,000 or more
              to reactivate your posts.
            </p>
          </div>
        )}

        {/* Posts List */}
        {posts.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-12 text-center"
            data-ocid="sales.posts.empty_state"
          >
            <Store className="w-10 h-10 text-muted-foreground mb-2" />
            <p className="font-semibold text-foreground">No posts yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Create your first product post!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {posts.map((post, idx) => (
              <motion.div
                key={post.id}
                data-ocid={`sales.posts.item.${idx + 1}`}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-start gap-3 bg-card rounded-2xl p-3 border border-border"
              >
                <div className="w-16 h-16 shrink-0">
                  {post.imageUrl ? (
                    <img
                      src={post.imageUrl}
                      alt={post.title}
                      className="w-16 h-16 object-cover rounded-xl"
                    />
                  ) : (
                    <div
                      className="w-16 h-16 rounded-xl flex items-center justify-center"
                      style={{
                        background: `${getCategoryColor(post.category)}20`,
                        border: `1px solid ${getCategoryColor(post.category)}30`,
                      }}
                    >
                      <Package
                        className="w-6 h-6"
                        style={{ color: getCategoryColor(post.category) }}
                      />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-bold text-sm text-foreground leading-tight truncate">
                      {post.title}
                    </p>
                    <Badge
                      className={`text-[10px] shrink-0 ${
                        post.isActive
                          ? "bg-green-500/20 text-green-700 border-green-500/30"
                          : "bg-red-500/20 text-red-700 border-red-500/30"
                      }`}
                      variant="outline"
                    >
                      {post.isActive ? "Active" : "Paused"}
                    </Badge>
                  </div>
                  <p
                    className="text-xs font-bold mt-0.5"
                    style={{ color: getCategoryColor(post.category) }}
                  >
                    PKR {post.price.toLocaleString()}
                  </p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      <Eye className="w-3 h-3" />
                      {post.viewCount}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      <ShoppingCart className="w-3 h-3" />
                      {post.orderCount}
                    </span>
                    <button
                      type="button"
                      data-ocid={`sales.posts.delete_button.${idx + 1}`}
                      onClick={() => handleDeletePost(post.id)}
                      className="ml-auto w-7 h-7 rounded-lg flex items-center justify-center bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* New Post Sheet */}
      <Sheet open={newPostOpen} onOpenChange={setNewPostOpen}>
        <SheetContent
          side="bottom"
          className="rounded-t-3xl max-h-[92vh] overflow-y-auto"
          data-ocid="sales.newpost.sheet"
        >
          <SheetHeader className="mb-4">
            <SheetTitle className="text-left flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary" />
              New Product Post
            </SheetTitle>
          </SheetHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="font-semibold">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                data-ocid="sales.newpost.title.input"
                placeholder="Product title"
                value={newPost.title}
                onChange={(e) =>
                  setNewPost((p) => ({ ...p, title: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label className="font-semibold">
                Price (PKR) <span className="text-destructive">*</span>
              </Label>
              <Input
                data-ocid="sales.newpost.price.input"
                type="number"
                placeholder="e.g. 1500"
                value={newPost.price}
                onChange={(e) =>
                  setNewPost((p) => ({ ...p, price: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label className="font-semibold">
                Description <span className="text-destructive">*</span>
              </Label>
              <Textarea
                data-ocid="sales.newpost.description.textarea"
                placeholder="Describe your product..."
                value={newPost.description}
                onChange={(e) =>
                  setNewPost((p) => ({ ...p, description: e.target.value }))
                }
                rows={3}
                className="resize-none"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="font-semibold">Category</Label>
              <select
                data-ocid="sales.newpost.category.select"
                value={newPost.category}
                onChange={(e) =>
                  setNewPost((p) => ({ ...p, category: e.target.value }))
                }
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="font-semibold">Product Image (optional)</Label>
              <button
                type="button"
                className="w-full border-2 border-dashed border-border rounded-xl p-4 flex flex-col items-center gap-2 cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
                data-ocid="sales.newpost.dropzone"
              >
                {newPost.imageUrl ? (
                  <img
                    src={newPost.imageUrl}
                    alt="preview"
                    className="w-full h-32 object-cover rounded-lg"
                  />
                ) : (
                  <>
                    <Package className="w-8 h-8 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground text-center">
                      Tap to upload image
                    </p>
                  </>
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                data-ocid="sales.newpost.upload_button"
                onChange={handleImageUpload}
              />
            </div>
            <Button
              data-ocid="sales.newpost.submit_button"
              onClick={handleCreatePost}
              disabled={isPosting}
              className="w-full h-12 text-base font-bold rounded-2xl"
            >
              {isPosting ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Plus className="w-4 h-4 mr-2" />
              )}
              {isPosting ? "Creating..." : "Create Post"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Top Up Sheet */}
      <Sheet open={topUpOpen} onOpenChange={setTopUpOpen}>
        <SheetContent
          side="bottom"
          className="rounded-t-3xl"
          data-ocid="sales.topup.sheet"
        >
          <SheetHeader className="mb-4">
            <SheetTitle className="text-left flex items-center gap-2">
              <Wallet className="w-5 h-5 text-primary" />
              Top Up Balance
            </SheetTitle>
          </SheetHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Minimum PKR 1,000 required for active posting. Each post costs PKR
              0.25/day.
            </p>
            <div className="space-y-1.5">
              <Label className="font-semibold">Amount (PKR)</Label>
              <Input
                data-ocid="sales.topup.amount.input"
                type="number"
                placeholder="Minimum PKR 1,000"
                value={topUpAmount}
                onChange={(e) => setTopUpAmount(e.target.value)}
              />
            </div>
            <Button
              data-ocid="sales.topup.submit_button"
              onClick={handleTopUp}
              className="w-full h-12 text-base font-bold rounded-2xl"
            >
              Add Balance
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function SalesTab() {
  const { currentUser } = useAuth();
  const isSeller = currentUser?.role === "seller";

  return (
    <AnimatePresence mode="wait">
      {isSeller ? (
        <motion.div
          key="seller"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="h-full"
        >
          <SellerSalesView />
        </motion.div>
      ) : (
        <motion.div
          key="buyer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="h-full"
        >
          <BuyerSalesView />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
