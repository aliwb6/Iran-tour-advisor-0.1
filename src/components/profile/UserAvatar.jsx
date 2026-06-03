import { useNavigate } from 'react-router-dom';
import { Camera } from 'lucide-react';

export default function UserAvatar({ profile, userId, onSave, size = 132, editable = true }) {
  const navigate = useNavigate();

  const initial = profile?.full_name?.[0]?.toUpperCase() || '?';

  return (
    <div className="relative inline-block flex-shrink-0" style={{ width: size, height: size }}>
      <div className="absolute inset-0 rounded-full border-2 border-gold/60 shadow-[0_8px_40px_rgba(0,0,0,0.45)] overflow-hidden bg-accent flex items-center justify-center">
        {profile?.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt=""
            className="w-full h-full object-cover object-center"
          />
        ) : (
          <span className="font-bold text-white leading-none" style={{ fontSize: Math.round(size * 0.3) }}>
            {initial}
          </span>
        )}
      </div>

      {editable && (
        <button
          onClick={() => navigate('/profile/settings')}
          className="absolute bottom-0 end-0 w-10 h-10 rounded-full bg-gold hover:bg-gold-light text-navy shadow-lg flex items-center justify-center transition-all border-2 border-background"
          aria-label="Change avatar"
        >
          <Camera className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
