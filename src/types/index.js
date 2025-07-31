export const User = {
  id: '',
  name: '',
  email: '',
  avatar: '',
  role: 'customer', // 'customer' | 'admin' | 'seller'
  bio: '',
  rating: 0,
  totalSales: 0,
  joinedAt: '',
  badges: [],
  isVerified: false
};

export const Product = {
  id: '',
  name: '',
  description: '',
  price: 0,
  images: [],
  category: '',
  sizes: [],
  colors: [],
  stock: 0,
  rating: 0,
  reviews: 0,
  tags: [],
  isMonoFit: false,
  setId: ''
};

export const CartItem = {
  id: '',
  product: {}, // Product object
  quantity: 0,
  size: '',
  color: ''
};

export const ThriftItem = {
  id: '',
  name: '',
  description: '',
  price: 0,
  images: [],
  condition: 'good', // 'new' | 'like-new' | 'good' | 'fair'
  category: '',
  size: '',
  color: '',
  gender: 'unisex', // 'men' | 'women' | 'unisex'
  sellerId: '',
  sellerName: '',
  sellerAvatar: '',
  sellerRating: 0,
  approved: false,
  likes: 0,
  views: 0,
  createdAt: '',
  updatedAt: '',
  tags: [],
  isBoosted: false,
  status: 'pending' // 'pending' | 'approved' | 'rejected' | 'sold'
};

export const MonofitCombo = {
  id: '',
  name: '',
  description: '',
  images: [],
  category: '',
  occasion: '',
  season: '',
  gender: '',
  fabricType: '',
  tags: [],
  items: [], // Array of Product objects
  totalPrice: 0,
  discountPercentage: 0,
  likes: 0,
  views: 0,
  shares: 0,
  orders: 0,
  comments: 0,
  rating: 0,
  createdAt: '',
  creatorId: '',
  creatorName: '',
  approved: false,
  isTrending: false,
  trendingScore: 0
};

export const MonofitFilters = {
  gender: '',
  category: '',
  occasion: '',
  season: '',
  priceRange: [0, 1000], // [number, number]
  sortBy: '',
  search: ''
};

export const CommunityPost = {
  id: '',
  userId: '',
  userName: '',
  userAvatar: '',
  userBadges: [],
  content: '',
  images: [],
  likes: 0,
  comments: 0,
  shares: 0,
  createdAt: '',
  tags: [],
  linkedItemId: '',
  type: 'general' // 'style-tip' | 'review' | 'find' | 'general'
};

export const Comment = {
  id: '',
  postId: '',
  userId: '',
  userName: '',
  userAvatar: '',
  content: '',
  createdAt: '',
  likes: 0
};

export const ChatMessage = {
  id: '',
  senderId: '',
  receiverId: '',
  content: '',
  timestamp: '',
  read: false,
  type: 'text' // 'text' | 'image' | 'system'
};

export const ChatConversation = {
  id: '',
  participants: [],
  lastMessage: {}, // ChatMessage object
  unreadCount: 0,
  itemId: '',
  itemName: '',
  itemImage: ''
};

export const CustomDesign = {
  id: '',
  name: '',
  description: '',
  garmentType: 'tshirt', // 'tshirt' | 'hoodie' | 'shirt' | 'pants'
  fabricType: 'dtg', // 'dtg' | 'dtf' | 'embroidery'
  design: {
    front: '',
    back: '',
    sleeve: ''
  },
  placement: {
    front: { x: 0, y: 0, scale: 1 },
    back: { x: 0, y: 0, scale: 1 },
    sleeve: { x: 0, y: 0, scale: 1 }
  },
  mockupUrl: '',
  userId: '',
  createdAt: '',
  shared: false
};

export const Order = {
  id: '',
  userId: '',
  items: [], // Array of CartItem objects
  total: 0,
  status: 'pending', // 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  shippingAddress: {}, // Address object
  createdAt: '',
  trackingNumber: ''
};

export const Address = {
  street: '',
  city: '',
  state: '',
  zipCode: '',
  country: ''
};

export const AIRecommendation = {
  productId: '',
  score: 0,
  reason: ''
};

export const ThriftFilters = {
  gender: '',
  category: '',
  condition: '',
  priceRange: [0, 1000], // [number, number]
  size: '',
  sortBy: '',
  search: ''
};

export const UploadFormData = {
  name: '',
  description: '',
  price: 0,
  category: '',
  size: '',
  condition: '',
  gender: '',
  color: '',
  tags: [],
  images: [] // Array of File objects
};