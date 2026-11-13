/**
 * VẠN CỔ TIÊN ĐỒ - MODULE QUẢN LÝ NHÂN VẬT, SKIN PIXEL ART, NGŨ VỰC & MỘNG CẢNH (PlayerManager.js)
 * Quản lý:
 *  - 8 Skin Nhân Vật chuẩn nguyên tác Cổ Chân Nhân (Phương Nguyên, Bạch Ngưng Băng, Phượng Cửu Ca,
 *    Thương Tâm Từ, Hắc Lâu Lan, Hồng Liên Ma Tôn, U Hồn Ma Tôn, Tinh Tú Tiên Tôn) & Vẽ Pixel Art.
 *  - Ngũ Vực, 5 Thế Lực Xuất Thân, Điểm Cống Hiến, Xá Lợi Cổ 5 Chuyển & Tàn Phương.
 *  - 21 Lưu Phái Đạo Ngân, Cảnh Giới Lĩnh Ngộ, 7 Mộng Cảnh Thượng Cổ, Hành Trang & Chiến Đấu 2D.
 */

(function (global) {
    "use strict";

    // =========================================================================
    // 1. KHO NGOẠI HÌNH / SKIN NHÂN VẬT CHUẨN NGUYÊN TÁC (CHARACTER_SKINS)
    // =========================================================================

    const CHARACTER_SKINS = {
        phuong_nguyen: {
            id: "phuong_nguyen",
            name: "Cổ Nguyệt Phương Nguyên",
            title: "Luyện Thiên Ma Tôn / Đại Ái Tiên Tôn",
            robeColor: "#14171f",
            robeSecondary: "#232836",
            trimColor: "#8a1c1c",
            beltColor: "#b89758",
            hairColor: "#0a0b0e",
            hairStyle: "long_flowing",
            skinTone: "#ead0b3",
            eyeColor: "#050505",
            crownColor: "#63533b",
            auraColor: "rgba(224, 62, 62, 0.22)",
            weaponColor: "#e03e3e",
            particleColor: "#f2d16b",
            specialFeature: "spring_autumn_cicada",
            desc: "Trường bào đen tuyền, tóc đen dài xõa vai, đôi mắt sâu thẳm như cổ đàm năm trăm năm không gợn sóng."
        },
        bach_ngung_bang: {
            id: "bach_ngung_bang",
            name: "Bạch Ngưng Băng",
            title: "Bắc Minh Băng Phách Thể",
            robeColor: "#e6f2f8",
            robeSecondary: "#b8d8eb",
            trimColor: "#3b8beb",
            beltColor: "#4ce6ff",
            hairColor: "#f2f8ff",
            hairStyle: "silver_long",
            skinTone: "#f5e6d8",
            eyeColor: "#00c8ff",
            crownColor: "#85c1e9",
            auraColor: "rgba(133, 193, 233, 0.30)",
            weaponColor: "#85c1e9",
            particleColor: "#ffffff",
            specialFeature: "frost_crystals",
            desc: "Bạch y thắng tuyết, mái tóc bạc trắng như sương hàn, đôi mắt lam băng tỏa ra hàn khí đóng băng vạn vật."
        },
        phuong_cuu_ca: {
            id: "phuong_cuu_ca",
            name: "Phượng Cửu Ca",
            title: "Đạo Thiên Ma Tôn Hộ Đạo Nhân",
            robeColor: "#f0ebe1",
            robeSecondary: "#a82424",
            trimColor: "#d4af37",
            beltColor: "#e2bf75",
            hairColor: "#171a21",
            hairStyle: "noble_crown",
            skinTone: "#edd2b5",
            eyeColor: "#2c3e50",
            crownColor: "#ffd700",
            auraColor: "rgba(118, 215, 196, 0.26)",
            weaponColor: "#76d7c4",
            particleColor: "#76d7c4",
            specialFeature: "destiny_song_notes",
            desc: "Cẩm bào hồng bạch tiêu sái, phong thái nho nhã tuyệt đại của người đứng đầu thập đại cổ phái Trung Châu."
        },
        thuong_tam_tu: {
            id: "thuong_tam_tu",
            name: "Thương Tâm Từ",
            title: "Thương Gia Tộc Trưởng",
            robeColor: "#1e5c42",
            robeSecondary: "#38a376",
            trimColor: "#98f5c8",
            beltColor: "#e2bf75",
            hairColor: "#14181f",
            hairStyle: "jade_hairpin",
            skinTone: "#f5dec6",
            eyeColor: "#27ae60",
            crownColor: "#5cc995",
            auraColor: "rgba(92, 201, 149, 0.25)",
            weaponColor: "#5cc995",
            particleColor: "#98f5c8",
            specialFeature: "jade_lotus",
            desc: "Bích lục tiên quần dịu dàng thanh nhã, trâm ngọc cài đầu, mang khí chất thiện lương ấm áp của Thương Gia Thành."
        },
        hac_lau_lan: {
            id: "hac_lau_lan",
            name: "Hắc Lâu Lan",
            title: "Đại Lực Chân Vũ Thể",
            robeColor: "#292018",
            robeSecondary: "#4a3723",
            trimColor: "#e07a45",
            beltColor: "#ffd700",
            hairColor: "#1c140d",
            hairStyle: "war_helm",
            skinTone: "#e0bc96",
            eyeColor: "#ff9f43",
            crownColor: "#d4af37",
            auraColor: "rgba(224, 122, 69, 0.30)",
            weaponColor: "#e07a45",
            particleColor: "#ff9f43",
            specialFeature: "martial_flames",
            desc: "Chiến giáp huyền kim uy vũ霸khí (bá khí), mang huyết mạch Hoàng Kim Bắc Nguyên và thần lực Đại Lực Chân Vũ."
        },
        hong_lien: {
            id: "hong_lien",
            name: "Hồng Liên Ma Tôn",
            title: "Quang Âm Trường Hà Chi Chủ",
            robeColor: "#8f1616",
            robeSecondary: "#d62828",
            trimColor: "#ffd700",
            beltColor: "#ffdf6b",
            hairColor: "#240808",
            hairStyle: "immortal_lotus",
            skinTone: "#f2d6b8",
            eyeColor: "#ff3b30",
            crownColor: "#ffd700",
            auraColor: "rgba(255, 77, 77, 0.32)",
            weaponColor: "#ffd700",
            particleColor: "#ff5733",
            specialFeature: "red_lotus_halo",
            desc: "Huyết hồng tiên bào thêu hoa sen vàng rực rỡ, nghịch chuyển dòng chảy Quang Âm Trường Hà phá nát Túc Mệnh."
        },
        u_hon: {
            id: "u_hon",
            name: "U Hồn Ma Tôn",
            title: "Thiên Hạ Đệ Nhất Sát Tính",
            robeColor: "#11091c",
            robeSecondary: "#281542",
            trimColor: "#8f6ee6",
            beltColor: "#9b59b6",
            hairColor: "#1f1230",
            hairStyle: "demonic_wild",
            skinTone: "#d8d0e5",
            eyeColor: "#ff2a2a",
            crownColor: "#8f6ee6",
            auraColor: "rgba(143, 110, 230, 0.36)",
            weaponColor: "#b75cff",
            particleColor: "#8f6ee6",
            specialFeature: "soul_shadows",
            desc: "Ma ảnh u minh quấn quanh thân thể, đôi mắt đỏ rực sát cơ vạn cổ, sáng lập Hồn Đạo thống trị Sinh Tử Môn."
        },
        tinh_tu: {
            id: "tinh_tu",
            name: "Tinh Tú Tiên Tôn",
            title: "Trí Đạo Thủy Tổ — Thiên Đình Tiên Vương",
            robeColor: "#142847",
            robeSecondary: "#24477a",
            trimColor: "#7ef7f0",
            beltColor: "#dce8f2",
            hairColor: "#0f1c33",
            hairStyle: "star_crown",
            skinTone: "#f5e1ce",
            eyeColor: "#4ce6ff",
            crownColor: "#7ef7f0",
            auraColor: "rgba(103, 183, 209, 0.34)",
            weaponColor: "#4ce6ff",
            particleColor: "#7ef7f0",
            specialFeature: "orbiting_stars",
            desc: "Tinh lam tiên y lấp lánh ánh sao, xung quanh có tinh thần kỳ tử xoay chuyển, tính kế thiên hạ suốt ba triệu năm."
        }
    };

    // =========================================================================
    // 2. DỮ LIỆU NGŨ VỰC (FIVE REGIONS - CHUẨN NGUYÊN TÁC)
    // =========================================================================

    const FIVE_REGIONS = {
        nam_cuong: {
            id: "nam_cuong",
            name: "Nam Cương",
            favoredPaths: ["Mộc Đạo", "Lực Đạo", "Độc Đạo", "Huyết Đạo"],
            bonusStats: { hp: 20, def: 2 },
            initialDaoMarks: { "Mộc Đạo": 8, "Lực Đạo": 8 },
            desc: "Thập vạn đại sơn trùng điệp, chướng khí dày đặc. Các sơn trại gia tộc san sát, thịnh hành Lực Đạo, Mộc Đạo và Độc Đạo."
        },
        bac_nguyen: {
            id: "bac_nguyen",
            name: "Bắc Nguyên",
            favoredPaths: ["Nô Đạo", "Lực Đạo", "Phong Đạo", "Vận Đạo"],
            bonusStats: { atk: 4, hp: 15 },
            initialDaoMarks: { "Nô Đạo": 8, "Phong Đạo": 8 },
            desc: "Thảo nguyên mênh mông của huyết mạch Hoàng Kim Cự Dương Tiên Tôn. Dân phong hung hãn, cực thịnh Nô Đạo và Phong Đạo."
        },
        trung_chau: {
            id: "trung_chau",
            name: "Trung Châu",
            favoredPaths: ["Kiếm Đạo", "Trí Đạo", "Luyện Đạo", "Hồn Đạo"],
            bonusStats: { mental: 25, atk: 2 },
            initialDaoMarks: { "Kiếm Đạo": 8, "Luyện Đạo": 8 },
            desc: "Trung tâm Ngũ Vực, nơi Thập Đại Cổ Phái thống trị dưới sự chỉ đạo của Thiên Đình. Nền tảng Luyện Đạo và Kiếm Đạo sâu dày."
        },
        dong_hai: {
            id: "dong_hai",
            name: "Đông Hải",
            favoredPaths: ["Thủy Đạo", "Trí Đạo", "Thời Gian Đạo", "Băng Đạo"],
            bonusStats: { mental: 15, hp: 15 },
            initialDaoMarks: { "Thủy Đạo": 10, "Băng Đạo": 6 },
            desc: "Vạn đảo linh uyên, tài nguyên tu luyện phong phú bậc nhất Ngũ Vực. Thịnh hành Thủy Đạo và các tán tu giàu có."
        },
        tay_mac: {
            id: "tay_mac",
            name: "Tây Mạc",
            favoredPaths: ["Viêm Đạo", "Thổ Đạo", "Phong Đạo"],
            bonusStats: { atk: 3, def: 3 },
            initialDaoMarks: { "Viêm Đạo": 10, "Thổ Đạo": 6 },
            desc: "Sa mạc vô tận điểm xuyết những ốc đảo linh tuyền. Các đại thương đội liên kết chặt chẽ, cực thịnh Viêm Đạo và Thổ Đạo."
        }
    };

    // =========================================================================
    // 3. DỮ LIỆU 5 THẾ LỰC & GIA THẾ KHỞI ĐẦU
    // =========================================================================

    const FACTION_ORIGINS = {
        righteous_clan: {
            id: "righteous_clan",
            name: "Chính Đạo Gia Tộc",
            primevalStones: 60,
            meritPoints: 100,
            alignment: 25,
            bonusStats: { hp: 15, atk: 2, def: 2, mental: 10 },
            initialItems: [
                { id: "bronze_relic_gu", count: 1 },
                { id: "spirit_herb", count: 3 },
                { id: "moon_orchid", count: 3 },
                { id: "ration_meat", count: 4 }
            ],
            desc: "Đệ tử nòng cốt của gia tộc Chính Đạo trên núi Thanh Mao. Được ban 60 Nguyên Thạch, 100 Điểm Cống Hiến và 1 Thanh Đồng Xá Lợi Cổ."
        },
        central_sect: {
            id: "central_sect",
            name: "Đệ Tử Môn Phái",
            primevalStones: 50,
            meritPoints: 120,
            alignment: 30,
            bonusStats: { hp: 10, atk: 3, def: 2, mental: 20 },
            extraDaoMarks: { "Kiếm Đạo": 10, "Luyện Đạo": 5 },
            initialItems: [
                { id: "remnant_recipe", count: 1 },
                { id: "spirit_herb", count: 4 },
                { id: "red_iron_ore", count: 2 }
            ],
            desc: "Đệ tử ngoại môn của đại phái. Có nền tảng Kiếm Đạo (+10 Đạo Ngân), 120 Điểm Cống Hiến và 1 Cổ Phương Tàn Quyển."
        },
        lone_cultivator: {
            id: "lone_cultivator",
            name: "Tán Tu Sơn Dã",
            primevalStones: 30,
            meritPoints: 20,
            alignment: 0,
            bonusStats: { hp: 25, atk: 3, def: 3, mental: 15 },
            refinementBonus: 0.15,
            initialItems: [
                { id: "ration_meat", count: 6 },
                { id: "spirit_herb", count: 5 },
                { id: "bronze_ore", count: 4 },
                { id: "wind_essence_crystal", count: 2 }
            ],
            desc: "Tán tu độc hành lăn lộn nơi rừng hoang, ý chí kiên cường (+15% tỷ lệ bắt & luyện hóa Cổ Hoang Dã) cùng nhiều cổ tài dự trữ."
        },
        demonic_inheritor: {
            id: "demonic_inheritor",
            name: "Truyền Nhân Ma Đạo",
            primevalStones: 25,
            meritPoints: 0,
            alignment: -40,
            bonusStats: { hp: 20, atk: 6, def: 1, mental: 20 },
            extraDaoMarks: { "Huyết Đạo": 15, "Lực Đạo": 5 },
            initialItems: [
                { id: "beast_blood_core", count: 3 },
                { id: "remnant_recipe", count: 1 },
                { id: "soul_crystal", count: 1 }
            ],
            desc: "Tình cờ kế thừa huyết truyền của một cự phách Ma Đạo. Sát lực hung hãn (+15 Đạo Ngân Huyết Đạo) và 1 Tàn Phương."
        },
        merchant_heir: {
            id: "merchant_heir",
            name: "Thiếu Chủ Thương Hội",
            primevalStones: 120,
            meritPoints: 80,
            alignment: 10,
            bonusStats: { hp: 10, atk: 1, def: 2, mental: 15 },
            tradeDiscount: 0.15,
            initialItems: [
                { id: "bronze_relic_gu", count: 1 },
                { id: "moon_orchid", count: 4 },
                { id: "wind_essence_crystal", count: 2 },
                { id: "ration_meat", count: 4 }
            ],
            desc: "Thiếu đông gia của thương đội liên vực, khởi đầu giàu có với 120 Nguyên Thạch, 1 Thanh Đồng Xá Lợi Cổ và giảm 15% giá mua hàng."
        }
    };

    FACTION_ORIGINS.clan = FACTION_ORIGINS.righteous_clan;
    FACTION_ORIGINS.commoner = FACTION_ORIGINS.lone_cultivator;
    FACTION_ORIGINS.orphan = FACTION_ORIGINS.lone_cultivator;
    FACTION_ORIGINS.adopted = FACTION_ORIGINS.merchant_heir;
    FACTION_ORIGINS.inheritance = FACTION_ORIGINS.demonic_inheritor;

    // =========================================================================
    // 4. CƠ SỞ DỮ LIỆU 21 CON ĐƯỜNG TU LUYỆN (ĐẠO NGÂN & LĨNH NGỘ)
    // =========================================================================

    const DAO_PATHS = {
        "Lực Đạo": {
            id: "luc_dao",
            name: "Lực Đạo",
            icon: "💪",
            color: "#e07a45",
            conflictWith: ["Trí Đạo", "Phong Đạo"],
            synergyWith: ["Huyết Đạo", "Thổ Đạo"],
            desc: "Lấy thân thể và thú lực thuần túy nghiền ép vạn vật, công thủ toàn diện."
        },
        "Nô Đạo": {
            id: "no_dao",
            name: "Nô Đạo",
            icon: "🐺",
            color: "#a88256",
            conflictWith: ["Kiếm Đạo"],
            synergyWith: ["Hồn Đạo", "Trí Đạo"],
            desc: "Khống chế vạn thú, một người thành quân đoàn, tiêu hao nhiều tinh thần lực."
        },
        "Trí Đạo": {
            id: "tri_dao",
            name: "Trí Đạo",
            icon: "♟️",
            color: "#67b7d1",
            conflictWith: ["Lực Đạo"],
            synergyWith: ["Nô Đạo", "Luyện Đạo", "Vận Đạo"],
            desc: "Niệm, Ý, Tình tam yếu tố. Thôi diễn cổ phương, sát chiêu và bố cục thiên hạ."
        },
        "Hồn Đạo": {
            id: "hon_dao",
            name: "Hồn Đạo",
            icon: "👻",
            color: "#8f6ee6",
            conflictWith: ["Quang Đạo", "Lôi Đạo"],
            synergyWith: ["Nô Đạo", "Ám Đạo"],
            desc: "Do U Hồn Ma Tôn sáng lập. Cường hóa tráng hồn, luyện hồn và sát thương linh hồn."
        },
        "Huyết Đạo": {
            id: "huyet_dao",
            name: "Huyết Đạo",
            icon: "🩸",
            color: "#d93838",
            conflictWith: ["Mộc Đạo", "Quang Đạo"],
            synergyWith: ["Lực Đạo"],
            desc: "Do Huyết Hải Lão Tổ sáng lập. Chi phí nuôi luyện cực thấp, thành hình nhanh, sát phạt tàn bạo."
        },
        "Kiếm Đạo": {
            id: "kiem_dao",
            name: "Kiếm Đạo",
            icon: "⚔️",
            color: "#dce8f2",
            conflictWith: ["Nô Đạo", "Thổ Đạo"],
            synergyWith: ["Kim Đạo", "Phong Đạo"],
            desc: "Sát lực sắc bén đứng đầu ngũ vực, xuyên thủng mọi lớp phòng ngự."
        },
        "Viêm Đạo": {
            id: "viem_dao",
            name: "Viêm Đạo",
            icon: "🔥",
            color: "#ff5733",
            conflictWith: ["Thủy Đạo", "Băng Đạo"],
            synergyWith: ["Phong Đạo", "Luyện Đạo"],
            desc: "Bùng nổ sát thương diện rộng và thiêu đốt mục tiêu liên tục."
        },
        "Thủy Đạo": {
            id: "thuy_dao",
            name: "Thủy Đạo",
            icon: "💧",
            color: "#3b8beb",
            conflictWith: ["Viêm Đạo", "Lôi Đạo"],
            synergyWith: ["Băng Đạo", "Mộc Đạo"],
            desc: "Miên man bất tuyệt, công thủ nhu hòa và hỗ trợ khôi phục."
        },
        "Mộc Đạo": {
            id: "moc_dao",
            name: "Mộc Đạo",
            icon: "🌿",
            color: "#4cd964",
            conflictWith: ["Huyết Đạo", "Kim Đạo"],
            synergyWith: ["Thủy Đạo", "Thổ Đạo"],
            desc: "Do Nguyên Liên Tiên Tôn phát triển đỉnh phong. Trị liệu sinh cơ và kinh doanh Tiên Khiếu."
        },
        "Phong Đạo": {
            id: "phong_dao",
            name: "Phong Đạo",
            icon: "🌪️",
            color: "#6ce6b8",
            conflictWith: ["Thổ Đạo", "Lực Đạo"],
            synergyWith: ["Viêm Đạo", "Kiếm Đạo"],
            desc: "Thân pháp tiêu dật, tốc độ di chuyển và lưỡi gió cắt xé tầm xa."
        },
        "Thời Gian Đạo": {
            id: "thoi_gian_dao",
            name: "Thời Gian Đạo",
            icon: "⏳",
            color: "#f2d16b",
            conflictWith: [],
            synergyWith: ["Không Gian Đạo", "Trí Đạo"],
            desc: "Chi phối dòng chảy Quang Âm Trường Hà, giảm thời gian hồi chiêu và điều tiết nhịp độ Tiên Khiếu."
        },
        "Không Gian Đạo": {
            id: "khong_gian_dao",
            name: "Không Gian Đạo",
            icon: "🌀",
            color: "#9b72cf",
            conflictWith: [],
            synergyWith: ["Thời Gian Đạo"],
            desc: "Xuyên toa hư không, mở rộng diện tích Phúc Địa Động Thiên."
        },
        "Luyện Đạo": {
            id: "luyen_dao",
            name: "Luyện Đạo",
            icon: "⚗️",
            color: "#e6a84c",
            conflictWith: [],
            synergyWith: ["Trí Đạo", "Viêm Đạo", "Băng Đạo"],
            desc: "Tinh thông hỏa pháp và băng pháp luyện cổ, tăng mạnh tỷ lệ thành công khi Hợp Luyện."
        },
        "Vận Đạo": {
            id: "van_dao",
            name: "Vận Đạo",
            icon: "🎲",
            color: "#ffd700",
            conflictWith: [],
            synergyWith: ["Trí Đạo"],
            desc: "Do Cự Dương Tiên Tôn sáng lập. Tăng khí vận bản thân, tăng tỷ lệ bạo kích và thành công luyện cổ."
        },
        "Âm Đạo": {
            id: "am_thanh_dao",
            name: "Âm Đạo",
            icon: "🔔",
            color: "#76d7c4",
            conflictWith: [],
            synergyWith: ["Phong Đạo", "Hồn Đạo"],
            desc: "Sóng âm vô hình xuyên thấu phòng ngự và hỗ trợ trinh sát."
        },
        "Quang Đạo": {
            id: "quang_dao",
            name: "Quang Đạo",
            icon: "☀️",
            color: "#fff2a6",
            conflictWith: ["Ám Đạo", "Hồn Đạo", "Huyết Đạo"],
            synergyWith: ["Viêm Đạo"],
            desc: "Tốc độ cực nhanh như cực quang, khắc chế Hồn Đạo và Ám Đạo."
        },
        "Ám Đạo": {
            id: "am_dao",
            name: "Ám Đạo",
            icon: "🌑",
            color: "#5d6d7e",
            conflictWith: ["Quang Đạo"],
            synergyWith: ["Hồn Đạo", "Độc Đạo"],
            desc: "Ẩn tàng khí tức, đánh lén chí mạng và ăn mòn hộ thuẫn."
        },
        "Kim Đạo": {
            id: "kim_dao",
            name: "Kim Đạo",
            icon: "🛡️",
            color: "#d4af37",
            conflictWith: ["Mộc Đạo", "Viêm Đạo"],
            synergyWith: ["Kiếm Đạo", "Thổ Đạo"],
            desc: "Cường hóa nhục thân đồng bì thiết cốt, công phạt sắc bén."
        },
        "Thổ Đạo": {
            id: "tho_dao",
            name: "Thổ Đạo",
            icon: "⛰️",
            color: "#b8860b",
            conflictWith: ["Phong Đạo", "Kiếm Đạo"],
            synergyWith: ["Lực Đạo", "Kim Đạo"],
            desc: "Phòng ngự hậu trọng như sơn nhạc, củng cố Địa Khí Tiên Khiếu."
        },
        "Băng Đạo": {
            id: "bang_dao",
            name: "Băng Đạo",
            icon: "❄️",
            color: "#85c1e9",
            conflictWith: ["Viêm Đạo"],
            synergyWith: ["Thủy Đạo", "Luyện Đạo"],
            desc: "Đóng băng vạn vật, làm chậm tốc độ di chuyển và xuất chiêu của kẻ địch."
        },
        "Độc Đạo": {
            id: "doc_dao",
            name: "Độc Đạo",
            icon: "☠️",
            color: "#9b59b6",
            conflictWith: ["Quang Đạo"],
            synergyWith: ["Ám Đạo", "Mộc Đạo"],
            desc: "Ăn mòn sinh mệnh theo thời gian, khiến kẻ địch trúng độc suy kiệt mà chết."
        }
    };

    // =========================================================================
    // 5. CƠ SỞ DỮ LIỆU VẬT PHẨM, XÁ LỢI CỔ 5 CHUYỂN & TÀN PHƯƠNG
    // =========================================================================

    const ITEM_DATABASE = {
        primeval_stone: {
            id: "primeval_stone",
            name: "Nguyên Thạch",
            icon: "💎",
            category: "currency",
            rarity: "common",
            value: 1,
            desc: "Đá ngưng tụ nguyên khí thiên địa. Tiền tệ giao dịch của Cổ Sư và dùng để khôi phục nhanh Chân Nguyên."
        },
        immortal_stone: {
            id: "immortal_stone",
            name: "Tiên Nguyên Thạch",
            icon: "🌟",
            category: "immortal_material",
            rarity: "legendary",
            value: 1000,
            desc: "Tiền tệ tối cao do Thiên Đình phát hành hoặc giao dịch trên Bảo Hoàng Thiên. Sử dụng giúp nhận 1 viên Lục Đề Tiên Nguyên."
        },
        remnant_recipe: {
            id: "remnant_recipe",
            name: "Cổ Phương Tàn Quyển",
            icon: "📜",
            category: "recipe_scroll",
            rarity: "rare",
            value: 65,
            desc: "Mảnh da thú cổ xưa ghi chép tàn phương hợp luyện cổ. Mở tab [Luyện Đạo Các] để giải mã và lĩnh ngộ Bí Phương mới."
        },
        bronze_relic_gu: {
            id: "bronze_relic_gu",
            name: "Thanh Đồng Xá Lợi Cổ",
            icon: "🟢",
            category: "relic_gu",
            targetRank: 1,
            rarity: "rare",
            value: 120,
            desc: "Cổ trùng tiêu hao quý giá cho Cổ Sư Nhất Chuyển. Sử dụng giúp Khiếu Bích lập tức tấn thăng 1 tiểu cảnh giới!"
        },
        red_iron_relic_gu: {
            id: "red_iron_relic_gu",
            name: "Xích Thiết Xá Lợi Cổ",
            icon: "🔴",
            category: "relic_gu",
            targetRank: 2,
            rarity: "rare",
            value: 350,
            desc: "Cổ trùng tiêu hao vô giá cho Cổ Sư Nhị Chuyển. Sử dụng giúp Khiếu Bích lập tức tấn thăng 1 tiểu cảnh giới!"
        },
        white_silver_relic_gu: {
            id: "white_silver_relic_gu",
            name: "Bạch Ngân Xá Lợi Cổ",
            icon: "⚪",
            category: "relic_gu",
            targetRank: 3,
            rarity: "epic",
            value: 950,
            desc: "Bảo vật cầu mà không được của Cổ Sư Tam Chuyển. Sử dụng giúp Khiếu Bích lập tức tấn thăng 1 tiểu cảnh giới!"
        },
        yellow_gold_relic_gu: {
            id: "yellow_gold_relic_gu",
            name: "Hoàng Kim Xá Lợi Cổ",
            icon: "🟡",
            category: "relic_gu",
            targetRank: 4,
            rarity: "epic",
            value: 2600,
            desc: "Chí bảo của Cổ Sư Tứ Chuyển. Sử dụng giúp Khiếu Bích lập tức tấn thăng 1 tiểu cảnh giới mà không tốn hàng năm trời khổ tu!"
        },
        purple_crystal_relic_gu: {
            id: "purple_crystal_relic_gu",
            name: "Tử Tinh Xá Lợi Cổ",
            icon: "🟣",
            category: "relic_gu",
            targetRank: 5,
            rarity: "legendary",
            value: 6800,
            desc: "Thần vật phàm trần dành cho Cổ Sư Ngũ Chuyển. Sử dụng giúp Khiếu Bích lập tức tấn thăng 1 tiểu cảnh giới tiến thẳng Đỉnh Phong!"
        },
        ration_meat: {
            id: "ration_meat",
            name: "Thịt Thú Rừng Tươi",
            icon: "🍖",
            category: "food",
            rarity: "common",
            value: 4,
            hpRestore: 25,
            staminaRestore: 40,
            desc: "Thức ăn nuôi Hắc Thỉ Cổ, Toàn Lực Dĩ Phó Cổ và khôi phục 25 Sinh Mệnh cho Cổ Sư."
        },
        spirit_herb: {
            id: "spirit_herb",
            name: "Thanh Linh Thảo",
            icon: "🌿",
            category: "herb",
            rarity: "common",
            value: 6,
            hpRestore: 40,
            mentalRestore: 20,
            desc: "Linh thảo trị thương hồi 40 Sinh Mệnh & 20 Tinh Thần Lực. Thức ăn của cổ trùng Mộc Đạo và Tửu Trùng."
        },
        moon_orchid: {
            id: "moon_orchid",
            name: "Nguyệt Lan Hoa",
            icon: "🌸",
            category: "herb",
            rarity: "uncommon",
            value: 10,
            mentalRestore: 35,
            desc: "Cánh hoa mọc trên núi Thanh Mao. Thức ăn bắt buộc của dòng Nguyệt Quang Cổ và nguyên liệu hợp luyện Nguyệt Toàn Cổ."
        },
        bronze_ore: {
            id: "bronze_ore",
            name: "Thanh Đồng Thạch Khoáng",
            icon: "🪨",
            category: "ore",
            rarity: "common",
            value: 8,
            desc: "Khoáng thạch đồng xanh dùng để nuôi dưỡng Đồng Bì Cổ và làm cổ tài hợp luyện."
        },
        red_iron_ore: {
            id: "red_iron_ore",
            name: "Xích Thiết Tinh Khoáng",
            icon: "🧱",
            category: "ore",
            rarity: "uncommon",
            value: 20,
            desc: "Tinh thiết đỏ rực chứa đạo ngân Kim/Viêm. Cổ tài trọng yếu để hợp luyện cổ trùng Nhị và Tam Chuyển."
        },
        beast_blood_core: {
            id: "beast_blood_core",
            name: "Bách Thú Tinh Huyết",
            icon: "🩸",
            category: "material",
            rarity: "uncommon",
            value: 18,
            hpRestore: 50,
            desc: "Máu tim của Bách Thú Vương. Thức ăn nuôi dưỡng cổ trùng Huyết Đạo và phụ liệu hợp luyện cổ công kích."
        },
        wind_essence_crystal: {
            id: "wind_essence_crystal",
            name: "Phong Tuyền Tinh Thạch",
            icon: "🎐",
            category: "material",
            rarity: "uncommon",
            value: 22,
            desc: "Kết tinh của gió lốc trên đỉnh núi. Dùng nuôi dưỡng và hợp luyện Phong Nhận Cổ, Thanh Phong Luân Cổ."
        },
        jade_bone: {
            id: "jade_bone",
            name: "Bạch Ngọc Cốt Tủy",
            icon: "🦴",
            category: "material",
            rarity: "rare",
            value: 32,
            desc: "Cốt tủy thu thập từ Bạch Cốt Sơn. Nguyên liệu cốt lõi để hợp luyện Lao Toàn Cốt Thương Cổ và Bạch Ngọc Cổ."
        },
        hundred_year_ginseng: {
            id: "hundred_year_ginseng",
            name: "Bách Niên Khổ Sâm",
            icon: "🥕",
            category: "herb",
            rarity: "rare",
            value: 45,
            hpRestore: 90,
            mentalRestore: 45,
            desc: "Nhân sâm trăm năm tuổi. Vừa đại bổ Sinh Mệnh & Tinh Thần, vừa là nguyên liệu hợp luyện Thiên Nguyên Bảo Liên."
        },
        soul_crystal: {
            id: "soul_crystal",
            name: "Đãng Hồn Thạch Đan",
            icon: "🔮",
            category: "material",
            rarity: "epic",
            value: 60,
            mentalRestore: 85,
            desc: "Mảnh đá rơi ra từ Đãng Hồn Sơn. Khôi phục tới 85 Tinh Thần Lực để thăm dò Mộng Cảnh và hợp luyện cổ Tứ Chuyển."
        }
    };

    // =========================================================================
    // 6. DỮ LIỆU 7 MỘNG CẢNH THƯỢNG CỔ (DREAM REALMS)
    // =========================================================================

    const DREAM_REALMS = [
        {
            id: "dream_co_nguyet",
            name: "Mộng Cảnh Cổ Nguyệt Nhất Thế",
            paths: ["Huyết Đạo", "Quang Đạo"],
            reqRank: 1,
            mentalCost: 25,
            daoMarksReward: 15,
            humanQiReward: 8,
            desc: "Tái hiện cảnh tượng tổ tiên Cổ Nguyệt Nhất Thế sáng lập sơn trại và tu luyện Huyết Đạo trong huyết hồ."
        },
        {
            id: "dream_bach_cot",
            name: "Mộng Cảnh Hôi Cốt Tài Tuấn",
            paths: ["Kim Đạo", "Luyện Đạo"],
            reqRank: 2,
            mentalCost: 35,
            daoMarksReward: 24,
            humanQiReward: 12,
            desc: "Diễn hóa quá trình Hôi Cốt Tài Tuấn nghiên cứu Cốt Đạo và bố trí truyền thừa trên Bạch Cốt Sơn."
        },
        {
            id: "dream_tam_vuong",
            name: "Mộng Cảnh Tam Vương Sơn",
            paths: ["Luyện Đạo", "Nô Đạo", "Viêm Đạo"],
            reqRank: 3,
            mentalCost: 45,
            daoMarksReward: 38,
            humanQiReward: 18,
            desc: "Hồi ức của Bạo Vương, Khuyển Vương và Tín Vương khi đồng tâm hiệp lực luyện cổ và khống chế vạn thú."
        },
        {
            id: "dream_chan_duong",
            name: "Mộng Cảnh Cự Dương Tiên Tôn",
            paths: ["Vận Đạo", "Huyết Đạo"],
            reqRank: 4,
            mentalCost: 60,
            daoMarksReward: 60,
            humanQiReward: 30,
            desc: "Một tia chân ý sót lại trong Bát Thập Bát Giác Chân Dương Lâu, ẩn chứa huyền cơ của Vận Đạo."
        },
        {
            id: "dream_tinh_tu",
            name: "Mộng Cảnh Tinh Tú Tiên Tôn",
            paths: ["Trí Đạo"],
            reqRank: 4,
            mentalCost: 65,
            daoMarksReward: 70,
            humanQiReward: 35,
            desc: "Tinh Tượng Kỳ Cục biến hóa khôn lường. Vượt qua sẽ giúp cảnh giới Trí Đạo tăng vọt."
        },
        {
            id: "dream_nguyen_lien",
            name: "Mộng Cảnh Nguyên Liên Tiên Tôn",
            paths: ["Mộc Đạo", "Thời Gian Đạo"],
            reqRank: 5,
            mentalCost: 75,
            daoMarksReward: 95,
            humanQiReward: 45,
            desc: "Chân ý của bậc Tôn Giả giàu có nhất lịch sử, khai mở đại đạo kinh doanh Tiên Khiếu và Xuân Thu Thiền."
        },
        {
            id: "dream_u_hon",
            name: "Mộng Cảnh U Hồn Ma Tôn",
            paths: ["Hồn Đạo", "Kiếm Đạo", "Ám Đạo"],
            reqRank: 5,
            mentalCost: 85,
            daoMarksReward: 120,
            humanQiReward: 60,
            desc: "Sát tính ngập trời nơi Sinh Tử Môn! Kẻ tâm chí yếu ớt sẽ bị thương tổn hồn phách, kẻ vượt qua sẽ đắc đạo Tông Sư."
        }
    ];

    // =========================================================================
    // 7. LỚP QUẢN LÝ NHÂN VẬT (CLASS PLAYERMANAGER)
    // =========================================================================

    class PlayerManager {
        constructor(apertureSystem) {
            this.aperture = apertureSystem || null;
            this.reset();
        }

        reset() {
            this.name = "Cổ Nguyệt Phương Nguyên";
            this.skinId = "phuong_nguyen";
            this.region = "nam_cuong";
            this.origin = "righteous_clan";
            this.alignment = 20;
            this.fame = 0;
            this.kills = 0;

            // Tọa độ & Vận động trong Đấu trường 2D
            this.x = 600;
            this.y = 600;
            this.vx = 0;
            this.vy = 0;
            this.radius = 14;
            this.facing = "down";
            this.aimAngle = 0;
            this.isMoving = false;
            this.isSprinting = false;

            // Hoạt ảnh Pixel Art
            this.animState = "idle";
            this.animTimer = 0;
            this.animFrame = 0;
            this.attackAnimCooldown = 0;

            // Chỉ số chiến đấu cơ bản
            this.baseMaxHp = 110;
            this.hp = 110;
            this.maxHp = 110;

            this.baseAtk = 14;
            this.atk = 14;

            this.baseDef = 6;
            this.def = 6;

            this.baseSpd = 140;
            this.spd = 140;

            this.baseVision = 260;
            this.vision = 260;

            this.baseMaxMental = 100;
            this.mental = 100;
            this.maxMental = 100;

            this.stamina = 100;
            this.maxStamina = 100;

            // Tiền tệ & Điểm Cống Hiến
            this.primevalStones = 60;
            this.meritPoints = 100;
            this.immortalStones = 0;

            // Thiên phú đặc biệt
            this.refinementBonus = 0;
            this.tradeDiscount = 0;

            // Buff trong trận chiến
            this.activeBuffs = [];

            // Đạo Ngân & Cảnh giới Lĩnh ngộ 21 Lưu phái
            this.mainPath = "Quang Đạo";
            this.daoMarks = {};
            this.pathAttainment = {};
            for (const pathName of Object.keys(DAO_PATHS)) {
                this.daoMarks[pathName] = 0;
                this.pathAttainment[pathName] = "Phàm Cấp";
            }

            this.dreamClears = {};
            this.inventory = [];
        }

        // =====================================================================
        // 8. KHỞI TẠO NHÂN VẬT & QUẢN LÝ SKIN NGOẠI HÌNH
        // =====================================================================

        initializeNewCharacter(name, originKey = "righteous_clan", regionKey = "nam_cuong", skinKey = "phuong_nguyen") {
            this.reset();
            this.name = (name && name.trim()) ? name.trim() : "Cổ Nguyệt Phương Nguyên";
            this.skinId = CHARACTER_SKINS[skinKey] ? skinKey : "phuong_nguyen";
            this.region = FIVE_REGIONS[regionKey] ? regionKey : "nam_cuong";
            this.origin = FACTION_ORIGINS[originKey] ? originKey : "righteous_clan";

            const regCfg = FIVE_REGIONS[this.region];
            const oriCfg = FACTION_ORIGINS[this.origin];

            this.primevalStones = oriCfg.primevalStones;
            this.meritPoints = oriCfg.meritPoints || 0;
            this.alignment = oriCfg.alignment;
            this.refinementBonus = oriCfg.refinementBonus || 0;
            this.tradeDiscount = oriCfg.tradeDiscount || 0;

            this.baseMaxHp += (oriCfg.bonusStats.hp || 0) + (regCfg.bonusStats.hp || 0);
            this.baseAtk += (oriCfg.bonusStats.atk || 0) + (regCfg.bonusStats.atk || 0);
            this.baseDef += (oriCfg.bonusStats.def || 0) + (regCfg.bonusStats.def || 0);
            this.baseMaxMental += (oriCfg.bonusStats.mental || 0) + (regCfg.bonusStats.mental || 0);

            for (const item of oriCfg.initialItems) {
                this.addItem(item.id, item.count);
            }

            if (regCfg.initialDaoMarks) {
                for (const [p, val] of Object.entries(regCfg.initialDaoMarks)) {
                    this.addDaoMarks(p, val);
                }
            }
            if (oriCfg.extraDaoMarks) {
                for (const [p, val] of Object.entries(oriCfg.extraDaoMarks)) {
                    this.addDaoMarks(p, val);
                }
            }

            if (this.aperture && this.aperture.aptitude && this.aperture.aptitude.physique) {
                const phy = this.aperture.aptitude.physique;
                this.mainPath = phy.favoredPaths[0];
                for (const p of phy.favoredPaths) {
                    this.addDaoMarks(p, 30);
                }
            }

            this.recalculateStats();
            this.hp = this.maxHp;
            this.mental = this.maxMental;
        }

        setSkin(skinKey) {
            if (!CHARACTER_SKINS[skinKey]) return false;
            this.skinId = skinKey;
            return CHARACTER_SKINS[skinKey];
        }

        getSkinConfig() {
            return CHARACTER_SKINS[this.skinId] || CHARACTER_SKINS.phuong_nguyen;
        }

        static getSkinInfo(skinKey) {
            return CHARACTER_SKINS[skinKey] || CHARACTER_SKINS.phuong_nguyen;
        }

        static getOriginDescription(originKey, regionKey = "nam_cuong") {
            const ori = FACTION_ORIGINS[originKey] || FACTION_ORIGINS.righteous_clan;
            const reg = FIVE_REGIONS[regionKey] || FIVE_REGIONS.nam_cuong;
            return `[${reg.name} — ${ori.name}] ${ori.desc} (${reg.desc})`;
        }

        getRegionName() {
            return (FIVE_REGIONS[this.region] && FIVE_REGIONS[this.region].name) || "Nam Cương";
        }

        getFactionOriginName() {
            return (FACTION_ORIGINS[this.origin] && FACTION_ORIGINS[this.origin].name) || "Chính Đạo Gia Tộc";
        }

        // =====================================================================
        // 9. SỬ DỤNG XÁ LỢI CỔ 5 CHUYỂN & THĂM DÒ MỘNG CẢNH
        // =====================================================================

        useRelicGu(aperture) {
            const ap = aperture || this.aperture;
            if (!ap || !ap.isAwakened) {
                return { success: false, message: "Ngươi chưa Khai Khiếu, không thể sử dụng Xá Lợi Cổ!" };
            }
            if (ap.isImmortal) {
                return { success: false, message: "Xá Lợi Cổ chỉ có tác dụng với Phàm Khiếu từ Nhất Chuyển đến Ngũ Chuyển!" };
            }

            const relicMap = {
                1: "bronze_relic_gu",
                2: "red_iron_relic_gu",
                3: "white_silver_relic_gu",
                4: "yellow_gold_relic_gu",
                5: "purple_crystal_relic_gu"
            };

            const requiredRelicId = relicMap[ap.rank];
            const relicMeta = ITEM_DATABASE[requiredRelicId];

            if (this.getItemCount(requiredRelicId) <= 0) {
                return {
                    success: false,
                    message: `Không có [${relicMeta.name}] trong hành trang! Hãy mua tại Thương Hội/Đấu Giá hoặc đổi trong Gia Tộc Khố Phòng.`
                };
            }

            if (ap.subStage === 3 && ap.wallProgress >= ap.maxWallProgress) {
                return {
                    success: false,
                    message: `Ngươi đã đạt ${ap.getRealmDisplayName()} viên mãn! Hãy bấm nút 'Xung Kích Đột Phá' hoặc 'Phá Khiếu Thăng Tiên'.`
                };
            }

            this.removeItem(requiredRelicId, 1);

            if (ap.subStage < 3) {
                ap.subStage += 1;
                ap.wallProgress = 0;
                const rankCfg = global.ApertureSystem.MORTAL_RANKS[ap.rank];
                const subCfg = global.ApertureSystem.MORTAL_SUBSTAGES[ap.subStage];
                ap.maxWallProgress = Math.round(rankCfg.baseWallReq * subCfg.statMult);
                ap.humanQi += 8 * ap.rank;
                this.recalculateStats();
                this.hp = this.maxHp;

                return {
                    success: true,
                    message: `✨ Đã dung hợp [${relicMeta.name}]! Quang mang rực rỡ, Không Khiếu lập tức đột phá lên 【${ap.getRealmDisplayName()}】 (${ap.getApertureWallName()})!`
                };
            } else {
                ap.wallProgress = ap.maxWallProgress;
                return {
                    success: true,
                    message: `✨ Đã dung hợp [${relicMeta.name}]! Khiếu Bích Tinh Mạc đạt trạng thái viên mãn 100%, sẵn sàng xung kích Đại Cảnh Giới!`
                };
            }
        }

        exploreDreamRealm(dreamId) {
            const dream = DREAM_REALMS.find(d => d.id === dreamId);
            if (!dream) return { success: false, message: "Không tìm thấy Mộng Cảnh này." };

            const rank = this.aperture ? this.aperture.rank : 1;
            if (rank < dream.reqRank) {
                return {
                    success: false,
                    message: `Tu vi chưa đủ! Cần đạt tối thiểu ${dream.reqRank} Chuyển để chịu đựng uy áp của [${dream.name}].`
                };
            }

            if (this.mental < dream.mentalCost) {
                return {
                    success: false,
                    message: `Tinh Thần Lực không đủ (${Math.floor(this.mental)}/${dream.mentalCost})! Hãy dùng Thanh Linh Thảo hoặc Đãng Hồn Thạch Đan để hồi phục.`
                };
            }

            this.mental = Math.max(0, this.mental - dream.mentalCost);

            const triMarks = this.daoMarks["Trí Đạo"] || 0;
            const honMarks = this.daoMarks["Hồn Đạo"] || 0;
            const chance = Math.min(0.95, 0.72 + (triMarks + honMarks) * 0.002);

            if (Math.random() <= chance) {
                this.dreamClears[dream.id] = (this.dreamClears[dream.id] || 0) + 1;
                for (const p of dream.paths) {
                    this.addDaoMarks(p, dream.daoMarksReward);
                }
                if (this.aperture) {
                    this.aperture.humanQi += dream.humanQiReward;
                }

                return {
                    success: true,
                    message: `🌙 Thăm dò [${dream.name}] thành công! Hấp thu chân ý nhận +${dream.daoMarksReward} Đạo Ngân (${dream.paths.join(", ")}) và +${dream.humanQiReward} Nhân Khí!`
                };
            } else {
                const minGain = Math.max(4, Math.floor(dream.daoMarksReward * 0.3));
                this.addDaoMarks(dream.paths[0], minGain);
                return {
                    success: false,
                    message: `Mộng cảnh mê hoặc tâm thần khiến ngươi phải rút lui sớm, nhưng vẫn kịp lĩnh ngộ +${minGain} Đạo Ngân ${dream.paths[0]}.`
                };
            }
        }

        // =====================================================================
        // 10. TÍNH TOÁN CHỈ SỐ, ĐẠO NGÂN & XUNG ĐỘT ĐẠO NGÂN
        // =====================================================================

        recalculateStats() {
            let rank = 1;
            let subStage = 0;
            let isImmortal = false;

            if (this.aperture && this.aperture.isAwakened) {
                rank = this.aperture.rank;
                subStage = this.aperture.subStage;
                isImmortal = this.aperture.isImmortal;
            }

            const rankMult = isImmortal ? Math.pow(2.5, rank - 1) : Math.pow(1.52, rank - 1);
            const subMult = isImmortal ? 1.0 : (1 + subStage * 0.18);
            const totalRealmMult = rankMult * subMult;

            const lucMarks = this.daoMarks["Lực Đạo"] || 0;
            const honMarks = this.daoMarks["Hồn Đạo"] || 0;
            const kimMarks = this.daoMarks["Kim Đạo"] || 0;
            const thoMarks = this.daoMarks["Thổ Đạo"] || 0;
            const phongMarks = this.daoMarks["Phong Đạo"] || 0;

            let calcMaxHp = Math.round(this.baseMaxHp * totalRealmMult + lucMarks * 2.0 + thoMarks * 1.6);
            let calcAtk = Math.round(this.baseAtk * totalRealmMult + lucMarks * 0.5);
            let calcDef = Math.round(this.baseDef * totalRealmMult + (kimMarks + thoMarks) * 0.4);
            let calcSpd = Math.round(this.baseSpd + (rank - 1) * 8 + Math.min(90, phongMarks * 0.3));
            let calcVision = Math.round(this.baseVision + (rank - 1) * 20);
            let calcMaxMental = Math.round(this.baseMaxMental * (1 + (rank - 1) * 0.35) + honMarks * 1.8);

            for (const buff of this.activeBuffs) {
                if (!buff.statMods) continue;
                if (buff.statMods.atk) calcAtk += buff.statMods.atk;
                if (buff.statMods.def) calcDef += buff.statMods.def;
                if (buff.statMods.spd) calcSpd += buff.statMods.spd;
                if (buff.statMods.vision) calcVision += buff.statMods.vision;
                if (buff.statMods.spdMult) calcSpd = Math.round(calcSpd * buff.statMods.spdMult);
            }

            if (this.isSprinting && this.stamina > 5) {
                calcSpd = Math.round(calcSpd * 1.42);
            }

            this.maxHp = Math.max(10, calcMaxHp);
            this.hp = Math.min(this.hp, this.maxHp);
            this.atk = Math.max(1, calcAtk);
            this.def = Math.max(0, calcDef);
            this.spd = Math.max(40, calcSpd);
            this.vision = Math.max(120, calcVision);
            this.maxMental = Math.max(20, calcMaxMental);
            this.mental = Math.min(this.mental, this.maxMental);
        }

        addDaoMarks(pathName, amount = 1) {
            if (!DAO_PATHS[pathName]) return;
            this.daoMarks[pathName] = Math.max(0, (this.daoMarks[pathName] || 0) + amount);

            let highestPath = this.mainPath;
            let highestVal = this.daoMarks[highestPath] || 0;
            for (const [p, val] of Object.entries(this.daoMarks)) {
                if (val > highestVal) {
                    highestVal = val;
                    highestPath = p;
                }
            }
            this.mainPath = highestPath;

            const marks = this.daoMarks[pathName];
            if (marks >= 1800) this.pathAttainment[pathName] = "Vô Thượng Đại Tông Sư";
            else if (marks >= 650) this.pathAttainment[pathName] = "Đại Tông Sư";
            else if (marks >= 220) this.pathAttainment[pathName] = "Tông Sư";
            else if (marks >= 75) this.pathAttainment[pathName] = "Đại Sư";
            else if (marks >= 25) this.pathAttainment[pathName] = "Chuẩn Đại Sư";
            else this.pathAttainment[pathName] = "Phàm Cấp";

            this.recalculateStats();
        }

        addDaoMarksFromTribulation(totalMarks) {
            const half = Math.floor(totalMarks * 0.65);
            const rest = totalMarks - half;
            this.addDaoMarks(this.mainPath, half);
            const pathInfo = DAO_PATHS[this.mainPath];
            const secondary = (pathInfo && pathInfo.synergyWith && pathInfo.synergyWith[0]) || "Luyện Đạo";
            this.addDaoMarks(secondary, rest);
        }

        calculateDaoAmplification(primaryPath, secondaryPaths = []) {
            const sameMarks = this.daoMarks[primaryPath] || 0;
            let amplification = 1.0 + (sameMarks / 800);

            if (
                this.aperture &&
                this.aperture.aptitude &&
                this.aperture.aptitude.physique &&
                this.aperture.aptitude.physique.favoredPaths.includes(primaryPath)
            ) {
                amplification += this.aperture.aptitude.physique.guPowerBonus;
            }

            const attainment = this.pathAttainment[primaryPath] || "Phàm Cấp";
            const isGrandmaster = attainment.includes("Tông Sư");

            const pathInfo = DAO_PATHS[primaryPath];
            let conflictPenalty = 0;

            if (pathInfo) {
                for (const secPath of secondaryPaths) {
                    if (pathInfo.conflictWith.includes(secPath)) {
                        conflictPenalty += isGrandmaster ? 0.08 : 0.25;
                    } else if (pathInfo.synergyWith.includes(secPath)) {
                        amplification += 0.14;
                    }
                }
            }

            const finalMultiplier = Math.max(0.45, Number((amplification - conflictPenalty).toFixed(2)));
            return {
                multiplier: finalMultiplier,
                sameMarks: sameMarks,
                conflictPenalty: Number(conflictPenalty.toFixed(2)),
                hasConflict: conflictPenalty > 0.12
            };
        }

        // =====================================================================
        // 11. VẬN ĐỘNG TRONG ĐẤU TRƯỜNG 2D, CHIẾN ĐẤU & HÀNH TRANG
        // =====================================================================

        update(dt, input, mapManager) {
            let buffChanged = false;
            for (let i = this.activeBuffs.length - 1; i >= 0; i--) {
                this.activeBuffs[i].duration -= dt;
                if (this.activeBuffs[i].duration <= 0) {
                    this.activeBuffs.splice(i, 1);
                    buffChanged = true;
                }
            }
            if (buffChanged) this.recalculateStats();

            if (this.mental < this.maxMental) {
                this.mental = Math.min(this.maxMental, this.mental + 1.5 * dt);
            }
            if (this.hp < this.maxHp) {
                this.hp = Math.min(this.maxHp, this.hp + 0.6 * dt);
            }

            if (input && typeof input.mouseWorldX === "number" && typeof input.mouseWorldY === "number") {
                this.aimAngle = Math.atan2(input.mouseWorldY - this.y, input.mouseWorldX - this.x);
            }

            let moveX = 0;
            let moveY = 0;
            if (input) {
                if (input.up) moveY -= 1;
                if (input.down) moveY += 1;
                if (input.left) moveX -= 1;
                if (input.right) moveX += 1;
            }

            this.isMoving = (moveX !== 0 || moveY !== 0);
            const wantsSprint = Boolean(input && input.sprint && this.isMoving && this.stamina > 5);
            if (wantsSprint !== this.isSprinting) {
                this.isSprinting = wantsSprint;
                this.recalculateStats();
            }

            if (this.isMoving) {
                const len = Math.hypot(moveX, moveY);
                moveX /= len;
                moveY /= len;

                if (Math.abs(moveX) > Math.abs(moveY)) {
                    this.facing = moveX > 0 ? "right" : "left";
                } else {
                    this.facing = moveY > 0 ? "down" : "up";
                }

                this.vx = moveX * this.spd;
                this.vy = moveY * this.spd;

                const nextX = this.x + this.vx * dt;
                const nextY = this.y + this.vy * dt;

                if (!mapManager || mapManager.isWalkable(nextX, this.y, this.radius)) {
                    this.x = nextX;
                }
                if (!mapManager || mapManager.isWalkable(this.x, nextY, this.radius)) {
                    this.y = nextY;
                }

                const staminaDrain = this.isSprinting ? 4.0 : 0.25;
                this.stamina = Math.max(0, this.stamina - staminaDrain * dt);
            } else {
                this.vx = 0;
                this.vy = 0;
                if (this.stamina < this.maxStamina) {
                    this.stamina = Math.min(this.maxStamina, this.stamina + 2.0 * dt);
                }
            }

            if (this.attackAnimCooldown > 0) {
                this.attackAnimCooldown -= dt;
                this.animState = "attack";
            } else if (this.isMoving) {
                this.animState = this.isSprinting ? "run" : "walk";
            } else {
                this.animState = "idle";
            }

            this.animTimer += dt * (this.isSprinting ? 10 : 6);
            this.animFrame = Math.floor(this.animTimer) % 4;
        }

        triggerAttackAnimation() {
            this.attackAnimCooldown = 0.25;
        }

        addBuff(buffData) {
            const existingIdx = this.activeBuffs.findIndex(b => b.id === buffData.id);
            const newBuff = {
                id: buffData.id,
                name: buffData.name || "Cổ Thuật",
                icon: buffData.icon || "✨",
                duration: buffData.duration || 8,
                maxDuration: buffData.duration || 8,
                statMods: buffData.statMods || {},
                shieldHp: buffData.shieldHp || 0,
                visualColor: buffData.visualColor || "#e0be77"
            };
            if (existingIdx >= 0) {
                this.activeBuffs[existingIdx] = newBuff;
            } else {
                this.activeBuffs.push(newBuff);
            }
            this.recalculateStats();
        }

        takeDamage(rawDamage, sourceName = "Đòn tấn công") {
            let actualDamage = rawDamage;
            if (!sourceName.includes("Khiếu Bích") && !sourceName.includes("Đồng Hóa")) {
                actualDamage = Math.max(1, rawDamage - this.def * 0.55);
            }

            for (const buff of this.activeBuffs) {
                if (buff.shieldHp && buff.shieldHp > 0) {
                    const absorbed = Math.min(buff.shieldHp, actualDamage);
                    buff.shieldHp -= absorbed;
                    actualDamage -= absorbed;
                    if (buff.shieldHp <= 0) buff.duration = 0;
                    if (actualDamage <= 0) break;
                }
            }

            this.hp = Math.max(0, Number((this.hp - actualDamage).toFixed(1)));
            return {
                damageTaken: Number(actualDamage.toFixed(1)),
                isDead: this.hp <= 0,
                source: sourceName
            };
        }

        heal(amount) {
            const before = this.hp;
            this.hp = Math.min(this.maxHp, Number((this.hp + amount).toFixed(1)));
            return Number((this.hp - before).toFixed(1));
        }

        addItem(itemId, count = 1) {
            if (!ITEM_DATABASE[itemId] || count <= 0) return false;
            if (itemId === "primeval_stone") {
                this.primevalStones += count;
                return true;
            }
            if (itemId === "immortal_stone") {
                this.immortalStones += count;
                const existing = this.inventory.find(i => i.id === itemId);
                if (existing) existing.count += count;
                else this.inventory.push({ id: itemId, count: count });
                return true;
            }
            const existing = this.inventory.find(i => i.id === itemId);
            if (existing) {
                existing.count += count;
            } else {
                this.inventory.push({ id: itemId, count: count });
            }
            return true;
        }

        removeItem(itemId, count = 1) {
            if (itemId === "primeval_stone") {
                if (this.primevalStones < count) return false;
                this.primevalStones -= count;
                return true;
            }
            const idx = this.inventory.findIndex(i => i.id === itemId);
            if (idx === -1 || this.inventory[idx].count < count) return false;

            this.inventory[idx].count -= count;
            if (itemId === "immortal_stone") {
                this.immortalStones = Math.max(0, this.immortalStones - count);
            }
            if (this.inventory[idx].count <= 0) {
                this.inventory.splice(idx, 1);
            }
            return true;
        }

        getItemCount(itemId) {
            if (itemId === "primeval_stone") return this.primevalStones;
            const found = this.inventory.find(i => i.id === itemId);
            return found ? found.count : 0;
        }

        useItem(itemId) {
            const meta = ITEM_DATABASE[itemId];
            if (!meta) return { success: false, message: "Vật phẩm không tồn tại." };
            if (this.getItemCount(itemId) <= 0) {
                return { success: false, message: `Không còn ${meta.name} trong hành trang.` };
            }

            if (meta.category === "relic_gu") {
                if (!this.aperture || this.aperture.rank !== meta.targetRank) {
                    return {
                        success: false,
                        message: `[${meta.name}] chỉ dùng được khi ngươi đang ở cảnh giới ${meta.targetRank} Chuyển!`
                    };
                }
                return this.useRelicGu(this.aperture);
            }

            if (itemId === "immortal_stone") {
                if (!this.aperture || !this.aperture.isImmortal) {
                    return { success: false, message: "Chỉ Cổ Tiên Lục Chuyển trở lên mới có thể luyện hóa Tiên Nguyên Thạch thành Tiên Nguyên!" };
                }
                this.removeItem(itemId, 1);
                this.aperture.immortalEssence[6] += 1;
                return { success: true, message: "Đã hấp thu 1 Tiên Nguyên Thạch, chuyển hóa thành 1 viên Lục Đề Tiên Nguyên!" };
            }

            if (itemId === "remnant_recipe") {
                return {
                    success: false,
                    message: "Hãy chuyển sang phân khu [⚗️ Luyện Đạo Các] và bấm nút 'Giải Mã Tàn Phương'!"
                };
            }

            if (!meta.hpRestore && !meta.staminaRestore && !meta.mentalRestore) {
                return {
                    success: false,
                    message: `${meta.name} là cổ tài nuôi dưỡng / hợp luyện. Hãy sử dụng trong mục [Kho Cổ] hoặc [Luyện Đạo Các].`
                };
            }

            this.removeItem(itemId, 1);
            const effects = [];
            if (meta.hpRestore) {
                const healed = this.heal(meta.hpRestore);
                effects.push(`+${healed} Sinh Mệnh`);
            }
            if (meta.staminaRestore) {
                this.stamina = Math.min(this.maxStamina, this.stamina + meta.staminaRestore);
                effects.push(`+${meta.staminaRestore}% Thể Lực`);
            }
            if (meta.mentalRestore) {
                this.mental = Math.min(this.maxMental, this.mental + meta.mentalRestore);
                effects.push(`+${meta.mentalRestore} Tinh Thần Lực`);
            }

            return {
                success: true,
                message: `Đã sử dụng ${meta.name} (${effects.join(", ")}).`
            };
        }

        getAlignmentTitle() {
            if (this.alignment >= 50) return `Chính Đạo Tiên Phong (+${this.alignment})`;
            if (this.alignment >= 15) return `Chính Đạo Cổ Sư (+${this.alignment})`;
            if (this.alignment <= -50) return `Đại Ma Đầu (${this.alignment})`;
            if (this.alignment <= -15) return `Ma Đạo Cổ Sư (${this.alignment})`;
            return `Tán Tu Trung Lập (${this.alignment})`;
        }

        // =====================================================================
        // 12. HỆ THỐNG DỰNG HÌNH PIXEL ART CHI TIẾT CHO 8 SKIN NHÂN VẬT
        // =====================================================================

        /**
         * Vẽ chi tiết ngoại hình Pixel Art của một Skin tại gốc tọa độ (0, 0)
         * Dùng chung cho cả Nhân vật trong trận chiến và Khung xem trước ở Menu
         */
        static drawSkinPixelSprite(ctx, skinCfg, state = {}) {
            const skin = skinCfg || CHARACTER_SKINS.phuong_nguyen;
            const bobY = state.bobY || 0;
            const legOffset = state.legOffset || 0;
            const armSwing = state.armSwing || 0;
            const facing = state.facing || "down";
            const t = performance.now() * 0.004;

            // 1. Vẽ hào quang đặc trưng của từng Skin (Hàn khí, Hồng liên, U hồn, Tinh tú...)
            ctx.beginPath();
            ctx.arc(0, -2, 18 + Math.sin(t) * 2, 0, Math.PI * 2);
            ctx.fillStyle = skin.auraColor;
            ctx.fill();

            // Hiệu ứng đặc biệt phía sau lưng theo từng nhân vật
            if (skin.specialFeature === "red_lotus_halo") {
                // Vòng sen vàng đỏ của Hồng Liên Ma Tôn
                ctx.strokeStyle = "#ffd700";
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.arc(0, -10 + bobY, 14, 0, Math.PI * 2);
                ctx.stroke();
            } else if (skin.specialFeature === "soul_shadows") {
                // Hư ảnh ma trảo 6 tay của U Hồn Ma Tôn
                ctx.fillStyle = "rgba(143, 110, 230, 0.45)";
                ctx.fillRect(-16, -12 + bobY, 5, 3);
                ctx.fillRect(11, -12 + bobY, 5, 3);
                ctx.fillRect(-15, -6 + bobY, 4, 3);
                ctx.fillRect(11, -6 + bobY, 4, 3);
            } else if (skin.specialFeature === "orbiting_stars") {
                // Tinh thần kỳ tử bay quanh Tinh Tú Tiên Tôn
                for (let s = 0; s < 3; s++) {
                    const ang = t * 1.4 + (s * Math.PI * 2) / 3;
                    const sx = Math.cos(ang) * 16;
                    const sy = -6 + Math.sin(ang) * 10;
                    ctx.fillStyle = "#7ef7f0";
                    ctx.fillRect(sx - 1.5, sy - 1.5, 3, 3);
                }
            } else if (skin.specialFeature === "frost_crystals") {
                // Tinh thể băng lơ lửng quanh Bạch Ngưng Băng
                const fy = -12 + Math.sin(t * 2) * 3;
                ctx.fillStyle = "#85c1e9";
                ctx.fillRect(-15, fy, 3, 3);
                ctx.fillRect(12, fy - 2, 3, 3);
            }

            // 2. Bóng đổ dưới chân
            ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
            ctx.beginPath();
            ctx.ellipse(0, 13, 11, 5, 0, 0, Math.PI * 2);
            ctx.fill();

            // 3. Tà áo choàng hoặc tóc dài xõa phía sau lưng
            if (skin.hairStyle === "long_flowing" || skin.hairStyle === "silver_long" || skin.hairStyle === "demonic_wild") {
                ctx.fillStyle = skin.hairColor;
                ctx.fillRect(-7, -8 + bobY, 14, 14);
            }

            // 4. Đôi hài / Chân bước
            ctx.fillStyle = "#181c22";
            ctx.fillRect(-6, 7 + legOffset, 4, 6);
            ctx.fillRect(2, 7 - legOffset, 4, 6);

            // 5. Thân Trường Bào / Chiến Giáp chính
            ctx.fillStyle = skin.robeColor;
            ctx.fillRect(-8, -6 + bobY, 16, 15);

            // Lớp áo khoác ngoài / Vạt áo phối màu thứ 2
            ctx.fillStyle = skin.robeSecondary;
            ctx.fillRect(-8, -6 + bobY, 4, 15);
            ctx.fillRect(4, -6 + bobY, 4, 15);

            // Viền cổ áo chữ V & Đai lưng
            ctx.fillStyle = skin.trimColor;
            ctx.fillRect(-3, -6 + bobY, 6, 4);
            ctx.fillRect(-2, -2 + bobY, 4, 11);

            ctx.fillStyle = skin.beltColor;
            ctx.fillRect(-8, 1 + bobY, 16, 2.5);

            // 6. Hai ống tay áo rộng cổ trang
            ctx.fillStyle = skin.robeColor;
            ctx.fillRect(-11, -5 + bobY + armSwing, 3, 10);
            ctx.fillRect(8, -5 + bobY - armSwing, 3, 10);
            ctx.fillStyle = skin.trimColor;
            ctx.fillRect(-11, 3 + bobY + armSwing, 3, 2);
            ctx.fillRect(8, 3 + bobY - armSwing, 3, 2);

            // 7. Khuôn mặt
            ctx.fillStyle = skin.skinTone;
            ctx.fillRect(-6, -15 + bobY, 12, 9);

            // 8. Kiểu tóc, Mão đầu & Trâm cài đặc trưng từng Skin
            ctx.fillStyle = skin.hairColor;
            ctx.fillRect(-7, -17 + bobY, 14, 4);

            // Tóc mai hai bên thái dương
            ctx.fillRect(-7, -14 + bobY, 2, 7);
            ctx.fillRect(5, -14 + bobY, 2, 7);

            // Búi tóc & Mão/Trâm trên đỉnh đầu
            ctx.fillRect(-3, -21 + bobY, 6, 4);
            ctx.fillStyle = skin.crownColor;

            if (skin.hairStyle === "immortal_lotus" || skin.hairStyle === "noble_crown") {
                // Mão hoa sen vàng / Kim quan
                ctx.fillRect(-5, -22 + bobY, 10, 3);
                ctx.fillRect(-2, -24 + bobY, 4, 2);
            } else if (skin.hairStyle === "war_helm") {
                // Chiến khôi Hắc Lâu Lan
                ctx.fillRect(-7, -19 + bobY, 14, 3);
                ctx.fillRect(-2, -23 + bobY, 4, 4);
            } else if (skin.hairStyle === "jade_hairpin") {
                // Trâm hoa ngọc bích Thương Tâm Từ
                ctx.fillRect(-6, -19 + bobY, 12, 2);
                ctx.fillStyle = "#ff85a2";
                ctx.fillRect(4, -20 + bobY, 3, 3);
            } else {
                // Trâm cài đạo quán Phương Nguyên / Bạch Ngưng Băng / Tinh Tú
                ctx.fillRect(-5, -19 + bobY, 10, 1.8);
            }

            // 9. Đôi mắt theo hướng nhìn
            if (facing !== "up") {
                const eyeShift = facing === "left" ? -2 : (facing === "right" ? 2 : 0);
                ctx.fillStyle = skin.eyeColor;
                ctx.fillRect(-4 + eyeShift, -11 + bobY, 2.2, 2.2);
                ctx.fillRect(2 + eyeShift, -11 + bobY, 2.2, 2.2);
            }
        }

        /**
         * Vẽ hình ảnh phóng to của một Skin lên các Canvas xem trước trong Menu
         * (`#creationSkinPreviewCanvas`, `#hubSkinPreviewCanvas`, `#hubTopAvatarCanvas`)
         */
        static renderSkinPreview(ctx, skinKey) {
            if (!ctx) return;
            const w = ctx.canvas.width;
            const h = ctx.canvas.height;
            const skin = CHARACTER_SKINS[skinKey] || CHARACTER_SKINS.phuong_nguyen;

            ctx.clearRect(0, 0, w, h);

            // Nền hào quang tròn phía sau
            const grad = ctx.createRadialGradient(w / 2, h / 2, 4, w / 2, h / 2, w * 0.5);
            grad.addColorStop(0, skin.auraColor);
            grad.addColorStop(1, "rgba(7, 9, 13, 0)");
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, h);

            const scale = w <= 56 ? 1.35 : 2.1;
            ctx.save();
            ctx.translate(w / 2, h / 2 + (w <= 56 ? 5 : 10));
            ctx.scale(scale, scale);

            PlayerManager.drawSkinPixelSprite(ctx, skin, {
                bobY: 0,
                legOffset: 0,
                armSwing: 0,
                facing: "down"
            });

            ctx.restore();
        }

        /**
         * Vẽ nhân vật trên Bản Đồ Chiến Đấu 2D (`#gameCanvas`)
         */
        render(ctx, camera) {
            if (!ctx) return;
            const screenX = Math.round(this.x - (camera ? camera.x : 0));
            const screenY = Math.round(this.y - (camera ? camera.y : 0));
            const skin = this.getSkinConfig();

            ctx.save();
            ctx.translate(screenX, screenY);

            // Vòng hộ thuẫn từ Cổ Phòng Ngự (Đồng Bì Cổ / Bạch Ngọc Cổ)
            for (const buff of this.activeBuffs) {
                if (buff.statMods && (buff.statMods.def > 0 || buff.shieldHp > 0)) {
                    ctx.beginPath();
                    ctx.arc(0, 0, 21, 0, Math.PI * 2);
                    ctx.strokeStyle = buff.visualColor || "rgba(224, 190, 119, 0.85)";
                    ctx.lineWidth = 2;
                    ctx.stroke();
                    break;
                }
            }

            let bobY = 0;
            let legOffset = 0;
            if (this.animState === "walk" || this.animState === "run") {
                bobY = (this.animFrame % 2 === 0) ? -2 : 0;
                legOffset = (this.animFrame === 1) ? 3 : (this.animFrame === 3 ? -3 : 0);
            }
            const armSwing = (this.animState === "attack") ? -5 : (legOffset * 0.7);

            PlayerManager.drawSkinPixelSprite(ctx, skin, {
                bobY: bobY,
                legOffset: legOffset,
                armSwing: armSwing,
                facing: this.facing
            });

            // Hiệu ứng kiếm khí / trảo ấn vung ra khi tấn công theo màu của Skin
            if (this.animState === "attack") {
                ctx.save();
                ctx.rotate(this.aimAngle);
                ctx.strokeStyle = skin.weaponColor || "#e3c178";
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(6, 0, 19, -0.75, 0.75);
                ctx.stroke();
                ctx.restore();
            }

            ctx.restore();
        }

        // =====================================================================
        // 13. LƯU & KHÔI PHỤC DỮ LIỆU (BAO GỒM SKIN NHÂN VẬT)
        // =====================================================================

        toSaveData() {
            return {
                name: this.name,
                skinId: this.skinId,
                region: this.region,
                origin: this.origin,
                alignment: this.alignment,
                fame: this.fame,
                kills: this.kills,
                baseMaxHp: this.baseMaxHp,
                hp: this.hp,
                baseAtk: this.baseAtk,
                baseDef: this.baseDef,
                baseSpd: this.baseSpd,
                baseVision: this.baseVision,
                baseMaxMental: this.baseMaxMental,
                mental: this.mental,
                stamina: this.stamina,
                primevalStones: this.primevalStones,
                meritPoints: this.meritPoints,
                immortalStones: this.immortalStones,
                refinementBonus: this.refinementBonus,
                tradeDiscount: this.tradeDiscount,
                mainPath: this.mainPath,
                daoMarks: this.daoMarks,
                pathAttainment: this.pathAttainment,
                dreamClears: this.dreamClears,
                inventory: this.inventory
            };
        }

        fromSaveData(data) {
            if (!data) return;
            this.name = data.name || "Cổ Nguyệt Phương Nguyên";
            this.skinId = CHARACTER_SKINS[data.skinId] ? data.skinId : "phuong_nguyen";
            this.region = data.region || "nam_cuong";
            this.origin = data.origin || "righteous_clan";
            this.alignment = typeof data.alignment === "number" ? data.alignment : 20;
            this.fame = data.fame || 0;
            this.kills = data.kills || 0;
            if (typeof data.baseMaxHp === "number") this.baseMaxHp = data.baseMaxHp;
            if (typeof data.baseAtk === "number") this.baseAtk = data.baseAtk;
            if (typeof data.baseDef === "number") this.baseDef = data.baseDef;
            if (typeof data.baseSpd === "number") this.baseSpd = data.baseSpd;
            if (typeof data.baseVision === "number") this.baseVision = data.baseVision;
            if (typeof data.baseMaxMental === "number") this.baseMaxMental = data.baseMaxMental;

            this.primevalStones = typeof data.primevalStones === "number" ? data.primevalStones : 60;
            this.meritPoints = typeof data.meritPoints === "number" ? data.meritPoints : 100;
            this.immortalStones = typeof data.immortalStones === "number" ? data.immortalStones : 0;
            this.refinementBonus = data.refinementBonus || 0;
            this.tradeDiscount = data.tradeDiscount || 0;
            this.mainPath = data.mainPath || "Quang Đạo";

            if (data.daoMarks) this.daoMarks = { ...this.daoMarks, ...data.daoMarks };
            if (data.pathAttainment) this.pathAttainment = { ...this.pathAttainment, ...data.pathAttainment };
            if (data.dreamClears) this.dreamClears = { ...data.dreamClears };
            if (Array.isArray(data.inventory)) this.inventory = data.inventory;

            this.recalculateStats();
            if (typeof data.hp === "number") this.hp = Math.min(this.maxHp, data.hp);
            if (typeof data.mental === "number") this.mental = Math.min(this.maxMental, data.mental);
        }
    }

    PlayerManager.CHARACTER_SKINS = CHARACTER_SKINS;
    PlayerManager.FIVE_REGIONS = FIVE_REGIONS;
    PlayerManager.FACTION_ORIGINS = FACTION_ORIGINS;
    PlayerManager.ORIGIN_CONFIGS = FACTION_ORIGINS;
    PlayerManager.DAO_PATHS = DAO_PATHS;
    PlayerManager.ITEM_DATABASE = ITEM_DATABASE;
    PlayerManager.DREAM_REALMS = DREAM_REALMS;

    global.PlayerManager = PlayerManager;

})(window);