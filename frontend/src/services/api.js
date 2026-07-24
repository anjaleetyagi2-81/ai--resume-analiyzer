import axios from 'axios';

// In production, set VITE_API_BASE_URL at build time to point to your deployed backend
// (e.g. https://your-app-runner-url.awsapprunner.com/api). Falls back to local dev proxy target.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000, // AI analysis can take a little while
});

/**
 * Uploads a resume file (and optional job description) for analysis.
 *
 * @param {File} file - The resume file (PDF/DOCX)
 * @param {string} jobDescription - Optional target job description text
 * @param {(progress: number) => void} onUploadProgress - Optional progress callback (0-100)
 * @returns {Promise<object>} parsed analysis result
 */
export async function analyzeResume(file, jobDescription = '', onUploadProgress) {
  const formData = new FormData();
  formData.append('resume', file);
  if (jobDescription) {
    formData.append('jobDescription', jobDescription);
  }

  try {
    const { data } = await apiClient.post('/resume/analyze', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (evt) => {
        if (onUploadProgress && evt.total) {
          onUploadProgress(Math.round((evt.loaded / evt.total) * 100));
        }
      },
    });
    return data;
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Something went wrong while analyzing your resume.';
    throw new Error(message);
  }
}

export async function checkApiHealth() {
  try {
    const { data } = await apiClient.get('/resume/health');
    return data;
  } catch (error) {
    return { success: false, status: 'unreachable' };
  }
}

export default apiClient;
