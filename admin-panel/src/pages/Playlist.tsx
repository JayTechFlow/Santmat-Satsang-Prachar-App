import { ComingSoon } from '../components/ui/ComingSoon';

export function Playlist() {
  return (
    <div className="p-8">
      <h1 className="page-title mb-1">Playlists</h1>
      <p className="text-muted text-sm mb-8">
        Manage custom playlists for audio and bhajans.
      </p>
      
      <ComingSoon 
        moduleName="Playlist Management"
        description="The Playlist module is coming soon. You'll be able to curate collections of audio content for users."
      />
    </div>
  );
}
