// Unified Social Sandbox: Twitter & Instagram Frontend Clones Controller

// Application State
const state = {
  activeUserId: localStorage.getItem('omnicompose_user_id') || '60c72b2f9b1d8e1234567890',
  currentUser: null,
  simulatedUserIds: [
    '60c72b2f9b1d8e1234567890',
    '60c72b2f9b1d8e1234567891',
    '60c72b2f9b1d8e1234567892'
  ],
  users: [],
  tweets: [],
  composerPosts: [], // Instagram and drafts
  activeWorkspace: localStorage.getItem('omnicompose_workspace') || 'twitter',
  
  // Modals state
  replyingToTweetId: null,
  editingPostId: null
};

// Endpoints
const API = {
  composer: '/api/composer-posts',
  tweets: '/api/tweets',
  users: '/api/users',
  auth: '/api/auth'
};

// DOM Nodes
const els = {
  body: document.body,
  // Workspace Switchers
  switchBtnTwitter: document.getElementById('switch-btn-twitter'),
  switchBtnInstagram: document.getElementById('switch-btn-instagram'),
  twWorkspace: document.getElementById('twitter-workspace'),
  igWorkspace: document.getElementById('instagram-workspace'),

  // Shared elements
  toastContainer: document.getElementById('toast-container'),

  // Modal: Account Switcher
  accountSwitcherModal: document.getElementById('account-switcher-modal'),
  modalAccountsContainer: document.getElementById('modal-accounts-container'),
  modalAddUserForm: document.getElementById('modal-add-user-form'),
  modalUserDisplay: document.getElementById('m-user-display'),
  modalUserUsername: document.getElementById('m-user-username'),
  modalUserEmail: document.getElementById('m-user-email'),

  // ==========================================
  // TWITTER ELEMENTS
  // ==========================================
  twUserDisplayName: document.getElementById('tw-user-display-name'),
  twUserHandle: document.getElementById('tw-user-handle'),
  twTweetTextarea: document.getElementById('tw-tweet-textarea'),
  twCharCounter: document.getElementById('tw-char-counter'),
  btnPostTweet: document.getElementById('btn-post-tweet'),
  twTimelineTweets: document.getElementById('tw-timeline-tweets'),
  twSimulatorAccounts: document.getElementById('tw-simulator-accounts'),
  btnTwSidebarPost: document.getElementById('btn-tw-sidebar-post'),
  
  // Twitter Reply Modal
  twReplyModal: document.getElementById('tw-reply-modal'),
  twModalParentTweet: document.getElementById('tw-modal-parent-tweet'),
  twReplyTextarea: document.getElementById('tw-reply-textarea'),
  twReplyCharCounter: document.getElementById('tw-reply-char-counter'),
  btnPostTwReply: document.getElementById('btn-post-tw-reply'),

  // ==========================================
  // INSTAGRAM ELEMENTS
  // ==========================================
  igUserHandleName: document.getElementById('ig-user-handle-name'),
  igUserDisplayFullname: document.getElementById('ig-user-display-fullname'),
  igFeedPosts: document.getElementById('ig-feed-posts'),
  igSimulatedSuggestions: document.getElementById('ig-simulated-suggestions'),
  btnIgSidebarCreate: document.getElementById('btn-ig-sidebar-create'),

  // Instagram Create Post Modal
  igCreateModal: document.getElementById('ig-create-modal'),
  igComposerForm: document.getElementById('ig-composer-form'),
  igPostId: document.getElementById('ig-post-id'),
  igPostTitle: document.getElementById('ig-post-title'),
  igPostDesc: document.getElementById('ig-post-desc'),
  igComposerCharCount: document.getElementById('ig-composer-char-count'),
  igPostMedia: document.getElementById('ig-post-media'),
  igMediaDropzone: document.getElementById('ig-media-dropzone'),
  igUploadPlaceholder: document.getElementById('ig-upload-placeholder-content'),
  igUploadPreview: document.getElementById('ig-upload-preview-container'),
  igPreviewMediaWrapper: document.getElementById('ig-preview-media-wrapper'),
  igPostStatus: document.getElementById('ig-post-status'),
  igScheduleTimeGroup: document.getElementById('ig-schedule-time-group'),
  igPostSchedule: document.getElementById('ig-post-schedule'),
  igPostPlatform: document.getElementById('ig-post-platform'),
  btnIgSubmitPost: document.getElementById('btn-ig-submit-post'),
  igModalUsername: document.getElementById('ig-modal-username'),
  
  // New Action Buttons
  btnIgSaveDraft: document.getElementById('btn-ig-save-draft'),
  btnIgPostNow: document.getElementById('btn-ig-post-now'),
  btnIgSchedulePost: document.getElementById('btn-ig-schedule-post')
};

// ----------------------------------------------------
// INITIALIZATION
// ----------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  setupWorkspaceSwitcher();
  setupTwitterComposer();
  setupInstagramComposerForm();
  setupAccountSandbox();
  
  // Initial Hydration
  initializeAllData();
});

