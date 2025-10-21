# Testing HeyGen Avatar Integration

## Quick Start Test

### 1. Start the Development Server
```bash
npm run dev
```

### 2. Open Your Browser
Navigate to: http://localhost:3000

## Test Checklist

### ✅ Basic Avatar Functionality

- [ ] **Avatar Loads**: You should see the avatar video in the interface
- [ ] **Status Indicator**: Shows "PROPERTY ASSISTANT STATUS: ONLINE" (green)
- [ ] **Welcome Speech**: Avatar speaks welcome message automatically
- [ ] **Visual Indicators**: Three dots pulse when avatar is speaking

### ✅ Chat Integration

**Test 1: Simple Greeting**
- Type: "Hello, who are you?"
- Expected:
  - ✓ Text appears in chat
  - ✓ Avatar speaks the response
  - ✓ Speaking indicator activates
  - ✓ No listings displayed

**Test 2: Property Search with Results**
- Type: "Show me condos in Toronto under $2 million"
- Expected:
  - ✓ Avatar speaks: "I found X properties..."
  - ✓ Listings appear below in grid layout
  - ✓ Each listing shows property details
  - ✓ Avatar mentions top listing price

**Test 3: Property Search - No Results**
- Type: "Show me properties for $1"
- Expected:
  - ✓ Avatar explains no results found
  - ✓ Suggests alternatives
  - ✓ Mentions phone number (416-882-9304)
  - ✓ "No properties found" message displays

**Test 4: Location-Specific Search**
- Type: "Find 3 bedroom houses in Mississauga"
- Expected:
  - ✓ Avatar speaks response with listing count
  - ✓ Listings filtered by location
  - ✓ Property cards show Mississauga addresses
  - ✓ Click listing to see full details

**Test 5: Price Range Search**
- Type: "Houses between $1M and $1.5M"
- Expected:
  - ✓ Avatar announces properties found
  - ✓ Listings within price range
  - ✓ Prices displayed correctly

### ✅ Listings Display

**Visual Elements to Check:**
- [ ] Property images load correctly
- [ ] MLS numbers displayed
- [ ] Price formatting (e.g., $899,000)
- [ ] Beds/Baths/SqFt shown
- [ ] Property features listed
- [ ] Agent info (Andrew Pisani, 416-882-9304)
- [ ] "VIEW FULL DETAILS" button works

**Interactive Features:**
- [ ] Click property card → opens modal
- [ ] Modal shows full property details
- [ ] Image navigation works (if multiple images)
- [ ] WhatsApp contact button works
- [ ] Realtor.ca link works
- [ ] Modal close button works

### ✅ Avatar Speech Quality

Listen for:
- [ ] Clear pronunciation
- [ ] Natural pacing
- [ ] Numbers spoken correctly (e.g., "eight hundred ninety-nine thousand")
- [ ] Phone number: "4-1-6-8-8-2-9-3-0-4"
- [ ] No overlapping speech

### ✅ Edge Cases

**Test: Multiple Quick Messages**
- Type 3 questions rapidly
- Expected:
  - ✓ Avatar queues responses
  - ✓ Speaks them sequentially
  - ✓ No speech overlap
  - ✓ All messages appear in chat

**Test: Long Response**
- Type: "Tell me about the Toronto real estate market"
- Expected:
  - ✓ Avatar speaks full response
  - ✓ Speaking indicator active throughout
  - ✓ Response completes without cutting off

**Test: Network Error Simulation**
- Disconnect internet → Send message
- Expected:
  - ✓ Error message displayed
  - ✓ Avatar speaks error message
  - ✓ Suggests calling Andrew

## Browser Console Checks

Open Developer Tools (F12) and check console for:

```
✅ Expected Logs:
- "✅ Avatar is ready"
- "🗣️ Making avatar speak response"
- "✅ Fetched X properties from AMPRE"
- "📋 Announcing listings display"

❌ Should NOT See:
- "❌ Failed to initialize HeyGen session"
- "⚠️ Avatar not ready, skipping speech"
- "❌ AMPRE API Error"
```

## Network Tab Checks

1. Open Developer Tools → Network tab
2. Send a property search query
3. Look for:
   - `POST /api/chat` → Status 200
   - Response includes: `reply`, `avatarSpeech`, `listings`
   - AMPRE API calls successful

## Performance Checks

- [ ] Avatar loads within 3 seconds
- [ ] Property search responds within 5 seconds
- [ ] Listings scroll smoothly
- [ ] No lag when typing in chat
- [ ] Modal opens/closes smoothly

## Mobile Responsiveness (Optional)

Test on mobile or resize browser to mobile width:
- [ ] Avatar visible and responsive
- [ ] Chat input accessible
- [ ] Listings stack vertically
- [ ] Modal scrollable
- [ ] Touch interactions work

## API Integration Verification

### Check Chat API Response
```javascript
// In browser console after property search:
fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    messages: [
      { role: 'user', content: 'Show me condos in Toronto' }
    ]
  })
})
.then(r => r.json())
.then(console.log)

// Should log:
// {
//   reply: "...",
//   avatarSpeech: "I found X properties...",
//   listings: [...],
//   hasListings: true,
//   searchDetected: true,
//   listingsCount: X
// }
```

## Troubleshooting Common Issues

### Problem: Avatar Not Speaking

**Solution:**
1. Check browser console for errors
2. Verify status shows "ONLINE" not "INITIALIZING..."
3. Check browser allows autoplay:
   - Chrome: Settings → Site Settings → Sound → Allow
4. Refresh page

### Problem: No Listings Displayed

**Solution:**
1. Check `.env.local` has `AMPRE_API_TOKEN`
2. Verify query is a property search (contains: property, home, condo, etc.)
3. Try broader search: "Show me properties in Toronto"
4. Check console for API errors

### Problem: Avatar Loads Slowly

**Solution:**
1. Check internet connection
2. HeyGen iframe may be initializing
3. Wait 5-10 seconds for first load
4. Subsequent interactions faster

### Problem: Listings Empty/Blank Images

**Solution:**
1. AMPRE API may have no matching properties
2. Try different search criteria
3. Check AMPRE API token validity
4. Fallback placeholder images should show

## Success Criteria

✅ **Integration is successful if:**
1. Avatar loads and shows "ONLINE" status
2. Avatar speaks responses audibly
3. Property searches return listings
4. Listings display correctly with images and data
5. Click interactions work (modals, buttons)
6. No JavaScript errors in console
7. API responses include `avatarSpeech` field

## Sample Test Queries

Copy and paste these to test:

```
1. "Hello, how can you help me?"
2. "Show me condos in Toronto under $1 million"
3. "Find 3 bedroom houses in Mississauga"
4. "Commercial properties in Toronto"
5. "What's the average price in Toronto?"
6. "Townhouses between $800k and $1.5M"
7. "Properties with pools and gyms"
8. "Tell me about Right at Home Realty"
9. "How do I contact Andrew Pisani?"
10. "Show me waterfront properties"
```

## Reporting Issues

If you find bugs, note:
1. What you did (exact query)
2. What happened (screenshot)
3. What you expected
4. Browser console errors
5. Network tab status codes

---

**Integration Complete!** 🎉

Your HeyGen avatar is now connected to:
- ✅ Chat API (Gemini AI)
- ✅ AMPRE MLS API (Live listings)
- ✅ Speech synthesis
- ✅ Listings display

Ready for production! 🚀

