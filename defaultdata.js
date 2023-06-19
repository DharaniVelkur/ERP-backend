const productsdata=require('./data/products');
const products=require('./models/productSchema');

const Defaultdata=async ()=>{
    try {
        await products.deleteMany({});
        const storeData=await products.insertMany(productsdata);
        if(storeData){
            console.log("stored")
        }
    } catch (error) {
        console.log(error)
    }
}
module.exports=Defaultdata;