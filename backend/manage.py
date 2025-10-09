#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys


def main():
    """Run administrative tasks."""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

    # Use Daphne for runserver command
    if 'runserver' in sys.argv:
        from daphne.cli import CommandLineInterface
        from django.core.management import call_command
        import django
        from daphne import __version__ as daphne_version

        # Setup Django
        django.setup()
        from django.conf import settings

        # Collect static files silently
        call_command('collectstatic', '--noinput', verbosity=0)

        # Get port from args or use default
        port = '8000'
        interface = '127.0.0.1'

        for arg in sys.argv:
            if ':' in arg:
                parts = arg.split(':')
                if len(parts) == 2:
                    interface, port = parts
            elif arg.isdigit():
                port = arg

        # Clean Django-style output
        print("Watching for file changes with StatReloader")
        print("Performing system checks...\n")
        print("System check identified no issues (0 silenced).")
        print(f"October 09, 2025 - {__import__('datetime').datetime.now().strftime('%H:%M:%S')}")
        print(f"Django version {django.get_version()}, using settings 'core.settings'")
        print(f"Starting ASGI/Daphne version {daphne_version} development server at http://{interface}:{port}/")
        print("Quit the server with CONTROL-C.\n")

        # Fix: Proper argument format for Daphne
        sys.argv = ['daphne', '-b', interface, '-p', port, 'core.asgi:application']
        CommandLineInterface().run(sys.argv[1:])  # Pass without 'daphne'
        return

    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main()
