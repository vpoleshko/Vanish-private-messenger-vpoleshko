from app.entities.room import RoomEntity, SecuritySettingsEntity
from app.models.room import Room
from app.models.room_security_settings import RoomSecuritySettings


class RoomMapper:
    @staticmethod
    def to_entity(model: Room) -> RoomEntity:
        sec = model.security_settings
        return RoomEntity(
            id=model.id,
            room_code_hash=model.room_code_hash,
            created_at=model.created_at,
            expires_at=model.expires_at,
            status=model.status,
            privacy_mode=model.privacy_mode,
            max_participants=model.max_participants,
            security=SecuritySettingsEntity(
                e2ee_enabled=sec.e2ee_enabled,
                padding_enabled=sec.padding_enabled,
                packet_size=sec.packet_size,
                random_delay_enabled=sec.random_delay_enabled,
                min_delay_ms=sec.min_delay_ms,
                max_delay_ms=sec.max_delay_ms,
                mini_mix_enabled=sec.mini_mix_enabled,
                batch_window_ms=sec.batch_window_ms,
                dummy_traffic_enabled=sec.dummy_traffic_enabled,
                room_ttl_seconds=sec.room_ttl_seconds,
            ),
        )

    @staticmethod
    def to_model(entity: RoomEntity) -> Room:
        return Room(
            room_code_hash=entity.room_code_hash,
            expires_at=entity.expires_at,
            status=entity.status,
            privacy_mode=entity.privacy_mode,
            max_participants=entity.max_participants,
        )

    @staticmethod
    def security_to_model(entity: RoomEntity, room_id: int) -> RoomSecuritySettings:
        s = entity.security
        return RoomSecuritySettings(
            room_id=room_id,
            e2ee_enabled=s.e2ee_enabled,
            padding_enabled=s.padding_enabled,
            packet_size=s.packet_size,
            random_delay_enabled=s.random_delay_enabled,
            min_delay_ms=s.min_delay_ms,
            max_delay_ms=s.max_delay_ms,
            mini_mix_enabled=s.mini_mix_enabled,
            batch_window_ms=s.batch_window_ms,
            dummy_traffic_enabled=s.dummy_traffic_enabled,
            room_ttl_seconds=s.room_ttl_seconds,
        )
