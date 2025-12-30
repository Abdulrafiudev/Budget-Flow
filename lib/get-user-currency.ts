export async function getUserCurrency(): Promise<"USD" | "NGN"> {
  try {
    const response = await fetch("https://ipapi.co/json/")
    const data = await response.json()

    // If user is in Nigeria, use NGN, otherwise USD
    return data.country_code === "NG" ? "NGN" : "USD"
  } catch (error) {
    console.error("Error detecting location:", error)
    // Default to USD if location detection fails
    return "USD"
  }
}
