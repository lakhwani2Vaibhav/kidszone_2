import React, { useState, useEffect, useRef } from 'react';
import { Search, User, GraduationCap, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Student, Teacher } from '../types';

interface SearchResult {
  type: 'student' | 'teacher';
  item: Student | Teacher;
  matchField: string;
}

interface GlobalSearchProps {
  onNavigate: (type: 'student' | 'teacher', item: Student | Teacher) => void;
}

const GlobalSearch: React.FC<GlobalSearchProps> = ({ onNavigate }) => {
  const { state } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Search function
  const performSearch = (term: string) => {
    if (!term.trim()) {
      setResults([]);
      return;
    }

    const searchResults: SearchResult[] = [];
    const lowerTerm = term.toLowerCase();

    // Search students
    state.students.forEach(student => {
      const matches = [];
      
      if (student.name.toLowerCase().includes(lowerTerm)) {
        matches.push('name');
      }
      if (student.rollNumber.toLowerCase().includes(lowerTerm)) {
        matches.push('roll number');
      }
      if (student.grade.toLowerCase().includes(lowerTerm)) {
        matches.push('grade');
      }
      if (student.parentEmail.toLowerCase().includes(lowerTerm)) {
        matches.push('parent email');
      }

      if (matches.length > 0) {
        searchResults.push({
          type: 'student',
          item: student,
          matchField: matches[0]
        });
      }
    });

    // Search teachers
    state.teachers.forEach(teacher => {
      const matches = [];
      
      if (teacher.name.toLowerCase().includes(lowerTerm)) {
        matches.push('name');
      }
      if (teacher.email.toLowerCase().includes(lowerTerm)) {
        matches.push('email');
      }
      if (teacher.fatherName.toLowerCase().includes(lowerTerm)) {
        matches.push('father name');
      }
      if (teacher.mobileNumber.includes(term)) {
        matches.push('mobile');
      }

      if (matches.length > 0) {
        searchResults.push({
          type: 'teacher',
          item: teacher,
          matchField: matches[0]
        });
      }
    });

    // Sort results: exact matches first, then partial matches
    searchResults.sort((a, b) => {
      const aExact = a.item.name.toLowerCase() === lowerTerm || 
                    (a.type === 'student' && (a.item as Student).rollNumber.toLowerCase() === lowerTerm);
      const bExact = b.item.name.toLowerCase() === lowerTerm || 
                    (b.type === 'student' && (b.item as Student).rollNumber.toLowerCase() === lowerTerm);
      
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
      return 0;
    });

    setResults(searchResults.slice(0, 8)); // Limit to 8 results
  };

  // Handle search input change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch(searchTerm);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, state.students, state.teachers]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < results.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < results.length) {
          const result = results[selectedIndex];
          handleResultClick(result);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  // Handle result click
  const handleResultClick = (result: SearchResult) => {
    onNavigate(result.type, result.item);
    setSearchTerm('');
    setResults([]);
    setIsOpen(false);
    setSelectedIndex(-1);
    inputRef.current?.blur();
  };

  // Handle input focus
  const handleFocus = () => {
    setIsOpen(true);
    if (searchTerm.trim()) {
      performSearch(searchTerm);
    }
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Clear search
  const clearSearch = () => {
    setSearchTerm('');
    setResults([]);
    setIsOpen(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  const highlightMatch = (text: string, searchTerm: string) => {
    if (!searchTerm.trim()) return text;
    
    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 text-yellow-900 px-1 rounded">
          {part}
        </mark>
      ) : part
    );
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-lg">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search students by name or roll number"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          className="w-full pl-10 pr-10 py-2.5 bg-gray-100 rounded-lg text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200"
        />
        {searchTerm && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && (searchTerm.trim() || results.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-h-[500px] overflow-hidden">
          {results.length > 0 ? (
            <>
              <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                <p className="text-xs text-gray-600 font-medium">
                  {results.length} result{results.length !== 1 ? 's' : ''} found
                </p>
              </div>
              <div className="max-h-[400px] overflow-y-auto">
                {results.map((result, index) => (
                  <button
                    key={`${result.type}-${result.item.id}`}
                    onClick={() => handleResultClick(result)}
                    className={`w-full px-4 py-4 text-left hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-b-0 ${
                      index === selectedIndex ? 'bg-blue-50 border-r-4 border-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        result.type === 'student' ? 'bg-blue-100' : 'bg-green-100'
                      }`}>
                        {result.type === 'student' ? (
                          <User className="w-5 h-5 text-blue-600" />
                        ) : (
                          <GraduationCap className="w-5 h-5 text-green-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-1">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {highlightMatch(result.item.name, searchTerm)}
                          </p>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full flex-shrink-0 ${
                            result.type === 'student' 
                              ? 'bg-blue-100 text-blue-700' 
                              : 'bg-green-100 text-green-700'
                          }`}>
                            {result.type === 'student' ? 'Student' : 'Teacher'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 mb-1">
                          {result.type === 'student' ? (
                            <>
                              <p className="text-xs text-gray-600">
                                Roll: <span className="font-medium">{highlightMatch((result.item as Student).rollNumber, searchTerm)}</span>
                              </p>
                              <p className="text-xs text-gray-600">
                                Grade: <span className="font-medium">{(result.item as Student).grade}</span>
                              </p>
                            </>
                          ) : (
                            <>
                              <p className="text-xs text-gray-600 truncate">
                                {highlightMatch((result.item as Teacher).email, searchTerm)}
                              </p>
                              <p className="text-xs text-gray-600">
                                Age: <span className="font-medium">{(result.item as Teacher).age}</span>
                              </p>
                            </>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">
                          Matched by: <span className="font-medium text-gray-600">{result.matchField}</span>
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </>
          ) : searchTerm.trim() ? (
            <div className="px-6 py-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-sm font-medium text-gray-700 mb-2">No results found</p>
              <p className="text-xs text-gray-500">
                Try searching by name, roll number, or email
              </p>
            </div>
          ) : (
            <div className="px-6 py-8 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-blue-600" />
              </div>
              <p className="text-sm font-semibold text-gray-800 mb-2">Quick Search</p>
              <div className="space-y-1">
                <p className="text-xs text-gray-600">
                  🎓 Search students by name, roll number, or grade
                </p>
                <p className="text-xs text-gray-600">
                  👨‍🏫 Search teachers by name, email, or mobile
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GlobalSearch;