# Contributing to oh-my-pi

Thanks for your interest in contributing! Here's how to get started.

## Local Installation

```bash
pi install ~/Code/oh-my-pi
```

This links the package so changes are reflected immediately.

## Running Tests

```bash
pnpx tsx --test tests/*.test.ts
```

All tests must pass before submitting changes.

## Adding Skills

1. Create a new directory under `skills/` with your skill name.
2. Add a `SKILL.md` file at `skills/<name>/SKILL.md`.
3. Include a clear `description` field so pi knows when to invoke it.
4. Document any required tools, inputs, and expected behavior.

## Adding Extensions

1. Create a new file at `extensions/<name>.ts`.
2. Register the extension in `package.json` under the appropriate field.
3. Export the required interface for pi to load it.

## General Guidelines

- Keep changes focused — one feature or fix per PR.
- Write tests for new functionality.
- Follow existing code style and conventions.
- Update documentation if your change affects usage.
