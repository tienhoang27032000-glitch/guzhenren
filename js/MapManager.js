/**
 * VẠN CỔ TIÊN ĐỒ - MODULE ĐỊA HÌNH 25 BẢN ĐỒ MỞ RỘNG & THỜI TIẾT ĐỘNG (MapManager.js)
 * Nâng cấp:
 *  - Tách riêng Ải 24: Thiên Đình Trung Châu — Túc Mệnh Đại Chiến (Bát Chuyển Đỉnh Phong)
 *    và Ải 25: Tầng Chín Phong Ma Quật — Vô Cực Hỗn Độn Đại Trận (Cửu Chuyển Tôn Giả Chiến).
 *  - Mở rộng bản đồ 4800x4800px (150x150 ô) và bán kính chiến trường 1350px.
 *  - Hỗ trợ getRandomWalkablePoint() để quái vật, Tinh Anh và 18 điểm Mỏ Cổ Tài / Cổ Hoang Dã
 *    sinh ngẫu nhiên khắp bản đồ.
 */

(function (global) {
    "use strict";

    // =========================================================================
    // 1. CẤU HÌNH KÍCH THƯỚC BẢN ĐỒ MỞ RỘNG (4800x4800 PX) & LOẠI Ô ĐỊA HÌNH
    // =========================================================================

    const TILE_SIZE = 32;
    const GRID_COLS = 150;
    const GRID_ROWS = 150;
    const WORLD_WIDTH = TILE_SIZE * GRID_COLS;   // 4800 px
    const WORLD_HEIGHT = TILE_SIZE * GRID_ROWS;  // 4800 px
    const ARENA_RADIUS = 1350;                   // Bán kính vùng chiến trường mở rộng

    const TILE_TYPES = {
        GROUND_PRIMARY: 0,     // Nền đất chính của ải (Đi được)
        GROUND_SECONDARY: 1,   // Nền đất xen kẽ tạo vân Pixel Art (Đi được)
        ANCIENT_PATH: 2,       // Đường lát đá / Cổ đạo xuyên chiến trường (Đi được)
        SPIRIT_FLOOR: 3,       // Nền linh trận / Đài sen / Sàn lưu ly (Đi được)
        HAZARD_SHALLOW: 4,     // Nước nông / Huyết trì nông / Hắc hỏa Hỗn Độn (Đi được)
        CLIFF_BORDER: 9        // Vách núi / Tường kết giới ngoài rìa (Không đi qua được)
    };

    // =========================================================================
    // 2. BẢNG CHỦ ĐỀ ĐỊA HÌNH PIXEL ART CHO 25 BẢN ĐỒ CHUẨN NGUYÊN TÁC (1 -> 9 CHUYỂN)
    // =========================================================================

    const STAGE_THEMES = {
        // ==================== NHẤT CHUYỂN (RANK 1: ẢI 1 -> 3) ====================
        stage_1: {
            name: "Sườn Núi Thanh Mao",
            weatherId: "clear",
            cPrimary: "#102118",
            cSecondary: "#14291e",
            cPath: "#243028",
            cSpirit: "#1b3d2b",
            cShallow: "#123542",
            cWall: "#263329",
            gridPattern: "bamboo_grove",
            propTypes: ["bamboo_stalk", "moon_flower", "moss_rock"],
            stageResources: ["moon_orchid", "spirit_herb", "primeval_stone", "wild_gu"]
        },
        stage_2: {
            name: "Mật Động Hoa Tửu Hành Giả",
            weatherId: "fog",
            cPrimary: "#1f1812",
            cSecondary: "#261d15",
            cPath: "#33271d",
            cSpirit: "#42301b",
            cShallow: "#4a2511",
            cWall: "#3b2d20",
            gridPattern: "cave_stone",
            propTypes: ["wine_jar", "glowing_shroom", "stalagmite"],
            stageResources: ["spirit_herb", "bronze_ore", "primeval_stone", "wild_gu"]
        },
        stage_3: {
            name: "Địa Đạo Huyết Hồ Cổ Nguyệt",
            weatherId: "blood_moon",
            cPrimary: "#1c0b0e",
            cSecondary: "#260f13",
            cPath: "#331419",
            cSpirit: "#4a121b",
            cShallow: "#6e111d",
            cWall: "#381217",
            gridPattern: "blood_pool",
            propTypes: ["blood_crystal", "skull_pile", "blood_altar"],
            stageResources: ["beast_blood_core", "bronze_ore", "primeval_stone", "wild_gu"]
        },

        // ==================== NHỊ CHUYỂN (RANK 2: ẢI 4 -> 6) ====================
        stage_4: {
            name: "Huyết Lang Triều Thanh Mao Sơn",
            weatherId: "thunder_storm",
            cPrimary: "#0e171c",
            cSecondary: "#131f26",
            cPath: "#222b30",
            cSpirit: "#1c2d38",
            cShallow: "#163242",
            cWall: "#283138",
            gridPattern: "ruined_fort",
            propTypes: ["broken_fence", "pine_tree", "wolf_totem"],
            stageResources: ["wind_essence_crystal", "red_iron_ore", "primeval_stone", "wild_gu"]
        },
        stage_5: {
            name: "Bạch Cốt Sơn — Cung Điện Xương",
            weatherId: "fog",
            cPrimary: "#1f2226",
            cSecondary: "#282c30",
            cPath: "#3d4247",
            cSpirit: "#525861",
            cShallow: "#2b3036",
            cWall: "#636970",
            gridPattern: "bone_palace",
            propTypes: ["bone_pillar", "skull_pile", "bone_spikes"],
            stageResources: ["jade_bone", "red_iron_ore", "primeval_stone", "wild_gu"]
        },
        stage_6: {
            name: "Hoàng Kim Sơn — Đầm Lầy Hủ Độc",
            weatherId: "spirit_rain",
            cPrimary: "#1b1f14",
            cSecondary: "#24291b",
            cPath: "#383d29",
            cSpirit: "#4f5435",
            cShallow: "#3f274d",
            cWall: "#333824",
            gridPattern: "blood_pool",
            propTypes: ["glowing_shroom", "charred_tree", "rock_pillar"],
            stageResources: ["red_iron_ore", "hundred_year_ginseng", "primeval_stone", "wild_gu"]
        },

        // ==================== TAM CHUYỂN (RANK 3: ẢI 7 -> 9) ====================
        stage_7: {
            name: "Thương Gia Thành — Đấu Vũ Trường",
            weatherId: "clear",
            cPrimary: "#241d14",
            cSecondary: "#2b2318",
            cPath: "#423421",
            cSpirit: "#594427",
            cShallow: "#33281a",
            cWall: "#6e5530",
            gridPattern: "imperial_plaza",
            propTypes: ["stone_lantern", "golden_brazier", "jade_pillar"],
            stageResources: ["hundred_year_ginseng", "red_iron_ore", "primeval_stone", "wild_gu"]
        },
        stage_8: {
            name: "Tam Xoa Sơn — Phong Ma Đỉnh",
            weatherId: "gale",
            cPrimary: "#121e24",
            cSecondary: "#182830",
            cPath: "#263d47",
            cSpirit: "#32525e",
            cShallow: "#1e3f4d",
            cWall: "#2c444f",
            gridPattern: "ruined_fort",
            propTypes: ["sword_monument", "bone_pillar", "wolf_totem"],
            stageResources: ["beast_blood_core", "wind_essence_crystal", "primeval_stone", "wild_gu"]
        },
        stage_9: {
            name: "Vạn Thú Sơn Lĩnh — Nam Cương",
            weatherId: "spirit_rain",
            cPrimary: "#0d1a12",
            cSecondary: "#122419",
            cPath: "#243326",
            cSpirit: "#1d3b26",
            cShallow: "#15362c",
            cWall: "#293d2e",
            gridPattern: "bamboo_grove",
            propTypes: ["pine_tree", "skull_pile", "wolf_totem"],
            stageResources: ["beast_blood_core", "hundred_year_ginseng", "primeval_stone", "wild_gu"]
        },

        // ==================== TỨ CHUYỂN (RANK 4: ẢI 10 -> 12) ====================
        stage_10: {
            name: "Tam Vương Sơn — Bách Chiến Chiến Trường",
            weatherId: "thunder_storm",
            cPrimary: "#1f1912",
            cSecondary: "#292016",
            cPath: "#3d3020",
            cSpirit: "#594326",
            cShallow: "#47331b",
            cWall: "#544028",
            gridPattern: "imperial_plaza",
            propTypes: ["golden_brazier", "bone_pillar", "blood_crystal"],
            stageResources: ["soul_crystal", "beast_blood_core", "primeval_stone", "wild_gu"]
        },
        stage_11: {
            name: "Sa Mạc Lửa Thiêu — Tây Mạc Thương Đạo",
            weatherId: "gale",
            cPrimary: "#332211",
            cSecondary: "#3d2914",
            cPath: "#52381c",
            cSpirit: "#664622",
            cShallow: "#8c2d0f",
            cWall: "#593d1f",
            gridPattern: "sand_dunes",
            propTypes: ["lava_vent", "golden_brazier", "rock_pillar"],
            stageResources: ["red_iron_ore", "wind_essence_crystal", "primeval_stone", "wild_gu"]
        },
        stage_12: {
            name: "Thiên Thê Sơn — Quần Hùng Tranh Đạt",
            weatherId: "spirit_rain",
            cPrimary: "#14242b",
            cSecondary: "#1b3038",
            cPath: "#294752",
            cSpirit: "#386170",
            cShallow: "#224e5e",
            cWall: "#31525e",
            gridPattern: "crystal_rings",
            propTypes: ["sword_monument", "stone_lantern", "jade_pillar"],
            stageResources: ["soul_crystal", "hundred_year_ginseng", "primeval_stone", "wild_gu"]
        },

        // ==================== NGŨ CHUYỂN (RANK 5: ẢI 13 -> 15) ====================
        stage_13: {
            name: "Bắc Nguyên Thảo Nguyên — Hoàng Kim Bộ Tộc",
            weatherId: "gale",
            cPrimary: "#1c2112",
            cSecondary: "#252b18",
            cPath: "#384024",
            cSpirit: "#4c5731",
            cShallow: "#333d20",
            cWall: "#424a2c",
            gridPattern: "ruined_fort",
            propTypes: ["wolf_totem", "golden_brazier", "skull_pile"],
            stageResources: ["beast_blood_core", "soul_crystal", "primeval_stone", "wild_gu"]
        },
        stage_14: {
            name: "Vương Đình Tranh Bá — Huyết Chiến Thiết Gia",
            weatherId: "blood_moon",
            cPrimary: "#241414",
            cSecondary: "#2e1a1a",
            cPath: "#452626",
            cSpirit: "#5e3232",
            cShallow: "#751d1d",
            cWall: "#4f2b2b",
            gridPattern: "imperial_plaza",
            propTypes: ["dragon_pillar", "blood_crystal", "golden_brazier"],
            stageResources: ["soul_crystal", "beast_blood_core", "primeval_stone", "wild_gu"]
        },
        stage_15: {
            name: "Bát Thập Bát Giác Chân Dương Lâu",
            weatherId: "thunder_storm",
            cPrimary: "#29200e",
            cSecondary: "#362a12",
            cPath: "#4f3d1a",
            cSpirit: "#6e5522",
            cShallow: "#876928",
            cWall: "#785d26",
            gridPattern: "imperial_plaza",
            propTypes: ["dragon_pillar", "golden_brazier", "stone_lantern"],
            stageResources: ["soul_crystal", "red_iron_ore", "primeval_stone", "wild_gu"]
        },

        // ==================== LỤC CHUYỂN TIÊN CẢNH (RANK 6: ẢI 16 -> 18) ====================
        stage_16: {
            name: "Hồ Tiên Phúc Địa — Đãng Hồn Sơn Bảo Vệ Chiến",
            weatherId: "spirit_rain",
            cPrimary: "#241221",
            cSecondary: "#2e172a",
            cPath: "#45223e",
            cSpirit: "#612c56",
            cShallow: "#783169",
            cWall: "#54274b",
            gridPattern: "crystal_rings",
            propTypes: ["pink_soul_crystal", "jade_pillar", "moon_flower"],
            stageResources: ["soul_crystal", "hundred_year_ginseng", "primeval_stone", "wild_gu"]
        },
        stage_17: {
            name: "Lang Gia Phúc Địa — Vân Các Thập Nhị Lâu",
            weatherId: "spirit_rain",
            cPrimary: "#182630",
            cSecondary: "#1f313d",
            cPath: "#2c4557",
            cSpirit: "#3b5d75",
            cShallow: "#29526e",
            cWall: "#43637a",
            gridPattern: "cloud_rings",
            propTypes: ["refinement_cauldron", "jade_pillar", "stone_lantern"],
            stageResources: ["soul_crystal", "jade_bone", "primeval_stone", "wild_gu"]
        },
        stage_18: {
            name: "Bí Cảnh Lạc Phách Cốc — Bách Nhật Đại Chiến",
            weatherId: "gale",
            cPrimary: "#182029",
            cSecondary: "#202a36",
            cPath: "#2e3d4f",
            cSpirit: "#3f536b",
            cShallow: "#324c6b",
            cWall: "#4a5d75",
            gridPattern: "ice_field",
            propTypes: ["ice_crystal", "sword_monument", "pink_soul_crystal"],
            stageResources: ["soul_crystal", "wind_essence_crystal", "primeval_stone", "wild_gu"]
        },

        // ==================== THẤT CHUYỂN TIÊN CẢNH (RANK 7: ẢI 19 -> 21) ====================
        stage_19: {
            name: "Đại Chiến Nghĩa Thiên Sơn — Thập Tuyệt Tiên Cương Vô Sinh Đại Trận",
            weatherId: "blood_moon",
            cPrimary: "#211014",
            cSecondary: "#2b151a",
            cPath: "#401e26",
            cSpirit: "#592834",
            cShallow: "#731724",
            cWall: "#4a222b",
            gridPattern: "imperial_plaza",
            propTypes: ["blood_crystal", "sword_monument", "dragon_pillar"],
            stageResources: ["soul_crystal", "beast_blood_core", "primeval_stone", "wild_gu"]
        },
        stage_20: {
            name: "Hắc Phàm Động Thiên — Huyết Chiến Thất Chuyển",
            weatherId: "clear",
            cPrimary: "#14241e",
            cSecondary: "#1b3028",
            cPath: "#28473b",
            cSpirit: "#366151",
            cShallow: "#225242",
            cWall: "#305446",
            gridPattern: "crystal_rings",
            propTypes: ["stone_lotus", "dragon_pillar", "stone_lantern"],
            stageResources: ["soul_crystal", "hundred_year_ginseng", "primeval_stone", "wild_gu"]
        },
        stage_21: {
            name: "Bí Cảnh Nghịch Lưu Hà — Chứng Đạo Nghịch Lưu Hà Chi Chủ",
            weatherId: "spirit_rain",
            cPrimary: "#0e222e",
            cSecondary: "#142e3d",
            cPath: "#1e4359",
            cSpirit: "#295b78",
            cShallow: "#36789e",
            cWall: "#2c556e",
            gridPattern: "river_waves",
            propTypes: ["ice_crystal", "stone_lotus", "dragon_pillar"],
            stageResources: ["soul_crystal", "hundred_year_ginseng", "primeval_stone", "wild_gu"]
        },

        // ==================== BÁT CHUYỂN TIÊN CẢNH (RANK 8: ẢI 22 -> 24) ====================
        stage_22: {
            name: "Quang Âm Trường Hà — Thạch Liên Đảo Đại Chiến Bát Chuyển",
            weatherId: "thunder_storm",
            cPrimary: "#1f1d12",
            cSecondary: "#2b2718",
            cPath: "#423b22",
            cSpirit: "#61562e",
            cShallow: "#384d54",
            cWall: "#6e6134",
            gridPattern: "river_waves",
            propTypes: ["stone_lotus", "dragon_pillar", "golden_brazier"],
            stageResources: ["soul_crystal", "hundred_year_ginseng", "primeval_stone", "wild_gu"]
        },
        stage_23: {
            name: "Đông Hải Long Cung — Quần Tiên Tranh Đoạt Tiên Cổ Ốc Bát Chuyển",
            weatherId: "spirit_rain",
            cPrimary: "#0d1b2a",
            cSecondary: "#13263b",
            cPath: "#1d3959",
            cSpirit: "#284f7a",
            cShallow: "#1f5a85",
            cWall: "#2b4d70",
            gridPattern: "imperial_plaza",
            propTypes: ["dragon_pillar", "ice_crystal", "stone_lotus"],
            stageResources: ["soul_crystal", "hundred_year_ginseng", "primeval_stone", "wild_gu"]
        },
        stage_24: {
            name: "Thiên Đình Trung Châu — Túc Mệnh Đại Chiến Đỉnh Phong",
            weatherId: "clear",
            cPrimary: "#242016",
            cSecondary: "#302a1d",
            cPath: "#4a402a",
            cSpirit: "#695a38",
            cShallow: "#4f4328",
            cWall: "#7d6b42",
            gridPattern: "imperial_plaza",
            propTypes: ["dragon_pillar", "golden_brazier", "sword_monument"],
            stageResources: ["soul_crystal", "hundred_year_ginseng", "primeval_stone", "wild_gu"]
        },

        // ==================== CỬU CHUYỂN TÔN GIẢ CẢNH (RANK 9: ẢI 25) ====================
        stage_25: {
            name: "Tầng Chín Phong Ma Quật — Vô Cực Hỗn Độn Đại Trận (Song Tôn Đại Chiến)",
            weatherId: "thunder_storm",
            cPrimary: "#140b24",
            cSecondary: "#1d1033",
            cPath: "#311b54",
            cSpirit: "#4a287d",
            cShallow: "#080510",
            cWall: "#5d349c",
            gridPattern: "crystal_rings",
            propTypes: ["chaos_monolith", "dragon_pillar", "pink_soul_crystal"],
            stageResources: ["soul_crystal", "hundred_year_ginseng", "primeval_stone", "wild_gu"]
        }
    };

    const WORLD_REGIONS = [
        { id: "clan_territory", name: "Thanh Sơn Tộc Địa", category: "Lãnh Địa Gia Tộc", x: 1400, y: 1400, width: 900, height: 900, dangerRank: 1, heavenQi: 85, earthQi: 95, mapColor: "rgba(59, 139, 235, 0.28)", borderColor: "#3b8beb" },
        { id: "mortal_village", name: "Thanh Mao Sơn", category: "Thôn Làng", x: 1200, y: 2400, width: 850, height: 750, dangerRank: 1, heavenQi: 60, earthQi: 70, mapColor: "rgba(76, 217, 100, 0.24)", borderColor: "#4cd964" },
        { id: "trade_city", name: "Thương Gia Thành", category: "Thành Thị", x: 2500, y: 1500, width: 920, height: 860, dangerRank: 2, heavenQi: 80, earthQi: 85, mapColor: "rgba(90, 169, 230, 0.28)", borderColor: "#5aa9e6" },
        { id: "spirit_spring", name: "Nguyên Tuyền Linh Địa", category: "Linh Địa", x: 2400, y: 2550, width: 780, height: 740, dangerRank: 2, heavenQi: 140, earthQi: 150, mapColor: "rgba(247, 201, 72, 0.28)", borderColor: "#f7c948" },
        { id: "wild_forest", name: "U Ám Cổ Lâm", category: "Rừng Hoang", x: 240, y: 1350, width: 1080, height: 1680, dangerRank: 2, heavenQi: 95, earthQi: 110, mapColor: "rgba(46, 139, 87, 0.28)", borderColor: "#5cc995" },
        { id: "high_mountain", name: "Bạch Cốt Sơn", category: "Núi Non", x: 300, y: 240, width: 1450, height: 1020, dangerRank: 3, heavenQi: 165, earthQi: 120, mapColor: "rgba(212, 175, 55, 0.24)", borderColor: "#d4af37" },
        { id: "sect_domain", name: "Tiên Hạc Môn", category: "Địa Bàn Tông Môn", x: 1920, y: 240, width: 1200, height: 1080, dangerRank: 3, heavenQi: 155, earthQi: 145, mapColor: "rgba(133, 193, 233, 0.26)", borderColor: "#85c1e9" },
        { id: "blood_cave", name: "Tam Vương Sơn", category: "Hang Động", x: 3320, y: 260, width: 1200, height: 1120, dangerRank: 4, heavenQi: 90, earthQi: 185, mapColor: "rgba(180, 45, 45, 0.30)", borderColor: "#e05252" },
        { id: "danger_beast_zone", name: "Bách Thú Vương Lĩnh", category: "Khu Vực Nguy Hiểm", x: 3400, y: 1620, width: 1150, height: 1680, dangerRank: 4, heavenQi: 150, earthQi: 170, mapColor: "rgba(230, 126, 34, 0.28)", borderColor: "#e67e22" },
        { id: "secret_realm", name: "Thiên Địa Bí Cảnh", category: "Bí Cảnh", x: 1260, y: 3400, width: 2280, height: 1160, dangerRank: 5, heavenQi: 240, earthQi: 240, mapColor: "rgba(183, 92, 255, 0.28)", borderColor: "#b75cff" }
    ];

    const TRADITIONAL_HOURS = [
        { name: "Giờ Tý (Đêm Khuya)", isNight: true, lightLevel: 0.76 },
        { name: "Giờ Sửu (Rạng Sáng)", isNight: true, lightLevel: 0.80 },
        { name: "Giờ Dần (Hừng Đông)", isNight: false, lightLevel: 0.88 },
        { name: "Giờ Mão (Bình Minh)", isNight: false, lightLevel: 0.94 },
        { name: "Giờ Thìn (Buổi Sáng)", isNight: false, lightLevel: 1.0 },
        { name: "Giờ Tỵ (Chính Ngọ Sớm)", isNight: false, lightLevel: 1.0 },
        { name: "Giờ Ngọ (Giữa Trưa)", isNight: false, lightLevel: 1.0 },
        { name: "Giờ Mùi (Đầu Chiều)", isNight: false, lightLevel: 0.96 },
        { name: "Giờ Thân (Xế Chiều)", isNight: false, lightLevel: 0.92 },
        { name: "Giờ Dậu (Hoàng Hôn)", isNight: false, lightLevel: 0.84 },
        { name: "Giờ Tuất (Chập Tối)", isNight: true, lightLevel: 0.78 },
        { name: "Giờ Hợi (Đêm Thâu)", isNight: true, lightLevel: 0.76 }
    ];

    const WEATHER_TYPES = [
        { id: "clear", name: "Thanh Minh", tint: "rgba(0, 0, 0, 0)", visionMult: 1.0 },
        { id: "fog", name: "Sương Mù U Ám", tint: "rgba(22, 30, 38, 0.20)", visionMult: 0.88 },
        { id: "spirit_rain", name: "Linh Vũ Mưa Phùn", tint: "rgba(20, 48, 68, 0.16)", visionMult: 0.94 },
        { id: "gale", name: "Cuồng Phong Gió Lốc", tint: "rgba(30, 50, 45, 0.15)", visionMult: 0.94 },
        { id: "blood_moon", name: "Huyết Nguyệt Dị Tượng", tint: "rgba(85, 12, 18, 0.22)", visionMult: 0.90 },
        { id: "thunder_storm", name: "Lôi Bão Cuồng Nộ", tint: "rgba(28, 18, 52, 0.22)", visionMult: 0.88 }
    ];

    // =========================================================================
    // 3. LỚP QUẢN LÝ BẢN ĐỒ MỞ RỘNG (CLASS MAPMANAGER)
    // =========================================================================

    class MapManager {
        constructor() {
            this.tileSize = TILE_SIZE;
            this.cols = GRID_COLS;
            this.rows = GRID_ROWS;
            this.worldWidth = WORLD_WIDTH;
            this.worldHeight = WORLD_HEIGHT;
            this.arenaRadius = ARENA_RADIUS;

            this.camera = {
                x: 1600,
                y: 1600,
                width: 1280,
                height: 720
            };

            this.worldTime = {
                year: 1,
                day: 1,
                hourFloat: 9.0,
                weatherIndex: 0,
                weatherTimer: 90
            };

            this.currentStageId = null;
            this.activeTheme = STAGE_THEMES.stage_1;
            this.arenaCenterX = 2400;
            this.arenaCenterY = 2400;

            this.grid = [];
            this.decorations = [];
            this.resourceNodes = [];
            this.weatherParticles = [];

            this._initWeatherParticles();
            this.applyStageTheme({
                id: "stage_1",
                arenaCenterX: 2400,
                arenaCenterY: 2400,
                reqRank: 1
            });
        }

        _seededRandom(x, y, seedOffset = 0) {
            const sin = Math.sin((x + seedOffset) * 12.9898 + (y + seedOffset) * 78.233) * 43758.5453;
            return sin - Math.floor(sin);
        }

        /**
         * Tìm một tọa độ đi lại được ngẫu nhiên trên bản đồ quanh tâm (centerX, centerY)
         */
        getRandomWalkablePoint(centerX = this.arenaCenterX, centerY = this.arenaCenterY, minRadius = 180, maxRadius = 1220) {
            for (let attempt = 0; attempt < 35; attempt++) {
                const angle = Math.random() * Math.PI * 2;
                const dist = minRadius + Math.random() * Math.max(40, maxRadius - minRadius);
                const px = Math.round(centerX + Math.cos(angle) * dist);
                const py = Math.round(centerY + Math.sin(angle) * dist);

                if (this.isWalkable(px, py, 18)) {
                    return { x: px, y: py };
                }
            }
            return {
                x: Math.max(160, Math.min(this.worldWidth - 160, Math.round(centerX + 220))),
                y: Math.max(160, Math.min(this.worldHeight - 160, Math.round(centerY + 220)))
            };
        }

        // =====================================================================
        // 4. TỰ ĐỘNG DỰNG ĐỊA HÌNH MỞ RỘNG & 18 MỎ TÀI NGUYÊN RẢI RÁC
        // =====================================================================

        applyStageTheme(stageObj) {
            if (!stageObj) return;
            const stageId = stageObj.id || "stage_1";
            this.currentStageId = stageId;
            this.activeTheme = STAGE_THEMES[stageId] || STAGE_THEMES.stage_1;
            this.arenaCenterX = stageObj.arenaCenterX || 2400;
            this.arenaCenterY = stageObj.arenaCenterY || 2400;

            const wIdx = WEATHER_TYPES.findIndex(w => w.id === this.activeTheme.weatherId);
            this.worldTime.weatherIndex = wIdx >= 0 ? wIdx : 0;

            const seed = parseInt(stageId.replace("stage_", ""), 10) || 1;
            this._buildThemedArenaGrid(seed);
            this._spawnStageResourceNodes(stageObj);
        }

        _buildThemedArenaGrid(seed) {
            this.grid = new Array(this.rows);
            this.decorations = [];

            const cx = this.arenaCenterX;
            const cy = this.arenaCenterY;
            const pattern = this.activeTheme.gridPattern;
            const props = this.activeTheme.propTypes || ["pine_tree"];

            for (let r = 0; r < this.rows; r++) {
                this.grid[r] = new Array(this.cols);
                for (let c = 0; c < this.cols; c++) {
                    if (r <= 1 || r >= this.rows - 2 || c <= 1 || c >= this.cols - 2) {
                        this.grid[r][c] = TILE_TYPES.CLIFF_BORDER;
                        continue;
                    }

                    const wx = c * TILE_SIZE + TILE_SIZE / 2;
                    const wy = r * TILE_SIZE + TILE_SIZE / 2;
                    const distFromArena = Math.hypot(wx - cx, wy - cy);
                    const noise = this._seededRandom(c, r, seed * 17);

                    let tile = ((r + c) % 2 === 0) ? TILE_TYPES.GROUND_PRIMARY : TILE_TYPES.GROUND_SECONDARY;

                    if (distFromArena <= this.arenaRadius) {
                        const isMainRoad = Math.abs(wx - cx) < 44 || Math.abs(wy - cy) < 44;
                        const isRingRoad = Math.abs(distFromArena - 480) < 32 || Math.abs(distFromArena - 960) < 32;

                        if (pattern === "imperial_plaza") {
                            if (isMainRoad || isRingRoad) {
                                tile = TILE_TYPES.ANCIENT_PATH;
                            } else if (distFromArena < 150 || (Math.abs(distFromArena - 720) < 40 && noise > 0.4)) {
                                tile = TILE_TYPES.SPIRIT_FLOOR;
                            }
                        } else if (pattern === "blood_pool" || pattern === "lava_cracks") {
                            if (isMainRoad) {
                                tile = TILE_TYPES.ANCIENT_PATH;
                            } else if (noise > 0.80 && distFromArena > 130) {
                                tile = TILE_TYPES.HAZARD_SHALLOW;
                            } else if (distFromArena < 120) {
                                tile = TILE_TYPES.SPIRIT_FLOOR;
                            }
                        } else if (pattern === "river_waves") {
                            if (((r + Math.floor(c / 2)) % 5 === 0) && distFromArena > 120) {
                                tile = TILE_TYPES.HAZARD_SHALLOW;
                            } else if (distFromArena <= 130 || isRingRoad) {
                                tile = TILE_TYPES.SPIRIT_FLOOR;
                            }
                        } else if (pattern === "crystal_rings" || pattern === "cloud_rings") {
                            if (isRingRoad || distFromArena < 110) {
                                tile = TILE_TYPES.SPIRIT_FLOOR;
                            } else if (isMainRoad) {
                                tile = TILE_TYPES.ANCIENT_PATH;
                            }
                        } else {
                            if (isMainRoad || Math.abs(distFromArena - 640) < 28) {
                                tile = TILE_TYPES.ANCIENT_PATH;
                            } else if (noise > 0.84 && distFromArena > 140) {
                                tile = TILE_TYPES.SPIRIT_FLOOR;
                            }
                        }

                        if (
                            distFromArena > 260 &&
                            distFromArena < this.arenaRadius - 120 &&
                            !isMainRoad &&
                            !isRingRoad &&
                            noise > 0.968
                        ) {
                            tile = TILE_TYPES.CLIFF_BORDER;
                        }
                    } else if (distFromArena > this.arenaRadius + 90 && noise > 0.65) {
                        tile = TILE_TYPES.CLIFF_BORDER;
                    }

                    this.grid[r][c] = tile;

                    if (
                        tile !== TILE_TYPES.CLIFF_BORDER &&
                        distFromArena > 110 &&
                        distFromArena < this.arenaRadius + 60 &&
                        noise > 0.875 &&
                        noise < 0.915
                    ) {
                        const propType = props[(r + c) % props.length];
                        this.decorations.push({
                            x: wx,
                            y: wy,
                            type: propType
                        });
                    }
                }
            }
        }

        _spawnStageResourceNodes(stageObj) {
            this.resourceNodes = [];
            const rank = stageObj.reqRank || 1;
            const resPool = this.activeTheme.stageResources || ["spirit_herb", "primeval_stone", "wild_gu"];

            const nodeMetaMap = {
                primeval_stone: { name: "Mạch Nguyên Thạch Lộ Thiên", icon: "💎", color: "#4cd964", min: 4 * rank, max: 8 * rank },
                spirit_herb: { name: "Bụi Thanh Linh Thảo", icon: "🌿", color: "#5cc995", min: 1, max: 3 },
                moon_orchid: { name: "Khóm Nguyệt Lan Hoa", icon: "🌸", color: "#e6a8d7", min: 1, max: 3 },
                bronze_ore: { name: "Mạch Thanh Đồng Khoáng", icon: "🪨", color: "#8aa69b", min: 1, max: 3 },
                red_iron_ore: { name: "Mạch Xích Thiết Tinh Khoáng", icon: "🧱", color: "#e05252", min: 1, max: 2 },
                wind_essence_crystal: { name: "Phong Tuyền Tinh Thạch", icon: "🎐", color: "#6ce6b8", min: 1, max: 2 },
                beast_blood_core: { name: "Huyết Tinh Ngưng Tụ", icon: "🩸", color: "#d93838", min: 1, max: 2 },
                jade_bone: { name: "Cốt Tủy Bạch Ngọc", icon: "🦴", color: "#dce8f2", min: 1, max: 2 },
                hundred_year_ginseng: { name: "Bách Niên Khổ Sâm", icon: "🥕", color: "#f7c948", min: 1, max: 2 },
                soul_crystal: { name: "Đãng Hồn Tinh Thạch", icon: "🔮", color: "#c278ff", min: 1, max: 2 },
                wild_gu: { name: "Cổ Trùng Hoang Dã Ẩn Nấp", icon: "🪲", color: "#ffd700", isWildGu: true }
            };

            const totalNodes = 18;
            for (let i = 0; i < totalNodes; i++) {
                const key = resPool[i % resPool.length];
                const meta = nodeMetaMap[key] || nodeMetaMap.primeval_stone;
                const pt = this.getRandomWalkablePoint(this.arenaCenterX, this.arenaCenterY, 200, this.arenaRadius - 120);

                this.resourceNodes.push({
                    id: `stage_node_${i + 1}`,
                    type: key,
                    name: meta.name,
                    icon: meta.icon,
                    color: meta.color,
                    x: pt.x,
                    y: pt.y,
                    dangerRank: rank,
                    itemId: meta.isWildGu ? null : key,
                    isWildGu: Boolean(meta.isWildGu),
                    minYield: meta.min || 1,
                    maxYield: meta.max || 2,
                    charges: 2,
                    maxCharges: 2,
                    respawnTime: 40,
                    respawnTimer: 0
                });
            }
        }

        _initWeatherParticles() {
            this.weatherParticles = [];
            for (let i = 0; i < 65; i++) {
                this.weatherParticles.push({
                    x: Math.random() * 1400,
                    y: Math.random() * 900,
                    len: 6 + Math.random() * 10,
                    speedX: -1.5,
                    speedY: 5 + Math.random() * 4
                });
            }
        }

        // =====================================================================
        // 5. VÒNG LẶP CẬP NHẬT & TỰ ĐỘNG ĐỒNG BỘ CHỦ ĐỀ ẢI HIỆN TẠI
        // =====================================================================

        update(dt, player, canvasWidth, canvasHeight) {
            const activeStage = global.vanCoTienDoGame && global.vanCoTienDoGame.activeStage;
            if (activeStage && activeStage.id !== this.currentStageId) {
                this.applyStageTheme(activeStage);
            }

            if (canvasWidth && canvasHeight) {
                this.camera.width = canvasWidth;
                this.camera.height = canvasHeight;
            }
            if (player) {
                const targetX = player.x - this.camera.width / 2;
                const targetY = player.y - this.camera.height / 2;

                this.camera.x += (targetX - this.camera.x) * Math.min(1, dt * 8);
                this.camera.y += (targetY - this.camera.y) * Math.min(1, dt * 8);

                this.camera.x = Math.max(0, Math.min(this.worldWidth - this.camera.width, this.camera.x));
                this.camera.y = Math.max(0, Math.min(this.worldHeight - this.camera.height, this.camera.y));
            }

            this.worldTime.hourFloat += dt * 0.08;
            if (this.worldTime.hourFloat >= 24) {
                this.worldTime.hourFloat -= 24;
                this.worldTime.day += 1;
            }

            for (const node of this.resourceNodes) {
                if (node.charges <= 0) {
                    node.respawnTimer -= dt;
                    if (node.respawnTimer <= 0) {
                        node.charges = node.maxCharges;
                        node.respawnTimer = 0;
                    }
                }
            }
        }

        // =====================================================================
        // 6. KIỂM TRA VA CHẠM & THU THẬP CỔ TÀI BẰNG PHÍM [E]
        // =====================================================================

        isWalkable(x, y, radius = 12) {
            if (
                x - radius < TILE_SIZE * 2 ||
                y - radius < TILE_SIZE * 2 ||
                x + radius > this.worldWidth - TILE_SIZE * 2 ||
                y + radius > this.worldHeight - TILE_SIZE * 2
            ) {
                return false;
            }

            const col = Math.floor(x / TILE_SIZE);
            const row = Math.floor(y / TILE_SIZE);
            if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) return false;

            return this.grid[row][col] !== TILE_TYPES.CLIFF_BORDER;
        }

        getRegionAt(x, y) {
            for (const reg of WORLD_REGIONS) {
                if (x >= reg.x && x <= reg.x + reg.width && y >= reg.y && y <= reg.y + reg.height) {
                    return reg;
                }
            }
            return {
                id: "stage_arena",
                name: this.activeTheme ? this.activeTheme.name : "Bí Cảnh Lịch Luyện",
                category: "Chiến Trường",
                dangerRank: 1,
                heavenQi: 120,
                earthQi: 120
            };
        }

        getEnvironmentQiAt(x, y) {
            const reg = this.getRegionAt(x, y);
            return {
                regionName: reg.name,
                heaven: reg.heavenQi || 120,
                earth: reg.earthQi || 120
            };
        }

        getNearestInteractableNode(x, y, maxDist = 56) {
            let best = null;
            let bestDist = maxDist;

            for (const node of this.resourceNodes) {
                if (node.charges <= 0) continue;
                const d = Math.hypot(node.x - x, node.y - y);
                if (d <= bestDist) {
                    bestDist = d;
                    best = node;
                }
            }
            return best;
        }

        harvestNode(nodeId, player, guSystem) {
            const node = this.resourceNodes.find(n => n.id === nodeId);
            if (!node || node.charges <= 0) {
                return { success: false, message: "Điểm tài nguyên này đã khai thác hết, đang hấp thu linh khí tái sinh." };
            }

            if (node.isWildGu) {
                node.charges -= 1;
                if (node.charges <= 0) node.respawnTimer = node.respawnTime;

                if (guSystem && typeof guSystem.attemptCaptureWildGu === "function") {
                    return guSystem.attemptCaptureWildGu(player, node.dangerRank || 1);
                }
                return { success: true, message: "Đã bắt được một Cổ Trùng Hoang Dã!" };
            }

            const amount = Math.floor(node.minYield + Math.random() * (node.maxYield - node.minYield + 1));
            node.charges -= 1;
            if (node.charges <= 0) {
                node.respawnTimer = node.respawnTime;
            }

            if (player && typeof player.addItem === "function") {
                player.addItem(node.itemId, amount);
            }

            const itemMeta = (global.PlayerManager && global.PlayerManager.ITEM_DATABASE[node.itemId]) || { name: node.name };
            return {
                success: true,
                itemId: node.itemId,
                amount: amount,
                message: `Thu thập thành công ${amount}x [${itemMeta.name}] từ ${node.name}!`
            };
        }

        getCurrentHourInfo() {
            const idx = Math.floor((this.worldTime.hourFloat / 24) * 12) % 12;
            return TRADITIONAL_HOURS[idx];
        }

        getCurrentWeather() {
            return WEATHER_TYPES[this.worldTime.weatherIndex] || WEATHER_TYPES[0];
        }

        getWorldClockText() {
            const hInfo = this.getCurrentHourInfo();
            return `Năm ${this.worldTime.year} - Ngày ${this.worldTime.day} - ${hInfo.name}`;
        }

        // =====================================================================
        // 7. DỰNG HÌNH ĐỊA HÌNH PIXEL ART & VẬT CẢNH THEO CHỦ ĐỀ 25 ẢI
        // =====================================================================

        renderWorld(ctx) {
            if (!ctx) return;

            const activeStage = global.vanCoTienDoGame && global.vanCoTienDoGame.activeStage;
            if (activeStage && activeStage.id !== this.currentStageId) {
                this.applyStageTheme(activeStage);
            }

            const th = this.activeTheme || STAGE_THEMES.stage_1;
            const camX = Math.floor(this.camera.x);
            const camY = Math.floor(this.camera.y);
            const startCol = Math.max(0, Math.floor(camX / TILE_SIZE));
            const endCol = Math.min(this.cols - 1, Math.ceil((camX + this.camera.width) / TILE_SIZE));
            const startRow = Math.max(0, Math.floor(camY / TILE_SIZE));
            const endRow = Math.min(this.rows - 1, Math.ceil((camY + this.camera.height) / TILE_SIZE));
            const t = performance.now() * 0.004;

            for (let r = startRow; r <= endRow; r++) {
                for (let c = startCol; c <= endCol; c++) {
                    const tile = this.grid[r][c];
                    const sx = c * TILE_SIZE - camX;
                    const sy = r * TILE_SIZE - camY;

                    switch (tile) {
                        case TILE_TYPES.GROUND_PRIMARY:
                            ctx.fillStyle = th.cPrimary;
                            break;
                        case TILE_TYPES.GROUND_SECONDARY:
                            ctx.fillStyle = th.cSecondary;
                            break;
                        case TILE_TYPES.ANCIENT_PATH:
                            ctx.fillStyle = th.cPath;
                            break;
                        case TILE_TYPES.SPIRIT_FLOOR:
                            ctx.fillStyle = th.cSpirit;
                            break;
                        case TILE_TYPES.HAZARD_SHALLOW:
                            ctx.fillStyle = th.cShallow;
                            break;
                        case TILE_TYPES.CLIFF_BORDER:
                            ctx.fillStyle = th.cWall;
                            break;
                        default:
                            ctx.fillStyle = th.cPrimary;
                    }

                    ctx.fillRect(sx, sy, TILE_SIZE, TILE_SIZE);

                    if (tile === TILE_TYPES.ANCIENT_PATH) {
                        ctx.strokeStyle = "rgba(226, 191, 117, 0.16)";
                        ctx.strokeRect(sx + 2, sy + 2, TILE_SIZE - 4, TILE_SIZE - 4);
                    } else if (tile === TILE_TYPES.SPIRIT_FLOOR) {
                        ctx.strokeStyle = "rgba(255, 255, 255, 0.14)";
                        ctx.strokeRect(sx + 4, sy + 4, TILE_SIZE - 8, TILE_SIZE - 8);
                    } else if (tile === TILE_TYPES.HAZARD_SHALLOW) {
                        const waveShift = Math.sin(t + r + c) * 3;
                        ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
                        ctx.fillRect(sx + 6 + waveShift, sy + 14, 14, 2);
                    } else if (tile === TILE_TYPES.CLIFF_BORDER) {
                        ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
                        ctx.fillRect(sx, sy + TILE_SIZE - 6, TILE_SIZE, 6);
                    }
                }
            }

            // Pháp Trận Trung Tâm Đấu Trường
            const centerScreenX = this.arenaCenterX - camX;
            const centerScreenY = this.arenaCenterY - camY;
            ctx.save();
            ctx.strokeStyle = "rgba(226, 191, 117, 0.28)";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(centerScreenX, centerScreenY, 96, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();

            for (const dec of this.decorations) {
                const dx = dec.x - camX;
                const dy = dec.y - camY;
                if (dx < -48 || dy < -48 || dx > this.camera.width + 48 || dy > this.camera.height + 48) continue;

                this._renderDecorationProp(ctx, dx, dy, dec.type, t);
            }

            for (const node of this.resourceNodes) {
                if (node.charges <= 0) continue;
                const nx = node.x - camX;
                const ny = node.y - camY;
                if (nx < -40 || ny < -40 || nx > this.camera.width + 40 || ny > this.camera.height + 40) continue;

                const pulse = 14 + Math.sin(t * 1.5 + node.x) * 2.5;
                ctx.beginPath();
                ctx.arc(nx, ny, pulse, 0, Math.PI * 2);
                ctx.fillStyle = "rgba(12, 16, 24, 0.8)";
                ctx.fill();
                ctx.lineWidth = 1.6;
                ctx.strokeStyle = node.color;
                ctx.stroke();

                ctx.font = "16px sans-serif";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText(node.icon, nx, ny);
            }
        }

        _renderDecorationProp(ctx, dx, dy, type, t) {
            switch (type) {
                case "bamboo_stalk":
                    ctx.fillStyle = "#2ecc71";
                    ctx.fillRect(dx - 5, dy - 22, 3, 24);
                    ctx.fillRect(dx + 2, dy - 18, 3, 20);
                    ctx.fillStyle = "#1b7a43";
                    ctx.fillRect(dx - 8, dy - 16, 7, 3);
                    ctx.fillRect(dx + 1, dy - 12, 8, 3);
                    break;

                case "moon_flower":
                    ctx.fillStyle = "#27ae60";
                    ctx.fillRect(dx - 1, dy - 6, 2, 8);
                    ctx.fillStyle = "#7ef7f0";
                    ctx.beginPath();
                    ctx.arc(dx, dy - 8, 4.5, 0, Math.PI * 2);
                    ctx.fill();
                    break;

                case "wine_jar":
                    ctx.fillStyle = "#8c4a27";
                    ctx.fillRect(dx - 6, dy - 10, 12, 12);
                    ctx.fillStyle = "#e05252";
                    ctx.fillRect(dx - 4, dy - 13, 8, 3);
                    break;

                case "bone_pillar":
                case "bone_spikes":
                    ctx.fillStyle = "#dce8f2";
                    ctx.fillRect(dx - 5, dy - 20, 10, 22);
                    ctx.fillStyle = "#95a5a6";
                    ctx.fillRect(dx - 7, dy - 22, 14, 4);
                    ctx.fillRect(dx - 7, dy - 2, 14, 4);
                    break;

                case "skull_pile":
                    ctx.fillStyle = "#e6edf2";
                    ctx.beginPath();
                    ctx.arc(dx - 3, dy - 3, 5, 0, Math.PI * 2);
                    ctx.arc(dx + 4, dy - 2, 4.5, 0, Math.PI * 2);
                    ctx.fill();
                    break;

                case "blood_crystal":
                case "blood_altar":
                    ctx.fillStyle = "#d92626";
                    ctx.beginPath();
                    ctx.moveTo(dx, dy - 18);
                    ctx.lineTo(dx - 8, dy + 4);
                    ctx.lineTo(dx + 8, dy + 4);
                    ctx.closePath();
                    ctx.fill();
                    break;

                case "ice_crystal":
                case "frozen_pine":
                    ctx.fillStyle = "#85c1e9";
                    ctx.beginPath();
                    ctx.moveTo(dx, dy - 20);
                    ctx.lineTo(dx - 9, dy + 3);
                    ctx.lineTo(dx + 9, dy + 3);
                    ctx.closePath();
                    ctx.fill();
                    ctx.strokeStyle = "#ffffff";
                    ctx.lineWidth = 1;
                    ctx.stroke();
                    break;

                case "pink_soul_crystal":
                    ctx.fillStyle = "#ff85d5";
                    ctx.beginPath();
                    ctx.moveTo(dx, dy - 19);
                    ctx.lineTo(dx - 8, dy + 3);
                    ctx.lineTo(dx + 8, dy + 3);
                    ctx.closePath();
                    ctx.fill();
                    break;

                case "chaos_monolith":
                    ctx.fillStyle = "#190d2e";
                    ctx.fillRect(dx - 7, dy - 24, 14, 26);
                    ctx.strokeStyle = "#b75cff";
                    ctx.lineWidth = 1.5;
                    ctx.strokeRect(dx - 7, dy - 24, 14, 26);
                    ctx.fillStyle = "#ffd700";
                    ctx.beginPath();
                    ctx.arc(dx, dy - 26, 4 + Math.sin(t * 4) * 1.5, 0, Math.PI * 2);
                    ctx.fill();
                    break;

                case "dragon_pillar":
                case "golden_brazier":
                    ctx.fillStyle = "#d4af37";
                    ctx.fillRect(dx - 6, dy - 22, 12, 24);
                    ctx.fillStyle = "#ff5733";
                    ctx.beginPath();
                    ctx.arc(dx, dy - 24, 5 + Math.sin(t * 3) * 1.5, 0, Math.PI * 2);
                    ctx.fill();
                    break;

                case "refinement_cauldron":
                    ctx.fillStyle = "#4ce6ff";
                    ctx.fillRect(dx - 9, dy - 14, 18, 14);
                    ctx.fillStyle = "#ffd700";
                    ctx.fillRect(dx - 11, dy - 16, 22, 3);
                    break;

                case "stone_lotus":
                case "lotus_pad":
                    ctx.fillStyle = "#5cc995";
                    ctx.beginPath();
                    ctx.arc(dx, dy, 10, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = "#ff85a2";
                    ctx.beginPath();
                    ctx.arc(dx, dy - 2, 5, 0, Math.PI * 2);
                    ctx.fill();
                    break;

                case "sword_monument":
                    ctx.fillStyle = "#bdc3c7";
                    ctx.fillRect(dx - 2, dy - 20, 4, 22);
                    ctx.fillStyle = "#e2bf75";
                    ctx.fillRect(dx - 7, dy - 12, 14, 3);
                    break;

                default:
                    ctx.fillStyle = "#2b1d12";
                    ctx.fillRect(dx - 3, dy, 6, 10);
                    ctx.fillStyle = "#163022";
                    ctx.beginPath();
                    ctx.moveTo(dx, dy - 18);
                    ctx.lineTo(dx - 12, dy + 2);
                    ctx.lineTo(dx + 12, dy + 2);
                    ctx.closePath();
                    ctx.fill();
                    break;
            }
        }

        renderLightingAndWeather(ctx, player) {
            if (!ctx) return;
            const w = this.camera.width;
            const h = this.camera.height;
            const hourInfo = this.getCurrentHourInfo();
            const weather = this.getCurrentWeather();

            if (weather.id === "spirit_rain" || weather.id === "thunder_storm" || weather.id === "gale") {
                ctx.save();
                ctx.strokeStyle = weather.id === "gale"
                    ? "rgba(180, 235, 210, 0.28)"
                    : "rgba(120, 195, 255, 0.35)";
                ctx.lineWidth = 1.2;

                for (const p of this.weatherParticles) {
                    p.x += weather.id === "gale" ? -7 : p.speedX;
                    p.y += weather.id === "gale" ? 2 : p.speedY;
                    if (p.y > h) p.y = 0;
                    if (p.x < 0) p.x = w;

                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(p.x + (weather.id === "gale" ? -14 : -3), p.y + p.len);
                    ctx.stroke();
                }
                ctx.restore();
            }

            if (weather.tint !== "rgba(0, 0, 0, 0)") {
                ctx.fillStyle = weather.tint;
                ctx.fillRect(0, 0, w, h);
            }

            const darknessAlpha = Number((1.0 - hourInfo.lightLevel).toFixed(2));
            if (darknessAlpha > 0.05 && player) {
                const px = player.x - this.camera.x;
                const py = player.y - this.camera.y;
                const visionRadius = (player.vision || 320) * weather.visionMult;

                const grad = ctx.createRadialGradient(px, py, visionRadius * 0.35, px, py, visionRadius * 1.35);
                grad.addColorStop(0, "rgba(4, 6, 10, 0)");
                grad.addColorStop(1, `rgba(4, 6, 12, ${Math.min(0.50, darknessAlpha)})`);

                ctx.fillStyle = grad;
                ctx.fillRect(0, 0, w, h);
            }
        }

        // =====================================================================
        // 8. VẼ MINIMAP TRONG ẢI (140x140 - BAO QUÁT CHIẾN TRƯỜNG MỞ RỘNG)
        // =====================================================================

        renderMinimap(ctx, player, enemies = [], npcs = []) {
            if (!ctx || !player) return;
            const mw = ctx.canvas.width;
            const mh = ctx.canvas.height;
            const th = this.activeTheme || STAGE_THEMES.stage_1;

            const viewSpan = this.arenaRadius * 2 + 200; // 2900px
            const originX = this.arenaCenterX - viewSpan / 2;
            const originY = this.arenaCenterY - viewSpan / 2;
            const scale = mw / viewSpan;

            ctx.fillStyle = th.cPrimary || "#070a0f";
            ctx.fillRect(0, 0, mw, mh);

            ctx.strokeStyle = "#b89758";
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.arc(mw / 2, mh / 2, this.arenaRadius * scale, 0, Math.PI * 2);
            ctx.stroke();

            for (const node of this.resourceNodes) {
                if (node.charges <= 0) continue;
                const nx = (node.x - originX) * scale;
                const ny = (node.y - originY) * scale;
                ctx.fillStyle = node.isWildGu ? "#ffd700" : "#5cc995";
                ctx.fillRect(nx - 1.5, ny - 1.5, 3, 3);
            }

            for (const npc of npcs) {
                if (npc.isDead) continue;
                const nx = (npc.x - originX) * scale;
                const ny = (npc.y - originY) * scale;
                ctx.fillStyle = npc.isHostile ? "#ff6b6b" : "#5aa9e6";
                ctx.beginPath();
                ctx.arc(nx, ny, 3.0, 0, Math.PI * 2);
                ctx.fill();
            }

            for (const en of enemies) {
                if (en.isDead) continue;
                const ex = (en.x - originX) * scale;
                const ey = (en.y - originY) * scale;
                if (en.isBoss) {
                    ctx.fillStyle = en.isVenerable ? "#00ffff" : "#ffd700";
                    ctx.fillRect(ex - 3.5, ey - 3.5, 7, 7);
                } else if (en.isElite) {
                    ctx.fillStyle = "#c278ff";
                    ctx.fillRect(ex - 2.2, ey - 2.2, 4.4, 4.4);
                } else {
                    ctx.fillStyle = "#ff4d4d";
                    ctx.fillRect(ex - 1.8, ey - 1.8, 3.6, 3.6);
                }
            }

            const px = (player.x - originX) * scale;
            const py = (player.y - originY) * scale;
            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            ctx.arc(px, py, 3.5, 0, Math.PI * 2);
            ctx.fill();
        }

        renderFullWorldMap(ctx, player) {
            if (!ctx) return;
            const w = ctx.canvas.width;
            const h = ctx.canvas.height;
            ctx.fillStyle = "#080b10";
            ctx.fillRect(0, 0, w, h);
        }

        // =====================================================================
        // 9. LƯU & KHÔI PHỤC DỮ LIỆU
        // =====================================================================

        toSaveData() {
            return {
                worldTime: this.worldTime,
                currentStageId: this.currentStageId
            };
        }

        fromSaveData(data) {
            if (!data) return;
            if (data.worldTime) {
                this.worldTime = { ...this.worldTime, ...data.worldTime };
            }
        }
    }

    MapManager.WORLD_REGIONS = WORLD_REGIONS;
    MapManager.WEATHER_TYPES = WEATHER_TYPES;
    MapManager.STAGE_THEMES = STAGE_THEMES;
    MapManager.ARENA_RADIUS = ARENA_RADIUS;

    global.MapManager = MapManager;

})(window);