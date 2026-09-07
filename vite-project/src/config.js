// Central API configuration
// Automatically uses Render backend in production, localhost in development
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://code-tracker-project-finl.onrender.com';

export default API_BASE_URL;
