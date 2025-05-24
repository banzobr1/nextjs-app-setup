"use client";

import React, { useState } from "react";

const conversations = [
  {
    id: 1,
    name: "João Silva",
    lastMessage: "Oi, tudo bem?",
    avatar: "/default-avatar.png",
  },
  {
    id: 2,
    name: "Maria Oliveira",
    lastMessage: "Vamos estudar juntos amanhã?",
    avatar: "/default-avatar.png",
  },
  {
    id: 3,
    name: "Carlos Santos",
    lastMessage: "Recebi o material, obrigado!",
    avatar: "/default-avatar.png",
  },
];

export default function DirectMessages() {
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [messages, setMessages] = useState<{ id: number; text: string; sender: string }[]>([
    { id: 1, text: "Oi, tudo bem?", sender: "João Silva" },
    { id: 2, text: "Tudo sim, e você?", sender: "Você" },
  ]);
  const [newMessage, setNewMessage] = useState("");

  const handleSendMessage = () => {
    if (newMessage.trim() === "") return;
    setMessages([...messages, { id: messages.length + 1, text: newMessage, sender: "Você" }]);
    setNewMessage("");
  };

  return (
    <div className="flex h-[500px] max-w-4xl bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      {/* Conversations list */}
      <div className="w-1/3 border-r border-gray-300 dark:border-gray-700 overflow-y-auto">
        <h2 className="p-4 font-semibold border-b border-gray-300 dark:border-gray-700 dark:text-gray-200">Conversas</h2>
        {conversations.map((conv) => (
          <div
            key={conv.id}
            className={`flex items-center p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${
              selectedConversation === conv.id ? "bg-gray-200 dark:bg-gray-600" : ""
            }`}
            onClick={() => setSelectedConversation(conv.id)}
          >
            <img
              src={conv.avatar}
              alt={conv.name}
              className="w-12 h-12 rounded-full mr-4"
            />
            <div>
              <p className="font-semibold dark:text-gray-200">{conv.name}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-xs">{conv.lastMessage}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Chat window */}
      <div className="flex flex-col flex-grow">
        <div className="p-4 border-b border-gray-300 dark:border-gray-700 font-semibold dark:text-gray-200">
          {selectedConversation
            ? conversations.find((c) => c.id === selectedConversation)?.name
            : "Selecione uma conversa"}
        </div>
        <div className="flex-grow p-4 overflow-y-auto space-y-3">
          {selectedConversation ? (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`max-w-xs p-2 rounded ${
                  msg.sender === "Você" 
                    ? "bg-blue-500 text-white self-end" 
                    : "bg-gray-200 dark:bg-gray-700 dark:text-gray-200"
                }`}
              >
                {msg.text}
              </div>
            ))
          ) : (
            <p className="text-gray-500 dark:text-gray-400">Nenhuma conversa selecionada.</p>
          )}
        </div>
        {selectedConversation && (
          <div className="p-4 border-t border-gray-300 dark:border-gray-700 flex space-x-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Digite uma mensagem..."
              className="flex-grow border border-gray-300 dark:border-gray-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-gray-200"
            />
            <button
              onClick={handleSendMessage}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Enviar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
