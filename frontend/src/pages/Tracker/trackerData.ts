export function getReceivedBarcodes(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem('cs_received_barcodes') || '[]'));
  } catch {
    return new Set();
  }
}

export function toggleReceivedBarcode(barcode: string): Set<string> {
  const current = getReceivedBarcodes();
  if (current.has(barcode)) {
    current.delete(barcode);
  } else {
    current.add(barcode);
  }
  localStorage.setItem('cs_received_barcodes', JSON.stringify(Array.from(current)));
  return current;
}

export function getSubscribedCompetitions(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem('cs_subscribed_competitions') || '[]'));
  } catch {
    return new Set();
  }
}

export function toggleSubscribedCompetition(id: string): Set<string> {
  const current = getSubscribedCompetitions();
  if (current.has(id)) {
    current.delete(id);
  } else {
    current.add(id);
  }
  localStorage.setItem('cs_subscribed_competitions', JSON.stringify(Array.from(current)));
  return current;
}

export function getStoredToken(): string | null {
  return localStorage.getItem('cs_rkf_token');
}

export function getStoredEmail(): string | null {
  return localStorage.getItem('cs_rkf_user_email');
}

export function setStoredAuth(token: string, email: string): void {
  localStorage.setItem('cs_rkf_token', token);
  localStorage.setItem('cs_rkf_user_email', email);
}

export function clearStoredAuth(): void {
  localStorage.removeItem('cs_rkf_token');
  localStorage.removeItem('cs_rkf_user_email');
}
