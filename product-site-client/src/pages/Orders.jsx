// src/pages/Orders.jsx
import { useState, useEffect, useMemo } from 'react';
import {
  Container,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import api from '../api/axios';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';

// Separate component for the order table
function OrderTable({ items }) {
  const columnHelper = createColumnHelper();

  const columns = useMemo(
    () => [
      columnHelper.accessor('productName', {
        header: 'Product',
        cell: info => info.getValue(),
      }),
      columnHelper.accessor('priceAtPurchase', {
        header: 'Unit Price',
        cell: info => `$${info.getValue().toFixed(2)}`,
      }),
      columnHelper.accessor('quantity', {
        header: 'Qty',
        cell: info => info.getValue(),
      }),
      columnHelper.accessor(row => row.priceAtPurchase * row.quantity, {
        id: 'subtotal',
        header: 'Subtotal',
        cell: info => `$${info.getValue().toFixed(2)}`,
      }),
    ],
    []
  );

  const table = useReactTable({
    data: items,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Box sx={{ overflow: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
        <thead>
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th key={header.id} style={{ padding: '6px 16px', textAlign: 'left', borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map(row => (
            <tr key={row.id}>
              {row.getVisibleCells().map(cell => (
                <td key={cell.id} style={{ padding: '6px 16px', borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </Box>
  );
}

export default function Orders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    api.get('/orders')
      .then(res => setOrders(res.data))
      .catch(err => console.error('Failed to load orders', err));
  }, []);

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        {orders.length && orders[0].userId ? 'Sales History' : 'Your Orders'}
      </Typography>

      {orders.length === 0 && <Typography>No orders found.</Typography>}

      {orders.map(order => (
        <Accordion key={order.id} sx={{ mb: 2 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
              <Typography>Order #{order.id}</Typography>
              <Typography>{new Date(order.timestamp).toLocaleString()}</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <OrderTable items={order.items} />
            <Box sx={{ mt: 1, textAlign: 'right' }}>
              <Typography variant="subtitle1">
                Total: $
                {order.items
                  .reduce((sum, i) => sum + i.priceAtPurchase * i.quantity, 0)
                  .toFixed(2)}
              </Typography>
            </Box>
          </AccordionDetails>
        </Accordion>
      ))}
    </Container>
  );
}
