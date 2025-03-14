import { users, type User, type InsertUser, products, type Product, type InsertProduct, paymentMethods, type PaymentMethod, type InsertPaymentMethod, orders, type Order, type InsertOrder, orderItems, type OrderItem, type InsertOrderItem, cartItems, type CartItem, type InsertCartItem, notifications, type Notification, type InsertNotification } from "@shared/schema";
import createMemoryStore from "memorystore";
import session from "express-session";

// Storage interface with all CRUD operations
export interface IStorage {
  // Session store
  sessionStore: session.SessionStore;
  
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<User>): Promise<User>;
  
  // Product operations
  getProductById(id: number): Promise<Product | undefined>;
  getProductByBarcode(barcode: string): Promise<Product | undefined>;
  getAllProducts(): Promise<Product[]>;
  addProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, data: Partial<Product>): Promise<Product>;
  removeProduct(id: number): Promise<void>;
  
  // Payment method operations
  getPaymentMethodById(id: number): Promise<PaymentMethod | undefined>;
  getPaymentMethods(userId: number): Promise<PaymentMethod[]>;
  addPaymentMethod(paymentMethod: InsertPaymentMethod): Promise<PaymentMethod>;
  updatePaymentMethod(id: number, data: Partial<PaymentMethod>): Promise<PaymentMethod>;
  removePaymentMethod(id: number): Promise<void>;
  unsetDefaultPaymentMethods(userId: number): Promise<void>;
  
  // Order operations
  getOrderById(id: number): Promise<Order | undefined>;
  getOrders(userId: number): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrder(id: number, data: Partial<Order>): Promise<Order>;
  
  // Order item operations
  getOrderItems(orderId: number): Promise<OrderItem[]>;
  addOrderItem(orderItem: InsertOrderItem): Promise<OrderItem>;
  
  // Cart operations
  getCartItemById(id: number): Promise<CartItem | undefined>;
  getCartItemByProductId(userId: number, productId: number): Promise<CartItem | undefined>;
  getCartItems(userId: number): Promise<CartItem[]>;
  addCartItem(cartItem: InsertCartItem): Promise<CartItem>;
  updateCartItem(id: number, data: Partial<CartItem>): Promise<CartItem>;
  removeCartItem(id: number): Promise<void>;
  clearCart(userId: number): Promise<void>;
  
  // Notification operations
  getNotificationById(id: number): Promise<Notification | undefined>;
  getNotifications(userId: number): Promise<Notification[]>;
  addNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: number): Promise<Notification>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private products: Map<number, Product>;
  private paymentMethods: Map<number, PaymentMethod>;
  private orders: Map<number, Order>;
  private orderItems: Map<number, OrderItem>;
  private cartItems: Map<number, CartItem>;
  private notifications: Map<number, Notification>;
  private currentId: { [key: string]: number };
  sessionStore: session.SessionStore;

  constructor() {
    this.users = new Map();
    this.products = new Map();
    this.paymentMethods = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    this.cartItems = new Map();
    this.notifications = new Map();
    this.currentId = {
      users: 1,
      products: 1,
      paymentMethods: 1,
      orders: 1,
      orderItems: 1,
      cartItems: 1,
      notifications: 1
    };
    
    // Initialize session store
    const MemoryStore = createMemoryStore(session);
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });
    
    // Add some sample products
    this.seedProducts();
  }

  private seedProducts() {
    const sampleProducts: InsertProduct[] = [
      {
        name: "Água Mineral 500ml",
        description: "Água mineral sem gás 500ml",
        barcode: "7891234567890",
        price: 2.5,
        imageUrl: "/assets/water.jpg"
      },
      {
        name: "Chocolate ao Leite",
        description: "Chocolate ao leite 90g",
        barcode: "7891234567891",
        price: 5.9,
        imageUrl: "/assets/chocolate.jpg"
      },
      {
        name: "Batata Chips Original",
        description: "Batata chips sabor original 100g",
        barcode: "7891234567892",
        price: 7.5,
        imageUrl: "/assets/chips.jpg"
      },
      {
        name: "Refrigerante Cola 350ml",
        description: "Refrigerante sabor cola 350ml",
        barcode: "7891234567893",
        price: 4.5,
        imageUrl: "/assets/cola.jpg"
      },
      {
        name: "Pão de Forma Integral",
        description: "Pão de forma integral 500g",
        barcode: "7891234567894",
        price: 6.9,
        imageUrl: "/assets/bread.jpg"
      }
    ];

    sampleProducts.forEach(product => {
      this.addProduct(product);
    });
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

  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.getUserByEmail(username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId.users++;
    const user: User = { ...insertUser, id, createdAt: new Date() };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, data: Partial<User>): Promise<User> {
    const user = await this.getUser(id);
    if (!user) {
      throw new Error(`User with ID ${id} not found`);
    }
    
    const updatedUser = { ...user, ...data };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Product operations
  async getProductById(id: number): Promise<Product | undefined> {
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

  async addProduct(product: InsertProduct): Promise<Product> {
    const id = this.currentId.products++;
    const newProduct: Product = { ...product, id };
    this.products.set(id, newProduct);
    return newProduct;
  }

  async updateProduct(id: number, data: Partial<Product>): Promise<Product> {
    const product = await this.getProductById(id);
    if (!product) {
      throw new Error(`Product with ID ${id} not found`);
    }
    
    const updatedProduct = { ...product, ...data };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  async removeProduct(id: number): Promise<void> {
    this.products.delete(id);
  }

  // Payment method operations
  async getPaymentMethodById(id: number): Promise<PaymentMethod | undefined> {
    return this.paymentMethods.get(id);
  }

  async getPaymentMethods(userId: number): Promise<PaymentMethod[]> {
    return Array.from(this.paymentMethods.values()).filter(
      (method) => method.userId === userId
    );
  }

  async addPaymentMethod(paymentMethod: InsertPaymentMethod): Promise<PaymentMethod> {
    const id = this.currentId.paymentMethods++;
    const newMethod: PaymentMethod = { ...paymentMethod, id };
    this.paymentMethods.set(id, newMethod);
    return newMethod;
  }

  async updatePaymentMethod(id: number, data: Partial<PaymentMethod>): Promise<PaymentMethod> {
    const method = await this.getPaymentMethodById(id);
    if (!method) {
      throw new Error(`Payment method with ID ${id} not found`);
    }
    
    const updatedMethod = { ...method, ...data };
    this.paymentMethods.set(id, updatedMethod);
    return updatedMethod;
  }

  async removePaymentMethod(id: number): Promise<void> {
    this.paymentMethods.delete(id);
  }

  async unsetDefaultPaymentMethods(userId: number): Promise<void> {
    const methods = await this.getPaymentMethods(userId);
    for (const method of methods) {
      if (method.isDefault) {
        await this.updatePaymentMethod(method.id, { isDefault: false });
      }
    }
  }

  // Order operations
  async getOrderById(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async getOrders(userId: number): Promise<Order[]> {
    return Array.from(this.orders.values())
      .filter((order) => order.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const id = this.currentId.orders++;
    const newOrder: Order = { ...order, id, createdAt: new Date() };
    this.orders.set(id, newOrder);
    return newOrder;
  }

  async updateOrder(id: number, data: Partial<Order>): Promise<Order> {
    const order = await this.getOrderById(id);
    if (!order) {
      throw new Error(`Order with ID ${id} not found`);
    }
    
    const updatedOrder = { ...order, ...data };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }

  // Order item operations
  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return Array.from(this.orderItems.values()).filter(
      (item) => item.orderId === orderId
    );
  }

  async addOrderItem(orderItem: InsertOrderItem): Promise<OrderItem> {
    const id = this.currentId.orderItems++;
    const newItem: OrderItem = { ...orderItem, id };
    this.orderItems.set(id, newItem);
    return newItem;
  }

  // Cart operations
  async getCartItemById(id: number): Promise<CartItem | undefined> {
    return this.cartItems.get(id);
  }

  async getCartItemByProductId(userId: number, productId: number): Promise<CartItem | undefined> {
    return Array.from(this.cartItems.values()).find(
      (item) => item.userId === userId && item.productId === productId
    );
  }

  async getCartItems(userId: number): Promise<CartItem[]> {
    return Array.from(this.cartItems.values()).filter(
      (item) => item.userId === userId
    );
  }

  async addCartItem(cartItem: InsertCartItem): Promise<CartItem> {
    const id = this.currentId.cartItems++;
    const newItem: CartItem = { ...cartItem, id, createdAt: new Date() };
    this.cartItems.set(id, newItem);
    return newItem;
  }

  async updateCartItem(id: number, data: Partial<CartItem>): Promise<CartItem> {
    const item = await this.getCartItemById(id);
    if (!item) {
      throw new Error(`Cart item with ID ${id} not found`);
    }
    
    const updatedItem = { ...item, ...data };
    this.cartItems.set(id, updatedItem);
    return updatedItem;
  }

  async removeCartItem(id: number): Promise<void> {
    this.cartItems.delete(id);
  }

  async clearCart(userId: number): Promise<void> {
    const items = await this.getCartItems(userId);
    for (const item of items) {
      this.cartItems.delete(item.id);
    }
  }

  // Notification operations
  async getNotificationById(id: number): Promise<Notification | undefined> {
    return this.notifications.get(id);
  }

  async getNotifications(userId: number): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter((notification) => notification.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async addNotification(notification: InsertNotification): Promise<Notification> {
    const id = this.currentId.notifications++;
    const newNotification: Notification = { 
      ...notification, 
      id, 
      isRead: false,
      createdAt: new Date() 
    };
    this.notifications.set(id, newNotification);
    return newNotification;
  }

  async markNotificationAsRead(id: number): Promise<Notification> {
    const notification = await this.getNotificationById(id);
    if (!notification) {
      throw new Error(`Notification with ID ${id} not found`);
    }
    
    const updatedNotification = { ...notification, isRead: true };
    this.notifications.set(id, updatedNotification);
    return updatedNotification;
  }
}

export const storage = new MemStorage();
