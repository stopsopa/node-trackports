
#!/bin/bash

THISFILE=${BASH_SOURCE[0]}
DIR="$( cd "$( dirname "${THISFILE}" )" && pwd -P )"

function _datetime {

    date "+%Y-%m-%d-%H-%M-%S"
}

function test {

    FILE="$1/test-file-$(_datetime)"

    # echo ">>$FILE<<"

    if [ -f "$FILE" ]; then

        unlink "$FILE"
    fi

    if [ -f "$FILE" ]; then

        echo "file $FILE shouldn't exist";

        exit 1
    fi

    touch "$FILE"

    if [ ! -f "$FILE" ]; then

        echo "file $FILE should now exist but it doesn't exist, maybe due to wrong access permissions";

        exit 1
    fi

    unlink "$FILE"

    if [ -f "$FILE" ]; then

        echo "file $FILE shouldn't exist - after successful creation";

        exit 1
    fi

    echo "have write permissions $1"
}


TEST="$DIR/cron/logs";

test $TEST


TEST="$DIR/public/logs";

test $TEST