async function initializeAllData() {
  await hydrateUserContexts();
  fetchTweets();
  fetchInstagramPosts();
}

// ----------------------------------------------------
// WORKSPACE SWITCHER
// ----------------------------------------------------
function setupWorkspaceSwitcher() {
  const switchWorkspace = (target) => {
    state.activeWorkspace = target;
    localStorage.setItem('omnicompose_workspace', target);
    
    if (target === 'twitter') {
      els.body.className = 'twitter-theme';
      els.switchBtnTwitter.classList.add('active');
      els.switchBtnInstagram.classList.remove('active');
      els.twWorkspace.classList.remove('hidden');
      els.igWorkspace.classList.add('hidden');
      fetchTweets();
    } else {
      els.body.className = 'instagram-theme';
      els.switchBtnTwitter.classList.remove('active');
      els.switchBtnInstagram.classList.add('active');
      els.twWorkspace.classList.add('hidden');
      els.igWorkspace.classList.remove('hidden');
      fetchInstagramPosts();
    }
  };

  els.switchBtnTwitter.onclick = () => switchWorkspace('twitter');
  els.switchBtnInstagram.onclick = () => switchWorkspace('instagram');
  
  // Apply saved/default workspace
  switchWorkspace(state.activeWorkspace);
}

// Toast alerts
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  let icon = 'fa-info-circle';
  if (type === 'success') icon = 'fa-check-circle';
  if (type === 'error') icon = 'fa-exclamation-circle';
  
  toast.innerHTML = `
    <i class="fa-solid ${icon}"></i>
    <span>${message}</span>
  `;
  
  els.toastContainer.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'toastSlideIn var(--transition-fast) reverse';
    setTimeout(() => toast.remove(), 200);
  }, 4000);
}

// ----------------------------------------------------
// USER SANDBOX AND CONTEXT SIMULATION
// ----------------------------------------------------
async function hydrateUserContexts() {
  state.users = [];
  
  // Custom user IDs saved in localStorage
  const storedIds = localStorage.getItem('omnicompose_custom_users');
  if (storedIds) {
    try {
      const parsed = JSON.parse(storedIds);
      state.simulatedUserIds = [...new Set([...state.simulatedUserIds, ...parsed])];
    } catch (e) {
      console.error(e);
    }
  }

  // Retrieve user profiles
  for (const uid of state.simulatedUserIds) {
    try {
      const response = await fetch(`${API.users}/active/${uid}`);
      if (response.ok) {
        state.users.push(await response.json());
      }
    } catch (err) {
      console.warn(`User context loading failed for ID: ${uid}`);
    }
  }

  // Verify active user
  let active = state.users.find(u => u._id === state.activeUserId);
  if (!active && state.users.length > 0) {
    active = state.users[0];
    state.activeUserId = active._id;
    localStorage.setItem('omnicompose_user_id', active._id);
  }

  if (active) {
    state.currentUser = active;
    updateUIAccountDetails();
  }

  renderAccountWidgets();
}

function updateUIAccountDetails() {
  if (!state.currentUser) return;
  
  // Twitter Sidebar Footer Info
  els.twUserDisplayName.innerText = state.currentUser.displayName;
  els.twUserHandle.innerText = `@${state.currentUser.username}`;
  
  // Instagram Sidebar Switch Header
  els.igUserHandleName.innerText = state.currentUser.username;
  els.igUserDisplayFullname.innerText = state.currentUser.displayName;
  els.igModalUsername.innerText = state.currentUser.username;

  // Avatars
  const avatar = getAvatarUrl(state.currentUser.username);
  document.querySelectorAll('.current-user-avatar-sm').forEach(img => {
    img.src = avatar;
  });
}

function getAvatarUrl(username) {
  if (username === 'twitter_composer') return 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80';
  if (username === 'react_dev') return 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80';
  if (username === 'mongodb_fan') return 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80';
  return 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80';
}

function switchUserContext(userId) {
  state.activeUserId = userId;
  localStorage.setItem('omnicompose_user_id', userId);
  
  const user = state.users.find(u => u._id === userId);
  if (user) {
    state.currentUser = user;
    updateUIAccountDetails();
    showToast(`Switched active context to @${user.username}`, 'success');
    
    closeAccountSwitcherModal();
    renderAccountWidgets();
    
    // Re-render feed elements
    fetchTweets();
    fetchInstagramPosts();
  }
}

