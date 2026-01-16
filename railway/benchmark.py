#!/usr/bin/env python3
"""
OR-Tools Optimizer Benchmark: v1 vs v2 Comparison

Bu script v1 ve v2 optimizer versiyonlarını karşılaştırır:
- Execution time (saniye)
- Solution quality (toplam mesafe)
- Memory usage (MB)
- Cache efficiency (sadece v2)
"""

import time
import sys
import tracemalloc
from typing import Dict, Any, List
import random
import json

# Import optimizers
from ortools_optimizer import optimize_routes as optimize_v1
from ortools_optimizer_v2 import optimize_routes as optimize_v2, OptimizerConfig

def generate_test_data(num_customers: int, num_vehicles: int = 5, num_depots: int = 1) -> Dict[str, Any]:
    """Test data generator - rastgele lokasyonlar üret"""

    # Istanbul coordinates (roughly)
    center_lat, center_lng = 41.0082, 28.9784

    # Depots
    depots = []
    for i in range(num_depots):
        depots.append({
            "id": f"depot-{i+1}",
            "location": {
                "lat": center_lat + random.uniform(-0.2, 0.2),
                "lng": center_lng + random.uniform(-0.3, 0.3)
            }
        })

    # Customers
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
            "business_type": random.choice(["restaurant", "hotel", "cafe"]),
            "service_duration": 30,
            "has_time_constraint": False,
        })

    # Vehicles
    vehicles = []
    for i in range(num_vehicles):
        vehicles.append({
            "id": f"vehicle-{i+1}",
            "type": 2,
            "capacity_pallets": random.randint(10, 15),
            "fuel_consumption": 25.0,
        })

    return {
        "depots": depots,
        "customers": customers,
        "vehicles": vehicles,
        "fuel_price": 47.5
    }


def run_benchmark(data: Dict[str, Any], version: str, config: OptimizerConfig = None) -> Dict[str, Any]:
    """Single benchmark run"""

    print(f"  Running {version}...", end=" ", flush=True)

    # Memory tracking başlat
    tracemalloc.start()

    # Başlangıç zamanı
    start_time = time.time()

    try:
        if version == "v1":
            result = optimize_v1(
                depots=data["depots"],
                customers=data["customers"],
                vehicles=data["vehicles"],
                fuel_price=data["fuel_price"]
            )
        else:  # v2
            result = optimize_v2(
                depots=data["depots"],
                customers=data["customers"],
                vehicles=data["vehicles"],
                fuel_price=data["fuel_price"],
                config=config
            )

        # Süre hesapla
        elapsed_time = time.time() - start_time

        # Memory usage
        current, peak = tracemalloc.get_traced_memory()
        tracemalloc.stop()

        # Solution quality
        total_distance = result["summary"]["total_distance_km"]
        num_routes = len(result["routes"])

        print(f"✓ {elapsed_time:.2f}s, {total_distance:.1f}km, {num_routes} routes")

        return {
            "success": True,
            "time_seconds": round(elapsed_time, 2),
            "total_distance_km": round(total_distance, 2),
            "num_routes": num_routes,
            "memory_mb": round(peak / 1024 / 1024, 2),
            "error": None
        }

    except Exception as e:
        tracemalloc.stop()
        elapsed_time = time.time() - start_time
        print(f"✗ Error: {str(e)}")
        return {
            "success": False,
            "time_seconds": round(elapsed_time, 2),
            "error": str(e)
        }


