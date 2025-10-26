// lib/utils.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Utility for merging Tailwind classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format currency
export function formatCurrency(amount: number, currency = "USD"): string {
  const symbols: Record<string, string> = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    JPY: "¥",
    INR: "₹"
  };
  
  const symbol = symbols[currency] || "$";
  return `${symbol}${amount.toLocaleString()}`;
}

// Format date
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
}

// Calculate date range
export function calculateDateRange(startDate: string, days: number) {
  const start = new Date(startDate);
  const end = new Date(start);
  end.setDate(end.getDate() + days - 1);
  
  return {
    start: formatDate(start),
    end: formatDate(end),
  };
}

// Format duration
export function formatDuration(days: number): string {
  if (days === 1) return "1 day";
  if (days < 7) return `${days} days`;
  if (days === 7) return "1 week";
  if (days < 14) return `${days} days`;
  if (days === 14) return "2 weeks";
  
  const weeks = Math.floor(days / 7);
  const remainingDays = days % 7;
  
  if (remainingDays === 0) return `${weeks} weeks`;
  return `${weeks} weeks ${remainingDays} days`;
}

// Truncate text
export function truncateText(text: string, maxLength = 100): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "...";
}

// Get budget label
export function getBudgetLabel(budget: string): string {
  const labels: Record<string, string> = {
    low: "Budget",
    moderate: "Moderate",
    high: "Premium",
    luxury: "Luxury"
  };
  return labels[budget.toLowerCase()] || budget;
}

// Get budget color
export function getBudgetColor(budget: string): string {
  const colors: Record<string, string> = {
    low: "bg-green-100 text-green-800",
    moderate: "bg-blue-100 text-blue-800",
    high: "bg-purple-100 text-purple-800",
    luxury: "bg-amber-100 text-amber-800"
  };
  return colors[budget.toLowerCase()] || "bg-gray-100 text-gray-800";
}

// Get category icon/emoji
export function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    adventure: "🏔️",
    culture: "🏛️",
    beach: "🏖️",
    mountains: "⛰️",
    city: "🏙️",
    food: "🍽️",
    nature: "🌲",
    romantic: "💑",
    hiking: "🥾",
    luxury: "✨"
  };
  return icons[category.toLowerCase()] || "🌍";
}

// Parse SSE stream
export async function parseSSEStream(
  response: Response,
  onChunk: (chunk: any) => void,
  onComplete?: () => void,
  onError?: (error: string) => void
) {
  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  if (!reader) {
    onError?.("No reader available");
    return;
  }

  try {
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        onComplete?.();
        break;
      }

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            onChunk(data);
          } catch (e) {
            console.error('Error parsing SSE data:', e);
          }
        }
      }
    }
  } catch (error) {
    onError?.(error instanceof Error ? error.message : 'Stream error');
  }
}

// Debounce function
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Local storage helpers
export const storage = {
  get: <T>(key: string, defaultValue: T): T => {
    if (typeof window === 'undefined') return defaultValue;
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },
  
  set: <T>(key: string, value: T): void => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  },
  
  remove: (key: string): void => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  }
};