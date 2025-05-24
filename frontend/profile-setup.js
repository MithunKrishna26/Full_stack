const API_BASE = "http://localhost:3000/api"

// Check if user is logged in
if (!localStorage.getItem("token")) {
  window.location.href = "index.html"
}

document.getElementById("profileSetupForm").addEventListener("submit", async (e) => {
  e.preventDefault()

  const name = document.getElementById("name").value
  const age = Number.parseInt(document.getElementById("age").value)
  const gender = document.getElementById("gender").value
  const height = Number.parseFloat(document.getElementById("height").value)
  const weight = Number.parseFloat(document.getElementById("weight").value)

  try {
    const response = await fetch(`${API_BASE}/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ name, age, gender, height, weight }),
    })

    const data = await response.json()

    if (response.ok) {
      localStorage.setItem("user", JSON.stringify(data))
      window.location.href = "dashboard.html"
    } else {
      alert(data.error || "Profile update failed")
    }
  } catch (error) {
    alert("Network error. Please try again.")
  }
})
