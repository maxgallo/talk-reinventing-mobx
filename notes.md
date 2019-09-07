# Setup
- 25 visible lines (maybe less?)
- tmux: `set status off`

# Live Code Flow

1. implement observable & autorun
2. add React, run parcel and browsh
3. implement observer

# Live Code Times

1. 19 minutes (live coding, speed-run)
2. 20 minutes (live coding, speed-run)
3. 13 minutes + 10 bugfix (live coding, speed-run)
4. 15 minutes (live coding, speed-run)
5. 19 minutes (live coding, some talking)
6. 32 minutes (full talk, no errors)
    - 16: finished mobx
    - 24: start observer

# Ideas to speed up
1. Prepare two tmux windows (node, web)

# Processes
1. `nodemon index.js`
2. `parcel index.html`
3. `browsh --startup-url http://localhost:1234`

# Browsh issues
kill 1:
```
kill -9 (ps aux | grep headless | grep Firefox | awk '{print $2}')
```

kill 2:
```
killall firefox
```

# VIM folds
- `zf` creates the fold (in visual mode)
- `za` fold / unfold
- `zd` deletes the fold
- `zE` deletes all folds
