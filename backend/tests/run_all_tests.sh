#!/bin/bash

# Run all tests in the Quartermaster project
echo "Running all Quartermaster tests..."

# Change to the backend directory if not already there
cd "$(dirname "$0")/.."

# Run the tests using AdonisJS test command
node ace test

echo "All tests completed." 