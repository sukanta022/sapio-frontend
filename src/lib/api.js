
const configuredBase = (
  import.meta.env.VITE_API_BASE_URL || "/api/v1"
).trim();

const BASE = configuredBase.replace(/\/+$/, "");

if (import.meta.env.PROD && BASE.startsWith("/")) {
  console.warn(
    "VITE_API_BASE_URL is relative in production. " +
    "Set it to the Render FastAPI URL ending in /api/v1."
  );
}


const TOKEN_KEY = "sapio_access_token";

export const getToken = () =>
  sessionStorage.getItem(TOKEN_KEY);

export const storeToken = (token) =>
  sessionStorage.setItem(TOKEN_KEY, token);

export const clearToken = () =>
  sessionStorage.removeItem(TOKEN_KEY);

// ================================
// API Error Handling
// ================================

export class ApiError extends Error {
  constructor(status, detail) {
    super(
      typeof detail === "string"
        ? detail
        : JSON.stringify(detail)
    );

    this.name = "ApiError";
    this.status = status;
  }
}

// ================================
// Common API Request Function
// ================================

export async function api(
  path,
  {
    method = "GET",
    body,
    auth = true,
    signal,
  } = {}
) {
  const headers = {};

  const token = getToken();

  if (auth && token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const isFormData = body instanceof FormData;
  const isURLSearchParams = body instanceof URLSearchParams;

  if (
    body !== undefined &&
    !isFormData &&
    !isURLSearchParams
  ) {
    headers["Content-Type"] = "application/json";
  }

  if (isURLSearchParams) {
    headers["Content-Type"] =
      "application/x-www-form-urlencoded";
  }

  let response;

  try {
    response = await fetch(`${BASE}${path}`, {
      method,
      headers,
      signal,
      body:
        body === undefined
          ? undefined
          : isFormData || isURLSearchParams
          ? body
          : JSON.stringify(body),
    });
  } catch (error) {
    if (error?.name === "AbortError") {
      throw error;
    }

    throw new ApiError(
      0,
      "Cannot connect to Sapio AI backend. " +
      "Please check your internet connection or try again."
    );
  }

  if (!response.ok) {
    let errorData = {};

    try {
      errorData = await response.json();
    } catch {
      errorData = {};
    }

    throw new ApiError(
      response.status,
      errorData.detail ||
        `Request failed (${response.status})`
    );
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

// ================================
// Backend API Endpoints
// ================================

export const backend = {
  // Authentication

  register: (payload) =>
    api("/auth/register", {
      method: "POST",
      body: payload,
      auth: false,
    }),

  login: (email, password) => {
    const body = new URLSearchParams({
      username: email,
      password,
    });

    return api("/auth/login", {
      method: "POST",
      body,
      auth: false,
    });
  },

  me: () => api("/auth/me"),

  // Document Upload

  upload: (file) => {
    const body = new FormData();
    body.append("file", file);

    return api("/documents/upload", {
      method: "POST",
      body,
    });
  },

  extract: (id) =>
    api(`/documents/${id}/extract`, {
      method: "POST",
    }),

  detect: (id) =>
    api(`/documents/${id}/chapters/detect`, {
      method: "POST",
    }),

  chapters: (id) =>
    api(`/documents/${id}/chapters`),

  // Projects

  options: () => api("/projects/options"),

  createProject: (body) =>
    api("/projects", {
      method: "POST",
      body,
    }),

  projects: () => api("/projects"),

  // Background Jobs

  job: (projectId, job_type) =>
    api(`/projects/${projectId}/jobs`, {
      method: "POST",
      body: {
        job_type,
      },
    }),

  jobStatus: (id) =>
    api(`/jobs/${id}`),

  jobList: (id) =>
    api(`/projects/${id}/jobs`),

  cancel: (id) =>
    api(`/jobs/${id}/cancel`, {
      method: "POST",
    }),

  // AI-generated Script and Audio

  script: (id) =>
    api(`/projects/${id}/script`),

  audio: (id) =>
    api(`/projects/${id}/audio`),

  // Playback

  playback: (id) =>
    api(`/projects/${id}/playback`),

  savePlayback: (id, position_seconds) =>
    api(`/projects/${id}/playback`, {
      method: "PUT",
      body: {
        position_seconds,
      },
    }),

  complete: (id) =>
    api(`/projects/${id}/playback/complete`, {
      method: "POST",
    }),

  history: () =>
    api("/me/listening-history"),

  // Popular Summaries

  popular: () =>
    api("/popular-summaries", {
      auth: false,
    }),

  // Admin

  analytics: () =>
    api("/admin/analytics"),

  users: () =>
    api("/admin/users"),

  adminProjects: () =>
    api("/admin/projects"),

  updateUser: (id, is_active) =>
    api(`/admin/users/${id}/status`, {
      method: "PATCH",
      body: {
        is_active,
      },
    }),

  popularAdmin: () =>
    api("/popular-summaries/admin/all"),

  publish: (id, is_published) =>
    api(`/popular-summaries/${id}/publish`, {
      method: "PATCH",
      body: {
        is_published,
      },
    }),
};

// ================================
// Private Audio Streaming
// ================================

export async function privateAudio(id) {
  const token = getToken();

  if (!token) {
    throw new ApiError(
      401,
      "Please log in to access your audio."
    );
  }

  const response = await fetch(
    `${BASE}/projects/${id}/audio/stream`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new ApiError(
      response.status,
      "Unable to retrieve audio"
    );
  }

  return response.blob();
}

// ================================
// Download Generated Audio
// ================================

export async function downloadAudio(id) {
  const token = getToken();

  if (!token) {
    throw new ApiError(
      401,
      "Please log in to download audio."
    );
  }

  const response = await fetch(
    `${BASE}/projects/${id}/audio/download`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new ApiError(
      response.status,
      "Audio download failed"
    );
  }

  const blob = await response.blob();

  const url = URL.createObjectURL(blob);

  const anchor = document.createElement("a");

  anchor.href = url;

  anchor.download =
    `sapio-project-${id}.` +
    (blob.type.includes("mpeg") ? "mp3" : "wav");

  document.body.appendChild(anchor);

  anchor.click();

  anchor.remove();

  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);
}

// ================================
// Background Job Polling
// ================================

export async function awaitJob(
  id,
  {
    onUpdate,
    signal,
    interval = 2500,
  } = {}
) {
  while (true) {
    if (signal?.aborted) {
      throw new DOMException(
        "Cancelled",
        "AbortError"
      );
    }

    const job = await backend.jobStatus(id);

    onUpdate?.(job);

    if (
      ["completed", "failed", "cancelled"].includes(
        job.status
      )
    ) {
      return job;
    }

    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        signal?.removeEventListener(
          "abort",
          onAbort
        );

        resolve();
      }, interval);

      function onAbort() {
        clearTimeout(timeout);

        reject(
          new DOMException(
            "Cancelled",
            "AbortError"
          )
        );
      }

      signal?.addEventListener(
        "abort",
        onAbort,
        { once: true }
      );
    });
  }
}

