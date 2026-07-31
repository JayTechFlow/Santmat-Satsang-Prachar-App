import { ComingSoon } from '../components/ui/ComingSoon';

export function Playlist() {
  return (
    <div style={{ padding: 'var(--space-32)' }}>
      <h1 className="page-title" style={{ marginBottom: '0.25rem' }}>Playlists</h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: 'var(--space-32)' }}>
        Manage custom playlists for audio and bhajans.
      </p>
      
      <ComingSoon 
        moduleName="Playlist Management"
        description="The Playlist module is coming soon. You'll be able to curate collections of audio content for users."
      />
    </div>
  );
}
