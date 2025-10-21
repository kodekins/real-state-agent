# Real Estate Avatar - Andrew Pisani

## 🎭 AI Avatar + Live MLS Integration

This AI-powered real estate assistant features a **HeyGen AI Avatar** that speaks responses and connects to **live MLS data** through the AMPRE API. Andrew Pisani's virtual assistant provides real-time property information with voice interaction.

### ✨ Features

- **🎭 HeyGen AI Avatar**: Interactive avatar that speaks responses in real-time
- **🏠 Live MLS Data**: Real-time property listings from AMPRE API (TREB MLS)
- **🤖 Smart AI**: Gemini-powered conversation with property search intelligence
- **🗣️ Voice Responses**: Avatar speaks all responses with natural language
- **📋 Dynamic Listings**: Beautiful property cards with images and full details
- **🔍 Advanced Search**: Filter by price, location, bedrooms, bathrooms, property type
- **📱 Mobile Ready**: Responsive design for all devices

### 🚀 How It Works

1. **User Query**: Type or speak to the avatar (e.g., "Show me condos in Toronto under $2M")
2. **AI Processing**: Gemini AI analyzes query and extracts search parameters
3. **MLS Search**: AMPRE API fetches live listings from Toronto Regional Real Estate Board
4. **Avatar Response**: HeyGen avatar speaks the results naturally
5. **Visual Display**: Property cards appear below with full details
6. **Interactive**: Click properties for detailed modal view with contact options

### 🧪 Test Queries

Try these sample queries to see the live listings in action:

- "Show me properties in Toronto"
- "Find condos under $1.5M" 
- "I'm looking for a 3-bedroom house"
- "What luxury homes are available?"
- "Show me waterfront properties"
- "Find houses in Mississauga"

### 🔧 Technical Implementation

#### Avatar Integration
- **HeyGen Component**: Custom React component with speech synthesis
- **PostMessage API**: Communication between iframe and application
- **Message Queue**: Sequential speech handling to prevent overlaps
- **Status Indicators**: Real-time online/speaking/idle states

#### Backend APIs
- **AMPRE MLS API**: Live Toronto Regional Real Estate Board listings
- **Gemini AI**: Natural language understanding and response generation
- **Smart Parameter Extraction**: AI-powered search criteria detection
- **OData Filtering**: Dynamic property filtering and sorting
- **Image Loading**: Parallel fetch of property images

#### Frontend
- **Interactive Avatar**: HeyGen-powered speaking avatar
- **Real-time Chat**: Conversation history and context awareness
- **Property Grid**: Responsive listing cards with hover effects
- **Detail Modals**: Full property information with image galleries
- **Contact Integration**: WhatsApp, phone, and Realtor.ca links

### 📱 API Endpoints

#### Chat with Avatar
```bash
POST /api/chat
```

**Request Body:**
```json
{
  "messages": [
    { "role": "user", "content": "Show me condos in Toronto under $1M" }
  ]
}
```

**Response:**
```json
{
  "reply": "Text response for display",
  "avatarSpeech": "Optimized speech text",
  "listings": [...],
  "hasListings": true,
  "searchDetected": true,
  "listingsCount": 12
}
```

#### HeyGen Streaming (Optional)
```bash
POST /api/heygen-stream
```

**Actions:** `start_session`, `speak`, `stop_session`

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
AMPRE_API_TOKEN=your_ampre_mls_token
AMPRE_API_URL=https://query.ampre.ca

# Optional: For advanced HeyGen features
HEYGEN_API_KEY=your_heygen_api_key
```

#### Testing
```bash
# Test the listings API
curl http://localhost:3000/api/listings?search=toronto

# Test the chat with property queries
# Visit http://localhost:3000 and ask about properties
```

### 📚 Documentation

- **[HEYGEN_INTEGRATION_GUIDE.md](HEYGEN_INTEGRATION_GUIDE.md)** - Complete setup and integration guide
- **[TEST_AVATAR_INTEGRATION.md](TEST_AVATAR_INTEGRATION.md)** - Testing procedures
- **[AVATAR_API_INTEGRATION_SUMMARY.md](AVATAR_API_INTEGRATION_SUMMARY.md)** - Integration overview

### 🎉 Features in Action

**Avatar Speaks:**
- Welcome messages on load
- Property search results
- Listing announcements
- Error messages and suggestions
- Natural conversation flow

**Live MLS Data:**
- Real-time TREB listings
- Property images and details
- MLS numbers and links
- Agent contact information
- Days on market statistics

**Smart Search:**
- "Show me condos in Toronto under $2M"
- "Find 3 bedroom houses in Mississauga"
- "Properties between $800k and $1.5M"
- "Commercial properties for sale"

---

**Powered by:**
- 🎭 HeyGen AI Avatar
- 🤖 Google Gemini AI
- 🏠 AMPRE MLS API (TREB)
- 💼 Andrew Pisani - Right at Home Realty

**Built by [kodekins.com](https://kodekins.com)** 🚀 