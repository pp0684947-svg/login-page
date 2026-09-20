const STORAGE_KEY = 'learnhubCurrentUser';
const USERS_KEY = 'learnhubUsers';

function readStorage(key, fallbackValue) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallbackValue;
  } catch (error) {
    return fallbackValue;
  }
}

const users = readStorage(USERS_KEY, {});

function saveUsers() {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function getCurrentUser() {
  return readStorage(STORAGE_KEY, null);
}

function setCurrentUser(user) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

function isAuthenticated() {
  return Boolean(getCurrentUser());
}

function signOut() {
  localStorage.removeItem(STORAGE_KEY);
  window.location.href = 'signin.html';
}

function signIn(email, password) {
  if (!users[email]) {
    return { success: false, message: 'No account found with that email.' };
  }
  if (users[email].password !== password) {
    return { success: false, message: 'Email or password is incorrect.' };
  }
  setCurrentUser(users[email]);
  return { success: true, message: 'Signed in successfully.' };
}

function registerUser(name, email, password) {
  if (users[email]) {
    return { success: false, message: 'An account already exists with that email.' };
  }
  const user = { name, email, password, track: 'Web Development', progress: 72 };
  users[email] = user;
  saveUsers();
  setCurrentUser(user);
  return { success: true, message: 'Registration complete. Welcome to LearnHub!' };
}

function handleSignInForm() {
  const form = document.querySelector('.signin-form');
  if (!form) return;
  const message = document.getElementById('signin-message');
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const email = form.email.value.trim().toLowerCase();
    const password = form.password.value;
    const result = signIn(email, password);
    message.textContent = result.message;
    message.style.color = result.success ? '#a7f3d0' : '#fca5a5';
    if (result.success) {
      window.location.href = 'profile.html';
    }
  });
}

function handleRegisterForm() {
  const form = document.querySelector('.register-form');
  if (!form) return;
  const message = document.getElementById('register-message');
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const name = form.name.value.trim();
    const email = form.email.value.trim().toLowerCase();
    const password = form.password.value;
    const result = registerUser(name, email, password);
    message.textContent = result.message;
    message.style.color = result.success ? '#a7f3d0' : '#fca5a5';
    if (result.success) {
      window.location.href = 'profile.html';
    }
  });
}

function handleSignOutButton() {
  const button = document.querySelector('.signout-button');
  if (!button) return;
  button.addEventListener('click', () => {
    signOut();
  });
}

function updateAuthNav() {
  const nav = document.querySelector('.site-nav');
  if (!nav) return;
  const isAuth = isAuthenticated();
  const signInLink = nav.querySelector('a[href="signin.html"]');
  const registerLink = nav.querySelector('a[href="register.html"]');
  const signOutButton = nav.querySelector('.signout-link');

  if (isAuth) {
    if (signInLink) signInLink.style.display = 'none';
    if (registerLink) registerLink.style.display = 'none';
    if (!signOutButton) {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = 'Sign Out';
      button.className = 'secondary-button signout-button signout-link';
      button.addEventListener('click', signOut);
      nav.appendChild(button);
    }
  } else {
    if (signInLink) signInLink.style.display = '';
    if (registerLink) registerLink.style.display = '';
    if (signOutButton) signOutButton.remove();
  }
}

function updateHomepageHero() {
  const user = getCurrentUser();
  const heroTitle = document.querySelector('.hero-copy h1');
  const heroSubtitle = document.querySelector('.hero-copy p');
  const heroPrimary = document.querySelector('.hero-actions .primary-button');
  const heroSecondary = document.querySelector('.hero-actions .secondary-button');
  if (!heroPrimary || !heroSecondary) return;

  if (user) {
    if (heroTitle) heroTitle.textContent = `Welcome back, ${user.name.split(' ')[0]}!`;
    if (heroSubtitle) heroSubtitle.textContent = `Continue your ${user.track} journey and access your progress dashboard.`;
    heroPrimary.textContent = 'View profile';
    heroPrimary.dataset.action = 'profile.html';

    if (user.progress >= 70) {
      heroSecondary.textContent = 'Download certificate';
      heroSecondary.dataset.action = 'certificate.html';
    } else {
      heroSecondary.textContent = 'Browse courses';
      heroSecondary.dataset.action = 'profile.html';
    }
  } else {
    if (heroTitle) heroTitle.textContent = 'Student courses, progress tracking, and certificates in one place.';
    if (heroSubtitle) heroSubtitle.textContent = 'Jump into curated learning paths, monitor your progress, and earn certificates to share with your peers.';
    heroPrimary.textContent = 'Sign In';
    heroPrimary.dataset.action = 'signin.html';
    heroSecondary.textContent = 'Register';
    heroSecondary.dataset.action = 'register.html';
  }
}

