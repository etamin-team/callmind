import axios from 'axios'

axios.create({
  baseURL: 'https://api.callmind.com',
  headers: {
    'Content-Type': 'application/json',
  },
}); 