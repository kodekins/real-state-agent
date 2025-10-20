import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { messages } = req.body;
  const userMessage = messages[messages.length - 1]?.content || "";

  // Enhanced system prompt - AI-powered parameter extraction
  const systemPrompt = `
You are Andrew Pisani's AI Real Estate Assistant for the Greater Toronto Area (GTA).
- You work with Right at Home Realty, Brokerage
- Andrew's contact: 416-882-9304
- Be friendly, professional, and knowledgeable about real estate

You have access to live MLS data through the AMPRE API.
`;

  try {
    // Check if user is asking about properties/listings
    const isPropertySearch = /\b(property|properties|listing|listings|home|homes|house|houses|condo|condos|townhouse|penthouse|apartment|apartments|buy|buying|sell|selling|looking for|show me|find|search|real estate|mls|commercial|business|retail|office|warehouse)\b/i.test(userMessage);
    
    let listingsData = null;
    
    if (isPropertySearch) {
      console.log('🤖 Property search detected, extracting parameters...');
      
      // Use AI to intelligently extract search parameters (with timeout)
      let searchParams;
      try {
        searchParams = await Promise.race([
          extractSearchParamsWithAI(userMessage),
          new Promise((_, reject) => setTimeout(() => reject(new Error('AI extraction timeout')), 5000))  // Increased to 5 seconds
        ]);
        console.log('✅ AI extraction succeeded:', searchParams);
      } catch (aiError) {
        console.log('⚠️ AI extraction failed, using fallback:', aiError.message);
        searchParams = fallbackExtraction(userMessage);
      }
      
      // Fetch listings from AMPRE API
      try {
        console.log('🔍 Fetching MLS listings with params:', searchParams);
        
        const axios = (await import('axios')).default;
        
        const AMPRE_API_URL = process.env.AMPRE_API_URL || 'https://query.ampre.ca';
        const AMPRE_API_TOKEN = process.env.AMPRE_API_TOKEN;
        
        if (!AMPRE_API_TOKEN || AMPRE_API_TOKEN === 'your_token_here') {
          throw new Error('AMPRE_API_TOKEN not configured');
        }
        
        // Build OData filter dynamically based on AI-extracted parameters
        const filterConditions = [];
        
        // Property Type - Use AI-detected category
        if (searchParams.propertyCategory === 'commercial') {
          filterConditions.push("PropertyType eq 'Commercial'");
        } else {
          // Default to Residential for most searches
          filterConditions.push("PropertyType eq 'Residential'");
        }
        
        // Location - Use AI-extracted location (if provided)
        if (searchParams.location) {
          filterConditions.push(`contains(City,'${searchParams.location}')`);
        }
        
        // Price Range - Use AI-extracted min/max (if provided)
        if (searchParams.maxPrice) {
          console.log(`💰 Max price filter: ListPrice lt ${searchParams.maxPrice}`);
          filterConditions.push(`ListPrice lt ${searchParams.maxPrice}`);  // Use lt (less than)
        }
        if (searchParams.minPrice) {
          console.log(`💰 Min price filter: ListPrice gt ${searchParams.minPrice}`);
          filterConditions.push(`ListPrice gt ${searchParams.minPrice}`);  // Use gt (greater than)
        }
        
        // Bedrooms - Use AI-extracted beds (only for residential, if provided)
        if (searchParams.beds && searchParams.propertyCategory !== 'commercial') {
          filterConditions.push(`BedroomsTotal ge ${searchParams.beds}`);
        }
        
        // Bathrooms - Use AI-extracted baths (only for residential, if provided)
        if (searchParams.baths && searchParams.propertyCategory !== 'commercial') {
          filterConditions.push(`BathroomsTotalInteger ge ${searchParams.baths}`);
        }
        
        // Active listings only - this is the only required filter
        filterConditions.push("StandardStatus eq 'Active'");
        
        console.log('🔍 All filter conditions:', filterConditions);
        
        const filterQuery = `$filter=${filterConditions.join(' and ')}`;
        const apiUrl = `${AMPRE_API_URL}/odata/Property?${filterQuery}&$top=30&$select=ListingKey,OriginatingSystemID,ListingId,ListPrice,BedroomsTotal,BathroomsTotalInteger,BuildingAreaTotal,PropertyType,PropertySubType,UnparsedAddress,City,PublicRemarks,ListOfficeName,StandardStatus,DaysOnMarket&$orderby=ModificationTimestamp desc`;
        
        console.log('📡 Full OData query:', filterQuery);
        console.log('🌐 Complete API URL:', apiUrl.substring(0, 200) + '...');
        
        const response = await axios.get(apiUrl, {
          headers: {
            'Authorization': `Bearer ${AMPRE_API_TOKEN}`,
            'Accept': 'application/json'
          },
          timeout: 10000
        });
        
        const properties = response.data.value || [];
        console.log(`✅ Fetched ${properties.length} properties from AMPRE`);
        
        // Log first few prices to verify filter worked
        if (properties.length > 0) {
          const prices = properties.slice(0, 5).map(p => p.ListPrice);
          console.log('💵 First 5 property prices:', prices);
          
          // DEBUG: Log MLS number fields from first property
          const firstProp = properties[0];
          console.log('🔍 First property MLS fields:', {
            ListingKey: firstProp.ListingKey,
            OriginatingSystemID: firstProp.OriginatingSystemID,
            ListingId: firstProp.ListingId,
            // Log any other potential MLS number fields
          });
        }
        
        // Fetch images for properties (in parallel for speed)
        console.log('📸 Fetching property images...');
        
        // First, let's see what fields we actually have
        if (properties.length > 0) {
          console.log('🔍 Sample property fields:', Object.keys(properties[0]));
          console.log('🔍 First 3 ListingKeys:', properties.slice(0, 3).map(p => p.ListingKey));
          console.log('🔍 First 3 OriginatingSystemIDs:', properties.slice(0, 3).map(p => p.OriginatingSystemID));
        }
        
        const listingsWithImages = await Promise.all(
          properties.map(async (p) => {
            // Fetch images from AMPRE Media endpoint
            let imageUrl = '/avatar-placeholder.png';
            let images = [];
            
            try {
              const mediaUrl = `${AMPRE_API_URL}/odata/Media?$top=1&$filter=ResourceRecordKey eq '${p.ListingKey}' and ImageSizeDescription eq 'Largest'&$select=MediaURL&$orderby=Order asc`;
              
              const mediaResponse = await axios.get(mediaUrl, {
                headers: {
                  'Authorization': `Bearer ${AMPRE_API_TOKEN}`,
                  'Accept': 'application/json'
                },
                timeout: 5000
              });
              
              if (mediaResponse.data.value && mediaResponse.data.value.length > 0) {
                imageUrl = mediaResponse.data.value[0].MediaURL;
                images = mediaResponse.data.value.map(m => m.MediaURL);
              }
            } catch (imgError) {
              // Silent fail on images
            }
            
            // Extract features from description
            const features = extractFeaturesFromDescription(p.PublicRemarks || '');
            
            // Clean city name
            const cleanCity = p.City ? p.City.split(' ')[0] : 'GTA';
            
            // Use ListingKey as the MLS number (this is the correct field from AMPRE)
            const mlsNumber = p.ListingKey;  // ListingKey IS the MLS board number
            const listingUrl = `https://www.realtor.ca/real-estate/${mlsNumber}`;
            
            return {
              id: mlsNumber,
              mlsId: mlsNumber,
              listingKey: p.ListingKey,
              title: `${p.BedroomsTotal ? p.BedroomsTotal + '-Bedroom ' : ''}${p.PropertySubType || p.PropertyType} in ${cleanCity}`,
              address: p.UnparsedAddress || `${p.City || 'GTA'}, ON`,
              price: p.ListPrice || 0,
              beds: p.BedroomsTotal || 0,
              baths: p.BathroomsTotalInteger || 0,
              sqft: p.BuildingAreaTotal || 0,
              type: inferPropertyType(p.PropertyType, p.PropertySubType),
              propertyType: p.PropertySubType || p.PropertyType,
              image: imageUrl,
              images: images,
              features: features,
              description: cleanDescription(p.PublicRemarks),
              listingAgent: "Andrew Pisani",
              brokerage: p.ListOfficeName || "Right at Home Realty, Brokerage",
              phone: "416-882-9304",
              status: p.StandardStatus || "Active",
              daysOnMarket: p.DaysOnMarket || 0,
              url: listingUrl,
              contactUrl: `https://api.whatsapp.com/send?phone=14168829304&text=Hi%20Andrew,%20I'm%20interested%20in%20MLS%23${mlsNumber}`,
              source: 'ampre_mls'
            };
          })
        );
        
        const listings = listingsWithImages;
        
        listingsData = {
          success: true,
          count: listings.length,
          listings: listings,
          source: "live_mls"
        };
        
        console.log(`✅ Returning ${listings.length} listings to chat`);
        
      } catch (listingsError) {
        console.error('❌ AMPRE API Error:', listingsError.message);
        listingsData = {
          success: false,
          count: 0,
          listings: [],
          source: "error"
        };
      }
    }

    // Initialize Gemini AI
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Prepare conversation history for Gemini with full context
    let conversationHistory = systemPrompt + "\n\n";
    
    // Add ALL previous messages to maintain conversation memory
    console.log(`📝 Including ${messages.length} messages in conversation context`);
    messages.forEach((msg, index) => {
      if (msg.role === "user") {
        conversationHistory += `User: ${msg.content}\n`;
      } else if (msg.role === "assistant") {
        conversationHistory += `Assistant: ${msg.content}\n`;
      }
    });

    // Add listings context if available
    if (listingsData) {
      if (listingsData.listings && listingsData.listings.length > 0) {
        const listingsContext = formatListingsForAI(listingsData.listings.slice(0, 5)); // Limit to top 5
        conversationHistory += `\n\nAVAILABLE LISTINGS (${listingsData.count} found):\n${listingsContext}\n`;
        conversationHistory += `\nIMPORTANT: Present these ${listingsData.count} listings to the user. Mention specific MLS numbers, prices, and addresses. Encourage them to view the listings below and contact you at 416-882-9304.\n`;
      } else {
        conversationHistory += `\n\nNO LISTINGS FOUND: No properties match the search criteria at this time.\n`;
        conversationHistory += `\nIMPORTANT: Inform the user that no listings match their criteria right now. Suggest:
1. Broadening search (different area, price range, or property type)
2. Setting up alerts for when matching properties become available
3. Calling you at 416-882-9304 to discuss their needs\n`;
      }
    }

    conversationHistory += `\nUser: ${userMessage}\nAssistant:`;

    const result = await model.generateContent(conversationHistory);
    const response = await result.response;
    const aiReply = response.text();

    // Return response with listings if available
    res.status(200).json({ 
      reply: aiReply,
      listings: listingsData?.listings || [],
      hasListings: listingsData?.listings?.length > 0,
      searchDetected: isPropertySearch,
      searchParams: null
    });

  } catch (err) {
    console.error("❌ Chat API Error:", err);
    console.error("Error stack:", err.stack);
    
    // Return helpful error message
    res.status(200).json({  // Use 200 to not break frontend
      reply: "I apologize, I'm having trouble processing your request right now. Please try asking in a different way, or call Andrew Pisani directly at 416-882-9304 for immediate assistance.",
      listings: [],
      error: err.message,
      searchDetected: false
    });
  }
}