function updateProfilePage() {
  const user = getCurrentUser();
  if (!user) return;
  const profileName = document.querySelector('.profile-summary h1');
  const profileRole = document.querySelector('.profile-role');
  const profileEmail = document.querySelector('.profile-overview strong');
  const profileFields = document.querySelectorAll('.profile-detail strong');
  const avatar = document.querySelector('.avatar');

  if (profileName) profileName.textContent = user.name;
  if (profileRole) profileRole.textContent = `${user.track} learner • Active student since 2025`;
  if (profileEmail) profileEmail.textContent = user.email;
  if (profileFields[1]) profileFields[1].textContent = user.track;
  if (avatar) avatar.textContent = user.name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();
}

function redirectIfUnauthenticated() {
  const currentPage = window.location.pathname;
  const protectedPages = ['profile.html', 'certificate.html'];
  if (protectedPages.some((page) => currentPage.endsWith(page)) && !isAuthenticated()) {
    window.location.href = 'signin.html';
  }
}

function redirectIfAuthenticated() {
  const currentPage = window.location.pathname;
  if (isAuthenticated() && (currentPage.endsWith('signin.html') || currentPage.endsWith('register.html'))) {
    window.location.href = 'profile.html';
  }
}

function domReady(callback) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', callback);
  } else {
    callback();
  }
}

function initializeAuth() {
  domReady(() => {
    redirectIfUnauthenticated();
    redirectIfAuthenticated();
    updateAuthNav();
    handleSignInForm();
    handleRegisterForm();
    handleSignOutButton();
    updateProfilePage();
    updateHomepageHero();
    handleCertificatePage();
  });
}

function handleCertificatePage() {
  const button = document.getElementById('download-certificate-button');
  const statusText = document.getElementById('certificate-status-text');
  const nameField = document.getElementById('certificate-name');
  const courseField = document.getElementById('certificate-course');
  const dateField = document.getElementById('certificate-date');
  if (!button || !statusText || !nameField || !courseField || !dateField) return;

  const user = getCurrentUser();
  if (!user) {
    statusText.textContent = 'Please sign in to access your certificate.';
    button.disabled = true;
    return;
  }

  const isComplete = user.progress >= 70;
  nameField.textContent = user.name;
  courseField.textContent = `${user.track} Certificate`;
  dateField.textContent = new Date().toLocaleDateString();
  statusText.textContent = isComplete ? 'You are eligible to download your certificate.' : 'Complete more course work to unlock your certificate.';
  button.disabled = !isComplete;
  button.textContent = isComplete ? 'Download certificate image' : 'Complete course to unlock';

  button.addEventListener('click', () => {
    if (!isComplete) return;
    const width = 1200;
    const height = 900;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#2563eb');
    gradient.addColorStop(1, '#7c3aed');
    ctx.fillStyle = gradient;
    ctx.fillRect(40, 40, width - 80, height - 80);

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(80, 80, width - 160, height - 160);

    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 48px Poppins, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Certificate of Completion', width / 2, 180);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '24px Poppins, sans-serif';
    ctx.fillText('This certifies that', width / 2, 260);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 60px Poppins, sans-serif';
    ctx.fillText(user.name, width / 2, 340);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '24px Poppins, sans-serif';
    ctx.fillText(`has successfully completed the`, width / 2, 420);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 40px Poppins, sans-serif';
    ctx.fillText(user.track, width / 2, 490);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '24px Poppins, sans-serif';
    ctx.fillText(`on ${new Date().toLocaleDateString()}`, width / 2, 560);

    ctx.strokeStyle = '#c4b5fd';
    ctx.lineWidth = 4;
    ctx.strokeRect(120, 620, width - 240, 200);

    ctx.fillStyle = '#ffffff';
    ctx.font = '20px Poppins, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Issued by LearnHub', 180, 700);
    ctx.fillText('Verified certificate of completion', 180, 740);

    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = `${user.name.replace(/\s+/g, '_')}_${user.track.replace(/\s+/g, '_')}_certificate.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });
}
initializeAuth();
