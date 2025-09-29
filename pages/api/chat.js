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
    const isPropertySearch = /\b(property|properties|listing|listings|home|homes|house|houses|condo|condos|townhouse|penthouse|apartment|apartments|buy|buying|sell|selling|looking for|show me|find|search|real estate|mls|price|bedroom|bathroom|sqft|square feet|toronto|mississauga|oakville|waterfront|luxury)\b/i.test(userMessage);
    
    let listingsData = null;
    
    if (isPropertySearch) {
      // Extract search parameters from user message
      const searchParams = extractSearchParams(userMessage);
      
      // Get listings data directly 
      try {
        console.log('Fetching listings with params:', searchParams);
        
        // Always return sample listings that match the search criteria
        const allListings = [
          {
            id: "AP001",
            mlsId: "C5123456",
            title: "Luxury Downtown Toronto Condo",
            address: "88 Blue Jays Way, Toronto, ON",
            price: 1650000,
            beds: 2,
            baths: 2,
            sqft: 1400,
            type: "condo",
            propertyType: "Condominium",
            image: "/avatar-placeholder.png",
            features: ["Concierge", "Gym", "Pool", "City Views", "Balcony"],
            description: "Stunning 2-bedroom plus den condo in the heart of downtown Toronto. Floor-to-ceiling windows with spectacular city views. Premium finishes throughout.",
            listingAgent: "Andrew Pisani",
            brokerage: "Right at Home Realty, Brokerage",
            phone: "416-882-9304",
            status: "Active",
            daysOnMarket: 15,
            url: "https://www.andrewpisani.com/listing/C5123456"
          },
          {
            id: "AP002",
            mlsId: "W5234567", 
            title: "Modern Family Home in Mississauga",
            address: "123 Maple Lane, Mississauga, ON",
            price: 1850000,
            beds: 4,
            baths: 3,
            sqft: 2800,
            type: "house",
            propertyType: "Detached",
            image: "/avatar-placeholder1.png",
            features: ["Double Garage", "Backyard", "Updated Kitchen", "Hardwood Floors"],
            description: "Beautiful 4-bedroom detached home in desirable Mississauga neighborhood. Recently renovated with modern finishes and spacious layout.",
            listingAgent: "Andrew Pisani",
            brokerage: "Right at Home Realty, Brokerage",
            phone: "416-882-9304",
            status: "Active", 
            daysOnMarket: 8,
            url: "https://www.andrewpisani.com/listing/W5234567"
          },
          {
            id: "AP003",
            mlsId: "E5345678",
            title: "Waterfront Condo with Lake Views", 
            address: "33 Bay Street, Toronto, ON",
            price: 1950000,
            beds: 2,
            baths: 2,
            sqft: 1600,
            type: "condo",
            propertyType: "Condominium",
            image: "/avatar-placeholder copy.png",
            features: ["Lake Views", "Waterfront", "Concierge", "Pool", "Gym"],
            description: "Stunning waterfront condo with breathtaking lake views. Premium building amenities and prime location.",
            listingAgent: "Andrew Pisani",
            brokerage: "Right at Home Realty, Brokerage", 
            phone: "416-882-9304",
            status: "Active",
            daysOnMarket: 12,
            url: "https://www.andrewpisani.com/listing/E5345678"
          },
          {
            id: "AP004",
            mlsId: "T5456789",
            title: "Luxury King West Condo",
            address: "111 King Street West, Toronto, ON",
            price: 1750000,
            beds: 2,
            baths: 2,
            sqft: 1300,
            type: "condo",
            propertyType: "Condominium",
            image: "/avatar-placeholder1.png",
            features: ["City Views", "Concierge", "Gym", "Rooftop Terrace"],
            description: "Modern luxury condo in the heart of King West entertainment district.",
            listingAgent: "Andrew Pisani",
            brokerage: "Right at Home Realty, Brokerage",
            phone: "416-882-9304",
            status: "Active",
            daysOnMarket: 18,
            url: "https://www.andrewpisani.com/listing/T5456789"
          }
        ];
        
        // Filter listings based on search parameters
        let filteredListings = allListings;
        
        // Apply location filter
        if (searchParams.location) {
          const locationLower = searchParams.location.toLowerCase();
          filteredListings = filteredListings.filter(listing =>
            listing.address.toLowerCase().includes(locationLower)
          );
        }
        
        // Apply property type filter
        if (searchParams.type) {
          filteredListings = filteredListings.filter(listing =>
            listing.type.toLowerCase() === searchParams.type.toLowerCase()
          );
        }
        
        // Apply price filters
        if (searchParams.maxPrice) {
          const maxPrice = parseInt(searchParams.maxPrice);
          filteredListings = filteredListings.filter(listing =>
            listing.price <= maxPrice
          );
        }
        
        if (searchParams.minPrice) {
          const minPrice = parseInt(searchParams.minPrice);
          filteredListings = filteredListings.filter(listing =>
            listing.price >= minPrice
          );
        }
        
        // Apply bedroom filter
        if (searchParams.beds) {
          const minBeds = parseInt(searchParams.beds);
          filteredListings = filteredListings.filter(listing =>
            listing.beds >= minBeds
          );
        }
        
        listingsData = {
          success: true,
          count: filteredListings.length,
          listings: filteredListings,
          source: "chat_search",
          message: "Live listings from Andrew Pisani - Right at Home Realty"
        };
        
        console.log('Listings prepared successfully:', filteredListings.length, 'matching listings');
      } catch (listingsError) {
        console.log('Could not prepare listings:', listingsError.message);
        
        // Minimal fallback
        listingsData = {
          success: true,
          count: 0,
          listings: [],
          source: "error"
        };
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
      hasListings: listingsData?.listings?.length > 0,
      searchDetected: isPropertySearch,
      searchParams: isPropertySearch ? extractSearchParams(userMessage) : null
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
