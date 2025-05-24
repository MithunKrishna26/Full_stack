import { Chart } from "@/components/ui/chart"
const API_BASE = "http://localhost:3000/api"
let currentUser = null
let nutritionChart = null

// Check if user is logged in
if (!localStorage.getItem("token")) {
  window.location.href = "index.html"
}

// Initialize dashboard
document.addEventListener("DOMContentLoaded", async () => {
  await loadUserProfile()
  await loadCategories()
  await loadTodaysFoodEntries()
  calculateBMI()
  setupEventListeners()
  updateCurrentDate()

  // Add loading animations
  addLoadingAnimations()
})

function addLoadingAnimations() {
  // Add stagger animation to summary cards
  const summaryCards = document.querySelectorAll(".summary-card")
  summaryCards.forEach((card, index) => {
    card.style.animationDelay = `${index * 0.1}s`
    card.classList.add("animate-in")
  })
}

async function loadUserProfile() {
  try {
    showLoading(true)
    const response = await fetch(`${API_BASE}/profile`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })

    if (response.ok) {
      currentUser = await response.json()
      populateProfileForm()
    }
  } catch (error) {
    console.error("Error loading profile:", error)
    showNotification("Error loading profile", "error")
  } finally {
    showLoading(false)
  }
}

function populateProfileForm() {
  if (currentUser) {
    document.getElementById("profileName").value = currentUser.name || ""
    document.getElementById("profileAge").value = currentUser.age || ""
    document.getElementById("profileGender").value = currentUser.gender || ""
    document.getElementById("profileHeight").value = currentUser.height || ""
    document.getElementById("profileWeight").value = currentUser.weight || ""
  }
}

function calculateBMI() {
  if (currentUser && currentUser.height && currentUser.weight) {
    const heightInMeters = currentUser.height / 100
    const bmi = currentUser.weight / (heightInMeters * heightInMeters)

    // Animate BMI value
    animateValue(document.getElementById("bmiValue"), 0, bmi, 1000, 1)

    let status = ""
    let statusColor = ""
    if (bmi < 18.5) {
      status = "Underweight"
      statusColor = "#3b82f6"
    } else if (bmi < 25) {
      status = "Normal weight"
      statusColor = "#10b981"
    } else if (bmi < 30) {
      status = "Overweight"
      statusColor = "#f59e0b"
    } else {
      status = "Obese"
      statusColor = "#ef4444"
    }

    const statusElement = document.getElementById("bmiStatus")
    statusElement.textContent = status
    statusElement.style.color = statusColor
  }
}

function animateValue(element, start, end, duration, decimals = 0) {
  const startTime = performance.now()

  function update(currentTime) {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)

    const current = start + (end - start) * easeOutCubic(progress)
    element.textContent = current.toFixed(decimals)

    if (progress < 1) {
      requestAnimationFrame(update)
    }
  }

  requestAnimationFrame(update)
}

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3)
}

async function loadCategories() {
  try {
    const response = await fetch(`${API_BASE}/categories`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })

    if (response.ok) {
      const categories = await response.json()
      displayCategories(categories)
      populateCategorySelect(categories)
    }
  } catch (error) {
    console.error("Error loading categories:", error)
    showNotification("Error loading categories", "error")
  }
}

function displayCategories(categories) {
  const categoriesList = document.getElementById("categoriesList")
  categoriesList.innerHTML = ""

  categories.forEach((category, index) => {
    const categoryTag = document.createElement("div")
    categoryTag.className = "category-tag"
    categoryTag.textContent = category.name
    categoryTag.style.animationDelay = `${index * 0.1}s`
    categoriesList.appendChild(categoryTag)
  })
}

function populateCategorySelect(categories) {
  const select = document.getElementById("foodCategory")
  select.innerHTML = ""

  categories.forEach((category) => {
    const option = document.createElement("option")
    option.value = category.id
    option.textContent = category.name
    select.appendChild(option)
  })
}

