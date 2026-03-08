"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, X, ChevronDown, Check } from "lucide-react";
import { authService } from "@/lib/redux/auth-api";
import type { User } from "@/lib/types";

interface UserSearchSelectProps {
  onSelectUser: (user: User | null) => void;
  selectedUser: User | null;
  disabled?: boolean;
  placeholder?: string;
  businessId: string;
}

export const UserSearchSelect: React.FC<UserSearchSelectProps> = ({
  onSelectUser,
  selectedUser,
  disabled = false,
  placeholder = "Search by name or email...",
  businessId,
}) => {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [filtered, setFiltered] = useState<User[]>([]);
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!businessId) return;
    authService
      .getAcceptedApplicants(businessId)
      .then(setUsers)
      .catch(console.error);
  }, [businessId]);

  useEffect(() => {
    const q = query.toLowerCase().trim();
    setFiltered(
      !q
        ? users
        : users.filter(
            (u) =>
              `${u.first_name} ${u.last_name}`.toLowerCase().includes(q) ||
              u.email.toLowerCase().includes(q)
          )
    );
  }, [query, users]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const selectUser = (user: User) => {
    onSelectUser(user);
    setQuery("");
    setOpen(false);
  };

  const clear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectUser(null);
    setQuery("");
  };

  return (
    <div ref={wrapperRef} className="relative">
      {/* Trigger button — looks like a select */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((o) => !o)}
        className={`w-full flex items-center justify-between px-3 py-2.5 border rounded-xl text-base transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
          disabled
            ? "bg-gray-50 border-gray-200 cursor-not-allowed text-gray-400"
            : open
            ? "border-blue-400 bg-white ring-2 ring-blue-500/20"
            : "border-gray-200 bg-white hover:border-gray-300"
        }`}
      >
        {selectedUser ? (
          <span className="flex items-center gap-2 min-w-0">
            <span className="w-6 h-6 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700 text-xs font-bold shrink-0">
              {selectedUser.first_name?.[0]}
            </span>
            <span className="font-medium text-gray-900 truncate">
              {selectedUser.first_name} {selectedUser.last_name}
            </span>
            <span className="text-gray-400 truncate hidden sm:inline">
              · {selectedUser.email}
            </span>
          </span>
        ) : (
          <span className="text-gray-400">{placeholder}</span>
        )}

        <span className="flex items-center gap-1.5 shrink-0 ml-2">
          {selectedUser && !disabled && (
            <span
              onClick={clear}
              className="w-5 h-5 rounded-md flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </span>
          )}
          <ChevronDown
            className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
              open ? "rotate-180" : ""
            }`}
          />
        </span>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
          {/* Search inside dropdown */}
          <div className="p-2 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search..."
                className="w-full pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
              />
            </div>
          </div>

          {/* Options */}
          <div className="max-h-52 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="px-3 py-6 text-center text-base text-gray-400">
                {query ? "No users found" : "No accepted applicants yet"}
              </div>
            ) : (
              filtered.slice(0, 10).map((user) => (
                <button
                  key={user.id}
                  onClick={() => selectUser(user)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 text-xs font-bold shrink-0">
                    {user.first_name?.[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-medium text-gray-900 truncate">
                      {user.first_name} {user.last_name}
                    </p>
                    <p className="text-xs text-gray-400 truncate">{user.email}</p>
                  </div>
                  {selectedUser?.id === user.id && (
                    <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
