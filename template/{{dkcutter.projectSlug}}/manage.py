#!/usr/bin/env python
# ruff: noqa
"""Django's command-line utility for administrative tasks."""
import os
import sys
from pathlib import Path


def main():
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.local")

    try:
        from django.core.management import execute_from_command_line
    except ImportError:
        try:
            import django
        except ImportError as e:
            raise ImportError(
                "Couldn't import Django. Are you sure it's installed and "
                "available on your PYTHONPATH environment variable? Did you "
                "forget to activate a virtual environment?"
            ) from e
        raise

    current_path = Path(__file__).parent.resolve()
    sys.path.append(str(current_path / "{{ dkcutter.projectSlug }}"))
    execute_from_command_line(sys.argv)


if __name__ == "__main__":
    main()
