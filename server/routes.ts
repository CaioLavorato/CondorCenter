import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { swaggerDocument } from "./swagger";
import swaggerUi from 'swagger-ui-express';
import { sendPasswordResetEmail } from "./email";
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
import { 
  insertCartItemSchema, 
  insertPaymentMethodSchema, 
  insertPurchaseSchema, 
  insertPurchaseItemSchema
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // API Routes
  // Products
  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getAllProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar produtos" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.getProduct(Number(req.params.id));
      if (!product) {
        return res.status(404).json({ message: "Produto não encontrado" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar produto" });
    }
  });

  app.get("/api/products/barcode/:barcode", async (req, res) => {
    try {
      const product = await storage.getProductByBarcode(req.params.barcode);
      if (!product) {
        return res.status(404).json({ message: "Produto não encontrado" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar produto" });
    }
  });

  // Cart
  app.get("/api/cart", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const items = await storage.getCartItems(req.user!.id);
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar carrinho" });
    }
  });

  app.post("/api/cart", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const validationResult = insertCartItemSchema.safeParse({
        ...req.body,
        userId: req.user!.id
      });

      if (!validationResult.success) {
        return res.status(400).json({ message: "Dados inválidos", errors: validationResult.error });
      }

      const cartItem = await storage.createCartItem(validationResult.data);
      const product = await storage.getProduct(cartItem.productId);
      res.status(201).json({ ...cartItem, product });
    } catch (error) {
      res.status(500).json({ message: "Erro ao adicionar item ao carrinho" });
    }
  });

  app.put("/api/cart/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const cartItem = await storage.getCartItem(Number(req.params.id));
      if (!cartItem || cartItem.userId !== req.user!.id) {
        return res.status(404).json({ message: "Item não encontrado" });
      }

      const { quantity } = req.body;
      if (typeof quantity !== "number" || quantity < 0) {
        return res.status(400).json({ message: "Quantidade inválida" });
      }

      const updatedItem = await storage.updateCartItem(cartItem.id, quantity);
      if (!updatedItem) {
        return res.status(200).json({ message: "Item removido do carrinho" });
      }

      const product = await storage.getProduct(updatedItem.productId);
      res.json({ ...updatedItem, product });
    } catch (error) {
      res.status(500).json({ message: "Erro ao atualizar item do carrinho" });
    }
  });

  app.delete("/api/cart/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const cartItem = await storage.getCartItem(Number(req.params.id));
      if (!cartItem || cartItem.userId !== req.user!.id) {
        return res.status(404).json({ message: "Item não encontrado" });
      }

      await storage.deleteCartItem(cartItem.id);
      res.status(200).json({ message: "Item removido do carrinho" });
    } catch (error) {
      res.status(500).json({ message: "Erro ao remover item do carrinho" });
    }
  });

  app.delete("/api/cart", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      await storage.clearCart(req.user!.id);
      res.status(200).json({ message: "Carrinho esvaziado" });
    } catch (error) {
      res.status(500).json({ message: "Erro ao esvaziar carrinho" });
    }
  });

  // Purchases
  app.get("/api/purchases", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const purchases = await storage.getPurchasesByUser(req.user!.id);
      res.json(purchases);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar compras" });
    }
  });

  app.post("/api/purchases", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const cart = await storage.getCartItems(req.user!.id);
      if (cart.length === 0) {
        return res.status(400).json({ message: "Carrinho vazio" });
      }

      // Calculate totals
      const total = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
      const cashbackRate = 0.05; // 5% cashback
      const cashbackEarned = total * cashbackRate;

      // Validate purchase data
      const purchaseSchema = insertPurchaseSchema.extend({
        paymentMethod: z.string().min(1)
      });
      
      const validationResult = purchaseSchema.safeParse({
        userId: req.user!.id,
        total,
        cashbackEarned,
        paymentMethod: req.body.paymentMethod
      });

      if (!validationResult.success) {
        return res.status(400).json({ message: "Dados de compra inválidos", errors: validationResult.error });
      }

      // Create purchase items
      const purchaseItems = cart.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.product.price,
        purchaseId: 0 // Will be set in createPurchase
      }));

      const purchase = await storage.createPurchase(validationResult.data, purchaseItems);

      // Create notification for purchase
      await storage.createNotification({
        userId: req.user!.id,
        title: "Compra Confirmada",
        message: `Sua compra de R$ ${total.toFixed(2)} foi concluída com sucesso! Você ganhou R$ ${cashbackEarned.toFixed(2)} em cashback.`,
        type: "purchase"
      });

      res.status(201).json(purchase);
    } catch (error) {
      res.status(500).json({ message: "Erro ao processar compra" });
    }
  });

  // Payment Methods
  app.get("/api/payment-methods", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const methods = await storage.getPaymentMethods(req.user!.id);
      res.json(methods);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar métodos de pagamento" });
    }
  });

  app.post("/api/payment-methods", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const validationResult = insertPaymentMethodSchema.safeParse({
        ...req.body,
        userId: req.user!.id
      });

      if (!validationResult.success) {
        return res.status(400).json({ message: "Dados inválidos", errors: validationResult.error });
      }

      const paymentMethod = await storage.createPaymentMethod(validationResult.data);
      res.status(201).json(paymentMethod);
    } catch (error) {
      res.status(500).json({ message: "Erro ao adicionar método de pagamento" });
    }
  });

  app.put("/api/payment-methods/:id/preferred", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const methodId = Number(req.params.id);
      const methods = await storage.getPaymentMethods(req.user!.id);
      const method = methods.find(m => m.id === methodId);
      
      if (!method) {
        return res.status(404).json({ message: "Método de pagamento não encontrado" });
      }

      await storage.setPreferredPaymentMethod(req.user!.id, methodId);
      res.json({ message: "Método de pagamento preferencial atualizado" });
    } catch (error) {
      res.status(500).json({ message: "Erro ao atualizar método de pagamento preferencial" });
    }
  });

  app.delete("/api/payment-methods/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const methodId = Number(req.params.id);
      const methods = await storage.getPaymentMethods(req.user!.id);
      const method = methods.find(m => m.id === methodId);
      
      if (!method) {
        return res.status(404).json({ message: "Método de pagamento não encontrado" });
      }

      await storage.deletePaymentMethod(methodId);
      res.json({ message: "Método de pagamento removido" });
    } catch (error) {
      res.status(500).json({ message: "Erro ao remover método de pagamento" });
    }
  });

  // Notifications
  app.get("/api/notifications", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const notifications = await storage.getNotifications(req.user!.id);
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar notificações" });
    }
  });

  app.put("/api/notifications/:id/read", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      await storage.markNotificationAsRead(Number(req.params.id));
      res.json({ message: "Notificação marcada como lida" });
    } catch (error) {
      res.status(500).json({ message: "Erro ao marcar notificação como lida" });
    }
  });

  app.put("/api/notifications/read-all", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      await storage.markAllNotificationsAsRead(req.user!.id);
      res.json({ message: "Todas as notificações marcadas como lidas" });
    } catch (error) {
      res.status(500).json({ message: "Erro ao marcar notificações como lidas" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
