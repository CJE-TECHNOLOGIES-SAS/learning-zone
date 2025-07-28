from dataclasses import dataclass
from typing import Optional


@dataclass
class StudentEntity:
    """Domain entity representation of a student."""

    id: Optional[int]
    identification_number: int
    names: str
    last_names: str
    email: str
    is_verified: bool = False
