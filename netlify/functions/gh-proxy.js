exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, headers: { Allow: 'GET' }, body: 'Method Not Allowed' };
  }
  const { repo, resource, state, per_page } = event.queryStringParameters || {};
  if (!repo || !resource) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing repo or resource' }) };
  }
  const perPage = Math.min(Math.max(parseInt(per_page || '5', 10) || 5, 1), 100);
  const allowedStates = new Set(['open','closed','all']);
  const safeState = allowedStates.has(state || 'open') ? (state || 'open') : 'open';

  const base = `https://api.github.com/repos/${repo}`;
  let url = base;
  switch (resource) {
    case 'commits':
      url += `/commits?per_page=${perPage}`;
      break;
    case 'issues':
      url += `/issues?state=${safeState}&per_page=${perPage}`;
      break;
    case 'pulls':
      url += `/pulls?state=${safeState}&per_page=${perPage}`;
      break;
    default:
      return { statusCode: 400, body: JSON.stringify({ error: 'Unsupported resource' }) };
  }

  try {
    const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
    const resp = await fetch(url, {
      headers: {
        'User-Agent': 'freethecode-site',
        'Accept': 'application/vnd.github+json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    });
    const text = await resp.text();
    return {
      statusCode: resp.status,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 's-maxage=300, max-age=60'
      },
      body: text
    };
  } catch (e) {
    return { statusCode: 502, body: JSON.stringify({ error: 'Upstream error' }) };
  }
};


