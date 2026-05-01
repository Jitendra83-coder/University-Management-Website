// @ts-nocheck
import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import { createClient } from "npm:@supabase/supabase-js";

const app = new Hono();

// Supabase client with service role for admin operations
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

// Supabase client for auth operations
const getAuthClient = () => createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_ANON_KEY') ?? '',
);

// Initialize storage bucket for university images
const bucketName = 'make-e53d973c-universities';

const DEFAULT_SUPERADMIN_EMAIL = 'js129476@gmail.com';
const DEFAULT_SUPERADMIN_PASSWORD = 'Jitendra@83';
const DEFAULT_SUPERADMIN_NAME = 'Super Admin';

const ensureSuperAdminUser = async () => {
  try {
    await supabase.auth.admin.createUser({
      email: DEFAULT_SUPERADMIN_EMAIL,
      password: DEFAULT_SUPERADMIN_PASSWORD,
      user_metadata: { name: DEFAULT_SUPERADMIN_NAME, role: 'admin' },
      email_confirm: true,
    });
    console.log('Default superadmin created.');
  } catch (error) {
    const message = (error as any)?.message || '';
    if (
      message.includes('already') ||
      message.includes('duplicate') ||
      message.includes('User already registered')
    ) {
      try {
        const { data: listData, error: listError } = await supabase.auth.admin.listUsers();
        if (listError) {
          console.log('Error listing users for superadmin recovery:', listError);
          return;
        }

        const users = Array.isArray((listData as any)?.users)
          ? (listData as any).users
          : (Array.isArray(listData as any) ? listData : []);

        const existingUser = (users as any[]).find((u) => u.email === DEFAULT_SUPERADMIN_EMAIL);
        if (existingUser) {
          await supabase.auth.admin.updateUserById(existingUser.id, {
            password: DEFAULT_SUPERADMIN_PASSWORD,
            user_metadata: { name: DEFAULT_SUPERADMIN_NAME, role: 'admin' },
          });
          console.log('Default superadmin password reset.');
        }
      } catch (recoveryError) {
        console.log('Error recovering superadmin user:', recoveryError);
      }
      return;
    }
    console.log('Error ensuring superadmin user:', error);
  }
};

// Create bucket and ensure superadmin on startup
(async () => {
  const { data: buckets } = await supabase.storage.listBuckets();
  const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
  if (!bucketExists) {
    await supabase.storage.createBucket(bucketName, { public: false });
  }

  await ensureSuperAdminUser();
})();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/health", (c) => {
  return c.json({ status: "ok" });
});

// ===== AUTH ROUTES =====

// Admin signup
app.post("/admin/signup", async (c) => {
  try {
    const { email, password, name } = await c.req.json();
    
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name, role: 'admin' },
      email_confirm: true // Auto-confirm since email server isn't configured
    });

    if (error) {
      const message = (error as any)?.message || '';
      console.log(`Admin signup error: ${message}`);

      if (
        message.includes('already') ||
        message.includes('duplicate') ||
        message.includes('User already registered')
      ) {
        if (email === DEFAULT_SUPERADMIN_EMAIL) {
          try {
            const { data: listData, error: listError } = await supabase.auth.admin.listUsers();

            if (listError) {
              console.log('Error listing users for superadmin recovery:', listError);
              return c.json({ error: 'Signup failed' }, 500);
            }

            const users = Array.isArray((listData as any)?.users)
              ? (listData as any).users
              : (Array.isArray(listData as any) ? listData : []);

            const existingUser = (users as any[]).find((u) => u.email === email);
            if (existingUser) {
              const { error: updateError } = await supabase.auth.admin.updateUserById(existingUser.id, {
                password,
                user_metadata: { name, role: 'admin' },
              });

              if (updateError) {
                console.log('Error resetting default admin password:', updateError);
                return c.json({ error: 'Signup failed' }, 500);
              }

              return c.json({ success: true, user: existingUser });
            }
          } catch (recoveryError) {
            console.log('Error recovering default admin user:', recoveryError);
            return c.json({ error: 'Signup failed' }, 500);
          }
        }

        return c.json({ error: 'Account already exists. Please sign in.' }, 400);
      }

      return c.json({ error: message }, 400);
    }

    return c.json({ success: true, user: data.user });
  } catch (error) {
    console.log(`Admin signup exception: ${error}`);
    return c.json({ error: 'Signup failed' }, 500);
  }
});

