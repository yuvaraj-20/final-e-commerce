// import { Product, ThriftItem, CustomDesign, AIRecommendation, ChatMessage, Order, CommunityPost, Comment, ChatConversation, UploadFormData, User, MonofitCombo, MonofitFilters } from '../src/types';
import { mockProducts, mockThriftItems, mockCustomDesigns, mockOrders, mockCommunityPosts, mockComments, mockChatConversations, mockSellers, mockMonofitCombos } from '../src/components/data/mockData';

// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const api = {
  // Products
  async getProducts(filters) {
    await delay(500);
    let filteredProducts = mockProducts;
    
    if (filters?.category) {
      filteredProducts = filteredProducts.filter(p => p.category === filters.category);
    }
    
    if (filters?.priceRange) {
      filteredProducts = filteredProducts.filter(p => 
        p.price >= filters.priceRange[0] && p.price <= filters.priceRange[1]
      );
    }
    
    return filteredProducts;
  },
  
  async getProduct(id) {
    await delay(300);
    return mockProducts.find(p => p.id === id) || null;
  },

  // Admin Product Management
  async bulkDeleteProducts(productIds) {
    await delay(800);
    console.log('Bulk deleting products:', productIds);
    return true;
  },

  async bulkUpdateProducts(productIds, updates) {
    await delay(600);
    console.log('Bulk updating products:', productIds, updates);
    return true;
  },

  async exportProducts(productIds) {
    await delay(1000);
    console.log('Exporting products:', productIds);
    return true;
  },

  async createProduct(productData) {
    await delay(800);
    const newProduct = {
      id: `product-${Date.now()}`,
      name: productData.name,
      description: productData.description,
      price: productData.price,
      images: productData.images || [],
      category: productData.category,
      sizes: productData.sizes || [],
      colors: productData.colors || [],
      stock: productData.stock || 0,
      rating: 0,
      reviews: 0,
      tags: productData.tags || []
    };
    return newProduct;
  },

  async updateProduct(productId, updates) {
    await delay(600);
    const product = mockProducts.find(p => p.id === productId);
    if (product) {
      return { ...product, ...updates };
    }
    return null;
  },

  async deleteProduct(productId) {
    await delay(400);
    return true;
  },
  
  // MonoFit APIs
  async getMonofitCombos(filters) {
    await delay(500);
    let filteredCombos = mockMonofitCombos.filter(combo => combo.approved);
    
    if (filters?.gender && filters.gender !== 'all') {
      filteredCombos = filteredCombos.filter(combo => 
        combo.gender.toLowerCase() === filters.gender || combo.gender.toLowerCase() === 'unisex'
      );
    }
    
    if (filters?.category && filters.category !== 'all') {
      filteredCombos = filteredCombos.filter(combo => 
        combo.category.toLowerCase() === filters.category
      );
    }
    
    if (filters?.occasion && filters.occasion !== 'all') {
      filteredCombos = filteredCombos.filter(combo => 
        combo.occasion.toLowerCase() === filters.occasion
      );
    }
    
    if (filters?.season && filters.season !== 'all') {
      filteredCombos = filteredCombos.filter(combo => 
        combo.season.toLowerCase() === filters.season || combo.season.toLowerCase() === 'all season'
      );
    }
    
    if (filters?.priceRange) {
      filteredCombos = filteredCombos.filter(combo => {
        const price = combo.discountPercentage 
          ? combo.totalPrice * (1 - combo.discountPercentage / 100)
          : combo.totalPrice;
        return price >= filters.priceRange[0] && price <= filters.priceRange[1];
      });
    }
    
    if (filters?.search) {
      const searchTerm = filters.search.toLowerCase();
      filteredCombos = filteredCombos.filter(combo => 
        combo.name.toLowerCase().includes(searchTerm) ||
        combo.description.toLowerCase().includes(searchTerm) ||
        combo.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    }
    
    // Sort combos
    if (filters?.sortBy) {
      switch (filters.sortBy) {
        case 'popular':
          filteredCombos.sort((a, b) => (b.likes + b.views + b.orders) - (a.likes + a.views + a.orders));
          break;
        case 'trending':
          filteredCombos.sort((a, b) => (b.trendingScore || 0) - (a.trendingScore || 0));
          break;
        case 'price-low':
          filteredCombos.sort((a, b) => {
            const priceA = a.discountPercentage ? a.totalPrice * (1 - a.discountPercentage / 100) : a.totalPrice;
            const priceB = b.discountPercentage ? b.totalPrice * (1 - b.discountPercentage / 100) : b.totalPrice;
            return priceA - priceB;
          });
          break;
        case 'price-high':
          filteredCombos.sort((a, b) => {
            const priceA = a.discountPercentage ? a.totalPrice * (1 - a.discountPercentage / 100) : a.totalPrice;
            const priceB = b.discountPercentage ? b.totalPrice * (1 - b.discountPercentage / 100) : b.totalPrice;
            return priceB - priceA;
          });
          break;
        case 'newest':
        default:
          filteredCombos.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          break;
      }
    }
    
    return filteredCombos;
  },
  
  async getMonofitCombo(id) {
    await delay(300);
    const combo = mockMonofitCombos.find(combo => combo.id === id);
    if (combo) {
      // Increment view count (in real app, this would be handled server-side)
      combo.views += 1;
    }
    return combo || null;
  },
  
  async getTrendingCombos(timeFilter) {
    await delay(600);
    // Filter trending combos and sort by trending score
    const trendingCombos = mockMonofitCombos
      .filter(combo => combo.approved && combo.isTrending)
      .sort((a, b) => (b.trendingScore || 0) - (a.trendingScore || 0));
    
    return trendingCombos.slice(0, 10);
  },
  
  async submitMonofitCombo(comboData, userId) {
    await delay(1000);
    
    // Simulate image upload and get URLs
    const imageUrls = comboData.images.map((_, index) => 
      `https://images.pexels.com/photos/767967${index}/pexels-photo-767967${index}.jpeg?auto=compress&cs=tinysrgb&w=800`
    );
    
    // Create mock products for the combo items
    const topItem = {
      id: `top-${Date.now()}`,
      name: comboData.topItem.name,
      description: `${comboData.topItem.name} from ${comboData.name} combo`,
      price: comboData.topItem.price,
      images: [imageUrls[0]],
      category: 'T-Shirts',
      sizes: comboData.topItem.sizes,
      colors: comboData.topItem.colors,
      stock: 50,
      rating: 4.5,
      reviews: 0,
      tags: comboData.tags
    };
    
    const bottomItem = {
      id: `bottom-${Date.now()}`,
      name: comboData.bottomItem.name,
      description: `${comboData.bottomItem.name} from ${comboData.name} combo`,
      price: comboData.bottomItem.price,
      images: [imageUrls[1] || imageUrls[0]],
      category: 'Pants',
      sizes: comboData.bottomItem.sizes,
      colors: comboData.bottomItem.colors,
      stock: 50,
      rating: 4.5,
      reviews: 0,
      tags: comboData.tags
    };
    
    const newCombo = {
      id: `combo-${Date.now()}`,
      name: comboData.name,
      description: comboData.description,
      images: imageUrls,
      category: comboData.category,
      occasion: comboData.occasion,
      season: comboData.season,
      gender: comboData.gender,
      fabricType: comboData.fabricType,
      tags: comboData.tags,
      items: [topItem, bottomItem],
      totalPrice: comboData.topItem.price + comboData.bottomItem.price,
      discountPercentage: comboData.discountPercentage,
      likes: 0,
      views: 0,
      shares: 0,
      orders: 0,
      comments: 0,
      rating: 0,
      createdAt: new Date().toISOString(),
      creatorId: userId,
      creatorName: 'Current User',
      approved: false,
      trendingScore: 0
    };
    
    return newCombo;
  },
  
  async getComboRecommendations(userId, comboId) {
    await delay(800);
    // Mock AI recommendations based on user preferences or similar combos
    const recommendations = mockMonofitCombos
      .filter(combo => combo.approved && combo.id !== comboId)
      .slice(0, 4);
    return recommendations;
  },
  
  // Thrift Store APIs
  async getThriftItems(filters) {
    await delay(500);
    let filteredItems = mockThriftItems.filter(item => item.approved && item.status === 'approved');
    
    if (filters?.gender && filters.gender !== 'all') {
      filteredItems = filteredItems.filter(item => item.gender === filters.gender);
    }
    
    if (filters?.category && filters.category !== 'all') {
      filteredItems = filteredItems.filter(item => item.category === filters.category);
    }
    
    if (filters?.condition && filters.condition !== 'all') {
      filteredItems = filteredItems.filter(item => item.condition === filters.condition);
    }
    
    if (filters?.size && filters.size !== 'all') {
      filteredItems = filteredItems.filter(item => item.size === filters.size);
    }
    
    if (filters?.priceRange) {
      filteredItems = filteredItems.filter(item => 
        item.price >= filters.priceRange[0] && item.price <= filters.priceRange[1]
      );
    }
    
    if (filters?.search) {
      const searchTerm = filters.search.toLowerCase();
      filteredItems = filteredItems.filter(item => 
        item.name.toLowerCase().includes(searchTerm) ||
        item.description.toLowerCase().includes(searchTerm) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    }
    
    // Sort items
    if (filters?.sortBy) {
      switch (filters.sortBy) {
        case 'price-low':
          filteredItems.sort((a, b) => a.price - b.price);
          break;
        case 'price-high':
          filteredItems.sort((a, b) => b.price - a.price);
          break;
        case 'newest':
          filteredItems.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          break;
        case 'popular':
          filteredItems.sort((a, b) => (b.likes + b.views) - (a.likes + a.views));
          break;
        default:
          break;
      }
    }
    
    return filteredItems;
  },
  
  async getThriftItem(id) {
    await delay(300);
    const item = mockThriftItems.find(item => item.id === id);
    if (item) {
      // Increment view count (in real app, this would be handled server-side)
      item.views += 1;
    }
    return item || null;
  },
  
  async submitThriftItem(itemData, userId) {
    await delay(1000);
    
    // Simulate image upload and get URLs
    const imageUrls = itemData.images.map((_, index) => 
      `https://images.pexels.com/photos/767967${index}/pexels-photo-767967${index}.jpeg?auto=compress&cs=tinysrgb&w=800`
    );
    
    const newItem = {
      id: `t${Date.now()}`,
      name: itemData.name,
      description: itemData.description,
      price: itemData.price,
      images: imageUrls,
      condition: itemData.condition,
      category: itemData.category,
      size: itemData.size,
      color: itemData.color,
      gender: itemData.gender,
      sellerId: userId,
      sellerName: 'Current User',
      approved: false,
      likes: 0,
      views: 0,
      createdAt: new Date().toISOString(),
      tags: itemData.tags,
      status: 'pending'
    };
    
    return newItem;
  },
  
  async toggleThriftLike(itemId, userId) {
    await delay(200);
    const item = mockThriftItems.find(item => item.id === itemId);
    if (item) {
      // In real app, check if user already liked and toggle accordingly
      item.likes += 1;
      return true;
    }
    return false;
  },
  
  async getUserThriftItems(userId) {
    await delay(400);
    return mockThriftItems.filter(item => item.sellerId === userId);
  },
  
  async deleteThriftItem(itemId, userId) {
    await delay(300);
    // In real app, verify ownership and delete
    return true;
  },
  
  // Community APIs
  async getCommunityPosts(filters) {
    await delay(500);
    let posts = [...mockCommunityPosts];
    
    if (filters?.type && filters.type !== 'all') {
      posts = posts.filter(post => post.type === filters.type);
    }
    
    if (filters?.sortBy === 'trending') {
      posts.sort((a, b) => (b.likes + b.comments + b.shares) - (a.likes + a.comments + a.shares));
    } else {
      posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    
    return posts;
  },
  
  async createCommunityPost(postData, userId) {
    await delay(600);
    const newPost = {
      id: `p${Date.now()}`,
      userId,
      userName: 'Current User',
      userAvatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400',
      userBadges: [],
      content: postData.content,
      images: postData.images || [],
      likes: 0,
      comments: 0,
      shares: 0,
      createdAt: new Date().toISOString(),
      tags: postData.tags || [],
      type: postData.type || 'general'
    };
    return newPost;
  },
  
  async likePost(postId, userId) {
    await delay(200);
    // In real app, toggle like status
    return true;
  },
  
  async getPostComments(postId) {
    await delay(300);
    return mockComments.filter(comment => comment.postId === postId);
  },
  
  async addComment(postId, content, userId) {
    await delay(400);
    const newComment = {
      id: `c${Date.now()}`,
      postId,
      userId,
      userName: 'Current User',
      userAvatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400',
      content,
      createdAt: new Date().toISOString(),
      likes: 0
    };
    return newComment;
  },
  
  // Chat APIs
  async getChatConversations(userId) {
    await delay(400);
    return mockChatConversations.filter(conv => conv.participants.includes(userId));
  },
  
  async getChatMessages(conversationId) {
    await delay(300);
    // Mock messages for a conversation
    return [
      {
        id: 'msg1',
        senderId: 'seller1',
        receiverId: '1',
        content: 'Hi! Thanks for your interest in the vintage band t-shirt.',
        timestamp: '2024-01-28T15:30:00Z',
        read: true,
        type: 'text'
      },
      {
        id: 'msg2',
        senderId: '1',
        receiverId: 'seller1',
        content: 'Hello! Could you tell me more about the condition? Any stains or holes?',
        timestamp: '2024-01-28T15:35:00Z',
        read: true,
        type: 'text'
      },
      {
        id: 'msg3',
        senderId: 'seller1',
        receiverId: '1',
        content: 'It\'s in great condition! No stains or holes. The graphics are still vibrant. I can send more detailed photos if you\'d like.',
        timestamp: '2024-01-28T15:40:00Z',
        read: false,
        type: 'text'
      }
    ];
  },
  
  async sendChatMessage(conversationId, content, senderId) {
    await delay(200);
    return {
      id: `msg${Date.now()}`,
      senderId,
      receiverId: 'other-user',
      content,
      timestamp: new Date().toISOString(),
      read: false,
      type: 'text'
    };
  },
  
  async startConversation(sellerId, buyerId, itemId) {
    await delay(400);
    const item = itemId ? mockThriftItems.find(i => i.id === itemId) : null;
    
    return {
      id: `conv${Date.now()}`,
      participants: [sellerId, buyerId],
      lastMessage: {
        id: 'msg-init',
        senderId: buyerId,
        receiverId: sellerId,
        content: item ? `Hi! I'm interested in your ${item.name}` : 'Hello!',
        timestamp: new Date().toISOString(),
        read: false,
        type: 'text'
      },
      unreadCount: 0,
      itemId: item?.id,
      itemName: item?.name,
      itemImage: item?.images[0]
    };
  },
  
  // Seller Profile APIs
  async getSellerProfile(sellerId) {
    await delay(300);
    return mockSellers.find(seller => seller.id === sellerId) || null;
  },
  
  async getSellerItems(sellerId) {
    await delay(400);
    return mockThriftItems.filter(item => item.sellerId === sellerId && item.approved);
  },
  
  // AI Recommendation APIs
  async getThriftRecommendations(userId, itemId) {
    await delay(800);
    // Mock AI recommendations based on user preferences or similar items
    const recommendations = mockThriftItems
      .filter(item => item.approved && item.id !== itemId)
      .slice(0, 4);
    return recommendations;
  },
  
  async generateItemTags(imageUrl, title) {
    await delay(1000);
    // Mock AI-generated tags
    const possibleTags = ['vintage', 'casual', 'formal', 'summer', 'winter', 'trendy', 'classic', 'retro', 'modern', 'elegant'];
    return possibleTags.slice(0, Math.floor(Math.random() * 5) + 2);
  },
  
  async getMatchingItems(itemId) {
    await delay(600);
    // Mock matching items (e.g., tops that go with pants)
    return mockThriftItems.filter(item => item.approved).slice(0, 3);
  },
  
  // Admin APIs
  async getPendingThriftItems() {
    await delay(500);
    return mockThriftItems.filter(item => !item.approved);
  },
  
  async approveThriftItem(itemId) {
    await delay(300);
    const item = mockThriftItems.find(item => item.id === itemId);
    if (item) {
      item.approved = true;
      item.status = 'approved';
      return true;
    }
    return false;
  },
  
  async rejectThriftItem(itemId, reason) {
    await delay(300);
    const item = mockThriftItems.find(item => item.id === itemId);
    if (item) {
      item.status = 'rejected';
      return true;
    }
    return false;
  },
  
  async boostThriftItem(itemId) {
    await delay(200);
    const item = mockThriftItems.find(item => item.id === itemId);
    if (item) {
      item.isBoosted = true;
      return true;
    }
    return false;
  },

  // User Dashboard APIs
  async getOrders(userId) {
    await delay(500);
    return mockOrders.filter(order => order.userId === userId);
  },

  async getUserSavedCombos(userId) {
    await delay(400);
    // Mock saved combos - in real app, this would be based on user's wishlist
    return mockMonofitCombos.filter(combo => combo.approved).slice(0, 6);
  },

  async getAIComboRecommendations(userId) {
    await delay(600);
    // Mock AI recommendations
    return mockMonofitCombos.filter(combo => combo.approved).slice(2, 8);
  },

  async getAIProductRecommendations(userId) {
    await delay(600);
    // Mock AI product recommendations
    return mockProducts.slice(0, 8);
  },

  async getAIDesignSuggestions(userId) {
    await delay(800);
    // Mock AI design suggestions
    return [
      {
        id: 'design1',
        title: 'Minimalist Geometric Pattern',
        description: 'Clean lines and geometric shapes in a modern minimalist style',
        colors: ['#000000', '#ffffff', '#8b5cf6'],
        style: 'minimalist'
      },
      {
        id: 'design2',
        title: 'Vintage Retro Vibes',
        description: 'Nostalgic design with retro color palette and vintage typography',
        colors: ['#f59e0b', '#ef4444', '#1f2937'],
        style: 'vintage'
      },
      {
        id: 'design3',
        title: 'Nature-Inspired Art',
        description: 'Organic shapes and natural elements for an eco-friendly look',
        colors: ['#10b981', '#059669', '#064e3b'],
        style: 'nature'
      }
    ];
  },

  async generateStyleSuggestions(prompt, userId) {
    await delay(1200);
    // Mock AI-generated suggestions based on prompt
    return [
      {
        id: `suggestion-${Date.now()}`,
        title: 'AI Generated Style',
        description: `Custom style suggestion based on: "${prompt}"`,
        colors: ['#8b5cf6', '#3b82f6', '#10b981'],
        style: 'ai-generated'
      }
    ];
  },

  async getUserCommunityPosts(userId) {
    await delay(400);
    return mockCommunityPosts.filter(post => post.userId === userId);
  },

  async deletePost(postId) {
    await delay(300);
    // In real app, verify ownership and delete
    return true;
  },

  async getWishlistItems(wishlistIds) {
    await delay(600);
    
    const products = mockProducts.filter(p => wishlistIds.includes(p.id));
    const thriftItems = mockThriftItems.filter(t => wishlistIds.includes(t.id));
    const combos = mockMonofitCombos.filter(c => wishlistIds.includes(c.id));
    
    return { products, thriftItems, combos };
  },

  async deleteCustomDesign(designId) {
    await delay(300);
    return true;
  },

  // Admin Dashboard APIs
  async getAdminDashboardStats(timeRange) {
    await delay(600);
    return {
      totalUsers: 12547,
      totalRevenue: 284650,
      totalOrders: 3421,
      totalProducts: 156,
      pendingApprovals: 23,
      activeThriftItems: 89,
      monofitCombos: 45,
      communityPosts: 234,
      revenueGrowth: 12.5,
      userGrowth: 8.3,
      orderGrowth: 15.7
    };
  },

  async getRecentActivity() {
    await delay(400);
    return [
      { action: 'New thrift item uploaded', user: 'Sarah Johnson', time: '2 minutes ago', type: 'upload', status: 'pending' },
      { action: 'MonoFit combo approved', user: 'Admin', time: '15 minutes ago', type: 'approval', status: 'completed' },
      { action: 'Order #1234 completed', user: 'Mike Davis', time: '1 hour ago', type: 'order', status: 'completed' },
      { action: 'Community post flagged', user: 'Emma Wilson', time: '2 hours ago', type: 'flag', status: 'pending' }
    ];
  },

  async getAllOrders() {
    await delay(500);
    return mockOrders;
  },

  async updateOrderStatus(orderId, status) {
    await delay(300);
    return true;
  },

  async getAllUsers() {
    await delay(500);
    return [...mockSellers, mockUser];
  },

  async banUser(userId) {
    await delay(300);
    return true;
  },

  async updateUserRole(userId, role) {
    await delay(300);
    return true;
  },

  async toggleComboTrending(comboId) {
    await delay(300);
    return true;
  },

  async deleteCombo(comboId) {
    await delay(300);
    return true;
  },

  async getFlaggedPosts() {
    await delay(400);
    return mockCommunityPosts.slice(0, 2); // Mock flagged posts
  },

  async approvePost(postId) {
    await delay(300);
    return true;
  },

  async removePost(postId) {
    await delay(300);
    return true;
  },

  async flagPost(postId) {
    await delay(300);
    return true;
  },

  async getAISettings() {
    await delay(400);
    return {
      trendingWeights: {
        likes: 2,
        shares: 3,
        orders: 4,
        comments: 1
      },
      recommendationSettings: {
        maxRecommendations: 10,
        similarityThreshold: 0.7,
        diversityFactor: 0.3
      },
      autoModeration: {
        enabled: true,
        flagThreshold: 5,
        autoHide: false
      }
    };
  },

  async updateAISettings(settings) {
    await delay(500);
    return true;
  },

  async recomputeTrendingCombos() {
    await delay(1000);
    return true;
  },
  
  // Existing APIs (keeping for compatibility)
  async getCustomDesigns(userId) {
    await delay(400);
    return mockCustomDesigns.filter(d => d.userId === userId);
  },
  
  async saveCustomDesign(design) {
    await delay(600);
    const newDesign = {
      ...design,
      id: `d${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    return newDesign;
  },
  
  async generateDesignFromPrompt(prompt) {
    await delay(2000);
    const designUrls = [
      'https://images.pexels.com/photos/1292241/pexels-photo-1292241.jpeg?auto=compress&cs=tinysrgb&w=400',
      'https://images.pexels.com/photos/1292796/pexels-photo-1292796.jpeg?auto=compress&cs=tinysrgb&w=400',
      'https://images.pexels.com/photos/1292843/pexels-photo-1292843.jpeg?auto=compress&cs=tinysrgb&w=400'
    ];
    return designUrls[Math.floor(Math.random() * designUrls.length)];
  },
  
  async getRecommendations(userId, context) {
    await delay(800);
    return [
      { productId: '2', score: 0.95, reason: 'Based on your recent purchases' },
      { productId: '3', score: 0.89, reason: 'Perfect match for your style' },
      { productId: '4', score: 0.82, reason: 'Trending in your size' }
    ];
  },
  
  async sendChatMessage(message) {
    await delay(1000);
    const responses = [
      "I'd be happy to help you find the perfect outfit! What style are you looking for?",
      "Based on your preferences, I recommend checking out our MonoFit collection for coordinated looks.",
      "Would you like me to suggest some items based on your recent purchases?",
      "I can help you with sizing, styling tips, or even custom designs. What do you need?",
      "Our thrift store has some amazing finds! Are you looking for anything specific?"   
      ];
    return {
      id: `msg-${Date.now()}`,
      content: responses[Math.floor(Math.random() * responses.length)],
      senderId: 'ai-bot',
      timestamp: new Date().toISOString(),
      type: 'text'  
    };
  },
  async getChatHistory(conversationId) {
    await delay(500);
    return mockChatConversations.find(conv => conv.id === conversationId)?.messages || [];
  } 
};
