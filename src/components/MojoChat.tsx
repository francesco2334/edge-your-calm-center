import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send } from 'lucide-react';
import { MojoOrb } from './MojoOrb';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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

type MojoEmote = 'wave' | 'dance' | 'spin' | 'blush' | 'sleepy' | null;

export function MojoChat({ isOpen, onClose, onTriggerTool, userId }: MojoChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasConsented, setHasConsented] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [currentEmote, setCurrentEmote] = useState<MojoEmote>(null);
  const [showEmotes, setShowEmotes] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const triggerEmote = (emote: MojoEmote) => {
    setCurrentEmote(emote);
    setTimeout(() => setCurrentEmote(null), 2000);
  };

  const EMOTES = [
    { id: 'wave' as const, icon: '👋', label: 'Wave' },
    { id: 'dance' as const, icon: '💃', label: 'Dance' },
    { id: 'spin' as const, icon: '🌀', label: 'Spin' },
    { id: 'blush' as const, icon: '😊', label: 'Blush' },
    { id: 'sleepy' as const, icon: '😴', label: 'Sleepy' },
  ];

  // Emoting Mojo component with animations
  const EmotingMojo = ({ emote }: { emote: MojoEmote }) => {
    const getEmoteAnimation = (): { [key: string]: number | number[] } => {
      switch (emote) {
        case 'wave':
          return { rotate: [0, -15, 15, -15, 15, 0] };
        case 'dance':
          return { y: [0, -10, 0, -10, 0], x: [-5, 5, -5, 5, 0] };
        case 'spin':
          return { rotate: [0, 360] };
        case 'blush':
          return { scale: [1, 1.1, 1] };
        case 'sleepy':
          return { y: [0, 5, 0], scale: [1, 0.95, 1] };
        default:
          return {};
      }
    };

    return (
      <div className="relative inline-block">
        <motion.div animate={getEmoteAnimation()}>
          <MojoOrb state={emote === 'sleepy' ? 'calm' : emote === 'blush' ? 'steady' : 'calm'} size="lg" />
        </motion.div>
        
        {/* Emote effects */}
        <AnimatePresence>
          {emote === 'blush' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute top-1/2 -translate-y-1/2 left-1/4 right-1/4 flex justify-between pointer-events-none"
            >
              <div className="w-4 h-3 rounded-full bg-pink-400/60" />
              <div className="w-4 h-3 rounded-full bg-pink-400/60" />
            </motion.div>
          )}
          {emote === 'sleepy' && (
            <motion.div
              initial={{ opacity: 0, y: 0 }}
              animate={{ opacity: [0, 1, 0], y: -30, x: 20 }}
              transition={{ duration: 1.5, repeat: 1 }}
              className="absolute top-0 right-0 text-2xl pointer-events-none"
            >
              💤
            </motion.div>
          )}
          {emote === 'wave' && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute -right-4 top-1/3 text-2xl pointer-events-none"
            >
              👋
            </motion.div>
          )}
          {emote === 'dance' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex gap-1 pointer-events-none"
            >
              {['✨', '🎵', '✨'].map((s, i) => (
                <motion.span
                  key={i}
                  animate={{ y: [0, -8, 0], opacity: [1, 0.5, 1] }}
                  transition={{ duration: 0.5, delay: i * 0.15, repeat: 2 }}
                  className="text-sm"
                >
                  {s}
                </motion.span>
              ))}
            </motion.div>
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
              <MojoOrb state="calm" size="sm" />
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
                className="text-center pt-8"
              >
                <EmotingMojo emote={currentEmote} />
                <p className="text-muted-foreground mt-6 text-sm font-medium">
                  Before we chat
                </p>
                <p className="text-muted-foreground/70 mt-3 text-xs max-w-xs mx-auto leading-relaxed">
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
                className="text-center pt-8"
              >
                <EmotingMojo emote={currentEmote} />
                <p className="text-muted-foreground mt-6 text-sm">
                  Hey, I'm Mojo. What's pulling at you today?
                </p>
                <p className="text-muted-foreground/60 mt-2 text-xs max-w-xs mx-auto">
                  I help with everyday attention habits — not medical or mental health advice.
                </p>
                
                {/* Emote buttons */}
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
                        {EMOTES.map((emote) => (
                          <motion.button
                            key={emote.id}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => triggerEmote(emote.id)}
                            className="flex flex-col items-center gap-1 p-2 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors min-w-[50px]"
                          >
                            <span className="text-lg">{emote.icon}</span>
                            <span className="text-[10px] text-muted-foreground">{emote.label}</span>
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
                  <div
                    className={`max-w-[85%] px-4 py-3 rounded-2xl ${
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
                onChange={(e) => setInput(e.target.value.slice(0, MAX_MESSAGE_LENGTH))}
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
