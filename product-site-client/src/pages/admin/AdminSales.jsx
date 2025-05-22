import { useState, useEffect } from 'react';
import {
  Container, Typography, Paper, Grid, CircularProgress, Alert, Box
} from '@mui/material';
import api from '../../api/axios';

function AdminSales() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        const response = await api.get('/orders/summary');
        setSummary(response.data);
        setError('');
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to fetch sales summary');
        console.error("Error fetching sales summary:", err);
      }
      setLoading(false);
    };

    fetchSummary();
  }, []);

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

  if (!summary) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="info">No sales summary data available.</Alert>
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Sales Overview</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={4}>
          <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" color="textSecondary">Total Revenue</Typography>
            <Typography variant="h4" color="primary">
              ${summary.totalRevenue?.toFixed(2) || '0.00'}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" color="textSecondary">Total Orders</Typography>
            <Typography variant="h4" color="primary">
              {summary.totalOrders || 0}
            </Typography>
          </Paper>
        </Grid>
        {/* Add more summary cards here if backend provides more data */}
        {/* e.g., Unique Customers, Average Order Value */}
      </Grid>
      
      <Box sx={{ mt: 5 }}>
        <Typography variant="h5" gutterBottom>Further Details</Typography>
        <Typography variant="body1">
          For more detailed sales information, such as sales per product, please refer to the specific product details in the "Manage Products" section, which includes sales history for each item.
        </Typography>
        <Typography variant="body1" sx={{mt: 1}}>
          To view all individual orders, please visit the "Manage Orders" section (if available).
        </Typography>
      </Box>

    </Container>
  );
}

export default AdminSales;