import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    getAllPromotionsByShop,
    createPromotion,
    updatePromotion,
    deletePromotion,
} from "../api/promotionsApi"; // Import API bạn đã tạo
import Swal from "sweetalert2"; // Import SweetAlert2

export default function Promotions() {
    const [promotions, setPromotions] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [error, setError] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [formType, setFormType] = useState(""); // "add" hoặc "edit"
    const [selectedPromotion, setSelectedPromotion] = useState(null);

    // Lấy danh sách khuyến mãi từ API
    useEffect(() => {
        const fetchPromotions = async () => {
            try {
                const data = await getAllPromotionsByShop();
                console.log(data);
                setPromotions(data);
            } catch (error) {
                setError("Không thể tải danh sách khuyến mãi.");
                console.error("Error fetching promotions:", error);
            }
        };

        fetchPromotions();
    }, []);

    // Hàm xóa khuyến mãi
    const deletePromotionHandler = async (id) => {
        const result = await Swal.fire({
            title: "Bạn có chắc muốn xoá chương trình khuyến mãi này?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Xoá",
            cancelButtonText: "Hủy",
        });

        if (result.isConfirmed) {
            try {
                await deletePromotion(id);
                setPromotions(promotions.filter((promotion) => promotion.id !== id));
                Swal.fire("Đã xóa!", "Chương trình khuyến mãi đã được xóa.", "success");
            } catch (error) {
                setError("Không thể xóa chương trình khuyến mãi.");
                console.error("Error deleting promotion:", error);
                Swal.fire("Lỗi", "Không thể xóa chương trình khuyến mãi.", "error");
            }
        }
    };

    // Hiển thị form thêm khuyến mãi
    const handleAddPromotion = () => {
        setSelectedPromotion(null);
        setFormType("add");
        setShowForm(true);
    };

    // Hiển thị form cập nhật khuyến mãi
    const handleEditPromotion = (promotion) => {
        setSelectedPromotion(promotion);
        setFormType("edit");
        setShowForm(true);
    };

    // Lọc khuyến mãi theo tên
    const filteredPromotions = promotions.filter((promotion) =>
        promotion.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="container">
            <h2 className="mb-4 text-center">Danh sách Khuyến mãi</h2>
            <div className="row mb-3">
                <div className="col-md-8">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Nhập tên khuyến mãi để tìm..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="col-md-4 text-end">
                    <button className="btn btn-primary" onClick={handleAddPromotion}>
                        <i className="bi bi-plus-circle me-2"></i>Thêm khuyến mãi
                    </button>
                </div>
            </div>

            {showForm ? (
                <PromotionForm
                    formType={formType}
                    promotion={selectedPromotion}
                    onClose={() => setShowForm(false)}
                    onRefresh={setPromotions}
                />
            ) : (
                <div className="table-responsive">
                    <table className="table table-striped table-bordered">
                        <thead className="table-dark">
                            <tr>
                                <th scope="col">Tên khuyến mãi</th>
                                <th scope="col">Giảm giá (%)</th>
                                <th scope="col">Ngày bắt đầu</th>
                                <th scope="col">Ngày kết thúc</th>
                                <th scope="col" className="text-center">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPromotions.length > 0 ? (
                                filteredPromotions.map((promotion) => (
                                    <tr key={promotion.id}>
                                        <td>{promotion.name}</td>
                                        <td>{promotion.percentDiscount}%</td>
                                        <td>
                                            {promotion.startDay ?
                                                new Intl.DateTimeFormat('vi-VN', {
                                                    year: 'numeric',
                                                    month: '2-digit',
                                                    day: '2-digit',
                                                }).format(new Date(promotion.startDay)) :
                                                "Ngày không hợp lệ"
                                            }
                                        </td>
                                        <td>
                                            {promotion.endDay ?
                                                new Intl.DateTimeFormat('vi-VN', {
                                                    year: 'numeric',
                                                    month: '2-digit',
                                                    day: '2-digit',
                                                }).format(new Date(promotion.endDay)) :
                                                "Ngày không hợp lệ"
                                            }
                                        </td>
                                        <td className="text-center">
                                            <button
                                                onClick={() => handleEditPromotion(promotion)}
                                                className="btn btn-sm btn-warning me-2"
                                            >
                                                <i className="bi bi-pencil"></i> Sửa
                                            </button>
                                            <button
                                                onClick={() => deletePromotionHandler(promotion.id)}
                                                className="btn btn-sm btn-danger"
                                            >
                                                <i className="bi bi-trash"></i> Xoá
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="text-center">
                                        Không tìm thấy khuyến mãi.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );

}

function PromotionForm({ formType, promotion, onClose, onRefresh }) {
    const [formData, setFormData] = useState({
        name: promotion?.name || "",
        percentDiscount: promotion?.percentDiscount || "",
        startDay: promotion?.startDay || "",
        endDay: promotion?.endDay || "",
    });

    // Hàm xử lý thay đổi giá trị trong form
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // Hàm chuyển đổi giá trị datetime-local thành ISO string
    const getInstant = (datetimeLocal) => {
        if (!datetimeLocal) {
            throw new Error("Không có giá trị datetimeLocal để xử lý.");
        }
        const date = new Date(datetimeLocal);
        return date.toISOString();
    };

    // Hàm xử lý submit form
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Kiểm tra các trường trống hoặc không hợp lệ
        if (!formData.name) {
            Swal.fire("Lỗi", "Tên khuyến mãi không được trống!", "error");
            return;
        }

        const percentDiscount = parseFloat(formData.percentDiscount);

        if (isNaN(percentDiscount) || percentDiscount <= 0 || percentDiscount >= 50) {
            Swal.fire("Lỗi", "Phần trăm giảm giá phải là một số hợp lệ, lớn hơn 0 và nhỏ hơn 50!", "error");
            return;
        }


        if (!formData.startDay) {
            Swal.fire("Lỗi", "Ngày bắt đầu không được trống!", "error");
            return;
        }

        if (!formData.endDay) {
            Swal.fire("Lỗi", "Ngày kết thúc không được trống!", "error");
            return;
        }

        const startInstant = getInstant(formData.startDay);
        const endInstant = getInstant(formData.endDay);

        // Kiểm tra ngày bắt đầu phải là hôm nay hoặc muộn hơn
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Đặt lại giờ, phút, giây để so sánh chỉ ngày
        if (new Date(startInstant) < today) {
            Swal.fire("Lỗi", "Ngày bắt đầu phải là hôm nay hoặc muộn hơn!", "error");
            return;
        }

        // Kiểm tra ngày kết thúc phải sau ngày bắt đầu
        if (new Date(startInstant) >= new Date(endInstant)) {
            Swal.fire("Lỗi", "Ngày kết thúc phải sau ngày bắt đầu!", "error");
            return;
        }

        const promotionData = {
            ...formData,
            startDay: startInstant,
            endDay: endInstant,
        };

        try {
            let promotionResponse;
            if (formType === "add") {
                promotionResponse = await createPromotion(promotionData);
                Swal.fire("Thành công", "Khuyến mãi đã được thêm!", "success");
                // Cập nhật danh sách khuyến mãi sau khi thêm thành công
                onRefresh((prev) => [promotionResponse, ...prev]); // Thêm khuyến mãi mới vào đầu danh sách
            } else {
                promotionResponse = await updatePromotion(promotion.id, promotionData);
                Swal.fire("Thành công", "Khuyến mãi đã được cập nhật!", "success");
                // Cập nhật danh sách sau khi sửa
                onRefresh((prev) =>
                    prev.map((promo) => (promo.id === promotion.id ? promotionResponse : promo))
                );
            }

            onClose(); // Đóng form
        } catch (error) {
            console.error("Lỗi:", error);
            Swal.fire("Lỗi", "Có lỗi xảy ra khi lưu khuyến mãi.", "error");
        }
    };



    return (
        <div className="modal d-block" style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}>
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">{formType === "add" ? "Thêm Khuyến Mãi" : "Cập Nhật Khuyến Mãi"}</h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Tên khuyến mãi</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Giảm giá (%)</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    name="percentDiscount"
                                    value={formData.percentDiscount}
                                    onChange={handleChange}
                                    required
                                    min={1}
                                    max={50}
                                />
                            </div>
                            <div className="form-group">
                                <label>Ngày bắt đầu</label>
                                <input
                                    type="datetime-local"
                                    className="form-control"
                                    name="startDay"
                                    value={formData.startDay}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Ngày kết thúc</label>
                                <input
                                    type="datetime-local"
                                    className="form-control"
                                    name="endDay"
                                    value={formData.endDay}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={onClose}>
                                Hủy
                            </button>
                            <button type="submit" className="btn btn-primary">
                                {formType === "add" ? "Thêm khuyến mãi" : "Cập nhật khuyến mãi"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
