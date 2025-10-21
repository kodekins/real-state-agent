# HeyGen Avatar Integration Guide

## Overview
This project integrates a HeyGen AI avatar that speaks responses from your real estate chat API and reacts to property listings data.

## Features Implemented

### 1. **HeyGen Avatar Component** (`components/HeyGenAvatar.js`)
- Interactive avatar that can speak text
- Real-time status indicators (Online/Offline, Speaking)
- Message queue system for handling multiple speech requests
- PostMessage API integration with HeyGen iframe
- Error handling and loading states

### 2. **Chat API Integration** (`pages/api/chat.js`)
- Added `avatarSpeech` field to API responses
- Speech-optimized text formatting for natural conversation
- Automatic property listing summaries for voice output
- Handles different scenarios:
  - Properties found: Announces count and top listing
  - No properties: Suggests alternatives
  - Errors: Provides contact information

### 3. **HeyGen Streaming API** (`pages/api/heygen-stream.js`)
- REST API endpoint for HeyGen control
- Actions: `start_session`, `speak`, `stop_session`
- Ready for full HeyGen API integration (requires API key)

### 4. **Frontend Integration** (`pages/index.js`)
- Replaced iframe-only approach with interactive component
- Avatar speaks all assistant responses automatically
- Welcome message on avatar load
- Announces when listings are displayed
- Visual indicators for avatar status (ready, speaking)
- Synchronized chat and speech flow

## How It Works

```
User Input → Chat API → Gemini AI + AMPRE API → Response + Listings
                                                         ↓
                                    Avatar Speech ← Format for Voice
                                          ↓
                                    HeyGen Avatar Speaks
                                          ↓
                                    Listings Display Below
```

## Setup Instructions

### 1. Environment Variables
Add to your `.env.local` file:

```env
# Existing variables
GEMINI_API_KEY=your_gemini_api_key
AMPRE_API_TOKEN=your_ampre_api_token
AMPRE_API_URL=https://query.ampre.ca

# Optional: For advanced HeyGen API integration
HEYGEN_API_KEY=your_heygen_api_key
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Development Server
```bash
npm run dev
```

## Testing the Integration

### Test Scenario 1: Property Search
1. Open http://localhost:3000
2. Wait for "PROPERTY ASSISTANT STATUS: ONLINE" indicator
3. Type: "Show me condos in Toronto under $1 million"
4. **Expected Behavior:**
   - Avatar speaks the response
   - Listings appear below
   - Avatar announces listings count

### Test Scenario 2: No Results
1. Type: "Show me properties for $1"
2. **Expected Behavior:**
   - Avatar speaks no results message
   - Suggests alternatives
   - No listings displayed

### Test Scenario 3: General Question
1. Type: "How is the Toronto real estate market?"
2. **Expected Behavior:**
   - Avatar speaks general market information
   - No listings triggered

### Test Scenario 4: Multiple Questions
1. Ask several questions in sequence
2. **Expected Behavior:**
   - Avatar queues responses
   - Speaks them one by one
   - No overlapping speech

## Visual Indicators

### Avatar Status
- **Yellow "INITIALIZING..."**: Avatar loading
- **Green "ONLINE"**: Avatar ready
- **🗣️ SPEAKING**: Currently speaking
- **Pulsing dots**: Visual speaking indicator

### Chat Integration
- Messages appear in chat window
- Avatar speaks simultaneously
- Listings scroll into view automatically

## API Response Format

### Chat API Response
```json
{
  "reply": "Full text response for display",
  "avatarSpeech": "Optimized text for voice synthesis",
  "listings": [...],
  "hasListings": true,
  "searchDetected": true,
  "listingsCount": 5
}
```

### Speech Optimization Examples

**Display Text:**
> "I found 3 excellent properties. The first is a 2-bedroom condo at 123 King St for $899,000 with pool, gym, and concierge."

**Avatar Speech:**
> "I found 3 properties that match your search. The first one is a 2-bedroom condo in Toronto for $899,000. You can see all the details on the screen below."

## Troubleshooting

### Avatar Not Speaking
1. Check browser console for errors
2. Verify "PROPERTY ASSISTANT STATUS" shows "ONLINE"
3. Check that `avatarRef.current` exists in console
4. Ensure browser allows autoplay audio

### Listings Not Displaying
1. Check `/api/chat` response in Network tab
2. Verify `AMPRE_API_TOKEN` is configured
3. Check console for API errors
4. Try broader search criteria

### Speech Queue Issues
1. Clear message queue: Refresh page
2. Check for JavaScript errors
3. Verify PostMessage communication with iframe

## Advanced: Full HeyGen API Integration

Currently using iframe embed (reliable, easy setup). For production:

1. Get HeyGen API key from https://heygen.com
2. Add to `.env.local`: `HEYGEN_API_KEY=your_key`
3. Update `HeyGenAvatar.js` to use streaming API:
   - Call `/api/heygen-stream` with action: `start_session`
   - Replace iframe with streaming video element
   - Use WebRTC for real-time avatar

## Benefits of This Integration

✅ **Natural Interaction**: Avatar speaks responses in natural language
✅ **API Connected**: Responds to real MLS data from AMPRE
✅ **Visual + Audio**: Both text and voice responses
✅ **Professional**: Enhances user experience with AI avatar
✅ **Scalable**: Easy to extend with more features

## Future Enhancements

- Voice input (user speaks to avatar)
- Multi-language support
- Custom avatar training on property data
- Video responses for specific properties
- Screen share integration for virtual tours

## Support

For issues or questions:
- Email: support@kodekins.com
- Documentation: https://docs.heygen.com
- AMPRE API: https://ampre.ca/docs

---

**Built by kodekins.com**

