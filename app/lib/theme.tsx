'use client';

import { createContext, useContext, useCallback, useSyncExternalStore, type ReactNode } from 'react';

type Theme = 'light' | 'dark';

/* ==================================================================
 *  Tema claro / oscuro.
 *
 *  El atributo data-theme del <html> es la única fuente de verdad: el
 *  script en línea del layout ya lo pone antes de pintar nada, así que
 *  no hay parpadeo. React solo se suscribe a los cambios de ese
 *  atributo en vez de copiarlo a su propio estado dentro de un efecto,
 *  que provocaba un render en cascada en cada carga.
 * ================================================================== */

const ThemeContext = createContext<{ theme: Theme; toggleTheme: () => void }>({
  theme: 'dark',
  toggleTheme: () => {},
});

function subscribe(onChange: () => void): () => void {
  if (typeof MutationObserver === 'undefined') return () => {};
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  return () => observer.disconnect();
}

function getSnapshot(): Theme {
  return document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
}

/** En el servidor no hay DOM: se asume oscuro, igual que el HTML inicial. */
function getServerSnapshot(): Theme {
  return 'dark';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggleTheme = useCallback(() => {
    const next: Theme = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', next);
    try {
      localStorage.setItem('theme', next);
    } catch {
      // modo incógnito o almacenamiento bloqueado: el tema dura la sesión
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
