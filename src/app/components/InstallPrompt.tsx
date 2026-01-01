"use client";

import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Download } from "lucide-react";

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    // Listen for the browser's install prompt event
    window.addEventListener("beforeinstallprompt", (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);
      // Update UI to show the install button
      setIsInstallable(true);
    });

    // Listen for successful installation
    window.addEventListener("appinstalled", () => {
      setIsInstallable(false);
      setDeferredPrompt(null);
      console.log("PWA was installed");
    });
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);

    // We've used the prompt, and can't use it again
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  if (!isInstallable) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-md animate-in slide-in-from-bottom-10 duration-700">
      <div className="bg-slate-900 text-white p-4 rounded-3xl shadow-2xl flex items-center justify-between border border-teal-500/30">
        <div className="flex items-center gap-3">
          <div className="size-10 bg-white rounded-xl flex items-center justify-center">
            <img src="/logo.png" alt="Logo" className="size-7 object-contain" />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-widest">Install Logic App</p>
            <p className="text-[10px] text-slate-400 font-medium leading-none">For a faster experience</p>
          </div>
        </div>
        <Button 
          onClick={handleInstallClick}
          className="bg-teal-600 hover:bg-teal-500 text-white rounded-xl px-6 h-10 font-black uppercase text-[10px] tracking-widest"
        >
          <Download size={14} className="mr-2" /> Install
        </Button>
      </div>
    </div>
  );
}