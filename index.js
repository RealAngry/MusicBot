// runner.js
const { spawn } = require('child_process');

// Start main.js
const mainProcess = spawn('node', ['main.js'], { stdio: 'inherit' });

// Start status.js
const statusProcess = spawn('node', ['status.js'], { stdio: 'inherit' });

// Handle process exits
mainProcess.on('close', (code) => {
  console.log(`main.js process exited with code ${code}`);
});

statusProcess.on('close', (code) => {
  console.log(`status.js process exited with code ${code}`);
});

console.log('Both scripts are running...');