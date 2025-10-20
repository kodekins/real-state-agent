# 🧪 Test Prompts Guide

## ✅ Fixed Issues

### 1. Listing ID & URL
**Before:** Used internal AMPRE `ListingKey` (not public)  
**Now:** Uses actual MLS# (`OriginatingSystemID`) and links to realtor.ca

**URL Format:**
```
https://www.realtor.ca/real-estate/A00012345
                                    ↑ Real MLS#
```

### 2. More Results
- Increased from 20 to 30 results
- Made filters optional (only applies if AI extracts them)
- Added logging to see what filters are being applied

---

## 🎯 Test Prompts (Organized by Type)

### ✅ SHOULD WORK - General Residential

```
"Show me properties in Toronto"
"Find houses in Mississauga"
"Looking for condos"
"Show me homes"
"Find properties in Oakville"
"I want to buy a house"
"Show me real estate in GTA"
"Find homes for sale"
```

**Why:** Simple queries with location or just "properties/homes" work best

---

### ✅ SHOULD WORK - With Price Range

```
"Show me properties under $1 million"
"Find houses under 2M"
"Looking for condos under $800k"
"Show me properties between $500k and $1M"
"Find homes over $2 million"
"Properties under 1.5 million in Toronto"
```

**Why:** AI can extract price from natural language

---

### ✅ SHOULD WORK - With Bedrooms

```
"Show me 3 bedroom houses"
"Find 2 bedroom condos in Toronto"
"Looking for 4 bedroom homes"
"Show me 2+ bedroom properties"
"Find homes with at least 3 bedrooms"
```

**Why:** AI extracts bedroom count well

---

### ✅ SHOULD WORK - Commercial

```
"Show me commercial properties"
"Find commercial properties in Toronto"
"Looking for business locations"
"Show me retail space"
"Find office space"
"Commercial real estate"
```

**Why:** You said this works! AI detects "commercial" keyword

---

### ⚠️ MAY NOT WORK - Too Specific

```
"Show me penthouses in Yorkville"  ← Yorkville might not have many listings
"Find waterfront mansions"         ← Very specific
"Show me luxury estates"           ← "Luxury" isn't a property type in MLS
"Find lofts downtown"              ← "Loft" might not be in AMPRE data
```

**Why:** AMPRE data might not have these specific types or locations

---

### ⚠️ MAY NOT WORK - Non-existent Criteria

```
"Show me properties for $100"      ← No properties that cheap
"Find 20 bedroom houses"           ← Doesn't exist
"Properties in Alaska"             ← Outside TREB area
"Show me properties from 1800s"    ← Not tracked
```

**Why:** No data matches the criteria

---

## 🔍 Debugging Your Searches

### When You Get "No Properties Found"

**Check the console for:**
```
🔍 Filter conditions: [
  "PropertyType eq 'Residential'",
  "contains(City,'Toronto')",
  "ListPrice le 2000000",
  "BedroomsTotal ge 3",
  "StandardStatus eq 'Active'"
]
```

**This tells you:**
1. What property type it's searching
2. What location it detected
3. What price range
4. What bedroom count
5. Always searches Active listings

### If Too Many Filters:
```
🔍 Filter conditions: [
  "PropertyType eq 'Residential'",
  "contains(City,'Toronto')",
  "ListPrice le 500000",      ← Maybe too low?
  "BedroomsTotal ge 5",        ← Maybe too many beds?
  "BathroomsTotalInteger ge 4", ← Maybe too many baths?
  "StandardStatus eq 'Active'"
]
→ Result: 0 properties found
```

**Solution:** Make your search broader!

---

## 📊 Testing Strategy

### Test 1: Broadest Search
```
"Show me properties"
```
**Expected:** Should return 30 residential properties  
**If fails:** Check API token and connection

### Test 2: Add Location
```
"Show me properties in Toronto"
```
**Expected:** Should return Toronto properties  
**If fails:** Check if AI extracted "Toronto" correctly

### Test 3: Add Price
```
"Show me properties in Toronto under $2M"
```
**Expected:** Should return Toronto properties under $2M  
**If fails:** Check price extraction

### Test 4: Add Bedrooms
```
"Show me 3 bedroom properties in Toronto under $1M"
```
**Expected:** Should return 3+ bed Toronto properties under $1M  
**If fails:** Might be too specific

### Test 5: Commercial
```
"Show me commercial properties"
```
**Expected:** Should return commercial listings  
**If works:** Great! AI is detecting "commercial" correctly

---

## 🎯 Recommended Test Prompts

### Start With These (Most Likely to Work):

**1. General:**
```
"Show me properties"
```

**2. With Location:**
```
"Show me properties in Toronto"
"Find homes in Mississauga"
"Looking for condos in Oakville"
```

**3. With Price:**
```
"Show me properties under $1 million"
"Find homes under 2M"
"Properties under $800k"
```

