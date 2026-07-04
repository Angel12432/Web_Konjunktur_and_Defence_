export function parseCsv(text) {
  const rows = [];
  let row = [];
  let value = '';
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '"' && quoted && next === '"') {
      value += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === ',' && !quoted) {
      row.push(value.trim());
      value = '';
    } else if ((char === '\n' || char === '\r') && !quoted) {
      if (value || row.length) {
        row.push(value.trim());
        rows.push(row);
        row = [];
        value = '';
      }
      if (char === '\r' && next === '\n') index += 1;
    } else {
      value += char;
    }
  }

  if (value || row.length) {
    row.push(value.trim());
    rows.push(row);
  }

  const [headers, ...body] = rows;
  if (!headers) return [];

  return body.map((cells) => Object.fromEntries(
    headers.map((header, index) => [header, cells[index] ?? '']),
  ));
}

export function toNumber(value) {
  const raw = String(value ?? '').trim().replace(/\s/g, '');
  if (!raw) return null;

  const normalized = raw.includes(',')
    ? raw.replace(/\./g, '').replace(',', '.')
    : raw;

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

export async function loadCsv(path, { fallback = null, label = path } = {}) {
  try {
    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`);
    }
    return parseCsv(await response.text());
  } catch (error) {
    if (fallback !== null) {
      console.warn(`Konnte ${label} nicht laden. Fallback-Daten werden genutzt.`, error);
      return fallback;
    }
    throw new Error(`Konnte ${label} nicht laden: ${error.message}`);
  }
}

export function publicPath(path) {
  return `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`;
}
