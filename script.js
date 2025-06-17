document.getElementById('loginForm').addEventListener('submit', function (event) {
    event.preventDefault(); // Prevent form submission
  
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('error-message');
  
    // Simple validation for empty fields
    if (!username || !password) {
      errorMessage.textContent = 'Please fill in both fields!';
    } else {
      // Here you can add more complex validation or send a request to the server
      if (username === 'harshad waman' && password === '9011818144') {
        errorMessage.textContent = '';
        alert('Login Successful!');
      } else {
        errorMessage.textContent = 'Invalid username or password!';
      }
    }
  });
  
