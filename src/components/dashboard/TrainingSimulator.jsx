import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../supabaseClient';
import { Conversation } from '@elevenlabs/client';

const TrainingSimulator = () => {
  const [clientes, setClientes] = useState([]);
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [conversationStatus, setConversationStatus] = useState('idle'); // idle, connecting, connected, ended
  const conversationRef = useRef(null);
  const [transcript, setTranscript] = useState([]);
  const [conversationId, setConversationId] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isTrainingStarted, setIsTrainingStarted] = useState(false);
  const [isEndingCall, setIsEndingCall] = useState(false);

  useEffect(() => {
    fetchClientes();
  }, []);

  const fetchClientes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setClientes(data || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCliente = (cliente) => {
    console.log('📋 Selected client:', cliente.nome);
    setSelectedCliente(cliente);
    setIsCallActive(true);
    setIsTrainingStarted(false);
  };

  const handleStartTraining = async () => {
    console.log('🚀 Starting training session for:', selectedCliente.nome);
    setIsConnecting(true);
    setConversationStatus('connecting');
    setTranscript([]);
    setIsTrainingStarted(true);

    try {
      const agentId = import.meta.env.VITE_ELEVENLABS_AGENT_ID;
      const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;

      console.log('🔑 Agent ID:', agentId);
      console.log('🔑 API Key exists:', !!apiKey);

      if (!agentId || !apiKey) {
        console.error('❌ ElevenLabs credentials not found in environment variables');
        alert('ElevenLabs configuration missing. Please check your .env file.');
        setIsConnecting(false);
        setConversationStatus('idle');
        return;
      }

      // Check microphone permissions
      console.log('🎤 Checking microphone permissions...');
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioInputs = devices.filter(device => device.kind === 'audioinput');
        console.log('🎤 Available audio inputs:', audioInputs.length);
        audioInputs.forEach((device, i) => {
          console.log(`  ${i + 1}. ${device.label || 'Unnamed device'} (${device.deviceId})`);
        });

        if (audioInputs.length === 0) {
          throw new Error('No microphone found. Please connect a microphone and try again.');
        }

        // Request microphone permission
        console.log('🎤 Requesting microphone access...');
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        console.log('✅ Microphone access granted');
        stream.getTracks().forEach(track => track.stop()); // Stop the test stream
      } catch (micError) {
        console.error('❌ Microphone error:', micError);
        
        let errorMessage = `Microphone Error: ${micError.message}\n\n`;
        
        if (micError.message.includes('CoreAudioCaptureSource')) {
          errorMessage += `Safari Issue Detected!\n\n` +
            `This is a known Safari bug. Please try:\n` +
            `1. Use Chrome or Edge browser (recommended)\n` +
            `2. Or restart Safari and try again\n` +
            `3. Check System Settings → Privacy & Security → Microphone → Safari`;
        } else {
          errorMessage += `Please allow microphone access in your browser settings.`;
        }
        
        alert(errorMessage);
        setIsConnecting(false);
        setConversationStatus('idle');
        setIsCallActive(false);
        return;
      }

      // Create conversation with client context
      console.log('🔌 Starting ElevenLabs conversation...');
      
      const conversation = await Conversation.startSession({
        agentId: agentId,
        connectionType: 'webrtc', // Use WebRTC for better performance
        onConnect: () => {
          console.log('✅ Connected to ElevenLabs');
          // Get conversation ID after connection is established
          setTimeout(() => {
            const convId = conversationRef.current?.getId();
            if (convId) {
              console.log('📞 Conversation ID:', convId);
              setConversationId(convId);
            }
          }, 100);
          setIsConnecting(false);
          setConversationStatus('connected');
        },
        onDisconnect: () => {
          console.log('📴 Disconnected from ElevenLabs');
          setConversationStatus('ended');
        },
        onMessage: (message) => {
          console.log('💬 Message:', message);
          setTranscript(prev => [...prev, message]);
        },
        onError: (error) => {
          console.error('❌ ElevenLabs error:', error);
          alert('Connection error: ' + error.message);
          setIsConnecting(false);
          setConversationStatus('idle');
        },
        onStatusChange: (status) => {
          console.log('📊 Status changed:', status);
        },
        onModeChange: (mode) => {
          console.log('🎙️ Mode changed:', mode);
        },
      });

      conversationRef.current = conversation;
      console.log('✅ Conversation started successfully');

    } catch (error) {
      console.error('Failed to start conversation:', error);
      alert('Failed to start training session: ' + error.message);
      setIsConnecting(false);
      setConversationStatus('idle');
      setIsCallActive(false);
    }
  };

  const handleToggleMute = () => {
    if (conversationRef.current) {
      const newMutedState = !isMuted;
      conversationRef.current.setMicMuted(newMutedState);
      setIsMuted(newMutedState);
      console.log(newMutedState ? '🔇 Microphone muted' : '🔊 Microphone unmuted');
    }
  };

  const handleEndCall = async () => {
    // Prevent double-clicking
    if (isEndingCall) {
      console.log('⚠️ Already ending call, please wait...');
      return;
    }
    
    setIsEndingCall(true);
    console.log('🛑 Ending training session...');
    console.log('📊 Training started:', isTrainingStarted);
    console.log('📊 Conversation ref exists:', !!conversationRef.current);
    
    try {
      // End the ElevenLabs conversation
      if (conversationRef.current) {
        console.log('🔌 Ending ElevenLabs session...');
        try {
          await conversationRef.current.endSession();
          console.log('✅ ElevenLabs session ended successfully');
        } catch (endError) {
          console.error('❌ Error ending ElevenLabs session:', endError);
        }
        conversationRef.current = null;
      } else {
        console.log('⚠️ No active conversation to end');
      }

      // Fetch full conversation data from ElevenLabs API with retry logic
      let conversationData = null;
      if (conversationId) {
        try {
          const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;
          
          // Wait a bit for ElevenLabs to process the conversation
          console.log('⏳ Waiting 3 seconds for ElevenLabs to process conversation...');
          await new Promise(resolve => setTimeout(resolve, 3000));
          
          // Retry up to 3 times if still processing
          let retries = 3;
          let isProcessing = true;
          
          while (retries > 0 && isProcessing) {
            console.log(`🔄 Fetching conversation data (${4 - retries}/3)...`);
            
            const response = await fetch(
              `https://api.elevenlabs.io/v1/convai/conversations/${conversationId}`,
              {
                headers: {
                  'xi-api-key': apiKey,
                },
              }
            );

            if (response.ok) {
              conversationData = await response.json();
              
              // Check if still processing
              if (conversationData.status === 'processing') {
                console.log('⏳ Conversation still processing, waiting 5 more seconds...');
                retries--;
                if (retries > 0) {
                  await new Promise(resolve => setTimeout(resolve, 5000));
                }
              } else {
                console.log('✅ Conversation data ready!');
                isProcessing = false;
              }
            } else {
              console.error('❌ Failed to fetch conversation:', response.status);
              break;
            }
          }
          
          if (isProcessing) {
            console.log('⚠️ Conversation still processing after retries. Data will be incomplete.');
          }
          
          console.log('📊 Final conversation data:', conversationData);
          
          // Save the audio API endpoint URL (not the blob, but the API URL to fetch it later)
          if (conversationData && conversationData.conversation_id) {
            // Store the ElevenLabs API endpoint URL that can be used to fetch the audio
            conversationData.recording_url = `https://api.elevenlabs.io/v1/convai/conversations/${conversationData.conversation_id}/audio`;
            console.log('✅ Audio API URL saved:', conversationData.recording_url);
          }
        } catch (error) {
          console.error('❌ Error fetching conversation data:', error);
        }
      }

      // Save training session to Supabase with full ElevenLabs data (only if training was started)
      if (selectedCliente && isTrainingStarted && conversationId) {
        const { data: comercialData } = await supabase
          .from('comerciais')
          .select('id')
          .limit(1)
          .single();

        if (comercialData) {
          // Extract score from evaluation criteria
          let score = null;
          const evaluationResults = conversationData?.analysis?.evaluation_criteria_results || {};
          if (evaluationResults.sales_effectiveness_score) {
            // Try to extract numeric score from the rationale
            const rationale = evaluationResults.sales_effectiveness_score.rationale || '';
            const scoreMatch = rationale.match(/(\d+)\/10|score[:\s]+(\d+)|(\d+)\s*out of 10/i);
            if (scoreMatch) {
              score = parseInt(scoreMatch[1] || scoreMatch[2] || scoreMatch[3]);
            }
          }

          // Extract improvement areas from data collection
          const dataCollection = conversationData?.analysis?.data_collection_results || {};
          const improvementAreas = dataCollection.improvement_areas?.value;
          const pontosArray = improvementAreas ? improvementAreas.split(',').map(s => s.trim()) : null;

          // Build feedback from positive highlights and improvement areas
          let feedback = '';
          if (dataCollection.positive_highlights?.value) {
            feedback += `✅ Strengths:\n${dataCollection.positive_highlights.value}\n\n`;
          }
          if (dataCollection.client_objections?.value && dataCollection.client_objections.value !== 'None') {
            feedback += `⚠️ Client Objections:\n${dataCollection.client_objections.value}\n\n`;
          }
          if (dataCollection.next_steps_suggested?.value) {
            feedback += `📋 Next Steps:\n${dataCollection.next_steps_suggested.value}`;
          }

          const trainingData = {
            comercial_id: comercialData.id,
            cliente_id: selectedCliente.id,
            tipo: 'voz',
            data_treino: new Date().toISOString(),
            transcript: conversationData || { messages: transcript },
            resumo: conversationData?.analysis?.transcript_summary || 
                    `Training session with ${selectedCliente.nome} from ${selectedCliente.empresa}`,
            score: score,
            pontos_melhorar: pontosArray,
            feedback_geral: feedback || null,
            gravacao_url: conversationData?.recording_url || null,
          };

          const { error } = await supabase.from('treinos').insert(trainingData);
          
          if (error) {
            console.error('Error saving to Supabase:', error);
          } else {
            console.log('Training session saved successfully!');
          }
        }
      }
    } catch (error) {
      console.error('Error ending call:', error);
    } finally {
    setIsCallActive(false);
    setSelectedCliente(null);
      setConversationStatus('idle');
      setTranscript([]);
      setConversationId(null);
      setIsMuted(false);
      setIsTrainingStarted(false);
      setIsEndingCall(false);
    }
  };

  const getUrgencyColor = (urgency) => {
    const colors = {
      'alta': 'text-red-400 bg-red-500/20 border-red-500/40',
      'média': 'text-yellow-400 bg-yellow-500/20 border-yellow-500/40',
      'baixa': 'text-green-400 bg-green-500/20 border-green-500/40'
    };
    return colors[urgency?.toLowerCase()] || colors['média'];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div
          className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    );
  }

  // Call Active View
  if (isCallActive && selectedCliente) {
    return (
      <motion.div
        className="min-h-[70vh] px-6 py-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-4xl mx-auto">
          {/* Call Header */}
          <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 border border-emerald-500/30 rounded-3xl p-8 mb-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                  {selectedCliente.nome?.charAt(0)}
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white font-poppins">{selectedCliente.nome}</h2>
                  <p className="text-emerald-400">{selectedCliente.empresa}</p>
                </div>
              </div>
              <motion.div
                className="flex items-center space-x-2 px-4 py-2 bg-emerald-500/20 border border-emerald-500/40 rounded-full"
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                <span className="text-emerald-400 font-semibold">Call Active</span>
              </motion.div>
            </div>

            {/* Client Info Grid */}
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="bg-[#0f172a] rounded-xl p-4">
                <div className="text-gray-400 text-sm mb-1">Objective</div>
                <div className="text-white font-medium">{selectedCliente.objetivo || 'N/A'}</div>
              </div>
              <div className="bg-[#0f172a] rounded-xl p-4">
                <div className="text-gray-400 text-sm mb-1">Budget</div>
                <div className="text-white font-medium">{selectedCliente.orcamento_est || 'N/A'}</div>
              </div>
              <div className="bg-[#0f172a] rounded-xl p-4">
                <div className="text-gray-400 text-sm mb-1">Urgency</div>
                <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold border ${getUrgencyColor(selectedCliente.urgencia)}`}>
                  {selectedCliente.urgencia || 'N/A'}
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-[#0f172a] rounded-xl p-4">
                <div className="text-gray-400 text-sm mb-1">Sector</div>
                <div className="text-white font-medium">{selectedCliente.setor || 'N/A'}</div>
              </div>
              <div className="bg-[#0f172a] rounded-xl p-4">
                <div className="text-gray-400 text-sm mb-1">Team Size</div>
                <div className="text-white font-medium">{selectedCliente.tamanho_equipa || 'N/A'}</div>
              </div>
              <div className="bg-[#0f172a] rounded-xl p-4">
                <div className="text-gray-400 text-sm mb-1">AI Experience</div>
                <div className="text-white font-medium">{selectedCliente.experiencia_ia || 'N/A'}</div>
              </div>
            </div>
          </div>

          {/* Voice Interface */}
          <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border border-emerald-500/20 rounded-3xl p-12 text-center">
            {!isTrainingStarted ? (
              // Pre-training view - Show Start Button
              <>
                <div className="w-32 h-32 mx-auto mb-8 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-2xl shadow-emerald-500/30">
                  <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </div>

                <h3 className="text-2xl font-bold text-white mb-2 font-poppins">
                  Ready to Start Training
                </h3>
                <p className="text-gray-400 mb-8">
                  Click the button below to begin your AI-powered sales training session
                </p>

                <button
                  onClick={handleStartTraining}
                  className="px-12 py-5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-full font-bold text-lg transition-all hover:scale-105 shadow-2xl shadow-emerald-500/50 flex items-center justify-center space-x-3 mx-auto"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Start Training</span>
                </button>

                <button
                  onClick={handleEndCall}
                  className="mt-6 px-8 py-3 bg-slate-700/50 hover:bg-slate-700 text-gray-400 hover:text-white rounded-full font-semibold transition-all"
                >
                  Go Back
                </button>
              </>
            ) : (
              // Training active view
              <>
            <motion.div
              className="w-32 h-32 mx-auto mb-8 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-2xl shadow-emerald-500/30"
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </motion.div>

                <h3 className="text-2xl font-bold text-white mb-2 font-poppins">
                  {isConnecting ? 'Connecting to AI Coach...' : 'AI Voice Coaching Active'}
                </h3>
                <p className="text-gray-400 mb-8">
                  {isConnecting ? 'Please wait while we connect...' : conversationStatus === 'connected' ? 'Start speaking to begin your training session' : 'Initializing...'}
                </p>

            {/* Waveform visualization placeholder */}
                <div className="flex items-center justify-center space-x-2 mb-8 h-20">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-1 bg-emerald-500 rounded-full"
                  animate={{
                    height: [20, Math.random() * 60 + 20, 20],
                  }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    delay: i * 0.05,
                  }}
                />
              ))}
            </div>

            <div className="flex items-center justify-center space-x-4">
                  <button 
                    onClick={handleToggleMute}
                    className={`px-8 py-4 ${isMuted ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-slate-700/50 hover:bg-slate-700'} text-white rounded-full font-semibold transition-all flex items-center space-x-2`}
                  >
                    {isMuted ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                      </svg>
                    ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
                    )}
                    <span>{isMuted ? 'Unmute' : 'Mute'}</span>
              </button>
              
              <button
                onClick={handleEndCall}
                className="px-8 py-4 bg-red-500 hover:bg-red-600 text-white rounded-full font-semibold transition-all flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span>End Training</span>
              </button>
            </div>
              </>
            )}
          </div>

          {/* Real-time feedback - only show when training is active */}
          {isTrainingStarted && (
          <motion.div
            className="mt-6 bg-blue-500/10 border border-blue-500/30 rounded-2xl p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-start space-x-3">
              <svg className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h4 className="text-white font-semibold mb-2">AI Tip</h4>
                <p className="text-gray-300 text-sm">Focus on understanding {selectedCliente.nome}'s pain points before presenting solutions. Ask open-ended questions about their current challenges.</p>
                  {conversationId && (
                    <p className="text-gray-500 text-xs mt-2">Conversation ID: {conversationId}</p>
                  )}
              </div>
            </div>
          </motion.div>
          )}
        </div>
      </motion.div>
    );
  }

  // Client Selection View
  return (
    <motion.div
      className="px-6 py-12"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 font-poppins">
            Choose a Client to Train
          </h2>
          <p className="text-xl text-gray-400">
            Select a client and start your AI-powered training session
          </p>
        </div>

        {clientes.length === 0 ? (
          <div className="text-center py-20">
            <svg className="w-20 h-20 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p className="text-gray-400 text-lg">No clients available yet</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clientes.map((cliente, index) => (
              <div
                key={cliente.id}
                className="bg-gradient-to-br from-[#1e293b] to-[#1e293b]/80 border border-slate-700/50 rounded-2xl p-6 hover:border-emerald-500/50 transition-all cursor-pointer group"
                onClick={() => handleSelectCliente(cliente)}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                      {cliente.nome?.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-lg font-poppins group-hover:text-emerald-400 transition-colors">
                        {cliente.nome}
                      </h3>
                      <p className="text-gray-400 text-sm">{cliente.empresa}</p>
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-semibold border ${getUrgencyColor(cliente.urgencia)}`}>
                    {cliente.urgencia}
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm">
                    <svg className="w-4 h-4 text-emerald-400 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-gray-300 truncate">{cliente.objetivo}</span>
                  </div>
                  
                  <div className="flex items-center text-sm">
                    <svg className="w-4 h-4 text-emerald-400 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-gray-300">{cliente.orcamento_est}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm pt-2 border-t border-slate-700/50">
                    <span className="text-gray-500">{cliente.setor}</span>
                    <span className="text-gray-500">{cliente.tamanho_equipa} people</span>
                  </div>
                </div>

                {/* CTA */}
                <button className="w-full py-3 bg-emerald-500/10 group-hover:bg-emerald-500 border border-emerald-500/30 group-hover:border-emerald-500 rounded-xl text-emerald-400 group-hover:text-white font-semibold transition-all flex items-center justify-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Start Training</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default TrainingSimulator;

