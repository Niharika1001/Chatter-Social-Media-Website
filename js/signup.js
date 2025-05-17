/**
 * Sign up page functionality
 */

document.addEventListener('DOMContentLoaded', () => {
  // Form elements
  const signupForm = document.getElementById('signup-form');
  const emailInput = document.getElementById('email');
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');
  const confirmPasswordInput = document.getElementById('confirm-password');
  
  // Error message elements
  const emailError = document.getElementById('email-error');
  const usernameError = document.getElementById('username-error');
  const passwordError = document.getElementById('password-error');
  const confirmPasswordError = document.getElementById('confirm-password-error');
  
  // Password toggle buttons
  const passwordToggles = document.querySelectorAll('.password-toggle');
  
  // Handle form submission
  signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Reset error messages
    emailError.textContent = '';
    usernameError.textContent = '';
    passwordError.textContent = '';
    confirmPasswordError.textContent = '';
    
    // Get form values
    const email = emailInput.value.trim();
    const username = usernameInput.value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    
    // Validate form
    let isValid = true;
    
    if (!email) {
      emailError.textContent = 'Email is required';
      isValid = false;
    } else if (!isValidEmail(email)) {
      emailError.textContent = 'Invalid email format';
      isValid = false;
    }
    
    if (!username) {
      usernameError.textContent = 'Username is required';
      isValid = false;
    } else if (username.length < 3) {
      usernameError.textContent = 'Username must be at least 3 characters';
      isValid = false;
    }
    
    if (!password) {
      passwordError.textContent = 'Password is required';
      isValid = false;
    } else if (password.length < 6) {
      passwordError.textContent = 'Password must be at least 6 characters';
      isValid = false;
    }
    
    if (password !== confirmPassword) {
      confirmPasswordError.textContent = 'Passwords do not match';
      isValid = false;
    }
    
    if (!isValid) return;
    
    // Attempt to create user
    const result = createUser(email, username, password);
    
    if (result.success) {
      showToast('Account created successfully! Redirecting to sign in...', 'success');
      
      // Redirect to sign in after a short delay
      setTimeout(() => {
        window.location.href = 'signin.html';
      }, 1500);
    } else {
      // Show error based on the message
      if (result.message.includes('Email')) {
        emailError.textContent = result.message;
      } else if (result.message.includes('Username')) {
        usernameError.textContent = result.message;
      } else {
        showToast(result.message, 'error');
      }
    }
  });
  
  // Password visibility toggle
  passwordToggles.forEach(toggle => {
    toggle.addEventListener('click', () => {
      const input = toggle.previousElementSibling;
      const icon = toggle.querySelector('i');
      
      if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
      } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
      }
    });
  });
});