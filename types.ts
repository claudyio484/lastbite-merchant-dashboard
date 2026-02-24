import React from 'react';

export enum ProductStatus {
  ACTIVE = 'Active',
  SOLD_OUT = 'Sold Out',
  EXPIRED = 'Expired',
}

export enum OrderStatus {
  NEW = 'New',
  PREPARING = 'Preparing',
  READY = 'Ready',
  OUT_FOR_DELIVERY = 'Out for Delivery',
  DELIVERED = 'Delivered',
  RETURNED = 'Returned',
  CANCELLED = 'Cancelled',
}

export interface Product {
  id: string;
  name: string;
  category: string;
  originalPrice: number;
  discountedPrice: number;
  expiryDate: string; // ISO string
  quantity: number;
  status: ProductStatus;
  imageUrl: string;
  featuredImageUrl?: string;
  description?: string;
  isFeatured?: boolean;
  gallery?: string[];
}

export interface Order {
  id: string;
  customerName: string;
  items: { productName: string; quantity: number; price?: number }[];
  total: number;
  type: 'Pickup' | 'Delivery';
  status: OrderStatus;
  timestamp: string; // Keep for display text e.g. "2 mins ago", or derived
  createdAt: string; // ISO Date string for sorting/storage
  
  // Extended Details
  email?: string;
  phone?: string;
  address?: string;
  locationNotes?: string;
  paymentMethod?: string;
  paymentStatus?: 'Paid' | 'Unpaid';
  specialInstructions?: string;
  subtotal?: number;
  tax?: number;
  hasUnreadMessage?: boolean;
}

export interface StatMetric {
  label: string;
  value: string;
  trend?: string;
  trendUp?: boolean;
  icon: React.ReactNode;
  alert?: boolean;
}

export interface Message {
  id: string;
  sender: 'me' | 'them';
  text: string;
  timestamp: string;
  read?: boolean;
}

export interface Conversation {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
  online?: boolean;
  messages: Message[];
}