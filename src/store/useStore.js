import { create } from 'zustand';

// Default filter configurations
const defaultThriftFilters = {
  gender: 'all',
  category: 'all',
  condition: 'all',
  priceRange: [0, 500],
  size: 'all',
  sortBy: 'newest',
  search: ''
};

const defaultMonofitFilters = {
  gender: 'all',
  category: 'all',
  occasion: 'all',
  season: 'all',
  priceRange: [0, 500],
  sortBy: 'newest',
  search: ''
};

export const useStore = create((set, get) => ({
  // User state
  user: null,
  setUser: (user) => set({ user }),
  
  // Cart state
  cart: [],
  addToCart: (item) => {
    const cart = get().cart;
    const existingItem = cart.find(
      (cartItem) => 
        cartItem.product.id === item.product.id && 
        cartItem.size === item.size && 
        cartItem.color === item.color
    );
    
    if (existingItem) {
      set({
        cart: cart.map((cartItem) =>
          cartItem.id === existingItem.id
            ? { ...cartItem, quantity: cartItem.quantity + item.quantity }
            : cartItem
        )
      });
    } else {
      set({
        cart: [...cart, { ...item, id: `${item.product.id}-${item.size}-${item.color}-${Date.now()}` }]
      });
    }
  },
  removeFromCart: (id) => set({ cart: get().cart.filter(item => item.id !== id) }),
  updateCartQuantity: (id, quantity) => {
    if (quantity <= 0) {
      get().removeFromCart(id);
    } else {
      set({
        cart: get().cart.map(item =>
          item.id === id ? { ...item, quantity } : item
        )
      });
    }
  },
  clearCart: () => set({ cart: [] }),
  
  // Wishlist state
  wishlist: [],
  toggleWishlist: (productId) => {
    const wishlist = get().wishlist;
    if (wishlist.includes(productId)) {
      set({ wishlist: wishlist.filter(id => id !== productId) });
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
      set({ likedThriftItems: liked.filter(id => id !== itemId) });
    } else {
      set({ likedThriftItems: [...liked, itemId] });
    }
  },
  
  // Thrift filters state
  thriftFilters: defaultThriftFilters,
  setThriftFilters: (filters) => set({ 
    thriftFilters: { ...get().thriftFilters, ...filters } 
  }),
  resetThriftFilters: () => set({ thriftFilters: defaultThriftFilters }),
  
  // MonoFit state
  monofitCombos: [],
  setMonofitCombos: (monofitCombos) => set({ monofitCombos }),
  
  // MonoFit filters state
  monofitFilters: defaultMonofitFilters,
  setMonofitFilters: (filters) => set({ 
    monofitFilters: { ...get().monofitFilters, ...filters } 
  }),
  resetMonofitFilters: () => set({ monofitFilters: defaultMonofitFilters }),
  
  // Community state
  communityPosts: [],
  setCommunityPosts: (communityPosts) => set({ communityPosts }),
  addCommunityPost: (post) => set({ 
    communityPosts: [post, ...get().communityPosts] 
  }),
  
  // Chat state
  chatConversations: [],
  setChatConversations: (chatConversations) => set({ chatConversations }),
  addChatConversation: (conversation) => set({
    chatConversations: [conversation, ...get().chatConversations]
  }),
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
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
  
  // Filter state
  filters: {
    category: '',
    priceRange: [0, 1000],
    sizes: [],
    colors: [],
    rating: 0,
  },
  setFilters: (filters) => set({ filters: { ...get().filters, ...filters } }),
}));