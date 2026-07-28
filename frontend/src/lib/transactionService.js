
import api from './api';

export const getProducts = async () => {
    const response = await api.get('/products');
    return response.data;
};

export const createTransaction = async () => {
    const response = await api.post('/transactions');
    return response.data.data;
};

export const addTransactionItem = async (transactionId, productId, quantity) => {
    const response = await api.post(`/transactions/${transactionId}/items`, { productId, quantity });
    return response.data;
};

export const checkoutTransaction = async (transactionId, paymentMethod, amountPaid) => {
    const response = await api.post(`/transactions/${transactionId}/checkout`, { paymentMethod, amountPaid });
    return response.data.data;
};