import userModel from "../models/userModel.js";
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import validator from 'validator'


//LOGIN
const loginUser=async(req,res)=>{
    const {email,password}=req.body;
    try {
        const user=await userModel.findOne({email})
        if(!user){
            res.json({success:false,message:"User does not exist. Check email"})
        }
        const isMatch=await bcrypt.compare(password,user.password);
        if(!isMatch){
            return res({success:false,message:"Inavlid Password"})
        }
        const token=createToken(user._id);
        res.json({success:true,token})
    } catch (error) {
        console.log(error)
        res.json({success:false,message:"Error"})
    }

}


//Token

const createToken=(id)=>{
    return jwt.sign({id},process.env.JWT_SECRET)
}

//Register
const registerUser=async(req,res)=>{
    //checking if user already exists
    const {name,password,email}=req.body;
    try {

        const exists=await userModel.findOne({email});
        if (exists){
            return res.json({success:false,message:"User already exists"})
        }

        //Validating if email and password is correct
        if(!validator.isEmail(email)){
            return res.json({success:false,message:"Please Enter a valid email"})
        }
        if(password.length<8){
            return res.json({
                success:false,
                message:"Please Enter a strong password"
            })

        }

        //Hash user password

        const salt=await bcrypt.genSalt(10)
        const hashedPassword=await bcrypt.hash(password,salt)

        const new_user=new userModel({
            name:name,
            email:email,
            password:hashedPassword
        })

        const user = await new_user.save()
        const token=createToken(user._id)
        res.json({success:true,token})

            
    } catch (error) {
        console.log(error)
        res.json({success:false,message:error})  
    }    
}

//route for admin login

const adminLogin =async(req,res)=>{
    try{
        const {email,password}=req.body
        if(email===process.env.ADMIN_EMAIL && password===process.env.ADMIN_PASSWORD){
            const token=jwt.sign(email+password,process.env.JWT_SECRET);
            res.json({success:true,token})    
        }else{
            res.json({success:false,message:"INVALID CREDENTIALS"})
        }

    }catch(error){
        console.log(error)
        res.json({success:false,message:error.message})
    }

}

export {loginUser,registerUser,adminLogin}