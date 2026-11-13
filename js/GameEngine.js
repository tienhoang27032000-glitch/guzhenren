/**
 * VẠN CỔ TIÊN ĐỒ - MODULE LÕI ĐIỀU PHỐI TRÒ CHƠI & ĐẠI CHIẾN SONG TÔN CỬU CHUYỂN (GameEngine.js)
 * Cập nhật:
 *  - Chỉ tăng sức mạnh độc quyền cho 2 vị Tôn Giả Cửu Chuyển (Tinh Tú Tiên Tôn & Cự Dương Tiên Tôn).
 *  - Toàn bộ quái thường và Tinh Anh trong Phong Ma Quật (Ải 25) giữ nguyên cấp Bát Chuyển (Rank 8)
 *    và chỉ số cũ, không nhận nhầm máu hay hiệu ứng bất tử của Song Tôn.
 */

(function (global) {
    "use strict";

    const SAVE_KEY_PREFIX = "van_co_tien_do_v2_slot_";

    // =========================================================================
    // 1. DANH MỤC 25 BẢN ĐỒ LỊCH LUYỆN CHUẨN NGUYÊN TÁC (1 CHUYỂN -> 9 CHUYỂN)
    // =========================================================================

    const STAGE_CATALOG = [
        // ==================== NHẤT CHUYỂN (RANK 1: ẢI 1 -> 3) ====================
        {
            id: "stage_1",
            order: 1,
            name: "Ải 1: Sườn Núi Thanh Mao",
            icon: "🎋",
            regionName: "Nam Cương",
            reqRank: 1,
            prevStageId: null,
            arenaCenterX: 2400,
            arenaCenterY: 2400,
            themeTint: "rgba(25, 85, 55, 0.14)",
            arenaBorderColor: "#4cd964",
            mobTemplateId: "green_wolf",
            mobName: "Thanh Mao Điện Lang",
            mobIsHuman: false,
            targetKills: 8,
            bossTemplateId: "thunder_wolf_king",
            bossName: "Lôi Quan Đầu Lang (Bách Thú Vương)",
            bossIsHuman: false,
            rewardStones: 6,
            rewardMerit: 5,
            rewardHumanQi: 2,
            dropPreview: "Nguyệt Lan Hoa (45%), Thanh Linh Thảo (45%), Thịt Thú Rừng (50%)",
            drops: [
                { itemId: "moon_orchid", count: 1, chance: 0.45 },
                { itemId: "spirit_herb", count: 1, chance: 0.45 },
                { itemId: "ration_meat", count: 1, chance: 0.50 }
            ],
            description: "Rừng trúc rộng lớn dưới chân Cổ Nguyệt Sơn Trại. Đàn Điện Lang rải rác khắp sườn núi cùng Bách Thú Vương rình rập."
        },
        {
            id: "stage_2",
            order: 2,
            name: "Ải 2: Mật Động Hoa Tửu Hành Giả",
            icon: "🍶",
            regionName: "Nam Cương",
            reqRank: 1,
            prevStageId: "stage_1",
            arenaCenterX: 2400,
            arenaCenterY: 2400,
            themeTint: "rgba(95, 65, 20, 0.18)",
            arenaBorderColor: "#f7c948",
            mobTemplateId: "iron_boar",
            mobName: "Thiết Bì Dã Trư",
            mobIsHuman: false,
            targetKills: 9,
            bossTemplateId: "blood_bat_king",
            bossName: "Xích Nhãn Tửu Viên Vương",
            bossIsHuman: false,
            rewardStones: 9,
            rewardMerit: 7,
            rewardHumanQi: 3,
            dropPreview: "Thanh Đồng Khoáng (45%), Cổ Phương Tàn Quyển (12%), Thanh Đồng Xá Lợi Cổ (3%)",
            drops: [
                { itemId: "bronze_ore", count: 1, chance: 0.45 },
                { itemId: "remnant_recipe", count: 1, chance: 0.12 },
                { itemId: "bronze_relic_gu", count: 1, chance: 0.03 }
            ],
            description: "Hang đá ngầm nơi Ma Đạo Hoa Tửu Hành Giả từng lưu lại di chỉ Tửu Trùng."
        },
        {
            id: "stage_3",
            order: 3,
            name: "Ải 3: Địa Đạo Huyết Hồ Cổ Nguyệt",
            icon: "🩸",
            regionName: "Nam Cương",
            reqRank: 1,
            prevStageId: "stage_2",
            arenaCenterX: 2400,
            arenaCenterY: 2400,
            themeTint: "rgba(130, 15, 25, 0.24)",
            arenaBorderColor: "#e03e3e",
            mobTemplateId: "blood_bat_king",
            mobName: "Thiết Đao Sí Huyết Bức",
            mobIsHuman: false,
            targetKills: 10,
            bossTemplateId: "blood_bat_king",
            bossName: "Huyết Thi Cổ Sư Hộ Trì",
            bossIsHuman: true,
            bossSkinKey: "u_hon",
            bossKillerMove: "Huyết Lãng Thôn Phệ Sát",
            bossAttackGu: "Huyết Nguyệt Cổ Nhất Chuyển",
            bossDefGu: "Huyết Thuẫn Cổ",
            rewardStones: 13,
            rewardMerit: 10,
            rewardHumanQi: 4,
            dropPreview: "Bách Thú Tinh Huyết (45%), Cổ Phương Tàn Quyển (14%), Thanh Đồng Xá Lợi Cổ (4%)",
            drops: [
                { itemId: "beast_blood_core", count: 1, chance: 0.45 },
                { itemId: "remnant_recipe", count: 1, chance: 0.14 },
                { itemId: "bronze_relic_gu", count: 1, chance: 0.04 }
            ],
            description: "Hồ máu bí mật sâu dưới lòng đất sơn trại. Thủ lĩnh Huyết Thi Cổ Sư biết thúc giục Huyết Nguyệt Cổ và Huyết Đạo Sát Chiêu."
        },

        // ==================== NHỊ CHUYỂN (RANK 2: ẢI 4 -> 6) ====================
        {
            id: "stage_4",
            order: 4,
            name: "Ải 4: Huyết Lang Triều Thanh Mao Sơn",
            icon: "🐺",
            regionName: "Nam Cương",
            reqRank: 2,
            prevStageId: "stage_3",
            arenaCenterX: 2400,
            arenaCenterY: 2400,
            themeTint: "rgba(35, 70, 95, 0.20)",
            arenaBorderColor: "#5aa9e6",
            mobTemplateId: "wind_falcon",
            mobName: "Cuồng Điện Lang Tinh Anh",
            mobIsHuman: false,
            targetKills: 10,
            bossTemplateId: "thunder_wolf_king",
            bossName: "Lôi Điện Hào Lang (Thiên Thú Vương)",
            bossIsHuman: false,
            rewardStones: 18,
            rewardMerit: 14,
            rewardHumanQi: 5,
            dropPreview: "Phong Tuyền Tinh Thạch (45%), Xích Thiết Tinh Khoáng (42%)",
            drops: [
                { itemId: "wind_essence_crystal", count: 1, chance: 0.45 },
                { itemId: "red_iron_ore", count: 1, chance: 0.42 }
            ],
            description: "Lang triều quy mô lớn bao vây ba sơn trại trên đỉnh Thanh Mao Sơn! Cần thăng Cổ Trùng lên Nhị Chuyển để phá giáp Hào Lang."
        },
        {
            id: "stage_5",
            order: 5,
            name: "Ải 5: Bạch Cốt Sơn — Cung Điện Xương",
            icon: "🦴",
            regionName: "Nam Cương",
            reqRank: 2,
            prevStageId: "stage_4",
            arenaCenterX: 2400,
            arenaCenterY: 2400,
            themeTint: "rgba(210, 220, 235, 0.16)",
            arenaBorderColor: "#dce8f2",
            mobTemplateId: "iron_boar",
            mobName: "Bạch Cốt Khôi Lỗi Thú",
            mobIsHuman: false,
            targetKills: 11,
            bossTemplateId: "frost_python_lord",
            bossName: "Bạch Cốt Gia Lão Thủ Điện",
            bossIsHuman: true,
            bossSkinKey: "bach_ngung_bang",
            bossKillerMove: "Vạn Cốt Phi Thương Trận",
            bossAttackGu: "Lao Toàn Cốt Thương Cổ Nhị Chuyển",
            bossDefGu: "Bạch Ngọc Cổ Nhị Chuyển",
            rewardStones: 24,
            rewardMerit: 18,
            rewardHumanQi: 6,
            dropPreview: "Bạch Ngọc Cốt Tủy (50%), Cổ Phương Tàn Quyển (14%), Xích Thiết Xá Lợi Cổ (3%)",
            drops: [
                { itemId: "jade_bone", count: 1, chance: 0.50 },
                { itemId: "remnant_recipe", count: 1, chance: 0.14 },
                { itemId: "red_iron_relic_gu", count: 1, chance: 0.03 }
            ],
            description: "Ngọn núi toàn xương trắng dựng đứng nơi Hôi Cốt Tài Tuấn để lại truyền thừa Lao Toàn Cốt Thương Cổ và Bạch Ngọc Cổ."
        },
        {
            id: "stage_6",
            order: 6,
            name: "Ải 6: Hoàng Kim Sơn — Đầm Lầy Hủ Độc",
            icon: "🌋",
            regionName: "Nam Cương",
            reqRank: 2,
            prevStageId: "stage_5",
            arenaCenterX: 2400,
            arenaCenterY: 2400,
            themeTint: "rgba(140, 45, 15, 0.22)",
            arenaBorderColor: "#ff5733",
            mobTemplateId: "iron_boar",
            mobName: "Hủ Độc Thiềm Thừ & Ngạc Ngư",
            mobIsHuman: false,
            targetKills: 11,
            bossTemplateId: "blood_bat_king",
            bossName: "Lục Giao Đầm Lầy Thú Vương",
            bossIsHuman: false,
            rewardStones: 30,
            rewardMerit: 22,
            rewardHumanQi: 7,
            dropPreview: "Xích Thiết Tinh Khoáng (50%), Bách Niên Khổ Sâm (28%), Xích Thiết Xá Lợi Cổ (4%)",
            drops: [
                { itemId: "red_iron_ore", count: 1, chance: 0.50 },
                { itemId: "hundred_year_ginseng", count: 1, chance: 0.28 },
                { itemId: "red_iron_relic_gu", count: 1, chance: 0.04 }
            ],
            description: "Đầm lầy chướng khí trên đường hành trình từ Bạch Cốt Sơn tiến về Thương Gia Thành."
        },

        // ==================== TAM CHUYỂN (RANK 3: ẢI 7 -> 9) ====================
        {
            id: "stage_7",
            order: 7,
            name: "Ải 7: Thương Gia Thành — Đấu Vũ Trường",
            icon: "🏮",
            regionName: "Nam Cương",
            reqRank: 3,
            prevStageId: "stage_6",
            arenaCenterX: 2400,
            arenaCenterY: 2400,
            themeTint: "rgba(180, 130, 35, 0.16)",
            arenaBorderColor: "#f7c948",
            mobTemplateId: "wind_falcon",
            mobName: "Cổ Sư Đấu Vũ Trường (Tam Chuyển)",
            mobIsHuman: true,
            targetKills: 12,
            bossTemplateId: "frost_python_lord",
            bossName: "Cự Khai Bi & Viêm Đột (Song Bá Đấu Vũ Trường)",
            bossIsHuman: true,
            bossSkinKey: "hac_lau_lan",
            bossKillerMove: "Long Tượng Liệt Diễm Bá Kích",
            bossAttackGu: "Toàn Lực Dĩ Phó Cổ Tam Chuyển",
            bossDefGu: "Thủy Tráo Cổ Tam Chuyển",
            rewardStones: 42,
            rewardMerit: 30,
            rewardHumanQi: 8,
            dropPreview: "Bách Niên Khổ Sâm (42%), Cổ Phương Tàn Quyển (15%), Bạch Ngân Xá Lợi Cổ (3%)",
            drops: [
                { itemId: "hundred_year_ginseng", count: 1, chance: 0.42 },
                { itemId: "remnant_recipe", count: 1, chance: 0.15 },
                { itemId: "white_silver_relic_gu", count: 1, chance: 0.03 }
            ],
            description: "Đấu Vũ Trường nội thành Thương Gia! Các đối thủ đều là Cổ Sư Tam Chuyển tinh thông phối hợp Cổ Trùng và Sát Chiêu."
        },
        {
            id: "stage_8",
            order: 8,
            name: "Ải 8: Tam Xoa Sơn — Phong Ma Đỉnh",
            icon: "⛰️",
            regionName: "Nam Cương",
            reqRank: 3,
            prevStageId: "stage_7",
            arenaCenterX: 2400,
            arenaCenterY: 2400,
            themeTint: "rgba(55, 110, 145, 0.20)",
            arenaBorderColor: "#67b7d1",
            mobTemplateId: "thunder_wolf_king",
            mobName: "Tán Tu Ma Đạo Tam Xoa Sơn",
            mobIsHuman: true,
            targetKills: 12,
            bossTemplateId: "ancient_rock_behemoth",
            bossName: "Phi Thiên Hổ & Hồ Mị Nhi (Tam Chuyển Đỉnh Phong)",
            bossIsHuman: true,
            bossSkinKey: "phuong_cuu_ca",
            bossKillerMove: "Phong Lôi Hổ Khiếu Phá",
            bossAttackGu: "Lôi Dực Cổ Tam Chuyển",
            bossDefGu: "Bạch Ngọc Cổ Tam Chuyển",
            rewardStones: 52,
            rewardMerit: 38,
            rewardHumanQi: 9,
            dropPreview: "Bách Thú Tinh Huyết (50%), Đãng Hồn Thạch Đan (25%), Bạch Ngân Xá Lợi Cổ (4%)",
            drops: [
                { itemId: "beast_blood_core", count: 1, chance: 0.50 },
                { itemId: "soul_crystal", count: 1, chance: 0.25 },
                { itemId: "white_silver_relic_gu", count: 1, chance: 0.04 }
            ],
            description: "Ba ngọn núi hiểm trở nơi Chính Ma lưỡng đạo tụ tập chờ đợi Tam Vương Truyền Thừa mở cửa."
        },
        {
            id: "stage_9",
            order: 9,
            name: "Ải 9: Vạn Thú Sơn Lĩnh — Nam Cương",
            icon: "🦁",
            regionName: "Nam Cương",
            reqRank: 3,
            prevStageId: "stage_8",
            arenaCenterX: 2400,
            arenaCenterY: 2400,
            themeTint: "rgba(95, 50, 20, 0.22)",
            arenaBorderColor: "#e67e22",
            mobTemplateId: "thunder_wolf_king",
            mobName: "Thiên Thú Vương Tinh Anh",
            mobIsHuman: false,
            targetKills: 12,
            bossTemplateId: "frost_python_lord",
            bossName: "Hàn Sương Bạch Ngọc Mãng Vương",
            bossIsHuman: false,
            rewardStones: 62,
            rewardMerit: 45,
            rewardHumanQi: 10,
            dropPreview: "Đãng Hồn Thạch Đan (30%), Bạch Ngân Xá Lợi Cổ (5%)",
            drops: [
                { itemId: "soul_crystal", count: 1, chance: 0.30 },
                { itemId: "white_silver_relic_gu", count: 1, chance: 0.05 }
            ],
            description: "Rừng nguyên sinh rậm rạp của Nam Cương, nơi hàng chục bầy thú cùng Thiên Thú Vương hoành hành khắp bản đồ."
        },

        // ==================== TỨ CHUYỂN (RANK 4: ẢI 10 -> 12) ====================
        {
            id: "stage_10",
            order: 10,
            name: "Ải 10: Tam Vương Sơn — Phúc Địa Mở Cửa",
            icon: "👑",
            regionName: "Nam Cương",
            reqRank: 4,
            prevStageId: "stage_9",
            arenaCenterX: 2400,
            arenaCenterY: 2400,
            themeTint: "rgba(180, 140, 30, 0.22)",
            arenaBorderColor: "#ffd700",
            mobTemplateId: "blood_bat_king",
            mobName: "Cường Giả Tứ Chuyển & Khuyển Thú Vương",
            mobIsHuman: true,
            targetKills: 13,
            bossTemplateId: "ancient_rock_behemoth",
            bossName: "Thiết Mộ Bạch (Tộc Trưởng Thiết Gia — Tứ Chuyển Đỉnh Phong)",
            bossIsHuman: true,
            bossSkinKey: "hac_lau_lan",
            bossKillerMove: "Kim Đạo Sát Chiêu: Hoàng Kim Khuynh Thành Kích",
            bossAttackGu: "Khổ Lực Cổ Tứ Chuyển",
            bossDefGu: "Hoàng Kim Chung Cổ Tứ Chuyển",
            rewardStones: 85,
            rewardMerit: 60,
            rewardHumanQi: 12,
            dropPreview: "Đãng Hồn Thạch Đan (42%), Cổ Phương Tàn Quyển (18%), Hoàng Kim Xá Lợi Cổ (3%)",
            drops: [
                { itemId: "soul_crystal", count: 1, chance: 0.42 },
                { itemId: "remnant_recipe", count: 1, chance: 0.18 },
                { itemId: "yellow_gold_relic_gu", count: 1, chance: 0.03 }
            ],
            description: "Đỉnh Tam Vương Sơn nơi Phương Nguyên đại chiến quần hùng Tứ Chuyển và đoạt lấy Định Tiên Du ngay trước mắt Thiết Mộ Bạch!"
        },
        {
            id: "stage_11",
            order: 11,
            name: "Ải 11: Sa Mạc Lửa Thiêu — Tây Mạc Thương Đạo",
            icon: "🏜️",
            regionName: "Tây Mạc",
            reqRank: 4,
            prevStageId: "stage_10",
            arenaCenterX: 2400,
            arenaCenterY: 2400,
            themeTint: "rgba(175, 110, 25, 0.24)",
            arenaBorderColor: "#e6a84c",
            mobTemplateId: "ancient_rock_behemoth",
            mobName: "Sa Mạc Hỏa Hạt Vương & Tán Tu Tây Mạc",
            mobIsHuman: false,
            targetKills: 13,
            bossTemplateId: "ancient_rock_behemoth",
            bossName: "Tiêu Sơn (Tộc Trưởng Tiêu Gia — Tứ Chuyển)",
            bossIsHuman: true,
            bossSkinKey: "hong_lien",
            bossKillerMove: "Viêm Đạo Sát Chiêu: Xích Long Thiên Hỏa Trận",
            bossAttackGu: "Xích Viêm Hỏa Long Cổ Tứ Chuyển",
            bossDefGu: "Hoàng Kim Chung Cổ Tứ Chuyển",
            rewardStones: 105,
            rewardMerit: 72,
            rewardHumanQi: 14,
            dropPreview: "Xích Thiết Tinh Khoáng (55%), Hoàng Kim Xá Lợi Cổ (4%)",
            drops: [
                { itemId: "red_iron_ore", count: 2, chance: 0.55 },
                { itemId: "yellow_gold_relic_gu", count: 1, chance: 0.04 }
            ],
            description: "Sa mạc rực lửa của Tây Mạc nơi các tộc trưởng Tứ Chuyển tranh giành ốc đảo linh tuyền."
        },
        {
            id: "stage_12",
            order: 12,
            name: "Ải 12: Thiên Thê Sơn — Quần Hùng Trung Châu",
            icon: "🗡️",
            regionName: "Trung Châu",
            reqRank: 4,
            prevStageId: "stage_11",
            arenaCenterX: 2400,
            arenaCenterY: 2400,
            themeTint: "rgba(55, 130, 175, 0.22)",
            arenaBorderColor: "#67b7d1",
            mobTemplateId: "frost_python_lord",
            mobName: "Đệ Tử Tinh Anh Thập Đại Cổ Phái",
            mobIsHuman: true,
            targetKills: 14,
            bossTemplateId: "ancient_rock_behemoth",
            bossName: "Tiêu Mang & Phong Thiên Ngữ (Tứ Chuyển Đỉnh Phong)",
            bossIsHuman: true,
            bossSkinKey: "phuong_cuu_ca",
            bossKillerMove: "Quang Đạo Sát Chiêu: Thiên Hà Lưu Tinh Bộc",
            bossAttackGu: "Thiên Phong Kiếm Vũ Cổ Tứ Chuyển",
            bossDefGu: "Hoàng Kim Chung Cổ Tứ Chuyển",
            rewardStones: 130,
            rewardMerit: 88,
            rewardHumanQi: 16,
            dropPreview: "Đãng Hồn Thạch Đan (48%), Cổ Phương Tàn Quyển (20%), Hoàng Kim Xá Lợi Cổ (5%)",
            drops: [
                { itemId: "soul_crystal", count: 1, chance: 0.48 },
                { itemId: "remnant_recipe", count: 1, chance: 0.20 },
                { itemId: "yellow_gold_relic_gu", count: 1, chance: 0.05 }
            ],
            description: "Chân núi Thiên Thê Sơn tại Trung Châu, nơi tinh anh Thập Đại Cổ Phái tề tựu tranh đoạt tư cách leo núi truyền thừa."
        },

        // ==================== NGŨ CHUYỂN (RANK 5: ẢI 13 -> 15) ====================
        {
            id: "stage_13",
            order: 13,
            name: "Ải 13: Bắc Nguyên Thảo Nguyên — Hoàng Kim Bộ Tộc",
            icon: "🌾",
            regionName: "Bắc Nguyên",
            reqRank: 5,
            prevStageId: "stage_12",
            arenaCenterX: 2400,
            arenaCenterY: 2400,
            themeTint: "rgba(95, 125, 45, 0.22)",
            arenaBorderColor: "#b89758",
            mobTemplateId: "ancient_rock_behemoth",
            mobName: "Vạn Thú Vương Sói & Tộc Trưởng Bắc Nguyên",
            mobIsHuman: false,
            targetKills: 14,
            bossTemplateId: "desolate_thunder_dragon",
            bossName: "Lưu Văn Võ & Mặc Sư Cuồng (Ngũ Chuyển Cường Giả)",
            bossIsHuman: true,
            bossSkinKey: "phuong_cuu_ca",
            bossKillerMove: "Ngũ Chuyển Sát Chiêu: Phong Lôi Bá Hoàng Trảm",
            bossAttackGu: "Thái Cổ Giao Long Lực Cổ Ngũ Chuyển",
            bossDefGu: "Hoàng Kim Chung Cổ Ngũ Chuyển",
            rewardStones: 175,
            rewardMerit: 115,
            rewardHumanQi: 20,
            dropPreview: "Tử Tinh Xá Lợi Cổ (3%), Đãng Hồn Thạch Đan (50%)",
            drops: [
                { itemId: "purple_crystal_relic_gu", count: 1, chance: 0.03 },
                { itemId: "soul_crystal", count: 1, chance: 0.50 }
            ],
            description: "Thảo nguyên Bắc Nguyên rộng lớn, nơi Lang Vương Thường Sơn Âm thống lĩnh vạn lang đối đầu đại quân Lưu Gia."
        },
        {
            id: "stage_14",
            order: 14,
            name: "Ải 14: Vương Đình Tranh Bá — Đại Chiến Hắc Lâu Lan",
            icon: "🔥",
            regionName: "Bắc Nguyên",
            reqRank: 5,
            prevStageId: "stage_13",
            arenaCenterX: 2400,
            arenaCenterY: 2400,
            themeTint: "rgba(165, 35, 35, 0.24)",
            arenaBorderColor: "#ff4d4d",
            mobTemplateId: "ancient_rock_behemoth",
            mobName: "Thống Lĩnh Hắc Gia Quân (Ngũ Chuyển)",
            mobIsHuman: true,
            targetKills: 15,
            bossTemplateId: "desolate_thunder_dragon",
            bossName: "Hắc Lâu Lan (Ngũ Chuyển Đỉnh Phong — Đại Lực Chân Vũ Thể)",
            bossIsHuman: true,
            bossSkinKey: "hac_lau_lan",
            bossKillerMove: "Ngũ Chuyển Sát Chiêu: Đại Lực Chân Vũ Bá Hoàng Quyền",
            bossAttackGu: "Thái Cổ Giao Long Lực Cổ Ngũ Chuyển",
            bossDefGu: "Hoàng Kim Chung Cổ Ngũ Chuyển",
            rewardStones: 225,
            rewardMerit: 145,
            rewardHumanQi: 24,
            dropPreview: "Tử Tinh Xá Lợi Cổ (4%), Tiên Nguyên Thạch (12%), Đãng Hồn Thạch Đan (55%)",
            drops: [
                { itemId: "purple_crystal_relic_gu", count: 1, chance: 0.04 },
                { itemId: "immortal_stone", count: 1, chance: 0.12 },
                { itemId: "soul_crystal", count: 1, chance: 0.55 }
            ],
            description: "Trận quyết chiến giành ngôi vị Vương Đình Chi Chủ Bắc Nguyên với Hắc Lâu Lan mang Đại Lực Chân Vũ Thể!"
        },
        {
            id: "stage_15",
            order: 15,
            name: "Ải 15: Bát Thập Bát Giác Chân Dương Lâu",
            icon: "🏯",
            regionName: "Bắc Nguyên (Vương Đình Phúc Địa)",
            reqRank: 5,
            prevStageId: "stage_14",
            arenaCenterX: 2400,
            arenaCenterY: 2400,
            themeTint: "rgba(215, 165, 35, 0.25)",
            arenaBorderColor: "#ffd700",
            mobTemplateId: "desolate_thunder_dragon",
            mobName: "Thiên Ngoại Thiên Ma & Hộ Lâu Thú",
            mobIsHuman: false,
            targetKills: 15,
            bossTemplateId: "desolate_thunder_dragon",
            bossName: "Cự Dương Tiên Tôn Cuồng Man Ý Chí (Ngũ Chuyển Cực Hạn)",
            bossIsHuman: true,
            bossSkinKey: "hong_lien",
            bossKillerMove: "Vận Đạo Sát Chiêu: Hoàng Kim Khí Vận Trấn Thiên Địa",
            bossAttackGu: "Huyết Hà Đại Trận Cổ Ngũ Chuyển",
            bossDefGu: "Hoàng Kim Chung Cổ Ngũ Chuyển",
            rewardStones: 290,
            rewardMerit: 185,
            rewardHumanQi: 30,
            dropPreview: "Tử Tinh Xá Lợi Cổ (6%), Tiên Nguyên Thạch (25%), Đãng Hồn Thạch Đan (65%)",
            drops: [
                { itemId: "purple_crystal_relic_gu", count: 1, chance: 0.06 },
                { itemId: "immortal_stone", count: 1, chance: 0.25 },
                { itemId: "soul_crystal", count: 1, chance: 0.65 }
            ],
            description: "Đánh sập Bát Thập Bát Giác Chân Dương Lâu trong Vương Đình Phúc Địa để tích lũy đủ 120 Nhân Khí Phá Khiếu Thăng Tiên!"
        },

        // ==================== LỤC CHUYỂN TIÊN CẢNH (RANK 6: ẢI 16 -> 18) ====================
        {
            id: "stage_16",
            order: 16,
            name: "Ải 16: Hồ Tiên Phúc Địa — Đãng Hồn Sơn Bảo Vệ Chiến",
            icon: "🦊",
            regionName: "Trung Châu (Lục Chuyển Tiên Cảnh)",
            reqRank: 6,
            prevStageId: "stage_15",
            arenaCenterX: 2400,
            arenaCenterY: 2400,
            themeTint: "rgba(195, 90, 165, 0.22)",
            arenaBorderColor: "#c278ff",
            mobTemplateId: "desolate_thunder_dragon",
            mobName: "Hoang Thú Cửu Cung Hạc & Tiên Hạc Môn Tinh Anh",
            mobIsHuman: false,
            targetKills: 15,
            bossTemplateId: "desolate_thunder_dragon",
            bossName: "Hạc Phong Dương (Lục Chuyển Cổ Tiên Tiên Hạc Môn)",
            bossIsHuman: true,
            bossSkinKey: "thuong_tam_tu",
            bossKillerMove: "Lục Chuyển Tiên Đạo Sát Chiêu: Vạn Hạc Tề Phi Kiếm Vũ",
            bossAttackGu: "Phi Kiếm Tiên Cổ Lục Chuyển",
            bossDefGu: "Hoàng Kim Chung Cổ Lục Chuyển",
            rewardStones: 380,
            rewardMerit: 230,
            rewardHumanQi: 35,
            dropPreview: "Tiên Nguyên Thạch (45%), Đãng Hồn Thạch Đan (65%)",
            drops: [
                { itemId: "immortal_stone", count: 1, chance: 0.45 },
                { itemId: "soul_crystal", count: 1, chance: 0.65 }
            ],
            description: "[Lục Chuyển Tiên Cảnh] Tiên Hạc Môn phái Cổ Tiên Hạc Phong Dương tấn công Hồ Tiên Phúc Địa nhằm cướp đoạt Đãng Hồn Sơn!"
        },
        {
            id: "stage_17",
            order: 17,
            name: "Ải 17: Lang Gia Phúc Địa — Vân Các Bảo Vệ Chiến",
            icon: "☁️",
            regionName: "Bắc Nguyên (Lục Chuyển Tiên Cảnh)",
            reqRank: 6,
            prevStageId: "stage_16",
            arenaCenterX: 2400,
            arenaCenterY: 2400,
            themeTint: "rgba(115, 195, 225, 0.22)",
            arenaBorderColor: "#7ef7f0",
            mobTemplateId: "desolate_thunder_dragon",
            mobName: "Ảnh Tông Xâm Lược Giả & Hoang Thú Vân Cầm",
            mobIsHuman: true,
            targetKills: 16,
            bossTemplateId: "desolate_thunder_dragon",
            bossName: "Tần Bách Thắng (Lục Chuyển Đỉnh Phong — Á Tiên Tôn Chiến Lực)",
            bossIsHuman: true,
            bossSkinKey: "hac_lau_lan",
            bossKillerMove: "Tiên Đạo Sát Chiêu: Ngũ Chỉ Quyền Tâm Kiếm",
            bossAttackGu: "Phi Kiếm Tiên Cổ Lục Chuyển",
            bossDefGu: "Hoàng Kim Chung Cổ Lục Chuyển",
            rewardStones: 460,
            rewardMerit: 280,
            rewardHumanQi: 40,
            dropPreview: "Tiên Nguyên Thạch (60%), Cổ Phương Tàn Quyển (30%)",
            drops: [
                { itemId: "immortal_stone", count: 1, chance: 0.60 },
                { itemId: "remnant_recipe", count: 1, chance: 0.30 },
                { itemId: "soul_crystal", count: 1, chance: 0.65 }
            ],
            description: "[Lục Chuyển Tiên Cảnh] Quân đoàn Ảnh Tông do Tần Bách Thắng dẫn đầu đột kích Lang Gia Phúc Địa!"
        },
        {
            id: "stage_18",
            order: 18,
            name: "Ải 18: Bí Cảnh Lạc Phách Cốc — Bách Nhật Đại Chiến",
            icon: "❄️",
            regionName: "Bắc Nguyên (Lục Chuyển Tiên Cảnh)",
            reqRank: 6,
            prevStageId: "stage_17",
            arenaCenterX: 2400,
            arenaCenterY: 2400,
            themeTint: "rgba(95, 185, 245, 0.25)",
            arenaBorderColor: "#85c1e9",
            mobTemplateId: "desolate_thunder_dragon",
            mobName: "Lạc Phách Phong Hồn Thú & Trung Châu Cổ Tiên",
            mobIsHuman: true,
            targetKills: 16,
            bossTemplateId: "desolate_thunder_dragon",
            bossName: "Hồi Phong Tử & Tần Bách Thắng Tử Chiến (Lục Chuyển Cực Hạn)",
            bossIsHuman: true,
            bossSkinKey: "bach_ngung_bang",
            bossKillerMove: "Tiên Đạo Sát Chiêu: Lạc Phách Mê Hồn Phong Nhận",
            bossAttackGu: "Nhiếp Hồn Âm Cổ Lục Chuyển",
            bossDefGu: "Băng Tinh Tuyết Hoa Cổ Lục Chuyển",
            rewardStones: 550,
            rewardMerit: 330,
            rewardHumanQi: 45,
            dropPreview: "Tiên Nguyên Thạch (75%), Đãng Hồn Thạch Đan (75%)",
            drops: [
                { itemId: "immortal_stone", count: 1, chance: 0.75 },
                { itemId: "soul_crystal", count: 2, chance: 0.75 }
            ],
            description: "[Lục Chuyển Đỉnh Phong] Cuộc đại chiến kéo dài trăm ngày trong thánh địa Hồn Đạo Lạc Phách Cốc."
        },

        // ==================== THẤT CHUYỂN TIÊN CẢNH (RANK 7: ẢI 19 -> 21) ====================
        {
            id: "stage_19",
            order: 19,
            name: "Ải 19: Đại Chiến Nghĩa Thiên Sơn — Thập Tuyệt Tiên Cương Đại Trận",
            icon: "⚔️",
            regionName: "Nam Cương (Thất Chuyển Tiên Cảnh)",
            reqRank: 7,
            prevStageId: "stage_18",
            arenaCenterX: 2400,
            arenaCenterY: 2400,
            themeTint: "rgba(165, 25, 45, 0.28)",
            arenaBorderColor: "#ff3b30",
            mobTemplateId: "desolate_thunder_dragon",
            mobName: "Tiên Cương Ảnh Tông & Hộ Vệ Giám Thiên Tháp (Thất Chuyển)",
            mobIsHuman: true,
            targetKills: 16,
            bossTemplateId: "desolate_thunder_dragon",
            bossName: "Bạc Thanh Tàn Hồn & Ảnh Vô Tà (Thất Chuyển Đỉnh Phong)",
            bossIsHuman: true,
            bossSkinKey: "u_hon",
            bossKillerMove: "Thất Chuyển Tiên Đạo Sát Chiêu: Vạn Thiên Kiếm Giao • Dẫn Hồn Nhập Mộng",
            bossAttackGu: "Phi Kiếm Tiên Cổ Thất Chuyển",
            bossDefGu: "Hoàng Kim Chung Cổ Thất Chuyển",
            rewardStones: 720,
            rewardMerit: 420,
            rewardHumanQi: 55,
            dropPreview: "Tiên Nguyên Thạch (x2), Mở khóa cơ duyên Chí Tôn Tiên Thai Cổ",
            drops: [
                { itemId: "immortal_stone", count: 2, chance: 0.85 },
                { itemId: "soul_crystal", count: 2, chance: 0.80 }
            ],
            description: "[Thất Chuyển Tiên Cảnh] Trận đại chiến kinh thiên động địa trên đỉnh Nghĩa Thiên Sơn! Bạc Thanh Kiếm Tiên xuất kiếm chém ngang Nam Cương, U Hồn Ma Tôn nghịch thiên luyện Chí Tôn Tiên Thai Cổ!"
        },
        {
            id: "stage_20",
            order: 20,
            name: "Ải 20: Hắc Phàm Động Thiên — Huyết Chiến Thất Chuyển",
            icon: "⏳",
            regionName: "Bắc Nguyên (Thất Chuyển Tiên Cảnh)",
            reqRank: 7,
            prevStageId: "stage_19",
            arenaCenterX: 2400,
            arenaCenterY: 2400,
            themeTint: "rgba(35, 125, 95, 0.24)",
            arenaBorderColor: "#5cc995",
            mobTemplateId: "desolate_thunder_dragon",
            mobName: "Thượng Cổ Hoang Thú & Hậu Duệ Cổ Tiên Hắc Phàm",
            mobIsHuman: true,
            targetKills: 17,
            bossTemplateId: "desolate_thunder_dragon",
            bossName: "Bá Tiên Sở Độ (Thất Chuyển Đỉnh Phong Bắc Nguyên)",
            bossIsHuman: true,
            bossSkinKey: "hac_lau_lan",
            bossKillerMove: "Thất Chuyển Tiên Đạo Sát Chiêu: Nội Cảnh Phá Không Thần Quyền",
            bossAttackGu: "Vạn Ngã Tiên Cổ Thất Chuyển",
            bossDefGu: "Hoàng Kim Chung Cổ Thất Chuyển",
            rewardStones: 880,
            rewardMerit: 500,
            rewardHumanQi: 65,
            dropPreview: "Tiên Nguyên Thạch (x2), Đãng Hồn Thạch Đan (x2)",
            drops: [
                { itemId: "immortal_stone", count: 2, chance: 0.90 },
                { itemId: "soul_crystal", count: 2, chance: 0.85 }
            ],
            description: "[Thất Chuyển Tiên Cảnh] Tiến vào Hắc Phàm Động Thiên kế thừa Thời Gian Đạo chân truyền và giao chiến cùng Bá Tiên Sở Độ!"
        },
        {
            id: "stage_21",
            order: 21,
            name: "Ải 21: Bí Cảnh Nghịch Lưu Hà — Chứng Đạo Nghịch Lưu Hà Chi Chủ",
            icon: "🌊",
            regionName: "Bắc Nguyên (Thất Chuyển Đỉnh Phong)",
            reqRank: 7,
            prevStageId: "stage_20",
            arenaCenterX: 2400,
            arenaCenterY: 2400,
            themeTint: "rgba(45, 165, 195, 0.28)",
            arenaBorderColor: "#4ce6ff",
            mobTemplateId: "desolate_thunder_dragon",
            mobName: "Thượng Cổ Hoang Thú Nghịch Lưu & Trường Sinh Thiên Tiên Sứ",
            mobIsHuman: true,
            targetKills: 18,
            bossTemplateId: "desolate_thunder_dragon",
            bossName: "Phượng Cửu Ca & Ảnh Vô Tà (Thất Chuyển Chiến Lực Bát Chuyển)",
            bossIsHuman: true,
            bossSkinKey: "phuong_cuu_ca",
            bossKillerMove: "Tiên Đạo Chí Cao Sát Chiêu: Ngọc Thanh Tích Phong • Mệnh Ca",
            bossAttackGu: "Thiên Phong Kiếm Vũ Cổ Thất Chuyển",
            bossDefGu: "Thiên Nguyên Bảo Liên Thất Chuyển",
            rewardStones: 1100,
            rewardMerit: 600,
            rewardHumanQi: 75,
            dropPreview: "Tiên Nguyên Thạch (x3), Đãng Hồn Thạch Đan (x3)",
            drops: [
                { itemId: "immortal_stone", count: 3, chance: 0.95 },
                { itemId: "soul_crystal", count: 3, chance: 0.90 }
            ],
            description: "[Thất Chuyển Đỉnh Phong] Một trong Tam Đại Bí Cảnh Thiên Địa! Đối đầu Phượng Cửu Ca trên dòng sông Nghịch Lưu để luyện thành Nghịch Lưu Hộ Thân Ấn!"
        },

        // ==================== BÁT CHUYỂN TIÊN CẢNH (RANK 8: ẢI 22 -> 24) ====================
        {
            id: "stage_22",
            order: 22,
            name: "Ải 22: Quang Âm Trường Hà — Thạch Liên Đảo Đại Chiến Bát Chuyển",
            icon: "⏳",
            regionName: "Quang Âm Trường Hà (Bát Chuyển Tiên Cảnh)",
            reqRank: 8,
            prevStageId: "stage_21",
            arenaCenterX: 2400,
            arenaCenterY: 2400,
            themeTint: "rgba(240, 195, 65, 0.26)",
            arenaBorderColor: "#f2d16b",
            mobTemplateId: "desolate_thunder_dragon",
            mobName: "Thái Cổ Niên Thú & Tiên Cổ Ốc Thiên Đình (Bát Chuyển)",
            mobIsHuman: false,
            targetKills: 18,
            bossTemplateId: "desolate_thunder_dragon",
            bossName: "Tử Vi Tiên Tử & Hạ Tra (Đại Năng Bát Chuyển Thiên Đình)",
            bossIsHuman: true,
            bossSkinKey: "tinh_tu",
            bossKillerMove: "Bát Chuyển Tiên Đạo Sát Chiêu: Tinh Tượng Kỳ Cục • Xuân Hạ Thu Đông",
            bossAttackGu: "Trí Tuệ Cổ Bát Chuyển",
            bossDefGu: "Hoàng Kim Chung Cổ Bát Chuyển",
            rewardStones: 1500,
            rewardMerit: 800,
            rewardHumanQi: 90,
            dropPreview: "Tiên Nguyên Thạch (x4), Mở khóa Chân Truyền Hồng Liên Ma Tôn",
            drops: [
                { itemId: "immortal_stone", count: 4, chance: 1.0 },
                { itemId: "soul_crystal", count: 3, chance: 0.90 }
            ],
            description: "[Bát Chuyển Tiên Cảnh] Sát chiêu Lục Chuyển gần như vô tác dụng trước đạo ngân Bát Chuyển! Hãy thăng Cổ Trùng lên Thất - Bát Chuyển để phá vòng vây Tử Vi Tiên Tử!"
        },
        {
            id: "stage_23",
            order: 23,
            name: "Ải 23: Đông Hải Long Cung — Quần Tiên Tranh Đoạt Tiên Cổ Ốc Bát Chuyển",
            icon: "🐉",
            regionName: "Đông Hải (Bát Chuyển Tiên Cảnh)",
            reqRank: 8,
            prevStageId: "stage_22",
            arenaCenterX: 2400,
            arenaCenterY: 2400,
            themeTint: "rgba(35, 110, 195, 0.26)",
            arenaBorderColor: "#3b8beb",
            mobTemplateId: "desolate_thunder_dragon",
            mobName: "Thái Cổ Hoang Thú Giao Long & Cổ Tiên Bát Chuyển Đông Hải",
            mobIsHuman: true,
            targetKills: 19,
            bossTemplateId: "desolate_thunder_dragon",
            bossName: "Tuyết Hồ Lão Tổ & Long Công Phân Thân (Bát Chuyển Đỉnh Phong)",
            bossIsHuman: true,
            bossSkinKey: "bach_ngung_bang",
            bossKillerMove: "Bát Chuyển Tiên Đạo Sát Chiêu: Vạn Tuyết Băng Thiên • Mộng Cảnh Luân Hồi",
            bossAttackGu: "Băng Tinh Tuyết Hoa Cổ Bát Chuyển",
            bossDefGu: "Hoàng Kim Chung Cổ Bát Chuyển",
            rewardStones: 1950,
            rewardMerit: 1050,
            rewardHumanQi: 110,
            dropPreview: "Tiên Nguyên Thạch (x5), Đãng Hồn Thạch Đan (x4)",
            drops: [
                { itemId: "immortal_stone", count: 5, chance: 1.0 },
                { itemId: "soul_crystal", count: 4, chance: 1.0 }
            ],
            description: "[Bát Chuyển Đỉnh Phong] Tứ đại Bát Chuyển Đông Hải cùng Thiên Đình và Tuyết Hồ Lão Tổ đại chiến dưới đáy biển tranh đoạt Bát Chuyển Tiên Cổ Ốc Long Cung!"
        },
        {
            id: "stage_24",
            order: 24,
            name: "Ải 24: Thiên Đình Trung Châu — Túc Mệnh Đại Chiến Đỉnh Phong",
            icon: "⚡",
            regionName: "Trung Châu Thiên Đình (Bát Chuyển Cực Hạn)",
            reqRank: 8,
            prevStageId: "stage_23",
            arenaCenterX: 2400,
            arenaCenterY: 2400,
            themeTint: "rgba(215, 165, 35, 0.26)",
            arenaBorderColor: "#ffd700",
            mobTemplateId: "desolate_thunder_dragon",
            mobName: "Chư Tiên Thiên Đình & Hộ Vệ Giám Thiên Tháp (Bát Chuyển)",
            mobIsHuman: true,
            targetKills: 20,
            bossTemplateId: "desolate_thunder_dragon",
            bossName: "Long Công (Á Tiên Tôn Bát Chuyển Đỉnh Phong — Hộ Đạo Nhân Thiên Đình)",
            bossIsHuman: true,
            bossSkinKey: "hong_lien",
            bossKillerMove: "Á Tiên Tôn Tuyệt Kỹ: Nhất Khí Tam Thanh • Long Ngự Thượng Tân",
            bossAttackGu: "Thái Cổ Giao Long Lực Cổ Bát Chuyển",
            bossDefGu: "Hoàng Kim Chung Cổ Bát Chuyển",
            rewardStones: 2800,
            rewardMerit: 1500,
            rewardHumanQi: 150,
            dropPreview: "Tiên Nguyên Thạch (x8), Phá Hủy Túc Mệnh Cổ — Mở Đường Vào Tầng Chín Phong Ma Quật!",
            drops: [
                { itemId: "immortal_stone", count: 8, chance: 1.0 },
                { itemId: "soul_crystal", count: 5, chance: 1.0 }
            ],
            description: "[Bát Chuyển Á Tiên Tôn] Ngũ Vực Cổ Tiên hội tụ đánh thẳng vào Bạch Ngọc Kinh Thiên Đình! Đánh bại Long Công và nghiền nát Túc Mệnh Cổ!"
        },

        // ==================== CỬU CHUYỂN TÔN GIẢ CẢNH (RANK 9: ẢI 25) ====================
        {
            id: "stage_25",
            order: 25,
            name: "Ải 25: Tầng Chín Phong Ma Quật — Độc Chiến Song Tôn (Cửu Chuyển)",
            icon: "👑",
            regionName: "Tầng Chín Phong Ma Quật (Cửu Chuyển Tôn Giả Cảnh)",
            reqRank: 9,
            prevStageId: "stage_24",
            arenaCenterX: 2400,
            arenaCenterY: 2400,
            themeTint: "rgba(155, 35, 225, 0.28)",
            arenaBorderColor: "#00e5ff",
            mobTemplateId: "desolate_thunder_dragon",
            mobName: "Thái Cổ Truyền Kỳ Hoang Thú & Á Tiên Tôn Thủ Trận (Bát Chuyển)",
            mobIsHuman: true,
            targetKills: 20,
            bossTemplateId: "desolate_thunder_dragon",
            bossName: "Tinh Tú Tiên Tôn & Cự Dương Tiên Tôn (Song Tôn Cửu Chuyển Vây Công)",
            bossIsHuman: true,
            bossSkinKey: "tinh_tu",
            bossKillerMove: "Cửu Chuyển Sát Chiêu: Tinh Tượng Vô Cực • Chúng Sinh Thiên Địa Ngã Cư Trung",
            bossAttackGu: "Trí Tuệ Cổ Cửu Chuyển & Kiếp Vận Đàn Cửu Chuyển",
            bossDefGu: "Cửu Chuyển Sát Chiêu: Tâm Cảnh Chúng Sinh & Hoàng Kim Bất Bại Kim Thân",
            venerableBosses: [
                {
                    name: "Tinh Tú Tiên Tôn (Cửu Chuyển Trí Đạo & Tinh Đạo Tôn Giả)",
                    skinKey: "tinh_tu",
                    projectileColor: "#4ce6ff",
                    defGuName: "Cửu Chuyển Sát Chiêu: Tâm Cảnh Chúng Sinh Thiên Địa Lung",
                    moveGuName: "Tinh Tiêu Không Gian Dịch Chuyển Cửu Chuyển",
                    guLoadout: [
                        "Trí Tuệ Cổ Cửu Chuyển",
                        "Tinh Mâu Tiên Cổ Cửu Chuyển",
                        "Thiên Cơ Tiên Cổ Cửu Chuyển",
                        "Tinh Tú Kỳ Bàn Cổ Cửu Chuyển",
                        "Huyền Quang Tinh Trận Cổ Cửu Chuyển",
                        "Tâm Cảnh Mộng Đạo Tiên Cổ Cửu Chuyển"
                    ],
                    killerMoveList: [
                        "Cửu Chuyển Sát Chiêu: Phồn Tinh Toán Tẫn Vạn Vật Trận",
                        "Cửu Chuyển Sát Chiêu: Thất Sát Hồng Quang • Tinh Hà Khuynh Phúc",
                        "Cửu Chuyển Sát Chiêu: Thiên Đình Tinh Tượng Vô Cực Kiếp",
                        "Cửu Chuyển Sát Chiêu: Tam Đạo Thần Niệm Vô Bờ Bến",
                        "Cửu Chuyển Sát Chiêu: Tinh Vân Ma Bàn Nghiền Nát Càn Khôn"
                    ]
                },
                {
                    name: "Cự Dương Tiên Tôn (Cửu Chuyển Vận Đạo & Huyết Đạo Tôn Giả)",
                    skinKey: "hong_lien",
                    projectileColor: "#ffd700",
                    defGuName: "Cửu Chuyển Sát Chiêu: Hoàng Kim Khí Vận Bất Bại Kim Thân",
                    moveGuName: "Kim Quang Hồng Vận Độn Pháp Cửu Chuyển",
                    guLoadout: [
                        "Kiếp Vận Đàn Cửu Chuyển",
                        "Huyết Bản Mệnh Tiên Cổ Cửu Chuyển",
                        "Thiên Địa Vận Tiên Cổ Cửu Chuyển",
                        "Càn Khôn Tinh Hải Cổ Cửu Chuyển",
                        "Chân Dương Lâu Chủ Ấn Cửu Chuyển",
                        "Chúng Sinh Vận Tiên Cổ Cửu Chuyển"
                    ],
                    killerMoveList: [
                        "Cửu Chuyển Sát Chiêu: Chúng Sinh Thiên Địa Ngã Cư Trung",
                        "Cửu Chuyển Sát Chiêu: Vạn Lưu Huyết Hà • Kim Quang Trảm Tiên",
                        "Cửu Chuyển Sát Chiêu: Khí Vận Phản Phệ Vô Thượng Kiếp",
                        "Cửu Chuyển Sát Chiêu: Hoàng Kim Lưu Quang Khí Vận Trảm",
                        "Cửu Chuyển Sát Chiêu: Huyết Hải Vô Biên • Vạn Kiếp Bất Phục"
                    ]
                }
            ],
            rewardStones: 8000,
            rewardMerit: 5000,
            rewardHumanQi: 500,
            dropPreview: "Tiên Nguyên Thạch (x20), Thành Tựu Luyện Thiên Ma Tôn / Đại Ái Tiên Tôn Độc Bá Vạn Cổ!",
            drops: [
                { itemId: "immortal_stone", count: 20, chance: 1.0 },
                { itemId: "soul_crystal", count: 12, chance: 1.0 }
            ],
            description: "[Cửu Chuyển Tôn Giả Chiến] Giữa Vô Cực Hỗn Độn Đại Trận tại Tầng Chín Phong Ma Quật, Tinh Tú Tiên Tôn và Cự Dương Tiên Tôn liên thủ vây sát ngươi bằng 12 Tiên Cổ Cửu Chuyển, 10 Sát Chiêu Cửu Chuyển, Khóa Sát Thương Vạn Pháp Bất Xâm và Niết Bàn Trọng Sinh!"
        }
    ];

    // =========================================================================
    // 2. LỚP LÕI ĐIỀU PHỐI TRÒ CHƠI (CLASS GAMEENGINE)
    // =========================================================================

    class GameEngine {
        constructor() {
            this.aperture = new global.ApertureSystem();
            this.player = new global.PlayerManager(this.aperture);
            this.map = new global.MapManager();
            this.guSystem = new global.GuSystem();
            this.combat = new global.CombatSystem();
            this.enemies = new global.EnemyManager();
            this.ui = new global.UIManager();

            this.canvas = null;
            this.ctx = null;
            this.ritualCanvas = null;
            this.ritualCtx = null;
            this.minimapCanvas = null;
            this.minimapCtx = null;

            this.isRunning = false;
            this.currentScreen = "creation";
            this.lastFrameTime = performance.now();
            this.hudRefreshTimer = 0;
            this.autoSaveTimer = 60;
            this.reinforcementTimer = 14;

            this.stageClears = {};
            this.claimedInheritances = [];
            this.activeStage = null;

            this.input = {
                up: false,
                down: false,
                left: false,
                right: false,
                sprint: false,
                mouseX: 0,
                mouseY: 0,
                mouseWorldX: 2400,
                mouseWorldY: 2400
            };

            this.nearestInteractTarget = null;
        }

        // =====================================================================
        // 3. KHỞI TẠO TOÀN BỘ DỰ ÁN KHI TẢI TRANG
        // =====================================================================

        init() {
            this.canvas = document.getElementById("gameCanvas");
            if (this.canvas) this.ctx = this.canvas.getContext("2d");

            this.ritualCanvas = document.getElementById("ritualCanvas");
            if (this.ritualCanvas) this.ritualCtx = this.ritualCanvas.getContext("2d");

            this.minimapCanvas = document.getElementById("minimapCanvas");
            if (this.minimapCanvas) this.minimapCtx = this.minimapCanvas.getContext("2d");

            const systemsBundle = {
                game: this,
                aperture: this.aperture,
                player: this.player,
                map: this.map,
                guSystem: this.guSystem,
                combat: this.combat,
                enemies: this.enemies,
                ui: this.ui
            };

            if (typeof this.aperture.init === "function") {
                this.aperture.init(systemsBundle);
            }
            this.combat.init(systemsBundle);
            this.enemies.init(systemsBundle);
            this.ui.init(systemsBundle);

            this._hookEnemyDeathForStageProgression();

            this._handleResize();
            window.addEventListener("resize", () => this._handleResize());
            this._bindKeyboardAndMouseEvents();

            this.isRunning = true;
            this.lastFrameTime = performance.now();
            requestAnimationFrame((ts) => this._gameLoop(ts));
        }

        _handleResize() {
            if (!this.canvas) return;
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            if (this.map) {
                this.map.camera.width = this.canvas.width;
                this.map.camera.height = this.canvas.height;
            }
        }

        startNewGameFromRitual(playerName, originKey = "righteous_clan", regionKey = "nam_cuong", skinKey = "phuong_nguyen") {
            if (!this.aperture.isAwakened) {
                this.aperture.finalizeAwakening();
            }

            this.stageClears = {};
            this.claimedInheritances = [];
            this.activeStage = null;

            this.player.initializeNewCharacter(playerName, originKey, regionKey, skinKey);
            this.player.primevalStones = Math.max(15, Math.round(this.player.primevalStones * 0.55));

            this.guSystem.initializeStartingGu(this.aperture.vitalGuId, originKey);

            this.currentScreen = "hub";
            this.ui.showScreen("hub");

            this.ui.addLog(
                `🎉 Khai Khiếu hoàn tất! Đạo hiệu: ${this.player.name} [${this.player.getRegionName()} - ${this.player.getFactionOriginName()}], Tư chất: ${this.aperture.aptitude.gradeName} (${this.aperture.aptitude.maxSeaPercent}% Biển Nguyên).`,
                "cultivation"
            );
            this.ui.addLog(
                "💡 Lưu ý tu luyện: Mọi Cổ Trùng hiện đều có thể Thăng Chuyển trực tiếp (1 -> 9 Chuyển). Ở Ải 25 (Phong Ma Quật Cửu Chuyển), bạn sẽ phải độc chiến cùng lúc 2 vị Tôn Giả Cửu Chuyển bất tử!",
                "system"
            );

            this.saveGame(1, true);
        }

        // =====================================================================
        // 4. QUẢN LÝ HỆ THỐNG 25 BẢN ĐỒ VƯỢT ẢI & ĐỘC CHIẾN SONG TÔN CỬU CHUYỂN
        // =====================================================================

        getStageCatalog() {
            return STAGE_CATALOG;
        }

        getStageClearCount(stageId) {
            return this.stageClears[stageId] || 0;
        }

        getStageRepeatFactor(stageId) {
            const prevClears = this.getStageClearCount(stageId);
            if (prevClears <= 0) return 1.0;
            return Math.max(0.08, Number((0.22 / (1 + (prevClears - 1) * 0.15)).toFixed(2)));
        }

        isStageUnlocked(stageId) {
            const st = STAGE_CATALOG.find(s => s.id === stageId);
            if (!st) return { unlocked: false, reason: "Không tồn tại" };

            if (st.prevStageId && this.getStageClearCount(st.prevStageId) <= 0) {
                const prev = STAGE_CATALOG.find(s => s.id === st.prevStageId);
                return {
                    unlocked: false,
                    reason: `Cần vượt qua [${prev ? prev.name : "Ải trước"}]`
                };
            }

            if (this.aperture.rank < st.reqRank) {
                const rankLabel = global.GuSystem && global.GuSystem.getRankName
                    ? global.GuSystem.getRankName(st.reqRank)
                    : `${st.reqRank} Chuyển`;
                const suffix = st.reqRank >= 9 ? " Tôn Giả" : (st.reqRank >= 6 ? " Cổ Tiên" : "");
                return {
                    unlocked: false,
                    reason: `Yêu cầu đạt Cảnh giới ${rankLabel}${suffix}`
                };
            }

            return { unlocked: true };
        }

        enterStageBattle(stageId) {
            const st = STAGE_CATALOG.find(s => s.id === stageId);
            if (!st) return;

            const check = this.isStageUnlocked(stageId);
            if (!check.unlocked) {
                this.ui.addLog(`Không thể vào bản đồ: ${check.reason}!`, "warning");
                return;
            }

            const totalBossCount = Array.isArray(st.venerableBosses) && st.venerableBosses.length > 0
                ? st.venerableBosses.length
                : 1;

            this.activeStage = {
                ...st,
                kills: 0,
                bossSpawned: false,
                bossDefeated: false,
                bossTotalCount: totalBossCount,
                bossesRemaining: totalBossCount,
                bossEntityIds: []
            };

            if (this.map && typeof this.map.applyStageTheme === "function") {
                this.map.applyStageTheme(this.activeStage);
            }

            this.player.x = st.arenaCenterX;
            this.player.y = st.arenaCenterY;
            this.reinforcementTimer = 14;
            this.combat.reset();

            this._spawnStageMonsters(this.activeStage);

            this.currentScreen = "battle";
            this._handleResize();
            this.ui.showScreen("battle");
            this.ui.addLog(
                `⚔️ Đã tiến vào chiến trường 【${st.name}】! Hãy tiêu diệt ${st.targetKills} mục tiêu để dẫn dụ ${totalBossCount > 1 ? "Song Tôn Cửu Chuyển" : "Thủ Lĩnh"} 【${st.bossName}】 xuất hiện!`,
                "combat"
            );
        }

        _spawnStageMonsters(stage) {
            if (!this.enemies) return;
            this.enemies.beasts = [];

            if (!Array.isArray(this.enemies.npcs) || this.enemies.npcs.length === 0) {
                this.enemies._spawnInitialNpcs();
            }

            const livingNpcs = this.enemies.npcs.filter(n => !n.isDead);
            livingNpcs.forEach((npc) => {
                const pt = this.map
                    ? this.map.getRandomWalkablePoint(stage.arenaCenterX, stage.arenaCenterY, 220, 950)
                    : { x: stage.arenaCenterX + 320, y: stage.arenaCenterY + 320 };

                npc.x = pt.x;
                npc.y = pt.y;
                npc.homeX = pt.x;
                npc.homeY = pt.y;
                npc.targetX = pt.x;
                npc.targetY = pt.y;
                npc.isHostile = false;
                npc.lethalCombat = false;
            });

            // 1. Sinh Quái thường phân bố ngẫu nhiên khắp vùng chiến trường mở rộng
            const totalNormalMobs = stage.targetKills + 8;
            for (let i = 0; i < totalNormalMobs; i++) {
                const pt = this.map
                    ? this.map.getRandomWalkablePoint(stage.arenaCenterX, stage.arenaCenterY, 220, 1250)
                    : { x: stage.arenaCenterX + 300, y: stage.arenaCenterY + 300 };

                this._createStageEnemy(stage, pt.x, pt.y, false, false);
            }

            // 2. Sinh 4 Quái Tinh Anh (Elite)
            const eliteCount = 4;
            for (let e = 0; e < eliteCount; e++) {
                const pt = this.map
                    ? this.map.getRandomWalkablePoint(stage.arenaCenterX, stage.arenaCenterY, 350, 1180)
                    : { x: stage.arenaCenterX - 380, y: stage.arenaCenterY + 380 };

                this._createStageEnemy(stage, pt.x, pt.y, false, true);
            }
        }

        /**
         * Khởi tạo thực thể Quái thường, Quái Tinh Anh (Elite), Thủ Lĩnh hoặc Tôn Giả Cửu Chuyển (customBossConfig)
         * QUAN TRỌNG: Quái thường và Tinh Anh ở Phong Ma Quật (Ải 25) chỉ giữ cấp Bát Chuyển (entityRank = 8) như cũ!
         * Chỉ riêng 2 vị Tôn Giả (isVenerableBoss = true) mới có entityRank = 9 và nhận đợt buff Song Tôn.
         */
        _createStageEnemy(stage, x, y, isStageBoss = false, isElite = false, customBossConfig = null) {
            const stageRank = stage.reqRank || 1;
            const stageOrder = stage.order || 1;
            const isVenerableBoss = Boolean(isStageBoss && stageRank >= 9);

            // Quái thường & Tinh Anh ở Phong Ma Quật giữ nguyên cấp 8 Chuyển (Không bị buff lên 9 Chuyển)
            const entityRank = isVenerableBoss ? 9 : Math.min(8, stageRank);

            const hpByRank = {
                1: 110,
                2: 310,
                3: 880,
                4: 2400,
                5: 6200,
                6: 18500,
                7: 78000,
                8: 460000,
                9: 38000000
            };
            const atkByRank = {
                1: 13,
                2: 30,
                3: 68,
                4: 155,
                5: 340,
                6: 760,
                7: 1850,
                8: 4400,
                9: 62000
            };
            const defByRank = {
                1: 6,
                2: 28,
                3: 78,
                4: 195,
                5: 460,
                6: 1150,
                7: 2600,
                8: 6200,
                9: 68000
            };

            const subOrderOffset = Math.max(0, (stageOrder - 1) % 3);
            const stageStepMult = 1 + subOrderOffset * 0.14;

            let hpMult = 1.0;
            if (isStageBoss) {
                hpMult = isVenerableBoss ? 7.4 : (entityRank === 8 ? 4.2 : (entityRank === 7 ? 3.5 : 3.0));
            } else if (isElite) {
                hpMult = 1.85;
            }

            const atkMult = isStageBoss ? (isVenerableBoss ? 2.35 : (entityRank >= 7 ? 1.55 : 1.40)) : (isElite ? 1.25 : 1.0);
            const defMult = isStageBoss ? (isVenerableBoss ? 2.0 : (entityRank >= 7 ? 1.45 : 1.28)) : (isElite ? 1.15 : 1.0);

            const baseHp = Math.round((hpByRank[entityRank] || 110) * stageStepMult * hpMult);
            const baseAtk = Math.round((atkByRank[entityRank] || 13) * stageStepMult * atkMult);
            const baseDef = Math.round((defByRank[entityRank] || 6) * defMult);

            const isHumanEntity = isStageBoss
                ? Boolean(stage.bossIsHuman || customBossConfig)
                : (isElite ? Boolean(stage.mobIsHuman || entityRank >= 4) : Boolean(stage.mobIsHuman));

            const customName = customBossConfig
                ? customBossConfig.name
                : (isStageBoss
                    ? stage.bossName
                    : (isElite ? `[Tinh Anh] ${stage.mobName}` : stage.mobName));

            const icons = { 1: "🐺", 2: "🐗", 3: "🦅", 4: "🐍", 5: "🦣", 6: "🐉", 7: "⚔️", 8: "👑", 9: "👑" };
            const skinPool = ["phuong_nguyen", "bach_ngung_bang", "phuong_cuu_ca", "hac_lau_lan", "hong_lien", "u_hon", "tinh_tu"];

            const initialShield = isVenerableBoss
                ? Math.round(baseHp * 0.40)
                : (isStageBoss && entityRank >= 6 ? Math.round(baseHp * 0.15) : 0);

            const entity = {
                id: `stage_mob_${Date.now()}_${Math.floor(Math.random() * 100000)}`,
                entityType: "beast",
                typeId: isStageBoss ? stage.bossTemplateId : stage.mobTemplateId,
                name: customName,
                title: isVenerableBoss
                    ? "Cửu Chuyển Vô Địch Tôn Giả"
                    : (isStageBoss
                        ? `Thủ Lĩnh ${entityRank} Chuyển`
                        : (isElite ? `Tinh Anh ${entityRank} Chuyển` : `Quái ${entityRank} Chuyển`)),
                icon: isStageBoss ? (isVenerableBoss ? "👑" : "👹") : (isElite ? "⚡" : (icons[entityRank] || "🐺")),
                rank: entityRank,
                isBoss: isStageBoss,
                isStageBoss: isStageBoss,
                isVenerable: isVenerableBoss,
                hasRevivedOnce: false,
                enraged: false,
                isElite: isElite,
                isHuman: isHumanEntity,
                skinKey: customBossConfig
                    ? customBossConfig.skinKey
                    : (isStageBoss
                        ? (stage.bossSkinKey || skinPool[stageOrder % skinPool.length])
                        : skinPool[(stageOrder + Math.floor(Math.random() * 5)) % skinPool.length]),
                killerMoveName: customBossConfig && customBossConfig.killerMoveList
                    ? customBossConfig.killerMoveList[0]
                    : (stage.bossKillerMove || `Sát Chiêu ${entityRank} Chuyển`),
                killerMoveList: customBossConfig && Array.isArray(customBossConfig.killerMoveList)
                    ? customBossConfig.killerMoveList
                    : null,
                guLoadout: customBossConfig && Array.isArray(customBossConfig.guLoadout)
                    ? customBossConfig.guLoadout
                    : null,
                attackGuName: customBossConfig && customBossConfig.guLoadout
                    ? customBossConfig.guLoadout[0]
                    : (stage.bossAttackGu || `Cổ Thuật ${entityRank} Chuyển`),
                defGuName: customBossConfig && customBossConfig.defGuName
                    ? customBossConfig.defGuName
                    : (stage.bossDefGu || `Hộ Thân Cổ ${entityRank} Chuyển`),
                moveGuName: customBossConfig && customBossConfig.moveGuName
                    ? customBossConfig.moveGuName
                    : (entityRank >= 6 ? "Định Tiên Du" : "Thanh Phong Luân Cổ"),
                x: x,
                y: y,
                spawnX: x,
                spawnY: y,
                radius: isVenerableBoss ? 26 : (isStageBoss ? 22 : (isElite ? 17 : 14)),
                hp: baseHp,
                maxHp: baseHp,
                shieldHp: initialShield,
                maxShieldHp: initialShield,
                atk: baseAtk,
                def: baseDef,
                spd: isVenerableBoss ? 182 : (isStageBoss ? (135 + entityRank * 3) : (isElite ? 126 : 116)),
                aggroRange: isVenerableBoss ? 1100 : (isStageBoss ? 680 : (isElite ? 420 : 340)),
                attackRange: (isStageBoss || isHumanEntity || isElite) ? (340 + entityRank * 18) : 48,
                rangedGuId: (isStageBoss || isHumanEntity || isElite) ? "phong_nhan_gu" : null,
                projectileColor: customBossConfig && customBossConfig.projectileColor
                    ? customBossConfig.projectileColor
                    : (isStageBoss ? "#ff5733" : (isElite ? "#c278ff" : "#5cc995")),
                color: customBossConfig && customBossConfig.projectileColor
                    ? customBossConfig.projectileColor
                    : (isStageBoss ? "#ff4d4d" : (isElite ? "#c278ff" : "#e0be77")),
                drops: [
                    {
                        itemId: "primeval_stone",
                        chance: isStageBoss ? 0.85 : (isElite ? 0.45 : 0.18),
                        min: 1,
                        max: isStageBoss ? Math.max(2, entityRank * 3) : (isElite ? Math.max(1, entityRank) : 1)
                    },
                    {
                        itemId: "ration_meat",
                        chance: isStageBoss ? 0.50 : 0.18,
                        min: 1,
                        max: 1
                    }
                ],
                aiState: isStageBoss ? "chase" : "patrol",
                patrolTargetX: x,
                patrolTargetY: y,
                patrolTimer: 1.5 + Math.random() * 3,
                attackCooldown: 0,
                guSkillCooldown: 1.0,
                defGuCooldown: 3.0,
                moveGuCooldown: 2.5,
                healGuCooldown: 5.0,
                killerMoveCooldown: isVenerableBoss ? 1.8 : 4.5,
                dashSkillCooldown: 4.0,
                slowTimer: 0,
                slowFactor: 1.0,
                calledAllies: false,
                isHostile: true,
                isDead: false,
                respawnTimer: 9999
            };

            this.enemies.beasts.push(entity);
            return entity;
        }

        _hookEnemyDeathForStageProgression() {
            const origHandleDeath = this.enemies._handleEntityDeath.bind(this.enemies);
            this.enemies._handleEntityDeath = (target, player, combatSystem) => {
                origHandleDeath(target, player, combatSystem);

                if (this.currentScreen !== "battle" || !this.activeStage) return;
                const st = this.activeStage;

                if (target.isStageBoss) {
                    st.bossesRemaining = Math.max(0, (st.bossesRemaining || 1) - 1);
                    if (st.bossesRemaining <= 0) {
                        st.bossDefeated = true;
                        this._completeActiveStage();
                    } else {
                        // Khi 1 Tôn Giả ngã xuống, vị Tôn Giả còn lại lập tức thôn phệ đạo ngân, hồi 35% HP + 50% Khiên và hóa Cuồng Bạo!
                        const survivingBosses = (this.enemies.beasts || []).filter(b => b.isStageBoss && !b.isDead);
                        for (const surv of survivingBosses) {
                            surv.enraged = true;
                            surv.hp = Math.min(surv.maxHp, surv.hp + Math.round(surv.maxHp * 0.35));
                            surv.shieldHp = Math.round(surv.maxHp * 0.50);
                            surv.maxShieldHp = surv.shieldHp;
                            this.combat.spawnFloatingText(
                                surv.x,
                                surv.y - 46,
                                `👑 THÔN PHỆ ĐẠO NGÂN — CUỒNG BẠO CỰC HẠN!`,
                                "#ff3b30"
                            );
                        }

                        this.combat.spawnFloatingText(
                            this.player.x,
                            this.player.y - 42,
                            `🔥 Đã đánh bại ${target.name}! Tôn Giả còn lại hóa Cuồng Bạo!`,
                            "#ffd700"
                        );
                        this.ui.addLog(
                            `🔥 Ngươi đã đánh bại 【${target.name}】! Nhưng vị Tôn Giả còn lại vừa thôn phệ đạo ngân Hỗn Độn, khôi phục 35% Sinh Mệnh + 50% Hộ Thuẫn và tiến vào trạng thái CUỒNG BẠO CỰC HẠN!`,
                            "danger"
                        );
                        this.ui.updateBattleHUD();
                    }
                    return;
                }

                if (target.entityType !== "beast") {
                    this.ui.updateBattleHUD();
                    return;
                }

                st.kills += target.isElite ? 2 : 1;

                if (!st.bossSpawned && st.kills >= st.targetKills) {
                    st.bossSpawned = true;
                    st.bossEntityIds = [];

                    if (Array.isArray(st.venerableBosses) && st.venerableBosses.length > 0) {
                        st.bossTotalCount = st.venerableBosses.length;
                        st.bossesRemaining = st.venerableBosses.length;

                        st.venerableBosses.forEach((vCfg, idx) => {
                            const angle = idx === 0 ? -Math.PI / 4 : (Math.PI * 3) / 4;
                            const bx = Math.max(260, Math.min(4540, Math.round(this.player.x + Math.cos(angle) * 280)));
                            const by = Math.max(260, Math.min(4540, Math.round(this.player.y + Math.sin(angle) * 280)));
                            const venBoss = this._createStageEnemy(st, bx, by, true, false, vCfg);
                            st.bossEntityIds.push(venBoss.id);
                        });

                        this.combat.spawnFloatingText(
                            this.player.x,
                            this.player.y - 46,
                            `👑 SONG TÔN CỬU CHUYỂN GIÁNG LÂM!`,
                            "#00e5ff"
                        );
                        this.ui.addLog(
                            `👑 Uy áp Cửu Chuyển chấn động Vô Cực Hỗn Độn Đại Trận! 【Tinh Tú Tiên Tôn】 và 【Cự Dương Tiên Tôn】 kết thành Song Tôn Liên Thủ Đại Trận vây công ngươi!`,
                            "danger"
                        );
                    } else {
                        st.bossTotalCount = 1;
                        st.bossesRemaining = 1;
                        const spawnAngle = Math.random() * Math.PI * 2;
                        const bx = Math.max(240, Math.min(4560, Math.round(this.player.x + Math.cos(spawnAngle) * 240)));
                        const by = Math.max(240, Math.min(4560, Math.round(this.player.y + Math.sin(spawnAngle) * 240)));

                        const boss = this._createStageEnemy(st, bx, by, true, false);
                        st.bossEntityIds.push(boss.id);

                        this.combat.spawnFloatingText(this.player.x, this.player.y - 40, `⚠️ ${st.bossName} Giáng Lâm!`, "#ff4d4d");
                        this.ui.addLog(
                            `⚠️ Thủ lĩnh 【${st.bossName}】 (${boss.isHuman ? "Tinh thông Cổ Thuật & Sát Chiêu" : "Hung Thú Bá Chủ"}) đã xuất hiện cách ngươi không xa!`,
                            "danger"
                        );
                    }
                }

                this.ui.updateBattleHUD();
            };
        }

        _completeActiveStage() {
            const st = this.activeStage;
            if (!st) return;

            const prevClears = this.stageClears[st.id] || 0;
            const isFirstClear = prevClears === 0;
            const repeatFactor = this.getStageRepeatFactor(st.id);
            this.stageClears[st.id] = prevClears + 1;

            const actualStones = isFirstClear
                ? st.rewardStones
                : Math.max(1, Math.round(st.rewardStones * repeatFactor));

            const actualMerit = isFirstClear
                ? st.rewardMerit
                : Math.max(1, Math.round(st.rewardMerit * repeatFactor));

            const actualHumanQi = isFirstClear
                ? st.rewardHumanQi
                : (Math.random() < 0.20 ? 1 : 0);

            this.player.primevalStones += actualStones;
            this.player.meritPoints = (this.player.meritPoints || 0) + actualMerit;
            this.aperture.humanQi += actualHumanQi;

            const obtainedItems = [];
            if (Array.isArray(st.drops)) {
                for (const d of st.drops) {
                    const effectiveChance = isFirstClear ? d.chance : d.chance * 0.35;
                    if (Math.random() <= effectiveChance) {
                        this.player.addItem(d.itemId, d.count || 1);
                        const meta = global.PlayerManager.ITEM_DATABASE[d.itemId] || { name: d.itemId, icon: "📦" };
                        obtainedItems.push(`${d.count || 1}x ${meta.icon} ${meta.name}`);
                    }
                }
            }

            this.player.heal(Math.round(this.player.maxHp * 0.45));

            const clearTypeLabel = isFirstClear
                ? `<span style="color:#ffd700">[Thưởng Vượt Ải Lần Đầu 100%]</span>`
                : `<span class="sub-text">[Thưởng Cày Lại Lần ${prevClears + 1} (${Math.round(repeatFactor * 100)}%)]</span>`;

            const summaryHtml = `
                <p>Chúc mừng đạo hữu đã đánh bại <strong>${st.bossName}</strong> tại <strong>${st.name}</strong>! ${clearTypeLabel}</p>
                <div class="info-list mt-10">
                    <div class="info-row"><span>💎 Nguyên Thạch thu được:</span> <strong class="highlight-gold">+${actualStones}</strong></div>
                    <div class="info-row"><span>🏅 Điểm Cống Hiến Thế Lực:</span> <strong class="highlight-gold">+${actualMerit}</strong></div>
                    <div class="info-row"><span>☯ Nhân Khí tích lũy:</span> <strong class="highlight-gold">+${actualHumanQi}</strong></div>
                    <div class="info-row"><span>🎁 Chiến lợi phẩm rơi ra:</span> <strong style="color:#5cc995">${obtainedItems.length ? obtainedItems.join(", ") : "Không rơi thêm bảo vật hiếm"}</strong></div>
                </div>
            `;

            this.ui.addLog(
                `🏆 Vượt ải 【${st.name}】 (${isFirstClear ? "Lần đầu" : "Cày lại"}): +${actualStones} Nguyên Thạch, +${actualMerit} Cống Hiến, +${actualHumanQi} Nhân Khí.`,
                "loot"
            );

            this.saveGame(1, true);
            this.ui.updateBattleHUD();
            this.ui.showStageVictoryModal(st, summaryHtml);
        }

        retreatToHub() {
            this.activeStage = null;
            this.combat.reset();
            this.currentScreen = "hub";
            if (this.ui.dom.stageVictoryModal) {
                this.ui.dom.stageVictoryModal.classList.add("hidden");
            }
            if (typeof this.ui.closeNpcInteractionModal === "function") {
                this.ui.closeNpcInteractionModal();
            }
            this.ui.showScreen("hub");
        }

        // =====================================================================
        // 5. KẾ THỪA CHÂN TRUYỀN THƯỢNG CỔ
        // =====================================================================

        isInheritanceClaimed(inhId) {
            return this.claimedInheritances.includes(inhId);
        }

        claimInheritance(inh) {
            if (!inh || this.isInheritanceClaimed(inh.id)) return;

            this.claimedInheritances.push(inh.id);
            const stoneGrant = Math.max(15, Math.round((inh.rewardStones || 40) * 0.45));
            this.player.primevalStones += stoneGrant;

            if (inh.rewardItemId) {
                this.player.addItem(inh.rewardItemId, 1);
            }
            if (inh.rewardGuId) {
                this.guSystem.addGuToStorage(inh.rewardGuId, {
                    rank: inh.rewardGuRank || inh.reqRank || 1,
                    isRefined: true,
                    refinementProgress: 100,
                    isVital: false
                });
            }
            if (inh.rewardDaoPath && inh.rewardDaoMarks) {
                this.player.addDaoMarks(inh.rewardDaoPath, inh.rewardDaoMarks);
            }

            this.ui.addLog(
                `🕯️ Đã kế thừa 【${inh.name}】! Nhận Cổ Trùng truyền thừa, +${stoneGrant} Nguyên Thạch và +${inh.rewardDaoMarks} Đạo Ngân ${inh.rewardDaoPath}!`,
                "cultivation"
            );
            this.saveGame(1, true);
        }

        // =====================================================================
        // 6. ĐIỀU KHIỂN BÀN PHÍM & CHUỘT TRONG MÀN HÌNH CHIẾN ĐẤU 2D
        // =====================================================================

        _bindKeyboardAndMouseEvents() {
            window.addEventListener("mousemove", (e) => {
                this.input.mouseX = e.clientX;
                this.input.mouseY = e.clientY;
                if (this.map) {
                    this.input.mouseWorldX = e.clientX + this.map.camera.x;
                    this.input.mouseWorldY = e.clientY + this.map.camera.y;
                }
            });

            if (this.canvas) {
                this.canvas.addEventListener("mousedown", (e) => {
                    if (this.currentScreen !== "battle") return;
                    if (e.button === 0 && this.map) {
                        this.input.mouseWorldX = e.clientX + this.map.camera.x;
                        this.input.mouseWorldY = e.clientY + this.map.camera.y;
                    }
                });
            }

            window.addEventListener("keydown", (e) => {
                const tag = document.activeElement ? document.activeElement.tagName.toLowerCase() : "";
                if (tag === "input" || tag === "select" || tag === "textarea") return;

                if (this.currentScreen !== "battle") return;

                const code = e.code;

                if (code === "Escape") {
                    e.preventDefault();
                    if (this.ui && this.ui.activeInteractingNpc) {
                        this.ui.closeNpcInteractionModal();
                        return;
                    }
                    this.retreatToHub();
                    return;
                }

                if (code === "KeyW" || code === "ArrowUp") this.input.up = true;
                if (code === "KeyS" || code === "ArrowDown") this.input.down = true;
                if (code === "KeyA" || code === "ArrowLeft") this.input.left = true;
                if (code === "KeyD" || code === "ArrowRight") this.input.right = true;
                if (code === "ShiftLeft" || code === "ShiftRight") this.input.sprint = true;

                if (code === "KeyE" && !e.repeat) {
                    e.preventDefault();
                    this._handleInteractKeyInBattle();
                    return;
                }

                if (code >= "Digit1" && code <= "Digit8" && !e.repeat) {
                    const slotIdx = parseInt(code.replace("Digit", ""), 10) - 1;
                    this.combat.activateGuSlot(slotIdx, this.input.mouseWorldX, this.input.mouseWorldY);
                    return;
                }

                if (this.ui.keybindMode === "hybrid" && !e.repeat) {
                    if (code === "KeyQ") this.combat.activateGuSlot(0, this.input.mouseWorldX, this.input.mouseWorldY);
                    if (code === "KeyR") this.combat.activateGuSlot(2, this.input.mouseWorldX, this.input.mouseWorldY);
                    if (code === "KeyT") this.combat.activateGuSlot(3, this.input.mouseWorldX, this.input.mouseWorldY);
                    if (code === "KeyF") this.combat.activateGuSlot(7, this.input.mouseWorldX, this.input.mouseWorldY);
                }

                if (!e.repeat) {
                    if (code === "KeyZ") this.combat.activateKillerMoveSlot(0, this.input.mouseWorldX, this.input.mouseWorldY);
                    if (code === "KeyX") this.combat.activateKillerMoveSlot(1, this.input.mouseWorldX, this.input.mouseWorldY);
                    if (code === "KeyC") this.combat.activateKillerMoveSlot(2, this.input.mouseWorldX, this.input.mouseWorldY);
                    if (code === "KeyV") this.combat.activateKillerMoveSlot(3, this.input.mouseWorldX, this.input.mouseWorldY);
                }
            });

            window.addEventListener("keyup", (e) => {
                const code = e.code;
                if (code === "KeyW" || code === "ArrowUp") this.input.up = false;
                if (code === "KeyS" || code === "ArrowDown") this.input.down = false;
                if (code === "KeyA" || code === "ArrowLeft") this.input.left = false;
                if (code === "KeyD" || code === "ArrowRight") this.input.right = false;
                if (code === "ShiftLeft" || code === "ShiftRight") this.input.sprint = false;
            });
        }

        _handleInteractKeyInBattle() {
            const nearNpc = this.enemies
                ? this.enemies.getNearestInteractableNpc(this.player.x, this.player.y, 58)
                : null;
            const nearNode = this.map
                ? this.map.getNearestInteractableNode(this.player.x, this.player.y, 58)
                : null;

            const distNpc = nearNpc ? Math.hypot(nearNpc.x - this.player.x, nearNpc.y - this.player.y) : Infinity;
            const distNode = nearNode ? Math.hypot(nearNode.x - this.player.x, nearNode.y - this.player.y) : Infinity;

            if (nearNpc && distNpc <= distNode) {
                if (this.ui && typeof this.ui.openNpcInteractionModal === "function") {
                    this.ui.openNpcInteractionModal(nearNpc);
                }
                return;
            }

            if (!nearNode) return;

            const res = this.map.harvestNode(nearNode.id, this.player, this.guSystem);
            this.ui.addLog(res.message, res.success ? "loot" : "warning");
            if (res.success) {
                this.combat.spawnFloatingText(
                    nearNode.x,
                    nearNode.y - 20,
                    nearNode.isWildGu ? "Bắt Cổ Hoang Dã!" : `+${res.amount} Cổ Tài`,
                    "#5cc995"
                );
                if (!nearNode.isWildGu && this.enemies) {
                    this.enemies.notifyQuestProgress("harvest_node", 1);
                }
            }
            this.ui.updateBattleHUD();
        }

        // =====================================================================
        // 7. VÒNG LẶP TRÒ CHƠI CHÍNH (60 FPS) & CHI VIỆN QUÁI ĐỘNG
        // =====================================================================

        _gameLoop(timestamp) {
            if (!this.isRunning) return;

            const rawDt = (timestamp - this.lastFrameTime) / 1000;
            const dt = Math.min(0.1, Math.max(0.001, rawDt));
            this.lastFrameTime = timestamp;

            if (this.currentScreen === "creation") {
                this.aperture.ritualState.animTick += dt;
                if (this.ritualCtx) {
                    this.aperture.renderRitualCanvas(this.ritualCtx);
                }
                if (this.ui && this.ui.dom.creationSkinCanvas) {
                    this.ui.renderCreationSkinPreview();
                }
            } else if (this.currentScreen === "hub") {
                this._updateHubState(dt);
            } else if (this.currentScreen === "battle") {
                this._updateBattleState(dt);
                this._renderBattleArena();
            }

            requestAnimationFrame((ts) => this._gameLoop(ts));
        }

        _updateHubState(dt) {
            this.aperture.update(dt, this.player);
            if (this.player.hp < this.player.maxHp) {
                this.player.hp = Math.min(this.player.maxHp, this.player.hp + 2.5 * dt);
            }
            if (this.player.mental < this.player.maxMental) {
                this.player.mental = Math.min(this.player.maxMental, this.player.mental + 2.0 * dt);
            }

            this.hudRefreshTimer += dt;
            if (this.hudRefreshTimer >= 0.25) {
                this.hudRefreshTimer = 0;
                this.ui.updateHubTopbar();
                if (this.ui.activeHubTab === "tab-aperture") {
                    if (this.ui.dom.apertureCanvas) {
                        this.aperture.renderApertureCanvas(this.ui.dom.apertureCanvas.getContext("2d"));
                    }
                    if (this.ui.dom.hubSkinCanvas && global.PlayerManager) {
                        global.PlayerManager.renderSkinPreview(this.ui.dom.hubSkinCanvas.getContext("2d"), this.player.skinId);
                    }
                }
            }

            this.autoSaveTimer -= dt;
            if (this.autoSaveTimer <= 0) {
                this.autoSaveTimer = 60;
                this.saveGame(1, true);
            }
        }

        _updateBattleState(dt) {
            if (this.map) {
                this.input.mouseWorldX = this.input.mouseX + this.map.camera.x;
                this.input.mouseWorldY = this.input.mouseY + this.map.camera.y;
            }

            this.aperture.update(dt, this.player);
            this.player.update(dt, this.input, this.map);

            if (this.player.hp <= 0) {
                this._handleBattleDefeat();
                return;
            }

            this.guSystem.update(dt);
            this.map.update(dt, this.player, this.canvas.width, this.canvas.height);
            this.enemies.update(dt, this.player, this.map, this.combat);
            this.combat.update(dt);

            if (this.activeStage && !this.activeStage.bossDefeated) {
                this.reinforcementTimer -= dt;
                if (this.reinforcementTimer <= 0) {
                    this.reinforcementTimer = 14;
                    const livingMobs = (this.enemies.beasts || []).filter(b => !b.isDead && !b.isStageBoss).length;
                    if (livingMobs < 10) {
                        for (let i = 0; i < 3; i++) {
                            const pt = this.map.getRandomWalkablePoint(
                                this.activeStage.arenaCenterX,
                                this.activeStage.arenaCenterY,
                                280,
                                1200
                            );
                            this._createStageEnemy(this.activeStage, pt.x, pt.y, false, i === 0);
                        }
                    }
                }
            }

            const nearNpc = this.enemies
                ? this.enemies.getNearestInteractableNpc(this.player.x, this.player.y, 58)
                : null;
            const nearNode = this.map
                ? this.map.getNearestInteractableNode(this.player.x, this.player.y, 58)
                : null;

            const distNpc = nearNpc ? Math.hypot(nearNpc.x - this.player.x, nearNpc.y - this.player.y) : Infinity;
            const distNode = nearNode ? Math.hypot(nearNode.x - this.player.x, nearNode.y - this.player.y) : Infinity;

            if (nearNpc && distNpc <= distNode) {
                this.ui.updateInteractionBanner(
                    `Nhấn <span class="key-badge">E</span> giao lưu với Cổ Sư <strong>🤝 ${nearNpc.name} (${nearNpc.rank} Chuyển)</strong>`
                );
            } else if (nearNode) {
                this.ui.updateInteractionBanner(
                    `Nhấn <span class="key-badge">E</span> thu thập <strong>${nearNode.icon} ${nearNode.name}</strong>`
                );
            } else {
                this.ui.updateInteractionBanner(null);
            }

            this.hudRefreshTimer += dt;
            if (this.hudRefreshTimer >= 0.15) {
                this.hudRefreshTimer = 0;
                this.ui.updateBattleHUD();
            }
        }

        _renderBattleArena() {
            if (!this.ctx || !this.canvas) return;

            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.map.renderWorld(this.ctx);

            if (this.activeStage) {
                if (this.activeStage.themeTint) {
                    this.ctx.fillStyle = this.activeStage.themeTint;
                    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                }
                const ax = this.activeStage.arenaCenterX - this.map.camera.x;
                const ay = this.activeStage.arenaCenterY - this.map.camera.y;
                const borderRadius = (this.map && this.map.arenaRadius) ? this.map.arenaRadius : 1350;

                this.ctx.save();
                this.ctx.beginPath();
                this.ctx.arc(ax, ay, borderRadius, 0, Math.PI * 2);
                this.ctx.strokeStyle = this.activeStage.arenaBorderColor || "#b89758";
                this.ctx.lineWidth = 3.5;
                this.ctx.setLineDash([16, 10]);
                this.ctx.stroke();
                this.ctx.restore();
            }

            this.enemies.render(this.ctx, this.map.camera);
            this.player.render(this.ctx, this.map.camera);
            this.combat.render(this.ctx, this.map.camera);
            this.map.renderLightingAndWeather(this.ctx, this.player);

            if (this.minimapCtx) {
                this.map.renderMinimap(this.minimapCtx, this.player, this.enemies.beasts, this.enemies.npcs);
            }
        }

        _handleBattleDefeat() {
            this.player.hp = Math.round(this.player.maxHp * 0.4);
            this.ui.addLog(
                "⚠️ Ngươi bị trọng thương trước uy áp Vô Địch của Song Tôn Cửu Chuyển và buộc phải rút lui về Đại Bản Doanh! Hãy kết hợp Hộ Thuẫn Cửu Chuyển, Trị Liệu và Thân Pháp né Sát Chiêu.",
                "danger"
            );
            this.retreatToHub();
        }

        // =====================================================================
        // 8. HỆ THỐNG LƯU/TẢI 3 Ô (LOCALSTORAGE) & XUẤT/NHẬP FILE (.JSON)
        // =====================================================================

        _buildSavePayload() {
            return {
                gameTitle: "VAN_CO_TIEN_DO",
                version: "2.9.6",
                savedAt: new Date().toLocaleString("vi-VN"),
                playerName: this.player.name,
                realmName: this.aperture.getRealmDisplayName(),
                stageClears: this.stageClears,
                claimedInheritances: this.claimedInheritances,
                aperture: this.aperture.toSaveData(),
                player: this.player.toSaveData(),
                map: this.map.toSaveData(),
                guSystem: this.guSystem.toSaveData(),
                enemies: this.enemies.toSaveData()
            };
        }

        _applySavePayload(data) {
            if (!data || !data.aperture || !data.player) {
                throw new Error("Cấu trúc file lưu không hợp lệ!");
            }
            this.stageClears = data.stageClears || {};
            this.claimedInheritances = data.claimedInheritances || [];
            this.aperture.fromSaveData(data.aperture);
            this.player.fromSaveData(data.player);
            if (data.map) this.map.fromSaveData(data.map);
            if (data.guSystem) this.guSystem.fromSaveData(data.guSystem);
            if (data.enemies) this.enemies.fromSaveData(data.enemies);
            this.combat.reset();
        }

        saveGame(slotNum = 1, isAuto = false) {
            try {
                const payload = this._buildSavePayload();
                localStorage.setItem(`${SAVE_KEY_PREFIX}${slotNum}`, JSON.stringify(payload));
                if (!isAuto && this.ui) {
                    this.ui.addLog(`💾 Đã lưu tiến trình vào Ô Lưu ${slotNum} thành công!`, "system");
                }
                return true;
            } catch (err) {
                console.error("Lỗi khi lưu game:", err);
                return false;
            }
        }

        loadGame(slotNum = 1) {
            try {
                const raw = localStorage.getItem(`${SAVE_KEY_PREFIX}${slotNum}`);
                if (!raw) {
                    if (this.ui) this.ui.addLog(`Ô Lưu ${slotNum} hiện chưa có dữ liệu!`, "warning");
                    return false;
                }

                const data = JSON.parse(raw);
                this._applySavePayload(data);

                this.currentScreen = "hub";
                this.ui.showScreen("hub");
                this.ui.addLog(
                    `📂 Đã tải tiến trình từ Ô Lưu ${slotNum}: ${this.player.name} (${this.aperture.getRealmDisplayName()}).`,
                    "cultivation"
                );
                return true;
            } catch (err) {
                console.error("Lỗi khi tải game:", err);
                return false;
            }
        }

        exportSaveToFile() {
            try {
                const payload = this._buildSavePayload();
                const jsonString = JSON.stringify(payload, null, 2);
                const blob = new Blob([jsonString], { type: "application/json;charset=utf-8" });
                const url = URL.createObjectURL(blob);

                const safeName = (this.player.name || "CoSu")
                    .normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, "")
                    .replace(/[^a-zA-Z0-9_-]/g, "_");
                const fileName = `VanCoTienDo_${safeName}_Rank${this.aperture.rank}.json`;

                const a = document.createElement("a");
                a.href = url;
                a.download = fileName;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);

                if (this.ui) {
                    this.ui.addLog(`⬇️ Đã xuất file lưu trữ [${fileName}] về máy tính thành công!`, "loot");
                }
                return true;
            } catch (err) {
                console.error("Lỗi khi xuất file lưu:", err);
                if (this.ui) {
                    this.ui.addLog("Không thể xuất file lưu trữ!", "danger");
                }
                return false;
            }
        }

        importSaveFromFile(file) {
            if (!file) return;
            const reader = new FileReader();

            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    this._applySavePayload(data);

                    localStorage.setItem(`${SAVE_KEY_PREFIX}1`, JSON.stringify(data));

                    this.currentScreen = "hub";
                    this.ui.showScreen("hub");
                    this.ui.addLog(
                        `⬆️ Đã nhập file lưu [${file.name}] thành công! Chào mừng trở lại: ${this.player.name} (${this.aperture.getRealmDisplayName()}).`,
                        "cultivation"
                    );
                } catch (err) {
                    console.error("Lỗi đọc file lưu .json:", err);
                    alert("File .json không hợp lệ hoặc không đúng định dạng của Vạn Cổ Tiên Đồ!");
                }
            };

            reader.readAsText(file, "utf-8");
        }

        loadAnyExistingSave() {
            for (const slot of [1, 2, 3]) {
                if (localStorage.getItem(`${SAVE_KEY_PREFIX}${slot}`)) {
                    return this.loadGame(slot);
                }
            }
            return false;
        }

        getSaveSlotSummary(slotNum = 1) {
            try {
                const raw = localStorage.getItem(`${SAVE_KEY_PREFIX}${slotNum}`);
                if (!raw) return "Trống — Chưa có dữ liệu lưu trữ";
                const data = JSON.parse(raw);
                return `${data.playerName} | ${data.realmName} | Lưu lúc: ${data.savedAt}`;
            } catch (e) {
                return "Dữ liệu lỗi";
            }
        }

        clearAllSaves() {
            [1, 2, 3].forEach(slot => localStorage.removeItem(`${SAVE_KEY_PREFIX}${slot}`));
        }
    }

    global.GameEngine = GameEngine;

    window.addEventListener("DOMContentLoaded", () => {
        const engine = new GameEngine();
        engine.init();
        global.vanCoTienDoGame = engine;
    });

})(window);