import express, { Request, Response } from 'express';
import cors from 'cors';
import { promises as fs } from 'fs';
import path from 'path';

const app = express();
app.use(cors());
app.use(express.json());

interface Boleto {
  id: number;
  fornecedor: string;
  valor: number;
  vencimento: string;
  status: 'pendente' | 'pago';
}

const dataPath = path.join(__dirname, '../data/boletos.json');
let boletos: Boleto[] = [];

async function carregarBoletos() {
  try {
    const dados = await fs.readFile(dataPath, 'utf8');
    boletos = (JSON.parse(dados) as Boleto[]).map(b => ({
      ...b,
      status: b.status === 'pago' ? 'pago' : 'pendente'
    }));
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

app.get('/api/boletos/:id', (req: Request<{ id: string }>, res) => {
  const id = Number(req.params.id);
  const boleto = boletos.find(b => b.id === id);
  if (!boleto) {
    res.status(404).end();
    return;
  }
  res.json(boleto);
});

app.post('/api/boletos', async (req: Request, res: Response) => {
  const { fornecedor, valor, vencimento, status } = req.body;
  const novo: Boleto = {
    id: boletos.length ? Math.max(...boletos.map(b => b.id)) + 1 : 1,
    fornecedor,
    valor: Number(valor),
    vencimento,
    status: status === 'pago' ? 'pago' : 'pendente'
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
  const dadosAtualizados = { ...req.body };
  if (dadosAtualizados.status && dadosAtualizados.status !== 'pago') {
    dadosAtualizados.status = 'pendente';
  }
  boletos[idx] = { ...boletos[idx], ...dadosAtualizados };
  await salvarBoletos();
  res.json(boletos[idx]);
});

app.delete('/api/boletos/:id', async (req: Request<{ id: string }>, res: Response) => {
  const id = Number(req.params.id);
  boletos = boletos.filter(b => b.id !== id);
  await salvarBoletos();
  res.status(204).end();
});

app.get('/api/resumo', (_req, res) => {
  const pendentes = boletos.filter(b => b.status === 'pendente');
  const pagos = boletos.filter(b => b.status === 'pago');
  const pendente = pendentes.length;
  const pago = pagos.length;
  const totalPendente = pendentes.reduce((acc, b) => acc + b.valor, 0);
  const totalPago = pagos.reduce((acc, b) => acc + b.valor, 0);
  const totalMes: Record<string, number> = {};
  const totalFornecedor: Record<string, number> = {};
  boletos.forEach(b => {
    const mes = b.vencimento.slice(0, 7);
    totalMes[mes] = (totalMes[mes] || 0) + b.valor;
    totalFornecedor[b.fornecedor] = (totalFornecedor[b.fornecedor] || 0) + b.valor;
  });
  res.json({ pendente, pago, totalPendente, totalPago, totalMes, totalFornecedor });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
