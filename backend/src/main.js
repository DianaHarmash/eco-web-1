import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs'; // Added missing fs import
import { fileURLToPath } from 'url';
import contentRouter from './content.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// В начале main.js после определения __dirname
const reportsDir = path.join(__dirname, '../public/reports');
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

const app = express();

app.use(cors());
app.use(express.json());

// Раздача статических файлов (для отчетов)
app.use('/api/web-eco/reports', express.static(path.join(__dirname, '../public/reports')));

// API маршруты
app.use('/api/web-eco', contentRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});