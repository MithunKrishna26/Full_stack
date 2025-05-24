const API_BASE = "http://localhost:3000/api"

// Check if user is already logged in
if (localStorage.getItem("token")) {
  window.location.href = "dashboard.html"
}

// Login form handler
document.getElementById("loginForm")?.addEventListener("submit", async (e) => {
  e.preventDefault()

  const email = document.getElementById("email").value
  const password = document.getElementById("password").value

  try {
    const response = await fetch(`${API_BASE}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    })

    const data = await response.json()

    if (response.ok) {
      localStorage.setItem("token", data.token)
      localStorage.setItem("user", JSON.stringify(data.user))

      // Check if user has completed profile
      if (data.user.name) {
        window.location.href = "dashboard.html"
      } else {
        window.location.href = "profile-setup.html"
      }
    } else {
      alert(data.error || "Login failed")
    }
  } catch (error) {
    alert("Network error. Please try again.")
  }
})

// Signup form handler
document.getElementById("signupForm")?.addEventListener("submit", async (e) => {
  e.preventDefault()

  const email = document.getElementById("email").value
  const password = document.getElementById("password").value

  try {
    const response = await fetch(`${API_BASE}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    })

    const data = await response.json()

    if (response.ok) {
      localStorage.setItem("token", data.token)
      localStorage.setItem("user", JSON.stringify(data.user))
      window.location.href = "profile-setup.html"
    } else {
      alert(data.error || "Signup failed")
    }
  } catch (error) {
    alert("Network error. Please try again.")
  }
})
