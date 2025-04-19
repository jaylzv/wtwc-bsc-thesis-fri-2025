#!/bin/bash

if [ $# -eq 0 ]; then
  echo "Error: No command specified"
  echo "Usage: ./checkpoint.sh \"command to execute\""
  exit 1
fi

command_to_run="$1"
formatted_date=$(date +"%Y-%m-%d_%H:%M:%S")
eval $command_to_run > "./checkpoints/${formatted_date}.txt" 2>&1

echo "Command \"$command_to_run\" has been executed"
echo "Output has been saved to ./checkpoints/${formatted_date}.txt"
