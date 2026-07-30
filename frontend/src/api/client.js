export async function fetchProperties(params = {}) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.append(key, value);
    }
  });

  const queryString = searchParams.toString();
  const url = queryString ? `/api/properties?${queryString}` : "/api/properties";

  const response = await fetch(url);

  if (!response.ok) {
    let message = "Failed to fetch properties";

    try {
      const errorData = await response.json();
      message = errorData.error || message;
    } catch {
      // If the server does not return JSON, keep the default message.
    }

    throw new Error(message);
  }

  return response.json();
}