/**
 * VẠN CỔ TIÊN ĐỒ - MODULE CHIẾN ĐẤU, SÁT CHIÊU & PHÒNG NGỰ VÔ ĐỐI CỬU CHUYỂN (CombatSystem.js)
 * Nâng cấp:
 *  - Bổ sung cơ chế Đạo Ngân Tôn Giả Áp Chế & Hộ Thể Cửu Chuyển Vô Địch (_calculateRankSuppression):
 *      + Kỹ năng dưới 9 Chuyển đánh vào Tôn Giả Cửu Chuyển bị giảm 96% -> 99.9% sát thương.
 *      + Ngay cả kỹ năng Cửu Chuyển (Rank 9) đánh vào Tôn Giả cũng bị lớp Phòng Ngự Vô Đối Cửu Chuyển
 *        giảm 65% sát thương (x0.35), buộc người chơi phải phối hợp liên hoàn Sát Chiêu Cửu Chuyển.
 *  - Hỗ trợ đạn truy kích (Homing) và tia cực quang (Laser Beam) cho các Sát Chiêu Cửu Chuyển của Song Tôn.
 */

(function (global) {
    "use strict";

    class CombatSystem {
        constructor() {
            this.game = null;
            this.aperture = null;
            this.player = null;
            this.map = null;
            this.guSystem = null;
            this.enemies = null;
            this.ui = null;

            // Thời gian hồi chiêu
            this.guCooldowns = {};
            this.killerCooldowns = {};
            this.dashCooldown = 0;

            // Danh sách thực thể kỹ năng đang hoạt động trên chiến trường 2D
            this.projectiles = [];
            this.aoeEffects = [];
            this.groundZones = [];
            this.fallingStrikes = [];
            this.orbiters = [];
            this.beastPhantoms = [];
            this.summons = [];
            this.beams = [];
            this.lightningArcs = [];
            this.afterimages = [];
            this.particles = [];
            this.floatingTexts = [];

            // Liên kích (Combo) & Rung màn hình
            this.comboCount = 0;
            this.comboTimer = 0;
            this.maxComboReached = 0;
            this.screenShakeTime = 0;
            this.screenShakeMagnitude = 0;
            this.iframeTimer = 0;

            this._boundExtraControls = false;
        }

        init(systems) {
            this.game = systems.game || null;
            this.aperture = systems.aperture || null;
            this.player = systems.player || null;
            this.map = systems.map || null;
            this.guSystem = systems.guSystem || null;
            this.enemies = systems.enemies || null;
            this.ui = systems.ui || null;

            this._bindAdvancedCombatInputs();
            this._hookPlayerReflectAndIframe();
        }

        reset() {
            this.guCooldowns = {};
            this.killerCooldowns = {};
            this.dashCooldown = 0;

            this.projectiles = [];
            this.aoeEffects = [];
            this.groundZones = [];
            this.fallingStrikes = [];
            this.orbiters = [];
            this.beastPhantoms = [];
            this.summons = [];
            this.beams = [];
            this.lightningArcs = [];
            this.afterimages = [];
            this.particles = [];
            this.floatingTexts = [];

            this.comboCount = 0;
            this.comboTimer = 0;
            this.screenShakeTime = 0;
            this.screenShakeMagnitude = 0;
            this.iframeTimer = 0;
        }

        // =====================================================================
        // 1. ĐIỀU KHIỂN THÂN PHÁP LƯỚT (SPACE / CHUỘT PHẢI) & PHẢN CHẤN HỘ THUẪN
        // =====================================================================

        _bindAdvancedCombatInputs() {
            if (this._boundExtraControls) return;
            this._boundExtraControls = true;

            window.addEventListener("keydown", (e) => {
                const tag = document.activeElement ? document.activeElement.tagName.toLowerCase() : "";
                if (tag === "input" || tag === "select" || tag === "textarea") return;

                if (this.game && this.game.currentScreen === "battle" && e.code === "Space" && !e.repeat) {
                    e.preventDefault();
                    this.performPhantomDash();
                }
            });

            window.addEventListener("contextmenu", (e) => {
                if (this.game && this.game.currentScreen === "battle") {
                    e.preventDefault();
                    this.performPhantomDash(true);
                }
            });
        }

        _hookPlayerReflectAndIframe() {
            if (!this.player || this.player._combatHooked) return;
            this.player._combatHooked = true;

            const origTakeDamage = this.player.takeDamage.bind(this.player);
            this.player.takeDamage = (rawDamage, sourceName = "Đòn tấn công") => {
                if (this.iframeTimer > 0 && !sourceName.includes("Khiếu Bích")) {
                    this.spawnFloatingText(this.player.x, this.player.y - 24, "Tàn Ảnh Né Tránh!", "#6ce6b8");
                    return { damageTaken: 0, isDead: false, dodged: true, source: sourceName };
                }

                const activeDefBuff = this.player.activeBuffs.find(
                    b => b.statMods && (b.statMods.def > 0 || b.shieldHp > 0)
                );

                const res = origTakeDamage(rawDamage, sourceName);

                if (activeDefBuff && this.enemies && !sourceName.includes("Khiếu Bích")) {
                    const reflectDmg = Math.max(3, Math.round(activeDefBuff.statMods.def * 0.85));
                    const nearTargets = this.enemies.getHostileTargetsInRadius(this.player.x, this.player.y, 105);
                    for (const t of nearTargets) {
                        this.enemies.damageEntity(t, reflectDmg, this.player, this);
                        this.spawnFloatingText(t.x, t.y - 22, `Phản Chấn -${reflectDmg}`, "#e0be77");
                    }
                    this._spawnParticleBurst(this.player.x, this.player.y, "#e0be77", 6);
                }

                return res;
            };
        }

        performPhantomDash(towardCursor = false) {
            if (!this.player || this.player.hp <= 0) return false;
            if (this.dashCooldown > 0) return false;

            if (this.player.stamina < 12) {
                this.spawnFloatingText(this.player.x, this.player.y - 22, "Thiếu Thể Lực!", "#ff9f43");
                return false;
            }

            this.player.stamina = Math.max(0, this.player.stamina - 12);
            this.dashCooldown = 1.45;
            this.iframeTimer = 0.40;

            let angle = this.player.aimAngle;
            if (!towardCursor && this.game && this.game.input) {
                const inp = this.game.input;
                const mx = (inp.right ? 1 : 0) - (inp.left ? 1 : 0);
                const my = (inp.down ? 1 : 0) - (inp.up ? 1 : 0);
                if (mx !== 0 || my !== 0) {
                    angle = Math.atan2(my, mx);
                }
            }

            this._dashPlayerAlongAngle(angle, 145, "#6ce6b8");
            this.spawnFloatingText(this.player.x, this.player.y - 26, "Phá Không Thân Pháp!", "#6ce6b8");
            return true;
        }

        _dashPlayerAlongAngle(angle, dashDist = 145, trailColor = "#6ce6b8") {
            const steps = 6;
            const stepX = (Math.cos(angle) * dashDist) / steps;
            const stepY = (Math.sin(angle) * dashDist) / steps;

            for (let i = 1; i <= steps; i++) {
                this.afterimages.push({
                    x: this.player.x,
                    y: this.player.y,
                    facing: this.player.facing,
                    color: trailColor,
                    alpha: 0.65 - i * 0.08,
                    life: 0.26 + i * 0.04
                });

                const nx = this.player.x + stepX;
                const ny = this.player.y + stepY;
                if (!this.map || this.map.isWalkable(nx, ny, this.player.radius)) {
                    this.player.x = nx;
                    this.player.y = ny;
                } else {
                    break;
                }
            }
            this._spawnParticleBurst(this.player.x, this.player.y, trailColor, 12);
        }

        // =====================================================================
        // 2. TRUY VẤN HỒI CHIÊU, BẠO KÍCH VẬN ĐẠO & PHÒNG NGỰ VÔ ĐỐI TÔN GIẢ
        // =====================================================================

        getGuCooldownRemaining(instanceId) {
            if (!instanceId) return 0;
            return Math.max(0, this.guCooldowns[instanceId] || 0);
        }

        getKillerMoveCooldownRemaining(moveId) {
            if (!moveId) return 0;
            return Math.max(0, this.killerCooldowns[moveId] || 0);
        }

        _rollCriticalAndComboDamage(baseDamage) {
            const vanMarks = (this.player && this.player.daoMarks && this.player.daoMarks["Vận Đạo"]) || 0;
            const critChance = Math.min(0.60, 0.10 + vanMarks * 0.0022 + this.comboCount * 0.006);
            const isCrit = Math.random() < critChance;

            const comboMultiplier = 1 + Math.min(0.30, this.comboCount * 0.01);
            const critMultiplier = isCrit ? 1.75 : 1.0;

            const finalDamage = Math.max(1, Math.round(baseDamage * comboMultiplier * critMultiplier));
            return { damage: finalDamage, isCrit: isCrit };
        }

        /**
         * Tính hệ số Áp Chế Chuyển Số & Phòng Ngự Vô Đối Cửu Chuyển Tôn Giả
         */
        _calculateRankSuppression(skillRank = 1, targetRank = 1, target = null) {
            // A. Trường hợp mục tiêu là Tôn Giả Cửu Chuyển (Phong Ma Quật)
            if (targetRank >= 9 || (target && target.isVenerable)) {
                if (skillRank <= 5) {
                    return {
                        multiplier: 0.001,
                        suppressed: true,
                        label: "Phàm Thuật Bất Khả Xâm Tôn Giả (-99.9%)"
                    };
                }
                if (skillRank === 6) {
                    return {
                        multiplier: 0.005,
                        suppressed: true,
                        label: "Tôn Giả Vạn Pháp Bất Xâm (-99.5%)"
                    };
                }
                if (skillRank === 7) {
                    return {
                        multiplier: 0.015,
                        suppressed: true,
                        label: "Đạo Ngân Tôn Giả Áp Chế (-98.5%)"
                    };
                }
                if (skillRank === 8) {
                    return {
                        multiplier: 0.04,
                        suppressed: true,
                        label: "Chưa Thành Tôn Giả Đều Là Sâu Kiến (-96%)"
                    };
                }
                // Ngay cả khi dùng Cổ Trùng / Sát Chiêu Cửu Chuyển (Rank 9),
                // Tôn Giả vẫn có Hộ Thể Cửu Chuyển Vô Địch giảm 65% sát thương!
                return {
                    multiplier: 0.35,
                    suppressed: true,
                    label: "Hộ Thể Cửu Chuyển Vô Địch (-65%)"
                };
            }

            if (skillRank >= targetRank) {
                return { multiplier: 1.0, suppressed: false, label: "" };
            }

            // B. Phàm Cổ / Phàm Chiêu (1–5 Chuyển) đánh vào Tiên Cảnh (6–8 Chuyển)
            if (skillRank <= 5 && targetRank >= 6) {
                return {
                    multiplier: 0.02,
                    suppressed: true,
                    label: "Phàm Thuật Khó Thương Tiên Thể (-98%)"
                };
            }

            const diff = targetRank - skillRank;

            // C. Chênh lệch giữa các bậc Tiên Cảnh (6 vs 7, 6 vs 8, 7 vs 8)
            if (targetRank >= 6) {
                if (diff === 1) {
                    return {
                        multiplier: 0.32,
                        suppressed: true,
                        label: `Áp Chế ${targetRank} Chuyển (-68%)`
                    };
                }
                if (diff === 2) {
                    return {
                        multiplier: 0.08,
                        suppressed: true,
                        label: `Áp Chế Tuyệt Đối ${targetRank} Chuyển (-92%)`
                    };
                }
                return {
                    multiplier: 0.03,
                    suppressed: true,
                    label: `Áp Chế Tôn Giả (-97%)`
                };
            }

            // D. Chênh lệch giữa các bậc Phàm Cảnh (1 -> 5 Chuyển)
            const mortalMult = Math.max(0.18, Number(Math.pow(0.62, diff).toFixed(2)));
            return {
                multiplier: mortalMult,
                suppressed: diff >= 2,
                label: diff >= 2 ? `Vượt Cấp Khó Phá Giáp (-${Math.round((1 - mortalMult) * 100)}%)` : ""
            };
        }

        _registerComboHit() {
            this.comboCount += 1;
            this.comboTimer = 4.0;
            if (this.comboCount > this.maxComboReached) {
                this.maxComboReached = this.comboCount;
            }
            if (this.comboCount % 12 === 0 && this.aperture && !this.aperture.isImmortal) {
                this.aperture.currentEssence = Math.min(
                    this.aperture.aptitude.maxSeaPercent,
                    this.aperture.currentEssence + 1.5
                );
                this.spawnFloatingText(this.player.x, this.player.y - 34, `${this.comboCount} Liên Kích! (+1.5% Chân Nguyên)`, "#ffd700");
            }
        }

        triggerScreenShake(magnitude = 5, duration = 0.20) {
            this.screenShakeMagnitude = Math.max(this.screenShakeMagnitude, magnitude);
            this.screenShakeTime = Math.max(this.screenShakeTime, duration);
        }

        // =====================================================================
        // 3. KÍCH HOẠT 8 Ô CỔ TRÙNG ĐƠN LẺ (THEO ĐÚNG SỐ CHUYỂN CỦA CỔ)
        // =====================================================================

        activateGuSlot(slotIdx, targetX, targetY) {
            if (!this.guSystem || !this.player || !this.aperture) return false;
            if (this.player.hp <= 0) return false;

            const gu = this.guSystem.getEquippedGuAt(slotIdx);
            if (!gu) {
                if (this.ui) this.ui.addLog(`Ô kỹ năng ${slotIdx + 1} chưa trang bị Cổ Trùng!`, "warning");
                return false;
            }

            const fullGuName = global.GuSystem.formatGuNameWithRank
                ? global.GuSystem.formatGuNameWithRank(gu)
                : `${gu.name} (${gu.rank} Chuyển)`;

            if (!gu.isRefined) {
                if (this.ui) this.ui.addLog(`[${fullGuName}] chưa được luyện hóa!`, "warning");
                return false;
            }
            if (gu.hunger <= 0) {
                if (this.ui) this.ui.addLog(`[${fullGuName}] đang đói kiệt sức (0%)! Hãy cho ăn trong Kho Cổ.`, "danger");
                return false;
            }

            if (this.getGuCooldownRemaining(gu.instanceId) > 0) return false;

            if (!this.aperture.hasEnoughEssence(gu.essenceCost, gu.rank)) {
                this.spawnFloatingText(this.player.x, this.player.y - 24, "Thiếu Chân Nguyên!", "#ff6b6b");
                return false;
            }

            const consumeRes = this.aperture.consumeEssence(gu.essenceCost, gu.rank);
            if (!consumeRes.success) return false;

            const timeMarks = (this.player.daoMarks && this.player.daoMarks["Thời Gian Đạo"]) || 0;
            const cdMultiplier = Math.max(0.50, 1 - timeMarks * 0.0015);
            this.guCooldowns[gu.instanceId] = Number((gu.cooldown * cdMultiplier).toFixed(2));

            gu.hunger = Math.max(0, Number((gu.hunger - 0.30).toFixed(2)));

            const daoAmp = this.player.calculateDaoAmplification(gu.path, []);
            const finalPower = Math.max(5, Math.round(gu.power * daoAmp.multiplier));

            const aimX = typeof targetX === "number"
                ? targetX
                : (this.game && this.game.input ? this.game.input.mouseWorldX : this.player.x + Math.cos(this.player.aimAngle) * 160);
            const aimY = typeof targetY === "number"
                ? targetY
                : (this.game && this.game.input ? this.game.input.mouseWorldY : this.player.y + Math.sin(this.player.aimAngle) * 160);
            const angle = Math.atan2(aimY - this.player.y, aimX - this.player.x);
            this.player.aimAngle = angle;

            this.player.triggerAttackAnimation();
            this._executeSingleGuSkill(gu, finalPower, angle, aimX, aimY);

            if (this.ui) this.ui.updateHUD();
            return true;
        }

        _executeSingleGuSkill(gu, finalPower, angle, aimX, aimY) {
            const guRank = gu.rank || 1;
            const fullGuName = global.GuSystem.formatGuNameWithRank
                ? global.GuSystem.formatGuNameWithRank(gu)
                : gu.name;

            if (gu.path === "Lực Đạo") {
                this.spawnBeastPhantom({
                    name: `${fullGuName} Thú Ảnh`,
                    skillRank: guRank,
                    icon: gu.icon || "🐗",
                    x: this.player.x,
                    y: this.player.y,
                    angle: angle,
                    speed: 350 + guRank * 30,
                    maxDistance: 160 + guRank * 35,
                    radius: 30 + guRank * 8,
                    damage: finalPower,
                    color: gu.visualColor || "#e07a45",
                    stunDuration: 0.9 + guRank * 0.2,
                    knockbackForce: 65 + guRank * 12
                });
                this.triggerScreenShake(2 + guRank, 0.18);
                return;
            }

            if (gu.path === "Lôi Đạo") {
                if (gu.type === "movement") {
                    this.player.addBuff({
                        id: `buff_${gu.id}`,
                        name: fullGuName,
                        icon: gu.icon,
                        duration: gu.buffDuration || 8,
                        statMods: { spdMult: gu.speedBoost || 1.75 },
                        visualColor: "#a569bd"
                    });
                    this._dashPlayerAlongAngle(angle, 140, "#a569bd");
                }
                this.triggerChainLightning(
                    this.player.x + Math.cos(angle) * 45,
                    this.player.y + Math.sin(angle) * 45,
                    finalPower,
                    1 + guRank,
                    "#b75cff",
                    guRank
                );
                return;
            }

            if (gu.id === "dinh_tien_du_gu") {
                const dist = Math.min(gu.range || 520, Math.hypot(aimX - this.player.x, aimY - this.player.y));
                const destX = this.player.x + Math.cos(angle) * dist;
                const destY = this.player.y + Math.sin(angle) * dist;
                if (!this.map || this.map.isWalkable(destX, destY, this.player.radius)) {
                    this._spawnParticleBurst(this.player.x, this.player.y, "#5cc995", 20);
                    this.player.x = destX;
                    this.player.y = destY;
                }
                this.spawnAoEEffect({
                    owner: "player",
                    name: fullGuName,
                    skillRank: guRank,
                    x: this.player.x,
                    y: this.player.y,
                    radius: 140,
                    damage: finalPower,
                    color: "#5cc995",
                    duration: 0.45
                });
                return;
            }

            if (gu.castType === "projectile") {
                const isHoming = gu.path === "Kiếm Đạo" || guRank >= 6;
                const isSpinning = gu.id === "cot_thuong_gu" || guRank >= 2;
                let statusType = null;
                if (gu.path === "Huyết Đạo" || gu.path === "Kiếm Đạo") statusType = "bleed";
                else if (gu.path === "Băng Đạo") statusType = "chill";
                else if (gu.path === "Viêm Đạo") statusType = "burn";
                else if (gu.path === "Độc Đạo" || gu.path === "Ám Đạo") statusType = "poison";

                this.spawnProjectile({
                    owner: "player",
                    guId: gu.id,
                    name: fullGuName,
                    skillRank: guRank,
                    path: gu.path,
                    x: this.player.x + Math.cos(angle) * 16,
                    y: this.player.y + Math.sin(angle) * 16,
                    angle: angle,
                    speed: gu.projectileSpeed || 450,
                    maxRange: gu.range || 320,
                    radius: gu.radius || 18,
                    damage: finalPower,
                    color: gu.projectileColor || "#38c992",
                    slowEffect: gu.slowEffect || 0,
                    lifesteal: gu.lifesteal || 0,
                    pierce: Math.min(5, Math.ceil(guRank / 2)),
                    homing: isHoming,
                    spinning: isSpinning,
                    ricochet: (gu.id === "nguyet_quang_gu" && guRank >= 2) ? 1 : 0,
                    statusEffect: statusType
                });
                return;
            }

            if (gu.castType === "aoe_cursor") {
                const dist = Math.hypot(aimX - this.player.x, aimY - this.player.y);
                const clampedDist = Math.min(dist, gu.range || 300);
                const castX = this.player.x + Math.cos(angle) * clampedDist;
                const castY = this.player.y + Math.sin(angle) * clampedDist;

                let statusType = "burn";
                if (gu.path === "Băng Đạo") statusType = "chill";
                else if (gu.path === "Độc Đạo") statusType = "poison";
                else if (gu.path === "Huyết Đạo") statusType = "bleed";

                this.spawnAoEEffect({
                    owner: "player",
                    name: fullGuName,
                    skillRank: guRank,
                    x: castX,
                    y: castY,
                    radius: gu.radius || 75,
                    damage: finalPower,
                    color: gu.projectileColor || "#ff5733",
                    duration: 0.45,
                    lifesteal: gu.lifesteal || 0,
                    statusEffect: statusType
                });

                if (guRank >= 2 || gu.path === "Độc Đạo" || gu.path === "Viêm Đạo") {
                    this.groundZones.push({
                        x: castX,
                        y: castY,
                        skillRank: guRank,
                        radius: (gu.radius || 75) * 0.85,
                        color: gu.projectileColor || "#ff5733",
                        damagePerTick: Math.max(2, Math.round(finalPower * 0.20)),
                        tickTimer: 0.45,
                        duration: 2.5 + guRank * 0.5,
                        statusEffect: statusType,
                        pullForce: 0
                    });
                }
                return;
            }

            if (gu.castType === "aoe_self") {
                this.spawnAoEEffect({
                    owner: "player",
                    name: fullGuName,
                    skillRank: guRank,
                    x: this.player.x,
                    y: this.player.y,
                    radius: gu.radius || 110,
                    damage: finalPower,
                    color: gu.visualColor || "#c0392b",
                    duration: 0.45,
                    lifesteal: gu.lifesteal || 0,
                    statusEffect: gu.path === "Hồn Đạo" ? "stun" : "bleed",
                    knockbackForce: 65
                });
                return;
            }

            if (gu.castType === "self_buff") {
                if (gu.type === "defensive") {
                    const shieldHp = Math.round((gu.shieldAmount || gu.power) * (this.player.calculateDaoAmplification(gu.path, []).multiplier));
                    this.player.addBuff({
                        id: `buff_${gu.id}`,
                        name: fullGuName,
                        icon: gu.icon,
                        duration: gu.buffDuration || 10,
                        statMods: { def: gu.power },
                        shieldHp: shieldHp,
                        visualColor: gu.visualColor || "#e8f6f3"
                    });
                    this.spawnFloatingText(this.player.x, this.player.y - 28, `🛡️ Hộ Thuẫn +${shieldHp}`, "#e0be77");
                } else if (gu.type === "movement") {
                    this.player.addBuff({
                        id: `buff_${gu.id}`,
                        name: fullGuName,
                        icon: gu.icon,
                        duration: gu.buffDuration || 7,
                        statMods: { spdMult: gu.speedBoost || 1.45 },
                        visualColor: gu.visualColor || "#6ce6b8"
                    });
                    this._dashPlayerAlongAngle(angle, 115 + guRank * 20, gu.visualColor || "#6ce6b8");
                } else if (gu.subType === "recon") {
                    this.player.addBuff({
                        id: `buff_${gu.id}`,
                        name: fullGuName,
                        icon: gu.icon,
                        duration: gu.buffDuration || 15,
                        statMods: { vision: 160 },
                        visualColor: "#76d7c4"
                    });
                    this.spawnFloatingText(this.player.x, this.player.y - 26, "👁️ Trinh Sát Lộ Điểm Yếu!", "#76d7c4");
                } else if (gu.subType === "cultivation") {
                    if (!this.aperture.isImmortal) {
                        this.aperture.wallProgress = Math.min(
                            this.aperture.maxWallProgress,
                            this.aperture.wallProgress + gu.power
                        );
                    }
                    this.spawnFloatingText(this.player.x, this.player.y - 26, `+${gu.power} Ôn Dưỡng Khiếu`, "#f7c948");
                }
                this._spawnParticleBurst(this.player.x, this.player.y, gu.visualColor || "#e0be77", 14);
                return;
            }

            if (gu.castType === "heal") {
                const actualHealed = this.player.heal(finalPower);
                this.spawnFloatingText(this.player.x, this.player.y - 28, `💚 +${actualHealed} HP`, "#4cd964");
                this._spawnParticleBurst(this.player.x, this.player.y, "#4cd964", 16);
            }
        }

        // =====================================================================
        // 4. KÍCH HOẠT 4 Ô SÁT CHIÊU (Z, X, C, V) — ĐỒNG BỘ CHUYỂN SỐ
        // =====================================================================

        activateKillerMoveSlot(kSlotIdx, targetX, targetY) {
            if (!this.guSystem || !this.player || !this.aperture) return false;
            if (this.player.hp <= 0) return false;

            const keys = ["Z", "X", "C", "V"];
            const move = this.guSystem.getEquippedKillerMoveAt(kSlotIdx);

            if (!move) {
                if (this.ui) {
                    this.ui.addLog(`Phím [${keys[kSlotIdx]}] chưa gán Sát Chiêu! Mở [Thiên Cơ Sát Chiêu] để thiết lập.`, "warning");
                }
                return false;
            }

            if (typeof this.guSystem._recalculateSavedKillerMoves === "function") {
                this.guSystem._recalculateSavedKillerMoves();
            }

            const checkComp = this.guSystem.validateKillerMoveComponents(move);
            if (!checkComp.valid) {
                if (this.ui) this.ui.addLog(checkComp.reason, "danger");
                this.spawnFloatingText(this.player.x, this.player.y - 26, "Thiếu Cổ Thành Phần!", "#e05252");
                return false;
            }

            if (this.getKillerMoveCooldownRemaining(move.id) > 0) return false;

            const moveRank = move.moveRank || (move.isImmortal ? 6 : 1);
            if (!this.aperture.hasEnoughEssence(move.essenceCost, moveRank)) {
                this.spawnFloatingText(this.player.x, this.player.y - 24, "Không Đủ Chân Nguyên!", "#ff6b6b");
                return false;
            }

            this.aperture.consumeEssence(move.essenceCost, moveRank);
            this.killerCooldowns[move.id] = move.cooldown || 5.5;

            for (const reqId of move.requiredGuIds) {
                const compGu = this.guSystem.ownedGuList.find(g => g.id === reqId && g.isRefined);
                if (compGu) {
                    compGu.hunger = Math.max(0, Number((compGu.hunger - 0.35).toFixed(2)));
                }
            }

            const daoAmp = this.player.calculateDaoAmplification(move.path, []);
            const totalPower = Math.max(20, Math.round(move.power * daoAmp.multiplier));

            const aimX = typeof targetX === "number"
                ? targetX
                : (this.game && this.game.input ? this.game.input.mouseWorldX : this.player.x + Math.cos(this.player.aimAngle) * 200);
            const aimY = typeof targetY === "number"
                ? targetY
                : (this.game && this.game.input ? this.game.input.mouseWorldY : this.player.y + Math.sin(this.player.aimAngle) * 200);
            const baseAngle = Math.atan2(aimY - this.player.y, aimX - this.player.x);
            this.player.aimAngle = baseAngle;

            const profile = move.combatProfile || {
                deliveryType: "crescent_barrage",
                moveRank: moveRank,
                primaryColor: "#7ef7f0",
                secondaryColor: "#5cc995",
                projectileCount: 1 + moveRank,
                projectileSpeed: 480,
                range: 340,
                aoeRadius: 85 + moveRank * 15,
                phantomIcon: "🐗",
                phantomCount: 1,
                modifiers: [],
                speedBoost: move.speedBoost || 0,
                boostDuration: 6,
                shieldAmount: move.shieldAmount || 0,
                healAmount: move.healAmount || 0,
                lifesteal: move.lifesteal || 0
            };

            const rankName = global.GuSystem.getRankName ? global.GuSystem.getRankName(moveRank) : `${moveRank} Chuyển`;
            this.player.triggerAttackAnimation();
            this.triggerScreenShake(2 + moveRank * 1.2, 0.22);
            this.spawnFloatingText(this.player.x, this.player.y - 38, `⚡ 【${move.name} (${rankName})】`, "#ffd700");
            if (this.ui) {
                this.ui.addLog(`⚡ Phát động Sát Chiêu 【${move.name} (${rankName})】 (Uy lực thực tế: ${totalPower})!`, "combat");
            }

            this._executeKillerMovePrimaryDelivery(move, profile, totalPower, baseAngle, aimX, aimY);
            this._executeKillerMoveSupportModifiers(move, profile, totalPower, baseAngle, aimX, aimY);

            if (this.ui) this.ui.updateHUD();
            return true;
        }

        _executeKillerMovePrimaryDelivery(move, profile, totalPower, baseAngle, aimX, aimY) {
            const rank = profile.moveRank || move.moveRank || 1;
            const mods = profile.modifiers || [];
            const isHoming = mods.includes("homing_guidance") || profile.deliveryType === "sword_formation";
            const isSpinning = mods.includes("ricochet_spin") || profile.deliveryType === "bone_spear_rain";
            const ricochetCount = mods.includes("ricochet_spin") ? Math.min(3, rank) : 0;

            const distToCursor = Math.min(profile.range || 360, Math.hypot(aimX - this.player.x, aimY - this.player.y));
            const targetPointX = this.player.x + Math.cos(baseAngle) * distToCursor;
            const targetPointY = this.player.y + Math.sin(baseAngle) * distToCursor;

            switch (profile.deliveryType) {
                case "crescent_barrage": {
                    const count = profile.projectileCount || (2 + rank);
                    const spread = 0.42 + rank * 0.05;
                    for (let i = 0; i < count; i++) {
                        const offset = count === 1 ? 0 : -spread / 2 + (spread / (count - 1)) * i;
                        this.spawnProjectile({
                            owner: "player",
                            name: move.name,
                            skillRank: rank,
                            path: move.path,
                            x: this.player.x + Math.cos(baseAngle + offset) * 18,
                            y: this.player.y + Math.sin(baseAngle + offset) * 18,
                            angle: baseAngle + offset,
                            speed: profile.projectileSpeed || 480,
                            maxRange: profile.range || 350,
                            radius: 18 + rank * 3,
                            damage: Math.round(totalPower / Math.max(1.5, count * 0.55)),
                            color: profile.primaryColor || "#7ef7f0",
                            lifesteal: profile.lifesteal || 0,
                            pierce: Math.min(5, rank),
                            homing: isHoming,
                            spinning: isSpinning,
                            ricochet: ricochetCount,
                            statusEffect: mods.includes("frost_chill") ? "chill" : (mods.includes("burn_ground") ? "burn" : null)
                        });
                    }
                    break;
                }

                case "wind_tornado": {
                    const bladeCount = 1 + Math.min(6, rank);
                    for (let i = 0; i < bladeCount; i++) {
                        const offset = bladeCount === 1 ? 0 : (i - (bladeCount - 1) / 2) * 0.22;
                        this.spawnProjectile({
                            owner: "player",
                            name: move.name,
                            skillRank: rank,
                            path: "Phong Đạo",
                            x: this.player.x + Math.cos(baseAngle + offset) * 20,
                            y: this.player.y + Math.sin(baseAngle + offset) * 20,
                            angle: baseAngle + offset,
                            speed: 400 + rank * 25,
                            maxRange: profile.range || 370,
                            radius: 26 + rank * 4,
                            damage: Math.round(totalPower * 0.75),
                            color: "#5cc995",
                            pierce: 4,
                            spinning: true,
                            lifesteal: profile.lifesteal || 0,
                            statusEffect: "bleed"
                        });
                    }
                    this.groundZones.push({
                        x: targetPointX,
                        y: targetPointY,
                        skillRank: rank,
                        radius: 75 + rank * 16,
                        color: "#38c992",
                        damagePerTick: Math.max(4, Math.round(totalPower * 0.22)),
                        tickTimer: 0.35,
                        duration: 2.5 + rank * 0.4,
                        statusEffect: null,
                        pullForce: 80 + rank * 15
                    });
                    break;
                }

                case "beast_stampede": {
                    const pCount = profile.phantomCount || Math.min(5, Math.max(1, Math.ceil(rank / 1.5)));
                    const spread = 0.32;
                    for (let i = 0; i < pCount; i++) {
                        const offset = pCount === 1 ? 0 : (i - (pCount - 1) / 2) * spread;
                        this.spawnBeastPhantom({
                            name: move.name,
                            skillRank: rank,
                            icon: profile.phantomIcon || "🐗",
                            x: this.player.x,
                            y: this.player.y,
                            angle: baseAngle + offset,
                            speed: 380 + rank * 25,
                            maxDistance: 190 + rank * 35,
                            radius: 34 + rank * 7,
                            damage: Math.round(totalPower / Math.max(1, pCount * 0.65)),
                            color: profile.primaryColor || "#e07a45",
                            stunDuration: 1.1 + rank * 0.25,
                            knockbackForce: 85 + rank * 15
                        });
                    }
                    break;
                }

                case "bone_spear_rain": {
                    const spearCount = 2 + Math.min(7, rank);
                    for (let i = 0; i < spearCount; i++) {
                        const offset = (i - (spearCount - 1) / 2) * 0.15;
                        this.spawnProjectile({
                            owner: "player",
                            name: move.name,
                            skillRank: rank,
                            path: "Kim Đạo",
                            x: this.player.x + Math.cos(baseAngle + offset) * 18,
                            y: this.player.y + Math.sin(baseAngle + offset) * 18,
                            angle: baseAngle + offset,
                            speed: 550,
                            maxRange: profile.range || 380,
                            radius: 20 + rank * 2,
                            damage: Math.round(totalPower * 0.62),
                            color: "#f5f7fa",
                            pierce: 3 + rank,
                            spinning: true,
                            homing: isHoming,
                            lifesteal: profile.lifesteal || 0,
                            statusEffect: "bleed"
                        });
                    }
                    break;
                }

                case "sword_formation": {
                    const swordCount = 2 + Math.min(8, rank);
                    const spread = 0.65;
                    for (let i = 0; i < swordCount; i++) {
                        const offset = (i - (swordCount - 1) / 2) * (spread / Math.max(1, swordCount - 1));
                        this.spawnProjectile({
                            owner: "player",
                            name: move.name,
                            skillRank: rank,
                            path: "Kiếm Đạo",
                            x: this.player.x + Math.cos(baseAngle + offset) * 22,
                            y: this.player.y + Math.sin(baseAngle + offset) * 22,
                            angle: baseAngle + offset,
                            speed: 640,
                            maxRange: 450 + rank * 25,
                            radius: 22 + rank * 3,
                            damage: Math.round(totalPower * 0.58),
                            color: "#dce8f2",
                            pierce: 2 + Math.floor(rank / 2),
                            homing: true,
                            lifesteal: profile.lifesteal || 0,
                            statusEffect: "bleed"
                        });
                    }
                    break;
                }

                case "fire_meteor": {
                    this.spawnAoEEffect({
                        owner: "player",
                        name: move.name,
                        skillRank: rank,
                        x: targetPointX,
                        y: targetPointY,
                        radius: profile.aoeRadius || (80 + rank * 18),
                        damage: Math.round(totalPower * 0.75),
                        color: "#ff5733",
                        duration: 0.5,
                        lifesteal: profile.lifesteal || 0,
                        statusEffect: "burn"
                    });

                    const meteorCount = 1 + Math.min(6, rank);
                    for (let m = 0; m < meteorCount; m++) {
                        this.fallingStrikes.push({
                            targetX: targetPointX + (Math.random() - 0.5) * (profile.aoeRadius || 85),
                            targetY: targetPointY + (Math.random() - 0.5) * (profile.aoeRadius || 85),
                            skillRank: rank,
                            currentYOffset: 180 + m * 65,
                            fallSpeed: 620,
                            radius: 38 + rank * 5,
                            damage: Math.round(totalPower * 0.45),
                            color: "#ff5733",
                            statusEffect: "burn"
                        });
                    }
                    break;
                }

                case "frost_lance": {
                    this.spawnLaserBeam({
                        owner: "player",
                        x: this.player.x,
                        y: this.player.y,
                        skillRank: rank,
                        angle: baseAngle,
                        length: distToCursor + 45,
                        width: 16 + rank * 5,
                        damage: Math.round(totalPower * 0.65),
                        color: "#85c1e9",
                        lifesteal: profile.lifesteal || 0,
                        statusEffect: "chill"
                    });

                    this.spawnAoEEffect({
                        owner: "player",
                        name: move.name,
                        skillRank: rank,
                        x: targetPointX,
                        y: targetPointY,
                        radius: profile.aoeRadius || (75 + rank * 16),
                        damage: Math.round(totalPower * 0.65),
                        color: "#85c1e9",
                        duration: 0.5,
                        slowEffect: 0.60,
                        statusEffect: "chill"
                    });
                    break;
                }

                case "thunder_chain": {
                    this.triggerChainLightning(
                        this.player.x + Math.cos(baseAngle) * 50,
                        this.player.y + Math.sin(baseAngle) * 50,
                        totalPower,
                        2 + rank * 2,
                        "#b75cff",
                        rank
                    );
                    this.spawnAoEEffect({
                        owner: "player",
                        name: move.name,
                        skillRank: rank,
                        x: targetPointX,
                        y: targetPointY,
                        radius: 70 + rank * 12,
                        damage: Math.round(totalPower * 0.5),
                        color: "#b75cff",
                        duration: 0.35,
                        statusEffect: "stun"
                    });
                    break;
                }

                case "poison_miasma": {
                    this.spawnAoEEffect({
                        owner: "player",
                        name: move.name,
                        skillRank: rank,
                        x: targetPointX,
                        y: targetPointY,
                        radius: profile.aoeRadius || (85 + rank * 18),
                        damage: Math.round(totalPower * 0.55),
                        color: "#9b59b6",
                        duration: 0.5,
                        statusEffect: "poison"
                    });
                    this.groundZones.push({
                        x: targetPointX,
                        y: targetPointY,
                        skillRank: rank,
                        radius: profile.aoeRadius || (85 + rank * 18),
                        color: "#9b59b6",
                        damagePerTick: Math.max(5, Math.round(totalPower * 0.30)),
                        tickTimer: 0.4,
                        duration: 4.5 + rank * 0.5,
                        statusEffect: "poison",
                        pullForce: 0
                    });
                    break;
                }

                case "blood_wave": {
                    this.spawnAoEEffect({
                        owner: "player",
                        name: move.name,
                        skillRank: rank,
                        x: this.player.x,
                        y: this.player.y,
                        radius: 95 + rank * 18,
                        damage: Math.round(totalPower * 0.70),
                        color: "#e03e3e",
                        duration: 0.45,
                        lifesteal: Math.max(0.25, profile.lifesteal || 0.25),
                        statusEffect: "bleed"
                    });

                    const waveCount = 1 + Math.min(6, rank);
                    for (let i = 0; i < waveCount; i++) {
                        const offset = waveCount === 1 ? 0 : (i - (waveCount - 1) / 2) * 0.22;
                        this.spawnProjectile({
                            owner: "player",
                            name: move.name,
                            skillRank: rank,
                            path: "Huyết Đạo",
                            x: this.player.x + Math.cos(baseAngle + offset) * 18,
                            y: this.player.y + Math.sin(baseAngle + offset) * 18,
                            angle: baseAngle + offset,
                            speed: 460,
                            maxRange: profile.range || 340,
                            radius: 22 + rank * 3,
                            damage: Math.round(totalPower * 0.55),
                            color: "#e03e3e",
                            lifesteal: Math.max(0.25, profile.lifesteal || 0.25),
                            pierce: 2 + rank,
                            statusEffect: "bleed"
                        });
                    }
                    break;
                }

                case "fortress_aegis": {
                    this.spawnAoEEffect({
                        owner: "player",
                        name: move.name,
                        skillRank: rank,
                        x: this.player.x,
                        y: this.player.y,
                        radius: 95 + rank * 16,
                        damage: Math.round(totalPower * 0.80),
                        color: "#ffd700",
                        duration: 0.45,
                        statusEffect: "stun",
                        knockbackForce: 110 + rank * 15
                    });
                    break;
                }

                case "soul_howl_wave": {
                    this.spawnAoEEffect({
                        owner: "player",
                        name: move.name,
                        skillRank: rank,
                        x: this.player.x,
                        y: this.player.y,
                        radius: 140 + rank * 22,
                        damage: totalPower,
                        color: "#8f6ee6",
                        duration: 0.55,
                        statusEffect: "stun",
                        knockbackForce: 75
                    });
                    break;
                }

                case "water_torrent": {
                    this.spawnLaserBeam({
                        owner: "player",
                        x: this.player.x,
                        y: this.player.y,
                        skillRank: rank,
                        angle: baseAngle,
                        length: 350 + rank * 25,
                        width: 24 + rank * 4,
                        damage: totalPower,
                        color: "#3b8beb",
                        lifesteal: profile.lifesteal || 0,
                        statusEffect: "chill"
                    });
                    break;
                }

                case "dash_blitz": {
                    this.iframeTimer = 0.45;
                    this._dashPlayerAlongAngle(baseAngle, 145 + rank * 20, "#6ce6b8");
                    this.spawnAoEEffect({
                        owner: "player",
                        name: move.name,
                        skillRank: rank,
                        x: this.player.x,
                        y: this.player.y,
                        radius: 90 + rank * 15,
                        damage: totalPower,
                        color: "#6ce6b8",
                        duration: 0.4,
                        statusEffect: "bleed"
                    });
                    break;
                }

                case "space_rift_slash": {
                    if (!this.map || this.map.isWalkable(targetPointX, targetPointY, this.player.radius)) {
                        this._spawnParticleBurst(this.player.x, this.player.y, "#5cc995", 22);
                        this.player.x = targetPointX;
                        this.player.y = targetPointY;
                    }
                    this.spawnAoEEffect({
                        owner: "player",
                        name: move.name,
                        skillRank: rank,
                        x: this.player.x,
                        y: this.player.y,
                        radius: 175,
                        damage: totalPower,
                        color: "#9b72cf",
                        duration: 0.55,
                        statusEffect: "bleed"
                    });
                    break;
                }

                case "time_river_storm": {
                    this.spawnLaserBeam({
                        owner: "player",
                        x: this.player.x,
                        y: this.player.y,
                        skillRank: rank,
                        angle: baseAngle,
                        length: 490,
                        width: 50,
                        damage: totalPower,
                        color: "#f2d16b",
                        statusEffect: "stun"
                    });
                    this.spawnAoEEffect({
                        owner: "player",
                        name: move.name,
                        skillRank: rank,
                        x: this.player.x,
                        y: this.player.y,
                        radius: 185,
                        damage: Math.round(totalPower * 0.75),
                        color: "#f2d16b",
                        duration: 0.6,
                        statusEffect: "chill"
                    });
                    break;
                }

                default: {
                    this.spawnLaserBeam({
                        owner: "player",
                        x: this.player.x,
                        y: this.player.y,
                        skillRank: rank,
                        angle: baseAngle,
                        length: 340 + rank * 25,
                        width: 22 + rank * 4,
                        damage: totalPower,
                        color: profile.primaryColor || "#f7c948",
                        lifesteal: profile.lifesteal || 0
                    });
                    break;
                }
            }
        }

        _executeKillerMoveSupportModifiers(move, profile, totalPower, baseAngle, aimX, aimY) {
            const rank = profile.moveRank || move.moveRank || 1;
            const mods = profile.modifiers || [];
            const daoMult = this.player.calculateDaoAmplification(move.path, []).multiplier;

            const distToCursor = Math.min(profile.range || 340, Math.hypot(aimX - this.player.x, aimY - this.player.y));
            const targetPointX = this.player.x + Math.cos(baseAngle) * distToCursor;
            const targetPointY = this.player.y + Math.sin(baseAngle) * distToCursor;

            if (profile.shieldAmount > 0 || mods.includes("aegis_shield") || mods.includes("water_barrier")) {
                const shieldHp = Math.max(25, Math.round((profile.shieldAmount || rank * 45) * daoMult));
                this.player.addBuff({
                    id: `km_shield_${move.id}`,
                    name: `${move.name} Thuẫn`,
                    icon: "🛡️",
                    duration: profile.boostDuration || (6 + rank),
                    statMods: { def: 10 * rank },
                    shieldHp: shieldHp,
                    visualColor: mods.includes("water_barrier") ? "#3b8beb" : "#f7c948"
                });
                this.spawnFloatingText(this.player.x, this.player.y - 26, `🛡️ +${shieldHp} Hộ Thuẫn`, "#f7c948");
            }

            if (profile.healAmount > 0 || mods.includes("life_bloom")) {
                const healVal = Math.max(20, Math.round((profile.healAmount || rank * 40) * daoMult));
                const healed = this.player.heal(healVal);
                this.spawnFloatingText(this.player.x, this.player.y - 22, `💚 +${healed} HP`, "#4cd964");
            }

            if (profile.speedBoost > 0 || mods.includes("swift_step")) {
                this.player.addBuff({
                    id: `km_spd_${move.id}`,
                    name: `${move.name} Tốc`,
                    icon: "💨",
                    duration: profile.boostDuration || (5 + rank),
                    statMods: { spdMult: profile.speedBoost || 1.45 },
                    visualColor: "#6ce6b8"
                });
            }

            if (mods.includes("orbiting_blades")) {
                const bladeCount = Math.min(5, Math.max(1, rank));
                for (let k = 0; k < bladeCount; k++) {
                    this.spawnOrbiter({
                        name: move.name,
                        skillRank: rank,
                        color: profile.secondaryColor || "#dce8f2",
                        damage: Math.max(8, Math.round(totalPower * 0.25)),
                        radius: 65 + rank * 4,
                        initialAngle: (Math.PI * 2 * k) / bladeCount,
                        duration: 4.5 + rank * 0.8,
                        speed: 5.2
                    });
                }
            }

            if (mods.includes("chain_lightning") && profile.deliveryType !== "thunder_chain") {
                this.triggerChainLightning(
                    targetPointX,
                    targetPointY,
                    Math.round(totalPower * 0.45),
                    1 + rank,
                    "#b75cff",
                    rank
                );
            }

            if (mods.includes("beast_phantom") && profile.deliveryType !== "beast_stampede") {
                this.spawnBeastPhantom({
                    name: move.name,
                    skillRank: rank,
                    icon: profile.phantomIcon || "🐗",
                    x: this.player.x,
                    y: this.player.y,
                    angle: baseAngle,
                    speed: 390,
                    maxDistance: 185 + rank * 25,
                    radius: 32 + rank * 6,
                    damage: Math.round(totalPower * 0.45),
                    color: "#e07a45",
                    stunDuration: 1.2,
                    knockbackForce: 75
                });
            }

            if (mods.includes("burn_ground")) {
                this.groundZones.push({
                    x: targetPointX,
                    y: targetPointY,
                    skillRank: rank,
                    radius: 65 + rank * 14,
                    color: "#ff5733",
                    damagePerTick: Math.max(4, Math.round(totalPower * 0.20)),
                    tickTimer: 0.45,
                    duration: 3.5 + rank * 0.5,
                    statusEffect: "burn",
                    pullForce: 0
                });
            }

            if (mods.includes("vortex_pull") && profile.deliveryType !== "wind_tornado") {
                this.groundZones.push({
                    x: targetPointX,
                    y: targetPointY,
                    skillRank: rank,
                    radius: 70 + rank * 12,
                    color: "#5cc995",
                    damagePerTick: Math.max(3, Math.round(totalPower * 0.15)),
                    tickTimer: 0.45,
                    duration: 2.8,
                    statusEffect: null,
                    pullForce: 65 + rank * 12
                });
            }

            if (mods.includes("blood_servant") && this.summons.length < 2) {
                this.spawnSummon({
                    name: `Huyết Thú (${rank} Chuyển)`,
                    skillRank: rank,
                    icon: "🐺",
                    color: "#e03e3e",
                    x: this.player.x + 26,
                    y: this.player.y + 26,
                    hp: Math.round(totalPower * 1.4),
                    atk: Math.max(8, Math.round(totalPower * 0.32)),
                    duration: 10 + rank * 2
                });
            }

            if (mods.includes("time_accelerate")) {
                for (const key of Object.keys(this.guCooldowns)) {
                    this.guCooldowns[key] = Number((this.guCooldowns[key] * 0.6).toFixed(2));
                }
                this.spawnFloatingText(this.player.x, this.player.y - 30, "⏳ Quang Âm Gia Tốc (-40% Hồi Chiêu)!", "#f2d16b");
            }
        }

        // =====================================================================
        // 5. CÁC HÀM KHỞI TẠO THỰC THỂ KỸ NĂNG CHIẾN ĐẤU (HỖ TRỢ CẢ SONG TÔN)
        // =====================================================================

        spawnProjectile(cfg) {
            this.projectiles.push({
                owner: cfg.owner || "player",
                attackerRef: cfg.attackerRef || null,
                name: cfg.name || "Cổ Thuật",
                skillRank: cfg.skillRank || 1,
                path: cfg.path || "Phong Đạo",
                x: cfg.x,
                y: cfg.y,
                startX: cfg.x,
                startY: cfg.y,
                vx: Math.cos(cfg.angle) * (cfg.speed || 420),
                vy: Math.sin(cfg.angle) * (cfg.speed || 420),
                speed: cfg.speed || 420,
                angle: cfg.angle,
                spinAngle: 0,
                maxRange: cfg.maxRange || 340,
                radius: cfg.radius || 18,
                damage: cfg.damage || 18,
                color: cfg.color || "#38c992",
                slowEffect: cfg.slowEffect || 0,
                lifesteal: cfg.lifesteal || 0,
                pierce: cfg.pierce || 1,
                homing: Boolean(cfg.homing),
                spinning: Boolean(cfg.spinning),
                ricochet: cfg.ricochet || 0,
                statusEffect: cfg.statusEffect || null,
                trail: [],
                hitTargets: new Set()
            });
        }

        spawnOrbiter(cfg) {
            this.orbiters.push({
                name: cfg.name || "Hộ Thân Nhận",
                skillRank: cfg.skillRank || 1,
                color: cfg.color || "#4ce6ff",
                damage: cfg.damage || 15,
                radius: cfg.radius || 65,
                angle: cfg.initialAngle !== undefined ? cfg.initialAngle : Math.random() * Math.PI * 2,
                speed: cfg.speed || 5.0,
                duration: cfg.duration || 5.0,
                hitCooldowns: {}
            });
        }

        spawnBeastPhantom(cfg) {
            this.beastPhantoms.push({
                name: cfg.name || "Lực Đạo Thú Ảnh",
                skillRank: cfg.skillRank || 1,
                icon: cfg.icon || "🐗",
                x: cfg.x,
                y: cfg.y,
                startX: cfg.x,
                startY: cfg.y,
                vx: Math.cos(cfg.angle) * (cfg.speed || 380),
                vy: Math.sin(cfg.angle) * (cfg.speed || 380),
                angle: cfg.angle,
                maxDistance: cfg.maxDistance || 200,
                radius: cfg.radius || 38,
                damage: cfg.damage || 35,
                color: cfg.color || "#e07a45",
                stunDuration: cfg.stunDuration || 1.2,
                knockbackForce: cfg.knockbackForce || 80,
                hitTargets: new Set()
            });
        }

        spawnSummon(cfg) {
            this.summons.push({
                id: `sum_${Date.now()}_${Math.random()}`,
                name: cfg.name || "Huyết Chiến Thú",
                skillRank: cfg.skillRank || 1,
                icon: cfg.icon || "🐺",
                color: cfg.color || "#e03e3e",
                x: cfg.x,
                y: cfg.y,
                hp: cfg.hp || 100,
                maxHp: cfg.hp || 100,
                atk: cfg.atk || 20,
                spd: 155,
                attackCooldown: 0,
                duration: cfg.duration || 12
            });
            this.spawnFloatingText(cfg.x, cfg.y - 20, `Triệu Hồi ${cfg.name}!`, "#ff6b6b");
        }

        spawnLaserBeam(cfg) {
            const owner = cfg.owner || "player";
            const endX = cfg.x + Math.cos(cfg.angle) * cfg.length;
            const endY = cfg.y + Math.sin(cfg.angle) * cfg.length;

            this.beams.push({
                x1: cfg.x,
                y1: cfg.y,
                x2: endX,
                y2: endY,
                width: cfg.width || 22,
                color: cfg.color || "#7ef7f0",
                life: 0.38,
                maxLife: 0.38
            });

            if (owner === "player" && this.enemies) {
                const allHostiles = this.enemies.getHostileTargetsInRadius(cfg.x, cfg.y, cfg.length + 40);
                for (const t of allHostiles) {
                    const distToLine = this._pointToSegmentDistance(t.x, t.y, cfg.x, cfg.y, endX, endY);
                    if (distToLine <= (cfg.width / 2) + t.radius) {
                        this._applyPlayerDamageToTarget(t, cfg.damage, {
                            skillRank: cfg.skillRank || 1,
                            color: cfg.color,
                            lifesteal: cfg.lifesteal || 0,
                            statusEffect: cfg.statusEffect || "bleed"
                        });
                    }
                }
            } else if (owner !== "player" && this.player && this.player.hp > 0) {
                const distToLine = this._pointToSegmentDistance(this.player.x, this.player.y, cfg.x, cfg.y, endX, endY);
                if (distToLine <= (cfg.width / 2) + this.player.radius) {
                    const res = this.player.takeDamage(cfg.damage, cfg.name || "Tôn Giả Quang Trụ");
                    if (!res.dodged) {
                        this.spawnFloatingText(this.player.x, this.player.y - 22, `-${res.damageTaken}`, "#ff4d4d");
                    }
                }
            }
        }

        triggerChainLightning(startX, startY, damage, maxJumps = 3, color = "#b75cff", skillRank = 1) {
            if (!this.enemies) return;
            const visited = new Set();
            let currX = startX;
            let currY = startY;
            let currDmg = damage;

            for (let j = 0; j < maxJumps; j++) {
                const candidates = this.enemies.getHostileTargetsInRadius(currX, currY, 240)
                    .filter(t => !visited.has(t.id));
                if (candidates.length === 0) break;

                candidates.sort((a, b) => Math.hypot(a.x - currX, a.y - currY) - Math.hypot(b.x - currX, b.y - currY));
                const nextTarget = candidates[0];
                visited.add(nextTarget.id);

                this.lightningArcs.push({
                    x1: currX,
                    y1: currY,
                    x2: nextTarget.x,
                    y2: nextTarget.y,
                    color: color,
                    life: 0.28
                });

                this._applyPlayerDamageToTarget(nextTarget, currDmg, {
                    skillRank: skillRank,
                    color: color,
                    statusEffect: "stun"
                });

                currX = nextTarget.x;
                currY = nextTarget.y;
                currDmg = Math.max(4, Math.round(currDmg * 0.80));
            }
        }

        spawnAoEEffect(cfg) {
            const effect = {
                owner: cfg.owner || "player",
                name: cfg.name || "Sát Chiêu",
                skillRank: cfg.skillRank || 1,
                x: cfg.x,
                y: cfg.y,
                radius: cfg.radius || 80,
                damage: cfg.damage || 25,
                color: cfg.color || "#ff5733",
                duration: cfg.duration || 0.45,
                maxDuration: cfg.duration || 0.45,
                lifesteal: cfg.lifesteal || 0,
                slowEffect: cfg.slowEffect || 0,
                statusEffect: cfg.statusEffect || null,
                knockbackForce: cfg.knockbackForce || 0
            };

            this.aoeEffects.push(effect);
            this._spawnParticleBurst(cfg.x, cfg.y, effect.color, 20);

            if (effect.owner === "player" && this.enemies) {
                const targets = this.enemies.getHostileTargetsInRadius(effect.x, effect.y, effect.radius);
                for (const target of targets) {
                    this._applyPlayerDamageToTarget(target, effect.damage, effect);
                    if (effect.knockbackForce > 0) {
                        this._knockbackTarget(target, effect.x, effect.y, effect.knockbackForce);
                    }
                }
            } else if (effect.owner !== "player" && this.player) {
                const d = Math.hypot(this.player.x - effect.x, this.player.y - effect.y);
                if (d <= effect.radius + this.player.radius) {
                    const res = this.player.takeDamage(effect.damage, effect.name);
                    if (!res.dodged) {
                        this.spawnFloatingText(this.player.x, this.player.y - 18, `-${res.damageTaken}`, "#ff4d4d");
                    }
                }
            }
        }

        // =====================================================================
        // 6. ÁP DỤNG SÁT THƯƠNG (CÓ KIỂM TRA ÁP CHẾ CHUYỂN SỐ & TÔN GIẢ HỘ THỂ)
        // =====================================================================

        _applyPlayerDamageToTarget(target, rawDamage, sourceEffect = {}) {
            if (!target || target.isDead) return;

            this._registerComboHit();

            let bonusMult = 1.0;
            if (target.poisonTimer && target.poisonTimer > 0) bonusMult += 0.25;
            if (target.freezeTimer && target.freezeTimer > 0) bonusMult += 0.20;

            const skillRank = sourceEffect.skillRank || (this.aperture ? this.aperture.rank : 1);
            const targetRank = target.rank || 1;
            const suppression = this._calculateRankSuppression(skillRank, targetRank, target);

            const adjustedDamage = Math.max(1, rawDamage * bonusMult * suppression.multiplier);
            const roll = this._rollCriticalAndComboDamage(adjustedDamage);
            const actualDmg = this.enemies
                ? this.enemies.damageEntity(target, roll.damage, this.player, this)
                : roll.damage;

            target.hitFlashTimer = 0.14;

            if (suppression.suppressed && target.isBoss && Math.random() < 0.35) {
                this.spawnFloatingText(target.x, target.y - 40, `🛡️ ${suppression.label}`, "#ff9f43");
            }

            if (roll.isCrit) {
                this.spawnFloatingText(target.x, target.y - 26, `⚡ BẠO KÍCH -${Math.round(actualDmg)}!`, "#ffd700");
                this.triggerScreenShake(3.5, 0.14);
            } else {
                this.spawnFloatingText(target.x, target.y - 20, `-${Math.round(actualDmg)}`, "#f7c948");
            }

            this._spawnParticleBurst(target.x, target.y, sourceEffect.color || "#e05252", roll.isCrit ? 12 : 6);

            if (sourceEffect.lifesteal && sourceEffect.lifesteal > 0 && this.player) {
                const healVal = Math.max(1, Math.round(actualDmg * sourceEffect.lifesteal));
                const healed = this.player.heal(healVal);
                if (healed > 0) {
                    this.spawnFloatingText(this.player.x, this.player.y - 24, `🩸 +${healed} Huyết`, "#e03e3e");
                }
            }

            if (sourceEffect.slowEffect && sourceEffect.slowEffect > 0) {
                target.slowTimer = Math.max(target.slowTimer || 0, 3.5);
                target.slowFactor = 1 - sourceEffect.slowEffect;
            }

            if (sourceEffect.statusEffect) {
                this._applyStatusEffect(target, sourceEffect.statusEffect, 4.0, Math.max(2, Math.round(actualDmg * 0.14)));
            }
        }

        _applyStatusEffect(target, statusType, duration = 4.0, dotDamage = 4) {
            if (!target || target.isDead) return;

            // Tôn Giả Cửu Chuyển kháng 80% thời gian khống chế cứng; Boss Bát Chuyển kháng 50%
            const ccResistance = (target.isVenerable || target.rank >= 9)
                ? 0.20
                : ((target.isBoss && target.rank >= 8) ? 0.50 : 1.0);

            switch (statusType) {
                case "burn":
                    target.burnTimer = duration;
                    target.burnDamage = dotDamage;
                    break;
                case "bleed":
                    target.bleedTimer = duration;
                    target.bleedStacks = Math.min(5, (target.bleedStacks || 0) + 1);
                    target.bleedDamage = dotDamage;
                    break;
                case "chill":
                    target.slowTimer = duration * ccResistance;
                    target.slowFactor = (target.isVenerable || target.rank >= 9) ? 0.80 : 0.45;
                    target.chillStacks = (target.chillStacks || 0) + 1;
                    if (target.chillStacks >= 3) {
                        target.chillStacks = 0;
                        target.freezeTimer = 2.0 * ccResistance;
                        this.spawnFloatingText(target.x, target.y - 28, "❄️ ĐÓNG BĂNG!", "#85c1e9");
                    }
                    break;
                case "stun":
                    target.stunTimer = Math.max(target.stunTimer || 0, 1.3 * ccResistance);
                    this.spawnFloatingText(target.x, target.y - 26, "💫 Choáng!", "#f7c948");
                    break;
                case "poison":
                    target.poisonTimer = duration;
                    target.poisonDamage = dotDamage;
                    break;
            }
        }

        _knockbackTarget(target, sourceX, sourceY, force = 80) {
            if (!target || target.isDead) return;
            const actualForce = (target.isVenerable || target.rank >= 9)
                ? force * 0.15
                : (target.isBoss ? force * 0.35 : force);
            const ang = Math.atan2(target.y - sourceY, target.x - sourceX);
            const nx = target.x + Math.cos(ang) * actualForce;
            const ny = target.y + Math.sin(ang) * actualForce;

            if (!this.map || this.map.isWalkable(nx, ny, target.radius)) {
                target.x = nx;
                target.y = ny;
            }
        }

        _pointToSegmentDistance(px, py, x1, y1, x2, y2) {
            const A = px - x1;
            const B = py - y1;
            const C = x2 - x1;
            const D = y2 - y1;
            const dot = A * C + B * D;
            const lenSq = C * C + D * D;
            let param = -1;
            if (lenSq !== 0) param = dot / lenSq;

            let xx, yy;
            if (param < 0) {
                xx = x1;
                yy = y1;
            } else if (param > 1) {
                xx = x2;
                yy = y2;
            } else {
                xx = x1 + param * C;
                yy = y1 + param * D;
            }
            return Math.hypot(px - xx, py - yy);
        }

        _spawnParticleBurst(x, y, color, count = 10) {
            for (let i = 0; i < count; i++) {
                const ang = Math.random() * Math.PI * 2;
                const spd = 35 + Math.random() * 120;
                this.particles.push({
                    x: x,
                    y: y,
                    vx: Math.cos(ang) * spd,
                    vy: Math.sin(ang) * spd,
                    size: 2.5 + Math.random() * 3.5,
                    color: color,
                    alpha: 1.0,
                    life: 0.25 + Math.random() * 0.35
                });
            }
        }

        spawnFloatingText(x, y, text, color = "#ffffff") {
            this.floatingTexts.push({
                x: x + (Math.random() - 0.5) * 18,
                y: y,
                text: text,
                color: color,
                vy: -42,
                alpha: 1.0,
                life: 1.0
            });
        }

        // =====================================================================
        // 7. VÒNG LẶP CẬP NHẬT TOÀN BỘ THỰC THỂ CHIẾN ĐẤU (UPDATE 60FPS)
        // =====================================================================

        update(dt) {
            for (const key of Object.keys(this.guCooldowns)) {
                this.guCooldowns[key] = Math.max(0, this.guCooldowns[key] - dt);
                if (this.guCooldowns[key] === 0) delete this.guCooldowns[key];
            }
            for (const key of Object.keys(this.killerCooldowns)) {
                this.killerCooldowns[key] = Math.max(0, this.killerCooldowns[key] - dt);
                if (this.killerCooldowns[key] === 0) delete this.killerCooldowns[key];
            }
            if (this.dashCooldown > 0) this.dashCooldown = Math.max(0, this.dashCooldown - dt);
            if (this.iframeTimer > 0) this.iframeTimer = Math.max(0, this.iframeTimer - dt);
            if (this.screenShakeTime > 0) this.screenShakeTime = Math.max(0, this.screenShakeTime - dt);

            if (this.comboTimer > 0) {
                this.comboTimer -= dt;
                if (this.comboTimer <= 0) this.comboCount = 0;
            }

            this._updateEnemyStatusEffects(dt);
            this._updateProjectiles(dt);
            this._updateBeastPhantoms(dt);
            this._updateOrbiters(dt);
            this._updateGroundZones(dt);
            this._updateFallingStrikes(dt);
            this._updateSummons(dt);

            for (let i = this.aoeEffects.length - 1; i >= 0; i--) {
                this.aoeEffects[i].duration -= dt;
                if (this.aoeEffects[i].duration <= 0) this.aoeEffects.splice(i, 1);
            }
            for (let i = this.beams.length - 1; i >= 0; i--) {
                this.beams[i].life -= dt;
                if (this.beams[i].life <= 0) this.beams.splice(i, 1);
            }
            for (let i = this.lightningArcs.length - 1; i >= 0; i--) {
                this.lightningArcs[i].life -= dt;
                if (this.lightningArcs[i].life <= 0) this.lightningArcs.splice(i, 1);
            }
            for (let i = this.afterimages.length - 1; i >= 0; i--) {
                this.afterimages[i].life -= dt;
                this.afterimages[i].alpha = Math.max(0, this.afterimages[i].life * 2);
                if (this.afterimages[i].life <= 0) this.afterimages.splice(i, 1);
            }
            for (let i = this.particles.length - 1; i >= 0; i--) {
                const pt = this.particles[i];
                pt.x += pt.vx * dt;
                pt.y += pt.vy * dt;
                pt.life -= dt;
                pt.alpha = Math.max(0, pt.life * 2.5);
                if (pt.life <= 0) this.particles.splice(i, 1);
            }
            for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
                const ft = this.floatingTexts[i];
                ft.y += ft.vy * dt;
                ft.life -= dt;
                ft.alpha = Math.max(0, ft.life);
                if (ft.life <= 0) this.floatingTexts.splice(i, 1);
            }
        }

        _updateEnemyStatusEffects(dt) {
            if (!this.enemies) return;
            const allEntities = [...(this.enemies.beasts || []), ...(this.enemies.npcs || [])];

            for (const ent of allEntities) {
                if (ent.isDead) continue;

                if (ent.hitFlashTimer > 0) ent.hitFlashTimer = Math.max(0, ent.hitFlashTimer - dt);

                if ((ent.stunTimer && ent.stunTimer > 0) || (ent.freezeTimer && ent.freezeTimer > 0)) {
                    if (ent.stunTimer > 0) ent.stunTimer = Math.max(0, ent.stunTimer - dt);
                    if (ent.freezeTimer > 0) ent.freezeTimer = Math.max(0, ent.freezeTimer - dt);
                    ent.slowTimer = 0.2;
                    ent.slowFactor = 0;
                    ent.attackCooldown = Math.max(ent.attackCooldown || 0, 0.4);
                }

                ent._dotTick = (ent._dotTick || 0) + dt;
                if (ent._dotTick >= 0.6) {
                    ent._dotTick = 0;

                    if (ent.burnTimer && ent.burnTimer > 0) {
                        ent.burnTimer = Math.max(0, ent.burnTimer - 0.6);
                        const dmg = ent.burnDamage || 4;
                        this.enemies.damageEntity(ent, dmg, this.player, this);
                        this.spawnFloatingText(ent.x, ent.y - 16, `🔥 -${dmg}`, "#ff5733");
                    }

                    if (ent.bleedTimer && ent.bleedTimer > 0) {
                        ent.bleedTimer = Math.max(0, ent.bleedTimer - 0.6);
                        const dmg = (ent.bleedDamage || 4) * (ent.bleedStacks || 1);
                        this.enemies.damageEntity(ent, dmg, this.player, this);
                        this.spawnFloatingText(ent.x, ent.y - 16, `🩸 -${dmg}`, "#e03e3e");
                    }

                    if (ent.poisonTimer && ent.poisonTimer > 0) {
                        ent.poisonTimer = Math.max(0, ent.poisonTimer - 0.6);
                        const dmg = ent.poisonDamage || 4;
                        this.enemies.damageEntity(ent, dmg, this.player, this);
                        this.spawnFloatingText(ent.x, ent.y - 16, `☠️ -${dmg}`, "#9b59b6");
                    }
                }
            }
        }

        _updateProjectiles(dt) {
            for (let i = this.projectiles.length - 1; i >= 0; i--) {
                const p = this.projectiles[i];

                p.trail.push({ x: p.x, y: p.y });
                if (p.trail.length > 6) p.trail.shift();

                if (p.spinning) {
                    p.spinAngle += dt * 18;
                }

                if (p.homing) {
                    if (p.owner === "player" && this.enemies) {
                        const near = this.enemies.getHostileTargetsInRadius(p.x, p.y, 280)
                            .filter(t => !p.hitTargets.has(t.id));
                        if (near.length > 0) {
                            near.sort((a, b) => Math.hypot(a.x - p.x, a.y - p.y) - Math.hypot(b.x - p.x, b.y - p.y));
                            const targetAngle = Math.atan2(near[0].y - p.y, near[0].x - p.x);
                            let diff = targetAngle - p.angle;
                            while (diff > Math.PI) diff -= Math.PI * 2;
                            while (diff < -Math.PI) diff += Math.PI * 2;
                            p.angle += Math.sign(diff) * Math.min(Math.abs(diff), dt * 6.5);
                            p.vx = Math.cos(p.angle) * p.speed;
                            p.vy = Math.sin(p.angle) * p.speed;
                        }
                    } else if (p.owner !== "player" && this.player && this.player.hp > 0) {
                        const targetAngle = Math.atan2(this.player.y - p.y, this.player.x - p.x);
                        let diff = targetAngle - p.angle;
                        while (diff > Math.PI) diff -= Math.PI * 2;
                        while (diff < -Math.PI) diff += Math.PI * 2;
                        p.angle += Math.sign(diff) * Math.min(Math.abs(diff), dt * 3.8);
                        p.vx = Math.cos(p.angle) * p.speed;
                        p.vy = Math.sin(p.angle) * p.speed;
                    }
                }

                p.x += p.vx * dt;
                p.y += p.vy * dt;

                const traveled = Math.hypot(p.x - p.startX, p.y - p.startY);
                const hitWall = this.map && !this.map.isWalkable(p.x, p.y, 4);

                if (traveled >= p.maxRange || hitWall) {
                    if (hitWall) this._spawnParticleBurst(p.x, p.y, p.color, 6);
                    this.projectiles.splice(i, 1);
                    continue;
                }

                if (p.owner === "player" && this.enemies) {
                    const hitTarget = this.enemies.findCollidingHostile(p.x, p.y, p.radius, p.hitTargets);
                    if (hitTarget) {
                        p.hitTargets.add(hitTarget.id);
                        this._applyPlayerDamageToTarget(hitTarget, p.damage, p);

                        if (p.ricochet > 0) {
                            p.ricochet -= 1;
                            const nextTargets = this.enemies.getHostileTargetsInRadius(p.x, p.y, 240)
                                .filter(t => !p.hitTargets.has(t.id));
                            if (nextTargets.length > 0) {
                                p.angle = Math.atan2(nextTargets[0].y - p.y, nextTargets[0].x - p.x);
                                p.vx = Math.cos(p.angle) * p.speed;
                                p.vy = Math.sin(p.angle) * p.speed;
                                p.startX = p.x;
                                p.startY = p.y;
                                continue;
                            }
                        }

                        p.pierce -= 1;
                        if (p.pierce <= 0) {
                            this.projectiles.splice(i, 1);
                        }
                    }
                } else if (p.owner !== "player" && this.player && this.player.hp > 0) {
                    const distToPlayer = Math.hypot(this.player.x - p.x, this.player.y - p.y);
                    if (distToPlayer <= this.player.radius + p.radius * 0.7) {
                        const dmgRes = this.player.takeDamage(p.damage, p.name);
                        if (!dmgRes.dodged) {
                            this.spawnFloatingText(this.player.x, this.player.y - 20, `-${dmgRes.damageTaken}`, "#ff4d4d");
                            this._spawnParticleBurst(this.player.x, this.player.y, p.color, 8);
                        }
                        this.projectiles.splice(i, 1);
                    }
                }
            }
        }

        _updateBeastPhantoms(dt) {
            for (let i = this.beastPhantoms.length - 1; i >= 0; i--) {
                const bp = this.beastPhantoms[i];
                bp.x += bp.vx * dt;
                bp.y += bp.vy * dt;

                if (this.enemies) {
                    const targets = this.enemies.getHostileTargetsInRadius(bp.x, bp.y, bp.radius);
                    for (const t of targets) {
                        if (bp.hitTargets.has(t.id)) continue;
                        bp.hitTargets.add(t.id);
                        this._applyPlayerDamageToTarget(t, bp.damage, {
                            skillRank: bp.skillRank || 1,
                            color: bp.color,
                            statusEffect: "stun"
                        });
                        this._knockbackTarget(t, bp.x - Math.cos(bp.angle) * 20, bp.y - Math.sin(bp.angle) * 20, bp.knockbackForce);
                    }
                }

                const dist = Math.hypot(bp.x - bp.startX, bp.y - bp.startY);
                if (dist >= bp.maxDistance) {
                    this._spawnParticleBurst(bp.x, bp.y, bp.color, 14);
                    this.beastPhantoms.splice(i, 1);
                }
            }
        }

        _updateOrbiters(dt) {
            if (!this.player) return;
            for (let i = this.orbiters.length - 1; i >= 0; i--) {
                const orb = this.orbiters[i];
                orb.duration -= dt;
                orb.angle += orb.speed * dt;
                if (orb.duration <= 0) {
                    this.orbiters.splice(i, 1);
                    continue;
                }

                const ox = this.player.x + Math.cos(orb.angle) * orb.radius;
                const oy = this.player.y + Math.sin(orb.angle) * orb.radius;

                for (const tid of Object.keys(orb.hitCooldowns)) {
                    orb.hitCooldowns[tid] -= dt;
                    if (orb.hitCooldowns[tid] <= 0) delete orb.hitCooldowns[tid];
                }

                if (this.enemies) {
                    const targets = this.enemies.getHostileTargetsInRadius(ox, oy, 24);
                    for (const t of targets) {
                        if (orb.hitCooldowns[t.id]) continue;
                        orb.hitCooldowns[t.id] = 0.45;
                        this._applyPlayerDamageToTarget(t, orb.damage, {
                            skillRank: orb.skillRank || 1,
                            color: orb.color,
                            statusEffect: "bleed"
                        });
                    }
                }
            }
        }

        _updateGroundZones(dt) {
            for (let i = this.groundZones.length - 1; i >= 0; i--) {
                const gz = this.groundZones[i];
                gz.duration -= dt;
                gz.tickTimer -= dt;

                if (gz.duration <= 0) {
                    this.groundZones.splice(i, 1);
                    continue;
                }

                if (gz.pullForce > 0 && this.enemies) {
                    const targets = this.enemies.getHostileTargetsInRadius(gz.x, gz.y, gz.radius * 1.3);
                    for (const t of targets) {
                        const d = Math.hypot(gz.x - t.x, gz.y - t.y);
                        if (d > 14) {
                            const ang = Math.atan2(gz.y - t.y, gz.x - t.x);
                            t.x += Math.cos(ang) * gz.pullForce * dt;
                            t.y += Math.sin(ang) * gz.pullForce * dt;
                        }
                    }
                }

                if (gz.tickTimer <= 0) {
                    gz.tickTimer = 0.55;
                    if (this.enemies) {
                        const targets = this.enemies.getHostileTargetsInRadius(gz.x, gz.y, gz.radius);
                        for (const t of targets) {
                            this._applyPlayerDamageToTarget(t, gz.damagePerTick, {
                                skillRank: gz.skillRank || 1,
                                color: gz.color,
                                statusEffect: gz.statusEffect
                            });
                        }
                    }
                }
            }
        }

        _updateFallingStrikes(dt) {
            for (let i = this.fallingStrikes.length - 1; i >= 0; i--) {
                const fs = this.fallingStrikes[i];
                fs.currentYOffset -= fs.fallSpeed * dt;
                if (fs.currentYOffset <= 0) {
                    this.spawnAoEEffect({
                        owner: "player",
                        name: "Thiên Phạt",
                        skillRank: fs.skillRank || 1,
                        x: fs.targetX,
                        y: fs.targetY,
                        radius: fs.radius,
                        damage: fs.damage,
                        color: fs.color,
                        duration: 0.3,
                        statusEffect: fs.statusEffect
                    });
                    this.fallingStrikes.splice(i, 1);
                }
            }
        }

        _updateSummons(dt) {
            for (let i = this.summons.length - 1; i >= 0; i--) {
                const sum = this.summons[i];
                sum.duration -= dt;
                if (sum.attackCooldown > 0) sum.attackCooldown -= dt;

                if (sum.duration <= 0 || sum.hp <= 0) {
                    this._spawnParticleBurst(sum.x, sum.y, sum.color, 10);
                    this.summons.splice(i, 1);
                    continue;
                }

                if (this.enemies) {
                    const near = this.enemies.getHostileTargetsInRadius(sum.x, sum.y, 450);
                    if (near.length > 0) {
                        near.sort((a, b) => Math.hypot(a.x - sum.x, a.y - sum.y) - Math.hypot(b.x - sum.x, b.y - sum.y));
                        const target = near[0];
                        const dist = Math.hypot(target.x - sum.x, target.y - sum.y);
                        if (dist > 28) {
                            const ang = Math.atan2(target.y - sum.y, target.x - sum.x);
                            sum.x += Math.cos(ang) * sum.spd * dt;
                            sum.y += Math.sin(ang) * sum.spd * dt;
                        } else if (sum.attackCooldown <= 0) {
                            sum.attackCooldown = 0.85;
                            this._applyPlayerDamageToTarget(target, sum.atk, {
                                skillRank: sum.skillRank || 1,
                                color: sum.color,
                                lifesteal: 0.15,
                                statusEffect: "bleed"
                            });
                        }
                    } else if (this.player) {
                        const dPlayer = Math.hypot(this.player.x - sum.x, this.player.y - sum.y);
                        if (dPlayer > 60) {
                            const ang = Math.atan2(this.player.y - sum.y, this.player.x - sum.x);
                            sum.x += Math.cos(ang) * sum.spd * 0.8 * dt;
                            sum.y += Math.sin(ang) * sum.spd * 0.8 * dt;
                        }
                    }
                }
            }
        }

        // =====================================================================
        // 8. DỰNG HÌNH ĐỒ HỌA CHIẾN ĐẤU TRÊN CANVAS 2D (RENDER)
        // =====================================================================

        render(ctx, camera) {
            if (!ctx) return;

            let shakeX = 0;
            let shakeY = 0;
            if (this.screenShakeTime > 0) {
                shakeX = (Math.random() - 0.5) * this.screenShakeMagnitude * 2;
                shakeY = (Math.random() - 0.5) * this.screenShakeMagnitude * 2;
            }

            const camX = (camera ? camera.x : 0) - shakeX;
            const camY = (camera ? camera.y : 0) - shakeY;
            const t = performance.now() * 0.005;

            for (const gz of this.groundZones) {
                const sx = gz.x - camX;
                const sy = gz.y - camY;
                ctx.save();
                ctx.globalAlpha = Math.min(0.42, gz.duration * 0.2);
                ctx.beginPath();
                ctx.arc(sx, sy, gz.radius, 0, Math.PI * 2);
                ctx.fillStyle = gz.color;
                ctx.fill();

                ctx.strokeStyle = "#ffffff";
                ctx.lineWidth = 1.5;
                ctx.setLineDash([6, 6]);
                ctx.stroke();
                ctx.restore();
            }

            for (const ai of this.afterimages) {
                const sx = ai.x - camX;
                const sy = ai.y - camY;
                ctx.save();
                ctx.globalAlpha = ai.alpha;
                ctx.fillStyle = ai.color;
                ctx.fillRect(sx - 8, sy - 14, 16, 26);
                ctx.restore();
            }

            for (const sum of this.summons) {
                const sx = sum.x - camX;
                const sy = sum.y - camY;
                ctx.save();
                ctx.translate(sx, sy);
                ctx.beginPath();
                ctx.arc(0, 0, 15, 0, Math.PI * 2);
                ctx.fillStyle = "rgba(20, 10, 10, 0.85)";
                ctx.fill();
                ctx.lineWidth = 2;
                ctx.strokeStyle = sum.color;
                ctx.stroke();

                ctx.font = "16px sans-serif";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText(sum.icon, 0, 0);
                ctx.restore();
            }

            this._renderEnemyStatusOverlays(ctx, camX, camY);

            for (const aoe of this.aoeEffects) {
                const sx = aoe.x - camX;
                const sy = aoe.y - camY;
                const progress = 1 - aoe.duration / aoe.maxDuration;
                const currentRadius = aoe.radius * (0.35 + progress * 0.65);

                ctx.save();
                ctx.globalAlpha = Math.max(0.12, aoe.duration / aoe.maxDuration);
                ctx.beginPath();
                ctx.arc(sx, sy, currentRadius, 0, Math.PI * 2);
                ctx.fillStyle = aoe.color;
                ctx.fill();

                ctx.lineWidth = 2.5;
                ctx.strokeStyle = "#ffffff";
                ctx.stroke();
                ctx.restore();
            }

            if (this.player) {
                for (const orb of this.orbiters) {
                    const ox = (this.player.x - camX) + Math.cos(orb.angle) * orb.radius;
                    const oy = (this.player.y - camY) + Math.sin(orb.angle) * orb.radius;

                    ctx.save();
                    ctx.translate(ox, oy);
                    ctx.rotate(orb.angle + Math.PI / 2);
                    ctx.fillStyle = orb.color;
                    ctx.beginPath();
                    ctx.moveTo(0, -12);
                    ctx.lineTo(7, 8);
                    ctx.lineTo(-7, 8);
                    ctx.closePath();
                    ctx.fill();
                    ctx.strokeStyle = "#ffffff";
                    ctx.lineWidth = 1;
                    ctx.stroke();
                    ctx.restore();
                }
            }

            for (const bp of this.beastPhantoms) {
                const sx = bp.x - camX;
                const sy = bp.y - camY;
                ctx.save();
                ctx.translate(sx, sy);

                ctx.beginPath();
                ctx.arc(0, 0, bp.radius, 0, Math.PI * 2);
                ctx.fillStyle = "rgba(224, 122, 69, 0.28)";
                ctx.fill();
                ctx.lineWidth = 2.5;
                ctx.strokeStyle = bp.color;
                ctx.stroke();

                ctx.font = "30px sans-serif";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText(bp.icon, 0, 0);
                ctx.restore();
            }

            for (const b of this.beams) {
                ctx.save();
                ctx.globalAlpha = Math.max(0.1, b.life / b.maxLife);
                ctx.strokeStyle = b.color;
                ctx.lineWidth = b.width * (b.life / b.maxLife);
                ctx.lineCap = "round";
                ctx.beginPath();
                ctx.moveTo(b.x1 - camX, b.y1 - camY);
                ctx.lineTo(b.x2 - camX, b.y2 - camY);
                ctx.stroke();

                ctx.strokeStyle = "#ffffff";
                ctx.lineWidth = Math.max(2, b.width * 0.35);
                ctx.stroke();
                ctx.restore();
            }

            for (const arc of this.lightningArcs) {
                ctx.save();
                ctx.strokeStyle = arc.color;
                ctx.lineWidth = 2.5;
                ctx.beginPath();
                const x1 = arc.x1 - camX;
                const y1 = arc.y1 - camY;
                const x2 = arc.x2 - camX;
                const y2 = arc.y2 - camY;
                ctx.moveTo(x1, y1);
                const midX = (x1 + x2) / 2 + (Math.random() - 0.5) * 24;
                const midY = (y1 + y2) / 2 + (Math.random() - 0.5) * 24;
                ctx.lineTo(midX, midY);
                ctx.lineTo(x2, y2);
                ctx.stroke();
                ctx.restore();
            }

            for (const fs of this.fallingStrikes) {
                const tx = fs.targetX - camX;
                const ty = fs.targetY - camY;

                ctx.save();
                ctx.strokeStyle = fs.color;
                ctx.globalAlpha = 0.45;
                ctx.beginPath();
                ctx.arc(tx, ty, fs.radius * 0.7, 0, Math.PI * 2);
                ctx.stroke();

                ctx.globalAlpha = 0.95;
                ctx.fillStyle = fs.color;
                ctx.beginPath();
                ctx.arc(tx, ty - fs.currentYOffset, 10, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }

            for (const p of this.projectiles) {
                const sx = p.x - camX;
                const sy = p.y - camY;

                if (p.trail.length > 1) {
                    ctx.save();
                    ctx.strokeStyle = p.color;
                    ctx.lineWidth = 4;
                    ctx.globalAlpha = 0.35;
                    ctx.beginPath();
                    ctx.moveTo(p.trail[0].x - camX, p.trail[0].y - camY);
                    for (let idx = 1; idx < p.trail.length; idx++) {
                        ctx.lineTo(p.trail[idx].x - camX, p.trail[idx].y - camY);
                    }
                    ctx.stroke();
                    ctx.restore();
                }

                ctx.save();
                ctx.translate(sx, sy);
                ctx.rotate(p.spinning ? p.spinAngle : p.angle);

                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(0, 0, p.radius * 0.78, -Math.PI * 0.45, Math.PI * 0.45, false);
                ctx.arc(-6, 0, p.radius * 0.60, Math.PI * 0.35, -Math.PI * 0.35, true);
                ctx.closePath();
                ctx.fill();

                ctx.strokeStyle = "#ffffff";
                ctx.lineWidth = 1.2;
                ctx.stroke();
                ctx.restore();
            }

            for (const pt of this.particles) {
                ctx.save();
                ctx.globalAlpha = pt.alpha;
                ctx.fillStyle = pt.color;
                ctx.fillRect(pt.x - camX, pt.y - camY, pt.size, pt.size);
                ctx.restore();
            }

            for (const ft of this.floatingTexts) {
                ctx.save();
                ctx.globalAlpha = ft.alpha;
                ctx.font = ft.text.includes("BẠO KÍCH") || ft.text.includes("【")
                    ? "bold 15px Georgia"
                    : "bold 13px Georgia";
                ctx.textAlign = "center";
                ctx.fillStyle = "#000000";
                ctx.fillText(ft.text, ft.x - camX + 1, ft.y - camY + 1);
                ctx.fillStyle = ft.color;
                ctx.fillText(ft.text, ft.x - camX, ft.y - camY);
                ctx.restore();
            }

            this._renderComboAndDashUI(ctx, t);
        }

        _renderEnemyStatusOverlays(ctx, camX, camY) {
            if (!this.enemies) return;
            const allEntities = [...(this.enemies.beasts || []), ...(this.enemies.npcs || [])];

            for (const ent of allEntities) {
                if (ent.isDead) continue;
                const sx = ent.x - camX;
                const sy = ent.y - camY;

                if (ent.hitFlashTimer && ent.hitFlashTimer > 0) {
                    ctx.save();
                    ctx.beginPath();
                    ctx.arc(sx, sy, ent.radius + 3, 0, Math.PI * 2);
                    ctx.fillStyle = "rgba(255, 255, 255, 0.55)";
                    ctx.fill();
                    ctx.restore();
                }

                if (ent.freezeTimer && ent.freezeTimer > 0) {
                    ctx.save();
                    ctx.fillStyle = "rgba(133, 193, 233, 0.55)";
                    ctx.strokeStyle = "#ffffff";
                    ctx.lineWidth = 1.5;
                    ctx.fillRect(sx - ent.radius - 2, sy - ent.radius - 2, (ent.radius + 2) * 2, (ent.radius + 2) * 2);
                    ctx.strokeRect(sx - ent.radius - 2, sy - ent.radius - 2, (ent.radius + 2) * 2, (ent.radius + 2) * 2);
                    ctx.restore();
                }

                const icons = [];
                if (ent.burnTimer > 0) icons.push("🔥");
                if (ent.bleedTimer > 0) icons.push(`🩸${ent.bleedStacks > 1 ? ent.bleedStacks : ""}`);
                if (ent.freezeTimer > 0) icons.push("🧊");
                else if (ent.slowTimer > 0) icons.push("❄️");
                if (ent.stunTimer > 0) icons.push("💫");
                if (ent.poisonTimer > 0) icons.push("☠️");

                if (icons.length > 0) {
                    ctx.save();
                    ctx.font = "12px sans-serif";
                    ctx.textAlign = "center";
                    ctx.fillText(icons.join(" "), sx, sy - ent.radius - 32);
                    ctx.restore();
                }
            }
        }

        _renderComboAndDashUI(ctx) {
            if (this.comboCount >= 2) {
                const bonusPct = Math.min(30, Math.round(this.comboCount * 1.0));
                ctx.save();
                ctx.fillStyle = "rgba(14, 18, 26, 0.88)";
                ctx.strokeStyle = "#e2bf75";
                ctx.lineWidth = 1.5;
                ctx.fillRect(16, 175, 195, 52);
                ctx.strokeRect(16, 175, 195, 52);

                ctx.fillStyle = "#ffd700";
                ctx.font = "bold 18px Georgia";
                ctx.textAlign = "left";
                ctx.fillText(`🔥 ${this.comboCount} LIÊN KÍCH!`, 26, 200);

                ctx.fillStyle = "#5cc995";
                ctx.font = "12px Georgia";
                ctx.fillText(`Khuếch đại cổ thuật: +${bonusPct}%`, 26, 218);
                ctx.restore();
            }

            ctx.save();
            ctx.fillStyle = "rgba(14, 18, 26, 0.85)";
            ctx.strokeStyle = this.dashCooldown <= 0 ? "#6ce6b8" : "#5e4f38";
            ctx.fillRect(16, 234, 195, 28);
            ctx.strokeRect(16, 234, 195, 28);

            ctx.fillStyle = this.dashCooldown <= 0 ? "#6ce6b8" : "#948d81";
            ctx.font = "12px Georgia";
            ctx.textAlign = "left";
            ctx.fillText(
                this.dashCooldown <= 0
                    ? "💨 [Space / Chuột Phải]: Lướt Sẵn Sàng"
                    : `💨 Hồi Thân Pháp: ${this.dashCooldown.toFixed(1)}s`,
                24,
                252
            );
            ctx.restore();
        }
    }

    global.CombatSystem = CombatSystem;

})(window);