#!/bin/bash
# strict mode http://redsymbol.net/articles/unofficial-bash-strict-mode/
set -euo pipefail
IFS=$'\n\t'


source "scripts/env.sh"

babel="./node_modules/.bin/babel"

build () {
  $babel "$SRC_DIR" --out-dir "$OUT_DIR" $@
}

build $@
