import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { messages } = req.body;
  const userMessage = messages[messages.length - 1]?.content || "";

  // Enhanced system prompt with property search capabilities
  const systemPrompt = `
You are Andrew Pisani's AI Real Estate Assistant for the Greater Toronto Area (GTA).
- You work with Right at Home Realty, Brokerage
- Andrew's contact: 416-882-9304
- Be friendly, professional, and knowledgeable about real estate

PROPERTY SEARCH CAPABILITIES:
- When users ask about properties, listings, or homes, search our MLS database
- Extract search criteria like location, price range, bedrooms, property type
- Always provide specific, real listings from our database
- Include property details, pricing, and contact information

SEARCH TRIGGERS:
- "show me properties", "find homes", "looking for a house"
- "condos in Toronto", "houses under $2M", "3 bedroom homes" 
- Any mention of specific locations like Toronto, Mississauga, Oakville, etc.
- Price ranges, bedroom/bathroom requirements

When providing property recommendations:
1. Show 2-3 specific listings with full details
2. Include MLS ID, price, beds/baths, location
3. Mention Andrew Pisani as the listing agent
4. Provide contact info: 416-882-9304
5. Suggest scheduling a viewing

Answer other real estate questions about:
- Buying/selling process, mortgages, market trends
- Neighborhood information, investment advice
- Legal basics, home inspections, closing process

Keep responses conversational but informative.
`;

  try {
    // Check if user is asking about properties/listings
    const isPropertySearch = /\b(property|properties|listing|listings|home|homes|house|houses|condo|condos|townhouse|penthouse|buy|buying|looking for|show me|find|search)\b/i.test(userMessage);
    
    let listingsData = null;
    
    if (isPropertySearch) {
      // Extract search parameters from user message
      const searchParams = extractSearchParams(userMessage);
      
      // Fetch listings from our API
      try {
        const listingsUrl = new URL('/api/listings', `http://localhost:3000`);
        Object.entries(searchParams).forEach(([key, value]) => {
          if (value) listingsUrl.searchParams.set(key, value);
        });
        
        const listingsResponse = await fetch(listingsUrl.toString());
        if (listingsResponse.ok) {
          listingsData = await listingsResponse.json();
        }
      } catch (listingsError) {
        console.log('Could not fetch listings:', listingsError.message);
      }
    }

    // Initialize Gemini AI
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Prepare conversation history for Gemini
    let conversationHistory = systemPrompt + "\n\n";
    
    // Add previous messages to context
    messages.forEach(msg => {
      if (msg.role === "user") {
        conversationHistory += `User: ${msg.content}\n`;
      } else if (msg.role === "assistant") {
        conversationHistory += `Assistant: ${msg.content}\n`;
      }
    });

    // Add listings context if available
    if (listingsData && listingsData.listings && listingsData.listings.length > 0) {
      const listingsContext = formatListingsForAI(listingsData.listings.slice(0, 4)); // Limit to top 4
      conversationHistory += `\nAVAILABLE LISTINGS: ${listingsContext}\n`;
    }

    conversationHistory += `\nUser: ${userMessage}\nAssistant:`;

    const result = await model.generateContent(conversationHistory);
    const response = await result.response;
    const aiReply = response.text();

    // Return response with listings if available
    res.status(200).json({ 
      reply: aiReply,
      listings: listingsData?.listings || [],
      hasListings: listingsData?.listings?.length > 0
    });

  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ 
      reply: "⚠️ Server error, please try again.",
      listings: []
    });
  }
}

// Extract search parameters from user message
function extractSearchParams(message) {
  const params = {};
  const messageLower = message.toLowerCase();

  // Location extraction
  const locations = ['toronto', 'mississauga', 'oakville', 'north york', 'downtown', 'waterfront', 'gta'];
  for (const location of locations) {
    if (messageLower.includes(location)) {
      params.location = location;
      break;
    }
  }

  // Property type extraction
  if (messageLower.includes('condo')) params.type = 'condo';
  else if (messageLower.includes('house')) params.type = 'house';
  else if (messageLower.includes('townhouse')) params.type = 'townhouse';
  else if (messageLower.includes('penthouse')) params.type = 'penthouse';

  // Price range extraction
  const priceMatch = messageLower.match(/(\$)?(\d+(?:,\d{3})*(?:k|m)?)/g);
  if (priceMatch) {
    const prices = priceMatch.map(p => {
      let num = p.replace(/[$,]/g, '');
      if (num.endsWith('k')) return parseInt(num) * 1000;
      if (num.endsWith('m')) return parseInt(num) * 1000000;
      return parseInt(num);
    });
    
    if (messageLower.includes('under') || messageLower.includes('below')) {
      params.maxPrice = Math.max(...prices);
    } else if (messageLower.includes('over') || messageLower.includes('above')) {
      params.minPrice = Math.min(...prices);
    } else if (prices.length >= 2) {
      params.minPrice = Math.min(...prices);
      params.maxPrice = Math.max(...prices);
    }
  }

  // Bedroom extraction
  const bedroomMatch = messageLower.match(/(\d+)\s*(bed|bedroom)/);
  if (bedroomMatch) {
    params.beds = bedroomMatch[1];
  }

  // Bathroom extraction  
  const bathroomMatch = messageLower.match(/(\d+)\s*(bath|bathroom)/);
  if (bathroomMatch) {
    params.baths = bathroomMatch[1];
  }

  // General search term
  params.search = message;

  return params;
}

// Format listings for AI context
function formatListingsForAI(listings) {
  return listings.map(listing => 
    `MLS ${listing.mlsId}: ${listing.title} - ${listing.address} - $${listing.price.toLocaleString()} - ${listing.beds}bed/${listing.baths}bath - ${listing.sqft}sqft - Features: ${listing.features.join(', ')}`
  ).join('\n');
}
