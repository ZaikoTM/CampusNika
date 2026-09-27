"""
Cliente único de Supabase usando la SERVICE ROLE KEY.

Este cliente se usa exclusivamente en el backend. Bypassea RLS, así que
cada función que lo use debe filtrar explícitamente por user_id — nunca
confiar en que "el cliente ya filtró" porque acá no hay RLS que te cubra.
"""

from supabase import create_client, Client
from config import SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

_supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)


def get_db() -> Client:
    return _supabase
