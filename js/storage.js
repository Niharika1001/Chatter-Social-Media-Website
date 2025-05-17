/**
 * Data storage and manipulation functions
 */

// Create a new user
function createUser(email, username, password) {
  // Get existing users
  const users = JSON.parse(localStorage.getItem('users')) || [];
  
  // Check if email already exists
  if (users.some(user => user.email === email)) {
    return { success: false, message: 'Email already in use' };
  }
  
  // Check if username already exists
  if (users.some(user => user.username === username)) {
    return { success: false, message: 'Username already taken' };
  }
  
  // Create new user object
  const newUser = {
    id: generateId(),
    email,
    username,
    password, // In a real app, this would be hashed!
    profileImage: null,
    followers: [],
    following: [],
    createdAt: Date.now()
  };
  
  // Add to users array
  users.push(newUser);
  
  // Save to localStorage
  localStorage.setItem('users', JSON.stringify(users));
  
  return { success: true, user: { ...newUser, password: undefined } };
}

// Authenticate user
function authenticateUser(email, password) {
  // Get users from localStorage
  const users = JSON.parse(localStorage.getItem('users')) || [];
  
  // Find user with matching email
  const user = users.find(user => user.email === email);
  
  // If no user found or password doesn't match
  if (!user || user.password !== password) {
    return { success: false, message: 'Invalid email or password' };
  }
  
  // Create session (don't include password in currentUser)
  const userSession = { ...user };
  delete userSession.password;
  
  // Store in localStorage
  localStorage.setItem('currentUser', JSON.stringify(userSession));
  
  return { success: true, user: userSession };
}

// Update user profile
function updateUserProfile(userId, updates) {
  // Get users from localStorage
  const users = JSON.parse(localStorage.getItem('users')) || [];
  
  // Find user by ID
  const userIndex = users.findIndex(user => user.id === userId);
  
  if (userIndex === -1) {
    return { success: false, message: 'User not found' };
  }
  
  // Update user fields
  users[userIndex] = { ...users[userIndex], ...updates };
  
  // Save back to localStorage
  localStorage.setItem('users', JSON.stringify(users));
  
  // Update current user session if it's the logged-in user
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  if (currentUser && currentUser.id === userId) {
    const updatedSession = { ...currentUser, ...updates };
    localStorage.setItem('currentUser', JSON.stringify(updatedSession));
  }
  
  return { success: true, user: users[userIndex] };
}

// Create a new post
function createPost(userId, image, caption) {
  // Get posts from localStorage
  const posts = JSON.parse(localStorage.getItem('posts')) || [];
  
  // Create new post
  const newPost = {
    id: generateId(),
    userId,
    image,
    caption,
    likes: [],
    comments: [],
    createdAt: Date.now()
  };
  
  // Add to posts array (at the beginning for chronological order)
  posts.unshift(newPost);
  
  // Save to localStorage
  localStorage.setItem('posts', JSON.stringify(posts));
  
  return { success: true, post: newPost };
}

// Get all posts
function getAllPosts() {
  return JSON.parse(localStorage.getItem('posts')) || [];
}

// Get posts by user ID
function getUserPosts(userId) {
  const posts = JSON.parse(localStorage.getItem('posts')) || [];
  return posts.filter(post => post.userId === userId);
}

// Delete a post
function deletePost(postId, userId) {
  // Get posts from localStorage
  const posts = JSON.parse(localStorage.getItem('posts')) || [];
  
  // Find post
  const postIndex = posts.findIndex(post => post.id === postId);
  
  if (postIndex === -1) {
    return { success: false, message: 'Post not found' };
  }
  
  // Check if user is the owner of the post
  if (posts[postIndex].userId !== userId) {
    return { success: false, message: 'Not authorized to delete this post' };
  }
  
  // Remove post
  posts.splice(postIndex, 1);
  
  // Save back to localStorage
  localStorage.setItem('posts', JSON.stringify(posts));
  
  return { success: true };
}

// Update a post
function updatePost(postId, userId, updates) {
  // Get posts from localStorage
  const posts = JSON.parse(localStorage.getItem('posts')) || [];
  
  // Find post
  const postIndex = posts.findIndex(post => post.id === postId);
  
  if (postIndex === -1) {
    return { success: false, message: 'Post not found' };
  }
  
  // Check if user is the owner of the post
  if (posts[postIndex].userId !== userId) {
    return { success: false, message: 'Not authorized to update this post' };
  }
  
  // Update post
  posts[postIndex] = { ...posts[postIndex], ...updates };
  
  // Save back to localStorage
  localStorage.setItem('posts', JSON.stringify(posts));
  
  return { success: true, post: posts[postIndex] };
}

