from django.apps import AppConfig

class ProjectsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'projects'

    def ready(self):
        # Импортируем сигналы при старте приложения
        import projects.signals