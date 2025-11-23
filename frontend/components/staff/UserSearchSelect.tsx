"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { authService } from "@/lib/redux/auth-api";
import type { User } from "@/lib/types";

interface UserSearchSelectProps {
  onSelectUser: (user: User | null) => void;
  selectedUser: User | null;
  disabled?: boolean;
  placeholder?: string;
}

export const UserSearchSelect: React.FC<UserSearchSelectProps> = ({
  onSelectUser,
  selectedUser,
  disabled = false,
  placeholder = "Search users by name or email...",
}) => {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [filtered, setFiltered] = useState<User[]>([]);
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Load users once
  useEffect(() => {
    authService.searchUsers("").then(setUsers).catch(console.error);
  }, []);

  // Filter as user types
  useEffect(() => {
    const q = query.toLowerCase().trim();
    if (!q) {
      setFiltered(users);
    } else {
      setFiltered(
        users.filter(
          (u) =>
            `${u.first_name} ${u.last_name}`.toLowerCase().includes(q) ||
            u.email.toLowerCase().includes(q)
        )
      );
    }
  }, [query, users]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectUser = (user: User) => {
    onSelectUser(user);
    setQuery("");
    setOpen(false);
  };

  const clear = () => {
    onSelectUser(null);
    setQuery("");
  };

  return (
    <div ref={wrapperRef} className="relative">
      {/* Selected User - Simple Pill */}
      {selectedUser ? (
        <div className="flex items-center justify-between px-3 py-2 border rounded-md text-sm">
          <span>
            {selectedUser.first_name} {selectedUser.last_name} ({selectedUser.email})
          </span>
          {!disabled && (
            <button onClick={clear} className="ml-2 text-gray-500 hover:text-gray-700">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setOpen(true)}
              placeholder={placeholder}
              disabled={disabled}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>

          {/* Simple Dropdown */}
          {open && filtered.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-sm max-h-60 overflow-auto z-10">
              {filtered.slice(0, 10).map((user) => (
                <button
                  key={user.id}
                  onClick={() => selectUser(user)}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 transition-colors"
                >
                  <div className="font-medium">
                    {user.first_name} {user.last_name}
                  </div>
                  <div className="text-xs text-gray-500">{user.email}</div>
                </button>
              ))}
            </div>
          )}

          {/* Empty State */}
          {open && query && filtered.length === 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-sm p-3 text-center text-sm text-gray-500">
              No users found
            </div>
          )}
        </>
      )}
    </div>
  );
};