def print_comparison_table(results: List[Dict[str, Any]]):
    """Print comparison table"""

    print("\n" + "="*80)
    print("BENCHMARK RESULTS SUMMARY")
    print("="*80)

    print(f"\n{'Test Case':<30} {'v1 Time':<12} {'v2 Time':<12} {'Speedup':<10}")
    print("-"*80)

    for result in results:
        test_name = result["test_name"]
        v1_time = result["v1"]["time_seconds"] if result["v1"]["success"] else "FAIL"
        v2_time = result["v2"]["time_seconds"] if result["v2"]["success"] else "FAIL"

        if result["v1"]["success"] and result["v2"]["success"]:
            speedup = result["v1"]["time_seconds"] / result["v2"]["time_seconds"]
            speedup_str = f"{speedup:.2f}x"
            improvement_pct = ((result["v1"]["time_seconds"] - result["v2"]["time_seconds"]) / result["v1"]["time_seconds"]) * 100

            v1_time_str = f"{v1_time}s"
            v2_time_str = f"{v2_time}s"
        else:
            speedup_str = "N/A"
            v1_time_str = str(v1_time)
            v2_time_str = str(v2_time)

        print(f"{test_name:<30} {v1_time_str:<12} {v2_time_str:<12} {speedup_str:<10}")

    print("\n" + "="*80)
    print("SOLUTION QUALITY")
    print("="*80)

    print(f"\n{'Test Case':<30} {'v1 Distance':<15} {'v2 Distance':<15} {'Improvement':<12}")
    print("-"*80)

    for result in results:
        test_name = result["test_name"]

        if result["v1"]["success"] and result["v2"]["success"]:
            v1_dist = result["v1"]["total_distance_km"]
            v2_dist = result["v2"]["total_distance_km"]
            improvement_pct = ((v1_dist - v2_dist) / v1_dist) * 100

            v1_dist_str = f"{v1_dist:.1f} km"
            v2_dist_str = f"{v2_dist:.1f} km"
            improvement_str = f"{improvement_pct:+.1f}%"
        else:
            v1_dist_str = "FAIL"
            v2_dist_str = "FAIL"
            improvement_str = "N/A"

        print(f"{test_name:<30} {v1_dist_str:<15} {v2_dist_str:<15} {improvement_str:<12}")

    print("\n" + "="*80)
    print("MEMORY USAGE")
    print("="*80)

    print(f"\n{'Test Case':<30} {'v1 Memory':<15} {'v2 Memory':<15} {'Reduction':<12}")
    print("-"*80)

    for result in results:
        test_name = result["test_name"]

        if result["v1"]["success"] and result["v2"]["success"]:
            v1_mem = result["v1"]["memory_mb"]
            v2_mem = result["v2"]["memory_mb"]
            reduction_pct = ((v1_mem - v2_mem) / v1_mem) * 100

            v1_mem_str = f"{v1_mem:.1f} MB"
            v2_mem_str = f"{v2_mem:.1f} MB"
            reduction_str = f"{reduction_pct:+.1f}%"
        else:
            v1_mem_str = "FAIL"
            v2_mem_str = "FAIL"
            reduction_str = "N/A"

        print(f"{test_name:<30} {v1_mem_str:<15} {v2_mem_str:<15} {reduction_str:<12}")

    # Overall average
    print("\n" + "="*80)
    print("OVERALL AVERAGES (successful runs only)")
    print("="*80)

    successful_results = [r for r in results if r["v1"]["success"] and r["v2"]["success"]]

    if successful_results:
        avg_v1_time = sum(r["v1"]["time_seconds"] for r in successful_results) / len(successful_results)
        avg_v2_time = sum(r["v2"]["time_seconds"] for r in successful_results) / len(successful_results)
        avg_speedup = avg_v1_time / avg_v2_time

        avg_v1_dist = sum(r["v1"]["total_distance_km"] for r in successful_results) / len(successful_results)
        avg_v2_dist = sum(r["v2"]["total_distance_km"] for r in successful_results) / len(successful_results)
        avg_improvement = ((avg_v1_dist - avg_v2_dist) / avg_v1_dist) * 100

        avg_v1_mem = sum(r["v1"]["memory_mb"] for r in successful_results) / len(successful_results)
        avg_v2_mem = sum(r["v2"]["memory_mb"] for r in successful_results) / len(successful_results)
        avg_mem_reduction = ((avg_v1_mem - avg_v2_mem) / avg_v1_mem) * 100

        print(f"\nExecution Time:  v1={avg_v1_time:.2f}s, v2={avg_v2_time:.2f}s, speedup={avg_speedup:.2f}x")
        print(f"Solution Quality: v1={avg_v1_dist:.1f}km, v2={avg_v2_dist:.1f}km, improvement={avg_improvement:+.1f}%")
        print(f"Memory Usage:    v1={avg_v1_mem:.1f}MB, v2={avg_v2_mem:.1f}MB, reduction={avg_mem_reduction:+.1f}%")


def main():
    print("OR-Tools Optimizer Benchmark: v1 vs v2")
    print("="*80)

    # Test configurations
    test_configs = [
        {"name": "Small (10 customers, 3 vehicles)", "customers": 10, "vehicles": 3, "depots": 1},
        {"name": "Medium (25 customers, 5 vehicles)", "customers": 25, "vehicles": 5, "depots": 1},
        {"name": "Large (50 customers, 8 vehicles)", "customers": 50, "vehicles": 8, "depots": 1},
        {"name": "XLarge (75 customers, 10 vehicles)", "customers": 75, "vehicles": 10, "depots": 1},
        {"name": "Multi-depot (30 customers, 3 depots)", "customers": 30, "vehicles": 6, "depots": 3},
    ]

    # v2 optimizer config (default best settings)
    v2_config = OptimizerConfig(
        time_limit_seconds=45,
        search_strategy="SAVINGS",
        use_local_search=True,
        enable_time_windows=False
    )

    all_results = []

    for test_config in test_configs:
        print(f"\n\n{'='*80}")
        print(f"TEST: {test_config['name']}")
        print(f"{'='*80}")

        # Generate test data
        print(f"Generating test data...")
        data = generate_test_data(
            num_customers=test_config["customers"],
            num_vehicles=test_config["vehicles"],
            num_depots=test_config["depots"]
        )

        print(f"  Depots: {len(data['depots'])}")
        print(f"  Customers: {len(data['customers'])}")
        print(f"  Vehicles: {len(data['vehicles'])}")

        # Run v1
        v1_result = run_benchmark(data, "v1")

        # Run v2
        v2_result = run_benchmark(data, "v2", v2_config)

        # Store results
        all_results.append({
            "test_name": test_config["name"],
            "config": test_config,
            "v1": v1_result,
            "v2": v2_result
        })

    # Print comparison table
    print_comparison_table(all_results)

    # Save results to JSON
    output_file = "benchmark_results.json"
    with open(output_file, "w") as f:
        json.dump(all_results, f, indent=2)
    print(f"\n\nDetailed results saved to: {output_file}")
    print("="*80)


if __name__ == "__main__":
    main()
