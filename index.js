import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post('/api/score-leads', async (req, res) => {
  try {
    const leads = req.body.leads;
    if (!Array.isArray(leads)) return res.status(400).json({ error: 'Invalid leads array.' });

    const scoredLeads = await Promise.all(
      leads.map(async (lead) => {
        const prompt = `You're an AI sales strategist. Score this lead 1–100 based on potential to convert for a B2B SaaS product.

Name: ${lead.name}
Title: ${lead.title}
Company: ${lead.company}
Industry: ${lead.industry}
Revenue: ${lead.revenue}
Intent: ${lead.intent || 'N/A'}

Respond as:
Score: [number]
Reason: [brief explanation]`;

        const completion = await openai.chat.completions.create({
          model: 'gpt-4',
          messages: [
            { role: 'system', content: 'You are a lead qualification analyst.' },
            { role: 'user', content: prompt }
          ],
        });

        const result = completion.choices[0].message.content;
        const score = parseInt(result.match(/Score:\s*(\d+)/)?.[1] || '0');
        const reason = result.match(/Reason:\s*(.*)/)?.[1] || 'No reason returned.';

        return { ...lead, score, reason };
      })
    );

    res.json({ results: scoredLeads });
  } catch (err) {
    console.error('API error:', err.message);
    res.status(500).json({ error: 'Lead scoring failed.' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🧠 NeuroPitch API running on http://localhost:${PORT}`);
});