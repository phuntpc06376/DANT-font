import React, { useEffect, useState } from "react";
import { getAllSuppliers, createSupplier, updateSupplier, deleteSupplier,getSuppliersByProduct} from "../api/supplierApi"; // API bạn đã tạo
import Swal from "sweetalert2"; // Import SweetAlert2

export default function Suppliers() {
    const [suppliers, setSuppliers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [error, setError] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [formType, setFormType] = useState(""); // "add" hoặc "edit"
    const [selectedSupplier, setSelectedSupplier] = useState(null);

    // Lấy danh sách nhà cung cấp từ API
    useEffect(() => {
        const fetchSuppliers = async () => {
            try {
                const data = await getSuppliersByProduct();
                console.log(data);
                setSuppliers(data);
            } catch (error) {
                setError("Không thể tải danh sách nhà cung cấp.");
                console.error("Error fetching suppliers:", error);
            }
        };

        fetchSuppliers();
    }, []);

    // Hàm xóa nhà cung cấp
    const deleteSupplierHandler = async (id) => {
        const result = await Swal.fire({
            title: "Bạn có chắc muốn xoá nhà cung cấp này?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Xoá",
            cancelButtonText: "Hủy",
        });

        if (result.isConfirmed) {
            try {
                await deleteSupplier(id);
                setSuppliers(suppliers.filter((supplier) => supplier.id !== id));
                Swal.fire("Đã xóa!", "Nhà cung cấp đã được xóa.", "success");
            } catch (error) {
                setError("Không thể xóa nhà cung cấp.");
                console.error("Error deleting supplier:", error);
                Swal.fire("Lỗi", "Không thể xóa nhà cung cấp.", "error");
            }
        }
    };

    // Hiển thị form thêm nhà cung cấp
    const handleAddSupplier = () => {
        setSelectedSupplier(null);
        setFormType("add");
        setShowForm(true);
    };

    // Hiển thị form cập nhật nhà cung cấp
    const handleEditSupplier = (supplier) => {
        setSelectedSupplier(supplier);
        setFormType("edit");
        setShowForm(true);
    };

    // Lọc nhà cung cấp theo tên
    const filteredSuppliers = suppliers.filter((supplier) =>
        supplier.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="container">
            <h2 className="mb-4 text-center">Danh sách Nhà Cung Cấp</h2>
            {error && <div className="alert alert-danger">{error}</div>}
    
            <div className="row mb-3">
                <div className="col-md-8">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Nhập tên nhà cung cấp để tìm..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="col-md-4 text-end">
                    <button className="btn btn-primary" onClick={handleAddSupplier}>
                        <i className="bi bi-plus-circle me-2"></i>Thêm nhà cung cấp
                    </button>
                </div>
            </div>
    
            {showForm ? (
                <SupplierForm
                    formType={formType}
                    supplier={selectedSupplier}
                    onClose={() => setShowForm(false)}
                    onRefresh={setSuppliers}
                />
            ) : (
                <div className="table-responsive">
                    <table className="table table-striped table-bordered">
                        <thead className="table-dark">
                            <tr>
                                <th scope="col">Tên nhà cung cấp</th>
                                <th scope="col">Địa chỉ</th>
                                <th scope="col">Số điện thoại</th>
                                <th scope="col" className="text-center">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSuppliers.length > 0 ? (
                                filteredSuppliers.map((supplier) => (
                                    <tr key={supplier.id}>
                                        <td>{supplier.name}</td>
                                        <td>{supplier.address}</td>
                                        <td>{supplier.phone}</td>
                                        <td className="text-center">
                                            <button
                                                onClick={() => handleEditSupplier(supplier)}
                                                className="btn btn-sm btn-warning me-2"
                                            >
                                                <i className="bi bi-pencil"></i> Sửa
                                            </button>
                                            <button
                                                onClick={() => deleteSupplierHandler(supplier.id)}
                                                className="btn btn-sm btn-danger"
                                            >
                                                <i className="bi bi-trash"></i> Xoá
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="text-center">
                                        Không tìm thấy nhà cung cấp.
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

function SupplierForm({ formType, supplier, onClose, onRefresh }) {
    const [formData, setFormData] = useState({
        name: supplier?.name || "",
        address: supplier?.address || "",
        phone: supplier?.phone || "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        // Kiểm tra các trường trống
        if (!formData.name || !formData.address || !formData.phone) {
            Swal.fire("Lỗi", "Tất cả các trường đều phải được điền đầy đủ!", "error");
            return;
        }
    
        // Kiểm tra số điện thoại hợp lệ (phải bắt đầu bằng 0 và có 10 hoặc 11 chữ số)
        const phoneRegex = /^0[0-9]{9,10}$/; // Số điện thoại bắt đầu với '0' và có 10 hoặc 11 chữ số
        if (!phoneRegex.test(formData.phone)) {
            Swal.fire("Lỗi", "Số điện thoại phải bắt đầu bằng '0' và có 10 hoặc 11 chữ số!", "error");
            return;
        }
    
        const supplierData = { ...formData };
    
        try {
            let supplierResponse;
            if (formType === "add") {
                supplierResponse = await createSupplier(supplierData);
                Swal.fire("Thành công", "Nhà cung cấp đã được thêm!", "success");
                onRefresh((prev) => [supplierResponse, ...prev]);
            } else {
                supplierResponse = await updateSupplier(supplier.id, supplierData);
                Swal.fire("Thành công", "Nhà cung cấp đã được cập nhật!", "success");
                onRefresh((prev) =>
                    prev.map((sup) => (sup.id === supplier.id ? supplierResponse : sup))
                );
            }
            onClose();
        } catch (error) {
            console.error("Lỗi:", error);
            Swal.fire("Lỗi", "Có lỗi xảy ra khi lưu nhà cung cấp.", "error");
        }
    };
    

    return (
        <div className="modal d-block" style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}>
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">{formType === "add" ? "Thêm Nhà Cung Cấp" : "Cập Nhật Nhà Cung Cấp"}</h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Tên nhà cung cấp</label>
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
                                <label>Địa chỉ</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Số điện thoại</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="phone"
                                    value={formData.phone}
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
                                {formType === "add" ? "Thêm" : "Cập Nhật"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
