# 🌟 LocationAI - Regional Office Location Analysis Platform

A premium AI-powered SaaS application for strategic regional office location analysis with real-time mapping, supplier density analysis, and comprehensive business intelligence.

![LocationAI Dashboard](https://via.placeholder.com/1200x600/1a1a2e/ffffff?text=LocationAI+Dashboard)

## ✨ Features

### 🤖 AI-Powered Analysis
- **Strategic Recommendations** - AI-driven suggestions for optimal office locations
- **SWOT Analysis** - Comprehensive strengths, weaknesses, opportunities, and threats analysis
- **Risk Assessment** - Intelligent evaluation of potential challenges and mitigation strategies

### 📊 Data Analytics
- **Supplier Density Mapping** - Visual analysis of supplier coverage within configurable radius
- **Haversine Distance Calculations** - Accurate geographic distance measurements
- **Real-time Processing** - Instant analysis results with live updates

### 🗺️ Interactive Mapping
- **Leaflet Integration** - Professional-grade interactive maps
- **Coverage Visualization** - Radius circles and supplier density overlays
- **Multi-location Analysis** - Compare up to 6 potential office locations simultaneously

### 🔒 Enterprise Security
- **Supabase Authentication** - Secure user management with email/password
- **Row Level Security (RLS)** - Database-level data isolation per user
- **Encrypted Storage** - All data encrypted in transit and at rest

### 📈 Business Intelligence
- **Contextual Enrichment** - Reverse geocoding, railway stations, airports, highways
- **Population Data** - Demographic information for strategic planning
- **Export Capabilities** - CSV, Excel, and PowerPoint report generation

## 🚀 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **shadcn/ui** for premium UI components
- **Lucide React** for icons
- **React Leaflet** for mapping

### Backend & Database
- **Supabase** for backend services
- **PostgreSQL** with PostGIS for geospatial data
- **Supabase Storage** for file uploads
- **Supabase Auth** for user management

### AI & External APIs
- **OpenRouter API** for AI recommendations and SWOT analysis
- **OpenStreetMap Nominatim** for reverse geocoding
- **Overpass API** for infrastructure data
- **GeoNames** for population data

### Libraries & Tools
- **Papa Parse** for CSV processing
- **XLSX** for Excel file handling
- **pptxgenjs** for PowerPoint export
- **React Query** for data fetching
- **React Router DOM** for navigation

## 🛠️ Setup & Installation

### Prerequisites
- Node.js 18+ and npm
- Supabase account
- OpenRouter API account (for AI features)

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/locationai.git
cd locationai
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables
Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenRouter API Configuration (Required for AI Features)
# Get your API key from: https://openrouter.ai/keys
VITE_OPENROUTER_API_KEY=your_openrouter_api_key
```

### 4. Supabase Setup

#### Database Schema
Run these SQL commands in your Supabase SQL editor:

```sql
-- Enable PostGIS extension for geospatial operations
CREATE EXTENSION IF NOT EXISTS postgis;

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.settings.jwt_secret" TO 'your-jwt-secret';

-- Create tables
CREATE TABLE public.suppliers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    supplier_name TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    dataset_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.offices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    office_name TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.datasets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    file_size INTEGER,
    upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    supplier_count INTEGER DEFAULT 0
);

CREATE TABLE public.analyses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    dataset_id UUID REFERENCES public.datasets(id) ON DELETE CASCADE,
    office_id UUID REFERENCES public.offices(id) ON DELETE CASCADE,
    radius_km DOUBLE PRECISION NOT NULL,
    suppliers_count INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.datasets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analyses ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
CREATE POLICY "Users can only see their own suppliers" ON public.suppliers
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only see their own offices" ON public.offices
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only see their own datasets" ON public.datasets
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only see their own analyses" ON public.analyses
    FOR ALL USING (auth.uid() = user_id);
