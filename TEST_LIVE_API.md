# 🧪 Testing Live AMPRE API Integration

## ✅ Your API Token is Configured!

Great! Your token has been added to `.env.local` and expires in 2054, so you're all set for a long time!

---

## 🚀 Quick Test

### Step 1: Start Your Dev Server
```bash
npm run dev
```

### Step 2: Test the API Directly

Open your browser and go to:
```
http://localhost:3000/api/listings
```

You should see live MLS data with a response like:
```json
{
  "success": true,
  "count": 50,
  "listings": [...],
  "source": "live_mls",
  "message": "Live MLS listings from AMPRE"
}
```

---

## 🔍 Test Different Filters

### By Location - Toronto
```
http://localhost:3000/api/listings?location=toronto
```

### By Price Range - Under $2M
```
http://localhost:3000/api/listings?maxPrice=2000000
```

### By Property Type - Condos
```
http://localhost:3000/api/listings?type=condo
```

### By Bedrooms - 3+
```
http://localhost:3000/api/listings?beds=3
```

### Combined Filters
```
http://localhost:3000/api/listings?location=toronto&type=condo&maxPrice=2000000&beds=2
```

---

## 🤖 Test with AI Chat

### Open the App
```
http://localhost:3000
```

### Try These Queries:

1. **"Show me condos in Toronto"**
   - Should return Toronto condos
   - Property cards should appear below chat

2. **"Find houses under $2M"**
   - Should return houses priced under $2M
   - Should show actual MLS listings

3. **"3 bedroom homes in Mississauga"**
   - Should return 3+ bedroom properties in Mississauga
   - Should display with real images

4. **"Looking for waterfront properties"**
   - Should search PublicRemarks for "waterfront"
   - Shows properties mentioning waterfront

5. **"Properties in The Beaches"**
   - Should search by neighborhood
   - Returns properties in that area

---

## 📊 Check the Console

Open your browser DevTools (F12) and check the Console tab. You should see:

```
Fetching from AMPRE API: https://query.ampre.ca/odata/Property?$top=50...
Fetched 50 of 1234 total properties from AMPRE
Setting listings: [{...}, {...}, ...]
Displaying 50 listings from live search
```

---

## 🎯 What to Verify

### ✅ Data Quality Checklist:

1. **Real MLS Numbers**: Check that `mlsId` shows actual MLS numbers (not AP001, AP002)
2. **Real Addresses**: Verify addresses are real Toronto area properties
3. **Real Prices**: Check prices are realistic (not sample data)
4. **Real Images**: Images should load from AMPRE CDN (not placeholder)
5. **Real Descriptions**: Property descriptions should be detailed and unique
6. **Agent Info**: All listings should show "Andrew Pisani" and "416-882-9304"
7. **Status**: Should show "Active" or actual MLS status
8. **Days on Market**: Should show real numbers

### ✅ Functionality Checklist:

1. **Filters Work**: Test each filter (location, price, beds, type)
2. **Search Works**: General search finds properties
3. **Images Load**: Property photos display correctly
4. **No Errors**: Check console for errors
5. **Fast Response**: API responds within 1-2 seconds
6. **Fallback Works**: If API fails, shows sample data

---

## 🐛 Troubleshooting

### Issue: "Using sample listings" message
**Cause**: API token not being read  
**Fix**: 
1. Check `.env.local` exists in project root
2. Verify no extra spaces in token
3. Restart dev server: `Ctrl+C` then `npm run dev`

### Issue: "401 Unauthorized"
**Cause**: Token invalid or expired  
**Fix**: Your token expires in 2054, so this shouldn't happen. If it does, check the token wasn't modified.

### Issue: No images loading
**Cause**: Media endpoint might be rate limited  
**Fix**: 
1. Check console for Media endpoint errors
2. Images will fallback to placeholders automatically
3. Try reducing the number of results with `?top=10`

### Issue: Empty results
**Cause**: Filters too restrictive  
**Fix**: 
1. Check the console log showing the OData query
2. Try broader searches (just location, no other filters)
3. Test: `http://localhost:3000/api/listings?location=toronto`

### Issue: Slow response
**Cause**: Fetching images for many properties  
**Fix**: 
1. Reduce `top` parameter: `?top=20`
2. Images fetch in parallel, so shouldn't be too slow
3. Check your internet connection

---

## 📋 Sample Test Results

