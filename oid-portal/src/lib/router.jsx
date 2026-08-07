import { Children, createContext, useContext, useEffect, useMemo, useState } from 'react';

const RouterContext = createContext(null);
const ParamsContext = createContext({});

function matchPath(pattern, pathname) {
  const patternParts = pattern.split('/').filter(Boolean);
  const pathParts = pathname.split('/').filter(Boolean);

  if (patternParts.length !== pathParts.length) {
    return null;
  }

  const params = {};
  for (let index = 0; index < patternParts.length; index += 1) {
    const patternPart = patternParts[index];
    const pathPart = pathParts[index];

    if (patternPart.startsWith(':')) {
      try {
        params[patternPart.slice(1)] = decodeURIComponent(pathPart);
      } catch {
        return null;
      }
    } else if (patternPart !== pathPart) {
      return null;
    }
  }

  return params;
}

export function BrowserRouter({ children }) {
  const [pathname, setPathname] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => setPathname(window.location.pathname);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const value = useMemo(() => ({
    pathname,
    navigate(to) {
      if (typeof to === 'number') {
        window.history.go(to);
        return;
      }

      const destination = new URL(to, window.location.href);
      if (destination.origin !== window.location.origin) {
        throw new Error('Navigation is limited to the current origin');
      }

      window.history.pushState({}, '', `${destination.pathname}${destination.search}${destination.hash}`);
      setPathname(destination.pathname);
    },
  }), [pathname]);

  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
}

export function Routes({ children }) {
  const { pathname } = useContext(RouterContext);

  for (const child of Children.toArray(children)) {
    const params = matchPath(child.props.path, pathname);
    if (params) {
      return <ParamsContext.Provider value={params}>{child.props.element}</ParamsContext.Provider>;
    }
  }

  return null;
}

export function Route() {
  return null;
}

export function Link({ to, onClick, children, ...props }) {
  const { navigate } = useContext(RouterContext);

  const handleClick = (event) => {
    onClick?.(event);
    if (
      event.defaultPrevented
      || event.button !== 0
      || event.metaKey
      || event.ctrlKey
      || event.shiftKey
      || event.altKey
    ) {
      return;
    }

    event.preventDefault();
    navigate(to);
  };

  return <a href={to} onClick={handleClick} {...props}>{children}</a>;
}

export function useLocation() {
  const { pathname } = useContext(RouterContext);
  return { pathname };
}

export function useNavigate() {
  return useContext(RouterContext).navigate;
}

export function useParams() {
  return useContext(ParamsContext);
}