// ================================
// Popular Summary Media
// ================================

export const popularMedia = {
  create: (body) =>
    api("/popular-summaries", {
      method: "POST",
      body,
    }),

  update: (id, body) =>
    api(`/popular-summaries/${id}`, {
      method: "PATCH",
      body,
    }),

  upload: (
    id,
    {
      audio,
      cover,
      document,
    }
  ) => {
    const body = new FormData();

    if (audio) {
      body.append("audio", audio);
    }

    if (cover) {
      body.append("cover", cover);
    }

    if (document) {
      body.append("document", document);
    }

    return api(
      `/popular-summaries/${id}/media`,
      {
        method: "POST",
        body,
      }
    );
  },

  coverUrl: (id) =>
    `${BASE}/popular-summaries/${id}/cover`,

  streamUrl: (id) =>
    `${BASE}/popular-summaries/${id}/audio/stream`,
};

// ================================
// Generated Audio for Publishing
// ================================

export async function generatedAudioFile(
  projectId,
  format = "mp3"
) {
  const token = getToken();

  if (!token) {
    throw new ApiError(
      401,
      "Please log in to access generated audio."
    );
  }

  const response = await fetch(
    `${BASE}/projects/${projectId}/audio/download`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new ApiError(
      response.status,
      "Could not retrieve generated audio for publishing"
    );
  }

  const blob = await response.blob();

  if (blob.size > 100 * 1024 * 1024) {
    throw new Error(
      "Generated audio exceeds the 100 MB popular media limit. " +
      "Your personal project audio remains saved."
    );
  }

  return new File(
    [blob],
    `sapio-${projectId}.${format.toLowerCase()}`,
    {
      type:
        blob.type ||
        (
          format.toLowerCase() === "wav"
            ? "audio/wav"
            : "audio/mpeg"
        ),
    }
  );
}
