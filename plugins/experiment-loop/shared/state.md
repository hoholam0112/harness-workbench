# state.json

`docs/agent/loops/<loop-id>/state.json` — the minimum for resume-after-interruption
and handoff to the next loop. Update on every stage transition, escalation,
and job start.

`loop-id` = zero-padded sequence + slug, e.g. `003-lora-rank-sweep`.

```json
{
  "loop_id": "003-lora-rank-sweep",
  "stage": 3,
  "status": "in_progress",
  "start_commit": "a1b2c3d",
  "current_task": "eval harness (task 4/6)",
  "artifacts": {"experiment_design": "docs/agent/loops/003-lora-rank-sweep/experiment-design.md"},
  "jobs": [{"command": "python train.py ...", "pid": 12345, "log": "docs/agent/loops/003-lora-rank-sweep/logs/train.log", "outputs": "runs/003/"}],
  "pending_decisions": [],
  "handoff_notes": null
}
```

`status`: `in_progress` | `awaiting_user_review` | `escalated` | `done`.
Extend fields as needed; keep these as the minimum.
