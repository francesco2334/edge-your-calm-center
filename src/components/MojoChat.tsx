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

export function MojoChat({ isOpen, onClose, onTriggerTool, userId }: MojoChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasConsented, setHasConsented] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

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
    
    try {
      await supabase.functions.invoke('analyze-insights', {
        body: { messages },
      });
    } catch (error) {
      console.error('Failed to save conversation insights:', error);
    }
  }, [userId, messages]);

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
          className="fixed inset-0 z-50 bg-background"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border/30">
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
                <MojoOrb state="calm" size="lg" />
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
                <MojoOrb state="calm" size="lg" />
                <p className="text-muted-foreground mt-6 text-sm">
                  Hey, I'm Mojo. What's pulling at you today?
                </p>
                <p className="text-muted-foreground/60 mt-2 text-xs max-w-xs mx-auto">
                  I help with everyday attention habits — not medical or mental health advice.
                </p>
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
          <div className="absolute bottom-0 left-0 right-0 px-5 py-4 bg-background border-t border-border/30">
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
                className="p-3 rounded-xl bg-primary text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
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
