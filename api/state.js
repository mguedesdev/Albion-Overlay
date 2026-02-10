// API simples para armazenar e recuperar o estado global do overlay
// usando Upstash Redis (ou Vercel KV migrado para Upstash).
//
// Espera que as variáveis de ambiente UPSTASH_REDIS_REST_URL e
// UPSTASH_REDIS_REST_TOKEN estejam configuradas no projeto da Vercel.

const KEY = 'albion_overlay_state';

module.exports = async (req, res) => {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    res.statusCode = 500;
    res.json({ error: 'Redis não configurado. Defina UPSTASH_REDIS_REST_URL e UPSTASH_REDIS_REST_TOKEN.' });
    return;
  }

  // GET -> retorna o estado atual salvo
  if (req.method === 'GET') {
    try {
      const response = await fetch(`${url}/get/${KEY}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      const raw = data.result;

      if (!raw) {
        res.statusCode = 200;
        res.json(null);
        return;
      }

      const parsed = JSON.parse(raw);
      res.statusCode = 200;
      res.json(parsed);
    } catch (err) {
      console.error('Erro ao buscar estado no Redis', err);
      res.statusCode = 500;
      res.json({ error: 'Erro ao buscar estado no backend.' });
    }
    return;
  }

  // POST -> salva o estado recebido no corpo da requisição
  if (req.method === 'POST') {
    try {
      let body = req.body;

      // Em alguns runtimes o body pode não estar parseado ainda
      if (!body || typeof body !== 'object') {
        const rawBody = await new Promise((resolve, reject) => {
          let data = '';
          req.on('data', chunk => {
            data += chunk;
          });
          req.on('end', () => resolve(data || '{}'));
          req.on('error', reject);
        });

        body = JSON.parse(rawBody);
      }

      const value = encodeURIComponent(JSON.stringify(body));

      const response = await fetch(`${url}/set/${KEY}/${value}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      res.statusCode = 200;
      res.json({ ok: true, result: data.result });
    } catch (err) {
      console.error('Erro ao salvar estado no Redis', err);
      res.statusCode = 500;
      res.json({ error: 'Erro ao salvar estado no backend.' });
    }
    return;
  }

  // Métodos não permitidos
  res.setHeader('Allow', ['GET', 'POST']);
  res.statusCode = 405;
  res.end('Method Not Allowed');
};

