const test = require('node:test');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');

const path = require('node:path');

test('server starts even when MongoDB is unavailable', async () => {
  const appDir = path.resolve(__dirname, '..');
  const child = spawn(process.execPath, ['server.js'], {
    cwd: appDir,
    env: {
      ...process.env,
      DATABASE: 'mongodb://127.0.0.1:65535/project-management',
      PORT: '0',
      NODE_ENV: 'development',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  let output = '';
  let serverStarted = false;

  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      child.kill('SIGTERM');
      reject(new Error(`Timed out waiting for server startup. Output:\n${output}`));
    }, 20000);

    const onData = (chunk) => {
      output += chunk.toString();
      if (output.includes('Server running')) {
        serverStarted = true;
        child.kill('SIGTERM');
        clearTimeout(timeout);
        resolve();
      }
    };

    child.stdout.on('data', onData);
    child.stderr.on('data', onData);

    child.on('exit', (code, signal) => {
      clearTimeout(timeout);
      if (serverStarted) {
        resolve();
        return;
      }

      reject(new Error(`Server exited before startup. code=${code} signal=${signal}\n${output}`));
    });
  });

  assert.ok(output.includes('MongoDB unavailable') || output.includes('Server running'), {
    message: `Expected a graceful startup warning or running server output, got:\n${output}`,
  });
});
