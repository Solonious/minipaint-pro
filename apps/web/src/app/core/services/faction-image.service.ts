import { Injectable, inject, signal } from '@angular/core';
import { StorageService } from './storage.service';

export interface FactionImageResult {
  imageUrl: string;
  thumbnailUrl: string;
  source: string;
  title: string;
}

interface CachedImageData {
  faction: string;
  imageUrl: string;
  timestamp: number;
}

const IMAGE_CACHE_KEY = 'faction_images_cache';
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

// Curated high-quality faction artwork from WallpaperFlare
// These are direct image URLs from reliable sources
const FACTION_IMAGE_MAP: Record<string, string> = {
  // Space Marines / Chapters
  'adeptus-astartes': 'https://c4.wallpaperflare.com/wallpaper/39/346/426/digital-art-artwork-video-games-warhammer-40-000-wallpaper-preview.jpg',
  'ultramarines': 'https://c4.wallpaperflare.com/wallpaper/748/67/451/warhammer-40-000-spacemarine-hd-wallpaper-preview.jpg',
  'blood-angels': 'https://c4.wallpaperflare.com/wallpaper/675/890/451/warhammer-40-000-blood-angels-sanguinius-space-marines-wallpaper-preview.jpg',
  'dark-angels': 'https://c4.wallpaperflare.com/wallpaper/467/376/969/dark-angels-warhammer-40-000-space-marines-artwork-wallpaper-preview.jpg',
  'space-wolves': 'https://c4.wallpaperflare.com/wallpaper/986/741/564/warhammer-40-000-space-wolves-primarch-leman-russ-space-marines-wallpaper-preview.jpg',
  'imperial-fists': 'https://c4.wallpaperflare.com/wallpaper/675/890/451/warhammer-40-000-blood-angels-sanguinius-space-marines-wallpaper-preview.jpg',
  'iron-hands': 'https://c4.wallpaperflare.com/wallpaper/39/346/426/digital-art-artwork-video-games-warhammer-40-000-wallpaper-preview.jpg',
  'raven-guard': 'https://c4.wallpaperflare.com/wallpaper/39/346/426/digital-art-artwork-video-games-warhammer-40-000-wallpaper-preview.jpg',
  'salamanders': 'https://c4.wallpaperflare.com/wallpaper/39/346/426/digital-art-artwork-video-games-warhammer-40-000-wallpaper-preview.jpg',
  'white-scars': 'https://c4.wallpaperflare.com/wallpaper/39/346/426/digital-art-artwork-video-games-warhammer-40-000-wallpaper-preview.jpg',

  // Imperium
  'astra-militarum': 'https://c4.wallpaperflare.com/wallpaper/673/568/728/warhammer-40-000-astra-militarum-war-army-wallpaper-preview.jpg',
  'adeptus-mechanicus': 'https://c4.wallpaperflare.com/wallpaper/39/455/825/cyborg-machine-adeptus-mechanicus-warhammer-40-000-wallpaper-preview.jpg',
  'adeptus-custodes': 'https://c4.wallpaperflare.com/wallpaper/534/896/606/adeptus-custodes-warhammer-40-000-golden-elite-wallpaper-preview.jpg',
  'sisters-of-battle': 'https://c4.wallpaperflare.com/wallpaper/277/584/728/warhammer-40-000-adepta-sororitas-sisters-of-battle-warrior-wallpaper-preview.jpg',
  'imperial-knights': 'https://c4.wallpaperflare.com/wallpaper/247/946/103/warhammer-40-000-imperial-knight-titan-mech-wallpaper-preview.jpg',
  'inquisition': 'https://c4.wallpaperflare.com/wallpaper/39/346/426/digital-art-artwork-video-games-warhammer-40-000-wallpaper-preview.jpg',
  'imperial-aquila': 'https://c4.wallpaperflare.com/wallpaper/39/346/426/digital-art-artwork-video-games-warhammer-40-000-wallpaper-preview.jpg',

  // Chaos
  'chaos': 'https://c4.wallpaperflare.com/wallpaper/502/816/949/warhammer-40-000-chaos-space-marine-chaos-digital-art-wallpaper-preview.jpg',
  'black-legion': 'https://c4.wallpaperflare.com/wallpaper/502/816/949/warhammer-40-000-chaos-space-marine-chaos-digital-art-wallpaper-preview.jpg',
  'death-guard': 'https://c4.wallpaperflare.com/wallpaper/632/785/1006/warhammer-40-000-death-guard-nurgle-chaos-wallpaper-preview.jpg',
  'thousand-sons': 'https://c4.wallpaperflare.com/wallpaper/447/89/700/warhammer-40-000-thousand-sons-tzeentch-chaos-wallpaper-preview.jpg',
  'world-eaters': 'https://c4.wallpaperflare.com/wallpaper/617/478/932/warhammer-40-000-khorne-world-eaters-chaos-wallpaper-preview.jpg',
  'emperors-children': 'https://c4.wallpaperflare.com/wallpaper/502/816/949/warhammer-40-000-chaos-space-marine-chaos-digital-art-wallpaper-preview.jpg',
  'chaos-knights': 'https://c4.wallpaperflare.com/wallpaper/247/946/103/warhammer-40-000-imperial-knight-titan-mech-wallpaper-preview.jpg',
  'chaos-daemons': 'https://c4.wallpaperflare.com/wallpaper/617/478/932/warhammer-40-000-khorne-world-eaters-chaos-wallpaper-preview.jpg',
  'khorne': 'https://c4.wallpaperflare.com/wallpaper/617/478/932/warhammer-40-000-khorne-world-eaters-chaos-wallpaper-preview.jpg',
  'nurgle': 'https://c4.wallpaperflare.com/wallpaper/632/785/1006/warhammer-40-000-death-guard-nurgle-chaos-wallpaper-preview.jpg',
  'tzeentch': 'https://c4.wallpaperflare.com/wallpaper/447/89/700/warhammer-40-000-thousand-sons-tzeentch-chaos-wallpaper-preview.jpg',
  'slaanesh': 'https://c4.wallpaperflare.com/wallpaper/502/816/949/warhammer-40-000-chaos-space-marine-chaos-digital-art-wallpaper-preview.jpg',

  // Xenos
  'orks': 'https://c4.wallpaperflare.com/wallpaper/878/679/853/warhammer-40-000-ork-green-skin-waaagh-wallpaper-preview.jpg',
  'aeldari': 'https://c4.wallpaperflare.com/wallpaper/706/829/862/warhammer-40-000-eldar-aeldari-xenos-wallpaper-preview.jpg',
  'drukhari': 'https://c4.wallpaperflare.com/wallpaper/706/829/862/warhammer-40-000-eldar-aeldari-xenos-wallpaper-preview.jpg',
  'tyranids': 'https://c4.wallpaperflare.com/wallpaper/505/423/946/warhammer-40-000-tyranids-hive-fleet-aliens-wallpaper-preview.jpg',
  'necrons': 'https://c4.wallpaperflare.com/wallpaper/580/461/356/warhammer-40-000-necrons-undead-robot-wallpaper-preview.jpg',
  'tau': 'https://c4.wallpaperflare.com/wallpaper/115/768/341/warhammer-40-000-tau-empire-mech-battlesuit-wallpaper-preview.jpg',
  'genestealer-cults': 'https://c4.wallpaperflare.com/wallpaper/505/423/946/warhammer-40-000-tyranids-hive-fleet-aliens-wallpaper-preview.jpg',
  'leagues-of-votann': 'https://c4.wallpaperflare.com/wallpaper/39/346/426/digital-art-artwork-video-games-warhammer-40-000-wallpaper-preview.jpg',
};

