"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogout() {
    setIsLoading(true);
    // POST to server-side route that clears the session cookies
    await fetch("/auth/logout", { method: "POST", redirect: "follow" });
    window.location.href = "/login";
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleLogout}
      disabled={isLoading}
    >
      {isLoading ? "מתנתק..." : "התנתקות"}
    </Button>
  );
}
