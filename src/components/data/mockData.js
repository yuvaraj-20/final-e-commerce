// Mock data for the fashion e-commerce application
// Converted from TypeScript to JavaScript while preserving all functionality

export const mockUser = {
  id: '1',
  name: 'Alex Chen',
  email: 'alex@example.com',
  avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400',
  role: 'customer',
  bio: 'Fashion enthusiast and sustainable style advocate',
  rating: 4.8,
  totalSales: 25,
  joinedAt: '2023-01-15',
  badges: ['Verified Seller', 'Top Stylist'],
  isVerified: true
};

export const mockSellers = [
  {
    id: 'seller1',
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    avatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=400',
    role: 'seller',
    bio: 'Vintage fashion collector with 10+ years experience',
    rating: 4.9,
    totalSales: 150,
    joinedAt: '2022-03-20',
    badges: ['Verified Seller', 'Vintage Expert'],
    isVerified: true
  },
  {
    id: 'seller2',
    name: 'Mike Davis',
    email: 'mike@example.com',
    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=400',
    role: 'seller',
    bio: 'Designer clothing specialist',
    rating: 4.7,
    totalSales: 89,
    joinedAt: '2022-08-10',
    badges: ['Designer Expert'],
    isVerified: true
  },
  {
    id: 'seller3',
    name: 'Emma Wilson',
    email: 'emma@example.com',
    avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=400',
    role: 'seller',
    bio: 'Sustainable fashion advocate',
    rating: 4.8,
    totalSales: 67,
    joinedAt: '2023-01-05',
    badges: ['Eco Warrior'],
    isVerified: false
  }
];

