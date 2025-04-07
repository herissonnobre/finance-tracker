import axios from 'axios';

export const api = axios.create({
  baseURL: 'https://localhost:4000/',
  withCredentials: true, // if using cookies or auth headers
})