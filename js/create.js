/**
 * Create post page functionality
 */

document.addEventListener('DOMContentLoaded', () => {
  if (!checkAuth()) return;
  
  // Initialize auth
  initAuth();
  
  // Form elements
  const createPostForm = document.getElementById('create-post-form');
  const postImageInput = document.getElementById('post-image');
  const captionInput = document.getElementById('caption');
  const captionError = document.getElementById('caption-error');
  const uploadPrompt = document.getElementById('upload-prompt');
  const previewContainer = document.getElementById('preview-container');
  const imagePreview = document.getElementById('image-preview');
  const removeImageBtn = document.getElementById('remove-image');
  
  // When upload prompt is clicked, trigger file input
  uploadPrompt.addEventListener('click', () => {
    postImageInput.click();
  });
  
  // Preview uploaded image
  postImageInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    
    if (file) {
      try {
        // Check file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          throw new Error('Image size must be less than 5MB');
        }
        
        // Convert to base64
        const base64 = await fileToBase64(file);
        
        // Show preview
        imagePreview.src = base64;
        previewContainer.classList.remove('hidden');
        uploadPrompt.classList.add('hidden');
      } catch (error) {
        showToast(error.message, 'error');
      }
    }
  });
  
  // Remove image
  removeImageBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    
    // Clear file input
    postImageInput.value = '';
    
    // Hide preview, show upload prompt
    previewContainer.classList.add('hidden');
    uploadPrompt.classList.remove('hidden');
  });
  
  // Create post form submission
  createPostForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Reset error
    captionError.textContent = '';
    
    // Validate inputs
    const caption = captionInput.value.trim();
    
    if (!postImageInput.files[0]) {
      showToast('Please upload an image', 'error');
      return;
    }
    
    if (!caption) {
      captionError.textContent = 'Please add a caption';
      return;
    }
    
    try {
      // Get current user
      const currentUser = JSON.parse(localStorage.getItem('currentUser'));
      if (!currentUser) {
        throw new Error('You must be logged in to create a post');
      }
      
      // Convert image to base64
      const imageBase64 = await fileToBase64(postImageInput.files[0]);
      
      // Create post
      const result = createPost(currentUser.id, imageBase64, caption);
      
      if (result.success) {
        showToast('Post created successfully!', 'success');
        
        // Redirect to home after short delay
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 1500);
      } else {
        throw new Error('Failed to create post');
      }
    } catch (error) {
      showToast(error.message, 'error');
    }
  });
});