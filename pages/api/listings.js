// MLS Listings API using AMPRE OData (RESO Web API)
import axios from 'axios';

const AMPRE_API_URL = process.env.AMPRE_API_URL || 'https://query.ampre.ca';
const AMPRE_API_TOKEN = process.env.AMPRE_API_TOKEN;

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();

  const { 
    search = "", 
    type = "", 
    minPrice = "", 
    maxPrice = "", 
    beds = "", 
    baths = "",
    location = "",
    top = "50" // Default to top 50 listings
  } = req.query;

  // Check if API token is configured
  if (!AMPRE_API_TOKEN || AMPRE_API_TOKEN === 'your_token_here') {
    console.log('AMPRE API token not configured, using fallback listings');
    return res.status(200).json({
      success: true,
      count: getFallbackListings().length,
      listings: getFallbackListings(),
      source: "fallback",
      message: "Using sample listings. Please configure AMPRE_API_TOKEN in .env.local for live MLS data",
      lastUpdated: new Date().toISOString()
    });
  }

  try {
    // Fetch live listings from AMPRE OData API
    const liveListings = await fetchAMPREListings({
      search,
      type,
      minPrice,
      maxPrice,
      beds,
      baths,
      location,
      top
    });
    
    res.status(200).json({
      success: true,
      count: liveListings.length,
      listings: liveListings,
      source: "live_mls", 
      message: "Live MLS listings from AMPRE",
      lastUpdated: new Date().toISOString(),
      apiProvider: "AMPRE OData"
    });

  } catch (error) {
    console.error('AMPRE API Error:', error.message);
    
    // Fallback to sample listings if API call fails
    const fallbackListings = getFallbackListings();
    
    res.status(200).json({ 
      success: true,
      count: fallbackListings.length,
      listings: fallbackListings,
      source: "fallback",
      message: "Showing sample listings (AMPRE API temporarily unavailable)",
      error: error.message,
      apiProvider: "AMPRE OData"
    });
  }
}

