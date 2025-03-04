from typing import List, Dict
from datetime import datetime, timedelta


class BatteryDiagnostics:
    # Battery chemistry specifications
    BATTERY_TYPES = {
        # Main battery chemistry types
        "Li-ion": {
            "max_temp": 45,
            "min_temp": 0,
            "voltage_specs": {
                11.1: {
                    "max_voltage": 12.6,
                    "min_voltage": 8.25,
                    "Nominal_Voltage": 11.1
                },
                14.8: {
                    "max_voltage": 16.8,
                    "min_voltage": 10.0,
                    "Nominal_Voltage": 14.8
                },
                24.0: {
                    "max_voltage": 29.4,
                    "min_voltage": 19.2,
                    "Nominal_Voltage": 24.0
                },
                36.0: {
                    "max_voltage": 42.0,
                    "min_voltage": 27.5,
                    "Nominal_Voltage": 36.0
                },
                48.0: {
                    "max_voltage": 54.6,
                    "min_voltage": 35.7,
                    "Nominal_Voltage": 48.0
                },
                51.8: {
                    "max_voltage": 58.8,
                    "min_voltage": 38.5,
                    "Nominal_Voltage": 51.8
                },
                59.2: {
                    "max_voltage": 67.2,
                    "min_voltage": 44.0,
                    "Nominal_Voltage": 59.2
                },
                62.9: {
                    "max_voltage": 71.4,
                    "min_voltage": 46.7,
                    "Nominal_Voltage": 62.9
                },
                72.0: {
                    "max_voltage": 84.0,
                    "min_voltage": 55.0,
                    "Nominal_Voltage": 72.0
                }
            }
        },
        "LFP": {
            "max_temp": 55,
            "min_temp": -20,
            "voltage_specs": {
                12.8: {
                    "max_voltage": 14.6,
                    "min_voltage": 10.0,
                    "Nominal_Voltage": 12.8
                },
                24.0: {
                    "max_voltage": 29.2,
                    "min_voltage": 20.0,
                    "Nominal_Voltage": 24.0
                },
                36.0: {
                    "max_voltage": 43.8,
                    "min_voltage": 30.0,
                    "Nominal_Voltage": 36.0
                },
                48.0: {
                    "max_voltage": 54.6,
                    "min_voltage": 37.5,
                    "Nominal_Voltage": 48.0
                },
                51.2: {
                    "max_voltage": 58.4,
                    "min_voltage": 40.0,
                    "Nominal_Voltage": 51.2
                },
                60.0: {
                    "max_voltage": 69.3,
                    "min_voltage": 47.5,
                    "Nominal_Voltage": 60.0
                },
                64.0: {
                    "max_voltage": 73.0,
                    "min_voltage": 50.0,
                    "Nominal_Voltage": 64.0
                },
                72.0: {
                    "max_voltage": 87.6,
                    "min_voltage": 60.0,
                    "Nominal_Voltage": 72.0
                },
                102.4: {
                    "max_voltage": 116.8,
                    "min_voltage": 80.0,
                    "Nominal_Voltage": 102.4
                },
                121.6: {
                    "max_voltage": 121.6,
                    "min_voltage": 95.0,
                    "Nominal_Voltage": 121.6
                },
                128.0: {
                    "max_voltage": 128.0,
                    "min_voltage": 100.0,
                    "Nominal_Voltage": 128.0
                }
            }
        },
        "Lead-acid": {
            "max_temp": 40,
            "min_temp": -15,
            "voltage_specs": {
                6.0: {
                    "max_voltage": 7.2,
                    "min_voltage": 4.2,
                    "Nominal_Voltage": 6.0
                },
                12.0: {
                    "max_voltage": 14.4,
                    "min_voltage": 8.4,
                    "Nominal_Voltage": 12.0
                },
                24.0: {
                    "max_voltage": 28.8,
                    "min_voltage": 16.8,
                    "Nominal_Voltage": 24.0
                },
                36.0: {
                    "max_voltage": 43.2,
                    "min_voltage": 25.2,
                    "Nominal_Voltage": 36.0
                },
                48.0: {
                    "max_voltage": 57.6,
                    "min_voltage": 33.6,
                    "Nominal_Voltage": 48.0
                },
                72.0: {
                    "max_voltage": 86.4,
                    "min_voltage": 50.4,
                    "Nominal_Voltage": 72.0
                }
            }
        }
    }

    @staticmethod
    def get_battery_specs(battery_type: str, nominal_voltage: float):
        """Generate battery specifications based on type and nominal voltage"""
        if battery_type not in BatteryDiagnostics.BATTERY_TYPES:
            raise ValueError(f"Unknown battery type: {battery_type}")

        if nominal_voltage is None:
            raise ValueError(
                f"Nominal voltage must be provided for battery type: {battery_type}"
            )

        battery_info = BatteryDiagnostics.BATTERY_TYPES[battery_type]
        voltage_specs = battery_info["voltage_specs"]

        # Validate that the nominal voltage is one of the predefined values
        if nominal_voltage not in voltage_specs:
            available_voltages = list(voltage_specs.keys())
            raise ValueError(
                f"Invalid nominal voltage: {nominal_voltage}. Available nominal voltages for {battery_type}: {available_voltages}"
            )

        specs = {
            "max_temp": battery_info["max_temp"],
            "min_temp": battery_info["min_temp"],
            "nominal_voltage": nominal_voltage,
            "max_voltage": voltage_specs[nominal_voltage]["max_voltage"],
            "min_voltage": voltage_specs[nominal_voltage]["min_voltage"]
        }

        return specs

    @staticmethod
    def _validate_temperature(temperature: float, battery_type: str) -> float:
        """Validate and calculate temperature compensation factor"""
        # Get temperature specifications directly from the battery type
        if battery_type not in BatteryDiagnostics.BATTERY_TYPES:
            raise ValueError(f"Unknown battery type: {battery_type}")

        specs = BatteryDiagnostics.BATTERY_TYPES[battery_type]

        if temperature > specs["max_temp"]:
            raise ValueError(
                f"Temperature {temperature}°C exceeds maximum allowed {specs['max_temp']}°C"
            )
        if temperature < specs["min_temp"]:
            raise ValueError(
                f"Temperature {temperature}°C below minimum allowed {specs['min_temp']}°C"
            )

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
    def calculate_soc(voltage: float, battery_type: str, temperature: float,
                      current: float, nominal_voltage: float) -> Dict:
        """Calculate State of Charge using voltage-based estimation with enhanced temperature compensation"""
        if battery_type not in BatteryDiagnostics.BATTERY_TYPES:
            raise ValueError(f"Unknown battery type: {battery_type}")

        specs = BatteryDiagnostics.get_battery_specs(battery_type,
                                                     nominal_voltage)

        # Validate voltage
        if voltage > specs["max_voltage"]:
            raise ValueError(
                f"Voltage {voltage}V exceeds maximum allowed {specs['max_voltage']}V"
            )
        if voltage < specs["min_voltage"]:
            raise ValueError(
                f"Voltage {voltage}V below minimum allowed {specs['min_voltage']}V"
            )

        # Get temperature compensation
        temp_factor = BatteryDiagnostics._validate_temperature(
            temperature, battery_type)

        # Enhanced SOC calculation with temperature compensation
        voltage_range = specs["max_voltage"] - specs["min_voltage"]
        voltage_normalized = voltage - specs["min_voltage"]

        # Non-linear SOC estimation using sigmoid function
        # soc = 100 * (1 / (1 + np.exp(-12 * (voltage_normalized/voltage_range - 0.5))))
        soc = 100 * ((voltage_normalized / voltage_range))
        # soc = soc * temp_factor

            # Determine charging status
        Charging_status = "Idle"
        if current > 0:
            Charging_status = "Charging"
        elif current < 0:
            Charging_status = "Discharging"
        elif current == 0:
            if voltage == specs["max_voltage"]:
                Charging_status = "Full"

        return {
            "stateOfCharge": min(max(soc, 0), 100),
            "estimatedRange": f"{int(soc * 0.8)} km",
            "chargingStatus": Charging_status,
            "temperatureCompensation": temp_factor
        }

    @staticmethod
    def calculate_soh(current_capacity: float, rated_capacity: float,
                      cycle_count: int) -> Dict:
        """Calculate State of Health with enhanced degradation analysis"""
        if current_capacity <= 0 or rated_capacity <= 0:
            raise ValueError("Capacity values must be positive")
        if cycle_count < 0:
            raise ValueError("Cycle count cannot be negative")

        soh = (current_capacity / rated_capacity) * 100
        capacity_loss = 100 - soh
        if capacity_loss < 0:
            capacity_loss = 0

        # Enhanced cycle-based degradation analysis
        cycle_factor = min(cycle_count / 1000, 1)  # Normalize to 1000 cycles
        adjusted_soh = soh * (1 - cycle_factor * 0.1)  # Adjust for cycle aging

        if adjusted_soh >= 90:
            status = "Good"
            action = "Regular maintenance sufficient"
        elif adjusted_soh >= 80:
            status = "Moderate"
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
                                    temperature: float,
                                    battery_type: str) -> Dict:
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
        capacity_fade = (
            (initial_capacity - current_capacity) / initial_capacity) * 100
        fade_rate = capacity_fade / cycle_count if cycle_count > 0 else 0

        # Project remaining lifetime
        if fade_rate > 0:
            cycles_to_eol = int(
                (20 - capacity_fade) / fade_rate)  # EOL at 80% capacity
            days_remaining = int(cycles_to_eol *
                                 (time_in_service / cycle_count))
        else:
            cycles_to_eol = 1000  # Default assumption
            days_remaining = 365 * 2  # Default 2 years

        return {
            "capacityFade":
            capacity_fade,
            "fadeRate":
            fade_rate,
            "projectedLifetime":
            f"{days_remaining} days",
            "recommendedAction":
            "Optimize charging patterns"
            if fade_rate > 0.1 else "Continue normal usage"
        }

    @staticmethod
    def check_cell_balance(cell_voltages: List[float],
                           temperature: float) -> Dict:
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
        elif voltage_diff < 0.2:
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
        specs = BatteryDiagnostics.BATTERY_TYPES[battery_type]
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
            "safetyStatus":
            "Critical"
            if risk_level == "High" else "Warning" if warnings else "Normal",
            "riskLevel":
            risk_level,
            "warningFlags":
            warnings,
            "recommendedActions": ["Discontinue use immediately"]
            if risk_level == "High" else ["Monitor closely"]
            if risk_level == "Medium" else ["Continue normal operation"]
        }

    @staticmethod
    def analyze_thermal(temperature: float, rate_of_change: float,
                        ambient_temp: float, load_profile: str) -> Dict:
        """Analyze thermal conditions and predict thermal runaway risks"""
        # Temperature thresholds
        THERMAL_LIMITS = {"warning": 45, "critical": 60, "runaway": 70}

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
                            avg_temperature: float,
                            current_soh: float) -> Dict:
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
            "remainingCycles":
            remaining_cycles,
            "estimatedEOL":
            (datetime.now() +
             timedelta(days=remaining_cycles / 2)).strftime("%Y-%m-%d"),
            "confidenceLevel":
            max(min(confidence, 95), 60)
        }

    @staticmethod
    def detect_faults(voltage: float, current: float, temperature: float,
                      impedance: float, battery_type: str) -> Dict:
        """Detect and diagnose battery faults"""
        faults = []
        severity = "Normal"

        # Check for short circuit
        if voltage < BatteryDiagnostics.BATTERY_TYPES[battery_type][
                "min_voltage"] * 0.5:
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
