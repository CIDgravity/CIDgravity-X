#!/bin/bash

GIT_DESCRIBE=$(git describe --tags $(git rev-parse HEAD) 2>/dev/null) # ex output: v3.1.9-3-gdc71b02 or empty if no tag/commit detected 

SEP='-g' # if present, it means this hash doesn't have a tag (we assume tags don't contain any '-g' char seq)*

# Check if git describe succeeded, otherwise return "dev"
if [[ -z "$GIT_DESCRIBE" ]]; then
    echo "dev"  # Return "dev" if no version is found
elif [[ "$GIT_DESCRIBE" == *"$SEP"* ]]; then
    # This hash doesn't have any tag associated to it
    echo $GIT_DESCRIBE | sed 's/.*-g//'
else
    # This hash has a tag
    echo $GIT_DESCRIBE
fi