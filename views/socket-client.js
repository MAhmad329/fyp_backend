const io = require('socket.io-client');
const socket = io('http://localhost:3000'); // Replace with your server URL


console.log("this is working")
// Replace 'userId' with the actual user ID
socket.emit('user online', { userId: '65ea17769f05aea349d98eed' });

socket.on('individual chat message', (message) => {
  console.log('Individual chat message received:', message);
});


// Client
socket.emit('test event', { message: 'Hello from client' });




console.log("this is working")

socket.on('team chat message', (message) => {
  console.log('Team chat message received:', message);
});
