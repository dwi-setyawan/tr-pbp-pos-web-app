import api from './api';

export const getProducts = async (includeInactive = false) => {
    const response = await api.get('/products', {
        params: includeInactive ? { all: true } : {},
    });
    return response.data;
};

export const createProduct = async (payload, imageFile) => {
    const formData = new FormData();
    formData.append('name', payload.name);
    formData.append('price', payload.price);
    formData.append('stock', payload.stock);
    formData.append('category', payload.category);
    if (imageFile) formData.append('image', imageFile);

    const response = await api.post('/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
};

export const updateProduct = async (id, payload, imageFile) => {
    const formData = new FormData();
    formData.append('name', payload.name);
    formData.append('price', payload.price);
    formData.append('stock', payload.stock);
    formData.append('category', payload.category);
    formData.append('isActive', payload.isActive);
    if (imageFile) formData.append('image', imageFile);

    const response = await api.put(`/products/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
};

export const deleteProduct = async (id) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
};

export const getImageUrl = (filename) => {
    if (!filename) return null;
    return `${import.meta.env.VITE_UPLOADS_BASE_URL}/${filename}`;
};