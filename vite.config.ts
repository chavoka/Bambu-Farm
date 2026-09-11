import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, Plugin} from 'vite';
import {GoogleGenAI} from '@google/genai';

function geminiApiPlugin(): Plugin {
  return {
    name: 'gemini-api-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url === '/api/ai-doctor' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', async () => {
            try {
              const data = JSON.parse(body);
              const apiKey = process.env.GEMINI_API_KEY;
              if (!apiKey) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'GEMINI_API_KEY environment variable is not configured.' }));
                return;
              }

              const ai = new GoogleGenAI({ apiKey });
              const { prompt, printerModel, filamentType, nozzleTemp, bedTemp } = data;

              const systemInstruction = `You are a world-class 3D Printing Specialist, Slicer Engineer, and Hardware Diagnostics Expert.
Your goal is to provide concise, structured, bulleted troubleshooting advice, exact slicer retraction/temperature adjustments, and calibration guidance for 3D printing defects.`;

              const textPrompt = `Printer: ${printerModel || 'FDM Printer'}\n` +
                `Filament: ${filamentType || 'PLA'}\n` +
                `Nozzle Temp: ${nozzleTemp || '200'}°C | Bed Temp: ${bedTemp || '60'}°C\n\n` +
                `Issue / Question:\n${prompt}`;

              const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: [{ text: textPrompt }],
                config: { systemInstruction }
              });

              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ text: response.text }));
            } catch (err: any) {
              console.error('Gemini API Error:', err);
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: err.message || 'Error executing Gemini request' }));
            }
          });
          return;
        }
        next();
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), geminiApiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      host: '0.0.0.0',
      port: 3000,
      strictPort: true,
      cors: true,
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
