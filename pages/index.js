import { useState, useRef, useEffect } from "react";
import HeyGenAvatar from "../components/HeyGenAvatar";

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "🚀 Neural Interface Online. I'm AP-Prime, your AI Real Estate Assistant powered by Andrew Pisani from Right at Home Realty. How can I help you find your perfect property in the Greater Toronto Area?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listings, setListings] = useState([]);
  const [showListings, setShowListings] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [avatarReady, setAvatarReady] = useState(false);
  const [avatarSpeaking, setAvatarSpeaking] = useState(false);

  const messagesEndRef = useRef(null);
  const avatarRef = useRef(null);

  // Mount effect to prevent hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle avatar ready state
  const handleAvatarReady = (avatarControls) => {
    console.log('✅ Avatar is ready');
    setAvatarReady(true);
    avatarRef.current = avatarControls;
  };

  // Handle avatar speaking status
  const handleAvatarSpeakingStatus = (speaking) => {
    setAvatarSpeaking(speaking);
  };

  // Speak welcome message when avatar is ready
  useEffect(() => {
    if (avatarReady && avatarRef.current && messages.length > 0) {
      const welcomeMessage = messages[0].content;
      // Speak the welcome message after a short delay
      setTimeout(() => {
        console.log('🎉 Speaking welcome message');
        avatarRef.current.speak(welcomeMessage);
      }, 1000);
    }
  }, [avatarReady]);

  // Don't duplicate announcement - avatar speech comes from API response only

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMessage];

    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      const data = await res.json();
      const assistantReply = data?.reply || "Sorry, I didn't catch that.";
      const avatarSpeech = data?.avatarSpeech || assistantReply;

      // Make avatar speak the response
      if (avatarRef.current && avatarReady) {
        console.log('🗣️ Making avatar speak response');
        avatarRef.current.speak(avatarSpeech);
      } else {
        console.warn('⚠️ Avatar not ready, skipping speech');
      }

      // Handle listings data if available
      console.log('Chat response data:', {
        hasListings: !!data.listings,
        listingsLength: data.listings?.length || 0,
        searchDetected: data.searchDetected,
        avatarSpeech: avatarSpeech.substring(0, 50) + '...',
        listingsData: data.listings
      });
      
      if (data.searchDetected) {
        setSearchPerformed(true); // Mark that a search was performed
      }
      
      if (data.listings && data.listings.length > 0) {
        console.log('Setting listings:', data.listings);
        
        // Set listings first
        setListings(data.listings);
        
        // Then force show listings
        setTimeout(() => {
          setShowListings(true);
          console.log(`Displaying ${data.listings.length} listings from ${data.searchDetected ? 'live search' : 'chat'}`);
          
          // Force scroll to listings section after another short delay
          setTimeout(() => {
            const listingsSection = document.getElementById('listings-section');
            if (listingsSection) {
              listingsSection.scrollIntoView({ behavior: 'smooth' });
            }
          }, 300);
        }, 100);
      } else if (data.searchDetected) {
        // If property search was detected but no listings returned, fetch fallback listings
        console.log('Property search detected but no listings returned, fetching fallback');
        
        // Fetch fallback listings directly from the API
        fetch('/api/listings')
          .then(res => res.json())
          .then(fallbackData => {
            if (fallbackData.listings && fallbackData.listings.length > 0) {
              console.log('Using fallback listings:', fallbackData.listings);
              setListings(fallbackData.listings);
              setShowListings(true);
              
              setTimeout(() => {
                const listingsSection = document.getElementById('listings-section');
                if (listingsSection) {
                  listingsSection.scrollIntoView({ behavior: 'smooth' });
                }
              }, 300);
            }
          })
          .catch(err => {
            console.log('Could not fetch fallback listings:', err);
            setShowListings(false);
          });
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: assistantReply },
      ]);
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "⚠️ Oops, something went wrong. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const openListingModal = (listing) => {
    setSelectedListing(listing);
    setCurrentImageIndex(0);
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
  };

  const closeListingModal = () => {
    setSelectedListing(null);
    setCurrentImageIndex(0);
    document.body.style.overflow = 'unset';
  };

  const nextImage = () => {
    if (selectedListing?.images?.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === selectedListing.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (selectedListing?.images?.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? selectedListing.images.length - 1 : prev - 1
      );
    }
  };





  // Don't render dynamic content until mounted (prevents hydration errors)
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-mono text-cyan-400 mb-4 animate-pulse-glow">
            LOADING PROPERTY SYSTEM...
          </div>
          <div className="w-16 h-1 bg-gradient-to-r from-cyan-500 to-purple-500 animate-electric-pulse mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-gray-100">
      {/* Holographic Grid Overlay */}
      <div className="fixed inset-0 opacity-5 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-transparent to-purple-500/20"></div>
        <div className="data-grid"></div>
      </div>

      {/* Split Banner */}
      <div className="relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-gray-900 to-black"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-purple-500/10"></div>
        
        {/* Animated Scanning Lines */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-data-stream opacity-30"></div>
          <div className="absolute w-full h-0.5 bg-gradient-to-r from-transparent via-purple-400 to-transparent animate-data-stream opacity-30" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="relative z-10 container mx-auto px-6 py-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Side - Content */}
            <div className="space-y-8 animate-fadeInUp">
              <div className="space-y-4">
                <div className="text-sm font-mono text-cyan-400 tracking-widest">
                  TORONTO REAL ESTATE PLATFORM v2.0
                </div>
                <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                  <span className="text-electric-gradient">AP-PRIME</span><br />
                  <span className="text-white">TORONTO</span><br />
                  <span className="text-purple-400">REAL ESTATE</span>
                </h1>
                <p className="text-xl text-gray-400 font-mono max-w-lg">
                  Advanced AI-powered property search system for the Greater Toronto Area. 
                  Smart market analysis and personalized recommendations at your command.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="electric-button group">
                  <span className="relative z-10">INITIATE PROPERTY SCAN</span>
                </button>
                <button className="border border-gray-700 text-gray-300 px-8 py-4 font-mono text-sm hover:border-cyan-500 hover:text-cyan-400 transition-colors duration-300">
                  MARKET ANALYSIS
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-8 pt-8 border-t border-gray-800">
                <div className="text-center">
                  <div className="text-2xl font-bold text-cyan-400">15K+</div>
                  <div className="text-sm text-gray-500 font-mono">PROPERTIES ANALYZED</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">98%</div>
                  <div className="text-sm text-gray-500 font-mono">ACCURACY RATE</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-cyan-400">24/7</div>
                  <div className="text-sm text-gray-500 font-mono">SYSTEM UPTIME</div>
                </div>
              </div>
            </div>

            {/* Right Side - AI Assistant Interface */}
            <div className="space-y-8 animate-slideInRight">
              {/* AI Assistant Container */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-lg blur-xl"></div>
                <div className="relative bg-black/50 border border-gray-800 rounded-lg p-6 backdrop-blur-sm">
                  <div className="text-center mb-4">
                    <div className="text-cyan-400 font-mono text-sm mb-2">
                      PROPERTY ASSISTANT STATUS: <span className={avatarReady ? "text-green-400" : "text-yellow-400"}>{avatarReady ? "ONLINE" : "INITIALIZING..."}</span>
                    </div>
                    <div className="flex justify-center space-x-1 mb-4">
                      <div className={`w-2 h-2 rounded-full ${avatarSpeaking ? 'bg-cyan-400 animate-pulse' : 'bg-gray-600'}`}></div>
                      <div className={`w-2 h-2 rounded-full ${avatarSpeaking ? 'bg-purple-400 animate-pulse' : 'bg-gray-600'}`} style={{ animationDelay: '0.5s' }}></div>
                      <div className={`w-2 h-2 rounded-full ${avatarSpeaking ? 'bg-cyan-400 animate-pulse' : 'bg-gray-600'}`} style={{ animationDelay: '1s' }}></div>
                    </div>
                  </div>

                  {/* Avatar Container */}
                  <div className="relative mb-6">
                    {/* Holographic Overlay Effects */}
                    <div className="absolute inset-0 pointer-events-none z-10">
                      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 rounded-lg"></div>
                      <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-shimmer"></div>
                      <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-purple-400 to-transparent animate-shimmer" style={{ animationDelay: '1s' }}></div>
                    </div>
                    
                    <HeyGenAvatar
                      onReady={handleAvatarReady}
                      onSpeakingStatusChange={handleAvatarSpeakingStatus}
                    />
                  </div>

                  {/* Chat Interface */}
                  <div className="space-y-4">
                    <div className="text-cyan-400 font-mono text-xs text-center">
                      PROPERTY CONSULTATION CHANNEL
                    </div>
                    
                    {/* Messages Display */}
                    <div className="bg-black/30 rounded-lg border border-gray-800/50 h-48 overflow-y-auto p-4 space-y-3 backdrop-blur-sm">
                      {messages.map((m, i) => (
                        <div
                          key={i}
                          className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-xs px-4 py-2 rounded-lg relative ${
                              m.role === "user"
                                ? "bg-gradient-to-r from-cyan-600 to-cyan-500 text-white"
                                : "bg-gray-800/70 text-gray-300 border border-gray-700/50"
                            }`}
                          >
                            {m.role === "assistant" && (
                              <div className="text-cyan-400 text-xs font-mono mb-1">AP-PRIME</div>
                            )}
                            <p className="whitespace-pre-wrap text-sm leading-relaxed">
                              {m.content}
                            </p>
                          </div>
                        </div>
                      ))}
                      {loading && (
                        <div className="flex justify-start">
                          <div className="bg-gray-800/70 px-4 py-3 rounded-lg border border-gray-700/50 relative">
                            <div className="text-cyan-400 text-xs font-mono mb-1">AP-PRIME</div>
                            <div className="flex items-center space-x-2">
                              <div className="text-sm text-gray-400">Analyzing your request</div>
                              <div className="flex space-x-1">
                                <div className="w-1 h-1 bg-cyan-400 rounded-full animate-pulse"></div>
                                <div className="w-1 h-1 bg-cyan-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                                <div className="w-1 h-1 bg-cyan-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="flex space-x-2">
                      <input
                        className="flex-1 bg-black/50 border border-gray-700/50 rounded-lg px-4 py-3 text-gray-300 placeholder-gray-500 font-mono text-sm focus:border-cyan-500 focus:outline-none transition-colors"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask about properties..."
                        disabled={false}
                      />
                      <button
                        className="bg-gradient-to-r from-cyan-600 to-cyan-500 text-white px-6 py-3 rounded-lg font-mono text-sm hover:from-cyan-500 hover:to-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                        onClick={sendMessage}
                        disabled={loading || !input.trim()}
                      >
                        SEND
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

            {/* Property Listings Section - Separate area below chat interface */}
      <div id="listings-section" className="relative border-t border-gray-800">
        {/* Background Effects for Listings Section */}
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-purple-500/5"></div>
        
        <div className="relative z-10 py-16 px-6">
          <div className="container mx-auto">
            {/* Always show section header */}
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4 font-mono">
                LIVE PROPERTY <span className="text-electric-gradient">LISTINGS</span>
              </h2>
              <p className="text-gray-500 font-mono text-sm">
                {showListings && listings.length > 0 
                  ? `LIVE MLS DATA • ${listings.length} PROPERTIES FOUND • POWERED BY ANDREW PISANI`
                  : searchPerformed && listings.length === 0
                  ? "NO PROPERTIES MATCH YOUR CRITERIA • TRY DIFFERENT SEARCH TERMS"
                  : "ASK AP-PRIME TO SEARCH FOR PROPERTIES • VOICE OR TEXT COMMANDS ACCEPTED"
                }
              </p>
            </div>

                        {/* Conditional content based on listings state */}
            {showListings && listings.length > 0 ? (
              /* Show listings grid */
              <>
                {/* Clear Results Button */}
                <div className="text-center mb-8">
                  <button
                    onClick={() => {
                      setShowListings(false);
                      setListings([]);
                    }}
                    className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-6 py-2 rounded font-mono text-xs transition-colors border border-gray-700"
                  >
                    ✕ CLEAR SEARCH RESULTS
                  </button>
                </div>

                {/* Properties Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {listings.map((listing, i) => (
                    <div
                      key={listing.id || listing.mlsId}
                      className="group bg-black/50 border border-gray-800 rounded-lg overflow-hidden hover:border-cyan-500/50 transition-all duration-300 cursor-pointer animate-fadeInUp"
                      style={{ animationDelay: `${i * 0.1}s` }}
                      onClick={() => openListingModal(listing)}
                    >
                      <div className="relative h-48 bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden">
                        <img
                          src={listing.image}
                          alt={listing.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                        <div className="absolute top-4 right-4">
                          <span className="bg-cyan-500 text-black px-2 py-1 rounded text-xs font-bold">
                            {listing.type.toUpperCase()}
                          </span>
                        </div>
                        <div className="absolute top-4 left-4">
                          <span className="bg-purple-600 text-white px-2 py-1 rounded text-xs font-bold">
                            MLS #{listing.mlsId}
                          </span>
                        </div>
                        <div className="absolute bottom-4 left-4">
                          <div className="text-cyan-400 font-mono text-lg font-bold">
                            ${listing.price.toLocaleString()}
                          </div>
                        </div>
                      </div>

                      <div className="p-6">
                        <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-cyan-400 transition-colors">
                          {listing.title}
                        </h3>
                        <p className="text-gray-400 text-sm mb-4 font-mono">{listing.address}</p>
                        
                        <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                          <span>{listing.beds} BEDS</span>
                          <span>{listing.baths} BATHS</span>
                          <span>{listing.sqft} SQFT</span>
                        </div>

                        {listing.features && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {listing.features.slice(0, 3).map((feature, idx) => (
                              <span
                                key={idx}
                                className="bg-gray-800 text-gray-300 px-2 py-1 rounded text-xs font-mono"
                              >
                                {feature}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Agent Info */}
                        <div className="border-t border-gray-700 pt-4 mb-4">
                          <div className="text-cyan-400 text-xs font-mono mb-1">LISTING AGENT</div>
                          <div className="text-white text-sm">{listing.listingAgent || "Andrew Pisani"}</div>
                          <div className="text-gray-400 text-xs">{listing.brokerage || "Right at Home Realty"}</div>
                          <div className="text-gray-400 text-xs">{listing.phone || "416-882-9304"}</div>
                        </div>

                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            openListingModal(listing);
                          }}
                          className="w-full bg-gradient-to-r from-cyan-600 to-cyan-500 text-white py-2 rounded font-mono text-xs hover:from-cyan-500 hover:to-cyan-400 transition-all duration-200"
                        >
                          VIEW FULL DETAILS
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : searchPerformed && listings.length === 0 ? (
              /* No results found after search */
              <div className="text-center py-16">
                <div className="max-w-2xl mx-auto">
                  <div className="text-6xl mb-6">🔍</div>
                  <h3 className="text-2xl font-bold text-white mb-4 font-mono">
                    NO PROPERTIES FOUND
                  </h3>
                  <p className="text-gray-400 mb-8 leading-relaxed">
                    No properties match your current search criteria. Try adjusting your filters or search terms.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                      <div className="text-cyan-400 font-mono text-sm mb-2">TRY DIFFERENT LOCATION</div>
                      <div className="text-gray-300">"Show me properties in Mississauga"</div>
                    </div>
                    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                      <div className="text-cyan-400 font-mono text-sm mb-2">ADJUST PRICE RANGE</div>
                      <div className="text-gray-300">"Find homes under $1.5 million"</div>
                    </div>
                    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                      <div className="text-cyan-400 font-mono text-sm mb-2">CHANGE PROPERTY TYPE</div>
                      <div className="text-gray-300">"Show me townhouses instead"</div>
                    </div>
                    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                      <div className="text-cyan-400 font-mono text-sm mb-2">BROADEN SEARCH</div>
                      <div className="text-gray-300">"Find any properties in GTA"</div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSearchPerformed(false);
                      setListings([]);
                      setShowListings(false);
                    }}
                    className="bg-gradient-to-r from-cyan-600 to-cyan-500 text-white px-8 py-3 rounded font-mono text-sm hover:from-cyan-500 hover:to-cyan-400 transition-all duration-200"
                  >
                    NEW SEARCH
                  </button>

                  <div className="text-gray-500 font-mono text-sm mt-8">
                    OR CALL ANDREW PISANI DIRECTLY: 416-882-9304
                  </div>
                </div>
              </div>
            ) : (
              /* Initial state - ready to search */
              <div className="text-center py-16">
                <div className="max-w-2xl mx-auto">
                  <div className="text-6xl mb-6">🏠</div>
                  <h3 className="text-2xl font-bold text-white mb-4 font-mono">
                    READY TO SEARCH PROPERTIES
                  </h3>
                  <p className="text-gray-400 mb-8 leading-relaxed">
                    Ask AP-Prime to find properties using voice or text commands. Try queries like:
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                      <div className="text-cyan-400 font-mono text-sm mb-2">VOICE COMMAND</div>
                      <div className="text-gray-300">"Show me condos in Toronto under $2 million"</div>
                    </div>
                    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                      <div className="text-cyan-400 font-mono text-sm mb-2">TEXT QUERY</div>
                      <div className="text-gray-300">"Find 3 bedroom houses in Mississauga"</div>
                    </div>
                    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                      <div className="text-cyan-400 font-mono text-sm mb-2">LOCATION SEARCH</div>
                      <div className="text-gray-300">"Looking for waterfront properties"</div>
                    </div>
                    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                      <div className="text-cyan-400 font-mono text-sm mb-2">PRICE RANGE</div>
                      <div className="text-gray-300">"Houses between $1M and $2.5M"</div>
                    </div>
                  </div>

                  <div className="text-gray-500 font-mono text-sm">
                    POWERED BY ANDREW PISANI • RIGHT AT HOME REALTY • 416-882-9304
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Listing Detail Modal */}
      {selectedListing && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-fadeIn"
          onClick={closeListingModal}
        >
          <div 
            className="relative bg-gradient-to-br from-gray-900 to-black border border-cyan-500/30 rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-slideInUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={closeListingModal}
              className="absolute top-4 right-4 z-10 bg-black/80 hover:bg-red-600 text-white rounded-full p-2 w-10 h-10 flex items-center justify-center transition-colors border border-gray-700"
            >
              ✕
            </button>

            {/* Image Gallery Section */}
            <div className="relative h-96 bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden rounded-t-2xl">
              <img
                src={selectedListing.images?.[currentImageIndex] || selectedListing.image}
                alt={selectedListing.title}
                className="w-full h-full object-cover"
              />
              
              {/* MLS Badge */}
              <div className="absolute top-4 left-4">
                <span className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg">
                  MLS #{selectedListing.mlsId}
                </span>
              </div>

              {/* Property Type Badge */}
              <div className="absolute top-4 right-20">
                <span className="bg-cyan-500 text-black px-4 py-2 rounded-lg text-sm font-bold shadow-lg">
                  {selectedListing.type.toUpperCase()}
                </span>
              </div>

              {/* Image Navigation */}
              {selectedListing.images?.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/80 hover:bg-cyan-600 text-white rounded-full p-3 transition-colors"
                  >
                    ←
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/80 hover:bg-cyan-600 text-white rounded-full p-3 transition-colors"
                  >
                    →
                  </button>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/80 px-3 py-1 rounded-full text-white text-sm">
                    {currentImageIndex + 1} / {selectedListing.images.length}
                  </div>
                </>
              )}

              {/* Price Overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-6">
                <div className="text-cyan-400 font-mono text-4xl font-bold">
                  ${selectedListing.price.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Content Section */}
            <div className="p-8 space-y-6">
              {/* Title & Address */}
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">{selectedListing.title}</h2>
                <p className="text-gray-400 text-lg font-mono">{selectedListing.address}</p>
              </div>

              {/* Property Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 text-center">
                  <div className="text-cyan-400 text-2xl font-bold">{selectedListing.beds}</div>
                  <div className="text-gray-400 text-sm font-mono">BEDROOMS</div>
                </div>
                <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 text-center">
                  <div className="text-cyan-400 text-2xl font-bold">{selectedListing.baths}</div>
                  <div className="text-gray-400 text-sm font-mono">BATHROOMS</div>
                </div>
                <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 text-center">
                  <div className="text-cyan-400 text-2xl font-bold">{selectedListing.sqft.toLocaleString()}</div>
                  <div className="text-gray-400 text-sm font-mono">SQFT</div>
                </div>
                <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 text-center">
                  <div className="text-cyan-400 text-2xl font-bold">{selectedListing.daysOnMarket || 'N/A'}</div>
                  <div className="text-gray-400 text-sm font-mono">DAYS ON MARKET</div>
                </div>
              </div>

              {/* Features */}
              {selectedListing.features && selectedListing.features.length > 0 && (
                <div>
                  <h3 className="text-cyan-400 font-mono text-sm mb-3">PROPERTY FEATURES</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedListing.features.map((feature, idx) => (
                      <span
                        key={idx}
                        className="bg-gradient-to-r from-gray-800 to-gray-700 text-gray-300 px-4 py-2 rounded-lg text-sm font-mono border border-gray-600"
                      >
                        ✓ {feature}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              {selectedListing.description && (
                <div>
                  <h3 className="text-cyan-400 font-mono text-sm mb-3">PROPERTY DESCRIPTION</h3>
                  <p className="text-gray-300 leading-relaxed">{selectedListing.description}</p>
                </div>
              )}

              {/* Agent Contact Section */}
              <div className="bg-gradient-to-r from-gray-800/80 to-gray-900/80 border border-cyan-500/30 rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <div className="text-cyan-400 font-mono text-xs mb-1">LISTING AGENT</div>
                    <div className="text-white text-2xl font-bold">Andrew Pisani</div>
                    <div className="text-gray-400 text-sm">{selectedListing.brokerage || "Right at Home Realty, Brokerage"}</div>
                    <div className="text-cyan-400 font-mono text-lg mt-2">📞 416-882-9304</div>
                    <div className="text-gray-400 text-sm">🏢 Office: 289-357-3000</div>
                  </div>
                  <div className="hidden md:block w-32 h-32 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-full flex items-center justify-center text-white text-5xl font-bold">
                    AP
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <a
                    href={selectedListing.contactUrl || `https://api.whatsapp.com/send?phone=14168829304&text=Hi%20Andrew,%20I'm%20interested%20in%20MLS%23${selectedListing.mlsId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white py-3 px-6 rounded-lg font-mono text-sm text-center transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <span>💬</span> CONTACT VIA WHATSAPP
                  </a>
                  
                  <a
                    href="https://www.andrewpisani.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white py-3 px-6 rounded-lg font-mono text-sm text-center transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <span>🏠</span> MORE LISTINGS
                  </a>
                  
                  <a
                    href={selectedListing.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white py-3 px-6 rounded-lg font-mono text-sm text-center transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <span>🔗</span> VIEW ON REALTOR.CA
                  </a>
                </div>
              </div>

              {/* Property Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-4">
                  <div className="text-cyan-400 font-mono text-xs mb-2">STATUS</div>
                  <div className="text-white">{selectedListing.status || 'Active'}</div>
                </div>
                <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-4">
                  <div className="text-cyan-400 font-mono text-xs mb-2">PROPERTY TYPE</div>
                  <div className="text-white">{selectedListing.propertyType || selectedListing.type}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="relative border-t border-gray-800 py-8">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black"></div>
        <div className="relative z-10 container mx-auto px-6">
          <div className="text-center">
            <div className="text-gray-500 font-mono text-sm">
              Design and developed by{' '}
              <a 
                href="https://kodekins.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                kodekins.com
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
