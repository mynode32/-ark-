import { config } from '../../config.js';

let cachedToken = null;

function ensureConfigured() {
  const { clientId, clientSecret, companyId, refreshToken } = config.parasut;
  if (!clientId || !clientSecret || !companyId || !refreshToken) {
    throw Object.assign(new Error('Paraşüt fatura entegrasyonu henüz yapılandırılmadı'), { status: 503 });
  }
}

async function getAccessToken() {
  ensureConfigured();
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
    return cachedToken.accessToken;
  }
  const res = await fetch('https://api.parasut.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: config.parasut.clientId,
      client_secret: config.parasut.clientSecret,
      refresh_token: config.parasut.refreshToken,
    }).toString(),
  });
  if (!res.ok) {
    throw new Error(`Paraşüt token yenilenemedi: ${res.status}`);
  }
  const data = await res.json();
  if (!data.access_token) {
    throw new Error('Paraşüt access token yanıtı geçersiz');
  }
  cachedToken = {
    accessToken: data.access_token,
    expiresAt: Date.now() + Number(data.expires_in || 7200) * 1000,
  };
  return cachedToken.accessToken;
}

async function parasutFetch(path, options = {}) {
  const token = await getAccessToken();
  const res = await fetch(`https://api.parasut.com/v4/${config.parasut.companyId}${path}`, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/vnd.api+json',
      Accept: 'application/vnd.api+json',
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Paraşüt API hatası (${res.status}): ${body.slice(0, 500)}`);
  }
  return res.json();
}

async function findOrCreateContact(store) {
  const search = await parasutFetch(`/contacts?filter[email]=${encodeURIComponent(store.email)}`);
  if (search.data?.length) {
    return search.data[0].id;
  }
  const created = await parasutFetch('/contacts', {
    method: 'POST',
    body: JSON.stringify({
      data: {
        type: 'contacts',
        attributes: {
          name: store.invoiceTitle || store.name,
          email: store.email,
          tax_number: store.taxId || null,
          contact_type: store.taxId ? 'company' : 'person',
        },
      },
    }),
  });
  return created.data.id;
}

/**
 * Paraşüt'te satış faturası taslağı oluşturur. Taslağın e-Fatura/e-Arşiv olarak
 * resmileştirilmesi, mükellef tipi ve Paraşüt hesap ayarları doğrulandıktan sonra
 * ayrı endpointlerle tamamlanmalıdır.
 */
export async function createInvoice({ store, amount, planType }) {
  const contactId = await findOrCreateContact(store);
  const today = new Date().toISOString().slice(0, 10);
  const result = await parasutFetch('/sales_invoices', {
    method: 'POST',
    body: JSON.stringify({
      data: {
        type: 'sales_invoices',
        attributes: {
          item_type: 'invoice',
          description: `Çark ${planType} Plan Aboneliği`,
          issue_date: today,
          due_date: today,
          currency: 'TRL',
        },
        relationships: {
          contact: { data: { id: contactId, type: 'contacts' } },
          details: {
            data: [
              {
                type: 'sales_invoice_details',
                attributes: {
                  quantity: 1,
                  unit_price: Number(amount),
                  vat_rate: 20,
                  description: `Çark ${planType} Plan — Aylık Abonelik`,
                },
              },
            ],
          },
        },
      },
    }),
  });
  return {
    invoiceNumber: result.data?.attributes?.invoice_no || result.data?.id || null,
    invoiceUrl: result.data?.attributes?.pdf_url || null,
  };
}
