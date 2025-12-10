import { Injectable, computed, effect, inject, signal } from '@angular/core';
import {
  Paint,
  PaintBrand,
  PaintType,
  PaintWithOwnership,
} from '@minipaint-pro/types';
import { StorageService } from './storage.service';

const OWNERSHIP_STORAGE_KEY = 'minipaint_paint_ownership';

interface PaintOwnership {
  paintId: string;
  owned: boolean;
  wishlist: boolean;
}

const CITADEL_PAINTS: Paint[] = [
  // Base Paints
  { id: 'citadel_abaddon_black', name: 'Abaddon Black', brand: 'citadel', type: 'base', colorHex: '#231f20', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_averland_sunset', name: 'Averland Sunset', brand: 'citadel', type: 'base', colorHex: '#fdb825', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_balthasar_gold', name: 'Balthasar Gold', brand: 'citadel', type: 'base', colorHex: '#a47552', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_bugmans_glow', name: "Bugman's Glow", brand: 'citadel', type: 'base', colorHex: '#834f44', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_caledor_sky', name: 'Caledor Sky', brand: 'citadel', type: 'base', colorHex: '#366699', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_caliban_green', name: 'Caliban Green', brand: 'citadel', type: 'base', colorHex: '#00401a', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_castellan_green', name: 'Castellan Green', brand: 'citadel', type: 'base', colorHex: '#264715', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_celestra_grey', name: 'Celestra Grey', brand: 'citadel', type: 'base', colorHex: '#90a8a8', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_ceramite_white', name: 'Ceramite White', brand: 'citadel', type: 'base', colorHex: '#ffffff', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_corax_white', name: 'Corax White', brand: 'citadel', type: 'base', colorHex: '#ffffff', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_daemonette_hide', name: 'Daemonette Hide', brand: 'citadel', type: 'base', colorHex: '#696684', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_death_guard_green', name: 'Death Guard Green', brand: 'citadel', type: 'base', colorHex: '#6d7c3d', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_deathworld_forest', name: 'Deathworld Forest', brand: 'citadel', type: 'base', colorHex: '#5c6730', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_dryad_bark', name: 'Dryad Bark', brand: 'citadel', type: 'base', colorHex: '#33312d', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_incubi_darkness', name: 'Incubi Darkness', brand: 'citadel', type: 'base', colorHex: '#0b474a', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_ionrach_skin', name: 'Ionrach Skin', brand: 'citadel', type: 'base', colorHex: '#dbd5cb', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_jokaero_orange', name: 'Jokaero Orange', brand: 'citadel', type: 'base', colorHex: '#ee3823', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_kantor_blue', name: 'Kantor Blue', brand: 'citadel', type: 'base', colorHex: '#02134e', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_khorne_red', name: 'Khorne Red', brand: 'citadel', type: 'base', colorHex: '#6a0001', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_leadbelcher', name: 'Leadbelcher', brand: 'citadel', type: 'base', colorHex: '#888d8f', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_macragge_blue', name: 'Macragge Blue', brand: 'citadel', type: 'base', colorHex: '#0f3d7c', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_mechanicus_grey', name: 'Mechanicus Standard Grey', brand: 'citadel', type: 'base', colorHex: '#3d4b4d', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_mephiston_red', name: 'Mephiston Red', brand: 'citadel', type: 'base', colorHex: '#9a1115', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_morghast_bone', name: 'Morghast Bone', brand: 'citadel', type: 'base', colorHex: '#c4b89a', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_mournfang_brown', name: 'Mournfang Brown', brand: 'citadel', type: 'base', colorHex: '#640909', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_naggaroth_night', name: 'Naggaroth Night', brand: 'citadel', type: 'base', colorHex: '#3d3354', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_phoenician_purple', name: 'Phoenician Purple', brand: 'citadel', type: 'base', colorHex: '#440052', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_rakarth_flesh', name: 'Rakarth Flesh', brand: 'citadel', type: 'base', colorHex: '#a29e91', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_retributor_armour', name: 'Retributor Armour', brand: 'citadel', type: 'base', colorHex: '#c39e5e', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_rhinox_hide', name: 'Rhinox Hide', brand: 'citadel', type: 'base', colorHex: '#462f30', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_screamer_pink', name: 'Screamer Pink', brand: 'citadel', type: 'base', colorHex: '#7a0b62', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_screaming_bell', name: 'Screaming Bell', brand: 'citadel', type: 'base', colorHex: '#c36c4d', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_steel_legion_drab', name: 'Steel Legion Drab', brand: 'citadel', type: 'base', colorHex: '#5e5134', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_stegadon_scale_green', name: 'Stegadon Scale Green', brand: 'citadel', type: 'base', colorHex: '#074863', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_the_fang', name: 'The Fang', brand: 'citadel', type: 'base', colorHex: '#405b71', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_thousand_sons_blue', name: 'Thousand Sons Blue', brand: 'citadel', type: 'base', colorHex: '#00506f', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_waaagh_flesh', name: 'Waaagh! Flesh', brand: 'citadel', type: 'base', colorHex: '#1f5429', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_warplock_bronze', name: 'Warplock Bronze', brand: 'citadel', type: 'base', colorHex: '#544435', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_wraithbone', name: 'Wraithbone', brand: 'citadel', type: 'base', colorHex: '#dbd1b2', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_xv88', name: 'XV-88', brand: 'citadel', type: 'base', colorHex: '#72491e', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_zandri_dust', name: 'Zandri Dust', brand: 'citadel', type: 'base', colorHex: '#9e915c', isOfficial: true, createdAt: '2024-01-01' },

  // Layer Paints
  { id: 'citadel_administratum_grey', name: 'Administratum Grey', brand: 'citadel', type: 'layer', colorHex: '#949b95', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_alaitoc_blue', name: 'Alaitoc Blue', brand: 'citadel', type: 'layer', colorHex: '#2c5a98', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_altdorf_guard_blue', name: 'Altdorf Guard Blue', brand: 'citadel', type: 'layer', colorHex: '#1f56a7', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_auric_armour_gold', name: 'Auric Armour Gold', brand: 'citadel', type: 'layer', colorHex: '#d6a536', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_balor_brown', name: 'Balor Brown', brand: 'citadel', type: 'layer', colorHex: '#8b5910', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_baharroth_blue', name: 'Baharroth Blue', brand: 'citadel', type: 'layer', colorHex: '#58c1cd', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_bestigor_flesh', name: 'Bestigor Flesh', brand: 'citadel', type: 'layer', colorHex: '#d38a57', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_bloodreaver_flesh', name: 'Bloodreaver Flesh', brand: 'citadel', type: 'layer', colorHex: '#6c4842', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_cadian_fleshtone', name: 'Cadian Fleshtone', brand: 'citadel', type: 'layer', colorHex: '#c77958', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_calgar_blue', name: 'Calgar Blue', brand: 'citadel', type: 'layer', colorHex: '#2d5f9e', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_dawnstone', name: 'Dawnstone', brand: 'citadel', type: 'layer', colorHex: '#70756e', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_doombull_brown', name: 'Doombull Brown', brand: 'citadel', type: 'layer', colorHex: '#5c1f1f', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_elysian_green', name: 'Elysian Green', brand: 'citadel', type: 'layer', colorHex: '#6b8c23', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_emperors_children', name: "Emperor's Children", brand: 'citadel', type: 'layer', colorHex: '#b74073', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_eshin_grey', name: 'Eshin Grey', brand: 'citadel', type: 'layer', colorHex: '#484b4e', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_evil_sunz_scarlet', name: 'Evil Sunz Scarlet', brand: 'citadel', type: 'layer', colorHex: '#c21a1b', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_fenrisian_grey', name: 'Fenrisian Grey', brand: 'citadel', type: 'layer', colorHex: '#6d94b3', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_fire_dragon_bright', name: 'Fire Dragon Bright', brand: 'citadel', type: 'layer', colorHex: '#f48c2d', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_flash_gitz_yellow', name: 'Flash Gitz Yellow', brand: 'citadel', type: 'layer', colorHex: '#fff200', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_flayed_one_flesh', name: 'Flayed One Flesh', brand: 'citadel', type: 'layer', colorHex: '#eec483', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_fulgrim_pink', name: 'Fulgrim Pink', brand: 'citadel', type: 'layer', colorHex: '#f3abca', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_gauss_blaster_green', name: 'Gauss Blaster Green', brand: 'citadel', type: 'layer', colorHex: '#7fc1a5', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_genestealer_purple', name: 'Genestealer Purple', brand: 'citadel', type: 'layer', colorHex: '#7658a5', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_hashut_copper', name: 'Hashut Copper', brand: 'citadel', type: 'layer', colorHex: '#b87333', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_hoeth_blue', name: 'Hoeth Blue', brand: 'citadel', type: 'layer', colorHex: '#4c78af', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_ironbreaker', name: 'Ironbreaker', brand: 'citadel', type: 'layer', colorHex: '#a1a6a9', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_kabalite_green', name: 'Kabalite Green', brand: 'citadel', type: 'layer', colorHex: '#008962', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_karak_stone', name: 'Karak Stone', brand: 'citadel', type: 'layer', colorHex: '#b7945c', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_kislev_flesh', name: 'Kislev Flesh', brand: 'citadel', type: 'layer', colorHex: '#d1a570', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_liberator_gold', name: 'Liberator Gold', brand: 'citadel', type: 'layer', colorHex: '#ccb062', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_loren_forest', name: 'Loren Forest', brand: 'citadel', type: 'layer', colorHex: '#486425', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_lothern_blue', name: 'Lothern Blue', brand: 'citadel', type: 'layer', colorHex: '#2c9bcc', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_moot_green', name: 'Moot Green', brand: 'citadel', type: 'layer', colorHex: '#3daf44', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_nurgling_green', name: 'Nurgling Green', brand: 'citadel', type: 'layer', colorHex: '#849b62', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_ogryn_camo', name: 'Ogryn Camo', brand: 'citadel', type: 'layer', colorHex: '#9ca553', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_pallid_wych_flesh', name: 'Pallid Wych Flesh', brand: 'citadel', type: 'layer', colorHex: '#cdc5b4', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_pink_horror', name: 'Pink Horror', brand: 'citadel', type: 'layer', colorHex: '#8c3b6a', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_russ_grey', name: 'Russ Grey', brand: 'citadel', type: 'layer', colorHex: '#507085', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_runefang_steel', name: 'Runefang Steel', brand: 'citadel', type: 'layer', colorHex: '#c3cece', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_screaming_skull', name: 'Screaming Skull', brand: 'citadel', type: 'layer', colorHex: '#b9c099', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_skarsnik_green', name: 'Skarsnik Green', brand: 'citadel', type: 'layer', colorHex: '#5f9370', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_skavenblight_dinge', name: 'Skavenblight Dinge', brand: 'citadel', type: 'layer', colorHex: '#47413b', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_slaanesh_grey', name: 'Slaanesh Grey', brand: 'citadel', type: 'layer', colorHex: '#8b8893', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_sotek_green', name: 'Sotek Green', brand: 'citadel', type: 'layer', colorHex: '#0c6b6d', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_squig_orange', name: 'Squig Orange', brand: 'citadel', type: 'layer', colorHex: '#aa4b1f', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_stormhost_silver', name: 'Stormhost Silver', brand: 'citadel', type: 'layer', colorHex: '#bbc6c9', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_stormvermin_fur', name: 'Stormvermin Fur', brand: 'citadel', type: 'layer', colorHex: '#736b65', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_straken_green', name: 'Straken Green', brand: 'citadel', type: 'layer', colorHex: '#597f1c', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_sybarite_green', name: 'Sybarite Green', brand: 'citadel', type: 'layer', colorHex: '#17a166', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_sycorax_bronze', name: 'Sycorax Bronze', brand: 'citadel', type: 'layer', colorHex: '#a08867', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_tallarn_sand', name: 'Tallarn Sand', brand: 'citadel', type: 'layer', colorHex: '#a07409', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_tau_light_ochre', name: 'Tau Light Ochre', brand: 'citadel', type: 'layer', colorHex: '#bf6e1d', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_teclis_blue', name: 'Teclis Blue', brand: 'citadel', type: 'layer', colorHex: '#317ec1', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_temple_guard_blue', name: 'Temple Guard Blue', brand: 'citadel', type: 'layer', colorHex: '#239489', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_thunderhawk_blue', name: 'Thunderhawk Blue', brand: 'citadel', type: 'layer', colorHex: '#407079', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_troll_slayer_orange', name: 'Troll Slayer Orange', brand: 'citadel', type: 'layer', colorHex: '#f36e22', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_ulthuan_grey', name: 'Ulthuan Grey', brand: 'citadel', type: 'layer', colorHex: '#c4ddd5', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_ungor_flesh', name: 'Ungor Flesh', brand: 'citadel', type: 'layer', colorHex: '#d6a766', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_ushabti_bone', name: 'Ushabti Bone', brand: 'citadel', type: 'layer', colorHex: '#abbb7b', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_warboss_green', name: 'Warboss Green', brand: 'citadel', type: 'layer', colorHex: '#317e57', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_warpfiend_grey', name: 'Warpfiend Grey', brand: 'citadel', type: 'layer', colorHex: '#6b6a74', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_warpstone_glow', name: 'Warpstone Glow', brand: 'citadel', type: 'layer', colorHex: '#1e7331', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_wazdakka_red', name: 'Wazdakka Red', brand: 'citadel', type: 'layer', colorHex: '#8c0a0c', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_white_scar', name: 'White Scar', brand: 'citadel', type: 'layer', colorHex: '#ffffff', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_wild_rider_red', name: 'Wild Rider Red', brand: 'citadel', type: 'layer', colorHex: '#e82d13', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_xereus_purple', name: 'Xereus Purple', brand: 'citadel', type: 'layer', colorHex: '#4a1f68', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_yriel_yellow', name: 'Yriel Yellow', brand: 'citadel', type: 'layer', colorHex: '#ffda00', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_zamesi_desert', name: 'Zamesi Desert', brand: 'citadel', type: 'layer', colorHex: '#d8a541', isOfficial: true, createdAt: '2024-01-01' },

  // Shade Paints
  { id: 'citadel_agrax_earthshade', name: 'Agrax Earthshade', brand: 'citadel', type: 'shade', colorHex: '#5a4522', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_biel_tan_green', name: 'Biel-Tan Green', brand: 'citadel', type: 'shade', colorHex: '#1a5426', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_carroburg_crimson', name: 'Carroburg Crimson', brand: 'citadel', type: 'shade', colorHex: '#540614', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_casandora_yellow', name: 'Casandora Yellow', brand: 'citadel', type: 'shade', colorHex: '#e98a16', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_coelia_greenshade', name: 'Coelia Greenshade', brand: 'citadel', type: 'shade', colorHex: '#0e4b4c', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_drakenhof_nightshade', name: 'Drakenhof Nightshade', brand: 'citadel', type: 'shade', colorHex: '#172c3d', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_druchii_violet', name: 'Druchii Violet', brand: 'citadel', type: 'shade', colorHex: '#2c1b41', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_fuegan_orange', name: 'Fuegan Orange', brand: 'citadel', type: 'shade', colorHex: '#c05210', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_nuln_oil', name: 'Nuln Oil', brand: 'citadel', type: 'shade', colorHex: '#14100e', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_reikland_fleshshade', name: 'Reikland Fleshshade', brand: 'citadel', type: 'shade', colorHex: '#ca6c4d', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_seraphim_sepia', name: 'Seraphim Sepia', brand: 'citadel', type: 'shade', colorHex: '#d29b3a', isOfficial: true, createdAt: '2024-01-01' },

  // Contrast Paints
  { id: 'citadel_aethermatic_blue', name: 'Aethermatic Blue', brand: 'citadel', type: 'contrast', colorHex: '#79c8c4', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_aggaros_dunes', name: 'Aggaros Dunes', brand: 'citadel', type: 'contrast', colorHex: '#c2a154', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_akhelian_green', name: 'Akhelian Green', brand: 'citadel', type: 'contrast', colorHex: '#316f65', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_apothecary_white', name: 'Apothecary White', brand: 'citadel', type: 'contrast', colorHex: '#d0d8dc', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_basilicanum_grey', name: 'Basilicanum Grey', brand: 'citadel', type: 'contrast', colorHex: '#5e6568', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_black_legion', name: 'Black Legion', brand: 'citadel', type: 'contrast', colorHex: '#3d4545', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_black_templar', name: 'Black Templar', brand: 'citadel', type: 'contrast', colorHex: '#2e3436', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_blood_angels_red', name: 'Blood Angels Red', brand: 'citadel', type: 'contrast', colorHex: '#a5080a', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_creed_camo', name: 'Creed Camo', brand: 'citadel', type: 'contrast', colorHex: '#5a6327', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_cygor_brown', name: 'Cygor Brown', brand: 'citadel', type: 'contrast', colorHex: '#6f4336', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_dark_angels_green', name: 'Dark Angels Green', brand: 'citadel', type: 'contrast', colorHex: '#003d1f', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_darkoath_flesh', name: 'Darkoath Flesh', brand: 'citadel', type: 'contrast', colorHex: '#c9755e', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_flesh_tearers_red', name: 'Flesh Tearers Red', brand: 'citadel', type: 'contrast', colorHex: '#7a0a0a', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_fyrelslayer_flesh', name: 'Fyrelslayer Flesh', brand: 'citadel', type: 'contrast', colorHex: '#c98c5b', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_gore_grunta_fur', name: 'Gore-grunta Fur', brand: 'citadel', type: 'contrast', colorHex: '#5c2a1f', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_gryph_charger_grey', name: 'Gryph-charger Grey', brand: 'citadel', type: 'contrast', colorHex: '#6a859f', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_guilliman_flesh', name: 'Guilliman Flesh', brand: 'citadel', type: 'contrast', colorHex: '#c08d6e', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_gullys_blue', name: "Gullys Blue", brand: 'citadel', type: 'contrast', colorHex: '#1c6095', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_iyanden_yellow', name: 'Iyanden Yellow', brand: 'citadel', type: 'contrast', colorHex: '#ffd200', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_leviadon_blue', name: 'Leviadon Blue', brand: 'citadel', type: 'contrast', colorHex: '#18455f', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_magos_purple', name: 'Magos Purple', brand: 'citadel', type: 'contrast', colorHex: '#9d4a7d', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_militarum_green', name: 'Militarum Green', brand: 'citadel', type: 'contrast', colorHex: '#525d41', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_nazdreg_yellow', name: 'Nazdreg Yellow', brand: 'citadel', type: 'contrast', colorHex: '#e8c307', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_ork_flesh', name: 'Ork Flesh', brand: 'citadel', type: 'contrast', colorHex: '#3f6628', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_plaguebearer_flesh', name: 'Plaguebearer Flesh', brand: 'citadel', type: 'contrast', colorHex: '#a9b77e', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_shyish_purple', name: 'Shyish Purple', brand: 'citadel', type: 'contrast', colorHex: '#573052', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_skeleton_horde', name: 'Skeleton Horde', brand: 'citadel', type: 'contrast', colorHex: '#d5c47c', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_snakebite_leather', name: 'Snakebite Leather', brand: 'citadel', type: 'contrast', colorHex: '#9b5e22', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_space_wolves_grey', name: 'Space Wolves Grey', brand: 'citadel', type: 'contrast', colorHex: '#6f8aa4', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_talassar_blue', name: 'Talassar Blue', brand: 'citadel', type: 'contrast', colorHex: '#0075ab', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_terradon_turquoise', name: 'Terradon Turquoise', brand: 'citadel', type: 'contrast', colorHex: '#047e7c', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_ultramarines_blue', name: 'Ultramarines Blue', brand: 'citadel', type: 'contrast', colorHex: '#1f4ea0', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_volupus_pink', name: 'Volupus Pink', brand: 'citadel', type: 'contrast', colorHex: '#9a2b5b', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_warp_lightning', name: 'Warp Lightning', brand: 'citadel', type: 'contrast', colorHex: '#37862c', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_wyldwood', name: 'Wyldwood', brand: 'citadel', type: 'contrast', colorHex: '#4f3526', isOfficial: true, createdAt: '2024-01-01' },

  // Technical Paints
  { id: 'citadel_ardcoat', name: "Ardcoat", brand: 'citadel', type: 'technical', colorHex: '#f0f0f0', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_astrogranite', name: 'Astrogranite', brand: 'citadel', type: 'technical', colorHex: '#4e5254', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_blood_for_the_blood_god', name: 'Blood for the Blood God', brand: 'citadel', type: 'technical', colorHex: '#7a0000', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_lahmian_medium', name: 'Lahmian Medium', brand: 'citadel', type: 'technical', colorHex: '#eeeeee', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_martian_ironearth', name: 'Martian Ironearth', brand: 'citadel', type: 'technical', colorHex: '#b14f3d', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_nihilakh_oxide', name: 'Nihilakh Oxide', brand: 'citadel', type: 'technical', colorHex: '#66afa8', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_nurgle_rot', name: "Nurgle's Rot", brand: 'citadel', type: 'technical', colorHex: '#8a9e4d', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_stirland_mud', name: 'Stirland Mud', brand: 'citadel', type: 'technical', colorHex: '#492c20', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_tesseract_glow', name: 'Tesseract Glow', brand: 'citadel', type: 'technical', colorHex: '#5cc058', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_typhus_corrosion', name: 'Typhus Corrosion', brand: 'citadel', type: 'technical', colorHex: '#3d2e22', isOfficial: true, createdAt: '2024-01-01' },

  // Dry Paints
  { id: 'citadel_astorath_red', name: 'Astorath Red', brand: 'citadel', type: 'dry', colorHex: '#a5222d', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_changeling_pink', name: 'Changeling Pink', brand: 'citadel', type: 'dry', colorHex: '#f0b0d0', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_dawnstone_dry', name: 'Dawnstone', brand: 'citadel', type: 'dry', colorHex: '#70756e', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_eldar_flesh', name: 'Eldar Flesh', brand: 'citadel', type: 'dry', colorHex: '#edd9c8', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_etherium_blue', name: 'Etherium Blue', brand: 'citadel', type: 'dry', colorHex: '#a1b0c9', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_golden_griffon', name: 'Golden Griffon', brand: 'citadel', type: 'dry', colorHex: '#af8a44', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_golgfag_brown', name: 'Golgfag Brown', brand: 'citadel', type: 'dry', colorHex: '#8f4e24', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_hellion_green', name: 'Hellion Green', brand: 'citadel', type: 'dry', colorHex: '#7fc68f', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_hexos_palesun', name: 'Hexos Palesun', brand: 'citadel', type: 'dry', colorHex: '#fff36d', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_hoeth_blue_dry', name: 'Hoeth Blue', brand: 'citadel', type: 'dry', colorHex: '#4c78af', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_imrik_blue', name: 'Imrik Blue', brand: 'citadel', type: 'dry', colorHex: '#208abf', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_longbeard_grey', name: 'Longbeard Grey', brand: 'citadel', type: 'dry', colorHex: '#a2998b', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_lucius_lilac', name: 'Lucius Lilac', brand: 'citadel', type: 'dry', colorHex: '#b29bc1', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_necron_compound', name: 'Necron Compound', brand: 'citadel', type: 'dry', colorHex: '#99a0a2', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_niblet_green', name: 'Niblet Green', brand: 'citadel', type: 'dry', colorHex: '#378a31', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_praxeti_white', name: 'Praxeti White', brand: 'citadel', type: 'dry', colorHex: '#ffffff', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_ryza_rust', name: 'Ryza Rust', brand: 'citadel', type: 'dry', colorHex: '#ec6a1c', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_sigmarite', name: 'Sigmarite', brand: 'citadel', type: 'dry', colorHex: '#caad6f', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_skink_blue', name: 'Skink Blue', brand: 'citadel', type: 'dry', colorHex: '#5dc1d2', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_stormfang', name: 'Stormfang', brand: 'citadel', type: 'dry', colorHex: '#5a7fa0', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_sylvaneth_bark', name: 'Sylvaneth Bark', brand: 'citadel', type: 'dry', colorHex: '#4e463f', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_terminatus_stone', name: 'Terminatus Stone', brand: 'citadel', type: 'dry', colorHex: '#c4b79d', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_thunderbolt_metal', name: 'Thunderbolt Metal', brand: 'citadel', type: 'dry', colorHex: '#949fb0', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_tyrant_skull', name: 'Tyrant Skull', brand: 'citadel', type: 'dry', colorHex: '#c9c2b0', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_underhive_ash', name: 'Underhive Ash', brand: 'citadel', type: 'dry', colorHex: '#b3ad9f', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_verminlord_hide', name: 'Verminlord Hide', brand: 'citadel', type: 'dry', colorHex: '#8c7b6b', isOfficial: true, createdAt: '2024-01-01' },
  { id: 'citadel_wrack_white', name: 'Wrack White', brand: 'citadel', type: 'dry', colorHex: '#d3d0cb', isOfficial: true, createdAt: '2024-01-01' },
];

export interface PaintFilters {
  search: string;
  brand: PaintBrand | null;
  type: PaintType | null;
  ownership: 'all' | 'owned' | 'unowned' | 'wishlist';
}

@Injectable({
  providedIn: 'root',
})
export class PaintService {
  private readonly storage = inject(StorageService);

  private readonly ownershipSignal = signal<Map<string, PaintOwnership>>(
    this.loadOwnershipFromStorage()
  );

  readonly paints = signal<Paint[]>(CITADEL_PAINTS);

  readonly paintsWithOwnership = computed<PaintWithOwnership[]>(() => {
    const ownership = this.ownershipSignal();
    return this.paints().map((paint) => {
      const ownershipData = ownership.get(paint.id);
      return {
        ...paint,
        owned: ownershipData?.owned ?? false,
        wishlist: ownershipData?.wishlist ?? false,
      };
    });
  });

  readonly ownedCount = computed(
    () => this.paintsWithOwnership().filter((p) => p.owned).length
  );

  readonly wishlistCount = computed(
    () => this.paintsWithOwnership().filter((p) => p.wishlist && !p.owned).length
  );

  readonly totalCount = computed(() => this.paints().length);

  constructor() {
    effect(() => {
      this.saveOwnershipToStorage(this.ownershipSignal());
    });
  }

  private loadOwnershipFromStorage(): Map<string, PaintOwnership> {
    const data = this.storage.get<PaintOwnership[]>(OWNERSHIP_STORAGE_KEY) ?? [];
    return new Map(data.map((o) => [o.paintId, o]));
  }

  private saveOwnershipToStorage(ownership: Map<string, PaintOwnership>): void {
    this.storage.set(OWNERSHIP_STORAGE_KEY, Array.from(ownership.values()));
  }

  toggleOwned(paintId: string): void {
    this.ownershipSignal.update((ownership) => {
      const newOwnership = new Map(ownership);
      const current = newOwnership.get(paintId);
      const newOwned = !(current?.owned ?? false);

      newOwnership.set(paintId, {
        paintId,
        owned: newOwned,
        wishlist: newOwned ? false : (current?.wishlist ?? false),
      });

      return newOwnership;
    });
  }

  toggleWishlist(paintId: string): void {
    this.ownershipSignal.update((ownership) => {
      const newOwnership = new Map(ownership);
      const current = newOwnership.get(paintId);

      if (current?.owned) {
        return newOwnership;
      }

      newOwnership.set(paintId, {
        paintId,
        owned: current?.owned ?? false,
        wishlist: !(current?.wishlist ?? false),
      });

      return newOwnership;
    });
  }

  getFilteredPaints(filters: PaintFilters): PaintWithOwnership[] {
    let result = this.paintsWithOwnership();

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter((p) => p.name.toLowerCase().includes(searchLower));
    }

    if (filters.brand) {
      result = result.filter((p) => p.brand === filters.brand);
    }

    if (filters.type) {
      result = result.filter((p) => p.type === filters.type);
    }

    switch (filters.ownership) {
      case 'owned':
        result = result.filter((p) => p.owned);
        break;
      case 'unowned':
        result = result.filter((p) => !p.owned);
        break;
      case 'wishlist':
        result = result.filter((p) => p.wishlist && !p.owned);
        break;
    }

    return result;
  }

  getPaintById(id: string): PaintWithOwnership | undefined {
    return this.paintsWithOwnership().find((p) => p.id === id);
  }

  /**
   * Clears all user-specific paint ownership data.
   * Should be called on user logout to reset state for the next user.
   */
  clearData(): void {
    this.ownershipSignal.set(new Map());
  }
}
