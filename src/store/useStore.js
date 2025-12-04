// src/store/useStore.js
import { create } from "zustand";
import {
  api,
  get,
  ensureCsrf,
  readXsrfToken,
  cartApi,
  me,
  sanctumPost,
} from "../lib/apiClient"; // uses your existing apiClient.js

// Default filter configurations
const defaultThriftFilters = {
  gender: "all",
  category: "all",
  condition: "all",
  priceRange: [0, 500],
  size: "all",
  sortBy: "newest",
  search: "",
};

const defaultMonofitFilters = {
  gender: "all",
  category: "all",
  occasion: "all",
  season: "all",
  priceRange: [0, 500],
  sortBy: "newest",
  search: "",
};

export const useStore = create((set, get) => ({
  // User state
  user: null,
  setUser: (user) => set({ user }),

  // Cart state (front-end canonical)
  cart: [],
  // setCart: replace entire cart (useful after server sync)
  setCart: (cartArray) => set({ cart: cartArray || [] }),

  /**************************************************************************
   * Local addToCart (unchanged nature)
   * - keeps existing behaviour of matching by product.id + size + color
   * - generates local id if needed
   **************************************************************************/
  addToCart: (item) => {
    const cart = get().cart;
    // ensure shape
    const product = item.product || item;
    const size = item.size || product.default_size || "M";
    const color =
      item.color ||
      (product.colors && product.colors[0]) ||
      product.color ||
      "default";
    const quantity = item.quantity || 1;

    // match by product id + size + color
    const existingItem = cart.find(
      (cartItem) =>
        cartItem.product?.id === product.id &&
        cartItem.size === size &&
        cartItem.color === color
    );

    if (existingItem) {
      set({
        cart: cart.map((cartItem) =>
          cartItem.id === existingItem.id
            ? { ...cartItem, quantity: (cartItem.quantity || 0) + quantity }
            : cartItem
        ),
      });
    } else {
      const id = `${product.id}-${size}-${color}-${Date.now()}`;
      set({
        cart: [...cart, { id, product, size, color, quantity }],
      });
    }
  },

  removeFromCart: (id) => set({ cart: get().cart.filter((item) => item.id !== id) }),

  updateCartQuantity: (id, quantity) => {
    if (quantity <= 0) {
      get().removeFromCart(id);
    } else {
      set({
        cart: get().cart.map((item) => (item.id === id ? { ...item, quantity } : item)),
      });
    }
  },

  clearCart: () => set({ cart: [] }),

  /**************************************************************************
   * Guest cart helpers (localStorage) - unchanged
   **************************************************************************/
  loadGuestCart: () => {
    try {
      const stored = JSON.parse(localStorage.getItem("guestCart") || "[]");
      return Array.isArray(stored) ? stored : [];
    } catch (e) {
      console.error("Failed loading guestCart", e);
      return [];
    }
  },

  clearGuestCart: () => {
    try {
      localStorage.removeItem("guestCart");
    } catch (e) {
      console.error("Failed clearing guestCart", e);
    }
  },

  /**************************************************************************
   * Merge guestCart into zustand cart (unchanged)
   **************************************************************************/
  mergeGuestCart: (guestCartArray) => {
    try {
      const arr =
        guestCartArray || JSON.parse(localStorage.getItem("guestCart") || "[]");
      if (!Array.isArray(arr) || arr.length === 0) return;

      arr.forEach((gItem) => {
        const payload = {
          product: gItem.product || gItem,
          size: gItem.size || (gItem.product?.default_size) || "M",
          color: gItem.color || (gItem.product?.colors?.[0]) || "default",
          quantity: gItem.quantity || 1,
        };
        get().addToCart(payload);
      });

      localStorage.removeItem("guestCart");
    } catch (e) {
      console.error("Failed merging guest cart", e);
    }
  },

  /**************************************************************************
   * Server-backed cart helpers (new)
   * - These call your backend via apiClient (get/post/del).
   * - They map backend responses into a frontend-friendly `cart` array
   * - They do NOT replace local addToCart behaviour; they are helpers for
   *   pages that want to use server flows (login path)
   **************************************************************************/

  // Fetch cart from server and set `cart` array in store
  fetchCartFromServer: async () => {
    try {
      const res = await get("/api/cart");
      // backend responses vary; try to normalise:
      const payload = res?.data ?? res;
      // payload may be cart object with items relationship
      let items = [];
      if (payload?.items && Array.isArray(payload.items)) {
        items = payload.items.map((i) => {
          const p = i.product ?? i.product_data ?? {};
          return {
            id: i.id,
            product: p,
            quantity: i.quantity ?? 1,
            store: i.store ?? payload.store ?? undefined,
            size: i.size ?? undefined,
            color: i.color ?? undefined,
            // flattened fields for header mini-cart
            name: p.name,
            price: p.price ?? i.price_at_add,
            image: p.image || (Array.isArray(p.images) ? p.images[0] : undefined),
          };
        });
      } else if (Array.isArray(payload)) {
        // backend returned items array directly
        items = payload;
      } else {
        // fallback: if payload itself looks like items
        items = [];
      }
      set({ cart: items });
      return items;
    } catch (err) {
      console.error("fetchCartFromServer error", err);
      throw err;
    }
  },

  // Add to cart on server (expects product_id, quantity, optional store)
  // Add to cart on server (expects product_id, quantity, optional store)
  addToCartServer: async ({ product_id, quantity = 1, store = null, type = 'product', condition = null, seller_id = null, seller_name = null }) => {
    try {
      await ensureCsrf();
      const token = readXsrfToken();

      const payload = {
        product_id,
        type,
        quantity,
        store: store || (type === 'thrift' ? 'thrift' : 'monofit'),
      };

      if (type === 'thrift') {
        payload.condition = condition;
        payload.seller_id = seller_id;
        payload.seller_name = seller_name;
      }

      const res = await api.post("/api/cart/add", payload, {
        headers: {
          "X-XSRF-TOKEN": token,
        },
      });

      const data = res?.data ?? res;

      // After add, backend usually returns updated cart model -> normalise items
      let items = [];
      if (data?.items && Array.isArray(data.items)) {
        items = data.items.map((i) => {
          const p = i.product ?? i.product_data ?? {};
          return {
            id: i.id,
            product: p,
            quantity: i.quantity ?? 1,
            store: i.store ?? undefined,
            size: i.size ?? undefined,
            color: i.color ?? undefined,
            name: p.name,
            price: p.price ?? i.price_at_add,
            image: p.image || (Array.isArray(p.images) ? p.images[0] : undefined),
          };
        });
      } else if (Array.isArray(data)) {
        items = data;
      }
      set({ cart: items });
      return items;
    } catch (err) {
      console.error("addToCartServer error", err);
      throw err;
    }
  },

  // Remove a cart item on server by cart_item id
  removeCartItemServer: async (cartItemId) => {
    try {
      await ensureCsrf();
      const xsrf = readXsrfToken();
      const res = await api.delete(`/api/cart/item/${cartItemId}`, {
        headers: { "X-XSRF-TOKEN": xsrf },
      });
      const payload = res?.data ?? res;
      let items = [];
      if (payload?.items && Array.isArray(payload.items)) {
        items = payload.items.map((i) => {
          const p = i.product ?? i.product_data ?? {};
          return {
            id: i.id,
            product: p,
            quantity: i.quantity ?? 1,
            store: i.store ?? undefined,
            size: i.size ?? undefined,
            color: i.color ?? undefined,
            name: p.name,
            price: p.price ?? i.price_at_add,
            image: p.image || (Array.isArray(p.images) ? p.images[0] : undefined),
          };
        });
      } else if (Array.isArray(payload)) {
        items = payload;
      } else if (payload?.data && Array.isArray(payload.data)) {
        items = payload.data;
      }
      set({ cart: items });
      return items;
    } catch (err) {
      console.error("removeCartItemServer error", err);
      throw err;
    }
  },

  // Clear cart server-side
  clearCartServer: async () => {
    try {
      await ensureCsrf();
      const xsrf = readXsrfToken();
      await api.delete("/api/cart/clear", {
        headers: { "X-XSRF-TOKEN": xsrf },
      });
      set({ cart: [] });
      return [];
    } catch (err) {
      console.error("clearCartServer error", err);
      throw err;
    }
  },

  // Sync a guestCart array to server (calls addToCartServer for each)
  syncGuestCartToServer: async (guestCartArray) => {
    try {
      const arr = guestCartArray || JSON.parse(localStorage.getItem("guestCart") || "[]");
      if (!Array.isArray(arr) || arr.length === 0) return [];
      for (const item of arr) {
        await get().addToCartServer({
          product_id: item.product?.id ?? item.id,
          quantity: item.quantity ?? 1,
          store: item.store ?? null,
        });
      }
      // After sync, clear localStorage guestCart
      localStorage.removeItem("guestCart");
      // fetch server cart and set
      return await get().fetchCartFromServer();
    } catch (err) {
      console.error("syncGuestCartToServer error", err);
      throw err;
    }
  },

  /**************************************************************************
   * Rest of your store (wishlist, products, thrift, etc.) left unchanged
   **************************************************************************/

  // Wishlist state (stores product IDs)
  wishlist: [],
  toggleWishlist: (productId) => {
    const wishlist = get().wishlist;
    if (wishlist.includes(productId)) {
      set({ wishlist: wishlist.filter((id) => id !== productId) });
    } else {
      set({ wishlist: [...wishlist, productId] });
    }
  },

  // Products state
  products: [],
  setProducts: (products) => set({ products }),

  // Thrift items state
  thriftItems: [],
  setThriftItems: (thriftItems) => set({ thriftItems }),
  likedThriftItems: [],
  toggleThriftLike: (itemId) => {
    const liked = get().likedThriftItems;
    if (liked.includes(itemId)) {
      set({ likedThriftItems: liked.filter((id) => id !== itemId) });
    } else {
      set({ likedThriftItems: [...liked, itemId] });
    }
  },

  // Thrift filters state
  thriftFilters: defaultThriftFilters,
  setThriftFilters: (filters) =>
    set({
      thriftFilters: { ...get().thriftFilters, ...filters },
    }),
  resetThriftFilters: () => set({ thriftFilters: defaultThriftFilters }),

  // MonoFit state
  monofitCombos: [],
  setMonofitCombos: (monofitCombos) => set({ monofitCombos }),

  // MonoFit filters state
  monofitFilters: defaultMonofitFilters,
  setMonofitFilters: (filters) =>
    set({
      monofitFilters: { ...get().monofitFilters, ...filters },
    }),
  resetMonofitFilters: () => set({ monofitFilters: defaultMonofitFilters }),

  // Community state
  communityPosts: [],
  setCommunityPosts: (communityPosts) => set({ communityPosts }),
  addCommunityPost: (post) => set({ communityPosts: [post, ...get().communityPosts] }),

  // Chat state
  chatConversations: [],
  setChatConversations: (chatConversations) => set({ chatConversations }),

  activeConversationId: null,
  setActiveConversationId: (id) => set({ activeConversationId: id }),

  upsertChatConversation: (conversation) => {
    if (!conversation) return null;
    const convs = get().chatConversations || [];
    const existingById = conversation.id
      ? convs.find((c) => c.id === conversation.id)
      : null;

    if (existingById) {
      const updated = convs.map((c) =>
        c.id === existingById.id ? { ...existingById, ...conversation } : c
      );
      set({ chatConversations: updated });
      return existingById.id;
    }

    const participants = Array.isArray(conversation.participants)
      ? conversation.participants.slice().sort()
      : [];
    const match = convs.find((c) => {
      if (!Array.isArray(c.participants)) return false;
      const a = c.participants.slice().sort();
      if (a.length !== participants.length) return false;
      return a.every((v, i) => v === participants[i]);
    });

    if (match) {
      const updated = convs.map((c) => (c.id === match.id ? { ...match, ...conversation } : c));
      set({ chatConversations: updated });
      return match.id;
    }

    const id = conversation.id || `conv-${Date.now()}`;
    const newConv = {
      ...conversation,
      id,
      unreadCount: conversation.unreadCount ?? 0,
      createdAt: conversation.createdAt ?? new Date().toISOString(),
    };
    set({ chatConversations: [newConv, ...convs] });
    return id;
  },

  getConversationByParticipants: (participants = []) => {
    if (!Array.isArray(participants) || participants.length === 0) return null;
    const convs = get().chatConversations || [];
    const sortedTarget = participants.slice().sort();
    return (
      convs.find((c) => {
        if (!Array.isArray(c.participants)) return false;
        const a = c.participants.slice().sort();
        if (a.length !== sortedTarget.length) return false;
        return a.every((v, i) => v === sortedTarget[i]);
      }) || null
    );
  },

  markConversationRead: (id) => {
    if (!id) return;
    set({
      chatConversations: get().chatConversations.map((c) =>
        c.id === id ? { ...c, unreadCount: 0 } : c
      ),
    });
  },

  incrementConversationUnread: (id, delta = 1) => {
    if (!id) return;
    set({
      chatConversations: get().chatConversations.map((c) =>
        c.id === id ? { ...c, unreadCount: Math.max(0, (c.unreadCount || 0) + delta) } : c
      ),
    });
  },

  removeChatConversation: (id) => {
    if (!id) return;
    set({ chatConversations: get().chatConversations.filter((c) => c.id !== id) });
    if (get().activeConversationId === id) set({ activeConversationId: null });
  },

  chatMessages: [],
  addChatMessage: (message) => set({ chatMessages: [...get().chatMessages, message] }),
  clearChat: () => set({ chatMessages: [] }),

  // Custom designs state
  customDesigns: [],
  setCustomDesigns: (customDesigns) => set({ customDesigns }),
  addCustomDesign: (design) => set({ customDesigns: [...get().customDesigns, design] }),

  // Orders state
  orders: [],
  setOrders: (orders) => set({ orders }),
  addOrder: (order) => set({ orders: [...get().orders, order] }),

  // UI state
  isMobileMenuOpen: false,
  setMobileMenuOpen: (open) => set({ isMobileMenuOpen: open }),

  // Search state
  searchQuery: "",
  setSearchQuery: (query) => set({ searchQuery: query }),

  // Filter state
  filters: {
    category: "",
    priceRange: [0, 1000],
    sizes: [],
    colors: [],
    rating: 0,
  },
  setFilters: (filters) => set({ filters: { ...get().filters, ...filters } }),
}));
