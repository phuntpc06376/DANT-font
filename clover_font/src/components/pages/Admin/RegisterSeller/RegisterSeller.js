import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { getAllAccountsRegisterSeller, censorRegisterSeller } from '../api/accountApi';
import './RegisterSeller.css';
export default function RegisterSeller() {
    const [accountRegisters, setAccountRegister] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchAccountRegisterSellers = async () => {
            setLoading(true);
            try {
                const data = await getAllAccountsRegisterSeller(); // Lấy hóa đơn theo shop
                setAccountRegister(data);
            } catch (error) {
                Swal.fire('Lỗi', 'Không thể lấy danh sách tài khoản đăng ký người bán', 'error');
            } finally {
                setLoading(false);
            }
        };

        fetchAccountRegisterSellers();
    }, []);

    const handleConfirm = async (id) => {
        try {
            const response = await censorRegisterSeller(id);

            if (response) {
                Swal.fire('Xác nhận thành công', 'Đã xác nhận thành người bán!', 'success');
                setAccountRegister((prev) => prev.filter((account) => account.id !== id));
            } else {
                throw new Error(response.message || 'Không thể xác nhận');
            }
        } catch (error) {
            console.error('Lỗi khi xác nhận:', error);
            Swal.fire('Lỗi', error.message, 'error');
        }
    };

    const filteredAccountRegister = accountRegisters.filter((account) =>
        account.fullname.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="product-registration-container">
            <h2 className="mb-4 text-center">Danh sách tài khoản đăng ký người bán</h2>
            <div className="row mb-3">
                <div className="col-md-8">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Nhập tên "
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {loading ? (
                <div className="text-center">Đang tải...</div>
            ) : (
                <div className="product-list-container">
                    <table className="table">
                        <thead className="thead">
                            <tr>
                                <th scope="col">ID</th>
                                <th scope="col">Họ tên</th>
                                <th scope="col">Email</th>
                                <th scope="col">Tên cửa hàng</th>
                                <th scope="col">Điện thoại</th>
                                <th scope="col">Địa chỉ</th>
                                <th scope="col" className="text-center">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAccountRegister.length > 0 ? (
                                filteredAccountRegister.map((account) => (
                                    <tr key={account.id}>
                                        <td>{account.id}</td>
                                        <td>{account.fullname}</td>
                                        <td>{account.email}</td>
                                        <td>{account?.shop?.name}</td>
                                        <td>{account?.shop?.phone}</td>
                                        <td>{account?.shop?.address}</td>
                                        <td className="text-center">
                                            <button
                                                onClick={() => handleConfirm(account.id)}
                                                className="btn btn-sm btn-success me-2"
                                            >
                                                <i className="bi bi-check-circle"></i> Xác nhận
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="text-center">
                                        Không tìm thấy tài khoản.
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
