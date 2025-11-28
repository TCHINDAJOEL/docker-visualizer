# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Docker Visualizer is an interactive educational tool for learning Docker concepts. It provides a visual topology map of Docker containers, networks, and images with a simulated Docker environment running entirely in the browser. The application features two modes:
- **Beginner Mode**: Guided scenarios with step-by-step tutorials
- **Expert Mode**: Timeline view showing Docker events and operations

## Development Commands

```bash
# Start development server with HMR
npm run dev

# Build for production
npm run build

# Run ESLint
npm run lint

# Preview production build
npm run preview
```

## Architecture

### State Management
All application state lives in `App.jsx` and flows down through props (no Redux/Context). Key state includes:
- `containers`: Array of container objects with stats, status, network assignment
- `networks`: Available Docker networks (bridge, host, custom)
- `images`: Docker images available for container creation
- `timeline`: Event history for expert mode
- `hostInfo`: Simulated Docker host/daemon information
- `mode`: 'beginner' or 'expert' UI mode
- `activeView`: Current sidebar view ('dashboard', 'containers', 'host', etc.)
- `selectedItem`: ID of currently inspected container
- `activeScenario`: Current learning scenario (beginner mode only)

### Component Structure

**Layout Components** (`src/components/layout/`):
- `Header.jsx`: Top bar with mode toggle and branding
- `Sidebar.jsx`: Left navigation, scenarios (beginner), timeline (expert)

**Feature Components** (`src/components/features/`):
- `TopologyMap.jsx`: Visual network topology - renders networks as boxes containing containers
- `InspectorPanel.jsx`: Right panel showing container details, stats, logs, quick actions
- `Terminal.jsx`: Bottom terminal for Docker command execution
- `HostView.jsx`: Host/daemon information and system-wide operations

### Command Execution Engine

The `executeCommand()` function in `App.jsx` (lines 139-267) is the core simulation engine. It:
- Parses Docker CLI commands (run, stop, start, rm, ps, network create)
- Updates state to reflect command effects
- Validates operations (e.g., can't remove running container without `-f`)
- Simulates image pulling when image not found
- Tracks scenario progress in beginner mode
- Adds entries to terminal history and timeline

When adding new commands, follow the existing pattern:
1. Parse command arguments
2. Validate preconditions
3. Update relevant state arrays (containers/networks/images)
4. Add timeline event
5. Add terminal output to history
6. Check scenario step completion

### Real-time Simulation

A useEffect hook (App.jsx:101-130) runs every 2 seconds to:
- Update container CPU/memory stats with random variations
- Maintain rolling 20-point history for charts
- Update host CPU/memory load
- Only updates running containers (exited containers have stats frozen at 0)

### Data Flow for Container Creation

1. User types `docker run nginx` in Terminal or clicks "Execute Auto" in a scenario
2. `executeCommand()` parses the command
3. Checks if image exists in `images` state, simulates pull if not
4. Creates container object with generated ID, stats arrays, initial logs
5. Adds to `containers` state array
6. TopologyMap re-renders showing new container in its network
7. Timeline event added
8. Real-time simulation begins updating stats

## Styling

- **Framework**: Tailwind CSS with default configuration
- **Design System**: Dark theme (slate-900/950 backgrounds, blue accents)
- **Color Conventions**:
  - Green: Running containers, success states
  - Red: Stopped/exited containers, errors
  - Blue: Networks, selected items, primary actions
  - Purple: Memory usage
  - Yellow: Images

## Mock Data

`src/data/mockData.js` contains:
- `MOCK_IMAGES`: Pre-loaded Docker images (ubuntu, nginx, redis, node, postgres, wordpress)
- `SCENARIOS`: Learning paths with steps and commands for beginner mode

## Special Notes

- Uses `rolldown-vite@7.2.5` instead of standard Vite (see package.json overrides)
- No backend - entire Docker simulation runs in browser state
- Container IDs are generated with `generateId()` utility (8 char random string)
- French UI text throughout (scenarios, labels) - consider this when adding features
- No TypeScript - pure JavaScript/JSX with React 19
