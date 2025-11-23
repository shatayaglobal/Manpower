from math import radians, cos, sin, asin, sqrt

def calculate_distance(lat1, lon1, lat2, lon2):
    """
    Calculate distance between two points on Earth using Haversine formula.
    Returns distance in meters.
    """
    # Convert to radians
    lat1, lon1, lat2, lon2 = map(radians, [float(lat1), float(lon1), float(lat2), float(lon2)])

    # Haversine formula
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    c = 2 * asin(sqrt(a))

    # Radius of Earth in meters
    r = 6371000

    return c * r
