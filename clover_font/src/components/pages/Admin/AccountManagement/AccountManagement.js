import React, { useEffect, useState } from 'react';
import { getAllAccounts, createAccount, deleteAccount, updateAccount } from '../api/accountApi';
import { getAllRoles } from '../api/roleApi';
import 'bootstrap/dist/css/bootstrap.min.css';
import Swal from 'sweetalert2';
import './AccountManagement.css';

const AccountManagement = () => {
    const [activeTab, setActiveTab] = useState('form');
    const [allAccounts, setAllAccounts] = useState([]);
    const [filteredAccounts, setFilteredAccounts] = useState([]);
    const [newAccount, setNewAccount] = useState({
        fullname: '',
        email: '',
        gender: 'true',
        roleId: '',
        username: '',
        password: '',
        phone: '',
    });
    const [isEditing, setIsEditing] = useState(false);
    const [editingAccountId, setEditingAccountId] = useState(null);
    const [roles, setRoles] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    const [currentPage, setCurrentPage] = useState(1);
    const [accountsPerPage] = useState(5); // Số tài khoản trên mỗi trang

    // State để lưu thông báo lỗi
    const [errors, setErrors] = useState({});
    
    useEffect(() => {
        fetchAccounts();
        fetchRoles();
    }, []);

    const fetchAccounts = async () => {
        try {
            const data = await getAllAccounts();
            setAllAccounts(data);
            setFilteredAccounts(data);
        } catch (error) {
            console.error('Lỗi khi lấy danh sách tài khoản', error);
        }
    };

    const fetchRoles = async () => {
        try {
            const data = await getAllRoles();
            setRoles(data);
        } catch (error) {
            console.error('Lỗi khi lấy danh sách vai trò', error);
        }
    };

    // Hàm tìm kiếm tài khoản
    const handleSearch = (e) => {
        const value = e.target.value.toLowerCase();
        setSearchTerm(value);

        setFilteredAccounts(allAccounts.filter(account =>
            account.fullname.toLowerCase().includes(value) ||
            account.email.toLowerCase().includes(value) ||
            account.phone.toLowerCase().includes(value)
        ));
    };

    const validateForm = () => {
        const newErrors = {};

        // Kiểm tra trường username
        if (!newAccount.username) {
            newErrors.username = 'Tên đăng nhập không được để trống';
        } else if (newAccount.username.length < 5 || newAccount.username.length > 20) {
            newErrors.username = 'Tên đăng nhập tối thiểu phải có 5 - 20 ký tự';
        }
        
        // Kiểm tra trường password
        if (!newAccount.password) {
            newErrors.password = 'Mật khẩu không được để trống';
        } else if (newAccount.password.length !== 8) {
            newErrors.password = 'Mật khẩu phải có 8 ký tự';
        } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8}$/.test(newAccount.password)) {
            newErrors.password = 'Mật khẩu phải có ít nhất 1 chữ cái in hoa, 1 chữ cái in thường và 1 số';
        }

        // Kiểm tra trường fullname
        if (!newAccount.fullname) {
            newErrors.fullname = 'Họ và tên không được để trống';
        } else if (newAccount.fullname.length < 3 || newAccount.fullname.length > 50) {
            newErrors.fullname = 'Họ tên tối thiểu phải có 3 - 50 ký tự';
        }

        // Kiểm tra trường email
        if (!newAccount.email) {
            newErrors.email = 'Email không được để trống';
        } else if (!/\S+@\S+\.\S+/.test(newAccount.email)) {
            newErrors.email = 'Email không đúng định dạng';
        } else if (newAccount.email.length > 50) {
            newErrors.email = 'Email không được quá 50 ký tự';
        }

        // Kiểm tra trường phone
        if (!newAccount.phone) {
            newErrors.phone = 'Số điện thoại không được để trống';
        } else if (!/^(03|05|07|08|09|01[2|6|8|9])+([0-9]{8})$/.test(newAccount.phone)) {
            newErrors.phone = 'Sai định dạng số điện thoại';
        } else if (newAccount.phone.length !== 10) {
            newErrors.phone = 'Số điện thoại phải đủ 10 số';
        }

        // Kiểm tra trường roleId
        if (!newAccount.roleId) {
            newErrors.roleId = 'Vui lòng chọn vai trò';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0; // Trả về true nếu không có lỗi
    };


    const handleCreateOrUpdateAccount = async () => {
        if (!validateForm()) {
            return; // Nếu có lỗi, không tiếp tục
        }

        const accountData = {
            fullname: newAccount.fullname,
            email: newAccount.email,
            gender: newAccount.gender === "true",
            roleId: newAccount.roleId || null, // Sử dụng null nếu không có vai trò
            username: newAccount.username,
            password: newAccount.password,
            phone: newAccount.phone,
        };

        console.log('Dữ liệu tài khoản:', accountData); // Xem dữ liệu sẽ được gửi

        try {
            if (isEditing) {
                await updateAccount(editingAccountId, accountData);
                Swal.fire('Thành công!', 'Tài khoản đã được cập nhật.', 'success');
                setIsEditing(false);
                setEditingAccountId(null);
                setActiveTab('list');
            } else {
                await createAccount(accountData);
                Swal.fire('Thành công!', 'Tài khoản mới đã được tạo.', 'success');
                setActiveTab('list');
            }

            fetchAccounts();
            resetForm();
        } catch (error) {
            console.error('Lỗi khi lưu tài khoản', error);
            Swal.fire('Có lỗi xảy ra!', 'Không thể lưu tài khoản.', 'error');
        }
    };

    const handleDeleteAccount = async (id) => {
        const result = await Swal.fire({
            title: 'Bạn có chắc chắn?',
            text: "Bạn sẽ không thể khôi phục tài khoản này!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Có, xóa!',
            cancelButtonText: 'Không, giữ lại!'
        });

        if (result.isConfirmed) {
            try {
                await deleteAccount(id);
                fetchAccounts(); // Gọi lại fetchAccounts để cập nhật danh sách tài khoản
                Swal.fire('Đã xóa!', 'Tài khoản đã được xóa.', 'success');
            } catch (error) {
                console.error('Lỗi khi xóa tài khoản', error);
            }
        }
    };

    const handleEditAccount = (account) => {
        setNewAccount({
            fullname: account.fullname,
            email: account.email,
            gender: account.gender.toString(),
            roleId: account.role?.id || '',
            username: account.username,
            password: account.password,
            phone: account.phone
        });
        setIsEditing(true);
        setEditingAccountId(account.id);
        setActiveTab('form'); // Chuyển về tab "Thông tin tài khoản"
    };

    const resetForm = () => {
        setNewAccount({
            fullname: '',
            email: '',
            gender: 'true',
            roleId: '',
            username: '',
            password: '',
            phone: ''
        });
        setErrors({}); // Reset thông báo lỗi
    };

    const indexOfLastAccount = currentPage * accountsPerPage;
    const indexOfFirstAccount = indexOfLastAccount - accountsPerPage;
    const currentAccounts = filteredAccounts.slice(indexOfFirstAccount, indexOfLastAccount);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <div className="account-management-container">
            <h2 className="text-center mb-4">Quản lý người dùng</h2>
            <ul className="nav nav-tabs account-management-tabs">
                <li className="nav-item">
                    <button
                        className={`nav-link ${activeTab === 'form' ? 'active' : ''}`}
                        onClick={() => setActiveTab('form')}
                    >
                        Thông tin tài khoản
                    </button>
                </li>
                <li className="nav-item">
                    <button
                        className={`nav-link ${activeTab === 'list' ? 'active' : ''}`}
                        onClick={() => setActiveTab('list')}
                    >
                        Danh sách tài khoản
                    </button>
                </li>
            </ul>

            {activeTab === 'form' && (
                <div className="account-form-container" style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <h2 className="mb-3">{isEditing ? "Cập nhật Tài khoản" : "Tạo Tài khoản Mới"}</h2>

                    <div className="mb-3">
                        {isEditing ? (
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Tên đăng nhập"
                                value={newAccount.username}
                                onChange={(e) => setNewAccount({ ...newAccount, username: e.target.value })}
                                style={{ display: 'none' }} // Ẩn trường này khi sửa
                            />
                        ) : (
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Tên đăng nhập"
                                value={newAccount.username}
                                onChange={(e) => setNewAccount({ ...newAccount, username: e.target.value })}
                            />
                        )}
                        {errors.username && <div className="text-danger">{errors.username}</div>}
                    </div>

                    <div className="mb-3">
                        {isEditing ? (
                            <input
                                type="password"
                                className="form-control"
                                placeholder="Mật khẩu"
                                value={newAccount.password}
                                onChange={(e) => setNewAccount({ ...newAccount, password: e.target.value })}
                                style={{ display: 'none' }} // Ẩn trường này khi sửa
                            />
                        ) : (
                            <input
                                type="password"
                                className="form-control"
                                placeholder="Mật khẩu"
                                value={newAccount.password}
                                onChange={(e) => setNewAccount({ ...newAccount, password: e.target.value })}
                            />
                        )}
                        {errors.password && <div className="text-danger">{errors.password}</div>}
                    </div>

                    <div className="mb-3">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Họ và tên"
                            value={newAccount.fullname}
                            onChange={(e) => setNewAccount({ ...newAccount, fullname: e.target.value })}
                            disabled={isEditing}
                        />
                        {errors.fullname && <div className="text-danger">{errors.fullname}</div>}
                    </div>

                    <div className="mb-3">
                        <input
                            type="email"
                            className="form-control"
                            placeholder="Email"
                            value={newAccount.email}
                            onChange={(e) => setNewAccount({ ...newAccount, email: e.target.value })}
                            disabled={isEditing}
                        />
                        {errors.email && <div className="text-danger">{errors.email}</div>}
                    </div>

                    <div className="mb-3">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Số điện thoại"
                            value={newAccount.phone}
                            onChange={(e) => setNewAccount({ ...newAccount, phone: e.target.value })}
                            disabled={isEditing}
                        />
                        {errors.phone && <div className="text-danger">{errors.phone}</div>}
                    </div>

                    <div className="mb-3">
                        <select
                            className="form-select"
                            value={newAccount.roleId}
                            onChange={(e) => setNewAccount({ ...newAccount, roleId: e.target.value })}
                            disabled={isEditing}
                        >
                            <option value="">Chọn vai trò</option>
                            {roles.map(role => (
                                <option key={role.id} value={role.id}>{role.name}</option>
                            ))}

                        </select>

                        {errors.roleId && <div className="text-danger">{errors.roleId}</div>}
                    </div>

                    <div className="mb-3">
                        <label className="form-check-label">Giới tính:</label>
                        
                        <label>
                            <input
                                type="radio"
                                className="form-check-input"
                                value="true"
                                checked={newAccount.gender === 'true'}
                                onChange={(e) => setNewAccount({ ...newAccount, gender: e.target.value })}
                                disabled={isEditing}
                            />
                            Nam
                        </label>
                        <label>
                            <input
                                type="radio"
                                className="form-check-input"
                                value="false"
                                checked={newAccount.gender === 'false'}
                                onChange={(e) => setNewAccount({ ...newAccount, gender: e.target.value })}
                            />
                            Nữ
                        </label>
                    </div>

                    <button className="btn btn-primary" onClick={handleCreateOrUpdateAccount}>
                        {isEditing ? "Cập nhật" : "Tạo tài khoản"}
                    </button>
                    <button className="btn btn-secondary ms-2" onClick={resetForm}>
                        Làm mới
                    </button>
                </div>
            )}

            {activeTab === 'list' && (
                <div className="account-list-container">
                    <input
                        type="text"
                        className="form-control mb-3"
                        placeholder="Tìm kiếm tài khoản"
                        value={searchTerm}
                        onChange={handleSearch}
                    />

                    <table className="table table-striped table-hover mt-3">
                        <thead className="table-primary">
                            <tr>
                                <th>Tên đăng nhập</th>
                                <th>Họ và tên</th>
                                <th>Email</th>
                                <th>Số điện thoại</th>
                                <th>Vai trò</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentAccounts.map(account => (
                                <tr key={account.id}>
                                    <td>{account.username}</td>
                                    <td>{account.fullname}</td>
                                    <td>{account.email}</td>
                                    <td>{account.phone}</td>
                                    <td>{account.role?.name || 'Chưa xác định'}</td>
                                    <td>
                                        <button className="btn btn-warning me-1" onClick={() => handleEditAccount(account)}>Sửa</button>
                                        <button className="btn btn-danger" onClick={() => handleDeleteAccount(account.id)}>Xóa</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Pagination */}
                    <div className="account-pagination">
                        <button
                            className="btn btn-secondary"
                            onClick={() => paginate(currentPage - 1)}
                            disabled={currentPage === 1} // Vô hiệu hóa nút nếu đang ở trang đầu
                        >
                            Trang trước
                        </button>
                        <span>Trang {currentPage} / {Math.ceil(filteredAccounts.length / accountsPerPage)}</span>
                        <button
                            className="btn btn-secondary"
                            onClick={() => paginate(currentPage + 1)}
                            disabled={currentPage === Math.ceil(filteredAccounts.length / accountsPerPage)} // Vô hiệu hóa nút nếu đang ở trang cuối
                        >
                            Tiếp theo
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
};

export default AccountManagement;
