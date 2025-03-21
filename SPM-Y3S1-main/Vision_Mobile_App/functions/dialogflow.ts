import { json, Request, Response } from "express";
import dialogflowAPI from "@google-cloud/dialogflow";
import { v4 as uuidv4 } from "uuid";

//Credentails

// Dialogflow project ID from the environment
const projectId = "sociallogin-409512";

//config
const CONFIGURATION = {
  credentials: {
    private_key: process.env.PRIVATE_KEY,
    client_email: "test-851@sociallogin-409512.iam.gserviceaccount.com",
  },
};

// Initialize Dialogflow session client
const sessionClient = new dialogflowAPI.SessionsClient(CONFIGURATION);

// Function to send a query to Dialogflow
export const dialogflow = async (req: Request, res: Response) => {
  let { text } = req.body;

  // Generate a unique session ID for each request
  const sessionId = uuidv4();

  try {
    // Define the session path
    const sessionPath = sessionClient.projectAgentSessionPath(
      projectId,
      sessionId
    );

    // Create the Dialogflow request
    const request = {
      session: sessionPath,
      queryInput: {
        text: {
          text: text.toLowerCase(), // The user's query
          languageCode: "en-US", // Modify the language code if needed
        },
      },
    };

    // Send the request to Dialogflow and get the response
    const responses = await sessionClient.detectIntent(request);
    const result = responses[0].queryResult;

    // Return the response from Dialogflow
    return res.status(200).json({
      response: result.fulfillmentText,
    });
  } catch (error) {
    console.error("Dialogflow error:", error);
    return res.status(500).json({ error: "Failed to process the inquiry." });
  }
};