function renderAccountWidgets() {
  // Twitter right sidebar simulation list
  if (els.twSimulatorAccounts) {
    els.twSimulatorAccounts.innerHTML = '';
    state.users.forEach(user => {
      const isActive = user._id === state.activeUserId;
      const row = document.createElement('div');
      row.className = 'tw-user-suggestion';
      row.onclick = () => switchUserContext(user._id);
      row.innerHTML = `
        <img src="${getAvatarUrl(user.username)}" alt="${user.displayName}" class="tw-user-avatar">
        <div class="tw-profile-info">
          <span class="tw-profile-name">${escapeHTML(user.displayName)}</span>
          <span class="tw-profile-handle">@${user.username}</span>
        </div>
        <button class="btn-tw-switch ${isActive ? 'active' : ''}">
          ${isActive ? 'Active' : 'Switch'}
        </button>
      `;
      els.twSimulatorAccounts.appendChild(row);
    });
  }

  // Instagram right sidebar suggestions list
  if (els.igSimulatedSuggestions) {
    els.igSimulatedSuggestions.innerHTML = '';
    state.users.forEach(user => {
      if (user._id === state.activeUserId) return; // Hide self
      const row = document.createElement('div');
      row.className = 'ig-suggestion-item';
      row.innerHTML = `
        <img src="${getAvatarUrl(user.username)}" alt="${user.displayName}" class="ig-post-avatar">
        <div class="ig-profile-info">
          <span class="ig-profile-username">${user.username}</span>
          <span class="ig-profile-display">Suggested for you</span>
        </div>
        <button class="ig-action-link-btn text-blue" onclick="switchUserContext('${user._id}')">Switch</button>
      `;
      els.igSimulatedSuggestions.appendChild(row);
    });
  }
}

function setupAccountSandbox() {
  // Handle profile context trigger click to open switcher
  document.getElementById('tw-profile-trigger').onclick = () => showAccountSwitcherModal();
  
  els.modalAddUserForm.onsubmit = async (e) => {
    e.preventDefault();
    const displayName = els.modalUserDisplay.value.trim();
    const username = els.modalUserUsername.value.trim().toLowerCase();
    const email = els.modalUserEmail.value.trim().toLowerCase();
    
    try {
      const response = await fetch(`${API.auth}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName,
          username,
          email,
          password: 'simulationpassword123'
        })
      });
      
      const resData = await response.json();
      
      if (response.ok) {
        showToast(`Simulation account @${username} created in Atlas!`, 'success');
        
        // Save ID locally
        const storedIds = localStorage.getItem('omnicompose_custom_users') || '[]';
        const parsedIds = JSON.parse(storedIds);
        parsedIds.push(resData._id);
        localStorage.setItem('omnicompose_custom_users', JSON.stringify(parsedIds));
        
        els.modalAddUserForm.reset();
        await hydrateUserContexts();
        switchUserContext(resData._id);
      } else {
        showToast(resData.message || resData || 'Error creating profile', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('API network request failed.', 'error');
    }
  };
}

function showAccountSwitcherModal() {
  els.accountSwitcherModal.classList.remove('hidden');
  
  // Render switcher list inside modal
  els.modalAccountsContainer.innerHTML = '';
  state.users.forEach(user => {
    const isActive = user._id === state.activeUserId;
    const card = document.createElement('div');
    card.className = `tw-profile-footer ${isActive ? 'active' : ''}`;
    card.style.border = isActive ? '1px solid #1d9bf0' : '1px solid #2f3336';
    card.style.width = '100%';
    card.onclick = () => switchUserContext(user._id);
    
    card.innerHTML = `
      <img src="${getAvatarUrl(user.username)}" alt="Avatar" class="tw-user-avatar">
      <div class="tw-profile-info">
        <span class="tw-profile-name">${escapeHTML(user.displayName)}</span>
        <span class="tw-profile-handle">@${user.username}</span>
      </div>
      ${isActive ? '<i class="fa-solid fa-circle-check" style="color:#1d9bf0;"></i>' : ''}
    `;
    els.modalAccountsContainer.appendChild(card);
  });
}

function closeAccountSwitcherModal() {
  els.accountSwitcherModal.classList.add('hidden');
}

// ----------------------------------------------------
// TWITTER CLONE METHODS
// ----------------------------------------------------
function setupTwitterComposer() {
  els.twTweetTextarea.oninput = (e) => {
    const len = e.target.value.length;
    els.twCharCounter.innerText = 280 - len;
  };
  
  els.btnPostTweet.onclick = () => handlePostTweet();
  els.btnTwSidebarPost.onclick = () => {
    els.twTweetTextarea.focus();
    els.twTweetTextarea.scrollIntoView({ behavior: 'smooth' });
  };

  // Reply submission
  els.btnPostTwReply.onclick = async () => {
    const text = els.twReplyTextarea.value.trim();
    if (!text) return;
    
    try {
      const response = await fetch(`${API.tweets}/${state.replyingToTweetId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: state.activeUserId,
          text,
          reply: true,
          replyTo: state.replyingToTweetId
        })
      });
      
      if (response.ok) {
        showToast('Reply posted successfully!', 'success');
        closeTwitterReplyModal();
        fetchTweets();
      }
    } catch (err) {
      console.error(err);
      showToast('Error replying to tweet', 'error');
    }
  };

  els.twReplyTextarea.oninput = (e) => {
    const len = e.target.value.length;
    els.twReplyCharCounter.innerText = 280 - len;
  };
}

