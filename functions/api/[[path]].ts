export const onRequest: PagesFunction<{ DB: D1Database }> = async ({ request, env, params }) => {
  const url = new URL(request.url);
  const path = params.path as string[];
  const table = path[0];

  if (!table) return new Response('Table not specified', { status: 400 });

  try {
    // 1. GET (SELECT)
    if (request.method === 'GET') {
      const select = url.searchParams.get('select') || '*';
      const order = url.searchParams.get('order');
      const dir = url.searchParams.get('dir') || 'asc';

      let query = `SELECT ${select} FROM ${table}`;
      if (order) {
        query += ` ORDER BY ${order} ${dir.toUpperCase()}`;
      }

      const { results } = await env.DB.prepare(query).all();
      return new Response(JSON.stringify(results), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 2. POST (INSERT)
    if (request.method === 'POST') {
      const data = await request.json() as any[];
      const responses = [];

      for (const item of data) {
        const keys = Object.keys(item);
        const values = Object.values(item);
        const placeholders = keys.map(() => '?').join(', ');
        const query = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`;
        
        const result = await env.DB.prepare(query).bind(...values).run();
        responses.push(result);
      }

      return new Response(JSON.stringify(responses), {
        status: 201,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 3. PATCH (UPDATE)
    if (request.method === 'PATCH') {
      const data = await request.json();
      const searchParams = url.searchParams;
      
      // Simple eq parsing: ?id=eq.123
      let whereClause = '';
      let whereValues: any[] = [];
      
      for (const [key, value] of searchParams.entries()) {
        if (value.startsWith('eq.')) {
          whereClause = `${key} = ?`;
          whereValues.push(value.substring(3));
          break; // Only support one filter for now
        }
      }

      const keys = Object.keys(data);
      const setClause = keys.map(k => `${k} = ?`).join(', ');
      const values = [...Object.values(data), ...whereValues];
      
      const query = `UPDATE ${table} SET ${setClause} WHERE ${whereClause}`;
      const result = await env.DB.prepare(query).bind(...values).run();
      
      return new Response(JSON.stringify(result), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 4. DELETE
    if (request.method === 'DELETE') {
      const searchParams = url.searchParams;
      let whereClause = '';
      let whereValues: any[] = [];
      
      for (const [key, value] of searchParams.entries()) {
        if (value.startsWith('eq.')) {
          whereClause = `${key} = ?`;
          whereValues.push(value.substring(3));
          break;
        }
      }

      const query = `DELETE FROM ${table} WHERE ${whereClause}`;
      const result = await env.DB.prepare(query).bind(...whereValues).run();
      
      return new Response(JSON.stringify(result), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response('Method not allowed', { status: 405 });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
