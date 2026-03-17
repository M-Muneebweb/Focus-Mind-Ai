import fs from "node:fs";
import path from "node:path";
import express from "express";
import cors from "cors";

// No top-level side effects for Vercel compatibility
export async function createApp() {
  const app = express();

  // Load .env only in local dev
  if (process.env.NODE_ENV !== "production") {
    const envPath = path.resolve(process.cwd(), ".env.local");
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, "utf-8");
      envContent.split(/\r?\n/).forEach(line => {
        line = line.trim();
        if (!line || line.startsWith("#")) return;
        const [key, ...valueParts] = line.split("=");
        if (key && valueParts.length > 0) {
          let value = valueParts.join("=").trim();
          if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
          }
          process.env[key.trim()] = value;
        }
      });
    }
  }

  app.use(cors());
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));
  console.log("Server Payload Limit Set to 50MB");

  // API routes FIRST
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Helper for env vars (handles Vercel + Local + Vite prefixes)
  const getEnv = (key: string) => {
    return (process.env[key] || process.env[`VITE_${key}`] || '').trim();
  };

  // Shared Nodemailer Transporter
  const getTransporter = async () => {
    const email = getEnv('SMTP_EMAIL');
    const pass = getEnv('SMTP_PASSWORD').replace(/\s+/g, '');

    if (!email || !pass) {
      console.error(`[SMTP] Configuration missing! EMAIL: ${!!email}, PASS: ${!!pass}`);
      return null;
    }

    try {
      const nodemailer = (await import('nodemailer')).default;
      return nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: { user: email, pass: pass },
        tls: { rejectUnauthorized: false }
      });
    } catch (err) {
      console.error("[SMTP] Failed to import nodemailer:", err);
      return null;
    }
  };

  app.post("/api/contact", async (req, res) => {
    try {
      const { name, email, message, subject: inquirySubject } = req.body;
      const transporter = await getTransporter();
      if (!transporter) return res.status(500).json({ error: "Email service not configured" });

      await transporter.sendMail({
        from: `"FocusMind AI" <${process.env.SMTP_EMAIL}>`,
        to: "muneebrashidhome@gmail.com",
        subject: `[${inquirySubject}] New Inquiry from ${name}`,
        text: `Name: ${name}\nEmail: ${email}\nSubject: ${inquirySubject}\n\nMessage:\n${message}`,
        html: `
          <h3>New Contact Inquiry: ${inquirySubject}</h3>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Subject Type:</strong> ${inquirySubject}</p>
          <p><strong>Message:</strong></p>
          <p style="white-space: pre-wrap;">${message}</p>
        `,
      });

      res.status(200).json({ success: true });
    } catch (error) {
      console.error("Error sending contact email:", error);
      res.status(500).json({ error: "Failed to send email" });
    }
  });

  app.post("/api/payment-proof", async (req, res) => {
    try {
      console.log(`[PaymentProof] Request received from ${req.body.userEmail}`);
      const { image, userEmail } = req.body;
      const transporter = await getTransporter();
      if (!transporter) {
        console.error(`[PaymentProof] FAILED: Email service not configured (SMTP_EMAIL/PASSWORD missing)`);
        return res.status(500).json({ error: "Email service not configured" });
      }

      await transporter.sendMail({
        from: `"FocusMind AI" <${process.env.SMTP_EMAIL}>`,
        to: "muneebrashidhome@gmail.com",
        subject: `💳 Payment Proof Submission: ${userEmail}`,
        html: `
          <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #0ea5e9;">New Payment Proof Submitted</h2>
            <p><strong>User Email:</strong> ${userEmail}</p>
            <p>User has uploaded an EasyPaisa proof screenshot for the Pro plan.</p>
            <hr />
            <div style="margin-top: 20px;">
              <p><em>(Image is attached and also shown below)</em></p>
              <img src="cid:payment_proof" style="max-width: 100%; border-radius: 12px; border: 1px solid #ddd;" alt="Proof" />
            </div>
          </div>
        `,
        attachments: [
          {
            filename: 'payment-proof.png',
            path: image,
            cid: 'payment_proof'
          }
        ]
      });

      console.log(`[PaymentProof] SUCCESS: Email sent for ${userEmail}`);
      res.status(200).json({ success: true });
    } catch (error: any) {
      console.error("[PaymentProof] ERROR:", error.message);
      res.status(500).json({ error: `Failed to send proof: ${error.message}` });
    }
  });

  app.post("/api/suggest-tool", async (req, res) => {
    try {
      const { name, email, suggestion } = req.body;
      const transporter = await getTransporter();
      if (!transporter) return res.status(500).json({ error: "Email service not configured" });

      await transporter.sendMail({
        from: `"FocusMind AI" <${process.env.SMTP_EMAIL}>`,
        to: "muneebrashidhome@gmail.com",
        subject: `Tool Suggestion: ${name}`,
        html: `
          <h3>New Tool/Feature Suggestion</h3>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Suggestion:</strong></p>
          <p style="background: #f4f4f4; padding: 15px; border-radius: 8px;">${suggestion}</p>
        `,
      });

      res.status(200).json({ success: true });
    } catch (error) {
      console.error("Suggestion email error:", error);
      res.status(500).json({ error: "Failed to send suggestion" });
    }
  });

  app.post('/api/education-app', async (req: any, res: any) => {
    try {
      console.log(`[EducationApp] Application received from ${req.body.userEmail}`);
      const { institution, role, year, image, userEmail, userId } = req.body;
      const transporter = await getTransporter();
      if (!transporter) {
        console.error(`[EducationApp] FAILED: Email service not configured (SMTP_EMAIL/PASSWORD missing)`);
        return res.status(500).json({ error: "Email service not configured" });
      }

      await transporter.sendMail({
        from: `"FocusMind AI" <${process.env.SMTP_EMAIL}>`,
        to: 'muneebrashidhome@gmail.com',
        subject: `🎓 New Education Plan Application: ${userEmail}`,
        html: `
            <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #8b5cf6;">FocusMind Education Plan Application</h2>
                <p><strong>User Email:</strong> ${userEmail}</p>
                <p><strong>User ID:</strong> ${userId}</p>
                <hr />
                <p><strong>Institution:</strong> ${institution}</p>
                <p><strong>Role:</strong> ${role}</p>
                <p><strong>Year/Position:</strong> ${year}</p>
                <p><strong>Plan Requested:</strong> 30 Months Pro (Limited Offer)</p>
                <p>Please verify the attached ID card and upgrade the user in Supabase.</p>
            </div>
        `,
        attachments: [
          {
            filename: 'id-card.png',
            path: image
          }
        ]
      });

      console.log(`[EducationApp] SUCCESS: Email sent for ${userEmail}`);
      res.status(200).json({ success: true, message: 'Application submitted successfully' });
    } catch (error: any) {
      console.error(`[EducationApp] ERROR:`, error.message);
      res.status(500).json({ error: `Failed to send application: ${error.message}` });
    }
  });

  // --- AI PROXY ENDPOINT ---
  app.post("/api/generate", async (req, res) => {
    try {
      const { systemPrompt, userPrompt, jsonMode, provider, tier = 'free' } = req.body;

      // Extract logic from generateWithFallback but for server-side
      const getSecret = (baseName: string) => {
        return getEnv(baseName);
      };

      const callOpenRouter = async (apiKey: string) => {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://focusmind.ai",
            "X-Title": "FocusMind AI"
          },
          body: JSON.stringify({
            model: "google/gemini-2.0-flash-001", // Default model
            messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }],
            response_format: jsonMode ? { type: "json_object" } : undefined,
            temperature: 0.2
          })
        });
        if (!response.ok) throw new Error("OpenRouter failed");
        const data = await response.json();
        return data.choices?.[0]?.message?.content;
      };

      const callGroq = async (apiKey: string) => {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }],
            response_format: jsonMode ? { type: "json_object" } : undefined,
            temperature: 0.2
          })
        });
        if (!response.ok) throw new Error("Groq failed");
        const data = await response.json();
        return data.choices?.[0]?.message?.content;
      };

      const callGemini = async (apiKey: string) => {
        const { GoogleGenAI } = await import("@google/genai");
        const ai = new GoogleGenAI({ apiKey });
        // Use any to bypass linting issues with the @google/genai package structure
        const model = (ai as any).getGenerativeModel({ model: "gemini-2.0-flash" });
        const result = await model.generateContent({
          contents: [{ role: 'user', parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }],
          generationConfig: { temperature: 0.2, responseMimeType: jsonMode ? "application/json" : "text/plain" }
        });
        return result.response.text();
      };

      // Fallback Strategy
      const providers = [
        { name: 'OPENROUTER', keys: [getSecret('OPENROUTER_API_KEY_1'), getSecret('OPENROUTER_API_KEY_2')], fn: callOpenRouter },
        { name: 'GROQ', keys: [getSecret('GROQ_API_KEY_1'), getSecret('GROQ_API_KEY_2')], fn: callGroq },
        { name: 'GEMINI', keys: [getSecret('GEMINI_API_KEY_1'), getSecret('GEMINI_API_KEY_2')], fn: callGemini }
      ];

      for (const p of providers) {
        for (const key of p.keys.filter(Boolean)) {
          try {
            const text = await p.fn(key);
            if (text) return res.json({ text });
          } catch (e) {
            console.warn(`[AI Proxy] ${p.name} failed with key...`);
          }
        }
      }

      throw new Error("All AI providers failed");
    } catch (error: any) {
      console.error("[AI Proxy] ERROR:", error.message);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/referral", async (req, res) => {
    try {
      const { userId, referrerId } = req.body;
      if (!userId || !referrerId || userId === referrerId) {
        return res.status(400).json({ error: "Invalid referral request" });
      }

      const { createClient } = await import('@supabase/supabase-js');
      const supabaseUrl = process.env.VITE_SUPABASE_URL;
      // CRITICAL: Use Service Role Key if available to bypass RLS
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseKey) {
        throw new Error("Supabase config (URL/Key) missing for server");
      }

      const supabase = createClient(supabaseUrl, supabaseKey);

      console.log(`[Referral] Processing referral. Referrer: ${referrerId}, New: ${userId}`);
      console.log(`[Referral] Service Role Key status: ${!!process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Present' : 'MISSING!'}`);
      if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
        console.log(`[Referral] Key starts with: ${process.env.SUPABASE_SERVICE_ROLE_KEY.substring(0, 10)}...`);
      }

      // 1. Track the referral in the new 'referrals' table
      const { error: trackError } = await supabase.from('referrals').insert({
        referrer_id: referrerId,
        referred_user_id: userId
      });

      if (trackError) {
        if (trackError.code === '23505') { // Unique constraint violation
          console.warn(`[Referral] Already rewarded for this user: ${userId}`);
          return res.status(200).json({ success: true, message: "Already rewarded" });
        }
        console.warn(`[Referral] Tracking record creation error:`, trackError.message);
      }

      // 2. Reward ONLY the Referrer (Robust Upsert)
      const { data: refData, error: fetchRefError } = await supabase.from('user_usage').select('*').eq('id', referrerId).maybeSingle();
      if (fetchRefError) {
        console.error(`[Referral] Error fetching referrer ${referrerId}:`, fetchRefError.message);
      }

      const now = new Date();
      let newRefProUntil: Date;
      const activatedAt = refData?.pro_activated_at ? new Date(refData.pro_activated_at) : now;

      if (refData && refData.pro_until) {
        const currentProUntil = new Date(refData.pro_until);
        newRefProUntil = new Date(Math.max(currentProUntil.getTime(), now.getTime()) + 7 * 24 * 60 * 60 * 1000);
      } else {
        newRefProUntil = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      }

      const daysUsed = Math.max(0, Math.floor((now.getTime() - activatedAt.getTime()) / (1000 * 60 * 60 * 24)));
      // Subtract 1 second (1000ms) before Math.ceil to ensure exactly 7 days doesn't round to 8 due to noise
      const daysLeft = Math.max(0, Math.ceil((newRefProUntil.getTime() - now.getTime() - 1000) / (1000 * 60 * 60 * 24)));

      // Build reward object dynamically
      const rewardPayload: any = {
        id: referrerId,
        is_pro: true,
        tier: 'pro',
        count: refData ? (refData.count || 0) : 0,
        pro_until: newRefProUntil.toISOString(),
        pro_activated_at: activatedAt.toISOString(),
        pro_days_left: daysLeft,
        pro_days_used: daysUsed
      };

      const { error: rewardError } = await supabase.from('user_usage').upsert(rewardPayload, { onConflict: 'id' });

      if (rewardError) {
        console.error(`[Referral] FAILED to reward referrer ${referrerId}:`, rewardError.message);

        // Final fallback: try updating ONLY is_pro and tier if the full upsert failed
        console.log(`[Referral] Retrying with minimal payload...`);
        const { error: fallbackError } = await supabase.from('user_usage').upsert({
          id: referrerId,
          is_pro: true,
          tier: 'pro'
        }, { onConflict: 'id' });

        if (fallbackError) {
          return res.status(500).json({ error: "Failed to apply reward even with minimal payload", details: fallbackError.message });
        }
      }

      console.log(`[Referral] SUCCESS: Referrer ${referrerId} rewarded with 7 days Pro.`);
      res.status(200).json({
        success: true,
        message: "Referral successful",
        pro_days_left: daysLeft
      });
    } catch (error) {
      console.error("[Referral] API error:", error);
      res.status(500).json({ error: "Failed to process referral" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Note: On Vercel, static files are handled by the platform
    // But we keep this for local production preview if needed
    if (fs.existsSync(path.join(process.cwd(), "dist"))) {
      app.use(express.static("dist"));
    }
  }

  return app;
}

// Start server ONLY if run directly via tsx/node AND not on Vercel
const isLocalDev = process.env.NODE_ENV !== 'production' && !process.env.VERCEL;
if (isLocalDev) {
  createApp().then(app => {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`[Local Server] Running at http://localhost:${PORT}`);
    });
  }).catch(err => {
    console.error("[Local Server] CRITICAL ERROR:", err);
  });
}
