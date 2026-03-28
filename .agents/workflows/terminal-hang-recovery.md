---
description: How to handle terminal hang/freeze when run_command keeps getting cancelled
---

# Terminal Hang Recovery Workflow

// turbo-all

## Detection

If `run_command` returns "The user cancelled the command" **2 times in a row**, the terminal is in a corrupted state. Do NOT retry with variations — proceed to resolution immediately.

## Resolution: Batch File Approach

### Step 1: Write a batch script
Use `write_to_file` to create a `.bat` file with all commands needed:

```
write_to_file:
  TargetFile: <project_root>/temp_agent_script.bat
  Overwrite: true
  CodeContent: |
    @echo off
    cd /d <working_directory>
    <command_1>
    <command_2>
    echo AGENT_SCRIPT_DONE
```

### Step 2: Run as background command
```
run_command:
  CommandLine: cmd /c <path_to_bat_file>
  Cwd: C:\
  WaitMsBeforeAsync: 500
  SafeToAutoRun: false
```

### Step 3: Monitor execution
```
command_status:
  CommandId: <id_from_step_2>
  WaitDurationSeconds: 30
  OutputCharacterCount: 2000
```

### Step 4: Send interactive input if needed
```
send_command_input:
  CommandId: <id_from_step_2>
  Input: <input_text>
```

### Step 5: Cleanup
Delete the temp script after completion:
```
write_to_file or just leave it — user can delete later
```

## Rules

1. **2-strike rule**: Max 2 attempts with normal `run_command`. After 2 failures, switch to batch file approach.
2. **Never ignore**: Terminal hang must be addressed immediately. Do NOT skip and move on to other tasks.
3. **Never delegate**: Do NOT tell the user to run commands themselves without first trying the batch file approach.
4. **Always background**: For commands that may take >5 seconds, always use `WaitMsBeforeAsync: 500` and monitor with `command_status`.
5. **Transparency**: If all approaches fail, report to user with full list of attempted solutions.

## Tools That Always Work (No Terminal)

These tools bypass the terminal entirely and always work:
- `view_file` — read files
- `write_to_file` — create/write files (including .bat scripts)
- `replace_file_content` — edit code
- `multi_replace_file_content` — edit multiple locations
- `list_dir` — directory listing
- `grep_search` — code search
- `search_web` — web search
- `browser_subagent` — browser testing
- `generate_image` — image generation
