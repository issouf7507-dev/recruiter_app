import React from "react";

// Configuration des optimisations de performance

export const PERFORMANCE_CONFIG = {
  // Configuration React Query
  queryClient: {
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
    refetchOnWindowFocus: false,
  },

  // Configuration des composants
  components: {
    debounceDelay: 300, // ms
    throttleDelay: 100, // ms
  },

  // Configuration du cache
  cache: {
    maxSize: 100, // nombre maximum d'éléments en cache
    ttl: 30 * 60 * 1000, // 30 minutes
  },

  // Configuration des images
  images: {
    quality: 80,
    format: "webp" as const,
  },
};

// Fonction utilitaire pour le debounce
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

// Fonction utilitaire pour le throttle
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Hook personnalisé pour la mémorisation des valeurs coûteuses
export function useMemoizedValue<T>(
  value: T,
  dependencies: React.DependencyList
): T {
  return React.useMemo(() => value, dependencies);
}

// Configuration des erreurs de performance
export const PERFORMANCE_ERRORS = {
  SLOW_RENDER: "SLOW_RENDER",
  MEMORY_LEAK: "MEMORY_LEAK",
  LARGE_BUNDLE: "LARGE_BUNDLE",
} as const;
