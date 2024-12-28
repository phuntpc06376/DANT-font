import React, { useEffect, useState } from 'react';
import { getAllAccounts, createAccount, deleteAccount, updateAccount } from '../api/accountApi';
import { getAllRoles } from '../api/roleApi';
import 'bootstrap/dist/css/bootstrap.min.css';
import Swal from 'sweetalert2';
import './AccountManagement.css';
import ReactPaginate from "react-paginate";

const AccountManagement = () => {
    const [activeTab, setActiveTab] = useState('seller'); // Mặc định là 'seller'
    const [allAccounts, setAllAccounts] = useState([]);
    const [filteredSellerAccounts, setFilteredSellerAccounts] = useState([]); // Lưu tài khoản seller
    const [filteredUserAccounts, setFilteredUserAccounts] = useState([]); // Lưu tài khoản user
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

    const [sellerPage, setSellerPage] = useState(0); // Trạng thái phân trang cho Seller
    const [userPage, setUserPage] = useState(0); // Trạng thái phân trang cho User
    const [accountsPerPage] = useState(5); // Số tài khoản trên mỗi trang

    useEffect(() => {
        fetchAccounts();
        fetchRoles();
    }, []);

    const fetchAccounts = async () => {
        try {
            const data = await getAllAccounts();
            setAllAccounts(data);

            // Lọc tài khoản seller và user khi lấy dữ liệu
            setFilteredSellerAccounts(data.filter(account => account.role?.id === 2));
            setFilteredUserAccounts(data.filter(account => account.role?.id === 3));
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

        // Lọc tài khoản khi tìm kiếm
        setFilteredSellerAccounts(allAccounts.filter(account =>
            account.fullname.toLowerCase().includes(value) ||
            account.email.toLowerCase().includes(value) ||
            account.phone.toLowerCase().includes(value) &&
            account.role?.id === 2
        ));

        setFilteredUserAccounts(allAccounts.filter(account =>
            account.fullname.toLowerCase().includes(value) ||
            account.email.toLowerCase().includes(value) ||
            account.phone.toLowerCase().includes(value) &&
            account.role?.id === 3
        ));
    };

    // Xử lý phân trang
    const handlePageChange = (selectedPage) => {
        if (activeTab === 'seller') {
            setSellerPage(selectedPage.selected); // Chuyển trang Seller
        } else {
            setUserPage(selectedPage.selected); // Chuyển trang User
        }
    };

    // Chọn tài khoản của trang hiện tại
    const indexOfLastSellerAccount = (sellerPage + 1) * accountsPerPage;
    const indexOfFirstSellerAccount = indexOfLastSellerAccount - accountsPerPage;
    const currentSellerAccounts = filteredSellerAccounts.slice(indexOfFirstSellerAccount, indexOfLastSellerAccount);

    const indexOfLastUserAccount = (userPage + 1) * accountsPerPage;
    const indexOfFirstUserAccount = indexOfLastUserAccount - accountsPerPage;
    const currentUserAccounts = filteredUserAccounts.slice(indexOfFirstUserAccount, indexOfLastUserAccount);

    return (
        <div className="account-management-container">
            <h2 className="text-center mb-4">Quản lý người dùng</h2>
            <ul className="nav nav-tabs account-management-tabs">
                <li className="nav-item">
                    <button
                        className={`nav-link ${activeTab === 'seller' ? 'active' : ''}`}
                        onClick={() => setActiveTab('seller')}
                    >
                        Danh sách tài khoản seller
                    </button>
                </li>
                <li className="nav-item">
                    <button
                        className={`nav-link ${activeTab === 'user' ? 'active' : ''}`}
                        onClick={() => setActiveTab('user')}
                    >
                        Danh sách tài khoản user
                    </button>
                </li>
            </ul>

            {/* Bảng tài khoản Seller */}
            {activeTab === 'seller' ? (
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
                            </tr>
                        </thead>
                        <tbody>
                            {currentSellerAccounts.map(account => (
                                <tr key={account.id}>
                                    <td>{account.username}</td>
                                    <td>{account.fullname}</td>
                                    <td>{account.email}</td>
                                    <td>{account.phone}</td>
                                    <td>{account.role?.name === 'seller' ? 'Người bán' : (account.role?.name === 'user' ? 'Người mua' : 'Chưa xác định')}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="account-pagination">
                        <ReactPaginate
                            previousLabel={"Trang trước"}
                            nextLabel={"Tiếp theo"}
                            breakLabel={"..."}
                            pageCount={Math.ceil(filteredSellerAccounts.length / accountsPerPage)}
                            onPageChange={handlePageChange}
                            containerClassName={"pagination justify-content-center"}
                            activeClassName={"active"}
                            previousClassName={"page-item"}
                            nextClassName={"page-item"}
                            pageClassName={"page-item"}
                            disabledClassName={"disabled"}
                            pageLinkClassName={"page-link"}
                            previousLinkClassName={"page-link"}
                            nextLinkClassName={"page-link"}
                        />
                    </div>
                </div>
            ) : null}

            {/* Bảng tài khoản User */}
            {activeTab === 'user' ? (
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
                            </tr>
                        </thead>
                        <tbody>
                            {currentUserAccounts.map(account => (
                                <tr key={account.id}>
                                    <td>{account.username}</td>
                                    <td>{account.fullname}</td>
                                    <td>{account.email}</td>
                                    <td>{account.phone}</td>
                                    <td>{account.role?.name === 'seller' ? 'Người bán' : (account.role?.name === 'user' ? 'Người mua' : 'Chưa xác định')}</td>

                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="account-pagination">
                        <ReactPaginate
                            previousLabel={"Trang trước"}
                            nextLabel={"Tiếp theo"}
                            breakLabel={"..."}
                            pageCount={Math.ceil(filteredUserAccounts.length / accountsPerPage)}
                            onPageChange={handlePageChange}
                            containerClassName={"pagination justify-content-center"}
                            activeClassName={"active"}
                            previousClassName={"page-item"}
                            nextClassName={"page-item"}
                            pageClassName={"page-item"}
                            disabledClassName={"disabled"}
                            pageLinkClassName={"page-link"}
                            previousLinkClassName={"page-link"}
                            nextLinkClassName={"page-link"}
                        />
                    </div>
                </div>
            ) : null}
        </div>
    );
};

export default AccountManagement;
