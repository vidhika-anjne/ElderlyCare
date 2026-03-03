package com.minor.elderlyCare.model;

/**
 * Types of vital signs that can be recorded for an elder.
 *
 * Each type has a display name, unit, and normal range boundaries
 * used by the abnormal-value detection logic in VitalMonitoringService.
 */
public enum VitalType {

    BLOOD_SUGAR("Blood Sugar", "mg/dL", 70.0, 140.0),
    BLOOD_PRESSURE("Blood Pressure", "mmHg", 90.0, 140.0),   // systolic range; diastolic checked separately
    HEART_RATE("Heart Rate", "bpm", 60.0, 100.0),
    OXYGEN_SATURATION("Oxygen Saturation", "%", 95.0, 100.0),
    TEMPERATURE("Temperature", "°F", 97.0, 99.5);

    private final String displayName;
    private final String unit;
    private final double normalMin;
    private final double normalMax;

    VitalType(String displayName, String unit, double normalMin, double normalMax) {
        this.displayName = displayName;
        this.unit = unit;
        this.normalMin = normalMin;
        this.normalMax = normalMax;
    }

    public String getDisplayName() { return displayName; }
    public String getUnit()        { return unit; }
    public double getNormalMin()   { return normalMin; }
    public double getNormalMax()   { return normalMax; }
}
