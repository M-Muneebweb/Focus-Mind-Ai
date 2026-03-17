let cachedApp: any;

export default async (req: any, res: any) => {
  try {
    if (!cachedApp) {
      console.log("[Vercel] Dynamically importing createApp...");
      // Using .js extension is standard for ESM imports in Node/Vercel
      const { createApp } = await import('../server.js');
      cachedApp = await createApp();
    }
    
    if (typeof cachedApp !== 'function') {
      throw new Error("createApp did not return a valid Express app function");
    }

    return cachedApp(req, res);
  } catch (err: any) {
    console.error("[Vercel] Critical Startup Crash:", err);
    res.status(500).json({ 
      error: "SERVERLESS_FUNCTION_CRASH", 
      message: err.message,
      stack: err.stack,
      hint: "Check if all dependencies are in 'dependencies' and not 'devDependencies'"
    });
  }
};