// Search query mapping for external image search
const FACTION_SEARCH_QUERIES: Record<string, string> = {
  'adeptus-astartes': 'space marines warhammer 40k',
  'ultramarines': 'ultramarines space marines warhammer',
  'blood-angels': 'blood angels warhammer 40k',
  'dark-angels': 'dark angels warhammer 40k',
  'space-wolves': 'space wolves warhammer 40k',
  'imperial-fists': 'imperial fists warhammer 40k',
  'iron-hands': 'iron hands warhammer 40k',
  'raven-guard': 'raven guard warhammer 40k',
  'salamanders': 'salamanders space marines warhammer',
  'white-scars': 'white scars warhammer 40k',
  'astra-militarum': 'imperial guard astra militarum warhammer',
  'adeptus-mechanicus': 'adeptus mechanicus warhammer 40k',
  'adeptus-custodes': 'adeptus custodes golden throne warhammer',
  'sisters-of-battle': 'sisters of battle adepta sororitas warhammer',
  'imperial-knights': 'imperial knights titan warhammer',
  'inquisition': 'inquisition warhammer 40k',
  'imperial-aquila': 'imperium warhammer 40k',
  'chaos': 'chaos space marines warhammer 40k',
  'black-legion': 'black legion chaos warhammer',
  'death-guard': 'death guard nurgle warhammer',
  'thousand-sons': 'thousand sons tzeentch warhammer',
  'world-eaters': 'world eaters khorne warhammer',
  'emperors-children': 'emperors children slaanesh warhammer',
  'chaos-knights': 'chaos knights warhammer 40k',
  'chaos-daemons': 'chaos daemons warhammer 40k',
  'khorne': 'khorne blood god warhammer',
  'nurgle': 'nurgle plague warhammer',
  'tzeentch': 'tzeentch changer ways warhammer',
  'slaanesh': 'slaanesh warhammer 40k',
  'orks': 'orks waaagh warhammer 40k',
  'aeldari': 'eldar aeldari craftworld warhammer',
  'drukhari': 'drukhari dark eldar warhammer',
  'tyranids': 'tyranids hive fleet warhammer',
  'necrons': 'necrons warhammer 40k',
  'tau': 'tau empire battlesuit warhammer',
  'genestealer-cults': 'genestealer cults warhammer',
  'leagues-of-votann': 'leagues votann squats warhammer',
};

