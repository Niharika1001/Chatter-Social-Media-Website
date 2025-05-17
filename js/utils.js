/**
 * Utility functions for the Chatter application
 */

// Generate a unique ID
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

// Format date to relative time (e.g. "2 hours ago")
function formatRelativeTime(timestamp) {
  const current = Date.now();
  const elapsed = current - timestamp;

  const seconds = Math.floor(elapsed / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(months / 12);

  if (seconds < 60) {
    return 'just now';
  } else if (minutes < 60) {
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
  } else if (hours < 24) {
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  } else if (days < 30) {
    return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  } else if (months < 12) {
    return `${months} ${months === 1 ? 'month' : 'months'} ago`;
  } else {
    return `${years} ${years === 1 ? 'year' : 'years'} ago`;
  }
}

// Show toast notification
function showToast(message, type = 'info') {
  const toastContainer = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  let icon;
  switch(type) {
    case 'success':
      icon = 'fa-check-circle';
      break;
    case 'error':
      icon = 'fa-exclamation-circle';
      break;
    case 'warning':
      icon = 'fa-exclamation-triangle';
      break;
    default:
      icon = 'fa-info-circle';
  }

  toast.innerHTML = `
    <div class="toast-content">
      <div class="toast-icon ${type}">
        <i class="fas ${icon}"></i>
      </div>
      <div class="toast-message">
        <p>${message}</p>
      </div>
      <button class="toast-close">
        <i class="fas fa-times"></i>
      </button>
    </div>
  `;

  toastContainer.appendChild(toast);

  // Add click event for close button
  const closeBtn = toast.querySelector('.toast-close');
  closeBtn.addEventListener('click', () => {
    toast.remove();
  });

  // Auto remove after 3 seconds
  setTimeout(() => {
    toast.remove();
  }, 3000);
}

// Validate email format
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Create a post element
function createPostElement(post, currentUser) {
  const postElement = document.createElement('div');
  postElement.className = 'post-card';
  postElement.dataset.id = post.id;

  // Check if current user has liked this post
  const hasLiked = post.likes && post.likes.includes(currentUser.id);
  
  // Check if current user is following this post's author
  const isFollowing = currentUser.following && currentUser.following.includes(post.userId);
  
  // Check if post belongs to the current user
  const isOwnPost = post.userId === currentUser.id;

  // Get user data
  const userData = JSON.parse(localStorage.getItem('users')).find(user => user.id === post.userId);
  
  postElement.innerHTML = `
    <div class="post-header">
      <div class="post-user">
        <div class="avatar-container small">
          <img src="${userData.profileImage || 'assets/default-avatar.png'}" alt="Profile">
        </div>
        <span class="post-username">${userData.username}</span>
      </div>
      ${isOwnPost ? `
        <div class="post-options">
          <button class="post-options-btn">
            <i class="fas fa-ellipsis-h"></i>
          </button>
          <div class="post-options-menu">
            <button class="edit-post-btn">Edit</button>
            <button class="delete-post-btn delete">Delete</button>
          </div>
        </div>
      ` : ''}
    </div>
    <img src="${post.image}" alt="Post" class="post-image">
    <div class="post-content">
      <div class="post-actions">
        <div class="post-action ${hasLiked ? 'active' : ''}" data-action="like">
          <i class="fas fa-heart"></i>
          <span>${post.likes ? post.likes.length : 0}</span>
        </div>
        <div class="post-action" data-action="comment">
          <i class="far fa-comment"></i>
          <span>${post.comments ? post.comments.length : 0}</span>
        </div>
        ${!isOwnPost ? `
          <div class="post-action follow-btn ${isFollowing ? 'following' : ''}" data-action="follow" data-user-id="${post.userId}">
            <i class="fas ${isFollowing ? 'fa-user-check' : 'fa-user-plus'}"></i>
            <span>${isFollowing ? 'Following' : 'Follow'}</span>
          </div>
        ` : ''}
      </div>
      <div class="post-stats">
        <div class="post-likes">${post.likes && post.likes.length > 0 ? `${post.likes.length} ${post.likes.length === 1 ? 'like' : 'likes'}` : 'No likes yet'}</div>
      </div>
      <div class="post-caption">
        <span class="post-username">${userData.username}</span>
        <span>${post.caption}</span>
      </div>
      ${post.comments && post.comments.length > 0 ? `
        <div class="post-comments-preview">
          View all ${post.comments.length} comments
        </div>
      ` : ''}
    </div>
  `;

  return postElement;
}

// Create a comment element
function createCommentElement(comment, post, currentUser) {
  const commentElement = document.createElement('div');
  commentElement.className = 'comment';
  commentElement.dataset.id = comment.id;
  
  // Check if comment belongs to the current user
  const isOwnComment = comment.userId === currentUser.id;
  
  // Check if post belongs to the current user (for reply option)
  const isPostOwner = post.userId === currentUser.id;
  
  // Get user data
  const userData = JSON.parse(localStorage.getItem('users')).find(user => user.id === comment.userId);
  
  commentElement.innerHTML = `
    <div class="avatar-container small">
      <img src="${userData.profileImage || 'assets/default-avatar.png'}" alt="Profile">
    </div>
    <div class="comment-content">
      <div class="comment-header">
        <div class="comment-username">${userData.username}</div>
        ${isOwnComment ? `
          <div class="comment-options">
            <button class="comment-options-btn">
              <i class="fas fa-ellipsis-h"></i>
            </button>
            <div class="comment-options-menu">
              <button class="edit-comment-btn">Edit</button>
              <button class="delete-comment-btn delete">Delete</button>
            </div>
          </div>
        ` : ''}
      </div>
      <div class="comment-text">${comment.text}</div>
      ${isPostOwner && !isOwnComment ? `
        <button class="btn-text reply-btn" data-comment-id="${comment.id}">Reply</button>
      ` : ''}
    </div>
  `;

  // Add replies if they exist
  if (comment.replies && comment.replies.length > 0) {
    const replyContainer = document.createElement('div');
    replyContainer.className = 'reply-container';
    
    comment.replies.forEach(reply => {
      const replyUser = JSON.parse(localStorage.getItem('users')).find(user => user.id === reply.userId);
      
      const replyElement = document.createElement('div');
      replyElement.className = 'reply';
      replyElement.innerHTML = `
        <div class="avatar-container small">
          <img src="${replyUser.profileImage || 'assets/default-avatar.png'}" alt="Profile">
        </div>
        <div class="comment-content">
          <div class="comment-header">
            <div class="comment-username">${replyUser.username}</div>
          </div>
          <div class="comment-text">${reply.text}</div>
        </div>
      `;
      
      replyContainer.appendChild(replyElement);
    });
    
    commentElement.appendChild(replyContainer);
  }

  return commentElement;
}

// Create a notification element
function createNotificationElement(notification) {
  const notificationElement = document.createElement('div');
  notificationElement.className = `notification ${notification.read ? 'read' : ''}`;
  notificationElement.dataset.id = notification.id;
  
  // Get user data
  const userData = JSON.parse(localStorage.getItem('users')).find(user => user.id === notification.fromUserId);
  
  // Format timestamp
  const timeAgo = formatRelativeTime(notification.timestamp);
  
  notificationElement.innerHTML = `
    <div class="notification-content">
      <div class="avatar-container small">
        <img src="${userData.profileImage || 'assets/default-avatar.png'}" alt="Profile">
      </div>
      <div class="notification-details">
        <div class="notification-message">
          <span class="notification-username">${userData.username}</span>
          <span>${notification.message}</span>
        </div>
        <div class="notification-time">${timeAgo}</div>
      </div>
    </div>
    <button class="notification-delete btn-icon">
      <i class="fas fa-times"></i>
    </button>
  `;
  
  return notificationElement;
}

// Create a user list item element (for followers/following modal)
function createUserElement(user, currentUser) {
  const userElement = document.createElement('div');
  userElement.className = 'user-item';
  userElement.dataset.id = user.id;
  
  const isFollowing = currentUser.following && currentUser.following.includes(user.id);
  const isCurrentUser = user.id === currentUser.id;
  
  userElement.innerHTML = `
    <div class="user-info">
      <div class="avatar-container small">
        <img src="${user.profileImage || 'assets/default-avatar.png'}" alt="Profile">
      </div>
      <div class="user-name">${user.username}</div>
    </div>
    ${!isCurrentUser ? `
      <button class="btn-${isFollowing ? 'secondary' : 'primary'} follow-action" data-user-id="${user.id}">
        ${isFollowing ? 'Unfollow' : 'Follow'}
      </button>
    ` : ''}
  `;
  
  return userElement;
}

// Convert file to base64
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}