import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    getAllPromotionsByShop,
    createPromotion,
    updatePromotion,
    deletePromotion,
} from "../api/promotionsApi"; // Import API bạn đã tạo
import Swal from "sweetalert2"; // Import SweetAlert2
import ReactPaginate from 'react-paginate'; // Import thư viện phân trang
import './Promotions.css';
export default function Promotions() {
    const [promotions, setPromotions] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [error, setError] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [formType, setFormType] = useState(""); // "add" hoặc "edit"
    const [selectedPromotion, setSelectedPromotion] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const itemsPerPage = 5; // Số lượng mục hiển thị trên mỗi trang

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

    // Tính toán phần tử hiển thị cho trang hiện tại
    const pageCount = Math.ceil(filteredPromotions.length / itemsPerPage);
    const currentPromotions = filteredPromotions.slice(
        currentPage * itemsPerPage,
        (currentPage + 1) * itemsPerPage
    );

    // Hàm xử lý phân trang
    const handlePageClick = (event) => {
        setCurrentPage(event.selected);
    };

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
                            {currentPromotions.length > 0 ? (
                                currentPromotions.map((promotion) => (
                                    <tr key={promotion.id}>
                                        <td>{promotion.name}</td>
                                        <td>{promotion.percentDiscount}%</td>
                                        <td>
                                            {promotion.startDay ?
                                                new Intl.DateTimeFormat('vi-VN', {
                                                    year: 'numeric',
                                                    month: '2-digit',
                                                    day: '2-digit',
                                                }).format(new Date(promotion.startDay)) : "Ngày không hợp lệ"}
                                        </td>
                                        <td>
                                            {promotion.endDay ?
                                                new Intl.DateTimeFormat('vi-VN', {
                                                    year: 'numeric',
                                                    month: '2-digit',
                                                    day: '2-digit',
                                                }).format(new Date(promotion.endDay)) : "Ngày không hợp lệ"}
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
                    {/* Phân trang */}
                    <div className="d-flex justify-content-center mt-3">
                        <ReactPaginate
                            previousLabel={"Trang trước"}
                            nextLabel={"Tiếp theo"}
                            breakLabel={"..."} // Thêm dấu ba chấm
                            pageCount={pageCount}
                            onPageChange={handlePageClick}
                            containerClassName={"pagination"}
                            pageClassName={"page-item"}
                            pageLinkClassName={"page-link"}
                            previousClassName={"page-item"}
                            previousLinkClassName={"page-link"}
                            nextClassName={"page-item"}
                            nextLinkClassName={"page-link"}
                            activeClassName={"active"}
                        />

                    </div>
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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const getInstant = (datetimeLocal) => {
        if (!datetimeLocal) {
            throw new Error("Không có giá trị datetimeLocal để xử lý.");
        }
        const date = new Date(datetimeLocal);
        return date.toISOString();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

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

        try {
            const promotionData = {
                name: formData.name,
                percentDiscount,
                startDay: getInstant(formData.startDay),
                endDay: getInstant(formData.endDay),
            };

            if (formType === "edit") {
                // Gọi API sửa khuyến mãi
                await updatePromotion(promotion.id, promotionData);
                Swal.fire("Thành công", "Khuyến mãi đã được cập nhật.", "success");
            } else {
                // Gọi API thêm khuyến mãi mới
                await createPromotion(promotionData);
                Swal.fire("Thành công", "Khuyến mãi đã được thêm.", "success");
            }
            onRefresh();
            onClose();
        } catch (error) {
            console.error("Error submitting promotion:", error);
            Swal.fire("Lỗi", "Có lỗi xảy ra khi lưu dữ liệu!", "error");
        }
    };

    return (
        <div className="modal show d-block" tabindex="-1">
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">{formType === "add" ? "Thêm khuyến mãi" : "Cập nhật khuyến mãi"}</h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>
                    <div className="modal-body">
                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label htmlFor="name" className="form-label">Tên khuyến mãi</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="percentDiscount" className="form-label">Giảm giá (%)</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    id="percentDiscount"
                                    name="percentDiscount"
                                    value={formData.percentDiscount}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="startDay" className="form-label">Ngày bắt đầu</label>
                                <input
                                    type="datetime-local"
                                    className="form-control"
                                    id="startDay"
                                    name="startDay"
                                    value={formData.startDay}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="endDay" className="form-label">Ngày kết thúc</label>
                                <input
                                    type="datetime-local"
                                    className="form-control"
                                    id="endDay"
                                    name="endDay"
                                    value={formData.endDay}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={onClose}>
                                    Đóng
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {formType === "add" ? "Thêm" : "Cập nhật"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
