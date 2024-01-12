function authenticateWithAdminPassword() {
  const password = window.prompt(alert('Please enter the admin password'), {
    title: 'Admin Password',
    type: 'password',
    statusbar: true,
    buttons: { Ok: true, Cancel: false },
  });

  if (password === process.env.ADMIN_PASSWORD) {
    console.log('✅   correct password');
    return true;
  }
  authenticateWithAdminPassword();
}

module.exports = {
  authenticateWithAdminPassword,
};
