def greet(name):
    """Greet a person by name."""
    return f"Hello, {name}!"


def add(a, b):
    """Add two numbers together."""
    return a + b


def main():
    """Main function demonstrating basic functionality."""
    print(greet("World"))
    result = add(5, 3)
    print(f"5 + 3 = {result}")


if __name__ == "__main__":
    main()
