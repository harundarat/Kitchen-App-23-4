const DEFAULT_API_URL = "https://kitchencraft-be.vercel.app/api";

const API_URL = (import.meta.env.VITE_BASE_URL || DEFAULT_API_URL).replace(
  /\/$/,
  "",
);

type RequestBody = BodyInit | object;

interface ApiRequestOptions extends Omit<RequestInit, "body"> {
  body?: RequestBody;
}

interface ErrorPayload {
  error?: string;
  message?: string;
}

export class ApiError extends Error {
  readonly status: number;
  readonly payload: unknown;

  constructor(status: number, payload: unknown) {
    const errorPayload = isErrorPayload(payload) ? payload : undefined;
    super(
      errorPayload?.error || errorPayload?.message || `HTTP error ${status}`,
    );
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

function isErrorPayload(payload: unknown): payload is ErrorPayload {
  return typeof payload === "object" && payload !== null;
}

function isNativeBody(body: RequestBody): body is BodyInit {
  return (
    typeof body === "string" ||
    body instanceof FormData ||
    body instanceof URLSearchParams ||
    body instanceof Blob ||
    body instanceof ArrayBuffer ||
    ArrayBuffer.isView(body) ||
    body instanceof ReadableStream
  );
}

function createRequestSignal(callerSignal?: AbortSignal | null): {
  signal: AbortSignal;
  cleanup: () => void;
} {
  const timeoutSignal = AbortSignal.timeout(15_000);
  if (!callerSignal) return { signal: timeoutSignal, cleanup: () => undefined };

  const controller = new AbortController();
  const abortFromCaller = () => controller.abort(callerSignal.reason);
  const abortFromTimeout = () => controller.abort(timeoutSignal.reason);

  if (callerSignal.aborted) abortFromCaller();
  else callerSignal.addEventListener("abort", abortFromCaller, { once: true });

  if (timeoutSignal.aborted) abortFromTimeout();
  else
    timeoutSignal.addEventListener("abort", abortFromTimeout, { once: true });

  return {
    signal: controller.signal,
    cleanup: () => {
      callerSignal.removeEventListener("abort", abortFromCaller);
      timeoutSignal.removeEventListener("abort", abortFromTimeout);
    },
  };
}

export async function apiRequest<T = void>(
  endpoint: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");

  let body: BodyInit | undefined;
  if (options.body !== undefined) {
    if (isNativeBody(options.body)) {
      body = options.body;
    } else {
      headers.set("Content-Type", "application/json");
      body = JSON.stringify(options.body);
    }
  }
  const { signal, cleanup } = createRequestSignal(options.signal);

  try {
    const response = await fetch(`${API_URL}/${endpoint.replace(/^\//, "")}`, {
      ...options,
      body,
      credentials: "include",
      headers,
      signal,
    });

    const contentType = response.headers.get("content-type");
    const payload: unknown =
      response.status === 204
        ? undefined
        : contentType?.includes("application/json")
          ? await response.json()
          : await response.text();

    if (!response.ok) {
      throw new ApiError(response.status, payload);
    }

    return payload as T;
  } finally {
    cleanup();
  }
}

export const api = {
  get: <T>(endpoint: string, options?: ApiRequestOptions) =>
    apiRequest<T>(endpoint, { ...options, method: "GET" }),
  post: <T = void>(endpoint: string, body?: RequestBody) =>
    apiRequest<T>(endpoint, { body, method: "POST" }),
  put: <T = void>(endpoint: string, body?: RequestBody) =>
    apiRequest<T>(endpoint, { body, method: "PUT" }),
  delete: <T = void>(endpoint: string) =>
    apiRequest<T>(endpoint, { method: "DELETE" }),
};

export function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}
