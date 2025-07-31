// import { Product, ThriftItem, CustomDesign, AIRecommendation, ChatMessage, Order, CommunityPost, Comment, ChatConversation, UploadFormData, User, MonofitCombo, MonofitFilters } from '../types';
import { mockProducts, mockThriftItems, mockCustomDesigns, mockOrders, mockCommunityPosts, mockComments, mockChatConversations, mockSellers, mockMonofitCombos } from '../components/data/mockData';

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

  // Thrift Items
  async getThriftItems(filters) {
    await delay(500);
    let filteredItems = mockThriftItems;
    
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
      const searchLower = filters.search.toLowerCase();
      filteredItems = filteredItems.filter(item => 
        item.name.toLowerCase().includes(searchLower) || 
        item.description.toLowerCase().includes(searchLower) ||
        item.brand.toLowerCase().includes(searchLower)
      );
    }
    
    // Sort items
    if (filters?.sortBy) {
      switch (filters.sortBy) {
        case 'newest':
          filteredItems.sort((a, b) => new Date(b.listedAt) - new Date(a.listedAt));
          break;
        case 'oldest':
          filteredItems.sort((a, b) => new Date(a.listedAt) - new Date(b.listedAt));
          break;
        case 'price-low':
          filteredItems.sort((a, b) => a.price - b.price);
          break;
        case 'price-high':
          filteredItems.sort((a, b) => b.price - a.price);
          break;
        case 'popular':
          filteredItems.sort((a, b) => b.views - a.views);
          break;
      }
    }
    
    return filteredItems;
  },
  
  async getThriftItem(id) {
    await delay(300);
    return mockThriftItems.find(item => item.id === id) || null;
  },
  
  async getUserThriftItems(userId) {
    await delay(500);
    return mockThriftItems.filter(item => item.sellerId === userId);
  },
  
  async addThriftItem(item) {
    await delay(800);
    const newItem = {
      ...item,
      id: `thrift-${Date.now()}`,
      listedAt: new Date().toISOString(),
      views: 0,
      likes: 0,
      status: 'pending'
    };
    
    // In a real app, this would be added to the database
    // For mock purposes, we'll just return the new item
    return newItem;
  },
  
  async updateThriftItem(id, updates) {
    await delay(500);
    // In a real app, this would update the database
    // For mock purposes, we'll just return the updated item
    return {
      ...mockThriftItems.find(item => item.id === id),
      ...updates,
      updatedAt: new Date().toISOString()
    };
  },
  
  async deleteThriftItem(id) {
    await delay(500);
    // In a real app, this would delete from the database
    // For mock purposes, we'll just return success
    return { success: true };
  },
  
  // MonoFit Combos
  async getMonofitCombos(filters) {
    await delay(500);
    let filteredCombos = mockMonofitCombos;
    
    if (filters?.gender && filters.gender !== 'all') {
      filteredCombos = filteredCombos.filter(combo => combo.gender === filters.gender);
    }
    
    if (filters?.category && filters.category !== 'all') {
      filteredCombos = filteredCombos.filter(combo => combo.category === filters.category);
    }
    
    if (filters?.occasion && filters.occasion !== 'all') {
      filteredCombos = filteredCombos.filter(combo => combo.occasion === filters.occasion);
    }
    
    if (filters?.season && filters.season !== 'all') {
      filteredCombos = filteredCombos.filter(combo => combo.season === filters.season);
    }
    
    if (filters?.priceRange) {
      filteredCombos = filteredCombos.filter(combo => 
        combo.totalPrice >= filters.priceRange[0] && combo.totalPrice <= filters.priceRange[1]
      );
    }
    
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      filteredCombos = filteredCombos.filter(combo => 
        combo.name.toLowerCase().includes(searchLower) || 
        combo.description.toLowerCase().includes(searchLower)
      );
    }
    
    // Sort combos
    if (filters?.sortBy) {
      switch (filters.sortBy) {
        case 'newest':
          filteredCombos.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          break;
        case 'price-low':
          filteredCombos.sort((a, b) => a.totalPrice - b.totalPrice);
          break;
        case 'price-high':
          filteredCombos.sort((a, b) => b.totalPrice - a.totalPrice);
          break;
        case 'popular':
          filteredCombos.sort((a, b) => b.likes - a.likes);
          break;
      }
    }
    
    return filteredCombos;
  },
  
  async getMonofitCombo(id) {
    await delay(300);
    return mockMonofitCombos.find(combo => combo.id === id) || null;
  },
  
  // Custom Designs
  async getCustomDesigns(userId) {
    await delay(500);
    return mockCustomDesigns.filter(design => design.userId === userId);
  },
  
  async addCustomDesign(design) {
    await delay(800);
    const newDesign = {
      ...design,
      id: `design-${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'draft'
    };
    
    // In a real app, this would be added to the database
    // For mock purposes, we'll just return the new design
    return newDesign;
  },
  
  async updateCustomDesign(id, updates) {
    await delay(500);
    // In a real app, this would update the database
    // For mock purposes, we'll just return the updated design
    return {
      ...mockCustomDesigns.find(design => design.id === id),
      ...updates,
      updatedAt: new Date().toISOString()
    };
  },
  
  async deleteCustomDesign(id) {
    await delay(500);
    // In a real app, this would delete from the database
    // For mock purposes, we'll just return success
    return { success: true };
  },
  
  // AI Recommendations
  async getAIRecommendations(prompt) {
    await delay(1500); // Simulate AI processing time
    
    // In a real app, this would call an AI service
    // For mock purposes, we'll just return random products
    const randomProducts = [...mockProducts]
      .sort(() => 0.5 - Math.random())
      .slice(0, 4);
    
    return {
      products: randomProducts,
      prompt,
      explanation: `Here are some items that match your style preferences for "${prompt}". These selections are based on current trends and your previous interactions.`
    };
  },
  
  // Chat
  async getChatConversations(userId) {
    await delay(500);
    return mockChatConversations.filter(conv => 
      conv.participants.includes(userId)
    );
  },
  
  async getChatMessages(conversationId) {
    await delay(300);
    // In a real app, this would fetch from the database
    // For mock purposes, we'll just return random messages
    return [
      {
        id: 'msg1',
        conversationId,
        senderId: 'ai',
        content: 'Hello! How can I help you with your fashion needs today?',
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        isRead: true
      },
      {
        id: 'msg2',
        conversationId,
        senderId: 'user1',
        content: 'I need help finding an outfit for a summer wedding.',
        timestamp: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
        isRead: true
      },
      {
        id: 'msg3',
        conversationId,
        senderId: 'ai',
        content: 'Great! I can definitely help with that. Is it an indoor or outdoor wedding? And what time of day will it be held?',
        timestamp: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
        isRead: true
      }
    ];
  },
  
  async sendChatMessage(message) {
    await delay(500);
    const newMessage = {
      ...message,
      id: `msg-${Date.now()}`,
      timestamp: new Date().toISOString(),
      isRead: false
    };
    
    // In a real app, this would be added to the database
    // For mock purposes, we'll just return the new message
    return newMessage;
  },
  
  // Orders
  async getOrders(userId) {
    await delay(500);
    return mockOrders.filter(order => order.userId === userId);
  },
  
  async getOrder(id) {
    await delay(300);
    return mockOrders.find(order => order.id === id) || null;
  },
  
  async createOrder(orderData) {
    await delay(1000);
    const newOrder = {
      ...orderData,
      id: `order-${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'processing',
      trackingNumber: Math.random().toString(36).substring(2, 10).toUpperCase()
    };
    
    // In a real app, this would be added to the database
    // For mock purposes, we'll just return the new order
    return newOrder;
  },
  
  async updateOrderStatus(id, status) {
    await delay(500);
    // In a real app, this would update the database
    // For mock purposes, we'll just return the updated order
    return {
      ...mockOrders.find(order => order.id === id),
      status,
      updatedAt: new Date().toISOString()
    };
  },
  
  // Community
  async getCommunityPosts(filters) {
    await delay(500);
    let filteredPosts = mockCommunityPosts;
    
    if (filters?.type) {
      filteredPosts = filteredPosts.filter(post => post.type === filters.type);
    }
    
    if (filters?.tags && filters.tags.length > 0) {
      filteredPosts = filteredPosts.filter(post => 
        filters.tags.some(tag => post.tags.includes(tag))
      );
    }
    
    if (filters?.userId) {
      filteredPosts = filteredPosts.filter(post => post.userId === filters.userId);
    }
    
    // Sort posts
    if (filters?.sortBy) {
      switch (filters.sortBy) {
        case 'newest':
          filteredPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          break;
        case 'popular':
          filteredPosts.sort((a, b) => (b.likes + b.comments.length) - (a.likes + a.comments.length));
          break;
      }
    } else {
      // Default sort by newest
      filteredPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    
    return filteredPosts;
  },
  
  async getCommunityPost(id) {
    await delay(300);
    return mockCommunityPosts.find(post => post.id === id) || null;
  },
  
  async createCommunityPost(postData) {
    await delay(800);
    const newPost = {
      ...postData,
      id: `post-${Date.now()}`,
      createdAt: new Date().toISOString(),
      likes: 0,
      comments: []
    };
    
    // In a real app, this would be added to the database
    // For mock purposes, we'll just return the new post
    return newPost;
  },
  
  async updateCommunityPost(id, updates) {
    await delay(500);
    // In a real app, this would update the database
    // For mock purposes, we'll just return the updated post
    return {
      ...mockCommunityPosts.find(post => post.id === id),
      ...updates,
      updatedAt: new Date().toISOString()
    };
  },
  
  async deleteCommunityPost(id) {
    await delay(500);
    // In a real app, this would delete from the database
    // For mock purposes, we'll just return success
    return { success: true };
  },
  
  async getComments(postId) {
    await delay(300);
    const post = mockCommunityPosts.find(p => p.id === postId);
    return post ? post.comments : [];
  },
  
  async addComment(postId, comment) {
    await delay(500);
    const newComment = {
      ...comment,
      id: `comment-${Date.now()}`,
      createdAt: new Date().toISOString(),
      likes: 0
    };
    
    // In a real app, this would be added to the database
    // For mock purposes, we'll just return the new comment
    return newComment;
  },
  
  async deleteComment(postId, commentId) {
    await delay(500);
    // In a real app, this would delete from the database
    // For mock purposes, we'll just return success
    return { success: true };
  },
  
  // File uploads (mock)
  async uploadFile(file) {
    await delay(1500); // Simulate upload time
    
    // In a real app, this would upload to a storage service
    // For mock purposes, we'll just return a fake URL
    return {
      url: `https://example.com/uploads/${file.name}`,
      filename: file.name,
      size: file.size,
      type: file.type
    };
  },
  
  // User
  async getUserProfile(userId) {
    await delay(300);
    return mockSellers.find(user => user.id === userId) || null;
  },
  
  async updateUserProfile(userId, updates) {
    await delay(500);
    // In a real app, this would update the database
    // For mock purposes, we'll just return the updated profile
    return {
      ...mockSellers.find(user => user.id === userId),
      ...updates,
      updatedAt: new Date().toISOString()
    };
  }
};