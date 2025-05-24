"use client";

import React, { useState, useRef, useEffect } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../lib/firebase-init";
import {
  StopIcon,
  PlayIcon,
  PauseIcon,
  XMarkIcon,
  ArrowUpTrayIcon,
} from "@heroicons/react/24/solid";

interface VideoRecorderProps {
  onUpload: (videoUrl: string) => void;
  onCancel: () => void;
}

export default function VideoRecorder({ onUpload, onCancel }: VideoRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [error, setError] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    requestCameraPermission();
    return () => {
      stopStream();
    };
  }, []);

  const requestCameraPermission = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: {
          width: { ideal: 1080 },
          height: { ideal: 1920 },
          facingMode: "user"
        }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      setError("Não foi possível acessar a câmera. Por favor, verifique as permissões.");
    }
  };

  const startRecording = () => {
    if (!stream) return;

    chunksRef.current = [];
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "video/mp4" });
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
      if (videoRef.current) {
        videoRef.current.srcObject = null;
        videoRef.current.src = url;
      }
    };

    mediaRecorder.start();
    setIsRecording(true);
    startTimer();
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      clearInterval(timerRef.current);
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      startTimer();
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      clearInterval(timerRef.current);
    }
  };

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setRecordingTime((prev) => {
        if (prev >= 15) { // 15 seconds maximum
          stopRecording();
          return prev;
        }
        return prev + 1;
      });
    }, 1000);
  };

  const handleUpload = async () => {
    if (!previewUrl) return;

    try {
      setIsUploading(true);
      const blob = await fetch(previewUrl).then(r => r.blob());
      const storageRef = ref(storage, `stories/video/${Date.now()}-recorded.mp4`);
      await uploadBytes(storageRef, blob);
      const downloadUrl = await getDownloadURL(storageRef);
      onUpload(downloadUrl);
    } catch (err) {
      setError("Erro ao fazer upload do vídeo. Tente novamente.");
    } finally {
      setIsUploading(false);
    }
  };

  const stopStream = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
  };

  const formatTime = (seconds: number) => {
    return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full mx-4">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-lg font-semibold dark:text-gray-200">
            Gravar História
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="relative aspect-[9/16] bg-black">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          
          {error && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-red-500/90 text-white p-4 rounded-lg max-w-xs text-center">
                {error}
              </div>
            </div>
          )}

          {isRecording && (
            <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
              <span>{formatTime(recordingTime)}</span>
            </div>
          )}
        </div>

        <div className="p-4 flex justify-between items-center">
          {!previewUrl ? (
            <div className="flex space-x-4">
              {!isRecording ? (
                <button
                  onClick={startRecording}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                  disabled={!stream}
                >
                  <PlayIcon className="h-5 w-5" />
                  <span>Iniciar</span>
                </button>
              ) : (
                <>
                  {!isPaused ? (
                    <button
                      onClick={pauseRecording}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                    >
                      <PauseIcon className="h-5 w-5" />
                      <span>Pausar</span>
                    </button>
                  ) : (
                    <button
                      onClick={resumeRecording}
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                    >
                      <PlayIcon className="h-5 w-5" />
                      <span>Continuar</span>
                    </button>
                  )}
                  <button
                    onClick={stopRecording}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                  >
                    <StopIcon className="h-5 w-5" />
                    <span>Parar</span>
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="flex space-x-4">
              <button
                onClick={handleUpload}
                disabled={isUploading}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowUpTrayIcon className="h-5 w-5" />
                <span>{isUploading ? "Enviando..." : "Publicar"}</span>
              </button>
              <button
                onClick={() => {
                  setPreviewUrl(null);
                  setRecordingTime(0);
                  if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                  }
                }}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
                disabled={isUploading}
              >
                Regravar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
