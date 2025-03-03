from typing import List, Dict, Optional
import numpy as np
from datetime import datetime, timedelta

class BatteryDiagnostics:
    # Battery chemistry specifications
    BATTERY_TYPES = {
        # Li-ion battery types with specific voltages
        "Li-ion_11.1V": { "max_temp": 45, "min_temp": 0, "max_voltage": 12.6, "min_voltage": 8.25, "nominal_voltage": 11.1 },
        "Li-ion_14.8V": { "max_temp": 45, "min_temp": 0, "max_voltage": 16.8, "min_voltage": 10.0, "nominal_voltage": 14.8 },
        "Li-ion_24V": { "max_temp": 45, "min_temp": 0, "max_voltage": 29.4, "min_voltage": 19.2, "nominal_voltage": 24.0 },
        "Li-ion_36V": { "max_temp": 45, "min_temp": 0, "max_voltage": 42.0, "min_voltage": 27.5, "nominal_voltage": 36.0 },
        "Li-ion_48V": { "max_temp": 45, "min_temp": 0, "max_voltage": 54.6, "min_voltage": 35.7, "nominal_voltage": 48.0 },
        "Li-ion_51.8V": { "max_temp": 45, "min_temp": 0, "max_voltage": 58.8, "min_voltage": 38.5, "nominal_voltage": 51.8 },
        "Li-ion_59.2V": { "max_temp": 45, "min_temp": 0, "max_voltage": 67.2, "min_voltage": 44.0, "nominal_voltage": 59.2 },
        "Li-ion_62.9V": { "max_temp": 45, "min_temp": 0, "max_voltage": 71.4, "min_voltage": 46.7, "nominal_voltage": 62.9 },
        "Li-ion_72V": { "max_temp": 45, "min_temp": 0, "max_voltage": 84.0, "min_voltage": 55.0, "nominal_voltage": 72.0 },
        
        # LFP battery types with specific voltages
        "LFP_12.8V": { "max_temp": 55, "min_temp": -20, "max_voltage": 14.6, "min_voltage": 10.0, "nominal_voltage": 12.8 },
        "LFP_24V": { "max_temp": 55, "min_temp": -20, "max_voltage": 29.2, "min_voltage": 20.0, "nominal_voltage": 24.0 },
        "LFP_36V": { "max_temp": 55, "min_temp": -20, "max_voltage": 43.8, "min_voltage": 30.0, "nominal_voltage": 36.0 },
        "LFP_48V": { "max_temp": 55, "min_temp": -20, "max_voltage": 54.6, "min_voltage": 37.5, "nominal_voltage": 48.0 },
        "LFP_51.2V": { "max_temp": 55, "min_temp": -20, "max_voltage": 58.4, "min_voltage": 40.0, "nominal_voltage": 51.2 },
        "LFP_60V": { "max_temp": 55, "min_temp": -20, "max_voltage": 69.3, "min_voltage": 47.5, "nominal_voltage": 60.0 },
        "LFP_64V": { "max_temp": 55, "min_temp": -20, "max_voltage": 73.0, "min_voltage": 50.0, "nominal_voltage": 64.0 },
        "LFP_72V": { "max_temp": 55, "min_temp": -20, "max_voltage": 87.6, "min_voltage": 60.0, "nominal_voltage": 72.0 },
        "LFP_102.4V": { "max_temp": 55, "min_temp": -20, "max_voltage": 116.8, "min_voltage": 80.0, "nominal_voltage": 102.4 },
        "LFP_121.6V": { "max_temp": 55, "min_temp": -20, "max_voltage": 121.6, "min_voltage": 95.0, "nominal_voltage": 121.6 },
        "LFP_128V": { "max_temp": 55, "min_temp": -20, "max_voltage": 128.0, "min_voltage": 100.0, "nominal_voltage": 128.0 },
        
        # Lead-acid battery types with specific voltages
        "Lead-acid_6V": { "max_temp": 40, "min_temp": -15, "max_voltage": 7.2, "min_voltage": 4.2, "nominal_voltage": 6.0 },
        "Lead-acid_12V": { "max_temp": 40, "min_temp": -15, "max_voltage": 14.4, "min_voltage": 8.4, "nominal_voltage": 12.0 },
        "Lead-acid_24V": { "max_temp": 40, "min_temp": -15, "max_voltage": 28.8, "min_voltage": 16.8, "nominal_voltage": 24.0 },
        "Lead-acid_36V": { "max_temp": 40, "min_temp": -15, "max_voltage": 43.2, "min_voltage": 25.2, "nominal_voltage": 36.0 },
        "Lead-acid_48V": { "max_temp": 40, "min_temp": -15, "max_voltage": 57.6, "min_voltage": 33.6, "nominal_voltage": 48.0 },
        "Lead-acid_72V": { "max_temp": 40, "min_temp": -15, "max_voltage": 86.4, "min_voltage": 50.4, "nominal_voltage": 72.0 },
        
        # Generic types for custom nominal voltages
        "Li-ion": {
            "max_temp": 45, 
            "min_temp": 0,
            "max_voltage_factor": 1.135,  # Max voltage is ~113.5% of nominal for Li-ion
            "min_voltage_factor": 0.75    # Min voltage is ~75% of nominal for Li-ion
        },
        "LFP": {
            "max_temp": 55, 
            "min_temp": -20,
            "max_voltage_factor": 1.15,   # Max voltage is ~115% of nominal for LFP
            "min_voltage_factor": 0.8     # Min voltage is ~80% of nominal for LFP
        },
        "Lead-acid": {
            "max_temp": 40, 
            "min_temp": -15,
            "max_voltage_factor": 1.20,   # Max voltage is ~120% of nominal for Lead-acid
            "min_voltage_factor": 0.7     # Min voltage is ~70% of nominal for Lead-acid
        }
    }
    
    @staticmethod
    def get_battery_specs(battery_type: str, nominal_voltage: float = None):
        """Generate battery specifications based on type and nominal voltage"""
        # First check if this is a specific battery type with predefined voltages
        if battery_type in BatteryDiagnostics.BATTERY_TYPES:
            specs = BatteryDiagnostics.BATTERY_TYPES[battery_type].copy()
            
            # For specific battery types with predefined voltages (e.g. "Li-ion_24V")
            if "max_voltage" in specs and "min_voltage" in specs:
                # Extract nominal voltage from the battery type string if not provided
                if not nominal_voltage and "_" in battery_type:
                    voltage_str = battery_type.split("_")[1].replace("V", "")
                    try:
                        specs["nominal_voltage"] = float(voltage_str)
                    except ValueError:
                        if nominal_voltage:
                            specs["nominal_voltage"] = nominal_voltage
                        else:
                            raise ValueError(f"Cannot determine nominal voltage for {battery_type}")
                else:
                    specs["nominal_voltage"] = nominal_voltage if nominal_voltage else 0
                
                return specs
            
            # For generic battery types that use voltage factors
            if nominal_voltage is None:
                raise ValueError(f"Nominal voltage must be provided for generic battery type: {battery_type}")
                
            specs["nominal_voltage"] = nominal_voltage
            specs["max_voltage"] = nominal_voltage * specs["max_voltage_factor"]
            specs["min_voltage"] = nominal_voltage * specs["min_voltage_factor"]
            
            return specs
            
        raise ValueError(f"Unknown battery type: {battery_type}")

    @staticmethod
    def _validate_temperature(temperature: float, battery_type: str) -> float:
        """Validate and calculate temperature compensation factor"""
        # Extract the base battery type if it's a specific voltage variant
        base_type = battery_type.split("_")[0] if "_" in battery_type else battery_type
        
        # Use the base type to get temperature limits
        if base_type in ["Li-ion", "LFP", "Lead-acid"]:
            specs = BatteryDiagnostics.BATTERY_TYPES[base_type]
        else:
            specs = BatteryDiagnostics.BATTERY_TYPES[battery_type]
            
        if temperature > specs["max_temp"]:
            raise ValueError(f"Temperature {temperature}°C exceeds maximum allowed {specs['max_temp']}°C")
        if temperature < specs["min_temp"]:
            raise ValueError(f"Temperature {temperature}°C below minimum allowed {specs['min_temp']}°C")

        # Enhanced temperature compensation
        if temperature < 0:
            return 0.8  # Severe cold impact
        elif temperature < 10:
            return 0.9  # Cold impact
        elif temperature < 25:
            return 0.95  # Cool impact
        elif temperature < 35:
            return 1.0  # Optimal
        elif temperature < 40:
            return 0.95  # Warm impact
        else:
            return 0.9  # Hot impact

    @staticmethod
    def calculate_soc(voltage: float, battery_type: str, temperature: float, nominal_voltage: float) -> Dict:
        """Calculate State of Charge using voltage-based estimation with enhanced temperature compensation"""
        if battery_type not in BatteryDiagnostics.BATTERY_TYPES:
            raise ValueError(f"Unknown battery type: {battery_type}")

        specs = BatteryDiagnostics.get_battery_specs(battery_type, nominal_voltage)

        # Validate voltage
        if voltage > specs["max_voltage"]:
            raise ValueError(f"Voltage {voltage}V exceeds maximum allowed {specs['max_voltage']}V")
        if voltage < specs["min_voltage"]:
            raise ValueError(f"Voltage {voltage}V below minimum allowed {specs['min_voltage']}V")

        # Get temperature compensation
        temp_factor = BatteryDiagnostics._validate_temperature(temperature, battery_type)

        # Enhanced SOC calculation with temperature compensation
        voltage_range = specs["max_voltage"] - specs["min_voltage"]
        voltage_normalized = voltage - specs["min_voltage"]

        # Non-linear SOC estimation using sigmoid function
        soc = 100 * (1 / (1 + np.exp(-12 * (voltage_normalized/voltage_range - 0.5))))
        soc = soc * temp_factor

        # Determine charging status
        if voltage > specs["nominal_voltage"] * 1.05:
            status = "Charging"
        elif voltage < specs["nominal_voltage"] * 0.95:
            status = "Discharging"
        else:
            status = "Full"

        return {
            "stateOfCharge": min(max(soc, 0), 100),
            "estimatedRange": f"{int(soc * 0.8)} km",
            "chargingStatus": status,
            "temperatureCompensation": temp_factor
        }

    @staticmethod
    def calculate_soh(current_capacity: float, rated_capacity: float, cycle_count: int) -> Dict:
        """Calculate State of Health with enhanced degradation analysis"""
        if current_capacity <= 0 or rated_capacity <= 0:
            raise ValueError("Capacity values must be positive")
        if cycle_count < 0:
            raise ValueError("Cycle count cannot be negative")

        soh = (current_capacity / rated_capacity) * 100
        capacity_loss = 100 - soh

        # Enhanced cycle-based degradation analysis
        cycle_factor = min(cycle_count / 1000, 1)  # Normalize to 1000 cycles
        adjusted_soh = soh * (1 - cycle_factor * 0.1)  # Adjust for cycle aging

        if adjusted_soh >= 80:
            status = "Good"
            action = "Regular maintenance sufficient"
        elif adjusted_soh >= 60:
            status = "Fair"
            action = "Monitor battery health closely"
        else:
            status = "Poor"
            action = "Consider battery replacement"

        return {
            "stateOfHealth": adjusted_soh,
            "capacityLoss": capacity_loss,
            "healthStatus": status,
            "recommendedAction": action,
            "cycleAging": cycle_factor * 100
        }

    @staticmethod
    def measure_internal_resistance(voltage: float, current: float, 
                                 temperature: float, battery_type: str) -> Dict:
        """Calculate internal resistance and assess battery condition"""
        # Basic internal resistance calculation (ΔV/ΔI)
        resistance = abs((voltage / current) * 1000)  # Convert to mΩ

        # Temperature compensation
        if temperature < 25:
            resistance *= 1.2  # Higher resistance in cold
        elif temperature > 40:
            resistance *= 0.9  # Lower resistance in heat

        # Assess resistance level
        if resistance < 100:
            status = "Excellent"
            power_loss = "Minimal"
        elif resistance < 150:
            status = "Good"
            power_loss = "Normal"
        else:
            status = "High"
            power_loss = "Significant"

        return {
            "internalResistance": resistance,
            "resistanceStatus": status,
            "powerLoss": power_loss
        }

    @staticmethod
    def analyze_capacity_fade(initial_capacity: float, current_capacity: float,
                            cycle_count: int, time_in_service: int) -> Dict:
        """Analyze capacity fade and predict remaining lifetime"""
        capacity_fade = ((initial_capacity - current_capacity) / initial_capacity) * 100
        fade_rate = capacity_fade / cycle_count if cycle_count > 0 else 0

        # Project remaining lifetime
        if fade_rate > 0:
            cycles_to_eol = int((20 - capacity_fade) / fade_rate)  # EOL at 80% capacity
            days_remaining = int(cycles_to_eol * (time_in_service / cycle_count))
        else:
            cycles_to_eol = 1000  # Default assumption
            days_remaining = 365 * 2  # Default 2 years

        return {
            "capacityFade": capacity_fade,
            "fadeRate": fade_rate,
            "projectedLifetime": f"{days_remaining} days",
            "recommendedAction": "Optimize charging patterns" if fade_rate > 0.1 else "Continue normal usage"
        }

    @staticmethod
    def check_cell_balance(cell_voltages: List[float], temperature: float) -> Dict:
        """Monitor cell voltage balance and identify issues"""
        max_voltage = max(cell_voltages)
        min_voltage = min(cell_voltages)
        voltage_diff = max_voltage - min_voltage

        # Identify problematic cells
        problem_cells = []
        avg_voltage = sum(cell_voltages) / len(cell_voltages)
        for idx, voltage in enumerate(cell_voltages):
            if abs(voltage - avg_voltage) > 0.1:  # 100mV threshold
                problem_cells.append(idx + 1)

        # Determine balance status
        if voltage_diff < 0.05:
            status = "Well Balanced"
        elif voltage_diff < 0.1:
            status = "Acceptable"
        else:
            status = "Imbalanced"

        return {
            "maxImbalance": voltage_diff,
            "balanceStatus": status,
            "problematicCells": problem_cells if problem_cells else None
        }

    @staticmethod
    def monitor_safety(voltage: float, current: float, temperature: float,
                      pressure: float, battery_type: str) -> Dict:
        """Monitor battery safety parameters and assess risks"""
        specs = BatteryDiagnostics.BATTERY_SPECS[battery_type]
        warnings = []
        risk_level = "Low"

        # Check voltage limits
        if voltage > specs["max_voltage"]:
            warnings.append("Overvoltage detected")
            risk_level = "High"
        elif voltage < specs["min_voltage"]:
            warnings.append("Undervoltage detected")
            risk_level = "Medium"

        # Check temperature
        if temperature > specs["max_temp"]:
            warnings.append("Overtemperature condition")
            risk_level = "High"
        elif temperature < specs["min_temp"]:
            warnings.append("Low temperature operation")
            risk_level = "Medium"

        # Check current
        if abs(current) > 2.0:  # Example threshold
            warnings.append("High current flow")
            risk_level = "Medium"

        # Check pressure
        if pressure > 1.2:  # Example threshold
            warnings.append("Elevated internal pressure")
            risk_level = "High"

        return {
            "safetyStatus": "Critical" if risk_level == "High" else "Warning" if warnings else "Normal",
            "riskLevel": risk_level,
            "warningFlags": warnings,
            "recommendedActions": ["Discontinue use immediately"] if risk_level == "High" else 
                                ["Monitor closely"] if risk_level == "Medium" else 
                                ["Continue normal operation"]
        }

    @staticmethod
    def analyze_thermal(temperature: float, rate_of_change: float,
                       ambient_temp: float, load_profile: str) -> Dict:
        """Analyze thermal conditions and predict thermal runaway risks"""
        # Temperature thresholds
        THERMAL_LIMITS = {
            "warning": 45,
            "critical": 60,
            "runaway": 70
        }

        # Calculate temperature margin
        margin = THERMAL_LIMITS["critical"] - temperature

        # Assess thermal status
        if temperature > THERMAL_LIMITS["runaway"]:
            status = "Critical"
            risk = 100
        elif temperature > THERMAL_LIMITS["critical"]:
            status = "Severe"
            risk = 75
        elif temperature > THERMAL_LIMITS["warning"]:
            status = "Warning"
            risk = 50
        else:
            status = "Normal"
            risk = max(0, (temperature / THERMAL_LIMITS["warning"]) * 25)

        # Adjust risk based on rate of change
        if rate_of_change > 2.0:
            risk += 25
            status = "Warning" if status == "Normal" else status

        # Determine cooling needs
        if status == "Critical":
            cooling = "Emergency cooling required"
        elif status == "Severe":
            cooling = "Active cooling needed"
        elif status == "Warning":
            cooling = "Increase cooling"
        else:
            cooling = "Normal cooling sufficient"

        return {
            "thermalStatus": status,
            "runawayRisk": min(risk, 100),
            "coolingNeeded": cooling,
            "temperatureMargin": margin
        }

    @staticmethod
    def estimate_cycle_life(cycle_count: int, depth_of_discharge: float,
                          avg_temperature: float, current_soh: float) -> Dict:
        """Predict remaining cycle life based on usage patterns"""
        # Base cycle life estimation
        base_cycles = 2000  # Standard Li-ion cycle life

        # Adjust for depth of discharge
        if depth_of_discharge > 80:
            base_cycles *= 0.7
        elif depth_of_discharge < 50:
            base_cycles *= 1.3

        # Temperature impact
        if avg_temperature > 35:
            base_cycles *= 0.8
        elif avg_temperature < 15:
            base_cycles *= 0.9

        # Calculate remaining cycles
        remaining_cycles = int(base_cycles * (current_soh / 100))
        confidence = 90 - (cycle_count / 100)  # Confidence decreases with age

        return {
            "remainingCycles": remaining_cycles,
            "estimatedEOL": (datetime.now() + 
                           timedelta(days=remaining_cycles/2)).strftime("%Y-%m-%d"),
            "confidenceLevel": max(min(confidence, 95), 60)
        }

    @staticmethod
    def detect_faults(voltage: float, current: float, temperature: float,
                     impedance: float, battery_type: str) -> Dict:
        """Detect and diagnose battery faults"""
        faults = []
        severity = "Normal"

        # Check for short circuit
        if voltage < BatteryDiagnostics.BATTERY_SPECS[battery_type]["min_voltage"] * 0.5:
            faults.append("Possible short circuit")
            severity = "Critical"

        # Check for internal damage
        if impedance > 200:  # Example threshold
            faults.append("High internal impedance - possible damage")
            severity = "High"

        # Check for reverse current
        if current < -0.1:  # Small negative threshold
            faults.append("Reverse current detected")
            severity = "High"

        # Temperature-related faults
        if temperature > 60:
            faults.append("Critical temperature - possible thermal event")
            severity = "Critical"

        # Generate recommendations
        if severity == "Critical":
            actions = ["Disconnect battery immediately", "Inspect for damage"]
        elif severity == "High":
            actions = ["Reduce load", "Schedule maintenance"]
        else:
            actions = ["Monitor battery parameters"]

        return {
            "faultStatus": "Fault detected" if faults else "Normal",
            "faultType": faults if faults else None,
            "severity": severity,
            "recommendedActions": actions
        }