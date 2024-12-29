#!/bin/bash

# Rules for generating semantic versioning
# major: breaking change
# minor: feat, style
# patch: build, fix, perf, refactor, revert

DRY_RUN=false
LAST_TAG=$(git describe --tags --abbrev=0 --always)
PATTERN="^v[0-9]+\.[0-9]+\.[0-9]+$"

usage() {
 echo "Usage: ./scripts/auto-increment-deno-version.sh [OPTIONS]"
 echo "Options:"
 echo " -h, --help          Display this help message"
 echo " -d, --dry-run       Just print the next version without incrementing"
}

# Function to handle options and arguments
handle_options() {
  while [ $# -gt 0 ]; do
    case $1 in
      -h | --help)
        usage
        exit 0
        ;;
      -d | --dry-run)
        DRY_RUN=true
        shift
        ;;
      *)
        echo "Invalid option: $1" >&2
        usage
        exit 1
        ;;
    esac
    shift
  done
}

# Main script execution
handle_options "$@"


create_file() {
    local with_range=$1
    if [ -s messages.txt ]; then
        return 1
    fi
    if [ "$with_range" == "true" ]; then
        git log "$LAST_TAG"..HEAD --no-decorate --pretty=format:"%s" > messages.txt
    else
        git log --no-decorate --pretty=format:"%s" > messages.txt
    fi
}

get_commit_range() {
    if [[ $LAST_TAG =~ $PATTERN ]]; then
        create_file true
    else
        create_file
        LAST_TAG="v0.0.0"
    fi
    echo " " >> messages.txt
}

start() {
    echo "Last tag: $LAST_TAG"
    get_commit_range
    increment_type=""

    while read -r message; do
        if [[ $message =~ (([a-z]+)(\(.+\))?\!:)|(BREAKING CHANGE:) ]]; then
            increment_type="major"
            break
        elif [[ $message =~ (^(feat|style)(\(.+\))?:) ]]; then
            if [ -z "$increment_type" ] || [ "$increment_type" == "patch" ]; then
                increment_type="minor"
            fi
        elif [[ $message =~ ^((fix|build|perf|refactor|revert)(\(.+\))?:) ]]; then
            if [ -z "$increment_type" ]; then
                increment_type="patch"
            fi
        fi
    done < messages.txt

    if [ -z "$PREVENT_REMOVE_FILE" ]; then
        rm -f messages.txt
    fi

    if [ -n "$increment_type" ]; then
      if [ "$DRY_RUN" == "false" ]; then
        ./scripts/increment-deno-version.sh $increment_type
      else
        echo "Would have incremented version with type: $increment_type but DRY_RUN is enabled. To disable DRY_RUN, remove the -d, --dry-run flag."
      fi
    else
        echo "No changes requiring a version increment."
    fi
}

start
