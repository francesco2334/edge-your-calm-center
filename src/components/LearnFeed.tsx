import { useState, useEffect } from 'react';
import { LearnIntro, TopicPicker, LearnFeedScreen } from './learn';
import { LEARN_STORAGE_KEYS, LEARN_TOPICS } from '@/lib/learn-data';

interface LearnFeedProps {
  onClose?: () => void;
  onCardViewed?: () => void;
  onCardSaved?: () => void;
}

type LearnView = 'intro' | 'topics' | 'feed';

export function LearnFeed({ onClose, onCardViewed, onCardSaved }: LearnFeedProps) {
  const [view, setView] = useState<LearnView>('intro');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);

  // Check if user has seen intro before
  useEffect(() => {
    const hasSeenIntro = localStorage.getItem(LEARN_STORAGE_KEYS.hasSeenIntro);
    const savedTopics = localStorage.getItem(LEARN_STORAGE_KEYS.selectedTopics);
    
    if (hasSeenIntro && savedTopics) {
      try {
        const topics = JSON.parse(savedTopics);
        if (topics.length > 0) {
          setSelectedTopics(topics);
          setView('feed');
        }
      } catch {
        // Invalid saved data, show intro
      }
    }
  }, []);

  const handleChooseTopics = () => {
    setView('topics');
  };

  const handleStartWithDefaults = () => {
    // Use first 4 topics as defaults
    const defaults = LEARN_TOPICS.slice(0, 4).map(t => t.id);
    setSelectedTopics(defaults);
    localStorage.setItem(LEARN_STORAGE_KEYS.selectedTopics, JSON.stringify(defaults));
    localStorage.setItem(LEARN_STORAGE_KEYS.hasSeenIntro, 'true');
    setView('feed');
  };

  const handleSaveTopics = (topics: string[]) => {
    setSelectedTopics(topics);
    localStorage.setItem(LEARN_STORAGE_KEYS.selectedTopics, JSON.stringify(topics));
    localStorage.setItem(LEARN_STORAGE_KEYS.hasSeenIntro, 'true');
    setView('feed');
  };

  const handleOpenTopicPicker = () => {
    setView('topics');
  };

  if (view === 'intro') {
    return (
      <LearnIntro 
        onChooseTopics={handleChooseTopics}
        onStartLearning={handleStartWithDefaults}
      />
    );
  }

  if (view === 'topics') {
    return (
      <TopicPicker
        selectedTopics={selectedTopics}
        onSave={handleSaveTopics}
        onClose={() => setView(selectedTopics.length > 0 ? 'feed' : 'intro')}
      />
    );
  }

  return (
    <LearnFeedScreen
      selectedTopics={selectedTopics}
      onOpenTopicPicker={handleOpenTopicPicker}
      onCardViewed={onCardViewed}
      onCardSaved={onCardSaved}
    />
  );
}
