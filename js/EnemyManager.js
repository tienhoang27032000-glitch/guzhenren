/**
 * VẠN CỔ TIÊN ĐỒ - MODULE AI QUÁI VẬT, SONG TÔN CỬU CHUYỂN BẤT BẠI, NPC & THẾ LỰC (EnemyManager.js)
 * Cập nhật:
 *  - Khóa chặt toàn bộ cơ chế Tôn Giả (Kháng Sốc Sát Thương, Song Tôn Liên Thủ, Niết Bàn Trọng Sinh,
 *    Đạo Ngân Xuyên Giáp) chỉ áp dụng duy nhất cho thực thể có cờ `isVenerable === true` (Song Tôn).
 *  - Các quái thường và Tinh Anh khác trong Phong Ma Quật hoàn toàn không nhận hiệu ứng của Song Tôn.
 */

(function (global) {
    "use strict";

    // =========================================================================
    // 1. DỮ LIỆU MẪU DÃ THÚ, BÁCH THÚ VƯƠNG & HOANG THÚ
    // =========================================================================

    const BEAST_TEMPLATES = {
        green_wolf: {
            typeId: "green_wolf",
            name: "Thanh Mao Điện Lang",
            title: "Dã Thú Nhất Chuyển",
            icon: "🐺",
            rank: 1,
            hp: 95,
            atk: 14,
            def: 4,
            spd: 122,
            aggroRange: 280,
            attackRange: 42,
            rangedGuId: null,
            color: "#3b6e52",
            regions: ["wild_forest", "mortal_village", "clan_territory"],
            drops: [
                { itemId: "ration_meat", chance: 0.75, min: 1, max: 2 },
                { itemId: "primeval_stone", chance: 0.25, min: 1, max: 2 }
            ]
        },
        iron_boar: {
            typeId: "iron_boar",
            name: "Thiết Bì Dã Trư",
            title: "Dã Thú Nhất Chuyển",
            icon: "🐗",
            rank: 1,
            hp: 155,
            atk: 18,
            def: 10,
            spd: 105,
            aggroRange: 260,
            attackRange: 44,
            rangedGuId: null,
            color: "#6e655f",
            regions: ["wild_forest", "spirit_spring"],
            drops: [
                { itemId: "ration_meat", chance: 0.80, min: 1, max: 2 },
                { itemId: "bronze_ore", chance: 0.35, min: 1, max: 1 },
                { itemId: "primeval_stone", chance: 0.25, min: 1, max: 2 }
            ]
        },
        wind_falcon: {
            typeId: "wind_falcon",
            name: "Thanh Phong Linh Điêu",
            title: "Dị Thú Nhị Chuyển",
            icon: "🦅",
            rank: 2,
            hp: 240,
            atk: 28,
            def: 12,
            spd: 148,
            aggroRange: 340,
            attackRange: 250,
            rangedGuId: "phong_nhan_gu",
            projectileColor: "#5cc995",
            color: "#48a888",
            regions: ["high_mountain", "spirit_spring"],
            drops: [
                { itemId: "wind_essence_crystal", chance: 0.40, min: 1, max: 1 },
                { itemId: "primeval_stone", chance: 0.30, min: 1, max: 3 }
            ]
        },
        thunder_wolf_king: {
            typeId: "thunder_wolf_king",
            name: "Lôi Quan Đầu Lang",
            title: "Bách Thú Vương (Nhị Chuyển)",
            icon: "⚡",
            rank: 2,
            hp: 460,
            atk: 42,
            def: 22,
            spd: 136,
            aggroRange: 380,
            attackRange: 270,
            rangedGuId: "dien_nhan_gu",
            projectileColor: "#6ce6b8",
            color: "#5aa9e6",
            isBoss: true,
            regions: ["wild_forest", "danger_beast_zone"],
            drops: [
                { itemId: "beast_blood_core", chance: 0.75, min: 1, max: 2 },
                { itemId: "primeval_stone", chance: 0.80, min: 5, max: 10 },
                { wildGuId: "thanh_phong_gu", wildRank: 2, chance: 0.30 }
            ]
        },
        blood_bat_king: {
            typeId: "blood_bat_king",
            name: "Huyết Dực Biên Bức Vương",
            title: "Bách Thú Vương (Nhị Chuyển)",
            icon: "🦇",
            rank: 2,
            hp: 420,
            atk: 46,
            def: 18,
            spd: 148,
            aggroRange: 380,
            attackRange: 260,
            rangedGuId: "huyet_nguyet_gu",
            projectileColor: "#e03e3e",
            color: "#b82828",
            isBoss: true,
            regions: ["blood_cave", "danger_beast_zone"],
            drops: [
                { itemId: "beast_blood_core", chance: 0.80, min: 1, max: 2 },
                { itemId: "primeval_stone", chance: 0.80, min: 6, max: 12 },
                { wildGuId: "huyet_nguyet_gu", wildRank: 2, chance: 0.35 }
            ]
        },
        frost_python_lord: {
            typeId: "frost_python_lord",
            name: "Hàn Sương Bạch Ngọc Mãng",
            title: "Thiên Thú Vương (Tam Chuyển)",
            icon: "🐍",
            rank: 3,
            hp: 1150,
            atk: 82,
            def: 45,
            spd: 130,
            aggroRange: 420,
            attackRange: 300,
            rangedGuId: "han_bang_gu",
            projectileColor: "#85c1e9",
            color: "#85c1e9",
            isBoss: true,
            regions: ["high_mountain", "sect_domain", "danger_beast_zone"],
            drops: [
                { itemId: "beast_blood_core", chance: 0.85, min: 1, max: 2 },
                { itemId: "red_iron_ore", chance: 0.70, min: 1, max: 2 },
                { itemId: "primeval_stone", chance: 0.85, min: 12, max: 22 },
                { wildGuId: "ngoc_bi_gu", wildRank: 3, chance: 0.35 }
            ]
        },
        ancient_rock_behemoth: {
            typeId: "ancient_rock_behemoth",
            name: "Thái Cổ Huyền Thạch Cự Tượng",
            title: "Vạn Thú Vương (Tứ Chuyển)",
            icon: "🦣",
            rank: 4,
            hp: 3200,
            atk: 175,
            def: 110,
            spd: 118,
            aggroRange: 450,
            attackRange: 330,
            rangedGuId: "van_kiem_quy_tong_gu",
            projectileColor: "#f7c948",
            color: "#d4af37",
            isBoss: true,
            regions: ["danger_beast_zone", "secret_realm"],
            drops: [
                { itemId: "soul_crystal", chance: 0.75, min: 1, max: 2 },
                { itemId: "beast_blood_core", chance: 0.90, min: 2, max: 3 },
                { itemId: "primeval_stone", chance: 0.90, min: 25, max: 45 },
                { wildGuId: "kim_chung_trao_gu", wildRank: 4, chance: 0.35 }
            ]
        },
        desolate_thunder_dragon: {
            typeId: "desolate_thunder_dragon",
            name: "Thái Cổ Lôi Giao Hoang Thú",
            title: "Thượng Cổ Hoang Thú (Lục Chuyển+)",
            icon: "🐉",
            rank: 6,
            hp: 28000,
            atk: 650,
            def: 420,
            spd: 152,
            aggroRange: 520,
            attackRange: 380,
            rangedGuId: "thai_co_long_luc_gu",
            projectileColor: "#b75cff",
            color: "#b75cff",
            isBoss: true,
            regions: ["secret_realm"],
            drops: [
                { itemId: "immortal_stone", chance: 0.50, min: 1, max: 2 },
                { itemId: "soul_crystal", chance: 0.90, min: 2, max: 3 },
                { itemId: "primeval_stone", chance: 1.0, min: 80, max: 150 }
            ]
        }
    };

    // =========================================================================
    // 2. DỮ LIỆU THẾ LỰC & NPC CỔ SƯ SỐNG ĐỘNG
    // =========================================================================

    const INITIAL_FACTIONS = [
        {
            id: "thanh_son_clan",
            name: "Cổ Nguyệt Sơn Trại",
            leader: "Tộc trưởng Cổ Nguyệt Bác (Tứ Chuyển)",
            territory: "Thanh Mao Sơn",
            alignment: "Chính Đạo",
            power: 680,
            resources: 1200,
            standingScore: 20,
            standingWithPlayer: "Thân thiện (+20)"
        },
        {
            id: "van_thuong_guild",
            name: "Thương Gia Thương Hội",
            leader: "Thương Yến Phi (Ngũ Chuyển)",
            territory: "Thương Gia Thành",
            alignment: "Trung Lập",
            power: 1450,
            resources: 4200,
            standingScore: 10,
            standingWithPlayer: "Hợp tác (+10)"
        },
        {
            id: "han_suong_sect",
            name: "Tiên Hạc Môn",
            leader: "Thái Thượng Đại Trưởng Lão (Lục Chuyển)",
            territory: "Trung Châu",
            alignment: "Chính Đạo",
            power: 2800,
            resources: 5600,
            standingScore: 0,
            standingWithPlayer: "Trung lập (0)"
        },
        {
            id: "huyet_ma_cult",
            name: "Ảnh Tông — Cương Minh",
            leader: "Ảnh Vô Tà / Bạc Thanh Tàn Hồn (Thất Chuyển)",
            territory: "Nghĩa Thiên Sơn",
            alignment: "Ma Đạo",
            power: 3500,
            resources: 3800,
            standingScore: -25,
            standingWithPlayer: "Cảnh giác (-25)"
        }
    ];

    const INITIAL_NPCS = [
        {
            id: "npc_luc_thanh_y",
            name: "Cổ Nguyệt Thanh Thư",
            title: "Đệ Nhất Tinh Anh Cổ Nguyệt Tộc",
            age: 19,
            aptitude: "Ất Đẳng (82%)",
            rank: 2,
            factionId: "thanh_son_clan",
            factionName: "Cổ Nguyệt Sơn Trại",
            personality: "Ôn hòa, trọng tình nghĩa gia tộc",
            goal: "Bảo vệ sơn trại vượt qua Lang Triều",
            x: 2160,
            y: 2180,
            homeX: 2160,
            homeY: 2180,
            hp: 320,
            maxHp: 320,
            atk: 35,
            def: 16,
            spd: 120,
            primevalStones: 85,
            relation: 25,
            color: "#3b8beb",
            equippedGu: "nguyet_quang_gu",
            equippedGuRank: 2,
            shopInventory: [
                { itemId: "spirit_herb", name: "Thanh Linh Thảo", icon: "🌿", price: 6, stock: 5, desc: "Hồi 40 Sinh Mệnh & 20 Tinh Thần Lực." },
                { itemId: "moon_orchid", name: "Nguyệt Lan Hoa", icon: "🌸", price: 12, stock: 4, desc: "Thức ăn của Nguyệt Quang Cổ & Hàn Sương Cổ." }
            ]
        },
        {
            id: "npc_luc_ba_thien",
            name: "Cổ Nguyệt Dược Cơ",
            title: "Gia Lão Dược Đường",
            age: 56,
            aptitude: "Ất Đẳng (68%)",
            rank: 3,
            factionId: "thanh_son_clan",
            factionName: "Cổ Nguyệt Sơn Trại",
            personality: "Nghiêm khắc, thực dụng",
            goal: "Thu thập dược liệu luyện chế Xuân Quang Cổ Tam Chuyển",
            x: 2520,
            y: 2120,
            homeX: 2520,
            homeY: 2120,
            hp: 680,
            maxHp: 680,
            atk: 72,
            def: 35,
            spd: 112,
            primevalStones: 340,
            relation: 15,
            color: "#4cd964",
            equippedGu: "hoi_xuong_gu",
            equippedGuRank: 3,
            shopInventory: [
                { guId: "hoi_xuong_gu", guRank: 1, name: "Xuân Quang Cổ Nhất Chuyển", icon: "💚", price: 48, stock: 2, desc: "Phàm cổ trị liệu Mộc Đạo (Có thể thăng lên 5 Chuyển)." },
                { guId: "trinh_sat_gu", guRank: 1, name: "Địa Thính Nhục Nhĩ Thảo Nhất Chuyển", icon: "👁️", price: 38, stock: 2, desc: "Phàm cổ trinh sát giúp đạn Sát Chiêu tự truy kích." },
                { itemId: "ration_meat", name: "Thịt Thú Rừng Tươi", icon: "🍖", price: 4, stock: 10, desc: "Thức ăn nuôi Hắc Thỉ Cổ & Bạch Thỉ Cổ." }
            ]
        },
        {
            id: "npc_kim_van_tai",
            name: "Thương Tâm Từ",
            title: "Tiểu Thư Thương Gia Thương Đội",
            age: 18,
            aptitude: "Ất Đẳng (75%)",
            rank: 2,
            factionId: "van_thuong_guild",
            factionName: "Thương Gia Thương Hội",
            personality: "Nhân hậu, trọng chữ tín",
            goal: "Kinh doanh cổ trùng tại Thương Gia Thành",
            x: 2650,
            y: 2550,
            homeX: 2650,
            homeY: 2550,
            hp: 380,
            maxHp: 380,
            atk: 38,
            def: 20,
            spd: 118,
            primevalStones: 620,
            relation: 30,
            color: "#5cc995",
            equippedGu: "thuy_trao_gu",
            equippedGuRank: 2,
            shopInventory: [
                { guId: "tuu_trung_gu", guRank: 1, name: "Tửu Trùng Nhất Chuyển", icon: "🍶", price: 75, stock: 1, desc: "Tinh luyện chân nguyên, giảm 25% tiêu hao Sát Chiêu." },
                { guId: "hoa_cau_gu", guRank: 1, name: "Xích Diễm Cổ Nhất Chuyển", icon: "🔥", price: 45, stock: 2, desc: "Phàm cổ Viêm Đạo nổ vùng chỉ định (1–5 Chuyển)." },
                { guId: "han_bang_gu", guRank: 1, name: "Hàn Sương Cổ Nhất Chuyển", icon: "❄️", price: 44, stock: 2, desc: "Phàm cổ Băng Đạo làm chậm & đóng băng mục tiêu." },
                { itemId: "red_iron_ore", name: "Xích Thiết Tinh Khoáng", icon: "🧱", price: 20, stock: 4, desc: "Phụ liệu thăng Chuyển cổ trùng Kim/Viêm/Kiếm." },
                { itemId: "wind_essence_crystal", name: "Phong Tuyền Tinh Thạch", icon: "🎐", price: 22, stock: 4, desc: "Phụ liệu thăng Chuyển cổ trùng Phong Đạo." }
            ]
        },
        {
            id: "npc_han_nhu_suong",
            name: "Bạch Ngưng Băng",
            title: "Bắc Minh Băng Phách Thể",
            age: 19,
            aptitude: "Thập Tuyệt Thể (100%)",
            rank: 3,
            factionId: "han_suong_sect",
            factionName: "Bạch Gia Trại",
            personality: "Lạnh lùng, truy cầu sự đặc sắc sinh tử",
            goal: "Tìm kiếm đối thủ xứng tầm trên thế gian",
            x: 2150,
            y: 2620,
            homeX: 2150,
            homeY: 2620,
            hp: 820,
            maxHp: 820,
            atk: 98,
            def: 42,
            spd: 140,
            primevalStones: 380,
            relation: 5,
            color: "#85c1e9",
            equippedGu: "bang_tuyet_phong_gu",
            equippedGuRank: 3,
            shopInventory: [
                { guId: "bang_tuyet_phong_gu", guRank: 3, name: "Băng Tinh Tuyết Hoa Cổ Tam Chuyển", icon: "❄️", price: 420, stock: 1, desc: "Linh cổ Băng Đạo (Có thể thăng lên 9 Chuyển)." },
                { itemId: "soul_crystal", name: "Đãng Hồn Thạch Đan", icon: "🔮", price: 48, stock: 3, desc: "Khôi phục 85 Tinh Thần Lực & thăng Chuyển cổ Tứ Chuyển+." }
            ]
        },
        {
            id: "npc_le_huyet_cuong",
            name: "Huyết Thủ Ma Quân",
            title: "Cự Phách Ma Đạo",
            age: 42,
            aptitude: "Giáp Đẳng (86%)",
            rank: 4,
            factionId: "huyet_ma_cult",
            factionName: "Ảnh Tông — Cương Minh",
            personality: "Tàn nhẫn, đa nghi",
            goal: "Thu thập Bách Thú Tinh Huyết luyện Huyết Đạo Tiên Cổ",
            x: 2720,
            y: 2260,
            homeX: 2720,
            homeY: 2260,
            hp: 1450,
            maxHp: 1450,
            atk: 145,
            def: 65,
            spd: 132,
            primevalStones: 520,
            relation: -10,
            color: "#e05252",
            equippedGu: "huyet_nguyet_gu",
            equippedGuRank: 4,
            shopInventory: [
                { guId: "huyet_nguyet_gu", guRank: 2, name: "Huyết Nguyệt Cổ Nhị Chuyển", icon: "🩸", price: 135, stock: 2, desc: "Linh cổ Huyết Đạo hút 25% máu (Thăng được 1–9 Chuyển)." },
                { itemId: "beast_blood_core", name: "Bách Thú Tinh Huyết", icon: "🩸", price: 20, stock: 6, desc: "Tinh huyết Bách Thú Vương dùng cho Huyết/Lực Đạo." }
            ]
        }
    ];

    // =========================================================================
    // 3. LỚP QUẢN LÝ QUÁI VẬT, SONG TÔN CỬU CHUYỂN, NPC & THẾ LỰC (ENEMYMANAGER)
    // =========================================================================

    class EnemyManager {
        constructor() {
            this.map = null;
            this.player = null;
            this.guSystem = null;
            this.ui = null;

            this.beasts = [];
            this.npcs = [];
            this.factions = [];
            this.quests = [];

            this.nextBeastId = 1;
            this.worldSimulationTimer = 0;
            this.marketFluctuationFactor = 1.0;

            this.reset();
        }

        init(systems) {
            this.map = systems.map || null;
            this.player = systems.player || null;
            this.guSystem = systems.guSystem || null;
            this.ui = systems.ui || null;
        }

        reset() {
            this.beasts = [];
            this.npcs = [];
            this.factions = JSON.parse(JSON.stringify(INITIAL_FACTIONS));
            this.quests = this._createInitialQuests();
            this.nextBeastId = 1;
            this.worldSimulationTimer = 25;
            this.marketFluctuationFactor = 1.0;

            this._spawnInitialBeasts();
            this._spawnInitialNpcs();
        }

        // =====================================================================
        // 4. KHỞI TẠO NHIỆM VỤ, DÃ THÚ & NPC CỔ SƯ
        // =====================================================================

        _createInitialQuests() {
            return [
                {
                    id: "q_hunt_wolves",
                    title: "Thanh Trừ Dã Thú Quanh Chiến Trường",
                    category: "Chính Đạo",
                    type: "kill_beast",
                    progress: 0,
                    target: 5,
                    completed: false,
                    rewardStones: 35,
                    rewardHumanQi: 8,
                    rewardText: "35 Nguyên Thạch + 8 Nhân Khí + Hảo cảm Cổ Nguyệt Sơn Trại",
                    description: "Đàn dã thú và cổ sư địch đang uy hiếp chiến trường. Hãy tiêu diệt 5 mục tiêu trong ải."
                },
                {
                    id: "q_gather_resources",
                    title: "Tích Lũy Tư Lương Tu Luyện",
                    category: "Trung Lập",
                    type: "harvest_node",
                    progress: 0,
                    target: 4,
                    completed: false,
                    rewardStones: 25,
                    rewardHumanQi: 5,
                    rewardText: "25 Nguyên Thạch + 5 Nhân Khí + 1x Nguyệt Lan Hoa",
                    description: "Đến các mỏ khoáng hoặc bụi thảo dược rải rác trên bản đồ, nhấn phím [E] khai thác 4 lần tài nguyên."
                },
                {
                    id: "q_slay_beast_king",
                    title: "Trảm Sát Thủ Lĩnh Chinh Phạt",
                    category: "Cơ Duyên",
                    type: "kill_boss",
                    progress: 0,
                    target: 1,
                    completed: false,
                    rewardStones: 80,
                    rewardHumanQi: 20,
                    rewardText: "80 Nguyên Thạch + 20 Nhân Khí + 1x Đãng Hồn Thạch Đan",
                    description: "Đánh bại một Thủ Lĩnh Ải (Bách Thú Vương, Tộc Trưởng, Cổ Tiên hoặc Tôn Giả) trong Bản Đồ Lịch Luyện."
                }
            ];
        }

        _spawnInitialBeasts() {
            this.beasts = [];
            const regions = (global.MapManager && global.MapManager.WORLD_REGIONS) || [];

            for (const reg of regions) {
                if (reg.id === "trade_city") continue;

                const matchingTemplates = Object.values(BEAST_TEMPLATES).filter(
                    t => t.regions.includes(reg.id)
                );
                if (matchingTemplates.length === 0) continue;

                const count = reg.id === "clan_territory" ? 2 : 5;
                for (let i = 0; i < count; i++) {
                    const tpl = matchingTemplates[i % matchingTemplates.length];
                    const bx = Math.round(reg.x + 80 + Math.random() * (reg.width - 160));
                    const by = Math.round(reg.y + 80 + Math.random() * (reg.height - 160));
                    this._createBeastEntity(tpl, bx, by, reg.id);
                }
            }
        }

        _createBeastEntity(tpl, x, y, regionId) {
            const beast = {
                id: `beast_${this.nextBeastId++}`,
                entityType: "beast",
                typeId: tpl.typeId,
                name: tpl.name,
                title: tpl.title,
                icon: tpl.icon,
                rank: tpl.rank,
                isBoss: Boolean(tpl.isBoss),
                isElite: false,
                isHuman: false,
                isVenerable: false,
                x: x,
                y: y,
                spawnX: x,
                spawnY: y,
                regionId: regionId,
                radius: tpl.isBoss ? 20 : 14,
                hp: tpl.hp,
                maxHp: tpl.hp,
                shieldHp: 0,
                maxShieldHp: 0,
                atk: tpl.atk,
                def: tpl.def,
                spd: tpl.spd,
                aggroRange: tpl.aggroRange,
                attackRange: tpl.attackRange,
                rangedGuId: tpl.rangedGuId || null,
                projectileColor: tpl.projectileColor || "#5cc995",
                color: tpl.color,
                drops: tpl.drops || [],

                aiState: "patrol",
                patrolTargetX: x,
                patrolTargetY: y,
                patrolTimer: 2 + Math.random() * 4,
                attackCooldown: 0,
                dashSkillCooldown: 4 + Math.random() * 4,
                slowTimer: 0,
                slowFactor: 1.0,
                calledAllies: false,
                isHostile: true,
                isDead: false,
                respawnTimer: 0
            };

            this.beasts.push(beast);
            return beast;
        }

        _spawnInitialNpcs() {
            this.npcs = INITIAL_NPCS.map(cfg => this._hydrateNpcObject({ ...cfg }));
        }

        _hydrateNpcObject(npcData) {
            const npc = {
                ...npcData,
                entityType: "npc",
                radius: 14,
                isDead: Boolean(npcData.isDead),
                isHostile: Boolean(npcData.isHostile),
                lethalCombat: Boolean(npcData.lethalCombat),
                aiState: npcData.aiState || "idle",
                aiStateText: npcData.aiStateText || "Đang tuần tra lãnh địa",
                aiTimer: 3 + Math.random() * 5,
                targetX: npcData.x,
                targetY: npcData.y,
                attackCooldown: 0,
                slowTimer: 0,
                slowFactor: 1.0,
                respawnTimer: npcData.respawnTimer || 0
            };

            npc.getGreetingDialogue = (player) => {
                if (npc.relation >= 30) {
                    return `Đạo hữu ${player ? player.name : ""} đến thật đúng lúc! Gần đây thiên địa linh khí biến động, ta vừa thu thập được ít cổ tài thượng hạng.`;
                }
                if (npc.relation < 0) {
                    return `Hừ, khí tức trên người ngươi đầy mùi máu tanh. Nếu không có việc giao dịch bằng Nguyên Thạch thì chớ lại gần ta!`;
                }
                return `Tại hạ là ${npc.name} thuộc ${npc.factionName}. Thế giới Cổ Sư cá lớn nuốt cá bé, muốn sống sót thì phải không ngừng thăng Chuyển Cổ Trùng và Sát Chiêu.`;
            };

            npc.becomeHostile = (isLethal = false) => {
                npc.isHostile = true;
                npc.lethalCombat = Boolean(isLethal);
                npc.aiState = "combat";
                npc.aiStateText = isLethal ? "Đang tử chiến với ngươi!" : "Đang tỷ thí cổ thuật";
                if (isLethal) {
                    npc.relation = Math.min(-50, npc.relation - 60);
                }
            };

            return npc;
        }

        // =====================================================================
        // 5. VÒNG LẶP CẬP NHẬT AI QUÁI VẬT, AI BOSS CỔ SƯ / TÔN GIẢ & NPC
        // =====================================================================

        update(dt, player, mapManager, combatSystem) {
            for (const beast of this.beasts) {
                if (beast.isDead) {
                    beast.respawnTimer -= dt;
                    if (beast.respawnTimer <= 0) {
                        beast.isDead = false;
                        beast.hp = beast.maxHp;
                        beast.shieldHp = 0;
                        beast.x = beast.spawnX;
                        beast.y = beast.spawnY;
                        beast.aiState = "patrol";
                        beast.calledAllies = false;
                    }
                    continue;
                }

                if (beast.isHuman) {
                    this._updateHumanCultivatorAI(beast, dt, player, mapManager, combatSystem);
                } else {
                    this._updateBeastAI(beast, dt, player, mapManager, combatSystem);
                }
            }

            for (const npc of this.npcs) {
                if (npc.isDead) {
                    npc.respawnTimer -= dt;
                    if (npc.respawnTimer <= 0) {
                        npc.isDead = false;
                        npc.isHostile = false;
                        npc.hp = npc.maxHp;
                        npc.x = npc.homeX;
                        npc.y = npc.homeY;
                        npc.aiState = "cultivate";
                        npc.aiStateText = "Vừa bình phục thương thế";
                    }
                    continue;
                }
                this._updateNpcAI(npc, dt, player, mapManager, combatSystem);
            }

            this.worldSimulationTimer -= dt;
            if (this.worldSimulationTimer <= 0) {
                this.worldSimulationTimer = 45;
                this._simulateWorldAndFactions();
            }
        }

        // =====================================================================
        // 6. AI CHIẾN ĐẤU CỦA BOSS NGƯỜI & SONG TÔN CỬU CHUYỂN (CHỈ ÁP DỤNG CHO ISVENERABLE)
        // =====================================================================

        /**
         * Tính toán sát thương thực tế:
         * CHỈ RIÊNG Song Tôn (`boss.isVenerable === true`) mới có Đạo Ngân Cửu Chuyển Xuyên Giáp.
         * Các quái và Tinh Anh khác trong Phong Ma Quật hoàn toàn dùng sát thương cơ bản (`boss.atk`).
         */
        _computeBossEffectiveDamage(boss, player, scaleMult = 1.0) {
            const isVen = Boolean(boss.isVenerable);
            const enrageMult = boss.enraged ? 1.55 : 1.0;

            if (!player) return Math.round(boss.atk * scaleMult * enrageMult);

            if (isVen) {
                const armorBypassPart = Math.round((player.def || 0) * 0.56);
                const maxHpPercentPart = Math.round((player.maxHp || 1000) * (boss.enraged ? 0.16 : 0.11) * scaleMult);
                const rawVenPart = Math.round(boss.atk * 0.45 * scaleMult * enrageMult);
                return armorBypassPart + Math.max(maxHpPercentPart, rawVenPart);
            }

            return Math.round(boss.atk * scaleMult * enrageMult);
        }

        _updateHumanCultivatorAI(boss, dt, player, mapManager, combatSystem) {
            const isVen = Boolean(boss.isVenerable);
            const cdSpeedMult = (isVen && boss.enraged) ? 1.65 : 1.0;

            if (boss.attackCooldown > 0) boss.attackCooldown -= dt * cdSpeedMult;
            if (boss.guSkillCooldown > 0) boss.guSkillCooldown -= dt * cdSpeedMult;
            if (boss.defGuCooldown > 0) boss.defGuCooldown -= dt * cdSpeedMult;
            if (boss.moveGuCooldown > 0) boss.moveGuCooldown -= dt * cdSpeedMult;
            if (boss.healGuCooldown > 0) boss.healGuCooldown -= dt * cdSpeedMult;
            if (boss.killerMoveCooldown > 0) boss.killerMoveCooldown -= dt * cdSpeedMult;

            // Làm mới cửa sổ giới hạn sát thương & hồi phục Tiên Khiếu CHỈ RIÊNG cho Song Tôn (isVenerable)
            if (isVen) {
                boss.dmgWindowTimer = (boss.dmgWindowTimer || 0) + dt;
                if (boss.dmgWindowTimer >= 1.0) {
                    boss.dmgWindowTimer = 0;
                    boss.damageTakenThisSecond = 0;
                    boss.throttleNotified = false;
                }

                if (boss.hp > 0 && boss.hp < boss.maxHp) {
                    const regenPerSec = boss.maxHp * (boss.enraged ? 0.008 : 0.004);
                    boss.hp = Math.min(boss.maxHp, Math.round(boss.hp + regenPerSec * dt));
                }
            }

            if (boss.slowTimer > 0) {
                boss.slowTimer -= dt;
                if (boss.slowTimer <= 0) boss.slowFactor = 1.0;
            }

            if (!player || player.hp <= 0) return;

            const effectiveSpd = boss.spd * boss.slowFactor * (boss.enraged ? 1.30 : 1.0);
            const distToPlayer = Math.hypot(player.x - boss.x, player.y - boss.y);
            const angleToPlayer = Math.atan2(player.y - boss.y, player.x - boss.x);

            // A. Xử lý khi Boss / Tôn Giả đang tụ khí thi triển Sát Chiêu (Telegraph Warning)
            if (boss.telegraphState) {
                if (isVen && boss.telegraphState.timer > boss.telegraphState.maxTimer * 0.35) {
                    boss.telegraphState.x += (player.x - boss.telegraphState.x) * dt * 3.8;
                    boss.telegraphState.y += (player.y - boss.telegraphState.y) * dt * 3.8;
                }
                boss.telegraphState.timer -= dt;
                if (boss.telegraphState.timer <= 0) {
                    const ts = boss.telegraphState;
                    boss.telegraphState = null;
                    this._executeBossKillerMoveImpact(boss, ts, player, combatSystem);
                }
                return;
            }

            // B. Khi chưa phát hiện người chơi ở xa -> Tuần tra
            if (distToPlayer > (boss.aggroRange || 560) * 1.4 && !boss.isStageBoss) {
                boss.patrolTimer = (boss.patrolTimer || 0) - dt;
                if (boss.patrolTimer <= 0) {
                    boss.patrolTimer = 3 + Math.random() * 4;
                    boss.patrolTargetX = boss.spawnX + (Math.random() - 0.5) * 420;
                    boss.patrolTargetY = boss.spawnY + (Math.random() - 0.5) * 420;
                }
                const dPatrol = Math.hypot(boss.patrolTargetX - boss.x, boss.patrolTargetY - boss.y);
                if (dPatrol > 16) {
                    const pAng = Math.atan2(boss.patrolTargetY - boss.y, boss.patrolTargetX - boss.x);
                    this._moveEntity(boss, Math.cos(pAng) * effectiveSpd * 0.55, Math.sin(pAng) * effectiveSpd * 0.55, dt, mapManager);
                }
                return;
            }

            // C. Bật Cổ Trùng / Sát Chiêu Phòng Ngự (Chỉ Boss hoặc Tinh Anh mới bật khiên, quái thường không bật)
            if (boss.isStageBoss || boss.isElite) {
                const shieldTriggerHpRatio = isVen ? 1.0 : 0.85;
                if (
                    (!boss.shieldHp || boss.shieldHp <= 0) &&
                    boss.hp <= boss.maxHp * shieldTriggerHpRatio &&
                    (boss.defGuCooldown || 0) <= 0
                ) {
                    boss.defGuCooldown = isVen ? 6.0 : (boss.isStageBoss ? 11.0 : 15.0);
                    const shieldPct = isVen ? 0.40 : (boss.rank >= 6 ? 0.22 : 0.16);
                    const shieldVal = Math.round(boss.maxHp * shieldPct);
                    boss.shieldHp = shieldVal;
                    boss.maxShieldHp = shieldVal;
                    const defGuName = boss.defGuName || (isVen ? "Cửu Chuyển Vạn Pháp Bất Xâm Ấn" : "Kim Chung Phòng Ngự Cổ");
                    if (combatSystem) {
                        combatSystem.spawnFloatingText(boss.x, boss.y - 34, `🛡️ ${defGuName} (+${shieldVal})`, "#ffd700");
                    }
                    if (isVen && this.ui) {
                        this.ui.addLog(`🛡️ Tôn Giả [${boss.name}] kích hoạt 【${defGuName}】, dựng lên lớp Hộ Thuẫn Cửu Chuyển dày ${shieldVal.toLocaleString("vi-VN")} HP kèm phản chấn!`, "warning");
                    }
                }
            }

            // D. Bật Cổ Trùng / Sát Chiêu Trị Liệu (Chỉ Boss mới có trị liệu)
            if (boss.isStageBoss) {
                const maxHeals = isVen ? 5 : 2;
                boss.healsUsed = boss.healsUsed || 0;
                if (
                    boss.hp < boss.maxHp * 0.55 &&
                    boss.healsUsed < maxHeals &&
                    (boss.healGuCooldown || 0) <= 0
                ) {
                    boss.healsUsed += 1;
                    boss.healGuCooldown = isVen ? 9.5 : 16.0;
                    const healVal = Math.round(boss.maxHp * (isVen ? 0.30 : 0.20));
                    boss.hp = Math.min(boss.maxHp, boss.hp + healVal);
                    const healName = isVen
                        ? "Cửu Chuyển Sát Chiêu: Vạn Kiếp Trường Sinh Nguyên"
                        : (boss.rank >= 6 ? "Tiên Nguyên Bảo Liên Cổ" : "Xuân Quang Trị Liệu Cổ");
                    if (combatSystem) {
                        combatSystem.spawnFloatingText(boss.x, boss.y - 38, `💚 ${healName} (+${healVal.toLocaleString("vi-VN")} HP)`, "#4cd964");
                    }
                }
            }

            // E. Thi triển Cổ Trùng Thân Pháp (Chỉ Boss hoặc Tinh Anh mới lướt)
            if ((boss.isStageBoss || boss.isElite) && (boss.moveGuCooldown || 0) <= 0 && distToPlayer < 600) {
                boss.moveGuCooldown = isVen ? 3.8 : (boss.isStageBoss ? 6.5 : 9.0);
                const strafeDir = Math.random() < 0.5 ? 1 : -1;
                const dashAngle = distToPlayer < 145
                    ? angleToPlayer + Math.PI + (Math.random() - 0.5) * 0.8
                    : angleToPlayer + strafeDir * 0.65;

                const dashDist = isVen ? 220 : (boss.rank >= 6 ? 165 : 120);
                const nx = boss.x + Math.cos(dashAngle) * dashDist;
                const ny = boss.y + Math.sin(dashAngle) * dashDist;
                if (!mapManager || mapManager.isWalkable(nx, ny, boss.radius)) {
                    boss.x = nx;
                    boss.y = ny;
                    const moveGuName = boss.moveGuName || (isVen ? "Định Tiên Du Cửu Chuyển" : "Thanh Phong Thân Pháp Cổ");
                    if (combatSystem) {
                        combatSystem.spawnFloatingText(boss.x, boss.y - 26, `💨 ${moveGuName}!`, "#6ce6b8");
                    }
                }
            }

            // F. Phát động SÁT CHIÊU (Chỉ Thủ Lĩnh Ải mới tung Sát Chiêu)
            if (boss.isStageBoss && (boss.killerMoveCooldown || 0) <= 0 && distToPlayer <= 680) {
                boss.killerMoveCooldown = isVen ? 3.6 : Math.max(6.5, 11.5 - boss.rank * 0.5);

                let kmName = boss.killerMoveName || "Tiên Đạo Sát Chiêu";
                let kmIndex = 0;
                if (Array.isArray(boss.killerMoveList) && boss.killerMoveList.length > 0) {
                    boss.currentKillerMoveIdx = ((boss.currentKillerMoveIdx || 0) + 1) % boss.killerMoveList.length;
                    kmIndex = boss.currentKillerMoveIdx;
                    kmName = boss.killerMoveList[kmIndex];
                }

                const warnRadius = isVen ? (boss.enraged ? 320 : 275) : (115 + boss.rank * 18);
                const castTime = isVen ? (boss.enraged ? 0.58 : 0.72) : (boss.rank >= 8 ? 0.90 : 1.05);

                boss.telegraphState = {
                    name: kmName,
                    patternIndex: kmIndex,
                    x: player.x,
                    y: player.y,
                    radius: warnRadius,
                    timer: castTime,
                    maxTimer: castTime,
                    color: boss.projectileColor || "#ff4d4d"
                };

                if (combatSystem) {
                    combatSystem.spawnFloatingText(boss.x, boss.y - 44, `👑 Sát Chiêu: 【${kmName}】!`, "#ffd700");
                }
                if (this.ui) {
                    this.ui.addLog(`⚠️ [${boss.name}] phát động 【${kmName}】! Hãy lập tức dùng Thân Pháp lướt khỏi vùng hủy diệt!`, "danger");
                }
                return;
            }

            // G. Di chuyển chiến thuật của Cổ Sư / Tôn Giả
            boss.strafeAngleOffset = (boss.strafeAngleOffset || 0.55);
            if (Math.random() < 0.025) boss.strafeAngleOffset = -boss.strafeAngleOffset;

            const preferredDist = isVen ? 245 : (boss.isStageBoss ? 210 : 175);
            if (distToPlayer > preferredDist + 45) {
                const moveAng = angleToPlayer + boss.strafeAngleOffset * 0.45;
                this._moveEntity(boss, Math.cos(moveAng) * effectiveSpd, Math.sin(moveAng) * effectiveSpd, dt, mapManager);
            } else if (distToPlayer < preferredDist - 45) {
                const retreatAng = angleToPlayer + Math.PI + boss.strafeAngleOffset * 0.4;
                this._moveEntity(boss, Math.cos(retreatAng) * effectiveSpd * 0.85, Math.sin(retreatAng) * effectiveSpd * 0.85, dt, mapManager);
            } else {
                const orbitAng = angleToPlayer + (boss.strafeAngleOffset > 0 ? Math.PI / 2 : -Math.PI / 2);
                this._moveEntity(boss, Math.cos(orbitAng) * effectiveSpd * 0.78, Math.sin(orbitAng) * effectiveSpd * 0.78, dt, mapManager);
            }

            // H. Thúc giục Cổ Trùng Công Kích
            if (distToPlayer <= (boss.attackRange || 480) && (boss.attackCooldown || 0) <= 0 && combatSystem) {
                boss.attackCooldown = isVen ? 0.92 : (boss.isStageBoss ? 1.55 : 2.1);

                let guAttackName = boss.attackGuName || `${boss.name} Cổ Thuật`;
                if (Array.isArray(boss.guLoadout) && boss.guLoadout.length > 0) {
                    boss.currentGuLoadoutIdx = ((boss.currentGuLoadoutIdx || 0) + 1) % boss.guLoadout.length;
                    guAttackName = boss.guLoadout[boss.currentGuLoadoutIdx];
                    if (isVen && Math.random() < 0.55) {
                        combatSystem.spawnFloatingText(boss.x, boss.y - 28, `🪲 ${guAttackName}`, boss.projectileColor || "#7ef7f0");
                    }
                }

                const shotCount = isVen ? (boss.enraged ? 11 : 8) : (boss.isStageBoss ? Math.min(5, 2 + Math.floor(boss.rank / 2)) : (boss.isElite ? 2 : 1));
                const spread = isVen ? 0.72 : 0.36;
                const projDamage = this._computeBossEffectiveDamage(boss, player, 1.0);

                for (let i = 0; i < shotCount; i++) {
                    const offset = shotCount === 1 ? 0 : -spread / 2 + (spread / (shotCount - 1)) * i;
                    combatSystem.spawnProjectile({
                        owner: "enemy",
                        attackerRef: boss,
                        name: guAttackName,
                        skillRank: boss.rank,
                        x: boss.x + Math.cos(angleToPlayer + offset) * 20,
                        y: boss.y + Math.sin(angleToPlayer + offset) * 20,
                        angle: angleToPlayer + offset,
                        speed: (isVen ? 590 : 410) + boss.rank * 20,
                        maxRange: (boss.attackRange || 480) + 160,
                        radius: isVen ? 25 : (16 + Math.min(8, boss.rank)),
                        damage: projDamage,
                        color: boss.projectileColor || "#ff5733",
                        homing: isVen && (i % 2 === 0),
                        spinning: isVen
                    });
                }
            }
        }

        /**
         * Phát nổ Sát Chiêu của Boss / Song Tôn Cửu Chuyển
         */
        _executeBossKillerMoveImpact(boss, telegraph, player, combatSystem) {
            if (!combatSystem) return;

            const isVen = Boolean(boss.isVenerable);
            const killerDmg = this._computeBossEffectiveDamage(
                boss,
                player,
                isVen ? 2.65 : (boss.rank >= 8 ? 2.1 : (boss.rank >= 6 ? 1.75 : 1.45))
            );
            combatSystem.triggerScreenShake(isVen ? 16 : (4 + boss.rank), isVen ? 0.45 : 0.28);

            // 1. Vụ nổ chính tại tâm vùng cảnh báo
            combatSystem.spawnAoEEffect({
                owner: "enemy",
                name: telegraph.name,
                skillRank: boss.rank,
                x: telegraph.x,
                y: telegraph.y,
                radius: telegraph.radius,
                damage: killerDmg,
                color: telegraph.color,
                duration: isVen ? 0.70 : 0.55
            });

            // 2. Chỉ riêng Song Tôn Cửu Chuyển: Tạo thêm 4 vụ nổ Hỗn Độn vây quanh người chơi
            if (isVen && player) {
                for (let k = 0; k < 4; k++) {
                    const subAng = (Math.PI / 2) * k + (telegraph.patternIndex * 0.4);
                    const sx = telegraph.x + Math.cos(subAng) * 185;
                    const sy = telegraph.y + Math.sin(subAng) * 185;
                    combatSystem.spawnAoEEffect({
                        owner: "enemy",
                        name: `${telegraph.name} (Dư Chấn)`,
                        skillRank: 9,
                        x: sx,
                        y: sy,
                        radius: 135,
                        damage: this._computeBossEffectiveDamage(boss, player, 1.65),
                        color: "#b75cff",
                        duration: 0.55
                    });
                }
            }

            // 3. Bắn vòng đạn Sát Chiêu tỏa ra xung quanh Boss
            if (boss.rank >= 3) {
                const ringCount = isVen ? (boss.enraged ? 18 : 14) : Math.min(12, 4 + boss.rank);
                const ringProjDmg = this._computeBossEffectiveDamage(boss, player, isVen ? 1.35 : 1.10);

                for (let i = 0; i < ringCount; i++) {
                    const ang = (Math.PI * 2 * i) / ringCount;
                    combatSystem.spawnProjectile({
                        owner: "enemy",
                        attackerRef: boss,
                        name: telegraph.name,
                        skillRank: boss.rank,
                        x: boss.x + Math.cos(ang) * 22,
                        y: boss.y + Math.sin(ang) * 22,
                        angle: ang,
                        speed: (isVen ? 530 : 380) + boss.rank * 20,
                        maxRange: (isVen ? 640 : 340) + boss.rank * 25,
                        radius: isVen ? 24 : 18,
                        damage: ringProjDmg,
                        color: telegraph.color,
                        homing: isVen && (i % 2 === 0),
                        spinning: true
                    });
                }
            }

            // 4. Chỉ riêng Song Tôn Cửu Chuyển: Phóng Chùm Tia Cực Quang Cửu Chuyển quét ngang chiến trường
            if (isVen && player && typeof combatSystem.spawnLaserBeam === "function") {
                const aimAngle = Math.atan2(player.y - boss.y, player.x - boss.x);
                const beamCount = boss.enraged ? 5 : 3;
                const beamDmg = this._computeBossEffectiveDamage(boss, player, 1.95);

                for (let b = 0; b < beamCount; b++) {
                    const offset = (b - Math.floor(beamCount / 2)) * 0.22;
                    combatSystem.spawnLaserBeam({
                        owner: "enemy",
                        name: telegraph.name,
                        skillRank: 9,
                        x: boss.x,
                        y: boss.y,
                        angle: aimAngle + offset,
                        length: 780,
                        width: 48,
                        damage: beamDmg,
                        color: telegraph.color
                    });
                }
            }
        }

        // =====================================================================
        // 7. AI DÃ THÚ & QUÁI TINH ANH (TUẦN TRA RỘNG, BAO VÂY & LAO KÍCH)
        // =====================================================================

        _updateBeastAI(beast, dt, player, mapManager, combatSystem) {
            if (beast.attackCooldown > 0) beast.attackCooldown -= dt;
            if (beast.dashSkillCooldown > 0) beast.dashSkillCooldown -= dt;
            if (beast.slowTimer > 0) {
                beast.slowTimer -= dt;
                if (beast.slowTimer <= 0) beast.slowFactor = 1.0;
            }

            const effectiveSpd = beast.spd * beast.slowFactor;
            const distToPlayer = player ? Math.hypot(player.x - beast.x, player.y - beast.y) : 9999;

            if (beast.hp < beast.maxHp * 0.18 && !beast.isBoss && !beast.isElite) {
                beast.aiState = "retreat";
                if (!beast.calledAllies) {
                    beast.calledAllies = true;
                    this._alertNearbyBeasts(beast, 360);
                    if (combatSystem) {
                        combatSystem.spawnFloatingText(beast.x, beast.y - 24, "Hú gọi bầy đàn!", "#ff9f43");
                    }
                }
            } else if (player && player.hp > 0 && distToPlayer <= beast.aggroRange) {
                beast.aiState = "chase";
            } else if (distToPlayer > beast.aggroRange * 1.5) {
                beast.aiState = "patrol";
            }

            if (beast.aiState === "retreat" && player) {
                const fleeAngle = Math.atan2(beast.y - player.y, beast.x - player.x);
                this._moveEntity(beast, Math.cos(fleeAngle) * effectiveSpd * 0.9, Math.sin(fleeAngle) * effectiveSpd * 0.9, dt, mapManager);
                beast.hp = Math.min(beast.maxHp, beast.hp + 2.5 * dt);
            } else if (beast.aiState === "chase" && player) {
                const angleToPlayer = Math.atan2(player.y - beast.y, player.x - beast.x);

                if ((beast.isElite || beast.isBoss) && (beast.dashSkillCooldown || 0) <= 0 && distToPlayer < 320 && distToPlayer > 70) {
                    beast.dashSkillCooldown = beast.isBoss ? 5.5 : 7.5;
                    const leapDist = 110;
                    const nx = beast.x + Math.cos(angleToPlayer) * leapDist;
                    const ny = beast.y + Math.sin(angleToPlayer) * leapDist;
                    if (!mapManager || mapManager.isWalkable(nx, ny, beast.radius)) {
                        beast.x = nx;
                        beast.y = ny;
                    }
                    if (combatSystem) {
                        combatSystem.spawnFloatingText(beast.x, beast.y - 24, `💥 Thú Vương Phác Kích!`, "#ff9f43");
                        if (beast.isBoss) {
                            combatSystem.spawnAoEEffect({
                                owner: "enemy",
                                name: `${beast.name} Giẫm Đạp`,
                                x: beast.x,
                                y: beast.y,
                                radius: 85 + beast.rank * 10,
                                damage: Math.round(beast.atk * 1.25),
                                color: beast.color || "#ff5733",
                                duration: 0.4
                            });
                        }
                    }
                }

                const flankOffset = ((parseInt(beast.id.replace(/\D/g, ""), 10) || 1) % 2 === 0 ? 1 : -1) * 0.24;
                if (distToPlayer > beast.attackRange * 0.85) {
                    const moveAngle = distToPlayer > 140 ? angleToPlayer + flankOffset : angleToPlayer;
                    this._moveEntity(beast, Math.cos(moveAngle) * effectiveSpd, Math.sin(moveAngle) * effectiveSpd, dt, mapManager);
                }

                if (distToPlayer <= beast.attackRange && beast.attackCooldown <= 0) {
                    beast.attackCooldown = beast.rangedGuId ? 1.9 : 1.4;

                    if (beast.rangedGuId && combatSystem) {
                        const burst = beast.isBoss ? 3 : (beast.isElite ? 2 : 1);
                        for (let b = 0; b < burst; b++) {
                            const off = burst === 1 ? 0 : (b - (burst - 1) / 2) * 0.20;
                            combatSystem.spawnProjectile({
                                owner: "enemy",
                                attackerRef: beast,
                                name: beast.name,
                                x: beast.x,
                                y: beast.y,
                                angle: angleToPlayer + off,
                                speed: 370 + beast.rank * 18,
                                maxRange: beast.attackRange + 60,
                                radius: 16,
                                damage: beast.atk,
                                color: beast.projectileColor
                            });
                        }
                    } else if (player) {
                        const dmgRes = player.takeDamage(beast.atk, beast.name);
                        if (combatSystem && !dmgRes.dodged) {
                            combatSystem.spawnFloatingText(player.x, player.y - 18, `-${dmgRes.damageTaken}`, "#ff4d4d");
                        }
                    }
                }
            } else {
                beast.patrolTimer -= dt;
                if (beast.patrolTimer <= 0) {
                    beast.patrolTimer = 2.5 + Math.random() * 4.0;
                    beast.patrolTargetX = beast.spawnX + (Math.random() - 0.5) * 440;
                    beast.patrolTargetY = beast.spawnY + (Math.random() - 0.5) * 440;
                }
                const distToPatrol = Math.hypot(beast.patrolTargetX - beast.x, beast.patrolTargetY - beast.y);
                if (distToPatrol > 14) {
                    const ang = Math.atan2(beast.patrolTargetY - beast.y, beast.patrolTargetX - beast.x);
                    this._moveEntity(beast, Math.cos(ang) * effectiveSpd * 0.55, Math.sin(ang) * effectiveSpd * 0.55, dt, mapManager);
                }
            }
        }

        _alertNearbyBeasts(callerBeast, radius) {
            for (const other of this.beasts) {
                if (other.id === callerBeast.id || other.isDead) continue;
                const d = Math.hypot(other.x - callerBeast.x, other.y - callerBeast.y);
                if (d <= radius) {
                    other.aiState = "chase";
                }
            }
        }

        _updateNpcAI(npc, dt, player, mapManager, combatSystem) {
            if (npc.attackCooldown > 0) npc.attackCooldown -= dt;
            if (npc.slowTimer > 0) {
                npc.slowTimer -= dt;
                if (npc.slowTimer <= 0) npc.slowFactor = 1.0;
            }

            const effectiveSpd = npc.spd * npc.slowFactor;

            if (npc.isHostile && player && player.hp > 0) {
                const dist = Math.hypot(player.x - npc.x, player.y - npc.y);

                if (!npc.lethalCombat && npc.hp <= npc.maxHp * 0.22) {
                    npc.isHostile = false;
                    npc.hp = Math.round(npc.maxHp * 0.5);
                    npc.aiState = "cultivate";
                    npc.aiStateText = "Đang vận công hồi phục sau tỷ thí";
                    npc.relation += 5;
                    if (this.ui) {
                        this.ui.addLog(`[Tỷ Thí] ${npc.name} chắp tay nhận thua: "Cổ thuật của đạo hữu thật tinh diệu, tại hạ bái phục!" (+10 Nguyên Thạch chiến thắng)`, "cultivation");
                    }
                    player.primevalStones += 10;
                    return;
                }

                if (dist > 650) {
                    npc.isHostile = false;
                    npc.aiState = "patrol";
                    npc.aiStateText = "Tuần tra cảnh giác";
                    return;
                }

                const ang = Math.atan2(player.y - npc.y, player.x - npc.x);
                if (dist > 180) {
                    this._moveEntity(npc, Math.cos(ang) * effectiveSpd, Math.sin(ang) * effectiveSpd, dt, mapManager);
                } else if (dist < 95) {
                    this._moveEntity(npc, -Math.cos(ang) * effectiveSpd * 0.6, -Math.sin(ang) * effectiveSpd * 0.6, dt, mapManager);
                }

                if (npc.attackCooldown <= 0 && combatSystem) {
                    npc.attackCooldown = 1.7;
                    combatSystem.spawnProjectile({
                        owner: "npc",
                        attackerRef: npc,
                        name: `${npc.name} Cổ Thuật`,
                        x: npc.x,
                        y: npc.y,
                        angle: ang,
                        speed: 420,
                        maxRange: 340,
                        radius: 18,
                        damage: npc.atk,
                        color: npc.color
                    });
                }
                return;
            }

            npc.aiTimer -= dt;
            if (npc.aiTimer <= 0) {
                npc.aiTimer = 6 + Math.random() * 8;
                const roll = Math.random();

                if (roll < 0.35 && mapManager) {
                    const nearNode = mapManager.getNearestInteractableNode(npc.x, npc.y, 520);
                    if (nearNode) {
                        npc.aiState = "gather";
                        npc.targetX = nearNode.x;
                        npc.targetY = nearNode.y;
                        npc.aiStateText = `Đang khai thác ${nearNode.name}`;
                    } else {
                        npc.aiState = "patrol";
                        npc.targetX = npc.homeX + (Math.random() - 0.5) * 280;
                        npc.targetY = npc.homeY + (Math.random() - 0.5) * 280;
                        npc.aiStateText = "Đang dạo quanh tìm cơ duyên";
                    }
                } else if (roll < 0.68) {
                    npc.aiState = "cultivate";
                    npc.aiStateText = "Đang ngồi thiền ôn dưỡng Không Khiếu";
                    npc.primevalStones += npc.rank * 2;
                    npc.hp = Math.min(npc.maxHp, npc.hp + 25);
                } else {
                    npc.aiState = "patrol";
                    npc.targetX = npc.homeX + (Math.random() - 0.5) * 260;
                    npc.targetY = npc.homeY + (Math.random() - 0.5) * 260;
                    npc.aiStateText = "Đang tuần tra lãnh địa";
                }
            }

            if (npc.aiState === "patrol" || npc.aiState === "gather") {
                const d = Math.hypot(npc.targetX - npc.x, npc.targetY - npc.y);
                if (d > 14) {
                    const ang = Math.atan2(npc.targetY - npc.y, npc.targetX - npc.x);
                    this._moveEntity(npc, Math.cos(ang) * effectiveSpd * 0.5, Math.sin(ang) * effectiveSpd * 0.5, dt, mapManager);
                } else if (npc.aiState === "gather") {
                    npc.primevalStones += 3;
                    npc.aiState = "cultivate";
                    npc.aiStateText = "Thu hoạch xong, đang tĩnh tọa";
                }
            }
        }

        _moveEntity(entity, vx, vy, dt, mapManager) {
            const nx = entity.x + vx * dt;
            const ny = entity.y + vy * dt;
            if (!mapManager || mapManager.isWalkable(nx, entity.y, entity.radius)) {
                entity.x = nx;
            }
            if (!mapManager || mapManager.isWalkable(entity.x, ny, entity.radius)) {
                entity.y = ny;
            }
        }

        _simulateWorldAndFactions() {
            this.marketFluctuationFactor = Number((0.85 + Math.random() * 0.40).toFixed(2));

            for (const npc of this.npcs) {
                if (npc.isDead || !Array.isArray(npc.shopInventory)) continue;
                for (const item of npc.shopInventory) {
                    if (item.stock < 3 && Math.random() < 0.5) {
                        item.stock += 1;
                    }
                }
            }

            const f1 = this.factions[Math.floor(Math.random() * this.factions.length)];
            const f2 = this.factions[Math.floor(Math.random() * this.factions.length)];
            if (f1 && f2 && f1.id !== f2.id) {
                const delta = Math.floor(15 + Math.random() * 35);
                f1.power += delta;
                f2.power = Math.max(200, f2.power - Math.floor(delta * 0.6));

                if (this.ui) {
                    this.ui.addLog(
                        `[Thiên Hạ Đại Thế] Cổ sư của ${f1.name} vừa giao tranh với ${f2.name} tại biên cảnh để tranh đoạt mạch Nguyên Tuyền!`,
                        "system"
                    );
                }
            }
        }

        // =====================================================================
        // 8. XỬ LÝ VA CHẠM & PHÒNG NGỰ VÔ ĐỐI CỬU CHUYỂN (CHỈ DÀNH CHO SONG TÔN)
        // =====================================================================

        getHostileTargetsInRadius(x, y, radius) {
            const results = [];
            for (const b of this.beasts) {
                if (!b.isDead && Math.hypot(b.x - x, b.y - y) <= radius + b.radius) {
                    results.push(b);
                }
            }
            for (const n of this.npcs) {
                if (!n.isDead && n.isHostile && Math.hypot(n.x - x, n.y - y) <= radius + n.radius) {
                    results.push(n);
                }
            }
            return results;
        }

        findCollidingHostile(x, y, radius, excludeSet) {
            for (const b of this.beasts) {
                if (b.isDead || (excludeSet && excludeSet.has(b.id))) continue;
                if (Math.hypot(b.x - x, b.y - y) <= radius + b.radius) {
                    return b;
                }
            }
            for (const n of this.npcs) {
                if (n.isDead || !n.isHostile || (excludeSet && excludeSet.has(n.id))) continue;
                if (Math.hypot(n.x - x, n.y - y) <= radius + n.radius) {
                    return n;
                }
            }
            return null;
        }

        damageEntity(target, rawDamage, attackerPlayer, combatSystem) {
            if (!target || target.isDead) return 0;

            let actualDamage = Math.max(1, Math.round(rawDamage - (target.def || 0) * 0.60));

            // CHỈ RIÊNG SONG TÔN (`target.isVenerable === true`) MỚI CÓ PHÒNG NGỰ VÔ ĐỐI & KHÓA DPS:
            if (Boolean(target.isVenerable)) {
                const livingVenerables = this.beasts.filter(b => Boolean(b.isVenerable) && !b.isDead).length;
                if (livingVenerables >= 2) {
                    actualDamage = Math.max(1, Math.round(actualDamage * 0.40));
                }

                const maxSingleHit = Math.max(1, Math.round(target.maxHp * 0.012));
                if (actualDamage > maxSingleHit) {
                    actualDamage = maxSingleHit;
                }

                target.damageTakenThisSecond = target.damageTakenThisSecond || 0;
                const maxDmgPerSec = Math.round(target.maxHp * (livingVenerables >= 2 ? 0.042 : 0.060));
                const remainingQuota = Math.max(0, maxDmgPerSec - target.damageTakenThisSecond);

                if (remainingQuota <= 0) {
                    if (combatSystem && !target.throttleNotified) {
                        target.throttleNotified = true;
                        combatSystem.spawnFloatingText(target.x, target.y - 44, "☯ Vạn Pháp Bất Xâm (Miễn Thương)!", "#00e5ff");
                    }
                    return 0;
                }

                if (actualDamage > remainingQuota) {
                    actualDamage = remainingQuota;
                }
                target.damageTakenThisSecond += actualDamage;
            }

            // Nếu mục tiêu đang có Hộ Thuẫn Cổ Trùng (shieldHp) thì hấp thụ vào hộ thuẫn trước
            if (target.shieldHp && target.shieldHp > 0) {
                // Phản chấn Đạo Ngân Cửu Chuyển chỉ áp dụng cho Song Tôn
                if (Boolean(target.isVenerable) && attackerPlayer && Math.random() < 0.45) {
                    const reflectDmg = this._computeBossEffectiveDamage(target, attackerPlayer, 0.35);
                    const refRes = attackerPlayer.takeDamage(reflectDmg, `${target.name} Hộ Thuẫn Phản Chấn`);
                    if (combatSystem && !refRes.dodged) {
                        combatSystem.spawnFloatingText(attackerPlayer.x, attackerPlayer.y - 26, `☯ Phản Chấn -${refRes.damageTaken}`, "#ffd700");
                    }
                }

                const absorbed = Math.min(target.shieldHp, actualDamage);
                target.shieldHp -= absorbed;
                actualDamage -= absorbed;
                if (target.shieldHp <= 0 && combatSystem) {
                    combatSystem.spawnFloatingText(target.x, target.y - 28, "💥 Phá Vỡ Hộ Thuẫn!", "#ffd700");
                }
            }

            target.hp = Math.max(0, target.hp - actualDamage);

            if (target.entityType === "npc" && !target.isHostile) {
                target.becomeHostile(true);
            } else if (target.entityType === "beast") {
                target.aiState = "chase";
            }

            if (target.hp <= 0) {
                // CHỈ RIÊNG SONG TÔN (`target.isVenerable === true`) MỚI CÓ NIẾT BÀN TRỌNG SINH PHASE 2:
                if (Boolean(target.isVenerable) && !target.hasRevivedOnce) {
                    target.hasRevivedOnce = true;
                    target.enraged = true;
                    target.hp = target.maxHp;
                    target.shieldHp = Math.round(target.maxHp * 0.50);
                    target.maxShieldHp = target.shieldHp;
                    target.damageTakenThisSecond = 0;

                    if (combatSystem) {
                        combatSystem.triggerScreenShake(18, 0.55);
                        combatSystem.spawnFloatingText(
                            target.x,
                            target.y - 48,
                            `👑 【TÔN GIẢ NGHỊCH MỆNH — PHÁP TƯỚNG CUỒNG BẠO】!`,
                            "#00e5ff"
                        );
                        combatSystem.spawnAoEEffect({
                            owner: "enemy",
                            name: `${target.name} Niết Bàn Chấn Động`,
                            skillRank: 9,
                            x: target.x,
                            y: target.y,
                            radius: 320,
                            damage: this._computeBossEffectiveDamage(target, attackerPlayer, 2.2),
                            color: "#00e5ff",
                            duration: 0.75
                        });
                    }
                    if (this.ui) {
                        this.ui.addLog(
                            `👑 [Cửu Chuyển Bất Tử] 【${target.name}】 dẫn động Vô Cực Hỗn Độn Nguyên Khí, Niết Bàn Trọng Sinh khôi phục 100% Sinh Mệnh + 50% Hộ Thuẫn và bước vào giai đoạn PHÁP TƯỚNG CUỒNG BẠO!`,
                            "danger"
                        );
                    }
                    return actualDamage;
                }

                this._handleEntityDeath(target, attackerPlayer, combatSystem);
            }

            return actualDamage;
        }

        _handleEntityDeath(target, player, combatSystem) {
            target.isDead = true;
            target.respawnTimer = target.isBoss ? 180 : 60;

            if (!player) return;
            player.kills += 1;

            if (this.player && this.player.aperture) {
                this.player.aperture.humanQi += target.isBoss ? target.rank * 4 : (target.isElite ? 2 : 1);
            }

            if (target.entityType === "beast") {
                const lootTexts = [];
                for (const drop of (target.drops || [])) {
                    if (Math.random() <= drop.chance) {
                        if (drop.itemId) {
                            const count = Math.floor(drop.min + Math.random() * (drop.max - drop.min + 1));
                            player.addItem(drop.itemId, count);
                            const meta = global.PlayerManager.ITEM_DATABASE[drop.itemId] || { name: drop.itemId };
                            lootTexts.push(`${count}x ${meta.name}`);
                        } else if (drop.wildGuId && this.guSystem) {
                            const captured = this.guSystem.addGuToStorage(drop.wildGuId, {
                                rank: drop.wildRank || target.rank || 1,
                                isRefined: false,
                                refinementProgress: 20,
                                isVital: false
                            });
                            if (captured) {
                                const fullGuName = global.GuSystem.formatGuNameWithRank
                                    ? global.GuSystem.formatGuNameWithRank(captured)
                                    : captured.name;
                                lootTexts.push(`Cổ Hoang Dã [${fullGuName}]`);
                            }
                        }
                    }
                }

                if (this.ui && (target.isBoss || target.isElite || lootTexts.length > 0)) {
                    this.ui.addLog(
                        `Đã tiêu diệt [${target.name}]! Thu được: ${lootTexts.length ? lootTexts.join(", ") : "Kinh nghiệm thực chiến"}.`,
                        "loot"
                    );
                }

                this.notifyQuestProgress("kill_beast", 1);
                if (target.isBoss) {
                    this.notifyQuestProgress("kill_boss", 1);
                }
            } else if (target.entityType === "npc") {
                const stolenStones = Math.max(15, target.primevalStones);
                player.primevalStones += stolenStones;
                target.primevalStones = 20;

                let stolenGuMsg = "";
                if (target.equippedGu && this.guSystem) {
                    const capturedGu = this.guSystem.addGuToStorage(target.equippedGu, {
                        rank: target.equippedGuRank || target.rank || 1,
                        isRefined: false,
                        refinementProgress: 35,
                        isVital: false
                    });
                    if (capturedGu) {
                        const fullGuName = global.GuSystem.formatGuNameWithRank
                            ? global.GuSystem.formatGuNameWithRank(capturedGu)
                            : capturedGu.name;
                        stolenGuMsg = ` và đoạt được [${fullGuName}]`;
                    }
                }

                if (this.ui) {
                    this.ui.addLog(
                        `Ngươi đã đánh bại Cổ Sư [${target.name}], lục soát được 💎 ${stolenStones} Nguyên Thạch${stolenGuMsg}!`,
                        "loot"
                    );
                }
            }

            if (combatSystem) {
                combatSystem.spawnFloatingText(target.x, target.y - 24, "Đã Tiêu Diệt!", "#5cc995");
            }
        }

        // =====================================================================
        // 9. GIAO DỊCH NPC, NHIỆM VỤ & TƯƠNG TÁC PHÍM [E]
        // =====================================================================

        getNearestInteractableNpc(x, y, maxDist = 56) {
            let best = null;
            let bestDist = maxDist;
            for (const npc of this.npcs) {
                if (npc.isDead || npc.isHostile) continue;
                const d = Math.hypot(npc.x - x, npc.y - y);
                if (d <= bestDist) {
                    bestDist = d;
                    best = npc;
                }
            }
            return best;
        }

        buyFromNpc(npc, itemIdx, player, guSystem) {
            if (!npc || !Array.isArray(npc.shopInventory) || !npc.shopInventory[itemIdx]) {
                return { success: false, message: "Mặt hàng không tồn tại." };
            }

            const entry = npc.shopInventory[itemIdx];
            if (entry.stock <= 0) {
                return { success: false, message: `${entry.name} đã bán hết! Hãy chờ thương nhân nhập đợt hàng mới.` };
            }

            const discount = player ? (player.tradeDiscount || 0) : 0;
            const finalPrice = Math.max(1, Math.round(entry.price * (1 - discount)));

            if (player.primevalStones < finalPrice) {
                return {
                    success: false,
                    message: `Không đủ Nguyên Thạch! Cần 💎 ${finalPrice} Nguyên Thạch để mua ${entry.name}.`
                };
            }

            player.primevalStones -= finalPrice;
            npc.primevalStones += finalPrice;
            entry.stock -= 1;

            if (entry.guId && guSystem) {
                const newGu = guSystem.addGuToStorage(entry.guId, {
                    rank: entry.guRank || 1,
                    isRefined: true,
                    refinementProgress: 100,
                    isVital: false
                });
                const fullGuName = global.GuSystem.formatGuNameWithRank
                    ? global.GuSystem.formatGuNameWithRank(newGu)
                    : newGu.name;
                return {
                    success: true,
                    message: `Giao dịch thành công! Đã mua Cổ Trùng [${fullGuName}] với giá 💎 ${finalPrice} Nguyên Thạch.`
                };
            } else if (entry.itemId) {
                player.addItem(entry.itemId, 1);
                return {
                    success: true,
                    message: `Đã mua 1x [${entry.name}] với giá 💎 ${finalPrice} Nguyên Thạch.`
                };
            }

            return { success: false, message: "Lỗi giao dịch." };
        }

        assignDynamicQuestFromNpc(npc) {
            const newQuestId = `q_npc_${npc.id}_${Date.now()}`;
            const isDemonic = npc.factionId === "huyet_ma_cult";

            const newQuest = {
                id: newQuestId,
                title: isDemonic
                    ? `Ủy Thác Của ${npc.name}: Thu Thập Huyết Thực`
                    : `Ủy Thác Của ${npc.name}: Tuần Tra Tiễu Thú`,
                category: isDemonic ? "Ma Đạo" : "Chính Đạo",
                type: "kill_beast",
                progress: 0,
                target: 3,
                completed: false,
                rewardStones: 45,
                rewardHumanQi: 10,
                rewardText: "45 Nguyên Thạch + 10 Nhân Khí",
                description: `${npc.name} nhờ ngươi tiêu diệt 3 con quái thú quanh chiến trường để thu thập nguyên liệu luyện cổ.`
            };

            this.quests.push(newQuest);
            return {
                success: true,
                quest: newQuest,
                message: `Đã nhận nhiệm vụ mới: [${newQuest.title}]! Mở bảng Thế Lực để theo dõi.`
            };
        }

        notifyQuestProgress(questType, amount = 1) {
            for (const q of this.quests) {
                if (q.completed || q.type !== questType) continue;
                q.progress = Math.min(q.target, q.progress + amount);

                if (q.progress >= q.target) {
                    q.completed = true;
                    if (this.player) {
                        this.player.primevalStones += q.rewardStones || 30;
                        if (q.type === "harvest_node") {
                            this.player.addItem("moon_orchid", 1);
                        } else if (q.type === "kill_boss") {
                            this.player.addItem("soul_crystal", 1);
                        }
                    }
                    if (this.player && this.player.aperture) {
                        this.player.aperture.humanQi += q.rewardHumanQi || 8;
                    }
                    if (this.ui) {
                        this.ui.addLog(
                            `🎉 Hoàn thành nhiệm vụ [${q.title}]! Nhận thưởng: ${q.rewardText}.`,
                            "loot"
                        );
                    }
                }
            }
        }

        getActiveQuests() {
            return this.quests;
        }

        getFactions() {
            return this.factions;
        }

        getLivingNpcs() {
            return this.npcs.filter(n => !n.isDead);
        }

        // =====================================================================
        // 10. VẼ DÃ THÚ, BOSS NGƯỜI, PHÁP TƯỚNG SONG TÔN CỬU CHUYỂN & DÂY LIÊN THỦ
        // =====================================================================

        render(ctx, camera) {
            if (!ctx) return;
            const camX = camera ? camera.x : 0;
            const camY = camera ? camera.y : 0;
            const w = camera ? camera.width : 1280;
            const h = camera ? camera.height : 720;
            const t = performance.now() * 0.005;

            // 0. Vẽ Dây Liên Kết "Song Tôn Liên Thủ Đại Trận" chỉ cho 2 vị Tôn Giả
            const livingVenerables = this.beasts.filter(b => Boolean(b.isVenerable) && !b.isDead);
            if (livingVenerables.length >= 2) {
                const v1 = livingVenerables[0];
                const v2 = livingVenerables[1];
                ctx.save();
                ctx.strokeStyle = "rgba(0, 229, 255, 0.55)";
                ctx.lineWidth = 3 + Math.sin(t * 3) * 1.2;
                ctx.setLineDash([12, 8]);
                ctx.beginPath();
                ctx.moveTo(v1.x - camX, v1.y - camY);
                ctx.lineTo(v2.x - camX, v2.y - camY);
                ctx.stroke();
                ctx.restore();
            }

            // 1. Vẽ Vùng Cảnh Báo Đỏ (Telegraph AoE) khi Boss / Tôn Giả đang niệm Sát Chiêu
            for (const b of this.beasts) {
                if (b.isDead || !b.telegraphState) continue;
                const ts = b.telegraphState;
                const tx = Math.round(ts.x - camX);
                const ty = Math.round(ts.y - camY);
                const chargePct = Math.max(0, Math.min(1, 1 - ts.timer / ts.maxTimer));

                ctx.save();
                ctx.beginPath();
                ctx.arc(tx, ty, ts.radius, 0, Math.PI * 2);
                ctx.fillStyle = b.isVenerable ? "rgba(183, 92, 255, 0.24)" : "rgba(224, 52, 52, 0.18)";
                ctx.fill();
                ctx.lineWidth = b.isVenerable ? 3 : 2;
                ctx.strokeStyle = ts.color || "#ff4d4d";
                ctx.setLineDash([8, 6]);
                ctx.stroke();
                ctx.setLineDash([]);

                ctx.beginPath();
                ctx.arc(tx, ty, ts.radius * chargePct, 0, Math.PI * 2);
                ctx.fillStyle = b.isVenerable ? "rgba(255, 215, 0, 0.32)" : "rgba(255, 90, 90, 0.28)";
                ctx.fill();

                ctx.font = "bold 13px Georgia";
                ctx.textAlign = "center";
                ctx.fillStyle = "#ffdf6b";
                ctx.fillText(`⚠️ ${ts.name}!`, tx, ty - 6);
                ctx.restore();
            }

            // 2. Vẽ Quái Thú, Quái Tinh Anh, Thủ Lĩnh & Song Tôn Cửu Chuyển
            for (const b of this.beasts) {
                if (b.isDead) continue;
                const sx = Math.round(b.x - camX);
                const sy = Math.round(b.y - camY);
                if (sx < -100 || sy < -100 || sx > w + 100 || sy > h + 100) continue;

                ctx.save();
                ctx.translate(sx, sy);

                // Pháp Tướng Cửu Tinh xoay quanh chân Tôn Giả Cửu Chuyển
                if (b.isVenerable) {
                    ctx.save();
                    ctx.rotate(t * (b.enraged ? 1.6 : 0.8));
                    ctx.strokeStyle = b.enraged ? "#ff3b30" : (b.projectileColor || "#ffd700");
                    ctx.lineWidth = b.enraged ? 3 : 2;
                    ctx.setLineDash([10, 6]);
                    ctx.beginPath();
                    ctx.arc(0, 0, b.radius + 20, 0, Math.PI * 2);
                    ctx.stroke();
                    ctx.restore();

                    const starCount = b.enraged ? 6 : 4;
                    for (let orbIdx = 0; orbIdx < starCount; orbIdx++) {
                        const orbAng = t * 1.8 + (orbIdx * Math.PI * 2) / starCount;
                        const ox = Math.cos(orbAng) * (b.radius + 20);
                        const oy = Math.sin(orbAng) * (b.radius + 20);
                        ctx.beginPath();
                        ctx.arc(ox, oy, 4.5, 0, Math.PI * 2);
                        ctx.fillStyle = b.enraged ? "#ff3b30" : "#ffd700";
                        ctx.fill();
                    }
                }

                // Vòng hào quang Hộ Thuẫn Cổ Trùng nếu Boss / Tôn Giả đang bật khiên
                if (b.shieldHp && b.shieldHp > 0) {
                    ctx.beginPath();
                    ctx.arc(0, 0, b.radius + 12 + Math.sin(t * 2) * 2, 0, Math.PI * 2);
                    ctx.fillStyle = b.isVenerable ? "rgba(126, 247, 240, 0.25)" : "rgba(255, 215, 0, 0.16)";
                    ctx.fill();
                    ctx.lineWidth = 2.5;
                    ctx.strokeStyle = b.isVenerable ? "#7ef7f0" : "#ffd700";
                    ctx.stroke();
                }

                if (b.isHuman && global.PlayerManager && typeof global.PlayerManager.drawSkinPixelSprite === "function") {
                    const skinMap = global.PlayerManager.CHARACTER_SKINS || {};
                    const skinCfg = skinMap[b.skinKey] || {
                        robeColor: b.color || "#8f1616",
                        robeSecondary: "#1c1f26",
                        trimColor: "#ffd700",
                        beltColor: "#e2bf75",
                        hairColor: "#0d0f14",
                        hairStyle: "noble_crown",
                        skinTone: "#edd2b5",
                        eyeColor: "#ff3b30",
                        crownColor: "#ffd700",
                        auraColor: "rgba(255, 77, 77, 0.30)"
                    };

                    const scale = b.isVenerable ? (b.enraged ? 1.7 : 1.55) : (b.isBoss ? 1.35 : 1.1);
                    ctx.save();
                    ctx.scale(scale, scale);
                    global.PlayerManager.drawSkinPixelSprite(ctx, skinCfg, {
                        bobY: Math.sin(t * 2) * 1.5,
                        legOffset: 0,
                        armSwing: b.telegraphState ? -4 : 0,
                        facing: "down"
                    });
                    ctx.restore();
                } else {
                    ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
                    ctx.beginPath();
                    ctx.ellipse(0, b.radius - 2, b.radius, 6, 0, 0, Math.PI * 2);
                    ctx.fill();

                    if (b.isBoss || b.isElite) {
                        ctx.beginPath();
                        ctx.arc(0, 0, b.radius + 5, 0, Math.PI * 2);
                        ctx.strokeStyle = b.isBoss ? "#ffd700" : "#c278ff";
                        ctx.lineWidth = 2;
                        ctx.stroke();
                    }

                    ctx.beginPath();
                    ctx.arc(0, 0, b.radius, 0, Math.PI * 2);
                    ctx.fillStyle = "#141a21";
                    ctx.fill();
                    ctx.lineWidth = 2;
                    ctx.strokeStyle = b.color;
                    ctx.stroke();

                    ctx.font = b.isBoss ? "21px sans-serif" : (b.isElite ? "18px sans-serif" : "15px sans-serif");
                    ctx.textAlign = "center";
                    ctx.textBaseline = "middle";
                    ctx.fillText(b.icon, 0, 0);
                }

                const barColor = b.isVenerable
                    ? (b.enraged ? "#ff2a2a" : "#00e5ff")
                    : (b.isBoss ? "#ff3b30" : (b.isElite ? "#c278ff" : "#e05252"));
                const displayName = b.enraged ? `🔥 [Cuồng Bạo] ${b.name}` : b.name;

                this._renderEntityHealthBar(
                    ctx,
                    displayName,
                    b.rank,
                    b.hp,
                    b.maxHp,
                    b.isVenerable ? -44 : (b.isHuman ? -34 : -b.radius - 14),
                    barColor,
                    b.shieldHp || 0,
                    b.isBoss
                );
                ctx.restore();
            }

            // 3. Vẽ NPC Cổ Sư
            for (const npc of this.npcs) {
                if (npc.isDead) continue;
                const sx = Math.round(npc.x - camX);
                const sy = Math.round(npc.y - camY);
                if (sx < -50 || sy < -50 || sx > w + 50 || sy > h + 50) continue;

                ctx.save();
                ctx.translate(sx, sy);

                if (npc.aiState === "cultivate" && !npc.isHostile) {
                    ctx.beginPath();
                    ctx.arc(0, 2, 20, 0, Math.PI * 2);
                    ctx.fillStyle = "rgba(90, 169, 230, 0.16)";
                    ctx.fill();
                }

                ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
                ctx.beginPath();
                ctx.ellipse(0, 12, 10, 4, 0, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = npc.color || "#3b8beb";
                ctx.fillRect(-7, -6, 14, 15);
                ctx.fillStyle = "#e0be77";
                ctx.fillRect(-7, 1, 14, 2);

                ctx.fillStyle = "#e6c29f";
                ctx.fillRect(-5, -14, 10, 8);
                ctx.fillStyle = "#14171c";
                ctx.fillRect(-6, -16, 12, 3);

                const barColor = npc.isHostile ? "#ff4d4d" : "#5aa9e6";
                this._renderEntityHealthBar(ctx, npc.name, npc.rank, npc.hp, npc.maxHp, -26, barColor, 0, false);
                ctx.restore();
            }
        }

        _renderEntityHealthBar(ctx, name, rank, hp, maxHp, offsetY, barColor, shieldHp = 0, isBoss = false) {
            const barW = isBoss ? 112 : 50;
            const barH = isBoss ? 8 : 5;
            const pct = Math.max(0, Math.min(1, hp / Math.max(1, maxHp)));

            ctx.font = isBoss ? "bold 12px Georgia" : "11px Georgia";
            ctx.textAlign = "center";
            ctx.fillStyle = isBoss ? "#ffd700" : "#e6dfd5";
            ctx.fillText(`${name} [${rank} Chuyển]`, 0, offsetY - (shieldHp > 0 ? 10 : 5));

            ctx.fillStyle = "#07090d";
            ctx.fillRect(-barW / 2, offsetY, barW, barH);
            ctx.fillStyle = barColor;
            ctx.fillRect(-barW / 2, offsetY, barW * pct, barH);
            ctx.strokeStyle = isBoss ? "#b89758" : "#332d24";
            ctx.lineWidth = 1;
            ctx.strokeRect(-barW / 2, offsetY, barW, barH);

            if (shieldHp > 0) {
                const sPct = Math.min(1, shieldHp / Math.max(1, maxHp * 0.40));
                ctx.fillStyle = "#ffd700";
                ctx.fillRect(-barW / 2, offsetY - 4, barW * sPct, 3.5);
            }
        }

        // =====================================================================
        // 11. LƯU TRỮ VÀ KHÔI PHỤC DỮ LIỆU
        // =====================================================================

        toSaveData() {
            return {
                factions: this.factions,
                quests: this.quests,
                npcs: this.npcs.map(n => ({
                    id: n.id,
                    name: n.name,
                    title: n.title,
                    age: n.age,
                    aptitude: n.aptitude,
                    rank: n.rank,
                    factionId: n.factionId,
                    factionName: n.factionName,
                    personality: n.personality,
                    goal: n.goal,
                    x: Math.round(n.x),
                    y: Math.round(n.y),
                    homeX: n.homeX,
                    homeY: n.homeY,
                    hp: n.hp,
                    maxHp: n.maxHp,
                    atk: n.atk,
                    def: n.def,
                    spd: n.spd,
                    primevalStones: n.primevalStones,
                    relation: n.relation,
                    color: n.color,
                    equippedGu: n.equippedGu,
                    equippedGuRank: n.equippedGuRank || n.rank || 1,
                    shopInventory: n.shopInventory,
                    isDead: n.isDead,
                    respawnTimer: n.respawnTimer
                }))
            };
        }

        fromSaveData(data) {
            if (!data) return;
            if (Array.isArray(data.factions)) this.factions = data.factions;
            if (Array.isArray(data.quests)) this.quests = data.quests;
            if (Array.isArray(data.npcs)) {
                this.npcs = data.npcs.map(nData => this._hydrateNpcObject(nData));
            }
        }
    }

    global.EnemyManager = EnemyManager;

})(window);