async function handlePostTweet() {
  const text = els.twTweetTextarea.value.trim();
  if (!text) return;

  try {
    const response = await fetch(`${API.tweets}/new`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: state.activeUserId,
        text,
        reply: false
      })
    });
    
    if (response.ok) {
      showToast('Your tweet was posted!', 'success');
      els.twTweetTextarea.value = '';
      els.twCharCounter.innerText = '280';
      fetchTweets();
      hydrateUserContexts();
    }
  } catch (err) {
    console.error(err);
    showToast('Failed to connect to API.', 'error');
  }
}

async function fetchTweets() {
  try {
    const response = await fetch(`${API.tweets}/timeline/all`);
    if (response.ok) {
      state.tweets = await response.json();
      renderTwitterFeed();
    }
  } catch (err) {
    console.error(err);
  }
}

function renderTwitterFeed() {
  els.twTimelineTweets.innerHTML = '';
  
  if (state.tweets.length === 0) {
    els.twTimelineTweets.innerHTML = `
      <div class="tw-tweet-card" style="justify-content:center; text-align:center; padding: 40px 16px;">
        <div class="tw-tweet-main" style="color:var(--text-muted)">
          <i class="fa-solid fa-feather-pointed" style="font-size:2rem; margin-bottom:12px;"></i>
          <h3>No tweets yet</h3>
          <p>Be the first one to post a tweet in this workspace sandbox!</p>
        </div>
      </div>
    `;
    return;
  }

  // Sort tweets newest first
  const sorted = [...state.tweets].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));

  sorted.forEach(tweet => {
    const card = document.createElement('div');
    card.className = 'tw-tweet-card';
    card.onclick = () => openTwitterReplyModal(tweet._id);
    
    const author = state.users.find(u => u._id === tweet.userId) || {
      displayName: 'External Account',
      username: 'anonymous'
    };

    const isLiked = tweet.likes.includes(state.activeUserId);
    const dateStr = new Date(tweet.createdAt).toLocaleDateString(undefined, {
      month: 'short', day: 'numeric'
    });

    card.innerHTML = `
      <img src="${getAvatarUrl(author.username)}" alt="Avatar" class="tw-user-avatar">
      <div class="tw-tweet-main">
        <div class="tw-tweet-author">
          <span class="tw-author-name">${escapeHTML(author.displayName)}</span>
          <span class="tw-author-handle">@${author.username}</span>
          <span class="tw-tweet-dot">·</span>
          <span class="tw-tweet-time">${dateStr}</span>
        </div>
        <p class="tw-tweet-body">${escapeHTML(tweet.text)}</p>
        
        <div class="tw-tweet-actions" onclick="event.stopPropagation()">
          <button class="tw-tweet-action-btn" onclick="openTwitterReplyModal('${tweet._id}')">
            <i class="fa-regular fa-comment"></i>
            <span>${tweet.replies ? tweet.replies.length : 0}</span>
          </button>
          <button class="tw-tweet-action-btn" title="Retweet">
            <i class="fa-solid fa-arrows-rotate"></i>
            <span>${tweet.retweets ? tweet.retweets.length : 0}</span>
          </button>
          <button class="tw-tweet-action-btn ${isLiked ? 'liked' : ''}" onclick="toggleLikeTweet('${tweet._id}', ${isLiked})">
            <i class="${isLiked ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
            <span>${tweet.likes ? tweet.likes.length : 0}</span>
          </button>
          <button class="tw-tweet-action-btn"><i class="fa-regular fa-bookmark"></i></button>
        </div>
      </div>
    `;

    els.twTimelineTweets.appendChild(card);
  });
}

async function toggleLikeTweet(tweetId, isLiked) {
  const url = isLiked ? `${API.tweets}/${tweetId}/unlike` : `${API.tweets}/${tweetId}/like`;
  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: state.activeUserId })
    });
    if (response.ok) {
      fetchTweets();
    }
  } catch (err) {
    console.error(err);
  }
}

function openTwitterReplyModal(tweetId) {
  state.replyingToTweetId = tweetId;
  els.twReplyTextarea.value = '';
  els.twReplyCharCounter.innerText = '280';
  
  const tweet = state.tweets.find(t => t._id === tweetId);
  if (tweet) {
    const author = state.users.find(u => u._id === tweet.userId) || {
      displayName: 'External Account',
      username: 'anonymous'
    };
    els.twModalParentTweet.innerHTML = `
      <img src="${getAvatarUrl(author.username)}" alt="Avatar" class="tw-user-avatar">
      <div class="tw-tweet-main">
        <div class="tw-tweet-author">
          <span class="tw-author-name">${escapeHTML(author.displayName)}</span>
          <span class="tw-author-handle">@${author.username}</span>
        </div>
        <p class="tw-tweet-body" style="font-size:0.9rem; margin-top:4px;">${escapeHTML(tweet.text)}</p>
      </div>
    `;
  }
  
  els.twReplyModal.classList.remove('hidden');
}