async function loadTodaysFoodEntries() {
  try {
    const today = new Date().toISOString().split("T")[0]
    const response = await fetch(`${API_BASE}/food-entries?date=${today}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })

    if (response.ok) {
      const entries = await response.json()
      displayFoodEntries(entries)
      updateNutritionSummary(entries)
      updateNutritionChart(entries)
    }
  } catch (error) {
    console.error("Error loading food entries:", error)
    showNotification("Error loading food entries", "error")
  }
}

function displayFoodEntries(entries) {
  const entriesList = document.getElementById("foodEntriesList")
  entriesList.innerHTML = ""

  if (entries.length === 0) {
    entriesList.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-utensils"></i>
        <h3>No food entries yet</h3>
        <p>Start tracking your meals to see them here</p>
      </div>
    `
    return
  }

  entries.forEach((entry, index) => {
    const calories = ((entry.calories_per_100g * entry.quantity) / 100).toFixed(0)

    const entryDiv = document.createElement("div")
    entryDiv.className = "food-entry"
    entryDiv.style.animationDelay = `${index * 0.1}s`
    entryDiv.innerHTML = `
      <div class="food-entry-info">
        <h4>${entry.food_name}</h4>
        <p><i class="fas fa-tag"></i> ${entry.category_name} • ${entry.quantity}g</p>
      </div>
      <div class="food-entry-calories">
        <i class="fas fa-fire"></i> ${calories} cal
      </div>
    `
    entriesList.appendChild(entryDiv)
  })
}

function updateNutritionSummary(entries) {
  let totalCalories = 0
  let totalProtein = 0
  let totalCarbs = 0
  let totalFat = 0

  entries.forEach((entry) => {
    const multiplier = entry.quantity / 100
    totalCalories += entry.calories_per_100g * multiplier
    totalProtein += entry.protein_per_100g * multiplier
    totalCarbs += entry.carbs_per_100g * multiplier
    totalFat += entry.fat_per_100g * multiplier
  })

  // Animate the values
  animateValueSummary(document.getElementById("totalCalories"), 0, totalCalories, 1500, 0)
  animateValueSummary(document.getElementById("totalProtein"), 0, totalProtein, 1500, 1, "g")
  animateValueSummary(document.getElementById("totalCarbs"), 0, totalCarbs, 1500, 1, "g")
  animateValueSummary(document.getElementById("totalFat"), 0, totalFat, 1500, 1, "g")
}

function animateValueSummary(element, start, end, duration, decimals = 0, suffix = "") {
  const startTime = performance.now()

  function update(currentTime) {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)

    const current = start + (end - start) * easeOutCubic(progress)
    element.textContent = current.toFixed(decimals) + suffix

    if (progress < 1) {
      requestAnimationFrame(update)
    }
  }

  requestAnimationFrame(update)
}

function updateNutritionChart(entries) {
  let totalProtein = 0
  let totalCarbs = 0
  let totalFat = 0

  entries.forEach((entry) => {
    const multiplier = entry.quantity / 100
    totalProtein += entry.protein_per_100g * multiplier
    totalCarbs += entry.carbs_per_100g * multiplier
    totalFat += entry.fat_per_100g * multiplier
  })

  const ctx = document.getElementById("nutritionChart").getContext("2d")

  if (nutritionChart) {
    nutritionChart.destroy()
  }

  nutritionChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Protein", "Carbohydrates", "Fat"],
      datasets: [
        {
          data: [totalProtein, totalCarbs, totalFat],
          backgroundColor: ["rgba(78, 205, 196, 0.8)", "rgba(255, 159, 243, 0.8)", "rgba(72, 219, 251, 0.8)"],
          borderColor: ["#44a08d", "#ff9ff3", "#0abde3"],
          borderWidth: 3,
          hoverOffset: 10,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            padding: 20,
            usePointStyle: true,
            font: {
              size: 14,
              family: "'Poppins', sans-serif",
            },
          },
        },
        tooltip: {
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          titleColor: "#fff",
          bodyColor: "#fff",
          borderColor: "#667eea",
          borderWidth: 1,
          cornerRadius: 8,
          callbacks: {
            label: (context) => context.label + ": " + context.parsed.toFixed(1) + "g",
          },
        },
      },
      animation: {
        animateRotate: true,
        duration: 2000,
      },
    },
  })
}

