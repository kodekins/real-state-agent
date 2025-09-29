# Real Estate Avatar - Andrew Pisani

## 🏠 Live Listings Integration

This AI-powered real estate assistant now features **live listings integration** directly from Andrew Pisani's website at **andrewpisani.com**.

### ✨ Features

- **Live Data Scraping**: Real-time property listings from andrewpisani.com
- **Smart Search**: AI detects property queries and fetches relevant listings
- **Beautiful Display**: Modern property cards with images, details, and contact info
- **Fallback System**: Quality sample listings if live data is temporarily unavailable
- **Multiple Sources**: Integrates with Right at Home Realty and other sources

### 🚀 How It Works

1. **User Query**: Ask about properties (e.g., "Show me condos in Toronto under $2M")
2. **AI Detection**: System detects property-related queries automatically
3. **Live Scraping**: Fetches current listings from Andrew's website
4. **Smart Response**: AI provides personalized property recommendations
5. **Visual Display**: Beautiful property cards appear in the listings section

### 🧪 Test Queries

Try these sample queries to see the live listings in action:

- "Show me properties in Toronto"
- "Find condos under $1.5M" 
- "I'm looking for a 3-bedroom house"
- "What luxury homes are available?"
- "Show me waterfront properties"
- "Find houses in Mississauga"

### 🔧 Technical Implementation

#### Backend
- **Web Scraping**: Uses Cheerio + Axios for reliable data extraction
- **Multiple Endpoints**: Scrapes various pages from andrewpisani.com
- **Smart Parsing**: Intelligent extraction of property details
- **Error Handling**: Graceful fallbacks when scraping fails
- **Filtering**: Real-time filtering by price, location, beds, baths, type

#### Frontend
- **Live Property Cards**: Dynamic display of scraped listings
- **Agent Branding**: All listings show Andrew Pisani's contact information
- **Click-to-View**: Direct links to full property details
- **Responsive Design**: Beautiful display on all devices

### 📱 API Endpoints

#### Get Live Listings
```bash
GET /api/listings
```

**Query Parameters:**
- `search` - General search term
- `location` - Specific location filter
- `type` - Property type (condo, house, townhouse, etc.)
- `minPrice` - Minimum price filter
- `maxPrice` - Maximum price filter
- `beds` - Minimum number of bedrooms
- `baths` - Minimum number of bathrooms

**Example Response:**
```json
{
  "success": true,
  "count": 3,
  "listings": [
    {
      "id": "AP001",
      "mlsId": "C5123456", 
      "title": "Luxury Downtown Toronto Condo",
      "address": "88 Blue Jays Way, Toronto, ON",
      "price": 1650000,
      "beds": 2,
      "baths": 2,
      "sqft": 1400,
      "type": "condo",
      "features": ["Concierge", "Gym", "Pool"],
      "listingAgent": "Andrew Pisani",
      "phone": "416-882-9304",
      "url": "https://www.andrewpisani.com/listing/C5123456"
    }
  ],
  "source": "live",
  "website": "andrewpisani.com",
  "lastUpdated": "2025-01-29T14:03:26.000Z"
}
```

### 🎯 Data Sources

1. **Primary**: andrewpisani.com (Andrew's main website)
2. **Secondary**: Right at Home Realty listings
3. **Fallback**: High-quality sample listings

### 🔄 Real-time Updates

The system automatically:
- Scrapes fresh data on each request
- Caches results briefly for performance
- Falls back to quality samples if scraping fails
- Logs all scraping attempts for monitoring

### 📞 Contact Information

All listings display Andrew Pisani's contact details:
- **Phone**: 416-882-9304
- **Brokerage**: Right at Home Realty, Brokerage
- **Website**: andrewpisani.com

### 🛠️ Development

#### Setup
```bash
npm install
npm run dev
```

#### Environment Variables
```bash
GEMINI_API_KEY=your_gemini_api_key
```

#### Testing
```bash
# Test the listings API
curl http://localhost:3000/api/listings?search=toronto

# Test the chat with property queries
# Visit http://localhost:3000 and ask about properties
```

---

**Powered by Andrew Pisani - Right at Home Realty** 🏡 