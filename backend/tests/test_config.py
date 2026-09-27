from app.config import Settings


def test_neon_url_keeps_ssl_options_and_uses_installed_driver():
    for scheme in ("postgres", "postgresql", "postgresql+psycopg"):
        config = Settings(
            _env_file=None,
            database_url=f"{scheme}://user:password@host/db?sslmode=require&channel_binding=require",
            jwt_secret_key="test-secret-0123456789abcdef0123456789",
            database_pool_mode="serverless",
        )
        assert config.database_url == "postgresql+psycopg://user:password@host/db?sslmode=require&channel_binding=require"
        assert config.database_pool_mode == "serverless"