// Fetch listings from AMPRE OData API
async function fetchAMPREListings(filters) {
  const { search, type, minPrice, maxPrice, beds, baths, location, top } = filters;
  
  // Build OData filter query
  const filterConditions = [];
  
  // Property type filter - Use PropertyType field
  if (type) {
    const typeMap = {
      'condo': 'Residential',  // Condos are PropertyType: Residential with PropertySubType containing "Condo"
      'house': 'Residential',
      'townhouse': 'Residential',
      'penthouse': 'Residential',
      'commercial': 'Commercial'
    };
    const odataType = typeMap[type.toLowerCase()] || 'Residential';
    filterConditions.push(`PropertyType eq '${odataType}'`);
    
    // Add PropertySubType filter for more specific types
    if (type.toLowerCase() === 'condo' || type.toLowerCase() === 'penthouse') {
      filterConditions.push(`contains(tolower(PropertySubType), 'condo')`);
    } else if (type.toLowerCase() === 'townhouse') {
      filterConditions.push(`contains(tolower(PropertySubType), 'townhouse')`);
    }
  } else {
    // Default to Residential properties only (exclude Commercial, Land, etc.)
    filterConditions.push(`PropertyType eq 'Residential'`);
  }
  
  // Price filters
  if (minPrice) {
    filterConditions.push(`ListPrice ge ${parseInt(minPrice)}`);
  }
  if (maxPrice) {
    filterConditions.push(`ListPrice le ${parseInt(maxPrice)}`);
  }
  
  // Bedroom filter (only for properties that have bedrooms)
  if (beds) {
    filterConditions.push(`BedroomsTotal ge ${parseInt(beds)}`);
  }
  
  // Bathroom filter (only for properties that have bathrooms)
  if (baths) {
    filterConditions.push(`BathroomsTotalInteger ge ${parseInt(baths)}`);
  }
  
  // Location filter - Use City field (which includes region like "Toronto E02")
  if (location) {
    const locationCapitalized = capitalizeLocation(location);
    filterConditions.push(`contains(City, '${locationCapitalized}')`);
  }
  
  // General search filter
  if (search) {
    const searchCapitalized = capitalizeLocation(search);
    filterConditions.push(`(contains(UnparsedAddress, '${searchCapitalized}') or contains(PublicRemarks, '${searchCapitalized}') or contains(City, '${searchCapitalized}'))`);
  }
  
  // Only show active listings and For Sale (exclude leases)
  filterConditions.push(`StandardStatus eq 'Active'`);
  filterConditions.push(`TransactionType eq 'For Sale'`);
  
  // Combine all filter conditions
  const filterQuery = filterConditions.length > 0 
    ? `$filter=${filterConditions.join(' and ')}` 
    : '';
  
  // Build the full query URL with proper field selection
  const queryParams = [
    `$top=${top}`,
    filterQuery,
    '$select=ListingKey,OriginatingSystemID,ListPrice,BedroomsTotal,BedroomsAboveGrade,BedroomsBelowGrade,BathroomsTotalInteger,BuildingAreaTotal,PropertyType,PropertySubType,UnparsedAddress,City,StateOrProvince,PostalCode,PublicRemarks,ListOfficeName,DaysOnMarket,StandardStatus,MlsStatus,ModificationTimestamp,TransactionType,PossessionType,PossessionDetails',
    '$orderby=ModificationTimestamp desc',
    '$count=true'
  ].filter(Boolean).join('&');
  
  const apiUrl = `${AMPRE_API_URL}/odata/Property?${queryParams}`;
  
  console.log('Fetching from AMPRE API:', apiUrl.substring(0, 100) + '...');
  
  const response = await axios.get(apiUrl, {
    headers: {
      'Authorization': `Bearer ${AMPRE_API_TOKEN}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    timeout: 15000
  });
  
  const properties = response.data.value || [];
  const totalCount = response.data['@odata.count'] || properties.length;
  console.log(`Fetched ${properties.length} of ${totalCount} total properties from AMPRE`);
  
  // Transform AMPRE data to our format
  // Fetch images in parallel for better performance
  const transformedListings = await Promise.all(
    properties.map(async (property) => {
      // Fetch media/images for this property (with error handling)
      const images = await fetchPropertyMedia(property.ListingKey).catch(err => {
        console.log(`Could not fetch images for ${property.ListingKey}:`, err.message);
        return [];
      });
      
      return transformProperty(property, images);
    })
  );
  
  return transformedListings;
}

// Helper to capitalize location names properly
function capitalizeLocation(location) {
  if (!location) return '';
  
  // Special cases
  const specialCases = {
    'gta': 'GTA',
    'toronto': 'Toronto',
    'mississauga': 'Mississauga',
    'oakville': 'Oakville',
    'brampton': 'Brampton',
    'markham': 'Markham',
    'richmond hill': 'Richmond Hill',
    'vaughan': 'Vaughan'
  };
  
  const lower = location.toLowerCase().trim();
  if (specialCases[lower]) {
    return specialCases[lower];
  }
  
  // Default: capitalize first letter of each word
  return location.split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

// Fetch property images from AMPRE Media endpoint
async function fetchPropertyMedia(listingKey) {
  if (!listingKey) return [];
  
  try {
    const mediaUrl = `${AMPRE_API_URL}/odata/Media?$top=10&$filter=ResourceRecordKey eq '${listingKey}' and ImageSizeDescription eq 'Largest'&$select=MediaKey,MediaURL,ImageSizeDescription,Order&$orderby=Order asc`;
    
    const response = await axios.get(mediaUrl, {
      headers: {
        'Authorization': `Bearer ${AMPRE_API_TOKEN}`,
        'Accept': 'application/json'
      },
      timeout: 10000
    });
    
    return response.data.value || [];
  } catch (error) {
    console.log(`Could not fetch media for listing ${listingKey}:`, error.message);
    return [];
  }
}

// Transform AMPRE property data to our format
function transformProperty(property, mediaArray) {
  // Get first image or use placeholder
  const primaryImage = mediaArray.length > 0 
    ? mediaArray[0].MediaURL 
    : '/avatar-placeholder.png';
  
  // Extract features from PublicRemarks
  const features = extractFeatures(property.PublicRemarks || '');
  
  // Build full address (UnparsedAddress is already formatted)
  const address = property.UnparsedAddress || 
    `${property.City || ''}, ${property.StateOrProvince || ''}`.trim();
  
  // Get total bedrooms (combine above and below grade if available)
  const totalBeds = property.BedroomsTotal || 
    (property.BedroomsAboveGrade || 0) + (property.BedroomsBelowGrade || 0) || 0;
  
  // Get square footage (BuildingAreaTotal or fallback)
  const sqft = property.BuildingAreaTotal || 0;
  
  // Clean up city name (remove region code like "Toronto E02" -> "Toronto")
  const cleanCity = property.City ? property.City.split(' ')[0] : 'GTA';
  
  return {
    id: property.ListingKey,
    mlsId: property.OriginatingSystemID || property.ListingKey, // Use MLS# from board
    title: generateTitle(property, cleanCity),
    address: address,
    price: property.ListPrice || 0,
    beds: totalBeds,
    baths: property.BathroomsTotalInteger || 0,
    sqft: sqft,
    type: inferPropertyTypeShort(property.PropertyType, property.PropertySubType),
    propertyType: property.PropertySubType || property.PropertyType || 'Residential',
    image: primaryImage,
    images: mediaArray.map(m => m.MediaURL),
    features: features,
    description: cleanDescription(property.PublicRemarks) || 
      `${property.PropertySubType || property.PropertyType} property in ${cleanCity}`,
    listingAgent: "Andrew Pisani",  // Always use Andrew's info
    brokerage: property.ListOfficeName || "Right at Home Realty, Brokerage",
    phone: "416-882-9304",  // Always use Andrew's phone
    status: property.MlsStatus || property.StandardStatus || "Active",
    daysOnMarket: property.DaysOnMarket || 0,
    possession: property.PossessionDetails || property.PossessionType || 'TBD',
    url: `https://www.andrewpisani.com/listing/${property.ListingKey}`,
    source: 'ampre_mls',
    lastModified: property.ModificationTimestamp,
    transactionType: property.TransactionType || 'For Sale'
  };
}

// Clean up property description
function cleanDescription(remarks) {
  if (!remarks) return '';
  
  // Remove excessive whitespace and line breaks
  return remarks
    .replace(/\s+/g, ' ')
    .replace(/\n+/g, ' ')
    .trim()
    .substring(0, 300) + (remarks.length > 300 ? '...' : '');
}

// Generate a descriptive title for the property
function generateTitle(property, cleanCity) {
  const type = property.PropertySubType || property.PropertyType || 'Property';
  const city = cleanCity || property.City?.split(' ')[0] || 'GTA';
  
  // Get total bedrooms
  const totalBeds = property.BedroomsTotal || 
    (property.BedroomsAboveGrade || 0) + (property.BedroomsBelowGrade || 0);
  
  const beds = totalBeds > 0 ? `${totalBeds}-Bedroom ` : '';
  
  // Format nicely
  if (beds) {
    return `${beds}${type} in ${city}`;
  } else {
    return `${type} in ${city}`;
  }
}

// Infer short property type
function inferPropertyTypeShort(propertyType, propertySubType) {
  const type = (propertySubType || propertyType || '').toLowerCase();
  
  if (type.includes('condo')) return 'condo';
  if (type.includes('townhouse')) return 'townhouse';
  if (type.includes('detached')) return 'house';
  if (type.includes('semi-detached')) return 'house';
  if (type.includes('penthouse')) return 'penthouse';
  
  return 'house';
}

// Extract features from description text
function extractFeatures(description) {
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

// Fallback listings if API is not configured or fails
function getFallbackListings() {
  return [
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
      images: ["/avatar-placeholder.png"],
      features: ["Concierge", "Gym", "Pool", "City Views", "Balcony"],
      description: "Stunning 2-bedroom plus den condo in the heart of downtown Toronto. Floor-to-ceiling windows with spectacular city views. Premium finishes throughout.",
      listingAgent: "Andrew Pisani",
      brokerage: "Right at Home Realty, Brokerage",
      phone: "416-882-9304",
      status: "Active",
      daysOnMarket: 15,
      url: `https://www.andrewpisani.com/listing/C5123456`,
      source: "fallback"
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
      images: ["/avatar-placeholder1.png"],
      features: ["Double Garage", "Backyard", "Updated Kitchen", "Hardwood Floors"],
      description: "Beautiful 4-bedroom detached home in desirable Mississauga neighborhood. Recently renovated with modern finishes and spacious layout.",
      listingAgent: "Andrew Pisani",
      brokerage: "Right at Home Realty, Brokerage", 
      phone: "416-882-9304",
      status: "Active",
      daysOnMarket: 8,
      url: `https://www.andrewpisani.com/listing/W5234567`,
      source: "fallback"
    },
    {
      id: "AP003",
      mlsId: "E5345678", 
      title: "Luxury Penthouse with Terrace",
      address: "1 King Street West, Toronto, ON",
      price: 3200000,
      beds: 3,
      baths: 3,
      sqft: 2400,
      type: "penthouse",
      propertyType: "Condominium",
      image: "/avatar-placeholder copy.png",
      images: ["/avatar-placeholder copy.png"],
      features: ["Private Terrace", "Premium Finishes", "Concierge", "Parking"],
      description: "Exclusive penthouse suite with private terrace. Unobstructed views of Toronto skyline. Premium finishes and luxury amenities.",
      listingAgent: "Andrew Pisani", 
      brokerage: "Right at Home Realty, Brokerage",
      phone: "416-882-9304",
      status: "Active",
      daysOnMarket: 22,
      url: `https://www.andrewpisani.com/listing/E5345678`,
      source: "fallback"
    }
  ];
}
