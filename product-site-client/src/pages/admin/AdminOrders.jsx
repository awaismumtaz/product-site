import { useEffect, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  createColumnHelper,
  flexRender
} from '@tanstack/react-table';
import {
  Table, TableHead, TableBody, TableRow, TableCell,
  Container, Typography, IconButton, Dialog, DialogTitle,
  DialogContent, List, ListItem, ListItemText, CircularProgress, Alert,
  Paper
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import api from '../../api/axios';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const columnHelper = createColumnHelper();

  const columns = [
    columnHelper.accessor('id', { header: 'Order ID' }),
    columnHelper.accessor(row => row.user?.userName || 'N/A', { id: 'userName', header: 'User' }),
    columnHelper.accessor('timestamp', {
      header: 'Date',
      cell: info => new Date(info.getValue()).toLocaleString()
    }),
    columnHelper.accessor(row => row.items.reduce((sum, item) => sum + item.quantity, 0), { 
        id: 'totalItems', 
        header: 'Total Items' 
    }),
    columnHelper.accessor(row => row.items.reduce((sum, item) => sum + (item.priceAtPurchase * item.quantity), 0), {
        id: 'totalAmount',
        header: 'Total Amount',
        cell: info => `$${info.getValue().toFixed(2)}`
    }),
    columnHelper.display({
      id: 'actions',
      header: 'View Details',
      cell: ({ row }) => (
        <IconButton onClick={() => setSelectedOrder(row.original)}>
          <VisibilityIcon />
        </IconButton>
      )
    })
  ];

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await api.get('/orders/all'); // Changed to /orders/all
        setOrders(response.data || []);
        setError('');
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Could not load orders');
        console.error("Error fetching all orders:", err);
        setOrders([]);
      }
      setLoading(false);
    };
    fetchOrders();
  }, []);

  const table = useReactTable({
    data: orders,
    columns,
    getCoreRowModel: getCoreRowModel()
  });

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Manage All Orders</Typography>
      {orders.length === 0 && !loading && (
        <Alert severity="info">No orders found.</Alert>
      )}
      {orders.length > 0 && (
        <Paper sx={{overflowX: 'auto'}}>
          <Table>
            <TableHead>
              {table.getHeaderGroups().map(group => (
                <TableRow key={group.id}>
                  {group.headers.map(header => (
                    <TableCell key={header.id} sx={{whiteSpace: 'nowrap'}}>
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableHead>
            <TableBody>
              {table.getRowModel().rows.map(row => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <Dialog open={!!selectedOrder} onClose={() => setSelectedOrder(null)} fullWidth maxWidth="sm">
          <DialogTitle>Order ID: {selectedOrder.id}</DialogTitle>
          <DialogContent dividers>
            <Typography variant="subtitle1">User: {selectedOrder.user?.userName || 'N/A'}</Typography>
            <Typography variant="subtitle1">Date: {new Date(selectedOrder.timestamp).toLocaleString()}</Typography>
            <Typography variant="h6" sx={{mt: 2, mb: 1}}>Items:</Typography>
            <List disablePadding>
              {selectedOrder.items.map((item, i) => (
                <ListItem key={i} divider>
                  <ListItemText
                    primary={`${item.productName} (ID: ${item.productId})`}
                    secondary={`Quantity: ${item.quantity} @ $${item.priceAtPurchase.toFixed(2)} each`}
                  />
                  <Typography variant="body2">Subtotal: $${(item.quantity * item.priceAtPurchase).toFixed(2)}</Typography>
                </ListItem>
              ))}
            </List>
            <Typography variant="h6" sx={{mt: 2, textAlign: 'right'}}>
              Total: $${selectedOrder.items.reduce((sum, item) => sum + (item.quantity * item.priceAtPurchase), 0).toFixed(2)}
            </Typography>
          </DialogContent>
        </Dialog>
      )}
    </Container>
  );
}
