package main

import (
	"fmt"
	"math"
)

func main() {
	fmt.Println("=== Mathematics Utility Demo ===")

	// Calculate factorial
	n := 5
	fmt.Printf("Factorial of %d = %d\n", n, factorial(n))

	// Calculate fibonacci
	fmt.Printf("Fibonacci sequence up to %d terms: ", n)
	for i := 0; i < n; i++ {
		fmt.Printf("%d ", fibonacci(i))
	}
	fmt.Println()

	// Calculate prime numbers
	limit := 50
	fmt.Printf("Prime numbers up to %d: ", limit)
	primes := sieveOfEratosthenes(limit)
	for _, p := range primes {
		fmt.Printf("%d ", p)
	}
	fmt.Println()

	// Calculate circle area
	radius := 5.0
	fmt.Printf("Circle area with radius %.2f = %.2f\n", radius, circleArea(radius))

	// Calculate GCD
	a, b := 48, 18
	fmt.Printf("GCD of %d and %d = %d\n", a, b, gcd(a, b))

	fmt.Println("=== Demo Complete ===")
}

// factorial calculates n!
func factorial(n int) int {
	if n <= 1 {
		return 1
	}
	return n * factorial(n-1)
}

// fibonacci returns the nth Fibonacci number
func fibonacci(n int) int {
	if n <= 1 {
		return n
	}
	return fibonacci(n-1) + fibonacci(n-2)
}

// sieveOfEratosthenes finds all primes up to n
func sieveOfEratosthenes(n int) []int {
	if n < 2 {
		return []int{}
	}

	sieve := make([]bool, n+1)
	for i := 2; i <= n; i++ {
		sieve[i] = true
	}

	for p := 2; p*p <= n; p++ {
		if sieve[p] {
			for i := p * p; i <= n; i += p {
				sieve[i] = false
			}
		}
	}

	primes := []int{}
	for i := 2; i <= n; i++ {
		if sieve[i] {
			primes = append(primes, i)
		}
	}
	return primes
}

// circleArea calculates the area of a circle
func circleArea(radius float64) float64 {
	return math.Pi * radius * radius
}

// gcd calculates the greatest common divisor using Euclidean algorithm
func gcd(a, b int) int {
	for b != 0 {
		a, b = b, a%b
	}
	return a
}