// AI-powered parameter extraction - Let Gemini understand the request
async function extractSearchParamsWithAI(message) {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    const extractionPrompt = `Analyze this real estate search request and extract parameters in JSON format.

User Request: "${message}"

Extract these parameters:
1. propertyCategory: "commercial" or "residential" (default: residential)
   - commercial if: commercial, business, retail, office, warehouse, industrial mentioned
   - residential if: condo, house, home, apartment, townhouse mentioned OR not specified
   
2. location: city/area name (Toronto, Mississauga, Oakville, Brampton, Markham, Vaughan, etc.) or null
   - Extract the specific city/area mentioned
   - Normalize: "dt toronto" → "Toronto", "mississauga" → "Mississauga"
   
3. minPrice: number or null (minimum price in dollars)
   - "over $500k" → 500000
   - "above 1 million" → 1000000
   
4. maxPrice: number or null (maximum price in dollars)
   - "under $2M" → 2000000
   - "below 800k" → 800000
   - "between 500k and 1M" → 1000000
   
5. beds: number or null (minimum bedrooms)
   - "3 bedroom" → 3
   - "2 bed" → 2
   
6. baths: number or null (minimum bathrooms)
   - "2 bath" → 2
   
7. propertySubType: string or null
   - For residential: "condo", "house", "townhouse", "apartment" if mentioned
   - For commercial: "retail", "office", "warehouse", "industrial" if mentioned

Return ONLY valid JSON, no explanation:
{
  "propertyCategory": "residential",
  "location": "Toronto",
  "minPrice": null,
  "maxPrice": 2000000,
  "beds": 3,
  "baths": null,
  "propertySubType": "condo"
}`;

    const result = await model.generateContent(extractionPrompt);
    const response = await result.response;
    const aiResponse = response.text();
    
    // Extract JSON from response
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const params = JSON.parse(jsonMatch[0]);
      console.log('✅ AI extracted parameters:', params);
      return params;
    }
    
    // Fallback to simple extraction
    console.log('⚠️ AI extraction failed, using fallback');
    return fallbackExtraction(message);
    
  } catch (error) {
    console.error('❌ AI extraction error:', error.message);
    return fallbackExtraction(message);
  }
}

