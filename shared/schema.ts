import { pgTable, text, serial, integer, boolean, doublePrecision, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone").notNull(),
  password: text("password").notNull(),
  building: text("building"),
  notificationsCount: integer("notifications_count").default(0),
  cashbackBalance: doublePrecision("cashback_balance").default(0),
  createdAt: timestamp("created_at").defaultNow()
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  notificationsCount: true,
  cashbackBalance: true,
  createdAt: true
});

// Products table
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  barcode: text("barcode").notNull().unique(),
  price: doublePrecision("price").notNull(),
  description: text("description"),
  imageUrl: text("image_url")
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true
});

// Cart items table
export const cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  productId: integer("product_id").notNull(),
  quantity: integer("quantity").notNull().default(1)
});

export const insertCartItemSchema = createInsertSchema(cartItems).omit({
  id: true
});

// Purchases table
export const purchases = pgTable("purchases", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  total: doublePrecision("total").notNull(),
  cashbackEarned: doublePrecision("cashback_earned").notNull(),
  date: timestamp("date").defaultNow(),
  paymentMethod: text("payment_method").notNull()
});

export const insertPurchaseSchema = createInsertSchema(purchases).omit({
  id: true,
  date: true
});

// Purchase items table
export const purchaseItems = pgTable("purchase_items", {
  id: serial("id").primaryKey(),
  purchaseId: integer("purchase_id").notNull(),
  productId: integer("product_id").notNull(),
  quantity: integer("quantity").notNull(),
  price: doublePrecision("price").notNull()
});

export const insertPurchaseItemSchema = createInsertSchema(purchaseItems).omit({
  id: true
});

// Payment methods table
export const paymentMethods = pgTable("payment_methods", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(), // 'creditCard' or 'pix'
  cardNumber: text("card_number"),
  cardholderName: text("cardholder_name"),
  expiryDate: text("expiry_date"),
  brand: text("brand"),
  isPreferred: boolean("is_preferred").default(false)
});

export const insertPaymentMethodSchema = createInsertSchema(paymentMethods).omit({
  id: true
});

// Notifications table
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull(), // 'promo', 'purchase', 'cashback', etc.
  read: boolean("read").default(false),
  createdAt: timestamp("created_at").defaultNow()
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  read: true,
  createdAt: true
});

// Types for TypeScript
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

export type CartItem = typeof cartItems.$inferSelect;
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;

export type Purchase = typeof purchases.$inferSelect;
export type InsertPurchase = z.infer<typeof insertPurchaseSchema>;

export type PurchaseItem = typeof purchaseItems.$inferSelect;
export type InsertPurchaseItem = z.infer<typeof insertPurchaseItemSchema>;

export type PaymentMethod = typeof paymentMethods.$inferSelect;
export type InsertPaymentMethod = z.infer<typeof insertPaymentMethodSchema>;

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
