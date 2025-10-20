# AMPRE API Quick Setup Guide

## 🚀 Quick Start (3 Steps)

### Step 1: Add Your API Token
Open `.env.local` and replace the placeholder:
```bash
AMPRE_API_TOKEN=eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ2ZW5kb3Jc...your_actual_token_here
```

### Step 2: Restart Your Development Server
```bash
# Stop your current server (Ctrl+C)
# Then restart:
npm run dev
```

### Step 3: Test It!
Open your app and ask the avatar:
- "Show me condos in Toronto"
- "Find houses under $2M"
- "3 bedroom homes in Mississauga"

That's it! Your app will now fetch live MLS listings from AMPRE.

---

## 📝 Where to Get Your API Token

From your Postman collection, the token format looks like:
```
eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ2ZW5kb3JcL3RycmViXC83IiwiYXVkIjoiQW1wVXNlcnNVYXQiLCJyb2xlcyI6WyJBbXBWZW5kb3IiXSwiaXNzIjoiYW1wcmUudXMiLCJleHAiOjE3MDIxNjgyNjQsImlhdCI6MTY4NjYxMjY2OSwic3ViamVjdFR5cGUiOiJ2ZW5kb3IiLCJzdWJqZWN0S2V5IjoiNyIsImp0aSI6IjA3NDBlMzUzOTU4N2JmNGMiLCJjdXN0b21lck5hbWUiOiJ0cnJlYiJ9.At5kSygoqjUh4fhXgzpAtkIVMNANNzA0zFMMfknKsCE
```

**Note**: The token in your Postman collection appears to be expired (exp: 1702168264 = Dec 2023). You'll need to get a fresh token.

### How to Get a New Token:

#### Option 1: Contact AMPRE
- Website: https://syndication.ampre.ca/sso/start
- Email: support@ampre.ca
- Request: "I need a Bearer token for TREB MLS data access via OData API"

#### Option 2: Through Your Broker
- Contact your broker/office manager
- Ask for AMPRE API credentials
- They may have existing access to TREB data feeds

#### Option 3: TREB Direct
- Email: dataagreements@trreb.ca
- Phone: 416-443-8131
- Mention: "Andrew Pisani, Right at Home Realty, requesting API access"

---

## 🧪 Testing Without Token

The app works without a token! It will use sample listings automatically.

You can test all features:
- ✅ Chat with the AI avatar
- ✅ Search for properties
- ✅ View listings
- ✅ See property details

The only difference: Sample data instead of live MLS data.

---

## 🔍 API Endpoints Reference

### Fetch Properties
```javascript
GET https://query.ampre.ca/odata/Property?$top=50&$filter=StandardStatus eq 'Active'
Authorization: Bearer YOUR_TOKEN
```

### Fetch Property Images
```javascript
GET https://query.ampre.ca/odata/Media?$filter=ResourceRecordKey eq 'W9002096'
Authorization: Bearer YOUR_TOKEN
```

### Available Filters
```javascript
// Property Type
PropertyType eq 'Condominium'
PropertyType eq 'Residential'

// Price Range
ListPrice ge 1000000 and ListPrice le 2000000

// Bedrooms/Bathrooms
BedroomsTotal ge 3
BathroomsTotalInteger ge 2

// Location
contains(City,'TORONTO')
contains(UnparsedAddress,'WATERFRONT')

// Status
StandardStatus eq 'Active'
```

---

## 📊 Example Queries

### 1. Condos in Toronto under $2M
```
$filter=PropertyType eq 'Condominium' 
  and ListPrice le 2000000 
  and contains(City,'TORONTO')
  and StandardStatus eq 'Active'
&$top=50
&$orderby=ListPrice asc
```

### 2. Houses with 3+ Bedrooms
```
$filter=PropertyType eq 'Residential'
  and BedroomsTotal ge 3
  and StandardStatus eq 'Active'
&$top=50
```

### 3. Waterfront Properties
```
$filter=contains(PublicRemarks,'WATERFRONT')
  and StandardStatus eq 'Active'
&$top=50
```

---

## 🐛 Troubleshooting

### "Using sample listings" message appears
✅ This is normal! It means your token isn't configured yet.
- Check `.env.local` exists in your project root
- Make sure `AMPRE_API_TOKEN` is set (not `your_token_here`)
- Restart your dev server after adding the token

### "401 Unauthorized" error
❌ Your token is invalid or expired
- Get a fresh token from AMPRE
- Check token has no extra spaces or line breaks
- Token should start with "eyJ..."

### "No properties found"
🤔 Your search criteria might be too restrictive
- Try broader searches (remove filters)
- Check the location name spelling
- View console logs to see the OData query

### Images not loading
🖼️ Media endpoint might have issues
- Check network tab in browser DevTools
- Verify image URLs are accessible
- System will fallback to placeholder images

---

## 📱 Test the API Directly

### Using cURL:
```bash
curl -X GET "https://query.ampre.ca/odata/Property?\$top=5" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Accept: application/json"
```

### Using Postman:
1. Import the Postman collection you provided
2. Update the token in the Authorization tab
3. Try the "Top Five Property Records" request

### Using Browser:
```
https://query.ampre.ca/odata/Property?$top=5
```
(Won't work without token, but you can check if the endpoint is reachable)

---

## 🔒 Security Best Practices

### ✅ DO:
- Keep `.env.local` in `.gitignore` (already done)
- Never commit your API token to Git
- Use environment variables for tokens
- Regenerate tokens periodically

### ❌ DON'T:
- Share tokens publicly
- Hardcode tokens in source files
- Commit `.env.local` to version control
- Use production tokens in development

---

## 📈 Next Steps

1. **Get your token** from AMPRE or your broker
2. **Add it to `.env.local`**
3. **Test with live data**
4. **Deploy to production** (add token to Netlify env vars)

### Deployment to Netlify:
1. Go to Netlify dashboard
2. Site settings → Environment variables
3. Add:
   - Key: `AMPRE_API_TOKEN`
   - Value: `your_token_here`
4. Redeploy your site

---

## 💡 Pro Tips

### Optimize for Speed
```javascript
// Only fetch fields you need
$select=ListingKey,ListPrice,BedroomsTotal,UnparsedAddress

// Limit results
$top=20  // Instead of 50 or 100

// Order by recent first
$orderby=ModificationTimestamp desc
```

### Cache Responses (Optional)
Consider adding caching to reduce API calls:
```javascript
// In pages/api/listings.js
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
```

### Monitor Usage
- Check AMPRE dashboard for API usage stats
- Set up alerts for rate limits
- Log errors for debugging

---

## 📞 Support

### Technical Issues
- Check `/pages/api/listings.js` console logs
- Review browser DevTools Network tab
- Test API directly with cURL

### AMPRE API Support
- Website: https://syndication.ampre.ca
- Email: support@ampre.ca
- Documentation: https://docs.ampre.ca

### TREB Support
- Email: dataagreements@trreb.ca
- Phone: 416-443-8131

### Andrew Pisani
- Phone: 416-882-9304
- Brokerage: Right at Home Realty

---

**Last Updated**: October 18, 2025  
**Status**: Ready for token configuration  
**API Version**: RESO Web API (OData)

