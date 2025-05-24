"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useAuth, AuthProvider } from "@/lib/AuthContext";
import PageTransition from "@/components/PageTransition";

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return <>{children}</>;
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-white dark:bg-black text-black dark:text-white">
        <AuthProvider>
          <AuthGuard>
            <PageTransition>{children}</PageTransition>
          </AuthGuard>
        </AuthProvider>
      </body>
    </html>
  );
}
