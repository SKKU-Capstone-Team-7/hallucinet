"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
// import bgPic from "@/bg.png";

interface UserFooterProps {
  user: { name?: string; email: string };
  onLogout: () => void;
}

export default function UserFooter({ user, onLogout }: UserFooterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(o => !o)}
        className="
          flex w-full items-center gap-2 rounded-lg border-0
          bg-transparent px-2 py-2 text-sm text-gray-900
          hover:bg-gray-200 hover:border-transparent
          focus:outline-none focus:ring-0
        "
      >
        <div className="relative h-8 w-8 flex-shrink-0 overflow-hidden rounded-full">
          {/* <Image
            src={bgPic}
            alt="User avatar"
            fill
            sizes="32px"
            className="object-cover"
          /> */}
        </div>
        <div className="flex-1 text-sm text-left">
          <div className="font-medium">{user.name || user.email}</div>
          <div className="text-gray-500">{user.email}</div>
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="
            h-5 w-5 text-gray-600            /* size & base color */
            transition-transform duration-200 /* smooth animation */
            hover:rotate-180                  /* flip on hover */
          "
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m7 15 5 5 5-5" />
          <path d="m7 9 5-5 5 5" />
        </svg>
      </button>

      {isOpen && (
        <div
          className="
            absolute left-full bottom-0 ml-2 z-50 w-56
            rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5
          "
        >
          <div className="py-1">
            <div className="px-4 py-2 text-sm font-medium text-gray-700">
              My Account
            </div>
            <div className="border-t border-gray-100" />
            {[
  {
    label: "Upgrade to Pro",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-4 w-4 text-gray-700 mr-2"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/>
        <path d="M20 3v4"/>
        <path d="M22 5h-4"/>
        <path d="M4 17v2"/>
        <path d="M5 18H3"/>
      </svg>
    )
  },
  { label: "Account",       
    icon: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-4 w-4 text-gray-700 mr-2"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="10" r="3" />
      <path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662"/>
    </svg>
  ) 
},
  { label: "Billing",       
    icon: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-4 w-4 text-gray-700 mr-2"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="14" x="2" y="5" rx="2" />
      <line x1="2" x2="22" y1="10" y2="10" />
    </svg>
  )
},
  { label: "Notifications", 
    icon: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-4 w-4 text-gray-700 mr-2"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10.268 21a2 2 0 0 0 3.464 0"/>
      <path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"/>
    </svg>
  ) 
},
].map(({ label, icon }) => (
  <button
    key={label}
    onClick={() => {}}
    className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
  >
    {icon}
    <span>{label}</span>
  </button>
))}

            <div className="border-t border-gray-100" />
            <button
              onClick={onLogout}
              className="
                flex items-center w-full px-4 py-2 text-sm text-red-600 
                hover:bg-red-50 text-left
              "
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-2 text-red-600"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Log out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