function setupEventListeners() {
  // Food search
  const foodSearch = document.getElementById("foodSearch")
  foodSearch.addEventListener("input", debounce(searchFoods, 300))

  // Profile form
  document.getElementById("profileForm").addEventListener("submit", updateProfile)

  // Add food form
  document.getElementById("addFoodForm").addEventListener("submit", addFoodEntry)

  // Modal close
  document.querySelector(".close").addEventListener("click", closeModal)
  window.addEventListener("click", (e) => {
    const modal = document.getElementById("addFoodModal")
    if (e.target === modal) {
      closeModal()
    }
  })

  // Escape key to close modal
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeModal()
    }
  })
}

async function searchFoods() {
  const query = document.getElementById("foodSearch").value
  if (query.length < 2) {
    document.getElementById("searchResults").innerHTML = ""
    return
  }

  try {
    const response = await fetch(`${API_BASE}/foods/search?q=${encodeURIComponent(query)}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })

    if (response.ok) {
      const foods = await response.json()
      displaySearchResults(foods)
    }
  } catch (error) {
    console.error("Error searching foods:", error)
    showNotification("Error searching foods", "error")
  }
}

function displaySearchResults(foods) {
  const resultsDiv = document.getElementById("searchResults")
  resultsDiv.innerHTML = ""

  if (foods.length === 0) {
    resultsDiv.innerHTML = `
      <div class="search-result-item">
        <i class="fas fa-search"></i>
        <span>No foods found</span>
      </div>
    `
    return
  }

  foods.forEach((food) => {
    const resultItem = document.createElement("div")
    resultItem.className = "search-result-item"
    resultItem.innerHTML = `
      <i class="fas fa-apple-alt"></i>
      <div>
        <strong>${food.name}</strong>
        <small>${food.calories_per_100g} cal/100g</small>
      </div>
    `
    resultItem.addEventListener("click", () => selectFood(food))
    resultsDiv.appendChild(resultItem)
  })
}

function selectFood(food) {
  document.getElementById("selectedFoodId").value = food.id
  document.getElementById("selectedFoodName").textContent = food.name
  document.getElementById("foodSearch").value = ""
  document.getElementById("searchResults").innerHTML = ""
  document.getElementById("addFoodModal").style.display = "block"
  document.body.style.overflow = "hidden"
}

async function addFoodEntry(e) {
  e.preventDefault()

  const foodId = document.getElementById("selectedFoodId").value
  const quantity = Number.parseFloat(document.getElementById("foodQuantity").value)
  const categoryId = document.getElementById("foodCategory").value

  if (!foodId || !quantity || !categoryId) {
    showNotification("Please fill in all fields", "error")
    return
  }

  try {
    showLoading(true)
    const response = await fetch(`${API_BASE}/food-entries`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        food_id: foodId,
        category_id: categoryId,
        quantity: quantity,
      }),
    })

    if (response.ok) {
      closeModal()
      await loadTodaysFoodEntries()
      document.getElementById("addFoodForm").reset()
      showNotification("Food entry added successfully!", "success")
    } else {
      showNotification("Failed to add food entry", "error")
    }
  } catch (error) {
    showNotification("Network error. Please try again.", "error")
  } finally {
    showLoading(false)
  }
}

async function addCategory() {
  const name = prompt("Enter category name:")
  if (!name || name.trim() === "") return

  try {
    showLoading(true)
    const response = await fetch(`${API_BASE}/categories`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ name: name.trim() }),
    })

    if (response.ok) {
      await loadCategories()
      showNotification("Category added successfully!", "success")
    } else {
      showNotification("Failed to add category", "error")
    }
  } catch (error) {
    showNotification("Network error. Please try again.", "error")
  } finally {
    showLoading(false)
  }
}

async function updateProfile(e) {
  e.preventDefault()

  const name = document.getElementById("profileName").value
  const age = Number.parseInt(document.getElementById("profileAge").value)
  const gender = document.getElementById("profileGender").value
  const height = Number.parseFloat(document.getElementById("profileHeight").value)
  const weight = Number.parseFloat(document.getElementById("profileWeight").value)

  if (!name || !age || !gender || !height || !weight) {
    showNotification("Please fill in all fields", "error")
    return
  }

  try {
    showLoading(true)
    const response = await fetch(`${API_BASE}/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ name, age, gender, height, weight }),
    })

    if (response.ok) {
      currentUser = await response.json()
      calculateBMI()
      showNotification("Profile updated successfully!", "success")
    } else {
      showNotification("Failed to update profile", "error")
    }
  } catch (error) {
    showNotification("Network error. Please try again.", "error")
  } finally {
    showLoading(false)
  }
}