```

#### Storage Setup
1. Create a new bucket called `supplier-files` in Supabase Storage
2. Set up RLS policies for the bucket:

```sql
-- Storage RLS Policy
CREATE POLICY "Users can upload their own files" ON storage.objects
    FOR INSERT WITH CHECK (auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own files" ON storage.objects
    FOR SELECT USING (auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own files" ON storage.objects
    FOR DELETE USING (auth.uid()::text = (storage.foldername(name))[1]);
```

### 5. Development Server
```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## 🚀 Deployment

### Deploy to Vercel

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Connect to Vercel**
   - Visit [vercel.com](https://vercel.com)
   - Sign in with GitHub
   - Import your repository
   - Configure environment variables in Vercel dashboard

3. **Environment Variables in Vercel**
   Add these in your Vercel project settings:
   ```
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_OPENROUTER_API_KEY=your_openrouter_api_key
   ```

4. **Deploy**
   Vercel will automatically deploy your app. Your live URL will be provided.

### Custom Domain (Optional)
- Add your custom domain in Vercel project settings
- Configure DNS records as instructed by Vercel

## 📱 Usage Guide

### Getting Started
1. **Sign Up** - Create your account on the landing page
2. **Upload Data** - Import your supplier data (Excel/CSV format)
3. **Add Offices** - Define potential regional office locations
4. **Analyze** - Run analysis to see supplier coverage and rankings
5. **Visualize** - Explore results on interactive maps
6. **Get Insights** - Generate AI recommendations and SWOT analysis
7. **Export** - Download reports in CSV, Excel, or PowerPoint format

### Data Format
Your supplier data file should include:
- `supplier_name` - Name of the supplier
- `supplier_coords` - Coordinates in "lat,lon" format (e.g., "40.7128,-74.0060")

Example CSV:
```csv
supplier_name,supplier_coords
Acme Corp,"40.7128,-74.0060"
Tech Solutions,"34.0522,-118.2437"
Global Supplies,"41.8781,-87.6298"
```

## 🎯 Features Deep Dive

### AI Analysis Engine
- **Strategic Recommendations** - Analyzes supplier density, geographic factors, and business context
- **SWOT Analysis** - Evaluates strengths, weaknesses, opportunities, and threats for each location
- **Risk Assessment** - Identifies potential challenges and suggests mitigation strategies

### Mapping & Visualization
- **Interactive Maps** - Pan, zoom, and explore your data geographically
- **Coverage Circles** - Visual representation of supplier coverage radius
- **Color-coded Markers** - Suppliers colored by coverage status
- **Multi-layer Analysis** - Compare multiple office locations simultaneously

### Contextual Intelligence
- **Reverse Geocoding** - Automatic address lookup for coordinates
- **Infrastructure Data** - Nearby railways, airports, and highways
- **Demographics** - Population and economic data for strategic planning

## 🔐 Security & Privacy

### Data Protection
- **User Isolation** - Each user's data is completely isolated
- **Encryption** - All data encrypted in transit and at rest
- **GDPR Compliant** - Full compliance with privacy regulations
- **Secure Authentication** - Industry-standard security practices

### Infrastructure
- **Supabase Security** - Enterprise-grade database security
- **Vercel Hosting** - Secure, scalable edge deployment
- **API Protection** - Rate limiting and secure API access

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Documentation
- [Setup Guide](docs/setup.md)
- [API Reference](docs/api.md)
- [Deployment Guide](docs/deployment.md)

### Community
- [GitHub Issues](https://github.com/your-username/locationai/issues)
- [Discussions](https://github.com/your-username/locationai/discussions)
- Email: support@locationai.com

### Troubleshooting
- [Common Issues](docs/troubleshooting.md)
- [FAQ](docs/faq.md)

## 🌟 Acknowledgments

- [Supabase](https://supabase.com) for backend infrastructure
- [OpenRouter](https://openrouter.ai) for AI capabilities
- [OpenStreetMap](https://openstreetmap.org) for mapping data
- [Tailwind CSS](https://tailwindcss.com) for styling
- [shadcn/ui](https://ui.shadcn.com) for UI components

---

**Built with ❤️ for strategic decision makers**

[🌐 Live Demo](https://your-app.vercel.app) | [📧 Contact](mailto:hello@locationai.com) | [🐦 Twitter](https://twitter.com/locationai)