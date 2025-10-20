# 🤖 AI-Powered Intelligent Search

## What Changed: From Hardcoded to Smart

### ❌ OLD APPROACH (Hardcoded Keywords):
```javascript
// Rigid keyword matching
if (message.includes('commercial')) → commercial
if (message.includes('toronto')) → toronto
if (message.includes('condo')) → condo
```

**Problems:**
- Couldn't understand natural language
- Missed variations ("dt toronto", "commercial space", "3br")
- Required exact keywords
- Not flexible or intelligent

---

### ✅ NEW APPROACH (AI-Powered):
```javascript
// Let Gemini AI understand the user's intent
AI analyzes: "I need a business location in downtown Toronto under 2M"

AI extracts:
{
  "propertyCategory": "commercial",
  "location": "Toronto",
  "maxPrice": 2000000,
  "propertySubType": "retail"
}
```

**Benefits:**
- ✅ Understands natural language
- ✅ Handles variations ("dt", "downtown", "DT Toronto")
- ✅ Extracts complex criteria
- ✅ Smart and flexible
- ✅ Learns from context

---

## How It Works

### Step 1: User Sends Natural Language Request
```
User: "Find me a 3 bedroom condo in Mississauga under 800k"
User: "I want commercial properties downtown"
User: "Show me luxury homes over 2 million in Oakville"
User: "Need office space in North York around 500k"
```

### Step 2: AI Analyzes & Extracts Parameters
```javascript
🤖 AI Processing...

Request: "Find me a 3 bedroom condo in Mississauga under 800k"

AI understands:
- "3 bedroom" → beds: 3
- "condo" → propertyCategory: residential, propertySubType: condo
- "Mississauga" → location: Mississauga
- "under 800k" → maxPrice: 800000

Returns JSON:
{
  "propertyCategory": "residential",
  "location": "Mississauga",
  "maxPrice": 800000,
  "beds": 3,
  "propertySubType": "condo"
}
```

### Step 3: Build Dynamic API Query
```javascript
📡 Building OData query from AI parameters...

$filter=
  PropertyType eq 'Residential' 
  and contains(City,'Mississauga')
  and ListPrice le 800000
  and BedroomsTotal ge 3
  and StandardStatus eq 'Active'
```

### Step 4: Fetch Live MLS Data
```javascript
✅ Fetched 15 properties from AMPRE
```

### Step 5: AI Presents Results in Natural Language
```javascript
AI Response:
"I found 15 beautiful condos in Mississauga under $800k with 3+ bedrooms!

Here are some excellent options:

1. MLS# W98765432 - 3-Bedroom Condo Apartment in Mississauga
   📍 123 Main St, Mississauga, ON
   💰 $749,000 | 3 beds | 2 baths | 1,200 sqft

2. MLS# W87654321 - 3-Bedroom Condo Apartment in Mississauga
   📍 456 Queen St, Mississauga, ON
   💰 $795,000 | 3 beds | 2 baths | 1,350 sqft

All properties are active and ready to view! Call me at 416-882-9304 to schedule viewings."
```

---

## Examples: Natural Language Understanding

### Example 1: Casual Language
```
User: "yo i need something cheap in toronto maybe 2 beds"

AI Extracts:
{
  "propertyCategory": "residential",
  "location": "Toronto",
  "beds": 2,
  "maxPrice": null  // "cheap" is subjective, AI doesn't force a number
}

Query: Shows affordable 2-bed properties in Toronto
```

### Example 2: Business Jargon
```
User: "Looking for retail space downtown, budget 1.5M"

AI Extracts:
{
  "propertyCategory": "commercial",
  "propertySubType": "retail",
  "location": "Toronto",  // assumes downtown = Toronto
  "maxPrice": 1500000
}

Query: Shows commercial retail under $1.5M in Toronto
```

### Example 3: Complex Request
```
User: "My client needs a family home in Oakville, 4+ bedrooms, between 1.5 and 2.5 million"

AI Extracts:
{
  "propertyCategory": "residential",
  "propertySubType": "house",
  "location": "Oakville",
  "beds": 4,
  "minPrice": 1500000,
  "maxPrice": 2500000
}

Query: Shows houses with 4+ beds in Oakville, $1.5M-$2.5M
```

### Example 4: Abbreviations & Slang
```
User: "3br 2ba condo dt toronto max 700k"

AI Extracts:
{
  "propertyCategory": "residential",
  "propertySubType": "condo",
  "location": "Toronto",
  "beds": 3,
  "baths": 2,
  "maxPrice": 700000
}

Query: Shows 3-bed, 2-bath condos in Toronto under $700k
```

---

## AI Extraction Capabilities

### ✅ What AI Understands:

**Property Types:**
- Residential: home, house, condo, apartment, townhouse, penthouse
- Commercial: business, office, retail, warehouse, industrial

**Locations:**
- Full names: Toronto, Mississauga, Oakville
- Abbreviations: TO, DT, GTA
- Neighborhoods: Downtown, North York, Scarborough
- Casual: "the city", "downtown area"

