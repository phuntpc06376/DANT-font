import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import BillService from '../api/billApi'; // Đảm bảo đúng đường dẫn

export default function Bills() {
    const [bills, setBills] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);

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

    const filteredBills = bills.filter((bill) => {
        const fullname = bill.fullname || ''; // Đảm bảo không bị lỗi khi fullname là null
        return fullname.toLowerCase().includes(searchTerm.toLowerCase());
    });

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
                                <th scope="col">ID</th>
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
                            {filteredBills.length > 0 ? (
                                filteredBills.map((bill) => (
                                    <tr key={bill.id}>
                                        <td>{bill.id}</td>
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
                                        </td>
                                    </tr>
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
                </div>
            )}
        </div>
    );
}
