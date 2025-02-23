#!/bin/bash
# entrypoint.sh

# Start Tor in the background using the custom torrc file
tor -f /etc/tor/torrc &

# Give Tor a few seconds to fully start
sleep 5

# Launch the Node.js application
exec node index.js