export const mockProducts = [
  {
    id: '1',
    name: 'Premium Cotton T-Shirt',
    description: 'Ultra-soft premium cotton t-shirt with perfect fit',
    price: 29.99,
    images: [
      'https://images.pexels.com/photos/7679720/pexels-photo-7679720.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/7679721/pexels-photo-7679721.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    category: 'T-Shirts',
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Black', 'White', 'Navy', 'Gray'],
    stock: 50,
    rating: 4.8,
    reviews: 124,
    tags: ['premium', 'cotton', 'casual']
  },
  {
    id: '2',
    name: 'Designer Hoodie',
    description: 'Luxurious designer hoodie with unique patterns',
    price: 89.99,
    images: [
      'https://images.pexels.com/photos/7679715/pexels-photo-7679715.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/7679716/pexels-photo-7679716.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    category: 'Hoodies',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Black', 'White', 'Burgundy'],
    stock: 25,
    rating: 4.9,
    reviews: 89,
    tags: ['designer', 'premium', 'streetwear']
  },
  {
    id: '3',
    name: 'MonoFit Classic Set',
    description: 'Perfectly matched t-shirt and pants combo',
    price: 79.99,
    images: [
      'https://images.pexels.com/photos/7679714/pexels-photo-7679714.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    category: 'Sets',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Navy', 'Black', 'Gray'],
    stock: 30,
    rating: 4.7,
    reviews: 67,
    tags: ['monofit', 'set', 'matching'],
    isMonoFit: true,
    setId: 'set-1'
  },
  {
    id: '4',
    name: 'Vintage Denim Jacket',
    description: 'Classic vintage-style denim jacket',
    price: 119.99,
    images: [
      'https://images.pexels.com/photos/7679718/pexels-photo-7679718.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    category: 'Jackets',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Blue', 'Black', 'Light Blue'],
    stock: 20,
    rating: 4.6,
    reviews: 45,
    tags: ['vintage', 'denim', 'classic']
  },
  {
    id: '5',
    name: 'Athletic Shorts',
    description: 'High-performance athletic shorts for active lifestyle',
    price: 39.99,
    images: [
      'https://images.pexels.com/photos/7679719/pexels-photo-7679719.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    category: 'Shorts',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Black', 'Navy', 'Gray', 'Red'],
    stock: 40,
    rating: 4.5,
    reviews: 78,
    tags: ['athletic', 'performance', 'shorts']
  },
  {
    id: '6',
    name: 'Casual Chinos',
    description: 'Comfortable casual chino pants for everyday wear',
    price: 59.99,
    images: [
      'https://images.pexels.com/photos/7679730/pexels-photo-7679730.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    category: 'Pants',
    sizes: ['28', '30', '32', '34', '36'],
    colors: ['Khaki', 'Navy', 'Black', 'Olive'],
    stock: 35,
    rating: 4.6,
    reviews: 92,
    tags: ['casual', 'chinos', 'comfortable']
  }
];

export const mockMonofitCombos = [
  {
    id: 'combo1',
    name: 'Summer Casual Vibes',
    description: 'Perfect combination for relaxed summer days. Lightweight cotton tee paired with comfortable chino shorts.',
    images: [
      'https://images.pexels.com/photos/7679720/pexels-photo-7679720.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/7679730/pexels-photo-7679730.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    category: 'Casual',
    occasion: 'Weekend',
    season: 'Summer',
    gender: 'Men',
    fabricType: 'DTG',
    tags: ['summer', 'casual', 'comfortable', 'weekend'],
    items: [mockProducts[0], mockProducts[4]],
    totalPrice: 69.98,
    discountPercentage: 10,
    likes: 245,
    views: 1250,
    shares: 89,
    orders: 67,
    comments: 34,
    rating: 4.8,
    createdAt: '2024-01-20T10:30:00Z',
    creatorId: 'admin1',
    creatorName: 'Style Team',
    approved: true,
    isTrending: true,
    trendingScore: 892
  },
  {
    id: 'combo2',
    name: 'Urban Streetwear',
    description: 'Edgy streetwear combo featuring a designer hoodie and fitted chinos for that perfect urban look.',
    images: [
      'https://images.pexels.com/photos/7679715/pexels-photo-7679715.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/7679730/pexels-photo-7679730.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    category: 'Streetwear',
    occasion: 'Party',
    season: 'Fall',
    gender: 'Unisex',
    fabricType: 'DTF',
    tags: ['streetwear', 'urban', 'trendy', 'designer'],
    items: [mockProducts[1], mockProducts[5]],
    totalPrice: 149.98,
    discountPercentage: 15,
    likes: 189,
    views: 980,
    shares: 67,
    orders: 45,
    comments: 28,
    rating: 4.7,
    createdAt: '2024-01-18T14:15:00Z',
    creatorId: 'admin1',
    creatorName: 'Style Team',
    approved: true,
    isTrending: true,
    trendingScore: 654
  },
  {
    id: 'combo3',
    name: 'Classic Denim Look',
    description: 'Timeless combination of a premium cotton tee with a vintage denim jacket for that effortless cool factor.',
    images: [
      'https://images.pexels.com/photos/7679720/pexels-photo-7679720.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/7679718/pexels-photo-7679718.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    category: 'Vintage',
    occasion: 'Date Night',
    season: 'Spring',
    gender: 'Women',
    fabricType: 'DTG',
    tags: ['vintage', 'denim', 'classic', 'timeless'],
    items: [mockProducts[0], mockProducts[3]],
    totalPrice: 149.98,
    likes: 156,
    views: 789,
    shares: 45,
    orders: 32,
    comments: 19,
    rating: 4.6,
    createdAt: '2024-01-15T09:45:00Z',
    creatorId: 'admin1',
    creatorName: 'Style Team',
    approved: true,
    trendingScore: 423
  },
  {
    id: 'combo4',
    name: 'Minimalist Chic',
    description: 'Clean and sophisticated look with neutral tones perfect for work or casual meetings.',
    images: [
      'https://images.pexels.com/photos/7679720/pexels-photo-7679720.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/7679730/pexels-photo-7679730.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    category: 'Minimalist',
    occasion: 'Work',
    season: 'All Season',
    gender: 'Unisex',
    fabricType: 'DTG',
    tags: ['minimalist', 'work', 'professional', 'neutral'],
    items: [mockProducts[0], mockProducts[5]],
    totalPrice: 89.98,
    discountPercentage: 5,
    likes: 134,
    views: 567,
    shares: 23,
    orders: 28,
    comments: 15,
    rating: 4.5,
    createdAt: '2024-01-12T16:20:00Z',
    creatorId: 'admin1',
    creatorName: 'Style Team',
    approved: true,
    trendingScore: 298
  },
  {
    id: 'combo5',
    name: 'Athletic Comfort',
    description: 'Perfect for gym sessions or active weekends. Breathable fabrics and comfortable fit.',
    images: [
      'https://images.pexels.com/photos/7679720/pexels-photo-7679720.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/7679719/pexels-photo-7679719.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    category: 'Sporty',
    occasion: 'Gym',
    season: 'All Season',
    gender: 'Men',
    fabricType: 'DTF',
    tags: ['athletic', 'gym', 'comfortable', 'performance'],
    items: [mockProducts[0], mockProducts[4]],
    totalPrice: 69.98,
    discountPercentage: 20,
    likes: 98,
    views: 445,
    shares: 18,
    orders: 22,
    comments: 12,
    rating: 4.4,
    createdAt: '2024-01-10T11:30:00Z',
    creatorId: 'admin1',
    creatorName: 'Style Team',
    approved: true,
    trendingScore: 234
  },
  {
    id: 'combo6',
    name: 'Layered Elegance',
    description: 'Sophisticated layering with a designer hoodie over chinos for elevated casual wear.',
    images: [
      'https://images.pexels.com/photos/7679715/pexels-photo-7679715.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/7679730/pexels-photo-7679730.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    category: 'Formal',
    occasion: 'Travel',
    season: 'Winter',
    gender: 'Women',
    fabricType: 'Embroidery',
    tags: ['layered', 'elegant', 'sophisticated', 'travel'],
    items: [mockProducts[1], mockProducts[5]],
    totalPrice: 149.98,
    discountPercentage: 12,
    likes: 167,
    views: 723,
    shares: 34,
    orders: 19,
    comments: 21,
    rating: 4.7,
    createdAt: '2024-01-08T13:45:00Z',
    creatorId: 'admin1',
    creatorName: 'Style Team',
    approved: true,
    isTrending: true,
    trendingScore: 567
  }
];

export const mockThriftItems = [
  {
    id: 't1',
    name: 'Vintage Band T-Shirt',
    description: 'Authentic vintage band t-shirt from the 90s. Rare find in excellent condition with original graphics.',
    price: 25.00,
    images: [
      'https://images.pexels.com/photos/7679722/pexels-photo-7679722.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/7679723/pexels-photo-7679723.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    condition: 'good',
    category: 'T-Shirts',
    size: 'M',
    color: 'Black',
    gender: 'unisex',
    sellerId: 'seller1',
    sellerName: 'Sarah Johnson',
    sellerAvatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=400',
    sellerRating: 4.9,
    approved: true,
    likes: 23,
    views: 156,
    createdAt: '2024-01-15T10:30:00Z',
    tags: ['vintage', 'band', 'retro', '90s'],
    status: 'approved'
  },
  {
    id: 't2',
    name: 'Designer Silk Scarf',
    description: 'Authentic designer silk scarf in excellent condition. Perfect for adding elegance to any outfit.',
    price: 45.00,
    images: [
      'https://images.pexels.com/photos/7679724/pexels-photo-7679724.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    condition: 'like-new',
    category: 'Accessories',
    size: 'One Size',
    color: 'Multicolor',
    gender: 'women',
    sellerId: 'seller2',
    sellerName: 'Mike Davis',
    sellerAvatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=400',
    sellerRating: 4.7,
    approved: true,
    likes: 18,
    views: 89,
    createdAt: '2024-01-20T14:15:00Z',
    tags: ['designer', 'silk', 'luxury', 'accessories'],
    status: 'approved'
  },
  {
    id: 't3',
    name: 'Vintage Leather Jacket',
    description: 'Classic leather jacket with timeless style. Some wear adds to the authentic vintage character.',
    price: 85.00,
    images: [
      'https://images.pexels.com/photos/7679725/pexels-photo-7679725.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/7679726/pexels-photo-7679726.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    condition: 'good',
    category: 'Jackets',
    size: 'L',
    color: 'Brown',
    gender: 'men',
    sellerId: 'seller1',
    sellerName: 'Sarah Johnson',
    sellerAvatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=400',
    sellerRating: 4.9,
    approved: true,
    likes: 34,
    views: 203,
    createdAt: '2024-01-18T09:45:00Z',
    tags: ['vintage', 'leather', 'jacket', 'classic'],
    isBoosted: true,
    status: 'approved'
  },
  {
    id: 't4',
    name: 'Floral Summer Dress',
    description: 'Beautiful floral dress perfect for summer occasions. Barely worn, like new condition.',
    price: 35.00,
    images: [
      'https://images.pexels.com/photos/7679727/pexels-photo-7679727.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    condition: 'like-new',
    category: 'Dresses',
    size: 'S',
    color: 'Floral',
    gender: 'women',
    sellerId: 'seller3',
    sellerName: 'Emma Wilson',
    sellerAvatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=400',
    sellerRating: 4.8,
    approved: true,
    likes: 27,
    views: 134,
    createdAt: '2024-01-22T16:20:00Z',
    tags: ['floral', 'summer', 'dress', 'feminine'],
    status: 'approved'
  },
  {
    id: 't5',
    name: 'Retro Sneakers',
    description: 'Classic retro sneakers in great condition. Perfect for casual streetwear looks.',
    price: 55.00,
    images: [
      'https://images.pexels.com/photos/7679728/pexels-photo-7679728.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    condition: 'good',
    category: 'Shoes',
    size: '9',
    color: 'White',
    gender: 'unisex',
    sellerId: 'seller2',
    sellerName: 'Mike Davis',
    sellerAvatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=400',
    sellerRating: 4.7,
    approved: true,
    likes: 19,
    views: 98,
    createdAt: '2024-01-25T11:10:00Z',
    tags: ['retro', 'sneakers', 'streetwear', 'casual'],
    status: 'approved'
  },
  {
    id: 't6',
    name: 'Wool Winter Coat',
    description: 'Warm wool coat perfect for winter. High-quality material and construction.',
    price: 120.00,
    images: [
      'https://images.pexels.com/photos/7679729/pexels-photo-7679729.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    condition: 'like-new',
    category: 'Coats',
    size: 'M',
    color: 'Navy',
    gender: 'women',
    sellerId: 'seller3',
    sellerName: 'Emma Wilson',
    sellerAvatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=400',
    sellerRating: 4.8,
    approved: true,
    likes: 41,
    views: 187,
    createdAt: '2024-01-28T13:30:00Z',
    tags: ['wool', 'winter', 'coat', 'warm'],
    status: 'approved'
  }
];

export const mockCommunityPosts = [
  {
    id: 'p1',
    userId: 'seller1',
    userName: 'Sarah Johnson',
    userAvatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=400',
    userBadges: ['Verified Seller', 'Vintage Expert'],
    content: 'Just found this amazing vintage leather jacket! The patina is perfect and it has such character. What do you think about styling vintage leather with modern pieces?',
    images: ['https://images.pexels.com/photos/7679725/pexels-photo-7679725.jpeg?auto=compress&cs=tinysrgb&w=800'],
    likes: 45,
    comments: 12,
    shares: 8,
    createdAt: '2024-01-28T10:15:00Z',
    tags: ['vintage', 'leather', 'styling'],
    linkedItemId: 't3',
    type: 'find'
  },
  {
    id: 'p2',
    userId: 'seller3',
    userName: 'Emma Wilson',
    userAvatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=400',
    userBadges: ['Eco Warrior'],
    content: 'Sustainable fashion tip: Always check the fabric composition before buying! Natural fibers like cotton, wool, and linen are not only better for the environment but also last longer. 🌱',
    likes: 67,
    comments: 23,
    shares: 15,
    createdAt: '2024-01-27T14:30:00Z',
    tags: ['sustainable', 'tips', 'fabric'],
    type: 'style-tip'
  },
  {
    id: 'p3',
    userId: 'seller2',
    userName: 'Mike Davis',
    userAvatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=400',
    userBadges: ['Designer Expert'],
    content: 'Review: This silk scarf is absolutely gorgeous! The quality is exceptional and it adds such elegance to any outfit. Highly recommend for anyone looking to elevate their style.',
    images: ['https://images.pexels.com/photos/7679724/pexels-photo-7679724.jpeg?auto=compress&cs=tinysrgb&w=800'],
    likes: 32,
    comments: 8,
    shares: 5,
    createdAt: '2024-01-26T16:45:00Z',
    tags: ['review', 'silk', 'accessories'],
    linkedItemId: 't2',
    type: 'review'
  },
  {
    id: 'p4',
    userId: '1',
    userName: 'Alex Chen',
    userAvatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400',
    userBadges: ['Top Stylist'],
    content: 'Loving this new MonoFit combo! The Summer Casual Vibes set is perfect for weekend outings. The fabric quality is amazing and the fit is spot on. Definitely recommend checking out the MonoFit collection!',
    images: ['https://images.pexels.com/photos/7679720/pexels-photo-7679720.jpeg?auto=compress&cs=tinysrgb&w=800'],
    likes: 89,
    comments: 34,
    shares: 21,
    createdAt: '2024-01-25T12:20:00Z',
    tags: ['monofit', 'combo', 'review', 'summer'],
    linkedItemId: 'combo1',
    type: 'review'
  }
];

export const mockComments = [
  {
    id: 'c1',
    postId: 'p1',
    userId: 'seller2',
    userName: 'Mike Davis',
    userAvatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=400',
    content: 'Love the patina on this jacket! I think it would look great with some dark jeans and white sneakers for a casual look.',
    createdAt: '2024-01-28T11:20:00Z',
    likes: 8
  },
  {
    id: 'c2',
    postId: 'p1',
    userId: 'seller3',
    userName: 'Emma Wilson',
    userAvatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=400',
    content: 'Vintage leather is so versatile! You could also pair it with a flowy dress for that edgy-feminine contrast.',
    createdAt: '2024-01-28T12:10:00Z',
    likes: 12
  }
];

export const mockChatConversations = [
  {
    id: 'conv1',
    participants: ['1', 'seller1'],
    lastMessage: {
      id: 'msg1',
      senderId: 'seller1',
      receiverId: '1',
      content: 'Hi! Thanks for your interest in the vintage band t-shirt. It\'s in great condition!',
      timestamp: '2024-01-28T15:30:00Z',
      read: false,
      type: 'text'
    },
    unreadCount: 1,
    itemId: 't1',
    itemName: 'Vintage Band T-Shirt',
    itemImage: 'https://images.pexels.com/photos/7679722/pexels-photo-7679722.jpeg?auto=compress&cs=tinysrgb&w=800'
  }
];

export const mockCustomDesigns = [
  {
    id: 'd1',
    name: 'Abstract Art Tee',
    description: 'Custom abstract design on premium cotton',
    garmentType: 'tshirt',
    fabricType: 'dtg',
    design: {
      front: 'https://images.pexels.com/photos/1292241/pexels-photo-1292241.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    placement: {
      front: { x: 0, y: 0, scale: 1 },
      back: { x: 0, y: 0, scale: 1 },
      sleeve: { x: 0, y: 0, scale: 1 }
    },
    mockupUrl: 'https://images.pexels.com/photos/7679720/pexels-photo-7679720.jpeg?auto=compress&cs=tinysrgb&w=800',
    userId: '1',
    createdAt: '2024-01-25T09:00:00Z',
    shared: false
  }
];

export const mockOrders = [
  {
    id: 'order-1',
    userId: '1',
    items: [
      {
        id: 'cart-1',
        product: mockProducts[0],
        quantity: 2,
        size: 'M',
        color: 'Black'
      },
      {
        id: 'cart-2',
        product: mockProducts[1],
        quantity: 1,
        size: 'L',
        color: 'White'
      }
    ],
    totalAmount: 149.97, 
    status: 'pending',
    createdAt: '2024-01-25T09:00:00Z',
    updatedAt: '2024-01-25T09:00:00Z',
    shippingAddress: {
      name: 'Alex Chen',
      address: '123 Fashion St, Style City, CA 90210',
      phone: '123-456-7890'
    },
    paymentMethod: 'credit_card',
    trackingNumber: 'TRACK123456',
    estimatedDelivery: '2024-02-01',
    paymentStatus: 'paid',
    paymentMethodId: '1234567890',
    paymentMethodName: 'Visa ****1234',
    paymentMethodLogo: 'https://images.pexels.com/photos/1292241/pexels-photo-1292241.jpeg?auto=compress&cs=tinysrgb&w=400',
    orderHistory: [
      {
        status: 'pending',
        createdAt: '2024-01-25T09:00:00Z',
        updatedAt: '2024-01-25T09:00:00Z'
      },
      {
        status: 'processing',
        createdAt: '2024-01-26T10:00:00Z',
        updatedAt: '2024-01-26T10:00:00Z'
      },
      {
        status: 'shipped',
        createdAt: '2024-01-27T11:30:00Z',
        updatedAt: '2024-01-27T11:30:00Z'
      }
    ]
  }
];