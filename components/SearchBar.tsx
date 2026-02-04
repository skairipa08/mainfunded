'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search as SearchIcon, X, Clock, TrendingUp, ArrowRight } from 'lucide-react';
import { search, getSuggestions, getPopularSearches } from '@/lib/search';
import Link from 'next/link';

interface SearchBarProps {
    className?: string;
    onResultClick?: () => void;
}

export default function SearchBar({ className = '', onResultClick }: SearchBarProps) {
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [results, setResults] = useState<any[]>([]);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Load recent searches from localStorage
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('recentSearches');
            if (saved) {
                setRecentSearches(JSON.parse(saved).slice(0, 5));
            }
        }
    }, []);

    // Handle search
    useEffect(() => {
        if (query.length >= 2) {
            const searchResults = search(query, { limit: 5 });
            setResults(searchResults);
            setSuggestions(getSuggestions(query, 3));
        } else {
            setResults([]);
            setSuggestions([]);
        }
    }, [query]);

    // Click outside handler
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearch = (searchQuery: string) => {
        if (!searchQuery.trim()) return;

        // Save to recent searches
        const updated = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5);
        setRecentSearches(updated);
        localStorage.setItem('recentSearches', JSON.stringify(updated));

        setQuery(searchQuery);
        setIsOpen(false);
        onResultClick?.();
    };

    const clearSearch = () => {
        setQuery('');
        setResults([]);
        inputRef.current?.focus();
    };

    const popularSearches = getPopularSearches();

    return (
        <div ref={containerRef} className={`relative ${className}`}>
            {/* Search Input */}
            <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setIsOpen(true)}
                    placeholder="Kampanya veya öğrenci ara..."
                    className="w-full pl-10 pr-10 py-2.5 border rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
                {query && (
                    <button
                        onClick={clearSearch}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 rounded-full"
                    >
                        <X className="h-4 w-4 text-gray-400" />
                    </button>
                )}
            </div>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border shadow-xl z-50 overflow-hidden max-h-[400px] overflow-y-auto">
                    {/* Suggestions */}
                    {suggestions.length > 0 && (
                        <div className="p-2 border-b">
                            {suggestions.map((suggestion, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleSearch(suggestion)}
                                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 rounded-lg flex items-center gap-2"
                                >
                                    <SearchIcon className="h-4 w-4 text-gray-400" />
                                    <span>{suggestion}</span>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Results */}
                    {results.length > 0 && (
                        <div className="p-2">
                            <p className="px-3 py-1 text-xs font-medium text-gray-500 uppercase">Sonuçlar</p>
                            {results.map((result) => (
                                <Link
                                    key={result.item.id}
                                    href={result.item.url}
                                    onClick={() => {
                                        handleSearch(query);
                                        setIsOpen(false);
                                    }}
                                    className="block px-3 py-2 hover:bg-gray-100 rounded-lg"
                                >
                                    <div className="flex items-start gap-3">
                                        {result.item.image && (
                                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex-shrink-0" />
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-gray-900 truncate">{result.item.title}</p>
                                            <p className="text-sm text-gray-500 line-clamp-1">
                                                {result.highlights[0]?.text || result.item.description.substring(0, 60)}...
                                            </p>
                                            <span className="inline-block mt-1 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                                                {result.item.type === 'campaign' ? 'Kampanya' : 'Öğrenci'}
                                            </span>
                                        </div>
                                        <ArrowRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}

                    {/* No results */}
                    {query.length >= 2 && results.length === 0 && (
                        <div className="p-6 text-center text-gray-500">
                            <SearchIcon className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                            <p>&quot;{query}&quot; için sonuç bulunamadı</p>
                            <p className="text-sm">Farklı anahtar kelimeler deneyin</p>
                        </div>
                    )}

                    {/* Recent & Popular (when no query) */}
                    {!query && (
                        <>
                            {/* Recent Searches */}
                            {recentSearches.length > 0 && (
                                <div className="p-2 border-b">
                                    <p className="px-3 py-1 text-xs font-medium text-gray-500 uppercase flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        Son Aramalar
                                    </p>
                                    {recentSearches.map((search, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handleSearch(search)}
                                            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 rounded-lg flex items-center gap-2"
                                        >
                                            <Clock className="h-4 w-4 text-gray-400" />
                                            <span>{search}</span>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Popular Searches */}
                            <div className="p-2">
                                <p className="px-3 py-1 text-xs font-medium text-gray-500 uppercase flex items-center gap-1">
                                    <TrendingUp className="h-3 w-3" />
                                    Popüler Aramalar
                                </p>
                                <div className="px-3 py-2 flex flex-wrap gap-2">
                                    {popularSearches.map((search, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handleSearch(search)}
                                            className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 transition-colors"
                                        >
                                            {search}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
