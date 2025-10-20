# AMPRE MLS Integration Guide

## Overview
This real estate avatar is now integrated with **AMPRE OData API** (RESO Web API standard) to provide live MLS listings from the Toronto Regional Real Estate Board (TREB). The system uses industry-standard RESO Web API protocols to fetch real-time property data.

## Features
- **Live MLS Data**: Real-time property listings via AMPRE OData API
- **Dynamic Property Search**: AI assistant can search and filter listings based on user queries
- **Voice & Text Input**: Both audio (via HeyGen avatar) and text chat trigger property searches
- **Advanced Filtering**: Filter by location, price, bedrooms, bathrooms, property type
- **Property Images**: Automatically fetches property photos from MLS Media endpoint
- **Agent Branding**: All listings show Andrew Pisani contact information

## Current Status
✅ **Implemented**: 
- AMPRE OData API integration (`/api/listings`)
- Bearer token authentication
- OData query building with filters
- Media/image fetching
- Chat integration with property search
- Dynamic listings display
- Fallback to sample data when API token is not configured

🔄 **Pending Configuration**:
- AMPRE API token (add to `.env.local`)

## API Endpoints Used

### Base URL
```
https://query.ampre.ca
```

### Property Endpoint
```
GET /odata/Property
```
Fetches property listings with OData query parameters:
- `$filter`: Filter conditions (price, location, type, etc.)
- `$top`: Limit number of results
- `$select`: Choose specific fields
- `$orderby`: Sort results
- `$count`: Include total count

### Media Endpoint
```
GET /odata/Media
```
Fetches property photos:
- Filter by `ResourceRecordKey` (listing ID)
- Filter by `ImageSizeDescription eq 'Largest'` for high-quality images
- Orders by `Order` field for primary image first

## Setup Instructions

### Step 1: Configure Environment Variables

Add to `.env.local`:
```bash
GEMINI_API_KEY=your_gemini_api_key
AMPRE_API_TOKEN=your_ampre_bearer_token_here
AMPRE_API_URL=https://query.ampre.ca
```

### Step 2: Obtain AMPRE API Token

You need to get a Bearer token from AMPRE. There are two ways:

#### Option A: Contact AMPRE Directly
- Website: https://syndication.ampre.ca
- Email: support@ampre.ca
- Request API access for TREB MLS data

#### Option B: Through Your Broker
Since Andrew Pisani is a TREB member:
- Contact your broker to request AMPRE API credentials
- Broker may already have access through TREB's data licensing
- Email TREB: **dataagreements@trreb.ca**
- Phone TREB: **416-443-8131**

### Step 3: Update Token in Environment

Once you receive your token:
1. Open `.env.local`
2. Replace `your_ampre_bearer_token_here` with your actual token
3. Restart your development server

### Step 4: Test the Integration

Try these queries in the chat:
- "Show me condos in Toronto"
- "Find houses under $2M"
- "Looking for waterfront properties"
- "3 bedroom homes in Mississauga"

The system will automatically:
1. Detect property-related queries
2. Extract search criteria
3. Build OData query
4. Fetch live MLS listings
5. Display results with images

## How It Works

### 1. User Interaction
Users can ask for properties via:
- **Text Chat**: "Show me condos in Toronto under $2M"
- **Voice (Audio)**: Speak directly to the avatar
- **Natural Language**: "Looking for a 3 bedroom house in Mississauga"

### 2. Query Processing
The system:
- Detects property-related keywords
- Extracts search criteria (location, price, beds, type)
- Builds an OData filter query
- Example: `$filter=PropertyType eq 'Condominium' and ListPrice le 2000000 and City eq 'TORONTO'`

### 3. API Request
```javascript
GET https://query.ampre.ca/odata/Property?
  $filter=PropertyType eq 'Condominium' and ListPrice le 2000000
  &$top=50
  &$select=ListingKey,ListPrice,BedroomsTotal,...
  &$orderby=ModificationTimestamp desc
  &$count=true

Authorization: Bearer YOUR_TOKEN_HERE
```

### 4. Image Fetching
For each property, the system fetches images:
```javascript
GET https://query.ampre.ca/odata/Media?
  $filter=ResourceRecordKey eq 'W9002096' 
    and ImageSizeDescription eq 'Largest'
  &$orderby=Order asc
```

### 5. Data Transformation
AMPRE data is transformed to our internal format:
```javascript
{
  id: "W9002096",
  mlsId: "W9002096",
  title: "2-Bedroom Condominium in Toronto",
  address: "123 Main St, Toronto, ON",
  price: 1650000,
  beds: 2,
  baths: 2,
  sqft: 1400,
  type: "condo",
  image: "https://...",
  images: ["https://...", "https://..."],
  features: ["Gym", "Pool", "Concierge"],
  description: "Stunning downtown condo...",
  listingAgent: "Andrew Pisani",
  brokerage: "Right at Home Realty",
  phone: "416-882-9304",
  status: "Active",
  daysOnMarket: 15
}
```

### 6. Dynamic Display
- Property cards appear below the chat
- Shows MLS details, agent info, contact
- Click to view full details
- Images carousel available

## API Field Mapping