// Toggle like on a post
function toggleLike(postId, userId) {
  // Get posts from localStorage
  const posts = JSON.parse(localStorage.getItem('posts')) || [];
  
  // Find post
  const postIndex = posts.findIndex(post => post.id === postId);
  
  if (postIndex === -1) {
    return { success: false, message: 'Post not found' };
  }
  
  // Initialize likes array if it doesn't exist
  if (!posts[postIndex].likes) {
    posts[postIndex].likes = [];
  }
  
  // Check if user already liked the post
  const likeIndex = posts[postIndex].likes.indexOf(userId);
  
  if (likeIndex === -1) {
    // Add like
    posts[postIndex].likes.push(userId);
  } else {
    // Remove like
    posts[postIndex].likes.splice(likeIndex, 1);
  }
  
  // Save back to localStorage
  localStorage.setItem('posts', JSON.stringify(posts));
  
  return { 
    success: true, 
    liked: likeIndex === -1,
    post: posts[postIndex]
  };
}

// Add comment to post
function addComment(postId, userId, text) {
  // Get posts from localStorage
  const posts = JSON.parse(localStorage.getItem('posts')) || [];
  
  // Find post
  const postIndex = posts.findIndex(post => post.id === postId);
  
  if (postIndex === -1) {
    return { success: false, message: 'Post not found' };
  }
  
  // Initialize comments array if it doesn't exist
  if (!posts[postIndex].comments) {
    posts[postIndex].comments = [];
  }
  
  // Create comment
  const comment = {
    id: generateId(),
    userId,
    text,
    createdAt: Date.now(),
    replies: []
  };
  
  // Add comment
  posts[postIndex].comments.push(comment);
  
  // Save back to localStorage
  localStorage.setItem('posts', JSON.stringify(posts));
  
  // Create notification for post owner (if not self-commenting)
  if (userId !== posts[postIndex].userId) {
    addNotification(
      posts[postIndex].userId,
      userId,
      `commented on your post: "${text.length > 30 ? text.substring(0, 30) + '...' : text}"`,
      { type: 'comment', postId, commentId: comment.id }
    );
  }
  
  return { success: true, comment, post: posts[postIndex] };
}

// Update comment
function updateComment(postId, commentId, userId, text) {
  // Get posts from localStorage
  const posts = JSON.parse(localStorage.getItem('posts')) || [];
  
  // Find post
  const postIndex = posts.findIndex(post => post.id === postId);
  
  if (postIndex === -1) {
    return { success: false, message: 'Post not found' };
  }
  
  // Find comment
  const commentIndex = posts[postIndex].comments.findIndex(comment => comment.id === commentId);
  
  if (commentIndex === -1) {
    return { success: false, message: 'Comment not found' };
  }
  
  // Check if user is the owner of the comment
  if (posts[postIndex].comments[commentIndex].userId !== userId) {
    return { success: false, message: 'Not authorized to update this comment' };
  }
  
  // Update comment
  posts[postIndex].comments[commentIndex].text = text;
  
  // Save back to localStorage
  localStorage.setItem('posts', JSON.stringify(posts));
  
  return { success: true, comment: posts[postIndex].comments[commentIndex] };
}

// Delete comment
function deleteComment(postId, commentId, userId) {
  // Get posts from localStorage
  const posts = JSON.parse(localStorage.getItem('posts')) || [];
  
  // Find post
  const postIndex = posts.findIndex(post => post.id === postId);
  
  if (postIndex === -1) {
    return { success: false, message: 'Post not found' };
  }
  
  // Find comment
  const commentIndex = posts[postIndex].comments.findIndex(comment => comment.id === commentId);
  
  if (commentIndex === -1) {
    return { success: false, message: 'Comment not found' };
  }
  
  // Check if user is the owner of the comment
  if (posts[postIndex].comments[commentIndex].userId !== userId) {
    return { success: false, message: 'Not authorized to delete this comment' };
  }
  
  // Remove comment
  posts[postIndex].comments.splice(commentIndex, 1);
  
  // Save back to localStorage
  localStorage.setItem('posts', JSON.stringify(posts));
  
  return { success: true };
}

// Add reply to comment
function addReply(postId, commentId, userId, text) {
  // Get posts from localStorage
  const posts = JSON.parse(localStorage.getItem('posts')) || [];
  
  // Find post
  const postIndex = posts.findIndex(post => post.id === postId);
  
  if (postIndex === -1) {
    return { success: false, message: 'Post not found' };
  }
  
  // Find comment
  const commentIndex = posts[postIndex].comments.findIndex(comment => comment.id === commentId);
  
  if (commentIndex === -1) {
    return { success: false, message: 'Comment not found' };
  }
  
  // Create reply
  const reply = {
    id: generateId(),
    userId,
    text,
    createdAt: Date.now()
  };
  
  // Initialize replies array if it doesn't exist
  if (!posts[postIndex].comments[commentIndex].replies) {
    posts[postIndex].comments[commentIndex].replies = [];
  }
  
  // Add reply
  posts[postIndex].comments[commentIndex].replies.push(reply);
  
  // Save back to localStorage
  localStorage.setItem('posts', JSON.stringify(posts));
  
  // Create notification for comment owner (if not self-replying)
  const commentUserId = posts[postIndex].comments[commentIndex].userId;
  if (userId !== commentUserId) {
    addNotification(
      commentUserId,
      userId,
      `replied to your comment: "${text.length > 30 ? text.substring(0, 30) + '...' : text}"`,
      { type: 'reply', postId, commentId, replyId: reply.id }
    );
  }
  
  return { success: true, reply, comment: posts[postIndex].comments[commentIndex] };
}

