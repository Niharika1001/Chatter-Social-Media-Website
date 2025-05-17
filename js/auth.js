/**
 * Authentication related functions
 */

// Check if user is logged in
function checkAuth() {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  
  // If not on auth pages and no user is logged in, redirect to sign in
  if (!currentUser && 
      !window.location.pathname.includes('signin.html') && 
      !window.location.pathname.includes('signup.html')) {
    window.location.href = 'signin.html';
    return false;
  }
  
  // If on auth pages and user is already logged in, redirect to home
  if (currentUser && 
      (window.location.pathname.includes('signin.html') || 
       window.location.pathname.includes('signup.html'))) {
    window.location.href = 'index.html';
    return true;
  }
  
  return !!currentUser;
}

// Initialize auth state
function initAuth() {
  // Handle logout button
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      logout();
    });
  }
  
  // Update avatar in navbar
  updateNavAvatar();
  
  // Initialize dropdown
  const dropdown = document.querySelector('.dropdown');
  if (dropdown) {
    const trigger = dropdown.querySelector('.dropdown-trigger');
    trigger.addEventListener('click', () => {
      dropdown.classList.toggle('active');
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!dropdown.contains(e.target)) {
        dropdown.classList.remove('active');
      }
    });
  }
}

// Update the avatar in the navbar
function updateNavAvatar() {
  const navAvatar = document.getElementById('nav-avatar');
  if (navAvatar) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser && currentUser.profileImage) {
      navAvatar.src = currentUser.profileImage;
    }
  }
}

// Logout function
function logout() {
  localStorage.removeItem('currentUser');
  window.location.href = 'signin.html';
}

// Initialize auth system if necessary (first time)
function initializeAuthSystem() {
  // Check if users array exists in localStorage
  if (!localStorage.getItem('users')) {
    // Create empty users array
    localStorage.setItem('users', JSON.stringify([]));
  }
  
  // Check if posts array exists in localStorage
  if (!localStorage.getItem('posts')) {
    // Create empty posts array
    localStorage.setItem('posts', JSON.stringify([]));
  }
}

// Call on load to make sure our data structures exist
initializeAuthSystem();

// Run auth check on each page load
document.addEventListener('DOMContentLoaded', checkAuth);