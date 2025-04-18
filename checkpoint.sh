#!/bin/bash

# Get current date in YYYY-MM-DD_HHMMSS format
date_str=$(date +"%Y-%m-%d_%H:%M:%S")

# Run the command and redirect both stdout and stderr to the file
npm run main -- -a > "./checkpoints/${date_str}.txt" 2>&1

echo "Output has been saved to ./checkpoints/${date_str}.txt"