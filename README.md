# Route Optimizer MVP

A mobile-first route optimization application built with Next.js, Tailwind CSS, and Google Maps APIs.

## Features

- 🗺️ Interactive Google Maps integration
- 📍 Places Autocomplete for address inputs
- 🎯 Click-to-add waypoints on map
- 🔄 Route optimization with Google Routes API
- 📱 Mobile-first responsive design
- 🌙 Dark/light mode toggle
- 💾 Local storage for session persistence
- 🚀 One-click navigation to Google Maps

## Setup Instructions

### 1. Clone and Install

```bash
git clone https://github.com/jasminaaa20/smart-route.git
cd smart-route
npm install
```

### 2. Google Maps API Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the following APIs:
   - Maps JavaScript API
   - Places API
   - Routes API
   - Geocoding API
4. Create credentials (API Key)
5. Restrict the API key to your domain for security

### 3. Environment Variables

```bash
cp .env.example .env.local
```

Add your Google Maps API key to `.env.local`:

```bash
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
```

### 4. Install shadcn/ui Components

```bash
npx shadcn@latest init
npx shadcn@latest add button card input label collapsible
```

### 5. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## Project Structure

```txt
route-optimizer-mvp/
├── app/
│   ├── page.tsx              # Landing page
│   ├── optimize/
│   │   └── page.tsx          # Main route optimizer
│   ├── layout.tsx            # Root layout
│   └── globals.css           # Global styles
├── components/
│   ├── route-optimizer-map.tsx    # Google Maps component
│   ├── location-input-panel.tsx   # Input controls
│   ├── route-results.tsx          # Results display
│   ├── theme-toggle.tsx           # Dark mode toggle
│   └── ui/                        # shadcn/ui components
├── public/                        # Static assets
├── tailwind.config.js            # Tailwind configuration
├── next.config.js                # Next.js configuration
└── package.json                  # Dependencies
```

## Deployment on Vercel

### 1. Push to GitHub

```bash
git add .
git commit -m "Initial commit"
git push origin main
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### 2. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Add environment variable:
   - `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`: Your Google Maps API key
4. Deploy

### 3. Update API Key Restrictions

After deployment, update your Google Maps API key restrictions to include your Vercel domain.

## Usage

### Landing Page

- Clean hero section explaining the app
- Feature highlights with icons
- Call-to-action button to start optimizing

### Route Optimizer

- **Origin**: Required starting point
- **Waypoints**: Add multiple stops (via input or map clicks)
- **Destination**: Optional end point (defaults to origin for round trips)
- **Optimize**: Calculates best route order
- **Start Journey**: Opens optimized route in Google Maps app

### Mobile Experience

- Collapsible input panel to maximize map view
- Large touch targets for easy interaction
- Responsive design for all screen sizes
- Sticky action buttons at bottom

## API Integration

The app integrates with several Google Maps APIs:

- **Maps JavaScript API**: Interactive map display
- **Places API**: Address autocomplete suggestions
- **Routes API**: Route optimization with `optimizeWaypoints: true`
- **Geocoding API**: Convert coordinates to addresses

## Performance Optimizations

- Server Components for initial page loads
- Dynamic imports for Google Maps
- Image optimization with Next.js Image component
- Tailwind CSS for minimal bundle size
- Local storage for session persistence

## Security Considerations

- API key restricted to specific domains
- Client-side API calls only (no sensitive server operations)
- Input validation and error handling
- HTTPS enforcement in production

## Browser Support

- Modern browsers with ES6+ support
- Mobile Safari and Chrome optimized
- Progressive Web App capabilities ready

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly on mobile and desktop
5. Submit a pull request

## License

MIT License - see LICENSE file for details
