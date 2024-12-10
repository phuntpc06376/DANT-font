import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import BillService from '../api/billApi'; // Đảm bảo đúng đường dẫn
import ReactPaginate from 'react-paginate';

export default function Bills() {
    const [bills, setBills] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [expandedBillId, setExpandedBillId] = useState(null); // Lưu ID hóa đơn đang mở rộng
    const [detailBills, setDetailBill] = useState([]); // Lưu sản phẩm của hóa đơn được mở rộng

    const [currentPage, setCurrentPage] = useState(0); // Trang hiện tại
    const itemsPerPage = 5; // Số lượng hóa đơn mỗi trang

    useEffect(() => {
        const fetchBills = async () => {
            setLoading(true);
            try {
                const data = await BillService.getBillsByShop(); // Lấy hóa đơn theo shop
                setBills(data);
            } catch (error) {
                Swal.fire('Lỗi', 'Không thể lấy danh sách hóa đơn', 'error');
            } finally {
                setLoading(false);
            }
        };

        fetchBills();
    }, []);

    const handleConfirmBill = async (id) => {
        try {
            const updatedBill = await BillService.confirmBill(id);
            Swal.fire('Xác nhận thành công', 'Hóa đơn đã được xác nhận!', 'success');
            setBills((prevBills) =>
                prevBills.map((bill) =>
                    bill.id === id ? { ...bill, status: updatedBill.status } : bill
                )
            );
        } catch (error) {
            Swal.fire('Lỗi', 'Không thể xác nhận hóa đơn', 'error');
        }
    };

    const handleCancelBill = async (id) => {
        try {
            await BillService.cancelBill(id);
            Swal.fire('Hủy thành công', 'Hóa đơn đã được hủy!', 'success');
            setBills((prevBills) => prevBills.filter((bill) => bill.id !== id));
        } catch (error) {
            Swal.fire('Lỗi', 'Không thể hủy hóa đơn', 'error');
        }
    };

    const handleToggleProducts = (billId) => {
        if (expandedBillId === billId) {
            setExpandedBillId(null);
            setDetailBill([]);
        } else {
            const selectedBill = bills.find((bill) => bill.id === billId);
            if (selectedBill && selectedBill.detailBills) {
                setDetailBill(selectedBill.detailBills);
            } else {
                Swal.fire('Thông báo', 'Không tìm thấy sản phẩm trong hóa đơn', 'info');
                setDetailBill([]);
            }
            setExpandedBillId(billId);
        }
    };

    const filteredBills = bills.filter((bill) => {
        const fullname = bill.fullname || '';
        return fullname.toLowerCase().includes(searchTerm.toLowerCase());
    });

    // Tính toán trang hiện tại và hóa đơn hiển thị
    const offset = currentPage * itemsPerPage;
    const currentBills = filteredBills.slice(offset, offset + itemsPerPage);

    // Hàm thay đổi trang
    const handlePageChange = (selectedPage) => {
        setCurrentPage(selectedPage.selected);
    };

    return (
        <div className="container">
            <h2 className="mb-4 text-center">Danh sách Hóa đơn</h2>
            <div className="row mb-3">
                <div className="col-md-8">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Tìm kiếm theo tên khách hàng"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {loading ? (
                <div className="text-center">Đang tải...</div>
            ) : (
                <div className="table-responsive">
                    <table className="table table-striped table-bordered">
                        <thead className="table-dark">
                            <tr>
                                <th scope="col">Tên khách hàng</th>
                                <th scope="col">Ngày mua</th>
                                <th scope="col">Email</th>
                                <th scope="col">Điện thoại</th>
                                <th scope="col">Tổng thanh toán</th>
                                <th scope="col">Phương thức thanh toán</th>
                                <th scope="col">Trạng thái</th>
                                <th scope="col" className="text-center">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentBills.length > 0 ? (
                                currentBills.map((bill) => (
                                    <React.Fragment key={bill.id}>
                                        <tr>
                                            <td>{bill.fullname}</td>
                                            <td>{bill.buyDay}</td>
                                            <td>{bill.email}</td>
                                            <td>{bill.phone}</td>
                                            <td>{bill.totalPayment}</td>
                                            <td>{bill.paymentMethods}</td>
                                            <td>{bill.status?.name}</td>
                                            <td className="text-center">
                                                {bill.status.id === 1 && (
                                                    <>
                                                        <button
                                                            onClick={() => handleConfirmBill(bill.id)}
                                                            className="btn btn-sm btn-success me-2"
                                                        >
                                                            <i className="bi bi-check-circle"></i> Xác nhận
                                                        </button>
                                                        <button
                                                            onClick={() => handleCancelBill(bill.id)}
                                                            className="btn btn-sm btn-danger"
                                                        >
                                                            <i className="bi bi-x-circle"></i> Hủy
                                                        </button>
                                                    </>
                                                )}
                                                <button
                                                    onClick={() => handleToggleProducts(bill.id)}
                                                    className="btn btn-sm btn-info"
                                                >
                                                    {expandedBillId === bill.id ? 'Đóng' : 'Xem sản phẩm'}
                                                </button>
                                            </td>
                                        </tr>
                                        {expandedBillId === bill.id && (
                                            <tr>
                                                <td colSpan="9">
                                                    <div className="table-responsive">
                                                        <table className="table table-sm table-bordered">
                                                            <thead>
                                                                <tr>
                                                                    <th>Tên sản phẩm</th>
                                                                    <th>Số lượng</th>
                                                                    <th>Giá</th>
                                                                    <th>Khuyến mãi</th>
                                                                    <th>Thành tiền</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {detailBills.length > 0 ? (
                                                                    detailBills.map((detailBill) => (
                                                                        <tr key={detailBill.id}>
                                                                            <td>{detailBill.prodName}</td>
                                                                            <td>{detailBill.quantity}</td>
                                                                            <td>{detailBill.price}</td>
                                                                            <td>{detailBill.percentDiscount}</td>
                                                                            <td>{detailBill.totalMoney}</td>
                                                                        </tr>
                                                                    ))
                                                                ) : (
                                                                    <tr>
                                                                        <td colSpan="4" className="text-center">
                                                                            Không có sản phẩm.
                                                                        </td>
                                                                    </tr>
                                                                )}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="9" className="text-center">
                                        Không tìm thấy hóa đơn.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    {/* Pagination */}
                    <ReactPaginate
                        pageCount={Math.ceil(filteredBills.length / itemsPerPage)}
                        previousLabel={"Trang trước"}
                        nextLabel={"Tiếp theo"}
                        breakLabel={"..."} // Thêm dấu ba chấm
                        onPageChange={handlePageChange}
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
            )}
        </div>
    );
}
