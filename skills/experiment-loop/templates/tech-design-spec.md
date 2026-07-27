# Tech Design Spec: <loop-id>

## Summary
<!-- One paragraph: what changes and why -->

## AS-IS
<!-- Current code relevant to this experiment, with file citations -->

## TO-BE
<!-- Target design; what is added or changed -->

## Acceptance Criteria (Technical)
<!-- Each criterion: the exact command, metric, and threshold that decides it -->

## Serving Measurement Plan
<!-- How the serving targets in the design doc's Constraints get turned into
     real numbers. Serving figures need their measurement CONDITION to mean
     anything, which is why this is its own section and not a row in the table
     above.

     For each of latency, throughput, and cost:
     - the exact command that measures it;
     - the measurement condition — hardware, batch size, concurrent requests,
       input length, request count, and warm-up runs discarded. Match the
       condition the design doc's target was stated under; if it cannot be
       matched, say so and say what is measured instead;
     - the output file the result is written to (the report cites this file);
     - the threshold that decides pass/fail.

     Latency: report p50 and p95, not just the mean — a mean hides the tail
     that users actually feel.

     Cost covers three separate things; say how each is computed:
     - per-request inference cost — from the measured throughput and the
       hardware hourly rate, or the API price list;
     - this loop's one-off training/tuning cost — GPU-hours x rate, or the API
       spend for this loop's runs;
     - the monthly running-cost estimate — state the traffic volume it assumes
       and where that assumption came from (the PRD, the user, a measured
       baseline). An estimate without its traffic assumption is not usable.

     If the design doc says this loop measures no serving numbers, write "N/A"
     and repeat that one-sentence reason. -->

## Verification Plan
<!-- Code review focus areas; test approach -->
