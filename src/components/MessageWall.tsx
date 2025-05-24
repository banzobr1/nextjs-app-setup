"use client";

import React, { useState } from "react";

interface WallMessage {
  id: number;
  author: string | null; // null means anonymous
  content: string;
  timestamp: string;
}

const initialMessages: WallMessage[] = [
  {
    id: 1,
    author: "João Silva",
    content: "Alguém sabe se vai ter aula amanhã?",
    timestamp: "2024-05-20 15:00",
  },
  {
    id: 2,
    author: null,
    content: "Não esqueçam do prazo do trabalho!",
    timestamp: "2024-05-20 15:05",
  },
];

export default function MessageWall() {
  const [messages, setMessages] = useState<WallMessage[]>(initialMessages);
  const [newMessage, setNewMessage] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);

  const sendMessage = () => {
    if (newMessage.trim() === "") return;

    const message: WallMessage = {
      id: messages.length + 1,
      author: isAnonymous ? null : "Você",
      content: newMessage,
      timestamp: new Date().toLocaleString(),
    };

    setMessages([...messages, message]);
    setNewMessage("");
  };

  return (
    <div className="max-w-2xl mx-auto p-4 bg-white rounded shadow">
      <h3 className="text-xl font-semibold mb-4 text-blue-700">Mural de Publicações</h3>
      <div className="mb-4 max-h-64 overflow-y-auto border border-gray-300 rounded p-2">
        {messages.map((msg) => (
          <div key={msg.id} className="mb-2">
            <span className="font-semibold">{msg.author ?? "Anônimo"}: </span>
            <span>{msg.content}</span>
            <div className="text-xs text-gray-500">{msg.timestamp}</div>
          </div>
        ))}
      </div>
      <div className="mb-2">
        <textarea
          className="w-full border border-gray-300 rounded px-3 py-2"
          placeholder="Escreva sua mensagem..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          rows={3}
        />
      </div>
      <div className="flex items-center justify-between">
        <label className="inline-flex items-center space-x-2">
          <input
            type="checkbox"
            checked={isAnonymous}
            onChange={() => setIsAnonymous(!isAnonymous)}
          />
          <span>Postar anonimamente</span>
        </label>
        <button
          onClick={sendMessage}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Publicar
        </button>
      </div>
    </div>
  );
}
