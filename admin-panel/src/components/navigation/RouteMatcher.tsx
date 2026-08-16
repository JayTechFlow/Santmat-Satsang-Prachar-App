interface RouteMatchOptions {
  exact?: boolean;
  prefix?: boolean;
  dynamic?: boolean;
}

interface RoutePattern {
  pattern: RegExp;
  options: RouteMatchOptions;
  paramNames: string[];
}

export class RouteMatcher {
  private routes: Map<string, RoutePattern> = new Map();

  constructor(routes: string[] = []) {
    for (const route of routes) {
      this.addRoute(route);
    }
  }

  addRoute(path: string, options: RouteMatchOptions = {}): this {
    const { paramNames, regex } = this.compileRoute(path, options);
    this.routes.set(path, { pattern: regex, options, paramNames });
    return this;
  }

  private compileRoute(path: string, options: RouteMatchOptions): { regex: RegExp; paramNames: string[] } {
    const paramNames: string[] = [];
    let pattern = '^';

    if (options.dynamic) {
      const segments = path.split('/');
      for (let i = 0; i < segments.length; i++) {
        const segment = segments[i];
        if (!segment) continue;

        if (segment === '*') {
          pattern += '(?:/(.*))?';
        } else if (segment.startsWith(':')) {
          const paramName = segment.slice(1);
          paramNames.push(paramName);
          pattern += '/([^/]+)';
        } else {
          pattern += `/${this.escapeRegExp(segment)}`;
        }
      }
      pattern += '$';
    } else if (options.exact) {
      pattern += this.escapeRegExp(path) + '$';
    } else if (options.prefix) {
      pattern += this.escapeRegExp(path);
      if (!path.endsWith('/')) {
        pattern += '(?:/.*)?';
      }
      pattern += '$';
    } else {
      pattern += this.escapeRegExp(path) + '$';
    }

    return { regex: new RegExp(pattern), paramNames };
  }

  private escapeRegExp(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  match(pathname: string): { matched: boolean; route?: string; params?: Record<string, string> } {
    for (const [routePath, { pattern, paramNames }] of this.routes) {
      const match = pathname.match(pattern);
      if (match) {
        const params: Record<string, string> = {};
        for (let i = 0; i < paramNames.length; i++) {
          params[paramNames[i]] = match[i + 1];
        }
        return { matched: true, route: routePath, params: Object.keys(params).length > 0 ? params : undefined };
      }
    }
    return { matched: false };
  }

  matchRoute(
    pathname: string,
    routePath: string,
    options: RouteMatchOptions = {}
  ): { matched: boolean; params?: Record<string, string> } {
    const { regex, paramNames } = this.compileRoute(routePath, options);
    const match = pathname.match(regex);
    if (match) {
      const params: Record<string, string> = {};
      for (let i = 0; i < paramNames.length; i++) {
        params[paramNames[i]] = match[i + 1];
      }
      return { matched: true, params: Object.keys(params).length > 0 ? params : undefined };
    }
    return { matched: false };
  }

  matchAll(pathname: string): Array<{ route: string; params?: Record<string, string> }> {
    const matches: Array<{ route: string; params?: Record<string, string> }> = [];
    for (const [routePath, { pattern, paramNames }] of this.routes) {
      const match = pathname.match(pattern);
      if (match) {
        const params: Record<string, string> = {};
        for (let i = 0; i < paramNames.length; i++) {
          params[paramNames[i]] = match[i + 1];
        }
        matches.push({ route: routePath, params: Object.keys(params).length > 0 ? params : undefined });
      }
    }
    return matches;
  }
}

export function createRouteMatcher(routes: string[]): RouteMatcher {
  return new RouteMatcher(routes);
}