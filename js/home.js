/**
 * Home page functionality
 */

// Global variables
let currentPostId = null;
let currentCommentId = null;

// Initialize home page
function initHomePage() {
  // Load all posts
  loadPosts();
  
  // Initialize auth functionality
  initAuth();
  
  // Handle modals
  initModals();
  
  // Check for post ID in URL (for notifications)
  const urlParams = new URLSearchParams(window.location.search);
  const postId = urlParams.get('post');
  if (postId) {
    // Timeout to allow posts to load first
    setTimeout(() => {
      const postElement = document.querySelector(`.post-card[data-id="${postId}"]`);
      if (postElement) {
        postElement.scrollIntoView({ behavior: 'smooth' });
        const commentBtn = postElement.querySelector('[data-action="comment"]');
        if (commentBtn) {
          commentBtn.click();
        }
      }
    }, 500);
  }
}

// Load all posts
function loadPosts() {
  const postsContainer = document.getElementById('posts-container');
  if (!postsContainer) return;
  
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  if (!currentUser) return;
  
  const posts = getAllPosts();
  
  // Clear loading indicator
  postsContainer.innerHTML = '';
  
  if (posts.length === 0) {
    postsContainer.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-image"></i>
        <p>No posts yet</p>
        <a href="create.html" class="btn-primary">Create your first post</a>
      </div>
    `;
    return;
  }
  
  // Create post elements
  posts.forEach(post => {
    const postElement = createPostElement(post, currentUser);
    postsContainer.appendChild(postElement);
    
    // Add event listeners
    addPostEventListeners(postElement, post, currentUser);
  });
}

// Add event listeners to post elements
function addPostEventListeners(postElement, post, currentUser) {
  // Like button
  const likeBtn = postElement.querySelector('[data-action="like"]');
  if (likeBtn) {
    likeBtn.addEventListener('click', () => {
      togglePostLike(post.id);
    });
  }
  
  // Comment button
  const commentBtn = postElement.querySelector('[data-action="comment"]');
  if (commentBtn) {
    commentBtn.addEventListener('click', () => {
      openCommentsModal(post.id);
    });
  }
  
  // Follow button
  const followBtn = postElement.querySelector('[data-action="follow"]');
  if (followBtn) {
    followBtn.addEventListener('click', () => {
      const userId = followBtn.dataset.userId;
      toggleUserFollow(userId);
    });
  }
  
  // Comments preview
  const commentsPreview = postElement.querySelector('.post-comments-preview');
  if (commentsPreview) {
    commentsPreview.addEventListener('click', () => {
      openCommentsModal(post.id);
    });
  }
  
  // Post options (if own post)
  const postOptionsBtn = postElement.querySelector('.post-options-btn');
  if (postOptionsBtn) {
    postOptionsBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const optionsMenu = postElement.querySelector('.post-options-menu');
      optionsMenu.style.display = optionsMenu.style.display === 'block' ? 'none' : 'block';
      
      // Close menu when clicking outside
      const closeMenu = (event) => {
        if (!optionsMenu.contains(event.target) && event.target !== postOptionsBtn) {
          optionsMenu.style.display = 'none';
          document.removeEventListener('click', closeMenu);
        }
      };
      
      document.addEventListener('click', closeMenu);
    });
    
    // Edit button
    const editBtn = postElement.querySelector('.edit-post-btn');
    if (editBtn) {
      editBtn.addEventListener('click', () => {
        openEditPostModal(post.id);
      });
    }
    
    // Delete button
    const deleteBtn = postElement.querySelector('.delete-post-btn');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', () => {
        deleteUserPost(post.id);
      });
    }
  }
}

// Toggle like on post
function togglePostLike(postId) {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  if (!currentUser) return;
  
  const result = toggleLike(postId, currentUser.id);
  
  if (result.success) {
    // Update UI
    const postElement = document.querySelector(`.post-card[data-id="${postId}"]`);
    if (postElement) {
      const likeBtn = postElement.querySelector('[data-action="like"]');
      const likeCount = likeBtn.querySelector('span');
      
      if (result.liked) {
        // Liked
        likeBtn.classList.add('active');
        showToast('Post liked!', 'success');
      } else {
        // Unliked
        likeBtn.classList.remove('active');
      }
      
      // Update like count
      likeCount.textContent = result.post.likes.length;
      
      // Update like stat
      const likeStat = postElement.querySelector('.post-likes');
      if (likeStat) {
        likeStat.textContent = result.post.likes.length > 0 
          ? `${result.post.likes.length} ${result.post.likes.length === 1 ? 'like' : 'likes'}`
          : 'No likes yet';
      }
    }
  }
}

// Open comments modal
function openCommentsModal(postId) {
  const commentsModal = document.getElementById('comments-modal');
  const commentsContainer = document.getElementById('comments-container');
  const commentInput = document.getElementById('comment-input');
  const postCommentBtn = document.getElementById('post-comment');
  const commentAvatar = document.getElementById('comment-avatar');
  
  if (!commentsModal || !commentsContainer || !commentInput || !postCommentBtn) return;
  
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  if (!currentUser) return;
  
  // Update avatar
  if (commentAvatar) {
    commentAvatar.src = currentUser.profileImage || 'assets/default-avatar.png';
  }
  
  // Save current post ID
  currentPostId = postId;
  
  // Show modal
  commentsModal.classList.add('active');
  
  // Load comments
  loadComments(postId);
  
  // Focus input
  commentInput.focus();
  
  // Set up post comment button
  postCommentBtn.onclick = () => {
    const commentText = commentInput.value.trim();
    if (commentText) {
      addPostComment(postId, commentText);
      commentInput.value = '';
    }
  };
  
  // Allow Enter key to post comment
  commentInput.onkeypress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      postCommentBtn.click();
    }
  };
}

// Load comments for a post
function loadComments(postId) {
  const commentsContainer = document.getElementById('comments-container');
  if (!commentsContainer) return;
  
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  if (!currentUser) return;
  
  const posts = getAllPosts();
  const post = posts.find(p => p.id === postId);
  
  if (!post) {
    commentsContainer.innerHTML = '<p>Post not found</p>';
    return;
  }
  
  // Clear container
  commentsContainer.innerHTML = '';
  
  if (!post.comments || post.comments.length === 0) {
    commentsContainer.innerHTML = `
      <div class="empty-state">
        <p>No comments yet</p>
      </div>
    `;
    return;
  }
  
  // Create comment elements
  post.comments.forEach(comment => {
    const commentElement = createCommentElement(comment, post, currentUser);
    commentsContainer.appendChild(commentElement);
    
    // Add event listeners
    addCommentEventListeners(commentElement, comment, post, currentUser);
  });
}

// Add event listeners to comment elements
function addCommentEventListeners(commentElement, comment, post, currentUser) {
  // Comment options (if own comment)
  const optionsBtn = commentElement.querySelector('.comment-options-btn');
  if (optionsBtn) {
    optionsBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const optionsMenu = commentElement.querySelector('.comment-options-menu');
      optionsMenu.style.display = optionsMenu.style.display === 'block' ? 'none' : 'block';
      
      // Close menu when clicking outside
      const closeMenu = (event) => {
        if (!optionsMenu.contains(event.target) && event.target !== optionsBtn) {
          optionsMenu.style.display = 'none';
          document.removeEventListener('click', closeMenu);
        }
      };
      
      document.addEventListener('click', closeMenu);
    });
    
    // Edit button
    const editBtn = commentElement.querySelector('.edit-comment-btn');
    if (editBtn) {
      editBtn.addEventListener('click', () => {
        // Add edit functionality here
        const commentTextEl = commentElement.querySelector('.comment-text');
        const currentText = commentTextEl.textContent;
        
        // Replace text with input
        commentTextEl.innerHTML = `
          <div class="edit-comment-form">
            <input type="text" class="edit-comment-input" value="${currentText}">
            <div>
              <button class="btn-text cancel-edit">Cancel</button>
              <button class="btn-primary save-edit">Save</button>
            </div>
          </div>
        `;
        
        // Focus input
        const input = commentElement.querySelector('.edit-comment-input');
        input.focus();
        
        // Add event listeners
        const cancelBtn = commentElement.querySelector('.cancel-edit');
        const saveBtn = commentElement.querySelector('.save-edit');
        
        cancelBtn.addEventListener('click', () => {
          commentTextEl.textContent = currentText;
        });
        
        saveBtn.addEventListener('click', () => {
          const newText = input.value.trim();
          if (newText) {
            updatePostComment(post.id, comment.id, newText);
          }
        });
      });
    }
    
    // Delete button
    const deleteBtn = commentElement.querySelector('.delete-comment-btn');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', () => {
        deletePostComment(post.id, comment.id);
      });
    }
  }
  
  // Reply button (if post owner)
  const replyBtn = commentElement.querySelector('.reply-btn');
  if (replyBtn) {
    replyBtn.addEventListener('click', () => {
      // Save current comment ID
      currentCommentId = comment.id;
      
      // Check if reply form already exists
      if (commentElement.querySelector('.reply-form')) {
        return;
      }
      
      // Create reply form
      const replyForm = document.createElement('div');
      replyForm.className = 'reply-form';
      
      replyForm.innerHTML = `
        <div class="avatar-container small">
          <img src="${currentUser.profileImage || 'assets/default-avatar.png'}" alt="Profile">
        </div>
        <input type="text" class="reply-input" placeholder="Reply to this comment...">
        <button class="btn-primary post-reply-btn">Reply</button>
      `;
      
      // Add to comment element
      if (commentElement.querySelector('.reply-container')) {
        commentElement.querySelector('.reply-container').insertBefore(replyForm, commentElement.querySelector('.reply-container').firstChild);
      } else {
        const replyContainer = document.createElement('div');
        replyContainer.className = 'reply-container';
        replyContainer.appendChild(replyForm);
        commentElement.appendChild(replyContainer);
      }
      
      // Focus input
      const input = replyForm.querySelector('.reply-input');
      input.focus();
      
      // Add event listener to reply button
      const postReplyBtn = replyForm.querySelector('.post-reply-btn');
      postReplyBtn.addEventListener('click', () => {
        const replyText = input.value.trim();
        if (replyText) {
          addCommentReply(post.id, comment.id, replyText);
        }
      });
      
      // Allow Enter key to post reply
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          postReplyBtn.click();
        }
      });
    });
  }
}

// Add comment to post
function addPostComment(postId, text) {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  if (!currentUser) return;
  
  const result = addComment(postId, currentUser.id, text);
  
  if (result.success) {
    // Reload comments
    loadComments(postId);
    
    // Update comment count in post element
    const postElement = document.querySelector(`.post-card[data-id="${postId}"]`);
    if (postElement) {
      const commentBtn = postElement.querySelector('[data-action="comment"]');
      const commentCount = commentBtn.querySelector('span');
      commentCount.textContent = result.post.comments.length;
    }
    
    showToast('Comment added!', 'success');
  }
}

// Update a comment
function updatePostComment(postId, commentId, text) {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  if (!currentUser) return;
  
  const result = updateComment(postId, commentId, currentUser.id, text);
  
  if (result.success) {
    // Reload comments
    loadComments(postId);
    showToast('Comment updated!', 'success');
  }
}

// Delete a comment
function deletePostComment(postId, commentId) {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  if (!currentUser) return;
  
  if (confirm('Are you sure you want to delete this comment?')) {
    const result = deleteComment(postId, commentId, currentUser.id);
    
    if (result.success) {
      // Reload comments
      loadComments(postId);
      
      // Update comment count in post element
      const posts = getAllPosts();
      const post = posts.find(p => p.id === postId);
      
      if (post) {
        const postElement = document.querySelector(`.post-card[data-id="${postId}"]`);
        if (postElement) {
          const commentBtn = postElement.querySelector('[data-action="comment"]');
          const commentCount = commentBtn.querySelector('span');
          commentCount.textContent = post.comments ? post.comments.length : 0;
        }
      }
      
      showToast('Comment deleted!', 'success');
    }
  }
}

// Add reply to comment
function addCommentReply(postId, commentId, text) {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  if (!currentUser) return;
  
  const result = addReply(postId, commentId, currentUser.id, text);
  
  if (result.success) {
    // Reload comments
    loadComments(postId);
    showToast('Reply added!', 'success');
  }
}

// Toggle follow user
function toggleUserFollow(userId) {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  if (!currentUser) return;
  
  const result = toggleFollow(currentUser.id, userId);
  
  if (result.success) {
    // Update follow button
    const followBtns = document.querySelectorAll(`.follow-btn[data-user-id="${userId}"]`);
    
    followBtns.forEach(btn => {
      const btnLabel = btn.querySelector('span');
      const btnIcon = btn.querySelector('i');
      
      if (result.following) {
        // Now following
        btn.classList.add('following');
        btnLabel.textContent = 'Following';
        btnIcon.className = 'fas fa-user-check';
        showToast(`You started following ${result.target.username}`, 'success');
      } else {
        // Unfollowed
        btn.classList.remove('following');
        btnLabel.textContent = 'Follow';
        btnIcon.className = 'fas fa-user-plus';
        showToast(`You unfollowed ${result.target.username}`, 'success');
      }
    });
  }
}

// Delete a post
function deleteUserPost(postId) {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  if (!currentUser) return;
  
  if (confirm('Are you sure you want to delete this post?')) {
    const result = deletePost(postId, currentUser.id);
    
    if (result.success) {
      // Remove post from DOM
      const postElement = document.querySelector(`.post-card[data-id="${postId}"]`);
      if (postElement) {
        postElement.remove();
      }
      
      showToast('Post deleted!', 'success');
      
      // Check if there are no posts left
      const postsContainer = document.getElementById('posts-container');
      if (postsContainer && postsContainer.children.length === 0) {
        loadPosts(); // This will show the empty state
      }
    }
  }
}

// Open edit post modal
function openEditPostModal(postId) {
  const posts = getAllPosts();
  const post = posts.find(p => p.id === postId);
  
  if (!post) return;
  
  const editModal = document.getElementById('edit-post-modal');
  const editCaptionInput = document.getElementById('edit-caption');
  const editPostForm = document.getElementById('edit-post-form');
  const deletePostBtn = document.getElementById('delete-post');
  
  if (!editModal || !editCaptionInput || !editPostForm) return;
  
  // Set current post data
  editCaptionInput.value = post.caption;
  
  // Show modal
  editModal.classList.add('active');
  
  // Handle delete button
  if (deletePostBtn) {
    deletePostBtn.onclick = () => {
      deleteUserPost(postId);
      editModal.classList.remove('active');
    };
  }
  
  // Handle form submission
  editPostForm.onsubmit = (e) => {
    e.preventDefault();
    
    const newCaption = editCaptionInput.value.trim();
    if (newCaption) {
      updateUserPost(postId, newCaption);
      editModal.classList.remove('active');
    }
  };
}

// Update a post
function updateUserPost(postId, caption) {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  if (!currentUser) return;
  
  const result = updatePost(postId, currentUser.id, { caption });
  
  if (result.success) {
    // Update post in DOM
    const postElement = document.querySelector(`.post-card[data-id="${postId}"]`);
    if (postElement) {
      const captionEl = postElement.querySelector('.post-caption span:last-child');
      if (captionEl) {
        captionEl.textContent = caption;
      }
    }
    
    showToast('Post updated!', 'success');
  }
}

// Initialize modals
function initModals() {
  const modals = document.querySelectorAll('.modal');
  const closeButtons = document.querySelectorAll('.modal-close');
  
  // Close modal when clicking close button
  closeButtons.forEach(button => {
    button.addEventListener('click', () => {
      const modal = button.closest('.modal');
      if (modal) {
        modal.classList.remove('active');
      }
    });
  });
  
  // Close modal when clicking outside content
  modals.forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
      }
    });
  });
}

// Initialize home page on DOM content loaded
document.addEventListener('DOMContentLoaded', () => {
  if (checkAuth()) {
    initHomePage();
  }
});