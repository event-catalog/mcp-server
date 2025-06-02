#!/bin/bash

# Run npm build
npm run build

# Quit the Claude app
osascript -e 'quit app "Claude"'

sleep 1

# Reopen the Claude app
open -a "Claude"