function closeTwitterReplyModal() {
  els.twReplyModal.classList.add('hidden');
  state.replyingToTweetId = null;
}

// ----------------------------------------------------
// INSTAGRAM CLONE METHODS
// ----------------------------------------------------
function setupInstagramComposerForm() {
  // Navigation sidebar click triggers modal
  els.btnIgSidebarCreate.onclick = (e) => {
    e.preventDefault();
    openInstagramCreateModal();
  };

  // Caption character counters
  els.igPostDesc.oninput = (e) => {
    const len = e.target.value.length;
    const countSpan = document.getElementById('ig-composer-char-count');
    if (countSpan) countSpan.innerText = len;
  };

  // Platform selection modifies limits dynamically
  els.igPostPlatform.onchange = (e) => {
    const platform = e.target.value;
    const limitSpan = document.querySelector('.ig-char-counter');
    const currentLen = els.igPostDesc.value.length;
    if (platform === 'twitter') {
      limitSpan.innerHTML = `<span id="ig-composer-char-count">${currentLen}</span> / 280`;
    } else if (platform === 'instagram') {
      limitSpan.innerHTML = `<span id="ig-composer-char-count">${currentLen}</span> / 2,200`;
    } else {
      limitSpan.innerHTML = `<span id="ig-composer-char-count">${currentLen}</span> / 5,000`;
    }
  };

  // File Drag-Drop
  els.igPostMedia.onchange = (e) => {
    const file = e.target.files[0];
    if (file) handleInstagramMediaSelection(file);
  };

  els.igMediaDropzone.ondragover = (e) => {
    e.preventDefault();
    els.igMediaDropzone.style.background = '#1a1a1a';
  };

  els.igMediaDropzone.ondragleave = () => {
    els.igMediaDropzone.style.background = '#121212';
  };

  els.igMediaDropzone.ondrop = (e) => {
    e.preventDefault();
    els.igMediaDropzone.style.background = '#121212';
    const file = e.dataTransfer.files[0];
    if (file) {
      els.igPostMedia.files = e.dataTransfer.files;
      handleInstagramMediaSelection(file);
    }
  };

  // Wire up action buttons
  els.btnIgSaveDraft.onclick = () => {
    els.igPostStatus.value = 'draft';
    els.igScheduleTimeGroup.classList.add('hidden');
    els.igPostSchedule.removeAttribute('required');
    els.igComposerForm.requestSubmit();
  };

  els.btnIgPostNow.onclick = () => {
    els.igPostStatus.value = 'posted';
    els.igScheduleTimeGroup.classList.add('hidden');
    els.igPostSchedule.removeAttribute('required');
    els.igComposerForm.requestSubmit();
  };

  els.btnIgSchedulePost.onclick = () => {
    const isHidden = els.igScheduleTimeGroup.classList.contains('hidden');
    if (isHidden) {
      els.igScheduleTimeGroup.classList.remove('hidden');
      els.igPostSchedule.setAttribute('required', 'true');
      showToast("Select date/time, then click Schedule again to confirm.", "info");
      els.igPostSchedule.focus();
    } else {
      if (!els.igPostSchedule.value) {
        showToast("Please choose a date and time to schedule this post.", "error");
        return;
      }
      els.igPostStatus.value = 'scheduled';
      els.igComposerForm.requestSubmit();
    }
  };

  // Form submit operations
  els.igComposerForm.onsubmit = async (e) => {
    e.preventDefault();

    // 1. Enforce constraints
    const platform = els.igPostPlatform.value;
    const descLen = els.igPostDesc.value.length;

    // Character limit verification
    if (platform === 'twitter' && descLen > 280) {
      showToast("Twitter posts are limited to 280 characters!", "error");
      return;
    }
    if (platform === 'instagram' && descLen > 2200) {
      showToast("Instagram captions are limited to 2,200 characters!", "error");
      return;
    }
    if (platform === 'reddit' && descLen > 5000) {
      showToast("Reddit posts are limited to 5,000 characters!", "error");
      return;
    }

    // Media size validation (Max 10MB)
    const file = els.igPostMedia.files[0];
    if (file) {
      const maxSizeBytes = 10 * 1024 * 1024;
      if (file.size > maxSizeBytes) {
        showToast("Upload failed: File exceeds the 10MB size limit!", "error");
        return;
      }
    }

    const formData = new FormData(els.igComposerForm);
    if (els.igPostStatus.value !== 'scheduled') {
      formData.delete('scheduleAt');
    }

    const isEdit = !!state.editingPostId;
    const url = isEdit ? `${API.composer}/${state.editingPostId}` : API.composer;
    const method = isEdit ? 'PUT' : 'POST';

    try {
      // Disable action buttons
      document.querySelectorAll('.btn-ig-action').forEach(btn => btn.setAttribute('disabled', 'true'));

      const response = await fetch(url, {
        method,
        body: formData
      });
      
      if (response.ok) {
        showToast(isEdit ? 'Draft updated successfully!' : 'Shared to Instagram feed!', 'success');
        closeInstagramCreateModal();
        fetchInstagramPosts();
      } else {
        const err = await response.json();
        showToast(err.message || 'Action failed.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('API connection error', 'error');
    } finally {
      document.querySelectorAll('.btn-ig-action').forEach(btn => btn.removeAttribute('disabled'));
    }
  };
}

function handleInstagramMediaSelection(file) {
  // Enforce size limit
  if (file.size > 10 * 1024 * 1024) {
    showToast("File size exceeds 10MB limit!", "error");
    clearInstagramSelectedMedia();
    return;
  }

  showInstagramMediaPreview(file);

  // Validate aspect ratio for images
  if (file.type.startsWith('image/')) {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const ratio = img.width / img.height;
        if (ratio < 0.79 || ratio > 1.92) {
          showToast("Tip: Instagram suggests aspect ratios between 4:5 and 1.91:1.", "info");
        }
      };
    };
    reader.readAsDataURL(file);
  }
}

