import api from './api'

const login = async (credentials) => {
  const response = await api.post('/api/v1/auth/login', credentials)
  return response.data
}

const register = async (userData) => {
  const response = await api.post('/api/v1/users', userData)
  return response.data
}

const getCurrentUser = async () => {
  const response = await api.get('/api/v1/auth/me')
  return response.data
}

const logout = async () => {
  await api.get('/api/v1/auth/logout')
}

export const authService = {
  login,
  register,
  getCurrentUser,
  logout,
}