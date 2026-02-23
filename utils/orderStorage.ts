import { Order } from '../types';
import { MOCK_ORDERS } from '../data';

const STORAGE_KEY = 'lastbite_orders_v1';

export const getOrders = (): Order[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    // Initialize with mock data if storage is empty
    localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_ORDERS));
    return MOCK_ORDERS;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    return MOCK_ORDERS;
  }
};

export const getOrderById = (id: string): Order | undefined => {
  const orders = getOrders();
  return orders.find(o => o.id === id);
};

export const saveOrder = (order: Order): void => {
  const orders = getOrders();
  const index = orders.findIndex(o => o.id === order.id);
  
  if (index >= 0) {
    // Update existing
    orders[index] = order;
  } else {
    // Add new
    orders.unshift(order);
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  window.dispatchEvent(new Event('localDataUpdate'));
};

export const deleteOrder = (id: string): void => {
  const orders = getOrders();
  const filtered = orders.filter(o => o.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  window.dispatchEvent(new Event('localDataUpdate'));
};