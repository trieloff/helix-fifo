#!/bin/bash
while http POST https://helix-fifo.rockerduck.workers.dev/best du=$(date +%s) --check-status;
do
    echo "queue appended"
done