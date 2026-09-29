import React from 'react';
import {
  Weight,
  Building2,
  ArrowLeft,
  ArrowRight,
  Trash2,
  Plus,
  Minus,
  Info,
  Ruler,
  Wrench,
  Check,
  ZoomIn,
  X,
  FileText,
  ExternalLink,
} from 'lucide-react';
import { LiftParameters, Obstacle, ObstacleType, CustomerDetails } from '../types';
import { EngineeringCanvas } from './EngineeringCanvas';
import { DEMO_LIFT_PARAMETERS, DEFAULT_PARAMETERS } from '../data/cranes';
import { CustomSelect } from './CustomSelect';
import { CustomerVerificationModal } from './CustomerVerificationModal';

export const SUPPORTING_EQUIPMENT_ITEMS = [
  {
    id: 'beam_lights',
    label: 'Beam lights',
    description: 'High-power crane boom floodlights for night & low-light operations',
    image: '/equipment/beam_lights.jpg',
    unit: 'units',
    specSheetUrl: '#',
  },
  {
    id: 'rigging_slings',
    label: 'Rigging gear & slings',
    description: 'Certified synthetic webbing, wire rope slings & load-rated shackles',
    image: '/equipment/rigging_slings.jpg',
    unit: 'sets',
    specSheetUrl: '#',
  },
  {
    id: 'spreader_beam',
    label: 'Spreader beam / lifting bar',
    description: 'Engineered modular cross-beam for balancing multi-point picks',
    image: '/equipment/spreader_beam.jpg',
    unit: 'units',
    specSheetUrl: '#',
  },
  {
    id: 'ground_mats',
    label: 'Ground protection mats / pads',
    description: 'Heavy composite outrigger pads for ground pressure dispersal',
    image: '/equipment/ground_mats.jpg',
    unit: 'pads',
    specSheetUrl: '#',
  },
];

interface LiftPlannerStepProps {
  parameters: LiftParameters;
  setParameters: React.Dispatch<React.SetStateAction<LiftParameters>>;
  customer: CustomerDetails;
  onBack: () => void;
  onNext: () => void;
}

const OBSTACLE_TYPES: ObstacleType[] = [
  'Building',
  'Roof edge',
  'Wall',
  'Tree',
  'Antenna / tower',
  'Other',
];

