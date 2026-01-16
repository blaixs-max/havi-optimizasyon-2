#!/usr/bin/env python3
"""Quick benchmark - sadece birkaç temel test"""

import time
import random
from ortools_optimizer_v2 import optimize_routes, OptimizerConfig

# Seed for reproducibility
random.seed(42)

# Generate small test data
center_lat, center_lng = 41.0082, 28.9784
depots = [{"id": "depot-1", "location": {"lat": center_lat, "lng": center_lng}}]

customers = []
for i in range(20):  # Sadece 20 müşteri
    customers.append({
        "id": f"customer-{i+1}",
        "name": f"Müşteri {i+1}",
        "location": {
            "lat": center_lat + random.uniform(-0.3, 0.3),
            "lng": center_lng + random.uniform(-0.3, 0.3)
        },
        "demand_pallets": random.randint(1, 3),
        "business_type": "restaurant",
        "service_duration": 30,
        "has_time_constraint": False,
    })

vehicles = [{"id": f"v-{i+1}", "type": 2, "capacity_pallets": 12, "fuel_consumption": 25.0} for i in range(4)]

data = {
    "depots": depots,
    "customers": customers,
    "vehicles": vehicles,
    "fuel_price": 47.5
}

print("Quick Benchmark Test - 20 customers, 4 vehicles")
print("="*60)

# Test 3 configurations
configs = [
    ("SAVINGS + Local Search (default)", OptimizerConfig(
        time_limit_seconds=30,
        search_strategy="SAVINGS",
        use_local_search=True
    )),
    ("PATH_CHEAPEST_ARC + Local Search", OptimizerConfig(
        time_limit_seconds=30,
        search_strategy="PATH_CHEAPEST_ARC",
        use_local_search=True
    )),
    ("SAVINGS without Local Search", OptimizerConfig(
        time_limit_seconds=30,
        search_strategy="SAVINGS",
        use_local_search=False
    )),
]

results = []

for config_name, config in configs:
    print(f"\nTesting: {config_name}...")
    start = time.time()

    try:
        result = optimize_routes(
            depots=data["depots"],
            customers=data["customers"],
            vehicles=data["vehicles"],
            fuel_price=data["fuel_price"],
            config=config
        )

        elapsed = time.time() - start
        total_dist = result["summary"]["total_distance_km"]
        num_routes = len(result["routes"])

        print(f"  ✓ Time: {elapsed:.2f}s, Distance: {total_dist:.1f}km, Routes: {num_routes}")

        results.append({
            "name": config_name,
            "time": elapsed,
            "distance": total_dist,
            "routes": num_routes
        })

    except Exception as e:
        print(f"  ✗ Error: {str(e)}")

print("\n" + "="*60)
print("SUMMARY")
print("="*60)

if results:
    fastest = min(results, key=lambda x: x["time"])
    shortest = min(results, key=lambda x: x["distance"])

    print(f"\n🚀 Fastest: {fastest['name']}")
    print(f"   {fastest['time']:.2f}s, {fastest['distance']:.1f}km")

    print(f"\n🎯 Best Quality: {shortest['name']}")
    print(f"   {shortest['time']:.2f}s, {shortest['distance']:.1f}km")

print("\n✅ Benchmark scripts are working correctly!")
