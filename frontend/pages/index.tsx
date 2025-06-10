import React from "react";
import Head from 'next/head';
import { Container, Typography, TextField, Button, Box } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

interface Boleto {
  id: number;
  fornecedor: string;
  valor: number;
  vencimento: string;
  status: 'pendente' | 'pago';
}

export default function Home() {
  const [boletos, setBoletos] = React.useState<Boleto[]>([]);
  const [novo, setNovo] = React.useState({ fornecedor: '', valor: '', vencimento: '', status: 'pendente' });
  const [resumo, setResumo] = React.useState<{ pendente: number; pago: number; totalMes: Record<string, number> }>({ pendente: 0, pago: 0, totalMes: {} });
  const [porFornecedor, setPorFornecedor] = React.useState<Record<string, number>>({});

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'fornecedor', headerName: 'Fornecedor', flex: 1, editable: true },
    { field: 'valor', headerName: 'Valor', width: 120, editable: true, type: 'number' },
    { field: 'vencimento', headerName: 'Vencimento', width: 140, editable: true },
    { field: 'status', headerName: 'Status', width: 110, editable: true, type: 'singleSelect', valueOptions: ['pendente', 'pago'] },
    {
      field: 'actions',
      headerName: 'Ações',
      width: 110,
      sortable: false,
      renderCell: (params) => (
        <Button color="error" onClick={() => remover(params.row.id)}>Excluir</Button>
      )
    }
  ];

  const carregar = () => {
    fetch('http://localhost:3001/api/boletos')
      .then(res => res.json())
      .then(data => setBoletos(data));
  };

  const carregarResumo = () => {
    fetch('http://localhost:3001/api/resumo')
      .then(res => res.json())
      .then(data => {
        setResumo({ pendente: data.pendente, pago: data.pago, totalMes: data.totalMes });
        setPorFornecedor(data.totalFornecedor);
      });
  };

  React.useEffect(() => {
    carregar();
    carregarResumo();
  }, []);

  const adicionar = async () => {
    await fetch('http://localhost:3001/api/boletos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(novo)
    });
    setNovo({ fornecedor: '', valor: '', vencimento: '', status: 'pendente' });
    carregar();
    carregarResumo();
  };

  const remover = async (id: number) => {
    await fetch(`http://localhost:3001/api/boletos/${id}`, { method: 'DELETE' });
    carregar();
    carregarResumo();
  };

  const processarEdicao = async (novoBoleto: Boleto) => {
    const res = await fetch(`http://localhost:3001/api/boletos/${novoBoleto.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(novoBoleto)
    });
    const dados = await res.json();
    carregar();
    carregarResumo();
    return dados;
  };

  return (
    <Container>
      <Head>
        <title>ContaPago</title>
      </Head>
      <Typography variant="h4" gutterBottom>Boletos</Typography>

      <Box mb={2}>
        <Typography>Boletos pendentes: {resumo.pendente} | pagos: {resumo.pago}</Typography>
      </Box>

      <Box mb={2} maxWidth={600}>
        <Bar data={{
          labels: Object.keys(resumo.totalMes),
          datasets: [{ label: 'Valor por mês', data: Object.values(resumo.totalMes), backgroundColor: 'rgba(75,192,192,0.5)' }]
        }} />
      </Box>

      <Box mb={2} maxWidth={600}>
        <Pie data={{
          labels: Object.keys(porFornecedor),
          datasets: [{ label: 'Por fornecedor', data: Object.values(porFornecedor), backgroundColor: ['#3f51b5','#f50057','#4caf50','#ff9800'] }]
        }} />
      </Box>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <TextField label="Fornecedor" value={novo.fornecedor} onChange={e => setNovo({ ...novo, fornecedor: e.target.value })} />
        <TextField label="Valor" type="number" value={novo.valor} onChange={e => setNovo({ ...novo, valor: e.target.value })} />
        <TextField label="Vencimento" type="date" InputLabelProps={{ shrink: true }} value={novo.vencimento} onChange={e => setNovo({ ...novo, vencimento: e.target.value })} />
        <TextField select label="Status" value={novo.status} onChange={e => setNovo({ ...novo, status: e.target.value })} SelectProps={{ native: true }}>
          <option value="pendente">pendente</option>
          <option value="pago">pago</option>
        </TextField>
        <Button variant="contained" onClick={adicionar}>Adicionar</Button>
      </div>

      <DataGrid
        rows={boletos}
        columns={columns}
        autoHeight
        processRowUpdate={processarEdicao}
      />
    </Container>
  );
}
