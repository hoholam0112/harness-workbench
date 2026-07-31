# PRD: <project name>

## Background
<!-- Why this project exists; the current situation -->

## Problem
<!-- The specific problem to solve -->

## Goals
<!-- Measurable outcomes -->

## Non-Goals
<!-- Explicitly out of scope -->

## Success Metrics
<!-- How success is measured -->

## Serving Requirements
<!-- Will this project's model be deployed to serve requests? This answer
     decides whether every later loop must measure serving numbers, so state it
     explicitly.

     If YES, give the targets — each one a number the project can be judged
     against:
     - Latency: target p50 and p95, and the condition they must hold under
       (hardware, batch size, concurrent requests, typical input size). A
       latency target without its condition cannot be verified.
     - Throughput: target requests (or tokens) per second, under the same
       stated condition.
     - Cost ceiling: per-request inference cost, and the monthly running-cost
       ceiling. State the traffic volume the monthly figure assumes — without
       it the number means nothing.

     If NO, write "No serving" and one sentence of why (e.g. one-off offline
     analysis; results consumed as a static report). Later loops then record
     "N/A" for serving with this reason. -->

## Constraints
<!-- Data, compute, deadlines, dependencies -->