function closeModal() {
  document.getElementById("addFoodModal").style.display = "none"
  document.body.style.overflow = "auto"
}

function showHome() {
  showSection("homeSection")
  setActiveNav(0)
}

function showFoodTracking() {
  showSection("foodTrackingSection")
  setActiveNav(1)
}

function showProfile() {
  showSection("profileSection")
  setActiveNav(2)
}

function showSection(sectionId) {
  document.querySelectorAll(".section").forEach((section) => {
    section.classList.remove("active")
  })
  document.getElementById(sectionId).classList.add("active")
}

function setActiveNav(index) {
  document.querySelectorAll(".nav-item").forEach((link, i) => {
    if (i === index) {
      link.classList.add("active")
    } else {
      link.classList.remove("active")
    }
  })
}

function logout() {
  if (confirm("Are you sure you want to logout?")) {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    window.location.href = "index.html"
  }
}

function updateCurrentDate() {
  const today = new Date()
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }
  document.getElementById("currentDate").textContent = today.toLocaleDateString("en-US", options)
}

function showLoading(show) {
  const loader = document.getElementById("loader")
  if (show) {
    if (!loader) {
      const loaderDiv = document.createElement("div")
      loaderDiv.id = "loader"
      loaderDiv.className = "loading-overlay"
      loaderDiv.innerHTML = `
        <div class="loading-spinner">
          <i class="fas fa-spinner fa-spin"></i>
          <p>Loading...</p>
        </div>
      `
      document.body.appendChild(loaderDiv)
    }
  } else {
    if (loader) {
      loader.remove()
    }
  }
}

function showNotification(message, type = "info") {
  const notification = document.createElement("div")
  notification.className = `notification notification-${type}`

  const icon = type === "success" ? "check-circle" : type === "error" ? "exclamation-circle" : "info-circle"

  notification.innerHTML = `
    <i class="fas fa-${icon}"></i>
    <span>${message}</span>
    <button onclick="this.parentElement.remove()">
      <i class="fas fa-times"></i>
    </button>
  `

  document.body.appendChild(notification)

  // Auto remove after 5 seconds
  setTimeout(() => {
    if (notification.parentElement) {
      notification.remove()
    }
  }, 5000)
}

function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// Add CSS for notifications and loading
const additionalStyles = `
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.loading-spinner {
  background: white;
  padding: 2rem;
  border-radius: 1rem;
  text-align: center;
  box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1);
}

.loading-spinner i {
  font-size: 2rem;
  color: var(--accent-purple);
  margin-bottom: 1rem;
}

.notification {
  position: fixed;
  top: 2rem;
  right: 2rem;
  background: white;
  padding: 1rem 1.5rem;
  border-radius: 0.75rem;
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  z-index: 1000;
  animation: slideInRight 0.3s ease-out;
  border-left: 4px solid;
}

.notification-success {
  border-left-color: #10b981;
  color: #065f46;
}

.notification-error {
  border-left-color: #ef4444;
  color: #991b1b;
}

.notification-info {
  border-left-color: #3b82f6;
  color: #1e40af;
}

.notification button {
  background: none;
  border: none;
  cursor: pointer;
  color: inherit;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.notification button:hover {
  opacity: 1;
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.empty-state {
  text-align: center;
  padding: 3rem 2rem;
  color: var(--gray-500);
}

.empty-state i {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-state h3 {
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
  color: var(--gray-600);
}

.animate-in {
  animation: slideInUp 0.6s ease-out forwards;
  opacity: 0;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
`

// Inject additional styles
const styleSheet = document.createElement("style")
styleSheet.textContent = additionalStyles
document.head.appendChild(styleSheet)
