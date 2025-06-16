import React, { useState, useRef } from 'react';
import { Mic, Square, Pause } from 'lucide-react';
import { Button } from './ui/button';

interface VoiceRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void;
  onCancel: () => void;
}

export function VoiceRecorder({ onRecordingComplete, onCancel }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        onRecordingComplete(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      onCancel();
    }
  };

  const togglePause = () => {
    if (!mediaRecorderRef.current) return;

    if (isPaused) {
      mediaRecorderRef.current.resume();
    } else {
      mediaRecorderRef.current.pause();
    }
    setIsPaused(!isPaused);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {!isRecording ? (
        <Button
          type="button"
          size="sm"
          onClick={startRecording}
          className="h-8 w-8 p-0 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-full"
        >
          <Mic size={16} />
        </Button>
      ) : (
        <>
          <Button
            type="button"
            size="sm"
            onClick={togglePause}
            className="h-8 w-8 p-0 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-full"
          >
            {isPaused ? <Mic size={16} /> : <Pause size={16} />}
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={stopRecording}
            className="h-8 w-8 p-0 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-full"
          >
            <Square size={16} />
          </Button>
        </>
      )}
    </div>
  );
} 