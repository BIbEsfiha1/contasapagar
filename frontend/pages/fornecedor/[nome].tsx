import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Container, Typography } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';

interface Boleto {
  id: number;
  fornecedor: string;
  valor: number;
  vencimento: string;
  status: 'pendente' | 'pago';
}

export default function Fornecedor() {
  const router = useRouter();
  const { nome } = router.query;
  const [boletos, setBoletos] = useState<Boleto[]>([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (!nome) return;
    fetch(`http://localhost:3001/api/boletos/fornecedor/${nome}`)
      .then(res => res.json())
      .then((data: Boleto[]) => {
        setBoletos(data);
        setTotal(data.reduce((acc, b) => acc + b.valor, 0));
      });
  }, [nome]);

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'valor', headerName: 'Valor', width: 120 },
    { field: 'vencimento', headerName: 'Vencimento', width: 150 },
    { field: 'status', headerName: 'Status', width: 120 }
  ];

  return (
    <Container>
      <Typography variant="h5" gutterBottom>Boletos de {nome}</Typography>
      <Typography variant="body1" gutterBottom>Total: R$ {total.toFixed(2)}</Typography>
      <DataGrid rows={boletos} columns={columns} autoHeight />
    </Container>
  );
}
