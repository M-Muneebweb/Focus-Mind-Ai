import { createApp } from '../server';

let cachedApp: any;

export default async (req: any, res: any) => {
  try {
    if (!cachedApp) {
      console.log("Initializing Express app for Vercel...");
      cachedApp = await createApp();
    }
    return cachedApp(req, res);
  } catch (err: any) {
    console.error("Vercel API Error:", err);
    res.status(500).json({ 
      error: "Internal Server Error", 
      message: err.message, 
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined 
    });
  }
};