// Toggle follow user
function toggleFollow(followerId, targetUserId) {
  // Get users from localStorage
  const users = JSON.parse(localStorage.getItem('users')) || [];
  
  // Find both users
  const followerIndex = users.findIndex(user => user.id === followerId);
  const targetUserIndex = users.findIndex(user => user.id === targetUserId);
  
  if (followerIndex === -1 || targetUserIndex === -1) {
    return { success: false, message: 'User not found' };
  }
  
  // Initialize arrays if they don't exist
  if (!users[followerIndex].following) {
    users[followerIndex].following = [];
  }
  
  if (!users[targetUserIndex].followers) {
    users[targetUserIndex].followers = [];
  }
  
  // Check if already following
  const isFollowing = users[followerIndex].following.includes(targetUserId);
  
  if (isFollowing) {
    // Unfollow
    users[followerIndex].following = users[followerIndex].following.filter(id => id !== targetUserId);
    users[targetUserIndex].followers = users[targetUserIndex].followers.filter(id => id !== followerId);
  } else {
    // Follow
    users[followerIndex].following.push(targetUserId);
    users[targetUserIndex].followers.push(followerId);
    
    // Create notification for target user
    addNotification(
      targetUserId,
      followerId,
      'started following you',
      { type: 'follow' }
    );
  }
  
  // Save back to localStorage
  localStorage.setItem('users', JSON.stringify(users));
  
  // Update current user session if it's the logged-in user
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  if (currentUser && currentUser.id === followerId) {
    currentUser.following = users[followerIndex].following;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
  }
  
  return { 
    success: true, 
    following: !isFollowing,
    follower: { ...users[followerIndex], password: undefined },
    target: { ...users[targetUserIndex], password: undefined }
  };
}

// Add notification
function addNotification(userId, fromUserId, message, metadata = {}) {
  // Get notifications from localStorage
  const notifications = JSON.parse(localStorage.getItem(`notifications_${userId}`)) || [];
  
  // Create notification
  const notification = {
    id: generateId(),
    fromUserId,
    message,
    read: false,
    timestamp: Date.now(),
    ...metadata
  };
  
  // Add to beginning of notifications
  notifications.unshift(notification);
  
  // Save back to localStorage
  localStorage.setItem(`notifications_${userId}`, JSON.stringify(notifications));
  
  return { success: true, notification };
}

// Get notifications for user
function getUserNotifications(userId) {
  return JSON.parse(localStorage.getItem(`notifications_${userId}`)) || [];
}

// Mark notification as read
function markNotificationAsRead(userId, notificationId) {
  // Get notifications from localStorage
  const notifications = JSON.parse(localStorage.getItem(`notifications_${userId}`)) || [];
  
  // Find notification
  const notificationIndex = notifications.findIndex(notification => notification.id === notificationId);
  
  if (notificationIndex === -1) {
    return { success: false, message: 'Notification not found' };
  }
  
  // Mark as read
  notifications[notificationIndex].read = true;
  
  // Save back to localStorage
  localStorage.setItem(`notifications_${userId}`, JSON.stringify(notifications));
  
  return { success: true, notification: notifications[notificationIndex] };
}

// Mark all notifications as read
function markAllNotificationsAsRead(userId) {
  // Get notifications from localStorage
  const notifications = JSON.parse(localStorage.getItem(`notifications_${userId}`)) || [];
  
  // Mark all as read
  const updatedNotifications = notifications.map(notification => ({
    ...notification,
    read: true
  }));
  
  // Save back to localStorage
  localStorage.setItem(`notifications_${userId}`, JSON.stringify(updatedNotifications));
  
  return { success: true, notifications: updatedNotifications };
}

// Delete notification
function deleteNotification(userId, notificationId) {
  // Get notifications from localStorage
  const notifications = JSON.parse(localStorage.getItem(`notifications_${userId}`)) || [];
  
  // Filter out notification
  const updatedNotifications = notifications.filter(notification => notification.id !== notificationId);
  
  // Save back to localStorage
  localStorage.setItem(`notifications_${userId}`, JSON.stringify(updatedNotifications));
  
  return { success: true };
}

// Clear all notifications
function clearAllNotifications(userId) {
  // Clear notifications
  localStorage.setItem(`notifications_${userId}`, JSON.stringify([]));
  
  return { success: true };
}