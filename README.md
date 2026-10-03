# Portfolio & Supabase BaaS Admin Architecture

## 📁 Project Structure

```
portfolio/
├── admin/                     # 🛡️ Admin Management System
│   ├── index.html             # Admin Auth / Login + Supabase Key Config
│   └── dashboard.html         # Interactive CRUD Dashboard for Skills & Certificates
├── assets/                    # Static images, avatars, certificate media
├── css/                       # Global & Modular Styles
│   ├── main.css               # Unified theme variables, navbar, glowing background
│   └── admin.css              # Cyberpunk Glassmorphism Admin Panel styling
├── js/                        # Client Logic & BaaS Connections
│   ├── supabase-config.js     # Supabase client singleton, fallback data & storage handler
│   ├── admin-auth.js          # Authentication guard & login controller
│   ├── admin-dashboard.js     # Full CRUD controller & image storage uploader
│   └── script.js              # Interactive animations & certificate modals
├── supabase/                  # 🗄️ Database Migrations & Schemas
│   └── schema.sql             # SQL Script for Tables, RLS Policies & Storage
├── about.html                 # About Shyamali
├── certificate.html           # Dynamic Certificate showcase
├── contact.html               # Contact form page
├── index.html                 # Home / Hero portfolio
├── skills.html                # Dynamic Skills progress showcase
└── README.md                  # Complete documentation
```

---

## ⚡ Supabase BaaS Setup Guide (3 Steps)

### Step 1: Create Tables & RLS Policies
1. Log in to [supabase.com](https://supabase.com) and open your project dashboard.
2. Go to the **SQL Editor** tab on the left menu and click **New Query**.
3. Copy all contents from [supabase/schema.sql](file:///c:/Users/HP/OneDrive/Documents/portfolio/supabase/schema.sql) and click **Run**.
   - This creates the `skills` and `certificates` tables with Row Level Security (RLS).
   - Public visitors can view items, while only authenticated admin users can Insert/Update/Delete.

### Step 2: Create Storage Bucket for Uploads
1. Go to **Storage** -> **New Bucket**.
2. Name it `certificates` and check **Public bucket**.
3. Click **Save**.

### Step 3: Link API Keys in Admin Panel
1. Open [`admin/index.html`](file:///c:/Users/HP/OneDrive/Documents/portfolio/admin/index.html) in your browser.
2. Click **Configure Supabase API Keys**.
3. Paste your **Project URL** and **Anon / Public API Key** (found in Supabase Dashboard -> *Project Settings* -> *API*).
4. Create an Admin user in Supabase Dashboard (**Authentication** -> **Users** -> **Add User**) and sign in!

---

## 🚀 Features
- **Zero-Build Architecture**: Runs in any browser, GitHub Pages, Vercel, or Netlify with zero build step.
- **Offline / Demo Mode**: Full fallback support with localStorage so you can preview changes immediately even before connecting to the cloud.
- **Instant Cloud Sync**: Once connected to Supabase, any edits, creations, or deletions made in [`admin/dashboard.html`](file:///c:/Users/HP/OneDrive/Documents/portfolio/admin/dashboard.html) update live across the visitor-facing pages.
