#!/bin/sh
# runs every browser suite one after another and prints one summary line each (CHROME_PATH must be set)
ROOT=$(cd .. && pwd); case "$(uname)" in MINGW*|MSYS*) ROOT=$(cd .. && pwd -W);; esac
G="$ROOT/frontend/public/game/index.html"
for s in anim music fx store fairness regression movement live city citylife interiors drills career phone keys present; do
  f=game-$s.cjs; [ "$s" = live ] && f=game-livematch.cjs; [ "$s" = city ] && f=game-city.cjs
  [ -f "$f" ] || continue
  out=$(node "$f" "$G" 2>&1); code=$?
  pass=$(printf '%s\n' "$out" | grep -c '^PASS'); fail=$(printf '%s\n' "$out" | grep -c '^FAIL')
  echo "$s exit=$code pass=$pass fail=$fail"
  printf '%s\n' "$out" | grep '^FAIL' | cut -c1-220
done
for f in online-store online-google; do out=$(node $f.cjs 2>&1); code=$?; echo "$f exit=$code pass=$(printf '%s\n' "$out" | grep -c '^PASS') fail=$(printf '%s\n' "$out" | grep -c '^FAIL')"; printf '%s\n' "$out" | grep '^FAIL' | cut -c1-220; done
echo ALLDONE
