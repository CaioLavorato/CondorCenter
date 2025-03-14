import { 
  users, User, InsertUser, 
  products, Product, InsertProduct,
  cartItems, CartItem, InsertCartItem,
  purchases, Purchase, InsertPurchase,
  purchaseItems, PurchaseItem, InsertPurchaseItem,
  paymentMethods, PaymentMethod, InsertPaymentMethod,
  notifications, Notification, InsertNotification
} from "@shared/schema";
import createMemoryStore from "memorystore";
import session from "express-session";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User | undefined>;
  
  // Product operations
  getProduct(id: number): Promise<Product | undefined>;
  getProductByBarcode(barcode: string): Promise<Product | undefined>;
  getAllProducts(): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  
  // Cart operations
  getCartItems(userId: number): Promise<(CartItem & { product: Product })[]>;
  getCartItem(id: number): Promise<CartItem | undefined>;
  getCartItemByUserAndProduct(userId: number, productId: number): Promise<CartItem | undefined>;
  createCartItem(cartItem: InsertCartItem): Promise<CartItem>;
  updateCartItem(id: number, quantity: number): Promise<CartItem | undefined>;
  deleteCartItem(id: number): Promise<boolean>;
  clearCart(userId: number): Promise<boolean>;
  
  // Purchase operations
  createPurchase(purchase: InsertPurchase, items: InsertPurchaseItem[]): Promise<Purchase>;
  getPurchasesByUser(userId: number): Promise<Purchase[]>;
  getPurchaseItems(purchaseId: number): Promise<(PurchaseItem & { product: Product })[]>;
  
  // Payment method operations
  getPaymentMethods(userId: number): Promise<PaymentMethod[]>;
  createPaymentMethod(paymentMethod: InsertPaymentMethod): Promise<PaymentMethod>;
  updatePaymentMethod(id: number, data: Partial<PaymentMethod>): Promise<PaymentMethod | undefined>;
  deletePaymentMethod(id: number): Promise<boolean>;
  setPreferredPaymentMethod(userId: number, paymentMethodId: number): Promise<boolean>;
  
  // Notification operations
  getNotifications(userId: number): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: number): Promise<boolean>;
  markAllNotificationsAsRead(userId: number): Promise<boolean>;
  
  // Session store
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private products: Map<number, Product>;
  private cartItems: Map<number, CartItem>;
  private purchases: Map<number, Purchase>;
  private purchaseItems: Map<number, PurchaseItem>;
  private paymentMethods: Map<number, PaymentMethod>;
  private notifications: Map<number, Notification>;
  
  sessionStore: session.SessionStore;
  currentId: { [key: string]: number };

  constructor() {
    this.users = new Map();
    this.products = new Map();
    this.cartItems = new Map();
    this.purchases = new Map();
    this.purchaseItems = new Map();
    this.paymentMethods = new Map();
    this.notifications = new Map();
    
    this.currentId = {
      users: 1,
      products: 1,
      cartItems: 1,
      purchases: 1,
      purchaseItems: 1,
      paymentMethods: 1,
      notifications: 1
    };
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // 24 hours
    });
    
    // Seed some sample products
    this.seedProducts();
  }
  
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase()
    );
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId.users++;
    const timestamp = new Date();
    const user: User = { 
      ...insertUser, 
      id, 
      notificationsCount: 0,
      cashbackBalance: 0,
      createdAt: timestamp
    };
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  // Product operations
  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }
  
  async getProductByBarcode(barcode: string): Promise<Product | undefined> {
    return Array.from(this.products.values()).find(
      (product) => product.barcode === barcode
    );
  }
  
  async getAllProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }
  
  async createProduct(product: InsertProduct): Promise<Product> {
    const id = this.currentId.products++;
    const newProduct: Product = { ...product, id };
    this.products.set(id, newProduct);
    return newProduct;
  }
  
  // Cart operations
  async getCartItems(userId: number): Promise<(CartItem & { product: Product })[]> {
    const cartItems = Array.from(this.cartItems.values()).filter(
      (item) => item.userId === userId
    );
    
    return Promise.all(
      cartItems.map(async (item) => {
        const product = await this.getProduct(item.productId);
        return { ...item, product: product! };
      })
    );
  }
  
  async getCartItem(id: number): Promise<CartItem | undefined> {
    return this.cartItems.get(id);
  }
  
  async getCartItemByUserAndProduct(userId: number, productId: number): Promise<CartItem | undefined> {
    return Array.from(this.cartItems.values()).find(
      (item) => item.userId === userId && item.productId === productId
    );
  }
  
  async createCartItem(cartItem: InsertCartItem): Promise<CartItem> {
    const existingItem = await this.getCartItemByUserAndProduct(
      cartItem.userId,
      cartItem.productId
    );
    
    if (existingItem) {
      const updatedItem = { 
        ...existingItem, 
        quantity: existingItem.quantity + cartItem.quantity 
      };
      this.cartItems.set(existingItem.id, updatedItem);
      return updatedItem;
    }
    
    const id = this.currentId.cartItems++;
    const newCartItem: CartItem = { ...cartItem, id };
    this.cartItems.set(id, newCartItem);
    return newCartItem;
  }
  
  async updateCartItem(id: number, quantity: number): Promise<CartItem | undefined> {
    const cartItem = await this.getCartItem(id);
    if (!cartItem) return undefined;
    
    if (quantity <= 0) {
      this.cartItems.delete(id);
      return undefined;
    }
    
    const updatedItem = { ...cartItem, quantity };
    this.cartItems.set(id, updatedItem);
    return updatedItem;
  }
  
  async deleteCartItem(id: number): Promise<boolean> {
    return this.cartItems.delete(id);
  }
  
  async clearCart(userId: number): Promise<boolean> {
    const cartItems = Array.from(this.cartItems.values()).filter(
      (item) => item.userId === userId
    );
    
    cartItems.forEach(item => {
      this.cartItems.delete(item.id);
    });
    
    return true;
  }
  
  // Purchase operations
  async createPurchase(purchase: InsertPurchase, items: InsertPurchaseItem[]): Promise<Purchase> {
    const id = this.currentId.purchases++;
    const timestamp = new Date();
    const newPurchase: Purchase = { ...purchase, id, date: timestamp };
    this.purchases.set(id, newPurchase);
    
    // Save purchase items
    items.forEach(item => {
      const itemId = this.currentId.purchaseItems++;
      const newItem: PurchaseItem = { ...item, id, purchaseId: id };
      this.purchaseItems.set(itemId, newItem);
    });
    
    // Add cashback to user
    const user = await this.getUser(purchase.userId);
    if (user) {
      await this.updateUser(user.id, {
        cashbackBalance: user.cashbackBalance + purchase.cashbackEarned
      });
    }
    
    // Clear user's cart
    await this.clearCart(purchase.userId);
    
    return newPurchase;
  }
  
  async getPurchasesByUser(userId: number): Promise<Purchase[]> {
    return Array.from(this.purchases.values())
      .filter(purchase => purchase.userId === userId)
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }
  
  async getPurchaseItems(purchaseId: number): Promise<(PurchaseItem & { product: Product })[]> {
    const items = Array.from(this.purchaseItems.values()).filter(
      (item) => item.purchaseId === purchaseId
    );
    
    return Promise.all(
      items.map(async (item) => {
        const product = await this.getProduct(item.productId);
        return { ...item, product: product! };
      })
    );
  }
  
  // Payment method operations
  async getPaymentMethods(userId: number): Promise<PaymentMethod[]> {
    return Array.from(this.paymentMethods.values()).filter(
      (method) => method.userId === userId
    );
  }
  
  async createPaymentMethod(paymentMethod: InsertPaymentMethod): Promise<PaymentMethod> {
    const id = this.currentId.paymentMethods++;
    const newPaymentMethod: PaymentMethod = { ...paymentMethod, id };
    
    // If this is marked as preferred, un-prefer others
    if (newPaymentMethod.isPreferred) {
      const methods = await this.getPaymentMethods(paymentMethod.userId);
      methods.forEach(method => {
        if (method.isPreferred) {
          this.paymentMethods.set(method.id, { ...method, isPreferred: false });
        }
      });
    }
    
    this.paymentMethods.set(id, newPaymentMethod);
    return newPaymentMethod;
  }
  
  async updatePaymentMethod(id: number, data: Partial<PaymentMethod>): Promise<PaymentMethod | undefined> {
    const method = this.paymentMethods.get(id);
    if (!method) return undefined;
    
    const updatedMethod = { ...method, ...data };
    this.paymentMethods.set(id, updatedMethod);
    return updatedMethod;
  }
  
  async deletePaymentMethod(id: number): Promise<boolean> {
    return this.paymentMethods.delete(id);
  }
  
  async setPreferredPaymentMethod(userId: number, paymentMethodId: number): Promise<boolean> {
    const methods = await this.getPaymentMethods(userId);
    
    for (const method of methods) {
      const isPreferred = method.id === paymentMethodId;
      await this.updatePaymentMethod(method.id, { isPreferred });
    }
    
    return true;
  }
  
  // Notification operations
  async getNotifications(userId: number): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter(notification => notification.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  async createNotification(notification: InsertNotification): Promise<Notification> {
    const id = this.currentId.notifications++;
    const timestamp = new Date();
    const newNotification: Notification = { 
      ...notification, 
      id, 
      read: false, 
      createdAt: timestamp 
    };
    
    this.notifications.set(id, newNotification);
    
    // Update user's notification count
    const user = await this.getUser(notification.userId);
    if (user) {
      await this.updateUser(user.id, {
        notificationsCount: user.notificationsCount + 1
      });
    }
    
    return newNotification;
  }
  
  async markNotificationAsRead(id: number): Promise<boolean> {
    const notification = this.notifications.get(id);
    if (!notification || notification.read) return false;
    
    notification.read = true;
    this.notifications.set(id, notification);
    
    // Decrement user's notification count
    const user = await this.getUser(notification.userId);
    if (user && user.notificationsCount > 0) {
      await this.updateUser(user.id, {
        notificationsCount: user.notificationsCount - 1
      });
    }
    
    return true;
  }
  
  async markAllNotificationsAsRead(userId: number): Promise<boolean> {
    const notifications = Array.from(this.notifications.values()).filter(
      notification => notification.userId === userId && !notification.read
    );
    
    notifications.forEach(notification => {
      notification.read = true;
      this.notifications.set(notification.id, notification);
    });
    
    // Reset user's notification count
    const user = await this.getUser(userId);
    if (user) {
      await this.updateUser(user.id, { notificationsCount: 0 });
    }
    
    return true;
  }
  
  // Seed data
  private seedProducts() {
    const products: InsertProduct[] = [
      {
        name: "Refrigerante Cola 2L",
        barcode: "7891234567890",
        price: 8.90,
        description: "Refrigerante sabor cola garrafa 2 litros",
        imageUrl: "https://images.unsplash.com/photo-1553456558-aff63285bdd1?ixlib=rb-1.2.1&auto=format&fit=crop&w=128&q=80"
      },
      {
        name: "Pão de Forma Integral",
        barcode: "7891234567891",
        price: 6.50,
        description: "Pão de forma integral fatiado 500g",
        imageUrl: "https://images.unsplash.com/photo-1570448862600-2e9d083074df?ixlib=rb-1.2.1&auto=format&fit=crop&w=128&q=80"
      },
      {
        name: "Leite Integral 1L",
        barcode: "7891234567892",
        price: 4.99,
        description: "Leite UHT integral 1 litro",
        imageUrl: "https://images.unsplash.com/photo-1550583724-b2692b85b150?ixlib=rb-1.2.1&auto=format&fit=crop&w=128&q=80"
      },
      {
        name: "Café em Pó 500g",
        barcode: "7891234567893",
        price: 15.90,
        description: "Café torrado e moído 500g",
        imageUrl: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?ixlib=rb-1.2.1&auto=format&fit=crop&w=128&q=80"
      },
      {
        name: "Arroz Branco 5kg",
        barcode: "7891234567894",
        price: 22.50,
        description: "Arroz branco tipo 1 pacote 5kg",
        imageUrl: "https://images.unsplash.com/photo-1594506425793-58c976ce34ab?ixlib=rb-1.2.1&auto=format&fit=crop&w=128&q=80"
      }
    ];
    
    products.forEach(product => {
      this.createProduct(product);
    });
  }
}

export const storage = new MemStorage();
