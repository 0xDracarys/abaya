import path from 'path';
import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import connnectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";


dotenv.config();
const port = process.env.PORT || 5001;

connnectDB();

const app = express();  

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());

app.use("/api/users", userRoutes);

app.get("/", (req, res) => {  // Route handler for GET /
  res.send("Welcome to the API!");
});

app.listen(port, () => console.log(`Server running on port: ${port}`));

