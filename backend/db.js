import { MongoClient } from "mongodb";
let db;
async function connectToDB(cb){
    const url="mongodb://localhost:27017"

    try{
        const client=new MongoClient(url);
        await client.connect();
        db=client.db("practice");
        console.log("Connected to mongodb successfully");
        cb();
    }
    catch(error){
        console.error("ERROR connecting to mongodb server")
    }
}
export {connectToDB,db}