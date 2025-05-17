def calculate_efficiency(temp: float) -> float:
    if temp >= 28.0:
        return 100.0
    elif temp <= 24.0:
        return 75.0
    else:
        return 75.0 + (temp - 24.0) * (25.0 / 4.0)
