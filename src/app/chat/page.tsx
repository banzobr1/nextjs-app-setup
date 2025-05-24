"use client";

import React, { useState, useEffect, useRef } from "react";
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, where } from "firebase/firestore";
import { db } from "@/lib/firebase-init";
import { PaperAirplaneIcon } from "@heroicons/react/24/solid";
import { useAuth } from "@/lib/AuthContext";

interface Message {
  id: string;
  text: string;
  sender: string;
  timestamp: any;
  read: boolean;
}

interface Chat {
  id: string;
  participants: string[];
  lastMessage: string;
  lastMessageTime: any;
  unreadCount: number;
}

export default function ChatPage() {
  const { user } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;

    // Subscribe to chats
    const chatsRef = collection(db, "chats");
    const q = query(
      chatsRef,
      where("participants", "array-contains", user.uid),
      orderBy("lastMessageTime", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chatsData: Chat[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        chatsData.push({
          id: doc.id,
          participants: data.participants,
          lastMessage: data.lastMessage,
          lastMessageTime: data.lastMessageTime?.toDate(),
          unreadCount: data.unreadCount || 0,
        });
      });
      setChats(chatsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    // Subscribe to messages when a chat is selected
    if (!selectedChat) return;

    const messagesRef = collection(db, "chats", selectedChat, "messages");
    const q = query(messagesRef, orderBy("timestamp", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messagesData: Message[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        messagesData.push({
          id: doc.id,
          text: data.text,
          sender: data.sender,
          timestamp: data.timestamp?.toDate(),
          read: data.read,
        });
      });
      setMessages(messagesData);
      scrollToBottom();
    });

    return () => unsubscribe();
  }, [selectedChat]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChat || !newMessage.trim() || !user) return;

    try {
      const messagesRef = collection(db, "chats", selectedChat, "messages");
      await addDoc(messagesRef, {
        text: newMessage,
        sender: user.uid,
        timestamp: serverTimestamp(),
        read: false,
      });

      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Chat list */}
      <div className="w-1/3 border-r border-gray-300 dark:border-gray-700 overflow-y-auto">
        <div className="p-4 border-b border-gray-300 dark:border-gray-700">
          <h2 className="text-xl font-semibold dark:text-gray-200">Mensagens</h2>
        </div>
        {chats.map((chat) => (
          <div
            key={chat.id}
            onClick={() => setSelectedChat(chat.id)}
            className={`flex items-center p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 ${
              selectedChat === chat.id ? "bg-gray-100 dark:bg-gray-700" : ""
            }`}
          >
            <img
              src="/default-avatar.png"
              alt="User avatar"
              className="w-12 h-12 rounded-full"
            />
            <div className="ml-4 flex-grow">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold dark:text-gray-200">
                  {chat.participants.find((p) => p !== user?.uid)}
                </h3>
                {chat.lastMessageTime && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(chat.lastMessageTime).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                {chat.lastMessage}
              </p>
            </div>
            {chat.unreadCount > 0 && (
              <span className="ml-2 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {chat.unreadCount}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Chat messages */}
      <div className="flex-grow flex flex-col bg-gray-50 dark:bg-gray-900">
        {selectedChat ? (
          <>
            <div className="flex-grow overflow-y-auto p-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex mb-4 ${
                    message.sender === user?.uid ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg ${
                      message.sender === user?.uid
                        ? "bg-blue-500 text-white"
                        : "bg-white dark:bg-gray-800 dark:text-gray-200"
                    }`}
                  >
                    <p>{message.text}</p>
                    <span className="text-xs opacity-75 mt-1 block">
                      {message.timestamp?.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <form
              onSubmit={handleSendMessage}
              className="p-4 border-t border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
            >
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Digite uma mensagem..."
                  className="flex-grow px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-200"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="p-2 rounded-full bg-blue-500 text-white disabled:opacity-50"
                >
                  <PaperAirplaneIcon className="h-5 w-5" />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
            <svg
              className="w-16 h-16 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <p>Selecione uma conversa para começar</p>
          </div>
        )}
      </div>
    </div>
  );
}
