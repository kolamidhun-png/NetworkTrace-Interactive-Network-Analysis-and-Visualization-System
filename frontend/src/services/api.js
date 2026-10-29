
const API_BASE_URL = "http://127.0.0.1:8000";

async function handleResponse(response) {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.detail || "The request could not be completed."
    );
  }

  return data;
}

export async function getHealth() {
  const response = await fetch(`${API_BASE_URL}/api/health`);
  return handleResponse(response);
}

export async function getDemoGraph() {
  const response = await fetch(`${API_BASE_URL}/api/graph/demo`);
  return handleResponse(response);
}

export async function uploadGraphCsv(file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/api/graph/upload`, {
    method: "POST",
    body: formData,
  });

  return handleResponse(response);
}