@Injectable({
  providedIn: 'root',
})
export class FactionImageService {
  private readonly storage = inject(StorageService);

  private readonly loadingSignal = signal<boolean>(false);
  private readonly errorSignal = signal<string | null>(null);

  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();

  /**
   * Get the default image URL for a faction based on its icon ID
   */
  getDefaultImageForFaction(iconId: string | undefined): string | null {
    if (!iconId) return null;
    return FACTION_IMAGE_MAP[iconId] || null;
  }

  /**
   * Get cached image URL for a specific army/faction
   */
  getCachedImage(armyId: string): string | null {
    const cache = this.getImageCache();
    const cached = cache.find((c) => c.faction === armyId);

    if (!cached) return null;

    // Check if cache is expired
    if (Date.now() - cached.timestamp > CACHE_DURATION) {
      this.removeCachedImage(armyId);
      return null;
    }

    return cached.imageUrl;
  }

  /**
   * Cache an image URL for an army
   */
  cacheImage(armyId: string, imageUrl: string): void {
    const cache = this.getImageCache();
    const existingIndex = cache.findIndex((c) => c.faction === armyId);

    const newEntry: CachedImageData = {
      faction: armyId,
      imageUrl,
      timestamp: Date.now(),
    };

    if (existingIndex >= 0) {
      cache[existingIndex] = newEntry;
    } else {
      cache.push(newEntry);
    }

    this.storage.set(IMAGE_CACHE_KEY, cache);
  }

  /**
   * Remove cached image for an army
   */
  removeCachedImage(armyId: string): void {
    const cache = this.getImageCache();
    const filtered = cache.filter((c) => c.faction !== armyId);
    this.storage.set(IMAGE_CACHE_KEY, filtered);
  }

  /**
   * Generate WallpaperFlare search URL for a faction
   */
  getSearchUrl(iconId: string | undefined): string {
    const baseUrl = 'https://www.wallpaperflare.com/search';
    const query = iconId
      ? FACTION_SEARCH_QUERIES[iconId] || `${iconId.replace(/-/g, ' ')} warhammer 40k`
      : 'warhammer 40k';

    return `${baseUrl}?wallpaper=${encodeURIComponent(query)}`;
  }

  /**
   * Generate Alpha Coders search URL for a faction
   */
  getAlphaCodersSearchUrl(iconId: string | undefined): string {
    const baseUrl = 'https://wall.alphacoders.com/search.php';
    const query = iconId
      ? FACTION_SEARCH_QUERIES[iconId] || `${iconId.replace(/-/g, ' ')} warhammer 40k`
      : 'warhammer 40k';

    return `${baseUrl}?search=${encodeURIComponent(query)}`;
  }

  /**
   * Validate if a URL is a valid image URL
   */
  validateImageUrl(url: string): Promise<boolean> {
    return new Promise((resolve) => {
      if (!url || !url.startsWith('http')) {
        resolve(false);
        return;
      }

      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;

      // Timeout after 10 seconds
      setTimeout(() => resolve(false), 10000);
    });
  }

  /**
   * Get all available faction icon IDs
   */
  getAvailableFactions(): string[] {
    return Object.keys(FACTION_IMAGE_MAP);
  }

  private getImageCache(): CachedImageData[] {
    return this.storage.get<CachedImageData[]>(IMAGE_CACHE_KEY) || [];
  }
}
