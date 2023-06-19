const mongoose= require('mongoose');
const bcrypt=require('bcryptjs');
const validator=require('validator');
const jwt=require('jsonwebtoken');
const JWT_SECRET=process.env.JWT_SECRET


const userSchema = mongoose.Schema({
	name:{
        type:String,
        required:true,
        trim:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error ("Not valid email address")
            }
        }
    },
    password:{
        type:String,
        required:true,
        minlength:6
    },
    cpassword:{
        type:String,
        required:true,
        minlength:6
    },
    tokens:[
        {
            token:{
                type:String,
                required:true
            }
        }
    ],
    verifytoken:{
        type:String
      },
    carts : Array,
    orders: Array
});
//password hashing
userSchema.pre('save',async function(next){
    if(this.isModified("password")){
        this.password= await bcrypt.hash(this.password,12);
        this.cpassword= await bcrypt.hash(this.cpassword,12);
    }
    next();
});

userSchema.methods.generateAuthtoken=async function (){
    try {
        let token1=jwt.sign({_id:this._id},JWT_SECRET,{expiresIn:"1d"});
        this.tokens=this.tokens.concat({token:token1})
        await this.save();
        return token1;
    } catch (error) {
        res.status(422).json(error);
    }
}

userSchema.methods.addcartdata=async function (product) {
    // console.log(product);
    try {
        this.carts=this.carts.concat(product);
        // console.log(this.carts)
        await this.save();
        return this.carts;

    } catch (error) {
        console.log(error)
    }
}

userSchema.methods.addorderdata=async function (order){
    try {
        this.orders=this.orders.concat(order);
        this.carts=[]
        await this.save();
        return this.orders;
    } catch (error) {
        console.log(error)
    }
}

const users=new mongoose.model('users',userSchema);
module.exports=users;
