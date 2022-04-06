#!/bin/bash
while http POST https://helix-fifo.rockerduck.workers.dev/best du=bidu;
do
    echo "queue appended"
done