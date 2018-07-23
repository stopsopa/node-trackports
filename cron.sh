
#!/bin/bash

THISFILE=${BASH_SOURCE[0]}
DIR="$( cd "$( dirname "${THISFILE}" )" && pwd -P )"

cat << EOF

Now it is worth to add this command to crontab:

*   *   *   *   *   root    cd "${DIR}" && make status || make start

EOF

