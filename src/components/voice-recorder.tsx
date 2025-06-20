import React, { useState, useRef , useEffect } from 'react';
import { Mic, Pause , Check, X, Play } from 'lucide-react';
import { Button } from './ui/button';
import { useChat } from './chat-provider';
import WaveSurfer from 'wavesurfer.js';
import RecordPlugin from 'wavesurfer.js/dist/plugins/record.esm.js';

interface VoiceRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void;
  onCancel: () => void;
}

export function VoiceRecorder({ onRecordingComplete, onCancel }: VoiceRecorderProps) {
  const { isRecording, setIsRecording , waveformRef} = useChat();
  const [isPaused, setIsPaused] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const didCancelRef = useRef(false);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const recordRef = useRef<RecordPlugin | null>(null);



  useEffect(() => {
    // When recording starts and waveform container is mounted
    if (isRecording && waveformRef.current ) {
      const wavesurfer = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: 'rgb(200,200, 200)',
        progressColor: 'rgb(100, 0, 100)',
      });

      const record = wavesurfer.registerPlugin(
        RecordPlugin.create({
          renderRecordedAudio: false,
          scrollingWaveform: true,
        })
      );

      wavesurferRef.current = wavesurfer;
      recordRef.current = record;

      record.startRecording();
    }
    else
    {
        recordRef.current?.stopRecording();
        wavesurferRef.current?.destroy();
    }
  }, [isRecording, waveformRef]);



  const startRecording = async () => {
    try {

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm',
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
      
        // Only call onRecordingComplete if not cancelled
        if (!didCancelRef.current) {
          onRecordingComplete(audioBlob);
        } else {
          didCancelRef.current = false; // reset for future recordings
        }
      
        stream.getTracks().forEach((track) => track.stop());
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
      recordRef.current?.resumeRecording();
    } else {
      mediaRecorderRef.current.pause();
      recordRef.current?.pauseRecording();
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

  const cancelRecording = () => {
    didCancelRef.current = true; // mark as canceled
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
  
    if (recordRef.current?.isRecording()) {
      recordRef.current.stopRecording();
    }
  
    setIsRecording(false);
    setIsPaused(false);
    onCancel();
  
    // Clean up wavesurfer
    wavesurferRef.current?.destroy();
    wavesurferRef.current = null;
    recordRef.current = null;
  };
  

  useEffect(() => {
    // Cleanup on unmount (ensure this runs if component is removed while recording)
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      if (recordRef.current?.isRecording()) {
        recordRef.current.stopRecording();
      }
      wavesurferRef.current?.destroy();
    };
  }, []);


  return (
    <div className="flex items-center gap-2">
      {!isRecording ? (
        <Button
          type="button"
          size="sm"
          onClick={startRecording}
          className="h-8 w-8 p-0 bg-transparent hover:bg-[rgb(84,80,80)] text-white rounded-full"
        >
          <Mic size={17} />
        </Button>
      ) : (
        <>  
          <Button
            type="button"
            size="sm"
            onClick={togglePause}
            className="h-8 w-8 p-0 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-full"
          >
            {isPaused ? <Play size={16} /> : <Pause size={16} />}
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={stopRecording}
            className="h-8 w-8 p-0 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-full"
          >
            <Check size={16} />
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={cancelRecording}
            className="h-8 w-8 p-0 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-full"
          >
            <X size={16} />
          </Button>

        </>
      )}
    </div>
  );
}
