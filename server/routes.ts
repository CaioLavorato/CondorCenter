import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { z } from "zod";
import { ZodError } from "zod";
import { 
  insertCartItemSchema, 
  insertOrderSchema, 
  insertOrderItemSchema, 
  insertPaymentMethodSchema,
  insertProductSchema,
  insertNotificationSchema
} from "@shared/schema";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // API routes
  
  // Products API
  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getAllProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.getProductById(parseInt(req.params.id));
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  app.get("/api/products/barcode/:barcode", async (req, res) => {
    try {
      const product = await storage.getProductByBarcode(req.params.barcode);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  // Cart API
  app.get("/api/cart", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    try {
      const cartItems = await storage.getCartItems(req.user!.id);
      res.json(cartItems);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch cart" });
    }
  });

  app.post("/api/cart", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    try {
      const validatedData = insertCartItemSchema.parse({
        ...req.body,
        userId: req.user!.id,
      });
      
      // Check if the product exists
      const product = await storage.getProductById(validatedData.productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      // Check if the item already exists in the cart
      const existingItem = await storage.getCartItemByProductId(req.user!.id, validatedData.productId);
      if (existingItem) {
        // Update quantity
        const updatedItem = await storage.updateCartItem(existingItem.id, {
          quantity: existingItem.quantity + validatedData.quantity
        });
        return res.status(200).json(updatedItem);
      }
      
      // Add new item
      const cartItem = await storage.addCartItem(validatedData);
      res.status(201).json(cartItem);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      res.status(500).json({ message: "Failed to add item to cart" });
    }
  });

  app.put("/api/cart/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const cartItemId = parseInt(req.params.id);
    try {
      // Validate quantity
      const { quantity } = z.object({ quantity: z.number().min(1) }).parse(req.body);
      
      // Check if cart item exists and belongs to user
      const existingItem = await storage.getCartItemById(cartItemId);
      if (!existingItem || existingItem.userId !== req.user!.id) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      
      const updatedItem = await storage.updateCartItem(cartItemId, { quantity });
      res.json(updatedItem);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      res.status(500).json({ message: "Failed to update cart item" });
    }
  });

  app.delete("/api/cart/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const cartItemId = parseInt(req.params.id);
    try {
      // Check if cart item exists and belongs to user
      const existingItem = await storage.getCartItemById(cartItemId);
      if (!existingItem || existingItem.userId !== req.user!.id) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      
      await storage.removeCartItem(cartItemId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to remove cart item" });
    }
  });

  app.delete("/api/cart", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      await storage.clearCart(req.user!.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to clear cart" });
    }
  });

  // Payment Methods API
  app.get("/api/payment-methods", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const paymentMethods = await storage.getPaymentMethods(req.user!.id);
      res.json(paymentMethods);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch payment methods" });
    }
  });

  app.post("/api/payment-methods", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const validatedData = insertPaymentMethodSchema.parse({
        ...req.body,
        userId: req.user!.id
      });
      
      // If this is the first payment method or isDefault is true, set as default
      const existingMethods = await storage.getPaymentMethods(req.user!.id);
      if (existingMethods.length === 0 || validatedData.isDefault) {
        validatedData.isDefault = true;
        // If setting this one as default, unset others
        if (existingMethods.length > 0 && validatedData.isDefault) {
          await storage.unsetDefaultPaymentMethods(req.user!.id);
        }
      }
      
      const paymentMethod = await storage.addPaymentMethod(validatedData);
      res.status(201).json(paymentMethod);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      res.status(500).json({ message: "Failed to add payment method" });
    }
  });

  app.put("/api/payment-methods/:id/default", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const paymentMethodId = parseInt(req.params.id);
    try {
      // Check if payment method exists and belongs to user
      const existingMethod = await storage.getPaymentMethodById(paymentMethodId);
      if (!existingMethod || existingMethod.userId !== req.user!.id) {
        return res.status(404).json({ message: "Payment method not found" });
      }
      
      // Unset all other default payment methods
      await storage.unsetDefaultPaymentMethods(req.user!.id);
      
      // Set this one as default
      const updatedMethod = await storage.updatePaymentMethod(paymentMethodId, { isDefault: true });
      res.json(updatedMethod);
    } catch (error) {
      res.status(500).json({ message: "Failed to set default payment method" });
    }
  });

  app.delete("/api/payment-methods/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const paymentMethodId = parseInt(req.params.id);
    try {
      // Check if payment method exists and belongs to user
      const existingMethod = await storage.getPaymentMethodById(paymentMethodId);
      if (!existingMethod || existingMethod.userId !== req.user!.id) {
        return res.status(404).json({ message: "Payment method not found" });
      }
      
      await storage.removePaymentMethod(paymentMethodId);
      
      // If the removed method was default and there are other methods, set one as default
      if (existingMethod.isDefault) {
        const remainingMethods = await storage.getPaymentMethods(req.user!.id);
        if (remainingMethods.length > 0) {
          await storage.updatePaymentMethod(remainingMethods[0].id, { isDefault: true });
        }
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to remove payment method" });
    }
  });

  // Orders API
  app.get("/api/orders", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const orders = await storage.getOrders(req.user!.id);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.get("/api/orders/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const orderId = parseInt(req.params.id);
    try {
      const order = await storage.getOrderById(orderId);
      if (!order || order.userId !== req.user!.id) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Get order items
      const orderItems = await storage.getOrderItems(orderId);
      
      res.json({ ...order, items: orderItems });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  app.post("/api/orders", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      // Get cart items
      const cartItems = await storage.getCartItems(req.user!.id);
      if (cartItems.length === 0) {
        return res.status(400).json({ message: "Cart is empty" });
      }
      
      // Calculate total
      let total = 0;
      for (const item of cartItems) {
        const product = await storage.getProductById(item.productId);
        if (!product) {
          return res.status(400).json({ message: `Product with ID ${item.productId} not found` });
        }
        total += product.price * item.quantity;
      }
      
      // Calculate cashback (5%)
      const cashback = parseFloat((total * 0.05).toFixed(2));
      
      // Validate payment method
      const { paymentMethodId } = req.body;
      if (paymentMethodId) {
        const paymentMethod = await storage.getPaymentMethodById(paymentMethodId);
        if (!paymentMethod || paymentMethod.userId !== req.user!.id) {
          return res.status(400).json({ message: "Invalid payment method" });
        }
      } else {
        // Get default payment method
        const paymentMethods = await storage.getPaymentMethods(req.user!.id);
        const defaultMethod = paymentMethods.find(method => method.isDefault);
        if (!defaultMethod) {
          return res.status(400).json({ message: "No payment method selected" });
        }
        req.body.paymentMethodId = defaultMethod.id;
      }
      
      // Create order
      const orderData = insertOrderSchema.parse({
        userId: req.user!.id,
        total,
        cashback,
        status: "paid", // In a real app, this would be "pending" until payment confirmation
        paymentMethodId: req.body.paymentMethodId
      });
      
      const order = await storage.createOrder(orderData);
      
      // Create order items
      for (const item of cartItems) {
        const product = await storage.getProductById(item.productId);
        if (!product) continue;
        
        const orderItemData = insertOrderItemSchema.parse({
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          price: product.price
        });
        
        await storage.addOrderItem(orderItemData);
      }
      
      // Clear cart
      await storage.clearCart(req.user!.id);
      
      // Create notification for successful order
      const notificationData = insertNotificationSchema.parse({
        userId: req.user!.id,
        title: "Compra realizada com sucesso!",
        message: `Seu pedido #${order.id} foi confirmado no valor de R$ ${total.toFixed(2)}.`
      });
      
      await storage.addNotification(notificationData);
      
      res.status(201).json({
        ...order,
        cashback
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      console.error(error);
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  // Notifications API
  app.get("/api/notifications", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const notifications = await storage.getNotifications(req.user!.id);
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.put("/api/notifications/:id/read", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const notificationId = parseInt(req.params.id);
    try {
      // Check if notification exists and belongs to user
      const notification = await storage.getNotificationById(notificationId);
      if (!notification || notification.userId !== req.user!.id) {
        return res.status(404).json({ message: "Notification not found" });
      }
      
      const updatedNotification = await storage.markNotificationAsRead(notificationId);
      res.json(updatedNotification);
    } catch (error) {
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);
  return httpServer;
}
