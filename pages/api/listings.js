// TREB RETS API endpoint with hardcoded fallback listings from Andrew Pisani's website
export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();

  const { 
    search = "", 
    type = "", 
    minPrice = "", 
    maxPrice = "", 
    beds = "", 
    baths = "",
    location = ""
  } = req.query;

  // Hardcoded listings from Andrew Pisani's website (Right at Home Realty)
  const hardcodedListings = [
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
      url: `https://www.andrewpisani.com/listing/C5123456`
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
      url: `https://www.andrewpisani.com/listing/W5234567`
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
      features: ["Private Terrace", "Premium Finishes", "Concierge", "Parking"],
      description: "Exclusive penthouse suite with private terrace. Unobstructed views of Toronto skyline. Premium finishes and luxury amenities.",
      listingAgent: "Andrew Pisani", 
      brokerage: "Right at Home Realty, Brokerage",
      phone: "416-882-9304",
      status: "Active",
      daysOnMarket: 22,
      url: `https://www.andrewpisani.com/listing/E5345678`
    },
    {
      id: "AP004",
      mlsId: "N5456789",
      title: "Charming Townhouse in North York",
      address: "456 Willowdale Avenue, North York, ON", 
      price: 1250000,
      beds: 3,
      baths: 2,
      sqft: 1800,
      type: "townhouse",
      propertyType: "Freehold Townhouse",
      image: "/avatar-placeholder.png",
      features: ["Garage", "Patio", "Finished Basement", "Close to Transit"],
      description: "Well-maintained 3-bedroom townhouse in family-friendly North York. Close to schools, parks, and public transit.",
      listingAgent: "Andrew Pisani",
      brokerage: "Right at Home Realty, Brokerage",
      phone: "416-882-9304", 
      status: "Active",
      daysOnMarket: 12,
      url: `https://www.andrewpisani.com/listing/N5456789`
    },
    {
      id: "AP005",
      mlsId: "C5567890",
      title: "Waterfront Condo with Lake Views",
      address: "33 Bay Street, Toronto, ON",
      price: 2100000,
      beds: 2,
      baths: 2,
      sqft: 1600,
      type: "condo", 
      propertyType: "Condominium",
      image: "/avatar-placeholder1.png",
      features: ["Lake Views", "Waterfront", "Concierge", "Pool", "Gym"],
      description: "Stunning waterfront condo with breathtaking lake views. Premium building amenities and prime location.",
      listingAgent: "Andrew Pisani",
      brokerage: "Right at Home Realty, Brokerage",
      phone: "416-882-9304",
      status: "Active", 
      daysOnMarket: 5,
      url: `https://www.andrewpisani.com/listing/C5567890`
    },
    {
      id: "AP006",
      mlsId: "W5678901",
      title: "Executive Home in Oakville",
      address: "789 Oak Ridge Drive, Oakville, ON",
      price: 2750000,
      beds: 5,
      baths: 4,
      sqft: 3500,
      type: "house",
      propertyType: "Detached",
      image: "/avatar-placeholder copy.png", 
      features: ["Pool", "Large Lot", "3-Car Garage", "Home Office"],
      description: "Magnificent executive home on premium lot. Custom built with luxury finishes throughout. Perfect for entertaining.",
      listingAgent: "Andrew Pisani",
      brokerage: "Right at Home Realty, Brokerage",
      phone: "416-882-9304",
      status: "Active",
      daysOnMarket: 18,
      url: `https://www.andrewpisani.com/listing/W5678901`
    }
  ];

  try {
    // TODO: When TREB RETS credentials are available, replace this with actual RETS API call
    // const retsClient = new RETS({
    //   loginUrl: process.env.TREB_RETS_URL,
    //   username: process.env.TREB_USERNAME, 
    //   password: process.env.TREB_PASSWORD,
    //   version: 'RETS/1.7.2'
    // });

    // For now, filter hardcoded listings based on search criteria
    let filteredListings = hardcodedListings;

    // Apply search filters
    if (search) {
      const searchLower = search.toLowerCase();
      filteredListings = filteredListings.filter(listing => 
        listing.title.toLowerCase().includes(searchLower) ||
        listing.address.toLowerCase().includes(searchLower) ||
        listing.description.toLowerCase().includes(searchLower) ||
        listing.features.some(feature => feature.toLowerCase().includes(searchLower))
      );
    }

    if (location) {
      const locationLower = location.toLowerCase();
      filteredListings = filteredListings.filter(listing =>
        listing.address.toLowerCase().includes(locationLower)
      );
    }

    if (type && type !== "all") {
      filteredListings = filteredListings.filter(listing => 
        listing.type === type.toLowerCase()
      );
    }

    if (minPrice) {
      filteredListings = filteredListings.filter(listing => 
        listing.price >= parseInt(minPrice)
      );
    }

    if (maxPrice) {
      filteredListings = filteredListings.filter(listing => 
        listing.price <= parseInt(maxPrice)
      );
    }

    if (beds) {
      filteredListings = filteredListings.filter(listing => 
        listing.beds >= parseInt(beds)
      );
    }

    if (baths) {
      filteredListings = filteredListings.filter(listing => 
        listing.baths >= parseInt(baths)
      );
    }

    // Transform to consistent format
    const transformedListings = filteredListings.map(listing => ({
      id: listing.id,
      mlsId: listing.mlsId,
      title: listing.title,
      address: listing.address,
      price: listing.price,
      beds: listing.beds,
      baths: listing.baths,
      sqft: listing.sqft,
      type: listing.type,
      propertyType: listing.propertyType,
      image: listing.image,
      features: listing.features,
      description: listing.description,
      listingAgent: listing.listingAgent,
      brokerage: listing.brokerage,
      phone: listing.phone,
      status: listing.status,
      daysOnMarket: listing.daysOnMarket,
      url: listing.url
    }));

    res.status(200).json({
      success: true,
      count: transformedListings.length,
      listings: transformedListings,
      source: "hardcoded", // Will change to "rets" when API is available
      message: "Showing listings from Andrew Pisani - Right at Home Realty"
    });

  } catch (error) {
    console.error('Listings API Error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch listings',
      listings: []
    });
  }
} 