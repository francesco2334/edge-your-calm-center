import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send } from 'lucide-react';
import { MojoOrb } from './MojoOrb';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useMojoMood, emoteAnimationDurations, type MojoEmote } from '@/hooks/useMojoMood';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export type MojoTool = 'breathing' | 'standoff' | 'pause' | 'name';

interface MojoChatProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerTool?: (tool: MojoTool) => void;
  userId?: string;
}

const MAX_MESSAGE_LENGTH = 2000;

const EMOTES: { id: MojoEmote; icon: string; label: string }[] = [
  { id: 'wave', icon: '👋', label: 'Wave' },
  { id: 'dance', icon: '💃', label: 'Dance' },
  { id: 'spin', icon: '🌀', label: 'Spin' },
  { id: 'blush', icon: '☺️', label: 'Blush' },
  { id: 'sleepy', icon: '😴', label: 'Sleepy' },
  { id: 'excited', icon: '🤩', label: 'Excited' },
  { id: 'dizzy', icon: '😵‍💫', label: 'Dizzy' },
  { id: 'love', icon: '😍', label: 'Love' },
  { id: 'giggle', icon: '🤭', label: 'Giggle' },
  { id: 'yawn', icon: '🥱', label: 'Yawn' },
];

export function MojoChat({ isOpen, onClose, onTriggerTool, userId }: MojoChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasConsented, setHasConsented] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [showEmotes, setShowEmotes] = useState(false);
  const [isUserTyping, setIsUserTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();
  
  // Use the new mood system with animation locking
  const { 
    mood, 
    emote: currentEmote, 
    isAnimating, 
    triggerEmote, 
    canTriggerEmote,
    getMojoComment 
  } = useMojoMood();

  // Handle user typing detection
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value.slice(0, MAX_MESSAGE_LENGTH));
    setIsUserTyping(true);
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      setIsUserTyping(false);
    }, 1000);
  };

  // Get mojo state based on emote, mood, typing, or loading
  const getMojoState = () => {
    if (isLoading) return 'thinking';
    if (isUserTyping && input.length > 0) return 'thinking';
    if (currentEmote === 'sleepy' || currentEmote === 'yawn' || mood === 'tired') return 'calm';
    if (currentEmote === 'blush' || currentEmote === 'love' || mood === 'content') return 'steady';
    if (currentEmote === 'excited' || mood === 'playful') return 'steady';
    if (mood === 'overwhelmed') return 'under-load';
    if (mood === 'focused') return 'regulating';
    return 'calm';
  };

  // Enhanced Emoting Mojo with 3-phase animations (anticipation + main + recovery)
  const EmotingMojo = ({ emote }: { emote: MojoEmote }) => {
    const getEmoteAnimation = () => {
      switch (emote) {
        case 'wave':
          // 3-phase: anticipation (slight pull back), main wave, recovery
          return { 
            rotate: [0, -8, -25, 30, -25, 30, -15, 0],
            scale: [1, 1.02, 1, 1, 1, 1, 1, 1],
          };
        case 'dance':
          // 3-phase: prep bounce, full dance, settle
          return { 
            y: [0, -5, 0, -18, 0, -18, 0, -12, 0, -5, 0],
            x: [0, 0, -10, 10, -10, 10, -6, 6, -3, 0, 0],
            rotate: [0, 0, -6, 6, -6, 6, -3, 3, 0, 0, 0],
          };
        case 'spin':
          // 3-phase: wind up (slight counter-rotate), full spins, wobble settle
          return { 
            rotate: [0, -15, 0, 360, 720, 740, 720, 720],
            scale: [1, 0.95, 1, 0.92, 1, 1.05, 0.98, 1],
          };
        case 'blush':
          // 3-phase: subtle build, full blush pulse, gentle fade
          return { 
            scale: [1, 1.02, 1.1, 1.06, 1.1, 1.08, 1.04, 1],
            y: [0, 0, -4, -2, -4, -2, 0, 0],
          };
        case 'sleepy':
          // 3-phase: eyes heavy, full droop, settle into sleep
          return { 
            y: [0, 2, 8, 5, 10, 6, 8, 6],
            scale: [1, 0.98, 0.92, 0.94, 0.90, 0.93, 0.92, 0.93],
            rotate: [0, 1, 4, 2, 5, 3, 4, 3],
          };
        case 'excited':
          // 3-phase: crouch prep, explosive bounces, settle
          return { 
            y: [0, 5, 0, -25, 0, -20, 0, -15, 0, -8, 0],
            scale: [1, 0.95, 1, 1.18, 1, 1.15, 1, 1.1, 1, 1.05, 1],
          };
        case 'dizzy':
          // 3-phase: initial stumble, full wobble, recovery stumble
          return { 
            rotate: [0, 5, -8, 15, -20, 25, -25, 20, -18, 15, -10, 8, -5, 3, 0],
            x: [0, 2, -3, 6, -8, 10, -10, 8, -7, 5, -4, 3, -2, 1, 0],
            y: [0, -2, 0, -3, 0, -2, 0, -2, 0, -1, 0, 0, 0, 0, 0],
          };
        case 'love':
          // 3-phase: heart swell build, full pulse, gentle settle
          return { 
            scale: [1, 1.05, 1.22, 1.15, 1.22, 1.18, 1.1, 1],
            y: [0, -2, -8, -5, -8, -5, -3, 0],
          };
        case 'giggle':
          // 3-phase: inhale/build, rapid giggles, exhale settle
          return { 
            rotate: [0, 0, -4, 4, -5, 5, -4, 4, -3, 3, -2, 2, 0],
            scale: [1, 1.02, 1.06, 1.04, 1.07, 1.04, 1.06, 1.03, 1.04, 1.02, 1.02, 1.01, 1],
            y: [0, -2, -3, -2, -4, -2, -3, -2, -2, -1, -1, 0, 0],
          };
        case 'yawn':
          // 3-phase: mouth opens slowly, full yawn hold, gentle close
          return { 
            y: [0, 1, 4, 8, 6, 8, 5, 3, 1],
            scale: [1, 1.02, 1.08, 1.05, 1.03, 1.05, 1.02, 1, 1],
            rotate: [0, 2, 6, 8, 5, 6, 4, 2, 0],
          };
        default:
          return {};
      }
    };

    const getDuration = () => {
      if (!emote) return 1;
      return emoteAnimationDurations[emote] / 1000; // Convert ms to seconds
    };

    return (
      <div className="relative inline-flex items-center justify-center w-full">
        <motion.div 
          animate={getEmoteAnimation()}
          transition={{ 
            duration: getDuration(), 
            ease: [0.25, 0.1, 0.25, 1], // Smooth easing for natural feel
            times: undefined // Let framer calculate even timing
          }}
        >
          <MojoOrb state={getMojoState()} size="lg" />
        </motion.div>
        
        {/* Enhanced emote effects */}
        <AnimatePresence>
          {emote === 'blush' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute top-[45%] -translate-y-1/2 left-[20%] right-[20%] flex justify-between pointer-events-none"
            >
              <motion.div 
                className="w-5 h-4 rounded-full bg-pink-400/70 blur-[1px]"
                animate={{ opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
              <motion.div 
                className="w-5 h-4 rounded-full bg-pink-400/70 blur-[1px]"
                animate={{ opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            </motion.div>
          )}
          
          {emote === 'sleepy' && (
            <>
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 0, scale: 0.5 }}
                  animate={{ 
                    opacity: [0, 1, 0], 
                    y: -50 - i * 15, 
                    x: 20 + i * 10,
                    scale: [0.5, 1.2, 0.8]
                  }}
                  transition={{ 
                    duration: 2, 
                    delay: i * 0.5,
                    repeat: Infinity,
                    repeatDelay: 0.5
                  }}
                  className="absolute top-0 right-0 text-2xl pointer-events-none"
                >
                  💤
                </motion.div>
              ))}
            </>
          )}
          
          {emote === 'wave' && (
            <motion.div
              initial={{ opacity: 0, scale: 0, rotate: -30 }}
              animate={{ 
                opacity: 1, 
                scale: [1, 1.2, 1],
                rotate: [-30, 30, -30, 30, 0]
              }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ duration: 1 }}
              className="absolute -right-6 top-1/4 text-3xl pointer-events-none"
            >
              👋
            </motion.div>
          )}
          
          {emote === 'dance' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex gap-2 pointer-events-none"
            >
              {['✨', '🎵', '💫', '🎶', '✨'].map((s, i) => (
                <motion.span
                  key={i}
                  animate={{ 
                    y: [0, -12, 0], 
                    opacity: [0.7, 1, 0.7],
                    scale: [1, 1.2, 1]
                  }}
                  transition={{ 
                    duration: 0.4, 
                    delay: i * 0.1, 
                    repeat: Infinity,
                    repeatType: 'reverse'
                  }}
                  className="text-lg"
                >
                  {s}
                </motion.span>
              ))}
            </motion.div>
          )}
          
          {emote === 'spin' && (
            <motion.div
              className="absolute inset-0 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {[0, 1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-primary/60 rounded-full"
                  style={{
                    top: '50%',
                    left: '50%',
                  }}
                  animate={{
                    x: [0, Math.cos(i * 90 * Math.PI / 180) * 60],
                    y: [0, Math.sin(i * 90 * Math.PI / 180) * 60],
                    opacity: [1, 0],
                    scale: [1, 0.3],
                  }}
                  transition={{ duration: 0.8, delay: i * 0.1 }}
                />
              ))}
            </motion.div>
          )}
          
          {emote === 'excited' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute -top-4 left-1/2 -translate-x-1/2 pointer-events-none"
            >
              {['⭐', '✨', '⭐'].map((s, i) => (
                <motion.span
                  key={i}
                  className="absolute text-xl"
                  style={{ left: `${(i - 1) * 24}px` }}
                  animate={{
                    y: [0, -20, 0],
                    scale: [0.8, 1.3, 0.8],
                    rotate: [0, 360],
                  }}
                  transition={{
                    duration: 0.6,
                    delay: i * 0.1,
                    repeat: 2,
                  }}
                >
                  {s}
                </motion.span>
              ))}
            </motion.div>
          )}
          
          {emote === 'dizzy' && (
            <motion.div
              className="absolute inset-0 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="absolute text-xl"
                  style={{ top: '-10px', left: '50%' }}
                  animate={{
                    rotate: [0, 360],
                    x: [0, Math.cos(i * 120 * Math.PI / 180) * 40, 0],
                    y: [0, Math.sin(i * 120 * Math.PI / 180) * 40, 0],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.3,
                  }}
                >
                  💫
                </motion.span>
              ))}
            </motion.div>
          )}
          
          {emote === 'love' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 pointer-events-none overflow-visible"
            >
              {[0, 1, 2, 3, 4].map((i) => (
                <motion.span
                  key={i}
                  className="absolute text-lg"
                  style={{ 
                    left: `${30 + i * 20}%`,
                    top: '0%'
                  }}
                  initial={{ y: 0, opacity: 0, scale: 0.5 }}
                  animate={{
                    y: -60,
                    opacity: [0, 1, 0],
                    scale: [0.5, 1.2, 0.8],
                  }}
                  transition={{
                    duration: 1.5,
                    delay: i * 0.15,
                    repeat: 1,
                  }}
                >
                  ❤️
                </motion.span>
              ))}
            </motion.div>
          )}
          
          {emote === 'giggle' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute -right-4 top-1/3 pointer-events-none"
            >
              <motion.span
                className="text-xl"
                animate={{ 
                  rotate: [-10, 10, -10],
                  scale: [1, 1.1, 1]
                }}
                transition={{ duration: 0.3, repeat: 4 }}
              >
                😆
              </motion.span>
            </motion.div>
          )}
          
          {emote === 'yawn' && (
            <>
              <motion.div
                initial={{ opacity: 0, y: 0 }}
                animate={{ opacity: [0, 0.6, 0], y: -40, x: 15 }}
                transition={{ duration: 2, repeat: 1 }}
                className="absolute top-0 right-0 text-xl pointer-events-none"
              >
                😪
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.4, 0] }}
                transition={{ duration: 2.5 }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-primary/10 rounded-full blur-xl pointer-events-none"
              />
            </>
          )}
        </AnimatePresence>
      </div>
    );
  };
  useEffect(() => {
    if (isOpen && userId) {
      loadRecentConversation();
    }
  }, [isOpen, userId]);

  const generateContextualFollowUp = (msgs: Message[]): string => {
    const userMessages = msgs.filter(m => m.role === 'user');
    const lastUserMsg = userMessages[userMessages.length - 1]?.content || '';
    const lastAssistantMsg = msgs.filter(m => m.role === 'assistant').pop()?.content || '';
    
    // Extract specific details to reference
    const lowerMsg = lastUserMsg.toLowerCase();
    
    // Look for specific things to follow up on
    const followUps: { pattern: RegExp; response: (match: RegExpMatchArray) => string }[] = [
      { 
        pattern: /(\d+)\s*(day|hour|week|month)s?\s*(streak|clean|sober|free)/i,
        response: (m) => `Still going strong on that ${m[1]} ${m[2]} streak? That's real momentum.`
      },
      {
        pattern: /(stress|anxious|worried|overwhelmed)\s*(about|with|over)?\s*(\w+)?/i,
        response: (m) => m[3] ? `How's that ${m[3]} situation going? Still weighing on you?` : `How are you feeling now? Any of that stress ease up?`
      },
      {
        pattern: /(urge|craving|tempted|want to)\s*(to)?\s*(\w+)?/i,
        response: (m) => `Last time you mentioned feeling pulled. Did that pass, or is it still lingering?`
      },
      {
        pattern: /(work|job|meeting|deadline|boss)/i,
        response: () => `How'd that work situation shake out?`
      },
      {
        pattern: /(game|gaming|gambling|bet|casino)/i,
        response: () => `You mentioned gaming last time. How's that been sitting with you?`
      },
      {
        pattern: /(sleep|tired|exhausted|insomnia)/i,
        response: () => `Getting any better sleep? That can really affect everything else.`
      },
      {
        pattern: /(relationship|partner|friend|family|mom|dad|brother|sister)/i,
        response: () => `How are things going with the people in your life?`
      },
    ];
    
    for (const { pattern, response } of followUps) {
      const match = lowerMsg.match(pattern) || lastAssistantMsg.toLowerCase().match(pattern);
      if (match) {
        return response(match);
      }
    }
    
    // Fallback: reference the general vibe
    if (userMessages.length > 3) {
      return `Good to see you back. What's on your mind today?`;
    }
    return `Hey, picking up where we left off. How are things?`;
  };

  const getTimeAgo = (date: Date): string => {
    const mins = Math.floor((Date.now() - date.getTime()) / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return 'yesterday';
  };

  const loadRecentConversation = async () => {
    if (!userId) return;
    
    try {
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      
      const { data, error } = await supabase
        .from('mojo_conversations')
        .select('id, messages, updated_at')
        .eq('user_id', userId)
        .gte('updated_at', twentyFourHoursAgo)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      if (data && !error) {
        setConversationId(data.id);
        const loadedMessages = data.messages as unknown as Message[];
        if (Array.isArray(loadedMessages) && loadedMessages.length > 0) {
          const followUp = generateContextualFollowUp(loadedMessages);
          const timeAgo = getTimeAgo(new Date(data.updated_at));
          
          // Add a contextual follow-up message at the end
          const contextMessage: Message = {
            role: 'assistant',
            content: `${followUp} (${timeAgo})`
          };
          
          setMessages([...loadedMessages, contextMessage]);
          setHasConsented(true);
        }
      }
    } catch (error) {
      console.log('No recent conversation found');
    }
  };


  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Parse tool triggers from message content
  const parseToolTrigger = (content: string): { cleanContent: string; tool: MojoTool | null } => {
    const toolMatch = content.match(/\[TOOL:(breathing|standoff|pause|name)\]/i);
    if (toolMatch) {
      const tool = toolMatch[1].toLowerCase() as MojoTool;
      const cleanContent = content.replace(/\[TOOL:(breathing|standoff|pause|name)\]/gi, '').trim();
      return { cleanContent, tool };
    }
    return { cleanContent: content, tool: null };
  };

  // Render message content without tool tags, and show tool button if present
  const renderMessageContent = (content: string, isLast: boolean) => {
    const { cleanContent, tool } = parseToolTrigger(content);
    
    return (
      <>
        <p className="text-sm whitespace-pre-wrap">{cleanContent}</p>
        {tool && isLast && onTriggerTool && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            onClick={() => {
              onTriggerTool(tool);
              onClose();
            }}
            className="mt-3 w-full py-2.5 px-4 bg-primary/20 hover:bg-primary/30 text-primary rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
          >
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            Start {tool === 'breathing' ? 'Sync' : tool === 'standoff' ? 'Standoff' : tool === 'pause' ? 'Pause' : 'Name It'}
          </motion.button>
        )}
      </>
    );
  };

  const sendMessage = async () => {
    const trimmedInput = input.trim().slice(0, MAX_MESSAGE_LENGTH);
    if (!trimmedInput || isLoading) return;

    const userMessage: Message = { role: 'user', content: trimmedInput };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    let assistantContent = '';

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/mojo-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to connect');
      }

      if (!response.body) throw new Error('No response stream');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = '';

      // Add initial assistant message
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: 'assistant', content: assistantContent };
                return updated;
              });
            }
          } catch {
            // Partial JSON, continue
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      toast({
        title: "Couldn't reach Mojo",
        description: error instanceof Error ? error.message : 'Please try again',
        variant: 'destructive',
      });
      // Remove empty assistant message if error
      setMessages(prev => prev.filter(m => m.content !== ''));
    } finally {
      setIsLoading(false);
    }
  };

  // Save conversation when closing chat (if there are messages)
  const saveConversation = useCallback(async () => {
    if (!userId || messages.length < 2) return;
    
    // Filter out auto-generated context messages (end with time like "(2h ago)" or "(yesterday)")
    const messagesToSave = messages.filter(m => !m.content.match(/\(\d+[mh] ago\)$/) && !m.content.endsWith('(yesterday)'));
    try {
      if (conversationId) {
        await supabase
          .from('mojo_conversations')
          .update({ 
            messages: messagesToSave as unknown as any,
            updated_at: new Date().toISOString()
          })
          .eq('id', conversationId);
      } else {
        const { data } = await supabase
          .from('mojo_conversations')
          .insert({ 
            user_id: userId,
            messages: messagesToSave as unknown as any
          })
          .select('id')
          .single();
        
        if (data) {
          setConversationId(data.id);
        }
      }

      await supabase.functions.invoke('analyze-insights', {
        body: { messages: messagesToSave },
      });
    } catch (error) {
      console.error('Failed to save conversation:', error);
    }
  }, [userId, messages, conversationId]);

  // Save when closing
  const handleClose = useCallback(() => {
    if (messages.length >= 2) {
      saveConversation();
    }
    onClose();
  }, [messages, saveConversation, onClose]);
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-background safe-area-inset"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border/30 safe-top">
            <div className="flex items-center gap-3">
              <MojoOrb state={isLoading || isUserTyping ? 'thinking' : 'calm'} size="sm" />
              <div>
                <h2 className="text-base font-medium text-foreground">Mojo</h2>
                <p className="text-xs text-muted-foreground">Your regulation companion</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 rounded-full hover:bg-muted/50 transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {/* AI Disclaimer Banner */}
          <div className="px-5 py-2.5 bg-muted/30 border-b border-border/20">
            <p className="text-xs text-muted-foreground text-center">
              Mojo is a support tool, not a therapist. For mental health concerns, please seek professional help.
            </p>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-5 py-4 h-[calc(100vh-180px)]">
            {!hasConsented ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center pt-8"
              >
                <div className="flex items-center justify-center w-full">
                  <EmotingMojo emote={currentEmote} />
                </div>
                <p className="text-muted-foreground mt-6 text-sm font-medium text-center">
                  Before we chat
                </p>
                <p className="text-muted-foreground/70 mt-3 text-xs max-w-xs mx-auto leading-relaxed text-center">
                  Your messages are processed by AI to provide responses. No personal data is stored or shared. Mojo is a support tool, not medical advice.
                </p>
                <button
                  onClick={() => setHasConsented(true)}
                  className="mt-6 px-6 py-3 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  I understand, let's chat
                </button>
              </motion.div>
            ) : messages.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center pt-8"
              >
                <div className="flex items-center justify-center w-full">
                  <EmotingMojo emote={currentEmote} />
                </div>
                <p className="text-muted-foreground mt-6 text-sm text-center">
                  Hey, I'm Mojo. What's pulling at you today?
                </p>
                <p className="text-muted-foreground/60 mt-2 text-xs max-w-xs mx-auto text-center">
                  I help with everyday attention habits — not medical or mental health advice.
                </p>
                
                {/* Emote buttons - disabled when animating */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="mt-6"
                >
                  <button
                    onClick={() => setShowEmotes(!showEmotes)}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showEmotes ? 'Hide emotes ▲' : 'Make Mojo do stuff ▼'}
                  </button>
                  
                  <AnimatePresence>
                    {showEmotes && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex justify-center gap-2 mt-3 flex-wrap"
                      >
                        {EMOTES.map((emoteItem) => (
                          <motion.button
                            key={emoteItem.id}
                            whileHover={canTriggerEmote ? { scale: 1.1 } : {}}
                            whileTap={canTriggerEmote ? { scale: 0.95 } : {}}
                            onClick={() => emoteItem.id && triggerEmote(emoteItem.id)}
                            disabled={!canTriggerEmote}
                            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors min-w-[50px] ${
                              canTriggerEmote 
                                ? 'bg-muted/30 hover:bg-muted/50 cursor-pointer' 
                                : 'bg-muted/20 opacity-50 cursor-not-allowed'
                            }`}
                          >
                            <span className="text-lg">{emoteItem.icon}</span>
                            <span className="text-[10px] text-muted-foreground">{emoteItem.label}</span>
                          </motion.button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </motion.div>
            ) : null}

            <div className="space-y-4">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="flex-shrink-0 mr-2 mt-1">
                      <MojoOrb state="calm" size="sm" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground rounded-br-sm'
                        : 'bg-muted/50 text-foreground rounded-bl-sm'
                    }`}
                  >
                    {renderMessageContent(msg.content, i === messages.length - 1 && msg.role === 'assistant')}
                  </div>
                </motion.div>
              ))}
              {isLoading && messages[messages.length - 1]?.role === 'user' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="flex-shrink-0 mr-2 mt-1">
                    <MojoOrb state="thinking" size="sm" />
                  </div>
                  <div className="bg-muted/50 px-4 py-3 rounded-2xl rounded-bl-sm">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" />
                      <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input */}
          <div className="absolute bottom-0 left-0 right-0 px-5 py-4 bg-background border-t border-border/30 safe-area-bottom">
            <div className="flex items-center gap-3">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder={hasConsented ? "Talk to Mojo..." : "Accept above to chat"}
                className="flex-1 bg-muted/30 border border-border/30 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
                disabled={isLoading || !hasConsented}
                maxLength={MAX_MESSAGE_LENGTH}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                className="p-3 rounded-xl bg-primary text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors flex-shrink-0"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
