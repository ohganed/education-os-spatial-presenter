# World Expansion Rules

## Core rule

A world may grow indefinitely, but a location that has already been used for learning must not be casually reassigned or moved.

## Scene graph

The app does not hard-code `Study Room -> Kitchen -> ...` in the engine. Every place is a Scene with an ID, and movement is a Connection from a hotspot to another Scene ID.

Example:

```text
Entrance Hall A
├─ Study Room
├─ Kitchen
└─ Future Wing -> Hall B
                   ├─ Room 05
                   ├─ Room 06
                   └─ next expansion area
```

This removes any fixed room-count limit.

## World Lock

Once a room has been used as a memory location:

- keep its room ID stable;
- keep its location in the world stable;
- keep major landmarks stable;
- do not silently replace it with a different room;
- create a new world version for breaking spatial changes.

Code may evolve. A learned spatial map should remain stable.

## Expansion rule

New rooms are added by attaching new Scene IDs to unused doors, corridors, stairs, floors, garden paths, or explicit expansion hubs. Existing learned routes do not need to be rewritten.

## Exit views

Study Room and Kitchen demonstrate a useful convention:

- Entry / Explore View: may contain knowledge hotspots.
- Exit View: contains no knowledge; its main role is navigation back to the previous hub.

This is a convention, not an engine limitation.

## Consistency gate

`src/engine/validateWorld.ts` checks references before use:

- start scene exists;
- every scene references an existing room;
- turn targets exist;
- navigation targets exist;
- navigation hotspots have targets;
- knowledge IDs exist.

The Teacher Guide and status bar show `GRAPH CHECK: PASS` when the manifest is structurally consistent.

## Asset separation

Scene data and image assets are separate. `Scene.asset` can later point to the fixed background image for that scene without changing navigation or knowledge mappings.
