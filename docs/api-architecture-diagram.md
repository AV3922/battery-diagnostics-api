
# Battery OS API Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                CLIENT                                    │
│                                                                          │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌──────────┐  │
│  │  Home Page  │    │  API List   │    │ API Detail  │    │ Dashboard │  │
│  └─────────────┘    └─────────────┘    └─────────────┘    └──────────┘  │
│             │              │                  │                │         │
└─────────────┼──────────────┼──────────────────┼────────────────┼─────────┘
              │              │                  │                │
              │              │                  │                │
              ▼              ▼                  ▼                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                              EXPRESS SERVER                              │
│                                                                          │
│  ┌─────────────────────────┐       ┌───────────────────────────────┐    │
│  │      Routes (TS)        │       │       Authentication          │    │
│  │                         │       │                               │    │
│  │  - /api/users           │◄──────┤  - API Key Validation        │    │
│  │  - /api/diagnostics     │       │                               │    │
│  │  - /api/v1/diagnostics  │       └───────────────────────────────┘    │
│  │  - /api/v1/alert-*      │                    ▲                       │
│  │  - /health (proxy)      │                    │                       │
│  └────────────┬────────────┘                    │                       │
│               │                                 │                        │
└───────────────┼─────────────────────────────────┼────────────────────────┘
                │                                 │
                ▼                                 │
┌───────────────────────────────┐     ┌──────────────────────────────────┐
│      Storage Layer (TS)       │     │               Database           │
│                               │     │                                  │
│  - getUserByApiKey            │◄────┤  - PostgreSQL (via Drizzle ORM) │
│  - createUser                 │     │                                  │
│  - createDiagnostic           │     │  ┌────────────┐ ┌─────────────┐ │
│  - getDiagnostics             │     │  │   users    │ │  battery_   │ │
│  - createAlertThreshold       │     │  │            │ │ diagnostics │ │
│  - getAlertThresholds         │     │  └────────────┘ └─────────────┘ │
│  - acknowledgeAlert           │     │                                  │
│                               │     │  ┌────────────┐ ┌─────────────┐ │
└───────────────────────────────┘     │  │   alert_   │ │   alert_    │ │
                │                      │  │ thresholds │ │  history    │ │
                │                      │  └────────────┘ └─────────────┘ │
                │                      └──────────────────────────────────┘
                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                              FASTAPI SERVER                              │
│                                                                          │
│  ┌─────────────────────────┐       ┌───────────────────────────────┐    │
│  │       Endpoints         │       │         Models (Pydantic)     │    │
│  │                         │       │                               │    │
│  │  - /                    │       │  - SOCRequest                 │    │
│  │  - /health              │◄──────┤  - SOHRequest                 │    │
│  │  - /battery/diagnose/*  │       │  - ResistanceRequest          │    │
│  │  - /battery/logs        │       │  - etc.                       │    │
│  └────────────┬────────────┘       └───────────────────────────────┘    │
│               │                                                          │
└───────────────┼──────────────────────────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         BATTERY DIAGNOSTICS                              │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                     Core Diagnostic Functions                    │    │
│  │                                                                  │    │
│  │  ┌────────────────┐ ┌────────────────┐ ┌────────────────────┐   │    │
│  │  │ calculate_soc  │ │ calculate_soh  │ │ measure_internal_  │   │    │
│  │  │                │ │                │ │    resistance      │   │    │
│  │  └────────────────┘ └────────────────┘ └────────────────────┘   │    │
│  │                                                                  │    │
│  │  ┌────────────────┐ ┌────────────────┐ ┌────────────────────┐   │    │
│  │  │ analyze_       │ │ check_cell_    │ │ monitor_safety     │   │    │
│  │  │ capacity_fade  │ │ balance        │ │                    │   │    │
│  │  └────────────────┘ └────────────────┘ └────────────────────┘   │    │
│  │                                                                  │    │
│  │  ┌────────────────┐ ┌────────────────┐ ┌────────────────────┐   │    │
│  │  │ analyze_       │ │ estimate_      │ │ detect_faults      │   │    │
│  │  │ thermal        │ │ cycle_life     │ │                    │   │    │
│  │  └────────────────┘ └────────────────┘ └────────────────────┘   │    │
│  │                                                                  │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                     Battery Specifications                       │    │
│  │                                                                  │    │
│  │  ┌────────────────┐ ┌────────────────┐ ┌────────────────────┐   │    │
│  │  │    Li-ion      │ │      LFP       │ │     Lead-acid      │   │    │
│  │  └────────────────┘ └────────────────┘ └────────────────────┘   │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

## System Architecture Overview

The Battery OS API is structured as a multi-tier application:

1. **Client Layer**
   - React-based web interface
   - Pages: Home, API List, API Detail, Dashboard
   - Uses Wouter for routing and Tanstack Query for data fetching
   - Features matte black gradient styling for dark mode UI

2. **Express Server (Node.js)**
   - Handles API routes for user management and diagnostics storage
   - Manages alert thresholds and alert history
   - Proxies health check to FastAPI
   - Manages authentication via API keys
   - Communicates with the database

3. **Storage Layer**
   - Interface between Express server and PostgreSQL database
   - User authentication and diagnostic data storage
   - Alert threshold management and notification handling
   - Uses Drizzle ORM for database operations

4. **FastAPI Server (Python)**
   - Handles battery diagnostic calculations
   - Exposes endpoints for SOC, SOH, and resistance calculations
   - Uses Pydantic for request validation

5. **Battery Diagnostics Module**
   - Core battery analysis calculations
   - Provides various diagnostic functions
   - Contains battery specifications for different types
   - Implements algorithms for estimating battery status

6. **Database**
   - PostgreSQL database
   - Tables: users, battery_diagnostics, alert_thresholds, alert_history
   - Stores user information, diagnostic results, and alert configurations

## Communication Flow

1. Client makes requests to Express or directly to FastAPI
2. Express handles user authentication and data storage
3. FastAPI processes battery diagnostic calculations
4. Battery Diagnostics module performs the core analysis
5. Results are returned to the client through the appropriate server
6. Alerts are generated based on configured thresholds

## API Categories

- **Electrical Parameters**: SOC, SOH, internal resistance
- **Thermal Analysis**: Temperature monitoring, thermal runaway risk
- **Safety Monitoring**: Fault detection, safety status
- **Lifetime Estimation**: Capacity fade, cycle life prediction
- **Alert Management**: Threshold configuration, notification delivery
