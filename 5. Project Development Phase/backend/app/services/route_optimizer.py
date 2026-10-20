import math
from typing import List, Dict, Any, Tuple
from app.models import ActivityModel, RouteOptimizeResponse

EARTH_RADIUS_KM = 6371.0

def haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Computes great-circle distance between two geographic coordinates using the Haversine formula.
    """
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = (math.sin(delta_phi / 2.0) ** 2 +
         math.cos(phi1) * math.cos(phi2) * (math.sin(delta_lambda / 2.0) ** 2))
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))

    return EARTH_RADIUS_KM * c

def calculate_route_distance(activities: List[ActivityModel]) -> float:
    """Calculates cumulative route distance across an ordered list of activities."""
    total_km = 0.0
    for i in range(len(activities) - 1):
        a1 = activities[i]
        a2 = activities[i + 1]
        if a1.latitude and a1.longitude and a2.latitude and a2.longitude:
            total_km += haversine_distance_km(a1.latitude, a1.longitude, a2.latitude, a2.longitude)
    return round(total_km, 2)

def optimize_activity_sequence(activities: List[ActivityModel]) -> RouteOptimizeResponse:
    """
    Activity 4.2: Route & Time Optimization
    Applies Nearest Neighbor & 2-Opt TSP heuristic to sort stops geographically and minimize transit delays.
    """
    if len(activities) <= 2:
        orig_dist = calculate_route_distance(activities)
        return RouteOptimizeResponse(
            optimized_activities=activities,
            original_distance_km=orig_dist,
            optimized_distance_km=orig_dist,
            time_saved_minutes=0,
            route_efficiency_gain="0%",
            transit_segments=[]
        )

    # Filter activities with valid coordinates
    valid_activities = [a for a in activities if a.latitude is not None and a.longitude is not None]
    unpositioned = [a for a in activities if a.latitude is None or a.longitude is None]

    if len(valid_activities) < 2:
        return RouteOptimizeResponse(
            optimized_activities=activities,
            original_distance_km=0.0,
            optimized_distance_km=0.0,
            time_saved_minutes=0,
            route_efficiency_gain="0%",
            transit_segments=[]
        )

    original_distance = calculate_route_distance(valid_activities)

    # 1. Greedy Nearest Neighbor Tour starting from first activity (anchor point like hotel/morning start)
    unvisited = valid_activities[1:]
    current_activity = valid_activities[0]
    ordered_tour = [current_activity]

    while unvisited:
        nearest_idx = 0
        min_dist = float("inf")
        for idx, candidate in enumerate(unvisited):
            dist = haversine_distance_km(
                current_activity.latitude, current_activity.longitude,
                candidate.latitude, candidate.longitude
            )
            if dist < min_dist:
                min_dist = dist
                nearest_idx = idx

        next_stop = unvisited.pop(nearest_idx)
        ordered_tour.append(next_stop)
        current_activity = next_stop

    # 2. Apply 2-opt refinement pass
    improved = True
    iterations = 0
    while improved and iterations < 20:
        improved = False
        iterations += 1
        best_dist = calculate_route_distance(ordered_tour)
        for i in range(1, len(ordered_tour) - 1):
            for j in range(i + 1, len(ordered_tour)):
                new_tour = ordered_tour[:i] + ordered_tour[i:j+1][::-1] + ordered_tour[j+1:]
                new_dist = calculate_route_distance(new_tour)
                if new_dist < best_dist - 0.05:
                    ordered_tour = new_tour
                    best_dist = new_dist
                    improved = True
                    break
            if improved:
                break

    optimized_distance = calculate_route_distance(ordered_tour)
    
    # Calculate transit time saved (assuming average city urban transit speed 20 km/h)
    distance_saved = max(0.0, original_distance - optimized_distance)
    time_saved_mins = int(round((distance_saved / 20.0) * 60))
    efficiency_gain_pct = round((distance_saved / max(original_distance, 0.1)) * 100, 1)

    # Update slot labels & transit notes for sequential ordering
    transit_segments: List[Dict[str, Any]] = []
    slots = ["Morning", "Midday", "Afternoon", "Evening", "Night"]
    
    for idx, act in enumerate(ordered_tour):
        act.order_index = idx + 1
        if idx < len(slots):
            act.time_slot = slots[idx]

        if idx < len(ordered_tour) - 1:
            next_act = ordered_tour[idx + 1]
            seg_dist = haversine_distance_km(act.latitude, act.longitude, next_act.latitude, next_act.longitude)
            # Walking if under 1.5km, otherwise urban transit/taxi
            mode = "Scenic Walk" if seg_dist <= 1.5 else "Transit / Metro"
            dur = int(max(5, round((seg_dist / (4.0 if seg_dist <= 1.5 else 25.0)) * 60)))
            segment_info = {
                "from": act.location_name,
                "to": next_act.location_name,
                "distance_km": round(seg_dist, 2),
                "duration_mins": dur,
                "recommended_mode": mode
            }
            act.transit_info_to_next = segment_info
            transit_segments.append(segment_info)

    # Combine back unpositioned activities at the end
    final_activities = ordered_tour + unpositioned

    return RouteOptimizeResponse(
        optimized_activities=final_activities,
        original_distance_km=original_distance,
        optimized_distance_km=optimized_distance,
        time_saved_minutes=time_saved_mins,
        route_efficiency_gain=f"{efficiency_gain_pct}%",
        transit_segments=transit_segments
    )
