/**
 * Sign in page functionality
 */

document.addEventListener('DOMContentLoaded', () => {
  // Form elements
  const signinForm = document.getElementById('signin-form');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  
  // Error message elements
  const emailError = document.getElementById('email-error');
  const passwordError = document.getElementById('password-error');
  
  // Password toggle button
  const passwordToggle = document.querySelector('.password-toggle');
  
  // Handle form submission
  signinForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Reset error messages
    emailError.textContent = '';
    passwordError.textContent = '';
    
    // Get form values
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    
    // Validate form
    let isValid = true;
    
    if (!email) {
      emailError.textContent = 'Email is required';
      isValid = false;
    }
    
    if (!password) {
      passwordError.textContent = 'Password is required';
      isValid = false;
    }
    
    if (!isValid) return;
    
    // Attempt to authenticate user
    const result = authenticateUser(email, password);
    
    if (result.success) {
      showToast('Sign in successful! Redirecting...', 'success');
      
      // Redirect to home after a short delay
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1000);
    } else {
      // Show error
      emailError.textContent = result.message;
      passwordError.textContent = result.message;
    }
  });
  
  // Password visibility toggle
  if (passwordToggle) {
    passwordToggle.addEventListener('click', () => {
      const input = passwordToggle.previousElementSibling;
      const icon = passwordToggle.querySelector('i');
      
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
  }
});