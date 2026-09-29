export interface CustomerDetails {
  firstName?: string;
  lastName?: string;
  contactName: string;
  companyName: string;
  email: string;
  phone: string;
  additionalInformation?: string;
}

export interface LiftOverview {
  whatNeedsLifting: string;
  category?: string;
  customDescription?: string;
}

export interface JobSiteLocation {
  address: string;
  city: string;
  country: string;
  postalCode: string;
  state?: string;
  coordinates: { lat: number; lng: number };
  portName?: string;
  setupLocation?: 'private_property' | 'public_road';
}

export interface DailyScheduleItem {
  id: string;
  date: string;
  durationHours: number;
  preferredStartTime?: string;
  startTime: string;
  endTime: string;
  hours: number;
}

export interface ScheduleDetails {
  // Primary progressive choice: 'single-day' | 'multi-day'
  durationType: 'single-day' | 'multi-day';
  
  // For 'multi-day': 'consecutive' | 'custom-dates'
  multiDayType: 'consecutive' | 'custom-dates';

  // Legacy string for compatibility if needed
  duration: string;

  // Working duration & preferred start time
  workingDurationHours: number; // e.g. 4, 8, 10
  preferredStartTime?: string; // e.g. '07:00' (optional)
  showDetailedShiftPlanning: boolean; // toggle for advanced start/end time specification

  // Single day fields
  liftDate: string;
  startTime: string;
  endTime: string;

  // Consecutive multi-day fields
  startDate: string;
  endDate: string;
  commonDurationHours: number;
  commonPreferredStartTime?: string;
  commonStartTime: string;
  commonEndTime: string;
  customizeIndividualConsecutive: boolean;
  consecutiveDays: DailyScheduleItem[];

  // Selected non-consecutive dates
  selectedDates: DailyScheduleItem[];
  applySameHoursToAllSelected: boolean;

  // Break-time consideration info acknowledgement
  breakTimeIncludedNotice: boolean;

  // Global modifiers
  isFlexible: boolean;
  totalPlannedHours: number;
}

export type ObstacleType =
  | 'Building'
  | 'Roof edge'
  | 'Wall'
  | 'Tree'
  | 'Antenna / tower'
  | 'Other';

export interface Obstacle {
  id: string;
  name: string;
  active: boolean;
  type: ObstacleType;
  height: number; // in meters
  width: number; // in meters
  distanceA: number; // distance from crane to obstacle in meters
  distToDestinationB: number; // distance from obstacle to lifting point in meters
  placement: 'front' | 'behind' | 'beside_1' | 'stacked_on_1';
  distFromObstacle1?: number; // distance from obstacle 1 in meters (0 = right beside)
  isWorkingSide?: boolean; // if true, this obstacle is the working profile
  description?: string;
}

export interface GroundAccess {
  minWidth: number;
  setupAreaLength: number;
  setupAreaWidth: number;
  surfaceCondition: string;
  specialCondition: boolean;
  notes: string;
}

export interface LiftParameters {
  loadWeight: number; // in metric tonnes (t)
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  isApproximate: boolean;
  knowsOutreach?: 'yes' | 'not_sure';
  requiredOutreach?: number; // in meters (if knows outreach)
  hasObstacles: 'no' | 'yes';
  workingProfileObstacleId: string; // id of obstacle marked as working profile ('obs-1' or 'obs-2')
  distanceA: number; // distance from crane to obstacle/site in meters
  distanceB: number; // distance from obstacle to lifting point in meters
  liftingHeight: number; // in meters
  boomAngle: number; // in degrees (e.g. 45°)
  boomLength?: number; // Minimum / configured boom length in meters
  obstacles: Obstacle[];
  craneFlipped?: boolean; // crane flipped to left
  groundAccess: GroundAccess;
  setupLocation?: 'private_property' | 'public_road';
  supportingEquipment?: string[];
  supportingEquipmentQuantities?: Record<string, number>;
}

export interface CraneModel {
  id: string;
  name: string;
  type: string;
  badge: 'Recommended' | 'Alternative';
  boomLengthMax: number;
  maxWeight: number;
  maxRadius: number;
  features: string[];
  priceMin: number;
  priceMax: number;
  baseRate: number;
  mobilization: number;
  boomExtensionRate: number;
  permitsRate: number;
  imageUrl: string;
}

export interface InquirySubmission {
  inquiryRef: string;
  submittedDate: string;
  status: string;
  customer: CustomerDetails;
  lift: LiftOverview;
  location: JobSiteLocation;
  schedule: ScheduleDetails;
  parameters: LiftParameters;
  selectedCrane: CraneModel;
  configuredBoomLength: number;
  totalPriceEstimate: number;
}

export type AppStep =
  | 'landing'
  | 'job-details'
  | 'lift-planner'
  | 'crane-recommendations'
  | 'confirmation'
  | 'customer-quotation';
