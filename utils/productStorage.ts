import { Product } from '../types';
import { MOCK_PRODUCTS } from '../data';

const STORAGE_KEY = 'lastbite_products_v1';

export const getProducts = (): Product[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    // Initialize with mock data if storage is empty
    localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_PRODUCTS));
    return MOCK_PRODUCTS;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    return MOCK_PRODUCTS;
  }
};

export const getProductById = (id: string): Product | undefined => {
  const products = getProducts();
  return products.find(p => p.id === id);
};

export const saveProduct = (product: Product): void => {
  const products = getProducts();
  const index = products.findIndex(p => p.id === product.id);
  
  if (index >= 0) {
    // Update existing
    products[index] = product;
  } else {
    // Add new
    products.unshift(product);
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  window.dispatchEvent(new Event('localDataUpdate'));
};

export const deleteProduct = (id: string): void => {
  const products = getProducts();
  const filtered = products.filter(p => p.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  window.dispatchEvent(new Event('localDataUpdate'));
};

export const deleteProducts = (ids: string[]): void => {
  const products = getProducts();
  const filtered = products.filter(p => !ids.includes(p.id));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  window.dispatchEvent(new Event('localDataUpdate'));
};

export const bulkUpdateProducts = (updates: Product[]): void => {
  let products = getProducts();
  const updateMap = new Map(updates.map(p => [p.id, p]));
  products = products.map(p => updateMap.has(p.id) ? updateMap.get(p.id)! : p);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  window.dispatchEvent(new Event('localDataUpdate'));
};