import React from "react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface NotificationItemProps {
  type: "like" | "comment" | "follow";
  username: string;
  userAvatar: string;
  timestamp: Date;
  postImage?: string;
  read: boolean;
  onClick: () => void;
}

export default function NotificationItem({
  type,
  username,
  userAvatar,
  timestamp,
  postImage,
  read,
  onClick,
}: NotificationItemProps) {
  const getNotificationText = () => {
    switch (type) {
      case "like":
        return "curtiu sua publicação";
      case "comment":
        return "comentou em sua publicação";
      case "follow":
        return "começou a seguir você";
      default:
        return "";
    }
  };

  return (
    <div
      className={`flex items-center p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer ${
        !read ? "bg-blue-50 dark:bg-blue-900/20" : ""
      }`}
      onClick={onClick}
    >
      <img
        src={userAvatar}
        alt={username}
        className="w-12 h-12 rounded-full object-cover"
      />
      <div className="ml-3 flex-grow">
        <p className="text-sm dark:text-gray-200">
          <span className="font-semibold">{username}</span>{" "}
          {getNotificationText()}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {formatDistanceToNow(timestamp, { addSuffix: true, locale: ptBR })}
        </p>
      </div>
      {postImage && (
        <img
          src={postImage}
          alt="Post"
          className="w-14 h-14 object-cover rounded"
        />
      )}
      {!read && (
        <div className="w-2 h-2 rounded-full bg-blue-500 ml-2"></div>
      )}
    </div>
  );
}
