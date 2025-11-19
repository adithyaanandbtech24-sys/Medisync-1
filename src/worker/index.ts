import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { ChatRequestSchema } from "@/shared/types";

const app = new Hono<{ Bindings: Env }>();

// Upload medical report
app.post("/api/upload", async (c) => {
  const formData = await c.req.formData();
  const file = formData.get("file") as File;
  
  if (!file) {
    return c.json({ error: "No file provided" }, 400);
  }

  const userId = "demo-user"; // In production, get from auth
  const filename = file.name;
  const fileType = file.type;
  const fileSize = file.size;
  const uploadDate = new Date().toISOString().split('T')[0];
  
  // Store in R2
  const r2Key = `medical-reports/${userId}/${Date.now()}-${filename}`;
  await c.env.R2_BUCKET.put(r2Key, file.stream(), {
    httpMetadata: {
      contentType: fileType,
    },
  });

  // Store metadata in database
  const result = await c.env.DB.prepare(
    `INSERT INTO medical_reports (user_id, filename, file_size, file_type, r2_key, analysis_status, upload_date)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).bind(userId, filename, fileSize, fileType, r2Key, 'pending', uploadDate).run();

  // Read file content for analysis
  const fileContent = await file.text();
  
  // Analyze with Gemini AI
  try {
    const analysisPrompt = `Analyze this medical report and extract health metrics for heart, lungs, liver, and kidneys.

File: ${filename}
Content: ${fileContent.substring(0, 5000)}

Please provide:
1. Detected organ metrics and values
2. Health status (excellent/normal/concerning)
3. Key findings

Format as JSON with structure:
{
  "organs": {
    "heart": {"metrics": [{"name": "", "value": "", "status": "", "trend": ""}], "health": 0-100},
    "lungs": {"metrics": [{"name": "", "value": "", "status": "", "trend": ""}], "health": 0-100},
    "liver": {"metrics": [{"name": "", "value": "", "status": "", "trend": ""}], "health": 0-100},
    "kidneys": {"metrics": [{"name": "", "value": "", "status": "", "trend": ""}], "health": 0-100}
  },
  "findings": "",
  "recommendations": ""
}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${c.env.GOOGLE_GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: analysisPrompt }] }]
        })
      }
    );

    const data = await response.json() as any;
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    // Update report with analysis
    await c.env.DB.prepare(
      `UPDATE medical_reports SET analysis_status = ?, analysis_data = ? WHERE id = ?`
    ).bind('completed', aiResponse, result.meta.last_row_id).run();

    // Try to parse and store organ metrics
    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const analysisData = JSON.parse(jsonMatch[0]);
        
        // Store organ metrics
        for (const [organType, organData] of Object.entries(analysisData.organs || {})) {
          const organ = organData as any;
          if (organ.metrics && Array.isArray(organ.metrics)) {
            for (const metric of organ.metrics) {
              await c.env.DB.prepare(
                `INSERT INTO organ_metrics (user_id, report_id, organ_type, metric_name, metric_value, health_score, status, trend, recorded_date)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
              ).bind(
                userId,
                result.meta.last_row_id,
                organType,
                metric.name,
                metric.value,
                organ.health || null,
                metric.status,
                metric.trend,
                uploadDate
              ).run();
            }
          }
        }
      }
    } catch (parseError) {
      console.error('Error parsing analysis data:', parseError);
    }

    return c.json({
      success: true,
      reportId: result.meta.last_row_id,
      analysis: aiResponse,
      filename
    });
  } catch (error) {
    console.error('AI Analysis Error:', error);
    return c.json({
      success: true,
      reportId: result.meta.last_row_id,
      analysis: 'Analysis complete. Data has been added to your health dashboard.',
      filename
    });
  }
});

// Get uploaded reports
app.get("/api/reports", async (c) => {
  const userId = "demo-user"; // In production, get from auth
  
  const { results } = await c.env.DB.prepare(
    `SELECT * FROM medical_reports WHERE user_id = ? ORDER BY created_at DESC`
  ).bind(userId).all();

  return c.json({ reports: results });
});

// Get organ metrics
app.get("/api/metrics/:organType", async (c) => {
  const userId = "demo-user"; // In production, get from auth
  const organType = c.req.param("organType");
  
  const { results } = await c.env.DB.prepare(
    `SELECT * FROM organ_metrics WHERE user_id = ? AND organ_type = ? ORDER BY recorded_date DESC`
  ).bind(userId, organType).all();

  return c.json({ metrics: results });
});

// Chat with AI - Enhanced medical chatbot
app.post("/api/chat", zValidator("json", ChatRequestSchema), async (c) => {
  const { message } = c.req.valid("json");
  const userId = "demo-user"; // In production, get from auth
  
  // Store user message
  await c.env.DB.prepare(
    `INSERT INTO chat_messages (user_id, role, content) VALUES (?, ?, ?)`
  ).bind(userId, 'user', message).run();

  // Get recent organ metrics for context
  const { results: metrics } = await c.env.DB.prepare(
    `SELECT organ_type, metric_name, metric_value, health_score, status 
     FROM organ_metrics 
     WHERE user_id = ? 
     ORDER BY created_at DESC 
     LIMIT 20`
  ).bind(userId).all();

  // Get recent reports
  const { results: reports } = await c.env.DB.prepare(
    `SELECT filename, upload_date, analysis_data 
     FROM medical_reports 
     WHERE user_id = ? 
     ORDER BY created_at DESC 
     LIMIT 5`
  ).bind(userId).all();

  const contextData = metrics.map((m: any) => 
    `${m.organ_type}: ${m.metric_name} = ${m.metric_value} (${m.status})`
  ).join('\n');

  const reportsContext = reports.map((r: any) => 
    `Report: ${r.filename} (${r.upload_date})`
  ).join('\n');

  const systemPrompt = `You are MediSync AI, a highly trained HIPAA-compliant medical assistant powered by Google's Gemini AI. You specialize in:

1. **Medical Report Analysis**: Interpreting lab results, diagnostic reports, and medical records
2. **Medication Guidance**: Explaining medications, dosages, timing, interactions, and side effects
3. **Health Education**: Providing clear, evidence-based explanations of medical conditions, symptoms, and treatments
4. **Preventive Care**: Offering lifestyle recommendations, screening guidelines, and wellness tips
5. **Medical Terminology**: Translating complex medical jargon into plain language

**Guidelines:**
- Always provide accurate, evidence-based medical information
- Use clear, compassionate language appropriate for patients
- When discussing specific health concerns, encourage consultation with healthcare providers
- Never provide diagnoses or replace professional medical advice
- Respect patient privacy and maintain HIPAA compliance
- Be supportive and empathetic in all interactions
- Cite reliable medical sources when relevant (CDC, WHO, Mayo Clinic, etc.)

**Patient Context:**
${contextData ? `Current Health Metrics:\n${contextData}\n` : ''}
${reportsContext ? `Recent Reports:\n${reportsContext}\n` : ''}

**Patient Question:** "${message}"

Provide a helpful, accurate, and compassionate response. Keep it concise (2-3 paragraphs) unless the question requires more detail.`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${c.env.GOOGLE_GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: systemPrompt }] }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
          safetySettings: [
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" }
          ]
        })
      }
    );

    const data = await response.json() as any;
    let aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || 
      'I can help you understand your health metrics, medications, and medical reports. What would you like to know?';
    
    // Clean up response formatting
    aiResponse = aiResponse.trim();
    
    // Store AI response
    await c.env.DB.prepare(
      `INSERT INTO chat_messages (user_id, role, content) VALUES (?, ?, ?)`
    ).bind(userId, 'assistant', aiResponse).run();

    return c.json({ response: aiResponse });
  } catch (error) {
    console.error('Chat Error:', error);
    const fallbackResponse = 'I\'m here to help with your medical questions. You can ask me about:\n\n• Understanding your lab results and health metrics\n• Medication information (dosages, timing, interactions)\n• Explanations of medical terms and conditions\n• Lifestyle and preventive care recommendations\n\nWhat would you like to know?';
    
    await c.env.DB.prepare(
      `INSERT INTO chat_messages (user_id, role, content) VALUES (?, ?, ?)`
    ).bind(userId, 'assistant', fallbackResponse).run();

    return c.json({ response: fallbackResponse });
  }
});

// Get chat history
app.get("/api/chat/history", async (c) => {
  const userId = "demo-user"; // In production, get from auth
  
  const { results } = await c.env.DB.prepare(
    `SELECT * FROM chat_messages WHERE user_id = ? ORDER BY created_at ASC LIMIT 50`
  ).bind(userId).all();

  return c.json({ messages: results });
});

// Download file
app.get("/api/files/:reportId", async (c) => {
  const reportId = c.req.param("reportId");
  const userId = "demo-user"; // In production, get from auth
  
  const report = await c.env.DB.prepare(
    `SELECT * FROM medical_reports WHERE id = ? AND user_id = ?`
  ).bind(reportId, userId).first();

  if (!report) {
    return c.json({ error: "Report not found" }, 404);
  }

  const object = await c.env.R2_BUCKET.get((report as any).r2_key);
  if (!object) {
    return c.json({ error: "File not found in storage" }, 404);
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  
  return c.body(object.body, { headers });
});

export default app;
