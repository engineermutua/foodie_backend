import express from 'express'
import authMiddleware from '../middleware/auth.js';
import { listorders, placeOrder, placeOrderPaypal, updateStatus, userOrder, verifyOrder, verifyPaypal } from '../controllers/orderController.js';




const orderRouter=express.Router();


orderRouter.post("/place",authMiddleware,placeOrder);
orderRouter.post("/verify",verifyOrder)
orderRouter.post("/userOrders",authMiddleware,userOrder)
orderRouter.get("/list",listorders)
orderRouter.post("/status",updateStatus)


//paypal
orderRouter.post('/paypal', authMiddleware, placeOrderPaypal)
orderRouter.post('/verify-paypal', authMiddleware, verifyPaypal)

export default orderRouter;