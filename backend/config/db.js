import mongoose from "mongoose";

const connnectDB = async () => {
    try {

        await mongoose.connect('mongodb+srv://sam:sam321123@cluster0.6psiz.mongodb.net/');
        console.log(`Successfully connected DB ;)`);

    } catch(error){
        console.error(`Error on DB: ${error.message}`);
        process.exit(1);
    }
};

export default connnectDB;