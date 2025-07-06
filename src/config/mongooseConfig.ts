import mongoose from "mongoose";
import 'dotenv/config';

/**
 * connects to mongodb using mongoose
 * logs success or failure of connection
 * exists process if connection fails 
 * 
 * @returns Promise<void> if scuccess and connection is established
 * @throws Error if MONGO_URI is not defined in .env file 
 */
export default async function connectToDB(): Promise<void>{
    const MongoUri = process.env.MONGO_URI;
    if(!MongoUri){
        throw new Error("MONGO_URI not defined in env variable ")
    }

    try {
        await mongoose.connect(MongoUri);   
         console.log('✅ MongoDB connected');   
    } catch (error: any) {
        console.error("❌ MongoDB connection error:", error.message);
        process.exit(1);
    }
}