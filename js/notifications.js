/**
 * Notifications related functionality
 */

// Initialize notifications panel
function initNotifications() {
  const notificationsBtn = document.getElementById('notifications-btn');
  const notificationsPanel = document.getElementById('notifications-panel');
  const closeNotificationsBtn = document.getElementById('close-notifications');
  const markAllReadBtn = document.getElementById('mark-all-read');
  const clearAllNotificationsBtn = document.getElementById('clear-all-notifications');
  const notificationsList = document.getElementById('notifications-list');
  const notificationCount = document.getElementById('notification-count');

  if (!notificationsBtn || !notificationsPanel) return;

  // Toggle notifications panel
  notificationsBtn.addEventListener('click', () => {
    notificationsPanel.classList.toggle('active');
    loadNotifications();
  });

  // Close notifications panel
  if (closeNotificationsBtn) {
    closeNotificationsBtn.addEventListener('click', () => {
      notificationsPanel.classList.remove('active');
    });
  }

  // Mark all notifications as read
  if (markAllReadBtn) {
    markAllReadBtn.addEventListener('click', () => {
      const currentUser = JSON.parse(localStorage.getItem('currentUser'));
      if (!currentUser) return;

      markAllNotificationsAsRead(currentUser.id);
      loadNotifications();
      updateNotificationCount();
    });
  }

  // Clear all notifications
  if (clearAllNotificationsBtn) {
    clearAllNotificationsBtn.addEventListener('click', () => {
      const currentUser = JSON.parse(localStorage.getItem('currentUser'));
      if (!currentUser) return;

      clearAllNotifications(currentUser.id);
      loadNotifications();
      updateNotificationCount();
    });
  }

  // Load notifications initially
  loadNotifications();
  updateNotificationCount();

  // Set interval to update notification count
  setInterval(updateNotificationCount, 60000); // Every minute
}

// Load notifications for current user
function loadNotifications() {
  const notificationsList = document.getElementById('notifications-list');
  if (!notificationsList) return;
  
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  if (!currentUser) return;
  
  const notifications = getUserNotifications(currentUser.id);
  
  notificationsList.innerHTML = '';
  
  if (notifications.length === 0) {
    notificationsList.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-bell-slash"></i>
        <p>No notifications yet</p>
      </div>
    `;
    return;
  }
  
  notifications.forEach(notification => {
    const notificationElement = createNotificationElement(notification);
    notificationsList.appendChild(notificationElement);
    
    // Add click event to mark as read
    notificationElement.addEventListener('click', (e) => {
      if (e.target.closest('.notification-delete')) return;
      
      if (!notification.read) {
        markNotificationAsRead(currentUser.id, notification.id);
        notificationElement.classList.add('read');
        updateNotificationCount();
      }
      
      // Handle click based on notification type
      if (notification.type === 'comment' || notification.type === 'reply') {
        // Navigate to post with comment
        window.location.href = `index.html?post=${notification.postId}`;
      } else if (notification.type === 'follow') {
        // Could navigate to user profile in future
      }
    });
    
    // Add delete button event
    const deleteBtn = notificationElement.querySelector('.notification-delete');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', () => {
        deleteNotification(currentUser.id, notification.id);
        notificationElement.remove();
        updateNotificationCount();
      });
    }
  });
}

// Update notification count badge
function updateNotificationCount() {
  const notificationCount = document.getElementById('notification-count');
  if (!notificationCount) return;
  
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  if (!currentUser) return;
  
  const notifications = getUserNotifications(currentUser.id);
  const unreadCount = notifications.filter(notification => !notification.read).length;
  
  if (unreadCount > 0) {
    notificationCount.textContent = unreadCount > 99 ? '99+' : unreadCount;
    notificationCount.classList.remove('hidden');
  } else {
    notificationCount.classList.add('hidden');
  }
}

// Initialize notifications on page load
document.addEventListener('DOMContentLoaded', () => {
  if (checkAuth()) {
    initNotifications();
  }
});