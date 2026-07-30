import React from 'react';
import { Play, Pause, Heart, ExternalLink } from 'lucide-react';
import defaultAlbum from '../../../assets/default_album.png';

/**
 * Reusable SongCard component.
 * Displays cover, title, artist, album name, optional Spotify link, play controls, and favorite toggle.
 */
const SongCard = ({
  title,
  artist,
  album,
  imageUrl,
  spotifyUrl,
  isPlaying = false,
  isFavorite = false,
  onPlayClick,
  onFavoriteClick,
  disabled = false,
  isRemoving = false
}) => {
  return (
    <>
      {/* Mobile Spotify-style Compact List Row Layout */}
      <div 
        onClick={(e) => {
          if (!disabled && onPlayClick) onPlayClick(e);
        }}
        className={`flex md:hidden items-center justify-between p-3 bg-[#181818]/60 hover:bg-[#282828]/60 active:bg-[#282828]/80 border border-neutral-900 rounded-xl gap-3 w-full cursor-pointer transition-all duration-300 ease-out ${
          isRemoving ? 'opacity-0 -translate-y-2 scale-95 pointer-events-none' : 'opacity-100 translate-y-0 scale-100'
        }`}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="relative h-12 w-12 shrink-0 rounded bg-neutral-950 overflow-hidden border border-neutral-800">
            <img
              src={imageUrl || defaultAlbum}
              alt={title}
              className="w-full h-full object-cover select-none pointer-events-none"
            />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className={`font-bold text-sm truncate select-none ${isPlaying ? 'text-[#1db954]' : 'text-neutral-200'}`}>
              {title}
            </h4>
            <p className="text-xs text-neutral-450 truncate select-none">
              {artist} {album && <span className="text-neutral-600 font-normal"> • {album}</span>}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {spotifyUrl && (
            <a
              href={spotifyUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="p-2 text-neutral-450 hover:text-[#1db954] cursor-pointer transition-colors"
              title="Open in Spotify"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (onFavoriteClick) onFavoriteClick(e);
            }}
            disabled={disabled}
            className={`p-2 transition-colors cursor-pointer active:scale-90 duration-100 ${
              isFavorite ? 'text-red-500 hover:text-red-400' : 'text-neutral-500 active:text-red-500'
            }`}
          >
            <Heart className={`h-4.5 w-4.5 ${isFavorite ? 'fill-red-500 text-red-500' : 'fill-none'}`} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (onPlayClick) onPlayClick(e);
            }}
            disabled={disabled}
            className={`h-9 w-9 rounded-full text-black flex items-center justify-center font-bold shadow-md transform transition-all duration-200 active:scale-90 cursor-pointer ${
              isPlaying ? 'bg-neutral-200 hover:bg-neutral-300' : 'bg-[#1db954] hover:bg-[#1ed760]'
            }`}
          >
            {isPlaying ? (
              <Pause className="h-4 w-4 fill-current text-black" />
            ) : (
              <Play className="h-4 w-4 fill-current text-black ml-0.5" />
            )}
          </button>
        </div>
      </div>

      {/* Desktop Card Layout */}
      <div 
        onClick={(e) => {
          if (!disabled && onPlayClick) onPlayClick(e);
        }}
        className={`hidden md:flex flex-col justify-between bg-[#181818] border border-neutral-900 rounded-xl p-4 hover:bg-[#282828] group shadow-md hover:shadow-xl relative cursor-pointer transition-all duration-300 ease-out ${
          isRemoving ? 'opacity-0 -translate-y-2 scale-95 pointer-events-none' : 'opacity-100 translate-y-0 scale-100'
        }`}
      >
        <div className="relative aspect-square w-full rounded-lg bg-neutral-950 overflow-hidden mb-4 border border-neutral-800">
          <img
            src={imageUrl || defaultAlbum}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 select-none pointer-events-none"
          />

          {/* Play Overlay Button */}
          <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-200 ${
            isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onPlayClick) onPlayClick(e);
              }}
              disabled={disabled}
              className={`h-12 w-12 rounded-full bg-[#1db954] text-black flex items-center justify-center font-bold shadow-lg transform transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95 ${
                isPlaying ? 'translate-y-0 scale-105' : 'translate-y-4 group-hover:translate-y-0'
              }`}
            >
              {isPlaying ? (
                <Pause className="h-5 w-5 fill-current text-black" />
              ) : (
                <Play className="h-5 w-5 fill-current text-black ml-0.5" />
              )}
            </button>
          </div>
        </div>

        <div className="space-y-1">
          <h4 className={`font-bold text-sm truncate select-none transition-colors ${isPlaying ? 'text-[#1db954]' : 'text-neutral-200'}`}>
            {title}
          </h4>
          <p className="text-xs text-neutral-400 truncate select-none">{artist}</p>
          {album && (
            <p className="text-[10px] text-neutral-500 truncate select-none">
              {album}
            </p>
          )}
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-neutral-900/60 mt-2">
            {spotifyUrl ? (
              <a
                href={spotifyUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-[10px] text-[#1db954] hover:underline flex items-center gap-1 cursor-pointer transition-colors"
              >
                Link <ExternalLink className="h-3 w-3" />
              </a>
            ) : (
              <span className="text-[10px] text-neutral-600">No URL</span>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onFavoriteClick) onFavoriteClick(e);
              }}
              disabled={disabled}
              className={`transition-colors cursor-pointer hover:scale-110 active:scale-90 duration-100 ${
                isFavorite ? 'text-red-500 hover:text-red-400' : 'text-neutral-500 hover:text-red-500'
              }`}
            >
              <Heart className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : 'fill-none'}`} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default React.memo(SongCard);