// Admin login
app.post("/admin/login", async (c) => {
  try {
    const { email, password } = await c.req.json();

    if (email === DEFAULT_SUPERADMIN_EMAIL && password === DEFAULT_SUPERADMIN_PASSWORD) {
      await ensureSuperAdminUser();
    }

    const authClient = getAuthClient();
    
    const loginAttempt = async () => {
      return await authClient.auth.signInWithPassword({
        email,
        password,
      });
    };

    let { data, error } = await loginAttempt();

    if (error && email === DEFAULT_SUPERADMIN_EMAIL && password === DEFAULT_SUPERADMIN_PASSWORD) {
      console.log('Default superadmin login failed, retrying after recovery:', error.message);
      await ensureSuperAdminUser();
      ({ data, error } = await loginAttempt());
    }

    if (error) {
      console.log(`Admin login error: ${error.message}`);
      return c.json({ error: error.message }, 401);
    }

    const userRole = data.user?.user_metadata?.role;
    if (email === DEFAULT_SUPERADMIN_EMAIL && userRole !== 'admin' && data.user?.id) {
      const { error: updateError } = await supabase.auth.admin.updateUserById(data.user.id, {
        user_metadata: { name: DEFAULT_SUPERADMIN_NAME, role: 'admin' },
      });
      if (updateError) {
        console.log('Failed to set default admin role:', updateError);
      }
    }

    return c.json({ 
      success: true, 
      access_token: data.session.access_token,
      user: data.user 
    });
  } catch (error) {
    console.log(`Admin login exception: ${error}`);
    return c.json({ error: 'Login failed' }, 500);
  }
});

