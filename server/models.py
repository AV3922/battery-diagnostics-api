from pydantic import BaseModel, Field, validator
from typing import List, Optional
from datetime import datetime

class BatteryParameters(BaseModel):
    batteryType: str = Field(..., description="Battery chemistry type (Li-ion, LiFePO₄, Lead-acid)")
    voltage: float = Field(..., description="Battery voltage in volts")
    current: Optional[float] = Field(None, description="Current flow in amperes")
    temperature: float = Field(..., description="Battery temperature in Celsius")
    capacity: Optional[float] = Field(None, description="Battery capacity in mAh")
    cycleCount: Optional[int] = Field(None, description="Number of charge cycles")

    @validator('batteryType')
    def validate_battery_type(cls, v):
        valid_types = ["Li-ion", "LiFePO₄", "Lead-acid"]
        if v not in valid_types:
            raise ValueError(f"Battery type must be one of {valid_types}")
        return v

    @validator('voltage')
    def validate_voltage(cls, v):
        if v <= 0:
            raise ValueError("Voltage must be positive")
        if v > 100:  # Reasonable maximum for most battery systems
            raise ValueError("Voltage exceeds maximum allowed value")
        return v

    @validator('temperature')
    def validate_temperature(cls, v):
        if v < -40 or v > 100:
            raise ValueError("Temperature must be between -40°C and 100°C")
        return v

class SOCRequest(BaseModel):
    batteryType: str = Field(..., description="Battery chemistry type")
    voltage: float = Field(..., description="Current battery voltage")
    temperature: float = Field(..., description="Battery temperature in Celsius")

    _validate_battery_type = validator('batteryType', allow_reuse=True)(BatteryParameters.validate_battery_type)
    _validate_voltage = validator('voltage', allow_reuse=True)(BatteryParameters.validate_voltage)
    _validate_temperature = validator('temperature', allow_reuse=True)(BatteryParameters.validate_temperature)

class SOHRequest(BaseModel):
    batteryType: str = Field(..., description="Battery chemistry type")
    currentCapacity: float = Field(..., description="Current measured capacity (mAh)")
    ratedCapacity: float = Field(..., description="Original rated capacity (mAh)")
    cycleCount: int = Field(..., description="Number of charge cycles completed")

    @validator('currentCapacity', 'ratedCapacity')
    def validate_capacity(cls, v):
        if v <= 0:
            raise ValueError("Capacity must be positive")
        return v

    @validator('cycleCount')
    def validate_cycle_count(cls, v):
        if v < 0:
            raise ValueError("Cycle count cannot be negative")
        return v

class ResistanceRequest(BaseModel):
    batteryType: str = Field(..., description="Battery chemistry type")
    voltage: float = Field(..., description="Battery voltage under load")
    current: float = Field(..., description="Load current")
    temperature: float = Field(..., description="Battery temperature")

    _validate_battery_type = validator('batteryType', allow_reuse=True)(BatteryParameters.validate_battery_type)
    _validate_voltage = validator('voltage', allow_reuse=True)(BatteryParameters.validate_voltage)
    _validate_temperature = validator('temperature', allow_reuse=True)(BatteryParameters.validate_temperature)

class CapacityFadeRequest(BaseModel):
    batteryType: str = Field(..., description="Battery chemistry type")
    initialCapacity: float = Field(..., description="Initial battery capacity (mAh)")
    currentCapacity: float = Field(..., description="Current battery capacity (mAh)")
    cycleCount: int = Field(..., description="Number of charge cycles")
    timeInService: int = Field(..., description="Days in service")

    @validator('timeInService')
    def validate_time_in_service(cls, v):
        if v < 0:
            raise ValueError("Time in service cannot be negative")
        return v

class CellBalanceRequest(BaseModel):
    batteryType: str = Field(..., description="Battery chemistry type")
    cellVoltages: List[float] = Field(..., description="Array of individual cell voltages")
    temperature: float = Field(..., description="Battery temperature")

    @validator('cellVoltages')
    def validate_cell_voltages(cls, v):
        if len(v) < 2:
            raise ValueError("Must provide at least 2 cell voltages")
        if any(volt <= 0 for volt in v):
            raise ValueError("All cell voltages must be positive")
        return v

class CycleLifeRequest(BaseModel):
    batteryType: str = Field(..., description="Battery chemistry type")
    cycleCount: int = Field(..., description="Number of charge cycles")
    depthOfDischarge: float = Field(..., description="Depth of discharge (%)")
    averageTemperature: float = Field(..., description="Average operating temperature (°C)")
    currentSOH: float = Field(..., description="Current State of Health (%)")

    @validator('depthOfDischarge', 'currentSOH')
    def validate_percentage(cls, v):
        if v < 0 or v > 100:
            raise ValueError("Percentage must be between 0 and 100")
        return v


class SafetyRequest(BaseModel):
    batteryType: str = Field(..., description="Battery chemistry type")
    voltage: float = Field(..., description="Battery voltage")
    current: float = Field(..., description="Current flow")
    temperature: float = Field(..., description="Battery temperature")
    pressure: float = Field(..., description="Internal pressure (atm)")

    @validator('pressure')
    def validate_pressure(cls, v):
        if v <= 0:
            raise ValueError("Pressure must be positive")
        if v > 2.0:  # Example safety threshold
            raise ValueError("Pressure exceeds safety threshold")
        return v

class ThermalRequest(BaseModel):
    batteryType: str = Field(..., description="Battery chemistry type")
    temperature: float = Field(..., description="Current temperature")
    rateOfChange: float = Field(..., description="Temperature change rate (°C/min)")
    ambientTemperature: float = Field(..., description="Ambient temperature")
    loadProfile: str = Field(..., description="Current load profile")

    @validator('loadProfile')
    def validate_load_profile(cls, v):
        valid_profiles = ["low", "medium", "high"]
        if v.lower() not in valid_profiles:
            raise ValueError(f"Load profile must be one of {valid_profiles}")
        return v.lower()

class FaultRequest(BaseModel):
    batteryType: str = Field(..., description="Battery chemistry type")
    voltage: float = Field(..., description="Battery voltage")
    current: float = Field(..., description="Current flow")
    temperature: float = Field(..., description="Battery temperature")
    impedance: float = Field(..., description="Internal impedance (Ohms)")

    _validate_battery_type = validator('batteryType', allow_reuse=True)(BatteryParameters.validate_battery_type)
    _validate_voltage = validator('voltage', allow_reuse=True)(BatteryParameters.validate_voltage)
    _validate_temperature = validator('temperature', allow_reuse=True)(BatteryParameters.validate_temperature)


class DiagnosticResult(BaseModel):
    timestamp: datetime
    batteryType: str
    parameters: dict
    results: dict