// Simple fallback extraction if AI fails
function fallbackExtraction(message) {
  const params = {};
  const messageLower = message.toLowerCase();
  
  console.log('🔄 Using fallback extraction for:', message);
  
  // Property category
  if (messageLower.includes('commercial') || messageLower.includes('business') || 
      messageLower.includes('retail') || messageLower.includes('office')) {
    params.propertyCategory = 'commercial';
  } else {
    params.propertyCategory = 'residential';
  }
  
  // Location
  const locations = ['toronto', 'mississauga', 'oakville', 'brampton', 'markham', 'vaughan', 'north york', 'scarborough', 'etobicoke'];
  for (const loc of locations) {
    if (messageLower.includes(loc)) {
      params.location = loc.charAt(0).toUpperCase() + loc.slice(1);
      break;
    }
  }
  
  // Price - Enhanced pattern matching
  // Match: $1000, 1000$, $1k, 1k, $1M, 1M, $1 million, 1 million, etc.
  const pricePatterns = [
    /\$?\s*(\d+(?:,\d{3})*)\s*(?:million|m)\b/i,  // 2 million, $2M, 2M
    /\$?\s*(\d+(?:,\d{3})*)\s*k\b/i,              // 800k, $800k, 800K
    /\$\s*(\d+(?:,\d{3})*)\b/i,                   // $800000, $1,500,000
    /\b(\d+(?:,\d{3})*)\s*\$/i                    // 1000$, 800000$
  ];
  
  let extractedPrice = null;
  for (const pattern of pricePatterns) {
    const match = messageLower.match(pattern);
    if (match) {
      let num = parseInt(match[1].replace(/,/g, ''));
      
      // Determine multiplier
      if (messageLower.includes('million') || messageLower.includes(' m') || /\d+m\b/.test(messageLower)) {
        extractedPrice = num * 1000000;
      } else if (messageLower.includes('k')) {
        extractedPrice = num * 1000;
      } else if (num < 10000) {
        // If number is small (like 1000), treat as dollars
        extractedPrice = num;
      } else {
        extractedPrice = num;
      }
      break;
    }
  }
  
  if (extractedPrice) {
    console.log(`💰 Fallback extracted price: ${extractedPrice}`);
    if (messageLower.includes('under') || messageLower.includes('below') || messageLower.includes('less than')) {
      params.maxPrice = extractedPrice;
    } else if (messageLower.includes('over') || messageLower.includes('above') || messageLower.includes('more than')) {
      params.minPrice = extractedPrice;
    } else if (messageLower.includes('between')) {
      // Handle "between X and Y" - use first number as min, need to find second
      params.minPrice = extractedPrice;
      // Try to find second number
      const allNumbers = messageLower.match(/\$?\s*(\d+(?:,\d{3})*)\s*(?:million|m|k)?\b/gi);
      if (allNumbers && allNumbers.length > 1) {
        const secondMatch = allNumbers[1];
        let num2 = parseInt(secondMatch.replace(/[^0-9]/g, ''));
        if (secondMatch.includes('m') || secondMatch.includes('million')) num2 *= 1000000;
        else if (secondMatch.includes('k')) num2 *= 1000;
        params.maxPrice = num2;
      }
    } else {
      // Default: treat as max price if no keyword
      params.maxPrice = extractedPrice;
    }
  }
  
  // Beds
  const bedMatch = messageLower.match(/(\d+)\s*(?:bed|br|bedroom)/i);
  if (bedMatch) {
    params.beds = parseInt(bedMatch[1]);
  }
  
  // Baths
  const bathMatch = messageLower.match(/(\d+)\s*(?:bath|bathroom)/i);
  if (bathMatch) {
    params.baths = parseInt(bathMatch[1]);
  }
  
  console.log('🔄 Fallback extraction result:', params);
  
  return params;
}