### Expected API Response Structure:
```json
{
  "success": true,
  "count": 3,
  "listings": [
    {
      "id": "E12360372",
      "mlsId": "A00001796",
      "title": "Sale Of Business in Toronto",
      "address": "2144A Queen Street E, Toronto E02, ON M4E 1E3",
      "price": 79779,
      "beds": 0,
      "baths": 0,
      "sqft": 0,
      "type": "commercial",
      "propertyType": "Sale Of Business",
      "image": "https://cdn.ampre.ca/...",
      "images": ["https://cdn.ampre.ca/..."],
      "features": ["Premium Location", "Professional Service"],
      "description": "Turn-Key Nail Bar for Sale in the Heart of The Beaches...",
      "listingAgent": "Andrew Pisani",
      "brokerage": "SKYBOUND REALTY",
      "phone": "416-882-9304",
      "status": "New",
      "daysOnMarket": 0,
      "possession": "Immediate",
      "url": "https://www.andrewpisani.com/listing/E12360372",
      "source": "ampre_mls",
      "lastModified": "2025-08-22T22:17:37Z",
      "transactionType": "For Sale"
    }
  ],
  "source": "live_mls",
  "message": "Live MLS listings from AMPRE",
  "lastUpdated": "2025-10-18T...",
  "apiProvider": "AMPRE OData"
}
```

---

## 🎨 Visual Verification

### In the UI:
1. **Property Cards** should show:
   - Real property photo (not placeholder)
   - Real MLS number in purple badge
   - Real price in cyan
   - Property details (beds, baths, sqft)
   - Real address
   - Andrew Pisani as agent
   - 416-882-9304 phone number

2. **Chat Should**:
   - Respond with property recommendations
   - Reference specific MLS numbers
   - Mention real addresses
   - Provide Andrew's contact info
   - Scroll to listings automatically

---

## 🔄 API Query Examples

Based on your sample response, here are the actual fields being used:

### City Field
- Value: `"Toronto E02"`, `"Toronto E01"`, etc.
- Filter: `contains(City, 'Toronto')`
- Note: City includes region code, so we use `contains` not exact match

### Property Type
- Values: `"Commercial"`, `"Residential"`
- Filter: `PropertyType eq 'Residential'`

### Property SubType
- Values: `"Sale Of Business"`, `"Condo Apartment"`, `"Detached"`, etc.
- Filter: `contains(tolower(PropertySubType), 'condo')`

### Price
- Field: `ListPrice`
- Type: Number (e.g., `79779`)
- Filter: `ListPrice le 2000000`

### Bedrooms
- Field: `BedroomsTotal`
- Also: `BedroomsAboveGrade`, `BedroomsBelowGrade`
- Filter: `BedroomsTotal ge 3`

### Address
- Field: `UnparsedAddress`
- Format: `"2144A Queen Street E, Toronto E02, ON M4E 1E3"`
- Already formatted, use as-is

---

## 📈 Performance Benchmarks

### Expected Response Times:
- **API Listings Endpoint**: 500ms - 2s
- **With Images**: 1s - 3s (parallel fetching)
- **Chat + Listings**: 2s - 4s (includes AI processing)

### Data Volumes:
- **Total TREB Listings**: ~50,000+
- **Default Fetch**: 50 properties
- **With Images**: 10-250 images per request
- **Recommended Top**: 20-50 for best UX

---

## 🎉 Success Indicators

You'll know everything is working when:

✅ API returns `"source": "live_mls"`  
✅ Real MLS numbers appear (not AP001, AP002, etc.)  
✅ Real Toronto addresses show up  
✅ Property images load from AMPRE CDN  
✅ Prices are realistic market values  
✅ Chat returns relevant properties  
✅ No console errors  
✅ Filters work correctly  
✅ Andrew Pisani info shows on all listings  
✅ Page loads quickly (<3 seconds)  

---

## 🚀 Next Steps

### Now That It's Working:

1. **Test All Filters**
   - Try every combination
   - Note which ones work best
   - Adjust defaults if needed

2. **Test Edge Cases**
   - Very high/low prices
   - Uncommon property types
   - Multiple locations
   - No results scenario

3. **Optimize Performance**
   - Adjust `top` parameter
   - Consider caching popular searches
   - Monitor API usage

4. **Enhance Features**
   - Add more filters (e.g., garage, pool)
   - Add map view
   - Add saved searches
   - Add property comparisons

5. **Deploy to Production**
   - Add token to Netlify env vars
   - Test on production URL
   - Monitor for errors
   - Set up error tracking

---

## 📞 Need Help?

### If something's not working:

1. **Check Console Logs**: Most useful for debugging
2. **Check Network Tab**: See actual API requests/responses
3. **Review Documentation**: `AMPRE_API_SETUP.md`
4. **Test API Directly**: Use cURL or Postman

### Support:
- **AMPRE**: support@ampre.ca
- **TREB**: dataagreements@trreb.ca / 416-443-8131
- **Andrew Pisani**: 416-882-9304

---

**Happy Testing!** 🎉

Your live MLS integration is ready to go. Test it thoroughly and you should see real Toronto area listings appearing in your app!

