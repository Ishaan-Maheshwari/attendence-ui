import axios from 'axios'

const api = axios.create({
  baseURL: '/api', // this will be proxied to Flask
})

export default api
