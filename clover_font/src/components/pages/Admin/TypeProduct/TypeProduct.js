import React, { useEffect, useState } from "react";
import { getAllTypeProduct,
     createTypeProduct, 
     updateTypeProduct, 
     deleteTypeProduct 
} from "../api/typeProduct";
import Swal from "sweetalert2";

export default function TypeProduct() {
    const [typeProducts, setTypeProduct] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [error, setError] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [formType, setFormType] = useState(""); // "add" hoặc "edit"
    const [selectedTypeProduct, setSelectedTypeProduct] = useState(null);

     // Lấy danh sách khuyến mãi từ API
     useEffect(() => {
        const fetchTypeProducts = async () => {
            try {
                const data = await getAllTypeProduct();
                console.log(data);
                // const validData = data.filter((item) => item && item.name); // Lọc bỏ phần tử không hợp lệ
                // console.log(validData);
                setTypeProduct(data);
            } catch (error) {
                setError("Không thể tải danh sách loại sản phẩm.");
                console.error("Error fetching typeProduct:", error);
            }
        };

        fetchTypeProducts();
    }, []);

    // Hàm xóa loại sản phẩm
    const deleteTypeProductHandler = async (id) => {
        const result = await Swal.fire({
            title: "Bạn có chắc muốn xoá loại sản phẩm này?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Xoá",
            cancelButtonText: "Hủy",
        });

        if (result.isConfirmed) {
            try {
                await deleteTypeProduct(id);
                setTypeProduct(typeProducts.filter((typeProduct) => typeProduct.id !== id));
                Swal.fire("Đã xóa!", "Loại sản phẩm đã được xóa.", "success");
            } catch (error) {
                setError("Không thể xóa loại sản phẩm .");
                console.error("Error deleting promotion:", error);
                Swal.fire("Lỗi", "Không thể xóa loại sản phẩm.", "error");
            }
        }
    };

    // Hiển thị form thêm loại sản phẩm
    const handleAddTypeProduct = () => {
        setSelectedTypeProduct(null);
        setFormType("add");
        setShowForm(true);
    };

    // Hiển thị form cập nhật loại sản phẩm 
    const handleEditTypeProduct= (typeProduct) => {
        setSelectedTypeProduct(typeProduct);
        setFormType("edit");
        setShowForm(true);
    };

    // Lọc khuyến mãi theo tên
    const filteredTypeProducts = typeProducts.filter((typeProduct) =>
            typeProduct.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="container">
            <h2 className="mb-4 text-center">Danh sách loại sản phẩm</h2>
            <div className="row mb-3">
                <div className="col-md-8">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Nhập tên loại sản phẩm..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="col-md-4 text-end">
                    <button className="btn btn-primary" onClick={handleAddTypeProduct}>
                        <i className="bi bi-plus-circle me-2"></i>Thêm loại sản phẩm
                    </button>
                </div>
            </div>
    
            {showForm ? (
                <TypeProductForm
                    formType={formType}
                    typeProduct={selectedTypeProduct}
                    typeProducts={typeProducts}
                    onClose={() => setShowForm(false)}
                    onRefresh={setTypeProduct}
                />
            ) : (
                <div className="table-responsive">
                    <table className="table table-striped table-bordered">
                        <thead className="table-dark">
                            <tr>
                                <th scope="col">Tên loại</th>
                                <th scope="col" className="text-center">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTypeProducts.length > 0 ? (
                                filteredTypeProducts.map((typeProduct) => (
                                    <tr key={typeProduct.id}>
                                        <td>{typeProduct.name}</td>
                                        <td className="text-center">
                                            <button
                                                onClick={() => handleEditTypeProduct(typeProduct)}
                                                className="btn btn-sm btn-warning me-2"
                                            >
                                                <i className="bi bi-pencil"></i> Sửa
                                            </button>
                                            <button
                                                onClick={() => deleteTypeProductHandler(typeProduct.id)}
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
                                        Không tìm thấy loại sản phẩm.
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

function TypeProductForm({ formType, typeProduct, typeProducts, onClose, onRefresh}) {
    const [formData, setFormData] = useState({
        name: typeProduct?.name || "",       
    });

    // Hàm xử lý thay đổi giá trị trong form
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // Hàm xử lý submit form
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Kiểm tra các trường trống hoặc không hợp lệ
        if (!formData.name) {
            Swal.fire("Lỗi", "Tên loại sản phẩm không được trống!", "error");
            return;
        }

        if (formData.name.length <= 3) {
            Swal.fire("Lỗi", "Tên loại sản phẩm không được nhỏ hơn hoặc bằng 3 ký tự!", "error");
            return;
        }

        // Kiểm tra trùng tên (case-insensitive)
        const checkNameTypeProduct = typeProducts.some(
            (typeProd) =>
                typeProd.name.toLowerCase() === formData.name.toLowerCase() &&
                (formType === "add" || typeProd.id !== typeProduct.id) // Chỉ kiểm tra các mục khác với mục hiện tại khi đang sửa
        );

        if (checkNameTypeProduct) {
            Swal.fire("Lỗi", "Tên loại sản phẩm đã tồn tại!", "error");
            return;
        }
        const typeProductData = {
            ...formData,
        };

        try {
            let typeProductResponse;
            if (formType === "add") {
                typeProductResponse = await createTypeProduct(typeProductData);
                Swal.fire("Thành công", "Loại sản phẩm đã được thêm!", "success");
                // Cập nhật danh sách khuyến mãi sau khi thêm thành công
                onRefresh((prev) => [typeProductResponse, ...prev]); // Thêm khuyến mãi mới vào đầu danh sách
            } else {
                typeProductResponse = await updateTypeProduct(typeProduct.id, typeProductData);
                Swal.fire("Thành công", "Loại sản phẩm đã được cập nhật!", "success");
                // Cập nhật danh sách sau khi sửa
                onRefresh((prev) =>
                    prev.map((typeProd) => (typeProd.id === typeProduct.id ? typeProductResponse : typeProd))
                );
            }

            onClose(); // Đóng form
        } catch (error) {
            console.error("Lỗi:", error);
            Swal.fire("Lỗi", "Có lỗi xảy ra khi lưu loại sản phẩm.", "error");
        }
    };

    return (
        <div className="modal d-block" style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}>
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">{formType === "add" ? "Thêm loại sản phẩm" : "Cập nhật loại sản phẩm"}</h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Tên loại sản phẩm</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="name"
                                    value={formData.name}
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
                                {formType === "add" ? "Thêm loại sản phẩm" : "Cập nhật loại sản phẩm"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}