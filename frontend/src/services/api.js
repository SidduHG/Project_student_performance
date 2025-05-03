import axios from 'axios'

const api=axios.api.create({
    baseURL:'/api',
    headers:{
        'Content-Type':'application/json'
    },
});

export default api;