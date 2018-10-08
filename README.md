# llnode-101

🕵️‍♀️ Learn llnode inside a Docker container!

## Overview

llnode is pre-installed in this container, so you don't have to worry about
installing lldb and llnode. It also comes with an example web server with two
known bugs, so you can use llnode to diagnose and fix them!

## Starting the container

```
docker run --rm --privileged -it -p 3000:3000 mmarchini/llnode-101:latest
```

  - `docker run` runs a Docker container
  - `--rm` remove the container after it stops
  - `--privileged` let's you perform some kernel operations. Required to 
    generate on-demand core dumps
  - `-it` to run the container in interactive mode
  - `-p 3000:3000` to expose port 3000 on `localhost`
  - `mmarchini/llnode-101:latest` to use this workshop's Docker image

## Running the web server

Inside the docker container:

```
node --abort-on-uncaught-exception --max-old-space-size=256 index.js
```

Recommended `node` flags:

  - `--abort-on-uncaught-exception` to generate a core dump on crash
  - `--max-old-space-size=256` limit heap size, useful if llnode is 
    taking too much time to analize a core dump


## Generating Core Dumps

There are essentially two ways to create core dumps on Unix systems: on-demand
and on crash. On-demand core dumps are generated on user request and they might
freeze the proess while generating the core dump file (which should be fast)
and resume the process once the core is generated.

On crash core dumps are generated when there's a fatal error on the process.
Common scenarios are segmentation fauls, invalid memory access and out of
memory kills. The operating system will take a core dump of the process and
kill it right after that.

### On-demand

To generate core dumps of a running process, you can use gcore:

```
gcore {PID}  # will generate `./core.{PID}`
``` 

### On crash

To generate core dumps when your process crashes:

```
ulimit -c unlimited
node --abort-on-uncaught-exception --max-old-space-size=256 index.js
# will generate `./core` on crash
``` 

## Running llnode

```
llnode node -c ./core
```

## Exercises

### Uncaught error - Circular JSON.stringify

To reproduce this failure, create a monster and edit it.

<details><summary>Hints</summary>
<p>

You can track down this bug with `v8 bt`, `v8 inspect -s`, 
`v8 findjsinstances -n 10 -d` and `v8 inspect`.

</p>
</details>

[Solution](solutions/circular-object.md)

### Out of Memory crash

To reproduce this failure, create a monster with low anthropomorpicness (for
example, 5).

<details><summary>Hints</summary>
<p>

You can track down this bug with `v8 findjsobjects`, `v8 findjsinstances -n 10`
and `v8 findrefs`. You might also find `v8 bt` output useful.

</p>
</details>

[Solution](solutions/out-of-memory.md)
