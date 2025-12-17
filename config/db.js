import mongoose from "mongoose";


export const connectDB=async()=>{
    await mongoose.connect('mongodb+srv://engineermutua1_db_user:MVu19thJ20UYPUVC@cluster0.rvjeosn.mongodb.net/Foodie')
    .then(()=>console.log('DB CONNECTED'))
}