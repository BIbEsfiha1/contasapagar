import React from "react";
import Head from 'next/head';
import { Container, Typography, Table, TableHead, TableRow, TableCell, TableBody, TextField, Button } from '@mui/material';

interface Boleto {
  id: number;
  fornecedor: string;
  valor: number;
  vencimento: string;
}

export default function Home() {
  const [boletos, setBoletos] = React.useState<Boleto[]>([]);
  const [novo, setNovo] = React.useState({ fornecedor: '', valor: '', vencimento: '' });

  const carregar = () => {
    fetch('http://localhost:3001/api/boletos')
      .then(res => res.json())
      .then(data => setBoletos(data));
  };

  React.useEffect(carregar, []);

  const adicionar = async () => {
    await fetch('http://localhost:3001/api/boletos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(novo)
    });
    setNovo({ fornecedor: '', valor: '', vencimento: '' });
    carregar();
  };

  const remover = async (id: number) => {
    await fetch(`http://localhost:3001/api/boletos/${id}`, { method: 'DELETE' });
    carregar();
  };

  return (
    <Container>
      <Head>
        <title>ContaPago</title>
      </Head>
      <Typography variant="h4" gutterBottom>Boletos</Typography>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <TextField label="Fornecedor" value={novo.fornecedor} onChange={e => setNovo({ ...novo, fornecedor: e.target.value })} />
        <TextField label="Valor" type="number" value={novo.valor} onChange={e => setNovo({ ...novo, valor: e.target.value })} />
        <TextField label="Vencimento" type="date" InputLabelProps={{ shrink: true }} value={novo.vencimento} onChange={e => setNovo({ ...novo, vencimento: e.target.value })} />
        <Button variant="contained" onClick={adicionar}>Adicionar</Button>
      </div>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Fornecedor</TableCell>
            <TableCell>Valor</TableCell>
            <TableCell>Vencimento</TableCell>
            <TableCell>Ações</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {boletos.map(b => (
            <TableRow key={b.id}>
              <TableCell>{b.id}</TableCell>
              <TableCell>{b.fornecedor}</TableCell>
              <TableCell>{b.valor}</TableCell>
              <TableCell>{b.vencimento}</TableCell>
              <TableCell><Button color="error" onClick={() => remover(b.id)}>Excluir</Button></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Container>
  );
}