// Verify admin authentication middleware
const verifyAdmin = async (c: any, next: any) => {
  const accessToken = c.req.header('Authorization')?.split(' ')[1];
  
  if (!accessToken) {
    return c.json({ error: 'Unauthorized - No token provided' }, 401);
  }

  const authClient = getAuthClient();
  let user: any = null;
  let error: any = null;

  try {
    const { data, error: getUserError } = await authClient.auth.getUser(accessToken);
    error = getUserError;
    user = data?.user;
  } catch (err) {
    error = err;
  }

  if (!user || error) {
    try {
      const authUrl = `${Deno.env.get('SUPABASE_URL')}/auth/v1/user`;
      const response = await fetch(authUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          apikey: Deno.env.get('SUPABASE_ANON_KEY') ?? '',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to verify token: ${response.status}`);
      }

      const payload = await response.json();
      user = payload.user ?? payload;
    } catch (fallbackError) {
      console.log('Admin verification failed:', error || fallbackError);
      return c.json({ error: 'Unauthorized - Invalid token or insufficient permissions' }, 401);
    }
  }

  const userRole = user?.user_metadata?.role;
  if (userRole !== 'admin') {
    return c.json({ error: 'Unauthorized - Insufficient permissions' }, 401);
  }

  c.set('userId', user.id);
  await next();
};

// ===== UNIVERSITY ROUTES =====

// Get all universities (public)
app.get("/universities", async (c) => {
  try {
    const universities = await kv.getByPrefix('university:');
    return c.json({ universities: universities || [] });
  } catch (error) {
    console.log(`Error fetching universities: ${error}`);
    return c.json({ error: 'Failed to fetch universities' }, 500);
  }
});

// Get single university (public)
app.get("/universities/:id", async (c) => {
  try {
    const id = c.req.param('id');
    const university = await kv.get(`university:${id}`);
    
    if (!university) {
      return c.json({ error: 'University not found' }, 404);
    }

    // Get scholarships for this university
    const allScholarships = await kv.getByPrefix('scholarship:');
    const scholarships = allScholarships.filter((s: any) => s.universityId === id);

    return c.json({ university, scholarships });
  } catch (error) {
    console.log(`Error fetching university: ${error}`);
    return c.json({ error: 'Failed to fetch university' }, 500);
  }
});

// Create university (admin only)
app.post("/universities", verifyAdmin, async (c) => {
  try {
    const universityData = await c.req.json();
    const id = `uni_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const university = {
      id,
      ...universityData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`university:${id}`, university);
    return c.json({ success: true, university });
  } catch (error) {
    console.log(`Error creating university: ${error}`);
    return c.json({ error: 'Failed to create university' }, 500);
  }
});

// Update university (admin only)
app.put("/universities/:id", verifyAdmin, async (c) => {
  try {
    const id = c.req.param('id');
    const updates = await c.req.json();
    
    const existing = await kv.get(`university:${id}`);
    if (!existing) {
      return c.json({ error: 'University not found' }, 404);
    }

    const university = {
      ...existing,
      ...updates,
      id, // Preserve original ID
      createdAt: existing.createdAt, // Preserve creation date
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`university:${id}`, university);
    return c.json({ success: true, university });
  } catch (error) {
    console.log(`Error updating university: ${error}`);
    return c.json({ error: 'Failed to update university' }, 500);
  }
});

// Delete university (admin only)
app.delete("/universities/:id", verifyAdmin, async (c) => {
  try {
    const id = c.req.param('id');
    await kv.del(`university:${id}`);
    
    // Also delete associated scholarships
    const allScholarships = await kv.getByPrefix('scholarship:');
    const scholarshipsToDelete = allScholarships.filter((s: any) => s.universityId === id);
    
    for (const scholarship of scholarshipsToDelete) {
      await kv.del(`scholarship:${scholarship.id}`);
    }

    return c.json({ success: true });
  } catch (error) {
    console.log(`Error deleting university: ${error}`);
    return c.json({ error: 'Failed to delete university' }, 500);
  }
});

// ===== SCHOLARSHIP ROUTES =====

// Get all scholarships for a university (public)
app.get("/scholarships/:universityId", async (c) => {
  try {
    const universityId = c.req.param('universityId');
    const allScholarships = await kv.getByPrefix('scholarship:');
    const scholarships = allScholarships.filter((s: any) => s.universityId === universityId);
    
    return c.json({ scholarships });
  } catch (error) {
    console.log(`Error fetching scholarships: ${error}`);
    return c.json({ error: 'Failed to fetch scholarships' }, 500);
  }
});

// Create scholarship (admin only)
app.post("/scholarships", verifyAdmin, async (c) => {
  try {
    const scholarshipData = await c.req.json();
    const id = `sch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const scholarship = {
      id,
      ...scholarshipData,
      createdAt: new Date().toISOString(),
    };

    await kv.set(`scholarship:${id}`, scholarship);
    return c.json({ success: true, scholarship });
  } catch (error) {
    console.log(`Error creating scholarship: ${error}`);
    return c.json({ error: 'Failed to create scholarship' }, 500);
  }
});

// Update scholarship (admin only)
app.put("/scholarships/:id", verifyAdmin, async (c) => {
  try {
    const id = c.req.param('id');
    const updates = await c.req.json();
    
    const existing = await kv.get(`scholarship:${id}`);
    if (!existing) {
      return c.json({ error: 'Scholarship not found' }, 404);
    }

    const scholarship = { ...existing, ...updates, id };
    await kv.set(`scholarship:${id}`, scholarship);
    return c.json({ success: true, scholarship });
  } catch (error) {
    console.log(`Error updating scholarship: ${error}`);
    return c.json({ error: 'Failed to update scholarship' }, 500);
  }
});

// Delete scholarship (admin only)
app.delete("/scholarships/:id", verifyAdmin, async (c) => {
  try {
    const id = c.req.param('id');
    await kv.del(`scholarship:${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.log(`Error deleting scholarship: ${error}`);
    return c.json({ error: 'Failed to delete scholarship' }, 500);
  }
});

// ===== IMAGE UPLOAD ROUTE =====

// Upload university image (admin only)
app.post("/upload", verifyAdmin, async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return c.json({ error: 'No file provided' }, 400);
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, await file.arrayBuffer(), {
        contentType: file.type,
      });

    if (error) {
      console.log(`Upload error: ${error.message}`);
      return c.json({ error: error.message }, 500);
    }

    // Create signed URL (valid for 10 years)
    const { data: urlData } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(fileName, 315360000);

    return c.json({ 
      success: true, 
      url: urlData?.signedUrl,
      path: fileName 
    });
  } catch (error) {
    console.log(`Upload exception: ${error}`);
    return c.json({ error: 'Upload failed' }, 500);
  }
});

Deno.serve(app.fetch);