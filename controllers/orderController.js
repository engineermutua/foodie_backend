import { response } from "express";
import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import paypalClient from "../config/paypal.js";
import paypal from "@paypal/checkout-server-sdk";
import Stripe from 'stripe'


const stripe=new Stripe(process.env.STRIPE_SECRET_KEY)

const frontend_url=process.env.FRONTEND_URL

const currency='usd'
const delivery_fee=100;


//placing user order
const placeOrder=async (req,res) => {
    try {
        const new_order=new orderModel({
            userId:req.body.userId,
            items:req.body.items,
            amount:req.body.amount,
            address:req.body.address
        })
        await new_order.save();
        await userModel.findByIdAndUpdate(req.body.userId,{cartData:{}});

        const line_items=req.body.items.map((item)=>({
            price_data:{
                currency:currency,
                product_data:{
                    name:item.name,
                },
                unit_amount:Math.round((item.price / 130) * 100),
            },
            quantity:item.quantity
        }))

        line_items.push({
            price_data:{
                currency:currency,
                product_data:{
                    name:"Delivery charges",
                },
                unit_amount: Math.round((delivery_fee / 130) * 100),
            },
            quantity:1,
        })
        const session=await stripe.checkout.sessions.create({
            success_url:`${frontend_url}/verify?success=true&orderId=${new_order._id}`,
            cancel_url:`${frontend_url}/verify?success=false&orderId=${new_order._id}`,
            line_items:line_items,
            mode:'payment',
        })
        res.json({success:true,session_url:session.url,message: "Order placed successfully"})
    } catch (error) {
        console.log("Backend error:", error);
        res.json({
            success: false,
            message: error.message
        })
    }  
}

const verifyOrder=async(req,res)=>{
    const {orderId,success}=req.body;
    try {
        if(success=="true"){
            await orderModel.findByIdAndUpdate(orderId,{payment:true});
            res.json({success:true,message:"paid"})
        }else{
            await orderModel.findByIdAndDelete(orderId)
            res.json({success:false,message:"Not Paid"})
        }
    } catch (error) {
        console.log("Backend error:", error);
        res.json({
            success: false,
            message: error.message
        })  
    }
}

//===========PayPal================//
const placeOrderPaypal = async (req, res) => {
  try {
    const { userId, items, amount, address } = req.body;

    // Create order data first
    const orderData = {
      userId,
      items,
      address,
      amount,
      paymentMethod: "PayPal",
      payment: false,
      date: Date.now(),
    };
    const newOrder = new orderModel(orderData);
    await newOrder.save();

    console.log('====Order Queued===')

    //Create PayPal order
    console.log("FRONTEND_URL:", process.env.FRONTEND_URL);
    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "USD",
            value: (amount / 100).toFixed(2),
          },
          description: `Order #${newOrder._id}`,
        },
      ],
      application_context: {
        return_url: `${process.env.FRONTEND_URL}/verify-paypal?orderId=${newOrder._id}`,
        cancel_url: `${process.env.FRONTEND_URL}/cart`,
        brand_name: "Your Store Name",
        user_action: "PAY_NOW",
      },
    });

    const order = await paypalClient().execute(request);

    //Find approval URL
    const approvalUrl = order.result.links.find(
      (link) => link.rel === "approve"
    ).href;

    res.json({
      success: true,
      approvalUrl,
      orderId: newOrder._id,
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//Verify PayPal payment
const verifyPaypal = async (req, res) => {
  try {
    const { orderId, paypalOrderId } = req.body;

    //Capture the payment
    const request = new paypal.orders.OrdersCaptureRequest(paypalOrderId);
    const capture = await paypalClient().execute(request);

    if (capture.result.status === "COMPLETED") {
      //Update order as paid
      await orderModel.findByIdAndUpdate(orderId, { payment: true });
      //Clear user cart
      await userModel.findByIdAndUpdate(req.body.userId, { cartData: {} });
      console.log('====Order Added to Orders===')

      res.json({ success: true, message: "Payment successful" });
    } else {
      res.json({ success: false, message: "Payment not completed" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};




//specific user Orders
const userOrder=async(req,res)=>{
    try {
        const orders=await orderModel.find({userId:req.body.userId})
        res.json({success:true,data:orders})
    } catch (error) {
        console.log("Backend error:", error);
        res.json({
            success: false,
            message: error.message
        }) 
        
    }

}

//all user orders for admin panel
const listorders=async(req,res)=>{
    try {
        const orders=await orderModel.find({});
        res.json({success:true,data:orders,message:"Orders Fetched Successfully"})
    } catch (error) {
        console.log("Backend error:", error);
        res.json({
            success: false,
            message: error.message
        }) 
        
    }

}

//update status
const updateStatus=async (req,res) => {
    try {
        await orderModel.findByIdAndUpdate(req.body.orderId,{status:req.body.status})
        res.json({success:true,message:"Status Updated"})
    } catch (error) {
        console.log("Backend error:", error);
        res.json({
            success: false,
            message: error.message
        }) 
        
    }
}

export {placeOrder,verifyOrder,userOrder,listorders,updateStatus,placeOrderPaypal,verifyPaypal,}