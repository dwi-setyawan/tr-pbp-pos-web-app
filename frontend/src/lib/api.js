// import axios from 'axios';

// const api = axios.create({
//     baseURL: import.meta.env.VITE_API_BASE_URL,
// });

// const token = sessionStorage.getItem('token');

// api.interceptors.request.use((config) => {
//     // const token = localStorage.getItem('token');
//     const token = sessionStorage.getItem('token');
//     if (token) {
//         config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
// });

// export default api;

//============

import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
    const token = sessionStorage.getItem('token') || localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;