/**
 * Supabase Client Configuration & Initialization
 * 
 * Replace SUPABASE_URL and SUPABASE_ANON_KEY with your credentials from your Supabase Dashboard:
 * Dashboard -> Project Settings -> API
 */

const SUPABASE_CONFIG = {
  url: window.ENV_SUPABASE_URL || "https://pobqfvqrnrdinwjwzkja.supabase.co",
  anonKey: window.ENV_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvYnFmdnFybnJkaW53and6a2phIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA5ODgwMDcsImV4cCI6MjEwNjU2NDAwN30.vzW8yh-fKvjbhkm56elVNr-lQQsPrVFqD0PZgaZ-Sck"
};

// Check if user has updated keys in localStorage for easy development without modifying files every time
const savedUrl = localStorage.getItem("custom_supabase_url");
const savedKey = localStorage.getItem("custom_supabase_key");

const finalUrl = savedUrl || SUPABASE_CONFIG.url;
const finalKey = savedKey || SUPABASE_CONFIG.anonKey;

// Initialize Supabase if client library is loaded
let supabaseClient = null;
if (window.supabase) {
  try {
    supabaseClient = window.supabase.createClient(finalUrl, finalKey);
  } catch (err) {
    console.warn("Supabase client init note:", err.message);
  }
}

// Fallback Mock Data for immediate offline / pre-setup preview
const DEFAULT_SKILLS = [
  { id: '1', title: 'Java', level: 50, icon_class: 'Java', sort_order: 1 },
  { id: '2', title: 'HTML & CSS', level: 85, icon_class: 'html', sort_order: 2 },
  { id: '3', title: 'Python', level: 70, icon_class: 'python', sort_order: 3 },
  { id: '4', title: 'Graphic Designing', level: 75, icon_class: 'graphic-designer', sort_order: 4 },
  { id: '5', title: 'JavaScript', level: 65, icon_class: 'javascript', sort_order: 5 }
];

const DEFAULT_CERTIFICATES = [
  {
    id: '1',
    title: 'STARTUP SPRINT',
    description: 'Entrepreneurship and hackathon participation experience.',
    image_url: 'assets/certificate1.jpeg',
    credential_url: 'assets/certificate1.jpeg',
    sort_order: 1
  },
  {
    id: '2',
    title: 'Python Hackathon',
    description: 'Python hackathon participation experience and coding challenges.',
    image_url: 'assets/certificate4.png',
    credential_url: 'assets/certificate4.png',
    sort_order: 2
  },
  {
    id: '3',
    title: 'Graphic Designing',
    description: 'Participated in workshop of Canva & digital branding.',
    image_url: 'assets/certificate2.jpeg',
    credential_url: 'assets/certificate2.jpeg',
    sort_order: 3
  },
  {
    id: '4',
    title: 'JavaJumpstart',
    description: 'Core concepts, OOP, and data structures in Java.',
    image_url: 'assets/certificate3.jpeg',
    credential_url: 'assets/certificate3.jpeg',
    sort_order: 4
  },
  {
    id: '5',
    title: 'Introduction to Programming',
    description: 'Foundational programming workshop and algorithmic thinking.',
    image_url: 'assets/certificate5.jpeg',
    credential_url: 'assets/certificate5.jpeg',
    sort_order: 5
  }
];

window.appSupabase = {
  client: supabaseClient,
  isConfigured: () => {
    return finalUrl && !finalUrl.includes("your-project-id") && finalKey && !finalKey.includes("your-anon-key");
  },
  getConfig: () => ({ url: finalUrl, anonKey: finalKey }),
  saveConfig: (url, key) => {
    localStorage.setItem("custom_supabase_url", url);
    localStorage.setItem("custom_supabase_key", key);
    window.location.reload();
  },
  resetConfig: () => {
    localStorage.removeItem("custom_supabase_url");
    localStorage.removeItem("custom_supabase_key");
    window.location.reload();
  },
  // Data helpers
  async getSkills() {
    if (this.client && this.isConfigured()) {
      try {
        const { data, error } = await this.client
          .from('skills')
          .select('*')
          .order('sort_order', { ascending: true });
        if (!error && data && data.length > 0) return data;
      } catch (e) {
        console.warn("Using fallback skills:", e);
      }
    }
    // Return mock / local storage skills
    const local = localStorage.getItem("local_skills");
    return local ? JSON.parse(local) : DEFAULT_SKILLS;
  },
  async getCertificates() {
    if (this.client && this.isConfigured()) {
      try {
        const { data, error } = await this.client
          .from('certificates')
          .select('*')
          .order('sort_order', { ascending: true });
        if (!error && data && data.length > 0) return data;
      } catch (e) {
        console.warn("Using fallback certificates:", e);
      }
    }
    const local = localStorage.getItem("local_certificates");
    return local ? JSON.parse(local) : DEFAULT_CERTIFICATES;
  },
  async getMessages() {
    if (this.client && this.isConfigured()) {
      try {
        const { data, error } = await this.client
          .from('messages')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data) return data;
      } catch (e) {
        console.warn("Using fallback messages:", e);
      }
    }
    const local = localStorage.getItem("local_messages");
    return local ? JSON.parse(local) : [];
  }
};
