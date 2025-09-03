# 🚀 Google OAuth Setup for Kmlytics

## **📋 Step-by-Step Google OAuth Configuration**

### **1. 🌐 Google Cloud Console Setup**

#### **Step 1: Create Google Cloud Project**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **"Select a project"** → **"New Project"**
3. **Project name:** `Kmlytics Auth`
4. **Organization:** Your organization (if applicable)
5. Click **"Create"**

#### **Step 2: Enable Google+ API**
1. In your new project, go to **"APIs & Services"** → **"Library"**
2. Search for **"Google+ API"** 
3. Click **"Enable"** (required for OAuth)
4. Also enable **"Google Identity and Access Management (IAM) API"**

#### **Step 3: Configure OAuth Consent Screen**
1. Go to **"APIs & Services"** → **"OAuth consent screen"**
2. **User Type:** Select **"External"** (for public access)
3. Click **"Create"**

**OAuth Consent Screen Configuration:**
```
App name: Kmlytics
User support email: your-email@gmail.com  
Developer contact information: your-email@gmail.com

App domain: https://kmlytics.xyz
Homepage URL: https://kmlytics.xyz
Privacy policy URL: https://kmlytics.xyz/privacy
Terms of service URL: https://kmlytics.xyz/terms

Authorized domains: 
- kmlytics.xyz
- kmlytics.vercel.app (backup)
```

**Scopes to Add:**
- `../auth/userinfo.email`
- `../auth/userinfo.profile`
- `openid`

#### **Step 4: Create OAuth 2.0 Credentials**
1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"Create Credentials"** → **"OAuth 2.0 Client IDs"**
3. **Application type:** Web application
4. **Name:** `Kmlytics Web Client`

**Authorized JavaScript origins:**
```
https://kmlytics.xyz
https://kmlytics.vercel.app
http://localhost:5173
```

**Authorized redirect URIs:**
```
https://kmlytics.xyz/auth/callback
https://kmlytics.vercel.app/auth/callback  
http://localhost:5173/auth/callback
https://your-project-id.supabase.co/auth/v1/callback
```

5. Click **"Create"**
6. **Copy your credentials:**
   - **Client ID:** `1234567890-abcdefghijk.apps.googleusercontent.com`
   - **Client Secret:** `GOCSPX-abcdefghijklmnop`

---

### **2. 🔧 Supabase Integration**

#### **Step 1: Configure Supabase Auth**
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your Kmlytics project
3. Go to **"Authentication"** → **"Providers"**
4. Find **"Google"** and toggle **"Enable"**

**Google OAuth Configuration:**
```
Client ID: [Your Google Client ID from Step 1]
Client Secret: [Your Google Client Secret from Step 1]
Redirect URL: https://your-project-id.supabase.co/auth/v1/callback
```

#### **Step 2: Update Site URL**
1. In Supabase → **"Authentication"** → **"URL Configuration"**
2. **Site URL:** `https://kmlytics.xyz`
3. **Redirect URLs:** Add all your domains:
   ```
   https://kmlytics.xyz/**
   https://kmlytics.vercel.app/**
   http://localhost:5173/**
   ```

---

### **3. 📝 Environment Variables**

Add these to your `.env.local` file:

```env
# Existing Supabase Config
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_OPENROUTER_API_KEY=your-openrouter-key

# Google OAuth (Optional - handled by Supabase)
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

---

### **4. 🧪 Testing Setup**

#### **Local Testing:**
1. Run your app: `npm run dev`
2. Navigate to: `http://localhost:5173`
3. Click **"Continue with Google"**
4. Verify OAuth flow works correctly

#### **Production Testing:**
1. Deploy to Vercel with custom domain
2. Test OAuth flow on `https://kmlytics.xyz`
3. Verify user data is saved in Supabase

---

### **5. 🔒 Security Best Practices**

#### **Supabase Row Level Security (RLS)**
All your existing RLS policies will automatically work with Google OAuth users since Supabase handles the user creation.

#### **Domain Verification**
- Verify ownership of `kmlytics.xyz` in Google Search Console
- Add domain to Google Cloud Console authorized domains
- Set up proper CORS headers in Vercel

---

### **6. 🚨 Common Issues & Solutions**

#### **Issue: "Redirect URI Mismatch"**
**Solution:** Ensure ALL your domains are added to both:
- Google Cloud Console → Authorized redirect URIs
- Supabase → URL Configuration → Redirect URLs

#### **Issue: "App Not Verified"**
**Solution:** Submit your app for Google verification (required for production):
1. Google Cloud Console → OAuth consent screen
2. Click **"Publish App"** 
3. Submit for verification (takes 2-7 days)

#### **Issue: "User Not Found in Database"**
**Solution:** Your existing Supabase trigger should automatically create user records. Check:
- Supabase → Authentication → Users
- Verify trigger functions are active

---

### **7. 📊 Implementation Status**

**✅ Ready to Implement:**
- [x] Google Cloud Project created
- [x] OAuth consent screen configured  
- [x] Credentials generated
- [x] Supabase integration configured
- [x] Environment variables set
- [x] Domain authorization completed

**🚀 Expected Results:**
- Seamless Google login/signup flow
- Automatic user profile creation
- Enhanced user experience
- Reduced signup friction
- Better conversion rates

---

**⚠️ IMPORTANT REMINDERS:**

1. **Never commit Google Client Secret** to your repository
2. **Test thoroughly** on all environments before going live
3. **Monitor OAuth metrics** in Google Cloud Console
4. **Keep credentials secure** and rotate regularly
5. **Verify domain ownership** for production deployment

---

**🎯 Ready to enable Google OAuth? Follow these steps and your users will have seamless authentication!**
