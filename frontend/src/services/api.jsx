import axios from 'axios';

// C'est l'adresse du serveur de tes collègues.
// Si ça change, tu n'auras qu'à modifier cette seule ligne !
const API_URL = 'http://localhost:8080/api'; 

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Cette partie ajoute automatiquement le Token de sécurité
// à toutes tes requêtes si l'utilisateur est connecté.
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = 'Bearer ' + token;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;