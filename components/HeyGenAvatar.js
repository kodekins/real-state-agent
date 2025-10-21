import { useState, useEffect, useRef } from 'react';

export default function HeyGenAvatar({ onReady, onSpeakingStatusChange }) {
  const [sessionId, setSessionId] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState(null);
  const iframeRef = useRef(null);
  const messageQueueRef = useRef([]);
  const processingRef = useRef(false);

  // Initialize HeyGen session when component mounts
  useEffect(() => {
    initializeSession();
    
    return () => {
      // Cleanup session on unmount
      if (sessionId) {
        stopSession();
      }
    };
  }, []);

  // Notify parent when avatar is ready
  useEffect(() => {
    if (isReady && onReady) {
      onReady({ speak: speakText });
    }
  }, [isReady]);

  // Notify parent of speaking status changes
  useEffect(() => {
    if (onSpeakingStatusChange) {
      onSpeakingStatusChange(isSpeaking);
    }
  }, [isSpeaking]);

  // Process message queue
  useEffect(() => {
    if (!processingRef.current && messageQueueRef.current.length > 0 && isReady) {
      processNextMessage();
    }
  }, [isReady, messageQueueRef.current.length]);

  const initializeSession = async () => {
    try {
      console.log('🎭 Initializing HeyGen avatar session...');
      
      // For now, use the iframe embed approach (more reliable)
      // In production, you'd use the full HeyGen API integration
      setIsReady(true);
      setError(null);
      
      console.log('✅ Avatar ready (iframe mode)');
    } catch (err) {
      console.error('❌ Failed to initialize HeyGen session:', err);
      setError(err.message);
      setIsReady(false);
    }
  };

  const processNextMessage = async () => {
    if (processingRef.current || messageQueueRef.current.length === 0) return;
    
    processingRef.current = true;
    const text = messageQueueRef.current.shift();
    
    try {
      await sendMessageToAvatar(text);
      
      // Simulate speaking duration based on text length
      const duration = Math.max(2000, text.length * 50); // ~50ms per character
      setIsSpeaking(true);
      
      setTimeout(() => {
        setIsSpeaking(false);
        processingRef.current = false;
        
        // Process next message if any
        if (messageQueueRef.current.length > 0) {
          processNextMessage();
        }
      }, duration);
      
    } catch (err) {
      console.error('❌ Failed to make avatar speak:', err);
      processingRef.current = false;
      setIsSpeaking(false);
    }
  };

  const sendMessageToAvatar = async (text) => {
    if (!iframeRef.current) return;
    
    try {
      // Send message to HeyGen iframe using postMessage
      const host = 'https://labs.heygen.com';
      const iframeWindow = iframeRef.current.contentWindow;
      
      console.log('🗣️ Sending text to avatar:', text.substring(0, 50) + '...');
      
      // HeyGen's iframe accepts messages in this format
      iframeWindow.postMessage({
        type: 'streaming-embed',
        action: 'speak',
        text: text
      }, host);
      
    } catch (err) {
      console.error('❌ Error sending message to avatar:', err);
      throw err;
    }
  };

  const speakText = (text) => {
    if (!text || !isReady) {
      console.warn('⚠️ Cannot speak: Avatar not ready or no text provided');
      return;
    }
    
    console.log('📢 Queuing text for avatar:', text.substring(0, 50) + '...');
    messageQueueRef.current.push(text);
    
    // Start processing if not already processing
    if (!processingRef.current) {
      processNextMessage();
    }
  };

  const stopSession = async () => {
    if (!sessionId) return;
    
    try {
      await fetch('/api/heygen-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'stop_session',
          sessionId: sessionId
        })
      });
      
      setSessionId(null);
      setIsReady(false);
    } catch (err) {
      console.error('Failed to stop session:', err);
    }
  };

  // Listen for messages from the HeyGen iframe
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.origin !== 'https://labs.heygen.com') return;
      
      const { type, action, data } = event.data;
      
      if (type === 'streaming-embed') {
        console.log('📨 Received message from HeyGen:', { action, data });
        
        switch (action) {
          case 'ready':
            setIsReady(true);
            break;
          case 'speaking':
            setIsSpeaking(true);
            break;
          case 'finished':
            setIsSpeaking(false);
            processingRef.current = false;
            if (messageQueueRef.current.length > 0) {
              processNextMessage();
            }
            break;
          case 'error':
            console.error('Avatar error:', data);
            setIsSpeaking(false);
            processingRef.current = false;
            break;
        }
      }
    };
    
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Auto-start the avatar when iframe loads
  useEffect(() => {
    if (!iframeRef.current) return;

    const host = 'https://labs.heygen.com';

    const startAvatar = () => {
      const iframeWindow = iframeRef.current.contentWindow;
      iframeWindow.postMessage({ type: 'streaming-embed', action: 'init' }, host);
      iframeWindow.postMessage({ type: 'streaming-embed', action: 'show' }, host);
    };

    iframeRef.current.addEventListener('load', startAvatar);
    return () => {
      if (iframeRef.current) {
        iframeRef.current.removeEventListener('load', startAvatar);
      }
    };
  }, []);

  return (
    <div className="relative">
      {/* Status Indicators */}
      <div className="absolute top-2 left-2 z-10 flex items-center space-x-2">
        <div className={`px-3 py-1 rounded-full text-xs font-mono ${
          isReady ? 'bg-green-500/80 text-white' : 'bg-yellow-500/80 text-black'
        }`}>
          {isReady ? '● ONLINE' : '○ LOADING...'}
        </div>
        
        {isSpeaking && (
          <div className="px-3 py-1 rounded-full text-xs font-mono bg-cyan-500/80 text-white animate-pulse">
            🗣️ SPEAKING
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="absolute top-12 left-2 right-2 z-10 bg-red-500/90 text-white px-3 py-2 rounded text-xs">
          Error: {error}
        </div>
      )}

      {/* Avatar Display */}
      <div className="relative bg-black/30 rounded-lg overflow-hidden aspect-video">
        <iframe
          ref={iframeRef}
          src="https://labs.heygen.com/guest/streaming-embed?share=eyJxdWFsaXR5IjoiaGlnaCIsImF2YXRhck5hbWUiOiJLYXR5YV9DaGFpcl9TaXR0aW5nX3B1YmxpYyIsInByZXZpZXdJbWciOiJodHRwczovL2ZpbGVzMi5oZXlnZW4uYWkvYXZhdGFyL3YzL2IxZmY1ZWRiZjk2MjQyZTZhYzk0NjkyMjdkZjQwOTI0XzU1MzYwL3ByZXZpZXdfdGFyZ2V0LndlYnAiLCJuZWVkUmVtb3ZlQmFja2dyb3VuZCI6ZmFsc2UsImtub3dsZWRnZUJhc2VJZCI6ImI2MTU0ZGU1NTJhNTQzOWRhZTAzODUyOGI1NzI0ZTFlIiwidXNlcm5hbWUiOiI4NjAwMmUyMzA2Nzk0MTg5YjdjOTUyNWY1Njc1YmEyYiJ9"
          title="AP-Prime AI Assistant"
          className="w-full h-full"
          allow="microphone; autoplay; camera"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-presentation"
        />
      </div>

      {/* Speaking Indicator */}
      {isSpeaking && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-1">
          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
        </div>
      )}
    </div>
  );
}

