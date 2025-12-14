import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, MessageSquare, Lightbulb, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { REFLECTION_PROMPTS, getMonthLabel, type MonthlyNote } from '@/lib/progress-data';

interface MonthlyNotesProps {
  month: string;
  existingNote?: MonthlyNote;
  onSave: (improvements: string, notes: string) => void;
}

export function MonthlyNotes({ month, existingNote, onSave }: MonthlyNotesProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [improvements, setImprovements] = useState(existingNote?.improvements || '');
  const [notes, setNotes] = useState(existingNote?.notes || '');
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const monthLabel = getMonthLabel(month);

  useEffect(() => {
    if (existingNote) {
      setImprovements(existingNote.improvements);
      setNotes(existingNote.notes);
    }
  }, [existingNote]);

  useEffect(() => {
    const improvementsChanged = improvements !== (existingNote?.improvements || '');
    const notesChanged = notes !== (existingNote?.notes || '');
    setHasChanges(improvementsChanged || notesChanged);
  }, [improvements, notes, existingNote]);

  const handleSave = () => {
    if (improvements.trim() || notes.trim()) {
      setIsSaving(true);
      setTimeout(() => {
        onSave(improvements, notes);
        setIsSaving(false);
        setHasChanges(false);
      }, 300);
    }
  };

  const hasContent = existingNote && (existingNote.improvements || existingNote.notes);

  return (
    <motion.div
      layout
      className={`dopa-card overflow-hidden ${hasContent ? 'border border-emerald-500/20' : 'border border-border/30'}`}
    >
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            hasContent ? 'bg-emerald-500/20' : 'bg-muted/50'
          }`}>
            {hasContent ? (
              <Lightbulb className="w-5 h-5 text-emerald-400" />
            ) : (
              <MessageSquare className="w-5 h-5 text-muted-foreground" />
            )}
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-foreground">
              {monthLabel} Improvements & Notes
            </p>
            <p className="text-xs text-muted-foreground">
              {hasContent ? 'Tap to edit' : 'What have you improved this month?'}
            </p>
          </div>
        </div>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-5 h-5 text-muted-foreground" />
        )}
      </button>

      {/* Preview when collapsed */}
      {!isOpen && hasContent && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-3 pt-3 border-t border-border/30"
        >
          {existingNote.improvements && (
            <p className="text-sm text-foreground/80 line-clamp-2">
              <span className="text-emerald-400">✓</span> {existingNote.improvements}
            </p>
          )}
        </motion.div>
      )}

      {/* Expandable content */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pt-4 space-y-4">
              {/* Improvements */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-primary" />
                  {REFLECTION_PROMPTS.improvements.prompt}
                </label>
                <Textarea
                  placeholder={REFLECTION_PROMPTS.improvements.placeholder}
                  value={improvements}
                  onChange={(e) => setImprovements(e.target.value)}
                  className="min-h-[100px] bg-muted/50 border-border/50 resize-none"
                />
              </div>

              {/* Additional Notes */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-accent" />
                  {REFLECTION_PROMPTS.notes.prompt}
                </label>
                <Textarea
                  placeholder={REFLECTION_PROMPTS.notes.placeholder}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-[80px] bg-muted/50 border-border/50 resize-none"
                />
              </div>

              <Button
                onClick={handleSave}
                disabled={(!improvements.trim() && !notes.trim()) || isSaving || !hasChanges}
                className="w-full"
                variant={hasChanges ? 'default' : 'secondary'}
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Saving...' : hasChanges ? 'Save Changes' : 'Saved'}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
