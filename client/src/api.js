const BASE_URL = '/api';

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.message || `Request failed: ${res.status}`);
  }
  return res.json();
}

function toQuery(params) {
  const filtered = Object.entries(params).filter(
    ([, v]) => v !== undefined && v !== null && v !== ''
  );
  if (filtered.length === 0) return '';
  return '?' + new URLSearchParams(filtered).toString();
}

export function getVenues(params = {}) {
  return request(`/venues${toQuery(params)}`);
}

export function getVenue(id) {
  return request(`/venues/${id}`);
}

export function getEvents(params = {}) {
  return request(`/events${toQuery(params)}`);
}

export function getEvent(id) {
  return request(`/events/${id}`);
}

export function getAccommodations(params = {}) {
  return request(`/accommodations${toQuery(params)}`);
}

export function getAccommodation(id) {
  return request(`/accommodations/${id}`);
}

export function bookTicket({ ticket_id, quantity, user_email }) {
  return request('/bookings/tickets', {
    method: 'POST',
    body: JSON.stringify({ ticket_id, quantity, user_email }),
  });
}

export function bookAccommodation({ accommodation_id, check_in, check_out, user_email }) {
  return request('/bookings/accommodations', {
    method: 'POST',
    body: JSON.stringify({ accommodation_id, check_in, check_out, user_email }),
  });
}

export function getBookings(email) {
  return request(`/bookings/${encodeURIComponent(email)}`);
}

export function getAiStatus() {
  return request('/ai/status');
}

export function chatWithAssistant(message, history = []) {
  return request('/ai/chat', {
    method: 'POST',
    body: JSON.stringify({ message, history }),
  });
}
