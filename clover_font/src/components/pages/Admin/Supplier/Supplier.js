import React, { useEffect, useState } from 'react';
import { getAllSuppliers, browseSupplier, deleteSupplier } from '../api/supplierApi';
import Swal from 'sweetalert2';

const SupplierList = () => {
    const [suppliers, setSuppliers] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10; // Số lượng items trên mỗi trang

    useEffect(() => {
        const fetchSuppliers = async () => {
            const data = await getAllSuppliers();
            setSuppliers(data);
        };

        fetchSuppliers();
    }, []);

    // Tính toán các phần tử hiển thị theo trang hiện tại
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentSuppliers = suppliers.slice(indexOfFirstItem, indexOfLastItem);

    // Tổng số trang
    const totalPages = Math.ceil(suppliers.length / itemsPerPage);

    // Hàm để chuyển sang trang tiếp theo
    const nextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    // Hàm để chuyển về trang trước đó
    const prevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleBrowse = async (id) => {
        const supplierData = { status: true };
        try {
            await browseSupplier(id, supplierData);
            const data = await getAllSuppliers();
            setSuppliers(data);
            Swal.fire('Duyệt thành công!', 'Nhà cung cấp đã được duyệt.', 'success');
        } catch (error) {
            Swal.fire('Có lỗi xảy ra!', 'Vui lòng thử lại sau.', 'error');
        }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Bạn có chắc chắn?',
            text: "Bạn sẽ không thể khôi phục nhà cung cấp này!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Có, xóa!',
            cancelButtonText: 'Không, giữ lại!'
        });

        if (result.isConfirmed) {
            try {
                await deleteSupplier(id);
                const data = await getAllSuppliers();
                setSuppliers(data);
                Swal.fire('Đã xóa!', 'Nhà cung cấp đã được xóa.', 'success');
            } catch (error) {
                Swal.fire('Có lỗi xảy ra!', 'Không thể xóa nhà cung cấp.', 'error');
            }
        }
    };

    return (
        <div>
            <h1>Danh Sách Nhà Cung Cấp</h1>
            <table className="table table-striped table-hover mt-3">
                <thead className="table-dark">
                    <tr>
                        <th>Tên</th>
                        <th>Địa chỉ</th>
                        <th>Số điện thoại</th>
                        <th>Trạng thái</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {currentSuppliers.map((supplier) => (
                        <tr key={supplier.id}>
                            <td>{supplier.name}</td>
                            <td>{supplier.address}</td>
                            <td>{supplier.phone}</td>
                            <td>{supplier.status ? "Đã duyệt" : "Chờ duyệt"}</td>
                            <td>
                                {supplier.status === false && (
                                    <button className="btn btn-success btn-sm me-2" onClick={() => handleBrowse(supplier.id)}>Duyệt</button>
                                )}
                                <button className="btn btn-danger btn-sm me-2" onClick={() => handleDelete(supplier.id)}>Xóa</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Pagination */}
            <div className="d-flex justify-content-between">
                <button
                    className="btn btn-secondary"
                    onClick={prevPage}
                    disabled={currentPage === 1} // Vô hiệu hóa nút nếu đang ở trang đầu
                >
                    Trang trước
                </button>
                <span>Trang {currentPage} / {totalPages}</span>
                <button
                    className="btn btn-secondary"
                    onClick={nextPage}
                    disabled={currentPage === totalPages} // Vô hiệu hóa nút nếu đang ở trang cuối
                >
                    Tiếp theo
                </button>
            </div>
        </div>
    );
};

export default SupplierList;
