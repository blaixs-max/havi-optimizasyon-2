#!/usr/bin/env python3
"""
OR-Tools Configuration Benchmark

Bu script farklı OR-Tools konfigürasyonlarının performansını test eder:
- Farklı search strategies
- Farklı time limits
- Local search on/off
- Time windows on/off
"""

import time
import random
from typing import Dict, Any, List
from ortools_optimizer_v2 import optimize_routes, OptimizerConfig

def generate_test_data(num_customers: int = 50) -> Dict[str, Any]:
    """Test data generator"""

    center_lat, center_lng = 41.0082, 28.9784

    depots = [{
        "id": "depot-1",
        "location": {"lat": center_lat, "lng": center_lng}
    }]

    customers = []
    for i in range(num_customers):
        customers.append({
            "id": f"customer-{i+1}",
            "name": f"Müşteri {i+1}",
            "location": {
                "lat": center_lat + random.uniform(-0.5, 0.5),
                "lng": center_lng + random.uniform(-0.7, 0.7)
            },
            "demand_pallets": random.randint(1, 8),
            "business_type": "restaurant",
            "service_duration": 30,
            "has_time_constraint": False,
        })

    vehicles = []
    for i in range(8):
        vehicles.append({
            "id": f"vehicle-{i+1}",
            "type": 2,
            "capacity_pallets": 12,
            "fuel_consumption": 25.0,
        })

    return {
        "depots": depots,
        "customers": customers,
        "vehicles": vehicles,
        "fuel_price": 47.5
    }


def run_test(data: Dict[str, Any], config: OptimizerConfig, config_name: str) -> Dict[str, Any]:
    """Run single test"""

    print(f"  Testing: {config_name}...", end=" ", flush=True)

    start_time = time.time()

    try:
        result = optimize_routes(
            depots=data["depots"],
            customers=data["customers"],
            vehicles=data["vehicles"],
            fuel_price=data["fuel_price"],
            config=config
        )

        elapsed_time = time.time() - start_time
        total_distance = result["summary"]["total_distance_km"]
        num_routes = len(result["routes"])

        print(f"✓ {elapsed_time:.2f}s, {total_distance:.1f}km, {num_routes} routes")

        return {
            "success": True,
            "config_name": config_name,
            "time_seconds": round(elapsed_time, 2),
            "total_distance_km": round(total_distance, 2),
            "num_routes": num_routes,
            "config": {
                "time_limit": config.time_limit_seconds,
                "strategy": config.search_strategy,
                "local_search": config.use_local_search,
                "time_windows": config.enable_time_windows,
            }
        }

    except Exception as e:
        elapsed_time = time.time() - start_time
        print(f"✗ Error: {str(e)}")
        return {
            "success": False,
            "config_name": config_name,
            "time_seconds": round(elapsed_time, 2),
            "error": str(e)
        }


def main():
    print("="*80)
    print("OR-Tools Configuration Benchmark")
    print("="*80)

    # Generate test data
    print("\nGenerating test data (50 customers)...")
    data = generate_test_data(num_customers=50)

    # Test configurations
    configs = [
        # Search strategy comparison
        ("SAVINGS + Local Search (default)", OptimizerConfig(
            time_limit_seconds=45,
            search_strategy="SAVINGS",
            use_local_search=True
        )),
        ("PATH_CHEAPEST_ARC + Local Search", OptimizerConfig(
            time_limit_seconds=45,
            search_strategy="PATH_CHEAPEST_ARC",
            use_local_search=True
        )),
        ("PARALLEL_CHEAPEST_INSERTION + LS", OptimizerConfig(
            time_limit_seconds=45,
            search_strategy="PARALLEL_CHEAPEST_INSERTION",
            use_local_search=True
        )),
        ("LOCAL_CHEAPEST_INSERTION + LS", OptimizerConfig(
            time_limit_seconds=45,
            search_strategy="LOCAL_CHEAPEST_INSERTION",
            use_local_search=True
        )),
        ("AUTOMATIC + Local Search", OptimizerConfig(
            time_limit_seconds=45,
            search_strategy="AUTOMATIC",
            use_local_search=True
        )),

        # Local search comparison
        ("SAVINGS without Local Search", OptimizerConfig(
            time_limit_seconds=45,
            search_strategy="SAVINGS",
            use_local_search=False
        )),

        # Time limit comparison
        ("SAVINGS + LS (15s time limit)", OptimizerConfig(
            time_limit_seconds=15,
            search_strategy="SAVINGS",
            use_local_search=True
        )),
        ("SAVINGS + LS (30s time limit)", OptimizerConfig(
            time_limit_seconds=30,
            search_strategy="SAVINGS",
            use_local_search=True
        )),
        ("SAVINGS + LS (60s time limit)", OptimizerConfig(
            time_limit_seconds=60,
            search_strategy="SAVINGS",
            use_local_search=True
        )),
    ]

    print("\n" + "="*80)
    print("RUNNING TESTS")
    print("="*80)

    results = []
    for config_name, config in configs:
        result = run_test(data, config, config_name)
        results.append(result)

    # Print results table
    print("\n" + "="*80)
    print("RESULTS SUMMARY")
    print("="*80)

    print(f"\n{'Configuration':<40} {'Time':<10} {'Distance':<12} {'Routes':<8}")
    print("-"*80)

    for result in results:
        if result["success"]:
            config_name = result["config_name"]
            time_str = f"{result['time_seconds']:.2f}s"
            dist_str = f"{result['total_distance_km']:.1f} km"
            routes_str = str(result["num_routes"])

            print(f"{config_name:<40} {time_str:<10} {dist_str:<12} {routes_str:<8}")
        else:
            print(f"{result['config_name']:<40} FAILED")

    # Find best configuration for each metric
    successful_results = [r for r in results if r["success"]]

    if successful_results:
        fastest = min(successful_results, key=lambda x: x["time_seconds"])
        shortest = min(successful_results, key=lambda x: x["total_distance_km"])

        print("\n" + "="*80)
        print("RECOMMENDATIONS")
        print("="*80)

        print(f"\n🚀 Fastest Configuration:")
        print(f"   {fastest['config_name']}")
        print(f"   Time: {fastest['time_seconds']:.2f}s, Distance: {fastest['total_distance_km']:.1f}km")

        print(f"\n🎯 Best Solution Quality:")
        print(f"   {shortest['config_name']}")
        print(f"   Time: {shortest['time_seconds']:.2f}s, Distance: {shortest['total_distance_km']:.1f}km")

        # Balance recommendation
        # Find config with good time/quality balance (within 10% of best distance, minimize time)
        quality_threshold = shortest['total_distance_km'] * 1.10
        balanced_candidates = [r for r in successful_results if r['total_distance_km'] <= quality_threshold]
        balanced = min(balanced_candidates, key=lambda x: x['time_seconds'])

        print(f"\n⚖️  Best Balance (speed + quality):")
        print(f"   {balanced['config_name']}")
        print(f"   Time: {balanced['time_seconds']:.2f}s, Distance: {balanced['total_distance_km']:.1f}km")

        print("\n" + "="*80)


if __name__ == "__main__":
    random.seed(42)  # Reproducible results
    main()
