from pydantic import BaseModel, Field, model_validator
from typing import List, Optional
from datetime import datetime

class BatteryParameters(BaseModel):
    batteryType: str = Field(..., description="Battery chemistry type (Li-ion, LiFePO₄, Lead-acid)")
    voltage: float = Field(..., description="Battery voltage in volts")
    current: Optional[float] = Field(None, description="Current flow in amperes")
    temperature: float = Field(..., description="Battery temperature in Celsius")
    capacity: Optional[float] = Field(None, description="Battery capacity in mAh")
    cycleCount: Optional[int] = Field(None, description="Number of charge cycles")
    nominalVoltage: Optional[float] = Field(None, description="Nominal voltage of the battery in volts")

    @model_validator(mode='after')
    def validate_parameters(self) -> 'BatteryParameters':
        valid_types = ["Li-ion", "LiFePO₄", "Lead-acid"]
        if self.batteryType not in valid_types:

class SOCRequest(BaseModel):
    batteryType: str = Field(..., description="Battery chemistry type (Li-ion, LiFePO₄, Lead-acid)")
    voltage: float = Field(..., description="Current battery voltage (V)")
    temperature: float = Field(..., description="Battery temperature (°C)")
    nominalVoltage: Optional[float] = Field(None, description="Nominal voltage of the battery (V)")

class SOHRequest(BaseModel):
    currentCapacity: float = Field(..., description="Current measured capacity (mAh)")
    ratedCapacity: float = Field(..., description="Original rated capacity (mAh)")
    cycleCount: int = Field(..., description="Number of charge cycles completed")

class ResistanceRequest(BaseModel):
    voltage: float = Field(..., description="Battery voltage (V)")
    current: float = Field(..., description="Current flow (A)")
    temperature: float = Field(..., description="Battery temperature (°C)")
    batteryType: str = Field(..., description="Battery chemistry type")

            raise ValueError(f"Battery type must be one of {valid_types}")

        if self.voltage <= 0 or self.voltage > 100:
            raise ValueError("Voltage must be positive and less than 100V")

        if self.temperature < -40 or self.temperature > 100:
            raise ValueError("Temperature must be between -40°C and 100°C")

        return self

class SOCRequest(BaseModel):
    batteryType: str = Field(..., description="Battery chemistry type")
    voltage: float = Field(..., description="Current battery voltage")
    temperature: float = Field(..., description="Battery temperature in Celsius")

    @model_validator(mode='after')
    def validate_parameters(self) -> 'SOCRequest':
        params = BatteryParameters(
            batteryType=self.batteryType,
            voltage=self.voltage,
            temperature=self.temperature,
            current=None,
            capacity=None
        )
        return self

class SOHRequest(BaseModel):
    batteryType: str = Field(..., description="Battery chemistry type")
    currentCapacity: float = Field(..., description="Current measured capacity (mAh)")
    ratedCapacity: float = Field(..., description="Original rated capacity (mAh)")
    cycleCount: int = Field(..., description="Number of charge cycles completed")

    @model_validator(mode='after')
    def validate_parameters(self) -> 'SOHRequest':
        if self.currentCapacity <= 0 or self.ratedCapacity <= 0:
            raise ValueError("Capacity values must be positive")
        if self.cycleCount < 0:
            raise ValueError("Cycle count cannot be negative")
        return self

class ResistanceRequest(BaseModel):
    batteryType: str = Field(..., description="Battery chemistry type")
    voltage: float = Field(..., description="Battery voltage under load")
    current: float = Field(..., description="Load current")
    temperature: float = Field(..., description="Battery temperature")

    @model_validator(mode='after')
    def validate_parameters(self) -> 'ResistanceRequest':
        params = BatteryParameters(
            batteryType=self.batteryType,
            voltage=self.voltage,
            temperature=self.temperature,
            current=self.current
        )
        return self

