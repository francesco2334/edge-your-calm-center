import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Check, X, ChevronRight } from 'lucide-react';
import { LEARN_TOPICS, type LearnTopic } from '@/lib/learn-data';

interface TopicPickerProps {
  selectedTopics: string[];
  onSave: (topics: string[]) => void;
  onClose: () => void;
}

export function TopicPicker({ selectedTopics: initialTopics, onSave, onClose }: TopicPickerProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set(initialTopics));
  const [search, setSearch] = useState('');

  const filteredTopics = useMemo(() => {
    if (!search.trim()) return LEARN_TOPICS;
    const query = search.toLowerCase();
    return LEARN_TOPICS.filter(t => 
      t.label.toLowerCase().includes(query) || 
      t.id.toLowerCase().includes(query)
    );
  }, [search]);

  const toggleTopic = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectAll = () => {
    setSelected(new Set(LEARN_TOPICS.map(t => t.id)));
  };

  const clearAll = () => {
    setSelected(new Set());
  };

  const handleSave = () => {
    onSave(Array.from(selected));
  };

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      {/* Header */}
      <div className="px-5 pt-5 pb-3">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
          <h1 className="text-lg font-semibold text-foreground">Choose Topics</h1>
          <div className="w-10" /> {/* Spacer */}
        </div>

        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search topics..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-12 pl-11 pr-4 rounded-xl bg-muted/50 border border-border/50 text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        {/* Quick actions */}
        <div className="flex gap-2 mt-3">
          <button
            onClick={selectAll}
            className="px-4 py-2 rounded-lg bg-primary/10 text-primary text-sm font-medium active:scale-95 transition-transform"
          >
            Select All
          </button>
          <button
            onClick={clearAll}
            className="px-4 py-2 rounded-lg bg-muted/50 text-muted-foreground text-sm font-medium active:scale-95 transition-transform"
          >
            Clear
          </button>
          <div className="flex-1" />
          <span className="text-sm text-muted-foreground self-center">
            {selected.size} selected
          </span>
        </div>
      </div>

      {/* Topics grid */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        <div className="grid grid-cols-2 gap-3">
          {filteredTopics.map((topic, i) => (
            <TopicChip
              key={topic.id}
              topic={topic}
              isSelected={selected.has(topic.id)}
              onToggle={() => toggleTopic(topic.id)}
              index={i}
            />
          ))}
        </div>

        {filteredTopics.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No topics match "{search}"
          </div>
        )}
      </div>

      {/* Save button */}
      <div className="px-5 pb-32 pt-4">
        <button
          onClick={handleSave}
          disabled={selected.size === 0}
          className="w-full h-14 rounded-2xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-semibold text-base flex items-center justify-center gap-2 shadow-lg shadow-primary/20 active:scale-[0.98] transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Start Learning ({selected.size} topics)
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

interface TopicChipProps {
  topic: LearnTopic;
  isSelected: boolean;
  onToggle: () => void;
  index: number;
}

function TopicChip({ topic, isSelected, onToggle, index }: TopicChipProps) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.02 }}
      onClick={onToggle}
      className={`relative p-4 rounded-2xl border transition-all active:scale-95 ${
        isSelected 
          ? 'bg-primary/15 border-primary/40' 
          : 'bg-muted/30 border-border/50 hover:bg-muted/50'
      }`}
    >
      {/* Selected checkmark */}
      {isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center"
        >
          <Check className="w-3 h-3 text-primary-foreground" />
        </motion.div>
      )}

      <div className="text-2xl mb-2">{topic.icon}</div>
      <div className={`text-sm font-medium ${isSelected ? 'text-foreground' : 'text-muted-foreground'}`}>
        {topic.label}
      </div>
    </motion.button>
  );
}
