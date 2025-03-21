import express, { Request, Response } from "express";
import { speechToText } from "./functions/speechToText";
import mongoose from "mongoose";
import cors from "cors";
import "dotenv/config";
import { getProducts } from "./functions/getProducts";
import { playAudio } from "./functions/TextToSpeech";
import { dialogflow } from "./functions/dialogflow";

const port = process.env.PORT ? Number(process.env.PORT) : 4000;

// MongoDB connection
const mongoURI: string = process.env.MONGO_URI || "mongodb+srv://asirijayawardena920:asiri890@blindspot.ji7vd.mongodb.net/?retryWrites=true&w=majority&appName=BlindSpot"; // Ensure you have this in your .env file

mongoose.connect(mongoURI, { 
})
.then(() => {
  console.log("Vision Spot Database connected successfully 🚀.");
})
.catch((error: Error) => {
  console.error("MongoDB connection error:", error);
});


const app = express();
app.use(express.json({ limit: "50mb" }));

// Cross-origin requests
app.use(cors());

app.post("/speech-to-text", (req: Request, res: Response) => {
  speechToText(req, res);
});

app.get("/get-products", (req: Request, res: Response) => {
  getProducts(req, res);
});

app.post("/play-text",(req: Request, res: Response) => {
  playAudio(req,res);
})

app.post("/dialogflow",(req: Request, res: Response) => {
  dialogflow(req,res);
})

app.get("/", (req, res) => {
  res.send("The Speech-to-Text API is up and running!");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
