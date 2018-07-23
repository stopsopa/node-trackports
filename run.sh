#!/bin/bash

THISFILE=${BASH_SOURCE[0]}
DIR="$( cd "$( dirname "${THISFILE}" )" && pwd -P )"

source "$DIR/.env"

function _datetime {

    date "+%Y-%m-%d %H:%M:%S"
}

function _date {

    date "+%Y-%m-%d"
}

function _time {

    date "+%H-%M-%S"
}

TIME="$(_datetime)";

LOGDIR="$DIR/public/logs/$(_date)"

mkdir -p "$LOGDIR"

LOGFILE="$LOGDIR/$(_time).log"

echo -e "-----v $TIME v----->>>\n" >> $LOGFILE

node "$DIR/server.js" --flag $FLAG-main 1>> $LOGFILE 2>> $LOGFILE

echo -e "<<<\nstopped with status code: $?\n-----^-----\n" >> $LOGFILE



