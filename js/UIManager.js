/**
 * VẠN CỔ TIÊN ĐỒ - MODULE QUẢN LÝ GIAO DIỆN ĐẠI BẢN DOANH & CHIẾN ĐẤU VƯỢT ẢI (UIManager.js)
 * Cập nhật Đại Kho Tàng 62 Cổ Trùng & 25 Bản Đồ (1 -> 9 Chuyển):
 *  - Đưa toàn bộ 28 loại Cổ Trùng mới (Phàm Cổ 1–5, Linh Cổ 1–9, Tiên Cổ 6–9) vào Thương Đội,
 *    Phòng Đấu Giá, Bảo Hoàng Thiên và Gia Tộc Khố Phòng.
 *  - Hiển thị chuẩn định dạng <Cổ Trùng> <Số Chuyển> và nút "⬆️ Thăng Chuyển Cổ Trùng" tại Kho Cổ.
 *  - Hỗ trợ lọc Bản Đồ từ Nhất Chuyển (1) đến Cửu Chuyển Tôn Giả (9) và HUD Độc Chiến Song Tôn.
 */

(function (global) {
    "use strict";

    // =========================================================================
    // 1. DỮ LIỆU THƯƠNG HỘI, ĐẤU GIÁ, BẢO HOÀNG THIÊN, KHỐ PHÒNG & CHÂN TRUYỀN
    // =========================================================================

    const CARAVAN_SHOP_ITEMS = [
        { type: "item", id: "ration_meat", name: "Thịt Thú Rừng Tươi", icon: "🍖", price: 5, currency: "stones", desc: "Thức ăn nuôi & thăng Chuyển Hắc Thỉ Cổ, Bạch Thỉ Cổ, Ám Tiêu Cổ, Lang Yên Cổ và hồi 25 HP." },
        { type: "item", id: "spirit_herb", name: "Thanh Linh Thảo", icon: "🌿", price: 8, currency: "stones", desc: "Hồi 40 HP, 20 Tinh Thần. Phụ liệu nuôi & thăng Chuyển Xuân Quang Cổ, Thủy Tiễn Cổ, Thủy Tráo Cổ, Xoáy Nước Cổ." },
        { type: "item", id: "moon_orchid", name: "Nguyệt Lan Hoa", icon: "🌸", price: 12, currency: "stones", desc: "Phụ liệu nuôi & thăng Chuyển Nguyệt Quang Cổ, Hàn Sương Cổ, Tinh Quang Cổ, Băng Tinh Tuyết Hoa Cổ." },
        { type: "item", id: "bronze_ore", name: "Thanh Đồng Thạch Khoáng", icon: "🪨", price: 10, currency: "stones", desc: "Phụ liệu nuôi & thăng Chuyển Đồng Bì Cổ, Kim Châm Cổ, Thạch Bì Cổ, Hắc Thạch Cổ, Điện Nhãn Cổ." },
        { type: "item", id: "wind_essence_crystal", name: "Phong Tuyền Tinh Thạch", icon: "🎐", price: 26, currency: "stones", desc: "Cổ tài nuôi & thăng Chuyển Phong Nhận Cổ, Thanh Phong Luân Cổ." },
        { type: "item", id: "red_iron_ore", name: "Xích Thiết Tinh Khoáng", icon: "🧱", price: 28, currency: "stones", desc: "Phụ liệu thăng Chuyển Xích Diễm Cổ, Kiếm Ảnh Cổ, Lôi Khiếu Cổ, Bàn Sơn Lực Cổ, Thiên Địa Hồng Lô Cổ." },
        { type: "item", id: "beast_blood_core", name: "Bách Thú Tinh Huyết", icon: "🩸", price: 25, currency: "stones", desc: "Phụ liệu thăng Chuyển Huyết Nguyệt Cổ, Huyết Lô Cổ, Độc Hạt Cổ, Thú Lực Tinh Hồn Cổ." },
        { type: "item", id: "jade_bone", name: "Bạch Ngọc Cốt Tủy", icon: "🦴", price: 38, currency: "stones", desc: "Phụ liệu thăng Chuyển Lao Toàn Cốt Thương Cổ và Bạch Ngọc Cổ." },
        { type: "gu", id: "phong_nhan_gu", guRank: 1, name: "Phong Nhận Cổ Nhất Chuyển", icon: "🍃", price: 48, currency: "stones", desc: "Phàm cổ Phong Đạo (Giới hạn 1–5 Chuyển). Sát chiêu tạo lốc xoáy cuốn hút." },
        { type: "gu", id: "thiet_bi_gu", guRank: 1, name: "Đồng Bì Cổ Nhất Chuyển", icon: "🛡️", price: 48, currency: "stones", desc: "Phàm cổ phòng ngự Kim Đạo (Giới hạn 1–5 Chuyển) tạo hộ thuẫn hấp thụ sát thương." },
        { type: "gu", id: "kim_cham_gu", guRank: 1, name: "Kim Châm Cổ Nhất Chuyển", icon: "🪡", price: 50, currency: "stones", desc: "Phàm cổ Kim Đạo (1–5 Chuyển) phóng mưa kim châm tốc độ cao nảy liên hoàn." },
        { type: "gu", id: "thach_bi_gu", guRank: 1, name: "Thạch Bì Cổ Nhất Chuyển", icon: "🪨", price: 46, currency: "stones", desc: "Phàm cổ phòng ngự Thổ Đạo (1–5 Chuyển) hóa thạch làn da chống chịu đòn đánh." },
        { type: "gu", id: "thuy_tien_gu", guRank: 1, name: "Thủy Tiễn Cổ Nhất Chuyển", icon: "💧", price: 48, currency: "stones", desc: "Phàm cổ Thủy Đạo (1–5 Chuyển) bắn tên nước áp lực cao xuyên thấu." },
        { type: "gu", id: "am_tieu_gu", guRank: 1, name: "Ám Tiêu Cổ Nhất Chuyển", icon: "🗡️", price: 50, currency: "stones", desc: "Phàm cổ Ám Đạo (1–5 Chuyển) phóng phi tiêu bóng tối tốc độ cực nhanh." },
        { type: "gu", id: "lang_yen_gu", guRank: 1, name: "Lang Yên Cổ Nhất Chuyển", icon: "🐺", price: 54, currency: "stones", desc: "Phàm cổ Nô Đạo (1–5 Chuyển) vừa hồi phục sinh mệnh vừa triệu hồi Chiến Thú." },
        { type: "gu", id: "bach_thi_gu", guRank: 1, name: "Bạch Thỉ Cổ Nhất Chuyển", icon: "🐖", price: 58, currency: "stones", desc: "Phàm cổ Lực Đạo (1–5 Chuyển). Kết hợp với Hắc Thỉ Cổ để luyện Toàn Lực Dĩ Phó Cổ." },
        { type: "gu", id: "dien_nhan_gu", guRank: 1, name: "Điện Nhãn Cổ Nhất Chuyển", icon: "⚡", price: 56, currency: "stones", desc: "Phàm cổ Lôi Đạo (1–5 Chuyển). Phụ trợ Sát Chiêu phóng hồ quang điện liên hoàn." },
        { type: "gu", id: "hu_doc_gu", guRank: 1, name: "Hủ Độc Thảo Cổ Nhất Chuyển", icon: "☠️", price: 54, currency: "stones", desc: "Phàm cổ Độc Đạo (1–5 Chuyển) phát tán chướng khí ăn mòn và phá 25% giáp." },
        { type: "gu", id: "hoi_xuong_gu", guRank: 1, name: "Xuân Quang Cổ Nhất Chuyển", icon: "💚", price: 55, currency: "stones", desc: "Phàm cổ trị liệu Mộc Đạo (1–5 Chuyển) khôi phục Sinh Mệnh." },
        { type: "gu", id: "trinh_sat_gu", guRank: 1, name: "Địa Thính Nhục Nhĩ Thảo Nhất Chuyển", icon: "👁️", price: 45, currency: "stones", desc: "Phàm cổ Âm Đạo (1–5 Chuyển) giúp đạn Sát Chiêu tự động truy kích (Homing)." },
        { type: "gu", id: "hac_thach_gu", guRank: 2, name: "Hắc Thạch Cổ Nhị Chuyển", icon: "☄️", price: 135, currency: "stones", desc: "Phàm cổ Thổ Đạo (1–5 Chuyển) giáng cự thạch đập nát đội hình địch." },
        { type: "gu", id: "xoay_nuoc_gu", guRank: 2, name: "Xoáy Nước Cổ Nhị Chuyển", icon: "🌀", price: 140, currency: "stones", desc: "Phàm cổ Thủy Đạo (1–5 Chuyển) tạo xoáy nước cuốn hút và làm chậm quần địch." },
        { type: "gu", id: "loi_khieu_gu", guRank: 2, name: "Lôi Khiếu Cổ Nhị Chuyển", icon: "🌩️", price: 145, currency: "stones", desc: "Phàm cổ Âm Đạo (1–5 Chuyển) phát tiếng gầm sấm sét làm tê liệt xung quanh." },
        { type: "gu", id: "doc_hat_gu", guRank: 2, name: "Độc Hạt Cổ Nhị Chuyển", icon: "🦂", price: 138, currency: "stones", desc: "Phàm cổ Độc Đạo Tây Mạc (1–5 Chuyển) bắn nọc bọ cạp kịch độc." }
    ];

    const AUCTION_HOUSE_ITEMS = [
        { type: "item", id: "bronze_relic_gu", name: "Thanh Đồng Xá Lợi Cổ", icon: "🟢", price: 260, currency: "stones", desc: "Bảo vật Nhất Chuyển: Sử dụng giúp Khiếu Bích lập tức tăng 1 tiểu cảnh giới!" },
        { type: "item", id: "red_iron_relic_gu", name: "Xích Thiết Xá Lợi Cổ", icon: "🔴", price: 680, currency: "stones", desc: "Bảo vật Nhị Chuyển: Sử dụng giúp Khiếu Bích lập tức tăng 1 tiểu cảnh giới!" },
        { type: "item", id: "white_silver_relic_gu", name: "Bạch Ngân Xá Lợi Cổ", icon: "⚪", price: 1850, currency: "stones", desc: "Chí bảo Tam Chuyển: Sử dụng giúp Khiếu Bích lập tức tăng 1 tiểu cảnh giới!" },
        { type: "item", id: "yellow_gold_relic_gu", name: "Hoàng Kim Xá Lợi Cổ", icon: "🟡", price: 4600, currency: "stones", desc: "Chí bảo Tứ Chuyển: Sử dụng giúp Khiếu Bích lập tức tăng 1 tiểu cảnh giới!" },
        { type: "item", id: "purple_crystal_relic_gu", name: "Tử Tinh Xá Lợi Cổ", icon: "🟣", price: 11500, currency: "stones", desc: "Thần vật Ngũ Chuyển: Sử dụng giúp Khiếu Bích lập tức tăng 1 tiểu cảnh giới!" },
        { type: "item", id: "remnant_recipe", name: "Cổ Phương Tàn Quyển", icon: "📜", price: 95, currency: "stones", desc: "Giải mã tại Luyện Đạo Các để mở khóa Bí Phương Hợp Luyện cổ Nhị -> Cửu Chuyển." },
        { type: "item", id: "hundred_year_ginseng", name: "Bách Niên Khổ Sâm", icon: "🥕", price: 65, currency: "stones", desc: "Hồi 90 HP, 45 Tinh Thần & nguyên liệu nuôi dưỡng Thiên Nguyên Bảo Liên, Cẩm Lý Vận Cổ." },
        { type: "item", id: "soul_crystal", name: "Đãng Hồn Thạch Đan", icon: "🔮", price: 90, currency: "stones", desc: "Mảnh đá từ Đãng Hồn Sơn, hồi 85 Tinh Thần Lực để thăm dò Mộng Cảnh & Độ Kiếp." },
        { type: "gu", id: "tuu_trung_gu", guRank: 1, name: "Tửu Trùng Nhất Chuyển", icon: "🍶", price: 120, currency: "stones", desc: "Phàm cổ Luyện Đạo (1–5 Chuyển), giảm 25% tiêu hao khi lắp làm Cổ Phụ Trợ Sát Chiêu." },
        { type: "gu", id: "huyet_nguyet_gu", guRank: 1, name: "Huyết Nguyệt Cổ Nhất Chuyển", icon: "🩸", price: 95, currency: "stones", desc: "Linh cổ Huyết Đạo (Thăng được 1–9 Chuyển) gây chảy máu và hút 25% Sinh Mệnh." },
        { type: "gu", id: "am_anh_gu", guRank: 2, name: "U Ảnh Tiễn Cổ Nhị Chuyển", icon: "🌑", price: 195, currency: "stones", desc: "Phàm cổ Ám Đạo (1–5 Chuyển), bắn tên bóng tối xuyên thấu nhiều mục tiêu." },
        { type: "gu", id: "quy_dien_hoa_gu", guRank: 2, name: "Quỷ Diện Hoa Cổ Nhị Chuyển", icon: "🌺", price: 210, currency: "stones", desc: "Phàm cổ Hồn Đạo (1–5 Chuyển), tự động truy kích hồn phách và hút 20% máu." },
        { type: "gu", id: "kiem_anh_gu", guRank: 2, name: "Kiếm Ảnh Cổ Nhị Chuyển", icon: "🗡️", price: 240, currency: "stones", desc: "Linh cổ Kiếm Đạo (Thăng được 1–9 Chuyển), phóng kiếm ảnh cực nhanh nảy liên hoàn." },
        { type: "gu", id: "huyet_lo_gu", guRank: 3, name: "Huyết Lô Cổ Tam Chuyển", icon: "💀", price: 620, currency: "stones", desc: "Linh cổ Huyết Đạo (Thăng được 1–9 Chuyển), nổ huyết năng diện rộng và hút 30% máu." },
        { type: "gu", id: "thu_luc_tinh_hon_gu", guRank: 3, name: "Thú Lực Tinh Hồn Cổ Tam Chuyển", icon: "🦁", price: 590, currency: "stones", desc: "Linh cổ Nô Đạo (Thăng được 1–9 Chuyển), triệu hồi chiến hồn Bách Thú Vương vây công." },
        { type: "gu", id: "tinh_quang_gu", guRank: 3, name: "Tinh Quang Cổ Tam Chuyển", icon: "🌟", price: 575, currency: "stones", desc: "Linh cổ Quang Đạo (Thăng được 1–9 Chuyển), giáng mưa ánh sao từ chín tầng trời." },
        { type: "gu", id: "cam_ly_van_gu", guRank: 3, name: "Cẩm Lý Vận Cổ Tam Chuyển", icon: "🐟", price: 680, currency: "stones", desc: "Linh cổ Vận Đạo (Thăng được 1–9 Chuyển), gia tăng khí vận và giảm 25% tiêu hao Sát Chiêu." },
        { type: "gu", id: "hon_khieu_gu", guRank: 3, name: "Nhiếp Hồn Âm Cổ Tam Chuyển", icon: "👻", price: 580, currency: "stones", desc: "Linh cổ Hồn Đạo (Thăng được 1–9 Chuyển), phát sóng âm chấn Choáng diện rộng." },
        { type: "gu", id: "toan_cuc_luc_gu", guRank: 3, name: "Toàn Lực Dĩ Phó Cổ Tam Chuyển", icon: "🐯", price: 650, currency: "stones", desc: "Linh cổ Lực Đạo (Thăng được 1–9 Chuyển), triệu hồi Thú Ảnh Mãnh Hổ." }
    ];

    const TREASURE_YELLOW_HEAVEN_ITEMS = [
        { type: "exchange_immortal", id: "immortal_stone", name: "Đổi 1 Tiên Nguyên Thạch", icon: "🌟", price: 1500, currency: "stones", light: "Bảo Quang 3 Trượng", desc: "Dùng 1500 Nguyên Thạch phàm phẩm tụ hợp đổi 1 viên Tiên Nguyên Thạch." },
        { type: "item", id: "purple_crystal_relic_gu", name: "Tử Tinh Xá Lợi Cổ (Lô Hàng Tiên Nhân)", icon: "🟣", price: 6, currency: "immortal", light: "Bảo Quang 5 Trượng", desc: "Tăng thẳng 1 tiểu cảnh giới Ngũ Chuyển (Giá: 6 Tiên Nguyên Thạch)." },
        { type: "item", id: "soul_crystal", name: "Đãng Hồn Thạch Đan (x5)", icon: "🔮", count: 5, price: 1, currency: "immortal", light: "Bảo Quang 4 Trượng", desc: "5 viên Đãng Hồn Thạch từ Hồ Tiên Phúc Địa (Giá: 1 Tiên Nguyên Thạch)." },
        { type: "gu", id: "hoa_long_gu", guRank: 4, name: "Xích Viêm Hỏa Long Cổ Tứ Chuyển", icon: "🔥", price: 2, currency: "immortal", light: "Bảo Quang 6 Trượng", desc: "Linh cổ Viêm Đạo (Thăng được 1–9 Chuyển), giáng Hỏa Long và mưa thiên hỏa." },
        { type: "gu", id: "bang_tuyet_phong_gu", guRank: 4, name: "Băng Tinh Tuyết Hoa Cổ Tứ Chuyển", icon: "❄️", price: 2, currency: "immortal", light: "Bảo Quang 6 Trượng", desc: "Linh cổ Băng Đạo (Thăng được 1–9 Chuyển), đóng băng cứng quần địch." },
        { type: "gu", id: "van_kiem_quy_tong_gu", guRank: 4, name: "Khổ Lực Cổ Tứ Chuyển", icon: "🦣", price: 2, currency: "immortal", light: "Bảo Quang 7 Trượng", desc: "Linh cổ Lực Đạo (Thăng được 1–9 Chuyển), triệu hồi đàn Cự Tượng Hư Ảnh." },
        { type: "gu", id: "ban_son_luc_gu", guRank: 4, name: "Bàn Sơn Lực Cổ Tứ Chuyển", icon: "⛰️", price: 2, currency: "immortal", light: "Bảo Quang 7 Trượng", desc: "Linh cổ Thổ Đạo (Thăng được 1–9 Chuyển), dựng hộ thuẫn sơn nhạc bất hoại." },
        { type: "gu", id: "thien_thi_vuong_gu", guRank: 4, name: "Thiên Thi Vương Cổ Tứ Chuyển", icon: "🧟", price: 3, currency: "immortal", light: "Bảo Quang 8 Trượng", desc: "Linh cổ Hồn Đạo (Thăng được 1–9 Chuyển), hút 25% máu và triệu hồi Thi Vương." },
        { type: "gu", id: "thien_dia_hong_lo_gu", guRank: 4, name: "Thiên Địa Hồng Lô Cổ Tứ Chuyển", icon: "🏺", price: 3, currency: "immortal", light: "Bảo Quang 8 Trượng", desc: "Linh cổ Luyện Đạo (Thăng được 1–9 Chuyển), nung chảy đạo ngân địch trong biển lửa." },
        { type: "gu", id: "thai_co_long_luc_gu", guRank: 5, name: "Thái Cổ Giao Long Lực Cổ Ngũ Chuyển", icon: "🐉", price: 6, currency: "immortal", light: "Bảo Quang 10 Trượng", desc: "Linh cổ Lực Đạo (Thăng được 1–9 Chuyển), triệu hồi 3 Thái Cổ Giao Long." },
        { type: "gu", id: "huyet_hai_thao_thien_gu", guRank: 5, name: "Huyết Hà Đại Trận Cổ Ngũ Chuyển", icon: "🩸", price: 6, currency: "immortal", light: "Bảo Quang 10 Trượng", desc: "Linh cổ Huyết Đạo (Thăng được 1–9 Chuyển), hút 35% máu & gọi Huyết Thú." },
        { type: "gu", id: "sinh_co_moc_gu", guRank: 5, name: "Thiên Nguyên Bảo Liên Ngũ Chuyển", icon: "🪷", price: 7, currency: "immortal", light: "Bảo Quang 12 Trượng", desc: "Chí bảo Mộc Đạo của Nguyên Liên Tiên Tôn (Thăng được lên 9 Chuyển)." },
        { type: "gu", id: "dinh_tien_du_gu", guRank: 6, name: "Định Tiên Du Lục Chuyển", icon: "🦋", price: 18, currency: "immortal", light: "Bảo Quang 22 Trượng!", desc: "Tiên Cổ Không Gian Đạo (Chỉ có ở Tiên Cấp 6–9 Chuyển), dịch chuyển tức thời & xé rách hư không." },
        { type: "gu", id: "phi_kiem_tien_gu", guRank: 6, name: "Phi Kiếm Tiên Cổ Lục Chuyển", icon: "✨", price: 20, currency: "immortal", light: "Bảo Quang 25 Trượng!", desc: "Tiên Cổ Kiếm Đạo của Kiếm Tiên Bạc Thanh (Chỉ có ở Tiên Cấp 6–9 Chuyển)!" },
        { type: "gu", id: "cau_thi_van_tien_gu", guRank: 6, name: "Cẩu Thỉ Vận Tiên Cổ Lục Chuyển", icon: "🎲", price: 22, currency: "immortal", light: "Bảo Quang 24 Trượng!", desc: "Tiên Cổ Vận Đạo của Cự Dương Tiên Tôn (6–9 Chuyển), hộ vệ khí vận và giảm 25% tiêu hao!" },
        { type: "gu", id: "xuan_thu_thien_gu", guRank: 6, name: "Xuân Thu Thiền Lục Chuyển", icon: "🦗", price: 32, currency: "immortal", light: "Hồng Mông Bảo Quang!", desc: "Đệ Thất Kỳ Cổ Thời Gian Đạo của Hồng Liên Ma Tôn (Chỉ có ở Tiên Cấp 6–9 Chuyển)!" },
        { type: "gu", id: "hoanh_xung_tien_gu", guRank: 7, name: "Hoành Xung Trực Chạm Tiên Cổ Thất Chuyển", icon: "🦏", price: 42, currency: "immortal", light: "Vạn Trượng Tiên Quang!", desc: "Tiên Cổ Lực Đạo (6–9 Chuyển) húc tung mọi trận hình và làm Choáng diện rộng!" },
        { type: "gu", id: "dang_hon_tien_gu", guRank: 7, name: "Đãng Hồn Tiên Cổ Thất Chuyển", icon: "🔮", price: 45, currency: "immortal", light: "Vạn Trượng Tiên Quang!", desc: "Tiên Cổ Hồn Đạo tinh hoa Đãng Hồn Sơn (6–9 Chuyển), chấn nát hồn phách quần địch!" },
        { type: "gu", id: "lac_phach_tien_gu", guRank: 7, name: "Lạc Phách Tiên Cổ Thất Chuyển", icon: "🌪️", price: 45, currency: "immortal", light: "Vạn Trượng Tiên Quang!", desc: "Tiên Cổ Phong Đạo từ Lạc Phách Cốc (6–9 Chuyển), thổi Lạc Phách Phong cắt lìa hồn phách!" },
        { type: "gu", id: "nghich_luu_ho_than_gu", guRank: 7, name: "Nghịch Lưu Hộ Thân Ấn Cổ Thất Chuyển", icon: "🌊", price: 48, currency: "immortal", light: "Vạn Trượng Tiên Quang!", desc: "Tiên Cổ Thủy Đạo (6–9 Chuyển) khoác dòng sông Nghịch Lưu hộ thể và phản chấn sát thương!" },
        { type: "gu", id: "van_nga_tien_gu", guRank: 7, name: "Vạn Ngã Tiên Cổ Thất Chuyển", icon: "👥", price: 48, currency: "immortal", light: "Vạn Trượng Tiên Quang!", desc: "Tiên Cổ hợp nhất Nô - Lực của Phương Nguyên (Chỉ có ở Tiên Cấp 6–9 Chuyển)!" },
        { type: "gu", id: "thai_do_tien_gu", guRank: 8, name: "Thái Độ Tiên Cổ Bát Chuyển", icon: "🎭", price: 85, currency: "immortal", light: "Chí Tôn Tiên Quang!", desc: "Tiên Cổ truyền kỳ trong Nhân Tổ Truyện (6–9 Chuyển), lướt tàn ảnh cực nhanh và dẫn đường đạn!" },
        { type: "gu", id: "kiep_van_dan_tien_gu", guRank: 8, name: "Kiếp Vận Đàn Tiên Cổ Bát Chuyển", icon: "⛩️", price: 90, currency: "immortal", light: "Chí Tôn Tiên Quang!", desc: "Chí bảo Trường Sinh Thiên của Cự Dương Tiên Tôn (6–9 Chuyển), vừa công kích vừa tạo khiên!" },
        { type: "gu", id: "tri_tue_tien_gu", guRank: 8, name: "Trí Tuệ Cổ Bát Chuyển", icon: "🌟", price: 95, currency: "immortal", light: "Chí Tôn Tiên Quang!", desc: "Thập Đại Kỳ Cổ Trí Đạo (Tiên Cấp 6–9 Chuyển) giúp phá giải áp chế của Boss Bát - Cửu Chuyển!" },
        { type: "gu", id: "ai_tinh_tien_gu", guRank: 9, name: "Ái Tình Tiên Cổ Cửu Chuyển", icon: "💖", price: 160, currency: "immortal", light: "Cửu Chuyển Tiên Quang!", desc: "Kỳ Cổ Cửu Chuyển của Linh Duyên Trai: Vừa gây sát thương khủng khiếp vừa hút 30% máu & hồi phục!" },
        { type: "gu", id: "thien_co_tien_gu", guRank: 9, name: "Thiên Cơ Tiên Cổ Cửu Chuyển", icon: "☸️", price: 175, currency: "immortal", light: "Cửu Chuyển Tiên Quang!", desc: "Trọng bảo Cửu Chuyển nắm giữ bí mật Thiên Đạo, giáng Lôi Kiếp Hỗn Độn hủy diệt!" },
        { type: "gu", id: "chi_ton_tien_thai_gu", guRank: 9, name: "Chí Tôn Tiên Thai Cổ Cửu Chuyển", icon: "☯️", price: 220, currency: "immortal", light: "Vạn Cổ Đệ Nhất Kỳ Quang!", desc: "Đệ Nhất Chí Bảo của U Hồn Ma Tôn & Phương Nguyên! Đại hồi phục Sinh Mệnh và dung hợp vạn đạo!" }
    ];

    const CLAN_TREASURY_ITEMS = [
        { type: "item", id: "remnant_recipe", name: "Cổ Phương Tàn Quyển", icon: "📜", meritCost: 75, desc: "Bí tịch lưu trữ trong Gia Tộc Các, dùng giải mã Cổ Phương Hợp Luyện mới." },
        { type: "gu", id: "tuu_trung_gu", guRank: 1, name: "Tửu Trùng Nhất Chuyển", icon: "🍶", meritCost: 110, desc: "Phàm cổ tinh luyện chân nguyên và giảm tiêu hao Sát Chiêu." },
        { type: "item", id: "bronze_relic_gu", name: "Thanh Đồng Xá Lợi Cổ", icon: "🟢", meritCost: 160, desc: "Đổi bằng điểm Cống Hiến: Tăng thẳng 1 tiểu cảnh giới Nhất Chuyển." },
        { type: "gu", id: "kim_cham_gu", guRank: 2, name: "Kim Châm Cổ Nhị Chuyển", icon: "🪡", meritCost: 220, desc: "Phàm cổ Kim Đạo đã ôn dưỡng lên Nhị Chuyển, bắn chùm kim châm nảy liên hoàn." },
        { type: "item", id: "red_iron_relic_gu", name: "Xích Thiết Xá Lợi Cổ", icon: "🔴", meritCost: 420, desc: "Đổi bằng điểm Cống Hiến: Tăng thẳng 1 tiểu cảnh giới Nhị Chuyển." },
        { type: "gu", id: "nguyet_quang_gu", guRank: 3, name: "Nguyệt Quang Cổ Tam Chuyển", icon: "🌙", meritCost: 480, desc: "Nguyệt Quang Cổ đã được tộc lão ôn dưỡng lên Tam Chuyển." },
        { type: "gu", id: "kiem_anh_gu", guRank: 3, name: "Kiếm Ảnh Cổ Tam Chuyển", icon: "🗡️", meritCost: 520, desc: "Linh cổ Kiếm Đạo Tam Chuyển (Có thể thăng tiếp lên Cửu Chuyển)." },
        { type: "gu", id: "tinh_quang_gu", guRank: 3, name: "Tinh Quang Cổ Tam Chuyển", icon: "🌟", meritCost: 540, desc: "Linh cổ Quang Đạo Tam Chuyển (Có thể thăng tiếp lên Cửu Chuyển)." },
        { type: "item", id: "white_silver_relic_gu", name: "Bạch Ngân Xá Lợi Cổ", icon: "⚪", meritCost: 980, desc: "Đổi bằng điểm Cống Hiến: Tăng thẳng 1 tiểu cảnh giới Tam Chuyển." },
        { type: "gu", id: "ban_son_luc_gu", guRank: 4, name: "Bàn Sơn Lực Cổ Tứ Chuyển", icon: "⛰️", meritCost: 1350, desc: "Linh cổ Thổ Đạo Tứ Chuyển tạo giáp sơn nhạc kiên cố (Thăng được lên 9 Chuyển)." },
        { type: "item", id: "yellow_gold_relic_gu", name: "Hoàng Kim Xá Lợi Cổ", icon: "🟡", meritCost: 2200, desc: "Đổi bằng điểm Cống Hiến: Tăng thẳng 1 tiểu cảnh giới Tứ Chuyển." },
        { type: "item", id: "purple_crystal_relic_gu", name: "Tử Tinh Xá Lợi Cổ", icon: "🟣", meritCost: 4800, desc: "Đổi bằng điểm Cống Hiến: Tăng thẳng 1 tiểu cảnh giới Ngũ Chuyển." }
    ];

    const TRUE_INHERITANCES = [
        {
            id: "inh_hoa_tuu",
            name: "Hoa Tửu Hành Giả Chân Truyền",
            reqRank: 1,
            reqStageCleared: "stage_2",
            rewardGuId: "tuu_trung_gu",
            rewardGuRank: 1,
            rewardItemId: "remnant_recipe",
            rewardStones: 45,
            rewardDaoPath: "Luyện Đạo",
            rewardDaoMarks: 12,
            desc: "Di chỉ bí mật của Ma Đạo Tứ Chuyển Hoa Tửu Hành Giả. Yêu cầu: Vượt Ải 2 (Nhận Tửu Trùng Nhất Chuyển + 1 Tàn Phương)."
        },
        {
            id: "inh_huyet_ho",
            name: "Cổ Nguyệt Nhất Thế Huyết Hồ Truyền Thừa",
            reqRank: 1,
            reqStageCleared: "stage_3",
            rewardGuId: "huyet_lo_gu",
            rewardGuRank: 2,
            rewardItemId: "bronze_relic_gu",
            rewardStones: 65,
            rewardDaoPath: "Huyết Đạo",
            rewardDaoMarks: 16,
            desc: "Bí mật huyết trì sâu dưới lòng đất Cổ Nguyệt Sơn Trại. Yêu cầu: Vượt Ải 3 (Nhận Huyết Lô Cổ Nhị Chuyển + Thanh Đồng Xá Lợi Cổ)."
        },
        {
            id: "inh_bach_cot",
            name: "Hôi Cốt Tài Tuấn Chân Truyền",
            reqRank: 2,
            reqStageCleared: "stage_5",
            rewardGuId: "cot_thuong_gu",
            rewardGuRank: 2,
            rewardItemId: "remnant_recipe",
            rewardStones: 110,
            rewardDaoPath: "Kim Đạo",
            rewardDaoMarks: 22,
            desc: "Truyền thừa Cốt Đạo trong cung điện xương trắng trên Bạch Cốt Sơn. Yêu cầu: Đạt Nhị Chuyển & Vượt Ải 5."
        },
        {
            id: "inh_thuong_gia",
            name: "Chí Tôn Đấu Vũ Trường Thưởng Chi",
            reqRank: 3,
            reqStageCleared: "stage_7",
            rewardGuId: "toan_cuc_luc_gu",
            rewardGuRank: 3,
            rewardItemId: "white_silver_relic_gu",
            rewardStones: 220,
            rewardDaoPath: "Lực Đạo",
            rewardDaoMarks: 35,
            desc: "Phần thưởng bá chủ Đấu Vũ Trường Thương Gia Thành. Yêu cầu: Đạt Tam Chuyển & Vượt Ải 7 (Nhận Toàn Lực Dĩ Phó Cổ Tam Chuyển)."
        },
        {
            id: "inh_tam_vuong",
            name: "Tam Vương Sơn Phúc Địa Truyền Thừa",
            reqRank: 4,
            reqStageCleared: "stage_10",
            rewardGuId: "van_kiem_quy_tong_gu",
            rewardGuRank: 4,
            rewardItemId: "yellow_gold_relic_gu",
            rewardStones: 420,
            rewardDaoPath: "Lực Đạo",
            rewardDaoMarks: 55,
            desc: "Truyền thừa tại Tam Vương Sơn. Yêu cầu: Đạt Tứ Chuyển & Vượt Ải 10 (Nhận Khổ Lực Cổ Tứ Chuyển)."
        },
        {
            id: "inh_chan_duong",
            name: "Bát Thập Bát Giác Chân Dương Lâu Chân Truyền",
            reqRank: 5,
            reqStageCleared: "stage_15",
            rewardGuId: "cau_thi_van_tien_gu",
            rewardGuRank: 6,
            rewardItemId: "purple_crystal_relic_gu",
            rewardStones: 1100,
            rewardDaoPath: "Vận Đạo",
            rewardDaoMarks: 110,
            desc: "Đạo chân truyền Vô Thượng trong Vương Đình Phúc Địa của Cự Dương Tiên Tôn. Yêu cầu: Đạt Ngũ Chuyển & Vượt Ải 15 (Nhận Cẩu Thỉ Vận Tiên Cổ Lục Chuyển)."
        },
        {
            id: "inh_ho_tien",
            name: "Hồ Tiên Phúc Địa — Đãng Hồn Sơn Chân Truyền",
            reqRank: 6,
            reqStageCleared: "stage_16",
            rewardGuId: "dang_hon_tien_gu",
            rewardGuRank: 7,
            rewardItemId: "soul_crystal",
            rewardStones: 1500,
            rewardDaoPath: "Hồn Đạo",
            rewardDaoMarks: 140,
            desc: "Chân truyền Hồ Tiên cùng bí cảnh Đãng Hồn Sơn. Yêu cầu: Đạt Lục Chuyển Cổ Tiên & Vượt Ải 16 (Nhận Đãng Hồn Tiên Cổ Thất Chuyển)."
        },
        {
            id: "inh_nghia_thien",
            name: "Nghĩa Thiên Sơn — U Hồn Chân Truyền",
            reqRank: 7,
            reqStageCleared: "stage_19",
            rewardGuId: "chi_ton_tien_thai_gu",
            rewardGuRank: 8,
            rewardItemId: "immortal_stone",
            rewardStones: 2600,
            rewardDaoPath: "Hồn Đạo",
            rewardDaoMarks: 220,
            desc: "Thành quả nghịch thiên từ Đại Chiến Nghĩa Thiên Sơn. Yêu cầu: Đạt Thất Chuyển Cổ Tiên & Vượt Ải 19 (Nhận Chí Tôn Tiên Thai Cổ Bát Chuyển)."
        },
        {
            id: "inh_hong_lien",
            name: "Hồng Liên Ma Tôn Thạch Liên Đảo Chân Truyền",
            reqRank: 8,
            reqStageCleared: "stage_22",
            rewardGuId: "xuan_thu_thien_gu",
            rewardGuRank: 8,
            rewardItemId: "immortal_stone",
            rewardStones: 4500,
            rewardDaoPath: "Thời Gian Đạo",
            rewardDaoMarks: 350,
            desc: "Chân truyền tối cao nằm giữa dòng chảy Quang Âm Trường Hà. Yêu cầu: Đạt Bát Chuyển Cổ Tiên & Vượt Ải 22 (Nhận Xuân Thu Thiền Bát Chuyển)."
        },
        {
            id: "inh_vo_cuc_phong_ma",
            name: "Vô Cực Ma Tôn — Tầng Chín Phong Ma Quật Chân Truyền",
            reqRank: 9,
            reqStageCleared: "stage_25",
            rewardGuId: "thien_co_tien_gu",
            rewardGuRank: 9,
            rewardItemId: "immortal_stone",
            rewardStones: 9999,
            rewardDaoPath: "Luyện Đạo",
            rewardDaoMarks: 800,
            desc: "Đạo quả tối cao sau khi đánh bại Song Tôn tại Tầng Chín Phong Ma Quật! Yêu cầu: Đạt Cửu Chuyển Tôn Giả & Vượt Ải 25 (Nhận Thiên Cơ Tiên Cổ Cửu Chuyển)."
        }
    ];

    // =========================================================================
    // 2. LỚP QUẢN LÝ GIAO DIỆN (CLASS UIMANAGER)
    // =========================================================================

    class UIManager {
        constructor() {
            this.game = null;
            this.aperture = null;
            this.player = null;
            this.map = null;
            this.guSystem = null;
            this.combat = null;
            this.enemies = null;

            this.activeHubTab = "tab-maps";
            this.currentMapRankFilter = "all";
            this.currentGuFilter = "all";
            this.currentMarketTab = "caravan";
            this.selectedGuInstanceId = null;
            this.selectedInventoryItemId = null;
            this.refinementSlots = [null, null, null];
            this.keybindMode = "hybrid";
            this.activeInteractingNpc = null;

            this.dom = {};
        }

        init(systems) {
            this.game = systems.game || null;
            this.aperture = systems.aperture || null;
            this.player = systems.player || null;
            this.map = systems.map || null;
            this.guSystem = systems.guSystem || null;
            this.combat = systems.combat || null;
            this.enemies = systems.enemies || null;

            this._cacheDomElements();
            this._bindCreationScreenEvents();
            this._bindHubNavigationEvents();
            this._bindHubFeatureEvents();
            this._bindBattleScreenEvents();
            this._bindFileImportExportEvents();
            this.updateKeybindLabels();
            this.renderCreationSkinPreview();
        }

        _cacheDomElements() {
            const $ = (id) => document.getElementById(id);

            this.dom = {
                saveFileInput: $("save-file-input"),

                creationScreen: $("character-creation-screen"),
                hubScreen: $("hub-screen"),
                battleScreen: $("battle-screen"),

                // Màn hình 1: Khởi tạo, Skin & Khai Khiếu
                stepForm: $("creation-step-form"),
                stepRitual: $("creation-step-ritual"),
                inputName: $("player-name"),
                selectRegion: $("region-select"),
                selectSkin: $("skin-select"),
                creationSkinCanvas: $("creationSkinPreviewCanvas"),
                skinDescText: $("skin-description-text"),
                selectOrigin: $("faction-origin-select"),
                originDescBox: $("origin-description-box"),
                btnImportFileStart: $("btn-import-file-start"),
                btnStartRitual: $("btn-start-ritual"),
                btnLoadExisting: $("btn-load-existing"),
                ritualCanvas: $("ritualCanvas"),
                ritualStepBadge: $("ritual-step-indicator"),
                ritualLog: $("ritual-narrative-log"),
                aptitudeResultBox: $("aptitude-result-box"),
                resAptitudeGrade: $("result-aptitude-grade"),
                resSeaCap: $("result-sea-capacity"),
                resRegenRate: $("result-regen-rate"),
                resInitialRealm: $("result-initial-realm"),
                resVitalGu: $("result-vital-gu"),
                btnNextRitual: $("btn-next-ritual-step"),
                btnEnterHub: $("btn-enter-hub"),

                // Màn hình 2: Thanh Header Đại Bản Doanh
                hubAvatar: $("hub-avatar-icon"),
                hubTopAvatarCanvas: $("hubTopAvatarCanvas"),
                hubName: $("hub-player-name"),
                hubRegionBadge: $("hub-region-badge"),
                hubFactionBadge: $("hub-faction-badge"),
                hubAptitudeBadge: $("hub-aptitude-badge"),
                hubRealmName: $("hub-realm-name"),
                hubWallType: $("hub-wall-type"),
                hubCultivateFill: $("hub-cultivate-fill"),
                hubCultivateText: $("hub-cultivate-text"),
                hubPressureText: $("hub-pressure-text"),
                hubEssenceTitle: $("hub-essence-title"),
                hubEssenceText: $("hub-essence-text"),
                hubEssenceCapMarker: $("hub-essence-cap-marker"),
                hubEssenceFill: $("hub-essence-fill"),
                hubHpText: $("hub-hp-text"),
                hubMentalText: $("hub-mental-text"),
                hubStonesCount: $("hub-stones-count"),
                hubMeritCount: $("hub-merit-count"),
                hubHumanQiCount: $("hub-human-qi-count"),
                hubImmortalStonesCount: $("hub-immortal-stones-count"),

                // Nhật ký bên phải Đại Bản Doanh
                worldLog: $("world-log-content"),
                btnClearLog: $("btn-clear-log"),

                // Tab 1: Bản Đồ Lịch Luyện
                mapRankFilter: $("map-rank-filter"),
                stageMapsGrid: $("stage-maps-grid"),

                // Tab 2: Không Khiếu, Đổi Skin & Đột Phá / Thăng Tiên / Độ Tai Kiếp
                apertureCanvas: $("apertureVisualCanvas"),
                apTypeText: $("ap-type-text"),
                apRealmText: $("ap-realm-text"),
                apWallText: $("ap-wall-text"),
                apEssenceName: $("ap-essence-name"),
                apVitalGuName: $("ap-vital-gu-name"),
                btnHubCultivate: $("btn-hub-cultivate"),
                btnHubAbsorbStone: $("btn-hub-absorb-stone"),
                btnHubUseRelic: $("btn-hub-use-relic"),
                btnHubBreakthrough: $("btn-hub-breakthrough"),
                btnHubAscend: $("btn-hub-ascend"),
                hubSkinCanvas: $("hubSkinPreviewCanvas"),
                hubSkinSelect: $("hub-skin-select"),
                hubSkinDesc: $("hub-skin-desc"),
                statHp: $("stat-hp"),
                statAtk: $("stat-atk"),
                statDef: $("stat-def"),
                statSpd: $("stat-spd"),
                statMental: $("stat-mental"),
                statAlignment: $("stat-alignment"),
                immortalApertureCanvas: $("immortalApertureCanvas"),
                btnCollectApertureYield: $("btn-collect-aperture-yield"),
                btnTriggerTribulation: $("btn-trigger-tribulation"),

                // Tab 3: Kho Cổ & Nuôi Dưỡng
                guFilterTabs: $("gu-filter-tabs"),
                hubEquippedGuBar: $("hub-equipped-gu-bar"),
                guStorageGrid: $("gu-storage-grid"),
                guDetailBox: $("gu-detail-box"),

                // Tab 4: Luyện Đạo Các
                refineSlot1: $("refine-slot-1"),
                refineSlot2: $("refine-slot-2"),
                refineSlot3: $("refine-slot-3"),
                refinePreview: $("refinement-recipe-preview"),
                btnExecuteRefine: $("btn-execute-refinement"),
                btnClearRefine: $("btn-clear-refinement"),
                btnStudyRemnant: $("btn-study-remnant-recipe"),
                knownRecipesList: $("known-recipes-list"),

                // Tab 5: Thiên Cơ Sát Chiêu
                killerCoreSelect: $("killer-core-select"),
                killerSub1Select: $("killer-sub1-select"),
                killerSub2Select: $("killer-sub2-select"),
                deduceName: $("deduce-name"),
                deduceType: $("deduce-type"),
                deduceCost: $("deduce-cost"),
                deduceDesc: $("deduce-desc"),
                btnDeduceKiller: $("btn-deduce-killer-move"),
                savedKillerList: $("saved-killer-moves-list"),

                // Tab 6: Đạo Ngân & Mộng Cảnh
                daoMarksList: $("dao-marks-list"),
                dreamRealmList: $("dream-realm-list"),

                // Tab 7: Hành Trang
                inventoryGrid: $("inventory-grid"),
                inventoryDetailBox: $("inventory-detail-box"),

                // Tab 8: Thương Hội & Bảo Hoàng Thiên
                marketSubtabs: $("market-subtabs"),
                marketContent: $("market-content-container"),

                // Tab 9: Thế Lực, Khố Phòng & Chân Truyền
                questList: $("quest-list-container"),
                clanTreasury: $("clan-treasury-container"),
                inheritanceList: $("inheritance-list-container"),

                // Tab 10: Cài đặt, Lưu Game & Xuất/Nhập File
                saveSlot1Info: $("save-slot-1-info"),
                saveSlot2Info: $("save-slot-2-info"),
                saveSlot3Info: $("save-slot-3-info"),
                btnExportSaveFile: $("btn-export-save-file"),
                btnImportSaveFile: $("btn-import-save-file"),
                btnResetSaves: $("btn-reset-all-saves"),
                keybindSelect: $("keybind-mode-select"),

                // Màn hình 3: Chiến đấu Vượt Ải 2D
                battlePlayerName: $("battle-player-name"),
                battleRealmBadge: $("battle-realm-badge"),
                battleHpText: $("battle-hp-text"),
                battleHpFill: $("battle-hp-fill"),
                battleEssenceName: $("battle-essence-name"),
                battleEssenceText: $("battle-essence-text"),
                battleEssenceCapMarker: $("battle-essence-cap-marker"),
                battleEssenceFill: $("battle-essence-fill"),
                battleActiveBuffs: $("battle-active-buffs"),
                battleStageTitle: $("battle-stage-title"),
                battleStageObjective: $("battle-stage-objective"),
                battleStageProgressFill: $("battle-stage-progress-fill"),
                btnRetreatToHub: $("btn-retreat-to-hub"),
                interactionPrompt: $("interaction-prompt"),
                guQuickbar: $("gu-quickbar"),
                killerQuickbar: $("killer-quickbar"),
                btnBattleUseStone: $("btn-battle-use-stone"),
                btnBattleUseHerb: $("btn-battle-use-herb"),

                // Modal Chiến Thắng Qua Ải
                stageVictoryModal: $("stage-victory-modal"),
                stageResultTitle: $("stage-result-title"),
                stageRewardSummary: $("stage-reward-summary"),
                btnReplayStage: $("btn-replay-stage"),
                btnVictoryReturnHub: $("btn-victory-return-hub"),

                // Modal Tương Tác NPC Cổ Sư trong Ải
                npcInteractionModal: $("npc-interaction-modal"),
                npcModalTitle: $("npc-modal-title"),
                npcModalBody: $("npc-modal-body")
            };
        }

        // =====================================================================
        // 3. MÀN HÌNH 1: KHỞI TẠO NHÂN VẬT, CHỌN SKIN & KHAI KHIẾU 7 BƯỚC
        // =====================================================================

        _bindCreationScreenEvents() {
            const d = this.dom;

            const updateOriginPreview = () => {
                const origin = d.selectOrigin ? d.selectOrigin.value : "righteous_clan";
                const region = d.selectRegion ? d.selectRegion.value : "nam_cuong";
                const desc = global.PlayerManager.getOriginDescription(origin, region);
                if (d.originDescBox) {
                    d.originDescBox.innerHTML = `<p><strong>Bối cảnh khởi đầu:</strong> ${desc}</p>`;
                }
            };

            if (d.selectOrigin) d.selectOrigin.addEventListener("change", updateOriginPreview);
            if (d.selectRegion) d.selectRegion.addEventListener("change", updateOriginPreview);

            if (d.selectSkin) {
                d.selectSkin.addEventListener("change", () => {
                    this.renderCreationSkinPreview();
                    const skinInfo = global.PlayerManager.getSkinInfo(d.selectSkin.value);
                    const allSkinNames = Object.values(global.PlayerManager.CHARACTER_SKINS).map(s => s.name);
                    if (d.inputName && (!d.inputName.value.trim() || allSkinNames.includes(d.inputName.value.trim()))) {
                        d.inputName.value = skinInfo.name;
                    }
                });
            }

            if (d.btnStartRitual) {
                d.btnStartRitual.addEventListener("click", () => {
                    const origin = d.selectOrigin ? d.selectOrigin.value : "righteous_clan";
                    const stepData = this.aperture.startAwakeningRitual(origin);

                    d.stepForm.classList.add("hidden");
                    d.stepRitual.classList.remove("hidden");
                    d.aptitudeResultBox.classList.add("hidden");
                    d.btnNextRitual.classList.remove("hidden");
                    d.btnEnterHub.classList.add("hidden");

                    d.ritualLog.innerHTML = "";
                    this._renderRitualStepInfo(stepData);
                });
            }

            if (d.btnLoadExisting) {
                d.btnLoadExisting.addEventListener("click", () => {
                    if (this.game && typeof this.game.loadAnyExistingSave === "function") {
                        const ok = this.game.loadAnyExistingSave();
                        if (!ok) {
                            alert("Chưa có dữ liệu lưu trữ trên trình duyệt! Bạn có thể dùng nút 'Nhập File Lưu (.json)' hoặc tiến hành Khai Khiếu.");
                        }
                    }
                });
            }

            if (d.btnNextRitual) {
                d.btnNextRitual.addEventListener("click", () => {
                    const stepData = this.aperture.advanceRitualStep();
                    this._renderRitualStepInfo(stepData);
                });
            }

            if (d.btnEnterHub) {
                d.btnEnterHub.addEventListener("click", () => {
                    const name = d.inputName ? d.inputName.value : "Cổ Nguyệt Phương Nguyên";
                    const origin = d.selectOrigin ? d.selectOrigin.value : "righteous_clan";
                    const region = d.selectRegion ? d.selectRegion.value : "nam_cuong";
                    const skinKey = d.selectSkin ? d.selectSkin.value : "phuong_nguyen";

                    if (this.game && typeof this.game.startNewGameFromRitual === "function") {
                        this.game.startNewGameFromRitual(name, origin, region, skinKey);
                    }
                    this.showScreen("hub");
                });
            }
        }

        renderCreationSkinPreview() {
            const d = this.dom;
            if (!d.selectSkin || !global.PlayerManager) return;
            const skinKey = d.selectSkin.value;
            const skinInfo = global.PlayerManager.getSkinInfo(skinKey);

            if (d.skinDescText && skinInfo) {
                d.skinDescText.textContent = `[${skinInfo.title}] ${skinInfo.desc}`;
            }
            if (d.creationSkinCanvas) {
                global.PlayerManager.renderSkinPreview(d.creationSkinCanvas.getContext("2d"), skinKey);
            }
        }

        _renderRitualStepInfo(stepData) {
            const d = this.dom;
            if (!stepData) return;

            d.ritualStepBadge.textContent = stepData.title;
            const p = document.createElement("p");
            p.innerHTML = `<strong>[Bước ${stepData.step}]</strong> ${stepData.text}`;
            d.ritualLog.appendChild(p);
            d.ritualLog.scrollTop = d.ritualLog.scrollHeight;

            if (stepData.step >= 6 && stepData.aptitudeResult) {
                const apt = stepData.aptitudeResult;
                const vital = stepData.vitalGuResult;
                d.aptitudeResultBox.classList.remove("hidden");
                d.resAptitudeGrade.textContent = apt.gradeName;
                d.resSeaCap.textContent = `${apt.maxSeaPercent}% Biển Nguyên`;
                d.resRegenRate.textContent = `+${apt.baseRegen}% / giây`;
                d.resInitialRealm.textContent = "Nhất Chuyển Sơ Giai (Thanh Đồng Chân Nguyên)";
                d.resVitalGu.textContent = vital ? vital.name : "Nguyệt Quang Cổ Nhất Chuyển";
            }

            if (stepData.isFinished) {
                d.btnNextRitual.classList.add("hidden");
                d.btnEnterHub.classList.remove("hidden");
            }
        }

        // =====================================================================
        // 4. SỰ KIỆN XUẤT / NHẬP FILE LƯU (.JSON)
        // =====================================================================

        _bindFileImportExportEvents() {
            const d = this.dom;

            if (d.btnExportSaveFile) {
                d.btnExportSaveFile.addEventListener("click", () => {
                    if (this.game && typeof this.game.exportSaveToFile === "function") {
                        this.game.exportSaveToFile();
                    }
                });
            }

            const triggerFileDialog = () => {
                if (d.saveFileInput) {
                    d.saveFileInput.value = "";
                    d.saveFileInput.click();
                }
            };

            if (d.btnImportFileStart) {
                d.btnImportFileStart.addEventListener("click", triggerFileDialog);
            }
            if (d.btnImportSaveFile) {
                d.btnImportSaveFile.addEventListener("click", triggerFileDialog);
            }

            if (d.saveFileInput) {
                d.saveFileInput.addEventListener("change", (e) => {
                    const file = e.target.files && e.target.files[0];
                    if (file && this.game && typeof this.game.importSaveFromFile === "function") {
                        this.game.importSaveFromFile(file);
                    }
                });
            }
        }

        // =====================================================================
        // 5. CHUYỂN ĐỔI GIỮA 3 MÀN HÌNH & 10 TAB ĐẠI BẢN DOANH
        // =====================================================================

        showScreen(screenName) {
            const d = this.dom;
            d.creationScreen.classList.toggle("active", screenName === "creation");
            d.hubScreen.classList.toggle("active", screenName === "hub");
            d.battleScreen.classList.toggle("active", screenName === "battle");

            if (screenName !== "battle") {
                this.closeNpcInteractionModal();
            }

            if (screenName === "hub") {
                this.updateHUD();
                this.renderActiveHubTab();
            } else if (screenName === "battle") {
                this.updateBattleHUD();
            }
        }

        switchToGameScreen() {
            this.showScreen("hub");
        }

        _bindHubNavigationEvents() {
            const navBtns = document.querySelectorAll(".hub-sidebar .nav-btn[data-tab]");
            navBtns.forEach(btn => {
                btn.addEventListener("click", () => {
                    const tabId = btn.getAttribute("data-tab");
                    this.switchHubTab(tabId);
                });
            });

            if (this.dom.hubAvatar) {
                this.dom.hubAvatar.addEventListener("click", () => {
                    this.switchHubTab("tab-aperture");
                });
            }

            if (this.dom.btnClearLog) {
                this.dom.btnClearLog.addEventListener("click", () => {
                    this.dom.worldLog.innerHTML = "";
                    this.addLog("Đã làm sạch Thiên Cơ Nhật Ký.", "system");
                });
            }
        }

        switchHubTab(tabId) {
            this.activeHubTab = tabId;

            document.querySelectorAll(".hub-sidebar .nav-btn").forEach(btn => {
                btn.classList.toggle("active", btn.getAttribute("data-tab") === tabId);
            });

            document.querySelectorAll(".hub-tab-panel").forEach(panel => {
                const isTarget = panel.id === tabId;
                panel.classList.toggle("active", isTarget);
                panel.classList.toggle("hidden", !isTarget);
            });

            const contentArea = document.querySelector(".hub-content-area");
            if (contentArea) contentArea.scrollTop = 0;

            this.renderActiveHubTab();
        }

        renderActiveHubTab() {
            this.updateHubTopbar();
            switch (this.activeHubTab) {
                case "tab-maps":
                    this.renderMapsTab();
                    break;
                case "tab-aperture":
                    this.renderApertureTab();
                    break;
                case "tab-gu-storage":
                    this.renderGuStorageTab();
                    break;
                case "tab-refinement":
                    this.renderRefinementTab();
                    break;
                case "tab-killer-moves":
                    this.renderKillerMovesTab();
                    break;
                case "tab-dao-attainment":
                    this.renderDaoAttainmentTab();
                    break;
                case "tab-inventory":
                    this.renderInventoryTab();
                    break;
                case "tab-market":
                    this.renderMarketTab();
                    break;
                case "tab-faction":
                    this.renderFactionTab();
                    break;
                case "tab-settings":
                    this.renderSettingsTab();
                    break;
            }
        }

        // =====================================================================
        // 6. CẬP NHẬT TOPBAR ĐẠI BẢN DOANH & NHẬT KÝ
        // =====================================================================

        addLog(message, category = "system") {
            if (!this.dom.worldLog) return;
            const entry = document.createElement("div");
            entry.className = `log-entry ${category}`;
            entry.textContent = message;

            this.dom.worldLog.appendChild(entry);
            while (this.dom.worldLog.children.length > 70) {
                this.dom.worldLog.removeChild(this.dom.worldLog.firstChild);
            }
            this.dom.worldLog.scrollTop = this.dom.worldLog.scrollHeight;
        }

        updateHUD() {
            this.updateHubTopbar();
            if (this.game && this.game.currentScreen === "battle") {
                this.updateBattleHUD();
            }
        }

        updateHubTopbar() {
            if (!this.player || !this.aperture) return;
            const d = this.dom;
            const pl = this.player;
            const ap = this.aperture;

            if (d.hubTopAvatarCanvas && global.PlayerManager) {
                global.PlayerManager.renderSkinPreview(d.hubTopAvatarCanvas.getContext("2d"), pl.skinId);
            }

            d.hubName.textContent = pl.name;
            d.hubRegionBadge.textContent = pl.getRegionName ? pl.getRegionName() : "Nam Cương";
            d.hubFactionBadge.textContent = pl.getFactionOriginName ? pl.getFactionOriginName() : "Chính Đạo Gia Tộc";
            d.hubAptitudeBadge.textContent = `${ap.aptitude.gradeName} (${ap.aptitude.maxSeaPercent}%)`;

            d.hubRealmName.textContent = ap.getRealmDisplayName();
            d.hubWallType.textContent = ap.isImmortal
                ? `${ap.immortalAperture.gradeName}`
                : `Khiếu bích: ${ap.getApertureWallName()}`;

            if (!ap.isImmortal) {
                const wallPct = Math.min(100, (ap.wallProgress / Math.max(1, ap.maxWallProgress)) * 100);
                d.hubCultivateFill.style.width = `${wallPct}%`;
                d.hubCultivateText.textContent = `${Math.floor(ap.wallProgress)} / ${ap.maxWallProgress}`;
                d.hubPressureText.textContent = `${Math.round(ap.wallPressure)}%`;

                const curEss = Number(ap.currentEssence.toFixed(1));
                const maxCap = ap.aptitude.maxSeaPercent;
                d.hubEssenceTitle.textContent = ap.getEssenceQualityName();
                d.hubEssenceText.textContent = `${curEss}% / ${maxCap}%`;
                d.hubEssenceCapMarker.style.left = `${maxCap}%`;
                d.hubEssenceCapMarker.classList.remove("hidden");
                d.hubEssenceFill.className = `progress-fill ${ap.getEssenceCssClass()}`;
                d.hubEssenceFill.style.width = `${curEss}%`;
            } else {
                const passed = ap.immortalAperture.subStageTribulationsPassed || 0;
                const req = ap.immortalAperture.subStageTribulationsRequired ||
                    (ap.getManualTribulationRequirements ? ap.getManualTribulationRequirements().tribulationsNeededForNextStage : 2);
                const tribPct = Math.min(100, (passed / Math.max(1, req)) * 100);

                d.hubCultivateFill.style.width = `${tribPct}%`;
                d.hubCultivateText.textContent = `${passed} / ${req} Tai Kiếp (Tổng: ${ap.immortalAperture.heavenlyTribulationsPassed})`;
                d.hubPressureText.textContent = `Kiếp tự nhiên: ${Math.ceil(ap.immortalAperture.calamityCountdownDays)} ngày`;

                d.hubEssenceTitle.textContent = ap.getEssenceQualityName();
                d.hubEssenceText.textContent = `${(ap.immortalEssence[ap.rank] || 0).toFixed(1)} viên`;
                d.hubEssenceCapMarker.classList.add("hidden");
                d.hubEssenceFill.className = `progress-fill ${ap.getEssenceCssClass()}`;
                d.hubEssenceFill.style.width = "100%";
            }

            d.hubHpText.textContent = `${Math.ceil(pl.hp)}/${pl.maxHp}`;
            d.hubMentalText.textContent = `${Math.floor(pl.mental)}/${pl.maxMental}`;

            d.hubStonesCount.textContent = pl.primevalStones;
            d.hubMeritCount.textContent = pl.meritPoints || 0;
            d.hubHumanQiCount.textContent = Math.floor(ap.humanQi);
            d.hubImmortalStonesCount.textContent = pl.immortalStones || 0;
        }

        // =====================================================================
        // 7. SỰ KIỆN & RENDER CHI TIẾT CHO 10 PHÂN KHU ĐẠI BẢN DOANH
        // =====================================================================

        _bindHubFeatureEvents() {
            const d = this.dom;

            // --- TAB 1: Bộ lọc Cảnh Giới Bản Đồ (1 -> 9 Chuyển) ---
            if (d.mapRankFilter) {
                const btns = d.mapRankFilter.querySelectorAll(".tab-btn");
                btns.forEach(btn => {
                    btn.addEventListener("click", () => {
                        btns.forEach(b => b.classList.remove("active"));
                        btn.classList.add("active");
                        this.currentMapRankFilter = btn.getAttribute("data-mfilter") || "all";
                        this.renderMapsTab();
                    });
                });
            }

            // --- TAB 2: Đổi Skin, Không Khiếu, Xá Lợi Cổ, Đột Phá, Thăng Tiên & Độ Tai Kiếp ---
            if (d.hubSkinSelect) {
                d.hubSkinSelect.addEventListener("change", () => {
                    const newSkinKey = d.hubSkinSelect.value;
                    const skinObj = this.player.setSkin(newSkinKey);
                    if (skinObj) {
                        this.addLog(`🎭 Đã đổi diện mạo sang 【${skinObj.name} — ${skinObj.title}】!`, "system");
                        this.renderApertureTab();
                        this.updateHubTopbar();
                    }
                });
            }

            if (d.btnHubCultivate) {
                d.btnHubCultivate.addEventListener("click", () => {
                    const res = this.aperture.cultivateStep(5.0, 1.5);
                    if (res.success) {
                        this.addLog(
                            `🧘 Ngươi vận chuyển Chân Nguyên cọ rửa Khiếu Bích, tiến độ ôn dưỡng đạt ${Math.floor(res.wallProgress)}/${res.maxWallProgress}.`,
                            "cultivation"
                        );
                    } else if (res.reason) {
                        this.addLog(res.reason, "warning");
                    }
                    this.renderApertureTab();
                    this.updateHubTopbar();
                });
            }

            if (d.btnHubAbsorbStone) {
                d.btnHubAbsorbStone.addEventListener("click", () => {
                    if (this.player.primevalStones <= 0) {
                        this.addLog("Không còn Nguyên Thạch để hấp thu! Hãy vào Bản Đồ Lịch Luyện cày quái.", "warning");
                        return;
                    }
                    const res = this.aperture.absorbPrimevalStone(1);
                    if (res.success) {
                        this.player.primevalStones -= 1;
                        this.addLog(res.message, "cultivation");
                    } else {
                        this.addLog(res.message, "warning");
                    }
                    this.renderApertureTab();
                    this.updateHubTopbar();
                });
            }

            if (d.btnHubUseRelic) {
                d.btnHubUseRelic.addEventListener("click", () => {
                    const res = this.player.useRelicGu(this.aperture);
                    this.addLog(res.message, res.success ? "cultivation" : "warning");
                    this.renderApertureTab();
                    this.updateHubTopbar();
                });
            }

            if (d.btnHubBreakthrough) {
                d.btnHubBreakthrough.addEventListener("click", () => {
                    const res = this.aperture.attemptBreakthrough();
                    this.addLog(res.message, res.success ? "cultivation" : "warning");
                    if (res.success) {
                        this.player.recalculateStats();
                        this.player.hp = this.player.maxHp;
                    }
                    this.renderApertureTab();
                    this.updateHubTopbar();
                });
            }

            if (d.btnHubAscend) {
                d.btnHubAscend.addEventListener("click", () => {
                    if (!this.aperture.ascensionState.inProgress) {
                        const startRes = this.aperture.startImmortalAscension({ heaven: 150, earth: 150 });
                        this.addLog(startRes.message, startRes.success ? "cultivation" : "warning");
                    } else {
                        const stepRes = this.aperture.advanceAscensionStage(this.player);
                        const logs = stepRes.state && stepRes.state.logs ? stepRes.state.logs : [];
                        const lastLog = logs[logs.length - 1];
                        if (lastLog) this.addLog(lastLog, stepRes.failed ? "danger" : "cultivation");
                        if (stepRes.completed) {
                            this.player.recalculateStats();
                            this.player.hp = this.player.maxHp;
                        }
                    }
                    this.renderApertureTab();
                    this.updateHubTopbar();
                });
            }

            if (d.btnCollectApertureYield) {
                d.btnCollectApertureYield.addEventListener("click", () => {
                    if (!this.aperture.isImmortal) {
                        this.addLog("Chỉ Cổ Tiên Lục Chuyển trở lên mới sở hữu Phúc Địa để thu hoạch sản vật!", "warning");
                        return;
                    }
                    const stonesYield = Math.max(15, this.aperture.immortalAperture.resources.primevalStonesOutput * 2);
                    this.player.primevalStones += stonesYield;
                    this.player.addItem("spirit_herb", 2);
                    this.player.addItem("moon_orchid", 2);
                    this.aperture.immortalEssence[this.aperture.rank] += 1;
                    this.addLog(
                        `🌱 Đã thu hoạch sản vật trong ${this.aperture.immortalAperture.gradeName}: +${stonesYield} Nguyên Thạch, +2 Thanh Linh Thảo, +2 Nguyệt Lan Hoa & +1 viên Tiên Nguyên!`,
                        "loot"
                    );
                    this.renderApertureTab();
                    this.updateHubTopbar();
                });
            }

            if (d.btnTriggerTribulation) {
                d.btnTriggerTribulation.addEventListener("click", () => {
                    if (!this.aperture.isImmortal) {
                        this.addLog("Phàm nhân chưa có Tiên Khiếu để độ Tai Kiếp!", "warning");
                        return;
                    }
                    const res = this.aperture._triggerApertureCalamity(this.player, true);
                    if (!res || !res.success) {
                        this.addLog(res ? res.message : "Chưa đủ điều kiện dẫn động Tai Kiếp!", "warning");
                    } else {
                        this.addLog(res.message, res.didAdvance ? "loot" : "cultivation");
                    }
                    this.renderApertureTab();
                    this.updateHubTopbar();
                });
            }

            // --- TAB 3: Bộ lọc Kho Cổ ---
            if (d.guFilterTabs) {
                const tabs = d.guFilterTabs.querySelectorAll(".tab-btn");
                tabs.forEach(tab => {
                    tab.addEventListener("click", () => {
                        tabs.forEach(t => t.classList.remove("active"));
                        tab.classList.add("active");
                        this.currentGuFilter = tab.getAttribute("data-filter") || "all";
                        this.renderGuStorageTab();
                    });
                });
            }

            // --- TAB 4: Luyện Đạo Các & Giải Mã Tàn Phương ---
            if (d.btnClearRefine) {
                d.btnClearRefine.addEventListener("click", () => {
                    this.refinementSlots = [null, null, null];
                    this.renderRefinementTab();
                });
            }

            if (d.btnExecuteRefine) {
                d.btnExecuteRefine.addEventListener("click", () => {
                    const res = this.guSystem.executeRefinement(this.refinementSlots, this.player, this.aperture);
                    this.addLog(res.message, res.success ? "loot" : "danger");
                    this.refinementSlots = [null, null, null];
                    this.renderRefinementTab();
                    this.updateHubTopbar();
                });
            }

            if (d.btnStudyRemnant) {
                d.btnStudyRemnant.addEventListener("click", () => {
                    const res = this.guSystem.studyRemnantRecipe(this.player);
                    this.addLog(res.message, res.success ? "cultivation" : "warning");
                    this.renderRefinementTab();
                    this.updateHubTopbar();
                });
            }

            // --- TAB 5: Thiên Cơ Sát Chiêu ---
            const updateDeducePreview = () => this._updateKillerMoveDeductionPreview();
            if (d.killerCoreSelect) d.killerCoreSelect.addEventListener("change", updateDeducePreview);
            if (d.killerSub1Select) d.killerSub1Select.addEventListener("change", updateDeducePreview);
            if (d.killerSub2Select) d.killerSub2Select.addEventListener("change", updateDeducePreview);

            if (d.btnDeduceKiller) {
                d.btnDeduceKiller.addEventListener("click", () => {
                    const res = this.guSystem.deduceAndSaveKillerMove(
                        d.killerCoreSelect.value,
                        d.killerSub1Select.value,
                        d.killerSub2Select.value,
                        this.player
                    );
                    this.addLog(res.message, res.success ? "cultivation" : "warning");
                    this.renderKillerMovesTab();
                    this.updateHubTopbar();
                });
            }

            // --- TAB 8: Thương Hội & Bảo Hoàng Thiên ---
            if (d.marketSubtabs) {
                const btns = d.marketSubtabs.querySelectorAll(".tab-btn");
                btns.forEach(btn => {
                    btn.addEventListener("click", () => {
                        btns.forEach(b => b.classList.remove("active"));
                        btn.classList.add("active");
                        this.currentMarketTab = btn.getAttribute("data-market") || "caravan";
                        this.renderMarketTab();
                    });
                });
            }

            // --- TAB 10: Lưu Trữ 3 Ô & Phím Tắt ---
            document.querySelectorAll(".btn-save-slot").forEach(btn => {
                btn.addEventListener("click", () => {
                    const slot = btn.getAttribute("data-slot");
                    if (this.game) {
                        this.game.saveGame(slot);
                        this.renderSettingsTab();
                    }
                });
            });

            document.querySelectorAll(".btn-load-slot").forEach(btn => {
                btn.addEventListener("click", () => {
                    const slot = btn.getAttribute("data-slot");
                    if (this.game) {
                        this.game.loadGame(slot);
                    }
                });
            });

            if (d.btnResetSaves) {
                d.btnResetSaves.addEventListener("click", () => {
                    if (confirm("Ngươi có chắc chắn muốn xóa toàn bộ dữ liệu lưu trữ trong trình duyệt?")) {
                        if (this.game) {
                            this.game.clearAllSaves();
                            this.renderSettingsTab();
                            this.addLog("Đã xóa toàn bộ các ô lưu trữ.", "warning");
                        }
                    }
                });
            }

            if (d.keybindSelect) {
                d.keybindSelect.addEventListener("change", () => {
                    this.keybindMode = d.keybindSelect.value;
                    this.updateKeybindLabels();
                    this.addLog(
                        `Đã đổi chế độ phím tắt Cổ Trùng sang: ${this.keybindMode === "numbers" ? "Chỉ phím số 1–8" : "Kết hợp 1–8 & Q,R,T,F"}.`,
                        "system"
                    );
                });
            }
        }

        // ---------------------------------------------------------------------
        // TAB 1 RENDER: 25 BẢN ĐỒ LỊCH LUYỆN (1 CHUYỂN -> 9 CHUYỂN TÔN GIẢ)
        // ---------------------------------------------------------------------
        renderMapsTab() {
            const d = this.dom;
            if (!d.stageMapsGrid || !this.game) return;

            const stages = this.game.getStageCatalog();
            const filtered = stages.filter(st => {
                if (this.currentMapRankFilter === "all") return true;
                return String(st.reqRank) === this.currentMapRankFilter;
            });

            d.stageMapsGrid.innerHTML = filtered.map(st => {
                const unlockStatus = this.game.isStageUnlocked(st.id);
                const clearCount = this.game.getStageClearCount(st.id);
                const isFirstClear = clearCount === 0;
                const statusClass = !unlockStatus.unlocked ? "locked" : (!isFirstClear ? "cleared" : "");

                const repeatFactor = isFirstClear
                    ? 1.0
                    : (typeof this.game.getStageRepeatFactor === "function"
                        ? this.game.getStageRepeatFactor(st.id)
                        : Math.max(0.08, Number((0.22 / (1 + (clearCount - 1) * 0.15)).toFixed(2))));

                const repeatPct = Math.round(repeatFactor * 100);
                const expectedStones = isFirstClear
                    ? st.rewardStones
                    : Math.max(1, Math.round(st.rewardStones * repeatFactor));
                const expectedMerit = isFirstClear
                    ? st.rewardMerit
                    : Math.max(1, Math.round(st.rewardMerit * repeatFactor));
                const expectedHumanQiText = isFirstClear
                    ? `+${st.rewardHumanQi} Nhân Khí`
                    : `+1 Nhân Khí (20% cơ hội)`;

                const rewardNote = isFirstClear
                    ? "(Vượt lần đầu: 100% thưởng)"
                    : `(Cày lại lần ${clearCount + 1}: ${repeatPct}% thưởng — Tối thiểu 8%)`;

                const rankBadgeLabel = global.GuSystem && global.GuSystem.getRankName
                    ? `${global.GuSystem.getRankName(st.reqRank)}${st.reqRank >= 9 ? " Tôn Giả" : (st.reqRank >= 6 ? " Tiên Cảnh" : "")}`
                    : `${st.reqRank} Chuyển`;

                let bossCombatNote = "";
                if (Array.isArray(st.venerableBosses) && st.venerableBosses.length > 0) {
                    const venListHtml = st.venerableBosses.map(vb =>
                        `<div style="margin-top:3px;color:#7ef7f0;">• <strong>${vb.name}:</strong> ${vb.guLoadout.slice(0, 2).join(", ")} | <span style="color:#ffd700">${vb.killerMoveList[0]}</span></div>`
                    ).join("");
                    bossCombatNote = `
                        <div style="margin-top:4px;padding:6px;background:rgba(20,12,34,0.85);border:1px solid #b75cff;">
                            <strong style="color:#00e5ff;">👑 Độc Chiến Song Tôn Cửu Chuyển (Phòng Ngự Vô Đối):</strong>
                            ${venListHtml}
                        </div>
                    `;
                } else if (st.bossIsHuman) {
                    bossCombatNote = `<div><strong>Tuyệt kỹ Boss:</strong> <span style="color:#ffd700">⚡ ${st.bossKillerMove || "Sát Chiêu"}</span> (${st.bossAttackGu || "Cổ Thuật"})</div>`;
                } else {
                    bossCombatNote = `<div><strong>Loại Boss:</strong> Hung Thú / Hoang Thú Thượng Cổ</div>`;
                }

                return `
                    <div class="stage-map-card ${statusClass}">
                        <div>
                            <div class="map-card-header">
                                <span class="map-card-title">${st.icon} ${st.name}</span>
                                <span class="map-rank-tag">${rankBadgeLabel}</span>
                            </div>
                            <p class="sub-text" style="margin: 8px 0;">${st.description}</p>
                            <div class="map-card-meta">
                                <div><strong>Vùng:</strong> ${st.regionName} | <strong>Đã vượt:</strong> ${clearCount} lần</div>
                                <div><strong>Quái phân bố:</strong> ${st.targetKills} ${st.mobName} (+Tinh Anh)</div>
                                <div><strong>Thủ lĩnh ải:</strong> <span style="color:#ff8080">${st.bossName}</span></div>
                                ${bossCombatNote}
                            </div>
                        </div>

                        <div>
                            <div class="map-card-rewards">
                                🎁 <strong>Chiến lợi phẩm ${rewardNote}:</strong><br>
                                💎 +${expectedStones} Nguyên Thạch | 🏅 +${expectedMerit} Cống Hiến | ☯ ${expectedHumanQiText}<br>
                                📦 Rơi: ${st.dropPreview}${!isFirstClear ? " <em>(Cày lại: 35% tỷ lệ rơi)</em>" : ""}
                            </div>

                            <div class="mt-10">
                                ${unlockStatus.unlocked
                                    ? `<button class="btn-primary btn-enter-stage" data-stage-id="${st.id}" style="width:100%;">
                                           ⚔️ Tiến Vào Chiến Trường (${rankBadgeLabel})
                                       </button>`
                                    : `<button class="btn-secondary" disabled style="width:100%;">
                                           🔒 ${unlockStatus.reason}
                                       </button>`
                                }
                            </div>
                        </div>
                    </div>
                `;
            }).join("");

            d.stageMapsGrid.querySelectorAll(".btn-enter-stage").forEach(btn => {
                btn.addEventListener("click", () => {
                    const stageId = btn.getAttribute("data-stage-id");
                    if (this.game) {
                        this.game.enterStageBattle(stageId);
                    }
                });
            });
        }

        // ---------------------------------------------------------------------
        // TAB 2 RENDER: KHÔNG KHIẾU, ĐỘ KIẾP THĂNG TIÊN, ĐỔI SKIN & TIÊN KHIẾU
        // ---------------------------------------------------------------------
        renderApertureTab() {
            if (!this.aperture || !this.player) return;
            const d = this.dom;
            const ap = this.aperture;
            const pl = this.player;

            if (d.apertureCanvas) {
                ap.renderApertureCanvas(d.apertureCanvas.getContext("2d"));
            }
            if (d.immortalApertureCanvas) {
                ap.renderImmortalApertureMap(d.immortalApertureCanvas.getContext("2d"));
            }

            if (d.hubSkinSelect) {
                d.hubSkinSelect.value = pl.skinId || "phuong_nguyen";
            }
            const skinCfg = pl.getSkinConfig ? pl.getSkinConfig() : null;
            if (d.hubSkinDesc && skinCfg) {
                d.hubSkinDesc.textContent = `[${skinCfg.title}] ${skinCfg.desc}`;
            }
            if (d.hubSkinCanvas && global.PlayerManager) {
                global.PlayerManager.renderSkinPreview(d.hubSkinCanvas.getContext("2d"), pl.skinId);
            }

            d.apTypeText.textContent = ap.isImmortal
                ? `${ap.immortalAperture.gradeName} (${ap.immortalAperture.spaceAcres} mẫu)`
                : `Phàm Khiếu (${ap.aptitude.gradeName} - ${ap.aptitude.maxSeaPercent}%)`;
            d.apRealmText.textContent = ap.getRealmDisplayName();

            if (!ap.isImmortal) {
                d.apWallText.textContent = `${ap.getApertureWallName()} (${Math.floor(ap.wallProgress)}/${ap.maxWallProgress})`;
            } else {
                const passed = ap.immortalAperture.subStageTribulationsPassed || 0;
                const req = ap.immortalAperture.subStageTribulationsRequired ||
                    (ap.getManualTribulationRequirements ? ap.getManualTribulationRequirements().tribulationsNeededForNextStage : 2);
                d.apWallText.textContent = `${ap.immortalAperture.gradeName} (Tiến độ Tiểu Cảnh Giới: ${passed}/${req} Tai Kiếp)`;
            }

            d.apEssenceName.textContent = ap.getEssenceQualityName();
            d.apVitalGuName.textContent = ap.vitalGuName || "Chưa có";

            if (d.btnTriggerTribulation) {
                if (!ap.isImmortal) {
                    d.btnTriggerTribulation.disabled = true;
                    d.btnTriggerTribulation.textContent = "🔒 Chủ Động Độ Tai Kiếp (Cần Thăng Tiên)";
                } else if (ap.rank === 9 && ap.subStage === 3) {
                    d.btnTriggerTribulation.disabled = true;
                    d.btnTriggerTribulation.textContent = "👑 Đã Đạt Cửu Chuyển Đỉnh Phong";
                } else {
                    const req = ap.getManualTribulationRequirements();
                    const passed = ap.immortalAperture.subStageTribulationsPassed || 0;
                    const totalNeed = ap.immortalAperture.subStageTribulationsRequired || req.tribulationsNeededForNextStage;
                    d.btnTriggerTribulation.disabled = false;
                    d.btnTriggerTribulation.textContent = `⚡ Độ Tai Kiếp [${passed}/${totalNeed}] (-${req.essenceCost} Tiên Nguyên, -${req.humanQiCost} Nhân Khí, -${req.mentalCost} Tinh Thần)`;
                }
            }

            const canBreakMortal = !ap.isImmortal && ap.wallProgress >= ap.maxWallProgress && !(ap.rank === 5 && ap.subStage === 3);
            d.btnHubBreakthrough.disabled = !canBreakMortal;

            let extraAscensionBox = document.getElementById("ascension-status-helper-box");
            if (!extraAscensionBox && d.btnHubAscend && d.btnHubAscend.parentNode) {
                extraAscensionBox = document.createElement("div");
                extraAscensionBox.id = "ascension-status-helper-box";
                extraAscensionBox.className = "recipe-preview-box hidden mt-10";
                d.btnHubAscend.parentNode.appendChild(extraAscensionBox);
            }

            if (!ap.isImmortal && (ap.rank >= 5 || ap.ascensionState.inProgress)) {
                d.btnHubAscend.classList.remove("hidden");

                if (ap.ascensionState.inProgress) {
                    const st = ap.ascensionState;
                    const stageTitles = {
                        1: "Bước 2/4: Dẫn Động Thiên Địa Nhị Khí",
                        2: "Bước 3/4: Nghênh Đón Thiên Kiếp Địa Tai",
                        3: "Bước 4/4: Tam Khí Nổ Khiếu — Hóa Thành Phúc Địa!"
                    };
                    d.btnHubAscend.disabled = false;
                    d.btnHubAscend.textContent = `🌌 ${stageTitles[st.stage] || "Tiếp Tục Độ Kiếp Thăng Tiên"} (Cân bằng: ${st.balanceScore}%)`;

                    if (extraAscensionBox) {
                        extraAscensionBox.classList.remove("hidden");
                        extraAscensionBox.innerHTML = `
                            <p><strong class="highlight-gold">⚡ Trạng Thái Độ Kiếp Thăng Tiên (Giai đoạn ${st.stage}/4):</strong></p>
                            <p>Thiên Khí: <strong>${st.heavenQi}</strong> | Địa Khí: <strong>${st.earthQi}</strong> | Nhân Khí: <strong>${st.humanQiCommitted}</strong></p>
                            <p>Độ Dung Hợp Tam Khí: <strong style="color:#5cc995">${st.balanceScore}%</strong> (Càng cao Phúc Địa càng lớn)</p>
                            <div class="action-row mt-5">
                                <button id="btn-asc-stabilize" class="btn-mini">☯ Điều Hòa Tam Khí (+6%)</button>
                                <button id="btn-asc-burn-human" class="btn-mini">🔥 Đốt 10 Nhân Khí (+8% Dung Hợp)</button>
                            </div>
                        `;

                        const btnStab = document.getElementById("btn-asc-stabilize");
                        if (btnStab) {
                            btnStab.addEventListener("click", () => {
                                ap.adjustThreeQi("stabilize");
                                this.addLog(`☯ Đã vận thần niệm điều hòa Thiên - Địa - Nhân Tam Khí (Độ dung hợp: ${ap.ascensionState.balanceScore}%)!`, "cultivation");
                                this.renderApertureTab();
                            });
                        }

                        const btnBurn = document.getElementById("btn-asc-burn-human");
                        if (btnBurn) {
                            btnBurn.addEventListener("click", () => {
                                if (ap.humanQi < 10) {
                                    this.addLog("Không đủ Nhân Khí dự trữ để thiêu đốt thêm!", "warning");
                                    return;
                                }
                                ap.adjustThreeQi("burn_human_qi");
                                this.addLog(`🔥 Thiêu đốt 10 Nhân Khí kích phát tiềm năng, Độ dung hợp Tam Khí đạt ${ap.ascensionState.balanceScore}%!`, "cultivation");
                                this.renderApertureTab();
                                this.updateHubTopbar();
                            });
                        }
                    }
                } else {
                    if (extraAscensionBox) extraAscensionBox.classList.add("hidden");

                    const readiness = typeof ap.getAscensionReadiness === "function"
                        ? ap.getAscensionReadiness()
                        : {
                            canAscend: ap.rank >= 5 && ap.subStage >= 3 && ap.wallProgress >= ap.maxWallProgress && ap.humanQi >= 120,
                            isPeakRank5: ap.rank >= 5 && ap.subStage >= 3,
                            isWallFull: ap.wallProgress >= ap.maxWallProgress,
                            hasEnoughQi: ap.humanQi >= 120,
                            minHumanQi: 120,
                            currentHumanQi: Math.floor(ap.humanQi),
                            wallProgress: Math.floor(ap.wallProgress),
                            maxWallProgress: ap.maxWallProgress
                        };

                    if (!readiness.isPeakRank5) {
                        d.btnHubAscend.disabled = true;
                        d.btnHubAscend.textContent = `🔒 Phá Khiếu Thăng Tiên (Cần đạt Ngũ Chuyển Đỉnh Phong — Hiện tại: ${ap.getRealmDisplayName()})`;
                    } else if (!readiness.isWallFull) {
                        d.btnHubAscend.disabled = true;
                        d.btnHubAscend.textContent = `🔒 Phá Khiếu Thăng Tiên (Cần ôn dưỡng 100% Tinh Mạc: ${readiness.wallProgress}/${readiness.maxWallProgress})`;
                    } else if (!readiness.hasEnoughQi) {
                        d.btnHubAscend.disabled = true;
                        d.btnHubAscend.textContent = `🔒 Phá Khiếu Thăng Tiên (Cần ${readiness.minHumanQi} Nhân Khí — Hiện có: ${readiness.currentHumanQi}/${readiness.minHumanQi})`;
                    } else {
                        d.btnHubAscend.disabled = false;
                        d.btnHubAscend.textContent = `🌌 Phá Khiếu Thăng Tiên — Tam Khí Hợp Nhất (Nhân Khí: ${readiness.currentHumanQi}/${readiness.minHumanQi})`;
                    }
                }
            } else {
                d.btnHubAscend.classList.add("hidden");
                if (extraAscensionBox) extraAscensionBox.classList.add("hidden");
            }

            d.statHp.textContent = `${Math.ceil(pl.hp)} / ${pl.maxHp}`;
            d.statAtk.textContent = pl.atk;
            d.statDef.textContent = pl.def;
            d.statSpd.textContent = pl.spd;
            d.statMental.textContent = `${Math.floor(pl.mental)} / ${pl.maxMental}`;
            d.statAlignment.textContent = pl.getAlignmentTitle();
        }

        // ---------------------------------------------------------------------
        // TAB 3 RENDER: KHO CỔ TRÙNG (<CỔ TRÙNG> <SỐ CHUYỂN>) & NÚT THĂNG CHUYỂN
        // ---------------------------------------------------------------------
        renderGuStorageTab() {
            if (!this.guSystem || !this.player) return;
            const d = this.dom;
            const G = global.GuSystem;

            if (d.hubEquippedGuBar) {
                d.hubEquippedGuBar.innerHTML = [0, 1, 2, 3, 4, 5, 6, 7].map(idx => {
                    const gu = this.guSystem.getEquippedGuAt(idx);
                    const fullGuTitle = gu && G.formatGuNameWithRank ? G.formatGuNameWithRank(gu) : "Ô trống";
                    return `
                        <div class="skill-slot" title="${fullGuTitle}">
                            <span class="slot-key">Ô ${idx + 1}</span>
                            <div class="slot-icon">${gu ? gu.icon : ""}</div>
                            <span class="slot-cost">${gu ? gu.rank + "C" : ""}</span>
                        </div>
                    `;
                }).join("");
            }

            const list = this.guSystem.getFilteredGuList(this.currentGuFilter);
            if (list.length === 0) {
                d.guStorageGrid.innerHTML = `<p class="empty-hint" style="grid-column:1/-1;">Chưa có Cổ Trùng nào trong phân loại này.</p>`;
            } else {
                d.guStorageGrid.innerHTML = list.map(gu => {
                    const isSel = gu.instanceId === this.selectedGuInstanceId;
                    const vitalStar = gu.isVital ? "★" : "";
                    const rankName = G.getRankName ? G.getRankName(gu.rank) : `${gu.rank} Chuyển`;
                    const statusTag = !gu.isRefined ? "[Hoang Dã]" : (gu.equippedSlot !== null ? `[Ô ${gu.equippedSlot + 1}]` : "");
                    return `
                        <div class="item-card ${isSel ? "selected" : ""}" data-gu-inst="${gu.instanceId}">
                            <div class="icon">${gu.icon}</div>
                            <div class="name">${vitalStar}${gu.name}</div>
                            <div class="rank-tag">${rankName} ${statusTag}</div>
                        </div>
                    `;
                }).join("");
            }

            d.guStorageGrid.querySelectorAll(".item-card").forEach(card => {
                card.addEventListener("click", () => {
                    this.selectedGuInstanceId = card.getAttribute("data-gu-inst");
                    this.renderGuStorageTab();
                });
            });

            const gu = this.guSystem.getGuByInstanceId(this.selectedGuInstanceId);
            if (!gu) {
                d.guDetailBox.innerHTML = `<p class="empty-hint">Chọn một Cổ Trùng bên trái để xem cấp Chuyển (1–9), Thăng Chuyển trực tiếp, cho ăn hoặc gán vào 8 ô chiến đấu.</p>`;
                return;
            }

            const fullGuName = G.formatGuNameWithRank ? G.formatGuNameWithRank(gu) : `${gu.name} ${gu.rank} Chuyển`;
            const realmCatLabel = G.getRealmCategoryLabel ? G.getRealmCategoryLabel(gu.realmCategory) : "Phàm Cổ (1–5 Chuyển)";
            const foodMeta = global.PlayerManager.ITEM_DATABASE[gu.foodItemId] || { name: "Nguyên Thạch" };
            const foodCount = this.player.getItemCount(gu.foodItemId);
            const daoAmp = this.player.calculateDaoAmplification(gu.path, []);
            const effectivePower = Math.round(gu.power * daoAmp.multiplier);
            const traitDesc = (gu.killerTrait && gu.killerTrait.modifierDesc)
                ? gu.killerTrait.modifierDesc
                : "Gia tăng uy năng Sát Chiêu cùng lưu phái";

            const upReq = this.guSystem.getGuUpgradeRequirements
                ? this.guSystem.getGuUpgradeRequirements(gu.instanceId, this.player)
                : { canUpgrade: false, reason: "Không hỗ trợ" };

            let upgradeBoxHtml = "";
            if (gu.isRefined) {
                if (upReq.canUpgrade) {
                    const immStoneText = upReq.immortalStoneCost > 0 ? ` + 🌟 ${upReq.immortalStoneCost} Tiên Thạch` : "";
                    upgradeBoxHtml = `
                        <div class="recipe-preview-box mt-10" style="margin-bottom:4px;">
                            <p><strong class="highlight-gold">⬆️ Thăng Cấp Lên 【${gu.name} ${upReq.nextRankName}】:</strong></p>
                            <p>Chi phí: <strong>💎 ${upReq.stoneCost} Nguyên Thạch${immStoneText} + 1x ${foodMeta.name}</strong></p>
                            <p>Tỷ lệ thành công: <strong style="color:#5cc995">${Math.round(upReq.successChance * 100)}%</strong> (Yêu cầu tu vi: ${G.getRankName(upReq.reqCultivationRank)})</p>
                            <button id="btn-upgrade-gu-rank" class="btn-primary mt-5" style="width:100%;">
                                🔥 Thăng Lên ${upReq.nextRankName} Ngay
                            </button>
                        </div>
                    `;
                } else {
                    upgradeBoxHtml = `
                        <div class="recipe-preview-box mt-10" style="margin-bottom:4px;">
                            <p class="sub-text">${upReq.reason}</p>
                        </div>
                    `;
                }
            }

            const equipBtns = gu.isRefined ? `
                <div class="mt-10">
                    <div class="sub-text" style="margin-bottom:4px;">Gán vào Ô Xuất Chiến (1–8):</div>
                    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:5px;">
                        ${[0, 1, 2, 3, 4, 5, 6, 7].map(sIdx =>
                            `<button class="btn-mini btn-equip-gu-slot" data-slot="${sIdx}">Ô ${sIdx + 1}</button>`
                        ).join("")}
                    </div>
                </div>
            ` : "";

            d.guDetailBox.innerHTML = `
                <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #2b261f;padding-bottom:6px;">
                    <strong style="font-size:16px;color:#e2bf75;">${gu.icon} ${fullGuName} ${gu.isVital ? "(Cổ Bản Mệnh)" : ""}</strong>
                    <span class="badge">${gu.path}</span>
                </div>
                <p class="sub-text">${gu.description}</p>
                <div class="info-list">
                    <div class="info-row"><span>Phẩm cấp & Giới hạn:</span> <strong class="highlight-gold">${realmCatLabel} (${gu.minRank} → ${gu.maxRank} Chuyển)</strong></div>
                    <div class="info-row"><span>Trạng thái Luyện Hóa:</span> <strong>${gu.isRefined ? "Đã Luyện Hóa (100%)" : `<span style="color:#e05252">Hoang Dã (${gu.refinementProgress}%)</span>`}</strong></div>
                    <div class="info-row"><span>Độ No / Thức Ăn:</span> <strong>${Math.round(gu.hunger)}% | ${foodMeta.name} (Có: ${foodCount})</strong></div>
                    <div class="info-row"><span>Tiêu hao / Hồi chiêu:</span> <strong>${gu.rank >= 6 ? gu.essenceCost + " viên Tiên Nguyên" : gu.essenceCost + "% Chân Nguyên"} | ${gu.cooldown}s</strong></div>
                    <div class="info-row"><span>Uy lực (${G.getRankName(gu.rank)}):</span> <strong>${gu.power} (Thực chiến Đạo Ngân: <span class="highlight-gold">${effectivePower}</span>)</strong></div>
                    <div class="info-row"><span>Đặc tính ghép Sát Chiêu:</span> <strong style="color:#5cc995">${traitDesc}</strong></div>
                </div>

                ${upgradeBoxHtml}

                <div class="action-row mt-10">
                    ${!gu.isRefined
                        ? `<button id="btn-refine-wild-gu" class="btn-primary">🔥 Luyện Hóa Cổ Hoang Dã</button>`
                        : `<button id="btn-set-vital-gu" class="btn-secondary" ${gu.isVital ? "disabled" : ""}>☯ Đặt Làm Cổ Bản Mệnh</button>`
                    }
                    <button id="btn-feed-gu" class="btn-accent">🍖 Cho Cổ Ăn (${foodMeta.name})</button>
                    <button id="btn-send-gu-to-refine" class="btn-secondary">⚗️ Đưa Sang Lò Hợp Luyện</button>
                </div>
                ${equipBtns}
            `;

            const btnUpgradeRank = document.getElementById("btn-upgrade-gu-rank");
            if (btnUpgradeRank) {
                btnUpgradeRank.addEventListener("click", () => {
                    const res = this.guSystem.upgradeGuRank(gu.instanceId, this.player, this.aperture);
                    this.addLog(res.message, res.success ? "loot" : "warning");
                    this.renderGuStorageTab();
                    this.updateHubTopbar();
                });
            }

            const btnRefineWild = document.getElementById("btn-refine-wild-gu");
            if (btnRefineWild) {
                btnRefineWild.addEventListener("click", () => {
                    const res = this.guSystem.refineWildGuStep(gu.instanceId, this.player, this.aperture);
                    this.addLog(res.message, res.success ? "cultivation" : "warning");
                    this.renderGuStorageTab();
                    this.updateHubTopbar();
                });
            }

            const btnVital = document.getElementById("btn-set-vital-gu");
            if (btnVital) {
                btnVital.addEventListener("click", () => {
                    const res = this.guSystem.setVitalGu(gu.instanceId, this.aperture);
                    this.addLog(res.message, res.success ? "cultivation" : "warning");
                    this.renderGuStorageTab();
                    this.updateHubTopbar();
                });
            }

            const btnFeed = document.getElementById("btn-feed-gu");
            if (btnFeed) {
                btnFeed.addEventListener("click", () => {
                    const res = this.guSystem.feedGu(gu.instanceId, this.player);
                    this.addLog(res.message, res.success ? "system" : "warning");
                    this.renderGuStorageTab();
                    this.updateHubTopbar();
                });
            }

            const btnSendRefine = document.getElementById("btn-send-gu-to-refine");
            if (btnSendRefine) {
                btnSendRefine.addEventListener("click", () => {
                    if (!this.refinementSlots.includes(gu.instanceId)) {
                        const emptyIdx = this.refinementSlots.findIndex(s => s === null);
                        if (emptyIdx !== -1) this.refinementSlots[emptyIdx] = gu.instanceId;
                    }
                    this.switchHubTab("tab-refinement");
                });
            }

            d.guDetailBox.querySelectorAll(".btn-equip-gu-slot").forEach(btn => {
                btn.addEventListener("click", () => {
                    const slotIdx = parseInt(btn.getAttribute("data-slot"), 10);
                    const res = this.guSystem.equipGuToSlot(gu.instanceId, slotIdx);
                    this.addLog(res.message, res.success ? "system" : "warning");
                    this.renderGuStorageTab();
                });
            });
        }

        // ---------------------------------------------------------------------
        // TAB 4 RENDER: LUYỆN ĐẠO CÁC & GIẢI MÃ TÀN PHƯƠNG
        // ---------------------------------------------------------------------
        renderRefinementTab() {
            if (!this.guSystem || !this.player) return;
            const d = this.dom;
            const G = global.GuSystem;
            const slotEls = [d.refineSlot1, d.refineSlot2, d.refineSlot3];

            slotEls.forEach((el, idx) => {
                const val = this.refinementSlots[idx];
                if (!val) {
                    el.classList.remove("filled");
                    el.textContent = idx === 2 ? "Cổ Tài Phụ Trợ" : `Cổ Trùng ${idx + 1}`;
                } else {
                    el.classList.add("filled");
                    const gu = this.guSystem.getGuByInstanceId(val);
                    if (gu) {
                        const fullName = G.formatGuNameWithRank ? G.formatGuNameWithRank(gu) : gu.name;
                        el.innerHTML = `<div>${gu.icon} ${fullName}</div>`;
                    } else {
                        const itemMeta = global.PlayerManager.ITEM_DATABASE[val];
                        el.innerHTML = `<div>${itemMeta ? itemMeta.icon + " " + itemMeta.name : val}</div>`;
                    }
                }
            });

            const preview = this.guSystem.previewRefinement(this.refinementSlots, this.player, this.aperture);
            if (preview.valid) {
                d.refinePreview.innerHTML = `
                    <p>Thành phẩm: <strong class="highlight-gold">${preview.resultName}</strong></p>
                    <p>Tỷ lệ thành công: <strong>${Math.round(preview.successChance * 100)}%</strong> (Đã cộng Đạo Ngân Luyện/Trí/Vận Đạo)</p>
                    <p>Chi phí: <strong>${preview.essenceCost}% Chân Nguyên | 💎 ${preview.stoneCost} Nguyên Thạch</strong></p>
                `;
                d.btnExecuteRefine.disabled = false;
            } else {
                d.refinePreview.innerHTML = `
                    <p>Cổ Phương khớp: <strong>${preview.reason}</strong></p>
                    <p>Tỷ lệ thành công: <strong>0%</strong></p>
                `;
                d.btnExecuteRefine.disabled = true;
            }

            const remnantCount = this.player.getItemCount("remnant_recipe");
            if (d.btnStudyRemnant) {
                d.btnStudyRemnant.textContent = `📜 Giải Mã Tàn Phương (Đang có: ${remnantCount})`;
            }

            const recipes = this.guSystem.getKnownRecipes();
            d.knownRecipesList.innerHTML = recipes.map(r => `
                <li data-recipe-id="${r.id}">
                    📜 <strong>${r.resultName}</strong><br>
                    <span class="sub-text">Nguyên liệu: ${r.ingredientsDesc} | Tỷ lệ cơ sở: ${Math.round(r.baseChance * 100)}%</span>
                </li>
            `).join("");

            d.knownRecipesList.querySelectorAll("li").forEach(li => {
                li.addEventListener("click", () => {
                    const recipeId = li.getAttribute("data-recipe-id");
                    const fillRes = this.guSystem.autoFillRecipeSlots(recipeId, this.player);
                    if (fillRes.success) {
                        this.refinementSlots = fillRes.slots;
                        this.addLog(fillRes.message, "system");
                        this.renderRefinementTab();
                    } else {
                        this.addLog(fillRes.message, "warning");
                    }
                });
            });
        }

        // ---------------------------------------------------------------------
        // TAB 5 RENDER: THIÊN CƠ SÁT CHIÊU (<CỔ TRÙNG> <SỐ CHUYỂN>)
        // ---------------------------------------------------------------------
        renderKillerMovesTab() {
            if (!this.guSystem) return;
            const d = this.dom;
            const G = global.GuSystem;
            const refinedGu = this.guSystem.getRefinedGuList();

            const optionsHtml = `<option value="">-- Chọn Cổ Trùng Đã Luyện Hóa --</option>` + refinedGu.map(gu => {
                const fullName = G.formatGuNameWithRank ? G.formatGuNameWithRank(gu) : `${gu.name} ${gu.rank} Chuyển`;
                return `<option value="${gu.id}">${gu.icon} ${fullName} (Uy lực ${gu.power} - ${gu.path})</option>`;
            }).join("");

            const prevCore = d.killerCoreSelect.value;
            const prevSub1 = d.killerSub1Select.value;
            const prevSub2 = d.killerSub2Select.value;

            d.killerCoreSelect.innerHTML = optionsHtml;
            d.killerSub1Select.innerHTML = optionsHtml;
            d.killerSub2Select.innerHTML = optionsHtml;

            if (prevCore) d.killerCoreSelect.value = prevCore;
            if (prevSub1) d.killerSub1Select.value = prevSub1;
            if (prevSub2) d.killerSub2Select.value = prevSub2;

            this._updateKillerMoveDeductionPreview();

            const savedMoves = this.guSystem.getSavedKillerMoves();
            const keys = ["Z", "X", "C", "V"];

            if (savedMoves.length === 0) {
                d.savedKillerList.innerHTML = `<p class="empty-hint">Chưa nắm giữ Sát Chiêu nào. Hãy chọn Cổ Cốt Lõi và Cổ Phụ Trợ bên trái để thôi diễn.</p>`;
            } else {
                d.savedKillerList.innerHTML = savedMoves.map(move => {
                    const mRank = move.moveRank || 1;
                    const rankName = G.getRankName ? G.getRankName(mRank) : `${mRank} Chuyển`;
                    const daoAmp = this.player ? this.player.calculateDaoAmplification(move.path, []) : { multiplier: 1.0 };
                    const realPower = Math.round(move.power * daoAmp.multiplier);
                    const compNames = (move.requiredGuIds || []).map(id => {
                        const inst = this.guSystem._getHighestOwnedGuOrTemplate ? this.guSystem._getHighestOwnedGuOrTemplate(id) : null;
                        return inst && G.formatGuNameWithRank ? G.formatGuNameWithRank(inst) : id;
                    }).join(" + ");

                    return `
                        <div class="list-card">
                            <div class="list-card-header">
                                <span>${move.icon} ${move.name}</span>
                                <span class="badge">${rankName} — ${move.path}</span>
                            </div>
                            <div style="font-size:12px;color:#5cc995;margin-top:2px;">
                                ⚔️ Uy lực gốc Cổ: <strong>${move.power}</strong> | Khuếch đại Đạo Ngân (x${daoAmp.multiplier}): <strong class="highlight-gold">${realPower}</strong> | Tiêu hao: <strong>${mRank >= 6 ? move.essenceCost + " Tiên Nguyên" : move.essenceCost + "%"}</strong>
                            </div>
                            <div style="font-size:11.5px;color:#e6dfd5;">
                                🧩 Cổ thành phần: ${compNames}
                            </div>
                            <p class="sub-text">${move.description}</p>
                            <div class="action-row mt-5">
                                ${keys.map((k, kIdx) => {
                                    const isBound = this.guSystem.equippedKillerSlots[kIdx] === move.id;
                                    return `
                                        <button class="btn-mini btn-bind-killer ${isBound ? "highlight-gold" : ""}" data-move-id="${move.id}" data-kslot="${kIdx}">
                                            ${isBound ? `✓ Đang ở Phím ${k}` : `Gán Phím ${k}`}
                                        </button>
                                    `;
                                }).join("")}
                            </div>
                        </div>
                    `;
                }).join("");

                d.savedKillerList.querySelectorAll(".btn-bind-killer").forEach(btn => {
                    btn.addEventListener("click", () => {
                        const moveId = btn.getAttribute("data-move-id");
                        const kSlot = parseInt(btn.getAttribute("data-kslot"), 10);
                        const res = this.guSystem.equipKillerMoveToSlot(moveId, kSlot);
                        this.addLog(res.message, res.success ? "system" : "warning");
                        this.renderKillerMovesTab();
                    });
                });
            }
        }

        _updateKillerMoveDeductionPreview() {
            if (!this.guSystem) return;
            const d = this.dom;
            const preview = this.guSystem.previewKillerMoveDeduction(
                d.killerCoreSelect.value,
                d.killerSub1Select.value,
                d.killerSub2Select.value,
                this.player
            );

            d.deduceName.textContent = preview.name || "---";
            d.deduceType.textContent = preview.typeLabel || "---";
            d.deduceCost.textContent = preview.essenceCost ? `${preview.essenceCost}% Chân Nguyên` : "0";
            d.deduceDesc.textContent = preview.description || "Hãy chọn ít nhất 1 Cổ Cốt Lõi và 1 Cổ Phụ Trợ.";
        }

        // ---------------------------------------------------------------------
        // TAB 6 RENDER: ĐẠO NGÂN 21 LƯU PHÁI & THĂM DÒ MỘNG CẢNH
        // ---------------------------------------------------------------------
        renderDaoAttainmentTab() {
            if (!this.player) return;
            const d = this.dom;
            const pl = this.player;
            const paths = global.PlayerManager.DAO_PATHS;

            d.daoMarksList.innerHTML = Object.keys(paths).map(pathName => {
                const meta = paths[pathName];
                const marks = pl.daoMarks[pathName] || 0;
                const attain = pl.pathAttainment[pathName] || "Phàm Cấp";
                const bonusPct = Math.round((marks / 800) * 100);
                return `
                    <div class="dao-mark-card" title="${meta.desc}">
                        <span>${meta.icon} <strong>${pathName}</strong></span>
                        <span style="color:${meta.color}">${marks} Đạo Ngân (+${bonusPct}% Uy lực | ${attain})</span>
                    </div>
                `;
            }).join("");

            const dreams = global.PlayerManager.DREAM_REALMS || [];
            d.dreamRealmList.innerHTML = dreams.map(dr => {
                const cleared = (pl.dreamClears && pl.dreamClears[dr.id]) || 0;
                return `
                    <div class="list-card">
                        <div class="list-card-header">
                            <span>🌙 ${dr.name} [Yêu cầu: ${dr.reqRank} Chuyển]</span>
                            <span>Đã thăm dò: ${cleared} lần</span>
                        </div>
                        <p class="sub-text">${dr.desc}</p>
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:4px;">
                            <span style="font-size:12px;color:#5cc995;">
                                Thưởng: +${dr.daoMarksReward} Đạo Ngân (${dr.paths.join(", ")}) & +${dr.humanQiReward} Nhân Khí
                            </span>
                            <button class="btn-mini btn-explore-dream" data-dream-id="${dr.id}">
                                Thăm Dò (-${dr.mentalCost} Tinh Thần)
                            </button>
                        </div>
                    </div>
                `;
            }).join("");

            d.dreamRealmList.querySelectorAll(".btn-explore-dream").forEach(btn => {
                btn.addEventListener("click", () => {
                    const dreamId = btn.getAttribute("data-dream-id");
                    const res = this.player.exploreDreamRealm(dreamId);
                    this.addLog(res.message, res.success ? "cultivation" : "warning");
                    this.renderDaoAttainmentTab();
                    this.updateHubTopbar();
                });
            });
        }

        // ---------------------------------------------------------------------
        // TAB 7 RENDER: HÀNH TRANG, XÁ LỢI CỔ & BÁN CỔ TÀI
        // ---------------------------------------------------------------------
        renderInventoryTab() {
            if (!this.player) return;
            const d = this.dom;
            const items = this.player.inventory;

            if (items.length === 0) {
                d.inventoryGrid.innerHTML = `<p class="empty-hint" style="grid-column:1/-1;">Hành trang trống rỗng.</p>`;
            } else {
                d.inventoryGrid.innerHTML = items.map(slot => {
                    const meta = global.PlayerManager.ITEM_DATABASE[slot.id] || { name: slot.id, icon: "📦" };
                    const isSel = slot.id === this.selectedInventoryItemId;
                    return `
                        <div class="item-card ${isSel ? "selected" : ""}" data-item-id="${slot.id}">
                            <div class="icon">${meta.icon}</div>
                            <div class="name">${meta.name}</div>
                            <div class="rank-tag">x${slot.count}</div>
                        </div>
                    `;
                }).join("");
            }

            d.inventoryGrid.querySelectorAll(".item-card").forEach(card => {
                card.addEventListener("click", () => {
                    this.selectedInventoryItemId = card.getAttribute("data-item-id");
                    this.renderInventoryTab();
                });
            });

            const selMeta = global.PlayerManager.ITEM_DATABASE[this.selectedInventoryItemId];
            const selCount = this.player.getItemCount(this.selectedInventoryItemId);

            if (!selMeta || selCount <= 0) {
                d.inventoryDetailBox.innerHTML = `<p class="empty-hint">Chọn một vật phẩm bên trái để sử dụng (Xá Lợi Cổ / Thảo Dược) hoặc bán lấy Nguyên Thạch.</p>`;
            } else {
                const sellValue = Math.max(1, Math.floor(selMeta.value * 0.6));
                d.inventoryDetailBox.innerHTML = `
                    <strong style="font-size:16px;color:#e2bf75;">${selMeta.icon} ${selMeta.name} (Đang có: ${selCount})</strong>
                    <p class="sub-text">${selMeta.desc}</p>
                    <p>Giá bán lại cho Thương Hội: <strong>💎 ${sellValue} Nguyên Thạch / cái</strong></p>
                    <div class="action-row mt-10">
                        <button id="btn-use-inv-item" class="btn-primary">✨ Sử Dụng Vật Phẩm</button>
                        <button id="btn-sell-inv-item" class="btn-secondary">💰 Bán 1 Cái (+${sellValue} Nguyên Thạch)</button>
                        <button id="btn-send-item-to-refine" class="btn-accent">⚗️ Đưa Vào Lò Hợp Luyện</button>
                    </div>
                `;

                document.getElementById("btn-use-inv-item").addEventListener("click", () => {
                    const res = this.player.useItem(this.selectedInventoryItemId);
                    this.addLog(res.message, res.success ? "cultivation" : "warning");
                    this.renderInventoryTab();
                    this.updateHubTopbar();
                });

                document.getElementById("btn-sell-inv-item").addEventListener("click", () => {
                    if (this.player.removeItem(this.selectedInventoryItemId, 1)) {
                        this.player.primevalStones += sellValue;
                        this.addLog(`Đã bán 1x [${selMeta.name}] thu về 💎 ${sellValue} Nguyên Thạch.`, "loot");
                        this.renderInventoryTab();
                        this.updateHubTopbar();
                    }
                });

                document.getElementById("btn-send-item-to-refine").addEventListener("click", () => {
                    this.refinementSlots[2] = this.selectedInventoryItemId;
                    this.switchHubTab("tab-refinement");
                });
            }
        }

        // ---------------------------------------------------------------------
        // TAB 8 RENDER: THƯƠNG ĐỘI, PHÒNG ĐẤU GIÁ & BẢO HOÀNG THIÊN
        // ---------------------------------------------------------------------
        renderMarketTab() {
            if (!this.player || !this.guSystem) return;
            const d = this.dom;
            const discount = this.player.tradeDiscount || 0;

            let catalog = CARAVAN_SHOP_ITEMS;
            if (this.currentMarketTab === "auction") catalog = AUCTION_HOUSE_ITEMS;
            else if (this.currentMarketTab === "treasure_heaven") catalog = TREASURE_YELLOW_HEAVEN_ITEMS;

            d.marketContent.innerHTML = catalog.map((entry, idx) => {
                const isImmortalCurr = entry.currency === "immortal";
                const finalPrice = isImmortalCurr
                    ? entry.price
                    : Math.max(1, Math.round(entry.price * (1 - discount)));
                const currencyLabel = isImmortalCurr ? `🌟 ${finalPrice} Tiên Thạch` : `💎 ${finalPrice} Nguyên Thạch`;
                const lightBadge = entry.light ? `<span class="badge highlight-gold">${entry.light}</span>` : "";

                return `
                    <div class="card-box" style="justify-content:space-between;gap:10px;">
                        <div>
                            <div style="display:flex;justify-content:space-between;align-items:flex-start;">
                                <strong style="color:#e2bf75;font-size:14.5px;">${entry.icon} ${entry.name}</strong>
                                ${lightBadge}
                            </div>
                            <p class="sub-text mt-5">${entry.desc}</p>
                        </div>
                        <button class="btn-primary btn-market-buy" data-idx="${idx}" style="width:100%;">
                            Mua Ngay (${currencyLabel})
                        </button>
                    </div>
                `;
            }).join("");

            d.marketContent.querySelectorAll(".btn-market-buy").forEach(btn => {
                btn.addEventListener("click", () => {
                    const idx = parseInt(btn.getAttribute("data-idx"), 10);
                    const entry = catalog[idx];
                    if (!entry) return;

                    const isImmortalCurr = entry.currency === "immortal";
                    const finalPrice = isImmortalCurr
                        ? entry.price
                        : Math.max(1, Math.round(entry.price * (1 - discount)));

                    if (isImmortalCurr) {
                        if (this.player.immortalStones < finalPrice) {
                            this.addLog(`Không đủ Tiên Nguyên Thạch (Cần 🌟 ${finalPrice})!`, "warning");
                            return;
                        }
                        this.player.removeItem("immortal_stone", finalPrice);
                    } else {
                        if (this.player.primevalStones < finalPrice) {
                            this.addLog(`Không đủ Nguyên Thạch (Cần 💎 ${finalPrice})!`, "warning");
                            return;
                        }
                        this.player.primevalStones -= finalPrice;
                    }

                    if (entry.type === "exchange_immortal") {
                        this.player.addItem("immortal_stone", 1);
                        this.addLog(`🌟 Đã tụ hợp ${finalPrice} Nguyên Thạch đổi thành công 1 viên Tiên Nguyên Thạch tại Bảo Hoàng Thiên!`, "loot");
                    } else if (entry.type === "gu") {
                        const newGu = this.guSystem.addGuToStorage(entry.id, {
                            rank: entry.guRank || 1,
                            isRefined: true,
                            refinementProgress: 100,
                            isVital: false
                        });
                        const fullGuName = global.GuSystem.formatGuNameWithRank
                            ? global.GuSystem.formatGuNameWithRank(newGu)
                            : newGu.name;
                        this.addLog(`⚖️ Giao dịch thành công! Đã mua Cổ Trùng 【${fullGuName}】.`, "loot");
                    } else {
                        const qty = entry.count || 1;
                        this.player.addItem(entry.id, qty);
                        this.addLog(`⚖️ Đã mua ${qty}x [${entry.name}] thành công.`, "loot");
                    }

                    this.updateHubTopbar();
                    this.renderMarketTab();
                });
            });
        }

        // ---------------------------------------------------------------------
        // TAB 9 RENDER: NHIỆM VỤ THẾ LỰC, GIA TỘC KHỐ PHÒNG & CHÂN TRUYỀN
        // ---------------------------------------------------------------------
        renderFactionTab() {
            if (!this.player || !this.game) return;
            const d = this.dom;

            const quests = (this.enemies && this.enemies.getActiveQuests) ? this.enemies.getActiveQuests() : [];
            d.questList.innerHTML = quests.map(q => `
                <div class="list-card">
                    <div class="list-card-header">
                        <span>📜 ${q.title}</span>
                        <span>${q.completed ? "✅ Đã hoàn thành" : `${q.progress}/${q.target}`}</span>
                    </div>
                    <p class="sub-text">${q.description}</p>
                    <p style="font-size:11.5px;color:#5cc995;">Thưởng: ${q.rewardText}</p>
                </div>
            `).join("");

            d.clanTreasury.innerHTML = CLAN_TREASURY_ITEMS.map((item, idx) => `
                <div class="list-card">
                    <div class="list-card-header">
                        <span>${item.icon} ${item.name}</span>
                        <span>🏅 ${item.meritCost} Cống Hiến</span>
                    </div>
                    <p class="sub-text">${item.desc}</p>
                    <button class="btn-mini btn-redeem-merit mt-5" data-idx="${idx}">
                        Đổi Vật Phẩm
                    </button>
                </div>
            `).join("");

            d.clanTreasury.querySelectorAll(".btn-redeem-merit").forEach(btn => {
                btn.addEventListener("click", () => {
                    const idx = parseInt(btn.getAttribute("data-idx"), 10);
                    const item = CLAN_TREASURY_ITEMS[idx];
                    if (!item) return;

                    if ((this.player.meritPoints || 0) < item.meritCost) {
                        this.addLog(`Điểm Cống Hiến không đủ (Cần 🏅 ${item.meritCost})! Hãy vượt các Bản Đồ Lịch Luyện để tích lũy.`, "warning");
                        return;
                    }

                    this.player.meritPoints -= item.meritCost;
                    if (item.type === "gu") {
                        this.guSystem.addGuToStorage(item.id, {
                            rank: item.guRank || 1,
                            isRefined: true,
                            refinementProgress: 100
                        });
                    } else {
                        this.player.addItem(item.id, 1);
                    }

                    this.addLog(`🏛️ Đã dùng ${item.meritCost} Điểm Cống Hiến đổi lấy [${item.name}] từ Gia Tộc Khố Phòng!`, "loot");
                    this.updateHubTopbar();
                });
            });

            d.inheritanceList.innerHTML = TRUE_INHERITANCES.map(inh => {
                const isClaimed = this.game.isInheritanceClaimed(inh.id);
                const rankOk = this.aperture.rank >= inh.reqRank;
                const stageOk = this.game.getStageClearCount(inh.reqStageCleared) > 0;
                const canClaim = !isClaimed && rankOk && stageOk;

                return `
                    <div class="list-card">
                        <div class="list-card-header">
                            <span>🕯️ ${inh.name}</span>
                            <span>${isClaimed ? "✅ Đã Kế Thừa" : `${inh.reqRank} Chuyển`}</span>
                        </div>
                        <p class="sub-text">${inh.desc}</p>
                        <button class="btn-mini btn-claim-inheritance mt-5" data-id="${inh.id}" ${canClaim ? "" : "disabled"}>
                            ${isClaimed ? "Đã Nhận Chân Truyền" : (canClaim ? "✨ Kế Thừa Chân Truyền Ngay!" : "Chưa Đủ Điều Kiện")}
                        </button>
                    </div>
                `;
            }).join("");

            d.inheritanceList.querySelectorAll(".btn-claim-inheritance").forEach(btn => {
                btn.addEventListener("click", () => {
                    const inhId = btn.getAttribute("data-id");
                    const inh = TRUE_INHERITANCES.find(i => i.id === inhId);
                    if (!inh) return;

                    this.game.claimInheritance(inh);
                    this.renderFactionTab();
                    this.updateHubTopbar();
                });
            });
        }

        // ---------------------------------------------------------------------
        // TAB 10 RENDER: LƯU TRỮ 3 Ô (SAVE/LOAD)
        // ---------------------------------------------------------------------
        renderSettingsTab() {
            const d = this.dom;
            if (!this.game) return;
            [1, 2, 3].forEach(slotNum => {
                const el = d[`saveSlot${slotNum}Info`];
                if (el) el.textContent = this.game.getSaveSlotSummary(slotNum);
            });
        }

        // =====================================================================
        // 8. MÀN HÌNH 3: HUD CHIẾN ĐẤU VƯỢT ẢI 2D, TƯƠNG TÁC NPC & SONG TÔN HUD
        // =====================================================================

        _bindBattleScreenEvents() {
            const d = this.dom;

            if (d.btnRetreatToHub) {
                d.btnRetreatToHub.addEventListener("click", () => {
                    if (this.game) {
                        this.game.retreatToHub();
                    }
                });
            }

            if (d.btnBattleUseStone) {
                d.btnBattleUseStone.addEventListener("click", () => {
                    if (!this.player || this.player.primevalStones <= 0) {
                        this.addLog("Không còn Nguyên Thạch để hồi Chân Nguyên!", "warning");
                        return;
                    }
                    const res = this.aperture.absorbPrimevalStone(1);
                    if (res.success) {
                        this.player.primevalStones -= 1;
                        if (this.combat) {
                            this.combat.spawnFloatingText(this.player.x, this.player.y - 24, `+${res.restored}% Chân Nguyên`, "#38c992");
                        }
                        this.updateBattleHUD();
                    }
                });
            }

            if (d.btnBattleUseHerb) {
                d.btnBattleUseHerb.addEventListener("click", () => {
                    const herbId = this.player.getItemCount("spirit_herb") > 0 ? "spirit_herb" : "ration_meat";
                    const res = this.player.useItem(herbId);
                    if (res.success && this.combat) {
                        this.combat.spawnFloatingText(this.player.x, this.player.y - 24, "+Sinh Mệnh", "#4cd964");
                    }
                    this.updateBattleHUD();
                });
            }

            if (d.guQuickbar) {
                d.guQuickbar.querySelectorAll(".gu-slot").forEach(slotEl => {
                    slotEl.addEventListener("click", () => {
                        const slotIdx = parseInt(slotEl.getAttribute("data-slot"), 10);
                        if (this.combat) this.combat.activateGuSlot(slotIdx);
                    });
                });
            }

            if (d.killerQuickbar) {
                d.killerQuickbar.querySelectorAll(".killer-slot").forEach(kSlotEl => {
                    kSlotEl.addEventListener("click", () => {
                        const kIdx = parseInt(kSlotEl.getAttribute("data-kslot"), 10);
                        if (this.combat) this.combat.activateKillerMoveSlot(kIdx);
                    });
                });
            }

            if (d.btnReplayStage) {
                d.btnReplayStage.addEventListener("click", () => {
                    d.stageVictoryModal.classList.add("hidden");
                    if (this.game && this.game.activeStage) {
                        this.game.enterStageBattle(this.game.activeStage.id);
                    }
                });
            }

            if (d.btnVictoryReturnHub) {
                d.btnVictoryReturnHub.addEventListener("click", () => {
                    d.stageVictoryModal.classList.add("hidden");
                    if (this.game) {
                        this.game.retreatToHub();
                    }
                });
            }
        }

        _ensureNpcInteractionModal() {
            let modal = document.getElementById("npc-interaction-modal");
            if (!modal && this.dom.battleScreen) {
                modal = document.createElement("div");
                modal.id = "npc-interaction-modal";
                modal.className = "modal-backdrop hidden";
                modal.innerHTML = `
                    <div class="modal-window" style="max-width: 580px;">
                        <div class="modal-header" style="display:flex;justify-content:space-between;align-items:center;">
                            <h2 id="npc-modal-title">🤝 Giao Lưu Cổ Sư</h2>
                            <button id="btn-close-npc-modal" class="btn-mini">✕ Đóng</button>
                        </div>
                        <div class="modal-body" id="npc-modal-body"></div>
                    </div>
                `;
                this.dom.battleScreen.appendChild(modal);
            }

            this.dom.npcInteractionModal = modal;
            this.dom.npcModalTitle = document.getElementById("npc-modal-title");
            this.dom.npcModalBody = document.getElementById("npc-modal-body");

            const btnClose = document.getElementById("btn-close-npc-modal");
            if (btnClose && !btnClose._boundClose) {
                btnClose._boundClose = true;
                btnClose.addEventListener("click", () => this.closeNpcInteractionModal());
            }

            return modal;
        }

        openNpcInteractionModal(npc) {
            if (!npc || npc.isDead || !this.player) return;
            const modal = this._ensureNpcInteractionModal();
            if (!modal) return;

            this.activeInteractingNpc = npc;
            const greeting = typeof npc.getGreetingDialogue === "function"
                ? npc.getGreetingDialogue(this.player)
                : `Tại hạ là ${npc.name} thuộc ${npc.factionName}.`;

            const discount = this.player.tradeDiscount || 0;
            const shopItems = Array.isArray(npc.shopInventory) ? npc.shopInventory : [];

            const shopHtml = shopItems.length === 0
                ? `<p class="sub-text">Hiện tại đạo hữu này không có vật phẩm nào mang ra trao đổi.</p>`
                : shopItems.map((entry, idx) => {
                    const finalPrice = Math.max(1, Math.round(entry.price * (1 - discount)));
                    const canBuy = entry.stock > 0 && this.player.primevalStones >= finalPrice;
                    return `
                        <div class="list-card" style="flex-direction:row;justify-content:space-between;align-items:center;gap:10px;">
                            <div>
                                <strong>${entry.icon || "📦"} ${entry.name}</strong> <span class="badge">Còn: ${entry.stock}</span>
                                <p class="sub-text">${entry.desc || ""}</p>
                            </div>
                            <button class="btn-mini btn-npc-buy" data-item-idx="${idx}" ${canBuy ? "" : "disabled"}>
                                ${entry.stock <= 0 ? "Hết hàng" : `Mua (💎 ${finalPrice})`}
                            </button>
                        </div>
                    `;
                }).join("");

            if (this.dom.npcModalTitle) {
                this.dom.npcModalTitle.innerHTML = `🤝 ${npc.name} — <span class="sub-text">${npc.title} (${npc.rank} Chuyển)</span>`;
            }

            if (this.dom.npcModalBody) {
                this.dom.npcModalBody.innerHTML = `
                    <div class="recipe-preview-box">
                        <p><strong>Thế lực:</strong> ${npc.factionName} | <strong>Tư chất:</strong> ${npc.aptitude || "Ất Đẳng"} | <strong>Hảo cảm:</strong> <span class="highlight-gold">${npc.relation}</span></p>
                        <p><strong>Trạng thái:</strong> ${npc.aiStateText || "Đang du lịch"} | <strong>Tài sản NPC:</strong> 💎 ${npc.primevalStones} Nguyên Thạch</p>
                        <p class="mt-5" style="color:#7ef7f0;font-style:italic;">"${greeting}"</p>
                    </div>

                    <h3 style="font-size:14px;color:#e2bf75;margin:10px 0 6px 0;">⚖️ Vật Phẩm & Cổ Trùng Đang Giao Dịch (Đang có: 💎 ${this.player.primevalStones} Nguyên Thạch)</h3>
                    <div class="scroll-list" style="max-height:190px;">
                        ${shopHtml}
                    </div>

                    <div class="action-row mt-15" style="justify-content:space-between;">
                        <button id="btn-npc-quest" class="btn-accent">📜 Nhận Ủy Thác Nhiệm Vụ</button>
                        <button id="btn-npc-spar" class="btn-secondary">⚔️ Tỷ Thí Cổ Thuật</button>
                        <button id="btn-npc-kill" class="btn-danger">🩸 Sát Nhân Đoạt Cổ</button>
                    </div>
                `;

                this.dom.npcModalBody.querySelectorAll(".btn-npc-buy").forEach(btn => {
                    btn.addEventListener("click", () => {
                        const idx = parseInt(btn.getAttribute("data-item-idx"), 10);
                        if (!this.enemies) return;
                        const res = this.enemies.buyFromNpc(npc, idx, this.player, this.guSystem);
                        this.addLog(res.message, res.success ? "loot" : "warning");
                        if (res.success && this.combat) {
                            this.combat.spawnFloatingText(this.player.x, this.player.y - 24, "Giao Dịch Thành Công!", "#5cc995");
                        }
                        this.openNpcInteractionModal(npc);
                        this.updateBattleHUD();
                    });
                });

                const btnQuest = document.getElementById("btn-npc-quest");
                if (btnQuest) {
                    btnQuest.addEventListener("click", () => {
                        if (!this.enemies) return;
                        const res = this.enemies.assignDynamicQuestFromNpc(npc);
                        this.addLog(res.message, "cultivation");
                        if (this.combat) {
                            this.combat.spawnFloatingText(this.player.x, this.player.y - 26, "📜 Nhận Ủy Thác Mới!", "#ffd700");
                        }
                        this.closeNpcInteractionModal();
                    });
                }

                const btnSpar = document.getElementById("btn-npc-spar");
                if (btnSpar) {
                    btnSpar.addEventListener("click", () => {
                        if (typeof npc.becomeHostile === "function") {
                            npc.becomeHostile(false);
                        }
                        this.addLog(`⚔️ Ngươi chắp tay mời [${npc.name}] tỷ thí cổ thuật! Đánh giảm máu đối phương xuống dưới 22% để phân thắng bại.`, "combat");
                        if (this.combat) {
                            this.combat.spawnFloatingText(npc.x, npc.y - 26, "Bắt Đầu Tỷ Thí!", "#5aa9e6");
                        }
                        this.closeNpcInteractionModal();
                    });
                }

                const btnKill = document.getElementById("btn-npc-kill");
                if (btnKill) {
                    btnKill.addEventListener("click", () => {
                        if (typeof npc.becomeHostile === "function") {
                            npc.becomeHostile(true);
                        }
                        this.player.alignment -= 15;
                        this.addLog(`🩸 Ngươi bất ngờ ra tay sát phạt [${npc.name}] để đoạt Nguyên Thạch và Cổ Trùng!`, "danger");
                        if (this.combat) {
                            this.combat.spawnFloatingText(npc.x, npc.y - 26, "Tử Chiến Đoạt Cổ!", "#ff4d4d");
                        }
                        this.closeNpcInteractionModal();
                    });
                }
            }

            modal.classList.remove("hidden");
        }

        closeNpcInteractionModal() {
            this.activeInteractingNpc = null;
            const modal = this.dom.npcInteractionModal || document.getElementById("npc-interaction-modal");
            if (modal) {
                modal.classList.add("hidden");
            }
        }

        updateBattleHUD() {
            if (!this.player || !this.aperture) return;
            const d = this.dom;
            const pl = this.player;
            const ap = this.aperture;

            d.battlePlayerName.textContent = pl.name;
            d.battleRealmBadge.textContent = ap.getRealmDisplayName();

            const hpPct = Math.max(0, Math.min(100, (pl.hp / pl.maxHp) * 100));
            d.battleHpText.textContent = `${Math.ceil(pl.hp)} / ${pl.maxHp}`;
            d.battleHpFill.style.width = `${hpPct}%`;

            d.battleEssenceName.textContent = ap.getEssenceQualityName();
            d.battleEssenceFill.className = `progress-fill ${ap.getEssenceCssClass()}`;

            if (!ap.isImmortal) {
                const curEss = Number(ap.currentEssence.toFixed(1));
                const maxCap = ap.aptitude.maxSeaPercent;
                d.battleEssenceText.textContent = `${curEss}% / ${maxCap}%`;
                d.battleEssenceCapMarker.style.left = `${maxCap}%`;
                d.battleEssenceCapMarker.classList.remove("hidden");
                d.battleEssenceFill.style.width = `${curEss}%`;
            } else {
                d.battleEssenceText.textContent = `${(ap.immortalEssence[ap.rank] || 0).toFixed(1)} viên`;
                d.battleEssenceCapMarker.classList.add("hidden");
                d.battleEssenceFill.style.width = "100%";
            }

            if (d.battleActiveBuffs) {
                d.battleActiveBuffs.innerHTML = pl.activeBuffs.map(b =>
                    `<div class="buff-badge">${b.icon} ${b.name} (${Math.ceil(b.duration)}s)</div>`
                ).join("");
            }

            if (this.game && this.game.activeStage) {
                const st = this.game.activeStage;
                d.battleStageTitle.textContent = `${st.icon} ${st.name}`;
                if (!st.bossSpawned) {
                    d.battleStageObjective.textContent = `Mục tiêu: Tiêu diệt ${st.kills}/${st.targetKills} ${st.mobName} (Hạ Tinh Anh tính +2) để dẫn dụ Thủ Lĩnh xuất hiện`;
                    const pct = Math.min(100, (st.kills / st.targetKills) * 100);
                    d.battleStageProgressFill.style.width = `${pct}%`;
                } else if (!st.bossDefeated) {
                    if (st.bossTotalCount > 1 && this.enemies && Array.isArray(this.enemies.beasts)) {
                        const activeBosses = this.enemies.beasts.filter(b => b.isStageBoss && !b.isDead);
                        const bossStatusStr = activeBosses.map(b => {
                            const bPct = Math.ceil((b.hp / Math.max(1, b.maxHp)) * 100);
                            const shText = b.shieldHp > 0 ? ` [🛡️Khiên]` : "";
                            return `${b.name.split(" (")[0]}: ${bPct}% HP${shText}`;
                        }).join(" | ");
                        d.battleStageObjective.innerHTML = `<strong style="color:#00e5ff">👑 ĐỘC CHIẾN SONG TÔN (Còn ${st.bossesRemaining}/${st.bossTotalCount}): ${bossStatusStr}</strong>`;
                    } else {
                        d.battleStageObjective.innerHTML = `<strong style="color:#ff6b6b">⚠️ THỦ LĨNH XUẤT HIỆN: Hãy trảm sát 【${st.bossName}】!</strong>`;
                    }
                    d.battleStageProgressFill.style.width = "100%";
                } else {
                    d.battleStageObjective.textContent = "🎉 Đã hoàn thành chinh phạt bản đồ!";
                }
            }

            this.updateQuickbars();
        }

        updateQuickbars() {
            if (!this.guSystem || !this.aperture || !this.dom.guQuickbar) return;

            const guSlots = this.dom.guQuickbar.querySelectorAll(".gu-slot");
            guSlots.forEach((slotEl, idx) => {
                const gu = this.guSystem.getEquippedGuAt(idx);
                const iconEl = slotEl.querySelector(".slot-icon");
                const costEl = slotEl.querySelector(".slot-cost");
                const cdOverlay = slotEl.querySelector(".cooldown-overlay");
                const noEssenceEl = slotEl.querySelector(".no-essence-overlay");

                if (!gu) {
                    iconEl.textContent = "";
                    costEl.textContent = "";
                    cdOverlay.style.height = "0%";
                    noEssenceEl.classList.add("hidden");
                    return;
                }

                iconEl.textContent = gu.icon;
                const costCalc = this.aperture.calculateEssenceCost(gu.essenceCost, gu.rank);
                costEl.textContent = costCalc.isImmortalCost ? `${costCalc.cost}T` : `${costCalc.cost}%`;

                const cdRem = this.combat ? this.combat.getGuCooldownRemaining(gu.instanceId) : 0;
                const cdPct = gu.cooldown > 0 ? Math.min(100, (cdRem / gu.cooldown) * 100) : 0;
                cdOverlay.style.height = `${cdPct}%`;

                const enough = this.aperture.hasEnoughEssence(gu.essenceCost, gu.rank);
                noEssenceEl.classList.toggle("hidden", enough);
            });

            const kSlots = this.dom.killerQuickbar.querySelectorAll(".killer-slot");
            kSlots.forEach((kSlotEl, idx) => {
                const move = this.guSystem.getEquippedKillerMoveAt(idx);
                const iconEl = kSlotEl.querySelector(".slot-icon");
                const costEl = kSlotEl.querySelector(".slot-cost");
                const cdOverlay = kSlotEl.querySelector(".cooldown-overlay");

                if (!move) {
                    iconEl.textContent = "";
                    costEl.textContent = "";
                    cdOverlay.style.height = "0%";
                    return;
                }

                iconEl.textContent = move.icon || "☯";
                costEl.textContent = move.moveRank >= 6 ? `${move.essenceCost}T` : `${move.essenceCost}%`;

                const cdRem = this.combat ? this.combat.getKillerMoveCooldownRemaining(move.id) : 0;
                const cdPct = move.cooldown > 0 ? Math.min(100, (cdRem / move.cooldown) * 100) : 0;
                cdOverlay.style.height = `${cdPct}%`;
            });
        }

        showStageVictoryModal(stage, rewardDetailsHtml) {
            const d = this.dom;
            if (!d.stageVictoryModal) return;
            d.stageResultTitle.textContent = `🎉 Chinh Phạt 【${stage.name}】 Thành Công!`;
            d.stageRewardSummary.innerHTML = rewardDetailsHtml;
            d.stageVictoryModal.classList.remove("hidden");
        }

        updateInteractionBanner(promptText) {
            if (!this.dom.interactionPrompt) return;
            if (promptText) {
                this.dom.interactionPrompt.innerHTML = promptText;
                this.dom.interactionPrompt.classList.remove("hidden");
            } else {
                this.dom.interactionPrompt.classList.add("hidden");
            }
        }

        updateKeybindLabels() {
            const hybridKeys = ["1/Q", "2", "3/R", "4/T", "5", "6", "7", "8/F"];
            const numberKeys = ["1", "2", "3", "4", "5", "6", "7", "8"];
            const labels = this.keybindMode === "numbers" ? numberKeys : hybridKeys;

            for (let i = 0; i < 8; i++) {
                const el = document.getElementById(`key-label-gu-${i}`);
                if (el) el.textContent = labels[i];
            }
        }
    }

    global.UIManager = UIManager;

})(window);