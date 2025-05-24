"use client";

import React, { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase-init";
import NotificationItem from "@/components/NotificationItem";
import { useAuth } from "@/lib/AuthContext";

interface Notification {
  id: string;
  type: "like" | "comment" | "follow";
  username: string;
  userAvatar: string;
  timestamp: any;
  postImage?: string;
  read: boolean;
  postId?: string;
  userId?: string;
}

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    // Subscribe to notifications
    const notificationsRef = collection(db, "notifications");
    const q = query(notificationsRef, orderBy("timestamp", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notificationsData: Notification[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        notificationsData.push({
          id: doc.id,
          type: data.type,
          username: data.username,
          userAvatar: data.userAvatar,
          timestamp: data.timestamp?.toDate(),
          postImage: data.postImage,
          read: data.read,
          postId: data.postId,
          userId: data.userId,
        });
      });
      setNotifications(notificationsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleNotificationClick = async (notification: Notification) => {
    // Mark notification as read
    if (!notification.read) {
      const notificationRef = doc(db, "notifications", notification.id);
      await updateDoc(notificationRef, {
        read: true,
      });
    }

    // Navigate based on notification type
    if (notification.type === "follow" && notification.userId) {
      // Navigate to user profile
      window.location.href = `/profile/${notification.userId}`;
    } else if (notification.postId) {
      // Navigate to post
      window.location.href = `/post/${notification.postId}`;
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
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold p-4 border-b border-gray-300 dark:border-gray-700 dark:text-gray-200">
        Notificações
      </h1>

      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-gray-500 dark:text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-center">
            Você não tem notificações no momento
          </p>
        </div>
      ) : (
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              type={notification.type}
              username={notification.username}
              userAvatar={notification.userAvatar}
              timestamp={notification.timestamp}
              postImage={notification.postImage}
              read={notification.read}
              onClick={() => handleNotificationClick(notification)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
