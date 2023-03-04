import jwt
from os import environ

global_secret = environ.get("BACKEND_SECRET_KEY")


def hash_data(data: str) -> str:
    if not global_secret:
        raise ValueError("BACKEND_SECRET_KEY not set")
    encoded_jwt = jwt.encode({"data": data}, global_secret, algorithm="HS256")
    return encoded_jwt


def check_hash(data: str, hashed: str) -> bool:
    # prin
    if not global_secret:
        raise ValueError("BACKEND_SECRET_KEY not set")
    try:
        decoded = jwt.decode(hashed, global_secret, algorithms=["HS256"])
        return decoded == {"data": data}
    except:
        return False


if __name__ == "__main__":
    print(global_secret)
    h = hash_data("password")
    print(h)
    print(check_hash("password", h))