// Helper functions
function extractFeaturesFromDescription(description) {
  if (!description) return ['Premium Location', 'Professional Service'];
  
  const features = [];
  const text = description.toLowerCase();
  
  const featureMap = {
    'pool': 'Pool',
    'gym': 'Gym',
    'fitness': 'Fitness Center',
    'concierge': 'Concierge',
    'balcony': 'Balcony',
    'terrace': 'Terrace',
    'garage': 'Garage',
    'parking': 'Parking',
    'view': 'City Views',
    'waterfront': 'Waterfront',
    'lake': 'Lake Access',
    'updated': 'Recently Updated',
    'renovated': 'Renovated',
    'modern': 'Modern Finishes',
    'luxury': 'Luxury Amenities',
    'granite': 'Granite Counters',
    'hardwood': 'Hardwood Floors',
    'stainless': 'Stainless Appliances',
    'ensuite': 'Ensuite Bathroom',
    'walk-in': 'Walk-in Closet'
  };

  Object.entries(featureMap).forEach(([key, value]) => {
    if (text.includes(key)) features.push(value);
  });
  
  return features.length > 0 ? features.slice(0, 6) : ['Premium Location', 'Professional Service'];
}

function inferPropertyType(propertyType, propertySubType) {
  const type = (propertySubType || propertyType || '').toLowerCase();
  
  if (type.includes('condo')) return 'condo';
  if (type.includes('townhouse')) return 'townhouse';
  if (type.includes('detached')) return 'house';
  if (type.includes('semi-detached')) return 'house';
  if (type.includes('commercial')) return 'commercial';
  
  return 'house';
}

function cleanDescription(remarks) {
  if (!remarks) return '';
  
  return remarks
    .replace(/\s+/g, ' ')
    .replace(/\n+/g, ' ')
    .trim()
    .substring(0, 300) + (remarks.length > 300 ? '...' : '');
}

// Format listings for AI context
function formatListingsForAI(listings) {
  return listings.map(listing => 
    `MLS ${listing.mlsId}: ${listing.title} - ${listing.address} - $${listing.price.toLocaleString()} - ${listing.beds}bed/${listing.baths}bath - ${listing.sqft}sqft - Features: ${listing.features.join(', ')}`
  ).join('\n');
}
