import express, { Request, Response } from 'express';
import cors from 'cors';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(cors());
app.use(express.json());

interface Boleto {
  id: number;
  fornecedor: string;
  valor: number;
  vencimento: string;
}

const dataPath = path.join(__dirname, '../data/boletos.json');
let boletos: Boleto[] = [];

async function carregarBoletos() {
  try {
    const dados = await fs.readFile(dataPath, 'utf8');
    boletos = JSON.parse(dados) as Boleto[];
  } catch {
    boletos = [];
  }
}

async function salvarBoletos() {
  await fs.writeFile(dataPath, JSON.stringify(boletos, null, 2));
}

carregarBoletos();

app.get('/api/boletos', (_req, res) => {
  res.json(boletos);
});

app.post('/api/boletos', async (req: Request, res: Response) => {
  const { fornecedor, valor, vencimento } = req.body;
  const novo: Boleto = {
    id: boletos.length ? Math.max(...boletos.map(b => b.id)) + 1 : 1,
    fornecedor,
    valor: Number(valor),
    vencimento
  };
  boletos.push(novo);
  await salvarBoletos();
  res.status(201).json(novo);
});

app.put('/api/boletos/:id', async (req: Request<{ id: string }>, res: Response) => {
  const id = Number(req.params.id);
  const idx = boletos.findIndex(b => b.id === id);
  if (idx === -1) {
    res.status(404).end();
    return;
  }
  boletos[idx] = { ...boletos[idx], ...req.body };
  await salvarBoletos();
  res.json(boletos[idx]);
});

app.delete('/api/boletos/:id', async (req: Request<{ id: string }>, res: Response) => {
  const id = Number(req.params.id);
  boletos = boletos.filter(b => b.id !== id);
  await salvarBoletos();
  res.status(204).end();
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