function showInstagramMediaPreview(file) {
  els.igUploadPlaceholder.classList.add('hidden');
  els.igUploadPreview.classList.remove('hidden');
  els.igPreviewMediaWrapper.innerHTML = '';

  const reader = new FileReader();
  reader.onload = (event) => {
    if (file.type.startsWith('image/')) {
      const img = document.createElement('img');
      img.src = event.target.result;
      els.igPreviewMediaWrapper.appendChild(img);
    } else if (file.type.startsWith('video/')) {
      const vid = document.createElement('video');
      vid.src = event.target.result;
      vid.controls = true;
      els.igPreviewMediaWrapper.appendChild(vid);
    }
  };
  reader.readAsDataURL(file);
}

function clearInstagramSelectedMedia(event) {
  if (event) event.stopPropagation();
  els.igPostMedia.value = '';
  els.igUploadPlaceholder.classList.remove('hidden');
  els.igUploadPreview.classList.add('hidden');
  els.igPreviewMediaWrapper.innerHTML = '';
}

function openInstagramCreateModal() {
  resetInstagramForm();
  els.igCreateModal.classList.remove('hidden');
}

function closeInstagramCreateModal() {
  els.igCreateModal.classList.add('hidden');
  resetInstagramForm();
}

function resetInstagramForm() {
  state.editingPostId = null;
  els.igComposerForm.reset();
  clearInstagramSelectedMedia();
  els.igPostId.value = '';
  els.igComposerCharCount.innerText = '0';
  els.igScheduleTimeGroup.classList.add('hidden');
  document.querySelector('.ig-modal-header h3').innerText = 'Create new post';
  els.igPostStatus.value = 'draft';
  
  const limitSpan = document.querySelector('.ig-char-counter');
  if (limitSpan) {
    limitSpan.innerHTML = `<span id="ig-composer-char-count">0</span> / 2,200`;
  }
}

async function fetchInstagramPosts() {
  try {
    const response = await fetch(API.composer);
    if (response.ok) {
      state.composerPosts = await response.json();
      renderInstagramFeed();
    }
  } catch (err) {
    console.error(err);
  }
}

