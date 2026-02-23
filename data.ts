import { Product, ProductStatus, Order, OrderStatus } from './types';

export const MOCK_PRODUCTS: Product[] = [
  { 
    id: '1', 
    name: 'Organic Berry Mix', 
    category: 'Produce', 
    originalPrice: 38.00, 
    discountedPrice: 24.50, 
    expiryDate: new Date(Date.now() + 172800000).toISOString(), // 2 days
    quantity: 15, 
    status: ProductStatus.ACTIVE, 
    imageUrl: 'https://picsum.photos/200',
    featuredImageUrl: 'https://picsum.photos/1920/400', 
    description: 'Fresh strawberries, blueberries, and raspberries sourced directly from local organic farms. Perfect for smoothies or healthy snacking.', 
    isFeatured: true,
    gallery: [
        'https://picsum.photos/seed/berry1/800/800',
        'https://picsum.photos/seed/berry2/800/800',
        'https://picsum.photos/seed/berry3/800/800'
    ]
  },
  { 
    id: '2', 
    name: 'Organic Whole Milk', 
    category: 'Dairy', 
    originalPrice: 18.50, 
    discountedPrice: 12.00, 
    expiryDate: new Date(Date.now() + 86400000).toISOString(), // 1 day
    quantity: 5, 
    status: ProductStatus.ACTIVE, 
    imageUrl: 'https://picsum.photos/201',
    description: 'Rich and creamy organic whole milk from grass-fed cows.'
  },
  { 
    id: '3', 
    name: 'Sourdough Bread', 
    category: 'Bakery', 
    originalPrice: 22.00, 
    discountedPrice: 15.00, 
    expiryDate: new Date(Date.now() + 172800000).toISOString(), // 2 days
    quantity: 12, 
    status: ProductStatus.ACTIVE, 
    imageUrl: 'https://picsum.photos/202',
    description: 'Artisanal sourdough bread baked fresh daily.'
  },
  { 
    id: '4', 
    name: 'Free Range Eggs (12pk)', 
    category: 'Dairy', 
    originalPrice: 26.00, 
    discountedPrice: 18.00, 
    expiryDate: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    quantity: 0, 
    status: ProductStatus.EXPIRED, 
    imageUrl: 'https://picsum.photos/203',
    description: 'Farm-fresh free range eggs.'
  },
  { 
    id: '5', 
    name: 'Spinach Bundle', 
    category: 'Produce', 
    originalPrice: 14.00, 
    discountedPrice: 8.50, 
    expiryDate: new Date(Date.now() + 43200000).toISOString(), // 12 hours
    quantity: 8, 
    status: ProductStatus.ACTIVE, 
    imageUrl: 'https://picsum.photos/204',
    description: 'Fresh organic spinach leaves.'
  },
  { 
    id: '6', 
    name: 'Ground Beef (500g)', 
    category: 'Meat', 
    originalPrice: 35.00, 
    discountedPrice: 22.00, 
    expiryDate: new Date(Date.now() + 90000000).toISOString(), 
    quantity: 3, 
    status: ProductStatus.ACTIVE, 
    imageUrl: 'https://picsum.photos/205',
    description: 'Premium lean ground beef.'
  },
  { 
    id: '7', 
    name: 'Avocados (Bag)', 
    category: 'Produce', 
    originalPrice: 28.00, 
    discountedPrice: 18.00, 
    expiryDate: new Date(Date.now() + 200000000).toISOString(), 
    quantity: 20, 
    status: ProductStatus.ACTIVE, 
    imageUrl: 'https://picsum.photos/206',
    description: 'Ripe Hass avocados, perfect for guacamole.'
  },
  { 
    id: '8', 
    name: 'Almond Milk', 
    category: 'Dairy', 
    originalPrice: 19.00, 
    discountedPrice: 12.50, 
    expiryDate: new Date(Date.now() + 50000000).toISOString(), 
    quantity: 10, 
    status: ProductStatus.ACTIVE, 
    imageUrl: 'https://picsum.photos/207',
    description: 'Unsweetened vanilla almond milk.'
  },
  { 
    id: '9', 
    name: 'Whole Wheat Bread', 
    category: 'Bakery', 
    originalPrice: 16.00, 
    discountedPrice: 8.00, 
    expiryDate: new Date(Date.now() + 100000000).toISOString(), 
    quantity: 0, 
    status: ProductStatus.SOLD_OUT, 
    imageUrl: 'https://picsum.photos/208',
    description: 'Healthy whole wheat sandwich bread.'
  },
  { 
    id: '10', 
    name: 'Chicken Breast (1kg)', 
    category: 'Meat', 
    originalPrice: 42.00, 
    discountedPrice: 32.00, 
    expiryDate: new Date(Date.now() + 60000000).toISOString(), 
    quantity: 6, 
    status: ProductStatus.ACTIVE, 
    imageUrl: 'https://picsum.photos/209',
    description: 'Boneless skinless chicken breasts.'
  },
  { 
    id: '11', 
    name: 'Greek Yogurt', 
    category: 'Dairy', 
    originalPrice: 6.50, 
    discountedPrice: 4.00, 
    expiryDate: new Date(Date.now() + 30000000).toISOString(), 
    quantity: 24, 
    status: ProductStatus.ACTIVE, 
    imageUrl: 'https://picsum.photos/210',
    description: 'Plain non-fat Greek yogurt.'
  }
];

