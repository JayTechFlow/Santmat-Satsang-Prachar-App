import React from 'react';
import { Smartphone, CheckCircle, Info } from 'lucide-react';
import { ImageProfile, getImageProfile } from '../../lib/media/profiles/imageProfiles';

export interface AdminAspectRatioPreviewProps {
  imageUrl?: string;
  profile: ImageProfile | string;
  title?: string;
  subtitle?: string;
  className?: string;
}

export const AdminAspectRatioPreview: React.FC<AdminAspectRatioPreviewProps> = ({
  imageUrl,
  profile: profileProp,
  title,
  subtitle,
  className = '',
}) => {
  const profile = typeof profileProp === 'string' ? getImageProfile(profileProp) : profileProp;
  const ctx = profile.androidContext;

  return (
    <div
      className={`p-4 sm:p-5 bg-stone-900 text-stone-100 rounded-xl border border-stone-800 shadow-lg space-y-3.5 font-['Mukta'] ${className}`}
    >
      {/* Header Info */}
      <div className="flex items-center justify-between text-xs pb-2 border-b border-stone-800">
        <div className="flex items-center gap-1.5 text-amber-400 font-bold uppercase tracking-wider">
          <Smartphone className="w-3.5 h-3.5" />
          <span>एंड्रॉइड मोबाइल पूर्वावलोकन (Android Preview)</span>
        </div>
        <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-mono text-[11px] font-bold">
          {profile.aspectRatioLabel} • {profile.targetWidth}×{profile.targetHeight}
        </span>
      </div>

      {/* Simulated Android Container */}
      <div className="flex flex-col items-center justify-center p-3 bg-stone-950/60 rounded-lg border border-stone-800/60">
        <div
          style={{
            width: `${Math.min(ctx.previewWidthPx, 320)}px`,
            aspectRatio: `${profile.aspectRatio}`,
            borderRadius: `${ctx.borderRadiusPx}px`,
          }}
          className="relative overflow-hidden bg-stone-800 shadow-md border border-stone-700/50 flex items-center justify-center group"
        >
          {imageUrl ? (
            <img
              src={imageUrl}
              alt="Android Preview"
              style={{ objectFit: profile.fitMode }}
              className="w-full h-full"
            />
          ) : (
            <div className="text-center p-4 text-stone-500 text-xs">
              <span>कोई इमेज चयनित नहीं</span>
            </div>
          )}

          {/* Contextual Android Overlays based on profile */}
          {profile.id === 'banner' && imageUrl && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent flex flex-col justify-end p-3 pointer-events-none">
              <span className="text-xs font-bold text-white line-clamp-1">
                {title || 'दैनिक सत्संग एवं प्रार्थना'}
              </span>
              <span className="text-[10px] text-stone-300 line-clamp-1">
                {subtitle || 'संतमत सत्संग प्रचार'}
              </span>
            </div>
          )}

        </div>

        <div className="text-[11px] text-stone-400 mt-2 text-center">
          घटक: <strong className="text-stone-300">{ctx.componentName}</strong> ({ctx.renderMode})
        </div>
      </div>

      {/* Guidance footer */}
      <div className="flex items-start gap-2 text-[11px] text-stone-400 bg-stone-800/40 p-2.5 rounded-xl">
        <Info className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
        <span>{ctx.descriptionHi}</span>
      </div>
    </div>
  );
};
