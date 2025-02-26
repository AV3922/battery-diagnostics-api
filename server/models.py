from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class BatteryParameters(BaseModel):
    batteryType: str = Field(..., description="Battery chemistry type (Li-ion, LiFePO₄, Lead-acid)")
    voltage: float = Field(..., description="Battery voltage in volts")
    current: Optional[float] = Field(None, description="Current flow in amperes")
    temperature: float = Field(..., description="Battery temperature in Celsius")
    capacity: Optional[float] = Field(None, description="Battery capacity in mAh")
    cycleCount: Optional[int] = Field(None, description="Number of charge cycles")

class SOCRequest(BaseModel):
    batteryType: str
    voltage: float
    temperature: float

class SOHRequest(BaseModel):
    batteryType: str
    currentCapacity: float
    ratedCapacity: float
    cycleCount: int

class ResistanceRequest(BaseModel):
    batteryType: str
    voltage: float
    current: float
    temperature: float

class CapacityFadeRequest(BaseModel):
    batteryType: str
    initialCapacity: float
    currentCapacity: float
    cycleCount: int
    timeInService: int

class CellBalanceRequest(BaseModel):
    batteryType: str
    cellVoltages: List[float]
    temperature: float

class CycleLifeRequest(BaseModel):
    batteryType: str
    cycleCount: int
    depthOfDischarge: float
    averageTemperature: float
    currentSOH: float

class SafetyRequest(BaseModel):
    batteryType: str
    voltage: float
    current: float
    temperature: float
    pressure: float

class ThermalRequest(BaseModel):
    batteryType: str
    temperature: float
    rateOfChange: float
    ambientTemperature: float
    loadProfile: str

class FaultRequest(BaseModel):
    batteryType: str
    voltage: float
    current: float
    temperature: float
    impedance: float

class DiagnosticResult(BaseModel):
    timestamp: datetime
    batteryType: str
    parameters: dict
    results: dict