class CapacityFadeRequest(BaseModel):
    batteryType: str = Field(..., description="Battery chemistry type")
    initialCapacity: float = Field(..., description="Initial battery capacity (mAh)")
    currentCapacity: float = Field(..., description="Current battery capacity (mAh)")
    cycleCount: int = Field(..., description="Number of charge cycles")
    timeInService: int = Field(..., description="Days in service")

    @model_validator(mode='after')
    def validate_time_in_service(self) -> 'CapacityFadeRequest':
        if self.timeInService < 0:
            raise ValueError("Time in service cannot be negative")
        return self

class CellBalanceRequest(BaseModel):
    batteryType: str = Field(..., description="Battery chemistry type")
    cellVoltages: List[float] = Field(..., description="Array of individual cell voltages")
    temperature: float = Field(..., description="Battery temperature")

    @model_validator(mode='after')
    def validate_cell_voltages(self) -> 'CellBalanceRequest':
        if len(self.cellVoltages) < 2:
            raise ValueError("Must provide at least 2 cell voltages")
        if any(volt <= 0 for volt in self.cellVoltages):
            raise ValueError("All cell voltages must be positive")
        return self

class CycleLifeRequest(BaseModel):
    batteryType: str = Field(..., description="Battery chemistry type")
    cycleCount: int = Field(..., description="Number of charge cycles")
    depthOfDischarge: float = Field(..., description="Depth of discharge (%)")
    averageTemperature: float = Field(..., description="Average operating temperature (°C)")
    currentSOH: float = Field(..., description="Current State of Health (%)")

    @model_validator(mode='after')
    def validate_percentage(self) -> 'CycleLifeRequest':
        if self.depthOfDischarge < 0 or self.depthOfDischarge > 100:
            raise ValueError("Depth of discharge must be between 0 and 100")
        if self.currentSOH < 0 or self.currentSOH > 100:
            raise ValueError("Current SOH must be between 0 and 100")
        return self


class SafetyRequest(BaseModel):
    batteryType: str = Field(..., description="Battery chemistry type")
    voltage: float = Field(..., description="Battery voltage")
    current: float = Field(..., description="Current flow")
    temperature: float = Field(..., description="Battery temperature")
    pressure: float = Field(..., description="Internal pressure (atm)")

    @model_validator(mode='after')
    def validate_pressure(self) -> 'SafetyRequest':
        if self.pressure <= 0:
            raise ValueError("Pressure must be positive")
        if self.pressure > 2.0:  # Example safety threshold
            raise ValueError("Pressure exceeds safety threshold")
        return self

class ThermalRequest(BaseModel):
    batteryType: str = Field(..., description="Battery chemistry type")
    temperature: float = Field(..., description="Current temperature")
    rateOfChange: float = Field(..., description="Temperature change rate (°C/min)")
    ambientTemperature: float = Field(..., description="Ambient temperature")
    loadProfile: str = Field(..., description="Current load profile")

    @model_validator(mode='after')
    def validate_load_profile(self) -> 'ThermalRequest':
        valid_profiles = ["low", "medium", "high"]
        if self.loadProfile.lower() not in valid_profiles:
            raise ValueError(f"Load profile must be one of {valid_profiles}")
        return self

class FaultRequest(BaseModel):
    batteryType: str = Field(..., description="Battery chemistry type")
    voltage: float = Field(..., description="Battery voltage")
    current: float = Field(..., description="Current flow")
    temperature: float = Field(..., description="Battery temperature")
    impedance: float = Field(..., description="Internal impedance (Ohms)")

    @model_validator(mode='after')
    def validate_parameters(self) -> 'FaultRequest':
        params = BatteryParameters(
            batteryType=self.batteryType,
            voltage=self.voltage,
            temperature=self.temperature,
            current=self.current
        )
        return self


class DiagnosticResult(BaseModel):
    timestamp: datetime
    batteryType: str
    parameters: dict
    results: dict