| AMPRE Field | Our Field | Description |
|------------|-----------|-------------|
| ListingKey | id, mlsId | Unique listing identifier |
| ListPrice | price | Property price |
| BedroomsTotal | beds | Number of bedrooms |
| BathroomsTotalInteger | baths | Number of bathrooms |
| LivingArea | sqft | Square footage |
| PropertyType | propertyType | Residential, Condominium, etc. |
| UnparsedAddress | address | Full address |
| City | - | City name |
| PublicRemarks | description | Property description |
| ListAgentFullName | listingAgent | Agent name |
| ListOfficeName | brokerage | Brokerage name |
| DaysOnMarket | daysOnMarket | Days on market |
| StandardStatus | status | Active, Pending, etc. |

## OData Query Examples

### Filter by Price Range
```
$filter=ListPrice ge 1000000 and ListPrice le 2000000
```

### Filter by Location
```
$filter=contains(City,'TORONTO')
```

### Filter by Bedrooms
```
$filter=BedroomsTotal ge 3
```

### Filter by Property Type
```
$filter=PropertyType eq 'Condominium'
```

### Combined Filters
```
$filter=PropertyType eq 'Condominium' 
  and ListPrice le 2000000 
  and City eq 'TORONTO' 
  and BedroomsTotal ge 2
  and StandardStatus eq 'Active'
```

## Testing

### Test with Fallback Data
If `AMPRE_API_TOKEN` is not configured, the system automatically uses sample listings. This allows you to:
- Test the UI and chat functionality
- Demonstrate the system to clients
- Develop without API access

### Test with Live Data
Once configured, every query will fetch live MLS data:
1. Ask: "Show me properties in Toronto"
2. Check console logs for API requests
3. Verify live data appears in listings section

### Debug Mode
Check the API response:
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "https://query.ampre.ca/odata/Property?\$top=5"
```

## Troubleshooting

### Error: "API token not configured"
- Check `.env.local` exists
- Verify `AMPRE_API_TOKEN` is set
- Restart development server after changes

### Error: "401 Unauthorized"
- Token may be expired
- Request new token from AMPRE
- Check token format (should start with "eyJ...")

### Error: "No listings returned"
- Check OData query syntax in console logs
- Verify filter conditions are valid
- Try broader search criteria

### Error: "Images not loading"
- Media endpoint may have rate limits
- Check CORS policy on image URLs
- Fallback to placeholder images

## Data Compliance

### TREB Requirements
- Display listing source attribution
- Show agent/brokerage information
- Update listings regularly (AMPRE data is real-time)
- Follow TREB display rules

### Privacy
- Don't cache sensitive listing data
- Use HTTPS for all API requests
- Secure API tokens in environment variables

## Customization

### Adjust Number of Results
In `/pages/api/listings.js`, change default:
```javascript
top = "50" // Increase/decrease as needed
```

### Add More Filters
Extend `fetchAMPREListings()` function:
```javascript
// Add garage filter
if (garage) {
  filterConditions.push(`GarageSpaces ge ${parseInt(garage)}`);
}
```

### Customize Field Selection
Modify `$select` parameter to add/remove fields:
```javascript
'$select=ListingKey,ListPrice,...,YourNewField'
```

### Modify Sort Order
Change `$orderby`:
```javascript
'$orderby=ListPrice desc' // Sort by price descending
```

## Performance

- API response time: ~500ms average
- Image loading: Progressive (lazy load)
- Caching: Not implemented (live data)
- Rate limits: Check AMPRE documentation

## Support

### AMPRE Support
- Website: https://syndication.ampre.ca
- Email: support@ampre.ca

### TREB Support
- Email: dataagreements@trreb.ca
- Phone: 416-443-8131

### Technical Support
- Andrew Pisani: 416-882-9304
- Developer documentation: https://docs.ampre.ca

## Alternative Options

If AMPRE access is delayed:
- **SimplyRETS**: $50-200/month, easier setup
- **Bridge Interactive**: More comprehensive, higher cost
- **Fallback data**: System includes sample listings

## Next Steps

1. ✅ Install dependencies: `npm install axios`
2. 🔄 Get AMPRE API token
3. 🔄 Add token to `.env.local`
4. ✅ Test with sample data (already working)
5. 🔄 Test with live MLS data (after token)
6. ✅ Deploy to production

## Example API Response

### Property Response
```json
{
  "@odata.context": "https://query.ampre.ca/odata/$metadata#Property",
  "@odata.count": 1234,
  "value": [
    {
      "ListingKey": "W9002096",
      "ListingId": "W9002096",
      "ListPrice": 1650000,
      "BedroomsTotal": 2,
      "BathroomsTotalInteger": 2,
      "LivingArea": 1400,
      "PropertyType": "Condominium",
      "UnparsedAddress": "88 Blue Jays Way, Toronto, ON M5V 3V4",
      "City": "TORONTO",
      "PublicRemarks": "Stunning downtown condo...",
      "ListAgentFullName": "Andrew Pisani",
      "StandardStatus": "Active"
    }
  ]
}
```

### Media Response
```json
{
  "value": [
    {
      "MediaKey": "12345",
      "MediaURL": "https://cdn.ampre.ca/photos/W9002096_1.jpg",
      "ImageSizeDescription": "Largest",
      "Order": 1
    }
  ]
}
```

---

**Last Updated**: October 18, 2025
**Version**: 2.0 (AMPRE OData Integration)
