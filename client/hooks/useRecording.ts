// src/hooks/useRecording.ts
import { useCallback } from 'react';
import { getAudioStream } from '@/services/audio';
import { transcribeAudio } from '@/services/api';

export const useRecording = (
  mediaRecorderRef: React.MutableRefObject<MediaRecorder | null>,
  audioChunksRef: React.MutableRefObject<Blob[]>,
  setAudioState: (state: any) => void,
  handleChatFlow: (text: string) => Promise<void>
) => {
  const startRecording = useCallback(async () => {
    try {
      const stream = await getAudioStream();
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0 && audioChunksRef.current) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start(100);
      setAudioState(prev => ({
        ...prev,
        isRecording: true,
        recordingComplete: false
      }));
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("Error accessing microphone. Please check your device settings.");
    }
  }, [mediaRecorderRef, audioChunksRef, setAudioState]);

  const stopRecording = useCallback(async () => {
    if (mediaRecorderRef.current && audioChunksRef.current) {
      mediaRecorderRef.current.stop();
      setAudioState(prev => ({
        ...prev,
        isRecording: false,
        isProcessing: true
      }));

      try {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
        const { text } = await transcribeAudio(audioBlob);
        await handleChatFlow(text);
      } catch (error) {
        console.error("Error in transcription:", error);
      } finally {
        setAudioState(prev => ({
          ...prev,
          isProcessing: false
        }));
        audioChunksRef.current = [];
      }
    }
  }, [mediaRecorderRef, audioChunksRef, setAudioState, handleChatFlow]);

  return {
    startRecording,
    stopRecording
  };
};