#!/bin/bash

# get first argument as the step name (e.g. "major", "minor", "patch")
increment_type=$1

# check if the increment type is valid
if [ "$increment_type" != "major" ] && [ "$increment_type" != "minor" ] && [ "$increment_type" != "patch" ]; then
  echo "Invalid increment type. Please use 'major', 'minor', or 'patch'. You gave increment type: $increment_type"
  exit 1
fi

echo "Increment type: $increment_type"

# read in deno version from ../deno.json, increment it, and write it back to the file
deno_version=$(jq -r '.version' ./deno.json)  # Use -r to remove quotes

echo "Current Deno version is $deno_version"

get_next_version() {
  local RE='[^0-9]*\([0-9]*\)[.]\([0-9]*\)[.]\([0-9]*\)\([0-9A-Za-z-]*\)'

  if [ -z "$increment_type" ]; then
    increment_type="patch"
  fi

  local MAJOR=$(echo $deno_version | sed -e "s#$RE#\1#")
  local MINOR=$(echo $deno_version | sed -e "s#$RE#\2#")
  local PATCH=$(echo $deno_version | sed -e "s#$RE#\3#")

  case "$increment_type" in
  major)
    ((MAJOR += 1))
    MINOR=0
    PATCH=0
    ;;
  minor)
    ((MINOR += 1))
    PATCH=0
    ;;
  patch)
    ((PATCH += 1))
    ;;
  esac

  local NEXT_VERSION="$MAJOR.$MINOR.$PATCH"
  echo "$NEXT_VERSION"
}

next_version=$(get_next_version)

echo "Incrementing Deno version from $deno_version to $next_version"

jq ".version = \"$next_version\"" ./deno.json >./deno.json.tmp

mv ./deno.json.tmp ./deno.json

rm -f ./deno.json.tmp

echo "Finished incrementing version"


