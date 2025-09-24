import { useState, useRef, useEffect } from "react";

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "🚀 Neural Interface Online. I'm AP-Prime, your AI Real Estate Assistant. How can I help you find your perfect property in Toronto?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [sortBy, setSortBy] = useState("price");
  const [mounted, setMounted] = useState(false);

  const messagesEndRef = useRef(null);
  const iframeRef = useRef(null);

  // Mount effect to prevent hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send postMessage to HeyGen iframe to start speaking automatically
  useEffect(() => {
    if (!iframeRef.current) return;

    const host = "https://labs.heygen.com";

    const startAvatar = () => {
      const iframeWindow = iframeRef.current.contentWindow;
      iframeWindow.postMessage({ type: "streaming-embed", action: "init" }, host);
      iframeWindow.postMessage({ type: "streaming-embed", action: "show" }, host);
    };

    iframeRef.current.addEventListener("load", startAvatar);
    return () => {
      iframeRef.current.removeEventListener("load", startAvatar);
    };
  }, []);

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

  // Sample property listings with enhanced data
  const listings = [
    {
      id: 1,
      title: "Luxury Downtown Condo",
      address: "123 Bay Street, Toronto",
      price: 1250000,
      beds: 2,
      baths: 2,
      sqft: 1200,
      type: "condo",
      image: "/avatar-placeholder.png",
      features: ["City View", "Gym", "Concierge"],
      url: "https://www.realtor.ca/listing/123"
    },
    {
      id: 2,
      title: "Modern Family Home",
      address: "456 Queen Street West, Toronto",
      price: 1850000,
      beds: 4,
      baths: 3,
      sqft: 2400,
      type: "house",
      image: "/avatar-placeholder1.png",
      features: ["Garage", "Backyard", "Updated Kitchen"],
      url: "https://www.realtor.ca/listing/456"
    },
    {
      id: 3,
      title: "Penthouse Suite",
      address: "789 King Street, Toronto",
      price: 3200000,
      beds: 3,
      baths: 3,
      sqft: 2800,
      type: "penthouse",
      image: "/avatar-placeholder copy.png",
      features: ["Terrace", "Premium Finishes", "Parking"],
      url: "https://www.realtor.ca/listing/789"
    },
    {
      id: 4,
      title: "Artistic Loft",
      address: "321 Richmond Street, Toronto",
      price: 950000,
      beds: 1,
      baths: 1,
      sqft: 900,
      type: "loft",
      image: "/avatar-placeholder.png",
      features: ["High Ceilings", "Exposed Brick", "Downtown"],
      url: "https://www.realtor.ca/listing/321"
    },
    {
      id: 5,
      title: "Waterfront Condo",
      address: "555 Harbour Street, Toronto",
      price: 1650000,
      beds: 2,
      baths: 2,
      sqft: 1400,
      type: "condo",
      image: "/avatar-placeholder1.png",
      features: ["Water View", "Pool", "24h Security"],
      url: "https://www.realtor.ca/listing/555"
    },
    {
      id: 6,
      title: "Heritage House",
      address: "777 Rosedale Valley Road, Toronto",
      price: 2750000,
      beds: 5,
      baths: 4,
      sqft: 3200,
      type: "house",
      image: "/avatar-placeholder copy.png",
      features: ["Historic", "Large Lot", "Renovated"],
      url: "https://www.realtor.ca/listing/777"
    }
  ];

  // Filter and search functionality
  const filteredListings = listings.filter(listing => {
    const matchesFilter = selectedFilter === "all" || listing.type === selectedFilter;
    const matchesSearch = listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         listing.address.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  }).sort((a, b) => {
    switch (sortBy) {
      case "price-low": return a.price - b.price;
      case "price-high": return b.price - a.price;
      case "beds": return b.beds - a.beds;
      default: return a.price - b.price;
    }
  });

  // Don't render dynamic content until mounted (prevents hydration errors)
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-mono text-cyan-400 mb-4 animate-pulse-glow">
            INITIALIZING NEURAL INTERFACE...
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
                  NEURAL REAL ESTATE MATRIX v2.0
                </div>
                <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                  <span className="text-electric-gradient">AP-PRIME</span><br />
                  <span className="text-white">TORONTO</span><br />
                  <span className="text-purple-400">REAL ESTATE</span>
                </h1>
                <p className="text-xl text-gray-400 font-mono max-w-lg">
                  Advanced AI-powered property intelligence system for the Greater Toronto Area. 
                  Neural network-enhanced market analysis at your command.
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
                  <div className="text-sm text-gray-500 font-mono">NEURAL UPTIME</div>
                </div>
              </div>
            </div>

            {/* Right Side - Neural Interface */}
            <div className="space-y-8 animate-slideInRight">
              {/* Neural Interface Container */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-lg blur-xl"></div>
                <div className="relative bg-black/50 border border-gray-800 rounded-lg p-6 backdrop-blur-sm">
                  <div className="text-center mb-4">
                    <div className="text-cyan-400 font-mono text-sm mb-2">
                      NEURAL INTERFACE STATUS: <span className="text-green-400">ONLINE</span>
                    </div>
                    <div className="flex justify-center space-x-1 mb-4">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
                    </div>
                  </div>

                  {/* Avatar Container */}
                  <div className="relative mb-6">
                    {/* Holographic Overlay Effects */}
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 rounded-lg"></div>
                      <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-shimmer"></div>
                      <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-purple-400 to-transparent animate-shimmer" style={{ animationDelay: '1s' }}></div>
                    </div>
                    
                    <div className="relative bg-black/30 rounded-lg overflow-hidden aspect-video">
                      <iframe
                        ref={iframeRef}
                        src="https://labs.heygen.com/guest/streaming-embed?share=eyJxdWFsaXR5IjoiaGlnaCIsImF2YXRhck5hbWUiOiJQZWRyb19DaGFpcl9TaXR0aW5nX3B1YmxpYyIsInByZXZpZXdJbWciOiJodHRwczovL2ZpbGVzMi5oZXlnZW4uYWkvYXZhdGFyL3YzLzkyZGU3OWU1MzNhODQyMWJiODZkYTYzYTBlNWViMTJmXzU3MDEwL3ByZXZpZXdfdGFyZ2V0LndlYnAiLCJuZWVkUmVtb3ZlQmFja2dyb3VuZCI6ZmFsc2UsImtub3dsZWRnZUJhc2VJZCI6IjAzNzIwN2YyNDc2NzQ0MGY5ZmQ0YjI3MTNmZDQzMmZiIiwidXNlcm5hbWUiOiJiYTA5Yjc4ZDg0NDM0YWExYjBjOWE0ZGE0MmJlOWJlYSJ9&inIFrame=1&autoplay=1"
                        title="AP-Prime Neural Interface"
                        className="w-full h-full cursor-pointer"
                        allow="microphone; autoplay; camera"
                        sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-presentation"
                      />
                    </div>
                  </div>

                  {/* Chat Interface */}
                  <div className="space-y-4">
                    <div className="text-cyan-400 font-mono text-xs text-center">
                      NEURAL COMMUNICATION CHANNEL
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
                              <div className="text-sm text-gray-400">Processing neural pathways</div>
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
                        placeholder="Enter neural command..."
                        disabled={false}
                      />
                      <button
                        className="bg-gradient-to-r from-cyan-600 to-cyan-500 text-white px-6 py-3 rounded-lg font-mono text-sm hover:from-cyan-500 hover:to-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                        onClick={sendMessage}
                        disabled={loading || !input.trim()}
                      >
                        TRANSMIT
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Property Database Section */}
      <div className="relative py-20 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 font-mono">
              PROPERTY <span className="text-electric-gradient">DATABASE</span>
            </h2>
            <p className="text-gray-500 font-mono text-sm">ACCESSING NEURAL NETWORK DATA • {filteredListings.length} PROPERTIES FOUND</p>
          </div>

          {/* Enhanced Filters and Search */}
          <div className="mb-8 space-y-4">
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search properties..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-gray-300 font-mono text-sm placeholder-gray-500 focus:border-cyan-500 focus:outline-none transition-colors"
                />
                <div className="absolute right-3 top-3 text-cyan-400 text-xs font-mono">
                  SEARCH
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap justify-center gap-4">
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="px-4 py-2 bg-black border border-gray-700 rounded text-gray-300 font-mono text-xs focus:border-cyan-500 focus:outline-none"
              >
                <option value="all">ALL TYPES</option>
                <option value="condo">CONDOS</option>
                <option value="house">HOUSES</option>
                <option value="penthouse">PENTHOUSES</option>
                <option value="loft">LOFTS</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 bg-black border border-gray-700 rounded text-gray-300 font-mono text-xs focus:border-cyan-500 focus:outline-none"
              >
                <option value="price">PRICE: LOW TO HIGH</option>
                <option value="price-high">PRICE: HIGH TO LOW</option>
                <option value="beds">BEDROOMS</option>
              </select>
            </div>
          </div>

          {/* Properties Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map((listing, i) => (
              <div
                key={listing.id}
                className="group bg-black/50 border border-gray-800 rounded-lg overflow-hidden hover:border-cyan-500/50 transition-all duration-300 cursor-pointer animate-fadeInUp"
                style={{ animationDelay: `${i * 0.1}s` }}
                onClick={() => window.open(listing.url, '_blank')}
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

                  <button className="w-full bg-gradient-to-r from-gray-800 to-gray-700 text-gray-300 py-2 rounded font-mono text-xs hover:from-cyan-600 hover:to-cyan-500 hover:text-white transition-all duration-200">
                    VIEW PROPERTY DATA
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
