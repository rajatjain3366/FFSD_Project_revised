/**
 * Se7enSquare — Live API Client
 * Replaces all window.NexusCRUD / window.NexusData mock calls.
 * All requests go to the NestJS backend at http://localhost:3000/api
 */

const API_BASE = 'http://localhost:3000/api';

// ── Role resolution ──────────────────────────────────────────────────────────
// Read role from localStorage session; fall back to 'user'.
function getRole() {
    try {
        const user = JSON.parse(localStorage.getItem('nexus_user') || '{}');
        return user.role || 'user';
    } catch {
        return 'user';
    }
}

// ── Core fetch wrapper ───────────────────────────────────────────────────────
async function apiFetch(path, options = {}) {
    const role = getRole();
    const url = `${API_BASE}${path}`;
    const headers = {
        'Content-Type': 'application/json',
        'x-role': role,
        ...(options.headers || {})
    };

    try {
        const res = await fetch(url, { ...options, headers });

        if (!res.ok) {
            let errBody = {};
            try { errBody = await res.json(); } catch (_) {}
            const msg = errBody.message || `HTTP ${res.status}`;
            console.error(`[API] ${options.method || 'GET'} ${path} → ${res.status}`, msg);
            throw new Error(Array.isArray(msg) ? msg.join(', ') : msg);
        }

        // 204 No Content
        if (res.status === 204) return null;
        return await res.json();
    } catch (err) {
        if (err.name === 'TypeError' && err.message.includes('fetch')) {
            console.warn('[API] Backend unreachable — is NestJS running on port 3000?');
            throw new Error('Backend unreachable. Please start the NestJS server.');
        }
        throw err;
    }
}

// ── Convenience methods ──────────────────────────────────────────────────────
const API = {
    get:    (path)         => apiFetch(path, { method: 'GET' }),
    post:   (path, body)   => apiFetch(path, { method: 'POST',   body: JSON.stringify(body) }),
    patch:  (path, body)   => apiFetch(path, { method: 'PATCH',  body: JSON.stringify(body) }),
    delete: (path)         => apiFetch(path, { method: 'DELETE' }),

    // ── Domain helpers ───────────────────────────────────────────────────────
    communities: {
        getAll:  ()          => API.get('/communities'),
        getOne:  (id)        => API.get(`/communities/${id}`),
        create:  (body)      => API.post('/communities', body),
        update:  (id, body)  => API.patch(`/communities/${id}`, body),
        delete:  (id)        => API.delete(`/communities/${id}`),
    },
    users: {
        getAll:  ()          => API.get('/users'),
        getOne:  (id)        => API.get(`/users/${id}`),
        create:  (body)      => API.post('/users', body),
        update:  (id, body)  => API.patch(`/users/${id}`, body),
        delete:  (id)        => API.delete(`/users/${id}`),
    },
    events: {
        getAll:  ()          => API.get('/events'),
        getOne:  (id)        => API.get(`/events/${id}`),
        create:  (body)      => API.post('/events', body),
        update:  (id, body)  => API.patch(`/events/${id}`, body),
        delete:  (id)        => API.delete(`/events/${id}`),
    },
    posts: {
        getAll:  ()          => API.get('/posts'),
        getOne:  (id)        => API.get(`/posts/${id}`),
        create:  (body)      => API.post('/posts', body),
        update:  (id, body)  => API.patch(`/posts/${id}`, body),
        delete:  (id)        => API.delete(`/posts/${id}`),
    },
    reports: {
        getAll:  ()          => API.get('/reports'),
        getOne:  (id)        => API.get(`/reports/${id}`),
        create:  (body)      => API.post('/reports', body),
        updateStatus: (id, status) => API.patch(`/reports/${id}/status`, { status }),
        delete:  (id)        => API.delete(`/reports/${id}`),
    },
    memberships: {
        getAll:  ()          => API.get('/memberships'),
        create:  (body)      => API.post('/memberships', body),
        delete:  (id)        => API.delete(`/memberships/${id}`),
    },
    dashboard: {
        stats: ()            => API.get('/dashboard/stats'),
    },
};

window.API = API;
console.log('%c[Se7enSquare] %cLive API client ready → http://localhost:3000/api',
    'color: #5B6EF5; font-weight: bold;', 'color: #10B981;');
