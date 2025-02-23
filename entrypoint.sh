#!/bin/bash
# entrypoint.sh

# Start Tor in the background and discard its output
tor -f /etc/tor/torrc > /dev/null 2>&1 &

# Give Tor a few seconds to fully start
sleep 5

# Launch the Node.js application
exec node index.js
