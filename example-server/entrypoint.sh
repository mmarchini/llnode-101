#!/bin/bash

ulimit -c unlimited;
npm start;
"$@";
