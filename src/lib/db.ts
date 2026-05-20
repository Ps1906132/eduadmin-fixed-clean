/**
 * EduAdmin Database Client (Cloudflare D1 Bridge)
 * This replaces the Supabase client and routes requests through Cloudflare Pages Functions.
 */

const API_BASE = '/api';

export const db = {
  /**
   * Generic select from a table
   */
  from: (table: string) => {
    let selectColumns = '*';
    let orderCol: string | null = null;
    let orderAsc = true;
    let limitVal: number | null = null;
    let filters: Record<string, string> = {};

    const buildUrl = (table: string, columns: string, filters: Record<string, any> = {}, order?: { column: string, ascending: boolean }, limit?: number | null) => {
      const params = new URLSearchParams();
      params.set('select', columns);
      
      if (order) {
        params.set('order', order.column);
        params.set('dir', order.ascending ? 'asc' : 'desc');
      }

      if (limit) {
        params.set('limit', String(limit));
      }

      // Safe filter processing
      Object.entries(filters).forEach(([key, val]) => {
        // Only allow alphanumeric keys to prevent parameter pollution/injection
        if (/^[a-zA-Z0-9_]+$/.test(key)) {
          params.set(key, String(val));
        }
      });

      return `${API_BASE}/${table}?${params.toString()}`;
    };

    const execute = async () => {
      try {
        const url = buildUrl(table, selectColumns, filters, orderCol ? { column: orderCol, ascending: orderAsc } : undefined, limitVal);
        const token = typeof window !== 'undefined' ? localStorage.getItem('eduadmin_token') : null;
        const headers: Record<string, string> = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        const response = await fetch(url, { headers });
        
        const contentType = response.headers.get('content-type');
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`DB Error (${response.status}): ${errorText.substring(0, 100)}`);
        }

        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Backend proxy belum jalan atau route /api tidak ditemukan (Menerima HTML bukan JSON).');
        }

        const data = await response.json();
        return { data, error: null };
      } catch (error: any) {
        console.error(`DB Select Error (${table}):`, error);
        return { data: null, error: error.message || 'Unknown database error' };
      }
    };

    interface DbChain extends Promise<any> {
      order(column: string, options?: { ascending?: boolean }): DbChain;
      eq(column: string, value: any): DbChain;
      limit(n: number): DbChain;
      single(): Promise<any>;
    }

    const wrap = (promise: Promise<any>) => ({
      then: (onFulfilled?: any, onRejected?: any) => promise.then(onFulfilled, onRejected),
      catch: (onRejected?: any) => promise.catch(onRejected),
      finally: (onFinally?: any) => promise.finally(onFinally),
      single: () => wrap(promise.then(res => ({
        data: res.data && res.data.length > 0 ? res.data[0] : null,
        error: res.error
      })))
    });

    return {
      select: (columns: string = '*') => {
        selectColumns = columns;
        const chain = {
          order: (column: string, { ascending = true } = {}) => {
            orderCol = column;
            orderAsc = ascending;
            return chain;
          },
          eq: (column: string, value: any) => {
            filters[column] = `eq.${value}`;
            return chain;
          },
          limit: (n: number) => {
            limitVal = n;
            return chain;
          },
          // Lazy execution
          then: (onFulfilled?: any, onRejected?: any) => execute().then(onFulfilled, onRejected),
          catch: (onRejected?: any) => execute().catch(onRejected),
          finally: (onFinally?: any) => execute().finally(onFinally),
          single: () => {
            const singleExecute = async () => {
              const res = await execute();
              return {
                data: res.data && res.data.length > 0 ? res.data[0] : null,
                error: res.error
              };
            };
            return {
              then: (onFulfilled?: any, onRejected?: any) => singleExecute().then(onFulfilled, onRejected),
              catch: (onRejected?: any) => singleExecute().catch(onRejected),
              finally: (onFinally?: any) => singleExecute().finally(onFinally),
            };
          }
        };
        return chain as unknown as DbChain;
      },

      /**
       * Insert data into a table
       */
      insert: (values: any | any[]) => {
        const payload = Array.isArray(values) ? values : [values];
        const token = typeof window !== 'undefined' ? localStorage.getItem('eduadmin_token') : null;
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        const promise = fetch(`${API_BASE}/${table}`, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload)
        }).then(async res => {
          if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
          return { data: await res.json(), error: null };
        }).catch(error => ({ data: null, error }));

        return {
          select: () => wrap(promise),
          ...wrap(promise)
        };
      },

      /**
       * Update data in a table
       */
      update: (values: any) => ({
        eq: (column: string, value: any) => {
          const token = typeof window !== 'undefined' ? localStorage.getItem('eduadmin_token') : null;
          const headers: Record<string, string> = { 'Content-Type': 'application/json' };
          if (token) {
            headers['Authorization'] = `Bearer ${token}`;
          }
          return wrap(
            fetch(`${API_BASE}/${table}?${column}=eq.${value}`, {
              method: 'PATCH',
              headers,
              body: JSON.stringify(values)
            }).then(async res => {
              if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
              return { data: await res.json(), error: null };
            }).catch(error => ({ data: null, error }))
          );
        }
      }),

      /**
       * Delete from a table
       */
      delete: () => ({
        eq: (column: string, value: any) => {
          const token = typeof window !== 'undefined' ? localStorage.getItem('eduadmin_token') : null;
          const headers: Record<string, string> = {};
          if (token) {
            headers['Authorization'] = `Bearer ${token}`;
          }
          return wrap(
            fetch(`${API_BASE}/${table}?${column}=eq.${value}`, {
              method: 'DELETE',
              headers
            }).then(async res => {
              if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
              return { data: await res.json(), error: null };
            }).catch(error => ({ data: null, error }))
          );
        }
      })
    };
  }
};

/**
 * Auth Helper (Mocking Cloudflare Access or custom JWT auth)
 */
export const auth = {
  getUser: async () => {
    // In a real app, this would check a session cookie or Cloudflare Access header
    const savedUser = localStorage.getItem('eduadmin_user');
    return savedUser ? { data: { user: JSON.parse(savedUser) }, error: null } : { data: { user: null }, error: null };
  },
  signOut: async () => {
    localStorage.removeItem('eduadmin_user');
    localStorage.removeItem('eduadmin_token');
    return { error: null };
  }
};

/**
 * Migration Helpers
 */
export const isConfigured = () => true; // Always true for D1 once deployed
export const getConfigError = () => null;
