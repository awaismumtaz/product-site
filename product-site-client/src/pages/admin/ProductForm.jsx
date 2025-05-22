// src/components/admin/ProductForm.jsx
import {
    Button, Dialog, DialogActions, DialogContent, DialogTitle,
    TextField, MenuItem, Box
  } from '@mui/material';
  import { useEffect, useState } from 'react';
  import api from '../../api/axios';
  
  export default function ProductForm({ open, onClose, onSave, product }) {
    const isEdit = !!product;
    const [form, setForm] = useState({
      name: '', price: '', stock: '', categoryId: '', image: null
    });
    const [categories, setCategories] = useState([]);
  
    useEffect(() => {
      if (product) {
        setForm({ ...product, image: null }); // image not reloaded
      }
    }, [product]);
  
    useEffect(() => {
      api.get('/categories')
        .then(res => setCategories(res.data))
        .catch(() => console.error('Failed to load categories'));
    }, []);
  
    const handleChange = e => {
      const { name, value, files } = e.target;
      setForm(prev => ({
        ...prev,
        [name]: files ? files[0] : value
      }));
    };
  
    const handleSubmit = async () => {
      const data = new FormData();
      data.append('name', form.name);
      data.append('price', form.price);
      data.append('stock', form.stock);
      data.append('categoryId', form.categoryId);
      if (form.image) data.append('image', form.image);
      console.log('Submitting product:', Object.fromEntries(data.entries()));
  
      try {
        if (isEdit) {
          await api.put(`/products/${product.id}`, data, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          });
        } else {
          await api.post('/products', data, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          });
        }
        onSave();
        onClose();
      } catch (error) {
        console.error('Error saving product:', error);
        alert(error.response?.data || 'Failed to save product');
      }
    };
  
    return (
      <Dialog open={open} onClose={onClose} fullWidth>
        <DialogTitle>{isEdit ? 'Edit Product' : 'Add Product'}</DialogTitle>
        <DialogContent>
          <TextField fullWidth margin="normal" label="Name" name="name"
            value={form.name} onChange={handleChange} />
          <TextField fullWidth margin="normal" label="Price" type="number" name="price"
            value={form.price} onChange={handleChange} />
          <TextField fullWidth margin="normal" label="Stock" type="number" name="stock"
            value={form.stock} onChange={handleChange} />
          <TextField select fullWidth margin="normal" label="Category" name="categoryId"
            value={form.categoryId} onChange={handleChange}>
            {categories.map(c => (
              <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
            ))}
          </TextField>
          <Box mt={2}>
            <input type="file" name="image" onChange={handleChange} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {isEdit ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
  