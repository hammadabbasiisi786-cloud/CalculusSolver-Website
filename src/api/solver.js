/* ─────────────────────────────────────────────────────────────────────────────
   solver.js — API client for the FastAPI backend
   ───────────────────────────────────────────────────────────────────────────── */

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export async function solve(payload) {
  try {
    const res = await fetch(API + '/solve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    if (!res.ok) {
      if (res.status === 503) {
        throw new Error('Neural model loading — showing fallback result');
      }
      throw new Error(await res.text());
    }
    
    return await res.json();
  } catch (error) {
    if (error.message === 'Failed to fetch') {
      throw new Error('Could not connect to the API server. Please make sure the backend is running.');
    }
    throw error;
  }
}

export async function checkStatus() {
  try {
    const res = await fetch(API + '/validate', {
      method: 'GET',
    });
    return res.ok;
  } catch (error) {
    return false;
  }
}