function renderInstagramFeed() {
  els.igFeedPosts.innerHTML = '';
  
  // Filter for posts destined/scheduled for Instagram
  const igPosts = state.composerPosts.filter(p => p.platform === 'instagram');
  
  if (igPosts.length === 0) {
    els.igFeedPosts.innerHTML = `
      <div class="ig-post-card" style="text-align:center; padding:50px 10px; border:none; color:var(--text-muted)">
        <i class="fa-solid fa-camera" style="font-size:3rem; margin-bottom:14px;"></i>
        <h3>No Instagram posts</h3>
        <p>Use the 'Create' sidebar option to post photos or videos!</p>
      </div>
    `;
    return;
  }

  igPosts.forEach(post => {
    const card = document.createElement('div');
    card.className = 'ig-post-card';
    
    // Resolve author avatar (default to active user if anonymous/custom)
    const author = state.users[0] || { displayName: 'Guest User', username: 'instagram_guest' };
    
    // Fetch simulated likes & comments stored in localStorage (Mongoose schema doesn't hold these)
    const postLikesKey = `ig_likes_count_${post._id}`;
    let likes = parseInt(localStorage.getItem(postLikesKey)) || Math.floor(Math.random() * 25) + 12;
    const userLikedKey = `ig_user_liked_${post._id}_${state.activeUserId}`;
    let isLikedByMe = localStorage.getItem(userLikedKey) === 'true';

    const postCommentsKey = `ig_comments_arr_${post._id}`;
    let comments = [];
    try {
      comments = JSON.parse(localStorage.getItem(postCommentsKey)) || [];
    } catch (e) {}

    // Resolve Media tag (image or video)
    let mediaHTML = '';
    if (post.mediaUrl) {
      const fullUrl = post.mediaUrl.startsWith('http') ? post.mediaUrl : post.mediaUrl;
      if (post.mediaUrl.endsWith('.mp4') || post.mediaUrl.endsWith('.webm')) {
        mediaHTML = `<video src="${fullUrl}" autoplay loop muted playsinline></video>`;
      } else {
        mediaHTML = `<img src="${fullUrl}" alt="Instagram Image">`;
      }
    } else {
      mediaHTML = `<div style="height:350px; background:#121212; display:flex; align-items:center; justify-content:center; color:#555;"><i class="fa-regular fa-image" style="font-size:3rem;"></i></div>`;
    }

    const timeAgoStr = new Date(post.createdAt).toLocaleDateString(undefined, {
      month: 'short', day: 'numeric'
    });

    // Populate HTML structure
    card.innerHTML = `
      <div class="ig-post-header">
        <div class="ig-post-author-info">
          <img src="${getAvatarUrl(author.username)}" alt="Avatar" class="ig-post-avatar">
          <span class="ig-post-username">${author.username}</span>
        </div>
        <div style="display:flex; gap:10px;">
          <button class="ig-post-opts-btn" onclick="startEditInstagramPost('${post._id}')" title="Edit Post"><i class="fa-solid fa-pen-to-square"></i></button>
          <button class="ig-post-opts-btn" onclick="deleteInstagramPost('${post._id}')" style="color:var(--accent-danger);" title="Delete Post"><i class="fa-solid fa-trash-can"></i></button>
        </div>
      </div>
      
      <div class="ig-post-media" ondblclick="handleInstagramDoubleTap(this, '${post._id}')">
        ${mediaHTML}
      </div>
      
      <div class="ig-post-actions">
        <div class="ig-post-icons-left">
          <button class="ig-post-icon-btn ${isLikedByMe ? 'liked' : ''}" onclick="toggleInstagramLike(this, '${post._id}')">
            <i class="${isLikedByMe ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
          </button>
          <button class="ig-post-icon-btn"><i class="fa-regular fa-comment"></i></button>
          <button class="ig-post-icon-btn"><i class="fa-regular fa-paper-plane"></i></button>
        </div>
        <button class="ig-post-icon-btn"><i class="fa-regular fa-bookmark"></i></button>
      </div>

      <div class="ig-post-likes">
        <span class="likes-count">${likes}</span> likes
      </div>

      <div class="ig-post-caption">
        <span class="caption-username">${author.username}</span>
        <span class="caption-text"><strong>${escapeHTML(post.title)}</strong> - ${escapeHTML(post.description)}</span>
      </div>

      <div class="ig-post-comments-summary" onclick="toggleCommentsList(this)">
        View all ${comments.length} comments
      </div>

      <div class="ig-comment-section hidden">
        <div class="comments-list">
          ${comments.map(c => `
            <div class="ig-comment-item">
              <span class="comment-username">${escapeHTML(c.username)}</span>
              <span class="comment-text">${escapeHTML(c.text)}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="ig-post-time">
        ${timeAgoStr.toUpperCase()}
      </div>

      <form class="ig-add-comment-form" onsubmit="handleInstagramSubmitComment(event, '${post._id}')">
        <input type="text" class="ig-comment-input" placeholder="Add a comment..." required>
        <button type="submit" class="btn-ig-comment-submit">Post</button>
      </form>
    `;

    els.igFeedPosts.appendChild(card);
  });
}

function toggleCommentsList(btn) {
  const section = btn.nextElementSibling;
  section.classList.toggle('hidden');
}

// Simulated liking (Since schema doesn't hold likes)
function toggleInstagramLike(btn, postId) {
  const postLikesKey = `ig_likes_count_${postId}`;
  const userLikedKey = `ig_user_liked_${postId}_${state.activeUserId}`;
  
  let likes = parseInt(localStorage.getItem(postLikesKey)) || 42;
  let isLiked = localStorage.getItem(userLikedKey) === 'true';

  if (isLiked) {
    likes = Math.max(0, likes - 1);
    localStorage.setItem(userLikedKey, 'false');
    btn.classList.remove('liked');
    btn.querySelector('i').className = 'fa-regular fa-heart';
  } else {
    likes += 1;
    localStorage.setItem(userLikedKey, 'true');
    btn.classList.add('liked');
    btn.querySelector('i').className = 'fa-solid fa-heart';
  }
  
  localStorage.setItem(postLikesKey, likes.toString());
  btn.closest('.ig-post-card').querySelector('.likes-count').innerText = likes;
}

function handleInstagramDoubleTap(mediaDiv, postId) {
  // Create quick animations for double tap like
  const heart = document.createElement('i');
  heart.className = 'fa-solid fa-heart';
  heart.style.position = 'absolute';
  heart.style.fontSize = '4.5rem';
  heart.style.color = '#fff';
  heart.style.opacity = '0';
  heart.style.transform = 'scale(0.5)';
  heart.style.transition = 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
  
  mediaDiv.style.position = 'relative';
  mediaDiv.appendChild(heart);

  // Trigger anim
  setTimeout(() => {
    heart.style.opacity = '0.9';
    heart.style.transform = 'scale(1)';
  }, 10);

  // Remove heart
  setTimeout(() => {
    heart.style.opacity = '0';
    heart.style.transform = 'scale(1.2)';
    setTimeout(() => heart.remove(), 200);
  }, 700);

  const likeBtn = mediaDiv.nextElementSibling.querySelector('.ig-post-icons-left button');
  const userLikedKey = `ig_user_liked_${postId}_${state.activeUserId}`;
  const isLiked = localStorage.getItem(userLikedKey) === 'true';
  
  if (!isLiked) {
    toggleInstagramLike(likeBtn, postId);
  }
}

// Simulated comment submission
function handleInstagramSubmitComment(event, postId) {
  event.preventDefault();
  const form = event.target;
  const input = form.querySelector('.ig-comment-input');
  const text = input.value.trim();
  if (!text) return;

  const postCommentsKey = `ig_comments_arr_${postId}`;
  let comments = [];
  try {
    comments = JSON.parse(localStorage.getItem(postCommentsKey)) || [];
  } catch (e) {}

  comments.push({
    username: state.currentUser.username,
    text: text
  });

  localStorage.setItem(postCommentsKey, JSON.stringify(comments));
  input.value = '';

  // Refresh feed to update comments summary
  fetchInstagramPosts();
}

async function startEditInstagramPost(postId) {
  try {
    const response = await fetch(`${API.composer}/${postId}`);
    if (response.ok) {
      const post = await response.json();
      state.editingPostId = post._id;
      
      openInstagramCreateModal();
      document.querySelector('.ig-modal-header h3').innerText = 'Edit post info';
      if (els.btnIgSubmitPost) els.btnIgSubmitPost.innerText = 'Update';

      els.igPostId.value = post._id;
      els.igPostTitle.value = post.title;
      els.igPostDesc.value = post.description;
      els.igComposerCharCount.innerText = post.description.length;
      els.igPostStatus.value = post.status;
      els.igPostPlatform.value = post.platform;
      els.igPostPlatform.dispatchEvent(new Event('change'));

      // File attachment check
      clearInstagramSelectedMedia();
      if (post.mediaUrl) {
        els.igUploadPlaceholder.classList.add('hidden');
        els.igUploadPreview.classList.remove('hidden');
        
        const fullUrl = post.mediaUrl.startsWith('http') ? post.mediaUrl : post.mediaUrl;
        if (post.mediaUrl.endsWith('.mp4') || post.mediaUrl.endsWith('.webm')) {
          els.igPreviewMediaWrapper.innerHTML = `<video src="${fullUrl}" controls autoplay loop muted></video>`;
        } else {
          els.igPreviewMediaWrapper.innerHTML = `<img src="${fullUrl}" alt="Media">`;
        }
      }

      // ScheduleAt field
      if (post.status === 'scheduled' && post.scheduleAt) {
        els.igScheduleTimeGroup.classList.remove('hidden');
        els.igPostSchedule.setAttribute('required', 'true');
        
        const dateObj = new Date(post.scheduleAt);
        const yyyy = dateObj.getFullYear();
        const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
        const dd = String(dateObj.getDate()).padStart(2, '0');
        const hh = String(dateObj.getHours()).padStart(2, '0');
        const min = String(dateObj.getMinutes()).padStart(2, '0');
        els.igPostSchedule.value = `${yyyy}-${mm}-${dd}T${hh}:${min}`;
      } else {
        els.igScheduleTimeGroup.classList.add('hidden');
        els.igPostSchedule.removeAttribute('required');
      }
    }
  } catch (err) {
    console.error(err);
    showToast('Failed to load post for editing.', 'error');
  }
}

async function deleteInstagramPost(postId) {
  if (!confirm('Are you sure you want to delete this Instagram post?')) return;
  
  try {
    const response = await fetch(`${API.composer}/${postId}`, {
      method: 'DELETE'
    });
    
    if (response.ok) {
      showToast('Post deleted successfully.', 'success');
      fetchInstagramPosts();
    }
  } catch (err) {
    console.error(err);
    showToast('Error connecting to backend API.', 'error');
  }
}

// ----------------------------------------------------
// UTILS
// ----------------------------------------------------
function escapeHTML(str) {
  if (!str) return '';
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}