export const LiftPlannerStep: React.FC<LiftPlannerStepProps> = ({
  parameters,
  setParameters,
  customer,
  onBack,
  onNext,
}) => {
  const [highlightedElement, setHighlightedElement] = React.useState<string | null>(null);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = React.useState<boolean>(false);
  const [isManualBoomAdjust, setIsManualBoomAdjust] = React.useState<boolean>(() => {
    return parameters.boomLength !== undefined && parameters.boomLength > 0;
  });
  const [requiresSupportingEquipment, setRequiresSupportingEquipment] = React.useState<boolean>(() => {
    return (parameters.supportingEquipment || []).length > 0;
  });
  const [previewEquipment, setPreviewEquipment] = React.useState<{
    id: string;
    label: string;
    description: string;
    image: string;
    unit: string;
    specSheetUrl?: string;
  } | null>(null);

  const {
    loadWeight,
    dimensions,
    isApproximate,
    hasObstacles,
    distanceA,
    distanceB,
    liftingHeight,
    boomAngle,
    obstacles,
  } = parameters;

  // Obstacle 1 (Primary, always in front of crane)
  const obs1 = obstacles[0] || {
    id: 'obs-1',
    name: 'Obstacle 1',
    active: hasObstacles === 'yes',
    type: 'Building' as ObstacleType,
    height: 0,
    width: 0,
    distanceA: 0,
    distToDestinationB: 0,
    placement: 'front' as const,
    distFromObstacle1: 0,
    isWorkingSide: true,
    description: '',
  };

  // Obstacle 2 (Optional)
  const obs2 = obstacles[1] || {
    id: 'obs-2',
    name: 'Obstacle 2',
    active: false,
    type: 'Roof edge' as ObstacleType,
    height: 0,
    width: 0,
    distanceA: 0,
    distToDestinationB: 0,
    placement: 'stacked_on_1' as const,
    distFromObstacle1: 0,
    isWorkingSide: false,
    description: '',
  };

  // Geometry Inputs
  const currentA = obs1.distanceA || distanceA || 0;
  const currentB = obs1.distToDestinationB || distanceB || 0;
  const obs1H = hasObstacles === 'yes' && obs1.active ? obs1.height || 0 : 0;
  const obs2H = hasObstacles === 'yes' && obs2.active ? obs2.height || 0 : 0;

  // Effective obstacle height
  let effectiveObstacleHeight = 0;
  if (hasObstacles === 'yes') {
    if (obs2.active && obs2.placement === 'stacked_on_1') {
      effectiveObstacleHeight = obs1H + obs2H;
    } else if (obs2.active && obs2H > 0) {
      effectiveObstacleHeight = Math.max(obs1H, obs2H);
    } else {
      effectiveObstacleHeight = obs1H;
    }
  }

  // Calculated outreach = A + B
  const calculatedOutreach =
    hasObstacles === 'yes'
      ? currentA > 0 || currentB > 0
        ? Number((currentA + currentB).toFixed(1))
        : 0
      : distanceA > 0
      ? Number(distanceA.toFixed(1))
      : parameters.requiredOutreach && parameters.requiredOutreach > 0
      ? Number(parameters.requiredOutreach.toFixed(1))
      : currentA > 0
      ? Number(currentA.toFixed(1))
      : 0;

  // Clearance margin to prevent suspended load collision with obstacle (load height + rigging + safety margin)
  const loadHeightM = dimensions.height > 0 ? dimensions.height : 2.5;
  const obstacleClearanceMargin = Math.max(5.0, loadHeightM + 3.0);

  // Markewitsch lifting height formula with clearance: ((H_eff + clearance) / A) * (A + B)
  let systemLiftingHeight = 0;
  if (hasObstacles === 'yes' && currentA > 0 && effectiveObstacleHeight > 0 && calculatedOutreach > 0) {
    systemLiftingHeight = Number(
      (((effectiveObstacleHeight + obstacleClearanceMargin) / currentA) * calculatedOutreach).toFixed(1)
    );
  } else if (liftingHeight > 0) {
    systemLiftingHeight = liftingHeight;
  }

  // Minimum boom angle: atan(H / Outreach)
  const activeHeightForAngle = liftingHeight > 0 ? liftingHeight : systemLiftingHeight;
  let systemBoomAngle = 0;
  if (calculatedOutreach > 0 && activeHeightForAngle > 0) {
    systemBoomAngle = Math.min(
      82,
      Math.max(
        15,
        Number(((Math.atan(activeHeightForAngle / calculatedOutreach) * 180) / Math.PI).toFixed(0))
      )
    );
  }

  // Calculated minimum boom length = sqrt(Outreach² + Lifting Height²)
  let calculatedBoomLength = 0;
  if (calculatedOutreach > 0 && systemLiftingHeight > 0) {
    calculatedBoomLength = Number(
      Math.sqrt(
        calculatedOutreach * calculatedOutreach +
          systemLiftingHeight * systemLiftingHeight
      ).toFixed(1)
    );
  }

  // Generic updater
  const updateParams = (updates: Partial<LiftParameters>) => {
    setParameters((prev) => ({ ...prev, ...updates }));
  };

  // Supporting equipment toggles & quantity adjusters
  const toggleEquipment = (id: string) => {
    const currentList = parameters.supportingEquipment || [];
    const isChecked = currentList.includes(id);
    const currentQuantities = parameters.supportingEquipmentQuantities || {};

    if (isChecked) {
      updateParams({
        supportingEquipment: currentList.filter((item) => item !== id),
      });
    } else {
      const qty = currentQuantities[id] && currentQuantities[id] > 0 ? currentQuantities[id] : 1;
      updateParams({
        supportingEquipment: [...currentList, id],
        supportingEquipmentQuantities: {
          ...currentQuantities,
          [id]: qty,
        },
      });
    }
  };

  const updateEquipmentQuantity = (id: string, delta: number) => {
    const currentList = parameters.supportingEquipment || [];
    const currentQuantities = parameters.supportingEquipmentQuantities || {};
    const currentQty = currentQuantities[id] && currentQuantities[id] > 0 ? currentQuantities[id] : 1;
    const newQty = currentQty + delta;

    if (newQty <= 0) {
      // Uncheck / remove from selection
      updateParams({
        supportingEquipment: currentList.filter((item) => item !== id),
        supportingEquipmentQuantities: {
          ...currentQuantities,
          [id]: 1,
        },
      });
    } else {
      const updatedList = currentList.includes(id) ? currentList : [...currentList, id];
      updateParams({
        supportingEquipment: updatedList,
        supportingEquipmentQuantities: {
          ...currentQuantities,
          [id]: newQty,
        },
      });
    }
  };

  const setDirectEquipmentQuantity = (id: string, val: number) => {
    const currentList = parameters.supportingEquipment || [];
    const currentQuantities = parameters.supportingEquipmentQuantities || {};
    const safeVal = Math.max(1, Math.min(99, isNaN(val) ? 1 : val));

    const updatedList = currentList.includes(id) ? currentList : [...currentList, id];
    updateParams({
      supportingEquipment: updatedList,
      supportingEquipmentQuantities: {
        ...currentQuantities,
        [id]: safeVal,
      },
    });
  };

  // Update Obstacle 1
  const updateObs1 = (updates: Partial<Obstacle>) => {
    const nextObs = [...parameters.obstacles];
    nextObs[0] = { ...obs1, ...updates };

    const newDistA = updates.distanceA !== undefined ? updates.distanceA : (obs1.distanceA || distanceA || 0);
    const newDistB = updates.distToDestinationB !== undefined ? updates.distToDestinationB : (obs1.distToDestinationB || distanceB || 0);
    const newH1 = updates.height !== undefined ? updates.height : (obs1.height || 0);
    
    // Auto recalculate lift height with clearance
    let effH = newH1;
    if (obs2.active && obs2.placement === 'stacked_on_1') {
      effH += (obs2.height || 0);
    } else if (obs2.active && (obs2.height || 0) > 0) {
      effH = Math.max(effH, obs2.height || 0);
    }

    const newTotalR = newDistA + newDistB;
    const clearance = Math.max(5.0, ((dimensions.height && dimensions.height > 0) ? dimensions.height : 2.5) + 3.0);
    const newLiftH =
      newDistA > 0 && effH > 0 && newTotalR > 0
        ? Number((((effH + clearance) / newDistA) * newTotalR).toFixed(1))
        : 0;
    const newAngle =
      newTotalR > 0 && newLiftH > 0
        ? Math.min(85, Math.max(15, Math.round((Math.atan(newLiftH / newTotalR) * 180) / Math.PI)))
        : 0;

    setParameters((prev) => ({
      ...prev,
      obstacles: nextObs,
      distanceA: newDistA,
      distanceB: newDistB,
      liftingHeight: newLiftH,
      boomAngle: newAngle,
    }));
  };

  // Update Obstacle 2
  const updateObs2 = (updates: Partial<Obstacle>) => {
    const nextObs = [...parameters.obstacles];
    if (nextObs[1]) {
      nextObs[1] = { ...nextObs[1], ...updates };

      const newH2 = updates.height !== undefined ? updates.height : (obs2.height || 0);
      let effH = obs1.height || 0;
      const placement = updates.placement || obs2.placement;
      if (placement === 'stacked_on_1') {
        effH += newH2;
      } else if (newH2 > 0) {
        effH = Math.max(effH, newH2);
      }

      const totalR = (obs1.distanceA || 0) + (obs1.distToDestinationB || 0);
      const clearance = Math.max(5.0, ((dimensions.height && dimensions.height > 0) ? dimensions.height : 2.5) + 3.0);
      const newLiftH =
        (obs1.distanceA || 0) > 0 && effH > 0 && totalR > 0
          ? Number((((effH + clearance) / (obs1.distanceA || 1)) * totalR).toFixed(1))
          : 0;
      const newAngle =
        totalR > 0 && newLiftH > 0
          ? Math.min(85, Math.max(15, Math.round((Math.atan(newLiftH / totalR) * 180) / Math.PI)))
          : 0;

      setParameters((prev) => ({
        ...prev,
        obstacles: nextObs,
        liftingHeight: newLiftH,
        boomAngle: newAngle,
      }));
    }
  };

  // Add Obstacle 2
  const handleAddObstacle2 = () => {
    const nextObs = [...parameters.obstacles];
    if (nextObs[1]) {
      nextObs[1].active = true;
    } else {
      nextObs.push({
        id: 'obs-2',
        name: 'Obstacle 2',
        active: true,
        type: 'Roof edge',
        height: 0,
        width: 0,
        distanceA: 0,
        distToDestinationB: 0,
        placement: 'stacked_on_1',
        distFromObstacle1: 0,
        isWorkingSide: false,
        description: '',
      });
    }
    setParameters((prev) => ({ ...prev, obstacles: nextObs }));
  };

  // Remove Obstacle 2
  const handleDeleteObstacle2 = () => {
    const nextObs = [...parameters.obstacles];
    if (nextObs[1]) {
      nextObs[1].active = false;
      setParameters((prev) => ({
        ...prev,
        obstacles: nextObs,
      }));
    }
  };

  // Fill sample dummy values
  const handleFillDemoValues = () => {
    setParameters(DEMO_LIFT_PARAMETERS);
  };

  // Reset view
  const handleResetView = () => {
    setParameters(DEFAULT_PARAMETERS);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header & Subtitle - Clean single header matching Step 1 */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight">
          Lift details & engineering planner
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-500">
          Specify load weight, geometry, site obstacles, and lifting elevation on the interactive 2D diagram.
        </p>
      </div>

      {/* 2-Column Layout: Left Form Inputs Overlay + Right 2D Vector CAD Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Form Controls */}
        <div className="lg:col-span-5 space-y-5">
          {/* Section 1: Load Specifications */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center shrink-0">
                <Weight className="w-5 h-5 text-[#c01823]" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-slate-900">
                  Load specifications
                </h2>
                <p className="text-xs text-slate-500">
                  Gross weight and dimensions of the object to lift
                </p>
              </div>
            </div>

            {/* Field: Load weight * */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Load weight <span className="text-[#c01823]">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="250"
                  value={loadWeight > 0 ? loadWeight : ''}
                  onFocus={() => setHighlightedElement('loadWeight')}
                  onBlur={() => setHighlightedElement(null)}
                  onChange={(e) =>
                    updateParams({
                      loadWeight: e.target.value === '' ? 0 : parseFloat(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 pr-9 bg-white font-mono placeholder:text-slate-400"
                  placeholder="e.g. 12"
                />
                <span className="absolute right-3 top-2 text-xs font-semibold text-slate-500">
                  t
                </span>
              </div>
            </div>

            {/* Field: Load Dimensions (L x W x H) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Load dimensions (L × W × H)
              </label>
              <div className="grid grid-cols-3 gap-2">
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="50"
                    value={dimensions.length > 0 ? dimensions.length : ''}
                    onFocus={() => setHighlightedElement('dimensions')}
                    onBlur={() => setHighlightedElement(null)}
                    onChange={(e) =>
                      updateParams({
                        dimensions: {
                          ...dimensions,
                          length: e.target.value === '' ? 0 : parseFloat(e.target.value),
                        },
                      })
                    }
                    className="w-full px-2.5 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500 pr-7 font-mono placeholder:text-slate-400"
                    placeholder="Length"
                  />
                  <span className="absolute right-2 top-2 text-[10px] text-slate-400 font-semibold">
                    m
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="30"
                    value={dimensions.width > 0 ? dimensions.width : ''}
                    onFocus={() => setHighlightedElement('dimensions')}
                    onBlur={() => setHighlightedElement(null)}
                    onChange={(e) =>
                      updateParams({
                        dimensions: {
                          ...dimensions,
                          width: e.target.value === '' ? 0 : parseFloat(e.target.value),
                        },
                      })
                    }
                    className="w-full px-2.5 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500 pr-7 font-mono placeholder:text-slate-400"
                    placeholder="Width"
                  />
                  <span className="absolute right-2 top-2 text-[10px] text-slate-400 font-semibold">
                    m
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="30"
                    value={dimensions.height > 0 ? dimensions.height : ''}
                    onFocus={() => setHighlightedElement('dimensions')}
                    onBlur={() => setHighlightedElement(null)}
                    onChange={(e) =>
                      updateParams({
                        dimensions: {
                          ...dimensions,
                          height: e.target.value === '' ? 0 : parseFloat(e.target.value),
                        },
                      })
                    }
                    className="w-full px-2.5 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500 pr-7 font-mono placeholder:text-slate-400"
                    placeholder="Height"
                  />
                  <span className="absolute right-2 top-2 text-[10px] text-slate-400 font-semibold">
                    m
                  </span>
                </div>
              </div>
            </div>

            {/* Approximate Checkbox */}
            <div className="pt-0.5">
              <label className="inline-flex items-center gap-2 cursor-pointer text-xs text-slate-600 select-none">
                <input
                  type="checkbox"
                  checked={isApproximate}
                  onChange={(e) => updateParams({ isApproximate: e.target.checked })}
                  className="w-3.5 h-3.5 text-[#c01823] rounded border-slate-300 focus:ring-red-500 accent-[#c01823]"
                />
                <span>These values are approximate</span>
              </label>
            </div>
          </div>

          {/* Section 2: Site Obstacles & Outreach Layout */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center shrink-0">
                <Building2 className="w-5 h-5 text-[#c01823]" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-slate-900">
                  Site obstacles & outreach layout
                </h2>
                <p className="text-xs text-slate-500">
                  Site clearance, obstacle dimensions, and working outreach
                </p>
              </div>
            </div>

            {/* Obstacle Presence Question */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Is there a relevant obstacle between the crane and the lifting point? <span className="text-[#c01823]">*</span>
              </label>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const currentTotal = (obs1.distanceA || 0) + (obs1.distToDestinationB || 0);
                    const initDist = distanceA > 0 ? distanceA : currentTotal > 0 ? currentTotal : 15;
                    const initH = liftingHeight > 0 ? liftingHeight : 12;
                    const initAngle = Math.min(85, Math.max(15, Math.round((Math.atan(initH / initDist) * 180) / Math.PI)));
                    updateParams({
                      hasObstacles: 'no',
                      distanceA: initDist,
                      requiredOutreach: initDist,
                      distanceB: 0,
                      liftingHeight: initH,
                      boomAngle: initAngle,
                    });
                  }}
                  className={`px-3 py-2.5 rounded-xl border text-xs font-semibold text-center transition-all ${
                    hasObstacles === 'no'
                      ? 'border-[#c01823] bg-red-50/50 text-[#c01823] shadow-2xs'
                      : 'border-slate-200 bg-slate-50/50 text-slate-700 hover:bg-slate-100/70'
                  }`}
                >
                  No
                </button>
                <button
                  type="button"
                  onClick={() => updateParams({ hasObstacles: 'yes' })}
                  className={`px-3 py-2.5 rounded-xl border text-xs font-semibold text-center transition-all ${
                    hasObstacles === 'yes'
                      ? 'border-[#c01823] bg-red-50/50 text-[#c01823] shadow-2xs'
                      : 'border-slate-200 bg-slate-50/50 text-slate-700 hover:bg-slate-100/70'
                  }`}
                >
                  Yes
                </button>
              </div>
            </div>

            {/* If Yes: Reveal Obstacle Details */}
            {hasObstacles === 'yes' ? (
              <div className="space-y-4 pt-1">
                {/* OBSTACLE 1 CARD */}
                <div className="p-4 bg-slate-50/70 rounded-xl border border-slate-200 space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">
                      Obstacle 1
                    </span>
                  </div>

                  {/* Obstacle Type */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Obstacle type
                    </label>
                    <CustomSelect
                      value={obs1.type}
                      onChange={(val) =>
                        updateObs1({ type: val as ObstacleType })
                      }
                      options={OBSTACLE_TYPES}
                      id="obstacle-1-type-select"
                    />
                  </div>

                  {/* Height & Width */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Obstacle height <span className="text-[#c01823]">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          max="70"
                          value={obs1.height > 0 ? obs1.height : ''}
                          onFocus={() => setHighlightedElement('obs1_height')}
                          onBlur={() => setHighlightedElement(null)}
                          onChange={(e) =>
                            updateObs1({
                              height: e.target.value === '' ? 0 : parseFloat(e.target.value),
                            })
                          }
                          className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500 pr-7 bg-white font-mono placeholder:text-slate-400"
                          placeholder="e.g. 6"
                        />
                        <span className="absolute right-2 top-1.5 text-[10px] text-slate-400 font-semibold">
                          m
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Obstacle width
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          max="30"
                          value={obs1.width > 0 ? obs1.width : ''}
                          onFocus={() => setHighlightedElement('obs1_width')}
                          onBlur={() => setHighlightedElement(null)}
                          onChange={(e) =>
                            updateObs1({
                              width: e.target.value === '' ? 0 : parseFloat(e.target.value),
                            })
                          }
                          className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500 pr-7 bg-white font-mono placeholder:text-slate-400"
                          placeholder="e.g. 2.5"
                        />
                        <span className="absolute right-2 top-1.5 text-[10px] text-slate-400 font-semibold">
                          m
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Distance A & B */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Distance to obstacle (A) <span className="text-[#c01823]">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          max="60"
                          value={obs1.distanceA > 0 ? obs1.distanceA : ''}
                          onFocus={() => setHighlightedElement('distanceA')}
                          onBlur={() => setHighlightedElement(null)}
                          onChange={(e) =>
                            updateObs1({
                              distanceA: e.target.value === '' ? 0 : parseFloat(e.target.value),
                            })
                          }
                          className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500 pr-7 bg-white font-mono placeholder:text-slate-400"
                          placeholder="e.g. 12"
                        />
                        <span className="absolute right-2 top-1.5 text-[10px] text-slate-400 font-semibold">
                          m
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Distance to lift point (B) <span className="text-[#c01823]">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          max="60"
                          value={obs1.distToDestinationB > 0 ? obs1.distToDestinationB : ''}
                          onFocus={() => setHighlightedElement('distanceB')}
                          onBlur={() => setHighlightedElement(null)}
                          onChange={(e) =>
                            updateObs1({
                              distToDestinationB: e.target.value === '' ? 0 : parseFloat(e.target.value),
                            })
                          }
                          className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500 pr-7 bg-white font-mono placeholder:text-slate-400"
                          placeholder="e.g. 8"
                        />
                        <span className="absolute right-2 top-1.5 text-[10px] text-slate-400 font-semibold">
                          m
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Live Calculated Outreach Display */}
                  <div className="px-3 py-2 bg-white rounded-lg border border-slate-200 flex items-center justify-between text-xs">
                    <span className="text-slate-600 font-medium">Calculated outreach (A + B):</span>
                    <span className="font-bold text-slate-900 font-mono">
                      {obs1.distanceA || 0}m + {obs1.distToDestinationB || 0}m ={' '}
                      <strong className="text-[#c01823]">{calculatedOutreach} m</strong>
                    </span>
                  </div>
                </div>

                {/* OBSTACLE 2 (Only revealed when added by user) */}
                {obs2 && obs2.active ? (
                  <div className="p-4 bg-slate-50/70 rounded-xl border border-slate-200 space-y-3.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">
                        Obstacle 2
                      </span>
                      <button
                        type="button"
                        onClick={handleDeleteObstacle2}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#c01823] hover:text-[#991b1b]"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Obstacle 2 type
                      </label>
                      <CustomSelect
                        value={obs2.type}
                        onChange={(val) =>
                          updateObs2({ type: val as ObstacleType })
                        }
                        options={OBSTACLE_TYPES}
                        id="obstacle-2-type-select"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Position / Relative placement
                      </label>
                      <CustomSelect
                        value={obs2.placement}
                        onChange={(val) =>
                          updateObs2({
                            placement: val as 'front' | 'behind' | 'beside_1' | 'stacked_on_1',
                          })
                        }
                        options={[
                          { value: 'stacked_on_1', label: 'On top of Obstacle 1 (Stacked)' },
                          { value: 'beside_1', label: 'Beside Obstacle 1' },
                          { value: 'front', label: 'In front of crane (standalone)' },
                          { value: 'behind', label: 'Behind crane (standalone)' },
                        ]}
                        id="obstacle-2-placement-select"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Height <span className="text-[#c01823]">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            step="0.5"
                            value={obs2.height > 0 ? obs2.height : ''}
                            onFocus={() => setHighlightedElement('obs2_height')}
                            onBlur={() => setHighlightedElement(null)}
                            onChange={(e) =>
                              updateObs2({
                                height: e.target.value === '' ? 0 : parseFloat(e.target.value),
                              })
                            }
                            className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg pr-7 bg-white font-mono placeholder:text-slate-400"
                            placeholder="e.g. 2"
                          />
                          <span className="absolute right-2 top-1.5 text-[10px] text-slate-400 font-semibold">
                            m
                          </span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Width
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            step="0.5"
                            value={obs2.width > 0 ? obs2.width : ''}
                            onFocus={() => setHighlightedElement('obs2_width')}
                            onBlur={() => setHighlightedElement(null)}
                            onChange={(e) =>
                              updateObs2({
                                width: e.target.value === '' ? 0 : parseFloat(e.target.value),
                              })
                            }
                            className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg pr-7 bg-white font-mono placeholder:text-slate-400"
                            placeholder="e.g. 2"
                          />
                          <span className="absolute right-2 top-1.5 text-[10px] text-slate-400 font-semibold">
                            m
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Position-dependent distance input for Obstacle 2 */}
                    {obs2.placement !== 'stacked_on_1' && (
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          {obs2.placement === 'beside_1'
                            ? 'Distance from Obstacle 1 (0m = right beside)'
                            : obs2.placement === 'behind'
                            ? 'Distance behind crane'
                            : 'Distance from crane'}
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            step="0.5"
                            value={
                              obs2.placement === 'beside_1'
                                ? (obs2.distFromObstacle1 ?? 0)
                                : (obs2.distanceA > 0 ? obs2.distanceA : '')
                            }
                            onFocus={() => setHighlightedElement('obs2')}
                            onBlur={() => setHighlightedElement(null)}
                            onChange={(e) => {
                              const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
                              if (obs2.placement === 'beside_1') {
                                updateObs2({ distFromObstacle1: val });
                              } else {
                                updateObs2({ distanceA: val });
                              }
                            }}
                            className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg pr-7 bg-white font-mono placeholder:text-slate-400"
                            placeholder={obs2.placement === 'beside_1' ? '0 (right beside)' : 'e.g. 6'}
                          />
                          <span className="absolute right-2 top-1.5 text-[10px] text-slate-400 font-semibold">
                            m
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleAddObstacle2}
                    className="w-full py-2.5 px-3 bg-white hover:bg-slate-50 border border-dashed border-slate-300 rounded-xl text-xs font-semibold text-slate-700 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#c01823]" />
                    <span>Add second obstacle</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="p-4 bg-slate-50/70 rounded-xl border border-slate-200 space-y-3 pt-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Field: Distance to Lift Point */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Distance to lift point <span className="text-[#c01823]">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        max="80"
                        value={distanceA > 0 ? distanceA : ''}
                        onFocus={() => setHighlightedElement('distanceA')}
                        onBlur={() => setHighlightedElement(null)}
                        onChange={(e) => {
                          const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
                          const currentH = liftingHeight > 0 ? liftingHeight : 0;
                          const newAngle =
                            val > 0 && currentH > 0
                              ? Math.min(85, Math.max(15, Math.round((Math.atan(currentH / val) * 180) / Math.PI)))
                              : boomAngle || 45;
                          updateParams({
                            distanceA: val,
                            requiredOutreach: val,
                            distanceB: 0,
                            boomAngle: newAngle,
                          });
                        }}
                        className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500 pr-7 bg-white font-mono placeholder:text-slate-400"
                        placeholder="e.g. 15"
                        id="distance-to-lift-point-input"
                      />
                      <span className="absolute right-2 top-1.5 text-[10px] text-slate-400 font-semibold">
                        m
                      </span>
                    </div>
                  </div>

                  {/* Field: Required Lifting Height */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Required lifting height <span className="text-[#c01823]">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        max="80"
                        value={liftingHeight > 0 ? liftingHeight : ''}
                        onFocus={() => setHighlightedElement('liftingHeight')}
                        onBlur={() => setHighlightedElement(null)}
                        onChange={(e) => {
                          const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
                          const currentD = distanceA > 0 ? distanceA : 0;
                          const newAngle =
                            currentD > 0 && val > 0
                              ? Math.min(85, Math.max(15, Math.round((Math.atan(val / currentD) * 180) / Math.PI)))
                              : boomAngle || 45;
                          updateParams({
                            liftingHeight: val,
                            boomAngle: newAngle,
                          });
                        }}
                        className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500 pr-7 bg-white font-mono placeholder:text-slate-400"
                        placeholder="e.g. 12"
                        id="required-lifting-height-input"
                      />
                      <span className="absolute right-2 top-1.5 text-[10px] text-slate-400 font-semibold">
                        m
                      </span>
                    </div>
                  </div>
                </div>

                <div className="px-3 py-2 bg-white rounded-lg border border-slate-200 flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium">Direct working radius:</span>
                  <span className="font-bold text-slate-900 font-mono">
                    <strong className="text-[#c01823]">{distanceA > 0 ? `${distanceA.toFixed(1)} m` : '--'}</strong>
                  </span>
                </div>
              </div>
            )}

            {/* Link to adjust setup manually */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  if (isManualBoomAdjust) {
                    setIsManualBoomAdjust(false);
                    updateParams({ boomLength: undefined });
                  } else {
                    setIsManualBoomAdjust(true);
                  }
                }}
                className="text-xs font-semibold text-[#c01823] hover:text-[#991b1b] hover:underline inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                id="toggle-manual-boom-adjust-link"
              >
                <span>{isManualBoomAdjust ? 'Hide the setup' : 'Adjust the setup manually'}</span>
              </button>
            </div>
          </div>

          {/* Section 3: Minimum Boom Length & Geometry (Only displayed when user chooses to adjust manually) */}
          {isManualBoomAdjust && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-5 animate-fadeIn">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center shrink-0">
                  <Ruler className="w-5 h-5 text-[#c01823]" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-semibold text-slate-900">
                    Minimum boom length & geometry
                  </h2>
                  <p className="text-xs text-slate-500">
                    Interactive scaling measurement sliders with live geometric calculation
                  </p>
                </div>
              </div>

            {/* Minimum Boom Length Slider */}
            <div>
              {(() => {
                const minBoomRange = 10;
                const maxBoomRange = 80;
                const currentBoomLen =
                  parameters.boomLength !== undefined && parameters.boomLength > 0
                    ? parameters.boomLength
                    : calculatedBoomLength > 0
                    ? calculatedBoomLength
                    : 25;
                const boomLenPct = Math.min(
                  100,
                  Math.max(0, ((currentBoomLen - minBoomRange) / (maxBoomRange - minBoomRange)) * 100)
                );

                return (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-semibold text-slate-700">
                        Minimum boom length
                      </label>
                      <div className="flex items-center gap-2">
                        {parameters.boomLength !== undefined &&
                          parameters.boomLength > 0 &&
                          parameters.boomLength !== calculatedBoomLength && (
                            <button
                              type="button"
                              onClick={() => updateParams({ boomLength: undefined })}
                              className="text-[11px] font-semibold text-[#c01823] hover:underline"
                            >
                              Reset
                            </button>
                          )}
                        <span className="px-2.5 py-0.5 bg-red-50 text-[#c01823] text-xs font-bold rounded-md font-mono border border-red-100 shadow-2xs">
                          {currentBoomLen.toFixed(1)} m
                        </span>
                      </div>
                    </div>

                    <input
                      type="range"
                      min={minBoomRange}
                      max={maxBoomRange}
                      step="0.5"
                      value={currentBoomLen}
                      onFocus={() => setHighlightedElement('boomLength')}
                      onBlur={() => setHighlightedElement(null)}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        if (val > 0) {
                          const targetR = calculatedOutreach > 0 ? calculatedOutreach : 18;
                          if (val >= targetR) {
                            const newAngle = Math.min(
                              85,
                              Math.max(15, Math.round((Math.acos(targetR / val) * 180) / Math.PI))
                            );
                            const newHeight = Math.sqrt(val * val - targetR * targetR);
                            updateParams({
                              boomLength: val,
                              liftingHeight: Number(newHeight.toFixed(1)),
                              boomAngle: newAngle,
                            });
                          } else {
                            updateParams({ boomLength: val });
                          }
                        }
                      }}
                      style={{
                        background: `linear-gradient(to right, #c01823 ${boomLenPct}%, #e2e8f0 ${boomLenPct}%)`,
                      }}
                      className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-[#c01823]"
                    />

                    <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
                      <span>{minBoomRange} m</span>
                      <span>{Math.round((minBoomRange + maxBoomRange) / 2)} m</span>
                      <span>{maxBoomRange} m</span>
                    </div>

                    <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                      <span>
                        Resulting lifting height:{' '}
                        <strong className="font-mono text-slate-800">
                          {systemLiftingHeight > 0 ? `${systemLiftingHeight.toFixed(1)} m` : '--'}
                        </strong>
                      </span>
                      <span>
                        Resulting angle:{' '}
                        <strong className="font-mono text-slate-800">
                          {boomAngle || systemBoomAngle || 45}°
                        </strong>
                      </span>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Boom Angle Scale with direct interactive rotation */}
            <div>
              {(() => {
                const currentAngle = boomAngle || systemBoomAngle || 45;
                const anglePct = Math.min(100, Math.max(0, ((currentAngle - 15) / (82 - 15)) * 100));

                return (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-semibold text-slate-700">
                        Minimum boom angle
                      </label>
                      <span className="px-2.5 py-0.5 bg-red-50 text-[#c01823] text-xs font-bold rounded-md font-mono border border-red-100 shadow-2xs">
                        {currentAngle}°
                      </span>
                    </div>
                    <input
                      type="range"
                      min="15"
                      max="82"
                      step="1"
                      value={currentAngle}
                      onFocus={() => setHighlightedElement('boomAngle')}
                      onBlur={() => setHighlightedElement(null)}
                      onChange={(e) => {
                        const newAngle = parseInt(e.target.value) || 45;
                        const targetR = calculatedOutreach > 0 ? calculatedOutreach : 18;
                        const rad = (newAngle * Math.PI) / 180;
                        const newBoomLen = targetR / Math.cos(rad);
                        const newH = targetR * Math.tan(rad);
                        updateParams({
                          boomAngle: newAngle,
                          boomLength: Number(newBoomLen.toFixed(1)),
                          liftingHeight: Number(newH.toFixed(1)),
                        });
                      }}
                      style={{
                        background: `linear-gradient(to right, #c01823 ${anglePct}%, #e2e8f0 ${anglePct}%)`,
                      }}
                      className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-[#c01823]"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
                      <span>15°</span>
                      <span>82°</span>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* Section 4: Supporting Equipment (Hidden by default, shown via branded button) */}
        {!requiresSupportingEquipment ? (
          <div className="w-full">
            <button
              type="button"
              onClick={() => setRequiresSupportingEquipment(true)}
              className="w-full py-3 px-4 bg-white hover:bg-red-50/40 border border-dashed border-slate-300 hover:border-[#c01823]/60 rounded-xl text-center flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold text-slate-700 hover:text-[#c01823] transition-all shadow-2xs cursor-pointer group"
              id="show-supporting-equipment-btn"
            >
              <div className="w-5 h-5 rounded-md bg-red-50 border border-red-100 flex items-center justify-center text-[#c01823] group-hover:bg-[#c01823] group-hover:text-white transition-colors">
                <Plus className="w-3.5 h-3.5" />
              </div>
              <span>
                {(parameters.supportingEquipment || []).length > 0
                  ? `Supporting equipment (${(parameters.supportingEquipment || []).length} selected)`
                  : 'Add supporting equipment'}
              </span>
            </button>
          </div>
        ) : (
          <div
            id="supporting-equipment-section"
            className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-4 animate-fadeIn"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center shrink-0">
                  <Wrench className="w-5 h-5 text-[#c01823]" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-semibold text-slate-900">
                    Supporting equipment
                  </h2>
                  <p className="text-xs text-slate-500">
                    Additional site accessories, rigging slings, spreader beams, and floodlights
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setRequiresSupportingEquipment(false)}
                className="w-8 h-8 rounded-lg border border-slate-200 text-slate-400 hover:text-[#c01823] hover:border-red-200 hover:bg-red-50 flex items-center justify-center transition-colors cursor-pointer"
                title="Collapse supporting equipment"
                aria-label="Collapse supporting equipment"
                id="close-supporting-equipment-btn"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 pt-1">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-700">
                  Available supporting equipment
                </label>
                {(parameters.supportingEquipment || []).length > 0 && (
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    {(parameters.supportingEquipment || []).length} equipment added
                  </span>
                )}
              </div>

              <div className="flex flex-col space-y-2">
                {SUPPORTING_EQUIPMENT_ITEMS.map((item) => {
                  const isChecked = (parameters.supportingEquipment || []).includes(item.id);
                  const currentQty = parameters.supportingEquipmentQuantities?.[item.id] ?? 1;

                  return (
                    <div
                      key={item.id}
                      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-2.5 rounded-xl border transition-all ${
                        isChecked
                          ? 'border-[#c01823]/40 bg-red-50/25 shadow-2xs'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      {/* Left: Image + Details */}
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        {/* Equipment Image Thumbnail with Zoom Button */}
                        <div
                          onClick={() => setPreviewEquipment(item)}
                          title="Click to view full image"
                          className="relative w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0 cursor-pointer group shadow-2xs"
                        >
                          <img
                            src={item.image}
                            alt={item.label}
                            className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-110"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              (e.target as HTMLElement).style.opacity = '0.3';
                            }}
                          />
                          <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <ZoomIn className="w-3.5 h-3.5 text-white drop-shadow" />
                          </div>
                        </div>

                        {/* Title & Description */}
                        <div className="min-w-0 flex-1">
                          <span
                            className={`text-xs font-semibold truncate block ${
                              isChecked ? 'text-slate-900' : 'text-slate-700'
                            }`}
                          >
                            {item.label}
                          </span>
                          <p className="text-[11px] text-slate-500 leading-tight truncate mt-0.5">
                            {item.description}
                          </p>

                          {/* Technical details preview button */}
                          <div className="mt-1.5 flex items-center">
                            <a
                              href={item.specSheetUrl || '#'}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => {
                                e.stopPropagation();
                              }}
                              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium text-slate-600 hover:text-[#c01823] bg-slate-100/90 hover:bg-red-50/70 border border-slate-200 hover:border-red-200 transition-all cursor-pointer shadow-2xs group/spec"
                              title={`Preview technical details (PDF) for ${item.label}`}
                              id={`supporting-eq-specs-${item.id}`}
                            >
                              <FileText className="w-3 h-3 text-slate-500 group-hover/spec:text-[#c01823] transition-colors" />
                              <span>Technical details</span>
                              <ExternalLink className="w-2.5 h-2.5 text-slate-400 group-hover/spec:text-[#c01823] transition-colors" />
                            </a>
                          </div>
                        </div>
                      </div>

                      {/* Right: Quantity Adjuster (+ / -) or Add button */}
                      <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                        {isChecked ? (
                          <div className="flex items-center gap-1 bg-white px-1.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
                            <button
                              type="button"
                              onClick={() => updateEquipmentQuantity(item.id, -1)}
                              aria-label={`Decrease ${item.label} quantity`}
                              className="w-6 h-6 flex items-center justify-center rounded text-slate-600 hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
                              title={currentQty === 1 ? 'Remove from selection' : 'Decrease quantity'}
                            >
                              <Minus className="w-3 h-3" />
                            </button>

                            <div className="flex items-center px-1">
                              <input
                                type="number"
                                min="1"
                                max="99"
                                value={currentQty}
                                onChange={(e) => {
                                  const v = parseInt(e.target.value, 10);
                                  setDirectEquipmentQuantity(item.id, isNaN(v) ? 1 : v);
                                }}
                                className="w-8 text-center text-xs font-mono font-bold text-slate-900 bg-transparent focus:outline-none focus:bg-slate-50 rounded"
                                id={`supporting-eq-qty-${item.id}`}
                              />
                            </div>

                            <button
                              type="button"
                              onClick={() => updateEquipmentQuantity(item.id, 1)}
                              aria-label={`Increase ${item.label} quantity`}
                              className="w-6 h-6 flex items-center justify-center rounded text-slate-600 hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
                              title="Increase quantity"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => toggleEquipment(item.id)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:text-[#c01823] hover:border-red-200 hover:bg-red-50/40 transition-colors cursor-pointer"
                            id={`supporting-eq-add-${item.id}`}
                          >
                            <Plus className="w-3 h-3" />
                            <span>Add</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

        {/* Right Column: Live 2D Engineering Canvas */}
        <div className="lg:col-span-7 sticky top-24 space-y-4">
          <EngineeringCanvas
            parameters={parameters}
            highlightedElement={highlightedElement}
            onResetView={handleResetView}
            onFillDemo={handleFillDemoValues}
          />

          {/* Bottom Guidance Box */}
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 text-xs text-slate-600 flex items-start gap-3">
            <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <p>
              The 2D representation is an indicative planning view, not an exact technical lift plan. You can click and drag with the hand tool to pan around the canvas.
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-6 border-t border-slate-200">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Job site details</span>
        </button>

        <button
          type="button"
          onClick={() => setIsVerificationModalOpen(true)}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#c01823] hover:bg-[#991b1b] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          id="calculate-recommended-cranes-btn"
        >
          <span>Calculate recommended cranes</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Customer Email OTP Verification Modal before Step 3 */}
      <CustomerVerificationModal
        isOpen={isVerificationModalOpen}
        onClose={() => setIsVerificationModalOpen(false)}
        onVerified={() => {
          setIsVerificationModalOpen(false);
          onNext();
        }}
        customer={customer}
      />

      {/* Supporting Equipment Image Preview Modal */}
      {previewEquipment && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setPreviewEquipment(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">{previewEquipment.label}</h3>
                <p className="text-[11px] text-slate-500">{previewEquipment.description}</p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewEquipment(null)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 bg-slate-50 flex items-center justify-center min-h-[220px]">
              <img
                src={previewEquipment.image}
                alt={previewEquipment.label}
                className="max-h-60 max-w-full rounded-lg object-contain shadow-xs bg-white"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-white">
              <div className="text-xs text-slate-600">
                {(parameters.supportingEquipment || []).includes(previewEquipment.id) ? (
                  <span className="font-medium text-[#c01823]">
                    Selected (Qty: {parameters.supportingEquipmentQuantities?.[previewEquipment.id] ?? 1})
                  </span>
                ) : (
                  <span className="text-slate-500">Not selected in lift plan</span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={previewEquipment.specSheetUrl || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1.5 px-3 py-2 border border-slate-200 text-xs font-medium text-slate-700 hover:text-[#c01823] hover:border-red-200 hover:bg-red-50/50 rounded-xl transition-colors cursor-pointer"
                  title="Preview technical details (PDF)"
                >
                  <FileText className="w-3.5 h-3.5 text-slate-500" />
                  <span>Technical details</span>
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </a>

                {!(parameters.supportingEquipment || []).includes(previewEquipment.id) ? (
                  <button
                    type="button"
                    onClick={() => {
                      toggleEquipment(previewEquipment.id);
                      setPreviewEquipment(null);
                    }}
                    className="px-4 py-2 bg-[#c01823] hover:bg-[#991b1b] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    Add to lift plan
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setPreviewEquipment(null)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
