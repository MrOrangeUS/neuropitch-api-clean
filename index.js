const express = require('express');
const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

app.get('/', (req, res) => {
  res.send('NeuroPitch API is live!');
});

app.post('/api/score-leads', (req, res) => {
  const { leads } = req.body;
  if (!leads || !Array.isArray(leads)) {
    return res.status(400).json({ error: 'Leads must be an array.' });
  }

  const results = leads.map(lead => ({
    ...lead,
    score: Math.floor(Math.random() * 100),
    reason: "Randomly generated score for demo purposes."
  }));

  res.json({ results });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
