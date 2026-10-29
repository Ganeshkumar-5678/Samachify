import app from './app.js';
import { isGroqConfigured, getVerifiedGroqModel } from './services/groqService.js';

const PORT = parseInt(process.env.PORT || '8000', 10);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`===============================================`);
  console.log(`🍲 SAMACHIFY AI Recipe Engine Server running!`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`🤖 Groq Configured: ${isGroqConfigured() ? 'YES (' + getVerifiedGroqModel() + ')' : 'NO (Transparent Curated Fallback Active)'}`);
  console.log(`===============================================`);
});