**4. Combined:**
```
"Show me 2 bedroom condos in Toronto under $1M"
"Find 3 bedroom houses in Mississauga"
"Looking for properties in Toronto under $2 million"
```

**5. Commercial:**
```
"Show me commercial properties"
"Find commercial properties in Toronto"
"Looking for retail space"
```

---

## 💡 Tips for Better Results

### DO:
✅ Use simple, natural language  
✅ Be flexible with price ("under $2M" better than "$1,234,567")  
✅ Use common locations (Toronto, Mississauga, Oakville)  
✅ Start broad, then narrow down  
✅ Use follow-up questions ("What about 3 bedrooms?")  

### DON'T:
❌ Be too specific ("Spanish colonial in Yorkville")  
❌ Use obscure locations ("Properties in Timbuktu")  
❌ Ask for impossible criteria ("$100 mansion")  
❌ Use slang for property types ("bachelor pad", "crash pad")  
❌ Expect instant results for very specific searches  

---

## 🐛 Common Issues & Solutions

### Issue 1: "No Properties Found"
**Possible Causes:**
- Location not in TREB area
- Price range too narrow
- Too many filters combined
- Property type doesn't exist in MLS data

**Solutions:**
- Broaden your search
- Remove some criteria
- Try just location first
- Check console for actual filters applied

### Issue 2: "Show me condos" Returns Nothing
**Possible Cause:** AI might not be extracting "condo" correctly

**Debug:**
```
Check console:
✅ AI extracted parameters: {propertyCategory: 'residential', ...}
```

**Solution:** Try:
```
"Show me residential properties in Toronto"
"Find apartments in Toronto"
"Looking for condos in Toronto" (be more specific)
```

### Issue 3: Only Commercial Works
**This is strange! Let me check...**

**Debug Steps:**
1. Check what AI extracts for "Show me properties"
2. Check what filters are applied
3. Check if AMPRE has residential data

**Try these:**
```
"Show me any properties"
"Find homes"
"Looking for residential properties"
"Show me houses"
```

---

## 🔧 Debug Mode

### To See What's Happening:

**1. Open Browser Console (F12)**

**2. Ask a question**

**3. Look for these logs:**
```
🤖 Property search detected, extracting parameters...
✅ AI extracted parameters: {...}
🔍 Fetching MLS listings with params: {...}
🔍 Filter conditions: [...]
📡 Calling AMPRE API with query: ...
✅ Fetched X properties from AMPRE
```

**4. Check the filter conditions:**
- Are they correct?
- Are they too restrictive?
- Is the location spelled correctly?

---

## 📋 Testing Checklist

Use this to systematically test:

- [ ] "Show me properties" (broadest)
- [ ] "Show me properties in Toronto" (with location)
- [ ] "Show me properties under $2M" (with price)
- [ ] "Show me 3 bedroom properties" (with beds)
- [ ] "Show me commercial properties" (commercial type)
- [ ] "Show me condos in Toronto" (specific type + location)
- [ ] "Show me 2 bedroom condos in Toronto under $1M" (all filters)
- [ ] Follow-up: "What about Mississauga?" (memory test)
- [ ] Follow-up: "Show me ones with 3 bedrooms" (refinement)

---

## 🎯 Expected Behavior

### Good Query:
```
You: "Show me properties in Toronto"

Console:
🤖 Property search detected
✅ AI extracted: {location: 'Toronto', propertyCategory: 'residential'}
🔍 Filter conditions: ["PropertyType eq 'Residential'", "contains(City,'Toronto')", "StandardStatus eq 'Active'"]
📡 Calling AMPRE API...
✅ Fetched 30 properties from AMPRE

UI:
✅ Shows 30 property cards with real images
```

### Too Specific Query:
```
You: "Show me 10 bedroom mansions in Yorkville for $50k"

Console:
🤖 Property search detected
✅ AI extracted: {location: 'Yorkville', beds: 10, maxPrice: 50000}
🔍 Filter conditions: [...very restrictive...]
📡 Calling AMPRE API...
✅ Fetched 0 properties from AMPRE

UI:
🔍 NO PROPERTIES FOUND
[Suggestions to broaden search]
```

---

## 🚀 Next Steps

**1. Test the basic queries first:**
```bash
npm run dev
```

**2. Try these in order:**
- "Show me properties"
- "Show me properties in Toronto"
- "Show me commercial properties"

**3. Check console output for each**

**4. Report which ones work and which don't**

**5. Share the console logs** so I can see the exact filters being applied

---

## 📞 If Still Having Issues

**Send me:**
1. The exact query you tried
2. Console output showing:
   - ✅ AI extracted parameters
   - 🔍 Filter conditions
   - ✅ Fetched X properties
3. Whether it showed "No Properties Found"

This will help me pinpoint the exact issue!

---

**Summary: Start with broad searches and narrow down!** 🎯

