#!/bin/bash
# strict mode http://redsymbol.net/articles/unofficial-bash-strict-mode/
set -euo pipefail
IFS=$'\n\t'

nyc=./node_modules/.bin/nyc
ava=./node_modules/.bin/ava

if [ ! -z ${CI:-} ]; then
  $nyc $ava --tap=${CI-false} | tap-xunit > $CIRCLE_TEST_REPORTS/ava/ava.xml
else
  $nyc $ava
fi

