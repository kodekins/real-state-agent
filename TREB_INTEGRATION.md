# TREB RETS Integration Guide

## Overview
This real estate avatar now integrates with TREB (Toronto Regional Real Estate Board) RETS API to provide live MLS listings. Currently using hardcoded listings from Andrew Pisani's website as fallback until TREB credentials are obtained.

## Features
- **Dynamic Property Search**: AI assistant can search and return real listings based on user queries
- **Voice & Text Input**: Both audio (via HeyGen avatar) and text chat trigger property searches
- **Live MLS Data**: Once TREB credentials are set up, displays real-time listings
- **Agent Branding**: All listings show Andrew Pisani contact information

## Current Status
✅ **Implemented**: 
- Listings API endpoint (`/api/listings`)
- Chat integration with property search
- Dynamic listings display
- Hardcoded fallback data from Andrew Pisani's listings

🔄 **Pending TREB Credentials**:
- Live RETS API connection
- Real-time MLS data

## How It Works

### 1. User Interaction
Users can ask for properties via:
- **Text Chat**: "Show me condos in Toronto under $2M"
- **Voice (Audio)**: Speak directly to the avatar
- **Natural Language**: "Looking for a 3 bedroom house in Mississauga"

### 2. AI Processing
The AI assistant:
- Detects property-related queries
- Extracts search criteria (location, price, beds, type)
- Calls the listings API
- Returns formatted property recommendations

### 3. Dynamic Display
When listings are found:
- Property cards appear below the chat
- Shows MLS details, agent info, contact
- Click to view on external website

## Setting Up TREB RETS API

### Step 1: Contact TREB
Since Andrew is a TREB member, his broker needs to:
- Email: **dataagreements@trreb.ca**
- Phone: **416-443-8131**
- Request API access through PropTx system: https://syndication.ampre.ca/sso/start

### Step 2: Sign Agreements
Broker must sign:
- TREB Data License Agreement
- TREB IDX Feed Agreement (for public display)
- TREB VOW Data Agreement (for client-only data)

### Step 3: Environment Variables
Add to `.env.local`:
```bash
GEMINI_API_KEY=your_gemini_api_key
TREB_RETS_URL=https://rets.trreb.ca/Login.asmx/Login
TREB_USERNAME=provided_by_treb
TREB_PASSWORD=provided_by_treb
```

### Step 4: Install RETS Client
```bash
npm install node-rets
```

### Step 5: Update API
Uncomment RETS code in `/pages/api/listings.js` and replace hardcoded data.

## Testing

### Current Testing (Hardcoded Data)
Try these queries:
- "Show me condos in Toronto"
- "Find houses under $2M"
- "Looking for waterfront properties"
- "3 bedroom homes in Mississauga"

### After TREB Setup
The same queries will return live MLS data.

## Customization

### Adding More Hardcoded Listings
Edit the `hardcodedListings` array in `/pages/api/listings.js`

### Modifying Search Logic
Update `extractSearchParams()` function in `/pages/api/chat.js`

### Styling Listings
Modify the listings grid in `/pages/index.js`

## Support

For TREB integration support:
- **Andrew Pisani**: 416-882-9304
- **TREB Support**: dataagreements@trreb.ca
- **Technical Issues**: Contact your developer

## Alternative Options

If TREB approval is delayed, consider:
- **SimplyRETS**: $50-200/month, easier setup
- **Bridge Interactive**: More comprehensive, higher cost
- **Web scraping**: Not recommended (legal/reliability issues) 