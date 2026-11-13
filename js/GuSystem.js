/**
 * VẠN CỔ TIÊN ĐỒ - MODULE CỔ TRÙNG THEO CẤP CHUYỂN (1->9) & SÁT CHIÊU ĐA HÌNH THÁI (GuSystem.js)
 * Nâng cấp Đại Kho Tàng 62 Cổ Trùng Chuẩn Nguyên Tác Cổ Chân Nhân:
 *  - Chuẩn hóa định dạng <Cổ Trùng A> <Số Chuyển> (rank hoạt động như Level 1, 2, 3, ..., 9).
 *  - Phân loại rõ 3 nhóm Cổ Trùng:
 *      + Phàm Cổ ("mortal_only"): 27 loại (Chỉ có từ 1 -> 5 Chuyển).
 *      + Linh Cổ ("ascendable"): 20 loại (Có thể thăng từ 1 -> 9 Chuyển).
 *      + Tiên Cổ ("immortal_only"): 15 loại (Chỉ có từ 6 -> 9 Chuyển).
 *  - Hỗ trợ Thăng Chuyển trực tiếp (upgradeGuRank), Hợp Luyện và tự động đồng bộ uy lực Sát Chiêu.
 */

(function (global) {
    "use strict";

    // =========================================================================
    // 1. BẢNG HỆ SỐ SỨC MẠNH THEO SỐ CHUYỂN (1 -> 9 CHUYỂN)
    // =========================================================================

    const RANK_NAMES = {
        1: "Nhất Chuyển",
        2: "Nhị Chuyển",
        3: "Tam Chuyển",
        4: "Tứ Chuyển",
        5: "Ngũ Chuyển",
        6: "Lục Chuyển",
        7: "Thất Chuyển",
        8: "Bát Chuyển",
        9: "Cửu Chuyển"
    };

    /**
     * Hệ số nhân uy lực chuẩn theo từng bậc Chuyển (Đặc biệt nhảy vọt ở Tiên Cảnh 6 -> 9 Chuyển)
     */
    const RANK_POWER_MULTIPLIERS = {
        1: 1.0,
        2: 2.6,
        3: 6.8,
        4: 18.0,
        5: 45.0,
        6: 135.0,
        7: 580.0,
        8: 2600.0,
        9: 12000.0
    };

    const RANK_ESSENCE_COST_BASE = {
        1: 8,
        2: 14,
        3: 20,
        4: 28,
        5: 36,
        6: 1,
        7: 2,
        8: 4,
        9: 8
    };

    const REALM_CATEGORY_LABELS = {
        mortal_only: "Phàm Cổ (Giới hạn 1–5 Chuyển)",
        immortal_only: "Tiên Cổ (Chỉ từ 6–9 Chuyển)",
        ascendable: "Linh Cổ (Có thể thăng 1–9 Chuyển)"
    };

    // =========================================================================
    // 2. CƠ SỞ DỮ LIỆU 62 CỔ TRÙNG CHUẨN NGUYÊN TÁC (GU_DATABASE)
    // =========================================================================

    const GU_DATABASE = {
        // ==================== NHÓM 1: CHỈ CÓ PHÀM CẤP (MORTAL ONLY: 1 -> 5 CHUYỂN) ====================
        nguyet_quang_gu: {
            id: "nguyet_quang_gu",
            name: "Nguyệt Quang Cổ",
            icon: "🌙",
            realmCategory: "mortal_only",
            minRank: 1,
            maxRank: 5,
            defaultRank: 1,
            path: "Quang Đạo",
            type: "offensive",
            castType: "projectile",
            basePower: 22,
            cooldown: 1.3,
            range: 300,
            radius: 20,
            projectileSpeed: 450,
            projectileColor: "#7ef7f0",
            foodItemId: "moon_orchid",
            baseTradeValue: 35,
            rarity: "common",
            killerTrait: {
                deliveryType: "crescent_barrage",
                modifierTag: "moon_slash",
                modifierDesc: "Tăng thêm 2 lưỡi nguyệt nhận cắt xé tầm xa"
            },
            description: "Phàm cổ biểu tượng của Cổ Nguyệt Sơn Trại. Phóng ra lưỡi đao ánh trăng cắt xé mục tiêu, tối đa đạt Ngũ Chuyển."
        },
        phong_nhan_gu: {
            id: "phong_nhan_gu",
            name: "Phong Nhận Cổ",
            icon: "🍃",
            realmCategory: "mortal_only",
            minRank: 1,
            maxRank: 5,
            defaultRank: 1,
            path: "Phong Đạo",
            type: "offensive",
            castType: "projectile",
            basePower: 24,
            cooldown: 1.5,
            range: 330,
            radius: 22,
            projectileSpeed: 490,
            projectileColor: "#5cc995",
            foodItemId: "wind_essence_crystal",
            baseTradeValue: 42,
            rarity: "common",
            killerTrait: {
                deliveryType: "wind_tornado",
                modifierTag: "vortex_pull",
                modifierDesc: "Tạo luồng gió xoáy cuốn hút kẻ địch vào tâm đòn đánh"
            },
            description: "Phàm cổ Phong Đạo phổ biến khắp Ngũ Vực. Ngưng tụ lưỡi đao gió sắc bén bay nhanh, giới hạn ở Ngũ Chuyển."
        },
        thiet_bi_gu: {
            id: "thiet_bi_gu",
            name: "Đồng Bì Cổ",
            icon: "🛡️",
            realmCategory: "mortal_only",
            minRank: 1,
            maxRank: 5,
            defaultRank: 1,
            path: "Kim Đạo",
            type: "defensive",
            castType: "self_buff",
            basePower: 15,
            baseShield: 40,
            cooldown: 7.5,
            range: 0,
            radius: 45,
            buffDuration: 10,
            visualColor: "#cd7f32",
            foodItemId: "bronze_ore",
            baseTradeValue: 42,
            rarity: "common",
            killerTrait: {
                deliveryType: "fortress_aegis",
                modifierTag: "aegis_shield",
                modifierDesc: "Tạo hộ thuẫn kim thiết và chấn lùi kẻ địch áp sát"
            },
            description: "Phàm cổ phòng ngự cường hóa làn da cứng như đồng thiết, chỉ tồn tại ở Phàm Cấp (1–5 Chuyển)."
        },
        thanh_phong_gu: {
            id: "thanh_phong_gu",
            name: "Thanh Phong Luân Cổ",
            icon: "💨",
            realmCategory: "mortal_only",
            minRank: 1,
            maxRank: 5,
            defaultRank: 1,
            path: "Phong Đạo",
            type: "movement",
            castType: "self_buff",
            basePower: 16,
            speedBoost: 1.45,
            cooldown: 6.0,
            range: 0,
            radius: 35,
            buffDuration: 7,
            visualColor: "#6ce6b8",
            foodItemId: "wind_essence_crystal",
            baseTradeValue: 40,
            rarity: "common",
            killerTrait: {
                deliveryType: "dash_blitz",
                modifierTag: "swift_step",
                modifierDesc: "Tăng mạnh tốc độ di chuyển và tốc độ bay của đạn"
            },
            description: "Phàm cổ thân pháp tạo gió xoáy dưới chân giúp lướt nhanh trên chiến trường, tối đa Ngũ Chuyển."
        },
        hung_luc_gu: {
            id: "hung_luc_gu",
            name: "Hắc Thỉ Cổ",
            icon: "🐗",
            realmCategory: "mortal_only",
            minRank: 1,
            maxRank: 5,
            defaultRank: 1,
            path: "Lực Đạo",
            type: "offensive",
            castType: "aoe_self",
            basePower: 28,
            cooldown: 2.6,
            range: 95,
            radius: 90,
            visualColor: "#e07a45",
            foodItemId: "ration_meat",
            baseTradeValue: 55,
            rarity: "uncommon",
            killerTrait: {
                deliveryType: "beast_stampede",
                modifierTag: "beast_phantom",
                modifierDesc: "Triệu hồi Thú Ảnh Lực Đạo húc văng và làm Choáng mục tiêu"
            },
            description: "Phàm cổ Lực Đạo ban tặng thú lực dũng mãnh, triệu hồi thú ảnh húc văng kẻ địch (1–5 Chuyển)."
        },
        bach_thi_gu: {
            id: "bach_thi_gu",
            name: "Bạch Thỉ Cổ",
            icon: "🐖",
            realmCategory: "mortal_only",
            minRank: 1,
            maxRank: 5,
            defaultRank: 1,
            path: "Lực Đạo",
            type: "offensive",
            castType: "aoe_self",
            basePower: 27,
            cooldown: 2.6,
            range: 95,
            radius: 90,
            visualColor: "#f5f7fa",
            foodItemId: "ration_meat",
            baseTradeValue: 55,
            rarity: "uncommon",
            killerTrait: {
                deliveryType: "beast_stampede",
                modifierTag: "armor_crush",
                modifierDesc: "Đòn đánh mang kình lực xuyên giáp và hất lùi kẻ địch"
            },
            description: "Phàm cổ Lực Đạo song hành cùng Hắc Thỉ Cổ, gia tăng kình lực phá giáp (1–5 Chuyển)."
        },
        hoi_xuong_gu: {
            id: "hoi_xuong_gu",
            name: "Xuân Quang Cổ",
            icon: "💚",
            realmCategory: "mortal_only",
            minRank: 1,
            maxRank: 5,
            defaultRank: 1,
            path: "Mộc Đạo",
            type: "support",
            subType: "healing",
            castType: "heal",
            basePower: 32,
            cooldown: 5.5,
            range: 0,
            radius: 40,
            visualColor: "#4cd964",
            foodItemId: "spirit_herb",
            baseTradeValue: 48,
            rarity: "uncommon",
            killerTrait: {
                deliveryType: "vitality_domain",
                modifierTag: "life_bloom",
                modifierDesc: "Chuyển hóa nguyên khí thành sinh cơ hồi phục Sinh Mệnh"
            },
            description: "Phàm cổ trị liệu Mộc Đạo chuyển hóa chân nguyên thành sinh cơ ấm áp khôi phục thương thế (1–5 Chuyển)."
        },
        hoa_cau_gu: {
            id: "hoa_cau_gu",
            name: "Xích Diễm Cổ",
            icon: "🔥",
            realmCategory: "mortal_only",
            minRank: 1,
            maxRank: 5,
            defaultRank: 1,
            path: "Viêm Đạo",
            type: "offensive",
            castType: "aoe_cursor",
            basePower: 28,
            cooldown: 2.3,
            range: 280,
            radius: 70,
            projectileColor: "#ff5733",
            foodItemId: "red_iron_ore",
            baseTradeValue: 46,
            rarity: "uncommon",
            killerTrait: {
                deliveryType: "fire_meteor",
                modifierTag: "burn_ground",
                modifierDesc: "Thiêu đốt mục tiêu và để lại vùng lửa cháy trên mặt đất"
            },
            description: "Phàm cổ Viêm Đạo kích nổ cầu lửa đỏ rực tại vị trí chỉ định, thiêu đốt quần địch (1–5 Chuyển)."
        },
        han_bang_gu: {
            id: "han_bang_gu",
            name: "Hàn Sương Cổ",
            icon: "❄️",
            realmCategory: "mortal_only",
            minRank: 1,
            maxRank: 5,
            defaultRank: 1,
            path: "Băng Đạo",
            type: "offensive",
            castType: "projectile",
            basePower: 22,
            slowEffect: 0.45,
            cooldown: 1.7,
            range: 300,
            radius: 22,
            projectileSpeed: 420,
            projectileColor: "#85c1e9",
            foodItemId: "moon_orchid",
            baseTradeValue: 45,
            rarity: "uncommon",
            killerTrait: {
                deliveryType: "frost_lance",
                modifierTag: "frost_chill",
                modifierDesc: "Phủ Hàn Sương làm chậm và tích tầng Đóng Băng cứng"
            },
            description: "Phàm cổ Băng Đạo phóng băng tiễn hàn khí làm chậm và đóng băng kẻ địch (1–5 Chuyển)."
        },
        dien_nhan_gu: {
            id: "dien_nhan_gu",
            name: "Điện Nhãn Cổ",
            icon: "⚡",
            realmCategory: "mortal_only",
            minRank: 1,
            maxRank: 5,
            defaultRank: 1,
            path: "Lôi Đạo",
            type: "offensive",
            castType: "projectile",
            basePower: 25,
            cooldown: 1.6,
            range: 320,
            radius: 20,
            projectileSpeed: 540,
            projectileColor: "#b75cff",
            foodItemId: "bronze_ore",
            baseTradeValue: 48,
            rarity: "uncommon",
            killerTrait: {
                deliveryType: "thunder_chain",
                modifierTag: "chain_lightning",
                modifierDesc: "Phóng hồ quang điện giật nảy liên hoàn giữa các mục tiêu gần nhau"
            },
            description: "Phàm cổ Lôi Đạo phóng ra tia chớp tím dẫn truyền hồ quang điện liên hoàn (1–5 Chuyển)."
        },
        hu_doc_gu: {
            id: "hu_doc_gu",
            name: "Hủ Độc Thảo Cổ",
            icon: "☠️",
            realmCategory: "mortal_only",
            minRank: 1,
            maxRank: 5,
            defaultRank: 1,
            path: "Độc Đạo",
            type: "offensive",
            castType: "aoe_cursor",
            basePower: 21,
            cooldown: 2.4,
            range: 270,
            radius: 70,
            projectileColor: "#9b59b6",
            foodItemId: "spirit_herb",
            baseTradeValue: 45,
            rarity: "uncommon",
            killerTrait: {
                deliveryType: "poison_miasma",
                modifierTag: "venom_corrosion",
                modifierDesc: "Phát tán khói độc ăn mòn sinh mệnh và giảm 25% phòng ngự của địch"
            },
            description: "Phàm cổ Độc Đạo phát tán chướng khí kịch độc ăn mòn hộ giáp và rút máu kẻ địch (1–5 Chuyển)."
        },
        trinh_sat_gu: {
            id: "trinh_sat_gu",
            name: "Địa Thính Nhục Nhĩ Thảo",
            icon: "👁️",
            realmCategory: "mortal_only",
            minRank: 1,
            maxRank: 5,
            defaultRank: 1,
            path: "Âm Đạo",
            type: "support",
            subType: "recon",
            castType: "self_buff",
            basePower: 16,
            cooldown: 9.0,
            range: 450,
            radius: 450,
            buffDuration: 15,
            visualColor: "#76d7c4",
            foodItemId: "spirit_herb",
            baseTradeValue: 38,
            rarity: "common",
            killerTrait: {
                deliveryType: "sonic_wave",
                modifierTag: "homing_guidance",
                modifierDesc: "Dẫn đường bằng sóng âm giúp các luồng đạn tự động truy kích mục tiêu"
            },
            description: "Phàm cổ trinh sát Âm Đạo lắng nghe động tĩnh, giúp đạn Sát Chiêu tự động truy kích mục tiêu (1–5 Chuyển)."
        },
        tuu_trung_gu: {
            id: "tuu_trung_gu",
            name: "Tửu Trùng",
            icon: "🍶",
            realmCategory: "mortal_only",
            minRank: 1,
            maxRank: 5,
            defaultRank: 1,
            path: "Luyện Đạo",
            type: "support",
            subType: "cultivation",
            castType: "self_buff",
            basePower: 15,
            cooldown: 10.0,
            range: 0,
            radius: 30,
            buffDuration: 12,
            visualColor: "#f7c948",
            foodItemId: "spirit_herb",
            baseTradeValue: 95,
            rarity: "rare",
            killerTrait: {
                deliveryType: "essence_burst",
                modifierTag: "essence_saver",
                modifierDesc: "Tinh luyện chân nguyên giúp giảm 25% mức tiêu hao của Sát Chiêu"
            },
            description: "Phàm cổ Luyện Đạo tinh luyện chân nguyên và tiết kiệm tiêu hao Sát Chiêu, tối đa Ngũ Chuyển."
        },
        cot_thuong_gu: {
            id: "cot_thuong_gu",
            name: "Lao Toàn Cốt Thương Cổ",
            icon: "🦴",
            realmCategory: "mortal_only",
            minRank: 1,
            maxRank: 5,
            defaultRank: 2,
            path: "Kim Đạo",
            type: "offensive",
            castType: "projectile",
            basePower: 26,
            cooldown: 1.5,
            range: 350,
            radius: 22,
            projectileSpeed: 520,
            projectileColor: "#f5f7fa",
            foodItemId: "jade_bone",
            baseTradeValue: 65,
            rarity: "rare",
            killerTrait: {
                deliveryType: "bone_spear_rain",
                modifierTag: "orbiting_blades",
                modifierDesc: "Triệu hồi các mũi Cốt Thương xoay tròn hộ thân cắt xé kẻ địch áp sát"
            },
            description: "Phàm cổ đặc hữu của Bạch Cốt Sơn. Phóng thương xương trắng xoay tròn xuyên thủng giáp trụ (1–5 Chuyển)."
        },
        ngoc_bi_gu: {
            id: "ngoc_bi_gu",
            name: "Bạch Ngọc Cổ",
            icon: "⚪",
            realmCategory: "mortal_only",
            minRank: 1,
            maxRank: 5,
            defaultRank: 2,
            path: "Kim Đạo",
            type: "defensive",
            castType: "self_buff",
            basePower: 20,
            baseShield: 46,
            cooldown: 8.0,
            range: 0,
            radius: 45,
            buffDuration: 12,
            visualColor: "#e8f6f3",
            foodItemId: "jade_bone",
            baseTradeValue: 68,
            rarity: "rare",
            killerTrait: {
                deliveryType: "fortress_aegis",
                modifierTag: "aegis_shield",
                modifierDesc: "Ngưng tụ Bạch Ngọc Hộ Thuẫn phản chấn sát thương cận chiến"
            },
            description: "Phàm cổ phòng ngự biến làn da thành bạch ngọc ôn nhuận kiên cố, phản chấn đòn cận chiến (1–5 Chuyển)."
        },
        thuy_trao_gu: {
            id: "thuy_trao_gu",
            name: "Thủy Tráo Cổ",
            icon: "🫧",
            realmCategory: "mortal_only",
            minRank: 1,
            maxRank: 5,
            defaultRank: 2,
            path: "Thủy Đạo",
            type: "defensive",
            castType: "self_buff",
            basePower: 19,
            baseShield: 42,
            cooldown: 8.0,
            range: 0,
            radius: 50,
            buffDuration: 11,
            visualColor: "#3b8beb",
            foodItemId: "spirit_herb",
            baseTradeValue: 60,
            rarity: "uncommon",
            killerTrait: {
                deliveryType: "water_torrent",
                modifierTag: "water_barrier",
                modifierDesc: "Tạo màn nước cầu tròn phòng hộ và phát nổ sóng nước đẩy lùi"
            },
            description: "Phàm cổ Thủy Đạo tạo màn nước hình cầu bảo vệ toàn thân không có góc chết (1–5 Chuyển)."
        },
        am_anh_gu: {
            id: "am_anh_gu",
            name: "U Ảnh Tiễn Cổ",
            icon: "🌑",
            realmCategory: "mortal_only",
            minRank: 1,
            maxRank: 5,
            defaultRank: 2,
            path: "Ám Đạo",
            type: "offensive",
            castType: "projectile",
            basePower: 25,
            cooldown: 1.5,
            range: 350,
            radius: 20,
            projectileSpeed: 550,
            projectileColor: "#5d6d7e",
            foodItemId: "beast_blood_core",
            baseTradeValue: 62,
            rarity: "rare",
            killerTrait: {
                deliveryType: "shadow_barrage",
                modifierTag: "shadow_pierce",
                modifierDesc: "Mũi tên bóng tối xuyên thấu nhiều mục tiêu và ăn mòn giáp"
            },
            description: "Phàm cổ Ám Đạo bắn ra mũi tên bóng tối vô thanh vô tức xuyên giáp (1–5 Chuyển)."
        },

        // --- 10 PHÀM CỔ MỚI BỔ SUNG (MORTAL ONLY: 1 -> 5 CHUYỂN) ---
        kim_cham_gu: {
            id: "kim_cham_gu",
            name: "Kim Châm Cổ",
            icon: "🪡",
            realmCategory: "mortal_only",
            minRank: 1,
            maxRank: 5,
            defaultRank: 1,
            path: "Kim Đạo",
            type: "offensive",
            castType: "projectile",
            basePower: 25,
            cooldown: 1.2,
            range: 330,
            radius: 16,
            projectileSpeed: 600,
            projectileColor: "#ffd700",
            foodItemId: "bronze_ore",
            baseTradeValue: 44,
            rarity: "common",
            killerTrait: {
                deliveryType: "bone_spear_rain",
                modifierTag: "ricochet_spin",
                modifierDesc: "Phóng mưa kim châm vàng ròng nảy liên hoàn giữa các mục tiêu"
            },
            description: "Phàm cổ Kim Đạo phóng ra chùm kim châm sắc nhọn tốc độ cực cao, chuyên phá hộ thuẫn (1–5 Chuyển)."
        },
        thach_bi_gu: {
            id: "thach_bi_gu",
            name: "Thạch Bì Cổ",
            icon: "🪨",
            realmCategory: "mortal_only",
            minRank: 1,
            maxRank: 5,
            defaultRank: 1,
            path: "Thổ Đạo",
            type: "defensive",
            castType: "self_buff",
            basePower: 16,
            baseShield: 45,
            cooldown: 7.5,
            range: 0,
            radius: 45,
            buffDuration: 11,
            visualColor: "#b8860b",
            foodItemId: "bronze_ore",
            baseTradeValue: 40,
            rarity: "common",
            killerTrait: {
                deliveryType: "fortress_aegis",
                modifierTag: "aegis_shield",
                modifierDesc: "Hóa thạch làn da tăng mạnh giáp đá và hấp thụ sát thương"
            },
            description: "Phàm cổ Thổ Đạo phủ lớp đá xám dày đặc lên cơ thể, phòng ngự trầm ổn như núi (1–5 Chuyển)."
        },
        hac_thach_gu: {
            id: "hac_thach_gu",
            name: "Hắc Thạch Cổ",
            icon: "☄️",
            realmCategory: "mortal_only",
            minRank: 1,
            maxRank: 5,
            defaultRank: 2,
            path: "Thổ Đạo",
            type: "offensive",
            castType: "aoe_cursor",
            basePower: 27,
            cooldown: 2.4,
            range: 290,
            radius: 75,
            projectileColor: "#8c6d46",
            foodItemId: "bronze_ore",
            baseTradeValue: 55,
            rarity: "uncommon",
            killerTrait: {
                deliveryType: "fire_meteor",
                modifierTag: "armor_crush",
                modifierDesc: "Giáng cự thạch từ trên không đập nát đội hình và làm Choáng"
            },
            description: "Phàm cổ Thổ Đạo triệu hồi tảng đá đen nặng ngàn cân nện xuống vị trí chỉ định (1–5 Chuyển)."
        },
        thuy_tien_gu: {
            id: "thuy_tien_gu",
            name: "Thủy Tiễn Cổ",
            icon: "💧",
            realmCategory: "mortal_only",
            minRank: 1,
            maxRank: 5,
            defaultRank: 1,
            path: "Thủy Đạo",
            type: "offensive",
            castType: "projectile",
            basePower: 23,
            cooldown: 1.3,
            range: 320,
            radius: 20,
            projectileSpeed: 480,
            projectileColor: "#3b8beb",
            foodItemId: "spirit_herb",
            baseTradeValue: 42,
            rarity: "common",
            killerTrait: {
                deliveryType: "water_torrent",
                modifierTag: "frost_chill",
                modifierDesc: "Bắn dòng nước áp lực cao xuyên thấu và làm chậm mục tiêu"
            },
            description: "Phàm cổ Thủy Đạo nén hơi nước thành mũi tên bắn xuyên qua nhiều kẻ địch (1–5 Chuyển)."
        },
        xoay_nuoc_gu: {
            id: "xoay_nuoc_gu",
            name: "Xoáy Nước Cổ",
            icon: "🌀",
            realmCategory: "mortal_only",
            minRank: 1,
            maxRank: 5,
            defaultRank: 2,
            path: "Thủy Đạo",
            type: "offensive",
            castType: "aoe_cursor",
            basePower: 25,
            slowEffect: 0.40,
            cooldown: 2.6,
            range: 280,
            radius: 80,
            projectileColor: "#2980b9",
            foodItemId: "spirit_herb",
            baseTradeValue: 58,
            rarity: "uncommon",
            killerTrait: {
                deliveryType: "wind_tornado",
                modifierTag: "vortex_pull",
                modifierDesc: "Tạo xoáy nước khổng lồ cuốn hút và giam cầm quần địch"
            },
            description: "Phàm cổ Thủy Đạo tạo vùng xoáy nước sâu thẳm kéo mọi kẻ địch xung quanh vào tâm (1–5 Chuyển)."
        },
        loi_khieu_gu: {
            id: "loi_khieu_gu",
            name: "Lôi Khiếu Cổ",
            icon: "🌩️",
            realmCategory: "mortal_only",
            minRank: 1,
            maxRank: 5,
            defaultRank: 2,
            path: "Âm Đạo",
            type: "offensive",
            castType: "aoe_self",
            basePower: 26,
            cooldown: 3.0,
            range: 130,
            radius: 130,
            visualColor: "#9b59b6",
            foodItemId: "red_iron_ore",
            baseTradeValue: 60,
            rarity: "uncommon",
            killerTrait: {
                deliveryType: "soul_howl_wave",
                modifierTag: "chain_lightning",
                modifierDesc: "Tiếng gầm sấm sét chấn động màng nhĩ và phóng hồ quang điện"
            },
            description: "Phàm cổ Âm Đạo kiêm Lôi Đạo, phát ra tiếng nổ sấm rền làm tê liệt địch nhân xung quanh (1–5 Chuyển)."
        },
        quy_dien_hoa_gu: {
            id: "quy_dien_hoa_gu",
            name: "Quỷ Diện Hoa Cổ",
            icon: "🌺",
            realmCategory: "mortal_only",
            minRank: 1,
            maxRank: 5,
            defaultRank: 2,
            path: "Hồn Đạo",
            type: "offensive",
            castType: "projectile",
            basePower: 26,
            lifesteal: 0.20,
            cooldown: 1.6,
            range: 310,
            radius: 22,
            projectileSpeed: 440,
            projectileColor: "#8f6ee6",
            foodItemId: "soul_crystal",
            baseTradeValue: 64,
            rarity: "rare",
            killerTrait: {
                deliveryType: "soul_howl_wave",
                modifierTag: "homing_guidance",
                modifierDesc: "Hoa mặt quỷ tự động truy kích hồn phách và hút sinh khí"
            },
            description: "Phàm cổ Hồn Đạo mang hình đóa hoa mặt quỷ kỳ dị, cắn nuốt tinh thần lực của con mồi (1–5 Chuyển)."
        },
        am_tieu_gu: {
            id: "am_tieu_gu",
            name: "Ám Tiêu Cổ",
            icon: "🗡️",
            realmCategory: "mortal_only",
            minRank: 1,
            maxRank: 5,
            defaultRank: 1,
            path: "Ám Đạo",
            type: "offensive",
            castType: "projectile",
            basePower: 24,
            cooldown: 1.2,
            range: 330,
            radius: 18,
            projectileSpeed: 570,
            projectileColor: "#34495e",
            foodItemId: "ration_meat",
            baseTradeValue: 45,
            rarity: "common",
            killerTrait: {
                deliveryType: "crescent_barrage",
                modifierTag: "orbiting_blades",
                modifierDesc: "Phóng phi tiêu bóng tối tốc độ cao và tạo lưỡi tiêu xoay quanh người"
            },
            description: "Phàm cổ Ám Đạo phóng phi tiêu đen tuyền ẩn trong bóng tối, khó lòng phòng bị (1–5 Chuyển)."
        },
        doc_hat_gu: {
            id: "doc_hat_gu",
            name: "Độc Hạt Cổ",
            icon: "🦂",
            realmCategory: "mortal_only",
            minRank: 1,
            maxRank: 5,
            defaultRank: 2,
            path: "Độc Đạo",
            type: "offensive",
            castType: "projectile",
            basePower: 25,
            cooldown: 1.5,
            range: 300,
            radius: 20,
            projectileSpeed: 460,
            projectileColor: "#8e44ad",
            foodItemId: "beast_blood_core",
            baseTradeValue: 58,
            rarity: "uncommon",
            killerTrait: {
                deliveryType: "poison_miasma",
                modifierTag: "venom_corrosion",
                modifierDesc: "Nọc bọ cạp kịch độc làm suy yếu giáp và rút máu liên tục"
            },
            description: "Phàm cổ Độc Đạo từ Tây Mạc, bắn nọc độc bọ cạp ăn mòn sinh cơ đối thủ (1–5 Chuyển)."
        },
        lang_yen_gu: {
            id: "lang_yen_gu",
            name: "Lang Yên Cổ",
            icon: "🐺",
            realmCategory: "mortal_only",
            minRank: 1,
            maxRank: 5,
            defaultRank: 1,
            path: "Nô Đạo",
            type: "support",
            subType: "healing",
            castType: "heal",
            basePower: 28,
            cooldown: 5.5,
            range: 0,
            radius: 60,
            visualColor: "#a88256",
            foodItemId: "ration_meat",
            baseTradeValue: 50,
            rarity: "uncommon",
            killerTrait: {
                deliveryType: "beast_stampede",
                modifierTag: "blood_servant",
                modifierDesc: "Dẫn khói lang yên triệu hồi Chiến Thú trợ chiến và hồi phục thể lực"
            },
            description: "Phàm cổ Nô Đạo của Thường Sơn Âm dùng để trị thương cho bầy sói và triệu hồi thú đàn (1–5 Chuyển)."
        },

        // ==================== NHÓM 2: LINH CỔ THĂNG TỪ PHÀM LÊN TIÊN (ASCENDABLE: 1 -> 9 CHUYỂN) ====================
        huyet_nguyet_gu: {
            id: "huyet_nguyet_gu",
            name: "Huyết Nguyệt Cổ",
            icon: "🩸",
            realmCategory: "ascendable",
            minRank: 1,
            maxRank: 9,
            defaultRank: 1,
            path: "Huyết Đạo",
            type: "offensive",
            castType: "projectile",
            basePower: 26,
            lifesteal: 0.25,
            cooldown: 1.4,
            range: 320,
            radius: 22,
            projectileSpeed: 460,
            projectileColor: "#e03e3e",
            foodItemId: "beast_blood_core",
            baseTradeValue: 65,
            rarity: "rare",
            killerTrait: {
                deliveryType: "blood_wave",
                modifierTag: "blood_leech",
                modifierDesc: "Gây Xuất Huyết và hút máu mục tiêu về cho chủ nhân"
            },
            description: "Cổ trùng Huyết Đạo truyền thừa từ Huyết Hải Lão Tổ. Có thể từng bước hợp luyện thăng cấp từ Nhất Chuyển lên tới Tiên Cổ Cửu Chuyển."
        },
        toan_cuc_luc_gu: {
            id: "toan_cuc_luc_gu",
            name: "Toàn Lực Dĩ Phó Cổ",
            icon: "🐯",
            realmCategory: "ascendable",
            minRank: 1,
            maxRank: 9,
            defaultRank: 3,
            path: "Lực Đạo",
            type: "offensive",
            castType: "aoe_self",
            basePower: 28,
            cooldown: 2.2,
            range: 140,
            radius: 135,
            visualColor: "#e67e22",
            foodItemId: "beast_blood_core",
            baseTradeValue: 80,
            rarity: "epic",
            killerTrait: {
                deliveryType: "beast_stampede",
                modifierTag: "beast_phantom",
                modifierDesc: "Kích phát 100% uy năng Thú Ảnh Lực Đạo càn quét toàn bộ chiến trường"
            },
            description: "Hạch tâm Lực Đạo thời thượng cổ! Có thể thăng Chuyển từ Phàm Cổ lên Tiên Cổ Cửu Chuyển."
        },
        thien_phong_kiem_gu: {
            id: "thien_phong_kiem_gu",
            name: "Thiên Phong Kiếm Vũ Cổ",
            icon: "⚔️",
            realmCategory: "ascendable",
            minRank: 1,
            maxRank: 9,
            defaultRank: 3,
            path: "Kiếm Đạo",
            type: "offensive",
            castType: "projectile",
            basePower: 27,
            cooldown: 1.8,
            range: 420,
            radius: 30,
            projectileSpeed: 600,
            projectileColor: "#dce8f2",
            foodItemId: "red_iron_ore",
            baseTradeValue: 75,
            rarity: "rare",
            killerTrait: {
                deliveryType: "sword_formation",
                modifierTag: "orbiting_blades",
                modifierDesc: "Ngưng tụ kiếm trận truy kích và đạo kiếm khí xoay quanh thân thể"
            },
            description: "Cổ trùng Kiếm Đạo Trung Châu tự động truy kích kẻ địch, có thể thăng cấp xuyên suốt từ Phàm lên Tiên."
        },
        loi_duc_gu: {
            id: "loi_duc_gu",
            name: "Lôi Dực Cổ",
            icon: "⚡",
            realmCategory: "ascendable",
            minRank: 1,
            maxRank: 9,
            defaultRank: 3,
            path: "Lôi Đạo",
            type: "movement",
            castType: "self_buff",
            basePower: 24,
            speedBoost: 1.85,
            cooldown: 6.0,
            range: 280,
            radius: 95,
            buffDuration: 8,
            visualColor: "#a569bd",
            foodItemId: "red_iron_ore",
            baseTradeValue: 72,
            rarity: "rare",
            killerTrait: {
                deliveryType: "thunder_chain",
                modifierTag: "chain_lightning",
                modifierDesc: "Đôi cánh sấm sét vừa tăng tốc vừa phóng lôi điện liên hoàn"
            },
            description: "Ngưng tụ đôi cánh lôi điện sau lưng, có thể ôn dưỡng thăng cấp từ Phàm Cổ lên Tiên Cổ Lôi Đạo."
        },
        hon_khieu_gu: {
            id: "hon_khieu_gu",
            name: "Nhiếp Hồn Âm Cổ",
            icon: "👻",
            realmCategory: "ascendable",
            minRank: 1,
            maxRank: 9,
            defaultRank: 3,
            path: "Hồn Đạo",
            type: "offensive",
            castType: "aoe_self",
            basePower: 26,
            cooldown: 3.2,
            range: 170,
            radius: 170,
            visualColor: "#8f6ee6",
            foodItemId: "soul_crystal",
            baseTradeValue: 78,
            rarity: "epic",
            killerTrait: {
                deliveryType: "soul_howl_wave",
                modifierTag: "soul_stun",
                modifierDesc: "Tiếng gầm chấn động linh hồn làm Choáng toàn bộ kẻ địch trong vùng rộng"
            },
            description: "Cổ trùng Hồn Đạo tấn công thẳng vào hồn phách quần địch, có thể thăng Chuyển lên Tiên Cấp."
        },
        sinh_co_moc_gu: {
            id: "sinh_co_moc_gu",
            name: "Thiên Nguyên Bảo Liên",
            icon: "🪷",
            realmCategory: "ascendable",
            minRank: 3,
            maxRank: 9,
            defaultRank: 3,
            path: "Mộc Đạo",
            type: "support",
            subType: "healing",
            castType: "heal",
            basePower: 25,
            cooldown: 5.5,
            range: 0,
            radius: 80,
            visualColor: "#2ecc71",
            foodItemId: "hundred_year_ginseng",
            baseTradeValue: 110,
            rarity: "legendary",
            killerTrait: {
                deliveryType: "vitality_domain",
                modifierTag: "life_bloom",
                modifierDesc: "Hồi phục lượng lớn Sinh Mệnh và giảm 35% Chân Nguyên tiêu hao của Sát Chiêu"
            },
            description: "Chí bảo hệ liệt của Nguyên Liên Tiên Tôn! Khởi đầu từ Tam Chuyển và có thể thăng thẳng lên Cửu Chuyển Thiên Nguyên Bảo Hoàng Liên."
        },
        van_kiem_quy_tong_gu: {
            id: "van_kiem_quy_tong_gu",
            name: "Khổ Lực Cổ",
            icon: "🦣",
            realmCategory: "ascendable",
            minRank: 1,
            maxRank: 9,
            defaultRank: 4,
            path: "Lực Đạo",
            type: "offensive",
            castType: "aoe_cursor",
            basePower: 27,
            cooldown: 2.8,
            range: 420,
            radius: 130,
            projectileColor: "#ffd700",
            foodItemId: "soul_crystal",
            baseTradeValue: 85,
            rarity: "epic",
            killerTrait: {
                deliveryType: "beast_stampede",
                modifierTag: "beast_phantom",
                modifierDesc: "Triệu hồi đàn Vạn Thú Hư Ảnh giẫm đạp nát chiến trường"
            },
            description: "Trọng bảo Lực Đạo tại Tam Vương Sơn, máu mất càng nhiều uy lực thú ảnh càng khủng khiếp (1–9 Chuyển)."
        },
        hoa_long_gu: {
            id: "hoa_long_gu",
            name: "Xích Viêm Hỏa Long Cổ",
            icon: "🔥",
            realmCategory: "ascendable",
            minRank: 1,
            maxRank: 9,
            defaultRank: 4,
            path: "Viêm Đạo",
            type: "offensive",
            castType: "aoe_cursor",
            basePower: 28,
            cooldown: 3.0,
            range: 440,
            radius: 140,
            projectileColor: "#ff5733",
            foodItemId: "red_iron_ore",
            baseTradeValue: 85,
            rarity: "epic",
            killerTrait: {
                deliveryType: "fire_meteor",
                modifierTag: "burn_ground",
                modifierDesc: "Triệu hồi Hỏa Long và mưa thiên hỏa thiêu rụi diện rộng"
            },
            description: "Ngưng tụ rồng lửa khổng lồ lao xuống mục tiêu tạo biển lửa, có thể thăng từ Phàm lên Tiên (1–9 Chuyển)."
        },
        bang_tuyet_phong_gu: {
            id: "bang_tuyet_phong_gu",
            name: "Băng Tinh Tuyết Hoa Cổ",
            icon: "❄️",
            realmCategory: "ascendable",
            minRank: 1,
            maxRank: 9,
            defaultRank: 4,
            path: "Băng Đạo",
            type: "offensive",
            castType: "aoe_cursor",
            basePower: 26,
            slowEffect: 0.65,
            cooldown: 2.9,
            range: 430,
            radius: 135,
            projectileColor: "#85c1e9",
            foodItemId: "moon_orchid",
            baseTradeValue: 82,
            rarity: "epic",
            killerTrait: {
                deliveryType: "frost_lance",
                modifierTag: "frost_chill",
                modifierDesc: "Bão tuyết vạn dặm lập tức Đóng Băng cứng quần địch trong vùng nổ"
            },
            description: "Cổ trùng Băng Đạo tinh hoa của Bạch Ngưng Băng, có thể luyện hóa thăng cấp lên Tiên Cổ (1–9 Chuyển)."
        },
        kim_chung_trao_gu: {
            id: "kim_chung_trao_gu",
            name: "Hoàng Kim Chung Cổ",
            icon: "🔔",
            realmCategory: "ascendable",
            minRank: 1,
            maxRank: 9,
            defaultRank: 4,
            path: "Kim Đạo",
            type: "defensive",
            castType: "self_buff",
            basePower: 22,
            baseShield: 52,
            cooldown: 8.5,
            range: 0,
            radius: 95,
            buffDuration: 12,
            visualColor: "#ffd700",
            foodItemId: "red_iron_ore",
            baseTradeValue: 84,
            rarity: "epic",
            killerTrait: {
                deliveryType: "fortress_aegis",
                modifierTag: "aegis_shield",
                modifierDesc: "Chuông vàng hộ thể hấp thụ sát thương cực lớn và phát sóng âm phản chấn"
            },
            description: "Hóa thành đại hồng chung bằng vàng ròng che chở Cổ Sư, có thể thăng cấp lên Tiên Cấp (1–9 Chuyển)."
        },
        thai_co_long_luc_gu: {
            id: "thai_co_long_luc_gu",
            name: "Thái Cổ Giao Long Lực Cổ",
            icon: "🐉",
            realmCategory: "ascendable",
            minRank: 1,
            maxRank: 9,
            defaultRank: 5,
            path: "Lực Đạo",
            type: "offensive",
            castType: "aoe_self",
            basePower: 29,
            cooldown: 3.4,
            range: 185,
            radius: 185,
            visualColor: "#b75cff",
            foodItemId: "soul_crystal",
            baseTradeValue: 95,
            rarity: "legendary",
            killerTrait: {
                deliveryType: "beast_stampede",
                modifierTag: "beast_phantom",
                modifierDesc: "Triệu hồi 3 Thái Cổ Giao Long Hư Ảnh nghiền nát toàn bộ chiến trường"
            },
            description: "Cổ trùng Lực Đạo mang huyết mạch Giao Long, có thể tấn thăng từ Phàm lên Cửu Chuyển."
        },
        huyet_hai_thao_thien_gu: {
            id: "huyet_hai_thao_thien_gu",
            name: "Huyết Hà Đại Trận Cổ",
            icon: "🩸",
            realmCategory: "ascendable",
            minRank: 1,
            maxRank: 9,
            defaultRank: 5,
            path: "Huyết Đạo",
            type: "offensive",
            castType: "aoe_cursor",
            basePower: 28,
            lifesteal: 0.35,
            cooldown: 3.5,
            range: 460,
            radius: 160,
            projectileColor: "#e03e3e",
            foodItemId: "beast_blood_core",
            baseTradeValue: 95,
            rarity: "legendary",
            killerTrait: {
                deliveryType: "blood_wave",
                modifierTag: "blood_servant",
                modifierDesc: "Hóa vùng đất thành Huyết Hải hút 35% máu và triệu hồi Huyết Chiến Thú"
            },
            description: "Chí bảo của Huyết Hải Lão Tổ, một niệm hóa sông máu nuốt chửng vạn vật (1–9 Chuyển)."
        },

        // --- 8 LINH CỔ MỚI BỔ SUNG (ASCENDABLE: 1 -> 9 CHUYỂN) ---
        kiem_anh_gu: {
            id: "kiem_anh_gu",
            name: "Kiếm Ảnh Cổ",
            icon: "🗡️",
            realmCategory: "ascendable",
            minRank: 1,
            maxRank: 9,
            defaultRank: 2,
            path: "Kiếm Đạo",
            type: "offensive",
            castType: "projectile",
            basePower: 26,
            cooldown: 1.4,
            range: 400,
            radius: 24,
            projectileSpeed: 640,
            projectileColor: "#7ef7f0",
            foodItemId: "red_iron_ore",
            baseTradeValue: 70,
            rarity: "rare",
            killerTrait: {
                deliveryType: "sword_formation",
                modifierTag: "ricochet_spin",
                modifierDesc: "Hoán đổi tàn ảnh kiếm quang xuyên thấu và nảy liên hoàn"
            },
            description: "Linh cổ Kiếm Đạo hóa kiếm thành ảnh, tốc độ xuất kiếm nhanh như điện xẹt (Thăng được 1–9 Chuyển)."
        },
        huyet_lo_gu: {
            id: "huyet_lo_gu",
            name: "Huyết Lô Cổ",
            icon: "💀",
            realmCategory: "ascendable",
            minRank: 1,
            maxRank: 9,
            defaultRank: 3,
            path: "Huyết Đạo",
            type: "offensive",
            castType: "aoe_self",
            basePower: 28,
            lifesteal: 0.30,
            cooldown: 2.8,
            range: 150,
            radius: 150,
            visualColor: "#c0392b",
            foodItemId: "beast_blood_core",
            baseTradeValue: 82,
            rarity: "epic",
            killerTrait: {
                deliveryType: "blood_wave",
                modifierTag: "blood_leech",
                modifierDesc: "Huyết Lô thôn phệ vạn sinh linh, chuyển hóa 30% sát thương thành Sinh Mệnh"
            },
            description: "Chí bảo đồ sát của Cổ Nguyệt Nhất Thế! Càng giết chóc càng tích tụ huyết năng hùng hậu (1–9 Chuyển)."
        },
        thu_luc_tinh_hon_gu: {
            id: "thu_luc_tinh_hon_gu",
            name: "Thú Lực Tinh Hồn Cổ",
            icon: "🦁",
            realmCategory: "ascendable",
            minRank: 1,
            maxRank: 9,
            defaultRank: 3,
            path: "Nô Đạo",
            type: "offensive",
            castType: "aoe_cursor",
            basePower: 27,
            cooldown: 2.9,
            range: 390,
            radius: 120,
            projectileColor: "#e67e22",
            foodItemId: "beast_blood_core",
            baseTradeValue: 78,
            rarity: "rare",
            killerTrait: {
                deliveryType: "beast_stampede",
                modifierTag: "blood_servant",
                modifierDesc: "Triệu hồi chiến hồn Bách Thú Vương lao xuống vây công kẻ địch"
            },
            description: "Linh cổ kết hợp Nô Đạo và Lực Đạo, phong ấn tinh hồn vạn thú để triệu hồi khi giao chiến (1–9 Chuyển)."
        },
        ban_son_luc_gu: {
            id: "ban_son_luc_gu",
            name: "Bàn Sơn Lực Cổ",
            icon: "⛰️",
            realmCategory: "ascendable",
            minRank: 1,
            maxRank: 9,
            defaultRank: 4,
            path: "Thổ Đạo",
            type: "defensive",
            castType: "self_buff",
            basePower: 24,
            baseShield: 58,
            cooldown: 8.0,
            range: 0,
            radius: 110,
            buffDuration: 12,
            visualColor: "#d4af37",
            foodItemId: "red_iron_ore",
            baseTradeValue: 86,
            rarity: "epic",
            killerTrait: {
                deliveryType: "fortress_aegis",
                modifierTag: "aegis_shield",
                modifierDesc: "Sức mạnh dời non lấp bể, dựng tường sơn nhạc bất hoại"
            },
            description: "Linh cổ Thổ Đạo kiêm Lực Đạo, ban cho Cổ Sư thần lực bạt núi và lớp giáp sơn nhạc (1–9 Chuyển)."
        },
        tinh_quang_gu: {
            id: "tinh_quang_gu",
            name: "Tinh Quang Cổ",
            icon: "🌟",
            realmCategory: "ascendable",
            minRank: 1,
            maxRank: 9,
            defaultRank: 3,
            path: "Quang Đạo",
            type: "offensive",
            castType: "aoe_cursor",
            basePower: 27,
            cooldown: 2.4,
            range: 440,
            radius: 115,
            projectileColor: "#4ce6ff",
            foodItemId: "moon_orchid",
            baseTradeValue: 76,
            rarity: "rare",
            killerTrait: {
                deliveryType: "star_meteor_rain",
                modifierTag: "moon_slash",
                modifierDesc: "Dẫn động tinh quang cửu thiên bắn xuyên thấu mọi mục tiêu"
            },
            description: "Linh cổ Quang Đạo dẫn ánh sáng sao trời từ Hắc Thiên và Bạch Thiên giáng xuống chiến trường (1–9 Chuyển)."
        },
        thien_thi_vuong_gu: {
            id: "thien_thi_vuong_gu",
            name: "Thiên Thi Vương Cổ",
            icon: "🧟",
            realmCategory: "ascendable",
            minRank: 1,
            maxRank: 9,
            defaultRank: 4,
            path: "Hồn Đạo",
            type: "offensive",
            castType: "aoe_self",
            basePower: 28,
            lifesteal: 0.25,
            cooldown: 3.2,
            range: 165,
            radius: 165,
            visualColor: "#6c3483",
            foodItemId: "soul_crystal",
            baseTradeValue: 88,
            rarity: "epic",
            killerTrait: {
                deliveryType: "soul_howl_wave",
                modifierTag: "blood_servant",
                modifierDesc: "Hóa thân Tiên Cương bất tử, triệu hồi Thi Vương và chấn nhiếp hồn phách"
            },
            description: "Bí truyền của Cương Minh! Ngưng tụ thi khí và hồn hỏa bất diệt, vừa công kích vừa triệu hồi Thi Vương (1–9 Chuyển)."
        },
        thien_dia_hong_lo_gu: {
            id: "thien_dia_hong_lo_gu",
            name: "Thiên Địa Hồng Lô Cổ",
            icon: "🏺",
            realmCategory: "ascendable",
            minRank: 1,
            maxRank: 9,
            defaultRank: 4,
            path: "Luyện Đạo",
            type: "offensive",
            castType: "aoe_cursor",
            basePower: 28,
            cooldown: 2.9,
            range: 420,
            radius: 135,
            projectileColor: "#ff7f50",
            foodItemId: "red_iron_ore",
            baseTradeValue: 90,
            rarity: "epic",
            killerTrait: {
                deliveryType: "fire_meteor",
                modifierTag: "burn_ground",
                modifierDesc: "Lấy thiên địa làm lò luyện, thiêu đốt đạo ngân kẻ địch và giảm 25% tiêu hao"
            },
            description: "Trọng bảo Luyện Đạo kiêm Viêm Đạo, triệu hồi hư ảnh đỉnh lò khổng lồ luyện hóa vạn vật (1–9 Chuyển)."
        },
        cam_ly_van_gu: {
            id: "cam_ly_van_gu",
            name: "Cẩm Lý Vận Cổ",
            icon: "🐟",
            realmCategory: "ascendable",
            minRank: 1,
            maxRank: 9,
            defaultRank: 3,
            path: "Vận Đạo",
            type: "support",
            subType: "cultivation",
            castType: "self_buff",
            basePower: 25,
            cooldown: 7.0,
            range: 0,
            radius: 90,
            buffDuration: 12,
            visualColor: "#ffd700",
            foodItemId: "hundred_year_ginseng",
            baseTradeValue: 92,
            rarity: "epic",
            killerTrait: {
                deliveryType: "crescent_barrage",
                modifierTag: "essence_saver",
                modifierDesc: "Ngưng tụ hồng vận giúp giảm 25% tiêu hao và tăng mạnh uy lực Sát Chiêu"
            },
            description: "Linh cổ Vận Đạo mang hình cá chép vàng rực rỡ, xoay chuyển khí vận giúp phùng hung hóa cát (1–9 Chuyển)."
        },

        // ==================== NHÓM 3: CHỈ CÓ TIÊN CẤP (IMMORTAL ONLY: 6 -> 9 CHUYỂN) ====================
        phi_kiem_tien_gu: {
            id: "phi_kiem_tien_gu",
            name: "Phi Kiếm Tiên Cổ",
            icon: "✨",
            realmCategory: "immortal_only",
            minRank: 6,
            maxRank: 9,
            defaultRank: 6,
            path: "Kiếm Đạo",
            type: "offensive",
            castType: "projectile",
            basePower: 28,
            cooldown: 2.0,
            range: 620,
            radius: 48,
            projectileSpeed: 780,
            projectileColor: "#ffffff",
            foodItemId: "immortal_stone",
            baseTradeValue: 180,
            rarity: "immortal",
            killerTrait: {
                deliveryType: "sword_formation",
                modifierTag: "orbiting_blades",
                modifierDesc: "Tiên Đạo Vạn Kiếm Quy Tông truy kích và 5 thanh Tiên Kiếm hộ thân"
            },
            description: "Tiên Cổ Kiếm Đạo hạch tâm của Kiếm Tiên Bạc Thanh! Chỉ tồn tại ở Tiên Cấp (6–9 Chuyển), một kiếm chém đứt thương khung."
        },
        dinh_tien_du_gu: {
            id: "dinh_tien_du_gu",
            name: "Định Tiên Du",
            icon: "🦋",
            realmCategory: "immortal_only",
            minRank: 6,
            maxRank: 9,
            defaultRank: 6,
            path: "Không Gian Đạo",
            type: "movement",
            castType: "self_buff",
            basePower: 25,
            speedBoost: 2.25,
            cooldown: 4.2,
            range: 580,
            radius: 135,
            buffDuration: 10,
            visualColor: "#5cc995",
            foodItemId: "immortal_stone",
            baseTradeValue: 200,
            rarity: "immortal",
            killerTrait: {
                deliveryType: "space_rift_slash",
                modifierTag: "swift_step",
                modifierDesc: "Xé rách không gian dịch chuyển tức thời và tạo vết nứt hư không hủy diệt"
            },
            description: "Tiên Cổ Không Gian Đạo hóa thân hồ điệp ngọc bích! Chỉ có ở Tiên Cấp (6–9 Chuyển), trong một niệm đi khắp thiên nhai."
        },
        xuan_thu_thien_gu: {
            id: "xuan_thu_thien_gu",
            name: "Xuân Thu Thiền",
            icon: "🦗",
            realmCategory: "immortal_only",
            minRank: 6,
            maxRank: 9,
            defaultRank: 6,
            path: "Thời Gian Đạo",
            type: "support",
            subType: "cultivation",
            castType: "self_buff",
            basePower: 27,
            cooldown: 9.0,
            range: 0,
            radius: 160,
            buffDuration: 15,
            visualColor: "#f2d16b",
            foodItemId: "immortal_stone",
            baseTradeValue: 250,
            rarity: "immortal",
            killerTrait: {
                deliveryType: "time_river_storm",
                modifierTag: "time_accelerate",
                modifierDesc: "Triệu hồi sóng nước Quang Âm Trường Hà cuốn trôi vạn vật và giảm 40% hồi chiêu"
            },
            description: "Đệ Thất Kỳ Cổ trên Bảng Thập Đại Kỳ Cổ, Cổ Bản Mệnh của Phương Nguyên! Chỉ có ở Tiên Cấp (6–9 Chuyển)."
        },
        van_nga_tien_gu: {
            id: "van_nga_tien_gu",
            name: "Vạn Ngã Tiên Cổ",
            icon: "👥",
            realmCategory: "immortal_only",
            minRank: 6,
            maxRank: 9,
            defaultRank: 7,
            path: "Lực Đạo",
            type: "offensive",
            castType: "aoe_self",
            basePower: 30,
            cooldown: 3.2,
            range: 240,
            radius: 220,
            visualColor: "#ffd700",
            foodItemId: "immortal_stone",
            baseTradeValue: 260,
            rarity: "immortal",
            killerTrait: {
                deliveryType: "beast_stampede",
                modifierTag: "beast_phantom",
                modifierDesc: "Dung hợp Nô Lực Nhị Đạo, triệu hồi vạn thiên Pháp Tướng Hư Ảnh vây công"
            },
            description: "Tiên Cổ độc sáng của Phương Nguyên dung hợp Lực Đạo và Nô Đạo! Chỉ tồn tại ở Tiên Cấp (6–9 Chuyển)."
        },
        tri_tue_tien_gu: {
            id: "tri_tue_tien_gu",
            name: "Trí Tuệ Cổ",
            icon: "🌟",
            realmCategory: "immortal_only",
            minRank: 6,
            maxRank: 9,
            defaultRank: 8,
            path: "Trí Đạo",
            type: "support",
            subType: "cultivation",
            castType: "self_buff",
            basePower: 32,
            cooldown: 8.0,
            range: 500,
            radius: 200,
            buffDuration: 15,
            visualColor: "#67b7d1",
            foodItemId: "immortal_stone",
            baseTradeValue: 320,
            rarity: "immortal",
            killerTrait: {
                deliveryType: "star_meteor_rain",
                modifierTag: "essence_saver",
                modifierDesc: "Tỏa ra Vầng Sáng Trí Tuệ khuếch đại cực hạn uy năng Sát Chiêu và giảm 35% tiêu hao"
            },
            description: "Huyền thoại Trí Đạo Tiên Cổ từng ẩn trong Vương Đình Phúc Địa! Chỉ tồn tại ở Tiên Cấp (6–9 Chuyển)."
        },

        // --- 10 TIÊN CỔ / KỲ CỔ MỚI BỔ SUNG (IMMORTAL ONLY: 6 -> 9 CHUYỂN) ---
        chi_ton_tien_thai_gu: {
            id: "chi_ton_tien_thai_gu",
            name: "Chí Tôn Tiên Thai Cổ",
            icon: "☯️",
            realmCategory: "immortal_only",
            minRank: 6,
            maxRank: 9,
            defaultRank: 9,
            path: "Luyện Đạo",
            type: "support",
            subType: "healing",
            castType: "heal",
            basePower: 35,
            cooldown: 6.0,
            range: 0,
            radius: 220,
            visualColor: "#00e5ff",
            foodItemId: "immortal_stone",
            baseTradeValue: 500,
            rarity: "immortal",
            killerTrait: {
                deliveryType: "time_river_storm",
                modifierTag: "life_bloom",
                modifierDesc: "Vạn Pháp Đạo Ngân Hộ Thể bất xung đột, đại hồi phục Sinh Mệnh và khuếch đại cực đại Sát Chiêu"
            },
            description: "Chí bảo nghịch thiên do U Hồn Ma Tôn dốc trăm ngàn năm luyện chế tại Nghĩa Thiên Sơn! Đạo ngân vạn phái tương dung (6–9 Chuyển)."
        },
        nghich_luu_ho_than_gu: {
            id: "nghich_luu_ho_than_gu",
            name: "Nghịch Lưu Hộ Thân Ấn Cổ",
            icon: "🌊",
            realmCategory: "immortal_only",
            minRank: 6,
            maxRank: 9,
            defaultRank: 7,
            path: "Thủy Đạo",
            type: "defensive",
            castType: "self_buff",
            basePower: 28,
            baseShield: 68,
            cooldown: 7.5,
            range: 0,
            radius: 160,
            buffDuration: 12,
            visualColor: "#4ce6ff",
            foodItemId: "immortal_stone",
            baseTradeValue: 280,
            rarity: "immortal",
            killerTrait: {
                deliveryType: "water_torrent",
                modifierTag: "water_barrier",
                modifierDesc: "Khoác trường bào nước Nghịch Lưu Hà hấp thụ sát thương cực lớn và phản nghịch công kích"
            },
            description: "Hạch tâm phòng ngự của Nghịch Lưu Hà Chi Chủ! Khoác dòng sông Nghịch Lưu lên thân thể phản chấn vạn pháp (6–9 Chuyển)."
        },
        cau_thi_van_tien_gu: {
            id: "cau_thi_van_tien_gu",
            name: "Cẩu Thỉ Vận Tiên Cổ",
            icon: "🎲",
            realmCategory: "immortal_only",
            minRank: 6,
            maxRank: 9,
            defaultRank: 6,
            path: "Vận Đạo",
            type: "support",
            subType: "cultivation",
            castType: "self_buff",
            basePower: 28,
            cooldown: 7.0,
            range: 0,
            radius: 140,
            buffDuration: 12,
            visualColor: "#ffd700",
            foodItemId: "immortal_stone",
            baseTradeValue: 230,
            rarity: "immortal",
            killerTrait: {
                deliveryType: "star_meteor_rain",
                modifierTag: "essence_saver",
                modifierDesc: "Bất ngờ bộc phát khí vận nghịch thiên, tăng mạnh sát thương bạo kích và giảm tiêu hao"
            },
            description: "Chân truyền Kỷ Vận của Cự Dương Tiên Tôn lưu tại Lang Gia Phúc Địa! Bảo vệ khí vận bản thân vững như bàn thạch (6–9 Chuyển)."
        },
        kiep_van_dan_tien_gu: {
            id: "kiep_van_dan_tien_gu",
            name: "Kiếp Vận Đàn Tiên Cổ",
            icon: "⛩️",
            realmCategory: "immortal_only",
            minRank: 6,
            maxRank: 9,
            defaultRank: 8,
            path: "Vận Đạo",
            type: "offensive",
            castType: "aoe_cursor",
            basePower: 33,
            cooldown: 3.4,
            range: 520,
            radius: 190,
            projectileColor: "#ffd700",
            foodItemId: "immortal_stone",
            baseTradeValue: 360,
            rarity: "immortal",
            killerTrait: {
                deliveryType: "fire_meteor",
                modifierTag: "aegis_shield",
                modifierDesc: "Chuyển hóa tai kiếp thành hồng vận, giáng kim quang hủy diệt và tạo hộ thuẫn Vận Đạo"
            },
            description: "Chí bảo Vận Đạo của Trường Sinh Thiên do Cự Dương Tiên Tôn sáng lập! Biến tai kiếp thành phúc vận (6–9 Chuyển)."
        },
        ai_tinh_tien_gu: {
            id: "ai_tinh_tien_gu",
            name: "Ái Tình Tiên Cổ",
            icon: "💖",
            realmCategory: "immortal_only",
            minRank: 6,
            maxRank: 9,
            defaultRank: 9,
            path: "Trí Đạo",
            type: "offensive",
            castType: "projectile",
            basePower: 34,
            lifesteal: 0.30,
            cooldown: 2.5,
            range: 640,
            radius: 52,
            projectileSpeed: 760,
            projectileColor: "#ff85a2",
            foodItemId: "immortal_stone",
            baseTradeValue: 420,
            rarity: "immortal",
            killerTrait: {
                deliveryType: "crescent_barrage",
                modifierTag: "life_bloom",
                modifierDesc: "Ái tình vô lý bất giảng đạo lý: Vừa xuyên thủng phòng ngự Tôn Giả vừa hồi phục Sinh Mệnh"
            },
            description: "Tiên Cổ truyền kỳ của Linh Duyên Trai từng bức lui Cự Dương Tiên Tôn! Uy năng biến ảo khôn lường (6–9 Chuyển)."
        },
        dang_hon_tien_gu: {
            id: "dang_hon_tien_gu",
            name: "Đãng Hồn Tiên Cổ",
            icon: "🔮",
            realmCategory: "immortal_only",
            minRank: 6,
            maxRank: 9,
            defaultRank: 7,
            path: "Hồn Đạo",
            type: "offensive",
            castType: "aoe_self",
            basePower: 31,
            cooldown: 3.0,
            range: 220,
            radius: 210,
            visualColor: "#ff85d5",
            foodItemId: "immortal_stone",
            baseTradeValue: 290,
            rarity: "immortal",
            killerTrait: {
                deliveryType: "soul_howl_wave",
                modifierTag: "soul_stun",
                modifierDesc: "Chấn động Đãng Hồn Sơn đánh tan hồn phách thành Đảm Thức Cổ và làm Choáng diện rộng"
            },
            description: "Tiên Cổ ngưng tụ từ tinh hoa Đãng Hồn Sơn! Một tiếng chấn động khiến vạn hồn tan rã (6–9 Chuyển)."
        },
        lac_phach_tien_gu: {
            id: "lac_phach_tien_gu",
            name: "Lạc Phách Tiên Cổ",
            icon: "🌪️",
            realmCategory: "immortal_only",
            minRank: 6,
            maxRank: 9,
            defaultRank: 7,
            path: "Phong Đạo",
            type: "offensive",
            castType: "projectile",
            basePower: 31,
            cooldown: 2.1,
            range: 580,
            radius: 46,
            projectileSpeed: 720,
            projectileColor: "#85c1e9",
            foodItemId: "immortal_stone",
            baseTradeValue: 290,
            rarity: "immortal",
            killerTrait: {
                deliveryType: "wind_tornado",
                modifierTag: "vortex_pull",
                modifierDesc: "Thổi luồng Lạc Phách Phong lạnh thấu xương cắt nát hồn phách mục tiêu"
            },
            description: "Tiên Cổ sinh ra từ bí cảnh Lạc Phách Cốc! Kết hợp cùng Đãng Hồn Tiên Cổ tạo thành tuyệt kỹ An Hồn (6–9 Chuyển)."
        },
        thai_do_tien_gu: {
            id: "thai_do_tien_gu",
            name: "Thái Độ Tiên Cổ",
            icon: "🎭",
            realmCategory: "immortal_only",
            minRank: 6,
            maxRank: 9,
            defaultRank: 8,
            path: "Trí Đạo",
            type: "movement",
            castType: "self_buff",
            basePower: 29,
            speedBoost: 2.35,
            cooldown: 5.0,
            range: 480,
            radius: 150,
            buffDuration: 11,
            visualColor: "#f7c948",
            foodItemId: "immortal_stone",
            baseTradeValue: 330,
            rarity: "immortal",
            killerTrait: {
                deliveryType: "dash_blitz",
                modifierTag: "homing_guidance",
                modifierDesc: "Ngụy trang thiên cơ, lướt tàn ảnh vô hình và dẫn đường cho mọi đòn công kích"
            },
            description: "Tiên Cổ truyền kỳ từng được ghi trong Nhân Tổ Truyện, hạch tâm của sát chiêu Gương Mặt Quen Thuộc (6–9 Chuyển)."
        },
        hoanh_xung_tien_gu: {
            id: "hoanh_xung_tien_gu",
            name: "Hoành Xung Trực Chạm Tiên Cổ",
            icon: "🦏",
            realmCategory: "immortal_only",
            minRank: 6,
            maxRank: 9,
            defaultRank: 7,
            path: "Lực Đạo",
            type: "offensive",
            castType: "aoe_cursor",
            basePower: 31,
            cooldown: 2.8,
            range: 500,
            radius: 175,
            projectileColor: "#e67e22",
            foodItemId: "immortal_stone",
            baseTradeValue: 275,
            rarity: "immortal",
            killerTrait: {
                deliveryType: "beast_stampede",
                modifierTag: "beast_phantom",
                modifierDesc: "Bất chấp chướng ngại húc thẳng qua trận hình địch, gây Choáng và hất văng"
            },
            description: "Tiên Cổ Lực Đạo bá đạo của Bắc Nguyên, một khi phát động thì vạn quân khó cản (6–9 Chuyển)."
        },
        thien_co_tien_gu: {
            id: "thien_co_tien_gu",
            name: "Thiên Cơ Tiên Cổ",
            icon: "☸️",
            realmCategory: "immortal_only",
            minRank: 6,
            maxRank: 9,
            defaultRank: 9,
            path: "Trí Đạo",
            type: "offensive",
            castType: "aoe_cursor",
            basePower: 34,
            cooldown: 3.2,
            range: 600,
            radius: 200,
            projectileColor: "#00e5ff",
            foodItemId: "immortal_stone",
            baseTradeValue: 450,
            rarity: "immortal",
            killerTrait: {
                deliveryType: "thunder_chain",
                modifierTag: "chain_lightning",
                modifierDesc: "Thấu triệt thiên cơ, dẫn động Lôi Kiếp Hỗn Độn oanh kích chuẩn xác điểm yếu của địch"
            },
            description: "Trọng bảo Trí Đạo nắm giữ bí mật vận hành của Thiên Đạo, hạch tâm của sát chiêu Thiên Cơ Lẫn Lộn (6–9 Chuyển)."
        }
    };

    // Bí danh tương thích ngược với các mã cổ trùng cũ
    const LEGACY_GU_ALIASES = {
        nguyet_xoay_gu: { id: "nguyet_quang_gu", rank: 2 },
        hoang_kim_nguyet_gu: { id: "nguyet_quang_gu", rank: 3 },
        cuong_phong_gu: { id: "phong_nhan_gu", rank: 2 },
        thanh_duc_gu: { id: "thanh_phong_gu", rank: 2 },
        cot_duc_gu: { id: "cot_thuong_gu", rank: 3 },
        thiet_ngac_luc_gu: { id: "hung_luc_gu", rank: 2 },
        huyet_sat_gu: { id: "huyet_nguyet_gu", rank: 2 },
        tu_vi_tuu_trung_gu: { id: "tuu_trung_gu", rank: 2 },
        van_tho_vo_cuong_gu: { id: "sinh_co_moc_gu", rank: 5 }
    };

    // =========================================================================
    // 3. BÍ PHƯƠNG HỢP LUYỆN CỔ TRÙNG MỞ RỘNG (REFINEMENT_RECIPES)
    // =========================================================================

    const REFINEMENT_RECIPES = [
        {
            id: "recipe_nguyet_quang_r2",
            resultGuId: "nguyet_quang_gu",
            resultRank: 2,
            resultName: "Nguyệt Quang Cổ Nhị Chuyển",
            requiredGuIds: ["nguyet_quang_gu"],
            requiredItemId: "moon_orchid",
            requiredRealmRank: 1,
            essenceCost: 28,
            stoneCost: 25,
            baseChance: 0.75,
            unlockedByDefault: true,
            ingredientsDesc: "Nguyệt Quang Cổ + Nguyệt Lan Hoa + 25 Nguyên Thạch"
        },
        {
            id: "recipe_phong_nhan_r2",
            resultGuId: "phong_nhan_gu",
            resultRank: 2,
            resultName: "Phong Nhận Cổ Nhị Chuyển",
            requiredGuIds: ["phong_nhan_gu"],
            requiredItemId: "wind_essence_crystal",
            requiredRealmRank: 1,
            essenceCost: 28,
            stoneCost: 26,
            baseChance: 0.74,
            unlockedByDefault: true,
            ingredientsDesc: "Phong Nhận Cổ + Phong Tuyền Tinh Thạch + 26 Nguyên Thạch"
        },
        {
            id: "recipe_ngoc_bi_r2",
            resultGuId: "ngoc_bi_gu",
            resultRank: 2,
            resultName: "Bạch Ngọc Cổ Nhị Chuyển",
            requiredGuIds: ["thiet_bi_gu", "hung_luc_gu"],
            requiredItemId: "bronze_ore",
            requiredRealmRank: 1,
            essenceCost: 32,
            stoneCost: 34,
            baseChance: 0.70,
            unlockedByDefault: true,
            ingredientsDesc: "Đồng Bì Cổ + Hắc Thỉ Cổ + Thanh Đồng Khoáng + 34 Nguyên Thạch"
        },
        {
            id: "recipe_thuy_trao_r2",
            resultGuId: "thuy_trao_gu",
            resultRank: 2,
            resultName: "Thủy Tráo Cổ Nhị Chuyển",
            requiredGuIds: ["thiet_bi_gu"],
            requiredItemId: "spirit_herb",
            requiredRealmRank: 1,
            essenceCost: 28,
            stoneCost: 25,
            baseChance: 0.74,
            unlockedByDefault: true,
            ingredientsDesc: "Đồng Bì Cổ + Thanh Linh Thảo + 25 Nguyên Thạch"
        },
        {
            id: "recipe_cot_thuong_r2",
            resultGuId: "cot_thuong_gu",
            resultRank: 2,
            resultName: "Lao Toàn Cốt Thương Cổ Nhị Chuyển",
            requiredGuIds: ["hung_luc_gu"],
            requiredItemId: "jade_bone",
            requiredRealmRank: 2,
            essenceCost: 34,
            stoneCost: 42,
            baseChance: 0.68,
            unlockedByDefault: true,
            ingredientsDesc: "Hắc Thỉ Cổ + Bạch Ngọc Cốt Tủy + 42 Nguyên Thạch"
        },
        {
            id: "recipe_kiem_anh_r2",
            resultGuId: "kiem_anh_gu",
            resultRank: 2,
            resultName: "Kiếm Ảnh Cổ Nhị Chuyển",
            requiredGuIds: ["kim_cham_gu", "am_tieu_gu"],
            requiredItemId: "red_iron_ore",
            requiredRealmRank: 1,
            essenceCost: 32,
            stoneCost: 38,
            baseChance: 0.70,
            unlockedByDefault: true,
            ingredientsDesc: "Kim Châm Cổ + Ám Tiêu Cổ + Xích Thiết Tinh Khoáng + 38 Nguyên Thạch"
        },
        {
            id: "recipe_xoay_nuoc_r2",
            resultGuId: "xoay_nuoc_gu",
            resultRank: 2,
            resultName: "Xoáy Nước Cổ Nhị Chuyển",
            requiredGuIds: ["thuy_tien_gu", "phong_nhan_gu"],
            requiredItemId: "spirit_herb",
            requiredRealmRank: 1,
            essenceCost: 30,
            stoneCost: 32,
            baseChance: 0.72,
            unlockedByDefault: true,
            ingredientsDesc: "Thủy Tiễn Cổ + Phong Nhận Cổ + Thanh Linh Thảo + 32 Nguyên Thạch"
        },
        {
            id: "recipe_toan_luc_r3",
            resultGuId: "toan_cuc_luc_gu",
            resultRank: 3,
            resultName: "Toàn Lực Dĩ Phó Cổ Tam Chuyển",
            requiredGuIds: ["hung_luc_gu", "bach_thi_gu"],
            requiredItemId: "beast_blood_core",
            requiredRealmRank: 2,
            essenceCost: 42,
            stoneCost: 95,
            baseChance: 0.60,
            unlockedByDefault: false,
            ingredientsDesc: "Hắc Thỉ Cổ + Bạch Thỉ Cổ + Bách Thú Tinh Huyết + 95 Nguyên Thạch"
        },
        {
            id: "recipe_thien_phong_kiem_r3",
            resultGuId: "thien_phong_kiem_gu",
            resultRank: 3,
            resultName: "Thiên Phong Kiếm Vũ Cổ Tam Chuyển",
            requiredGuIds: ["phong_nhan_gu"],
            requiredItemId: "red_iron_ore",
            requiredRealmRank: 2,
            essenceCost: 42,
            stoneCost: 90,
            baseChance: 0.60,
            unlockedByDefault: false,
            ingredientsDesc: "Phong Nhận Cổ + Xích Thiết Tinh Khoáng + 90 Nguyên Thạch"
        },
        {
            id: "recipe_loi_duc_r3",
            resultGuId: "loi_duc_gu",
            resultRank: 3,
            resultName: "Lôi Dực Cổ Tam Chuyển",
            requiredGuIds: ["thanh_phong_gu", "dien_nhan_gu"],
            requiredItemId: "red_iron_ore",
            requiredRealmRank: 2,
            essenceCost: 44,
            stoneCost: 95,
            baseChance: 0.58,
            unlockedByDefault: false,
            ingredientsDesc: "Thanh Phong Luân Cổ + Điện Nhãn Cổ + Xích Thiết Tinh Khoáng + 95 Nguyên Thạch"
        },
        {
            id: "recipe_bao_lien_r3",
            resultGuId: "sinh_co_moc_gu",
            resultRank: 3,
            resultName: "Thiên Nguyên Bảo Liên Tam Chuyển",
            requiredGuIds: ["hoi_xuong_gu", "tuu_trung_gu"],
            requiredItemId: "hundred_year_ginseng",
            requiredRealmRank: 2,
            essenceCost: 45,
            stoneCost: 115,
            baseChance: 0.56,
            unlockedByDefault: false,
            ingredientsDesc: "Xuân Quang Cổ + Tửu Trùng + Bách Niên Khổ Sâm + 115 Nguyên Thạch"
        },
        {
            id: "recipe_huyet_lo_r3",
            resultGuId: "huyet_lo_gu",
            resultRank: 3,
            resultName: "Huyết Lô Cổ Tam Chuyển",
            requiredGuIds: ["huyet_nguyet_gu"],
            requiredItemId: "beast_blood_core",
            requiredRealmRank: 2,
            essenceCost: 42,
            stoneCost: 95,
            baseChance: 0.58,
            unlockedByDefault: false,
            ingredientsDesc: "Huyết Nguyệt Cổ + Bách Thú Tinh Huyết + 95 Nguyên Thạch"
        },
        {
            id: "recipe_tinh_quang_r3",
            resultGuId: "tinh_quang_gu",
            resultRank: 3,
            resultName: "Tinh Quang Cổ Tam Chuyển",
            requiredGuIds: ["nguyet_quang_gu"],
            requiredItemId: "moon_orchid",
            requiredRealmRank: 2,
            essenceCost: 40,
            stoneCost: 88,
            baseChance: 0.60,
            unlockedByDefault: false,
            ingredientsDesc: "Nguyệt Quang Cổ + Nguyệt Lan Hoa + 88 Nguyên Thạch"
        },
        {
            id: "recipe_ban_son_luc_r4",
            resultGuId: "ban_son_luc_gu",
            resultRank: 4,
            resultName: "Bàn Sơn Lực Cổ Tứ Chuyển",
            requiredGuIds: ["thach_bi_gu", "hac_thach_gu"],
            requiredItemId: "red_iron_ore",
            requiredRealmRank: 3,
            essenceCost: 50,
            stoneCost: 220,
            baseChance: 0.52,
            unlockedByDefault: false,
            ingredientsDesc: "Thạch Bì Cổ + Hắc Thạch Cổ + Xích Thiết Tinh Khoáng + 220 Nguyên Thạch"
        },
        {
            id: "recipe_kho_luc_r4",
            resultGuId: "van_kiem_quy_tong_gu",
            resultRank: 4,
            resultName: "Khổ Lực Cổ Tứ Chuyển",
            requiredGuIds: ["toan_cuc_luc_gu"],
            requiredItemId: "soul_crystal",
            requiredRealmRank: 3,
            essenceCost: 52,
            stoneCost: 240,
            baseChance: 0.50,
            unlockedByDefault: false,
            ingredientsDesc: "Toàn Lực Dĩ Phó Cổ + Đãng Hồn Thạch Đan + 240 Nguyên Thạch"
        },
        {
            id: "recipe_hoa_long_r4",
            resultGuId: "hoa_long_gu",
            resultRank: 4,
            resultName: "Xích Viêm Hỏa Long Cổ Tứ Chuyển",
            requiredGuIds: ["hoa_cau_gu", "phong_nhan_gu"],
            requiredItemId: "red_iron_ore",
            requiredRealmRank: 3,
            essenceCost: 52,
            stoneCost: 230,
            baseChance: 0.50,
            unlockedByDefault: false,
            ingredientsDesc: "Xích Diễm Cổ + Phong Nhận Cổ + Xích Thiết Tinh Khoáng + 230 Nguyên Thạch"
        },
        {
            id: "recipe_kim_chung_r4",
            resultGuId: "kim_chung_trao_gu",
            resultRank: 4,
            resultName: "Hoàng Kim Chung Cổ Tứ Chuyển",
            requiredGuIds: ["ngoc_bi_gu", "thuy_trao_gu"],
            requiredItemId: "red_iron_ore",
            requiredRealmRank: 3,
            essenceCost: 50,
            stoneCost: 220,
            baseChance: 0.52,
            unlockedByDefault: false,
            ingredientsDesc: "Bạch Ngọc Cổ + Thủy Tráo Cổ + Xích Thiết Tinh Khoáng + 220 Nguyên Thạch"
        },
        {
            id: "recipe_giao_long_r5",
            resultGuId: "thai_co_long_luc_gu",
            resultRank: 5,
            resultName: "Thái Cổ Giao Long Lực Cổ Ngũ Chuyển",
            requiredGuIds: ["van_kiem_quy_tong_gu", "huyet_nguyet_gu"],
            requiredItemId: "soul_crystal",
            requiredRealmRank: 4,
            essenceCost: 62,
            stoneCost: 520,
            baseChance: 0.44,
            unlockedByDefault: false,
            ingredientsDesc: "Khổ Lực Cổ + Huyết Nguyệt Cổ + Đãng Hồn Thạch Đan + 520 Nguyên Thạch"
        },
        {
            id: "recipe_dinh_tien_du_r6",
            resultGuId: "dinh_tien_du_gu",
            resultRank: 6,
            resultName: "Định Tiên Du Lục Chuyển",
            requiredGuIds: ["loi_duc_gu", "thanh_phong_gu"],
            requiredItemId: "immortal_stone",
            requiredRealmRank: 5,
            essenceCost: 75,
            stoneCost: 1200,
            baseChance: 0.35,
            unlockedByDefault: false,
            ingredientsDesc: "Lôi Dực Cổ + Thanh Phong Luân Cổ + 1 Tiên Nguyên Thạch + 1200 Nguyên Thạch"
        },
        {
            id: "recipe_phi_kiem_tien_r6",
            resultGuId: "phi_kiem_tien_gu",
            resultRank: 6,
            resultName: "Phi Kiếm Tiên Cổ Lục Chuyển",
            requiredGuIds: ["thien_phong_kiem_gu", "cot_thuong_gu"],
            requiredItemId: "immortal_stone",
            requiredRealmRank: 6,
            essenceCost: 1,
            stoneCost: 1500,
            baseChance: 0.35,
            unlockedByDefault: false,
            ingredientsDesc: "Thiên Phong Kiếm Vũ Cổ + Lao Toàn Cốt Thương Cổ + 1 Tiên Nguyên Thạch + 1500 Nguyên Thạch"
        },
        {
            id: "recipe_nghich_luu_r7",
            resultGuId: "nghich_luu_ho_than_gu",
            resultRank: 7,
            resultName: "Nghịch Lưu Hộ Thân Ấn Cổ Thất Chuyển",
            requiredGuIds: ["thuy_trao_gu", "ban_son_luc_gu"],
            requiredItemId: "immortal_stone",
            requiredRealmRank: 6,
            essenceCost: 2,
            stoneCost: 2800,
            baseChance: 0.34,
            unlockedByDefault: false,
            ingredientsDesc: "Thủy Tráo Cổ + Bàn Sơn Lực Cổ + 1 Tiên Nguyên Thạch + 2800 Nguyên Thạch"
        },
        {
            id: "recipe_van_nga_r7",
            resultGuId: "van_nga_tien_gu",
            resultRank: 7,
            resultName: "Vạn Ngã Tiên Cổ Thất Chuyển",
            requiredGuIds: ["thai_co_long_luc_gu", "hon_khieu_gu"],
            requiredItemId: "immortal_stone",
            requiredRealmRank: 7,
            essenceCost: 2,
            stoneCost: 3200,
            baseChance: 0.32,
            unlockedByDefault: false,
            ingredientsDesc: "Thái Cổ Giao Long Lực Cổ + Nhiếp Hồn Âm Cổ + 1 Tiên Nguyên Thạch + 3200 Nguyên Thạch"
        },
        {
            id: "recipe_chi_ton_tien_thai_r9",
            resultGuId: "chi_ton_tien_thai_gu",
            resultRank: 9,
            resultName: "Chí Tôn Tiên Thai Cổ Cửu Chuyển",
            requiredGuIds: ["thien_dia_hong_lo_gu", "thien_thi_vuong_gu"],
            requiredItemId: "immortal_stone",
            requiredRealmRank: 8,
            essenceCost: 4,
            stoneCost: 9000,
            baseChance: 0.28,
            unlockedByDefault: false,
            ingredientsDesc: "Thiên Địa Hồng Lô Cổ + Thiên Thi Vương Cổ + 1 Tiên Nguyên Thạch + 9000 Nguyên Thạch"
        }
    ];

    // =========================================================================
    // 4. DANH SÁCH SÁT CHIÊU MẪU (TỰ ĐỘNG TÍNH CHUYỂN SỐ THEO CỔ TRÙNG HIỆN CÓ)
    // =========================================================================

    const PRESET_KILLER_MOVES = [
        {
            id: "km_phong_nguyet_lien_kich",
            name: "Phong Nguyệt Liên Kích",
            icon: "🌙",
            moveRank: 1,
            path: "Quang Đạo",
            type: "hybrid",
            typeLabel: "Sát Chiêu (Quang + Phong)",
            requiredGuIds: ["nguyet_quang_gu", "phong_nhan_gu", "thanh_phong_gu"],
            essenceCost: 18,
            cooldown: 4.5,
            power: 68,
            combatProfile: {
                deliveryType: "crescent_barrage",
                moveRank: 1,
                primaryColor: "#7ef7f0",
                secondaryColor: "#5cc995",
                projectileCount: 3,
                projectileSpeed: 480,
                range: 310,
                aoeRadius: 65,
                modifiers: ["vortex_pull", "swift_step"],
                speedBoost: 1.38,
                boostDuration: 5,
                shieldAmount: 0,
                healAmount: 0,
                lifesteal: 0
            },
            description: "Phóng chùm lưỡi đao trăng gió tầm xa, tạo gió xoáy gom mục tiêu và tăng 38% tốc độ di chuyển (Tự động tăng uy lực khi thăng Chuyển Cổ Trùng)."
        },
        {
            id: "km_song_thi_pha_giap",
            name: "Hắc Bạch Song Thỉ Trấn Kích",
            icon: "🐗",
            moveRank: 1,
            path: "Lực Đạo",
            type: "offensive",
            typeLabel: "Sát Chiêu (Lực + Kim)",
            requiredGuIds: ["hung_luc_gu", "thiet_bi_gu"],
            essenceCost: 17,
            cooldown: 4.8,
            power: 74,
            combatProfile: {
                deliveryType: "beast_stampede",
                moveRank: 1,
                primaryColor: "#e07a45",
                secondaryColor: "#cd7f32",
                phantomIcon: "🐗",
                phantomCount: 1,
                range: 190,
                aoeRadius: 85,
                modifiers: ["beast_phantom", "aegis_shield"],
                speedBoost: 0,
                boostDuration: 8,
                shieldAmount: 42,
                healAmount: 0,
                lifesteal: 0
            },
            description: "Triệu hồi Hư Ảnh Thú Lực lao ra húc Choáng kẻ địch và tạo lớp giáp đồng hộ thể."
        },
        {
            id: "km_an_hon_dang_phach",
            name: "Đãng Hồn Lạc Phách Đại Ấn",
            icon: "🔮",
            moveRank: 7,
            path: "Hồn Đạo",
            type: "offensive",
            typeLabel: "Tiên Đạo Sát Chiêu (Hồn + Phong)",
            requiredGuIds: ["dang_hon_tien_gu", "lac_phach_tien_gu"],
            essenceCost: 3,
            cooldown: 5.8,
            power: 32500,
            isImmortal: true,
            combatProfile: {
                deliveryType: "soul_howl_wave",
                moveRank: 7,
                primaryColor: "#ff85d5",
                secondaryColor: "#85c1e9",
                projectileCount: 6,
                projectileSpeed: 680,
                range: 480,
                aoeRadius: 210,
                modifiers: ["soul_stun", "vortex_pull"],
                speedBoost: 0,
                boostDuration: 8,
                shieldAmount: 0,
                healAmount: 0,
                lifesteal: 0
            },
            description: "Kết hợp hai đại thánh địa Hồn Đạo là Đãng Hồn Sơn và Lạc Phách Cốc, chấn nát hồn phách quần địch."
        }
    ];

    // =========================================================================
    // 5. LỚP QUẢN LÝ HỆ THỐNG CỔ TRÙNG & SÁT CHIÊU (CLASS GUSYSTEM)
    // =========================================================================

    class GuSystem {
        constructor() {
            this.reset();
        }

        reset() {
            this.ownedGuList = [];
            this.nextInstanceCounter = 1;
            this.equippedGuSlots = [null, null, null, null, null, null, null, null];
            this.savedKillerMoves = [];
            this.equippedKillerSlots = [null, null, null, null];
            this.unlockedRecipeIds = REFINEMENT_RECIPES
                .filter(r => r.unlockedByDefault)
                .map(r => r.id);
        }

        // =====================================================================
        // 6. CÁC HÀM TIỆN ÍCH CHUẨN HÓA <TÊN CỔ TRÙNG> <SỐ CHUYỂN> & CHỈ SỐ
        // =====================================================================

        static getRankName(rank) {
            return RANK_NAMES[rank] || `${rank} Chuyển`;
        }

        static getRealmCategoryLabel(category) {
            return REALM_CATEGORY_LABELS[category] || "Phàm Cổ (1–5 Chuyển)";
        }

        static formatGuNameWithRank(guOrTpl, customRank) {
            if (!guOrTpl) return "Chưa rõ";
            const r = customRank !== undefined ? customRank : (guOrTpl.rank || guOrTpl.defaultRank || 1);
            return `${guOrTpl.name} ${GuSystem.getRankName(r)}`;
        }

        static computeStatsForRank(tpl, requestedRank) {
            const minR = tpl.minRank || 1;
            const maxR = tpl.maxRank || 5;
            const clampedRank = Math.max(minR, Math.min(maxR, requestedRank || tpl.defaultRank || minR));
            const mult = RANK_POWER_MULTIPLIERS[clampedRank] || 1.0;

            const basePower = tpl.basePower || tpl.power || 22;
            const calcPower = Math.max(10, Math.round(basePower * mult));
            const calcShield = tpl.baseShield
                ? Math.max(25, Math.round(tpl.baseShield * mult))
                : (tpl.type === "defensive" ? Math.round(calcPower * 1.35) : 0);

            const essenceCost = RANK_ESSENCE_COST_BASE[clampedRank] || 10;
            const tradeValue = Math.max(20, Math.round((tpl.baseTradeValue || 40) * mult * 0.85));

            return {
                rank: clampedRank,
                minRank: minR,
                maxRank: maxR,
                realmCategory: tpl.realmCategory || "mortal_only",
                power: calcPower,
                shieldAmount: calcShield,
                essenceCost: essenceCost,
                range: (tpl.range || 280) + (clampedRank - 1) * 24,
                radius: (tpl.radius || 24) + (clampedRank - 1) * 4,
                tradeValue: tradeValue
            };
        }

        _syncGuInstanceStats(gu) {
            if (!gu) return null;
            let tpl = GU_DATABASE[gu.id];
            if (!tpl && LEGACY_GU_ALIASES[gu.id]) {
                const alias = LEGACY_GU_ALIASES[gu.id];
                gu.id = alias.id;
                if (!gu.rank || gu.rank < alias.rank) gu.rank = alias.rank;
                tpl = GU_DATABASE[gu.id];
            }
            if (!tpl) return gu;

            const stats = GuSystem.computeStatsForRank(tpl, gu.rank);
            gu.name = tpl.name;
            gu.icon = tpl.icon;
            gu.rank = stats.rank;
            gu.minRank = stats.minRank;
            gu.maxRank = stats.maxRank;
            gu.realmCategory = stats.realmCategory;
            gu.path = tpl.path;
            gu.type = tpl.type;
            gu.subType = tpl.subType || null;
            gu.castType = tpl.castType;
            gu.power = stats.power;
            gu.shieldAmount = stats.shieldAmount;
            gu.essenceCost = stats.essenceCost;
            gu.range = stats.range;
            gu.radius = stats.radius;
            gu.tradeValue = stats.tradeValue;
            gu.killerTrait = tpl.killerTrait || gu.killerTrait;
            gu.description = tpl.description;
            return gu;
        }

        initializeStartingGu(vitalGuTemplateId, originType = "righteous_clan") {
            this.reset();

            const resolved = LEGACY_GU_ALIASES[vitalGuTemplateId] || { id: vitalGuTemplateId, rank: 1 };
            const vitalId = GU_DATABASE[resolved.id] ? resolved.id : "nguyet_quang_gu";
            const vitalInstance = this.addGuToStorage(vitalId, {
                rank: resolved.rank || 1,
                isRefined: true,
                refinementProgress: 100,
                isVital: true
            });
            this.equipGuToSlot(vitalInstance.instanceId, 0);

            const starterIds = ["phong_nhan_gu", "thiet_bi_gu", "thanh_phong_gu", "hoi_xuong_gu"];
            if (originType === "demonic_inheritor" || originType === "inheritance") {
                starterIds.push("huyet_nguyet_gu");
            } else {
                starterIds.push("hung_luc_gu");
            }

            let nextSlot = 1;
            for (const gId of starterIds) {
                if (gId === vitalId) continue;
                const inst = this.addGuToStorage(gId, {
                    rank: 1,
                    isRefined: true,
                    refinementProgress: 100,
                    isVital: false
                });
                if (inst && nextSlot < 8) {
                    this.equipGuToSlot(inst.instanceId, nextSlot++);
                }
            }

            if (
                this.hasRefinedGuByTemplate("nguyet_quang_gu") &&
                this.hasRefinedGuByTemplate("phong_nhan_gu") &&
                this.hasRefinedGuByTemplate("thanh_phong_gu")
            ) {
                const preset = JSON.parse(JSON.stringify(PRESET_KILLER_MOVES[0]));
                this.savedKillerMoves.push(preset);
                this.equippedKillerSlots[0] = preset.id;
                this._recalculateSavedKillerMoves();
            }
        }

        addGuToStorage(templateId, options = {}) {
            let resolvedId = templateId;
            let forcedRank = options.rank;

            if (!GU_DATABASE[resolvedId] && LEGACY_GU_ALIASES[resolvedId]) {
                resolvedId = LEGACY_GU_ALIASES[templateId].id;
                if (forcedRank === undefined) {
                    forcedRank = LEGACY_GU_ALIASES[templateId].rank;
                }
            }

            const tpl = GU_DATABASE[resolvedId];
            if (!tpl) return null;

            const instanceId = options.instanceId || `gu_inst_${this.nextInstanceCounter++}`;
            const isRefined = options.isRefined !== undefined ? Boolean(options.isRefined) : true;
            const stats = GuSystem.computeStatsForRank(tpl, forcedRank !== undefined ? forcedRank : tpl.defaultRank);

            const guInstance = {
                instanceId: instanceId,
                id: tpl.id,
                name: tpl.name,
                icon: tpl.icon,
                rank: stats.rank,
                minRank: stats.minRank,
                maxRank: stats.maxRank,
                realmCategory: stats.realmCategory,
                path: tpl.path,
                type: tpl.type,
                subType: tpl.subType || null,
                castType: tpl.castType,
                essenceCost: stats.essenceCost,
                cooldown: tpl.cooldown,
                range: stats.range,
                radius: stats.radius,
                power: stats.power,
                speedBoost: tpl.speedBoost || 0,
                projectileSpeed: tpl.projectileSpeed || 440,
                projectileColor: tpl.projectileColor || "#38c992",
                visualColor: tpl.visualColor || "#e0be77",
                slowEffect: tpl.slowEffect || 0,
                lifesteal: tpl.lifesteal || 0,
                shieldAmount: stats.shieldAmount,
                buffDuration: tpl.buffDuration || 8,
                foodItemId: tpl.foodItemId,
                tradeValue: stats.tradeValue,
                rarity: tpl.rarity,
                killerTrait: tpl.killerTrait || null,
                description: tpl.description,

                isRefined: isRefined,
                refinementProgress: isRefined ? 100 : (options.refinementProgress || 15),
                isVital: Boolean(options.isVital),
                hunger: options.hunger !== undefined ? options.hunger : 100,
                equippedSlot: null
            };

            this.ownedGuList.push(guInstance);
            this._recalculateSavedKillerMoves();
            return guInstance;
        }

        update(dt) {
            const hungerDecay = 0.03 * dt;
            for (const gu of this.ownedGuList) {
                if (gu.hunger > 0) {
                    gu.hunger = Math.max(0, Number((gu.hunger - hungerDecay).toFixed(2)));
                }
            }
        }

        feedGu(instanceId, player) {
            const gu = this.getGuByInstanceId(instanceId);
            if (!gu) return { success: false, message: "Không tìm thấy Cổ Trùng này." };
            if (!player) return { success: false, message: "Thiếu dữ liệu người chơi." };

            const foodMeta = global.PlayerManager.ITEM_DATABASE[gu.foodItemId] || { name: "Nguyên Thạch" };
            if (player.getItemCount(gu.foodItemId) <= 0) {
                return {
                    success: false,
                    message: `Không có [${foodMeta.name}] trong túi đồ để nuôi ${GuSystem.formatGuNameWithRank(gu)}!`
                };
            }

            if (gu.hunger >= 99) {
                return {
                    success: false,
                    message: `${GuSystem.formatGuNameWithRank(gu)} hiện đang no bụng (${Math.round(gu.hunger)}%), chưa cần cho ăn thêm.`
                };
            }

            player.removeItem(gu.foodItemId, 1);
            gu.hunger = 100;

            return {
                success: true,
                message: `Đã cho [${GuSystem.formatGuNameWithRank(gu)}] ăn 1x ${foodMeta.name}. Độ no đạt 100%!`
            };
        }

        attemptCaptureWildGu(player, regionDangerRank = 1) {
            const targetRank = Math.min(5, Math.max(1, regionDangerRank));
            const candidates = Object.values(GU_DATABASE).filter(
                g => g.minRank <= targetRank && g.maxRank >= targetRank
            );
            const chosenTpl = candidates[Math.floor(Math.random() * candidates.length)] || GU_DATABASE.nguyet_quang_gu;

            const wildInstance = this.addGuToStorage(chosenTpl.id, {
                rank: targetRank,
                isRefined: false,
                refinementProgress: 15,
                isVital: false,
                hunger: 85
            });

            return {
                success: true,
                guInstance: wildInstance,
                message: `Đã trấn áp và thu giữ một con [${GuSystem.formatGuNameWithRank(wildInstance)} - Hoang Dã]! Hãy về [Kho Cổ] để Luyện Hóa.`
            };
        }

        refineWildGuStep(instanceId, player, aperture) {
            const gu = this.getGuByInstanceId(instanceId);
            if (!gu) return { success: false, message: "Cổ trùng không tồn tại." };
            if (gu.isRefined) {
                return { success: false, message: `${GuSystem.formatGuNameWithRank(gu)} đã thuộc quyền điều khiển của ngươi.` };
            }
            if (!aperture || !aperture.isAwakened) {
                return { success: false, message: "Chưa Khai Khiếu, không có Chân Nguyên!" };
            }

            const essenceReq = 12 * Math.min(5, gu.rank);
            const mentalReq = 14 * Math.min(6, gu.rank);

            if (!aperture.hasEnoughEssence(essenceReq, gu.rank)) {
                return {
                    success: false,
                    message: `Chân nguyên không đủ để trấn áp ý chí hoang dã của [${GuSystem.formatGuNameWithRank(gu)}]!`
                };
            }
            if (player.mental < mentalReq) {
                return {
                    success: false,
                    message: `Tinh thần lực quá mệt mỏi (${Math.floor(player.mental)}/${mentalReq})! Hãy dùng Thanh Linh Thảo.`
                };
            }

            aperture.consumeEssence(essenceReq, gu.rank);
            player.mental = Math.max(0, player.mental - mentalReq);

            const luyenMarks = (player.daoMarks && player.daoMarks["Luyện Đạo"]) || 0;
            let resistChance = 0.24 + (gu.rank - aperture.rank) * 0.20 - (luyenMarks * 0.002) - (player.refinementBonus || 0);
            resistChance = Math.max(0.05, Math.min(0.75, resistChance));

            if (Math.random() < resistChance) {
                gu.refinementProgress = Math.max(10, gu.refinementProgress - 5);
                return {
                    success: false,
                    message: `[${GuSystem.formatGuNameWithRank(gu)}] chống trả quyết liệt! Tiến độ luyện hóa hiện tại: ${gu.refinementProgress}%.`
                };
            }

            const progressGain = Math.round(38 + (aperture.rank - gu.rank) * 14 + luyenMarks * 0.5);
            gu.refinementProgress = Math.min(100, gu.refinementProgress + Math.max(25, progressGain));

            if (gu.refinementProgress >= 100) {
                gu.isRefined = true;
                gu.refinementProgress = 100;
                player.addDaoMarks("Luyện Đạo", 2 * gu.rank);
                aperture.humanQi += 2;

                const emptySlot = this.equippedGuSlots.findIndex(s => s === null);
                if (emptySlot !== -1) {
                    this.equipGuToSlot(gu.instanceId, emptySlot);
                }

                this._recalculateSavedKillerMoves();
                return {
                    success: true,
                    message: `Luyện hóa hoàn tất! [${GuSystem.formatGuNameWithRank(gu)}] đã hoàn toàn khuất phục ý chí của ngươi (+${2 * gu.rank} Đạo Ngân Luyện Đạo).`
                };
            }

            return {
                success: true,
                message: `Chân nguyên thẩm thấu vào [${GuSystem.formatGuNameWithRank(gu)}], tiến độ luyện hóa đạt ${gu.refinementProgress}%!`
            };
        }

        // =====================================================================
        // 7. THĂNG CHUYỂN TRỰC TIẾP CHO CỔ TRÙNG (LEVEL UP: RANK -> RANK + 1)
        // =====================================================================

        getGuUpgradeRequirements(instanceId, player) {
            const gu = this.getGuByInstanceId(instanceId);
            if (!gu) return { canUpgrade: false, reason: "Không tìm thấy Cổ Trùng." };
            if (!gu.isRefined) return { canUpgrade: false, reason: "Phải Luyện Hóa Cổ Hoang Dã trước khi thăng Chuyển!" };

            this._syncGuInstanceStats(gu);

            if (gu.rank >= gu.maxRank) {
                return {
                    canUpgrade: false,
                    atMaxRank: true,
                    reason: gu.realmCategory === "mortal_only"
                        ? `[${gu.name}] là Phàm Cổ, đã đạt giới hạn tối đa ở ${GuSystem.getRankName(gu.maxRank)}!`
                        : `[${gu.name}] đã đạt đỉnh phong ${GuSystem.getRankName(gu.maxRank)}!`
                };
            }

            const nextRank = gu.rank + 1;
            const isImmortalStep = nextRank >= 6;

            const stoneCostByNextRank = {
                2: 28,
                3: 85,
                4: 240,
                5: 560,
                6: 1200,
                7: 2800,
                8: 6500,
                9: 15000
            };
            const immortalStoneCostByNextRank = {
                6: 1,
                7: 3,
                8: 8,
                9: 20
            };

            const baseChanceByNextRank = {
                2: 0.78,
                3: 0.65,
                4: 0.54,
                5: 0.45,
                6: 0.38,
                7: 0.34,
                8: 0.30,
                9: 0.25
            };

            const luyenMarks = (player && player.daoMarks && player.daoMarks["Luyện Đạo"]) || 0;
            const triMarks = (player && player.daoMarks && player.daoMarks["Trí Đạo"]) || 0;
            const vanMarks = (player && player.daoMarks && player.daoMarks["Vận Đạo"]) || 0;
            const bonusChance = (luyenMarks * 0.0018) + (triMarks * 0.001) + (vanMarks * 0.0012) + (player ? player.refinementBonus : 0);
            const finalChance = Math.min(0.95, Number(((baseChanceByNextRank[nextRank] || 0.4) + bonusChance).toFixed(2)));

            return {
                canUpgrade: true,
                currentRank: gu.rank,
                nextRank: nextRank,
                nextRankName: GuSystem.getRankName(nextRank),
                reqCultivationRank: Math.max(1, nextRank - 1),
                stoneCost: stoneCostByNextRank[nextRank] || 500,
                immortalStoneCost: isImmortalStep ? (immortalStoneCostByNextRank[nextRank] || 1) : 0,
                foodItemId: gu.foodItemId,
                foodCount: 1,
                successChance: finalChance
            };
        }

        upgradeGuRank(instanceId, player, aperture) {
            const gu = this.getGuByInstanceId(instanceId);
            if (!gu) return { success: false, message: "Không tìm thấy Cổ Trùng." };

            const req = this.getGuUpgradeRequirements(instanceId, player);
            if (!req.canUpgrade) {
                return { success: false, message: req.reason };
            }

            if (aperture && aperture.rank < req.reqCultivationRank) {
                return {
                    success: false,
                    message: `Tu vi chưa đủ! Cần đạt tối thiểu ${GuSystem.getRankName(req.reqCultivationRank)} để thăng [${gu.name}] lên ${req.nextRankName}.`
                };
            }

            if (player.primevalStones < req.stoneCost) {
                return {
                    success: false,
                    message: `Không đủ Nguyên Thạch! Cần 💎 ${req.stoneCost} Nguyên Thạch để hợp luyện thăng lên ${req.nextRankName}.`
                };
            }

            if (req.immortalStoneCost > 0 && player.immortalStones < req.immortalStoneCost) {
                return {
                    success: false,
                    message: `Thăng cấp Tiên Cổ lên ${req.nextRankName} cần 🌟 ${req.immortalStoneCost} Tiên Nguyên Thạch!`
                };
            }

            const foodMeta = global.PlayerManager.ITEM_DATABASE[req.foodItemId] || { name: "Cổ Tài" };
            if (player.getItemCount(req.foodItemId) < req.foodCount) {
                return {
                    success: false,
                    message: `Thiếu phụ liệu bản mệnh: Cần ${req.foodCount}x [${foodMeta.name}] để thăng Chuyển cho ${gu.name}!`
                };
            }

            player.primevalStones -= req.stoneCost;
            if (req.immortalStoneCost > 0) {
                player.removeItem("immortal_stone", req.immortalStoneCost);
            }
            player.removeItem(req.foodItemId, req.foodCount);

            if (Math.random() <= req.successChance) {
                const oldRankName = GuSystem.getRankName(gu.rank);
                gu.rank = req.nextRank;
                gu.hunger = 100;
                this._syncGuInstanceStats(gu);

                if (gu.isVital && aperture) {
                    aperture.vitalGuName = `${gu.name} (${GuSystem.getRankName(gu.rank)} - ${gu.path})`;
                }

                player.addDaoMarks("Luyện Đạo", 4 * gu.rank);
                if (aperture) aperture.humanQi += 3 * gu.rank;

                this._recalculateSavedKillerMoves();

                return {
                    success: true,
                    gu: gu,
                    message: `🔥 Thăng Chuyển đại thành! 【${gu.name}】 đã tấn thăng từ ${oldRankName} lên 【${GuSystem.getRankName(gu.rank)}】 (Uy lực gốc đạt: ${gu.power})!`
                };
            } else {
                gu.hunger = Math.max(15, gu.hunger - 30);
                player.addDaoMarks("Luyện Đạo", 2);
                return {
                    success: false,
                    message: `Thăng Chuyển [${gu.name}] lên ${req.nextRankName} thất bại! Cổ trùng bị chấn thương nhẹ (Độ no giảm còn ${Math.round(gu.hunger)}%), may mắn bảo toàn tính mạng (+2 Đạo Ngân Luyện Đạo).`
                };
            }
        }

        setVitalGu(instanceId, aperture) {
            const gu = this.getGuByInstanceId(instanceId);
            if (!gu || !gu.isRefined) {
                return { success: false, message: "Chỉ cổ trùng đã luyện hóa hoàn toàn mới có thể liên kết Bản Mệnh." };
            }

            const currentVital = this.ownedGuList.find(g => g.isVital);
            if (currentVital && currentVital.instanceId !== gu.instanceId) {
                if (gu.path !== currentVital.path && gu.rank < currentVital.rank) {
                    return {
                        success: false,
                        message: `Đổi Cổ Bản Mệnh khác lưu phái đòi hỏi Cổ Trùng mới phải có Chuyển số không thấp hơn Cổ Bản Mệnh hiện tại (${GuSystem.getRankName(currentVital.rank)})!`
                    };
                }
                currentVital.isVital = false;
            }

            gu.isVital = true;
            if (aperture) {
                aperture.vitalGuId = gu.id;
                aperture.vitalGuName = `${gu.name} (${GuSystem.getRankName(gu.rank)} - ${gu.path})`;
            }

            return {
                success: true,
                message: `[${GuSystem.formatGuNameWithRank(gu)}] đã trở thành Cổ Bản Mệnh trấn giữ Không Khiếu của ngươi!`
            };
        }

        // =====================================================================
        // 8. GIẢI MÃ TÀN PHƯƠNG & HỢP LUYỆN CỔ TRÙNG TẠI LUYỆN ĐẠO CÁC
        // =====================================================================

        getKnownRecipes() {
            return REFINEMENT_RECIPES.filter(r => this.unlockedRecipeIds.includes(r.id));
        }

        studyRemnantRecipe(player) {
            if (!player || player.getItemCount("remnant_recipe") <= 0) {
                return {
                    success: false,
                    message: "Không có [📜 Cổ Phương Tàn Quyển] trong túi đồ! Hãy vượt các Bản Đồ Lịch Luyện hoặc mua tại Thương Hội."
                };
            }

            const lockedRecipes = REFINEMENT_RECIPES.filter(r => !this.unlockedRecipeIds.includes(r.id));
            if (lockedRecipes.length === 0) {
                return {
                    success: false,
                    message: "Ngươi đã lĩnh ngộ toàn bộ Bí Phương Hợp Luyện hiện có trong thiên hạ!"
                };
            }

            player.removeItem("remnant_recipe", 1);
            const unlocked = lockedRecipes[0];
            this.unlockedRecipeIds.push(unlocked.id);
            player.addDaoMarks("Trí Đạo", 4);
            player.addDaoMarks("Luyện Đạo", 3);

            return {
                success: true,
                recipe: unlocked,
                message: `📜 Giải mã Tàn Quyển thành công! Lĩnh ngộ cổ phương 【${unlocked.resultName}】 (+4 Đạo Ngân Trí Đạo, +3 Đạo Ngân Luyện Đạo)!`
            };
        }

        autoFillRecipeSlots(recipeId, player) {
            const recipe = REFINEMENT_RECIPES.find(r => r.id === recipeId);
            if (!recipe) return { success: false, message: "Không tìm thấy bí phương." };

            const slots = [null, null, null];
            const usedInstances = new Set();

            for (let i = 0; i < recipe.requiredGuIds.length; i++) {
                const reqGuId = recipe.requiredGuIds[i];
                const matchGu = this.ownedGuList.find(
                    g => g.id === reqGuId && g.isRefined && !usedInstances.has(g.instanceId)
                );
                if (!matchGu) {
                    const tpl = GU_DATABASE[reqGuId];
                    return {
                        success: false,
                        message: `Thiếu Cổ Trùng đầu vào: [${tpl ? tpl.name : reqGuId}] đã luyện hóa!`
                    };
                }
                usedInstances.add(matchGu.instanceId);
                slots[i] = matchGu.instanceId;
            }

            if (recipe.requiredItemId) {
                if (!player || player.getItemCount(recipe.requiredItemId) <= 0) {
                    const itemMeta = global.PlayerManager.ITEM_DATABASE[recipe.requiredItemId];
                    return {
                        success: false,
                        message: `Thiếu cổ tài phụ trợ: [${itemMeta ? itemMeta.name : recipe.requiredItemId}] trong túi đồ!`
                    };
                }
                slots[2] = recipe.requiredItemId;
            }

            return {
                success: true,
                slots: slots,
                message: `Đã đặt đủ nguyên liệu theo cổ phương [${recipe.resultName}] vào Đỉnh Lò.`
            };
        }

        previewRefinement(slots, player, aperture) {
            const cleanSlots = (slots || []).filter(Boolean);
            if (cleanSlots.length < 2) {
                return { valid: false, reason: "Hãy chọn một Cổ Phương bên phải hoặc đặt đủ Cổ Trùng & Cổ Tài." };
            }

            const inputGuInstances = [];
            const inputItemIds = [];

            for (const entry of cleanSlots) {
                const gu = this.getGuByInstanceId(entry);
                if (gu) {
                    if (!gu.isRefined) {
                        return { valid: false, reason: `[${GuSystem.formatGuNameWithRank(gu)}] vẫn là Cổ Hoang Dã, phải Luyện Hóa trước!` };
                    }
                    inputGuInstances.push(gu);
                } else if (global.PlayerManager && global.PlayerManager.ITEM_DATABASE[entry]) {
                    inputItemIds.push(entry);
                }
            }

            if (inputGuInstances.length === 1 && inputItemIds.length === 1) {
                const singleGu = inputGuInstances[0];
                if (inputItemIds[0] === singleGu.foodItemId && singleGu.rank < singleGu.maxRank) {
                    const upReq = this.getGuUpgradeRequirements(singleGu.instanceId, player);
                    if (upReq.canUpgrade) {
                        return {
                            valid: true,
                            isDirectRankUpgrade: true,
                            targetGuInstance: singleGu,
                            upgradeReq: upReq,
                            inputGuInstances: [singleGu],
                            resultName: `${singleGu.name} ${upReq.nextRankName}`,
                            resultRank: upReq.nextRank,
                            successChance: upReq.successChance,
                            essenceCost: RANK_ESSENCE_COST_BASE[singleGu.rank] || 20,
                            stoneCost: upReq.stoneCost
                        };
                    }
                }
            }

            const inputGuTemplateIds = inputGuInstances.map(g => g.id).sort();

            for (const recipe of REFINEMENT_RECIPES) {
                const reqGuSorted = [...recipe.requiredGuIds].sort();
                const guMatch =
                    reqGuSorted.length === inputGuTemplateIds.length &&
                    reqGuSorted.every((val, idx) => val === inputGuTemplateIds[idx]);

                const itemMatch = !recipe.requiredItemId || inputItemIds.includes(recipe.requiredItemId);

                if (guMatch && itemMatch) {
                    const luyenMarks = (player && player.daoMarks["Luyện Đạo"]) || 0;
                    const triMarks = (player && player.daoMarks["Trí Đạo"]) || 0;
                    const vanMarks = (player && player.daoMarks["Vận Đạo"]) || 0;
                    const bonusChance = (luyenMarks * 0.002) + (triMarks * 0.001) + (vanMarks * 0.0012) + (player ? player.refinementBonus : 0);
                    const finalChance = Math.min(0.95, Number((recipe.baseChance + bonusChance).toFixed(2)));

                    return {
                        valid: true,
                        isDirectRankUpgrade: false,
                        recipe: recipe,
                        inputGuInstances: inputGuInstances,
                        resultName: recipe.resultName,
                        resultRank: recipe.resultRank,
                        successChance: finalChance,
                        essenceCost: recipe.essenceCost,
                        stoneCost: recipe.stoneCost
                    };
                }
            }

            return {
                valid: false,
                reason: "Tổ hợp không khớp với Cổ Phương nào (Hoặc Cổ Trùng đã đạt giới hạn Chuyển tối đa)!"
            };
        }

        executeRefinement(slots, player, aperture) {
            const preview = this.previewRefinement(slots, player, aperture);
            if (!preview.valid) {
                return { success: false, message: preview.reason };
            }

            if (preview.isDirectRankUpgrade && preview.targetGuInstance) {
                return this.upgradeGuRank(preview.targetGuInstance.instanceId, player, aperture);
            }

            const recipe = preview.recipe;

            if (aperture.rank < recipe.requiredRealmRank) {
                return {
                    success: false,
                    message: `Tu vi chưa đủ! Cần đạt tối thiểu ${GuSystem.getRankName(recipe.requiredRealmRank)} để hợp luyện ${recipe.resultName}.`
                };
            }

            if (player.primevalStones < recipe.stoneCost) {
                return {
                    success: false,
                    message: `Không đủ Nguyên Thạch để duy trì hỏa hầu (Cần ${recipe.stoneCost} Nguyên Thạch)!`
                };
            }
            if (recipe.requiredItemId && player.getItemCount(recipe.requiredItemId) <= 0) {
                return { success: false, message: "Thiếu cổ tài phụ trợ trong túi đồ!" };
            }

            if (!aperture.hasEnoughEssence(recipe.essenceCost, recipe.requiredRealmRank)) {
                return {
                    success: false,
                    message: `Không đủ Chân Nguyên để khởi lò Hợp Luyện!`
                };
            }

            aperture.consumeEssence(recipe.essenceCost, recipe.requiredRealmRank);
            player.primevalStones -= recipe.stoneCost;
            if (recipe.requiredItemId) {
                player.removeItem(recipe.requiredItemId, 1);
            }

            const hasVitalInput = preview.inputGuInstances.some(g => g.isVital);

            if (Math.random() <= preview.successChance) {
                let inheritedSlot = null;
                for (const oldGu of preview.inputGuInstances) {
                    if (oldGu.equippedSlot !== null && inheritedSlot === null) {
                        inheritedSlot = oldGu.equippedSlot;
                    }
                    this.removeGuByInstanceId(oldGu.instanceId);
                }

                const newGu = this.addGuToStorage(recipe.resultGuId, {
                    rank: recipe.resultRank,
                    isRefined: true,
                    refinementProgress: 100,
                    isVital: hasVitalInput,
                    hunger: 100
                });

                if (!this.unlockedRecipeIds.includes(recipe.id)) {
                    this.unlockedRecipeIds.push(recipe.id);
                }

                if (hasVitalInput && aperture && newGu) {
                    aperture.vitalGuId = newGu.id;
                    aperture.vitalGuName = `${newGu.name} (${GuSystem.getRankName(newGu.rank)} - ${newGu.path})`;
                }

                if (inheritedSlot !== null && newGu) {
                    this.equipGuToSlot(newGu.instanceId, inheritedSlot);
                }

                player.addDaoMarks("Luyện Đạo", 4 * recipe.resultRank);
                aperture.humanQi += 3 * recipe.resultRank;
                this._recalculateSavedKillerMoves();

                return {
                    success: true,
                    newGu: newGu,
                    message: `🔥 Hợp luyện đại thành! Luyện ra 【${GuSystem.formatGuNameWithRank(newGu)}】 (Uy lực gốc: ${newGu.power}, +${4 * recipe.resultRank} Đạo Ngân Luyện Đạo)!`
                };
            } else {
                let lostGuNames = [];
                for (const oldGu of preview.inputGuInstances) {
                    if (oldGu.isVital) {
                        oldGu.hunger = 20;
                    } else if (Math.random() < 0.45) {
                        lostGuNames.push(GuSystem.formatGuNameWithRank(oldGu));
                        this.removeGuByInstanceId(oldGu.instanceId);
                    }
                }

                player.addDaoMarks("Luyện Đạo", 1);
                this._recalculateSavedKillerMoves();
                const penaltyMsg = lostGuNames.length > 0
                    ? `Cổ trùng [${lostGuNames.join(", ")}] đã tổn hao trong lúc phản phệ!`
                    : `May mắn giữ lại được Cổ Trùng nhưng cổ tài và Nguyên Thạch đã tiêu hao hết.`;

                return {
                    success: false,
                    message: `Hợp luyện [${recipe.resultName}] thất bại! ${penaltyMsg}`
                };
            }
        }

        // =====================================================================
        // 9. HỆ THỐNG SÁT CHIÊU ĐỘNG DỰA TRÊN CHUYỂN SỐ THỰC TẾ CỦA CỔ TRÙNG
        // =====================================================================

        _getHighestOwnedGuOrTemplate(templateId) {
            let resolvedId = templateId;
            if (!GU_DATABASE[resolvedId] && LEGACY_GU_ALIASES[resolvedId]) {
                resolvedId = LEGACY_GU_ALIASES[resolvedId].id;
            }

            const ownedMatches = this.ownedGuList
                .filter(g => g.id === resolvedId && g.isRefined)
                .sort((a, b) => b.rank - a.rank);

            if (ownedMatches.length > 0) {
                this._syncGuInstanceStats(ownedMatches[0]);
                return ownedMatches[0];
            }

            const tpl = GU_DATABASE[resolvedId];
            if (!tpl) return null;
            const stats = GuSystem.computeStatsForRank(tpl, tpl.defaultRank || tpl.minRank || 1);
            return {
                ...tpl,
                rank: stats.rank,
                power: stats.power,
                shieldAmount: stats.shieldAmount,
                essenceCost: stats.essenceCost,
                range: stats.range,
                radius: stats.radius
            };
        }

        _buildDynamicKillerMoveProfile(coreGu, subGus) {
            const coreTrait = coreGu.killerTrait || {
                deliveryType: "crescent_barrage",
                modifierTag: "moon_slash",
                modifierDesc: "Tăng cường uy lực công kích"
            };

            const moveRank = coreGu.rank;
            const modifiers = [coreTrait.modifierTag];
            const traitDescriptions = [`[Cốt lõi - ${GuSystem.formatGuNameWithRank(coreGu)}]: ${coreTrait.modifierDesc}`];

            let rawPowerSum = coreGu.power * 1.30;
            let rawEssenceSum = coreGu.essenceCost;
            let shieldAmount = coreGu.shieldAmount ? Math.round(coreGu.shieldAmount * 1.15) : 0;
            let healAmount = coreGu.castType === "heal" ? Math.round(coreGu.power * 1.15) : 0;
            let speedBoost = coreGu.speedBoost || 0;
            let lifesteal = coreGu.lifesteal || 0;
            let essenceDiscount = 1.0;

            for (const sub of subGus) {
                const subTrait = sub.killerTrait || { modifierTag: "power_boost", modifierDesc: "Gia tăng uy năng" };
                if (!modifiers.includes(subTrait.modifierTag)) {
                    modifiers.push(subTrait.modifierTag);
                }

                let rankFitFactor = 0.78;
                if (sub.rank > coreGu.rank) {
                    rankFitFactor = Math.max(0.25, 0.60 / Math.pow(1.5, sub.rank - coreGu.rank));
                } else if (sub.rank === coreGu.rank) {
                    rankFitFactor = 0.85;
                } else {
                    rankFitFactor = 0.68;
                }

                const contributedPower = Math.round(sub.power * rankFitFactor);
                rawPowerSum += contributedPower;
                rawEssenceSum += sub.essenceCost * 0.65;

                if (sub.shieldAmount) {
                    shieldAmount += Math.round(sub.shieldAmount * rankFitFactor);
                }
                if (sub.castType === "heal") {
                    healAmount += Math.round(sub.power * rankFitFactor);
                }
                if (sub.speedBoost) {
                    speedBoost = Math.max(speedBoost, Number((sub.speedBoost * 0.95).toFixed(2)));
                }
                if (sub.lifesteal) {
                    lifesteal = Math.min(0.45, lifesteal + sub.lifesteal * 0.8);
                }
                if (subTrait.modifierTag === "essence_saver") {
                    essenceDiscount *= 0.72;
                }

                traitDescriptions.push(
                    `[Phụ trợ - ${GuSystem.formatGuNameWithRank(sub)}]: ${subTrait.modifierDesc} (+${contributedPower} Uy lực)`
                );
            }

            const minComponentRank = Math.min(coreGu.rank, ...subGus.map(s => s.rank));
            const rankSynergyBonus = 1 + (minComponentRank - 1) * 0.14;

            const finalPower = Math.max(20, Math.round(rawPowerSum * rankSynergyBonus));
            const finalEssenceCost = Math.max(1, Math.round(rawEssenceSum * essenceDiscount));

            const baseProjCount = Math.min(10, 1 + moveRank + (modifiers.includes("moon_slash") ? 2 : 0));
            const baseAoeRadius = Math.round((coreGu.radius || 65) + moveRank * 16 + subGus.length * 12);
            const phantomIconsByRank = { 1: "🐗", 2: "🐻", 3: "🐯", 4: "🦣", 5: "🐉", 6: "🐉", 7: "👥", 8: "🐉", 9: "🐉" };

            return {
                moveRank: moveRank,
                finalPower: finalPower,
                finalEssenceCost: finalEssenceCost,
                cooldown: Number((4.0 + Math.min(5, moveRank) * 0.4 + subGus.length * 0.3).toFixed(1)),
                traitSummaryText: traitDescriptions.join(" | "),
                combatProfile: {
                    deliveryType: coreTrait.deliveryType,
                    moveRank: moveRank,
                    primaryColor: coreGu.projectileColor || coreGu.visualColor || "#7ef7f0",
                    secondaryColor: (subGus[0] && (subGus[0].projectileColor || subGus[0].visualColor)) || "#e2bf75",
                    projectileCount: baseProjCount,
                    projectileSpeed: (coreGu.projectileSpeed || 450) + (modifiers.includes("swift_step") ? 90 : 0),
                    range: (coreGu.range || 310) + moveRank * 24,
                    aoeRadius: baseAoeRadius,
                    phantomIcon: phantomIconsByRank[moveRank] || "🐯",
                    phantomCount: Math.min(5, Math.max(1, Math.floor((moveRank + 1) / 2))),
                    modifiers: modifiers,
                    speedBoost: speedBoost,
                    boostDuration: 5 + Math.min(6, moveRank),
                    shieldAmount: shieldAmount,
                    healAmount: healAmount,
                    lifesteal: Number(lifesteal.toFixed(2))
                }
            };
        }

        _recalculateSavedKillerMoves() {
            for (const move of this.savedKillerMoves) {
                if (!Array.isArray(move.requiredGuIds) || move.requiredGuIds.length === 0) continue;
                const coreGu = this._getHighestOwnedGuOrTemplate(move.requiredGuIds[0]);
                const subGus = move.requiredGuIds.slice(1).map(id => this._getHighestOwnedGuOrTemplate(id)).filter(Boolean);
                if (!coreGu || subGus.length === 0) continue;

                const built = this._buildDynamicKillerMoveProfile(coreGu, subGus);
                move.moveRank = built.moveRank;
                move.isImmortal = built.moveRank >= 6;
                move.power = built.finalPower;
                move.essenceCost = built.finalEssenceCost;
                move.cooldown = built.cooldown;
                move.combatProfile = built.combatProfile;
                move.typeLabel = `${built.moveRank >= 6 ? "Tiên Đạo" : "Phàm Đạo"} Sát Chiêu (${GuSystem.getRankName(built.moveRank)} - ${coreGu.path})`;
            }
        }

        previewKillerMoveDeduction(coreId, sub1Id, sub2Id, player) {
            const chosenIds = [coreId, sub1Id, sub2Id].filter(Boolean);
            const uniqueIds = [...new Set(chosenIds)];

            if (!coreId || uniqueIds.length < 2) {
                return {
                    valid: false,
                    name: "---",
                    typeLabel: "---",
                    essenceCost: 0,
                    description: "Cần chọn ít nhất 1 Cổ Cốt Lõi và 1 Cổ Phụ Trợ khác nhau để cấu thành Sát Chiêu."
                };
            }

            const coreGu = this._getHighestOwnedGuOrTemplate(uniqueIds[0]);
            const subGus = uniqueIds.slice(1).map(id => this._getHighestOwnedGuOrTemplate(id)).filter(Boolean);
            if (!coreGu || subGus.length === 0) {
                return { valid: false, description: "Dữ liệu cổ trùng không hợp lệ." };
            }

            const secPaths = subGus.map(t => t.path);
            const daoCheck = player
                ? player.calculateDaoAmplification(coreGu.path, secPaths)
                : { multiplier: 1.0, hasConflict: false };

            if (daoCheck.hasConflict) {
                return {
                    valid: false,
                    hasConflict: true,
                    name: "Xung Đột Đạo Ngân!",
                    typeLabel: "Tổ hợp Bài Xích",
                    essenceCost: 15,
                    description: `Đạo ngân của [${coreGu.name} (${coreGu.path})] và [${subGus.map(s => s.name + " (" + s.path + ")").join(", ")}] xung đột kịch liệt! Hãy chọn các cổ trùng tương sinh hoặc đạt Tông Sư lưu phái.`
                };
            }

            const built = this._buildDynamicKillerMoveProfile(coreGu, subGus);
            const isImmortalMove = built.moveRank >= 6;
            const rankLabel = `${GuSystem.getRankName(built.moveRank)} ${isImmortalMove ? "Tiên Đạo" : "Phàm Đạo"}`;
            const moveName = `${coreGu.name.replace(" Cổ", "")} • ${subGus.map(s => s.name.replace(" Cổ", "")).join(" ")} Sát`;
            const fullDesc = `[${rankLabel} | Uy lực gốc: ${built.finalPower} | Hồi chiêu: ${built.cooldown}s] ${built.traitSummaryText}`;

            return {
                valid: true,
                isPreset: false,
                customData: {
                    id: `km_custom_${coreGu.id}_${subGus.map(s => s.id).join("_")}`,
                    name: moveName,
                    icon: isImmortalMove ? "🌟" : coreGu.icon,
                    moveRank: built.moveRank,
                    path: coreGu.path,
                    type: coreGu.type,
                    typeLabel: `${rankLabel} Sát Chiêu (${coreGu.path})`,
                    requiredGuIds: [coreGu.id, ...subGus.map(s => s.id)],
                    essenceCost: built.finalEssenceCost,
                    cooldown: built.cooldown,
                    power: built.finalPower,
                    isImmortal: isImmortalMove,
                    combatProfile: built.combatProfile,
                    description: fullDesc
                },
                name: `${moveName} (${GuSystem.getRankName(built.moveRank)})`,
                typeLabel: `${rankLabel} Sát Chiêu (${coreGu.path})`,
                essenceCost: built.finalEssenceCost,
                description: fullDesc
            };
        }

        deduceAndSaveKillerMove(coreId, sub1Id, sub2Id, player) {
            const preview = this.previewKillerMoveDeduction(coreId, sub1Id, sub2Id, player);

            if (!coreId || (!sub1Id && !sub2Id)) {
                return {
                    success: false,
                    message: "Hãy chọn ít nhất 1 Cổ Cốt Lõi và 1 Cổ Phụ Trợ để thôi diễn Sát Chiêu!"
                };
            }

            if (player && player.mental < 20) {
                return {
                    success: false,
                    message: "Tinh thần lực không đủ (cần 20) để thôi diễn Sát Chiêu!"
                };
            }

            if (player) {
                player.mental = Math.max(0, player.mental - 20);
            }

            if (!preview.valid) {
                return {
                    success: false,
                    message: "Thôi diễn thất bại! Các cổ trùng bài xích lẫn nhau khiến linh quang tan vỡ (-20 Tinh Thần Lực)."
                };
            }

            const moveObj = JSON.parse(JSON.stringify(preview.customData));
            const existingIdx = this.savedKillerMoves.findIndex(m => m.id === moveObj.id);
            if (existingIdx !== -1) {
                this.savedKillerMoves[existingIdx] = moveObj;
                return {
                    success: true,
                    move: moveObj,
                    message: `⚡ Đã cập nhật Sát Chiêu 【${moveObj.name}】 lên ${GuSystem.getRankName(moveObj.moveRank)} (Uy lực gốc: ${moveObj.power})!`
                };
            }

            this.savedKillerMoves.push(moveObj);
            if (player) {
                player.addDaoMarks("Trí Đạo", 4);
            }

            const emptyKSlot = this.equippedKillerSlots.findIndex(s => s === null);
            if (emptyKSlot !== -1) {
                this.equippedKillerSlots[emptyKSlot] = moveObj.id;
            }

            return {
                success: true,
                move: moveObj,
                message: `⚡ Thôi diễn thành công 【${moveObj.name} (${GuSystem.getRankName(moveObj.moveRank)})】 (Uy lực gốc: ${moveObj.power})!`
            };
        }

        getSavedKillerMoves() {
            this._recalculateSavedKillerMoves();
            return this.savedKillerMoves;
        }

        equipKillerMoveToSlot(moveId, kSlotIdx) {
            if (kSlotIdx < 0 || kSlotIdx > 3) {
                return { success: false, message: "Ô Sát Chiêu không hợp lệ." };
            }
            const move = this.savedKillerMoves.find(m => m.id === moveId);
            if (!move) {
                return { success: false, message: "Không tìm thấy Sát Chiêu này." };
            }

            this.equippedKillerSlots[kSlotIdx] = move.id;
            const keys = ["Z", "X", "C", "V"];
            return {
                success: true,
                message: `Đã gán Sát Chiêu [${move.name} (${GuSystem.getRankName(move.moveRank)})] vào phím [${keys[kSlotIdx]}].`
            };
        }

        getEquippedKillerMoveAt(kSlotIdx) {
            const moveId = this.equippedKillerSlots[kSlotIdx];
            if (!moveId) return null;
            return this.savedKillerMoves.find(m => m.id === moveId) || null;
        }

        validateKillerMoveComponents(move) {
            if (!move || !Array.isArray(move.requiredGuIds)) {
                return { valid: false, reason: "Dữ liệu Sát Chiêu bị lỗi." };
            }

            for (const reqGuId of move.requiredGuIds) {
                const resolvedId = LEGACY_GU_ALIASES[reqGuId] ? LEGACY_GU_ALIASES[reqGuId].id : reqGuId;
                const owned = this.ownedGuList.find(g => g.id === resolvedId && g.isRefined);
                if (!owned) {
                    const tpl = GU_DATABASE[resolvedId];
                    return {
                        valid: false,
                        reason: `Thiếu cổ trùng thành phần [${tpl ? tpl.name : reqGuId}] trong Kho Cổ! Sát chiêu [${move.name}] không thể vận hành.`
                    };
                }
                if (owned.hunger <= 0) {
                    return {
                        valid: false,
                        reason: `Cổ trùng thành phần [${GuSystem.formatGuNameWithRank(owned)}] đang đói kiệt sức (0%)! Hãy cho ăn trước.`
                    };
                }
            }

            return { valid: true };
        }

        // =====================================================================
        // 10. QUẢN LÝ KHO CỔ & TRANG BỊ 8 Ô CHIẾN ĐẤU
        // =====================================================================

        equipGuToSlot(instanceId, slotIdx) {
            if (slotIdx < 0 || slotIdx > 7) {
                return { success: false, message: "Ô kỹ năng phải từ 1 đến 8." };
            }

            const gu = this.getGuByInstanceId(instanceId);
            if (!gu) return { success: false, message: "Không tìm thấy Cổ Trùng." };
            if (!gu.isRefined) {
                return {
                    success: false,
                    message: `[${GuSystem.formatGuNameWithRank(gu)}] là Cổ Hoang Dã chưa được luyện hóa, không thể trang bị!`
                };
            }

            if (gu.equippedSlot !== null && gu.equippedSlot !== slotIdx) {
                this.equippedGuSlots[gu.equippedSlot] = null;
            }

            const prevInstanceId = this.equippedGuSlots[slotIdx];
            if (prevInstanceId && prevInstanceId !== instanceId) {
                const prevGu = this.getGuByInstanceId(prevInstanceId);
                if (prevGu) prevGu.equippedSlot = null;
            }

            this.equippedGuSlots[slotIdx] = gu.instanceId;
            gu.equippedSlot = slotIdx;

            return {
                success: true,
                message: `Đã trang bị [${GuSystem.formatGuNameWithRank(gu)}] vào Ô Xuất Chiến ${slotIdx + 1}.`
            };
        }

        getEquippedGuAt(slotIdx) {
            const instId = this.equippedGuSlots[slotIdx];
            if (!instId) return null;
            return this.getGuByInstanceId(instId);
        }

        getGuByInstanceId(instanceId) {
            if (!instanceId) return null;
            return this.ownedGuList.find(g => g.instanceId === instanceId) || null;
        }

        hasRefinedGuByTemplate(templateId) {
            const resolvedId = LEGACY_GU_ALIASES[templateId] ? LEGACY_GU_ALIASES[templateId].id : templateId;
            return this.ownedGuList.some(g => g.id === resolvedId && g.isRefined);
        }

        getRefinedGuList() {
            const byIdHighest = new Map();
            for (const gu of this.ownedGuList) {
                if (!gu.isRefined) continue;
                this._syncGuInstanceStats(gu);
                const prev = byIdHighest.get(gu.id);
                if (!prev || gu.rank > prev.rank) {
                    byIdHighest.set(gu.id, gu);
                }
            }
            return Array.from(byIdHighest.values());
        }

        removeGuByInstanceId(instanceId) {
            const idx = this.ownedGuList.findIndex(g => g.instanceId === instanceId);
            if (idx === -1) return false;

            const gu = this.ownedGuList[idx];
            if (gu.equippedSlot !== null) {
                this.equippedGuSlots[gu.equippedSlot] = null;
            }
            this.ownedGuList.splice(idx, 1);
            return true;
        }

        getFilteredGuList(filter = "all") {
            return this.ownedGuList.filter(gu => {
                this._syncGuInstanceStats(gu);
                switch (filter) {
                    case "all": return true;
                    case "rank-1": return gu.rank === 1;
                    case "rank-2": return gu.rank === 2;
                    case "rank-3": return gu.rank === 3;
                    case "rank-4": return gu.rank === 4;
                    case "rank-5": return gu.rank === 5;
                    case "immortal": return gu.rank >= 6;
                    case "offensive": return gu.type === "offensive";
                    case "defensive": return gu.type === "defensive";
                    case "movement": return gu.type === "movement";
                    case "support": return gu.type === "support";
                    default: return true;
                }
            });
        }

        toSaveData() {
            return {
                ownedGuList: this.ownedGuList,
                nextInstanceCounter: this.nextInstanceCounter,
                equippedGuSlots: this.equippedGuSlots,
                savedKillerMoves: this.savedKillerMoves,
                equippedKillerSlots: this.equippedKillerSlots,
                unlockedRecipeIds: this.unlockedRecipeIds
            };
        }

        fromSaveData(data) {
            if (!data) return;
            if (Array.isArray(data.ownedGuList)) {
                this.ownedGuList = data.ownedGuList.map(g => this._syncGuInstanceStats(g));
            }
            if (typeof data.nextInstanceCounter === "number") this.nextInstanceCounter = data.nextInstanceCounter;
            if (Array.isArray(data.equippedGuSlots)) this.equippedGuSlots = data.equippedGuSlots;
            if (Array.isArray(data.savedKillerMoves)) this.savedKillerMoves = data.savedKillerMoves;
            if (Array.isArray(data.equippedKillerSlots)) this.equippedKillerSlots = data.equippedKillerSlots;
            if (Array.isArray(data.unlockedRecipeIds)) this.unlockedRecipeIds = data.unlockedRecipeIds;
            this._recalculateSavedKillerMoves();
        }
    }

    GuSystem.RANK_NAMES = RANK_NAMES;
    GuSystem.GU_DATABASE = GU_DATABASE;
    GuSystem.LEGACY_GU_ALIASES = LEGACY_GU_ALIASES;
    GuSystem.REFINEMENT_RECIPES = REFINEMENT_RECIPES;
    GuSystem.PRESET_KILLER_MOVES = PRESET_KILLER_MOVES;

    global.GuSystem = GuSystem;

})(window);