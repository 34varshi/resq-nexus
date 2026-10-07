import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { SeverityBadge, OperationalTag } from '../common/StatusBadges';
import { prewarmMapAndDataCache, loadCachedMapAsset } from '../../utils/offlineStorage';
import {
  MapPin,
  Layers,
  Flame,
  LifeBuoy,
  Home,
  Box,
  Users,
  Compass,
  AlertTriangle,
  ZoomIn,
  ZoomOut,
  Crosshair,
  Send,
  Eye,
  CheckCircle,
  ShieldAlert,
  ArrowRight,
  HardDrive,
  RefreshCw,
  Building2,
  Navigation,
  Radio,
  Move,
  Truck
} from 'lucide-react';

export const LiveMap: React.FC = () => {
  const {
    incidents,
    requests,
    shelters,
    resources,
    teams,
    dispatchTeam,
    updateRequestStatus,
    setCurrentView,
    isOffline,
    activeMissions,
    fastForwardTeamArrival
  } = useApp();

  // Layer Toggles
  const [layers, setLayers] = useState({
    vectorBasemap: true,
    topoGrid: true,
    incidents: true,
    requests: true,
    shelters: true,
    resources: true,
    teams: true,
    floodZones: true,
    roadClosures: true,
    infrastructure: true
  });

  // Pan and Zoom Viewport State
  const [zoomLevel, setZoomLevel] = useState<number>(0.85);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: -100, y: -30 });
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const [cachedAssetsReady, setCachedAssetsReady] = useState<boolean>(true);
  const [prewarmingMap, setPrewarmingMap] = useState<boolean>(false);
  const [infraData, setInfraData] = useState<any[]>([]);

  const [selectedEntity, setSelectedEntity] = useState<{
    type: 'INCIDENT' | 'REQUEST' | 'SHELTER' | 'RESOURCE' | 'TEAM' | 'INFRASTRUCTURE' | 'MISSION';
    data: any;
  } | null>({
    type: 'REQUEST',
    data: requests[0]
  });

  // Refs for drag, pinch, and click disambiguation
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const isDraggingRef = useRef<boolean>(false);
  const dragDistanceRef = useRef<number>(0);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const panStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const pinchStartDistRef = useRef<number>(0);
  const pinchStartZoomRef = useRef<number>(0.85);
  const isPointerDownRef = useRef<boolean>(false);

  // Center the map viewport based on container width/height
  const centerMap = useCallback((zoom = 0.85) => {
    if (!mapContainerRef.current) return;
    const rect = mapContainerRef.current.getBoundingClientRect();
    const defaultPanX = (rect.width - 1200 * zoom) / 2;
    const defaultPanY = (rect.height - 800 * zoom) / 2;
    setZoomLevel(zoom);
    setPan({ x: defaultPanX, y: defaultPanY });
  }, []);

  // Initialize center when mounted
  useEffect(() => {
    centerMap(0.85);
  }, [centerMap]);

  // Load infrastructure features from cached geojson
  useEffect(() => {
    loadCachedMapAsset('/map/critical-infrastructure.json').then((data) => {
      if (data && data.features) {
        setInfraData(data.features);
      }
    });
  }, []);

  // Zoom In Handler (centered on viewport center)
  const handleZoomIn = () => {
    const container = mapContainerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    setZoomLevel((prevZoom) => {
      const nextZoom = Math.min(3.0, Number((prevZoom * 1.25).toFixed(2)));
      setPan((prevPan) => ({
        x: centerX - (centerX - prevPan.x) * (nextZoom / prevZoom),
        y: centerY - (centerY - prevPan.y) * (nextZoom / prevZoom)
      }));
      return nextZoom;
    });
  };

  // Zoom Out Handler (centered on viewport center)
  const handleZoomOut = () => {
    const container = mapContainerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    setZoomLevel((prevZoom) => {
      const nextZoom = Math.max(0.5, Number((prevZoom / 1.25).toFixed(2)));
      setPan((prevPan) => ({
        x: centerX - (centerX - prevPan.x) * (nextZoom / prevZoom),
        y: centerY - (centerY - prevPan.y) * (nextZoom / prevZoom)
      }));
      return nextZoom;
    });
  };

  // Wheel zoom handler: attached natively with { passive: false } to prevent browser window scrolling
  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = container.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      setZoomLevel((prevZoom) => {
        const factor = e.deltaY < 0 ? 1.15 : 0.87;
        const newZoom = Math.min(3.0, Math.max(0.5, Number((prevZoom * factor).toFixed(3))));
        if (newZoom !== prevZoom) {
          setPan((prevPan) => ({
            x: mouseX - (mouseX - prevPan.x) * (newZoom / prevZoom),
            y: mouseY - (mouseY - prevPan.y) * (newZoom / prevZoom)
          }));
        }
        return newZoom;
      });
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, []);

  // Touch handlers for mobile pan & pinch-zoom (prevents default page scrolling while touching map)
  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isPointerDownRef.current = true;
        dragStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        panStartRef.current = { ...pan };
        dragDistanceRef.current = 0;
        isDraggingRef.current = false;
        setIsDragging(true);
      } else if (e.touches.length === 2) {
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        pinchStartDistRef.current = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
        pinchStartZoomRef.current = zoomLevel;
        panStartRef.current = { ...pan };
        isDraggingRef.current = true;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault(); // Prevents page from scrolling during map interaction
      if (e.touches.length === 1 && isPointerDownRef.current) {
        const dx = e.touches[0].clientX - dragStartRef.current.x;
        const dy = e.touches[0].clientY - dragStartRef.current.y;
        dragDistanceRef.current = Math.hypot(dx, dy);
        if (dragDistanceRef.current > 4) {
          isDraggingRef.current = true;
        }
        setPan({
          x: panStartRef.current.x + dx,
          y: panStartRef.current.y + dy
        });
      } else if (e.touches.length === 2) {
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        const currentDist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
        if (pinchStartDistRef.current > 0) {
          const rect = container.getBoundingClientRect();
          const centerX = (t1.clientX + t2.clientX) / 2 - rect.left;
          const centerY = (t1.clientY + t2.clientY) / 2 - rect.top;
          const scale = currentDist / pinchStartDistRef.current;
          const newZoom = Math.min(3.0, Math.max(0.5, Number((pinchStartZoomRef.current * scale).toFixed(3))));

          setZoomLevel((prevZoom) => {
            if (newZoom !== prevZoom) {
              setPan((prevPan) => ({
                x: centerX - (centerX - prevPan.x) * (newZoom / prevZoom),
                y: centerY - (centerY - prevPan.y) * (newZoom / prevZoom)
              }));
            }
            return newZoom;
          });
        }
      }
    };

    const handleTouchEnd = () => {
      isPointerDownRef.current = false;
      setIsDragging(false);
      setTimeout(() => {
        isDraggingRef.current = false;
      }, 60);
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });
    container.addEventListener('touchcancel', handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
      container.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [pan, zoomLevel]);

  // Mouse pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only primary mouse button initiates pan
    if (e.button !== 0) return;
    isPointerDownRef.current = true;
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    panStartRef.current = { ...pan };
    dragDistanceRef.current = 0;
    isDraggingRef.current = false;
    setIsDragging(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isPointerDownRef.current) return;
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      dragDistanceRef.current = Math.hypot(dx, dy);

      if (dragDistanceRef.current > 4) {
        isDraggingRef.current = true;
      }

      setPan({
        x: panStartRef.current.x + dx,
        y: panStartRef.current.y + dy
      });
    };

    const handleMouseUp = () => {
      if (!isPointerDownRef.current) return;
      isPointerDownRef.current = false;
      setIsDragging(false);
      // Brief debounce so marker onClick knows if this gesture was a drag
      setTimeout(() => {
        isDraggingRef.current = false;
      }, 60);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  // Clicking an interactive entity on the map (guarded to avoid firing on drag)
  const handleEntityClick = (entity: { type: any; data: any }) => {
    if (isDraggingRef.current || dragDistanceRef.current > 5) {
      return;
    }
    setSelectedEntity(entity);
  };

  const toggleLayer = (layerName: keyof typeof layers) => {
    setLayers((prev) => ({ ...prev, [layerName]: !prev[layerName] }));
  };

  const handlePrewarmSector = async () => {
    setPrewarmingMap(true);
    await prewarmMapAndDataCache();
    setPrewarmingMap(false);
    setCachedAssetsReady(true);
  };

  const getCanvasCoords = (
    coords?: { lat: number; lng: number },
    defaultTop = 400,
    defaultLeft = 600
  ) => {
    if (!coords || typeof coords.lat !== 'number' || typeof coords.lng !== 'number') {
      return { top: defaultTop, left: defaultLeft };
    }
    // Centered around 17.385, 78.4867 inside 1200x800 coordinate box
    const dx = (coords.lng - 78.4867) * 9000;
    const dy = -(coords.lat - 17.385) * 9000;
    const left = Math.min(1140, Math.max(60, 600 + dx));
    const top = Math.min(740, Math.max(60, 400 + dy));
    return { top, left };
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-150">
      {/* Top Bar with Map Layer Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-rose-500" />
          <div>
            <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              Live Tactical Operations Map
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
                HYDERABAD / SECTOR 4 MUSI BASIN
              </span>
            </h2>
            <p className="text-[11px] text-slate-400">
              Unified multi-layer spatial common operational picture (COP). Pan and zoom enabled.
            </p>
          </div>
        </div>

        {/* Layer Checkbox Pills */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
          <button
            onClick={() => toggleLayer('vectorBasemap')}
            className={`px-2.5 py-1 rounded-lg border transition-colors flex items-center gap-1 cursor-pointer ${
              layers.vectorBasemap
                ? 'bg-sky-950/80 text-sky-300 border-sky-700 font-semibold'
                : 'bg-slate-950 text-slate-500 border-slate-800'
            }`}
            title="Toggle cached vector cartography basemap"
          >
            <span className="w-2 h-2 rounded-full bg-sky-400" />
            Vector Basemap (Cached SVG)
          </button>

          <button
            onClick={() => toggleLayer('topoGrid')}
            className={`px-2.5 py-1 rounded-lg border transition-colors flex items-center gap-1 cursor-pointer ${
              layers.topoGrid
                ? 'bg-cyan-950/80 text-cyan-300 border-cyan-700 font-semibold'
                : 'bg-slate-950 text-slate-500 border-slate-800'
            }`}
            title="Toggle UTM topographic coordinate grid"
          >
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            UTM Grid
          </button>

          <button
            onClick={() => toggleLayer('infrastructure')}
            className={`px-2.5 py-1 rounded-lg border transition-colors flex items-center gap-1 cursor-pointer ${
              layers.infrastructure
                ? 'bg-teal-950/80 text-teal-300 border-teal-700 font-semibold'
                : 'bg-slate-950 text-slate-500 border-slate-800'
            }`}
            title="Toggle cached infrastructure (Hospitals, Helipads, Depots)"
          >
            <span className="w-2 h-2 rounded-full bg-teal-400" />
            Infrastructure (GeoJSON)
          </button>

          <button
            onClick={() => toggleLayer('incidents')}
            className={`px-2.5 py-1 rounded-lg border transition-colors flex items-center gap-1 cursor-pointer ${
              layers.incidents
                ? 'bg-rose-950/80 text-rose-300 border-rose-700 font-semibold'
                : 'bg-slate-950 text-slate-500 border-slate-800'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            Incidents
          </button>

          <button
            onClick={() => toggleLayer('requests')}
            className={`px-2.5 py-1 rounded-lg border transition-colors flex items-center gap-1 cursor-pointer ${
              layers.requests
                ? 'bg-amber-950/80 text-amber-300 border-amber-700 font-semibold'
                : 'bg-slate-950 text-slate-500 border-slate-800'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            Requests
          </button>

          <button
            onClick={() => toggleLayer('teams')}
            className={`px-2.5 py-1 rounded-lg border transition-colors flex items-center gap-1 cursor-pointer ${
              layers.teams
                ? 'bg-purple-950/80 text-purple-300 border-purple-700 font-semibold'
                : 'bg-slate-950 text-slate-500 border-slate-800'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-purple-500" />
            Teams
          </button>

          <button
            onClick={() => toggleLayer('shelters')}
            className={`px-2.5 py-1 rounded-lg border transition-colors flex items-center gap-1 cursor-pointer ${
              layers.shelters
                ? 'bg-sky-950/80 text-sky-300 border-sky-700 font-semibold'
                : 'bg-slate-950 text-slate-500 border-slate-800'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-sky-500" />
            Shelters
          </button>

          <button
            onClick={() => toggleLayer('floodZones')}
            className={`px-2.5 py-1 rounded-lg border transition-colors flex items-center gap-1 cursor-pointer ${
              layers.floodZones
                ? 'bg-blue-950/80 text-blue-300 border-blue-700 font-semibold'
                : 'bg-slate-950 text-slate-500 border-slate-800'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            Surge Polygons
          </button>

          {/* Prewarm Button */}
          <button
            onClick={handlePrewarmSector}
            disabled={prewarmingMap}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700 transition-colors flex items-center gap-1 text-[11px] font-semibold cursor-pointer disabled:opacity-50"
            title="Download & cache all vector map files to Service Worker"
          >
            <RefreshCw className={`w-3 h-3 ${prewarmingMap ? 'animate-spin' : ''}`} />
            <span>{prewarmingMap ? 'Caching...' : 'Cache Sector'}</span>
          </button>
        </div>
      </div>

      {/* Main Map Canvas & Side Panel Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Interactive Tactical Map (8 Cols) */}
        <div
          ref={mapContainerRef}
          onMouseDown={handleMouseDown}
          className={`lg:col-span-8 relative rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden h-[620px] shadow-2xl select-none ${
            isDragging ? 'cursor-grabbing' : 'cursor-grab'
          }`}
          style={{ touchAction: 'none' }}
        >
          {/* Tactical Background Grid & Dot Matrix in viewport background */}
          <div className="absolute inset-0 tactical-grid opacity-25 pointer-events-none" />
          <div className="absolute inset-0 tactical-dots opacity-15 pointer-events-none" />

          {/* TRANSFORMED WORLD LAYER: 1200 x 800 map coordinate space */}
          <div
            className="absolute top-0 left-0 w-[1200px] h-[800px] origin-top-left will-change-transform"
            style={{
              transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoomLevel})`,
              transformOrigin: '0 0'
            }}
          >
            {/* Tactical Grid inside the map coordinate world */}
            <div className="absolute inset-0 tactical-grid opacity-35 pointer-events-none" />
            <div className="absolute inset-0 tactical-dots opacity-20 pointer-events-none" />

            {/* Cached Tactical Vector Basemap (Offline SVG layer) */}
            {layers.vectorBasemap && (
              <img
                src="/map/tactical-basemap.svg"
                alt="Cached Sector Basemap"
                draggable={false}
                className="absolute inset-0 w-[1200px] h-[800px] object-fill opacity-70 pointer-events-none z-0"
              />
            )}

            {/* Cached UTM Topographic Grid (Offline SVG overlay) */}
            {layers.topoGrid && (
              <img
                src="/map/sector4-topo-grid.svg"
                alt="UTM Topo Grid"
                draggable={false}
                className="absolute inset-0 w-[1200px] h-[800px] object-fill opacity-60 pointer-events-none z-10"
              />
            )}

            {/* SVG Vector Features: River Channel, Flood Risk Polygons, Road Obstructions */}
            <svg
              className="absolute inset-0 w-[1200px] h-[800px] z-15 pointer-events-none"
              viewBox="0 0 1200 800"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Primary River Corridor (Musi) */}
              <path
                d="M-50,340 C150,310 320,380 480,340 C650,290 850,390 1150,330"
                fill="none"
                stroke="#1E3A8A"
                strokeWidth="70"
                strokeOpacity="0.5"
              />
              <path
                d="M-50,340 C150,310 320,380 480,340 C650,290 850,390 1150,330"
                fill="none"
                stroke="#38BDF8"
                strokeWidth="6"
                strokeDasharray="8 6"
                strokeOpacity="0.8"
              />

              {/* Inundation Flood Hazard Polygon */}
              {layers.floodZones && (
                <>
                  <polygon
                    points="220,260 480,280 620,440 380,480 190,380"
                    fill="#991B1B"
                    fillOpacity="0.22"
                    stroke="#EF4444"
                    strokeWidth="2"
                    strokeDasharray="6 4"
                  />
                  <text x="320" y="380" fill="#EF4444" fontSize="12" fontFamily="monospace" fontWeight="bold">
                    SURGE ZONE // DEPTH 1.2M
                  </text>
                </>
              )}

              {/* Road Closures Vector */}
              {layers.roadClosures && (
                <>
                  <line x1="280" y1="200" x2="380" y2="290" stroke="#EF4444" strokeWidth="4" strokeDasharray="4 2" />
                  <line x1="520" y1="360" x2="640" y2="400" stroke="#EF4444" strokeWidth="4" strokeDasharray="4 2" />
                </>
              )}

              {/* Tactical Rescue Ingress Route */}
              <line
                x1="220"
                y1="160"
                x2="340"
                y2="300"
                stroke="#F59E0B"
                strokeWidth="3"
                strokeDasharray="4 4"
              />
            </svg>

            {/* Interactive Markers (Geographically locked to world layer) */}
            {/* Critical Infrastructure Markers (Hospitals, Helipads, Depots from GeoJSON) */}
            {layers.infrastructure && (
              <>
                {/* Trauma Center 1: Osmania */}
                <div
                  style={{ top: '210px', left: '190px' }}
                  onClick={() =>
                    handleEntityClick({
                      type: 'INFRASTRUCTURE',
                      data: {
                        id: 'INFRA-MED-01',
                        name: 'Osmania General Field Triage Wing',
                        category: 'Level-1 Trauma & Clinical Staging',
                        beds: '34 Available / 180 Total',
                        radio: 'CH-16 TAC-MED',
                        status: 'OPERATIONAL',
                        powerBackup: '72 Hours Generator Fuel'
                      }
                    })
                  }
                  className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-20"
                >
                  <div className="w-6 h-6 rounded-lg bg-teal-600 border border-teal-300 flex items-center justify-center text-white shadow-lg shadow-teal-950/60 transition-transform group-hover:scale-110">
                    <Building2 className="w-3.5 h-3.5" />
                  </div>
                  <div className="mt-1 px-1.5 py-0.2 rounded bg-slate-900/90 border border-teal-500/50 text-[9px] font-mono text-teal-300 whitespace-nowrap shadow">
                    Osmania Trauma Wing
                  </div>
                </div>

                {/* Helipad LZ-Alpha */}
                <div
                  style={{ top: '120px', left: '520px' }}
                  onClick={() =>
                    handleEntityClick({
                      type: 'INFRASTRUCTURE',
                      data: {
                        id: 'INFRA-HELI-01',
                        name: 'Helipad LZ-Alpha (Gymkhana Grounds)',
                        category: 'Tactical Air Evacuation Landing Zone',
                        capacity: '3 Heavy Helicopters (Mi-17 / ALH Dhruv)',
                        radio: 'CH-08 AIR-OPS 123.45 MHz',
                        status: 'CLEAR // WIND 8KTS',
                        elevation: '535m MSL'
                      }
                    })
                  }
                  className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-20"
                >
                  <div className="w-6 h-6 rounded-lg bg-sky-600 border border-sky-300 flex items-center justify-center text-white shadow-lg shadow-sky-950/60 font-mono font-bold text-[10px] transition-transform group-hover:scale-110">
                    H1
                  </div>
                  <div className="mt-1 px-1.5 py-0.2 rounded bg-slate-900/90 border border-sky-500/50 text-[9px] font-mono text-sky-300 whitespace-nowrap shadow">
                    Air Evac LZ-Alpha
                  </div>
                </div>

                {/* Helipad LZ-Bravo */}
                <div
                  style={{ top: '480px', left: '880px' }}
                  onClick={() =>
                    handleEntityClick({
                      type: 'INFRASTRUCTURE',
                      data: {
                        id: 'INFRA-HELI-02',
                        name: 'Helipad LZ-Bravo (LB Stadium Deck)',
                        category: 'Tactical Air Evacuation Landing Zone',
                        capacity: '2 Medium Helicopters',
                        radio: 'CH-08 AIR-OPS',
                        status: 'CLEAR',
                        elevation: '520m MSL'
                      }
                    })
                  }
                  className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-20"
                >
                  <div className="w-6 h-6 rounded-lg bg-sky-600 border border-sky-300 flex items-center justify-center text-white shadow-lg shadow-sky-950/60 font-mono font-bold text-[10px] transition-transform group-hover:scale-110">
                    H2
                  </div>
                  <div className="mt-1 px-1.5 py-0.2 rounded bg-slate-900/90 border border-sky-500/50 text-[9px] font-mono text-sky-300 whitespace-nowrap shadow">
                    Air Evac LZ-Bravo
                  </div>
                </div>

                {/* Water Logistics Hub */}
                <div
                  style={{ top: '340px', left: '740px' }}
                  onClick={() =>
                    handleEntityClick({
                      type: 'INFRASTRUCTURE',
                      data: {
                        id: 'INFRA-WATER-01',
                        name: 'Amberpet Bulk RO Potable Water Plant',
                        category: 'Bulk Clean Drinking Water Dispenser',
                        dailySupply: '150,000 Liters / Day',
                        radio: 'CH-12 LOGISTICS',
                        status: 'OPERATIONAL // 8 TANKER SLOTS'
                      }
                    })
                  }
                  className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-20"
                >
                  <div className="w-6 h-6 rounded-lg bg-blue-600 border border-blue-300 flex items-center justify-center text-white shadow-lg shadow-blue-950/60 font-mono font-bold text-[10px] transition-transform group-hover:scale-110">
                    RO
                  </div>
                  <div className="mt-1 px-1.5 py-0.2 rounded bg-slate-900/90 border border-blue-500/50 text-[9px] font-mono text-blue-300 whitespace-nowrap shadow">
                    Amberpet RO Water
                  </div>
                </div>
              </>
            )}

            {/* Incidents Markers */}
            {layers.incidents &&
              incidents.filter((i) => i.status !== 'RESOLVED').map((inc, i) => {
                const { top, left } = getCanvasCoords(
                  inc.coordinates,
                  310 + (i === 0 ? 0 : i === 1 ? -140 : i === 2 ? 160 : (i % 2 === 0 ? 110 : -90)),
                  460 + (i === 0 ? 0 : i === 1 ? 180 : i === 2 ? -220 : (i % 2 === 0 ? -160 : 160))
                );
                return (
                  <div
                    key={inc.id}
                    style={{ top: `${top}px`, left: `${left}px` }}
                    onClick={() => handleEntityClick({ type: 'INCIDENT', data: inc })}
                    className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-20"
                  >
                    <div className="relative">
                      <span className="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-rose-500 opacity-60 -top-1 -left-1"></span>
                      <div className="w-7 h-7 rounded-full bg-rose-600 border-2 border-white flex items-center justify-center text-white shadow-xl shadow-rose-950 transition-transform group-hover:scale-110">
                        <Flame className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="mt-1 px-2 py-0.5 rounded bg-slate-900/90 border border-rose-500/50 text-[10px] font-mono text-rose-300 shadow group-hover:scale-105 transition-transform whitespace-nowrap">
                      {inc.id} ({inc.type})
                    </div>
                  </div>
                );
              })}

            {/* Emergency Requests Markers */}
            {layers.requests &&
              requests
                .filter((r) => r.status !== 'CLOSED' && r.status !== 'RESOLVED')
                .slice(0, 15)
                .map((req, i) => {
                  const { top, left } = getCanvasCoords(
                    req.coordinates,
                    260 + (i % 2 === 0 ? (i * 35) % 300 : -(i * 30) % 250),
                    340 + (i % 2 === 0 ? (i * 45) % 400 : -(i * 40) % 350)
                  );
                  return (
                    <div
                      key={req.id}
                      style={{ top: `${top}px`, left: `${left}px` }}
                      onClick={() => handleEntityClick({ type: 'REQUEST', data: req })}
                      className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-20"
                    >
                      <div
                        className={`w-6 h-6 rounded-full border-2 border-slate-900 flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 ${
                          req.urgency === 'CRITICAL'
                            ? 'bg-rose-500 text-white'
                            : req.urgency === 'HIGH'
                            ? 'bg-amber-500 text-slate-950'
                            : 'bg-emerald-500 text-slate-950'
                        }`}
                      >
                        <LifeBuoy className="w-3.5 h-3.5" />
                      </div>
                      <div className="mt-1 px-1.5 py-0.2 rounded bg-slate-900/90 border border-slate-700 text-[9px] font-mono text-slate-200 group-hover:scale-105 transition-transform whitespace-nowrap shadow">
                        {req.id} · {req.priorityScore}/100
                      </div>
                    </div>
                  );
                })}

            {/* Response Teams Markers */}
            {layers.teams &&
              teams.map((t, i) => {
                const isEnRoute = activeMissions[t.id];
                if (isEnRoute) return null; // Rendered via activeMissions layer
                const { top, left } = getCanvasCoords(
                  t.coordinates,
                  160 + i * 80,
                  220 + i * 110
                );
                return (
                  <div
                    key={t.id}
                    style={{ top: `${top}px`, left: `${left}px` }}
                    onClick={() => handleEntityClick({ type: 'TEAM', data: t })}
                    className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-20"
                  >
                    <div className="w-6 h-6 rounded-full bg-purple-600 border-2 border-white flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110">
                      <Users className="w-3.5 h-3.5" />
                    </div>
                    <div className="mt-1 px-1.5 py-0.2 rounded bg-slate-900/90 border border-purple-500/50 text-[9px] font-mono text-purple-300 whitespace-nowrap shadow">
                      {t.id} ({t.status})
                    </div>
                  </div>
                );
              })}

            {/* Active En-Route Team Simulated Mission Trajectories & Moving Units */}
            {layers.teams &&
              Object.values(activeMissions).map((mission) => {
                const start = getCanvasCoords(mission.startCoords, 280, 260);
                const target = getCanvasCoords(mission.targetCoords, 500, 520);
                const curr = getCanvasCoords(mission.currentCoords, 380, 390);
                return (
                  <React.Fragment key={`mission-${mission.teamId}`}>
                    {/* Trajectory Vector */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none z-15" viewBox="0 0 1200 800">
                      <line
                        x1={start.left}
                        y1={start.top}
                        x2={target.left}
                        y2={target.top}
                        stroke="#c084fc"
                        strokeWidth="3"
                        strokeDasharray="8,6"
                        className="opacity-80 animate-pulse"
                      />
                    </svg>

                    {/* Moving Unit */}
                    <div
                      style={{ top: `${curr.top}px`, left: `${curr.left}px` }}
                      onClick={() => handleEntityClick({ type: 'MISSION', data: mission })}
                      className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-30"
                    >
                      <div className="relative">
                        <span className="animate-ping absolute inline-flex h-9 w-9 rounded-full bg-purple-400 opacity-75 -top-1.5 -left-1.5"></span>
                        <div className="w-8 h-8 rounded-full bg-purple-600 border-2 border-white flex items-center justify-center text-white shadow-2xl shadow-purple-950 font-bold transition-transform group-hover:scale-110">
                          <Truck className="w-4 h-4 animate-bounce" />
                        </div>
                      </div>
                      <div className="mt-1 px-2 py-0.5 rounded bg-slate-950/95 border border-purple-400 text-[10px] font-mono font-bold text-purple-300 shadow whitespace-nowrap">
                        {mission.teamId} · {mission.etaMinutes}m ETA ({Math.round(mission.progress * 100)}%)
                      </div>
                    </div>
                  </React.Fragment>
                );
              })}

            {/* Shelters Markers */}
            {layers.shelters &&
              shelters.map((s, i) => {
                const { top, left } = getCanvasCoords(
                  s.coordinates,
                  110 + i * 110,
                  680 + (i % 2 === 0 ? 30 : -40)
                );
                return (
                  <div
                    key={s.id}
                    style={{ top: `${top}px`, left: `${left}px` }}
                    onClick={() => handleEntityClick({ type: 'SHELTER', data: s })}
                    className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-20"
                  >
                    <div className="w-6 h-6 rounded-full bg-sky-500 border-2 border-white flex items-center justify-center text-slate-950 shadow-lg transition-transform group-hover:scale-110">
                      <Home className="w-3.5 h-3.5" />
                    </div>
                    <div className="mt-1 px-1.5 py-0.2 rounded bg-slate-900/90 border border-sky-500/50 text-[9px] font-mono text-sky-300 whitespace-nowrap shadow">
                      {s.name.slice(0, 14)}... ({s.capacity - s.occupied} beds)
                    </div>
                  </div>
                );
              })}
          </div>

          {/* Map Floating Viewport Controls (Fixed HUD overlay) */}
          <div className="absolute top-4 right-4 flex flex-col gap-1.5 z-30">
            {/* Zoom In Button */}
            <button
              type="button"
              onClick={handleZoomIn}
              className="p-2 rounded-lg bg-slate-900/90 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 shadow transition-all cursor-pointer"
              title="Zoom In (+)"
              aria-label="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>

            {/* Current Zoom Indicator */}
            <div className="px-1.5 py-1 rounded bg-slate-950/90 border border-slate-800 text-[10px] font-mono text-slate-300 text-center font-bold">
              {Math.round(zoomLevel * 100)}%
            </div>

            {/* Zoom Out Button */}
            <button
              type="button"
              onClick={handleZoomOut}
              className="p-2 rounded-lg bg-slate-900/90 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 shadow transition-all cursor-pointer"
              title="Zoom Out (−)"
              aria-label="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>

            {/* Re-center / Reset View Button */}
            <button
              type="button"
              onClick={() => centerMap(0.85)}
              className="p-2 rounded-lg bg-slate-900/90 border border-sky-700/60 text-sky-300 hover:text-white hover:bg-sky-950/80 shadow transition-all cursor-pointer"
              title="Re-center Map (Reset View)"
              aria-label="Re-center Map"
            >
              <Crosshair className="w-4 h-4" />
            </button>
          </div>

          {/* Bottom Telemetry HUD Bar with Service Worker Caching Status */}
          <div className="absolute bottom-4 left-4 p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 backdrop-blur-md flex flex-wrap items-center gap-3 text-[11px] font-mono text-slate-300 shadow-xl z-30">
            <span>Grid: <strong className="text-white">17.385°N, 78.486°E</strong></span>
            <span>Altitude: 542m MSL</span>
            <span className="text-rose-400 font-bold">Flood Stage: Level 4 Surge</span>
            <span className="text-slate-600 hidden sm:inline">|</span>
            <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <CheckCircle className="w-3.5 h-3.5" />
              SW Map Cache: {cachedAssetsReady ? 'Active (100% Offline Ready)' : 'Pre-warming...'}
            </span>
            {isOffline && (
              <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 font-bold">
                RADIO-SILENCE / INTERMITTENT ACTIVE
              </span>
            )}
            <span className="text-slate-500 text-[10px] hidden md:inline flex items-center gap-1">
              <Move className="w-3 h-3 inline" /> Drag to pan · Scroll/pinch to zoom
            </span>
          </div>
        </div>

        {/* Marker Inspector Panel (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          {selectedEntity ? (
            <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-xs font-mono font-bold text-sky-400 uppercase tracking-wider">
                  Target Entity Inspection
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  {selectedEntity.type}
                </span>
              </div>

              {/* Infrastructure Inspection */}
              {selectedEntity.type === 'INFRASTRUCTURE' && (
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-white">
                        {selectedEntity.data.id}: {selectedEntity.data.name}
                      </h3>
                      <p className="text-xs text-teal-400">{selectedEntity.data.category}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-teal-950 text-teal-300 border border-teal-800 font-bold">
                      {selectedEntity.data.status}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2 font-mono">
                    {selectedEntity.data.beds && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Emergency Beds:</span>
                        <span className="text-white font-bold">{selectedEntity.data.beds}</span>
                      </div>
                    )}
                    {selectedEntity.data.capacity && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Aircraft Capacity:</span>
                        <span className="text-sky-300 font-bold">{selectedEntity.data.capacity}</span>
                      </div>
                    )}
                    {selectedEntity.data.dailySupply && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Water Output:</span>
                        <span className="text-blue-300 font-bold">{selectedEntity.data.dailySupply}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-slate-400">Tactical Comms:</span>
                      <span className="text-amber-400 font-bold">{selectedEntity.data.radio}</span>
                    </div>
                    {selectedEntity.data.elevation && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Elevation:</span>
                        <span className="text-slate-300 font-bold">{selectedEntity.data.elevation}</span>
                      </div>
                    )}
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-900/40 text-xs text-emerald-300 space-y-1">
                    <strong>Service Worker Offline Resilience:</strong>
                    <p className="text-[11px] text-slate-300">
                      Vector topology & operational telemetry for this facility are cached on-device via Service Worker. Fully operational under radio silence and network drops.
                    </p>
                  </div>
                </div>
              )}

              {/* Request Inspection */}
              {selectedEntity.type === 'REQUEST' && (
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-white">
                        {selectedEntity.data.id}: {selectedEntity.data.requesterName}
                      </h3>
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-rose-400" />
                        <span>{selectedEntity.data.location}</span>
                      </p>
                    </div>
                    <SeverityBadge severity={selectedEntity.data.urgency} size="sm" />
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2 font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Distress Category:</span>
                      <span className="text-white font-bold">{selectedEntity.data.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Headcount:</span>
                      <span className="text-white font-bold">{selectedEntity.data.peopleCount} individuals</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">AI Priority Score:</span>
                      <span className="text-amber-400 font-bold">{selectedEntity.data.priorityScore} / 100</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Nearest Unit:</span>
                      <span className="text-purple-300 font-bold">TEAM-R07 (ETA 18 min)</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                    {selectedEntity.data.description}
                  </p>

                  <div className="p-3 rounded-xl bg-sky-950/30 border border-sky-900/40 text-xs text-sky-300 space-y-1">
                    <strong>Recommended Next Action:</strong>
                    <p className="text-[11px] text-slate-300">
                      Dispatch Amphibious Rescue Unit R-07 with medical trauma stabilization kit.
                    </p>
                  </div>

                  <div className="pt-2 flex items-center justify-between gap-2">
                    <button
                      onClick={() => {
                        dispatchTeam('TEAM-R07', `Dispatched to ${selectedEntity.data.id}`);
                        updateRequestStatus(selectedEntity.data.id, 'ASSIGNED', 'TEAM-R07');
                      }}
                      className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs shadow transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Dispatch Team R-07</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Incident Inspection */}
              {selectedEntity.type === 'INCIDENT' && (
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-white">
                        {selectedEntity.data.id}: {selectedEntity.data.title}
                      </h3>
                      <p className="text-xs text-slate-400">{selectedEntity.data.location}</p>
                    </div>
                    <SeverityBadge severity={selectedEntity.data.severity} size="sm" />
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2 font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-400">People Affected:</span>
                      <span className="text-white font-bold">{selectedEntity.data.peopleAffected.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Assigned Teams:</span>
                      <span className="text-emerald-400 font-bold">{selectedEntity.data.responseTeams.length} Active</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">AI Confidence:</span>
                      <span className="text-sky-300 font-bold">{selectedEntity.data.aiAnalysis.confidence}%</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                    "{selectedEntity.data.aiAnalysis.aiReasoning}"
                  </p>

                  <button
                    onClick={() => setCurrentView('incidents')}
                    className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>View Incident Timeline & Analysis</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Shelter Inspection */}
              {selectedEntity.type === 'SHELTER' && (
                <div className="space-y-3">
                  <div>
                    <h3 className="text-sm font-bold text-white">{selectedEntity.data.name}</h3>
                    <p className="text-xs text-slate-400">{selectedEntity.data.location}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2 font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Occupancy:</span>
                      <span className="text-white font-bold">{selectedEntity.data.occupied} / {selectedEntity.data.capacity} beds</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Free Beds:</span>
                      <span className="text-emerald-400 font-bold">{selectedEntity.data.capacity - selectedEntity.data.occupied}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Water Supply:</span>
                      <span className="text-sky-300 font-bold">{selectedEntity.data.waterStatus}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setCurrentView('shelters')}
                    className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-colors cursor-pointer"
                  >
                    Manage Shelter Operations
                  </button>
                </div>
              )}

              {/* Team Inspection */}
              {selectedEntity.type === 'TEAM' && (
                <div className="space-y-3">
                  <div>
                    <h3 className="text-sm font-bold text-white">{selectedEntity.data.name}</h3>
                    <p className="text-xs text-slate-400">{selectedEntity.data.location}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2 font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Status:</span>
                      <span className="text-purple-300 font-bold">{selectedEntity.data.status}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Vehicle:</span>
                      <span className="text-white font-bold">{selectedEntity.data.vehicle}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Leader:</span>
                      <span className="text-white font-bold">{selectedEntity.data.leaderName}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setCurrentView('teams')}
                    className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-colors cursor-pointer"
                  >
                    Open Dispatch Console
                  </button>
                </div>
              )}

              {/* Active Mission Inspection */}
              {selectedEntity.type === 'MISSION' && (
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                        <Truck className="w-4 h-4 text-purple-400" />
                        Unit Mission: {selectedEntity.data.teamId}
                      </h3>
                      <p className="text-xs text-purple-300">{selectedEntity.data.destinationName}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-950 text-purple-300 border border-purple-800 font-bold animate-pulse">
                      EN ROUTE
                    </span>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-slate-400">Transit Progress:</span>
                      <span className="font-bold text-white">{Math.round(selectedEntity.data.progress * 100)}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
                      <div
                        className="h-full bg-purple-500 rounded-full transition-all duration-300"
                        style={{ width: `${Math.round(selectedEntity.data.progress * 100)}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                      <span>Remaining ETA: <strong className="text-amber-400">{selectedEntity.data.etaMinutes} min</strong></span>
                      <span>Initial: {selectedEntity.data.initialEtaMinutes} min</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1.5 font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Destination:</span>
                      <span className="text-white font-bold">{selectedEntity.data.destinationName}</span>
                    </div>
                    {selectedEntity.data.requestId && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Linked Request:</span>
                        <span className="text-amber-400 font-bold">{selectedEntity.data.requestId}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-slate-400">Incident:</span>
                      <span className="text-rose-400 font-bold">{selectedEntity.data.incidentId}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      fastForwardTeamArrival(selectedEntity.data.teamId);
                      setSelectedEntity({
                        ...selectedEntity,
                        data: {
                          ...selectedEntity.data,
                          progress: 1.0,
                          etaMinutes: 0
                        }
                      });
                    }}
                    className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-950/60 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Fast-Forward Arrival (Simulate Instant Arrival)</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 border border-slate-800 rounded-2xl bg-slate-900/60">
              <Compass className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-xs text-slate-300 font-medium">Click any tactical marker on the map to inspect.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
