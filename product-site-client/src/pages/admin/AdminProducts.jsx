import { useEffect, useMemo, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper
} from '@tanstack/react-table';
import {
  Container, Table, TableHead, TableRow,
  TableCell, TableBody, IconButton, Button, Box, Typography,
  Dialog, DialogTitle, DialogContent, Grid, Rating
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import BarChartIcon from '@mui/icons-material/BarChart';
import api from '../../api/axios';
import ProductForm from './ProductForm';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [salesData, setSalesData] = useState(null);
  const [salesDialogOpen, setSalesDialogOpen] = useState(false);

  const loadProducts = () => {
    api.get('/products')
      .then(res => setProducts(res.data))
      .catch(() => console.error('Failed to load products'));
  };

  useEffect(loadProducts, []);

  const openForm = (product) => {
    setEditProduct(product || null);
    setDialogOpen(true);
  };

  const loadSalesData = async (productId) => {
    try {
      const response = await api.get(`/products/${productId}/sales`);
      setSalesData(response.data);
      setSalesDialogOpen(true);
    } catch (error) {
      console.error('Failed to load sales data:', error);
      alert('Failed to load sales data');
    }
  };

  const columnHelper = createColumnHelper();

  const columns = useMemo(() => [
    columnHelper.accessor('name', { header: 'Name' }),
    columnHelper.accessor('price', {
      header: 'Price',
      cell: info => `€${info.getValue().toFixed(2)}`
    }),
    columnHelper.accessor('stock', { header: 'Stock' }),
    columnHelper.accessor('categoryName', { header: 'Category' }),
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <>
          <IconButton onClick={() => openForm(row.original)}>
            <EditIcon />
          </IconButton>
          <IconButton onClick={() => loadSalesData(row.original.id)}>
            <BarChartIcon />
          </IconButton>
          <IconButton onClick={() => handleDelete(row.original.id)}>
            <DeleteIcon />
          </IconButton>
        </>
      )
    })
  ], []);

  const table = useReactTable({
    data: products,
    columns,
    getCoreRowModel: getCoreRowModel()
  });

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      setProducts(products.filter(p => p.id !== id));
    } catch {
      alert('Delete failed');
    }
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5">Manage Products</Typography>
        <Button variant="contained" onClick={() => openForm(null)}>Add Product</Button>
      </Box>

      <Table>
        <TableHead>
          {table.getHeaderGroups().map(headerGroup => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <TableCell key={header.id}>
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

      <ProductForm
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={loadProducts}
        product={editProduct}
      />

      <Dialog 
        open={salesDialogOpen} 
        onClose={() => setSalesDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Sales Analytics</DialogTitle>
        <DialogContent>
          {salesData && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6">Overview</Typography>
                <Typography>Total Units Sold: {salesData.totalUnitsSold}</Typography>
                <Typography>Current Stock: {salesData.currentStock}</Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="h6">Review Stats</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Rating value={salesData.reviews.averageRating || 0} precision={0.1} readOnly />
                  <Typography sx={{ ml: 1 }}>
                    ({salesData.reviews.totalReviews} reviews)
                  </Typography>
                </Box>
                {salesData.reviews.ratingDistribution.map(dist => (
                  <Typography key={dist.rating}>
                    {dist.rating} stars: {dist.count} reviews
                  </Typography>
                ))}
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6">Monthly Sales</Typography>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Period</TableCell>
                      <TableCell align="right">Units</TableCell>
                      <TableCell align="right">Revenue</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {salesData.monthlySales.map(month => (
                      <TableRow key={`${month.year}-${month.month}`}>
                        <TableCell>
                          {new Date(month.year, month.month - 1).toLocaleDateString('default', { 
                            month: 'long', 
                            year: 'numeric' 
                          })}
                        </TableCell>
                        <TableCell align="right">{month.units}</TableCell>
                        <TableCell align="right">
                          ${month.revenue.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Grid>
            </Grid>
          )}
        </DialogContent>
      </Dialog>
    </Container>
  );
}
