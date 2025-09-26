exports.handler = async (event) => {
  const { repo, resource, state, per_page } = event.queryStringParameters || {};
  if (!repo || !resource) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing repo or resource' }) };
  }

  const base = `https://api.github.com/repos/${repo}`;
  let url = base;
  switch (resource) {
    case 'commits':
      url += `/commits?per_page=${encodeURIComponent(per_page || '5')}`;
      break;
    case 'issues':
      url += `/issues?state=${encodeURIComponent(state || 'open')}&per_page=${encodeURIComponent(per_page || '5')}`;
      break;
    case 'pulls':
      url += `/pulls?state=${encodeURIComponent(state || 'open')}&per_page=${encodeURIComponent(per_page || '5')}`;
      break;
    default:
      return { statusCode: 400, body: JSON.stringify({ error: 'Unsupported resource' }) };
  }

  try {
    const resp = await fetch(url, {
      headers: {
        'User-Agent': 'freethecode-site',
        'Accept': 'application/vnd.github+json'
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


