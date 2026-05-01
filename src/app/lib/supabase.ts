import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';

export const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);

// Use the deployed Supabase Edge Function name 'server' (folder: supabase/functions/server)
export const API_URL = `https://${projectId}.supabase.co/functions/v1/server`;

// Helper function to get auth headers
export const getAuthHeaders = (token?: string) => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  } else {
    headers['Authorization'] = `Bearer ${publicAnonKey}`;
  }
  
  return headers;
};
