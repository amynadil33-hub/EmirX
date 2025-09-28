import React, { useState, useEffect } from 'react';
import { StickyNote, Save, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Note {
  id: string;
  content: string;
  timestamp: Date;
}

const Notepad: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [currentNote, setCurrentNote] = useState('');
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);

  // Load notes from localStorage on component mount
  useEffect(() => {
    const savedNotes = localStorage.getItem('chat-notes');
    if (savedNotes) {
      const parsedNotes = JSON.parse(savedNotes).map((note: any) => ({
        ...note,
        timestamp: new Date(note.timestamp)
      }));
      setNotes(parsedNotes);
    }
  }, []);

  // Save notes to localStorage whenever notes change
  useEffect(() => {
    localStorage.setItem('chat-notes', JSON.stringify(notes));
  }, [notes]);

  const saveNote = () => {
    if (!currentNote.trim()) return;

    if (selectedNoteId) {
      // Update existing note
      setNotes(prev => prev.map(note => 
        note.id === selectedNoteId 
          ? { ...note, content: currentNote, timestamp: new Date() }
          : note
      ));
    } else {
      // Create new note
      const newNote: Note = {
        id: Date.now().toString(),
        content: currentNote,
        timestamp: new Date()
      };
      setNotes(prev => [newNote, ...prev]);
    }
    
    setCurrentNote('');
    setSelectedNoteId(null);
  };

  const selectNote = (note: Note) => {
    setCurrentNote(note.content);
    setSelectedNoteId(note.id);
  };

  const deleteNote = (noteId: string) => {
    setNotes(prev => prev.filter(note => note.id !== noteId));
    if (selectedNoteId === noteId) {
      setCurrentNote('');
      setSelectedNoteId(null);
    }
  };

  const newNote = () => {
    setCurrentNote('');
    setSelectedNoteId(null);
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <StickyNote className="w-4 h-4" />
          Quick Notes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Note Input */}
        <div className="space-y-2">
          <Textarea
            placeholder="Write a quick note..."
            value={currentNote}
            onChange={(e) => setCurrentNote(e.target.value)}
            className="min-h-[80px] text-sm"
          />
          <div className="flex gap-1">
            <Button 
              size="sm" 
              onClick={saveNote}
              disabled={!currentNote.trim()}
              className="flex-1"
            >
              <Save className="w-3 h-3 mr-1" />
              {selectedNoteId ? 'Update' : 'Save'}
            </Button>
            {selectedNoteId && (
              <Button size="sm" variant="outline" onClick={newNote}>
                <Plus className="w-3 h-3" />
              </Button>
            )}
          </div>
        </div>

        {/* Notes List */}
        <div className="space-y-2 max-h-[200px] overflow-y-auto">
          {notes.map((note) => (
            <div
              key={note.id}
              className={`p-2 rounded border cursor-pointer transition-colors ${
                selectedNoteId === note.id 
                  ? 'bg-blue-50 border-blue-200' 
                  : 'bg-gray-50 hover:bg-gray-100'
              }`}
              onClick={() => selectNote(note)}
            >
              <p className="text-xs text-gray-600 mb-1">
                {note.timestamp.toLocaleDateString()} {note.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
              <p className="text-sm text-gray-800 line-clamp-2">
                {note.content}
              </p>
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteNote(note.id);
                }}
                className="mt-1 h-6 w-6 p-0 text-red-500 hover:text-red-700"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>

        {notes.length === 0 && (
          <p className="text-xs text-gray-500 text-center py-4">
            No notes yet. Start writing!
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default Notepad;