**Prices:**
- Numbers: 500000, 1500000
- Abbreviations: 500k, 1.5M, 2 million
- Ranges: "between X and Y", "from X to Y"
- Comparisons: "under", "over", "around", "approximately"

**Bedrooms/Bathrooms:**
- Full words: "3 bedrooms", "2 bathrooms"
- Abbreviations: "3br", "2ba", "3 bed", "2 bath"
- Casual: "three bedroom", "couple bathrooms"

**Intent:**
- Buying: "want to buy", "looking for", "show me"
- Specific: "need", "must have", "require"
- Flexible: "maybe", "around", "approximately"

---

## Fallback System

If AI extraction fails (rare), falls back to simple regex patterns:

```javascript
⚠️ AI extraction failed, using fallback

Fallback extraction uses:
- Simple keyword matching
- Basic regex patterns
- Minimal processing

Still works, just less intelligent
```

---

## Benefits

### 1. **Natural Conversations**
Users can speak naturally, not use exact keywords

### 2. **Handles Variations**
- "dt toronto" = "downtown Toronto" = "Toronto downtown"
- "3br" = "3 bedroom" = "three bedrooms"
- "500k" = "$500,000" = "five hundred thousand"

### 3. **Context Awareness**
AI understands implied information:
- "downtown" usually means Toronto
- "business" implies commercial
- "family home" implies house with multiple bedrooms

### 4. **Flexible & Forgiving**
- Typos: "toronot" → Toronto
- Abbreviations: "dt", "br", "ba", "k", "m"
- Casual language: "cheap", "luxury", "nice"

### 5. **Smart Defaults**
If something isn't specified, AI uses reasonable defaults:
- No category → residential
- No location → all GTA
- No price → all prices

---

## Testing

### Test These Natural Language Queries:

**Basic:**
```
"show me condos in toronto"
"find houses in mississauga"
"i want commercial properties"
```

**Complex:**
```
"3 bedroom condo downtown under 800k"
"business location north york around 1.5 million"
"luxury home oakville 4+ beds over 2M"
```

**Casual:**
```
"yo need 2br in TO maybe 600k"
"looking for cheap office space"
"got a client wants fancy condo waterfront"
```

**Abbreviations:**
```
"3br 2ba dt toronto max 700k"
"4+ bed house mississauga 1-2M"
"retail space TO under 1.5M"
```

---

## Console Output

### What You'll See:

```
🤖 Property search detected, using AI to extract parameters...

✅ AI extracted parameters: {
  propertyCategory: 'residential',
  location: 'Toronto',
  maxPrice: 800000,
  beds: 3,
  propertySubType: 'condo'
}

🔍 Fetching MLS listings with params: {...}

📡 Calling AMPRE API...
Query: PropertyType eq 'Residential' and contains(City,'Toronto') and ListPrice le 800000 and BedroomsTotal ge 3 and StandardStatus eq 'Active'

✅ Fetched 15 properties from AMPRE
✅ Returning 15 listings to chat
```

---

## Architecture

```
┌─────────────────────────────────────────┐
│  User Input (Natural Language)          │
│  "3 bedroom condo in toronto under 800k"│
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│  Gemini AI (Parameter Extraction)       │
│  Analyzes intent & extracts JSON        │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│  {                                      │
│    propertyCategory: "residential",     │
│    location: "Toronto",                 │
│    maxPrice: 800000,                    │
│    beds: 3,                             │
│    propertySubType: "condo"             │
│  }                                      │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│  OData Query Builder                    │
│  Converts JSON to API query             │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│  AMPRE API                              │
│  $filter=PropertyType eq 'Residential'  │
│          and contains(City,'Toronto')   │
│          and ListPrice le 800000...     │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│  Live MLS Data (15 properties)          │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│  Gemini AI (Response Generation)        │
│  Presents results in natural language   │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│  User sees:                             │
│  - AI chat response with details        │
│  - Property cards below                 │
└─────────────────────────────────────────┘
```

---

## Why This is Better

### Traditional Approach:
```
if (message.includes('condo')) {
  if (message.includes('toronto')) {
    if (message.includes('3')) {
      // Rigid, limited
    }
  }
}
```

### AI-Powered Approach:
```
AI: "I understand you want a 3-bedroom condo in Toronto under $800k"
→ Extracts all parameters intelligently
→ Handles any phrasing
→ Understands context
```

---

## Summary

✅ **No more hardcoded keywords**  
✅ **AI understands natural language**  
✅ **Flexible and intelligent**  
✅ **Handles any phrasing**  
✅ **Extracts complex criteria**  
✅ **Context-aware**  
✅ **User-friendly**

---

**Ready to test!**

Just restart server and try natural language queries:
```bash
npm run dev
```

Then ask things like:
- "I need a business location downtown"
- "Show me 3br condos in mississauga under 700k"
- "Looking for luxury homes in oakville over 2M"

The AI will understand! 🚀