export const MOCK_ORDERS: Order[] = [
  {
    id: '#4039',
    customerName: 'Sophia Lee',
    email: 'sophia.l@example.com',
    phone: '+971 52 999 1111',
    address: 'Apt 505, JLT Cluster C',
    locationNotes: 'Code 1234',
    items: [
        { productName: 'Sushi Platter', quantity: 1, price: 95.00 },
        { productName: 'Green Tea', quantity: 2, price: 5.00 }
    ],
    subtotal: 105.00,
    tax: 5.25,
    total: 110.25,
    type: 'Delivery',
    status: OrderStatus.NEW,
    timestamp: '1 min ago',
    createdAt: new Date(Date.now() - 1000 * 60).toISOString(),
    paymentMethod: 'Apple Pay',
    paymentStatus: 'Paid'
  },
  {
    id: '#4038',
    customerName: 'Fatima Al-Sayed',
    email: 'fatima.s@example.com',
    phone: '+971 50 999 8888',
    address: 'Villa 45, Al Barsha 1',
    locationNotes: 'White gate',
    items: [
        { productName: 'Almond Milk', quantity: 3, price: 18.00 },
        { productName: 'Granola', quantity: 1, price: 25.00 }
    ],
    subtotal: 79.00,
    tax: 3.95,
    total: 82.95,
    type: 'Delivery',
    status: OrderStatus.NEW,
    timestamp: '2 mins ago',
    createdAt: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
    paymentMethod: 'Visa •••• 5555',
    paymentStatus: 'Paid'
  },
  {
    id: '#4037',
    customerName: 'Arjun Patel',
    email: 'arjun.p@example.com',
    phone: '+971 50 777 6666',
    address: 'In-Store Pickup',
    locationNotes: 'Main Entrance',
    items: [
        { productName: 'Mangoes (1kg)', quantity: 2, price: 25.00 },
        { productName: 'Yogurt', quantity: 2, price: 10.00 }
    ],
    subtotal: 70.00,
    tax: 3.50,
    total: 73.50,
    type: 'Pickup',
    status: OrderStatus.NEW,
    timestamp: '5 mins ago',
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    paymentMethod: 'Apple Pay',
    paymentStatus: 'Paid'
  },
  {
    id: '#4036',
    customerName: 'John Smith',
    email: 'john.smith@example.com',
    phone: '+971 52 111 2222',
    address: 'In-Store Pickup',
    locationNotes: 'Drive-through',
    items: [
        { productName: 'Rotisserie Chicken', quantity: 1, price: 35.00 },
        { productName: 'Caesar Salad', quantity: 2, price: 20.00 }
    ],
    subtotal: 75.00,
    tax: 3.75,
    total: 78.75,
    type: 'Pickup',
    status: OrderStatus.PREPARING,
    timestamp: '15 mins ago',
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    paymentMethod: 'Apple Pay',
    paymentStatus: 'Paid'
  },
  {
    id: '#4035',
    customerName: 'Chen Wei',
    email: 'chen.w@example.com',
    phone: '+971 56 666 7777',
    address: 'Apt 1001, Downtown Views',
    locationNotes: 'Leave at reception',
    items: [
        { productName: 'Bok Choy', quantity: 4, price: 6.00 },
        { productName: 'Tofu', quantity: 2, price: 8.00 },
        { productName: 'Soy Sauce', quantity: 1, price: 15.00 }
    ],
    subtotal: 55.00,
    tax: 2.75,
    total: 57.75,
    type: 'Delivery',
    status: OrderStatus.PREPARING,
    timestamp: '20 mins ago',
    createdAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
    paymentMethod: 'Mastercard •••• 1212',
    paymentStatus: 'Paid'
  },
  {
    id: '#4029',
    customerName: 'Sarah Ahmed',
    email: 'sarah.ahmed@example.com',
    phone: '+971 50 123 4567',
    address: 'In-Store Pickup',
    locationNotes: 'Counter 2, Main Entrance',
    items: [
        { productName: 'Organic Milk', quantity: 2, price: 12.00 }, 
        { productName: 'Sourdough Bread', quantity: 1, price: 15.00 }
    ],
    subtotal: 39.00,
    tax: 1.95,
    total: 40.95,
    type: 'Pickup',
    status: OrderStatus.NEW,
    timestamp: '10 mins ago',
    createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    paymentMethod: 'Apple Pay',
    paymentStatus: 'Paid',
    specialInstructions: 'Please double bag the milk.',
    hasUnreadMessage: true 
  }
];