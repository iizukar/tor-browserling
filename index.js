const puppeteer = require('puppeteer');
const net = require('net');

const TOR_CONTROL_PORT = 9051; // Tor's control port
const TOR_PROXY = 'socks5://127.0.0.1:9050'; // Tor SOCKS5 proxy

// Function to signal Tor for a new circuit (NEWNYM)
function renewTorIdentity() {
  return new Promise((resolve, reject) => {
    // Explicitly set host to 127.0.0.1 to use IPv4
    const socket = net.connect({ host: '127.0.0.1', port: TOR_CONTROL_PORT }, () => {
      // Authenticate with an empty string (CookieAuthentication is disabled)
      socket.write('AUTHENTICATE ""\r\n');
    });
    let response = '';
    socket.on('data', (chunk) => {
      response += chunk.toString();
      // Once we get a "250 OK", send the NEWNYM signal
      if (response.includes('250 OK')) {
        socket.write('signal NEWNYM\r\n');
      }
      if (response.includes('250 signal')) {
        socket.end();
        resolve();
      }
    });
    socket.on('error', (err) => reject(err));
  });
}

async function runCycle() {
  try {
    console.log('Renewing Tor identity...');
    await renewTorIdentity();

    // Launch Puppeteer with Tor proxy settings.
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        `--proxy-server=${TOR_PROXY}`
      ],
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
    });

    const page = await browser.newPage();
    console.log('Navigating to target URL...');
    await page.goto(
      'https://www.browserling.com/browse/win10/chrome127/http://testingimp.great-site.net',
      { waitUntil: 'networkidle2' }
    );

    console.log('Page loaded. Waiting for 3 minutes...');
    await new Promise(resolve => setTimeout(resolve, 180000)); // Wait for 3 minutes

    await browser.close();
    console.log('Cycle complete.');
  } catch (error) {
    console.error('Error in cycle:', error);
  }
}

async function main() {
  while (true) {
    await runCycle();
  }
}

main();
